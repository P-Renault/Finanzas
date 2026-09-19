/* Motor de Brecha Financiera */
window.FinancialGapEngine = (() => {
  function calculate(obligations, resources) {
    const horizon = Number(resources.horizonDays || 90);
    const today = resources.today;
    const end = new Date(`${today}T00:00:00`);
    end.setDate(end.getDate() + horizon);
    const endDate = end.toISOString().slice(0, 10);

    const selected = (obligations || []).filter(x => !x.date || x.date <= endDate);
    const obligationsTotal = selected.reduce((s, x) => s + Number(x.amount || 0), 0);
    const resourcesTotal = Number(resources.available || 0) + Number(resources.assured || 0);

    return {
      obligations: obligationsTotal,
      resources: resourcesTotal,
      gap: Math.max(0, obligationsTotal - resourcesTotal),
      surplus: Math.max(0, resourcesTotal - obligationsTotal),
      covered: resourcesTotal >= obligationsTotal,
      horizonDays: horizon
    };
  }

  return { calculate };
})();
