/* CCF POST-AUTH UI B1.0
   Puente de transición login -> aplicación.
   - Oculta el pie de producto Somos Software una vez abierta la aplicación.
   - Dispara la inicialización inmediata de la vista Resumen móvil.
   - No modifica autenticación, Supabase ni módulos financieros.
*/
(()=>{
'use strict';
if(window.__CCF_POST_AUTH_UI_B10__)return;
window.__CCF_POST_AUTH_UI_B10__=true;

function hideProductFooter(){
  const ids=['ccf-product-footer'];
  ids.forEach(id=>{
    const el=document.getElementById(id);
    if(el){
      el.style.display='none';
      el.setAttribute('aria-hidden','true');
    }
  });
}

function appReady(){
  const app=document.getElementById('app');
  if(!app || app.classList.contains('hidden')) return false;

  hideProductFooter();

  /* Aviso explícito al shell móvil para montar Resumen inmediatamente. */
  window.dispatchEvent(new Event('ccf:app-ready'));

  /* Fallback: si el shell ya está creado, refresca su Resumen. */
  if(window.CCFMobileB43 && typeof window.CCFMobileB43.refresh==='function'){
    try{ window.CCFMobileB43.refresh(); }catch(e){}
  }
  return true;
}

function watch(){
  const app=document.getElementById('app');
  if(!app)return;

  if(window.MutationObserver){
    const observer=new MutationObserver(()=>{
      if(!app.classList.contains('hidden'))appReady();
    });
    observer.observe(app,{attributes:true,attributeFilter:['class','style']});
  }
  appReady();

  /* El footer puede ser insertado/rehidratado por otro módulo. */
  if(document.body && window.MutationObserver){
    new MutationObserver(()=>{
      if(!app.classList.contains('hidden'))hideProductFooter();
    }).observe(document.body,{childList:true,subtree:true});
  }
}

if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',watch,{once:true});
}else{
  watch();
}
})();