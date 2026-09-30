# CCF Mobile B4.3 — Calendario móvil — Alternativa 1

## Objetivo
Adaptación exclusivamente móvil del módulo `#calendario`, manteniendo el motor `B232.26.4-calendario-safe.js` intacto.

## Archivos incluidos
- `CCF-MOBILE-B4.3.js`
- `CCF-MOBILE-B4.3.css`

## Alcance
- Solo viewport móvil (`max-width: 720px`).
- Solo módulo `#calendario`.
- No agrega Bootstrap ni FullCalendar.
- No modifica `B232.26.4-calendario-safe.js`.
- No modifica `index.html`.
- No modifica Supabase ni autenticación.
- No modifica otros módulos.
- La vista desktop conserva el calendario original.

## Implementación
La capa B4.3.5 toma como fuente el DOM ya renderizado por B232.26.4 y crea una vista móvil independiente con:

1. período y navegación anterior / Hoy / siguiente;
2. resumen mensual;
3. grilla fija de 7 columnas DOM–SÁB;
4. 42 días cuando el calendario genera seis semanas;
5. indicadores compactos para ingresos, egresos, proyección, generación y deuda;
6. selección de día delegada al botón original del motor;
7. detalle del día debajo del calendario.

La capa móvil se elimina al volver a escritorio.

## Validación técnica realizada
- Sintaxis JavaScript: `node --check` OK.
- Balance de llaves CSS/JS: OK.
- No se modificó el archivo del motor del calendario.
- No se modificaron archivos de otros módulos.

## Importante
Este paquete es una **implementación para prueba**. La validación visual/funcional final debe realizarse en el dispositivo móvil real antes de considerarlo validado para producción.

## Rollback
Restaurar los dos archivos B4.3 anteriores. No es necesario tocar `B232.26.4-calendario-safe.js`.
