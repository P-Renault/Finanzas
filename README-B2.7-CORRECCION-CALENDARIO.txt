B2.7 — CORRECCIÓN ESTRUCTURAL DEL CALENDARIO

Rama objetivo:
Backup-2.7-adaptación-móvil

Archivo:
B232.26.4-calendario-safe.js

Objetivo:
Separar estructuralmente la fuente DOM que B4.3.17/Premium 18.1 necesitan
de la presentación visual antigua de B232.

Cambio:
1. Se introduce .b232261-source como contenedor técnico.
2. El .b232261-card pasa a existir dentro de esa fuente técnica.
3. La fuente técnica queda fuera de la presentación visual mediante display:none!important.
4. No se modifica Supabase.
5. No se modifica la lógica de cálculo.
6. No se modifica Premium 18.1.
7. No se modifican los selectores internos que B4.3.17 consume.

La integración GitHub disponible en esta sesión rechazó las operaciones de escritura
con HTTP 403 (Resource not accessible by integration). Por eso este ZIP contiene
la corrección exacta como diff; el repositorio NO fue modificado por esta sesión.
