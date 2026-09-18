/* FINANZAS B2.23 — FIX OPERACIONES + PLANIFICACIÓN
   Corrige dos fallos de montaje:
   1) Planificación tenía botón pero no sección #planificacion.
   2) Operaciones puede existir como botón sin contenido cuando otro módulo no monta a tiempo.
   Este parche no reemplaza datos ni crea jornadas.
*/
(()=>{'use strict';
const $=id=>document.getElementById(id);
const money=n=>new Intl.NumberFormat('es-CL',{style:'currency',currency:'CLP',maximumFractionDigits:0}).format(Number(n)||0);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const today=()=>{const d=new Date();return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,10)};
const addDays=(s,n)=>{const d=new Date(s+'T12:00:00');d.setDate(d.getDate()+n);return d.toISOString().slice(0,10)};
let client=null;
function db(){if(client)return client;const u=localStorage.getItem('sf_url'),k=localStorage.getItem('sf_key');if(u&&k&&window.supabase)client=window.supabase.createClient(u,k,{auth:{persistSession:false,autoRefreshToken:false}});return client}
async function safe(p){try{const r=await p;if(r.error)throw r.error;return r.data||[]}catch(e){throw e}}
function styles(){if($('b223Styles'))return;const s=document.createElement('style');s.id='b223Styles';s.textContent=`
.b223-kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}.b223-kpi{border:1px solid #e2e8f0;border-radius:14px;padding:13px;background:#fff}.b223-kpi span{display:block;color:#64748b;font-size:11px}.b223-kpi strong{display:block;margin-top:5px;font-size:20px}.b223-kpi small{display:block;color:#64748b;margin-top:3px}.b223-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.b223-row{display:flex;justify-content:space-between;gap:10px;padding:10px 0;border-bottom:1px solid #e5e7eb}.b223-row small{display:block;color:#64748b;font-size:11px}.b223-note{padding:11px;border-radius:10px;background:#f8fafc;color:#475569;margin-top:12px}.b223-ok{background:#ecfdf5;color:#166534}.b223-warn{background:#fff7ed;color:#9a3412}@media(max-width:760px){.b223-kpis{grid-template-columns:1fr 1fr}.b223-grid{grid-template-columns:1fr}}
`;document.head.appendChild(s)}
function ensureSection(id,title,html){
 const app=$('app');if(!app)return null;
 let s=$(id);
 if(!s){s=document.createElement('section');s.id=id;s.className='tab hidden';app.appendChild(s)}
 if(!s.innerHTML.trim()||s.id==='planificacion'&&s.innerHTML.trim()==='')s.innerHTML=html;
 return s
}
function nav(){
 const t=document.querySelector('.tabs');if(!t)return;
 const ids=[['operaciones','Operaciones'],['planificacion','Planificación']];
 ids.forEach(([id,label])=>{
   let b=t.querySelector(`[data-tab="${id}"]`);
   if(!b){b=document.createElement('button');b.type='button';b.dataset.tab=id;b.textContent=label;t.appendChild(b)}
   b.onclick=()=>show(id);
 });
}
function show(id){
 document.querySelectorAll('.tab').forEach(s=>s.classList.toggle('hidden',s.id!==id));
 document.querySelectorAll('.tabs button[data-tab]').forEach(b=>b.classList.toggle('active',b.dataset.tab===id));
 if(id==='operaciones')renderOps();
 if(id==='planificacion')renderPlan();
}
function operationsHTML(){return `<div class="card"><span class="muted">B2.23 · CENTRO DE OPERACIONES</span><h2>Control financiero integrado</h2><p class="muted">Liquidez real, flujo mensual, obligaciones y generación financiera.</p><div class="b223-kpis"><article class="b223-kpi"><span>Liquidez real</span><strong id="b223Liq">$0</strong><small>Efectivo + bancos</small></article><article class="b223-kpi"><span>Ingresos del mes</span><strong id="b223Inc">$0</strong><small>Movimientos reales</small></article><article class="b223-kpi"><span>Gastos operativos</span><strong id="b223Exp">$0</strong><small>Sin pagos de deuda</small></article><article class="b223-kpi"><span>Pagos de deuda</span><strong id="b223DebtPaid">$0</strong><small>Separados</small></article></div></div><div class="b223-grid"><div class="card"><h3>Liquidez por medio</h3><div class="b223-row"><span>Efectivo / caja</span><strong id="b223Cash">$0</strong></div><div class="b223-row"><span>Cuentas bancarias</span><strong id="b223Bank">$0</strong></div><div id="b223Banks"></div></div><div class="card"><h3>Flujo del mes</h3><div class="b223-row"><span>Ingresos</span><strong id="b223FlowInc">$0</strong></div><div class="b223-row"><span>Gasto operativo</span><strong id="b223FlowExp">$0</strong></div><div class="b223-row"><span>Deuda pagada</span><strong id="b223FlowDebt">$0</strong></div><div class="b223-row"><span>Resultado neto</span><strong id="b223FlowNet">$0</strong></div></div></div><div class="card"><h3>Estado</h3><div id="b223OpsMsg" class="b223-note">Listo.</div></div>`}
function planHTML(){return `<div class="card"><span class="muted">B2.23 · MODELO DE FLUJO</span><h2>Planificación financiera</h2><p class="muted">Escenario de 30 días basado en liquidez real, ingresos futuros, compromisos y cuotas de deuda.</p><div class="b223-kpis"><article class="b223-kpi"><span>Liquidez real</span><strong id="b223PLiq">$0</strong><small>Disponible hoy</small></article><article class="b223-kpi"><span>Ingresos futuros</span><strong id="b223PIn">$0</strong><small>30 días</small></article><article class="b223-kpi"><span>Obligaciones futuras</span><strong id="b223POut">$0</strong><small>Compromisos + cuotas</small></article><article class="b223-kpi"><span>Saldo mínimo simulado</span><strong id="b223PMin">$0</strong><small>Punto más bajo</small></article></div><div id="b223PlanMsg" class="b223-note"></div></div><div class="b223-grid"><div class="card"><h3>Escenario</h3><div class="b223-row"><span>Fecha del mínimo</span><strong id="b223PDate">—</strong></div><div class="b223-row"><span>Déficit máximo</span><strong id="b223PDef">$0</strong></div><div class="b223-row"><span>Referencia diaria si existe déficit</span><strong id="b223PDaily">$0</strong></div></div><div class="card"><h3>Componentes</h3><div class="b223-row"><span>Ingresos programados</span><strong id="b223PCountIn">0</strong></div><div class="b223-row"><span>Compromisos</span><strong id="b223PCountOut">0</strong></div><div class="b223-row"><span>Cuotas de deuda</span><strong id="b223PCountDebt">0</strong></div></div></div>`}
async function renderOps(){
 const msg=$('b223OpsMsg'),c=db();if(!c){if(msg)msg.textContent='Conecta Supabase.';return}
 try{
  const t=today(),start=t.slice(0,7)+'-01';
  const [cl,banks,m,p]=await Promise.all([
   c.from('cierres_financieros').select('saldo_efectivo_actual').eq('activo',true).order('fecha_corte',{ascending:false}).limit(1).maybeSingle(),
   c.from('cuentas_bancarias').select('nombre_banco,nombre_cuenta,saldo_actual').eq('activa',true),
   c.from('movimientos').select('id,tipo,fecha,monto').gte('fecha',start).lte('fecha',t),
   c.from('pagos_deuda').select('movimiento_id').not('movimiento_id','is',null)
  ]);
  if(cl.error)throw cl.error;if(banks.error)throw banks.error;if(m.error)throw m.error;if(p.error)throw p.error;
  const debt=new Set((p.data||[]).map(x=>Number(x.movimiento_id)));
  const inc=(m.data||[]).filter(x=>x.tipo==='ingreso').reduce((s,x)=>s+Number(x.monto||0),0);
  const exp=(m.data||[]).filter(x=>x.tipo==='gasto'&&!debt.has(Number(x.id))).reduce((s,x)=>s+Number(x.monto||0),0);
  const dp=(m.data||[]).filter(x=>x.tipo==='gasto'&&debt.has(Number(x.id))).reduce((s,x)=>s+Number(x.monto||0),0);
  const cash=Number(cl.data?.saldo_efectivo_actual||0),bank=(banks.data||[]).reduce((s,x)=>s+Number(x.saldo_actual||0),0);
  const vals=[['b223Liq',cash+bank],['b223Inc',inc],['b223Exp',exp],['b223DebtPaid',dp],['b223Cash',cash],['b223Bank',bank],['b223FlowInc',inc],['b223FlowExp',exp],['b223FlowDebt',dp],['b223FlowNet',inc-exp-dp]];
  vals.forEach(([id,v])=>{if($(id))$(id).textContent=money(v)});
  $('b223Banks').innerHTML=(banks.data||[]).map(x=>`<div class="b223-row"><span>${esc(x.nombre_banco)}<small>${esc(x.nombre_cuenta||'Cuenta')}</small></span><strong>${money(x.saldo_actual)}</strong></div>`).join('')||'<p class="muted">Sin cuentas activas.</p>';
  msg.textContent='Operaciones operativo y cuantificado con los registros actuales.';
  msg.className='b223-note b223-ok';
 }catch(e){msg.textContent='Error de lectura: '+(e.message||e);msg.className='b223-note b223-warn'}
}
async function renderPlan(){
 const box=$('b223PlanMsg'),c=db();if(!c){box.textContent='Conecta Supabase.';return}
 try{
  const t=today(),end=addDays(t,29);
  const [cl,banks,inc,comm,quota]=await Promise.all([
   c.from('cierres_financieros').select('saldo_efectivo_actual').eq('activo',true).order('fecha_corte',{ascending:false}).limit(1).maybeSingle(),
   c.from('cuentas_bancarias').select('saldo_actual').eq('activa',true),
   c.from('movimientos').select('tipo,fecha,monto').gt('fecha',t).lte('fecha',end),
   c.from('compromisos').select('monto,fecha_vencimiento').eq('estado','pendiente').gt('fecha_vencimiento',t).lte('fecha_vencimiento',end),
   c.from('cuotas_deuda').select('monto,fecha_vencimiento').in('estado',['pendiente','vencida']).gt('fecha_vencimiento',t).lte('fecha_vencimiento',end)
  ]);
  for(const r of [cl,banks,inc,comm,quota])if(r.error)throw r.error;
  let bal=Number(cl.data?.saldo_efectivo_actual||0)+(banks.data||[]).reduce((s,x)=>s+Number(x.saldo_actual||0),0);
  const days={};for(let i=0;i<30;i++)days[addDays(t,i+1)]={in:0,out:0};
  (inc.data||[]).forEach(x=>{if(days[x.fecha])days[x.fecha].in+=Number(x.monto||0)});
  (comm.data||[]).forEach(x=>{if(days[x.fecha_vencimiento])days[x.fecha_vencimiento].out+=Number(x.monto||0)});
  (quota.data||[]).forEach(x=>{if(days[x.fecha_vencimiento])days[x.fecha_vencimiento].out+=Number(x.monto||0)});
  let min=bal,minDate=t,totalIn=0,totalOut=0;
  Object.keys(days).sort().forEach(d=>{bal+=days[d].in-days[d].out;totalIn+=days[d].in;totalOut+=days[d].out;if(bal<min){min=bal;minDate=d}});
  const deficit=Math.max(0,-min),daily=Math.ceil(deficit/30);
  [['b223PLiq',Number(cl.data?.saldo_efectivo_actual||0)+(banks.data||[]).reduce((s,x)=>s+Number(x.saldo_actual||0),0)],['b223PIn',totalIn],['b223POut',totalOut],['b223PMin',min],['b223PDef',deficit],['b223PDaily',daily],['b223PCountIn',(inc.data||[]).length],['b223PCountOut',(comm.data||[]).length],['b223PCountDebt',(quota.data||[]).length]].forEach(([id,v])=>{if($(id))$(id).textContent=typeof v==='number'?money(v):String(v)});
  $('b223PDate').textContent=minDate;
  box.textContent=deficit?`El escenario presenta un déficit máximo de ${money(deficit)} el ${minDate}. Es una referencia de flujo, no un registro contable.`:'El escenario de 30 días no presenta déficit con los datos actualmente registrados.';
  box.className='b223-note '+(deficit?'b223-warn':'b223-ok');
 }catch(e){box.textContent='Error de lectura: '+(e.message||e);box.className='b223-note b223-warn'}
}
function mount(){
 styles();nav();
 ensureSection('operaciones','Operaciones',operationsHTML());
 ensureSection('planificacion','Planificación',planHTML());
 // Fuerza contenido si B2.19 dejó una sección vacía.
 if(!$('operaciones').querySelector('.b223-kpis'))$('operaciones').innerHTML=operationsHTML();
 if(!$('planificacion').querySelector('.b223-kpis'))$('planificacion').innerHTML=planHTML();
 const active=document.querySelector('.tabs button.active')?.dataset.tab;
 if(active==='operaciones')renderOps();else if(active==='planificacion')renderPlan();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(mount,1400),{once:true});else setTimeout(mount,1400);
})();
