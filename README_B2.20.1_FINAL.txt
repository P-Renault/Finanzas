B2.20.1 FINAL — INTEGRACION REAL DEL MOTOR DE EJECUCION FINANCIERA

Corrección principal:
- Se eliminó la llamada a bindDetailDelegation(), que no existía y provocaba una excepción durante el arranque del motor.
- El motor ahora expone sus acciones antes de inyectar botones.
- Se vuelve a cablear Deudas cuando el módulo legacy termina de renderizar.
- Se observa únicamente #deudas, no document.body.
- Se incluye b220.1-integracion-ejecucion.js como segunda capa de integración.

Resultado esperado:
Santiago: Pagar próxima cuota.
Jonathan: Registrar pago único.
Detalle de cuotas: Registrar pago.
La ejecución usa registrar_pago_deuda_v2 y mantiene trazabilidad pago -> fuente -> movimiento -> liquidez -> cuota -> saldo.

No ejecutar SQL nuevo. No se registra ningún pago automáticamente.
