/* CCF MOBILE B3.4 — isolated mobile product shell
   IMPORTANT: this layer starts ONLY after #app is visible.
   No Supabase client, auth calls, SQL, RLS or financial writes.
*/
(function(){
'use strict';
if(window.__CCF_MOBILE_B34__) return;
window.__CCF_MOBILE_B34__=true;

var BP=720, enabled=true, built=false, observer=null, renderTimer=0;
var primary=[
 ['dashboard','Resumen','⌂'],
 ['movimientos','Movimientos','↕'],
 ['deudas','Deudas','▣'],
 ['cuentas','Cuentas','▤']
];
var secondary=[
 ['presupuesto','Presupuesto','◒','Planificación vs. ejecutado'],
 ['planificacion','Planificación','◈','Escenario de 30 días'],
 ['futuros','Pagos futuros','◷','Vencimientos y recordatorios'],
 ['calendario','Calendario','▦','Vista mensual e integración'],
 ['operaciones','Operaciones','⇄','Registro rápido y utilidades'],
 ['ahorro','Ahorro','◎','Metas y control del ahorro'],
 ['ia-financiera','IA Financiera','✦','Análisis y recomendaciones']
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

function mobile(){return matchMedia('(max-width:'+BP+'px)').matches}
function app(){return document.getElementById('app')}
function ready(){var a=app();return mobile()&&a&&!a.classList.contains('hidden')&&getComputedStyle(a).display!=='none'}
function tab(id){return document.querySelector('.tabs button[data-tab="'+id+'"]')}
function active(){var b=document.querySelector('.tabs button.active[data-tab]');return b?b.dataset.tab:'dashboard'}
function el(id){return document.getElementById(id)}
function text(id,fallback){var e=el(id);return e&&e.textContent.trim()?e.textContent.trim():fallback||'$0'}

function build(){
 if(built||!ready())return;
 built=true;
 var r=document.createElement('div');r.id='ccf-mobile-b34';
 r.innerHTML=
 '<header class="b34-header"><button class="b34-logo" data-home><b>CCF</b></button><div class="b34-title"><strong>Centro de Control Financiero</strong><small>Tu vida financiera en un solo lugar</small></div><div class="b34-actions"><button data-profile class="b34-icon">♙</button><button data-profile class="b34-avatar">P</button></div></header>'+
 '<div class="b34-modulebar"><span class="b34-mi"></span><div><strong></strong><small></small></div><button data-more class="b34-dots">•••</button></div>'+
 '<main class="b34-main"></main>'+
 '<nav class="b34-nav">'+primary.map(function(x){return '<button data-tab34="'+x[0]+'"><span>'+x[2]+'</span><small>'+x[1]+'</small></button>'}).join('')+'<button data-more><span>•••</span><small>Más</small></button></nav>'+
 '<div class="b34-sheet" data-sheet="more"><div class="b34-backdrop"></div><section><div class="b34-handle"></div><header><div><strong>Todos los módulos</strong><small>Accede a cada sección del sistema</small></div><button data-close>×</button></header><div class="b34-grid"></div></section></div>'+
 '<div class="b34-sheet" data-sheet="profile"><div class="b34-backdrop"></div><section class="b34-profile"><header><div class="b34-pavatar">P</div><div><strong>Mi perfil</strong><small>Cuenta activa</small></div><button data-close>×</button></header><div class="b34-profile-email"><span>Correo electrónico</span><strong data-email>Consultando sesión…</strong></div><button data-profile-close>Continuar en la aplicación</button><button class="b34-logout" data-logout>Cerrar sesión</button></section></div>';
 app().appendChild(r);

 r.querySelectorAll('[data-tab34]').forEach(function(b){b.onclick=function(){activate(b.dataset.tab34)}})
 r.querySelectorAll('[data-more]').forEach(function(b){b.onclick=openMore})
 r.querySelectorAll('[data-close]').forEach(function(b){b.onclick=function(){closeSheets()}})
 r.querySelectorAll('[data-profile]').forEach(function(b){b.onclick=openProfile})
 r.querySelector('[data-profile-close]').onclick=closeSheets;
 r.querySelector('[data-logout]').onclick=function(){var b=el('logoutBtn');closeSheets();if(b)b.click()};
 r.querySelector('[data-home]').onclick=function(){activate('dashboard')};
 renderMore();render();
}

function hideLegacy(){
 document.querySelector('.topbar')?.classList.add('b34-hide');
 document.querySelector('.tabs')?.classList.add('b34-hide');
 document.querySelector('.ccf-manual-access')?.classList.add('b34-hide');
 document.querySelector('#ccf-product-footer')?.classList.add('b34-hide');
}
function showLegacy(){document.querySelectorAll('.b34-hide').forEach(function(x){x.classList.remove('b34-hide')})}

function renderMore(){
 var g=document.querySelector('.b34-grid');if(!g)return;g.innerHTML='';
 document.querySelectorAll('.tabs button[data-tab]').forEach(function(b){
   var id=b.dataset.tab;
   if(!id||id==='dashboard'||id==='movimientos'||id==='deudas'||id==='cuentas') {
     if(id==='dashboard'||id==='movimientos'||id==='deudas'||id==='cuentas') return;
   }
   var m=meta[id]||[b.textContent.trim(),'Módulo financiero','◉'];
   var x=document.createElement('button');x.className='b34-module';x.innerHTML='<b>'+m[2]+'</b><span><strong>'+m[0]+'</strong><small>'+(m[1]||'Módulo financiero')+'</small></span>';
   x.onclick=function(){activate(id)};g.appendChild(x);
 });
}
function openMore(){renderMore();document.querySelector('[data-sheet="more"]').classList.add('open');document.body.classList.add('b34-lock')}
function openProfile(){
 document.querySelector('[data-sheet="profile"]').classList.add('open');document.body.classList.add('b34-lock');
 var o=document.querySelector('[data-email]');
 try{
   var c=window.supabaseClient||window.db||window.__db;
   if(c&&c.auth&&c.auth.getUser)c.auth.getUser().then(function(r){o.textContent=r&&r.data&&r.data.user&&r.data.user.email?r.data.user.email:'Sesión autenticada'}).catch(function(){o.textContent='Sesión autenticada'});
   else o.textContent='Sesión autenticada';
 }catch(e){o.textContent='Sesión autenticada'}
}
function closeSheets(){document.querySelectorAll('.b34-sheet.open').forEach(function(x){x.classList.remove('open')});document.body.classList.remove('b34-lock')}

function dashboard(){
 var d=document.createElement('section');d.className='b34-dashboard';
 d.innerHTML='<div class="b34-month"><span>Septiembre de 2026</span><b>⌄</b></div>'+
 '<div class="b34-kpis"><article class="blue"><small>Liquidez actual</small><strong data-k="liq">$0</strong><em>Efectivo + cuentas</em></article><article class="green"><small>Ingresos del mes</small><strong data-k="in">$0</strong><em>Ejecutado</em></article><article class="red"><small>Gastos del mes</small><strong data-k="out">$0</strong><em>Ejecutado</em></article><article class="navy"><small>Saldo proyectado</small><strong data-k="proj">$0</strong><em>Fin del mes</em></article></div>'+
 '<div class="b34-chart"><header><strong>Flujo del mes</strong><span>Ingresos · Gastos · Saldo</span></header><div class="b34-chart-host"></div></div>'+
 '<div class="b34-quick"><strong>Accesos rápidos</strong><div><button data-q="gasto">＋<span>Registrar gasto</span></button><button data-q="ingreso">＋<span>Registrar ingreso</span></button><button data-q="deudas">▣<span>Ver deudas</span></button><button data-q="planificacion">◈<span>Planificar</span></button></div></div>';
 d.querySelectorAll('[data-q]').forEach(function(b){b.onclick=function(){if(b.dataset.q==='deudas'||b.dataset.q==='planificacion')activate(b.dataset.q);else{activate('movimientos');setTimeout(function(){var t=el('movTipo');if(t){t.value=b.dataset.q;t.dispatchEvent(new Event('change',{bubbles:true}))}},250)}}});
 return d;
}

function sync(){
 var d=document.querySelector('.b34-dashboard');if(!d)return;
 [['liq','kpi-real-balance'],['in','month-income-total'],['out','month-expense-total'],['proj','kpi-projected-balance']].forEach(function(x){
  var v=text(x[1],null);if(v){var n=d.querySelector('[data-k="'+x[0]+'"]');if(n)n.textContent=v}
 });
 var chart=el('chart-flow')||el('chart-liquidity'),host=d.querySelector('.b34-chart-host');
 if(chart&&host&&!host.contains(chart)){host.innerHTML='';host.appendChild(chart)}
}
function render(){
 if(!ready())return;
 build();if(!built)return;
 hideLegacy();
 var id=active(),m=meta[id]||[id,'Módulo financiero','◉'],root=el('ccf-mobile-b34'),main=root.querySelector('.b34-main');
 root.querySelector('.b34-mi').textContent=m[2];root.querySelector('.b34-modulebar strong').textContent=m[0];root.querySelector('.b34-modulebar small').textContent=m[1];
 root.querySelectorAll('[data-tab34]').forEach(function(b){b.classList.toggle('active',b.dataset.tab34===id)});
 main.innerHTML='';
 if(id==='dashboard'){
   main.appendChild(dashboard());
   // Keep the native summary in the DOM for its engines, but never display it in mobile.
   var native=el('dashboard');if(native)native.classList.add('b34-source');
   sync();
 }else{
   var native=el(id);
   if(native){native.classList.remove('hidden');native.classList.add('b34-native');main.appendChild(native)}
   else main.innerHTML='<section class="b34-empty"><strong>'+m[0]+'</strong><p>El módulo se está cargando…</p></section>';
 }
 renderMore();sync();
}
function activate(id){var b=tab(id);if(b)b.click();closeSheets();[80,500,1200,2200].forEach(function(t){setTimeout(render,t)})}
function wait(){
 if(!mobile())return;
 if(!ready()){setTimeout(wait,250);return}
 build();render();
 [500,1200,2500,5000].forEach(function(t){setTimeout(function(){if(ready())render()},t)});
 observe();
}
function observe(){
 if(observer)observer.disconnect();
 observer=new MutationObserver(function(){if(!enabled||!ready())return;clearTimeout(renderTimer);renderTimer=setTimeout(render,180)});
 observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class','style']});
}
function restore(){var r=el('ccf-mobile-b34');if(r)r.remove();showLegacy();document.querySelectorAll('.b34-source,.b34-native').forEach(function(x){x.classList.remove('b34-source','b34-native')});document.body.classList.remove('b34-lock');built=false}
function boot(){if(!mobile())return;wait();addEventListener('resize',function(){setTimeout(function(){if(mobile())wait();else restore()},200)});window.CCFMobileB34={version:'3.4.0',activate,openMore,openProfile,disable:function(){enabled=false;restore()}}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
