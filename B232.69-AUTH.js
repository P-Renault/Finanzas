/*
  B232.69-RELEASE-AUTH-FUNDACION
  Authentication foundation for CCF.
  - Fixed Supabase project configuration in frontend.
  - Supabase Auth session persistence + token refresh.
  - Login / registration.
  - Does NOT migrate or rewrite financial data.
  - Does NOT enable RLS or profile storage yet.
*/
(() => {
  'use strict';

  if (window.__B23269_AUTH_FUNDACION__) return;
  window.__B23269_AUTH_FUNDACION__ = true;

  const VERSION = 'B232.69-RELEASE-AUTH-FUNDACION';
  const SUPABASE_URL = 'https://xgxvdbgmwvncmfdcxgsf.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_fJqOSLC7dhYKttuU1uAvcQ_AX-aH4PB';

  // The legacy app used these values as a manual connection switch.
  // Remove them before app.js boots so an old browser state cannot bypass Auth.
  try {
    localStorage.removeItem('sf_url');
    localStorage.removeItem('sf_key');
  } catch (_) {}

  function safeText(value) {
    return String(value ?? '').replace(/[&<>"']/g, c => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'
    }[c]));
  }

  function setStatus(text, isError = false) {
    const el = document.getElementById('b23269-auth-status');
    if (!el) return;
    el.textContent = text;
    el.style.color = isError ? '#b91c1c' : '#475569';
  }

  function injectStyles() {
    if (document.getElementById('b23269-auth-style')) return;
    const style = document.createElement('style');
    style.id = 'b23269-auth-style';
    style.textContent = `
      #b23269-auth-panel{max-width:680px;margin:18px auto;padding:20px;border:1px solid #dbe3ec;border-radius:14px;background:#fff;box-shadow:0 4px 18px rgba(15,23,42,.05)}
      #b23269-auth-panel h2{margin:0 0 6px}
      #b23269-auth-panel .b23269-muted{color:#64748b;font-size:13px;line-height:1.45}
      #b23269-auth-panel .b23269-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:14px}
      #b23269-auth-panel label{display:flex;flex-direction:column;gap:6px;font-size:13px;font-weight:700;color:#334155}
      #b23269-auth-panel input{min-height:44px;padding:10px 12px;border:1px solid #cbd5e1;border-radius:10px;font-size:16px;box-sizing:border-box}
      #b23269-auth-panel .b23269-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:14px}
      #b23269-auth-panel button{min-height:44px;padding:10px 14px;border:0;border-radius:10px;cursor:pointer;font-weight:700}
      #b23269-auth-panel .primary{background:#111827;color:#fff}
      #b23269-auth-panel .secondary{background:#e2e8f0;color:#0f172a}
      #b23269-auth-panel .hidden{display:none!important}
      #b23269-auth-panel .status{margin:12px 0 0;min-height:20px;font-size:13px}
      #b23269-footer{margin:28px auto 14px;max-width:1100px;padding:8px;text-align:center;color:#64748b;font:600 11px/1.4 system-ui,sans-serif;letter-spacing:.04em}
      @media(max-width:720px){#b23269-auth-panel .b23269-grid{grid-template-columns:1fr}}
    `;
    document.head.appendChild(style);
  }

  function injectAuthPanel() {
    injectStyles();
    if (document.getElementById('b23269-auth-panel')) return;

    const main = document.querySelector('main.container') || document.querySelector('main');
    if (!main) return;

    const panel = document.createElement('section');
    panel.id = 'b23269-auth-panel';
    panel.className = 'card';
    panel.innerHTML = `
      <div style="font-size:11px;letter-spacing:.06em;color:#64748b;font-weight:800">${VERSION}</div>
      <h2>Acceso al Control Financiero</h2>
      <p class="b23269-muted">Inicia sesión para acceder a tus datos financieros. La configuración de Supabase queda incorporada en la aplicación; no necesitas volver a ingresarla.</p>

      <form id="b23269-login-form">
        <div class="b23269-grid">
          <label>Correo electrónico
            <input id="b23269-login-email" type="email" autocomplete="email" required placeholder="tu-correo@ejemplo.com">
          </label>
          <label>Contraseña
            <input id="b23269-login-password" type="password" autocomplete="current-password" minlength="8" required placeholder="Mínimo 8 caracteres">
          </label>
        </div>
        <div class="b23269-actions">
          <button class="primary" type="submit">Iniciar sesión</button>
          <button class="secondary" type="button" id="b23269-show-register">Crear cuenta</button>
        </div>
      </form>

      <form id="b23269-register-form" class="hidden">
        <div class="b23269-grid">
          <label>Correo electrónico
            <input id="b23269-register-email" type="email" autocomplete="email" required placeholder="tu-correo@ejemplo.com">
          </label>
          <label>Contraseña
            <input id="b23269-register-password" type="password" autocomplete="new-password" minlength="8" required placeholder="Mínimo 8 caracteres">
          </label>
        </div>
        <div class="b23269-actions">
          <button class="primary" type="submit">Crear cuenta</button>
          <button class="secondary" type="button" id="b23269-show-login">Volver a iniciar sesión</button>
        </div>
      </form>

      <p id="b23269-auth-status" class="status" role="status" aria-live="polite">Preparando autenticación…</p>
    `;

    const config = document.getElementById('configPanel');
    if (config && config.parentNode === main) main.insertBefore(panel, config);
    else main.insertBefore(panel, main.firstChild);

    const footer = document.createElement('div');
    footer.id = 'b23269-footer';
    footer.textContent = VERSION;
    document.body.appendChild(footer);

    document.getElementById('b23269-show-register')?.addEventListener('click', () => {
      document.getElementById('b23269-login-form')?.classList.add('hidden');
      document.getElementById('b23269-register-form')?.classList.remove('hidden');
      setStatus('Crea una cuenta con tu correo y una contraseña de al menos 8 caracteres.');
    });

    document.getElementById('b23269-show-login')?.addEventListener('click', () => {
      document.getElementById('b23269-register-form')?.classList.add('hidden');
      document.getElementById('b23269-login-form')?.classList.remove('hidden');
      setStatus('Ingresa con tu cuenta.');
    });
  }

  function hideLegacyConfig() {
    const panel = document.getElementById('configPanel');
    if (panel) panel.classList.add('hidden');
  }

  function showAuthPanel(show) {
    const panel = document.getElementById('b23269-auth-panel');
    if (panel) panel.classList.toggle('hidden', !show);
  }

  function forcePersistentClient() {
    if (!window.supabase?.createClient) return false;
    if (window.__B23269_ORIGINAL_CREATE_CLIENT__) return true;

    const original = window.supabase.createClient.bind(window.supabase);
    window.__B23269_ORIGINAL_CREATE_CLIENT__ = original;

    window.supabase.createClient = (url, key, options = {}) => {
      return original(url, key, {
        ...options,
        auth: {
          ...(options.auth || {}),
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        }
      });
    };
    return true;
  }

  function currentRedirect() {
    return window.location.origin + window.location.pathname;
  }

  function prepareLegacyConnection() {
    // app.js still owns the financial refresh/render cycle. We only feed it
    // the fixed public configuration after Auth has established a session.
    localStorage.setItem('sf_url', SUPABASE_URL);
    localStorage.setItem('sf_key', SUPABASE_KEY);
    const u = document.getElementById('supabaseUrl');
    const k = document.getElementById('supabaseKey');
    if (u) u.value = SUPABASE_URL;
    if (k) k.value = SUPABASE_KEY;
  }

  async function openFinancialApp() {
    prepareLegacyConnection();
    showAuthPanel(false);
    hideLegacyConfig();

    // app.js exposes connect(). It will now create a persistent client because
    // B232.69 wraps createClient above.
    if (typeof window.connect === 'function') {
      const ok = await window.connect();
      if (!ok) {
        showAuthPanel(true);
        setStatus('La sesión es válida, pero no se pudo inicializar el módulo financiero.', true);
      }
    } else {
      setTimeout(openFinancialApp, 50);
    }
  }

  async function signIn(email, password) {
    setStatus('Iniciando sesión…');
    const { data, error } = await window.__B23269_CLIENT__.auth.signInWithPassword({email, password});
    if (error) throw error;
    if (!data?.session) throw new Error('Supabase no entregó una sesión activa.');
    await openFinancialApp();
  }

  async function signUp(email, password) {
    setStatus('Creando cuenta…');
    const { data, error } = await window.__B23269_CLIENT__.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: currentRedirect() }
    });
    if (error) throw error;

    if (data?.session) {
      setStatus('Cuenta creada. Sesión iniciada.');
      await openFinancialApp();
      return;
    }

    setStatus('Cuenta creada. Revisa tu correo para confirmar la cuenta y luego inicia sesión.');
  }

  function installForms() {
    document.getElementById('b23269-login-form')?.addEventListener('submit', async event => {
      event.preventDefault();
      const email = document.getElementById('b23269-login-email')?.value.trim();
      const password = document.getElementById('b23269-login-password')?.value || '';
      try {
        await signIn(email, password);
      } catch (e) {
        console.error('[B232.69] signIn', e);
        setStatus(e?.message || 'No fue posible iniciar sesión.', true);
      }
    });

    document.getElementById('b23269-register-form')?.addEventListener('submit', async event => {
      event.preventDefault();
      const email = document.getElementById('b23269-register-email')?.value.trim();
      const password = document.getElementById('b23269-register-password')?.value || '';
      try {
        await signUp(email, password);
      } catch (e) {
        console.error('[B232.69] signUp', e);
        setStatus(e?.message || 'No fue posible crear la cuenta.', true);
      }
    });
  }

  async function bootAuth() {
    injectAuthPanel();
    installForms();
    hideLegacyConfig();
    showAuthPanel(true);

    if (!window.supabase?.createClient) {
      setStatus('No se cargó la biblioteca de Supabase.', true);
      return;
    }

    forcePersistentClient();

    const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: {persistSession:true, autoRefreshToken:true, detectSessionInUrl:true}
    });
    window.__B23269_CLIENT__ = client;
    window.supabaseClient = client;

    client.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        showAuthPanel(true);
        hideLegacyConfig();
        try { localStorage.removeItem('sf_url'); localStorage.removeItem('sf_key'); } catch (_) {}
      }
    });

    const { data, error } = await client.auth.getSession();
    if (error) {
      console.error('[B232.69] getSession', error);
      setStatus('No fue posible recuperar la sesión: ' + error.message, true);
      return;
    }

    if (data?.session) {
      setStatus('Sesión recuperada. Cargando información financiera…');
      // app.js has already booted or is about to boot. Retry safely until it exposes connect().
      openFinancialApp();
    } else {
      setStatus('Sin sesión activa. Inicia sesión o crea una cuenta.');
    }

    // Replace the legacy logout behavior with real Supabase sign-out.
    const logout = document.getElementById('logoutBtn');
    if (logout && !logout.dataset.b23269) {
      logout.dataset.b23269 = '1';
      logout.addEventListener('click', async event => {
        event.preventDefault();
        event.stopImmediatePropagation();
        try {
          await client.auth.signOut();
        } finally {
          try { localStorage.removeItem('sf_url'); localStorage.removeItem('sf_key'); } catch (_) {}
          location.reload();
        }
      }, true);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootAuth, {once:true});
  } else {
    bootAuth();
  }
})();
