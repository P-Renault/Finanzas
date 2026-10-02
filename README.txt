CCF CALENDAR MOBILE B4.3.18.1 — CORRECCIÓN B2.7

Objetivo:
Corregir la condición de sincronización que permitía que la vista visual
B232.26.4 quedara visible durante el primer ciclo de construcción del DOM.

Evidencia de diagnóstico:
- El botón circular ↻ de Premium delega en el botón original de B232.26.4.
- Ese botón ejecuta B232.26.4 -> load() -> render().
- Después de esa reconstrucción, la vista antigua desaparece.
- Por tanto, la corrección se realiza en la sincronización de presentación,
  no eliminando B232 ni modificando sus cálculos.

Cambio:
- Se añade enforcePresentationSoon().
- El puente de presentación se instala antes del primer render Premium.
- La ocultación de la fuente se fuerza inmediatamente y en microciclos
  posteriores (0/20/80 ms) para cubrir la reconstrucción inicial de B232.
- El botón de navegación/actualización vuelve a imponer el estado oculto
  después de delegar el click al motor B232.
- No se modifica Supabase, B232.26.4, cálculos ni la estructura Premium.

Validación local:
- node --check: OK

Archivo objetivo:
CCF-CALENDAR-MOBILE-B4.3.18.1.js

Rama objetivo:
Backup-2.7-adaptación-móvil

NOTA:
El repositorio GitHub no fue modificado automáticamente. La integración
GitHub disponible devolvió previamente HTTP 403 para escritura.
Este paquete es el archivo exacto listo para reemplazar el JS actual.
