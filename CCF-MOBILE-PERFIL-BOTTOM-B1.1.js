/* =========================================================
   CCF MOBILE · PERFIL INTEGRADO EN VISTA INFERIOR · B1.1
   ---------------------------------------------------------
   Integra el formulario REAL de CCF-PERFIL-USUARIO-B1.1
   dentro de la experiencia móvil inferior.

   Requisitos:
   1) CCF-MOBILE-B4.3.js cargado previamente.
   2) CCF-PERFIL-USUARIO-B1.1.js cargado previamente.

   No crea un segundo formulario.
   No modifica Supabase.
   No modifica el módulo financiero.
   ========================================================= */
(() => {
  'use strict';

  if (window.__CCF_MOBILE_PERFIL_BOTTOM_B11__) return;
  window.__CCF_MOBILE_PERFIL_BOTTOM_B11__ = true;

  const MOBILE_ROOT = () => document.getElementById('ccf-mobile-b43');
  const REAL_OVERLAY = () => document.getElementById('ccf-profile-overlay');
  const MOBILE_PROFILE = () =>
    MOBILE_ROOT()?.querySelector('.b434-overlay[data-overlay="profile"]');

  function injectMobileProfileStyle() {
    if (document.getElementById('ccf-mobile-profile-bottom-style')) return;

    const style = document.createElement('style');
    style.id = 'ccf-mobile-profile-bottom-style';
    style.textContent = `
      /* =====================================================
         PERFIL REAL · INTEGRADO EN LA SHELL MÓVIL
         ===================================================== */

      #ccf-mobile-b43 #ccf-profile-overlay {
        position: fixed !important;
        inset: 0 !important;
        z-index: 100000 !important;
        display: none !important;
        align-items: flex-end !important;
        justify-content: center !important;
        padding: 0 !important;
        background: rgba(15, 23, 42, .58) !important;
      }

      #ccf-mobile-b43 #ccf-profile-overlay.ccf-open {
        display: flex !important;
      }

      #ccf-mobile-b43 #ccf-profile-card {
        position: relative !important;
        width: 100% !important;
        max-width: 720px !important;
        max-height: 94vh !important;
        overflow: auto !important;
        box-sizing: border-box !important;
        margin: 0 !important;
        padding: 20px 18px calc(20px + env(safe-area-inset-bottom)) !important;
        border-radius: 22px 22px 0 0 !important;
        background: #fff !important;
        color: #111827 !important;
        box-shadow: 0 -18px 55px rgba(0,0,0,.28) !important;
      }

      #ccf-mobile-b43 #ccf-profile-card .ccf-profile-head {
        margin-bottom: 18px !important;
      }

      #ccf-mobile-b43 #ccf-profile-card .ccf-profile-avatar-wrap {
        margin-top: 6px !important;
      }

      #ccf-mobile-b43 #ccf-profile-card .ccf-profile-actions {
        position: sticky !important;
        bottom: 0 !important;
        z-index: 2 !important;
        display: grid !important;
        grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) !important;
        gap: 10px !important;
        margin: 18px -18px -20px !important;
        padding: 12px 18px calc(12px + env(safe-area-inset-bottom)) !important;
        background: rgba(255,255,255,.96) !important;
        border-top: 1px solid #e5e7eb !important;
        backdrop-filter: blur(8px) !important;
      }

      #ccf-mobile-b43 #ccf-profile-card #ccf-profile-save {
        min-height: 48px !important;
      }

      #ccf-mobile-b43 #ccf-profile-card #ccf-profile-cancel {
        min-height: 48px !important;
      }

      /* O modal simplificado da shell não deve aparecer por cima
         do formulario real. */
      #ccf-mobile-b43 > .b434-overlay[data-overlay="profile"] {
        display: none !important;
      }

      /* Evita que a barra inferior da aplicação fique por cima
         do formulario real. */
      #ccf-mobile-b43 #ccf-profile-overlay,
      #ccf-mobile-b43 #ccf-profile-overlay * {
        box-sizing: border-box;
      }
    `;
    document.head.appendChild(style);
  }

  function moveRealProfileIntoMobileShell() {
    const root = MOBILE_ROOT();
    const overlay = REAL_OVERLAY();

    if (!root || !overlay) return false;

    /*
     * O módulo real cria o overlay diretamente no body.
     * Nós o movemos para a shell móvel sem alterar o conteúdo
     * do formulário nem a lógica de Supabase.
     */
    if (overlay.parentNode !== root) {
      root.appendChild(overlay);
    }

    injectMobileProfileStyle();

    return true;
  }

  function closeMobileShellProfile() {
    const overlay = MOBILE_PROFILE();
    if (overlay) {
      overlay.classList.remove('open');
    }
    document.body.classList.remove('b434-lock');
  }

  function openIntegratedProfile() {
    const root = MOBILE_ROOT();
    if (!root) return false;

    const overlay = REAL_OVERLAY();

    if (!overlay) {
      /*
       * CCF-PERFIL-USUARIO-B1.1 pode ainda estar inicializando.
       * Esperamos a creación del overlay.
       */
      return false;
    }

    moveRealProfileIntoMobileShell();

    const shellOverlay = MOBILE_PROFILE();
    if (shellOverlay) shellOverlay.classList.remove('open');

    overlay.classList.add('ccf-open');
    document.body.classList.add('b434-lock');

    /*
     * El módulo real conserva su propia función openModal/loadProfile.
     * El click sobre su botón no es necesario: el overlay ya está
     * abierto y su contenido/formulario es el original.
     */
    return true;
  }

  function bindProfileButton() {
    const root = MOBILE_ROOT();
    if (!root) return;

    const button = root.querySelector('[data-profile]');
    if (!button || button.dataset.ccfIntegratedProfile === '1') return;

    button.dataset.ccfIntegratedProfile = '1';

    /*
     * Capture=true evita que el onclick original de B4.3 abra
     * el modal simplificado.
     */
    button.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopImmediatePropagation();

      if (openIntegratedProfile()) return;

      let tries = 0;
      const timer = setInterval(() => {
        tries++;

        if (openIntegratedProfile()) {
          clearInterval(timer);
          return;
        }

        if (tries >= 20) clearInterval(timer);
      }, 100);
    }, true);
  }

  function bindRealProfileClose() {
    const overlay = REAL_OVERLAY();
    if (!overlay || overlay.dataset.ccfMobileCloseBound === '1') return;

    overlay.dataset.ccfMobileCloseBound = '1';

    /*
     * El cierre por fondo conserva la lógica visual de la vista
     * móvil inferior.
     */
    overlay.addEventListener('click', function (event) {
      if (event.target === overlay) {
        overlay.classList.remove('ccf-open');
        document.body.classList.remove('b434-lock');
      }
    });
  }

  function removeDuplicateShellProfile() {
    const shellOverlay = MOBILE_PROFILE();
    if (!shellOverlay) return;
    shellOverlay.classList.remove('open');
  }

  function boot() {
    injectMobileProfileStyle();
    moveRealProfileIntoMobileShell();
    bindProfileButton();
    bindRealProfileClose();
    removeDuplicateShellProfile();
  }

  /*
   * La shell móvil y el módulo de perfil se construyen de forma
   * asíncrona. El observer solo busca esos dos elementos.
   */
  function observe() {
    if (!window.MutationObserver || !document.body) return;

    const observer = new MutationObserver(() => {
      boot();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    window.__CCF_MOBILE_PERFIL_BOTTOM_OBSERVER__ = observer;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      boot();
      observe();
    }, { once: true });
  } else {
    boot();
    observe();
  }

  window.CCFMobileProfileBottom = {
    version: 'B1.1',
    open: openIntegratedProfile,
    close: closeMobileShellProfile,
    refresh: boot
  };
})();
