/* CCF B233.71 — Corrección quirúrgica de Pendientes / Por realizar
   No reemplaza B232.34 ni toca Supabase. Recalcula el informe visible desde
   las mismas fuentes, clasifica planificados vencidos como Pendientes y futuros
   como Por realizar, y evita duplicar obligaciones con la misma huella.
*/
(()=>{
'use strict';
if(window.__CCF_B23371_FIX__) return; window.__CCF_B23371_FIX__=true;
const money=n=>new Intl.NumberFormat('es-CL',{style:'currency',currency:'CLP',maximumFractionDigits:0}).format(Math.round(Number(n)||0));
const num=v=>Number(v??0)||0;
const today=()=>{const d=new Date();return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,10)};
const db=()=>window.supabaseClient||window.db||window.__db||null;
const dateOf=r=>String(r?.fecha??r?.fecha_vencimiento??r?.fecha_planificada??r?.fecha_generacion??'').slice(0,10);
const typeOf=r=>String(r?.tipo??r?.type??'').toLowerCase();
const catOf=r=>String(r?.categoria??r?.tipo_deuda??'Deudas').trim()||'Deudas';
async function q(p){try{const r=await p;return r?.error?[]:(r?.data||[])}catch(_){return []}}
function uniqObligations(C,Q){const out=[],seen=new Set();[...C,...Q].forEach(r=>{const id=String(r?.id??''),fp=[dateOf(r),catOf(r),String(r?.concepto??r?.descripcion??r?.nombre??''),String(num(r?.monto))].join('|'),key=id?'id:'+id:fp;if(seen.has(key))return;seen.add(key);out.push(r)});return out}
async function collect(){const c=db();if(!c)return null;const t=today(),month=t.slice(0,7),start=month+'-01';const d=new Date(t);d.setMonth(d.getMonth()+1);const end=new Date(d.getFullYear(),d.getMonth(),0).toISOString().slice(0,10);
 const [M,F,P,C,Q]=await Promise.all([
  q(c.from('movimientos').select('*').gte('fecha',start).lte('fecha',end)),
  q(c.from('ingresos_futuros').select('*').gte('fecha',start).lte('fecha',end)),
  q(c.from('gastos_planificados').select('*').gte('fecha',start).lte('fecha',end)),
  q(c.from('compromisos').select('*').eq('estado','pendiente').gte('fecha_vencimiento',start).lte('fecha_vencimiento',end)),
  q(c.from('cuotas_deuda').select('*').in('estado',['pendiente','vencida','atrasada']).gte('fecha_vencimiento',start).lte('fecha_vencimiento',end))
 ]);
 const generated=M.filter(r=>typeOf(r)==='gasto').reduce((s,r)=>s+num(r.monto),0);
 const pendingPlan=P.filter(r=>!dateOf(r)||dateOf(r)<=t), futurePlan=P.filter(r=>dateOf(r)>t);
 const obligations=uniqObligations(C,Q);
 const pending=obligations.reduce((s,r)=>s+num(r.monto),0)+pendingPlan.reduce((s,r)=>s+num(r.monto??r.valor),0);
 const future=futurePlan.reduce((s,r)=>s+num(r.monto??r.valor),0);
 const total=generated+pending+future;
 const cats={}; const add=(k,g,p,f)=>{k=String(k||'Otros').trim()||'Otros';cats[k]??={g:0,p:0,f:0};cats[k].g+=g;cats[k].p+=p;cats[k].f+=f};
 M.filter(r=>typeOf(r)==='gasto').forEach(r=>add(r.categoria,num(r.monto),0,0));
 pendingPlan.forEach(r=>add(r.categoria,0,num(r.monto??r.valor),0));
 futurePlan.forEach(r=>add(r.categoria,0,0,num(r.monto??r.valor)));
 obligations.forEach(r=>add(catOf(r),0,num(r.monto),0));
 return {total,generated,pending,future,cats};
}
function render(d){const host=document.getElementById('b234-report');if(!host)return false;
 const cards=host.querySelectorAll('.b234-cat');
 cards.forEach(card=>{const name=card.querySelector('h4')?.textContent?.trim();const v=d.cats[name];if(!v)return;const lines=card.querySelectorAll('.b234-line span:last-child');if(lines[0])lines[0].textContent=money(v.g);if(lines[1])lines[1].textContent=money(v.p);if(lines[2])lines[2].textContent=money(v.f);const strong=card.querySelector('strong');if(strong)strong.textContent=money(v.g+v.p+v.f)});
 const boxes=host.querySelectorAll('.b234-summary>div');if(boxes.length>=4){const vals=[d.total,d.generated,d.pending,d.future];vals.forEach((v,i)=>{const s=boxes[i]?.querySelector('strong');if(s)s.textContent=money(v);const sm=boxes[i]?.querySelectorAll('small');if(i>0&&sm?.length)sm[sm.length-1].textContent=(d.total?Math.round(v/d.total*100):0)+'%'});}
 return true;}
async function run(){try{const d=await collect();if(d)render(d)}catch(e){console.warn('[B233.71]',e)}}
function restoreUI(){
 const nav=document.querySelector('.tabs');
 if(nav && !document.querySelector('.ccf-manual-access')){
  const box=document.createElement('div');box.className='ccf-manual-access';box.setAttribute('aria-label','Ayuda y documentación del sistema');
  box.innerHTML='<a class=\"ccf-manual-button\" href=\"Manual_de_Usabilidad_CCF.pdf\" download=\"Manual_de_Usabilidad_CCF.pdf\" aria-label=\"Descargar manual de usabilidad\">Descargar manual de usabilidad</a>';
  box.style.cssText='display:flex;justify-content:flex-end;margin:8px 10px 14px';box.querySelector('a').style.cssText='display:inline-flex;align-items:center;justify-content:center;min-height:36px;padding:9px 14px;border-radius:9px;background:#172033;color:#fff;text-decoration:none;font:700 12px/1.2 system-ui,sans-serif';
  nav.parentNode.insertBefore(box,nav.nextSibling);
 }
 if(!document.getElementById('ccf-product-footer')){
  const f=document.createElement('footer');f.id='ccf-product-footer';f.setAttribute('aria-label','Producto desarrollado por Somos Software');f.style.cssText='margin:22px 10px 18px;padding:16px 10px;text-align:center;border-top:1px solid #e5e7eb;color:#334155;font:600 11px/1.4 system-ui,sans-serif';
  f.innerHTML='<div style=\"display:flex;flex-direction:column;align-items:center;gap:9px\"><img src=\"somos-software-logo.jpg\" alt=\"Somos Software · Innovación Digital\" style=\"display:block;width:min(260px,72vw);max-height:86px;object-fit:contain\"><strong>Producto desarrollado por Somos Software</strong></div>';
  document.body.appendChild(f);
 }
 ['b23245-observability-panel','b23246-maintenance-panel','b23247-mobile-ux-panel','b23248-qa-panel','b23249-security-panel','b23250-errors-panel'].forEach(id=>document.getElementById(id)?.remove());
}
function boot(){restoreUI();run();document.addEventListener('click',e=>{if(e.target.closest('[data-tab="dashboard"]')||e.target.closest('#b234Refresh'))setTimeout(run,400)},true);setTimeout(run,1000);setTimeout(run,2500);setTimeout(run,5000);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
