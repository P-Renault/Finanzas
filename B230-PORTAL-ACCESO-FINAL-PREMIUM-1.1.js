/* CCF — PORTAL PREMIUM / ESCRITORIO + MÓVIL
   Versión construida sobre la interacción del portal B230.
   - No modifica Supabase ni el flujo de autenticación existente.
   - Mantiene el nombre/versionado del archivo de integración.
   - Usa las imágenes recortadas directamente desde el diseño aprobado.
   - Responsive real: escritorio / tablet / móvil.
*/
(function () {
  "use strict";

  if (window.__CCF_DESIGN_PORTAL_V2__) return;
  window.__CCF_DESIGN_PORTAL_V2__ = true;

  const PORTAL_ID = "ccf-design-portal";
  const STYLE_ID = "ccf-design-portal-style";

  const ASSETS = Object.assign({
    heroDesktop: "./assets/hero-desktop.jpg",
    heroMobile: "./assets/hero-mobile.jpg",
    modules: {
      resumen: "./assets/module-resumen.jpg",
      calendario: "./assets/module-calendario.jpg",
      movimientos: "./assets/module-movimientos.jpg",
      presupuesto: "./assets/module-presupuesto.jpg",
      deudas: "./assets/module-deudas.jpg",
      planificacion: "./assets/module-planificacion.jpg"
    },
    audience: {
      emprendedores: "./assets/audiencia-emprendedores.jpg",
      empresarios: "./assets/audiencia-empresarios.jpg",
      independientes: "./assets/audiencia-independientes.jpg",
      duenos: "./assets/audiencia-duenos.jpg",
      hogar: "./assets/audiencia-hogar.jpg"
    }
  }, window.CCF_DESIGN_ASSETS || {});

  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      #${PORTAL_ID}{
        position:fixed; inset:0; z-index:2147483000; overflow:auto;
        color:#edf7ff;
        background:
          radial-gradient(circle at 78% 7%,rgba(0,220,255,.17),transparent 25%),
          radial-gradient(circle at 8% 48%,rgba(0,190,255,.10),transparent 27%),
          linear-gradient(135deg,#020812 0%,#061321 52%,#03111d 100%);
        font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
        -webkit-font-smoothing:antialiased;
        scroll-behavior:smooth;
      }
      #${PORTAL_ID} *,#${PORTAL_ID} *::before,#${PORTAL_ID} *::after{box-sizing:border-box}
      #${PORTAL_ID} button{font:inherit}
      #${PORTAL_ID} .ccf-wrap{width:min(1180px,calc(100% - 42px));margin:auto}
      #${PORTAL_ID} .ccf-progress{position:fixed;left:0;top:0;width:0;height:2px;background:#00e5d0;z-index:100;box-shadow:0 0 14px #00e5d0}
      #${PORTAL_ID} .ccf-nav{
        position:sticky;top:0;z-index:80;min-height:64px;
        background:rgba(2,8,18,.84);backdrop-filter:blur(18px);
        border-bottom:1px solid rgba(255,255,255,.07);
      }
      #${PORTAL_ID} .ccf-nav-inner{width:min(1180px,calc(100% - 42px));margin:auto;min-height:64px;display:flex;align-items:center;gap:18px}
      #${PORTAL_ID} .ccf-brand{display:flex;align-items:center;gap:10px;white-space:nowrap}
      #${PORTAL_ID} .ccf-logo{width:37px;height:37px;border-radius:10px;display:grid;place-items:center;color:#03121b;background:#14dfe4;font-size:11px;font-weight:950}
      #${PORTAL_ID} .ccf-brand b{font-size:12px;letter-spacing:.04em}
      #${PORTAL_ID} .ccf-brand small{display:block;margin-top:2px;color:#73889d;font-size:6px;letter-spacing:.11em}
      #${PORTAL_ID} .ccf-links{display:flex;gap:26px;margin:auto}
      #${PORTAL_ID} .ccf-links button{
        position:relative;border:0;background:none;color:#b3c2d1;cursor:pointer;
        padding:22px 0 20px;font-size:10px;font-weight:750
      }
      #${PORTAL_ID} .ccf-links button::after{
        content:"";position:absolute;left:0;right:0;bottom:13px;height:2px;
        background:#00e5d0;transform:scaleX(0);transition:.2s
      }
      #${PORTAL_ID} .ccf-links button:hover,#${PORTAL_ID} .ccf-links button.active{color:white}
      #${PORTAL_ID} .ccf-links button.active::after{transform:scaleX(1)}
      #${PORTAL_ID} .ccf-actions{display:flex;gap:8px}
      #${PORTAL_ID} .ccf-btn{
        min-height:38px;padding:9px 16px;border-radius:9px;
        border:1px solid rgba(255,255,255,.16);background:rgba(255,255,255,.03);
        color:white;font-size:9px;font-weight:850;cursor:pointer;transition:.2s;
      }
      #${PORTAL_ID} .ccf-btn:hover{transform:translateY(-2px);border-color:rgba(0,220,255,.42)}
      #${PORTAL_ID} .ccf-btn.primary{
        color:#03121a;border-color:transparent;
        background:linear-gradient(110deg,#5be5ca,#00dff0,#4ab9ff);
        box-shadow:0 8px 25px rgba(0,220,255,.18)
      }
      #${PORTAL_ID} .ccf-mobile-menu{display:none}

      #${PORTAL_ID} .ccf-hero{
        min-height:525px;display:grid;grid-template-columns:39% 61%;gap:18px;
        align-items:center;padding:42px 0 46px
      }
      #${PORTAL_ID} .ccf-eyebrow{
        display:inline-flex;align-items:center;gap:7px;padding:6px 10px;border-radius:999px;
        color:#49dce7;background:rgba(0,220,255,.045);border:1px solid rgba(0,220,255,.23);
        font-size:8px;font-weight:950;letter-spacing:.14em
      }
      #${PORTAL_ID} .ccf-eyebrow::before{content:"";width:5px;height:5px;border-radius:50%;background:#39e0c2;box-shadow:0 0 12px #39e0c2}
      #${PORTAL_ID} .ccf-hero h1{
        margin:17px 0 16px;max-width:455px;font-size:clamp(40px,4.4vw,62px);
        line-height:.94;letter-spacing:-.055em
      }
      #${PORTAL_ID} .ccf-grad{color:#00e4df}
      #${PORTAL_ID} .ccf-hero p{max-width:440px;margin:0;color:#9db0c3;font-size:13px;line-height:1.62}
      #${PORTAL_ID} .ccf-cta{display:flex;gap:9px;margin-top:22px}
      #${PORTAL_ID} .ccf-proof{display:grid;grid-template-columns:repeat(4,1fr);gap:7px;margin-top:22px}
      #${PORTAL_ID} .ccf-proof-item{display:flex;align-items:center;gap:5px;color:#8398ab;font-size:7px;line-height:1.25}
      #${PORTAL_ID} .ccf-proof-icon{width:24px;height:24px;display:grid;place-items:center;border:1px solid rgba(0,220,255,.2);border-radius:8px;color:#00dfe5}
      #${PORTAL_ID} .ccf-hero-visual{position:relative;min-width:0;transform:translateZ(0)}
      #${PORTAL_ID} .ccf-main-shot{
        width:100%;display:block;border-radius:17px;border:1px solid rgba(255,255,255,.13);
        box-shadow:0 35px 70px rgba(0,0,0,.46),0 0 45px rgba(0,220,255,.07);
        transform:perspective(1200px) rotateY(-3deg);transition:transform .5s
      }
      #${PORTAL_ID} .ccf-main-shot:hover{transform:perspective(1200px) rotateY(0) translateY(-3px)}
      #${PORTAL_ID} .ccf-phone-shot{
        position:absolute;width:17%;min-width:112px;right:0;bottom:-20px;border-radius:20px;
        border:2px solid #273440;box-shadow:0 20px 40px rgba(0,0,0,.55);
        animation:ccfFloat 5s ease-in-out infinite
      }
      #${PORTAL_ID} .ccf-section{padding:42px 0}
      #${PORTAL_ID} .ccf-section-head{display:flex;justify-content:space-between;align-items:end;gap:20px}
      #${PORTAL_ID} h2{margin:8px 0 7px;font-size:32px;line-height:1.03;letter-spacing:-.045em}
      #${PORTAL_ID} .ccf-muted{margin:0;color:#8298ad;font-size:11px;line-height:1.55}
      #${PORTAL_ID} .ccf-link{border:0;background:none;color:#36e2dc;font-size:9px;font-weight:850;cursor:pointer}

      #${PORTAL_ID} .ccf-modules{display:grid;grid-template-columns:repeat(6,1fr);gap:9px;margin-top:21px}
      #${PORTAL_ID} .ccf-module{
        overflow:hidden;border-radius:14px;border:1px solid rgba(255,255,255,.09);
        background:rgba(255,255,255,.025);cursor:pointer;transition:.28s
      }
      #${PORTAL_ID} .ccf-module:hover{transform:translateY(-6px);border-color:rgba(0,220,255,.35);box-shadow:0 18px 38px rgba(0,0,0,.25)}
      #${PORTAL_ID} .ccf-module img{width:100%;height:113px;display:block;object-fit:cover;object-position:top}
      #${PORTAL_ID} .ccf-module-info{padding:9px 10px 12px}
      #${PORTAL_ID} .ccf-module-info b{font-size:11px}
      #${PORTAL_ID} .ccf-module-info p{margin:4px 0 0;color:#8499ad;font-size:7.8px;line-height:1.45}

      #${PORTAL_ID} .ccf-control{
        display:grid;grid-template-columns:1fr 1fr;gap:28px;align-items:center;
        padding:22px;border:1px solid rgba(0,220,255,.13);border-radius:19px;
        background:radial-gradient(circle at 0 0,rgba(0,220,255,.1),transparent 42%),rgba(255,255,255,.018)
      }
      #${PORTAL_ID} .ccf-control h2{font-size:31px}
      #${PORTAL_ID} .ccf-control-shot{width:100%;display:block;border-radius:12px;border:1px solid rgba(255,255,255,.1)}
      #${PORTAL_ID} .ccf-trust{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-top:16px}
      #${PORTAL_ID} .ccf-trust div{display:flex;align-items:center;gap:7px;color:#c2d2df;font-size:8px}
      #${PORTAL_ID} .ccf-trust i{width:24px;height:24px;display:grid;place-items:center;border-radius:7px;color:#00dfe5;border:1px solid rgba(0,220,255,.17)}

      #${PORTAL_ID} .ccf-audience{display:grid;grid-template-columns:repeat(5,1fr);gap:9px;margin-top:20px}
      #${PORTAL_ID} .ccf-person{
        position:relative;height:158px;overflow:hidden;border-radius:13px;border:1px solid rgba(255,255,255,.1);
        cursor:pointer;transition:.25s;background:#07131f
      }
      #${PORTAL_ID} .ccf-person:hover{transform:translateY(-5px);border-color:rgba(0,220,255,.35)}
      #${PORTAL_ID} .ccf-person img{width:100%;height:100%;object-fit:cover;object-position:top}
      #${PORTAL_ID} .ccf-person::after{content:"";position:absolute;inset:35% 0 0;background:linear-gradient(transparent,rgba(2,8,16,.95))}
      #${PORTAL_ID} .ccf-person-info{position:absolute;z-index:2;left:10px;right:10px;bottom:9px}
      #${PORTAL_ID} .ccf-person-info b{font-size:9px}
      #${PORTAL_ID} .ccf-person-info span{display:block;margin-top:3px;color:#a7b9c7;font-size:6.7px;line-height:1.35}

      #${PORTAL_ID} .ccf-faq{display:grid;grid-template-columns:.82fr 1.18fr;gap:35px}
      #${PORTAL_ID} .ccf-faq-list{border-top:1px solid rgba(255,255,255,.09)}
      #${PORTAL_ID} .ccf-faq-item{border-bottom:1px solid rgba(255,255,255,.09)}
      #${PORTAL_ID} .ccf-faq-btn{width:100%;min-height:47px;padding:0;border:0;background:none;color:#e9f5fb;display:flex;justify-content:space-between;align-items:center;text-align:left;cursor:pointer;font-size:9px;font-weight:800}
      #${PORTAL_ID} .ccf-plus{width:22px;height:22px;display:grid;place-items:center;border:1px solid rgba(255,255,255,.1);border-radius:6px;color:#45e3e0;transition:.2s}
      #${PORTAL_ID} .ccf-faq-answer{max-height:0;overflow:hidden;color:#8196a9;font-size:8px;line-height:1.6;transition:.3s}
      #${PORTAL_ID} .ccf-faq-item.open .ccf-faq-answer{max-height:120px;padding:0 30px 12px 0}
      #${PORTAL_ID} .ccf-faq-item.open .ccf-plus{transform:rotate(45deg)}

      #${PORTAL_ID} .ccf-final{
        display:flex;align-items:center;justify-content:space-between;gap:20px;padding:22px;border-radius:18px;
        border:1px solid rgba(0,220,255,.14);background:linear-gradient(135deg,rgba(0,91,131,.24),rgba(255,255,255,.02))
      }
      #${PORTAL_ID} .ccf-final h2{font-size:25px}
      #${PORTAL_ID} .ccf-footer{padding:20px 0 32px;border-top:1px solid rgba(255,255,255,.07);color:#6e8398;font-size:7.5px}
      #${PORTAL_ID} .ccf-footer-inner{display:flex;justify-content:space-between;gap:20px}
      #${PORTAL_ID} .ccf-reveal{opacity:0;transform:translateY(20px);transition:.7s}
      #${PORTAL_ID} .ccf-reveal.visible{opacity:1;transform:none}

      @keyframes ccfFloat{0%,100%{transform:translateY(0) rotate(1deg)}50%{transform:translateY(-8px) rotate(1deg)}}

      @media(max-width:950px){
        #${PORTAL_ID} .ccf-links{display:none}
        #${PORTAL_ID} .ccf-nav-inner{justify-content:space-between}
        #${PORTAL_ID} .ccf-hero{grid-template-columns:1fr;padding-top:38px}
        #${PORTAL_ID} .ccf-hero-copy{max-width:700px}
        #${PORTAL_ID} .ccf-modules{grid-template-columns:repeat(3,1fr)}
        #${PORTAL_ID} .ccf-control{grid-template-columns:1fr}
        #${PORTAL_ID} .ccf-faq{grid-template-columns:1fr}
      }
      @media(max-width:620px){
        #${PORTAL_ID} .ccf-wrap,#${PORTAL_ID} .ccf-nav-inner{width:calc(100% - 24px)}
        #${PORTAL_ID} .ccf-nav-inner{min-height:58px}
        #${PORTAL_ID} .ccf-logo{width:35px;height:35px}
        #${PORTAL_ID} .ccf-brand b{font-size:10px}
        #${PORTAL_ID} .ccf-brand small{font-size:5.5px}
        #${PORTAL_ID} .ccf-actions .login{display:none}
        #${PORTAL_ID} .ccf-menu-btn{display:grid}
        #${PORTAL_ID} .ccf-hero{padding:34px 0 42px;gap:25px}
        #${PORTAL_ID} .ccf-hero h1{font-size:clamp(39px,11vw,53px)}
        #${PORTAL_ID} .ccf-hero p{font-size:12.5px}
        #${PORTAL_ID} .ccf-cta{display:grid;grid-template-columns:1fr}
        #${PORTAL_ID} .ccf-cta .ccf-btn{width:100%}
        #${PORTAL_ID} .ccf-proof{grid-template-columns:1fr 1fr}
        #${PORTAL_ID} .ccf-main-shot{transform:none;border-radius:14px}
        #${PORTAL_ID} .ccf-phone-shot{width:28%;min-width:92px;right:-3px;bottom:-13px}
        #${PORTAL_ID} .ccf-section{padding:35px 0}
        #${PORTAL_ID} h2{font-size:28px}
        #${PORTAL_ID} .ccf-section-head{align-items:flex-start;flex-direction:column}
        #${PORTAL_ID} .ccf-modules{display:flex;overflow-x:auto;gap:8px;padding-bottom:8px;margin-right:-12px;scroll-snap-type:x mandatory}
        #${PORTAL_ID} .ccf-module{flex:0 0 205px;scroll-snap-align:start}
        #${PORTAL_ID} .ccf-control{padding:17px;border-radius:16px}
        #${PORTAL_ID} .ccf-control h2{font-size:28px}
        #${PORTAL_ID} .ccf-trust{grid-template-columns:1fr}
        #${PORTAL_ID} .ccf-audience{display:flex;overflow-x:auto;gap:8px;padding-bottom:8px;margin-right:-12px;scroll-snap-type:x mandatory}
        #${PORTAL_ID} .ccf-person{flex:0 0 166px;height:190px;scroll-snap-align:start}
        #${PORTAL_ID} .ccf-final{display:grid}
        #${PORTAL_ID} .ccf-final .ccf-btn{width:100%}
        #${PORTAL_ID} .ccf-footer-inner{display:block}
        #${PORTAL_ID} .ccf-footer-inner>div+div{margin-top:9px}
      }
      @media(prefers-reduced-motion:reduce){
        #${PORTAL_ID},#${PORTAL_ID} *{scroll-behavior:auto!important;animation:none!important;transition:none!important}
        #${PORTAL_ID} .ccf-reveal{opacity:1;transform:none}
      }
    `;
    document.head.appendChild(style);
  }

  function portalHTML() {
    const moduleData = [
      ["resumen","Resumen","Panel financiero con tu situación actual, ingresos, gastos y proyecciones."],
      ["calendario","Calendario","Visualiza tus compromisos, pagos y eventos en un solo lugar."],
      ["movimientos","Movimientos","Registra tus ingresos y gastos de forma simple y ordenada."],
      ["presupuesto","Presupuesto","Define límites, controla tus gastos y visualiza tu progreso."],
      ["deudas","Deudas","Gestiona deudas, cuotas, vencimientos y pagos."],
      ["planificacion","Planificación","Anticipa tu futuro financiero con escenarios de liquidez."]
    ];
    const people = [
      ["emprendedores","Emprendedores","Controla tus ingresos, costos y evolución de tu actividad."],
      ["empresarios","Empresarios","Toma decisiones con información financiera organizada."],
      ["independientes","Independientes","Gestiona tu actividad, ingresos y gastos."],
      ["duenos","Dueños de negocio","Organiza ventas, compras, deudas y ganancias."],
      ["hogar","Amas de casa","Lleva el control del hogar y planifica tu presupuesto."]
    ];

    return `
      <div id="${PORTAL_ID}">
        <div class="ccf-progress"></div>
        <header class="ccf-nav">
          <div class="ccf-nav-inner">
            <div class="ccf-brand">
              <div class="ccf-logo">CCF</div>
              <div><b>CONTROL FINANCIERO</b><small>CENTRO DE CONTROL FINANCIERO</small></div>
            </div>
            <nav class="ccf-links">
              <button class="active" data-go="inicio">Inicio</button>
              <button data-go="funcionalidades">Funcionalidades</button>
              <button data-go="precios">Precios</button>
              <button data-go="faq">Preguntas Frecuentes</button>
              <button data-go="contacto">Contacto</button>
            </nav>
            <div class="ccf-actions">
              <button class="ccf-btn login" data-auth="login">Ingresar</button>
              <button class="ccf-btn primary" data-auth="register">Comenzar ahora&nbsp; →</button>
              <button class="ccf-btn ccf-menu-btn" style="display:none" aria-label="Menú">☰</button>
            </div>
          </div>
        </header>

        <main>
          <section class="ccf-wrap ccf-hero" id="inicio">
            <div class="ccf-hero-copy">
              <span class="ccf-eyebrow">CONTROL · LIQUIDEZ · PROYECCIÓN</span>
              <h1>Convierte tus finanzas en un <span class="ccf-grad">sistema de control.</span></h1>
              <p>Registra movimientos, organiza compromisos, controla deudas, proyecta tu liquidez y toma decisiones con una visión financiera integrada desde un solo lugar.</p>
              <div class="ccf-cta">
                <button class="ccf-btn primary" data-auth="register">Comenzar ahora&nbsp; →</button>
                <button class="ccf-btn" data-go="funcionalidades">◉ &nbsp;Ver demostración</button>
              </div>
              <div class="ccf-proof">
                <div class="ccf-proof-item"><i class="ccf-proof-icon">✓</i><span>Seguro<br>y privado</span></div>
                <div class="ccf-proof-item"><i class="ccf-proof-icon">▣</i><span>Acceso en todos<br>tus dispositivos</span></div>
                <div class="ccf-proof-item"><i class="ccf-proof-icon">☁</i><span>Tus datos<br>siempre contigo</span></div>
                <div class="ccf-proof-item"><i class="ccf-proof-icon">ϟ</i><span>Interfaz rápida<br>y moderna</span></div>
              </div>
            </div>
            <div class="ccf-hero-visual">
              <img class="ccf-main-shot" src="${ASSETS.heroDesktop}" alt="Control Financiero — resumen financiero">
              <img class="ccf-phone-shot" src="${ASSETS.heroMobile}" alt="Control Financiero — versión móvil">
            </div>
          </section>

          <section class="ccf-wrap ccf-section ccf-reveal" id="funcionalidades">
            <div class="ccf-section-head">
              <div><span class="ccf-eyebrow">TODO EN UN MISMO SISTEMA</span><h2>Módulos principales</h2><p class="ccf-muted">Herramientas simples y poderosas, diseñadas para acompañarte en cada etapa.</p></div>
              <button class="ccf-link" data-go="contacto">Ver todas las funcionalidades →</button>
            </div>
            <div class="ccf-modules">
              ${moduleData.map(([key,title,desc])=>`
                <article class="ccf-module" data-module="${key}">
                  <img src="${ASSETS.modules[key]}" alt="${title}">
                  <div class="ccf-module-info"><b>${title}</b><p>${desc}</p></div>
                </article>
              `).join("")}
            </div>
          </section>

          <section class="ccf-wrap ccf-section ccf-reveal">
            <div class="ccf-control">
              <div>
                <span class="ccf-eyebrow">DISEÑADO PARA TU DÍA A DÍA</span>
                <h2>Tu información. Tu planificación. Tu control.</h2>
                <p class="ccf-muted">Accede desde tu celular, tablet o computador con una experiencia rápida, visual e intuitiva.</p>
                <div class="ccf-trust">
                  <div><i>▥</i>Información clara en tiempo real</div>
                  <div><i>◉</i>Decisiones basadas en tus datos</div>
                  <div><i>▣</i>Acceso desde cualquier dispositivo</div>
                  <div><i>ϟ</i>Interfaz rápida y moderna</div>
                </div>
              </div>
              <div><img class="ccf-control-shot" src="${ASSETS.heroDesktop}" alt="Panel real de Control Financiero"></div>
            </div>
          </section>

          <section class="ccf-wrap ccf-section ccf-reveal" id="precios">
            <span class="ccf-eyebrow">PENSADO PARA DISTINTAS REALIDADES</span>
            <h2>¿Para quién es Control Financiero?</h2>
            <p class="ccf-muted">Una herramienta flexible, pensada para distintas realidades.</p>
            <div class="ccf-audience">
              ${people.map(([key,title,desc])=>`
                <article class="ccf-person">
                  <img src="${ASSETS.audience[key]}" alt="${title}">
                  <div class="ccf-person-info"><b>${title}</b><span>${desc}</span></div>
                </article>
              `).join("")}
            </div>
          </section>

          <section class="ccf-wrap ccf-section ccf-reveal" id="faq">
            <div class="ccf-faq">
              <div>
                <span class="ccf-eyebrow">PREGUNTAS FRECUENTES</span>
                <h2>¿Tienes dudas? Aquí te ayudamos.</h2>
                <p class="ccf-muted">Resolvemos las preguntas más comunes sobre Control Financiero.</p>
              </div>
              <div class="ccf-faq-list">
                ${[
                  ["¿Es gratuito el sistema?","Las condiciones comerciales definitivas se informarán antes de incorporar cualquier modalidad de pago."],
                  ["¿Mis datos están seguros?","El sistema mantiene su autenticación y almacenamiento mediante la infraestructura actualmente integrada."],
                  ["¿Puedo usarlo en mi celular?","Sí. Esta versión incorpora una adaptación responsive específica para dispositivos móviles."],
                  ["¿Necesito conocimientos financieros?","No. La interfaz está pensada para organizar información financiera cotidiana de manera visual."],
                  ["¿Puedo acceder desde distintos dispositivos?","Sí. La interfaz se adapta a escritorio, tablet y móvil."]
                ].map(([q,a])=>`
                  <div class="ccf-faq-item">
                    <button class="ccf-faq-btn" aria-expanded="false"><span>${q}</span><i class="ccf-plus">+</i></button>
                    <div class="ccf-faq-answer">${a}</div>
                  </div>
                `).join("")}
              </div>
            </div>
          </section>

          <section class="ccf-wrap ccf-section ccf-reveal" id="contacto">
            <div class="ccf-final">
              <div><span class="ccf-eyebrow">EMPIEZA HOY</span><h2>Comienza hoy a controlar tus finanzas.</h2><p class="ccf-muted">Es rápido, seguro y pensado para ayudarte a alcanzar tus objetivos.</p></div>
              <button class="ccf-btn primary" data-auth="register">Crear mi cuenta gratis&nbsp; →</button>
            </div>
          </section>
        </main>

        <footer class="ccf-footer">
          <div class="ccf-wrap ccf-footer-inner">
            <div><b>SOMOS SOFTWARE</b><br>Innovación Digital</div>
            <div>Tecnología confiable &nbsp; · &nbsp; Desarrollo chileno &nbsp; · &nbsp; Soporte continuo &nbsp; · &nbsp; En constante evolución</div>
          </div>
        </footer>
      </div>
    `;
  }

  function scrollTo(id) {
    const root = document.getElementById(PORTAL_ID);
    const el = root && root.querySelector("#" + id);
    if (!el) return;
    root.scrollTo({
      top: Math.max(0, el.offsetTop - 68),
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"
    });
  }

  function initNavigation() {
    const root = document.getElementById(PORTAL_ID);
    if (!root) return;

    root.querySelectorAll("[data-go]").forEach(btn => {
      btn.addEventListener("click", () => scrollTo(btn.dataset.go));
    });

    const progress = root.querySelector(".ccf-progress");
    root.addEventListener("scroll", () => {
      const max = root.scrollHeight - root.clientHeight;
      progress.style.width = max > 0 ? (root.scrollTop / max * 100) + "%" : "0%";
    }, {passive:true});

    if ("IntersectionObserver" in window) {
      const sections = ["inicio","funcionalidades","precios","faq","contacto"]
        .map(id => root.querySelector("#"+id)).filter(Boolean);

      const obs = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          root.querySelectorAll(".ccf-links button").forEach(b =>
            b.classList.toggle("active", b.dataset.go === entry.target.id)
          );
        });
      }, {root, threshold:.2, rootMargin:"-15% 0px -60% 0px"});

      sections.forEach(s => obs.observe(s));
    }
  }

  function initReveal() {
    const root = document.getElementById(PORTAL_ID);
    const elements = root.querySelectorAll(".ccf-reveal");

    if (!("IntersectionObserver" in window)) {
      elements.forEach(el => el.classList.add("visible"));
      return;
    }

    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          obs.unobserve(entry.target);
        }
      });
    }, {root, threshold:.12});

    elements.forEach(el => obs.observe(el));
  }

  function initFAQ() {
    const root = document.getElementById(PORTAL_ID);
    root.querySelectorAll(".ccf-faq-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const item = btn.closest(".ccf-faq-item");
        const open = item.classList.contains("open");

        root.querySelectorAll(".ccf-faq-item").forEach(x => {
          x.classList.remove("open");
          x.querySelector(".ccf-faq-btn")?.setAttribute("aria-expanded","false");
        });

        if (!open) {
          item.classList.add("open");
          btn.setAttribute("aria-expanded","true");
        }
      });
    });
  }

  function initMobileMenu() {
    const root = document.getElementById(PORTAL_ID);
    const menuButton = root.querySelector(".ccf-menu-btn");
    if (!menuButton) return;

    menuButton.addEventListener("click", () => {
      let menu = root.querySelector(".ccf-mobile-menu");

      if (menu) {
        menu.remove();
        return;
      }

      menu = document.createElement("div");
      menu.className = "ccf-mobile-menu";
      menu.style.cssText =
        "position:fixed;top:58px;left:12px;right:12px;z-index:100;display:grid;gap:5px;padding:8px;" +
        "background:rgba(2,9,18,.97);border:1px solid rgba(255,255,255,.1);border-radius:14px;" +
        "box-shadow:0 25px 60px rgba(0,0,0,.5);backdrop-filter:blur(18px)";

      ["inicio","funcionalidades","precios","faq","contacto"].forEach((id,i) => {
        const label = ["Inicio","Funcionalidades","Precios","Preguntas frecuentes","Contacto"][i];
        const b = document.createElement("button");
        b.textContent = label;
        b.style.cssText =
          "border:0;border-radius:9px;padding:12px;background:rgba(255,255,255,.035);color:#eaf5fc;" +
          "text-align:left;font-size:10px;font-weight:800";
        b.onclick = () => { scrollTo(id); menu.remove(); };
        menu.appendChild(b);
      });

      root.appendChild(menu);
    });
  }

  function initInteractions() {
    const root = document.getElementById(PORTAL_ID);

    root.querySelectorAll(".ccf-module").forEach(card => {
      card.addEventListener("pointermove", e => {
        if (window.innerWidth <= 950) return;
        const r = card.getBoundingClientRect();
        const x = (e.clientX-r.left)/r.width-.5;
        const y = (e.clientY-r.top)/r.height-.5;
        card.style.transform =
          `perspective(700px) rotateX(${(-y*3).toFixed(2)}deg) rotateY(${(x*4).toFixed(2)}deg) translateY(-5px)`;
      });
      card.addEventListener("pointerleave", () => card.style.transform = "");
    });

    root.querySelectorAll(".ccf-person").forEach(card => {
      card.addEventListener("click", () => {
        root.querySelectorAll(".ccf-person").forEach(x => x.style.borderColor = "");
        card.style.borderColor = "rgba(0,225,255,.65)";
        setTimeout(() => card.style.borderColor = "", 1000);
      });
    });
  }

  async function openExistingAuth(mode) {
    const selectors = [
      "#ccf-auth-gate",
      "#authGate",
      "#auth-modal",
      ".auth-gate",
      "[data-auth-gate]"
    ];

    for (let i=0; i<50; i++) {
      const gate = selectors.map(s => document.querySelector(s)).find(Boolean);

      if (gate) {
        document.getElementById(PORTAL_ID)?.remove();
        document.body.style.overflow = "";

        const pattern = mode === "register"
          ? /crear|registr|cuenta/i
          : /ingresar|iniciar|sesión|login|entrar/i;

        const button = [...gate.querySelectorAll("button")]
          .find(b => pattern.test((b.textContent || "").trim()));

        if (button) button.click();
        else gate.querySelector("input")?.focus();
        return;
      }

      const client =
        window.supabaseClient ||
        window.__B23273_CLIENT__ ||
        window.__B23270_CLIENT__ ||
        window.__B23269_CLIENT__;

      if (client?.auth) {
        try {
          const {data} = await client.auth.getSession();
          if (data?.session) {
            document.getElementById(PORTAL_ID)?.remove();
            document.body.style.overflow = "";
            return;
          }
        } catch (_) {}
      }

      await sleep(100);
    }

    alert("La autenticación todavía está cargando. Intenta nuevamente en unos segundos.");
  }

  function bindAuth() {
    const root = document.getElementById(PORTAL_ID);
    root.querySelectorAll("[data-auth]").forEach(btn => {
      btn.addEventListener("click", () => openExistingAuth(btn.dataset.auth));
    });
  }

  async function watchExistingSession() {
    for (let i=0; i<80; i++) {
      const client =
        window.supabaseClient ||
        window.__B23273_CLIENT__ ||
        window.__B23270_CLIENT__ ||
        window.__B23269_CLIENT__;

      if (client?.auth) {
        try {
          const {data} = await client.auth.getSession();
          if (data?.session) {
            document.getElementById(PORTAL_ID)?.remove();
            document.body.style.overflow = "";
          }
          client.auth.onAuthStateChange((_event, session) => {
            if (session) {
              document.getElementById(PORTAL_ID)?.remove();
              document.body.style.overflow = "";
            }
          });
        } catch (_) {}
        return;
      }
      await sleep(100);
    }
  }

  function boot() {
    injectStyles();

    if (!document.getElementById(PORTAL_ID)) {
      document.body.insertAdjacentHTML("afterbegin", portalHTML());
    }

    document.body.style.overflow = "hidden";

    initNavigation();
    initReveal();
    initFAQ();
    initMobileMenu();
    initInteractions();
    bindAuth();
    watchExistingSession();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, {once:true});
  } else {
    boot();
  }
})();
