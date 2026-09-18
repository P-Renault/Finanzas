/* FINANZAS B2.29 — MOVIMIENTOS DE FONDOS
   Transferencias internas de liquidez:
   efectivo -> cuenta bancaria
   cuenta bancaria -> efectivo
   cuenta bancaria -> cuenta bancaria
   No se contabilizan como ingreso/gasto. Se registran como movimiento de fondo.
*/
(()=>{'use strict';
const $=id=>document.getElementById(id);
const money=n=>new Intl.NumberFormat('es-CL',{style:'currency',currency:'CLP',maximumFractionDigits:0}).format(Number(n)||0);
const db=()=>window.db||window.__db||(window.supabase&&localStorage.getItem('sf_url')?window.supabase.createClient(localStorage.getItem('sf_url'),localStorage.getItem('sf_key'),{auth:{persistSession:false,autoRefreshToken:false}}):null);
let accounts=[];

async function loadAccounts(){
 const c=db(); if(!c)return [];
 const r=await c.from('cuentas_bancarias').select('id,nombre_banco,nombre_cuenta,saldo_actual').eq('activa',true).order('nombre_banco');
 accounts=r.error?[]:(r.data||[]); return accounts;
}
function injectStyles(){
 if($('b229Styles'))return;
 const s=document.createElement('style');s.id='b229Styles';s.textContent=`
 #b229TransferBox{margin-top:14px;padding:16px;border:1px solid #dbe3ee;border-radius:14px;background:#f8fafc}
 .b229-head{display:flex;justify-content:space-between;gap:10px;align-items:center;margin-bottom:12px}
 .b229-head h3{margin:0}.b229-head small{display:block;color:#64748b;margin-top:3px}
 .b229-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
 .b229-grid label{display:flex;flex-direction:column;gap:5px;font-size:12px}
 .b229-grid .full{grid-column:1/-1}
 .b229-route{display:grid;grid-template-columns:1fr auto 1fr;gap:10px;align-items:end}
 .b229-arrow{font-size:22px;text-align:center;padding-bottom:8px}
 .b229-note{margin-top:10px;color:#64748b;font-size:12px}
 .b229-msg{margin-top:10px;padding:9px;border-radius:9px;background:#fff}
 .b229-list{margin-top:14px}
 .b229-item{display:flex;justify-content:space-between;gap:10px;padding:10px 0;border-bottom:1px solid #e5e7eb}
 .b229-item small{display:block;color:#64748b;margin-top:3px}
 @media(max-width:600px){.b229-grid,.b229-route{grid-template-columns:1fr}.b229-arrow{display:none}.b229-grid .full{grid-column:auto}}
 `;
 document.head.appendChild(s);
}
function accountOptions(){
 return '<option value="">Seleccionar cuenta…</option>'+accounts.map(a=>`<option value="${a.id}">${a.nombre_banco} · ${a.nombre_cuenta} · ${money(a.saldo_actual)}</option>`).join('');
}
function cashBalance(){
 const el=document.querySelector('#dashboard #b219Cash');
 return el?Number(String(el.textContent).replace(/[^\d-]/g,''))||0:null;
}
function mount(){
 const form=$('movForm'); if(!form||$('b229TransferBox'))return;
 const box=document.createElement('div');box.id='b229TransferBox';box.className='full';
 box.innerHTML=`
  <div class="b229-head"><div><h3>Movimiento de fondos</h3><small>Mueve liquidez entre efectivo y cuentas sin registrarlo como ingreso ni gasto.</small></div></div>
  <div class="b229-grid">
   <label>Origen
    <select id="b229From">
     <option value="efectivo">Efectivo / caja</option>
     <option value="banco">Cuenta bancaria</option>
    </select>
   </label>
   <label>Destino
    <select id="b229To">
     <option value="banco">Cuenta bancaria</option>
     <option value="efectivo">Efectivo / caja</option>
    </select>
   </label>
   <div id="b229FromAccountWrap"><label>Cuenta de origen<select id="b229FromAccount">${accountOptions()}</select></label></div>
   <div id="b229ToAccountWrap"><label>Cuenta de destino<select id="b229ToAccount">${accountOptions()}</select></label></div>
   <label>Monto <input id="b229Amount" type="number" min="1" step="1" placeholder="50000"></label>
   <label>Fecha <input id="b229Date" type="date"></label>
   <label class="full">Descripción <input id="b229Description" placeholder="Traslado de efectivo a cuenta bancaria"></label>
   <button type="button" class="full" id="b229TransferBtn">Mover fondos</button>
  </div>
  <p class="b229-note">El traslado no aumenta ni disminuye tu patrimonio: solo cambia dónde está disponible el dinero.</p>
  <div id="b229Msg" class="b229-msg"></div>
  <div class="b229-list"><h4>Últimos movimientos de fondos</h4><div id="b229List"></div></div>`;
 form.parentElement.appendChild(box);
 $('b229Date').value=new Date().toISOString().slice(0,10);
 ['b229From','b229To'].forEach(id=>$(id).addEventListener('change',sync));
 $('b229TransferBtn').onclick=transfer;
 sync(); loadHistory();
}
function sync(){
 const from=$('b229From')?.value,to=$('b229To')?.value;if(!from||!to)return;
 $('b229FromAccountWrap').style.display=from==='banco'?'block':'none';
 $('b229ToAccountWrap').style.display=to==='banco'?'block':'none';
 if(from==='banco'&&to==='banco'){
   $('b229FromAccountWrap').querySelector('label').firstChild.textContent='Cuenta de origen';
   $('b229ToAccountWrap').querySelector('label').firstChild.textContent='Cuenta de destino';
 }
}
async function transfer(){
 const c=db(),msg=$('b229Msg');if(!c){msg.textContent='Conecta Supabase.';return}
 const from=$('b229From').value,to=$('b229To').value,amount=Number($('b229Amount').value);
 const fromId=from==='banco'?Number($('b229FromAccount').value):null,toId=to==='banco'?Number($('b229ToAccount').value):null;
 if(from===to){msg.textContent='El origen y destino deben ser diferentes.';return}
 if(!amount||amount<=0){msg.textContent='Ingresa un monto válido.';return}
 if(from==='banco'&&!fromId||to==='banco'&&!toId){msg.textContent='Selecciona las cuentas bancarias.';return}
 if(fromId&&toId&&fromId===toId){msg.textContent='La cuenta de origen y destino no pueden ser la misma.';return}
 msg.textContent='Aplicando traslado de fondos…';
 const r=await c.rpc('transferir_fondos_v1',{p_origen:from,p_origen_cuenta_id:fromId,p_destino:to,p_destino_cuenta_id:toId,p_monto:amount,p_fecha:$('b229Date').value,p_descripcion:$('b229Description').value.trim()||null});
 if(r.error){msg.textContent=r.error.message;return}
 msg.textContent=`Traslado realizado: ${money(amount)}. No se contabilizó como ingreso ni gasto.`;
 $('b229Amount').value='';$('b229Description').value='';
 await loadAccounts();sync();await loadHistory();
 if(typeof window.refresh==='function')await window.refresh();
}
async function loadHistory(){
 const c=db(),host=$('b229List');if(!c||!host)return;
 const r=await c.from('transferencias_fondos').select('id,fecha,origen,origen_cuenta_id,destino,destino_cuenta_id,monto,descripcion').order('created_at',{ascending:false}).limit(15);
 if(r.error){host.innerHTML='<small>No se pudo consultar el historial de fondos.</small>';return}
 const names=new Map(accounts.map(a=>[String(a.id),`${a.nombre_banco} · ${a.nombre_cuenta}`]));
 host.innerHTML=(r.data||[]).map(x=>{
   const o=x.origen==='efectivo'?'Efectivo / caja':(names.get(String(x.origen_cuenta_id))||'Cuenta bancaria');
   const d=x.destino==='efectivo'?'Efectivo / caja':(names.get(String(x.destino_cuenta_id))||'Cuenta bancaria');
   return `<div class="b229-item"><span>${o} → ${d}<small>${x.fecha}${x.descripcion?' · '+x.descripcion:''}</small></span><strong>${money(x.monto)}</strong></div>`;
 }).join('')||'<small>No hay movimientos de fondos registrados.</small>';
}
async function boot(){injectStyles();await loadAccounts();mount();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,900),{once:true});else setTimeout(boot,900);
})();