(function(){
  'use strict';
  const SECTION_ID='b234-future-movements';

  function $(id){return document.getElementById(id)}
  function text(id,value){const el=$(id);if(el)el.textContent=value}
  function money(value){return new Intl.NumberFormat('es-CL',{style:'currency',currency:'CLP',maximumFractionDigits:0}).format(Number(value)||0)}
  function escapeHtml(value){return String(value??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
  function todayISO(){const d=new Date();const y=d.getFullYear();const m=String(d.getMonth()+1).padStart(2,'0');const day=String(d.getDate()).padStart(2,'0');return `${y}-${m}-${day}`}
  function dateOf(row){return String(row.fecha||row.date||row.fecha_movimiento||row.fecha_pago||'').slice(0,10)}
  function amountOf(row){return Number(row.monto??row.amount??row.valor??0)||0}
  function typeOf(row){return String(row.tipo||row.type||'').toLowerCase().trim()}
  function conceptOf(row){return row.concepto||row.descripcion||row.categoria||row.nombre||row.detalle||'Movimiento'}
  function monthLabel(month){const [y,m]=String(month).split('-').map(Number);if(!y||!m)return'Mes en curso';return new Intl.DateTimeFormat('es-CL',{month:'long',year:'numeric'}).format(new Date(y,m-1,1))}
  function formatDate(value){const p=String(value||'').split('-');return p.length===3?`${p[2]}/${p[1]}/${p[0]}`:value}

  async function getRows(){
    if(window.FinanceRepository&&typeof window.FinanceRepository.loadSummaryContext==='function'){
      const ctx=await window.FinanceRepository.loadSummaryContext();
      const rows=[];
      (ctx?.incomes||[]).forEach(x=>rows.push({...x.row,_b234type:'ingreso',_b234date:x.date,_b234amount:x.amount}));
      (ctx?.expenses||[]).forEach(x=>rows.push({...x.row,_b234type:'gasto',_b234date:x.date,_b234amount:x.amount}));
      if(rows.length)return rows;
    }
    const client=window.supabaseClient;
    if(!client)throw new Error('No hay cliente Supabase disponible.');
    const r=await client.from('movimientos').select('*');
    if(r.error)throw r.error;
    return r.data||[];
  }

  function normalize(row){
    return {row,date:String(row._b234date||dateOf(row)).slice(0,10),amount:Number(row._b234amount??amountOf(row))||0,type:String(row._b234type||typeOf(row)).toLowerCase()}
  }

  function renderList(id,items,empty){
    const box=$(id);if(!box)return;
    if(!items.length){box.innerHTML=`<div class="future-empty">${empty}</div>`;return}
    box.innerHTML=items.map(x=>`<article class="future-movement"><div><strong>${escapeHtml(conceptOf(x.row))}</strong><span>${escapeHtml(formatDate(x.date))}</span></div><strong class="future-amount">${money(x.amount)}</strong></article>`).join('');
  }

  async function render(){
    if(!$(SECTION_ID))return;
    const today=todayISO();
    const month=today.slice(0,7);
    text('future-month-label',monthLabel(month));
    try{
      const raw=await getRows();
      const rows=raw.map(normalize).filter(x=>x.date&&x.date.slice(0,7)===month&&x.type!=='');
      const incomes=rows.filter(x=>x.type==='ingreso');
      const expenses=rows.filter(x=>x.type==='gasto'||x.type==='egreso');
      const futureIncome=incomes.filter(x=>x.date>today).sort((a,b)=>a.date.localeCompare(b.date));
      const futureExpense=expenses.filter(x=>x.date>today).sort((a,b)=>a.date.localeCompare(b.date));
      text('month-income-total',money(incomes.reduce((s,x)=>s+x.amount,0)));
      text('month-expense-total',money(expenses.reduce((s,x)=>s+x.amount,0)));
      text('future-income-total',money(futureIncome.reduce((s,x)=>s+x.amount,0)));
      text('future-expense-total',money(futureExpense.reduce((s,x)=>s+x.amount,0)));
      text('future-income-count',String(futureIncome.length));
      text('future-expense-count',String(futureExpense.length));
      renderList('future-income-list',futureIncome,'No hay ingresos futuros registrados para lo que queda del mes.');
      renderList('future-expense-list',futureExpense,'No hay egresos futuros registrados para lo que queda del mes.');
    }catch(err){
      console.error('[B234] No se pudieron cargar movimientos futuros:',err);
      renderList('future-income-list',[], 'No fue posible cargar los ingresos futuros.');
      renderList('future-expense-list',[], 'No fue posible cargar los egresos futuros.');
    }
  }

  function boot(){
    render();
    document.addEventListener('click',function(e){
      const tab=e.target.closest?.('[data-tab],button');
      if(tab && /resumen|dashboard/i.test(tab.textContent||''))setTimeout(render,250);
    });
    window.addEventListener('b234:refresh',render);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
