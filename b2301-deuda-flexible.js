/* FINANZAS B2.30.1 — DEUDAS FLEXIBLES / RENEGOCIACIÓN
   Integración robusta: el módulo puede cargarse antes o después de que
   finanzas-v233 cree dinámicamente la sección Deudas.
*/
(()=>{'use strict';
const $=id=>document.getElementById(id);
const today=()=>{const d=new Date();return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,10)};
let mounted=false;

function styles(){
 if($('b2301Styles'))return;
 const s=document.createElement('style');s.id='b2301Styles';s.textContent=`
 .b2301-mode{grid-column:1/-1;border:1px solid #cbd5e1;border-radius:14px;padding:14px 15px;background:#f8fafc;margin-top:4px}
 .b2301-mode-title{font-weight:800;font-size:14px;margin-bottom:8px}
 .b2301-choices{display:grid;grid-template-columns:1fr 1fr;gap:9px}
 .b2301-choice{display:flex;gap:9px;align-items:flex-start;border:1px solid #dbe3ee;border-radius:11px;padding:11px;background:#fff;cursor:pointer}
 .b2301-choice input{margin-top:3px}
 .b2301-choice strong{display:block}.b2301-choice small{display:block;color:#64748b;margin-top:3px;line-height:1.35}
 .b2301-flex{grid-column:1/-1;display:none;border-left:4px solid #475569;background:#f1f5f9;padding:11px 13px;border-radius:9px;color:#334155;font-size:12px}
 .b2301-flex.show{display:block}
 .b2301-flex b{display:block;margin-bottom:3px}
 .b2301-status{display:inline-flex;align-items:center;padding:4px 8px;border-radius:999px;font-size:10px;font-weight:800;margin-top:7px}
 .b2301-status.nodate{background:#e0e7ff;color:#3730a3}.b2301-status.pending{background:#fef3c7;color:#92400e}.b2301-status.overdue{background:#fee2e2;color:#991b1b}
 .b2301-actions{display:flex;gap:7px;flex-wrap:wrap;margin-top:9px}
 .b2301-actions button{border:0;border-radius:8px;padding:7px 9px;font-size:11px;font-weight:800;cursor:pointer;background:#111827;color:#fff}
 .b2301-actions .secondary{background:#e2e8f0;color:#1e293b}
 .b2301-date-disabled{opacity:.48}
 @media(max-width:650px){.b2301-choices{grid-template-columns:1fr}.b2301-mode{margin-top:6px}}
 `;
 document.head.appendChild(s);
}

function db(){
 const u=localStorage.getItem('sf_url'),k=localStorage.getItem('sf_key');
 return u&&k&&window.supabase?window.supabase.createClient(u,k):null;
}

function inject(){
 const form=$('deudaForm');
 if(!form){return false}
 styles();
 if(!$('b2301Mode')){
  const mode=document.createElement('div');
  mode.id='b2301Mode';mode.className='b2301-mode';
  mode.innerHTML=`
   <div class="b2301-mode-title">Situación de pago</div>
   <div class="b2301-choices">
    <label class="b2301-choice">
      <input type="radio" name="b2301DateMode" value="defined" checked>
      <span><strong>Fecha determinada</strong><small>La deuda ya tiene acuerdo y podemos generar calendario de cuotas.</small></span>
    </label>
    <label class="b2301-choice">
      <input type="radio" name="b2301DateMode" value="flexible">
      <span><strong>Sin fecha determinada</strong><small>Registrar la obligación ahora y definir el pago después, cuando exista claridad económica.</small></span>
    </label>
   </div>
  `;
  const first=form.querySelector('#deudaInicio')?.closest('label');
  (first||form.firstElementChild)?.insertAdjacentElement('beforebegin',mode);
  const info=document.createElement('div');
  info.id='b2301Info';info.className='b2301-flex';
  info.innerHTML='<b>Deuda flexible activa</b>Esta deuda quedará registrada como pendiente sin fecha. No se generarán cuotas ni se inventará un vencimiento. Posteriormente podrás editarla para renegociar o refinanciar y establecer el nuevo plan.';
  mode.insertAdjacentElement('afterend',info);
  form.querySelectorAll('input[name="b2301DateMode"]').forEach(x=>x.addEventListener('change',sync));
 }
 sync();
 if(!form.dataset.b2301Submit){
   form.dataset.b2301Submit='1';
   form.addEventListener('submit',intercept,true);
 }
 enhanceList();
 mounted=true;
 return true;
}

function flexible(){
 return document.querySelector('input[name="b2301DateMode"]:checked')?.value==='flexible';
}

function sync(){
 const f=$('deudaForm');if(!f)return;
 const flex=flexible();
 $('b2301Info')?.classList.toggle('show',flex);
 ['deudaInicio','deudaPrimeraCuota','deudaCuotas','deudaCuota','deudaFrecuencia'].forEach(id=>{
   const el=$(id);if(!el)return;
   el.disabled=flex;
   el.closest('label')?.classList.toggle('b2301-date-disabled',flex);
   if(flex && ['deudaInicio','deudaPrimeraCuota','deudaCuotas','deudaCuota'].includes(id))el.value='';
 });
 const submit=$('deudaSubmit');
 if(submit && !$('deudaId')?.value)submit.textContent=flex?'Registrar deuda sin fecha':'Registrar deuda y generar plan';
}

async function intercept(e){
 if(!flexible())return;
 e.preventDefault();e.stopImmediatePropagation();
 const c=db();
 if(!c){$('deudasMsg').textContent='Conecta Supabase para registrar la deuda.';return}
 const p={
  tipo_acreedor:$('deudaTipo')?.value,
  acreedor:$('deudaAcreedor')?.value.trim(),
  concepto:$('deudaConcepto')?.value.trim()||null,
  monto_original:Number($('deudaMonto')?.value||0),
  saldo_actual:Number($('deudaSaldo')?.value||0),
  tasa_anual:Number($('deudaTasa')?.value||0)||null,
  numero_cuotas:null,cuota_acordada:null,
  fecha_inicio:null,fecha_primera_cuota:null,fecha_proximo_pago:null,
  frecuencia:null,notas:$('deudaNotas')?.value.trim()||null,
  estado:'vigente',
  fecha_pago_determinada:false
 };
 if(!p.acreedor||p.monto_original<=0||p.saldo_actual<0){
  $('deudasMsg').textContent='Completa acreedor, monto original y saldo actual válido.';return;
 }
 $('deudasMsg').textContent='Registrando obligación sin fecha determinada…';
 const id=$('deudaId')?.value;
 const r=id?await c.from('deudas').update(p).eq('id',id):await c.from('deudas').insert(p);
 if(r.error){$('deudasMsg').textContent=r.error.message;return}
 $('deudasMsg').textContent=id?'Deuda actualizada: permanece sin fecha de pago.':'Deuda registrada: pendiente sin fecha de pago.';
 if(typeof window.resetDebt23==='function')window.resetDebt23();
 else { $('deudaForm').reset(); $('deudaId').value=''; }
 setTimeout(()=>{try{sync()}catch(_){};try{enhanceList()}catch(_){}},300);
 if(typeof window.loadDebts23==='function')await window.loadDebts23();
}

function cardStatus(card){
 const meta=card.querySelector('.debt-card-meta')?.textContent||'';
 const m=meta.match(/Próximo:\s*([0-9]{4}-[0-9]{2}-[0-9]{2}|—)/);
 const date=m&&m[1]!=='—'?m[1]:null;
 if(!date)return {text:'PENDIENTE · SIN FECHA',cls:'nodate',date:null};
 return date<today()?{text:'VENCIDA',cls:'overdue',date}:{text:'PENDIENTE',cls:'pending',date};
}

function enhanceList(){
 const list=$('deudasLista');if(!list)return;
 list.querySelectorAll('.debt-card').forEach(card=>{
   if(card.querySelector('.b2301-status'))return;
   const st=cardStatus(card);
   const main=card.querySelector('.debt-card-main');
   if(main){const badge=document.createElement('span');badge.className='b2301-status '+st.cls;badge.textContent=st.text;main.appendChild(badge)}
   if(!st.date){
    const actions=card.querySelector('.form-actions');
    if(actions){
     const b=document.createElement('button');b.type='button';b.className='secondary';b.textContent='Renegociar / refinanciar';
     b.onclick=()=>{const edit=card.querySelector('button[onclick*="editarDeuda23"]');if(edit)edit.click()};
     actions.appendChild(b);
    }
   }
 });
}

function observe(){
 const obs=new MutationObserver(()=>{if(!$('deudaForm'))return;inject();enhanceList()});
 obs.observe(document.body,{childList:true,subtree:true});
 [500,1200,2200,4000].forEach(ms=>setTimeout(()=>{if(inject())enhanceList()},ms));
 document.addEventListener('click',e=>{
   if(e.target.closest('[data-tab="deudas"]'))setTimeout(()=>{inject();enhanceList()},250);
   if(e.target.closest('button[onclick*="editarDeuda23"]'))setTimeout(sync,200);
 },true);
}
observe();
})();