B2.5.20.1 — Corrección integral

1) Conserva las pestañas existentes: Resumen, Movimientos, Pagos futuros, Calendario, Ahorro, Deudas, Cuentas, Operaciones y Planificación.
2) Mantiene las nuevas funciones en Más: Motor Multifuente y Control de Jornada.
3) Motor de Ejecución Financiera: pagos de cuotas y pagos únicos; no usa el observador global de B2.11.
4) Agrega en Cuentas el botón Ingresar fondos para efectivo/caja o cuenta bancaria.
5) El SQL B2.5.20.1 crea la RPC registrar_ingreso_liquidez_v1. Ejecutarlo una sola vez antes de usar Ingresar fondos.
6) No registra ningún pago ni ingreso automáticamente.
7) No crea jornadas financieras duplicadas.
