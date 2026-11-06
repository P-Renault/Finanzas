CCF — REDISEÑO LANDING PREMIUM RESPONSIVE 1.3.0
================================================

Archivo modificado:
- B230-PORTAL-ACCESO-FINAL-PREMIUM-1.1.js

Implementación:
- Hero de escritorio en dos columnas con dashboard en laptop y smartphone superpuesto.
- Jerarquía tipográfica, navegación, CTA y paleta azul/cian alineadas con el diseño aprobado.
- Secciones de beneficios, módulos, perfiles de usuario, oferta, preguntas frecuentes y cierre comercial.
- Adaptación responsive para tablet y móvil con navegación desplegable y tarjetas reorganizadas.
- Estados de foco visibles y respeto por prefers-reduced-motion.

Integridad funcional:
- Se conserva el punto de entrada B230 ya referenciado desde index.html.
- Se conserva el flujo de apertura del gate de autenticación existente.
- No se modifican app.js, los módulos financieros, los archivos de Supabase, ni CCF-MOBILE-B4.3.js.
- No se cambian las rutas de APK ni las rutas de imágenes existentes.

Validación realizada:
- Sintaxis JavaScript comprobada con node --check.
- Referencias a imágenes y assets del portal verificadas dentro del paquete.
- Breakpoints responsive y navegación móvil comprobados estáticamente.

Nota:
La validación funcional en navegador y dispositivos reales debe realizarse después del despliegue.
