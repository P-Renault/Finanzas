/* Financial State Engine — v5.0.0 */
window.FinancialStateEngine = (() => {
  const amount = x => Number(x?.amount || 0);

  function sumByClass(items, classes) {
    return (items || [])
      .filter(x => classes.includes(x.classification))
      .reduce((sum, x) => sum + amount(x), 0);
  }

  function calculate(context) {
    const incomes = context.incomes || [];
    const expenses = context.expenses || [];
    const obligations = context.obligations || [];

    const realIncome = sumByClass(incomes, ['REAL']);
    const assuredIncome = sumByClass(incomes, ['ASSURED']);
    const projectedIncome = sumByClass(incomes, ['PROJECTED']);

    const paidExpenses = sumByClass(expenses, ['PAID']);

    /*
     * Las obligaciones salen de compromisos/cuotas/deudas.
     * No se calculan desde movements, porque un compromiso futuro todavía
     * no es un gasto pagado.
     */
    const committedExpenses = obligations.reduce(
      (sum, x) => sum + amount(x),
      0
    );

    /*
     * IMPORTANTE:
     * context.initialBalance ya representa el saldo actual de bancos + caja.
     * No sumamos ingresos históricos ni restamos gastos históricos nuevamente.
     */
    const availableBalance = Number(context.initialBalance || 0);

    const projectedBalance =
      availableBalance +
      assuredIncome +
      projectedIncome -
      committedExpenses;

    const financialGap = Math.max(
      0,
      committedExpenses -
      (availableBalance + assuredIncome)
    );

    const coverageRatio =
      committedExpenses > 0
        ? (availableBalance + assuredIncome) / committedExpenses
        : Infinity;

    return {
      realIncome,
      assuredIncome,
      projectedIncome,
      paidExpenses,
      committedExpenses,
      availableBalance,
      projectedBalance,
      financialGap,
      coverageRatio
    };
  }

  return { calculate };
})();
