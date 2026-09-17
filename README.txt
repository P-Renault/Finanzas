FINANZAS B2.16 — DEPLOY
=======================

Objetivo
--------
Añadir Planificación financiera sin sobrecargar el arranque de Android.

Cambios
-------
1. index.html: cache/version 216.
2. finanzas-runtime-fix.js: carga progresiva y lazy-loading del módulo B2.16.
3. b216-planificacion-financiera.js: nueva pestaña Planificación.

La Planificación es SOLO LECTURA. No modifica Supabase.
Usa: cierres_financieros, cuentas_bancarias, ingresos_futuros,
gastos_planificados y cuotas_deuda.

No ejecutar SQL.
No borrar registros.
No reemplazar otros módulos.

URL esperada:
https://p-renault.github.io/Finanzas/

Después de subir los 3 archivos, abrir la URL y verificar:
Resumen → Planificación → escenario de 30 días.
Luego probar Deudas y Operaciones.
