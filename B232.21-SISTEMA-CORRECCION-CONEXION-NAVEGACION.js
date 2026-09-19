/* ============================================================
   FINANZAS — B232.21 · CORRECCIÓN DE ARRANQUE + NAVEGACIÓN
   - Recupera la interfaz aunque falle la prueba de Supabase.
   - Reemplaza el handler de Conectar de app.js.
   - Unifica navegación de módulos mediante delegación.
   - Integra Operaciones, Planificación, Multifuente y Jornada.
   - No modifica datos ni esquemas de Supabase.
   ============================================================ */
(() => {
  'use strict';

  const VERSION='B232.21';
  const DYNAMIC={
    operaciones:'Operaciones',
    planificacion:'Planificación',
    ingresos:'Motor Multifuente',
    jornadas:'Control de Jornada'
  };

  const $=id=>document.getElementById(id);
  const wait=ms=>new Promise(r=>setTimeout(r,ms));

  function today(){
    const d=new Date();
    return new Date(d.getTime()-d.getTimezoneOffset()*60000)
      .toISOString().slice(0,10);
  }

  function setStatus(text){
    const el=$('appStatus');
    if(el) el.textContent=text||'';
    const msg=$('configMsg');
    if(msg) msg.textContent=text||'';
  }

  async function connect(){
    const url=$('supabaseUrl')?.value.trim();
    const key=$('supabaseKey')?.value.trim();
    const btn=$('saveConfig');

    if(!url||!key){
      setStatus('Completa ambos campos.');
      return;
    }

    if(btn){
      btn.disabled=true;
      btn.textContent='Conectando…';
    }

    try{
      if(!window.supabase || typeof window.supabase.createClient!=='function'){
        throw new Error('La biblioteca de Supabase no está disponible.');
      }

      const client=window.supabase.createClient(url,key,{
        auth:{persistSession:false,autoRefreshToken:false}
      });

      // Persistir antes de cualquier consulta.
      localStorage.setItem('sf_url',url);
      localStorage.setItem('sf_key',key);

      // Exponer el cliente usado por los motores nuevos.
      window.supabaseClient=client;

      // La interfaz NO queda bloqueada por una consulta/RLS defectuosa.
      $('configPanel')?.classList.add('hidden');
      $('app')?.classList.remove('hidden');
      $('logoutBtn')?.classList.remove('hidden');
      setStatus('Interfaz cargada. Verificando Supabase…');

      // Mantener compatibilidad con app.js: su variable db es privada.
      // Se fuerza el refresh global sólo si existe.
      try{
        const probe=await client.from('movimientos').select('id').limit(1);
        if(probe.error){
          console.error('[B232.21] Supabase probe:',probe.error);
          setStatus('Interfaz cargada. Supabase respondió con: '+probe.error.message);
        }else{
          setStatus('Supabase conectado correctamente.');
        }
      }catch(error){
        console.error('[B232.21] Probe:',error);
        setStatus('Interfaz cargada. No fue posible validar Supabase: '+(error.message||error));
      }

      // app.js tiene su propio cliente privado. Recargar es la forma segura
      // de sincronizar sus consultas sin duplicar clientes en memoria.
      if(typeof window.refresh==='function'){
        try{ await window.refresh(); }catch(error){ console.error('[B232.21] refresh:',error); }
      }

      await bootNavigation();

      if(btn){
        btn.disabled=false;
        btn.textContent='Conectado';
      }
    }catch(error){
      console.error('[B232.21] connect:',error);

      // Incluso ante un fallo de inicialización, mostrar la aplicación para
      // que el diagnóstico sea visible y no quede atrapada en la pantalla inicial.
      $('configPanel')?.classList.add('hidden');
      $('app')?.classList.remove('hidden');
      $('logoutBtn')?.classList.remove('hidden');
      setStatus('Error de conexión: '+(error.message||error));

      if(btn){
        btn.disabled=false;
        btn.textContent='Reintentar conexión';
      }
    }
  }

  function installConnection(){
    const btn=$('saveConfig');
    if(!btn)return false;

    // Sustituye completamente el onclick de app.js.
    btn.onclick=connect;
    btn.dataset.b23221='1';
    return true;
  }

  function ensureSection(id,label){
    const app=$('app');
    if(!app)return null;
    let s=$(id);
    if(!s){
      s=document.createElement('section');
      s.id=id;
      s.className='tab hidden';
      s.innerHTML=`<div class="card"><p class="status">Cargando módulo ${label}…</p></div>`;
      app.appendChild(s);
    }
    return s;
  }

  function ensureButtons(){
    const t=document.querySelector('.tabs');
    if(!t)return false;

    Object.entries(DYNAMIC).forEach(([id,label])=>{
      let b=t.querySelector(`button[data-tab="${id}"]`);
      if(!b){
        b=document.createElement('button');
        b.type='button';
        b.dataset.tab=id;
        b.textContent=label;
        t.appendChild(b);
      }
      b.hidden=false;
      b.classList.remove('b232-hidden','b219-hidden-tab');
      b.style.removeProperty('display');
      ensureSection(id,label);
    });
    return true;
  }

  function exposeB219(){
    // B219 mantiene show() privado. Este puente reproduce su carga pública
    // cuando sus funciones internas ya están disponibles mediante el menú.
    if(window.B232SistemaNavegacion?.activate)return true;
    return false;
  }

  function activate(id){
    const section=$(id);
    const t=document.querySelector('.tabs');
    if(!section||!t)return false;

    document.querySelectorAll('.tab').forEach(s=>s.classList.toggle('hidden',s.id!==id));
    t.querySelectorAll('button[data-tab]').forEach(b=>b.classList.toggle('active',b.dataset.tab===id));
    localStorage.setItem('cf_active_tab_v2',id);

    try{
      if(id==='calendario' && window.B232Calendario?.load){
        setTimeout(()=>window.B232Calendario.load().catch(console.error),0);
      }
      if(id==='planificacion' && typeof window.fin216Plan==='function'){
        window.fin216Plan();
      }

      // B219 no expone show(). Si el módulo ya está montado, activar su
      // sección es suficiente; para sus datos se intenta utilizar su menú
      // existente sin alterar el flujo de Supabase.
      if(id==='operaciones'||id==='ingresos'||id==='jornadas'){
        const menuBtn=document.querySelector(`[data-b219-open="${id}"]`);
        if(menuBtn && !menuBtn.dataset.b23221Proxy){
          menuBtn.click();
        }
      }
    }catch(error){
      console.error('[B232.21] activate '+id,error);
    }
    return true;
  }

  function installNavigation(){
    const t=document.querySelector('.tabs');
    if(!t)return false;
    ensureButtons();

    if(t.dataset.b23221Nav==='1')return true;
    t.dataset.b23221Nav='1';

    // Capture: intercepta los onclick antiguos de app.js/B216/FIN23.
    t.addEventListener('click',event=>{
      const b=event.target.closest('button[data-tab]');
      if(!b||!t.contains(b))return;
      const id=b.dataset.tab;
      if(!id)return;

      event.preventDefault();
      event.stopImmediatePropagation();
      activate(id);
    },true);

    return true;
  }

  async function bootNavigation(){
    ensureButtons();
    installNavigation();

    // Dar tiempo a B219/FIN23/B216 para montar secciones dinámicas.
    for(const ms of [100,350,800,1500]){
      await wait(ms);
      ensureButtons();
      installNavigation();
    }
  }

  function boot(){
    installConnection();
    bootNavigation();
  }

  window.B23221={
    version:VERSION,
    connect,
    activate,
    installConnection,
    installNavigation
  };

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,50),{once:true});
  }else{
    setTimeout(boot,50);
  }
})();
