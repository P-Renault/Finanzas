/* FINANZAS B2.3 — Radiografía e integración de deuda
   Standalone: funciona junto al módulo Deudas existente.
*/
(() => {
  'use strict';

  const $ = id => document.getElementById(id);
  const money = n => new Intl.NumberFormat('es-CL', {
    style: 'currency', currency: 'CLP', maximumFractionDigits: 0
  }).format(Number(n) || 0);

  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, c => ({
    '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#039;'
  }[c]));

  const today = () => {
    const d = new Date();
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
      .toISOString().slice(0, 10);
  };

  const addDays = (iso, days) => {
    const [y,m,d] = iso.split('-').map(Number);
    const x = new Date(Date.UTC(y, m - 1, d));
    x.setUTCDate(x.getUTCDate() + days);
    return x.toISOString().slice(0, 10);
  };

  let supabaseClient = null;
  let initialized = false;

  async function getDb() {
    if (supabaseClient) return supabaseClient;
    const url = localStorage.getItem('sf_url');
    const key = localStorage.getItem('sf_key');
    if (!url || !key || !window.supabase) return null;
    supabaseClient = window.supabase.createClient(url, key);
    return supabaseClient;
  }

  function injectDashboard() {
    if ($('b23DebtDashboard')) return;

    const dashboard = $('dashboard');
    if (!dashboard) return;

    const card = document.createElement('div');
    card.id = 'b23DebtDashboard';
    card.className = 'card b23-debt-card';
    card.innerHTML = `
      <div class="section-title">
        <div>
          <span class="muted">B2.3 · Radiografía de obligaciones</span>
          <h2>Centro de deuda</h2>
        </div>
        <button type="button" class="secondary" id="b23OpenDebt">Ver Deudas</button>
      </div>

      <div class="b23-metrics">
        <article>
          <span>Saldo de deuda</span>
          <strong id="b23DebtBalance">$0</strong>
          <small>Deudas vigentes</small>
        </article>
        <article>
          <span>Cuotas pendientes</span>
          <strong id="b23PendingCount">0</strong>
          <small>Programadas</small>
        </article>
        <article>
          <span>Próximos 30 días</span>
          <strong id="b23Next30">$0</strong>
          <small>Cuotas de deuda</small>
        </article>
        <article>
          <span>Vencidas</span>
          <strong id="b23Overdue">$0</strong>
          <small>Requieren atención</small>
        </article>
      </div>

      <div class="b23-separation">
        <strong>Importante:</strong>
        <span>“Pagos pendientes” y “Saldo de deuda” son conceptos distintos. Los compromisos existentes no se convierten automáticamente en deuda estructurada.</span>
      </div>

      <div id="b23Upcoming" class="b23-upcoming">
        <p class="muted">Cargando cuotas...</p>
      </div>
    `;

    const incomePlan = dashboard.querySelector('.income-plan-card');
    if (incomePlan) incomePlan.insertAdjacentElement('beforebegin', card);
    else dashboard.appendChild(card);

    $('b23OpenDebt').addEventListener('click', () => {
      const tab = document.querySelector('[data-tab="deudas"]');
      if (tab) tab.click();
    });
  }

  function injectDebtCalendar() {
    const section = $('deudas');
    if (!section || $('b23DebtCalendar')) return;

    const card = document.createElement('div');
    card.id = 'b23DebtCalendar';
    card.className = 'card b23-debt-calendar';
    card.innerHTML = `
      <div class="section-title">
        <div>
          <span class="muted">B2.3 · Plan de obligaciones</span>
          <h2>Calendario de cuotas</h2>
        </div>
      </div>
      <p class="muted b23-calendar-help">
        Aquí aparecen únicamente cuotas de deudas estructuradas. Los compromisos generales siguen en “Pagos futuros”.
      </p>
      <div id="b23CalendarRows"><p class="muted">Cargando...</p></div>
    `;

    section.appendChild(card);
  }

  async function loadData() {
    const db = await getDb();
    if (!db) return null;

    const debtsResult = await db.from('v_deudas_resumen').select('*');
    if (debtsResult.error) {
      console.error('B2.3 deudas:', debtsResult.error);
      return null;
    }

    const quotasResult = await db
      .from('cuotas_deuda')
      .select('id,deuda_id,numero_cuota,fecha_vencimiento,monto,estado,fecha_pago')
      .order('fecha_vencimiento', { ascending: true });

    if (quotasResult.error) {
      console.error('B2.3 cuotas:', quotasResult.error);
      return null;
    }

    return {
      debts: debtsResult.data || [],
      quotas: quotasResult.data || []
    };
  }

  function calculate(data) {
    const activeDebts = data.debts.filter(d =>
      !['pagada', 'cancelada'].includes(d.estado)
    );

    const balance = activeDebts.reduce(
      (sum, d) => sum + Number(d.saldo_actual || 0), 0
    );

    const pending = data.quotas.filter(q =>
      ['pendiente', 'vencida'].includes(q.estado)
    );

    const overdue = pending.filter(q => q.estado === 'vencida');
    const end = addDays(today(), 30);

    const next30 = pending.filter(q =>
      q.fecha_vencimiento >= today() && q.fecha_vencimiento <= end
    );

    return {
      balance,
      pending,
      overdue,
      next30,
      next30Amount: next30.reduce((s,q) => s + Number(q.monto || 0), 0),
      overdueAmount: overdue.reduce((s,q) => s + Number(q.monto || 0), 0)
    };
  }

  function renderDashboard(data) {
    injectDashboard();
    if (!data) return;

    const x = calculate(data);

    $('b23DebtBalance').textContent = money(x.balance);
    $('b23PendingCount').textContent = String(x.pending.length);
    $('b23Next30').textContent = money(x.next30Amount);
    $('b23Overdue').textContent = money(x.overdueAmount);

    const byDebt = Object.fromEntries(data.debts.map(d => [d.id, d]));
    const rows = x.pending
      .filter(q => q.fecha_vencimiento >= today())
      .slice(0, 5);

    const box = $('b23Upcoming');

    if (!rows.length) {
      box.innerHTML = '<p class="muted">No hay cuotas pendientes próximas registradas.</p>';
      return;
    }

    box.innerHTML = `
      <div class="b23-list-title">
        <strong>Próximas obligaciones de deuda</strong>
        <span>Hasta 5 próximas cuotas</span>
      </div>
      ${rows.map(q => {
        const debt = byDebt[q.deuda_id] || {};
        return `
          <button type="button" class="b23-row" data-debt-id="${Number(q.deuda_id)}">
            <span>
              <strong>${escapeHtml(debt.acreedor || 'Deuda')}</strong>
              <small>Cuota ${Number(q.numero_cuota)} · vence ${escapeHtml(q.fecha_vencimiento)}</small>
            </span>
            <strong>${money(q.monto)}</strong>
          </button>
        `;
      }).join('')}
    `;

    box.querySelectorAll('.b23-row').forEach(button => {
      button.addEventListener('click', () => {
        const tab = document.querySelector('[data-tab="deudas"]');
        if (tab) tab.click();
        setTimeout(() => {
          if (typeof window.verDeuda === 'function') {
            window.verDeuda(Number(button.dataset.debtId));
          }
        }, 50);
      });
    });
  }

  function renderCalendar(data) {
    injectDebtCalendar();
    if (!data) return;

    const byDebt = Object.fromEntries(data.debts.map(d => [d.id, d]));
    const rows = data.quotas
      .filter(q => ['pendiente','vencida'].includes(q.estado))
      .slice(0, 36);

    const box = $('b23CalendarRows');
    if (!box) return;

    if (!rows.length) {
      box.innerHTML = '<p class="muted">No existen cuotas pendientes. Registra una deuda con plan de cuotas para construir el calendario.</p>';
      return;
    }

    box.innerHTML = rows.map(q => {
      const debt = byDebt[q.deuda_id] || {};
      const overdue = q.estado === 'vencida';
      return `
        <div class="b23-calendar-row ${overdue ? 'is-overdue' : ''}">
          <div>
            <strong>${escapeHtml(debt.acreedor || 'Deuda')}</strong>
            <span>Cuota ${Number(q.numero_cuota)} · vence ${escapeHtml(q.fecha_vencimiento)}</span>
          </div>
          <strong>${money(q.monto)}</strong>
          <span class="b23-status">${overdue ? 'Vencida' : 'Pendiente'}</span>
        </div>
      `;
    }).join('');
  }

  async function refreshB23() {
    const data = await loadData();
    renderDashboard(data);

    if ($('deudas')) {
      renderCalendar(data);
    }
  }

  function start() {
    if (initialized) return;
    initialized = true;

    injectDashboard();

    const originalRefresh = window.refresh;
    if (typeof originalRefresh === 'function' && !originalRefresh.__b23Wrapped) {
      const wrapped = async function(...args) {
        const result = await originalRefresh.apply(this, args);
        try { await refreshB23(); } catch (error) { console.error(error); }
        return result;
      };
      wrapped.__b23Wrapped = true;
      window.refresh = wrapped;
    }

    refreshB23();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();