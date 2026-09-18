/* FINANZAS B2.24 FINAL — PLANIFICACIÓN INTEGRADA
   Solo lectura. No crea movimientos, pagos ni modifica liquidez.
   Fuente: cierres_financieros + cuentas_bancarias + movimientos futuros
           + compromisos pendientes + cuotas de deuda pendientes/vencidas.
*/
(()=>{'use strict';
const $=id=>document.getElementById(id);
const money=n=>new Intl.NumberFormat('es-CL',{style:'currency',currency:'CLP',maximumFractionDigits:0}).format(Number(n)||0);
const num=n=>new Intl.NumberFormat('es-CL',{maximumFractionDigits:0}).format(Number(n)||0);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const today=()=>{const d=new Date();return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,10)};
const addDays=(s,n)=>{const d=new Date(s+'T12:00:00');d.setDate(d.getDate()+n);return d.toISOString().slice(0,10)};
let c=null;
function db(){if(c)return c;const u=localStorage.getItem('sf_url'),k=localStorage.getItem('sf_key');if(u&&k&&window.supabase)c=window.supabase.createClient(u,k,{auth:{persistSession:false,autoRefreshToken:false}});return c}
function styles(){if($('b224FinalStyle'))return;const s=document.createElement('style');s.id='b224FinalStyle';s.textContent=`
.b224f-kpis{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}.b224f-kpi{padding:13px;border:1px solid #e5e7eb;border-radius:14px;background:#fff}.b224f-kpi span,.b224f-kpi small{display:block;color:#64748b;font-size:11px}.b224f-kpi strong{display:block;margin-top:5px;font-size:20px}.b224f-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.b224f-row{display:flex;justify-content:space-between;gap:12px;padding:11px 0;border-bottom:1px solid #e5e7eb}.b224f-row small{display:block;color:#64748b;font-size:11px;margin-top:2px}.b224f-status{padding:12px;border-radius:12px;margin-top:12px}.b224f-ok{background:#ecfdf5;color:#166534}.b224f-warn{background:#fff7ed;color:#9a3412}.b224f-neutral{background:#f8fafc;color:#475569}.b224f-list{max-height:360px;overflow:auto}.b224f-date{font-variant-numeric:tabular-nums}@media(max-width:760px){.b224f-kpis{grid-template-columns:1fr 1fr}.b224f-grid{grid-template-columns:1fr}}
`;document.head.appendChild(s)}
function mount(){
 let s=$('planificacion'),app=$('app');if(!app)return null;
 if(!s){s=document.createElement('section');s.id='planificacion';s.className='tab hidden';app.appendChild(s)}
 s.innerHTML=`<div class="card">
 <div class="section-title"><div><span class="muted">B2.24 · MODELO DE FLUJO</span><h2>Planificación financiera</h2><p class="muted">Proyección de 30 días construida sobre la liquidez y las obligaciones que realmente existen en el sistema.</p></div><button type="button" class="secondary" id="b224fRefresh">Actualizar</button></div>
 <div class="b224f-kpis">
  <article class="b224f-kpi"><span>Liquidez real</span><strong id="b224fLiq">$0</strong><small>Efectivo + bancos activos</small></article>
  <article class="b224f-kpi"><span>Ingresos futuros</span><strong id="b224fIn">$0</strong><small>Movimientos programados</small></article>
  <article class="b224f-kpi"><span>Obligaciones 30 días</span><strong id="b224fOut">$0</strong><small>Compromisos + cuotas</small></article>
  <article class="b224f-kpi"><span>Saldo mínimo</span><strong id="b224fMin">$0</strong><small>Punto más bajo del escenario</small></article>
 </div><div id="b224fStatus" class="b224f-status b224f-neutral">Calculando…</div></div>
 <div class="b224f-grid">
  <div class="card"><h3>Escenario</h3>
   <div class="b224f-row"><span>Fecha del mínimo</span><strong id="b224fDate" class="b224f-date">—</strong></div>
   <div class="b224f-row"><span>Déficit máximo</span><strong id="b224fDef">$0</strong></div>
   <div class="b224f-row"><span>Referencia diaria si existe déficit</span><strong id="b224fDaily">$0</strong></div>
   <div class="b224f-row"><span>Margen al mínimo</span><strong id="b224fMargin">$0</strong></div>
  </div>
  <div class="card"><h3>Componentes</h3>
   <div class="b224f-row"><span>Ingresos programados <small id="b224fInCount">0 registros</small></span><strong id="b224fIn2">$0</strong></div>
   <div class="b224f-row"><span>Compromisos <small id="b224fComCount">0 registros</small></span><strong id="b224fCom">$0</strong></div>
   <div class="b224f-row"><span>Cuotas de deuda <small id="b224fDebtCount">0 cuotas</small></span><strong id="b224fDebt">$0</strong></div>
   <div class="b224f-row"><span>Ahorro referencial 10%</span><strong id="b224fSave">$0</strong></div>
  </div>
 </div>
 <div class="b224f-grid">
  <div class="card"><h3>Próximas obligaciones</h3><div id="b224fList" class="b224f-list"><p class="muted">Calculando…</p></div></div>
  <div class="card"><h3>Interpretación del flujo</h3><div id="b224fInterpret" class="b224f-status b224f-neutral">—</div><p class="muted">Esta sección analiza. No registra pagos, no modifica saldos y no genera ingresos automáticamente.</p></div>
 </div>`;
 return s
}
async function render(){
 const s=mount(),box=$('b224fStatus');if(!s)return;
 const client=db();if(!client){box.textContent='Conecta Supabase para calcular la planificación.';return}
 try{
  const t=today(),end=addDays(t,29);
  const [cf,banks,mov,com,quota]=await Promise.all([
   client.from('cierres_financieros').select('saldo_efectivo_actual,fecha_corte').eq('activo',true).order('fecha_corte',{ascending:false}).limit(1).maybeSingle(),
   client.from('cuentas_bancarias').select('saldo_actual').eq('activa',true),
   client.from('movimientos').select('id,tipo,fecha,monto,categoria,descripcion,naturaleza').gt('fecha',t).lte('fecha',end),
   client.from('compromisos').select('id,concepto,monto,fecha_vencimiento,categoria,estado').eq('estado','pendiente').gte('fecha_vencimiento',t).lte('fecha_vencimiento',end),
   client.from('cuotas_deuda').select('id,deuda_id,monto,fecha_vencimiento,estado').in('estado',['pendiente','vencida']).gte('fecha_vencimiento',t).lte('fecha_vencimiento',end)
  ]);
  for(const r of [cf,banks,mov,com,quota])if(r.error)throw r.error;
  const liquidity=Number(cf.data?.saldo_efectivo_actual||0)+(banks.data||[]).reduce((a,x)=>a+Number(x.saldo_actual||0),0);
  const futureMov=(mov.data||[]), incomes=futureMov.filter(x=>x.tipo==='ingreso'), expenses=futureMov.filter(x=>x.tipo==='gasto');
  const commitments=com.data||[], quotas=quota.data||[];
  const day={};for(let i=0;i<30;i++)day[addDays(t,i)]={in:0,out:0,items:[]};
  incomes.forEach(x=>{if(day[x.fecha]){day[x.fecha].in+=Number(x.monto||0);day[x.fecha].items.push({date:x.fecha,type:'Ingreso futuro',name:x.descripcion||x.categoria||'Ingreso',amount:Number(x.monto||0),sign:1})}});
  expenses.forEach(x=>{if(day[x.fecha]){day[x.fecha].out+=Number(x.monto||0);day[x.fecha].items.push({date:x.fecha,type:'Gasto futuro',name:x.descripcion||x.categoria||'Gasto',amount:Number(x.monto||0),sign:-1})}});
  commitments.forEach(x=>{if(day[x.fecha_vencimiento]){day[x.fecha_vencimiento].out+=Number(x.monto||0);day[x.fecha_vencimiento].items.push({date:x.fecha_vencimiento,type:'Compromiso',name:x.concepto||x.categoria||'Compromiso',amount:Number(x.monto||0),sign:-1})}});
  quotas.forEach(x=>{if(day[x.fecha_vencimiento]){day[x.fecha_vencimiento].out+=Number(x.monto||0);day[x.fecha_vencimiento].items.push({date:x.fecha_vencimiento,type:'Cuota de deuda',name:'Cuota de deuda #'+x.id,amount:Number(x.monto||0),sign:-1})}});
  let bal=liquidity,min=liquidity,minDate=t,totalIn=0,totalOut=0;
  for(const date of Object.keys(day).sort()){bal+=day[date].in-day[date].out;totalIn+=day[date].in;totalOut+=day[date].out;if(bal<min){min=bal;minDate=date}}
  const deficit=Math.max(0,-min),daily=deficit?Math.ceil(deficit/30):0,save=Math.round(totalIn*.10);
  const commitmentTotal=commitments.reduce((a,x)=>a+Number(x.monto||0),0),debtTotal=quotas.reduce((a,x)=>a+Number(x.monto||0),0);
  $('b224fLiq').textContent=money(liquidity);$('b224fIn').textContent=money(totalIn);$('b224fOut').textContent=money(totalOut);$('b224fMin').textContent=money(min);
  $('b224fDate').textContent=minDate;$('b224fDef').textContent=money(deficit);$('b224fDaily').textContent=money(daily);$('b224fMargin').textContent=money(Math.max(0,min));
  $('b224fIn2').textContent=money(totalIn);$('b224fCom').textContent=money(commitmentTotal);$('b224fDebt').textContent=money(debtTotal);$('b224fSave').textContent=money(save);
  $('b224fInCount').textContent=incomes.length+' registros';$('b224fComCount').textContent=commitments.length+' registros';$('b224fDebtCount').textContent=quotas.length+' cuotas';
  const items=Object.keys(day).sort().flatMap(x=>day[x].items).sort((a,b)=>a.date.localeCompare(b.date));
  $('b224fList').innerHTML=items.length?items.map(x=>`<div class="b224f-row"><span>${esc(x.name)}<small>${esc(x.type)} · ${esc(x.date)}</small></span><strong>${x.sign<0?'-':'+'}${money(x.amount)}</strong></div>`).join(''):'<p class="muted">Sin obligaciones o ingresos futuros registrados dentro de los próximos 30 días.</p>';
  box.className='b224f-status '+(deficit?'b224f-warn':'b224f-ok');
  box.textContent=deficit?`El escenario alcanza un déficit máximo de ${money(deficit)} el ${minDate}. La referencia diaria matemática es ${money(daily)}; no representa una obligación.`:`Con los registros actuales, el escenario de 30 días permanece sobre $0. El saldo mínimo proyectado es ${money(min)}.`;
  $('b224fInterpret').className='b224f-status '+(deficit?'b224f-warn':'b224f-ok');
  $('b224fInterpret').textContent=deficit?'El flujo requiere generación/cobro adicional o reprogramación de obligaciones antes del punto mínimo. La planificación no ejecuta esas acciones.':'Los registros actuales mantienen margen de liquidez durante el horizonte analizado.';
 }catch(e){box.className='b224f-status b224f-warn';box.textContent='Error de lectura: '+(e.message||e)}
}
function init(){
 styles();
 mount();
 const activate=()=>{
   const b=document.querySelector('.tabs button[data-tab="planificacion"]');
   const s=$('planificacion');
   if(!b||!s)return false;
   if(!b.dataset.b224Final){
     b.dataset.b224Final='1';
     b.onclick=()=>{
       document.querySelectorAll('.tabs button').forEach(x=>x.classList.remove('active'));
       b.classList.add('active');
       document.querySelectorAll('.tab').forEach(x=>x.classList.add('hidden'));
       s.classList.remove('hidden');
       render();
     };
   }
   $('b224fRefresh').onclick=render;
   if(b.classList.contains('active'))render();
   return true;
 };
 activate();
 let tries=0;
 const timer=setInterval(()=>{tries++;if(activate()||tries>=30)clearInterval(timer)},300);const b=document.querySelector('.tabs button[data-tab="planificacion"]');if(b){b.onclick=()=>{document.querySelectorAll('.tabs button').forEach(x=>x.classList.remove('active'));b.classList.add('active');document.querySelectorAll('.tab').forEach(x=>x.classList.add('hidden'));$('planificacion').classList.remove('hidden');render()};if(b.classList.contains('active'))render()}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(init,700),{once:true});else setTimeout(init,700);
})();