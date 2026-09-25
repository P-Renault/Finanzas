# CCF B2.30.10 · Arranque de emergencia de despliegue

Objetivo: corregir únicamente el arranque del sistema en GitHub Pages.

## Archivos
- `index.html` — incluye fallback de arranque B2.30.10.
- `B230-PORTAL-ACCESO.js` — portal B2.30 corregido.
- `somos-software-logo.jpg` — recurso visual.

## Despliegue
Reemplazar estos 3 archivos en la rama que actualmente alimenta GitHub Pages.

No modificar módulos financieros, SQL, Supabase ni datos.

## Validación
1. Abrir la página.
2. Si B2.30/Auth inicia normalmente, se mantiene el flujo habitual.
3. Si el portal no carga, B2.30.10 libera `#app` automáticamente después de 1,8 s y ejecuta `connect()`/`refresh()` si están disponibles.
4. Comprobar que aparecen las pestañas y módulos del Centro de Control Financiero.

Después de esta prueba, congelar la versión si el sistema carga correctamente.
