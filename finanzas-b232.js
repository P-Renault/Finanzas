/* FINANZAS B2.3.2 — CENTRO Y LIQUIDEZ INICIAL */
(() => {
  const money=n=>new Intl.NumberFormat('es-CL',{style:'currency',currency:'CLP',maximumFractionDigits:0}).format(Number(n)||0);
  let c=null;
  async function db(){
    if(c)return c;
    const u=localStorage.getItem('sf_url'),k=localStorage.getItem('sf_key');
    if(!u||!k||!window.supabase)return null;
    c=window.supabase.createClient(u,k);return c;
  }
  async function load(){
    const x=await db();if(!x)return;
    const {data:cut}=await x.from('cierres_financieros').select('saldo_inicial,fecha_corte')
      .eq('estado','activo').eq('nombre','Reconstrucción financiera — Finanzas V2').limit(1).maybeSingle();
    if(document.getElementById('b232Opening'))document.getElementById('b232Opening').textContent=money(cut?.saldo_inicial||0);

    const {data:debts}=await x.from('v_deudas_resumen').select('*');
    const active=(debts||[]).filter(d=>!['pagada','cancelada'].includes(d.estado));
    const saldo=active.reduce((s,d)=>s+Number(d.saldo_actual||0),0);
    const cuotas=active.reduce((s,d)=>s+Number(d.cuotas_pendientes||0),0);
    if(document.getElementById('b232DebtBalance'))document.getElementById('b232DebtBalance').textContent=money(saldo);
    if(document.getElementById('b232DebtCount'))document.getElementById('b232DebtCount').textContent=String(cuotas);
  }
  function inject(){
    if(document.getElementById('b232OpeningCard'))return;
    const d=document.getElementById('dashboard');if(!d)return;
    const card=document.createElement('div');card.id='b232OpeningCard';card.className='card b232-opening';
    card.innerHTML=`<div class="section-title"><div><span class="muted">CERO FINANCIERO · 17/09/2026</span><h2>Liquidez inicial</h2></div></div>
      <div class="b232-open-grid"><div><span>Saldo de apertura</span><strong id="b232Opening">$0</strong><small>No es un ingreso</small></div>
      <div><span>Efectivo</span><b>$50</b><span>BancoEstado</span><b>$1.500</b><span>Santander</span><b>$274</b><hr><strong>Total $1.824</strong></div></div>`;
    const cards=d.querySelector('.cards');if(cards)cards.insertAdjacentElement('afterend',card);else d.prepend(card);
  }
  function start(){inject();load();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();

