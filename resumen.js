ARCHIVO: resumen.js
LENGUAJE: JavaScript ES2022
EXTENSIÓN DE IMPLEMENTACIÓN: .js
EXTENSIÓN DE ENTREGA: .txt

window.FinancialSummary = (() => {
  const money = value =>
    Number(value || 0).toLocaleString('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0
    });

  async function init() {
    const context = await window.FinanceRepository.loadSummaryContext();

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

    render(state, margin, alert, projection, actions);

    return { context, state, margin, alert, projection, actions };
  }

  function render(state, margin, alert, projection, actions) {
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
    setText('margin-percent', `${Math.round(margin.consumedPct)}% consumido`);
    setText('margin-projection', `Proyección: ${Math.round(margin.projectedConsumedPct)}%`);

    const progress = Math.min(100, Math.max(0, margin.consumedPct));
    document.getElementById('margin-progress').style.width = `${progress}%`;

    const alertBox = document.getElementById('margin-alert');
    alertBox.textContent = alert
      ? alert.message
      : 'Margen diario dentro de parámetros.';

    document.getElementById('summary-semaphore').textContent =
      state.financialGap > 0 ? 'ATENCIÓN' : 'ESTABLE';

    renderProjection(projection);
    renderActions(actions);

    setText(
      'summary-status-text',
      riskText(projection, Number(window.__minimumReserve || 0))
    );
  }

  function renderProjection(rows) {
    const container = document.getElementById('projection-table');
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
          ${rows.filter((_, i) => [0,6,14,29,59,89].includes(i))
            .map(row => `
              <tr>
                <td>${row.date}</td>
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

  function renderActions(actions) {
    const container = document.getElementById('priority-actions');
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

  function riskText(projection, reserve) {
    const risk = projection.find(x => x.closingBalance < reserve);
    return risk
      ? `Primera fecha de riesgo de liquidez: ${risk.date}.`
      : 'No se detecta caída bajo la reserva en el horizonte evaluado.';
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

  document.addEventListener('DOMContentLoaded', init);

  return { init };
})();
