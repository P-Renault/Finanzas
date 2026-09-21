B232.53.3 — HOTFIX FINAL DE AISLAMIENTO DEL CALENDARIO

Corrige la regresión de navegación introducida por B232.26.x.
El Calendario ya no fuerza display:block, no oculta otros .tab y no administra globalmente cf_active_tab_v2.
La navegación queda bajo B2.19/B232.52.

Aplicar index.html y B232.26.3-calendario-safe.js. No requiere cambios SQL ni de Supabase.

Validaciones: sintaxis JS, unicidad de script del calendario, ausencia de display:block en #calendario, ausencia de ocultación global de tabs.
