/* B2.31.2 — REESTRUCTURACIÓN DEL DESPLEGABLE
   Se ejecuta sobre la navegación B2.19 existente.
   No sustituye la navegación ni los módulos: solo reorganiza su presentación. */
(()=>{'use strict';
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const secondary=[
 ['deudas','Deudas','Deudas, cuotas y renegociación'],
 ['cuentas','Cuentas','Cuentas bancarias y saldos'],
 ['operaciones','Operaciones','Centro operativo y liquidez'],
 ['planificacion','Planificación','Plan financiero proyectado'],
 ['ia-financiera','IA Financiera','Análisis financiero con IA'],
 ['ingresos','Motor Multifuente','Generación, cobro y pendientes'],
 ['jornadas','Control de Jornada','Resultado financiero de jornadas']
];
function style(){
 if(document.getElementById('b312MenuStyle'))return;
 const s=document.createElement('style');s.id='b312MenuStyle';s.textContent=`
 html,body{max-width:100%;overflow-x:hidden}
 .b219-nav-shell{max-width:100%;box-sizing:border-box}
 .b219-nav-shell>.tabs{min-width:0;overflow-x:auto;scrollbar-width:none}
 .b219-nav-shell>.tabs::-webkit-scrollbar{display:none}
 .b219-nav-shell>.tabs>button.b312-secondary-hidden{display:none!important}
 #b219Menu{max-width:calc(100vw - 24px);box-sizing:border-box}
 #b219Menu .b312-current{padding:7px 10px;color:#64748b;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.05em}
 #b219Menu .b312-item{display:block;width:100%;text-align:left;border:0;background:#fff;border-radius:9px;padding:11px 12px;font-weight:800;color:#111827}
 #b219Menu .b312-item:hover{background:#f1f5f9}
 #b219Menu .b312-item small{display:block;color:#64748b;font-weight:500;margin-top:2px}
 #b219Menu .b312-divider{height:1px;background:#e5e7eb;margin:6px 4px}
 @media(max-width:520px){.b219-nav-shell{gap:6px}.b219-menu-btn{padding:10px 11px!important}.b219-menu{min-width:250px}}
 `;
 document.head.appendChild(s)
}
function show(id){
 document.querySelectorAll('#app .tab').forEach(s=>s.classList.toggle('hidden',s.id!==id));
 document.querySelectorAll('.tabs button[data-tab]').forEach(b=>b.classList.toggle('active',b.dataset.tab===id));
 const menu=document.getElementById('b219Menu'),btn=document.getElementById('b219MenuBtn');
 menu?.classList.remove('open');btn?.classList.remove('open');btn?.setAttribute('aria-expanded','false');
 if(id==='operaciones'){
   if(typeof window.loadOps==='function')window.loadOps();
 }
 if(id==='planificacion'&&typeof window.fin216Plan==='function')window.fin216Plan();
 if(id==='ingresos'&&typeof window.loadIncome==='function')window.loadIncome();
 if(id==='jornadas'&&typeof window.loadJornadas==='function')window.loadJornadas();
}
function install(){
 const shell=document.getElementById('b219NavShell'),tabs=shell?.querySelector('.tabs'),menu=document.getElementById('b219Menu');
 if(!shell||!tabs||!menu)return false;
 style();
 // Keep the five primary workflows visible.
 const primary=new Set(['dashboard','movimientos','futuros','calendario','ahorro']);
 tabs.querySelectorAll('button[data-tab]').forEach(b=>{
   if(!primary.has(b.dataset.tab))b.classList.add('b312-secondary-hidden');
 });
 // Build secondary menu once.
 if(menu.dataset.b312Installed!=='1'){
   const current=menu.innerHTML;
   menu.innerHTML='<div class="b312-current">Módulos del sistema</div>';
   secondary.forEach((item,i)=>{
     if(i===5){const hr=document.createElement('div');hr.className='b312-divider';menu.appendChild(hr)}
     const b=document.createElement('button');b.type='button';b.className='b312-item';b.dataset.b312Tab=item[0];
     b.innerHTML=`${item[1]}<small>${item[2]}</small>`;
     menu.appendChild(b);
   });
   menu.dataset.b312Installed='1';
   menu.addEventListener('click',e=>{
     const b=e.target.closest('[data-b312-tab]');if(!b)return;
     e.preventDefault();e.stopPropagation();show(b.dataset.b312Tab);
   },true);
 }
 // IA is created asynchronously by B2.27. No visible tab is needed.
 return true;
}
async function boot(){
 for(const ms of [0,700,1400,2500,4000]){
   if(ms)await wait(ms);
   install();
 }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>boot(),{once:true});else boot();
})();