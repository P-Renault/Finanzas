CCF CALENDAR MOBILE B4.3.18.1 — INTEGRACIÓN FINAL
=================================================

OBJETIVO
--------
La vista móvil Premium B4.3.18.1 pasa a ser la ÚNICA representación
visual del módulo Calendario.

ORDEN VISUAL MÓVIL
------------------
1. Barra azul .b434-header de la shell móvil.
2. CCF-CALENDAR-MOBILE-B4.3.18.1 Premium.
3. Navegación inferior móvil.

CAMBIO RESPECTO A LA PRUEBA ANTERIOR
-------------------------------------
- Se elimina visualmente la vista anterior B232.26.4.
- Se elimina visualmente la vista intermedia B4.3.17.
- Se oculta también cualquier host Bootstrap anterior.
- B4.3.17 y B232.26.4 NO se eliminan del DOM: permanecen como fuentes
  técnicas para que Premium 18.1 pueda leer los datos ya generados.
- No se recalculan importes.
- No se modifica Supabase.
- No se modifica CCF-MOBILE-B4.3.js.
- No se modifica CCF-MOBILE-B4.3.css.
- No se modifica B232.26.4-calendario-safe.js.

ARCHIVOS
--------
index.html
CCF-CALENDAR-MOBILE-B4.3.18.1.js
CCF-CALENDAR-MOBILE-B4.3.18.1.css
CCF-MOBILE-B4.3.js
CCF-MOBILE-B4.3.css

FUENTE / PRESENTACIÓN
---------------------
B4.3.17 -> fuente DOM técnica
B232.26.4 -> fuente DOM financiera existente
B4.3.18.1 -> única presentación visual

POSICIÓN
--------
Premium se inserta inmediatamente después de .b434-header cuando el
módulo activo es 'calendario'. Al salir del módulo, Premium se oculta.
Al regresar, vuelve a colocarse inmediatamente después del header.
