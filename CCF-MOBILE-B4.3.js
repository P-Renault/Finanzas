/* CCF MOBILE B4.3.0 — ADAPTACIÓN MÓVIL INTEGRAL
   Producción-b.2
   - Presentación móvil sobre los módulos REALES del sistema.
   - No crea clientes Supabase, no altera SQL/RLS/auth ni definiciones.
   - No duplica datos ni motores: monta el DOM real de cada módulo.
   - Desktop (>720px) permanece en su estructura original.
*/
(function(){
'use strict';
if(window.__CCF_MOBILE_B43_REBUILT__) return;
window.__CCF_MOBILE_B43_REBUILT__=true;

const BP=720;
const PRIMARY=[['dashboard','Resumen','⌂'],['movimientos','Movimientos','↕'],['deudas','Deudas','▣'],['cuentas','Cuentas','▤']];
const META={
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
 ingresos:['Motor Multifuente','Generación y control de ingresos','↗'],
 jornadas:['Control de Jornada','Resultado financiero integrado','◷'],
 'ia-financiera':['IA Financiera','Análisis y recomendaciones','✦']
};
let built=false, current='dashboard', mounted=null, resizeTimer=0, navTimer=0;
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const app=()=>$('#app');
const mobile=()=>window.matchMedia('(max-width:'+BP+'px)').matches;
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const tabs=()=>$$('.tabs button[data-tab]');
const tab=id=>$('.tabs button[data-tab="'+CSS.escape(id)+'"]');
function ready(){return mobile()&&app()&&!app().classList.contains('hidden')}
function meta(id){
 if(META[id]) return META[id];
 const b=tab(id); const label=b?.textContent?.trim()||id;
 return [label,'Módulo financiero','◉'];
}
function active(){return $('.tabs button.active[data-tab]')?.dataset.tab||current||'dashboard'}
function hideDesktopChrome(){
 ['.topbar','.tabs','.ccf-manual-access','#ccf-product-footer'].forEach(s=>$(s)?.classList.add('b43-hidden-desktop-ui'));
}
function showDesktopChrome(){
 $$('.b43-hidden-desktop-ui').forEach(e=>e.classList.remove('b43-hidden-desktop-ui'));
}
function findModule(id){
 let e=document.getElementById(id);
 if(e) return e;
 const b=tab(id);
 if(b){
   const target=b.dataset.target||b.getAttribute('aria-controls');
   if(target) e=document.getElementById(target);
 }
 return e;
}
function saveMount(){
 if(!mounted) return;
 const {el,placeholder}=mounted;
 el.classList.remove('b43-mounted-module','b43-mobile-module');
 el.removeAttribute('data-b43-mounted');
 if(placeholder.parentNode) placeholder.parentNode.insertBefore(el,placeholder.nextSibling);
 placeholder.remove(); mounted=null;
}
function mountModule(id){
 const host=$('.b43-module-host'); if(!host) return false;
 saveMount();
 const el=findModule(id); if(!el) return false;
 const placeholder=document.createComment('CCF B4.3 native module '+id);
 el.parentNode?.insertBefore(placeholder,el);
 el.classList.remove('hidden','b43-native-hidden');
 el.classList.add('b43-mounted-module','b43-mobile-module');
 el.setAttribute('data-b43-mounted','true');
 host.appendChild(el);
 mounted={el,placeholder,id};
 adaptModule(el,id);
 return true;
}
function fireNativeTab(id){
 const b=tab(id); if(!b) return false;
 try{b.click();}catch(e){console.warn('[B4.3] navegación',e)}
 return true;
}
function resolveByLabel(label){
 const n=label.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
 const b=tabs().find(x=>x.textContent.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')===n);
 if(b) return b.dataset.tab;
 const b2=tabs().find(x=>x.textContent.toLowerCase().includes(label.toLowerCase()));
 return b2?.dataset.tab||null;
}
function moduleButtons(){
 return tabs().map(b=>({id:b.dataset.tab,label:b.textContent.trim()})).filter(x=>x.id);
}
function renderMore(){
 const g=$('.b43-module-grid'); if(!g)return;
 g.innerHTML='';
 moduleButtons().filter(x=>!PRIMARY.some(p=>p[0]===x.id)).forEach(x=>{
   const m=meta(x.id), b=document.createElement('button'); b.type='button'; b.className='b43-module';
   b.innerHTML='<b>'+esc(m[2])+'</b><span><strong>'+esc(m[0])+'</strong><small>'+esc(m[1])+'</small></span>';
   b.onclick=()=>navigate(x.id); g.appendChild(b);
 });
 // Motores que se registran dinámicamente y no necesariamente exponen tab propio.
 [['ingresos','Motor Multifuente'],['jornadas','Control de Jornada'],['ia-financiera','IA Financiera']].forEach(x=>{
   if(g.querySelector('[data-module="'+x[0]+'"]')) return;
   if(moduleButtons().some(m=>m.id===x[0])) return;
   const m=meta(x[0]), b=document.createElement('button'); b.type='button'; b.className='b43-module'; b.dataset.module=x[0];
   b.innerHTML='<b>'+esc(m[2])+'</b><span><strong>'+esc(m[0])+'</strong><small>'+esc(m[1])+'</small></span>';
   b.onclick=()=>navigate(x[0]); g.appendChild(b);
 });
}
function build(){
 if(built||!ready()) return;
 built=true;
 const root=document.createElement('div'); root.id='ccf-mobile-b43';
 root.innerHTML=`
 <header class="b43-header">
   <button type="button" class="b43-brand-logo" data-home>CCF</button>
   <div class="b43-brand-copy"><strong>Centro de Control Financiero</strong><small>Tu vida financiera en un solo lugar</small></div>
   <button type="button" class="b43-bell" aria-label="Notificaciones">♧</button>
   <button type="button" class="b43-avatar" data-profile aria-label="Perfil">P</button>
 </header>
 <div class="b43-page-head"><div class="b43-page-icon">⌂</div><div><strong data-page-title>Resumen</strong><small data-page-sub>Vista general e indicadores clave</small></div><button type="button" data-more aria-label="Todos los módulos">•••</button></div>
 <main class="b43-module-host" aria-live="polite"></main>
 <nav class="b43-bottom" aria-label="Navegación principal">${PRIMARY.map(x=>'<button type="button" data-nav="'+x[0]+'"><span>'+x[2]+'</span><small>'+x[1]+'</small></button>').join('')}<button type="button" data-more><span>•••</span><small>Más</small></button></nav>
 <div class="b43-sheet" data-sheet="more"><div class="b43-backdrop"></div><section><div class="b43-handle"></div><header><div><strong>Todos los módulos</strong><small>Accede a cada sección del sistema</small></div><button type="button" data-close>×</button></header><div class="b43-module-grid"></div></section></div>
 <div class="b43-sheet" data-sheet="profile"><div class="b43-backdrop"></div><section><div class="b43-handle"></div><header><div class="b43-profile-avatar">P</div><div><strong>Mi perfil</strong><small>Sesión activa</small></div><button type="button" data-close>×</button></header><div class="b43-profile-email"><span>Estado</span><strong>Sesión autenticada</strong></div><button type="button" class="b43-primary-btn" data-close>Continuar</button><button type="button" class="b43-danger" data-logout>Cerrar sesión</button></section></div>`;
 app().prepend(root);
 $$('[data-nav]',root).forEach(b=>b.onclick=()=>navigate(b.dataset.nav));
 $$('[data-more]',root).forEach(b=>b.onclick=openMore);
 $('[data-home]',root).onclick=()=>navigate('dashboard');
 $('[data-profile]',root).onclick=openProfile;
 $$('[data-close],.b43-backdrop',root).forEach(x=>x.onclick=closeSheets);
 $('[data-logout]',root).onclick=()=>{const b=$('#logoutBtn'); if(b)b.click(); closeSheets();};
 renderMore(); hideDesktopChrome(); navigate(active(),true);
}
function updateHeader(id){
 const m=meta(id),root=$('#ccf-mobile-b43'); if(!root)return;
 $('[data-page-title]',root).textContent=m[0]; $('[data-page-sub]',root).textContent=m[1]; $('.b43-page-icon',root).textContent=m[2];
 $$('[data-nav]',root).forEach(b=>b.classList.toggle('active',b.dataset.nav===id));
}
function navigate(id,silent){
 if(!ready())return;
 current=id||'dashboard'; localStorage.setItem('cf_active_tab_v2',current); updateHeader(current); closeSheets();
 if(current==='ingresos' && !tab('ingresos')) current=resolveByLabel('Motor Multifuente')||'operaciones';
 if(current==='jornadas' && !tab('jornadas')) current=resolveByLabel('Control de Jornada')||'operaciones';
 if(current==='ia-financiera' && !tab('ia-financiera')) current=resolveByLabel('IA Financiera')||'dashboard';
 if(tab(current)) fireNativeTab(current);
 const mountNow=()=>{if(!mountModule(current)){setTimeout(()=>mountModule(current),250);setTimeout(()=>mountModule(current),900);}else adaptModule(mounted.el,current);};
 setTimeout(mountNow,silent?0:50);
 setTimeout(()=>{renderMore();adaptMounted();},350);
}
function openMore(){renderMore();$('.b43-sheet[data-sheet="more"]')?.classList.add('open');document.body.classList.add('b43-modal-lock')}
function openProfile(){$('.b43-sheet[data-sheet="profile"]')?.classList.add('open');document.body.classList.add('b43-modal-lock')}
function closeSheets(){$$('.b43-sheet.open').forEach(x=>x.classList.remove('open'));document.body.classList.remove('b43-modal-lock')}
function adaptModule(el,id){
 if(!el)return;
 el.classList.add('b43-mobile-module','b43-module-'+id);
 // Forms: keep native controls/listeners, only alter presentation.
 $$('form',el).forEach(f=>f.classList.add('b43-mobile-form'));
 $$('input,select,textarea',el).forEach(c=>c.classList.add('b43-mobile-control'));
 $$('button',el).forEach(b=>b.classList.add('b43-mobile-button'));
 $$('canvas,svg,img',el).forEach(g=>g.classList.add('b43-mobile-media'));
 // Tables/lists/charts get responsive wrappers without changing their content.
 $$('table',el).forEach(t=>{t.classList.add('b43-mobile-table'); if(!t.parentElement.classList.contains('b43-table-wrap')){const w=document.createElement('div');w.className='b43-table-wrap';t.parentNode.insertBefore(w,t);w.appendChild(t)}});
 // Native cards become the visual cards of the mobile product.
 $$('.card,.panel,.executive-chart,.b234-card,.b234-kpi,.b225-kpi,.b225-source,.b225-record,.b23252-kpi',el).forEach(c=>c.classList.add('b43-mobile-card'));
 // Prevent legacy desktop fixed/min widths from overflowing the phone.
 $$('*',el).forEach(n=>{if(n instanceof HTMLElement){n.style.removeProperty('min-width'); if(n.scrollWidth>el.clientWidth+24 && !n.matches('table,.calendar-grid,.calendar-scroll,.b43-table-wrap')) n.classList.add('b43-overflow-safe')}});
}
function adaptMounted(){if(mounted?.el)adaptModule(mounted.el,mounted.id)}
function restore(){
 saveMount(); $('#ccf-mobile-b43')?.remove(); showDesktopChrome(); document.body.classList.remove('b43-modal-lock'); built=false; current='dashboard';
}
function boot(){
 if(!mobile()){restore();return;}
 if(!ready()){setTimeout(boot,250);return;}
 build(); hideDesktopChrome();
}
window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(boot,180)});
window.addEventListener('orientationchange',()=>setTimeout(boot,250));
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
window.CCFMobileB43={version:'4.3.0-mobile-integral-native',activate:navigate,disable:restore,refresh:adaptMounted};
})();
