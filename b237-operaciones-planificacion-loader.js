/* FINANZAS B2.37 — OPERACIONES + PLANIFICACIÓN / CARGA CONTROLADA
   Se ejecuta después de una conexión Supabase exitosa.
   Carga B2.17 y B2.16 una sola vez.
   No ejecuta SQL ni modifica/elimina registros.
*/
(() => {
  'use strict';

  const modules = [
    ['b217-centro-operaciones.js?v=b237-safe','b217'],
    ['b216-planificacion-financiera.js?v=b237-safe','b216']
  ];

  function loadOne(src, tag) {
    return new Promise(resolve => {
      if (document.querySelector(`script[data-b237="${tag}"]`)) return resolve(true);
      const s=document.createElement('script');
      s.dataset.b237=tag;
      s.src=src;
      s.async=false;
      s.onload=()=>{ console.log('B2.37 cargado:',tag); resolve(true); };
      s.onerror=()=>{ console.error('B2.37 no pudo cargar:',src); resolve(false); };
      document.body.appendChild(s);
    });
  }

  async function loadModules() {
    const status=document.getElementById('appStatus');
    for(const [src,tag] of modules) {
      const ok=await loadOne(src,tag);
      if(!ok && status) status.textContent=`B2.37: no se pudo cargar ${tag}.`;
    }
    setTimeout(()=>{
      const b=document.querySelector('.tabs button[data-tab="operaciones"]');
      if(b) {
        b.scrollIntoView({behavior:'smooth',block:'nearest'});
        if(status) status.textContent='Operaciones + Planificación integrados de forma controlada.';
      }
    },300);
  }

  function install() {
    const original=window.connect;
    if(typeof original==='function' && !original.__b237Wrapped) {
      const wrapped=async function(...args) {
        const result=await original.apply(this,args);
        setTimeout(()=>{
          const app=document.getElementById('app');
          const panel=document.getElementById('configPanel');
          if(app && panel && panel.classList.contains('hidden') &&
             localStorage.getItem('sf_url') && localStorage.getItem('sf_key')) {
            loadModules();
          }
        },250);
        return result;
      };
      wrapped.__b237Wrapped=true;
      window.connect=wrapped;
    }

    // Si ya existe una sesión local y el núcleo ya está visible.
    setTimeout(()=>{
      const app=document.getElementById('app');
      const panel=document.getElementById('configPanel');
      if(app && panel && panel.classList.contains('hidden') &&
         localStorage.getItem('sf_url') && localStorage.getItem('sf_key')) loadModules();
    },1000);
  }

  if(document.readyState==='loading')
    document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();
})();
