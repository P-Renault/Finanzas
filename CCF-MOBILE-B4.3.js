/* CCF MOBILE B4.3 — NATIVE MOBILE APPLICATION SHELL
   The desktop UI is untouched above 720px.
   At <=720px, existing module sections are MOVED (not cloned) into a
   dedicated mobile viewport. Moving preserves existing DOM nodes,
   event listeners and module state while giving the mobile app its own UX.
*/
(function(){
'use strict';
if(window.__CCF_MOBILE_B43__) return;
window.__CCF_MOBILE_B43__=true;

const BP=720;
const modules=[
  ['dashboard','Resumen','⌂','Vista general e indicadores clave'],
  ['movimientos','Movimientos','↕','Registro y control de transacciones'],
  ['deudas','Deudas','▣','Control y seguimiento de obligaciones'],
  ['cuentas','Cuentas','▤','Gestión de cuentas y saldo total'],
  ['presupuesto','Presupuesto','◒','Planificación vs. ejecutado'],
  ['planificacion','Planificación','◈','Escenario de 30 días'],
  ['futuros','Pagos futuros','◷','Vencimientos y recordatorios'],
  ['calendario','Calendario','▦','Vista mensual e integración'],
  ['ahorro','Ahorro','◎','Metas y control del ahorro'],
  ['operaciones','Operaciones','⇄','Registro rápido y utilidades'],
  ['ia-financiera','IA Financiera','✦','Análisis y recomendaciones'],
  ['motor-multifuente','Motor Multifuente','◉','Módulo financiero'],
  ['control-jornada','Control de Jornada','◌','Control operativo']
];
const primary=['dashboard','movimientos','deudas','cuentas'];
let shell=null, activeId='dashboard', mounted=null, records=new Map(), booted=false;

function mobile(){return matchMedia('(max-width:'+BP+'px)').matches}
function app(){return document.getElementById('app')}
function tab(id){return document.querySelector('.tabs button[data-tab="'+CSS.escape(id)+'"]')}
function section(id){return document.getElementById(id)}
function visibleApp(){
 const a=app();
 return a && !a.classList.contains('hidden') && getComputedStyle(a).display!=='none';
}
function info(id){
 return modules.find(x=>x[0]===id)||[id,id,'◉','Módulo financiero'];
}
function saveOriginal(id,el){
 if(!records.has(id)) records.set(id,{el,parent:el.parentNode,next:el.nextSibling});
}
function mount(id){
 const el=section(id);
 const host=shell?.querySelector('.b43-content');
 if(!el||!host) return false;
 saveOriginal(id,el);
 if(mounted && mounted!==el) mounted.classList.remove('b43-mobile-module');
 mounted=el;
 host.innerHTML='';
 host.appendChild(el);
 el.classList.remove('hidden');
 el.classList.add('b43-mobile-module');
 return true;
}
function restoreAll(){
 records.forEach(r=>{
   if(r.parent && r.el.parentNode!==r.parent){
     r.parent.insertBefore(r.el,r.next);
   }
   r.el.classList.remove('b43-mobile-module');
 });
 mounted=null;
}
function legacy(on){
 document.querySelectorAll('.topbar,.tabs,.ccf-manual-access,#ccf-product-footer').forEach(x=>{
   x.classList.toggle('b43-legacy-hidden',on);
 });
}
function build(){
 if(shell||!mobile()||!visibleApp()) return;
 shell=document.createElement('div');
 shell.id='ccf-mobile-b43';
 shell.innerHTML=`
 <header class="b43-header">
   <button class="b43-brand" data-home><b>CCF</b></button>
   <div class="b43-title"><strong>Centro de Control Financiero</strong><small>Tu vida financiera en un solo lugar</small></div>
   <button class="b43-bell" aria-label="Notificaciones">♧</button>
   <button class="b43-avatar" data-profile aria-label="Perfil">P</button>
 </header>
 <div class="b43-module-head">
   <div class="b43-module-icon"></div><div><strong></strong><small></small></div>
   <button data-more aria-label="Más módulos">•••</button>
 </div>
 <main class="b43-content"></main>
 <nav class="b43-bottom"></nav>
 <div class="b43-sheet" data-sheet="more">
   <div class="b43-backdrop"></div><section>
    <div class="b43-handle"></div>
    <header><div><strong>Todos los módulos</strong><small>Accede a cada sección del sistema</small></div><button data-close>×</button></header>
    <div class="b43-module-grid"></div>
   </section>
 </div>
 <div class="b43-sheet" data-sheet="profile">
   <div class="b43-backdrop"></div><section class="b43-profile">
    <header><div class="b43-profile-avatar">P</div><div><strong>Mi perfil</strong><small>Cuenta activa</small></div><button data-close>×</button></header>
    <div class="b43-profile-email"><span>Sesión</span><strong>Autenticada</strong></div>
    <button data-close>Continuar</button>
    <button class="b43-logout" data-logout>Cerrar sesión</button>
   </section>
 </div>`;
 app().appendChild(shell);
 renderNav(); renderMore(); bind();
 legacy(true);
 activate('dashboard',false);
}
function renderNav(){
 const nav=shell.querySelector('.b43-bottom');
 nav.innerHTML=primary.map(id=>{
   const m=info(id);
   return `<button data-nav="${id}"><span>${m[2]}</span><small>${m[1]}</small></button>`;
 }).join('')+'<button data-more><span>•••</span><small>Más</small></button>';
}
function renderMore(){
 const g=shell.querySelector('.b43-module-grid'); g.innerHTML='';
 modules.filter(x=>!primary.includes(x[0])).forEach(m=>{
   const b=document.createElement('button'); b.className='b43-module-card';
   b.innerHTML=`<b>${m[2]}</b><span><strong>${m[1]}</strong><small>${m[3]}</small></span>`;
   b.onclick=()=>activate(m[0],true); g.appendChild(b);
 });
}
function bind(){
 shell.querySelectorAll('[data-nav]').forEach(b=>b.onclick=()=>activate(b.dataset.nav,true));
 shell.querySelectorAll('[data-more]').forEach(b=>b.onclick=openMore);
 shell.querySelectorAll('[data-close]').forEach(b=>b.onclick=closeSheets);
 shell.querySelector('[data-home]').onclick=()=>activate('dashboard',true);
 shell.querySelector('[data-profile]').onclick=()=>openSheet('profile');
 shell.querySelector('[data-logout]').onclick=()=>document.getElementById('logoutBtn')?.click();
}
function updateHead(id){
 const m=info(id);
 shell.querySelector('.b43-module-icon').textContent=m[2];
 shell.querySelector('.b43-module-head strong').textContent=m[1];
 shell.querySelector('.b43-module-head small').textContent=m[3];
 shell.querySelectorAll('[data-nav]').forEach(b=>b.classList.toggle('active',b.dataset.nav===id));
}
function activate(id,clickNative=true){
 if(!shell||!mobile()) return;
 closeSheets();
 const native=tab(id);
 if(clickNative && native) native.click();
 setTimeout(()=>{
   if(!mobile()) return;
   updateHead(id);
   mount(id);
   activeId=id;
   requestAnimationFrame(()=>window.dispatchEvent(new Event('resize')));
 }, clickNative?80:0);
}
function openMore(){renderMore();openSheet('more')}
function openSheet(name){shell.querySelector(`[data-sheet="${name}"]`)?.classList.add('open');document.body.classList.add('b43-lock')}
function closeSheets(){shell?.querySelectorAll('.b43-sheet.open').forEach(x=>x.classList.remove('open'));document.body.classList.remove('b43-lock')}
function destroy(){
 if(!shell) return;
 restoreAll(); legacy(false); shell.remove(); shell=null; booted=false;
 document.body.classList.remove('b43-lock');
}
function boot(){
 if(!mobile()){destroy();return}
 if(!visibleApp()){setTimeout(boot,250);return}
 if(!shell) build();
}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true}); else boot();
window.addEventListener('resize',()=>setTimeout(boot,150));
new MutationObserver(()=>{if(mobile()&&!shell&&visibleApp())boot()}).observe(document.body,{childList:true,subtree:false});
window.CCFMobileB43={version:'4.3.0',activate,disable:destroy};
})();
