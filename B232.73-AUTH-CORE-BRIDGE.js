/*
  B232.73-RELEASE-AUTH-CORE-BRIDGE
  CONSOLIDATED FIX — B232.75 GLOBAL AUTH CLIENT BRIDGE

  This file preserves the working Auth -> app bridge and additionally
  forces every financial module to reuse the SAME authenticated Supabase
  client. This prevents secondary clients created with persistSession:false
  from losing auth.uid() and triggering RLS failures.

  Scope:
  - Auth/session persistence: preserved.
  - Calendar/data reads: preserved.
  - All financial modules: unified on the authenticated client.
  - No SQL, RLS, RPC or financial data changes.
*/
(() => {
  'use strict';

  const VERSION = 'B232.75-CONSOLIDATED-AUTH-CORE-BRIDGE';
  const SUPABASE_URL = 'https://xgxvdbgmwvncmfdcxgsf.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_fJqOSLC7dhYKttuU1uAvcQ_AX-aH4PB';

  if (window.__B23273_AUTH_CORE_BRIDGE__) return;
  window.__B23273_AUTH_CORE_BRIDGE__ = true;

  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

  function status(text, error = false) {
    const el = document.getElementById('b23269-auth-status');
    if (!el) return;
    el.textContent = text;
    el.style.color = error ? '#b91c1c' : '#475569';
    el.style.fontWeight = error ? '700' : '400';
  }

  function markVisible() {
    const footer = document.getElementById('b23269-footer');
    if (footer) footer.textContent = VERSION;

    let badge = document.getElementById('b23273-bridge-badge');
    if (!badge) {
      badge = document.createElement('div');
      badge.id = 'b23273-bridge-badge';
      badge.style.cssText =
        'position:fixed;bottom:0;left:0;right:0;z-index:99999;' +
        'padding:5px 8px;text-align:center;background:#f8fafc;' +
        'border-top:1px solid #e2e8f0;color:#64748b;' +
        'font:600 10px/1.2 system-ui,sans-serif;letter-spacing:.04em;';
      document.body.appendChild(badge);
    }
    badge.textContent = VERSION;
  }

  function getClient() {
    return window.__B23275_CLIENT__ ||
           window.__B23270_CLIENT__ ||
           window.__B23269_CLIENT__ ||
           window.__B23273_CLIENT__ ||
           window.supabaseClient ||
           null;
  }

  function publishClient(client) {
    if (!client) return null;
    window.__B23275_CLIENT__ = client;
    window.__B23273_CLIENT__ = client;
    window.__B23270_CLIENT__ = client;
    window.__B23269_CLIENT__ = client;
    window.supabaseClient = client;
    window.db = client;
    return client;
  }

  /*
   * CRITICAL FIX:
   * Every later module may call window.supabase.createClient().
   * For this project, return the already-authenticated client instead
   * of creating a second client without the active Auth session.
   */
  function installGlobalClientBridge() {
    if (!window.supabase?.createClient) return false;
    if (window.__B23275_CREATECLIENT_PATCHED__) return true;

    const originalCreateClient =
      window.supabase.createClient.bind(window.supabase);

    window.supabase.createClient = function(url, key, options) {
      const normalized = String(url || '').replace(/\/+$/, '');
      const shared = getClient();

      if (shared && normalized === SUPABASE_URL) {
        return publishClient(shared);
      }

      return originalCreateClient(url, key, options);
    };

    window.__B23275_ORIGINAL_CREATECLIENT__ = originalCreateClient;
    window.__B23275_CREATECLIENT_PATCHED__ = true;
    return true;
  }

  function installAuthCss() {
    if (document.getElementById('b23275-auth-css')) return;
    const style = document.createElement('style');
    style.id = 'b23275-auth-css';
    style.textContent = `
      #b23269-auth-panel.hidden,
      #configPanel.hidden {
        display: none !important;
      }
    `;
    document.head.appendChild(style);
  }

  function syncAuthUi() {
    const client = getClient();
    if (!client?.auth) return;

    client.auth.getSession().then(({data}) => {
      if (data?.session) {
        document.getElementById('b23269-auth-panel')?.classList.add('hidden');
        document.getElementById('configPanel')?.classList.add('hidden');
        document.getElementById('logoutBtn')?.classList.remove('hidden');
      }
    }).catch(() => {});
  }

  function ensureClient() {
    const existing = getClient();
    if (existing) {
      publishClient(existing);
      return existing;
    }

    if (!window.supabase?.createClient) {
      throw new Error('No se cargó la biblioteca de Supabase.');
    }

    /*
     * This is only a safety fallback. Normally B232.70 creates the
     * authenticated client before this bridge is needed.
     */
    const client = window.supabase.createClient(
      SUPABASE_URL,
      SUPABASE_KEY,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        }
      }
    );

    return publishClient(client);
  }

  async function waitForClient() {
    for (let i = 0; i < 100; i++) {
      const existing = getClient();
      if (existing) {
        publishClient(existing);
        return existing;
      }

      try {
        return ensureClient();
      } catch (_) {
        await sleep(100);
      }
    }
    throw new Error('No se pudo inicializar el cliente Supabase Auth.');
  }

  async function boot() {
    try {
      /*
       * Install the permanent bridge BEFORE the dynamic financial modules
       * are released by index.html.
       */
      installAuthCss();
      installGlobalClientBridge();

      const client = await waitForClient();

      try {
        localStorage.setItem('sf_url', SUPABASE_URL);
        localStorage.setItem('sf_key', SUPABASE_KEY);
      } catch (_) {}

      const urlInput = document.getElementById('supabaseUrl');
      const keyInput = document.getElementById('supabaseKey');
      if (urlInput) urlInput.value = SUPABASE_URL;
      if (keyInput) keyInput.value = SUPABASE_KEY;

      const originalConnect = window.connect;
      if (typeof originalConnect !== 'function') {
        throw new Error('No se encontró connect() del motor financiero.');
      }

      async function connectThroughCore() {
        const authClient = await waitForClient();
        const supabaseApi = window.supabase;

        if (!supabaseApi || typeof supabaseApi.createClient !== 'function') {
          throw new Error('La biblioteca Supabase no está disponible.');
        }

        const originalCreateClient = supabaseApi.createClient;
        let restored = false;

        /*
         * During legacy connect(), app.js executes:
         * db = window.supabase.createClient(...)
         * so its lexical `db` receives the authenticated client.
         */
        supabaseApi.createClient = function b23273ReuseAuthClient() {
          return authClient;
        };

        try {
          await originalConnect();
        } finally {
          if (!restored) {
            /*
             * Restore the GLOBAL bridge that was active before the
             * temporary connect() interception.
             */
            supabaseApi.createClient = originalCreateClient;
            restored = true;
          }
        }

        publishClient(authClient);
        installGlobalClientBridge();
        syncAuthUi();
        return true;
      }

      window.connect = connectThroughCore;

      markVisible();

      const {data, error} = await client.auth.getSession();
      if (error) throw error;

      if (data?.session) {
        status('Sesión válida. Inicializando Control Financiero…');
        await connectThroughCore();
        status('Sesión iniciada. Control Financiero listo.');
      } else {
        status('Sin sesión activa. Inicia sesión o crea una cuenta.');
      }

      syncAuthUi();

    } catch (e) {
      console.error('[B232.75] boot:', e);
      status(
        'B232.75: no se pudo enlazar Auth → motor financiero: ' +
        (e?.message || String(e)),
        true
      );
      markVisible();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, {once:true});
  } else {
    boot();
  }

  console.info(
    `[${VERSION}] cliente Auth único compartido por todos los módulos.`
  );
})();
