/* FINANZAS B2.3.3-R1 — bootstrap estable
   El index actual ya carga este archivo (deudas-centro.js).
   Lo usamos como punto estable para cargar la implementación V2.3.3 completa.
*/
(() => {
  function start() {
    if (!document.querySelector('link[data-fin23-css]')) {
      const l = document.createElement('link');
      l.rel = 'stylesheet';
      l.href = 'finanzas-v233.css?v=233';
      l.dataset.fin23Css = '1';
      document.head.appendChild(l);
    }

    if (!document.querySelector('script[data-fin23-js]')) {
      const s = document.createElement('script');
      s.src = 'finanzas-v233.js?v=233';
      s.dataset.fin23Js = '1';
      document.head.appendChild(s);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
