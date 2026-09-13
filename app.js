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
let calendarSelectedDate=today();
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
    return `<button type="button" class="calendar-day ${inMonth?'':'outside'} ${key===t?'today-day':''} ${key===calendarSelectedDate?'selected-day':''}" data-date="${key}" onclick="selectCalendarDay('${key}')">
      <div class="day-head"><span class="day-number">${d.getDate()}</span>${key===t?'<span class="today-dot">HOY</span>':''}</div>
      ${inc?`<div class="day-line income">↑ ${CLP(inc)}</div>`:''}
      ${exp?`<div class="day-line expense">↓ ${CLP(exp)}</div>`:''}
      ${pay?`<div class="day-line payment">● ${CLP(pay)}</div>`:''}
      ${items.slice(0,3).join('')}${more}
      ${inMonth&&r?`<div class="day-balance">Saldo ${CLP(r.balance)}</div>`:''}
    </button>`;
  }).join('');
  renderCalendarDayDetails(rowMap[calendarSelectedDate], calendarSelectedDate, movBy, futBy);
}

window.selectCalendarDay=(key)=>{
  calendarSelectedDate=key;
  renderFromCache();
  const details=document.getElementById('calendarDayDetails');
  if(details) details.scrollIntoView({behavior:'smooth',block:'nearest'});
};

function renderCalendarDayDetails(row, key, movBy, futBy){
  const box=$('calendarDayDetails');
  if(!box)return;
  const selected=parseDate(key);
  const dateLabel=selected.toLocaleDateString('es-CL',{weekday:'long',day:'numeric',month:'long',year:'numeric'}).replace(/^./,c=>c.toUpperCase());
  const movements=movBy[key]||[];
  const incomes=movements.filter(r=>r.tipo==='ingreso');
  const expenses=movements.filter(r=>r.tipo==='gasto');
  const payments=futBy[key]||[];
  const totalIncome=incomes.reduce((sum,r)=>sum+Number(r.monto),0);
  const totalExpense=expenses.reduce((sum,r)=>sum+Number(r.monto),0);
  const totalPayments=payments.reduce((sum,r)=>sum+Number(r.monto),0);
  const movementRow=r=>`<div class="detail-item"><div class="detail-main"><strong>${esc(r.categoria||'Sin categoría')}</strong><span>${esc(r.descripcion||'Sin descripción')}</span></div><strong>${CLP(r.monto)}</strong></div>`;
  const paymentRow=r=>`<div class="detail-item scheduled-item"><div class="detail-main"><strong>${esc(r.concepto||'Sin concepto')}</strong><span>${esc(r.categoria||'Sin categoría')} · ${esc(r.periodicidad||'unico')}</span>${r.notas?`<span>${esc(r.notas)}</span>`:''}<span class="payment-state">Pendiente · vence ${esc(r.fecha_vencimiento||key)}</span></div><strong>${CLP(r.monto)}</strong></div>`;
  box.innerHTML=`<div class="selected-day-header"><div><span class="plan-kicker">Detalle del día seleccionado</span><h3>${dateLabel}</h3></div><span class="selected-date-pill">${key}</span></div>
  <div class="day-detail-grid">
    <article class="day-detail-block income-detail"><div class="detail-title"><div><span>Ingresos registrados</span><strong>${CLP(totalIncome)}</strong></div><span class="detail-count">${incomes.length} registro${incomes.length===1?'':'s'}</span></div>${incomes.length?incomes.map(movementRow).join(''):'<p class="muted">No hay ingresos registrados para este día.</p>'}</article>
    <article class="day-detail-block expense-detail"><div class="detail-title"><div><span>Gastos registrados</span><strong>${CLP(totalExpense)}</strong></div><span class="detail-count">${expenses.length} registro${expenses.length===1?'':'s'}</span></div>${expenses.length?expenses.map(movementRow).join(''):'<p class="muted">No hay gastos registrados para este día.</p>'}
      <div class="scheduled-section"><div class="scheduled-section-header"><div><span>Pagos programados / pendientes</span><strong>${CLP(totalPayments)}</strong></div><span class="detail-count">${payments.length} pendiente${payments.length===1?'':'s'}</span></div>${payments.length?payments.map(paymentRow).join(''):'<p class="muted">No hay pagos programados pendientes para este día.</p>'}</div>
    </article>
  </div>
  ${row?`<div class="selected-day-balance"><span>Saldo acumulado al cierre del día</span><strong>${CLP(row.balance)}</strong></div>`:''}`;
}
$('calPrev').onclick=()=>{calendarMonth.setMonth(calendarMonth.getMonth()-1);calendarSelectedDate=dateKey(new Date(calendarMonth.getFullYear(),calendarMonth.getMonth(),1));renderFromCache()};
$('calNext').onclick=()=>{calendarMonth.setMonth(calendarMonth.getMonth()+1);calendarSelectedDate=dateKey(new Date(calendarMonth.getFullYear(),calendarMonth.getMonth(),1));renderFromCache()};
$('calToday').onclick=()=>{calendarMonth=new Date();calendarSelectedDate=today();renderFromCache()};
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
function calculateIncomePlan(mov,fut){
  const t=today();
  const actualMov=mov.filter(r=>r.fecha<=t);
  const currentBalance=actualMov.reduce((s,r)=>s+signedMovement(r),0);
  const pending=fut.filter(r=>r.estado==='pendiente' && r.fecha_vencimiento>=t).sort((a,b)=>a.fecha_vencimiento.localeCompare(b.fecha_vencimiento));
  if(!pending.length) return {has:false,currentBalance, savingsSuggested: actualMov.filter(r=>r.tipo==='ingreso').reduce((s,r)=>s+Number(r.monto)*0.10,0)};

  const targetDate=pending[0].fecha_vencimiento;
  // Para no subestimar la necesidad real, se consideran TODAS las obligaciones
  // pendientes que vencen en la primera fecha futura, no solo la primera fila.
  const sameDay=pending.filter(r=>r.fecha_vencimiento===targetDate);
  const paymentsTarget=sameDay.reduce((s,r)=>s+Number(r.monto),0);
  const futureIncomesBefore=mov.filter(r=>r.tipo==='ingreso' && r.fecha>t && r.fecha<=targetDate).reduce((s,r)=>s+Number(r.monto),0);
  const futureExpensesBefore=mov.filter(r=>r.tipo==='gasto' && r.fecha>t && r.fecha<=targetDate).reduce((s,r)=>s+Number(r.monto),0);
  const otherPendingBefore=fut.filter(r=>r.estado==='pendiente' && r.fecha_vencimiento>t && r.fecha_vencimiento<targetDate).reduce((s,r)=>s+Number(r.monto),0);
  const availableBefore=Math.max(0,currentBalance + futureIncomesBefore - futureExpensesBefore - otherPendingBefore);
  const gap=Math.max(0,paymentsTarget-availableBefore);
  // Si se reserva 10% de cada ingreso nuevo, solo 90% queda disponible para la obligación.
  const grossNeeded=gap/0.90;
  const days=Math.max(1,Math.ceil((parseDate(targetDate)-parseDate(t))/86400000));
  const daily=Math.ceil(grossNeeded/days);
  const dailySaving=Math.ceil(daily*0.10);
  const actualIncome=actualMov.filter(r=>r.tipo==='ingreso').reduce((s,r)=>s+Number(r.monto),0);
  const futureIncome=mov.filter(r=>r.tipo==='ingreso' && r.fecha>t).reduce((s,r)=>s+Number(r.monto),0);
  return {has:true,currentBalance,targetDate,sameDayCount:sameDay.length,paymentsTarget,futureIncomesBefore,futureExpensesBefore,otherPendingBefore,availableBefore,gap,grossNeeded,days,daily,dailySaving,savingsSuggested:actualIncome*0.10,futureSavingsSuggested:futureIncome*0.10};
}

function renderIncomePlan(mov,fut){
  const p=calculateIncomePlan(mov,fut), box=$('incomePlan');
  if(!box)return;
  if(!p.has){
    box.innerHTML=`<div class="plan-ok"><strong>Sin obligaciones futuras pendientes.</strong><span>No necesitas una meta diaria adicional por pagos programados en este momento.</span></div><div class="plan-savings"><b>Ahorro sugerido acumulado (10% de ingresos registrados):</b> ${CLP(p.savingsSuggested)}</div>`;
    return;
  }
  const dateLabel=parseDate(p.targetDate).toLocaleDateString('es-CL',{day:'numeric',month:'long'});
  const paymentLabel=p.sameDayCount>1?`${p.sameDayCount} obligaciones`:'la próxima obligación';
  const gapText=p.gap>0?`Faltan ${CLP(p.gap)} para cubrirlas.`:'El saldo disponible alcanza para cubrirlas.';
  box.innerHTML=`<div class="plan-header"><div><span class="plan-kicker">Sugerencia de ingreso</span><h3>${paymentLabel} · ${dateLabel}</h3></div><span class="suggest-pill">NO es una obligación</span></div>
  <div class="plan-main"><div><span>Ingreso estimado por día</span><strong>${CLP(p.daily)}</strong><small>Durante ${p.days} día(s), considerando reservar 10% para ahorro.</small></div><div class="plan-target"><span>Responsabilidades de esa fecha</span><strong>${CLP(p.paymentsTarget)}</strong><small>${gapText}</small></div></div>
  <div class="plan-details"><span>Saldo disponible antes: <b>${CLP(p.availableBefore)}</b></span><span>Ingreso bruto adicional estimado: <b>${CLP(p.grossNeeded)}</b></span><span>Ahorro 10% diario sugerido: <b>${CLP(p.dailySaving)}</b></span></div>
  <div class="plan-savings"><b>Ahorro sugerido acumulado:</b> ${CLP(p.savingsSuggested)} <span>· 10% de los ingresos ya registrados</span></div>
  <p class="plan-note">Se calcula con tu saldo actual, ingresos y gastos futuros registrados y compromisos pendientes anteriores o de la misma fecha. Si cambias un monto o fecha, la sugerencia se actualiza.</p>`;
}

function renderDash(mov,fut,sav){
  const t=today(),d=parseDate(t),prefix=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
  const actual=mov.filter(r=>r.fecha<=t),future=mov.filter(r=>r.fecha>t);
  const inc=actual.filter(r=>r.tipo==='ingreso'&&r.fecha.startsWith(prefix)).reduce((s,r)=>s+Number(r.monto),0);
  const exp=actual.filter(r=>r.tipo==='gasto'&&r.fecha.startsWith(prefix)).reduce((s,r)=>s+Number(r.monto),0);
  const ci=actual.filter(r=>r.tipo==='ingreso').reduce((s,r)=>s+Number(r.monto),0);
  const ce=actual.filter(r=>r.tipo==='gasto').reduce((s,r)=>s+Number(r.monto),0);
  const comm=fut.filter(r=>r.estado==='pendiente').reduce((s,r)=>s+Number(r.monto),0);
  const fi=future.filter(r=>r.tipo==='ingreso').reduce((s,r)=>s+Number(r.monto),0);
  const fe=future.filter(r=>r.tipo==='gasto').reduce((s,r)=>s+Number(r.monto),0);
  const ah=sav.reduce((s,r)=>s+(r.tipo==='aporte'?Number(r.monto):-Number(r.monto)),0);
  const saldo=ci-ce,proj=saldo+fi-fe-comm;

  // Resumen del mes: primero lo efectivamente pagado/registrado hasta hoy,
  // luego los compromisos que todavía siguen pendientes dentro del mes.
  const pendingMonth=fut.filter(r=>r.estado==='pendiente'&&r.fecha_vencimiento.startsWith(prefix));
  const totalPendingMonth=pendingMonth.reduce((s,r)=>s+Number(r.monto),0);
  const totalPaidMonth=exp;
  const totalToPayMonth=totalPaidMonth+totalPendingMonth;

  $('saldo').textContent=CLP(saldo);$('ingresosMes').textContent=CLP(inc);$('gastosMes').textContent=CLP(exp);$('comprometido').textContent=CLP(comm);$('proyectado').textContent=CLP(proj);$('ahorroTotal').textContent=CLP(ah);$('ingresosFuturos').textContent=CLP(fi);$('gastosFuturos').textContent=CLP(fe);
  $('totalPagadoMes').textContent=CLP(totalPaidMonth);
  $('totalPendienteMes').textContent=CLP(totalPendingMonth);
  $('totalGastosPagarMes').textContent=CLP(totalToPayMonth);
  $('monthlySummaryLabel').textContent=`${monthLabel(d)} · actualizado al ${d.getDate()} de ${d.toLocaleDateString('es-CL',{month:'long'})}`;
  renderIncomePlan(mov,fut);
  const p=fut.filter(r=>r.estado==='pendiente').slice(0,8);
  $('proximosPagos').innerHTML=p.length?p.map(r=>`<div class="row"><span>${esc(r.concepto)}<br><small>${r.fecha_vencimiento}</small></span><strong>${CLP(r.monto)}</strong></div>`).join(''):'<p class="muted">No tienes pagos pendientes.</p>'
}

resetDates();configLoad();
if(localStorage.getItem('sf_url')&&localStorage.getItem('sf_key'))connect();
