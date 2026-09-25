/* B234 — FIX ESTABLE DEL RESUMEN
   Corrige exclusivamente Total/Generados/Pendientes/Por realizar.
   Se mantiene activo porque B232.34 reconstruye la tarjeta periódicamente.
*/
(() => {
  'use strict';
  if (window.__CCF_B234_SUMMARY_STABLE__) return;
  window.__CCF_B234_SUMMARY_STABLE__ = true;

  const money = n => new Intl.NumberFormat('es-CL', {
    style:'currency', currency:'CLP', maximumFractionDigits:0
  }).format(Math.round(Number(n)||0));

  const value = el => {
    const n = Number(String(el?.textContent || '').replace(/[^\d-]/g,''));
    return Number.isFinite(n) ? Math.max(0,n) : 0;
  };

  function fix() {
    const report = document.getElementById('b234-report');
    const summary = report?.querySelector('.b234-summary');
    if (!summary) return false;

    const strong = summary.querySelectorAll('div strong');
    const pct = summary.querySelectorAll('div small:last-child');
    if (strong.length < 4) return false;

    const total = value(strong[0]);
    const generated = value(strong[1]);
    const future = value(strong[3]);

    // La conciliación del resumen debe ser estable:
    // Total = Generados + Pendientes + Por realizar.
    const pending = Math.max(0, total - generated - future);

    const vals = [total, generated, pending, future];
    vals.forEach((v,i) => {
      if (strong[i]) strong[i].textContent = money(v);
    });

    const percentages = [
      total ? Math.round(generated / total * 100) : 0,
      total ? Math.round(pending / total * 100) : 0,
      total ? Math.round(future / total * 100) : 0
    ];
    percentages.forEach((p,i) => {
      if (pct[i]) pct[i].textContent = `${p}%`;
    });
    return true;
  }

  let queued = false;
  function schedule() {
    if (queued) return;
    queued = true;
    queueMicrotask(() => {
      queued = false;
      fix();
    });
  }

  function install() {
    fix();

    const dashboard = document.getElementById('dashboard');
    if (dashboard) {
      const observer = new MutationObserver(() => schedule());
      observer.observe(dashboard, {childList:true, subtree:true});
      window.__CCF_B234_SUMMARY_OBSERVER__ = observer;
    }

    document.addEventListener('click', event => {
      if (event.target.closest('[data-tab="dashboard"],#b234Refresh')) {
        setTimeout(fix, 50);
        setTimeout(fix, 300);
      }
    }, true);

    // Refuerzos únicamente durante el arranque; el observer mantiene
    // la corrección cuando B232.34 vuelve a reconstruir el informe.
    [250,700,1500,3000].forEach(ms => setTimeout(fix,ms));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', install, {once:true});
  } else {
    install();
  }

  window.CCFB234SummaryStable = {refresh:fix};
})();
