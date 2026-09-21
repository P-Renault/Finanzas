/* ============================================================
   B232.52.3 · PLANIFICACIÓN SAFE
   Reemplaza únicamente el módulo B232.31/232.32 defectuoso.
   - API compatible: B23232Planificacion.mount/render
   - Router compatible: CCFRouter.show/normalize/refreshModule
   - Sin MutationObserver
   - Sin polling
   - Solo lectura para el escenario financiero
   ============================================================ */
(()=>{'use strict';
if(window.__B23252_PLAN_SAFE__)return;
window.__B23252_PLAN_SAFE__=true;

const $=id=>document.getElementById(id);
const money=n=>new Intl.NumberFormat('es-CL',{style:'currency',currency:'CLP',maximumFractionDigits:0}).format(Number(n)||0);
const today=()=>{const d=new Date();return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,10)};
const addDays=(base,n)=>{const d=new Date(base+'T12:00:00');d.setDate(d.getDate()+n);return d.toISOString().slice(0,10)};
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));

function db(){
  if(window.supabaseClient)return window.supabaseClient;
  const u=localStorage.getItem('sf_url'),k=localStorage.getItem('sf_key');
  if(!u||!k||!window.supabase?.createClient)return null;
  try{
    window.supabaseClient=window.supabase.createClient(u,k,{auth:{persistSession:false,autoRefreshToken:false}});
    return window.supabaseClient;
  }catch(e){console.error('[B232.52.3] Supabase',e);return null}
}

async function read(query,fallback=[]){
  try{const r=await query;if(r.error){console.warn('[B232.52.3]',r.error.message);return fallback}return r.data||fallback}
  catch(e){console.warn('[B232.52.3]',e);return fallback}
}

function styles(){
  if($('b23252PlanStyle'))return;
  const s=document.createElement('style');
  s.id='b23252PlanStyle';
  s.textContent=`
    .b23252-kpis{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin:12px 0}
    .b23252-kpi{padding:14px;border:1px solid #e5e7eb;border-radius:12px;background:#fff}
    .b23252-kpi span,.b23252-kpi small{display:block;color:#64748b;font-size:11px}
    .b23252-kpi strong{display:block;font-size:20px;margin-top:5px}
    .b23252-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
    .b23252-row{display:flex;justify-content:space-between;gap:10px;padding:9px 0;border-bottom:1px solid #edf2f7}
    .b23252-row small{display:block;color:#64748b}
    .b23252-positive{color:#166534}.b23252-negative{color:#991b1b}
    @media(max-width:760px){.b23252-kpis{grid-template-columns:1fr 1fr}.b23252-grid{grid-template-columns:1fr}}
  `;
  document.head.appendChild(s);
}

function ensureSections(){
  const app=$('app');if(!app)return false;
  const ensure=(id,html)=>{
    let s=$(id);
    if(!s){
      s=document.createElement('section');
      s.id=id;s.className='tab hidden';s.innerHTML=html;app.appendChild(s);
    }
    return s;
  };
  ensure('operaciones',`
    <div class="card"><h2>Operaciones</h2><p class="muted">Liquidez, cuentas, ingresos futuros y obligaciones.</p>
    <div class="b23252-kpis">
      <div class="b23252-kpi"><span>Liquidez real</span><strong id="f24Liq">$0</strong></div>
      <div class="b23252-kpi"><span>Ingresos futuros</span><strong id="f24Future">$0</strong></div>
      <div class="b23252-kpi"><span>Obligaciones</span><strong id="f24Oblig">$0</strong></div>
      <div class="b23252-kpi"><span>Proyección</span><strong id="f24Proj">$0</strong></div>
    </div></div>`);
  ensure('planificacion','<div id="b216Content"></div>');
  return !!$('planificacion');
}

function normalize(id){
  document.querySelectorAll('.tab').forEach(x=>x.classList.toggle('hidden',x.id!==id));
  document.querySelectorAll('.tabs button[data-tab]').forEach(b=>b.classList.toggle('active',b.dataset.tab===id));
  localStorage.setItem('cf_active_tab_v2',id);
}

async function renderPlan(){
  styles();
  if(!ensureSections())return false;
  const box=$('b216Content');if(!box)return false;
  const c=db();
  if(!c){
    box.innerHTML='<div class="card"><h2>Planificación financiera</h2><p class="muted">Conecta Supabase para cargar el escenario financiero.</p></div>';
    return false;
  }

  const t=today(),end=addDays(t,29);
  const [close,banks,inc,exp,comm,quota]=await Promise.all([
    read(c.from('cierres_financieros').select('saldo_efectivo_actual').eq('activo',true).order('fecha_corte',{ascending:false}).limit(1)),
    read(c.from('cuentas_bancarias').select('saldo_actual').eq('activa',true)),
    read(c.from('ingresos_futuros').select('monto,fecha,concepto').gte('fecha',t).lte('fecha',end)),
    read(c.from('gastos_planificados').select('monto,fecha,concepto,categoria').gte('fecha',t).lte('fecha',end)),
    read(c.from('compromisos').select('monto,fecha_vencimiento,concepto,categoria,estado').eq('estado','pendiente').gte('fecha_vencimiento',t).lte('fecha_vencimiento',end)),
    read(c.from('cuotas_deuda').select('id,monto,fecha_vencimiento,numero_cuota,estado').in('estado',['pendiente','vencida']).gte('fecha_vencimiento',t).lte('fecha_vencimiento',end))
  ]);

  const liquidity=Number(close[0]?.saldo_efectivo_actual||0)+banks.reduce((s,x)=>s+Number(x.saldo_actual||0),0);
  const income=inc.reduce((s,x)=>s+Number(x.monto||0),0);
  const planned=exp.reduce((s,x)=>s+Number(x.monto||0),0);
  const commitments=comm.reduce((s,x)=>s+Number(x.monto||0),0);
  const debt=quota.reduce((s,x)=>s+Number(x.monto||0),0);
  const obligations=planned+commitments+debt;
  const projected=liquidity+income-obligations;

  const days={};
  for(let i=0;i<30;i++)days[addDays(t,i)]={in:0,out:0};
  inc.forEach(x=>{if(days[x.fecha])days[x.fecha].in+=Number(x.monto||0)});
  exp.forEach(x=>{if(days[x.fecha])days[x.fecha].out+=Number(x.monto||0)});
  comm.forEach(x=>{if(days[x.fecha_vencimiento])days[x.fecha_vencimiento].out+=Number(x.monto||0)});
  quota.forEach(x=>{if(days[x.fecha_vencimiento])days[x.fecha_vencimiento].out+=Number(x.monto||0)});

  let balance=liquidity,minBalance=liquidity,minDate=t,maxDeficit=0,maxDeficitDate='—';
  Object.keys(days).sort().forEach(d=>{
    balance+=days[d].in-days[d].out;
    if(balance<minBalance){minBalance=balance;minDate=d}
    if(balance<0&&Math.abs(balance)>maxDeficit){maxDeficit=Math.abs(balance);maxDeficitDate=d}
  });

  const fmtDate=d=>d&&d!=='—'?new Intl.DateTimeFormat('es-CL').format(new Date(d+'T12:00:00')):'—';

  box.innerHTML=`
  <div class="card">
    <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap">
      <div><div class="muted" style="font-size:11px">B232.52.3 · PLANIFICACIÓN SEGURA</div>
      <h2>Planificación financiera</h2>
      <p class="muted">Escenario de 30 días basado en liquidez, ingresos futuros y obligaciones registradas.</p></div>
      <button type="button" id="b23252PlanRefresh">Actualizar Planificación</button>
    </div>
    <div class="b23252-kpis">
      <div class="b23252-kpi"><span>Liquidez real</span><strong>${money(liquidity)}</strong><small>Disponible hoy</small></div>
      <div class="b23252-kpi"><span>Ingresos futuros</span><strong>${money(income)}</strong><small>${inc.length} registros</small></div>
      <div class="b23252-kpi"><span>Obligaciones</span><strong>${money(obligations)}</strong><small>30 días</small></div>
      <div class="b23252-kpi"><span>Saldo proyectado</span><strong class="${projected>=0?'b23252-positive':'b23252-negative'}">${money(projected)}</strong><small>Fin del escenario</small></div>
    </div>
  </div>
  <div class="b23252-grid">
    <div class="card"><h2>Escenario</h2>
      <div class="b23252-row"><span>Fecha del mínimo<small>Punto más bajo proyectado</small></span><strong>${fmtDate(minDate)}</strong></div>
      <div class="b23252-row"><span>Déficit máximo<small>Exposición bajo $0</small></span><strong class="${maxDeficit?'b23252-negative':''}">${money(maxDeficit)}</strong></div>
      <div class="b23252-row"><span>Saldo mínimo proyectado</span><strong class="${minBalance>=0?'b23252-positive':'b23252-negative'}">${money(minBalance)}</strong></div>
    </div>
    <div class="card"><h2>Componentes</h2>
      <div class="b23252-row"><span>Ingresos programados</span><strong>${money(income)}</strong></div>
      <div class="b23252-row"><span>Compromisos</span><strong>${money(commitments)}</strong></div>
      <div class="b23252-row"><span>Cuotas de deuda</span><strong>${money(debt)}</strong></div>
      <div class="b23252-row"><span>Gastos planificados</span><strong>${money(planned)}</strong></div>
    </div>
  </div>
  <div class="card"><h3>Lectura del escenario</h3>
    <div class="b23252-status" style="padding:10px;border-radius:10px;background:#f8fafc">
      ${projected<0
        ?`El escenario termina con un saldo proyectado negativo de ${money(Math.abs(projected))}.`
        :`Con los registros actuales, el escenario termina con ${money(projected)}.`}
      ${maxDeficit?` El déficit máximo se alcanza el ${fmtDate(maxDeficitDate)}.`:''}
    </div>
  </div>`;

  $('b23252PlanRefresh')?.addEventListener('click',()=>renderPlan());
  return true;
}

async function renderOps(){
  normalize('operaciones');
  const c=db(); if(!c)return;

  // Operaciones mantiene una vista global de cuentas y obligaciones.
  // El horizonte de 30 días pertenece exclusivamente a Planificación.
  const [close,banks,inc,exp,comm,quota]=await Promise.all([
    read(c.from('cierres_financieros').select('saldo_efectivo_actual').eq('activo',true).order('fecha_corte',{ascending:false}).limit(1)),
    read(c.from('cuentas_bancarias').select('nombre_banco,nombre_cuenta,tipo_cuenta,saldo_actual,activa').eq('activa',true).order('nombre_banco')),
    read(c.from('ingresos_futuros').select('monto,fecha,concepto').gte('fecha',today())),
    read(c.from('gastos_planificados').select('monto,fecha,concepto,categoria').gte('fecha',today())),
    read(c.from('compromisos').select('monto,fecha_vencimiento,concepto,categoria,estado').eq('estado','pendiente').order('fecha_vencimiento',{ascending:true})),
    read(c.from('cuotas_deuda').select('monto,fecha_vencimiento,numero_cuota,estado').in('estado',['pendiente','vencida']).order('fecha_vencimiento',{ascending:true}))
  ]);

  const liquidity=Number(close[0]?.saldo_efectivo_actual||0)+banks.reduce((s,x)=>s+Number(x.saldo_actual||0),0);
  const future=inc.reduce((s,x)=>s+Number(x.monto||0),0);
  const obligations=
    exp.reduce((s,x)=>s+Number(x.monto||0),0)+
    comm.reduce((s,x)=>s+Number(x.monto||0),0)+
    quota.reduce((s,x)=>s+Number(x.monto||0),0);
  const projected=liquidity+future-obligations;

  if($('f24Liq'))$('f24Liq').textContent=money(liquidity);
  if($('f24Future'))$('f24Future').textContent=money(future);
  if($('f24Oblig'))$('f24Oblig').textContent=money(obligations);
  if($('f24Proj'))$('f24Proj').textContent=money(projected);

  const accountRows=banks.map(x=>`
    <div class="b23252-row">
      <span>${esc(x.nombre_banco||'Banco')}<small>${esc(x.nombre_cuenta||x.tipo_cuenta||'Cuenta')}</small></span>
      <strong>${money(x.saldo_actual)}</strong>
    </div>`).join('');

  const obligationRows=[
    ...comm.map(x=>({date:x.fecha_vencimiento,name:x.concepto||'Compromiso',amount:x.monto})),
    ...quota.map(x=>({date:x.fecha_vencimiento,name:'Cuota de deuda',amount:x.monto}))
  ].filter(x=>Number(x.amount||0)>0)
   .sort((a,b)=>String(a.date||'').localeCompare(String(b.date||'')));

  const obligationHtml=obligationRows.slice(0,30).map(x=>`
    <div class="b23252-row">
      <span>${esc(x.name)}<small>${esc(x.date||'')}</small></span>
      <strong>${money(x.amount)}</strong>
    </div>`).join('');

  const host=$('operaciones');
  if(host){
    let grid=host.querySelector('.b23252-ops-grid');
    if(!grid){
      const card=host.querySelector('.card');
      grid=document.createElement('div');
      grid.className='b23252-grid b23252-ops-grid';
      grid.innerHTML=`
        <div class="card"><h2>Cuentas</h2><div id="f24Accounts"></div></div>
        <div class="card"><h2>Próximas obligaciones</h2><div id="f24ObligList"></div></div>`;
      if(card)card.insertAdjacentElement('afterend',grid);else host.appendChild(grid);

      const actions=document.createElement('div');
      actions.className='card b23252-ops-actions';
      actions.innerHTML='<button type="button" id="f24OpsRefresh">Actualizar Operaciones</button>';
      host.appendChild(actions);
      $('f24OpsRefresh')?.addEventListener('click',()=>renderOps());
    }
    if($('f24Accounts'))$('f24Accounts').innerHTML=accountRows||'<p class="muted">Sin cuentas activas.</p>';
    if($('f24ObligList'))$('f24ObligList').innerHTML=obligationHtml||'<p class="muted">Sin obligaciones próximas.</p>';
  }
  return true;
}
async function refreshModule(id){
  if(id==='planificacion')return renderPlan();
  if(id==='operaciones')return renderOps();
  return true;
}

async function show(id){
  if(!ensureSections())return false;
  normalize(id);
  return refreshModule(id);
}

window.B23232Planificacion={
  version:'232.52.2',
  mount:()=>{styles();return ensureSections()},
  render:renderPlan
};
window.CCFRouter={version:'232.52.2',show,normalize,refreshModule};
window.b219Show=show;
window.fin23230Plan=renderPlan;
window.fin23230Ops=renderOps;
window.fin216Plan=renderPlan;

document.addEventListener('click',e=>{
  const b=e.target.closest?.('.tabs button[data-tab]');
  if(!b)return;
  const id=b.dataset.tab;
  if(id!=='planificacion'&&id!=='operaciones')return;
  e.preventDefault();e.stopImmediatePropagation();
  show(id);
},true);

function boot(){
  styles();ensureSections();
  const active=localStorage.getItem('cf_active_tab_v2');
  if(active==='planificacion'||active==='operaciones')show(active);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
else boot();

})();
