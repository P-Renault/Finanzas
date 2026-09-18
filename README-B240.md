# B2.40 — Presupuesto Integrado

Esta versión reemplaza el enfoque aislado B230.

Presupuesto es una capa de integración del sistema principal:
- lee movimientos reales;
- lee compromisos/pagos futuros;
- lee ahorro;
- consume puentes de deudas, operaciones y planificación cuando están publicados;
- mantiene únicamente la definición del presupuesto (partidas planificadas);
- calcula ejecución, desviación, proyección y alertas.

No crea una segunda base financiera ni duplica movimientos.

La persistencia propia se limita a:
`presupuestos`
`presupuesto_partidas`

La seguridad usa RLS por `auth.uid()`.

## Importante
Los nombres exactos de las tablas del núcleo recuperado no se alteran. El adaptador acepta los puentes/globales B2.36–B2.39 y los nombres conocidos del núcleo (`movimientos`, `compromisos`, `ahorro`, etc.). Si el puente de una versión publica una estructura distinta, la adaptación debe hacerse en `collectBridges()` sin tocar los motores originales.
