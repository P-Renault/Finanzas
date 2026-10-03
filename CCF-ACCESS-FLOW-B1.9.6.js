/* CCF B2.31.2 — AUTH CLIENT BRIDGE — FIX 2026.09.26
   Corrección:
   - Un único cliente Supabase autenticado.
   - Carga robusta de @supabase/supabase-js si el bundle principal no quedó disponible.
   - Mensajes de estado claros durante inicialización.
   - No modifica tablas, SQL, RLS ni datos financieros.
*/
(()=>{
'use strict';
if(window.__CCF_B1_9_6_ACCESS_FLOW__)return;
window.__CCF_B1_9_6_ACCESS_FLOW__=true;

/* Guard propio: CCF-AUTH-BOOT-FINAL.js usa otro namespace.
   Este controlador debe ejecutarse siempre para eliminar el portal/landing B230
   del flujo final y dejar LOGIN como única entrada. */

const VERSION='B2.31.2-FIX-2026.09.26';
const SUPABASE_URL='https://xgxvdbgmwvncmfdcxgsf.supabase.co';
const SUPABASE_KEY='sb_publishable_fJqOSLC7dhYKttuU1uAvcQ_AX-aH4PB';
let client=null, mode='login';

const $=id=>document.getElementById(id);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

function hideLegacy(){
 $('configPanel')?.classList.add('hidden');
 $('app')?.classList.add('hidden');
 $('logoutBtn')?.classList.add('hidden');
 document.querySelector('.topbar')?.classList.add('ccf-access-hidden');
 document.querySelector('.container')?.classList.add('ccf-access-preauth');
}

function installAccessBaseStyle(){
 if(document.getElementById('ccf-access-base-style'))return;
 const s=document.createElement('style');
 s.id='ccf-access-base-style';
 s.textContent=`
  .ccf-access-hidden{display:none!important}
  .ccf-access-preauth{visibility:hidden!important}
  #configPanel,#app,#logoutBtn{visibility:hidden}
  #ccf-auth-gate{z-index:2147483646!important}
  #ccf-b230-final{z-index:2147483647!important}
  body.ccf-access-app-ready .ccf-access-preauth{visibility:visible!important}
  body.ccf-access-app-ready #app{visibility:visible!important}
 `;
 document.head.appendChild(s);
}


function revealApp(){
 installAccessBaseStyle();
 $('configPanel')?.classList.add('hidden');
 const app=$('app');
 if(app){
   app.classList.remove('hidden','b230-hidden-app');
   app.style.removeProperty('display');
   app.removeAttribute('aria-hidden');
   app.style.visibility='visible';
 }
 document.querySelector('.container')?.classList.remove('ccf-access-preauth');
 document.querySelector('.topbar')?.classList.add('ccf-access-hidden');
 $('logoutBtn')?.classList.remove('hidden');
 $('ccf-auth-gate')?.remove();
 $('ccf-b230-final')?.remove();
 document.body.classList.add('ccf-access-app-ready');
 try{ window.dispatchEvent(new Event('ccf:app-ready')); }catch(_){}
 try{ window.CCFMobileB43?.refresh?.(); }catch(_){}
 return !!app;
}

function status(t,error=false){
 const e=$('ccf-auth-status');
 if(e){
   e.textContent=t;
   e.style.color=error?'#fecaca':'#9db0c7';
 }
}

function portal(){
 if($('ccf-auth-gate'))return;

 const gate=document.createElement('div');
 gate.id='ccf-auth-gate';
 gate.innerHTML=`
 <div class="ccf-auth-shell" role="dialog" aria-label="Acceso al Centro de Control Financiero">
  <div class="ccf-auth-brand">
   <span>CCF</span>
   <div>
    <strong>Centro de Control Financiero</strong>
    <small>${VERSION} · Acceso seguro</small>
   </div>
  </div>

  <div class="ccf-auth-card">
   <h2 id="ccf-auth-title">Iniciar sesión</h2>
   <p id="ccf-auth-help">Accede a tu sistema financiero y continúa donde lo dejaste.</p>

   <form id="ccf-auth-form" novalidate>
    <label>
      Correo electrónico
      <input id="ccf-email" type="email" autocomplete="email" required>
    </label>

    <label>
      Contraseña
      <input id="ccf-password" type="password" autocomplete="current-password" minlength="8" required>
    </label>

    <button type="submit" id="ccf-submit">Ingresar al sistema</button>
   </form>

   <button type="button" class="ccf-link" id="ccf-switch">Crear una cuenta</button>
   <div id="ccf-auth-status" aria-live="polite">Inicializando acceso…</div>
  </div>
 </div>`;

 document.body.appendChild(gate);

 const style=document.createElement('style');
 style.id='ccf-auth-boot-style';
 style.textContent=`
 #ccf-auth-gate{
   position:fixed;
   inset:0;
   z-index:2147483646;
   overflow:auto;
   background:
     radial-gradient(circle at 80% 10%,rgba(22,136,232,.2),transparent 30%),
     linear-gradient(135deg,#050b14,#07111f 55%,#09192b);
   color:#eef6ff;
   font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif
 }
 .ccf-auth-shell{
   min-height:100%;
   display:grid;
   place-items:center;
   padding:24px
 }
 .ccf-auth-card{
   width:min(430px,100%);
   padding:26px;
   border:1px solid rgba(148,163,184,.2);
   border-radius:20px;
   background:#0b1828;
   box-shadow:0 30px 90px rgba(0,0,0,.45)
 }
 .ccf-auth-brand{
   position:fixed;
   top:18px;
   left:22px;
   display:flex;
   gap:10px;
   align-items:center
 }
 .ccf-auth-brand>span{
   display:grid;
   place-items:center;
   width:40px;
   height:40px;
   border-radius:11px;
   background:#1688e8;
   font-weight:900
 }
 .ccf-auth-brand strong{
   display:block;
   font-size:14px
 }
 .ccf-auth-brand small{
   display:block;
   color:#8fa4bb;
   font-size:10px;
   margin-top:2px
 }
 .ccf-auth-card h2{
   margin:0 0 7px;
   font-size:27px
 }
 .ccf-auth-card p{
   margin:0 0 20px;
   color:#9db0c7;
   font-size:13px;
   line-height:1.5
 }
 .ccf-auth-card form{
   display:grid;
   gap:12px
 }
 .ccf-auth-card label{
   display:grid;
   gap:6px;
   color:#cbd8e6;
   font-size:12px;
   font-weight:700
 }
 .ccf-auth-card input{
   width:100%;
   box-sizing:border-box;
   height:46px;
   padding:0 12px;
   border-radius:10px;
   border:1px solid rgba(148,163,184,.22);
   background:#07111f;
   color:#fff;
   font:inherit
 }
 .ccf-auth-card button{
   height:46px;
   border:0;
   border-radius:10px;
   cursor:pointer;
   font:800 13px system-ui
 }
 .ccf-auth-card form button{
   background:#1688e8;
   color:#fff
 }
 .ccf-link{
   width:100%;
   margin-top:11px;
   background:transparent;
   color:#54caff!important
 }
 .ccf-auth-card button:disabled{
   opacity:.65;
   cursor:wait
 }
 #ccf-auth-status{
   min-height:20px;
   margin-top:13px;
   color:#9db0c7;
   font-size:11px;
   line-height:1.45
 }
 @media(max-width:600px){
   .ccf-auth-brand{
     position:static;
     justify-content:center;
     margin-bottom:10px
   }
   .ccf-auth-shell{
     align-content:center
   }
 }
 `;
 document.head.appendChild(style);

 $('ccf-switch').onclick=()=>setMode(mode==='login'?'register':'login');
}

function setMode(next){
 mode=next==='register'?'register':'login';

 const title=$('ccf-auth-title');
 const help=$('ccf-auth-help');
 const submit=$('ccf-submit');
 const sw=$('ccf-switch');
 const pw=$('ccf-password');

 if(mode==='register'){
   title.textContent='Crear cuenta';
   help.textContent='Crea tu acceso al sistema financiero con una contraseña de al menos 8 caracteres.';
   submit.textContent='Crear cuenta';
   sw.textContent='Volver a iniciar sesión';
   pw.autocomplete='new-password';
   status('Completa los datos para crear tu cuenta.');
 }else{
   title.textContent='Iniciar sesión';
   help.textContent='Accede a tu sistema financiero y continúa donde lo dejaste.';
   submit.textContent='Ingresar al sistema';
   sw.textContent='Crear una cuenta';
   pw.autocomplete='current-password';
   status('Ingresa con tu cuenta.');
 }
}

function installClient(){
 if(!window.supabase?.createClient)return false;

 if(!client){
   client=window.supabase.createClient(
     SUPABASE_URL,
     SUPABASE_KEY,
     {
       auth:{
         persistSession:true,
         autoRefreshToken:true,
         detectSessionInUrl:true
       }
     }
   );
 }

 window.supabaseClient=client;
 window.db=client;
 window.__db=client;
 window.__B23269_CLIENT__=client;
 window.__B23270_CLIENT__=client;
 window.__B23273_CLIENT__=client;

 if(!window.__CCF_AUTH_CREATECLIENT_PATCHED__){
   const originalCreateClient=window.supabase.createClient.bind(window.supabase);

   window.supabase.createClient=function(url,key,options){
     if(
       String(url||'')===SUPABASE_URL &&
       String(key||'')===SUPABASE_KEY
     ){
       return client;
     }
     return originalCreateClient(url,key,options);
   };

   window.__CCF_AUTH_CREATECLIENT_PATCHED__=true;
 }

 try{
   localStorage.setItem('sf_url',SUPABASE_URL);
   localStorage.setItem('sf_key',SUPABASE_KEY);
 }catch(_){}

 return true;
}

/* Carga alternativa para evitar quedar atrapado en
   "Inicializando acceso…" cuando el bundle principal de
   Supabase no está disponible. */
function loadSupabaseFallback(){
 return new Promise((resolve,reject)=>{
   if(window.supabase?.createClient){
     resolve(true);
     return;
   }

   if(window.__CCF_SUPABASE_FALLBACK_LOADING__){
     let n=0;

     const timer=setInterval(()=>{
       if(window.supabase?.createClient){
         clearInterval(timer);
         resolve(true);
       }else if(++n>80){
         clearInterval(timer);
         reject(new Error('No se pudo cargar la biblioteca de Supabase.'));
       }
     },100);

     return;
   }

   window.__CCF_SUPABASE_FALLBACK_LOADING__=true;

   const script=document.createElement('script');
   script.src='https://unpkg.com/@supabase/supabase-js@2';
   script.async=true;

   script.onload=()=>{
     if(window.supabase?.createClient){
       resolve(true);
     }else{
       reject(new Error(
         'Supabase se cargó, pero no expuso createClient.'
       ));
     }
   };

   script.onerror=()=>{
     reject(new Error(
       'No se pudo cargar la biblioteca de Supabase. Revisa la conexión a Internet o los bloqueadores del navegador.'
     ));
   };

   document.head.appendChild(script);
 });
}

async function waitClient(){
 for(let i=0;i<30;i++){
   if(installClient())return client;
   await sleep(100);
 }

 status('Cargando componente de acceso…');

 try{
   await loadSupabaseFallback();
 }catch(e){
   throw e;
 }

 for(let i=0;i<30;i++){
   if(installClient())return client;
   await sleep(100);
 }

 throw new Error('La biblioteca de Supabase no se cargó.');
}

async function openApp(){
 /* B1.9.6 FINAL: no intermediate configuration/blank state. */
 revealApp();

 /* Allow the mobile shell to mount Resumen immediately. */
 try{ window.dispatchEvent(new Event('ccf:app-ready')); }catch(_){}
 try{ window.CCFMobileB43?.refresh?.(); }catch(_){}

 /* Data connection remains asynchronous and never gates the UI. */
 setTimeout(()=>{
   try{
     if(typeof window.connect==='function') window.connect().catch(()=>{});
   }catch(_){}
 },0);

 setTimeout(()=>{
   try{
     if(typeof window.refresh==='function') window.refresh().catch(()=>{});
   }catch(_){}
   try{ window.CCFMobileB43?.refresh?.(); }catch(_){}
 },350);

 return true;
}

async function submitAuth(){
 const btn=$('ccf-submit');
 const email=$('ccf-email')?.value.trim();
 const password=$('ccf-password')?.value||'';

 if(!email||!password){
   status('Completa correo y contraseña.',true);
   return;
 }

 if(password.length<8){
   status('La contraseña debe tener al menos 8 caracteres.',true);
   return;
 }

 btn.disabled=true;

 status(
   mode==='register'
     ? 'Creando cuenta…'
     : 'Validando credenciales…'
 );

 try{
   if(mode==='register'){
     const {data,error}=await client.auth.signUp({
       email,
       password,
       options:{
         emailRedirectTo:
           window.location.origin+window.location.pathname
       }
     });

     if(error)throw error;

     if(data?.session){
       await openApp();
       setTimeout(()=>revealApp(),0);
       setTimeout(()=>revealApp(),500);
       setTimeout(()=>revealApp(),1500);
     }else{
       status(
         'Cuenta creada. Revisa tu correo para confirmar la cuenta y luego inicia sesión.'
       );
     }

   }else{
     const {data,error}=await client.auth.signInWithPassword({
       email,
       password
     });

     if(error)throw error;

     if(!data?.session){
       throw new Error(
         'Supabase no entregó una sesión activa.'
       );
     }

     await openApp();
     setTimeout(()=>revealApp(),0);
     setTimeout(()=>revealApp(),500);
     setTimeout(()=>revealApp(),1500);
   }

 }catch(e){
   console.error('[CCF AUTH] auth',e);
   status(
     e?.message||'No fue posible completar la operación.',
     true
   );
 }finally{
   btn.disabled=false;
 }
}

function installForms(){
 $('ccf-auth-form')?.addEventListener(
   'submit',
   e=>{
     e.preventDefault();
     submitAuth();
   }
 );

 const logout=$('logoutBtn');

 if(
   logout &&
   !logout.dataset.ccfFinalAuth
 ){
   logout.dataset.ccfFinalAuth='1';

   logout.addEventListener(
     'click',
     async e=>{
       e.preventDefault();
       e.stopImmediatePropagation();

       try{
         await client?.auth?.signOut({scope:'local'});
       }finally{
         location.reload();
       }
     },
     true
   );
 }
}

async function boot(){
  /*
   * B1.9.6 DEFINITIVO V3
   * Flujo único: ABRIR CCF -> LOGIN -> RESUMEN.
   * El LOGIN se monta inmediatamente y la autenticación se inicializa
   * en segundo plano. No se utiliza MutationObserver global.
   */
  installAccessBaseStyle();
  hideLegacy();

  /* B230 no forma parte del flujo final. Se retira inmediatamente. */
  $('ccf-b230-final')?.remove();

  /* LOGIN es la única superficie visible antes de autenticarse. */
  let gate=$('ccf-auth-gate');
  if(!gate){
    portal();
    gate=$('ccf-auth-gate');
  }
  if(gate){
    mode='login';
    setMode('login');
    gate.style.display='';
    gate.style.visibility='visible';
    gate.removeAttribute('aria-hidden');
    installForms();
    requestAnimationFrame(()=>$('ccf-email')?.focus());
  }

  /* Nunca bloqueamos la pantalla de acceso esperando a Supabase. */
  try{
    await waitClient();
    const {data,error}=await client.auth.getSession();
    if(error)throw error;

    if(data?.session){
      await openApp();
      return;
    }

    status('Ingresa con tu cuenta.');
  }catch(e){
    console.error('[CCF AUTH] boot',e);
    /* El formulario continúa disponible aunque Supabase tarde o falle. */
    status('Ingresa con tu cuenta.',false);
  }
}

function showLoginOnly(){
  installAccessBaseStyle();
  hideLegacy();
  $('ccf-b230-final')?.remove();

  let gate=$('ccf-auth-gate');
  if(!gate){
    portal();
    gate=$('ccf-auth-gate');
  }
  if(!gate)return;

  mode='login';
  setMode('login');
  gate.style.display='';
  gate.style.visibility='visible';
  gate.removeAttribute('aria-hidden');
  installForms();
  requestAnimationFrame(()=>$('ccf-email')?.focus());
}

/*
 * No instalar un MutationObserver global aquí.
 * La versión anterior observaba class/style/aria-hidden y luego modificaba
 * esos mismos atributos, generando un ciclo de mutaciones que podía
 * congelar la interfaz móvil.
 */

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
else boot();

})();

