/* Centro de Control Financiero — render e integración */
window.FinancialSummary = (() => {
  let lastResult = null;

  const money = v => '$' + Math.round(Number(v || 0)).toLocaleString('es-CL');
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[c]));

  function set(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  function semaphore(state, risk, gap) {
    if (gap.gap > 0 || risk) return ['ACCIÓN', 'immediate'];
    if (state.coverageRatio < 1.25) return ['ATENCIÓN', 'attention'];
    return ['ESTABLE', 'stable'];
  }

  function renderProjection(projection, reserve) {
    const el = document.getElementById('projection-table');
    if (!el) return;
    const indexes = [0, 6, 14, 29, 59, 89].filter(i => projection[i]);
    el.innerHTML = `
      <div class="projection-row projection-head">
        <span>Horizonte</span><span>Apertura</span><span>Ingresos</span><span>Egresos</span><span>Cierre</span>
      </div>` +
      indexes.map(i => {
        const r = projection[i];
        const inc = r.assuredIncome + r.projectedIncome + r.plannedIncome;
        const exp = r.mandatoryExpenses + r.discretionaryExpenses;
        const cls = r.closingBalance < reserve ? 'risk-row' : '';
        return `<div class="projection-row ${cls}">
          <span>${i === 0 ? 'Hoy' : `${i + 1} días`}</span>
          <span>${money(r.openingBalance)}</span>
          <span>${money(inc)}</span>
          <span>${money(exp)}</span>
          <strong>${money(r.closingBalance)}</strong>
        </div>`;
      }).join('');
  }

  function renderActions(actions) {
    const el = document.getElementById('priority-actions');
    if (!el) return;
    if (!actions.length) {
      el.innerHTML = '<p class="muted">No hay acciones prioritarias detectadas.</p>';
      return;
    }
    el.innerHTML = actions.map(a => `
      <article class="action-item">
        <strong>${esc(a.title)}</strong>
        <p>${esc(a.problem)}</p>
        <small>${esc(a.action)}</small>
      </article>`).join('');
  }

  function renderNextNeed(obligations, today) {
    const el = document.getElementById('next-need');
    if (!el) return null;
    const sorted = (obligations || []).filter(x => x.date && x.amount > 0)
      .sort((a,b) => String(a.date).localeCompare(String(b.date)));
    const next = sorted[0];
    if (!next) {
      el.innerHTML = '<p class="muted">No hay obligaciones con vencimiento informado.</p>';
      return null;
    }
    el.innerHTML = `
      <strong>${esc(next.concept)}</strong>
      <p>${money(next.amount)} · vencimiento ${esc(next.date)}</p>
      <small>${next.date < today ? 'VENCIDO' : 'Próximo vencimiento'}</small>`;
    return next;
  }

  async function init() {
    const status = document.getElementById('summary-status-text');
    try {
      if (status) status.textContent = 'Cargando datos financieros...';

      const context = await window.FinanceRepository.loadSummaryContext();
      const state = window.FinancialStateEngine.calculate(context);
      const projection = window.LiquidityProjectionEngine.project(context, state, 'BASE', 90);
      const risk = window.LiquidityProjectionEngine.firstRisk(projection, context.minimumReserve);
      const gap = window.FinancialGapEngine.calculate(context.obligations, {
        available: state.availableBalance,
        assured: state.assuredIncome,
        today: context.today,
        horizonDays: 90
      });
      const margin = window.DailySpendingMarginEngine.calculate(context.marginInput);
      const alert = window.FinancialAlertEngine.fromMargin(margin);
      const nextNeed = renderNextNeed(context.obligations, context.today);
      const actions = window.FinancialActionEngine.build({ risk, gap, marginAlert: alert, nextNeed });

      set('kpi-real-balance', money(state.availableBalance));
      set('kpi-assured', money(state.assuredIncome));
      set('kpi-projected', money(state.projectedIncome));
      set('kpi-committed', money(state.committedExpenses));
      set('kpi-projected-balance', money(state.projectedBalance));
      set('kpi-gap', money(gap.gap));

      set('margin-status', margin.status.replace('_', ' '));
      set('margin-maximum', money(margin.maximum));
      set('margin-spent', money(margin.spent));
      set('margin-remaining', money(margin.remaining));
      set('margin-percent', `${Math.round(margin.consumedPct)}% consumido`);
      set('margin-projection', `Proyección: ${Math.round(margin.projectedConsumedPct)}%`);

      const progress = document.getElementById('margin-progress');
      if (progress) progress.style.width = `${Math.min(100, Math.max(0, margin.consumedPct))}%`;

      const alertEl = document.getElementById('margin-alert');
      if (alertEl) alertEl.textContent = alert ? alert.message : 'No hay alertas.';

      const [label] = semaphore(state, risk, gap);
      set('summary-semaphore', label);
      set('summary-status-text',
        risk
          ? `Riesgo de liquidez detectado para ${risk.date}. Reserva mínima: ${money(context.minimumReserve)}.`
          : gap.gap > 0
            ? `Existe una brecha de ${money(gap.gap)} dentro del horizonte de 90 días.`
            : `Liquidez actual ${money(state.availableBalance)}. Sin caída bajo la reserva en 90 días.`);

      renderProjection(projection, context.minimumReserve);
      renderActions(actions);

      lastResult = { context, state, projection, risk, gap, margin, alert, nextNeed, actions };
      window.__financialSummaryLastResult = lastResult;
      return lastResult;
    } catch (error) {
      console.error('[Finance] Centro de Control:', error);
      if (status) status.textContent = `Error al cargar el estado financiero: ${error.message || error}`;
      const action = document.getElementById('priority-actions');
      if (action) action.innerHTML = '<p class="muted">Revisa la consola del navegador para el detalle técnico.</p>';
      throw error;
    }
  }

  return {
    init,
    refresh: init,
    getLastResult: () => lastResult
  };
})();
