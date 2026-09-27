/* CCF MOBILE B4.3.0 — DEFINITIVO · PRODUCCIÓN-B.2
   Adaptación móvil integral de presentación sobre los módulos nativos.
   CONTRATO:
   - Este archivo NO crea clientes Supabase.
   - NO modifica autenticación, SQL, RLS, datos ni cálculos.
   - NO cambia IDs, nombres, textos, motores ni flujo funcional.
   - Solo se activa <=720px.
   - En escritorio se restaura el DOM original.
*/
(()=>{'use strict';

if(window.__CCF_MOBILE_B43_DEFINITIVE__) return;
window.__CCF_MOBILE_B43_DEFINITIVE__=true;

const BP=720;
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const isMobile=()=>window.matchMedia(`(max-width:${BP}px)`).matches;
const app=()=>document.getElementById('app');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

const META={
 dashboard:['Resumen','Vista general e indicadores clave','⌂'],
 movimientos:['Movimientos','Registro y control de transacciones','↕'],
 deudas:['Deudas','Control y seguimiento','▣'],
 cuentas:['Cuentas','Gestión de cuentas y saldo total','▤'],
 presupuesto:['Presupuesto','Planificación vs. ejecutado','◒'],
 planificacion:['Planificación','Escenario de 30 días','◇'],
 futuros:['Pagos futuros','Vencimientos y recordatorios','◷'],
 calendario:['Calendario','Vista mensual e integración','▦'],
 ahorro:['Ahorro','Metas y control del ahorro','◎'],
 operaciones:['Operaciones','Registro rápido y utilidades','⇄'],
 ingresos:['Motor Multifuente','Generación y control de ingresos','↗'],
 jornadas:['Control de Jornada','Resultado financiero integrado','◷'],
 'ia-financiera':['IA Financiera','Análisis y recomendaciones','✦']
};

const PRIMARY=['dashboard','movimientos','deudas','cuentas'];
let shell=null;
let mounted=null;
let activeId='dashboard';
let observer=null;
let resizeTimer=null;
let bootTimer=null;

function ready(){
  const a=app();
  return !!(isMobile() && a && !a.classList.contains('hidden'));
}

function tab(id){
  return $(`.tabs button[data-tab="${CSS.escape(id)}"]`);
}

function activeNative(){
  return $('.tabs button.active[data-tab]')?.dataset.tab
      || localStorage.getItem('cf_active_tab_v2')
      || 'dashboard';
}

function moduleMeta(id){
  if(META[id]) return META[id];
  const b=tab(id);
  return [(b?.textContent||id).trim(),'Módulo financiero','•'];
}

function findSection(id){
  const direct=document.getElementById(id);
  if(direct) return direct;
  const b=tab(id);
  const controls=b?.getAttribute('aria-controls');
  return controls ? document.getElementById(controls) : null;
}

function hideDesktopChrome(flag){
  const selectors=['.topbar','.tabs','.ccf-manual-access','#ccf-product-footer'];
  selectors.forEach(sel=>$$(`${sel}`).forEach(el=>el.classList.toggle('b43-desktop-hidden',flag)));
}

function restoreMounted(){
  if(!mounted) return;
  const {el,placeholder}=mounted;
  el.classList.remove('b43-native-module');
  el.removeAttribute('data-b43-module');
  el.classList.remove(...Array.from(el.classList).filter(c=>c.startsWith('b43-mod-')));
  if(placeholder?.parentNode) placeholder.parentNode.insertBefore(el,placeholder.nextSibling);
  placeholder?.remove();
  mounted=null;
}

function addTableWrapper(table){
  if(!table.parentElement?.classList.contains('b43-table-wrap')){
    const wrap=document.createElement('div');
    wrap.className='b43-table-wrap';
    table.parentNode.insertBefore(wrap,table);
    wrap.appendChild(table);
  }
}

function decorate(el,id){
  if(!el) return;
  el.classList.add('b43-native-module',`b43-mod-${id}`);

  $$('form',el).forEach(x=>x.classList.add('b43-form'));
  $$('input,select,textarea',el).forEach(x=>x.classList.add('b43-control'));
  $$('button',el).forEach(x=>x.classList.add('b43-btn'));
  $$('canvas,svg',el).forEach(x=>x.classList.add('b43-chart'));
  $$('table',el).forEach(addTableWrapper);

  const cardSelectors=[
    '.card','.panel','.kpi-card','.kpi','.metric','.metric-card',
    '.b234-card','.b234-kpi','.b234-cat','.b225-kpi','.b225-source',
    '.b225-record','.b23252-kpi','.executive-chart','.executive-card',
    '.summary-card','.stat-card','article','fieldset'
  ];
  $$(cardSelectors.join(','),el).forEach(x=>x.classList.add('b43-card'));

  $$('h1,h2,h3,h4',el).forEach(x=>x.classList.add('b43-heading'));

  /* Normalize dynamically-created components without changing their content. */
  $$('img',el).forEach(x=>x.style.maxWidth='100%');
  $$('pre,code',el).forEach(x=>x.classList.add('b43-code'));
}

function mount(id){
  if(!shell) return false;
  const el=findSection(id);
  if(!el) return false;

  restoreMounted();

  const placeholder=document.createComment(`CCF B4.3 native ${id}`);
  el.parentNode?.insertBefore(placeholder,el);

  el.classList.remove('hidden');
  el.classList.add('b43-native-module');
  el.dataset.b43Module=id;

  shell.querySelector('.b43-host').appendChild(el);
  mounted={el,placeholder,id};

  decorate(el,id);
  return true;
}

function updateChrome(id){
  if(!shell) return;
  const m=moduleMeta(id);
  shell.querySelector('[data-title]').textContent=m[0];
  shell.querySelector('[data-sub]').textContent=m[1];
  shell.querySelector('[data-icon]').textContent=m[2];
  $$('[data-nav]',shell).forEach(b=>b.classList.toggle('active',b.dataset.nav===id));
}

function availableModuleIds(){
  return $$('.tabs button[data-tab]')
    .map(b=>b.dataset.tab)
    .filter(Boolean);
}

function renderMore(){
  const grid=shell?.querySelector('.b43-grid');
  if(!grid) return;
  grid.replaceChildren();

  const ids=availableModuleIds();
  const ordered=[
    'presupuesto','ingresos','jornadas','futuros','calendario','ahorro',
    'operaciones','planificacion','ia-financiera','deudas','cuentas','movimientos'
  ];

  [...ordered,...ids].filter((id,i,a)=>a.indexOf(id)===i && !PRIMARY.includes(id))
    .forEach(id=>{
      const b=tab(id);
      if(!b) return;
      const m=moduleMeta(id);
      const card=document.createElement('button');
      card.type='button';
      card.className='b43-module';
      card.dataset.module=id;
      card.innerHTML=`
        <span class="b43-mi" aria-hidden="true">${m[2]}</span>
        <span class="b43-module-copy">
          <b>${m[0]}</b>
          <small>${m[1]}</small>
        </span>`;
      card.addEventListener('click',()=>navigate(id));
      grid.appendChild(card);
    });
}

function closeSheets(){
  shell?.querySelectorAll('.b43-sheet.open').forEach(x=>x.classList.remove('open'));
  document.body.classList.remove('b43-lock');
}

function openSheet(name){
  if(!shell) return;
  renderMore();
  shell.querySelector(`[data-sheet="${name}"]`)?.classList.add('open');
  document.body.classList.add('b43-lock');
}

function fireNativeTab(id){
  const b=tab(id);
  if(!b) return false;
  try{
    b.click();
    return true;
  }catch(e){
    console.warn('[CCF B4.3] navegación nativa:',e);
    return false;
  }
}

async function waitAndMount(id){
  for(let i=0;i<18;i++){
    if(mount(id)) return true;
    await sleep(80);
  }
  return false;
}

async function navigate(id){
  if(!ready() || !shell) return;

  closeSheets();

  /* Aliases remain presentation-only; the real native tab controls the module. */
  if(!tab(id)){
    if(id==='ingresos' && tab('operaciones')) id='operaciones';
    else if(id==='jornadas' && tab('operaciones')) id='operaciones';
    else if(id==='ia-financiera' && tab('dashboard')) id='dashboard';
  }

  activeId=id;
  localStorage.setItem('cf_active_tab_v2',id);
  updateChrome(id);

  fireNativeTab(id);

  const ok=await waitAndMount(id);
  if(!ok){
    /* The native navigation remains authoritative; do not invent a module. */
    console.warn('[CCF B4.3] No se encontró la vista nativa:',id);
  }

  updateChrome(id);
  decorate(mounted?.el,id);
}

function build(){
  if(shell || !ready()) return;

  shell=document.createElement('div');
  shell.id='ccf-mobile-b43';
  shell.innerHTML=`
    <header class="b43-header">
      <button class="b43-logo" data-home aria-label="Ir a Resumen">CCF</button>
      <div class="b43-brand">
        <b>Centro de Control Financiero</b>
        <small>Tu vida financiera en un solo lugar</small>
      </div>
      <button class="b43-bell" type="button" aria-label="Notificaciones">♧</button>
      <button class="b43-avatar" type="button" data-profile aria-label="Mi perfil">P</button>
    </header>

    <div class="b43-page">
      <span class="b43-page-icon" data-icon>⌂</span>
      <div>
        <b data-title>Resumen</b>
        <small data-sub>Vista general e indicadores clave</small>
      </div>
      <button class="b43-more" type="button" data-more aria-label="Todos los módulos">•••</button>
    </div>

    <main class="b43-host"></main>

    <nav class="b43-bottom" aria-label="Navegación móvil">
      ${PRIMARY.map(id=>`
        <button type="button" data-nav="${id}">
          <span>${META[id][2]}</span>
          <small>${META[id][0]}</small>
        </button>`).join('')}
      <button type="button" data-more>
        <span>☰</span><small>Más</small>
      </button>
    </nav>

    <div class="b43-sheet" data-sheet="more">
      <div class="b43-backdrop"></div>
      <section aria-label="Todos los módulos">
        <i class="b43-handle"></i>
        <header>
          <div>
            <b>Todos los módulos</b>
            <small>Accede a cada sección del sistema</small>
          </div>
          <button type="button" data-close aria-label="Cerrar">×</button>
        </header>
        <div class="b43-grid"></div>
      </section>
    </div>

    <div class="b43-sheet" data-sheet="profile">
      <div class="b43-backdrop"></div>
      <section aria-label="Perfil">
        <i class="b43-handle"></i>
        <header>
          <div class="b43-avatar big">P</div>
          <div>
            <b>Mi perfil</b>
            <small>Sesión activa</small>
          </div>
          <button type="button" data-close aria-label="Cerrar">×</button>
        </header>
        <div class="b43-profile">Sesión autenticada</div>
        <button type="button" class="b43-primary" data-close>Continuar</button>
        <button type="button" class="b43-danger" data-logout>Cerrar sesión</button>
      </section>
    </div>`;

  app().prepend(shell);

  $$('[data-nav]',shell).forEach(b=>b.addEventListener('click',()=>navigate(b.dataset.nav)));
  $$('[data-more]',shell).forEach(b=>b.addEventListener('click',()=>openSheet('more')));
  $$('[data-close],.b43-backdrop',shell).forEach(x=>x.addEventListener('click',closeSheets));
  shell.querySelector('[data-home]').addEventListener('click',()=>navigate('dashboard'));
  shell.querySelector('[data-profile]').addEventListener('click',()=>openSheet('profile'));
  shell.querySelector('[data-logout]').addEventListener('click',()=>{
    document.getElementById('logoutBtn')?.click();
    closeSheets();
  });

  renderMore();
  hideDesktopChrome(true);

  activeId=activeNative();
  navigate(activeId);
}

function restore(){
  closeSheets();
  restoreMounted();
  if(observer){observer.disconnect();observer=null}
  shell?.remove();
  shell=null;
  hideDesktopChrome(false);
  document.body.classList.remove('b43-lock');
}

function boot(){
  clearTimeout(bootTimer);

  if(!isMobile()){
    restore();
    return;
  }

  if(!ready()){
    bootTimer=setTimeout(boot,250);
    return;
  }

  if(!shell) build();
  else{
    hideDesktopChrome(true);
    decorate(mounted?.el,mounted?.id||activeId);
    renderMore();
  }
}

/* Modules such as Deudas, Cuentas, Operaciones and Planificación can be
   constructed after authentication. Keep the adapter synchronized with them. */
function observeApp(){
  if(observer || !app()) return;
  observer=new MutationObserver(()=>{
    if(!isMobile() || !shell) return;
    renderMore();
    if(mounted?.el && document.contains(mounted.el)) decorate(mounted.el,mounted.id);
  });
  observer.observe(app(),{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
}

window.addEventListener('resize',()=>{
  clearTimeout(resizeTimer);
  resizeTimer=setTimeout(boot,120);
});
window.addEventListener('orientationchange',()=>setTimeout(boot,250));

if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',()=>{observeApp();boot()},{once:true});
}else{
  observeApp();
  boot();
}

window.CCFMobileB43={
  version:'B4.3.0-definitive-mobile-ui',
  activate:navigate,
  refresh:()=>{renderMore();decorate(mounted?.el,mounted?.id||activeId)},
  disable:restore
};

})();
