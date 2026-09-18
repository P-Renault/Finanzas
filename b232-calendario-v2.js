/* ============================================================
   B232 — CALENDARIO V2
   Calendario integrado: movimientos + compromisos + cuotas de deuda.
   No modifica saldos ni registra operaciones.
   Deudas sin fecha NO aparecen en el calendario.
   ============================================================ */
(() => {
  'use strict';

  const VERSION = '232.2';
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
  const norm = v => String(v ?? '').trim().toLowerCase();
  const isPendingQuota = q => {
    const st = norm(q.estado);
    return !['pagada','pagado','cancelada','cancelado','anulada','anulado'].includes(st);
  };
  const isPendingFuture = x => {
    const st = norm(x.estado);
    return !st || ['pendiente','vencido','vencida','programado','programada','activo','activa'].includes(st);
  };
  const movementType = x => norm(x.tipo);

  const dateKey = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;

  let client = null;
  let month = new Date();
  let selected = today();
  let data = {mov:[], fut:[], quotas:[], debts:[]};

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

    const [mov,fut,quotas,debtRows] = await Promise.all([
      c.from('movimientos')
        .select('*')
        .order('fecha',{ascending:true}),
      c.from('compromisos')
        .select('*')
        .order('fecha_vencimiento',{ascending:true}),
      /* B232.2: no filtrar por texto exacto en Supabase.
         Las instalaciones existentes pueden usar mayúsculas/minúsculas
         o estados equivalentes. Se filtra localmente para no perder cuotas. */
      c.from('cuotas_deuda')
        .select('*')
        .order('fecha_vencimiento',{ascending:true}),
      c.from('deudas')
        .select('*')
    ]);

    for(const r of [mov,fut,quotas,debtRows]) if(r.error) throw r.error;

    data={
      mov:mov.data||[],
      fut:fut.data||[],
      quotas:(quotas.data||[]).filter(q => q.fecha_vencimiento && isPendingQuota(q)),
      debts:debtRows.data||[]
    };
    render();
  }

  function movementLabel(x){
    const cat=String(x.categoria||'').trim();
    const desc=String(x.descripcion||'').trim();
    if(cat && desc) return `${cat} · ${desc}`;
    return cat || desc || 'Movimiento';
  }

  function debtLabel(q){
    const d=data.debts.find(x=>String(x.id)===String(q.deuda_id));
    const base=d?.acreedor || d?.concepto || d?.nombre || d?.descripcion || 'Deuda';
    return `${base} · Cuota #${q.numero_cuota}`;
  }

  function commitmentLabel(x){
    const concepto=String(x.concepto||'Compromiso').trim();
    const cat=String(x.categoria||'').trim();
    return cat ? `${concepto} · ${cat}` : concepto;
  }

  function selectedDaySummary(r){
    const movements=r?.movements||[];
    const commitments=r?.commitments||[];
    const quotas=r?.debtQuotas||[];
    const incomes=movements.filter(x=>movementType(x)==='ingreso');
    const expenses=movements.filter(x=>movementType(x)==='gasto');
    const scheduled=[
      ...commitments.filter(isPendingFuture).map(x=>({source:'Pago futuro',label:commitmentLabel(x),amount:Number(x.monto||0),record:x})),
      ...quotas.filter(q=>q.fecha_vencimiento && isPendingQuota(q)).map(x=>({source:'Deuda',label:debtLabel(x),amount:Number(x.monto||0),record:x}))
    ];
    return {
      incomes,
      expenses,
      scheduled,
      incomeTotal:incomes.reduce((s,x)=>s+Number(x.monto||0),0),
      expenseTotal:expenses.reduce((s,x)=>s+Number(x.monto||0),0),
      scheduledTotal:scheduled.reduce((s,x)=>s+x.amount,0),
      outflowTotal:expenses.reduce((s,x)=>s+Number(x.monto||0),0)+scheduled.reduce((s,x)=>s+x.amount,0),
      net:incomes.reduce((s,x)=>s+Number(x.monto||0),0)-expenses.reduce((s,x)=>s+Number(x.monto||0),0)-scheduled.reduce((s,x)=>s+x.amount,0)
    };
  }

  function monthRows(){
    const y=month.getFullYear(), m=month.getMonth();
    const first=new Date(y,m,1), last=new Date(y,m+1,0);
    const start=new Date(first); start.setDate(1-first.getDay());

    const movementBy={}, futureBy={}, quotaBy={};
    for(const x of data.mov)(movementBy[x.fecha]??=[]).push(x);
    for(const x of data.fut.filter(isPendingFuture))
      if(x.fecha_vencimiento)(futureBy[x.fecha_vencimiento]??=[]).push(x);
    for(const x of data.quotas)
      if(x.fecha_vencimiento && isPendingQuota(x))(quotaBy[x.fecha_vencimiento]??=[]).push(x);

    const rows=[];
    let running=0;

    const beforeMov=data.mov.filter(x=>x.fecha<dateKey(first));
    const beforeFuture=data.fut.filter(x=>isPendingFuture(x)&&x.fecha_vencimiento<dateKey(first));
    const beforeQuota=data.quotas.filter(x=>x.fecha_vencimiento<dateKey(first));

    for(const x of beforeMov)
      running += x.tipo==='ingreso'?Number(x.monto): -Number(x.monto);
    for(const x of beforeFuture) running -= Number(x.monto);
    for(const x of beforeQuota.filter(isPendingQuota)) running -= Number(x.monto);

    for(let day=1;day<=last.getDate();day++){
      const key=`${y}-${String(m+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
      const movements=movementBy[key]||[];
      const commitments=futureBy[key]||[];
      const debtQuotas=quotaBy[key]||[];

      const income=movements.filter(x=>movementType(x)==='ingreso')
        .reduce((s,x)=>s+Number(x.monto||0),0);
      const expense=movements.filter(x=>movementType(x)==='gasto')
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
      .b232-selected-summary{border:1px solid #e5e7eb;border-radius:12px;padding:10px;background:#fff;margin:12px 0}
      .b232-selected-summary-head{display:flex;justify-content:space-between;align-items:center;gap:10px}
      .b232-selected-summary-head>div{display:flex;flex-direction:column;gap:2px}
      .b232-metrics{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:10px 0 0}
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
      .b232-detail-head{display:flex;justify-content:space-between;align-items:flex-start;gap:10px;border-bottom:1px solid #e5e7eb;padding-bottom:8px}
      .b232-detail-head h3{margin:3px 0 0}
      .b232-date-badge{background:#e0f2fe;color:#075985;border-radius:999px;padding:5px 9px;font-size:.72rem;font-weight:700}
      .b232-day-metrics{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:12px 0}
      .b232-day-income{background:#ecfdf5}
      .b232-day-expense{background:#fff7ed}
      .b232-day-payment{background:#fef3c7}
      .b232-day-balance{background:#eff6ff}
      .b232-metric small{margin-top:3px;color:#64748b;font-size:.7rem}
      .b232-panel-title{display:flex;justify-content:space-between;gap:8px;align-items:center;padding-bottom:8px;border-bottom:1px solid #e5e7eb}
      .b232-income-panel{background:#f8fffb}
      .b232-outflow-panel{background:#fffaf5}
      .b232-positive{color:#15803d}
      .b232-negative{color:#b91c1c}
      .b232-day-total{margin-top:10px;background:#f8fafc;border-radius:10px;padding:10px}
      .b232-row span{display:flex;flex-direction:column;min-width:0}
      .b232-detail-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
      .b232-block{border:1px solid #e5e7eb;border-radius:12px;padding:12px;background:#fff}
      .b232-row{display:flex;justify-content:space-between;gap:8px;padding:8px 0;border-bottom:1px solid #f1f5f9}
      .b232-row:last-child{border-bottom:0}
      .b232-kind{font-size:.72rem;color:#64748b}
      @media(max-width:760px){
        .b232-metrics{grid-template-columns:1fr 1fr}
        .b232-day-metrics{grid-template-columns:1fr 1fr}
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

    const selectedRow=byKey[selected];
    const daySummary=selectedDaySummary(selectedRow);
    const dayLabel=parseDate(selected).toLocaleDateString('es-CL',{weekday:'long',day:'numeric',month:'long',year:'numeric'}).replace(/^./,c=>c.toUpperCase());

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

        <div class="b232-selected-summary">
          <div class="b232-selected-summary-head">
            <div><span class="muted">RESUMEN DEL DÍA SELECCIONADO</span><strong>${esc(dayLabel)}</strong></div>
            <span class="b232-date-badge">${esc(selected)}</span>
          </div>
          <div class="b232-metrics">
            <div class="b232-metric b232-day-income"><span>Ingresos registrados</span><strong>${money(daySummary.incomeTotal)}</strong></div>
            <div class="b232-metric b232-day-expense"><span>Gastos registrados</span><strong>${money(daySummary.expenseTotal)}</strong></div>
            <div class="b232-metric b232-day-payment"><span>Pagos programados</span><strong>${money(daySummary.scheduledTotal)}</strong></div>
            <div class="b232-metric b232-day-balance"><span>Saldo al cierre</span><strong>${money(selectedRow?.balance||0)}</strong></div>
          </div>
        </div>

        <div class="b232-legend">
          <span>↑ Ingreso</span><span>↓ Gasto</span>
          <span>● Pago futuro</span><span>◆ Deuda / cuota</span>
        </div>

        <div class="b232-calendar">
          ${['DOM','LUN','MAR','MIÉ','JUE','VIE','SÁB'].map(x=>`<div>${x}</div>`).join('')}
          ${days.map(d=>{
            const key=dateKey(d), r=byKey[key], inMonth=d.getMonth()===m;
            const items=[];
            for(const x of (r?.movements||[])){
              const isIncome=movementType(x)==='ingreso';
              if(isIncome || movementType(x)==='gasto') items.push(`<span class="b232-event ${isIncome?'b232-income':'b232-expense'}">${isIncome?'↑':'↓'} ${money(x.monto)}</span>`);
            }
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
    const summary=selectedDaySummary(r);

    $('b232Detail').innerHTML=`
      <div class="b232-block">
        <div class="b232-detail-head">
          <div>
            <span class="muted">DETALLE ECONÓMICO DEL DÍA</span>
            <h3>${esc(label)}</h3>
          </div>
          <span class="b232-date-badge">${esc(selected)}</span>
        </div>

        <div class="b232-detail-grid">
          <div class="b232-block b232-income-panel">
            <div class="b232-panel-title"><strong>Ingresos del día</strong><span>${money(summary.incomeTotal)}</span></div>
            ${summary.incomes.length ? summary.incomes.map(x=>`
              <div class="b232-row">
                <span><strong>${esc(movementLabel(x))}</strong><small class="b232-kind">Ingreso registrado</small></span>
                <strong class="b232-positive">+${money(x.monto)}</strong>
              </div>`).join('') : '<p class="muted">No hay ingresos registrados para este día.</p>'}
          </div>

          <div class="b232-block b232-outflow-panel">
            <div class="b232-panel-title"><strong>Egresos del día</strong><span>${money(summary.outflowTotal)}</span></div>
            ${summary.expenses.map(x=>`
              <div class="b232-row">
                <span><strong>${esc(movementLabel(x))}</strong><small class="b232-kind">Gasto registrado</small></span>
                <strong class="b232-negative">-${money(x.monto)}</strong>
              </div>`).join('')}
            ${summary.scheduled.map(x=>`
              <div class="b232-row">
                <span><strong>${esc(x.label)}</strong><small class="b232-kind">${esc(x.source)} · egreso programado / pendiente</small></span>
                <strong class="b232-negative">-${money(x.amount)}</strong>
              </div>`).join('')}
            ${summary.outflowTotal===0 ? '<p class="muted">No hay egresos registrados ni programados para este día.</p>' : ''}
          </div>
        </div>

        <div class="b232-row b232-day-total">
          <span><strong>Flujo neto del día</strong><small class="b232-kind">Ingresos − gastos registrados − egresos programados</small></span>
          <strong class="${summary.net>=0?'b232-positive':'b232-negative'}">${summary.net>=0?'+':'-'}${money(Math.abs(summary.net))}</strong>
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
