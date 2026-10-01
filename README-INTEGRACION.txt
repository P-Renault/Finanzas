CCF CALENDAR MOBILE B4.3.18.1 · INTEGRACIÓN FINAL

OBJETIVO
Eliminar la presentación visual antigua del módulo Calendario y dejar B4.3.18.1 Premium como única vista móvil visible.

ARQUITECTURA
1. CCF-MOBILE-B4.3.js / CCF-MOBILE-B4.3.css: se conservan sin modificación.
2. B232.26.4-calendario-safe.js: se conserva sin modificación y continúa generando los datos/DOM fuente.
3. CCF-CALENDAR-MOBILE-B4.3.17-SOURCE.js: contiene el antiguo motor B4.3.17 externalizado desde index.html. Su host visual se oculta permanentemente; existe solo como fuente técnica para B4.3.18.1.
4. CCF-CALENDAR-MOBILE-B4.3.18.1.js: genera la vista Premium y copia la información necesaria desde las fuentes existentes.
5. CCF-CALENDAR-MOBILE-B4.3.18.1.css: estilos exclusivos de la vista Premium.
6. index.html: ya no contiene el bloque inline B4.3.17; solo carga el motor fuente aislado y la capa Premium.

RESULTADO MÓVIL
Barra azul CCF → B4.3.18.1 Premium → navegación inferior.

La vista B4.3.17 antigua, la tarjeta visual B232.26.4 y la vista Bootstrap paralela quedan ocultas. No se elimina el motor de datos porque B4.3.18.1 necesita leer los valores que ya genera el sistema; se elimina la presentación duplicada, no la fuente funcional.

VALIDACIÓN
- JS principal y motores aislados comprobados con Node.js --check.
- No se modificaron Supabase ni el motor financiero.
- No se modificaron CCF-MOBILE-B4.3.js ni CCF-MOBILE-B4.3.css.
