/* B232.68 — CCF DEUDA DUAL
 * Release: B232.68-CCF-DEUDA-DUAL
 * Objetivo: separar visualmente deuda total pendiente de obligaciones programadas.
 * No modifica deudas, cuotas, pagos, movimientos ni saldos de liquidez.
 */
(() => {
  'use strict';

  const RELEASE = 'B232.68-CCF-DEUDA-DUAL';
  const money = value => Number(value || 0).toLocaleString('es-CL', {
    style: 'currency', currency: 'CLP', maximumFractionDigits: 0
  });

  let installed = false;
  let refreshWrapped = false;
  let debtRequest = null;

  function injectStyle() {
    if (document.getElementById('b23268-style')) return;
    const style = document.createElement('style');
    style.id = 'b23268-style';
    style.textContent = `
      .b23268-debt-card strong { font-size: 1.35rem; }
      .b23268-debt-card small { display:block; margin-top:.35rem; opacity:.72; line-height:1.25; }
      .b23268-debt-card.is-secondary strong { font-size:1.15rem; }
      .b23268-footer { margin: 18px 0 6px; text-align:center; font-size:11px; opacity:.55; letter-spacing:.02em; }
    `;
    document.head.appendChild(style);
  }

  function card(id, label, value, note, secondary) {
    return `<article class="kpi-card b23268-debt-card${secondary ? ' is-secondary' : ''}">
      <span>${label}</span>
      <strong id="${id}">${value}</strong>
      <small>${note}</small>
    </article>`;
  }

  function ensureCards() {
    const grid = document.querySelector('#financial-control .kpi-grid');
    if (!grid) return false;

    if (!document.getElementById('kpi-debt-total')) {
      const committed = document.getElementById('kpi-committed')?.closest('.kpi-card');
      const html = card('kpi-debt-total', 'Deuda total pendiente', '$0', 'Saldo total de las deudas vigentes.', false)
        + card('kpi-debt-unmapped', 'Deuda no reflejada en cuotas', '$0', 'Diferencia entre deuda vigente y cuotas pendientes.', true);
      if (committed) committed.insertAdjacentHTML('afterend', html);
      else grid.insertAdjacentHTML('beforeend', html);
    }

    const committedLabel = document.getElementById('kpi-committed')?.previousElementSibling;
    if (committedLabel) committedLabel.textContent = 'Obligaciones programadas';

    let footer = document.getElementById('b23268-footer');
    if (!footer) {
      footer = document.createElement('div');
      footer.id = 'b23268-footer';
      footer.className = 'b23268-footer';
      footer.textContent = RELEASE;
      const control = document.getElementById('financial-control');
      if (control) control.appendChild(footer);
    }
    return true;
  }

  async function readDebtData() {
    if (debtRequest) return debtRequest;
    const db = window.supabaseClient;
    if (!db) return null;

    debtRequest = (async () => {
      const debtRes = await db
        .from('deudas')
        .select('saldo_actual')
        .eq('estado', 'vigente');
      if (debtRes.error) throw debtRes.error;

      const quotaRes = await db
        .from('cuotas_deuda')
        .select('monto')
        .in('estado', ['pendiente', 'vencida', 'atrasada']);
      if (quotaRes.error) throw quotaRes.error;

      const totalDebt = (debtRes.data || []).reduce((s, x) => s + Number(x.saldo_actual || 0), 0);
      const scheduledDebt = (quotaRes.data || []).reduce((s, x) => s + Number(x.monto || 0), 0);
      return { totalDebt, scheduledDebt, unmapped: Math.max(0, totalDebt - scheduledDebt) };
    })().catch(error => {
      console.error('[B232.68]', error);
      debtRequest = null;
      return null;
    });

    return debtRequest;
  }

  async function render() {
    if (!ensureCards()) return;
    const data = await readDebtData();
    if (!data) return;

    const total = document.getElementById('kpi-debt-total');
    const unmapped = document.getElementById('kpi-debt-unmapped');
    if (total) total.textContent = money(data.totalDebt);
    if (unmapped) unmapped.textContent = money(data.unmapped);
  }

  function wrapSummary() {
    if (refreshWrapped || !window.FinancialSummary || typeof window.FinancialSummary.init !== 'function') return;
    refreshWrapped = true;
    const original = window.FinancialSummary.init.bind(window.FinancialSummary);
    window.FinancialSummary.init = async function () {
      const result = await original();
      debtRequest = null;
      await render();
      return result;
    };
  }

  function boot() {
    injectStyle();
    wrapSummary();
    render();
    if (!refreshWrapped) setTimeout(boot, 250);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();

  window.B23268 = { RELEASE, render };
})();
