/* B2.20.1 — Integración robusta del Motor de Ejecución Financiera.
   Se carga después del módulo legacy de Deudas y conecta sus acciones reales.
   No usa MutationObserver sobre document.body: observa únicamente #deudas.
*/
(()=>{'use strict';
 const $=id=>document.getElementById(id);
 function wireCards(){
   const root=$('deudas'); if(!root)return;
   root.querySelectorAll('.debt-card').forEach(card=>{
     const actions=card.querySelector('.form-actions'); if(!actions)return;
     const edit=card.querySelector('button[onclick*="editarDeuda23"]');
     if(!edit || actions.querySelector('.b220i-pay'))return;
     const m=(edit.getAttribute('onclick')||'').match(/editarDeuda23\((\d+)\)/); if(!m)return;
     const id=Number(m[1]);
     const zero=/0 cuotas pendientes/i.test(card.textContent||'');
     const b=document.createElement('button'); b.type='button'; b.className='b220i-pay';
     b.textContent=zero?'Registrar pago único':'Pagar próxima cuota';
     b.onclick=()=>zero?window.b220OpenSingle?.(id):window.b220OpenNext?.(id);
     actions.appendChild(b);
   });
 }
 function wireDetail(){
   const root=$('deudaDetalle'); if(!root)return;
   root.querySelectorAll('button[onclick*="pagarCuota23"]').forEach(b=>{
     if(b.dataset.b220i==='1')return;
     const m=(b.getAttribute('onclick')||'').match(/pagarCuota23\((\d+)\)/); if(!m)return;
     const qid=Number(m[1]); b.dataset.b220i='1'; b.onclick=()=>{
       const d=document.querySelector('#deudaDetalle h2')?.textContent?.trim();
       if(window.b220OpenQuota && window.__b220SelectedDebt){ window.b220OpenQuota(Number(window.__b220SelectedDebt),qid); return; }
       if(window.b220OpenNextByName&&d)window.b220OpenNextByName(d,qid);
     };
   });
   const title=root.querySelector('h2')?.textContent?.trim();
   if(title && !root.querySelector('.b220i-single-detail')){
     const text=(root.textContent||'');
     const hasBalance=/Saldo actual/.test(text);
     const hasPending=/pendiente|No hay cuotas generadas|No existe todavía un plan/i.test(text);
     if(hasBalance && hasPending && window.b220OpenSingle){
       const actions=root.querySelector('.detail-actions');
       if(actions){
         const b=document.createElement('button'); b.type='button'; b.className='b220i-single-detail'; b.textContent='Registrar pago único';
         b.onclick=async()=>{ const c=window.b220OpenSingle; const r=await fetchDebtId(title); if(r)c(r); };
         actions.appendChild(b);
       }
     }
   }
 }
 async function fetchDebtId(name){
   const u=localStorage.getItem('sf_url'),k=localStorage.getItem('sf_key'); if(!u||!k||!window.supabase)return null;
   const c=window.supabase.createClient(u,k,{auth:{persistSession:false,autoRefreshToken:false}});
   const r=await c.from('deudas').select('id').eq('acreedor',name).limit(1).maybeSingle(); return r.error?null:r.data?.id||null;
 }
 function init(){
   wireCards();wireDetail();
   const root=$('deudas'); if(root){ const obs=new MutationObserver(()=>{wireCards();wireDetail()}); obs.observe(root,{childList:true,subtree:true}); }
   const old=window.verDeuda23;
   if(old&&!old.__b220i){ const wrapped=async function(...args){const r=await old.apply(this,args); setTimeout(wireDetail,50); return r}; wrapped.__b220i=true; window.verDeuda23=wrapped; }
   window.b220OpenNext=async id=>{ if(window.b220OpenQuota){ const u=localStorage.getItem('sf_url'),k=localStorage.getItem('sf_key'); if(!u||!k)return; const c=window.supabase.createClient(u,k,{auth:{persistSession:false,autoRefreshToken:false}}); const q=await c.from('cuotas_deuda').select('id').eq('deuda_id',id).in('estado',['pendiente','vencida']).order('numero_cuota').limit(1).maybeSingle(); if(q.data) return window.b220OpenQuota(id,q.data.id); } if(window.b220OpenSingle)return window.b220OpenSingle(id); };
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(init,1000),{once:true});else setTimeout(init,1000);
})();
