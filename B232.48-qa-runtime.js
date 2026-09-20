/*
 * B232.48 · QA RUNTIME · REGRESSION AUDIT
 *
 * Auditoría aislada y manual.
 * NO intercepta clicks de negocio.
 * NO intercepta submit.
 * NO escribe en Supabase.
 * NO modifica app.js.
 * NO utiliza polling.
 * NO utiliza MutationObserver.
 *
 * Comprueba:
 * - secciones principales esperadas;
 * - scripts críticos presentes;
 * - IDs duplicados;
 * - estados visibles prolongados de carga.
 */
(function () {
  'use strict';

  if (window.B23248QA) return;

  var VERSION = '232.48.1';

  var REQUIRED_SECTIONS = [
    'dashboard',
    'movimientos',
    'pagos-futuros',
    'calendario',
    'ahorro',
    'deudas',
    'cuentas',
    'operaciones',
    'planificacion',
    'motor-multifuente',
    'control-jornada',
    'ia-financiera',
    'presupuesto'
  ];

  var CRITICAL_SCRIPTS = [
    'B232.43',
    'B232.46',
    'B232.47'
  ];

  var lastReport = null;

  function $(id) {
    return document.getElementById(id);
  }

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

  function sectionAudit() {
    var found = 0;
    var missing = [];

    REQUIRED_SECTIONS.forEach(function (id) {
      if ($(id) || document.querySelector(
        '[data-tab="' + id + '"]'
      )) {
        found++;
      } else {
        missing.push(id);
      }
    });

    return {
      found: found,
      total: REQUIRED_SECTIONS.length,
      missing: missing
    };
  }

  function scriptAudit() {
    var sourceText = Array.prototype.map.call(
      document.scripts,
      function (s) {
        return s.src || s.textContent || '';
      }
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
    var sections = sectionAudit();
    var scripts = scriptAudit();
    var duplicates = duplicateIds();
    var loading = loadingAudit();

    var errors =
      sections.missing.length +
      scripts.missing.length +
      duplicates.length +
      loading.length;

    var status = errors === 0 ? 'AUDITORÍA OK' : 'ATENCIÓN';

    lastReport = {
      version: VERSION,
      status: status,
      errors: errors,
      sections: sections,
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
          ? 'Sin inconsistencias detectadas en la auditoría runtime.'
          : errors + ' incidencia(s) detectada(s).';
    }

    if (sectionsEl) {
      sectionsEl.textContent =
        sections.found + '/' + sections.total;
    }

    if (scriptsEl) {
      scriptsEl.textContent =
        scripts.found + '/' + scripts.total;
    }

    if (idsEl) {
      idsEl.textContent =
        String(duplicates.length);
    }

    if (loadingEl) {
      loadingEl.textContent =
        String(loading.length);
    }

    if (detailEl) {
      if (errors === 0) {
        detailEl.textContent =
          'Secciones, scripts críticos, IDs y estados de carga verificados. ' +
          'La auditoría no modifica datos.';
      } else {
        var parts = [];

        if (sections.missing.length) {
          parts.push('Secciones faltantes: ' + sections.missing.join(', '));
        }

        if (scripts.missing.length) {
          parts.push('Scripts faltantes: ' + scripts.missing.join(', '));
        }

        if (duplicates.length) {
          parts.push('IDs duplicados: ' + duplicates.join(', '));
        }

        if (loading.length) {
          parts.push('Carga prolongada: ' + loading.join(', '));
        }

        detailEl.textContent = parts.join(' · ');
      }
    }

    return lastReport;
  }

  window.B23248QA = {
    version: VERSION,
    run: run,
    getLastReport: function () {
      return lastReport;
    }
  };

  document.addEventListener('DOMContentLoaded', function () {
    var button = $('b23248-run');

    if (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        run();
      });
    }

    /*
     * Una sola auditoría inicial.
     * El usuario puede repetirla manualmente.
     */
    run();
  }, { once: true });
})();
