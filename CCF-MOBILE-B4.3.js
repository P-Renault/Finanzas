/* CCF MOBILE B4.3.0 — MOBILE PRODUCT SHELL
   Presentation/interaction layer only.
   - Keeps the existing financial modules and data engines as owners.
   - No Supabase client, SQL, RLS or authentication changes.
   - No desktop changes (breakpoint <=720px).
   - Uses existing module buttons and existing DOM controls.
*/
(function(){
'use strict';
if(window.__CCF_MOBILE_B43__) return;
window.__CCF_MOBILE_B43__=true;

var BP=720, built=false, observer=null, syncTimer=0, active='dashboard';
var primary=[
 ['dashboard','Resumen','⌂'],
 ['movimientos','Movimientos','↕'],
 ['deudas','Deudas','▣'],
 ['cuentas','Cuentas','▤']
];
var meta={
 dashboard:['Resumen','Vista general e indicadores clave','⌂'],
 movimientos:['Movimientos','Registro y control de transacciones','↕'],
 deudas:['Deudas','Control y seguimiento de obligaciones','▣'],
 cuentas:['Cuentas','Gestión de cuentas y saldo total','▤'],
 presupuesto:['Presupuesto','Planificación vs. ejecutado','◒'],
 planificacion:['Planificación','Escenario de 30 días','◈'],
 futuros:['Pagos futuros','Vencimientos y recordatorios','◷'],
 calendario:['Calendario','Vista mensual e integración','▦'],
 operaciones:['Operaciones','Registro rápido y utilidades','⇄'],
 ahorro:['Ahorro','Metas y control del ahorro','◎'],
 'ia-financiera':['IA Financiera','Análisis y recomendaciones','✦'],
 ingresos:['Motor Multifuente','Generación y control de ingresos','↗'],
 jornadas:['Control de Jornada','Resultado financiero integrado','◷']
};

function mobile(){return window.matchMedia('(max-width:'+BP+'px)').matches}
function app(){return document.getElementById('app')}
function ready(){var a=app();return mobile()&&a&&!a.classList.contains('hidden')&&getComputedStyle(a).display!=='none'}
function tabs(){return document.querySelectorAll('.tabs button[data-tab]')}
function tabButton(id){return document.querySelector('.tabs button[data-tab="'+id+'"]')}
function shell(){return document.getElementById('ccf-mobile-b43')}
function visibleSection(id){var s=document.getElementById(id);return s&&!s.classList.contains('hidden')}

function build(){
 if(built||!ready()) return;
 built=true;
 var old=document.getElementById('ccf-mobile-b341'); if(old) old.remove();
 var r=document.createElement('div'); r.id='ccf-mobile-b43';
 r.innerHTML=
 '<header class="b43-header">'+
   '<button class="b43-logo" data-home aria-label="Ir a Resumen">CCF</button>'+
   '<div class="b43-brand"><strong>Centro de Control Financiero</strong><small>Tu vida financiera en un solo lugar</small></div>'+
   '<div class="b43-head-actions"><button data-bell aria-label="Notificaciones">♧</button><button data-profile class="b43-avatar" aria-label="Perfil">P</button></div>'+
 '</header>'+
 '<nav class="b43-bottom" aria-label="Navegación móvil">'+
 primary.map(function(x){return '<button data-b43-tab="'+x[0]+'"><span>'+x[2]+'</span><small>'+x[1]+'</small></button>'}).join('')+
 '<button data-more><span>•••</span><small>Más</small></button></nav>'+
 '<div class="b43-sheet" data-sheet="more"><div class="b43-backdrop"></div><section><div class="b43-handle"></div><header><div><strong>Todos los módulos</strong><small>Accede a cada sección del sistema</small></div><button data-close>×</button></header><div class="b43-module-grid"></div></section></div>'+
 '<div class="b43-sheet" data-sheet="profile"><div class="b43-backdrop"></div><section class="b43-profile"><div class="b43-handle"></div><header><div class="b43-profile-avatar">P</div><div><strong>Mi perfil</strong><small>Cuenta activa</small></div><button data-close>×</button></header><div class="b43-profile-email"><span>Correo electrónico</span><strong data-email>Sesión autenticada</strong></div><button data-profile-close>Continuar</button><button class="b43-danger" data-logout>Cerrar sesión</button></section></div>'+ 
 '<div class="b43-form-sheet" data-form-sheet="movimientos"><div class="b43-backdrop"></div><section><div class="b43-handle"></div><header><strong>Registrar movimiento</strong><button data-form-close>×</button></header></section></div>';
 app().appendChild(r);
 r.querySelectorAll('[data-b43-tab]').forEach(function(b){b.addEventListener('click',function(){activate(b.dataset.b43Tab)})});
 r.querySelector('[data-home]').addEventListener('click',function(){activate('dashboard')});
 r.querySelector('[data-more]').addEventListener('click',openMore);
 r.querySelector('[data-profile]').addEventListener('click',openProfile);
 r.querySelector('[data-close]').addEventListener('click',closeSheets);
 r.querySelector('[data-profile-close]').addEventListener('click',closeSheets);
 r.querySelector('[data-logout]').addEventListener('click',function(){closeSheets();document.getElementById('logoutBtn')?.click()});
 r.querySelector('.b43-backdrop').addEventListener('click',closeSheets);
 installModuleUX(); renderMore(); sync();
}

function hideLegacy(){
 document.querySelector('.topbar')?.classList.add('b43-legacy-hidden');
 document.querySelector('.tabs')?.classList.add('b43-legacy-hidden');
 document.querySelector('.ccf-manual-access')?.classList.add('b43-legacy-hidden');
 document.querySelector('#ccf-product-footer')?.classList.add('b43-legacy-hidden');
}
function showLegacy(){document.querySelectorAll('.b43-legacy-hidden').forEach(function(x){x.classList.remove('b43-legacy-hidden')})}
function renderMore(){
 var g=document.querySelector('.b43-module-grid'); if(!g)return; g.innerHTML='';
 tabs().forEach(function(b){var id=b.dataset.tab;if(!id||primary.some(function(x){return x[0]===id}))return;var m=meta[id]||[b.textContent.trim(),'Módulo financiero','◉'];var x=document.createElement('button');x.className='b43-module';x.innerHTML='<b>'+m[2]+'</b><span><strong>'+m[0]+'</strong><small>'+m[1]+'</small></span>';x.onclick=function(){activate(id)};g.appendChild(x)})
}
function openMore(){renderMore();document.querySelector('[data-sheet="more"]')?.classList.add('open');document.body.classList.add('b43-lock')}
function openProfile(){
 var e=document.querySelector('[data-email]');
 try{e.textContent=window.supabaseClient?.auth?.getUser?'Cuenta autenticada':'Sesión autenticada'}catch(_){ }
 document.querySelector('[data-sheet="profile"]')?.classList.add('open');document.body.classList.add('b43-lock')
}
function closeSheets(){document.querySelectorAll('.b43-sheet.open,.b43-form-sheet.open').forEach(function(x){x.classList.remove('open')});document.body.classList.remove('b43-lock')}

function activate(id){
 var b=tabButton(id); if(!b){console.warn('[B4.3] módulo no encontrado',id);return}
 closeSheets(); active=id;
 b.click();
 localStorage.setItem('cf_active_tab_v2',id);
 [40,180,500,1000].forEach(function(ms){setTimeout(function(){if(ready()){sync();renderModule(id)}},ms)});
}

function sync(){
 if(!ready())return;
 var id=(document.querySelector('.tabs button.active[data-tab]')||{}).dataset?.tab||active||'dashboard'; active=id;
 var s=shell();if(!s)return;
 s.querySelectorAll('[data-b43-tab]').forEach(function(b){b.classList.toggle('active',b.dataset.b43Tab===id)});
 hideLegacy();
 renderModule(id);
 syncTimer=window.setTimeout(sync,1200);
}

function renderModule(id){
 document.body.dataset.b43Module=id;
 if(id==='dashboard') setupDashboard();
 else if(id==='movimientos') setupMovimientos();
 else if(id==='deudas') setupDeudas();
 else if(id==='cuentas') setupCuentas();
 else if(id==='futuros') setupFuturos();
 else if(id==='calendario') setupCalendario();
 else if(id==='ahorro') setupAhorro();
 else if(id==='operaciones') setupOperations();
 else if(id==='planificacion') setupPlanificacion();
 else if(id==='presupuesto') setupPresupuesto();
 else if(id==='ingresos'||id==='jornadas') setupIncome();
 else if(id==='ia-financiera') setupAI();
}

function once(id,fn){var e=document.getElementById(id);if(e&&!e.dataset.b43){e.dataset.b43='1';fn(e)}}
function setupDashboard(){
 var d=document.getElementById('dashboard');if(!d)return;
 d.classList.add('b43-dashboard');
 once('dashboard',function(){
   var fc=d.querySelector('#financial-control'); if(fc){fc.classList.add('b43-financial-control')}
   var grid=d.querySelector('.kpi-grid'); if(grid)grid.classList.add('b43-native-kpis');
   var charts=d.querySelector('#executive-charts'); if(charts)charts.classList.add('b43-native-charts');
 });
}
function setupMovimientos(){
 var s=document.getElementById('movimientos');if(!s)return;s.classList.add('b43-list-module');
 once('movimientos',function(){
   var form=s.querySelector('#movForm')?.closest('.card');if(form){form.classList.add('b43-form-card','b43-hidden-form');addFab(s,'movForm')}
   addSearch(s,'movimientosLista','Buscar movimiento...');
 });
}
function setupFuturos(){var s=document.getElementById('futuros');if(!s)return;s.classList.add('b43-list-module');once('futuros',function(){var form=s.querySelector('#futureForm')?.closest('.card');if(form){form.classList.add('b43-form-card','b43-hidden-form');addFab(s,'futureForm')}})}
function setupAhorro(){var s=document.getElementById('ahorro');if(!s)return;s.classList.add('b43-list-module');once('ahorro',function(){var form=s.querySelector('#savingForm')?.closest('.card');if(form){form.classList.add('b43-form-card','b43-hidden-form');addFab(s,'savingForm')}})}
function setupCalendario(){var s=document.getElementById('calendario');if(s)s.classList.add('b43-calendar')}
function setupDeudas(){var s=document.getElementById('deudas');if(s)s.classList.add('b43-debt-module')}
function setupCuentas(){var s=document.getElementById('cuentas');if(s)s.classList.add('b43-accounts-module')}
function setupOperations(){var s=document.getElementById('operaciones');if(s)s.classList.add('b43-ops-module')}
function setupPlanificacion(){var s=document.getElementById('planificacion');if(s)s.classList.add('b43-plan-module')}
function setupPresupuesto(){var s=document.getElementById('presupuesto');if(s)s.classList.add('b43-budget-module')}
function setupIncome(){var s=document.getElementById(active);if(s)s.classList.add('b43-income-module')}
function setupAI(){var s=document.getElementById('ia-financiera');if(s)s.classList.add('b43-ai-module')}

function addSearch(section,listId,placeholder){
 if(section.querySelector('[data-b43-search="'+listId+'"]'))return;
 var host=document.createElement('div');host.className='b43-searchbar';host.innerHTML='<span>⌕</span><input type="search" placeholder="'+placeholder+'" aria-label="'+placeholder+'"><button type="button">⚱</button>';
 var list=document.getElementById(listId);if(list){list.closest('.card')?.insertBefore(host,list)}
 host.querySelector('input').addEventListener('input',function(){var q=this.value.toLowerCase();list?.querySelectorAll(':scope > *').forEach(function(x){x.style.display=!q||x.textContent.toLowerCase().includes(q)?'':'none'})});
 host.dataset.b43Search=listId;
}
function addFab(section,formId){
 if(section.querySelector('[data-b43-fab]'))return;
 var b=document.createElement('button');b.type='button';b.className='b43-fab';b.dataset.b43Fab='1';b.textContent='+';b.setAttribute('aria-label','Registrar');
 b.onclick=function(){var card=document.getElementById(formId)?.closest('.card');if(card){card.classList.remove('b43-hidden-form');card.classList.add('b43-form-open');document.body.classList.add('b43-lock');}};
 section.appendChild(b);
 var card=document.getElementById(formId)?.closest('.card');if(card){var close=document.createElement('button');close.type='button';close.className='b43-form-close';close.textContent='×';close.onclick=function(){card.classList.remove('b43-form-open');document.body.classList.remove('b43-lock')};card.querySelector('h2')?.appendChild(close)}
}

function observe(){
 if(observer)observer.disconnect();var a=app();if(!a)return;
 observer=new MutationObserver(function(){if(!mobile()||!ready())return;clearTimeout(syncTimer);syncTimer=setTimeout(function(){renderMore();sync()},120)});
 observer.observe(a,{subtree:false,childList:true,attributes:true,attributeFilter:['class','style']});
}
function restore(){
 clearTimeout(syncTimer);var r=shell();if(r)r.remove();showLegacy();document.body.classList.remove('b43-lock');document.body.removeAttribute('data-b43-module');document.querySelectorAll('.b43-form-card').forEach(function(x){x.classList.remove('b43-form-open','b43-hidden-form')});built=false;if(observer)observer.disconnect();observer=null;
}
function boot(){if(!mobile())return;if(!ready()){setTimeout(boot,250);return}build();hideLegacy();observe()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
window.addEventListener('resize',function(){setTimeout(function(){if(mobile())boot();else restore()},180)});
window.CCFMobileB43={version:'4.3.0-mobile-native-adapter',activate:activate,disable:restore};
})();
