FINANZAS B2.19.1 — CORRECCIÓN DE ARQUITECTURA DE NAVEGACIÓN

OBJETIVO
Restaurar la navegación original y agregar las nuevas funcionalidades sin reemplazar los módulos existentes.

BARRA HORIZONTAL CONSERVADA
Resumen | Movimientos | Pagos futuros | Calendario | Ahorro | Deudas | Cuentas | Operaciones | Planificación

En móvil la barra existente permanece horizontal y desplazable. El botón «Más ▾» queda separado y visible al costado para no quedar fuera de pantalla.

MENÚ «MÁS ▾»
- Motor Multifuente
- Control de Jornada

RESTAURACIONES
- Deudas y Cuentas vuelven a ser cargadas por finanzas-v233.js.
- Calendario y Ahorro permanecen en el núcleo existente.
- Planificación B2.16 permanece horizontal; se incluye fallback para crear su sección si el módulo tarda en montar.
- Operaciones queda horizontal y utiliza consultas con timeout para evitar congelamiento.
- Centro de Deudas vuelve a inyectarse en el Resumen mediante dashboard-deudas-v234.js.
- Ver detalle / Editar / Eliminar deudas se conserva mediante el módulo existente.

ARQUITECTURA
No se crea jornadas_financieras.
Control de Jornada sigue siendo la fuente operacional de horas, kilómetros, combustible, viajes, bruto, comisión y neto.
Finanzas solo integra el resultado financiero mediante el Motor Multifuente.

DESPLIEGUE
Este paquete es un PARCHE DE CORRECCIÓN, diseñado para el repositorio actual.
Reemplazar index.html y agregar/sobrescribir b219-arquitectura-navegacion.js.
NO eliminar app.js, styles.css, deudas-styles.css, deudas-centro.css, finanzas-v233.css, finanzas-v233.js,
b211-registro-pagos-mixtos.js, b216-planificacion-financiera.js, dashboard-deudas-v234.js ni centro-deudas-navegacion-b235.js.

No se declara publicado en GitHub. El intento anterior de escritura directa fue rechazado por permisos 403.
