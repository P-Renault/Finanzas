/* FINANZAS — VISIBILIDAD SISTEMA B232.19
   Hace accesibles Motor Multifuente e Control de Jornada sin ocultarlos.
   No intercepta la navegación ni crea un segundo router.
*/
(()=>{
'use strict';
const SPECIAL=[['ingresos','Motor Multifuente'],['jornadas','Control de Jornada']];
function install(){
 const tabs=document.querySelector('.tabs');
 if(!tabs)return false;
 SPECIAL.forEach(([id,label])=>{
   const b=tabs.querySelector(`button[data-tab="${id}"]`);
   if(b){
     b.classList.remove('b232-hidden');
     b.style.display='inline-flex';
     b.setAttribute('aria-label',label);
   }
 });
 const more=document.getElementById('b219MenuWrap');
 if(more) more.setAttribute('aria-label','Más módulos del sistema');
 return true;
}
let n=0; const t=setInterval(()=>{n++; if(install()||n>80)clearInterval(t);},100);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
