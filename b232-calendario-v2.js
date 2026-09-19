/* ============================================================
   B232 — CALENDARIO V2
   Calendario integrado: movimientos + compromisos + cuotas de deuda.
   No modifica saldos ni registra operaciones.
   Deudas sin fecha NO aparecen en el calendario.
   ============================================================ */
(() => {
  'use strict';

  const VERSION = '232.5';
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
  let data = {mov:[], fut:[], quotas:[], debts:[]};

  const norm = v => String(v ?? '').trim().toLowerCase();

  function commitmentFlow(x){
    const explicit = [
      x.tipo, x.naturaleza, x.flujo, x.clase, x.tipo_movimiento,
      x.tipo_compromiso
    ].map(norm).find(v => ['ingreso','ingresos','entrada','cobro','cobros'].includes(v));
    if(explicit) return 'ingreso';

    const text = [
      x.categoria, x.concepto, x.notas, x.descripcion
    ].map(norm).join(' ');

    if(/\b(pension|pensión|ganancia|ganancias|beneficio|beneficios|servicio|servicios|cobro|cobros|ingreso|ingresos|sueldo|honorario|venta|devolucion|devolución)\b/.test(text)){
      return 'ingreso';
    }
    return 'gasto';
  }

  function commitmentIsPending(x){
    const st=norm(x.estado);
    return !st || ['pendiente','vencido','vencida','programado','programada','activo','activa'].includes(st);
  }

  function isPaidQuota(x){
    return ['pagada','pagado','cancelada','cancelado','anulada','anulado'].includes(norm(x.estado));
  }

  function commitmentStep(periodicidad){
    const p=norm(periodicidad);
    if(['diario','diaria','daily'].includes(p)) return 'day';
    if(['semanal','semanalmente','weekly'].includes(p)) return 'week';
    if(['quincenal','cada 15 dias','cada 15 días','15 dias','15 días'].includes(p)) return '15days';
    if(['mensual','monthly'].includes(p)) return 'month';
    if(['bimensual','cada 2 meses'].includes(p)) return '2months';
    return null;
  }

  function shiftOccurrence(date,step){
    const d=parseDate(date);
    if(step==='day') d.setDate(d.getDate()+1);
    else if(step==='week') d.setDate(d.getDate()+7);
    else if(step==='15days') d.setDate(d.getDate()+15);
    else if(step==='month') d.setMonth(d.getMonth()+1);
    else if(step==='2months') d.setMonth(d.getMonth()+2);
    return dateKey(d);
  }

  function addCommitmentOccurrences(rows,fromKey,toKey){
    const out=[];
    for(const x of rows){
      if(!x.fecha_vencimiento || !commitmentIsPending(x)) continue;
      const step=commitmentStep(x.periodicidad);
      if(!step){
        if(x.fecha_vencimiento>=fromKey && x.fecha_vencimiento<=toKey)
          out.push({...x,_occurrence_date:x.fecha_vencimiento,_recurring:false});
        continue;
      }
      let cursor=x.fecha_vencimiento;
      let guard=0;
      while(cursor>fromKey && guard<240){
        const prev=parseDate(cursor);
        if(step==='day') prev.setDate(prev.getDate()-1);
        else if(step==='week') prev.setDate(prev.getDate()-7);
        else if(step==='15days') prev.setDate(prev.getDate()-15);
        else if(step==='month') prev.setMonth(prev.getMonth()-1);
        else if(step==='2months') prev.setMonth(prev.getMonth()-2);
        cursor=dateKey(prev);
        guard++;
      }
      guard=0;
      while(cursor<=toKey && guard<240){
        if(cursor>=fromKey) out.push({...x,_occurrence_date:cursor,_recurring:true});
        cursor=shiftOccurrence(cursor,step);
        guard++;
      }
    }
    return out;
  }

  function dateMinusDays(key,n){
    const d=parseDate(key); d.setDate(d.getDate()-n); return dateKey(d);
  }

  function datePlusDays(key,n){
    const d=parseDate(key); d.setDate(d.getDate()+n); return dateKey(d);
  }

  function debtLabel(q){
    const d=data.debts.find(x=>String(x.id)===String(q.deuda_id));
    const base=d?.acreedor || d?.concepto || d?.nombre || d?.descripcion || 'Deuda';
    return `${base} · Cuota #${q.numero_cuota}`;
  }

  /*
   * B232.5 — duración real del compromiso.
   * NO existe una ventana fija de 15 días.
   * Para una cuota, el período visible se obtiene desde el inicio del crédito
   * o desde la cuota anterior hasta su vencimiento.
   * Para un compromiso periódico, el período visible se obtiene desde la
   * ocurrencia anterior hasta la ocurrencia actual.
   */
  function quotaTrackingStart(q){
    const due=q.fecha_vencimiento;
    if(!due) return null;
    const same=data.quotas
      .filter(x=>String(x.deuda_id)===String(q.deuda_id) && x.fecha_vencimiento && x.fecha_vencimiento<due)
      .sort((a,b)=>a.fecha_vencimiento.localeCompare(b.fecha_vencimiento));
    if(same.length) return datePlusDays(same.at(-1).fecha_vencimiento,1);
    const debt=data.debts.find(x=>String(x.id)===String(q.deuda_id));
    return debt?.fecha_inicio || due;
  }

  function commitmentTrackingStart(x,due){
    const step=commitmentStep(x.periodicidad);
    if(!step) return due;
    const prev=shiftOccurrence(due,step==='day'?'day':step==='week'?'week':step==='15days'?'15days':step==='month'?'month':'2months');
    return datePlusDays(prev,1);
  }

  function inRange(key,start,end){
    return !!start && key>=start && key<=end;
  }

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
      c.from('movimientos').select('*').order('fecha',{ascending:true}),
      c.from('compromisos').select('*').order('fecha_vencimiento',{ascending:true}),
      c.from('cuotas_deuda').select('id,deuda_id,numero_cuota,monto,fecha_vencimiento,estado')
        .order('fecha_vencimiento',{ascending:true}),
      c.from('deudas').select('id,acreedor,concepto')
    ]);

    for(const r of [mov,fut,quotas,debtRows]) if(r.error) throw r.error;

    data={
      mov:mov.data||[],
      fut:fut.data||[],
      quotas:(quotas.data||[]).filter(x=>x.fecha_vencimiento && !isPaidQuota(x)),
      debts:debtRows.data||[]
    };
    render();
  }

  function monthRows(){
    const y=month.getFullYear(), m=month.getMonth();
    const first=new Date(y,m,1), last=new Date(y,m+1,0);
    const monthStart=dateKey(first), monthEnd=dateKey(last);

    const movementBy={}, futureBy={}, quotaBy={}, planningBy={};
    for(const x of data.mov)(movementBy[x.fecha]??=[]).push(x);

    const commitments=addCommitmentOccurrences(
      data.fut,
      dateMinusDays(monthStart,14),
      datePlusDays(monthEnd,14)
    );

    for(const x of commitments){
      const k=x._occurrence_date || x.fecha_vencimiento;
      (futureBy[k]??=[]).push(x);
    }

    for(const x of data.quotas){
      if(x.fecha_vencimiento)(quotaBy[x.fecha_vencimiento]??=[]).push(x);
      const start=quotaTrackingStart(x);
      const end=x.fecha_vencimiento;
      const from=start<monthStart?monthStart:start;
      const to=end>monthEnd?monthEnd:end;
      let d=parseDate(from), stop=parseDate(to);
      while(d<=stop){
        const k=dateKey(d);
        (planningBy[k]??=[]).push({...x,_planningOnly:k!==x.fecha_vencimiento,_due_date:x.fecha_vencimiento,_trackingStart:start,_trackingEnd:end,_label:debtLabel(x)});
        d.setDate(d.getDate()+1);
      }
    }

    for(const x of commitments){
      const due=x._occurrence_date || x.fecha_vencimiento;
      const start=dateMinusDays(due,14);
      const end=due;
      const from=start<monthStart?monthStart:start;
      const to=end>monthEnd?monthEnd:end;
      let d=parseDate(from), stop=parseDate(to);
      while(d<=stop){
        const k=dateKey(d);
        const arr=planningBy[k]??=[];
        const exists=arr.some(a=>a._planningCommitId===x.id && a._occurrence_date===due);
        if(!exists) arr.push({...x,_planningOnly:k!==due,_due_date:due,_planningCommitId:x.id,_planningCommit:true});
        planningBy[k]=arr;
        d.setDate(d.getDate()+1);
      }
    }

    const rows=[];
    let running=0;

    const beforeMov=data.mov.filter(x=>x.fecha<monthStart);
    for(const x of beforeMov)
      running += norm(x.tipo)==='ingreso'?Number(x.monto||0):-Number(x.monto||0);

    const beforeCommit=commitments.filter(x=>(x._occurrence_date||x.fecha_vencimiento)<monthStart);
    for(const x of beforeCommit){
      const k=x._occurrence_date||x.fecha_vencimiento;
      if(k<monthStart) running += commitmentFlow(x)==='ingreso'?Number(x.monto||0):-Number(x.monto||0);
    }

    const beforeQuota=data.quotas.filter(x=>x.fecha_vencimiento<monthStart);
    for(const x of beforeQuota) running -= Number(x.monto||0);

    for(let day=1;day<=last.getDate();day++){
      const key=`${y}-${String(m+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
      const movements=movementBy[key]||[];
      const commitmentsToday=(futureBy[key]||[]).filter(x=>commitmentIsPending(x));
      const debtQuotas=quotaBy[key]||[];
      const planning=planningBy[key]||[];

      const incomeMov=movements.filter(x=>norm(x.tipo)==='ingreso');
      const expenseMov=movements.filter(x=>norm(x.tipo)==='gasto');
      const incomeComm=commitmentsToday.filter(x=>commitmentFlow(x)==='ingreso');
      const expenseComm=commitmentsToday.filter(x=>commitmentFlow(x)==='gasto');

      const income=incomeMov.reduce((s,x)=>s+Number(x.monto||0),0)+incomeComm.reduce((s,x)=>s+Number(x.monto||0),0);
      const expense=expenseMov.reduce((s,x)=>s+Number(x.monto||0),0)+expenseComm.reduce((s,x)=>s+Number(x.monto||0),0);
      const debt=debtQuotas.reduce((s,x)=>s+Number(x.monto||0),0);

      running += income-expense-debt;

      rows.push({
        key,day,income,expense,
        scheduled:expenseComm.reduce((s,x)=>s+Number(x.monto||0),0)+debt,
        debt,
        balance:running,
        movements,
        commitments:commitmentsToday,
        debtQuotas,
        planning
      });
    }

    return {rows,movementBy,futureBy,quotaBy,planningBy};
  }

  function injectStyle(){
    if($('b232Style')) return;
    const s=document.createElement('style');
    s.id='b232Style';
    s.textContent=`
      .b232-toolbar{display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap}
      .b232-nav{display:flex;gap:8px}
      .b232-nav button{min-width:44px}
      .b232-metrics{display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin:12px 0}
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
      .b232-planning{background:#f8fafc;color:#475569;border:1px dashed #cbd5e1}
      .b232-selected-summary{border:1px solid #e5e7eb;border-radius:12px;padding:10px;background:#fff;margin:12px 0}
      .b232-selected-summary-head{display:flex;justify-content:space-between;align-items:center;gap:10px}
      .b232-selected-summary-head>div{display:flex;flex-direction:column;gap:2px}
      .b232-day-income{background:#ecfdf5}
      .b232-day-expense{background:#fff7ed}
      .b232-day-payment{background:#fef3c7}
      .b232-day-balance{background:#eff6ff}
      .b232-positive{color:#15803d}
      .b232-negative{color:#b91c1c}
      .b232-panel-title{display:flex;justify-content:space-between;gap:8px;align-items:center;padding-bottom:8px;border-bottom:1px solid #e5e7eb}
      .b232-income-panel{background:#f8fffb}
      .b232-outflow-panel{background:#fffaf5}
      .b232-day-total{margin-top:10px;background:#f8fafc;border-radius:10px;padding:10px}
      .b232-date-badge{background:#e0f2fe;color:#075985;border-radius:999px;padding:5px 9px;font-size:.72rem;font-weight:700}
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

    const r=byKey[selected] || {income:0,expense:0,scheduled:0,balance:0,movements:[],commitments:[],debtQuotas:[],planning:[]};
    const incomeDay=r.income;
    const expenseDay=r.expense;
    const scheduledDay=r.scheduled;
    const selectedDate=parseDate(selected);
    const label=selectedDate.toLocaleDateString('es-CL',{
      weekday:'long',day:'numeric',month:'long',year:'numeric'
    }).replace(/^./,c=>c.toUpperCase());

    host.innerHTML=`
      <div class="card">
        <div class="b232-toolbar">
          <div>
            <span class="muted">B232 · CALENDARIO V2.5</span>
            <h2>${month.toLocaleDateString('es-CL',{month:'long',year:'numeric'})}</h2>
          </div>
          <div class="b232-nav">
            <button type="button" class="secondary" id="b232Prev">‹</button>
            <button type="button" class="secondary" id="b232Today">Hoy</button>
            <button type="button" class="secondary" id="b232Next">›</button>
          </div>
        </div>

        <div class="b232-selected-summary">
          <div class="b232-selected-summary-head">
            <div>
              <span class="muted">CONSOLIDADO DEL DÍA SELECCIONADO</span>
              <strong>${esc(label)}</strong>
            </div>
            <span class="b232-date-badge">${esc(selected)}</span>
          </div>
          <div class="b232-metrics">
            <div class="b232-metric b232-day-income">
              <span>Ingresos del día</span><strong>${money(incomeDay)}</strong>
              <small>Compromisos de ingreso + pagos/ganancias/beneficios + ingresos registrados</small>
            </div>
            <div class="b232-metric b232-day-expense">
              <span>Egresos del día</span><strong>${money(expenseDay)}</strong>
              <small>Gastos + deudas + compromisos de egreso</small>
            </div>
            <div class="b232-metric b232-day-payment">
              <span>Pagos programados</span><strong>${money(scheduledDay)}</strong>
              <small>Cuotas y compromisos pendientes con vencimiento este día</small>
            </div>
            <div class="b232-metric b232-day-balance">
              <span>Saldo al cierre</span><strong>${money(r.balance)}</strong>
              <small>Saldo acumulado hasta el día seleccionado</small>
            </div>
          </div>
        </div>

        <div class="b232-legend">
          <span>↑ Ingreso</span><span>↓ Egreso</span>
          <span>● Compromiso</span><span>◆ Deuda</span><span>◌ Seguimiento durante la duración del compromiso</span>
        </div>

        <div class="b232-calendar">
          ${['DOM','LUN','MAR','MIÉ','JUE','VIE','SÁB'].map(x=>`<div>${x}</div>`).join('')}
          ${days.map(d=>{
            const key=dateKey(d), row=byKey[key], inMonth=d.getMonth()===m;
            const items=[];
            for(const x of (row?.movements||[])){
              const inc=norm(x.tipo)==='ingreso';
              items.push(`<span class="b232-event ${inc?'b232-income':'b232-expense'}">${inc?'↑':'↓'} ${money(x.monto)}</span>`);
            }
            for(const x of (row?.commitments||[])){
              const inc=commitmentFlow(x)==='ingreso';
              items.push(`<span class="b232-event ${inc?'b232-income':'b232-commitment'}">${inc?'↑':'●'} ${money(x.monto)}</span>`);
            }
            for(const x of (row?.debtQuotas||[]))
              items.push(`<span class="b232-event b232-debt">◆ ${money(x.monto)}</span>`);
            const planningOnly=(row?.planning||[]).filter(x=>x._planningOnly);
            for(const x of planningOnly.slice(0,2))
              items.push(`<span class="b232-event b232-planning">◌ ${esc(x._label||x.concepto||'Pendiente')} · vence ${esc(x._due_date)}</span>`);

            return `<button type="button" class="b232-day ${inMonth?'':'outside'} ${key===selected?'selected':''}" data-date="${key}">
              <div class="b232-day-head">
                <strong>${d.getDate()}</strong>${key===today()?'<small>HOY</small>':''}
              </div>
              ${items.slice(0,5).join('')}
              ${items.length>5?`<span class="b232-kind">+${items.length-5} más</span>`:''}
              ${inMonth&&row?`<div class="b232-balance">Saldo ${money(row.balance)}</div>`:''}
            </button>`;
          }).join('')}
        </div>

        <div id="b232Detail" class="b232-detail"></div>
        <p class="muted">
          Las obligaciones se muestran durante <b>todo su período de duración</b>, desde el inicio del compromiso o el período anterior hasta su vencimiento.
          La visualización sirve para anticipar recursos, mantener flujo disponible y facilitar la continuidad o renovación del capital.
          Solo afectan el saldo y el consolidado financiero en su fecha efectiva de vencimiento, evitando duplicar un mismo egreso.
        </p>
      </div>
    `;

    $('b232Prev').onclick=()=>{month.setMonth(month.getMonth()-1);selected=dateKey(new Date(month.getFullYear(),month.getMonth(),1));render()};
    $('b232Next').onclick=()=>{month.setMonth(month.getMonth()+1);selected=dateKey(new Date(month.getFullYear(),month.getMonth(),1));render()};
    $('b232Today').onclick=()=>{month=new Date();selected=today();render()};
    host.querySelectorAll('.b232-day').forEach(b=>b.onclick=()=>{selected=b.dataset.date;render()});

    const incomes=[
      ...r.movements.filter(x=>norm(x.tipo)==='ingreso').map(x=>({label:x.categoria||x.descripcion||'Ingreso',sub:x.descripcion||'',amount:Number(x.monto||0)})),
      ...r.commitments.filter(x=>commitmentFlow(x)==='ingreso').map(x=>({label:x.concepto||'Compromiso de ingreso',sub:x.categoria||x.notas||'Compromiso de ingreso',amount:Number(x.monto||0)}))
    ];
    const expenses=[
      ...r.movements.filter(x=>norm(x.tipo)==='gasto').map(x=>({label:x.categoria||'Gasto',sub:x.descripcion||'',amount:Number(x.monto||0),kind:'Gasto registrado'})),
      ...r.commitments.filter(x=>commitmentFlow(x)==='gasto').map(x=>({label:x.concepto||'Compromiso',sub:x.categoria||x.notas||'Compromiso pendiente',amount:Number(x.monto||0),kind:'Compromiso pendiente'})),
      ...r.debtQuotas.map(x=>({label:debtLabel(x),sub:`Deuda · cuota ${x.numero_cuota} · ${x.estado}`,amount:Number(x.monto||0),kind:'Pago de deuda'}))
    ];
    const tracking=(r.planning||[]).filter(x=>x._planningOnly);

    $('b232Detail').innerHTML=`
      <div class="b232-block">
        <div class="b232-detail-head">
          <div><span class="muted">DETALLE ECONÓMICO DEL DÍA</span><h3>${esc(label)}</h3></div>
          <span class="b232-date-badge">${esc(selected)}</span>
        </div>

        <div class="b232-detail-grid">
          <div class="b232-block b232-income-panel">
            <div class="b232-panel-title"><strong>Ingresos</strong><span>${money(incomeDay)}</span></div>
            ${incomes.length?incomes.map(x=>`
              <div class="b232-row">
                <span><strong>${esc(x.label)}</strong><small class="b232-kind">${esc(x.sub||'Ingreso')}</small></span>
                <strong class="b232-positive">+${money(x.amount)}</strong>
              </div>`).join(''):'<p class="muted">No hay ingresos para este día.</p>'}
          </div>

          <div class="b232-block b232-outflow-panel">
            <div class="b232-panel-title"><strong>Egresos</strong><span>${money(expenseDay)}</span></div>
            ${expenses.length?expenses.map(x=>`
              <div class="b232-row">
                <span><strong>${esc(x.label)}</strong><small class="b232-kind">${esc(x.kind)}${x.sub?' · '+esc(x.sub):''}</small></span>
                <strong class="b232-negative">-${money(x.amount)}</strong>
              </div>`).join(''):'<p class="muted">No hay egresos efectivos para este día.</p>'}

            <div class="scheduled-section">
              <div class="b232-panel-title"><strong>Obligaciones en seguimiento · duración real</strong><span>${tracking.length}</span></div>
              ${tracking.length?tracking.map(x=>`
                <div class="b232-row">
                  <span><strong>${esc(x._label||x.concepto||'Obligación')}</strong><small class="b232-kind">Pendiente · período ${esc(x._trackingStart||selected)} → ${esc(x._due_date)} · vence ${esc(x._due_date)} · aún no afecta el saldo</small></span>
                  <strong>${money(x.monto)}</strong>
                </div>`).join(''):'<p class="muted">No hay obligaciones pendientes dentro de la ventana de seguimiento.</p>'}
            </div>
          </div>
        </div>

        <div class="b232-row b232-day-total">
          <span><strong>Flujo neto del día</strong><small class="b232-kind">Ingresos − egresos efectivos</small></span>
          <strong class="${(incomeDay-expenseDay)>=0?'b232-positive':'b232-negative'}">${(incomeDay-expenseDay)>=0?'+':'-'}${money(Math.abs(incomeDay-expenseDay))}</strong>
        </div>
        <div class="b232-row"><span>Saldo acumulado al cierre del día</span><strong>${money(r.balance)}</strong></div>
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
