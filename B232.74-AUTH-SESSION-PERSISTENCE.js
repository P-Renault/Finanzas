/* ============================================================
   B232.74 — AUTH SESSION PERSISTENCE
   Objetivo:
   - Forzar persistencia de sesión en el cliente Supabase del navegador.
   - Activar auto-refresh de tokens.
   - Mantener compatibilidad con B232.73 Auth Bridge.
   - No modifica tablas, datos, RLS ni módulos financieros.
   IMPORTANTE: cargar ANTES de B232.73.
   ============================================================ */
(() => {
  'use strict';

  const VERSION = 'B232.74-RELEASE-AUTH-SESSION-PERSISTENCE';
  const FOOTER_ID = VERSION;

  if (window.__B23274_AUTH_SESSION__) return;
  window.__B23274_AUTH_SESSION__ = true;

  function installCreateClientBridge() {
    if (!window.supabase?.createClient) return false;
    if (window.__B23274_CREATECLIENT_PATCHED__) return true;

    const original = window.supabase.createClient.bind(window.supabase);

    window.supabase.createClient = function (url, key, options) {
      const incoming = options || {};
      const incomingAuth = incoming.auth || {};

      const merged = {
        ...incoming,
        auth: {
          ...incomingAuth,
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl:
            incomingAuth.detectSessionInUrl !== undefined
              ? incomingAuth.detectSessionInUrl
              : true
        }
      };

      const client = original(url, key, merged);

      // Marca únicamente clientes creados por este puente.
      try {
        client.__B23274_PERSISTENT_AUTH__ = true;
      } catch (_) {}

      return client;
    };

    window.__B23274_CREATECLIENT_PATCHED__ = true;
    window.__B23274_ORIGINAL_CREATECLIENT__ = original;

    return true;
  }

  function ensureFooter() {
    let footer = document.getElementById('b23274Footer');
    if (footer) return footer;

    footer = document.createElement('div');
    footer.id = 'b23274Footer';
    footer.textContent = FOOTER_ID;

    Object.assign(footer.style, {
      position: 'fixed',
      left: '50%',
      bottom: '0',
      transform: 'translateX(-50%)',
      zIndex: '2147483647',
      padding: '2px 8px',
      borderRadius: '6px 6px 0 0',
      background: 'rgba(15,23,42,.92)',
      color: '#fff',
      font: '10px/1.2 monospace',
      pointerEvents: 'none',
      opacity: '.85'
    });

    document.body.appendChild(footer);
    return footer;
  }

  function exposeSessionApi() {
    window.FinanzasAuthSession = {
      version: VERSION,
      async getSession() {
        const client = window.supabaseClient;
        if (!client?.auth) return { session: null, user: null, error: 'Cliente Auth no disponible' };

        const { data, error } = await client.auth.getSession();
        return {
          session: data?.session || null,
          user: data?.session?.user || null,
          error: error || null
        };
      },
      async signOut() {
        const client = window.supabaseClient;
        if (!client?.auth) throw new Error('Cliente Auth no disponible');
        return client.auth.signOut({ scope: 'local' });
      }
    };
  }

  function subscribeWhenAvailable() {
    const client = window.supabaseClient;
    if (!client?.auth || client.__B23274_LISTENER__) return;

    client.__B23274_LISTENER__ = true;

    client.auth.onAuthStateChange((event, session) => {
      window.dispatchEvent(new CustomEvent('finanzas:auth-state', {
        detail: {
          event,
          authenticated: !!session,
          userId: session?.user?.id || null
        }
      }));

      if (event === 'SIGNED_OUT') {
        try { localStorage.removeItem('finanzas_auth_user'); } catch (_) {}
      } else if (session?.user?.id) {
        try {
          localStorage.setItem('finanzas_auth_user', session.user.id);
        } catch (_) {}
      }
    });
  }

  function boot() {
    installCreateClientBridge();
    exposeSessionApi();
    ensureFooter();

    // B232.73 puede crear/reasignar supabaseClient después de este script.
    const observer = new MutationObserver(() => subscribeWhenAvailable());
    if (document.body) observer.observe(document.body, { childList: true, subtree: true });

    [0, 250, 750, 1500, 2500, 4000].forEach(ms => {
      setTimeout(() => {
        installCreateClientBridge();
        subscribeWhenAvailable();
      }, ms);
    });

    console.info(`[${VERSION}] persistencia de sesión instalada.`);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();
