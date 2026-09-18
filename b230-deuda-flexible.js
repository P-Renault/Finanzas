/* FINANZAS B2.30 — DEUDA FLEXIBLE — DESPLIEGUE CORRECTO
   Se integra con finanzas-v233.js sin reemplazar su lógica existente.
   El módulo espera a que Deudas sea inyectado dinámicamente y reemplaza
   el handler de submit solamente para la modalidad "sin fecha".
*/
(()=>{'use strict';
const $=id=>document.getElementById(id);
const today=()=>{const d=new Date();return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,10)};
const money=n=>new Intl.NumberFormat('es-CL',{style:'currency',currency:'CLP',maximumFractionDigits:0}).format(Number(n)||0);
let lastForm=null;

function style(){
 if($('b230Style'))return;
 const s=document.createElement('style');s.id='b230Style';s.textContent=`
 #b230Mode{grid-column:1/-1;border:2px solid #cbd5e1;border-radius:14px;padding:14px;background:#f8fafc;margin:3px 0}
 #b230Mode h3{margin:0 0 5px;font-size:15px}
 #b230Mode>p{margin:0 0 11px;color:#64748b;font-size:12px}
 .b230Choices{display:grid;grid-template-columns:1fr 1fr;gap:10px}
 .b230Choice{display:flex;gap:9px;align-items:flex-start;border:1px solid #dbe3ee;border-radius:11px;padding:11px;background:#fff;cursor:pointer}
 .b230Choice input{width:auto;margin-top:2px}
 .b230Choice small{display:block;color:#64748b;margin-top:3px}
 #b230Info{display:none;margin-top:10px;padding:10px 12px;border-left:4px solid #4f46e5;background:#eef2ff;border-radius:8px;color:#3730a3;font-size:12px}
 #b230Info.show{display:block}
 .b230Disabled{opacity:.45}
 .b230Badge{display:inline-block;margin:6px 0 0 0;padding:4px 8px;border-radius:999px;background:#e0e7ff;color:#3730a3;font-size:10px;font-weight:800}
 .b230Reneg{margin-top:8px!important;background:#334155!important}
 @media(max-width:650px){.b230Choices{grid-template-columns:1fr}}
 `;
 document.head.appendChild(s);
}

function db(){
 const u=localStorage.getItem('sf_url'),k=localStorage.getItem('sf_key');
 return u&&k&&window.supabase?window.supabase.createClient(u,k):null;
}

function isFlexible(){
 return document.querySelector('input[name="b230Mode"]:checked')?.value==='flexible';
}

function install(form){
 if(!form||form.dataset.b230Installed==='1')return;
 style();
 const box=document.createElement('div');
 box.id='b230Mode';
 box.innerHTML=`
 <h3>Situación de pago</h3>
 <p>Indica si la deuda ya tiene un acuerdo de pago o si primero quieres registrarla y definir el pago posteriormente.</p>
 <div class="b230Choices">
  <label class="b230Choice"><input type="radio" name="b230Mode" value="defined" checked>
   <span><b>Fecha determinada</b><small>Permite generar el plan de cuotas.</small></span>
  </label>
  <label class="b230Choice"><input type="radio" name="b230Mode" value="flexible">
   <span><b>Sin fecha determinada</b><small>Registra la obligación sin vencimiento ni cuotas.</small></span>
  </label>
 </div>
 <div id="b230Info"><b>DEUDA FLEXIBLE</b><br>Quedará como <b>PENDIENTE · SIN FECHA</b>. No se generará calendario de cuotas. Posteriormente podrás editarla para renegociar o refinanciar.</div>`;
 const target=form.querySelector('#deudaInicio')?.closest('label');
 (target||form.firstElementChild).insertAdjacentElement('beforebegin',box);
 box.querySelectorAll('input[name="b230Mode"]').forEach(x=>x.addEventListener('change',sync));
 form.dataset.b230Installed='1';

 // Preserve the native handler created by finanzas-v233.
 const nativeHandler=form.onsubmit;
 form.onsubmit=async function(e){
   if(!isFlexible()){
     if(typeof nativeHandler==='function') return nativeHandler.call(this,e);
     return true;
   }
   e.preventDefault();
   e.stopImmediatePropagation();
   await saveFlexible(form);
   return false;
 };
 lastForm=form;
 sync();
}

function sync(){
 const f=$('deudaForm');if(!f)return;
 const flex=isFlexible();
 $('b230Info')?.classList.toggle('show',flex);
 ['deudaInicio','deudaPrimeraCuota','deudaCuotas','deudaCuota','deudaFrecuencia'].forEach(id=>{
   const el=$(id);if(!el)return;
   el.disabled=flex;
   el.closest('label')?.classList.toggle('b230Disabled',flex);
   if(flex&&['deudaInicio','deudaPrimeraCuota','deudaCuotas','deudaCuota'].includes(id))el.value='';
 });
 const b=$('deudaSubmit');
 if(b&&!$('deudaId')?.value)b.textContent=flex?'Registrar deuda sin fecha':'Registrar deuda y generar plan';
}

async function saveFlexible(form){
 const c=db();
 if(!c){$('deudasMsg').textContent='Conecta Supabase para registrar la deuda.';return}
 const p={
  tipo_acreedor:$('deudaTipo')?.value||'Otro',
  acreedor:$('deudaAcreedor')?.value.trim()||'',
  concepto:$('deudaConcepto')?.value.trim()||null,
  monto_original:Number($('deudaMonto')?.value||0),
  saldo_actual:Number($('deudaSaldo')?.value||0),
  tasa_anual:Number($('deudaTasa')?.value||0)||null,
  numero_cuotas:null,
  cuota_acordada:null,
  fecha_inicio:null,
  fecha_primera_cuota:null,
  frecuencia:null,
  fecha_proximo_pago:null,
  notas:$('deudaNotas')?.value.trim()||null,
  estado:'vigente',
  fecha_pago_determinada:false
 };
 if(!p.acreedor||p.monto_original<=0||p.saldo_actual<0){
   $('deudasMsg').textContent='Completa acreedor, monto original y saldo actual válido.';
   return;
 }
 $('deudasMsg').textContent='Registrando deuda sin fecha determinada…';
 const id=$('deudaId')?.value;
 let r=id?await c.from('deudas').update(p).eq('id',id):await c.from('deudas').insert(p);
 if(r.error){$('deudasMsg').textContent=r.error.message;return}
 $('deudasMsg').textContent=id?'Deuda actualizada sin fecha de pago.':'Deuda registrada como pendiente sin fecha de pago.';
 if(typeof window.resetDebt23==='function')window.resetDebt23();
 else{
   form.reset();
   if($('deudaId'))$('deudaId').value='';
 }
 setTimeout(sync,100);
 if(typeof window.loadDebts23==='function')await window.loadDebts23();
 else{
   document.querySelector('[data-tab="deudas"]')?.click();
 }
}

function enhanceCards(){
 const list=$('deudasLista');if(!list)return;
 list.querySelectorAll('.debt-card').forEach(card=>{
   if(card.querySelector('.b230Badge'))return;
   const meta=card.querySelector('.debt-card-meta')?.textContent||'';
   const m=meta.match(/Próximo:\s*([0-9]{4}-[0-9]{2}-[0-9]{2}|—)/);
   const date=m&&m[1]!=='—'?m[1]:null;
   const badge=document.createElement('span');
   badge.className='b230Badge';
   badge.textContent=date?(date<today()?'VENCIDA':'PENDIENTE'):'PENDIENTE · SIN FECHA';
   card.querySelector('.debt-card-main')?.appendChild(badge);
   if(!date){
     const actions=card.querySelector('.form-actions');
     if(actions&&!actions.querySelector('.b230Reneg')){
       const b=document.createElement('button');
       b.type='button';b.className='b230Reneg';b.textContent='Renegociar / refinanciar';
       b.onclick=()=>card.querySelector('button[onclick*="editarDeuda23"]')?.click();
       actions.appendChild(b);
     }
   }
 });
}

function observe(){
 const observer=new MutationObserver(()=>{
   const f=$('deudaForm');
   if(f&&!f.dataset.b230Installed)install(f);
   sync();enhanceCards();
 });
 observer.observe(document.body,{childList:true,subtree:true});
 [250,700,1500,3000].forEach(ms=>setTimeout(()=>{
   const f=$('deudaForm');if(f&&!f.dataset.b230Installed)install(f);
   sync();enhanceCards();
 },ms));
 document.addEventListener('click',e=>{
   if(e.target.closest('[data-tab="deudas"]'))setTimeout(()=>{const f=$('deudaForm');if(f&&!f.dataset.b230Installed)install(f);sync();enhanceCards()},250);
 },true);
}
observe();
})();