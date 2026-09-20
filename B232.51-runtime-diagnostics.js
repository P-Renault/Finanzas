/*
 * B232.51 · DIAGNÓSTICO RUNTIME
 *
 * Captura errores tempranos y tardíos con archivo/línea/columna.
 * No toca Supabase ni operaciones financieras.
 * No usa polling ni MutationObserver.
 */
(function(){
  'use strict';
  if(window.B23251Runtime) return;

  var VERSION='232.51.1';
  var jsErrors=0,rejections=0,last=null;

  function $(id){return document.getElementById(id);}
  function clip(v,n){
    var s='';
    try{s=String(v||'').replace(/\s+/g,' ').trim();}catch(e){s='No disponible';}
    return s.length>n?s.slice(0,n)+'…':s;
  }

  function consumeEarly(){
    var list=Array.isArray(window.__B23251EarlyErrors)
      ?window.__B23251EarlyErrors:[];
    list.forEach(function(e){
      if(e.type==='unhandledrejection')rejections++;
      else jsErrors++;
      last=e;
    });
  }

  consumeEarly();

  window.addEventListener('error',function(e){
    jsErrors++;
    last={
      type:'error',
      message:clip(e.message,220),
      filename:clip(e.filename,180),
      line:Number(e.lineno||0),
      column:Number(e.colno||0),
      stack:e.error&&e.error.stack?clip(e.error.stack,500):''
    };
    render();
  },true);

  window.addEventListener('unhandledrejection',function(e){
    rejections++;
    var r=e.reason;
    last={
      type:'unhandledrejection',
      message:clip(r&&r.message?r.message:r,220),
      filename:'',
      line:0,column:0,
      stack:r&&r.stack?clip(r.stack,500):''
    };
    render();
  },true);

  function render(){
    var total=jsErrors+rejections;
    var s=$('b23250-status'),sum=$('b23250-summary'),
        a=$('b23250-js'),r=$('b23250-rejections'),
        l=$('b23250-last'),f=$('b23250-file'),
        ln=$('b23250-line'),c=$('b23250-column'),
        d=$('b23250-detail');

    if(a)a.textContent=String(jsErrors);
    if(r)r.textContent=String(rejections);
    if(l)l.textContent=last?(last.type==='unhandledrejection'?'Promise rechazada':'Error JS'):'Ninguno';
    if(f)f.textContent=last&&last.filename?last.filename.split('/').pop():'—';
    if(ln)ln.textContent=last&&last.line?String(last.line):'—';
    if(c)c.textContent=last&&last.column?String(last.column):'—';

    if(s){
      s.textContent=total===0?'MONITOR ACTIVO':'ATENCIÓN';
      s.style.color=total===0?'#166534':'#b45309';
    }
    if(sum)sum.textContent=total===0
      ?'Sin errores JavaScript registrados desde la activación del monitor.'
      :total+' evento(s) runtime detectado(s).';

    if(d){
      if(!last)d.textContent='No registra datos financieros ni contenido de formularios.';
      else{
        var msg=clip(last.message,220);
        var loc=last.filename
          ?' · '+last.filename+' : '+(last.line||'?')+':'+(last.column||'?')
          :'';
        d.textContent=msg+loc;
      }
    }
  }

  window.B23251Runtime={
    version:VERSION,
    getReport:function(){
      return {
        version:VERSION,
        jsErrors:jsErrors,
        unhandledRejections:rejections,
        last:last,
        timestamp:new Date().toISOString()
      };
    },
    clear:function(){
      jsErrors=0;rejections=0;last=null;
      if(Array.isArray(window.__B23251EarlyErrors))window.__B23251EarlyErrors.length=0;
      render();
    }
  };

  document.addEventListener('DOMContentLoaded',function(){
    var clear=$('b23250-clear');
    if(clear){
      clear.addEventListener('click',function(e){
        e.preventDefault();e.stopPropagation();
        window.B23251Runtime.clear();
      });
    }
    render();
  },{once:true});
})();
