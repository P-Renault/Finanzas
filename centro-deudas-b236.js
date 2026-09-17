/* FINANZAS B2.3.6 — FIX definitivo botón "Ver detalle" Centro de Deudas */
(() => {
  const $ = id => document.getElementById(id);
  const money = n => new Intl.NumberFormat('es-CL',{style:'currency',currency:'CLP',maximumFractionDigits:0}).format(Number(n)||0);
  const esc = v => String(v ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));

  let client = null;

  async function db(){
    if(client) return client;
    const u=localStorage.getItem('sf_url'), k=localStorage.getItem('sf_key');
    if(!u || !k || !window.supabase) return null;
    client=window.supabase.createClient(u,k);
    return client;
  }

  function goDebtsTab(){
    const b=document.querySelector('.tabs button[data-tab="deudas"]');
    if(b){ b.click(); return true; }

    const dashboard=$('dashboard'), debts=$('deudas');
    document.querySelectorAll('.tabs button').forEach(x=>x.classList.toggle('active',x.dataset.tab==='deudas'));
    document.querySelectorAll('.tab').forEach(x=>x.classList.add('hidden'));
    if(debts) debts.classList.remove('hidden');
    if(dashboard) dashboard.classList.add('hidden');
    return !!debts;
  }

  async function openDetailByCreditor(acreedor){
    const detail=$('deudaDetalle');
    if(!detail) return;

    goDebtsTab();
    detail.innerHTML='<p class="muted">Cargando detalle…</p>';
    detail.scrollIntoView({behavior:'smooth',block:'start'});

    const c=await db();
    if(!c){
      detail.innerHTML='<p class="status">No se pudo conectar con Supabase.</p>';
      return;
    }

    const r=await c.from('v_deudas_resumen')
      .select('*')
      .eq('acreedor',acreedor)
      .limit(1)
      .maybeSingle();

    if(r.error){
      detail.innerHTML=`<p class="status">${esc(r.error.message)}</p>`;
      return;
    }
    if(!r.data){
      detail.innerHTML='<p class="muted">No se encontró la deuda.</p>';
      return;
    }

    const d=r.data;
    const q=await c.from('cuotas_deuda')
      .select('id,numero_cuota,fecha_vencimiento,monto,saldo_proyectado,estado')
      .eq('deuda_id',d.id)
      .order('numero_cuota');

    if(q.error){
      detail.innerHTML=`<p class="status">${esc(q.error.message)}</p>`;
      return;
    }

    const cuotas=q.data||[];
    const pagadas=cuotas.filter(x=>String(x.estado).toLowerCase()==='pagada').length;
    const pendientes=cuotas.filter(x=>!['pagada','cancelada'].includes(String(x.estado).toLowerCase())).length;

    detail.innerHTML=`
      <div class="b236-head">
        <div>
          <span class="muted">Detalle de deuda</span>
          <h2>${esc(d.acreedor)}</h2>
          <p>${esc(d.concepto||'Deuda registrada')}</p>
        </div>
        <button type="button" class="secondary" id="b236Back">Volver</button>
      </div>

      <div class="b236-metrics">
        <article><span>Saldo actual</span><strong>${money(d.saldo_actual)}</strong></article>
        <article><span>Monto original</span><strong>${money(d.monto_original)}</strong></article>
        <article><span>Cuotas pagadas</span><strong>${pagadas}</strong></article>
        <article><span>Cuotas pendientes</span><strong>${pendientes}</strong></article>
      </div>

      <div>
        <div class="section-title">
          <div><h3>Plan de cuotas</h3><span class="muted">${cuotas.length} cuotas registradas</span></div>
        </div>
        ${cuotas.length ? cuotas.map(x=>`
          <div class="b236-quota">
            <div>
              <strong>Cuota ${esc(x.numero_cuota)}</strong>
              <span>Vencimiento: ${esc(x.fecha_vencimiento)}</span>
            </div>
            <div>
              <strong>${money(x.monto)}</strong>
              <span>${esc(x.estado)}</span>
            </div>
          </div>`).join('') : '<p class="muted">No existen cuotas registradas.</p>'}
      </div>`;

    $('b236Back').onclick=()=>goDebtsTab();
    detail.scrollIntoView({behavior:'smooth',block:'start'});
  }

  function bindButton(){
    const button=$('fin234Detail');
    if(!button) return;

    // Eliminamos cualquier handler anterior y dejamos un handler directo.
    button.onclick=null;
    button.addEventListener('click',async e=>{
      e.preventDefault();
      e.stopPropagation();
      const center=$('fin234DebtCenter');
      const creditor=center?.querySelector('.fin234-debt h3')?.textContent?.trim();
      if(!creditor){
        alert('No se pudo identificar la deuda.');
        return;
      }
      button.disabled=true;
      button.textContent='Abriendo…';
      try{
        await openDetailByCreditor(creditor);
      }finally{
        button.disabled=false;
        button.textContent='Ver detalle';
      }
    },{capture:true});
  }

  function observe(){
    bindButton();

    const obs=new MutationObserver(()=>bindButton());
    obs.observe(document.body,{subtree:true,childList:true});

    // El centro B2.3.4 se renderiza de forma asíncrona.
    [300,800,1500,2500,4000].forEach(ms=>setTimeout(bindButton,ms));
  }

  function styles(){
    if($('b236Styles')) return;
    const s=document.createElement('style');
    s.id='b236Styles';
    s.textContent=`
      .b236-head{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:16px}
      .b236-head h2{margin:3px 0;font-size:21px}.b236-head p{margin:0;color:#6b7280}
      .b236-metrics{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:20px}
      .b236-metrics article{padding:14px;border:1px solid #e5e7eb;border-radius:12px;background:#f8fafc}
      .b236-metrics span,.b236-quota span{display:block;color:#6b7280;font-size:11px}
      .b236-metrics strong{display:block;margin-top:5px;font-size:18px}
      .b236-quota{display:flex;justify-content:space-between;gap:15px;padding:12px 0;border-top:1px solid #e5e7eb}
      .b236-quota div{display:flex;flex-direction:column;gap:3px}
      @media(max-width:680px){.b236-head{flex-direction:column}.b236-metrics{grid-template-columns:repeat(2,1fr)}}
    `;
    document.head.appendChild(s);
  }

  function init(){
    styles();
    observe();
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',()=>setTimeout(init,500));
  else setTimeout(init,500);
})();
