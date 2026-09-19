/*
 B232.21 — FINAL BOOT REPAIR
 Drop-in recovery runtime.

 This file is designed to be the ONLY new file you need to add.
 Add it as the LAST script in index.html:

 <script src="B232.21-FINAL-BOOT.js?v=232.21"></script>

 It repairs the access lock and navigation after the legacy scripts have loaded.
 It does not alter Supabase credentials or database schema.
*/
(()=>{
'use strict';

const $=id=>document.getElementById(id);

function openApp(){
  $('configPanel')?.classList.add('hidden');
  $('app')?.classList.remove('hidden');
  $('logoutBtn')?.classList.remove('hidden');
}

function status(text){
  const el=$('appStatus');
  if(el) el.textContent=text;
}

async function safeConnect(){
  const url=($('supabaseUrl')?.value||'').trim();
  const key=($('supabaseKey')?.value||'').trim();

  if(!url||!key){
    openApp();
    status('Supabase requiere configuración. La interfaz permanece disponible.');
    return;
  }

  openApp();

  try{
    if(!window.supabase?.createClient){
      status('Error: la biblioteca de Supabase no está disponible.');
      return;
    }

    window.db=window.db||window.supabase.createClient(url,key,{
      auth:{persistSession:false,autoRefreshToken:false}
    });

    localStorage.setItem('sf_url',url);
    localStorage.setItem('sf_key',key);

    status('Verificando conexión con Supabase...');

    const probe=await window.db
      .from('movimientos')
      .select('id')
      .limit(1);

    if(probe.error){
      status('Interfaz disponible. Error Supabase: '+probe.error.message);
      return;
    }

    status('Supabase conectado correctamente.');

    if(typeof window.refresh==='function'){
      await window.refresh();
    }

  }catch(e){
    console.error('[B232.21]',e);
    openApp();
    status('Error de conexión: '+(e?.message||e));
  }
}

function navigate(id){
  const section=$(id);
  if(!section){
    console.warn('[B232.21] Sección no disponible:',id);
    return false;
  }

  document.querySelectorAll('.tab').forEach(s=>{
    s.classList.toggle('hidden',s.id!==id);
  });

  document.querySelectorAll('.tabs button[data-tab]').forEach(b=>{
    b.classList.toggle('active',b.dataset.tab===id);
  });

  localStorage.setItem('cf_active_tab_v2',id);

  try{
    if((id==='operaciones'||id==='ingresos'||id==='jornadas') &&
       typeof window.b219Show==='function'){
      window.b219Show(id);
    }else if(id==='operaciones' && typeof window.loadOps==='function'){
      window.loadOps();
    }else if(id==='ingresos' && typeof window.loadIncome==='function'){
      window.loadIncome();
    }else if(id==='jornadas' && typeof window.loadJornadas==='function'){
      window.loadJornadas();
    }

    if(id==='planificacion' && typeof window.fin216Plan==='function'){
      window.fin216Plan();
    }

    if(id==='calendario' &&
       window.B232Calendario &&
       typeof window.B232Calendario.load==='function'){
      setTimeout(()=>{
        window.B232Calendario.load().catch(console.error);
      },0);
    }
  }catch(e){
    console.error('[B232.21] módulo',id,e);
  }

  return true;
}

function ensureButtons(){
  const tabs=document.querySelector('.tabs');
  const app=$('app');
  if(!tabs||!app)return;

  const add=(id,label)=>{
    let b=tabs.querySelector(`[data-tab="${id}"]`);
    if(!b){
      b=document.createElement('button');
      b.type='button';
      b.dataset.tab=id;
      b.textContent=label;
      tabs.appendChild(b);
    }
    b.hidden=false;
    b.classList.remove('b219-hidden-tab');
  };

  add('operaciones','Operaciones');
  add('planificacion','Planificación');
  add('ingresos','Motor Multifuente');
  add('jornadas','Control de Jornada');

  if(!$('planificacion')){
    const s=document.createElement('section');
    s.id='planificacion';
    s.className='tab hidden';
    s.innerHTML='<div id="b216Content"></div>';
    app.appendChild(s);
  }

  const order=[
    'dashboard','movimientos','futuros','calendario','ahorro',
    'deudas','cuentas','operaciones','planificacion','ingresos','jornadas'
  ];

  order.forEach(id=>{
    const b=tabs.querySelector(`[data-tab="${id}"]`);
    if(b)tabs.appendChild(b);
  });
}

function removeObsoleteRuntimes(){
  const obsolete=[
    'calendario-runtime-hotfix-B232.12.js',
    'b232-sistema-tabs-final.js',
    'B232.20-SISTEMA-NAVEGACION-Y-MODULOS.js',
    'RECUPERACION-ACCESO-B232.15.js'
  ];

  document.querySelectorAll('script[src]').forEach(s=>{
    const src=s.getAttribute('src')||'';
    if(obsolete.some(x=>src.includes(x))){
      s.remove();
    }
  });

  // Keep the already-loaded app.js execution, but prevent another copy.
  const apps=[...document.querySelectorAll('script[src*="app.js"]')];
  apps.slice(1).forEach(s=>s.remove());
}

function installNavigation(){
  if(document.documentElement.dataset.b23221Navigation)return;
  document.documentElement.dataset.b23221Navigation='1';

  document.addEventListener('click',e=>{
    const b=e.target.closest('.tabs button[data-tab]');
    if(!b)return;

    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation?.();

    navigate(b.dataset.tab);
  },true);
}

function installConnection(){
  const button=$('saveConfig');
  if(!button || button.dataset.b23221)return;

  button.dataset.b23221='1';
  button.onclick=()=>{
    safeConnect();
  };
}

function boot(){
  removeObsoleteRuntimes();
  ensureButtons();
  installNavigation();
  installConnection();

  // Existing stored credentials: never trap the user on config.
  const hasCredentials=
    localStorage.getItem('sf_url') &&
    localStorage.getItem('sf_key');

  if(hasCredentials){
    setTimeout(safeConnect,0);
  }

  const saved=localStorage.getItem('cf_active_tab_v2');
  if(saved){
    setTimeout(()=>navigate(saved),350);
    setTimeout(()=>navigate(saved),1200);
  }
}

window.B23221FinalBoot={
  version:'232.21',
  boot,
  navigate,
  connect:safeConnect
};

if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',boot,{once:true});
}else{
  boot();
}
})();