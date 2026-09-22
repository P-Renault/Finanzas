B232.65 — INTEGRACIÓN REAL DE LIQUIDEZ
==============================================

Objetivo
--------
Cerrar el circuito financiero entre:
1) Control de Jornada y liquidez.
2) Deudas/pagos y liquidez.

ARCHIVOS
--------
- B232.65-menu-principal.js
  Reemplaza únicamente el archivo desplegado como B232.54-menu-principal.js
  (el archivo que actualmente contiene el puente B2.19/B232.64).
- B232.65_LIQUIDEZ_INTEGRACION.sql
  Debe ejecutarse UNA vez en Supabase SQL Editor antes de probar el JS.

ORDEN DE DESPLIEGUE
-------------------
1. Ejecutar B232.65_LIQUIDEZ_INTEGRACION.sql en Supabase.
2. Reemplazar B232.54-menu-principal.js por B232.65-menu-principal.js.
3. Recargar la aplicación con caché actualizado.
4. Verificar footer visible:
   B232.65-RELEASE-INTEGRACION-LIQUIDEZ

COMPORTAMIENTO
--------------
Control de Jornada:
- Cobrado + fecha actual/pasada:
  genera registro en generacion_ingresos,
  crea movimiento de ingreso,
  aumenta liquidez en efectivo o cuenta seleccionada.
- Pendiente:
  registra la generación sin aumentar liquidez.
- Fecha futura:
  no altera liquidez actual.

Deudas:
- Pago total de cuota:
  crea pago_deuda + movimiento de gasto,
  reduce saldo de deuda y liquidez.
- Abono parcial:
  crea pago_deuda + movimiento de gasto,
  reduce saldo de deuda y liquidez,
  mantiene la cuota pendiente hasta completar su saldo.
- No permite pagar más que el saldo pendiente de la cuota.
- No permite descontar liquidez dos veces dentro de una misma operación.

VALIDACIÓN MÍNIMA
-----------------
A) Jornada:
   1. Registrar una jornada cobrada de $10.000.
   2. Elegir efectivo.
   3. Confirmar que aparece en historial.
   4. Confirmar que liquidez aumenta exactamente $10.000.
   5. Repetir con una cuenta bancaria y verificar su saldo.

B) Jornada pendiente:
   Registrar $10.000 como pendiente.
   Confirmar que la liquidez NO cambia.

C) Deuda:
   Registrar/pagar una cuota de $10.000.
   Confirmar que deuda disminuye $10.000 y liquidez disminuye $10.000.

D) Abono:
   En una cuota de $10.000, abonar $4.000.
   Confirmar:
   - deuda -$4.000
   - liquidez -$4.000
   - cuota permanece pendiente con $6.000 por pagar.

E) Saldo insuficiente:
   Intentar pagar más que la liquidez disponible.
   Debe rechazar la operación sin dejar movimiento ni cambio parcial.

NOTAS
-----
- El paquete NO publica en GitHub.
- No requiere modificar index.html.
- El footer visible identifica el despliegue.
- La función SQL usa transacciones implícitas de PostgreSQL para que los cambios
  de una misma llamada RPC sean atómicos.
