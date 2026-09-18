/* FINANZAS B2.30 — DEUDA FLEXIBLE
   Permite registrar una deuda sin fecha de pago determinada.
   Sin fecha => situación "Pendiente — sin fecha".
   Fecha pasada => "Vencida".
   Fecha futura => "Pendiente".
   Cuando exista claridad económica, la deuda puede editarse y convertirse
   en un plan con fecha/cuotas; el historial de renegociaciones existente
   permanece disponible.
*/
(()=>{'use strict';
const $=id=>document.getElementById(id);
const today=()=>{const d=new Date();return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,10)};
const money=n=>new Intl.NumberFormat('es-CL',{style:'currency',currency:'CLP',maximumFractionDigits:0}).format(Number(n)||0);
let installed=false;

function injectStyles(){
 if($('b230Styles'))return;
 const s=document.createElement('style');s.id='b230Styles';s.textContent=`
 .b230-date-mode{grid-column:1/-1;padding:13px;border:1px solid #dbe3ee;border-radius:12px;background:#f8fafc}
 .b230-date-mode label{display:flex;align-items:center;gap:9px;font-weight:700}
 .b230-date-mode input[type=checkbox]{width:auto}
 .b230-help{margin:6px 0 0 25px;color:#64748b;font-size:12px}
 .b230-status{display:inline-flex;align-items:center;padding:4px 8px;border-radius:999px;font-size:11px;font-weight:700;background:#eef2f7;color:#334155}
 .b230-status.overdue{background:#fee2e2;color:#991b1b}
 .b230-status.pending{background:#fef3c7;color:#92400e}
 .b230-status.nodate{background:#e0e7ff;color:#3730a3}
 .b230-flex-note{margin:10px 0;padding:10px 12px;border-left:3px solid #64748b;background:#f8fafc;color:#475569;font-size:12px}
 `;
 document.head.appendChild(s);
}

function addDateMode(){
 const form=$('deudaForm');if(!form||$('b230DateMode'))return;
 const first=form.querySelector('#deudaInicio')?.closest('label');
 const mode=document.createElement('div');mode.id='b230DateMode';mode.className='b230-date-mode';
 mode.innerHTML=`<label><input type="checkbox" id="b230HasDate" checked> Esta deuda tiene fecha de pago determinada</label>
 <p class="b230-help">Desactívalo para registrar la deuda ahora sin fecha. Quedará pendiente hasta que exista un acuerdo o se defina una fecha.</p>`;
 (first||form.firstElementChild)?.insertAdjacentElement('beforebegin',mode);
 $('b230HasDate').addEventListener('change',syncDateFields);
 syncDateFields();
}

function syncDateFields(){
 const has=$('b230HasDate')?.checked!==false;
 ['deudaInicio','deudaPrimeraCuota'].forEach(id=>{
   const el=$(id);if(!el)return;
   el.disabled=!has;
   el.required=has;
   if(!has)el.value='';
 });
 const freq=$('deudaFrecuencia');if(freq){freq.disabled=!has;if(!has)freq.value='mensual'}
 const cuotas=$('deudaCuotas'),cuota=$('deudaCuota');
 if(cuotas){cuotas.disabled=!has;if(!has)cuotas.value=''}
 if(cuota){cuota.disabled=!has;if(!has)cuota.value=''}
 const submit=$('deudaSubmit');
 if(submit&&!$('deudaId').value)submit.textContent=has?'Registrar deuda y generar plan':'Registrar deuda sin fecha';
}

function statusFor(d){
 const date=d.proximo_vencimiento||d.fecha_proximo_pago||d.fecha_primera_cuota||null;
 if(!date)return {text:'Pendiente — sin fecha',cls:'nodate'};
 if(date<today())return {text:'Vencida',cls:'overdue'};
 return {text:'Pendiente',cls:'pending'};
}

function enhanceCards(){
 document.querySelectorAll('#deudasLista .debt-card').forEach(card=>{
   if(card.querySelector('.b230-status'))return;
   const meta=card.querySelector('.debt-card-meta');
   const text=meta?.textContent||'';
   const match=text.match(/Próximo:\\s*([^\\s]+)/);
   const date=match?.[1] && match[1]!=='—'?match[1]:null;
   const st=statusFor({proximo_vencimiento:date});
   const p=document.createElement('span');p.className='b230-status '+st.cls;p.textContent=st.text;
   card.querySelector('.debt-card-main')?.appendChild(p);
   if(!date){
     const note=document.createElement('div');note.className='b230-flex-note';
     note.textContent='Sin fecha de pago determinada. Puedes definirla posteriormente mediante renegociación o refinanciamiento.';
     card.appendChild(note);
   }
 });
}

function wrapSubmit(){
 const form=$('deudaForm');if(!form||form.dataset.b230)return;
 form.dataset.b230='1';
 form.addEventListener('submit',async e=>{
   const has=$('b230HasDate')?.checked!==false;
   if(has)return;
   e.preventDefault();e.stopImmediatePropagation();
   const c=await getDb();if(!c)return;
   const id=$('deudaId').value;
   const p={
    tipo_acreedor:$('deudaTipo').value,
    acreedor:$('deudaAcreedor').value.trim(),
    concepto:$('deudaConcepto').value.trim()||null,
    monto_original:Number($('deudaMonto').value||0),
    saldo_actual:Number($('deudaSaldo').value||0),
    tasa_anual:Number($('deudaTasa').value||0)||null,
    numero_cuotas:null,
    cuota_acordada:null,
    fecha_inicio:null,
    fecha_primera_cuota:null,
    fecha_proximo_pago:null,
    frecuencia:null,
    notas:$('deudaNotas').value.trim()||null,
    estado:'vigente'
   };
   if(!p.acreedor||p.saldo_actual<0){$('deudasMsg').textContent='Completa acreedor y saldo actual válido.';return}
   $('deudasMsg').textContent='Registrando deuda sin fecha…';
   const r=id?await c.from('deudas').update(p).eq('id',id):await c.from('deudas').insert(p);
   if(r.error){$('deudasMsg').textContent=r.error.message;return}
   $('deudasMsg').textContent=id?'Deuda actualizada sin fecha de pago.':'Deuda registrada como pendiente sin fecha de pago.';
   if(typeof window.resetDebt23==='function')window.resetDebt23();else{
     form.reset();$('deudaId').value='';$('deudaInicio').value='';$('deudaPrimeraCuota').value='';syncDateFields();
   }
   if(typeof window.loadDebts23==='function')await window.loadDebts23();
   else document.querySelector('[data-tab="deudas"]')?.click();
   setTimeout(enhanceCards,400);
 },true);
}

async function getDb(){
 const u=localStorage.getItem('sf_url'),k=localStorage.getItem('sf_key');
 return u&&k&&window.supabase?window.supabase.createClient(u,k):null;
}

function patchEdit(){
 const original=window.editarDeuda23;
 if(typeof original!=='function'||original.__b230)return;
}
function enhanceEditState(){
 const id=$('deudaId')?.value;
 if(!id||!$('b230HasDate'))return;
 // Si la edición carga fechas vacías, el modo flexible queda seleccionado.
 const has=!!($('deudaPrimeraCuota')?.value||$('deudaInicio')?.value);
 $('b230HasDate').checked=has;
 syncDateFields();
}
async function init(){
 if(installed)return;
 if(!$('deudaForm'))return;
 installed=true;injectStyles();addDateMode();wrapSubmit();
 setTimeout(enhanceCards,700);
 document.addEventListener('click',e=>{
   if(e.target.closest('#deudaSubmit'))setTimeout(enhanceEditState,150);
   if(e.target.closest('#deudasLista'))setTimeout(enhanceCards,200);
 },true);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(init,1000),{once:true});else setTimeout(init,1000);
})();