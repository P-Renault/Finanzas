-- B232.65 — INTEGRACIÓN TRANSACCIONAL DE LIQUIDEZ
-- Ejecutar UNA vez en Supabase SQL Editor, después de B2.21/B2.29.
-- Integra:
--   A) Control de Jornada cobrada -> generacion_ingresos + movimientos + liquidez.
--   B) Pago/abono de cuota -> pagos_deuda + movimientos + liquidez + saldo deuda/cuota.
-- Operaciones atómicas: si una validación falla, no queda una parte aplicada.
-- No modifica ni elimina históricos.

create or replace function public.integrar_jornada_liquidez_v1(
  p_fuente_id bigint,
  p_actividad text,
  p_descripcion text,
  p_fecha_generacion date,
  p_monto_neto numeric,
  p_costos numeric default 0,
  p_estado_cobro text default 'cobrado',
  p_fecha_cobro date default null,
  p_medio_pago text default 'efectivo',
  p_cuenta_id bigint default null,
  p_notas text default null
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_cierre public.cierres_financieros%rowtype;
  v_cuenta public.cuentas_bancarias%rowtype;
  v_gen_id bigint;
  v_mov_id bigint;
  v_bruto numeric;
  v_aplica boolean;
begin
  if p_fuente_id is null then raise exception 'Falta la fuente de ingreso.'; end if;
  if coalesce(trim(p_actividad),'')='' then raise exception 'La actividad es obligatoria.'; end if;
  if p_fecha_generacion is null then raise exception 'La fecha de generación es obligatoria.'; end if;
  if p_monto_neto is null or p_monto_neto < 0 then raise exception 'El neto no puede ser negativo.'; end if;
  if p_costos is null or p_costos < 0 then raise exception 'Los costos no pueden ser negativos.'; end if;
  if p_estado_cobro not in ('pendiente','cobrado','cancelado') then raise exception 'Estado de cobro inválido.'; end if;
  if p_medio_pago not in ('efectivo','cuenta_bancaria') then raise exception 'Medio de liquidez inválido.'; end if;
  if p_estado_cobro='cobrado' and p_monto_neto<=0 then raise exception 'Un resultado cobrado debe tener neto mayor que cero.'; end if;

  v_bruto := p_monto_neto + p_costos;
  v_aplica := p_estado_cobro='cobrado' and coalesce(p_fecha_cobro,p_fecha_generacion) <= current_date;

  if v_aplica and p_medio_pago='cuenta_bancaria' then
    if p_cuenta_id is null then raise exception 'Selecciona una cuenta bancaria.'; end if;
    select * into v_cuenta from public.cuentas_bancarias where id=p_cuenta_id and activa=true for update;
    if not found then raise exception 'La cuenta bancaria no existe o está inactiva.'; end if;
    update public.cuentas_bancarias set saldo_actual=coalesce(saldo_actual,0)+p_monto_neto where id=v_cuenta.id;
  elsif v_aplica then
    select * into v_cierre from public.cierres_financieros where activo=true order by fecha_corte desc limit 1 for update;
    if not found then raise exception 'No existe un cierre financiero activo.'; end if;
    update public.cierres_financieros set saldo_efectivo_actual=coalesce(saldo_efectivo_actual,0)+p_monto_neto where id=v_cierre.id;
  end if;

  if v_aplica then
    insert into public.movimientos(tipo,fecha,monto,categoria,descripcion,medio_pago,cuenta_id,naturaleza,liquidez_aplicada)
    values ('ingreso',coalesce(p_fecha_cobro,p_fecha_generacion),p_monto_neto,'Ingreso jornada',
            coalesce(p_descripcion,'Resultado Control de Jornada'),
            p_medio_pago,case when p_medio_pago='cuenta_bancaria' then p_cuenta_id else null end,
            'ingreso',true)
    returning id into v_mov_id;
  end if;

  insert into public.generacion_ingresos(
    fuente_id,actividad,descripcion,fecha_generacion,fecha_cobro,
    monto_bruto,costos,comisiones,estado_cobro,movimiento_id,notas
  )
  values(
    p_fuente_id,p_actividad,p_descripcion,p_fecha_generacion,
    case when p_estado_cobro='cobrado' then coalesce(p_fecha_cobro,p_fecha_generacion) else null end,
    v_bruto,p_costos,0,p_estado_cobro,v_mov_id,p_notas
  )
  returning id into v_gen_id;

  return jsonb_build_object(
    'generacion_id',v_gen_id,
    'movimiento_id',v_mov_id,
    'liquidez_aplicada',v_aplica,
    'monto_neto',p_monto_neto
  );
end;
$$;

grant execute on function public.integrar_jornada_liquidez_v1(
  bigint,text,text,date,numeric,numeric,text,date,text,bigint,text,text
) to anon, authenticated;


create or replace function public.registrar_pago_deuda_liquidez_v1(
  p_cuota_id bigint,
  p_monto numeric,
  p_fecha date,
  p_medio_pago text default 'efectivo',
  p_cuenta_id bigint default null
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_cuota public.cuotas_deuda%rowtype;
  v_deuda public.deudas%rowtype;
  v_cierre public.cierres_financieros%rowtype;
  v_cuenta public.cuentas_bancarias%rowtype;
  v_mov_id bigint;
  v_pagado numeric;
  v_restante_cuota numeric;
  v_nuevo_saldo numeric;
  v_estado text;
begin
  if p_cuota_id is null then raise exception 'Falta la cuota.'; end if;
  if p_monto is null or p_monto<=0 then raise exception 'El monto debe ser mayor que cero.'; end if;
  if p_fecha is null then raise exception 'La fecha de pago es obligatoria.'; end if;
  if p_fecha>current_date then raise exception 'Un pago futuro no puede descontar liquidez actual.'; end if;
  if p_medio_pago not in ('efectivo','cuenta_bancaria') then raise exception 'Medio de liquidez inválido.'; end if;

  select * into v_cuota from public.cuotas_deuda where id=p_cuota_id for update;
  if not found then raise exception 'La cuota no existe.'; end if;
  if v_cuota.estado in ('pagada','cancelada') then raise exception 'La cuota ya está cerrada.'; end if;

  select * into v_deuda from public.deudas where id=v_cuota.deuda_id for update;
  if not found then raise exception 'La deuda asociada no existe.'; end if;

  select coalesce(sum(monto),0) into v_pagado from public.pagos_deuda where cuota_id=p_cuota_id;
  v_restante_cuota := greatest(coalesce(v_cuota.monto,0)-v_pagado,0);
  if p_monto>v_restante_cuota then
    raise exception 'El abono excede el saldo de la cuota. Pendiente: %.', v_restante_cuota;
  end if;

  if p_medio_pago='cuenta_bancaria' then
    if p_cuenta_id is null then raise exception 'Selecciona una cuenta bancaria.'; end if;
    select * into v_cuenta from public.cuentas_bancarias where id=p_cuenta_id and activa=true for update;
    if not found then raise exception 'La cuenta bancaria no existe o está inactiva.'; end if;
    if coalesce(v_cuenta.saldo_actual,0)<p_monto then raise exception 'Saldo insuficiente en la cuenta bancaria.'; end if;
    update public.cuentas_bancarias set saldo_actual=coalesce(saldo_actual,0)-p_monto where id=v_cuenta.id;
  else
    select * into v_cierre from public.cierres_financieros where activo=true order by fecha_corte desc limit 1 for update;
    if not found then raise exception 'No existe un cierre financiero activo.'; end if;
    if coalesce(v_cierre.saldo_efectivo_actual,0)<p_monto then raise exception 'Efectivo insuficiente.'; end if;
    update public.cierres_financieros set saldo_efectivo_actual=coalesce(saldo_efectivo_actual,0)-p_monto where id=v_cierre.id;
  end if;

  insert into public.movimientos(tipo,fecha,monto,categoria,descripcion,medio_pago,cuenta_id,naturaleza,liquidez_aplicada)
  values('gasto',p_fecha,p_monto,'Deuda',
         'Pago/abono deuda · cuota '||v_cuota.numero_cuota,
         p_medio_pago,case when p_medio_pago='cuenta_bancaria' then p_cuenta_id else null end,
         'deuda',true)
  returning id into v_mov_id;

  insert into public.pagos_deuda(cuota_id,fecha_pago,monto,movimiento_id)
  values(p_cuota_id,p_fecha,p_monto,v_mov_id);

  v_nuevo_saldo:=greatest(coalesce(v_deuda.saldo_actual,0)-p_monto,0);
  update public.deudas set saldo_actual=v_nuevo_saldo where id=v_deuda.id;

  v_estado:=case when p_monto=v_restante_cuota then 'pagada' else v_cuota.estado end;
  update public.cuotas_deuda
  set estado=v_estado,
      fecha_pago=case when v_estado='pagada' then p_fecha else fecha_pago end
  where id=p_cuota_id;

  return jsonb_build_object(
    'cuota_id',p_cuota_id,
    'movimiento_id',v_mov_id,
    'pago_id',currval(pg_get_serial_sequence('public.pagos_deuda','id')),
    'monto',p_monto,
    'saldo_deuda',v_nuevo_saldo,
    'saldo_cuota',greatest(v_restante_cuota-p_monto,0),
    'estado_cuota',v_estado
  );
end;
$$;

grant execute on function public.registrar_pago_deuda_liquidez_v1(
  bigint,numeric,date,text,bigint
) to anon, authenticated;
