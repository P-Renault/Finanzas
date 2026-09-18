-- FINANZAS B2.22 — VISTA DE CUANTIFICACIÓN
-- Solo crea una vista de lectura. No elimina ni modifica registros.

create or replace view public.v_finanzas_cuantificacion as
select
  current_date as fecha_consulta,
  coalesce((
    select c.saldo_efectivo_actual
    from public.cierres_financieros c
    where c.activo = true
    order by c.fecha_corte desc
    limit 1
  ),0) as efectivo_actual,
  coalesce((
    select sum(cb.saldo_actual)
    from public.cuentas_bancarias cb
    where cb.activa = true
  ),0) as bancos_actuales,
  coalesce((
    select sum(m.monto)
    from public.movimientos m
    where m.tipo='ingreso'
      and m.fecha <= current_date
      and date_trunc('month',m.fecha)=date_trunc('month',current_date)
  ),0) as ingresos_mes,
  coalesce((
    select sum(m.monto)
    from public.movimientos m
    where m.tipo='gasto'
      and m.fecha <= current_date
      and date_trunc('month',m.fecha)=date_trunc('month',current_date)
      and not exists (
        select 1 from public.pagos_deuda pd
        where pd.movimiento_id=m.id
      )
  ),0) as gastos_operativos_mes,
  coalesce((
    select sum(m.monto)
    from public.movimientos m
    where m.tipo='gasto'
      and m.fecha <= current_date
      and date_trunc('month',m.fecha)=date_trunc('month',current_date)
      and exists (
        select 1 from public.pagos_deuda pd
        where pd.movimiento_id=m.id
      )
  ),0) as pagos_deuda_mes;
