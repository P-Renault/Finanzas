(()=>{
  'use strict';
  const VERSION='B234.2';
  const SECTION='b234-future-movements';
  const $=id=>document.getElementById(id);
  const money=n=>new Intl.NumberFormat('es-CL',{style:'currency',currency:'CLP',maximumFractionDigits:0}).format(Number(n)||0);
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const text=(id,v)=>{const e=$(id);if(e)e.textContent=v};
  const today=()=>{const d=new Date();return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,10)};
  const dateOf=r=>String(r?.fecha??r?.fecha_vencimiento??r?.fecha_cobro??r?.fecha_pago??r?.fecha_planificada??r?.fecha_generacion??r?.date??'').slice(0,10);
  const amountOf=r=>Number(r?.monto??r?.monto_neto??r?.valor??r?.amount??r?.importe??0)||0;
  const typeOf=r=>String(r?.tipo??r?.type??'').trim().toLowerCase();
  const conceptOf=r=>r?.concepto??r?.descripcion??r?.categoria??r?.nombre??r?.detalle??r?.motivo??'Movimiento futuro';
  const fmtDate=v=>{const p=String(v||'').slice(0,10).split('-');return p.length===3?`${p[2]}/${p[1]}/${p[0]}`:String(v||'')};
  const monthLabel=m=>{const [y,mo]=m.split('-').map(Number);return new Intl.DateTimeFormat('es-CL',{month:'long',year:'numeric'}).format(new Date(y,mo-1,1))};

  function db(){
    if(window.supabaseClient)return window.supabaseClient;
    if(window.B20_AUTH?.client)return window.B20_AUTH.client;
    if(window.__B23269_CLIENT__)return window.__B23269_CLIENT__;
    if(window.db && typeof window.db.from==='function')return window.db;
    const u=localStorage.getItem('sf_url'),k=localStorage.getItem('sf_key');
    if(u&&k&&window.supabase?.createClient){
      try{window.supabaseClient=window.supabase.createClient(u,k,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});return window.supabaseClient}catch(e){console.error('[B234.2]',e)}
    }
    return null;
  }

  async function read(client,table){
    try{const r=await client.from(table).select('*');return {data:r.data||[],error:r.error||null}}catch(e){return {data:[],error:e}}
  }

  async function getData(){
    const client=db();
    if(!client)throw new Error('Esperando sesión financiera…');
    const t=today(), month=t.slice(0,7);
    const [mov,fi,fe]=await Promise.all([read(client,'movimientos'),read(client,'ingresos_futuros'),read(client,'gastos_planificados')]);
    const real=(mov.data||[]).map(r=>({row:r,date:dateOf(r),amount:amountOf(r),type:typeOf(r)}));
    const income=(fi.data||[]).map(r=>({row:r,date:dateOf(r),amount:amountOf(r)}));
    const expense=(fe.data||[]).map(r=>({row:r,date:dateOf(r),amount:amountOf(r)}));
    const monthReal=real.filter(x=>x.date.slice(0,7)===month);
    const monthlyIncome=monthReal.filter(x=>x.type==='ingreso').reduce((s,x)=>s+x.amount,0);
    const monthlyExpense=monthReal.filter(x=>x.type==='gasto'||x.type==='egreso').reduce((s,x)=>s+x.amount,0);
    const futureIncome=income.filter(x=>x.date>t&&x.date.slice(0,7)===month).sort((a,b)=>a.date.localeCompare(b.date));
    const futureExpense=expense.filter(x=>x.date>t&&x.date.slice(0,7)===month).sort((a,b)=>a.date.localeCompare(b.date));
    return {t,month,monthlyIncome,monthlyExpense,futureIncome,futureExpense,sourceErrors:{mov:mov.error,fi:fi.error,fe:fe.error}};
  }

  function list(id,items,empty,sourceError){
    const box=$(id);if(!box)return;
    if(sourceError){box.innerHTML=`<div class="future-empty">Fuente no disponible temporalmente. Reintentando…</div>`;return}
    if(!items.length){box.innerHTML=`<div class="future-empty">${empty}</div>`;return}
    box.innerHTML=items.map(x=>`<article class="future-movement"><div><strong>${esc(conceptOf(x.row))}</strong><span>${esc(fmtDate(x.date))}</span></div><strong class="future-amount">${money(x.amount)}</strong></article>`).join('');
  }

  async function render(){
    if(!$(SECTION))return;
    const t=today(),month=t.slice(0,7);
    text('future-month-label',monthLabel(month));
    try{
      const d=await getData();
      text('month-income-total',money(d.monthlyIncome));
      text('month-expense-total',money(d.monthlyExpense));
      text('future-income-total',money(d.futureIncome.reduce((s,x)=>s+x.amount,0)));
      text('future-expense-total',money(d.futureExpense.reduce((s,x)=>s+x.amount,0)));
      text('future-income-count',String(d.futureIncome.length));
      text('future-expense-count',String(d.futureExpense.length));
      list('future-income-list',d.futureIncome,'No hay ingresos futuros registrados para lo que queda del mes.',d.sourceErrors.fi);
      list('future-expense-list',d.futureExpense,'No hay egresos futuros registrados para lo que queda del mes.',d.sourceErrors.fe);
      window.__B2342_READY__=true;
    }catch(e){
      console.warn('[B234.2] render:',e.message||e);
    }
  }

  function boot(){
    let attempts=0;
    const timer=setInterval(async()=>{
      attempts++;
      if(db()){clearInterval(timer);await render();}
      else if(attempts>=50){clearInterval(timer);console.warn('[B234.2] No se encontró cliente Supabase después de 15 s');}
    },300);
    render();
    document.addEventListener('click',e=>{
      const b=e.target.closest?.('[data-tab]');
      if(b&&b.dataset.tab==='dashboard')setTimeout(render,500);
    },true);
    window.addEventListener('b234:refresh',render);
  }
  window.B234MovimientosFuturos={version:VERSION,refresh:render};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
