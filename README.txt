FINANZAS B2.18 CORREGIDA
- Tabs Control jornadas, Ingresos, Operaciones y Planificación visibles desde HTML (no dependen de carga dinámica).
- Operaciones renderiza primero y consulta cada fuente de forma aislada con timeout; no debe congelar toda la app por una tabla faltante.
- Motor multifuente visible aun si falta ejecutar SQL; en ese caso mostrará el error de Supabase.
- Control jornadas es un puente financiero: importa el resultado neto a generacion_ingresos sin duplicar horas/km/viajes.
- Incluye finanzas-v233.js/css dentro del paquete para eliminar el 404 que existía en B2.17 integrada.
- Conserva deuda, navegación, pagos y planificación.
