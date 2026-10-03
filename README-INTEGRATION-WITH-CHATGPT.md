# CCF PWA — FIX B1.3

## Problema corregido

Chrome reconocía el sitio pero mostraba:

> "No se puede instalar esta app."

Esta versión cambia la integración a un Service Worker convencional:

`/sw.js`

con alcance `/` y activación inmediata.

El instalador espera a que el Service Worker esté listo antes de ofrecer la experiencia de instalación.

## Archivos

Reemplazar/agregar en la raíz publicada:

- `B230-PORTAL-ACCESO-FINAL-PREMIUM-1.1.js` — reemplazar.
- `CCF-PWA-INSTALL-B1.3.js` — agregar/reemplazar.
- `sw.js` — agregar.
- `manifest.json` — reemplazar.
- `icons/ccf-192.png` — agregar/reemplazar.
- `icons/ccf-512.png` — agregar/reemplazar.

## IMPORTANTE

El portal debe cargar `CCF-PWA-INSTALL-B1.3.js`.

Si `B230-PORTAL-ACCESO-FINAL-PREMIUM-1.1.js` ya realiza esa carga, no agregues un segundo script.

El sitio debe seguir teniendo:

`<link rel="manifest" href="/manifest.json">`

No debe haber dos Service Workers compitiendo por el mismo scope `/`.

Si existe una versión anterior registrada, el nuevo `/sw.js` debe quedar como el Service Worker activo de `/`.

## Despliegue

Subir los archivos respetando exactamente estas rutas:

/
  sw.js
  manifest.json
  B230-PORTAL-ACCESO-FINAL-PREMIUM-1.1.js
  CCF-PWA-INSTALL-B1.3.js
  icons/ccf-192.png
  icons/ccf-512.png

## Después de desplegar

En el teléfono Android:

1. Abrir `https://controlfinanciero.cl/` en Chrome.
2. Recargar.
3. Si Chrome conservó el Service Worker anterior, abrir:
   Chrome > Configuración > Configuración de sitios > Todos los sitios > controlfinanciero.cl
   y borrar los datos del sitio.
4. Cerrar la pestaña.
5. Abrir nuevamente `https://controlfinanciero.cl/`.
6. Esperar a que cargue completamente.
7. Pulsar `Instalar aplicación`.

También puede aparecer:

Chrome > ⋮ > Instalar aplicación.

## Criterio de aceptación

La instalación debe producir una aplicación standalone con el nombre:

`Control Financiero`

y abrir:

`https://controlfinanciero.cl/`

sin la interfaz normal de pestañas de Chrome.

## No modificar

- Supabase
- autenticación
- base de datos
- cálculos financieros
- calendario
- módulos financieros
- SEO
- adaptación móvil existente

No crear APK.
No usar Play Store.

## Diagnóstico si continúa "No se puede instalar"

Verificar en Chrome DevTools > Application:

- Manifest: válido.
- Service Workers: `/sw.js`, activated.
- Scope: `/`.
- Fetch handler: presente.
- Manifest icons: 192 y 512 accesibles.
- URL: HTTPS.
- No existe otro Service Worker antiguo controlando `/`.

La PWA depende de las reglas de instalabilidad del navegador; el botón no descarga un archivo APK.


## CORRECCIÓN B1.3 FINAL

El archivo `B230-PORTAL-ACCESO-FINAL-PREMIUM-1.1.js` de este paquete ya está
ajustado para cargar `CCF-PWA-INSTALL-B1.3.js`.

No conservar ni desplegar una copia de `CCF-PWA-INSTALL-B1.1.js`.

Debe existir una sola versión del instalador PWA.
