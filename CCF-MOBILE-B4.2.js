/* CCF MOBILE B4.2 — MOBILE APPLICATION SHELL
   Presentation-only mobile UX. Existing financial modules remain the data/action owners.
   No Supabase client, auth, SQL or data writes are created here.
*/
(function(){
'use strict';
if(window.__CCF_MOBILE_B42__) return;
window.__CCF_MOBILE_B42__=true;

var BP=720, root=null, timer=0, activeId='dashboard';
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
var primary=['dashboard','movimientos','deudas','cuentas'];
function mobile(){return matchMedia('(max-width:'+BP+'px)').matches}
function app(){return document.getElementById('app')}
function ready(){var a=app();return mobile()&&a&&!a.classList.contains('hidden')&&getComputedStyle(a).display!=='none'}
function nativeTab(id){return document.querySelector('.tabs button[data-tab="'+id+'"]')}
function nativeSection(id){return document.getElementById(id)}
function text(sel, fallback){var e=document.querySelector(sel);return e&&e.textContent.trim()?e.textContent.trim():fallback}
function money(sel){return text(sel,'$0')}
function esc(s){return String(s||'').replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function shell(){return root}
function hideLegacy(){
 document.querySelector('.topbar')?.classList.add('b42-legacy-hidden');
 document.querySelector('.tabs')?.classList.add('b42-legacy-hidden');
 document.querySelector('.ccf-manual-access')?.classList.add('b42-legacy-hidden');
 document.querySelectorAll('#app>.tab').forEach(function(s){s.classList.add('b42-native-hidden')});
}
function showNative(id){
 document.querySelectorAll('#app>.tab').forEach(function(s){s.classList.add('b42-native-hidden')});
 var s=nativeSection(id); if(s) s.classList.remove('b42-native-hidden');
}
function syncNative(id){var b=nativeTab(id);if(b){b.click();setTimeout(function(){showNative(id);renderScreen(id)},60)}}
function create(){
 if(root||!ready()) return;
 root=document.createElement('div');root.id='ccf-mobile-b42';
 root.innerHTML='<header class="b42-head">'+
 '<button class="b42-brand" data-go="dashboard"><b>CCF</b></button>'+ 
 '<div class="b42-head-title"><strong>Centro de Control Financiero</strong><small>Tu vida financiera en un solo lugar</small></div>'+ 
 '<button class="b42-head-icon" data-profile aria-label="Perfil">P</button></header>'+ 
 '<main class="b42-main"><div id="b42-screen"></div></main>'+ 
 '<nav class="b42-nav">'+primary.map(function(id){return '<button data-nav="'+id+'"><span>'+meta[id][2]+'</span><small>'+meta[id][0]+'</small></button>'}).join('')+'<button data-more><span>•••</span><small>Más</small></button></nav>'+ 
 '<div class="b42-sheet" id="b42-more"><div class="b42-backdrop" data-close></div><section><i class="b42-handle"></i><header><div><strong>Todos los módulos</strong><small>Accede a cada sección del sistema</small></div><button data-close>×</button></header><div class="b42-grid"></div></section></div>'+ 
 '<div class="b42-sheet" id="b42-profile"><div class="b42-backdrop" data-close></div><section><i class="b42-handle"></i><header><div><strong>Mi perfil</strong><small>Cuenta activa</small></div><button data-close>×</button></header><div class="b42-profile"><div class="b42-avatar">P</div><div><span>Sesión autenticada</span><strong data-email>—</strong></div></div><button class="b42-primary" data-close>Continuar</button><button class="b42-danger" data-logout>Cerrar sesión</button></section></div>';
 app().appendChild(root);
 root.querySelectorAll('[data-nav]').forEach(function(b){b.onclick=function(){activate(b.dataset.nav)}});
 root.querySelector('[data-go]').onclick=function(){activate('dashboard')};
 root.querySelector('[data-more]').onclick=openMore;root.querySelector('[data-profile]').onclick=openProfile;
 root.querySelectorAll('[data-close]').forEach(function(x){x.onclick=closeSheets});
 root.querySelector('[data-logout]').onclick=function(){closeSheets();var b=document.getElementById('logoutBtn');if(b)b.click()};
 renderMore();activate('dashboard');
}
function renderMore(){var g=root&&root.querySelector('.b42-grid');if(!g)return;g.innerHTML='';Object.keys(meta).forEach(function(id){if(primary.indexOf(id)>=0)return;var m=meta[id];var b=document.createElement('button');b.className='b42-module';b.innerHTML='<b>'+m[2]+'</b><span><strong>'+esc(m[0])+'</strong><small>'+esc(m[1])+'</small></span>';b.onclick=function(){closeSheets();activate(id)};g.appendChild(b)})}
function openMore(){renderMore();document.getElementById('b42-more').classList.add('open');document.body.classList.add('b42-lock')}
function openProfile(){var e=root.querySelector('[data-email]');e.textContent=window.supabaseClient?.auth?'Cuenta autenticada':(localStorage.getItem('sf_url')?'Cuenta CCF':'Sesión activa');document.getElementById('b42-profile').classList.add('open');document.body.classList.add('b42-lock')}
function closeSheets(){root.querySelectorAll('.b42-sheet.open').forEach(function(x){x.classList.remove('open')});document.body.classList.remove('b42-lock')}
function activate(id){if(!meta[id])id='dashboard';activeId=id;syncNative(id);renderScreen(id);root.querySelectorAll('[data-nav]').forEach(function(b){b.classList.toggle('active',b.dataset.nav===id)});root.querySelector('.b42-main').scrollTop=0}
function card(label,value,cls){return '<article class="b42-kpi '+(cls||'')+'"><span>'+label+'</span><strong>'+esc(value)+'</strong></article>'}
function quick(label,id,icon){return '<button class="b42-quick" data-native="'+id+'"><b>'+icon+'</b><span>'+label+'</span></button>'}
function bindActions(){root.querySelectorAll('[data-native]').forEach(function(b){b.onclick=function(){activate(b.dataset.native)}});root.querySelectorAll('[data-details]').forEach(function(b){b.onclick=function(){var s=nativeSection(b.dataset.details);if(s){s.classList.remove('b42-native-hidden');s.scrollIntoView({behavior:'smooth',block:'start'})}}})}
function renderScreen(id){if(!root)return;var m=meta[id];var h='<section class="b42-screen"><div class="b42-screen-head"><div><span>CCF · '+esc(m[0].toUpperCase())+'</span><h1>'+esc(m[0])+'</h1><p>'+esc(m[1])+'</p></div><button class="b42-more-inline" data-more>•••</button></div>';
 if(id==='dashboard')h+=dashboard();else if(id==='movimientos')h+=movimientos();else if(id==='deudas')h+=deudas();else if(id==='cuentas')h+=cuentas();else h+=secondary(id);h+='</section>';
 root.querySelector('#b42-screen').innerHTML=h;root.querySelectorAll('[data-more]').forEach(function(b){b.onclick=openMore});bindActions();
}
function dashboard(){return '<div class="b42-month">Septiembre de 2026 <span>⌄</span></div><div class="b42-kpis">'+card('Liquidez actual',money('#kpi-real-balance'),'blue')+card('Ingresos del mes',money('#month-income-total'),'green')+card('Gastos del mes',money('#month-expense-total'),'red')+card('Saldo proyectado',money('#kpi-projected-balance'),'navy')+'</div><section class="b42-panel"><h2>Flujo del mes</h2><p>Ingresos · gastos · saldo</p><div class="b42-chart-proxy">'+(document.querySelector('#chart-flow')?.innerHTML||'<span>El gráfico financiero se conserva en el informe completo.</span>')+'</div></section><h2 class="b42-section-title">Accesos rápidos</h2><div class="b42-quick-grid">'+quick('Registrar gasto','movimientos','＋')+quick('Registrar ingreso','movimientos','↗')+quick('Ver deudas','deudas','▣')+quick('Planificar','planificacion','◈')+'</div><button class="b42-details" data-details="dashboard">Ver informe financiero completo y gráficos</button>'}
function movimientos(){return '<div class="b42-search">⌕ &nbsp; Buscar movimiento... <span>⚱</span></div><div class="b42-filter"><b>Todos</b><span>Ingresos</span><span>Gastos</span><span>Transferencias</span></div><div class="b42-list">'+listFromNative('#movimientosLista',6)+'</div><button class="b42-fab" data-details="movimientos">＋</button><button class="b42-details" data-details="movimientos">Abrir formulario e historial completo</button>'}
function deudas(){return '<div class="b42-segment"><b>Pendientes</b><span>Pagadas</span></div><div class="b42-kpis two">'+card('Total pendiente',text('#deudas-total-pendiente','$0'),'neutral')+card('Vence este mes',text('#deudas-vence-mes','$0'),'red')+'</div><div class="b42-list">'+listFromNative('#deudas',7)+'</div><button class="b42-details" data-details="deudas">Abrir gestión completa de deudas</button>'}
function cuentas(){return '<div class="b42-filter account"><b>Todas</b><span>Efectivo</span><span>Bancos</span><span>Otros</span></div><div class="b42-account-total"><span>Saldo total</span><strong>'+money('#kpi-real-balance')+'</strong></div><div class="b42-list">'+listFromNative('#cuentas',8)+'</div><button class="b42-details" data-details="cuentas">Abrir gestión completa de cuentas</button>'}
function listFromNative(sel,n){var el=document.querySelector(sel);if(!el)return '<div class="b42-empty">Datos disponibles en el módulo completo.</div>';var nodes=Array.from(el.querySelectorAll('tr,.item,.list-item,li,article')).filter(function(x){return x.textContent.trim()});return nodes.slice(0,n).map(function(x,i){var t=x.textContent.trim().replace(/\s+/g,' ');return '<div class="b42-row"><i>'+(['↗','↘','◉','▣','◎'][i%5])+'</i><div><strong>'+esc(t.slice(0,48))+'</strong><small>'+esc(t.slice(48,90))+'</small></div></div>'}).join('')||'<div class="b42-empty">No hay registros visibles.</div>'}
function secondary(id){var m=meta[id];return '<div class="b42-feature"><div class="b42-feature-icon">'+m[2]+'</div><h2>'+esc(m[0])+'</h2><p>'+esc(m[1])+'</p><div class="b42-native-summary">Este módulo conserva sus datos, cálculos, gráficos y formularios originales.</div><button class="b42-primary" data-details="'+id+'">Abrir módulo completo</button></div>'}
function boot(){if(!mobile())return;if(!ready()){setTimeout(boot,250);return}create();hideLegacy();}
function restore(){if(root){root.remove();root=null}document.body.classList.remove('b42-lock');document.querySelectorAll('.b42-native-hidden').forEach(function(s){s.classList.remove('b42-native-hidden')});document.querySelectorAll('.b42-legacy-hidden').forEach(function(s){s.classList.remove('b42-legacy-hidden')})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
addEventListener('resize',function(){clearTimeout(timer);timer=setTimeout(function(){if(mobile())boot();else restore()},150)});
window.CCFMobileB42={version:'4.2.0',activate:activate,disable:restore};
})();
