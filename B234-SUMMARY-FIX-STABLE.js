/* B234.4 — RESUMEN ESTABLE
   Corrección exclusiva de la tarjeta de resumen.
   No modifica Supabase, datos, autenticación ni otros módulos.
*/
(() => {
  'use strict';
  if (window.__CCF_B234_SUMMARY_STABLE__) return;
  window.__CCF_B234_SUMMARY_STABLE__ = true;

  const money = n => new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0
  }).format(Math.round(Number(n) || 0));

  const numberFrom = node => {
    const n = Number(String(node?.textContent || '').replace(/[^\d-]/g, ''));
    return Number.isFinite(n) ? n : 0;
  };

  function fix() {
    const report = document.getElementById('b234-report');
    const summary = report?.querySelector('.b234-summary');
    if (!summary) return false;

    const strong = summary.querySelectorAll('div strong');
    const pct = summary.querySelectorAll('div small:last-child');
    if (strong.length < 4) return false;

    // Usamos los valores que B232.34 acaba de renderizar.
    // La única corrección es garantizar la identidad:
    // Total = Generados + Pendientes + Por realizar.
    const total = Math.max(0, numberFrom(strong[0]));
    const generated = Math.max(0, numberFrom(strong[1]));
    const future = Math.max(0, numberFrom(strong[3]));
    const pending = Math.max(0, total - generated - future);

    strong[0].textContent = money(total);
    strong[1].textContent = money(generated);
    strong[2].textContent = money(pending);
    strong[3].textContent = money(future);

    if (pct[0]) pct[0].textContent = `${total ? Math.round(generated / total * 100) : 0}%`;
    if (pct[1]) pct[1].textContent = `${total ? Math.round(pending / total * 100) : 0}%`;
    if (pct[2]) pct[2].textContent = `${total ? Math.round(future / total * 100) : 0}%`;
    return true;
  }

  function schedule() {
    fix();
    [100, 300, 700, 1200, 2000].forEach(ms => setTimeout(fix, ms));
  }

  function observe() {
    const dashboard = document.getElementById('dashboard');
    if (!dashboard) {
      setTimeout(observe, 500);
      return;
    }

    const observer = new MutationObserver(mutations => {
      if (mutations.some(m => m.type === 'childList')) {
        // B232.34 puede reconstruir #b234-report.
        // Corregimos después de cada reconstrucción.
        setTimeout(fix, 0);
      }
    });

    observer.observe(dashboard, { childList: true, subtree: true });
    schedule();
  }

  function boot() {
    observe();
    document.addEventListener('click', event => {
      if (event.target.closest('[data-tab="dashboard"], #b234Refresh')) {
        schedule();
      }
    }, true);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }

  window.CCFB234SummaryStable = { refresh: fix };
})();
