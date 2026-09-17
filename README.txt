FINANZAS — B2.3.3-R1 ESTABILIZACIÓN

OBJETIVO
Recuperar el módulo Deudas sin ejecutar SQL y sin borrar datos.

CAUSA CONFIRMADA
El index.html actual carga deudas-module.js y deudas-centro.js, pero no carga
finanzas-v233.js. Ese archivo V2.3.3 contiene la interfaz autocontenida de
Deudas + Cuentas + Liquidez, por lo que nunca llega a montarse.

CAMBIO
Reemplazar únicamente:
  deudas-centro.js

por el archivo incluido aquí.

El nuevo deudas-centro.js funciona como bootstrap y carga:
  finanzas-v233.css?v=233
  finanzas-v233.js?v=233

NO EJECUTAR NINGÚN SQL EN ESTA FASE.

VALIDACIÓN VISUAL
Después de publicar y recargar:
  1. Debe aparecer la pestaña Deudas.
  2. Debe aparecer la pestaña Cuentas.
  3. Debe aparecer Liquidez inicial en Resumen.
  4. Deudas debe mostrar Ver detalle, Editar y Eliminar.
  5. El detalle debe permitir reconstrucción del plan.
  6. No se debe crear ninguna deuda nueva automáticamente.

DATOS
No elimina movimientos, compromisos, deudas ni historial.
