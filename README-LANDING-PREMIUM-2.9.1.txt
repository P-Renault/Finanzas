CCF — LANDING PREMIUM 2.9.1 (CORRECCIÓN REAL)

Este parche reconstruye el portal público sin modificar el sistema autenticado ni sus módulos.

Archivos incluidos (solo modificados/nuevos):
- index.html (actualiza referencia/versionado de caché del portal)
- B230-PORTAL-ACCESO-FINAL-PREMIUM-1.1.js (rediseño visual, navegación, estructura responsive y hero real)
- B230-PORTAL-ACCESO-FINAL-PREMIUM-1.1-assets/hero-dashboard-desktop.jpg (captura escritorio adjunta)
- B230-PORTAL-ACCESO-FINAL-PREMIUM-1.1-assets/hero-dashboard-mobile.jpg (captura móvil adjunta)

INSTALACIÓN:
1. Descomprimir conservando las rutas de carpetas.
2. Copiar/reemplazar index.html y B230-PORTAL-ACCESO-FINAL-PREMIUM-1.1.js en la raíz publicada.
3. Copiar las dos imágenes dentro de B230-PORTAL-ACCESO-FINAL-PREMIUM-1.1-assets/.
4. Commit y push al branch de despliegue.
5. En el navegador hacer Ctrl+F5 o probar en ventana privada. Si existe service worker/CDN cache, limpiar caché del sitio y esperar la invalidación.

El parche mantiene la lógica existente de autenticación, Supabase, módulos, datos y APK.
