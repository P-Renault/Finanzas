/* ============================================================
   B232.36 — IA FINANCIERA / CARGA Y PERSISTENCIA DE CONTEXTO
   Corrección quirúrgica:
   - KPI se cargan automáticamente al entrar a IA Financiera.
   - Se usa FinanceRepository para evitar $0 falsos.
   - ingresos_futuros se consulta explícitamente.
   - No depende del onclick legacy de b227.
   - Se integra con el router propietario sin reemplazarlo.
   - refresh() conserva la pestaña activa.
   - No modifica Calendario, Resumen, Planificación u Operaciones.
   ============================================================ */
(() => {
  'use strict';

  const VERSION = 'B232.36';
  if (window.__B23236_IA_STABLE__) return;
  window.__B23236_IA_STABLE__ = true;

  const $ = id => document.getElementById(id);
  const n = v => {
    const x = Number(v);
    return Number.isFinite(x) ? x : 0;
  };
  const money = v => new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0
  }).format(n(v));

  const today = () => {
    const d = new Date();
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
      .toISOString().slice(0, 10);
  };

  const plusDays = (date, days) => {
    const d = new Date(`${date}T12:00:00`);
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
  };

  function setKpi(id, value) {
    const el = $(id);
    if (el) el.textContent = money(value);
  }

  function status(text) {
    const el = $('b227Answer');
    if (el && !el.dataset.userAnswer) el.textContent = text;

    const ia = $('ia-financiera');
    if (ia) ia.dataset.b23236Status = text;
  }

  async function getData() {
    const repo = window.FinanceRepository;
    if (!repo || typeof repo.loadSummaryContext !== 'function') {
      throw new Error('Motor financiero no disponible todavía.');
    }

    const context = await repo.loadSummaryContext();
    const db = window.supabaseClient;

    if (!db) {
      throw new Error('Supabase no está conectado.');
    }

    const t = context.today || today();
    const end = plusDays(t, 30);

    /*
     * ingresos_futuros es una fuente distinta de movimientos.
     * El B2.27 original solo miraba movimientos futuros y por eso podía
     * mostrar $0 aunque existieran ingresos programados.
     */
    const futureResult = await db
      .from('ingresos_futuros')
      .select('*')
      .gte('fecha', t)
      .lte('fecha', end);

    if (futureResult.error) {
      /*
       * Algunas instalaciones antiguas no tienen esta tabla.
       * No convertimos el resto del contexto en $0.
       */
      console.warn('[B232.36] ingresos_futuros:', futureResult.error.message);
    }

    const futureRows = futureResult.data || [];

    const futureTableIncome = futureRows.reduce(
      (sum, row) =>
        sum + n(row.monto ?? row.monto_neto ?? row.valor),
      0
    );

    const futureMovementIncome = (context.incomes || [])
      .filter(x => x.date >= t && x.date <= end)
      .reduce((sum, x) => sum + n(x.amount), 0);

    const futureIncome = futureTableIncome + futureMovementIncome;

    const obligations = (context.obligations || [])
      .filter(x => x.date <= end)
      .reduce((sum, x) => sum + n(x.amount), 0);

    const structuredDebt =
      n(context.debtPlanningSummary?.unpaid?.amount) +
      n(context.debtPlanningSummary?.negotiation?.amount) +
      n(context.debtPlanningSummary?.noStartDate?.amount);

    return {
      context,
      futureRows,
      liquidity: n(context.initialBalance),
      futureIncome,
      obligations,
      structuredDebt
    };
  }

  async function refreshKpis() {
    const section = $('ia-financiera');
    if (!section) return;

    /*
     * Si el módulo todavía no terminó de montarse, esperamos sin lanzar
     * errores ni cambiar de pestaña.
     */
    if (!$('b227Liq')) return;

    const currentTab =
      localStorage.getItem('cf_active_tab_v2') || 'ia-financiera';

    if (currentTab !== 'ia-financiera' &&
        section.classList.contains('hidden')) {
      return;
    }

    try {
      section.dataset.b23236Loading = '1';

      setKpi('b227Liq', 0);
      setKpi('b227In', 0);
      setKpi('b227Out', 0);
      setKpi('b227Debt', 0);

      const data = await getData();

      setKpi('b227Liq', data.liquidity);
      setKpi('b227In', data.futureIncome);
      setKpi('b227Out', data.obligations);
      setKpi('b227Debt', data.structuredDebt);

      section.dataset.b23236LoadedAt = new Date().toISOString();
      section.dataset.b23236Loading = '0';

      if ($('b227Answer') &&
          !$('b227Answer').dataset.userAnswer) {
        $('b227Answer').textContent =
          'Datos financieros actualizados correctamente. La IA está lista para analizar la situación actual.';
      }

      window.__B23236_IA_DATA__ = data;

    } catch (error) {
      console.error('[B232.36] KPI', error);
      section.dataset.b23236Loading = '0';

      /*
       * Importante: el error queda visible y no se transforma en $0.
       */
      if ($('b227Answer')) {
        $('b227Answer').textContent =
          'No se pudieron actualizar los KPI: ' +
          (error.message || error);
      }
    }
  }

  function showIaThroughExistingRouter() {
    const router = window.CCFRouter;

    if (router && typeof router.show === 'function') {
      router.show('ia-financiera');
      return true;
    }

    if (window.B23223Navigation &&
        typeof window.B23223Navigation.navigate === 'function') {
      window.B23223Navigation.navigate('ia-financiera');
      return true;
    }

    const section = $('ia-financiera');
    if (!section) return false;

    document.querySelectorAll('.tab').forEach(tab => {
      tab.classList.toggle('hidden', tab !== section);
    });

    document.querySelectorAll('.tabs button[data-tab]').forEach(button => {
      button.classList.toggle(
        'active',
        button.dataset.tab === 'ia-financiera'
      );
    });

    localStorage.setItem('cf_active_tab_v2', 'ia-financiera');
    return true;
  }

  function patchRouter() {
    const router = window.CCFRouter;

    if (!router || typeof router.show !== 'function') return false;
    if (router.__b23236Patched) return true;

    const original = router.show.bind(router);

    router.show = function(id) {
      const result = original(id);

      if (id === 'ia-financiera') {
        localStorage.setItem('cf_active_tab_v2', 'ia-financiera');

        /*
         * Esperamos al render del módulo dinámico sin bloquear el router.
         */
        setTimeout(refreshKpis, 0);
        setTimeout(refreshKpis, 250);
      }

      return result;
    };

    router.__b23236Patched = true;
    return true;
  }

  function patchRefresh() {
    if (typeof window.refresh !== 'function') return false;
    if (window.refresh.__b23236Patched) return true;

    const original = window.refresh;

    const wrapped = async function(...args) {
      const active =
        localStorage.getItem('cf_active_tab_v2') ||
        document.querySelector('.tabs button.active')?.dataset.tab ||
        'dashboard';

      const result = await original.apply(this, args);

      /*
       * El refresco global NO puede sacar al usuario de IA Financiera.
       */
      localStorage.setItem('cf_active_tab_v2', active);

      if (active === 'ia-financiera') {
        setTimeout(() => {
          showIaThroughExistingRouter();
          refreshKpis();
        }, 0);
      }

      return result;
    };

    wrapped.__b23236Patched = true;
    wrapped.__b23236Original = original;
    window.refresh = wrapped;

    return true;
  }

  function bindRefreshButtonIfPresent() {
    /*
     * Compatible con una futura versión que agregue un botón explícito.
     */
    document
      .querySelectorAll('[data-ia-refresh], #b227Refresh')
      .forEach(button => {
        if (button.dataset.b23236Bound) return;

        button.dataset.b23236Bound = '1';
        button.addEventListener('click', async event => {
          event.preventDefault();
          event.stopPropagation();
          await refreshKpis();
        });
      });
  }

  function observeMount() {
    const app = $('app');
    if (!app) return;

    const observer = new MutationObserver(() => {
      patchRouter();
      patchRefresh();
      bindRefreshButtonIfPresent();

      if ($('ia-financiera') &&
          !$('ia-financiera').classList.contains('hidden') &&
          $('b227Liq')) {
        refreshKpis();
      }
    });

    observer.observe(app, {
      subtree: true,
      childList: true
    });
  }

  function boot() {
    observeMount();

    /*
     * El router puede ser creado por B232.27 después de este archivo.
     * Polling corto y acotado; no queda ningún intervalo permanente.
     */
    let attempts = 0;
    const timer = setInterval(() => {
      attempts += 1;

      patchRouter();
      patchRefresh();
      bindRefreshButtonIfPresent();

      const active =
        localStorage.getItem('cf_active_tab_v2') ||
        document.querySelector('.tabs button.active')?.dataset.tab;

      if (active === 'ia-financiera') {
        showIaThroughExistingRouter();
        refreshKpis();
      }

      if (attempts >= 20) {
        clearInterval(timer);
      }
    }, 250);

    setTimeout(() => {
      patchRouter();
      patchRefresh();
      bindRefreshButtonIfPresent();
      refreshKpis();
    }, 1200);
  }

  window.B23236IA = {
    version: VERSION,
    refresh: refreshKpis,
    show: showIaThroughExistingRouter
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();
