/* FINANZAS B2.21 — Motor de Movimientos + Liquidez
   Integración real con Supabase + sesión autenticada.
   Integra movimientos reales con efectivo/cuentas
   y separa gasto operativo de pago de deuda.
*/
(()=>{'use strict';

const $=id=>document.getElementById(id);

const money=n=>
  new Intl.NumberFormat('es-CL',{
    style:'currency',
    currency:'CLP',
    maximumFractionDigits:0
  }).format(Number(n)||0);

const today=()=>{
  const d=new Date();
  return new Date(
    d.getTime()-d.getTimezoneOffset()*60000
  ).toISOString().slice(0,10);
};

let accounts=[];

/* ============================================================
   B2.21 — CLIENTE SUPABASE CENTRAL
   ------------------------------------------------------------
   Prioridad:
   1. Cliente autenticado del sistema B20/S19.
   2. Cliente central Finanzas.
   3. No crea un cliente paralelo sin sesión.
   ============================================================ */

const getDb=()=>{
  if(
    window.B20_AUTH &&
    window.B20_AUTH.client
  ){
    return window.B20_AUTH.client;
  }

  if(window.supabaseClient){
    return window.supabaseClient;
  }

  return null;
};


/* ============================================================
   CUENTAS BANCARIAS
   ============================================================ */

async function loadAccounts(){

  const c=getDb();

  if(!c){
    console.warn(
      '[B2.21] Cliente Supabase autenticado no disponible.'
    );
    return [];
  }

  const r=await c
    .from('cuentas_bancarias')
    .select(
      'id,nombre_banco,nombre_cuenta,saldo_actual,activa'
    )
    .eq('activa',true)
    .order('nombre_banco');

  if(r.error){

    console.error(
      '[B2.21] Error cargando cuentas:',
      r.error
    );

    accounts=[];

    return [];
  }

  accounts=r.data||[];

  return accounts;
}


/* ============================================================
   CAMPOS FINANCIEROS
   ============================================================ */

function injectFields(){

  const form=$('movForm');

  if(!form || $('b221FinanceBox')) return;

  const box=document.createElement('div');

  box.id='b221FinanceBox';
  box.className='full';

  box.innerHTML=`
    <div class="b221-finance">

      <div>
        <b>Impacto financiero</b>
        <small>
          Define dónde sale o entra realmente el dinero.
        </small>
      </div>

      <label>
        Medio

        <select id="b221Medium">

          <option value="efectivo">
            Efectivo / caja
          </option>

          <option value="cuenta_bancaria">
            Cuenta bancaria
          </option>

        </select>

      </label>

      <label
        id="b221AccountWrap"
        style="display:none"
      >
        Cuenta

        <select id="b221Account"></select>

      </label>

      <label>
        Naturaleza

        <select id="b221Nature">

          <option value="gasto">
            Gasto operativo
          </option>

          <option value="ingreso">
            Ingreso real
          </option>

        </select>

      </label>

    </div>
  `;

  form
    .querySelector('.form-actions')
    ?.before(box);


  const medium=$('b221Medium');

  if(medium){
    medium.onchange=toggleAccount;
  }


  const nature=$('b221Nature');

  if(nature){

    nature.onchange=()=>{

      if($('movTipo')){

        const tipo=$('movTipo').value;

        if(tipo==='ingreso'){
          nature.value='ingreso';
        }else{
          nature.value='gasto';
        }

      }

    };

  }


  const movTipo=$('movTipo');

  if(movTipo){

    movTipo.addEventListener(
      'change',
      ()=>{
        if($('b221Nature')){

          $('b221Nature').value=
            movTipo.value==='ingreso'
              ?'ingreso'
              :'gasto';

        }
      }
    );

  }

}


/* ============================================================
   CUENTAS — SELECT
   ============================================================ */

function fillAccounts(selected=''){

  const s=$('b221Account');

  if(!s) return;

  s.innerHTML=
    '<option value="">Seleccionar cuenta…</option>'+
    accounts.map(a=>`

      <option value="${a.id}">
        ${a.nombre_banco}
        ·
        ${a.nombre_cuenta}
        ·
        ${money(a.saldo_actual)}
      </option>

    `).join('');

  if(selected){
    s.value=String(selected);
  }

}


/* ============================================================
   MEDIO DE PAGO → CUENTA
   ============================================================ */

function toggleAccount(){

  const medium=$('b221Medium');

  const wrap=$('b221AccountWrap');

  if(!medium || !wrap) return;

  const bank=
    medium.value==='cuenta_bancaria';

  wrap.style.display=
    bank
      ?'flex'
      :'none';

}


/* ============================================================
   OBTENER DATOS DEL FORMULARIO
   ============================================================ */

function getValues(){

  const medium=
    $('b221Medium')
      ?$('b221Medium').value
      :'efectivo';

  const account=
    $('b221Account');

  return{

    tipo:
      $('movTipo')
        ?$('movTipo').value
        :'gasto',

    fecha:
      $('movFecha')
        ?$('movFecha').value
        :today(),

    monto:
      Number(
        $('movMonto')
          ?$('movMonto').value
          :0
      ),

    categoria:
      $('movCategoria')
        ?$('movCategoria').value.trim()||null
        :null,

    descripcion:
      $('movDescripcion')
        ?$('movDescripcion').value.trim()||null
        :null,

    medio_pago:medium,

    cuenta_id:
      medium==='cuenta_bancaria'
        ?Number(account?.value||0)||null
        :null,

    naturaleza:
      $('b221Nature')
        ?$('b221Nature').value
        :'gasto'

  };

}


/* ============================================================
   GUARDAR / EDITAR MOVIMIENTO
   ============================================================ */

async function saveMovement(e){

  e.preventDefault();

  const c=getDb();

  if(!c){

    if($('movMsg')){

      $('movMsg').textContent=
        'Sesión de usuario no disponible. '+
        'Inicia sesión nuevamente.';

    }

    console.error(
      '[B2.21] No existe cliente Supabase autenticado.'
    );

    return;
  }


  const id=
    $('movId')
      ?$('movId').value
      :'';

  const p=getValues();


  /* ----------------------------------------------------------
     VALIDACIONES
     ---------------------------------------------------------- */

  if(!p.monto || p.monto<=0){

    if($('movMsg')){

      $('movMsg').textContent=
        'Ingresa un monto válido.';

    }

    return;
  }


  if(
    p.medio_pago==='cuenta_bancaria' &&
    !p.cuenta_id
  ){

    if($('movMsg')){

      $('movMsg').textContent=
        'Selecciona la cuenta bancaria.';

    }

    return;
  }


  if($('movMsg')){

    $('movMsg').textContent=
      'Aplicando movimiento y actualizando liquidez…';

  }


  /* ----------------------------------------------------------
     RPC FINANCIERA
     ---------------------------------------------------------- */

  let rpc;


  if(id){

    rpc=await c.rpc(
      'actualizar_movimiento_liquidez_v1',
      {
        p_movimiento_id:Number(id),

        p_tipo:p.tipo,

        p_fecha:p.fecha,

        p_monto:p.monto,

        p_categoria:p.categoria,

        p_descripcion:p.descripcion,

        p_medio_pago:p.medio_pago,

        p_cuenta_id:p.cuenta_id,

        p_naturaleza:p.naturaleza
      }
    );

  }else{

    rpc=await c.rpc(
      'registrar_movimiento_liquidez_v1',
      {
        p_tipo:p.tipo,

        p_fecha:p.fecha,

        p_monto:p.monto,

        p_categoria:p.categoria,

        p_descripcion:p.descripcion,

        p_medio_pago:p.medio_pago,

        p_cuenta_id:p.cuenta_id,

        p_naturaleza:p.naturaleza
      }
    );

  }


  /* ----------------------------------------------------------
     ERROR RPC
     ---------------------------------------------------------- */

  if(rpc.error){

    console.error(
      '[B2.21] Error RPC:',
      rpc.error
    );

    if($('movMsg')){

      $('movMsg').textContent=
        rpc.error.message||
        'No fue posible guardar el movimiento.';

    }

    return;
  }


  /* ----------------------------------------------------------
     ÉXITO
     ---------------------------------------------------------- */

  if($('movMsg')){

    $('movMsg').textContent=
      id
        ?'Movimiento y liquidez actualizados.'
        :'Movimiento registrado y liquidez actualizada.';

  }


  if(typeof window.resetMov==='function'){

    window.resetMov();

  }else{

    const form=$('movForm');

    if(form){
      form.reset();
    }

    if($('movFecha')){
      $('movFecha').value=today();
    }

  }


  await refreshKPIs();

}


/* ============================================================
   EDITAR MOVIMIENTO
   ============================================================ */

async function openEdit(s){

  let r=null;

  try{

    r=JSON.parse(
      decodeURIComponent(
        escape(
          atob(s)
        )
      )
    );

  }catch(_){

    console.error(
      '[B2.21] No fue posible interpretar movimiento.'
    );

    return;

  }

  if(!r) return;


  $('movId').value=r.id;

  $('movTipo').value=r.tipo;

  $('movFecha').value=r.fecha;

  $('movMonto').value=r.monto;

  $('movCategoria').value=
    r.categoria||'';

  $('movDescripcion').value=
    r.descripcion||'';


  await loadAccounts();

  fillAccounts(
    r.cuenta_id||''
  );


  if($('b221Medium')){

    $('b221Medium').value=
      r.medio_pago||'efectivo';

  }

  toggleAccount();


  if($('b221Nature')){

    $('b221Nature').value=
      r.naturaleza||
      r.tipo;

  }


  if($('movFormTitle')){

    $('movFormTitle').textContent=
      'Editar movimiento · liquidez';

  }


  if($('movSubmit')){

    $('movSubmit').textContent=
      'Guardar cambios';

  }


  if($('movCancel')){

    $('movCancel')
      .classList
      .remove('hidden');

  }


  document
    .querySelector(
      '[data-tab="movimientos"]'
    )
    ?.click();


  scrollTo({
    top:0,
    behavior:'smooth'
  });

}


/* ============================================================
   PUENTE DE EDICIÓN
   ============================================================ */

function enhanceEdit(){

  window.editMovEncoded=openEdit;

}


/* ============================================================
   KPIs
   ============================================================ */

async function refreshKPIs(){

  const c=getDb();

  if(!c) return;


  const [

    {data:mov,error:movError},

    {data:payments,error:paymentsError}

  ]=await Promise.all([

    c
      .from('movimientos')
      .select(
        'id,tipo,fecha,monto,naturaleza,liquidez_aplicada'
      ),

    c
      .from('pagos_deuda')
      .select('movimiento_id')

  ]);


  if(movError){

    console.error(
      '[B2.21] Error leyendo movimientos:',
      movError
    );

  }


  if(paymentsError){

    console.error(
      '[B2.21] Error leyendo pagos de deuda:',
      paymentsError
    );

  }


  const debtIds=
    new Set(
      (payments||[])
        .map(
          x=>Number(x.movimiento_id)
        )
        .filter(Boolean)
    );


  const t=today();

  const prefix=
    t.slice(0,7);


  const real=
    (mov||[])
      .filter(
        x=>x.fecha<=t
      );


  const income=
    real
      .filter(
        x=>
          x.tipo==='ingreso' &&
          x.fecha.startsWith(prefix)
      )
      .reduce(
        (s,x)=>
          s+Number(x.monto),
        0
      );


  const expense=
    real
      .filter(
        x=>
          x.tipo==='gasto' &&
          x.fecha.startsWith(prefix) &&
          !debtIds.has(Number(x.id))
      )
      .reduce(
        (s,x)=>
          s+Number(x.monto),
        0
      );


  const debt=
    real
      .filter(
        x=>
          x.tipo==='gasto' &&
          x.fecha.startsWith(prefix) &&
          debtIds.has(Number(x.id))
      )
      .reduce(
        (s,x)=>
          s+Number(x.monto),
        0
      );


  /* ----------------------------------------------------------
     KPI PAGOS DE DEUDA
     ---------------------------------------------------------- */

  let box=
    document.getElementById(
      'b221DebtKpi'
    );


  if(!box){

    const host=
      document.querySelector(
        '#dashboard .cards'
      );

    if(host){

      box=
        document.createElement(
          'article'
        );

      box.id=
        'b221DebtKpi';

      box.className=
        'metric';

      host.appendChild(box);

    }

  }


  if(box){

    box.innerHTML=`

      <span>
        Pagos de deuda del mes
      </span>

      <strong>
        ${money(debt)}
      </strong>

    `;

  }


  const g=$('gastosMes');

  if(g){

    g.textContent=
      money(expense);

  }


  const im=$('ingresosMes');

  if(im){

    im.textContent=
      money(income);

  }

}


/* ============================================================
   INICIALIZACIÓN
   ============================================================ */

function boot(){

  injectFields();


  loadAccounts()
    .then(()=>{

      fillAccounts();

      toggleAccount();

    });


  const form=$('movForm');

  if(form){

    form.onsubmit=
      saveMovement;

  }


  enhanceEdit();


  [900,1800,3000]
    .forEach(
      ms=>
        setTimeout(
          refreshKPIs,
          ms
        )
    );


  /* ----------------------------------------------------------
     OBSERVADOR
     ---------------------------------------------------------- */

  const obs=
    new MutationObserver(
      ()=>{

        injectFields();


        if(
          !$('b221Account') ||
          !accounts.length
        ){

          loadAccounts()
            .then(
              ()=>fillAccounts()
            );

        }

      }
    );


  const root=
    $('movimientos');


  if(root){

    obs.observe(
      root,
      {
        childList:true,
        subtree:true
      }
    );

  }

}


/* ============================================================
   ARRANQUE
   ============================================================ */

if(
  document.readyState===
  'loading'
){

  document.addEventListener(
    'DOMContentLoaded',
    ()=>{
      setTimeout(
        boot,
        500
      );
    },
    {once:true}
  );

}else{

  setTimeout(
    boot,
    500
  );

}

})();
