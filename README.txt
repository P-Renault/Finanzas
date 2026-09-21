B232.62 — SOLUCIÓN MÓDULOS REALES + ANTI-BUCLE

Problema corregido:
- B232.61 sí reemplazaba los placeholders y mostraba los módulos reales, pero su MutationObserver podía entrar en un ciclo de mutaciones porque nav() reorganiza botones del menú durante enforce(). Eso podía congelar el navegador.

Corrección:
- MutationObserver con guardia de ejecución y desconexión temporal durante enforce().
- El observer solo vuelve a ejecutar enforce() cuando detecta que falta un módulo/botón o reaparece un placeholder.
- Se mantiene la recuperación de Supabase mediante sf_url/sf_key.
- Se mantienen Motor Multifuente y Control de Jornada reales.
- Se mantiene window.b219Show(id), compatible con el contrato de navegación de app.js.
- No requiere modificar index.html ni la configuración de Supabase.
- Identificador visible obligatorio en footer:
  B232.62-RELEASE-MODULOS-REALES-FINAL-SIN-BUCLE

Instalación:
1. Reemplazar ÚNICAMENTE el contenido de B232.54-menu-principal.js por el archivo incluido.
2. Mantener el nombre B232.54-menu-principal.js para respetar el <script> existente.
3. Publicar en GitHub Pages.
4. Recargar la página con recarga completa / limpiar caché si fuera necesario.
5. Validar footer y navegación.

Validación esperada:
- Motor Multifuente abre la vista B2.19 real, con KPIs, formulario y últimas generaciones.
- Control de Jornada abre la vista B2.19 real, con integración financiera e historial.
- El sistema NO debe quedar congelado ni consumir CPU continuamente.
- El footer debe mostrar exactamente el identificador de esta entrega.
