/* EXEC-DASH V1.2.1 — Debt Analytics Data Repair
 * Uses the operational v_deudas_resumen view as the authoritative fallback
 * when direct table access is empty/blocked by RLS. No dates are invented.
 */
(() => {
  'use strict';
  const money = n => Number(n||0).toLocaleString('es-CL',{style:'currency',currency:'CLP',maximumFractionDigits:0});
  const num = v => Number.isFinite(Number(v)) ? Number(v) : 0;
  const today = () => { const d=new Date(); return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,10); };
  const db = () => window.supabaseClient || ((window.supabase && localStorage.getItem('sf_url') && localStorage.getItem('sf_key'))
    ? (window.supabaseClient=window.supabase.createClient(localStorage.getItem('sf_url'),localStorage.getItem('sf_key'),{auth:{persistSession:false,autoRefreshToken:false}})) : null);

  function state(v){ return String(v||'').trim().toLowerCase(); }
  function normalize(row){
    const due=String(row.proximo_vencimiento||row.fecha_vencimiento||'').slice(0,10);
    const start=String(row.fecha_inicio||row.fecha_inicio_pago||row.fecha_primera_cuota||'').slice(0,10);
    const st=state(row.estado);
    const amount=num(row.saldo_actual ?? row.saldo_pendiente ?? row.monto_original ?? row.monto);
    const negotiation=st.includes('negoci')||st.includes('renegoci')||st.includes('por negociar')||st.includes('acuerdo pendiente');
    const unpaid=!negotiation && (!st||st.includes('pendiente')||st.includes('vencid')||st.includes('atras')||st.includes('activo')||st.includes('vigente'));
    return {id:row.id,creditor:row.acreedor||row.nombre||'Deuda',amount,dueDate:due||null,startDate:start||null,state:st,negotiation,unpaid,noStartDate:!start};
  }

  function text(node,value){ if(node) node.textContent=value; }
  function rebuildCards(debts){
    const month=today().slice(0,7);
    const monthDebts=debts.filter(d=>(d.dueDate&&d.dueDate.slice(0,7)===month)||(d.startDate&&d.startDate.slice(0,7)===month));
    const categories=[
      ['Pendientes de negociación',debts.filter(d=>d.negotiation)],
      ['Pendientes de pago',debts.filter(d=>d.unpaid)],
      ['Sin fecha de inicio',debts.filter(d=>d.noStartDate)]
    ];
    const mount=(id,rows,empty)=>{
      const c=document.getElementById(id); if(!c) return;
      c.innerHTML='';
      const total=rows.reduce((s,d)=>s+d.amount,0);
      if(!rows.length){ c.innerHTML=`<div class="debt-fix-empty">${empty}</div>`; return; }
      const max=Math.max(...rows.map(d=>d.amount),1);
      rows.slice(0,12).forEach((d,i)=>{
        const w=Math.max(3,(d.amount/max)*100);
        const row=document.createElement('div'); row.className='debt-fix-row';
        row.innerHTML=`<span>${d.creditor}${d.dueDate?' · '+d.dueDate:''}</span><b>${money(d.amount)}</b><i><em style="width:${w}%"></em></i>`;
        c.appendChild(row);
      });
      const foot=document.createElement('strong'); foot.className='debt-fix-total'; foot.textContent=`Total: ${money(total)} · ${rows.length} deuda${rows.length===1?'':'s'}`; c.appendChild(foot);
    };
    mount('chart-debt-month',monthDebts,'Sin deudas registradas para el mes en curso.');
    const backlog=categories.flatMap(([label,rows])=>rows.length?[{label,rows}]:[]);
    const bc=document.getElementById('chart-debt-planning');
    if(bc){ bc.innerHTML=''; if(!backlog.length){bc.innerHTML='<div class="debt-fix-empty">No hay deudas en estas categorías.</div>';}
      else backlog.forEach((g,i)=>{ const total=g.rows.reduce((s,d)=>s+d.amount,0); const row=document.createElement('div'); row.className='debt-fix-group'; row.innerHTML=`<div><b>${g.label}</b><span>${g.rows.length} deuda${g.rows.length===1?'':'s'} · ${money(total)}</span></div>`; bc.appendChild(row); }); }
  }

  async function run(){
    const c=db(); if(!c) return;
    const r=await c.from('v_deudas_resumen').select('*').order('acreedor');
    if(r.error){ console.error('[EXEC-DASH V1.2.1]',r.error); return; }
    const debts=(r.data||[]).filter(d=>!['pagada','cancelada'].includes(state(d.estado))).map(normalize).filter(d=>d.amount>0);
    window.__executiveDebtAnalytics={version:'EXEC-DASH-V1.2.1',source:'v_deudas_resumen',count:debts.length,total:debts.reduce((s,d)=>s+d.amount,0),debts};
    rebuildCards(debts);
  }
  function start(){ setTimeout(run,250); setTimeout(run,1200); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start,{once:true}); else start();
})();
