/* Motor de Estado Financiero — implementación */
window.FinancialStateEngine = (() => {
  const amount = x => Number(x?.amount || 0);

  function calculate(context) {
    const incomes = context.incomes || [];
    const expenses = context.expenses || [];
    const obligations = context.obligations || [];

    const realIncome = incomes.filter(x => x.classification === 'REAL')
      .reduce((s, x) => s + amount(x), 0);
    const assuredIncome = incomes.filter(x => x.classification === 'ASSURED')
      .reduce((s, x) => s + amount(x), 0);
    const projectedIncome = incomes.filter(x => x.classification === 'PROJECTED')
      .reduce((s, x) => s + amount(x), 0);

    const paidExpenses = expenses.filter(x => x.classification === 'PAID')
      .reduce((s, x) => s + amount(x), 0);

    const committedExpenses = obligations
      .reduce((s, x) => s + amount(x), 0);

    // initialBalance es liquidez actual; no se le vuelve a aplicar el historial.
    const availableBalance = Number(context.initialBalance || 0);

    const projectedBalance =
      availableBalance + assuredIncome + projectedIncome - committedExpenses;

    const financialGap = Math.max(
      0,
      committedExpenses - (availableBalance + assuredIncome)
    );

    const coverageRatio = committedExpenses > 0
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
