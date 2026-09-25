# CCF B2.30.11 — Reconstrucción final de despliegue

## Objetivo
Restaurar el arranque del Centro de Control Financiero y volver a declarar explícitamente los motores que habían quedado fuera del `index.html` desplegado.

## Correcciones
- Mantiene `app.js` una sola vez.
- Integra explícitamente `b219-arquitectura-navegacion-B2.6-D6-CORREGIDO-CRUD.js`.
- Integra explícitamente `b225-motor-multifuente.js` con CRUD.
- Mantiene el cargador controlado de B2.20, B2.21, B2.22, B2.27, B2.29, B2.31.x y B2.33.
- Mantiene B232.68, planificación, calendario, resumen, movimientos futuros y autenticación.
- Mantiene el arranque de emergencia B2.30.10.
- No modifica SQL ni datos de Supabase.
- No elimina ningún motor existente del repositorio.
- Footer final: B2.30.10 · Release operacional.

## Despliegue
Reemplazar solamente `index.html` en la rama `b233-presupuesto-desarrollo` y verificar que los archivos JS existentes del repositorio permanezcan intactos, especialmente:

`b219-arquitectura-navegacion-B2.6-D6-CORREGIDO-CRUD.js`
`b225-motor-multifuente.js`
`b220-motor-ejecucion-financiera.js`
`b220.2-puente-ejecucion.js`
`b221-movimientos-liquidez.js`
`b227-ia-financiera.js`
`b229-movimientos-fondos.js`
`b231.0-adaptador-deudas-v2.js`
`b231.1-persistencia-deuda-sin-fecha.js`
`b231.2-deudas-fecha.js`
`b231.3-abonos-parciales.js`
`b233-motor-presupuesto.js`

## Importante
La conexión disponible para GitHub permite lectura, pero las operaciones de escritura están devolviendo HTTP 403. Por eso este paquete debe cargarse manualmente en GitHub.
