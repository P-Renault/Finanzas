/* CCF MOBILE B4.3.4 — ETAPA 1 · CORRECCIÓN RESUMEN
   Solo presentación móvil. No crea Supabase ni modifica autenticación.
   No modifica index.html, app.js ni módulos financieros.
*/
(()=>{'use strict';
if(window.__CCF_MOBILE_B434__)return; window.__CCF_MOBILE_B434__=true;
const BP=720,$=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const app=()=>document.getElementById('app'), mobile=()=>matchMedia('(max-width:'+BP+'px)').matches;
let authObserver=null, authTimer=null;
const by=id=>document.getElementById(id), tab=id=>$('.tabs button[data-tab="'+CSS.escape(id)+'"]');
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const META={presupuesto:['Presupuesto','Plan, ejecución y proyección','◒'],planificacion:['Planificación','Escenario de 30 días','◈'],futuros:['Pagos futuros','Vencimientos y compromisos','◷'],calendario:['Calendario','Vista mensual','▦'],ahorro:['Ahorro','Aportes e historial','◎'],operaciones:['Operaciones','Liquidez y operaciones','⇄'],ingresos:['Motor Multifuente','Generación de ingresos','↗'],jornadas:['Control de Jornada','Resultado financiero','◷'],'ia-financiera':['IA Financiera','Análisis y recomendaciones','✦']};
const PRIMARY=[['dashboard','Resumen','⌂'],['movimientos','Movimientos','↕'],['deudas','Deudas','▣'],['cuentas','Cuentas','▤']];
let root=null,built=false,moved=[],observer=null,reportTimer=null;

function authGatePresent(){return !!by('ccf-auth-gate')}
function markAuthReady(){if(!mobile()||authGatePresent()||!app()||app().classList.contains('hidden'))return false;document.body.classList.add('ccf-b43-auth-ready');return true}
function authSync(){
 if(!mobile()){document.body.classList.remove('ccf-b43-auth-ready');return false}
 if(authGatePresent()||app()?.classList.contains('hidden')){document.body.classList.remove('ccf-b43-auth-ready');if(built)restore();return false}
 return markAuthReady();
}
function installAuthGuard(){
 authObserver?.disconnect();
 authObserver=new MutationObserver(()=>{authSync();boot()});
 authObserver.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class','style']});
 clearInterval(authTimer);
 authTimer=setInterval(()=>authSync(),250);
 authSync();
}
function ready(){return mobile()&&app()&&!app().classList.contains('hidden')&&!authGatePresent()&&document.body.classList.contains('ccf-b43-auth-ready')}
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
function navigate(id){closeAll();if(id==='dashboard'){nativeTab('dashboard');setActive('dashboard');return}if(nativeTab(id)){setActive(id);return}notice(META[id]?.[0]||id)}
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
 const host=by('chart-flow');if(!host||!mobile())return false;

 /*
  * B4.3 — FLUJO MENSUAL ESTÁTICO
  * Fuente única: SVG generado por B232.34.
  * No se inventan datos ni se reconstruye el motor financiero.
  *
  * Correcciones:
  * 1) no se bloquea después de un primer render incompleto;
  * 2) se detectan líneas verdes y rojas por estilo real/computado;
  * 3) la escala se obtiene del SVG fuente, no de coordenadas hard-codeadas;
  * 4) la magnitud se calcula con y1/y2 de cada línea;
  * 5) verde y rojo quedan lado a lado cuando corresponden al mismo día;
  * 6) el resultado final siempre cabe en el ancho móvil y no hace scroll.
  */

 const holders=[
   by('b234Chart'),
   document.querySelector('#b234-report .b234-chart-wrap'),
   document.querySelector('.b234-report .b234-chart-wrap')
 ].filter(Boolean);

 const norm=v=>String(v??'').toLowerCase().replace(/\s+/g,'');
 const colorOf=node=>{
   const vals=[
     node.getAttribute?.('stroke'),
     node.getAttribute?.('fill'),
     node.getAttribute?.('style'),
     node.style?.stroke,
     node.style?.fill
   ];
   try{
     const cs=getComputedStyle(node);
     vals.push(cs.stroke,cs.fill);
   }catch(_){}
   const raw=vals.map(norm).join('|');

   if(/#16a34a|#15803d|#22c55e|rgb\(22,163,74\)|rgb\(21,128,61\)|rgb\(34,197,94\)/.test(raw))
     return 'green';
   if(/#ef4444|#dc2626|#f43f5e|rgb\(239,68,68\)|rgb\(220,38,38\)|rgb\(244,63,94\)/.test(raw))
     return 'red';
   return null;
 };

 let source=null, colored=[];
 for(const holder of holders){
   const svg=holder.matches?.('svg')?holder:holder.querySelector?.('svg');
   if(!svg)continue;

   const found=[...svg.querySelectorAll('line')]
     .map(l=>({l,color:colorOf(l)}))
     .filter(x=>x.color);

   if(found.some(x=>x.color==='green') && found.some(x=>x.color==='red')){
     source=svg;
     colored=found;
     break;
   }
 }

 // Jamás mostrar una falsa versión "completa" si falta una serie.
 if(!source)return false;

 const NS='http://www.w3.org/2000/svg';
 const vb=(source.getAttribute('viewBox')||'0 0 900 300').trim().split(/\s+/).map(Number);
 const SW=Number.isFinite(vb[2])&&vb[2]>0?vb[2]:900;
 const SH=Number.isFinite(vb[3])&&vb[3]>0?vb[3]:300;

 const W=900,H=300,L=48,R=18,T=24,B=44,base=H-B;
 const days=Math.max(1,Number(window.CCFMobileB43?.flowDays)||30);

 /*
  * Extraemos la geometría real del SVG fuente.
  * xMin/xMax permiten funcionar aunque el motor cambie sus márgenes.
  * La magnitud se toma de la longitud de la línea, no de una coordenada
  * absoluta que podría cambiar con la escala.
  */
 const raw=[];
 colored.forEach(({l,color})=>{
   const x1=Number(l.getAttribute('x1'));
   const x2=Number(l.getAttribute('x2'));
   const y1=Number(l.getAttribute('y1'));
   const y2=Number(l.getAttribute('y2'));
   if([x1,x2,y1,y2].every(Number.isFinite)){
     raw.push({color,x1,x2,y1,y2,magnitude:Math.abs(y2-y1)});
   }
 });
 if(!raw.some(x=>x.color==='green')||!raw.some(x=>x.color==='red'))return false;

 const xMin=Math.min(...raw.map(x=>Math.min(x.x1,x.x2)));
 const xMax=Math.max(...raw.map(x=>Math.max(x.x1,x.x2)));
 const spanX=Math.max(1,xMax-xMin);

 /*
  * Agrupación cronológica.
  * Se calcula el día desde la posición relativa de la fuente.
  * Si varias líneas caen en el mismo día/color, se conserva la mayor.
  */
 const daily=new Map();
 raw.forEach(item=>{
   const x=(item.x1+item.x2)/2;
   let day=Math.round(((x-xMin)/spanX)*(days-1))+1;
   day=Math.max(1,Math.min(days,day));
   const key=`${day}-${item.color}`;
   const old=daily.get(key);
   if(!old||item.magnitude>old.magnitude)
     daily.set(key,{day,color:item.color,magnitude:item.magnitude});
 });

 const rows=[...daily.values()];
 if(!rows.some(x=>x.color==='green')||!rows.some(x=>x.color==='red'))return false;

 const maxMag=Math.max(1,...rows.map(x=>x.magnitude));

 const svg=document.createElementNS(NS,'svg');
 svg.setAttribute('viewBox',`0 0 ${W} ${H}`);
 svg.setAttribute('preserveAspectRatio','none');
 svg.setAttribute('role','img');
 svg.setAttribute('aria-label','Flujo mensual cronológico: verde ingresos y rojo egresos');

 // Escala visual estática.
 for(let i=0;i<=4;i++){
   const y=T+(base-T)*i/4;
   const line=document.createElementNS(NS,'line');
   line.setAttribute('x1',L);line.setAttribute('x2',W-R);
   line.setAttribute('y1',y);line.setAttribute('y2',y);
   line.setAttribute('stroke','#e5e7eb');
   line.setAttribute('stroke-width','1');
   svg.appendChild(line);
 }

 // Cronología mensual fija.
 const axis=document.createElementNS(NS,'g');
 [1,5,10,15,20,25,days]
   .filter((d,i,a)=>d>=1&&d<=days&&a.indexOf(d)===i)
   .forEach(d=>{
     const x=L+(d-1)*(W-L-R)/Math.max(1,days-1);
     const t=document.createElementNS(NS,'text');
     t.setAttribute('x',x);
     t.setAttribute('y',H-14);
     t.setAttribute('text-anchor',d===1?'start':d===days?'end':'middle');
     t.setAttribute('fill','#64748b');
     t.setAttribute('font-size','10');
     t.setAttribute('font-weight','600');
     t.textContent=String(d).padStart(2,'0');
     axis.appendChild(t);
   });
 svg.appendChild(axis);

 // Título.
 const title=document.createElementNS(NS,'text');
 title.setAttribute('x',L);
 title.setAttribute('y',17);
 title.setAttribute('fill','#334155');
 title.setAttribute('font-size','12');
 title.setAttribute('font-weight','700');
 title.textContent='Ingresos vs egresos';
 svg.appendChild(title);

 /*
  * Dos velas por fecha:
  * verde a la izquierda = ingreso
  * rojo a la derecha   = egreso
  *
  * La altura conserva la proporción relativa observada por el motor.
  */
 const step=(W-L-R)/Math.max(1,days-1);
 rows.sort((a,b)=>a.day-b.day||a.color.localeCompare(b.color)).forEach(item=>{
   const ratio=item.magnitude/maxMag;
   const bodyH=Math.max(9,ratio*(base-T-10));
   const bodyY=base-bodyH;
   const green=item.color==='green';
   const x=L+(item.day-1)*step+(green?-5.5:5.5);

   const wick=document.createElementNS(NS,'line');
   wick.setAttribute('x1',x);wick.setAttribute('x2',x);
   wick.setAttribute('y1',Math.max(T,bodyY-7));
   wick.setAttribute('y2',Math.min(base,bodyY+bodyH+7));
   wick.setAttribute('stroke',green?'#15803d':'#dc2626');
   wick.setAttribute('stroke-width','2.5');
   svg.appendChild(wick);

   const body=document.createElementNS(NS,'rect');
   body.setAttribute('x',x-4.5);
   body.setAttribute('y',bodyY);
   body.setAttribute('width','9');
   body.setAttribute('height',bodyH);
   body.setAttribute('rx','2');
   body.setAttribute('fill',green?'#16a34a':'#ef4444');
   body.setAttribute('stroke',green?'#15803d':'#dc2626');
   body.setAttribute('stroke-width','1.2');
   svg.appendChild(body);
 });

 host.replaceChildren(svg);
 host.dataset.b434Candles='4';
 host.dataset.b434SourceReady='both';
 return true;
}

function scheduleMobileFlowAdapt(){
 if(!mobile())return;
 [250,500,900,1500,2500,4000,6000,8000,10000].forEach(ms=>setTimeout(adaptMobileFlowCandles,ms));
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
 const c=$('[data-content]',root);c.innerHTML=`
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
 root.innerHTML=`<header class="b434-header"><button class="b434-logo" data-home>CCF</button><div><strong>Centro de Control Financiero</strong><small>Tu vida financiera en un solo lugar</small></div><button class="b434-bell">♧</button><button class="b434-avatar" data-profile>P</button></header><main data-content></main><nav class="b434-bottom">${PRIMARY.map(x=>`<button data-nav="${x[0]}"><span>${x[2]}</span><small>${x[1]}</small></button>`).join('')}<button data-more><span>☰</span><small>Más</small></button></nav>
 <div class="b434-overlay" data-overlay="more"><div class="b434-backdrop" data-close></div><section><header><strong>Todos los módulos</strong><button data-close>×</button></header><div class="b434-module-grid" data-more-grid></div></section></div>
 <div class="b434-overlay" data-overlay="profile"><div class="b434-backdrop" data-close></div><section><header><strong>Perfil</strong><button data-close>×</button></header><div class="b434-profile">Cuenta autenticada en Centro de Control Financiero.</div><button class="b434-danger" data-logout>Cerrar sesión</button></section></div>
 <div class="b434-overlay" data-overlay="form"><div class="b434-backdrop" data-close></div><section><header><strong data-form-title>Registrar movimiento</strong><button data-close>×</button></header><div data-form-slot></div></section></div>
 <div class="b434-overlay" data-overlay="notice"><div class="b434-backdrop" data-close></div><section class="b434-notice"><strong>Integración por etapas</strong><p>El módulo <b data-notice>—</b> conserva su implementación original y se habilita progresivamente.</p><button data-close>Continuar</button></section></div>`;
 app().prepend(root);
 $$('[data-nav]',root).forEach(b=>b.onclick=()=>navigate(b.dataset.nav));$('[data-more]',root).onclick=openMore;$('[data-profile]',root).onclick=openProfile;$('[data-home]',root).onclick=()=>navigate('dashboard');$$('[data-close]',root).forEach(b=>b.onclick=closeAll);$('[data-logout]',root).onclick=()=>by('logoutBtn')?.click();
 populateMore();summary();
}
function observe(){
 observer?.disconnect();const ids=['future-month-label','month-income-total','month-expense-total','kpi-real-balance','kpi-assured','kpi-projected','kpi-committed','kpi-projected-balance','kpi-gap','margin-status','margin-maximum','margin-spent','margin-remaining','margin-percent','margin-projection','summary-status-text','executive-risk-summary','exec-liquidity-reading','exec-obligation-reading','exec-flow-reading','exec-generation-reading'];
 observer=new MutationObserver(()=>{mirrorAll();syncConsolidatedReport()});ids.map(by).filter(Boolean).forEach(n=>observer.observe(n,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['style','class']}));
}
function restore(){clearTimeout(reportTimer);observer?.disconnect();observer=null;closeAll();restoreReal();root?.remove();root=null;built=false;document.body.classList.remove('b434-lock')}
function boot(){if(!mobile()){restore();return}if(!ready()){if(built)restore();return}if(!built){build();observe()}}
window.addEventListener('resize',()=>setTimeout(()=>{authSync();boot()},100));window.addEventListener('orientationchange',()=>setTimeout(()=>{authSync();boot()},150));
function start(){installAuthGuard();authSync();boot()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
window.CCFMobileB43={version:'4.3.4-stage1-auth-stable',refresh:()=>{authSync();mirrorAll();syncConsolidatedReport()},disable:restore};
})();