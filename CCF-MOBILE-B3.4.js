/* CCF MOBILE B3.4.1 — NATIVE CONTENT PRESERVATION
   Presentation-only mobile shell.
   IMPORTANT:
   - Does NOT clone or move native modules.
   - Does NOT replace the native dashboard.
   - Does NOT create Supabase clients or perform data/auth calls.
   - Existing financial modules remain owners of their rendering/data.
*/
(function(){
'use strict';
if(window.__CCF_MOBILE_B341_NATIVE__) return;
window.__CCF_MOBILE_B341_NATIVE__=true;

var BP=720, built=false, enabled=true, observer=null, timer=0;
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
 'ia-financiera':['IA Financiera','Análisis y recomendaciones','✦']
};

function mobile(){return window.matchMedia('(max-width:'+BP+'px)').matches}
function app(){return document.getElementById('app')}
function ready(){
 var a=app();
 return mobile() && a && !a.classList.contains('hidden') &&
   getComputedStyle(a).display!=='none';
}
function tab(id){return document.querySelector('.tabs button[data-tab="'+id+'"]')}
function active(){
 var b=document.querySelector('.tabs button.active[data-tab]');
 return b ? b.dataset.tab : 'dashboard';
}
function shell(){return document.getElementById('ccf-mobile-b341')}

function build(){
 if(built||!ready()) return;
 built=true;

 var r=document.createElement('div');
 r.id='ccf-mobile-b341';
 r.innerHTML=
 '<header class="b341-header">'+
   '<button class="b341-logo" data-home aria-label="Ir a resumen"><b>CCF</b></button>'+
   '<div class="b341-title"><strong>Centro de Control Financiero</strong><small>Tu vida financiera en un solo lugar</small></div>'+
   '<div class="b341-actions"><button data-profile class="b341-icon" aria-label="Perfil">♙</button><button data-profile class="b341-avatar" aria-label="Perfil">P</button></div>'+
 '</header>'+
 '<div class="b341-modulebar">'+
   '<span class="b341-mi"></span>'+
   '<div><strong></strong><small></small></div>'+
   '<button data-more class="b341-dots" aria-label="Más módulos">•••</button>'+
 '</div>'+
 '<div class="b341-spacer"></div>'+
 '<nav class="b341-nav" aria-label="Navegación móvil">'+
   primary.map(function(x){
     return '<button data-tab341="'+x[0]+'"><span>'+x[2]+'</span><small>'+x[1]+'</small></button>';
   }).join('')+
   '<button data-more><span>•••</span><small>Más</small></button>'+
 '</nav>'+
 '<div class="b341-sheet" data-sheet="more"><div class="b341-backdrop"></div><section>'+
   '<div class="b341-handle"></div>'+
   '<header><div><strong>Todos los módulos</strong><small>Accede a cada sección del sistema</small></div><button data-close>×</button></header>'+
   '<div class="b341-grid"></div>'+
 '</section></div>'+
 '<div class="b341-sheet" data-sheet="profile"><div class="b341-backdrop"></div><section class="b341-profile">'+
   '<header><div class="b341-pavatar">P</div><div><strong>Mi perfil</strong><small>Cuenta activa</small></div><button data-close>×</button></header>'+
   '<div class="b341-profile-email"><span>Correo electrónico</span><strong data-email>Sesión autenticada</strong></div>'+
   '<button data-profile-close>Continuar en la aplicación</button>'+
   '<button class="b341-logout" data-logout>Cerrar sesión</button>'+
 '</section></div>';

 app().appendChild(r);

 r.querySelectorAll('[data-tab341]').forEach(function(b){
   b.addEventListener('click',function(){activate(b.dataset.tab341)});
 });
 r.querySelectorAll('[data-more]').forEach(function(b){
   b.addEventListener('click',openMore);
 });
 r.querySelectorAll('[data-close]').forEach(function(b){
   b.addEventListener('click',closeSheets);
 });
 r.querySelectorAll('[data-profile]').forEach(function(b){
   b.addEventListener('click',openProfile);
 });
 r.querySelector('[data-profile-close]').addEventListener('click',closeSheets);
 r.querySelector('[data-logout]').addEventListener('click',function(){
   closeSheets();
   var b=document.getElementById('logoutBtn');
   if(b) b.click();
 });
 r.querySelector('[data-home]').addEventListener('click',function(){activate('dashboard')});

 renderMore();
 renderHeader();
}

function hideLegacy(){
 document.querySelector('.topbar')?.classList.add('b341-hide');
 document.querySelector('.tabs')?.classList.add('b341-hide');
 document.querySelector('.ccf-manual-access')?.classList.add('b341-hide');
 document.querySelector('#ccf-product-footer')?.classList.add('b341-hide');
}

function showLegacy(){
 document.querySelectorAll('.b341-hide').forEach(function(x){x.classList.remove('b341-hide')});
}

function renderMore(){
 var g=document.querySelector('.b341-grid');
 if(!g) return;
 g.innerHTML='';
 document.querySelectorAll('.tabs button[data-tab]').forEach(function(b){
   var id=b.dataset.tab;
   if(!id || primary.some(function(x){return x[0]===id})) return;
   var m=meta[id] || [b.textContent.trim(),'Módulo financiero','◉'];
   var x=document.createElement('button');
   x.className='b341-module';
   x.innerHTML='<b>'+m[2]+'</b><span><strong>'+m[0]+'</strong><small>'+m[1]+'</small></span>';
   x.addEventListener('click',function(){activate(id)});
   g.appendChild(x);
 });
}

function openMore(){
 renderMore();
 document.querySelector('[data-sheet="more"]')?.classList.add('open');
 document.body.classList.add('b341-lock');
}
function openProfile(){
 document.querySelector('[data-sheet="profile"]')?.classList.add('open');
 document.body.classList.add('b341-lock');
}
function closeSheets(){
 document.querySelectorAll('.b341-sheet.open').forEach(function(x){x.classList.remove('open')});
 document.body.classList.remove('b341-lock');
}

function renderHeader(){
 if(!ready()) return;
 var id=active(), m=meta[id] || [id,'Módulo financiero','◉'];
 var r=shell();
 if(!r) return;
 r.querySelector('.b341-mi').textContent=m[2];
 r.querySelector('.b341-modulebar strong').textContent=m[0];
 r.querySelector('.b341-modulebar small').textContent=m[1];
 r.querySelectorAll('[data-tab341]').forEach(function(b){
   b.classList.toggle('active',b.dataset.tab341===id);
 });
 hideLegacy();

 /*
  * CRITICAL:
  * Native #dashboard/#deudas/#cuentas/etc remain in their original
  * DOM location. This shell never moves, clones, hides or replaces them.
  */
 document.querySelectorAll('.tab').forEach(function(section){
   if(section.id) section.classList.remove('b341-ported');
 });
}

function activate(id){
 var b=tab(id);
 if(!b){
   console.warn('[CCF B3.4.1] Módulo no encontrado:',id);
   return;
 }
 closeSheets();
 b.click();

 /* Give native module engines time to render without relocating content. */
 [50,250,700,1500,3000].forEach(function(ms){
   setTimeout(function(){
     if(!enabled||!ready()) return;
     renderHeader();
     renderMore();
   },ms);
 });
}

function observe(){
 if(observer) observer.disconnect();
 if(!document.body) return;
 observer=new MutationObserver(function(){
   if(!enabled||!ready()) return;
   clearTimeout(timer);
   timer=setTimeout(function(){
     renderHeader();
     renderMore();
   },180);
 });
 /*
  * Observe only app-level structural/class changes. Do not react to every
  * descendant mutation; financial modules can render hundreds of nodes.
  */
 observer.observe(app(),{childList:false,subtree:false,attributes:true,attributeFilter:['class','style']});
}

function restore(){
 var r=shell();
 if(r) r.remove();
 showLegacy();
 document.body.classList.remove('b341-lock');
 if(observer) observer.disconnect();
 observer=null;
 built=false;
}

function boot(){
 if(!mobile()) return;
 if(!ready()){setTimeout(boot,250);return}
 build();
 renderHeader();
 renderMore();
 observe();
 window.CCFMobileB341={
   version:'3.4.1-native-preserve',
   activate:activate,
   openMore:openMore,
   openProfile:openProfile,
   disable:function(){enabled=false;restore()}
 };
}

if(document.readyState==='loading'){
 document.addEventListener('DOMContentLoaded',boot,{once:true});
}else{
 boot();
}

window.addEventListener('resize',function(){
 setTimeout(function(){
   if(mobile()) boot();
   else restore();
 },200);
});

})();
