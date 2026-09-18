CHECKPOINT B2.30 — DEUDA FLEXIBLE
================================
Este paquete fija deliberadamente la evolución hasta B2.30.

Incluye:
- núcleo financiero y módulos existentes hasta B2.28
- B2.29 Movimiento de fondos
- B2.30 Deuda flexible

EXCLUIDO DELIBERADAMENTE:
- b229-dashboard-integral.js
- b230-proximos-vencimientos.js
- cualquier mejora específica posterior del Dashboard relacionada con vencimientos/datos adicionales.

También se eliminaron las cargas duplicadas de B2.27 y B2.29 que aparecían en el index del commit B2.30.

No se ejecuta SQL.
No modifica datos de Supabase.
Es un checkpoint para validar antes de continuar.
