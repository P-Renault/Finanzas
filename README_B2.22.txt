B2.22 — Centro de Operaciones / Cuantificación
- Liquidez real = efectivo + cuentas bancarias.
- Ingresos del mes = movimientos de ingreso con fecha hasta hoy.
- Gastos operativos = gastos que no están vinculados a pagos_deuda.
- Pagos de deuda = gastos cuyo movimiento_id está registrado en pagos_deuda.
- Ingresos/gastos futuros no afectan liquidez real.
- No crea jornadas financieras.
- No elimina ni migra datos.
- SQL opcional: crea una vista de lectura para futuras integraciones.
- El JS se carga después de B2.21 y reconstruye únicamente la sección Operaciones.
