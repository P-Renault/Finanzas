/* CCF MOBILE B4.3.0 — MOBILE PRODUCT VIEWS
   Rebuilt mobile presentation layer.
   Contract:
   - Same filename/version.
   - No Supabase client, SQL, RLS or auth changes.
   - No desktop changes (<=720px only).
   - Existing modules remain data/logic owners.
   - Mobile views mirror existing DOM values and delegate actions to native controls.
*/
(function(){
'use strict';
if(window.__CCF_MOBILE_B43_REBUILT__) return;
window.__CCF_MOBILE_B43_REBUILT__=true;
const BP=720;
const PRIMARY=[['dashboard','Resumen','⌂'],['movimientos','Movimientos','↕'],['deudas','Deudas','▣'],['cuentas','Cuentas','▤']];
const MODULES={
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
 ingresos:['Motor Multifuente','Generación y control de ingresos','↗'],
 jornadas:['Control de Jornada','Resultado financiero integrado','◷'],
 'ia-financiera':['IA Financiera','Análisis y recomendaciones','✦']
};
let built=false,observer=null,syncTimer=null,current='dashboard';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const mobile=()=>matchMedia(`(max-width:${BP}px)`).matches;
const app=()=>$('#app');
const section=id=>document.getElementById(id);
const tabButton=id=>document.querySelector(`.tabs button[data-tab="${id}"]`);
const visible=id=>{const e=section(id);return !!(e&&!e.classList.contains('hidden'))};
function text(id,fallback='—'){const e=document.getElementById(id);return e?.textContent?.trim()||fallback}
function moneyFrom(id){return text(id,'$0')}
function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function activeTab(){return $('.tabs button.active[data-tab]')?.dataset.tab||current}
function shell(){return $('#ccf-mobile-b43')}
function fire(id){const e=document.getElementById(id);if(e){e.click();return true}return false}
function openNativeForm(id){
 const e=document.getElementById(id); if(!e)return;
 const card=e.closest('.card')||e.closest('section');
 const sec=e.closest('.tab');
 if(sec)sec.classList.remove('b43-native-hidden');
 if(card){card.classList.add('b43-form-modal');card.dataset.b43FormOpen='1';document.body.classList.add('b43-modal-lock');}
}
function closeNativeForms(){
 $$('.b43-form-modal').forEach(e=>{e.classList.remove('b43-form-modal');delete e.dataset.b43FormOpen;});
 $$('.tab').forEach(e=>{if(e.id&&e.id!=='dashboard')e.classList.add('b43-native-hidden')});
 document.body.classList.remove('b43-modal-lock');
}
function triggerSubmit(id){const e=document.getElementById(id);if(e)e.requestSubmit?e.requestSubmit():e.click()}
function build(){
 if(built||!mobile()||!app()||app().classList.contains('hidden')) return;
 built=true;
 const s=document.createElement('div');s.id='ccf-mobile-b43';
 s.innerHTML=`
 <header class="b43-header">
   <button class="b43-brand-logo" data-home aria-label="Resumen">CCF</button>
   <div class="b43-brand-copy"><strong>Centro de Control Financiero</strong><small>Tu vida financiera en un solo lugar</small></div>
   <button class="b43-bell" aria-label="Notificaciones">♧</button><button class="b43-avatar" data-profile aria-label="Perfil">P</button>
 </header>
 <div class="b43-page-head"><div class="b43-page-icon">⌂</div><div><strong data-page-title>Resumen</strong><small data-page-sub>Vista general e indicadores clave</small></div><button data-more aria-label="Más módulos">•••</button></div>
 <main class="b43-viewhost"></main>
 <nav class="b43-bottom">${PRIMARY.map(x=>`<button data-tab="${x[0]}"><span>${x[2]}</span><small>${x[1]}</small></button>`).join('')}<button data-more><span>•••</span><small>Más</small></button></nav>
 <div class="b43-sheet" data-sheet="more"><div class="b43-backdrop"></div><section><div class="b43-handle"></div><header><div><strong>Todos los módulos</strong><small>Acceso móvil al sistema completo</small></div><button data-close>×</button></header><div class="b43-module-grid"></div></section></div>
 <div class="b43-sheet" data-sheet="profile"><div class="b43-backdrop"></div><section><div class="b43-handle"></div><header><div class="b43-profile-avatar">P</div><div><strong>Mi perfil</strong><small>Sesión actual</small></div><button data-close>×</button></header><div class="b43-profile-email"><span>Correo electrónico</span><strong data-email>Sesión autenticada</strong></div><button data-close class="b43-primary-btn">Continuar</button><button data-logout class="b43-danger">Cerrar sesión</button></section></div>`;
 app().prepend(s);
 $$('#ccf-mobile-b43 [data-tab]').forEach(b=>b.onclick=()=>activate(b.dataset.tab));
 $$('#ccf-mobile-b43 [data-more]').forEach(b=>b.onclick=openMore);
 $('#ccf-mobile-b43 [data-home]').onclick=()=>activate('dashboard');
 $('#ccf-mobile-b43 [data-profile]').onclick=openProfile;
 $$('#ccf-mobile-b43 [data-close],#ccf-mobile-b43 .b43-backdrop').forEach(e=>e.onclick=closeSheets);
 $('#ccf-mobile-b43 [data-logout]').onclick=()=>{closeSheets();fire('logoutBtn')};
 renderMore(); hideLegacy(); render(current);
}
function hideLegacy(){
 ['.topbar','.tabs','.ccf-manual-access','#ccf-product-footer'].forEach(sel=>$(sel)?.classList.add('b43-legacy-hidden'));
}
function showLegacy(){$$('.b43-legacy-hidden').forEach(e=>e.classList.remove('b43-legacy-hidden'))}
function openMore(){renderMore();$('[data-sheet="more"]')?.classList.add('open');document.body.classList.add('b43-modal-lock')}
function openProfile(){$('[data-sheet="profile"]')?.classList.add('open');document.body.classList.add('b43-modal-lock')}
function closeSheets(){$$('.b43-sheet.open').forEach(e=>e.classList.remove('open'));document.body.classList.remove('b43-modal-lock')}
function renderMore(){
 const g=$('.b43-module-grid');if(!g)return;g.innerHTML='';
 $$('.tabs button[data-tab]').forEach(b=>{const id=b.dataset.tab;if(!id||PRIMARY.some(x=>x[0]===id))return;const m=MODULES[id]||[b.textContent.trim(),'Módulo financiero','◉'];const x=document.createElement('button');x.className='b43-module';x.innerHTML=`<b>${m[2]}</b><span><strong>${esc(m[0])}</strong><small>${esc(m[1])}</small></span>`;x.onclick=()=>activate(id);g.appendChild(x)})
}
function activate(id){
 const b=tabButton(id);if(!b){console.warn('[B4.3] módulo no encontrado',id);return}
 closeSheets();current=id;localStorage.setItem('cf_active_tab_v2',id);b.click();render(id);
 [80,300,800,1500].forEach(ms=>setTimeout(()=>{if(mobile())render(id)},ms));
}
function baseView(id){
 const m=MODULES[id]||[id,'Módulo financiero','◉'];
 return `<div class="b43-module-view" data-module-view="${id}"><div class="b43-view-title"><div class="b43-view-symbol">${m[2]}</div><div><h1>${m[0]}</h1><p>${m[1]}</p></div></div></div>`;
}
function render(id){
 if(!built)return;current=id||activeTab();
 const m=MODULES[current]||MODULES.dashboard;const sh=shell();if(!sh)return;
 sh.querySelector('[data-page-title]').textContent=m[0];sh.querySelector('[data-page-sub]').textContent=m[1];sh.querySelector('.b43-page-icon').textContent=m[2];
 sh.querySelectorAll('.b43-bottom [data-tab]').forEach(b=>b.classList.toggle('active',b.dataset.tab===current));
 const host=sh.querySelector('.b43-viewhost');host.innerHTML='';
 ({dashboard:viewDashboard,movimientos:viewMovimientos,deudas:viewDeudas,cuentas:viewCuentas,presupuesto:viewPresupuesto,planificacion:viewPlanificacion,futuros:viewFuturos,calendario:viewCalendario,operaciones:viewOperaciones,ahorro:viewAhorro,ingresos:viewIngresos,jornadas:viewJornadas,'ia-financiera':viewAI}[current]||viewGeneric)(host);
 hideLegacy(); hideNativeSection(current);
}
function hideNativeSection(id){
 $$('.b43-native-hidden').forEach(e=>e.classList.remove('b43-native-hidden'));
 const keep=['presupuesto','planificacion','operaciones','ingresos','jornadas','ia-financiera'];
 if(keep.includes(id)) return;
 const s=section(id);if(s)s.classList.add('b43-native-hidden');
}
function card(label,value,cls=''){return `<article class="b43-kpi ${cls}"><span>${label}</span><strong>${value}</strong></article>`}
function listMirror(listId,empty='Sin registros'){const l=document.getElementById(listId);if(!l)return `<div class="b43-empty">${empty}</div>`;const items=[...l.children];if(!items.length)return `<div class="b43-empty">${empty}</div>`;return items.slice(0,30).map(x=>`<article class="b43-row">${x.innerHTML}</article>`).join('')}
function viewDashboard(h){
 h.innerHTML=baseView('dashboard')+`<div class="b43-select-row"><select id="b43-month"><option>Septiembre de 2026</option></select></div>
 <div class="b43-kpi-grid">${card('Liquidez actual',moneyFrom('kpi-real-balance'),'blue')}${card('Ingresos del mes',moneyFrom('kpi-assured'),'green')}${card('Gastos del mes',moneyFrom('kpi-committed'),'red')}${card('Saldo proyectado',moneyFrom('kpi-projected-balance'),'navy')}</div>
 <section class="b43-card"><div class="b43-section-head"><strong>Flujo del mes</strong><span>Ingresos · Gastos · Saldo</span></div><div class="b43-chart-mirror" data-source="chart-flow">${cloneHTML('chart-flow')}</div></section>
 <div class="b43-section-head b43-quick-head"><strong>Accesos rápidos</strong></div><div class="b43-quick-grid"><button data-quick="movForm">＋<small>Registrar gasto</small></button><button data-quick="movForm">＋<small>Registrar ingreso</small></button><button data-quick="deudaForm">◉<small>Ver deudas</small></button><button data-quick="planificacion">◈<small>Planificar</small></button></div>
 <section class="b43-card"><div class="b43-section-head"><strong>Indicadores ejecutivos</strong><span>${text('summary-status-text','Estado financiero')}</span></div><div class="b43-insights">${card('Ingresos proyectados',moneyFrom('kpi-projected'))}${card('Egresos comprometidos',moneyFrom('kpi-committed'))}${card('Brecha financiera',moneyFrom('kpi-gap'))}${card('Margen restante',moneyFrom('margin-remaining'))}</div></section>`;
 bindQuick(h);syncChart(h,'chart-flow');
}
function cloneHTML(id){const e=document.getElementById(id);return e?e.innerHTML:'<div class="b43-chart-placeholder">Flujo financiero</div>'}
function syncChart(h,id){const box=h.querySelector(`[data-source="${id}"]`),src=document.getElementById(id);if(box&&src)box.innerHTML=src.innerHTML||'<div class="b43-chart-placeholder">Sin datos gráficos</div>'}
function bindQuick(h){h.querySelectorAll('[data-quick]').forEach(b=>b.onclick=()=>{const x=b.dataset.quick;if(x==='planificacion')activate('planificacion');else if(x==='deudaForm')activate('deudas');else openNativeForm(x)})}
function viewMovimientos(h){
 h.innerHTML=baseView('movimientos')+`<div class="b43-search"><span>⌕</span><input placeholder="Buscar movimiento..." data-filter="movimientosLista"><button>≡</button></div><div class="b43-filter-row"><button class="active">Todos</button><button>Ingresos</button><button>Gastos</button><button>Transferencias</button></div><section class="b43-card"><div class="b43-section-head"><strong>Movimientos recientes</strong><button class="b43-add" data-open="movForm">＋</button></div><div class="b43-list" id="b43-mov-list">${listMirror('movimientosLista')}</div></section>`;bindFilter(h,'movimientosLista');h.querySelector('[data-open]').onclick=()=>openNativeForm('movForm');
}
function viewDeudas(h){
 h.innerHTML=baseView('deudas')+`<div class="b43-segment"><button class="active">Pendientes</button><button>Pagadas</button></div><div class="b43-kpi-grid">${card('Total pendiente',moneyFrom('deudaSaldoTotal'),'blue')}${card('Próximos 30 días',moneyFrom('deuda30Total'),'red')}</div><section class="b43-card"><div class="b43-section-head"><strong>Deudas</strong><button class="b43-add" data-open="deudaForm">＋</button></div><div class="b43-list">${listMirror('deudasLista','No hay deudas registradas.')}</div></section>`;h.querySelector('[data-open]').onclick=()=>openNativeForm('deudaForm');
}
function viewCuentas(h){
 h.innerHTML=baseView('cuentas')+`<div class="b43-filter-row"><button class="active">Todas</button><button>Efectivo</button><button>Bancos</button><button>Otros</button></div><section class="b43-card b43-total-card"><span>Saldo total</span><strong>${moneyFrom('liquidezCuentasTotal')}</strong></section><section class="b43-card"><div class="b43-section-head"><strong>Cuentas</strong><button class="b43-add" data-open="cuentaForm">＋</button></div><div class="b43-list">${listMirror('cuentasLista','No hay cuentas registradas.')}</div></section>`;h.querySelector('[data-open]').onclick=()=>openNativeForm('cuentaForm');
}
function viewFuturos(h){
 h.innerHTML=baseView('futuros')+`<section class="b43-card"><div class="b43-section-head"><strong>Próximos vencimientos</strong><button class="b43-add" data-open="futureForm">＋</button></div><div class="b43-list">${listMirror('futurosLista','No hay pagos futuros.')}</div></section>`;h.querySelector('[data-open]').onclick=()=>openNativeForm('futureForm');
}
function viewAhorro(h){h.innerHTML=baseView('ahorro')+`<section class="b43-card b43-total-card"><span>Saldo de ahorro</span><strong>${moneyFrom('savingBalance')}</strong></section><section class="b43-card"><div class="b43-section-head"><strong>Historial de ahorro</strong><button class="b43-add" data-open="savingForm">＋</button></div><div class="b43-list">${listMirror('ahorroLista','Sin movimientos de ahorro.')}</div></section>`;h.querySelector('[data-open]').onclick=()=>openNativeForm('savingForm')}
function viewCalendario(h){const native=section('calendario');h.innerHTML=baseView('calendario')+`<section class="b43-card"><div class="b43-calendar-head"><button onclick="document.getElementById('calPrev')?.click()">‹</button><strong>${text('calendarMonth','Septiembre 2026')}</strong><button onclick="document.getElementById('calNext')?.click()">›</button></div><div class="b43-cal-metrics">${card('Ingresos',moneyFrom('calIncome'))}${card('Gastos',moneyFrom('calExpenses'),'red')}${card('Pagos',moneyFrom('calPayments'))}${card('Saldo cierre',moneyFrom('calFinalBalance'),'green')}</div><div class="b43-native-calendar">${native?.querySelector('.calendar-scroll')?.innerHTML||'<div class="b43-empty">Calendario cargando…</div>'}</div><div class="b43-native-day">${native?.querySelector('#calendarDayDetails')?.innerHTML||''}</div></section>`}
function viewPresupuesto(h){h.innerHTML=baseView('presupuesto')+`<div class="b43-kpi-grid">${card('Presupuesto mensual',moneyFrom('b233Total'),'blue')}${card('Ejecutado',moneyFrom('b233Executed'),'green')}</div><section class="b43-card"><div class="b43-section-head"><strong>Planificación vs. ejecutado</strong><span>Motor financiero existente</span></div><div class="b43-empty">Desplázate para gestionar el presupuesto con todas sus funciones.</div></section>`}
function viewPlanificacion(h){h.innerHTML=baseView('planificacion')+`<div class="b43-kpi-grid">${card('Saldo proyectado',moneyFrom('b219Proj'),'blue')}${card('Deudas pendientes',moneyFrom('b219Debt'),'red')}${card('Ingresos futuros',moneyFrom('b219Future'),'green')}${card('Ingresos generados',moneyFrom('b219Gen'))}</div><section class="b43-card"><div class="b43-section-head"><strong>Proyección de liquidez</strong><span>Escenario financiero</span></div><div class="b43-empty">El módulo completo se muestra debajo manteniendo sus cálculos y controles.</div></section>`}
function viewOperaciones(h){h.innerHTML=baseView('operaciones')+`<div class="b43-ops-grid"><button data-op="ingreso">↑<span>Registrar ingreso</span></button><button data-op="gasto">↓<span>Registrar gasto</span></button><button data-op="transferencia">⇄<span>Transferencia</span></button><button data-op="ajuste">◫<span>Ajuste de saldo</span></button></div>`;h.querySelectorAll('[data-op]').forEach(b=>b.onclick=()=>activate(b.dataset.op==='ingreso'||b.dataset.op==='gasto'?'movimientos':'cuentas'))}
function viewIngresos(h){h.innerHTML=baseView('ingresos')+`<div class="b43-kpi-grid">${card('Generado neto',moneyFrom('b219Generated'),'green')}${card('Cobrado',moneyFrom('b219Received'))}${card('Pendiente',moneyFrom('b219Pending'),'red')}</div>`}
function viewJornadas(h){h.innerHTML=baseView('jornadas')+`<section class="b43-card"><div class="b43-section-head"><strong>Control de Jornada</strong><span>Integración financiera</span></div><div class="b43-empty">El módulo operativo completo se mantiene debajo con sus funciones originales.</div></section>`}
function viewAI(h){const n=section('ia-financiera');h.innerHTML=baseView('ia-financiera')+`<section class="b43-ai-card"><div class="b43-ai-icon">✦</div><h2>Tu asistente financiero</h2><p>Analiza tus datos y entrega recomendaciones personalizadas.</p><div class="b43-ai-actions">${[...n?.querySelectorAll('button')||[]].slice(0,6).map(b=>`<button data-ai-text="${esc(b.textContent)}">${esc(b.textContent)}</button>`).join('')||'<button>Analiza mis gastos del mes</button><button>¿Puedo cubrir mis deudas?</button><button>Sugerencias de ahorro</button><button>Proyección del próximo mes</button>'}</div></section>`;h.querySelectorAll('[data-ai-text]').forEach(b=>b.onclick=()=>{[...n.querySelectorAll('button')].find(x=>x.textContent.trim()===b.dataset.aiText)?.click()})}
function viewGeneric(h){h.innerHTML=baseView(current)+`<section class="b43-card"><div class="b43-empty">Módulo disponible en la versión móvil.</div></section>`}
function bindFilter(h,listId){const input=h.querySelector(`[data-filter="${listId}"]`),list=document.getElementById(listId);if(!input||!list)return;input.oninput=()=>{const q=input.value.toLowerCase();h.querySelectorAll('.b43-list>.b43-row').forEach((r,i)=>{const src=list.children[i];r.style.display=!q||src?.textContent.toLowerCase().includes(q)?'':'none'})}}
function refresh(){if(!mobile()||!built)return;render(activeTab());}
function observe(){const a=app();if(!a)return;observer?.disconnect();observer=new MutationObserver(()=>{clearTimeout(syncTimer);syncTimer=setTimeout(refresh,250)});observer.observe(a,{childList:true,subtree:true,attributes:true,attributeFilter:['class','style']});setInterval(()=>{if(mobile()&&built)refresh()},1600)}
function boot(){if(!mobile())return;if(!app()||app().classList.contains('hidden')){setTimeout(boot,250);return}build();observe()}
function restore(){observer?.disconnect();observer=null;$('#ccf-mobile-b43')?.remove();showLegacy();closeNativeForms();built=false}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
addEventListener('resize',()=>setTimeout(()=>mobile()?boot():restore(),200));
window.CCFMobileB43={version:'4.3.0-mobile-product-views',activate,disable:restore,refresh};
})();
