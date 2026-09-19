/* Centro de Control Financiero — adaptador real de datos v4 */
window.FinanceRepository = (() => {
  const today = () => {
    const d = new Date();
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  };
  const n = v => Number(v ?? 0) || 0;

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

  async function select(table, columns = '*', configure = q => q) {
    const db = client();
    if (!db) throw new Error('Supabase no está conectado.');
    const query = configure(db.from(table).select(columns));
    const result = await query;
    if (result.error) {
      throw new Error(`${table}: ${result.error.message}`);
    }
    return result.data || [];
  }

  const amountOf = row => n(
    row?.monto ?? row?.amount ?? row?.saldo_actual ?? row?.saldo_pendiente ?? row?.saldo
  );

  function classification(row) {
    return String(
      row?.clasificacion ?? row?.classification ?? row?.tipo_ingreso ?? row?.naturaleza ?? row?.tipo ?? ''
    ).trim().toUpperCase();
  }

  function incomeClass(row, future) {
    if (!future) return 'REAL';
    const x = classification(row);
    return x.includes('ASEGUR') || x.includes('CONFIRM') || x.includes('SEGURO') || x === 'ASSURED'
      ? 'ASSURED' : 'PROJECTED';
  }

  function uniqueBySource(items) {
    const map = new Map();
    for (const item of items || []) {
      const key = item.sourceId || `${item.source || 'x'}:${item.id}`;
      if (!map.has(key)) map.set(key, item);
    }
    return [...map.values()];
  }

  async function loadSummaryContext() {
    const t = today();
    const db = client();
    if (!db) throw new Error('Supabase no está conectado.');

    // Consultamos tablas sin filtros sobre columnas potencialmente variables.
    // Los filtros se aplican después de recibir los datos. Así un cambio menor
    // de esquema no convierte todo el Centro de Control en $0 silenciosamente.
    const results = await Promise.allSettled([
      select('cuentas_bancarias', '*'),
      select('cierres_financieros', '*'),
      select('movimientos', '*'),
      select('compromisos', '*'),
      select('deudas', '*'),
      select('cuotas_deuda', '*'),
      select('pagos_deuda', '*')
    ]);

    const names = ['cuentas_bancarias','cierres_financieros','movimientos','compromisos','deudas','cuotas_deuda','pagos_deuda'];
    const data = {};
    const errors = [];
    results.forEach((r, i) => {
      if (r.status === 'fulfilled') data[names[i]] = r.value || [];
      else { data[names[i]] = []; errors.push(`${names[i]}: ${r.reason?.message || r.reason}`); }
    });

    const accounts = data.cuentas_bancarias.filter(a => a.activa !== false);
    const closures = data.cierres_financieros;
    const movements = data.movimientos;
    const commitments = data.compromisos.filter(r => String(r.estado || 'pendiente').toLowerCase() === 'pendiente');
    const debts = data.deudas.filter(d => amountOf(d) > 0);
    const quotas = data.cuotas_deuda.filter(q => {
      const state = String(q.estado || 'pendiente').toLowerCase();
      return ['pendiente','vencida','atrasada'].includes(state) && n(q.monto) > 0;
    });
    const debtPayments = data.pagos_deuda;

    const bankCurrent = accounts.reduce((s, a) => s + n(a.saldo_actual), 0);
    const latestClosure = [...closures]
      .filter(c => c.activo !== false)
      .sort((a,b) => String(b.fecha_corte || '').localeCompare(String(a.fecha_corte || '')))[0] || null;

    // saldo_efectivo_actual es la fuente actual de caja cuando existe.
    // Nunca usamos saldo_inicial histórico como efectivo actual si ya existe
    // una columna de caja actual; evita inflar la liquidez con los $50 de apertura.
    const cashCurrentRaw = latestClosure?.saldo_efectivo_actual ?? latestClosure?.efectivo_actual ?? null;
    const cashCurrent = cashCurrentRaw != null ? n(cashCurrentRaw) : 0;
    const openingTotal = n(latestClosure?.saldo_inicial);
    const openingBank = latestClosure
      ? accounts.filter(a => String(a.fecha_corte || '') === String(latestClosure.fecha_corte || ''))
          .reduce((s,a) => s + n(a.saldo_apertura), 0)
      : 0;
    const cashOpening = Math.max(0, openingTotal - openingBank);
    const initialBalance = bankCurrent + cashCurrent;

    const debtPaymentMovementIds = new Set(
      debtPayments.map(p => String(p.movimiento_id ?? p.movimientoId ?? '')).filter(Boolean)
    );

    const incomes = [];
    const expenses = [];
    for (const row of movements) {
      if (!row.fecha) continue;
      const type = String(row.tipo || '').toLowerCase();
      const item = {
        id: row.id, sourceId: `movimiento:${row.id}`, source: 'movimientos',
        amount: amountOf(row), date: String(row.fecha).slice(0,10), row
      };
      if (type === 'ingreso') {
        item.classification = incomeClass(row, item.date > t);
        incomes.push(item);
      } else if (type === 'gasto') {
        item.classification = item.date > t ? 'PROJECTED' : 'PAID';
        item.isDebtPayment = debtPaymentMovementIds.has(String(row.id));
        expenses.push(item);
      }
    }

    const obligations = [];
    const quotaDebtIds = new Set();

    for (const row of commitments) {
      const date = String(row.fecha_vencimiento || row.fecha || '').slice(0,10);
      const amount = amountOf(row);
      if (!date || amount <= 0) continue;
      if (row.deuda_id || row.cuota_id || row.cuota_deuda_id) continue;
      obligations.push({
        id: row.id, sourceId: `compromiso:${row.id}`, source: 'compromisos',
        amount, date, classification: date < t ? 'OVERDUE' : 'COMMITTED',
        concept: row.concepto || row.descripcion || row.categoria || 'Compromiso'
      });
    }

    for (const q of quotas) {
      const date = String(q.fecha_vencimiento || '').slice(0,10);
      if (!date || n(q.monto) <= 0) continue;
      if (q.deuda_id != null) quotaDebtIds.add(String(q.deuda_id));
      obligations.push({
        id: q.id, sourceId: `cuota:${q.id}`, source: 'cuotas_deuda', amount: n(q.monto), date,
        classification: ['vencida','atrasada'].includes(String(q.estado || '').toLowerCase()) || date < t ? 'OVERDUE' : 'INSTALLMENT',
        concept: q.descripcion || `Cuota de deuda #${q.numero_cuota ?? ''}`.trim()
      });
    }

    for (const d of debts) {
      if (quotaDebtIds.has(String(d.id))) continue;
      const date = String(d.fecha_vencimiento || '').slice(0,10);
      const balance = n(d.saldo_pendiente ?? d.saldo_actual ?? d.saldo);
      if (!date || balance <= 0) continue;
      obligations.push({
        id: d.id, sourceId: `deuda:${d.id}`, source: 'deudas', amount: balance, date,
        classification: date < t ? 'OVERDUE' : 'COMMITTED',
        concept: d.acreedor || d.nombre || d.descripcion || 'Deuda'
      });
    }

    const calendar = {};
    const day = date => calendar[date] ||= {
      assuredIncome:0, projectedIncome:0, plannedIncome:0,
      mandatoryExpenses:0, discretionaryExpenses:0
    };
    for (const x of incomes) {
      if (x.date < t) continue;
      const d = day(x.date);
      if (x.classification === 'ASSURED') d.assuredIncome += x.amount;
      else d.projectedIncome += x.amount;
    }
    for (const x of obligations) day(x.date < t ? t : x.date).mandatoryExpenses += x.amount;

    const paidToday = expenses.filter(x => x.date === t && !x.isDebtPayment).reduce((s,x)=>s+x.amount,0);
    const storedReserve = n(localStorage.getItem('finance_minimum_reserve'));
    const minimumReserve = storedReserve > 0 ? storedReserve : Math.round(Math.max(0, initialBalance) * .10);
    const safetyBufferPct = Math.min(50, Math.max(0, n(localStorage.getItem('finance_safety_buffer_pct')) || 10));

    const diagnostics = {
      errors, accounts: accounts.length, closures: closures.length, movements: movements.length,
      commitments: commitments.length, debts: debts.length, quotas: quotas.length,
      debtPayments: debtPayments.length, bankCurrent, cashCurrent, cashOpening, openingTotal,
      initialBalance, latestClosure
    };
    window.__financialSummaryDiagnostics = diagnostics;

    // Si ninguna fuente principal devuelve datos, no presentamos una falsa lectura de $0.
    const primaryCount = accounts.length + movements.length + debts.length + quotas.length + commitments.length;
    if (primaryCount === 0 && errors.length) {
      throw new Error('El Centro de Control no pudo leer las tablas financieras: ' + errors.join(' | '));
    }

    return {
      today: t, initialBalance, minimumReserve, safetyBufferPct,
      incomes: uniqueBySource(incomes), expenses: uniqueBySource(expenses),
      obligations: uniqueBySource(obligations), calendar,
      marginInput: {
        protectedLiquidity: Math.max(0, initialBalance), minimumReserve,
        discretionarySpent: paidToday, safetyBufferPct,
        projectedSpendRatePerHour: 0, remainingHours: 0
      }, diagnostics
    };
  }

  return { loadSummaryContext };
})();
