/*
  B232.73-RELEASE-AUTH-CORE-BRIDGE

  Corrección de raíz del puente Auth -> motor financiero.

  Diagnóstico B232.72:
  El app.js declara `let db=null` como binding léxico. Un overlay externo
  no puede garantizar la asignación de ese binding mediante `window.db`.
  B232.72 intentaba asignarlo directamente y por eso aparece:
  "El motor financiero no expone su cliente db: db is not defined".

  Estrategia B232.73:
  1) Reutiliza el mismo cliente Supabase Auth persistente de B232.70.
  2) Conserva la función `connect()` original del app.js.
  3) Intercepta SOLO durante esa ejecución `supabase.createClient()` para
     que el app.js asigne su propio `db` al cliente Auth.
  4) Restaura inmediatamente createClient para no alterar otros módulos.
  5) Expone un nuevo window.connect que devuelve true al Auth controller.
  6) No escribe datos, no cambia tablas, no cambia RLS y no crea un segundo
     cliente financiero.

  Dependencia de instalación:
  - Mantener B232.69 y B232.70.
  - Retirar B232.71 y B232.72.
  - Cargar este archivo DESPUÉS de B232.70 y DESPUÉS de app.js.
*/
(() => {
  'use strict';

  const VERSION = 'B232.73-RELEASE-AUTH-CORE-BRIDGE';
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

  function ensureClient() {
    const existing = getClient();
    if (existing) return existing;

    if (!window.supabase?.createClient) {
      throw new Error('No se cargó la biblioteca de Supabase.');
    }

    const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });

    window.__B23273_CLIENT__ = client;
    window.__B23270_CLIENT__ = client;
    window.__B23269_CLIENT__ = client;
    window.supabaseClient = client;
    return client;
  }

  async function waitForClient() {
    for (let i = 0; i < 100; i++) {
      const existing = getClient();
      if (existing) return existing;

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
      const client = await waitForClient();

      // Capturamos el connect ORIGINAL del app.js antes de reemplazarlo.
      const originalConnect = window.connect;
      if (typeof originalConnect !== 'function') {
        throw new Error('No se encontró connect() del motor financiero.');
      }

      // La configuración queda disponible para el app.js legacy, pero el
      // cliente real siempre será el cliente Auth persistente de B232.70.
      try {
        localStorage.setItem('sf_url', SUPABASE_URL);
        localStorage.setItem('sf_key', SUPABASE_KEY);
      } catch (_) {}

      const urlInput = document.getElementById('supabaseUrl');
      const keyInput = document.getElementById('supabaseKey');
      if (urlInput) urlInput.value = SUPABASE_URL;
      if (keyInput) keyInput.value = SUPABASE_KEY;

      async function connectThroughCore() {
        const authClient = await waitForClient();
        const supabaseApi = window.supabase;
        if (!supabaseApi || typeof supabaseApi.createClient !== 'function') {
          throw new Error('La biblioteca Supabase no está disponible.');
        }

        const originalCreateClient = supabaseApi.createClient;
        let restored = false;

        // El app.js ejecutará:
        //   db = window.supabase.createClient(...)
        // y, por tanto, asignará SU PROPIO `db` léxico al cliente Auth.
        supabaseApi.createClient = function b23273ReuseAuthClient() {
          return authClient;
        };

        try {
          await originalConnect();
        } finally {
          if (!restored) {
            supabaseApi.createClient = originalCreateClient;
            restored = true;
          }
        }

        window.supabaseClient = authClient;
        window.__B23273_CLIENT__ = authClient;

        // El connect legacy no devuelve un booleano en éxito. Para el
        // controlador B232.70, esta capa devuelve explícitamente true.
        return true;
      }

      window.connect = connectThroughCore;

      markVisible();

      const { data, error } = await client.auth.getSession();
      if (error) throw error;

      if (data?.session) {
        status('Sesión válida. Inicializando Control Financiero…');
        await connectThroughCore();
        status('Sesión iniciada. Control Financiero listo.');
      } else {
        status('Sin sesión activa. Inicia sesión o crea una cuenta.');
      }
    } catch (e) {
      console.error('[B232.73] boot:', e);
      status('B232.73: no se pudo enlazar Auth → motor financiero: ' +
        (e?.message || String(e)), true);
      markVisible();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();
