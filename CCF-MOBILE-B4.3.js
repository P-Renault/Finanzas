/* CCF MOBILE B4.3.3 — ETAPA 1 · MENÚ + RESUMEN CORREGIDO
   Presentación móvil aislada. Mantiene los nodos reales del Resumen para conservar
   gráficos, listeners y botones interactivos. No crea Supabase ni toca autenticación.
*/
(()=>{'use strict';
if(window.__CCF_MOBILE_B433__)return; window.__CCF_MOBILE_B433__=true;
const BP=720,$=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const app=()=>document.getElementById('app'), mobile=()=>matchMedia('(max-width:'+BP+'px)').matches;
const by=id=>document.getElementById(id), tab=id=>$('.tabs button[data-tab="'+CSS.escape(id)+'"]');
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const META={
 presupuesto:['Presupuesto','Plan, ejecución y proyección','◒'],planificacion:['Planificación','Escenario de 30 días','◈'],
 futuros:['Pagos futuros','Vencimientos y compromisos','◷'],calendario:['Calendario','Vista mensual','▦'],
 ahorro:['Ahorro','Aportes e historial','◎'],operaciones:['Operaciones','Liquidez y operaciones','⇄'],
 ingresos:['Motor Multifuente','Generación de ingresos','↗'],jornadas:['Control de Jornada','Resultado financiero','◷'],
 'ia-financiera':['IA Financiera','Análisis y recomendaciones','✦']
};
const PRIMARY=[['dashboard','Resumen','⌂'],['movimientos','Movimientos','↕'],['deudas','Deudas','▣'],['cuentas','Cuentas','▤']];
let root=null,built=false,moved=[],observer=null,breakpointHandler=null;

function ready(){return mobile()&&app()&&!app().classList.contains('hidden')}
function hideLegacy(){/* Solo CSS controla el aislamiento. No se manipulan auth/config. */}
function mirror(id){const src=by(id); if(!src||!root)return; $$('.b433-mirror[data-source="'+id+'"]',root).forEach(n=>n.textContent=src.textContent?.trim()||'—')}
function mirrorAll(){[
 'future-month-label','month-income-total','month-expense-total','kpi-real-balance',
 'kpi-assured','kpi-projected','kpi-committed','kpi-projected-balance','kpi-gap',
 'margin-status','margin-maximum','margin-spent','margin-remaining','margin-percent','margin-projection',
 'summary-status-text','executive-risk-summary','exec-liquidity-reading','exec-obligation-reading',
 'exec-flow-reading','exec-generation-reading'
].forEach(mirror);
 const p=by('margin-progress'), q=$('[data-progress]',root); if(p&&q)q.style.width=p.style.width||'0%';
}

function moveReal(id,host){
 const el=by(id); if(!el||!host||el.dataset.b433Moved==='1')return el;
 const marker=document.createComment('CCF B4.3.3 '+id);
 el.parentNode?.insertBefore(marker,el); host.appendChild(el);
 el.dataset.b433Moved='1'; moved.push({el,marker}); return el;
}
function restoreReal(){
 for(const x of moved.slice().reverse()){
   delete x.el.dataset.b433Moved;
   if(x.marker.parentNode)x.marker.parentNode.insertBefore(x.el,x.marker.nextSibling);
   x.marker.remove();
 }
 moved=[];
}
function nativeTab(id){const b=tab(id);if(b){b.click();return true}return false}

function closeAll(){ $$('.b433-overlay.open',root).forEach(x=>x.classList.remove('open')); document.body.classList.remove('b433-lock') }
function notice(name){const o=$('.b433-overlay[data-overlay="notice"]',root);if(!o)return;o.querySelector('[data-notice]').textContent=name;o.classList.add('open');document.body.classList.add('b433-lock')}
function openMore(){populateMore();$('.b433-overlay[data-overlay="more"]',root)?.classList.add('open');document.body.classList.add('b433-lock')}
function openProfile(){$('.b433-overlay[data-overlay="profile"]',root)?.classList.add('open');document.body.classList.add('b433-lock')}
function navigate(id){
 closeAll();
 if(id==='dashboard'){ nativeTab('dashboard'); setActive('dashboard'); return; }
 notice(META[id]?.[0]||id);
}
function setActive(id){$$('[data-nav]',root).forEach(b=>b.classList.toggle('active',b.dataset.nav===id))}

function populateMore(){
 const g=$('[data-more-grid]',root); if(!g)return; g.innerHTML='';
 const ids=[...new Set([...$$('.tabs button[data-tab]').map(b=>b.dataset.tab),...Object.keys(META)])]
 .filter(id=>id&&id!=='dashboard'&&!PRIMARY.some(x=>x[0]===id));
 ids.forEach(id=>{const m=META[id]||[id,'Módulo financiero','◉'];const b=document.createElement('button');b.className='b433-module';
 b.innerHTML='<b>'+esc(m[2])+'</b><span><strong>'+esc(m[0])+'</strong><small>'+esc(m[1])+'</small></span>';
 b.onclick=()=>navigate(id);g.appendChild(b)});
}

function openMoveForm(title){
 const form=by('movForm'); if(!form){notice('Registro de movimientos');return}
 const overlay=$('.b433-overlay[data-overlay="form"]',root),slot=$('[data-form-slot]',root);
 if(!overlay||!slot)return;
 if(form.dataset.b433Moved!=='1'){
   const marker=document.createComment('CCF B4.3.3 movForm'); form.parentNode.insertBefore(marker,form);
   slot.appendChild(form);form.dataset.b433Moved='1';form.dataset.b433Marker='1';
   moved.push({el:form,marker});
 }
 overlay.querySelector('[data-form-title]').textContent=title;overlay.classList.add('open');document.body.classList.add('b433-lock');
}
function quick(type){
 if(type==='debt'){notice('Deudas');return}
 if(type==='plan'){notice('Planificación');return}
 openMoveForm(type==='income'?'Registrar ingreso':'Registrar gasto');
 const sel=by('movTipo');if(sel)sel.value=type==='income'?'ingreso':'gasto';
}

function summary(){
 const c=$('[data-content]',root);
 c.innerHTML=`
 <section class="b433-period"><div><span>PERÍODO</span><strong class="b433-mirror" data-source="future-month-label">—</strong></div><button type="button" data-period aria-label="Período">⌄</button></section>
 <section class="b433-kpis">
  <article class="b433-kpi blue"><span>Liquidez actual</span><strong class="b433-mirror" data-source="kpi-real-balance">—</strong></article>
  <article class="b433-kpi green"><span>Ingresos del mes</span><strong class="b433-mirror" data-source="month-income-total">—</strong></article>
  <article class="b433-kpi red"><span>Gastos del mes</span><strong class="b433-mirror" data-source="month-expense-total">—</strong></article>
  <article class="b433-kpi navy"><span>Saldo proyectado</span><strong class="b433-mirror" data-source="kpi-projected-balance">—</strong></article>
 </section>
 <section class="b433-card"><header><strong>Flujo del mes</strong><small>Ingresos · Gastos · Saldo</small></header><div class="b433-real-chart" data-flow></div></section>
 <div class="b433-section-title">Accesos rápidos</div>
 <section class="b433-quick">
  <button type="button" data-quick="expense"><b>＋</b><small>Registrar gasto</small></button>
  <button type="button" data-quick="income"><b>＋</b><small>Registrar ingreso</small></button>
  <button type="button" data-quick="debt"><b>◉</b><small>Ver deudas</small></button>
  <button type="button" data-quick="plan"><b>◇</b><small>Planificar</small></button>
 </section>
 <section class="b433-card"><header><strong>Estado financiero</strong><small class="b433-mirror" data-source="summary-status-text">—</small></header>
  <div class="b433-grid2">
   <article><span>Ingresos asegurados</span><strong class="b433-mirror" data-source="kpi-assured">—</strong></article>
   <article><span>Ingresos proyectados</span><strong class="b433-mirror" data-source="kpi-projected">—</strong></article>
   <article><span>Egresos comprometidos</span><strong class="b433-mirror" data-source="kpi-committed">—</strong></article>
   <article><span>Brecha financiera</span><strong class="b433-mirror" data-source="kpi-gap">—</strong></article>
  </div>
 </section>
 <section class="b433-card"><header><strong>Compromisos próximos</strong><small>Movimientos futuros</small></header>
  <div class="b433-future"><article><header><b>Ingresos</b><span class="b433-mirror" data-source="future-income-count">0</span></header><div data-income-list></div></article>
  <article><header><b>Egresos</b><span class="b433-mirror" data-source="future-expense-count">0</span></header><div data-expense-list></div></article></div>
 </section>
 <section class="b433-card"><header><strong>Control diario</strong><small class="b433-mirror" data-source="margin-status">—</small></header>
  <div class="b433-margin"><article><span>Margen máximo</span><strong class="b433-mirror" data-source="margin-maximum">—</strong></article>
  <article><span>Gastado</span><strong class="b433-mirror" data-source="margin-spent">—</strong></article>
  <article><span>Margen restante</span><strong class="b433-mirror" data-source="margin-remaining">—</strong></article></div>
  <div class="b433-progress"><i data-progress></i></div><footer><span class="b433-mirror" data-source="margin-percent">—</span><span class="b433-mirror" data-source="margin-projection">—</span></footer>
 </section>
 <section class="b433-card"><header><strong>Proyección financiera</strong><small>90 días</small></header><div class="b433-real-table" data-projection></div></section>
 <section class="b433-decision"><article><span>PRÓXIMA NECESIDAD</span><div data-next></div></article><article><span>ACCIONES PRIORITARIAS</span><div data-priority></div></article></section>
 <section class="b433-card"><header><div><strong>Análisis ejecutivo</strong><small>Anticipación de liquidez, presión financiera y apoyo cuantitativo</small></div><small class="b433-mirror" data-source="executive-risk-summary">—</small></header>
  <div class="b433-insights">${[['Liquidez','exec-liquidity-reading'],['Obligaciones','exec-obligation-reading'],['Flujo próximo','exec-flow-reading'],['Generación requerida','exec-generation-reading']].map(x=>`<article><span>${x[0]}</span><strong class="b433-mirror" data-source="${x[1]}">—</strong></article>`).join('')}</div>
  <div class="b433-charts" data-exec></div>
 </section>`;

 // Move the real nodes, preserving their rendered charts and event listeners.
 const flow=by('chart-flow'); if(flow)moveReal('chart-flow',$('[data-flow]',c));
 moveReal('future-income-list',$('[data-income-list]',c));
 moveReal('future-expense-list',$('[data-expense-list]',c));
 moveReal('projection-table',$('[data-projection]',c));
 moveReal('next-need',$('[data-next]',c));
 moveReal('priority-actions',$('[data-priority]',c));

 const execHost=$('[data-exec]',c);
 const chartIds=['chart-liquidity','chart-obligations','chart-candles','chart-risk','chart-gap','chart-debt-month','chart-debt-planning'];
 const titles={ 'chart-liquidity':'Curva de liquidez','chart-obligations':'Composición de obligaciones','chart-candles':'Velas financieras','chart-risk':'Ventana de riesgo','chart-gap':'Brecha y recursos','chart-debt-month':'Deudas del mes en curso','chart-debt-planning':'Backlog de deudas'};
 const desc={ 'chart-liquidity':'Trayectoria del saldo proyectado y reserva mínima.','chart-obligations':'Distribución del compromiso financiero por fuente.','chart-candles':'Variación semanal de liquidez.','chart-risk':'Primera caída bajo la reserva mínima.','chart-gap':'Recursos disponibles frente a obligaciones.','chart-debt-month':'Deudas con vencimiento dentro del mes.','chart-debt-planning':'Pendientes y deudas sin fecha de inicio.'};
 chartIds.forEach(id=>{const el=by(id);if(!el||!execHost)return;const card=document.createElement('article');card.className='b433-chart-card';card.innerHTML='<strong>'+esc(titles[id])+'</strong><small>'+esc(desc[id])+'</small>';execHost.appendChild(card);moveReal(id,card)});

 $$('[data-quick]',c).forEach(b=>b.onclick=()=>quick(b.dataset.quick));
 $('[data-period]',c).onclick=()=>notice('Selector de período');
 mirrorAll();
}

function build(){
 if(built||!ready())return;
 built=true;root=document.createElement('div');root.id='ccf-mobile-b43';
 root.innerHTML=`<header class="b433-header"><button class="b433-logo" data-home>CCF</button><div><strong>Centro de Control Financiero</strong><small>Tu vida financiera en un solo lugar</small></div><button class="b433-bell" type="button" aria-label="Notificaciones">♧</button><button class="b433-avatar" type="button" data-profile>P</button></header><main data-content></main><nav class="b433-bottom">${PRIMARY.map(x=>`<button type="button" data-nav="${x[0]}"><span>${x[2]}</span><small>${x[1]}</small></button>`).join('')}<button type="button" data-more><span>☰</span><small>Más</small></button></nav>
 <div class="b433-overlay" data-overlay="more"><div class="b433-backdrop" data-close></div><section><i></i><header><div><strong>Todos los módulos</strong><small>Acceso a módulos del sistema</small></div><button type="button" data-close>×</button></header><div class="b433-module-grid" data-more-grid></div></section></div>
 <div class="b433-overlay" data-overlay="profile"><div class="b433-backdrop" data-close></div><section><i></i><header><div><strong>Perfil</strong><small>Sesión activa</small></div><button type="button" data-close>×</button></header><div class="b433-profile">Cuenta autenticada en Centro de Control Financiero.</div><button type="button" class="b433-danger" data-logout>Cerrar sesión</button></section></div>
 <div class="b433-overlay" data-overlay="form"><div class="b433-backdrop" data-close></div><section><header><strong data-form-title>Registrar movimiento</strong><button type="button" data-close>×</button></header><div data-form-slot></div></section></div>
 <div class="b433-overlay" data-overlay="notice"><div class="b433-backdrop" data-close></div><section class="b433-notice"><strong>Integración por etapas</strong><p>El módulo <b data-notice>—</b> se integrará en la siguiente etapa. El Resumen actual mantiene sus datos, gráficos y funciones originales.</p><button type="button" data-close>Continuar</button></section></div>`;
 app().prepend(root);
 $$('[data-nav]',root).forEach(b=>b.onclick=()=>navigate(b.dataset.nav));$('[data-more]',root).onclick=openMore;$('[data-profile]',root).onclick=openProfile;$('[data-home]',root).onclick=()=>navigate('dashboard');
 $$('[data-close]',root).forEach(b=>b.onclick=closeAll);$('[data-logout]',root).onclick=()=>by('logoutBtn')?.click();
 populateMore();summary();setActive('dashboard');
}

function observe(){
 if(observer)observer.disconnect();
 const ids=['future-month-label','month-income-total','month-expense-total','future-income-count','future-expense-count','kpi-real-balance','kpi-assured','kpi-projected','kpi-committed','kpi-projected-balance','kpi-gap','margin-status','margin-maximum','margin-spent','margin-remaining','margin-percent','margin-projection','summary-status-text','executive-risk-summary','exec-liquidity-reading','exec-obligation-reading','exec-flow-reading','exec-generation-reading'];
 observer=new MutationObserver(()=>mirrorAll());
 ids.map(by).filter(Boolean).forEach(n=>observer.observe(n,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['style','class']}));
}
function restore(){
 observer?.disconnect();observer=null;closeAll();restoreReal();root?.remove();root=null;built=false;document.body.classList.remove('b433-lock');
}
function boot(){if(!mobile()){restore();return}if(!ready()){if(built)restore();return}if(!built){build();observe()} }
window.addEventListener('resize',()=>setTimeout(boot,100));window.addEventListener('orientationchange',()=>setTimeout(boot,150));
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
window.CCFMobileB43={version:'4.3.3-stage1-summary',refresh:mirrorAll,disable:restore};
})();