# ARQUITECTURA FINAL — CONTROL FINANCIERO

## Capas

1. `index.html`
   Shell, navegación, carga de dependencias y módulos.

2. `app.js`
   Núcleo de navegación y funciones base existentes.

3. Módulos financieros legacy
   Deudas, cuentas, movimientos, presupuesto, generación y otros módulos.

4. Cierre ejecutivo
   B232.35 — Centro de Control / Resumen Ejecutivo.

5. Correcciones e integración
   - B232.39 — IA Financiera Data Bridge
   - B232.40 — Planificación
   - B232.41 — Integración y regresión
   - B232.42.1 — Reconciliación
   - B232.43 — Rendimiento + UX

6. Persistencia
   Supabase.

## Flujo conceptual

Supabase
  ↓
Fuentes financieras
  ↓
Motores/módulos
  ↓
Contratos de lectura
  ↓
Resumen / Operaciones / Planificación / IA
  ↓
Auditoría y reconciliación

## Regla arquitectónica de cierre

Las capas de auditoría no deben escribir datos financieros.
Las correcciones de presentación no deben modificar los motores financieros
estables salvo que una nueva especificación lo requiera explícitamente.
