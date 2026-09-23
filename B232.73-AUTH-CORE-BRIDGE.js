/*
  B232.76 — AUTH / CLIENT / RLS COMPATIBILITY BRIDGE
  Corrección integral posterior a B232.75.

  Corrige tres puntos:
  1) Cliente Supabase único y autenticado para todos los módulos.
  2) Persistencia/recuperación de sesión.
  3) Compatibilidad de Presupuesto con tablas user-scoped: si las tablas
     presupuestos/presupuesto_lineas exigen user_id, se inyecta el usuario
     autenticado sin modificar SQL/RLS.

  No modifica datos existentes, RPC, RLS ni estructura de Supabase.
*/
(() => {
  'use strict';

  const VERSION = 'B232.76-AUTH-RLS-COMPATIBILITY';
  const SUPABASE_URL = 'https://xgxvdbgmwvncmfdcxgsf.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_fJqOSLC7dhYKttuU1uAvcQ_AX-aH4PB';

  if (window.__B23276_AUTH_BRIDGE__) return;
  window.__B23276_AUTH_BRIDGE__ = true;

  const sleep = ms => new Promise(r => setTimeout(r, ms));

  function getClient() {
    return window.__B23276_CLIENT__ ||
           window.__B23275_CLIENT__ ||
           window.__B23270_CLIENT__ ||
           window.__B23269_CLIENT__ ||
           window.__B23273_CLIENT__ ||
           window.supabaseClient ||
           null;
  }

  function publish(client) {
    if (!client) return null;
    window.__B23276_CLIENT__ = client;
    window.__B23275_CLIENT__ = client;
    window.__B23273_CLIENT__ = client;
    window.__B23270_CLIENT__ = client;
    window.__B23269_CLIENT__ = client;
    window.supabaseClient = client;
    window.db = client;
    return client;
  }

  function setStatus(message, error=false) {
    const el = document.getElementById('b23269-auth-status');
    if (!el) return;
    el.textContent = message;
    el.style.color = error ? '#b91c1c' : '#475569';
    el.style.fontWeight = error ? '700' : '400';
  }

  function installUiCss() {
    if (document.getElementById('b23276-auth-css')) return;
    const style = document.createElement('style');
    style.id = 'b23276-auth-css';
    style.textContent = `
      #b23269-auth-panel.hidden,
      #configPanel.hidden {
        display:none !important;
      }
    `;
    document.head.appendChild(style);
  }

  function hideAuthUi() {
    document.getElementById('b23269-auth-panel')?.classList.add('hidden');
    document.getElementById('configPanel')?.classList.add('hidden');
    document.getElementById('logoutBtn')?.classList.remove('hidden');
  }

  function installPermanentCreateClientBridge() {
    if (!window.supabase?.createClient) return false;
    if (window.__B23276_CREATECLIENT_PATCHED__) return true;

    const original = window.supabase.createClient.bind(window.supabase);

    window.supabase.createClient = function(url, key, options) {
      const normalized = String(url || '').replace(/\/+$/, '');
      const shared = getClient();

      if (shared && normalized === SUPABASE_URL) {
        return publish(shared);
      }

      return original(url, key, options);
    };

    window.__B23276_ORIGINAL_CREATECLIENT__ = original;
    window.__B23276_CREATECLIENT_PATCHED__ = true;
    return true;
  }

  function installScopedInsertCompatibility(client, userId) {
    if (!client || !userId || client.__B23276_FROM_PATCHED__) return;

    const originalFrom = client.from.bind(client);

    client.from = function(table) {
      const builder = originalFrom(table);

      if (table !== 'presupuestos' && table !== 'presupuesto_lineas') {
        return builder;
      }

      if (!builder || typeof builder.insert !== 'function') return builder;

      const originalInsert = builder.insert.bind(builder);

      builder.insert = function(values, options) {
        let payload = values;

        const addUser = value => {
          if (!value || typeof value !== 'object' || Array.isArray(value)) return value;
          if (Object.prototype.hasOwnProperty.call(value, 'user_id')) return value;
          return {...value, user_id:userId};
        };

        if (Array.isArray(values)) payload = values.map(addUser);
        else payload = addUser(values);

        return originalInsert(payload, options);
      };

      return builder;
    };

    client.__B23276_FROM_PATCHED__ = true;
  }

  async function waitForClient() {
    for (let i=0; i<120; i++) {
      const c = getClient();
      if (c) return publish(c);

      if (window.supabase?.createClient) {
        try {
          const c2 = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
            auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}
          });
          return publish(c2);
        } catch (_) {}
      }
      await sleep(100);
    }
    throw new Error('No se pudo obtener el cliente Supabase.');
  }

  async function initialize() {
    installUiCss();
    installPermanentCreateClientBridge();

    const client = await waitForClient();

    try {
      localStorage.setItem('sf_url', SUPABASE_URL);
      localStorage.setItem('sf_key', SUPABASE_KEY);
    } catch (_) {}

    const {data, error} = await client.auth.getSession();
    if (error) throw error;

    if (!data?.session?.user?.id) {
      setStatus('Sin sesión activa. Inicia sesión o crea una cuenta.');
      return;
    }

    const userId = data.session.user.id;
    window.__B23276_USER_ID__ = userId;

    installScopedInsertCompatibility(client, userId);
    publish(client);
    hideAuthUi();

    /*
     * Mantener oculto el panel si otro módulo intenta volver a mostrarlo
     * mientras la sesión siga activa.
     */
    if (!window.__B23276_AUTH_WATCH__) {
      const observer = new MutationObserver(() => {
        if (window.__B23276_USER_ID__) hideAuthUi();
      });
      observer.observe(document.body, {
        subtree:true,
        childList:true,
        attributes:true,
        attributeFilter:['class']
      });
      window.__B23276_AUTH_WATCH__ = observer;
    }

    client.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        window.__B23276_USER_ID__ = null;
        document.getElementById('b23269-auth-panel')?.classList.remove('hidden');
        return;
      }

      if (session?.user?.id) {
        window.__B23276_USER_ID__ = session.user.id;
        installScopedInsertCompatibility(client, session.user.id);
        publish(client);
        hideAuthUi();
      }
    });

    /*
     * app.js todavía usa su función connect(). El bridge B232.73/B232.75
     * puede conservarla; aquí solo garantizamos que el cliente compartido
     * esté publicado antes de que los módulos financieros trabajen.
     */
    if (typeof window.connect === 'function') {
      try { await window.connect(); } catch (_) {}
    }

    hideAuthUi();
    setStatus('Sesión iniciada. Control Financiero listo.');
  }

  function boot() {
    initialize().catch(error => {
      console.error('[B232.76]', error);
      setStatus('B232.76: ' + (error?.message || String(error)), true);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, {once:true});
  } else {
    boot();
  }

  console.info(`[${VERSION}] cliente Auth único + compatibilidad user_id de Presupuesto.`);
})();
