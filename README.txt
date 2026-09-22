B232.66 — ABONO DEUDA -> LIQUIDEZ REAL
======================================

Hallazgo corregido
------------------
B231.3-abonos-parciales.js registra el movimiento, pago_deuda y saldo de deuda,
pero no modifica cierres_financieros.saldo_efectivo_actual ni cuentas_bancarias.saldo_actual.
B232.65 ya contenía la RPC transaccional registrar_pago_deuda_liquidez_v1, pero la UI de
abonos no la estaba utilizando.

Este paquete corrige exactamente ese puente sin reemplazar el módulo completo de Deudas.

ARCHIVOS
--------
1) B232.66-ABONO-LIQUIDEZ.js
   Cargar DESPUÉS de b231.3-abonos-parciales.js.
   Intercepta únicamente los botones data-b2313-abono="true" y registra el abono mediante
   registrar_pago_deuda_liquidez_v1.

2) B232.65_LIQUIDEZ_INTEGRACION.sql
   Es el SQL transaccional requerido por la función de abono de deuda.
   Si ya ejecutaste B232.65_LIQUIDEZ_INTEGRACION.sql, NO necesitas ejecutarlo nuevamente.

DESPLIEGUE
----------
En index.html, después de:
<script src="b231.3-abonos-parciales.js?v=231.3"></script>

agregar:
<script src="B232.66-ABONO-LIQUIDEZ.js?v=232.66"></script>

No reemplaza B232.65-menu-principal.js.

COMPORTAMIENTO
--------------
- El usuario selecciona monto, medio de liquidez y fecha real.
- Efectivo descuenta cierres_financieros.saldo_efectivo_actual.
- Cuenta bancaria descuenta cuentas_bancarias.saldo_actual.
- El mismo RPC registra movimiento + pago_deuda + reducción de deuda + cuota.
- La operación es transaccional: si falla la validación, no queda el descuento parcial.
- Un abono parcial deja la cuota pendiente.
- No permite pagar más que el saldo restante de la cuota.
- No permite fecha futura.

VALIDACIÓN
----------
Antes: $27.346 de liquidez total en la captura de prueba.
Para un abono de $7.000 en efectivo, el saldo esperado es $20.346,
siempre que los $27.346 sean la liquidez vigente y no haya otra operación simultánea.

Footer visible:
B232.66-RELEASE-ABONO-LIQUIDEZ

IMPORTANTE
----------
Este paquete no publica en GitHub automáticamente.
No se considera desplegado hasta que el script esté referenciado por index.html y
la aplicación muestre el footer B232.66.
