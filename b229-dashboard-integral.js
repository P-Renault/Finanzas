/* B2.29 — DASHBOARD FINANCIERO INTEGRAL
   Centro de situación financiera. Solo lectura.
   No crea, modifica ni elimina registros.
*/
(()=>{'use strict';
const $=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const M=n=>new Intl.NumberFormat('es-CL',{style:'currency',currency:'CLP',maximumFractionDigits:0}).format(Number(n)||0);
const T=()=>{const d=new Date();return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,10)};
const norm=s=>String(s??'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
const amount=r=>Number(r?.monto_neto??r?.monto??r?.importe??r?.monto_generado??0)||0;
const status=r=>norm(r?.estado_cobro??r?.estado??'pendiente');

function db(){const u=localStorage.getItem('sf_url'),k=localStorage.getItem('sf_key');return u&&k&&window.supabase?window.supabase.createClient(u,k,{auth:{persistSession:false,autoRefreshToken:false}):null}
function style(){if($('b229dashStyle'))return;const s=document.createElement('style');s.id='b229dashStyle';s.textContent=`
#b229Dash{margin-top:12px}.b229-head{display:flex;justify-content:space-between;gap:10px;align-items:flex-start}.b229-kicker{font-size:11px;color:#64748b}.b229-title{margin:3px 0 2px}.b229-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}.b229-card{background:#fff;border:1px solid #e2e8f0;border-radius:13px;padding:12px}.b229-card span,.b229-card small{display:block;color:#64748b;font-size:11px}.b229-card strong{display:block;margin-top:5px;font-size:19px;color:#111827}.b229-section{margin-top:12px}.b229-section h3{margin:0 0 9px}.b229-row{display:flex;justify-content:space-between;gap:12px;padding:10px 0;border-bottom:1px solid #e5e7eb}.b229-row small{display:block;color:#64748b;margin-top:3px}.b229-two{display:grid;grid-template-columns:1fr 1fr;gap:12px}.b229-status{display:inline-block;padding:4px 7px;border-radius:999px;font-size:10px;font-weight:800;background:#e2e8f0;color:#334155}.b229-status.overdue{background:#fee2e2;color:#991b1b}.b229-status.today{background:#ffedd5;color:#9a3412}.b229-status.next{background:#fef3c7;color:#92400e}.b229-status.paid,.b229-status.collected{background:#dcfce7;color:#166534}.b229-status.pending{background:#e0e7ff;color:#3730a3}.b229-venc{max-height:460px;overflow:auto}.b229-empty{padding:14px;background:#f8fafc;border-radius:10px;color:#64748b}.b229-ok{background:#ecfdf5;color:#166534}.b229-warn{background:#fff7ed;color:#9a3412}.b229-info{background:#f8fafc;color:#475569}.b229-foot{font-size:11px;color:#64748b;margin-top:10px}.b229-source{font-size:12px;color:#334155}.b229-refresh{white-space:nowrap}
@media(max-width:850px){.b229-grid{grid-template-columns:1fr 1fr}.b229-two{grid-template-columns:1fr}}@media(max-width:520px){.b229-grid{grid-template-columns:1fr 1fr}.b229-card strong{font-size:16px}}
`;document.head.appendChild(s)}

function canonicalItems(quotas,comms,mov){
 const items=[];
 for(const q of quotas){
  items.push({source:'debt',id:q.id,deuda_id:q.deuda_id,date:q.fecha_vencimiento,concept:q.concepto||('Cuota de deuda #'+(q.numero_cuota??q.id)),category:'Deuda',amount:Number(q.monto||0),state:norm(q.estado||'pendiente'),relation:q.movimiento_id||q.pago_deuda_id||null});
 }
 for(const c of comms){
  const debtRef=c.deuda_id??c.cuota_id??c.pago_deuda_id??c.debt_id??null;
  const duplicate=debtRef!=null && items.some(x=>String(x.deuda_id)===String(debtRef) && x.date===c.fecha_vencimiento && x.amount===Number(c.monto||0));
  if(!duplicate)items.push({source:'commitment',id:c.id,deuda_id:debtRef,date:c.fecha_vencimiento,concept:c.concepto||'Compromiso',category:c.categoria||'Obligación',amount:Number(c.monto||0),state:norm(c.estado||'pendiente'),relation:c.deuda_id??c.cuota_id??c.pago_deuda_id??null});
 }
 // Remove exact duplicates when a debt quota was also copied as a commitment.
 const seen=new Set();
 return items.filter(x=>{const key=(x.deuda_id!=null?'D:'+x.deuda_id:'C:'+norm(x.concept)+'|'+x.date+'|'+x.amount+'|'+norm(x.category));if(seen.has(key))return false;seen.add(key);return true});
}

function labelState(x,t){
 if(['pagado','paid','cancelado','cobrado','collected'].includes(x.state))return x.state==='cobrado'||x.state==='collected'?'Cobrado':'Pagado';
 if(x.date<t)return 'Vencido'; if(x.date===t)return 'Vence hoy'; return 'Próximo';
}
function badge(s){const cls=norm(s).replace(' ','');return `<span class="b229-status ${cls}">${esc(s)}</span>`}

async function render(){
 const host=$('dashboard');if(!host)return;
 style();
 let root=$('b229Dash');
 if(!root){root=document.createElement('div');root.id='b229Dash';host.appendChild(root)}
 const c=db();if(!c){root.innerHTML='<div class="card b229-info">Conecta Supabase para mostrar el Dashboard Financiero Integral.</div>';return}
 root.innerHTML='<div class="card b229-info">Actualizando situación financiera…</div>';
 try{
  const t=T(), ym=t.slice(0,7), monthStart=ym+'-01';
  const endD=new Date(t+'T12:00:00');endD.setMonth(endD.getMonth()+1);endD.setDate(0);const monthEnd=endD.toISOString().slice(0,10);
  const [cf,banks,mov,comms,debt,quotas,gens,sources]=await Promise.all([
   c.from('cierres_financieros').select('*').eq('activo',true).order('fecha_corte',{ascending:false}).limit(1).maybeSingle(),
   c.from('cuentas_bancarias').select('*').eq('activa',true),
   c.from('movimientos').select('*').order('fecha',{ascending:true}),
   c.from('compromisos').select('*').order('fecha_vencimiento',{ascending:true}),
   c.from('v_deudas_resumen').select('*'),
   c.from('cuotas_deuda').select('*'),
   c.from('generacion_ingresos').select('*'),
   c.from('fuentes_ingreso').select('*')
  ]);
  for(const r of [cf,banks,mov,comms,debt,quotas,gens,sources])if(r.error)throw r.error;

  const cash=Number(cf.data?.[0]?.saldo_efectivo_actual??cf.data?.[0]?.saldo_efectivo??0)||0;
  const bank=(banks.data||[]).reduce((s,r)=>s+Number(r.saldo_actual??r.saldo??0),0);
  const actualMov=(mov.data||[]).filter(r=>r.fecha<=t);
  const saldo=actualMov.reduce((s,r)=>s+(norm(r.tipo)==='ingreso'?Number(r.monto||0):-Number(r.monto||0)),0);
  const liquidity=cash+bank;
  const futureMov=(mov.data||[]).filter(r=>r.fecha>t);
  const futureIncome=futureMov.filter(r=>norm(r.tipo)==='ingreso').reduce((s,r)=>s+Number(r.monto||0),0);
  const futureExpense=futureMov.filter(r=>norm(r.tipo)==='gasto').reduce((s,r)=>s+Number(r.monto||0),0);

  const debtRows=(debt.data||[]).filter(r=>!['pagada','cancelada','paid','cancelled'].includes(norm(r.estado)));
  const debtTotal=debtRows.reduce((s,r)=>s+Number(r.saldo_actual??r.saldo_pendiente??0),0);
  const activeDebts=debtRows.length;
  const debtQuotas=(quotas.data||[]).filter(q=>['pendiente','vencida','overdue'].includes(norm(q.estado)));
  const pendingQuotaCount=debtQuotas.length;
  const debtOverdue=debtRows.filter(d=>d.proximo_vencimiento && d.proximo_vencimiento<t).reduce((s,d)=>s+Number(d.saldo_actual??0),0);
  const debtDueSoon=debtRows.filter(d=>d.proximo_vencimiento && d.proximo_vencimiento>=t).reduce((s,d)=>s+Number(d.saldo_actual??0),0);

  const items=canonicalItems(debtQuotas,(comms.data||[]).filter(c=>['pendiente','vencida'].includes(norm(c.estado))),mov.data||[]);
  const monthItems=items.filter(x=>x.date>=monthStart&&x.date<=monthEnd);
  const monthTotal=monthItems.reduce((s,x)=>s+x.amount,0);
  const monthPending=monthItems.filter(x=>!['pagado','cobrado','paid','collected'].includes(x.state)).reduce((s,x)=>s+x.amount,0);
  const monthPaid=(mov.data||[]).filter(r=>r.fecha>=monthStart&&r.fecha<=t&&norm(r.tipo)==='gasto').reduce((s,r)=>s+Number(r.monto||0),0);

  const monthIncome=(mov.data||[]).filter(r=>r.fecha>=monthStart&&r.fecha<=t&&norm(r.tipo)==='ingreso').reduce((s,r)=>s+Number(r.monto||0),0);
  const gen=(gens.data||[]);
  const generated=gen.reduce((s,r)=>s+amount(r),0);
  const pendingCollected=gen.filter(r=>!['cobrado','collected','pagado','paid','cancelado','cancelled'].includes(status(r))).reduce((s,r)=>s+amount(r),0);
  const futureGenerated=gen.filter(r=>r.fecha_generacion&&r.fecha_generacion>t).reduce((s,r)=>s+amount(r),0);

  const recurring=(comms.data||[]).filter(c=>norm(c.estado)==='pendiente'&&c.fecha_vencimiento>=monthStart&&c.fecha_vencimiento<=monthEnd&&['mensual','semanal','anual'].includes(norm(c.periodicidad)));
  const fixed=recurring.reduce((s,r)=>s+Number(r.monto||0),0);
  const financial=monthItems.filter(x=>norm(x.category).includes('deuda')||norm(x.category).includes('financ')).reduce((s,x)=>s+x.amount,0);
  const need=Math.max(0,fixed+financial);
  const projectedIncome=monthIncome+futureIncome+pendingCollected;
  const difference=projectedIncome-need;
  const projectedAvailable=liquidity+futureIncome+pendingCollected-futureExpense-monthPending;

  const upcoming=items.filter(x=>!['pagado','cobrado','paid','collected'].includes(x.state)).sort((a,b)=>a.date.localeCompare(b.date)).slice(0,10);
  const sourcesMap=new Map();
  for(const g of gen){
    const sid=g.fuente_id??g.fuente_ingreso_id??g.id_fuente??null;
    const src=sources.data.find(s=>sid!=null&&String(s.id)===String(sid));
    const name=src?.nombre??src?.nombre_fuente??src?.fuente??src?.descripcion??g.nombre_fuente??g.fuente??'Fuente sin identificar';
    sourcesMap.set(name,(sourcesMap.get(name)||0)+amount(g));
  }

  root.innerHTML=`
   <div class="card">
    <div class="b229-head"><div><span class="b229-kicker">B2.29 · CENTRO DE SITUACIÓN FINANCIERA</span><h2 class="b229-title">Dashboard Financiero Integral</h2><p class="muted">Una sola lectura consolidada de liquidez, deudas, obligaciones, ingresos y necesidad financiera.</p></div><button id="b229Refresh" class="secondary b229-refresh">Actualizar</button></div>
   </div>
   <div class="b229-section"><h3>Liquidez</h3><div class="b229-grid">
    <article class="b229-card"><span>Saldo actual</span><strong>${M(saldo)}</strong><small>Movimientos con fecha hasta hoy</small></article>
    <article class="b229-card"><span>Efectivo / caja</span><strong>${M(cash)}</strong><small>Liquidez controlada</small></article>
    <article class="b229-card"><span>Cuentas bancarias</span><strong>${M(bank)}</strong><small>${(banks.data||[]).length} cuenta(s) activa(s)</small></article>
    <article class="b229-card"><span>Disponible proyectado</span><strong>${M(projectedAvailable)}</strong><small>Escenario con registros actuales</small></article>
   </div></div>
   <div class="b229-section"><h3>Deudas</h3><div class="b229-grid">
    <article class="b229-card"><span>Deuda total pendiente</span><strong>${M(debtTotal)}</strong></article>
    <article class="b229-card"><span>Deuda vencida</span><strong>${M(debtOverdue)}</strong></article>
    <article class="b229-card"><span>Deuda por vencer</span><strong>${M(debtDueSoon)}</strong></article>
    <article class="b229-card"><span>Deudas activas</span><strong>${activeDebts}</strong><small>${pendingQuotaCount} cuotas pendientes</small></article>
   </div></div>
   <div class="b229-section"><h3>Obligaciones</h3><div class="b229-grid">
    <article class="b229-card"><span>Total pagos del mes</span><strong>${M(monthTotal)}</strong></article>
    <article class="b229-card"><span>Total pendiente del mes</span><strong>${M(monthPending)}</strong></article>
    <article class="b229-card"><span>Total ya pagado</span><strong>${M(monthPaid)}</strong></article>
    <article class="b229-card"><span>Próximos vencimientos</span><strong>${upcoming.length}</strong><small>Mostrando hasta 10</small></article>
   </div></div>
   <div class="b229-section"><h3>Ingresos</h3><div class="b229-two">
    <div class="b229-card"><span>Ingresos registrados</span><strong>${M(monthIncome)}</strong><small>Mes en curso</small></div>
    <div class="b229-card"><span>Ingresos futuros</span><strong>${M(futureIncome+futureGenerated)}</strong><small>Movimientos y generación futura registrada</small></div>
    <div class="b229-card"><span>Ingresos pendientes de cobro</span><strong>${M(pendingCollected)}</strong><small>Generación registrada aún no cobrada</small></div>
    <div class="b229-card"><span>Generación por fuente</span>${sourcesMap.size?Array.from(sourcesMap.entries()).slice(0,8).map(([n,v])=>`<div class="b229-row b229-source"><span>${esc(n)}</span><strong>${M(v)}</strong></div>`).join(''):'<div class="b229-empty">Sin generación de ingresos registrada por fuente.</div>'}</div>
   </div></div>
   <div class="b229-section"><h3>Presupuesto</h3><div class="b229-grid">
    <article class="b229-card"><span>Gasto fijo mensual</span><strong>${M(fixed)}</strong><small>Compromisos recurrentes identificados</small></article>
    <article class="b229-card"><span>Obligaciones financieras del mes</span><strong>${M(financial)}</strong></article>
    <article class="b229-card"><span>Necesidad financiera mensual</span><strong>${M(need)}</strong><small>Fijos + financieras identificadas</small></article>
    <article class="b229-card"><span>Ingreso proyectado</span><strong>${M(projectedIncome)}</strong><small>Registrado + futuro + pendiente de cobro</small></article>
   </div><div class="b229-card b229-section ${difference>=0?'b229-ok':'b229-warn'}"><span>Diferencia entre ingresos y necesidad</span><strong>${M(difference)}</strong><small>No ejecuta ninguna acción; representa el escenario calculado con los datos disponibles.</small></div></div>
   <div class="b229-section"><div class="card"><div class="b229-head"><div><h3>Centro de Próximos Vencimientos</h3><p class="muted">Representación consolidada: una cuota de deuda no se repite como otra obligación.</p></div></div><div class="b229-venc">${upcoming.length?upcoming.map(x=>`<div class="b229-row"><span><strong>${esc(x.date)}</strong><small>${esc(x.concept)} · ${esc(x.category)}</small></span><span><strong>${M(x.amount)}</strong><br>${badge(labelState(x,t))}</span></div>`).join(''):'<div class="b229-empty">No existen próximos vencimientos pendientes en los registros consultados.</div>'}</div><p class="b229-foot">Estados: vencido · vence hoy · próximo · pagado · cobrado · pendiente. Las cuotas de deuda se consolidan por su identificación estructural para evitar doble conteo.</p></div></div>
  `;
  $('b229Refresh').onclick=render;
 }catch(e){root.innerHTML=`<div class="card b229-warn">No fue posible construir el Dashboard Integral: ${esc(e.message||e)}</div>`}
}

function init(){style();render();document.addEventListener('click',e=>{if(e.target.closest('[data-tab="dashboard"]'))setTimeout(render,250)},true)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(init,700),{once:true});else setTimeout(init,700);
})();