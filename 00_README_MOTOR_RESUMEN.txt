ARCHIVO: 00_README_MOTOR_RESUMEN.txt
LENGUAJE: Documentación
EXTENSIÓN DE ENTREGA: .txt

MOTOR DE RESUMEN FINANCIERO v2
Arquitectura destino: HTML5 + CSS3 + JavaScript ES2022 + Supabase.

ORDEN DE INTEGRACIÓN
1. supabase_finanzas.js
2. motor_estado_financiero.js
3. motor_proyeccion_liquidez.js
4. motor_brecha.js
5. motor_margen_diario.js
6. motor_alertas.js
7. motor_acciones.js
8. resumen.js
9. resumen.css
10. resumen.html
11. resumen.test.js

REGLA:
Los nombres de tablas/campos de Supabase son adaptadores. Antes de producción deben
mapearse contra el esquema real del repositorio.

PRINCIPIO:
La UI presenta resultados; los motores calculan.
Un gasto real nunca se bloquea por superar el margen.
