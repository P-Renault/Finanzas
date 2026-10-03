# CONTROL FINANCIERO — README INTEGRATION WITH CHATGPT
## Paquete de despliegue B1.2 — Backup 2.9 adaptación móvil

### OBJETIVO

Este paquete contiene exclusivamente los archivos necesarios para cerrar estas dos solicitudes:

1. Landing Premium:
   - botón "Instalar aplicación";
   - sección de precios;
   - mensaje "Gratis por tiempo limitado";
   - CTA "Comenzar gratis".

2. Instalación móvil:
   - PWA;
   - sin APK;
   - sin Google Play Store;
   - instalación directa desde `https://controlfinanciero.cl/` en navegadores compatibles.

No contiene el resto del proyecto Control Financiero.

---

## CONTENIDO Y DESTINO

Todos los archivos de este ZIP deben copiarse respetando estas rutas desde la raíz del sitio:

```text
/
├── B230-PORTAL-ACCESO-FINAL-PREMIUM-1.1.js
├── CCF-PWA-INSTALL-B1.1.js
├── CCF-SERVICE-WORKER-B1.1.js
├── manifest.json
└── icons/
    ├── ccf-192.png
    └── ccf-512.png
```

### 1. `B230-PORTAL-ACCESO-FINAL-PREMIUM-1.1.js`

REEMPLAZAR el archivo del mismo nombre.

Contiene:
- landing Premium;
- CTA de instalación;
- sección de precios;
- "Gratis por tiempo limitado";
- carga automática del instalador PWA.

### 2. `CCF-PWA-INSTALL-B1.1.js`

AGREGAR en la raíz.

No reemplaza Supabase, autenticación ni módulos financieros.

Se encarga de:
- registrar el Service Worker;
- detectar `beforeinstallprompt`;
- ejecutar la instalación nativa cuando el navegador la ofrece;
- detectar si la aplicación ya está instalada;
- mostrar instrucciones alternativas.

### 3. `CCF-SERVICE-WORKER-B1.1.js`

AGREGAR en la raíz.

Es el Service Worker utilizado por la PWA.

No implementa caché de la aplicación: las solicitudes GET continúan por red para evitar servir versiones antiguas del sistema financiero.

### 4. `manifest.json`

REEMPLAZAR el manifest existente por este.

Define:
- nombre: Control Financiero;
- modo `standalone`;
- orientación vertical;
- iconos;
- alcance `/`.

### 5. `icons/ccf-192.png` y `icons/ccf-512.png`

AGREGAR exactamente dentro de `/icons/`.

---

# PRECONDICIÓN DEL SITIO

La versión de producción debe seguir cargando:

```html
B230-PORTAL-ACCESO-FINAL-PREMIUM-1.1.js
```

La rama base indicada para esta integración es:

`Backup 2.9 adaptación móvil`

Si el `index.html` de esa rama ya carga ese archivo, NO modificar `index.html`.

El portal carga automáticamente:

```text
/CCF-PWA-INSTALL-B1.1.js
```

Por lo tanto no hay que agregar manualmente otro `<script>` para el instalador.

El manifest debe estar referenciado por el sitio mediante:

```html
<link rel="manifest" href="manifest.json">
```

Si la versión actual de producción ya contiene esa referencia, no hacer ningún cambio adicional.

---

# DESPLIEGUE

## GitHub Pages / hosting estático

Subir los archivos a la raíz del directorio publicado, respetando exactamente las rutas anteriores.

Después del despliegue:

1. Abrir `https://controlfinanciero.cl/`.
2. Recargar completamente.
3. Abrir Chrome en Android.
4. Esperar a que termine de cargar el portal.
5. Pulsar `Instalar aplicación`.

Cuando Chrome determine que se cumplen las condiciones de instalación, debe aparecer el diálogo nativo de instalación.

La instalación NO descarga un APK.

El resultado esperado es:

```text
controlfinanciero.cl
        ↓
Instalar aplicación
        ↓
Instalar
        ↓
Ícono Control Financiero
        ↓
Aplicación en modo standalone
```

---

# SI NO APARECE EL DIÁLOGO NATIVO

El botón no debe descargar un archivo.

Si Chrome no entrega `beforeinstallprompt`, el instalador muestra instrucciones para utilizar:

`⋮ → Instalar aplicación`

o:

`⋮ → Agregar a pantalla principal`

Esto puede ocurrir cuando el navegador todavía no considera instalable la PWA o cuando ya está instalada.

---

# VALIDACIÓN FINAL

## Landing

- [ ] El landing Premium aparece correctamente.
- [ ] Existe "Gratis por tiempo limitado".
- [ ] Se muestra `$0` durante el período promocional.
- [ ] Existe "Instalar aplicación".
- [ ] Existe "Comenzar gratis".
- [ ] Login funciona.
- [ ] Registro funciona.

## PWA

- [ ] `manifest.json` responde desde la raíz.
- [ ] `/icons/ccf-192.png` responde.
- [ ] `/icons/ccf-512.png` responde.
- [ ] `/CCF-SERVICE-WORKER-B1.1.js` responde.
- [ ] El Service Worker se registra.
- [ ] Chrome Android ofrece instalación cuando corresponde.
- [ ] La aplicación abre en `standalone`.
- [ ] Login/Supabase siguen funcionando después de instalar.

## Integridad

NO modificar:

- Supabase.
- autenticación.
- base de datos.
- cálculos financieros.
- calendario.
- módulos financieros.
- scripts B232/B233/B236 existentes.
- lógica financiera.
- SEO existente.

---

# CRITERIO DE ACEPTACIÓN

La entrega se considera correcta cuando, desde un Android:

1. Se abre `https://controlfinanciero.cl/`.
2. Se visualiza el landing Premium.
3. Se pulsa `Instalar aplicación`.
4. El navegador permite instalar Control Financiero.
5. Se crea el acceso de aplicación.
6. La aplicación abre sin la interfaz normal del navegador.
7. Se puede iniciar sesión.
8. El sistema financiero funciona igual que antes.

No debe existir ningún APK ni dependencia de Google Play Store.

---

# NOTA PARA CHATGPT / AGENTE DE DESPLIEGUE

Trabajar exclusivamente sobre la rama:

`Backup 2.9 adaptación móvil`

Usar este paquete como integración final de las dos solicitudes.

No reemplazar ni editar otros archivos del proyecto salvo que una prueba de despliegue demuestre una incompatibilidad concreta.

No crear una nueva aplicación Android.

No crear APK.

No modificar Supabase.

No modificar cálculos ni módulos financieros.

El objetivo es integrar PWA + landing comercial sobre la versión estable existente.
