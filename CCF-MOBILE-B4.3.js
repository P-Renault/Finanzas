/* CCF MOBILE B4.3 — ETAPA 1 · MENÚ + RESUMEN
   Basado en B4.3. Integra solamente la navegación móvil y el módulo Resumen.
   No crea Supabase clients. No modifica auth, SQL, RLS ni cálculos financieros.
   Desktop (>720px) permanece en su interfaz actual.
*/
(()=>{'use strict';
if(window.__CCF_MOBILE_B43_STAGE1__)return;window.__CCF_MOBILE_B43_STAGE1__=true;
const BP=720;
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const app=()=>$('#app'), mobile=()=>matchMedia('(max-width:'+BP+'px)').matches;
const native=id=>document.getElementById(id);
const tab=id=>$('.tabs button[data-tab="'+CSS.escape(id)+'"]');
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const text=id=>native(id)?.textContent?.trim()||'—';
const META={
 dashboard:['Resumen','Vista general e indicadores clave','⌂'],
 movimientos:['Movimientos','Registro de ingresos y gastos','↕'],
 deudas:['Deudas','Saldos, cuotas, abonos y pagos','▣'],
 cuentas:['Cuentas','Gestión de cuentas y saldos','▤'],
 presupuesto:['Presupuesto','Plan, ejecución, comprometido y proyección','◒'],
 planificacion:['Planificación','Escenario de 30 días','◈'],
 futuros:['Pagos futuros','Compromisos y vencimientos','◷'],
 calendario:['Calendario','Vista mensual e integración','▦'],
 ahorro:['Ahorro','Aportes e historial','◎'],
 operaciones:['Operaciones','Liquidez y operaciones financieras','⇄'],
 ingresos:['Motor Multifuente','Generación y control de ingresos','↗'],
 jornadas:['Control de Jornada','Resultado financiero integrado','◷'],
 'ia-financiera':['IA Financiera','Análisis y recomendaciones','✦']
};
const PRIMARY=[['dashboard','Resumen','⌂'],['movimientos','Movimientos','↕'],['deudas','Deudas','▣'],['cuentas','Cuentas','▤']];
let root=null,built=false,current='dashboard',moved=[],observer=null,rendering=false;
function ready(){return mobile()&&app()&&!app().classList.contains('hidden')}
function hideLegacy(){['.topbar','.tabs','.ccf-manual-access','#ccf-product-footer'].forEach(s=>$(s)?.classList.add('b43-stage1-hidden'));$$('.tab').forEach(x=>x.classList.add('b43-stage1-native-hidden'))}
function showLegacy(){restoreMoved();$$('.b43-stage1-hidden').forEach(x=>x.classList.remove('b43-stage1-hidden'));$$('.b43-stage1-native-hidden').forEach(x=>x.classList.remove('b43-stage1-native-hidden'))}
function moveNode(id,host){const el=native(id);if(!el||!host||moved.some(x=>x.el===el))return el||null;const marker=document.createComment('B4.3 Stage1 '+id);el.parentNode?.insertBefore(marker,el);el.classList.remove('hidden','b43-stage1-native-hidden');host.appendChild(el);moved.push({el,marker});return el}
function restoreMoved(){for(const x of moved.slice().reverse()){if(x.marker.parentNode)x.marker.parentNode.insertBefore(x.el,x.marker.nextSibling);x.marker.remove()}moved=[]}
function fireTab(id){const b=tab(id);if(b){try{b.click();}catch(e){}return true}return false}
function openNativeForm(id,title){const src=native(id);if(!src)return false;const form=src.closest('form')||src;const layer=$('.b43-stage1-form',root),slot=$('.b43-stage1-form-slot',root);if(!layer||!slot)return false;
 const marker=document.createComment('B4.3 Stage1 form '+id);form.parentNode.insertBefore(marker,form);form.classList.remove('hidden');slot.appendChild(form);form.dataset.stage1Moved='1';
 const titleEl=$('[data-stage1-form-title]',root);if(titleEl)titleEl.textContent=title||'Registrar';layer.classList.add('open');document.body.classList.add('b43-stage1-lock');return true}
function closeForm(){const layer=$('.b43-stage1-form',root);if(!layer)return;layer.classList.remove('open');document.body.classList.remove('b43-stage1-lock');const form=layer.querySelector('form[data-stage1-moved="1"]');if(form){delete form.dataset.stage1Moved;const marker=[...document.createTreeWalker(document.body,NodeFilter.SHOW_COMMENT)].find(n=>n.nodeValue==='B4.3 Stage1 form '+(form.id||''));if(marker?.parentNode)marker.parentNode.insertBefore(form,marker.nextSibling);marker?.remove()}}
function navigate(id){if(id==='dashboard'){current='dashboard';localStorage.setItem('cf_active_tab_v2','dashboard');fireTab('dashboard');renderSummary();closeSheets();return}
 // Etapa 1: el menú queda construido, pero la integración funcional de módulos secundarios se hará secuencialmente.
 closeSheets();showIntegrationNotice(META[id]?.[0]||id);}
function showIntegrationNotice(name){const layer=$('.b43-stage1-notice',root);if(!layer)return;layer.querySelector('[data-notice-name]').textContent=name;layer.classList.add('open');document.body.classList.add('b43-stage1-lock')}
function closeNotice(){const x=$('.b43-stage1-notice',root);x?.classList.remove('open');if(!$('.b43-stage1-form.open')&&!$('.b43-stage1-sheet.open'))document.body.classList.remove('b43-stage1-lock')}
function closeSheets(){closeNotice();$$('.b43-stage1-sheet.open',root).forEach(x=>x.classList.remove('open'));if(!$('.b43-stage1-form.open'))document.body.classList.remove('b43-stage1-lock')}
function openMore(){closeForm();closeNotice();populateMore();$('.b43-stage1-sheet[data-sheet="more"]',root)?.classList.add('open');document.body.classList.add('b43-stage1-lock')}
function openProfile(){closeForm();closeNotice();$('.b43-stage1-sheet[data-sheet="profile"]',root)?.classList.add('open');document.body.classList.add('b43-stage1-lock')}
function populateMore(){const g=$('.b43-stage1-grid',root);if(!g)return;g.innerHTML='';const ids=[...new Set([...$$('.tabs button[data-tab]').map(b=>b.dataset.tab),'presupuesto','planificacion','futuros','calendario','ahorro','operaciones','ingresos','jornadas','ia-financiera'])];ids.filter(id=>id&&id!=='dashboard'&&id!=='movimientos'&&id!=='deudas'&&id!=='cuentas').forEach(id=>{const m=META[id]||[id,'Módulo financiero','◉'];const b=document.createElement('button');b.className='b43-stage1-module';b.innerHTML='<b>'+esc(m[2])+'</b><span><strong>'+esc(m[0])+'</strong><small>'+esc(m[1])+'</small></span>';b.onclick=()=>navigate(id);g.appendChild(b)})}
function card(label,id,cls=''){return '<article class="b43-stage1-kpi '+cls+'"><span>'+esc(label)+'</span><strong data-mirror="'+id+'">'+esc(text(id))+'</strong></article>'}
function mirror(id){const src=native(id);if(!src)return;$$('[data-mirror="'+id+'"]',root).forEach(x=>{x.textContent=src.textContent?.trim()||'—'})}
function mirrorAll(){['month-income-total','month-expense-total','future-income-total','future-expense-total','kpi-real-balance','kpi-assured','kpi-projected','kpi-committed','kpi-projected-balance','kpi-gap','margin-maximum','margin-spent','margin-remaining','margin-percent','margin-projection','margin-status','summary-status-text','executive-risk-summary','exec-liquidity-reading','exec-obligation-reading','exec-flow-reading','exec-generation-reading'].forEach(mirror)}
function summaryShell(){const h=$('.b43-stage1-content',root);h.innerHTML=`
 <section class="b43-stage1-month"><div><span>PERÍODO</span><strong data-mirror="future-month-label">${esc(text('future-month-label'))}</strong></div><button data-period>⌄</button></section>
 <section class="b43-stage1-kpis">${card('Liquidez actual','kpi-real-balance','blue')}${card('Ingresos del mes','month-income-total','green')}${card('Gastos del mes','month-expense-total','red')}${card('Saldo proyectado','kpi-projected-balance','navy')}</section>
 <section class="b43-stage1-card"><div class="b43-stage1-head"><strong>Flujo del mes</strong><span>Ingresos · Gastos · Saldo</span></div><div class="b43-stage1-chart" data-flow-host></div></section>
 <div class="b43-stage1-section-title">Accesos rápidos</div><section class="b43-stage1-quick"><button data-quick="expense"><b>＋</b><small>Registrar gasto</small></button><button data-quick="income"><b>＋</b><small>Registrar ingreso</small></button><button data-quick="debt"><b>◉</b><small>Ver deudas</small></button><button data-quick="plan"><b>◈</b><small>Planificar</small></button></section>
 <section class="b43-stage1-card"><div class="b43-stage1-head"><strong>Estado financiero</strong><span data-mirror="summary-status-text">${esc(text('summary-status-text'))}</span></div><div class="b43-stage1-grid2">${card('Ingresos asegurados','kpi-assured')}${card('Ingresos proyectados','kpi-projected')}${card('Egresos comprometidos','kpi-committed')}${card('Brecha financiera','kpi-gap')}</div></section>
 <section class="b43-stage1-card"><div class="b43-stage1-head"><strong>Compromisos próximos</strong><span>Ingresos y egresos futuros</span></div><div class="b43-stage1-future"><div><header><b>Ingresos</b><span data-mirror="future-income-count">0</span></header><div data-future-income></div></div><div><header><b>Egresos</b><span data-mirror="future-expense-count">0</span></header><div data-future-expense></div></div></div></section>
 <section class="b43-stage1-card"><div class="b43-stage1-head"><strong>Control diario</strong><span data-mirror="margin-status">${esc(text('margin-status'))}</span></div><div class="b43-stage1-margin"><div><span>Margen máximo</span><b data-mirror="margin-maximum">${esc(text('margin-maximum'))}</b></div><div><span>Gastado</span><b data-mirror="margin-spent">${esc(text('margin-spent'))}</b></div><div><span>Margen restante</span><b data-mirror="margin-remaining">${esc(text('margin-remaining'))}</b></div></div><div class="b43-stage1-progress"><i data-progress></i></div><div class="b43-stage1-meta"><span data-mirror="margin-percent">${esc(text('margin-percent'))}</span><span data-mirror="margin-projection">${esc(text('margin-projection'))}</span></div></section>
 <section class="b43-stage1-card"><div class="b43-stage1-head"><strong>Proyección financiera</strong><span>90 días</span></div><div class="b43-stage1-table" data-projection></div></section>
 <section class="b43-stage1-decision"><article><span>PRÓXIMA NECESIDAD</span><div data-next-need></div></article><article><span>ACCIONES PRIORITARIAS</span><div data-priority></div></article></section>
 <section class="b43-stage1-card"><div class="b43-stage1-head"><div><strong>Análisis ejecutivo</strong><small>Liquidez, presión financiera y brecha</small></div><span data-mirror="executive-risk-summary">${esc(text('executive-risk-summary'))}</span></div><div class="b43-stage1-insights">${['exec-liquidity-reading','exec-obligation-reading','exec-flow-reading','exec-generation-reading'].map((id,i)=>`<div><span>${['Liquidez','Obligaciones','Flujo próximo','Generación requerida'][i]}</span><b data-mirror="${id}">${esc(text(id))}</b></div>`).join('')}</div><div class="b43-stage1-charts" data-exec-charts></div></section>`;
 const flow=native('chart-flow');if(flow)moveNode('chart-flow',$('[data-flow-host]',h));
 const fi=native('future-income-list');if(fi)moveNode('future-income-list',$('[data-future-income]',h));
 const fe=native('future-expense-list');if(fe)moveNode('future-expense-list',$('[data-future-expense]',h));
 const pt=native('projection-table');if(pt)moveNode('projection-table',$('[data-projection]',h));
 const nn=native('next-need');if(nn)moveNode('next-need',$('[data-next-need]',h));
 const pa=native('priority-actions');if(pa)moveNode('priority-actions',$('[data-priority]',h));
 const charts=$('#executive-charts');const host=$('[data-exec-charts]',h);if(charts&&host){for(const article of [...charts.children]){const chart=article.querySelector('[id^="chart-"]');if(!chart)continue;const box=document.createElement('article');box.className='b43-stage1-exec-chart';const title=article.querySelector('h3')?.textContent||'Análisis';const desc=article.querySelector('p')?.textContent||'';box.innerHTML='<strong>'+esc(title)+'</strong><small>'+esc(desc)+'</small>';host.appendChild(box);moveNode(chart,box)}}
 const prog=native('margin-progress');if(prog){const update=()=>{const w=prog.style.width||'0%';$('[data-progress]',h).style.width=w};update();}
 $$('[data-quick]',h).forEach(b=>b.onclick=()=>{if(b.dataset.quick==='debt'){navigate('deudas');return}if(b.dataset.quick==='plan'){navigate('planificacion');return}openNativeForm('movForm',b.dataset.quick==='income'?'Registrar ingreso':'Registrar gasto')});
 $('[data-period]',h).onclick=()=>{const sel=[...$$('select')].find(x=>[...x.options].some(o=>/20\d\d/.test(o.textContent)));if(sel){sel.focus();sel.click()}else{showIntegrationNotice('Selector de período')}};
 mirrorAll();
}
function renderSummary(){if(!built||rendering||!ready())return;rendering=true;restoreMoved();summaryShell();const ht=$('[data-stage1-header-title]',root);if(ht)ht.textContent='Resumen';hideLegacy();rendering=false}
function build(){if(built||!ready())return;built=true;root=document.createElement('div');root.id='ccf-mobile-b43';root.innerHTML=`<header class="b43-stage1-header"><button class="b43-stage1-logo" data-home>CCF</button><div><strong data-stage1-header-title>Resumen</strong><small>Centro de Control Financiero</small></div><button class="b43-stage1-bell" aria-label="Notificaciones">♧</button><button class="b43-stage1-avatar" data-profile>P</button></header><main class="b43-stage1-content"></main><nav class="b43-stage1-bottom">${PRIMARY.map(x=>`<button data-nav="${x[0]}"><span>${x[2]}</span><small>${x[1]}</small></button>`).join('')}<button data-more><span>☰</span><small>Más</small></button></nav><div class="b43-stage1-sheet" data-sheet="more"><div class="b43-stage1-backdrop"></div><section><i></i><header><div><strong>Todos los módulos</strong><small>Integración móvil por etapas</small></div><button data-close>×</button></header><div class="b43-stage1-grid"></div></section></div><div class="b43-stage1-sheet" data-sheet="profile"><div class="b43-stage1-backdrop"></div><section><i></i><header><div class="b43-stage1-avatar big">P</div><div><strong>Mi perfil</strong><small>Sesión activa</small></div><button data-close>×</button></header><div class="b43-stage1-profile">Sesión autenticada</div><button class="b43-stage1-primary" data-close>Continuar</button><button class="b43-stage1-danger" data-logout>Cerrar sesión</button></section></div><div class="b43-stage1-form"><div class="b43-stage1-backdrop"></div><section><header><strong data-stage1-form-title>Registrar</strong><button data-form-close>×</button></header><div class="b43-stage1-form-slot"></div></section></div><div class="b43-stage1-notice"><div class="b43-stage1-backdrop"></div><section><strong>Integración progresiva</strong><p>El módulo <b data-notice-name>—</b> queda reservado para la siguiente etapa. Esta versión integra únicamente Menú + Resumen.</p><button data-close-notice>Entendido</button></section></div>`;app().prepend(root);
 $$('[data-nav]',root).forEach(b=>b.onclick=()=>navigate(b.dataset.nav));$$('[data-more]',root).forEach(b=>b.onclick=openMore);$('[data-home]',root).onclick=()=>navigate('dashboard');$('[data-profile]',root).onclick=openProfile;$$('[data-close],.b43-stage1-backdrop',root).forEach(b=>b.onclick=closeSheets);$('[data-close-notice]',root).onclick=closeNotice;$('[data-form-close]',root).onclick=closeForm;$('[data-logout]',root).onclick=()=>{closeSheets();native('logoutBtn')?.click()};populateMore();renderSummary();
}
function observe(){if(observer)observer.disconnect();let timer=null;observer=new MutationObserver(()=>{if(!ready()||rendering)return;clearTimeout(timer);timer=setTimeout(()=>{mirrorAll();const p=native('margin-progress');const pi=$('[data-progress]',root);if(p&&pi)pi.style.width=p.style.width||'0%'},120)});const ids=['month-income-total','month-expense-total','future-income-total','future-expense-total','kpi-real-balance','kpi-assured','kpi-projected','kpi-committed','kpi-projected-balance','kpi-gap','margin-maximum','margin-spent','margin-remaining','margin-percent','margin-projection','margin-status','summary-status-text','executive-risk-summary','exec-liquidity-reading','exec-obligation-reading','exec-flow-reading','exec-generation-reading'];ids.map(native).filter(Boolean).forEach(n=>observer.observe(n,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['style','class']}));}
function restore(){if(observer)observer.disconnect();observer=null;closeSheets();closeForm();restoreMoved();root?.remove();root=null;showLegacy();document.body.classList.remove('b43-stage1-lock');built=false}
function boot(){if(!mobile()){restore();return}if(!ready()){setTimeout(boot,250);return}if(!built)build();hideLegacy();observe()}
window.addEventListener('resize',()=>setTimeout(boot,180));window.addEventListener('orientationchange',()=>setTimeout(boot,220));
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
window.CCFMobileB43={version:'4.3-stage1-menu-summary',activate:navigate,refresh:renderSummary,disable:restore};
})();
