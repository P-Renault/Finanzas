# CCF Mobile B4.3.6 — Bootstrap Grid Calendario

Intervención puntual para móvil.

- Solo `#calendario`.
- Solo la grilla del período mensual (`.b232261-week` + `.b232261-grid`).
- Solo `max-width:720px`.
- Usa `bootstrap-grid.min.css` 5.3.8 desde jsDelivr.
- No usa JavaScript de Bootstrap.
- No modifica `B232.26.4-calendario-safe.js`.
- No modifica Supabase, autenticación, navegación ni otros módulos.
- Desktop queda fuera de la intervención.

## Instalación
Reemplazar únicamente los dos archivos B4.3 conservando sus nombres exactos.

## CDN
`https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap-grid.min.css`

La dependencia se inyecta desde `CCF-MOBILE-B4.3.js` y queda limitada mediante `media` a pantallas de hasta 720px.
