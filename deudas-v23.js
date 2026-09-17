/* FINANZAS V2.3 — Integración de deuda con Resumen y calendario */
(() => {
  const M=n=>new Intl.NumberFormat('es-CL',{style:'currency',currency:'CLP',maximumFractionDigits:0}).format(Number(n)||0);
  const E=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const T=()=>{const d=new Date();return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,10)};
  let c=null;
  async function db(){
    if(c)return c;
    const u=localStorage.getItem('sf_url'),k=localStorage.getItem('sf_key');
    if(!u||!k||!window.supabase)return null;
    c=window.supabase.createClient(u,k); return c;
  }

  async function read(){
    const x=await db(); if(!x)return null;
    const {data:debts,error:de}=await x.from('v_deudas_resumen').select('*');
    if(de){console.error(de);return null;}
    const {data:qs,error:qe}=await x.from('cuotas_deuda')
      .select('id,deuda_id,numero_cuota,fecha_vencimiento,monto,estado,fecha_pago')
      .order('fecha_vencimiento',{ascending:true});
    if(qe){console.error(qe);return null;}
    return {debts:debts||[],quotas:qs||[]};
  }

  function injectDashboard(){
    if(document.getElementById('deudaArquitectura'))return;
    const dash=document.getElementById('dashboard'); if(!dash)return;
    const card=document.createElement('div');
    card.id='deudaArquitectura'; card.className='card debt-architecture';
    card.innerHTML=`
      <div class="section-title">
        <div><span class="muted">Arquitectura financiera</span><h2>Deuda integrada</h2></div>
        <button type="button" class="secondary" id="abrirCentroDeuda">Gestionar</button>
      </div>
      <div class="debt-architecture-grid">
        <article><span>Saldo de deuda</span><strong id="daSaldo">$0</strong><small>Deudas vigentes</small></article>
        <article><span>Cuotas pendientes</span><strong id="daCuotas">0</strong><small>Programadas</small></article>
        <article><span>Próximos 30 días</span><strong id="da30">$0</strong><small>Obligación de deuda</small></article>
        <article><span>Vencidas</span><strong id="daVencidas">$0</strong><small>Requieren atención</small></article>
      </div>
      <div id="daAlert" class="debt-alert"></div>`;
    const income=document.querySelector('.income-plan-card');
    if(income)income.insertAdjacentElement('beforebegin',card); else dash.appendChild(card);
    document.getElementById('abrirCentroDeuda').onclick=()=>{
      const b=document.querySelector('[data-tab="deudas"]'); if(b)b.click();
    };
  }

  function render(data){
    injectDashboard(); if(!data)return;
    const active=data.debts.filter(d=>!['pagada','cancelada'].includes(d.estado));
    const saldo=active.reduce((s,d)=>s+Number(d.saldo_actual||0),0);
    const pending=data.quotas.filter(q=>['pendiente','vencida'].includes(q.estado));
    const vencidas=pending.filter(q=>q.estado==='vencida');
    const end=new Date(T()+'T12:00:00'); end.setDate(end.getDate()+30);
    const endKey=end.toISOString().slice(0,10);
    const next30=pending.filter(q=>q.fecha_vencimiento>=T()&&q.fecha_vencimiento<=endKey)
      .reduce((s,q)=>s+Number(q.monto||0),0);
    document.getElementById('daSaldo').textContent=M(saldo);
    document.getElementById('daCuotas').textContent=String(pending.length);
    document.getElementById('da30').textContent=M(next30);
    document.getElementById('daVencidas').textContent=M(vencidas.reduce((s,q)=>s+Number(q.monto||0),0));
    const alert=document.getElementById('daAlert');
    alert.innerHTML=vencidas.length
      ? `<strong>Atención:</strong> existen ${vencidas.length} cuota(s) vencida(s) por ${M(vencidas.reduce((s,q)=>s+Number(q.monto||0),0))}.`
      : `<span>No hay cuotas vencidas registradas en el módulo Deudas.</span>`;
  }

  function injectDeudaCalendar(){
    const sec=document.getElementById('deudas'); if(!sec||document.getElementById('calendarioDeuda'))return;
    const card=document.createElement('div'); card.id='calendarioDeuda'; card.className='card debt-calendar';
    card.innerHTML=`<div class="section-title"><div><span class="muted">Plan de obligaciones</span><h2>Calendario de cuotas</h2></div></div><div id="dcRows"><p class="muted">Cargando...</p></div>`;
    sec.appendChild(card);
  }

  async function renderDebtCalendar(){
    injectDeudaCalendar(); const data=await read(); if(!data)return;
    const by=Object.fromEntries(data.debts.map(d=>[d.id,d]));
    const q=data.quotas.filter(x=>['pendiente','vencida'].includes(x.estado)).slice(0,24);
    const box=document.getElementById('dcRows'); if(!box)return;
    if(!q.length){box.innerHTML='<p class="muted">No existen cuotas pendientes. Primero registra una deuda con plan de cuotas.</p>';return;}
    box.innerHTML=q.map(x=>{
      const d=by[x.deuda_id]||{};
      return `<div class="dc-full-row ${x.estado==='vencida'?'overdue':''}">
        <div><strong>${E(d.acreedor||'Deuda')}</strong><span>Cuota ${Number(x.numero_cuota)} · vence ${E(x.fecha_vencimiento)}</span></div>
        <strong>${M(x.monto)}</strong>
        <span class="quota-status">${E(x.estado)}</span>
      </div>`;
    }).join('');
  }

  async function refreshAll(){
    const data=await read(); render(data);
    if(document.getElementById('deudas'))renderDebtCalendar();
  }

  function start(){
    injectDashboard();
    const old=window.refresh;
    if(old&&!old.__v23){
      const w=async function(...a){const r=await old.apply(this,a);try{await refreshAll()}catch(e){console.error(e)}return r};
      w.__v23=true; window.refresh=w;
    }
    refreshAll();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();