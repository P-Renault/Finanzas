/* ============================================================
   B232.39 — IA FINANCIERA · DATA BRIDGE
   Corrección quirúrgica del B2.27.

   OBJETIVO:
   El B2.27 crea correctamente la vista, pero su carga de KPI
   está atada al onclick del botón. B232.23 captura el clic de
   navegación y ejecuta stopImmediatePropagation(), por lo que
   ese onclick nunca se ejecuta.

   Esta versión:
   - NO modifica app.js.
   - NO modifica window.refresh.
   - NO modifica CCFRouter.
   - NO usa setInterval.
   - NO hace polling permanente.
   - Observa únicamente la creación/visibilidad de #ia-financiera.
   - Hace una carga al entrar y permite actualización manual.
   ============================================================ */
(() => {
  'use strict';

  const VERSION = 'B232.39';
  if (window.__B23239_IA_DATA_BRIDGE__) return;
  window.__B23239_IA_DATA_BRIDGE__ = true;

  const $ = id => document.getElementById(id);

  const money = value => {
    const n = Number(value);
    if (!Number.isFinite(n)) return '—';
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0
    }).format(n);
  };

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

  const num = value => {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
  };

  function db() {
    if (window.supabaseClient) return window.supabaseClient;

    const url = localStorage.getItem('sf_url');
    const key = localStorage.getItem('sf_key');

    if (!url || !key || !window.supabase?.createClient) return null;

    try {
      window.supabaseClient = window.supabase.createClient(url, key, {
        auth: {
          persistSession: false,
          autoRefreshToken: false
        }
      });
      return window.supabaseClient;
    } catch (error) {
      console.error('[B232.39] Supabase:', error);
      return null;
    }
  }

  function iaSection() {
    return $('ia-financiera');
  }

  function isVisible() {
    const section = iaSection();
    return !!section && !section.classList.contains('hidden');
  }

  function status(text, error = false) {
    const node = $('b227Answer');
    if (!node) return;

    node.textContent = text;
    node.style.color = error ? '#b91c1c' : '';
  }

  function kpi(id, value) {
    const node = $(id);
    if (node) node.textContent = money(value);
  }

  function setLoading() {
    // Durante la consulta NO se escriben ceros.
    const ids = ['b227Liq', 'b227In', 'b227Out', 'b227Debt'];

    ids.forEach(id => {
      const node = $(id);
      if (node && !node.dataset.b23239Loaded) {
        node.textContent = 'Cargando…';
      }
    });
  }

  async function query(table, columns, builder) {
    const client = db();
    if (!client) throw new Error('Supabase no está conectado.');

    let q = client.from(table).select(columns);
    if (builder) q = builder(q);

    const result = await q;

    if (result.error) {
      throw new Error(`${table}: ${result.error.message}`);
    }

    return result.data || [];
  }

  async function readSource(name, loader) {
    try {
      return {
        name,
        data: await loader(),
        error: null
      };
    } catch (error) {
      return {
        name,
        data: [],
        error: error?.message || String(error)
      };
    }
  }

  async function snapshot() {
    const t = today();
    const end = plusDays(t, 30);

    const sources = await Promise.all([
      readSource('cierre', () => query(
        'cierres_financieros',
        'saldo_efectivo_actual,saldo_inicial,fecha_corte,activo',
        q => q.eq('activo', true)
          .order('fecha_corte', { ascending: false })
          .limit(1)
      )),

      readSource('cuentas', () => query(
        'cuentas_bancarias',
        'saldo_actual,activa',
        q => q.eq('activa', true)
      )),

      readSource('movimientos', () => query(
        'movimientos',
        'id,tipo,fecha,monto',
        q => q.gte('fecha', t)
          .lte('fecha', end)
          .order('fecha', { ascending: true })
      )),

      readSource('compromisos', () => query(
        'compromisos',
        'id,concepto,fecha_vencimiento,monto,categoria,estado',
        q => q.eq('estado', 'pendiente')
          .gte('fecha_vencimiento', t)
          .lte('fecha_vencimiento', end)
      )),

      readSource('deudas', () => query(
        'v_deudas_resumen',
        'id,acreedor,saldo_actual,proximo_vencimiento,estado',
        q => q.order('proximo_vencimiento', { ascending: true })
          .limit(500)
      )),

      readSource('ingresos_futuros', () => query(
        'ingresos_futuros',
        '*',
        q => q.gte('fecha', t).lte('fecha', end)
      ))
    ]);

    const source = name =>
      sources.find(item => item.name === name) || {
        data: [],
        error: null
      };

    const closure = source('cierre').data[0] || {};
    const accounts = source('cuentas').data;
    const movements = source('movimientos').data;
    const commitments = source('compromisos').data;
    const debts = source('deudas').data;
    const futureIncome = source('ingresos_futuros').data;

    const bankBalance = accounts.reduce(
      (sum, row) => sum + num(row.saldo_actual),
      0
    );

    const cashBalance = num(
      closure.saldo_efectivo_actual ??
      closure.saldo_inicial
    );

    const liquidity = cashBalance + bankBalance;

    /*
     * Ingresos futuros:
     * 1. ingresos_futuros
     * 2. movimientos futuros
     *
     * Si ingresos_futuros trae movimiento_id, se evita duplicar
     * ese movimiento.
     */
    const movementIncome = movements.filter(row =>
      String(row.tipo || '').toLowerCase() === 'ingreso'
    );

    const linkedMovementIds = new Set(
      futureIncome
        .map(row =>
          row.movimiento_id ??
          row.movimientoId ??
          row.movement_id
        )
        .filter(id => id != null)
        .map(id => String(id))
    );

    const futureMovementIncome = movementIncome.reduce(
      (sum, row) => {
        if (linkedMovementIds.has(String(row.id))) return sum;
        return sum + num(row.monto);
      },
      0
    );

    const plannedIncome = futureIncome.reduce(
      (sum, row) => sum + num(
        row.monto ??
        row.monto_neto ??
        row.valor ??
        row.monto_bruto
      ),
      0
    );

    const futureTotal = plannedIncome + futureMovementIncome;

    const obligations = commitments.reduce(
      (sum, row) => sum + num(row.monto),
      0
    );

    const debt = debts
      .filter(row => {
        const state = String(row.estado || '')
          .trim()
          .toLowerCase();

        return ![
          'pagada',
          'cancelada',
          'cerrada',
          'liquidada'
        ].includes(state);
      })
      .reduce(
        (sum, row) => sum + num(row.saldo_actual),
        0
      );

    const errors = sources
      .filter(item => item.error)
      .map(item => `${item.name}: ${item.error}`);

    /*
     * Para no mostrar un conjunto de ceros engañoso:
     * si fallan todas las fuentes críticas, se aborta la actualización.
     */
    const critical = sources.filter(item =>
      ['cierre', 'cuentas', 'compromisos', 'deudas']
        .includes(item.name)
    );

    if (critical.every(item => item.error)) {
      throw new Error(
        'Las fuentes financieras principales no pudieron leerse. ' +
        errors.join(' | ')
      );
    }

    return {
      asOf: t,
      liquidity,
      futureIncome: futureTotal,
      obligations,
      debt,
      errors
    };
  }

  let running = false;

  async function refresh() {
    if (!isVisible() || running) return false;

    if (!$('b227Liq')) return false;

    running = true;

    try {
      setLoading();
      status('Cargando datos financieros reales…');

      const data = await snapshot();

      /*
       * Los KPI solamente se reemplazan después de una lectura válida.
       */
      kpi('b227Liq', data.liquidity);
      kpi('b227In', data.futureIncome);
      kpi('b227Out', data.obligations);
      kpi('b227Debt', data.debt);

      ['b227Liq', 'b227In', 'b227Out', 'b227Debt']
        .forEach(id => {
          const node = $(id);
          if (node) node.dataset.b23239Loaded = '1';
        });

      window.__B23239_IA_SNAPSHOT__ = data;

      if (data.errors.length) {
        status(
          'Datos cargados. Fuentes con advertencias: ' +
          data.errors.join(' | '),
          false
        );
      } else {
        status(
          `Datos financieros actualizados al ${data.asOf}.`
        );
      }

      return true;

    } catch (error) {
      console.error('[B232.39] IA Financiera:', error);

      /*
       * En error no se destruyen los últimos datos válidos.
       */
      status(
        'No fue posible cargar los datos financieros: ' +
        (error.message || error),
        true
      );

      return false;

    } finally {
      running = false;
    }
  }

  function installRefreshButton() {
    const hero = iaSection()?.querySelector('.b227-hero');

    if (!hero || $('b23239Refresh')) return;

    const button = document.createElement('button');
    button.id = 'b23239Refresh';
    button.type = 'button';
    button.className = 'secondary';
    button.textContent = '↻ Actualizar datos';
    button.style.marginTop = '10px';

    button.addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();
      refresh();
    });

    hero.appendChild(button);
  }

  function observeSection(section) {
    if (!section || section.dataset.b23239Observed === '1') {
      return;
    }

    section.dataset.b23239Observed = '1';

    let previousVisible =
      !section.classList.contains('hidden');

    const observer = new MutationObserver(() => {
      const currentVisible =
        !section.classList.contains('hidden');

      if (currentVisible && !previousVisible) {
        installRefreshButton();
        refresh();
      }

      previousVisible = currentVisible;
    });

    observer.observe(section, {
      attributes: true,
      attributeFilter: ['class']
    });

    /*
     * Cubre el caso de recarga con IA Financiera ya seleccionada.
     */
    if (previousVisible) {
      installRefreshButton();
      setTimeout(refresh, 50);
    }
  }

  function locateSection() {
    const section = iaSection();

    if (section) {
      observeSection(section);
      installRefreshButton();
      return true;
    }

    return false;
  }

  function boot() {
    /*
     * El módulo B2.27 se carga dinámicamente. Por eso observamos
     * solamente el árbol #app hasta que #ia-financiera exista.
     */
    const app = $('app');

    if (!app) return;

    if (locateSection()) return;

    if (!window.MutationObserver) return;

    const observer = new MutationObserver(() => {
      if (locateSection()) {
        observer.disconnect();
      }
    });

    observer.observe(app, {
      childList: true,
      subtree: true
    });
  }

  window.B23239IA = {
    version: VERSION,
    refresh
  };

  if (document.readyState === 'loading') {
    document.addEventListener(
      'DOMContentLoaded',
      boot,
      { once: true }
    );
  } else {
    boot();
  }
})();
