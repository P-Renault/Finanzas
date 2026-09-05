# Control Financiero — V1

Aplicación web/PWA para registrar ingresos, gastos, pagos futuros y fondo de ahorro.

## Arquitectura
- Frontend: HTML + CSS + JavaScript.
- Publicación: GitHub Pages.
- Base de datos: Supabase.
- Moneda: pesos chilenos (CLP).

## Instalación
1. Crea un proyecto gratuito en Supabase.
2. Abre SQL Editor y ejecuta `supabase.sql` completo.
3. Copia la URL del proyecto y la `anon public key`.
4. Sube todos estos archivos a un repositorio de GitHub.
5. Activa GitHub Pages desde Settings > Pages > Deploy from branch.
6. Abre la URL publicada desde Android.
7. Introduce la URL y la anon key en la pantalla inicial.

## Nota de seguridad
Esta V1 está pensada para uso personal y no implementa autenticación. No uses este diseño sin cambios para datos financieros de varias personas. En una V2 se puede agregar Supabase Auth + RLS para aislar los datos por usuario.

## Próximas mejoras
- Edición/eliminación de movimientos.
- Presupuestos por categoría.
- Metas de ahorro.
- Repetición automática de pagos.
- Calendario mensual.
- Gráficos.
- Exportación CSV.
- Inicio de sesión.
