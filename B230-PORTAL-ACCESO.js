
/* ============================================================
   B2.30 — PORTAL DE ACCESO + DEMO INTERACTIVA
   CCF · Centro de Control Financiero
   Producto de Somos Software · Innovación Digital

   Integración:
   <script src="B230-PORTAL-ACCESO.js?v=230.2"></script>

   Diseño aislado:
   - No modifica tablas ni datos.
   - No modifica motores financieros.
   - Reutiliza la conexión/Auth existentes.
   - La demo usa exclusivamente datos simulados.
   ============================================================ */
(() => {
  'use strict';

  if (window.__B230_PORTAL__) return;
  window.__B230_PORTAL__ = true;

  const VERSION = 'B2.30 · PORTAL DE ACCESO';
  const DEMO = {
    saldo: 842500,
    ingresos: 1150492,
    gastos: 903394,
    comprometido: 720000,
    proyectado: 440964,
    liquidez: 842500,
    futuroIngresos: 296866,
    futuroGastos: 103000,
    deudas: 676000
  };

  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'
  }[c]));
  const clp = n => '$' + Number(n || 0).toLocaleString('es-CL');

  function getBase() {
    const src = document.currentScript?.src || '';
    return src ? src.replace(/\/[^/]*$/, '/') : './';
  }

  function injectStyles() {
    if ($('#b230-style')) return;
    const style = document.createElement('style');
    style.id = 'b230-style';
    style.textContent = `
      :root{
        --b230-bg:#07111f;--b230-panel:#0d1a2b;--b230-panel2:#102238;
        --b230-line:rgba(148,163,184,.17);--b230-text:#eef6ff;
        --b230-muted:#9db0c7;--b230-blue:#1688e8;--b230-cyan:#36c7ff;
        --b230-red:#ef4050;--b230-green:#37d39a;--b230-gold:#f6c85f;
        --b230-shadow:0 24px 70px rgba(0,0,0,.32);
      }
      #b230-portal,#b230-portal *{box-sizing:border-box}
      #b230-portal{
        position:fixed;inset:0;z-index:2147483000;overflow:auto;
        color:var(--b230-text);background:
          radial-gradient(circle at 78% 12%,rgba(22,136,232,.20),transparent 30%),
          radial-gradient(circle at 12% 35%,rgba(54,199,255,.10),transparent 28%),
          linear-gradient(135deg,#050b14 0%,#07111f 52%,#09192b 100%);
        font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
      }
      #b230-portal button,#b230-portal input{font:inherit}
      .b230-wrap{width:min(1220px,calc(100% - 32px));margin:auto}
      .b230-nav{
        position:sticky;top:0;z-index:20;border-bottom:1px solid var(--b230-line);
        background:rgba(5,11,20,.78);backdrop-filter:blur(18px);
      }
      .b230-navin{height:74px;display:flex;align-items:center;justify-content:space-between;gap:18px}
      .b230-brand{display:flex;align-items:center;gap:12px;min-width:0}
      .b230-mark{
        width:40px;height:40px;border-radius:12px;display:grid;place-items:center;
        background:linear-gradient(145deg,#1688e8,#0b4f93);font-weight:900;font-size:15px;
        box-shadow:0 8px 26px rgba(22,136,232,.35)
      }
      .b230-brand strong{display:block;font-size:15px;letter-spacing:.02em}
      .b230-brand span{display:block;color:var(--b230-muted);font-size:10px;margin-top:2px}
      .b230-navactions{display:flex;gap:9px}
      .b230-btn{
        border:1px solid var(--b230-line);background:rgba(255,255,255,.045);color:var(--b230-text);
        border-radius:11px;padding:10px 15px;font-weight:800;cursor:pointer;transition:.18s ease;
      }
      .b230-btn:hover{transform:translateY(-1px);border-color:rgba(54,199,255,.45)}
      .b230-btn-primary{
        border-color:transparent;background:linear-gradient(135deg,#1688e8,#0e65b7);
        box-shadow:0 10px 28px rgba(22,136,232,.28)
      }
      .b230-btn-lg{padding:13px 20px;border-radius:13px}
      .b230-hero{padding:74px 0 42px}
      .b230-hero-grid{display:grid;grid-template-columns:1.12fr .88fr;gap:44px;align-items:center}
      .b230-kicker{
        display:inline-flex;gap:8px;align-items:center;padding:7px 10px;border:1px solid rgba(54,199,255,.22);
        background:rgba(54,199,255,.06);border-radius:999px;color:#9cddff;font-size:11px;font-weight:900;
        letter-spacing:.08em;text-transform:uppercase
      }
      .b230-dot{width:7px;height:7px;border-radius:50%;background:var(--b230-green);box-shadow:0 0 13px var(--b230-green)}
      .b230-hero h1{font-size:clamp(40px,6vw,76px);line-height:.96;letter-spacing:-.055em;margin:19px 0}
      .b230-hero h1 em{font-style:normal;color:#54caff}
      .b230-lead{font-size:18px;line-height:1.65;color:#b6c6d9;max-width:690px}
      .b230-ctas{display:flex;flex-wrap:wrap;gap:11px;margin-top:26px}
      .b230-mini{display:flex;flex-wrap:wrap;gap:16px;margin-top:21px;color:#90a5bd;font-size:12px}
      .b230-mini b{color:#dce9f6}
      .b230-visual{
        position:relative;min-height:390px;border:1px solid var(--b230-line);border-radius:25px;
        background:linear-gradient(145deg,rgba(16,34,56,.92),rgba(7,17,31,.82));box-shadow:var(--b230-shadow);
        padding:18px;overflow:hidden
      }
      .b230-visual:before{content:"";position:absolute;width:250px;height:250px;border-radius:50%;right:-90px;top:-100px;
        background:rgba(54,199,255,.16);filter:blur(8px)}
      .b230-dashboard{position:relative;display:grid;grid-template-columns:1.3fr .7fr;gap:12px}
      .b230-card{border:1px solid var(--b230-line);background:rgba(255,255,255,.045);border-radius:15px;padding:14px}
      .b230-card small{color:#8ea4bb;font-size:10px;text-transform:uppercase;letter-spacing:.08em;font-weight:800}
      .b230-value{font-size:25px;font-weight:900;margin-top:7px}
      .b230-chart{height:125px;margin-top:12px;display:flex;align-items:end;gap:7px}
      .b230-bar{flex:1;border-radius:5px 5px 2px 2px;background:linear-gradient(#36c7ff,#126fc3);opacity:.9}
      .b230-flow{margin-top:12px;display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
      .b230-flow div{text-align:center;padding:10px 5px;border-radius:10px;background:rgba(255,255,255,.035);border:1px solid var(--b230-line);font-size:10px;color:#b8c9db}
      .b230-flow b{display:block;color:#fff;font-size:12px;margin-bottom:4px}
      .b230-section{padding:58px 0}
      .b230-sectionhead{display:flex;align-items:end;justify-content:space-between;gap:20px;margin-bottom:22px}
      .b230-sectionhead h2{font-size:32px;letter-spacing:-.035em;margin:0 0 8px}
      .b230-sectionhead p{color:var(--b230-muted);margin:0;line-height:1.6;max-width:680px}
      .b230-demo{
        border:1px solid var(--b230-line);border-radius:22px;overflow:hidden;background:rgba(10,24,40,.88);
        box-shadow:var(--b230-shadow)
      }
      .b230-demotop{padding:14px 16px;border-bottom:1px solid var(--b230-line);display:flex;justify-content:space-between;align-items:center;gap:12px}
      .b230-demo-badge{font-size:10px;font-weight:900;letter-spacing:.08em;color:#ffd98a;border:1px solid rgba(246,200,95,.3);
        background:rgba(246,200,95,.07);padding:6px 9px;border-radius:999px}
      .b230-demo-tabs{display:flex;gap:6px;overflow:auto;padding:12px;border-bottom:1px solid var(--b230-line)}
      .b230-tab{white-space:nowrap;border:1px solid transparent;background:transparent;color:#8fa4bb;padding:9px 11px;border-radius:9px;
        font-size:11px;font-weight:900;cursor:pointer}
      .b230-tab.active{color:#fff;background:rgba(22,136,232,.17);border-color:rgba(22,136,232,.35)}
      .b230-demo-body{padding:18px}
      .b230-kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}
      .b230-kpi{padding:14px;border:1px solid var(--b230-line);background:rgba(255,255,255,.035);border-radius:13px}
      .b230-kpi span{display:block;color:#8ea4bb;font-size:10px;font-weight:800;text-transform:uppercase}
      .b230-kpi strong{display:block;font-size:20px;margin-top:7px}
      .b230-demo-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:12px}
      .b230-list{border:1px solid var(--b230-line);border-radius:13px;overflow:hidden}
      .b230-row{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:12px 13px;border-bottom:1px solid var(--b230-line)}
      .b230-row:last-child{border-bottom:0}
      .b230-row span{color:#aabbd0;font-size:11px}.b230-row b{font-size:12px}.b230-positive{color:var(--b230-green)}.b230-negative{color:#ff7884}
      .b230-progress{height:8px;background:#122337;border-radius:99px;overflow:hidden;margin-top:10px}
      .b230-progress i{display:block;height:100%;border-radius:99px;background:linear-gradient(90deg,#1688e8,#36c7ff)}
      .b230-steps{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}
      .b230-step{padding:20px;border:1px solid var(--b230-line);border-radius:16px;background:rgba(255,255,255,.03)}
      .b230-stepnum{width:32px;height:32px;border-radius:9px;display:grid;place-items:center;background:#10365c;color:#75d5ff;font-weight:900;margin-bottom:15px}
      .b230-step h3{font-size:14px;margin:0 0 7px}.b230-step p{font-size:12px;color:#91a6bd;line-height:1.55;margin:0}
      .b230-features{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
      .b230-feature{padding:21px;border:1px solid var(--b230-line);border-radius:17px;background:rgba(255,255,255,.03)}
      .b230-icon{font-size:21px}.b230-feature h3{margin:12px 0 7px;font-size:15px}.b230-feature p{margin:0;color:#92a7bd;font-size:12px;line-height:1.6}
      .b230-final{padding:72px 0;text-align:center}
      .b230-finalbox{border:1px solid rgba(54,199,255,.2);border-radius:25px;padding:48px 24px;background:
        radial-gradient(circle at 50% 0,rgba(22,136,232,.18),transparent 42%),rgba(10,25,42,.8)}
      .b230-final h2{font-size:clamp(30px,4vw,48px);letter-spacing:-.04em;margin:0 0 12px}.b230-final p{color:#9fb1c5;max-width:670px;margin:0 auto 25px;line-height:1.6}
      .b230-footer{border-top:1px solid var(--b230-line);padding:34px 0 28px;text-align:center;color:#8195ab}
      .b230-footer img{width:min(310px,68vw);max-height:105px;object-fit:contain;background:#fff;border-radius:8px;padding:9px;margin-bottom:13px}
      .b230-footer strong{display:block;color:#d8e5f1;font-size:12px}.b230-footer span{font-size:11px}
      .b230-modal{position:fixed;inset:0;z-index:50;display:grid;place-items:center;padding:20px;background:rgba(1,7,14,.76);backdrop-filter:blur(12px)}
      .b230-modal.hidden{display:none}.b230-auth{width:min(430px,100%);border:1px solid var(--b230-line);border-radius:20px;
        background:#0b1828;box-shadow:0 35px 100px rgba(0,0,0,.55);padding:24px}
      .b230-auth-head{display:flex;justify-content:space-between;gap:10px;align-items:start}.b230-auth h3{font-size:24px;margin:0 0 6px}
      .b230-auth p{font-size:12px;color:#8fa4bb;line-height:1.5;margin:0}.b230-close{border:0;background:transparent;color:#9fb1c5;font-size:24px;cursor:pointer}
      .b230-auth form{margin-top:19px}.b230-field{display:grid;gap:6px;margin-bottom:12px}.b230-field label{font-size:11px;font-weight:800;color:#b9c9d9}
      .b230-field input{width:100%;height:46px;border-radius:10px;border:1px solid var(--b230-line);background:#07111f;color:#fff;padding:0 12px;outline:none}
      .b230-field input:focus{border-color:#2c9ce9;box-shadow:0 0 0 3px rgba(44,156,233,.12)}
      .b230-auth-submit{width:100%;height:46px}.b230-auth-switch{text-align:center;margin-top:13px!important}
      .b230-link{border:0;background:none;color:#54caff;cursor:pointer;font-weight:800;padding:0}
      .b230-status{min-height:18px;font-size:11px!important;margin-top:11px!important;color:#a9bad0!important}
      .b230-hidden-app{display:none!important}
      @media(max-width:900px){
        .b230-hero-grid{grid-template-columns:1fr}.b230-visual{min-height:300px}
        .b230-features{grid-template-columns:1fr 1fr}.b230-steps{grid-template-columns:1fr 1fr}.b230-kpis{grid-template-columns:1fr 1fr}
      }
      @media(max-width:620px){
        .b230-navin{height:66px}.b230-brand span{display:none}.b230-navactions .b230-btn{padding:8px 10px;font-size:11px}
        .b230-hero{padding:48px 0 25px}.b230-hero h1{font-size:45px}.b230-lead{font-size:15px}
        .b230-dashboard{grid-template-columns:1fr}.b230-visual{min-height:470px}
        .b230-demo-grid,.b230-features,.b230-steps{grid-template-columns:1fr}.b230-kpis{grid-template-columns:1fr 1fr}
        .b230-section{padding:40px 0}.b230-sectionhead h2{font-size:26px}
      }
    `;
    document.head.appendChild(style);
  }

  function appElement() { return $('#app'); }
  function hideLegacyUI() {
    ['configPanel','b23269-auth-panel','b23269-footer','b23273-bridge-badge','b23274Footer'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.add('b230-hidden-app');
    });
  }

  function portalHTML() {
    const base = getBase();
    return `
      <div id="b230-portal" aria-label="Portal de acceso CCF">
        <nav class="b230-nav">
          <div class="b230-wrap b230-navin">
            <div class="b230-brand">
              <div class="b230-mark">CCF</div>
              <div><strong>Centro de Control Financiero</strong><span>Gestión · Liquidez · Planificación</span></div>
            </div>
            <div class="b230-navactions">
              <button class="b230-btn" data-b230-auth="login">Iniciar sesión</button>
              <button class="b230-btn b230-btn-primary" data-b230-auth="register">Crear cuenta</button>
            </div>
          </div>
        </nav>

        <section class="b230-hero">
          <div class="b230-wrap b230-hero-grid">
            <div>
              <div class="b230-kicker"><i class="b230-dot"></i> Sistema financiero integral</div>
              <h1>Toma el control.<br><em>Construye tu futuro.</em></h1>
              <p class="b230-lead">
                CCF transforma tus ingresos, gastos, deudas, liquidez y objetivos en un sistema financiero organizado,
                operativo y proyectable.
              </p>
              <div class="b230-ctas">
                <button class="b230-btn b230-btn-primary b230-btn-lg" data-b230-auth="register">Comenzar ahora →</button>
                <button class="b230-btn b230-btn-lg" data-b230-scroll="demo">Explorar el sistema</button>
              </div>
              <div class="b230-mini">
                <span>✓ <b>Control centralizado</b></span>
                <span>✓ <b>Datos en tiempo real</b></span>
                <span>✓ <b>Proyección financiera</b></span>
              </div>
            </div>
            <div class="b230-visual">
              <div class="b230-dashboard">
                <div class="b230-card">
                  <small>Resultado proyectado</small><div class="b230-value">${clp(DEMO.proyectado)}</div>
                  <div class="b230-chart">${[35,51,44,67,58,80,94].map(h=>`<i class="b230-bar" style="height:${h}%"></i>`).join('')}</div>
                </div>
                <div class="b230-card"><small>Liquidez</small><div class="b230-value">${clp(DEMO.liquidez)}</div><div class="b230-progress"><i style="width:78%"></i></div></div>
              </div>
              <div class="b230-flow">
                <div><b>01</b>Registrar</div><div><b>02</b>Controlar</div><div><b>03</b>Proyectar</div>
              </div>
              <div class="b230-card" style="margin-top:12px">
                <small>Centro de operaciones</small>
                <div class="b230-row" style="padding:10px 0"><span>Ingresos ejecutados</span><b class="b230-positive">${clp(DEMO.ingresos)}</b></div>
                <div class="b230-row" style="padding:10px 0"><span>Egresos ejecutados</span><b class="b230-negative">${clp(DEMO.gastos)}</b></div>
                <div class="b230-row" style="padding:10px 0"><span>Obligaciones programadas</span><b>${clp(DEMO.comprometido)}</b></div>
              </div>
            </div>
          </div>
        </section>

        <section class="b230-section" id="b230-demo">
          <div class="b230-wrap">
            <div class="b230-sectionhead">
              <div><h2>Conoce CCF en operación</h2><p>Explora una representación funcional del sistema con <b>datos simulados</b>. Cada vista muestra cómo se utiliza antes de crear tu cuenta.</p></div>
              <span class="b230-demo-badge">● DEMO · DATOS SIMULADOS</span>
            </div>
            <div class="b230-demo">
              <div class="b230-demotop"><strong>Centro de Control Financiero</strong><span style="color:#8096ad;font-size:10px">${VERSION}</span></div>
              <div class="b230-demo-tabs">
                ${[['resumen','Resumen'],['liquidez','Liquidez'],['deudas','Deudas'],['presupuesto','Presupuesto'],['proyeccion','Proyección'],['movimientos','Movimientos'],['calendario','Calendario'],['operaciones','Operaciones']].map((x,i)=>`<button class="b230-tab ${i===0?'active':''}" data-b230-demo="${x[0]}">${x[1]}</button>`).join('')}
              </div>
              <div class="b230-demo-body" id="b230-demo-body"></div>
            </div>
          </div>
        </section>

        <section class="b230-section">
          <div class="b230-wrap">
            <div class="b230-sectionhead"><div><h2>Un sistema, un flujo financiero</h2><p>CCF conecta las operaciones para que cada registro tenga una consecuencia visible sobre tu situación financiera.</p></div></div>
            <div class="b230-steps">
              ${[
                ['01','Registrar','Ingresos, gastos, movimientos, compromisos y objetivos.'],
                ['02','Controlar','Liquidez, cuentas, deudas y ejecución financiera.'],
                ['03','Proyectar','Integra ingresos y egresos futuros para anticipar escenarios.'],
                ['04','Decidir','Utiliza información estructurada para organizar tus próximos pasos.']
              ].map(x=>`<article class="b230-step"><div class="b230-stepnum">${x[0]}</div><h3>${x[1]}</h3><p>${x[2]}</p></article>`).join('')}
            </div>
          </div>
        </section>

        <section class="b230-section">
          <div class="b230-wrap">
            <div class="b230-sectionhead"><div><h2>Todo tu sistema financiero en un solo lugar</h2><p>Los módulos están conectados para trabajar como un ecosistema y no como herramientas aisladas.</p></div></div>
            <div class="b230-features">
              ${[
                ['◈','Liquidez','Conoce el dinero disponible y su distribución.'],
                ['▣','Deudas','Controla saldos, cuotas, vencimientos y pagos.'],
                ['◫','Presupuesto','Compara planificación, ejecución y resultado.'],
                ['◉','Proyección','Visualiza ingresos y egresos que vienen.'],
                ['↔','Movimientos','Registra y controla cada operación financiera.'],
                ['⌁','Calendario','Visualiza compromisos y actividad por fecha.'],
                ['▤','Cuentas','Organiza tus distintas fuentes de dinero.'],
                ['⚙','Operaciones','Ejecuta pagos y movimientos con trazabilidad.'],
                ['◇','Ahorro','Registra aportes, retiros y evolución del ahorro.']
              ].map(x=>`<article class="b230-feature"><div class="b230-icon">${x[0]}</div><h3>${x[1]}</h3><p>${x[2]}</p></article>`).join('')}
            </div>
          </div>
        </section>

        <section class="b230-final">
          <div class="b230-wrap">
            <div class="b230-finalbox">
              <h2>Ya viste cómo funciona.</h2>
              <p>Ahora puedes crear tu propia estructura financiera y comenzar a registrar tus datos reales.</p>
              <button class="b230-btn b230-btn-primary b230-btn-lg" data-b230-auth="register">Crear mi cuenta →</button>
            </div>
          </div>
        </section>

        <footer class="b230-footer">
          <div class="b230-wrap">
            <img src="${esc(base + 'assets/somos-software.jpg')}" alt="Somos Software · Innovación Digital">
            <strong>CCF · Centro de Control Financiero</strong>
            <span>Producto desarrollado por Somos Software · Innovación Digital</span>
          </div>
        </footer>

        <div class="b230-modal hidden" id="b230-modal" role="dialog" aria-modal="true">
          <div class="b230-auth">
            <div class="b230-auth-head">
              <div><h3 id="b230-auth-title">Iniciar sesión</h3><p id="b230-auth-copy">Accede a tu Centro de Control Financiero.</p></div>
              <button class="b230-close" data-b230-close aria-label="Cerrar">×</button>
            </div>
            <form id="b230-login-form">
              <div class="b230-field"><label>Correo electrónico</label><input id="b230-login-email" type="email" autocomplete="email" required></div>
              <div class="b230-field"><label>Contraseña</label><input id="b230-login-password" type="password" autocomplete="current-password" required></div>
              <button class="b230-btn b230-btn-primary b230-auth-submit" type="submit">Iniciar sesión</button>
              <p class="b230-auth-switch">¿No tienes cuenta? <button type="button" class="b230-link" data-b230-auth="register">Crear cuenta</button></p>
              <p class="b230-auth-switch"><button type="button" class="b230-link" data-b230-recover>Recuperar contraseña</button></p>
            </form>
            <form id="b230-register-form" style="display:none">
              <div class="b230-field"><label>Nombre</label><input id="b230-register-name" type="text" autocomplete="name" required></div>
              <div class="b230-field"><label>Correo electrónico</label><input id="b230-register-email" type="email" autocomplete="email" required></div>
              <div class="b230-field"><label>Contraseña</label><input id="b230-register-password" type="password" autocomplete="new-password" minlength="8" required></div>
              <div class="b230-field"><label>Confirmar contraseña</label><input id="b230-register-confirm" type="password" autocomplete="new-password" minlength="8" required></div>
              <button class="b230-btn b230-btn-primary b230-auth-submit" type="submit">Crear cuenta</button>
              <p class="b230-auth-switch">¿Ya tienes cuenta? <button type="button" class="b230-link" data-b230-auth="login">Iniciar sesión</button></p>
            </form>
            <p id="b230-auth-status" class="b230-status" role="status" aria-live="polite"></p>
          </div>
        </div>
      </div>`;
  }

  function demoBody(key) {
    const list = rows => `<div class="b230-list">${rows.map(r=>`<div class="b230-row"><span>${r[0]}</span><b class="${r[2]||''}">${r[1]}</b></div>`).join('')}</div>`;
    if (key === 'resumen') return `
      <div class="b230-kpis">
        ${[['Saldo disponible',clp(DEMO.saldo)],['Ingresos ejecutados',clp(DEMO.ingresos),'b230-positive'],['Egresos ejecutados',clp(DEMO.gastos),'b230-negative'],['Resultado proyectado',clp(DEMO.proyectado),'b230-positive']].map(x=>`<div class="b230-kpi"><span>${x[0]}</span><strong class="${x[2]||''}">${x[1]}</strong></div>`).join('')}
      </div>
      <div class="b230-demo-grid">${list([['Plan de ingresos',clp(1320000)],['Plan de egresos',clp(1067110)],['Obligaciones programadas',clp(DEMO.comprometido)],['Ingresos futuros',clp(DEMO.futuroIngresos),'b230-positive']])}
      <div class="b230-card"><small>Lectura del sistema</small><p style="color:#b2c3d6;font-size:12px;line-height:1.6">CCF reúne ejecución, liquidez y proyección para mostrar una fotografía financiera y un escenario futuro.</p><div class="b230-progress"><i style="width:72%"></i></div></div></div>`;
    if (key === 'liquidez') return `<div class="b230-kpis">${[['Efectivo',clp(185000)],['Cuenta principal',clp(657500)],['Liquidez total',clp(DEMO.liquidez),'b230-positive'],['Variación del día',clp(36500),'b230-positive']].map(x=>`<div class="b230-kpi"><span>${x[0]}</span><strong class="${x[2]||''}">${x[1]}</strong></div>`).join('')}</div><div style="margin-top:12px">${list([['Ingreso Uber',clp(58500),'b230-positive'],['Combustible',clp(-12000),'b230-negative'],['Alimentación',clp(-10000),'b230-negative'],['Ingreso Uber',clp(75000),'b230-positive']])}</div>`;
    if (key === 'deudas') return `<div class="b230-kpis"><div class="b230-kpi"><span>Deuda pendiente</span><strong>${clp(DEMO.deudas)}</strong></div><div class="b230-kpi"><span>Cuotas programadas</span><strong>${clp(420000)}</strong></div><div class="b230-kpi"><span>Pagado simulado</span><strong class="b230-positive">${clp(185000)}</strong></div><div class="b230-kpi"><span>Estado</span><strong style="font-size:15px">Controlado</strong></div></div><div style="margin-top:12px">${list([['Vecina Erika',clp(460000)],['Santiago · cuotas',clp(108000)],['Carlos',clp(78000)],['Fernanda',clp(30000)]])}</div><div class="b230-card" style="margin-top:12px;font-size:11px;color:#9db0c7">Flujo demostrativo: <b style="color:#fff">Deuda → Cuota → Pago → Movimiento → Liquidez</b></div>`;
    if (key === 'presupuesto') return `<div class="b230-kpis">${[['Ingresos planificados',clp(1320000),'b230-positive'],['Egresos planificados',clp(1067110),'b230-negative'],['Resultado del plan',clp(252890),'b230-positive'],['Ahorro planificado',clp(100000),'b230-positive']].map(x=>`<div class="b230-kpi"><span>${x[0]}</span><strong class="${x[2]||''}">${x[1]}</strong></div>`).join('')}</div><div class="b230-demo-grid">${list([['Alimentación',clp(220000)],['Transporte',clp(190000)],['Vivienda',clp(300000)],['Deudas',clp(280000)]])}<div class="b230-card"><small>Ejecución simulada</small><div class="b230-progress"><i style="width:84%"></i></div><p style="color:#93a8bd;font-size:11px">Planificado → Ejecutado → Proyectado</p></div></div>`;
    if (key === 'proyeccion') return `<div class="b230-kpis">${[['Ingresos futuros',clp(DEMO.futuroIngresos),'b230-positive'],['Egresos futuros',clp(DEMO.futuroGastos),'b230-negative'],['Comprometido',clp(DEMO.comprometido)],['Resultado proyectado',clp(DEMO.proyectado),'b230-positive']].map(x=>`<div class="b230-kpi"><span>${x[0]}</span><strong class="${x[2]||''}">${x[1]}</strong></div>`).join('')}</div><div class="b230-card" style="margin-top:12px"><small>Modelo temporal</small><div class="b230-row"><span>Situación ejecutada</span><b>${clp(DEMO.ingresos-DEMO.gastos)}</b></div><div class="b230-row"><span>+ Ingresos futuros</span><b class="b230-positive">${clp(DEMO.futuroIngresos)}</b></div><div class="b230-row"><span>- Egresos futuros</span><b class="b230-negative">-${clp(DEMO.futuroGastos)}</b></div><div class="b230-row"><span>Resultado proyectado</span><b class="b230-positive">${clp(DEMO.proyectado)}</b></div></div>`;
    if (key === 'movimientos') return list([['24 SEP · Ingreso Uber',clp(58500),'b230-positive'],['24 SEP · Combustible',clp(-12000),'b230-negative'],['24 SEP · Alimentación',clp(-10000),'b230-negative'],['23 SEP · Pago de deuda',clp(-20000),'b230-negative'],['23 SEP · Ingreso Uber',clp(75000),'b230-positive']]);
    if (key === 'calendario') return `<div class="b230-card"><small>SEPTIEMBRE 2026 · DEMO</small><div style="display:grid;grid-template-columns:repeat(7,1fr);gap:5px;margin-top:13px">${['L','M','X','J','V','S','D',21,22,23,24,25,26,27,28,29,30].map((x,i)=>`<div style="padding:9px 3px;text-align:center;border-radius:7px;background:${i===10?'rgba(22,136,232,.25)':'rgba(255,255,255,.03)'};color:${i<7?'#71869e':'#d9e6f3'};font-size:10px">${x}</div>`).join('')}</div><div class="b230-row" style="margin-top:10px"><span>24 SEP · actividad financiera</span><b class="b230-positive">${clp(36500)} neto</b></div></div>`;
    return `<div class="b230-kpis">${[['Operación','Pago de deuda'],['Cuota','#04'],['Monto',clp(20000)],['Fuente','Efectivo']].map(x=>`<div class="b230-kpi"><span>${x[0]}</span><strong style="font-size:15px">${x[1]}</strong></div>`).join('')}</div><div class="b230-card" style="margin-top:12px;text-align:center"><p style="color:#a6b9cd;font-size:12px">✓ Operación registrada<br>✓ Deuda actualizada<br>✓ Liquidez actualizada<br>✓ Movimiento generado</p></div>`;
  }

  function renderDemo(key='resumen') {
    const body = $('#b230-demo-body');
    if (!body) return;
    body.innerHTML = demoBody(key);
    $$('.b230-tab').forEach(b => b.classList.toggle('active', b.dataset.b230Demo === key));
  }

  function openModal(mode) {
    const modal = $('#b230-modal'); if (!modal) return;
    modal.classList.remove('hidden');
    const login = $('#b230-login-form'), reg = $('#b230-register-form');
    const title = $('#b230-auth-title'), copy = $('#b230-auth-copy');
    if (mode === 'register') {
      login.style.display='none'; reg.style.display='block';
      title.textContent='Crear cuenta'; copy.textContent='Construye tu propio Centro de Control Financiero.';
    } else {
      login.style.display='block'; reg.style.display='none';
      title.textContent='Iniciar sesión'; copy.textContent='Accede a tu Centro de Control Financiero.';
    }
    setTimeout(() => (mode==='register'?$('#b230-register-name'):$('#b230-login-email'))?.focus(),50);
  }
  function closeModal(){ $('#b230-modal')?.classList.add('hidden'); }
  function status(t, error=false){ const el=$('#b230-auth-status'); if(el){el.textContent=t;el.style.color=error?'#ff8791':'#a9bad0';} }

  async function getAuthClient() {
    for(let i=0;i<60;i++){
      const c = window.__B23273_CLIENT__ || window.__B23270_CLIENT__ || window.__B23269_CLIENT__ || window.supabaseClient;
      if(c?.auth) return c;
      await new Promise(r=>setTimeout(r,100));
    }
    throw new Error('El módulo de autenticación todavía no está disponible.');
  }

  async function enterApp() {
    const portal=$('#b230-portal');
    status('Sesión válida. Abriendo el Centro de Control…');
    try {
      if(typeof window.connect==='function') await window.connect();
      else await new Promise(r=>setTimeout(r,700));
      portal?.remove();
      const app=appElement();
      if(app) {
        // El portal oculta temporalmente #app con b230-hidden-app.
        // Al entrar al sistema hay que retirar AMBOS bloqueos.
        app.classList.remove('hidden');
        app.classList.remove('b230-hidden-app');
      }
      closeModal();
    } catch(e) {
      status(e?.message || 'No fue posible abrir el sistema.', true);
    }
  }

  async function signIn(){
    const email=$('#b230-login-email').value.trim(), password=$('#b230-login-password').value;
    if(!email||!password)return;
    status('Iniciando sesión…');
    try{
      const c=await getAuthClient();
      const {data,error}=await c.auth.signInWithPassword({email,password});
      if(error)throw error;
      if(!data?.session)throw new Error('No se recibió una sesión activa.');
      await enterApp();
    }catch(e){console.error('[B2.30] signIn',e);status(e?.message||'No fue posible iniciar sesión.',true);}
  }

  async function signUp(){
    const name=$('#b230-register-name').value.trim(), email=$('#b230-register-email').value.trim();
    const password=$('#b230-register-password').value, confirm=$('#b230-register-confirm').value;
    if(password!==confirm){status('Las contraseñas no coinciden.',true);return;}
    status('Creando cuenta…');
    try{
      const c=await getAuthClient();
      const redirect=window.location.origin+window.location.pathname;
      const {data,error}=await c.auth.signUp({email,password,options:{data:{full_name:name},emailRedirectTo:redirect}});
      if(error)throw error;
      if(data?.session){await enterApp();return;}
      status('Cuenta creada. Revisa tu correo para confirmar la cuenta y luego inicia sesión.');
    }catch(e){console.error('[B2.30] signUp',e);status(e?.message||'No fue posible crear la cuenta.',true);}
  }

  async function recover(){
    const email=$('#b230-login-email').value.trim();
    if(!email){status('Ingresa primero tu correo electrónico.',true);return;}
    status('Enviando instrucciones de recuperación…');
    try{
      const c=await getAuthClient();
      const redirect=window.location.origin+window.location.pathname;
      const {error}=await c.auth.resetPasswordForEmail(email,{redirectTo:redirect});
      if(error)throw error;
      status('Si el correo está registrado, recibirás las instrucciones para recuperar tu contraseña.');
    }catch(e){console.error('[B2.30] recover',e);status(e?.message||'No fue posible solicitar la recuperación.',true);}
  }

  function bind(){
    $$('#b230-portal [data-b230-auth]').forEach(b=>b.addEventListener('click',()=>openModal(b.dataset.b230Auth)));
    $$('#b230-portal [data-b230-scroll]').forEach(b=>b.addEventListener('click',()=>$('#b230-demo')?.scrollIntoView({behavior:'smooth'})));
    $$('.b230-tab').forEach(b=>b.addEventListener('click',()=>renderDemo(b.dataset.b230Demo)));
    $('[data-b230-close]')?.addEventListener('click',closeModal);
    $('#b230-modal')?.addEventListener('click',e=>{if(e.target.id==='b230-modal')closeModal();});
    $('#b230-login-form')?.addEventListener('submit',e=>{e.preventDefault();signIn();});
    $('#b230-register-form')?.addEventListener('submit',e=>{e.preventDefault();signUp();});
    $('[data-b230-recover]')?.addEventListener('click',recover);
    document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal();});
  }

  async function boot(){
    injectStyles();
    document.body.insertAdjacentHTML('afterbegin',portalHTML());
    hideLegacyUI();
    const app=appElement();
    if(app) app.classList.add('b230-hidden-app');
    renderDemo('resumen');
    bind();

    // Si ya existe una sesión válida, el portal funciona como pantalla inicial
    // y permite entrar sin pedir nuevamente la conexión.
    try{
      const c=await getAuthClient();
      const {data}=await c.auth.getSession();
      if(data?.session){
        const p=$('#b230-portal');
        const note=document.createElement('div');
        note.style.cssText='position:fixed;bottom:14px;left:50%;transform:translateX(-50%);z-index:60;padding:9px 13px;border:1px solid rgba(54,199,255,.25);background:#0b1828;color:#a9bad0;border-radius:999px;font-size:11px;box-shadow:0 10px 35px rgba(0,0,0,.35)';
        note.textContent='Sesión activa · entrando al sistema…';
        p?.appendChild(note);
        setTimeout(enterApp,450);
      }
    }catch(e){ console.info('[B2.30] Auth aún no disponible:',e?.message||e); }
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
