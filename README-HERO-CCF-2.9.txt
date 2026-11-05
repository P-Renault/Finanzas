CCF — ACTUALIZACIÓN DEL HERO (Finanzas Backup 2.9)

Archivos incluidos:
1. B230-PORTAL-ACCESO-FINAL-PREMIUM-1.1.js (MODIFICADO)
2. B230-PORTAL-ACCESO-FINAL-PREMIUM-1.1-assets/hero-dashboard-desktop.jpg (NUEVO)
3. B230-PORTAL-ACCESO-FINAL-PREMIUM-1.1-assets/hero-dashboard-mobile.jpg (NUEVO)
4. index.html (MODIFICADO: versión de caché del script del portal)

Instalación:
- Reemplazar el JS existente en la raíz del proyecto.
- Copiar las dos imágenes nuevas dentro de la carpeta de assets indicada.
- index.html ya carga B230-PORTAL-ACCESO-FINAL-PREMIUM-1.1.js; no requiere cambios.

Comportamiento:
- Escritorio: muestra hero-dashboard-desktop.jpg.
- Pantallas de hasta 640 px: muestra hero-dashboard-mobile.jpg mediante <picture>/<source>.
- Las capturas se recortaron para retirar las barras del navegador y del sistema operativo.
- No se modifican autenticación, Supabase, módulos, datos ni lógica financiera.
