B232.60 — RELEASE FINAL — INTEGRACIÓN REAL CON B232.23

CAUSA CORREGIDA
app.js captura los clics de .tabs en fase capture, ejecuta navigateTab() y, para ingresos/jornadas, llama window.b219Show(id). Las versiones anteriores no exponían correctamente ese contrato, por lo que se mantenía el placeholder.

SOLUCIÓN
Esta versión define explícitamente window.b219Show(id), reemplaza los placeholders por las vistas reales, cablea formularios, carga Supabase y conserva la navegación existente.

INSTALACIÓN
Reemplazar ÚNICAMENTE B232.54-menu-principal.js.
No agregar otro script. No modificar index.html ni Supabase.

VALIDACIÓN
- Motor Multifuente debe abrir Generación de ingresos.
- Control de Jornada debe abrir su vista funcional.
- Debe aparecer: Paquete desplegado: B232.60-RELEASE-MODULOS-REALES
- No debe aparecer el texto de placeholder.
