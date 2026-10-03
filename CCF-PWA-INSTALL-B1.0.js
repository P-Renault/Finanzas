/* CCF PWA INSTALL B1.0 — instalación móvil sin APK / sin Play Store */
(function(){
  'use strict';
  if(window.__CCF_PWA_INSTALL_B10__) return;
  window.__CCF_PWA_INSTALL_B10__=true;

  var deferredPrompt=null;
  var readyClass='ccf-pwa-ready';

  function buttons(){return Array.prototype.slice.call(document.querySelectorAll('[data-ccf-install]'));}
  function setState(state){
    buttons().forEach(function(btn){
      btn.classList.toggle(readyClass,state==='ready');
      btn.setAttribute('data-install-state',state);
      if(state==='installed'){
        btn.textContent='Aplicación instalada';
        btn.setAttribute('aria-label','La aplicación ya está instalada en este dispositivo');
      }else if(btn.dataset.installLabel){
        btn.textContent=btn.dataset.installLabel;
      }
    });
  }
  function isStandalone(){
    return window.matchMedia && window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone===true;
  }
  function installHelp(){
    var message='Para instalar Control Financiero en este dispositivo, abre el menú del navegador y selecciona “Instalar aplicación” o “Agregar a pantalla de inicio”.';
    if(/iphone|ipad|ipod/i.test(navigator.userAgent||'')){
      message='En iPhone/iPad: abre el menú Compartir de Safari y selecciona “Agregar a pantalla de inicio”.';
    }
    window.alert(message);
  }

  document.addEventListener('click',function(e){
    var btn=e.target.closest && e.target.closest('[data-ccf-install]');
    if(!btn) return;
    e.preventDefault();
    if(isStandalone()){
      setState('installed');
      window.alert('Control Financiero ya está instalado como aplicación en este dispositivo.');
      return;
    }
    if(deferredPrompt){
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(function(choice){
        if(choice && choice.outcome==='accepted') setState('installed');
        deferredPrompt=null;
      }).catch(function(){deferredPrompt=null;});
      return;
    }
    installHelp();
  },true);

  window.addEventListener('beforeinstallprompt',function(e){
    e.preventDefault();
    deferredPrompt=e;
    setState('ready');
    window.__CCF_PWA_INSTALL_AVAILABLE__=true;
  });

  window.addEventListener('appinstalled',function(){
    deferredPrompt=null;
    window.__CCF_PWA_INSTALLED__=true;
    setState('installed');
  });

  function registerSW(){
    if(!('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register('./service-worker.js',{scope:'./'})
      .then(function(reg){window.__CCF_PWA_REGISTRATION__=reg;})
      .catch(function(err){console.warn('[CCF PWA] service worker no registrado',err);});
  }

  function boot(){
    setState(isStandalone()?'installed':'idle');
    // La PWA nunca bloquea el arranque de Supabase ni del sistema.
    window.setTimeout(registerSW,0);
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
