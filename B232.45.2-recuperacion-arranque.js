/* B232.45.2 — RECUPERACIÓN DEL ARRANQUE FINANCIERO
   Corrige el arranque cuando el shell está visible pero el cliente Supabase
   aún no fue inicializado. No modifica app.js ni los motores financieros.
*/
(() => {
  'use strict';
  const VERSION='232.45.2';
  if(window.B232452Recovery?.version===VERSION)return;

  const $=id=>document.getElementById(id);

  function ensureClient(){
    if(window.supabaseClient)return true;
    if(!window.supabase?.createClient)return false;

    const url=localStorage.getItem('sf_url');
    const key=localStorage.getItem('sf_key');
    if(!url||!key)return false;

    try{
      window.supabaseClient=window.supabase.createClient(url,key,{
        auth:{persistSession:false,autoRefreshToken:false}
      });
      return true;
    }catch(error){
      console.error('[B232.45.2] No fue posible crear Supabase:',error);
      return false;
    }
  }

  async function refreshExecutive(){
    if(!ensureClient())return {ok:false,reason:'cliente-no-disponible'};

    try{
      if(window.B23235ResumenEjecutivo?.refresh){
        await window.B23235ResumenEjecutivo.refresh();
        return {ok:true,method:'B23235ResumenEjecutivo.refresh'};
      }

      if(window.FinancialSummary?.init){
        await window.FinancialSummary.init();
        return {ok:true,method:'FinancialSummary.init'};
      }

      return {ok:false,reason:'motor-resumen-no-disponible'};
    }catch(error){
      console.error('[B232.45.2] Error recuperando resumen:',error);
      return {ok:false,reason:error?.message||String(error)};
    }
  }

  function updateRecoveryPanel(result){
    const dashboard=$('dashboard');
    if(!dashboard)return;

    let panel=$('b232452Recovery');
    if(!panel){
      panel=document.createElement('section');
      panel.id='b232452Recovery';
      panel.className='panel';
      panel.style.cssText='margin:12px 0;padding:10px 14px;border:1px solid #e5e7eb;border-radius:12px;background:#fff;font-size:12px';
      dashboard.prepend(panel);
    }

    panel.innerHTML=
      '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px">'+
      '<div><div style="font-size:11px;color:#64748b">B232.45.2 · ARRANQUE</div>'+
      '<strong>Recuperación del motor financiero</strong></div>'+
      '<strong>'+(result.ok?'ESTABLE':'PENDIENTE')+'</strong></div>'+
      '<div style="margin-top:7px">'+
      (result.ok
        ? 'Cliente Supabase inicializado y motor financiero actualizado.'
        : 'Esperando disponibilidad del cliente/motor financiero: '+result.reason)+
      '</div>';
  }

  async function run(){
    const result=await refreshExecutive();
    updateRecoveryPanel(result);
    window.B232452Recovery.lastReport={
      version:VERSION,
      timestamp:new Date().toISOString(),
      ...result
    };
    return window.B232452Recovery.lastReport;
  }

  window.B232452Recovery={
    version:VERSION,
    run,
    getLastReport:()=>window.B232452Recovery.lastReport||null
  };

  function boot(){
    // Tres intentos acotados: no hay polling permanente.
    [0,900,2200].forEach(delay=>{
      setTimeout(async()=>{
        const app=$('app');
        if(!app||app.classList.contains('hidden'))return;
        await run();
      },delay);
    });
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',boot,{once:true});
  }else{
    boot();
  }
})();
