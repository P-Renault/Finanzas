# Control Financiero V3

Nueva versión de la PWA sobre la V2. Mantiene la base de datos existente de Supabase y agrega una vista de calendario mensual.

## Cambios principales
- Se mantiene la lista de **Próximos pagos** y la sección completa de **Pagos futuros**.
- Nueva pestaña **Calendario** con navegación por mes.
- Cada día puede mostrar ingresos registrados, gastos registrados y pagos programados pendientes.
- Cada día del mes muestra el **saldo acumulado/proyectado** al cierre de ese día.
- El encabezado del calendario muestra totales del mes: ingresos, gastos, pagos programados y saldo al cierre.
- Se mantiene la regla de V2: una fecha posterior a hoy no afecta el saldo actual del dashboard.
- Se conserva la edición y eliminación de movimientos, compromisos y ahorro.
- Se corrigió la forma de pasar registros a los botones Editar para evitar problemas con comillas en descripciones o categorías.

## Importante
No borres ni recrees las tablas de Supabase. Esta versión usa las mismas tablas:
- movimientos
- compromisos
- ahorro

## Cómo actualizar desde Android
1. Descarga el ZIP.
2. Descomprime el contenido.
3. En el repositorio GitHub `Finanzas`, reemplaza `index.html`, `app.js`, `styles.css` y `manifest.json`.
4. No cambies Supabase.
5. Espera unos minutos a que GitHub Pages publique los cambios.
6. Abre la app y recarga la página.

La URL de GitHub Pages y los datos de Supabase no cambian.
