CCF — ENTREGA HERO RESPONSIVE 2.9.7
Estándar visual: Somos Software
Fecha: 05-11-2026

OBJETIVO
Reconstrucción del hero del portal público de Control Financiero. Se sustituyó la composición anterior (imágenes con restos de texto/navegador y superposición inconsistente) por mockups CSS de laptop y smartphone usando capturas reales del sistema.

ARCHIVOS INCLUIDOS
1. index.html
   - Actualiza el parámetro de caché del portal B230 a v=2.9.7.
2. B230-PORTAL-ACCESO-FINAL-PREMIUM-1.1.js
   - Reconstruye la composición visual del hero.
   - Laptop y smartphone con marcos CSS independientes.
   - En móvil se oculta la laptop y el smartphone pasa a ser el elemento protagonista.
   - Ajusta navegación responsive con menú desplegable hasta 980 px.
   - Conserva los botones de registro/inicio de sesión y el flujo de autenticación existente.
   - No modifica los módulos financieros ni el cliente Supabase.
3. B230-PORTAL-ACCESO-FINAL-PREMIUM-1.1-assets/hero-screen-desktop.jpg
   - Captura real del panel financiero, preparada para pantalla de laptop.
4. B230-PORTAL-ACCESO-FINAL-PREMIUM-1.1-assets/hero-screen-mobile.jpg
   - Captura real del panel financiero móvil.
5. README-CCF-HERO-RESPONSIVE-2.9.7.txt
   - Esta documentación.

INSTALACIÓN
1. Respaldar el proyecto actualmente desplegado.
2. Extraer este ZIP en la raíz del proyecto, respetando las carpetas.
3. Sobrescribir index.html y B230-PORTAL-ACCESO-FINAL-PREMIUM-1.1.js.
4. Agregar los dos JPG nuevos en B230-PORTAL-ACCESO-FINAL-PREMIUM-1.1-assets/.
5. Desplegar y realizar recarga forzada (Ctrl+F5). En móviles, cerrar/reabrir el navegador o limpiar caché si conserva recursos antiguos.

ALCANCE / SEGURIDAD
- No reemplazar el proyecto completo.
- No se modifican los módulos internos, SQL, políticas RLS, tablas ni configuración Supabase.
- No se agregan credenciales ni secretos.
- El portal sigue usando el flujo de autenticación ya existente.

VALIDACIÓN
- JavaScript: comprobación de sintaxis con Node.js --check superada.
- Rutas de imágenes declaradas: verificadas dentro del paquete.
- ZIP: integridad comprobada.
- Se intentó prueba visual automatizada en Chromium, pero el entorno bloqueó la navegación local con ERR_BLOCKED_BY_ADMINISTRATOR. Por eso no se declara una prueba E2E visual completada.
