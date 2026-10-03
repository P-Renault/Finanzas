/* CCF B230 — PORTAL PREMIUM / LANDING RESPONSIVE
   B230-PREMIUM-1.2 — HERO + INSTALACIÓN PWA + PRECIOS
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
#${ID} .installHint{margin-top:10px;color:#7890a7;font-size:10px;line-height:1.5}.installBtn{position:relative}
@media(max-width:760px){#${ID} .priceGrid{grid-template-columns:1fr}#${ID} .priceSection{padding:24px 18px}}
@media(prefers-reduced-motion:reduce){#${ID} *,#${ID} *:before,#${ID} *:after{animation:none!important;transition:none!important}}
`;
 document.head.appendChild(s);
}

function html(){
 return `<div id="${ID}" role="dialog" aria-label="Portal de acceso al Centro de Control Financiero">
 <div class="page"><div class="orb a"></div><div class="orb b"></div><div class="wrap">
 <nav class="nav"><div class="brand"><div class="mark">CCF</div><div><b>CONTROL FINANCIERO</b><small>CENTRO DE CONTROL FINANCIERO</small></div></div>
 <div class="actions"><button class="btn" data-ccf-install type="button">Instalar aplicación</button><button class="btn" data-b230-open="register">Crear cuenta</button><button class="btn primary" data-b230-open="login">Iniciar sesión</button></div></nav>
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
 <div class="heroCta"><button class="btn primary" data-b230-open="login">Entrar al sistema →</button><button class="btn" data-b230-open="register">Crear mi cuenta</button><button class="btn" data-ccf-install type="button">Instalar aplicación</button></div>
 <div class="proof"><span><i></i>Datos centralizados</span><span><i></i>Proyección financiera</span><span><i></i>Experiencia móvil</span></div></div>
 <div class="heroVisual" aria-label="Vista real del Centro de Control Financiero en computador y teléfono">
  <div class="heroLaptop"><img src="${IMG_HERO_LAPTOP}" alt="Vista completa del Centro de Control Financiero en computador"></div>
  <div class="heroPhone"><img src="${IMG_HERO_PHONE}" alt="Vista completa del Centro de Control Financiero en celular"></div>
  <span class="heroDeviceBadge">Vista real del sistema · Escritorio + móvil</span>
</div></section>
 <section class="strip"><div class="stripItem"><i class="stripDot"></i><div><strong>Registro</strong><span>Información financiera ordenada</span></div></div><div class="stripItem"><i class="stripDot"></i><div><strong>Análisis</strong><span>Lectura de liquidez y obligaciones</span></div></div><div class="stripItem"><i class="stripDot"></i><div><strong>Anticipación</strong><span>Proyección para decidir con datos</span></div></div></section>
 <section class="section"><div class="sectionHead"><span class="eyebrow">TODO EN UN MISMO SISTEMA</span><h2>Módulos principales.</h2><p>Herramientas conectadas para comprender tu presente, ordenar tu información y proyectar lo que viene. Pulsa cualquier captura para verla con mayor detalle.</p></div>
 <div class="moduleGallery"><article class="moduleCard"><button class="moduleImageButton" type="button" data-b230-image="resumen" aria-label="Ampliar Resumen"><img src="${IMG_RESUMEN}" alt="Resumen — vista real del sistema" loading="lazy"><span class="zoomHint" aria-hidden="true">⌕</span></button><div class="moduleInfo"><span class="moduleTag">CCF · Módulo</span><b>Resumen</b><p>Panel financiero con liquidez, ingresos, gastos y resultado.</p></div></article><article class="moduleCard"><button class="moduleImageButton" type="button" data-b230-image="calendario" aria-label="Ampliar Calendario"><img src="${IMG_CALENDARIO}" alt="Calendario — vista real del sistema" loading="lazy"><span class="zoomHint" aria-hidden="true">⌕</span></button><div class="moduleInfo"><span class="moduleTag">CCF · Módulo</span><b>Calendario</b><p>Visualiza compromisos, pagos y eventos por fecha.</p></div></article><article class="moduleCard"><button class="moduleImageButton" type="button" data-b230-image="movimientos" aria-label="Ampliar Movimientos"><img src="${IMG_MOVIMIENTOS}" alt="Movimientos — vista real del sistema" loading="lazy"><span class="zoomHint" aria-hidden="true">⌕</span></button><div class="moduleInfo"><span class="moduleTag">CCF · Módulo</span><b>Movimientos</b><p>Registra y consulta ingresos y gastos de forma ordenada.</p></div></article><article class="moduleCard"><button class="moduleImageButton" type="button" data-b230-image="presupuesto" aria-label="Ampliar Presupuesto"><img src="${IMG_PRESUPUESTO}" alt="Presupuesto — vista real del sistema" loading="lazy"><span class="zoomHint" aria-hidden="true">⌕</span></button><div class="moduleInfo"><span class="moduleTag">CCF · Módulo</span><b>Presupuesto</b><p>Compara planificación, ejecución y compromisos.</p></div></article><article class="moduleCard"><button class="moduleImageButton" type="button" data-b230-image="deudas" aria-label="Ampliar Deudas"><img src="${IMG_DEUDAS}" alt="Deudas — vista real del sistema" loading="lazy"><span class="zoomHint" aria-hidden="true">⌕</span></button><div class="moduleInfo"><span class="moduleTag">CCF · Módulo</span><b>Deudas</b><p>Controla saldos, cuotas, vencimientos y obligaciones.</p></div></article><article class="moduleCard"><button class="moduleImageButton" type="button" data-b230-image="planificacion" aria-label="Ampliar Planificación"><img src="${IMG_PLANIFICACION}" alt="Planificación — vista real del sistema" loading="lazy"><span class="zoomHint" aria-hidden="true">⌕</span></button><div class="moduleInfo"><span class="moduleTag">CCF · Módulo</span><b>Planificación</b><p>Anticipa escenarios financieros y necesidades futuras.</p></div></article></div></section>
 <section class="section"><div class="sectionHead"><span class="eyebrow">DE LOS DATOS A LA DECISIÓN</span><h2>Una visión financiera conectada.</h2><p>El sistema relaciona tus registros para pasar de información dispersa a una lectura integrada de tu situación financiera.</p></div><div class="flowGrid"><article class="flowStep"><em>01</em><b>REGISTRA</b><p>Ingresos, gastos, cuentas y deudas.</p></article><article class="flowStep"><em>02</em><b>ORGANIZA</b><p>Clasifica y estructura tu información.</p></article><article class="flowStep"><em>03</em><b>PLANIFICA</b><p>Define presupuestos y objetivos.</p></article><article class="flowStep"><em>04</em><b>PROYECTA</b><p>Visualiza escenarios de liquidez.</p></article><article class="flowStep"><em>05</em><b>ANALIZA</b><p>Identifica brechas y necesidades.</p></article><article class="flowStep"><em>06</em><b>DECIDE</b><p>Toma decisiones con mayor claridad.</p></article></div></section>

 <section class="section"><div class="faqGrid"><div class="sectionHead"><span class="eyebrow">PREGUNTAS FRECUENTES</span><h2>¿Tienes dudas? Aquí te ayudamos.</h2><p>Respuestas rápidas sobre el propósito, uso y experiencia del Centro de Control Financiero.</p></div><div class="faqList"><div class="faqItem"><button class="faqQ" type="button"><span>¿Qué puedo controlar con el sistema?</span><span>＋</span></button><div class="faqA">Puedes organizar movimientos, cuentas, deudas, presupuesto, calendario, ahorro, planificación y proyección dentro de una misma estructura.</div></div><div class="faqItem"><button class="faqQ" type="button"><span>¿Puedo usarlo desde mi celular?</span><span>＋</span></button><div class="faqA">Sí. El portal está diseñado para ofrecer una experiencia responsive y el sistema cuenta con vistas adaptadas a dispositivos móviles.</div></div><div class="faqItem"><button class="faqQ" type="button"><span>¿Cómo se relacionan los módulos?</span><span>＋</span></button><div class="faqA">Los módulos trabajan sobre una estructura financiera común para conservar trazabilidad entre registros, compromisos y proyecciones.</div></div><div class="faqItem"><button class="faqQ" type="button"><span>¿Mis datos permanecen privados?</span><span>＋</span></button><div class="faqA">El portal de acceso no crea una autenticación paralela: deriva el acceso al flujo de autenticación existente del sistema.</div></div><div class="faqItem"><button class="faqQ" type="button"><span>¿Necesito conocimientos financieros?</span><span>＋</span></button><div class="faqA">No. La propuesta está orientada a transformar información cotidiana en una lectura más clara y accionable.</div></div></div></div></section>
 <section class="section"><div class="sectionHead"><span class="eyebrow">DISEÑADO PARA DISTINTAS REALIDADES</span><h2>Una herramienta que se adapta a tu forma de administrar dinero.</h2><p>El mismo centro de control puede acompañar distintas fuentes de ingresos, obligaciones y objetivos.</p></div><div class="audienceVisual"><img src="${IMG_AUDIENCES}" alt="Perfiles para quienes está dirigido el sistema de Control Financiero" loading="lazy"></div><div class="audienceGrid"><article class="audienceCard"><strong>Finanzas personales</strong><span>Organiza ingresos, gastos, cuentas y obligaciones.</span></article><article class="audienceCard"><strong>Ingresos variables</strong><span>Controla jornadas y diferentes fuentes de generación.</span></article><article class="audienceCard"><strong>Independientes</strong><span>Consolida múltiples fuentes de ingresos y gastos.</span></article><article class="audienceCard"><strong>Planificación</strong><span>Construye escenarios y anticipa necesidades futuras.</span></article><article class="audienceCard"><strong>Gestión patrimonial</strong><span>Integra deuda, liquidez, ahorro y planificación.</span></article></div></section> <section class="priceSection" aria-labelledby="ccf-price-title"><div class="priceGrid"><div><span class="priceBadge">Oferta de lanzamiento</span><h2 id="ccf-price-title" class="priceTitle">Control Financiero es gratis por tiempo limitado.</h2><p class="priceText">Accede al Centro de Control Financiero durante nuestro período inicial sin costo. Puedes utilizarlo desde el navegador y, en dispositivos compatibles, instalarlo como aplicación directamente desde este sitio.</p></div><div><p class="priceValue">$0</p><p class="priceSmall">Durante el período promocional.<br>No requiere Play Store ni APK.</p><div class="priceActions"><button class="btn primary installBtn" data-ccf-install type="button">Instalar aplicación</button><button class="btn" data-b230-open="register">Comenzar gratis</button></div><p class="installHint">En Android, el navegador mostrará la opción de instalación cuando el dispositivo cumpla las condiciones de PWA.</p></div></div></section> <section class="dynamicCta"><div><span class="eyebrow">CENTRO DE CONTROL FINANCIERO</span><h2>Comienza hoy a controlar tus finanzas.</h2><p>Registra. Organiza. Planifica. Proyecta. Accede al sistema y construye una visión integrada de tu presente y de los escenarios que vienen.</p></div><button class="btn primary" data-b230-open="login">Crear mi cuenta →</button></section>
 </main><footer class="footer"><strong>CCF · Centro de Control Financiero</strong><span>Producto desarrollado por Somos Software · Innovación Digital</span></footer>
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
function bind(){const p=document.getElementById(ID);if(!p)return;p.querySelectorAll('[data-b230-open]').forEach(b=>b.addEventListener('click',()=>openExistingAuth(b.dataset.b230Open)))}
async function watchAuth(){
 for(let i=0;i<80;i++){
  const c=window.supabaseClient||window.__B23273_CLIENT__||window.__B23270_CLIENT__||window.__B23269_CLIENT__;
  if(c?.auth){try{const {data}=await c.auth.getSession();if(data?.session){removePortal();return}
   c.auth.onAuthStateChange((_e,session)=>{if(session)removePortal()})}catch(_){}return}
  await sleep(100);
 }
}
function loadPwaInstaller(){if(window.__CCF_PWA_INSTALL_B13__)return;var s=document.createElement('script');s.src='/CCF-PWA-INSTALL-B1.3.js';s.async=true;s.onerror=function(){console.warn('[CCF] No se pudo cargar el instalador PWA.');};document.head.appendChild(s)}
function boot(){style();if(!document.getElementById(ID))document.body.insertAdjacentHTML('afterbegin',html());animatePremiumHero();bind();mountInteractiveContent();watchAuth();loadPwaInstaller()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
