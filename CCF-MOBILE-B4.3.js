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
let root=null,built=false,moved=[],observer=null,reportTimer=null;

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
function navigate(id){
 closeAll();
 if(id==='dashboard'){showMobileView('summary');nativeTab('dashboard');setActive('dashboard');return}
 if(id==='movimientos'){showMobileView('movimientos');nativeTab('movimientos');renderMobileMovimientos();setActive('movimientos');return}
 if(nativeTab(id)){setActive(id);return}
 notice(META[id]?.[0]||id)
}
function openMore(){populateMore();$('.b434-overlay[data-overlay="more"]',root)?.classList.add('open');document.body.classList.add('b434-lock')}
function openProfile(){$('.b434-overlay[data-overlay="profile"]',root)?.classList.add('open');document.body.classList.add('b434-lock')}

function populateMore(){
 const g=$('[data-more-grid]',root);if(!g)return;g.innerHTML='';
 const ids=[...new Set([...$$('.tabs button[data-tab]').map(b=>b.dataset.tab),...Object.keys(META)])].filter(id=>id&&id!=='dashboard'&&!PRIMARY.some(x=>x[0]===id));
 ids.forEach(id=>{const m=META[id]||[id,'Módulo financiero','◉'];const b=document.createElement('button');b.className='b434-module';b.innerHTML='<b>'+esc(m[2])+'</b><span><strong>'+esc(m[0])+'</strong><small>'+esc(m[1])+'</small></span>';b.onclick=()=>navigate(id);g.appendChild(b)})
}
function openMoveForm(title){
 const form=by('movForm');if(!form){notice('Registro de movimientos');return}
 const overlay=$('.b434-overlay[data-overlay="form"]',root),slot=$('[data-form-slot]',root);if(!overlay||!slot)return;
 if(form.dataset.b434Moved!=='1'){const marker=document.createComment('CCF B4.3.4 movForm');form.parentNode.insertBefore(marker,form);slot.appendChild(form);form.dataset.b434Moved='1';moved.push({el:form,marker})}
 overlay.querySelector('[data-form-title]').textContent=title;overlay.classList.add('open');document.body.classList.add('b434-lock')
}
function quick(type){
 if(type==='debt'){if(!nativeTab('deudas'))notice('Deudas');else setActive('deudas');return}
 if(type==='plan'){if(!nativeTab('planificacion'))notice('Planificación');return}
 openMoveForm(type==='income'?'Registrar ingreso':'Registrar gasto');
 const sel=by('movTipo');if(sel)sel.value=type==='income'?'ingreso':'gasto';
}

function showMobileView(view){
 const summaryView=$('[data-mobile-view="summary"]',root);
 const movView=$('[data-mobile-view="movimientos"]',root);
 if(summaryView)summaryView.classList.toggle('active',view==='summary');
 if(movView)movView.classList.toggle('active',view==='movimientos');
 if(view==='movimientos')window.scrollTo({top:0,behavior:'instant'});
 else window.scrollTo({top:0,behavior:'instant'});
}

function movementRows(){
 const cache=window.__CCF_CACHE__||{mov:[]};
 return Array.isArray(cache.mov)?cache.mov:[];
}

function formatCLP(v){
 const n=Number(v)||0;
 return '$'+Math.abs(n).toLocaleString('es-CL');
}

function renderMobileMovimientos(){
 const view=$('[data-mobile-view="movimientos"]',root);
 if(!view)return;
 const rows=movementRows().slice().sort((a,b)=>String(b.fecha||'').localeCompare(String(a.fecha||'')));
 const query=String($('[data-mov-search]',view)?.value||'').trim().toLowerCase();
 const filter=$('[data-mov-filter]',view)?.value||'todos';

 const filtered=rows.filter(r=>{
   const type=String(r.tipo||'').toLowerCase();
   const hay=[r.fecha,r.categoria,r.descripcion,type,r.monto].map(x=>String(x??'').toLowerCase()).join(' ');
   return (!query||hay.includes(query))&&(filter==='todos'||type===filter);
 });

 const list=$('[data-mov-list]',view);
 const count=$('[data-mov-count]',view);
 if(count)count.textContent=`${filtered.length} ${filtered.length===1?'movimiento':'movimientos'}`;

 if(!list)return;
 if(!filtered.length){
   list.innerHTML='<div class="b434-mov-empty"><span>↕</span><strong>No hay movimientos</strong><small>Prueba otro filtro o registra un nuevo movimiento.</small></div>';
   return;
 }

 list.innerHTML=filtered.map(r=>{
   const ingreso=String(r.tipo||'').toLowerCase()==='ingreso';
   const amount=Number(r.monto)||0;
   const enc=typeof encodeObj==='function'?encodeObj(r):btoa(unescape(encodeURIComponent(JSON.stringify(r))));
   return `<article class="b434-mov-item ${ingreso?'income':'expense'}">
      <div class="b434-mov-icon">${ingreso?'↗':'↘'}</div>
      <div class="b434-mov-main">
        <strong>${esc(r.categoria||'Sin categoría')}</strong>
        <span>${esc(r.descripcion||'Sin descripción')}</span>
        <small>${esc(r.fecha||'')}</small>
      </div>
      <div class="b434-mov-right">
        <strong>${ingreso?'+':'−'}${formatCLP(amount)}</strong>
        <div>
          <button type="button" data-mov-edit="${esc(enc)}">Editar</button>
          <button type="button" class="danger" data-mov-delete="${Number(r.id)||0}">Borrar</button>
        </div>
      </div>
   </article>`;
 }).join('');

 $$('[data-mov-edit]',view).forEach(b=>b.onclick=()=>{
   if(window.editMovEncoded)window.editMovEncoded(b.dataset.movEdit);
   else openMoveForm('Editar movimiento');
 });
 $$('[data-mov-delete]',view).forEach(b=>b.onclick=async()=>{
   const id=Number(b.dataset.movDelete);
   if(!id||!window.deleteMov)return;
   await window.deleteMov(id);
   renderMobileMovimientos();
 });
}

function openMobileMovementForm(type){
 openMoveForm(type==='ingreso'?'Registrar ingreso':'Registrar gasto');
 const sel=by('movTipo');if(sel)sel.value=type;
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
 if(host.dataset.b434Candles==='1')return true;

 // Siempre tomar como fuente prioritaria el SVG ejecutivo original.
 // Nunca usar el SVG ya transformado como nueva fuente de datos.
 const source=by('b234Chart')?.querySelector('svg');
 if(!source)return false;

 const colorOf=l=>{
   const raw=(l.getAttribute('stroke')||l.style?.stroke||'').toLowerCase().replace(/\s+/g,'');
   if(raw==='#16a34a'||raw==='rgb(22,163,74)')return 'green';
   if(raw==='#ef4444'||raw==='rgb(239,68,68)')return 'red';
   return null;
 };
 const sourceLines=[...source.querySelectorAll('line')];
 const colored=sourceLines.map(l=>({l,color:colorOf(l)})).filter(x=>x.color);
 if(!colored.length)return false;

 const W=900,H=300,L=52,R=18,T=22,B=42,base=H-B,days=30;
 const step=(W-L-R)/(days-1), NS='http://www.w3.org/2000/svg';
 const svg=document.createElementNS(NS,'svg');
 svg.setAttribute('viewBox',`0 0 ${W} ${H}`);
 svg.setAttribute('preserveAspectRatio','none');
 svg.setAttribute('role','img');
 svg.setAttribute('aria-label','Flujo mensual: verde ingresos y rojo egresos');

 // Rejilla original del ejecutivo.
 sourceLines.filter(l=>(l.getAttribute('stroke')||'').toLowerCase()==='#e5e7eb')
   .forEach(l=>svg.appendChild(l.cloneNode(true)));

 // Escala monetaria original.
 [...source.querySelectorAll('text')].forEach(t=>{
   const txt=String(t.textContent||'').trim();
   if(/^\d{2}$/.test(txt)||/^\d{2}-\d{2}$/.test(txt))return;
   svg.appendChild(t.cloneNode(true));
 });

 // Cronología fija: 01, 05, 10, 15, 20, 25, 30.
 const axis=document.createElementNS(NS,'g');
 [1,5,10,15,20,25,30].forEach(d=>{
   const x=L+(d-1)*step;
   const t=document.createElementNS(NS,'text');
   t.setAttribute('x',x);t.setAttribute('y',H-14);
   t.setAttribute('text-anchor',d===1?'start':d===30?'end':'middle');
   t.setAttribute('fill','#64748b');t.setAttribute('font-size','10');
   t.textContent=String(d).padStart(2,'0');
   axis.appendChild(t);
 });
 svg.appendChild(axis);

 // Se conserva la magnitud original de cada línea y se convierten
 // en velas compactas. Si coinciden ingresos y egresos en un día,
 // quedan lado a lado para permitir el contraste.
 const seen=new Set();
 colored.forEach(({l,color})=>{
   const x0=Number(l.getAttribute('x1'));
   const y0=Number(l.getAttribute('y1'));
   const x1=Number(l.getAttribute('x2'));
   if(!Number.isFinite(x0)||!Number.isFinite(y0)||!Number.isFinite(x1))return;
   const day=Math.round((x0-L)/step)+1;
   if(day<1||day>days)return;

   const key=`${day}-${color}`;
   if(seen.has(key))return;
   seen.add(key);

   const amountHeight=Math.max(2,base-y0);
   const x=L+(day-1)*step+(color==='green'?-5:5);
   const bodyH=Math.max(8,Math.min(92,amountHeight));
   const bodyY=Math.max(T,base-bodyH);

   const wick=document.createElementNS(NS,'line');
   wick.setAttribute('x1',x);wick.setAttribute('x2',x);
   wick.setAttribute('y1',Math.max(T,bodyY-6));wick.setAttribute('y2',Math.min(base,bodyY+bodyH+6));
   wick.setAttribute('class',color==='green'?'mobile-flow-income-wick':'mobile-flow-expense-wick');
   svg.appendChild(wick);

   const body=document.createElementNS(NS,'rect');
   body.setAttribute('x',x-4);body.setAttribute('y',bodyY);
   body.setAttribute('width','8');body.setAttribute('height',bodyH);
   body.setAttribute('rx','2');
   body.setAttribute('class',color==='green'?'mobile-flow-income':'mobile-flow-expense');
   svg.appendChild(body);
 });

 const title=document.createElementNS(NS,'text');
 title.setAttribute('x',L);title.setAttribute('y','17');
 title.setAttribute('fill','#334155');title.setAttribute('font-size','12');
 title.setAttribute('font-weight','700');title.textContent='Ingresos vs egresos';
 svg.appendChild(title);

 host.replaceChildren(svg);
 host.dataset.b434Candles='1';
 return true;
}

function scheduleMobileFlowAdapt(){
 if(!mobile())return;
 [350,900,1800,3000].forEach(ms=>setTimeout(adaptMobileFlowCandles,ms));
}
function scheduleReportSync(){
 clearTimeout(reportTimer);let tries=0;
 const attempt=()=>{
   syncConsolidatedReport();
   adaptMobileFlowCandles();
   tries++;
   if(tries<20)reportTimer=setTimeout(attempt,300);
 };
 reportTimer=setTimeout(attempt,120);
}
function summary(){
 const c=$('[data-mobile-view="summary"]',root);c.innerHTML=`
 <section class="b434-period"><div><span>PERÍODO</span><strong class="b434-mirror" data-source="future-month-label">—</strong></div><button type="button" data-period>⌄</button></section>
 <section class="b434-kpis">
  <article class="b434-kpi blue"><span>Liquidez actual</span><strong class="b434-mirror" data-source="kpi-real-balance">—</strong></article>
  <article class="b434-kpi green"><span>Ingresos del mes</span><strong class="b434-mirror" data-source="month-income-total">—</strong></article>
  <article class="b434-kpi red"><span>Gastos del mes</span><strong class="b434-mirror" data-source="month-expense-total">—</strong></article>
  <article class="b434-kpi navy"><span>Saldo proyectado</span><strong class="b434-mirror" data-source="kpi-projected-balance">—</strong></article>
 </section>
 <section class="b434-card"><header><div><strong>Flujo del mes</strong><small>Ingresos · Gastos · Saldo</small></div><div class="b434-flow-legend"><span><i class="income"></i>Ingresos</span><span><i class="expense"></i>Egresos</span></div></header><div class="b434-real-chart" data-flow></div></section>
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
 ${[['Liquidez','exec-liquidity-reading'],['Obligaciones','exec-obligation-reading'],['Flujo próximo','exec-flow-reading'],['Generación requerida','exec-generation-reading']].map(x=>`<article><span>${x[0]}</span><strong class="b434-mirror" data-source="${x[1]}">—</strong></article>`).join('')}</div><div class="b434-charts" data-exec></div></section>
 <section class="b434-consolidated" data-consolidated>
  <header><div><strong>Ingresos vs Gastos del mes</strong><small>Comparación consolidada: reales + futuros + obligaciones + planificación.</small></div></header>
  <div class="b434-consolidated-body" data-b234-copy></div>
</section>`;
 const flow=by('chart-flow');if(flow){moveReal('chart-flow',$('[data-flow]',c));setTimeout(()=>window.dispatchEvent(new Event('resize')),180);setTimeout(()=>window.dispatchEvent(new Event('resize')),650);scheduleMobileFlowAdapt();}
 ['future-income-list','future-expense-list','projection-table','next-need','priority-actions'].forEach(id=>moveReal(id,$(`[data-${id==='projection-table'?'projection':id==='future-income-list'?'income-list':id==='future-expense-list'?'expense-list':id==='next-need'?'next':'priority'}]`,c)));
 const execHost=$('[data-exec]',c),ids=['chart-liquidity','chart-obligations','chart-candles','chart-risk','chart-gap','chart-debt-month','chart-debt-planning'];
 ids.forEach(id=>{const el=by(id);if(!el||!execHost)return;const card=document.createElement('article');card.className='b434-chart-card';card.innerHTML='<strong>'+esc(el.closest('.executive-chart')?.querySelector('h3')?.textContent||id)+'</strong>';execHost.appendChild(card);moveReal(id,card)});
 $$('[data-quick]',c).forEach(b=>b.onclick=()=>quick(b.dataset.quick));$('[data-period]',c).onclick=()=>notice('Selector de período');
 mirrorAll();scheduleReportSync();
}

function build(){
 if(built||!ready())return;built=true;root=document.createElement('div');root.id='ccf-mobile-b43';
 root.innerHTML=`<header class="b434-header"><button class="b434-logo" data-home>CCF</button><div><strong>Centro de Control Financiero</strong><small>Tu vida financiera en un solo lugar</small></div><button class="b434-bell">♧</button><button class="b434-avatar" data-profile>P</button></header><main data-content>
  <section class="b434-mobile-view active" data-mobile-view="summary"></section>
  <section class="b434-mobile-view" data-mobile-view="movimientos">
    <div class="b434-mov-head">
      <div><span>MOVIMIENTOS</span><strong>Historial financiero</strong><small>Consulta, filtra y administra tus ingresos y egresos.</small></div>
      <button type="button" data-mov-add>＋</button>
    </div>
    <div class="b434-mov-tools">
      <label class="b434-search"><span>⌕</span><input type="search" data-mov-search placeholder="Buscar movimiento"></label>
      <select data-mov-filter aria-label="Filtrar movimientos">
        <option value="todos">Todos</option>
        <option value="ingreso">Ingresos</option>
        <option value="gasto">Egresos</option>
      </select>
    </div>
    <div class="b434-mov-meta"><strong data-mov-count>0 movimientos</strong><button type="button" data-mov-refresh>Actualizar</button></div>
    <div class="b434-mov-list" data-mov-list></div>
    <button type="button" class="b434-mov-fab" data-mov-add>＋ Registrar movimiento</button>
  </section>
</main><nav class="b434-bottom">${PRIMARY.map(x=>`<button data-nav="${x[0]}"><span>${x[2]}</span><small>${x[1]}</small></button>`).join('')}<button data-more><span>☰</span><small>Más</small></button></nav>
 <div class="b434-overlay" data-overlay="more"><div class="b434-backdrop" data-close></div><section><header><strong>Todos los módulos</strong><button data-close>×</button></header><div class="b434-module-grid" data-more-grid></div></section></div>
 <div class="b434-overlay" data-overlay="profile"><div class="b434-backdrop" data-close></div><section><header><strong>Perfil</strong><button data-close>×</button></header><div class="b434-profile">Cuenta autenticada en Centro de Control Financiero.</div><button class="b434-danger" data-logout>Cerrar sesión</button></section></div>
 <div class="b434-overlay" data-overlay="form"><div class="b434-backdrop" data-close></div><section><header><strong data-form-title>Registrar movimiento</strong><button data-close>×</button></header><div data-form-slot></div></section></div>
 <div class="b434-overlay" data-overlay="notice"><div class="b434-backdrop" data-close></div><section class="b434-notice"><strong>Integración por etapas</strong><p>El módulo <b data-notice>—</b> conserva su implementación original y se habilita progresivamente.</p><button data-close>Continuar</button></section></div>`;
 app().prepend(root);
 $$('[data-nav]',root).forEach(b=>b.onclick=()=>navigate(b.dataset.nav));setActive('dashboard');$('[data-more]',root).onclick=openMore;$('[data-profile]',root).onclick=openProfile;$('[data-home]',root).onclick=()=>navigate('dashboard');$$('[data-close]',root).forEach(b=>b.onclick=closeAll);$('[data-logout]',root).onclick=()=>by('logoutBtn')?.click();
 populateMore();summary();
 const movView=$('[data-mobile-view="movimientos"]',root);
 if(movView){
   $('[data-mov-search]',movView)?.addEventListener('input',renderMobileMovimientos);
   $('[data-mov-filter]',movView)?.addEventListener('change',renderMobileMovimientos);
   $('[data-mov-refresh]',movView)?.addEventListener('click',async()=>{
     if(typeof window.refresh==='function')await window.refresh();
     renderMobileMovimientos();
   });
   $$('[data-mov-add]',movView).forEach(b=>b.onclick=()=>openMobileMovementForm('ingreso'));
 }
 renderMobileMovimientos();
}
function observe(){
 observer?.disconnect();const ids=['future-month-label','month-income-total','month-expense-total','kpi-real-balance','kpi-assured','kpi-projected','kpi-committed','kpi-projected-balance','kpi-gap','margin-status','margin-maximum','margin-spent','margin-remaining','margin-percent','margin-projection','summary-status-text','executive-risk-summary','exec-liquidity-reading','exec-obligation-reading','exec-flow-reading','exec-generation-reading'];
 observer=new MutationObserver(()=>{mirrorAll();syncConsolidatedReport()});ids.map(by).filter(Boolean).forEach(n=>observer.observe(n,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['style','class']}));
}
function restore(){clearTimeout(reportTimer);observer?.disconnect();observer=null;closeAll();restoreReal();root?.remove();root=null;built=false;document.body.classList.remove('b434-lock')}
function boot(){if(!mobile()){restore();return}if(!ready()){if(built)restore();return}if(!built){build();observe()}}
window.addEventListener('resize',()=>setTimeout(boot,100));window.addEventListener('orientationchange',()=>setTimeout(boot,150));
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
window.CCFMobileB43={version:'4.3.4-stage1-correction',refresh:()=>{mirrorAll();syncConsolidatedReport()},disable:restore};
})();