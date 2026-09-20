/*
 * B232.45 · Observabilidad segura · FINAL ESTÁTICO
 * Panel persistente fuera del #dashboard.
 * Sin MutationObserver, sin polling, sin intervalos y sin tocar motores financieros.
 */
(function () {
  'use strict';

  if (window.B23245Observability) return;

  var VERSION = '232.45';
  var PANEL_ID = 'b23245-observability-panel';

  function $(id) { return document.getElementById(id); }

  function formatMs(value) {
    return Number.isFinite(value) ? Math.round(value) + ' ms' : '—';
  }

  function visibleTabId() {
    var tabs = document.querySelectorAll('.tab');
    for (var i = 0; i < tabs.length; i++) {
      if (!tabs[i].classList.contains('hidden')) return tabs[i].id || '—';
    }
    return '—';
  }

  function loadingState() {
    var visible = document.querySelector('.tab:not(.hidden)');
    if (!visible) return { state: 'NORMAL', detail: 'Sin pestaña visible' };
    var text = (visible.innerText || '').toLowerCase();
    if (/cargando|calculando/.test(text)) {
      return { state: 'ATENCIÓN', detail: 'Estado de carga detectado' };
    }
    return { state: 'ESTABLE', detail: 'Sin estados de carga persistentes' };
  }

  function audit() {
    var perf = window.performance;
    var nav = perf && perf.getEntriesByType
      ? perf.getEntriesByType('navigation')[0]
      : null;

    var dom = nav && Number.isFinite(nav.domContentLoadedEventEnd)
      ? nav.domContentLoadedEventEnd : NaN;

    var load = nav && Number.isFinite(nav.loadEventEnd) && nav.loadEventEnd > 0
      ? nav.loadEventEnd : NaN;

    var state = loadingState();

    return {
      version: VERSION,
      status: state.state,
      detail: state.detail,
      tab: visibleTabId(),
      dom: dom,
      load: load,
      scripts: document.scripts ? document.scripts.length : 0,
      supabase: !!window.supabaseClient,
      time: new Date().toLocaleTimeString('es-CL', {
        hour: '2-digit', minute: '2-digit', second: '2-digit'
      })
    };
  }

  function metric(label, value) {
    return '<div style="padding:10px;border-radius:10px;background:rgba(127,127,127,.08)">' +
      '<div style="font-size:10px;opacity:.68">' + label + '</div>' +
      '<div style="font-weight:700;margin-top:3px">' + value + '</div>' +
      '</div>';
  }

  function render(result) {
    var panel = $(PANEL_ID);
    if (!panel) return false;

    var status = $('b23245-status');
    var metrics = $('b23245-metrics');
    var detail = $('b23245-detail');

    if (status) status.textContent = result.status;
    if (metrics) {
      metrics.innerHTML =
        metric('DOM interactivo', formatMs(result.dom)) +
        metric('Carga', formatMs(result.load)) +
        metric('Scripts', String(result.scripts)) +
        metric('Supabase', result.supabase ? 'CLIENTE OK' : 'NO DETECTADO');
    }
    if (detail) {
      detail.textContent =
        'Pestaña: ' + result.tab + ' · ' +
        result.detail + ' · Auditoría ' + result.time;
    }
    return true;
  }

  function mount() {
    return render(audit());
  }

  window.B23245Observability = {
    version: VERSION,
    audit: audit,
    mount: mount,
    render: function () { return render(audit()); }
  };

  function boot() {
    mount();
    var button = $('b23245-audit');
    if (button && !button.dataset.b23245Bound) {
      button.dataset.b23245Bound = '1';
      button.addEventListener('click', function () {
        mount();
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();
