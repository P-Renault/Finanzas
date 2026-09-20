/* B232.32 — Planificación integrada robusta: carga + escenario + componentes */
(()=>{'use strict';
if(window.__B23232_PLAN__)return; window.__B23232_PLAN__=true;
const $=id=>document.getElementById(id);
const money=n=>new Intl.NumberFormat('es-CL',{style:'currency',currency:'CLP',maximumFractionDigits:0}).format(Number(n)||0);
const today=()=>{const d=new Date();return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,10)};
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
function client(){if(window.__B23224_CLIENT__)return window.__B23224_CLIENT__;const u=localStorage.getItem('sf_url'),k=localStorage.getItem('sf_key');if(!u||!k||!window.supabase)return null;try{return window.__B23224_CLIENT__=window.supabase.createClient(u,k,{auth:{persistSession:false,autoRefreshToken:false}})}catch(e){console.error(e);return null}}
async function read(p,fb=[]){try{const r=await p;if(r.error){console.warn('[B232.24]',r.error.message);return fb}return r.data??fb}catch(e){console.warn('[B232.24]',e);return fb}}
function styles(){if($('b23224Style'))return;const s=document.createElement('style');s.id='b23224Style';s.textContent='.b23224-kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:12px 0}.b23224-kpi{padding:14px;border:1px solid #e5e7eb;border-radius:12px;background:#fff}.b23224-kpi span,.b23224-kpi small{display:block;color:#64748b;font-size:11px}.b23224-kpi strong{display:block;font-size:20px;margin-top:5px}.b23224-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.b23224-row{display:flex;justify-content:space-between;gap:10px;padding:9px 0;border-bottom:1px solid #edf2f7}.b23224-row small{display:block;color:#64748b}.b23224-positive{color:#166534}.b23224-negative{color:#991b1b}.b23224-status{padding:10px;border-radius:10px;background:#f8fafc}@media(max-width:760px){.b23224-kpis{grid-template-columns:1fr 1fr}.b23224-grid{grid-template-columns:1fr}}';document.head.appendChild(s)}
function tabs(){const t=document.querySelector('.tabs');if(!t)return null;const add=(id,label)=>{let b=t.querySelector(`[data-tab="${id}"]`);if(!b){b=document.createElement('button');b.type='button';b.dataset.tab=id;b.textContent=label;t.appendChild(b)}return b};add('operaciones','Operaciones');add('planificacion','Planificación');add('ingresos','Motor Multifuente');add('jornadas','Control de Jornada');return t}
function section(id,html){const app=$('app');if(!app)return null;let s=$(id);if(!s){s=document.createElement('section');s.id=id;s.className='tab hidden';s.innerHTML=html;app.appendChild(s)}return s}
function navigate(id){const s=$(id);if(!s)return;document.querySelectorAll('.tab').forEach(x=>x.classList.toggle('hidden',x.id!==id));document.querySelectorAll('.tabs button[data-tab]').forEach(b=>b.classList.toggle('active',b.dataset.tab===id));localStorage.setItem('cf_active_tab_v2',id);if(id==='operaciones')renderOps();if(id==='planificacion')renderPlan();if(id==='ingresos')renderIncome();if(id==='jornadas')renderJornadas();if(id==='calendario')forceCalendar()}
function installNavigation(){tabs();window.b219Show=navigate;}
function buildSections(){
section('ingresos',`<div class="card"><h2>Motor Multifuente</h2><p class="muted">Generación, cobro y seguimiento de ingresos por fuente.</p><div class="b23224-kpis"><div class="b23224-kpi"><span>Generado neto</span><strong id="f24Generated">$0</strong></div><div class="b23224-kpi"><span>Cobrado</span><strong id="f24Collected">$0</strong></div><div class="b23224-kpi"><span>Pendiente</span><strong id="f24Pending">$0</strong></div><div class="b23224-kpi"><span>Fuentes activas</span><strong id="f24Sources">0</strong></div></div></div><div class="card"><h3>Registrar generación de ingreso</h3><form id="f24IncomeForm" class="grid2"><label>Fuente<select id="f24Source"></select></label><label>Actividad<input id="f24Activity" required></label><label>Fecha<input id="f24Date" type="date" required></label><label>Monto bruto<input id="f24Gross" type="number" min="0" value="0"></label><label>Costos<input id="f24Cost" type="number" min="0" value="0"></label><label>Comisiones<input id="f24Comm" type="number" min="0" value="0"></label><label>Estado<select id="f24State"><option value="pendiente">Pendiente</option><option value="cobrado">Cobrado</option></select></label><label>Cliente<input id="f24Client"></label><label class="full">Notas<input id="f24Notes"></label><button class="full" type="submit">Registrar generación</button></form><p id="f24IncomeMsg" class="status"></p></div><div class="card"><h3>Últimas generaciones</h3><div id="f24IncomeList"></div></div>`);
section('jornadas',`<div class="card"><h2>Planificador de Jornada</h2><p class="muted">Planifica una jornada de Uber/inDrive y registra el resultado financiero.</p><div class="b23224-kpis"><div class="b23224-kpi"><span>Meta neta</span><strong id="f24JTarget">$0</strong></div><div class="b23224-kpi"><span>Neto integrado</span><strong id="f24JNet">$0</strong></div><div class="b23224-kpi"><span>Jornadas integradas</span><strong id="f24JCount">0</strong></div><div class="b23224-kpi"><span>Brecha</span><strong id="f24JGap">$0</strong></div></div></div><div class="card"><h3>Planificar jornada</h3><form id="f24JForm" class="grid2"><label>Fecha<input id="f24JDate" type="date" required></label><label>Meta neta<input id="f24JTargetInput" type="number" min="0" value="60000" required></label><label>Horas<input id="f24JHours" type="number" min="0" step=".5" value="8"></label><label>Km<input id="f24JKm" type="number" min="0" value="0"></label><label>Bruto estimado<input id="f24JGross" type="number" min="0" value="0"></label><label>Costos estimados<input id="f24JCost" type="number" min="0" value="0"></label><label class="full">Notas<input id="f24JNotes"></label><button class="full" type="submit">Guardar planificación</button></form><p id="f24JMsg" class="status"></p></div><div class="card"><h3>Resultados integrados</h3><div id="f24JList"></div></div>`);
section('operaciones',`<div class="card"><h2>Operaciones</h2><p class="muted">Liquidez, cuentas, ingresos futuros y obligaciones.</p><div class="b23224-kpis"><div class="b23224-kpi"><span>Liquidez real</span><strong id="f24Liq">$0</strong></div><div class="b23224-kpi"><span>Ingresos futuros</span><strong id="f24Future">$0</strong></div><div class="b23224-kpi"><span>Obligaciones</span><strong id="f24Oblig">$0</strong></div><div class="b23224-kpi"><span>Proyección</span><strong id="f24Proj">$0</strong></div></div><div id="f24OpsStatus" class="b23224-status">Calculando...</div></div><div class="b23224-grid"><div class="card"><h3>Cuentas</h3><div id="f24Accounts"></div></div><div class="card"><h3>Próximas obligaciones</h3><div id="f24ObligList"></div></div></div><div class="card"><button id="f24OpsRefresh" type="button">Actualizar Operaciones</button></div>`);
section('planificacion',`<div id="b216Content"></div>`)}
window.B23232Planificacion={
  version:'232.32',
  mount:()=>{try{styles();buildSections();return !!$('planificacion')}catch(e){console.error('[B232.32] mount',e);return false}},
  render:()=>renderPlan()
};

async function renderOps(){const c=client();if(!c)return;const [close,banks,mov,inc,exp,comm,quota]=await Promise.all([read(c.from('cierres_financieros').select('*').eq('activo',true).order('fecha_corte',{ascending:false}).limit(1)),read(c.from('cuentas_bancarias').select('*').eq('activa',true)),read(c.from('movimientos').select('tipo,monto,fecha')),read(c.from('ingresos_futuros').select('*').gte('fecha',today())),read(c.from('gastos_planificados').select('*').gte('fecha',today())),read(c.from('compromisos').select('*').eq('estado','pendiente').order('fecha_vencimiento')),read(c.from('cuotas_deuda').select('*').in('estado',['pendiente','vencida']).gte('fecha_vencimiento',today()).order('fecha_vencimiento'))]);let liquidity=Number(close[0]?.saldo_efectivo_actual||0)+banks.reduce((s,x)=>s+Number(x.saldo_actual||0),0);if(!liquidity)liquidity=mov.reduce((s,x)=>s+(x.tipo==='ingreso'?Number(x.monto):-Number(x.monto)),0);const futureIn=inc.reduce((s,x)=>s+Number(x.monto||0),0),oblig=exp.reduce((s,x)=>s+Number(x.monto||0),0)+comm.reduce((s,x)=>s+Number(x.monto||0),0)+quota.reduce((s,x)=>s+Number(x.monto||0),0);$('f24Liq').textContent=money(liquidity);$('f24Future').textContent=money(futureIn);$('f24Oblig').textContent=money(oblig);$('f24Proj').textContent=money(liquidity+futureIn-oblig);$('f24Accounts').innerHTML=banks.map(x=>`<div class="b23224-row"><span>${esc(x.nombre_banco||'Banco')}<small>${esc(x.nombre_cuenta||'Cuenta')}</small></span><strong>${money(x.saldo_actual)}</strong></div>`).join('')||'<p class="muted">Sin cuentas activas.</p>';const rows=[...comm.map(x=>({date:x.fecha_vencimiento,name:x.concepto||'Compromiso',amount:x.monto})),...quota.map(x=>({date:x.fecha_vencimiento,name:'Cuota de deuda',amount:x.monto}))].sort((a,b)=>String(a.date).localeCompare(String(b.date)));$('f24ObligList').innerHTML=rows.slice(0,15).map(x=>`<div class="b23224-row"><span>${esc(x.name)}<small>${esc(x.date||'')}</small></span><strong>${money(x.amount)}</strong></div>`).join('')||'<p class="muted">Sin obligaciones próximas.</p>';$('f24OpsStatus').textContent=`Actualizado: liquidez ${money(liquidity)}, ingresos futuros ${money(futureIn)}, obligaciones ${money(oblig)}.`}
async function renderIncome(){const c=client();if(!c)return;const [sources,g]=await Promise.all([read(c.from('fuentes_ingreso').select('*').eq('activa',true).order('nombre')),read(c.from('generacion_ingresos').select('*').order('fecha_generacion',{ascending:false}).limit(100))]);$('f24Sources').textContent=sources.length;$('f24Source').innerHTML=sources.map(x=>`<option value="${x.id}">${esc(x.nombre)}</option>`).join('');const generated=g.filter(x=>x.estado_cobro!=='cancelado').reduce((s,x)=>s+Number(x.monto_neto||0),0),collected=g.filter(x=>x.estado_cobro==='cobrado').reduce((s,x)=>s+Number(x.monto_neto||0),0);$('f24Generated').textContent=money(generated);$('f24Collected').textContent=money(collected);$('f24Pending').textContent=money(generated-collected);$('f24IncomeList').innerHTML=g.map(x=>`<div class="b23224-row"><span>${esc(x.actividad||x.descripcion||'Generación')}<small>${esc(x.fecha_generacion||'')} · ${esc(x.estado_cobro||'')}</small></span><strong>${money(x.monto_neto)}</strong></div>`).join('')||'<p class="muted">Sin generaciones registradas.</p>'}
async function renderJornadas(){const c=client();if(!c)return;const [src,rows]=await Promise.all([read(c.from('fuentes_ingreso').select('id').eq('nombre','Uber / inDrive').limit(1)),read(c.from('generacion_ingresos').select('*').order('fecha_generacion',{ascending:false}).limit(100))]);const uber=src[0]?.id,own=uber?rows.filter(x=>String(x.fuente_id)===String(uber)):[],net=own.reduce((s,x)=>s+Number(x.monto_neto||0),0),target=60000;$('f24JTarget').textContent=money(target);$('f24JNet').textContent=money(net);$('f24JCount').textContent=String(own.length);$('f24JGap').textContent=money(Math.max(0,target-net));$('f24JList').innerHTML=own.map(x=>`<div class="b23224-row"><span>${esc(x.fecha_generacion||'')} · ${esc(x.actividad||'Jornada')}<small>${esc(x.descripcion||'')}</small></span><strong>${money(x.monto_neto)}</strong></div>`).join('')||'<p class="muted">Sin resultados integrados.</p>'}
async function renderPlan(){
 const c=client();if(!c)return;
 let box=$('b216Content');
 if(!box){try{buildSections();}catch(e){console.error('[B232.32] buildSections',e)};box=$('b216Content');}
 if(!box){console.error('[B232.32] Contenedor de Planificación no disponible');return;}
 const horizon=30;
 const addDays=(base,n)=>{const d=new Date(base+'T12:00:00');d.setDate(d.getDate()+n);return d.toISOString().slice(0,10)};
 const end=addDays(today(),horizon-1);
 const [close,banks,inc,exp,comm,quota]=await Promise.all([
  read(c.from('cierres_financieros').select('saldo_efectivo_actual').eq('activo',true).order('fecha_corte',{ascending:false}).limit(1)),
  read(c.from('cuentas_bancarias').select('saldo_actual').eq('activa',true)),
  read(c.from('ingresos_futuros').select('monto,fecha,concepto').gte('fecha',today()).lte('fecha',end)),
  read(c.from('gastos_planificados').select('monto,fecha,concepto,categoria').gte('fecha',today()).lte('fecha',end)),
  read(c.from('compromisos').select('monto,fecha_vencimiento,concepto,categoria,estado').eq('estado','pendiente').gte('fecha_vencimiento',today()).lte('fecha_vencimiento',end)),
  read(c.from('cuotas_deuda').select('id,monto,fecha_vencimiento,numero_cuota,estado').in('estado',['pendiente','vencida']).gte('fecha_vencimiento',today()).lte('fecha_vencimiento',end))
 ]);
 const liquidity=Number(close[0]?.saldo_efectivo_actual||0)+banks.reduce((s,x)=>s+Number(x.saldo_actual||0),0);
 const income=inc.reduce((s,x)=>s+Number(x.monto||0),0);
 const plannedOut=exp.reduce((s,x)=>s+Number(x.monto||0),0);
 const commitmentOut=comm.reduce((s,x)=>s+Number(x.monto||0),0);
 const debtOut=quota.reduce((s,x)=>s+Number(x.monto||0),0);
 const out=plannedOut+commitmentOut+debtOut;
 const projected=liquidity+income-out;
 const days={};
 for(let i=0;i<horizon;i++)days[addDays(today(),i)]={in:0,out:0};
 inc.forEach(x=>{if(days[x.fecha])days[x.fecha].in+=Number(x.monto||0)});
 exp.forEach(x=>{if(days[x.fecha])days[x.fecha].out+=Number(x.monto||0)});
 comm.forEach(x=>{if(days[x.fecha_vencimiento])days[x.fecha_vencimiento].out+=Number(x.monto||0)});
 quota.forEach(x=>{if(days[x.fecha_vencimiento])days[x.fecha_vencimiento].out+=Number(x.monto||0)});
 let balance=liquidity,minBalance=liquidity,minDate=today(),maxDeficit=0,maxDeficitDate='—';
 Object.keys(days).sort().forEach(date=>{balance+=days[date].in-days[date].out;if(balance<minBalance) {minBalance=balance;minDate=date}if(balance<0&&Math.abs(balance)>maxDeficit){maxDeficit=Math.abs(balance);maxDeficitDate=date}});
 const dailyReference=maxDeficit?Math.ceil(maxDeficit/horizon):0;
 const fmtDate=d=>d&&d!=='—'?new Intl.DateTimeFormat('es-CL',{day:'2-digit',month:'2-digit',year:'numeric'}).format(new Date(d+'T12:00:00')):'—';
 box.innerHTML=`
 <div class="card">
  <div class="section-title"><div><span class="muted">B232.31 · MODELO DE FLUJO</span><h2>Planificación financiera</h2><p class="muted">Escenario de ${horizon} días basado en liquidez real, ingresos futuros, gastos planificados, compromisos y cuotas de deuda.</p></div><button type="button" id="f24PlanRefresh">Actualizar Planificación</button></div>
  <div class="b23224-kpis">
   <div class="b23224-kpi"><span>Liquidez real</span><strong>${money(liquidity)}</strong><small>Disponible hoy</small></div>
   <div class="b23224-kpi"><span>Ingresos futuros</span><strong>${money(income)}</strong><small>${inc.length} registros · próximos ${horizon} días</small></div>
   <div class="b23224-kpi"><span>Obligaciones</span><strong>${money(out)}</strong><small>Planificados + compromisos + deuda</small></div>
   <div class="b23224-kpi"><span>Saldo proyectado</span><strong class="${projected>=0?'b23224-positive':'b23224-negative'}">${money(projected)}</strong><small>Al término del escenario</small></div>
  </div>
 </div>
 <div class="b23224-grid">
  <div class="card">
   <h2>Escenario</h2>
   <div class="b23224-row"><span>Fecha del mínimo<small>Punto más bajo proyectado</small></span><strong>${fmtDate(minDate)}</strong></div>
   <div class="b23224-row"><span>Déficit máximo<small>Máxima exposición bajo $0</small></span><strong class="${maxDeficit?'b23224-negative':''}">${money(maxDeficit)}</strong></div>
   <div class="b23224-row"><span>Referencia diaria si existe déficit<small>Déficit máximo ÷ ${horizon} días</small></span><strong>${money(dailyReference)}</strong></div>
   <div class="b23224-row"><span>Saldo mínimo proyectado<small>Después de ingresos y egresos programados</small></span><strong class="${minBalance>=0?'b23224-positive':'b23224-negative'}">${money(minBalance)}</strong></div>
  </div>
  <div class="card">
   <h2>Componentes</h2>
   <div class="b23224-row"><span>Ingresos programados<small>${inc.length} registro${inc.length===1?'':'s'}</small></span><strong>${money(income)}</strong></div>
   <div class="b23224-row"><span>Compromisos<small>${comm.length} registro${comm.length===1?'':'s'}</small></span><strong>${money(commitmentOut)}</strong></div>
   <div class="b23224-row"><span>Cuotas de deuda<small>${quota.length} cuota${quota.length===1?'':'s'}</small></span><strong>${money(debtOut)}</strong></div>
   <div class="b23224-row"><span>Gastos planificados<small>${exp.length} registro${exp.length===1?'':'s'}</small></span><strong>${money(plannedOut)}</strong></div>
  </div>
 </div>
 <div class="card"><h3>Lectura del escenario</h3><div class="b23224-status">${projected<0?`El escenario termina con un saldo proyectado negativo de ${money(Math.abs(projected))}. El mayor déficit se alcanza el ${maxDeficitDate==='—'?'no determinado':fmtDate(maxDeficitDate)}.`:`Con los registros actuales, el escenario termina con ${money(projected)} y su saldo mínimo proyectado es ${money(minBalance)}.`}</div></div>`;
 $('f24PlanRefresh').onclick=renderPlan;
}
function installForms(){$('f24IncomeForm')?.addEventListener('submit',async e=>{e.preventDefault();const c=client();if(!c)return;const state=$('f24State').value,p={fuente_id:Number($('f24Source').value),actividad:$('f24Activity').value.trim(),fecha_generacion:$('f24Date').value,monto_bruto:Number($('f24Gross').value)||0,costos:Number($('f24Cost').value)||0,comisiones:Number($('f24Comm').value)||0,estado_cobro:state,cliente:$('f24Client').value.trim()||null,fecha_cobro:state==='cobrado'?today():null,notas:$('f24Notes').value.trim()||null},r=await c.from('generacion_ingresos').insert(p);$('f24IncomeMsg').textContent=r.error?r.error.message:'Generación registrada correctamente.';if(!r.error)await renderIncome()});$('f24JForm')?.addEventListener('submit',async e=>{e.preventDefault();const c=client();if(!c)return;const source=await read(c.from('fuentes_ingreso').select('id').eq('nombre','Uber / inDrive').limit(1));if(!source[0]){$('f24JMsg').textContent='No existe la fuente Uber / inDrive en fuentes_ingreso.';return}const gross=Number($('f24JGross').value)||0,cost=Number($('f24JCost').value)||0,target=Number($('f24JTargetInput').value)||0,r=await c.from('generacion_ingresos').insert({fuente_id:source[0].id,actividad:'Planificador de Jornada',descripcion:`Meta neta ${target} · ${$('f24JHours').value||0} h · ${$('f24JKm').value||0} km`,fecha_generacion:$('f24JDate').value,monto_bruto:gross||target+cost,costos:cost,comisiones:0,estado_cobro:'pendiente',notas:$('f24JNotes').value.trim()||null});$('f24JMsg').textContent=r.error?r.error.message:'Planificación de jornada registrada.';if(!r.error)await renderJornadas()});$('f24OpsRefresh')?.addEventListener('click',renderOps)}
function forceCalendar(){if(window.B232Calendario?.load)setTimeout(()=>window.B232Calendario.load().catch(console.error),0)}
async function boot(){styles();buildSections();installNavigation();installForms();if($('f24Date'))$('f24Date').value=today();if($('f24JDate'))$('f24JDate').value=today();const t=document.querySelector('.tabs');if(t)['dashboard','movimientos','futuros','calendario','ahorro','deudas','cuentas','operaciones','planificacion','ingresos','jornadas'].forEach(id=>{const b=t.querySelector(`[data-tab="${id}"]`);if(b)t.appendChild(b)});setTimeout(()=>{const active=localStorage.getItem('cf_active_tab_v2');if(active==='operaciones')renderOps();if(active==='planificacion')renderPlan();if(active==='ingresos')renderIncome();if(active==='jornadas')renderJornadas()},900);const saved=localStorage.getItem('cf_active_tab_v2');if(saved&&$(saved))setTimeout(()=>navigate(saved),1100)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,700),{once:true});else setTimeout(boot,700);
window.B23224={version:'232.24',navigate};
})();
/* ============================================================
   B232.26 — CALENDARIO INTEGRAL / CIERRE P2.1
   ÚNICO MOTOR VISUAL DEL CALENDARIO
   ============================================================ */
(() => {
  'use strict';
  const VERSION='232.29';
  if(window.__B23226_CALENDAR__) return;
  window.__B23226_CALENDAR__=true;

  const $=id=>document.getElementById(id);
  const n=v=>Number(v)||0;
  const money=v=>new Intl.NumberFormat('es-CL',{style:'currency',currency:'CLP',maximumFractionDigits:0}).format(n(v));
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const today=()=>{const d=new Date();return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,10)};
  const date=(x,...keys)=>{for(const k of keys){if(x?.[k])return String(x[k]).slice(0,10)}return ''};
  const isIn=x=>['ingreso','income'].includes(String(x?.tipo||'').toLowerCase());
  const isOut=x=>['gasto','egreso','expense'].includes(String(x?.tipo||'').toLowerCase());
  const isPaid=x=>['pagada','pagado','cancelada','cancelado','pago','paid','cobrado'].includes(String(x?.estado||x?.estado_cobro||'').toLowerCase());

  let db=null;
  let month=new Date(new Date().getFullYear(),new Date().getMonth(),1);
  let selected=today();
  let summaryMode='month';
  let DATA={mov:[],futureIn:[],plannedOut:[],commitments:[],quotas:[],generation:[],accounts:[],close:null,errors:[]};

  function client(){
    if(db)return db;
    const u=localStorage.getItem('sf_url'),k=localStorage.getItem('sf_key');
    if(!u||!k||!window.supabase)return null;
    try{db=window.supabase.createClient(u,k,{auth:{persistSession:false,autoRefreshToken:false}});return db}
    catch(e){console.error('[B232.26]',e);return null}
  }

  async function q(label,p){
    try{
      const r=await p;
      if(r?.error){DATA.errors.push(label+': '+r.error.message);return []}
      return r?.data||[];
    }catch(e){DATA.errors.push(label+': '+(e?.message||e));return []}
  }

  function css(){
    if($('b23226Style'))return;
    const s=document.createElement('style');s.id='b23226Style';s.textContent=`
      .b23226-card{background:#fff;border:1px solid #e5e7eb;border-radius:14px;padding:14px;box-shadow:0 2px 8px rgba(15,23,42,.05)}
      .b23226-head{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap}.b23226-head h2{margin:2px 0;font-size:20px}.b23226-sub{font-size:11px;color:#64748b}.b23226-actions{display:flex;gap:6px;flex-wrap:wrap}.b23226-actions button{border:0;border-radius:8px;padding:8px 11px;background:#111827;color:#fff;font-weight:700;cursor:pointer}.b23226-actions button.secondary{background:#e5e7eb;color:#111827}
      .b23226-status{margin:8px 0;padding:7px 9px;border-radius:8px;background:#f8fafc;color:#475569;font-size:11px}.b23226-status.ok{background:#ecfdf5;color:#166534}.b23226-status.warn{background:#fff7ed;color:#9a3412}
      .b23226-summary{margin:10px 0;padding:10px;border:1px solid #e5e7eb;border-radius:12px;background:#f8fafc}.b23226-summary-head{display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:7px}.b23226-summary-head strong{display:block;font-size:13px}.b23226-summary-head small{display:block;margin-top:2px;color:#64748b;font-size:10px}.b23226-summary-head button{border:0;border-radius:8px;padding:7px 10px;background:#e5e7eb;color:#111827;font-weight:700;cursor:pointer}
      .b23226-kpis{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:8px;margin:10px 0}.b23226-kpi{border:1px solid #e5e7eb;border-radius:10px;padding:9px;background:#fff}.b23226-kpi span,.b23226-kpi small{display:block;color:#64748b;font-size:10px}.b23226-kpi strong{display:block;margin-top:3px;font-size:16px}
      .b23226-scroll{overflow:auto;border:1px solid #e5e7eb;border-radius:11px}.b23226-grid{display:grid;grid-template-columns:repeat(7,minmax(110px,1fr));min-width:770px}.b23226-week>div{padding:7px;text-align:center;background:#111827;color:#fff;font-size:10px;font-weight:800}.b23226-day{min-height:142px;padding:6px;border:0;border-right:1px solid #e5e7eb;border-bottom:1px solid #e5e7eb;background:#fff;text-align:left;cursor:pointer}.b23226-day.out{background:#f8fafc;color:#94a3b8}.b23226-day.selected{outline:2px solid #111827;outline-offset:-2px}.b23226-day-top{display:flex;justify-content:space-between;align-items:center;font-size:11px}.b23226-day-top small{font-size:8px}.b23226-event{display:block;margin-top:3px;padding:3px 4px;border-radius:5px;font-size:8px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.b23226-real-in{background:#ecfdf5;color:#166534}.b23226-real-out{background:#fef2f2;color:#991b1b}.b23226-plan-in{background:#eff6ff;color:#1d4ed8}.b23226-plan-out{background:#fff7ed;color:#9a3412}.b23226-gen{background:#f5f3ff;color:#6d28d9}.b23226-debt{background:#eef2ff;color:#3730a3}.b23226-more,.b23226-mini{display:block;color:#64748b;font-size:8px;margin-top:3px}.b23226-pos{color:#166534}.b23226-neg{color:#991b1b}
      .b23226-detail{margin-top:12px;display:grid;grid-template-columns:1fr 1fr;gap:10px}.b23226-box{border:1px solid #e5e7eb;border-radius:11px;padding:11px}.b23226-box h3{font-size:12px;margin:0 0 7px}.b23226-row{display:flex;justify-content:space-between;gap:8px;padding:7px 0;border-bottom:1px solid #f1f5f9;font-size:11px}.b23226-row:last-child{border-bottom:0}.b23226-row small{display:block;color:#64748b;font-size:9px}.b23226-foot{margin-top:10px;font-size:10px;color:#64748b}
      @media(max-width:760px){.b23226-kpis{grid-template-columns:repeat(2,minmax(0,1fr))}.b23226-detail{grid-template-columns:1fr}.b23226-card{padding:10px}}
    `;document.head.appendChild(s);
  }

  async function load(){
    const c=client();
    if(!c){renderError('Supabase no está conectado.');return}
    DATA.errors=[];
    const closeP=c.from('cierres_financieros').select('*').eq('activo',true).order('fecha_corte',{ascending:false}).limit(1);
    const accountsP=c.from('cuentas_bancarias').select('*').eq('activa',true);
    const [mov,futureIn,plannedOut,commitments,quotas,generation,accounts,close]=await Promise.all([
      q('movimientos',c.from('movimientos').select('*').order('fecha',{ascending:true})),
      q('ingresos_futuros',c.from('ingresos_futuros').select('*').order('fecha',{ascending:true})),
      q('gastos_planificados',c.from('gastos_planificados').select('*').order('fecha',{ascending:true})),
      q('compromisos',c.from('compromisos').select('*').order('fecha_vencimiento',{ascending:true})),
      q('cuotas_deuda',c.from('cuotas_deuda').select('*').order('fecha_vencimiento',{ascending:true})),
      q('generacion_ingresos',c.from('generacion_ingresos').select('*').order('fecha_generacion',{ascending:true})),
      q('cuentas_bancarias',accountsP),
      q('cierres_financieros',closeP)
    ]);
    DATA={mov,futureIn,plannedOut,commitments,quotas,generation,accounts,close:close[0]||null,errors:DATA.errors};
    render();
  }

  function baseBalance(){
    const c=DATA.close;
    if(c && c.saldo_efectivo_actual!=null)return n(c.saldo_efectivo_actual);
    if(c && c.saldo_inicial!=null)return n(c.saldo_inicial);
    if(DATA.accounts.length)return DATA.accounts.reduce((s,x)=>s+n(x.saldo_actual),0);
    return 0;
  }

  function key(d){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}

  function monthRows(){
    const y=month.getFullYear(),m=month.getMonth(),last=new Date(y,m+1,0).getDate(),map={};
    for(let i=1;i<=last;i++){const k=key(new Date(y,m,i));map[k]={k,mov:[],inc:[],out:[],comm:[],quota:[],gen:[],realIn:0,realOut:0,planIn:0,planOut:0,commOut:0,debtOut:0,generated:0,collected:0,balance:0,flow:0,projected:0}}
    const put=(k,t,x)=>{if(map[k])map[k][t].push(x)};
    DATA.mov.forEach(x=>put(date(x,'fecha'),'mov',x));
    DATA.futureIn.forEach(x=>{const k=date(x,'fecha','fecha_vencimiento','fecha_cobro');if(k&&!isPaid(x))put(k,'inc',x)});
    DATA.plannedOut.forEach(x=>{const k=date(x,'fecha','fecha_vencimiento');if(k&&!isPaid(x))put(k,'out',x)});
    DATA.commitments.forEach(x=>{const k=date(x,'fecha_vencimiento','fecha');if(k&&!isPaid(x))put(k,'comm',x)});
    DATA.quotas.forEach(x=>{const k=date(x,'fecha_vencimiento');if(k)put(k,'quota',x)});
    DATA.generation.forEach(x=>{const st=String(x.estado_cobro||'').toLowerCase();if(st==='cancelado')return;const k=date(x,'fecha_cobro','fecha_generacion');if(k)put(k,'gen',x)});
    let bal=baseBalance();
    const first=`${y}-${String(m+1).padStart(2,'0')}-01`;
    for(const x of DATA.mov.filter(z=>date(z,'fecha')<first))bal+=isIn(x)?n(x.monto):isOut(x)?-n(x.monto):0;
    const out=[];
    for(const k of Object.keys(map).sort()){
      const r=map[k];
      r.realIn=r.mov.filter(isIn).reduce((s,x)=>s+n(x.monto),0);
      r.realOut=r.mov.filter(isOut).reduce((s,x)=>s+n(x.monto),0);
      r.planIn=r.inc.reduce((s,x)=>s+n(x.monto),0);
      r.planOut=r.out.reduce((s,x)=>s+n(x.monto),0);
      r.commOut=r.comm.reduce((s,x)=>s+n(x.monto),0);
      r.debtOut=r.quota.filter(x=>!isPaid(x)).reduce((s,x)=>s+n(x.monto),0);
      r.generated=r.gen.reduce((s,x)=>s+n(x.monto_neto),0);
      r.collected=r.gen.filter(x=>String(x.estado_cobro||'').toLowerCase()==='cobrado').reduce((s,x)=>s+n(x.monto_neto),0);
      bal+=r.realIn-r.realOut;r.balance=bal;
      r.flow=r.realIn+r.planIn+r.collected-r.realOut-r.planOut-r.commOut-r.debtOut;
      r.projected=bal+r.planIn+r.generated-r.planOut-r.commOut-r.debtOut;
      out.push(r);
    }
    return out;
  }

  function renderError(msg){const h=$('calendario');if(h)h.innerHTML=`<div class="b23226-card"><h2>Calendario 360°</h2><div class="b23226-status warn">${esc(msg)}</div></div>`}

  function render(){
    const host=$('calendario');if(!host)return;css();
    const rows=monthRows(),map=Object.fromEntries(rows.map(x=>[x.k,x])),y=month.getFullYear(),m=month.getMonth();
    const first=new Date(y,m,1),start=new Date(first);start.setDate(1-first.getDay());
    const days=Array.from({length:42},(_,i)=>{const d=new Date(start);d.setDate(start.getDate()+i);return d});
    const selectedRow=map[selected]||{k:selected,mov:[],inc:[],out:[],comm:[],quota:[],gen:[],realIn:0,realOut:0,planIn:0,planOut:0,commOut:0,debtOut:0,generated:0,collected:0,balance:baseBalance(),flow:0,projected:baseBalance()};
    const total=f=>rows.reduce((s,x)=>s+n(x[f]),0);
    const monthName=month.toLocaleDateString('es-CL',{month:'long',year:'numeric'}).replace(/^./,c=>c.toUpperCase());
    const selectedLabel=new Date(selected+'T12:00:00').toLocaleDateString('es-CL',{weekday:'long',day:'numeric',month:'long',year:'numeric'}).replace(/^./,c=>c.toUpperCase());
    const monthLast=rows[rows.length-1]||null;
    const monthSummary={
      title:`Resumen mensual · ${monthName}`,
      subtitle:'Resultado consolidado de la evaluación del mes seleccionado.',
      realIn:total('realIn'),
      planIn:total('planIn'),
      generated:total('generated'),
      collected:total('collected'),
      realOut:total('realOut'),
      obligations:total('planOut')+total('commOut')+total('debtOut'),
      flow:rows.reduce((s,x)=>s+n(x.flow),0),
      balance:monthLast?.balance??baseBalance(),
      projected:monthLast?.projected??baseBalance()
    };
    const daySummary={
      title:`Jornada · ${selectedLabel}`,
      subtitle:'Resultado consolidado de la evaluación de la jornada seleccionada.',
      realIn:selectedRow.realIn,
      planIn:selectedRow.planIn,
      generated:selectedRow.generated,
      collected:selectedRow.collected,
      realOut:selectedRow.realOut,
      obligations:selectedRow.planOut+selectedRow.commOut+selectedRow.debtOut,
      flow:selectedRow.flow,
      balance:selectedRow.balance,
      projected:selectedRow.projected
    };
    const summary=summaryMode==='day'?daySummary:monthSummary;
    const summaryToggle=summaryMode==='day'?'<button type="button" id="b23226MonthSummary" class="secondary">Resumen mensual</button>':'';
    host.innerHTML=`<div class="b23226-card">
      <div class="b23226-head"><div><div class="b23226-sub">B232.28 · CALENDARIO 360°</div><h2>${monthName}</h2><div class="b23226-sub">Real + proyectado + generación + compromisos + deuda + control de caja.</div></div><div class="b23226-actions"><button id="b23226Prev">‹</button><button id="b23226Today" class="secondary">Hoy</button><button id="b23226Next">›</button><button id="b23226Refresh">Actualizar</button></div></div>
      <div class="b23226-status ${DATA.errors.length?'warn':'ok'}">${DATA.errors.length?`Fuentes con advertencia: ${DATA.errors.length}. El calendario continúa con las fuentes disponibles.`:'Todas las fuentes disponibles fueron procesadas.'}</div>
      <div class="b23226-summary"><div class="b23226-summary-head"><div><strong>${esc(summary.title)}</strong><small>${esc(summary.subtitle)}</small></div>${summaryToggle}</div><div class="b23226-kpis"><div class="b23226-kpi"><span>Ingresos reales</span><strong>${money(summary.realIn)}</strong><small>movimientos</small></div><div class="b23226-kpi"><span>Ingresos proyectados</span><strong>${money(summary.planIn)}</strong><small>ingresos futuros</small></div><div class="b23226-kpi"><span>Generación neta</span><strong>${money(summary.generated)}</strong><small>${summaryMode==='day'?`cobrado ${money(summary.collected)}`:'multifuente'}</small></div><div class="b23226-kpi"><span>Egresos reales</span><strong>${money(summary.realOut)}</strong><small>movimientos</small></div><div class="b23226-kpi"><span>Obligaciones</span><strong>${money(summary.obligations)}</strong><small>plan + compromisos + cuotas</small></div><div class="b23226-kpi"><span>Flujo neto</span><strong class="${summary.flow>=0?'b23226-pos':'b23226-neg'}">${money(summary.flow)}</strong><small>${summaryMode==='day'?'jornada':'mes'}</small></div><div class="b23226-kpi"><span>Saldo al cierre</span><strong>${money(summary.balance)}</strong><small>saldo real acumulado</small></div><div class="b23226-kpi"><span>Saldo proyectado</span><strong class="${summary.projected>=0?'b23226-pos':'b23226-neg'}">${money(summary.projected)}</strong><small>${summaryMode==='day'?'al término de la jornada':'al término del mes'}</small></div></div></div>
      <div class="b23226-scroll"><div class="b23226-grid b23226-week"><div>DOM</div><div>LUN</div><div>MAR</div><div>MIÉ</div><div>JUE</div><div>VIE</div><div>SÁB</div>${days.map(d=>{const k=key(d),r=map[k],items=[];if(r){r.mov.forEach(x=>items.push(`<span class="b23226-event ${isIn(x)?'b23226-real-in':'b23226-real-out'}">${isIn(x)?'↑':'↓'} ${money(x.monto)} · ${esc(x.categoria||x.descripcion||'Movimiento')}</span>`));r.inc.forEach(x=>items.push(`<span class="b23226-event b23226-plan-in">⇢ ${money(x.monto)} · ${esc(x.concepto||'Ingreso futuro')}</span>`));r.out.forEach(x=>items.push(`<span class="b23226-event b23226-plan-out">● ${money(x.monto)} · ${esc(x.concepto||x.categoria||'Gasto planificado')}</span>`));r.comm.forEach(x=>items.push(`<span class="b23226-event b23226-plan-out">◆ ${money(x.monto)} · ${esc(x.concepto||'Compromiso')}</span>`));r.quota.forEach(x=>items.push(`<span class="b23226-event b23226-debt">▣ ${money(x.monto)} · Cuota ${esc(x.numero_cuota||'')}</span>`));r.gen.forEach(x=>items.push(`<span class="b23226-event b23226-gen">⚙ ${money(x.monto_neto)} · ${esc(x.actividad||x.descripcion||'Generación')}</span>`))}return `<button type="button" class="b23226-day ${d.getMonth()===m?'':'out'} ${k===selected?'selected':''}" data-b23226-date="${k}"><div class="b23226-day-top"><strong>${d.getDate()}</strong>${k===today()?'<small>HOY</small>':''}</div>${items.slice(0,6).join('')}${items.length>6?`<span class="b23226-more">+${items.length-6} más</span>`:''}${r?`<span class="b23226-mini">Saldo ${money(r.balance)}</span><span class="b23226-mini ${r.flow>=0?'b23226-pos':'b23226-neg'}">Flujo ${money(r.flow)}</span><span class="b23226-mini">Proyección ${money(r.projected)}</span>`:''}</button>`}).join('')}</div></div>
      <div class="b23226-detail"><div class="b23226-box"><h3>Detalle · ${esc(selectedLabel)}</h3><div class="b23226-row"><span>Ingresos reales</span><strong>${money(selectedRow.realIn)}</strong></div>${selectedRow.mov.filter(isIn).map(x=>`<div class="b23226-row"><span>${esc(x.categoria||x.descripcion||'Ingreso')}<small>Movimiento real</small></span><strong>${money(x.monto)}</strong></div>`).join('')||'<div class="b23226-row"><span>Sin ingresos reales</span><strong>$0</strong></div>'}<div class="b23226-row"><span>Ingresos futuros</span><strong>${money(selectedRow.planIn)}</strong></div>${selectedRow.inc.map(x=>`<div class="b23226-row"><span>${esc(x.concepto||'Ingreso futuro')}<small>Proyectado</small></span><strong>${money(x.monto)}</strong></div>`).join('')}<div class="b23226-row"><span>Generación multifuente</span><strong>${money(selectedRow.generated)}</strong></div>${selectedRow.gen.map(x=>`<div class="b23226-row"><span>${esc(x.actividad||x.descripcion||'Generación')}<small>${esc(x.estado_cobro||'')}</small></span><strong>${money(x.monto_neto)}</strong></div>`).join('')}</div><div class="b23226-box"><h3>Egresos y obligaciones</h3><div class="b23226-row"><span>Gastos reales</span><strong>${money(selectedRow.realOut)}</strong></div><div class="b23226-row"><span>Planificados</span><strong>${money(selectedRow.planOut)}</strong></div><div class="b23226-row"><span>Compromisos</span><strong>${money(selectedRow.commOut)}</strong></div><div class="b23226-row"><span>Cuotas pendientes</span><strong>${money(selectedRow.debtOut)}</strong></div>${selectedRow.quota.filter(x=>!isPaid(x)).map(x=>`<div class="b23226-row"><span>Cuota ${esc(x.numero_cuota||'')}<small>${esc(x.estado||'pendiente')}</small></span><strong>${money(x.monto)}</strong></div>`).join('')}</div></div>
      <div class="b23226-foot">Saldo real acumulado: <b>${money(selectedRow.balance)}</b> · Flujo del día: <b class="${selectedRow.flow>=0?'b23226-pos':'b23226-neg'}">${money(selectedRow.flow)}</b> · Saldo proyectado: <b>${money(selectedRow.projected)}</b>.</div>
    </div>`;
    $('b23226Prev').onclick=()=>{month.setMonth(month.getMonth()-1);selected=key(new Date(month.getFullYear(),month.getMonth(),1));summaryMode='month';render()};
    $('b23226Next').onclick=()=>{month.setMonth(month.getMonth()+1);selected=key(new Date(month.getFullYear(),month.getMonth(),1));summaryMode='month';render()};
    $('b23226Today').onclick=()=>{month=new Date(new Date().getFullYear(),new Date().getMonth(),1);selected=today();summaryMode='month';render()};
    $('b23226Refresh').onclick=()=>load();
    $('b23226MonthSummary')?.addEventListener('click',()=>{summaryMode='month';render()});
    host.querySelectorAll('[data-b23226-date]').forEach(b=>b.onclick=()=>{selected=b.dataset.b23226Date;summaryMode='day';render()});
  }

  window.B232Calendario={version:VERSION,load,render};
  window.B23226Calendar={version:VERSION,load,render};
})();
/* ============================================================
   B232.27 — CONTROLADOR ÚNICO DE NAVEGACIÓN Y CIERRE P2.1
   Regla: un solo módulo visible en cada instante.
   El calendario nunca controla la navegación global.
   ============================================================ */
(()=>{
'use strict';
if(window.__B23227_ROUTER__)return;
window.__B23227_ROUTER__=true;
const $=id=>document.getElementById(id);
const TABS=()=>Array.from(document.querySelectorAll('.tabs button[data-tab]'));
const SECTIONS=()=>Array.from(document.querySelectorAll('#app > .tab'));

function normalize(id){
  const target=$(id);
  if(!target)return false;
  SECTIONS().forEach(s=>{
    const active=s.id===id;
    s.classList.toggle('hidden',!active);
    s.style.display=active?'':'none';
    s.setAttribute('aria-hidden',active?'false':'true');
  });
  TABS().forEach(b=>{
    const active=b.dataset.tab===id;
    b.classList.toggle('active',active);
    b.setAttribute('aria-selected',active?'true':'false');
  });
  localStorage.setItem('cf_active_tab_v2',id);
  return true;
}

const legacyShow=window.b219Show;

// B232.32 — carga bajo demanda real. El clic del usuario es el disparador
// de la consulta; no se depende de una recarga de página ni de un timer.
function ensureModuleSection(id){
  if($(id)) return true;
  try{ window.B23232Planificacion?.mount?.(); }catch(e){console.warn('[B232.32] mount',e)}
  return !!$(id);
}

async function refreshModule(id){
  try{
    ensureModuleSection(id);
    if(id==='calendario' && window.B232Calendario?.load){
      await window.B232Calendario.load();
      return;
    }
    if(id==='operaciones'){
      // Operaciones tiene un refresco propio y síncrono con la navegación.
      await renderOps();
      normalize('operaciones');
      return;
    }
    if(id==='planificacion'){
      await renderPlan();
      normalize('planificacion');
      return;
    }
    if(id==='ingresos'){await renderIncome();normalize('ingresos');return;}
    if(id==='jornadas'){await renderJornadas();normalize('jornadas');return;}
    if(id==='dashboard' && window.FinancialSummary?.init){await window.FinancialSummary.init();normalize('dashboard');return;}
    if(legacyShow && ['deudas','cuentas'].includes(id)){
      await Promise.resolve(legacyShow(id)); normalize(id); return;
    }
  }catch(e){console.error('[B232.30] refresh module',id,e);normalize(id);}
}

async function show(id){
  // Primero garantiza que la sección exista; así el primer clic siempre es
  // funcional incluso si los módulos dinámicos aún están terminando de cargar.
  if(!ensureModuleSection(id))return false;
  normalize(id);
  await refreshModule(id);
  normalize(id);
  return true;
}
window.fin23230Plan=renderPlan;
window.fin23230Ops=renderOps;
window.CCFRouter={version:'232.32',show,normalize,refreshModule};
window.b219Show=show;
// Compatibilidad controlada: cualquier dependencia antigua que solicite Planificación
// recibe el mismo motor B232.30, evitando que B2.16/B2.23/B2.24 recuperen el control.
window.fin216Plan=renderPlan;

// Intercepta los botones después de los módulos legacy y evita que un handler
// antiguo vuelva a dejar Calendario visible junto al módulo solicitado.
document.addEventListener('click',e=>{
  const b=e.target.closest?.('.tabs button[data-tab], [data-b219-open]');
  if(!b)return;
  const id=b.dataset.tab||b.dataset.b219Open;
  e.preventDefault();
  e.stopImmediatePropagation();
  show(id);
},true);

// El botón global de actualización conserva SIEMPRE la pestaña actual.
document.addEventListener('click',e=>{
  const b=e.target.closest?.('button');
  if(!b)return;
  const label=(b.textContent||'').trim().toLowerCase();
  if(!label.includes('actualizar datos'))return;
  const id=localStorage.getItem('cf_active_tab_v2')||document.querySelector('.tabs button.active')?.dataset.tab||'dashboard';
  setTimeout(()=>show(id),0);
},true);

function boot(){
  const app=$('app');
  if(!app)return;
  // Elimina cualquier estilo legacy que haya intentado hacer persistente el calendario.
  document.querySelectorAll('#b23226Style').forEach(x=>x.remove());
  const stored=localStorage.getItem('cf_active_tab_v2');
  const initial=(stored && $(stored)) ? stored : (document.querySelector('.tabs button.active')?.dataset.tab||'dashboard');
  show(initial);
}

const observer=new MutationObserver(()=>{
  if(!$('app')?.classList.contains('hidden')){
    const id=localStorage.getItem('cf_active_tab_v2');
    if(id && $(id) && !$(id).classList.contains('hidden')) normalize(id);
  }
});
function start(){
  setTimeout(boot,900);
  setTimeout(boot,1800);
  const app=$('app');
  if(app)observer.observe(app,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
