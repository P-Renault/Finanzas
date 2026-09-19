/* Motor de Alertas Financieras */
window.FinancialAlertEngine = (() => {
  function fromMargin(margin) {
    if (margin.excess > 0 || margin.consumedPct >= 100) {
      return { type: 'DAILY_MARGIN_EXCEEDED', severity: 'CRITICAL',
        message: 'LÍMITE DIARIO ALCANZADO. No generes nuevos gastos no esenciales hoy.' };
    }
    if (margin.consumedPct >= 90 || margin.projectedConsumedPct >= 100) {
      return { type: 'DAILY_MARGIN_CRITICAL', severity: 'CRITICAL',
        message: 'Detén gastos no esenciales: el margen diario está prácticamente agotado.' };
    }
    if (margin.consumedPct >= 80 || margin.projectedConsumedPct >= 90) {
      return { type: 'DAILY_MARGIN_CAUTION', severity: 'WARNING',
        message: 'Estás cerca de tu límite diario de gasto.' };
    }
    if (margin.consumedPct >= 70 || margin.projectedConsumedPct >= 80) {
      return { type: 'DAILY_MARGIN_PREVENTIVE', severity: 'INFO',
        message: 'Tu consumo de margen diario requiere atención.' };
    }
    return null;
  }
  return { fromMargin };
})();
