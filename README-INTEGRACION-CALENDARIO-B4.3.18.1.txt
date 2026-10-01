CCF · INTEGRACIÓN CALENDARIO MÓVIL B4.3.18.1
================================================

DECISIÓN ARQUITECTÓNICA
------------------------
Se eligió integración mediante archivos independientes, no modificar CCF-MOBILE-B4.3.js ni CCF-MOBILE-B4.3.css.

Motivo:
- CCF-MOBILE-B4.3.js ya contiene una adaptación propia del calendario B232.26.4 y un host #ccf-bs-calendar-view.
- La nueva capa B4.3.18.1 se ejecuta después de CCF-MOBILE-B4.3.js, lee .b232261-card y no recalcula datos.
- Se suprime visualmente únicamente la vista Bootstrap intermedia #ccf-bs-calendar-view para evitar una tercera vista duplicada.
- El calendario propietario inferior queda intacto para conservar la referencia visual inferior solicitada.
- La navegación y selección delegan el evento al calendario propietario.
- Los dos bloques históricos B4.3.17 y B4.3.18.1 permanecen dentro de index.html como text/plain: sirven como respaldo/auditoría y no se ejecutan.

ARCHIVOS ACTIVOS
----------------
1. index.html
2. CCF-CALENDAR-MOBILE-B4.3.18.1.css
3. CCF-CALENDAR-MOBILE-B4.3.18.1.js
4. CCF-MOBILE-B4.3.css (sin cambios)
5. CCF-MOBILE-B4.3.js (sin cambios)

REFERENCIAS ACTIVAS EN INDEX
-----------------------------
<link rel="stylesheet" href="CCF-CALENDAR-MOBILE-B4.3.18.1.css?v=B4.3.18.1">
<script src="CCF-CALENDAR-MOBILE-B4.3.18.1.js?v=B4.3.18.1"></script>

VALIDACIONES REALIZADAS
-----------------------
- Sintaxis JavaScript B4.3.18.1: OK (node --check).
- index.html generado: 103.121 bytes (> 100 KB).
- Referencia CSS activa: 1.
- Referencia JS activa: 1.
- Bloques inline históricos convertidos a text/plain: no ejecutables.
- CCF-MOBILE-B4.3.js y CCF-MOBILE-B4.3.css no fueron modificados.

ORDEN DE CARGA
--------------
CCF-MOBILE-B4.3.css
  -> CCF-CALENDAR-MOBILE-B4.3.18.1.css

CCF-MOBILE-B4.3.js
  -> CCF-CALENDAR-MOBILE-B4.3.18.1.js

RESULTADO ESPERADO EN MÓVIL
----------------------------
Vista Premium B4.3.18.1 arriba.
Vista propietaria B232.26.4 abajo, conservada para comparación.
No se toca Supabase ni el motor financiero.

NOTA
----
El paquete está preparado para carga/despliegue. La validación entregada es estática/sintáctica; no se ejecutó un navegador móvil real dentro de este entorno.
