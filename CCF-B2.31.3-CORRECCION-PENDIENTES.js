/* CCF B2.31.3 — Corrección Resumen: Pendientes
   Corrige el KPI inferior del Resumen sin alterar la lógica existente.
   El bug era que B232.34 calculaba data.quotaTotal aunque collect() devuelve data.quotas.
*/
(()=>{'use strict';
const money=n=>new Intl.NumberFormat('es-CL',{style:'currency',currency:'CLP',maximumFractionDigits:0}).format(Number(n)||0);
const ym=s=>String(s||'').slice(0,7);
const today=()=>{const d=new Date();return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,10)};
function db(){return window.supabaseClient||window.db||window.__db||null}
async function fix(){
  const c=db();
  const host=document.getElementById('b234-report');
  if(!c||!host)return;
  const month=ym(document.getElementById('b234Month')?.value||today());
  const [y,m]=month.split('-').map(Number);
  const end=new Date(y,m,0).toISOString().slice(0,10);
  const start=`${month}-01`;
  const [comm,quotas]=await Promise.all([
    c.from('compromisos').select('monto').eq('estado','pendiente').gte('fecha_vencimiento',start).lte('fecha_vencimiento',end),
    c.from('cuotas_deuda').select('monto').in('estado',['pendiente','vencida','atrasada']).gte('fecha_vencimiento',start).lte('fecha_vencimiento',end)
  ]);
  if(comm.error||quotas.error)return;
  const pending=(comm.data||[]).reduce((s,r)=>s+(Number(r.monto)||0),0)+(quotas.data||[]).reduce((s,r)=>s+(Number(r.monto)||0),0);
  const boxes=host.querySelectorAll('.b234-summary>div');
  if(boxes.length<4)return;
  const total=Number(String(boxes[0].querySelector('strong')?.textContent||'').replace(/[^0-9-]/g,''))||0;
  const pct=total?Math.round(pending/total*100):0;
  const strong=boxes[2].querySelector('strong');
  const smalls=boxes[2].querySelectorAll('small');
  if(strong)strong.textContent=money(pending);
  if(smalls.length)smalls[smalls.length-1].textContent=pct+'%';
}
function install(){
  if(window.__CCF_B2313_PENDING__)return;
  window.__CCF_B2313_PENDING__=true;
  let wrapped=false;
  const timer=setInterval(()=>{
    if(!wrapped&&window.B23234Resumen&&typeof window.B23234Resumen.refresh==='function'){
      const original=window.B23234Resumen.refresh;
      window.B23234Resumen.refresh=async function(){const r=await original.apply(this,arguments);setTimeout(fix,0);return r};
      wrapped=true;clearInterval(timer);setTimeout(fix,100);
    }
  },250);
  setTimeout(()=>clearInterval(timer),30000);
  document.addEventListener('click',e=>{if(e.target.closest('[data-tab="dashboard"]'))setTimeout(fix,300)},true);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(install,500),{once:true});else setTimeout(install,500);
})();
