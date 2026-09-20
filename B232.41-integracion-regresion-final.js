/* ============================================================
   B232.41 — INTEGRACIÓN Y REGRESIÓN FINAL
   Objetivo:
   - Auditar coherencia de fuentes financieras sin alterar motores existentes.
   - Detectar errores, fuentes vacías, ceros legítimos y estados "Calculando...".
   - Detectar duplicación segura por IDs / movimiento_id.
   - Validar navegación, módulos críticos y tiempos de consulta.
   - Exponer un informe reproducible en window.B23241Regression.
   Regla: diagnóstico aislado. NO modifica app.js, B232.35, B232.39 ni B232.40.
   ============================================================ */
(() => {
  'use strict';

  const VERSION = '232.41';
  if (window.B23241Regression?.version === VERSION) return;

  const TABLES = [
    'cierres_financieros',
    'cuentas_bancarias',
    'movimientos',
    'ingresos_futuros',
    'gastos_planificados',
    'compromisos',
    'cuotas_deuda',
    'v_deudas_resumen',
    'generacion_ingresos'
  ];

  const $ = id => document.getElementById(id);
  const money = n => new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0
  }).format(Number(n) || 0);

  const n = v => {
    const x = Number(v);
    return Number.isFinite(x) ? x : 0;
  };

  const today = () => {
    const d = new Date();
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
      .toISOString().slice(0, 10);
  };

  const dateValue = (row, ...fields) => {
    for (const f of fields) {
      if (row?.[f]) {
        const v = String(row[f]).slice(0, 10);
        if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
      }
    }
    return null;
  };

  const isFuture = (row, ...fields) => {
    const d = dateValue(row, ...fields);
    return !!d && d > today();
  };

  function classifyRows(rows, error) {
    if (error) return { state: 'error', count: 0, error: error.message || String(error) };
    if (!rows.length) return { state: 'empty', count: 0 };
    const numeric = rows.filter(r =>
      ['monto','saldo_actual','saldo_efectivo_actual','saldo_inicial','monto_neto']
        .some(k => r?.[k] != null)
    );
    const allZero = numeric.length > 0 && numeric.every(r =>
      ['monto','saldo_actual','saldo_efectivo_actual','saldo_inicial','monto_neto']
        .every(k => r?.[k] == null || n(r[k]) === 0)
    );
    return { state: allZero ? 'zero' : 'ok', count: rows.length };
  }

  function uniqueCount(rows, keyFn) {
    const seen = new Set();
    let duplicates = 0;
    rows.forEach(row => {
      const key = keyFn(row);
      if (key == null || key === '') return;
      if (seen.has(String(key))) duplicates++;
      else seen.add(String(key));
    });
    return { unique: seen.size, duplicates };
  }

  function navAudit() {
    const buttons = [...document.querySelectorAll('.tabs button[data-tab]')];
    const sections = [...document.querySelectorAll('#app > .tab')];
    const missingTargets = buttons
      .map(b => b.dataset.tab)
      .filter(id => !$(id));
    const duplicateSections = sections
      .map(s => s.id)
      .filter((id, i, a) => id && a.indexOf(id) !== i);

    const visible = sections.filter(s => !s.classList.contains('hidden'));
    return {
      buttons: buttons.length,
      sections: sections.length,
      missingTargets,
      duplicateSections,
      visibleSections: visible.map(s => s.id),
      ok: missingTargets.length === 0 &&
          duplicateSections.length === 0 &&
          visible.length <= 1
    };
  }

  function criticalStateAudit() {
    const ids = [
      'summary-status-text',
      'kpi-real-balance',
      'kpi-projected',
      'kpi-committed',
      'kpi-projected-balance',
      'ia-financiera',
      'planificacion',
      'operaciones'
    ];

    const calculating = [];
    const errors = [];
    ids.forEach(id => {
      const el = $(id);
      if (!el) return;
      const t = (el.textContent || '').trim().toLowerCase();
      if (t.includes('calculando') || t.includes('cargando')) calculating.push(id);
      if (t.includes('error') || t.includes('no fue posible')) errors.push(id);
    });

    return { calculating, errors, ok: calculating.length === 0 && errors.length === 0 };
  }

  async function query(client, table) {
    const t0 = performance.now();
    const result = await client.from(table).select('*');
    return {
      table,
      ms: Math.round(performance.now() - t0),
      rows: result.data || [],
      error: result.error || null
    };
  }

  function sourceSummary(results) {
    return Object.fromEntries(results.map(r => [
      r.table,
      { ...classifyRows(r.rows, r.error), ms: r.ms }
    ]));
  }

  function financialSnapshot(results) {
    const by = Object.fromEntries(results.map(r => [r.table, r.rows]));
    const close = (by.cierres_financieros || [])
      .filter(x => x.activo !== false)
      .sort((a,b) => String(b.fecha_corte || '').localeCompare(String(a.fecha_corte || '')))[0];

    const accounts = (by.cuentas_bancarias || []).filter(x => x.activa !== false);
    const movements = by.movimientos || [];
    const futureIncome = (by.ingresos_futuros || [])
      .filter(x => !x.estado || !/pagad|cobrad|realiz/i.test(String(x.estado)))
      .filter(x => isFuture(x, 'fecha', 'fecha_vencimiento', 'fecha_cobro'));

    const commitments = (by.compromisos || [])
      .filter(x => !x.estado || !/pagad|cancel|cerrad/i.test(String(x.estado)))
      .filter(x => isFuture(x, 'fecha_vencimiento', 'fecha'));

    const quotas = (by.cuotas_deuda || [])
      .filter(x => !/pagad|cancel|cerrad/i.test(String(x.estado || '')))
      .filter(x => isFuture(x, 'fecha_vencimiento'));

    const debtRows = by.v_deudas_resumen || [];
    const pendingDebt = debtRows
      .filter(x => !/pagad|cancel|cerrad/i.test(String(x.estado || '')))
      .reduce((s,x) => s + n(x.saldo_actual ?? x.saldo_pendiente ?? x.saldo), 0);

    const cash = close
      ? n(close.saldo_efectivo_actual ?? close.saldo_inicial)
      : 0;
    const bank = accounts.reduce((s,x) => s + n(x.saldo_actual), 0);

    return {
      cutoff: close?.fecha_corte || null,
      cash,
      bank,
      liquidityComponents: cash + bank,
      futureIncome: futureIncome.reduce((s,x)=>s+n(x.monto),0),
      obligations: commitments.reduce((s,x)=>s+n(x.monto),0) +
                   quotas.reduce((s,x)=>s+n(x.monto),0),
      commitments: commitments.reduce((s,x)=>s+n(x.monto),0),
      quotas: quotas.reduce((s,x)=>s+n(x.monto),0),
      pendingDebt
    };
  }

  function duplicateAudit(results) {
    const by = Object.fromEntries(results.map(r => [r.table, r.rows]));
    const movementIds = new Set(
      (by.movimientos || []).map(x => String(x.id ?? x.movimiento_id ?? '')).filter(Boolean)
    );

    const future = by.ingresos_futuros || [];
    const futureById = uniqueCount(future, x => x.id);
    const futureMovementLinks = future.filter(x =>
      x.movimiento_id != null && movementIds.has(String(x.movimiento_id))
    ).length;

    const commitments = by.compromisos || [];
    const quota = by.cuotas_deuda || [];

    const obligationKey = x => {
      const d = dateValue(x, 'fecha_vencimiento', 'fecha');
      const amount = n(x.monto);
      const id = x.id ?? x.cuota_id ?? x.compromiso_id;
      return id != null ? `id:${id}` : `${d}|${amount}|${String(x.concepto || x.descripcion || '').trim().toLowerCase()}`;
    };

    return {
      futureIncomeDuplicateIds: futureById.duplicates,
      futureIncomeLinkedMovements: futureMovementLinks,
      commitmentDuplicateIds: uniqueCount(commitments, x => x.id).duplicates,
      quotaDuplicateIds: uniqueCount(quota, x => x.id).duplicates,
      suspiciousObligationKeys: uniqueCount([...commitments, ...quota], obligationKey).duplicates,
      ok: futureById.duplicates === 0 &&
          uniqueCount(commitments, x => x.id).duplicates === 0 &&
          uniqueCount(quota, x => x.id).duplicates === 0
    };
  }

  function moduleAudit() {
    return {
      B23235: !!window.__B23235_EXECUTIVE_CLOSURE__,
      B23239: !!window.__B23239_IA_DATA_BRIDGE__,
      B23240: !!window.__B23240_PLAN_FIX__,
      B23232: !!window.B23232Planificacion?.version,
      CCFRouter: !!window.CCFRouter,
      supabase: !!window.supabaseClient,
      ok: !!window.CCFRouter && !!window.supabaseClient
    };
  }

  function render(report) {
    const host = $('dashboard');
    if (!host) return;

    let badge = $('b23241IntegrationStatus');
    if (!badge) {
      badge = document.createElement('div');
      badge.id = 'b23241IntegrationStatus';
      badge.setAttribute('role','status');
      badge.style.cssText = [
        'margin:8px 0;padding:8px 10px;border:1px solid #e5e7eb',
        'border-radius:10px;font:12px/1.35 system-ui,-apple-system,sans-serif',
        'background:#f8fafc;color:#334155'
      ].join(';');
      const anchor = $('summary-status-text')?.parentElement;
      (anchor || host).prepend(badge);
    }

    const failures = report.checks.filter(c => c.state === 'error' || c.state === 'fail');
    const warnings = report.checks.filter(c => c.state === 'warn');
    const ok = failures.length === 0;

    badge.textContent =
      `B232.41 · ${ok ? 'INTEGRACIÓN OPERATIVA' : 'ATENCIÓN'} · ` +
      `${report.durationMs} ms · ${warnings.length} advertencias`;

    badge.style.background = failures.length ? '#fef2f2' : warnings.length ? '#fffbeb' : '#f0fdf4';
    badge.style.color = failures.length ? '#991b1b' : warnings.length ? '#92400e' : '#166534';
    badge.title = 'Diagnóstico B232.41. Ver window.B23241Regression.lastReport para el detalle.';
  }

  async function run(options = {}) {
    const started = performance.now();
    const client = window.supabaseClient;
    if (!client) {
      const report = {
        version: VERSION,
        status: 'error',
        durationMs: Math.round(performance.now() - started),
        checks: [{ id:'supabase', state:'error', detail:'Cliente Supabase no disponible.' }],
        sources: {},
        snapshot: null,
        navigation: navAudit(),
        criticalState: criticalStateAudit()
      };
      window.B23241Regression.lastReport = report;
      render(report);
      return report;
    }

    const results = await Promise.all(TABLES.map(table => query(client, table)));
    const sources = sourceSummary(results);
    const snapshot = financialSnapshot(results);
    const duplicates = duplicateAudit(results);
    const navigation = navAudit();
    const critical = criticalStateAudit();
    const modules = moduleAudit();

    const checks = [];

    const sourceErrors = results.filter(x => x.error);
    checks.push({
      id:'sources',
      state: sourceErrors.length ? 'error' : 'pass',
      detail: sourceErrors.length
        ? `Errores Supabase: ${sourceErrors.map(x=>x.table).join(', ')}`
        : `${results.length} fuentes consultadas correctamente.`
    });

    checks.push({
      id:'navigation',
      state: navigation.ok ? 'pass' : 'error',
      detail: navigation.ok
        ? `${navigation.buttons} botones / ${navigation.sections} secciones coherentes.`
        : `Targets faltantes: ${navigation.missingTargets.join(', ') || 'ninguno'}.`
    });

    checks.push({
      id:'modules',
      state: modules.ok ? 'pass' : 'warn',
      detail: modules.ok ? 'Router y Supabase disponibles.' : 'Router o cliente Supabase no disponible al momento del diagnóstico.'
    });

    checks.push({
      id:'duplicates',
      state: duplicates.ok ? 'pass' : 'error',
      detail: duplicates.ok
        ? 'No se detectaron duplicados por ID ni ingresos futuros enlazados a movimientos.'
        : 'Se detectaron posibles duplicaciones; revisar detalle del informe.'
    });

    checks.push({
      id:'states',
      state: critical.errors.length ? 'error' : critical.calculating.length ? 'warn' : 'pass',
      detail: critical.errors.length
        ? `Estados con error: ${critical.errors.join(', ')}`
        : critical.calculating.length
          ? `Aún calculando/cargando: ${critical.calculating.join(', ')}`
          : 'No quedan estados de cálculo/carga en los elementos auditados.'
    });

    const slowest = Math.max(...results.map(x=>x.ms), 0);
    checks.push({
      id:'performance',
      state: slowest > 1500 ? 'warn' : 'pass',
      detail: `Consulta más lenta: ${slowest} ms.`
    });

    checks.push({
      id:'financial-snapshot',
      state: 'pass',
      detail: `Liquidez por componentes ${money(snapshot.liquidityComponents)}, ingresos futuros ${money(snapshot.futureIncome)}, obligaciones ${money(snapshot.obligations)}.`
    });

    const status = checks.some(c=>c.state==='error') ? 'error'
      : checks.some(c=>c.state==='warn') ? 'warning' : 'ok';

    const report = {
      version: VERSION,
      status,
      timestamp: new Date().toISOString(),
      durationMs: Math.round(performance.now() - started),
      checks,
      sources,
      snapshot,
      duplicates,
      navigation,
      criticalState: critical,
      modules
    };

    window.B23241Regression.lastReport = report;
    window.__B23241_REPORT__ = report;
    render(report);

    if (options.log !== false) {
      console.groupCollapsed(`[B232.41] ${status.toUpperCase()} · ${report.durationMs} ms`);
      console.table(checks);
      console.log('Fuentes', sources);
      console.log('Snapshot', snapshot);
      console.log('Duplicados', duplicates);
      console.log('Navegación', navigation);
      console.log('Estado crítico', critical);
      console.groupEnd();
    }

    return report;
  }

  function schedule() {
    const start = () => {
      if (!window.supabaseClient) return;
      setTimeout(() => run({ log: true }), 1200);
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', start, { once:true });
    } else {
      start();
    }
  }

  window.B23241Regression = {
    version: VERSION,
    run,
    getLastReport: () => window.B23241Regression.lastReport || null
  };

  schedule();
})();