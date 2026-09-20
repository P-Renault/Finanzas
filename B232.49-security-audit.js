/*
 * B232.49.2 · SEGURIDAD CLIENTE · AUDITORÍA
 * Corrección: permite que la inicialización de Supabase termine antes
 * de emitir una alerta por ausencia temporal del cliente.
 *
 * Solo lectura. Sin polling. Sin MutationObserver. Sin escrituras.
 */
(function(){
  'use strict';
  if(window.B23249Security) return;

  var VERSION='232.49.2';
  var lastReport=null;

  function $(id){return document.getElementById(id);}

  function audit(){
    var secureContext=location.protocol==='https:' || location.hostname==='localhost';
    var supabaseOk=!!window.supabaseClient;
    var mixed=[];

    document.querySelectorAll('script[src],link[href],img[src],iframe[src]').forEach(function(el){
      var src=el.src||el.href||'';
      if(/^http:\/\//i.test(src)) mixed.push(src);
    });

    var source=document.documentElement?document.documentElement.outerHTML:'';
    var sensitiveMarkers=[
      'service_role','service-role','SUPABASE_SERVICE_ROLE',
      'PRIVATE_KEY','PRIVATEKEY','SECRET_KEY','SECRETKEY'
    ];
    var sensitiveFound=sensitiveMarkers.filter(function(marker){
      return source.toLowerCase().includes(marker.toLowerCase());
    });

    var errors=0;
    if(!secureContext) errors++;
    if(!supabaseOk) errors++;
    if(mixed.length) errors++;
    if(sensitiveFound.length) errors++;

    var status=errors===0?'SEGURIDAD OK':'ATENCIÓN';
    lastReport={
      version:VERSION,status:status,errors:errors,
      https:secureContext,supabaseClient:supabaseOk,
      mixedContent:mixed,sensitiveMarkers:sensitiveFound,
      timestamp:new Date().toISOString()
    };

    var s=$('b23249-status'),sum=$('b23249-summary'),
        h=$('b23249-https'),sp=$('b23249-supabase'),
        m=$('b23249-mixed'),sec=$('b23249-secret'),d=$('b23249-detail');

    if(s){s.textContent=status;s.style.color=errors===0?'#166534':'#b45309';}
    if(sum)sum.textContent=errors===0
      ?'Configuración cliente sin hallazgos críticos en la auditoría.'
      :errors+' incidencia(s) detectada(s).';
    if(h)h.textContent=secureContext?'OK':'NO SEGURO';
    if(sp)sp.textContent=supabaseOk?'CLIENTE OK':'NO DISPONIBLE';
    if(m)m.textContent=String(mixed.length);
    if(sec)sec.textContent=String(sensitiveFound.length);

    if(d){
      if(errors===0){
        d.textContent='HTTPS, cliente Supabase, recursos externos y ausencia de credenciales sensibles explícitas verificados.';
      }else{
        var parts=[];
        if(!secureContext)parts.push('La página no está en HTTPS');
        if(!supabaseOk)parts.push('Cliente Supabase no disponible');
        if(mixed.length)parts.push('Recursos HTTP: '+mixed.length);
        if(sensitiveFound.length)parts.push('Marcadores sensibles: '+sensitiveFound.join(', '));
        d.textContent=parts.join(' · ');
      }
    }
    return lastReport;
  }

  window.B23249Security={version:VERSION,run:audit,getLastReport:function(){return lastReport;}};

  document.addEventListener('DOMContentLoaded',function(){
    var btn=$('b23249-run');
    if(btn){
      btn.addEventListener('click',function(e){
        e.preventDefault();e.stopPropagation();audit();
      });
    }
    audit();
    // Única revalidación posterior para evitar falso negativo por orden de carga.
    setTimeout(audit,1800);
  },{once:true});
})();
