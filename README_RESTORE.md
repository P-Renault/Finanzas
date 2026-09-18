# Finanzas — MASTER RESTORED B2.31.4

## Objetivo
Restaurar el shell funcional que estaba operativo antes del `MASTER SINGLE FILE` que dejó varios módulos como placeholders.

## Corrección principal
El `index.html` maestro de la publicación actual fue sustituido por una versión autónoma que contenía placeholders para Deudas, Cuentas, Operaciones, Planificación, IA, Motor Multifuente y Control de Jornada. Por eso la aplicación cargaba, pero ya no conservaba la lógica avanzada.

Esta versión restaura el shell B2.31.4 que ya había sido construido para trabajar con los módulos reales del repositorio.

## Qué se conserva
- Resumen
- Movimientos
- Pagos futuros
- Calendario completo
- Ahorro
- Navegación móvil `Más ▾`
- Deudas
- Cuentas
- Operaciones
- Planificación
- IA Financiera
- Motor Multifuente
- Control de Jornada
- Dashboard financiero integral
- Próximos vencimientos
- Motor de liquidez/movimientos
- Motor de ejecución financiera y puente de pago
- Deuda flexible

## Cambio de archivos
**Solo reemplazar `index.html`.**

El `app.js` actual del repositorio ya coincide con el núcleo funcional requerido por B2.31.4 (blob SHA `8f3988821ef28c562942fd83804b48fb1bbf8f55` verificado mediante GitHub).

No requiere SQL nuevo y no modifica Supabase.

## Importante
No borrar archivos del repositorio. La función de `index.html` aquí es volver a conectar el núcleo y los módulos existentes mediante la arquitectura B2.19/B2.31.4.

## Validación visual esperada
La navegación debe volver a mostrar únicamente:
`Resumen · Movimientos · Pagos futuros · Calendario · Ahorro · Más ▾`

Al abrir `Más ▾` deben aparecer los siete módulos reales, no placeholders.
