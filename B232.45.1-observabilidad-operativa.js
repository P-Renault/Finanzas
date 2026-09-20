/* ============================================================
   B232.45.1 — OBSERVABILIDAD OPERATIVA
   Capa de diagnóstico no invasiva para producción.

   - No escribe en Supabase.
   - No modifica cálculos financieros.
   - No modifica navegación existente.
   - No usa polling.
   - Expone diagnóstico desde el propio navegador móvil.
   ============================================================ */
(() => {
  'use strict';

  const VERSION = '232.45.1';
  if (window.B232451Observability?.version === VERSION) return;

  const state = {
    bootAt: new Date().toISOString(),
    errors: [],
    lastMutation: null
  };

  const $ = id => document.getElementById(id);

  function recordError(type, message, source = 'frontend') {
    const item = {
      type,
      message: String(message || 'Error desconocido').slice(0, 300),
      source,
      timestamp: new Date().toISOString()
    };
    state.errors.push(item);
    if (state.errors.length > 20) state.errors.shift();
    render();
  }

  window.addEventListener('error', event => {
    recordError(
      'javascript',
      event.message || 'Error JavaScript',
      event.filename || 'frontend'
    );
  }, true);

  window.addEventListener('unhandledrejection', event => {
    const reason = event.reason;
    recordError(
      'promise',
      reason?.message || reason || 'Promise rechazada',
      'unhandledrejection'
    );
  });

  function connectionState() {
    const db = window.supabaseClient;
    if (db) return 'CONECTADO';
    if (window.supabase) return 'CLIENTE DISPONIBLE';
    return 'NO DISPONIBLE';
  }

  function activeModule() {
    return document.querySelector('.tabs button.active')?.dataset.tab ||
      [...document.querySelectorAll('.tab')]
        .find(section => !section.classList.contains('hidden'))?.id ||
      'desconocido';
  }

  function loadingState() {
    const visible = [...document.querySelectorAll('.tab')]
      .filter(section => !section.classList.contains('hidden'));

    const loading = visible.some(section =>
      /cargando|calculando/i.test(section.textContent || '')
    );

    return loading ? 'CARGANDO' : 'ESTABLE';
  }

  function render() {
    const dashboard = $('dashboard');
    if (!dashboard) return;

    let panel = $('b232451Observability');

    if (!panel) {
      panel = document.createElement('section');
      panel.id = 'b232451Observability';
      panel.className = 'panel';
      panel.style.cssText =
        'margin:12px 0;padding:12px 14px;border:1px solid #e5e7eb;' +
        'border-radius:12px;background:#fff;font-size:12px';

      dashboard.prepend(panel);
    }

    const status = state.errors.length ? 'REVISAR' : 'ESTABLE';

    panel.innerHTML = `
      <div style="display:flex;justify-content:space-between;gap:10px;align-items:center">
        <div>
          <div style="font-size:11px;color:#64748b">B232.45.1 · OBSERVABILIDAD</div>
          <strong>Estado operativo</strong>
        </div>
        <strong>${status}</strong>
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(125px,1fr));gap:8px;margin-top:9px">
        <div><small>Versión</small><div><strong>${VERSION}</strong></div></div>
        <div><small>Supabase</small><div><strong>${connectionState()}</strong></div></div>
        <div><small>Módulo</small><div><strong>${activeModule()}</strong></div></div>
        <div><small>Estado UI</small><div><strong>${loadingState()}</strong></div></div>
        <div><small>Errores</small><div><strong>${state.errors.length}</strong></div></div>
      </div>

      <div style="margin-top:9px">
        ${state.errors.length
          ? state.errors.slice(-3).map(error =>
              `<div style="margin-top:4px"><strong>${error.type}</strong> · ${escapeHtml(error.message)}</div>`
            ).join('')
          : 'Sin errores de JavaScript registrados desde la carga de esta versión.'}
      </div>

      <button id="b232451Refresh" type="button" class="secondary" style="margin-top:9px">
        ↻ Actualizar diagnóstico
      </button>
    `;

    $('b232451Refresh')?.addEventListener('click', render, { once: true });
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function report() {
    const result = {
      version: VERSION,
      timestamp: new Date().toISOString(),
      uptimeMs: Math.round(performance.now()),
      supabase: connectionState(),
      activeModule: activeModule(),
      uiState: loadingState(),
      errors: [...state.errors]
    };

    window.B232451Observability.lastReport = result;
    window.__B232451_OBSERVABILITY__ = result;
    render();
    return result;
  }

  window.B232451Observability = {
    version: VERSION,
    run: report,
    getLastReport: () => window.B232451Observability.lastReport || null
  };

  function boot() {
    render();

    const app = $('app');
    if (app) {
      const observer = new MutationObserver(() => {
        state.lastMutation = new Date().toISOString();
        render();
      });

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
