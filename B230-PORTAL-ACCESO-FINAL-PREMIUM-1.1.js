/* CCF B230 — PORTAL PREMIUM / LANDING RESPONSIVE
   B230-PREMIUM-1.1 — HERO MOTION + CTA PULSE + CCF LANDING
   SOLO landing inicial. No autentica, no crea Supabase y no modifica index.html.
   Mantiene la integración de autenticación existente.
*/
(function(){
'use strict';

if(window.__CCF_B230_PREMIUM_11__)return;
window.__CCF_B230_PREMIUM_11__=true;

const ID='ccf-b230-final';
const STYLE_ID='ccf-b230-premium-style';
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

const REAL_ASSETS=Object.assign({
  desktop:'./assets/control-financiero-resumen-desktop.png',
  mobile:'./assets/control-financiero-resumen-mobile.png',
  calendar:'./assets/control-financiero-calendario-mobile.png',
  movements:'./assets/control-financiero-movimientos-mobile.png',
  budget:'./assets/control-financiero-presupuesto-mobile.png',
  debts:'./assets/control-financiero-deudas-mobile.png',
  planning:'./assets/control-financiero-planificacion-mobile.png'
},window.CCF_LANDING_ASSETS||{});

function style(){
 if($('#'+STYLE_ID))return;
 const s=document.createElement('style');
 s.id=STYLE_ID;
 s.textContent=`
#${ID}{position:fixed;inset:0;z-index:2147483647;overflow:auto;color:#edf7ff;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:radial-gradient(circle at 78% 7%,rgba(0,220,255,.18),transparent 25%),radial-gradient(circle at 6% 42%,rgba(0,190,255,.10),transparent 26%),radial-gradient(circle at 55% 92%,rgba(0,255,200,.07),transparent 25%),linear-gradient(135deg,#020812 0%,#061321 48%,#03111d 100%);-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility;scroll-behavior:smooth}
#${ID} *,#${ID} *::before,#${ID} *::after{box-sizing:border-box}
#${ID} button,#${ID} input{font:inherit}
#${ID} button{-webkit-tap-highlight-color:transparent}
#${ID} .page{min-height:100%;position:relative;overflow:hidden}
#${ID} .wrap,#${ID} .container{width:min(1240px,calc(100% - 48px));margin:0 auto;position:relative}
#${ID} .ambient{position:absolute;pointer-events:none;border-radius:50%;filter:blur(70px);opacity:.16;z-index:0}
#${ID} .ambient.a{width:340px;height:340px;top:90px;right:-120px;background:#00dfff;animation:b230Float 12s ease-in-out infinite}
#${ID} .ambient.b{width:300px;height:300px;top:52%;left:-150px;background:#00e5ba;animation:b230Float 15s ease-in-out infinite reverse}
#${ID} .ambient.c{width:220px;height:220px;bottom:5%;right:18%;background:#087cff;opacity:.08;animation:b230Float 11s ease-in-out infinite}
#${ID} .scrollProgress{position:fixed;top:0;left:0;height:2px;width:0;z-index:100;background:linear-gradient(90deg,#00e5d0,#00dfff,#55aaff);box-shadow:0 0 14px rgba(0,225,255,.65)}
#${ID} .nav{min-height:72px;display:flex;align-items:center;justify-content:space-between;gap:24px;position:sticky;top:0;z-index:50;border-bottom:1px solid rgba(255,255,255,.075);background:rgba(2,8,18,.76);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px)}
#${ID} .navInner{width:min(1240px,calc(100% - 48px));margin:auto;display:flex;align-items:center;justify-content:space-between;gap:20px}
#${ID} .brand{display:flex;align-items:center;gap:11px;flex:none}
#${ID} .mark{width:40px;height:40px;border-radius:12px;display:grid;place-items:center;color:#03121d;font-size:12px;font-weight:950;letter-spacing:-.04em;background:linear-gradient(135deg,#5de5d0 0%,#12d9ee 50%,#1599ff 100%);box-shadow:0 8px 25px rgba(0,220,255,.23)}
#${ID} .brandText b{display:block;font-size:13px;line-height:1;letter-spacing:.075em;font-weight:900}
#${ID} .brandText small{display:block;margin-top:4px;color:#718ba4;font-size:7.5px;line-height:1;letter-spacing:.13em}
#${ID} .navLinks{display:flex;align-items:center;justify-content:center;gap:27px;margin-left:auto;margin-right:auto}
#${ID} .navLink{position:relative;padding:27px 0 23px;border:0;background:none;color:#9eb1c5;font-size:11px;font-weight:700;cursor:pointer;transition:color .2s ease}
#${ID} .navLink::after{content:"";position:absolute;left:0;right:0;bottom:16px;height:2px;border-radius:10px;background:#00e5d0;transform:scaleX(0);transform-origin:center;transition:transform .22s ease;box-shadow:0 0 10px rgba(0,229,208,.5)}
#${ID} .navLink:hover,#${ID} .navLink.active{color:#f5fbff}
#${ID} .navLink.active::after{transform:scaleX(1)}
#${ID} .navActions{display:flex;align-items:center;gap:9px}
#${ID} .navMobileToggle{display:none}
#${ID} .btn{position:relative;min-height:43px;padding:10px 17px;border-radius:11px;border:1px solid rgba(255,255,255,.15);background:rgba(255,255,255,.035);color:#eff8ff;font-size:11px;font-weight:850;cursor:pointer;transition:transform .2s ease,background .2s ease,border-color .2s ease,box-shadow .2s ease;overflow:hidden}
#${ID} .btn:hover{transform:translateY(-2px);background:rgba(255,255,255,.075);border-color:rgba(94,214,255,.34)}
#${ID} .btn:active{transform:translateY(0) scale(.98)}
#${ID} .btn:focus-visible{outline:3px solid rgba(0,220,255,.32);outline-offset:3px}
#${ID} .btn.primary{border-color:transparent;color:#02121a;background:linear-gradient(120deg,#4de7c6,#00dfff 55%,#37b8ff);box-shadow:0 9px 27px rgba(0,205,225,.2)}
#${ID} .btn.primary:hover{box-shadow:0 13px 36px rgba(0,205,225,.34)}
#${ID} .btn.loginPulse{animation:b230Pulse 3s ease-in-out infinite}
#${ID} .btn.loginPulse::after{content:"";position:absolute;inset:-3px;border-radius:inherit;box-shadow:0 0 0 0 rgba(0,225,255,0);animation:b230Glow 3s ease-in-out infinite;pointer-events:none}
#${ID} .hero{position:relative;z-index:1;min-height:640px;display:grid;grid-template-columns:minmax(400px,.86fr) minmax(520px,1.14fr);align-items:center;gap:45px;padding:70px 0 72px}
#${ID} .heroCopy{position:relative;z-index:4}
#${ID} .eyebrow{display:inline-flex;align-items:center;gap:8px;min-height:28px;padding:6px 11px;border-radius:999px;color:#54e3ff;border:1px solid rgba(0,222,255,.23);background:rgba(0,203,255,.055);font-size:9px;font-weight:950;letter-spacing:.14em}
#${ID} .eyebrow::before{content:"";width:6px;height:6px;border-radius:50%;background:#46e1bd;box-shadow:0 0 0 5px rgba(70,225,189,.08),0 0 12px rgba(70,225,189,.65)}
#${ID} .heroTitle{max-width:670px;margin:19px 0 21px;font-size:clamp(48px,5.4vw,75px);line-height:.94;letter-spacing:-.06em;font-weight:930;text-wrap:balance}
#${ID} .heroWord{display:inline-block;margin-right:.19em;opacity:0;filter:blur(12px);transform:translateY(22px);transition:opacity .68s cubic-bezier(.2,.75,.2,1),filter .68s cubic-bezier(.2,.75,.2,1),transform .68s cubic-bezier(.2,.75,.2,1)}
#${ID} .heroWord.is-visible{opacity:1;filter:blur(0);transform:translateY(0)}
#${ID} .heroGrad{background:linear-gradient(110deg,#ffffff 0%,#a7ecff 42%,#00e6d2 78%,#62e6c2 100%);-webkit-background-clip:text;background-clip:text;color:transparent}
#${ID} .heroText{max-width:650px;margin:0;color:#a1b3c6;font-size:16px;line-height:1.72}
#${ID} .heroCta{display:flex;flex-wrap:wrap;gap:11px;margin-top:28px}
#${ID} .heroProof{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-top:27px}
#${ID} .proofItem{display:flex;align-items:center;gap:8px;color:#8196aa;font-size:9px;line-height:1.35}
#${ID} .proofIcon{width:28px;height:28px;flex:none;display:grid;place-items:center;border-radius:9px;color:#00dfff;border:1px solid rgba(0,220,255,.18);background:rgba(0,220,255,.055);font-size:12px}
#${ID} .heroVisual{position:relative;min-width:0;z-index:2;perspective:1500px}
#${ID} .desktopDevice{position:relative;z-index:2;width:100%;border-radius:20px;padding:11px 11px 15px;border:1px solid rgba(255,255,255,.16);background:linear-gradient(145deg,rgba(255,255,255,.13),rgba(255,255,255,.035));box-shadow:0 45px 90px rgba(0,0,0,.52),0 0 65px rgba(0,220,255,.07);transform:rotateY(-5deg) rotateX(2deg);animation:b230DeviceIn .9s ease both}
#${ID} .deviceBar{height:24px;display:flex;align-items:center;justify-content:space-between;padding:0 7px 5px;color:#70859b;font-size:8px}
#${ID} .deviceDots{display:flex;gap:4px}
#${ID} .deviceDots i{width:5px;height:5px;border-radius:50%;background:#526779}
#${ID} .screen{position:relative;overflow:hidden;min-height:340px;border-radius:12px;background:#f5f8fc;border:1px solid rgba(255,255,255,.14)}
#${ID} .screen img{display:block;width:100%;height:auto;min-height:340px;object-fit:cover;object-position:top center;background:#f5f8fc}
#${ID} .screenFallback{min-height:340px;display:none;padding:15px;color:#182335;background:#f7f9fc}
#${ID} .screenFallback.visible{display:block}
#${ID} .fakeAppTop{height:36px;display:flex;align-items:center;justify-content:space-between;padding:0 11px;color:#fff;background:#07172c;font-size:9px;font-weight:800}
#${ID} .fakeTabs{display:flex;gap:5px;flex-wrap:wrap;padding:8px}
#${ID} .fakeTab{padding:5px 7px;border-radius:6px;color:#667487;background:#e8edf3;font-size:7px;font-weight:800}
#${ID} .fakeTab.active{color:#fff;background:#07172c}
#${ID} .fakeStats{display:grid;grid-template-columns:repeat(4,1fr);gap:7px;padding:7px}
#${ID} .fakeStat{min-height:52px;padding:8px;border-radius:9px;background:#fff;box-shadow:0 4px 15px rgba(16,36,59,.05)}
#${ID} .fakeStat small{display:block;color:#7d8998;font-size:6px}
#${ID} .fakeStat b{display:block;margin-top:5px;color:#152136;font-size:11px}
#${ID} .fakeChart{height:130px;margin:8px;border-radius:10px;background:#fff;position:relative;overflow:hidden}
#${ID} .fakeChart svg{width:100%;height:100%}
#${ID} .laptopBase{position:relative;width:110%;height:13px;margin-left:-5%;border-radius:0 0 70% 70%;background:linear-gradient(180deg,#87909a,#333b44);box-shadow:0 10px 24px rgba(0,0,0,.34)}
#${ID} .heroPhone{position:absolute;z-index:4;right:-33px;bottom:-42px;width:145px;padding:7px;border-radius:22px;border:2px solid #273440;background:#02070d;box-shadow:0 24px 48px rgba(0,0,0,.52),0 0 35px rgba(0,222,255,.11);transform:rotateY(-7deg) rotateZ(1deg);animation:b230PhoneFloat 5s ease-in-out infinite}
#${ID} .phoneScreen{position:relative;overflow:hidden;border-radius:16px;background:#f5f8fc}
#${ID} .phoneScreen img{display:block;width:100%;height:auto;min-height:270px;object-fit:cover;object-position:top center}
#${ID} .phoneFallback{min-height:270px;padding:8px;background:#f6f9fc;color:#1d2939}
#${ID} .phoneFallbackTop{height:28px;display:flex;align-items:center;justify-content:space-between;padding:0 6px;color:#fff;background:#07172c;border-radius:8px;font-size:6px;font-weight:900}
#${ID} .phoneCards{display:grid;grid-template-columns:1fr 1fr;gap:5px;margin-top:7px}
#${ID} .phoneCard{min-height:45px;padding:6px;border-radius:7px;background:#fff;box-shadow:0 2px 8px rgba(20,40,60,.05)}
#${ID} .phoneCard small{display:block;color:#7e8c9c;font-size:5px}
#${ID} .phoneCard b{display:block;margin-top:4px;font-size:8px}
#${ID} .phoneChart{height:92px;margin-top:7px;padding:5px;border-radius:8px;background:#fff}
#${ID} .phoneChart svg{width:100%;height:100%}
#${ID} .section{position:relative;z-index:1;padding:72px 0}
#${ID} .sectionHeader{display:flex;align-items:end;justify-content:space-between;gap:25px}
#${ID} .sectionTitle{max-width:760px}
#${ID} .sectionTitle h2{margin:9px 0 10px;font-size:clamp(30px,4vw,46px);line-height:1.02;letter-spacing:-.045em}
#${ID} .sectionTitle p{margin:0;max-width:740px;color:#8ea3b8;font-size:13px;line-height:1.7}
#${ID} .sectionLink{flex:none;color:#3de5dc;border:0;background:none;cursor:pointer;font-size:11px;font-weight:850}
#${ID} .sectionLink span{margin-left:6px;transition:transform .2s ease;display:inline-block}
#${ID} .sectionLink:hover span{transform:translateX(4px)}
#${ID} .moduleGrid{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:10px;margin-top:30px}
#${ID} .moduleCard{min-width:0;min-height:220px;padding:12px;border-radius:17px;border:1px solid rgba(255,255,255,.095);background:linear-gradient(145deg,rgba(255,255,255,.055),rgba(255,255,255,.018));cursor:pointer;transition:transform .28s ease,border-color .28s ease,box-shadow .28s ease,background .28s ease}
#${ID} .moduleCard:hover{transform:translateY(-7px);border-color:rgba(0,221,255,.34);background:linear-gradient(145deg,rgba(0,216,255,.085),rgba(255,255,255,.022));box-shadow:0 18px 40px rgba(0,0,0,.22),0 0 25px rgba(0,210,255,.05)}
#${ID} .moduleImage{height:120px;overflow:hidden;border-radius:11px;border:1px solid rgba(255,255,255,.08);background:#f4f7fb}
#${ID} .moduleImage img{display:block;width:100%;height:100%;object-fit:cover;object-position:top center;transition:transform .45s cubic-bezier(.2,.7,.2,1)}
#${ID} .moduleCard:hover .moduleImage img{transform:scale(1.045)}
#${ID} .moduleImageFallback{height:100%;display:none;flex-direction:column;padding:10px;color:#142238;background:#f6f9fc}
#${ID} .moduleImageFallback strong{font-size:9px}
#${ID} .moduleImageFallback .line{height:7px;margin-top:8px;border-radius:4px;background:#dfe7ef}
#${ID} .moduleImageFallback .line.accent{width:65%;background:#12bdca}
#${ID} .moduleInfo{padding:12px 2px 3px}
#${ID} .moduleInfo b{display:block;font-size:13px}
#${ID} .moduleInfo p{margin:5px 0 0;color:#8197ac;font-size:9.5px;line-height:1.5}
#${ID} .controlBand{position:relative;overflow:hidden;display:grid;grid-template-columns:1.05fr .95fr;gap:45px;align-items:center;padding:30px;border-radius:24px;border:1px solid rgba(0,220,255,.13);background:radial-gradient(circle at 0 0,rgba(0,220,255,.10),transparent 38%),linear-gradient(135deg,rgba(16,95,145,.16),rgba(14,48,74,.10))}
#${ID} .controlBand::before{content:"";position:absolute;width:300px;height:300px;right:-100px;bottom:-170px;border-radius:50%;background:#00cfe7;filter:blur(100px);opacity:.08}
#${ID} .controlBand h2{margin:9px 0 12px;font-size:clamp(28px,3.8vw,43px);line-height:1.04;letter-spacing:-.045em}
#${ID} .controlBand p{margin:0;max-width:650px;color:#8da3b7;font-size:13px;line-height:1.7}
#${ID} .trustList{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:22px}
#${ID} .trustItem{display:flex;align-items:center;gap:10px;color:#d9e9f3;font-size:10px}
#${ID} .trustIcon{width:30px;height:30px;display:grid;place-items:center;flex:none;border-radius:9px;color:#00dfff;border:1px solid rgba(0,220,255,.18);background:rgba(0,220,255,.05)}
#${ID} .bandVisual{position:relative;min-height:260px}
#${ID} .bandDevice{position:absolute;inset:10px 0 0 20px;border-radius:17px;padding:9px;border:1px solid rgba(255,255,255,.13);background:#06111d;box-shadow:0 28px 55px rgba(0,0,0,.35);transform:rotateY(-5deg) rotateZ(-1deg)}
#${ID} .bandDevice img{display:block;width:100%;height:100%;min-height:220px;object-fit:cover;object-position:top center;border-radius:10px;background:#f6f9fc}
#${ID} .audienceHeader{max-width:760px}
#${ID} .audienceHeader h2{margin:9px 0 10px;font-size:clamp(29px,4vw,45px);line-height:1.03;letter-spacing:-.045em}
#${ID} .audienceHeader p{margin:0;color:#8da3b8;font-size:13px;line-height:1.7}
#${ID} .audienceGrid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:10px;margin-top:28px}
#${ID} .audienceCard{position:relative;min-height:215px;overflow:hidden;border-radius:17px;border:1px solid rgba(255,255,255,.10);background:#06111d;cursor:pointer;transition:transform .3s ease,border-color .3s ease,box-shadow .3s ease}
#${ID} .audienceCard:hover{transform:translateY(-5px);border-color:rgba(0,225,255,.34);box-shadow:0 18px 42px rgba(0,0,0,.25)}
#${ID} .audienceImage{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.03) 0%,rgba(0,0,0,.05) 35%,rgba(2,10,18,.94) 100%)}
#${ID} .audienceImage::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,transparent 32%,rgba(2,9,17,.92) 100%)}
#${ID} .audiencePhoto{width:100%;height:100%;min-height:215px;object-fit:cover;object-position:center top;display:block;filter:saturate(.92)}
#${ID} .audienceFallback{position:absolute;inset:0;display:grid;place-items:center;font-size:42px;font-weight:950;color:rgba(0,220,255,.16);background:radial-gradient(circle at 50% 30%,rgba(0,220,255,.12),transparent 45%),#071522}
#${ID} .audienceContent{position:absolute;z-index:2;left:14px;right:14px;bottom:13px}
#${ID} .audienceContent b{display:block;font-size:12px}
#${ID} .audienceContent p{margin:4px 0 0;color:#a1b5c6;font-size:8.5px;line-height:1.45}
#${ID} .faqLayout{display:grid;grid-template-columns:.82fr 1.18fr;gap:50px;align-items:start}
#${ID} .faqTitle h2{margin:9px 0 12px;font-size:clamp(31px,4vw,46px);line-height:1;letter-spacing:-.05em}
#${ID} .faqTitle p{margin:0;color:#8ca2b6;font-size:13px;line-height:1.7}
#${ID} .faqList{border-top:1px solid rgba(255,255,255,.09)}
#${ID} .faqItem{border-bottom:1px solid rgba(255,255,255,.09)}
#${ID} .faqButton{width:100%;min-height:55px;padding:0;display:flex;align-items:center;justify-content:space-between;gap:20px;border:0;background:none;color:#eaf5fc;text-align:left;cursor:pointer;font-size:11px;font-weight:800}
#${ID} .faqPlus{width:27px;height:27px;display:grid;place-items:center;flex:none;border-radius:8px;border:1px solid rgba(255,255,255,.10);color:#62dff3;transition:transform .25s ease,background .25s ease}
#${ID} .faqAnswer{max-height:0;overflow:hidden;color:#8198ad;font-size:10px;line-height:1.65;transition:max-height .35s ease,padding .35s ease}
#${ID} .faqItem.open .faqAnswer{max-height:130px;padding:0 45px 15px 0}
#${ID} .faqItem.open .faqPlus{transform:rotate(45deg);background:rgba(0,220,255,.06)}
#${ID} .finalCta{position:relative;overflow:hidden;display:grid;grid-template-columns:1fr auto;align-items:center;gap:30px;padding:31px;margin:20px 0 70px;border-radius:23px;border:1px solid rgba(0,222,255,.15);background:radial-gradient(circle at 20% 0,rgba(0,225,255,.13),transparent 40%),linear-gradient(135deg,rgba(9,71,110,.32),rgba(4,35,57,.18))}
#${ID} .finalCta h2{margin:8px 0 7px;font-size:clamp(25px,3vw,36px);line-height:1.04;letter-spacing:-.04em}
#${ID} .finalCta p{margin:0;color:#8fa5b8;font-size:11px;line-height:1.6}
#${ID} .rocket{width:48px;height:48px;display:grid;place-items:center;margin-bottom:10px;border-radius:14px;color:#00e2ff;border:1px solid rgba(0,220,255,.2);background:rgba(0,220,255,.06);font-size:21px}
#${ID} .finalActions{display:flex;align-items:center;gap:10px}
#${ID} .footer{padding:25px 0 40px;border-top:1px solid rgba(255,255,255,.07)}
#${ID} .footerInner{display:flex;align-items:center;justify-content:space-between;gap:20px;color:#6e859b;font-size:9px}
#${ID} .footerBrand{color:#a9c0d2;font-weight:850}
#${ID} .footerSub{display:block;margin-top:4px;color:#657c92;font-size:8px;font-weight:500}
#${ID} .footerLinks{display:flex;gap:18px}
#${ID} .footerLinks button{border:0;background:none;color:#7890a5;font-size:9px;cursor:pointer}
#${ID} .reveal{opacity:0;transform:translateY(24px);transition:opacity .7s cubic-bezier(.2,.7,.2,1),transform .7s cubic-bezier(.2,.7,.2,1)}
#${ID} .reveal.visible{opacity:1;transform:translateY(0)}
@media(max-width:1100px){#${ID} .navLinks{gap:18px}#${ID} .moduleGrid{grid-template-columns:repeat(3,minmax(0,1fr))}#${ID} .audienceGrid{grid-template-columns:repeat(3,minmax(0,1fr))}}
@media(max-width:900px){#${ID} .navLinks{display:none}#${ID} .navMobileToggle{display:grid;place-items:center;width:40px;height:40px;border:1px solid rgba(255,255,255,.13);border-radius:11px;background:rgba(255,255,255,.035);color:#eaf7ff;cursor:pointer}#${ID} .navActions{margin-left:auto}#${ID} .hero{grid-template-columns:1fr;padding:56px 0 60px}#${ID} .heroTitle{max-width:800px}#${ID} .heroVisual{width:min(760px,100%);margin:auto}#${ID} .controlBand{grid-template-columns:1fr}#${ID} .bandVisual{min-height:330px}#${ID} .faqLayout{grid-template-columns:1fr;gap:30px}}
@media(max-width:640px){#${ID} .wrap,#${ID} .container,#${ID} .navInner{width:calc(100% - 24px)}#${ID} .nav{min-height:65px}#${ID} .brand{gap:8px}#${ID} .mark{width:37px;height:37px;border-radius:11px}#${ID} .brandText b{font-size:11px}#${ID} .brandText small{font-size:6.5px}#${ID} .navActions .btn{min-height:39px;padding:8px 11px;font-size:9px}#${ID} .navActions .btn:first-child{display:none}#${ID} .hero{min-height:auto;padding:40px 0 45px;gap:30px}#${ID} .heroTitle{margin-top:17px;font-size:clamp(40px,11.7vw,56px);line-height:.94}#${ID} .heroText{font-size:13.5px;line-height:1.65}#${ID} .heroCta{display:grid;grid-template-columns:1fr;margin-top:22px}#${ID} .heroCta .btn{width:100%}#${ID} .heroProof{grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}#${ID} .proofItem{font-size:8px}#${ID} .proofIcon{width:25px;height:25px}#${ID} .desktopDevice{padding:7px;border-radius:17px;transform:none}#${ID} .deviceBar{height:19px}#${ID} .screen{min-height:220px}#${ID} .screen img{min-height:220px}#${ID} .heroPhone{width:103px;right:-5px;bottom:-27px;padding:5px;border-radius:17px}#${ID} .phoneScreen{border-radius:12px}#${ID} .phoneScreen img{min-height:190px}#${ID} .phoneFallback{min-height:190px}#${ID} .phoneChart{height:62px}#${ID} .laptopBase{height:9px}#${ID} .section{padding:50px 0}#${ID} .sectionHeader{align-items:flex-start;flex-direction:column;gap:12px}#${ID} .sectionTitle h2,#${ID} .audienceHeader h2,#${ID} .faqTitle h2{font-size:31px}#${ID} .moduleGrid{display:flex;overflow-x:auto;gap:9px;margin-right:-12px;padding-right:12px;padding-bottom:9px;scroll-snap-type:x mandatory;scrollbar-width:none}#${ID} .moduleGrid::-webkit-scrollbar{display:none}#${ID} .moduleCard{flex:0 0 220px;min-height:205px;scroll-snap-align:start}#${ID} .moduleImage{height:113px}#${ID} .controlBand{padding:21px;border-radius:19px}#${ID} .controlBand h2{font-size:30px}#${ID} .trustList{grid-template-columns:1fr}#${ID} .bandVisual{min-height:225px}#${ID} .bandDevice{inset:5px 0 0 0;transform:none}#${ID} .bandDevice img{min-height:200px}#${ID} .audienceGrid{display:flex;overflow-x:auto;gap:9px;margin-right:-12px;padding-right:12px;padding-bottom:8px;scroll-snap-type:x mandatory;scrollbar-width:none}#${ID} .audienceGrid::-webkit-scrollbar{display:none}#${ID} .audienceCard{flex:0 0 185px;min-height:210px;scroll-snap-align:start}#${ID} .faqButton{min-height:58px;font-size:10px}#${ID} .finalCta{grid-template-columns:1fr;padding:22px;margin-bottom:50px}#${ID} .finalActions{width:100%;display:grid;grid-template-columns:1fr}#${ID} .finalActions .btn{width:100%}#${ID} .footerInner{align-items:flex-start;flex-direction:column}#${ID} .footerLinks{flex-wrap:wrap}}
@media(max-width:390px){#${ID} .heroTitle{font-size:39px}#${ID} .heroProof{grid-template-columns:1fr 1fr}#${ID} .moduleCard{flex-basis:205px}#${ID} .audienceCard{flex-basis:170px}}
@media(prefers-reduced-motion:reduce){#${ID},#${ID} *{scroll-behavior:auto!important}#${ID} *,#${ID} *::before,#${ID} *::after{animation:none!important;transition:none!important}#${ID} .heroWord,#${ID} .reveal{opacity:1!important;filter:none!important;transform:none!important}}
@keyframes b230Float{0%,100%{transform:translate3d(0,0,0)}50%{transform:translate3d(0,-24px,0)}}
@keyframes b230DeviceIn{from{opacity:0;transform:perspective(1500px) rotateY(-12deg) translateY(22px)}to{opacity:1;transform:perspective(1500px) rotateY(-5deg) rotateX(2deg) translateY(0)}}
@keyframes b230PhoneFloat{0%,100%{transform:rotateY(-7deg) rotateZ(1deg) translateY(0)}50%{transform:rotateY(-7deg) rotateZ(1deg) translateY(-8px)}}
@keyframes b230Pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.035)}}
@keyframes b230Glow{0%,100%{box-shadow:0 0 0 0 rgba(0,225,255,0)}50%{box-shadow:0 0 0 7px rgba(0,225,255,.075),0 15px 38px rgba(0,205,225,.27)}}
`;
 document.head.appendChild(s);
}

function html(){
return `<div id="${ID}" role="dialog" aria-label="Control Financiero" aria-modal="true">
<div class="scrollProgress"></div>
<div class="page">
<div class="ambient a"></div><div class="ambient b"></div><div class="ambient c"></div>

<nav class="nav"><div class="navInner">
<div class="brand"><div class="mark">CCF</div><div class="brandText"><b>CONTROL FINANCIERO</b><small>CENTRO DE CONTROL FINANCIERO</small></div></div>
<div class="navLinks">
<button class="navLink active" data-scroll-target="inicio">Inicio</button>
<button class="navLink" data-scroll-target="funcionalidades">Funcionalidades</button>
<button class="navLink" data-scroll-target="precios">Precios</button>
<button class="navLink" data-scroll-target="faq">Preguntas Frecuentes</button>
<button class="navLink" data-scroll-target="contacto">Contacto</button>
</div>
<div class="navActions">
<button class="btn" data-b230-open="register">Crear cuenta</button>
<button class="btn primary" data-b230-open="login">Ingresar</button>
<button class="navMobileToggle" aria-label="Abrir navegación" aria-expanded="false">☰</button>
</div>
</div></nav>

<main>
<section class="hero container" id="inicio">
<div class="heroCopy">
<span class="eyebrow">CONTROL · LIQUIDEZ · PROYECCIÓN</span>
<h1 class="heroTitle" aria-label="Convierte tus finanzas en un sistema de control.">
<span class="heroWord">Convierte</span><span class="heroWord">tus</span><span class="heroWord">finanzas</span><span class="heroWord">en</span><span class="heroWord">un</span><span class="heroWord heroGrad">sistema</span><span class="heroWord heroGrad">de</span><span class="heroWord heroGrad">control.</span>
</h1>
<p class="heroText">Registra movimientos, organiza compromisos, controla deudas, proyecta tu liquidez y toma decisiones con una visión financiera integrada desde un solo lugar.</p>
<div class="heroCta">
<button class="btn primary loginPulse" data-b230-open="login">Comenzar ahora&nbsp; →</button>
<button class="btn" data-scroll-target="funcionalidades">Ver funcionalidades</button>
</div>
<div class="heroProof">
<div class="proofItem"><span class="proofIcon">✓</span><span>Seguro<br>y privado</span></div>
<div class="proofItem"><span class="proofIcon">▣</span><span>Acceso en todos<br>tus dispositivos</span></div>
<div class="proofItem"><span class="proofIcon">☁</span><span>Tus datos<br>siempre contigo</span></div>
<div class="proofItem"><span class="proofIcon">ϟ</span><span>Interfaz rápida<br>y moderna</span></div>
</div>
</div>

<div class="heroVisual">
<div class="desktopDevice">
<div class="deviceBar"><div class="deviceDots"><i></i><i></i><i></i></div><span>Control Financiero · Resumen</span></div>
<div class="screen">
<img class="realDesktopImage" src="${REAL_ASSETS.desktop}" alt="Resumen financiero real de Control Financiero" loading="eager" decoding="async">
<div class="screenFallback">
<div class="fakeAppTop"><span>Control Financiero</span><span>Resumen financiero</span></div>
<div class="fakeTabs"><span class="fakeTab">Presupuesto</span><span class="fakeTab">Movimientos</span><span class="fakeTab active">Resumen</span><span class="fakeTab">Calendario</span><span class="fakeTab">Deudas</span></div>
<div class="fakeStats"><div class="fakeStat"><small>Liquidez inicial</small><b>$36.891</b></div><div class="fakeStat"><small>Ingresos</small><b>$1.472.358</b></div><div class="fakeStat"><small>Gastos</small><b>$1.861.044</b></div><div class="fakeStat"><small>Proyección</small><b>-$351.795</b></div></div>
<div class="fakeChart"><svg viewBox="0 0 700 180" preserveAspectRatio="none"><path d="M0 155 L50 145 L100 150 L150 115 L200 135 L250 85 L300 125 L350 60 L400 120 L450 76 L500 95 L550 40 L610 90 L700 65" fill="none" stroke="#18a86b" stroke-width="5" stroke-linecap="round"/><path d="M0 170 L50 168 L100 150 L150 164 L200 125 L250 152 L300 108 L350 150 L400 115 L450 135 L500 88 L550 122 L610 100 L700 130" fill="none" stroke="#ef4654" stroke-width="5" stroke-linecap="round"/></svg></div>
</div></div>
<div class="laptopBase"></div>
</div>
<div class="heroPhone"><div class="phoneScreen">
<img class="realMobileImage" src="${REAL_ASSETS.mobile}" alt="Control Financiero en dispositivo móvil" loading="eager" decoding="async">
<div class="phoneFallback"><div class="phoneFallbackTop"><span>CCF</span><span>Resumen</span></div><div class="phoneCards"><div class="phoneCard"><small>Liquidez</small><b>$36.891</b></div><div class="phoneCard"><small>Ingresos</small><b>$1.472.358</b></div><div class="phoneCard"><small>Gastos</small><b>$1.861.044</b></div><div class="phoneCard"><small>Proyección</small><b>-$351.795</b></div></div><div class="phoneChart"><svg viewBox="0 0 220 100" preserveAspectRatio="none"><path d="M0 85 C25 75 35 80 55 70 S85 65 105 50 S135 65 155 40 S190 35 220 18" fill="none" stroke="#17a968" stroke-width="4"/></svg></div></div>
</div></div>
</div>
</section>

<section class="section container reveal" id="funcionalidades">
<div class="sectionHeader"><div class="sectionTitle"><span class="eyebrow">TODO EN UN MISMO SISTEMA</span><h2>Una visión financiera conectada.</h2><p>Herramientas simples y poderosas, diseñadas para acompañarte desde el registro diario hasta la planificación y la proyección.</p></div><button class="sectionLink" data-scroll-target="contacto">Conoce el sistema <span>→</span></button></div>
<div class="moduleGrid">
${[
 ['resumen','desktop','Resumen','Panel financiero con visión consolidada, ingresos, gastos y proyecciones.'],
 ['calendario','calendar','Calendario','Visualiza compromisos, pagos y eventos en un solo lugar.'],
 ['movimientos','movements','Movimientos','Registra tus ingresos y gastos de forma simple y ordenada.'],
 ['presupuesto','budget','Presupuesto','Define límites, controla tus gastos y visualiza tu progreso.'],
 ['deudas','debts','Deudas','Gestiona deudas, cuotas, vencimientos y pagos.'],
 ['planificacion','planning','Planificación','Anticipa tu futuro financiero con escenarios de liquidez.']
].map(([module,key,title,desc])=>`
<article class="moduleCard" data-module="${module}">
<div class="moduleImage"><img src="${REAL_ASSETS[key]}" alt="${title} financiero" loading="lazy"><div class="moduleImageFallback"><strong>${title}</strong><div class="line accent"></div><div class="line"></div><div class="line"></div></div></div>
<div class="moduleInfo"><b>${title}</b><p>${desc}</p></div>
</article>`).join('')}
</div>
</section>

<section class="section container reveal">
<div class="controlBand">
<div><span class="eyebrow">DISEÑADO PARA TU DÍA A DÍA</span><h2>Tu información. Tu planificación. Tu control.</h2><p>Accede desde tu celular, tablet o computador con una experiencia rápida, visual e intuitiva, sin perder trazabilidad.</p>
<div class="trustList">
<div class="trustItem"><span class="trustIcon">▥</span><span>Información clara y centralizada</span></div>
<div class="trustItem"><span class="trustIcon">◉</span><span>Decisiones basadas en tus datos</span></div>
<div class="trustItem"><span class="trustIcon">▣</span><span>Acceso desde cualquier dispositivo</span></div>
<div class="trustItem"><span class="trustIcon">ϟ</span><span>Interfaz rápida y moderna</span></div>
</div></div>
<div class="bandVisual"><div class="bandDevice"><img src="${REAL_ASSETS.desktop}" alt="Vista real del sistema Control Financiero" loading="lazy"></div></div>
</div>
</section>

<section class="section container reveal" id="precios">
<div class="audienceHeader"><span class="eyebrow">PENSADO PARA DISTINTAS REALIDADES</span><h2>¿Para quién es Control Financiero?</h2><p>Una herramienta flexible para organizar, controlar y planificar diferentes realidades financieras.</p></div>
<div class="audienceGrid">
${[
 ['audiencia-emprendedores.jpg','Emprendedores','Controla ingresos, costos y evolución de tu actividad.','$'],
 ['audiencia-empresarios.jpg','Empresarios','Toma decisiones utilizando información financiera organizada.','▥'],
 ['audiencia-independientes.jpg','Independientes','Gestiona actividad, ingresos y gastos desde un solo lugar.','◎'],
 ['audiencia-duenos-negocio.jpg','Dueños de negocio','Organiza ventas, compras, deudas y planificación.','◇'],
 ['audiencia-hogar.jpg','Hogar','Lleva el control de ingresos, gastos y presupuesto familiar.','⌂']
].map(([src,title,desc,fallback])=>`
<article class="audienceCard"><div class="audienceImage"><div class="audienceFallback">${fallback}</div><img class="audiencePhoto" src="./assets/${src}" alt="${title}" loading="lazy"></div><div class="audienceContent"><b>${title}</b><p>${desc}</p></div></article>`).join('')}
</div>
</section>

<section class="section container reveal" id="faq">
<div class="faqLayout">
<div class="faqTitle"><span class="eyebrow">PREGUNTAS FRECUENTES</span><h2>¿Tienes dudas? Aquí te ayudamos.</h2><p>Resolvemos las preguntas más comunes sobre Control Financiero y su funcionamiento.</p></div>
<div class="faqList">
${[
 ['¿Es gratuito el sistema?','Control Financiero se encuentra en una etapa inicial de implementación y evolución. Las condiciones comerciales definitivas se informarán antes de la incorporación de cualquier modalidad de pago.'],
 ['¿Mis datos están seguros?','El sistema utiliza autenticación y una infraestructura de datos asociada a la cuenta del usuario. Las condiciones específicas de privacidad y tratamiento de datos estarán disponibles en la documentación correspondiente.'],
 ['¿Puedo usarlo desde mi celular?','Sí. La interfaz está siendo desarrollada con adaptación responsive para escritorio y dispositivos móviles.'],
 ['¿Necesito conocimientos financieros?','No se plantea como requisito. La interfaz está orientada a organizar información financiera cotidiana mediante módulos visuales y estructurados.'],
 ['¿Puedo acceder desde distintos dispositivos?','La arquitectura responsive permite utilizar la interfaz desde diferentes tamaños de pantalla, manteniendo la cuenta y sus datos asociados.']
].map(([q,a])=>`<div class="faqItem"><button class="faqButton" aria-expanded="false"><span>${q}</span><span class="faqPlus">+</span></button><div class="faqAnswer">${a}</div></div>`).join('')}
</div></div>
</section>

<section class="container reveal" id="contacto">
<div class="finalCta">
<div><div class="rocket">🚀</div><span class="eyebrow">EMPIEZA HOY</span><h2>Toma el control de tus finanzas.</h2><p>Organiza tu información, comprende tu situación financiera y planifica con una visión integrada.</p></div>
<div class="finalActions"><button class="btn primary loginPulse" data-b230-open="login">Comenzar ahora&nbsp; →</button></div>
</div>
</section>
</main>

<footer class="footer"><div class="container footerInner">
<div><span class="footerBrand">CCF · CENTRO DE CONTROL FINANCIERO</span><span class="footerSub">Producto desarrollado por Somos Software · Innovación Digital</span></div>
<div class="footerLinks"><button data-scroll-target="inicio">Inicio</button><button data-scroll-target="funcionalidades">Funcionalidades</button><button data-scroll-target="faq">Preguntas frecuentes</button><button data-scroll-target="contacto">Contacto</button></div>
</div></footer>

</div></div>`;
}

function removePortal(){
 const p=document.getElementById(ID);
 if(p)p.remove();
 document.body.classList.remove('b230-portal-active');
 document.body.style.overflow='';
}

function setupImageFallbacks(){
 const root=document.getElementById(ID);
 if(!root)return;
 $$('.realDesktopImage',root).forEach(img=>img.addEventListener('error',()=>{img.style.display='none';img.nextElementSibling?.classList.add('visible')},{once:true}));
 $$('.realMobileImage',root).forEach(img=>img.addEventListener('error',()=>{img.style.display='none';if(img.nextElementSibling)img.nextElementSibling.style.display='block'},{once:true}));
 $$('.moduleImage img',root).forEach(img=>img.addEventListener('error',()=>{img.style.display='none';if(img.nextElementSibling)img.nextElementSibling.style.display='flex'},{once:true}));
 $$('.bandDevice img',root).forEach(img=>img.addEventListener('error',()=>{img.style.display='none';if(img.parentElement)img.parentElement.style.background='linear-gradient(145deg,#eef4f9,#dbe7f0)'},{once:true}));
 $$('.audiencePhoto',root).forEach(img=>img.addEventListener('error',()=>{img.style.display='none'},{once:true}));
}

function animatePremiumHero(){
 const root=document.getElementById(ID);
 if(!root)return;
 const words=$$('.heroWord',root);
 const reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 if(reduce){words.forEach(w=>w.classList.add('is-visible'));return}
 words.forEach(w=>w.classList.remove('is-visible'));
 words.forEach((word,index)=>window.setTimeout(()=>word.classList.add('is-visible'),130+(index*155)));
}

function initReveal(){
 const root=document.getElementById(ID);
 if(!root)return;
 const items=$$('.reveal',root);
 if(!('IntersectionObserver' in window)){items.forEach(el=>el.classList.add('visible'));return;}
 const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target)}}),{threshold:.12,rootMargin:'0px 0px -40px 0px'});
 items.forEach(el=>observer.observe(el));
}

function initScrollProgress(){
 const root=document.getElementById(ID);
 if(!root)return;
 const bar=$('.scrollProgress',root);
 const update=()=>{
   const max=root.scrollHeight-root.clientHeight;
   bar.style.width=max<=0?'0%':Math.max(0,Math.min(100,(root.scrollTop/max)*100))+'%';
 };
 root.addEventListener('scroll',update,{passive:true});
 update();
}

function scrollToTarget(target){
 const root=document.getElementById(ID);
 if(!root)return;
 const el=typeof target==='string'?$('#'+target,root):target;
 if(!el)return;
 const top=el.getBoundingClientRect().top+root.scrollTop-82;
 root.scrollTo({top:Math.max(0,top),behavior:window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
}

function initNavigation(){
 const root=document.getElementById(ID);
 if(!root)return;
 $$('[data-scroll-target]',root).forEach(button=>button.addEventListener('click',()=>scrollToTarget(button.dataset.scrollTarget)));
 const sections=['inicio','funcionalidades','precios','faq','contacto'].map(id=>$('#'+id,root)).filter(Boolean);
 if(!('IntersectionObserver' in window))return;
 const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
   if(!entry.isIntersecting)return;
   const id=entry.target.id;
   $$('.navLink',root).forEach(link=>link.classList.toggle('active',link.dataset.scrollTarget===id));
 }),{root:root,threshold:.18,rootMargin:'-18% 0px -58% 0px'});
 sections.forEach(section=>observer.observe(section));
}

function initMobileMenu(){
 const root=document.getElementById(ID);
 if(!root)return;
 const toggle=$('.navMobileToggle',root);
 if(!toggle)return;
 toggle.addEventListener('click',()=>{
   let menu=$('.mobileMenu',root);
   if(menu){menu.remove();toggle.setAttribute('aria-expanded','false');return;}
   menu=document.createElement('div');
   menu.className='mobileMenu';
   menu.innerHTML='<button data-scroll-target="inicio">Inicio</button><button data-scroll-target="funcionalidades">Funcionalidades</button><button data-scroll-target="precios">Precios</button><button data-scroll-target="faq">Preguntas frecuentes</button><button data-scroll-target="contacto">Contacto</button>';
   Object.assign(menu.style,{position:'fixed',top:'65px',left:'12px',right:'12px',zIndex:'90',padding:'8px',display:'grid',gap:'4px',border:'1px solid rgba(255,255,255,.12)',borderRadius:'15px',background:'rgba(3,10,20,.96)',backdropFilter:'blur(18px)',boxShadow:'0 22px 55px rgba(0,0,0,.45)'});
   $$('.mobileMenu button',menu).forEach(button=>{
     Object.assign(button.style,{minHeight:'44px',padding:'10px 12px',border:'0',borderRadius:'10px',background:'rgba(255,255,255,.035)',color:'#eaf5fc',textAlign:'left',fontSize:'11px',fontWeight:'800',cursor:'pointer'});
     button.addEventListener('click',()=>{scrollToTarget(button.dataset.scrollTarget);menu.remove();toggle.setAttribute('aria-expanded','false');});
   });
   root.appendChild(menu);
   toggle.setAttribute('aria-expanded','true');
 });
}

function initFAQ(){
 const root=document.getElementById(ID);
 if(!root)return;
 $$('.faqButton',root).forEach(button=>button.addEventListener('click',()=>{
   const item=button.closest('.faqItem');
   if(!item)return;
   const wasOpen=item.classList.contains('open');
   $$('.faqItem',root).forEach(other=>{other.classList.remove('open');const b=$('.faqButton',other);if(b)b.setAttribute('aria-expanded','false')});
   if(!wasOpen){item.classList.add('open');button.setAttribute('aria-expanded','true');}
 }));
}

function initCardInteractions(){
 const root=document.getElementById(ID);
 if(!root)return;
 $$('.moduleCard',root).forEach(card=>{
   card.addEventListener('pointermove',event=>{
     if(window.matchMedia('(max-width:900px)').matches)return;
     const rect=card.getBoundingClientRect();
     const x=(event.clientX-rect.left)/rect.width-.5;
     const y=(event.clientY-rect.top)/rect.height-.5;
     card.style.transform=`perspective(700px) rotateX(${(-y*3).toFixed(2)}deg) rotateY(${(x*4).toFixed(2)}deg) translateY(-5px)`;
   });
   card.addEventListener('pointerleave',()=>{card.style.transform=''});
 });
}

function findAuthGate(){return document.getElementById('ccf-auth-gate')}
async function waitForGate(timeout=5000){
 for(let i=0;i<timeout/100;i++){const g=findAuthGate();if(g)return g;await sleep(100)}
 return null;
}

async function openExistingAuth(mode){
 const gate=await waitForGate();
 if(!gate){
   try{
     const c=window.supabaseClient||window.__B23273_CLIENT__||window.__B23270_CLIENT__||window.__B23269_CLIENT__;
     const session=c?.auth?(await c.auth.getSession()).data?.session:null;
     if(session){removePortal();return}
   }catch(_){}
   alert('La autenticación todavía está cargando. Intenta nuevamente en unos segundos.');
   return;
 }
 removePortal();
 const re=mode==='register'?/crear|registr/i:/iniciar|sesión|login|ingresar|entrar/i;
 const target=[...gate.querySelectorAll('button')].find(b=>re.test((b.textContent||'').trim()));
 if(target)target.click();else gate.querySelector('input')?.focus();
}

function bind(){
 const root=document.getElementById(ID);
 if(!root)return;
 $$('[data-b230-open]',root).forEach(button=>button.addEventListener('click',()=>openExistingAuth(button.dataset.b230Open)));
}

async function watchAuth(){
 for(let i=0;i<80;i++){
   const c=window.supabaseClient||window.__B23273_CLIENT__||window.__B23270_CLIENT__||window.__B23269_CLIENT__;
   if(c?.auth){
     try{
       const {data}=await c.auth.getSession();
       if(data?.session){removePortal();return}
       c.auth.onAuthStateChange((_event,session)=>{if(session)removePortal()});
     }catch(_){}
     return;
   }
   await sleep(100);
 }
}

function boot(){
 style();
 if(!document.getElementById(ID))document.body.insertAdjacentHTML('afterbegin',html());
 document.body.classList.add('b230-portal-active');
 document.body.style.overflow='hidden';
 animatePremiumHero();
 setupImageFallbacks();
 initReveal();
 initScrollProgress();
 initNavigation();
 initMobileMenu();
 initFAQ();
 initCardInteractions();
 bind();
 watchAuth();
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
else boot();

})();