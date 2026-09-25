/* ============================================================
   CCF B2.30.12 — AUTH + BOOT FINAL
   Objetivo: eliminar el congelamiento de acceso y asegurar el
   despliegue del Centro de Control Financiero sin depender de la
   cadena B232.69/B232.73/B232.74/B230.

   Arquitectura:
   1. Un único cliente Supabase persistente.
   2. Portal de acceso autónomo.
   3. Reutiliza el mismo cliente para app.js y motores posteriores.
   4. La aplicación se revela aunque refresh() encuentre un error.
   5. No modifica tablas, SQL, RLS ni datos.
   ============================================================ */
(() => {
  'use strict';
  if (window.__CCF_B23012_AUTH_BOOT__) return;
  window.__CCF_B23012_AUTH_BOOT__ = true;

  const VERSION = 'B2.30.12';
  const SUPABASE_URL = 'https://xgxvdbgmwvncmfdcxgsf.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_fJqOSLC7dhYKttuU1uAvcQ_AX-aH4PB';
  let client = null;

  const $ = id => document.getElementById(id);
  const sleep = ms => new Promise(r => setTimeout(r, ms));

  function esc(v) {
    return String(v ?? '').replace(/[&<>"']/g, c => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'
    }[c]));
  }

  function hideLegacy() {
    $('configPanel')?.classList.add('hidden');
    $('app')?.classList.add('hidden');
    $('logoutBtn')?.classList.add('hidden');
  }

  function revealApp() {
    $('configPanel')?.classList.add('hidden');
    const app = $('app');
    if (app) {
      app.classList.remove('hidden');
      app.classList.remove('b230-hidden-app');
      app.style.removeProperty('display');
      app.removeAttribute('aria-hidden');
    }
    $('logoutBtn')?.classList.remove('hidden');
    $('ccf-auth-gate')?.remove();
  }

  function setStatus(text, error = false) {
    const el = $('ccf-auth-status');
    if (!el) return;
    el.textContent = text;
    el.style.color = error ? '#fecaca' : '#9db0c7';
  }

  function portal() {
    if ($('ccf-auth-gate')) return;
    const gate = document.createElement('div');
    gate.id = 'ccf-auth-gate';
    gate.innerHTML = `
      <div class="ccf-auth-shell" role="dialog" aria-label="Acceso al Centro de Control Financiero">
        <div class="ccf-auth-brand"><span>CCF</span><div><strong>Centro de Control Financiero</strong><small>B2.30.12 · Acceso seguro</small></div></div>
        <div class="ccf-auth-card">
          <h2 id="ccf-auth-title">Iniciar sesión</h2>
          <p>Accede a tu sistema financiero y continúa donde lo dejaste.</p>
          <form id="ccf-login-form">
            <label>Correo electrónico<input id="ccf-email" type="email" autocomplete="email" required></label>
            <label>Contraseña<input id="ccf-password" type="password" autocomplete="current-password" required></label>
            <button type="submit" id="ccf-submit">Ingresar al sistema</button>
          </form>
          <form id="ccf-register-form" class="ccf-hidden">
            <label>Correo electrónico<input id="ccf-register-email" type="email" autocomplete="email" required></label>
            <label>Contraseña<input id="ccf-register-password" type="password" autocomplete="new-password" minlength="8" required></label>
            <button type="submit" id="ccf-register-submit">Crear cuenta</button>
          </form>
          <button type="button" class="ccf-link" id="ccf-switch">Crear una cuenta</button>
          <div id="ccf-auth-status" aria-live="polite">Inicializando acceso…</div>
        </div>
      </div>`;
    document.body.appendChild(gate);

    const style = document.createElement('style');
    style.id = 'ccf-auth-boot-style';
    style.textContent = `
      #ccf-auth-gate{position:fixed;inset:0;z-index:2147483646;overflow:auto;background:radial-gradient(circle at 80% 10%,rgba(22,136,232,.2),transparent 30%),linear-gradient(135deg,#050b14,#07111f 55%,#09192b);color:#eef6ff;font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
      .ccf-auth-shell{min-height:100%;display:grid;place-items:center;padding:24px}.ccf-auth-card{width:min(430px,100%);padding:26px;border:1px solid rgba(148,163,184,.2);border-radius:20px;background:#0b1828;box-shadow:0 30px 90px rgba(0,0,0,.45)}
      .ccf-auth-brand{position:fixed;top:18px;left:22px;display:flex;gap:10px;align-items:center}.ccf-auth-brand>span{display:grid;place-items:center;width:40px;height:40px;border-radius:11px;background:#1688e8;font-weight:900}.ccf-auth-brand strong{display:block;font-size:14px}.ccf-auth-brand small{display:block;color:#8fa4bb;font-size:10px;margin-top:2px}
      .ccf-auth-card h2{margin:0 0 7px;font-size:27px}.ccf-auth-card p{margin:0 0 20px;color:#9db0c7;font-size:13px;line-height:1.5}.ccf-auth-card form{display:grid;gap:12px}.ccf-auth-card label{display:grid;gap:6px;color:#cbd8e6;font-size:12px;font-weight:700}.ccf-auth-card input{width:100%;box-sizing:border-box;height:46px;padding:0 12px;border-radius:10px;border:1px solid rgba(148,163,184,.22);background:#07111f;color:#fff;font:inherit}.ccf-auth-card button{height:46px;border:0;border-radius:10px;cursor:pointer;font:800 13px system-ui}.ccf-auth-card form button{background:#1688e8;color:#fff}.ccf-link{width:100%;margin-top:11px;background:transparent;color:#54caff!important}.ccf-hidden{display:none!important}
      #ccf-auth-status{min-height:20px;margin-top:13px;color:#9db0c7;font-size:11px;line-height:1.45}.ccf-auth-card button:disabled{opacity:.65;cursor:wait}
      @media(max-width:600px){.ccf-auth-brand{position:static;justify-content:center;margin-bottom:10px}.ccf-auth-shell{align-content:center}}
    `;
    document.head.appendChild(style);

    $('ccf-switch').onclick = () => {
      const login = $('ccf-login-form');
      const register = $('ccf-register-form');
      const isRegister = register.classList.contains('ccf-hidden');
      login.classList.toggle('ccf-hidden', !isRegister);
      register.classList.toggle('ccf-hidden', isRegister);
      $('ccf-auth-title').textContent = isRegister ? 'Crear cuenta' : 'Iniciar sesión';
      $('ccf-switch').textContent = isRegister ? 'Volver a iniciar sesión' : 'Crear una cuenta';
      setStatus(isRegister ? 'Crea una cuenta con una contraseña de al menos 8 caracteres.' : 'Ingresa con tu cuenta.');
    };
  }

  function installSingleClientBridge() {
    if (!window.supabase?.createClient) return false;
    if (!client) {
      client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
        auth: { persistSession:true, autoRefreshToken:true, detectSessionInUrl:true }
      });
    }
    window.supabaseClient = client;
    window.__B23269_CLIENT__ = client;
    window.__B23270_CLIENT__ = client;
    window.__B23273_CLIENT__ = client;

    // Un solo cliente para todos los motores. Esto evita que módulos
    // posteriores creen clientes sin la sesión autenticada.
    if (!window.__CCF_B23012_CREATECLIENT_PATCHED__) {
      const original = window.supabase.createClient.bind(window.supabase);
      window.__CCF_B23012_ORIGINAL_CREATECLIENT__ = original;
      window.supabase.createClient = () => client;
      window.__CCF_B23012_CREATECLIENT_PATCHED__ = true;
    }

    try {
      localStorage.setItem('sf_url', SUPABASE_URL);
      localStorage.setItem('sf_key', SUPABASE_KEY);
    } catch (_) {}
    return true;
  }

  async function waitForSupabase() {
    for (let i=0;i<80;i++) {
      if (installSingleClientBridge()) return client;
      await sleep(100);
    }
    throw new Error('La biblioteca de Supabase no se cargó.');
  }

  async function openApp() {
    const originalConnect = window.connect;
    try {
      if (typeof originalConnect === 'function') {
        setStatus('Sesión válida. Inicializando módulos financieros…');
        await originalConnect();
      }
    } catch (e) {
      console.warn('[CCF B2.30.12] refresh/connect:', e);
    } finally {
      revealApp();
      try {
        if (typeof window.refresh === 'function') await window.refresh();
      } catch (e) {
        console.warn('[CCF B2.30.12] refresh final:', e);
      }
    }
  }

  async function signIn() {
    const btn = $('ccf-submit');
    btn.disabled = true;
    setStatus('Validando credenciales…');
    try {
      const email = $('ccf-email').value.trim();
      const password = $('ccf-password').value;
      const { data, error } = await client.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (!data?.session) throw new Error('Supabase no entregó una sesión activa.');
      await openApp();
    } catch (e) {
      console.error('[CCF B2.30.12] signIn', e);
      setStatus(e?.message || 'No fue posible iniciar sesión.', true);
    } finally { btn.disabled = false; }
  }

  async function signUp() {
    const btn = $('ccf-register-submit');
    btn.disabled = true;
    setStatus('Creando cuenta…');
    try {
      const email = $('ccf-register-email').value.trim();
      const password = $('ccf-register-password').value;
      const { data, error } = await client.auth.signUp({
        email, password,
        options:{ emailRedirectTo: window.location.origin + window.location.pathname }
      });
      if (error) throw error;
      if (data?.session) await openApp();
      else setStatus('Cuenta creada. Revisa tu correo para confirmar la cuenta y luego inicia sesión.');
    } catch (e) {
      console.error('[CCF B2.30.12] signUp', e);
      setStatus(e?.message || 'No fue posible crear la cuenta.', true);
    } finally { btn.disabled = false; }
  }

  function installForms() {
    $('ccf-login-form')?.addEventListener('submit', e => { e.preventDefault(); signIn(); });
    $('ccf-register-form')?.addEventListener('submit', e => { e.preventDefault(); signUp(); });
    const logout = $('logoutBtn');
    if (logout && !logout.dataset.ccfFinalAuth) {
      logout.dataset.ccfFinalAuth = '1';
      logout.addEventListener('click', async e => {
        e.preventDefault(); e.stopImmediatePropagation();
        try { await client?.auth?.signOut({scope:'local'}); } finally { location.reload(); }
      }, true);
    }
  }

  async function boot() {
    hideLegacy();
    portal();
    installForms();
    try {
      await waitForSupabase();
      const { data, error } = await client.auth.getSession();
      if (error) throw error;
      if (data?.session) {
        await openApp();
      } else {
        setStatus('Sin sesión activa. Inicia sesión o crea una cuenta.');
      }
    } catch (e) {
      console.error('[CCF B2.30.12] boot', e);
      setStatus(e?.message || 'No fue posible inicializar el acceso.', true);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, {once:true});
  else boot();
})();
