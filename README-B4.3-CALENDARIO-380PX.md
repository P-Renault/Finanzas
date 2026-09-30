# CCF MOBILE B4.3 — Calendario móvil 380px

## Configuración

- **Referencia de diseño móvil:** 380 px de ancho útil.
- **Escritorio:** se mantiene la estructura original del motor `B232.26.4-calendario-safe.js`, incluido su `min-width:770px`.
- **Móvil:** no se establece `min-width:380px`. El calendario ocupa `100%` del ancho disponible y distribuye las 7 columnas mediante `repeat(7,minmax(0,1fr))`.
- Esto permite el mismo comportamiento en dispositivos de 360, 375, 380 y 390 px sin introducir scroll horizontal.

## Archivos

- `CCF-MOBILE-B4.3.js`
- `CCF-MOBILE-B4.3.css`

## Alcance

La reconstrucción se limita a la capa móvil del calendario. No modifica `index.html`, `app.js`, Supabase, Auth, SQL/RLS ni `B232.26.4-calendario-safe.js`.

El adaptador JS aplica las restricciones después de que el módulo original renderiza su DOM y utiliza un `MutationObserver` acotado al módulo para reaplicarlas cuando el calendario cambia de mes o se vuelve a renderizar.
