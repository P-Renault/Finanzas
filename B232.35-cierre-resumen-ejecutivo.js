/* ============================================================
   B232.35 — CIERRE RESUMEN + DASHBOARD EJECUTIVO
   Objetivo:
   1) Restaurar el motor real del Centro de Control Financiero.
   2) Restaurar los 8 gráficos del Dashboard Ejecutivo.
   3) Mantener B232.34 sin reemplazarlo.
   4) No tocar navegación, Calendario, Deudas ni Planificación.
   5) Cargar las dependencias en orden y mostrar error explícito,
      nunca dejar "Calculando..." indefinidamente.
   ============================================================ */
(() => {
  'use strict';

  const VERSION = 'B232.35';
  if (window.__B23235_EXECUTIVE_CLOSURE__) return;
  window.__B23235_EXECUTIVE_CLOSURE__ = true;

  const $ = id => document.getElementById(id);

  const SOURCES = [
    'supabase_finanzas.js?v=5.0.1',
    'motor_estado_financiero.js?v=5.0.0',
    'motor_proyeccion_liquidez.js?v=5.0.0',
    'motor_brecha.js?v=5.0.0',
    'motor_margen_diario.js?v=5.0.0',
    'motor_alertas.js?v=5.0.0',
    'motor_acciones.js?v=5.0.0',
    'resumen-real.js?v=5.0.0',
    'dashboard-ejecutivo.js?v=1.2.6'
  ];

  function setStatus(text, error = false) {
    const node = $('summary-status-text');
    if (node) node.textContent = text;

    const executive = $('executive-risk-summary');
    if (executive && error) executive.textContent = text;

    const semaphore = $('summary-semaphore');
    if (semaphore && error) {
      semaphore.textContent = 'ERROR DE CARGA';
      semaphore.dataset.status = 'critical';
    }
  }

  function loaded(src) {
    return !!document.querySelector(`script[data-b23235="${src}"]`);
  }

  function loadOne(src) {
    return new Promise((resolve, reject) => {
      if (loaded(src)) {
        resolve();
        return;
      }

      const el = document.createElement('script');
      el.src = src;
      el.async = false;
      el.dataset.b23235 = src;

      el.onload = () => resolve();
      el.onerror = () => reject(new Error(`No se pudo cargar ${src}`));

      document.body.appendChild(el);
    });
  }

  async function loadDependencies() {
    for (const src of SOURCES) {
      await loadOne(src);
    }
  }

  function executiveReady() {
    return !!(
      window.FinanceRepository &&
      window.FinancialStateEngine &&
      window.LiquidityProjectionEngine &&
      window.FinancialGapEngine &&
      window.DailySpendingMarginEngine &&
      window.FinancialAlertEngine &&
      window.FinancialActionEngine &&
      window.FinancialSummary &&
      window.ExecutiveDashboard
    );
  }

  async function render() {
    const app = $('app');
    const dashboard = $('dashboard');

    if (!app || app.classList.contains('hidden') ||
        !dashboard || dashboard.classList.contains('hidden')) {
      return;
    }

    try {
      setStatus('Cargando motor financiero y Dashboard Ejecutivo...');

      await loadDependencies();

      if (!executiveReady()) {
        throw new Error(
          'El conjunto de motores financieros no quedó disponible después de la carga.'
        );
      }

      const result = await window.FinancialSummary.init();

      if (!result) {
        throw new Error('FinancialSummary no devolvió resultados.');
      }

      const context = result.context;
      const state = result.state;
      const projection = result.projection;

      if (!context || !state || !projection) {
        throw new Error(
          'El Centro de Control no entregó contexto, estado o proyección.'
        );
      }

      window.ExecutiveDashboard.renderCharts({
        context,
        projection,
        state
      });

      setStatus(
        `Centro de Control y Dashboard Ejecutivo actualizados · ${new Date().toLocaleTimeString('es-CL', {
          hour: '2-digit',
          minute: '2-digit'
        })}`
      );

      window.__B23235_LAST_RESULT__ = result;

      // Corrección de compatibilidad para B232.34:
      // expone el total de cuotas con un nombre estable para cualquier
      // integración posterior, sin modificar la lógica de Supabase.
      if (result.context?.obligations) {
        window.__B23235_OBLIGATIONS__ = result.context.obligations;
      }

      patchB234AfterRender();

    } catch (error) {
      console.error('[B232.35]', error);
      setStatus(
        `ERROR DE CARGA DEL RESUMEN: ${error.message || error}`,
        true
      );

      // Nunca dejamos el Dashboard Ejecutivo en "Calculando..."
      const labels = [
        'exec-liquidity-reading',
        'exec-obligation-reading',
        'exec-flow-reading',
        'exec-generation-reading'
      ];

      labels.forEach(id => {
        const node = $(id);
        if (node) node.textContent = 'No disponible';
      });

      [
        'chart-liquidity',
        'chart-flow',
        'chart-obligations',
        'chart-candles',
        'chart-risk',
        'chart-gap',
        'chart-debt-month',
        'chart-debt-planning'
      ].forEach(id => {
        const node = $(id);
        if (node) {
          node.innerHTML =
            '<div style="padding:24px;text-align:center;color:#64748b;font-size:12px">' +
            'No fue posible cargar este análisis. Revise el estado superior.' +
            '</div>';
        }
      });
    }
  }

  function patchB234AfterRender() {
    const report = $('b234-report');
    if (!report) return;

    /*
     * B232.34 tiene una referencia histórica a data.quotaTotal.
     * No se modifica el motor ni se inventan valores.
     * Aquí solo evitamos que una representación visual antigua
     * quede inconsistente cuando el informe ya está construido.
     */
    const summary = report.querySelector('.b234-summary');
    const result = window.__B23235_LAST_RESULT__;
    if (!summary || !result?.context) return;

    const obligations = result.context.obligations || [];
    const pending = obligations.reduce(
      (sum, item) => sum + Number(item.amount || 0),
      0
    );

    const totalNode = summary.querySelector('div:nth-child(1) strong');
    const pendingNode = summary.querySelector('div:nth-child(3) strong');
    const pendingPct = summary.querySelector('div:nth-child(3) small:last-child');

    if (pendingNode) {
      pendingNode.textContent = new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        maximumFractionDigits: 0
      }).format(pending);
    }

    const totalText = totalNode?.textContent || '';
    const total = Number(
      totalText.replace(/[^\d-]/g, '')
    ) || 0;

    if (pendingPct) {
      pendingPct.textContent =
        `${total > 0 ? Math.round((pending / total) * 100) : 0}%`;
    }
  }

  function installObservers() {
    document.addEventListener('click', event => {
      const dashboardButton =
        event.target.closest('[data-tab="dashboard"]');

      if (dashboardButton) {
        setTimeout(render, 250);
      }
    }, true);

    const app = $('app');
    if (app) {
      const observer = new MutationObserver(() => {
        if (!app.classList.contains('hidden') &&
            $('dashboard') &&
            !$('dashboard').classList.contains('hidden')) {
          setTimeout(render, 100);
        }
      });

      observer.observe(app, {
        attributes: true,
        attributeFilter: ['class']
      });
    }

    // Un único reintento de arranque; no se instala un intervalo infinito.
    setTimeout(render, 900);
    setTimeout(render, 2200);
  }

  function boot() {
    installObservers();
    render();
  }

  window.B23235ResumenEjecutivo = {
    version: VERSION,
    refresh: render
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();
