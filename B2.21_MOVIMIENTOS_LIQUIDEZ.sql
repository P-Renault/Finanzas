-- FINANZAS B2.21
-- Motor de movimientos + liquidez + separación gasto/pago de deuda.
-- No elimina ni migra movimientos históricos.
-- Los movimientos futuros no afectan la liquidez actual.

alter table public.movimientos
  add column if not exists medio_pago text
    check (medio_pago is null or medio_pago in ('efectivo','cuenta_bancaria'));

alter table public.movimientos
  add column if not exists cuenta_id bigint references public.cuentas_bancarias(id);

alter table public.movimientos
  add column if not exists naturaleza text
    check (naturaleza is null or naturaleza in ('ingreso','gasto','deuda'));

alter table public.movimientos
  add column if not exists liquidez_aplicada boolean not null default false;

create index if not exists movimientos_liquidez_idx
  on public.movimientos(liquidez_aplicada);

create index if not exists movimientos_cuenta_idx
  on public.movimientos(cuenta_id);

create or replace function public.registrar_movimiento_liquidez_v1(
  p_tipo text,
  p_fecha date,
  p_monto numeric,
  p_categoria text default null,
  p_descripcion text default null,
  p_medio_pago text default 'efectivo',
  p_cuenta_id bigint default null,
  p_naturaleza text default null
) returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_cierre public.cierres_financieros%rowtype;
  v_cuenta public.cuentas_bancarias%rowtype;
  v_mov_id bigint;
  v_naturaleza text;
begin
  if p_tipo not in ('ingreso','gasto') then
    raise exception 'Tipo de movimiento inválido.';
  end if;

  if p_monto is null or p_monto <= 0 then
    raise exception 'El monto debe ser mayor que cero.';
  end if;

  if p_medio_pago not in ('efectivo','cuenta_bancaria') then
    raise exception 'Medio financiero inválido.';
  end if;

  if p_medio_pago = 'cuenta_bancaria' and p_cuenta_id is null then
    raise exception 'Debes seleccionar una cuenta bancaria.';
  end if;

  if p_naturaleza is null then
    v_naturaleza := p_tipo;
  else
    v_naturaleza := p_naturaleza;
  end if;

  if v_naturaleza not in ('ingreso','gasto','deuda') then
    raise exception 'Naturaleza financiera inválida.';
  end if;

  if p_fecha <= current_date then
    if p_medio_pago = 'cuenta_bancaria' then
      select *
      into v_cuenta
      from public.cuentas_bancarias
      where id = p_cuenta_id
        and activa = true
      for update;

      if not found then
        raise exception 'La cuenta bancaria no existe o está inactiva.';
      end if;

      if p_tipo = 'gasto' and coalesce(v_cuenta.saldo_actual,0) < p_monto then
        raise exception 'Saldo insuficiente en la cuenta bancaria.';
      end if;

      update public.cuentas_bancarias
      set saldo_actual = coalesce(saldo_actual,0)
        + case when p_tipo='ingreso' then p_monto else -p_monto end
      where id = p_cuenta_id;
    else
      select *
      into v_cierre
      from public.cierres_financieros
      where activo = true
      order by fecha_corte desc
      limit 1
      for update;

      if not found then
        raise exception 'No existe un cierre financiero activo.';
      end if;

      if p_tipo = 'gasto'
         and coalesce(v_cierre.saldo_efectivo_actual,0) < p_monto then
        raise exception 'Efectivo insuficiente.';
      end if;

      update public.cierres_financieros
      set saldo_efectivo_actual = coalesce(saldo_efectivo_actual,0)
        + case when p_tipo='ingreso' then p_monto else -p_monto end
      where id = v_cierre.id;
    end if;
  end if;

  insert into public.movimientos(
    tipo, fecha, monto, categoria, descripcion,
    medio_pago, cuenta_id, naturaleza, liquidez_aplicada
  )
  values (
    p_tipo, p_fecha, p_monto, p_categoria, p_descripcion,
    p_medio_pago,
    case when p_medio_pago='cuenta_bancaria' then p_cuenta_id else null end,
    v_naturaleza,
    p_fecha <= current_date
  )
  returning id into v_mov_id;

  return jsonb_build_object(
    'movimiento_id', v_mov_id,
    'liquidez_aplicada', p_fecha <= current_date
  );
end;
$$;

create or replace function public.actualizar_movimiento_liquidez_v1(
  p_movimiento_id bigint,
  p_tipo text,
  p_fecha date,
  p_monto numeric,
  p_categoria text default null,
  p_descripcion text default null,
  p_medio_pago text default 'efectivo',
  p_cuenta_id bigint default null,
  p_naturaleza text default null
) returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_old public.movimientos%rowtype;
  v_cierre public.cierres_financieros%rowtype;
  v_cuenta public.cuentas_bancarias%rowtype;
  v_naturaleza text;
begin
  select * into v_old
  from public.movimientos
  where id = p_movimiento_id
  for update;

  if not found then raise exception 'Movimiento no encontrado.'; end if;
  if p_monto is null or p_monto <= 0 then raise exception 'El monto debe ser mayor que cero.'; end if;
  if p_tipo not in ('ingreso','gasto') then raise exception 'Tipo inválido.'; end if;
  if p_medio_pago not in ('efectivo','cuenta_bancaria') then raise exception 'Medio inválido.'; end if;
  if p_medio_pago='cuenta_bancaria' and p_cuenta_id is null then raise exception 'Selecciona una cuenta bancaria.'; end if;

  v_naturaleza := coalesce(p_naturaleza,p_tipo);

  -- Revertir únicamente el efecto de liquidez que realmente tuvo el registro anterior.
  if coalesce(v_old.liquidez_aplicada,false) then
    if v_old.medio_pago='cuenta_bancaria' and v_old.cuenta_id is not null then
      select * into v_cuenta from public.cuentas_bancarias
      where id=v_old.cuenta_id for update;
      if not found then raise exception 'No existe la cuenta bancaria anterior.'; end if;
      update public.cuentas_bancarias
      set saldo_actual = coalesce(saldo_actual,0)
        + case when v_old.tipo='ingreso' then -v_old.monto else v_old.monto end
      where id=v_old.cuenta_id;
    else
      select * into v_cierre from public.cierres_financieros
      where activo=true order by fecha_corte desc limit 1 for update;
      if not found then raise exception 'No existe cierre financiero activo.'; end if;
      update public.cierres_financieros
      set saldo_efectivo_actual = coalesce(saldo_efectivo_actual,0)
        + case when v_old.tipo='ingreso' then -v_old.monto else v_old.monto end
      where id=v_cierre.id;
    end if;
  end if;

  -- Aplicar el nuevo efecto si la nueva fecha ya es real.
  if p_fecha <= current_date then
    if p_medio_pago='cuenta_bancaria' then
      select * into v_cuenta from public.cuentas_bancarias
      where id=p_cuenta_id and activa=true for update;
      if not found then raise exception 'La cuenta bancaria no existe o está inactiva.'; end if;
      if p_tipo='gasto' and coalesce(v_cuenta.saldo_actual,0)<p_monto then
        raise exception 'Saldo insuficiente en la cuenta bancaria.';
      end if;
      update public.cuentas_bancarias
      set saldo_actual=coalesce(saldo_actual,0)+case when p_tipo='ingreso' then p_monto else -p_monto end
      where id=p_cuenta_id;
    else
      select * into v_cierre from public.cierres_financieros
      where activo=true order by fecha_corte desc limit 1 for update;
      if not found then raise exception 'No existe cierre financiero activo.'; end if;
      if p_tipo='gasto' and coalesce(v_cierre.saldo_efectivo_actual,0)<p_monto then
        raise exception 'Efectivo insuficiente.';
      end if;
      update public.cierres_financieros
      set saldo_efectivo_actual=coalesce(saldo_efectivo_actual,0)+case when p_tipo='ingreso' then p_monto else -p_monto end
      where id=v_cierre.id;
    end if;
  end if;

  update public.movimientos
  set tipo=p_tipo,
      fecha=p_fecha,
      monto=p_monto,
      categoria=p_categoria,
      descripcion=p_descripcion,
      medio_pago=p_medio_pago,
      cuenta_id=case when p_medio_pago='cuenta_bancaria' then p_cuenta_id else null end,
      naturaleza=v_naturaleza,
      liquidez_aplicada=(p_fecha <= current_date)
  where id=p_movimiento_id;

  return jsonb_build_object('movimiento_id',p_movimiento_id,'liquidez_aplicada',p_fecha<=current_date);
end;
$$;

grant execute on function public.registrar_movimiento_liquidez_v1(
  text,date,numeric,text,text,text,bigint,text
) to anon, authenticated;

grant execute on function public.actualizar_movimiento_liquidez_v1(
  bigint,text,date,numeric,text,text,text,bigint,text
) to anon, authenticated;