# B2.40 — Despliegue Presupuesto Integrado

## Línea base
La integración está diseñada sobre el núcleo recuperado:
- app.js / núcleo Supabase
- B2.36 Deudas/Cuentas
- B2.37 Operaciones/Planificación
- B2.38 Ingresos/Ejecución/Jornada
- B2.39 QA de integridad

No recargar B2.19–B2.28 antiguos.

## 1. Supabase
Ejecutar `b240-presupuesto-integrado.sql` una sola vez en SQL Editor.

## 2. Archivos
Subir al mismo directorio de `main/index.html`:
- b240-presupuesto-integrado-loader.js
- b240-presupuesto-integrado.js
- b240-presupuesto-integrado.css

## 3. main/index.html
Usar `b240-presupuesto-integracion.html` como parche:
A) agregar botón `data-tab="presupuesto"` dentro de `.tabs`.
B) agregar la sección `#presupuesto` dentro de `#app`.
C) agregar CSS en `<head>`.
D) agregar el loader después de `b239-qa-integridad.js`.

No reemplazar app.js ni los loaders B2.36–B2.39.

## 4. Orden final recomendado de scripts
app.js
b236-safe-loader.js
b237-operaciones-planificacion-loader.js
b238-ingresos-ejecucion-jornada-loader.js
b239-qa-integridad.js
b240-presupuesto-integrado-loader.js

## 5. Prueba de integración
- iniciar sesión;
- abrir Presupuesto;
- comprobar que el mes actual se crea automáticamente;
- crear partidas de ingreso, fijo, variable, deuda y ahorro;
- registrar/editar/eliminar una partida;
- verificar que movimientos existentes se reflejen como ejecución;
- verificar compromisos futuros;
- cambiar de mes;
- recargar la PWA;
- comprobar que el presupuesto persiste;
- comprobar que los módulos Resumen, Movimientos, Pagos futuros, Calendario, Ahorro, Deudas, Cuentas, Operaciones y Planificación continúan funcionando;
- ejecutar B2.39 QA nuevamente.

## 6. Rollback
Eliminar únicamente:
- la sección #presupuesto;
- el botón Presupuesto;
- el enlace CSS B2.40;
- el loader B2.40.

No eliminar las tablas ni modificar tablas del núcleo durante un rollback funcional.
