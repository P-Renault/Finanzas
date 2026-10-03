/* CCF POST-AUTH UI B1.0
   Puente de transición login -> aplicación.
   FIX puntual B1.0 — elimina la pantalla blanca de transición.
   - Oculta inmediatamente el pie de producto durante el cambio de login a app.
   - Mantiene fondo oscuro mientras el shell móvil termina de montar.
   - Oculta el pie de producto una vez abierta la aplicación.
   - Dispara la inicialización inmediata de la vista Resumen móvil.
   - No modifica autenticación, Supabase ni módulos financieros.
*/
(()=>{
'use strict';
if(window.__CCF_POST_AUTH_UI_B10__)return;
window.__CCF_POST_AUTH_UI_B10__=true;

function installTransitionStyle(){
  if(document.getElementById('ccf-post-auth-transition-style')) return;
  const style=document.createElement('style');
  style.id='ccf-post-auth-transition-style';
  style.textContent=`
    /* El pie de producto no debe quedar solo en pantalla durante login -> app. */
    body:not(.ccf-access-app-ready) #ccf-product-footer{
      display:none!important;
      visibility:hidden!important;
    }
    /* Evita el flash/pantalla blanca mientras el shell móvil termina de montar. */
    body.ccf-access-transition{
      background:#071321!important;
    }
    body.ccf-access-transition #ccf-product-footer{
      display:none!important;
      visibility:hidden!important;
    }
  `;
  document.head.appendChild(style);
}

function hideProductFooter(){
  const ids=['ccf-product-footer'];
  ids.forEach(id=>{
    const el=document.getElementById(id);
    if(el){
      el.style.display='none';
      el.style.visibility='hidden';
      el.setAttribute('aria-hidden','true');
    }
  });
}

function beginTransition(){
  installTransitionStyle();
  document.body?.classList.add('ccf-access-transition');
  hideProductFooter();
}

function appReady(){
  const app=document.getElementById('app');
  if(!app || app.classList.contains('hidden')) return false;

  beginTransition();
  hideProductFooter();

  /* El acceso ya está autorizado: quitar el fondo de transición. */
  document.body.classList.remove('ccf-access-transition');

  /* Aviso explícito al shell móvil para montar Resumen inmediatamente. */
  window.dispatchEvent(new Event('ccf:app-ready'));

  /* Fallback: si el shell ya está creado, refresca su Resumen. */
  if(window.CCFMobileB43 && typeof window.CCFMobileB43.refresh==='function'){
    try{ window.CCFMobileB43.refresh(); }catch(e){}
  }
  return true;
}

function watch(){
  installTransitionStyle();
  beginTransition();

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
