/* ============================================================
   B232 — CALENDARIO V2 · B232.8
   Calendario integrado: movimientos + compromisos + cuotas de deuda.
   No modifica saldos ni registra operaciones.
   Deudas sin fecha NO aparecen en el calendario.
   ============================================================ */
(() => {
  'use strict';

  const VERSION = '232.8';
  if (window.B232Calendario?.version === VERSION) return;

  const $ = id => document.getElementById(id);
  const money = n => new Intl.NumberFormat('es-CL',{
    style:'currency',currency:'CLP',maximumFractionDigits:0
  }).format(Number(n)||0);
  const today = () => {
    const d = new Date();
    return new Date(d.getTime()-d.getTimezoneOffset()*60000)
      .toISOString().slice(0,10);
  };
  const esc = v => String(v ?? '').replace(/[&<>"']/g,c=>({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'
  }[c]));
  const parseDate = s => new Date(`${s}T12:00:00`);
  const dateKey = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;

  let client = null;
  let month = new Date();
  let selected = today();
  let data = {mov:[], fut:[], quotas:[]};

  async function db(){
    if(client) return client;
    const u=localStorage.getItem('sf_url'), k=localStorage.getItem('sf_key');
    if(!u || !k || !window.supabase) return null;
    client=window.supabase.createClient(u,k,{
      auth:{persistSession:false,autoRefreshToken:false}
    });
    return client;
  }

  async function load(){
    const c=await db();
    if(!c) throw Error('Supabase no está conectado.');

    const [mov,fut,quotas] = await Promise.all([
      c.from('movimientos')
        .select('*')
        .order('fecha',{ascending:true}),
      c.from('compromisos')
        .select('*')
        .order('fecha_vencimiento',{ascending:true}),
      c.from('cuotas_deuda')
        .select('id,deuda_id,numero_cuota,monto,fecha_vencimiento,estado')
        .in('estado',['pendiente','vencida'])
        .order('fecha_vencimiento',{ascending:true})
    ]);

    for(const r of [mov,fut,quotas]) if(r.error) throw r.error;

    data={
      mov:mov.data||[],
      fut:fut.data||[],
      quotas:quotas.data||[]
    };
    render();
  }

  function monthRows(){
    const y=month.getFullYear(), m=month.getMonth();
    const first=new Date(y,m,1), last=new Date(y,m+1,0);
    const start=new Date(first); start.setDate(1-first.getDay());

    const movementBy={}, futureBy={}, quotaBy={};
    for(const x of data.mov)(movementBy[x.fecha]??=[]).push(x);
    for(const x of data.fut.filter(x=>x.estado==='pendiente'))
      (futureBy[x.fecha_vencimiento]??=[]).push(x);
    for(const x of data.quotas)
      if(x.fecha_vencimiento)(quotaBy[x.fecha_vencimiento]??=[]).push(x);

    const rows=[];
    let running=0;

    const beforeMov=data.mov.filter(x=>x.fecha<dateKey(first));
    const beforeFuture=data.fut.filter(x=>x.estado==='pendiente'&&x.fecha_vencimiento<dateKey(first));
    const beforeQuota=data.quotas.filter(x=>x.fecha_vencimiento<dateKey(first));

    for(const x of beforeMov)
      running += x.tipo==='ingreso'?Number(x.monto): -Number(x.monto);
    for(const x of beforeFuture) running -= Number(x.monto);
    for(const x of beforeQuota) running -= Number(x.monto);

    for(let day=1;day<=last.getDate();day++){
      const key=`${y}-${String(m+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
      const movements=movementBy[key]||[];
      const commitments=futureBy[key]||[];
      const debtQuotas=quotaBy[key]||[];

      const income=movements.filter(x=>x.tipo==='ingreso')
        .reduce((s,x)=>s+Number(x.monto||0),0);
      const expense=movements.filter(x=>x.tipo==='gasto')
        .reduce((s,x)=>s+Number(x.monto||0),0);
      const scheduled=commitments.reduce((s,x)=>s+Number(x.monto||0),0);
      const debt=debtQuotas.reduce((s,x)=>s+Number(x.monto||0),0);

      running += income-expense-scheduled-debt;

      rows.push({
        key,day,income,expense,scheduled,debt,balance:running,
        movements,commitments,debtQuotas
      });
    }

    return {rows,movementBy,futureBy,quotaBy};
  }

  function injectStyle(){
    if($('b232Style')) return;
    const s=document.createElement('style');
    s.id='b232Style';
    s.textContent=`
      .b232-toolbar{display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap}
      .b232-nav{display:flex;gap:8px}
      .b232-nav button{min-width:44px}
      .b232-selection-summary{display:flex;flex-direction:column;gap:2px;margin:12px 0 8px;padding:10px 12px;border:1px solid #e5e7eb;border-radius:12px;background:#f8fafc}
      .b232-selection-summary span{font-size:.68rem;letter-spacing:.08em;font-weight:800;color:#64748b}
      .b232-selection-summary strong{font-size:.96rem;color:#111827}
      .b232-selection-summary small{font-size:.72rem;color:#64748b}
      .b232-month-reference{font-size:.72rem;color:#64748b;line-height:1.4;margin:8px 0 4px}
      .b232-metrics{display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin:8px 0 12px}
      .b232-metric{border:1px solid #e5e7eb;border-radius:12px;padding:10px;background:#fff}
      .b232-metric span,.b232-metric small{display:block;color:#64748b;font-size:.78rem}
      .b232-metric strong{display:block;margin-top:4px}
      .b232-legend{display:flex;gap:12px;flex-wrap:wrap;margin:10px 0;color:#475569;font-size:.8rem}
      .b232-calendar{display:grid;grid-template-columns:repeat(7,minmax(90px,1fr));overflow:auto;border:1px solid #e5e7eb;border-radius:12px}
      .b232-week{display:contents}
      .b232-week>div{padding:8px;border-bottom:1px solid #e5e7eb;font-size:.72rem;font-weight:700;text-align:center}
      .b232-day{min-height:120px;border:0;border-right:1px solid #e5e7eb;border-bottom:1px solid #e5e7eb;background:#fff;text-align:left;padding:7px;cursor:pointer}
      .b232-day.outside{background:#f8fafc;color:#94a3b8}
      .b232-day.selected{outline:2px solid #0f172a;outline-offset:-2px}
      .b232-day-head{display:flex;justify-content:space-between;gap:4px;margin-bottom:5px}
      .b232-event{display:block;font-size:.68rem;margin-top:3px;padding:3px 5px;border-radius:6px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}
      .b232-income{background:#ecfdf5;color:#166534}
      .b232-expense{background:#fef2f2;color:#991b1b}
      .b232-commitment{background:#fff7ed;color:#9a3412}
      .b232-debt{background:#eff6ff;color:#1d4ed8}
      .b232-balance{margin-top:6px;font-size:.68rem;color:#475569}
      .b232-detail{margin-top:14px}
      .b232-detail-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
      .b232-block{border:1px solid #e5e7eb;border-radius:12px;padding:12px;background:#fff}
      .b232-row{display:flex;justify-content:space-between;gap:8px;padding:8px 0;border-bottom:1px solid #f1f5f9}
      .b232-row:last-child{border-bottom:0}
      .b232-kind{font-size:.72rem;color:#64748b}
      @media(max-width:760px){
        .b232-metrics{grid-template-columns:1fr 1fr}
        .b232-detail-grid{grid-template-columns:1fr}
        .b232-calendar{grid-template-columns:repeat(7,92px)}
      }
    `;
    document.head.appendChild(s);
  }

  function render(){
    const host=$('calendario');
    if(!host) return;
    injectStyle();

    const {rows}=monthRows();
    const byKey=Object.fromEntries(rows.map(x=>[x.key,x]));
    const y=month.getFullYear(), m=month.getMonth();
    const first=new Date(y,m,1);
    const gridStart=new Date(first);
    gridStart.setDate(1-first.getDay());
    const days=Array.from({length:42},(_,i)=>{
      const d=new Date(gridStart);d.setDate(gridStart.getDate()+i);return d;
    });

    const inMonthRows=rows;
    const totalIncome=inMonthRows.reduce((s,x)=>s+x.income,0);
    const totalExpense=inMonthRows.reduce((s,x)=>s+x.expense,0);
    const totalCommit=inMonthRows.reduce((s,x)=>s+x.scheduled,0);
    const totalDebt=inMonthRows.reduce((s,x)=>s+x.debt,0);
    const finalBalance=inMonthRows.at(-1)?.balance||0;

    // B232.8 — Los indicadores superiores pasan a representar
    // exclusivamente la fecha actualmente seleccionada.
    const selectedRow=byKey[selected];
    const selectedIncome=selectedRow?.income||0;
    const selectedExpense=selectedRow?.expense||0;
    const selectedCommit=selectedRow?.scheduled||0;
    const selectedDebt=selectedRow?.debt||0;
    const selectedBalance=selectedRow?.balance||0;
    const selectedDateLabel=parseDate(selected).toLocaleDateString('es-CL',{
      weekday:'long',day:'numeric',month:'long',year:'numeric'
    }).replace(/^./,c=>c.toUpperCase());

    host.innerHTML=`
      <div class="card">
        <div class="b232-toolbar">
          <div>
            <span class="muted">B232 · CALENDARIO V2</span>
            <h2 id="b232MonthTitle">${month.toLocaleDateString('es-CL',{month:'long',year:'numeric'})}</h2>
          </div>
          <div class="b232-nav">
            <button type="button" class="secondary" id="b232Prev">‹</button>
            <button type="button" class="secondary" id="b232Today">Hoy</button>
            <button type="button" class="secondary" id="b232Next">›</button>
          </div>
        </div>

        <div class="b232-selection-summary">
          <span>RESUMEN DE LA SELECCIÓN</span>
          <strong>${esc(selectedDateLabel)}</strong>
          <small>Los indicadores superiores corresponden exclusivamente al día seleccionado.</small>
        </div>

        <div class="b232-metrics">
          <div class="b232-metric"><span>Ingresos</span><strong>${money(selectedIncome)}</strong></div>
          <div class="b232-metric"><span>Gastos</span><strong>${money(selectedExpense)}</strong></div>
          <div class="b232-metric"><span>Compromisos</span><strong>${money(selectedCommit)}</strong></div>
          <div class="b232-metric"><span>Cuotas de deuda</span><strong>${money(selectedDebt)}</strong></div>
          <div class="b232-metric"><span>Saldo al cierre</span><strong>${money(selectedBalance)}</strong></div>
        </div>

        <div class="b232-month-reference">
          Mes completo · Ingresos ${money(totalIncome)} · Gastos ${money(totalExpense)} ·
          Compromisos ${money(totalCommit)} · Cuotas ${money(totalDebt)} ·
          Saldo al cierre ${money(finalBalance)}
        </div>

        <div class="b232-legend">
          <span>↑ Ingreso</span><span>↓ Gasto</span>
          <span>● Compromiso</span><span>◆ Cuota de deuda</span>
        </div>

        <div class="b232-calendar">
          ${['DOM','LUN','MAR','MIÉ','JUE','VIE','SÁB'].map(x=>`<div>${x}</div>`).join('')}
          ${days.map(d=>{
            const key=dateKey(d), r=byKey[key], inMonth=d.getMonth()===m;
            const items=[];
            for(const x of (r?.movements||[]))
              items.push(`<span class="b232-event ${x.tipo==='ingreso'?'b232-income':'b232-expense'}">${x.tipo==='ingreso'?'↑':'↓'} ${money(x.monto)}</span>`);
            for(const x of (r?.commitments||[]))
              items.push(`<span class="b232-event b232-commitment">● ${money(x.monto)}</span>`);
            for(const x of (r?.debtQuotas||[]))
              items.push(`<span class="b232-event b232-debt">◆ ${money(x.monto)}</span>`);
            return `<button type="button" class="b232-day ${inMonth?'':'outside'} ${key===selected?'selected':''}" data-date="${key}">
              <div class="b232-day-head"><strong>${d.getDate()}</strong>${key===today()?'<small>HOY</small>':''}</div>
              ${items.slice(0,4).join('')}
              ${items.length>4?`<span class="b232-kind">+${items.length-4} más</span>`:''}
              ${inMonth&&r?`<div class="b232-balance">Saldo ${money(r.balance)}</div>`:''}
            </button>`;
          }).join('')}
        </div>

        <div id="b232Detail" class="b232-detail"></div>
        <p class="muted">Las deudas sin fecha no aparecen en el calendario. Se incorporan cuando existe una fecha de vencimiento o una cuota calendarizada. Las transferencias de fondos no se contabilizan como ingreso ni gasto.</p>
      </div>
    `;

    $('b232Prev').onclick=async()=>{month.setMonth(month.getMonth()-1);selected=dateKey(new Date(month.getFullYear(),month.getMonth(),1));render()};
    $('b232Next').onclick=async()=>{month.setMonth(month.getMonth()+1);selected=dateKey(new Date(month.getFullYear(),month.getMonth(),1));render()};
    $('b232Today').onclick=async()=>{month=new Date();selected=today();render()};
    host.querySelectorAll('.b232-day').forEach(b=>b.onclick=()=>{selected=b.dataset.date;render()});

    const r=byKey[selected];
    const selectedDate=parseDate(selected);
    const label=selectedDate.toLocaleDateString('es-CL',{weekday:'long',day:'numeric',month:'long',year:'numeric'}).replace(/^./,c=>c.toUpperCase());
    const movements=r?.movements||[], commitments=r?.commitments||[], quotas=r?.debtQuotas||[];

    $('b232Detail').innerHTML=`
      <div class="b232-block">
        <h3>Detalle del ${esc(label)}</h3>
        <div class="b232-detail-grid">
          <div class="b232-block">
            <strong>Ingresos y gastos registrados</strong>
            ${movements.length?movements.map(x=>`<div class="b232-row"><span>${esc(x.categoria||x.descripcion||'Movimiento')}</span><strong>${x.tipo==='ingreso'?'+':'-'}${money(x.monto)}</strong></div>`).join(''):'<p class="muted">Sin movimientos registrados.</p>'}
          </div>
          <div class="b232-block">
            <strong>Obligaciones</strong>
            ${commitments.map(x=>`<div class="b232-row"><span>${esc(x.concepto||'Compromiso')}</span><strong>${money(x.monto)}</strong></div>`).join('') || '<p class="muted">Sin compromisos programados.</p>'}
            ${quotas.map(x=>`<div class="b232-row"><span>Cuota deuda #${esc(x.numero_cuota)} · ${esc(x.estado)}</span><strong>${money(x.monto)}</strong></div>`).join('')}
          </div>
        </div>
        ${r?`<div class="b232-row"><span>Saldo acumulado al cierre</span><strong>${money(r.balance)}</strong></div>`:''}
      </div>
    `;
  }

  function mount(){
    const tab=document.querySelector('[data-tab="calendario"]');
    if(!tab || !document.getElementById('calendario')) return false;
    if(!tab.dataset.b232Bound){
      tab.addEventListener('click',()=>{
        load().catch(e=>{
          const host=$('calendario');
          if(host) host.innerHTML=`<div class="card"><p class="status">${esc(e.message||e)}</p></div>`;
        });
      });
      tab.dataset.b232Bound='1';
    }
    return true;
  }

  window.B232Calendario={version:VERSION,load,render};

  const boot=()=>{mount(); if(document.querySelector('[data-tab="calendario"].active')) load().catch(()=>{})};
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot);
  else setTimeout(boot,250);
})();
