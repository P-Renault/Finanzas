window.FinancialSummary = (() => {
  const money = value =>
    Number(value || 0).toLocaleString('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0
    });

  let lastResult = null;

  async function init() {
    if (!window.FinanceRepository) {
      throw new Error('FinanceRepository no está disponible.');
    }

    const context = await window.FinanceRepository.loadSummaryContext();

    const state = window.FinancialStateEngine.calculate(context);

    const projection = window.LiquidityProjectionEngine.project(
      context,
      state,
      'CONSERVATIVE',
      90
    );

    const risk = window.LiquidityProjectionEngine.firstRisk(
      projection,
      Number(context.minimumReserve || 0)
    );

    const gap = window.FinancialGapEngine.calculate(
      context.obligations,
      {
        available: state.availableBalance,
        assured: state.assuredIncome
      }
    );

    const margin = window.DailySpendingMarginEngine.calculate(
      context.marginInput
    );

    const alert = window.FinancialAlertEngine.fromMargin(margin);

    const actions = window.FinancialActionEngine.build({
      risk,
      gap,
      marginAlert: alert
    });

    lastResult = { context, state, margin, alert, projection, actions, risk, gap };

    render(lastResult);
    return lastResult;
  }

  function render(result) {
    const { context, state, margin, alert, projection, actions, risk, gap } = result;

    setText('kpi-real-balance', money(state.availableBalance));
    setText('kpi-assured', money(state.assuredIncome));
    setText('kpi-projected', money(state.projectedIncome));
    setText('kpi-committed', money(state.committedExpenses));
    setText('kpi-projected-balance', money(state.projectedBalance));
    setText('kpi-gap', money(gap.gap));

    setText('margin-status', marginStatusLabel(margin.status));
    setText('margin-maximum', money(margin.maximum));
    setText('margin-spent', money(margin.spent));
    setText('margin-remaining', money(margin.remaining));
    setText('margin-percent', `${Math.round(margin.consumedPct)}% consumido`);
    setText('margin-projection', `Proyección: ${Math.round(margin.projectedConsumedPct)}%`);

    const progress = Math.min(100, Math.max(0, margin.consumedPct));
    const progressNode = document.getElementById('margin-progress');
    if (progressNode) progressNode.style.width = `${progress}%`;

    const alertBox = document.getElementById('margin-alert');
    if (alertBox) {
      alertBox.textContent = alert
        ? alert.message
        : 'Margen diario dentro de parámetros.';
      alertBox.dataset.severity = alert?.severity || 'NORMAL';
    }

    const semaphore = document.getElementById('summary-semaphore');
    if (semaphore) {
      semaphore.textContent = financialStatus(state, risk, margin);
      semaphore.dataset.status = financialStatusCode(state, risk, margin);
    }

    setText(
      'summary-status-text',
      buildStatusText(state, risk, context.minimumReserve)
    );

    renderProjection(projection);
    renderNextNeed(context.obligations);
    renderActions(actions);
  }

  function financialStatus(state, risk, margin) {
    if (state.financialGap > 0 || risk || margin.status === 'LIMIT_REACHED') {
      return 'ACCIÓN INMEDIATA';
    }
    if (
      margin.status === 'CRITICAL' ||
      margin.status === 'CAUTION' ||
      margin.status === 'PREVENTIVE'
    ) {
      return 'ATENCIÓN';
    }
    return 'ESTABLE';
  }

  function financialStatusCode(state, risk, margin) {
    if (state.financialGap > 0 || risk || margin.status === 'LIMIT_REACHED') return 'critical';
    if (
      margin.status === 'CRITICAL' ||
      margin.status === 'CAUTION' ||
      margin.status === 'PREVENTIVE'
    ) return 'warning';
    return 'stable';
  }

  function marginStatusLabel(status) {
    return ({
      NORMAL: 'NORMAL',
      PREVENTIVE: 'PREVENTIVO',
      CAUTION: 'PRECAUCIÓN',
      CRITICAL: 'CRÍTICO',
      LIMIT_REACHED: 'LÍMITE ALCANZADO'
    })[status] || status;
  }

  function buildStatusText(state, risk, reserve) {
    if (risk) {
      return `Primera alerta de liquidez: ${formatDate(risk.date)}. Reserva mínima: ${money(reserve)}.`;
    }
    if (state.financialGap > 0) {
      return `Existe una brecha financiera de ${money(state.financialGap)}.`;
    }
    return `Liquidez disponible ${money(state.availableBalance)} · saldo proyectado ${money(state.projectedBalance)}.`;
  }

  function renderProjection(rows) {
    const container = document.getElementById('projection-table');
    if (!container) return;

    const indexes = [0, 6, 14, 29, 59, 89];

    container.innerHTML = `
      <table>
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Inicial</th>
            <th>Ingresos</th>
            <th>Egresos</th>
            <th>Cierre</th>
          </tr>
        </thead>
        <tbody>
          ${rows.filter((_, i) => indexes.includes(i)).map(row => `
            <tr>
              <td>${formatDate(row.date)}</td>
              <td>${money(row.openingBalance)}</td>
              <td>${money(row.assuredIncome + row.projectedIncome + row.plannedIncome)}</td>
              <td>${money(row.mandatoryExpenses + row.discretionaryExpenses)}</td>
              <td>${money(row.closingBalance)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  function renderNextNeed(obligations) {
    const container = document.getElementById('next-need');
    if (!container) return;

    const today = new Date().toISOString().slice(0, 10);
    const pending = (obligations || [])
      .filter(x => x.date)
      .sort((a, b) => String(a.date).localeCompare(String(b.date)));

    const next = pending[0];

    if (!next) {
      container.innerHTML = '<strong>No hay obligaciones con fecha próxima.</strong><p class="muted">Las obligaciones sin fecha siguen fuera del calendario para evitar inventar vencimientos.</p>';
      return;
    }

    const overdue = next.date < today;

    container.innerHTML = `
      <strong>${escapeHtml(next.concept || 'Obligación financiera')}</strong>
      <p>${money(next.amount)} · ${overdue ? 'VENCIDA' : 'vence'} ${formatDate(next.date)}</p>
      <small>${escapeHtml(next.classification || 'COMMITTED')}</small>
    `;
  }

  function renderActions(actions) {
    const container = document.getElementById('priority-actions');
    if (!container) return;

    container.innerHTML = actions.length
      ? actions.map(a => `
          <div class="action-item">
            <strong>${escapeHtml(a.title)}</strong>
            <p>${escapeHtml(a.problem)}</p>
            <small>${escapeHtml(a.action)}</small>
          </div>
        `).join('')
      : '<span class="muted">No hay acciones prioritarias.</span>';
  }

  function formatDate(value) {
    if (!value) return '—';
    const [y, m, d] = String(value).split('-');
    return d && m && y ? `${d}/${m}/${y}` : String(value);
  }

  function setText(id, value) {
    const node = document.getElementById(id);
    if (node) node.textContent = value;
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  /*
   * El archivo se carga dinámicamente después de DOMContentLoaded.
   * Por eso init() también es invocado explícitamente por index.html.
   */
  window.addEventListener('finance:refresh-summary', () => {
    init().catch(error => {
      console.error('[Centro Financiero]', error);
      setText('summary-status-text', 'Error actualizando el Centro de Control.');
    });
  });

  return {
    init,
    refresh: init,
    getLastResult: () => lastResult
  };
})();
