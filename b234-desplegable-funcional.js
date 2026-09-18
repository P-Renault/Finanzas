/* FINANZAS B2.34 — DESPLEGABLE FUNCIONAL, AUTÓNOMO
   Normaliza cualquier navegación previa y deja UNA sola barra.
   No elimina módulos: reutiliza los botones originales y sus handlers.
*/
(function(){
'use strict';
const ITEMS=[
 ['deudas','Deudas','Deudas y cuotas'],
 ['cuentas','Cuentas','Liquidez bancaria'],
 ['operaciones','Operaciones','Situación operativa'],
 ['planificacion','Planificación','Plan financiero'],
 ['ia-financiera','IA Financiera','Análisis financiero'],
 ['ingresos','Motor Multifuente','Generación y cobro'],
 ['jornadas','Control de Jornada','Integración financiera']
];
const PRIMARY=['dashboard','movimientos','futuros','calendario','ahorro'];

function css(){
 if(document.getElementById('b234Style'))return;
 const s=document.createElement('style');s.id='b234Style';
 s.textContent=`
 html,body{max-width:100%;overflow-x:hidden!important}
 #app{max-width:100%;min-width:0!important}
 #b234Nav{display:flex!important;align-items:center!important;gap:7px!important;width:100%!important;margin-bottom:16px!important;position:relative!important;z-index:10000!important}
 #b234Nav>.tabs{display:flex!important;align-items:center!important;flex:1 1 auto!important;min-width:0!important;flex-wrap:nowrap!important;overflow-x:auto!important;overflow-y:visible!important;gap:7px!important;margin:0!important;padding:3px 0 8px!important;scrollbar-width:none!important}
 #b234Nav>.tabs::-webkit-scrollbar{display:none}
 #b234Nav>.tabs>button{flex:0 0 auto!important;white-space:nowrap!important}
 #b234MoreWrap{position:relative!important;flex:0 0 auto!important;z-index:10001!important}
 #b234More{border:0!important;border-radius:10px!important;padding:10px 12px!important;background:#e5e7eb!important;color:#111827!important;font-weight:800!important;white-space:nowrap!important;cursor:pointer!important}
 #b234More.open{background:#111827!important;color:#fff!important}
 #b234Menu{display:none;position:absolute;right:0;top:calc(100% + 6px);width:245px;max-width:calc(100vw - 18px);padding:7px;background:#fff;border:1px solid #dbe2ea;border-radius:14px;box-shadow:0 16px 42px rgba(15,23,42,.22);z-index:999999!important}
 #b234Menu.open{display:block}
 .b234Hide{display:none!important}
 .b234Title{padding:6px 9px 7px;color:#64748b;font-size:10px;font-weight:800;letter-spacing:.05em}
 .b234Item{display:block;width:100%;text-align:left;border:0;background:#fff;border-radius:9px;padding:10px 11px;color:#111827;font-weight:800;cursor:pointer}
 .b234Item:hover{background:#f1f5f9}
 .b234Item small{display:block;color:#64748b;font-weight:500;margin-top:2px}
 .b234Sep{height:1px;background:#e5e7eb;margin:6px 3px}
 @media(max-width:480px){#b234Nav{gap:5px!important}#b234Nav>.tabs{gap:5px!important}#b234More{padding:10px 11px!important}}
 `;
 document.head.appendChild(s);
}

function findTabs(){
 return document.querySelector('.tabs');
}

function normalize(){
 const tabs=findTabs();
 if(!tabs)return false;
 css();

 // Put primary buttons first, then hide every secondary button.
 PRIMARY.forEach(id=>{
   const b=tabs.querySelector(`button[data-tab="${id}"]`);
   if(b)tabs.appendChild(b);
 });
 ITEMS.forEach(([id])=>{
   const b=tabs.querySelector(`button[data-tab="${id}"]`);
   if(b)b.classList.add('b234Hide');
 });

 // Remove known competing presentation shells, but keep the .tabs itself.
 const oldB234=document.getElementById('b234Nav');
 if(oldB234 && oldB234.contains(tabs))return buildMenu(oldB234,tabs);

 ['b314Shell','b219NavShell'].forEach(id=>{
   const old=document.getElementById(id);
   if(old && old.contains(tabs)){
     old.parentNode.insertBefore(tabs,old);
     old.remove();
   }
 });

 const nav=document.createElement('div');
 nav.id='b234Nav';
 const parent=tabs.parentNode;
 parent.insertBefore(nav,tabs);
 nav.appendChild(tabs);
 return buildMenu(nav,tabs);
}

function buildMenu(nav,tabs){
 let wrap=document.getElementById('b234MoreWrap');
 if(!wrap){
   wrap=document.createElement('div');wrap.id='b234MoreWrap';
   wrap.innerHTML='<button id="b234More" type="button" aria-expanded="false">Más ▾</button><div id="b234Menu" role="menu"></div>';
   nav.appendChild(wrap);
 }
 const menu=document.getElementById('b234Menu'),more=document.getElementById('b234More');
 if(menu.dataset.ready==='1')return true;
 menu.dataset.ready='1';menu.replaceChildren();
 const title=document.createElement('div');title.className='b234Title';title.textContent='MÓDULOS DEL SISTEMA';menu.appendChild(title);

 ITEMS.forEach(([id,label,desc],i)=>{
   if(i===5){const sep=document.createElement('div');sep.className='b234Sep';menu.appendChild(sep)}
   const b=document.createElement('button');b.type='button';b.className='b234Item';b.innerHTML=`${label}<small>${desc}</small>`;
   b.addEventListener('click',e=>{
     e.preventDefault();e.stopPropagation();
     const original=tabs.querySelector(`button[data-tab="${id}"]`);
     if(original){
       original.classList.remove('b234Hide');
       original.click();
       original.classList.add('b234Hide');
     }else if(id==='ingresos'||id==='jornadas'){
       // If a legacy module did not expose its button, call B2.19's existing menu.
       const legacy=document.querySelector(`[data-b219-open="${id}"]`);
       if(legacy)legacy.click();
     }
     menu.classList.remove('open');more.classList.remove('open');more.setAttribute('aria-expanded','false');
   });
   menu.appendChild(b);
 });
 more.onclick=e=>{
   e.preventDefault();e.stopPropagation();
   const open=!menu.classList.contains('open');
   menu.classList.toggle('open',open);more.classList.toggle('open',open);more.setAttribute('aria-expanded',String(open));
 };
 if(!document.body.dataset.b234Outside){
   document.body.dataset.b234Outside='1';
   document.addEventListener('click',()=>{
     menu.classList.remove('open');more.classList.remove('open');more.setAttribute('aria-expanded','false');
   });
 }
 return true;
}

// Start late enough to let legacy navigation and B2.31.4 finish.
// Then re-assert once per second so late module insertion cannot break the menu.
let count=0;
const timer=setInterval(()=>{
 count++;
 normalize();
 if(count>=90)clearInterval(timer);
},500);
if(document.readyState!=='loading')setTimeout(normalize,7000);
else document.addEventListener('DOMContentLoaded',()=>setTimeout(normalize,7000),{once:true});
})();
