B232.59 — RELEASE CORRECTIVO: MÓDULOS REALES B2.19

OBJETIVO
Restaurar las vistas funcionales originales de B2.19 cuando B232.51.3 u otra
capa anterior haya dejado #ingresos o #jornadas como placeholders.

IMPORTANTE
- Sustituir solamente B232.54-menu-principal.js por este archivo.
- No agregar otro <script>.
- No modificar index.html.
- No ejecutar SQL.
- No modificar Supabase.

MÉTODO
El parche no implementa un segundo módulo financiero. Reconstruye exactamente
los IDs y formularios que espera b219-arquitectura-navegacion.js:
  #ingresos + b219Generated/b219Received/b219Pending + b219IncomeForm...
  #jornadas + b219JCount/b219JNet + b219JForm...
Así, el show()/loadIncome()/loadJornadas() originales de B2.19 pueden operar
sobre sus vistas reales.

También elimina solamente el menú Más y conserva b219NavShell.

IDENTIFICADOR VISIBLE
B232.59-RELEASE-MODULOS-REALES

VALIDACIÓN ESTÁTICA
node --check: OK
