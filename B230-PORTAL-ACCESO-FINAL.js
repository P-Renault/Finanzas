/* CCF B230 — PORTAL DE ACCESO / DELEGACIÓN SEGURA
   Corrección: este módulo NO autentica, NO crea cliente Supabase y NO crea
   una segunda puerta de acceso. CCF-AUTH-BOOT-FINAL.js es el único controlador.
*/
(function () {
  'use strict';
  if (window.__CCF_B230_SAFE_PORTAL__) return;
  window.__CCF_B230_SAFE_PORTAL__ = true;

  const ID = 'ccf-b230-final';
  const $ = (s, root = document) => root.querySelector(s);
  const sleep = ms => new Promise(r => setTimeout(r, ms));

  function style() {
    if ($('#ccf-b230-safe-style')) return;
    const s = document.createElement('style');
    s.id = 'ccf-b230-safe-style';
    s.textContent = `
      #${ID}{position:fixed;inset:0;z-index:2147483000;overflow:auto;
        background:radial-gradient(circle at 78% 12%,rgba(22,136,232,.20),transparent 31%),
        linear-gradient(135deg,#050b14,#07111f 55%,#09192b);
        color:#eef6ff;font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
      #${ID} *{box-sizing:border-box}
      .b230-wrap{width:min(1120px,calc(100% - 32px));margin:auto}
      .b230-nav{height:72px;display:flex;align-items:center;justify-content:space-between;gap:16px;
        border-bottom:1px solid rgba(255,255,255,.08)}
      .b230-brand{font-weight:900;letter-spacing:.08em}
      .b230-brand small{display:block;font-size:10px;font-weight:600;letter-spacing:.04em;color:#8da3ba;margin-top:3px}
      .b230-actions{display:flex;gap:10px;flex-wrap:wrap}
      .b230-btn{border:1px solid rgba(255,255,255,.14);border-radius:10px;padding:11px 16px;
        font-weight:800;cursor:pointer;color:#eef6ff;background:rgba(255,255,255,.05)}
      .b230-primary{background:#1688e8;border-color:#1688e8}
      .b230-hero{display:grid;grid-template-columns:1.1fr .9fr;gap:36px;align-items:center;padding:72px 0 48px}
      .b230-kicker{font-size:11px;letter-spacing:.14em;color:#55c8ff;font-weight:900}
      .b230-hero h1{font-size:clamp(38px,6vw,68px);line-height:.98;margin:12px 0 20px;max-width:760px}
      .b230-hero p{font-size:18px;line-height:1.65;color:#a9bad0;max-width:680px}
      .b230-card{border:1px solid rgba(255,255,255,.10);background:rgba(10,25,42,.78);
        border-radius:18px;padding:22px;box-shadow:0 22px 70px rgba(0,0,0,.24)}
      .b230-card h2{margin:0 0 8px;font-size:18px}.b230-card p{font-size:13px;margin:0 0 18px}
      .b230-metric{display:grid;grid-template-columns:1fr 1fr;gap:10px}
      .b230-metric div{padding:15px;border-radius:12px;background:rgba(255,255,255,.045)}
      .b230-metric span{display:block;font-size:10px;color:#8096ad}.b230-metric b{display:block;margin-top:5px;font-size:18px}
      .b230-positive{color:#54d7ae}
      .b230-section{padding:38px 0}.b230-section h2{font-size:28px;margin:0 0 10px}
      .b230-section>p{color:#93a8bd;line-height:1.6}
      .b230-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-top:22px}
      .b230-feature{padding:20px;border:1px solid rgba(255,255,255,.08);border-radius:15px;background:rgba(255,255,255,.035)}
      .b230-feature b{font-size:14px}.b230-feature p{font-size:12px;color:#8fa5bb;line-height:1.55}
      .b230-cta{padding:34px;margin:30px 0 50px;text-align:center;border-radius:20px;
        background:linear-gradient(135deg,rgba(22,136,232,.18),rgba(84,215,174,.08));
        border:1px solid rgba(84,200,255,.16)}
      .b230-footer{padding:24px 0 38px;color:#70869d;font-size:11px;border-top:1px solid rgba(255,255,255,.08)}
      @media(max-width:800px){.b230-hero{grid-template-columns:1fr;padding-top:45px}.b230-grid{grid-template-columns:1fr}.b230-nav{height:auto;padding:15px 0}.b230-hero h1{font-size:43px}}
      @media(max-width:500px){.b230-wrap{width:min(100% - 22px,1120px)}.b230-actions{width:100%}.b230-actions .b230-btn{flex:1}.b230-metric{grid-template-columns:1fr}}
    `;
    document.head.appendChild(s);
  }

  function html() {
    return `
      <div id="${ID}" role="dialog" aria-label="Portal de acceso al Centro de Control Financiero">
        <div class="b230-wrap">
          <nav class="b230-nav">
            <div class="b230-brand">CCF<small>CENTRO DE CONTROL FINANCIERO</small></div>
            <div class="b230-actions">
              <button class="b230-btn" type="button" data-b230-open="register">Crear cuenta</button>
              <button class="b230-btn b230-primary" type="button" data-b230-open="login">Iniciar sesión</button>
            </div>
          </nav>

          <section class="b230-hero">
            <div>
              <div class="b230-kicker">CONTROL · LIQUIDEZ · PROYECCIÓN</div>
              <h1>Tu sistema financiero, conectado en un solo lugar.</h1>
              <p>Registra movimientos, controla cuentas y deudas, organiza tu presupuesto y observa la evolución de tu liquidez desde un único Centro de Control Financiero.</p>
              <div class="b230-actions">
                <button class="b230-btn b230-primary" type="button" data-b230-open="login">Entrar al sistema →</button>
                <button class="b230-btn" type="button" data-b230-open="register">Crear mi cuenta</button>
              </div>
            </div>
            <div class="b230-card">
              <h2>Vista de control</h2>
              <p>Ejemplo demostrativo · datos simulados</p>
              <div class="b230-metric">
                <div><span>Liquidez disponible</span><b>$842.500</b></div>
                <div><span>Ingresos ejecutados</span><b class="b230-positive">$1.320.000</b></div>
                <div><span>Egresos ejecutados</span><b>$1.067.110</b></div>
                <div><span>Resultado proyectado</span><b class="b230-positive">$252.890</b></div>
              </div>
            </div>
          </section>

          <section class="b230-section">
            <h2>Un flujo financiero integrado</h2>
            <p>Los módulos del CCF trabajan sobre la misma estructura de información para mantener trazabilidad entre registro, planificación y resultado.</p>
            <div class="b230-grid">
              <article class="b230-feature"><b>Liquidez</b><p>Visualiza dinero disponible y movimientos que afectan tu caja.</p></article>
              <article class="b230-feature"><b>Deudas</b><p>Controla saldos, cuotas, vencimientos y pagos.</p></article>
              <article class="b230-feature"><b>Presupuesto</b><p>Compara lo planificado con lo ejecutado.</p></article>
              <article class="b230-feature"><b>Proyección</b><p>Integra ingresos y egresos futuros para anticipar escenarios.</p></article>
              <article class="b230-feature"><b>Calendario</b><p>Ordena compromisos y actividad financiera por fecha.</p></article>
              <article class="b230-feature"><b>Cuentas y operaciones</b><p>Organiza fuentes de dinero y registra operaciones con trazabilidad.</p></article>
            </div>
          </section>

          <section class="b230-cta">
            <h2>Accede a tu Centro de Control Financiero</h2>
            <p>El botón de acceso abre la autenticación existente del sistema. Este portal no administra credenciales.</p>
            <button class="b230-btn b230-primary" type="button" data-b230-open="login">Iniciar sesión →</button>
          </section>

          <footer class="b230-footer">
            <strong>CCF · Centro de Control Financiero</strong><br>
            Producto desarrollado por Somos Software · Innovación Digital
          </footer>
        </div>
      </div>`;
  }

  function removePortal() {
    const p = document.getElementById(ID);
    if (p) p.remove();
    document.body.classList.remove('b230-portal-active');
  }

  function findAuthGate() {
    return document.getElementById('ccf-auth-gate');
  }

  async function waitForGate(timeout=5000) {
    for (let i=0;i<timeout/100;i++) {
      const gate = findAuthGate();
      if (gate) return gate;
      await sleep(100);
    }
    return null;
  }

  async function openExistingAuth(mode) {
    const portal = document.getElementById(ID);
    // La autenticación real es propiedad exclusiva de CCF-AUTH-BOOT-FINAL.js.
    // Primero dejamos visible su gate; no simulamos ni duplicamos el login.
    const gate = await waitForGate();
    if (!gate) {
      // Si el usuario ya tiene sesión, el boot de auth abrirá la aplicación.
      try {
        const c = window.supabaseClient || window.__B23273_CLIENT__ || window.__B23270_CLIENT__ || window.__B23269_CLIENT__;
        const session = c?.auth ? (await c.auth.getSession()).data?.session : null;
        if (session) { removePortal(); return; }
      } catch (_) {}
      alert('La autenticación todavía está cargando. Intenta nuevamente en unos segundos.');
      return;
    }

    removePortal();

    // Intentamos seleccionar el modo en el formulario REAL del gate sin
    // implementar otra autenticación.
    const text = mode === 'register' ? /crear|registr/i : /iniciar|sesión|login/i;
    const buttons = Array.from(gate.querySelectorAll('button'));
    const target = buttons.find(b => text.test((b.textContent || '').trim()));
    if (target) target.click();
    else {
      const firstInput = gate.querySelector('input');
      firstInput?.focus();
    }
  }

  function bind() {
    const p = document.getElementById(ID);
    if (!p) return;
    p.querySelectorAll('[data-b230-open]').forEach(btn => {
      btn.addEventListener('click', () => openExistingAuth(btn.dataset.b230Open));
    });
  }

  async function watchAuth() {
    for (let i=0;i<80;i++) {
      const c = window.supabaseClient || window.__B23273_CLIENT__ || window.__B23270_CLIENT__ || window.__B23269_CLIENT__;
      if (c?.auth) {
        try {
          const {data} = await c.auth.getSession();
          if (data?.session) { removePortal(); return; }
          c.auth.onAuthStateChange((_event, session) => {
            if (session) removePortal();
          });
        } catch (_) {}
        return;
      }
      await sleep(100);
    }
  }

  function boot() {
    style();
    if (!document.getElementById(ID)) {
      document.body.insertAdjacentHTML('afterbegin', html());
    }
    bind();
    watchAuth();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, {once:true});
  else boot();
})();
