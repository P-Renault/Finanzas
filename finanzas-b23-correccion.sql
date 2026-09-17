-- ============================================================
-- FINANZAS B2.3.2 — LIMPIEZA CORRECTA DE LA CARGA MAESTRA
-- ============================================================
-- IMPORTANTE:
-- Esta query SOLO elimina los registros de Santiago que fueron
-- creados por nuestras cargas maestras de prueba.
--
-- NO elimina movimientos, compromisos, ahorro ni otros datos.
-- NO elimina la historia financiera.
--
-- Resultado esperado:
-- exactamente 1 deuda Santiago por $234.000.
-- ============================================================

begin;

-- Eliminar cualquier copia creada por la carga maestra.
-- Se usa una combinación específica para no tocar otras deudas.
delete from public.deudas
where acreedor = 'Santiago'
  and concepto = 'Deuda personal — saldo a reconstruir'
  and monto_original = 234000
  and saldo_actual = 234000
  and (
    notas = 'CARGA_MAESTRA_CERO_2026-09-17:SANTIAGO'
    or notas is null
    or notas like 'CARGA_MAESTRA_CERO_2026-09-17:SANTIAGO%'
  );

-- Crear UNA sola deuda maestra.
insert into public.deudas (
  acreedor,
  concepto,
  monto_original,
  saldo_actual,
  cuota,
  fecha_proximo_pago,
  estado,
  tipo_acreedor,
  tasa_anual,
  numero_cuotas,
  cuota_acordada,
  fecha_inicio,
  fecha_primera_cuota,
  frecuencia,
  notas
)
values (
  'Santiago',
  'Deuda personal — saldo a reconstruir',
  234000,
  234000,
  0,
  null,
  'vigente',
  'persona',
  null,
  null,
  null,
  '2026-09-17',
  null,
  'mensual',
  'CARGA_MAESTRA_CERO_2026-09-17:SANTIAGO'
);

-- Cero Financiero: saldo de apertura.
update public.cierres_financieros
set
  saldo_inicial = 1824,
  notas = 'CERO FINANCIERO 17/09/2026. Liquidez inicial: efectivo $50 + BancoEstado $1.500 + Santander $274. No incluye ingresos futuros.'
where estado = 'activo'
  and nombre = 'Reconstrucción financiera — Finanzas V2';

commit;

-- ============================================================
-- VALIDACIÓN
-- ============================================================

select
  count(*) as cantidad_deudas_santiago,
  coalesce(sum(saldo_actual),0) as saldo_santiago
from public.deudas
where acreedor = 'Santiago'
  and concepto = 'Deuda personal — saldo a reconstruir';

select
  nombre,
  fecha_corte,
  saldo_inicial,
  estado
from public.cierres_financieros
where estado = 'activo'
  and nombre = 'Reconstrucción financiera — Finanzas V2';

-- DEBE DAR:
-- cantidad_deudas_santiago = 1
-- saldo_santiago = 234000
-- saldo_inicial = 1824
