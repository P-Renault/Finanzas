# FINANZAS B2.3.3-R2 — DESPLIEGUE CORRECTO

## Corrección respecto de R1

R1 NO era un despliegue completo: era solamente un bootstrap de `deudas-centro.js`.
El repositorio sigue teniendo un `index.html` que carga:

- `app.js?v=8`
- `deudas-module.js?v=21`
- `deudas-centro.js?v=22`

y NO carga directamente:

- `finanzas-v233.js`
- `finanzas-v233.css`

Por eso R1 no podía garantizar el montaje de V2.3.3.

## Objetivo de R2

El punto correcto es hacer que `index.html` cargue explícitamente la implementación V2.3.3.

Al final de `index.html`, después de `deudas-centro.js`, debe quedar:

```html
<link rel="stylesheet" href="finanzas-v233.css?v=233">
<script src="finanzas-v233.js?v=233"></script>
```

El archivo `deudas-centro.js` puede permanecer como está; no es necesario usarlo como cargador.

## NO TOCAR LA BASE DE DATOS

Esta etapa NO ejecuta SQL y NO elimina ningún dato.

## VALIDACIÓN

Después de publicar y hacer una recarga forzada:

1. Resumen debe mostrar `Liquidez inicial`.
2. Debe aparecer la pestaña `Deudas`.
3. Debe aparecer la pestaña `Cuentas`.
4. Deudas debe mostrar las tarjetas y acciones de V2.3.3.
5. Cuentas debe mostrar el catálogo.
6. No debe crearse ninguna deuda automáticamente.
7. No se debe modificar ni borrar historial.

## IMPORTANTE

El conector de GitHub actualmente responde 403 al intentar escribir en el repositorio.
Por eso este paquete es un despliegue manual exacto; no debe presentarse como un commit ya publicado.
