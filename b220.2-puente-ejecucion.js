/* B2.20.2 — puente de ejecución financiera
   Captura directamente las acciones de pago para evitar carreras entre módulos.
*/
(()=>{'use strict';
const client=()=>{const u=localStorage.getItem('sf_url'),k=localStorage.getItem('sf_key');return u&&k&&window.supabase?window.supabase.createClient(u,k,{auth:{persistSession:false,autoRefreshToken:false}}):null};
async function debtIdFromCard(card){const b=card?.querySelector('button[onclick*="editarDeuda23"]');const m=(b?.getAttribute('onclick')||'').match(/editarDeuda23\((\d+)\)/);return m?Number(m[1]):null}
async function runCard(btn){const card=btn.closest('.debt-card');const id=await debtIdFromCard(card);if(!id)return alert('No se pudo identificar la deuda.');if(btn.textContent.toLowerCase().includes('único')) return window.b220OpenSingle?window.b220OpenSingle(id):alert('Motor de ejecución no disponible.');return window.b220OpenNext?window.b220OpenNext(id):alert('Motor de ejecución no disponible.');}
async function runQuota(btn){const m=(btn.getAttribute('onclick')||'').match(/pagarCuota23\((\d+)\)/);if(!m)return alert('No se pudo identificar la cuota.');const qid=Number(m[1]);let did=Number(window.__b220SelectedDebt||0);if(!did){const name=document.querySelector('#deudaDetalle h2')?.textContent?.trim();const c=client();if(c&&name){const r=await c.from('deudas').select('id').eq('acreedor',name).limit(1).maybeSingle();did=Number(r.data?.id||0)}}if(!did)return alert('No se pudo identificar la deuda.');return window.b220OpenQuota?window.b220OpenQuota(did,qid):alert('Motor de ejecución no disponible.');}
function bind(){document.addEventListener('click',async e=>{const b=e.target.closest('button');if(!b)return;if(b.classList.contains('b220-pay')||b.classList.contains('b220i-pay')||/^(Pagar próxima cuota|Registrar pago único)$/i.test(b.textContent.trim())){e.preventDefault();e.stopImmediatePropagation();await runCard(b);return;}if(/^(Registrar pago|Pagar cuota)$/i.test(b.textContent.trim())&&b.closest('.quota-row')){e.preventDefault();e.stopImmediatePropagation();await runQuota(b);}},true);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});else bind();
})();
