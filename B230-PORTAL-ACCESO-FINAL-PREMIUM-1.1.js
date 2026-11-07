/* CCF B230 — PORTAL PREMIUM / LANDING RESPONSIVE
   B230-PREMIUM-1.3 — REDISEÑO CCF PREMIUM RESPONSIVE
   SOLO landing inicial. No autentica, no crea Supabase y no modifica index.html.
*/
(function(){
'use strict';
if(window.__CCF_B230_PREMIUM_11__)return;
window.__CCF_B230_PREMIUM_11__=true;

const ID='ccf-b230-final';
const $=(s,r=document)=>r.querySelector(s);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const IMG_HERO_LAPTOP='./B230-PORTAL-ACCESO-FINAL-PREMIUM-1.1-assets/hero-laptop.jpg';
const IMG_HERO_PHONE='./B230-PORTAL-ACCESO-FINAL-PREMIUM-1.1-assets/hero-phone.jpg';
const IMG_HERO_COMPOSITION='./B230-PORTAL-ACCESO-FINAL-PREMIUM-1.1-assets/hero-reference-devices.jpg';
const IMG_HERO_MOBILE='./B230-PORTAL-ACCESO-FINAL-PREMIUM-1.1-assets/hero-reference-phone.jpg';
const IMG_SCREEN_DESKTOP='./B230-PORTAL-ACCESO-FINAL-PREMIUM-1.1-assets/hero-screen-desktop.jpg';
const IMG_SCREEN_MOBILE='./B230-PORTAL-ACCESO-FINAL-PREMIUM-1.1-assets/hero-screen-mobile.jpg';
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

/* CCF LANDING — REDISEÑO PREMIUM RESPONSIVE 1.3.0 */
#ccf-b230-final{
 --ccf-bg:#041326;--ccf-panel:#0b2742;--ccf-line:rgba(112,190,235,.20);
 --ccf-cyan:#11d5ed;--ccf-blue:#168ff0;--ccf-text:#f4f8ff;--ccf-muted:#a9bfd3;
 background:
 radial-gradient(ellipse at 78% 17%,rgba(0,133,255,.28),transparent 34%),
 radial-gradient(ellipse at 4% 48%,rgba(0,208,220,.09),transparent 30%),
 linear-gradient(125deg,#031020 0%,#061a30 58%,#071b32 100%);
 color:var(--ccf-text);font-family:Inter,ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;
}
#ccf-b230-final .wrap{width:min(1440px,calc(100% - 88px))}
#ccf-b230-final .nav{min-height:76px;padding:0 16px;border-bottom:1px solid rgba(124,190,230,.16);
 background:rgba(3,15,29,.88);backdrop-filter:blur(18px)}
#ccf-b230-final .brand{gap:13px;text-decoration:none}
#ccf-b230-final .mark{width:46px;height:46px;border-radius:13px;color:white;
 background:linear-gradient(145deg,#087ef0,#079ff7);box-shadow:0 8px 22px rgba(0,139,255,.25);
 font-size:14px;letter-spacing:-.04em}
#ccf-b230-final .brand b{font-size:17px;letter-spacing:-.035em;color:#f4f8ff}
#ccf-b230-final .brand small{font-size:10px;letter-spacing:.01em;color:#91a9bf}
#ccf-b230-final .navLinks{display:flex;align-items:center;justify-content:center;gap:clamp(16px,2.2vw,34px)}
#ccf-b230-final .navLinks a{position:relative;color:#d5e3f0;text-decoration:none;font-size:12px;font-weight:750;padding:29px 0}
#ccf-b230-final .navLinks a:hover,#ccf-b230-final .navLinks a.active{color:#fff}
#ccf-b230-final .navLinks a.active:after{content:"";position:absolute;left:0;right:0;bottom:18px;height:3px;border-radius:4px;background:var(--ccf-cyan);box-shadow:0 0 12px rgba(17,213,237,.8)}
#ccf-b230-final .actions{gap:10px;align-items:center;flex-wrap:nowrap}
#ccf-b230-final .btn{min-height:45px;padding:11px 18px;border-radius:12px;font-size:12px;font-weight:850;border:1px solid rgba(188,218,242,.28);background:rgba(255,255,255,.045);color:#f4f8ff}
#ccf-b230-final .btn.primary{background:linear-gradient(110deg,#08d1df,#148ef1);border:0;color:#031729;box-shadow:0 8px 25px rgba(0,171,232,.2)}
#ccf-b230-final .downloadNav{white-space:nowrap}
#ccf-b230-final .mobileMenuToggle{display:none}
#ccf-b230-final .hero{position:relative;display:grid;grid-template-columns:minmax(420px,.88fr) minmax(0,1.12fr);
 align-items:center;gap:30px;padding:64px 0 42px;min-height:540px}
#ccf-b230-final .heroCopy{position:relative;z-index:5;padding:8px 0}
#ccf-b230-final .kicker{padding:8px 14px;border:1px solid rgba(0,207,238,.65);background:rgba(0,181,223,.08);
 color:#62eaff;font-size:10px;letter-spacing:.13em}
#ccf-b230-final .heroTitle{font-size:clamp(43px,4.1vw,66px);line-height:1.02;letter-spacing:-.057em;
 font-weight:900;margin:24px 0 19px;max-width:650px}
#ccf-b230-final .grad{background:linear-gradient(100deg,#08d5e8 4%,#22b9f6 56%,#46d9c2 100%);
 -webkit-background-clip:text;background-clip:text;color:transparent}
#ccf-b230-final .heroCopy>p{max-width:600px;color:#c0d0df;font-size:15px;line-height:1.72;margin:0}
#ccf-b230-final .heroCta{display:flex;gap:13px;flex-wrap:wrap;margin-top:26px}
#ccf-b230-final .heroCta .btn{min-height:52px;padding:14px 23px;font-size:13px}
#ccf-b230-final .demoBtn{border:1px solid rgba(215,233,248,.8);background:rgba(5,20,37,.45)}
#ccf-b230-final .proof{display:flex;gap:19px;flex-wrap:wrap;margin-top:24px;color:#d4e2ee;font-size:10px}
#ccf-b230-final .proof span{white-space:nowrap}
#ccf-b230-final .proof span::first-letter{color:#19d7e8}
#ccf-b230-final .heroVisual{position:relative;min-height:430px;display:block;overflow:visible;padding:0;
 border:0;background:none;box-shadow:none;transform:none;animation:none}
#ccf-b230-final .ccf-device-stage{position:absolute;inset:0;display:flex;align-items:center;justify-content:flex-end}
#ccf-b230-final .ccf-laptop{position:relative;width:94%;margin:0 0 0 auto;padding:12px 12px 16px;
 border:2px solid #91b9d3;border-bottom-color:#496d89;border-radius:23px 23px 13px 13px;
 background:linear-gradient(145deg,#0a1727,#172c42);box-shadow:0 26px 65px rgba(0,0,0,.5),0 0 55px rgba(0,148,255,.18)}
#ccf-b230-final .ccf-laptop-screen{position:relative;overflow:hidden;aspect-ratio:1.604;border-radius:12px 12px 5px 5px;
 background:#f4f7fa;border:1px solid rgba(255,255,255,.35)}
#ccf-b230-final .ccf-laptop-screen img{display:block;width:100%;height:100%;object-fit:cover;object-position:top center}
#ccf-b230-final .ccf-camera{position:absolute;top:4px;left:50%;z-index:2;width:5px;height:5px;border-radius:50%;background:#244b68}
#ccf-b230-final .ccf-laptop-chin{display:none}
#ccf-b230-final .ccf-laptop-base{position:absolute;left:-5%;right:-5%;bottom:-13px;height:12px;border-radius:0 0 50% 50%;
 background:linear-gradient(180deg,#a6c4d8,#46627b 55%,#162b3e);box-shadow:0 8px 15px rgba(0,0,0,.45)}
#ccf-b230-final .ccf-phone{position:absolute;z-index:4;left:1%;bottom:-4%;width:25%;max-width:220px;padding:7px;
 border-radius:31px;border:3px solid #91b5cc;background:linear-gradient(145deg,#091624,#203d54);
 box-shadow:0 22px 50px rgba(0,0,0,.55);transform:rotate(-2deg);overflow:hidden}
#ccf-b230-final .ccf-phone-speaker{position:absolute;z-index:2;top:8px;left:40%;width:20%;height:8px;border-radius:0 0 8px 8px;background:#06101c}
#ccf-b230-final .ccf-phone img{display:block;width:100%;height:auto;max-height:390px;object-fit:cover;object-position:top;border-radius:22px}
#ccf-b230-final .benefitStrip{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:0;
 margin:10px 0 42px;padding:18px 14px;border-radius:18px;border:1px solid rgba(95,185,232,.22);
 background:linear-gradient(100deg,rgba(16,53,81,.88),rgba(12,43,70,.92));box-shadow:0 15px 35px rgba(0,0,0,.12)}
#ccf-b230-final .benefitStrip article{display:flex;align-items:center;gap:15px;padding:0 22px;min-width:0;border-right:1px solid rgba(147,195,225,.22)}
#ccf-b230-final .benefitStrip article:last-child{border-right:0}
#ccf-b230-final .benefitIcon{display:grid;place-items:center;flex:0 0 38px;width:38px;height:38px;color:#0ed8ee;font-size:29px;font-weight:500}
#ccf-b230-final .benefitStrip b{display:block;color:#f4f8ff;font-size:13px}
#ccf-b230-final .benefitStrip small{display:block;color:#a8bfd2;font-size:10px;margin-top:4px}
#ccf-b230-final .section{padding:30px 0 58px}
#ccf-b230-final .sectionTitleRow{display:flex;align-items:flex-end;justify-content:space-between;gap:25px}
#ccf-b230-final .eyebrow{font-size:10px;color:#10d7e8;letter-spacing:.16em}
#ccf-b230-final .section h2{font-size:clamp(30px,3.3vw,45px);font-weight:900;letter-spacing:-.045em;margin:10px 0 8px}
#ccf-b230-final .sectionHead p{font-size:14px;color:#b0c3d4;max-width:680px;line-height:1.6}
#ccf-b230-final .outlineLink{flex:none;display:inline-flex;align-items:center;justify-content:center;padding:13px 18px;
 color:#f5faff;border:1px solid rgba(218,236,249,.7);border-radius:12px;text-decoration:none;font-size:12px;font-weight:800}
#ccf-b230-final .moduleGallery{grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;margin-top:26px}
#ccf-b230-final .moduleCard{display:flex;align-items:center;gap:15px;min-height:108px;padding:13px;
 border:1px solid rgba(105,186,230,.24);border-radius:16px;background:linear-gradient(135deg,rgba(17,54,83,.9),rgba(8,32,54,.9));
 box-shadow:0 12px 30px rgba(0,0,0,.13)}
#ccf-b230-final .moduleCard:hover{transform:translateY(-3px);border-color:rgba(12,213,237,.5)}
#ccf-b230-final .moduleImageButton{flex:0 0 76px;width:76px;height:76px;padding:0;border-radius:12px;background:#eaf2f8}
#ccf-b230-final .moduleImageButton::after{display:none}
#ccf-b230-final .moduleImageButton img{object-fit:cover;object-position:top center;border-radius:12px}
#ccf-b230-final .zoomHint{display:none}
#ccf-b230-final .moduleInfo{padding:0;min-width:0}
#ccf-b230-final .moduleInfo b{font-size:14px}
#ccf-b230-final .moduleInfo p{font-size:11px;color:#b0c4d6;line-height:1.45}
#ccf-b230-final .audienceSection{display:grid;grid-template-columns:.82fr 1.18fr;gap:16px 35px;align-items:center;padding-top:45px}
#ccf-b230-final .audienceIntro{grid-row:1 / span 2}
#ccf-b230-final .audienceIntro h2{max-width:510px;font-size:clamp(29px,3vw,40px);line-height:1.08}
#ccf-b230-final .audienceIntro p{max-width:480px;color:#b0c4d6;font-size:13px;line-height:1.65}
#ccf-b230-final .audienceVisual{margin:0;padding:7px;border-radius:16px;border:1px solid rgba(111,186,226,.2);background:rgba(255,255,255,.035)}
#ccf-b230-final .audienceVisual img{width:100%;height:auto;max-height:165px;object-fit:cover;object-position:center}
#ccf-b230-final .audienceGrid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:8px;margin:0}
#ccf-b230-final .audienceCard{min-height:94px;padding:12px;border:1px solid rgba(111,186,226,.2);border-radius:13px;background:rgba(16,47,73,.82)}
#ccf-b230-final .audienceCard strong{font-size:10px}
#ccf-b230-final .audienceCard span{font-size:9px;color:#b1c4d4;line-height:1.4}
#ccf-b230-final .lowerBenefits{margin-top:35px;margin-bottom:34px}
#ccf-b230-final .offerFaq{display:grid;grid-template-columns:1.25fr .75fr;gap:26px;align-items:center;padding:0 0 35px}
#ccf-b230-final .priceSection{padding:27px;border:1px solid rgba(10,207,232,.35);border-radius:22px;
 background:linear-gradient(115deg,rgba(13,52,78,.95),rgba(7,32,55,.94));box-shadow:0 18px 45px rgba(0,0,0,.15)}
#ccf-b230-final .priceGrid{display:grid;grid-template-columns:1.15fr .85fr;gap:25px;align-items:center}
#ccf-b230-final .priceBadge{display:inline-flex;padding:7px 11px;border-radius:99px;background:rgba(53,219,184,.11);
 color:#5ce4c0;border:1px solid rgba(53,219,184,.26);font-size:9px;font-weight:900;text-transform:uppercase;letter-spacing:.12em}
#ccf-b230-final .priceTitle{font-size:clamp(23px,2.4vw,32px);line-height:1.1;letter-spacing:-.04em;margin:15px 0 8px}
#ccf-b230-final .priceText{font-size:11px;color:#b2c5d6;line-height:1.65;margin:0}
#ccf-b230-final .priceActionColumn{padding-left:25px;border-left:1px solid rgba(158,203,231,.22)}
#ccf-b230-final .priceValue{font-size:52px;line-height:1;font-weight:950;color:#12d8e8;letter-spacing:-.05em;margin:0}
#ccf-b230-final .priceSmall{font-size:10px;color:#9db6c9;margin:5px 0 13px}
#ccf-b230-final .priceActions{display:grid;gap:8px}
#ccf-b230-final .priceActions .btn{width:100%;min-height:42px;font-size:11px}
#ccf-b230-final .faqBlock h2{font-size:clamp(24px,2.5vw,32px);line-height:1.1;margin:9px 0 14px}
#ccf-b230-final .faqItem{border:1px solid rgba(120,182,220,.2);border-radius:12px;background:rgba(17,48,73,.8);margin:7px 0;overflow:hidden}
#ccf-b230-final .faqQ{display:flex;align-items:center;justify-content:space-between;width:100%;padding:13px 14px;border:0;background:none;color:#f1f7fc;text-align:left;font-size:11px;font-weight:750;cursor:pointer}
#ccf-b230-final .faqQ span:last-child{color:#18d9ed;font-size:17px}
#ccf-b230-final .faqA{display:none;padding:0 14px 13px;color:#aec3d4;font-size:10px;line-height:1.55}
#ccf-b230-final .faqItem.open .faqA{display:block}
#ccf-b230-final .dynamicCta{display:flex;align-items:center;justify-content:space-between;gap:24px;margin:5px 0 24px;padding:28px 34px;
 border:1px solid rgba(14,190,245,.45);border-radius:20px;background:
 radial-gradient(ellipse at 85% 50%,rgba(0,193,246,.3),transparent 43%),
 linear-gradient(105deg,#102f80,#075f9f 58%,#057fbd);box-shadow:0 18px 45px rgba(0,0,0,.18)}
#ccf-b230-final .dynamicCta h2{font-size:clamp(23px,2.6vw,34px);margin:0 0 6px;letter-spacing:-.035em}
#ccf-b230-final .dynamicCta p{max-width:760px;margin:0;color:#d3e9f8;font-size:11px;line-height:1.6}
#ccf-b230-final .dynamicCta .btn{flex:none;min-width:210px}
#ccf-b230-final .footer{display:flex;align-items:center;justify-content:space-between;gap:20px;text-align:left;padding:25px 0 30px;color:#a5bacb}
#ccf-b230-final .footerBrand{display:flex;align-items:center;gap:11px}
#ccf-b230-final .footerBrand .mark{width:38px;height:38px}
#ccf-b230-final .footerBrand b{font-size:13px;color:#f3f8fc}
#ccf-b230-final .footerBrand small{display:block;font-size:9px;color:#8fa7bb}
#ccf-b230-final .footer>span{margin:0;font-size:10px}
#ccf-b230-final .footerLinks{display:flex;gap:16px}
#ccf-b230-final .footerLinks a{color:#c1d1df;font-size:10px;text-decoration:none}
#ccf-b230-final .footerLinks a:hover{color:#13d7e9}
@media(max-width:1100px){
 #ccf-b230-final .wrap{width:calc(100% - 48px)}
 #ccf-b230-final .navLinks{gap:14px}
 #ccf-b230-final .navLinks a{font-size:11px}
 #ccf-b230-final .hero{grid-template-columns:.9fr 1.1fr;gap:14px}
 #ccf-b230-final .heroTitle{font-size:clamp(39px,4.4vw,54px)}
 #ccf-b230-final .heroVisual{min-height:360px}
 #ccf-b230-final .benefitStrip article{padding:0 12px;gap:9px}
 #ccf-b230-final .audienceSection{grid-template-columns:.75fr 1.25fr;gap:16px}
}
@media(max-width:760px){
 #ccf-b230-final .wrap{width:calc(100% - 32px)}
 #ccf-b230-final .nav{min-height:68px;padding:8px 0;position:sticky;top:0;gap:10px}
 #ccf-b230-final .brand{flex:1;min-width:0}
 #ccf-b230-final .mark{width:40px;height:40px;flex:none}
 #ccf-b230-final .brand b{font-size:14px}
 #ccf-b230-final .brand small{font-size:9px}
 #ccf-b230-final .mobileMenuToggle{display:grid;place-items:center;order:3;width:40px;height:40px;border:1px solid rgba(150,195,224,.3);border-radius:10px;background:rgba(255,255,255,.06);color:#fff;font-size:19px}
 #ccf-b230-final .navLinks{display:none;position:absolute;left:0;right:0;top:calc(100% + 1px);padding:12px;
  flex-direction:column;align-items:stretch;gap:0;border:1px solid rgba(125,190,228,.2);border-radius:0 0 14px 14px;
  background:#071b30;box-shadow:0 18px 35px rgba(0,0,0,.35)}
 #ccf-b230-final .nav.is-open .navLinks{display:flex}
 #ccf-b230-final .navLinks a{padding:12px 10px;font-size:13px}
 #ccf-b230-final .navLinks a.active:after{left:10px;right:auto;bottom:5px;width:25px}
 #ccf-b230-final .nav .actions{margin:0;flex:none}
 #ccf-b230-final .nav .actions .btn{min-height:39px;padding:9px 11px;font-size:10px;white-space:nowrap}
 #ccf-b230-final .nav .actions .downloadNav{display:none}
 #ccf-b230-final .hero{display:flex;flex-direction:column;align-items:stretch;gap:22px;padding:42px 0 30px;min-height:0}
 #ccf-b230-final .heroCopy{padding:0}
 #ccf-b230-final .kicker{font-size:9px}
 #ccf-b230-final .heroTitle{font-size:clamp(38px,9.4vw,55px);line-height:1.02;margin:19px 0 14px;max-width:650px}
 #ccf-b230-final .heroCopy>p{font-size:14px;line-height:1.65}
 #ccf-b230-final .heroCta{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-top:20px}
 #ccf-b230-final .heroCta .btn{min-height:48px;padding:11px 10px;font-size:11px}
 #ccf-b230-final .proof{gap:9px 15px;margin-top:16px;font-size:9px}
 #ccf-b230-final .heroVisual{width:100%;min-height:clamp(230px,65vw,390px);margin:0}
 #ccf-b230-final .ccf-device-stage{inset:0}
 #ccf-b230-final .ccf-laptop{width:88%;padding:7px 7px 10px;border-width:1.5px;border-radius:13px 13px 8px 8px}
 #ccf-b230-final .ccf-laptop-screen{border-radius:7px 7px 3px 3px}
 #ccf-b230-final .ccf-laptop-base{height:7px;bottom:-8px}
 #ccf-b230-final .ccf-phone{width:25%;left:0;bottom:-2%;padding:4px;border-width:2px;border-radius:19px}
 #ccf-b230-final .ccf-phone img{border-radius:14px;max-height:260px}
 #ccf-b230-final .ccf-phone-speaker{top:5px;height:5px}
 #ccf-b230-final .benefitStrip{grid-template-columns:1fr 1fr;margin:8px 0 26px;padding:7px;border-radius:15px}
 #ccf-b230-final .benefitStrip article{padding:12px 8px;border-right:0;gap:9px}
 #ccf-b230-final .benefitStrip article:nth-child(odd){border-right:1px solid rgba(147,195,225,.18)}
 #ccf-b230-final .benefitStrip article:nth-child(-n+2){border-bottom:1px solid rgba(147,195,225,.18)}
 #ccf-b230-final .benefitIcon{flex-basis:30px;width:30px;height:30px;font-size:23px}
 #ccf-b230-final .benefitStrip b{font-size:10px}
 #ccf-b230-final .benefitStrip small{font-size:8px}
 #ccf-b230-final .section{padding:26px 0 38px}
 #ccf-b230-final .sectionTitleRow{align-items:flex-start;flex-direction:column;gap:14px}
 #ccf-b230-final .section h2{font-size:31px}
 #ccf-b230-final .sectionHead p{font-size:12px}
 #ccf-b230-final .outlineLink{padding:11px 14px;font-size:11px}
 #ccf-b230-final .moduleGallery{grid-template-columns:1fr 1fr;gap:9px;margin-top:19px}
 #ccf-b230-final .moduleCard{min-height:0;display:flex;flex-direction:column;align-items:flex-start;gap:9px;padding:10px;border-radius:13px}
 #ccf-b230-final .moduleImageButton{width:100%;height:105px;flex:none}
 #ccf-b230-final .moduleInfo b{font-size:12px}
 #ccf-b230-final .moduleInfo p{font-size:9px;line-height:1.45}
 #ccf-b230-final .audienceSection{display:flex;flex-direction:column;align-items:stretch;gap:15px;padding-top:25px}
 #ccf-b230-final .audienceIntro h2{font-size:29px}
 #ccf-b230-final .audienceIntro p{font-size:12px}
 #ccf-b230-final .audienceVisual{padding:5px}
 #ccf-b230-final .audienceVisual img{max-height:110px}
 #ccf-b230-final .audienceGrid{grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
 #ccf-b230-final .audienceCard{min-height:88px;padding:11px}
 #ccf-b230-final .audienceCard:last-child{grid-column:1/-1}
 #ccf-b230-final .lowerBenefits{margin:25px 0}
 #ccf-b230-final .offerFaq{grid-template-columns:1fr;gap:22px;padding-bottom:25px}
 #ccf-b230-final .priceSection{padding:20px;border-radius:17px}
 #ccf-b230-final .priceGrid{grid-template-columns:1fr;gap:18px}
 #ccf-b230-final .priceTitle{font-size:25px}
 #ccf-b230-final .priceActionColumn{padding:16px 0 0;border-left:0;border-top:1px solid rgba(158,203,231,.22)}
 #ccf-b230-final .priceValue{font-size:43px}
 #ccf-b230-final .faqBlock h2{font-size:26px}
 #ccf-b230-final .dynamicCta{flex-direction:column;align-items:stretch;padding:22px 19px;gap:17px;border-radius:16px}
 #ccf-b230-final .dynamicCta h2{font-size:25px}
 #ccf-b230-final .dynamicCta p{font-size:10px}
 #ccf-b230-final .dynamicCta .btn{width:100%;min-width:0}
 #ccf-b230-final .footer{flex-direction:column;align-items:flex-start;gap:14px;padding:20px 0 28px}
 #ccf-b230-final .footer>span{font-size:9px}
 #ccf-b230-final .footerLinks{flex-wrap:wrap;gap:12px}
}
@media(max-width:390px){
 #ccf-b230-final .wrap{width:calc(100% - 24px)}
 #ccf-b230-final .brand b{font-size:12px}
 #ccf-b230-final .nav .actions .btn{font-size:9px;padding:8px}
 #ccf-b230-final .heroTitle{font-size:37px}
 #ccf-b230-final .heroCta{grid-template-columns:1fr}
 #ccf-b230-final .proof{display:grid;grid-template-columns:1fr 1fr}
 #ccf-b230-final .moduleImageButton{height:88px}
}
@media(prefers-reduced-motion:reduce){
 #ccf-b230-final *,#ccf-b230-final *:before,#ccf-b230-final *:after{animation:none!important;transition:none!important;scroll-behavior:auto!important}
}

`;


 document.head.appendChild(s);
}

function html(){
 return `<div id="${ID}" role="dialog" aria-label="Portal de acceso al Centro de Control Financiero">
 <div class="page"><div class="orb a"></div><div class="orb b"></div><div class="wrap">
 <nav class="nav">
  <a class="brand" href="#inicio" aria-label="Control Financiero, inicio"><div class="mark">CCF</div><div><b>Control Financiero</b><small>Centro de Control Financiero</small></div></a>
  <button class="mobileMenuToggle" type="button" aria-label="Abrir menú" aria-expanded="false" aria-controls="ccf-main-navigation">☰</button>
  <div class="navLinks" id="ccf-main-navigation" aria-label="Navegación principal">
   <a class="active" href="#inicio">Inicio</a><a href="#caracteristicas">Características</a><a href="#modulos">Módulos</a><a href="#usuarios">Usuarios</a><a href="#preguntas">Preguntas</a><a href="#contacto">Contacto</a>
  </div>
  <div class="actions"><a class="btn downloadNav" href="https://apk.controlfinanciero.cl/app-control-financiero.apk" download="app-control-financiero.apk" rel="noopener">♟ Descargar APK</a><button class="btn primary" data-b230-open="login">♙ Iniciar sesión</button></div>
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
  <div class="heroVisual" aria-label="Vista de Control Financiero en computador y teléfono">
   <div class="ccf-device-stage">
    <div class="ccf-laptop" aria-label="Panel financiero en computador">
     <div class="ccf-laptop-screen"><span class="ccf-camera"></span><img src="${IMG_SCREEN_DESKTOP}" alt="Panel real de Control Financiero en pantalla de computador" fetchpriority="high"></div>
     <div class="ccf-laptop-chin"></div><div class="ccf-laptop-base"></div>
    </div>
    <div class="ccf-phone" aria-label="Panel financiero en smartphone">
     <span class="ccf-phone-speaker"></span><img src="${IMG_SCREEN_MOBILE}" alt="Panel real de Control Financiero adaptado a smartphone" fetchpriority="high">
    </div>
   </div>
  </div>
 </section>
 <section class="benefitStrip" id="caracteristicas">
  <article><span class="benefitIcon">▱</span><div><b>Centraliza tu información</b><small>En un solo lugar</small></div></article>
  <article><span class="benefitIcon">▥</span><div><b>Analiza tu realidad</b><small>Con reportes visuales</small></div></article>
  <article><span class="benefitIcon">◎</span><div><b>Planifica tu futuro</b><small>Con metas y proyecciones</small></div></article>
  <article><span class="benefitIcon">♢</span><div><b>Toma mejores decisiones</b><small>Con datos confiables</small></div></article>
 </section>
 <section class="section modulesSection" id="modulos">
  <div class="sectionTitleRow"><div class="sectionHead"><span class="eyebrow">TODO EN UN MISMO SISTEMA</span><h2>Módulos principales.</h2><p>Herramientas conectadas para comprender tu presente, ordenar tu información y proyectar lo que viene.</p></div><a class="outlineLink" href="#usuarios">Conoce todos los módulos&nbsp; →</a></div>
  <div class="moduleGallery">
   <article class="moduleCard"><button class="moduleImageButton" type="button" data-b230-image="resumen" aria-label="Ampliar Resumen"><img src="${IMG_RESUMEN}" alt="Resumen — vista real del sistema" loading="lazy"><span class="zoomHint">⌕</span></button><div class="moduleInfo"><b>▱&nbsp; Resumen</b><p>Panorama financiero con ingresos, gastos y resultado.</p></div></article>
   <article class="moduleCard"><button class="moduleImageButton" type="button" data-b230-image="calendario" aria-label="Ampliar Calendario"><img src="${IMG_CALENDARIO}" alt="Calendario — vista real del sistema" loading="lazy"><span class="zoomHint">⌕</span></button><div class="moduleInfo"><b>▦&nbsp; Calendario</b><p>Visualiza compromisos, pagos y eventos por fecha.</p></div></article>
   <article class="moduleCard"><button class="moduleImageButton" type="button" data-b230-image="movimientos" aria-label="Ampliar Movimientos"><img src="${IMG_MOVIMIENTOS}" alt="Movimientos — vista real del sistema" loading="lazy"><span class="zoomHint">⌕</span></button><div class="moduleInfo"><b>⇄&nbsp; Movimientos</b><p>Registra y consulta ingresos y gastos de forma ordenada.</p></div></article>
   <article class="moduleCard"><button class="moduleImageButton" type="button" data-b230-image="presupuesto" aria-label="Ampliar Presupuesto"><img src="${IMG_PRESUPUESTO}" alt="Presupuesto — vista real del sistema" loading="lazy"><span class="zoomHint">⌕</span></button><div class="moduleInfo"><b>◷&nbsp; Presupuesto</b><p>Compara planificación, ejecución y compromisos.</p></div></article>
   <article class="moduleCard"><button class="moduleImageButton" type="button" data-b230-image="deudas" aria-label="Ampliar Deudas"><img src="${IMG_DEUDAS}" alt="Deudas — vista real del sistema" loading="lazy"><span class="zoomHint">⌕</span></button><div class="moduleInfo"><b>▤&nbsp; Deudas</b><p>Controla saldos, cuotas, vencimientos y obligaciones.</p></div></article>
   <article class="moduleCard"><button class="moduleImageButton" type="button" data-b230-image="planificacion" aria-label="Ampliar Planificación"><img src="${IMG_PLANIFICACION}" alt="Planificación — vista real del sistema" loading="lazy"><span class="zoomHint">⌕</span></button><div class="moduleInfo"><b>⌁&nbsp; Planificación</b><p>Anticipa escenarios financieros y necesidades futuras.</p></div></article>
  </div>
 </section>
 <section class="section audienceSection" id="usuarios">
  <div class="audienceIntro"><span class="eyebrow">DISEÑADO PARA DISTINTAS REALIDADES</span><h2>Una herramienta que se adapta a tu forma de administrar dinero.</h2><p>El mismo centro de control puede acompañar distintas fuentes de ingresos, obligaciones y objetivos.</p></div>
  <div class="audienceVisual"><img src="${IMG_AUDIENCES}" alt="Perfiles de usuarios de Control Financiero" loading="lazy"></div>
  <div class="audienceGrid"><article class="audienceCard"><strong>Emprendedores</strong><span>Controla tus ingresos, costos y haz crecer tu negocio.</span></article><article class="audienceCard"><strong>Empresarios</strong><span>Toma decisiones con datos reales y proyecta tu crecimiento.</span></article><article class="audienceCard"><strong>Independientes</strong><span>Gestiona tu actividad, controla tus ingresos y gastos.</span></article><article class="audienceCard"><strong>Dueños de negocio</strong><span>Organiza tus ventas, compras, deudas y ganancias.</span></article><article class="audienceCard"><strong>Hogar y familia</strong><span>Lleva el control del hogar y planifica mejor tu presupuesto.</span></article></div>
 </section>
 <section class="benefitStrip lowerBenefits">
  <article><span class="benefitIcon">ϟ</span><div><b>Simple y rápido</b><small>Fácil de usar, sin curva de aprendizaje</small></div></article>
  <article><span class="benefitIcon">☁</span><div><b>En la nube</b><small>Accede desde cualquier lugar</small></div></article>
  <article><span class="benefitIcon">♙</span><div><b>Seguro y privado</b><small>Tus datos están protegidos</small></div></article>
  <article><span class="benefitIcon">▣</span><div><b>Multi-dispositivo</b><small>Web y Android</small></div></article>
 </section>
 <section class="offerFaq" id="preguntas">
  <section class="priceSection" aria-labelledby="ccf-price-title"><div class="priceGrid"><div><span class="priceBadge">Oferta de lanzamiento</span><h2 id="ccf-price-title" class="priceTitle">Control Financiero es gratis por tiempo limitado.</h2><p class="priceText">Accede al Centro de Control Financiero durante nuestro período inicial sin costo. Puedes utilizarlo desde el navegador o descargar la aplicación Android directamente desde este sitio.</p></div><div class="priceActionColumn"><p class="priceValue">$0</p><p class="priceSmall">Durante el período promocional.</p><div class="priceActions"><a class="btn primary installBtn" href="https://apk.controlfinanciero.cl/app-control-financiero.apk" download="app-control-financiero.apk" rel="noopener">♟&nbsp; Descargar APK Android</a><button class="btn" data-b230-open="register">Comenzar gratis</button></div></div></div></section>
  <div class="faqBlock"><span class="eyebrow">PREGUNTAS FRECUENTES</span><h2>¿Tienes dudas? Aquí te ayudamos.</h2><div class="faqList"><div class="faqItem"><button class="faqQ" type="button"><span>¿Qué puedo controlar con el sistema?</span><span>＋</span></button><div class="faqA">Puedes organizar movimientos, cuentas, deudas, presupuesto, calendario, ahorro, planificación y proyección dentro de una misma estructura.</div></div><div class="faqItem"><button class="faqQ" type="button"><span>¿Puedo usarlo desde mi celular?</span><span>＋</span></button><div class="faqA">Sí. El sistema cuenta con vistas adaptadas a dispositivos móviles y una aplicación Android.</div></div><div class="faqItem"><button class="faqQ" type="button"><span>¿Cómo se relacionan los módulos?</span><span>＋</span></button><div class="faqA">Los módulos trabajan sobre una estructura financiera común para conservar trazabilidad entre registros, compromisos y proyecciones.</div></div><div class="faqItem"><button class="faqQ" type="button"><span>¿Mis datos permanecen privados?</span><span>＋</span></button><div class="faqA">El acceso utiliza el flujo de autenticación existente del sistema y no crea una autenticación paralela.</div></div><div class="faqItem"><button class="faqQ" type="button"><span>¿Necesito conocimientos financieros?</span><span>＋</span></button><div class="faqA">No. La propuesta está orientada a transformar información cotidiana en una lectura más clara y accionable.</div></div></div></div>
 </section>
 <section class="dynamicCta" id="contacto"><div><h2>Comienza hoy a controlar tus finanzas.</h2><p>Registra. Organiza. Planifica. Proyecta. Accede al sistema y construye una visión integrada de tu presente y de los escenarios que vienen.</p></div><button class="btn primary" data-b230-open="register">Crear mi cuenta gratis&nbsp; →</button></section>
 </main>
 <footer class="footer"><div class="footerBrand"><span class="mark">CCF</span><div><b>Control Financiero</b><small>Centro de Control Financiero</small></div></div><span>Producto desarrollado por Somos Software · Innovación Digital</span><div class="footerLinks"><a href="#preguntas">Términos y condiciones</a><a href="#preguntas">Política de privacidad</a><a href="#contacto">Contacto</a></div></footer>
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
function removeHeaderCoBrand(){
 const root=document.getElementById(ID);
 const nav=root?.querySelector('.nav');
 if(!nav)return;
 // La cabecera identifica exclusivamente al producto CCF. La marca Somos Software
 // permanece en el footer y en las secciones donde corresponda.
 const isSomosNode=el=>{
  if(!el||el===nav)return false;
  const img=el.matches?.('img')?el:el.querySelector?.('img');
  const imageMeta=((img?.getAttribute('alt')||'')+' '+(img?.getAttribute('src')||'')+' '+(img?.getAttribute('title')||'')).toLowerCase();
  const txt=(el.textContent||'').replace(/\s+/g,' ').trim().toLowerCase();
  return /somos[\s_-]*software/.test(imageMeta)||txt.includes('un producto de');
 };
 // Primero elimina los bloques identificados por la frase de co-branding.
 nav.querySelectorAll('*').forEach(el=>{
  if((el.textContent||'').replace(/\s+/g,' ').trim().toLowerCase().includes('un producto de')){
   let block=el;
   while(block.parentElement&&block.parentElement!==nav&&block.parentElement.children.length===1)block=block.parentElement;
   if(block!==nav)block.remove();
  }
 });
 // Elimina imágenes de Somos Software y su contenedor inmediato de marca.
 nav.querySelectorAll('img').forEach(img=>{
  const meta=((img.getAttribute('alt')||'')+' '+(img.getAttribute('src')||'')+' '+(img.getAttribute('title')||'')).toLowerCase();
  if(/somos[\s_-]*software/.test(meta)){
   let block=img;
   if(block.parentElement&&block.parentElement!==nav&&block.parentElement.children.length<=2)block=block.parentElement;
   block.remove();
  }
 });
}

function bind(){
 const p=document.getElementById(ID);if(!p)return;
 removeHeaderCoBrand();
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
function boot(){style();if(!document.getElementById(ID))document.body.insertAdjacentHTML('afterbegin',html());removeHeaderCoBrand();animatePremiumHero();bind();mountInteractiveContent();watchAuth()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
