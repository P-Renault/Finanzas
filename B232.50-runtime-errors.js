/*
 * B232.50 · ERRORES RUNTIME
 *
 * Monitor aislado de errores JavaScript y unhandledrejection.
 * No intercepta operaciones financieras.
 * No modifica Supabase.
 * No escribe datos.
 * No usa polling.
 * No usa MutationObserver.
 * No captura valores de formularios ni payloads.
 */
(function(){
  'use strict';

  if(window.B23250RuntimeErrors) return;

  var VERSION='232.50.1';
  var jsErrors=0;
  var rejections=0;
  var lastEvent='Ninguno';
  var lastMessage='';
  var MAX_MESSAGE=180;

  function $(id){return document.getElementById(id);}

  function safeMessage(value){
    var s='';
    try{
      if(value && value.message) s=String(value.message);
      else s=String(value || '');
    }catch(e){s='Evento no serializable';}
    s=s.replace(/\s+/g,' ').trim();
    return s.length>MAX_MESSAGE?s.slice(0,MAX_MESSAGE)+'…':s;
  }

  function render(){
    var jsEl=$('b23250-js');
    var rejEl=$('b23250-rejections');
    var lastEl=$('b23250-last');
    var detail=$('b23250-detail');
    var status=$('b23250-status');
    var summary=$('b23250-summary');

    if(jsEl)jsEl.textContent=String(jsErrors);
    if(rejEl)rejEl.textContent=String(rejections);
    if(lastEl)lastEl.textContent=lastEvent;

    var total=jsErrors+rejections;
    if(status){
      status.textContent=total===0?'MONITOR ACTIVO':'ATENCIÓN';
      status.style.color=total===0?'#166534':'#b45309';
    }
    if(summary){
      summary.textContent=total===0
        ?'Sin errores JavaScript registrados desde la activación del monitor.'
        :total+' evento(s) runtime detectado(s).';
    }
    if(detail){
      detail.textContent=lastMessage
        ?'Último evento: '+lastMessage
        :'No registra datos financieros ni contenido de formularios.';
    }
  }

  window.addEventListener('error',function(event){
    jsErrors++;
    lastEvent='Error JS';
    lastMessage=safeMessage(event.error || event.message);
    render();
  });

  window.addEventListener('unhandledrejection',function(event){
    rejections++;
    lastEvent='Promise rechazada';
    lastMessage=safeMessage(event.reason);
    render();
  });

  window.B23250RuntimeErrors={
    version:VERSION,
    getReport:function(){
      return {
        version:VERSION,
        jsErrors:jsErrors,
        unhandledRejections:rejections,
        lastEvent:lastEvent,
        lastMessage:lastMessage,
        timestamp:new Date().toISOString()
      };
    },
    clear:function(){
      jsErrors=0;
      rejections=0;
      lastEvent='Ninguno';
      lastMessage='';
      render();
    }
  };

  document.addEventListener('DOMContentLoaded',function(){
    var clear=$('b23250-clear');
    if(clear){
      clear.addEventListener('click',function(e){
        e.preventDefault();
        e.stopPropagation();
        window.B23250RuntimeErrors.clear();
      });
    }
    render();
  },{once:true});
})();
