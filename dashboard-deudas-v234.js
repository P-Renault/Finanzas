/* FINANZAS V2.3.4 — Centro de Deudas integrado al Dashboard */
(() => {
  const $ = id => document.getElementById(id);
  const money = n => new Intl.NumberFormat('es-CL',{style:'currency',currency:'CLP',maximumFractionDigits:0}).format(Number(n)||0);
  const esc = v => String(v ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const today = () => { const d=new Date(); return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,10); };
  let client = null;

  async function db(){
    if(client) return client;
    const u=localStorage.getItem('sf_url'), k=localStorage.getItem('sf_key');
    if(!u || !k || !window.supabase) return null;
    client=window.supabase.createClient(u,k);
    return client;
  }

  function ensureStyles(){
    if($('fin234Styles')) return;
    const s=document.createElement('style');
    s.id='fin234Styles';
    s.textContent=`
      .fin234-debt-center{margin:18px 0;padding:18px;border:1px solid #e5e7eb;border-radius:16px;background:#fff;box-shadow:0 3px 12px rgba(15,23,42,.05)}
      .fin234-head{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:14px}
      .fin234-head h2{margin:0;font-size:18px}.fin234-head p{margin:4px 0 0;color:#6b7280;font-size:12px}
      .fin234-link{border:0;border-radius:9px;padding:9px 12px;background:#eef2f7;color:#111827;font-weight:700;cursor:pointer}
      .fin234-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:14px}
      .fin234-metric{background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;padding:12px}
      .fin234-metric span{display:block;color:#6b7280;font-size:11px}.fin234-metric strong{display:block;margin-top:5px;font-size:17px}
      .fin234-debt{border-top:1px solid #e5e7eb;padding-top:13px;display:grid;grid-template-columns:1fr auto;gap:8px 14px;align-items:center}
      .fin234-debt h3{margin:0;font-size:15px}.fin234-debt p{margin:3px 0 0;color:#6b7280;font-size:12px}
      .fin234-balance{text-align:right}.fin234-balance strong{display:block;font-size:17px}.fin234-balance small{color:#6b7280}
      .fin234-meta{grid-column:1/-1;display:flex;gap:12px;flex-wrap:wrap;color:#4b5563;font-size:12px}
      .fin234-actions{grid-column:1/-1;display:flex;gap:8px;flex-wrap:wrap}.fin234-actions button{border:0;border-radius:8px;padding:8px 11px;background:#111827;color:#fff;font-weight:700;cursor:pointer}.fin234-actions .fin234-link{background:#eef2f7;color:#111827}
      .fin234-empty{color:#6b7280;font-size:13px;margin:0}.fin234-note{margin:13px 0 0;padding-top:10px;border-top:1px solid #f1f5f9;color:#6b7280;font-size:11px}
      @media(max-width:700px){.fin234-grid{grid-template-columns:repeat(2,1fr)}.fin234-head{align-items:flex-start}.fin234-debt{grid-template-columns:1fr}.fin234-balance{text-align:left}}
    `;
    document.head.appendChild(s);
  }

  function goDebts(){
    const b=document.querySelector('.tabs button[data-tab="deudas"]');
    if(b){ b.click(); return; }
    if(window.fin23GoDebts) window.fin23GoDebts();
  }

  async function render(){
    const dashboard=$('dashboard');
    if(!dashboard) return;
    ensureStyles();

    let box=$('fin234DebtCenter');
    if(!box){
      box=document.createElement('div');
      box.id='fin234DebtCenter';
      box.className='fin234-debt-center';
      const liquidity=$('fin23Liquidity');
      const cards=dashboard.querySelector('.cards');
      (liquidity||cards||dashboard.firstElementChild)?.insertAdjacentElement('afterend',box);
    }

    box.innerHTML='<p class="fin234-empty">Cargando situación de deuda…</p>';

    const c=await db();
    if(!c){
      box.innerHTML='<p class="fin234-empty">Conecta Supabase para consultar las deudas.</p>';
      return;
    }

    const r=await c.from('v_deudas_resumen').select('*').order('acreedor');
    if(r.error){
      box.innerHTML='<p class="fin234-empty">No se pudo cargar el centro de deudas.</p>';
      return;
    }

    const debts=(r.data||[]).filter(d=>!['pagada','cancelada'].includes(String(d.estado||'').toLowerCase()));
    const original=debts.reduce((s,d)=>s+Number(d.monto_original||0),0);
    const balance=debts.reduce((s,d)=>s+Number(d.saldo_actual||0),0);
    const pending=debts.reduce((s,d)=>s+Number(d.numero_cuotas_pendientes||0),0);

    const end=new Date(today()+'T12:00:00');
    end.setDate(end.getDate()+30);

    const q=await c.from('cuotas_deuda')
      .select('monto')
      .in('estado',['pendiente','vencida'])
      .gte('fecha_vencimiento',today())
      .lte('fecha_vencimiento',end.toISOString().slice(0,10));

    const next30=(q.data||[]).reduce((s,x)=>s+Number(x.monto||0),0);
    const d=debts[0];

    box.innerHTML=`
      <div class="fin234-head">
        <div>
          <h2>Centro de deudas</h2>
          <p>Deuda estructurada: saldo, cuotas y próximos vencimientos</p>
        </div>
        <button class="fin234-link" id="fin234Go">Gestionar deudas</button>
      </div>
      <div class="fin234-grid">
        <article class="fin234-metric"><span>Deuda original total</span><strong>${money(original)}</strong></article>
        <article class="fin234-metric"><span>Saldo pendiente total</span><strong>${money(balance)}</strong></article>
        <article class="fin234-metric"><span>Cuotas pendientes</span><strong>${pending}</strong></article>
        <article class="fin234-metric"><span>Próximos 30 días</span><strong>${money(next30)}</strong></article>
      </div>
      ${d ? `
        <div class="fin234-debt">
          <div><h3>${esc(d.acreedor)}</h3><p>${esc(d.concepto||'Deuda registrada')}</p></div>
          <div class="fin234-balance"><strong>${money(d.saldo_actual)}</strong><small>Saldo actual</small></div>
          <div class="fin234-meta">
            <span>Original: ${money(d.monto_original)}</span>
            <span>Cuotas pendientes: ${Number(d.numero_cuotas_pendientes||0)}</span>
            <span>Próximo vencimiento: ${esc(d.proximo_vencimiento||'—')}</span>
          </div>
          <div class="fin234-actions"><button id="fin234Detail">Ver detalle</button><button id="fin234List" class="fin234-link">Ver lista de deudas</button></div>
        </div>` : '<p class="fin234-empty">No hay deudas estructuradas pendientes.</p>'}
      <p class="fin234-note">Las deudas estructuradas se mantienen separadas de los compromisos generales. El saldo cambia al registrar un pago real.</p>
    `;

    $('fin234Go').onclick=goDebts;
    if($('fin234List')) $('fin234List').onclick=goDebts;
    if($('fin234Detail') && d){
      $('fin234Detail').onclick=()=>window.verDeuda23 ? window.verDeuda23(d.id) : goDebts();
    }
  }

  function start(){
    if(!$('dashboard')) return;
    const run=()=>setTimeout(render,500);
    if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',run);
    else run();
    setTimeout(render,1800);
    document.addEventListener('click',e=>{
      if(e.target.matches('.tabs button[data-tab="dashboard"]')) setTimeout(render,250);
    });
  }

  start();
})();
