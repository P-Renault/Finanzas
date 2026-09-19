/* Motor de Acciones Prioritarias */
window.FinancialActionEngine = (() => {
  function build({ risk, gap, marginAlert, nextNeed }) {
    const actions = [];

    if (risk) actions.push({
      priority: 1,
      title: 'Proteger liquidez',
      problem: `La liquidez proyectada cae bajo la reserva el ${risk.date}.`,
      action: 'Reducir gasto discrecional y asegurar recursos antes de esa fecha.'
    });

    if (gap?.gap > 0) actions.push({
      priority: 2,
      title: 'Cerrar brecha financiera',
      problem: `Existe una brecha de $${Math.round(gap.gap).toLocaleString('es-CL')}.`,
      action: 'Asegurar o generar recursos y priorizar las obligaciones críticas.'
    });

    if (nextNeed) actions.push({
      priority: 3,
      title: 'Preparar próxima obligación',
      problem: `${nextNeed.concept} por $${Math.round(nextNeed.amount).toLocaleString('es-CL')} vence ${nextNeed.date}.`,
      action: 'Reservar o generar los recursos necesarios antes del vencimiento.'
    });

    if (marginAlert) actions.push({
      priority: 4,
      title: 'Controlar gasto diario',
      problem: marginAlert.message,
      action: 'Suspender gastos no esenciales hasta recuperar margen.'
    });

    return actions.sort((a, b) => a.priority - b.priority);
  }

  return { build };
})();
