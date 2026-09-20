/* ============================================================
   B232.40 — CORRECCIÓN DE CARGA DE PLANIFICACIÓN
   Objetivo:
   - Recuperar la vista #planificacion cuando el botón ya existe.
   - Evitar dependencia de onclick legacy.
   - Integrarse con la navegación B232.23 mediante observación de estado.
   - No modificar app.js, B232.35 ni B232.39.
   - Garantizar contenedor + renderizado de B232.32.
   ============================================================ */
(() => {
  'use strict';

  const VERSION = 'B232.40';
  if (window.__B23240_PLAN_FIX__) return;
  window.__B23240_PLAN_FIX__ = true;

  const $ = id => document.getElementById(id);

  function ensureSection() {
    const app = $('app');
    if (!app) return null;

    let section = $('planificacion');

    if (!section) {
      section = document.createElement('section');
      section.id = 'planificacion';
      section.className = 'tab hidden';
      app.appendChild(section);
    }

    if (!section.querySelector('#b216Content')) {
      section.innerHTML = '<div id="b216Content"></div>';
    }

    return section;
  }

  function setLoading() {
    const box = $('b216Content');
    if (!box || box.children.length) return;
    box.innerHTML =
      '<div class="card" style="padding:18px">' +
      '<p class="muted">Cargando Planificación financiera...</p>' +
      '</div>';
  }

  async function render() {
    const section = ensureSection();
    if (!section) return false;

    // B232.32 is the established planning engine. This bridge only
    // guarantees its DOM contract and invokes its public renderer.
    if (window.B23232Planificacion &&
        typeof window.B23232Planificacion.mount === 'function') {
      try {
        window.B23232Planificacion.mount();
      } catch (e) {
        console.error('[B232.40] mount B232.32:', e);
      }
    }

    const box = $('b216Content');
    if (!box) return false;

    setLoading();

    if (window.B23232Planificacion &&
        typeof window.B23232Planificacion.render === 'function') {
      try {
        await window.B23232Planificacion.render();
        return true;
      } catch (e) {
        console.error('[B232.40] render B232.32:', e);
        box.innerHTML =
          '<div class="card" style="padding:18px">' +
          '<p class="status">No fue posible cargar Planificación: ' +
          String(e?.message || e) +
          '</p></div>';
        return false;
      }
    }

    box.innerHTML =
      '<div class="card" style="padding:18px">' +
      '<p class="status">El motor de Planificación B232.32 no está disponible.</p>' +
      '</div>';

    return false;
  }

  function isVisible(section) {
    return !!section && !section.classList.contains('hidden');
  }

  function boot() {
    const section = ensureSection();
    if (!section) {
      setTimeout(boot, 500);
      return;
    }

    // If Planificación is already the active tab, render immediately.
    if (isVisible(section)) {
      setTimeout(render, 80);
    }

    // B232.23 performs navigation directly inside app.js and its
    // capture listener prevents legacy onclick handlers. Observing
    // the class change is therefore the safest non-invasive bridge.
    const observer = new MutationObserver(() => {
      const current = $('planificacion');
      if (isVisible(current)) {
        clearTimeout(window.__B23240_PLAN_TIMER__);
        window.__B23240_PLAN_TIMER__ = setTimeout(render, 60);
      }
    });

    observer.observe(section, {
      attributes: true,
      attributeFilter: ['class']
    });

    window.B23240Planificacion = {
      version: VERSION,
      ensureSection,
      render
    };

    // One delayed verification for modules that mount after this bridge.
    setTimeout(() => {
      const current = ensureSection();
      if (isVisible(current)) render();
    }, 1400);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    setTimeout(boot, 150);
  }
})();
