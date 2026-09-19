/* Liquidity Projection Engine — v5.0.0 */
window.LiquidityProjectionEngine = (() => {
  function project(context, state, scenario = 'CONSERVATIVE', days = 90) {
    let balance = Number(state.availableBalance || 0);
    const result = [];

    for (let i = 0; i < days; i++) {
      const date = addDays(context.today, i);
      const day = context.calendar?.[date] || {};

      const assured = Number(day.assuredIncome || 0);

      const projected =
        scenario === 'CONSERVATIVE'
          ? 0
          : Number(day.projectedIncome || 0);

      const planned =
        scenario === 'TARGET'
          ? Number(day.plannedIncome || 0)
          : 0;

      const mandatory = Number(day.mandatoryExpenses || 0);
      const discretionary = Number(day.discretionaryExpenses || 0);

      const opening = balance;

      balance =
        opening +
        assured +
        projected +
        planned -
        mandatory -
        discretionary;

      result.push({
        date,
        openingBalance: opening,
        assuredIncome: assured,
        projectedIncome: projected,
        plannedIncome: planned,
        mandatoryExpenses: mandatory,
        discretionaryExpenses: discretionary,
        closingBalance: balance
      });
    }

    return result;
  }

  function addDays(dateString, days) {
    const d = new Date(`${dateString}T00:00:00`);
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
  }

  function firstRisk(projection, reserve) {
    return projection.find(
      x => x.closingBalance < reserve
    ) || null;
  }

  return { project, firstRisk };
})();
