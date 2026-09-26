/* CCF MOBILE B3.3 — Mobile presentation layer
   - Uses existing financial engines/DOM
   - Waits for dynamically injected modules
   - Live KPI synchronization
   - Real chart element, not canvas clone
   - Working More/profile controls
   - Mobile only <=720px
*/
(function(){
'use strict';
if(window.__CCF_MOBILE_B33__) return;
window.__CCF_MOBILE_B33__=true;

const BP=720;
let enabled=true, observer=null, syncTimer=null, built=false;
const primary=[
 ['dashboard','Resumen','⌂'],
 ['movimientos','Movimientos','↕'],
 ['deudas','Deudas','▣'],
 ['cuentas','Cuentas','▤']
];
const secondary=[
 ['presupuesto','Presupuesto','◒','Planificación vs. ejecutado'],
 ['planificacion','Planificación','◈','Escenario de 30 días'],
 ['futuros','Pagos futuros','◷','Vencimientos y recordatorios'],
 ['calendario','Calendario','▦','Vista mensual e integración'],
 ['operaciones','Operaciones','⇄','Registro rápido y utilidades'],
 ['ahorro','Ahorro','◎','Metas y control del ahorro'],
 ['ia-financiera','IA Financiera','✦','Análisis y recomendaciones']
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
 'ia-financiera':['IA Financiera','Análisis y recomendaciones','✦']
};

function isMobile(){return window.matchMedia('(max-width:'+BP+'px)').matches}
function app(){return document.getElementById('app')}
function tabButton(id){return document.querySelector('.tabs button[data-tab="'+id+'"]')}
function section(id){return document.getElementById(id)}
function moneyText(id,fallback='$0'){const e=section(id);return e&&e.textContent.trim()?e.textContent.trim():fallback}
function cleanMoney(v){return String(v||'$0').replace(/\s+/g,' ')}
function activeId(){
 const b=document.querySelector('.tabs button.active[data-tab]');
 return b?b.dataset.tab:'dashboard';
}

function build(){
 if(built||!app())return;
 built=true;
 const root=document.createElement('div');
 root.id='ccf-mobile-b33';
 root.innerHTML=`
  <header class="b33-header">
   <button class="b33-logo" type="button" data-b33-home><b>CCF</b></button>
   <div class="b33-title"><strong>Centro de Control Financiero</strong><small>Tu vida financiera en un solo lugar</small></div>
   <div class="b33-header-actions">
    <button type="button" class="b33-icon" data-b33-profile aria-label="Perfil">♙</button>
    <button type="button" class="b33-avatar" data-b33-profile aria-label="Abrir perfil">P</button>
   </div>
  </header>
  <div class="b33-modulebar">
   <span class="b33-module-icon"></span>
   <div><strong></strong><small></small></div>
   <button type="button" class="b33-module-more" data-b33-more aria-label="Todos los módulos">•••</button>
  </div>
  <main class="b33-main"></main>
  <nav class="b33-nav">
   ${primary.map(x=>`<button type="button" data-b33-tab="${x[0]}"><span>${x[2]}</span><small>${x[1]}</small></button>`).join('')}
   <button type="button" data-b33-more><span>•••</span><small>Más</small></button>
  </nav>
  <div class="b33-sheet b33-more-sheet">
   <div class="b33-backdrop" data-b33-close></div>
   <section class="b33-sheet-panel">
    <div class="b33-handle"></div>
    <header><div><strong>Todos los módulos</strong><small>Accede a cada sección del sistema</small></div><button type="button" class="b33-close" data-b33-close>×</button></header>
    <div class="b33-module-grid"></div>
   </section>
  </div>
  <div class="b33-sheet b33-profile-sheet">
   <div class="b33-backdrop" data-b33-profile-close></div>
   <section class="b33-profile-panel">
    <div class="b33-profile-head"><div class="b33-profile-avatar">P</div><div><strong>Mi perfil</strong><small>Cuenta activa</small></div><button type="button" class="b33-close" data-b33-profile-close>×</button></div>
    <div class="b33-profile-card"><span>Correo electrónico</span><strong data-b33-email>Cargando…</strong></div>
    <button type="button" class="b33-profile-option" data-b33-profile-close>Continuar en la aplicación <span>›</span></button>
    <button type="button" class="b33-profile-logout" data-b33-logout>Cerrar sesión</button>
   </section>
  </div>`;
 app().appendChild(root);

 root.querySelectorAll('[data-b33-tab]').forEach(b=>b.addEventListener('click',()=>activate(b.dataset.b33Tab)));
 root.querySelectorAll('[data-b33-more]').forEach(b=>b.addEventListener('click',openMore));
 root.querySelectorAll('[data-b33-close]').forEach(b=>b.addEventListener('click',closeMore));
 root.querySelectorAll('[data-b33-profile]').forEach(b=>b.addEventListener('click',openProfile));
 root.querySelectorAll('[data-b33-profile-close]').forEach(b=>b.addEventListener('click',closeProfile));
 root.querySelector('[data-b33-logout]').addEventListener('click',logout);
 root.querySelector('[data-b33-home]').addEventListener('click',()=>activate('dashboard'));
 renderMore();
 render();
}

function renderMore(){
 const grid=document.querySelector('.b33-module-grid');
 if(!grid)return;
 grid.innerHTML='';
 secondary.forEach(x=>{
  const b=tabButton(x[0]);
  if(!b)return;
  const d=meta[x[0]];
  const el=document.createElement('button');
  el.type='button';el.className='b33-module-card';
  el.innerHTML=`<b>${x[2]}</b><span><strong>${d[0]}</strong><small>${x[3]}</small></span>`;
  el.onclick=()=>activate(x[0]);
  grid.appendChild(el);
 });
 // Discover dynamically injected modules not known at load time.
 document.querySelectorAll('.tabs button[data-tab]').forEach(b=>{
  const id=b.dataset.tab;
  if(primary.some(x=>x[0]===id)||secondary.some(x=>x[0]===id))return;
  const label=b.textContent.trim();
  if(!label)return;
  const el=document.createElement('button');
  el.type='button';el.className='b33-module-card';
  el.innerHTML=`<b>◉</b><span><strong>${label}</strong><small>Módulo financiero</small></span>`;
  el.onclick=()=>activate(id);
  grid.appendChild(el);
 });
}

function openMore(){renderMore();document.querySelector('.b33-more-sheet')?.classList.add('open');document.body.classList.add('b33-lock')}
function closeMore(){document.querySelector('.b33-more-sheet')?.classList.remove('open');document.body.classList.remove('b33-lock')}
function openProfile(){loadProfile();document.querySelector('.b33-profile-sheet')?.classList.add('open');document.body.classList.add('b33-lock')}
function closeProfile(){document.querySelector('.b33-profile-sheet')?.classList.remove('open');document.body.classList.remove('b33-lock')}

async function loadProfile(){
 const out=document.querySelector('[data-b33-email]');
 if(!out)return;
 try{
  const client=window.supabaseClient||window.db||window.__db;
  if(client?.auth?.getUser){
   const r=await client.auth.getUser();
   out.textContent=r?.data?.user?.email||'Sesión autenticada';
   const avatar=document.querySelector('.b33-avatar');
   if(avatar){
    const e=r?.data?.user?.email||'P';
    avatar.textContent=(e[0]||'P').toUpperCase();
   }
  }else{
   out.textContent='Sesión activa';
  }
 }catch(e){out.textContent='Sesión activa'}
}
function logout(){
 const btn=document.getElementById('logoutBtn');
 closeProfile();
 if(btn)btn.click();
}

function hideLegacy(){
 document.querySelector('.topbar')?.classList.add('b33-legacy-hidden');
 document.querySelector('.tabs')?.classList.add('b33-legacy-hidden');
 document.querySelector('.ccf-manual-access')?.classList.add('b33-legacy-hidden');
 document.querySelector('#ccf-product-footer')?.classList.add('b33-legacy-hidden');
 // Connection status is not part of the mobile product header.
 document.querySelectorAll('#app > .status,#app > p').forEach(e=>e.classList.add('b33-legacy-hidden'));
}

function prepare(id,el){
 el.classList.add('b33-native-section');
 el.dataset.b33Module=id;
 el.classList.remove('hidden');
 // presentation-only classes
 el.classList.toggle('b33-debts',id==='deudas');
 el.classList.toggle('b33-accounts',id==='cuentas');
 el.classList.toggle('b33-list',id==='movimientos');
 el.classList.toggle('b33-calendar',id==='calendario');
 el.classList.toggle('b33-future',id==='futuros');
}

function dashboard(){
 const el=document.createElement('section');
 el.className='b33-dashboard';
 el.innerHTML=`
  <div class="b33-month"><span data-b33-month>Septiembre de 2026</span><b>⌄</b></div>
  <div class="b33-kpis">
   <article class="blue"><small>Liquidez actual</small><strong data-kpi="liq">$0</strong><em>Efectivo + cuentas</em></article>
   <article class="green"><small>Ingresos del mes</small><strong data-kpi="in">$0</strong><em>Ejecutado</em></article>
   <article class="red"><small>Gastos del mes</small><strong data-kpi="out">$0</strong><em>Ejecutado</em></article>
   <article class="navy"><small>Saldo proyectado</small><strong data-kpi="proj">$0</strong><em>Fin del mes</em></article>
  </div>
  <div class="b33-chart"><header><strong>Flujo del mes</strong><span>Ingresos · Gastos · Saldo</span></header><div class="b33-chart-host"></div></div>
  <div class="b33-quick"><strong>Accesos rápidos</strong><div>
   <button data-q="gasto">＋<span>Registrar gasto</span></button>
   <button data-q="ingreso">＋<span>Registrar ingreso</span></button>
   <button data-q="deuda">▣<span>Ver deudas</span></button>
   <button data-q="plan">◈<span>Planificar</span></button>
  </div></div>`;
 el.querySelectorAll('[data-q]').forEach(b=>b.onclick=()=>{
  const q=b.dataset.q;
  if(q==='deuda')activate('deudas');
  else if(q==='plan')activate('planificacion');
  else {activate('movimientos');setTimeout(()=>{const t=document.getElementById('movTipo');if(t){t.value=q;t.dispatchEvent(new Event('change',{bubbles:true}))}},150)}
 });
 return el;
}

function syncKpis(){
 const root=document.querySelector('.b33-dashboard');
 if(!root)return;
 const vals={
  liq:moneyText('kpi-real-balance'),
  in:moneyText('month-income-total'),
  out:moneyText('month-expense-total'),
  proj:moneyText('kpi-projected-balance',moneyText('kpi-projected'))
 };
 Object.keys(vals).forEach(k=>{const e=root.querySelector('[data-kpi="'+k+'"]');if(e)e.textContent=cleanMoney(vals[k])});
 const month=document.getElementById('future-month-label')||document.getElementById('calendarMonth');
 if(month)root.querySelector('[data-b33-month]').textContent=month.textContent.trim();
 // Move the real chart node once it exists. Do not clone canvas.
 const chart=document.getElementById('chart-flow')||document.getElementById('chart-liquidity');
 const host=root.querySelector('.b33-chart-host');
 if(chart&&host&&!host.contains(chart)){
  host.innerHTML='';
  host.appendChild(chart);
 }
}

function render(){
 if(!isMobile()||!built)return;
 hideLegacy();
 const id=activeId();
 const m=meta[id]||[id,'Módulo financiero','◉'];
 const root=document.getElementById('ccf-mobile-b33');
 root.querySelector('.b33-module-icon').textContent=m[2];
 root.querySelector('.b33-modulebar strong').textContent=m[0];
 root.querySelector('.b33-modulebar small').textContent=m[1];
 root.querySelectorAll('[data-b33-tab]').forEach(b=>b.classList.toggle('active',b.dataset.b33Tab===id));
 const main=root.querySelector('.b33-main');
 main.innerHTML='';
 if(id==='dashboard'){
  main.appendChild(dashboard());
  const native=section('dashboard');
  if(native)native.classList.add('b33-dashboard-source');
  syncKpis();
 }else{
  const native=section(id);
  if(native){
   prepare(id,native);
   main.appendChild(native);
  }else{
   main.innerHTML=`<section class="b33-empty"><strong>${m[0]}</strong><p>El módulo está cargándose. Espera un instante.</p></section>`;
  }
 }
 renderMore();
 syncKpis();
}

function activate(id){
 const b=tabButton(id);
 if(b)b.click();
 closeMore();
 setTimeout(render,80);
 setTimeout(render,450);
 setTimeout(render,1000);
}

function waitAndBuild(){
 if(!isMobile()||!app()||app().classList.contains('hidden')) {
  if(isMobile()&&app()&&!app().classList.contains('hidden')){build();render();}
  return;
 }
 setTimeout(waitAndBuild,250);
}

function observe(){
 if(observer)observer.disconnect();
 observer=new MutationObserver(()=>{
  if(!isMobile()||!enabled)return;
  if(!built)build();
  renderMore();
  clearTimeout(syncTimer);
  syncTimer=setTimeout(()=>{render();syncKpis()},100);
 });
 observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class','style']});
}

function boot(){
 if(!isMobile())return;
 waitAndBuild();
 observe();
 window.addEventListener('resize',()=>setTimeout(()=>isMobile()?build():restore(),100));
 // Existing financial refresh lifecycle.
 [500,1200,2500,4500].forEach(t=>setTimeout(()=>{if(isMobile()){render();syncKpis()}},t));
 window.CCFMobileB33={version:'3.3.0',activate,openMore,openProfile,disable:()=>{enabled=false;restore()}};
}

function restore(){
 const root=document.getElementById('ccf-mobile-b33');
 if(root)root.remove();
 document.querySelectorAll('.b33-legacy-hidden').forEach(e=>e.classList.remove('b33-legacy-hidden'));
 document.querySelectorAll('.b33-dashboard-source').forEach(e=>e.classList.remove('b33-dashboard-source'));
 document.querySelectorAll('.b33-native-section').forEach(e=>e.classList.remove('b33-native-section'));
 document.documentElement.classList.remove('b33-mobile');document.body.classList.remove('b33-mobile','b33-lock');
 built=false;
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
