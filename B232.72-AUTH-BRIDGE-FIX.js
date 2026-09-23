/*
  B232.72-RELEASE-AUTH-BRIDGE-FIX
  Corrección definitiva del puente Auth -> motor financiero.

  Problema corregido:
  B232.71 dependía de que B232.70 ya hubiese publicado su cliente en
  window.__B23270_CLIENT__. En determinadas secuencias de carga eso no
  ocurría a tiempo, dejando el mensaje "no se pudo enlazar".

  Esta versión:
  - Espera a B232.70 si existe.
  - Si no aparece, crea un único cliente Auth con la configuración fija.
  - Usa persistSession=true y autoRefreshToken=true.
  - Sustituye window.connect por una función que reutiliza el cliente Auth.
  - Asigna ese mismo cliente al binding global `db` del app.js.
  - No crea una segunda conexión para el motor financiero.
  - No modifica datos, tablas, RLS ni módulos financieros.
  - Incluye identificador visible.
*/
(() => {
  'use strict';

  const VERSION = 'B232.72-RELEASE-AUTH-BRIDGE-FIX';
  const URL = 'https://xgxvdbgmwvncmfdcxgsf.supabase.co';
  const KEY = 'sb_publishable_fJqOSLC7dhYKttuU1uAvcQ_AX-aH4PB';

  if (window.__B23272_AUTH_BRIDGE__) return;
  window.__B23272_AUTH_BRIDGE__ = true;

  const sleep = ms => new Promise(r => setTimeout(r, ms));

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

    let badge = document.getElementById('b23272-bridge-badge');
    if (!badge) {
      badge = document.createElement('div');
      badge.id = 'b23272-bridge-badge';
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

  async function ensureClient() {
    let client = getClient();
    if (client) return client;

    if (!window.supabase?.createClient) {
      throw new Error('No se cargó la biblioteca de Supabase.');
    }

    client = window.supabase.createClient(URL, KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });

    window.__B23272_CLIENT__ = client;
    window.__B23270_CLIENT__ = client;
    window.__B23269_CLIENT__ = client;
    window.supabaseClient = client;

    return client;
  }

  async function getAuthClient() {
    for (let i = 0; i < 100; i++) {
      const existing = getClient();
      if (existing) return existing;

      if (window.supabase?.createClient) {
        try {
          return await ensureClient();
        } catch (_) {}
      }

      await sleep(100);
    }

    throw new Error('No se pudo inicializar el cliente Supabase Auth.');
  }

  async function bridge(client) {
    /*
      `db` pertenece al Global Lexical Environment creado por app.js.
      Al ejecutarse este script clásico después de app.js, el binding está
      disponible y puede reutilizarse directamente.
    */
    try {
      db = client;
    } catch (e) {
      throw new Error(
        'El motor financiero no expone su cliente db: ' + (e?.message || e)
      );
    }

    window.supabaseClient = client;

    try {
      localStorage.setItem('sf_url', URL);
      localStorage.setItem('sf_key', KEY);
    } catch (_) {}

    window.connect = async function B23272Connect() {
      try {
        const active = await getAuthClient();
        db = active;
        window.supabaseClient = active;

        const { data, error } = await active.auth.getSession();
        if (error) throw error;
        if (!data?.session) {
          throw new Error('No existe una sesión autenticada activa.');
        }

        try {
          localStorage.setItem('sf_url', URL);
          localStorage.setItem('sf_key', KEY);
        } catch (_) {}

        document.getElementById('configPanel')?.classList.add('hidden');
        document.getElementById('app')?.classList.remove('hidden');
        document.getElementById('logoutBtn')?.classList.remove('hidden');

        /*
          refresh() es la misma rutina del motor financiero. No se reemplaza
          ningún módulo de datos.
        */
        if (typeof refresh === 'function') {
          await refresh();
        }

        markVisible();
        return true;
      } catch (e) {
        console.error('[B232.72] connect:', e);
        status(
          'B232.72: ' + (e?.message || String(e)),
          true
        );
        return false;
      }
    };

    markVisible();
  }

  async function boot() {
    try {
      const client = await getAuthClient();
      await bridge(client);

      const { data, error } = await client.auth.getSession();
      if (error) throw error;

      if (data?.session) {
        status('Sesión válida. Inicializando Control Financiero…');
        await window.connect();
      } else {
        markVisible();
      }
    } catch (e) {
      console.error('[B232.72] boot:', e);
      status(
        'B232.72: no se pudo inicializar Auth → motor financiero: ' +
        (e?.message || String(e)),
        true
      );
      markVisible();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();
