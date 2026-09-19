APLICACIÓN DEL FIX

Aplicar CALENDARIO-FIX-B232.10.patch sobre la rama Punto-referencia.

Archivos afectados:
- b232-calendario-v2.js
- b219-arquitectura-navegacion.js

No requiere cambios de base de datos ni SQL.

Después de publicar:
1. Abrir la aplicación.
2. Recargar limpiando caché/PWA.
3. Pulsar Calendario.
4. Confirmar que se abre el módulo.
5. Cambiar mes, seleccionar día y volver a Resumen.
6. Confirmar que los datos del calendario siguen cargándose.

El fallo identificado es de navegación/event propagation, no de extracción de datos.
