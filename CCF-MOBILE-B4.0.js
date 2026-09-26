/* CCF MOBILE B4.0 — NATIVE FINANCIAL APP SHELL
   Presentation-only mobile UX.
   - Desktop untouched.
   - Auth/Supabase/data/business logic untouched.
   - Native modules remain in their original DOM location.
   - B4 only changes mobile presentation and navigation.
*/
(function(){
'use strict';
if(window.__CCF_MOBILE_B4__) return;
window.__CCF_MOBILE_B4__=true;

const BP=720;
const primary=[
  ['dashboard','Resumen','⌂'],
  ['movimientos','Movimientos','↕'],
  ['deudas','Deudas','▣'],
  ['cuentas','Cuentas','▤']
];
const meta={
 dashboard:['Resumen','Vista general e indicadores clave','⌂'],
 movimientos:['Movimientos','Registro y control de transacciones','↕'],
 deudas:['Deudas','Control y seguimiento de obligaciones','▣'],
 cuentas:['Cuentas','Gestión de cuentas y saldo total','▤'],
 presupuesto:['Presupuesto','Planificación vs. ejecutado','◒'],
 planificacion:['Planificación','Escenario de 30 días','◈'],
 futuros:['Pagos futuros','Vencimientos y recordatorios','◷'],
 calendario:['Calendario','Vista mensual e integración','▦'],
 operaciones:['Operaciones','Registro rápido y utilidades','⇄'],
 ahorro:['Ahorro','Metas y control del ahorro','◎'],
 'ia-financiera':['IA Financiera','Análisis y recomendaciones','✦'],
 'motor-multifuente':['Motor Multifuente','Motor financiero','◉'],
 'control-jornada':['Control de Jornada','Control operativo','◉']
};
let built=false, observer=null, timer=0;

const isMobile=()=>matchMedia(`(max-width:${BP}px)`).matches;
const app=()=>document.getElementById('app');
const ready=()=>isMobile() && app() && !app().classList.contains('hidden');
const tab=id=>document.querySelector(`.tabs button[data-tab="${CSS.escape(id)}"]`);
const activeId=()=>{
 const b=document.querySelector('.tabs button.active[data-tab]');
 return b?.dataset.tab || 'dashboard';
};
const shell=()=>document.getElementById('ccf-mobile-b4');

function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}

function hideDesktopChrome(){
 ['.topbar','.tabs','.ccf-manual-access','#ccf-product-footer'].forEach(sel=>{
   document.querySelectorAll(sel).forEach(x=>x.classList.add('ccf-b4-hide'));
 });
 const cfg=document.getElementById('configPanel');
 if(cfg && !cfg.classList.contains('hidden')) cfg.classList.add('ccf-b4-hide');
 const status=document.getElementById('configMsg');
 if(status) status.classList.add('ccf-b4-hide');
}

function build(){
 if(built||!ready()) return;
 built=true;
 const root=document.createElement('div');
 root.id='ccf-mobile-b4';
 root.innerHTML=`
  <header class="b4-header">
    <button class="b4-brand" data-home aria-label="Resumen"><b>CCF</b></button>
    <div class="b4-head-title"><strong>Centro de Control Financiero</strong><small>Tu vida financiera en un solo lugar</small></div>
    <div class="b4-head-actions">
      <button class="b4-icon" data-notice aria-label="Notificaciones">♧</button>
      <button class="b4-avatar" data-profile aria-label="Perfil">P</button>
    </div>
  </header>
  <div class="b4-module-head">
    <div class="b4-module-icon"></div>
    <div class="b4-module-title"><strong></strong><small></small></div>
    <button class="b4-more-top" data-more aria-label="Más módulos">•••</button>
  </div>
  <main class="b4-content-host" aria-live="polite"></main>
  <nav class="b4-bottom-nav">
    ${primary.map(x=>`<button data-b4-tab="${x[0]}"><span>${x[2]}</span><small>${x[1]}</small></button>`).join('')}
    <button data-more><span>☰</span><small>Más</small></button>
  </nav>
  <div class="b4-sheet" data-sheet="more">
   <div class="b4-backdrop" data-close></div>
   <section>
    <div class="b4-handle"></div>
    <header><div><strong>Todos los módulos</strong><small>Accede a cada sección del sistema</small></div><button data-close>×</button></header>
    <div class="b4-module-grid"></div>
   </section>
  </div>
  <div class="b4-sheet" data-sheet="profile">
   <div class="b4-backdrop" data-close></div>
   <section class="b4-profile">
    <div class="b4-handle"></div>
    <header><div class="b4-pavatar">P</div><div><strong>Mi perfil</strong><small>Cuenta activa</small></div><button data-close>×</button></header>
    <div class="b4-email"><span>Correo electrónico</span><strong data-email>Sesión autenticada</strong></div>
    <button data-close>Continuar en la aplicación</button>
    <button class="b4-logout" data-logout>Cerrar sesión</button>
   </section>
  </div>`;
 app().appendChild(root);

 root.querySelectorAll('[data-b4-tab]').forEach(b=>b.addEventListener('click',()=>activate(b.dataset.b4Tab)));
 root.querySelectorAll('[data-more]').forEach(b=>b.addEventListener('click',openMore));
 root.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',closeSheets));
 root.querySelector('[data-profile]').addEventListener('click',openProfile);
 root.querySelector('[data-home]').addEventListener('click',()=>activate('dashboard'));
 root.querySelector('[data-logout]').addEventListener('click',()=>{
   closeSheets(); document.getElementById('logoutBtn')?.click();
 });
 renderMore();
 renderHeader();
 applyModuleUX();
}

function nativeSections(){
 return [...document.querySelectorAll('#app>.tab')];
}

function activeSection(){
 const id=activeId();
 return document.getElementById(id);
}

function renderHeader(){
 if(!ready()) return;
 const id=activeId(), m=meta[id]||[id,'Módulo financiero','◉'];
 const r=shell(); if(!r)return;
 r.querySelector('.b4-module-icon').textContent=m[2];
 r.querySelector('.b4-module-title strong').textContent=m[0];
 r.querySelector('.b4-module-title small').textContent=m[1];
 r.querySelectorAll('[data-b4-tab]').forEach(b=>b.classList.toggle('active',b.dataset.b4Tab===id));
 hideDesktopChrome();
 applyModuleUX();
 syncProfile();
}

function renderMore(){
 const g=document.querySelector('.b4-module-grid'); if(!g)return;
 g.innerHTML='';
 const seen=new Set();
 document.querySelectorAll('.tabs button[data-tab]').forEach(b=>{
   const id=b.dataset.tab;
   if(!id||seen.has(id))return;
   seen.add(id);
   if(primary.some(x=>x[0]===id))return;
   const m=meta[id]||[b.textContent.trim(),'Módulo financiero','◉'];
   const x=document.createElement('button');
   x.className='b4-module-card';
   x.innerHTML=`<span class="b4-module-glyph">${esc(m[2])}</span><span><strong>${esc(m[0])}</strong><small>${esc(m[1])}</small></span>`;
   x.addEventListener('click',()=>activate(id));
   g.appendChild(x);
 });
}

function openMore(){renderMore();document.querySelector('[data-sheet="more"]')?.classList.add('open');document.body.classList.add('b4-lock');}
function openProfile(){syncProfile();document.querySelector('[data-sheet="profile"]')?.classList.add('open');document.body.classList.add('b4-lock');}
function closeSheets(){document.querySelectorAll('.b4-sheet.open').forEach(x=>x.classList.remove('open'));document.body.classList.remove('b4-lock');}

async function syncProfile(){
 const el=shell()?.querySelector('[data-email]');
 if(!el)return;
 try{
  const c=window.supabaseClient||window.db||window.__db;
  const s=await c?.auth?.getSession?.();
  el.textContent=s?.data?.session?.user?.email||'Sesión autenticada';
 }catch(_){}
}

function activate(id){
 const b=tab(id);
 if(!b){console.warn('[CCF B4] módulo no encontrado',id);return;}
 closeSheets();
 b.click();
 [60,250,650,1200].forEach(ms=>setTimeout(()=>{
   if(!ready())return;
   renderHeader();
   enhanceForms();
 },ms));
 window.scrollTo({top:0,behavior:'smooth'});
}

function markSection(){
 nativeSections().forEach(s=>s.classList.toggle('ccf-b4-section-active',!s.classList.contains('hidden')));
}

function styleDashboard(){
 const s=document.getElementById('dashboard'); if(!s)return;
 s.classList.add('ccf-b4-dashboard');
 document.querySelectorAll('#dashboard .kpi-grid,#dashboard .executive-insights').forEach(x=>x.classList.add('ccf-b4-grid'));
 document.querySelectorAll('#dashboard .executive-chart,#dashboard .panel,#dashboard .card,#dashboard .ccf-monthly-summary,#dashboard .b234-card,#dashboard .b234-cat,#dashboard .b234-kpi').forEach(x=>x.classList.add('ccf-b4-card'));
}

function styleGeneric(id){
 const s=document.getElementById(id); if(!s)return;
 s.classList.add('ccf-b4-module');
 s.querySelectorAll(':scope>.card,:scope>.panel,:scope>section,:scope>article').forEach(x=>x.classList.add('ccf-b4-card'));
 s.querySelectorAll('table').forEach(t=>t.parentElement?.classList.add('ccf-b4-table-wrap'));
 s.querySelectorAll('form').forEach(f=>f.classList.add('ccf-b4-form'));
}

function styleDeudas(){
 const s=document.getElementById('deudas'); if(!s)return;
 s.classList.add('ccf-b4-deudas');
 s.querySelectorAll('.card,.panel,.deuda-card,.debt-card,[class*="deuda"]').forEach(x=>x.classList.add('ccf-b4-card'));
}

function styleCuentas(){
 const s=document.getElementById('cuentas'); if(!s)return;
 s.classList.add('ccf-b4-cuentas');
 s.querySelectorAll('.card,.panel,.account-card,[class*="cuenta"]').forEach(x=>x.classList.add('ccf-b4-card'));
}

function enhanceForms(){
 document.querySelectorAll('#app input,#app select,#app textarea').forEach(x=>x.classList.add('ccf-b4-control'));
 document.querySelectorAll('#app button:not(.ccf-b4-styled):not([data-b4-tab]):not([data-more])').forEach(x=>{
   if(x.closest('#ccf-mobile-b4'))return;
   x.classList.add('ccf-b4-native-button');
 });
}

function applyModuleUX(){
 if(!ready())return;
 styleDashboard();
 ['movimientos','futuros','calendario','ahorro','operaciones','planificacion','presupuesto'].forEach(styleGeneric);
 styleDeudas(); styleCuentas();
 markSection(); enhanceForms();
 // Ensure the active native section is never visually replaced.
 nativeSections().forEach(s=>{
   if(!s.classList.contains('hidden'))s.classList.add('ccf-b4-section-active');
 });
}

function observe(){
 if(observer)observer.disconnect();
 if(!app())return;
 observer=new MutationObserver(()=>{
   clearTimeout(timer);
   timer=setTimeout(()=>{if(ready()){renderHeader();renderMore();applyModuleUX();}},120);
 });
 observer.observe(app(),{subtree:false,childList:false,attributes:true,attributeFilter:['class','style']});
}

function restore(){
 document.getElementById('ccf-mobile-b4')?.remove();
 document.querySelectorAll('.ccf-b4-hide').forEach(x=>x.classList.remove('ccf-b4-hide'));
 document.querySelectorAll('.ccf-b4-card,.ccf-b4-module,.ccf-b4-dashboard,.ccf-b4-deudas,.ccf-b4-cuentas,.ccf-b4-section-active').forEach(x=>x.classList.remove('ccf-b4-card','ccf-b4-module','ccf-b4-dashboard','ccf-b4-deudas','ccf-b4-cuentas','ccf-b4-section-active'));
 document.body.classList.remove('b4-lock');
 observer?.disconnect(); observer=null; built=false;
}

function boot(){
 if(!isMobile()||!ready())return;
 // Disable the previous shell if present, without touching native modules.
 document.getElementById('ccf-mobile-b341')?.remove();
 document.querySelectorAll('.b341-hide').forEach(x=>x.classList.remove('b341-hide'));
 build(); renderHeader(); renderMore(); observe();
 window.CCFMobileB4={version:'4.0.0-native-app',activate,openMore,openProfile,disable:restore};
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true}); else boot();
window.addEventListener('resize',()=>setTimeout(()=>isMobile()?boot():restore(),200));
})();
