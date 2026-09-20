/*
 * B232.45 · Observabilidad segura
 *
 * Objetivo: observabilidad operativa sin tocar app.js, motores financieros,
 * navegación ni usar MutationObserver/polling.
 *
 * Principios:
 * - Una sola instalación.
 * - Una sola renderización inicial controlada.
 * - Auditoría manual bajo demanda.
 * - Sin intervalos ni observadores de todo #app.
 * - No altera datos financieros.
 */
(function () {
  'use strict';

  if (window.B23245Observability) return;

  var VERSION = '232.45';
  var PANEL_ID = 'b23245-observability-panel';

  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function formatMs(value) {
    if (!Number.isFinite(value)) return '—';
    return Math.round(value) + ' ms';
  }

  function visibleTabId() {
    var tabs = document.querySelectorAll('.tab');
    for (var i = 0; i < tabs.length; i++) {
      if (!tabs[i].classList.contains('hidden')) return tabs[i].id || '—';
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
    var nav = perf && perf.getEntriesByType ? perf.getEntriesByType('navigation')[0] : null;
    var paint = perf && perf.getEntriesByType ? perf.getEntriesByType('paint') : [];
    var scripts = document.scripts ? document.scripts.length : 0;
    var navMs = nav && Number.isFinite(nav.domContentLoadedEventEnd)
      ? nav.domContentLoadedEventEnd
      : (nav && Number.isFinite(nav.domInteractive) ? nav.domInteractive : NaN);
    var loadMs = nav && Number.isFinite(nav.loadEventEnd) && nav.loadEventEnd > 0
      ? nav.loadEventEnd
      : NaN;
    var firstPaint = NaN;
    for (var i = 0; i < paint.length; i++) {
      if (paint[i].name === 'first-contentful-paint') firstPaint = paint[i].startTime;
    }
    var state = loadingState();
    return {
      version: VERSION,
      status: state.state === 'ESTABLE' ? 'ESTABLE' : 'ATENCIÓN',
      tab: visibleTabId(),
      dom: navMs,
      load: loadMs,
      firstPaint: firstPaint,
      scripts: scripts,
      supabase: !!window.supabaseClient,
      detail: state.detail,
      timestamp: new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };
  }

  function render(result) {
    var panel = document.getElementById(PANEL_ID);
    if (!panel) return;

    panel.innerHTML =
      '<div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap">' +
        '<div>' +
          '<div style="font-size:11px;letter-spacing:.06em;opacity:.72">B232.45 · OBSERVABILIDAD SEGURA</div>' +
          '<div style="font-weight:700;font-size:18px;margin-top:4px">' + esc(result.status) + '</div>' +
        '</div>' +
        '<button type="button" id="b23245-audit" style="border:0;border-radius:10px;padding:9px 12px;cursor:pointer">Auditar ahora</button>' +
      '</div>' +
      '<div style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-top:14px">' +
        metric('DOM interactivo', formatMs(result.dom)) +
        metric('Carga', formatMs(result.load)) +
        metric('Scripts', String(result.scripts)) +
        metric('Supabase', result.supabase ? 'CLIENTE OK' : 'NO DETECTADO') +
      '</div>' +
      '<div style="margin-top:10px;font-size:12px;opacity:.78">Pestaña: ' + esc(result.tab) + ' · ' + esc(result.detail) + ' · Auditoría ' + esc(result.timestamp) + '</div>';

    var button = document.getElementById('b23245-audit');
    if (button) {
      button.addEventListener('click', function () {
        render(audit());
      }, { once: true });
    }
  }

  function metric(label, value) {
    return '<div style="padding:10px;border-radius:10px;background:rgba(127,127,127,.08)">' +
      '<div style="font-size:10px;opacity:.68">' + esc(label) + '</div>' +
      '<div style="font-weight:700;margin-top:3px">' + esc(value) + '</div>' +
      '</div>';
  }

  function mount() {
    if (document.getElementById(PANEL_ID)) return;
    var dashboard = document.getElementById('dashboard');
    if (!dashboard) return;

    var panel = document.createElement('section');
    panel.id = PANEL_ID;
    panel.className = 'panel';
    panel.style.marginTop = '16px';
    panel.setAttribute('aria-label', 'Observabilidad B232.45');
    dashboard.appendChild(panel);
    render(audit());
  }

  window.B23245Observability = {
    version: VERSION,
    audit: audit,
    mount: mount,
    render: function () { render(audit()); }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount, { once: true });
  } else {
    mount();
  }
})();
