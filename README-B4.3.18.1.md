# CCF B4.3.18.1 — Corrección de integración inline

Entrega incremental. No crea rama ni punto de restauración.

- `index.html`: conserva el código estructural completo Premium 18.1 inline.
- El bloque está encerrado explícitamente entre `<script ...>` y `</script>`.
- El bloque Premium 18.1 es el último `<script>` del documento y queda inmediatamente antes de `</body>`.
- `CCF-MOBILE-B4.3.js` y `CCF-MOBILE-B4.3.css` permanecen independientes.
- No se modifica `B232.26.4-calendario-safe.js`.
- No se convierte 18.1 en módulo ni en archivo externo.
