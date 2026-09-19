/* Financial Action Engine — v5.0.0 */
window.FinancialActionEngine = (() => {
  function build({ risk, gap, marginAlert }) {
    const actions = [];

    if (risk) {
      actions.push({
        priority: 1,
        title: 'Proteger liquidez',
        problem:
          `La liquidez proyectada cae bajo la reserva el ${risk.date}.`,
        action:
          'Reducir gasto discrecional y asegurar recursos antes de esa fecha.'
      });
    }

    if (gap?.gap > 0) {
      actions.push({
        priority: 2,
        title: 'Cerrar brecha financiera',
        problem:
          `Existe una brecha de $${Math.round(gap.gap).toLocaleString('es-CL')}.`,
        action:
          'Asegurar o generar recursos y priorizar las obligaciones críticas.'
      });
    }

    if (marginAlert) {
      actions.push({
        priority: 3,
        title: 'Controlar gasto diario',
        problem: marginAlert.message,
        action:
          'Suspender gastos no esenciales hasta recuperar margen.'
      });
    }

    return actions.sort((a, b) => a.priority - b.priority);
  }

  return { build };
})();
