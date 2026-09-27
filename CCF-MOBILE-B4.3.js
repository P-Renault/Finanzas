/* CCF MOBILE B4.3.4 — ETAPA 2 · MOVIMIENTOS
   Solo presentación/interacción móvil. No crea Supabase ni modifica autenticación.
   No modifica index.html, app.js ni módulos financieros.
*/
(()=>{'use strict';
if(window.__CCF_MOBILE_B434__)return; window.__CCF_MOBILE_B434__=true;
const BP=720,$=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const app=()=>document.getElementById('app'), mobile=()=>matchMedia('(max-width:'+BP+'px)').matches;
const by=id=>document.getElementById(id), tab=id=>$('.tabs button[data-tab="'+CSS.escape(id)+'"]');
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const MODULES=[
 ['dashboard','Resumen','Estado financiero consolidado','⌂'],
 ['movimientos','Movimientos','Ingresos, gastos e historial','↕'],
 ['futuros','Pagos futuros','Vencimientos y compromisos','◷'],
 ['calendario','Calendario','Vista mensual','▦'],
 ['ahorro','Ahorro','Aportes e historial','◎'],
 ['deudas','Deudas','Gestión y seguimiento de deudas','▣'],
 ['cuentas','Cuentas','Cuentas y saldos','▤'],
 ['operaciones','Operaciones','Liquidez y operaciones','⇄'],
 ['planificacion','Planificación','Escenario de 30 días','◈'],
 ['presupuesto','Presupuesto','Plan, ejecución y proyección','◒'],
 ['ingresos','Ingresos','Generación de ingresos','↗'],
 ['jornadas','Control de Jornada','Resultado financiero','◷'],
 ['ia-financiera','IA Financiera','Análisis y recomendaciones','✦']
];
const META=Object.fromEntries(MODULES.map(([id,title,subtitle,icon])=>[id,[title,subtitle,icon]]));
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
 const go=()=>{
   if(nativeTab(id)){setActive(id);return true}
   return false;
 };
 if(go())return;
 // Los módulos originales pueden incorporarse después de la carga inicial.
 // Esperar su registro en .tabs mantiene un único punto de navegación.
 let tries=0;
 const retry=()=>{
   if(go())return;
   if(++tries<8){setTimeout(retry,125);return}
   notice(META[id]?.[0]||id);
 };
 retry();
}
function openMore(){populateMore();$('.b434-overlay[data-overlay="more"]',root)?.classList.add('open');document.body.classList.add('b434-lock')}
function openProfile(){$('.b434-overlay[data-overlay="profile"]',root)?.classList.add('open');document.body.classList.add('b434-lock')}

function populateMore(){
 const g=$('[data-more-grid]',root);if(!g)return;g.innerHTML='';
 const primaryIds=new Set(PRIMARY.map(x=>x[0]));
 MODULES.filter(([id])=>!primaryIds.has(id)).forEach(([id,title,subtitle,icon])=>{
   const b=document.createElement('button');
   b.type='button';
   b.className='b434-module';
   b.dataset.moduleId=id;
   b.setAttribute('aria-label',title+' — '+subtitle);
   b.innerHTML='<b aria-hidden="true">'+esc(icon)+'</b><span><strong>'+esc(title)+'</strong><small>'+esc(subtitle)+'</small></span>';
   b.onclick=()=>navigate(id);
   g.appendChild(b);
 });
}

function prepareMobileMoveForm(form){
 if(!form||form.dataset.b434MobileForm==='1')return;
 form.dataset.b434MobileForm='1';
 form.classList.add('b434-mobile-form');
 const labels=[...form.querySelectorAll('label')];
 labels.forEach(label=>{
   label.classList.add('b434-form-field');
   const control=label.querySelector('input,select,textarea');
   if(control)control.dataset.mobileField='1';
   if(control?.id==='movTipo'){
     label.classList.add('b434-form-type-field');
     const select=control;
     select.classList.add('b434-native-type');
     const chooser=document.createElement('div');
     chooser.className='b434-type-chooser';
     [['ingreso','Ingreso','＋'],['gasto','Gasto','−']].forEach(([value,text,icon])=>{
       const b=document.createElement('button');
       b.type='button';b.className='b434-type-choice';b.dataset.value=value;
       b.innerHTML='<span>'+icon+'</span><strong>'+text+'</strong>';
       b.onclick=()=>{
         select.value=value;
         select.dispatchEvent(new Event('change',{bubbles:true}));
         chooser.querySelectorAll('button').forEach(x=>x.classList.toggle('active',x.dataset.value===value));
       };
       chooser.appendChild(b);
     });
     label.appendChild(chooser);
     const sync=()=>chooser.querySelectorAll('button').forEach(x=>x.classList.toggle('active',x.dataset.value===select.value));
     select.addEventListener('change',sync);
     sync();
   }
 });
 const amount=by('movMonto');
 if(amount)amount.classList.add('b434-amount-input');
 const intro=document.createElement('div');
 intro.className='b434-form-intro';
 intro.innerHTML='<span>REGISTRO RÁPIDO</span><strong>Ingresa los datos del movimiento</strong><small>Los datos se guardan mediante el mismo formulario y lógica financiera existente.</small>';
 form.prepend(intro);
 const actions=form.querySelector('.form-actions');
 if(actions)actions.classList.add('b434-form-actions');
}
function openMoveForm(title){
 const form=by('movForm');if(!form){notice('Registro de movimientos');return}
 const overlay=$('.b434-overlay[data-overlay="form"]',root),slot=$('[data-form-slot]',root);if(!overlay||!slot)return;
 if(form.dataset.b434Moved!=='1'){const marker=document.createComment('CCF B4.3.4 movForm');form.parentNode.insertBefore(marker,form);slot.appendChild(form);form.dataset.b434Moved='1';moved.push({el:form,marker})}
 prepareMobileMoveForm(form);
 overlay.classList.add('b434-form-sheet');
 overlay.querySelector('[data-form-title]').textContent=title;
 overlay.classList.add('open');document.body.classList.add('b434-lock');
 setTimeout(()=>{const first=form.querySelector('#movMonto,#movFecha,#movCategoria');first?.focus()},180);
}
function quick(type){
 if(type==='debt'){if(!nativeTab('deudas'))notice('Deudas');else setActive('deudas');return}
 if(type==='plan'){if(!nativeTab('planificacion'))notice('Planificación');return}
 openMoveForm(type==='income'?'Registrar ingreso':'Registrar gasto');
 const sel=by('movTipo');if(sel){sel.value=type==='income'?'ingreso':'gasto';sel.dispatchEvent(new Event('change',{bubbles:true}));}
}

function syncConsolidatedReport(){
 if(!root)return false;
 const host=$('[data-consolidated]',root),target=host?.querySelector('[data-b234-copy]');
 const source=document.querySelector('.b234-report');
 if(!host||!target||!source)return false;
 const copy=el=>{const c=el.cloneNode(true);c.querySelectorAll('[id]').forEach(n=>n.removeAttribute('id'));c.querySelectorAll('[data-b234-observer]').forEach(n=>n.removeAttribute('data-b234-observer'));return c};
 const grid=source.querySelector('.b234-grid'),totals=source.querySelector('.b234-summary'),final=source.querySelector('.b234-final');
 if(!grid&&!totals&&!final)return false;
 const fragment=document.createElement('div');
 if(grid){const title=document.createElement('div');title.className='b434-report-subtitle';title.innerHTML='<strong>Distribución por categoría</strong><small>Generado · Pendiente · Por realizar</small>';fragment.appendChild(title);fragment.appendChild(copy(grid));}
 if(totals){const title=document.createElement('div');title.className='b434-report-subtitle b434-status-title';title.innerHTML='<strong>Estado de gastos</strong><small>Consolidado del período</small>';fragment.appendChild(title);fragment.appendChild(copy(totals));}
 if(final){const title=document.createElement('div');title.className='b434-report-subtitle b434-final-title';title.innerHTML='<strong>Ingresos vs Gastos del mes</strong><small>Comparación consolidada</small>';fragment.appendChild(title);const finalCopy=copy(final);finalCopy.classList.add('b434-final-info');fragment.appendChild(finalCopy);}
 target.replaceChildren(fragment); return true;
}
function adaptMobileFlowCandles(){
 const host=$('[data-flow]',root);if(!host)return false;
 const source=document.querySelector('.b234-report #b234Chart svg');if(!source)return false;
 const norm=v=>String(v||'').toLowerCase().replace(/\s+/g,'');
 const token=(el)=>[el.getAttribute('stroke'),el.getAttribute('style'),el.getAttribute('class'),getComputedStyle(el).stroke].filter(Boolean).join(' ');
 const isGreen=s=>/16a34a|15803d|rgb\(22,163,74\)|rgb\(21,128,61\)/i.test(s);
 const isRed=s=>/ef4444|dc2626|rgb\(239,68,68\)|rgb\(220,38,38\)/i.test(s);
 const lines=[...source.querySelectorAll('line')].map(el=>({el,style:token(el)})).filter(x=>isGreen(x.style)||isRed(x.style));
 if(!lines.length)return false;
 const W=900,H=300,L=52,R=18,T=26,B=44,base=H-B,days=30,step=(W-L-R)/(days-1),NS='http://www.w3.org/2000/svg';
 const svg=document.createElementNS(NS,'svg');svg.setAttribute('viewBox',`0 0 ${W} ${H}`);svg.setAttribute('width','100%');svg.setAttribute('height','100%');svg.setAttribute('role','img');svg.setAttribute('aria-label','Flujo del mes con velas de ingresos y egresos');
 [...source.querySelectorAll('line')].filter(l=>{const s=norm(l.getAttribute('stroke'));return s==='#e5e7eb'||s==='#e6ebf0'}).forEach(l=>{const g=l.cloneNode(true);g.setAttribute('stroke','#e6ebf0');g.setAttribute('stroke-width','1');svg.appendChild(g)});
 [...source.querySelectorAll('text')].filter(t=>/^\$/.test(String(t.textContent||'').trim())).forEach(t=>{const g=t.cloneNode(true);g.setAttribute('fill','#64748b');g.setAttribute('font-size','11');svg.appendChild(g)});
 const title=document.createElementNS(NS,'text');title.setAttribute('x',L);title.setAttribute('y','17');title.setAttribute('fill','#334155');title.setAttribute('font-size','11');title.setAttribute('font-weight','800');title.textContent='Ingresos vs egresos';svg.appendChild(title);
 const axis=document.createElementNS(NS,'g');
 [1,5,10,15,20,25,30].forEach(d=>{const x=L+(d-1)*step,t=document.createElementNS(NS,'text');t.setAttribute('x',x);t.setAttribute('y',H-15);t.setAttribute('text-anchor',d===1?'start':d===30?'end':'middle');t.setAttribute('fill','#64748b');t.setAttribute('font-size','10');t.textContent=String(d).padStart(2,'0');axis.appendChild(t)});svg.appendChild(axis);
 lines.forEach(({el,style})=>{
   const green=isGreen(style),x=Number(el.getAttribute('x1')),y1=Number(el.getAttribute('y1')),y2=Number(el.getAttribute('y2'));
   if(!Number.isFinite(x)||!Number.isFinite(y1)||!Number.isFinite(y2))return;
   const day=Math.max(1,Math.min(days,Math.round((x-L)/step)+1)),top=Math.min(y1,y2),height=Math.max(8,Math.abs(y2-y1));
   const cx=L+(day-1)*step+(green?-5:5),bodyH=Math.max(10,Math.min(22,height*.12)),bodyY=Math.max(T,top);
   const wick=document.createElementNS(NS,'line');wick.setAttribute('x1',cx);wick.setAttribute('x2',cx);wick.setAttribute('y1',Math.max(T,bodyY-7));wick.setAttribute('y2',Math.min(base,bodyY+height));wick.setAttribute('stroke',green?'#15803d':'#dc2626');wick.setAttribute('stroke-width','2.5');svg.appendChild(wick);
   const body=document.createElementNS(NS,'rect');body.setAttribute('x',cx-5);body.setAttribute('y',bodyY);body.setAttribute('width','10');body.setAttribute('height',bodyH);body.setAttribute('rx','2');body.setAttribute('fill',green?'#16a34a':'#ef4444');body.setAttribute('stroke',green?'#15803d':'#dc2626');body.setAttribute('stroke-width','1.5');svg.appendChild(body);
 });
 host.replaceChildren(svg);return true;
}
function scheduleMobileFlowAdapt(){if(!mobile())return;[350,900,1800,3000].forEach(ms=>setTimeout(adaptMobileFlowCandles,ms))}
function scheduleReportSync(){clearTimeout(reportTimer);let tries=0;const attempt=()=>{syncConsolidatedReport();adaptMobileFlowCandles();tries++;if(tries<20)reportTimer=setTimeout(attempt,300)};reportTimer=setTimeout(attempt,120)}

function summary(){
 const c=$('[data-content]',root);c.innerHTML=`<section class="b434-period"><div><span>PERÍODO</span><strong class="b434-mirror" data-source="future-month-label">—</strong></div><button type="button" data-period>⌄</button></section>
 <section class="b434-kpis"><article class="b434-kpi blue"><span>Liquidez actual</span><strong class="b434-mirror" data-source="kpi-real-balance">—</strong></article><article class="b434-kpi green"><span>Ingresos del mes</span><strong class="b434-mirror" data-source="month-income-total">—</strong></article><article class="b434-kpi red"><span>Gastos del mes</span><strong class="b434-mirror" data-source="month-expense-total">—</strong></article><article class="b434-kpi navy"><span>Saldo proyectado</span><strong class="b434-mirror" data-source="kpi-projected-balance">—</strong></article></section>
 <section class="b434-card"><header><div><strong>Flujo del mes</strong><small>Ingresos · Gastos · Saldo</small></div><div class="b434-flow-legend"><span><i class="income"></i>Ingresos</span><span><i class="expense"></i>Egresos</span></div></header><div class="b434-real-chart" data-flow></div></section>
 <section class="b434-card b434-summary-report" data-consolidated><header><div><strong>Resumen de gastos</strong><small>Distribución por categoría y estado</small></div></header><div class="b434-consolidated-body" data-b234-copy></div></section>
 <div class="b434-section-title">Accesos rápidos</div><section class="b434-quick"><button data-quick="expense">＋<small>Registrar gasto</small></button><button data-quick="income">＋<small>Registrar ingreso</small></button><button data-quick="debt">◉<small>Ver deudas</small></button><button data-quick="plan">◇<small>Planificar</small></button></section>
 <section class="b434-card"><header><strong>Estado financiero</strong><small class="b434-mirror" data-source="summary-status-text">—</small></header><div class="b434-grid2"><article><span>Ingresos asegurados</span><strong class="b434-mirror" data-source="kpi-assured">—</strong></article><article><span>Ingresos proyectados</span><strong class="b434-mirror" data-source="kpi-projected">—</strong></article><article><span>Egresos comprometidos</span><strong class="b434-mirror" data-source="kpi-committed">—</strong></article><article><span>Brecha financiera</span><strong class="b434-mirror" data-source="kpi-gap">—</strong></article></div></section>
 <section class="b434-card"><header><strong>Compromisos próximos</strong><small>Movimientos futuros</small></header><div class="b434-future"><article><header><b>Ingresos</b></header><div data-income-list></div></article><article><header><b>Egresos</b></header><div data-expense-list></div></article></div></section>
 <section class="b434-card"><header><strong>Control diario</strong><small class="b434-mirror" data-source="margin-status">—</small></header><div class="b434-margin"><article><span>Margen máximo</span><strong class="b434-mirror" data-source="margin-maximum">—</strong></article><article><span>Gastado</span><strong class="b434-mirror" data-source="margin-spent">—</strong></article><article><span>Margen restante</span><strong class="b434-mirror" data-source="margin-remaining">—</strong></article></div><div class="b434-progress"><i data-progress></i></div></section>
 <section class="b434-card"><header><strong>Proyección financiera</strong><small>90 días</small></header><div class="b434-real-table" data-projection></div></section>
 <section class="b434-decision"><article><span>PRÓXIMA NECESIDAD</span><div data-next></div></article><article><span>ACCIONES PRIORITARIAS</span><div data-priority></div></article></section>
 <section class="b434-card"><header><strong>Análisis ejecutivo</strong><small class="b434-mirror" data-source="executive-risk-summary">—</small></header><div class="b434-insights">${[['Liquidez','exec-liquidity-reading'],['Obligaciones','exec-obligation-reading'],['Flujo próximo','exec-flow-reading'],['Generación requerida','exec-generation-reading']].map(x=>`<article><span>${x[0]}</span><strong class="b434-mirror" data-source="${x[1]}">—</strong></article>`).join('')}</div><div class="b434-charts" data-exec></div></section>`;
 scheduleMobileFlowAdapt();scheduleReportSync();setTimeout(()=>window.dispatchEvent(new Event('resize')),180);setTimeout(()=>window.dispatchEvent(new Event('resize')),650);
 ['future-income-list','future-expense-list','projection-table','next-need','priority-actions'].forEach(id=>moveReal(id,$(`[data-${id==='projection-table'?'projection':id==='future-income-list'?'income-list':id==='future-expense-list'?'expense-list':id==='next-need'?'next':'priority'}]`,c)));
 const execHost=$('[data-exec]',c),ids=['chart-liquidity','chart-obligations','chart-candles','chart-risk','chart-gap','chart-debt-month','chart-debt-planning'];ids.forEach(id=>{const el=by(id);if(!el||!execHost)return;const card=document.createElement('article');card.className='b434-chart-card';card.innerHTML='<strong>'+esc(el.closest('.executive-chart')?.querySelector('h3')?.textContent||id)+'</strong>';execHost.appendChild(card);moveReal(id,card)});
 $$('[data-quick]',c).forEach(b=>b.onclick=()=>quick(b.dataset.quick));$('[data-period]',c).onclick=()=>notice('Selector de período');mirrorAll();scheduleReportSync();
}

function build(){
 if(built||!ready())return;built=true;root=document.createElement('div');root.id='ccf-mobile-b43';
 root.innerHTML=`<header class="b434-header"><button class="b434-logo" data-home>CCF</button><div><strong>Centro de Control Financiero</strong><small>Tu vida financiera en un solo lugar</small></div><button class="b434-bell">♧</button><button class="b434-avatar" data-profile>P</button></header><main data-content></main><nav class="b434-bottom">${PRIMARY.map(x=>`<button data-nav="${x[0]}"><span>${x[2]}</span><small>${x[1]}</small></button>`).join('')}<button data-more><span>☰</span><small>Más</small></button></nav>
 <div class="b434-overlay" data-overlay="more"><div class="b434-backdrop" data-close></div><section><header><strong>Todos los módulos</strong><button data-close>×</button></header><div class="b434-module-grid" data-more-grid></div></section></div>
 <div class="b434-overlay" data-overlay="profile"><div class="b434-backdrop" data-close></div><section><header><strong>Perfil</strong><button data-close>×</button></header><div class="b434-profile">Cuenta autenticada en Centro de Control Financiero.</div><button class="b434-danger" data-logout>Cerrar sesión</button></section></div>
 <div class="b434-overlay" data-overlay="form"><div class="b434-backdrop" data-close></div><section><header><strong data-form-title>Registrar movimiento</strong><button data-close>×</button></header><div data-form-slot></div></section></div>
 <div class="b434-overlay" data-overlay="notice"><div class="b434-backdrop" data-close></div><section class="b434-notice"><strong>Integración por etapas</strong><p>El módulo <b data-notice>—</b> conserva su implementación original y se habilita progresivamente.</p><button data-close>Continuar</button></section></div>`;
 app().prepend(root);$$('[data-nav]',root).forEach(b=>b.onclick=()=>navigate(b.dataset.nav));$('[data-more]',root).onclick=openMore;$('[data-profile]',root).onclick=openProfile;$('[data-home]',root).onclick=()=>navigate('dashboard');$$('[data-close]',root).forEach(b=>b.onclick=closeAll);$('[data-logout]',root).onclick=()=>by('logoutBtn')?.click();populateMore();summary();
}
function observe(){
 observer?.disconnect();const ids=['future-month-label','month-income-total','month-expense-total','kpi-real-balance','kpi-assured','kpi-projected','kpi-committed','kpi-projected-balance','kpi-gap','margin-status','margin-maximum','margin-spent','margin-remaining','margin-percent','margin-projection','summary-status-text','executive-risk-summary','exec-liquidity-reading','exec-obligation-reading','exec-flow-reading','exec-generation-reading'];
 observer=new MutationObserver(()=>{mirrorAll();syncConsolidatedReport()});ids.map(by).filter(Boolean).forEach(n=>observer.observe(n,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['style','class']}));
}
function restore(){clearTimeout(reportTimer);observer?.disconnect();observer=null;closeAll();restoreReal();root?.remove();root=null;built=false;document.body.classList.remove('b434-lock')}
function boot(){if(!mobile()){restore();return}if(!ready()){if(built)restore();return}if(!built){build();observe()}}
window.addEventListener('resize',()=>setTimeout(boot,100));window.addEventListener('orientationchange',()=>setTimeout(boot,150));
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
window.CCFMobileB43={version:'4.3.4-stage1-summary-flow-fixed',refresh:()=>{mirrorAll();syncConsolidatedReport()},disable:restore};
})();