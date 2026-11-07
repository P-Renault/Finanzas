/* CCF B230 — PORTAL PREMIUM / LANDING RESPONSIVE
   B230-PREMIUM-1.2 — HERO + INSTALACIÓN PWA + PRECIOS
   SOLO landing inicial. No autentica, no crea Supabase y no modifica index.html.
*/
(function(){
'use strict';
if(window.__CCF_B230_PREMIUM_30__)return;
window.__CCF_B230_PREMIUM_30__=true;

const ID='ccf-b230-final';
const $=(s,r=document)=>r.querySelector(s);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const IMG_HERO_LAPTOP='./B230-PORTAL-ACCESO-FINAL-PREMIUM-1.1-assets/hero-laptop.jpg';
const IMG_HERO_PHONE='./B230-PORTAL-ACCESO-FINAL-PREMIUM-1.1-assets/hero-phone.jpg';
const IMG_HERO_COMPOSITION='./B230-PORTAL-ACCESO-FINAL-PREMIUM-1.1-assets/hero-reference-devices.jpg';
const IMG_HERO_MOBILE='./B230-PORTAL-ACCESO-FINAL-PREMIUM-1.1-assets/hero-reference-phone.jpg';
const IMG_SCREEN_DESKTOP='./B230-PORTAL-ACCESO-FINAL-PREMIUM-1.1-assets/hero-screen-desktop.jpg';
const IMG_SCREEN_MOBILE='./B230-PORTAL-ACCESO-FINAL-PREMIUM-1.1-assets/beneficios-control-financiero-oficina.png';
const IMG_AUDIENCES='./B230-PORTAL-ACCESO-FINAL-PREMIUM-1.1-assets/audiences.jpg';
const IMG_RESUMEN='./B230-PORTAL-ACCESO-FINAL-PREMIUM-1.1-assets/01-resumen.png';
const IMG_CALENDARIO='./B230-PORTAL-ACCESO-FINAL-PREMIUM-1.1-assets/02-calendario.png';
const IMG_MOVIMIENTOS='./B230-PORTAL-ACCESO-FINAL-PREMIUM-1.1-assets/03-movimientos.png';
const IMG_PRESUPUESTO='./B230-PORTAL-ACCESO-FINAL-PREMIUM-1.1-assets/04-presupuesto.png';
const IMG_DEUDAS='./B230-PORTAL-ACCESO-FINAL-PREMIUM-1.1-assets/05-deudas.png';
const IMG_PLANIFICACION='./B230-PORTAL-ACCESO-FINAL-PREMIUM-1.1-assets/06-planificacion.png';

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
#${ID} .heroCta{display:flex;gap:11px;flex-wrap:wrap;margin-top:28px}#${ID} a[href="https://apk.controlfinanciero.cl/app-control-financiero.apk"]{
  display:inline-flex;
  align-items:center;
  justify-content:center;
  text-align:center;
  text-decoration:none;
  white-space:nowrap;
}

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
@media(max-width:640px){
  #${ID} .nav{
    position:relative;
  }
  #${ID} .nav .brand{
    min-width:0;
    flex:1 1 auto;
  }
  #${ID} .nav .actions{
    margin-left:auto;
    margin-right:0;
    justify-content:flex-end;
    align-items:flex-end;
    flex-direction:column;
    flex-wrap:nowrap;
    flex:0 0 auto;
  }
  #${ID} .nav .actions .btn{
    align-self:flex-end;
  }
  #${ID} .wrap{width:min(100% - 22px,1180px)}#${ID} .nav{min-height:68px;padding:10px 0}
#${ID} .mark{width:38px;height:38px}#${ID} .brand b{font-size:12px}.brand small{font-size:8px}
#${ID} .nav .actions .btn:first-child{display:none}#${ID} .nav .actions .btn{min-height:40px;padding:9px 12px;font-size:11px}
#${ID} .hero{padding:40px 0 35px;gap:29px}#${ID} h1{font-size:clamp(40px,12vw,56px)}
#${ID} .hero p{font-size:14px}.heroCta{display:grid;grid-template-columns:1fr;margin-top:22px}
#${ID} .heroCta .btn{width:100%}.proof{gap:10px}.dash{border-radius:20px;padding:10px}.dashMain{padding:15px}
#${ID} .balance{font-size:29px}.metrics{grid-template-columns:1fr 1fr!important}.miniGrid{grid-template-columns:1fr}
#${ID} .section{padding:48px 0}.grid{grid-template-columns:1fr;gap:10px}.feature{min-height:auto;padding:19px}
#${ID} .cta{padding:34px 18px;margin-bottom:45px}.cta .btn{width:100%}}

/* B230 PREMIUM 1.1 — REAL MODULE GALLERY + LIGHTBOX · REFINED PRESENTATION */
#ccf-b230-final .moduleGallery{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;margin-top:28px;align-items:start}
#ccf-b230-final .moduleCard{position:relative;overflow:hidden;border:1px solid rgba(91,216,255,.12);border-radius:16px;background:linear-gradient(145deg,rgba(255,255,255,.055),rgba(255,255,255,.018));box-shadow:0 12px 34px rgba(0,0,0,.16);transition:transform .22s ease,border-color .22s ease,box-shadow .22s ease}
#ccf-b230-final .moduleCard:hover{transform:translateY(-3px);border-color:rgba(91,216,255,.30);box-shadow:0 18px 42px rgba(0,0,0,.23)}
#ccf-b230-final .moduleImageButton{display:flex;align-items:center;justify-content:center;width:100%;height:164px;padding:8px;border:0;background:linear-gradient(180deg,#f4f7fa,#e8eef3);cursor:zoom-in;position:relative;overflow:hidden}
#ccf-b230-final .moduleImageButton::after{content:"";position:absolute;inset:8px;border:1px solid rgba(5,24,40,.10);border-radius:10px;pointer-events:none}
#ccf-b230-final .moduleImageButton img{display:block;width:100%;height:100%;object-fit:cover;object-position:top center;border-radius:9px;transition:transform .35s ease,filter .35s ease}
#ccf-b230-final .moduleImageButton:hover img{transform:scale(1.018);filter:brightness(1.035)}
#ccf-b230-final .zoomHint{position:absolute;right:15px;top:15px;width:30px;height:30px;border-radius:9px;display:grid;place-items:center;color:#fff;background:rgba(4,15,27,.76);border:1px solid rgba(255,255,255,.15);font-size:15px;backdrop-filter:blur(9px);z-index:2;opacity:.94}
#ccf-b230-final .moduleInfo{padding:13px 15px 15px}.moduleInfo b{display:block;font-size:15px;color:#edf6ff}.moduleInfo p{margin:5px 0 0;color:#8197ad;font-size:10px;line-height:1.5}
#ccf-b230-final .moduleTag{display:inline-flex;margin-bottom:7px;padding:4px 7px;border-radius:999px;color:#70d9ff;background:rgba(43,178,225,.055);border:1px solid rgba(80,210,255,.12);font-size:7px;letter-spacing:.11em;font-weight:900;text-transform:uppercase}
#ccf-b230-final .heroVisual{position:relative;min-height:390px;display:flex;align-items:center;justify-content:center;padding:8px;border-radius:26px;border:1px solid rgba(255,255,255,.13);background:radial-gradient(circle at 78% 28%,rgba(48,191,255,.14),transparent 34%),linear-gradient(145deg,rgba(255,255,255,.075),rgba(255,255,255,.018));box-shadow:0 32px 90px rgba(0,0,0,.38);overflow:hidden;transform:perspective(1100px) rotateY(-5deg) rotateX(2deg);animation:b230in .8s ease both}
#ccf-b230-final .heroLaptop{position:relative;width:100%;line-height:0;border-radius:20px;overflow:hidden}
#ccf-b230-final .heroLaptop img{display:block;width:100%;height:auto;border-radius:20px;background:#fff}
#ccf-b230-final .heroPhone{position:absolute;z-index:3;right:3.5%;bottom:2.5%;width:27%;line-height:0;border-radius:28px;overflow:hidden;filter:drop-shadow(0 24px 35px rgba(0,0,0,.48));transform:rotate(1.5deg)}
#ccf-b230-final .heroPhone img{display:block;width:100%;height:auto;border-radius:28px}
#ccf-b230-final .heroDeviceBadge{position:absolute;z-index:5;left:18px;bottom:18px;padding:8px 11px;border-radius:999px;background:rgba(4,15,27,.88);border:1px solid rgba(91,216,255,.28);color:#dff8ff;font-size:9px;font-weight:900;backdrop-filter:blur(10px)}
#ccf-b230-final .audienceVisual{margin-top:26px;padding:10px;border-radius:20px;border:1px solid rgba(255,255,255,.10);background:rgba(255,255,255,.025);overflow:hidden}
#ccf-b230-final .audienceVisual img{display:block;width:100%;height:auto;border-radius:14px}
#ccf-b230-final .lightbox{position:fixed;inset:0;z-index:2147483646;display:none;align-items:center;justify-content:center;padding:24px;background:rgba(1,7,14,.88);backdrop-filter:blur(14px)}
#ccf-b230-final .lightbox.isOpen{display:flex;animation:b230LbIn .2s ease both}
#ccf-b230-final .lightboxPanel{position:relative;max-width:min(1320px,96vw);max-height:94vh;display:flex;flex-direction:column;align-items:center;gap:10px}
#ccf-b230-final .lightboxPanel img{display:block;max-width:96vw;max-height:86vh;width:auto;height:auto;object-fit:contain;border-radius:14px;box-shadow:0 35px 100px rgba(0,0,0,.6);background:#fff}
#ccf-b230-final .lightboxClose{position:absolute;right:-8px;top:-48px;width:42px;height:42px;border-radius:12px;border:1px solid rgba(255,255,255,.2);background:#0b1c2e;color:#fff;cursor:pointer;font-size:24px;line-height:1}
#ccf-b230-final .lightboxTitle{color:#fff;font-size:14px;font-weight:900;text-align:center}
#ccf-b230-final .lightboxCaption{color:#9db0c4;font-size:11px;text-align:center}
#ccf-b230-final .audienceGrid{display:grid;grid-template-columns:repeat(5,1fr);gap:10px;margin-top:28px}
#ccf-b230-final .audienceCard{padding:15px;border:1px solid rgba(255,255,255,.08);border-radius:16px;background:rgba(255,255,255,.035)}
#ccf-b230-final .audienceCard strong{display:block;color:#edf6ff;font-size:12px}.audienceCard span{display:block;margin-top:5px;color:#8197ad;font-size:10px;line-height:1.5}
#ccf-b230-final .flowGrid{display:grid;grid-template-columns:repeat(6,1fr);gap:9px;margin-top:28px}
#ccf-b230-final .flowStep{min-height:145px;padding:17px;border-radius:17px;border:1px solid rgba(91,216,255,.12);background:rgba(255,255,255,.035)}
#ccf-b230-final .flowStep em{font-style:normal;color:#65ddbd;font-size:10px;font-weight:900}.flowStep b{display:block;margin-top:13px;color:#fff;font-size:13px}.flowStep p{color:#8197ad;font-size:10px;line-height:1.5;margin:7px 0 0}
#ccf-b230-final .faqGrid{display:grid;grid-template-columns:.9fr 1.1fr;gap:28px;align-items:start;margin-top:30px}
#ccf-b230-final .faqList{display:grid;gap:8px}.faqItem{border:1px solid rgba(255,255,255,.09);border-radius:15px;background:rgba(255,255,255,.035);overflow:hidden}.faqQ{width:100%;display:flex;justify-content:space-between;gap:12px;align-items:center;border:0;background:transparent;color:#edf6ff;padding:16px;text-align:left;cursor:pointer;font-weight:800;font-size:12px}.faqQ span:last-child{color:#6fe0ff;font-size:18px}.faqA{display:none;padding:0 16px 16px;color:#8da3b8;font-size:11px;line-height:1.65}.faqItem.open .faqA{display:block}.faqItem.open .faqQ span:last-child{transform:rotate(45deg)}
#ccf-b230-final .dynamicCta{display:grid;grid-template-columns:1fr auto;gap:25px;align-items:center;padding:38px 34px;margin:10px 0 60px;border-radius:24px;background:radial-gradient(circle at 80% 0,rgba(70,209,255,.16),transparent 42%),linear-gradient(135deg,rgba(36,145,218,.13),rgba(82,216,179,.07));border:1px solid rgba(91,216,255,.16)}
#ccf-b230-final .dynamicCta h2{font-size:clamp(26px,3.8vw,40px);line-height:1.05;margin:7px 0 10px}.dynamicCta p{margin:0;color:#91a7bb;font-size:13px;line-height:1.65;max-width:700px}
#ccf-b230-final .dynamicCta .btn{white-space:nowrap;min-width:205px}
@keyframes b230LbIn{from{opacity:0}to{opacity:1}}
@media(max-width:900px){#ccf-b230-final .moduleGallery{grid-template-columns:repeat(3,minmax(0,1fr));gap:11px}#ccf-b230-final .moduleImageButton{height:138px;padding:7px}#ccf-b230-final .moduleImageButton::after{inset:7px}#ccf-b230-final .moduleInfo{padding:11px 12px 13px}#ccf-b230-final .moduleInfo b{font-size:13px}#ccf-b230-final .moduleInfo p{font-size:9px}#ccf-b230-final .flowGrid{grid-template-columns:repeat(3,1fr)}#ccf-b230-final .audienceGrid{grid-template-columns:repeat(3,1fr)}#ccf-b230-final .faqGrid{grid-template-columns:1fr}#ccf-b230-final .dynamicCta{grid-template-columns:1fr}}
@media(max-width:480px){#ccf-b230-final .moduleGallery{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}#ccf-b230-final .moduleImageButton{height:132px}#ccf-b230-final .zoomHint{right:11px;top:11px;width:28px;height:28px;font-size:14px}#ccf-b230-final .flowGrid{grid-template-columns:1fr 1fr!important}.audienceGrid{grid-template-columns:1fr 1fr!important}}
@media(max-width:360px){#ccf-b230-final .moduleGallery{grid-template-columns:1fr}#ccf-b230-final .moduleImageButton{height:170px}}
@media(max-width:640px){#ccf-b230-final .heroVisual{transform:none;min-height:300px;padding:6px;border-radius:21px}.heroLaptop{border-radius:16px!important}.heroLaptop img{border-radius:16px!important}.heroPhone{right:2.5%!important;bottom:1.8%!important;width:29%!important;border-radius:22px!important}.heroPhone img{border-radius:22px!important}.heroDeviceBadge{left:11px!important;bottom:11px!important;font-size:8px!important;padding:7px 9px!important}.lightbox{padding:12px!important}.lightboxPanel img{max-width:96vw;max-height:80vh}.lightboxClose{right:0!important;top:-48px!important}.dynamicCta{padding:28px 20px!important}.dynamicCta .btn{width:100%}}

#${ID} .priceSection{margin:18px 0 48px;padding:34px;border:1px solid rgba(255,255,255,.11);border-radius:24px;background:linear-gradient(145deg,rgba(57,185,255,.10),rgba(91,230,183,.055));box-shadow:0 22px 60px rgba(0,0,0,.18)}
#${ID} .priceGrid{display:grid;grid-template-columns:1.15fr .85fr;gap:24px;align-items:center}
#${ID} .priceBadge{display:inline-flex;align-items:center;gap:8px;padding:7px 11px;border-radius:999px;background:rgba(91,230,183,.10);border:1px solid rgba(91,230,183,.20);color:#73e5c0;font-size:10px;font-weight:900;letter-spacing:.12em;text-transform:uppercase}
#${ID} .priceTitle{margin:12px 0 8px;font-size:clamp(26px,4vw,42px);line-height:1.05;letter-spacing:-.035em}.priceText{color:#9db0c4;line-height:1.65;margin:0;max-width:680px}
#${ID} .priceValue{font-size:52px;font-weight:950;letter-spacing:-.05em;margin:0}.priceSmall{color:#8299af;font-size:11px;line-height:1.5;margin:4px 0 18px}.priceActions{display:flex;gap:10px;flex-wrap:wrap}
#${ID} .installBtn{position:relative}
@media(max-width:760px){#${ID} .priceGrid{grid-template-columns:1fr}#${ID} .priceSection{padding:24px 18px}}
@media(prefers-reduced-motion:reduce){#${ID} *,#${ID} *:before,#${ID} *:after{animation:none!important;transition:none!important}}
/* B230 PREMIUM 2.9.2 — VISUAL SYSTEM MATCHED TO APPROVED DESIGN */
#ccf-b230-final{background:radial-gradient(ellipse at 78% 14%,rgba(0,150,255,.19),transparent 30%),radial-gradient(ellipse at 10% 45%,rgba(0,205,190,.09),transparent 30%),linear-gradient(145deg,#03101f 0%,#061a2c 54%,#031020 100%)}
#ccf-b230-final .wrap{width:min(1440px,calc(100% - 72px))}
#ccf-b230-final .nav{min-height:74px;padding:0 8px;gap:22px}
#ccf-b230-final .brand{text-decoration:none;color:#f4f8ff;flex:0 0 auto}
#ccf-b230-final .brand b{font-size:20px;letter-spacing:-.025em;text-transform:none}
#ccf-b230-final .brand small{font-size:10px;letter-spacing:.02em}
#ccf-b230-final .mark{width:46px;height:46px;border-radius:13px;color:#fff;background:linear-gradient(135deg,#078aff,#0878e9);box-shadow:0 8px 24px rgba(0,128,255,.25);font-size:17px}
#ccf-b230-final .navLinks{display:flex;align-items:center;justify-content:center;gap:clamp(13px,2.3vw,36px);flex:1}
#ccf-b230-final .navLinks a{position:relative;color:#e4edf8;text-decoration:none;font-size:12px;font-weight:650;padding:28px 0 25px;white-space:nowrap}
#ccf-b230-final .navLinks a:hover,#ccf-b230-final .navLinks a.active{color:#fff}
#ccf-b230-final .navLinks a.active:after{content:"";position:absolute;bottom:14px;left:0;right:0;height:3px;border-radius:3px;background:#00d9ed;box-shadow:0 0 12px #00d9ed}
#ccf-b230-final .actions{flex:0 0 auto;gap:10px;flex-wrap:nowrap}
#ccf-b230-final .actions .btn{min-height:42px;padding:10px 16px;border-radius:12px;font-size:12px;white-space:nowrap}
#ccf-b230-final .actions .primary{background:linear-gradient(105deg,#00d7e8,#1689f4);color:#031324}
#ccf-b230-final .hero{grid-template-columns:minmax(390px,.88fr) minmax(520px,1.12fr);gap:36px;padding:42px 0 26px;min-height:520px}
#ccf-b230-final .heroCopy{position:relative;z-index:4}
#ccf-b230-final .kicker{padding:7px 13px;border-color:#087ba8;background:rgba(0,195,226,.07);font-size:10px}
#ccf-b230-final h1{font-size:clamp(43px,4.2vw,66px);line-height:1.01;letter-spacing:-.055em;margin:22px 0 18px;font-weight:850}
#ccf-b230-final .heroTitle .grad{background:linear-gradient(95deg,#00d9ee,#20baf9 54%,#43e4c4);-webkit-background-clip:text;background-clip:text;color:transparent}
#ccf-b230-final .hero p{max-width:590px;color:#b5c6d8;font-size:15px;line-height:1.65}
#ccf-b230-final .heroCta{gap:13px;margin-top:25px}
#ccf-b230-final .heroCta .btn{min-height:48px;padding:13px 21px;border-radius:12px;font-size:13px}
#ccf-b230-final .heroCta .primary{background:linear-gradient(105deg,#00d7e8,#138cf5);color:#031324}
#ccf-b230-final .demoBtn{display:inline-flex;align-items:center;text-decoration:none;border-color:#b9d6ee;color:#f3f8ff;background:rgba(3,19,35,.45)}
#ccf-b230-final .proof{gap:20px;margin-top:22px;color:#d4e4f2;font-size:10px}
#ccf-b230-final .proof span{white-space:nowrap}
#ccf-b230-final .heroVisual{min-height:420px;padding:0;border:0;border-radius:28px;background:radial-gradient(ellipse at 54% 52%,rgba(0,164,255,.25),transparent 65%);box-shadow:none;overflow:visible;transform:none;animation:none}
#ccf-b230-final .heroLaptop{width:100%;border-radius:18px;filter:drop-shadow(0 22px 30px rgba(0,0,0,.4))}
#ccf-b230-final .heroLaptop img{width:100%;max-height:430px;object-fit:contain;object-position:center;border-radius:16px;background:transparent}
#ccf-b230-final .heroPhone{right:auto;left:-5%;bottom:-3%;width:25%;border:4px solid #18283a;border-radius:25px;box-shadow:0 16px 36px rgba(0,0,0,.55);transform:rotate(-2deg)}
#ccf-b230-final .heroPhone img{border-radius:20px}
#ccf-b230-final .heroDeviceBadge{display:none}
#ccf-b230-final .benefitStrip{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));align-items:center;margin:0 0 28px;padding:15px 20px;border:1px solid rgba(87,181,232,.18);border-radius:17px;background:linear-gradient(105deg,rgba(20,65,96,.72),rgba(15,48,75,.65));box-shadow:0 12px 30px rgba(0,0,0,.12)}
#ccf-b230-final .benefitStrip article{display:flex;align-items:center;gap:15px;padding:3px 16px;border-right:1px solid rgba(174,216,242,.22);min-width:0}
#ccf-b230-final .benefitStrip article:last-child{border-right:0}
#ccf-b230-final .benefitIcon{font-size:34px;line-height:1;color:#00d8ef;min-width:38px;text-align:center}
#ccf-b230-final .benefitStrip b{display:block;color:#f1f7ff;font-size:12px}
#ccf-b230-final .benefitStrip small{display:block;color:#a9c1d6;font-size:10px;margin-top:4px}
#ccf-b230-final .section{padding:28px 0 36px}
#ccf-b230-final .sectionTitleRow{display:flex;align-items:center;justify-content:space-between;gap:25px}
#ccf-b230-final .sectionHead{max-width:680px}
#ccf-b230-final .eyebrow{font-size:10px;color:#00d9ed;letter-spacing:.16em}
#ccf-b230-final .section h2,#ccf-b230-final .faqBlock h2{font-size:clamp(28px,3.2vw,42px);line-height:1.05;letter-spacing:-.04em;margin:9px 0 10px}
#ccf-b230-final .sectionHead p{font-size:13px;color:#b0c4d7;max-width:650px}
#ccf-b230-final .outlineLink{display:inline-flex;align-items:center;padding:10px 16px;border:1px solid rgba(220,239,255,.7);border-radius:11px;color:#f2f8ff;text-decoration:none;font-size:12px;font-weight:750;white-space:nowrap}
#ccf-b230-final .moduleGallery{grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin-top:20px}
#ccf-b230-final .moduleCard{display:grid;grid-template-columns:74px 1fr;align-items:center;min-height:92px;border:1px solid rgba(75,170,221,.25);border-radius:14px;background:linear-gradient(115deg,rgba(20,54,79,.88),rgba(9,31,51,.82));box-shadow:0 8px 22px rgba(0,0,0,.12)}
#ccf-b230-final .moduleImageButton{height:100%;min-height:90px;width:74px;padding:9px;background:transparent;overflow:hidden}
#ccf-b230-final .moduleImageButton:after{display:none}
#ccf-b230-final .moduleImageButton img{height:58px;width:58px;object-fit:cover;border-radius:10px}
#ccf-b230-final .zoomHint{display:none}
#ccf-b230-final .moduleInfo{padding:12px 12px 12px 2px}
#ccf-b230-final .moduleInfo b{font-size:13px;color:#f4f8ff}
#ccf-b230-final .moduleInfo p{font-size:10px;color:#c0d0df;line-height:1.4;margin-top:4px}
#ccf-b230-final .audienceSection{display:grid;grid-template-columns:.88fr 1.12fr;column-gap:25px;align-items:center}
#ccf-b230-final .audienceIntro{grid-row:span 2}
#ccf-b230-final .audienceIntro h2{font-size:clamp(25px,3vw,36px)}
#ccf-b230-final .audienceIntro p{font-size:12px;color:#b0c4d7;line-height:1.6}
#ccf-b230-final .audienceVisual{margin:0;padding:7px;border-radius:16px}
#ccf-b230-final .audienceVisual img{max-height:170px;object-fit:cover}
#ccf-b230-final .audienceGrid{grid-template-columns:repeat(5,minmax(0,1fr));gap:8px;margin-top:10px}
#ccf-b230-final .audienceCard{padding:11px 10px;border-radius:12px;background:rgba(16,44,66,.8)}
#ccf-b230-final .audienceCard strong{font-size:10px}
#ccf-b230-final .audienceCard span{font-size:9px;line-height:1.4}
#ccf-b230-final .lowerBenefits{margin-top:4px;margin-bottom:24px}
#ccf-b230-final .offerFaq{display:grid;grid-template-columns:1.28fr .72fr;gap:26px;align-items:center;margin:10px 0 28px}
#ccf-b230-final .priceSection{margin:0;padding:23px 24px;border-color:rgba(0,198,235,.28);background:linear-gradient(115deg,rgba(13,48,73,.92),rgba(5,32,54,.9));box-shadow:0 15px 35px rgba(0,0,0,.15)}
#ccf-b230-final .priceGrid{grid-template-columns:1.2fr .8fr;gap:18px}
#ccf-b230-final .priceTitle{font-size:clamp(22px,2.5vw,30px)}
#ccf-b230-final .priceText{font-size:11px;line-height:1.55}
#ccf-b230-final .priceValue{font-size:50px;color:#00d9ed;line-height:1}
#ccf-b230-final .priceSmall{font-size:10px;margin:5px 0 12px}
#ccf-b230-final .priceActions{display:grid;gap:8px}
#ccf-b230-final .priceActions .btn{min-height:38px;padding:9px 12px;font-size:10px}
#ccf-b230-final .faqBlock h2{font-size:clamp(22px,2.5vw,29px);margin-bottom:12px}
#ccf-b230-final .faqList{gap:6px}
#ccf-b230-final .faqItem{border-radius:11px;background:rgba(21,52,75,.75)}
#ccf-b230-final .faqQ{padding:11px 13px;font-size:10px}
#ccf-b230-final .faqA{font-size:10px;padding:0 13px 12px}
#ccf-b230-final .dynamicCta{grid-template-columns:1fr auto;min-height:120px;padding:24px 34px;margin:0 0 24px;border-radius:18px;background:radial-gradient(ellipse at 80% 20%,rgba(0,211,244,.35),transparent 44%),linear-gradient(105deg,#102b80,#075b9a 52%,#007caa);border-color:rgba(55,200,255,.55);box-shadow:inset 0 0 50px rgba(0,201,255,.1)}
#ccf-b230-final .dynamicCta h2{font-size:clamp(23px,2.8vw,32px);margin:0 0 7px}
#ccf-b230-final .dynamicCta p{font-size:11px;color:#e0f1ff;max-width:760px}
#ccf-b230-final .dynamicCta .btn{min-width:195px;background:linear-gradient(100deg,#00d8e8,#188cf5);color:#031324}
#ccf-b230-final .footer{display:flex;align-items:center;justify-content:space-between;gap:18px;padding:20px 0 28px;text-align:left}
#ccf-b230-final .footerBrand{display:flex;align-items:center;gap:10px;color:#fff}
#ccf-b230-final .footerBrand .mark{width:38px;height:38px;font-size:13px}
#ccf-b230-final .footerBrand b{display:block;font-size:12px}
#ccf-b230-final .footerBrand small{display:block;font-size:9px;color:#92a9bd}
#ccf-b230-final .footer>span{margin:0;font-size:9px}
#ccf-b230-final .footerLinks{display:flex;gap:14px}
#ccf-b230-final .footerLinks a{color:#a7bbce;text-decoration:none;font-size:9px;white-space:nowrap}
@media(max-width:1100px){
 #ccf-b230-final .wrap{width:calc(100% - 44px)}
 #ccf-b230-final .navLinks{gap:12px}
 #ccf-b230-final .navLinks a{font-size:10px}
 #ccf-b230-final .brand b{font-size:16px}
 #ccf-b230-final .hero{grid-template-columns:.9fr 1.1fr;gap:18px}
 #ccf-b230-final .moduleGallery{grid-template-columns:repeat(2,minmax(0,1fr))}
 #ccf-b230-final .audienceSection{grid-template-columns:1fr}
 #ccf-b230-final .audienceIntro{grid-row:auto}
 #ccf-b230-final .audienceVisual{margin-top:15px}
 #ccf-b230-final .audienceGrid{grid-template-columns:repeat(5,minmax(0,1fr))}
}
@media(max-width:760px){
 #ccf-b230-final .wrap{width:calc(100% - 28px)}
 #ccf-b230-final .nav{flex-wrap:wrap;min-height:auto;padding:12px 0}
 #ccf-b230-final .navLinks{order:3;flex:1 0 100%;justify-content:space-between;overflow-x:auto;gap:18px}
 #ccf-b230-final .navLinks a{padding:9px 0;font-size:10px}
 #ccf-b230-final .navLinks a.active:after{bottom:2px}
 #ccf-b230-final .actions{margin-left:auto}
 #ccf-b230-final .actions .downloadNav{display:none}
 #ccf-b230-final .hero{grid-template-columns:1fr;gap:24px;padding:34px 0 24px}
 #ccf-b230-final h1{font-size:clamp(38px,9vw,54px)}
 #ccf-b230-final .hero p{font-size:14px}
 #ccf-b230-final .heroVisual{min-height:0;padding:0;max-width:620px;margin:auto}
 #ccf-b230-final .heroLaptop img{max-height:none}
 #ccf-b230-final .heroPhone{width:22%;left:-2%;bottom:-2%}
 #ccf-b230-final .benefitStrip{grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;padding:14px}
 #ccf-b230-final .benefitStrip article{border:0;padding:5px}
 #ccf-b230-final .benefitIcon{font-size:28px;min-width:30px}
 #ccf-b230-final .sectionTitleRow{align-items:flex-start;flex-direction:column}
 #ccf-b230-final .outlineLink{display:none}
 #ccf-b230-final .moduleGallery{grid-template-columns:repeat(2,minmax(0,1fr))}
 #ccf-b230-final .audienceGrid{grid-template-columns:repeat(2,minmax(0,1fr))}
 #ccf-b230-final .offerFaq{grid-template-columns:1fr;gap:24px}
 #ccf-b230-final .priceGrid{grid-template-columns:1fr  .65fr}
 #ccf-b230-final .dynamicCta{grid-template-columns:1fr;gap:15px;padding:22px}
 #ccf-b230-final .dynamicCta .btn{width:100%}
 #ccf-b230-final .footer{flex-wrap:wrap}
 #ccf-b230-final .footerLinks{width:100%;flex-wrap:wrap}
}
@media(max-width:480px){
 #ccf-b230-final .nav .brand b{font-size:13px}
 #ccf-b230-final .nav .brand small{font-size:8px}
 #ccf-b230-final .nav .actions .btn{min-height:37px;padding:8px 10px;font-size:10px}
 #ccf-b230-final .hero{padding-top:26px}
 #ccf-b230-final h1{font-size:clamp(36px,10.3vw,46px);line-height:1.02}
 #ccf-b230-final .heroCta{display:flex;flex-direction:column}
 #ccf-b230-final .heroCta .btn{width:100%;justify-content:center}
 #ccf-b230-final .proof{gap:8px 12px;font-size:9px}
 #ccf-b230-final .benefitStrip{margin-bottom:20px}
 #ccf-b230-final .benefitStrip article{gap:9px}
 #ccf-b230-final .benefitStrip b{font-size:10px}
 #ccf-b230-final .benefitStrip small{font-size:9px}
 #ccf-b230-final .moduleGallery{grid-template-columns:1fr}
 #ccf-b230-final .moduleCard{grid-template-columns:68px 1fr;min-height:84px}
 #ccf-b230-final .moduleImageButton{width:68px;min-height:84px}
 #ccf-b230-final .moduleImageButton img{width:52px;height:52px}
 #ccf-b230-final .audienceGrid{grid-template-columns:repeat(2,minmax(0,1fr))}
 #ccf-b230-final .audienceVisual img{max-height:125px}
 #ccf-b230-final .priceGrid{grid-template-columns:1fr}
 #ccf-b230-final .priceSection{padding:20px 17px}
 #ccf-b230-final .priceActions{grid-template-columns:1fr 1fr}
 #ccf-b230-final .footer{gap:12px}
 #ccf-b230-final .footer>span{width:100%}
}
@media(prefers-reduced-motion:reduce){#ccf-b230-final .heroLaptop,#ccf-b230-final .heroPhone{animation:none!important}}
/* SOMOS SOFTWARE QUALITY PASS 2.9.6 — desktop fidelity + mobile-first composition */
#ccf-b230-final{overflow-x:clip;isolation:isolate}
#ccf-b230-final .wrap{width:min(1440px,calc(100% - 72px))}
#ccf-b230-final .nav{min-height:76px;padding:0 8px;gap:20px;position:sticky;top:0;background:rgba(3,13,27,.88);border-bottom:1px solid rgba(85,190,245,.18);backdrop-filter:blur(18px)}
#ccf-b230-final .brand{flex:0 0 auto;gap:13px}
#ccf-b230-final .brand .mark{width:46px;height:46px;border-radius:13px;background:linear-gradient(135deg,#087cff,#008be9);color:#fff;box-shadow:0 8px 24px rgba(0,125,255,.28)}
#ccf-b230-final .brand b{font-size:18px;letter-spacing:-.035em}
#ccf-b230-final .brand small{font-size:10px;letter-spacing:.015em;color:#a7bdd2}
#ccf-b230-final .navLinks{gap:clamp(15px,2.2vw,34px)}
#ccf-b230-final .navLinks a{font-size:12px;font-weight:700;padding:27px 0 24px}
#ccf-b230-final .actions{gap:12px;flex-wrap:nowrap}
#ccf-b230-final .actions .btn{min-height:46px;padding:11px 18px;border-radius:12px;font-size:12px}
#ccf-b230-final .actions .downloadNav{display:inline-flex}
#ccf-b230-final .actions .btn.primary{background:linear-gradient(105deg,#00d9e9,#168cf5);color:#031321}
#ccf-b230-final .mobileMenuToggle{display:none}
#ccf-b230-final .hero{grid-template-columns:minmax(0,.92fr) minmax(0,1.08fr);gap:28px;align-items:center;padding:42px 0 26px;min-height:560px}
#ccf-b230-final .heroCopy{position:relative;z-index:2;max-width:650px}
#ccf-b230-final .kicker{padding:8px 13px;font-size:11px;border-color:rgba(0,208,245,.55);color:#6edcff;background:rgba(0,176,226,.07)}
#ccf-b230-final h1{font-size:clamp(42px,4.5vw,68px);line-height:1.01;letter-spacing:-.055em;margin:22px 0 18px;max-width:670px}
#ccf-b230-final .hero p{max-width:620px;color:#d2e0ed;font-size:17px;line-height:1.55}
#ccf-b230-final .heroCta{gap:14px;margin-top:30px}
#ccf-b230-final .heroCta .btn{min-height:54px;padding:14px 23px;border-radius:13px;font-size:14px}
#ccf-b230-final .proof{display:flex;gap:22px;flex-wrap:wrap;margin-top:25px;color:#d4e5f3;font-size:11px}
#ccf-b230-final .heroVisual{position:relative;min-height:0;width:calc(100% + 34px);margin-left:-16px;padding:0;border:0;border-radius:0;background:none;box-shadow:none;overflow:visible;transform:none;animation:none;display:flex;align-items:center;justify-content:center}
#ccf-b230-final .heroVisualDesktop{display:block;width:100%;line-height:0;filter:drop-shadow(0 24px 38px rgba(0,0,0,.30))}
#ccf-b230-final .heroVisualDesktop img{display:block;width:100%;height:auto;object-fit:contain}
#ccf-b230-final .heroVisualMobile{display:none}
#ccf-b230-final .benefitStrip{margin:0 0 30px;padding:17px 20px;border-radius:18px;background:linear-gradient(105deg,rgba(18,57,86,.86),rgba(12,43,69,.82));border-color:rgba(87,181,232,.22)}
#ccf-b230-final .section{padding:34px 0 42px}
#ccf-b230-final .section h2,#ccf-b230-final .faqBlock h2{font-size:clamp(30px,3.4vw,44px)}
#ccf-b230-final .moduleGallery{gap:14px}
#ccf-b230-final .moduleCard{min-height:104px}
#ccf-b230-final .footer{border-top:1px solid rgba(87,181,232,.15)}
@media(max-width:1100px) and (min-width:761px){
 #ccf-b230-final .wrap{width:calc(100% - 48px)}
 #ccf-b230-final .navLinks{gap:12px}
 #ccf-b230-final .navLinks a{font-size:10px}
 #ccf-b230-final .brand b{font-size:15px}
 #ccf-b230-final .hero{grid-template-columns:minmax(0,.92fr) minmax(0,1.08fr);gap:12px;min-height:500px}
 #ccf-b230-final h1{font-size:clamp(40px,4.5vw,54px)}
 #ccf-b230-final .heroVisual{width:calc(100% + 18px);margin-left:-8px}
}
@media(max-width:760px){
 #ccf-b230-final .wrap{width:calc(100% - 36px)}
 #ccf-b230-final .nav{min-height:68px;flex-wrap:nowrap;padding:10px 0;gap:10px}
 #ccf-b230-final .brand{gap:10px;min-width:0}
 #ccf-b230-final .brand .mark{width:42px;height:42px;flex:0 0 42px}
 #ccf-b230-final .brand b{font-size:15px;white-space:nowrap}
 #ccf-b230-final .brand small{font-size:9px}
 #ccf-b230-final .mobileMenuToggle{display:inline-flex;align-items:center;justify-content:center;flex:0 0 42px;width:42px;height:42px;border:1px solid rgba(157,205,235,.24);border-radius:11px;background:rgba(255,255,255,.06);color:#f4f9ff;font-size:21px;cursor:pointer}
 #ccf-b230-final .navLinks{display:none;order:5;position:absolute;left:0;right:0;top:calc(100% + 1px);padding:10px;border:1px solid rgba(87,181,232,.22);border-radius:0 0 16px 16px;background:rgba(4,17,33,.98);box-shadow:0 18px 40px rgba(0,0,0,.35);flex-direction:column;align-items:stretch;gap:0;overflow:visible}
 #ccf-b230-final .nav.is-open .navLinks{display:flex}
 #ccf-b230-final .navLinks a{display:block;padding:13px 12px;font-size:13px;border-radius:8px}
 #ccf-b230-final .navLinks a.active:after{left:12px;right:auto;bottom:5px;width:26px;height:2px}
 #ccf-b230-final .actions{margin-left:auto;gap:7px}
 #ccf-b230-final .actions .downloadNav{display:none}
 #ccf-b230-final .actions .btn{min-height:40px;padding:9px 12px;font-size:11px;white-space:nowrap}
 #ccf-b230-final .hero{display:flex;flex-direction:column;align-items:stretch;gap:22px;padding:38px 0 22px;min-height:0}
 #ccf-b230-final .heroCopy{max-width:none}
 #ccf-b230-final h1{font-size:clamp(38px,8.5vw,56px);line-height:1.02;max-width:650px;margin:18px 0 16px}
 #ccf-b230-final .hero p{font-size:15px;line-height:1.65;max-width:620px}
 #ccf-b230-final .heroCta{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:23px}
 #ccf-b230-final .heroCta .btn{width:100%;min-height:50px;padding:12px 10px;font-size:12px;justify-content:center}
 #ccf-b230-final .proof{gap:9px 16px;margin-top:18px;font-size:10px}
 #ccf-b230-final .heroVisual{display:flex;width:100%;margin:0;min-height:0;justify-content:center;overflow:hidden;border-radius:22px;background:radial-gradient(ellipse at 50% 48%,rgba(0,160,255,.24),transparent 66%);padding:8px 0 0}
 #ccf-b230-final .heroVisualDesktop{display:none}
 #ccf-b230-final .heroVisualMobile{display:flex;justify-content:center;width:100%;max-height:420px;overflow:hidden}
 #ccf-b230-final .heroVisualMobile img{display:block;width:min(76%,310px);height:auto;max-height:420px;object-fit:contain;object-position:top center;filter:drop-shadow(0 22px 30px rgba(0,0,0,.38))}
 #ccf-b230-final .benefitStrip{grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;padding:14px;margin-bottom:20px}
 #ccf-b230-final .benefitStrip article{padding:6px 4px;gap:10px;border:0}
 #ccf-b230-final .benefitIcon{font-size:27px;min-width:30px}
 #ccf-b230-final .benefitStrip b{font-size:11px}
 #ccf-b230-final .benefitStrip small{font-size:9px;line-height:1.4}
 #ccf-b230-final .section{padding:32px 0}
 #ccf-b230-final .sectionTitleRow{align-items:flex-start;flex-direction:column;gap:10px}
 #ccf-b230-final .outlineLink{display:inline-flex}
 #ccf-b230-final .moduleGallery{grid-template-columns:repeat(2,minmax(0,1fr));gap:11px}
 #ccf-b230-final .moduleCard{grid-template-columns:68px minmax(0,1fr);min-height:90px}
 #ccf-b230-final .moduleImageButton{width:68px;min-height:88px}
 #ccf-b230-final .moduleInfo{min-width:0;padding:10px 10px 10px 2px}
 #ccf-b230-final .moduleInfo b{font-size:12px}
 #ccf-b230-final .moduleInfo p{font-size:10px;overflow-wrap:anywhere}
 #ccf-b230-final .audienceSection{display:block}
 #ccf-b230-final .audienceIntro h2{font-size:clamp(26px,6vw,36px)}
 #ccf-b230-final .audienceVisual{margin-top:18px}
 #ccf-b230-final .audienceVisual img{max-height:none;object-fit:contain}
 #ccf-b230-final .audienceGrid{grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}
 #ccf-b230-final .audienceCard{padding:12px}
 #ccf-b230-final .offerFaq{grid-template-columns:1fr;gap:22px}
 #ccf-b230-final .priceGrid{grid-template-columns:1fr .75fr;gap:14px}
 #ccf-b230-final .priceSection{padding:22px 18px}
 #ccf-b230-final .priceActions{display:grid;grid-template-columns:1fr}
 #ccf-b230-final .dynamicCta{grid-template-columns:1fr;gap:15px;padding:24px 20px;margin-bottom:30px}
 #ccf-b230-final .dynamicCta .btn{width:100%}
 #ccf-b230-final .footer{flex-wrap:wrap;gap:14px;padding:20px 0 28px}
 #ccf-b230-final .footer>span{width:100%;margin:0}
 #ccf-b230-final .footerLinks{width:100%;flex-wrap:wrap;gap:12px}
}
@media(max-width:480px){
 #ccf-b230-final .wrap{width:calc(100% - 30px)}
 #ccf-b230-final .brand b{font-size:13px}
 #ccf-b230-final .brand small{font-size:8px}
 #ccf-b230-final .actions .btn{min-height:38px;padding:8px 10px;font-size:10px}
 #ccf-b230-final .hero{padding-top:30px;gap:18px}
 #ccf-b230-final h1{font-size:clamp(36px,9.5vw,44px);letter-spacing:-.05em}
 #ccf-b230-final .kicker{font-size:9px;letter-spacing:.11em}
 #ccf-b230-final .hero p{font-size:14px}
 #ccf-b230-final .heroCta{grid-template-columns:1fr}
 #ccf-b230-final .heroCta .btn{min-height:48px;font-size:13px}
 #ccf-b230-final .proof{font-size:9px;gap:8px 12px}
 #ccf-b230-final .heroVisualMobile img{width:min(82%,300px);max-height:390px}
 #ccf-b230-final .benefitStrip{gap:8px;padding:11px}
 #ccf-b230-final .benefitStrip article{gap:8px}
 #ccf-b230-final .benefitStrip b{font-size:10px}
 #ccf-b230-final .benefitStrip small{font-size:8px}
 #ccf-b230-final .moduleGallery{grid-template-columns:1fr}
 #ccf-b230-final .moduleCard{grid-template-columns:72px minmax(0,1fr)}
 #ccf-b230-final .moduleImageButton{width:72px}
 #ccf-b230-final .moduleImageButton img{width:54px;height:54px}
 #ccf-b230-final .priceGrid{grid-template-columns:1fr}
 #ccf-b230-final .priceValue{font-size:48px}
 #ccf-b230-final .priceActions .btn{width:100%}
 #ccf-b230-final .faqQ{font-size:12px;padding:14px}
 #ccf-b230-final .faqA{font-size:11px}
 #ccf-b230-final .footerLinks a{font-size:10px}
}
@media(prefers-reduced-motion:reduce){#ccf-b230-final .heroVisualMobile img{animation:none!important;transition:none!important}}

/* B230.2.9.7 — SOMOS SOFTWARE DESIGN SYSTEM / DEVICE MOCKUP REBUILD */
#ccf-b230-final .hero{
  grid-template-columns:minmax(0,.91fr) minmax(0,1.09fr);
  gap:clamp(24px,3vw,48px);
  min-height:570px;
  padding:48px 0 38px;
  align-items:center;
}
#ccf-b230-final .heroCopy{max-width:650px;z-index:3}
#ccf-b230-final .heroTitle{max-width:660px;text-wrap:balance}
#ccf-b230-final .heroVisual{
  width:100%;min-height:0;margin:0;padding:0;overflow:visible;
  display:flex;align-items:center;justify-content:center;
  border:0;border-radius:0;background:none;box-shadow:none;transform:none;animation:none;
}
#ccf-b230-final .ccf-device-stage{
  width:100%;max-width:760px;position:relative;isolation:isolate;
  padding:22px 5px 40px 8px;
  background:radial-gradient(ellipse at 55% 48%,rgba(0,155,255,.24),transparent 65%);
}
#ccf-b230-final .ccf-laptop{
  position:relative;width:100%;z-index:1;padding:11px 11px 9px;
  border:2px solid #a9c9df;border-bottom-color:#425e77;
  border-radius:22px 22px 12px 12px;
  background:linear-gradient(145deg,#182b40,#050c17 45%,#243a50);
  box-shadow:0 26px 55px rgba(0,0,0,.42),0 0 0 1px rgba(255,255,255,.08) inset;
}
#ccf-b230-final .ccf-laptop-screen{
  position:relative;overflow:hidden;aspect-ratio:1.6/1;
  border-radius:12px 12px 4px 4px;background:#f4f7fb;
  border:1px solid rgba(255,255,255,.18);
}
#ccf-b230-final .ccf-laptop-screen img{display:block;width:100%;height:100%;object-fit:cover;object-position:top center}
#ccf-b230-final .ccf-camera{
  position:absolute;z-index:2;top:4px;left:50%;transform:translateX(-50%);
  width:5px;height:5px;border-radius:50%;background:#29465e;
  box-shadow:0 0 0 2px rgba(0,0,0,.28);
}
#ccf-b230-final .ccf-laptop-chin{height:8px;background:linear-gradient(180deg,#1d3349,#07111d)}
#ccf-b230-final .ccf-laptop-base{
  position:absolute;left:-5.5%;right:-5.5%;bottom:-14px;height:13px;
  border-radius:0 0 45% 45%;
  background:linear-gradient(180deg,#d7e3eb 0%,#71889a 35%,#263d52 72%,#07111d 100%);
  box-shadow:0 12px 18px rgba(0,0,0,.32);
}
#ccf-b230-final .ccf-phone{
  position:absolute;z-index:3;left:-3%;bottom:12px;
  width:23%;max-width:176px;min-width:126px;
  padding:9px 6px 8px;border:3px solid #a9c4d8;border-radius:28px;
  background:linear-gradient(145deg,#20364c,#050b14 70%);
  box-shadow:0 20px 38px rgba(0,0,0,.48),0 0 0 1px rgba(255,255,255,.12) inset;
  transform:rotate(-3deg);
}
#ccf-b230-final .ccf-phone img{
  display:block;width:100%;height:auto;aspect-ratio:691/1178;
  object-fit:cover;border-radius:19px;background:#f4f7fb;
}
#ccf-b230-final .ccf-phone-speaker{
  position:absolute;z-index:2;top:5px;left:50%;transform:translateX(-50%);
  width:34px;height:4px;border-radius:5px;background:#07111d;
}
#ccf-b230-final .heroVisualMobile{display:none}
#ccf-b230-final .benefitStrip{margin-top:0}
@media(max-width:1100px) and (min-width:761px){
 #ccf-b230-final .hero{grid-template-columns:minmax(0,.9fr) minmax(0,1.1fr);gap:18px;min-height:510px}
 #ccf-b230-final h1{font-size:clamp(40px,4.3vw,54px)}
 #ccf-b230-final .ccf-phone{left:-2%;width:22%}
}
@media(max-width:980px){
 #ccf-b230-final .nav{position:sticky}
 #ccf-b230-final .mobileMenuToggle{display:inline-flex;align-items:center;justify-content:center;flex:0 0 42px;width:42px;height:42px;border:1px solid rgba(157,205,235,.24);border-radius:11px;background:rgba(255,255,255,.06);color:#f4f9ff;font-size:21px;cursor:pointer}
 #ccf-b230-final .navLinks{display:none;order:5;position:absolute;left:0;right:0;top:calc(100% + 1px);padding:10px;border:1px solid rgba(87,181,232,.22);border-radius:0 0 16px 16px;background:rgba(4,17,33,.98);box-shadow:0 18px 40px rgba(0,0,0,.35);flex-direction:column;align-items:stretch;gap:0}
 #ccf-b230-final .nav.is-open .navLinks{display:flex}
 #ccf-b230-final .navLinks a{display:block;padding:13px 12px;font-size:13px}
 #ccf-b230-final .navLinks a.active:after{left:12px;right:auto;bottom:5px;width:26px;height:2px}
 #ccf-b230-final .actions .downloadNav{display:none}
}
@media(max-width:760px){
 #ccf-b230-final .wrap{width:calc(100% - 36px)}
 #ccf-b230-final .nav{flex-wrap:wrap}
 #ccf-b230-final .hero{display:flex;flex-direction:column;align-items:stretch;gap:22px;padding:34px 0 25px;min-height:0}
 #ccf-b230-final .heroCopy{max-width:680px}
 #ccf-b230-final h1{font-size:clamp(39px,8.7vw,56px);line-height:1.02;max-width:650px}
 #ccf-b230-final .hero p{font-size:15px;max-width:620px}
 #ccf-b230-final .heroVisual{width:100%;display:flex;justify-content:center;overflow:visible}
 #ccf-b230-final .ccf-device-stage{
   width:100%;max-width:460px;min-height:0;padding:0 0 8px;
   display:flex;justify-content:center;align-items:center;
   background:radial-gradient(ellipse at 50% 55%,rgba(0,156,255,.22),transparent 68%);
 }
 #ccf-b230-final .ccf-laptop{display:none}
 #ccf-b230-final .ccf-phone{
   position:relative;left:auto;bottom:auto;width:min(68%,280px);max-width:280px;min-width:0;
   padding:10px 7px 9px;border-width:3px;border-radius:34px;
   transform:none;margin:0 auto;box-shadow:0 26px 50px rgba(0,0,0,.48);
 }
 #ccf-b230-final .ccf-phone img{border-radius:25px}
 #ccf-b230-final .ccf-phone-speaker{top:5px;width:42px;height:5px}
 #ccf-b230-final .benefitStrip{grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;padding:14px}
 #ccf-b230-final .benefitStrip article{border:0;padding:6px 4px}
 #ccf-b230-final .section{padding:34px 0}
 #ccf-b230-final .moduleGallery{grid-template-columns:repeat(2,minmax(0,1fr))}
 #ccf-b230-final .audienceGrid{grid-template-columns:repeat(2,minmax(0,1fr))}
 #ccf-b230-final .offerFaq{grid-template-columns:1fr}
 #ccf-b230-final .dynamicCta{grid-template-columns:1fr}
 #ccf-b230-final .dynamicCta .btn{width:100%}
}
@media(max-width:520px){
 #ccf-b230-final .wrap{width:calc(100% - 30px)}
 #ccf-b230-final .nav{gap:8px}
 #ccf-b230-final .brand b{font-size:14px}
 #ccf-b230-final .brand small{font-size:8px}
 #ccf-b230-final .actions .btn{min-height:39px;padding:8px 11px;font-size:10px}
 #ccf-b230-final .hero{padding-top:30px;gap:20px}
 #ccf-b230-final h1{font-size:clamp(36px,9.6vw,46px);line-height:1.04;letter-spacing:-.05em}
 #ccf-b230-final .kicker{font-size:9px}
 #ccf-b230-final .hero p{font-size:14px;line-height:1.6}
 #ccf-b230-final .heroCta{display:grid;grid-template-columns:1fr;gap:10px;margin-top:21px}
 #ccf-b230-final .heroCta .btn{width:100%;min-height:49px;font-size:13px}
 #ccf-b230-final .proof{font-size:9px;gap:8px 12px}
 #ccf-b230-final .ccf-device-stage{max-width:360px}
 #ccf-b230-final .ccf-phone{width:min(72%,258px)}
 #ccf-b230-final .benefitStrip{margin-bottom:18px}
 #ccf-b230-final .moduleGallery{grid-template-columns:1fr}
 #ccf-b230-final .priceGrid{grid-template-columns:1fr}
 #ccf-b230-final .priceActions{grid-template-columns:1fr}
}
@media(prefers-reduced-motion:reduce){
 #ccf-b230-final .ccf-phone,#ccf-b230-final .ccf-laptop{animation:none!important;transition:none!important}
}

/* B230.2.9.8 — REBALANCE VISUAL / DESKTOP + MOBILE */
#ccf-b230-final .wrap{width:min(1320px,calc(100% - 80px))}
#ccf-b230-final .hero{
  grid-template-columns:minmax(0, .96fr) minmax(0, 1.04fr);
  gap:clamp(30px,3.2vw,48px);
  min-height:540px;
  padding:42px 0 30px;
}
#ccf-b230-final .heroCopy{max-width:640px}
#ccf-b230-final .heroTitle{
  max-width:640px;
  font-size:clamp(49px,3.82vw,60px);
  line-height:1.02;
  letter-spacing:-.057em;
  text-wrap:initial;
  margin:21px 0 18px;
}
#ccf-b230-final .hero p{max-width:590px;font-size:16px;line-height:1.58}
#ccf-b230-final .heroCta{margin-top:25px;gap:14px}
#ccf-b230-final .heroCta .btn{min-height:52px;padding:13px 22px;font-size:13px}
#ccf-b230-final .proof{margin-top:22px;gap:18px;font-size:10px}
#ccf-b230-final .heroVisual{
  width:100%;margin:0;min-height:0;overflow:visible;
  background:radial-gradient(ellipse at 58% 48%,rgba(0,157,255,.20),transparent 67%);
}
#ccf-b230-final .ccf-device-stage{
  width:100%;max-width:760px;padding:22px 0 38px;
  background:radial-gradient(ellipse at 62% 52%,rgba(0,174,255,.20),transparent 68%);
}
#ccf-b230-final .ccf-laptop{
  width:88%;margin-left:12%;padding:10px 10px 8px;
  border-width:2px;border-radius:21px 21px 11px 11px;
  box-shadow:0 28px 64px rgba(0,0,0,.38),0 0 36px rgba(0,157,255,.10);
}
#ccf-b230-final .ccf-laptop-screen{aspect-ratio:1.60/1;border-radius:13px 13px 4px 4px}
#ccf-b230-final .ccf-laptop-screen img{object-fit:contain;object-position:center top}
#ccf-b230-final .ccf-laptop-base{left:-5%;right:-5%;height:12px;bottom:-13px}
#ccf-b230-final .ccf-phone{
  left:-7%;bottom:10px;width:25%;max-width:188px;min-width:150px;
  padding:8px 6px 7px;border-width:3px;border-radius:29px;
  box-shadow:0 24px 48px rgba(0,0,0,.48),0 0 24px rgba(0,166,255,.10);
  transform:rotate(-2deg);
}
#ccf-b230-final .ccf-phone img{object-fit:cover;border-radius:21px}
@media(max-width:1100px) and (min-width:761px){
 #ccf-b230-final .wrap{width:calc(100% - 56px)}
 #ccf-b230-final .hero{grid-template-columns:minmax(0,.98fr) minmax(0,1.02fr);gap:22px;min-height:500px}
 #ccf-b230-final .heroTitle{font-size:clamp(43px,4.2vw,52px)}
 #ccf-b230-final .hero p{font-size:14px}
 #ccf-b230-final .ccf-laptop{width:90%;margin-left:10%}
 #ccf-b230-final .ccf-phone{left:-5%;width:24%;min-width:128px}
}
@media(max-width:760px){
 #ccf-b230-final .wrap{width:calc(100% - 40px)}
 #ccf-b230-final .hero{gap:24px;padding:34px 0 24px;min-height:0}
 #ccf-b230-final .heroTitle{font-size:clamp(39px,8.2vw,54px);line-height:1.04;max-width:680px;margin:18px 0 15px}
 #ccf-b230-final .hero p{font-size:15px;line-height:1.62;max-width:640px}
 #ccf-b230-final .heroVisual{padding:0;background:none}
 #ccf-b230-final .ccf-device-stage{max-width:500px;padding:0 0 12px;background:radial-gradient(ellipse at 50% 50%,rgba(0,157,255,.18),transparent 68%)}
 #ccf-b230-final .ccf-phone{width:min(66%,300px);max-width:300px;min-width:0;padding:9px 7px 8px;border-radius:34px}
 #ccf-b230-final .ccf-phone img{border-radius:26px}
}
@media(max-width:480px){
 #ccf-b230-final .wrap{width:calc(100% - 32px)}
 #ccf-b230-final .hero{padding-top:28px;gap:21px}
 #ccf-b230-final .heroTitle{font-size:clamp(36px,9.2vw,44px);line-height:1.05;letter-spacing:-.052em}
 #ccf-b230-final .hero p{font-size:14px;line-height:1.58}
 #ccf-b230-final .heroCta{grid-template-columns:1fr;gap:10px;margin-top:20px}
 #ccf-b230-final .heroCta .btn{min-height:49px;font-size:13px}
 #ccf-b230-final .ccf-phone{width:min(72%,270px)}
}


/* CCF 3.0 — visual implementation of approved Somos Software design */
#ccf-b230-final{background:#03172b;color:#f4f8ff;background-image:radial-gradient(ellipse at 75% 8%,rgba(0,125,235,.25),transparent 34%),radial-gradient(ellipse at 4% 47%,rgba(0,115,210,.17),transparent 33%),linear-gradient(145deg,#031426 0%,#061c36 50%,#031426 100%)}
#ccf-b230-final .wrap{width:min(1440px,calc(100% - 58px))}
#ccf-b230-final .nav{min-height:72px;gap:16px;border-bottom:1px solid rgba(76,183,255,.22);background:rgba(2,16,33,.88);padding:0 0;position:sticky;top:0}
#ccf-b230-final .brandCluster{display:flex;align-items:center;gap:18px;flex:0 0 auto;min-width:290px}
#ccf-b230-final .brand{gap:10px;text-decoration:none}.brand .mark{width:46px;height:46px;border-radius:13px;background:linear-gradient(135deg,#078cff,#006de2);color:#fff;font-size:14px;box-shadow:0 8px 22px rgba(0,127,255,.28)}
#ccf-b230-final .brand b{font-size:17px;letter-spacing:-.04em;color:#f7fbff}.brand b sup,.footerBrand sup,.somosBrand sup{font-size:7px;vertical-align:top;margin-left:1px}.brand small{font-size:9px;letter-spacing:0;color:#b7c9dc;margin-top:2px}
#ccf-b230-final .brandDivider{height:42px;width:1px;background:rgba(176,211,238,.35)}
#ccf-b230-final .somosBrand{display:flex;flex-direction:column;gap:1px;text-decoration:none;color:#fff;white-space:nowrap}.somosBrand small{font-size:8px;color:#e3edf7}.somosBrand b{font-size:11px;letter-spacing:-.04em}.somosBrand i,.footerSomos i{font-style:normal;color:#00d8e8;font-size:18px;font-weight:950}
#ccf-b230-final .navLinks{gap:clamp(10px,1.5vw,23px)}#ccf-b230-final .navLinks a{font-size:11px;padding:26px 0 23px}
#ccf-b230-final .actions{gap:8px}.actions .btn{min-height:42px;padding:9px 13px;font-size:10px;border-radius:10px;white-space:nowrap}.actions .downloadNav{border-color:rgba(225,240,255,.5);background:transparent}.actions .primary{background:linear-gradient(105deg,#00d6e7,#078cf4);color:#03162a}
#ccf-b230-final .hero{grid-template-columns:minmax(0,.86fr) minmax(0,1.14fr);gap:24px;min-height:390px;padding:34px 0 25px}
#ccf-b230-final .heroCopy{max-width:600px}.hero .kicker{padding:7px 12px;font-size:9px;letter-spacing:.12em;color:#31e3f1;border-color:#00cce8;background:rgba(0,194,232,.06)}
#ccf-b230-final .heroTitle{font-size:clamp(38px,4.4vw,58px);line-height:.98;letter-spacing:-.06em;margin:17px 0 15px;max-width:610px}.heroTitle .grad{background:linear-gradient(100deg,#00e5f0,#00b8ee 58%,#00d9c9);-webkit-background-clip:text;background-clip:text;color:transparent}
#ccf-b230-final .hero p{font-size:14px;line-height:1.5;color:#e0eaf5;max-width:550px}.heroCta{margin-top:20px!important;gap:12px!important}.heroCta .btn{min-height:44px!important;padding:11px 18px!important;border-radius:12px!important;font-size:11px!important}.heroCta .primary{background:linear-gradient(105deg,#00d9e8,#058cf6);color:#00182a}.heroCta .demoBtn{border-color:#d0e7fa;background:rgba(4,24,45,.45)}
#ccf-b230-final .proof{margin-top:16px;gap:14px;color:#d7e9f7;font-size:9px}.proof span{white-space:nowrap}
#ccf-b230-final .heroVisual{width:100%;margin:0;overflow:visible;background:radial-gradient(ellipse at 56% 52%,rgba(0,132,255,.35),transparent 68%)}
#ccf-b230-final .ccf-device-stage{max-width:780px;padding:14px 0 29px;background:radial-gradient(ellipse at 55% 55%,rgba(0,151,255,.23),transparent 67%)}
#ccf-b230-final .ccf-laptop{width:91%;margin-left:9%;padding:8px 8px 7px;border:2px solid #b6d6ed;border-radius:17px 17px 9px 9px;box-shadow:0 22px 55px rgba(0,0,0,.38),0 0 34px rgba(0,149,255,.16)}
#ccf-b230-final .ccf-laptop-screen{aspect-ratio:1.6/1;border-radius:10px 10px 3px 3px}#ccf-b230-final .ccf-laptop-screen img{object-fit:cover;object-position:top center}
#ccf-b230-final .ccf-laptop-base{height:10px;bottom:-11px;background:linear-gradient(180deg,#d6e8f5,#718ca6 45%,#122b45)}
#ccf-b230-final .ccf-phone{left:-2%;bottom:0;width:23%;min-width:112px;max-width:158px;padding:7px 5px;border:3px solid #a8c8e2;border-radius:23px;transform:rotate(-2deg);box-shadow:0 20px 42px rgba(0,0,0,.52)}#ccf-b230-final .ccf-phone img{border-radius:16px}
#ccf-b230-final .benefitStrip{grid-template-columns:repeat(4,1fr);margin:0 0 24px;padding:13px 16px;border:1px solid rgba(0,183,241,.34);border-radius:17px;background:linear-gradient(100deg,rgba(4,43,72,.92),rgba(7,39,68,.88));gap:0}
#ccf-b230-final .benefitStrip article{display:flex;align-items:center;gap:12px;padding:2px 16px;border-right:1px solid rgba(175,220,247,.27)}#ccf-b230-final .benefitStrip article:last-child{border-right:0}
#ccf-b230-final .benefitIcon{font-size:30px;min-width:32px;color:#00e1f2;line-height:1}#ccf-b230-final .benefitStrip b{font-size:11px;color:#fff}.benefitStrip small{font-size:9px;color:#d3e5f4;margin-top:3px}
#ccf-b230-final .modulesSection{padding:8px 0 32px}.sectionTitleRow{display:flex;justify-content:space-between;align-items:center;gap:22px}.sectionHead .eyebrow{color:#00dce9;font-size:9px}.sectionHead h2{font-size:clamp(27px,3vw,38px);margin:5px 0 5px;letter-spacing:-.05em}.sectionHead p{font-size:12px;line-height:1.4;color:#d6e4f2}.outlineLink{display:inline-flex;align-items:center;border:1px solid #b4d9f1;border-radius:30px;padding:9px 15px;color:#fff;text-decoration:none;font-size:10px;font-weight:800;white-space:nowrap}
#ccf-b230-final .moduleTiles{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:13px;margin-top:17px}.moduleTile{min-height:140px;padding:13px 15px;border:1px solid rgba(0,172,241,.4);border-radius:16px;background:linear-gradient(145deg,rgba(7,39,70,.96),rgba(3,25,49,.92));box-shadow:0 10px 25px rgba(0,0,0,.14)}
#ccf-b230-final .tileIcon{display:grid;place-items:center;width:48px;height:48px;border-radius:13px;margin-bottom:8px;color:white;font-size:28px;font-weight:900;box-shadow:0 8px 20px rgba(0,0,0,.22)}.tileIcon.green{background:linear-gradient(145deg,#00dc9b,#00a96d)}.tileIcon.violet{background:linear-gradient(145deg,#9b42ff,#5418d5)}.tileIcon.cyan{background:linear-gradient(145deg,#00d6f4,#0089e8)}.tileIcon.orange{background:linear-gradient(145deg,#ffbd21,#f07800)}.tileIcon.pink{background:linear-gradient(145deg,#ff5caf,#df167d)}.tileIcon.purple{background:linear-gradient(145deg,#9872ff,#4b30d5)}
#ccf-b230-final .moduleTile b{font-size:14px;display:block;color:#fff;letter-spacing:-.03em}.moduleTile p{font-size:11px;line-height:1.35;color:#e3edf7;margin:4px 0 0}
#ccf-b230-final .audienceBand{position:relative;margin:0 -29px;padding:34px 29px 37px;display:grid;grid-template-columns:.92fr 1.25fr;align-items:center;gap:30px;color:#071a32;background:linear-gradient(115deg,#f1f8ff,#dcecf9 55%,#f7fbff);border-radius:48% 8% 45% 8% / 8% 5% 8% 5%;}
#ccf-b230-final .audienceIntro .eyebrow{color:#008ecb;font-size:9px}.audienceIntro h2{font-size:clamp(23px,2.5vw,34px);line-height:1.03;letter-spacing:-.05em;margin:6px 0 8px;color:#061b35}.audienceIntro p{font-size:12px;line-height:1.45;color:#1c3148;margin:0;max-width:430px}
#ccf-b230-final .audienceTiles{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:11px}.audienceTiles article{min-height:128px;padding:12px 8px;border:1px solid rgba(70,128,180,.12);border-radius:15px;background:rgba(255,255,255,.68);box-shadow:0 8px 18px rgba(27,75,120,.12);text-align:center}.audIcon{display:block;font-size:31px;font-weight:900;line-height:1.2;margin-bottom:6px}.audIcon.blue{color:#078bff}.audIcon.indigo{color:#4a46e9}.audIcon.navy{color:#234b8c}.audIcon.violet{color:#6736e8}.audienceTiles b{display:block;color:#0a1b33;font-size:11px}.audienceTiles p{font-size:9px;line-height:1.35;color:#162b43;margin:5px 0 0}
#ccf-b230-final .keyBenefits{display:grid;grid-template-columns:.9fr 1.15fr .72fr;align-items:center;gap:28px;padding:34px 0 24px;min-height:270px}
#ccf-b230-final .benefitPhone{position:relative;width:100%;height:245px;display:flex;justify-content:center;align-items:flex-end;background:radial-gradient(ellipse at 48% 62%,rgba(0,157,255,.35),transparent 67%)}.benefitPhone>img{height:260px;max-width:75%;object-fit:contain;filter:drop-shadow(0 12px 18px rgba(19,48,82,.13));transform:none;position:relative;z-index:1}.floatIcon{position:absolute;z-index:2;width:54px;height:54px;display:grid;place-items:center;border-radius:13px;color:#00e5f3;font-size:29px;background:linear-gradient(145deg,#1244b5,#051d54);box-shadow:0 10px 24px rgba(0,0,0,.28);border:1px solid rgba(61,189,255,.4)}.chartIcon{left:2%;bottom:22px}.pieIcon{right:2%;top:45px;color:#c4a1ff}
#ccf-b230-final .keyCopy .eyebrow{color:#00e0e9;font-size:9px}.keyCopy h2{font-size:clamp(23px,2.7vw,34px);line-height:1.05;letter-spacing:-.05em;margin:7px 0 13px}.keyCopy ul{list-style:none;padding:0;margin:0;display:grid;gap:8px}.keyCopy li{font-size:12px;color:#edf6ff;display:flex;align-items:flex-start;gap:9px}.keyCopy li:before{content:'✓';color:#00e4e8;font-size:18px;font-weight:900;line-height:1}
#ccf-b230-final .cloudCard{display:flex;align-items:center;gap:14px;padding:17px 15px;border:1px solid rgba(0,160,255,.55);border-radius:18px;background:linear-gradient(135deg,rgba(5,55,117,.95),rgba(9,29,92,.94));box-shadow:0 14px 30px rgba(0,0,0,.18)}.cloudCard>span{font-size:48px;color:#00e3f1}.cloudCard b{font-size:12px}.cloudCard p{font-size:9px;line-height:1.4;color:#d5e5f5;margin:4px 0 0}
#ccf-b230-final .dynamicCta{display:grid;grid-template-columns:75px 1.05fr 1fr auto;align-items:center;gap:18px;margin:0 0 25px;padding:17px 24px;border:1px solid rgba(71,184,255,.5);border-radius:19px;background:radial-gradient(ellipse at 8% 50%,rgba(0,221,255,.3),transparent 22%),linear-gradient(105deg,#0874ed,#4039dc 68%,#9255f1);box-shadow:0 16px 36px rgba(0,0,0,.22)}.ctaRocket{font-size:43px;color:#8ff5ff;text-align:center}.ctaTitle h2{font-size:clamp(19px,2.2vw,27px);line-height:1.05;letter-spacing:-.04em;margin:0}.dynamicCta>p{font-size:12px;line-height:1.4;color:#fff;border-left:1px solid rgba(255,255,255,.45);padding-left:20px;margin:0}.dynamicCta .btn{white-space:nowrap;background:linear-gradient(105deg,#00e4e8,#00d7e9);color:#03172c;border:0;min-height:44px;padding:11px 18px;font-size:11px}
#ccf-b230-final .premiumFooter{display:block;padding:20px 0 14px;border-top:1px solid rgba(87,181,232,.25);text-align:left}.footerTop{display:grid;grid-template-columns:1.6fr .75fr .75fr .75fr .65fr;gap:22px;padding:0 8px 17px;border-bottom:1px solid rgba(87,181,232,.2)}.footerIdentity{display:flex;flex-direction:column;gap:12px}.footerBrand .mark{width:45px;height:45px;background:linear-gradient(135deg,#078cff,#006de2);color:white}.footerBrand b{font-size:14px}.footerBrand small{font-size:9px;color:#c4d4e4}.footerSomos{font-size:10px;color:#dbe8f5}.footerSomos b{display:block;font-size:13px;color:#fff;margin-top:3px}.footerColumn{display:flex;flex-direction:column;gap:5px}.footerColumn>b{font-size:11px;color:#fff;margin-bottom:4px}.footerColumn a{font-size:10px;color:#d1e0ee;text-decoration:none}.footerColumn a:hover{color:#00e2ef}.socialLinks{display:flex;gap:11px}.socialLinks a{width:22px;height:22px;display:grid;place-items:center;border-radius:50%;font-weight:900;font-size:12px;color:#061a30;background:#eaf5ff}.footerBottom{text-align:center;color:#b4c7d8;font-size:9px;padding-top:12px}
#ccf-b230-final .mobileMenuToggle{display:none}
@media(max-width:1050px){#ccf-b230-final .wrap{width:calc(100% - 42px)}#ccf-b230-final .brandCluster{min-width:245px;gap:11px}#ccf-b230-final .somosBrand b{font-size:9px}#ccf-b230-final .navLinks{gap:10px}#ccf-b230-final .navLinks a{font-size:9px}#ccf-b230-final .actions .btn{padding:8px 10px;font-size:9px}#ccf-b230-final .moduleTiles{grid-template-columns:repeat(3,1fr)}#ccf-b230-final .audienceBand{margin:0 -21px;padding:30px 21px}#ccf-b230-final .keyBenefits{grid-template-columns:.75fr 1.2fr .8fr;gap:18px}}
@media(max-width:760px){#ccf-b230-final .wrap{width:calc(100% - 32px)}#ccf-b230-final .nav{min-height:65px;gap:8px;flex-wrap:nowrap}#ccf-b230-final .brandCluster{min-width:0;flex:1;gap:9px}#ccf-b230-final .brand .mark{width:39px;height:39px;flex-basis:39px}#ccf-b230-final .brand b{font-size:13px}#ccf-b230-final .brand small{font-size:7px}#ccf-b230-final .brandDivider{height:34px}#ccf-b230-final .somosBrand small{font-size:7px}#ccf-b230-final .somosBrand b{font-size:8px}#ccf-b230-final .somosBrand i{font-size:13px}#ccf-b230-final .mobileMenuToggle{display:inline-flex;order:4;flex:0 0 36px;width:36px;height:36px;align-items:center;justify-content:center;border:1px solid rgba(157,205,235,.24);border-radius:9px;background:rgba(255,255,255,.06);color:#fff;font-size:18px}#ccf-b230-final .navLinks{display:none;order:5;position:absolute;left:0;right:0;top:100%;padding:8px;border:1px solid rgba(87,181,232,.25);border-radius:0 0 14px 14px;background:#041a31;flex-direction:column;align-items:stretch;gap:0}#ccf-b230-final .nav.is-open .navLinks{display:flex}#ccf-b230-final .navLinks a{padding:11px;font-size:12px}#ccf-b230-final .actions{gap:0}#ccf-b230-final .actions .downloadNav{display:none}#ccf-b230-final .actions .btn{min-height:36px;padding:7px 9px;font-size:9px}#ccf-b230-final .hero{display:flex;flex-direction:column;gap:17px;padding:26px 0 18px;min-height:0}#ccf-b230-final .heroCopy{max-width:none}#ccf-b230-final .heroTitle{font-size:clamp(35px,8.8vw,49px);line-height:1.01;margin:14px 0 12px}#ccf-b230-final .hero p{font-size:13px;line-height:1.48}#ccf-b230-final .heroCta{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-top:17px!important}#ccf-b230-final .heroCta .btn{min-height:43px!important;padding:10px 8px!important;font-size:10px!important}#ccf-b230-final .proof{font-size:8px;gap:8px 11px;margin-top:13px}#ccf-b230-final .heroVisual{width:100%;overflow:visible;padding:0}#ccf-b230-final .ccf-device-stage{max-width:500px;padding:7px 0 13px}#ccf-b230-final .ccf-laptop{display:block;width:88%;margin-left:12%;padding:5px;border-radius:11px 11px 5px 5px}#ccf-b230-final .ccf-laptop-screen{aspect-ratio:1.6/1;border-radius:6px}#ccf-b230-final .ccf-laptop-base{height:6px;bottom:-7px}#ccf-b230-final .ccf-phone{left:-1%;bottom:0;width:23%;min-width:0;max-width:112px;padding:4px 3px;border-width:2px;border-radius:16px}#ccf-b230-final .ccf-phone img{border-radius:11px}#ccf-b230-final .ccf-phone-speaker{width:19px;height:2px;top:3px}#ccf-b230-final .benefitStrip{grid-template-columns:repeat(2,minmax(0,1fr));padding:10px;margin-bottom:18px;gap:5px}#ccf-b230-final .benefitStrip article{padding:7px 6px;gap:8px;border-right:0}#ccf-b230-final .benefitIcon{font-size:24px;min-width:26px}#ccf-b230-final .benefitStrip b{font-size:9px}#ccf-b230-final .benefitStrip small{font-size:8px}#ccf-b230-final .modulesSection{padding:5px 0 24px}#ccf-b230-final .sectionTitleRow{align-items:flex-start;flex-direction:column;gap:9px}#ccf-b230-final .sectionHead h2{font-size:28px}#ccf-b230-final .sectionHead p{font-size:11px}#ccf-b230-final .outlineLink{font-size:9px;padding:8px 12px}#ccf-b230-final .moduleTiles{grid-template-columns:repeat(2,minmax(0,1fr));gap:9px;margin-top:14px}#ccf-b230-final .moduleTile{min-height:120px;padding:11px;border-radius:13px}#ccf-b230-final .tileIcon{width:40px;height:40px;font-size:23px;margin-bottom:7px;border-radius:11px}#ccf-b230-final .moduleTile b{font-size:12px}#ccf-b230-final .moduleTile p{font-size:10px}#ccf-b230-final .audienceBand{display:block;margin:0 -16px;padding:27px 16px 29px;border-radius:38px 8px 38px 8px}#ccf-b230-final .audienceIntro h2{font-size:26px}#ccf-b230-final .audienceIntro p{font-size:11px}#ccf-b230-final .audienceTiles{grid-template-columns:repeat(2,minmax(0,1fr));gap:9px;margin-top:17px}#ccf-b230-final .audienceTiles article{min-height:116px;padding:10px 7px}#ccf-b230-final .audIcon{font-size:26px}#ccf-b230-final .audienceTiles b{font-size:10px}#ccf-b230-final .audienceTiles p{font-size:8px}#ccf-b230-final .keyBenefits{grid-template-columns:1fr;gap:10px;padding:23px 0 20px}#ccf-b230-final .benefitPhone{height:175px;order:2}#ccf-b230-final .benefitPhone>img{height:190px;max-width:45%}#ccf-b230-final .floatIcon{width:43px;height:43px;font-size:23px}#ccf-b230-final .keyCopy{order:1}#ccf-b230-final .keyCopy h2{font-size:25px}#ccf-b230-final .keyCopy li{font-size:11px}#ccf-b230-final .cloudCard{order:3;padding:13px}#ccf-b230-final .cloudCard>span{font-size:38px}#ccf-b230-final .dynamicCta{grid-template-columns:44px 1fr;gap:10px;margin-bottom:18px;padding:15px;border-radius:15px}#ccf-b230-final .ctaRocket{font-size:30px}#ccf-b230-final .ctaTitle h2{font-size:18px}#ccf-b230-final .dynamicCta>p{grid-column:2;border-left:0;padding:0;font-size:10px}#ccf-b230-final .dynamicCta .btn{grid-column:1/-1;width:100%;min-height:42px;font-size:10px}#ccf-b230-final .footerTop{grid-template-columns:repeat(2,minmax(0,1fr));gap:17px;padding-bottom:15px}#ccf-b230-final .footerIdentity{grid-column:1/-1}#ccf-b230-final .footerBrand .mark{width:39px;height:39px}#ccf-b230-final .footerColumn>b{font-size:10px}#ccf-b230-final .footerColumn a{font-size:9px}#ccf-b230-final .socialColumn{grid-column:1/-1}#ccf-b230-final .footerBottom{font-size:8px;line-height:1.5}}
@media(max-width:390px){#ccf-b230-final .brandCluster{gap:6px}#ccf-b230-final .brandDivider{margin:0 1px}#ccf-b230-final .brand b{font-size:11px}#ccf-b230-final .somosBrand b{font-size:7px}#ccf-b230-final .actions .btn{font-size:8px;padding:6px 7px}#ccf-b230-final .heroTitle{font-size:35px}#ccf-b230-final .heroCta{grid-template-columns:1fr}#ccf-b230-final .moduleTile{min-height:112px}}
@media(prefers-reduced-motion:reduce){#ccf-b230-final *{animation:none!important;transition:none!important}}


/* ==========================================================
   CCF MINIMAL 3.1 — SISTEMA VISUAL UNIFICADO DESKTOP + MÓVIL
   Capa visual únicamente: conserva DOM, rutas y autenticación.
   ========================================================== */
#ccf-b230-final{
  color:#10213b!important;
  background:#f7faff!important;
  background-image:linear-gradient(180deg,#fff 0%,#f7faff 58%,#fff 100%)!important;
  font-family:Inter,ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif!important;
  -webkit-font-smoothing:antialiased;
}
#ccf-b230-final .orb{display:none!important}
#ccf-b230-final .page{background:transparent!important}
#ccf-b230-final .wrap{width:min(1240px,calc(100% - 64px))!important}
#ccf-b230-final .nav{
  min-height:76px!important;padding:0!important;gap:24px!important;
  background:rgba(255,255,255,.94)!important;border-bottom:1px solid #e6edf5!important;
  box-shadow:0 3px 16px rgba(15,35,65,.035)!important;backdrop-filter:blur(14px)!important;
}
#ccf-b230-final .brandCluster{min-width:0!important;gap:16px!important}
#ccf-b230-final .brand{gap:10px!important}
#ccf-b230-final .brand .mark,#ccf-b230-final .footerBrand .mark{
  width:42px!important;height:42px!important;border-radius:12px!important;
  background:#087cf0!important;color:#fff!important;box-shadow:none!important;font-size:13px!important;
}
#ccf-b230-final .brand b{font-size:15px!important;letter-spacing:-.045em!important;color:#10213b!important}
#ccf-b230-final .brand small{font-size:9px!important;letter-spacing:0!important;color:#66758b!important}
#ccf-b230-final .brandDivider{height:36px!important;background:#dbe4ef!important}
#ccf-b230-final .somosBrand{color:#10213b!important;text-decoration:none!important}
#ccf-b230-final .somosBrand small{font-size:8px!important;color:#758399!important}
#ccf-b230-final .somosBrand b{font-size:11px!important;color:#10213b!important}
#ccf-b230-final .somosBrand i,#ccf-b230-final .footerSomos i{color:#00b8c7!important}
#ccf-b230-final .navLinks{gap:clamp(12px,1.8vw,26px)!important}
#ccf-b230-final .navLinks a{color:#42516a!important;font-size:11px!important;font-weight:650!important;padding:29px 0 26px!important}
#ccf-b230-final .navLinks a:hover,#ccf-b230-final .navLinks a.active{color:#086fe5!important}
#ccf-b230-final .navLinks a.active:after{height:2px!important;background:#087cf0!important;box-shadow:none!important}
#ccf-b230-final .actions{gap:9px!important;flex-wrap:nowrap!important}
#ccf-b230-final .btn{
  min-height:42px!important;padding:10px 16px!important;border-radius:10px!important;
  border:1px solid #d5dfeb!important;background:#fff!important;color:#172943!important;
  box-shadow:none!important;font-size:11px!important;font-weight:750!important;
  transition:background .18s ease,border-color .18s ease,transform .18s ease!important;
}
#ccf-b230-final .btn:hover{transform:translateY(-1px)!important;background:#f5f9ff!important;border-color:#a9c4e6!important}
#ccf-b230-final .btn.primary{
  background:#087cf0!important;color:#fff!important;border-color:#087cf0!important;
  box-shadow:none!important;
}
#ccf-b230-final .btn.primary:hover{background:#066bd1!important;border-color:#066bd1!important}
#ccf-b230-final .hero{
  grid-template-columns:minmax(0,.92fr) minmax(0,1.08fr)!important;
  gap:48px!important;align-items:center!important;min-height:0!important;
  padding:58px 0 48px!important;
}
#ccf-b230-final .heroCopy{max-width:590px!important}
#ccf-b230-final .kicker{
  padding:7px 11px!important;border:1px solid #c9ddf8!important;border-radius:999px!important;
  color:#086fe5!important;background:#eff6ff!important;font-size:9px!important;letter-spacing:.12em!important;
}
#ccf-b230-final .kicker:before{display:none!important}
#ccf-b230-final .heroTitle,#ccf-b230-final h1{
  color:#10213b!important;font-size:clamp(42px,4.5vw,62px)!important;
  line-height:1.02!important;letter-spacing:-.058em!important;font-weight:820!important;
  margin:18px 0 17px!important;max-width:660px!important;
}
#ccf-b230-final .grad,#ccf-b230-final .heroWord.heroGrad{
  background:none!important;color:#087cf0!important;-webkit-text-fill-color:#087cf0!important;
}
#ccf-b230-final .heroWord{opacity:1!important;filter:none!important;transform:none!important;transition:none!important}
#ccf-b230-final .hero p{
  max-width:520px!important;color:#53647b!important;font-size:15px!important;line-height:1.65!important;
}
#ccf-b230-final .heroCta{display:flex!important;gap:10px!important;flex-wrap:wrap!important;margin-top:24px!important}
#ccf-b230-final .heroCta .btn{min-height:46px!important;padding:12px 19px!important;font-size:12px!important}
#ccf-b230-final .heroCta .demoBtn{border-color:#cbd7e6!important;color:#263b58!important;background:#fff!important}
#ccf-b230-final .heroCta .primary[data-b230-open="login"],
#ccf-b230-final .heroCta .primary[data-b230-open="login"]::after{animation:none!important}
#ccf-b230-final .proof{gap:16px!important;margin-top:21px!important;color:#64748b!important;font-size:10px!important}
#ccf-b230-final .proof span{gap:6px!important}
#ccf-b230-final .heroVisual{
  min-height:0!important;padding:0!important;border:0!important;border-radius:0!important;
  background:transparent!important;box-shadow:none!important;overflow:visible!important;
  transform:none!important;animation:none!important;
}
#ccf-b230-final .ccf-device-stage{
  max-width:760px!important;padding:12px 4px 28px!important;
  background:radial-gradient(ellipse at 55% 55%,rgba(8,124,240,.10),transparent 68%)!important;
}
#ccf-b230-final .ccf-laptop{
  border:1px solid #aab8c9!important;border-bottom-color:#8295ab!important;
  border-radius:17px 17px 9px 9px!important;padding:8px 8px 7px!important;
  background:linear-gradient(145deg,#e7edf5,#8d9caf)!important;
  box-shadow:0 18px 42px rgba(19,48,82,.14)!important;
}
#ccf-b230-final .ccf-laptop-screen{border-radius:9px 9px 3px 3px!important;border-color:#cbd5e1!important}
#ccf-b230-final .ccf-laptop-base{filter:none!important;opacity:.9!important}
#ccf-b230-final .ccf-phone{
  border:2px solid #d4deea!important;border-radius:23px!important;padding:6px 4px!important;
  background:#15243a!important;box-shadow:0 15px 28px rgba(19,48,82,.22)!important;
  transform:rotate(-2deg)!important;
}
#ccf-b230-final .ccf-phone img{border-radius:17px!important}
#ccf-b230-final .benefitStrip{
  margin:0 0 28px!important;padding:18px 16px!important;border:1px solid #e2eaf4!important;
  border-radius:15px!important;background:#fff!important;box-shadow:0 5px 20px rgba(15,35,65,.035)!important;
}
#ccf-b230-final .benefitStrip article{gap:12px!important;padding:3px 16px!important;border-color:#e4ebf4!important}
#ccf-b230-final .benefitIcon{color:#087cf0!important;font-size:27px!important}
#ccf-b230-final .benefitStrip b{color:#152743!important;font-size:11px!important}
#ccf-b230-final .benefitStrip small{color:#718096!important;font-size:10px!important}
#ccf-b230-final .section{padding:48px 0!important}
#ccf-b230-final .eyebrow{color:#087cf0!important;font-size:9px!important;letter-spacing:.13em!important}
#ccf-b230-final .sectionTitleRow{align-items:end!important}
#ccf-b230-final .sectionHead h2,#ccf-b230-final .section h2{
  color:#10213b!important;font-size:clamp(27px,3vw,38px)!important;line-height:1.08!important;
  letter-spacing:-.045em!important;margin:8px 0 10px!important;
}
#ccf-b230-final .sectionHead p{color:#64748b!important;font-size:13px!important;line-height:1.65!important}
#ccf-b230-final .outlineLink{color:#086fe5!important;border:0!important;background:transparent!important;font-size:11px!important}
#ccf-b230-final .moduleTiles{grid-template-columns:repeat(6,minmax(0,1fr))!important;gap:12px!important;margin-top:20px!important}
#ccf-b230-final .moduleTile{
  min-height:130px!important;padding:16px!important;border:1px solid #e1eaf4!important;border-radius:13px!important;
  background:#fff!important;box-shadow:0 4px 14px rgba(15,35,65,.035)!important;
}
#ccf-b230-final .tileIcon{
  width:39px!important;height:39px!important;border-radius:11px!important;margin-bottom:12px!important;
  color:#087cf0!important;background:#edf5ff!important;box-shadow:none!important;font-size:22px!important;
}
#ccf-b230-final .tileIcon.green,#ccf-b230-final .tileIcon.violet,#ccf-b230-final .tileIcon.cyan,
#ccf-b230-final .tileIcon.orange,#ccf-b230-final .tileIcon.pink,#ccf-b230-final .tileIcon.purple{
  color:#087cf0!important;background:#edf5ff!important;
}
#ccf-b230-final .moduleTile b{color:#172943!important;font-size:13px!important}
#ccf-b230-final .moduleTile p{color:#64748b!important;font-size:10px!important;line-height:1.5!important}
#ccf-b230-final .audienceBand{
  margin:12px 0 0!important;padding:30px!important;gap:24px!important;
  border:1px solid #e2ebf5!important;border-radius:18px!important;
  background:#f1f6fc!important;color:#10213b!important;
}
#ccf-b230-final .audienceIntro h2{color:#10213b!important;font-size:clamp(24px,2.5vw,32px)!important;line-height:1.08!important}
#ccf-b230-final .audienceIntro p{color:#64748b!important;font-size:12px!important;line-height:1.6!important}
#ccf-b230-final .audienceTiles{gap:0!important}
#ccf-b230-final .audienceTiles article{
  min-height:120px!important;padding:12px!important;border:0!important;border-left:1px solid #d9e4f0!important;
  border-radius:0!important;background:transparent!important;box-shadow:none!important;
}
#ccf-b230-final .audIcon{color:#087cf0!important;font-size:25px!important;display:flex!important;align-items:center!important;justify-content:center!important;width:42px!important;height:42px!important;margin:0 auto 8px!important}
#ccf-b230-final .audIcon svg{display:block!important;width:36px!important;height:36px!important;fill:none!important;stroke:currentColor!important;stroke-width:2.1!important;stroke-linecap:round!important;stroke-linejoin:round!important;overflow:visible!important}
#ccf-b230-final .audienceTiles article:hover .audIcon svg{transform:translateY(-2px)!important}
#ccf-b230-final .audIcon svg{transition:transform .2s ease!important}
#ccf-b230-final .audienceTiles b{color:#172943!important;font-size:11px!important}
#ccf-b230-final .audienceTiles p{color:#64748b!important;font-size:9px!important;line-height:1.45!important}
#ccf-b230-final .keyBenefits{
  grid-template-columns:.75fr 1.3fr .8fr!important;gap:28px!important;
  padding:42px 0 30px!important;min-height:0!important;
}
#ccf-b230-final .benefitPhone{height:205px!important;background:radial-gradient(ellipse at 48% 62%,rgba(8,124,240,.10),transparent 67%)!important}
#ccf-b230-final .benefitPhone>img{height:215px!important;filter:drop-shadow(0 12px 18px rgba(19,48,82,.13))!important}
#ccf-b230-final .floatIcon{display:none!important}
#ccf-b230-final .keyCopy h2{color:#10213b!important;font-size:clamp(24px,2.8vw,34px)!important;line-height:1.1!important}
#ccf-b230-final .keyCopy li{color:#53647b!important;font-size:12px!important;line-height:1.65!important}
#ccf-b230-final .cloudCard{
  position:relative!important;isolation:isolate!important;overflow:hidden!important;
  display:flex!important;flex-direction:column!important;align-items:flex-start!important;justify-content:center!important;
  gap:13px!important;min-height:218px!important;padding:23px 22px!important;
  border:1px solid #cfe1f7!important;border-radius:22px!important;
  background:radial-gradient(circle at 100% 0%,rgba(46,145,255,.17),transparent 43%),linear-gradient(145deg,#ffffff 0%,#f4f8ff 100%)!important;
  box-shadow:0 16px 38px rgba(18,72,130,.12),inset 0 1px 0 rgba(255,255,255,.95)!important;color:#172943!important;
}
#ccf-b230-final .cloudCard:before{content:""!important;position:absolute!important;z-index:-1!important;width:150px!important;height:150px!important;right:-54px!important;top:-65px!important;border-radius:50%!important;background:linear-gradient(135deg,rgba(7,124,240,.15),rgba(20,196,224,.04))!important}
#ccf-b230-final .cloudCard .cloudVisual{display:flex!important;align-items:center!important;justify-content:center!important;width:62px!important;height:62px!important;flex:0 0 62px!important;border-radius:19px!important;color:#fff!important;background:linear-gradient(145deg,#168cf6,#0756c7)!important;box-shadow:0 9px 20px rgba(7,104,213,.25)!important}
#ccf-b230-final .cloudCard .cloudVisual svg{display:block!important;width:39px!important;height:39px!important;fill:none!important;stroke:currentColor!important;stroke-width:1.9!important;stroke-linecap:round!important;stroke-linejoin:round!important}
#ccf-b230-final .cloudCard .cloudCopy{min-width:0!important}
#ccf-b230-final .cloudCard .cloudEyebrow{display:inline-flex!important;align-items:center!important;gap:6px!important;margin-bottom:7px!important;color:#0874df!important;font-size:9px!important;font-weight:800!important;letter-spacing:.11em!important;text-transform:uppercase!important}
#ccf-b230-final .cloudCard .cloudEyebrow:before{content:""!important;width:6px!important;height:6px!important;border-radius:50%!important;background:#13b981!important;box-shadow:0 0 0 3px rgba(19,185,129,.12)!important}
#ccf-b230-final .cloudCard b{display:block!important;color:#102744!important;font-size:17px!important;line-height:1.2!important;font-weight:800!important;letter-spacing:-.025em!important}
#ccf-b230-final .cloudCard p{color:#5b6d84!important;font-size:11px!important;line-height:1.55!important;margin:7px 0 0!important}
#ccf-b230-final .cloudFeatures{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:6px!important;width:100%!important;margin-top:1px!important}
#ccf-b230-final .cloudFeatures span{display:flex!important;align-items:center!important;gap:5px!important;min-width:0!important;padding:7px 6px!important;border:1px solid #e0ebf8!important;border-radius:9px!important;background:rgba(255,255,255,.78)!important;color:#415872!important;font-size:8px!important;font-weight:700!important;white-space:nowrap!important}
#ccf-b230-final .cloudFeatures svg{width:13px!important;height:13px!important;flex:0 0 13px!important;stroke:#0b83e9!important;fill:none!important;stroke-width:2!important;stroke-linecap:round!important;stroke-linejoin:round!important}
#ccf-b230-final .dynamicCta{
  grid-template-columns:minmax(0,1.05fr) minmax(0,1fr) auto!important;gap:24px!important;
  align-items:center!important;padding:28px 30px!important;margin:12px 0 42px!important;
  border:1px solid #d8e6f8!important;border-radius:16px!important;
  background:#edf5ff!important;box-shadow:none!important;
}
#ccf-b230-final .ctaRocket{display:none!important}
#ccf-b230-final .ctaTitle{min-width:0!important}
#ccf-b230-final .dynamicCta h2{color:#10213b!important;font-size:clamp(22px,2.6vw,30px)!important;line-height:1.12!important;margin:0!important}
#ccf-b230-final .dynamicCta p{min-width:0!important;color:#53647b!important;font-size:12px!important;line-height:1.6!important;border-left:1px solid #cfdeef!important;padding-left:22px!important}
#ccf-b230-final .dynamicCta .btn{min-width:175px!important;white-space:normal!important}
#ccf-b230-final .footer{
  padding:24px 0 30px!important;border-top:1px solid #e2eaf3!important;color:#64748b!important;
  background:transparent!important;text-align:left!important;
}
#ccf-b230-final .footerTop{border-color:#e2eaf3!important}
#ccf-b230-final .footerBrand b,#ccf-b230-final .footerColumn>b{color:#172943!important}
#ccf-b230-final .footerBrand small,#ccf-b230-final .footerSomos,#ccf-b230-final .footerColumn a{color:#64748b!important}
#ccf-b230-final .footerSomos b{color:#172943!important}
#ccf-b230-final .footerColumn a:hover{color:#087cf0!important}
#ccf-b230-final .socialLinks a{background:#edf4fc!important;color:#31506f!important;border:1px solid #e1eaf4!important}
#ccf-b230-final .footerBottom{color:#8290a3!important;border-color:#e2eaf3!important}
#ccf-b230-final .moduleCard,#ccf-b230-final .audienceVisual,#ccf-b230-final .flowStep,
#ccf-b230-final .faqItem{background:#fff!important;border-color:#e2eaf3!important;box-shadow:none!important}
#ccf-b230-final .moduleInfo b,#ccf-b230-final .flowStep b,#ccf-b230-final .faqQ{color:#172943!important}
#ccf-b230-final .moduleInfo p,#ccf-b230-final .flowStep p,#ccf-b230-final .faqA{color:#64748b!important}
#ccf-b230-final .moduleTag{color:#087cf0!important;background:#eff6ff!important;border-color:#d9e8fb!important}
#ccf-b230-final .flowStep em{color:#087cf0!important}
#ccf-b230-final .faqQ span:last-child{color:#087cf0!important}
#ccf-b230-final .lightbox{background:rgba(10,25,45,.78)!important}
#ccf-b230-final .lightboxClose{background:#fff!important;color:#172943!important;border-color:#dce5ef!important}
#ccf-b230-final .lightboxTitle{color:#fff!important}
#ccf-b230-final .lightboxCaption{color:#d5dfeb!important}

/* Tablet */
@media(max-width:1000px){
  #ccf-b230-final .wrap{width:min(100% - 42px,900px)!important}
  #ccf-b230-final .brandCluster{gap:10px!important}
  #ccf-b230-final .somosBrand{display:none!important}
  #ccf-b230-final .brandDivider{display:none!important}
  #ccf-b230-final .nav{gap:14px!important}
  #ccf-b230-final .navLinks{gap:14px!important}
  #ccf-b230-final .navLinks a{font-size:10px!important}
  #ccf-b230-final .hero{gap:24px!important}
  #ccf-b230-final .moduleTiles{grid-template-columns:repeat(3,minmax(0,1fr))!important}
  #ccf-b230-final .audienceBand{grid-template-columns:1fr!important}
  #ccf-b230-final .audienceTiles article:first-child{border-left:0!important}
}
/* Mobile: estructura deliberadamente vertical y sin solapamientos */
@media(max-width:700px){
  #ccf-b230-final .wrap{width:calc(100% - 32px)!important}
  #ccf-b230-final .nav{
    position:sticky!important;top:0!important;z-index:30!important;
    display:grid!important;grid-template-columns:minmax(0,1fr) 42px auto!important;
    gap:9px!important;min-height:66px!important;padding:9px 0!important;
  }
  #ccf-b230-final .brandCluster{min-width:0!important;gap:0!important}
  #ccf-b230-final .brand{min-width:0!important;gap:9px!important}
  #ccf-b230-final .brand .mark{width:38px!important;height:38px!important;flex:0 0 38px!important}
  #ccf-b230-final .brand b{font-size:12px!important;white-space:nowrap!important}
  #ccf-b230-final .brand small{font-size:8px!important;white-space:nowrap!important}
  #ccf-b230-final .brandDivider,#ccf-b230-final .somosBrand{display:none!important}
  #ccf-b230-final .mobileMenuToggle{
    display:grid!important;place-items:center!important;grid-column:2!important;
    width:40px!important;height:40px!important;padding:0!important;border:1px solid #dce6f1!important;
    border-radius:10px!important;background:#fff!important;color:#243c5a!important;font-size:19px!important;
  }
  #ccf-b230-final .nav .actions{
    grid-column:3!important;grid-row:1!important;display:flex!important;flex-direction:row!important;
    align-items:center!important;justify-content:flex-end!important;margin:0!important;gap:0!important;
  }
  #ccf-b230-final .nav .actions .downloadNav{display:none!important}
  #ccf-b230-final .nav .actions .btn{min-height:39px!important;padding:8px 11px!important;font-size:10px!important;white-space:nowrap!important}
  #ccf-b230-final .navLinks{
    display:none!important;position:absolute!important;left:0!important;right:0!important;top:calc(100% + 1px)!important;
    z-index:40!important;padding:9px!important;border:1px solid #e2eaf3!important;border-radius:0 0 13px 13px!important;
    background:#fff!important;box-shadow:0 14px 24px rgba(15,35,65,.10)!important;
    grid-template-columns:1fr 1fr!important;gap:2px 8px!important;
  }
  #ccf-b230-final .nav.is-open .navLinks{display:grid!important}
  #ccf-b230-final .navLinks a{padding:12px 10px!important;font-size:12px!important;border-radius:8px!important}
  #ccf-b230-final .navLinks a.active:after{display:none!important}
  #ccf-b230-final .navLinks a:hover{background:#f1f6fc!important}
  #ccf-b230-final .hero{
    display:flex!important;flex-direction:column!important;align-items:stretch!important;
    gap:22px!important;padding:37px 0 26px!important;min-height:0!important;
  }
  #ccf-b230-final .heroCopy{max-width:none!important}
  #ccf-b230-final .kicker{font-size:8px!important;padding:7px 10px!important}
  #ccf-b230-final .heroTitle,#ccf-b230-final h1{
    font-size:clamp(36px,9.5vw,48px)!important;line-height:1.04!important;
    letter-spacing:-.055em!important;margin:16px 0 14px!important;
  }
  #ccf-b230-final .hero p{font-size:14px!important;line-height:1.6!important;max-width:100%!important}
  #ccf-b230-final .heroCta{display:grid!important;grid-template-columns:1fr 1fr!important;gap:9px!important;margin-top:20px!important}
  #ccf-b230-final .heroCta .btn{width:100%!important;min-width:0!important;min-height:45px!important;padding:10px 8px!important;font-size:10px!important}
  #ccf-b230-final .proof{display:flex!important;gap:8px 13px!important;margin-top:15px!important;font-size:9px!important}
  #ccf-b230-final .heroVisual{width:100%!important;min-height:0!important;margin:0!important}
  #ccf-b230-final .ccf-device-stage{width:100%!important;padding:8px 0 22px!important}
  #ccf-b230-final .ccf-laptop{width:100%!important;padding:5px!important;border-radius:11px!important}
  #ccf-b230-final .ccf-laptop-screen{border-radius:6px!important}
  #ccf-b230-final .ccf-laptop-base{height:8px!important}
  #ccf-b230-final .ccf-phone{
    width:21%!important;min-width:0!important;max-width:110px!important;left:auto!important;right:1%!important;
    bottom:4px!important;padding:4px 3px!important;border-radius:16px!important;transform:rotate(2deg)!important;
  }
  #ccf-b230-final .ccf-phone img{border-radius:12px!important}
  #ccf-b230-final .benefitStrip{
    grid-template-columns:1fr 1fr!important;gap:0!important;margin:4px 0 20px!important;padding:8px!important;
    border-radius:13px!important;
  }
  #ccf-b230-final .benefitStrip article{
    min-height:65px!important;padding:10px 8px!important;border-right:0!important;
    border-bottom:1px solid #e8eef6!important;gap:9px!important;
  }
  #ccf-b230-final .benefitStrip article:nth-child(odd){border-right:1px solid #e8eef6!important}
  #ccf-b230-final .benefitStrip article:nth-child(n+3){border-bottom:0!important}
  #ccf-b230-final .benefitIcon{font-size:22px!important}
  #ccf-b230-final .benefitStrip b{font-size:10px!important}
  #ccf-b230-final .benefitStrip small{font-size:9px!important}
  #ccf-b230-final .section{padding:34px 0!important}
  #ccf-b230-final .sectionTitleRow{display:flex!important;flex-direction:column!important;align-items:flex-start!important;gap:8px!important}
  #ccf-b230-final .sectionHead h2,#ccf-b230-final .section h2{font-size:28px!important}
  #ccf-b230-final .sectionHead p{font-size:12px!important}
  #ccf-b230-final .desktopBreak{display:none!important}
  #ccf-b230-final .outlineLink{padding:7px 0!important;font-size:11px!important}
  #ccf-b230-final .moduleTiles{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:9px!important;margin-top:15px!important}
  #ccf-b230-final .moduleTile{min-height:118px!important;padding:13px!important;border-radius:12px!important}
  #ccf-b230-final .tileIcon{width:36px!important;height:36px!important;font-size:20px!important;margin-bottom:9px!important}
  #ccf-b230-final .moduleTile b{font-size:12px!important}
  #ccf-b230-final .moduleTile p{font-size:10px!important;line-height:1.45!important}
  #ccf-b230-final .audienceBand{
    display:block!important;margin:12px -16px 0!important;padding:28px 16px!important;
    border-radius:20px!important;
  }
  #ccf-b230-final .audienceIntro h2{font-size:27px!important}
  #ccf-b230-final .audienceIntro p{font-size:12px!important;line-height:1.55!important}
  #ccf-b230-final .audienceTiles{
    display:grid!important;grid-template-columns:1fr 1fr!important;gap:0!important;margin-top:16px!important;
  }
  #ccf-b230-final .audienceTiles article{
    min-height:120px!important;padding:13px 9px!important;border:0!important;
    border-top:1px solid #dbe5f0!important;border-radius:0!important;
  }
  #ccf-b230-final .audienceTiles article:nth-child(odd){border-right:1px solid #dbe5f0!important}
  #ccf-b230-final .audIcon{width:38px!important;height:38px!important;margin-bottom:7px!important}
  #ccf-b230-final .audIcon svg{width:32px!important;height:32px!important}
  #ccf-b230-final .audienceTiles b{font-size:11px!important}
  #ccf-b230-final .audienceTiles p{font-size:9px!important}
  #ccf-b230-final .keyBenefits{
    display:flex!important;flex-direction:column!important;align-items:stretch!important;gap:18px!important;
    padding:32px 0 22px!important;min-height:0!important;
  }
  #ccf-b230-final .benefitPhone{order:2!important;height:175px!important;overflow:hidden!important}
  #ccf-b230-final .benefitPhone>img{height:190px!important;max-width:48%!important}
  #ccf-b230-final .keyCopy{order:1!important}
  #ccf-b230-final .keyCopy h2{font-size:27px!important}
  #ccf-b230-final .keyCopy li{font-size:12px!important;line-height:1.6!important}
  #ccf-b230-final .cloudCard{order:3!important;display:grid!important;grid-template-columns:52px minmax(0,1fr)!important;align-items:center!important;gap:12px!important;min-height:0!important;padding:17px!important;border-radius:18px!important}
  #ccf-b230-final .cloudCard .cloudVisual{grid-row:1!important;width:52px!important;height:52px!important;flex-basis:52px!important;border-radius:15px!important}
  #ccf-b230-final .cloudCard .cloudVisual svg{width:33px!important;height:33px!important}
  #ccf-b230-final .cloudCard .cloudCopy{grid-column:2!important;grid-row:1!important}
  #ccf-b230-final .cloudCard .cloudEyebrow{font-size:8px!important;margin-bottom:5px!important}
  #ccf-b230-final .cloudCard b{font-size:15px!important}
  #ccf-b230-final .cloudCard p{font-size:10px!important;margin:5px 0 0!important}
  #ccf-b230-final .cloudFeatures{grid-column:1/-1!important;grid-row:2!important;gap:5px!important}
  #ccf-b230-final .cloudFeatures span{justify-content:center!important;font-size:7px!important;padding:7px 4px!important}
  #ccf-b230-final .cloudFeatures svg{width:11px!important;height:11px!important;flex-basis:11px!important}
  #ccf-b230-final .dynamicCta{
    display:flex!important;flex-direction:column!important;align-items:stretch!important;gap:12px!important;
    padding:22px 18px!important;margin:12px 0 28px!important;border-radius:14px!important;
  }
  #ccf-b230-final .ctaTitle{width:100%!important}
  #ccf-b230-final .dynamicCta h2{font-size:25px!important;line-height:1.12!important;margin:0!important;max-width:100%!important}
  #ccf-b230-final .dynamicCta p{
    display:block!important;width:100%!important;padding:0!important;border:0!important;
    font-size:12px!important;line-height:1.55!important;margin:0!important;max-width:100%!important;
  }
  #ccf-b230-final .dynamicCta .btn{width:100%!important;min-width:0!important;min-height:45px!important}
  #ccf-b230-final .footer{padding:22px 0 26px!important}
  #ccf-b230-final .footerTop{grid-template-columns:1fr 1fr!important;gap:20px 14px!important;padding:0 0 17px!important}
  #ccf-b230-final .footerIdentity{grid-column:1/-1!important}
  #ccf-b230-final .footerBrand .mark{width:40px!important;height:40px!important}
  #ccf-b230-final .footerColumn>b{font-size:11px!important}
  #ccf-b230-final .footerColumn a{font-size:10px!important;line-height:1.7!important}
  #ccf-b230-final .socialColumn{grid-column:1/-1!important}
  #ccf-b230-final .footerBottom{font-size:9px!important;line-height:1.55!important;text-align:center!important;padding-top:13px!important}
  #ccf-b230-final .moduleGallery{grid-template-columns:1fr 1fr!important;gap:9px!important}
  #ccf-b230-final .moduleImageButton{height:112px!important}
  #ccf-b230-final .moduleInfo{padding:10px!important}
  #ccf-b230-final .moduleInfo b{font-size:11px!important}
  #ccf-b230-final .moduleInfo p{font-size:9px!important}
  #ccf-b230-final .flowGrid{grid-template-columns:1fr 1fr!important;gap:8px!important}
  #ccf-b230-final .flowStep{min-height:115px!important;padding:12px!important}
  #ccf-b230-final .audienceGrid{grid-template-columns:1fr 1fr!important}
  #ccf-b230-final .faqGrid{grid-template-columns:1fr!important;gap:14px!important}
  #ccf-b230-final .faqQ{font-size:11px!important;padding:13px!important}
}
@media(max-width:390px){
  #ccf-b230-final .wrap{width:calc(100% - 26px)!important}
  #ccf-b230-final .brand b{font-size:11px!important}
  #ccf-b230-final .brand small{font-size:7px!important}
  #ccf-b230-final .nav{grid-template-columns:minmax(0,1fr) 38px auto!important;gap:6px!important}
  #ccf-b230-final .mobileMenuToggle{width:36px!important;height:38px!important}
  #ccf-b230-final .nav .actions .btn{padding:7px 8px!important;font-size:9px!important}
  #ccf-b230-final .heroTitle,#ccf-b230-final h1{font-size:36px!important}
  #ccf-b230-final .heroCta{grid-template-columns:1fr!important}
  #ccf-b230-final .proof{font-size:8px!important}
}


/* CCF 3.4 — flujo de valor con iconografía SVG y diseño responsive */
#ccf-b230-final .benefitStrip.benefitFlow{
  display:grid!important;grid-template-columns:repeat(4,minmax(0,1fr))!important;gap:0!important;
  align-items:stretch!important;margin:0 0 28px!important;padding:20px 12px!important;
  border:1px solid #dce8f6!important;border-radius:18px!important;
  background:linear-gradient(115deg,#f8fbff 0%,#eef6ff 52%,#f8fbff 100%)!important;
  box-shadow:0 8px 24px rgba(18,55,96,.055)!important;overflow:visible!important;
}
#ccf-b230-final .benefitFlow .flowStep{
  position:relative!important;display:flex!important;flex-direction:column!important;align-items:center!important;
  justify-content:flex-start!important;gap:11px!important;min-width:0!important;min-height:0!important;
  padding:4px 24px 3px!important;text-align:center!important;border:0!important;
  border-right:1px solid #d7e4f3!important;background:transparent!important;
}
#ccf-b230-final .benefitFlow .flowStep:last-child{border-right:0!important}
#ccf-b230-final .benefitFlow .flowStep:not(:last-child)::after{
  content:"➜";position:absolute;z-index:2;right:-13px;top:35px;display:grid;place-items:center;
  width:26px;height:26px;color:#087cf0;font-size:25px;font-weight:500;line-height:1;
  background:#f3f8ff;border-radius:50%;
}
#ccf-b230-final .benefitFlow .benefitIcon{
  display:grid!important;place-items:center!important;width:76px!important;height:76px!important;min-width:76px!important;
  margin:0!important;border:1px solid #d9eaff!important;border-radius:22px!important;
  color:#087cf0!important;background:linear-gradient(145deg,#fff,#e8f3ff)!important;
  box-shadow:0 5px 15px rgba(20,112,208,.08)!important;
}
#ccf-b230-final .benefitFlow .benefitIcon svg{
  display:block!important;width:43px!important;height:43px!important;fill:none!important;
  stroke:currentColor!important;stroke-width:2.2!important;stroke-linecap:round!important;stroke-linejoin:round!important;
}
#ccf-b230-final .benefitFlow .flowStepCopy{display:flex!important;flex-direction:column!important;align-items:center!important;gap:5px!important;max-width:230px!important}
#ccf-b230-final .benefitFlow .flowStepCopy b{display:block!important;color:#142943!important;font-size:13px!important;font-weight:750!important;line-height:1.3!important}
#ccf-b230-final .benefitFlow .flowStepCopy small{display:block!important;color:#64758b!important;font-size:11px!important;font-weight:400!important;line-height:1.45!important;margin:0!important}
@media(max-width:760px){
 #ccf-b230-final .benefitStrip.benefitFlow{
   grid-template-columns:minmax(0,1fr)!important;gap:0!important;margin:5px 0 22px!important;
   padding:10px 16px!important;border-radius:16px!important;
 }
 #ccf-b230-final .benefitFlow .flowStep{
   display:grid!important;grid-template-columns:62px minmax(0,1fr)!important;align-items:center!important;
   justify-items:start!important;gap:14px!important;padding:13px 5px!important;text-align:left!important;
   border-right:0!important;border-bottom:1px solid #dce8f6!important;
 }
 #ccf-b230-final .benefitFlow .flowStep:last-child{border-bottom:0!important}
 #ccf-b230-final .benefitFlow .flowStep:not(:last-child)::after{
   content:"↓";right:auto;left:22px;top:auto;bottom:-14px;width:24px;height:24px;
   font-size:22px;background:#f1f7ff;border:1px solid #dceaff;
 }
 #ccf-b230-final .benefitFlow .benefitIcon{width:58px!important;height:58px!important;min-width:58px!important;border-radius:17px!important}
 #ccf-b230-final .benefitFlow .benefitIcon svg{width:34px!important;height:34px!important}
 #ccf-b230-final .benefitFlow .flowStepCopy{align-items:flex-start!important;max-width:none!important;gap:3px!important}
 #ccf-b230-final .benefitFlow .flowStepCopy b{font-size:13px!important;text-align:left!important}
 #ccf-b230-final .benefitFlow .flowStepCopy small{font-size:11px!important;line-height:1.45!important;text-align:left!important}
}
@media(max-width:390px){
 #ccf-b230-final .benefitStrip.benefitFlow{padding:8px 12px!important}
 #ccf-b230-final .benefitFlow .flowStep{grid-template-columns:54px minmax(0,1fr)!important;gap:11px!important;padding:12px 3px!important}
 #ccf-b230-final .benefitFlow .benefitIcon{width:52px!important;height:52px!important;min-width:52px!important}
 #ccf-b230-final .benefitFlow .benefitIcon svg{width:30px!important;height:30px!important}
 #ccf-b230-final .benefitFlow .flowStepCopy b{font-size:12px!important}
 #ccf-b230-final .benefitFlow .flowStepCopy small{font-size:10px!important}
}


/* CCF 3.5 — galería de capturas reales de los módulos, completas y responsive */
#ccf-b230-final .modulesSection{padding-top:42px!important;padding-bottom:46px!important}
#ccf-b230-final .moduleTiles.moduleGallery{
 display:grid!important;grid-template-columns:repeat(6,minmax(0,1fr))!important;gap:12px!important;
 align-items:stretch!important;margin-top:22px!important;
}
#ccf-b230-final .moduleShowcase{
 display:flex!important;flex-direction:column!important;min-width:0!important;min-height:470px!important;
 height:470px!important;padding:8px!important;overflow:hidden!important;border:1px solid #dce6f1!important;
 border-radius:15px!important;background:#fff!important;box-shadow:0 8px 24px rgba(15,35,65,.055)!important;
}
#ccf-b230-final .moduleShot{
 display:flex!important;align-items:center!important;justify-content:center!important;
 width:100%!important;height:300px!important;flex:0 0 300px!important;min-width:0!important;overflow:hidden!important;
 border:1px solid #e1e8f0!important;border-radius:9px!important;background:#f2f6fb!important;line-height:0!important;
}
#ccf-b230-final .moduleShot img{
 display:block!important;width:auto!important;height:100%!important;max-width:100%!important;max-height:100%!important;
 object-fit:contain!important;object-position:center center!important;flex:0 1 auto!important;
}
#ccf-b230-final .moduleContent{display:flex!important;flex:1 1 auto!important;flex-direction:column!important;align-items:flex-start!important;padding:11px 2px 3px!important;min-width:0!important;min-height:0!important}
#ccf-b230-final .moduleContent>b{display:block!important;color:#10213b!important;font-size:15px!important;line-height:1.25!important;font-weight:800!important;letter-spacing:-.025em!important}
#ccf-b230-final .moduleContent>p{color:#607187!important;font-size:11px!important;line-height:1.55!important;margin:7px 0 12px!important;min-height:52px!important}
#ccf-b230-final .moduleDetail{width:100%!important;margin-top:auto!important;border-top:1px solid #e8eef5!important;padding-top:9px!important}
#ccf-b230-final .moduleDetail summary{
 display:flex!important;align-items:center!important;justify-content:space-between!important;gap:8px!important;
 width:100%!important;list-style:none!important;cursor:pointer!important;color:#087cf0!important;
 font-size:11px!important;font-weight:800!important;line-height:1.4!important;
}
#ccf-b230-final .moduleDetail summary::-webkit-details-marker{display:none!important}
#ccf-b230-final .moduleDetail summary span{font-size:16px!important;transition:transform .2s ease!important}
#ccf-b230-final .moduleDetail[open] summary span{transform:rotate(90deg)!important}
#ccf-b230-final .moduleDetail>p{margin:8px 0 2px!important;color:#64748b!important;font-size:10px!important;line-height:1.55!important}
@media(max-width:1100px){
 #ccf-b230-final .moduleTiles.moduleGallery{grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:14px!important}
}
@media(max-width:760px){
 #ccf-b230-final .modulesSection{padding-top:28px!important;padding-bottom:34px!important}
 #ccf-b230-final .moduleTiles.moduleGallery{grid-template-columns:minmax(0,1fr)!important;gap:16px!important;margin-top:17px!important}
 #ccf-b230-final .moduleShowcase{width:100%!important;max-width:520px!important;height:700px!important;min-height:700px!important;margin:0 auto!important;padding:12px!important;border-radius:16px!important}
 #ccf-b230-final .moduleShot{height:500px!important;flex:0 0 500px!important;border-radius:10px!important}
 #ccf-b230-final .moduleShot img{height:100%!important;width:auto!important;max-width:100%!important;object-fit:contain!important}
 #ccf-b230-final .moduleContent{padding:14px 2px 4px!important}
 #ccf-b230-final .moduleContent>b{font-size:18px!important}
 #ccf-b230-final .moduleContent>p{font-size:13px!important;line-height:1.6!important;margin:7px 0 13px!important;min-height:62px!important}
 #ccf-b230-final .moduleDetail{padding-top:11px!important}
 #ccf-b230-final .moduleDetail summary{font-size:13px!important;padding:2px 0!important}
 #ccf-b230-final .moduleDetail>p{font-size:12px!important;line-height:1.6!important}
}
@media(prefers-reduced-motion:reduce){#ccf-b230-final .moduleDetail summary span{transition:none!important}}

/* CCF 3.6 — iconografía semántica de los seis módulos */
#ccf-b230-final .moduleHeading{
 display:flex!important;align-items:center!important;gap:9px!important;min-height:30px!important;
 margin:0!important;
}
#ccf-b230-final .moduleHeadingIcon{
 display:grid!important;place-items:center!important;flex:0 0 30px!important;width:30px!important;height:30px!important;
 border:1px solid #d8eaff!important;border-radius:9px!important;background:#f0f7ff!important;color:#087cf0!important;
}
#ccf-b230-final .moduleHeadingIcon svg{
 display:block!important;width:21px!important;height:21px!important;fill:none!important;stroke:currentColor!important;
 stroke-width:1.8!important;stroke-linecap:round!important;stroke-linejoin:round!important;
}
#ccf-b230-final .moduleHeading>b{
 display:block!important;color:#10213b!important;font-size:15px!important;line-height:1.25!important;
 font-weight:800!important;letter-spacing:-.025em!important;
}
@media(max-width:760px){
 #ccf-b230-final .moduleHeading{gap:10px!important;min-height:34px!important}
 #ccf-b230-final .moduleHeadingIcon{flex-basis:34px!important;width:34px!important;height:34px!important;border-radius:10px!important}
 #ccf-b230-final .moduleHeadingIcon svg{width:23px!important;height:23px!important}
 #ccf-b230-final .moduleHeading>b{font-size:18px!important}
}

/* CCF 3.8 — alineación estricta de las seis vistas de módulo */
#ccf-b230-final .moduleTiles.moduleGallery{
 display:grid!important;grid-template-columns:repeat(6,minmax(0,1fr))!important;
 align-items:stretch!important;grid-auto-rows:1fr!important;
}
#ccf-b230-final .moduleShowcase{
 box-sizing:border-box!important;height:470px!important;min-height:470px!important;max-height:470px!important;
 display:flex!important;flex-direction:column!important;align-self:stretch!important;
}
#ccf-b230-final .moduleShot{
 box-sizing:border-box!important;width:100%!important;height:300px!important;min-height:300px!important;
 max-height:300px!important;flex:0 0 300px!important;align-self:stretch!important;
 display:flex!important;align-items:center!important;justify-content:center!important;overflow:hidden!important;
}
#ccf-b230-final .moduleShot img{
 display:block!important;box-sizing:border-box!important;width:100%!important;height:100%!important;
 min-width:0!important;min-height:0!important;max-width:100%!important;max-height:100%!important;
 flex:0 0 100%!important;object-fit:contain!important;object-position:center center!important;
}
#ccf-b230-final .moduleContent{
 box-sizing:border-box!important;flex:1 1 0!important;min-height:0!important;display:flex!important;
 flex-direction:column!important;align-items:stretch!important;overflow:hidden!important;
}
#ccf-b230-final .moduleHeading{flex:0 0 auto!important;min-height:30px!important}
#ccf-b230-final .moduleContent>p{flex:0 0 auto!important;min-height:52px!important}
#ccf-b230-final .moduleDetail{flex:0 0 auto!important;margin-top:auto!important}
@media(max-width:1100px) and (min-width:761px){
 #ccf-b230-final .moduleTiles.moduleGallery{grid-template-columns:repeat(3,minmax(0,1fr))!important}
}
@media(max-width:760px){
 #ccf-b230-final .moduleTiles.moduleGallery{grid-template-columns:minmax(0,1fr)!important;grid-auto-rows:auto!important}
 #ccf-b230-final .moduleShowcase{height:700px!important;min-height:700px!important;max-height:700px!important}
 #ccf-b230-final .moduleShot{height:500px!important;min-height:500px!important;max-height:500px!important;flex:0 0 500px!important}
 #ccf-b230-final .moduleShot img{width:100%!important;height:100%!important;max-width:100%!important;max-height:100%!important;object-fit:contain!important}
}

/* HERO · composición oficial de teléfono + notebook */
#ccf-b230-final .heroVisual{
 position:relative!important;display:flex!important;align-items:center!important;justify-content:center!important;
 width:calc(100% + 34px)!important;min-height:0!important;margin-left:-16px!important;padding:0!important;
 overflow:visible!important;border:0!important;border-radius:0!important;background:none!important;box-shadow:none!important;
}
#ccf-b230-final .ccfHeroDevices{
 display:block!important;width:100%!important;height:auto!important;max-width:none!important;max-height:none!important;
 object-fit:contain!important;object-position:center!important;border:0!important;border-radius:0!important;
 filter:drop-shadow(0 20px 28px rgba(4,20,40,.18));
}
@media(max-width:1100px) and (min-width:761px){
 #ccf-b230-final .heroVisual{width:calc(100% + 18px)!important;margin-left:-8px!important}
}
@media(max-width:760px){
 #ccf-b230-final .heroVisual{width:100%!important;margin:0!important;min-height:0!important;padding:0!important;overflow:visible!important;background:none!important}
 #ccf-b230-final .ccfHeroDevices{width:100%!important;max-width:100%!important;height:auto!important;max-height:none!important;filter:drop-shadow(0 14px 20px rgba(4,20,40,.16))}
}


/* CCF 4.2 — CTA escritorio: una sola fila y alineación vertical */
@media (min-width:1101px){
  #ccf-b230-final .dynamicCta{
    position:relative!important;
    display:grid!important;
    grid-template-columns:minmax(0,1.25fr) minmax(230px,.9fr) minmax(250px,1fr)!important;
    grid-template-rows:minmax(88px,auto)!important;
    align-items:center!important;
    justify-items:stretch!important;
    column-gap:clamp(24px,3vw,48px)!important;
    row-gap:0!important;
    min-height:136px!important;
    padding:24px 30px!important;
  }
  #ccf-b230-final .dynamicCta>#contacto{
    position:absolute!important;
    inset:0 auto auto 0!important;
    width:0!important;height:0!important;
    overflow:hidden!important;
  }
  #ccf-b230-final .dynamicCta .ctaTitle{
    grid-column:1!important;grid-row:1!important;
    align-self:center!important;justify-self:start!important;
    width:100%!important;margin:0!important;
  }
  #ccf-b230-final .dynamicCta>p{
    grid-column:2!important;grid-row:1!important;
    align-self:center!important;justify-self:stretch!important;
    display:flex!important;align-items:center!important;
    min-height:40px!important;margin:0!important;
    padding-left:22px!important;
    border-left:1px solid #cfdeef!important;
  }
  #ccf-b230-final .dynamicCta>.btn{
    grid-column:3!important;grid-row:1!important;
    align-self:center!important;justify-self:end!important;
    width:100%!important;max-width:340px!important;
    min-width:0!important;min-height:46px!important;
    white-space:nowrap!important;
  }
}


/* CCF 4.3 — identidad oficial y footer simplificado */
#ccf-b230-final .ccfLogo{
  display:block!important;width:46px!important;height:46px!important;
  flex:0 0 46px!important;object-fit:contain!important;border-radius:12px!important;
  box-shadow:0 7px 22px rgba(0,110,255,.18)!important;
}
#ccf-b230-final .footerCcfLogo{
  display:block!important;width:54px!important;height:54px!important;
  flex:0 0 54px!important;object-fit:contain!important;border-radius:13px!important;
}
#ccf-b230-final .footerTop{
  display:grid!important;grid-template-columns:minmax(0,1.5fr) minmax(190px,.8fr) minmax(160px,.7fr)!important;
  align-items:start!important;gap:clamp(28px,5vw,76px)!important;
}
#ccf-b230-final .footerIdentity{display:flex!important;flex-direction:column!important;align-items:flex-start!important;gap:15px!important}
#ccf-b230-final .footerBrand{display:flex!important;align-items:center!important;gap:12px!important}
#ccf-b230-final .footerBrand b{font-size:14px!important;letter-spacing:0!important}
#ccf-b230-final .footerBrand small{font-size:10px!important;letter-spacing:0!important}
#ccf-b230-final .footerSomos{
  display:flex!important;flex-direction:column!important;align-items:flex-start!important;gap:6px!important;
  color:#9db4cc!important;text-decoration:none!important;font-size:10px!important;
}
#ccf-b230-final .footerSomos img{
  display:block!important;width:150px!important;max-width:100%!important;height:auto!important;max-height:54px!important;
  object-fit:contain!important;object-position:left center!important;margin:0!important;
}
#ccf-b230-final .footerColumn{display:flex!important;flex-direction:column!important;align-items:flex-start!important;gap:10px!important}
#ccf-b230-final .footerColumn>b{font-size:12px!important;color:#f1f7ff!important;margin-bottom:2px!important}
#ccf-b230-final .footerColumn>a{font-size:11px!important;color:#a9bdd1!important;text-decoration:none!important;white-space:normal!important}
#ccf-b230-final .footerColumn>a:hover,#ccf-b230-final .footerBottom a:hover{color:#49c7ff!important}
#ccf-b230-final .socialLinks{display:flex!important;gap:10px!important}
#ccf-b230-final .socialLinks a{
  display:grid!important;place-items:center!important;width:34px!important;height:34px!important;
  border:1px solid rgba(102,190,255,.25)!important;border-radius:50%!important;
  background:rgba(55,151,235,.12)!important;color:#dceeff!important;font-size:15px!important;
  font-weight:800!important;text-decoration:none!important;
}
#ccf-b230-final .footerBottom{border-top:1px solid rgba(120,180,230,.16)!important;margin-top:24px!important;padding-top:16px!important}
#ccf-b230-final .footerBottom a{color:inherit!important;text-decoration:none!important;font-weight:700!important}
@media(max-width:760px){
 #ccf-b230-final .footerTop{grid-template-columns:1fr 1fr!important;gap:24px 18px!important}
 #ccf-b230-final .footerIdentity{grid-column:1/-1!important}
 #ccf-b230-final .footerLegal,#ccf-b230-final .socialColumn{min-width:0!important}
 #ccf-b230-final .footerBottom{line-height:1.7!important}
}
@media(max-width:420px){
 #ccf-b230-final .footerTop{grid-template-columns:1fr!important}
 #ccf-b230-final .footerIdentity{grid-column:auto!important}
}

`;


 document.head.appendChild(s);
}

function html(){
 return `<div id="${ID}" role="dialog" aria-label="Portal de acceso al Centro de Control Financiero">
 <div class="page"><div class="orb a"></div><div class="orb b"></div><div class="wrap">
 <nav class="nav">
  <div class="brandCluster">
   <a class="brand" href="#inicio" aria-label="Control Financiero, inicio"><img class="ccfLogo" src="./ccf-logo-original.png" alt="Logo Centro de Control Financiero"><div><b>Control Financiero<sup>®</sup></b><small>Centro de Control Financiero</small></div></a>
   <span class="brandDivider"></span><a class="somosBrand" href="https://www.somossoftware.net" target="_blank" rel="noopener" aria-label="Un producto de Somos Software"><small>Un producto de</small><img src="somos-software-logo-oficial.png" alt="Somos Software · Innovación Digital" style="display:block;width:112px;height:auto;max-height:34px;object-fit:contain;object-position:left center"></a>
  </div>
  <button class="mobileMenuToggle" type="button" aria-label="Abrir menú" aria-expanded="false" aria-controls="ccf-main-navigation">☰</button>
  <div class="navLinks" id="ccf-main-navigation" aria-label="Navegación principal">
   <a class="active" href="#inicio">Inicio</a><a href="#caracteristicas">Características</a><a href="#modulos">Módulos</a><a href="#planes">Planes</a><a href="#contacto">Preguntas</a><a href="#contacto">Contacto</a>
  </div>
  <div class="actions"><a class="btn downloadNav" href="https://apk.controlfinanciero.cl/app-control-financiero.apk" download="app-control-financiero.apk" rel="noopener">↓ Descargar APK</a><button class="btn primary" data-b230-open="login">♙ Iniciar sesión</button></div>
 </nav>
 <main>
 <section class="hero" id="inicio">
  <div class="heroCopy">
   <span class="kicker">GESTIÓN · CONTROL · PROYECCIÓN</span>
   <h1 class="heroTitle">Convierte tus finanzas<br>en un sistema de<br><span class="grad">control inteligente.</span></h1>
   <p>Registra tus movimientos, organiza tus compromisos, controla deudas, proyecta tu liquidez y toma decisiones con una visión financiera integrada, simple y profesional.</p>
   <div class="heroCta"><button class="btn primary" data-b230-open="register">Crear mi cuenta gratis&nbsp; →</button><a class="btn demoBtn" href="#modulos">▷&nbsp; Ver demostración</a></div>
   <div class="proof"><span>✓&nbsp; Rápido y fácil de usar</span><span>✓&nbsp; Desde cualquier dispositivo</span><span>✓&nbsp; 100% en la nube</span></div>
  </div>
  <div class="heroVisual" aria-label="Control Financiero en teléfono y notebook">
   <img class="ccfHeroDevices" src="./B230-PORTAL-ACCESO-FINAL-PREMIUM-1.1-assets/hero-dispositivos-oficial.png" alt="Control Financiero abierto en un teléfono y un notebook" fetchpriority="high" decoding="async">
  </div>
 </section>
 <section class="benefitStrip benefitFlow" id="value-props" aria-label="Cómo te ayuda Control Financiero">
  <article class="flowStep">
   <span class="benefitIcon" aria-hidden="true"><svg viewBox="0 0 48 48" focusable="false"><path d="M5 15.5a3.5 3.5 0 0 1 3.5-3.5h11l4 4H39a4 4 0 0 1 4 4v17a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4z"/><path d="M5 21h38M15 7h12l5 5M21 28v10M16 33h10"/><path d="M35 28v10M30 33h10"/></svg></span>
   <div class="flowStepCopy"><b>Centraliza tu información</b><small>Reúne tus datos financieros en un solo lugar.</small></div>
  </article>
  <article class="flowStep">
   <span class="benefitIcon" aria-hidden="true"><svg viewBox="0 0 48 48" focusable="false"><rect x="5" y="6" width="38" height="29" rx="4"/><path d="M18 42h12M24 35v7M12 27v-6M20 27V15M28 27v-9M36 27V12"/><path d="M11 30h26"/></svg></span>
   <div class="flowStepCopy"><b>Analiza tu realidad</b><small>Comprende tus ingresos y gastos con reportes visuales.</small></div>
  </article>
  <article class="flowStep">
   <span class="benefitIcon" aria-hidden="true"><svg viewBox="0 0 48 48" focusable="false"><rect x="6" y="9" width="36" height="33" rx="4"/><path d="M15 5v9M33 5v9M6 18h36"/><path d="M14 26h5M14 33h5M25 26h5M25 33h5"/><circle cx="34" cy="33" r="8"/><path d="m30.5 33 2.3 2.3 4.8-5"/></svg></span>
   <div class="flowStepCopy"><b>Planifica tu futuro</b><small>Define metas y anticipa tus próximos compromisos.</small></div>
  </article>
  <article class="flowStep">
   <span class="benefitIcon" aria-hidden="true"><svg viewBox="0 0 48 48" focusable="false"><path d="M6 41h37M10 36V25h7v11M22 36V17h7v19M34 36V9h7v27"/><path d="m8 18 11-8 8 3L40 3"/><path d="M33 3h7v7"/></svg></span>
   <div class="flowStepCopy"><b>Toma mejores decisiones</b><small>Actúa con información clara y datos confiables.</small></div>
  </article>
 </section>
 <section class="section modulesSection" id="modulos">
  <div class="sectionTitleRow"><div class="sectionHead"><span class="eyebrow">TODO EN UN MISMO SISTEMA</span><h2>Módulos principales</h2><p>Herramientas conectadas para comprender tu presente,<br class="desktopBreak"> ordenar tu información y proyectar lo que viene.</p></div><a class="outlineLink" href="#caracteristicas">Conoce todos los módulos&nbsp; →</a></div>
  <div class="moduleTiles moduleGallery" aria-label="Vistas de los seis módulos principales">
   <article class="moduleTile moduleShowcase" id="modulo-resumen">
    <div class="moduleShot"><img src="${IMG_RESUMEN}" alt="Captura completa del módulo Resumen de Control Financiero" loading="lazy" decoding="async"></div>
    <div class="moduleContent"><div class="moduleHeading"><span class="moduleHeadingIcon"><svg viewBox="0 0 32 32" aria-hidden="true" focusable="false"><rect x="3.5" y="4" width="25" height="24" rx="5"/><path d="M9 21v-5M15.5 21V10M22 21v-8M7.5 24h17"/><path d="m8 12 5-3 4 2 7-5"/></svg></span><b>Resumen</b></div><p>Consulta tu liquidez, ingresos, gastos y saldo proyectado en una vista financiera integrada.</p>
     <details class="moduleDetail"><summary>Ver detalle <span aria-hidden="true">→</span></summary><p>Revisa los indicadores principales del período y comprende rápidamente tu situación financiera actual y proyectada.</p></details>
    </div>
   </article>
   <article class="moduleTile moduleShowcase" id="modulo-presupuesto">
    <div class="moduleShot"><img src="${IMG_PRESUPUESTO}" alt="Captura completa del módulo Presupuesto de Control Financiero" loading="lazy" decoding="async"></div>
    <div class="moduleContent"><div class="moduleHeading"><span class="moduleHeadingIcon"><svg viewBox="0 0 32 32" aria-hidden="true" focusable="false"><circle cx="16" cy="16" r="12"/><path d="M16 4v12h12M16 16l-8.5 8.5"/><path d="M16 8a8 8 0 0 1 8 8"/></svg></span><b>Presupuesto</b></div><p>Planifica ingresos y gastos, distribuye recursos y compara lo previsto con lo ejecutado.</p>
     <details class="moduleDetail"><summary>Ver detalle <span aria-hidden="true">→</span></summary><p>Organiza líneas presupuestarias por categoría, monto y prioridad para anticipar resultados y mantener tus objetivos bajo control.</p></details>
    </div>
   </article>
   <article class="moduleTile moduleShowcase" id="modulo-deudas">
    <div class="moduleShot"><img src="${IMG_DEUDAS}" alt="Captura completa del módulo Deudas de Control Financiero" loading="lazy" decoding="async"></div>
    <div class="moduleContent"><div class="moduleHeading"><span class="moduleHeadingIcon"><svg viewBox="0 0 32 32" aria-hidden="true" focusable="false"><path d="M8 3.5h11l6 6V28H8a2 2 0 0 1-2-2V5.5a2 2 0 0 1 2-2Z"/><path d="M19 3.5v6h6M11 15h11M11 19h8"/><circle cx="21.5" cy="23" r="4.5"/><path d="M21.5 20.5v5M23 21.5h-2a1.2 1.2 0 0 0 0 2.4h1a1.2 1.2 0 0 1 0 2.4h-2"/></svg></span><b>Deudas</b></div><p>Centraliza acreedores, saldos pendientes, cuotas y próximos vencimientos.</p>
     <details class="moduleDetail"><summary>Ver detalle <span aria-hidden="true">→</span></summary><p>Reconstruye tus compromisos y sigue su evolución con información sobre montos originales, pagos, cuotas pendientes y obligaciones próximas.</p></details>
    </div>
   </article>
   <article class="moduleTile moduleShowcase" id="modulo-movimientos">
    <div class="moduleShot"><img src="${IMG_MOVIMIENTOS}" alt="Captura completa del módulo Movimientos de Control Financiero" loading="lazy" decoding="async"></div>
    <div class="moduleContent"><div class="moduleHeading"><span class="moduleHeadingIcon"><svg viewBox="0 0 32 32" aria-hidden="true" focusable="false"><path d="M16 4v23M9.5 10.5 16 4l6.5 6.5"/><path d="M6 17h7M19 17h7M9 17l-3 3 3 3M23 17l3 3-3 3"/><path d="M8 27h16"/></svg></span><b>Movimientos</b></div><p>Registra, consulta y administra tus ingresos y gastos desde un solo lugar.</p>
     <details class="moduleDetail"><summary>Ver detalle <span aria-hidden="true">→</span></summary><p>Agrega operaciones, busca por categoría o descripción y filtra los registros para mantener un historial financiero ordenado.</p></details>
    </div>
   </article>
   <article class="moduleTile moduleShowcase" id="modulo-calendario">
    <div class="moduleShot"><img src="${IMG_CALENDARIO}" alt="Captura completa del Calendario 360 de Control Financiero" loading="lazy" decoding="async"></div>
    <div class="moduleContent"><div class="moduleHeading"><span class="moduleHeadingIcon"><svg viewBox="0 0 32 32" aria-hidden="true" focusable="false"><rect x="4" y="6.5" width="24" height="22" rx="4"/><path d="M10 3.5v6M22 3.5v6M4 12h24"/><path d="M10 17h3M18 17h4M10 22h3M18 22h4"/><path d="m18 25 2 2 4-4"/></svg></span><b>Calendario</b></div><p>Visualiza el flujo diario, los compromisos y los movimientos de cada período.</p>
     <details class="moduleDetail"><summary>Ver detalle <span aria-hidden="true">→</span></summary><p>Explora el calendario financiero con ingresos reales y proyectados, egresos, obligaciones y saldo estimado para cada día.</p></details>
    </div>
   </article>
   <article class="moduleTile moduleShowcase" id="modulo-planificacion">
    <div class="moduleShot"><img src="${IMG_PLANIFICACION}" alt="Captura completa del módulo Planificación financiera de Control Financiero" loading="lazy" decoding="async"></div>
    <div class="moduleContent"><div class="moduleHeading"><span class="moduleHeadingIcon"><svg viewBox="0 0 32 32" aria-hidden="true" focusable="false"><circle cx="15" cy="16" r="11.5"/><circle cx="15" cy="16" r="6.5"/><circle cx="15" cy="16" r="2"/><path d="m17 14 10-10M21 4h6v6"/></svg></span><b>Planificación</b></div><p>Proyecta tu liquidez y anticipa escenarios a partir de ingresos y obligaciones.</p>
     <details class="moduleDetail"><summary>Ver detalle <span aria-hidden="true">→</span></summary><p>Actualiza tu escenario financiero, identifica posibles mínimos de liquidez y evalúa con anticipación el efecto de tus compromisos.</p></details>
    </div>
   </article>
  </div>
 </section>
 <section class="audienceBand" id="usuarios">
  <div class="audienceIntro"><span class="eyebrow">DISEÑADO PARA TI</span><h2>Una solución para cada realidad</h2><p>Control Financiero se adapta a tus necesidades, ya seas emprendedor, profesional, empresa o simplemente quieras ordenar tus finanzas personales.</p></div>
  <div class="audienceTiles">
   <article><span class="audIcon blue" aria-hidden="true"><svg viewBox="0 0 48 48" focusable="false"><path d="M5 20h38L39 10H9L5 20Z"/><path d="M8 20v19h32V20M5 20c0 4 6 5 8 1 2 4 8 4 10 0 2 4 8 4 10 0 2 4 8 3 10-1"/><path d="M15 39V27h8v12M29 29v-5h5v5M29 34h5v5"/></svg></span><b>Emprendedores</b><p>Controla ingresos,<br>gastos y la rentabilidad<br>de tu negocio.</p></article>
   <article><span class="audIcon indigo" aria-hidden="true"><svg viewBox="0 0 48 48" focusable="false"><path d="M5 41V18l11-6v29M16 41V7h17v34M33 19l10 5v17M2 41h44"/><path d="M21 13h3M27 13h2M21 19h3M27 19h2M21 25h3M27 25h2M21 31h3M27 31h2M9 23h2M9 29h2M37 29h2M37 34h2"/></svg></span><b>PYMEs</b><p>Gestiona tus finanzas,<br>compromisos y<br>proyecciones.</p></article>
   <article><span class="audIcon navy" aria-hidden="true"><svg viewBox="0 0 48 48" focusable="false"><rect x="5" y="13" width="29" height="25" rx="4"/><path d="M15 13V9a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v4M5 22h29M18 22v4h4v-4"/><circle cx="36" cy="33" r="8"/><path d="M31 43c.8-3.2 2.5-4.8 5-4.8s4.2 1.6 5 4.8"/></svg></span><b>Profesionales</b><p>Organiza tus ingresos,<br>gastos y obligaciones<br>mensuales.</p></article>
   <article><span class="audIcon violet" aria-hidden="true"><svg viewBox="0 0 48 48" focusable="false"><path d="m4 22 20-16 20 16M9 19v23h30V19M19 42V28h10v14"/><path d="M24 24c-2.2-3.2-7-2.2-7 1.5 0 3.2 7 7 7 7s7-3.8 7-7c0-3.7-4.8-4.7-7-1.5Z"/></svg></span><b>Hogar</b><p>Administra tu<br>economía familiar de<br>forma simple y clara.</p></article>
  </div>
 </section>
 <section class="keyBenefits" id="caracteristicas">
  <div class="benefitPhone"><img src="${IMG_SCREEN_MOBILE}" alt="Aplicación móvil de Control Financiero" loading="lazy"><span class="floatIcon chartIcon">▥</span><span class="floatIcon pieIcon">◷</span></div>
  <div class="keyCopy"><span class="eyebrow">BENEFICIOS CLAVE</span><h2>Más control. Más claridad. Más tranquilidad.</h2>
   <ul><li>Visión completa de tus finanzas en tiempo real.</li><li>Control de deudas y compromisos.</li><li>Planificación de metas y ahorro.</li><li>Reportes visuales y fáciles de entender.</li><li>Acceso desde cualquier dispositivo.</li></ul>
  </div>
  <aside class="cloudCard" aria-label="Servicio en la nube, seguro y sincronizado">
   <span class="cloudVisual" aria-hidden="true"><svg viewBox="0 0 48 48"><path d="M13.5 31.5h21a7.5 7.5 0 0 0 .8-15 11.5 11.5 0 0 0-22.1-1.7A8.5 8.5 0 0 0 13.5 31.5Z"/><path d="m24 21 7 3v5.5c0 4.2-2.8 7.3-7 9.5-4.2-2.2-7-5.3-7-9.5V24l7-3Z"/><path d="m21 29 2.1 2.1 4.2-4.4"/></svg></span>
   <div class="cloudCopy"><span class="cloudEyebrow">100% EN LA NUBE</span><b>Tus finanzas, siempre contigo</b><p>Accede a tu información desde cualquier dispositivo, con datos sincronizados y protegidos.</p></div>
   <div class="cloudFeatures"><span><svg viewBox="0 0 16 16"><path d="M8 1.5 13 3.5v4c0 3.1-2 5.4-5 7-3-1.6-5-3.9-5-7v-4l5-2Z"/><path d="m5.5 7.8 1.6 1.6 3.4-3.5"/></svg>Protección</span><span><svg viewBox="0 0 16 16"><path d="M13.5 5.5A5.5 5.5 0 0 0 4 3.2L2.5 5M2.5 2.5V5h2.5M2.5 10.5a5.5 5.5 0 0 0 9.5 2.3l1.5-1.8M13.5 13.5V11H11"/></svg>Sincronización</span><span><svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="6.2"/><path d="M8 4.3v4l2.7 1.6"/></svg>Disponible 24/7</span></div>
  </aside>
 </section>
 <section class="dynamicCta" id="planes"><span id="contacto"></span><div class="ctaRocket">🚀</div><div class="ctaTitle"><h2>Comienza hoy a<br>controlar tus finanzas</h2></div><p>Crea tu cuenta gratis y toma el control<br>de tu vida financiera.</p><button class="btn primary" data-b230-open="register">Crear mi cuenta gratis&nbsp; →</button></section>
 <footer class="footer premiumFooter">
  <div class="footerTop">
   <div class="footerIdentity">
    <div class="footerBrand"><img class="footerCcfLogo" src="./ccf-logo-original.png" alt="Logo Centro de Control Financiero"><div><b>Control Financiero<sup>®</sup></b><small>Centro de Control Financiero</small></div></div>
    <a class="footerSomos" href="https://www.somossoftware.net" target="_blank" rel="noopener" aria-label="Visitar Somos Software">Un producto de <img src="somos-software-logo-oficial.png" alt="Somos Software · Innovación Digital"></a>
   </div>
   <div class="footerColumn footerLegal"><b>Legal</b>
    <a href="./legal/terminos-y-condiciones.html">Términos y condiciones</a>
    <a href="./legal/politica-de-privacidad.html">Política de privacidad</a>
    <a href="./legal/uso-de-datos.html">Uso de datos</a>
   </div>
   <div class="footerColumn socialColumn"><b>Síguenos</b><div class="socialLinks">
    <a href="https://www.facebook.com/share/1E1KdWDYBE/" target="_blank" rel="noopener noreferrer" aria-label="Facebook Somos Software">f</a>
    <a href="https://www.instagram.com/somos.software/" target="_blank" rel="noopener noreferrer" aria-label="Instagram Somos Software">◎</a>
   </div></div>
  </div>
  <div class="footerBottom">© 2026 <a href="https://www.somossoftware.net" target="_blank" rel="noopener">Somos Software®</a>. Todos los derechos reservados. | Control Financiero® (CCF)</div>
 </footer>
 </div></div></div>`;
}



function mountInteractiveContent(){
 const root=document.getElementById(ID); if(!root)return;
 const items={resumen:IMG_RESUMEN,calendario:IMG_CALENDARIO,movimientos:IMG_MOVIMIENTOS,presupuesto:IMG_PRESUPUESTO,deudas:IMG_DEUDAS,planificacion:IMG_PLANIFICACION};
 const titles={resumen:'Resumen',calendario:'Calendario',movimientos:'Movimientos',presupuesto:'Presupuesto',deudas:'Deudas',planificacion:'Planificación'};
 const caps={resumen:'Panel financiero con liquidez, ingresos, gastos y resultado.',calendario:'Vista temporal de compromisos, pagos y eventos.',movimientos:'Registro de ingresos y gastos.',presupuesto:'Planificación y ejecución presupuestaria.',deudas:'Reconstrucción y control de obligaciones.',planificacion:'Escenario financiero proyectado.'};
 let lb=root.querySelector('.lightbox');
 if(!lb){
  lb=document.createElement('div');lb.className='lightbox';lb.setAttribute('aria-hidden','true');
  lb.innerHTML='<div class="lightboxPanel" role="dialog" aria-modal="true" aria-label="Vista ampliada del módulo"><button class="lightboxClose" type="button" aria-label="Cerrar">×</button><img alt=""><div class="lightboxTitle"></div><div class="lightboxCaption"></div></div>';
  root.appendChild(lb);
 }
 const image=lb.querySelector('img'),title=lb.querySelector('.lightboxTitle'),caption=lb.querySelector('.lightboxCaption');
 const close=()=>{lb.classList.remove('isOpen');lb.setAttribute('aria-hidden','true');document.body.classList.remove('b230-lightbox-open');};
 const open=key=>{image.src=items[key];image.alt=titles[key]+' — vista ampliada';title.textContent=titles[key];caption.textContent=caps[key];lb.classList.add('isOpen');lb.setAttribute('aria-hidden','false');document.body.classList.add('b230-lightbox-open');};
 root.querySelectorAll('[data-b230-image]').forEach(btn=>btn.addEventListener('click',()=>open(btn.dataset.b230Image)));
 lb.addEventListener('click',e=>{if(e.target===lb)close()});lb.querySelector('.lightboxClose').addEventListener('click',close);
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&lb.classList.contains('isOpen'))close()},{passive:true});
 root.querySelectorAll('.faqQ').forEach(q=>q.addEventListener('click',()=>q.closest('.faqItem')?.classList.toggle('open')));
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
function bind(){
 const p=document.getElementById(ID);if(!p)return;
 p.querySelectorAll('[data-b230-open]').forEach(b=>b.addEventListener('click',()=>openExistingAuth(b.dataset.b230Open)));
 const nav=p.querySelector('.nav'),toggle=p.querySelector('.mobileMenuToggle');
 if(nav&&toggle){
  toggle.addEventListener('click',()=>{const open=nav.classList.toggle('is-open');toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'Cerrar menú':'Abrir menú');toggle.textContent=open?'×':'☰'});
  nav.querySelectorAll('.navLinks a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('is-open');toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-label','Abrir menú');toggle.textContent='☰'}));
 }
}
async function watchAuth(){
 for(let i=0;i<80;i++){
  const c=window.supabaseClient||window.__B23273_CLIENT__||window.__B23270_CLIENT__||window.__B23269_CLIENT__;
  if(c?.auth){try{const {data}=await c.auth.getSession();if(data?.session){removePortal();return}
   c.auth.onAuthStateChange((_e,session)=>{if(session)removePortal()})}catch(_){}return}
  await sleep(100);
 }
}
function boot(){style();if(!document.getElementById(ID))document.body.insertAdjacentHTML('afterbegin',html());animatePremiumHero();bind();mountInteractiveContent();watchAuth()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
