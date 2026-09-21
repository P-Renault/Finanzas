/* B232.54 · MENÚ PRINCIPAL
   Promueve Motor Multifuente y Control de Jornada al panel principal.
   Elimina el menú "Más" sin modificar la lógica financiera ni el router.
*/
(function(){
  'use strict';
  if(window.__B23254_MENU_PRINCIPAL__) return;
  window.__B23254_MENU_PRINCIPAL__=true;

  function $id(id){ return document.getElementById(id); }
  function addButton(t,id,label){
    var b=t.querySelector('button[data-tab="'+id+'"]');
    if(!b){
      b=document.createElement('button');
      b.type='button';
      b.dataset.tab=id;
      b.textContent=label;
      t.appendChild(b);
    }
    return b;
  }
  function promote(){
    var t=document.querySelector('.tabs');
    if(!t) return false;

    // Elimina el contenedor "Más" generado por B2.19/B219.
    var menu=$id('b219MenuWrap');
    if(menu) menu.remove();

    addButton(t,'ingresos','Motor Multifuente');
    addButton(t,'jornadas','Control de Jornada');

    // Orden final solicitado por el panel principal.
    var order=['dashboard','movimientos','futuros','calendario','ahorro','deudas','cuentas','operaciones','planificacion','ingresos','jornadas'];
    order.forEach(function(id){
      var b=t.querySelector('button[data-tab="'+id+'"]');
      if(b) t.appendChild(b);
    });

    // Elimina cualquier otro botón "Más" residual.
    t.querySelectorAll('button').forEach(function(b){
      if(!b.dataset.tab && /^(más|mas)\b/i.test((b.textContent||'').trim())) b.remove();
    });

    return true;
  }

  function ensureB219ThenPromote(){
    if(typeof window.b219Show==='function'){
      promote();
      return;
    }
    var src='b219-arquitectura-navegacion.js?v=232.54';
    if(!document.querySelector('script[data-b23254-b219]')){
      var s=document.createElement('script');
      s.src=src;
      s.async=false;
      s.dataset.b23254B219='1';
      s.onload=function(){
        [0,150,400,800].forEach(function(ms){setTimeout(promote,ms);});
      };
      s.onerror=function(){console.error('[B232.54] No se pudo cargar el módulo de navegación B2.19.');};
      document.body.appendChild(s);
    }
    [0,150,400,800,1500,2500].forEach(function(ms){setTimeout(promote,ms);});
  }

  function boot(){
    ensureB219ThenPromote();
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
