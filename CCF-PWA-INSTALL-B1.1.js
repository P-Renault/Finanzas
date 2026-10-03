/* CCF PWA INSTALL — B1.1
   Instalación PWA para Control Financiero.
   No crea APK. No usa Play Store. No toca Supabase ni la autenticación.
*/
(function(){
  'use strict';
  if(window.__CCF_PWA_INSTALL_B11__) return;
  window.__CCF_PWA_INSTALL_B11__=true;

  var SW='/CCF-SERVICE-WORKER-B1.1.js';
  var deferredPrompt=null;
  var installed=false;

  function isStandalone(){
    return window.matchMedia && window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone===true;
  }

  function updateButtons(){
    var buttons=document.querySelectorAll('[data-ccf-install]');
    installed=isStandalone();
    buttons.forEach(function(btn){
      if(installed){
        btn.textContent='Aplicación instalada';
        btn.setAttribute('aria-label','Control Financiero ya está instalado');
        btn.disabled=true;
        btn.classList.add('ccf-install-done');
      }else if(deferredPrompt){
        btn.textContent='Instalar aplicación';
        btn.disabled=false;
        btn.classList.remove('ccf-install-done');
      }else{
        btn.textContent='Instalar aplicación';
        btn.disabled=false;
        btn.classList.remove('ccf-install-done');
      }
    });
  }

  function showManualHelp(){
    var text='Para instalar Control Financiero sin Play Store:\n\nAndroid/Chrome: abre el menú ⋮ del navegador y selecciona “Instalar aplicación” o “Agregar a pantalla principal”.\n\niPhone/iPad: abre el menú Compartir y selecciona “Agregar a inicio”.';
    window.alert(text);
  }

  async function install(){
    if(installed) return;
    if(deferredPrompt){
      var promptEvent=deferredPrompt;
      deferredPrompt=null;
      try{
        await promptEvent.prompt();
        await promptEvent.userChoice;
      }catch(_){/* el navegador puede cancelar el diálogo */}
      updateButtons();
      return;
    }
    showManualHelp();
  }

  function bind(){
    document.querySelectorAll('[data-ccf-install]').forEach(function(btn){
      if(btn.__ccfPwaBound) return;
      btn.__ccfPwaBound=true;
      btn.addEventListener('click',install);
    });
    updateButtons();
  }

  function injectStyle(){
    if(document.getElementById('ccf-pwa-install-style')) return;
    var style=document.createElement('style');
    style.id='ccf-pwa-install-style';
    style.textContent='.ccf-install-done{opacity:.72;cursor:default!important}.ccf-install-done:after{content:" ✓"}';
    document.head.appendChild(style);
  }

  function registerServiceWorker(){
    if(!('serviceWorker' in navigator) || !window.isSecureContext) return;
    window.addEventListener('load',function(){
      navigator.serviceWorker.register(SW,{scope:'/'}).then(function(){
        updateButtons();
      }).catch(function(err){
        console.warn('[CCF PWA] No se pudo registrar el Service Worker:',err);
      });
    },{once:true});
  }

  window.addEventListener('beforeinstallprompt',function(event){
    event.preventDefault();
    deferredPrompt=event;
    updateButtons();
  });

  window.addEventListener('appinstalled',function(){
    deferredPrompt=null;
    installed=true;
    updateButtons();
  });

  function boot(){
    injectStyle();
    registerServiceWorker();
    bind();
    setTimeout(bind,500);
    setTimeout(bind,1500);
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
