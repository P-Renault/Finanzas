/* B232.34 — RESUMEN INTEGRADO CONSERVADOR
   Preserva la vista ejecutiva existente y agrega el nuevo informe financiero
   como una capa de análisis. No reemplaza #dashboard ni elimina gráficos.
*/
(()=>{'use strict';
const VERSION='B232.34';
const $=id=>document.getElementById(id);
const money=n=>new Intl.NumberFormat('es-CL',{style:'currency',currency:'CLP',maximumFractionDigits:0}).format(Number(n)||0);
const num=n=>Number(n)||0;
const today=()=>{const d=new Date();return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,10)};
const ym=s=>String(s||'').slice(0,7);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const monthStart=v=>`${ym(v||today())}-01`;
const monthEnd=v=>{const [y,m]=ym(v||today()).split('-').map(Number);return new Date(y,m,0).toISOString().slice(0,10)};
const daysInMonth=v=>{const [y,m]=ym(v||today()).split('-').map(Number);return new Date(y,m,0).getDate()};
function db(){if(window.supabaseClient)return window.supabaseClient;const u=localStorage.getItem('sf_url'),k=localStorage.getItem('sf_key');if(u&&k&&window.supabase?.createClient){window.supabaseClient=window.supabase.createClient(u,k,{auth:{persistSession:false,autoRefreshToken:false}});return window.supabaseClient}return null}
async function q(p){try{const r=await p;return {data:r?.data||[],error:r?.error||null}}catch(e){return {data:[],error:e}}}
function styles(){if($('b23234style'))return;const s=document.createElement('style');s.id='b23234style';s.textContent=`
.b234-report{margin:18px 0 22px;font-family:inherit;color:inherit}.b234-head{display:flex;justify-content:space-between;align-items:flex-end;gap:14px;margin-bottom:12px}.b234-head h2{margin:3px 0 4px;font-size:24px}.b234-head p{margin:0;color:#64748b;font-size:13px}.b234-actions{display:flex;gap:8px;align-items:center;flex-wrap:wrap}.b234-actions select,.b234-actions button{border:1px solid #dbe2ea;border-radius:10px;padding:9px 11px;background:#fff;font:inherit;font-weight:700}.b234-actions button{background:#111827;color:#fff}.b234-kpis{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:14px}.b234-kpi{border:1px solid #e5e7eb;border-radius:14px;background:#fff;padding:14px;box-shadow:0 2px 8px rgba(15,23,42,.035)}.b234-kpi span{display:block;color:#64748b;font-size:11px}.b234-kpi strong{display:block;font-size:22px;margin-top:5px}.b234-kpi small{display:block;color:#64748b;margin-top:3px}.b234-card{border:1px solid #e5e7eb;border-radius:16px;background:#fff;padding:16px;margin-bottom:14px;box-shadow:0 2px 8px rgba(15,23,42,.035)}.b234-title{display:flex;justify-content:space-between;gap:10px;align-items:flex-start}.b234-title h3{margin:0 0 3px}.b234-title p{margin:0;color:#64748b;font-size:12px}.b234-chart-wrap{overflow-x:auto}.b234-svg{width:100%;min-width:720px;height:300px;display:block}.b234-legend{display:flex;gap:18px;flex-wrap:wrap;margin-top:7px;font-size:12px;color:#475569}.b234-dot{display:inline-block;width:10px;height:10px;border-radius:50%;margin-right:6px}.b234-green{background:#16a34a}.b234-red{background:#ef4444}.b234-gray{background:#94a3b8}.b234-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}.b234-cat{border:1px solid #e5e7eb;border-radius:14px;padding:12px;background:#fff}.b234-cat h4{margin:0 0 6px;font-size:14px}.b234-cat strong{font-size:19px}.b234-line{display:flex;justify-content:space-between;padding-top:5px;font-size:12px;color:#475569}.b234-summary{display:grid;grid-template-columns:1.35fr 1fr 1fr 1fr;gap:0;border-radius:14px;background:#fff1f2;border:1px solid #fee2e2;overflow:hidden}.b234-summary>div{padding:15px;border-right:1px solid #fecdd3}.b234-summary>div:last-child{border-right:0}.b234-summary strong{display:block;font-size:23px;margin-top:3px}.b234-summary small{color:#64748b}.b234-final{display:grid;grid-template-columns:1.1fr 1fr;gap:14px}.b234-bars{display:grid;gap:12px;margin-top:12px}.b234-bar-row{display:grid;grid-template-columns:135px 1fr 105px;align-items:center;gap:8px;font-size:13px}.b234-track{height:16px;border-radius:999px;background:#e5e7eb;overflow:hidden}.b234-bar-income{height:100%;background:#16a34a}.b234-bar-expense{height:100%;background:#ef4444}.b234-result{border-radius:16px;padding:22px;background:#ecfdf5;border:1px solid #bbf7d0}.b234-result.negative{background:#fff7ed;border-color:#fed7aa}.b234-result small{color:#166534}.b234-result.negative small{color:#9a3412}.b234-result strong{display:block;font-size:32px;color:#166534;margin:6px 0}.b234-result.negative strong{color:#b91c1c}.b234-result b{display:block}.b234-status{padding:10px 12px;border-radius:10px;background:#f8fafc;color:#475569;margin-top:10px;font-size:11px}.b234-error{background:#fff7ed;color:#9a3412}.b234-updated{font-size:11px;color:#64748b;margin-top:8px}@media(max-width:760px){.b234-head{align-items:stretch;flex-direction:column}.b234-kpis{grid-template-columns:1fr}.b234-grid{grid-template-columns:1fr 1fr}.b234-summary{grid-template-columns:1fr 1fr}.b234-summary>div:nth-child(2){border-right:0}.b234-summary>div{border-bottom:1px solid #fecdd3}.b234-final{grid-template-columns:1fr}.b234-bar-row{grid-template-columns:105px 1fr 90px}}
`;document.head.appendChild(s)}
function svgEl(tag,a){const e=document.createElementNS('http://www.w3.org/2000/svg',tag);Object.entries(a).forEach(([k,v])=>e.setAttribute(k,v));return e}
function renderDaily(days){const W=900,H=300,L=52,R=18,T=22,B=42;const s=svgEl('svg',{viewBox:`0 0 ${W} ${H}`,class:'b234-svg'});const max=Math.max(1,...days.map(d=>Math.max(d.in,d.out)));for(let i=0;i<=5;i++){const y=H-B-i*(H-T-B)/5;s.appendChild(svgEl('line',{x1:L,x2:W-R,y1:y,y2:y,stroke:'#e5e7eb'}));const t=svgEl('text',{x:5,y:y+4,fill:'#64748b','font-size':'11'});t.textContent=money(max*i/5);s.appendChild(t)}const step=(W-L-R)/Math.max(1,days.length-1);days.forEach((d,i)=>{const x=L+i*step;const hi=d.in/max*(H-T-B),ho=d.out/max*(H-T-B);if(d.in>0)s.appendChild(svgEl('line',{x1:x-4,x2:x-4,y1:H-B-hi,y2:H-B,stroke:'#16a34a','stroke-width':'8','stroke-linecap':'round'}));if(d.out>0)s.appendChild(svgEl('line',{x1:x+4,x2:x+4,y1:H-B-ho,y2:H-B,stroke:'#ef4444','stroke-width':'8','stroke-linecap':'round'}));if(i%Math.max(1,Math.ceil(days.length/15))===0){const t=svgEl('text',{x:x-9,y:H-15,fill:'#64748b','font-size':'10'});t.textContent=d.date.slice(8);s.appendChild(t)}});return s}
async function collect(month){const c=db();if(!c)return null;const start=monthStart(month),end=monthEnd(month);const [mov,future,planned,comm,quotas,debt,banks,close,budgetLines]=await Promise.all([
 q(c.from('movimientos').select('*').gte('fecha',start).lte('fecha',end)),
 q(c.from('ingresos_futuros').select('*').gte('fecha',start).lte('fecha',end)),
 q(c.from('gastos_planificados').select('*').gte('fecha',start).lte('fecha',end)),
 q(c.from('compromisos').select('*').eq('estado','pendiente').gte('fecha_vencimiento',start).lte('fecha_vencimiento',end)),
 q(c.from('cuotas_deuda').select('*').in('estado',['pendiente','vencida','atrasada']).gte('fecha_vencimiento',start).lte('fecha_vencimiento',end)),
 q(c.from('v_deudas_resumen').select('*')),
 q(c.from('cuentas_bancarias').select('saldo_actual').eq('activa',true)),
 q(c.from('cierres_financieros').select('saldo_efectivo_actual,saldo_inicial,fecha_corte').eq('activo',true).order('fecha_corte',{ascending:false}).limit(1)),
 q(c.from('presupuesto_lineas').select('*').order('categoria'))
]);
 const M=mov.data, F=future.data, P=planned.data, C=comm.data, Q=quotas.data;
 const income=M.filter(x=>String(x.tipo||'').toLowerCase()==='ingreso').reduce((s,x)=>s+num(x.monto),0);
 const expense=M.filter(x=>String(x.tipo||'').toLowerCase()==='gasto').reduce((s,x)=>s+num(x.monto),0);
 const futureIncome=F.reduce((s,x)=>s+num(x.monto??x.monto_neto??x.valor),0);
 const plannedExpense=P.reduce((s,x)=>s+num(x.monto??x.valor),0);
 const commitments=C.reduce((s,x)=>s+num(x.monto),0);
 const quotaTotal=Q.reduce((s,x)=>s+num(x.monto),0);
 const pendingDebt=debt.data.filter(d=>!['pagada','cancelada','cerrada','liquidada'].includes(String(d.estado||'').toLowerCase())).reduce((s,d)=>s+num(d.saldo_actual??d.saldo_pendiente??d.saldo),0);
 const bank=banks.data.reduce((s,x)=>s+num(x.saldo_actual),0), cash=num(close.data[0]?.saldo_efectivo_actual??close.data[0]?.saldo_inicial), liquidity=cash+bank;
 const budgetExpense=budgetLines.data.filter(x=>String(x.tipo||'').toUpperCase()==='EGRESO').reduce((s,x)=>s+num(x.monto_plan),0);
 const budgetIncome=budgetLines.data.filter(x=>String(x.tipo||'').toUpperCase()==='INGRESO').reduce((s,x)=>s+num(x.monto_plan),0);
 const totalIncome=income+futureIncome; const totalExpense=expense+plannedExpense+commitments+quotaTotal; const projected=liquidity+totalIncome-totalExpense;
 const cats={};const add=(cat,real,pending,fut)=>{const k=String(cat||'Otros').trim()||'Otros';cats[k]??={real:0,pending:0,future:0};cats[k].real+=real;cats[k].pending+=pending;cats[k].future+=fut};
 M.filter(x=>String(x.tipo||'').toLowerCase()==='gasto').forEach(x=>add(x.categoria,num(x.monto),0,0));
 P.forEach(x=>add(x.categoria,0,0,num(x.monto??x.valor)));
 C.forEach(x=>add(x.categoria||'Compromisos',0,num(x.monto),0));
 Q.forEach(x=>add('Deudas',0,num(x.monto),0));
 const catItems=Object.entries(cats).map(([name,v])=>({name,...v,total:v.real+v.pending+v.future})).sort((a,b)=>b.total-a.total).slice(0,8);
 const days=[];for(let i=1;i<=daysInMonth(month);i++){const ds=`${ym(month)}-${String(i).padStart(2,'0')}`;const ii=M.filter(x=>x.fecha===ds&&String(x.tipo||'').toLowerCase()==='ingreso').reduce((s,x)=>s+num(x.monto),0)+F.filter(x=>(x.fecha??x.fecha_generacion)===ds).reduce((s,x)=>s+num(x.monto??x.monto_neto??x.valor),0);const oo=M.filter(x=>x.fecha===ds&&String(x.tipo||'').toLowerCase()==='gasto').reduce((s,x)=>s+num(x.monto),0)+P.filter(x=>(x.fecha??x.fecha_planificada)===ds).reduce((s,x)=>s+num(x.monto??x.valor),0)+C.filter(x=>x.fecha_vencimiento===ds).reduce((s,x)=>s+num(x.monto),0)+Q.filter(x=>x.fecha_vencimiento===ds).reduce((s,x)=>s+num(x.monto),0);days.push({date:ds,in:ii,out:oo})}
 return {errors:[['movimientos',mov],['ingresos futuros',future],['gastos planificados',planned],['compromisos',comm],['cuotas',quotas],['deudas',debt],['cuentas',banks],['cierre',close],['presupuesto',budgetLines]].filter(x=>x[1].error),liquidity,income,futureIncome,totalIncome,expense,plannedExpense,commitments,quotas,totalExpense,projected,pendingDebt,budgetExpense,budgetIncome,catItems,days};}
function build(data,month){const host=$('dashboard'),old=$('b234-report');if(!host||!data)return;if(old)old.remove();const label=new Date(month+'-01T12:00:00').toLocaleDateString('es-CL',{month:'long',year:'numeric'}).replace(/^./,x=>x.toUpperCase());const total=data.totalExpense||0;const gen=data.expense||0;const pending=data.commitments+data.quotas;const future=data.plannedExpense;const pGen=total?Math.round(gen/total*100):0,pPend=total?Math.round(pending/total*100):0,pFuture=total?Math.round(future/total*100):0;const section=document.createElement('section');section.id='b234-report';section.className='b234-report';section.innerHTML=`<div class=\"b234-head\"><div><p class=\"eyebrow\">INFORME FINANCIERO · RESUMEN</p><h2>Resumen financiero</h2><p>Vista integrada del período: ejecutado, comprometido, futuro y presupuestado.</p></div><div class=\"b234-actions\"><select id=\"b234Month\"><option value=\"${month}\">${label}</option></select><button id=\"b234Refresh\">↻ Actualizar datos</button></div></div><div class=\"b234-kpis\"><article class=\"b234-kpi\"><span>Liquidez inicial</span><strong>${money(data.liquidity)}</strong><small>Efectivo + cuentas controladas</small></article><article class=\"b234-kpi\"><span>Ingresos del período</span><strong>${money(data.totalIncome)}</strong><small>Movimientos reales + ingresos futuros</small></article><article class=\"b234-kpi\"><span>Gastos del período</span><strong>${money(total)}</strong><small>Realizados + cuotas + compromisos + planificación</small></article></div><section class=\"b234-card\"><div class=\"b234-title\"><div><h3>Gastos e ingresos del período</h3><p>Gráfico diario ejecutivo. Verde = ingresos; rojo = gastos. La planificación y obligaciones se incorporan al flujo.</p></div><strong>${label}</strong></div><div class=\"b234-chart-wrap\" id=\"b234Chart\"></div><div class=\"b234-legend\"><span><i class=\"b234-dot b234-green\"></i>Total de ingresos</span><span><i class=\"b234-dot b234-red\"></i>Sumatoria de gastos</span><span><i class=\"b234-dot b234-gray\"></i>Componentes futuros / planificados</span></div></section><section class=\"b234-grid\">${data.catItems.map(c=>`<article class=\"b234-cat\"><h4>${esc(c.name)}</h4><strong>${money(c.total)}</strong><div class=\"b234-line\"><span><i class=\"b234-dot b234-green\"></i>Generado</span><span>${money(c.real)}</span></div><div class=\"b234-line\"><span><i class=\"b234-dot b234-red\"></i>Pendiente</span><span>${money(c.pending)}</span></div><div class=\"b234-line\"><span><i class=\"b234-dot b234-gray\"></i>Por realizar</span><span>${money(c.future)}</span></div></article>`).join('')}</section><section class=\"b234-summary\"><div><small>Total de gastos</small><strong>${money(total)}</strong></div><div><small><i class=\"b234-dot b234-green\"></i>Generados</small><strong>${money(gen)}</strong><small>${pGen}%</small></div><div><small><i class=\"b234-dot b234-red\"></i>Pendientes</small><strong>${money(pending)}</strong><small>${pPend}%</small></div><div><small><i class=\"b234-dot b234-gray\"></i>Por realizar</small><strong>${money(future)}</strong><small>${pFuture}%</small></div></section><section class=\"b234-card\"><div class=\"b234-title\"><div><h3>Ingresos vs Gastos del mes</h3><p>Comparación consolidada: reales + futuros + obligaciones + planificación.</p></div></div><div class=\"b234-final\"><div class=\"b234-bars\"><div class=\"b234-bar-row\"><b>Ingresos totales</b><div class=\"b234-track\"><div class=\"b234-bar-income\" style=\"width:${data.totalIncome?100:0}%\"></div></div><strong>${money(data.totalIncome)}</strong></div><div class=\"b234-bar-row\"><b>Gastos totales</b><div class=\"b234-track\"><div class=\"b234-bar-expense\" style=\"width:${data.totalIncome?Math.min(100,total/data.totalIncome*100):0}%\"></div></div><strong>${money(total)}</strong></div><div class=\"b234-bar-row\"><b>Presupuesto egresos</b><div class=\"b234-track\"><div class=\"b234-bar-expense\" style=\"opacity:.35;width:${data.totalIncome?Math.min(100,data.budgetExpense/data.totalIncome*100):0}%\"></div></div><strong>${money(data.budgetExpense)}</strong></div></div><div class=\"b234-result ${data.projected<0?'negative':''}\"><small>Resultado del mes (proyección)</small><strong>${money(data.projected)}</strong><b>${data.projected>=0?'Superávit proyectado':'Déficit proyectado'}</b><p>Liquidez inicial + ingresos del período − gastos, cuotas, compromisos y planificación.</p></div></div></section><div class=\"b234-status\">Presupuesto egresos: ${money(data.budgetExpense)} · Presupuesto ingresos: ${money(data.budgetIncome)} · Deuda pendiente estructurada: ${money(data.pendingDebt)}${data.errors.length?`<div class=\"b234-error\" style=\"margin-top:8px\">Fuentes con lectura no disponible: ${data.errors.map(x=>esc(x[0])).join(', ')}. Los totales no se inventan ni se sustituyen silenciosamente.</div>`:''}<div class=\"b234-updated\">Actualizado ${new Date().toLocaleTimeString('es-CL',{hour:'2-digit',minute:'2-digit'})}</div></div>`;host.insertBefore(section,host.firstElementChild);
$('b234Chart').appendChild(renderDaily(data.days));
$('b234Refresh').onclick=render;

/* El resumen B234 es propiedad de B232.34.
   Otros módulos históricos intentan reescribir esta misma tarjeta después
   de renderizar. Conservamos sus funciones en otros módulos, pero impedimos
   que puedan corromper los cuatro valores consolidados de este informe. */
const summary=section.querySelector('.b234-summary');
if(summary){
  const authoritative={
    total:total,
    generated:gen,
    pending:pending,
    future:future
  };
  const applySummary=()=>{
    const strong=summary.querySelectorAll('div strong');
    const small=summary.querySelectorAll('div small:last-child');
    if(strong.length<4)return;
    const values=[authoritative.total,authoritative.generated,authoritative.pending,authoritative.future];
    values.forEach((value,i)=>{
      const text=money(value);
      if(strong[i].textContent!==text)strong[i].textContent=text;
    });
    const percentages=[
      authoritative.total?Math.round(authoritative.generated/authoritative.total*100):0,
      authoritative.total?Math.round(authoritative.pending/authoritative.total*100):0,
      authoritative.total?Math.round(authoritative.future/authoritative.total*100):0
    ];
    percentages.forEach((value,i)=>{
      if(small[i] && small[i].textContent!==`${value}%`)small[i].textContent=`${value}%`;
    });
  };
  applySummary();
  const observer=new MutationObserver(applySummary);
  observer.observe(summary,{subtree:true,childList:true,characterData:true});
  section._b234SummaryObserver=observer;
}
}
async function render(){const host=$('dashboard');if(!host||host.classList.contains('hidden'))return;const c=db();if(!c)return;styles();const month=ym($('b234Month')?.value||today());try{const data=await collect(month);if(data)build(data,month)}catch(e){console.error('[B232.34]',e)}}
function install(){styles();const host=$('dashboard');if(!host)return;document.addEventListener('click',e=>{if(e.target.closest('[data-tab="dashboard"]'))setTimeout(render,160)},true);let timer=setInterval(()=>{if(document.querySelector('[data-tab="dashboard"].active'))render()},1500);render();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(install,350),{once:true});else setTimeout(install,350);
window.B23234Resumen={version:VERSION,refresh:render,init:render};
})();