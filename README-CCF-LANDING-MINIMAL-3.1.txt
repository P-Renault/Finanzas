CCF — LANDING MINIMALISTA RESPONSIVE 3.1.0
=============================================

Archivos incluidos (solo cambios de landing):
- index.html: actualiza la versión de caché del portal B230 a 3.1.0.
- B230-PORTAL-ACCESO-FINAL-PREMIUM-1.1.js: incorpora una nueva capa visual minimalista para escritorio, tablet y móvil.

Dirección visual:
- Fondo blanco y azul muy claro, tipografía azul marino y acento azul corporativo.
- Navegación limpia, hero de dos columnas en escritorio y composición vertical en móvil.
- Mockups de laptop y teléfono conservados como foco visual.
- Beneficios y módulos con tarjetas discretas, bordes suaves y menos decoración.
- CTA final reestructurado en una columna en móvil para evitar solapamientos.
- Footer ordenado en columnas adaptables.

Integridad funcional:
- Se conserva el HTML dinámico existente y el flujo de autenticación CCF.
- Se conservan las rutas de descarga APK y de imágenes.
- No se modifican app.js, motores financieros, Supabase, datos, módulos internos ni CCF-MOBILE-B4.3.js.
- La nueva capa CSS está encapsulada bajo #ccf-b230-final.

Validaciones realizadas:
- JavaScript: node --check sin errores.
- Se verificó la presencia de los recursos de imágenes requeridos en el ZIP base.
- Se verificó la integridad del ZIP de entrega.
- No se realizó despliegue ni prueba visual E2E en navegador real. Validar en staging antes de publicar.

Instalación:
1. Respaldar los dos archivos actuales.
2. Copiar index.html y B230-PORTAL-ACCESO-FINAL-PREMIUM-1.1.js a la raíz del sitio.
3. Mantener intacta la carpeta B230-PORTAL-ACCESO-FINAL-PREMIUM-1.1-assets/.
4. Publicar y recargar sin caché (Ctrl+F5). Probar 360 px, 390 px, 700 px, 1024 px y escritorio.
