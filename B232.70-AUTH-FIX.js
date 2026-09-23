/*
  B232.70-RELEASE-AUTH-FIX
  Fixes the B232.69 signup path for GitHub Pages /Finanzas.
  - Uses the fixed Supabase project configuration.
  - Does NOT pass an unverified emailRedirectTo to signUp(); Supabase uses Site URL.
  - Shows the exact Auth error returned by Supabase.
  - Keeps persistent sessions and automatic refresh.
  - Does NOT modify financial data, RLS, profiles or migrations.
*/
(() => {
  'use strict';
  if (window.__B23270_AUTH_FIX__) return;
  window.__B23270_AUTH_FIX__ = true;

  const VERSION = 'B232.70-RELEASE-AUTH-FIX';
  const SUPABASE_URL = 'https://xgxvdbgmwvncmfdcxgsf.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_fJqOSLC7dhYKttuU1uAvcQ_AX-aH4PB';

  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'
  }[c]));

  function status(text, error=false) {
    const el = document.getElementById('b23269-auth-status');
    if (!el) return;
    el.textContent = text;
    el.style.color = error ? '#b91c1c' : '#475569';
    el.style.fontWeight = error ? '700' : '400';
  }

  function installVersionMarker() {
    const marker = document.getElementById('b23269-version-marker');
    if (marker) marker.textContent = VERSION;
    const footer = document.getElementById('b23269-footer');
    if (footer) footer.textContent = VERSION;
  }

  function ensureClient() {
    if (!window.supabase?.createClient) {
      throw new Error('No se cargó la biblioteca de Supabase.');
    }
    if (window.__B23270_CLIENT__) return window.__B23270_CLIENT__;
    const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });
    window.__B23270_CLIENT__ = client;
    window.__B23269_CLIENT__ = client;
    window.supabaseClient = client;
    return client;
  }

  function showAuthPanel(show) {
    document.getElementById('b23269-auth-panel')?.classList.toggle('hidden', !show);
  }
  function hideLegacyConfig() {
    document.getElementById('configPanel')?.classList.add('hidden');
  }

  function persistLegacyConfig() {
    localStorage.setItem('sf_url', SUPABASE_URL);
    localStorage.setItem('sf_key', SUPABASE_KEY);
  }

  async function openFinancialApp(client) {
    persistLegacyConfig();
    showAuthPanel(false);
    hideLegacyConfig();
    if (typeof window.connect !== 'function') {
      setTimeout(() => openFinancialApp(client), 50);
      return;
    }
    const ok = await window.connect();
    if (!ok) {
      showAuthPanel(true);
      status('La sesión es válida, pero no se pudo inicializar el módulo financiero.', true);
    }
  }

  function formatAuthError(error) {
    if (!error) return 'Error desconocido de Supabase Auth.';
    const parts = [error.message, error.code, error.status].filter(Boolean);
    return parts.join(' · ');
  }

  async function signUp(email, password) {
    const client = ensureClient();
    status('Creando cuenta en Supabase…');

    // IMPORTANT: do not send emailRedirectTo until the production redirect
    // has been explicitly allow-listed in Supabase URL Configuration.
    // This prevents an invalid redirect from blocking signup creation.
    const { data, error } = await client.auth.signUp({ email, password });
    if (error) throw error;

    if (!data?.user) {
      throw new Error('Supabase no devolvió un usuario. Revisa Authentication → Logs.');
    }

    if (data.session) {
      status('Cuenta creada y sesión iniciada.');
      await openFinancialApp(client);
      return;
    }

    status('Cuenta creada correctamente. Revisa tu correo para confirmar la cuenta y luego inicia sesión.');
  }

  async function signIn(email, password) {
    const client = ensureClient();
    status('Iniciando sesión…');
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (!data?.session) throw new Error('Supabase no entregó una sesión activa.');
    await openFinancialApp(client);
  }

  async function resend(email) {
    const client = ensureClient();
    status('Enviando nuevamente el correo de confirmación…');
    const { error } = await client.auth.resend({ type: 'signup', email });
    if (error) throw error;
    status('Solicitud enviada. Revisa la bandeja de entrada y spam.');
  }

  function installResendButton() {
    const actions = document.querySelector('#b23269-register-form .b23269-actions');
    if (!actions || document.getElementById('b23270-resend')) return;
    const b = document.createElement('button');
    b.type = 'button';
    b.id = 'b23270-resend';
    b.className = 'secondary';
    b.textContent = 'Reenviar confirmación';
    actions.appendChild(b);
    b.addEventListener('click', async () => {
      const email = document.getElementById('b23269-register-email')?.value.trim();
      if (!email) { status('Ingresa primero tu correo electrónico.', true); return; }
      try { await resend(email); } catch (e) { status('Supabase: ' + formatAuthError(e), true); }
    });
  }

  function installForms() {
    const login = document.getElementById('b23269-login-form');
    const register = document.getElementById('b23269-register-form');
    if (!login || !register) return false;

    // Replace previous handlers by cloning only the form nodes.
    const loginClone = login.cloneNode(true);
    const registerClone = register.cloneNode(true);
    login.replaceWith(loginClone);
    register.replaceWith(registerClone);

    document.getElementById('b23269-show-register')?.addEventListener('click', () => {
      document.getElementById('b23269-login-form')?.classList.add('hidden');
      document.getElementById('b23269-register-form')?.classList.remove('hidden');
      status('Crea una cuenta con tu correo y una contraseña de al menos 8 caracteres.');
      installResendButton();
    });
    document.getElementById('b23269-show-login')?.addEventListener('click', () => {
      document.getElementById('b23269-register-form')?.classList.add('hidden');
      document.getElementById('b23269-login-form')?.classList.remove('hidden');
      status('Ingresa con tu cuenta.');
    });

    document.getElementById('b23269-login-form')?.addEventListener('submit', async e => {
      e.preventDefault();
      const email = document.getElementById('b23269-login-email')?.value.trim();
      const password = document.getElementById('b23269-login-password')?.value || '';
      try { await signIn(email, password); }
      catch (err) { console.error('[B232.70] signIn', err); status('Supabase: ' + formatAuthError(err), true); }
    });

    document.getElementById('b23269-register-form')?.addEventListener('submit', async e => {
      e.preventDefault();
      const email = document.getElementById('b23269-register-email')?.value.trim();
      const password = document.getElementById('b23269-register-password')?.value || '';
      try { await signUp(email, password); }
      catch (err) { console.error('[B232.70] signUp', err); status('Supabase: ' + formatAuthError(err), true); }
    });
    installResendButton();
    return true;
  }

  async function boot() {
    const panel = document.getElementById('b23269-auth-panel');
    if (!panel) { setTimeout(boot, 50); return; }
    installVersionMarker();
    hideLegacyConfig();
    showAuthPanel(true);
    try {
      const client = ensureClient();
      client.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' && session) openFinancialApp(client);
        if (event === 'SIGNED_OUT') { showAuthPanel(true); hideLegacyConfig(); }
      });
      installForms();
      const { data, error } = await client.auth.getSession();
      if (error) throw error;
      if (data?.session) {
        status('Sesión recuperada. Cargando información financiera…');
        await openFinancialApp(client);
      } else {
        status('Sin sesión activa. Inicia sesión o crea una cuenta.');
      }

      const logout = document.getElementById('logoutBtn');
      if (logout && !logout.dataset.b23270) {
        logout.dataset.b23270 = '1';
        logout.addEventListener('click', async e => {
          e.preventDefault();
          e.stopImmediatePropagation();
          try { await client.auth.signOut(); } finally { location.reload(); }
        }, true);
      }
    } catch (e) {
      console.error('[B232.70] boot', e);
      status('Supabase: ' + formatAuthError(e), true);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, {once:true});
  else boot();
})();
