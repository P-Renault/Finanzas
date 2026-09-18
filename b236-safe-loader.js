/* FINANZAS B2.36 — CARGA CONTROLADA
   Recuperación progresiva:
   - Mantiene el núcleo estable actual.
   - NO carga B2.19/B2.20/B2.21/B2.22/B2.23/B2.24/B2.27.
   - Carga V2.3.3 (Deudas + Cuentas) SOLO después de una conexión exitosa.
   - No modifica Supabase ni crea/elimina datos.
*/
(() => {
  'use strict';

  const MODULE = 'finanzas-v233.js?v=b236-safe';

  function loadOnce() {
    if (document.querySelector(`script[data-b236="finanzas-v233"]`)) return;
    const s = document.createElement('script');
    s.dataset.b236 = 'finanzas-v233';
    s.src = MODULE;
    s.async = false;
    s.onload = () => {
      console.log('B2.36: Deudas/Cuentas cargado de forma controlada.');
      const st = document.getElementById('appStatus');
      if (st) st.textContent = 'Núcleo estable + Deudas/Cuentas cargados.';
    };
    s.onerror = () => {
      console.error('B2.36: no se pudo cargar finanzas-v233.js');
      const st = document.getElementById('appStatus');
      if (st) st.textContent = 'Núcleo conectado. No se pudo cargar Deudas/Cuentas.';
    };
    document.body.appendChild(s);
  }

  function connected() {
    return !!localStorage.getItem('sf_url') &&
           !!localStorage.getItem('sf_key') &&
           !document.getElementById('configPanel')?.classList.contains('hidden') &&
           false;
  }

  async function afterConnect() {
    // app.js oculta configPanel y muestra #app cuando la conexión inicializa.
    const app = document.getElementById('app');
    const panel = document.getElementById('configPanel');
    if (app && !app.classList.contains('hidden') &&
        panel && panel.classList.contains('hidden') &&
        localStorage.getItem('sf_url') && localStorage.getItem('sf_key')) {
      loadOnce();
    }
  }

  function install() {
    const original = window.connect;
    if (typeof original === 'function' && !original.__b236Wrapped) {
      const wrapped = async function (...args) {
        const result = await original.apply(this, args);
        setTimeout(afterConnect, 100);
        return result;
      };
      wrapped.__b236Wrapped = true;
      window.connect = wrapped;
    }

    // Si la página ya venía conectada por localStorage/autoconnect.
    setTimeout(afterConnect, 800);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', install, {once:true});
  } else {
    install();
  }
})();
