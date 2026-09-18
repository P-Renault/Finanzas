/* FINANZAS B2.27 — IA FINANCIERA
   Frontend only: reads current Supabase data and sends a normalized snapshot
   to the Supabase Edge Function `ia-financiera`.
   IMPORTANT: the OpenAI API key is NEVER placed in this browser file.
*/
(()=>{'use strict';
const $=id=>document.getElementById(id);
const money=n=>new Intl.NumberFormat('es-CL',{style:'currency',currency:'CLP',maximumFractionDigits:0}).format(Number(n)||0);
const today=()=>{const d=new Date();return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,10)};
let client=null;
function db(){if(client)return client;const u=localStorage.getItem('sf_url'),k=localStorage.getItem('sf_key');if(u&&k&&window.supabase)client=window.supabase.createClient(u,k,{auth:{persistSession:false,autoRefreshToken:false}});return client}
function styles(){if($('b227Styles'))return;const s=document.createElement('style');s.id='b227Styles';s.textContent=`
.b227-wrap{display:grid;gap:12px}.b227-hero{border:1px solid #dbe2ea;border-radius:16px;padding:16px;background:linear-gradient(135deg,#f8fafc,#fff)}.b227-badge{font-size:11px;font-weight:800;letter-spacing:.06em;color:#475569}.b227-hero h2{margin:5px 0}.b227-kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:9px}.b227-kpi{border:1px solid #e2e8f0;border-radius:12px;padding:12px;background:#fff}.b227-kpi span{display:block;color:#64748b;font-size:11px}.b227-kpi strong{display:block;margin-top:5px;font-size:19px}.b227-chat{display:grid;grid-template-columns:1fr auto;gap:8px}.b227-chat textarea{min-height:72px;resize:vertical}.b227-answer{white-space:pre-wrap;line-height:1.5;padding:14px;border-radius:12px;background:#f8fafc;border:1px solid #e2e8f0}.b227-note{font-size:11px;color:#64748b}.b227-actions{display:flex;gap:8px;flex-wrap:wrap}@media(max-width:700px){.b227-kpis{grid-template-columns:1fr 1fr}.b227-chat{grid-template-columns:1fr}}
`;document.head.appendChild(s)}
function mount(){
 const app=$('app'); if(!app)return;
 let sec=$('ia-financiera');
 if(!sec){sec=document.createElement('section');sec.id='ia-financiera';sec.className='tab hidden';app.appendChild(sec)}
 sec.innerHTML=`<div class="b227-wrap">
 <div class="b227-hero"><span class="b227-badge">B2.27 · INTELIGENCIA FINANCIERA</span><h2>IA Financiera</h2><p class="muted">Interpreta tus datos reales de Supabase. No modifica movimientos ni ejecuta pagos.</p>
 <div class="b227-kpis"><div class="b227-kpi"><span>Liquidez</span><strong id="b227Liq">$0</strong></div><div class="b227-kpi"><span>Ingresos futuros</span><strong id="b227In">$0</strong></div><div class="b227-kpi"><span>Obligaciones</span><strong id="b227Out">$0</strong></div><div class="b227-kpi"><span>Deuda estructurada</span><strong id="b227Debt">$0</strong></div></div></div>
 <div class="card"><h3>Consulta financiera</h3><div class="b227-chat"><textarea id="b227Question" placeholder="Ej.: ¿Cuál es mi situación financiera y qué debo cubrir primero según las fechas?"></textarea><button id="b227Ask">Analizar</button></div><div class="b227-actions" style="margin-top:8px"><button class="secondary" data-q="Resume mi situación financiera actual con cifras y fechas.">Diagnóstico actual</button><button class="secondary" data-q="Calcula qué debo cubrir durante los próximos 30 días y explica el flujo.">Próximos 30 días</button><button class="secondary" data-q="Compara mis ingresos futuros con mis obligaciones y señala los puntos de tensión.">Flujo futuro</button></div><div id="b227Answer" class="b227-answer" style="margin-top:12px">La IA estará disponible cuando la Edge Function esté desplegada.</div><p class="b227-note">La IA analiza; la ejecución financiera seguirá requiriendo una acción explícita.</p></div>
 </div>`;
}
async function snapshot(){
 const c=db(); if(!c)throw new Error('Supabase no está conectado.');
 const t=today(),end=new Date(t+'T12:00:00');end.setDate(end.getDate()+30);const e=end.toISOString().slice(0,10);
 const [cl,banks,mov,com,debt]=await Promise.all([
  c.from('cierres_financieros').select('saldo_efectivo_actual,fecha_corte').eq('activo',true).order('fecha_corte',{ascending:false}).limit(1).maybeSingle(),
  c.from('cuentas_bancarias').select('id,nombre_banco,nombre_cuenta,saldo_actual,activa').eq('activa',true),
  c.from('movimientos').select('id,tipo,fecha,monto,categoria,descripcion,naturaleza,medio_pago').lte('fecha',e).order('fecha',{ascending:false}).limit(500),
  c.from('compromisos').select('concepto,fecha_vencimiento,monto,categoria,estado').eq('estado','pendiente').lte('fecha_vencimiento',e).order('fecha_vencimiento'),
  c.from('v_deudas_resumen').select('id,acreedor,saldo_actual,proximo_vencimiento,estado').order('proximo_vencimiento').limit(100)
 ]);
 for(const r of [cl,banks,mov,com,debt])if(r.error)throw r.error;
 const liquidity=Number(cl.data?.saldo_efectivo_actual||0)+(banks.data||[]).reduce((s,x)=>s+Number(x.saldo_actual||0),0);
 const real=(mov.data||[]).filter(x=>x.fecha<=t);
 const income=real.filter(x=>x.tipo==='ingreso').reduce((s,x)=>s+Number(x.monto||0),0);
 const expense=real.filter(x=>x.tipo==='gasto').reduce((s,x)=>s+Number(x.monto||0),0);
 const future=(mov.data||[]).filter(x=>x.fecha>t);
 return {as_of:t,liquidity,month:{income,expense},accounts:banks.data||[],future_movements:future,commitments:com.data||[],debts:debt.data||[]};
}
async function ask(question){
 const box=$('b227Answer'),c=db();box.textContent='Consultando IA…';
 try{
  const data=await snapshot();
  $('b227Liq').textContent=money(data.liquidity);
  $('b227In').textContent=money(data.future_movements.filter(x=>x.tipo==='ingreso').reduce((s,x)=>s+Number(x.monto||0),0));
  $('b227Out').textContent=money(data.commitments.reduce((s,x)=>s+Number(x.monto||0),0));
  $('b227Debt').textContent=money(data.debts.reduce((s,x)=>s+Number(x.saldo_actual||0),0));
  const u=localStorage.getItem('sf_url'); if(!u)throw new Error('Falta configuración Supabase.');
  const {data:r,error}=await c.functions.invoke('ia-financiera',{body:{question,snapshot:data}});
  if(error)throw error;
  box.textContent=r?.answer||'La IA no devolvió una respuesta.';
 }catch(e){box.textContent='No se pudo consultar la IA: '+(e.message||e)}
}
function init(){
 styles();mount();
 const t=document.querySelector('.tabs');if(!t)return;
 let b=t.querySelector('[data-tab="ia-financiera"]');
 if(!b){b=document.createElement('button');b.type='button';b.dataset.tab='ia-financiera';b.textContent='IA Financiera';t.appendChild(b)}
 b.onclick=()=>{document.querySelectorAll('.tabs button').forEach(x=>x.classList.remove('active'));b.classList.add('active');document.querySelectorAll('.tab').forEach(x=>x.classList.add('hidden'));$('ia-financiera').classList.remove('hidden');snapshot().then(x=>{$('b227Liq').textContent=money(x.liquidity);$('b227In').textContent=money(x.future_movements.filter(a=>a.tipo==='ingreso').reduce((s,a)=>s+Number(a.monto||0),0));$('b227Out').textContent=money(x.commitments.reduce((s,a)=>s+Number(a.monto||0),0));$('b227Debt').textContent=money(x.debts.reduce((s,a)=>s+Number(a.saldo_actual||0),0))}).catch(()=>{})};
 $('b227Ask').onclick=()=>ask($('b227Question').value.trim()||'Resume mi situación financiera actual.');
 document.querySelectorAll('[data-q]').forEach(x=>x.onclick=()=>{$('b227Question').value=x.dataset.q;ask(x.dataset.q)});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(init,1200),{once:true});else setTimeout(init,1200);
})();