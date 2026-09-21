B232.56 — RELEASE FINAL: MENÚ + MÓDULOS INTEGRADOS
===================================================

OBJETIVO
--------
Entrega definitiva para el estado actual de p-renault.github.io/Finanza.
Corrige la navegación observada en la validación móvil:

1. Elimina completamente "Más".
2. Expone directamente Motor Multifuente y Control de Jornada.
3. Elimina los placeholders de B232.51.3.
4. Monta las vistas funcionales de ambos módulos usando la integración
   financiera existente (fuentes_ingreso / generacion_ingresos).
5. Mantiene Supabase y el resto de la aplicación sin reconstruir el sistema.
6. Muestra en el pie: Paquete desplegado: B232.56-RELEASE-MENU-MODULOS

ARQUITECTURA
------------
Es un RELEASE FINAL de sustitución, no una cadena de hotfixes.

El archivo se llama exactamente:
    B232.54-menu-principal.js

Esto es intencional: el index.html actualmente cargado por el sitio ya
referencia ese nombre. La integración se realiza reemplazando ese archivo
por esta versión, sin agregar otro script ni modificar el index.html.

NO SE DEBE:
- agregar otro archivo de navegación;
- agregar otro loader;
- ejecutar B219 nuevamente;
- modificar Supabase;
- cambiar tablas o datos;
- conservar una segunda versión de B232.54.

VALIDACIÓN ESTÁTICA
-------------------
- JavaScript validado con: node --check
- SHA-256 del archivo:
  0f0fb56c4e7068d63c1d0eda5974bbf08c91c9646f2ee1577560a3cb3ace26a5

CRITERIOS DE ACEPTACIÓN EN PRODUCCIÓN
-------------------------------------
[ ] No existe ningún botón "Más".
[ ] Motor Multifuente aparece como botón directo.
[ ] Control de Jornada aparece como botón directo.
[ ] Motor Multifuente abre la vista funcional con KPIs, formulario e historial.
[ ] Control de Jornada abre la vista funcional con integración financiera.
[ ] No aparece el texto de placeholder de B232.51.3.
[ ] El pie muestra exactamente:
    Paquete desplegado: B232.56-RELEASE-MENU-MODULOS

ESTADO DE PUBLICACIÓN
---------------------
Este paquete fue generado y validado localmente.
No se declara publicado en GitHub Pages desde esta entrega: las operaciones
de escritura de GitHub están devolviendo HTTP 403 para esta integración.
La validación de producción debe basarse en que el identificador del pie
sea visible en el sitio.
