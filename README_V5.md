# Control Financiero V4

V4 agrega un calendario mensual funcional sin cambiar las tablas existentes de Supabase.

## Cambios
- Calendario mensual DOM-LUN-MAR-MIE-JUE-VIE-SAB.
- Navegación de mes anterior/siguiente y botón Ir a hoy.
- Ingresos, gastos y pagos programados visibles por fecha.
- Saldo acumulado/proyectado al cierre de cada día.
- Los movimientos futuros se muestran en el calendario pero NO aumentan el saldo actual del Resumen hasta llegar su fecha.
- Próximos pagos se mantienen usando la tabla `compromisos` existente.
- Editar/Borrar se conserva en movimientos, compromisos y ahorro.
- Se agrega `?v=4` a CSS y JS para evitar caché de GitHub Pages.

## Instalación
Reemplazar en GitHub solamente:
- `index.html`
- `app.js`
- `styles.css`
- `manifest.json` (opcional, si se incluye)

No borrar ni recrear las tablas de Supabase.


# V5 — Plan sugerido de ingresos y ahorro
- En Resumen se agrega un plan sugerido para la próxima fecha de pago pendiente.
- Para no subestimar, agrupa todas las obligaciones pendientes de la fecha más próxima.
- Calcula el saldo disponible antes de esa fecha usando saldo actual, ingresos futuros, gastos futuros y otras obligaciones anteriores.
- Si existe un faltante, estima un ingreso bruto diario considerando una reserva sugerida del 10% para ahorro.
- El 10% es solo una sugerencia: la app NO crea automáticamente movimientos de ahorro ni descuenta dinero.
- El ahorro sugerido acumulado equivale al 10% de los ingresos ya registrados.
- La recomendación se recalcula cada vez que cambias o agregas datos.
