/* CCF B234 — CORRECCIÓN QUIRÚRGICA DEL RESUMEN
   Solo corrige la tarjeta:
   Total de gastos / Generados / Pendientes / Por realizar.
   No toca Supabase, autenticación, planificación ni otros módulos.
*/
(() => {
  'use strict';
  if (window.__CCF_B234_SUMMARY_FIX__) return;
  window.__CCF_B234_SUMMARY_FIX__ = true;

  const money = n => new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0
  }).format(Math.round(Number(n) || 0));

  const parse = node => {
    const n = Number(String(node?.textContent || '').replace(/[^\d-]/g, ''));
    return Number.isFinite(n) ? n : 0;
  };

  function fix() {
    const report = document.getElementById('b234-report');
    const summary = report?.querySelector('.b234-summary');
    if (!summary) return false;

    const strong = summary.querySelectorAll('div strong');
    const small = summary.querySelectorAll('div small:last-child');
    if (strong.length < 4) return false;

    /*
      El error original era:
        pending = data.commitments + data.quotaTotal

      pero B232.34 expone "quotas", no "quotaTotal".
      Además, reconstruir desde las 8 tarjetas visibles puede omitir
      categorías y producir un total inconsistente.

      La tarjeta ya contiene el total consolidado. Por definición:
        Pendientes = Total - Generados - Por realizar
      Esto elimina NaN y mantiene la conciliación matemática.
    */
    const total = Math.max(0, parse(strong[0]));
    const generated = Math.max(0, parse(strong[1]));
    const future = Math.max(0, parse(strong[3]));
    const pending = Math.max(0, total - generated - future);

    strong[0].textContent = money(total);
    strong[1].textContent = money(generated);
    strong[2].textContent = money(pending);
    strong[3].textContent = money(future);

    if (small[0]) small[0].textContent =
      `${total ? Math.round(generated / total * 100) : 0}%`;
    if (small[1]) small[1].textContent =
      `${total ? Math.round(pending / total * 100) : 0}%`;
    if (small[2]) small[2].textContent =
      `${total ? Math.round(future / total * 100) : 0}%`;

    return true;
  }

  function schedule() {
    fix();
    [250, 700, 1500, 3000].forEach(ms => setTimeout(fix, ms));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', schedule, { once: true });
  } else {
    schedule();
  }

  document.addEventListener('click', event => {
    if (event.target.closest('[data-tab="dashboard"],#b234Refresh')) {
      setTimeout(fix, 180);
      setTimeout(fix, 800);
    }
  }, true);

  window.CCFB234SummaryFix = { refresh: fix };
})();
