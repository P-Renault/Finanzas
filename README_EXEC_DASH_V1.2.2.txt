# EXEC-DASH-V1.2.2 — DEBT DATA FIX

## Problema resuelto
Los gráficos "Deudas del mes en curso" y "Backlog de deudas" estaban
consumiendo `context.debtPlanning`, mientras el Centro de Deudas operativo
consulta `v_deudas_resumen`. Por eso el Centro de Deudas mostraba datos reales
pero los gráficos aparecían vacíos.

## Solución
`dashboard-deudas-v1.2.2-fix.js` consulta directamente:

- `v_deudas_resumen` para el backlog real.
- `cuotas_deuda` para las obligaciones exigibles del mes.

No inventa fechas.

## Criterios
- Cerradas/pagadas/canceladas no entran al backlog.
- Negociación se clasifica por estado textual.
- Pendiente de pago se clasifica por estados activos/pendientes/vencidos/atrasados.
- Sin fecha de inicio se determina exclusivamente por ausencia de fecha.
- El gráfico mensual usa cuotas del mes y deudas directas solo cuando no existe
  una cuota asociada, evitando duplicación.

## Identificación
Versión: EXEC-DASH-V1.2.2
Código de creación: EXEC-DASH-V1.2.2-DEBT-DATA-DIRECT
