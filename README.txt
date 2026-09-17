FINANZAS B2.20 — MOTOR DE EJECUCIÓN FINANCIERA

Objetivo:
Unificar deuda -> cuota -> pago real -> fuente -> movimiento -> liquidez -> saldo.

Incluye:
- Pago de cuotas existentes con el RPC registrar_pago_deuda_v2.
- Pago mixto: efectivo + una o más cuentas bancarias.
- Deudas sin cuotas (pago único): genera una cuota/plan único para mantener trazabilidad y luego ejecuta el pago.
- Botón contextual en cada deuda: Pagar próxima cuota o Registrar pago único.
- Intercepta Registrar pago del detalle para abrir el flujo unificado.

No crea jornadas_financieras.
No elimina datos históricos.
No modifica la estructura de navegación.

IMPORTANTE:
Este módulo depende de la función Supabase registrar_pago_deuda_v2 ya instalada en B2.10.2.
No ejecutar SQL adicional para esta versión si esa función ya existe y funciona.
