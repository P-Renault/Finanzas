/* B232.66 — ABONOS DE DEUDA -> LIQUIDEZ REAL
   Puente seguro sobre B231.3: reemplaza solo la acción visual "Registrar abono".
   Requiere RPC public.registrar_pago_deuda_liquidez_v1 instalada por B232.65.
*/
(function(){
'use strict';
if(window.__B23266_ABONO_LIQUIDEZ__) return;
window.__B23266_ABONO_LIQUIDEZ__=true;
var VERSION='B232.66-RELEASE-ABONO-LIQUIDEZ';
var $=function(id){return document.getElementById(id)};
var money=function(n){return new Intl.NumberFormat('es-CL',{style:'currency',currency:'CLP',maximumFractionDigits:0}).format(Number(n)||0)};
var today=function(){var d=new Date();return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,10)};
function db(){var u=localStorage.getItem('sf_url'),k=localStorage.getItem('sf_key');return u&&k&&window.supabase&&typeof window.supabase.createClient==='function'?window.supabase.createClient(u,k,{auth:{persistSession:false,autoRefreshToken:false}}):null}
function closeModal(){var x=$('b23266-abono-modal');if(x)x.remove()}
function findDebtId(button){
 var el=button;
 for(var i=0;i<12&&el;i++,el=el.parentElement){
   var edit=el.querySelector&&el.querySelector('button[onclick*="editarDeuda23"]');
   var m=(edit&&edit.getAttribute('onclick')||'').match(/editarDeuda23\((\d+)\)/);
   if(m)return Number(m[1]);
 }
 return null;
}
async function loadAccounts(){
 var c=db();if(!c)return [];
 var r=await c.from('cuentas_bancarias').select('id,nombre_banco,nombre_cuenta,saldo_actual,activa').eq('activa',true).order('nombre_banco');
 if(r.error)throw r.error;return r.data||[];
}
function show(debt,accounts){
 closeModal();
 var overlay=document.createElement('div');overlay.id='b23266-abono-modal';overlay.style.cssText='position:fixed;inset:0;z-index:1000000;display:flex;align-items:center;justify-content:center;padding:18px;box-sizing:border-box;background:rgba(0,0,0,.60)';
 var box=document.createElement('div');box.style.cssText='width:min(440px,100%);max-height:90vh;overflow:auto;background:#fff;border-radius:14px;padding:20px;box-sizing:border-box;box-shadow:0 20px 70px rgba(0,0,0,.30)';
 var opts='<option value="efectivo">Efectivo / caja</option>'+(accounts||[]).map(function(a){return '<option value="cuenta_bancaria:'+a.id+'">'+String(a.nombre_banco||'Banco')+' — '+String(a.nombre_cuenta||'Cuenta')+' · '+money(a.saldo_actual)+'</option>'}).join('');
 box.innerHTML='<h3 style="margin:0 0 8px;color:#111827;font-size:20px">Registrar abono</h3><div style="font-weight:700;color:#111827">'+String(debt.acreedor||'Deuda')+'</div><div style="color:#6b7280;font-size:13px;margin:4px 0 16px">Saldo pendiente: '+money(debt.saldo_actual)+'</div><label style="display:block;font-size:13px;font-weight:600;margin-bottom:6px">Monto del abono</label><input id="b23266Amount" type="number" min="1" max="'+Number(debt.saldo_actual||0)+'" step="1" inputmode="numeric" style="width:100%;box-sizing:border-box;padding:12px;border:1px solid #d1d5db;border-radius:8px;font-size:16px;margin-bottom:12px"><label style="display:block;font-size:13px;font-weight:600;margin-bottom:6px">Medio de liquidez</label><select id="b23266Medium" style="width:100%;box-sizing:border-box;padding:12px;border:1px solid #d1d5db;border-radius:8px;font-size:16px;margin-bottom:14px">'+opts+'</select><label style="display:block;font-size:13px;font-weight:600;margin-bottom:6px">Fecha real de pago</label><input id="b23266Date" type="date" value="'+today()+'" max="'+today()+'" style="width:100%;box-sizing:border-box;padding:12px;border:1px solid #d1d5db;border-radius:8px;font-size:16px;margin-bottom:14px"><div id="b23266Msg" style="display:none;margin-bottom:12px;padding:10px;border-radius:8px;font-size:13px"></div><div style="display:flex;justify-content:flex-end;gap:8px"><button type="button" id="b23266Cancel" style="border:0;border-radius:8px;padding:10px 14px;background:#e5e7eb;color:#111827;font-weight:600">Cancelar</button><button type="button" id="b23266Confirm" style="border:0;border-radius:8px;padding:10px 14px;background:#111827;color:#fff;font-weight:600">Registrar abono</button></div>';
 overlay.appendChild(box);document.body.appendChild(overlay);
 $('b23266Cancel').onclick=closeModal;overlay.addEventListener('click',function(e){if(e.target===overlay)closeModal()});
 function msg(ok,t){var m=$('b23266Msg');m.style.display='block';m.style.background=ok?'#ecfdf5':'#fef2f2';m.style.color=ok?'#065f46':'#991b1b';m.textContent=t}
 $('b23266Confirm').onclick=async function(){
   var btn=$('b23266Confirm'),amount=Number($('b23266Amount').value||0),date=$('b23266Date').value,sel=$('b23266Medium').value;
   if(!amount||amount<=0)return msg(false,'El monto debe ser mayor que $0.');
   if(amount>Number(debt.saldo_actual||0))return msg(false,'El abono no puede superar el saldo de '+money(debt.saldo_actual)+'.');
   if(!date||date>today())return msg(false,'La fecha de pago no puede ser futura.');
   var medium=sel==='efectivo'?'efectivo':'cuenta_bancaria',accountId=medium==='cuenta_bancaria'?Number(sel.split(':')[1]||0):null;
   if(medium==='cuenta_bancaria'&&!accountId)return msg(false,'Selecciona una cuenta bancaria.');
   var c=db();if(!c)return msg(false,'Conecta Supabase.');
   btn.disabled=true;btn.textContent='Registrando…';
   try{
     var q=await c.from('cuotas_deuda').select('id,monto,numero_cuota,estado').eq('deuda_id',debt.id).in('estado',['pendiente','vencida']).order('numero_cuota',{ascending:true}).limit(1).maybeSingle();
     if(q.error)throw q.error;
     if(!q.data)throw new Error('La deuda no tiene una cuota pendiente disponible para registrar el abono.');
     var paid=await c.from('pagos_deuda').select('monto').eq('cuota_id',q.data.id);
     if(paid.error)throw paid.error;
     var quotaRemaining=Math.max(Number(q.data.monto||0)-(paid.data||[]).reduce(function(s,x){return s+Number(x.monto||0)},0),0);
     if(amount>quotaRemaining)throw new Error('El abono excede el saldo de la cuota. Pendiente: '+money(quotaRemaining)+'.');
     var r=await c.rpc('registrar_pago_deuda_liquidez_v1',{p_cuota_id:Number(q.data.id),p_monto:amount,p_fecha:date,p_medio_pago:medium,p_cuenta_id:accountId});
     if(r.error)throw r.error;
     var d=r.data||{};
     msg(true,'Abono registrado. Deuda: '+money(d.saldo_deuda)+' · Liquidez descontada: '+money(amount)+'.');
     setTimeout(async function(){closeModal();if(typeof window.refresh==='function')await window.refresh();else location.reload()},400);
   }catch(e){
     console.error('[B232.66] abono liquidez',e);
     msg(false,(e&&e.message)||String(e));btn.disabled=false;btn.textContent='Registrar abono';
   }
 };
 setTimeout(function(){var a=$('b23266Amount');if(a)a.focus()},40);
}
async function intercept(e){
 var b=e.target&&e.target.closest&&e.target.closest('button[data-b2313-abono="true"]');
 if(!b)return;
 e.preventDefault();e.stopImmediatePropagation();
 var c=db();if(!c)return alert('Conecta Supabase.');
 var id=findDebtId(b);if(!id)return alert('No se pudo identificar la deuda.');
 try{
   var d=await c.from('deudas').select('id,acreedor,saldo_actual').eq('id',id).single();
   if(d.error)throw d.error;if(!d.data||Number(d.data.saldo_actual||0)<=0)throw new Error('La deuda no tiene saldo pendiente.');
   var a=await loadAccounts();show(d.data,a);
 }catch(err){alert((err&&err.message)||String(err))}
}
document.addEventListener('click',intercept,true);
function footer(){var f=$('b23266-footer');if(!f){f=document.createElement('footer');f.id='b23266-footer';f.style.cssText='margin:8px 10px 18px;padding:8px;text-align:center;font:600 10px/1.4 system-ui,sans-serif;color:#64748b;border-top:1px solid #e5e7eb';document.body.appendChild(f)}f.textContent='Paquete desplegado: '+VERSION}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',footer,{once:true});else footer();
})();
