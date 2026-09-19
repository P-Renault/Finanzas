FINANZAS — CORRECCIÓN PERMANENTE CALENDARIO B232
Versión B232.13 / arquitectura de propietario único

Diagnóstico confirmado en Punto-referencia:
1) app.js contiene un calendario legacy completo y refresh() ejecuta renderCalendar().
2) b219-arquitectura-navegacion.js carga b232-calendario-v2.js con ?v=232.3.
3) b232-calendario-v2.js en la rama es 232.9 y todavía instala un listener CAPTURE
   con stopImmediatePropagation() sobre el botón Calendario.
4) Por eso existen dos propietarios del mismo #calendario. La captura mostrada
   coincide exactamente con el renderer legacy de app.js.

Corrección:
- app.js deja de renderizar el calendario legacy desde refresh().
- La navegación normal sigue siendo responsabilidad de app.js y, al entrar en
  Calendario, solicita B232.
- B232 deja de interceptar navegación; solo renderiza #calendario.
- B219 deja de cargar una versión cache-buster antigua y apunta a 232.13.
- Se eliminan los tres mecanismos de "hotfix runtime" anteriores como requisito:
  no son necesarios para la arquitectura final.

IMPORTANTE:
Este paquete NO está publicado en GitHub. La integración de escritura GitHub
está bloqueada en esta sesión. Debe aplicarse al branch Punto-referencia y luego
publicarse en GitHub Pages.

Orden recomendado:
A) Aplicar PATCH-1-app.js.diff
B) Aplicar PATCH-2-b232.diff
C) Aplicar PATCH-3-b219.diff
D) Commit/publicar
E) Limpiar caché/PWA del navegador
F) Abrir Calendario y verificar que aparece el encabezado "B232 · CALENDARIO
   FINANCIERO · 232.13", los KPIs, la grilla 42 días y el detalle del día.

No marcar como resuelto hasta verificación visual real.
