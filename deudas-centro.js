/* FINANZAS V2.2 — Centro de control de deuda */
(() => {
  const money = n => new Intl.NumberFormat('es-CL',{style:'currency',currency:'CLP',maximumFractionDigits:0}).format(Number(n)||0);
  const esc = v => String(v ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const today = () => { const d=new Date(); return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,10); };
  let client=null;

  async function db(){
    if(client) return client;
    const url=localStorage.getItem('sf_url'), key=localStorage.getItem('sf_key');
    if(!url||!key||!window.supabase) return null;
    client=window.supabase.createClient(url,key);
    return client;
  }

  function inject(){
    const dash=document.getElementById('dashboard');
    if(!dash || document.getElementById('deudaCentro')) return;
    const anchor=dash.querySelector('.cards');
    const wrap=document.createElement('div');
    wrap.id='deudaCentro';
    wrap.className='card debt-center-card';
    wrap.innerHTML=`
      <div class="section-title">
        <div><span class="muted">Control de obligaciones</span><h2>Centro de deuda</h2></div>
        <button type="button" class="secondary" id="irDeudas">Ver deudas</button>
      </div>
      <div class="debt-center-metrics">
        <article><span>Saldo de deuda</span><strong id="dcSaldo">$0</strong></article>
        <article><span>Cuotas pendientes</span><strong id="dcCuotas">0</strong></article>
        <article><span>Próximos 30 días</span><strong id="dc30">$0</strong></article>
      </div>
      <div id="dcLista" class="debt-center-list"><p class="muted">Cargando obligaciones...</p></div>
      <p id="dcEstado" class="muted debt-center-note"></p>`;
    if(anchor) anchor.insertAdjacentElement('afterend',wrap); else dash.appendChild(wrap);
    document.getElementById('irDeudas').onclick=()=>{
      const b=document.querySelector('[data-tab="deudas"]');
      if(b)b.click();
    };
  }

  async function load(){
    inject();
    const c=await db();
    if(!c||!document.getElementById('deudaCentro')) return;

    const {data:debts,error:de}=await c.from('v_deudas_resumen').select('*');
    if(de){
      document.getElementById('dcEstado').textContent='No se pudo cargar el resumen de deuda.';
      return;
    }

    const active=(debts||[]).filter(d=>!['pagada','cancelada'].includes(d.estado));
    const saldo=active.reduce((s,d)=>s+Number(d.saldo_actual||0),0);
    const cuotas=active.reduce((s,d)=>s+Number(d.numero_cuotas_pendientes||0),0);
    document.getElementById('dcSaldo').textContent=money(saldo);
    document.getElementById('dcCuotas').textContent=String(cuotas);

    const t=today();
    const end=new Date(t+'T12:00:00');
    end.setDate(end.getDate()+30);
    const endKey=end.toISOString().slice(0,10);

    const {data:qs,error:qe}=await c.from('cuotas_deuda')
      .select('id,deuda_id,numero_cuota,fecha_vencimiento,monto,estado')
      .in('estado',['pendiente','vencida'])
      .gte('fecha_vencimiento',t)
      .lte('fecha_vencimiento',endKey)
      .order('fecha_vencimiento',{ascending:true})
      .limit(12);

    if(qe){
      document.getElementById('dcEstado').textContent='No se pudo cargar el calendario de cuotas.';
      return;
    }

    document.getElementById('dc30').textContent=money((qs||[]).reduce((s,q)=>s+Number(q.monto||0),0));
    const byId=Object.fromEntries((debts||[]).map(d=>[d.id,d]));
    const list=document.getElementById('dcLista');

    if(!qs?.length){
      list.innerHTML='<p class="muted">No hay cuotas pendientes dentro de los próximos 30 días.</p>';
    } else {
      list.innerHTML=qs.slice(0,6).map(q=>{
        const d=byId[q.deuda_id]||{};
        return `<button type="button" class="dc-row" data-debt="${Number(q.deuda_id)}">
          <span><strong>${esc(d.acreedor||'Deuda')}</strong>
          <small>Cuota ${Number(q.numero_cuota)} · ${esc(q.fecha_vencimiento)}</small></span>
          <strong>${money(q.monto)}</strong>
        </button>`;
      }).join('');

      list.querySelectorAll('.dc-row').forEach(b=>b.onclick=()=>{
        const tab=document.querySelector('[data-tab="deudas"]');
        if(tab)tab.click();
        setTimeout(()=>window.verDeuda?.(Number(b.dataset.debt)),50);
      });
    }

    document.getElementById('dcEstado').textContent=
      `Ventana de control: ${t} → ${endKey}. Las cuotas son obligaciones programadas; el saldo cambia al registrar el pago real.`;
  }

  function start(){
    inject();
    load();

    const old=window.refresh;
    if(old&&!old.__debtWrapped){
      const wrapped=async function(...args){
        const result=await old.apply(this,args);
        try{await load();}catch(e){console.error(e);}
        return result;
      };
      wrapped.__debtWrapped=true;
      window.refresh=wrapped;
    }
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);
  else start();
})();