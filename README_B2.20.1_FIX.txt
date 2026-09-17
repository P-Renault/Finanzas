B2.20.1 — INTEGRACION REAL DEL MOTOR DE EJECUCION FINANCIERA

CORRECCION:
- b219 carga explícitamente el motor B2.20 después de Deudas.
- b220.1 integra las acciones de pago en tarjetas y detalle de deuda.
- Se eliminó el MutationObserver sobre document.body del motor; sólo se observa #deudas.
- Se expone la deuda seleccionada para abrir el pago desde el detalle.
- Santiago: Pagar próxima cuota.
- Jonathan u otra deuda sin cuotas: Registrar pago único.
- El flujo real depende de registrar_pago_deuda_v2 en Supabase.

NO ejecutar pagos automáticamente.
NO crea jornadas duplicadas.
NO reemplaza módulos existentes.
