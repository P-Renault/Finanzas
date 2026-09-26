/* B232.66-FIX — ABONOS PARCIALES DE CUOTA + LIQUIDEZ
 * 2026-09-26
 * Intervención mínima y compatible con la RPC existente:
 *   public.registrar_pago_deuda_liquidez_v1
 *
 * Reglas:
 * - Permite abonos inferiores al valor original de la cuota.
 * - El abono puede superar la cuota actual: el sistema distribuye el exceso en cuotas
 *   posteriores, sin modificar sus montos nominales.
 * - Muestra monto original, pagado, pendiente y estado antes de registrar.
 * - Un abono parcial NO modifica las cuotas futuras.
 * - Completar el saldo pendiente marca la cuota como pagada mediante la RPC.
 * - La deuda disminuye exactamente por el monto efectivamente pagado.
 * - La liquidez disminuye exactamente por el monto efectivamente pagado.
 * - No crea otra sesión Supabase ni modifica B232.34/B232.67/B232.68.
 */
(function(){
'use strict';
if(window.__B23266_ABONO_LIQUIDEZ_FIX_20260926__) return;
window.__B23266_ABONO_LIQUIDEZ_FIX_20260926__=true;

var VERSION='B232.66-FIX-2026.09.26';
var $=function(id){return document.getElementById(id)};
var money=function(n){return new Intl.NumberFormat('es-CL',{style:'currency',currency:'CLP',maximumFractionDigits:0}).format(Number(n)||0)};
var num=function(n){var x=Number(n);return Number.isFinite(x)?x:0};
var today=function(){var d=new Date();return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,10)};

function db(){
  var c=window.supabaseClient;
  if(c&&c.auth)return c;
  console.error('[B232.66 FIX] Cliente Supabase autenticado no disponible.');
  return null;
}

function closeModal(){var x=$('b23266fix-abono-modal');if(x)x.remove()}

function findDebtId(button){
  var el=button;
  for(var i=0;i<12&&el;i++,el=el.parentElement){
    var edit=el.querySelector&&el.querySelector('button[onclick*="editarDeuda23"]');
    var m=(edit&&edit.getAttribute('onclick')||'').match(/editarDeuda23\((\d+)\)/);
    if(m)return Number(m[1]);
  }
  return null;
}

async function getDebt(c,id){
  var r=await c.from('deudas').select('id,acreedor,saldo_actual,monto_original,estado').eq('id',id).single();
  if(r.error)throw r.error;
  if(!r.data)throw new Error('No se encontró la deuda.');
  return r.data;
}

async function getCurrentQuota(c,debtId){
  var q=await c.from('cuotas_deuda')
    .select('id,monto,numero_cuota,estado,fecha_vencimiento,fecha_pago')
    .eq('deuda_id',debtId)
    .in('estado',['pendiente','vencida','atrasada'])
    .order('numero_cuota',{ascending:true})
    .limit(1)
    .maybeSingle();
  if(q.error)throw q.error;
  if(!q.data)return null;

  var p=await c.from('pagos_deuda').select('monto').eq('cuota_id',q.data.id);
  if(p.error)throw p.error;
  var paid=(p.data||[]).reduce(function(s,x){return s+num(x.monto)},0);
  var original=num(q.data.monto);
  var remaining=Math.max(original-paid,0);
  return {quota:q.data,paid:paid,original:original,remaining:remaining};
}

async function getQuotaPlan(c,debtId){
  var q=await c.from('cuotas_deuda').select('id,monto,numero_cuota,estado,fecha_vencimiento,fecha_pago').eq('deuda_id',debtId).in('estado',['pendiente','vencida','atrasada']).order('numero_cuota',{ascending:true});
  if(q.error)throw q.error;
  var rows=q.data||[], ids=rows.map(function(x){return x.id}), payments=[];
  if(ids.length){var p=await c.from('pagos_deuda').select('cuota_id,monto').in('cuota_id',ids);if(p.error)throw p.error;payments=p.data||[]}
  var paidBy={};payments.forEach(function(x){paidBy[x.cuota_id]=(paidBy[x.cuota_id]||0)+num(x.monto)});
  return rows.map(function(x){var original=num(x.monto),paid=num(paidBy[x.id]||0);return {quota:x,original:original,paid:paid,remaining:Math.max(original-paid,0)}}).filter(function(x){return x.remaining>0});
}

async function loadAccounts(c){
  var r=await c.from('cuentas_bancarias').select('id,nombre_banco,nombre_cuenta,saldo_actual,activa').eq('activa',true).order('nombre_banco');
  if(r.error)throw r.error;
  return r.data||[];
}

function style(){
  if($('b23266fix-style'))return;
  var s=document.createElement('style');s.id='b23266fix-style';
  s.textContent='\
  .b23266fix-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:10px 0 14px}\
  .b23266fix-stat{padding:10px;border:1px solid #e5e7eb;border-radius:9px;background:#f8fafc}\
  .b23266fix-stat span{display:block;font-size:11px;color:#64748b;margin-bottom:3px}\
  .b23266fix-stat strong{font-size:15px;color:#111827}\
  .b23266fix-status{padding:10px 12px;border-radius:9px;background:#eef2ff;color:#3730a3;font-size:12px;line-height:1.4;margin-bottom:12px}\
  .b23266fix-status.partial{background:#fff7ed;color:#9a3412}\
  .b23266fix-status.paid{background:#ecfdf5;color:#065f46}\
  .b23266fix-quick{display:flex;flex-wrap:wrap;gap:7px;margin:0 0 12px}\
  .b23266fix-quick button{border:1px solid #cbd5e1;background:#fff;border-radius:8px;padding:7px 9px;font-size:11px;font-weight:700;color:#334155}\
  @media(max-width:520px){.b23266fix-grid{grid-template-columns:1fr 1fr}}';
  document.head.appendChild(s);
}

function show(debt,info,accounts){
  closeModal();
  var overlay=document.createElement('div');overlay.id='b23266fix-abono-modal';overlay.style.cssText='position:fixed;inset:0;z-index:1000001;display:flex;align-items:center;justify-content:center;padding:18px;box-sizing:border-box;background:rgba(0,0,0,.60)';
  var box=document.createElement('div');box.style.cssText='width:min(460px,100%);max-height:92vh;overflow:auto;background:#fff;border-radius:14px;padding:20px;box-sizing:border-box;box-shadow:0 20px 70px rgba(0,0,0,.30)';
  var q=info;
  var opts='<option value="efectivo">Efectivo / caja</option>'+(accounts||[]).map(function(a){return '<option value="cuenta_bancaria:'+Number(a.id)+'">'+String(a.nombre_banco||'Banco')+' — '+String(a.nombre_cuenta||'Cuenta')+' · '+money(a.saldo_actual)+'</option>'}).join('');
  var state=q.remaining<=0?'paid':(q.paid>0?'partial':'');
  var stateText=q.remaining<=0?'CUOTA PAGADA':(q.paid>0?'CUOTA PARCIALMENTE PAGADA':'CUOTA PENDIENTE');
  box.innerHTML='\
  <h3 style="margin:0 0 6px;color:#111827;font-size:20px">Registrar abono</h3>\
  <div style="font-weight:700;color:#111827">'+String(debt.acreedor||'Deuda')+'</div>\
  <div style="color:#6b7280;font-size:13px;margin:4px 0 12px">Saldo total de la deuda: '+money(debt.saldo_actual)+'</div>\
  <div class="b23266fix-grid">\
    <div class="b23266fix-stat"><span>Cuota actual</span><strong id="b23266fixOriginal">'+money(q.original)+'</strong></div>\
    <div class="b23266fix-stat"><span>Ya pagado</span><strong id="b23266fixPaid">'+money(q.paid)+'</strong></div>\
    <div class="b23266fix-stat"><span>Pendiente cuota</span><strong id="b23266fixRemaining">'+money(q.remaining)+'</strong></div>\
    <div class="b23266fix-stat"><span>Cuota N.º</span><strong id="b23266fixNumber">'+String(q.quota.numero_cuota||'—')+'</strong></div>\
  </div>\
  <div id="b23266fixStatus" class="b23266fix-status '+state+'">'+stateText+'. Un abono parcial no modifica las próximas cuotas.</div>\
  <label style="display:block;font-size:13px;font-weight:600;margin-bottom:6px">Monto del abono</label>\
  <input id="b23266fixAmount" type="number" min="1" max="'+num(debt.saldo_actual)+'" step="1" inputmode="numeric" style="width:100%;box-sizing:border-box;padding:12px;border:1px solid #d1d5db;border-radius:8px;font-size:16px;margin-bottom:8px">\
  <div class="b23266fix-quick" id="b23266fixQuick"></div>\
  <div id="b23266fixPreview" style="display:none;margin-bottom:12px;padding:10px 12px;border-radius:9px;background:#f8fafc;color:#334155;font-size:12px;line-height:1.5"></div>\
  <label style="display:block;font-size:13px;font-weight:600;margin-bottom:6px">Medio de liquidez</label>\
  <select id="b23266fixMedium" style="width:100%;box-sizing:border-box;padding:12px;border:1px solid #d1d5db;border-radius:8px;font-size:16px;margin-bottom:14px">'+opts+'</select>\
  <label style="display:block;font-size:13px;font-weight:600;margin-bottom:6px">Fecha real de pago</label>\
  <input id="b23266fixDate" type="date" value="'+today()+'" max="'+today()+'" style="width:100%;box-sizing:border-box;padding:12px;border:1px solid #d1d5db;border-radius:8px;font-size:16px;margin-bottom:14px">\
  <div id="b23266fixMsg" style="display:none;margin-bottom:12px;padding:10px;border-radius:8px;font-size:13px"></div>\
  <div style="display:flex;justify-content:flex-end;gap:8px"><button type="button" id="b23266fixCancel" style="border:0;border-radius:8px;padding:10px 14px;background:#e5e7eb;color:#111827;font-weight:600">Cancelar</button><button type="button" id="b23266fixConfirm" style="border:0;border-radius:8px;padding:10px 14px;background:#111827;color:#fff;font-weight:600">Registrar abono</button></div>';
  overlay.appendChild(box);document.body.appendChild(overlay);

  var amount=$('b23266fixAmount'),preview=$('b23266fixPreview'),status=$('b23266fixStatus'),quick=$('b23266fixQuick');
  var max=num(debt.saldo_actual);
  var quotaPlan=[q];
  var planLoaded=false;
  getQuotaPlan(db(),Number(debt.id)).then(function(plan){if(plan&&plan.length){quotaPlan=plan;planLoaded=true;updatePreview()}}).catch(function(e){console.warn('[B232.66 FIX] plan de cuotas',e)});

  if(q.paid>0 && q.remaining>0){
    var b=document.createElement('button');b.type='button';b.textContent='Completar cuota · '+money(q.remaining);b.onclick=function(){amount.value=String(q.remaining);updatePreview()};quick.appendChild(b);
  }
  if(max>0){
    var b2=document.createElement('button');b2.type='button';b2.textContent='Abono parcial · '+money(Math.max(1,Math.floor(max/2)));b2.onclick=function(){amount.value=String(Math.max(1,Math.floor(max/2)));updatePreview()};quick.appendChild(b2);
  }

  function msg(ok,t){var m=$('b23266fixMsg');m.style.display='block';m.style.background=ok?'#ecfdf5':'#fef2f2';m.style.color=ok?'#065f46':'#991b1b';m.textContent=t}
  function buildDistribution(a){
    var plan=quotaPlan||[q],left=a,parts=[];
    for(var i=0;i<plan.length&&left>0;i++){var x=plan[i],take=Math.min(left,x.remaining);if(take>0){parts.push({quota:x.quota,amount:take,remainingAfter:x.remaining-take});left-=take}}
    return {parts:parts,left:left};
  }
  function updatePreview(){
    var a=num(amount.value||0);
    if(!a){preview.style.display='none';return}
    preview.style.display='block';
    if(a>max){preview.style.background='#fef2f2';preview.style.color='#991b1b';preview.textContent='El abono no puede superar el saldo total de la deuda: '+money(max)+'.';$('b23266fixConfirm').disabled=true;return}
    var d=buildDistribution(a);
    if(d.left>0){preview.style.background='#fef2f2';preview.style.color='#991b1b';preview.textContent='No existen cuotas pendientes suficientes para distribuir '+money(a)+'.';$('b23266fixConfirm').disabled=true;return}
    var first=d.parts[0],restFirst=first?first.remainingAfter:0;
    var lines=d.parts.map(function(x){return 'Cuota '+String(x.quota.numero_cuota||'—')+': '+money(x.amount)}).join(' · ');
    preview.style.background='#f8fafc';preview.style.color='#334155';
    preview.innerHTML='<b>Distribución:</b> '+lines+'<br><b>Total:</b> '+money(a)+' · <b>Deuda después:</b> '+money(Math.max(num(debt.saldo_actual)-a,0));
    $('b23266fixConfirm').disabled=false;
    status.className='b23266fix-status '+(restFirst===0?'paid':'partial');
    status.textContent=d.parts.length===1?(restFirst===0?'Este pago completa la cuota actual. Las próximas cuotas permanecen sin cambios.':'Este pago queda aplicado a la cuota actual; el saldo restante se conserva.'):'El abono supera el saldo de la cuota actual. Se completa esa cuota y el excedente se aplica a las siguientes, sin cambiar sus montos nominales.';
  }

  amount.addEventListener('input',updatePreview);
  $('b23266fixCancel').onclick=closeModal;overlay.addEventListener('click',function(e){if(e.target===overlay)closeModal()});
  $('b23266fixConfirm').onclick=async function(){
    var btn=$('b23266fixConfirm'),a=num(amount.value||0),date=$('b23266fixDate').value,sel=$('b23266fixMedium').value;
    if(!a||a<=0)return msg(false,'El monto debe ser mayor que $0.');
    if(a>max)return msg(false,'El máximo para esta cuota es '+money(max)+'.');
    if(!date||date>today())return msg(false,'La fecha de pago no puede ser futura.');
    var medium=sel==='efectivo'?'efectivo':'cuenta_bancaria',accountId=medium==='cuenta_bancaria'?Number(sel.split(':')[1]||0):null;
    if(medium==='cuenta_bancaria'&&!accountId)return msg(false,'Selecciona una cuenta bancaria.');
    var c=db();if(!c)return msg(false,'No hay sesión Supabase autenticada.');
    btn.disabled=true;btn.textContent='Registrando…';
    try{
      if(!planLoaded){quotaPlan=await getQuotaPlan(c,Number(debt.id));planLoaded=true;updatePreview();}
      var dist=buildDistribution(a);
      if(dist.left>0)throw new Error('No hay cuotas pendientes suficientes para aplicar el abono completo.');
      for(var i=0;i<dist.parts.length;i++){
        var part=dist.parts[i];
        var r=await c.rpc('registrar_pago_deuda_liquidez_v1',{p_cuota_id:Number(part.quota.id),p_monto:part.amount,p_fecha:date,p_medio_pago:medium,p_cuenta_id:accountId});
        if(r.error)throw r.error;
      }
      msg(true,dist.parts.length===1?'Abono registrado correctamente.':'Abono registrado y distribuido en '+dist.parts.length+' cuotas. Las cuotas futuras mantienen sus montos nominales.');
      setTimeout(async function(){closeModal();if(typeof window.refresh==='function')await window.refresh();else location.reload()},450);
    }catch(e){console.error('[B232.66 FIX]',e);msg(false,(e&&e.message)||String(e));btn.disabled=false;btn.textContent='Registrar abono'}
  };
  updatePreview();
  setTimeout(function(){amount.focus()},40);
}

async function intercept(e){
  var b=e.target&&e.target.closest&&e.target.closest('button[data-b2313-abono="true"]');
  if(!b)return;
  e.preventDefault();e.stopImmediatePropagation();
  var c=db();if(!c)return alert('No hay sesión Supabase autenticada.');
  var id=findDebtId(b);if(!id)return alert('No se pudo identificar la deuda.');
  try{
    var debt=await getDebt(c,id);
    if(num(debt.saldo_actual)<=0)throw new Error('La deuda no tiene saldo pendiente.');
    var q=await getCurrentQuota(c,id);
    if(!q)throw new Error('La deuda no tiene una cuota pendiente disponible.');
    if(q.remaining<=0)throw new Error('La cuota actual ya está completamente pagada.');
    var accounts=await loadAccounts(c);
    show(debt,q,accounts);
  }catch(err){console.error('[B232.66 FIX] abrir abono',err);alert((err&&err.message)||String(err))}
}

document.addEventListener('click',intercept,true);

function footer(){var f=$('b23266fix-footer');if(!f){f=document.createElement('footer');f.id='b23266fix-footer';f.style.cssText='margin:8px 10px 18px;padding:8px;text-align:center;font:600 10px/1.4 system-ui,sans-serif;color:#64748b;border-top:1px solid #e5e7eb';document.body.appendChild(f)}f.textContent='Paquete desplegado: '+VERSION}
style();
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',footer,{once:true});else footer();
window.B23266Fix={VERSION,openByButton:function(b){var ev=new MouseEvent('click',{bubbles:true,cancelable:true});b.dispatchEvent(ev)}};
})();
