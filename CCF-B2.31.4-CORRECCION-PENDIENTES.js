/* CCF B2.31.4 — Corrección definitiva del Resumen
   El KPI inferior "Pendientes" se calcula directamente desde el total
   del período para evitar una segunda consulta y cualquier discrepancia
   de fuentes/permisos.

   Identidad del modelo:
   Total gastos = Generados + Pendientes + Por realizar
   Pendientes = Total gastos - Generados - Por realizar
*/
(()=>{'use strict';
const money=n=>new Intl.NumberFormat('es-CL',{style:'currency',currency:'CLP',maximumFractionDigits:0}).format(Number(n)||0);
function parseMoney(v){return Number(String(v??'').replace(/[^0-9-]/g,''))||0}
function fix(){
  const host=document.getElementById('b234-report');
  if(!host)return false;
  const boxes=host.querySelectorAll('.b234-summary>div');
  if(boxes.length<4)return false;
  const total=parseMoney(boxes[0].querySelector('strong')?.textContent);
  const generated=parseMoney(boxes[1].querySelector('strong')?.textContent);
  const future=parseMoney(boxes[3].querySelector('strong')?.textContent);
  const pending=Math.max(0,total-generated-future);
  const pct=total?Math.round(pending/total*100):0;
  const strong=boxes[2].querySelector('strong');
  const smalls=boxes[2].querySelectorAll('small');
  if(strong)strong.textContent=money(pending);
  if(smalls.length)smalls[smalls.length-1].textContent=pct+'%';
  return true;
}
function install(){
  if(window.__CCF_B2314_PENDING__)return;
  window.__CCF_B2314_PENDING__=true;
  const run=()=>{try{fix()}catch(e){console.error('[CCF B2.31.4]',e)}};
  const dashboard=document.getElementById('dashboard');
  if(dashboard&&window.MutationObserver){
    const observer=new MutationObserver(run);
    observer.observe(dashboard,{childList:true,subtree:true});
  }
  document.addEventListener('click',e=>{
    if(e.target.closest('[data-tab="dashboard"]')||e.target.closest('#b234Refresh')){
      setTimeout(run,50);setTimeout(run,250);setTimeout(run,800);
    }
  },true);
  [100,500,1200,2500,5000,10000,20000].forEach(ms=>setTimeout(run,ms));
  run();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(install,300),{once:true});
else setTimeout(install,300);
})();
