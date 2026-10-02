# B4.3.18.1 — ocultación móvil del card nativo B232.26.4

## Objetivo
Mantener el constructor nativo `B232.26.4` y su `.b232261-card` en el DOM como fuente técnica de datos, pero impedir que esa representación de escritorio se muestre cuando está activa la shell móvil.

## Archivos para reemplazar
- `CCF-CALENDAR-MOBILE-B4.3.18.1.js`
- `CCF-CALENDAR-MOBILE-B4.3.18.1.css`

`index (1).html` no se modifica.

## Comportamiento
1. Detecta `#ccf-mobile-b43` + `#calendario`.
2. Marca `#calendario` con `ccf-calendar-mobile-mode`.
3. Oculta cada `.b232261-card` con estilos `!important`.
4. Reaplica la política después de mutaciones/renderizados para cubrir reconstrucciones del constructor B232.26.4.
5. No elimina `.b232261-card`, no elimina B232.26.4 y no cambia su constructor.
6. Premium 18.1 continúa usando la estructura nativa como fuente de datos.

## Validación
- JavaScript validado con `node --check`.
- No se modificó `index (1).html`.
