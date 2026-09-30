/* CCF B230 — PORTAL PREMIUM / LANDING RESPONSIVE
   B230-PREMIUM-1.1 — HERO MOTION + CTA PULSE
   SOLO landing inicial. No autentica, no crea Supabase y no modifica index.html.
*/
(function(){
'use strict';
if(window.__CCF_B230_PREMIUM_11__)return;
window.__CCF_B230_PREMIUM_11__=true;

const ID='ccf-b230-final';
const $=(s,r=document)=>r.querySelector(s);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

function style(){
 if($('#ccf-b230-premium-style'))return;
 const s=document.createElement('style');
 s.id='ccf-b230-premium-style';
 s.textContent=`
#${ID}{position:fixed;inset:0;z-index:2147483647;overflow:auto;color:#edf6ff;
font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
background:radial-gradient(circle at 78% 8%,rgba(48,191,255,.22),transparent 30%),
radial-gradient(circle at 8% 45%,rgba(76,225,184,.11),transparent 28%),
linear-gradient(135deg,#040914,#071321 55%,#091b2d);-webkit-font-smoothing:antialiased}
#${ID} *{box-sizing:border-box}#${ID} button{font:inherit}
#${ID} .page{min-height:100%;position:relative}
#${ID} .wrap{width:min(1180px,calc(100% - 40px));margin:auto}
#${ID} .orb{position:absolute;width:280px;height:280px;border-radius:50%;filter:blur(70px);
opacity:.12;background:#35c7ff;pointer-events:none;animation:b230float 10s ease-in-out infinite}
#${ID} .orb.a{right:-90px;top:8%}#${ID} .orb.b{left:-120px;top:55%;background:#5be6b7;animation-delay:-4s}
#${ID} .nav{min-height:78px;display:flex;align-items:center;justify-content:space-between;gap:20px;
border-bottom:1px solid rgba(255,255,255,.08);position:sticky;top:0;z-index:20;
background:rgba(4,9,20,.72);backdrop-filter:blur(18px)}
#${ID} .brand{display:flex;align-items:center;gap:12px}.mark{width:42px;height:42px;border-radius:13px;
display:grid;place-items:center;font-size:13px;font-weight:950;color:#06111d;
background:linear-gradient(135deg,#54d7ae,#39b9ff);box-shadow:0 8px 28px rgba(48,190,232,.24)}
#${ID} .brand b{font-size:14px;letter-spacing:.08em}.brand small{display:block;margin-top:3px;
font-size:9px;letter-spacing:.1em;color:#8299af}
#${ID} .actions{display:flex;gap:10px;flex-wrap:wrap}
#${ID} .btn{min-height:44px;border:1px solid rgba(255,255,255,.14);border-radius:12px;padding:10px 17px;
cursor:pointer;color:#edf6ff;background:rgba(255,255,255,.055);font-weight:800;
transition:.2s ease;transition-property:transform,box-shadow,background,border-color}
#${ID} .btn:hover{transform:translateY(-2px);background:rgba(255,255,255,.09)}
#${ID} .btn:focus-visible{outline:3px solid rgba(70,202,255,.45);outline-offset:3px}
#${ID} .primary{color:#04111d;border-color:transparent;background:linear-gradient(135deg,#5be6b7,#39b9ff);
box-shadow:0 10px 30px rgba(45,190,220,.18)}#${ID} .primary:hover{box-shadow:0 14px 36px rgba(45,190,220,.3)}
#${ID} .hero{display:grid;grid-template-columns:1.08fr .92fr;gap:64px;align-items:center;padding:76px 0 68px}
#${ID} .kicker{display:inline-flex;align-items:center;gap:8px;padding:7px 10px;border-radius:999px;
border:1px solid rgba(80,210,255,.18);background:rgba(43,178,225,.07);color:#70d9ff;font-size:10px;
letter-spacing:.14em;font-weight:900}.kicker:before{content:"";width:7px;height:7px;border-radius:50%;
background:#55d8b1;box-shadow:0 0 0 5px rgba(85,216,177,.09)}
#${ID} h1{font-size:clamp(42px,6vw,78px);line-height:.96;letter-spacing:-.055em;margin:18px 0 22px}
#${ID} .grad{background:linear-gradient(110deg,#fff,#a9eaff 52%,#70e2bd);-webkit-background-clip:text;background-clip:text;color:transparent}
#${ID} .hero p{max-width:670px;color:#9db0c4;font-size:17px;line-height:1.72;margin:0}
#${ID} .heroCta{display:flex;gap:11px;flex-wrap:wrap;margin-top:28px}
#${ID} .proof{display:flex;gap:18px;flex-wrap:wrap;margin-top:26px;color:#7890a7;font-size:11px}
#${ID} .proof span{display:inline-flex;align-items:center;gap:7px}.proof i{width:7px;height:7px;border-radius:50%;
background:#55d8b1;display:block}
#${ID} .dash{border:1px solid rgba(255,255,255,.12);border-radius:25px;padding:15px;
background:linear-gradient(145deg,rgba(255,255,255,.09),rgba(255,255,255,.025));
box-shadow:0 32px 90px rgba(0,0,0,.38);transform:perspective(1100px) rotateY(-5deg) rotateX(2deg);
animation:b230in .8s ease both}.dashTop{display:flex;justify-content:space-between;padding:8px 8px 14px;
font-size:12px;font-weight:900}.live{font-size:9px;color:#6ee1be}.live:before{content:"●";margin-right:5px}
#${ID} .dashMain{border:1px solid rgba(255,255,255,.08);border-radius:18px;padding:18px;background:rgba(3,12,23,.72)}
#${ID} .label{font-size:9px;color:#7289a0;text-transform:uppercase;letter-spacing:.12em;font-weight:800}
#${ID} .balance{font-size:34px;font-weight:950;letter-spacing:-.04em;margin-top:6px}
#${ID} .positive{color:#64dfb8}.chart{height:88px;margin-top:16px}.chart svg{width:100%;height:100%}
#${ID} .metrics{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:10px}
#${ID} .metric{padding:11px;border:1px solid rgba(255,255,255,.07);border-radius:12px;background:rgba(255,255,255,.035)}
#${ID} .metric span{display:block;color:#71879e;font-size:8px}.metric b{display:block;margin-top:4px;font-size:13px}
#${ID} .miniGrid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px}
#${ID} .mini{border:1px solid rgba(255,255,255,.07);border-radius:12px;padding:12px;background:rgba(255,255,255,.025)}
#${ID} .mini small{color:#738aa0;font-size:8px}.mini strong{display:block;font-size:12px;margin-top:4px}
#${ID} .strip{margin:8px 0 40px;padding:22px;border-radius:19px;border:1px solid rgba(255,255,255,.08);
background:rgba(255,255,255,.035);display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
#${ID} .stripItem{display:flex;align-items:center;gap:12px}.stripDot{width:10px;height:10px;border-radius:50%;
background:#52d8b3;box-shadow:0 0 0 6px rgba(82,216,179,.08)}.stripItem strong{display:block;font-size:12px}
#${ID} .stripItem span{display:block;margin-top:2px;color:#778da4;font-size:9px}
#${ID} .section{padding:68px 0}.eyebrow{color:#64d7ff;font-size:10px;letter-spacing:.15em;font-weight:900}
#${ID} .section h2{font-size:clamp(28px,4vw,44px);line-height:1.05;letter-spacing:-.035em;margin:10px 0 13px}
#${ID} .sectionHead{max-width:720px}.sectionHead p{margin:0;color:#91a6bb;line-height:1.7;font-size:14px}
#${ID} .grid{display:grid;grid-template-columns:repeat(3,1fr);gap:13px;margin-top:30px}
#${ID} .feature{min-height:170px;padding:22px;border:1px solid rgba(255,255,255,.08);border-radius:18px;
background:linear-gradient(145deg,rgba(255,255,255,.055),rgba(255,255,255,.018));transition:.25s ease}
#${ID} .feature:hover{transform:translateY(-5px);border-color:rgba(83,210,255,.24)}
#${ID} .icon{width:38px;height:38px;border-radius:11px;display:grid;place-items:center;margin-bottom:18px;
color:#76defc;background:rgba(65,195,245,.09);border:1px solid rgba(65,195,245,.13);font-weight:900}
#${ID} .feature b{font-size:14px}.feature p{font-size:12px;color:#8197ad;line-height:1.6;margin:7px 0 0}
#${ID} .cta{padding:46px 30px;margin:20px 0 64px;text-align:center;border-radius:24px;
background:radial-gradient(circle at 50% 0,rgba(72,208,255,.14),transparent 48%),linear-gradient(135deg,rgba(36,145,218,.13),rgba(82,216,179,.07));
border:1px solid rgba(91,216,255,.14)}.cta h2{font-size:clamp(26px,4vw,40px);margin:0 0 10px}
#${ID} .cta p{max-width:620px;margin:0 auto 23px;color:#91a7bb;line-height:1.6;font-size:13px}
#${ID} .footer{padding:25px 0 36px;color:#6e849a;font-size:10px;border-top:1px solid rgba(255,255,255,.08);text-align:center}
#${ID} .footer span{display:block;margin-top:5px}

#ccf-b230-final .heroTitle{text-wrap:balance}
#ccf-b230-final .heroWord{
  display:inline-block;
  opacity:0;
  filter:blur(12px);
  transform:translateY(18px);
  will-change:opacity,filter,transform;
  transition:
    opacity .62s cubic-bezier(.2,.7,.2,1),
    filter .62s cubic-bezier(.2,.7,.2,1),
    transform .62s cubic-bezier(.2,.7,.2,1);
}
#ccf-b230-final .heroWord.is-visible{
  opacity:1;
  filter:blur(0);
  transform:translateY(0);
}
#ccf-b230-final .heroWord.heroGrad{
  background:linear-gradient(110deg,#fff,#a9eaff 52%,#70e2bd);
  -webkit-background-clip:text;
  background-clip:text;
  color:transparent;
}
#ccf-b230-final .heroWord.heroPunctuation{margin-left:.08em}
#ccf-b230-final .heroCta .primary[data-b230-open="login"]{
  position:relative;
  animation:b230CtaPulse 2.8s ease-in-out infinite;
  transform-origin:center;
}
#ccf-b230-final .heroCta .primary[data-b230-open="login"]:hover{
  animation-play-state:paused;
  transform:scale(1.045) translateY(-2px);
}
#ccf-b230-final .heroCta .primary[data-b230-open="login"]::after{
  content:"";
  position:absolute;
  inset:-2px;
  border-radius:inherit;
  pointer-events:none;
  box-shadow:0 0 0 0 rgba(70,211,255,0);
  animation:b230CtaGlow 2.8s ease-in-out infinite;
}
@keyframes b230CtaPulse{
  0%,100%{transform:scale(1)}
  50%{transform:scale(1.035)}
}
@keyframes b230CtaGlow{
  0%,100%{box-shadow:0 0 0 0 rgba(70,211,255,0)}
  50%{box-shadow:0 0 0 7px rgba(70,211,255,.08),0 16px 42px rgba(45,190,220,.34)}
}
@media (prefers-reduced-motion:reduce){
  #ccf-b230-final .heroWord{
    opacity:1!important;
    filter:none!important;
    transform:none!important;
    transition:none!important;
  }
  #ccf-b230-final .heroCta .primary[data-b230-open="login"],
  #ccf-b230-final .heroCta .primary[data-b230-open="login"]::after{
    animation:none!important;
  }
}

@keyframes b230in{from{opacity:0;transform:perspective(1100px) rotateY(-10deg) translateY(18px)}to{opacity:1;transform:perspective(1100px) rotateY(-5deg) translateY(0)}}
@keyframes b230float{0%,100%{transform:translateY(0)}50%{transform:translateY(-24px)}}
@media(max-width:900px){#${ID} .hero{grid-template-columns:1fr;gap:36px;padding:55px 0 45px}#${ID} .dash{max-width:680px;width:100%;margin:auto;transform:none}#${ID} .grid{grid-template-columns:1fr 1fr}#${ID} .strip{grid-template-columns:1fr}}
@media(max-width:640px){#${ID} .wrap{width:min(100% - 22px,1180px)}#${ID} .nav{min-height:68px;padding:10px 0}
#${ID} .mark{width:38px;height:38px}#${ID} .brand b{font-size:12px}.brand small{font-size:8px}
#${ID} .nav .actions .btn:first-child{display:none}#${ID} .nav .actions .btn{min-height:40px;padding:9px 12px;font-size:11px}
#${ID} .hero{padding:40px 0 35px;gap:29px}#${ID} h1{font-size:clamp(40px,12vw,56px)}
#${ID} .hero p{font-size:14px}.heroCta{display:grid;grid-template-columns:1fr;margin-top:22px}
#${ID} .heroCta .btn{width:100%}.proof{gap:10px}.dash{border-radius:20px;padding:10px}.dashMain{padding:15px}
#${ID} .balance{font-size:29px}.metrics{grid-template-columns:1fr 1fr!important}.miniGrid{grid-template-columns:1fr}
#${ID} .section{padding:48px 0}.grid{grid-template-columns:1fr;gap:10px}.feature{min-height:auto;padding:19px}
#${ID} .cta{padding:34px 18px;margin-bottom:45px}.cta .btn{width:100%}}
@media(prefers-reduced-motion:reduce){#${ID} *,#${ID} *:before,#${ID} *:after{animation:none!important;transition:none!important}}
`;
 document.head.appendChild(s);
}

function html(){
 return `<div id="${ID}" role="dialog" aria-label="Portal de acceso al Centro de Control Financiero">
 <div class="page"><div class="orb a"></div><div class="orb b"></div><div class="wrap">
 <nav class="nav"><div class="brand"><div class="mark">CCF</div><div><b>CONTROL FINANCIERO</b><small>CENTRO DE CONTROL FINANCIERO</small></div></div>
 <div class="actions"><button class="btn" data-b230-open="register">Crear cuenta</button><button class="btn primary" data-b230-open="login">Iniciar sesión</button></div></nav>
 <main>
 <section class="hero"><div><span class="kicker">CONTROL · LIQUIDEZ · PROYECCIÓN</span>
 <h1 class="heroTitle" aria-label="Convierte tus finanzas en un sistema de control.">
  <span class="heroWord">Convierte</span>
  <span class="heroWord">tus</span>
  <span class="heroWord">finanzas</span>
  <span class="heroWord">en</span>
  <span class="heroWord">un</span>
  <span class="heroWord heroGrad">sistema</span>
  <span class="heroWord heroGrad">de</span>
  <span class="heroWord heroGrad heroPunctuation">control.</span>
</h1>
 <p>Registra movimientos, organiza compromisos, controla deudas, proyecta tu liquidez y toma decisiones con una visión financiera integrada desde un solo lugar.</p>
 <div class="heroCta"><button class="btn primary" data-b230-open="login">Entrar al sistema →</button><button class="btn" data-b230-open="register">Crear mi cuenta</button></div>
 <div class="proof"><span><i></i>Datos centralizados</span><span><i></i>Proyección financiera</span><span><i></i>Experiencia móvil</span></div></div>
 <div class="dash"><div class="dashTop"><span>Centro de Control</span><span class="live">Vista demostrativa</span></div>
 <div class="dashMain"><span class="label">Saldo disponible</span><div class="balance">$842.500</div>
 <div class="chart"><svg viewBox="0 0 500 100" preserveAspectRatio="none"><defs><linearGradient id="b230Area" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5bd8b4" stop-opacity=".22"/><stop offset="1" stop-color="#5bd8b4" stop-opacity="0"/></linearGradient></defs>
 <path fill="url(#b230Area)" d="M0 82C45 74 62 70 90 73S130 48 164 58S210 30 245 47S290 44 325 29S370 41 404 22S455 31 500 12V100H0Z"/>
 <path fill="none" stroke="#5bd8b4" stroke-width="3" stroke-linecap="round" d="M0 82C45 74 62 70 90 73S130 48 164 58S210 30 245 47S290 44 325 29S370 41 404 22S455 31 500 12"/></svg></div>
 <div class="metrics"><div class="metric"><span>Ingresos</span><b class="positive">$1.320.000</b></div><div class="metric"><span>Egresos</span><b>$1.067.110</b></div><div class="metric"><span>Proyección</span><b class="positive">$252.890</b></div></div>
 <div class="miniGrid"><div class="mini"><small>PRÓXIMA OBLIGACIÓN</small><strong>$120.000</strong></div><div class="mini"><small>ESTADO DE LIQUIDEZ</small><strong class="positive">Controlado</strong></div></div></div></div></section>
 <section class="strip"><div class="stripItem"><i class="stripDot"></i><div><strong>Registro</strong><span>Información financiera ordenada</span></div></div><div class="stripItem"><i class="stripDot"></i><div><strong>Análisis</strong><span>Lectura de liquidez y obligaciones</span></div></div><div class="stripItem"><i class="stripDot"></i><div><strong>Anticipación</strong><span>Proyección para decidir con datos</span></div></div></section>
 <section class="section"><div class="sectionHead"><span class="eyebrow">TODO EN UN MISMO SISTEMA</span><h2>Una visión financiera conectada.</h2><p>Cada módulo forma parte de una estructura común para pasar del registro diario a la planificación y la proyección sin perder trazabilidad.</p></div>
 <div class="grid">
 <article class="feature"><div class="icon">↕</div><b>Movimientos</b><p>Registra ingresos y gastos y conserva un historial ordenado de tu actividad financiera.</p></article>
 <article class="feature"><div class="icon">▣</div><b>Deudas</b><p>Controla obligaciones, cuotas, vencimientos, abonos y saldos pendientes.</p></article>
 <article class="feature"><div class="icon">◒</div><b>Presupuesto</b><p>Compara lo planificado con lo ejecutado y visualiza desviaciones.</p></article>
 <article class="feature"><div class="icon">◈</div><b>Proyección</b><p>Integra flujos futuros para anticipar necesidades y escenarios de liquidez.</p></article>
 <article class="feature"><div class="icon">▦</div><b>Calendario</b><p>Ordena ingresos, gastos, compromisos y obligaciones por fecha.</p></article>
 <article class="feature"><div class="icon">◎</div><b>Dashboard ejecutivo</b><p>Obtén una lectura consolidada de tu situación financiera y sus principales señales.</p></article>
 </div></section>
 <section class="cta"><span class="eyebrow">CENTRO DE CONTROL FINANCIERO</span><h2>Tu información. Tu planificación. Tu control.</h2><p>Ingresa al sistema para comenzar a gestionar tu estructura financiera con una experiencia diseñada para escritorio y móvil.</p><button class="btn primary" data-b230-open="login">Iniciar sesión →</button></section>
 </main><footer class="footer"><strong>CCF · Centro de Control Financiero</strong><span>Producto desarrollado por Somos Software · Innovación Digital</span></footer>
 </div></div></div>`;
}

function removePortal(){const p=document.getElementById(ID);if(p)p.remove();document.body.classList.remove('b230-portal-active')}

function animatePremiumHero(){
  const root=document.getElementById(ID);
  if(!root)return;
  const words=[...root.querySelectorAll('.heroWord')];
  if(!words.length)return;

  const reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduce){words.forEach(w=>w.classList.add('is-visible'));return}

  words.forEach(w=>w.classList.remove('is-visible'));

  // Construcción progresiva tipo "word reveal":
  // cada palabra pasa de desenfoque + desplazamiento a foco,
  // reproduciendo el lenguaje visual de la referencia.
  words.forEach((word,index)=>{
    window.setTimeout(()=>word.classList.add('is-visible'),180 + index*230);
  });
}

function findAuthGate(){return document.getElementById('ccf-auth-gate')}
async function waitForGate(timeout=5000){for(let i=0;i<timeout/100;i++){const g=findAuthGate();if(g)return g;await sleep(100)}return null}

async function openExistingAuth(mode){
 const gate=await waitForGate();
 if(!gate){
  try{const c=window.supabaseClient||window.__B23273_CLIENT__||window.__B23270_CLIENT__||window.__B23269_CLIENT__;
   const session=c?.auth?(await c.auth.getSession()).data?.session:null;if(session){removePortal();return}}catch(_){}
  alert('La autenticación todavía está cargando. Intenta nuevamente en unos segundos.');return;
 }
 removePortal();
 const re=mode==='register'?/crear|registr/i:/iniciar|sesión|login|ingresar|entrar/i;
 const target=[...gate.querySelectorAll('button')].find(b=>re.test((b.textContent||'').trim()));
 if(target)target.click();else gate.querySelector('input')?.focus();
}
function bind(){const p=document.getElementById(ID);if(!p)return;p.querySelectorAll('[data-b230-open]').forEach(b=>b.addEventListener('click',()=>openExistingAuth(b.dataset.b230Open)))}
async function watchAuth(){
 for(let i=0;i<80;i++){
  const c=window.supabaseClient||window.__B23273_CLIENT__||window.__B23270_CLIENT__||window.__B23269_CLIENT__;
  if(c?.auth){try{const {data}=await c.auth.getSession();if(data?.session){removePortal();return}
   c.auth.onAuthStateChange((_e,session)=>{if(session)removePortal()})}catch(_){}return}
  await sleep(100);
 }
}
function boot(){style();if(!document.getElementById(ID))document.body.insertAdjacentHTML('afterbegin',html());animatePremiumHero();bind();watchAuth()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();