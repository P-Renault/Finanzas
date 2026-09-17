FINANZAS — DESPLIEGUE CONSOLIDADO B2.13
============================================

Objetivo
--------
Restaurar el frontend funcional acumulado y corregir el problema de conexión.

Incluye
-------
- index.html consolidado
- conexión Supabase robusta con diagnóstico y timeout
- Cero Financiero / liquidez
- Cuentas
- Deudas y centro de deudas
- B2.11 pagos con múltiples fuentes
- B2.12 Centro de Operaciones
- Calendario, movimientos, pagos futuros y ahorro
- cache-busting v=213

IMPORTANTE
----------
Este paquete NO modifica la base de datos y NO contiene SQL.
Los registros existentes se conservan.

Despliegue
----------
1. En GitHub abre P-Renault/Finanzas, rama main.
2. Reemplaza index.html.
3. Reemplaza b211-registro-pagos-mixtos.js.
4. Reemplaza b212-centro-operaciones.js.
5. Agrega finanzas-runtime-fix.js.
6. Espera a que GitHub Pages publique.
7. Abre exactamente:
   https://p-renault.github.io/Finanzas/

Luego realiza una recarga completa del navegador.

No ejecutes SQL para este despliegue.
