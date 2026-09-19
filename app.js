/* B232.21 FINAL — app.js
 * Wrapper de compatibilidad: conserva el motor financiero existente
 * y corrige el bootstrap/acceso sin duplicar la aplicación.
 */
(()=>{'use strict';

if(window.__B23221_APP__)return;
window.__B23221_APP__=true;

const LEGACY_APP='https://raw.githubusercontent.com/P-Renault/Finanzas/fa17f7034376a51dfeeea7a35cf2e9c89afa9537/app.js';

const reveal=()=>{
  document.getElementById('configPanel')?.classList.add('hidden');
  document.getElementById('app')?.classList.remove('hidden');
  document.getElementById('logoutBtn')?.classList.remove('hidden');
};

const status=(m)=>{
  let n=document.getElementById('b23221Status');
  if(!n){
    n=document.createElement('p');
    n.id='b23221Status';
    n.className='status';
    document.getElementById('app')?.prepend(n);
  }
  n.textContent=m;
};

const removeLegacyRuntimes=()=>{
  [
    'calendario-runtime-hotfix-B232.12.js',
    'b232-sistema-tabs-final.js',
    'B232.20-SISTEMA-NAVEGACION-Y-MODULOS.js',
    'RECUPERACION-ACCESO-B232.15.js'
  ].forEach(name=>{
    document.querySelectorAll(`script[src*="${name}"]`).forEach(s=>s.remove());
  });
};

const installNavigation=()=>{
  const navigate=id=>{
    const section=document.getElementById(id);
    if(!section)return false;

    document.querySelectorAll('.tab').forEach(s=>{
      s.classList.toggle('hidden',s.id!==id);
    });

    document.querySelectorAll('.tabs button[data-tab]').forEach(b=>{
      b.classList.toggle('active',b.dataset.tab===id);
    });

    localStorage.setItem('cf_active_tab_v2',id);

    try{
      if(['operaciones','ingresos','jornadas'].includes(id) &&
         typeof window.b219Show==='function'){
        window.b219Show(id);
      }
      if(id==='planificacion' &&
         typeof window.fin216Plan==='function'){
        window.fin216Plan();
      }
      if(id==='calendario' &&
         window.B232Calendario &&
         typeof window.B232Calendario.load==='function'){
        setTimeout(()=>window.B232Calendario.load().catch(console.error),0);
      }
    }catch(e){console.error('[B232.21]',e)}

    return true;
  };

  if(window.__B23221_NAV__)return;
  window.__B23221_NAV__=true;

  document.addEventListener('click',e=>{
    const b=e.target.closest('.tabs button[data-tab]');
    if(!b)return;
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation?.();
    navigate(b.dataset.tab);
  },true);

  window.B23221Navigation={version:'232.21-FINAL',navigate};
};

const addDynamicTabs=()=>{
  const tabs=document.querySelector('.tabs');
  const app=document.getElementById('app');
  if(!tabs||!app)return;

  const add=(id,label,html)=>{
    let b=tabs.querySelector(`[data-tab="${id}"]`);
    if(!b){
      b=document.createElement('button');
      b.type='button';
      b.dataset.tab=id;
      b.textContent=label;
      tabs.appendChild(b);
    }
    b.hidden=false;
    if(!document.getElementById(id)){
      const s=document.createElement('section');
      s.id=id;
      s.className='tab hidden';
      s.innerHTML=html||'';
      app.appendChild(s);
    }
  };

  add('operaciones','Operaciones','<div class="card"><h2>Operaciones</h2><p id="b219OpsMsg">Cargando módulo...</p></div>');
  add('planificacion','Planificación','<div id="b216Content"></div>');
  add('ingresos','Motor Multifuente','<div class="card"><h2>Motor Multifuente</h2><div id="b219IncomeContent"></div><p id="b219IncomeMsg"></p></div>');
  add('jornadas','Control de Jornada','<div class="card"><h2>Control de Jornada</h2><div id="b219JornadasContent"></div><p id="b219JornadasMsg"></p></div>');

  const order=['dashboard','movimientos','futuros','calendario','ahorro','deudas','cuentas','operaciones','planificacion','ingresos','jornadas'];
  order.forEach(id=>{
    const b=tabs.querySelector(`[data-tab="${id}"]`);
    if(b)tabs.appendChild(b);
  });
};

const boot=()=>{
  removeLegacyRuntimes();
  addDynamicTabs();
  installNavigation();
  reveal();

  const saved=localStorage.getItem('cf_active_tab_v2');
  if(saved && document.querySelector(`.tabs button[data-tab="${saved}"]`)){
    setTimeout(()=>window.B23221Navigation?.navigate(saved),250);
  }
};

const loadLegacy=()=>{
  if(window.__B23221_LEGACY_LOADED__)return;
  window.__B23221_LEGACY_LOADED__=true;

  const hadUrl=localStorage.getItem('sf_url');
  const hadKey=localStorage.getItem('sf_key');

  /*
   * Impide el auto-connect del app legacy mientras se carga.
   * Después restauramos las credenciales y envolvemos connect().
   */
  localStorage.removeItem('sf_url');
  localStorage.removeItem('sf_key');

  const s=document.createElement('script');
  s.src=LEGACY_APP;
  s.onload=()=>{
    if(hadUrl)localStorage.setItem('sf_url',hadUrl);
    if(hadKey)localStorage.setItem('sf_key',hadKey);

    const legacyConnect=window.connect;

    window.connect=async()=>{
      reveal();

      try{
        if(typeof legacyConnect==='function'){
          await legacyConnect();
        }else{
          throw new Error('Motor de conexión no disponible.');
        }
        reveal();
      }catch(e){
        reveal();
        console.error('[B232.21] conexión',e);
        status('Interfaz abierta. Error de Supabase: '+(e.message||e));
      }
    };

    const save=document.getElementById('saveConfig');
    if(save)save.onclick=window.connect;

    boot();

    /*
     * Con credenciales existentes, conectar automáticamente.
     */
    if(hadUrl&&hadKey){
      setTimeout(()=>window.connect(),100);
    }
  };

  s.onerror=()=>{
    if(hadUrl)localStorage.setItem('sf_url',hadUrl);
    if(hadKey)localStorage.setItem('sf_key',hadKey);
    reveal();
    status('No se pudo cargar el motor financiero base.');
  };

  document.head.appendChild(s);
};

if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',loadLegacy,{once:true});
}else{
  loadLegacy();
}

})();