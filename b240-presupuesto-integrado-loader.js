/* CCF B240 loader — isolated, idempotent, no financial-data writes. */
(function(){
  'use strict';
  if (window.__B240_LOADER__) return;
  window.__B240_LOADER__ = true;

  var ENGINE = 'b240-presupuesto-integrado.js?v=240.1';
  var loaded = false;
  var loading = null;

  function loadEngine(){
    if (window.B240Presupuesto) return Promise.resolve(window.B240Presupuesto);
    if (loading) return loading;
    loading = new Promise(function(resolve,reject){
      var s=document.querySelector('script[data-b240-engine="true"]');
      if(s){
        s.addEventListener('load',function(){loaded=true;resolve(window.B240Presupuesto);},{once:true});
        s.addEventListener('error',reject,{once:true});
        return;
      }
      s=document.createElement('script');
      s.src=ENGINE;
      s.async=false;
      s.dataset.b240Engine='true';
      s.onload=function(){loaded=true;resolve(window.B240Presupuesto);};
      s.onerror=function(){reject(new Error('No se pudo cargar '+ENGINE));};
      document.body.appendChild(s);
    });
    return loading;
  }

  function init(){
    return loadEngine().then(function(api){
      if(api && typeof api.init==='function') return api.init();
      throw new Error('Motor B240 cargado pero sin API init().');
    }).catch(function(err){
      console.error('[B240 loader]',err);
      var host=document.getElementById('b240-presupuesto-integracion-detail') || document.getElementById('b240Categories');
      if(host) host.textContent='Error de carga B240: '+(err.message||err);
      return null;
    });
  }

  function wire(){
    document.addEventListener('click',function(e){
      var tab=e.target.closest && e.target.closest('[data-tab="presupuesto"]');
      if(tab) setTimeout(init,0);
    },true);
    var section=document.getElementById('presupuesto');
    if(section && !section.classList.contains('hidden')) setTimeout(init,0);
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',wire,{once:true});
  else wire();
  window.B240Loader={init:init,isLoaded:function(){return loaded;}};
})();
