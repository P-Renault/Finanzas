CCF B2.30.8 — REPARACIÓN DE CARGA

Se detectó que B2.30.7 dejó el #app oculto porque el índice no incluía el portal B230 que controla la apertura autenticada del sistema.

Corrección:
- Se conserva el index de limpieza visual B2.30.7.
- Se reincorpora B230-PORTAL-ACCESO.js.
- Se mantiene el footer Somos Software.
- No se modifica la lógica financiera.
- No se reintroducen cuadros de auditoría ni referencias de despliegue.

Archivos:
- index.html
- B230-PORTAL-ACCESO.js
- somos-software-logo.jpg

Despliegue: reemplazar los archivos correspondientes y recargar con caché limpia.
