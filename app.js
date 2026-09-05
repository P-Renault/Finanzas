let db=null;
const $=id=>document.getElementById(id);
const CLP=n=>new Intl.NumberFormat('es-CL',{style:'currency',currency:'CLP',maximumFractionDigits:0}).format(Number(n)||0);
const today=()=>{const d=new Date();return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,10)};
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const msg=(id,v)=>$(id).textContent=v;
function resetDates(){$('movFecha').value=today();$('futureFecha').value=today();$('savingFecha').value=today()}
function configLoad(){$('supabaseUrl').value=localStorage.getItem('sf_url')||'';$('supabaseKey').value=localStorage.getItem('sf_key')||''}
async function connect(){const url=$('supabaseUrl').value.trim(),key=$('supabaseKey').value.trim();if(!url||!key)return msg('configMsg','Completa ambos campos.');try{db=window.supabase.createClient(url,key);const{error}=await db.from('movimientos').select('id').limit(1);if(error)throw error;localStorage.setItem('sf_url',url);localStorage.setItem('sf_key',key);$('configPanel').classList.add('hidden');$('app').classList.remove('hidden');$('logoutBtn').classList.remove('hidden');await refresh()}catch(e){console.error(e);msg('configMsg','No se pudo conectar. Revisa URL, clave y SQL.')}}
$('saveConfig').onclick=connect;
$('logoutBtn').onclick=()=>{localStorage.removeItem('sf_url');localStorage.removeItem('sf_key');location.reload()};
document.querySelectorAll('.tabs button').forEach(b=>b.onclick=()=>{document.querySelectorAll('.tabs button').forEach(x=>x.classList.remove('active'));b.classList.add('active');document.querySelectorAll('.tab').forEach(x=>x.classList.add('hidden'));$(b.dataset.tab).classList.remove('hidden')});

// ---------- Movimientos ----------
$('movForm').onsubmit=async e=>{e.preventDefault();msg('movMsg','Guardando...');const id=$('movId').value,p={tipo:$('movTipo').value,fecha:$('movFecha').value,monto:Number($('movMonto').value),categoria:$('movCategoria').value.trim(),descripcion:$('movDescripcion').value.trim()};const r=id?await db.from('movimientos').update(p).eq('id',id):await db.from('movimientos').insert(p);if(r.error)return msg('movMsg',r.error.message);msg('movMsg',id?'Movimiento actualizado.':'Movimiento guardado.');resetMov();await refresh()};
$('movCancel').onclick=resetMov;
function resetMov(){$('movForm').reset();$('movId').value='';$('movFormTitle').textContent='Registrar movimiento';$('movSubmit').textContent='Guardar movimiento';$('movCancel').classList.add('hidden');$('movFecha').value=today()}
function encodeObj(r){return btoa(unescape(encodeURIComponent(JSON.stringify(r))))}
function decodeObj(s){try{return JSON.parse(decodeURIComponent(escape(atob(s))))}catch(e){return null}}
window.editMovEncoded=s=>{const r=decodeObj(s);if(!r)return;$('movId').value=r.id;$('movTipo').value=r.tipo;$('movFecha').value=r.fecha;$('movMonto').value=r.monto;$('movCategoria').value=r.categoria||'';$('movDescripcion').value=r.descripcion||'';$('movFormTitle').textContent='Editar movimiento';$('movSubmit').textContent='Guardar cambios';$('movCancel').classList.remove('hidden');document.querySelector('[data-tab="movimientos"]').click();scrollTo({top:0,behavior:'smooth'})};
window.deleteMov=async id=>{if(!confirm('¿Eliminar este movimiento?'))return;const{error}=await db.from('movimientos').delete().eq('id',id);if(error)return alert(error.message);await refresh()};

// ---------- Compromisos ----------
$('futureForm').onsubmit=async e=>{e.preventDefault();msg('futureMsg','Guardando...');const id=$('futureId').value,p={concepto:$('futureConcepto').value.trim(),fecha_vencimiento:$('futureFecha').value,monto:Number($('futureMonto').value),categoria:$('futureCategoria').value.trim(),periodicidad:$('futureRecurrence').value,notas:$('futureNotas').value.trim()};const r=id?await db.from('compromisos').update(p).eq('id',id):await db.from('compromisos').insert({...p,estado:'pendiente'});if(r.error)return msg('futureMsg',r.error.message);msg('futureMsg',id?'Compromiso actualizado.':'Compromiso creado.');resetFuture();await refresh()};
$('futureCancel').onclick=resetFuture;
function resetFuture(){$('futureForm').reset();$('futureId').value='';$('futureFormTitle').textContent='Crear pago o compromiso futuro';$('futureSubmit').textContent='Crear compromiso';$('futureCancel').classList.add('hidden');$('futureFecha').value=today()}
window.editFutureEncoded=s=>{const r=decodeObj(s);if(!r)return;$('futureId').value=r.id;$('futureConcepto').value=r.concepto||'';$('futureFecha').value=r.fecha_vencimiento;$('futureMonto').value=r.monto;$('futureCategoria').value=r.categoria||'';$('futureRecurrence').value=r.periodicidad||'unico';$('futureNotas').value=r.notas||'';$('futureFormTitle').textContent='Editar compromiso';$('futureSubmit').textContent='Guardar cambios';$('futureCancel').classList.remove('hidden');document.querySelector('[data-tab="futuros"]').click();scrollTo({top:0,behavior:'smooth'})};
window.deleteFuture=async id=>{if(!confirm('¿Eliminar este compromiso?'))return;const{error}=await db.from('compromisos').delete().eq('id',id);if(error)return alert(error.message);await refresh()};
window.markPaid=async id=>{const{error}=await db.from('compromisos').update({estado:'pagado'}).eq('id',id);if(error)return alert(error.message);await refresh()};

// ---------- Ahorro ----------
$('savingForm').onsubmit=async e=>{e.preventDefault();msg('savingMsg','Guardando...');const id=$('savingId').value,p={tipo:$('savingTipo').value,fecha:$('savingFecha').value,monto:Number($('savingMonto').value),descripcion:$('savingDescripcion').value.trim()};const r=id?await db.from('ahorro').update(p).eq('id',id):await db.from('ahorro').insert(p);if(r.error)return msg('savingMsg',r.error.message);msg('savingMsg',id?'Registro actualizado.':'Movimiento de ahorro guardado.');resetSaving();await refresh()};
$('savingCancel').onclick=resetSaving;
function resetSaving(){$('savingForm').reset();$('savingId').value='';$('savingFormTitle').textContent='Fondo de ahorro';$('savingSubmit').textContent='Registrar';$('savingCancel').classList.add('hidden');$('savingFecha').value=today()}
window.editSavingEncoded=s=>{const r=decodeObj(s);if(!r)return;$('savingId').value=r.id;$('savingTipo').value=r.tipo;$('savingFecha').value=r.fecha;$('savingMonto').value=r.monto;$('savingDescripcion').value=r.descripcion||'';$('savingFormTitle').textContent='Editar ahorro';$('savingSubmit').textContent='Guardar cambios';$('savingCancel').classList.remove('hidden');document.querySelector('[data-tab="ahorro"]').click();scrollTo({top:0,behavior:'smooth'})};
window.deleteSaving=async id=>{if(!confirm('¿Eliminar este registro de ahorro?'))return;const{error}=await db.from('ahorro').delete().eq('id',id);if(error)return alert(error.message);await refresh()};

// ---------- Calendario ----------
let calendarMonth=new Date();
function ym(d){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`}
function dateKey(d){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
function parseDate(s){const [y,m,d]=String(s).split('-').map(Number);return new Date(y,m-1,d)}
function monthLabel(d){return d.toLocaleDateString('es-CL',{month:'long',year:'numeric'}).replace(/^./,x=>x.toUpperCase())}
function addDays(d,n){const x=new Date(d);x.setDate(x.getDate()+n);return x}
function signedMovement(r){return r.tipo==='ingreso'?Number(r.monto):-Number(r.monto)}

function renderCalendar(mov,fut){
  const t=today(), month=ym(calendarMonth), y=calendarMonth.getFullYear(), m=calendarMonth.getMonth();
  $('calendarMonth').textContent=monthLabel(calendarMonth);
  const first=new Date(y,m,1), last=new Date(y,m+1,0), gridStart=addDays(first,-first.getDay());
  const days=Array.from({length:42},(_,i)=>addDays(gridStart,i));
  const movBy={}; for(const r of mov){(movBy[r.fecha]??=[]).push(r)}
  const futBy={}; for(const r of fut.filter(x=>x.estado==='pendiente')){(futBy[r.fecha_vencimiento]??=[]).push(r)}

  // El saldo proyectado se calcula desde el inicio del historial y respeta la fecha de cada registro.
  // Los compromisos pendientes se descuentan en su fecha. Un movimiento futuro aparece en calendario,
  // pero no altera el SALDO ACTUAL del Resumen hasta que llegue su fecha.
  const monthStart=`${month}-01`;
  let running=0;
  for(const r of mov.filter(x=>x.fecha<monthStart)) running+=signedMovement(r);
  for(const r of fut.filter(x=>x.estado==='pendiente'&&x.fecha_vencimiento<monthStart)) running-=Number(r.monto);

  const rows=[];
  for(let day=1;day<=last.getDate();day++){
    const key=`${month}-${String(day).padStart(2,'0')}`;
    const dayMov=movBy[key]||[], dayComms=futBy[key]||[];
    const inc=dayMov.filter(r=>r.tipo==='ingreso').reduce((s,r)=>s+Number(r.monto),0);
    const exp=dayMov.filter(r=>r.tipo==='gasto').reduce((s,r)=>s+Number(r.monto),0);
    const pay=dayComms.reduce((s,r)=>s+Number(r.monto),0);
    running+=inc-exp-pay;
    rows.push({key,day,inc,exp,pay,balance:running,mov:dayMov,comms:dayComms});
  }
  const rowMap=Object.fromEntries(rows.map(r=>[r.key,r]));
  const monthInc=rows.reduce((s,r)=>s+r.inc,0), monthExp=rows.reduce((s,r)=>s+r.exp,0), monthPay=rows.reduce((s,r)=>s+r.pay,0);
  $('calIncome').textContent=CLP(monthInc);
  $('calExpenses').textContent=CLP(monthExp);
  $('calPayments').textContent=CLP(monthPay);
  $('calFinalBalance').textContent=CLP(rows.at(-1)?.balance||running);
  $('calMonthNote').textContent=`${monthLabel(calendarMonth)} · ingresos y gastos registrados + pagos programados pendientes. El saldo diario incluye los registros según su fecha.`;

  $('calendarGrid').innerHTML=days.map(d=>{
    const key=dateKey(d), inMonth=d.getMonth()===m, r=rowMap[key];
    const inc=r?.inc||0, exp=r?.exp||0, pay=r?.pay||0;
    const items=[];
    for(const x of (r?.mov||[])) items.push(`<div class="day-event ${x.tipo}">${x.tipo==='ingreso'?'Ingreso':'Gasto'} · ${CLP(x.monto)}</div>`);
    for(const x of (r?.comms||[])) items.push(`<div class="day-event pago">Pago · ${CLP(x.monto)}</div>`);
    const more=items.length>3?`<div class="day-more">+${items.length-3} más</div>`:'';
    return `<div class="calendar-day ${inMonth?'':'outside'} ${key===t?'today-day':''}">
      <div class="day-head"><span class="day-number">${d.getDate()}</span>${key===t?'<span class="today-dot">HOY</span>':''}</div>
      ${inc?`<div class="day-line income">↑ ${CLP(inc)}</div>`:''}
      ${exp?`<div class="day-line expense">↓ ${CLP(exp)}</div>`:''}
      ${pay?`<div class="day-line payment">● ${CLP(pay)}</div>`:''}
      ${items.slice(0,3).join('')}${more}
      ${inMonth&&r?`<div class="day-balance">Saldo ${CLP(r.balance)}</div>`:''}
    </div>`;
  }).join('');
}
$('calPrev').onclick=()=>{calendarMonth.setMonth(calendarMonth.getMonth()-1);renderFromCache()};
$('calNext').onclick=()=>{calendarMonth.setMonth(calendarMonth.getMonth()+1);renderFromCache()};
$('calToday').onclick=()=>{calendarMonth=new Date();renderFromCache()};
let cache={mov:[],fut:[],sav:[]};
function renderFromCache(){renderCalendar(cache.mov,cache.fut)}

// ---------- Datos y dashboard ----------
async function refresh(){
  try{
    const [{data:mov,error:a},{data:fut,error:b},{data:sav,error:c}]=await Promise.all([
      db.from('movimientos').select('*').order('fecha',{ascending:false}).order('created_at',{ascending:false}),
      db.from('compromisos').select('*').order('fecha_vencimiento',{ascending:true}),
      db.from('ahorro').select('*').order('fecha',{ascending:false}).order('created_at',{ascending:false})
    ]);
    if(a||b||c){console.error(a||b||c);return}
    cache={mov:mov||[],fut:fut||[],sav:sav||[]};
    renderMov(cache.mov);renderFuture(cache.fut);renderSaving(cache.sav);renderDash(cache.mov,cache.fut,cache.sav);renderCalendar(cache.mov,cache.fut);
  }catch(e){console.error(e)}
}
function renderMov(rows){const t=today();$('movimientosLista').innerHTML=rows.length?rows.map(r=>{const future=r.fecha>t,amt=r.tipo==='gasto'?-Number(r.monto):Number(r.monto),enc=encodeObj(r);return `<div class="row"><div class="row-main"><b>${r.tipo==='ingreso'?'Ingreso':'Gasto'} · ${esc(r.categoria||'Sin categoría')}</b><div>${esc(r.descripcion||'')}</div><small>${r.fecha} ${future?'<span class="pill future">FUTURO</span>':''}</small></div><div class="row-right"><strong class="${amt<0?'negative':'positive'}">${amt<0?'-':'+'}${CLP(Math.abs(amt))}</strong><div class="actions"><button class="small" onclick="editMovEncoded('${enc}')">Editar</button><button class="small danger" onclick="deleteMov(${r.id})">Borrar</button></div></div></div>`}).join(''):'<p class="muted">Sin movimientos.</p>'}
function renderFuture(rows){const t=today();$('futurosLista').innerHTML=rows.length?rows.map(r=>{const overdue=r.estado==='pendiente'&&r.fecha_vencimiento<t,enc=encodeObj(r);return `<div class="row"><div class="row-main"><b>${esc(r.concepto)}</b><div>${esc(r.categoria||'')} · ${esc(r.periodicidad||'')}</div><small>${r.fecha_vencimiento} ${overdue?'<span class="pill overdue">VENCIDO</span>':''}</small></div><div class="row-right"><strong>${CLP(r.monto)}</strong><div class="actions"><button class="small" onclick="editFutureEncoded('${enc}')">Editar</button><button class="small danger" onclick="deleteFuture(${r.id})">Borrar</button>${r.estado==='pendiente'?`<button class="small paid" onclick="markPaid(${r.id})">Pagado</button>`:`<span class="pill paid">Pagado</span>`}</div></div></div>`}).join(''):'<p class="muted">No hay compromisos.</p>'}
function renderSaving(rows){const total=rows.reduce((s,r)=>s+(r.tipo==='aporte'?Number(r.monto):-Number(r.monto)),0);$('savingBalance').textContent=CLP(total);$('ahorroLista').innerHTML=rows.length?rows.map(r=>{const enc=encodeObj(r);return `<div class="row"><div class="row-main"><b>${r.tipo==='aporte'?'Aporte':'Retiro'}</b><div>${esc(r.descripcion||'')}</div><small>${r.fecha}</small></div><div class="row-right"><strong>${r.tipo==='aporte'?'+':'-'}${CLP(r.monto)}</strong><div class="actions"><button class="small" onclick="editSavingEncoded('${enc}')">Editar</button><button class="small danger" onclick="deleteSaving(${r.id})">Borrar</button></div></div></div>`}).join(''):'<p class="muted">Sin registros de ahorro.</p>'}
function renderDash(mov,fut,sav){const t=today(),d=parseDate(t),prefix=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`,actual=mov.filter(r=>r.fecha<=t),future=mov.filter(r=>r.fecha>t);const inc=actual.filter(r=>r.tipo==='ingreso'&&r.fecha.startsWith(prefix)).reduce((s,r)=>s+Number(r.monto),0),exp=actual.filter(r=>r.tipo==='gasto'&&r.fecha.startsWith(prefix)).reduce((s,r)=>s+Number(r.monto),0),ci=actual.filter(r=>r.tipo==='ingreso').reduce((s,r)=>s+Number(r.monto),0),ce=actual.filter(r=>r.tipo==='gasto').reduce((s,r)=>s+Number(r.monto),0),comm=fut.filter(r=>r.estado==='pendiente').reduce((s,r)=>s+Number(r.monto),0),fi=future.filter(r=>r.tipo==='ingreso').reduce((s,r)=>s+Number(r.monto),0),fe=future.filter(r=>r.tipo==='gasto').reduce((s,r)=>s+Number(r.monto),0),ah=sav.reduce((s,r)=>s+(r.tipo==='aporte'?Number(r.monto):-Number(r.monto)),0),saldo=ci-ce,proj=saldo+fi-fe-comm;$('saldo').textContent=CLP(saldo);$('ingresosMes').textContent=CLP(inc);$('gastosMes').textContent=CLP(exp);$('comprometido').textContent=CLP(comm);$('proyectado').textContent=CLP(proj);$('ahorroTotal').textContent=CLP(ah);$('ingresosFuturos').textContent=CLP(fi);$('gastosFuturos').textContent=CLP(fe);const p=fut.filter(r=>r.estado==='pendiente').slice(0,8);$('proximosPagos').innerHTML=p.length?p.map(r=>`<div class="row"><span>${esc(r.concepto)}<br><small>${r.fecha_vencimiento}</small></span><strong>${CLP(r.monto)}</strong></div>`).join(''):'<p class="muted">No tienes pagos pendientes.</p>'}

resetDates();configLoad();
if(localStorage.getItem('sf_url')&&localStorage.getItem('sf_key'))connect();
