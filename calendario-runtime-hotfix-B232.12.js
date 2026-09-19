/* ============================================================
   FINANZAS — CALENDARIO RUNTIME HOTFIX · B232.12
   Propósito:
   - Elimina la competencia entre el calendario legacy de app.js
     y B232 Calendario V2.
   - B232 pasa a ser el único propietario visual del módulo.
   - No modifica Supabase ni datos financieros.
   ============================================================ */
(() => {
  'use strict';

  const VERSION = 'B232.12';
  const B232_SRC = 'b232-calendario-v2.js?v=232.12';
  let b232Promise = null;
  let installed = false;
  let observer = null;

  function isCalendarActive() {
    const section = document.getElementById('calendario');
    return !!section && !section.classList.contains('hidden');
  }

  function loadB232() {
    if (window.B232Calendario &&
        typeof window.B232Calendario.load === 'function') {
      return Promise.resolve(window.B232Calendario);
    }

    if (b232Promise) return b232Promise;

    b232Promise = new Promise((resolve, reject) => {
      const existing = document.querySelector(
        'script[data-b232-runtime-loader="1"]'
      );

      if (existing) {
        const wait = setInterval(() => {
          if (window.B232Calendario &&
              typeof window.B232Calendario.load === 'function') {
            clearInterval(wait);
            resolve(window.B232Calendario);
          }
        }, 50);

        setTimeout(() => {
          clearInterval(wait);
          if (window.B232Calendario &&
              typeof window.B232Calendario.load === 'function') {
            resolve(window.B232Calendario);
          } else {
            reject(new Error('B232 no quedó disponible.'));
          }
        }, 8000);
        return;
      }

      const s = document.createElement('script');
      s.src = B232_SRC;
      s.async = false;
      s.dataset.b232RuntimeLoader = '1';

      s.onload = () => {
        if (window.B232Calendario &&
            typeof window.B232Calendario.load === 'function') {
          resolve(window.B232Calendario);
        } else {
          reject(new Error('B232 cargó pero no expuso el motor.'));
        }
      };

      s.onerror = () =>
        reject(new Error('No se pudo cargar ' + B232_SRC));

      document.body.appendChild(s);
    });

    return b232Promise;
  }

  async function renderB232(reason) {
    if (!isCalendarActive()) return;

    try {
      const engine = await loadB232();

      if (engine && typeof engine.load === 'function') {
        await engine.load();
        const host = document.getElementById('calendario');
        if (host) {
          host.dataset.calendarOwner = VERSION;
          host.dataset.calendarReason = reason || 'runtime';
        }
      }
    } catch (error) {
      console.error('[B232.12]', error);
      const host = document.getElementById('calendario');

      /*
       * No sustituimos el contenido por un error destructivo.
       * Si B232 falla, se conserva la interfaz existente y el error
       * queda disponible en consola para diagnóstico.
       */
      if (host) {
        host.dataset.calendarOwner = 'ERROR';
        host.dataset.calendarError = error.message || String(error);
      }
    }
  }

  function neutralizeLegacyCalendarRenderer() {
    /*
     * app.js define renderCalendar() como función global.
     * refresh() la invoca automáticamente después de cargar datos.
     *
     * Reemplazamos únicamente ese renderer legacy. No tocamos
     * refresh(), movimientos, compromisos ni Supabase.
     */
    try {
      window.renderCalendar = function () {
        if (isCalendarActive()) {
          setTimeout(() => renderB232('legacy-render-intercept'), 0);
        }
      };
      window.__calendarLegacyRendererDisabled = true;
    } catch (e) {
      console.warn('[B232.12] No fue posible neutralizar renderer legacy', e);
    }
  }

  function installNavigationBridge() {
    if (installed) return;
    installed = true;

    /*
     * app.js conserva la navegación original.
     * Nosotros esperamos a que termine y luego entregamos el módulo
     * a B232. No usamos stopImmediatePropagation().
     */
    document.addEventListener('click', event => {
      const button = event.target.closest(
        '.tabs button[data-tab="calendario"]'
      );

      if (!button) return;

      setTimeout(() => renderB232('tab-click'), 0);
    }, false);

    /*
     * Si otro módulo vuelve a escribir el contenido de #calendario,
     * B232 recupera la propiedad visual.
     */
    const host = document.getElementById('calendario');

    if (host && window.MutationObserver) {
      let lastOwner = '';
      observer = new MutationObserver(() => {
        if (!isCalendarActive()) return;

        const owner = host.dataset.calendarOwner || '';

        /*
         * Evita bucles: cuando B232 renderiza también modifica el host.
         */
        if (owner === VERSION) {
          lastOwner = owner;
          return;
        }

        if (lastOwner === VERSION && owner === VERSION) return;

        clearTimeout(host.__b23212Timer);
        host.__b23212Timer = setTimeout(() => {
          if (isCalendarActive()) renderB232('dom-recovery');
        }, 0);
      });

      observer.observe(host, {
        childList: true,
        subtree: true
      });
    }
  }

  function boot() {
    neutralizeLegacyCalendarRenderer();
    installNavigationBridge();

    /*
     * Si el usuario ya está dentro de Calendario cuando este hotfix
     * entra en ejecución, se corrige inmediatamente.
     */
    if (isCalendarActive()) {
      renderB232('boot');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }

  window.B232CalendarRuntimeFix = {
    version: VERSION,
    load: () => renderB232('manual')
  };
})();
