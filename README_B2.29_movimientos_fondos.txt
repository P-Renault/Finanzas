# B2.29 — Movimiento de fondos

Nueva capacidad de la pestaña Movimientos:

- Efectivo -> cuenta bancaria
- Cuenta bancaria -> efectivo
- Cuenta bancaria -> cuenta bancaria

Los traslados NO son ingresos ni gastos.
No alteran el resultado mensual.
Solo cambian la ubicación de la liquidez.

## Instalación

1. Ejecutar el SQL completo `B2.29_movimientos_fondos.sql` en Supabase.
2. Cargar `b229-movimientos-fondos.js` en la aplicación.
3. Añadir:
<script src="b229-movimientos-fondos.js?v=229.0"></script>
4. Probar con un monto pequeño.
5. Verificar efectivo y cuenta antes/después.
6. Verificar que ingresos/gastos del mes no cambien.

La operación se realiza mediante una función PostgreSQL transaccional.
No se utilizan dos movimientos artificiales de ingreso/gasto.
