/* FINANZAS B2.3.5 — Corrección navegación y detalle Centro de Deudas */
(() => {
  const $ = id => document.getElementById(id);
  const money = n => new Intl.NumberFormat('es-CL',{style:'currency',currency:'CLP',maximumFractionDigits:0}).format(Number(n)||0);
  const esc = v => String(v ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));

  let client=null;

  async function db(){
    if(client)return client;
    const u=localStorage.getItem('sf_url'), k=localStorage.getItem('sf_key');
    if(!u||!k||!window.supabase)return null;
    client=window.supabase.createClient(u,k);
    return client;
  }

  function openDebts(){
    const tabButton=document.querySelector('.tabs button[data-tab="deudas"]');
    const dashboard=$('dashboard'), debts=$('deudas');

    document.querySelectorAll('.tabs button').forEach(b=>b.classList.remove('active'));
    if(tabButton)tabButton.classList.add('active');

    document.querySelectorAll('.tab').forEach(s=>s.classList.add('hidden'));
    if(debts)debts.classList.remove('hidden');
    if(dashboard)dashboard.classList.add('hidden');

    if(debts)window.scrollTo({top:0,behavior:'smooth'});
  }

  async function showDebt(id){
    openDebts();

    const detail=$('deudaDetalle');
    if(!detail)return;

    detail.innerHTML='<p class="muted">Cargando detalle de la deuda…</p>';
    detail.scrollIntoView({behavior:'smooth',block:'start'});

    const c=await db();
    if(!c){
      detail.innerHTML='<p class="status">Conecta Supabase para consultar el detalle.</p>';
      return;
    }

    const debt=await c.from('v_deudas_resumen')
      .select('*')
      .eq('id',id)
      .maybeSingle();

    if(debt.error){
      detail.innerHTML=`<p class="status">${esc(debt.error.message)}</p>`;
      return;
    }

    if(!debt.data){
      detail.innerHTML='<p class="muted">No se encontró la deuda solicitada.</p>';
      return;
    }

    const d=debt.data;

    const q=await c.from('cuotas_deuda')
      .select('id,numero_cuota,fecha_vencimiento,monto,saldo_proyectado,estado')
      .eq('deuda_id',id)
      .order('numero_cuota');

    if(q.error){
      detail.innerHTML=`<p class="status">${esc(q.error.message)}</p>`;
      return;
    }

    const quotas=q.data||[];
    const paid=quotas.filter(x=>String(x.estado).toLowerCase()==='pagada');
    const pending=quotas.filter(x=>!['pagada','cancelada'].includes(String(x.estado).toLowerCase()));

    detail.innerHTML=`
      <div class="fin235-detail-head">
        <div>
          <span class="muted">Detalle de deuda</span>
          <h2>${esc(d.acreedor)}</h2>
          <p>${esc(d.concepto||'Deuda registrada')}</p>
        </div>
        <button type="button" class="secondary" id="fin235Back">Volver a deudas</button>
      </div>

      <div class="fin235-detail-grid">
        <article><span>Saldo actual</span><strong>${money(d.saldo_actual)}</strong></article>
        <article><span>Monto original</span><strong>${money(d.monto_original)}</strong></article>
        <article><span>Pagadas</span><strong>${paid.length}</strong></article>
        <article><span>Pendientes</span><strong>${pending.length}</strong></article>
      </div>

      <div class="fin235-plan">
        <div class="section-title">
          <div><h3>Plan de cuotas</h3><span class="muted">${quotas.length} cuotas registradas</span></div>
        </div>

        ${quotas.length ? `<div class="fin235-quota-list">${
          quotas.map(x=>`
            <div class="fin235-quota ${String(x.estado).toLowerCase()==='pagada'?'paid':''}">
              <div>
                <strong>Cuota ${esc(x.numero_cuota)}</strong>
                <span>Vencimiento: ${esc(x.fecha_vencimiento)}</span>
              </div>
              <div>
                <strong>${money(x.monto)}</strong>
                <span>${esc(x.estado)}</span>
              </div>
            </div>`).join('')
        }</div>` : '<p class="muted">No existen cuotas registradas.</p>'}
      </div>`;

    $('fin235Back').onclick=()=>{openDebts(); detail.scrollIntoView({behavior:'smooth',block:'start'});};

    window.scrollTo({top:0,behavior:'smooth'});
  }

  function injectStyles(){
    if($('fin235Styles'))return;
    const s=document.createElement('style');
    s.id='fin235Styles';
    s.textContent=`
      .fin235-detail-head{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:16px}
      .fin235-detail-head h2{margin:3px 0;font-size:21px}
      .fin235-detail-head p{margin:0;color:#6b7280}
      .fin235-detail-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:14px 0 20px}
      .fin235-detail-grid article{padding:14px;border:1px solid #e5e7eb;border-radius:12px;background:#f8fafc}
      .fin235-detail-grid span{display:block;color:#6b7280;font-size:11px}
      .fin235-detail-grid strong{display:block;margin-top:5px;font-size:18px}
      .fin235-quota-list{display:flex;flex-direction:column}
      .fin235-quota{display:flex;justify-content:space-between;gap:15px;padding:12px 0;border-top:1px solid #e5e7eb}
      .fin235-quota div{display:flex;flex-direction:column;gap:3px}
      .fin235-quota span{font-size:12px;color:#6b7280}
      .fin235-quota.paid{opacity:.72}
      @media(max-width:680px){
        .fin235-detail-head{flex-direction:column}
        .fin235-detail-grid{grid-template-columns:repeat(2,1fr)}
        .fin235-quota{align-items:flex-start}
      }
    `;
    document.head.appendChild(s);
  }

  function bind(){
    injectStyles();

    window.fin235OpenDebts=openDebts;
    window.verDeuda23=showDebt;

    document.addEventListener('click',e=>{
      const manage=e.target.closest('#fin234Go');
      if(manage){e.preventDefault();e.stopPropagation();openDebts();return;}

      const detail=e.target.closest('#fin234Detail');
      if(detail){
        e.preventDefault();e.stopPropagation();
        const center=document.getElementById('fin234DebtCenter');
        const button=center?.querySelector('#fin234Detail');
        const centerText=center?.querySelector('.fin234-debt h3')?.textContent?.trim();
        if(button){
          const cPromise=db();
          cPromise.then(async c=>{
            if(!c)return;
            const r=await c.from('v_deudas_resumen').select('id,acreedor').eq('acreedor',centerText).limit(1).maybeSingle();
            if(r.data?.id)showDebt(r.data.id);
          });
        }
        return;
      }
    });

    // Refuerza los botones que ya renderiza el módulo V2.3.3.
    document.addEventListener('click',e=>{
      const b=e.target.closest('#deudasLista button');
      if(!b)return;
      const onclick=b.getAttribute('onclick')||'';
      const m=onclick.match(/verDeuda23\((\d+)\)/);
      if(m){
        e.preventDefault();
        e.stopPropagation();
        showDebt(Number(m[1]));
      }
    },true);
  }

  function init(){
    if(!document.getElementById('app'))return;
    bind();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(init,700));
  else setTimeout(init,700);
  setTimeout(init,1800);
})();
