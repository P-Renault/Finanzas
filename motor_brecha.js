/* Financial Gap Engine — v5.0.0 */
window.FinancialGapEngine = (() => {
  function calculate(obligations, resources) {
    const obligationsTotal = (obligations || [])
      .reduce((sum, x) => sum + Number(x.amount || 0), 0);

    const resourcesTotal =
      Number(resources?.available || 0) +
      Number(resources?.assured || 0);

    return {
      obligations: obligationsTotal,
      resources: resourcesTotal,
      gap: Math.max(0, obligationsTotal - resourcesTotal),
      surplus: Math.max(0, resourcesTotal - obligationsTotal),
      covered: resourcesTotal >= obligationsTotal
    };
  }

  return { calculate };
})();
