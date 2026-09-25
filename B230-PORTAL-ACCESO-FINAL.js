/* CCF B230 FINAL — PORTAL DE ACCESO
   Landing principal para el Centro de Control Financiero.
   Reutiliza la autenticación Supabase existente; no toca datos.
*/
(() => {
  'use strict';
  if (window.__CCF_B230_FINAL__) return;
  window.__CCF_B230_FINAL__ = true;

  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => [...r.querySelectorAll(s)];
  const clp = n => '$' + Number(n||0).toLocaleString('es-CL');

  const DEMO = {
    saldo: 842500, ingresos:1150492, gastos:903394,
    comprometido:720000, proyectado:440964,
    futuroIngresos:296866, deudas:676000
  };

  function styles(){
    if ($('#ccf-b230-final-style')) return;
    const s=document.createElement('style');
    s.id='ccf-b230-final-style';
    s.textContent=`
      #ccf-b230-final,#ccf-b230-final *{box-sizing:border-box}
      #ccf-b230-final{position:fixed;inset:0;z-index:2147483000;overflow:auto;color:#eef6ff;
        background:radial-gradient(circle at 78% 8%,rgba(22,136,232,.22),transparent 31%),
        radial-gradient(circle at 10% 32%,rgba(54,199,255,.10),transparent 28%),
        linear-gradient(135deg,#050b14,#07111f 52%,#09192b);
        font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
      .c230-wrap{width:min(1180px,calc(100% - 32px));margin:auto}
      .c230-nav{position:sticky;top:0;z-index:20;border-bottom:1px solid rgba(148,163,184,.17);
        background:rgba(5,11,20,.80);backdrop-filter:blur(18px)}
      .c230-navin{min-height:72px;display:flex;align-items:center;justify-content:space-between;gap:18px}
      .c230-brand{display:flex;gap:11px;align-items:center}.c230-mark{width:40px;height:40px;border-radius:12px;
        display:grid;place-items:center;background:linear-gradient(145deg,#1688e8,#0b4f93);font-weight:900}
      .c230-brand strong{display:block;font-size:15px}.c230-brand span{display:block;color:#9db0c7;font-size:10px;margin-top:2px}
      .c230-actions{display:flex;gap:8px}.c230-btn{border:1px solid rgba(148,163,184,.20);background:rgba(255,255,255,.045);
        color:#eef6ff;border-radius:11px;padding:10px 15px;font-weight:800;cursor:pointer}
      .c230-primary{border-color:transparent;background:linear-gradient(135deg,#1688e8,#0e65b7);box-shadow:0 10px 28px rgba(22,136,232,.25)}
      .c230-hero{padding:70px 0 45px}.c230-grid{display:grid;grid-template-columns:1.1fr .9fr;gap:42px;align-items:center}
      .c230-kicker{display:inline-flex;gap:8px;align-items:center;padding:7px 10px;border:1px solid rgba(54,199,255,.22);
        border-radius:999px;color:#9cddff;font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:.08em}
      .c230-dot{width:7px;height:7px;border-radius:50%;background:#37d39a;box-shadow:0 0 13px #37d39a}
      .c230-hero h1{font-size:clamp(42px,6vw,76px);line-height:.96;letter-spacing:-.055em;margin:18px 0}
      .c230-hero h1 em{font-style:normal;color:#54caff}.c230-lead{max-width:680px;color:#b6c6d9;font-size:18px;line-height:1.65}
      .c230-ctas{display:flex;gap:10px;flex-wrap:wrap;margin-top:25px}.c230-mini{display:flex;gap:15px;flex-wrap:wrap;color:#91a6bd;font-size:12px;margin-top:18px}
      .c230-visual{border:1px solid rgba(148,163,184,.17);border-radius:24px;padding:18px;background:linear-gradient(145deg,rgba(16,34,56,.94),rgba(7,17,31,.84));box-shadow:0 24px 70px rgba(0,0,0,.32)}
      .c230-cards{display:grid;grid-template-columns:1.3fr .7fr;gap:10px}.c230-card{border:1px solid rgba(148,163,184,.17);
        background:rgba(255,255,255,.045);border-radius:15px;padding:14px}.c230-card small{color:#8ea4bb;font-size:10px;text-transform:uppercase}
      .c230-value{font-size:24px;font-weight:900;margin-top:7px}.c230-bars{height:125px;display:flex;align-items:end;gap:7px;margin-top:10px}
      .c230-bars i{flex:1;border-radius:5px 5px 2px 2px;background:linear-gradient(#36c7ff,#126fc3)}
      .c230-row{display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid rgba(148,163,184,.12);font-size:11px;color:#aabbd0}
      .c230-row:last-child{border:0}.c230-pos{color:#37d39a}.c230-neg{color:#ff7884}
      .c230-section{padding:54px 0}.c230-head{margin-bottom:20px}.c230-head h2{font-size:31px;letter-spacing:-.035em;margin:0 0 8px}.c230-head p{color:#9db0c7;max-width:700px;line-height:1.6}
      .c230-demo{border:1px solid rgba(148,163,184,.17);border-radius:22px;overflow:hidden;background:rgba(10,24,40,.88)}
      .c230-tabs{display:flex;gap:6px;overflow:auto;padding:12px;border-bottom:1px solid rgba(148,163,184,.14)}
      .c230-tab{white-space:nowrap;border:1px solid transparent;background:transparent;color:#8fa4bb;padding:9px 11px;border-radius:9px;font-weight:800;cursor:pointer}
      .c230-tab.active{color:#fff;background:rgba(22,136,232,.17);border-color:rgba(22,136,232,.35)}
      .c230-demo-body{padding:18px}.c230-kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}.c230-kpi{padding:14px;border:1px solid rgba(148,163,184,.15);border-radius:13px;background:rgba(255,255,255,.035)}
      .c230-kpi span{display:block;color:#8ea4bb;font-size:10px;text-transform:uppercase}.c230-kpi strong{display:block;font-size:19px;margin-top:6px}
      .c230-features{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.c230-feature{padding:20px;border:1px solid rgba(148,163,184,.15);border-radius:16px;background:rgba(255,255,255,.03)}
      .c230-feature h3{font-size:15px;margin:10px 0 6px}.c230-feature p{font-size:12px;line-height:1.6;color:#92a7bd;margin:0}
      .c230-final{text-align:center;padding:70px 0}.c230-finalbox{border:1px solid rgba(54,199,255,.2);border-radius:24px;padding:45px 24px;background:radial-gradient(circle at 50% 0,rgba(22,136,232,.18),transparent 42%),rgba(10,25,42,.8)}
      .c230-final h2{font-size:clamp(30px,4vw,48px);margin:0 0 10px}.c230-final p{color:#9fb1c5;max-width:650px;margin:0 auto 24px;line-height:1.6}
      .c230-footer{border-top:1px solid rgba(148,163,184,.17);padding:32px 0;text-align:center;color:#8195ab}
      .c230-footer strong{display:block;color:#d8e5f1;font-size:12px}.c230-footer span{font-size:11px}
      .c230-modal{position:fixed;inset:0;z-index:50;display:grid;place-items:center;padding:20px;background:rgba(1,7,14,.76);backdrop-filter:blur(12px)}
      .c230-modal.hidden{display:none}.c230-auth{width:min(430px,100%);border:1px solid rgba(148,163,184,.18);border-radius:20px;background:#0b1828;padding:24px;box-shadow:0 35px 100px rgba(0,0,0,.55)}
      .c230-auth h3{margin:0 0 6px;font-size:24px}.c230-auth p{color:#8fa4bb;font-size:12px;line-height:1.5}.c230-field{display:grid;gap:6px;margin:12px 0}.c230-field label{font-size:11px;font-weight:800;color:#b9c9d9}
      .c230-field input{width:100%;height:46px;border-radius:10px;border:1px solid rgba(148,163,184,.20);background:#07111f;color:#fff;padding:0 12px}
      .c230-auth form button{width:100%}.c230-link{border:0;background:none;color:#54caff;font-weight:800;cursor:pointer}.c230-status{min-height:18px;font-size:11px;color:#a9bad0}.c230-hidden{display:none!important}
      .c230-close{float:right;border:0;background:none;color:#9fb1c5;font-size:24px;cursor:pointer}
      @media(max-width:900px){.c230-grid{grid-template-columns:1fr}.c230-features{grid-template-columns:1fr 1fr}.c230-kpis{grid-template-columns:1fr 1fr}}
      @media(max-width:620px){.c230-navin{min-height:64px}.c230-brand span{display:none}.c230-actions .c230-btn{padding:8px 10px;font-size:11px}.c230-hero{padding:45px 0 25px}.c230-hero h1{font-size:45px}.c230-lead{font-size:15px}.c230-cards{grid-template-columns:1fr}.c230-features{grid-template-columns:1fr}.c230-kpis{grid-template-columns:1fr 1fr}.c230-section{padding:40px 0}}
    `;
    document.head.appendChild(s);
  }

  function app(){return document.getElementById('app');}
  function hideApp(){const a=app();if(a)a.classList.add('c230-hidden');}
  function showApp(){const a=app();if(a){a.classList.remove('hidden');a.classList.remove('c230-hidden');a.style.removeProperty('display')}}

  function demo(key){
    const body=$('#c230-demo-body'); if(!body)return;
    const rows={
      resumen:[['Saldo disponible',clp(DEMO.saldo)],['Ingresos ejecutados',clp(DEMO.ingresos)],['Egresos ejecutados',clp(DEMO.gastos)],['Resultado proyectado',clp(DEMO.proyectado)]],
      liquidez:[['Liquidez',clp(DEMO.saldo)],['Ingresos futuros',clp(DEMO.futuroIngresos)],['Obligaciones',clp(DEMO.comprometido)],['Resultado',clp(DEMO.proyectado)]],
      deudas:[['Deuda pendiente',clp(DEMO.deudas)],['Cuotas programadas',clp(420000)],['Pagado simulado',clp(185000)],['Flujo','Deuda → Cuota → Pago']],
      presupuesto:[['Ingresos planificados',clp(1320000)],['Egresos planificados',clp(1067110)],['Resultado del plan',clp(252890)],['Ahorro planificado',clp(100000)]],
      proyeccion:[['Ingresos futuros',clp(DEMO.futuroIngresos)],['Egresos futuros',clp(103000)],['Comprometido',clp(DEMO.comprometido)],['Resultado',clp(DEMO.proyectado)]],
      movimientos:[['Ingreso',clp(58500)],['Combustible',clp(-12000)],['Alimentación',clp(-10000)],['Pago de deuda',clp(-20000)]],
      calendario:[['Septiembre 2026','Actividad financiera'],['Ingresos','Registrados'],['Gastos','Registrados'],['Pagos','Programados']],
      operaciones:[['Operación','Pago de deuda'],['Cuota','#04'],['Monto',clp(20000)],['Estado','Registrada']]
    };
    body.innerHTML=`<div class="c230-kpis">${(rows[key]||rows.resumen).map(r=>`<article class="c230-kpi"><span>${r[0]}</span><strong>${r[1]}</strong></article>`).join('')}</div>`;
    $$('.c230-tab').forEach(x=>x.classList.toggle('active',x.dataset.key===key));
  }

  function modal(mode){
    const m=$('#c230-modal'), login=$('#c230-login'), reg=$('#c230-register');
    if(!m)return;
    m.classList.remove('hidden');
    login.style.display=mode==='login'?'block':'none';
    reg.style.display=mode==='register'?'block':'none';
    $('#c230-title').textContent=mode==='login'?'Iniciar sesión':'Crear cuenta';
    $('#c230-copy').textContent=mode==='login'?'Accede a tu Centro de Control Financiero.':'Crea tu acceso al sistema financiero.';
    setTimeout(()=>$(mode==='login'?'#c230-email':'#c230-name')?.focus(),60);
  }
  function status(t,error=false){const n=$('#c230-status');if(n){n.textContent=t;n.style.color=error?'#ff8791':'#a9bad0'}}

  async function auth(){
    const c=window.supabaseClient||window.__B23273_CLIENT__||window.__B23270_CLIENT__||window.__B23269_CLIENT__;
    if(c?.auth)return c;
    for(let i=0;i<80;i++){await new Promise(r=>setTimeout(r,100));const x=window.supabaseClient||window.__B23273_CLIENT__||window.__B23270_CLIENT__||window.__B23269_CLIENT__;if(x?.auth)return x}
    throw new Error('El módulo de autenticación todavía no está disponible.');
  }
  async function enter(){
    status('Sesión válida. Abriendo el Centro de Control…');
    try{if(typeof window.connect==='function')await window.connect();showApp();$('#ccf-b230-final')?.remove();if(typeof window.refresh==='function')setTimeout(()=>window.refresh(),0)}
    catch(e){status(e?.message||'No fue posible abrir el sistema.',true)}
  }
  async function login(){
    const email=$('#c230-email').value.trim(),password=$('#c230-password').value;
    if(!email||!password){status('Completa correo y contraseña.',true);return}
    status('Iniciando sesión…');
    try{const c=await auth();const {data,error}=await c.auth.signInWithPassword({email,password});if(error)throw error;if(!data?.session)throw new Error('No se recibió una sesión activa.');await enter()}
    catch(e){status(e?.message||'No fue posible iniciar sesión.',true)}
  }
  async function register(){
    const name=$('#c230-name').value.trim(),email=$('#c230-reg-email').value.trim(),p=$('#c230-reg-password').value,c=$('#c230-reg-confirm').value;
    if(p.length<8){status('La contraseña debe tener al menos 8 caracteres.',true);return}
    if(p!==c){status('Las contraseñas no coinciden.',true);return}
    status('Creando cuenta…');
    try{const client=await auth();const {data,error}=await client.auth.signUp({email,password:p,options:{data:{full_name:name},emailRedirectTo:window.location.origin+window.location.pathname}});if(error)throw error;if(data?.session){await enter()}else status('Cuenta creada. Revisa tu correo para confirmar la cuenta y luego inicia sesión.')}
    catch(e){status(e?.message||'No fue posible crear la cuenta.',true)}
  }
  async function recover(){
    const email=$('#c230-email').value.trim();if(!email){status('Ingresa primero tu correo.',true);return}
    try{const c=await auth();const {error}=await c.auth.resetPasswordForEmail(email,{redirectTo:window.location.origin+window.location.pathname});if(error)throw error;status('Si el correo está registrado, recibirás las instrucciones de recuperación.')}
    catch(e){status(e?.message||'No fue posible solicitar la recuperación.',true)}
  }

  function html(){
    return `<div id="ccf-b230-final">
      <nav class="c230-nav"><div class="c230-wrap c230-navin">
        <div class="c230-brand"><div class="c230-mark">CCF</div><div><strong>Centro de Control Financiero</strong><span>Gestión · Liquidez · Planificación</span></div></div>
        <div class="c230-actions"><button class="c230-btn" data-auth="login">Iniciar sesión</button><button class="c230-btn c230-primary" data-auth="register">Crear cuenta</button></div>
      </div></nav>
      <section class="c230-hero"><div class="c230-wrap c230-grid"><div>
        <div class="c230-kicker"><i class="c230-dot"></i> Sistema financiero integral</div>
        <h1>Toma el control.<br><em>Construye tu futuro.</em></h1>
        <p class="c230-lead">CCF transforma tus ingresos, gastos, deudas, liquidez y objetivos en un sistema financiero organizado, operativo y proyectable.</p>
        <div class="c230-ctas"><button class="c230-btn c230-primary" data-auth="register">Comenzar ahora →</button><button class="c230-btn" data-scroll>Explorar el sistema</button></div>
        <div class="c230-mini"><span>✓ Control centralizado</span><span>✓ Datos en tiempo real</span><span>✓ Proyección financiera</span></div>
      </div><div class="c230-visual"><div class="c230-cards"><div class="c230-card"><small>Resultado proyectado</small><div class="c230-value">${clp(DEMO.proyectado)}</div><div class="c230-bars">${[35,51,44,67,58,80,94].map(h=>`<i style="height:${h}%"></i>`).join('')}</div></div><div class="c230-card"><small>Liquidez</small><div class="c230-value">${clp(DEMO.saldo)}</div></div></div><div class="c230-card" style="margin-top:10px"><small>Centro de operaciones</small><div class="c230-row"><span>Ingresos</span><b class="c230-pos">${clp(DEMO.ingresos)}</b></div><div class="c230-row"><span>Egresos</span><b class="c230-neg">${clp(DEMO.gastos)}</b></div><div class="c230-row"><span>Obligaciones</span><b>${clp(DEMO.comprometido)}</b></div></div></div></div></section>
      <section class="c230-section" id="c230-explore"><div class="c230-wrap"><div class="c230-head"><h2>Conoce CCF en operación</h2><p>Explora una representación funcional con datos simulados antes de crear tu cuenta.</p></div><div class="c230-demo"><div class="c230-tabs">${['resumen','liquidez','deudas','presupuesto','proyeccion','movimientos','calendario','operaciones'].map((x,i)=>`<button class="c230-tab ${i?'':'active'}" data-key="${x}">${x[0].toUpperCase()+x.slice(1)}</button>`).join('')}</div><div id="c230-demo-body" class="c230-demo-body"></div></div></div></section>
      <section class="c230-section"><div class="c230-wrap"><div class="c230-head"><h2>Un sistema, un flujo financiero</h2><p>Registra, controla, proyecta y organiza en un mismo entorno.</p></div><div class="c230-features"><article class="c230-feature"><h3>Liquidez</h3><p>Conoce el dinero disponible y su distribución.</p></article><article class="c230-feature"><h3>Deudas</h3><p>Controla saldos, cuotas, vencimientos y pagos.</p></article><article class="c230-feature"><h3>Presupuesto</h3><p>Compara planificación, ejecución y resultado.</p></article><article class="c230-feature"><h3>Proyección</h3><p>Visualiza ingresos y egresos futuros.</p></article><article class="c230-feature"><h3>Movimientos</h3><p>Registra y controla cada operación.</p></article><article class="c230-feature"><h3>Calendario</h3><p>Visualiza compromisos y actividad por fecha.</p></article><article class="c230-feature"><h3>Cuentas</h3><p>Organiza tus distintas fuentes de dinero.</p></article><article class="c230-feature"><h3>Operaciones</h3><p>Ejecuta pagos y movimientos con trazabilidad.</p></article><article class="c230-feature"><h3>Ahorro</h3><p>Registra aportes, retiros y evolución.</p></article></div></div></section>
      <section class="c230-final"><div class="c230-wrap"><div class="c230-finalbox"><h2>Ya viste cómo funciona.</h2><p>Ahora puedes crear tu propia estructura financiera y comenzar a registrar tus datos reales.</p><button class="c230-btn c230-primary" data-auth="register">Crear mi cuenta →</button></div></div></section>
      <footer class="c230-footer"><div class="c230-wrap"><strong>CCF · Centro de Control Financiero</strong><span>Producto desarrollado por Somos Software · Innovación Digital</span></div></footer>
      <div class="c230-modal hidden" id="c230-modal"><div class="c230-auth"><button class="c230-close" data-close>×</button><h3 id="c230-title">Iniciar sesión</h3><p id="c230-copy">Accede a tu Centro de Control Financiero.</p>
        <form id="c230-login"><div class="c230-field"><label>Correo electrónico</label><input id="c230-email" type="email" autocomplete="email" required></div><div class="c230-field"><label>Contraseña</label><input id="c230-password" type="password" required></div><button class="c230-btn c230-primary" type="submit">Iniciar sesión</button><p>¿No tienes cuenta? <button type="button" class="c230-link" data-auth="register">Crear cuenta</button></p><button type="button" class="c230-link" data-recover>Recuperar contraseña</button></form>
        <form id="c230-register" style="display:none"><div class="c230-field"><label>Nombre</label><input id="c230-name" required></div><div class="c230-field"><label>Correo electrónico</label><input id="c230-reg-email" type="email" required></div><div class="c230-field"><label>Contraseña</label><input id="c230-reg-password" type="password" minlength="8" required></div><div class="c230-field"><label>Confirmar contraseña</label><input id="c230-reg-confirm" type="password" minlength="8" required></div><button class="c230-btn c230-primary" type="submit">Crear cuenta</button><p>¿Ya tienes cuenta? <button type="button" class="c230-link" data-auth="login">Iniciar sesión</button></p></form>
        <p id="c230-status" class="c230-status"></p></div></div>
    </div>`;
  }

  function boot(){
    styles();
    if ($('#ccf-b230-final')) return;
    hideApp();
    document.body.insertAdjacentHTML('afterbegin',html());
    demo('resumen');
    $$('#ccf-b230-final [data-auth]').forEach(b=>b.addEventListener('click',()=>modal(b.dataset.auth)));
    $$('#ccf-b230-final .c230-tab').forEach(b=>b.addEventListener('click',()=>demo(b.dataset.key)));
    $('[data-scroll]','#ccf-b230-final')?.addEventListener('click',()=>$('#c230-explore')?.scrollIntoView({behavior:'smooth'}));
    $('[data-close]','#ccf-b230-final')?.addEventListener('click',()=>$('#c230-modal')?.classList.add('hidden'));
    $('#c230-modal')?.addEventListener('click',e=>{if(e.target.id==='c230-modal')e.currentTarget.classList.add('hidden')});
    $('#c230-login')?.addEventListener('submit',e=>{e.preventDefault();login()});
    $('#c230-register')?.addEventListener('submit',e=>{e.preventDefault();register()});
    $('[data-recover]','#ccf-b230-final')?.addEventListener('click',recover);
    setTimeout(async()=>{try{const c=await auth();const {data}=await c.auth.getSession();if(data?.session) await enter()}catch(_){ }},350);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true}); else boot();
})();
