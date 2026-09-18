/* B2.40 — Presupuesto Integrado Loader
   Carga una sola vez el módulo integrado y respeta el núcleo recuperado B2.36–B2.39. */
(function () {
  'use strict';
  if (window.__B240_PRESUPUESTO_LOADED__) return;
  window.__B240_PRESUPUESTO_LOADED__ = true;

  function load(src) {
    return new Promise(function(resolve, reject) {
      var s = document.createElement('script');
      s.src = src;
      s.async = false;
      s.onload = resolve;
      s.onerror = function(){ reject(new Error('No se pudo cargar ' + src)); };
      document.body.appendChild(s);
    });
  }

  window.B240PresupuestoLoader = {
    async start() {
      if (window.B240Presupuesto && typeof window.B240Presupuesto.init === 'function') {
        return window.B240Presupuesto.init();
      }
      await load('b240-presupuesto-integrado.js?v=240.0');
      return window.B240Presupuesto?.init?.();
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => window.B240PresupuestoLoader.start());
  } else {
    window.B240PresupuestoLoader.start();
  }
})();
