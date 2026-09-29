CCF — SOLUCIÓN CALENDARIO MÓVIL B4.3
====================================

Base objetivo:
  Backup-1.5-adaptación-móvil

Archivos que se modifican:
  - CCF-MOBILE-B4.3.js
  - CCF-MOBILE-B4.3.css

Archivos que NO se modifican:
  - index.html
  - app.js
  - B232.26.4-calendario-safe.js
  - Supabase / Auth / SQL / RLS
  - cualquier motor financiero

OBJETIVO
--------
La solución adapta únicamente la presentación del calendario existente.
El motor B232.26.4 sigue siendo el único propietario de datos, cálculos,
navegación de meses, selección de día y detalle.

CAMBIO
------
Dentro de la experiencia móvil B4.3 se crea una caja interna exclusiva
para la cuadrícula mensual. La cuadrícula pasa de:

  repeat(7,minmax(110px,1fr)) + min-width:770px

a:

  repeat(7,minmax(0,1fr)) + width:100% + min-width:0

La caja interna no permite desplazamiento horizontal.

IMPORTANTE
----------
NO volver a cargar CCF-CALENDAR-MOBILE-ISOLATED.js/.css.
NO agregar referencias nuevas al index.html.

APLICACIÓN
----------
El archivo .patch es un parche Git estándar. Desde la raíz del repositorio:

  git checkout Backup-1.5-adaptación-móvil
  git apply CCF-MOBILE-B4.3-CALENDAR-SOLUTION.patch

Después validar:

1. Cargar la aplicación en móvil.
2. Entrar a Calendario.
3. Verificar que la tarjeta mensual está contenida dentro del ancho.
4. Verificar DOM-LUN-MAR-MIÉ-JUE-VIE-SÁB en 7 columnas.
5. Verificar meses anterior/siguiente y Hoy.
6. Seleccionar un día.
7. Verificar el detalle del día.
8. Intentar desplazar horizontalmente: no debe existir scroll horizontal.
9. Verificar que los datos financieros siguen siendo los mismos.
10. Probar nuevamente Resumen, Movimientos y otros módulos.

Si la aplicación se modifica desde GitHub web en vez de Git local,
aplicar exactamente las dos inserciones descritas por el parche:
- la lógica JS dentro de CCF-MOBILE-B4.3.js
- las reglas CSS al final de CCF-MOBILE-B4.3.css

La solución está deliberadamente aislada en B4.3 para no repetir
el problema de integración que apareció al cargar una capa externa
desde index.html.
