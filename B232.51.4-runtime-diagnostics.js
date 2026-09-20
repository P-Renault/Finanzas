/*
 * B232.51.4 · DIAGNÓSTICO RUNTIME DEFINITIVO
 *
 * Separa:
 * - excepciones JavaScript;
 * - promesas rechazadas;
 * - errores de carga de recursos.
 *
 * No toca Supabase, cálculos financieros ni operaciones.
 * No usa polling ni MutationObserver.
 */
(function(){
  'use strict';

  if(window.B232514Runtime) return;

  var VERSION='232.51.4';
  var jsErrors=0, rejections=0, resourceErrors=0, events=0, last=null;
  var MAX=1200;

  function $(id){return document.getElementById(id);}
  function clip(value,n){
    var s='';
    try{s=String(value==null?'':value).replace(/\s+/g,' ').trim();}
    catch(e){s='No disponible';}
    return s.length>n?s.slice(0,n)+'…':s;
  }
  function isResourceTarget(target){
    if(!target || !target.tagName) return false;
    return ['script','link','img','iframe','audio','video','source','object','embed','track','input']
      .indexOf(String(target.tagName).toLowerCase())>=0;
  }
  function resourceUrl(target){
    if(!target) return '';
    try{return String(target.src||target.href||target.currentSrc||target.data||'');}
    catch(e){return '';}
  }
  function classifyError(event){
    var target=event&&event.target;
    var resource=isResourceTarget(target);
    var hasRuntimeData=!!(event&&(event.error||event.filename||event.lineno||event.colno||event.message));
    return resource&&!hasRuntimeData?'resource':'js';
  }
  function register(item){
    if(!item) return;
    events++;
    if(events>MAX) return;
    if(item.type==='unhandledrejection') rejections++;
    else if(item.type==='resource') resourceErrors++;
    else jsErrors++;
    last=item;
    render();
  }
  function consumeEarly(){
    var list=Array.isArray(window.__B23251EarlyErrors)?window.__B23251EarlyErrors:[];
    list.forEach(function(e){
      register({
        type:e.type==='unhandledrejection'?'unhandledrejection':(e.type==='resource'?'resource':'js'),
        message:clip(e.message,260),
        filename:clip(e.filename,220),
        line:Number(e.line||0),
        column:Number(e.column||0),
        resourceUrl:clip(e.resourceUrl,320),
        tag:clip(e.tag,40),
        stack:clip(e.stack,900)
      });
    });
    if(Array.isArray(window.__B23251EarlyErrors)) window.__B23251EarlyErrors.length=0;
  }
  function render(){
    var total=jsErrors+rejections+resourceErrors;
    var status=$('b23250-status'), summary=$('b23250-summary'),
        js=$('b23250-js'), rej=$('b23250-rejections'),
        resource=$('b23250-resource'), lastEl=$('b23250-last'),
        file=$('b23250-file'), line=$('b23250-line'),
        column=$('b23250-column'), detail=$('b23250-detail');
    if(js) js.textContent=String(jsErrors);
    if(rej) rej.textContent=String(rejections);
    if(resource) resource.textContent=String(resourceErrors);
    if(lastEl){
      lastEl.textContent=last
        ?(last.type==='unhandledrejection'?'Promise rechazada':(last.type==='resource'?'Recurso':'Error JS'))
        :'Ninguno';
    }
    if(file){
      var name=last&&last.filename
        ?last.filename.split('/').pop()
        :(last&&last.resourceUrl?last.resourceUrl.split('/').pop().split('?')[0]:'—');
      file.textContent=clip(name,120);
    }
    if(line) line.textContent=last&&last.line?String(last.line):'—';
    if(column) column.textContent=last&&last.column?String(last.column):'—';
    if(status){
      status.textContent=total===0?'MONITOR ACTIVO':'ATENCIÓN';
      status.style.color=total===0?'#166534':'#b45309';
    }
    if(summary){
      summary.textContent=total===0
        ?'Sin excepciones, promesas rechazadas ni errores de carga registrados.'
        :(total+' evento(s): '+jsErrors+' JS · '+rejections+' promesas · '+resourceErrors+' recursos.');
    }
    if(detail){
      if(!last){
        detail.textContent='Instrumentación B232.51.4 activa. No modifica datos financieros.';
      }else if(last.type==='resource'){
        detail.textContent='Carga fallida: '+(last.resourceUrl||last.filename||'recurso desconocido')+
          (last.tag?' · <'+last.tag+'>':'');
      }else{
        var msg=clip(last.message||'Error sin mensaje',300);
        var loc=last.filename?' · '+last.filename+' : '+(last.line||'?')+':'+(last.column||'?'):'';
        detail.textContent=msg+loc;
      }
    }
  }
  window.addEventListener('error',function(event){
    register({
      type:classifyError(event),
      message:clip(event&&(event.message||(event.error&&event.error.message)),260),
      filename:clip(event&&event.filename,220),
      line:Number(event&&event.lineno||0),
      column:Number(event&&event.colno||0),
      resourceUrl:clip(resourceUrl(event&&event.target),320),
      tag:event&&event.target&&event.target.tagName?String(event.target.tagName).toLowerCase():'',
      stack:event&&event.error&&event.error.stack?clip(event.error.stack,900):''
    });
  },true);
  window.addEventListener('unhandledrejection',function(event){
    var reason=event&&event.reason;
    register({
      type:'unhandledrejection',
      message:clip(reason&&reason.message?reason.message:reason,260),
      filename:clip(reason&&(reason.fileName||reason.filename),220),
      line:Number(reason&&(reason.lineNumber||reason.lineno)||0),
      column:Number(reason&&(reason.columnNumber||reason.colno)||0),
      resourceUrl:'', tag:'',
      stack:reason&&reason.stack?clip(reason.stack,900):''
    });
  },true);
  window.B232514Runtime={
    version:VERSION,
    getReport:function(){
      return {version:VERSION,jsErrors:jsErrors,unhandledRejections:rejections,
        resourceErrors:resourceErrors,events:events,last:last,timestamp:new Date().toISOString()};
    },
    clear:function(){
      jsErrors=0;rejections=0;resourceErrors=0;events=0;last=null;
      if(Array.isArray(window.__B23251EarlyErrors)) window.__B23251EarlyErrors.length=0;
      render();
    },
    render:render
  };
  document.addEventListener('DOMContentLoaded',function(){
    var clear=$('b23250-clear');
    if(clear) clear.addEventListener('click',function(e){
      e.preventDefault(); e.stopPropagation(); window.B232514Runtime.clear();
    });
    render();
  },{once:true});
  consumeEarly();
  render();
})();
