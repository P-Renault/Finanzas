/*
 * B232.45 · OBSERVABILIDAD SEGURA · FINAL
 *
 * Implementación aislada:
 * - El panel es HTML estático dentro de #dashboard.
 * - Este JS NO crea, mueve ni elimina el panel.
 * - No MutationObserver.
 * - No polling.
 * - No setInterval.
 * - No modifica app.js ni motores financieros.
 */
(function () {
  'use strict';

  if (window.B23245Observability) return;

  var VERSION = '232.45';
  var PANEL_ID = 'b23245-observability-panel';

  function $(id) {
    return document.getElementById(id);
  }

  function formatMs(value) {
    return Number.isFinite(value) ? Math.round(value) + ' ms' : '—';
  }

  function visibleTabId() {
    var tabs = document.querySelectorAll('.tab');
    for (var i = 0; i < tabs.length; i++) {
      if (!tabs[i].classList.contains('hidden')) {
        return tabs[i].id || '—';
      }
    }
    return '—';
  }

  function loadingState() {
    var visible = document.querySelector('.tab:not(.hidden)');
    if (!visible) return { state: 'NORMAL', detail: 'Sin pestaña visible' };

    var text = (visible.innerText || '').toLowerCase();

    if (/cargando|calculando/.test(text)) {
      return {
        state: 'ATENCIÓN',
        detail: 'Estado de carga detectado en la pestaña visible'
      };
    }

    return {
      state: 'ESTABLE',
      detail: 'Sin estados persistentes de Cargando/Calculando'
    };
  }

  function audit() {
    var navigation = window.performance &&
      window.performance.getEntriesByType
        ? window.performance.getEntriesByType('navigation')[0]
        : null;

    var scripts = document.scripts
      ? document.scripts.length
      : 0;

    var timing = navigation
      ? {
          domInteractive: navigation.domInteractive,
          loadEvent: navigation.loadEventEnd
        }
      : null;

    var state = loadingState();

    return {
      version: VERSION,
      status: state.state,
      tab: visibleTabId(),
      dom: timing ? timing.domInteractive : NaN,
      load: timing && timing.loadEvent > 0
        ? timing.loadEvent
        : NaN,
      scripts: scripts,
      supabase: !!window.supabaseClient,
      detail: state.detail,
      timestamp: new Date().toLocaleTimeString(
        'es-CL',
        {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        }
      )
    };
  }

  function metric(label, value) {
    return (
      '<div style="padding:10px;border-radius:10px;background:#f8fafc;">' +
        '<div style="font-size:10px;color:#64748b;">' +
          label +
        '</div>' +
        '<div style="font-weight:800;margin-top:3px;">' +
          value +
        '</div>' +
      '</div>'
    );
  }

  function render(result) {
    var panel = $(PANEL_ID);

    if (!panel) return;

    var status = $('b23245-status');
    var metrics = $('b23245-metrics');
    var detail = $('b23245-detail');

    if (status) {
      status.textContent = result.status;
      status.style.color =
        result.status === 'ESTABLE' ? '#15803d' : '#b45309';
    }

    if (metrics) {
      metrics.innerHTML =
        metric('DOM interactivo', formatMs(result.dom)) +
        metric('Carga', formatMs(result.load)) +
        metric('Scripts', String(result.scripts)) +
        metric(
          'Supabase',
          result.supabase ? 'CLIENTE OK' : 'NO DETECTADO'
        );
    }

    if (detail) {
      detail.textContent =
        'Pestaña: ' + result.tab +
        ' · ' + result.detail +
        ' · Auditoría: ' + result.timestamp;
    }
  }

  function run() {
    var result = audit();
    render(result);

    window.B23245Observability.lastReport = result;
    window.__B23245_OBSERVABILITY__ = result;

    return result;
  }

  function boot() {
    /*
     * El panel ya existe en el HTML.
     * Solo esperamos a que los módulos base hayan inicializado
     * Supabase y el DOM antes de realizar la primera auditoría.
     */
    run();

    setTimeout(run, 900);
    setTimeout(run, 2200);
  }

  window.B23245Observability = {
    version: VERSION,
    audit: audit,
    run: run,
    getLastReport: function () {
      return window.B23245Observability.lastReport || null;
    }
  };

  var button = $('b23245-audit');

  if (button) {
    button.addEventListener('click', function () {
      run();
    });
  }

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
