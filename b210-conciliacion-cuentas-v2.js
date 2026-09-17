/* FINANZAS B2.10 v2 — Centro de conciliación de cuenta de origen */
(() => {
  const $ = id => document.getElementById(id);
  const money = n => new Intl.NumberFormat('es-CL',{style:'currency',currency:'CLP',maximumFractionDigits:0}).format(Number(n)||0);
  const esc = v => String(v ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  let client=null, accounts=[];

  async function db(){
    if(client)return client;
    const u=localStorage.getItem('sf_url'), k=localStorage.getItem('sf_key');
    if(!u||!k||!window.supabase)return null;
    client=window.supabase.createClient(u,k); return client;
  }

  async function loadAccounts(){
    const c=await db();
    if(!c)return;
    const r=await c.from('cuentas_bancarias')
      .select('id,nombre_banco,nombre_cuenta,tipo_cuenta,saldo_actual,activa')
      .eq('activa',true)
      .order('nombre_banco');
    if(r.error)throw r.error;
    accounts=r.data||[];
  }

  function accountOptions(){
    return '<option value="">Seleccionar cuenta…</option>'+
      accounts.map(a=>`<option value="${a.id}">${esc(a.nombre_banco)} · ${esc(a.nombre_cuenta)} · ${money(a.saldo_actual)}</option>`).join('');
  }

  async function render(){
    const dash=$('dashboard');
    if(!dash)return;

    let box=$('fin210Reconcile');
    if(!box){
      box=document.createElement('section');
      box.id='fin210Reconcile';
      box.className='card';
      dash.appendChild(box);
    }

    const c=await db();
    if(!c){
      box.innerHTML='<h2>Conciliación de cuentas</h2><p class="muted">Conecta Supabase para consultar pagos.</p>';
      return;
    }

    const r=await c.from('pagos_deuda')
      .select('id,cuota_id,fecha_pago,monto,movimiento_id,cuenta_id,cuotas_deuda(numero_cuota,deuda_id,deudas(acreedor,concepto))')
      .is('cuenta_id',null)
      .order('fecha_pago',{ascending:true});

    if(r.error){
      box.innerHTML=`<h2>Conciliación de cuentas</h2><p class="status">${esc(r.error.message)}</p>`;
      return;
    }

    const rows=r.data||[];

    box.innerHTML=`
      <div class="b210-head">
        <div>
          <span class="muted">B2.10 · Trazabilidad</span>
          <h2>Conciliación de cuentas</h2>
          <p>Pagos reales cuyo origen de dinero aún no está identificado.</p>
        </div>
        <span class="b210-count">${rows.length}</span>
      </div>
      ${rows.length ? rows.map(p=>{
        const q=p.cuotas_deuda||{}, d=q.deudas||{};
        return `<article class="b210-row" data-payment-id="${p.id}">
          <div class="b210-info">
            <strong>${esc(d.acreedor||'Deuda')}</strong>
            <span>Cuota ${esc(q.numero_cuota||'—')} · ${esc(p.fecha_pago)} · ${money(p.monto)}</span>
          </div>
          <select class="b210-select">${accountOptions()}</select>
          <button type="button" class="b210-save">Conciliar</button>
          <small class="b210-status"></small>
        </article>`;
      }).join('') : `
        <div class="b210-empty">
          <strong>✓ Todo conciliado</strong>
          <span>No hay pagos pendientes de asignar a una cuenta.</span>
        </div>`}
      <p class="b210-note">Conciliar no crea otro gasto. Asigna el mismo origen al pago y a su movimiento vinculado.</p>
    `;

    box.querySelectorAll('.b210-save').forEach(btn=>{
      btn.addEventListener('click', async ()=>{
        const row=btn.closest('.b210-row');
        const paymentId=Number(row.dataset.paymentId);
        const accountId=Number(row.querySelector('.b210-select').value||0);
        const status=row.querySelector('.b210-status');

        if(!accountId){
          status.textContent='Selecciona una cuenta.';
          return;
        }

        btn.disabled=true;
        btn.textContent='Guardando…';
        status.textContent='';

        const p=await c.from('pagos_deuda')
          .select('id,movimiento_id,cuenta_id')
          .eq('id',paymentId)
          .single();

        if(p.error){ status.textContent=p.error.message; btn.disabled=false; btn.textContent='Conciliar'; return; }
        if(p.data.cuenta_id){ await render(); return; }

        const u=await c.from('pagos_deuda')
          .update({cuenta_id:accountId})
          .eq('id',paymentId)
          .is('cuenta_id',null);

        if(u.error){
          status.textContent=u.error.message;
          btn.disabled=false; btn.textContent='Conciliar';
          return;
        }

        if(p.data.movimiento_id){
          const m=await c.from('movimientos')
            .update({cuenta_id:accountId})
            .eq('id',p.data.movimiento_id)
            .is('cuenta_id',null);

          if(m.error){
            await c.from('pagos_deuda').update({cuenta_id:null}).eq('id',paymentId);
            status.textContent='No se pudo conciliar el movimiento; no se aplicó la cuenta.';
            btn.disabled=false; btn.textContent='Conciliar';
            return;
          }
        }

        await render();
      });
    });
  }

  function styles(){
    if($('b210Styles'))return;
    const s=document.createElement('style');
    s.id='b210Styles';
    s.textContent=`
      #fin210Reconcile{margin-top:16px}
      .b210-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}
      .b210-head h2{margin:3px 0;font-size:18px}
      .b210-head p{margin:3px 0;color:#6b7280;font-size:12px}
      .b210-count{min-width:30px;height:30px;border-radius:50%;display:grid;place-items:center;background:#f1f5f9;font-weight:800}
      .b210-row{display:grid;grid-template-columns:minmax(160px,1fr) minmax(190px,1fr) auto;gap:10px;align-items:center;border-top:1px solid #e5e7eb;padding:14px 0}
      .b210-info{display:flex;flex-direction:column;gap:3px}.b210-info span{font-size:12px;color:#6b7280}
      .b210-select{width:100%;min-height:38px}.b210-save{min-height:38px}
      .b210-status{grid-column:1/-1;color:#b45309}
      .b210-empty{display:flex;flex-direction:column;gap:4px;padding:15px;border-radius:12px;background:rgba(34,197,94,.08);margin-top:12px}
      .b210-note{border-top:1px solid #f1f5f9;padding-top:10px;color:#6b7280;font-size:11px;margin-bottom:0}
      @media(max-width:680px){.b210-row{grid-template-columns:1fr}.b210-save{width:100%}}
    `;
    document.head.appendChild(s);
  }

  function init(){
    styles();
    loadAccounts().then(render).catch(e=>console.error('B2.10',e));
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(init,700));
  else setTimeout(init,700);

  document.addEventListener('click',e=>{
    if(e.target.closest('.tabs button[data-tab="dashboard"]'))setTimeout(render,300);
  });
})();
