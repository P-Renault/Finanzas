/* FINANZAS — RECUPERACIÓN DE ACCESO B232.15
   Objetivo: garantizar que el botón Conectar siempre tenga un flujo visible,
   con timeout, diagnóstico y recuperación de la sesión local.
   No modifica datos ni Supabase.
*/
(() => {
  'use strict';

  const VERSION='B232.15';
  const $=id=>document.getElementById(id);
  const wait=ms=>new Promise(r=>setTimeout(r,ms));

  function setStatus(msg, isError=false){
    const box=$('configMsg');
    if(box){
      box.textContent=msg||'';
      box.style.color=isError?'#b91c1c':'';
    }
    const appStatus=$('appStatus');
    if(appStatus) appStatus.textContent=msg||'';
  }

  async function probe(client){
    const result=await Promise.race([
      client.from('movimientos').select('id').limit(1),
      new Promise((_,reject)=>setTimeout(()=>reject(new Error('Tiempo de espera agotado al conectar con Supabase.')),10000))
    ]);
    return result;
  }

  async function connectRecovery(event){
    if(event){
      event.preventDefault();
      event.stopImmediatePropagation();
    }

    const url=($('supabaseUrl')?.value||'').trim();
    const key=($('supabaseKey')?.value||'').trim();

    if(!url||!key){
      setStatus('Completa la URL y la Publishable Key de Supabase.',true);
      return;
    }

    if(!window.supabase || typeof window.supabase.createClient!=='function'){
      setStatus('No se cargó la librería de Supabase. Recarga la página e inténtalo nuevamente.',true);
      console.error('[B232.15] window.supabase no está disponible.');
      return;
    }

    const button=$('saveConfig');
    if(button){button.disabled=true;button.textContent='Conectando…';}
    setStatus('Conectando con Supabase…');

    try{
      const client=window.supabase.createClient(url,key,{
        auth:{persistSession:false,autoRefreshToken:false}
      });

      const result=await probe(client);

      if(result?.error){
        throw new Error(result.error.message||'Supabase rechazó la consulta inicial.');
      }

      localStorage.setItem('sf_url',url);
      localStorage.setItem('sf_key',key);
      window.__B232RecoveredClient=client;

      /* El core app.js usa esta variable global si algún módulo la necesita. */
      window.supabaseClient=client;

      const panel=$('configPanel');
      const app=$('app');
      const logout=$('logoutBtn');
      if(panel)panel.classList.add('hidden');
      if(app)app.classList.remove('hidden');
      if(logout)logout.classList.remove('hidden');
      setStatus('Conexión establecida. Cargando Centro Financiero…');

      if(typeof window.refresh==='function'){
        try{ await window.refresh(); }
        catch(error){ console.error('[B232.15] refresh:',error); }
      }

      /* Da tiempo a que el loader dinámico del index detecte la aplicación activa. */
      await wait(250);

      if(window.FinancialSummary?.init){
        try{await window.FinancialSummary.init();}catch(error){console.error('[B232.15] FinancialSummary:',error);}
      }

      setStatus('Conectado correctamente.');
      setTimeout(()=>setStatus(''),1500);

    }catch(error){
      console.error('[B232.15] Error de conexión:',error);
      setStatus('No se pudo conectar: '+(error?.message||String(error)),true);
    }finally{
      if(button){button.disabled=false;button.textContent='Conectar';}
    }
  }

  function boot(){
    const button=$('saveConfig');
    if(!button)return;
    if(button.dataset.b23215)return;
    button.dataset.b23215='1';

    /* Captura el clic antes del onclick legacy de app.js. */
    button.addEventListener('click',connectRecovery,true);

    /* Recupera valores almacenados sin modificarlos. */
    const url=localStorage.getItem('sf_url');
    const key=localStorage.getItem('sf_key');
    if(url && $('supabaseUrl') && !$('supabaseUrl').value)$('supabaseUrl').value=url;
    if(key && $('supabaseKey') && !$('supabaseKey').value)$('supabaseKey').value=key;

    console.info('[B232.15] Recuperación de acceso instalada.');
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();

  window.B232AccessRecovery={version:VERSION,connect:connectRecovery};
})();
