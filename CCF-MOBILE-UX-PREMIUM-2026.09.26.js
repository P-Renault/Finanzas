/* CCF MOBILE UX PREMIUM v2
   UI-only layer. No database writes, no auth changes, no financial calculations.
   Designed for the existing CCF Production DOM.
*/
(function(){
  'use strict';
  if(window.__CCF_MOBILE_UX_PREMIUM_V2__) return;
  window.__CCF_MOBILE_UX_PREMIUM_V2__=true;

  var STYLE_ID='ccf-mobile-ux-v2-style';
  var bottomId='ccf-mobile-bottom-v2';
  var moreId='ccf-mobile-more-v2';

  function ready(fn){
    if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',fn,{once:true});
    else fn();
  }

  function injectStyle(){
    if(document.getElementById(STYLE_ID)) return;
    var s=document.createElement('style'); s.id=STYLE_ID;
    s.textContent=`
:root{--ccf-navy:#111827;--ccf-navy2:#172033;--ccf-blue:#2563eb;--ccf-bg:#f4f6f8;--ccf-card:#fff;--ccf-border:#e2e8f0;--ccf-muted:#64748b;--ccf-green:#0f766e;--ccf-red:#b91c1c;--ccf-shadow:0 8px 28px rgba(15,23,42,.07)}
body.ccf-ux-v2{background:var(--ccf-bg);-webkit-tap-highlight-color:transparent}
body.ccf-ux-v2 *{scroll-margin-top:72px}
body.ccf-ux-v2 button,body.ccf-ux-v2 a,body.ccf-ux-v2 input,body.ccf-ux-v2 select{touch-action:manipulation}
body.ccf-ux-v2 .topbar{position:sticky;top:0;z-index:900;background:linear-gradient(135deg,#0f172a,#172033);box-shadow:0 4px 22px rgba(15,23,42,.16);padding:15px max(14px,calc((100vw - 1180px)/2)) 14px;min-height:70px}
body.ccf-ux-v2 .topbar h1{font-size:22px;letter-spacing:-.025em;margin:0}
body.ccf-ux-v2 .topbar p{font-size:12px;line-height:1.35;margin:3px 0 0;color:#a9bad0}
body.ccf-ux-v2 .topbar #logoutBtn{min-height:42px;border-radius:12px;padding:8px 13px}
body.ccf-ux-v2 .container{max-width:1180px;padding:12px 14px 30px;margin:auto}
body.ccf-ux-v2 .tabs{position:sticky;top:70px;z-index:800;display:flex;gap:7px;align-items:center;padding:8px 0;margin:0 0 12px;background:rgba(244,246,248,.94);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);overflow-x:auto;scrollbar-width:none}
body.ccf-ux-v2 .tabs::-webkit-scrollbar{display:none}
body.ccf-ux-v2 .tabs button{min-height:44px;border-radius:13px;padding:9px 13px;white-space:nowrap;font-weight:800;font-size:12px;transition:transform .12s,box-shadow .12s,background .12s}
body.ccf-ux-v2 .tabs button:active{transform:scale(.97)}
body.ccf-ux-v2 .card,body.ccf-ux-v2 .panel,body.ccf-ux-v2 .kpi-card,body.ccf-ux-v2 .executive-chart,body.ccf-ux-v2 .executive-insights article{border:1px solid var(--ccf-border);box-shadow:var(--ccf-shadow);border-radius:16px}
body.ccf-ux-v2 .ccf-monthly-summary{border-radius:18px;box-shadow:var(--ccf-shadow)}
body.ccf-ux-v2 input,body.ccf-ux-v2 select,body.ccf-ux-v2 textarea{min-height:46px;border-radius:11px;box-sizing:border-box}
body.ccf-ux-v2 button{min-height:44px;border-radius:11px}
body.ccf-ux-v2 .ccf-mobile-section-title{display:flex;align-items:center;gap:9px;margin:2px 2px 10px;color:#334155;font-weight:900;font-size:11px;letter-spacing:.09em;text-transform:uppercase}
body.ccf-ux-v2 .ccf-mobile-section-title:before{content:"";width:4px;height:18px;border-radius:99px;background:#2563eb}

#ccf-mobile-bottom-v2{display:none}
#ccf-mobile-more-v2{display:none}
#ccf-mobile-more-v2.open{display:block}
#ccf-mobile-more-v2 .backdrop{position:fixed;inset:0;background:rgba(15,23,42,.52);z-index:1000000;backdrop-filter:blur(3px)}
#ccf-mobile-more-v2 .sheet{position:fixed;left:0;right:0;bottom:0;z-index:1000001;background:#fff;border-radius:23px 23px 0 0;padding:12px 14px calc(18px + env(safe-area-inset-bottom));box-shadow:0 -18px 50px rgba(15,23,42,.22);max-height:82vh;overflow:auto}
#ccf-mobile-more-v2 .handle{width:42px;height:4px;border-radius:99px;background:#cbd5e1;margin:0 auto 14px}
#ccf-mobile-more-v2 .title{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}
#ccf-mobile-more-v2 .title strong{font-size:18px;color:#111827}
#ccf-mobile-more-v2 .close{width:40px;height:40px;border:0;border-radius:50%;background:#f1f5f9;color:#111827;font-size:20px}
#ccf-mobile-more-v2 .grid{display:grid;grid-template-columns:1fr 1fr;gap:9px}
#ccf-mobile-more-v2 .grid button{min-height:52px;text-align:left;border:1px solid #e2e8f0;background:#f8fafc;color:#172033;font-weight:800;padding:10px 12px}
#ccf-mobile-more-v2 .grid button.active{background:#111827;color:#fff;border-color:#111827}

@media(max-width:720px){
 body.ccf-ux-v2{padding-bottom:82px}
 body.ccf-ux-v2 .topbar{position:sticky;top:0;padding:13px 12px 12px;min-height:64px}
 body.ccf-ux-v2 .topbar h1{font-size:21px}
 body.ccf-ux-v2 .topbar p{font-size:11px;max-width:270px}
 body.ccf-ux-v2 .topbar #logoutBtn{min-height:40px;padding:7px 11px}
 body.ccf-ux-v2 .container{padding:9px 10px 24px}
 body.ccf-ux-v2 .tabs{top:64px;margin:0 -10px 10px;padding:7px 10px;overflow:visible}
 body.ccf-ux-v2 .tabs button{display:none}
 body.ccf-ux-v2 .tabs button[data-tab="dashboard"],body.ccf-ux-v2 .tabs button[data-tab="movimientos"],body.ccf-ux-v2 .tabs button[data-tab="deudas"],body.ccf-ux-v2 .tabs button[data-tab="cuentas"]{display:flex;flex:1 1 0;min-width:0;justify-content:center;align-items:center;padding:8px 6px;font-size:11px}
 body.ccf-ux-v2 .tabs .ccf-more-top{display:flex;flex:0 0 48px;align-items:center;justify-content:center;padding:8px 5px;background:#e2e8f0;color:#111827;font-size:11px}
 #ccf-mobile-bottom-v2{position:fixed;left:0;right:0;bottom:0;z-index:999999;display:grid;grid-template-columns:repeat(5,1fr);gap:3px;padding:6px 7px calc(6px + env(safe-area-inset-bottom));background:rgba(255,255,255,.96);backdrop-filter:blur(15px);-webkit-backdrop-filter:blur(15px);border-top:1px solid #e2e8f0;box-shadow:0 -9px 30px rgba(15,23,42,.10)}
 #ccf-mobile-bottom-v2 button{border:0;background:transparent;color:#64748b;min-height:54px;border-radius:13px;padding:5px 2px;font-weight:800;font-size:9px;line-height:1.1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px}
 #ccf-mobile-bottom-v2 button .ico{font-size:18px;line-height:1}
 #ccf-mobile-bottom-v2 button.active{background:#111827;color:#fff}
 body.ccf-ux-v2 #financial-control .summary-header{padding:15px;border-radius:17px;margin-bottom:9px}
 body.ccf-ux-v2 #financial-control .summary-header h2{font-size:21px;line-height:1.15}
 body.ccf-ux-v2 #financial-control .kpi-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
 body.ccf-ux-v2 #financial-control .kpi-card{min-height:92px;padding:13px;border-radius:15px}
 body.ccf-ux-v2 #financial-control .kpi-card span{font-size:10px;line-height:1.25}
 body.ccf-ux-v2 #financial-control .kpi-card strong{font-size:18px;margin-top:6px;letter-spacing:-.02em}
 body.ccf-ux-v2 .ccf-monthly-summary{padding:14px;border-radius:17px;margin-bottom:9px}
 body.ccf-ux-v2 .ccf-monthly-summary-head{margin-bottom:12px}
 body.ccf-ux-v2 .ccf-monthly-summary-head h2{font-size:17px;line-height:1.2}
 body.ccf-ux-v2 .ccf-monthly-kpis{grid-template-columns:1fr 1fr;gap:7px;margin-bottom:10px}
 body.ccf-ux-v2 .ccf-monthly-kpi{padding:11px;border-radius:12px}
 body.ccf-ux-v2 .ccf-monthly-kpi span{font-size:9px}
 body.ccf-ux-v2 .ccf-monthly-kpi strong{font-size:15px}
 body.ccf-ux-v2 .ccf-monthly-future-grid{grid-template-columns:1fr}
 body.ccf-ux-v2 .card{padding:14px;border-radius:16px;margin-bottom:10px}
 body.ccf-ux-v2 .card h2{font-size:18px}
 body.ccf-ux-v2 .grid2{grid-template-columns:1fr;gap:10px}
 body.ccf-ux-v2 .form-actions{display:grid;grid-template-columns:1fr;gap:8px}
 body.ccf-ux-v2 .form-actions button{width:100%}
 body.ccf-ux-v2 .executive-insights{display:grid;grid-template-columns:1fr 1fr;gap:8px}
 body.ccf-ux-v2 .executive-insights article{padding:11px;border-radius:14px}
 body.ccf-ux-v2 .executive-insights article span{font-size:9px}
 body.ccf-ux-v2 .executive-insights article strong{font-size:12px;line-height:1.3}
 body.ccf-ux-v2 .executive-charts{display:block}
 body.ccf-ux-v2 .executive-chart{margin-top:8px;border-radius:15px;overflow:hidden}
 body.ccf-ux-v2 .executive-chart h3{font-size:15px}
 body.ccf-ux-v2 .executive-chart p{font-size:10px;line-height:1.4}
 body.ccf-ux-v2 .calendar-card{border-radius:16px}
 body.ccf-ux-v2 .ccf-manual-button{width:100%;min-height:44px;border-radius:13px}
 body.ccf-ux-v2 .actions{display:grid;grid-template-columns:1fr 1fr;gap:7px}
 body.ccf-ux-v2 .actions button{width:100%;min-height:42px}
 body.ccf-ux-v2 .row{padding:13px 0}
 body.ccf-ux-v2 .tab{max-width:100%;overflow-x:hidden}
 body.ccf-ux-v2 table{display:block;max-width:100%;overflow-x:auto;-webkit-overflow-scrolling:touch}
}
@media(max-width:380px){body.ccf-ux-v2 #financial-control .kpi-card strong{font-size:16px}#ccf-mobile-bottom-v2 button{font-size:8px}}
`;
    document.head.appendChild(s);
  }

  var icon={dashboard:'⌂',movimientos:'↕',deudas:'▣',cuentas:'▤',futuros:'◷',calendario:'▦',ahorro:'◎',operaciones:'⚙',planificacion:'◈',presupuesto:'▤'};

  function tabs(){return Array.prototype.slice.call(document.querySelectorAll('.tabs button[data-tab]'));}
  function current(){var b=document.querySelector('.tabs button.active');return b?b.getAttribute('data-tab'):'dashboard'}
  function clickTab(tab){var b=document.querySelector('.tabs button[data-tab="'+tab+'"]');if(b){b.click();sync();closeMore();window.scrollTo({top:0,behavior:'smooth'});}}

  function buildMore(){
    if(document.getElementById(moreId)) return;
    var r=document.createElement('div');r.id=moreId;
    r.innerHTML='<div class="backdrop" data-close="1"></div><div class="sheet" role="dialog" aria-modal="true" aria-label="Todos los módulos"><div class="handle"></div><div class="title"><strong>Todos los módulos</strong><button class="close" type="button" data-close="1">×</button></div><div class="grid"></div></div>';
    document.body.appendChild(r);
    r.addEventListener('click',function(e){var c=e.target.closest('[data-close]');if(c){closeMore();return}var b=e.target.closest('[data-more-tab]');if(b)clickTab(b.getAttribute('data-more-tab'));});
    refreshMore();
  }
  function refreshMore(){
    var g=document.querySelector('#'+moreId+' .grid');if(!g)return;g.innerHTML='';
    tabs().forEach(function(t){var tab=t.getAttribute('data-tab'),b=document.createElement('button');b.type='button';b.setAttribute('data-more-tab',tab);b.innerHTML='<span style="font-size:17px;margin-right:7px">'+(icon[tab]||'•')+'</span>'+((t.textContent||tab).trim());if(t.classList.contains('active'))b.classList.add('active');g.appendChild(b);});
  }
  function openMore(){buildMore();refreshMore();document.getElementById(moreId).classList.add('open');document.body.style.overflow='hidden'}
  function closeMore(){var r=document.getElementById(moreId);if(r)r.classList.remove('open');document.body.style.overflow=''}

  function addTopMore(){
    var nav=document.querySelector('.tabs');if(!nav||nav.querySelector('.ccf-more-top'))return;
    var b=document.createElement('button');b.type='button';b.className='ccf-more-top';b.textContent='Más';b.setAttribute('aria-label','Más módulos');b.addEventListener('click',openMore);nav.appendChild(b);
  }
  function buildBottom(){
    if(document.getElementById(bottomId))return;
    var r=document.createElement('nav');r.id=bottomId;r.setAttribute('aria-label','Navegación principal');
    [['dashboard','Resumen'],['movimientos','Movimientos'],['deudas','Deudas'],['cuentas','Cuentas'],['more','Más']].forEach(function(x){var b=document.createElement('button');b.type='button';b.setAttribute('data-bottom',x[0]);b.innerHTML='<span class="ico">'+(x[0]==='more'?'•••':icon[x[0]])+'</span><span>'+x[1]+'</span>';b.addEventListener('click',function(){x[0]==='more'?openMore():clickTab(x[0])});r.appendChild(b)});
    document.body.appendChild(r);
  }
  function sync(){
    var c=current();document.querySelectorAll('#'+bottomId+' button[data-bottom]').forEach(function(b){b.classList.toggle('active',b.getAttribute('data-bottom')===c)});refreshMore();
    var active=document.querySelector('.tabs button.active');if(active&&window.matchMedia&&window.matchMedia('(max-width:720px)').matches){try{active.scrollIntoView({block:'nearest',inline:'center'})}catch(e){}}
  }
  function addSectionMarkers(){
    [['#dashboard','Resumen financiero'],['#movimientos','Movimientos'],['#futuros','Pagos futuros'],['#calendario','Calendario financiero'],['#ahorro','Ahorro'],['#deudas','Deudas y cuotas'],['#cuentas','Cuentas'],['#operaciones','Operaciones'],['#planificacion','Planificación'],['#presupuesto','Presupuesto']].forEach(function(x){var s=document.querySelector(x[0]);if(s&&!s.querySelector(':scope > .ccf-mobile-section-title')){var h=document.createElement('div');h.className='ccf-mobile-section-title';h.textContent=x[1];s.insertBefore(h,s.firstChild)}});
  }
  function install(){
    if(!document.body)return;document.body.classList.add('ccf-ux-v2');injectStyle();addSectionMarkers();
    if(document.querySelector('.tabs')){addTopMore();buildBottom();buildMore();sync()}
  }
  ready(function(){
    install();
    if(window.MutationObserver&&document.body){var mo=new MutationObserver(function(){if(document.querySelector('.tabs'))install()});mo.observe(document.body,{childList:true,subtree:true})}
    document.addEventListener('click',function(e){if(e.target.closest('.tabs button[data-tab]'))setTimeout(sync,30)},true);
    window.CCFMobileUX={version:'2.0.0',openMore:openMore,closeMore:closeMore,activateTab:clickTab};
  });
})();
