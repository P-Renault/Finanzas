/*
 * B232.51.3 · NAVEGACIÓN SEGURA
 *
 * Reemplaza únicamente la carga problemática de B219-R6.
 * No carga b219-arquitectura-navegacion.js porque ese módulo asume que
 * #ingresos/#jornadas fueron creados exclusivamente por él y puede lanzar
 * null.value cuando B232.31/B232.40 ya montó esas secciones.
 *
 * Mantiene:
 * - pestañas principales;
 * - menú Más;
 * - Motor Multifuente;
 * - Control de Jornada;
 * - persistencia de pestaña;
 * - navegación compatible con B232.23.
 *
 * No modifica Supabase ni cálculos financieros.
 */
(function(){
'use strict';
if(window.B232513Navigation) return;
var VERSION='232.51.3';
var KEY='cf_active_tab_v2';

function $(id){return document.getElementById(id);}
function valid(id){
  return ['dashboard','movimientos','futuros','calendario','ahorro','deudas',
          'cuentas','operaciones','planificacion','ingresos','jornadas'].indexOf(id)>=0;
}
function navigate(id){
  if(!valid(id)) return false;
  if(window.B23223Navigation && typeof window.B23223Navigation.navigate==='function'){
    window.B23223Navigation.navigate(id);
  }else{
    var target=$(id);
    if(!target) return false;
    document.querySelectorAll('.tab').forEach(function(s){
      s.classList.toggle('hidden',s.id!==id);
    });
    document.querySelectorAll('.tabs button[data-tab]').forEach(function(b){
      b.classList.toggle('active',b.dataset.tab===id);
    });
  }
  localStorage.setItem(KEY,id);
  return true;
}
function addButton(t,id,label){
  var b=t.querySelector('[data-tab="'+id+'"]');
  if(!b){
    b=document.createElement('button');
    b.type='button';
    b.dataset.tab=id;
    b.textContent=label;
    t.appendChild(b);
  }
  return b;
}
function ensureSections(){
  var app=$('app');
  if(!app) return;
  if(!$('ingresos')){
    var i=document.createElement('section');
    i.id='ingresos';i.className='tab hidden';
    i.innerHTML='<div class="card"><h2>Motor Multifuente</h2><p class="muted">Módulo disponible mediante su integración financiera existente.</p></div>';
    app.appendChild(i);
  }
  if(!$('jornadas')){
    var j=document.createElement('section');
    j.id='jornadas';j.className='tab hidden';
    j.innerHTML='<div class="card"><h2>Control de Jornada</h2><p class="muted">Módulo disponible mediante su integración operativa existente.</p></div>';
    app.appendChild(j);
  }
}
function installMenu(){
  var t=document.querySelector('.tabs');
  if(!t || $('b232513MenuWrap')) return;
  var shell=document.createElement('div');
  shell.id='b232513NavShell';
  shell.style.cssText='display:flex;align-items:flex-start;gap:8px;margin-bottom:16px;position:relative;z-index:20';
  t.parentNode.insertBefore(shell,t);
  shell.appendChild(t);

  var wrap=document.createElement('div');
  wrap.id='b232513MenuWrap';
  wrap.style.cssText='position:relative;flex:0 0 auto;margin-left:auto';
  wrap.innerHTML='<button type="button" id="b232513MenuBtn" style="border:0;border-radius:10px;padding:10px 13px;background:#e5e7eb;color:#111827;font-weight:700">Más ▾</button>'+
    '<div id="b232513Menu" style="position:absolute;right:0;top:calc(100% + 7px);z-index:1000;min-width:235px;background:#fff;border:1px solid #dbe2ea;border-radius:14px;box-shadow:0 12px 30px rgba(15,23,42,.16);padding:7px;display:none">'+
    '<button type="button" data-open="ingresos" style="display:block;width:100%;text-align:left;border:0;background:#fff;border-radius:9px;padding:11px 12px;font-weight:700">Motor Multifuente</button>'+
    '<button type="button" data-open="jornadas" style="display:block;width:100%;text-align:left;border:0;background:#fff;border-radius:9px;padding:11px 12px;font-weight:700">Control de Jornada</button>'+
    '</div>';
  shell.appendChild(wrap);

  var btn=$('b232513MenuBtn'),menu=$('b232513Menu');
  btn.addEventListener('click',function(e){
    e.stopPropagation();
    var open=menu.style.display!=='block';
    menu.style.display=open?'block':'none';
  });
  menu.addEventListener('click',function(e){
    var b=e.target.closest('[data-open]');
    if(!b) return;
    navigate(b.dataset.open);
    menu.style.display='none';
  });
  document.addEventListener('click',function(){
    if(menu) menu.style.display='none';
  });
}
function install(){
  ensureSections();
  var t=document.querySelector('.tabs');
  if(!t) return false;
  addButton(t,'operaciones','Operaciones');
  addButton(t,'planificacion','Planificación');
  var saved=localStorage.getItem(KEY);
  if(saved && valid(saved) && $(saved)) navigate(saved);
  installMenu();
  return true;
}
function boot(){
  if(install()) return;
  setTimeout(install,400);
  setTimeout(install,900);
  setTimeout(install,1800);
}
window.B232513Navigation={version:VERSION,install:install,navigate:navigate};
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true});
else boot();
})();
