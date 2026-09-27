/* CCF MOBILE B4.3.0 — MOBILE PRODUCT VIEWS
   Reconstrucción móvil completa para Producción-b.2.
   - No modifica index.html.
   - No crea Supabase clients ni toca auth/SQL/RLS.
   - Desktop intacto (>720px).
   - Usa los módulos existentes como fuente de datos/acciones.
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
let built=false,current='dashboard',observer=null,rendering=false,refreshTimer=0,observerTimer=0,nativeMount=null;
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const mobile=()=>window.matchMedia('(max-width:'+BP+'px)').matches;
const app=()=>$('#app');
const native=id=>document.getElementById(id);
const tabs=()=>$$('.tabs button[data-tab]');
const tab=id=>$('.tabs button[data-tab="'+CSS.escape(id)+'"]');
const money=id=>native(id)?.textContent?.trim()||'$0';
const txt=(id,f='—')=>native(id)?.textContent?.trim()||f;
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

function active(){return $('.tabs button.active[data-tab]')?.dataset.tab||current||'dashboard'}
function ready(){return mobile()&&app()&&!app().classList.contains('hidden')}
function fire(id){const e=native(id);if(e){e.click();return true}return false}
function hideLegacy(){
 ['.topbar','.tabs','.ccf-manual-access','#ccf-product-footer'].forEach(s=>$(s)?.classList.add('b43-legacy-hidden'));
 // Oculta cualquier sección nativa; B4.3 es el único contenido visible en móvil.
 $$('.tab').forEach(s=>s.classList.add('b43-native-hidden'));
}
function showLegacy(){
 if(nativeMount){restoreNativeMount();}
 $$('.b43-legacy-hidden').forEach(e=>e.classList.remove('b43-legacy-hidden'));
 $$('.b43-native-hidden').forEach(e=>e.classList.remove('b43-native-hidden'));
}
function restoreNativeMount(){
 if(!nativeMount)return;
 const {el,placeholder}=nativeMount;
 el.classList.remove('b43-native-mobile-active','b43-native-hidden');
 placeholder.parentNode?.insertBefore(el,placeholder.nextSibling);
 placeholder.remove();nativeMount=null;
}
function mountNative(id,host){
 restoreNativeMount();
 const el=native(id);if(!el)return false;
 const placeholder=document.createComment('B4.3 native mount '+id);
 el.parentNode.insertBefore(placeholder,el);
 el.classList.remove('hidden','b43-native-hidden');
 el.classList.add('b43-native-mobile-active');
 host.appendChild(el);
 nativeMount={el,placeholder};
 return true;
}
function build(){
 if(built||!ready())return;
 built=true;
 const root=document.createElement('div');root.id='ccf-mobile-b43';
 root.innerHTML=`
 <header class="b43-header">
  <button class="b43-brand-logo" data-home>CCF</button>
  <div class="b43-brand-copy"><strong>Centro de Control Financiero</strong><small>Tu vida financiera en un solo lugar</small></div>
  <button class="b43-bell" data-bell aria-label="Notificaciones">♧</button>
  <button class="b43-avatar" data-profile aria-label="Perfil">P</button>
 </header>
 <div class="b43-page-head"><div class="b43-page-icon">⌂</div><div><strong data-page-title>Resumen</strong><small data-page-sub>Vista general e indicadores clave</small></div><button data-more aria-label="Todos los módulos">•••</button></div>
 <main class="b43-viewhost"></main>
 <nav class="b43-bottom">${PRIMARY.map(x=>`<button data-tab="${x[0]}"><span>${x[2]}</span><small>${x[1]}</small></button>`).join('')}<button data-more><span>•••</span><small>Más</small></button></nav>
 <div class="b43-sheet" data-sheet="more"><div class="b43-backdrop"></div><section><div class="b43-handle"></div><header><div><strong>Todos los módulos</strong><small>Accede a cada sección del sistema</small></div><button data-close>×</button></header><div class="b43-module-grid"></div></section></div>
 <div class="b43-sheet" data-sheet="profile"><div class="b43-backdrop"></div><section><div class="b43-handle"></div><header><div class="b43-profile-avatar">P</div><div><strong>Mi perfil</strong><small>Sesión autenticada</small></div><button data-close>×</button></header><div class="b43-profile-email"><span>Estado</span><strong>Sesión activa</strong></div><button class="b43-primary-btn" data-close>Continuar</button><button class="b43-danger" data-logout>Cerrar sesión</button></section></div>
 <div class="b43-form-layer" data-form-layer><div class="b43-form-backdrop"></div><section><div class="b43-handle"></div><header><strong data-form-title>Registrar</strong><button data-form-close>×</button></header><div data-form-slot></div></section></div>`;
 app().prepend(root);
 $$('[data-tab]',root).forEach(b=>b.onclick=()=>activate(b.dataset.tab));
 $$('[data-more]',root).forEach(b=>b.onclick=openMore);
 $('[data-home]',root).onclick=()=>activate('dashboard');
 $('[data-profile]',root).onclick=openProfile;
 $$('[data-close],.b43-backdrop',root).forEach(x=>x.onclick=closeSheets);
 $('[data-logout]',root).onclick=()=>{closeSheets();fire('logoutBtn')};
 $('[data-form-close]',root).onclick=closeForm;
 $('.b43-form-backdrop',root).onclick=closeForm;
 renderMore();hideLegacy();render(active());
}
function renderMore(){
 const g=$('.b43-module-grid');if(!g)return;g.innerHTML='';
 tabs().forEach(b=>{const id=b.dataset.tab;if(!id||PRIMARY.some(x=>x[0]===id))return;const m=MODULES[id]||[b.textContent.trim(),'Módulo financiero','◉'];const x=document.createElement('button');x.className='b43-module';x.innerHTML=`<b>${m[2]}</b><span><strong>${esc(m[0])}</strong><small>${esc(m[1])}</small></span>`;x.onclick=()=>activate(id);g.appendChild(x)});
}
function openMore(){closeForm();renderMore();$('.b43-sheet[data-sheet="more"]')?.classList.add('open');document.body.classList.add('b43-modal-lock')}
function openProfile(){closeForm();$('.b43-sheet[data-sheet="profile"]')?.classList.add('open');document.body.classList.add('b43-modal-lock')}
function closeSheets(){$$('.b43-sheet.open').forEach(x=>x.classList.remove('open'));if(!$('.b43-form-layer.open'))document.body.classList.remove('b43-modal-lock')}
function openForm(id,title){
 const e=native(id);if(!e)return;
 const form=e.closest('form')||e;const card=form.closest('.card')||form.parentElement;
 const slot=$('[data-form-slot]');if(!slot)return;
 slot.innerHTML='';
 const clone=card.cloneNode(true);
 clone.classList.remove('hidden','b43-native-hidden','b43-form-modal');
 // Inputs/selects are synchronized to the original controls.
 $$("input,select,textarea",clone).forEach(c=>{const oid=c.id;if(!oid)return;const o=native(oid);if(!o)return;c.value=o.value;c.oninput=()=>{o.value=c.value;o.dispatchEvent(new Event('input',{bubbles:true}))};c.onchange=()=>{o.value=c.value;o.dispatchEvent(new Event('change',{bubbles:true}))}});
 $$("button",clone).forEach(b=>{const oid=b.id;if(oid){b.onclick=e=>{e.preventDefault();native(oid)?.click();closeForm()}}});
 // Submit delegates to original form, preserving all business logic.
 const cf=$('form',clone);if(cf)cf.onsubmit=e=>{e.preventDefault();form.requestSubmit?form.requestSubmit():form.submit();closeForm()};
 $('[data-form-title]').textContent=title||'Registrar';slot.appendChild(clone);
 $('.b43-form-layer')?.classList.add('open');document.body.classList.add('b43-modal-lock');
}
function closeForm(){$('.b43-form-layer')?.classList.remove('open');if(!$('.b43-sheet.open'))document.body.classList.remove('b43-modal-lock')}
function activate(id){
 const b=tab(id);if(!b){console.warn('[B4.3] módulo no encontrado:',id);return}
 closeSheets();closeForm();current=id;localStorage.setItem('cf_active_tab_v2',id);b.click();render(id);
 setTimeout(()=>refreshData(id),300);setTimeout(()=>refreshData(id),1000);
}
function header(id){const m=MODULES[id]||MODULES.dashboard;return `<div class="b43-module-title"><div class="b43-title-icon">${m[2]}</div><div><h1>${m[0]}</h1><p>${m[1]}</p></div></div>`}
function card(label,value,cls=''){return `<article class="b43-kpi ${cls}"><span>${esc(label)}</span><strong>${esc(value)}</strong></article>`}
function listSource(id,empty='Sin registros'){
 const e=native(id);if(!e||!e.children.length)return `<div class="b43-empty">${empty}</div>`;
 return [...e.children].slice(0,40).map((x,i)=>`<article class="b43-row" data-source-index="${i}">${x.innerHTML}</article>`).join('');
}
function sourceHTML(id,selector=''){const e=native(id);if(!e)return '';const x=selector?$(selector,e):e;return x?.innerHTML||''}
function mirrorActions(host,sourceId){
 const src=native(sourceId);if(!src)return;
 $$('.b43-row,button,a',host).forEach((clone,i)=>{const targets=src.children; if(clone.dataset.sourceIndex!=null&&targets[+clone.dataset.sourceIndex]) clone.onclick=()=>targets[+clone.dataset.sourceIndex].click()});
}
function render(id){
 if(!built||rendering)return;rendering=true;current=id||active();const root=shell();if(!root){rendering=false;return}
 const m=MODULES[current]||MODULES.dashboard;
 $('[data-page-title]',root).textContent=m[0];$('[data-page-sub]',root).textContent=m[1];$('.b43-page-icon',root).textContent=m[2];
 $$('[data-tab]',root).forEach(b=>b.classList.toggle('active',b.dataset.tab===current));
 const host=$('.b43-viewhost',root);restoreNativeMount();host.innerHTML='';
 const fn={dashboard:viewDashboard,movimientos:viewMovimientos,deudas:viewDeudas,cuentas:viewCuentas,presupuesto:viewPresupuesto,planificacion:viewPlanificacion,futuros:viewFuturos,calendario:viewCalendario,operaciones:viewOperaciones,ahorro:viewAhorro,ingresos:viewIngresos,jornadas:viewJornadas,'ia-financiera':viewAI}[current]||viewGeneric;
 fn(host);hideLegacy();rendering=false;
}
function shell(){return $('#ccf-mobile-b43')}
function viewDashboard(h){
 h.innerHTML=header('dashboard')+`<div class="b43-select-row"><select id="b43-month-select"></select></div>
 <div class="b43-kpi-grid">${card('Liquidez actual',money('kpi-real-balance'),'blue')}${card('Ingresos del mes',money('kpi-assured'),'green')}${card('Gastos del mes',money('kpi-committed'),'red')}${card('Saldo proyectado',money('kpi-projected-balance'),'navy')}</div>
 <section class="b43-card"><div class="b43-section-head"><strong>Flujo del mes</strong><span>Ingresos · Gastos · Saldo</span></div><div class="b43-chart-mirror" data-chart="chart-flow"></div></section>
 <div class="b43-section-head b43-quick-head"><strong>Accesos rápidos</strong></div><div class="b43-quick-grid"><button data-q="expense">＋<small>Registrar gasto</small></button><button data-q="income">＋<small>Registrar ingreso</small></button><button data-q="debt">◉<small>Ver deudas</small></button><button data-q="plan">◈<small>Planificar</small></button></div>
 <section class="b43-card"><div class="b43-section-head"><strong>Indicadores financieros</strong><span>${esc(txt('summary-status-text','Estado actual'))}</span></div><div class="b43-insights">${card('Ingresos proyectados',money('kpi-projected'))}${card('Egresos comprometidos',money('kpi-committed'))}${card('Brecha financiera',money('kpi-gap'))}${card('Margen restante',money('margin-remaining'))}</div></section>
 <section class="b43-card"><div class="b43-section-head"><strong>Análisis visual</strong><span>Dashboard ejecutivo</span></div><div class="b43-chart-stack" data-charts></div></section>`;
 syncDashboard(h);$$('[data-q]',h).forEach(b=>b.onclick=()=>b.dataset.q==='plan'?activate('planificacion'):b.dataset.q==='debt'?activate('deudas'):openForm('movForm',b.dataset.q==='income'?'Registrar ingreso':'Registrar gasto'));
 const sel=$('#b43-month-select',h);const nativeSelect=$('.financial-control select, #monthSelect, select',native('dashboard')||document);if(nativeSelect){sel.innerHTML=nativeSelect.innerHTML;sel.value=nativeSelect.value;sel.onchange=()=>{nativeSelect.value=sel.value;nativeSelect.dispatchEvent(new Event('change',{bubbles:true}));setTimeout(()=>refreshData('dashboard'),300)}}
}
function syncDashboard(h){
 const src=native('chart-flow');const c=$('[data-chart="chart-flow"]',h);if(src&&c)c.innerHTML=src.innerHTML||'<div class="b43-chart-placeholder">Sin datos gráficos</div>';
 const charts=$('[data-charts]',h);if(!charts)return;['chart-liquidity','chart-flow','chart-obligations','chart-candles','chart-risk','chart-gap','chart-debt-month','chart-debt-planning'].forEach(id=>{const s=native(id);if(s&&s.innerHTML.trim()){const box=document.createElement('article');box.className='b43-mini-chart';box.innerHTML='<strong>'+s.closest('.executive-chart')?.querySelector('h3')?.textContent+'</strong><div>'+s.innerHTML+'</div>';charts.appendChild(box)}});
}
function viewMovimientos(h){
 h.innerHTML=header('movimientos')+`<div class="b43-search"><span>⌕</span><input placeholder="Buscar movimiento..." data-filter="movimientosLista"><button type="button">≡</button></div><div class="b43-filter-row"><button class="active">Todos</button><button>Ingresos</button><button>Gastos</button><button>Transferencias</button></div><section class="b43-card"><div class="b43-section-head"><strong>Movimientos recientes</strong><button class="b43-add" data-open="movForm">＋</button></div><div class="b43-list" data-list="movimientosLista">${listSource('movimientosLista','No hay movimientos registrados.')}</div></section>`;
 $('[data-open]',h).onclick=()=>openForm('movForm','Registrar movimiento');bindFilter(h,'movimientosLista');mirrorActions(h,'movimientosLista');
}
function viewDeudas(h){
 h.innerHTML=header('deudas')+`<div class="b43-segment"><button class="active">Pendientes</button><button>Pagadas</button></div><div class="b43-kpi-grid">${card('Total pendiente',money('deudaSaldoTotal'),'blue')}${card('Vence este mes',money('deuda30Total'),'red')}</div><section class="b43-card"><div class="b43-section-head"><strong>Obligaciones</strong><button class="b43-add" data-open="deudaForm">＋</button></div><div class="b43-list">${listSource('deudasLista','No hay deudas registradas.')}</div></section>`;
 $('[data-open]',h).onclick=()=>{const f=native('deudaForm');if(f)openForm('deudaForm','Registrar deuda')};mirrorActions(h,'deudasLista');
}
function viewCuentas(h){
 h.innerHTML=header('cuentas')+`<div class="b43-filter-row"><button class="active">Todas</button><button>Efectivo</button><button>Bancos</button><button>Otros</button></div><section class="b43-card b43-total-card"><span>Saldo total</span><strong>${money('liquidezCuentasTotal')}</strong></section><section class="b43-card"><div class="b43-section-head"><strong>Mis cuentas</strong><button class="b43-add" data-open="cuentaForm">＋</button></div><div class="b43-list">${listSource('cuentasLista','No hay cuentas registradas.')}</div></section>`;
 $('[data-open]',h).onclick=()=>openForm('cuentaForm','Agregar cuenta');mirrorActions(h,'cuentasLista');
}
function viewFuturos(h){h.innerHTML=header('futuros')+`<section class="b43-card"><div class="b43-section-head"><strong>Próximos 30 días</strong><button class="b43-add" data-open="futureForm">＋</button></div><div class="b43-list">${listSource('futurosLista','No hay pagos futuros.')}</div></section>`; $('[data-open]',h).onclick=()=>openForm('futureForm','Crear pago o compromiso futuro');mirrorActions(h,'futurosLista')}
function viewAhorro(h){h.innerHTML=header('ahorro')+`<section class="b43-card b43-total-card"><span>Saldo de ahorro</span><strong>${money('savingBalance')}</strong></section><section class="b43-card"><div class="b43-section-head"><strong>Historial</strong><button class="b43-add" data-open="savingForm">＋</button></div><div class="b43-list">${listSource('ahorroLista','Sin movimientos de ahorro.')}</div></section>`; $('[data-open]',h).onclick=()=>openForm('savingForm','Registrar ahorro');mirrorActions(h,'ahorroLista')}
function viewCalendario(h){
 const n=native('calendario');h.innerHTML=header('calendario')+`<section class="b43-card"><div class="b43-calendar-head"><button data-cal="prev">‹</button><strong>${esc(txt('calendarMonth','Septiembre 2026'))}</strong><button data-cal="next">›</button></div><div class="b43-cal-metrics">${card('Ingresos',money('calIncome'))}${card('Gastos',money('calExpenses'),'red')}${card('Pagos',money('calPayments'))}${card('Saldo cierre',money('calFinalBalance'),'green')}</div><div class="b43-calendar-grid">${sourceHTML('calendario','.calendar-scroll')||'<div class="b43-empty">Calendario cargando…</div>'}</div><div class="b43-day-details">${sourceHTML('calendario','#calendarDayDetails')}</div></section>`;
 $('[data-cal="prev"]',h).onclick=()=>{fire('calPrev');setTimeout(()=>refreshData('calendario'),250)};$('[data-cal="next"]',h).onclick=()=>{fire('calNext');setTimeout(()=>refreshData('calendario'),250)};
}
function viewPresupuesto(h){h.innerHTML=header('presupuesto')+`<div class="b43-kpi-grid">${card('Presupuesto mensual',money('b233Total'),'blue')}${card('Ejecutado',money('b233Executed'),'green')}</div><div class="b43-native-host"></div>`;mountNative('presupuesto',$('.b43-native-host',h))}
function viewPlanificacion(h){h.innerHTML=header('planificacion')+`<div class="b43-kpi-grid">${card('Saldo proyectado',money('b219Proj'),'blue')}${card('Ingresos futuros',money('b219Future'),'green')}${card('Deudas pendientes',money('b219Debt'),'red')}${card('Ingresos generados',money('b219Gen'))}</div><div class="b43-native-host"></div>`;mountNative('planificacion',$('.b43-native-host',h))}
function viewOperaciones(h){h.innerHTML=header('operaciones')+`<div class="b43-ops-grid"><button data-op="income">↑<span>Registrar ingreso</span></button><button data-op="expense">↓<span>Registrar gasto</span></button><button data-op="transfer">⇄<span>Transferencia</span></button><button data-op="adjust">◫<span>Ajuste de saldo</span></button></div><section class="b43-native-mobile-card">${sourceHTML('operaciones')||''}</section>`;$$('[data-op]',h).forEach(b=>b.onclick=()=>b.dataset.op==='income'?openForm('movForm','Registrar ingreso'):b.dataset.op==='expense'?openForm('movForm','Registrar gasto'):activate('cuentas'))}
function viewIngresos(h){h.innerHTML=header('ingresos')+`<div class="b43-kpi-grid">${card('Generado neto',money('b219Generated'),'green')}${card('Cobrado',money('b219Received'))}${card('Pendiente',money('b219Pending'),'red')}</div><div class="b43-native-host"></div>`;mountNative('ingresos',$('.b43-native-host',h))}
function viewJornadas(h){h.innerHTML=header('jornadas')+`<div class="b43-native-host"></div>`;mountNative('jornadas',$('.b43-native-host',h))}
function viewAI(h){const n=native('ia-financiera');const buttons=n?[...n.querySelectorAll('button')].slice(0,8):[];h.innerHTML=header('ia-financiera')+`<section class="b43-ai-card"><div class="b43-ai-icon">✦</div><h2>Tu asistente financiero</h2><p>Analiza tus datos y entrega recomendaciones personalizadas.</p><div class="b43-ai-actions">${(buttons.length?buttons.map(b=>`<button data-ai="${esc(b.textContent)}">${esc(b.textContent)}</button>`):['Analiza mis gastos del mes','¿Puedo cubrir mis deudas?','Sugerencias de ahorro','Proyección del próximo mes']).map(x=>typeof x==='string'?`<button>${x}</button>`:x).join('')}</div></section>`;$$('[data-ai]',h).forEach(b=>b.onclick=()=>{buttons.find(x=>x.textContent.trim()===b.dataset.ai)?.click()})}
function viewGeneric(h){h.innerHTML=header(current)+`<div class="b43-native-host"></div>`;mountNative(current,$('.b43-native-host',h))}
function bindFilter(h,id){const input=$(`[data-filter="${id}"]`,h),src=native(id);if(!input||!src)return;input.oninput=()=>{const q=input.value.toLowerCase();$$('.b43-row',h).forEach((r,i)=>{r.style.display=!q||src.children[i]?.textContent.toLowerCase().includes(q)?'':'none'})}}
function refreshData(id){if(!ready()||!built||current!==id)return;const old=current;rendering=false;render(old)}
function observe(){
 if(observer)clearInterval(observer);
 observer=setInterval(()=>{if(ready()&&!rendering)refreshData(current)},2200);
}
function restore(){if(observer)clearInterval(observer);observer=null;$('#ccf-mobile-b43')?.remove();showLegacy();document.body.classList.remove('b43-modal-lock');built=false}
function boot(){if(!mobile())return;if(!ready()){setTimeout(boot,250);return}build();hideLegacy();observe()}
window.addEventListener('resize',()=>setTimeout(()=>mobile()?boot():restore(),200));
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
window.CCFMobileB43={version:'4.3.0-mobile-product-views',activate,disable:restore,refresh:()=>refreshData(current)};
})();
