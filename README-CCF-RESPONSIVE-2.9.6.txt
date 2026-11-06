CCF — ENTREGA DE DISEÑO RESPONSIVE 2.9.6
Estándar visual: Somos Software
Fecha: 2026-11-05

CONTENIDO DEL PAQUETE (solo archivos modificados y nuevos)
- index.html
  Actualiza la versión de caché del portal premium a 2.9.6.
- B230-PORTAL-ACCESO-FINAL-PREMIUM-1.1.js
  Reconstruye la composición del hero para coincidir con la referencia aprobada.
  Incorpora navegación móvil desplegable y reglas responsive refinadas.
  Mantiene el flujo de autenticación existente.
- B230-PORTAL-ACCESO-FINAL-PREMIUM-1.1-assets/hero-reference-devices.jpg
  Composición de laptop + smartphone para escritorio, extraída de la referencia aprobada.
- B230-PORTAL-ACCESO-FINAL-PREMIUM-1.1-assets/hero-reference-phone.jpg
  Composición de smartphone para el hero móvil.

INSTALACIÓN
1. Haz una copia de seguridad de los archivos actuales.
2. Extrae el ZIP en la raíz del proyecto, conservando la estructura de carpetas.
3. Sobrescribe los dos archivos modificados y agrega los dos recursos nuevos.
4. Despliega el sitio y realiza una recarga forzada (Ctrl+F5).

NO reemplazar el resto del proyecto.
No se modifican módulos financieros, tablas, políticas RLS ni configuración de Supabase.

VALIDACIONES REALIZADAS
- Sintaxis JavaScript con Node.js --check.
- Integridad del ZIP y existencia de recursos referenciados.
- Revisión estática de estructura HTML y reglas CSS.
- La validación visual en navegador automatizado quedó limitada por bloqueo del navegador de pruebas del entorno; por tanto, no se declara como prueba E2E completada.
