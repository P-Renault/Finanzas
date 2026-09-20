# B232.45 — EVOLUCIÓN CONTROLADA

Objetivo:
incorporar mejoras posteriores sin alterar la estabilidad financiera de
B232.44.

## Sprint 1 — Observabilidad operativa
- Estado de versión visible.
- Diagnóstico de conexión Supabase.
- Indicador de última actualización.
- Registro de errores de frontend sin datos sensibles.
- Identificación de módulo que presenta un error.

## Sprint 2 — Mantenimiento financiero
- Revisión de contratos de datos.
- Validaciones de entrada.
- Validación de fechas y montos.
- Protección contra registros duplicados.
- Validación de operaciones antes de escritura.

## Sprint 3 — UX móvil
- Formularios más compactos.
- Confirmaciones de operaciones destructivas.
- Mensajes de error accionables.
- Estados vacíos diferenciados de cero.
- Mejoras de accesibilidad de controles.

## Sprint 4 — Seguridad
- Revisión RLS de tablas financieras.
- Separación lectura/escritura.
- Revisión de políticas de acceso.
- Auditoría de exposición de configuración.
- No almacenar secretos en frontend.

## Sprint 5 — Evolución funcional
Solo después de completar los controles anteriores:
- nuevas funciones financieras;
- automatizaciones;
- reportes;
- nuevas fuentes de ingreso;
- nuevas herramientas de planificación.

## Definition of Done para cada sprint
1. Requerimiento documentado.
2. Impacto arquitectónico identificado.
3. Implementación aislada.
4. Regresión ejecutada.
5. Validación móvil.
6. Archivos finales completos.
7. Documentación actualizada.
8. Rollback definido.
9. Aprobación del usuario.
