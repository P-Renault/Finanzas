/* ============================================================
   B232.37 — IA FINANCIERA · CARGA DE DATOS DEFINITIVA
   Objetivo:
   - Cargar KPI reales al abrir IA Financiera.
   - No depender de onclick de b227.
   - No intervenir router ni refresh global.
   - No mostrar $0 como sustituto de un error de lectura.
   - Mantener la pestaña IA Financiera después de refrescar.
   - Funcionar aunque el módulo B2.27 sea creado dinámicamente.
   ============================================================ */
(() => {
  'use strict';

  const VERSION = 'B232.37';
  if (window.__B23237_IA_DEFINITIVO__) return;
  window.__B23237_IA_DEFINITIVO__ = true;

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

  const addDays = (date, days) => {
    const d = new Date(`${date}T12:00:00`);
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
  };

  function db() {
    if (window.supabaseClient) return window.supabaseClient;

    const url = localStorage.getItem('sf_url');
    const key = localStorage.getItem('sf_key');

    if (!url || !key || !window.supabase?.createClient) {
      return null;
    }

    try {
      window.supabaseClient = window.supabase.createClient(url, key, {
        auth: {
          persistSession: false,
          autoRefreshToken: false
        }
      });
      return window.supabaseClient;
    } catch (error) {
      console.error('[B232.37] Supabase:', error);
      return null;
    }
  }

  function setStatus(message, error = false) {
    const node = $('b227Answer');
    if (!node) return;

    node.dataset.b23237Status = '1';
    node.textContent = message;
    node.style.color = error ? '#b91c1c' : '';
  }

  function setKpi(id, value) {
    const node = $(id);
    if (node) node.textContent = money(value);
  }

  function sectionVisible() {
    const section = $('ia-financiera');
    return !!section &&
      !section.classList.contains('hidden');
  }

  function markLoading() {
    const section = $('ia-financiera');
    if (section) section.dataset.b23237Loading = '1';

    /*
     * No ponemos $0 durante la consulta.
     * Los valores anteriores permanecen visibles.
     */
    setStatus('Actualizando datos financieros…');
  }

  function markLoaded() {
    const section = $('ia-financiera');
    if (section) {
      section.dataset.b23237Loading = '0';
      section.dataset.b23237LoadedAt = new Date().toISOString();
    }

    setStatus(
      'Datos financieros actualizados correctamente. ' +
      'La IA está lista para analizar la situación actual.'
    );
  }

  async function query(table, columns, options = {}) {
    const client = db();
    if (!client) {
      throw new Error('Supabase no está conectado.');
    }

    let q = client.from(table).select(columns);

    if (options.eq) {
      for (const [key, value] of Object.entries(options.eq)) {
        q = q.eq(key, value);
      }
    }

    if (options.gte) q = q.gte(options.gte[0], options.gte[1]);
    if (options.lte) q = q.lte(options.lte[0], options.lte[1]);
    if (options.order) q = q.order(options.order[0], options.order[1] ?? { ascending: true });
    if (options.limit) q = q.limit(options.limit);

    const { data, error } = await q;

    if (error) throw new Error(`${table}: ${error.message}`);

    return data || [];
  }

  async function loadData() {
    const client = db();
    if (!client) throw new Error('Supabase no está conectado.');

    const t = today();
    const end = addDays(t, 30);

    /*
     * Todas las fuentes se leen de forma independiente.
     * Un fallo de una tabla opcional no convierte las demás en $0.
     */
    const results = await Promise.allSettled([
      query('cuentas_bancarias',
        'saldo_actual,activa',
        { eq: { activa: true } }),

      query('cierres_financieros',
        'saldo_efectivo_actual,efectivo_actual,fecha_corte,activo',
        { eq: { activo: true }, order: ['fecha_corte', { ascending: false }], limit: 1 }),

      query('movimientos',
        'id,tipo,fecha,monto',
        { gte: ['fecha', t], lte: ['fecha', end], order: ['fecha', { ascending: true }] }),

      query('compromisos',
        'id,concepto,fecha_vencimiento,monto,estado',
        { eq: { estado: 'pendiente' }, gte: ['fecha_vencimiento', t], lte: ['fecha_vencimiento', end] }),

      query('v_deudas_resumen',
        'id,acreedor,saldo_actual,proximo_vencimiento,estado',
        { order: ['proximo_vencimiento', { ascending: true }], limit: 500 }),

      query('ingresos_futuros',
        '*',
        { gte: ['fecha', t], lte: ['fecha', end] })
    ]);

    const [accounts, closure, movements, commitments, debts, futureIncome] =
      results.map(r => r.status === 'fulfilled' ? r.value : []);

    const failures = results
      .map((r, i) => r.status === 'rejected' ? r.reason?.message || `Fuente ${i + 1}` : null)
      .filter(Boolean);

    /*
     * Liquidez = caja actual + cuentas bancarias activas.
     * Nunca se suma nuevamente el historial de movimientos.
     */
    const bank = accounts.reduce(
      (sum, row) => sum + n(row.saldo_actual),
      0
    );

    const latestClosure = closure[0] || {};
    const cash = n(
      latestClosure.saldo_efectivo_actual ??
      latestClosure.efectivo_actual
    );

    const liquidity = bank + cash;

    /*
     * Ingresos futuros:
     * - ingresos_futuros es la fuente explícita de planificación.
     * - movimientos futuros complementan esa fuente.
     *
     * Se evita doble contabilización cuando una fila de ingresos_futuros
     * contiene un movimiento_id que ya existe en movimientos.
     */
    const movementIncome = movements
      .filter(row => String(row.tipo).toLowerCase() === 'ingreso')
      .reduce((sum, row) => sum + n(row.monto), 0);

    const futureMovementIds = new Set(
      movements.map(row => String(row.id))
    );

    const plannedIncome = futureIncome.reduce((sum, row) => {
      const linkedId =
        row.movimiento_id ??
        row.movimientoId ??
        row.movement_id;

      if (linkedId != null && futureMovementIds.has(String(linkedId))) {
        return sum;
      }

      return sum + n(
        row.monto ??
        row.monto_neto ??
        row.valor ??
        row.monto_bruto
      );
    }, 0);

    const future = plannedIncome + movementIncome;

    const obligations = commitments.reduce(
      (sum, row) => sum + n(row.monto),
      0
    );

    const debt = debts
      .filter(row => !['pagada', 'cancelada'].includes(
        String(row.estado ?? '').trim().toLowerCase()
      ))
      .reduce((sum, row) => sum + n(row.saldo_actual), 0);

    if (
      results.every(r => r.status === 'rejected')
    ) {
      throw new Error(
        'No fue posible leer ninguna fuente financiera. ' +
        failures.join(' | ')
      );
    }

    return {
      asOf: t,
      liquidity,
      future,
      obligations,
      debt,
      diagnostics: {
        bank,
        cash,
        accounts: accounts.length,
        commitments: commitments.length,
        debts: debts.length,
        futureIncomeRows: futureIncome.length,
        movementIncomeRows: movements.length,
        failures
      }
    };
  }

  let request = 0;

  async function refresh() {
    if (!sectionVisible()) return false;
    if (!$('b227Liq')) return false;

    const token = ++request;

    try {
      markLoading();

      const data = await loadData();

      /* Si otra actualización terminó después, no pisa su resultado. */
      if (token !== request) return false;

      setKpi('b227Liq', data.liquidity);
      setKpi('b227In', data.future);
      setKpi('b227Out', data.obligations);
      setKpi('b227Debt', data.debt);

      window.__B23237_IA_DATA__ = data;

      markLoaded();
      return true;

    } catch (error) {
      console.error('[B232.37] IA Financiera:', error);

      const section = $('ia-financiera');
      if (section) section.dataset.b23237Loading = '0';

      /*
       * Conservamos los últimos valores válidos.
       * El error queda visible para diagnóstico.
       */
      setStatus(
        'No se pudieron actualizar los datos financieros: ' +
        (error.message || error),
        true
      );

      return false;
    }
  }

  function persistTab() {
    localStorage.setItem('cf_active_tab_v2', 'ia-financiera');
  }

  function observeSection() {
    const app = $('app');
    if (!app || !window.MutationObserver) return;

    const observer = new MutationObserver(() => {
      const section = $('ia-financiera');
      if (!section) return;

      if (sectionVisible()) {
        persistTab();

        if (
          $('b227Liq') &&
          section.dataset.b23237Loading !== '1'
        ) {
          refresh();
        }
      }
    });

    observer.observe(app, {
      subtree: true,
      attributes: true,
      attributeFilter: ['class']
    });
  }

  function observeModuleCreation() {
    const app = $('app');
    if (!app || !window.MutationObserver) return;

    const observer = new MutationObserver(() => {
      if ($('ia-financiera') && $('b227Liq')) {
        if (sectionVisible()) refresh();
      }
    });

    observer.observe(app, {
      subtree: true,
      childList: true
    });
  }

  function installManualRefresh() {
    const section = $('ia-financiera');
    if (!section) return;

    if ($('b227Refresh')) return;

    const hero = section.querySelector('.b227-hero');
    if (!hero) return;

    const button = document.createElement('button');
    button.id = 'b227Refresh';
    button.type = 'button';
    button.className = 'secondary';
    button.textContent = '↻ Actualizar datos';

    button.style.marginTop = '8px';

    button.addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();
      persistTab();
      refresh();
    });

    hero.appendChild(button);
  }

  function boot() {
    observeSection();
    observeModuleCreation();

    let attempts = 0;
    const timer = setInterval(() => {
      attempts++;

      installManualRefresh();

      const section = $('ia-financiera');

      if (
        section &&
        $('b227Liq') &&
        sectionVisible()
      ) {
        persistTab();
        refresh();
      }

      if (attempts >= 24) clearInterval(timer);
    }, 250);

    setTimeout(() => {
      installManualRefresh();

      const saved =
        localStorage.getItem('cf_active_tab_v2') ||
        document.querySelector('.tabs button.active')?.dataset.tab;

      if (
        saved === 'ia-financiera' &&
        $('ia-financiera') &&
        $('b227Liq')
      ) {
        persistTab();
        refresh();
      }
    }, 1500);
  }

  window.B23237IA = {
    version: VERSION,
    refresh
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();
