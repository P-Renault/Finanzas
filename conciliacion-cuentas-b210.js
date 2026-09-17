/* FINANZAS B2.10 — Conciliación de cuenta de origen */
(() => {
  const $=id=>document.getElementById(id);
  const money=n=>new Intl.NumberFormat('es-CL',{style:'currency',currency:'CLP',maximumFractionDigits:0}).format(Number(n)||0);
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  let client=null, accounts=[];

  async function db(){
    if(client)return client;
    const u=localStorage.getItem('sf_url'),k=localStorage.getItem('sf_key');
    if(!u||!k||!window.supabase)return null;
    client=window.supabase.createClient(u,k); return client;
  }

  async function loadAccounts(){
    const c=await db(); if(!c)return [];
    const r=await c.from('cuentas_bancarias')
      .select('id,nombre_banco,nombre_cuenta,tipo_cuenta,saldo_actual,activa')
      .eq('activa',true).order('nombre_banco');
    if(r.error)throw r.error;
    accounts=r.data||[]; return accounts;
  }

  function options(){
    return '<option value="">Pendiente de conciliar</option>'+
      accounts.map(a=>`<option value="${a.id}">${esc(a.nombre_banco)} · ${esc(a.nombre_cuenta)} · ${money(a.saldo_actual)}</option>`).join('');
  }

  async function render(){
    const d=$('dashboard'); if(!d)return;
    let box=$('fin210Reconcile');
    if(!box){
      box=document.createElement('div');
      box.id='fin210Reconcile'; box.className='card';
      d.appendChild(box);
    }
    const c=await db(); if(!c)return;
    const r=await c.from('pagos_deuda')
      .select('id,cuota_id,fecha_pago,monto,movimiento_id,cuenta_id,cuotas_deuda(numero_cuota,deuda_id,deudas(acreedor))')
      .is('cuenta_id',null).order('fecha_pago');

    if(r.error){
      box.innerHTML=`<div class="section-title"><h2>Conciliación de cuentas</h2></div><p class="status">${esc(r.error.message)}</p>`;
      return;
    }
    const rows=r.data||[];
    box.innerHTML=`<div class="section-title">
      <div><span class="muted">B2.10 · Trazabilidad</span><h2>Conciliación de cuentas</h2></div>
      <span class="muted">${rows.length} pendiente${rows.length===1?'':'s'}</span>
    </div>
    <p class="muted">Asigna la cuenta real desde la que salió cada pago. No crea un gasto nuevo.</p>
    ${rows.length?rows.map(p=>{
      const q=p.cuotas_deuda||{}, d=q.deudas||{};
      return `<article class="reconcile-row" data-payment="${p.id}">
        <div class="reconcile-main"><strong>${esc(d.acreedor||'Deuda')}</strong>
        <span>Cuota ${esc(q.numero_cuota||'—')} · ${esc(p.fecha_pago)} · ${money(p.monto)}</span></div>
        <select class="reconcile-account">${options()}</select>
        <button type="button" class="reconcile-save">Conciliar</button>
      </article>`;
    }).join(''):`<div class="reconcile-ok"><strong>✓ Sin pagos pendientes de conciliar</strong>
      <span>Todos los pagos registrados tienen cuenta de origen.</span></div>`}`;

    box.querySelectorAll('.reconcile-save').forEach(btn=>btn.onclick=async()=>{
      const row=btn.closest('.reconcile-row');
      const paymentId=Number(row.dataset.payment);
      const accountId=Number(row.querySelector('select').value||0);
      if(!accountId){alert('Selecciona una cuenta de origen.');return;}
      btn.disabled=true; btn.textContent='Guardando...';

      const p=await c.from('pagos_deuda').select('id,movimiento_id,cuenta_id').eq('id',paymentId).single();
      if(p.error){alert(p.error.message);btn.disabled=false;btn.textContent='Conciliar';return;}
      if(p.data.cuenta_id){await render();return;}

      const u=await c.from('pagos_deuda').update({cuenta_id:accountId}).eq('id',paymentId);
      if(u.error){alert(u.error.message);btn.disabled=false;btn.textContent='Conciliar';return;}

      if(p.data.movimiento_id){
        const m=await c.from('movimientos').update({cuenta_id:accountId}).eq('id',p.data.movimiento_id);
        if(m.error){
          await c.from('pagos_deuda').update({cuenta_id:null}).eq('id',paymentId);
          alert('No se pudo vincular el movimiento. El pago volvió a pendiente.');
          btn.disabled=false; btn.textContent='Conciliar'; return;
        }
      }
      await render();
    });
  }

  function styles(){
    if($('fin210Styles'))return;
    const s=document.createElement('style'); s.id='fin210Styles';
    s.textContent=`#fin210Reconcile{margin-top:16px}
      #fin210Reconcile .reconcile-row{display:grid;grid-template-columns:minmax(180px,1fr) minmax(190px,1fr) auto;gap:10px;align-items:center;padding:12px 0;border-top:1px solid rgba(127,127,127,.16)}
      #fin210Reconcile .reconcile-main{display:flex;flex-direction:column;gap:3px}
      #fin210Reconcile select{width:100%}
      #fin210Reconcile .reconcile-ok{display:flex;flex-direction:column;gap:4px;padding:14px;border-radius:12px;background:rgba(34,197,94,.08)}
      @media(max-width:680px){#fin210Reconcile .reconcile-row{grid-template-columns:1fr}#fin210Reconcile .reconcile-save{width:100%}}`;
    document.head.appendChild(s);
  }

  async function init(){try{await loadAccounts();styles();await render();}catch(e){console.error('B2.10',e);}}
  document.addEventListener('DOMContentLoaded',()=>setTimeout(init,900));
  setTimeout(init,1500);
})();
