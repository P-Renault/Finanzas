/* Centro de Control Financiero — adaptador real de datos
   Lee las tablas existentes de Finanzas y entrega el contrato que consumen
   FinancialStateEngine / LiquidityProjectionEngine / DailySpendingMarginEngine.
   No crea ni modifica datos.
*/
window.FinanceRepository = (() => {
  const today = () => {
    const d = new Date();
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
      .toISOString().slice(0, 10);
  };

  const n = value => Number(value || 0);

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
    } catch (error) {
      console.warn(`[Centro Financiero] ${table}:`, error);
      return [];
    }
  }

  function classifyIncome(row, isFuture) {
    if (!isFuture) return 'REAL';

    const explicit = String(
      row.clasificacion ??
      row.classification ??
      row.tipo_ingreso ??
      row.naturaleza ??
      ''
    ).trim().toUpperCase();

    if (
      explicit.includes('ASEGUR') ||
      explicit.includes('CONFIRM') ||
      explicit.includes('SEGURO') ||
      explicit === 'ASSURED'
    ) return 'ASSURED';

    return 'PROJECTED';
  }

  function classifyExpense(row, isFuture) {
    if (!isFuture) return 'PAID';

    const explicit = String(
      row.clasificacion ??
      row.classification ??
      row.naturaleza ??
      ''
    ).trim().toUpperCase();

    if (explicit.includes('VENCID')) return 'OVERDUE';
    if (explicit.includes('PRÓX') || explicit.includes('PROX')) return 'DUE_SOON';
    if (explicit.includes('CUOTA') || explicit.includes('INSTALL')) return 'INSTALLMENT';

    return 'PROJECTED';
  }

  function amountOf(row) {
    return n(row.monto ?? row.amount ?? row.saldo_actual ?? row.saldo_pendiente);
  }

  function uniqueById(items) {
    const map = new Map();
    for (const item of items || []) {
      const key = item.sourceId || `${item.source || 'x'}:${item.id}`;
      if (!map.has(key)) map.set(key, item);
    }
    return [...map.values()];
  }

  function dateOfCommitment(row) {
    return row.fecha_vencimiento || row.fecha || null;
  }

  async function loadSummaryContext() {
    const db = client();
    if (!db) throw new Error('Supabase no está conectado.');

    const t = today();

    const [accounts, closures, movements, commitments, debts, quotas] =
      await Promise.all([
        select('cuentas_bancarias',
          'id,nombre_banco,nombre_cuenta,saldo_apertura,saldo_actual,fecha_corte,activa',
          q => q.eq('activa', true)
        ),
        select('cierres_financieros',
          'id,nombre,fecha_corte,saldo_inicial,activo',
          q => q.order('fecha_corte', { ascending: false }).limit(5)
        ),
        select('movimientos', '*',
          q => q.order('fecha', { ascending: true })
        ),
        select('compromisos', '*',
          q => q.eq('estado', 'pendiente').order('fecha_vencimiento', { ascending: true })
        ),
        select('deudas', '*',
          q => q
            .gt('saldo_actual', 0)
            .order('fecha_vencimiento', { ascending: true, nullsFirst: false })
        ),
        select('cuotas_deuda', '*',
          q => q
            .in('estado', ['pendiente', 'vencida'])
            .order('fecha_vencimiento', { ascending: true })
        )
      ]);

    /*
     * Liquidez real:
     * - suma de saldos actuales de cuentas activas;
     * - agrega el efectivo de apertura cuando existe un Cero Financiero.
     *
     * No se suma saldo_inicial completo porque este ya incluye los saldos
     * bancarios de apertura y produciría doble conteo.
     */
    const activeAccounts = accounts.filter(a => a.activa !== false);
    const bankCurrent = activeAccounts.reduce((s, a) => s + n(a.saldo_actual), 0);

    const latestClosure = closures.find(c => c.activo !== false) || closures[0] || null;
    const openingBank = latestClosure
      ? activeAccounts
          .filter(a => a.fecha_corte === latestClosure.fecha_corte)
          .reduce((s, a) => s + n(a.saldo_apertura), 0)
      : 0;

    const openingTotal = latestClosure ? n(latestClosure.saldo_inicial) : 0;
    const cashOpening = Math.max(0, openingTotal - openingBank);

    /*
     * El efectivo no tiene una tabla independiente en esta versión.
     * Lo mantenemos como componente de apertura y no lo hacemos crecer
     * automáticamente con movimientos, evitando inventar liquidez.
     */
    const initialBalance = bankCurrent + cashOpening;

    const incomes = [];
    const expenses = [];

    for (const row of movements) {
      const date = row.fecha;
      if (!date) continue;

      const item = {
        id: row.id,
        sourceId: `movimiento:${row.id}`,
        source: 'movimientos',
        amount: amountOf(row),
        date,
        classification: date <= t
          ? classifyIncome(row, false)
          : classifyIncome(row, true),
        row
      };

      if (String(row.tipo).toLowerCase() === 'ingreso') {
        incomes.push(item);
      } else if (String(row.tipo).toLowerCase() === 'gasto') {
        item.classification = date <= t
          ? classifyExpense(row, false)
          : classifyExpense(row, true);
        expenses.push(item);
      }
    }

    /*
     * Compromisos futuros son obligaciones obligatorias.
     * Las deudas se incorporan mediante cuotas cuando existen.
     * Una deuda sin cuotas mantiene su saldo como obligación, pero solo
     * se proyecta dentro del horizonte si posee vencimiento.
     */
    const obligations = [];

    for (const row of commitments) {
      const date = dateOfCommitment(row);
      if (!date) continue;

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

    const quotaDebtIds = new Set();

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
        classification: q.estado === 'vencida' || date < t
          ? 'OVERDUE'
          : 'INSTALLMENT',
        concept: `Cuota de deuda #${q.numero_cuota ?? ''}`.trim()
      });
    }

    /*
     * Deudas sin calendario de cuotas:
     * solo se incorpora el saldo si tienen vencimiento. Las deudas sin
     * fecha siguen siendo patrimonio/obligación, pero no se inventa un día.
     */
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

    /*
     * Calendario consolidado para el motor de liquidez.
     */
    const calendar = {};

    function day(date) {
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
    }

    for (const income of incomes) {
      if (income.date < t) continue;
      const target = day(income.date);
      if (income.classification === 'ASSURED') {
        target.assuredIncome += income.amount;
      } else if (income.classification === 'PROJECTED') {
        target.projectedIncome += income.amount;
      }
    }

    for (const obligation of obligations) {
      if (obligation.date < t) {
        /*
         * Un vencido se mantiene como obligación inmediata: se coloca en
         * hoy para que la proyección no lo pierda.
         */
        day(t).mandatoryExpenses += obligation.amount;
      } else {
        day(obligation.date).mandatoryExpenses += obligation.amount;
      }
    }

    const paidToday = expenses
      .filter(x => x.date === t)
      .reduce((s, x) => s + x.amount, 0);

    /*
     * Reserva mínima configurable:
     * usa localStorage si el usuario ya definió una reserva;
     * en ausencia de configuración, 10% de la liquidez actual.
     */
    const storedReserve = Number(localStorage.getItem('finance_minimum_reserve') || 0);
    const minimumReserve = storedReserve > 0
      ? storedReserve
      : Math.round(Math.max(0, initialBalance) * 0.10);

    const storedSafety = Number(localStorage.getItem('finance_safety_buffer_pct') || 10);
    const safetyBufferPct = Math.min(50, Math.max(0, storedSafety));

    const context = {
      today: t,
      initialBalance,
      minimumReserve,
      safetyBufferPct,
      incomes: uniqueById(incomes),
      expenses: uniqueById(expenses),
      obligations: uniqueById(obligations),
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
        accounts: activeAccounts,
        latestClosure,
        movements: movements.length,
        commitments: commitments.length,
        debts: debts.length,
        quotas: quotas.length
      }
    };

    window.__minimumReserve = minimumReserve;
    window.__financialSummaryDiagnostics = context.diagnostics;

    return context;
  }

  return { loadSummaryContext };
})();
