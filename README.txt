CCF-MOBILE-B4.3-CALENDAR-FINAL

Reemplazar los dos archivos B4.3 actuales por:
- CCF-MOBILE-B4.3.js
- CCF-MOBILE-B4.3.css

NO modificar index.html, app.js, Supabase/Auth, SQL/RLS ni B232.26.4-calendario-safe.js.

La adaptación del calendario se ejecuta solo en <=720px y crea una caja interna
para la cuadrícula mensual. El módulo B232.26.4 mantiene datos, navegación,
selección y detalle.
