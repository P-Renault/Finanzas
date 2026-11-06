CCF · LANDING INSTITUCIONAL RESPONSIVE 2.9.9

Alcance de la entrega
- Rediseño integral del portal público CCF.
- Hero con composición de dispositivos y captura visual existente.
- Navegación sticky con menú móvil desplegable.
- Secciones de beneficios, módulos, perfiles de usuario, oferta, preguntas frecuentes, CTA y footer.
- Adaptación responsive para escritorio, tablet y móviles; composición y jerarquía reorganizadas para pantallas pequeñas.
- Galería ampliable de capturas reales y acordeones FAQ accesibles.
- Se conserva el flujo de autenticación existente (ccf-auth-gate) y la detección de sesión Supabase.

Archivos modificados
- index.html: actualización del parámetro de versión de la landing a 2.9.9.
- B230-PORTAL-ACCESO-FINAL-PREMIUM-1.1.js: reemplazo de la capa visual y sus interacciones.

Recursos
Se reutilizan los recursos ya presentes en B230-PORTAL-ACCESO-FINAL-PREMIUM-1.1-assets/. No es necesario copiar imágenes nuevas.

No se modifican
- app.js ni los motores financieros.
- configuración, esquema ni credenciales de Supabase.
- autenticación ni datos de usuarios.
- rutas y archivos de los módulos internos.

Validación realizada
- JavaScript validado con `node --check`.
- Verificación de integridad del ZIP de origen y presencia de recursos requeridos.
- No se declara prueba E2E visual en navegador; debe verificarse en staging antes de publicar.

Instalación
1. Respaldar index.html y B230-PORTAL-ACCESO-FINAL-PREMIUM-1.1.js actuales.
2. Copiar ambos archivos de esta entrega a la raíz del sitio, reemplazando los existentes.
3. Mantener la carpeta B230-PORTAL-ACCESO-FINAL-PREMIUM-1.1-assets/ sin cambiar su ruta.
4. Publicar y probar en escritorio, tablet y móvil. Realizar recarga forzada (Ctrl+F5) para evitar caché antigua.
