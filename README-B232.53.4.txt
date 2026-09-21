B232.53.4 — FIX FECHA DE PAGO DE CUOTAS PENDIENTES

Causa:
La edición de una deuda actualizaba deudas.fecha_primera_cuota y fecha_proximo_pago,
pero si ya existía un plan activo, las cuotas_deuda conservaban su fecha_vencimiento.
El Calendario y la vista de cuotas leen esas fechas, por lo que parecía que la edición
no había persistido.

Corrección:
Después de una edición confirmada, se sincronizan sólo cuotas pendientes/vencidas del
deuda_id editado. La primera cuota pendiente recibe la nueva fecha y las siguientes
se calculan según frecuencia semanal/quincenal/mensual. Cuotas pagadas no se modifican.
También se actualiza fecha_proximo_pago.

No requiere cambios SQL.
