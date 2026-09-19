/* FINANZAS — FINAL RUNTIME B232.19
   Reemplazo de calendario-runtime-hotfix-B232.12.js
   - Sin captura global de clics.
   - Sin stopImmediatePropagation.
   - No crea navegación paralela.
   - Recupera automáticamente la conexión guardada.
   - B232 solo renderiza Calendario.
*/
(()=>{
'use strict';
const VERSION='B232.19';
const $=id=>document.getElementById(id);
let booted=false;
let calendarQueued=false;

function restoreConnection(){
  const url=localStorage.getItem('sf_url');
  const key=localStorage.getItem('sf_key');
  if(url && $('supabaseUrl')) $('supabaseUrl').value=url;
  if(key && $('supabaseKey')) $('supabaseKey').value=key;
  return !!(url&&key);
}

function ensureConnected(){
  if(!restoreConnection()) return false;
  const panel=$('configPanel'), app=$('app'), logout=$('logoutBtn');
  if(panel) panel.classList.add('hidden');
  if(app) app.classList.remove('hidden');
  if(logout) logout.classList.remove('hidden');
  try{
    if(!window.supabaseClient && window.supabase?.createClient){
      window.supabaseClient=window.supabase.createClient(
        localStorage.getItem('sf_url'),
        localStorage.getItem('sf_key'),
        {auth:{persistSession:false,autoRefreshToken:false}}
      );
    }
  }catch(e){console.error('[B232.19] cliente Supabase',e);}
  return true;
}

async function loadCalendar(){
  const host=$('calendario');
  if(!host || host.classList.contains('hidden')) return;
  if(calendarQueued) return;
  calendarQueued=true;
  try{
    if(window.B232Calendario?.load){
      await window.B232Calendario.load();
      return;
    }
    const existing=document.querySelector('script[data-b23219="1"]');
    if(existing){
      for(let i=0;i<100 && !window.B232Calendario;i++) await new Promise(r=>setTimeout(r,20));
      if(window.B232Calendario?.load) await window.B232Calendario.load();
      return;
    }
    await new Promise((resolve,reject)=>{
      const s=document.createElement('script');
      s.src='b232-calendario-v2.js?v=232.19';
      s.async=false;
      s.dataset.b23219='1';
      s.onload=resolve;
      s.onerror=()=>reject(new Error('No se pudo cargar B232.'));
      document.body.appendChild(s);
    });
    await window.B232Calendario?.load?.();
  }catch(e){
    console.error('[B232.19] calendario',e);
  }finally{
    calendarQueued=false;
  }
}

function installCalendarBridge(){
  if(document.documentElement.dataset.b23219Calendar) return;
  document.documentElement.dataset.b23219Calendar='1';
  document.addEventListener('click',e=>{
    const b=e.target.closest('.tabs button[data-tab="calendario"]');
    if(!b) return;
    setTimeout(loadCalendar,0);
  },false);
}

function disableLegacyRenderer(){
  // Solo sustituye la referencia global si existe; no intercepta eventos.
  window.renderCalendar=()=>{
    const host=$('calendario');
    if(host && !host.classList.contains('hidden')) setTimeout(loadCalendar,0);
  };
  window.__calendarLegacyRendererDisabled=true;
}

function boot(){
  if(booted) return;
  booted=true;
  ensureConnected();
  installCalendarBridge();
  disableLegacyRenderer();
  if(!$('app')?.classList.contains('hidden') && !$('calendario')?.classList.contains('hidden')) loadCalendar();
}

if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true});
else boot();
window.B232CalendarRuntimeFix={version:VERSION,load:loadCalendar};
})();
