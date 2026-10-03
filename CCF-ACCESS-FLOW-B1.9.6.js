/* CCF ACCESS FLOW B1.9.6 — FINAL ACCESS ORCHESTRATOR
   Flujo único: ABRIR CCF -> LOGIN -> ACCESO -> RESUMEN
   - Elimina landing/portal B230 del flujo de acceso.
   - Oculta permanentemente la vista técnica "Conectar base de datos" durante pre-auth.
   - No utiliza MutationObserver sobre class/style/aria-hidden.
   - No deja una pantalla blanca entre autenticación y aplicación.
   - Reutiliza la biblioteca/cliente Supabase existente cuando está disponible.
   - No modifica módulos financieros, navegación, calendario, deudas ni cálculos.
*/
(()=>{
'use strict';
if(window.__CCF_ACCESS_FLOW_FINAL_B196__)return;
window.__CCF_ACCESS_FLOW_FINAL_B196__=true;

const VERSION='B1.9.6-FINAL-ACCESS';
const SUPABASE_URL='https://xgxvdbgmwvncmfdcxgsf.supabase.co';
const SUPABASE_KEY='sb_publishable_fJqOSLC7dhYKttuU1uAvcQ_AX-aH4PB';
let client=null;
let busy=false;

const $=id=>document.getElementById(id);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

function installAccessStyle(){
  if(document.getElementById('ccf-final-access-style'))return;
  const s=document.createElement('style');
  s.id='ccf-final-access-style';
  s.textContent=`
    /* Pre-auth: no technical UI, no legacy portal, no blank page. */
    html.ccf-final-preauth #configPanel,
    body.ccf-final-preauth #configPanel,
    html.ccf-final-preauth .topbar,
    body.ccf-final-preauth .topbar{display:none!important}

    html.ccf-final-preauth #app{visibility:hidden!important;}
    body.ccf-final-preauth #app{visibility:hidden!important;}

    #ccf-b230-final{display:none!important;visibility:hidden!important;pointer-events:none!important}

    #ccf-final-login{
      position:fixed;inset:0;z-index:2147483647;overflow:auto;
      background:linear-gradient(135deg,#050b14,#07111f 55%,#09192b);
      color:#eef6ff;font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
    }
    #ccf-final-login .shell{min-height:100%;display:grid;place-items:center;padding:24px;box-sizing:border-box}
    #ccf-final-login .card{width:min(430px,100%);padding:26px;border:1px solid rgba(148,163,184,.2);border-radius:20px;background:#0b1828;box-shadow:0 30px 90px rgba(0,0,0,.45);box-sizing:border-box}
    #ccf-final-login .brand{display:flex;gap:10px;align-items:center;margin-bottom:22px}
    #ccf-final-login .brandMark{display:grid;place-items:center;width:40px;height:40px;border-radius:11px;background:#1688e8;font-weight:900}
    #ccf-final-login .brand strong{display:block;font-size:14px}
    #ccf-final-login .brand small{display:block;color:#8fa4bb;font-size:10px;margin-top:2px}
    #ccf-final-login h2{margin:0 0 7px;font-size:27px}
    #ccf-final-login p.help{margin:0 0 20px;color:#9db0c7;font-size:13px;line-height:1.5}
    #ccf-final-login form{display:grid;gap:12px}
    #ccf-final-login label{display:grid;gap:6px;color:#cbd8e6;font-size:12px;font-weight:700}
    #ccf-final-login input{width:100%;box-sizing:border-box;height:46px;padding:0 12px;border-radius:10px;border:1px solid rgba(148,163,184,.22);background:#07111f;color:#fff;font:inherit}
    #ccf-final-login button{height:46px;border:0;border-radius:10px;cursor:pointer;font:800 13px system-ui}
    #ccf-final-login #ccf-final-submit{background:#1688e8;color:#fff}
    #ccf-final-login #ccf-final-switch{width:100%;margin-top:11px;background:transparent;color:#54caff}
    #ccf-final-login button:disabled{opacity:.65;cursor:wait}
    #ccf-final-login #ccf-final-status{min-height:20px;margin-top:13px;color:#9db0c7;font-size:11px;line-height:1.45}
    @media(max-width:600px){#ccf-final-login .shell{align-content:center;padding:18px}#ccf-final-login .card{padding:22px}}
  `;
  document.head.appendChild(s);
}

function preAuth(){
  /* Impedir que app.js interprete las claves persistidas como autorización de acceso. */
  try{
    window.__CCF_ACCESS_SAVED_CONFIG__={url:localStorage.getItem('sf_url')||'',key:localStorage.getItem('sf_key')||''};
  }catch(_){window.__CCF_ACCESS_SAVED_CONFIG__={url:'',key:''};}
  document.documentElement.classList.add('ccf-final-preauth');
  document.body?.classList.add('ccf-final-preauth');
  try{localStorage.removeItem('sf_url');localStorage.removeItem('sf_key');}catch(_){}
  $('configPanel')?.classList.add('hidden');
  $('logoutBtn')?.classList.add('hidden');
  $('app')?.classList.add('hidden');
  $('ccf-b230-final')?.remove();
  document.querySelector('.topbar')?.classList.add('hidden');
}

function removeOldAccessSurfaces(){
  $('ccf-b230-final')?.remove();
  $('ccf-auth-gate')?.remove();
}

function buildLogin(){
  removeOldAccessSurfaces();
  if($('ccf-final-login'))return;

  const gate=document.createElement('div');
  gate.id='ccf-final-login';
  gate.innerHTML=`
    <div class="shell">
      <div class="card" role="dialog" aria-label="Acceso al Centro de Control Financiero">
        <div class="brand">
          <span class="brandMark">CCF</span>
          <div><strong>Centro de Control Financiero</strong><small>${VERSION} · Acceso seguro</small></div>
        </div>
        <h2>Iniciar sesión</h2>
        <p class="help">Accede a tu sistema financiero y continúa donde lo dejaste.</p>
        <form id="ccf-final-form" novalidate>
          <label>Correo electrónico<input id="ccf-final-email" type="email" autocomplete="email" required></label>
          <label>Contraseña<input id="ccf-final-password" type="password" autocomplete="current-password" minlength="8" required></label>
          <button id="ccf-final-submit" type="submit">Ingresar al sistema</button>
        </form>
        <button id="ccf-final-switch" type="button">Crear una cuenta</button>
        <div id="ccf-final-status" aria-live="polite">Preparando acceso…</div>
      </div>
    </div>`;
  document.body.appendChild(gate);

  $('ccf-final-switch').addEventListener('click',()=>{
    const p=$('ccf-final-password');
    const title=gate.querySelector('h2');
    const help=gate.querySelector('.help');
    const submit=$('ccf-final-submit');
    const sw=$('ccf-final-switch');
    const register=gate.dataset.mode==='register';
    gate.dataset.mode=register?'login':'register';
    if(!register){
      title.textContent='Crear cuenta';
      help.textContent='Crea tu acceso al sistema financiero con una contraseña de al menos 8 caracteres.';
      submit.textContent='Crear cuenta';
      sw.textContent='Volver a iniciar sesión';
      p.autocomplete='new-password';
      status('Completa los datos para crear tu cuenta.');
    }else{
      title.textContent='Iniciar sesión';
      help.textContent='Accede a tu sistema financiero y continúa donde lo dejaste.';
      submit.textContent='Ingresar al sistema';
      sw.textContent='Crear una cuenta';
      p.autocomplete='current-password';
      status('Ingresa con tu cuenta.');
    }
  });

  $('ccf-final-form').addEventListener('submit',e=>{
    e.preventDefault();
    submit();
  });
}

function status(t,error=false){
  const e=$('ccf-final-status');
  if(e){e.textContent=t;e.style.color=error?'#fecaca':'#9db0c7';}
}

function getClient(){
  if(window.supabaseClient?.auth){client=window.supabaseClient;return client;}
  if(window.db?.auth){client=window.db;return client;}
  if(window.supabase?.createClient){
    if(!client){
      client=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
    }
    window.supabaseClient=client;
    window.db=client;
    window.__db=client;
    return client;
  }
  return null;
}

async function waitClient(timeout=8000){
  for(let i=0;i<timeout/100;i++){
    const c=getClient();
    if(c)return c;
    await sleep(100);
  }
  throw new Error('No fue posible inicializar el servicio de acceso.');
}

async function openApp(){
  const login=$('ccf-final-login');
  login?.remove();
  $('ccf-auth-gate')?.remove();
  $('ccf-b230-final')?.remove();

  document.documentElement.classList.remove('ccf-final-preauth');
  document.body.classList.remove('ccf-final-preauth');

  $('configPanel')?.classList.add('hidden');
  const app=$('app');
  if(app){
    app.classList.remove('hidden','b230-hidden-app');
    app.style.removeProperty('display');
    app.style.visibility='visible';
    app.removeAttribute('aria-hidden');
  }
  $('logoutBtn')?.classList.remove('hidden');

  try{window.dispatchEvent(new Event('ccf:app-ready'));}catch(_){ }

  /* Inicialización de datos después de mostrar Resumen; nunca bloquea el acceso. */
  setTimeout(()=>{
    try{
      const u=$('supabaseUrl'); const k=$('supabaseKey');
      if(u)u.value=SUPABASE_URL;
      if(k)k.value=SUPABASE_KEY;
      try{localStorage.setItem('sf_url',SUPABASE_URL);localStorage.setItem('sf_key',SUPABASE_KEY);}catch(_){}
      if(typeof window.connect==='function') window.connect().catch(()=>{});
    }catch(_){ }
  },0);

  setTimeout(()=>{
    try{window.CCFMobileB43?.refresh?.();}catch(_){ }
    try{window.refresh?.().catch?.(()=>{});}catch(_){ }
  },300);
}

async function submit(){
  if(busy)return;
  const email=$('ccf-final-email')?.value.trim();
  const password=$('ccf-final-password')?.value||'';
  const register=$('ccf-final-login')?.dataset.mode==='register';
  if(!email||!password){status('Completa correo y contraseña.',true);return;}
  if(password.length<8){status('La contraseña debe tener al menos 8 caracteres.',true);return;}

  busy=true;
  const btn=$('ccf-final-submit'); if(btn)btn.disabled=true;
  status(register?'Creando cuenta…':'Validando credenciales…');
  try{
    const c=await waitClient();
    let data,error;
    if(register){
      ({data,error}=await c.auth.signUp({email,password,options:{emailRedirectTo:window.location.origin+window.location.pathname}}));
      if(error)throw error;
      if(!data?.session){status('Cuenta creada. Revisa tu correo para confirmar la cuenta y luego inicia sesión.');return;}
    }else{
      ({data,error}=await c.auth.signInWithPassword({email,password}));
      if(error)throw error;
      if(!data?.session)throw new Error('Supabase no entregó una sesión activa.');
    }
    await openApp();
  }catch(e){
    console.error('[CCF ACCESS FINAL]',e);
    status(e?.message||'No fue posible completar el acceso.',true);
  }finally{
    busy=false;
    if(btn)btn.disabled=false;
  }
}

async function boot(){
  installAccessStyle();
  preAuth();
  buildLogin();
  status('Preparando acceso…');

  try{
    const c=await waitClient(8000);
    const {data,error}=await c.auth.getSession();
    if(error)throw error;
    if(data?.session){
      await openApp();
      return;
    }
    status('Ingresa con tu cuenta.');
  }catch(e){
    console.warn('[CCF ACCESS FINAL] session check',e);
    /* El LOGIN permanece visible aunque Supabase tarde en responder. */
    status('Ingresa con tu cuenta.');
  }
}

if(document.readyState==='loading'){
  /* Captura antes de los listeners registrados por app.js para neutralizar su auto-connect pre-auth. */
  document.addEventListener('DOMContentLoaded',()=>{try{preAuth();}catch(_){}},{once:true,capture:true});
  document.addEventListener('DOMContentLoaded',boot,{once:true});
}else boot();

})();
