/* Centro de Control Financiero — UI v5.0.0 */
window.FinancialSummary = (() => {
  const VERSION = 'CCF-V5.0.0';

  const money = value =>
    Number(value || 0).toLocaleString('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0
    });

  async function init() {
    const status = document.getElementById('summary-status-text');

    try {
      if (status) status.textContent = 'Leyendo datos financieros reales...';

      const context =
        await window.FinanceRepository.loadSummaryContext();

      const state =
        window.FinancialStateEngine.calculate(context);

      const projection =
        window.LiquidityProjectionEngine.project(
          context,
          state,
          'CONSERVATIVE',
          90
        );

      const risk =
        window.LiquidityProjectionEngine.firstRisk(
          projection,
          Number(context.minimumReserve || 0)
        );

      const gap =
        window.FinancialGapEngine.calculate(
          context.obligations,
          {
            available: state.availableBalance,
            assured: state.assuredIncome
          }
        );

      /*
       * El estado financiero es la fuente canónica del KPI de brecha.
       */
      state.financialGap = gap.gap;

      const margin =
        window.DailySpendingMarginEngine.calculate(
          context.marginInput || {
            protectedLiquidity: state.availableBalance,
            minimumReserve: context.minimumReserve,
            discretionarySpent: 0,
            safetyBufferPct: context.safetyBufferPct
          }
        );

      const alert =
        window.FinancialAlertEngine.fromMargin(margin);

      const actions =
        window.FinancialActionEngine.build({
          risk,
          gap,
          marginAlert: alert
        });

      render(
        state,
        margin,
        alert,
        projection,
        actions,
        context,
        risk
      );

      if (window.ExecutiveDashboard) window.ExecutiveDashboard.renderCharts({ context, state, projection });

      return {
        version: VERSION,
        context,
        state,
        margin,
        alert,
        projection,
        actions
      };

    } catch (error) {
      console.error('[CCF]', error);

      if (status) {
        status.textContent =
          `ERROR DE LECTURA: ${error.message || error}`;
      }

      const semaphore =
        document.getElementById('summary-semaphore');

      if (semaphore) semaphore.textContent = 'ERROR';

      throw error;
    }
  }

  function render(
    state,
    margin,
    alert,
    projection,
    actions,
    context,
    risk
  ) {
    setText('kpi-real-balance', money(state.availableBalance));
    setText('kpi-assured', money(state.assuredIncome));
    setText('kpi-projected', money(state.projectedIncome));
    setText('kpi-committed', money(state.committedExpenses));
    setText('kpi-projected-balance', money(state.projectedBalance));
    setText('kpi-gap', money(state.financialGap));

    setText('margin-status', margin.status);
    setText('margin-maximum', money(margin.maximum));
    setText('margin-spent', money(margin.spent));
    setText('margin-remaining', money(margin.remaining));
    setText(
      'margin-percent',
      `${Math.round(margin.consumedPct)}% consumido`
    );
    setText(
      'margin-projection',
      `Proyección: ${Math.round(margin.projectedConsumedPct)}%`
    );

    const progress = Math.min(
      100,
      Math.max(0, margin.consumedPct)
    );

    const progressNode =
      document.getElementById('margin-progress');

    if (progressNode) {
      progressNode.style.width = `${progress}%`;
    }

    const alertBox =
      document.getElementById('margin-alert');

    if (alertBox) {
      alertBox.textContent = alert
        ? alert.message
        : 'Margen diario dentro de parámetros.';
    }

    const semaphore =
      document.getElementById('summary-semaphore');

    if (semaphore) {
      semaphore.textContent =
        state.financialGap > 0
          ? 'ATENCIÓN'
          : 'ESTABLE';
    }

    renderProjection(projection);
    renderActions(actions);
    renderNextNeed(context);

    setText(
      'summary-status-text',
      risk
        ? `Primera fecha de riesgo de liquidez: ${risk.date}.`
        : `Estado calculado con datos reales. Sin caída bajo la reserva en 90 días.`
    );
  }

  function renderProjection(rows) {
    const container =
      document.getElementById('projection-table');

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
          ${rows
            .filter((_, i) => indexes.includes(i))
            .map(row => `
              <tr>
                <td>${row.date}</td>
                <td>${money(row.openingBalance)}</td>
                <td>${money(
                  row.assuredIncome +
                  row.projectedIncome +
                  row.plannedIncome
                )}</td>
                <td>${money(
                  row.mandatoryExpenses +
                  row.discretionaryExpenses
                )}</td>
                <td>${money(row.closingBalance)}</td>
              </tr>
            `)
            .join('')}
        </tbody>
      </table>
    `;
  }

  function renderNextNeed(context) {
    const container =
      document.getElementById('next-need');

    if (!container) return;

    const future = (context.obligations || [])
      .filter(x => x.date)
      .sort((a, b) => a.date.localeCompare(b.date));

    if (!future.length) {
      container.textContent =
        'No hay obligaciones con vencimiento informado.';
      return;
    }

    const next = future[0];

    container.innerHTML = `
      <strong>${escapeHtml(next.concept)}</strong>
      <p>Vencimiento: ${escapeHtml(next.date)}</p>
      <p>Monto: ${money(next.amount)}</p>
    `;
  }

  function renderActions(actions) {
    const container =
      document.getElementById('priority-actions');

    if (!container) return;

    container.innerHTML = actions.length
      ? actions.map(a => `
          <div class="action-item">
            <strong>${escapeHtml(a.title)}</strong>
            <p>${escapeHtml(a.problem)}</p>
            <small>${escapeHtml(a.action)}</small>
          </div>
        `).join('')
      : 'Sin acciones prioritarias.';
  }

  function setText(id, value) {
    const node = document.getElementById(id);
    if (node) node.textContent = value;
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (
      window.FinanceRepository &&
      window.FinancialStateEngine &&
      window.LiquidityProjectionEngine &&
      window.FinancialGapEngine &&
      window.DailySpendingMarginEngine &&
      window.FinancialAlertEngine &&
      window.FinancialActionEngine
    ) {
      init().catch(() => {});
    }
  });

  return { init, VERSION };
})();
