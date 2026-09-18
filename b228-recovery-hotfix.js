/* FINANZAS — B228 RECOVERY HOTFIX
   1) evita la doble carga de B220
   2) reemplaza el mensaje genérico de conexión por diagnóstico real
   3) no modifica Supabase ni crea datos
*/
(() => {
  'use strict';

  function ready(fn){
    if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn, {once:true});
    else fn();
  }

  ready(() => {
    const save = document.getElementById('saveConfig');
    const msg = document.getElementById('configMsg');
    if(!save || !msg) return;

    save.onclick = async () => {
      const url = (document.getElementById('supabaseUrl')?.value || '').trim();
      const key = (document.getElementById('supabaseKey')?.value || '').trim();

      if(!url || !key){
        msg.textContent = 'Completa URL y Publishable Key.';
        return;
      }

      if(!/^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(url)){
        msg.textContent = 'La URL de Supabase no tiene el formato esperado.';
        return;
      }

      if(!window.supabase){
        msg.textContent = 'Error: la librería de Supabase no terminó de cargar.';
        return;
      }

      save.disabled = true;
      save.textContent = 'Conectando…';
      msg.textContent = 'Probando conexión y acceso a movimientos…';

      try{
        const client = window.supabase.createClient(url, key, {
          auth: { persistSession:false, autoRefreshToken:false }
        });

        const probe = await client.from('movimientos').select('id').limit(1);

        if(probe.error){
          const e = probe.error;
          throw new Error(
            `${e.message || 'Error de Supabase'}`
            + (e.code ? ` · código ${e.code}` : '')
            + (e.details ? ` · ${e.details}` : '')
            + (e.hint ? ` · pista: ${e.hint}` : '')
          );
        }

        localStorage.setItem('sf_url', url);
        localStorage.setItem('sf_key', key);

        /* La variable db pertenece al app.js legado. */
        window.__finanzasRecoveryClient = client;

        const panel = document.getElementById('configPanel');
        const app = document.getElementById('app');
        const logout = document.getElementById('logoutBtn');

        if(panel) panel.classList.add('hidden');
        if(app) app.classList.remove('hidden');
        if(logout) logout.classList.remove('hidden');

        msg.textContent = 'Conexión confirmada. Cargando sistema…';

        if(typeof window.refresh === 'function'){
          try { await window.refresh(); } catch(e) {
            console.error('FINANZAS_REFRESH', e);
            msg.textContent = `Conexión OK, pero falló la carga inicial: ${e.message || e}`;
          }
        }

      }catch(e){
        console.error('FINANZAS_CONNECTION', e);
        msg.textContent = `CONEXIÓN FALLIDA: ${e.message || e}`;
      }finally{
        save.disabled = false;
        save.textContent = 'Conectar';
      }
    };
  });
})();
