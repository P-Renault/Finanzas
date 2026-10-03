/* CCF PWA INSTALLER — B1.3
 * No APK. No Play Store.
 * Requires HTTPS and a valid manifest + active root-scoped Service Worker.
 */
(() => {
  'use strict';

  let deferredPrompt = null;

  const isStandalone = () =>
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true;

  const registerSW = async () => {
    if (!('serviceWorker' in navigator)) return null;
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });
      await navigator.serviceWorker.ready;
      return registration;
    } catch (err) {
      console.warn('[CCF PWA] Service Worker registration failed:', err);
      return null;
    }
  };

  const updateButtons = () => {
    document.querySelectorAll('[data-ccf-install]').forEach(btn => {
      btn.hidden = isStandalone();
      btn.disabled = false;
    });
  };

  const install = async () => {
    if (isStandalone()) return;

    if (deferredPrompt) {
      deferredPrompt.prompt();
      try {
        await deferredPrompt.userChoice;
      } finally {
        deferredPrompt = null;
        updateButtons();
      }
      return;
    }

    // Android/Chrome may expose installation through its browser menu
    // even when beforeinstallprompt is unavailable.
    alert(
      'Para instalar Control Financiero, abre el menú ⋮ de Chrome y selecciona ' +
      '"Instalar aplicación" o "Agregar a pantalla principal".'
    );
  };

  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    deferredPrompt = event;
    updateButtons();
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    updateButtons();
  });

  document.addEventListener('click', event => {
    const button = event.target.closest?.('[data-ccf-install]');
    if (!button) return;
    event.preventDefault();
    install();
  });

  window.addEventListener('DOMContentLoaded', async () => {
    await registerSW();
    updateButtons();
  });

  window.CCFPWA = { install, isStandalone };
})();
