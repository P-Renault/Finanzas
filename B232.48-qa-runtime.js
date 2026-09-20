/*
 * B232.48.2 · QA RUNTIME · REGRESSION AUDIT
 * Corrección: la auditoría valida el contrato real de navegación
 * (data-tab) en lugar de exigir IDs de secciones dinámicas.
 *
 * Aislado: no intercepta acciones financieras, no escribe en Supabase,
 * no usa polling ni MutationObserver.
 */
(function () {
  'use strict';

  if (window.B23248QA) return;

  var VERSION = '232.48.2';

  var REQUIRED_TABS = [
    'dashboard',
    'movimientos',
    'futuros',
    'calendario',
    'ahorro',
    'deudas',
    'cuentas',
    'operaciones',
    'planificacion'
  ];

  var CRITICAL_SCRIPTS = [
    'B232.43',
    'B232.46',
    'B232.47',
    'B232.48'
  ];

  var lastReport = null;

  function $(id) { return document.getElementById(id); }

  function visible(el) {
    if (!el) return false;
    var style = window.getComputedStyle(el);
    return style.display !== 'none' &&
      style.visibility !== 'hidden' &&
      !el.classList.contains('hidden');
  }

  function duplicateIds() {
    var seen = Object.create(null);
    var duplicates = [];

    document.querySelectorAll('[id]').forEach(function (el) {
      var id = el.id;
      if (!id) return;
      if (seen[id]) {
        if (!duplicates.includes(id)) duplicates.push(id);
      } else {
        seen[id] = true;
      }
    });

    return duplicates;
  }

  function navigationAudit() {
    var buttons = Array.prototype.slice.call(
      document.querySelectorAll('.tabs button[data-tab]')
    );

    var found = buttons.map(function (b) {
      return b.getAttribute('data-tab');
    }).filter(Boolean);

    var unique = found.filter(function (id, i, arr) {
      return arr.indexOf(id) === i;
    });

    var missing = REQUIRED_TABS.filter(function (id) {
      return unique.indexOf(id) === -1;
    });

    return {
      found: unique.filter(function (id) {
        return REQUIRED_TABS.indexOf(id) !== -1;
      }).length,
      total: REQUIRED_TABS.length,
      missing: missing,
      registered: unique
    };
  }

  function scriptAudit() {
    var sourceText = Array.prototype.map.call(
      document.scripts,
      function (s) { return s.src || s.textContent || ''; }
    ).join('\n');

    var missing = CRITICAL_SCRIPTS.filter(function (token) {
      return !sourceText.includes(token);
    });

    return {
      found: CRITICAL_SCRIPTS.length - missing.length,
      total: CRITICAL_SCRIPTS.length,
      missing: missing
    };
  }

  function loadingAudit() {
    var visibleTabs = Array.prototype.filter.call(
      document.querySelectorAll('.tab'),
      visible
    );
    var hits = [];

    visibleTabs.forEach(function (tab) {
      var text = (tab.innerText || '').toLowerCase();
      if (
        text.includes('calculando…') ||
        text.includes('calculando...') ||
        text.includes('cargando motor') ||
        text.includes('cargando...')
      ) {
        hits.push(tab.id || 'tab-visible');
      }
    });

    return hits;
  }

  function run() {
    var navigation = navigationAudit();
    var scripts = scriptAudit();
    var duplicates = duplicateIds();
    var loading = loadingAudit();

    var errors =
      navigation.missing.length +
      scripts.missing.length +
      duplicates.length +
      loading.length;

    var status = errors === 0 ? 'AUDITORÍA OK' : 'ATENCIÓN';

    lastReport = {
      version: VERSION,
      status: status,
      errors: errors,
      navigation: navigation,
      scripts: scripts,
      duplicateIds: duplicates,
      loadingStates: loading,
      timestamp: new Date().toISOString()
    };

    var statusEl = $('b23248-status');
    var summaryEl = $('b23248-summary');
    var sectionsEl = $('b23248-sections');
    var scriptsEl = $('b23248-scripts');
    var idsEl = $('b23248-ids');
    var loadingEl = $('b23248-loading');
    var detailEl = $('b23248-detail');

    if (statusEl) {
      statusEl.textContent = status;
      statusEl.style.color = errors === 0 ? '#166534' : '#b45309';
    }

    if (summaryEl) {
      summaryEl.textContent =
        errors === 0
          ? 'Contrato de navegación, scripts críticos, IDs y estados de carga verificados.'
          : errors + ' incidencia(s) detectada(s).';
    }

    if (sectionsEl) {
      sectionsEl.textContent = navigation.found + '/' + navigation.total;
    }

    if (scriptsEl) {
      scriptsEl.textContent = scripts.found + '/' + scripts.total;
    }

    if (idsEl) idsEl.textContent = String(duplicates.length);
    if (loadingEl) loadingEl.textContent = String(loading.length);

    if (detailEl) {
      if (errors === 0) {
        detailEl.textContent =
          'Navegación registrada: ' + navigation.registered.join(', ') +
          '. Sin IDs duplicados ni estados de carga bloqueados.';
      } else {
        var parts = [];
        if (navigation.missing.length)
          parts.push('Pestañas faltantes: ' + navigation.missing.join(', '));
        if (scripts.missing.length)
          parts.push('Scripts faltantes: ' + scripts.missing.join(', '));
        if (duplicates.length)
          parts.push('IDs duplicados: ' + duplicates.join(', '));
        if (loading.length)
          parts.push('Carga prolongada: ' + loading.join(', '));
        detailEl.textContent = parts.join(' · ');
      }
    }

    return lastReport;
  }

  window.B23248QA = {
    version: VERSION,
    run: run,
    getLastReport: function () { return lastReport; }
  };

  function boot() {
    var button = $('b23248-run');
    if (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        run();
      });
    }
    run();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();
