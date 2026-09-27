/* CCF MOBILE B4.3.2 — ETAPA 1 SAFE
   Solo Menú + Resumen. Fail-safe: no toca nada mientras #app no esté visible.
*/
(()=>{'use strict';
if(window.__CCF_MOBILE_B432_SAFE__)return;window.__CCF_MOBILE_B432_SAFE__=true;
const BP=720,$=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const app=()=>$('#app'), mobile=()=>window.matchMedia('(max-width:'+BP+'px)').matches;
const el=id=>document.getElementById(id);
const tab=id=>$('.tabs button[data-tab="'+CSS.escape(id)+'"]');
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const META={dashboard:['Resumen','Vista general e indicadores clave','⌂'],movimientos:['Movimientos','Registro y control de transacciones','↕'],deudas:['Deudas','Control y seguimiento de obligaciones','▣'],cuentas:['Cuentas','Gestión de cuentas y saldos','▤'],presupuesto:['Presupuesto','Planificación vs. ejecutado','◒'],planificacion:['Planificación','Escenario de 30 días','◈'],futuros:['Pagos futuros','Vencimientos y recordatorios','◷'],calendario:['Calendario','Vista mensual e integración','▦'],ahorro:['Ahorro','Metas y control del ahorro','◎'],operaciones:['Operaciones','Registro rápido y utilidades','⇄'],ingresos:['Motor Multifuente','Generación y control de ingresos','↗'],jornadas:['Control de Jornada','Resultado financiero integrado','◷'],'ia-financiera':['IA Financiera','Análisis y recomendaciones','✦']};
const PRIMARY=[['dashboard','Resumen','⌂'],['movimientos','Movimientos','↕'],['deudas','Deudas','▣'],['cuentas','Cuentas','▤']];
let root=null,built=false,active='dashboard',observer=null;
function ready(){return mobile()&&app()&&!app().classList.contains('hidden')}
function value(id,f='—'){return el(id)?.textContent?.trim()||f}
function clickTab(id){const b=tab(id);if(!b)return false; b.click(); return true}
function mirror(root,id){const source=el(id);if(!source)return;$$('[data-mirror="'+id+'"]',root).forEach(n=>n.textContent=source.textContent?.trim()||'—')}
function mirrorAll(){if(!root)return;['month-income-total','month-expense-total','future-income-total','future-expense-total','kpi-real-balance','kpi-assured','kpi-projected','kpi-committed','kpi-projected-balance','kpi-gap','margin-maximum','margin-spent','margin-remaining','margin-percent','margin-projection','margin-status','summary-status-text','executive-risk-summary','exec-liquidity-reading','exec-obligation-reading','exec-flow-reading','exec-generation-reading','future-month-label','future-income-count','future-expense-count'].forEach(id=>mirror(root,id))}
function cloneInto(host,id){const source=el(id);if(!source||!host)return;const clone=source.cloneNode(true);clone.removeAttribute('id');clone.dataset.ccfMobileClone=id;host.appendChild(clone)}
function renderSummary(){
 if(!root||!ready())return;
 const c=$('.ccf432-content',root); if(!c)return;
 c.innerHTML=`
 <div class="ccf432-period"><div><small>PERÍODO</small><strong data-mirror="future-month-label">${esc(value('future-month-label'))}</strong></div><span>⌄</span></div>
 <section class="ccf432-kpis">
  <article class="blue"><small>Liquidez actual</small><strong data-mirror="kpi-real-balance">${esc(value('kpi-real-balance'))}</strong></article>
  <article class="green"><small>Ingresos del mes</small><strong data-mirror="month-income-total">${esc(value('month-income-total'))}</strong></article>
  <article class="red"><small>Gastos del mes</small><strong data-mirror="month-expense-total">${esc(value('month-expense-total'))}</strong></article>
  <article class="navy"><small>Saldo proyectado</small><strong data-mirror="kpi-projected-balance">${esc(value('kpi-projected-balance'))}</strong></article>
 </section>
 <section class="ccf432-card"><header><b>Flujo del mes</b><span>Ingresos · Gastos · Saldo</span></header><div class="ccf432-live" data-chart></div></section>
 <h3 class="ccf432-section">Accesos rápidos</h3>
 <section class="ccf432-quick"><button data-q="movimientos"><b>＋</b><small>Registrar gasto</small></button><button data-q="movimientos"><b>＋</b><small>Registrar ingreso</small></button><button data-q="deudas"><b>◉</b><small>Ver deudas</small></button><button data-q="planificacion"><b>◈</b><small>Planificar</small></button></section>
 <section class="ccf432-card"><header><b>Estado financiero</b><span data-mirror="summary-status-text">${esc(value('summary-status-text'))}</span></header>
  <div class="ccf432-grid2">
   ${kpi('Ingresos asegurados','kpi-assured')} ${kpi('Ingresos proyectados','kpi-projected')}
   ${kpi('Egresos comprometidos','kpi-committed')} ${kpi('Brecha financiera','kpi-gap')}
  </div>
 </section>
 <section class="ccf432-card"><header><b>Compromisos próximos</b><span>Movimientos futuros</span></header><div class="ccf432-grid2"><div class="ccf432-sub"><b>Ingresos</b><div data-future="future-income-list"></div></div><div class="ccf432-sub"><b>Egresos</b><div data-future="future-expense-list"></div></div></div></section>
 <section class="ccf432-card"><header><b>Control diario</b><span data-mirror="margin-status">${esc(value('margin-status'))}</span></header><div class="ccf432-grid3">${kpi('Margen máximo','margin-maximum')}${kpi('Gastado','margin-spent')}${kpi('Margen restante','margin-remaining')}</div><div class="ccf432-progress"><i></i></div><div class="ccf432-meta"><span data-mirror="margin-percent">${esc(value('margin-percent'))}</span><span data-mirror="margin-projection">${esc(value('margin-projection'))}</span></div></section>
 <section class="ccf432-card"><header><b>Proyección financiera</b><span>90 días</span></header><div class="ccf432-scroll" data-projection></div></section>
 <section class="ccf432-grid2 ccf432-decisions"><article><small>PRÓXIMA NECESIDAD</small><div data-copy="next-need"></div></article><article><small>ACCIONES PRIORITARIAS</small><div data-copy="priority-actions"></div></article></section>
 <section class="ccf432-card"><header><b>Análisis ejecutivo</b><span data-mirror="executive-risk-summary">${esc(value('executive-risk-summary'))}</span></header><div class="ccf432-grid2">${ins('Liquidez','exec-liquidity-reading')}${ins('Obligaciones','exec-obligation-reading')}${ins('Flujo próximo','exec-flow-reading')}${ins('Generación requerida','exec-generation-reading')}</div><div class="ccf432-chartgrid" data-exec></div></section>`;
 const flow=el('chart-flow'); if(flow) cloneInto($('[data-chart]',c),'chart-flow');
 ['future-income-list','future-expense-list'].forEach(id=>{const h=$(`[data-future="${id}"]`,c);if(h)cloneInto(h,id)});
 ['next-need','priority-actions'].forEach(id=>{const h=$(`[data-copy="${id}"]`,c);const s=el(id);if(h&&s)h.innerHTML=s.innerHTML});
 const p=el('projection-table');if(p){const h=$('[data-projection]',c);h.innerHTML=p.innerHTML}
 const charts=$('#executive-charts'),eh=$('[data-exec]',c);if(charts&&eh){[...charts.children].forEach(a=>{const src=a.querySelector('[id^="chart-"]');if(!src)return;const box=document.createElement('article');box.innerHTML='<b>'+esc(a.querySelector('h3')?.textContent||'Análisis')+'</b><small>'+esc(a.querySelector('p')?.textContent||'')+'</small>';const cloned=src.cloneNode(true);cloned.removeAttribute('id');box.appendChild(cloned);eh.appendChild(box)})}
 const prog=el('margin-progress');if(prog)$('.ccf432-progress i',c).style.width=prog.style.width||'0%';
 $$('[data-q]',c).forEach(b=>b.onclick=()=>{const id=b.dataset.q;clickTab(id);});
 mirrorAll();
}
function kpi(label,id){return `<div class="ccf432-mini"><small>${esc(label)}</small><strong data-mirror="${id}">${esc(value(id))}</strong></div>`}
function ins(label,id){return `<div class="ccf432-mini"><small>${esc(label)}</small><strong data-mirror="${id}">${esc(value(id))}</strong></div>`}
function build(){
 if(built||!ready())return;
 root=document.createElement('div');root.id='ccf-mobile-b43';root.innerHTML=`
 <header class="ccf432-header"><button class="ccf432-logo" data-home>CCF</button><div><strong>Centro de Control Financiero</strong><small>Tu vida financiera en un solo lugar</small></div><button class="ccf432-bell">♧</button><button class="ccf432-avatar" data-profile>P</button></header>
 <main class="ccf432-content"></main>
 <nav class="ccf432-bottom">${PRIMARY.map(x=>`<button data-nav="${x[0]}"><span>${x[2]}</span><small>${x[1]}</small></button>`).join('')}<button data-more><span>☰</span><small>Más</small></button></nav>
 <div class="ccf432-sheet" data-sheet="more"><div class="ccf432-backdrop"></div><section><i></i><header><div><b>Todos los módulos</b><small>Acceso móvil</small></div><button data-close>×</button></header><div class="ccf432-modules"></div></section></div>
 <div class="ccf432-sheet" data-sheet="profile"><div class="ccf432-backdrop"></div><section><i></i><header><div><b>Mi perfil</b><small>Sesión autenticada</small></div><button data-close>×</button></header><p class="ccf432-profile">Sesión activa</p><button data-close>Continuar</button><button data-logout>Cerrar sesión</button></section></div>`;
 app().prepend(root);built=true;
 $$('[data-nav]',root).forEach(b=>b.onclick=()=>{closeSheets();if(b.dataset.nav==='dashboard')renderSummary();else clickTab(b.dataset.nav)});
 $('[data-home]',root).onclick=()=>{closeSheets();renderSummary();clickTab('dashboard')};
 $('[data-more]',root).onclick=()=>{populateMore();$('.ccf432-sheet[data-sheet="more"]',root).classList.add('open')};
 $('[data-profile]',root).onclick=()=>$('.ccf432-sheet[data-sheet="profile"]',root).classList.add('open');
 $$('[data-close],.ccf432-backdrop',root).forEach(b=>b.onclick=closeSheets);
 $('[data-logout]',root).onclick=()=>el('logoutBtn')?.click();
 populateMore();renderSummary();activateLegacy();
}
function populateMore(){const g=$('.ccf432-modules',root);if(!g)return;g.innerHTML='';const ids=[...new Set($$('.tabs button[data-tab]').map(b=>b.dataset.tab).concat(['presupuesto','planificacion','futuros','calendario','ahorro','operaciones','ingresos','jornadas','ia-financiera']))];ids.filter(id=>!PRIMARY.some(x=>x[0]===id)).forEach(id=>{const m=META[id]||[id,'Módulo financiero','◉'];const b=document.createElement('button');b.innerHTML='<b>'+m[2]+'</b><span><strong>'+esc(m[0])+'</strong><small>'+esc(m[1])+'</small></span>';b.onclick=()=>{closeSheets();clickTab(id)};g.appendChild(b)})}
function activateLegacy(){if(!root||!ready())return;['.topbar','.tabs','.ccf-manual-access','#ccf-product-footer'].forEach(s=>$(s)?.classList.add('ccf432-hide'));$$('.tab').forEach(s=>s.classList.add('ccf432-hide-tab'))}
function closeSheets(){$$('.ccf432-sheet.open',root).forEach(x=>x.classList.remove('open'))}
function observe(){if(observer)observer.disconnect();observer=new MutationObserver(()=>{if(ready())mirrorAll()});['month-income-total','month-expense-total','future-income-total','future-expense-total','kpi-real-balance','kpi-assured','kpi-projected','kpi-committed','kpi-projected-balance','kpi-gap','margin-maximum','margin-spent','margin-remaining','margin-percent','margin-projection','margin-status','summary-status-text','executive-risk-summary','exec-liquidity-reading','exec-obligation-reading','exec-flow-reading','exec-generation-reading'].map(el).filter(Boolean).forEach(x=>observer.observe(x,{childList:true,subtree:true,characterData:true,attributes:true}))}
function restore(){if(observer)observer.disconnect();observer=null;root?.remove();root=null;built=false;$$('.ccf432-hide').forEach(x=>x.classList.remove('ccf432-hide'));$$('.ccf432-hide-tab').forEach(x=>x.classList.remove('ccf432-hide-tab'))}
function boot(){if(!mobile()){if(built)restore();return}if(!ready())return;if(!built)build();mirrorAll()}
window.addEventListener('resize',()=>setTimeout(boot,150));document.addEventListener('DOMContentLoaded',boot,{once:true});if(document.readyState!=='loading')boot();
window.CCFMobileB43={version:'4.3.2-safe-stage1',disable:restore,refresh:renderSummary};
})();
