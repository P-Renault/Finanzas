/* B232.54.1 · MENÚ PRINCIPAL — CORRECCIÓN FINAL
   - Elimina completamente los contenedores "Más" de B219 y B232.51.3.
   - Promueve Motor Multifuente y Control de Jornada al menú principal.
   - Elimina los placeholders creados por B232.51.3 para permitir que B219
     monte sus vistas reales.
   - No modifica lógica financiera, Supabase ni cálculos.
*/
(function(){
  'use strict';
  if(window.__B232541_MENU_PRINCIPAL__) return;
  window.__B232541_MENU_PRINCIPAL__=true;

  function id(x){ return document.getElementById(x); }
  function tabs(){ return document.querySelector('.tabs'); }

  function removeMenus(){
    ['b219MenuWrap','b232513MenuWrap','b219NavShell','b232513NavShell'].forEach(function(x){
      var n=id(x);
      if(n) n.remove();
    });
    document.querySelectorAll('.b219-menu-wrap,.b219-menu-btn,.b219-menu,#b219MenuBtn,#b219Menu,#b232513MenuBtn,#b232513Menu').forEach(function(n){
      if(n && n.closest('.tabs')===null) {
        var p=n.closest('.b219-menu-wrap');
        if(p) p.remove();
      }
    });
    var t=tabs();
    if(t){
      t.querySelectorAll('button').forEach(function(b){
        var txt=(b.textContent||'').trim().toLowerCase();
        if(!b.dataset.tab && /^(más|mas)\b/.test(txt)) b.remove();
      });
    }
  }

  function isPlaceholder(section){
    if(!section) return false;
    var text=(section.textContent||'').replace(/\s+/g,' ').trim();
    return (
      text==='Motor Multifuente Módulo disponible mediante su integración financiera existente.' ||
      text==='Control de Jornada Módulo disponible mediante su integración operativa existente.'
    );
  }

  function removePlaceholders(){
    ['ingresos','jornadas'].forEach(function(x){
      var s=id(x);
      if(isPlaceholder(s)) s.remove();
    });
  }

  function addButton(t,tab,label){
    var b=t.querySelector('button[data-tab="'+tab+'"]');
    if(!b){
      b=document.createElement('button');
      b.type='button';
      b.dataset.tab=tab;
      b.textContent=label;
      t.appendChild(b);
    }
    return b;
  }

  function promote(){
    var t=tabs();
    if(!t) return false;
    removeMenus();
    removePlaceholders();
    addButton(t,'ingresos','Motor Multifuente');
    addButton(t,'jornadas','Control de Jornada');
    var order=['dashboard','movimientos','futuros','calendario','ahorro','deudas','cuentas','operaciones','planificacion','ingresos','jornadas'];
    order.forEach(function(tab){
      var b=t.querySelector('button[data-tab="'+tab+'"]');
      if(b) t.appendChild(b);
    });
    return true;
  }

  function loadB219(){
    if(typeof window.b219Show==='function') return;
    var existing=document.querySelector('script[data-b232541-b219]');
    if(existing) return;
    var s=document.createElement('script');
    s.src='b219-arquitectura-navegacion.js?v=232.54.1';
    s.async=false;
    s.dataset.b232541B219='1';
    s.onload=function(){
      [0,150,400,800,1400,2200].forEach(function(ms){
        setTimeout(function(){ removePlaceholders(); promote(); },ms);
      });
    };
    s.onerror=function(){
      console.error('[B232.54.1] No se pudo cargar b219-arquitectura-navegacion.js');
    };
    document.body.appendChild(s);
  }

  function boot(){
    promote();
    loadB219();
    [0,150,400,800,1400,2200,3200].forEach(function(ms){
      setTimeout(function(){ removePlaceholders(); promote(); },ms);
    });
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',boot,{once:true});
  }else{
    boot();
  }
})();
