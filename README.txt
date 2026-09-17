FINANZAS B2.15 — RESTAURACIÓN CONTROLADA DEL CENTRO DE DEUDAS

B2.14 estabilizó la carga del Android, pero dejó fuera del arranque el módulo que dibuja el Centro de deudas en Resumen. B2.15 restaura ese bloque sin volver a cargar observers globales.

Se restaura en Resumen:
- Deuda original total
- Saldo pendiente total
- Cuotas pendientes
- Próximos 30 días
- Deuda destacada
- Ver detalle
- Ver lista de deudas
- Gestionar deudas

También se conserva la navegación al detalle y al listado Deudas mediante el módulo B2.3.5.

No hay cambios SQL ni cambios destructivos en Supabase.
NO se incorpora B2.3.6 porque usa MutationObserver sobre document.body y el objetivo es conservar la estabilidad lograda en Android.

Reemplazar/agregar en la raíz del repo:
- index.html
- finanzas-runtime-fix.js
- dashboard-deudas-v234.js
- centro-deudas-navegacion-b235.js

URL esperada: https://p-renault.github.io/Finanzas/
