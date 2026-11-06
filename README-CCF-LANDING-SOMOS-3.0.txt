CCF — LANDING SOMOS SOFTWARE 3.0
================================

PAQUETE DE ENTREGA
- index.html (modificado): actualiza el parámetro de caché del portal a 3.0.0.
- B230-PORTAL-ACCESO-FINAL-PREMIUM-1.1.js (modificado): nueva landing comercial responsive basada en la referencia gráfica aprobada.

IMPLEMENTACIÓN VISUAL
- Header corporativo CCF + Somos Software, navegación y acciones de APK / inicio de sesión.
- Hero con dashboard de escritorio y teléfono superpuesto.
- Franja de beneficios con cuatro indicadores.
- Seis tarjetas de módulos con iconografía.
- Sección clara de públicos objetivo: Emprendedores, PYMEs, Profesionales y Hogar.
- Beneficios clave, bloque de nube, CTA y footer corporativo multicolumna.
- Breakpoints para escritorio, tablet y móvil; menú móvil desplegable.

INSTALACIÓN
1. Copiar ambos archivos a la raíz del proyecto, respetando sus nombres.
2. Reemplazar los archivos existentes.
3. NO eliminar ni reemplazar la carpeta B230-PORTAL-ACCESO-FINAL-PREMIUM-1.1-assets.
   El portal sigue utilizando los recursos gráficos que ya existen en esa carpeta.
4. Publicar y recargar con Ctrl+F5.

INTEGRIDAD
- No se modifican app.js, Supabase, autenticación, tablas, módulos financieros ni CCF-MOBILE-B4.3.js.
- Los botones de crear cuenta e iniciar sesión siguen invocando el flujo de autenticación existente.
- El enlace de descarga APK conserva la URL de producción configurada en el proyecto.

VALIDACIÓN REALIZADA
- JavaScript validado con node --check.
- Se verificó que los recursos gráficos referenciados existen en el paquete base.
- No se realizó una prueba de autenticación contra Supabase ni una publicación en producción.
