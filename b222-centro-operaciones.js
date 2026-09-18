/* FINANZAS B2.22 — CENTRO DE OPERACIONES / CUANTIFICACIÓN
   Objetivo:
   - separar liquidez real, ingresos futuros, gastos operativos y deuda;
   - evitar contar movimientos futuros como liquidez actual;
   - mostrar el flujo mensual con datos existentes;
   - no crear jornadas duplicadas ni modificar datos históricos.
*/
(()=>{'use strict';
const $=id=>document.getElementById(id);
const M=n=>new Intl.NumberFormat('es-CL',{style:'currency',currency:'CLP',maximumFractionDigits:0}).format(Number(n)||0);
const T=()=>{const d=new Date();return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,10)};
const YM=s=>String(s||'').slice(0,7);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));

let c=null;
function db(){
  if(c)return c;
  const u=localStorage.getItem('sf_url'),k=localStorage.getItem('sf_key');
  if(u&&k&&window.supabase)c=window.supabase.createClient(u,k,{auth:{persistSession:false,autoRefreshToken:false}});
  return c;
}
async function q(p){try{const r=await p;return r?.error?{data:[],error:r.error}:{data:r?.data||[],error:null}}catch(e){return {data:[],error:e}}}

function ensureStyles(){
 if($('b222Styles'))return;
 const s=document.createElement('style');s.id='b222Styles';
 s.textContent=`
 .b222-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}
 .b222-kpi{border:1px solid #e2e8f0;border-radius:14px;padding:13px;background:#fff}
 .b222-kpi span{display:block;color:#64748b;font-size:11px}.b222-kpi strong{display:block;margin-top:5px;font-size:20px}
 .b222-kpi small{display:block;color:#64748b;margin-top:4px}
 .b222-flow{display:grid;grid-template-columns:1fr 1fr;gap:12px}
 .b222-row{display:flex;justify-content:space-between;gap:10px;padding:10px 0;border-bottom:1px solid #e5e7eb}
 .b222-row small{display:block;color:#64748b;font-size:11px}
 .b222-note{padding:10px 12px;border-radius:10px;background:#f8fafc;color:#475569}
 .b222-warn{background:#fff7ed;color:#9a3412}.b222-ok{background:#ecfdf5;color:#166534}
 @media(max-width:760px){.b222-grid{grid-template-columns:1fr 1fr}.b222-flow{grid-template-columns:1fr}}
 `;
 document.head.appendChild(s);
}

function ensureOps(){
 const sec=$('operaciones');if(!sec)return;
 const existing=$('b222Ops');
 if(existing)return;
 sec.innerHTML=`
 <div class="card" id="b222Ops">
  <div class="section-title">
   <div><span class="muted">B2.22 · CENTRO DE OPERACIONES</span>
   <h2>Control financiero integrado</h2>
   <p class="muted">Liquidez real · flujo mensual · obligaciones · generación de ingresos.</p></div>
   <button type="button" class="secondary" id="b222Refresh">Actualizar</button>
  </div>
  <div class="b222-grid">
   <article class="b222-kpi"><span>Liquidez real</span><strong id="b222Liq">$0</strong><small>Efectivo + cuentas bancarias</small></article>
   <article class="b222-kpi"><span>Ingresos mes</span><strong id="b222Income">$0</strong><small>Movimientos reales</small></article>
   <article class="b222-kpi"><span>Gastos operativos</span><strong id="b222Expense">$0</strong><small>No incluye pagos de deuda</small></article>
   <article class="b222-kpi"><span>Pagos de deuda</span><strong id="b222DebtPaid">$0</strong><small>Separados de gasto operativo</small></article>
   <article class="b222-kpi"><span>Flujo neto del mes</span><strong id="b222Net">$0</strong><small>Ingresos − operación − deuda</small></article>
   <article class="b222-kpi"><span>Ingresos futuros</span><strong id="b222FutureIncome">$0</strong><small>Desde mañana</small></article>
   <article class="b222-kpi"><span>Compromisos futuros</span><strong id="b222FutureOut">$0</strong><small>Pagos futuros pendientes</small></article>
   <article class="b222-kpi"><span>Deuda pendiente</span><strong id="b222Debt">$0</strong><small>Saldo estructurado</small></article>
  </div>
  <div class="b222-flow">
   <div class="card"><h3>Liquidez por medio</h3><div class="b222-row"><span>Efectivo / caja</span><strong id="b222Cash">$0</strong></div><div class="b222-row"><span>Cuentas bancarias</span><strong id="b222Bank">$0</strong></div><div id="b222BankList"></div></div>
   <div class="card"><h3>Lectura del flujo</h3><div class="b222-row"><span>Ingresos reales del mes</span><strong id="b222FlowIncome">$0</strong></div><div class="b222-row"><span>Gastos operativos</span><strong id="b222FlowExpense">$0</strong></div><div class="b222-row"><span>Pagos de deuda</span><strong id="b222FlowDebt">$0</strong></div><div class="b222-row"><span>Resultado neto</span><strong id="b222FlowNet">$0</strong></div></div>
  </div>
  <div class="card"><h3>Próximas obligaciones estructuradas</h3><div id="b222Obligations"></div></div>
  <div id="b222Msg" class="b222-note">Listo.</div>
 </div>`;
 $('b222Refresh').onclick=load;
}

async function load(){
 const msg=$('b222Msg');if(!msg)return;
 const x=db();if(!x){msg.textContent='Conecta Supabase para consultar el centro financiero.';return}
 msg.textContent='Actualizando…';
 const today=T(), month=YM(today);
 const start=month+'-01';
 const endDate=new Date(today+'T12:00:00');endDate.setMonth(endDate.getMonth()+1);endDate.setDate(0);
 const end=endDate.toISOString().slice(0,10);

 const [cl,banks,movs,payLinks,debtRows,qs,futureMovs,futures,gens]=await Promise.all([
  q(x.from('cierres_financieros').select('saldo_efectivo_actual,saldo_inicial,fecha_corte').eq('activo',true).order('fecha_corte',{ascending:false}).limit(1)),
  q(x.from('cuentas_bancarias').select('id,nombre_banco,nombre_cuenta,saldo_actual').eq('activa',true).order('nombre_banco')),
  q(x.from('movimientos').select('id,tipo,fecha,monto,categoria,descripcion,medio_pago,cuenta_id,naturaleza').gte('fecha',start).lte('fecha',end)),
  q(x.from('pagos_deuda').select('movimiento_id,monto').not('movimiento_id','is',null)),
  q(x.from('v_deudas_resumen').select('id,acreedor,saldo_actual,proximo_vencimiento,estado').order('proximo_vencimiento',{ascending:true})),
  q(x.from('cuotas_deuda').select('deuda_id,numero_cuota,monto,fecha_vencimiento,estado').in('estado',['pendiente','vencida']).gte('fecha_vencimiento',today).order('fecha_vencimiento').limit(20)),
  q(x.from('movimientos').select('tipo,fecha,monto').gt('fecha',today)),
  q(x.from('compromisos').select('concepto,fecha_vencimiento,monto,estado,categoria').eq('estado','pendiente').gt('fecha_vencimiento',today).order('fecha_vencimiento').limit(50)),
  q(x.from('generacion_ingresos').select('monto_neto,estado_cobro').neq('estado_cobro','cancelado').limit(200))
 ]);
 const cash=Number(cl.data[0]?.saldo_efectivo_actual||0);
 const bank=banks.data.reduce((s,a)=>s+Number(a.saldo_actual||0),0);
 const liq=cash+bank;
 const debtMov=new Set(payLinks.data.map(p=>Number(p.movimiento_id)));
 const monthMov=movs.data;
 const income=monthMov.filter(r=>r.tipo==='ingreso'&&r.fecha<=today).reduce((s,r)=>s+Number(r.monto||0),0);
 const opExp=monthMov.filter(r=>r.tipo==='gasto'&&r.fecha<=today&&!debtMov.has(Number(r.id))).reduce((s,r)=>s+Number(r.monto||0),0);
 const debtPaid=monthMov.filter(r=>r.tipo==='gasto'&&r.fecha<=today&&debtMov.has(Number(r.id))).reduce((s,r)=>s+Number(r.monto||0),0);
 const net=income-opExp-debtPaid;
 const fi=futureMovs.data.filter(r=>r.tipo==='ingreso').reduce((s,r)=>s+Number(r.monto||0),0);
 const fo=futureMovs.data.filter(r=>r.tipo==='gasto').reduce((s,r)=>s+Number(r.monto||0),0)+futures.data.reduce((s,r)=>s+Number(r.monto||0),0);
 const debt=debtRows.data.filter(d=>!['pagada','cancelada'].includes(String(d.estado).toLowerCase())).reduce((s,d)=>s+Number(d.saldo_actual||0),0);
 const generated=gens.data.reduce((s,r)=>s+Number(r.monto_neto||0),0);
 const collected=gens.data.filter(r=>r.estado_cobro==='cobrado').reduce((s,r)=>s+Number(r.monto_neto||0),0);

 for(const [id,val] of [['b222Liq',liq],['b222Income',income],['b222Expense',opExp],['b222DebtPaid',debtPaid],['b222Net',net],['b222FutureIncome',fi],['b222FutureOut',fo],['b222Debt',debt],['b222Cash',cash],['b222Bank',bank],['b222FlowIncome',income],['b222FlowExpense',opExp],['b222FlowDebt',debtPaid],['b222FlowNet',net]]) if($(id))$(id).textContent=M(val);

 $('b222BankList').innerHTML=banks.data.map(a=>`<div class="b222-row"><span>${esc(a.nombre_banco)}<small>${esc(a.nombre_cuenta||'Cuenta')}</small></span><strong>${M(a.saldo_actual)}</strong></div>`).join('')||'<p class="muted">Sin cuentas bancarias activas.</p>';
 $('b222Obligations').innerHTML=qs.data.map(qt=>{
   const d=debtRows.data.find(d=>Number(d.id)===Number(qt.deuda_id));
   return `<div class="b222-row"><span><b>${esc(d?.acreedor||'Deuda')}</b><small>Cuota ${qt.numero_cuota} · ${esc(qt.fecha_vencimiento)} · ${esc(qt.estado)}</small></span><strong>${M(qt.monto)}</strong></div>`;
 }).join('')||'<p class="muted">No hay cuotas pendientes registradas.</p>';
 msg.innerHTML=`Liquidez real ${M(liq)} · generación neta registrada ${M(generated)} · cobrado ${M(collected)}.`;
 msg.className='b222-note '+(liq>=0?'b222-ok':'b222-warn');
}

function start(){
 ensureStyles();
 ensureOps();
 load();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(start,900),{once:true});else setTimeout(start,900);
})();
