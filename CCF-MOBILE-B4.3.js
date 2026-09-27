/* CCF MOBILE B4.3.0 — MOBILE PRODUCT ADAPTER / PRODUCCIÓN-B.2
   DEFINITIVO · ADAPTACIÓN PRESENTACIONAL SOBRE LOS MÓDULOS NATIVOS
   - Referencia visual: CCF mobile design supplied by product owner.
   - Desktop >720px remains untouched.
   - No Supabase client, no auth, no SQL, no RLS, no business calculations.
   - No replacement of native module content. Existing module DOM is mounted and styled.
   - Module names/descriptions follow the CCF usability manual.
*/
(()=>{'use strict';
if(window.__CCF_MOBILE_B43__)return; window.__CCF_MOBILE_B43__=true;
const BP=720;
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const app=()=>$('#app'), mobile=()=>matchMedia('(max-width:'+BP+'px)').matches;
const META={
 dashboard:['Resumen','Vista general e indicadores clave','⌂'],
 movimientos:['Movimientos','Registro de ingresos y gastos','↕'],
 deudas:['Deudas','Saldos, cuotas, abonos y pagos','▣'],
 cuentas:['Cuentas','Gestión de cuentas y saldos','▤'],
 presupuesto:['Presupuesto','Plan, ejecución, comprometido y proyección','◒'],
 planificacion:['Planificación','Escenario de 30 días','◈'],
 futuros:['Pagos futuros','Compromisos, vencimientos y necesidades de caja','◷'],
 calendario:['Calendario','Vista mensual e integración financiera','▦'],
 ahorro:['Ahorro','Aportes e historial del fondo de ahorro','◎'],
 operaciones:['Operaciones','Liquidez, ingresos futuros, obligaciones y proyección','⇄'],
 ingresos:['Motor Multifuente','Generación, cobro y conciliación de ingresos','↗'],
 jornadas:['Control de Jornada','Integración del resultado financiero de una jornada','◷'],
 'ia-financiera':['IA Financiera','Análisis financiero, diagnóstico y proyección','✦']
};
const PRIMARY=['dashboard','movimientos','deudas','cuentas'];
let root=null,mounted=null,current='dashboard',built=false;
function ready(){return mobile()&&app()&&!app().classList.contains('hidden')}
function tab(id){return $('.tabs button[data-tab="'+CSS.escape(id)+'"]')}
function active(){return $('.tabs button.active[data-tab]')?.dataset.tab||localStorage.getItem('cf_active_tab_v2')||'dashboard'}
function meta(id){return META[id]||[(tab(id)?.textContent||id).trim(),'Módulo financiero','◉']}
function fire(id){const b=tab(id); if(!b)return false; try{b.click()}catch(e){} return true}
function find(id){return document.getElementById(id)||(()=>{const b=tab(id);const a=b?.getAttribute('aria-controls');return a?document.getElementById(a):null})()}
function desktopChrome(hide){['.topbar','.tabs','.ccf-manual-access','#ccf-product-footer'].forEach(s=>$$('.'+s.replace(/^\./,'' )).forEach(e=>e.classList.toggle('b43-desktop-hidden',hide)));}
function restoreMount(){if(!mounted)return;const {el,placeholder}=mounted;el.classList.remove('b43-native-module');el.removeAttribute('data-b43-module');if(placeholder.parentNode)placeholder.parentNode.insertBefore(el,placeholder.nextSibling);placeholder.remove();mounted=null}
function mount(id){if(!root)return false;restoreMount();const el=find(id);if(!el)return false;const placeholder=document.createComment('CCF B4.3 native '+id);el.parentNode?.insertBefore(placeholder,el);el.classList.remove('hidden');el.classList.add('b43-native-module');el.dataset.b43Module=id;root.querySelector('.b43-host').appendChild(el);mounted={el,placeholder,id};adapt(el,id);return true}
function navigate(id){if(!ready())return; current=id||'dashboard'; localStorage.setItem('cf_active_tab_v2',current); update(current); closeSheets();
  if(!tab(current)){ if(current==='ingresos') current='operaciones'; else if(current==='jornadas') current='operaciones'; else if(current==='ia-financiera') current='dashboard'; }
  if(tab(current))fire(current);
  setTimeout(()=>{if(!mount(current)){setTimeout(()=>mount(current),220);setTimeout(()=>mount(current),800)}},35);
}
function update(id){if(!root)return;const m=meta(id);root.querySelector('[data-title]').textContent=m[0];root.querySelector('[data-sub]').textContent=m[1];root.querySelector('[data-icon]').textContent=m[2];$$('[data-nav]',root).forEach(b=>b.classList.toggle('active',b.dataset.nav===id))}
function renderMore(){const g=root?.querySelector('.b43-grid');if(!g)return;g.innerHTML='';
  const ids=[...$$('.tabs button[data-tab]')].map(b=>b.dataset.tab).filter(Boolean);
  [...ids,'ingresos','jornadas','ia-financiera'].filter((x,i,a)=>a.indexOf(x)===i&&!PRIMARY.includes(x)).forEach(id=>{const m=meta(id);const b=document.createElement('button');b.type='button';b.className='b43-module';b.dataset.module=id;b.innerHTML='<span class="b43-mi">'+m[2]+'</span><span><b>'+m[0]+'</b><small>'+m[1]+'</small></span>';b.onclick=()=>navigate(id);g.appendChild(b)});
}
function openMore(){renderMore();root.querySelector('[data-sheet="more"]').classList.add('open');document.body.classList.add('b43-lock')}
function openProfile(){root.querySelector('[data-sheet="profile"]').classList.add('open');document.body.classList.add('b43-lock')}
function closeSheets(){root?.querySelectorAll('.b43-sheet.open').forEach(x=>x.classList.remove('open'));document.body.classList.remove('b43-lock')}
function build(){if(built||!ready())return;built=true;root=document.createElement('div');root.id='ccf-mobile-b43';root.innerHTML=`
<header class="b43-header"><button class="b43-logo" data-home>CCF</button><div class="b43-brand"><b>Centro de Control Financiero</b><small>Tu vida financiera en un solo lugar</small></div><button class="b43-bell" aria-label="Notificaciones">♧</button><button class="b43-avatar" data-profile>P</button></header>
<div class="b43-page"><span class="b43-page-icon" data-icon>⌂</span><div><b data-title>Resumen</b><small data-sub>Vista general e indicadores clave</small></div><button class="b43-more" data-more>•••</button></div>
<main class="b43-host"></main>
<nav class="b43-bottom">${PRIMARY.map(id=>'<button data-nav="'+id+'"><span>'+META[id][2]+'</span><small>'+META[id][0]+'</small></button>').join('')}<button data-more><span>☰</span><small>Más</small></button></nav>
<div class="b43-sheet" data-sheet="more"><div class="b43-backdrop"></div><section><i class="b43-handle"></i><header><div><b>Todos los módulos</b><small>Accede a cada sección del sistema</small></div><button data-close>×</button></header><div class="b43-grid"></div></section></div>
<div class="b43-sheet" data-sheet="profile"><div class="b43-backdrop"></div><section><i class="b43-handle"></i><header><div class="b43-avatar big">P</div><div><b>Mi perfil</b><small>Sesión activa</small></div><button data-close>×</button></header><div class="b43-profile">Sesión autenticada</div><button class="b43-primary" data-close>Continuar</button><button class="b43-danger" data-logout>Cerrar sesión</button></section></div>`;
 app().prepend(root);
 $$('[data-nav]',root).forEach(b=>b.onclick=()=>navigate(b.dataset.nav));$$('[data-more]',root).forEach(b=>b.onclick=openMore);root.querySelector('[data-home]').onclick=()=>navigate('dashboard');root.querySelector('[data-profile]').onclick=openProfile;$$('[data-close],.b43-backdrop',root).forEach(x=>x.onclick=closeSheets);root.querySelector('[data-logout]').onclick=()=>{document.getElementById('logoutBtn')?.click();closeSheets()};renderMore();desktopChrome(true);navigate(active());
}
function adapt(el,id){if(!el)return;el.classList.add('b43-native-module','b43-mod-'+id);
  $$('form',el).forEach(x=>x.classList.add('b43-form'));$$('input,select,textarea',el).forEach(x=>x.classList.add('b43-control'));$$('button',el).forEach(x=>x.classList.add('b43-btn'));$$('canvas,svg',el).forEach(x=>x.classList.add('b43-chart'));$$('table',el).forEach(t=>{t.classList.add('b43-table');if(!t.parentElement.classList.contains('b43-table-wrap')){const w=document.createElement('div');w.className='b43-table-wrap';t.parentNode.insertBefore(w,t);w.appendChild(t)}});
  $$('.card,.panel,.kpi-card,.b234-card,.b234-kpi,.b234-cat,.b225-kpi,.b225-source,.b225-record,.b23252-kpi,.executive-chart',el).forEach(x=>x.classList.add('b43-card'));
  // Add a mobile visual hierarchy to native headings without changing their wording.
  $$('h1,h2,h3',el).forEach(h=>h.classList.add('b43-heading'));
  // Never rewrite text, IDs, values, event handlers or data attributes.
}
function refresh(){if(mounted)adapt(mounted.el,mounted.id);renderMore()}
function restore(){restoreMount();root?.remove();root=null;built=false;desktopChrome(false);document.body.classList.remove('b43-lock')}
function boot(){if(!mobile()){restore();return}if(!ready()){setTimeout(boot,250);return}build();desktopChrome(true)}
window.addEventListener('resize',()=>{clearTimeout(window.__b43rt);window.__b43rt=setTimeout(boot,150)});window.addEventListener('orientationchange',()=>setTimeout(boot,250));
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
window.CCFMobileB43={version:'4.4.0-definitive-native-adapter',activate:navigate,disable:restore,refresh};
})();
