B232.67 — CORRECCIÓN MOVIMIENTOS → LIQUIDEZ

DIAGNÓSTICO CONFIRMADO
El movimiento ID 80 ($8.474) quedó:
- medio_pago = NULL
- cuenta_id = NULL
- naturaleza = NULL
- liquidez_aplicada = false

La causa es que app.js mantiene un handler legacy de movForm que inserta
directamente en public.movimientos, sin usar el RPC B2.21.

SOLUCIÓN
Este paquete instala un propietario de captura sobre movForm.
Antes de que se ejecuten los handlers legacy:
- intercepta el submit;
- usa registrar_movimiento_liquidez_v1 para nuevos movimientos;
- usa actualizar_movimiento_liquidez_v1 para ediciones;
- aplica efectivo/cuenta bancaria;
- aplica naturaleza;
- impide doble registro;
- conserva el comportamiento de fechas futuras.

DESPLIEGUE
Agregar en index.html, después de los módulos existentes:

<script src="B232.67-MOVIMIENTOS-LIQUIDEZ.js?v=232.67"></script>

No reemplaza B232.65 ni B232.66.

PRUEBA
1. Crear un gasto nuevo de $1.000 en efectivo.
2. Debe crearse un solo movimiento.
3. liquidez_aplicada debe quedar true.
4. saldo_efectivo_actual debe bajar exactamente $1.000.
5. No debe aparecer un segundo movimiento.
6. Footer visible: B232.67-RELEASE-MOVIMIENTOS-LIQUIDEZ

IMPORTANTE
El movimiento histórico ID 80 no se corrige automáticamente. Primero se valida
el nuevo circuito para evitar doble descuento del gasto que ya existe.
