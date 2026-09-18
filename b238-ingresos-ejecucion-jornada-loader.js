/* FINANZAS B2.38 — INGRESOS + EJECUCIÓN + PUENTE DE JORNADA
   Carga controlada después de conexión.
   - Motor Multifuente existente B2.17
   - Motor de Ejecución Financiera B2.20
   - Puente Control de Jornada B2.18
   No SQL. No borrado. No duplica el detalle operacional de Jornada.
*/
(() => {
  'use strict';

  function load(src, tag) {
    return new Promise(resolve => {
      if(document.querySelector(`script[data-b238="${tag}"]`)) return resolve(true);
      const s=document.createElement('script');
      s.dataset.b238=tag;
      s.src=src;
      s.async=false;
      s.onload=()=>{console.log('B2.38 cargado:',tag);resolve(true)};
      s.onerror=()=>{console.error('B2.38 no pudo cargar:',src);resolve(false)};
      document.body.appendChild(s);
    });
  }

  function ensureJornadaShell() {
    const tabs=document.querySelector('.tabs'), app=document.getElementById('app');
    if(!tabs || !app) return false;
    let b=tabs.querySelector('[data-tab="jornadas"]');
    if(!b){
      b=document.createElement('button');
      b.type='button'; b.dataset.tab='jornadas'; b.textContent='Control de Jornada';
      tabs.appendChild(b);
    }
    let s=document.getElementById('jornadas');
    if(!s){
      s=document.createElement('section');
      s.id='jornadas'; s.className='tab hidden';
      s.innerHTML='<div class="card"><span class="muted">B2.18 · PUENTE FINANCIERO</span><h2>Control de Jornada</h2><p class="muted">El detalle operacional permanece en Control de Jornada. Finanzas recibe solamente el resultado financiero.</p><div id="b218JornadasRoot"></div></div>';
      app.appendChild(s);
    }
    b.onclick=()=>{
      document.querySelectorAll('.tabs button').forEach(x=>x.classList.remove('active'));
      b.classList.add('active');
      document.querySelectorAll('.tab').forEach(x=>x.classList.add('hidden'));
      s.classList.remove('hidden');
    };
    return true;
  }

  async function loadModules() {
    const status=document.getElementById('appStatus');
    ensureJornadaShell();

    const results=[];
    results.push(await load('b218-motor-ingresos.js?v=b238-safe','income'));
    results.push(await load('b220-motor-ejecucion-financiera.js?v=b238-safe','execution'));
    results.push(await load('b218-jornadas.js?v=b238-safe','jornada'));

    setTimeout(()=>{
      if(status) status.textContent =
        results.every(Boolean)
          ? 'Motor Multifuente + Ejecución + puente de Jornada integrados.'
          : 'B2.38: uno o más módulos no pudieron cargarse.';
    },500);
  }

  function maybeLoad() {
    const app=document.getElementById('app'), panel=document.getElementById('configPanel');
    if(app && panel && panel.classList.contains('hidden') &&
       localStorage.getItem('sf_url') && localStorage.getItem('sf_key')) {
      loadModules();
    }
  }

  function install() {
    const original=window.connect;
    if(typeof original==='function' && !original.__b238Wrapped) {
      const wrapped=async function(...args){
        const result=await original.apply(this,args);
        setTimeout(maybeLoad,250);
        return result;
      };
      wrapped.__b238Wrapped=true;
      window.connect=wrapped;
    }
    setTimeout(maybeLoad,1000);
  }

  if(document.readyState==='loading')
    document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();
})();
