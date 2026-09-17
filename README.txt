FINANZAS B2.17 INTEGRADA

OBJETIVO
Integra B2.16 Planificación + Centro de Deudas + pagos + Centro de Operaciones estable + Motor Multifuente de Ingresos.

ARCHIVOS A SUBIR
- index.html
- finanzas-runtime-fix.js
- b217-centro-operaciones.js
- b217-motor-ingresos.js
- b216-planificacion-financiera.js
- dashboard-deudas-v234.js
- centro-deudas-navegacion-b235.js
- b211-registro-pagos-mixtos.js

IMPORTANTE
No crear jornadas_financieras. Control de Jornada sigue siendo la fuente operacional de Uber/inDrive.

SQL
Ejecutar B217_INTEGRADA.sql en Supabase antes de usar el Motor Multifuente.

DESPLIEGUE
1. Reemplazar los archivos anteriores con los del paquete.
2. Ejecutar el SQL completo.
3. Publicar GitHub Pages.
4. Recargar con Ctrl+F5 o limpiar caché del navegador.

PRINCIPIOS
- Liquidez real separada de ingresos futuros.
- Generación de ingreso separada de movimiento/tesorería.
- No se duplican jornadas operacionales.
- No se elimina información histórica.
