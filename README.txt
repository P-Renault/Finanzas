FINANZAS — DESPLIEGUE CORRECTIVO B2.3.2

ORDEN DE INSTALACIÓN

1) Supabase:
   Ejecuta finanzas-b23-correccion.sql.
   Debe devolver:
   cantidad_deudas_santiago = 1
   saldo_santiago = 234000
   saldo_inicial = 1824

2) GitHub:
   REEMPLAZAR:
   deudas-module.js
   por el archivo de este paquete.

   SUBIR:
   finanzas-b232.js
   finanzas-b232.css

3) index.html:
   Si todavía no carga B2.3.2, agregar después de app.js:
   <link rel="stylesheet" href="finanzas-b232.css?v=232">
   <script src="finanzas-b232.js?v=232"></script>

   Y asegurar que deudas-module.js se cargue después de app.js.

4) CAMBIO VISUAL:
   - Deudas mostrará botón ELIMINAR en cada deuda.
   - El Resumen tendrá el bloque CERO FINANCIERO / Liquidez inicial.
   - Santiago deberá aparecer una sola vez.
   - No se eliminan movimientos/compromisos históricos.

IMPORTANTE:
No ejecutar otra carga maestra después de esta corrección.
No registrar deuda de prueba.

La eliminación de los registros antiguos no etiquetados NO se hace automáticamente:
son datos históricos y primero deben clasificarse antes de decidir qué se conserva, archiva o transforma.
