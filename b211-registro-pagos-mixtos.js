/* FINANZAS B2.11 — Registro de pagos con múltiples fuentes */
(() => {
  const $=id=>document.getElementById(id);
  const money=n=>new Intl.NumberFormat('es-CL',{style:'currency',currency:'CLP',maximumFractionDigits:0}).format(Number(n)||0);
  const today=()=>{const d=new Date();return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,10)};
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  let client=null, accounts=[], debts=[], quotas=[];

  async function db(){
    if(client)return client;
    const u=localStorage.getItem('sf_url'),k=localStorage.getItem('sf_key');
    if(!u||!k||!window.supabase)return null;
    client=window.supabase.createClient(u,k); return client;
  }

  async function loadAccounts(){
    const c=await db(); if(!c)return;
    const r=await c.from('cuentas_bancarias')
      .select('id,nombre_banco,nombre_cuenta,tipo_cuenta,saldo_actual,activa')
      .eq('activa',true).order('nombre_banco');
    if(!r.error) accounts=r.data||[];
  }

  async function getDebt(id){
    const c=await db(); if(!c)return null;
    const r=await c.from('deudas').select('*').eq('id',id).single();
    if(r.error)return null;
    return r.data;
  }

  async function getNextQuota(debtId){
    const c=await db(); if(!c)return null;
    const r=await c.from('cuotas_deuda')
      .select('id,numero_cuota,fecha_vencimiento,monto,saldo_proyectado,estado')
      .eq('deuda_id',debtId)
      .in('estado',['pendiente','vencida'])
      .order('numero_cuota').limit(1).maybeSingle();
    if(r.error)return null;
    return r.data;
  }

  function accountOptions(){
    return accounts.map(a=>`<option value="${a.id}">${esc(a.nombre_banco)} · ${esc(a.nombre_cuenta)} · ${money(a.saldo_actual)}</option>`).join('');
  }

  function modal(){
    if($('b211Modal'))return;
    const m=document.createElement('div');
    m.id='b211Modal';
    m.className='b211-overlay';
    m.innerHTML=`
      <div class="b211-modal" role="dialog" aria-modal="true">
        <div class="b211-top">
          <div><span class="muted">B2.11 · Pago real</span><h2 id="b211Title">Registrar pago</h2><p id="b211Subtitle"></p></div>
          <button type="button" class="secondary" id="b211Close">Cerrar</button>
        </div>
        <div class="b211-summary">
          <span>Monto de la cuota</span><strong id="b211Required">$0</strong>
        </div>
        <div id="b211Sources"></div>
        <button type="button" class="secondary" id="b211Add">+ Agregar otra fuente</button>
        <div class="b211-total"><span>Distribuido</span><strong id="b211Distributed">$0</strong></div>
        <div id="b211Validation" class="b211-validation"></div>
        <label class="b211-notes">Notas<textarea id="b211Notes" rows="2" placeholder="Observación opcional"></textarea></label>
        <div class="b211-actions"><button type="button" class="secondary" id="b211Cancel">Cancelar</button><button type="button" id="b211Submit">Registrar pago</button></div>
      </div>`;
    document.body.appendChild(m);
    $('b211Close').onclick=close;
    $('b211Cancel').onclick=close;
    m.addEventListener('click',e=>{if(e.target===m)close()});
    $('b211Add').onclick=()=>addSource();
    $('b211Submit').onclick=submit;
  }

  let state={debtId:null,quota:null,sources:[]};

  function addSource(type='efectivo', amount=0){
    state.sources.push({type,accountId:type==='cuenta_bancaria'?(accounts[0]?.id||''): '',amount:Number(amount)||0});
    renderSources();
  }

  function renderSources(){
    const box=$('b211Sources'); if(!box)return;
    box.innerHTML=state.sources.map((s,i)=>`
      <div class="b211-source" data-index="${i}">
        <div class="b211-source-head"><strong>Fuente ${i+1}</strong>${state.sources.length>1?`<button type="button" class="b211-remove" data-remove="${i}">Eliminar</button>`:''}</div>
        <div class="b211-source-grid">
          <label>Origen<select class="b211-type">
            <option value="efectivo" ${s.type==='efectivo'?'selected':''}>Efectivo / caja</option>
            <option value="cuenta_bancaria" ${s.type==='cuenta_bancaria'?'selected':''}>Cuenta bancaria</option>
          </select></label>
          <label class="b211-account-wrap" style="${s.type==='cuenta_bancaria'?'':'display:none'}">Cuenta
            <select class="b211-account"><option value="">Seleccionar…</option>${accountOptions()}</select>
          </label>
          <label>Monto<input class="b211-amount" type="number" min="1" step="1" value="${Number(s.amount)||''}" inputmode="numeric"></label>
        </div>
      </div>`).join('');

    box.querySelectorAll('.b211-source').forEach(row=>{
      const i=Number(row.dataset.index);
      const type=row.querySelector('.b211-type');
      const account=row.querySelector('.b211-account');
      const amount=row.querySelector('.b211-amount');
      type.onchange=()=>{state.sources[i].type=type.value;state.sources[i].accountId=type.value==='cuenta_bancaria'?(accounts[0]?.id||''):'';renderSources();updateTotal()};
      if(account){account.value=String(state.sources[i].accountId||'');account.onchange=()=>{state.sources[i].accountId=account.value};}
      amount.oninput=()=>{state.sources[i].amount=Number(amount.value||0);updateTotal()};
    });
    box.querySelectorAll('[data-remove]').forEach(b=>b.onclick=()=>{state.sources.splice(Number(b.dataset.remove),1);renderSources();updateTotal()});
    updateTotal();
  }

  function updateTotal(){
    const required=Number(state.quota?.monto||0);
    const distributed=state.sources.reduce((s,x)=>s+Number(x.amount||0),0);
    $('b211Distributed').textContent=money(distributed);
    const v=$('b211Validation');
    if(distributed===required && required>0){
      v.className='b211-validation ok'; v.textContent='✓ Distribución completa. El pago puede registrarse.';
      $('b211Submit').disabled=false;
    }else{
      v.className='b211-validation';
      v.textContent=distributed<required?`Faltan ${money(required-distributed)}.`:`Hay un exceso de ${money(distributed-required)}.`;
      $('b211Submit').disabled=true;
    }
  }

  async function open(debtId){
    await loadAccounts();
    const d=await getDebt(debtId);
    const q=await getNextQuota(debtId);
    if(!d||!q){alert('No se encontró una cuota pendiente para esta deuda.');return;}
    state={debtId,quota:q,sources:[]};
    modal();
    $('b211Title').textContent=`Registrar pago · ${d.acreedor||'Deuda'}`;
    $('b211Subtitle').textContent=`Cuota ${q.numero_cuota} · vencimiento ${q.fecha_vencimiento}`;
    $('b211Required').textContent=money(q.monto);
    $('b211Notes').value='';
    addSource('efectivo', Number(q.monto));
    document.body.classList.add('b211-open');
  }

  function close(){ $('b211Modal')?.remove(); document.body.classList.remove('b211-open'); state={debtId:null,quota:null,sources:[]}; }

  async function submit(){
    const c=await db(); if(!c)return;
    const required=Number(state.quota.monto);
    const total=state.sources.reduce((s,x)=>s+Number(x.amount||0),0);
    if(total!==required)return;

    const sources=state.sources.map(x=>({
      tipo_origen:x.type,
      cuenta_id:x.type==='cuenta_bancaria'?Number(x.accountId):null,
      monto:Number(x.amount),
    }));

    if(sources.some(x=>!x.monto||x.monto<=0)){alert('Todas las fuentes deben tener un monto mayor que cero.');return;}
    if(sources.some(x=>x.tipo_origen==='cuenta_bancaria'&&!x.cuenta_id)){alert('Selecciona la cuenta bancaria de cada fuente.');return;}

    const btn=$('b211Submit'); btn.disabled=true; btn.textContent='Registrando…';
    const {data,error}=await c.rpc('registrar_pago_deuda_v2',{
      p_cuota_id:state.quota.id,
      p_fecha_pago:today(),
      p_monto:required,
      p_fuentes:sources,
      p_notas:$('b211Notes').value.trim()||null
    });

    if(error){
      $('b211Validation').className='b211-validation error';
      $('b211Validation').textContent=error.message;
      btn.disabled=false; btn.textContent='Registrar pago';
      return;
    }

    close();
    alert(`Pago registrado correctamente: ${money(required)}.`);
    // Refresca el módulo existente sin recargar la página.
    document.querySelector('.tabs button[data-tab="deudas"]')?.click();
    setTimeout(()=>location.reload(),500);
  }

  function injectButtons(){
    document.querySelectorAll('.debt-card').forEach(card=>{
      if(card.querySelector('.b211-pay'))return;
      const edit=card.querySelector('button[onclick*="editarDeuda23"]');
      const m=card.querySelector('.form-actions')||card;
      const match=edit?.getAttribute('onclick')?.match(/editarDeuda23\((\d+)\)/);
      if(!match)return;
      const b=document.createElement('button');
      b.type='button'; b.className='b211-pay'; b.textContent='Pagar próxima cuota';
      b.onclick=()=>open(Number(match[1]));
      m.appendChild(b);
    });
  }

  function styles(){
    if($('b211Styles'))return;
    const s=document.createElement('style');s.id='b211Styles';
    s.textContent=`
      .b211-overlay{position:fixed;inset:0;background:rgba(15,23,42,.58);z-index:99999;display:flex;align-items:center;justify-content:center;padding:16px}
      .b211-modal{background:#fff;width:min(720px,100%);max-height:92vh;overflow:auto;border-radius:18px;padding:20px;box-shadow:0 25px 70px rgba(0,0,0,.25)}
      .b211-top{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}.b211-top h2{margin:4px 0}.b211-top p{margin:0;color:#64748b}
      .b211-summary{display:flex;justify-content:space-between;align-items:center;padding:16px;border:1px solid #e2e8f0;border-radius:12px;background:#f8fafc;margin:16px 0}
      .b211-summary strong{font-size:22px}.b211-source{border-top:1px solid #e2e8f0;padding:14px 0}.b211-source-head{display:flex;justify-content:space-between}.b211-remove{border:0;background:none;text-decoration:underline;cursor:pointer}
      .b211-source-grid{display:grid;grid-template-columns:1fr 1.4fr 1fr;gap:10px;margin-top:10px}.b211-source-grid label,.b211-notes{display:flex;flex-direction:column;gap:5px;font-size:12px}
      .b211-source-grid input,.b211-source-grid select,.b211-notes textarea{width:100%;min-height:38px;box-sizing:border-box}
      .b211-total{display:flex;justify-content:space-between;border-top:1px solid #cbd5e1;padding:14px 0;font-weight:700}.b211-total strong{font-size:20px}
      .b211-validation{padding:10px;border-radius:10px;background:#fff7ed;color:#9a3412;margin-bottom:12px}.b211-validation.ok{background:#ecfdf5;color:#166534}.b211-validation.error{background:#fef2f2;color:#b91c1c}
      .b211-actions{display:flex;justify-content:flex-end;gap:10px;margin-top:16px}.b211-pay{margin-left:6px}
      @media(max-width:680px){.b211-overlay{align-items:flex-end;padding:0}.b211-modal{border-radius:18px 18px 0 0;max-height:94vh}.b211-source-grid{grid-template-columns:1fr}.b211-actions{position:sticky;bottom:0;background:#fff;padding-top:10px}}
    `;
    document.head.appendChild(s);
  }

  function init(){
    styles();
    const obs=new MutationObserver(()=>injectButtons());
    obs.observe(document.body,{childList:true,subtree:true});
    [300,800,1500,2500,4000].forEach(ms=>setTimeout(injectButtons,ms));
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(init,500));
  else setTimeout(init,500);
})();
