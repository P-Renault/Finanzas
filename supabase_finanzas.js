/* Centro de Control Financiero — Data Adapter v5.0.0 */
window.FinanceRepository = (() => {
  const today = () => {
    const d = new Date();
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
      .toISOString().slice(0, 10);
  };

  const n = v => {
    const x = Number(v);
    return Number.isFinite(x) ? x : 0;
  };

  function client() {
    if (window.supabaseClient) return window.supabaseClient;
    const url = localStorage.getItem('sf_url');
    const key = localStorage.getItem('sf_key');

    if (!url || !key || !window.supabase?.createClient) return null;

    window.supabaseClient = window.supabase.createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false }
    });

    return window.supabaseClient;
  }

  async function select(table) {
    const db = client();
    if (!db) throw new Error('Supabase no está conectado.');

    const { data, error } = await db.from(table).select('*');

    if (error) throw new Error(`${table}: ${error.message}`);

    return data || [];
  }

  const movementAmount = row => n(row?.monto ?? row?.amount);

  const debtBalance = row =>
    n(row?.saldo_pendiente ?? row?.saldo_actual ?? row?.saldo ?? row?.monto_original);

  function normalizeState(v) {
    return String(v ?? '').trim().toLowerCase();
  }

  function classification(row) {
    return String(
      row?.clasificacion ??
      row?.classification ??
      row?.tipo_ingreso ??
      row?.naturaleza ??
      ''
    ).trim().toUpperCase();
  }

  function incomeClass(row, isFuture) {
    if (!isFuture) return 'REAL';

    const x = classification(row);

    return (
      x.includes('ASEGUR') ||
      x.includes('CONFIRM') ||
      x.includes('SEGURO') ||
      x === 'ASSURED'
    ) ? 'ASSURED' : 'PROJECTED';
  }

  function dedupe(items, keyFn) {
    const map = new Map();

    for (const item of items) {
      const key = keyFn(item);

      if (!map.has(key)) map.set(key, item);
    }

    return [...map.values()];
  }

  function obligationKey(x) {
    return [
      x.date,
      Math.round(x.amount),
      String(x.concept || '').trim().toUpperCase()
    ].join('|');
  }

  async function loadSummaryContext() {
    const t = today();

    const tables = [
      'cuentas_bancarias',
      'cierres_financieros',
      'movimientos',
      'compromisos',
      'deudas',
      'cuotas_deuda',
      'pagos_deuda'
    ];

    const results = await Promise.allSettled(tables.map(select));
    const data = {};
    const errors = [];

    results.forEach((result, i) => {
      if (result.status === 'fulfilled') {
        data[tables[i]] = result.value;
      } else {
        data[tables[i]] = [];
        errors.push(`${tables[i]}: ${result.reason?.message || result.reason}`);
      }
    });

    const accounts = (data.cuentas_bancarias || [])
      .filter(a => a.activa !== false);

    const closures = data.cierres_financieros || [];
    const movements = data.movimientos || [];
    const rawCommitments = data.compromisos || [];
    const rawDebts = data.deudas || [];
    const rawQuotas = data.cuotas_deuda || [];
    const debtPayments = data.pagos_deuda || [];

    /*
     * SALDO REAL:
     * Las tablas de cuentas representan el saldo actual.
     * NO volvemos a sumar el historial de movimientos, porque eso produciría
     * doble contabilización.
     */
    const bankCurrent = accounts.reduce(
      (sum, account) => sum + n(account.saldo_actual),
      0
    );

    const latestClosure =
      [...closures]
        .filter(c => c.activo !== false)
        .sort((a, b) =>
          String(b.fecha_corte || '').localeCompare(String(a.fecha_corte || ''))
        )[0] || null;

    const cashField =
      latestClosure?.saldo_efectivo_actual ??
      latestClosure?.efectivo_actual;

    const cashCurrent = cashField == null ? 0 : n(cashField);

    const availableBalance = bankCurrent + cashCurrent;

    /*
     * Movimientos: solo sirven para actividad/ingresos/gastos.
     * El saldo disponible ya proviene de cuentas + caja actual.
     */
    const debtPaymentMovementIds = new Set(
      debtPayments
        .map(p => String(p.movimiento_id ?? p.movimientoId ?? ''))
        .filter(Boolean)
    );

    const incomes = [];
    const expenses = [];

    for (const row of movements) {
      if (!row.fecha) continue;

      const date = String(row.fecha).slice(0, 10);
      const type = normalizeState(row.tipo);

      if (type === 'ingreso') {
        incomes.push({
          id: row.id,
          sourceId: `movimiento:${row.id}`,
          source: 'movimientos',
          amount: movementAmount(row),
          date,
          classification: incomeClass(row, date > t),
          row
        });
      }

      if (type === 'gasto') {
        expenses.push({
          id: row.id,
          sourceId: `movimiento:${row.id}`,
          source: 'movimientos',
          amount: movementAmount(row),
          date,
          classification: date > t ? 'PROJECTED' : 'PAID',
          isDebtPayment: debtPaymentMovementIds.has(String(row.id)),
          row
        });
      }
    }

    /*
     * Deudas con cuotas: la obligación proyectable se representa por sus
     * cuotas, no por el saldo total de la deuda.
     */
    const quotaDebtIds = new Set();

    const quotas = rawQuotas.filter(q => {
      const state = normalizeState(q.estado);

      const valid =
        ['pendiente', 'vencida', 'atrasada'].includes(state) &&
        n(q.monto) > 0 &&
        q.fecha_vencimiento;

      if (valid && q.deuda_id != null) {
        quotaDebtIds.add(String(q.deuda_id));
      }

      return valid;
    });

    const obligations = [];

    for (const row of rawCommitments) {
      const state = normalizeState(row.estado);

      if (state && state !== 'pendiente') continue;

      const date = String(
        row.fecha_vencimiento ?? row.fecha ?? ''
      ).slice(0, 10);

      const amount = n(row.monto ?? row.amount);

      if (!date || amount <= 0) continue;

      /*
       * Evita incorporar un compromiso que explícitamente pertenece
       * a una cuota/deuda.
       */
      if (row.deuda_id || row.cuota_id || row.cuota_deuda_id) continue;

      obligations.push({
        id: row.id,
        sourceId: `compromiso:${row.id}`,
        source: 'compromisos',
        amount,
        date,
        classification: date < t ? 'OVERDUE' : 'COMMITTED',
        concept:
          row.concepto ||
          row.descripcion ||
          row.categoria ||
          'Compromiso'
      });
    }

    for (const q of quotas) {
      const date = String(q.fecha_vencimiento).slice(0, 10);

      obligations.push({
        id: q.id,
        sourceId: `cuota:${q.id}`,
        source: 'cuotas_deuda',
        amount: n(q.monto),
        date,
        classification:
          ['vencida', 'atrasada'].includes(normalizeState(q.estado)) ||
          date < t
            ? 'OVERDUE'
            : 'INSTALLMENT',
        concept:
          q.descripcion ||
          `Cuota de deuda #${q.numero_cuota ?? ''}`.trim()
      });
    }

    /*
     * Deudas sin cuotas asociadas: solo usamos vencimiento explícito.
     * Nunca inventamos fechas.
     */
    for (const d of rawDebts) {
      if (quotaDebtIds.has(String(d.id))) continue;

      const balance = debtBalance(d);
      const date = String(d.fecha_vencimiento || '').slice(0, 10);

      if (balance <= 0 || !date) continue;

      obligations.push({
        id: d.id,
        sourceId: `deuda:${d.id}`,
        source: 'deudas',
        amount: balance,
        date,
        classification: date < t ? 'OVERDUE' : 'COMMITTED',
        concept:
          d.acreedor ||
          d.nombre ||
          d.descripcion ||
          'Deuda'
      });
    }

    const uniqueObligations = dedupe(obligations, obligationKey);

    /*
     * Calendario de proyección.
     */
    const calendar = {};

    const day = date => {
      if (!calendar[date]) {
        calendar[date] = {
          assuredIncome: 0,
          projectedIncome: 0,
          plannedIncome: 0,
          mandatoryExpenses: 0,
          discretionaryExpenses: 0
        };
      }

      return calendar[date];
    };

    for (const income of incomes) {
      if (income.date <= t) continue;

      const d = day(income.date);

      if (income.classification === 'ASSURED') {
        d.assuredIncome += income.amount;
      } else {
        d.projectedIncome += income.amount;
      }
    }

    for (const obligation of uniqueObligations) {
      if (obligation.date < t) {
        day(t).mandatoryExpenses += obligation.amount;
      } else {
        day(obligation.date).mandatoryExpenses += obligation.amount;
      }
    }

    /*
     * Gasto discrecional real de hoy:
     * pagos de deuda NO consumen el margen diario discrecional.
     */
    const paidToday = expenses
      .filter(x => x.date === t && !x.isDebtPayment)
      .reduce((sum, x) => sum + x.amount, 0);

    const storedReserve = n(
      localStorage.getItem('finance_minimum_reserve')
    );

    const minimumReserve =
      storedReserve > 0
        ? storedReserve
        : Math.round(Math.max(0, availableBalance) * 0.10);

    const configuredSafety = n(
      localStorage.getItem('finance_safety_buffer_pct')
    );

    const safetyBufferPct =
      configuredSafety > 0
        ? Math.min(50, configuredSafety)
        : 10;

    const diagnostics = {
      version: 'CCF-V5.0.0',
      errors,
      accounts: accounts.length,
      closures: closures.length,
      movements: movements.length,
      commitments: rawCommitments.length,
      debts: rawDebts.length,
      quotas: rawQuotas.length,
      debtPayments: debtPayments.length,
      bankCurrent,
      cashCurrent,
      availableBalance,
      uniqueObligations: uniqueObligations.length,
      latestClosure
    };

    window.__financialSummaryDiagnostics = diagnostics;

    /*
     * Si las tablas principales no pudieron leerse, detenemos el cálculo.
     * Un error de lectura nunca debe convertirse en $0.
     */
    const successfulSources = [
      accounts.length,
      movements.length,
      rawCommitments.length,
      rawDebts.length,
      rawQuotas.length
    ].reduce((sum, x) => sum + x, 0);

    if (successfulSources === 0 && errors.length) {
      throw new Error(
        'No se pudieron leer las fuentes financieras: ' +
        errors.join(' | ')
      );
    }


    // Executive debt backlog: preserve debts without dates; never invent a start date.
    const debtPlanning = debts.map(d => {
      const balance = n(
        d.saldo_pendiente ?? d.saldo_actual ?? d.saldo ??
        d.monto_original ?? d.monto
      );
      const startDate = String(
        d.fecha_inicio ??
        d.fecha_inicio_pago ??
        d.fecha_primer_pago ??
        d.inicio_pago ??
        d.fecha_inicio_negociacion ??
        ''
      ).slice(0,10);
      const dueDate = String(
        d.fecha_vencimiento ??
        d.proximo_vencimiento ??
        d.fecha_proximo_pago ??
        ''
      ).slice(0,10);
      const state = String(
        d.estado ?? d.status ?? d.estado_deuda ?? ''
      ).trim().toLowerCase();

      const negotiation =
        state.includes('negoci') ||
        state.includes('renegoci') ||
        state.includes('por negociar') ||
        state.includes('acuerdo pendiente');

      const unpaid =
        !negotiation &&
        (
          !state ||
          state.includes('pendiente') ||
          state.includes('vencid') ||
          state.includes('atras') ||
          state.includes('activo') ||
          state.includes('vigente')
        );

      return {
        id: d.id,
        creditor: d.acreedor || d.nombre || d.descripcion || 'Deuda',
        amount: balance,
        originalAmount: n(d.monto_original ?? d.monto),
        startDate: startDate || null,
        dueDate: dueDate || null,
        state: state || 'sin estado',
        negotiation,
        unpaid,
        noStartDate: !startDate,
        row: d
      };
    }).filter(d => d.amount > 0);

    const currentMonth = t.slice(0,7);
    const currentMonthDebts = debtPlanning.filter(d =>
      (d.dueDate && d.dueDate.slice(0,7) === currentMonth) ||
      (d.startDate && d.startDate.slice(0,7) === currentMonth)
    );

    const debtPlanningSummary = {
      currentMonth: {
        count: currentMonthDebts.length,
        amount: currentMonthDebts.reduce((s,d)=>s+d.amount,0)
      },
      negotiation: {
        count: debtPlanning.filter(d=>d.negotiation).length,
        amount: debtPlanning.filter(d=>d.negotiation).reduce((s,d)=>s+d.amount,0)
      },
      unpaid: {
        count: debtPlanning.filter(d=>d.unpaid).length,
        amount: debtPlanning.filter(d=>d.unpaid).reduce((s,d)=>s+d.amount,0)
      },
      noStartDate: {
        count: debtPlanning.filter(d=>d.noStartDate).length,
        amount: debtPlanning.filter(d=>d.noStartDate).reduce((s,d)=>s+d.amount,0)
      }
    };

    return {
      today: t,

      /*
       * Este es el saldo realmente disponible según las cuentas/caja actuales.
       */
      initialBalance: availableBalance,

      minimumReserve,
      safetyBufferPct,

      incomes,
      expenses,
      obligations: uniqueObligations,
      debtPlanning,
      debtPlanningSummary,
      calendar,

      marginInput: {
        protectedLiquidity: Math.max(0, availableBalance),
        minimumReserve,
        discretionarySpent: paidToday,
        safetyBufferPct,
        projectedSpendRatePerHour: 0,
        remainingHours: 0
      },

      diagnostics
    };
  }

  return { loadSummaryContext };
})();
