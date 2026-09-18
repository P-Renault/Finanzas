# Finanzas — MASTER SINGLE FILE

## Objetivo
Un único `index.html` autónomo para estabilizar la publicación del frontend y eliminar la dependencia de una cadena de scripts de navegación.

## Incluye
- UI principal.
- Resumen.
- Movimientos.
- Pagos futuros.
- Ahorro.
- Conexión Supabase.
- Persistencia mediante las tablas existentes.
- Navegación móvil real `Más ▾`.
- Menú de módulos:
  - Deudas
  - Cuentas
  - Operaciones
  - Planificación
  - IA Financiera
  - Motor Multifuente
  - Control de Jornada

## Importante
Esta versión es una **base maestra de estabilización del frontend**. No afirma contener toda la lógica avanzada de los módulos B2.19–B2.34, porque esas implementaciones están distribuidas en archivos independientes y no es seguro inventar o reconstruir silenciosamente esa lógica.

Por eso NO se recomienda borrar el repositorio actual todavía.

## Arquitectura recomendada
1. Probar este `index.html` como publicación aislada.
2. Confirmar que GitHub Pages sirve exactamente este archivo.
3. Después consolidar, de forma controlada, los módulos avanzados y las funciones SQL/Edge Functions de Supabase.
4. Solo después retirar los archivos obsoletos.

GitHub Pages necesita un archivo de entrada en la raíz de la fuente publicada cuando se publica desde una rama. Fuente: documentación oficial de GitHub Pages.
