FINANZAS B2.21
Motor de Movimientos + Liquidez + separación de gastos/pagos de deuda.

Archivos:
- b221-movimientos-liquidez.js
- B2.21_MOVIMIENTOS_LIQUIDEZ.sql

Integración:
1. Ejecutar el SQL completo en Supabase.
2. Agregar antes de </body>:
<script src="b221-movimientos-liquidez.js?v=221"></script>
3. Recargar con caché limpia.

No elimina datos históricos.
Los movimientos futuros no afectan la liquidez actual.
Los pagos de deuda se identifican por pagos_deuda.movimiento_id y se excluyen de Gastos del mes.
