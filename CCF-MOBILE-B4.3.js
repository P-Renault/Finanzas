/* CCF MOBILE B4.3.4 — ETAPA 1 · CORRECCIÓN RESUMEN
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
let root=null,built=false,moved=[],observer=null,calendarObserver=null,reportTimer=null,activeModule=null,moduleMarker=null;

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
 if(activeModule?.id==='calendario')restoreCalendarMobile();
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
 if(id==='calendario')section.classList.add('b434-calendar-mobile');
 host.replaceChildren(section);
 activeModule=section;
 host.classList.add('open');
 return true;
}

function restoreCalendarMobile(){
 if(calendarObserver){
   calendarObserver.disconnect();
   calendarObserver=null;
 }
 const section=by('calendario');
 const host=moduleHost();
 const card=section?.querySelector('.b232261-card');
 if(!section||!host||!card)return;
 const period=host.querySelector('[data-b434-calendar-period]');
 const summary=host.querySelector('[data-b434-calendar-summary]');
 if(period){
   [...period.children].forEach(n=>card.insertBefore(n,card.firstChild));
   period.remove();
 }
 if(summary){
   [...summary.children].forEach(n=>card.insertBefore(n,card.firstChild));
   summary.remove();
 }
 section.classList.remove('b434-calendar-mobile');
}

function applyCalendarMobileLayout(){
 const section=by('calendario');
 const host=moduleHost();
 if(!section||!host)return false;

 const card=section.querySelector('.b232261-card');
 if(!card)return false;

 section.classList.add('b434-calendar-mobile');

 let period=host.querySelector('[data-b434-calendar-period]');
 if(!period){
   period=document.createElement('section');
   period.className='b434-calendar-period-card';
   period.dataset.b434CalendarPeriod='1';
   host.insertBefore(period,section);
 }
 let summary=host.querySelector('[data-b434-calendar-summary]');
 if(!summary){
   summary=document.createElement('section');
   summary.className='b434-calendar-summary-card';
   summary.dataset.b434CalendarSummary='1';
   host.insertBefore(summary,section);
 }

 const head=card.querySelector('.b232261-head');
 const actions=card.querySelector('.b232261-actions');
 const kpis=card.querySelector('.b232261-kpis');

 if(head && head.parentElement!==period)period.appendChild(head);
 if(actions && actions.parentElement!==period)period.appendChild(actions);
 if(kpis && kpis.parentElement!==summary)summary.appendChild(kpis);

 const scroll=card.querySelector('.b232261-scroll');
 const grid=card.querySelector('.b232261-grid');

 if(scroll){
   scroll.style.width='100%';
   scroll.style.maxWidth='100%';
   scroll.style.minWidth='0';
   scroll.style.overflow='hidden';
   scroll.style.boxSizing='border-box';
 }
 if(grid){
   grid.style.display='grid';
   grid.style.gridTemplateColumns='repeat(7,minmax(0,1fr))';
   grid.style.width='100%';
   grid.style.maxWidth='100%';
   grid.style.minWidth='0';
   grid.style.minWidth='0';
   grid.style.boxSizing='border-box';
 }
 card.querySelectorAll('.b232261-week').forEach(week=>{
   week.style.width='100%';
   week.style.minWidth='0';
   week.style.boxSizing='border-box';
 });
 card.querySelectorAll('.b232261-week>div').forEach(el=>{
   el.style.minWidth='0';
   el.style.width='auto';
   el.style.boxSizing='border-box';
 });
 card.querySelectorAll('.b232261-day').forEach(day=>{
   day.style.minWidth='0';
   day.style.width='auto';
   day.style.minHeight='62px';
   day.style.height='62px';
   day.style.padding='4px 2px';
   day.style.overflow='hidden';
   day.style.boxSizing='border-box';
 });
 card.querySelectorAll('.b232261-event,.b232261-mini').forEach(el=>{
   el.style.display='block';
   el.style.width='6px';
   el.style.height='6px';
   el.style.minHeight='6px';
   el.style.padding='0';
   el.style.margin='3px auto 0';
   el.style.borderRadius='50%';
   el.style.fontSize='0';
   el.style.lineHeight='0';
   el.style.overflow='hidden';
 });
 card.querySelectorAll('.b232261-more').forEach(el=>el.style.display='none');

 return true;
}

function adaptCalendarMobile(){
 const section=by('calendario');
 const host=moduleHost();
 if(!section||!host)return false;

 const ok=applyCalendarMobileLayout();
 if(!ok)return false;

 if(calendarObserver)calendarObserver.disconnect();

 calendarObserver=new MutationObserver(()=>{
   if(activeModule!==section)return;
   applyCalendarMobileLayout();
 });
 calendarObserver.observe(section,{childList:true,subtree:true});

 return true;
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
   if(id==='calendario')adaptCalendarMobile();
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
function restore(){clearTimeout(reportTimer);observer?.disconnect();observer=null;closeAll();restoreActiveModule();restoreReal();root?.remove();root=null;built=false;document.body.classList.remove('b434-lock')}
function boot(){if(!mobile()){restore();return}if(!ready()){if(built)restore();return}if(!built){build();observe()}}
window.addEventListener('resize',()=>setTimeout(boot,100));window.addEventListener('orientationchange',()=>setTimeout(boot,150));
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
window.CCFMobileB43={version:'4.3.4-stage1-correction',refresh:()=>{mirrorAll();syncConsolidatedReport()},disable:restore};
})();
