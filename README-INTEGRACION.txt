CCF CALENDAR MOBILE B4.3.18.1
PAQUETE DE INTEGRACIÓN — 01/10/2026

ARQUITECTURA ELEGIDA
Se utiliza una capa aislada propia del módulo calendario:
- CCF-CALENDAR-MOBILE-B4.3.18.1.css
- CCF-CALENDAR-MOBILE-B4.3.18.1.js

No se modifica el motor financiero B232.26.4-calendario-safe.js.
No se modifica Supabase.
No se modifica CCF-MOBILE-B4.3.css/js.
El bloque CCF CALENDAR MOBILE B4.3.17 permanece inline en index.html,
sin alterar su contenido.

ORDEN VISUAL MÓVIL
1. B4.3.18.1 Premium — vista principal, equivalente a la referencia 1.
2. B232.26.4 — vista original/adaptada, visible debajo para validación,
   equivalente a la referencia 2.

B4.3.17 queda en DOM como fuente técnica para que B4.3.18.1 pueda leer
su shell sin eliminar ni modificar el motor existente, pero se oculta
visualmente para evitar una tercera representación duplicada.

INTEGRACIÓN
index.html carga, al final:
<link rel="stylesheet" href="CCF-CALENDAR-MOBILE-B4.3.18.1.css?v=B4.3.18.1">
<script src="CCF-CALENDAR-MOBILE-B4.3.18.1.js?v=B4.3.18.1"></script>

CONTROL DE REGRESIÓN
- Escritorio: la capa B4.3.18.1 queda oculta.
- Móvil: la capa Premium ocupa el primer lugar.
- El calendario B232.26.4 original queda visible.
- La vista Bootstrap paralela #ccf-bs-calendar-view se oculta para evitar
  una tercera vista, sin eliminar su DOM ni modificar su motor.
- La capa Premium no recalcula importes: clona la información generada
  por B4.3.17/B232.26.4.


B4.3.18.1 — POSICIÓN CORREGIDA
- La vista Premium se monta inmediatamente después de .b434-header (barra azul del menú móvil).
- Solo se muestra cuando data-active-module=calendario.
- No se monta en Resumen ni en otros módulos.
- El calendario B232.26.4 permanece como vista secundaria dentro del host del módulo.
- B4.3.17 se conserva como fuente técnica; no se duplica visualmente.
