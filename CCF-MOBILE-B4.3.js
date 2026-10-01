/* CCF MOBILE B4.3.10 — ETAPA 1 · CORRECCIÓN RESUMEN
   Solo presentación móvil. No crea Supabase ni modifica autenticación.
   No modifica index.html, app.js ni módulos financieros.
*/
(()=>{'use strict';
if(window.__CCF_MOBILE_B434__)return; window.__CCF_MOBILE_B434__=true;
const BP=720,$=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const app=()=>document.getElementById('app'), mobile=()=>matchMedia('(max-width:'+BP+'px)').matches;
const by=id=>document.getElementById(id), tab=id=>$('.tabs button[data-tab="'+CSS.escape(id)+'"]');
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const META={presupuesto:['Presupuesto','Plan, ejecución y proyección','◒'],planificacion:['Planificación','Escenario de 30 días','◈'],futuros:['Pagos futuros','Vencimientos y compromisos','◷'],calendario:['Calendario','Vista mensual','▦'],ahorro:['Ahorro','Aportes e historial','◎'],operaciones:['Operaciones','Liquidez y operaciones','⇄'],ingresos:['Motor Multifuente','Generación de ingresos','↗'],jornadas:['Control de Jornada','Resultado financiero','◷'],'ia-financiera':['IA Financiera','Análisis y recomendaciones','✦']};
const PRIMARY=[['dashboard','Resumen','⌂'],['movimientos','Movimientos','↕'],['deudas','Deudas','▣'],['cuentas','Cuentas','▤']];
let root=null,built=false,moved=[],observer=null,reportTimer=null,activeModule=null,moduleMarker=null;

function ready(){return mobile()&&app()&&!app().classList.contains('hidden')}
function mirror(id){const src=by(id);if(!src||!root)return;$$('.b434-mirror[data-source="'+id+'"]',root).forEach(n=>n.textContent=src.textContent?.trim()||'—')}
function mirrorAll(){[
'future-month-label','month-income-total','month-expense-total','kpi-real-balance','kpi-assured','kpi-projected','kpi-committed','kpi-projected-balance','kpi-gap',
'margin-status','margin-maximum','margin-spent','margin-remaining','margin-percent','margin-projection','summary-status-text','executive-risk-summary',
'exec-liquidity-reading','exec-obligation-reading','exec-flow-reading','exec-generation-reading'
].forEach(mirror);
const p=by('margin-progress'),q=$('[data-progress]',root);if(p&&q)q.style.width=p.style.width||'0%';}

function moveReal(id,host){
 const el=by(id);if(!el||!host||el.dataset.b434Moved==='1')return el;
 const marker=document.createComment('CCF B4.3.4 '+id);el.parentNode?.insertBefore(marker,el);host.appendChild(el);
 el.dataset.b434Moved='1';moved.push({el,marker});return el;
}
function restoreReal(){for(const x of moved.slice().reverse()){delete x.el.dataset.b434Moved;if(x.marker.parentNode)x.marker.parentNode.insertBefore(x.el,x.marker.nextSibling);x.marker.remove()}moved=[]}
function nativeTab(id){const b=tab(id);if(b){b.click();return true}return false}
function closeAll(){$$('.b434-overlay.open',root).forEach(x=>x.classList.remove('open'));document.body.classList.remove('b434-lock')}
function notice(name){const o=$('.b434-overlay[data-overlay="notice"]',root);if(!o)return;o.querySelector('[data-notice]').textContent=name;o.classList.add('open');document.body.classList.add('b434-lock')}
function setActive(id){$$('[data-nav]',root).forEach(b=>b.classList.toggle('active',b.dataset.nav===id))}
function restoreActiveModule(){
 if(!activeModule)return;
 const el=activeModule;
 delete el.dataset.b434ModuleMoved;
 if(moduleMarker?.parentNode)moduleMarker.parentNode.insertBefore(el,moduleMarker.nextSibling);
 moduleMarker?.remove();
 moduleMarker=null;
 activeModule=null;
}
function moduleHost(){
 return $('[data-module-host]',root);
}

function movementMoney(text){
 const n=String(text||'').replace(/[^\d-]/g,'');
 return Number(n)||0;
}
function buildMovementsMobileShell(host,section){
 let shell=host.querySelector('[data-b434-movements-shell]');
 if(shell)return shell;
 shell=document.createElement('section');
 shell.className='b434-movements-shell';
 shell.dataset.b434MovementsShell='1';
 shell.innerHTML=`
   <div class="b434-mov-head">
     <span class="b434-eyebrow">CONTROL FINANCIERO</span>
     <h2>Movimientos</h2>
     <p>Registra, consulta y administra tus ingresos y gastos.</p>
   </div>
   <div class="b434-mov-kpis">
     <article><span>Ingresos</span><strong data-mov-income>$0</strong></article>
     <article><span>Gastos</span><strong data-mov-expense>$0</strong></article>
     <article><span>Balance</span><strong data-mov-balance>$0</strong></article>
     <article><span>Movimientos</span><strong data-mov-count>0</strong></article>
   </div>
   <div class="b434-mov-actions">
     <button type="button" data-mov-action="income">＋ Ingreso</button>
     <button type="button" data-mov-action="expense">＋ Gasto</button>
   </div>
   <div class="b434-mov-filter">
     <input type="search" data-mov-search placeholder="Buscar categoría o descripción…">
     <select data-mov-type>
       <option value="all">Todos</option>
       <option value="ingreso">Ingresos</option>
       <option value="gasto">Gastos</option>
     </select>
     <select data-mov-period>
       <option value="all">Todo el período</option>
       <option value="month">Mes actual</option>
       <option value="future">Futuros</option>
     </select>
   </div>`;
 host.insertBefore(shell,section);

 shell.querySelector('[data-mov-action="income"]').onclick=()=>{
   openMoveForm('Registrar ingreso');
   const s=by('movTipo');if(s)s.value='ingreso';
 };
 shell.querySelector('[data-mov-action="expense"]').onclick=()=>{
   openMoveForm('Registrar gasto');
   const s=by('movTipo');if(s)s.value='gasto';
 };
 shell.querySelector('[data-mov-search]').addEventListener('input',refreshMovementView);
 shell.querySelector('[data-mov-type]').addEventListener('change',refreshMovementView);
 shell.querySelector('[data-mov-period]').addEventListener('change',refreshMovementView);
 return shell;
}
function decorateMovementRows(){
 const list=by('movimientosLista');
 if(!list)return [];
 const rows=[...list.querySelectorAll('.row')];
 const today=new Date().toISOString().slice(0,10);
 const now=new Date();
 const ym=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
 let income=0,expense=0;

 rows.forEach(row=>{
   const text=row.textContent||'';
   const amountNode=row.querySelector('.row-right strong, .row-right b, strong');
   const raw=amountNode?.textContent||'';
   const amount=movementMoney(raw);
   const negative=amountNode?.classList.contains('negative') ||
                  /\bGasto\b/i.test(text) ||
                  /^\s*-\s*\$/.test(raw);
   const dateNode=row.querySelector('.row-main small, time, [data-date]');
   const date=(dateNode?.textContent||dateNode?.getAttribute?.('datetime')||'').trim();
   if(negative)expense+=Math.abs(amount); else income+=Math.abs(amount);

   row.dataset.movType=negative?'gasto':'ingreso';
   row.dataset.movDate=date;
   row.dataset.movSearch=text.toLowerCase();
   row.dataset.movCurrent=(date.startsWith(ym)||date.includes(`${String(now.getMonth()+1).padStart(2,'0')}-${now.getFullYear()}`))?'1':'0';
   row.dataset.movFuture=(date>today)?'1':'0';
   row.classList.add('b434-movement-card');
 });
 return {rows,income,expense};
}
function adaptMovementsMobile(){
 const section=by('movimientos');
 const host=moduleHost();
 if(!section||!host)return false;
 section.classList.add('b434-movements-mobile');

 const shell=buildMovementsMobileShell(host,section);
 const data=decorateMovementRows();
 const clp=n=>'$'+Math.round(n).toLocaleString('es-CL');
 const set=(sel,val)=>{const n=shell.querySelector(sel);if(n)n.textContent=val};

 if(data && Array.isArray(data.rows)){
   const income=Math.abs(data.income);
   const expense=Math.abs(data.expense);
   set('[data-mov-income]',clp(income));
   set('[data-mov-expense]',clp(expense));
   set('[data-mov-balance]',clp(income-expense));
   set('[data-mov-count]',String(data.rows.length));
 }
 refreshMovementView();
 return true;
}
function refreshMovementView(){
 const section=by('movimientos');if(!section)return;
 const list=by('movimientosLista');if(!list)return;
 const host=moduleHost();
 const shell=host?.querySelector('[data-b434-movements-shell]');
 if(!shell)return;

 decorateMovementRows();

 const q=(shell.querySelector('[data-mov-search]')?.value||'').trim().toLowerCase();
 const type=shell.querySelector('[data-mov-type]')?.value||'all';
 const period=shell.querySelector('[data-mov-period]')?.value||'all';

 [...list.querySelectorAll('.row')].forEach(row=>{
   const matchesSearch=!q||(row.dataset.movSearch||'').includes(q);
   const matchesType=type==='all'||row.dataset.movType===type;
   const matchesPeriod=period==='all' ||
     (period==='month'&&row.dataset.movCurrent==='1') ||
     (period==='future'&&row.dataset.movFuture==='1');
   row.style.display=matchesSearch&&matchesType&&matchesPeriod?'':'none';
 });
}

function adaptDesktopModule(id){
 const host=moduleHost();
 if(!host)return false;
 restoreActiveModule();
 let section=by(id);

 // Planificación/Operaciones son módulos dinámicos con router propietario.
 // Se solicita su montaje antes de intentar mover la sección real.
 if(!section && (id==='planificacion'||id==='operaciones') &&
    window.CCFRouter && typeof window.CCFRouter.show==='function'){
   try{ window.CCFRouter.show(id); }catch(e){ console.warn('[CCF MOBILE] router',e); }
   section=by(id);
 }
 if(!section){
   return false;
 }
 moduleMarker=document.createComment('CCF B4.3.4 module '+id);
 section.parentNode?.insertBefore(moduleMarker,section);
 section.classList.remove('hidden');
 section.dataset.b434ModuleMoved='1';
 host.replaceChildren(section);
 activeModule=section;
 host.classList.add('open');
 return true;
}
/* CCF MOBILE B4.3.10 — CALENDARIO · BOOTSTRAP GRID AISLADO
   Bootstrap 5.3 grid aplicado únicamente a #calendario.
   No modifica B232.26.4-calendario-safe.js ni otros módulos.
*/
let calendarObserver=null;
let calendarAdaptScheduled=false;
function calendarIsMobile(){
  /* El calendario es móvil cuando está montado dentro de la shell móvil.
     370px es la referencia de ancho del widget, NO un breakpoint de viewport. */
  return !!root && !!by('calendario') && root.id==='ccf-mobile-b43';
}

function adaptB232261CalendarMobile(){
  if(!calendarIsMobile()) return false;
  const section=by('calendario');
  if(!section) return false;

  const card=section.querySelector('.b232261-card');
  const scroll=section.querySelector('.b232261-scroll');
  const grid=section.querySelector('.b232261-grid.b232261-week') ||
             section.querySelector('.b232261-grid');
  if(!card||!scroll||!grid) return false;

  /*
   * Bootstrap 5 grid aislado al calendario.
   * No depende de un breakpoint de 370px: 370px es el ancho de referencia
   * del widget. La grilla siempre ocupa el ancho real disponible.
   */
  grid.classList.add('row','g-0','b434-bs-calendar-row');

  const imp=(el,p,v)=>{
    if(el) el.style.setProperty(p,String(v),'important');
  };

  [section,card,scroll,grid].forEach(el=>{
    imp(el,'width','100%');
    imp(el,'max-width','100%');
    imp(el,'min-width','0');
    imp(el,'box-sizing','border-box');
  });

  imp(section,'overflow','hidden');
  imp(card,'overflow','hidden');
  imp(scroll,'display','block');
  imp(scroll,'overflow-x','hidden');
  imp(scroll,'overflow-y','visible');

  /*
   * La regla desktop del motor es:
   * repeat(7,minmax(110px,1fr)) + min-width:770px.
   * Se anula directamente en línea con !important.
   */
  imp(grid,'display','grid');
  imp(grid,'grid-template-columns','repeat(7,minmax(0,1fr))');
  imp(grid,'grid-template-rows','auto');
  imp(grid,'grid-auto-flow','row');
  imp(grid,'width','100%');
  imp(grid,'min-width','0');
  imp(grid,'max-width','100%');
  imp(grid,'overflow','hidden');
  imp(grid,'margin','0');
  imp(grid,'padding','0');
  imp(grid,'gap','0');

  const cells=[...grid.children];
  cells.forEach((cell)=>{
    cell.classList.add('col','b434-bs-calendar-col');
    imp(cell,'width','auto');
    imp(cell,'min-width','0');
    imp(cell,'max-width','100%');
    imp(cell,'box-sizing','border-box');
    imp(cell,'margin','0');
    imp(cell,'padding-left','0');
    imp(cell,'padding-right','0');
    imp(cell,'overflow','hidden');
  });

  section.querySelectorAll('.b232261-day').forEach(day=>{
    imp(day,'width','100%');
    imp(day,'min-width','0');
    imp(day,'max-width','100%');
    imp(day,'min-height','78px');
    imp(day,'height','78px');
    imp(day,'box-sizing','border-box');
    imp(day,'overflow','hidden');
  });

  return true;
}

function scheduleCalendarMobileAdapt(){
  if(!calendarIsMobile()||calendarAdaptScheduled)return;
  calendarAdaptScheduled=true;
  requestAnimationFrame(()=>{
    calendarAdaptScheduled=false;
    adaptB232261CalendarMobile();
  });
}

function observeCalendarMobile(){
  calendarObserver?.disconnect();
  calendarObserver=null;
  const section=by('calendario');
  if(!calendarIsMobile()||!section)return;
  calendarObserver=new MutationObserver(()=>scheduleCalendarMobileAdapt());
  calendarObserver.observe(section,{childList:true,subtree:true});
  scheduleCalendarMobileAdapt();
}

function showModuleAfterNavigation(id){
 const content=$('[data-content]',root);
 const host=moduleHost();
 if(id==='dashboard'){
   restoreActiveModule();
   host?.classList.remove('open');
   content?.classList.remove('b434-view-hidden');
   summary();
   setActive('dashboard');
   return true;
 }
 const ok=adaptDesktopModule(id);
 if(ok){
   content?.classList.add('b434-view-hidden');
   host?.classList.add('open');
   host?.setAttribute('data-active-module',id);
   if(id==='movimientos'){
     adaptMovementsMobile();
     setTimeout(adaptMovementsMobile,250);
     setTimeout(adaptMovementsMobile,700);
     setTimeout(adaptMovementsMobile,1500);
     setTimeout(adaptMovementsMobile,2500);
   }
   if(id==='calendario'){
     /*
      * B4.3.18.1 Premium: se acopla sobre la vista calendario existente.
      * La vista/engine B232.26.4 no se sustituye ni recalcula.
      * El script Premium permanece integrado en index.html.
      */
     observeCalendarMobile();
     setTimeout(activateBootstrapCalendarView,120);
     setTimeout(adaptB232261CalendarMobile,50);
     setTimeout(adaptB232261CalendarMobile,150);
     setTimeout(adaptB232261CalendarMobile,350);
     setTimeout(adaptB232261CalendarMobile,800);
     const mountPremium181=()=>{
       const api=window.CCFCalendarMobilePremium181;
       if(!api||typeof api.render!=='function')return false;
       try{return !!api.render();}catch(e){console.warn('[CCF MOBILE] B4.3.18.1',e);return false;}
     };
     [180,400,800,1400,2200].forEach(ms=>setTimeout(()=>{
       if(root?.id==='ccf-mobile-b43'&&by('calendario'))mountPremium181();
     },ms));
     mountPremium181();
   }
   setActive(id);
   return true;
 }
 return false;
}
function navigate(id){
 closeAll();
 if(id==='dashboard'){
   nativeTab('dashboard');
   showModuleAfterNavigation('dashboard');
   return;
 }
 const native=nativeTab(id);
 let attempts=0;
 const mount=()=>{
   attempts++;
   if(showModuleAfterNavigation(id))return;
   if(attempts<10){setTimeout(mount,180);return}
   notice(META[id]?.[0]||id);
 };
 setTimeout(mount,120);
 if(!native && !META[id])notice(id);
}
function openMore(){populateMore();$('.b434-overlay[data-overlay="more"]',root)?.classList.add('open');document.body.classList.add('b434-lock')}
function openProfile(){$('.b434-overlay[data-overlay="profile"]',root)?.classList.add('open');document.body.classList.add('b434-lock')}

function populateMore(){
 const g=$('[data-more-grid]',root);if(!g)return;g.innerHTML='';
 const tabIds=$$('.tabs button[data-tab]').map(b=>b.dataset.tab).filter(Boolean);
 const ids=[...new Set([...tabIds,...Object.keys(META)])].filter(Boolean);
 ids.forEach(id=>{
   const m=(id==='dashboard'?['Resumen','Panel financiero','⌂']:
            id==='movimientos'?['Movimientos','Ingresos, gastos e historial','↕']:
            id==='deudas'?['Deudas','Obligaciones y vencimientos','▣']:
            id==='cuentas'?['Cuentas','Saldos y liquidez','▤']:
            META[id]||[id,'Módulo financiero','◉']);
   const b=document.createElement('button');
   b.type='button';
   b.className='b434-module';
   b.dataset.module=id;
   b.innerHTML='<b>'+esc(m[2])+'</b><span><strong>'+esc(m[0])+'</strong><small>'+esc(m[1])+'</small></span>';
   b.onclick=()=>navigate(id);
   g.appendChild(b)
 })
}
function openMoveForm(title){
 const form=by('movForm');if(!form){notice('Registro de movimientos');return}
 const overlay=$('.b434-overlay[data-overlay="form"]',root),slot=$('[data-form-slot]',root);if(!overlay||!slot)return;
 if(form.dataset.b434Moved!=='1'){const marker=document.createComment('CCF B4.3.4 movForm');form.parentNode.insertBefore(marker,form);slot.appendChild(form);form.dataset.b434Moved='1';moved.push({el:form,marker})}
 overlay.querySelector('[data-form-title]').textContent=title;overlay.classList.add('open');document.body.classList.add('b434-lock')
}
function quick(type){
 if(type==='debt'){navigate('deudas');return}
 if(type==='plan'){navigate('planificacion');return}
 openMoveForm(type==='income'?'Registrar ingreso':'Registrar gasto');
 const sel=by('movTipo');
 if(sel)sel.value=type==='income'?'ingreso':'gasto';
 const form=by('movForm');
 if(form)form.classList.add('b434-quick-form');
}

function syncConsolidatedReport(){
 if(!root)return;
 const host=$('[data-consolidated]',root),target=host?.querySelector('[data-b234-copy]'),source=by('b234-report');
 if(!host||!target||!source)return;
 const grid=source.querySelector('.b234-grid'),totals=source.querySelector('.b234-summary');
 const cards=[...source.querySelectorAll('.b234-card')];
 const finalCard=cards.find(x=>String(x.querySelector('h3')?.textContent||'').toLowerCase().includes('ingresos vs gastos del mes'));
 if(!grid||!totals||!finalCard)return;

 const fragment=document.createElement('div');
 const copy=el=>{
   const c=el.cloneNode(true);
   c.querySelectorAll('[id]').forEach(n=>n.removeAttribute('id'));
   c.querySelectorAll('[data-b234-observer]').forEach(n=>n.removeAttribute('data-b234-observer'));
   return c;
 };
 const finalCopy=copy(finalCard);
 finalCopy.classList.add('b434-final-info');
 fragment.append(copy(grid),copy(totals),finalCopy);
 target.replaceChildren(fragment);
}

function adaptMobileFlowCandles(){
 const host=by('chart-flow');if(!host)return false;
 /* B232.34 debe ser la única fuente del gráfico. Nunca reconstruir
    desde un SVG anterior/incompleto de #chart-flow. */
 const report=by('b234-report');
 const source=by('b234Chart')?.querySelector('svg');
 if(!report||!source)return false;
 const lines=[...source.querySelectorAll('line')].filter(l=>{
   const stroke=(l.getAttribute('stroke')||'').toLowerCase();
   return stroke==='#16a34a'||stroke==='#ef4444'||stroke==='rgb(22, 163, 74)'||stroke==='rgb(239, 68, 68)';
 });
 if(!lines.length)return false;
 const W=900,H=300,L=52,R=18,T=22,B=42,base=H-B,days=30,step=(W-L-R)/(days-1);
 const NS='http://www.w3.org/2000/svg';
 const svg=document.createElementNS(NS,'svg');
 svg.setAttribute('viewBox',`0 0 ${W} ${H}`);
 svg.setAttribute('width','100%');
 svg.setAttribute('height','100%');
 svg.setAttribute('role','img');
 svg.setAttribute('aria-label','Flujo mensual: velas verdes de ingresos y velas rojas de egresos');
 const grid=[...source.querySelectorAll('line')].filter(l=>{
   const stroke=(l.getAttribute('stroke')||'').toLowerCase();
   return stroke==='#e5e7eb';
 });
 grid.forEach(l=>svg.appendChild(l.cloneNode(true)));
 [...source.querySelectorAll('text')].forEach(t=>{
   const clone=t.cloneNode(true);
   const txt=String(t.textContent||'').trim();
   if(/^\d{2}$/.test(txt))return;
   svg.appendChild(clone);
 });
 const axis=document.createElementNS(NS,'g');
 axis.setAttribute('class','mobile-month-axis');
 for(let d=1;d<=days;d++){
   if(d===1||d%3===0||d===days){
     const x=L+(d-1)*step;
     const t=document.createElementNS(NS,'text');
     t.setAttribute('x',x);
     t.setAttribute('y',H-12);
     t.setAttribute('text-anchor',d===1?'start':d===days?'end':'middle');
     t.setAttribute('class','chart-axis');
     t.textContent=String(d).padStart(2,'0');
     axis.appendChild(t);
   }
 }
 svg.appendChild(axis);
 const candleData=[];
 lines.forEach(l=>{
   const stroke=(l.getAttribute('stroke')||'').toLowerCase();
   const green=stroke==='#16a34a'||stroke==='rgb(22, 163, 74)';
   const x=Number(l.getAttribute('x1'));
   const y=Number(l.getAttribute('y1'));
   if(!Number.isFinite(x)||!Number.isFinite(y))return;
   const baseX=x+(green?4:-4);
   const day=Math.round((baseX-L)/step)+1;
   if(day<1||day>days)return;
   const amountHeight=Math.max(2,base-y);
   candleData.push({day,green,y,height:amountHeight});
 });
 candleData.forEach(c=>{
   const x=L+(c.day-1)*step+(c.green?-5:5);
   const bodyH=Math.max(9,Math.min(18,c.height*0.12));
   const bodyY=Math.max(T,c.y);
   const wick=document.createElementNS(NS,'line');
   wick.setAttribute('x1',x);wick.setAttribute('x2',x);
   wick.setAttribute('y1',Math.max(T,bodyY-7));wick.setAttribute('y2',base);
   wick.setAttribute('class',c.green?'mobile-flow-income-wick':'mobile-flow-expense-wick');
   svg.appendChild(wick);
   const body=document.createElementNS(NS,'rect');
   body.setAttribute('x',x-5);body.setAttribute('y',bodyY);
   body.setAttribute('width','10');body.setAttribute('height',bodyH);
   body.setAttribute('rx','2');
   body.setAttribute('class',c.green?'mobile-flow-income':'mobile-flow-expense');
   svg.appendChild(body);
 });
 const title=document.createElementNS(NS,'text');
 title.setAttribute('x',L);title.setAttribute('y','17');
 title.setAttribute('class','chart-title');title.textContent='Ingresos vs egresos';
 svg.appendChild(title);
 host.replaceChildren(svg);
 return true;
}
function refreshNativeSummaryData(){
 if(!mobile()||typeof window.B23234Resumen?.refresh!=='function')return;
 try{window.B23234Resumen.refresh();}catch(e){console.warn('[CCF MOBILE] B232.34 refresh',e);}
}
function scheduleMobileFlowAdapt(){
 if(!mobile())return;
 [450,1000,1800,3000].forEach(ms=>setTimeout(()=>{
   refreshNativeSummaryData();
   adaptMobileFlowCandles();
 },ms));
}
function scheduleReportSync(){
 clearTimeout(reportTimer);let tries=0;
 const attempt=()=>{
   refreshNativeSummaryData();
   syncConsolidatedReport();
   adaptMobileFlowCandles();
   tries++;
   if(tries<20)reportTimer=setTimeout(attempt,300);
 };
 reportTimer=setTimeout(attempt,180);
}
function summary(){
 const c=$('[data-content]',root);c.innerHTML=`
 <section class="b434-period"><div><span>PERÍODO</span><strong class="b434-mirror" data-source="future-month-label">—</strong></div><button type="button" data-period>⌄</button></section>
 <section class="b434-kpis">
  <article class="b434-kpi blue"><span>Liquidez actual</span><strong class="b434-mirror" data-source="kpi-real-balance">—</strong></article>
  <article class="b434-kpi green"><span>Ingresos del mes</span><strong class="b434-mirror" data-source="month-income-total">—</strong></article>
  <article class="b434-kpi red"><span>Gastos del mes</span><strong class="b434-mirror" data-source="month-expense-total">—</strong></article>
  <article class="b434-kpi navy"><span>Saldo proyectado</span><strong class="b434-mirror" data-source="kpi-projected-balance">—</strong></article>
 </section>
 <section class="b434-card"><header><div><strong>Flujo del mes</strong><small>Ingresos · Gastos · Saldo</small></div><div class="b434-flow-legend"><span><i class="income"></i>Ingresos</span><span><i class="expense"></i>Egresos</span></div></header><div class="b434-real-chart" data-flow></div></section>
 <section class="b434-card b434-expense-summary" data-consolidated>
  <header><div><strong>Resumen de gastos</strong><small>Distribución por categoría y estado</small></div></header>
  <div class="b434-consolidated-body" data-b234-copy></div>
 </section>
 <div class="b434-section-title">Accesos rápidos</div>
 <section class="b434-quick"><button data-quick="expense">＋<small>Registrar gasto</small></button><button data-quick="income">＋<small>Registrar ingreso</small></button><button data-quick="debt">◉<small>Ver deudas</small></button><button data-quick="plan">◇<small>Planificar</small></button></section>
 <section class="b434-card"><header><strong>Estado financiero</strong><small class="b434-mirror" data-source="summary-status-text">—</small></header><div class="b434-grid2">
  <article><span>Ingresos asegurados</span><strong class="b434-mirror" data-source="kpi-assured">—</strong></article><article><span>Ingresos proyectados</span><strong class="b434-mirror" data-source="kpi-projected">—</strong></article>
  <article><span>Egresos comprometidos</span><strong class="b434-mirror" data-source="kpi-committed">—</strong></article><article><span>Brecha financiera</span><strong class="b434-mirror" data-source="kpi-gap">—</strong></article>
 </div></section>
 <section class="b434-card"><header><strong>Compromisos próximos</strong><small>Movimientos futuros</small></header><div class="b434-future">
  <article><header><b>Ingresos</b></header><div data-income-list></div></article><article><header><b>Egresos</b></header><div data-expense-list></div></article>
 </div></section>
 <section class="b434-card"><header><strong>Control diario</strong><small class="b434-mirror" data-source="margin-status">—</small></header><div class="b434-margin">
  <article><span>Margen máximo</span><strong class="b434-mirror" data-source="margin-maximum">—</strong></article><article><span>Gastado</span><strong class="b434-mirror" data-source="margin-spent">—</strong></article><article><span>Margen restante</span><strong class="b434-mirror" data-source="margin-remaining">—</strong></article>
 </div><div class="b434-progress"><i data-progress></i></div></section>
 <section class="b434-card"><header><strong>Proyección financiera</strong><small>90 días</small></header><div class="b434-real-table" data-projection></div></section>
 <section class="b434-decision"><article><span>PRÓXIMA NECESIDAD</span><div data-next></div></article><article><span>ACCIONES PRIORITARIAS</span><div data-priority></div></article></section>
 <section class="b434-card"><header><strong>Análisis ejecutivo</strong><small class="b434-mirror" data-source="executive-risk-summary">—</small></header><div class="b434-insights">
 ${[['Liquidez','exec-liquidity-reading'],['Obligaciones','exec-obligation-reading'],['Flujo próximo','exec-flow-reading'],['Generación requerida','exec-generation-reading']].map(x=>`<article><span>${x[0]}</span><strong class="b434-mirror" data-source="${x[1]}">—</strong></article>`).join('')}</div><div class="b434-charts" data-exec></div></section>`;
 const flow=by('chart-flow');if(flow){moveReal('chart-flow',$('[data-flow]',c));setTimeout(()=>window.dispatchEvent(new Event('resize')),180);setTimeout(()=>window.dispatchEvent(new Event('resize')),650);refreshNativeSummaryData();scheduleMobileFlowAdapt();}
 ['future-income-list','future-expense-list','projection-table','next-need','priority-actions'].forEach(id=>moveReal(id,$(`[data-${id==='projection-table'?'projection':id==='future-income-list'?'income-list':id==='future-expense-list'?'expense-list':id==='next-need'?'next':'priority'}]`,c)));
 const execHost=$('[data-exec]',c),ids=['chart-liquidity','chart-obligations','chart-candles','chart-risk','chart-gap','chart-debt-month','chart-debt-planning'];
 ids.forEach(id=>{const el=by(id);if(!el||!execHost)return;const card=document.createElement('article');card.className='b434-chart-card';card.innerHTML='<strong>'+esc(el.closest('.executive-chart')?.querySelector('h3')?.textContent||id)+'</strong>';execHost.appendChild(card);moveReal(id,card)});
 $$('[data-quick]',c).forEach(b=>b.onclick=()=>quick(b.dataset.quick));$('[data-period]',c).onclick=()=>notice('Selector de período');
 mirrorAll();scheduleReportSync();
}

function build(){
 if(built||!ready())return;built=true;root=document.createElement('div');root.id='ccf-mobile-b43';
 root.innerHTML=`<header class="b434-header"><button class="b434-logo" data-home>CCF</button><div><strong>Centro de Control Financiero</strong><small>Tu vida financiera en un solo lugar</small></div><button class="b434-bell">♧</button><button class="b434-avatar" data-profile>P</button></header><main data-content></main><section class="b434-module-host" data-module-host aria-live="polite"></section><nav class="b434-bottom">${PRIMARY.map(x=>`<button data-nav="${x[0]}"><span>${x[2]}</span><small>${x[1]}</small></button>`).join('')}<button data-more><span>☰</span><small>Más</small></button></nav>
 <div class="b434-overlay" data-overlay="more"><div class="b434-backdrop" data-close></div><section><header><strong>Todos los módulos</strong><button data-close>×</button></header><div class="b434-module-grid" data-more-grid></div></section></div>
 <div class="b434-overlay" data-overlay="profile"><div class="b434-backdrop" data-close></div><section><header><strong>Perfil</strong><button data-close>×</button></header><div class="b434-profile">Cuenta autenticada en Centro de Control Financiero.</div><button class="b434-danger" data-logout>Cerrar sesión</button></section></div>
 <div class="b434-overlay" data-overlay="form"><div class="b434-backdrop" data-close></div><section><header><strong data-form-title>Registrar movimiento</strong><button data-close>×</button></header><div data-form-slot></div></section></div>
 <div class="b434-overlay" data-overlay="notice"><div class="b434-backdrop" data-close></div><section class="b434-notice"><strong>Integración por etapas</strong><p>El módulo <b data-notice>—</b> conserva su implementación original y se habilita progresivamente.</p><button data-close>Continuar</button></section></div>`;
 app().prepend(root);
 $$('[data-nav]',root).forEach(b=>b.onclick=()=>navigate(b.dataset.nav));$('[data-more]',root).onclick=openMore;$('[data-profile]',root).onclick=openProfile;$('[data-home]',root).onclick=()=>navigate('dashboard');$$('[data-close]',root).forEach(b=>b.onclick=closeAll);$('[data-logout]',root).onclick=()=>by('logoutBtn')?.click();
 populateMore();nativeTab('dashboard');summary();refreshNativeSummaryData();scheduleMobileFlowAdapt();setActive('dashboard');
}
function observe(){
 observer?.disconnect();const ids=['future-month-label','month-income-total','month-expense-total','kpi-real-balance','kpi-assured','kpi-projected','kpi-committed','kpi-projected-balance','kpi-gap','margin-status','margin-maximum','margin-spent','margin-remaining','margin-percent','margin-projection','summary-status-text','executive-risk-summary','exec-liquidity-reading','exec-obligation-reading','exec-flow-reading','exec-generation-reading'];
 observer=new MutationObserver(()=>{mirrorAll();syncConsolidatedReport()});ids.map(by).filter(Boolean).forEach(n=>observer.observe(n,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['style','class']}));
}
function restore(){clearTimeout(reportTimer);observer?.disconnect();observer=null;calendarObserver?.disconnect();calendarObserver=null;calendarAdaptScheduled=false;closeAll();restoreActiveModule();restoreReal();root?.remove();root=null;built=false;document.body.classList.remove('b434-lock')}
function boot(){if(!mobile()){restore();return}if(!ready()){if(built)restore();return}if(!built){build();observe()}}
window.addEventListener('resize',()=>setTimeout(boot,100));window.addEventListener('orientationchange',()=>setTimeout(boot,150));
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
window.CCFMobileB43={version:'4.3.4-stage1-correction',refresh:()=>{mirrorAll();syncConsolidatedReport()},disable:restore};

/* ================================================================
   B4.3.10 — NUEVA VISTA CALENDARIO MÓVIL BOOTSTRAP
   ---------------------------------------------------------------
   Vista paralela al calendario B232.26.4:
   - No modifica el motor ni su DOM.
   - Lee los datos ya renderizados por el calendario existente.
   - Se muestra solo dentro de la shell móvil.
   - Usa Shadow DOM para aislar Bootstrap del resto de la aplicación.
   ================================================================ */
let ccfBsCalendarView=null;
let ccfBsCalendarObserver=null;
let ccfBsCalendarBound=null;
let ccfBsCalendarRenderTimer=null;

function ensureBootstrapCalendarView(){
  const section=by('calendario');
  if(!section||!root)return null;

  let host=section.querySelector('#ccf-bs-calendar-view');
  if(!host){
    host=document.createElement('div');
    host.id='ccf-bs-calendar-view';
    host.setAttribute('data-ccf-bs-calendar','1');
    const currentCard=section.querySelector('.b232261-card');
    if(currentCard) currentCard.parentNode.insertBefore(host,currentCard);
    else section.appendChild(host);
  }
  if(!host.shadowRoot){
    const shadow=host.attachShadow({mode:'open'});
    const link=document.createElement('link');
    link.rel='stylesheet';
    link.href='https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap-grid.min.css';
    const style=document.createElement('style');
    style.textContent=`
      :host{display:block;width:100%;max-width:100%;min-width:0;box-sizing:border-box}
      *{box-sizing:border-box}
      .calendar-shell{width:100%;max-width:370px;margin:0 auto;background:#fff;border:1px solid #e5e7eb;border-radius:14px;overflow:hidden}
      .calendar-header{padding:12px 10px 8px}
      .calendar-title{font-size:18px;font-weight:800;margin:0;color:#172033}
      .calendar-sub{font-size:10px;color:#64748b;margin-top:3px}
      .calendar-actions{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:5px;margin-top:9px}
      .calendar-actions button{border:0;border-radius:8px;min-height:34px;padding:5px 3px;font-size:10px;font-weight:800;background:#111827;color:#fff}
      .calendar-actions button.secondary{background:#e5e7eb;color:#172033}
      .calendar-kpis{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px;padding:0 10px 9px}
      .calendar-kpi{border:1px solid #e5e7eb;border-radius:10px;padding:8px;min-width:0}
      .calendar-kpi span{display:block;font-size:8px;color:#64748b}
      .calendar-kpi strong{display:block;font-size:13px;color:#172033;margin-top:3px;overflow-wrap:anywhere}
      .calendar-grid{width:100%;min-width:0;display:flex;flex-wrap:wrap}
      .calendar-grid>.col{flex:0 0 14.285714%;max-width:14.285714%;min-width:0;padding:0!important}
      .calendar-grid .col{min-width:0;padding:0!important}
      .weekday{height:30px;display:flex;align-items:center;justify-content:center;background:#111827;color:#fff;font-size:8px;font-weight:900;overflow:hidden}
      .day{width:100%;height:86px;border:0;border-right:1px solid #e5e7eb;border-bottom:1px solid #e5e7eb;background:#fff;text-align:left;padding:4px 3px;overflow:hidden;color:#334155}
      .day.out{background:#f8fafc;color:#94a3b8}
      .day.selected{outline:2px solid #111827;outline-offset:-2px}
      .day-number{display:flex;justify-content:space-between;align-items:center;font-size:10px;font-weight:800}
      .day-number small{font-size:6px}
      .event{display:block;margin-top:2px;padding:2px 2px;border-radius:3px;font-size:6px;line-height:1.05;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .in{background:#ecfdf5;color:#166534}.outflow{background:#fef2f2;color:#991b1b}
      .planin{background:#eff6ff;color:#1d4ed8}.planout{background:#fff7ed;color:#9a3412}
      .gen{background:#f5f3ff;color:#6d28b9}.debt{background:#eef2ff;color:#3730a3}
      .mini{display:block;font-size:6px;margin-top:2px;color:#64748b;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .positive{color:#166534!important}.negative{color:#991b1b!important}
      .calendar-detail{padding:9px;display:grid;grid-template-columns:1fr;gap:7px}
      .detail-box{border:1px solid #e5e7eb;border-radius:10px;padding:8px;font-size:9px}
      .detail-box h3{font-size:10px;margin:0 0 5px}
      .detail-content{line-height:1.35;overflow-wrap:anywhere}
      .empty{padding:12px;text-align:center;color:#64748b;font-size:9px}
      @media(max-width:370px){
        .calendar-shell{max-width:100%}
        .calendar-actions button{font-size:9px}
        .day{height:80px}
      }
    `;
    shadow.append(link,style);
  }
  ccfBsCalendarView=host.shadowRoot;
  return ccfBsCalendarView;
}

function bsText(el){return (el?.textContent||'').replace(/\s+/g,' ').trim()}

function renderBootstrapCalendarView(){
  const section=by('calendario');
  if(!section||!root)return false;
  const source=section.querySelector('.b232261-card');
  const shadow=ensureBootstrapCalendarView();
  if(!source||!shadow)return false;

  const grid=source.querySelector('.b232261-grid.b232261-week');
  if(!grid||grid.children.length<8)return false;

  const old=shadow.querySelector('.calendar-shell');
  if(old)old.remove();

  const shell=document.createElement('div');
  shell.className='calendar-shell';

  const head=document.createElement('div');
  head.className='calendar-header';
  const title=document.createElement('h2');
  title.className='calendar-title';
  title.textContent=bsText(source.querySelector('.b232261-head h2'))||'Calendario';
  const sub=document.createElement('div');
  sub.className='calendar-sub';
  sub.textContent=bsText(source.querySelector('.b232261-sub'))||'Vista mensual';
  head.append(title,sub);

  const actions=document.createElement('div');
  actions.className='calendar-actions';
  const sourceButtons=[...source.querySelectorAll('.b232261-actions button')];
  const labels=['‹','›','Hoy','↻'];
  sourceButtons.slice(0,4).forEach((src,i)=>{
    const b=document.createElement('button');
    b.type='button';
    b.className=i===2?'':'secondary';
    b.textContent=labels[i]||bsText(src);
    b.addEventListener('click',()=>{src.click();setTimeout(renderBootstrapCalendarView,80)});
    actions.appendChild(b);
  });
  head.appendChild(actions);
  shell.appendChild(head);

  const kpiWrap=document.createElement('div');
  kpiWrap.className='calendar-kpis';
  source.querySelectorAll('.b232261-kpi').forEach(k=>{
    const card=document.createElement('div'); card.className='calendar-kpi';
    const sp=document.createElement('span'); sp.textContent=bsText(k.querySelector('span'));
    const st=document.createElement('strong'); st.textContent=bsText(k.querySelector('strong'));
    card.append(sp,st); kpiWrap.appendChild(card);
  });
  shell.appendChild(kpiWrap);

  const cal=document.createElement('div');
  cal.className='row g-0 calendar-grid';
  [...grid.children].forEach((srcCell,index)=>{
    const col=document.createElement('div'); col.className='col';
    if(index<7){
      const h=document.createElement('div'); h.className='weekday'; h.textContent=bsText(srcCell);
      col.appendChild(h);
    }else{
      const srcDay=srcCell;
      const b=document.createElement('button'); b.type='button';
      b.className='day '+(srcDay.classList.contains('out')?'out ':'')+(srcDay.classList.contains('selected')?'selected':'');
      const top=srcDay.querySelector('.b232261-day-top');
      const dn=document.createElement('div'); dn.className='day-number';
      const strong=document.createElement('strong'); strong.textContent=bsText(top?.querySelector('strong'));
      const small=top?.querySelector('small'); if(small){const sm=document.createElement('small');sm.textContent=bsText(small);dn.append(sm)}
      dn.prepend(strong); b.appendChild(dn);
      srcDay.querySelectorAll('.b232261-event').forEach(ev=>{
        const e=document.createElement('span'); e.className='event ';
        const cl=ev.className;
        e.classList.add(cl.includes('real-in')?'in':cl.includes('real-out')?'outflow':cl.includes('plan-in')?'planin':cl.includes('plan-out')?'planout':cl.includes('gen')?'gen':cl.includes('debt')?'debt':'planout');
        e.textContent=bsText(ev); b.appendChild(e);
      });
      srcDay.querySelectorAll('.b232261-mini,.b232261-more').forEach(mi=>{
        const m=document.createElement('span');m.className='mini '+(mi.classList.contains('b232261-pos')?'positive':mi.classList.contains('b232261-neg')?'negative':'');m.textContent=bsText(mi);b.appendChild(m);
      });
      b.addEventListener('click',()=>{srcDay.click();setTimeout(renderBootstrapCalendarView,40)});
      col.appendChild(b);
    }
    cal.appendChild(col);
  });
  shell.appendChild(cal);

  const detail=document.createElement('div');
  detail.className='calendar-detail';
  const sourceDetail=source.querySelector('.b232261-detail');
  if(sourceDetail){
    [...sourceDetail.querySelectorAll('.b232261-box')].forEach(box=>{
      const d=document.createElement('div');d.className='detail-box';
      const h=box.querySelector('h3'); if(h){const hh=document.createElement('h3');hh.textContent=bsText(h);d.appendChild(hh)}
      const body=document.createElement('div');body.className='detail-content';body.textContent=bsText(box).replace(bsText(h),'').trim();d.appendChild(body);
      detail.appendChild(d);
    });
  }
  shell.appendChild(detail);
  shadow.appendChild(shell);

  /* La vista nueva queda ARRIBA del calendario original.
     El calendario original permanece visible para comparar ambas implementaciones. */
  const currentCard=section.querySelector('.b232261-card');
  const host=section.querySelector('#ccf-bs-calendar-view');
  if(currentCard && host && host.nextElementSibling!==currentCard){
    currentCard.parentNode.insertBefore(host,currentCard);
  }
  return true;
}

function hostStyleMobileCalendar(section){
  section.querySelectorAll('.b232261-card').forEach(card=>{
    if(card.id!=='ccf-bs-calendar-view')card.style.setProperty('display','none','important');
  });
}

function observeBootstrapCalendarView(){
  ccfBsCalendarObserver?.disconnect();
  const section=by('calendario');
  if(!section)return;
  ccfBsCalendarObserver=new MutationObserver(()=>{
    clearTimeout(ccfBsCalendarRenderTimer);
    ccfBsCalendarRenderTimer=setTimeout(()=>{
      if(root?.id==='ccf-mobile-b43'&&by('calendario'))renderBootstrapCalendarView();
    },40);
  });
  ccfBsCalendarObserver.observe(section,{childList:true,subtree:true});
  setTimeout(renderBootstrapCalendarView,120);
}

function activateBootstrapCalendarView(){
  const section=by('calendario');
  if(!section||!root||root.id!=='ccf-mobile-b43')return false;
  if(ccfBsCalendarBound!==section){
    ccfBsCalendarBound=section;
    observeBootstrapCalendarView();
  }
  const ok=renderBootstrapCalendarView();
  if(!ok){
    [120,300,600,1000,1600].forEach(ms=>setTimeout(()=>{
      if(by('calendario')&&root?.id==='ccf-mobile-b43')renderBootstrapCalendarView();
    },ms));
  }
  return ok;
}

})();
