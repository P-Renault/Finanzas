/* =========================================================
   CCF MOBILE · PERFIL REAL · INTEGRACIÓN B1.0
   ---------------------------------------------------------
   Objetivo:
   - El botón P de la shell móvil debe abrir el módulo real
     CCF-PERFIL-USUARIO-B1.1.js.
   - No recrea ni reemplaza el formulario de perfil.
   - No modifica Supabase, autenticación ni escritorio.
   - Mantiene un fallback al modal simplificado si el módulo
     real todavía no está disponible.
   ========================================================= */

(function () {
  'use strict';

  function openRealProfile() {
    var realProfile = document.getElementById('ccf-profile-button');

    if (realProfile) {
      try {
        realProfile.click();
        return true;
      } catch (error) {
        console.warn('[CCF MOBILE] No se pudo abrir el perfil real:', error);
      }
    }

    return false;
  }

  /*
   * Sobrescribe únicamente el comportamiento del botón de perfil
   * de la shell móvil existente.
   */
  function bindMobileProfileButton() {
    var root = document.getElementById('ccf-mobile-b43');
    if (!root) return;

    var button = root.querySelector('[data-profile]');
    if (!button || button.dataset.ccfRealProfileBound === '1') return;

    button.dataset.ccfRealProfileBound = '1';

    button.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopImmediatePropagation();

      if (openRealProfile()) return;

      /*
       * Fallback: si CCF-PERFIL-USUARIO-B1.1 aún no terminó
       * de inicializar, esperamos brevemente y volvemos a intentar.
       */
      var attempts = 0;
      var timer = setInterval(function () {
        attempts++;

        if (openRealProfile()) {
          clearInterval(timer);
          return;
        }

        if (attempts >= 10) {
          clearInterval(timer);
        }
      }, 150);
    }, true);
  }

  function boot() {
    bindMobileProfileButton();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }

  /*
   * La shell móvil puede reconstruirse después del login o al
   * cambiar de módulo; por eso observamos únicamente su creación.
   */
  if (window.MutationObserver && document.body) {
    var observer = new MutationObserver(function () {
      bindMobileProfileButton();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
})();
