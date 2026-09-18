# FINANZAS — B2.28 CIERRE DE INTEGRACIÓN

## Objetivo de esta entrega
Integrar visual y funcionalmente:
1. Motor Multifuente
2. Control de Jornada

Ambos ya existen en B2.19 y actualmente aparecen dentro de `Más ▾`.
B2.28 los expone como pestañas principales sin duplicar su lógica.

## Tareas pendientes para 100% de despliegue

### P0 — Bloqueante de publicación
- Actualizar `index.html` para cargar:
  `b228-integracion-final.js?v=228.0`
- Publicar en `main`.
- Verificar GitHub Pages.

El conector de GitHub actualmente devuelve HTTP 403:
`Resource not accessible by integration`.
Por eso esta entrega no debe considerarse publicada hasta que el commit exista en `main`.

### P1 — Validación funcional
- Abrir Motor Multifuente.
- Verificar que carga fuentes desde `fuentes_ingreso`.
- Verificar que las generaciones usan `generacion_ingresos`.
- Abrir Control de Jornada.
- Verificar que muestra los resultados integrados.
- Confirmar que no se duplican horas, km, combustible ni viajes.
- Confirmar que Finanzas no crea una segunda jornada operacional.

### P1 — IA
- Mantener `b227-ia-financiera.js`.
- Mantener OpenAI exclusivamente en Supabase Edge Function.
- Configurar `OPENAI_API_KEY` como secreto de Supabase.
- No guardar la clave en GitHub Pages ni localStorage.
- Probar diagnóstico, próximos 30 días y flujo futuro.

### P1 — Seguridad de producción
- Revisar autenticación/RLS de Supabase antes de considerar producción definitiva.
- Restringir CORS de la Edge Function al dominio de la aplicación.
- Revisar permisos de inserción/actualización en tablas financieras.

### P2 — QA final
- Resumen
- Movimientos
- Pagos futuros
- Calendario
- Ahorro
- Deudas
- Cuentas
- Operaciones
- Planificación
- Motor Multifuente
- Control de Jornada
- IA Financiera
- móvil Android
- recarga directa de GitHub Pages
- navegación sin pantalla blanca
- no regresión de registros históricos

## Arquitectura de cierre

GitHub Pages / PWA
    |
    +-- app.js
    +-- B2.19 navegación
    +-- B2.20 ejecución
    +-- B2.21 liquidez
    +-- B2.22 operaciones
    +-- B2.24 planificación
    +-- B2.28 integración visual
    |
    +-- Supabase
          |
          +-- Finanzas / deudas / cuentas / movimientos
          +-- fuentes_ingreso
          +-- generacion_ingresos
          +-- Edge Function IA
                    |
                    +-- OpenAI Responses API

Principio: Supabase es la fuente de verdad; IA interpreta y planifica; Control de Jornada conserva el detalle operacional.
