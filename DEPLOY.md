# B232.52.2 — Paquete final de despliegue

## Archivos a subir al repositorio
Reemplazar en la raíz del repositorio los archivos incluidos en este paquete:

- `index.html`
- `B232.52-planificacion-safe.js`
- `B232.42.1-reconciliacion-fuentes.js`
- `B232.48.3-qa-runtime.js`

El archivo `LEEME-B232.52.2.txt` documenta la incidencia corregida.

## Importante
Este paquete está pensado para **actualizar el repositorio Finanzas existente**. No elimina los demás archivos del repositorio; solamente reemplaza los cuatro archivos anteriores.

## Correcciones incluidas
- Elimina la referencia al módulo antiguo `b232.31-planificacion-integrada-restaurada.js`.
- Activa `B232.52-planificacion-safe.js?v=232.52.2`.
- Corrige la redeclaración de `futureIncome` en B232.42.1.
- Mantiene Deudas, Cuentas, Operaciones y Planificación integradas.
- Mantiene QA runtime B232.48.3.

## Despliegue en GitHub Pages
1. Abrir el repositorio `P-Renault/Finanzas`.
2. Entrar a la rama `Punto-referencia`.
3. Subir/reemplazar los cuatro archivos en la raíz.
4. Hacer commit.
5. Esperar la publicación de GitHub Pages.
6. Abrir la aplicación en una pestaña nueva y hacer una recarga completa si el navegador conserva la versión anterior.

## Validación visual esperada
La aplicación debe mostrar las pestañas:
`Resumen · Movimientos · Pagos futuros · Calendario · Ahorro · Deudas · Cuentas · Operaciones · Planificación · IA Financiera · Presupuesto`.

En Planificación debe aparecer el encabezado `B232.52.2 - PLANIFICACIÓN SEGURA` y no debe aparecer el error `renderPlan is not defined`.
