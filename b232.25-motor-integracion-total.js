/* ============================================================
   B232.25 — MOTOR DE INTEGRACIÓN TOTAL
   Objetivo:
   - Calendario 360° con datos reales + planificados + compromisos
     + cuotas + generación multifuente + cobros.
   - Operaciones y Planificación: refresco real, independiente y
     tolerante a tablas opcionales ausentes.
   - Resumen / motor analítico: recalcular sin cambiar de módulo.
   - Persistencia de pestaña: actualizar nunca devuelve a Resumen.
   ============================================================ */
(()=>{
'use strict';
if(window.__B23225_TOTAL__) return; window.__B23225_TOTAL__=true;
const $=id=>document.getElementById(id);
const money=n=>new Intl.NumberFormat('es-CL',{style:'currency',currency:'CLP',maximumFractionDigits:0}).format(Number(n)||0);
const today=()=>{const d=new Date();return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,10)};
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const num=v=>Number(v)||0;
const paid=v=>['pagada','pagado','cancelada','cancelado','pago','paid','cobrado'].includes(String(v??'').toLowerCase());
const inType=v=>['ingreso','income'].includes(String(v??'').toLowerCase());
const outType=v=>['gasto','egreso','expense'].includes(String(v??'').toLowerCase());
let clientCache=null;
function client(){
 if(clientCache)return clientCache;
 const u=localStorage.getItem('sf_url'),k=localStorage.getItem('sf_key');
 if(!u||!k||!window.supabase)return null;
 try{return clientCache=window.supabase.createClient(u,k,{auth:{persistSession:false,autoRefreshToken:false}})}catch(e){console.error('[B232.25]',e);return null}
}
async function read(p){try{const r=await p;return {data:r?.data||[],error:r?.error||null}}catch(e){return {data:[],error:e}}}
async function rows(table,query){const r=await read(query(client())); if(r.error) console.warn('[B232.25]',table,r.error.message||r.error); return r.data||[]}
function dateOf(x,...keys){for(const k of keys){if(x?.[k])return String(x[k]).slice(0,10)}return ''}
function ensureStyle(){if($('b23225Style'))return;const s=document.createElement('style');s.id='b23225Style';s.textContent=`
.b23225-toolbar{display:flex;gap:8px;align-items:center;justify-content:space-between;flex-wrap:wrap;margin-bottom:12px}.b23225-toolbar button{cursor:pointer}.b23225-badge{font-size:11px;padding:5px 9px;border-radius:999px;background:#eef2ff;color:#3730a3;font-weight:800}.b23225-kpis{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:9px;margin:10px 0}.b23225-kpi{border:1px solid #e5e7eb;border-radius:12px;padding:11px;background:#fff}.b23225-kpi span,.b23225-kpi small{display:block;color:#64748b;font-size:11px}.b23225-kpi strong{display:block;margin-top:4px;font-size:18px}.b23225-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.b23225-row{display:flex;justify-content:space-between;gap:10px;padding:8px 0;border-bottom:1px solid #edf2f7}.b23225-row small{display:block;color:#64748b;font-size:10px;margin-top:2px}.b23225-pos{color:#166534}.b23225-neg{color:#991b1b}.b23225-warn{padding:9px;border-radius:10px;background:#fff7ed;color:#9a3412}.b23225-ok{padding:9px;border-radius:10px;background:#ecfdf5;color:#166534}.b23225-source{font-size:10px;color:#64748b}.b23225-calendar{display:grid;grid-template-columns:repeat(7,minmax(96px,1fr));overflow:auto;border:1px solid #e5e7eb;border-radius:12px}.b23225-calendar>div{padding:8px;text-align:center;font-size:10px;font-weight:800;border-bottom:1px solid #e5e7eb}.b23225-day{min-height:145px;padding:7px;border:0;border-right:1px solid #e5e7eb;border-bottom:1px solid #e5e7eb;background:#fff;text-align:left;cursor:pointer}.b23225-day.out{background:#f8fafc;color:#94a3b8}.b23225-day.sel{outline:2px solid #111827;outline-offset:-2px}.b23225-ev{display:block;font-size:9px;padding:3px 4px;border-radius:5px;margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.b23225-real-in{background:#ecfdf5;color:#166534}.b23225-real-out{background:#fef2f2;color:#991b1b}.b23225-plan-in{background:#eff6ff;color:#1d4ed8;border:1px dashed #93c5fd}.b23225-plan-out{background:#fff7ed;color:#9a3412}.b23225-source-in{background:#f5f3ff;color:#6d28d9;border:1px dashed #c4b5fd}.b23225-debt{background:#eef2ff;color:#3730a3}.b23225-detail{margin-top:12px}.b23225-section{font-size:11px;font-weight:900;color:#334155;margin:12px 0 5px}.b23225-refreshing{opacity:.65;pointer-events:none}@media(max-width:760px){.b23225-kpis{grid-template-columns:1fr 1fr}.b23225-grid{grid-template-columns:1fr}}
`;document.head.appendChild(s)}
function navState(){return localStorage.getItem('cf_active_tab_v2')||'dashboard'}
function setTab(id){if($(id)){localStorage.setItem('cf_active_tab_v2',id);document.querySelectorAll('.tab').forEach(s=>s.classList.toggle('hidden',s.id!==id));document.querySelectorAll('.tabs button[data-tab]').forEach(b=>b.classList.toggle('active',b.dataset.tab===id))}}
async function refreshModule(id){
 setTab(id);
 if(id==='operaciones') await renderOperations();
 else if(id==='planificacion') await renderPlanning();
 else if(id==='ingresos') await renderSources();
 else if(id==='jornadas') await renderJornada();
 else if(id==='calendario') await calendarLoad();
 else if(id==='dashboard') await refreshAnalysis();
}
window.B23225RefreshModule=refreshModule;
async function getLiquidity(c){
 const close=await read(c.from('cierres_financieros').select('*').eq('activo',true).order('fecha_corte',{ascending:false}).limit(1));
 const banks=await read(c.from('cuentas_bancarias').select('*').eq('activa',true));
 let base=0,mode='movimientos';
 const cf=close.data?.[0];
 if(cf && cf.saldo_efectivo_actual!==null && cf.saldo_efectivo_actual!==undefined){base=num(cf.saldo_efectivo_actual);mode='cierre financiero';}
 else if(cf && cf.saldo_inicial!==null && cf.saldo_inicial!==undefined){base=num(cf.saldo_inicial);mode='saldo inicial'}
 else if(banks.data?.length){base=banks.data.reduce((s,x)=>s+num(x.saldo_actual),0);mode='cuentas activas'}
 return {base,banks:banks.data||[],close:cf,mode};
}
async function renderOperations(){
 const c=client();if(!c)return;
 const host=$('operaciones');if(!host)return;
 ensureStyle();
 const [liq,mov,inc,exp,comm,quota,gen]=await Promise.all([
  getLiquidity(c), rows('movimientos',c.from('movimientos').select('*').order('fecha',{ascending:false})),
  rows('ingresos_futuros',c.from('ingresos_futuros').select('*').gte('fecha',today()).order('fecha')),
  rows('gastos_planificados',c.from('gastos_planificados').select('*').gte('fecha',today()).order('fecha')),
  rows('compromisos',c.from('compromisos').select('*').eq('estado','pendiente').order('fecha_vencimiento')),
  rows('cuotas_deuda',c.from('cuotas_deuda').select('*').in('estado',['pendiente','vencida']).gte('fecha_vencimiento',today()).order('fecha_vencimiento')),
  rows('generacion_ingresos',c.from('generacion_ingresos').select('*').order('fecha_generacion',{ascending:false}).limit(200))
 ]);
 const futureIn=inc.reduce((s,x)=>s+num(x.monto),0);
 const generated=gen.filter(x=>x.estado_cobro!=='cancelado').reduce((s,x)=>s+num(x.monto_neto),0);
 const obligations=exp.reduce((s,x)=>s+num(x.monto),0)+comm.reduce((s,x)=>s+num(x.monto),0)+quota.reduce((s,x)=>s+num(x.monto),0);
 const projected=liq.base+futureIn-obligations;
 const activeDebt=quota.reduce((s,x)=>s+num(x.monto),0);
 const existing=host.querySelector('#b23225OpsRoot');
 const root=existing||document.createElement('div');root.id='b23225OpsRoot';
 root.innerHTML=`<div class="card"><div class="b23225-toolbar"><div><span class="muted">B232.25 · MOTOR OPERACIONAL</span><h2>Operaciones</h2><p class="muted">Datos recalculados directamente desde Supabase.</p></div><button type="button" id="b23225OpsBtn">Actualizar módulo</button></div><div class="b23225-kpis"><div class="b23225-kpi"><span>Liquidez real</span><strong>${money(liq.base)}</strong><small>${esc(liq.mode)}</small></div><div class="b23225-kpi"><span>Ingresos futuros</span><strong>${money(futureIn)}</strong></div><div class="b23225-kpi"><span>Generación neta</span><strong>${money(generated)}</strong></div><div class="b23225-kpi"><span>Obligaciones</span><strong>${money(obligations)}</strong></div><div class="b23225-kpi"><span>Saldo proyectado</span><strong class="${projected>=0?'b23225-pos':'b23225-neg'}">${money(projected)}</strong></div></div></div><div class="b23225-grid"><div class="card"><h3>Cuentas activas</h3>${liq.banks.map(x=>`<div class="b23225-row"><span>${esc(x.nombre_banco||'Banco')}<small>${esc(x.nombre_cuenta||'Cuenta')}</small></span><strong>${money(x.saldo_actual)}</strong></div>`).join('')||'<p class="muted">Sin cuentas activas.</p>'}</div><div class="card"><h3>Próximas obligaciones</h3>${[...comm.map(x=>({d:dateOf(x,'fecha_vencimiento','fecha'),n:x.concepto||'Compromiso',m:x.monto})),...quota.map(x=>({d:dateOf(x,'fecha_vencimiento'),n:'Cuota de deuda',m:x.monto}))].sort((a,b)=>a.d.localeCompare(b.d)).slice(0,15).map(x=>`<div class="b23225-row"><span>${esc(x.n)}<small>${esc(x.d)}</small></span><strong>${money(x.m)}</strong></div>`).join('')||'<p class="muted">Sin obligaciones próximas.</p>'}</div></div><div class="card"><p class="${projected>=0?'b23225-ok':'b23225-warn'}">${projected>=0?'Proyección positiva con los datos actualmente registrados.':'La proyección queda bajo $0 con las obligaciones actualmente registradas.'}</p></div>`;
 if(!existing) host.innerHTML='';if(!existing)host.appendChild(root);$('b23225OpsBtn').onclick=()=>renderOperations();
}
async function renderPlanning(){
 const c=client();if(!c)return;const host=$('planificacion');if(!host)return;ensureStyle();
 const [liq,inc,exp,comm,quota,gen]=await Promise.all([getLiquidity(c),rows('ingresos_futuros',c.from('ingresos_futuros').select('*').gte('fecha',today())),rows('gastos_planificados',c.from('gastos_planificados').select('*').gte('fecha',today())),rows('compromisos',c.from('compromisos').select('*').eq('estado','pendiente').gte('fecha_vencimiento',today())),rows('cuotas_deuda',c.from('cuotas_deuda').select('*').in('estado',['pendiente','vencida']).gte('fecha_vencimiento',today())),rows('generacion_ingresos',c.from('generacion_ingresos').select('*').gte('fecha_generacion',today()))]);
 const future=inc.reduce((s,x)=>s+num(x.monto),0), generated=gen.filter(x=>x.estado_cobro!=='cancelado').reduce((s,x)=>s+num(x.monto_neto),0), obligations=exp.reduce((s,x)=>s+num(x.monto),0)+comm.reduce((s,x)=>s+num(x.monto),0)+quota.reduce((s,x)=>s+num(x.monto),0), projected=liq.base+future-obligations;
 let box=host.querySelector('#b23225PlanRoot');if(!box){host.innerHTML='';box=document.createElement('div');box.id='b23225PlanRoot';host.appendChild(box)}
 box.innerHTML=`<div class="card"><div class="b23225-toolbar"><div><span class="muted">B232.25 · PLANIFICACIÓN</span><h2>Planificación financiera</h2><p class="muted">Escenario actualizado sin abandonar el módulo activo.</p></div><button type="button" id="b23225PlanBtn">Actualizar módulo</button></div><div class="b23225-kpis"><div class="b23225-kpi"><span>Liquidez real</span><strong>${money(liq.base)}</strong></div><div class="b23225-kpi"><span>Ingresos futuros</span><strong>${money(future)}</strong></div><div class="b23225-kpi"><span>Generación multifuente</span><strong>${money(generated)}</strong></div><div class="b23225-kpi"><span>Obligaciones</span><strong>${money(obligations)}</strong></div><div class="b23225-kpi"><span>Saldo proyectado</span><strong class="${projected>=0?'b23225-pos':'b23225-neg'}">${money(projected)}</strong></div></div></div><div class="b23225-grid"><div class="card"><h3>Escenario</h3><div class="b23225-row"><span>Ingreso futuro</span><strong>${money(future)}</strong></div><div class="b23225-row"><span>Obligaciones</span><strong>${money(obligations)}</strong></div><div class="b23225-row"><span>Resultado proyectado</span><strong>${money(projected)}</strong></div></div><div class="card"><h3>Composición de obligaciones</h3><div class="b23225-row"><span>Gastos planificados</span><strong>${money(exp.reduce((s,x)=>s+num(x.monto),0))}</strong></div><div class="b23225-row"><span>Compromisos</span><strong>${money(comm.reduce((s,x)=>s+num(x.monto),0))}</strong></div><div class="b23225-row"><span>Cuotas</span><strong>${money(quota.reduce((s,x)=>s+num(x.monto),0))}</strong></div></div></div>`;
 $('b23225PlanBtn').onclick=()=>renderPlanning();
}
async function renderSources(){if(typeof window.b219Show==='function' && $('ingresos')){try{window.b219Show('ingresos')}catch{}}}
async function renderJornada(){if(typeof window.b219Show==='function' && $('jornadas')){try{window.b219Show('jornadas')}catch{}}}
/* ---------------- CALENDARIO 360° ---------------- */
let calMonth=new Date(new Date().getFullYear(),new Date().getMonth(),1),calSelected=today();
let CAL={mov:[],inc:[],exp:[],comm:[],quota:[],gen:[],debt:[],base:0};
function calKey(d){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
async function calendarLoad(){
 const c=client();if(!c)return;ensureStyle();
 const [mov,inc,exp,comm,quota,gen,debt,liq]=await Promise.all([
  rows('movimientos',c.from('movimientos').select('*').order('fecha')),
  rows('ingresos_futuros',c.from('ingresos_futuros').select('*').order('fecha')),
  rows('gastos_planificados',c.from('gastos_planificados').select('*').order('fecha')),
  rows('compromisos',c.from('compromisos').select('*').order('fecha_vencimiento')),
  rows('cuotas_deuda',c.from('cuotas_deuda').select('id,deuda_id,numero_cuota,monto,fecha_vencimiento,estado').order('fecha_vencimiento')),
  rows('generacion_ingresos',c.from('generacion_ingresos').select('*').order('fecha_generacion')),
  rows('v_deudas_resumen',c.from('v_deudas_resumen').select('id,acreedor,concepto')),
  getLiquidity(c)
 ]);
 CAL={mov,inc,exp,comm,quota,gen,debt,base:liq.base};
 renderCalendar();
}
function monthRows(){
 const y=calMonth.getFullYear(),m=calMonth.getMonth(),last=new Date(y,m+1,0).getDate();
 const map={};for(let d=1;d<=last;d++){const k=`${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;map[k]={k,mov:[],inc:[],exp:[],comm:[],quota:[],gen:[],realIn:0,realOut:0,planIn:0,planOut:0,commOut:0,debtOut:0,generated:0,collected:0}}
 const put=(k,type,x)=>{if(map[k])map[k][type].push(x)};
 CAL.mov.forEach(x=>{const k=dateOf(x,'fecha');put(k,'mov',x)});
 CAL.inc.forEach(x=>{const k=dateOf(x,'fecha','fecha_vencimiento');if(!paid(x))put(k,'inc',x)});
 CAL.exp.forEach(x=>{const k=dateOf(x,'fecha','fecha_vencimiento');if(!paid(x))put(k,'exp',x)});
 CAL.comm.forEach(x=>{const k=dateOf(x,'fecha_vencimiento','fecha');if(!paid(x))put(k,'comm',x)});
 CAL.quota.forEach(x=>{const k=dateOf(x,'fecha_vencimiento');if(k)put(k,'quota',x)});
 CAL.gen.forEach(x=>{if(String(x.estado_cobro||'').toLowerCase()==='cancelado')return;const k=dateOf(x,'fecha_cobro','fecha_generacion');if(k)put(k,'gen',x)});
 let balance=CAL.base;const before=CAL.mov.filter(x=>dateOf(x,'fecha')<`${y}-${String(m+1).padStart(2,'0')}-01`).reduce((s,x)=>s+(inType(x.tipo)?num(x.monto):outType(x.tipo)?-num(x.monto):0),0);balance+=before;
 const rows=[];for(const k of Object.keys(map).sort()){const r=map[k];r.realIn=r.mov.filter(x=>inType(x.tipo)).reduce((s,x)=>s+num(x.monto),0);r.realOut=r.mov.filter(x=>outType(x.tipo)).reduce((s,x)=>s+num(x.monto),0);r.planIn=r.inc.reduce((s,x)=>s+num(x.monto),0);r.planOut=r.exp.reduce((s,x)=>s+num(x.monto),0);r.commOut=r.comm.reduce((s,x)=>s+num(x.monto),0);r.debtOut=r.quota.filter(x=>!paid(x)).reduce((s,x)=>s+num(x.monto),0);r.generated=r.gen.reduce((s,x)=>s+num(x.monto_neto),0);r.collected=r.gen.filter(x=>String(x.estado_cobro).toLowerCase()==='cobrado').reduce((s,x)=>s+num(x.monto_neto),0);balance+=r.realIn-r.realOut;r.flow=r.realIn+r.planIn-r.realOut-r.planOut-r.commOut-r.debtOut;r.projected=balance+r.planIn+r.generated-r.planOut-r.commOut-r.debtOut;rows.push(r)}return rows;
}
function ev(x,cls,label,amount){return `<span class="b23225-ev ${cls}">${esc(label)} ${money(amount)}</span>`}
function renderCalendar(){
 const host=$('calendario');if(!host)return;ensureStyle();const rows=monthRows(),map=Object.fromEntries(rows.map(x=>[x.k,x]));const y=calMonth.getFullYear(),m=calMonth.getMonth(),first=new Date(y,m,1),grid=new Date(first);grid.setDate(1-first.getDay());const days=Array.from({length:42},(_,i)=>{const d=new Date(grid);d.setDate(grid.getDate()+i);return d});const r=map[calSelected]||rows.find(x=>x.k===calKey(new Date(y,m,1)))||{k:calSelected,mov:[],inc:[],exp:[],comm:[],quota:[],gen:[],realIn:0,realOut:0,planIn:0,planOut:0,commOut:0,debtOut:0,generated:0,collected:0,flow:0,projected:0,balance:CAL.base};const label=new Date(calSelected+'T12:00:00').toLocaleDateString('es-CL',{weekday:'long',day:'numeric',month:'long',year:'numeric'}).replace(/^./,x=>x.toUpperCase());const monthLabel=calMonth.toLocaleDateString('es-CL',{month:'long',year:'numeric'}).replace(/^./,x=>x.toUpperCase());const total=f=>rows.reduce((s,x)=>s+num(x[f]),0);
 host.innerHTML=`<div class="card"><div class="b23225-toolbar"><div><span class="muted">B232.25 · CALENDARIO 360°</span><h2>${monthLabel}</h2><p class="muted">Real + planificado + compromisos + cuotas + motor multifuente.</p></div><div><button id="b23225CalPrev">‹</button> <button id="b23225CalToday">Hoy</button> <button id="b23225CalNext">›</button> <button id="b23225CalRefresh">Actualizar</button></div></div><div class="b23225-kpis"><div class="b23225-kpi"><span>Ingresos reales</span><strong>${money(total('realIn'))}</strong></div><div class="b23225-kpi"><span>Ingresos proyectados</span><strong>${money(total('planIn'))}</strong></div><div class="b23225-kpi"><span>Generación multifuente</span><strong>${money(total('generated'))}</strong></div><div class="b23225-kpi"><span>Obligaciones</span><strong>${money(total('planOut')+total('commOut')+total('debtOut'))}</strong></div><div class="b23225-kpi"><span>Liquidez base</span><strong>${money(CAL.base)}</strong></div></div><div class="muted">Mes: reales ${money(total('realIn')-total('realOut'))} · plan ${money(total('planIn')-total('planOut'))} · compromisos ${money(total('commOut'))} · cuotas ${money(total('debtOut'))} · generado ${money(total('generated'))}</div><div class="b23225-calendar"><div>DOM</div><div>LUN</div><div>MAR</div><div>MIÉ</div><div>JUE</div><div>VIE</div><div>SÁB</div>${days.map(d=>{const k=calKey(d),x=map[k],items=[];if(x){x.mov.forEach(z=>items.push(ev(z,inType(z.tipo)?'b23225-real-in':'b23225-real-out',inType(z.tipo)?'↑':'↓',z.monto)));x.inc.forEach(z=>items.push(ev(z,'b23225-plan-in','Plan ↑',z.monto)));x.exp.forEach(z=>items.push(ev(z,'b23225-plan-out','Plan ↓',z.monto)));x.comm.forEach(z=>items.push(ev(z,'b23225-plan-out','Comp ↓',z.monto)));x.quota.forEach(z=>items.push(ev(z,'b23225-debt','Cuota',z.monto)));x.gen.forEach(z=>items.push(ev(z,'b23225-source-in',String(z.actividad||'Generación').slice(0,18)+' ·',z.monto_neto)))}return `<button type="button" class="b23225-day ${d.getMonth()===m?'':'out'} ${k===calSelected?'sel':''}" data-cal-date="${k}"><strong>${d.getDate()}</strong>${k===today()?'<small> · HOY</small>':''}${items.slice(0,6).join('')}${items.length>6?`<span class="b23225-source">+${items.length-6} más</span>`:''}${x?`<div class="b23225-source">Saldo real ${money(x.balance)}</div><div class="${x.flow>=0?'b23225-pos':'b23225-neg'}">Flujo ${money(x.flow)}</div><div class="b23225-source">Proyección ${money(x.projected)}</div>`:''}</button>`}).join('')}</div><div id="b23225CalDetail" class="b23225-detail"></div></div>`;
 $('b23225CalPrev').onclick=()=>{calMonth.setMonth(calMonth.getMonth()-1);calSelected=calKey(new Date(calMonth.getFullYear(),calMonth.getMonth(),1));renderCalendar()};$('b23225CalNext').onclick=()=>{calMonth.setMonth(calMonth.getMonth()+1);calSelected=calKey(new Date(calMonth.getFullYear(),calMonth.getMonth(),1));renderCalendar()};$('b23225CalToday').onclick=()=>{calMonth=new Date(new Date().getFullYear(),new Date().getMonth(),1);calSelected=today();renderCalendar()};$('b23225CalRefresh').onclick=()=>calendarLoad();host.querySelectorAll('[data-cal-date]').forEach(b=>b.onclick=()=>{calSelected=b.dataset.calDate;renderCalendar()});
 const box=$('b23225CalDetail');box.innerHTML=`<div class="card"><h3>Detalle · ${esc(label)}</h3><div class="b23225-grid"><div><div class="b23225-section">INGRESOS</div><div class="b23225-row"><span>Recibidos reales</span><strong>${money(r.realIn)}</strong></div>${r.mov.filter(x=>inType(x.tipo)).map(x=>`<div class="b23225-row"><span>${esc(x.categoria||x.descripcion||'Ingreso')}</span><strong>${money(x.monto)}</strong></div>`).join('')||'<p class="muted">Sin ingresos reales.</p>'}<div class="b23225-row"><span>Proyectados</span><strong>${money(r.planIn)}</strong></div>${r.inc.map(x=>`<div class="b23225-row"><span>${esc(x.concepto||'Ingreso futuro')}</span><strong>${money(x.monto)}</strong></div>`).join('')}<div class="b23225-row"><span>Generación multifuente</span><strong>${money(r.generated)}</strong></div>${r.gen.map(x=>`<div class="b23225-row"><span>${esc(x.actividad||x.descripcion||'Generación')}<small>${esc(x.estado_cobro||'')}</small></span><strong>${money(x.monto_neto)}</strong></div>`).join('')}</div><div><div class="b23225-section">EGRESOS Y OBLIGACIONES</div><div class="b23225-row"><span>Gastos reales</span><strong>${money(r.realOut)}</strong></div>${r.exp.map(x=>`<div class="b23225-row"><span>${esc(x.concepto||x.categoria||'Gasto planificado')}</span><strong>${money(x.monto)}</strong></div>`).join('')}<div class="b23225-row"><span>Compromisos</span><strong>${money(r.commOut)}</strong></div>${r.comm.map(x=>`<div class="b23225-row"><span>${esc(x.concepto||'Compromiso')}</span><strong>${money(x.monto)}</strong></div>`).join('')}<div class="b23225-row"><span>Cuotas pendientes</span><strong>${money(r.debtOut)}</strong></div>${r.quota.filter(x=>!paid(x)).map(x=>`<div class="b23225-row"><span>Cuota ${esc(x.numero_cuota)}<small>${esc(x.estado||'pendiente')}</small></span><strong>${money(x.monto)}</strong></div>`).join('')}</div></div><div class="b23225-row"><span>Flujo proyectado del día</span><strong class="${r.flow>=0?'b23225-pos':'b23225-neg'}">${money(r.flow)}</strong></div><div class="b23225-row"><span>Saldo real acumulado</span><strong>${money(r.balance)}</strong></div><div class="b23225-row"><span>Saldo proyectado</span><strong>${money(r.projected)}</strong></div></div>`;
}
window.B232Calendario={version:'232.25',load:calendarLoad,render:renderCalendar};
/* ---------------- RESUMEN / MOTOR ANALÍTICO ---------------- */
async function refreshAnalysis(){
 try{
  if(window.FinancialSummary?.init){await window.FinancialSummary.init();return}
  if(window.ExecutiveDashboard?.refresh) await window.ExecutiveDashboard.refresh();
 }catch(e){console.warn('[B232.25] análisis',e)}
}
window.B23225RefreshAnalysis=refreshAnalysis;
async function refreshCurrent(){const id=navState();await refreshModule(id);if(id!=='dashboard' && window.FinancialSummary?.init){try{await window.FinancialSummary.init()}catch{}}setTab(id)}
window.B23225RefreshCurrent=refreshCurrent;
function install(){
 ensureStyle();
 const t=document.querySelector('.tabs');if(!t)return false;
 ['operaciones','planificacion','ingresos','jornadas'].forEach(id=>{if(!t.querySelector(`[data-tab="${id}"]`)){const b=document.createElement('button');b.type='button';b.dataset.tab=id;b.textContent=id==='ingresos'?'Motor Multifuente':id==='jornadas'?'Control de Jornada':id==='planificacion'?'Planificación':'Operaciones';t.appendChild(b)}});
 /* Un solo controlador de navegación. Siempre conserva la pestaña. */
 if(!t.dataset.b23225Nav){t.dataset.b23225Nav='1';document.addEventListener('click',e=>{const b=e.target.closest?.('.tabs button[data-tab]');if(!b)return;e.preventDefault();e.stopImmediatePropagation();const id=b.dataset.tab;setTab(id);refreshModule(id)},true)}
 /* Refresco manual global: conserva módulo. */
 let top=document.querySelector('.topbar');if(top&&!$('b23225GlobalRefresh')){const b=document.createElement('button');b.id='b23225GlobalRefresh';b.type='button';b.className='ghost';b.textContent='Actualizar datos';b.onclick=()=>refreshCurrent();top.appendChild(b)}
 /* Restaurar módulo activo después de todos los inyectores. */
 const restore=()=>{const id=navState();if($(id)){setTab(id);refreshModule(id)}};
 [900,1500,2500,4000].forEach(ms=>setTimeout(restore,ms));
 setTimeout(()=>{const id=navState();if(id==='calendario')calendarLoad();else if(id==='operaciones')renderOperations();else if(id==='planificacion')renderPlanning();},1200);
 return true;
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(install,900),{once:true});else setTimeout(install,900);
})();
