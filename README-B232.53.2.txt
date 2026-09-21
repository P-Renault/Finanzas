B232.53.2 — HOTFIX AISLAMIENTO CALENDARIO

Aplicar sobre la instalación actual de Finanzas.

Archivos incluidos:
1. index.html — referencia el calendario seguro B232.26.3.
2. B232.26.3-calendario-safe.js — elimina el display:block!important global del host de Calendario y elimina la restauración forzada de todas las pestañas.

No cambia SQL, Supabase, datos, módulos de Deudas, Cuentas, Operaciones, Planificación, Presupuesto ni Resumen.

Validación estática: todos los JS del despliegue B232.53.2 pasan node --check.
