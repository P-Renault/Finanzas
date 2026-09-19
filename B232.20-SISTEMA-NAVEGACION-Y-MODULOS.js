/* ============================================================
   FINANZAS — B232.20 · SISTEMA DE NAVEGACIÓN Y MÓDULOS
   Objetivos:
   - Reparar botones creados dinámicamente después de app.js.
   - Integrar Motor Multifuente y Control de Jornada al menú principal.
   - Mantener una sola ruta de navegación, sin capture/stopImmediatePropagation.
   - Garantizar que cada módulo dinámico tenga su sección visible.
   - No tocar datos ni Supabase.
   ============================================================ */
(() => {
  'use strict';

  const VERSION = 'B232.20';
  const DYNAMIC = {
    operaciones: 'Operaciones',
    planificacion: 'Planificación',
    ingresos: 'Motor Multifuente',
    jornadas: 'Control de Jornada'
  };

  const CORE = new Set([
    'dashboard','movimientos','futuros','calendario','ahorro','deudas','cuentas'
  ]);

  const $ = id => document.getElementById(id);

  function tabs(){
    return document.querySelector('.tabs');
  }

  function app(){
    return $('app');
  }

  function ensureButton(id,label){
    const t=tabs();
    if(!t)return null;

    let b=t.querySelector(`button[data-tab="${id}"]`);
    if(!b){
      b=document.createElement('button');
      b.type='button';
      b.dataset.tab=id;
      b.textContent=label;
      t.appendChild(b);
    }

    b.classList.remove('b232-hidden');
    b.hidden=false;
    b.style.removeProperty('display');
    b.setAttribute('aria-label',label);
    return b;
  }

  function ensureSection(id){
    const root=app();
    if(!root)return null;

    let s=$(id);
    if(s)return s;

    s=document.createElement('section');
    s.id=id;
    s.className='tab hidden';
    s.innerHTML=`<div class="card"><p class="status">Cargando módulo ${id}…</p></div>`;
    root.appendChild(s);
    return s;
  }

  function activate(id){
    const section=$(id);
    const t=tabs();
    if(!section || !t)return false;

    document.querySelectorAll('.tab').forEach(s=>{
      s.classList.toggle('hidden',s.id!==id);
    });

    t.querySelectorAll('button[data-tab]').forEach(b=>{
      b.classList.toggle('active',b.dataset.tab===id);
    });

    try{
      if(id==='operaciones' && typeof window.loadOps==='function')
        window.loadOps();
      if(id==='ingresos' && typeof window.loadIncome==='function')
        window.loadIncome();
      if(id==='jornadas' && typeof window.loadJornadas==='function')
        window.loadJornadas();
      if(id==='planificacion' && typeof window.fin216Plan==='function')
        window.fin216Plan();
    }catch(error){
      console.error('[B232.20] Error cargando '+id,error);
    }

    if(id==='calendario' && window.B232Calendario?.load){
      setTimeout(()=>window.B232Calendario.load().catch(console.error),0);
    }

    localStorage.setItem('cf_active_tab_v2',id);
    return true;
  }

  function install(){
    const t=tabs();
    if(!t)return false;

    Object.entries(DYNAMIC).forEach(([id,label])=>{
      ensureButton(id,label);
      ensureSection(id);
    });

    /*
      Navegación delegada SOLO para módulos dinámicos.
      Los módulos core siguen utilizando el handler original de app.js.
      Esto evita el fallo producido porque operaciones/planificación y
      los nuevos módulos se crean después de que app.js enlaza los onclick.
    */
    if(t.dataset.b23220Delegated!=='1'){
      t.dataset.b23220Delegated='1';
      t.addEventListener('click',event=>{
        const b=event.target.closest('button[data-tab]');
        if(!b || !t.contains(b))return;
        const id=b.dataset.tab;
        if(!Object.prototype.hasOwnProperty.call(DYNAMIC,id))return;
        event.preventDefault();
        event.stopPropagation();
        activate(id);
      },false);
    }

    /* Mantener visibles los cuatro módulos en el menú principal. */
    Object.keys(DYNAMIC).forEach(id=>{
      const b=t.querySelector(`button[data-tab="${id}"]`);
      if(b){
        b.classList.remove('b232-hidden');
        b.hidden=false;
        b.style.display='inline-flex';
      }
    });

    /* Compatibilidad con el menú Más existente: sus botones siguen
       funcionando, pero ya no son la única vía de acceso. */
    document.querySelectorAll('[data-b219-open]').forEach(b=>{
      if(b.dataset.b23220Bridge==='1')return;
      b.dataset.b23220Bridge='1';
      b.addEventListener('click',event=>{
        const id=b.dataset.b219Open;
        if(!DYNAMIC[id])return;
        event.preventDefault();
        event.stopPropagation();
        activate(id);
        const menu=$('b219Menu');
        const btn=$('b219MenuBtn');
        menu?.classList.remove('open');
        btn?.classList.remove('open');
        btn?.setAttribute('aria-expanded','false');
      },true);
    });

    window.B232SistemaNavegacion={
      version:VERSION,
      activate,
      install
    };

    return true;
  }

  function boot(){
    if(install())return;
    let n=0;
    const timer=setInterval(()=>{
      n++;
      if(install() || n>=100)clearInterval(timer);
    },100);
  }

  if(document.readyState==='loading')
    document.addEventListener('DOMContentLoaded',boot,{once:true});
  else
    boot();
})();
