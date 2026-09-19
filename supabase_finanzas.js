/* Centro de Control Financiero — adaptador real de datos v3 */
window.FinanceRepository = (() => {
  const today = () => {
    const d = new Date();
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  };
  const n = v => Number(v || 0);

  function client() {
    if (window.supabaseClient) return window.supabaseClient;
    const url = localStorage.getItem('sf_url');
    const key = localStorage.getItem('sf_key');
    if (!url || !key || !window.supabase) return null;
    window.supabaseClient = window.supabase.createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
    return window.supabaseClient;
  }

  async function select(table, columns = '*', configure = q => q) {
    const db = client();
    if (!db) return [];
    try {
      const result = await configure(db.from(table).select(columns));
      if (result.error) {
        console.warn(`[Centro Financiero] ${table}: ${result.error.message}`);
        return [];
      }
      return result.data || [];
    } catch (e) {
      console.warn(`[Centro Financiero] ${table}:`, e);
      return [];
    }
  }

  const amountOf = row => n(row.monto ?? row.amount ?? row.saldo_actual ?? row.saldo_pendiente);

  function classification(row) {
    return String(
      row.clasificacion ?? row.classification ?? row.tipo_ingreso ??
      row.naturaleza ?? row.tipo ?? ''
    ).trim().toUpperCase();
  }

  function incomeClass(row, future) {
    if (!future) return 'REAL';
    const x = classification(row);
    if (x.includes('ASEGUR') || x.includes('CONFIRM') || x.includes('SEGURO') || x === 'ASSURED') return 'ASSURED';
    return 'PROJECTED';
  }

  function expenseClass(row, future) {
    if (!future) return 'PAID';
    const x = classification(row);
    if (x.includes('VENCID')) return 'OVERDUE';
    if (x.includes('CUOTA') || x.includes('INSTALL')) return 'INSTALLMENT';
    if (x.includes('PRÓX') || x.includes('PROX')) return 'DUE_SOON';
    return 'PROJECTED';
  }

  function uniqueBySource(items) {
    const m = new Map();
    for (const x of items || []) {
      const key = x.sourceId || `${x.source || 'x'}:${x.id}`;
      if (!m.has(key)) m.set(key, x);
    }
    return [...m.values()];
  }

  async function loadSummaryContext() {
    const db = client();
    if (!db) throw new Error('Supabase no está conectado.');

    const t = today();

    const [accounts, closures, movements, commitments, debts, quotas, debtPayments] =
      await Promise.all([
        select('cuentas_bancarias',
          'id,nombre_banco,nombre_cuenta,saldo_apertura,saldo_actual,fecha_corte,activa',
          q => q.eq('activa', true)),
        select('cierres_financieros',
          'id,nombre,fecha_corte,saldo_inicial,activo',
          q => q.order('fecha_corte', { ascending: false }).limit(5)),
        select('movimientos', '*',
          q => q.order('fecha', { ascending: true })),
        select('compromisos', '*',
          q => q.eq('estado', 'pendiente').order('fecha_vencimiento', { ascending: true })),
        select('deudas', '*',
          q => q.gt('saldo_actual', 0).order('fecha_vencimiento', { ascending: true, nullsFirst: false })),
        select('cuotas_deuda', '*',
          q => q.in('estado', ['pendiente', 'vencida']).order('fecha_vencimiento', { ascending: true })),
        select('pagos_deuda', '*')
      ]);

    const bankCurrent = accounts.reduce((s, a) => s + n(a.saldo_actual), 0);
    const latestClosure = closures.find(c => c.activo !== false) || closures[0] || null;
    const openingBank = latestClosure
      ? accounts.filter(a => a.fecha_corte === latestClosure.fecha_corte)
          .reduce((s, a) => s + n(a.saldo_apertura), 0)
      : 0;
    const openingTotal = latestClosure ? n(latestClosure.saldo_inicial) : 0;
    const cashOpening = Math.max(0, openingTotal - openingBank);

    // Los saldos actuales ya contienen el efecto histórico de movimientos.
    // Por eso NO se vuelve a sumar/restar el historial para calcular liquidez actual.
    const initialBalance = bankCurrent + cashOpening;

    const debtPaymentMovementIds = new Set(
      debtPayments.map(p => String(p.movimiento_id ?? p.movimientoId ?? '')).filter(Boolean)
    );

    const incomes = [];
    const expenses = [];

    for (const row of movements) {
      if (!row.fecha) continue;
      const type = String(row.tipo || '').toLowerCase();
      const item = {
        id: row.id,
        sourceId: `movimiento:${row.id}`,
        source: 'movimientos',
        amount: amountOf(row),
        date: row.fecha,
        row
      };

      if (type === 'ingreso') {
        item.classification = incomeClass(row, row.fecha > t);
        incomes.push(item);
      } else if (type === 'gasto') {
        item.classification = expenseClass(row, row.fecha > t);
        item.isDebtPayment = debtPaymentMovementIds.has(String(row.id));
        expenses.push(item);
      }
    }

    const obligations = [];
    const quotaDebtIds = new Set();

    for (const row of commitments) {
      const date = row.fecha_vencimiento || row.fecha || null;
      if (!date || amountOf(row) <= 0) continue;

      // Si el compromiso tiene vínculo explícito con deuda/cuota, la cuota es la fuente canónica.
      if (row.deuda_id || row.cuota_id || row.cuota_deuda_id) continue;

      obligations.push({
        id: row.id,
        sourceId: `compromiso:${row.id}`,
        source: 'compromisos',
        amount: amountOf(row),
        date,
        classification: date < t ? 'OVERDUE' : 'COMMITTED',
        concept: row.concepto || row.descripcion || row.categoria || 'Compromiso'
      });
    }

    for (const q of quotas) {
      const date = q.fecha_vencimiento;
      if (!date || n(q.monto) <= 0) continue;
      quotaDebtIds.add(String(q.deuda_id));

      obligations.push({
        id: q.id,
        sourceId: `cuota:${q.id}`,
        source: 'cuotas_deuda',
        amount: n(q.monto),
        date,
        classification: q.estado === 'vencida' || date < t ? 'OVERDUE' : 'INSTALLMENT',
        concept: `Cuota de deuda #${q.numero_cuota ?? ''}`.trim()
      });
    }

    for (const d of debts) {
      if (quotaDebtIds.has(String(d.id))) continue;
      if (!d.fecha_vencimiento || n(d.saldo_actual) <= 0) continue;

      obligations.push({
        id: d.id,
        sourceId: `deuda:${d.id}`,
        source: 'deudas',
        amount: n(d.saldo_actual),
        date: d.fecha_vencimiento,
        classification: d.fecha_vencimiento < t ? 'OVERDUE' : 'COMMITTED',
        concept: d.acreedor || d.nombre || 'Deuda'
      });
    }

    const calendar = {};
    const day = date => {
      if (!calendar[date]) calendar[date] = {
        assuredIncome: 0, projectedIncome: 0, plannedIncome: 0,
        mandatoryExpenses: 0, discretionaryExpenses: 0
      };
      return calendar[date];
    };

    for (const x of incomes) {
      if (x.date < t) continue;
      const d = day(x.date);
      if (x.classification === 'ASSURED') d.assuredIncome += x.amount;
      else d.projectedIncome += x.amount;
    }

    for (const x of obligations) {
      day(x.date < t ? t : x.date).mandatoryExpenses += x.amount;
    }

    const paidToday = expenses
      .filter(x => x.date === t && !x.isDebtPayment)
      .reduce((s, x) => s + x.amount, 0);

    const storedReserve = Number(localStorage.getItem('finance_minimum_reserve') || 0);
    const minimumReserve = storedReserve > 0
      ? storedReserve
      : Math.round(Math.max(0, initialBalance) * 0.10);

    const safetyBufferPct = Math.min(
      50,
      Math.max(0, Number(localStorage.getItem('finance_safety_buffer_pct') || 10))
    );

    const context = {
      today: t,
      initialBalance,
      minimumReserve,
      safetyBufferPct,
      incomes: uniqueBySource(incomes),
      expenses: uniqueBySource(expenses),
      obligations: uniqueBySource(obligations),
      calendar,
      marginInput: {
        protectedLiquidity: Math.max(0, initialBalance),
        minimumReserve,
        discretionarySpent: paidToday,
        safetyBufferPct,
        projectedSpendRatePerHour: 0,
        remainingHours: 0
      },
      diagnostics: {
        bankCurrent,
        cashOpening,
        openingTotal,
        accounts,
        latestClosure,
        movements: movements.length,
        commitments: commitments.length,
        debts: debts.length,
        quotas: quotas.length,
        debtPayments: debtPayments.length
      }
    };

    window.__minimumReserve = minimumReserve;
    window.__financialSummaryDiagnostics = context.diagnostics;
    return context;
  }

  return { loadSummaryContext };
})();
