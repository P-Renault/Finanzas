PRUEBA TÉCNICA — CONSTRUCTOR DE CALENDARIO B232

Archivo: B232-CALENDAR-PRUEBA-CONSTRUCTOR.js
Rama de referencia: Backup-2.7-adaptación-móvil

Objetivo:
Insertar exclusivamente la línea:
"Esto es una prueba y se debe eliminar."

La línea se inserta dentro de cada .b232261-card que exista bajo #calendario.
El script vuelve a comprobar el DOM cuando el calendario se vuelve a renderizar,
para que la prueba no desaparezca al cambiar de mes o seleccionar un día.

No modifica Supabase, cálculos ni archivos del calendario.
Es un ARTEFACTO DE PRUEBA, NO una corrección definitiva.

Después de comprobar móvil y escritorio, eliminar este archivo y la referencia
<script> que se haya agregado para cargarlo.
