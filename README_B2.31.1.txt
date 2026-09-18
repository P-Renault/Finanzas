FINANZAS — B2.31.1 ESTABILIZACIÓN OPERATIVA

Base revisada:
P-Renault/Finanzas — main

OBJETIVO
Corregir el arranque del shell existente sin reconstruir la aplicación.

CAMBIOS
1. Se conserva el index.html completo y la navegación existente.
2. Se eliminan cargas duplicadas de módulos.
3. Se conserva b220.2-puente-ejecucion.js.
4. Los módulos que B2.19 carga dinámicamente no se vuelven a cargar directamente.
5. app.js conserva la conexión automática con las credenciales guardadas.
6. La interfaz ya no queda bloqueada en la pantalla de configuración solamente porque falle la consulta inicial de movimientos.
7. Si Supabase devuelve un error, la aplicación permanece visible y deja el diagnóstico en pantalla.
8. Se actualizan parámetros ?v= para reducir problemas de caché.

ARCHIVOS PARA REEMPLAZAR EN EL REPOSITORIO
- index.html
- app.js

NO reemplazar ni borrar los demás archivos del repositorio.

PUBLICACIÓN
1. Abrir el repositorio P-Renault/Finanzas.
2. Reemplazar index.html por el incluido aquí.
3. Reemplazar app.js por el incluido aquí.
4. Commit sugerido:
   B2.31.1 — Estabilización Operativa
5. Esperar GitHub Pages.
6. Abrir exclusivamente:
   https://p-renault.github.io/Finanzas/

NO usar:
   https://p-renault.github.io/Finanza/

VALIDACIÓN
- Debe aparecer "Control Financiero".
- Debe aparecer la navegación.
- Si las credenciales Supabase están guardadas, debe intentarse la conexión automática.
- No debe aparecer una pantalla blanca.
- No debe quedar bloqueada la interfaz por el probe inicial de movimientos.

ESTE PAQUETE NO MODIFICA LA BASE DE DATOS NI ELIMINA REGISTROS.
