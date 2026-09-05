# Control Financiero V2

Incluye edición/borrado de movimientos, compromisos y ahorro.

Regla financiera principal:
- Fecha <= hoy: afecta saldo actual.
- Fecha > hoy: se considera futuro y NO afecta saldo actual.
- Ingresos/gastos futuros aparecen separados.
- Disponible proyectado = saldo actual + ingresos futuros - gastos futuros - pagos pendientes.

Actualización:
1. Reemplaza index.html, app.js, styles.css y manifest.json en GitHub.
2. NO borres ni recrees las tablas: no hace falta cambiar Supabase.
3. Espera la publicación de GitHub Pages y recarga la app.

La pensión del 16/09/2026 permanecerá registrada, pero ya no aumentará el saldo actual del 05/09/2026.
