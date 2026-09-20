/*
 * B232.45 · Observabilidad segura · FINAL
 *
 * Integración deliberadamente aislada:
 * - No modifica app.js ni motores financieros.
 * - No usa MutationObserver.
 * - No usa setInterval ni polling.
 * - Montaje controlado en 0 / 900 / 2200 ms para convivir
 *   con los módulos de Resumen y Dashboard Ejecutivo.
 */
(function () {
  'use strict';

  if (window.B23245Observability) return;

  var VERSION = '232.45';
  var PANEL_ID = 'b23245-observability-panel';
  var MOUNT_ATTEMPTS = [0, 900, 2200];

  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function $(selector, root) {
    return (root || document).querySelector(selector);
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
    var visible = $('.tab:not(.hidden)');
    if (!visible) return { state: 'NORMAL', detail: 'Sin pestaña visible' };

    var text = (visible.innerText || '').toLowerCase();
    if (/cargando|calculando/.test(text)) {
      return { state: 'ATENCIÓN', detail: 'Estado transitorio detectado' };
    }

    return { state: 'ESTABLE', detail: 'Sin estados de carga persistentes' };
  }

  function audit() {
    var perf = window.performance;
    var nav = perf && perf.getEntriesByType
      ? perf.getEntriesByType('navigation')[0]
      : null;

    var scripts = document.scripts ? document.scripts.length : 0;

    var dom = nav && Number.isFinite(nav.domContentLoadedEventEnd)
      ? nav.domContentLoadedEventEnd
      : NaN;

    var load = nav &&
      Number.isFinite(nav.loadEventEnd) &&
      nav.loadEventEnd > 0
      ? nav.loadEventEnd
      : NaN;

    var state = loadingState();

    return {
      version: VERSION,
      status: state.state === 'ESTABLE' ? 'ESTABLE' : 'ATENCIÓN',
      tab: visibleTabId(),
      dom: dom,
      load: load,
      scripts: scripts,
      supabase: !!window.supabaseClient,
      detail: state.detail,
      timestamp: new Date().toLocaleTimeString(
        'es-CL',
        { hour: '2-digit', minute: '2-digit', second: '2-digit' }
      )
    };
  }

  function metric(label, value) {
    return '<div style="padding:10px;border-radius:10px;background:rgba(127,127,127,.08)">' +
      '<div style="font-size:10px;opacity:.68">' + esc(label) + '</div>' +
      '<div style="font-weight:700;margin-top:3px">' + esc(value) + '</div>' +
      '</div>';
  }

  function render(result) {
    var panel = document.getElementById(PANEL_ID);
    if (!panel) return;

    panel.innerHTML =
      '<div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap">' +
        '<div>' +
          '<div style="font-size:11px;letter-spacing:.06em;opacity:.72">B232.45 · OBSERVABILIDAD SEGURA</div>' +
          '<div style="font-weight:700;font-size:18px;margin-top:4px">' +
            esc(result.status) +
          '</div>' +
        '</div>' +
        '<button type="button" id="b23245-audit" style="border:0;border-radius:10px;padding:9px 12px;cursor:pointer">Auditar ahora</button>' +
      '</div>' +
      '<div style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-top:14px">' +
        metric('DOM interactivo', formatMs(result.dom)) +
        metric('Carga', formatMs(result.load)) +
        metric('Scripts', String(result.scripts)) +
        metric('Supabase', result.supabase ? 'CLIENTE OK' : 'NO DETECTADO') +
      '</div>' +
      '<div style="margin-top:10px;font-size:12px;opacity:.78">' +
        'Pestaña: ' + esc(result.tab) +
        ' · ' + esc(result.detail) +
        ' · Auditoría ' + esc(result.timestamp) +
      '</div>';

    var button = document.getElementById('b23245-audit');
    if (button) {
      button.addEventListener('click', function () {
        render(audit());
      });
    }
  }

  function mount() {
    var dashboard = document.getElementById('dashboard');
    if (!dashboard) return false;

    var existing = document.getElementById(PANEL_ID);

    if (!existing) {
      existing = document.createElement('section');
      existing.id = PANEL_ID;
      existing.className = 'panel';
      existing.style.marginTop = '16px';
      existing.setAttribute('aria-label', 'Observabilidad B232.45');

      dashboard.appendChild(existing);
    }

    render(audit());
    return true;
  }

  window.B23245Observability = {
    version: VERSION,
    audit: audit,
    mount: mount,
    render: function () {
      render(audit());
    }
  };

  function scheduleMounts() {
    for (var i = 0; i < MOUNT_ATTEMPTS.length; i++) {
      (function (delay) {
        setTimeout(function () {
          mount();
        }, delay);
      })(MOUNT_ATTEMPTS[i]);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scheduleMounts, { once: true });
  } else {
    scheduleMounts();
  }
})();
