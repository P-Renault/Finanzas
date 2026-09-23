/*
  B232.71-RELEASE-AUTH-BRIDGE
  Corrige la integración entre Supabase Auth y el motor financiero legacy.
  - Reutiliza exactamente el cliente autenticado creado por B232.70.
  - Evita que app.js cree un segundo cliente anónimo/no autenticado.
  - Entrega la sesión autenticada al binding global `db` de app.js.
  - Hace que window.connect() devuelva true cuando la aplicación queda inicializada.
  - Mantiene persistSession/autoRefreshToken.
  - No modifica tablas, datos, RLS ni módulos financieros.
  - Compatible con B232.69 + B232.70.
*/
(() => {
  'use strict';

  const VERSION = 'B232.71-RELEASE-AUTH-BRIDGE';

  if (window.__B23271_AUTH_BRIDGE__) return;
  window.__B23271_AUTH_BRIDGE__ = true;

  function setFooter() {
    const footer = document.getElementById('b23269-footer');
    if (footer) footer.textContent = VERSION;

    const marker = document.getElementById('b23269-version-marker');
    if (marker) marker.textContent = VERSION;

    let badge = document.getElementById('b23271-bridge-badge');
    if (!badge) {
      badge = document.createElement('div');
      badge.id = 'b23271-bridge-badge';
      badge.textContent = VERSION;
      badge.style.cssText =
        'position:fixed;bottom:0;left:0;right:0;z-index:99999;' +
        'padding:5px 8px;text-align:center;background:#f8fafc;' +
        'border-top:1px solid #e2e8f0;color:#64748b;' +
        'font:600 10px/1.2 system-ui,sans-serif;letter-spacing:.04em;';
      document.body.appendChild(badge);
    }
  }

  function getClient() {
    return window.__B23270_CLIENT__ ||
           window.__B23269_CLIENT__ ||
           window.supabaseClient ||
           null;
  }

  function installBridge() {
    const client = getClient();
    if (!client) return false;

    /*
      app.js declares `let db = null` in the global script scope.
      A later classic script can access that global lexical binding directly.
      We deliberately point it at the authenticated Auth client instead of
      allowing app.js to create another unauthenticated client.
    */
    try {
      db = client;
    } catch (error) {
      console.error('[B232.71] No se pudo enlazar db:', error);
      return false;
    }

    window.supabaseClient = client;

    /*
      Replace only the legacy connection entry point. The financial modules
      continue using their existing `db` binding and refresh/render functions.
    */
    window.connect = async function b23271Connect() {
      try {
        const active = getClient();
        if (!active) throw new Error('No existe un cliente Supabase autenticado.');

        try { db = active; } catch (_) {}
        window.supabaseClient = active;

        const sessionResult = await active.auth.getSession();
        if (sessionResult.error) throw sessionResult.error;
        if (!sessionResult.data?.session) {
          throw new Error('No existe una sesión autenticada activa.');
        }

        try {
          localStorage.setItem(
            'sf_url',
            'https://xgxvdbgmwvncmfdcxgsf.supabase.co'
          );
          localStorage.setItem(
            'sf_key',
            'sb_publishable_fJqOSLC7dhYKttuU1uAvcQ_AX-aH4PB'
          );
        } catch (_) {}

        document.getElementById('configPanel')?.classList.add('hidden');
        document.getElementById('app')?.classList.remove('hidden');
        document.getElementById('logoutBtn')?.classList.remove('hidden');

        if (typeof window.refresh === 'function') {
          await window.refresh();
        } else {
          try {
            await refresh();
          } catch (_) {}
        }

        setFooter();
        return true;
      } catch (error) {
        console.error('[B232.71] connect bridge:', error);
        const status = document.getElementById('b23269-auth-status');
        if (status) {
          status.textContent =
            'Supabase: ' +
            (error?.message || String(error));
          status.style.color = '#b91c1c';
          status.style.fontWeight = '700';
        }
        return false;
      }
    };

    setFooter();
    return true;
  }

  async function waitForAuthClient() {
    for (let i = 0; i < 120; i++) {
      if (installBridge()) return;
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const status = document.getElementById('b23269-auth-status');
    if (status) {
      status.textContent =
        'B232.71: no se pudo enlazar el cliente Auth con el motor financiero.';
      status.style.color = '#b91c1c';
      status.style.fontWeight = '700';
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', waitForAuthClient, {once:true});
  } else {
    waitForAuthClient();
  }
})();
