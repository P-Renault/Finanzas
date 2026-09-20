/* ============================================================
   B232.43 — RENDIMIENTO + UX · HARDENING FINAL
   Objetivo:
   - Medir rendimiento real de carga sin modificar motores financieros.
   - Evitar doble toque en acciones que disparan consultas.
   - Detectar estados prolongados de Cargando/Calculando.
   - Exponer un informe reproducible.
   - Mantener la navegación y los cálculos existentes intactos.

   REGLAS:
   - NO modifica app.js.
   - NO modifica B232.35/B232.39/B232.40/B232.41/B232.42.1.
   - NO escribe en Supabase.
   - NO usa setInterval.
   ============================================================ */
(() => {
  'use strict';

  const VERSION = '232.43';
  if (window.B23243Performance?.version === VERSION) return;

  const $ = id => document.getElementById(id);
  const now = () => performance.now();

  const moneyMs = value => `${Math.round(Number(value) || 0)} ms`;

  const state = {
    started: now(),
    navigation: [],
    longLoads: [],
    guardedClicks: 0,
    duplicateClickBlocks: 0
  };

  const criticalText = value => {
    const text = String(value || '').toLowerCase();
    return text.includes('cargando') || text.includes('calculando');
  };

  function currentTab() {
    return document.querySelector('.tabs button.active')?.dataset.tab || null;
  }

  function installActionGuard() {
    const selectors = [
      '#b23239Refresh',
      '#b23242Refresh',
      'button'
    ];

    const buttons = [...document.querySelectorAll(selectors.join(','))]
      .filter(button => {
        if (button.dataset.b23243Guarded === '1') return false;
        if (button.id === 'b23242Refresh' || button.id === 'b23239Refresh') return true;

        const text = (button.textContent || '').trim().toLowerCase();
        return /actualizar|registrar|guardar|eliminar|pagar|abono/.test(text);
      });

    buttons.forEach(button => {
      button.dataset.b23243Guarded = '1';

      let locked = false;

      button.addEventListener('click', event => {
        if (locked) {
          event.preventDefault();
          event.stopImmediatePropagation();
          state.duplicateClickBlocks++;
          return;
        }

        locked = true;
        state.guardedClicks++;
        button.dataset.b23243Locked = '1';

        const original = button.textContent;
        button.setAttribute('aria-busy', 'true');

        setTimeout(() => {
          locked = false;
          button.dataset.b23243Locked = '0';
          button.removeAttribute('aria-busy');

          // No restauramos texto: otros módulos pueden haberlo cambiado.
          if (!button.textContent.trim()) button.textContent = original;
        }, 900);
      }, true);
    });
  }

  function installNavigationMeasure() {
    const buttons = [...document.querySelectorAll('.tabs button[data-tab]')];

    buttons.forEach(button => {
      if (button.dataset.b23243Measured === '1') return;

      button.dataset.b23243Measured = '1';

      button.addEventListener('click', () => {
        const target = button.dataset.tab;
        const start = now();

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            state.navigation.push({
              from: currentTab(),
              target,
              ms: Math.round(now() - start),
              timestamp: new Date().toISOString()
            });

            if (state.navigation.length > 30) state.navigation.shift();
            render();
          });
        });
      }, false);
    });
  }

  function auditLoadingStates() {
    const sections = [...document.querySelectorAll('#app > .tab')];

    const prolonged = sections
      .filter(section => !section.classList.contains('hidden'))
      .map(section => {
        const text = section.textContent || '';
        return {
          id: section.id,
          loading: criticalText(text)
        };
      })
      .filter(item => item.loading);

    state.longLoads = prolonged;
    return prolonged;
  }

  function navigationTiming() {
    const entry = performance.getEntriesByType('navigation')[0];

    if (!entry) return null;

    return {
      domContentLoaded: Math.round(entry.domContentLoadedEventEnd),
      loadEvent: Math.round(entry.loadEventEnd),
      domInteractive: Math.round(entry.domInteractive),
      response: Math.round(entry.responseEnd - entry.requestStart),
      transfer: entry.transferSize || 0
    };
  }

  function resourceSummary() {
    const resources = performance.getEntriesByType('resource');

    const scripts = resources.filter(resource =>
      /\.js(?:\?|$)/i.test(resource.name)
    );

    return {
      resources: resources.length,
      scripts: scripts.length,
      scriptTransferBytes: scripts.reduce(
        (sum, resource) => sum + (resource.transferSize || 0),
        0
      )
    };
  }

  function render() {
    const dashboard = $('dashboard');
    if (!dashboard) return;

    let host = $('b23243PerformancePanel');

    if (!host) {
      host = document.createElement('section');
      host.id = 'b23243PerformancePanel';
      host.className = 'panel';
      host.style.cssText = [
        'margin:12px 0',
        'padding:12px 14px',
        'border:1px solid #e5e7eb',
        'border-radius:12px',
        'background:#fff',
        'font-size:12px'
      ].join(';');

      dashboard.prepend(host);
    }

    const timing = navigationTiming();
    const resources = resourceSummary();
    const loading = auditLoadingStates();

    const status = loading.length ? 'ATENCIÓN' : 'ESTABLE';

    host.innerHTML = `
      <div style="display:flex;justify-content:space-between;gap:10px;align-items:center">
        <div>
          <div style="font-size:11px;color:#64748b">B232.43 · RENDIMIENTO + UX</div>
          <strong>Estabilidad operativa</strong>
        </div>
        <strong>${status}</strong>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:8px;margin-top:9px">
        <div><small>DOM interactivo</small><div><strong>${timing ? moneyMs(timing.domInteractive) : '—'}</strong></div></div>
        <div><small>Carga</small><div><strong>${timing ? moneyMs(timing.loadEvent) : '—'}</strong></div></div>
        <div><small>Scripts</small><div><strong>${resources.scripts}</strong></div></div>
        <div><small>Navegaciones</small><div><strong>${state.navigation.length}</strong></div></div>
      </div>
      <div style="margin-top:8px">
        ${loading.length
          ? 'Estado prolongado detectado: ' + loading.map(x => x.id).join(', ')
          : 'Sin estados prolongados de Cargando/Calculando en el módulo visible.'}
      </div>
      <button id="b23243Refresh" type="button" class="secondary" style="margin-top:9px">
        ↻ Auditar rendimiento
      </button>
    `;

    $('b23243Refresh')?.addEventListener('click', () => run(), { once: true });
  }

  function run() {
    installActionGuard();
    installNavigationMeasure();

    const report = {
      version: VERSION,
      timestamp: new Date().toISOString(),
      durationMs: Math.round(now() - state.started),
      navigationTiming: navigationTiming(),
      resources: resourceSummary(),
      navigation: [...state.navigation],
      guardedClicks: state.guardedClicks,
      duplicateClickBlocks: state.duplicateClickBlocks,
      prolongedLoading: auditLoadingStates(),
      status: state.longLoads.length ? 'warning' : 'ok'
    };

    window.B23243Performance.lastReport = report;
    window.__B23243_PERFORMANCE__ = report;
    render();

    console.groupCollapsed(
      `[B232.43] ${report.status.toUpperCase()} · ${report.durationMs} ms`
    );
    console.log('Rendimiento', report.navigationTiming);
    console.log('Recursos', report.resources);
    console.log('Navegación', report.navigation);
    console.log('Bloqueos de doble toque', report.duplicateClickBlocks);
    console.log('Estados prolongados', report.prolongedLoading);
    console.groupEnd();

    return report;
  }

  window.B23243Performance = {
    version: VERSION,
    run,
    getLastReport: () => window.B23243Performance.lastReport || null
  };

  function boot() {
    run();

    const observer = new MutationObserver(() => {
      installActionGuard();
      installNavigationMeasure();
    });

    const app = $('app');
    if (app) {
      observer.observe(app, {
        childList: true,
        subtree: true
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();
