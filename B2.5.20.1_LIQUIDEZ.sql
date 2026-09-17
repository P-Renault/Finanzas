create or replace function public.registrar_ingreso_liquidez_v1(
  p_destino text,
  p_cuenta_id bigint,
  p_monto numeric,
  p_fecha date,
  p_concepto text,
  p_notas text default null
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_cierre public.cierres_financieros%rowtype;
  v_cuenta public.cuentas_bancarias%rowtype;
  v_mov_id bigint;
  v_nuevo numeric;
begin
  if p_monto is null or p_monto <= 0 then raise exception 'El monto debe ser mayor que cero.'; end if;
  if p_destino not in ('efectivo','cuenta_bancaria') then raise exception 'Destino inválido.'; end if;
  if coalesce(trim(p_concepto),'') = '' then raise exception 'El concepto es obligatorio.'; end if;

  select * into v_cierre from public.cierres_financieros
  where activo = true order by fecha_corte desc limit 1 for update;
  if not found then raise exception 'No existe un cierre financiero activo.'; end if;

  if p_destino = 'cuenta_bancaria' then
    if p_cuenta_id is null then raise exception 'Debes seleccionar una cuenta bancaria.'; end if;
    select * into v_cuenta from public.cuentas_bancarias
    where id = p_cuenta_id and activa = true for update;
    if not found then raise exception 'La cuenta bancaria no existe o está inactiva.'; end if;
    v_nuevo := coalesce(v_cuenta.saldo_actual,0) + p_monto;
    update public.cuentas_bancarias set saldo_actual = v_nuevo where id = v_cuenta.id;
  else
    v_nuevo := coalesce(v_cierre.saldo_efectivo_actual,0) + p_monto;
    update public.cierres_financieros set saldo_efectivo_actual = v_nuevo where id = v_cierre.id;
  end if;

  insert into public.movimientos(tipo, fecha, monto, categoria, descripcion)
  values ('ingreso', p_fecha, p_monto, 'Ingreso de fondos', p_concepto || case when p_notas is not null then ' · ' || p_notas else '' end)
  returning id into v_mov_id;

  return jsonb_build_object('movimiento_id',v_mov_id,'destino',p_destino,'monto',p_monto,'nuevo_saldo',v_nuevo);
end;
$$;

grant execute on function public.registrar_ingreso_liquidez_v1(text,bigint,numeric,date,text,text) to anon, authenticated;
