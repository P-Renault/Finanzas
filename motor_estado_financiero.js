ARCHIVO: motor_estado_financiero.js
LENGUAJE: JavaScript ES2022
EXTENSIÓN DE IMPLEMENTACIÓN: .js
EXTENSIÓN DE ENTREGA: .txt

window.FinancialStateEngine = (() => {
  const amount = x => Number(x?.amount || 0);

  function sumByClass(items, classes) {
    return (items || [])
      .filter(x => classes.includes(x.classification))
      .reduce((sum, x) => sum + amount(x), 0);
  }

  function calculate(context) {
    const incomes = deduplicate(context.incomes || []);
    const expenses = deduplicate(context.expenses || []);

    const realIncome = sumByClass(incomes, ['REAL']);
    const assuredIncome = sumByClass(incomes, ['ASSURED']);
    const projectedIncome = sumByClass(incomes, ['PROJECTED']);

    const paidExpenses = sumByClass(expenses, ['PAID']);
    const committedExpenses = sumByClass(
      expenses,
      ['COMMITTED', 'INSTALLMENT', 'PENDING', 'OVERDUE', 'DUE_SOON']
    );

    const availableBalance =
      Number(context.initialBalance || 0) +
      realIncome -
      paidExpenses;

    const projectedBalance =
      availableBalance +
      assuredIncome +
      projectedIncome -
      committedExpenses;

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

  function deduplicate(items) {
    const map = new Map();
    items.forEach(item => {
      const key = item.sourceId || item.id;
      if (!key || !map.has(key)) map.set(key || crypto.randomUUID(), item);
    });
    return [...map.values()];
  }

  return { calculate };
})();
