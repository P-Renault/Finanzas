/* 
 * B232.48.3 · QA RUNTIME · RESTAURADO
 *
 * Reposición del recurso que estaba referenciado por index.html pero ausente
 * en el repositorio. Solo auditoría de DOM/runtime estático.
 * No escribe Supabase, no modifica datos, no usa polling ni MutationObserver.
 */
(function(){
  'use strict';

  if (window.B23248QA) return;

  var VERSION = '232.48.3';
  var REQUIRED_SECTIONS = [
    'dashboard','movimientos','futuros','calendario','ahorro',
    'deudas','cuentas','operaciones','planificacion'
  ];

  function $(id){ return document.getElementById(id); }

  function uniqueIds(){
    var seen = Object.create(null), duplicates = [];
    document.querySelectorAll('[id]').forEach(function(el){
      var id = String(el.id || '');
      if (!id) return;
      if (seen[id] && duplicates.indexOf(id) === -1) duplicates.push(id);
      seen[id] = true;
    });
    return duplicates;
  }

  function blockedStates(){
    var blocked = [];
    document.querySelectorAll('.tab').forEach(function(el){
      var style = window.getComputedStyle(el);
      var text = String(el.textContent || '').trim();
      if (!el.classList.contains('hidden') && style.display === 'none') {
        blocked.push(el.id || 'seccion-sin-id');
      }
      if (/Calculando estado financiero|Cargando\.\.\.$/.test(text) &&
          !el.classList.contains('hidden')) {
        blocked.push((el.id || 'seccion') + ':estado-prolongado');
      }
    });
    return blocked;
  }

  function requiredSectionReport(){
    var missing = [];
    REQUIRED_SECTIONS.forEach(function(id){
      if (!$(id)) missing.push(id);
    });
    return {total:REQUIRED_SECTIONS.length, present:REQUIRED_SECTIONS.length-missing.length, missing:missing};
  }

  function scriptReport(){
    var required = [
      'B232.49-security-audit.js',
      'B232.51.4-runtime-diagnostics.js',
      'B232.51.2-runtime-hardening.js',
      'B232.51.3-navigation-safe.js'
    ];
    var all = Array.prototype.slice.call(document.scripts || []);
    var srcs = all.map(function(s){ return String(s.src || ''); });
    var missing = required.filter(function(name){
      return !srcs.some(function(src){ return src.indexOf(name) >= 0; });
    });
    return {total:required.length, present:required.length-missing.length, missing:missing};
  }

  function audit(){
    var sec = requiredSectionReport();
    var scr = scriptReport();
    var dup = uniqueIds();
    var blocked = blockedStates();

    var ok = sec.missing.length === 0 &&
             scr.missing.length === 0 &&
             dup.length === 0 &&
             blocked.length === 0;

    var report = {
      version:VERSION,
      status:ok?'AUDITORIA OK':'ATENCION',
      sections:sec,
      scripts:scr,
      duplicateIds:dup,
      blockedStates:blocked,
      timestamp:new Date().toISOString()
    };

    var status=$('b23248-status');
    var summary=$('b23248-summary');
    var sections=$('b23248-sections');
    var scripts=$('b23248-scripts');
    var ids=$('b23248-ids');
    var loading=$('b23248-loading');
    var detail=$('b23248-detail');

    if(status){
      status.textContent=report.status;
      status.style.color=ok?'#166534':'#b45309';
    }
    if(summary){
      summary.textContent=ok
        ? 'Integridad de secciones, scripts críticos, IDs y estados bloqueados verificada.'
        : 'Se detectaron incidencias que requieren revisión.';
    }
    if(sections) sections.textContent=sec.present+'/'+sec.total;
    if(scripts) scripts.textContent=scr.present+'/'+scr.total;
    if(ids) ids.textContent=String(dup.length);
    if(loading) loading.textContent=String(blocked.length);

    if(detail){
      if(ok){
        detail.textContent='QA runtime restaurado y operativo. No modifica datos ni operaciones.';
      }else{
        var parts=[];
        if(sec.missing.length) parts.push('Secciones faltantes: '+sec.missing.join(', '));
        if(scr.missing.length) parts.push('Scripts faltantes: '+scr.missing.join(', '));
        if(dup.length) parts.push('IDs duplicados: '+dup.join(', '));
        if(blocked.length) parts.push('Estados bloqueados: '+blocked.join(', '));
        detail.textContent=parts.join(' · ');
      }
    }

    window.__B23248QAReport = report;
    return report;
  }

  window.B23248QA = {
    version:VERSION,
    run:audit,
    getLastReport:function(){ return window.__B23248QAReport || null; }
  };

  document.addEventListener('DOMContentLoaded',function(){
    var btn=$('b23248-run');
    if(btn){
      btn.addEventListener('click',function(e){
        e.preventDefault();
        e.stopPropagation();
        audit();
      });
    }
    audit();
  },{once:true});

  if(document.readyState !== 'loading') audit();
})();
