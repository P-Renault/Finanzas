FINANZAS — B2.21 IMPLEMENTACIÓN
================================

Objetivo:
Activar el nuevo motor de Movimientos + Liquidez sin borrar el historial.

Archivos:
1) index_b221.html -> reemplazo del index.html actual.
2) b221-movimientos-liquidez.js -> motor que conecta Movimientos con liquidez.
3) b221-movimientos-liquidez.css -> estilos del bloque financiero.
4) B2.21_MOVIMIENTOS_LIQUIDEZ.sql -> estructura/RPC de Supabase.
5) preview_b221.png -> referencia visual.

IMPORTANTE:
- La escritura automática al repositorio P-Renault/Finanzas fue rechazada por GitHub con HTTP 403
  ("Resource not accessible by integration"). Por eso este paquete es el despliegue listo para cargar.
- El SQL NO elimina ni migra movimientos históricos.
- No registrar movimientos de prueba todavía: primero ejecutar SQL y cargar la interfaz.
- Un movimiento futuro no altera liquidez actual.
- Un movimiento real actual actualiza efectivo o cuenta bancaria.
- Los pagos de deuda quedan separados de gasto operativo mediante pagos_deuda.movimiento_id.

ORDEN RÁPIDO:
A. Supabase: ejecutar B2.21_MOVIMIENTOS_LIQUIDEZ.sql completo.
B. GitHub Pages: subir b221-movimientos-liquidez.js y b221-movimientos-liquidez.css.
C. Reemplazar index.html por index_b221.html.
D. Recargar con caché limpia.
E. Probar primero sin crear datos: abrir Movimientos y verificar que aparecen
   Medio, Cuenta y Naturaleza.
