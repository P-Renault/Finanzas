/* ============================================================
   B232.26 — CALENDARIO INTEGRAL / CIERRE P2.1
   ÚNICO MOTOR VISUAL DEL CALENDARIO
   ============================================================ */
(() => {
  'use strict';
  const VERSION='232.26';
  if(window.__B23226_CALENDAR__) return;
  window.__B23226_CALENDAR__=true;

  const $=id=>document.getElementById(id);
  const n=v=>Number(v)||0;
  const money=v=>new Intl.NumberFormat('es-CL',{style:'currency',currency:'CLP',maximumFractionDigits:0}).format(n(v));
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const today=()=>{const d=new Date();return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,10)};
  const date=(x,...keys)=>{for(const k of keys){if(x?.[k])return String(x[k]).slice(0,10)}return ''};
  const isIn=x=>['ingreso','income'].includes(String(x?.tipo||'').toLowerCase());
  const isOut=x=>['gasto','egreso','expense'].includes(String(x?.tipo||'').toLowerCase());
  const isPaid=x=>['pagada','pagado','cancelada','cancelado','pago','paid','cobrado'].includes(String(x?.estado||x?.estado_cobro||'').toLowerCase());

  let db=null;
  let month=new Date(new Date().getFullYear(),new Date().getMonth(),1);
  let selected=today();
  let DATA={mov:[],futureIn:[],plannedOut:[],commitments:[],quotas:[],generation:[],accounts:[],close:null,errors:[]};

  function client(){
    if(db)return db;
    const u=localStorage.getItem('sf_url'),k=localStorage.getItem('sf_key');
    if(!u||!k||!window.supabase)return null;
    try{db=window.supabase.createClient(u,k,{auth:{persistSession:false,autoRefreshToken:false}});return db}
    catch(e){console.error('[B232.26]',e);return null}
  }

  async function q(label,p){
    try{
      const r=await p;
      if(r?.error){DATA.errors.push(label+': '+r.error.message);return []}
      return r?.data||[];
    }catch(e){DATA.errors.push(label+': '+(e?.message||e));return []}
  }

  function css(){
    if($('b23226Style'))return;
    const s=document.createElement('style');s.id='b23226Style';s.textContent=`
      #calendario.b23226-host{display:block!important}
      .b23226-card{background:#fff;border:1px solid #e5e7eb;border-radius:14px;padding:14px;box-shadow:0 2px 8px rgba(15,23,42,.05)}
      .b23226-head{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap}.b23226-head h2{margin:2px 0;font-size:20px}.b23226-sub{font-size:11px;color:#64748b}.b23226-actions{display:flex;gap:6px;flex-wrap:wrap}.b23226-actions button{border:0;border-radius:8px;padding:8px 11px;background:#111827;color:#fff;font-weight:700;cursor:pointer}.b23226-actions button.secondary{background:#e5e7eb;color:#111827}
      .b23226-status{margin:8px 0;padding:7px 9px;border-radius:8px;background:#f8fafc;color:#475569;font-size:11px}.b23226-status.ok{background:#ecfdf5;color:#166534}.b23226-status.warn{background:#fff7ed;color:#9a3412}
      .b23226-kpis{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:8px;margin:10px 0}.b23226-kpi{border:1px solid #e5e7eb;border-radius:10px;padding:9px;background:#fff}.b23226-kpi span,.b23226-kpi small{display:block;color:#64748b;font-size:10px}.b23226-kpi strong{display:block;margin-top:3px;font-size:16px}
      .b23226-scroll{overflow:auto;border:1px solid #e5e7eb;border-radius:11px}.b23226-grid{display:grid;grid-template-columns:repeat(7,minmax(110px,1fr));min-width:770px}.b23226-week>div{padding:7px;text-align:center;background:#111827;color:#fff;font-size:10px;font-weight:800}.b23226-day{min-height:142px;padding:6px;border:0;border-right:1px solid #e5e7eb;border-bottom:1px solid #e5e7eb;background:#fff;text-align:left;cursor:pointer}.b23226-day.out{background:#f8fafc;color:#94a3b8}.b23226-day.selected{outline:2px solid #111827;outline-offset:-2px}.b23226-day-top{display:flex;justify-content:space-between;align-items:center;font-size:11px}.b23226-day-top small{font-size:8px}.b23226-event{display:block;margin-top:3px;padding:3px 4px;border-radius:5px;font-size:8px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.b23226-real-in{background:#ecfdf5;color:#166534}.b23226-real-out{background:#fef2f2;color:#991b1b}.b23226-plan-in{background:#eff6ff;color:#1d4ed8}.b23226-plan-out{background:#fff7ed;color:#9a3412}.b23226-gen{background:#f5f3ff;color:#6d28d9}.b23226-debt{background:#eef2ff;color:#3730a3}.b23226-more,.b23226-mini{display:block;color:#64748b;font-size:8px;margin-top:3px}.b23226-pos{color:#166534}.b23226-neg{color:#991b1b}
      .b23226-detail{margin-top:12px;display:grid;grid-template-columns:1fr 1fr;gap:10px}.b23226-box{border:1px solid #e5e7eb;border-radius:11px;padding:11px}.b23226-box h3{font-size:12px;margin:0 0 7px}.b23226-row{display:flex;justify-content:space-between;gap:8px;padding:7px 0;border-bottom:1px solid #f1f5f9;font-size:11px}.b23226-row:last-child{border-bottom:0}.b23226-row small{display:block;color:#64748b;font-size:9px}.b23226-foot{margin-top:10px;font-size:10px;color:#64748b}
      @media(max-width:760px){.b23226-kpis{grid-template-columns:repeat(2,minmax(0,1fr))}.b23226-detail{grid-template-columns:1fr}.b23226-card{padding:10px}}
    `;document.head.appendChild(s);
  }

  async function load(){
    const c=client();
    if(!c){renderError('Supabase no está conectado.');return}
    DATA.errors=[];
    const closeP=c.from('cierres_financieros').select('*').eq('activo',true).order('fecha_corte',{ascending:false}).limit(1);
    const accountsP=c.from('cuentas_bancarias').select('*').eq('activa',true);
    const [mov,futureIn,plannedOut,commitments,quotas,generation,accounts,close]=await Promise.all([
      q('movimientos',c.from('movimientos').select('*').order('fecha',{ascending:true})),
      q('ingresos_futuros',c.from('ingresos_futuros').select('*').order('fecha',{ascending:true})),
      q('gastos_planificados',c.from('gastos_planificados').select('*').order('fecha',{ascending:true})),
      q('compromisos',c.from('compromisos').select('*').order('fecha_vencimiento',{ascending:true})),
      q('cuotas_deuda',c.from('cuotas_deuda').select('*').order('fecha_vencimiento',{ascending:true})),
      q('generacion_ingresos',c.from('generacion_ingresos').select('*').order('fecha_generacion',{ascending:true})),
      q('cuentas_bancarias',accountsP),
      q('cierres_financieros',closeP)
    ]);
    DATA={mov,futureIn,plannedOut,commitments,quotas,generation,accounts,close:close[0]||null,errors:DATA.errors};
    render();
  }

  function baseBalance(){
    const c=DATA.close;
    if(c && c.saldo_efectivo_actual!=null)return n(c.saldo_efectivo_actual);
    if(c && c.saldo_inicial!=null)return n(c.saldo_inicial);
    if(DATA.accounts.length)return DATA.accounts.reduce((s,x)=>s+n(x.saldo_actual),0);
    return 0;
  }

  function key(d){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}

  function monthRows(){
    const y=month.getFullYear(),m=month.getMonth(),last=new Date(y,m+1,0).getDate(),map={};
    for(let i=1;i<=last;i++){const k=key(new Date(y,m,i));map[k]={k,mov:[],inc:[],out:[],comm:[],quota:[],gen:[],realIn:0,realOut:0,planIn:0,planOut:0,commOut:0,debtOut:0,generated:0,collected:0,balance:0,flow:0,projected:0}}
    const put=(k,t,x)=>{if(map[k])map[k][t].push(x)};
    DATA.mov.forEach(x=>put(date(x,'fecha'),'mov',x));
    DATA.futureIn.forEach(x=>{const k=date(x,'fecha','fecha_vencimiento','fecha_cobro');if(k&&!isPaid(x))put(k,'inc',x)});
    DATA.plannedOut.forEach(x=>{const k=date(x,'fecha','fecha_vencimiento');if(k&&!isPaid(x))put(k,'out',x)});
    DATA.commitments.forEach(x=>{const k=date(x,'fecha_vencimiento','fecha');if(k&&!isPaid(x))put(k,'comm',x)});
    DATA.quotas.forEach(x=>{const k=date(x,'fecha_vencimiento');if(k)put(k,'quota',x)});
    DATA.generation.forEach(x=>{const st=String(x.estado_cobro||'').toLowerCase();if(st==='cancelado')return;const k=date(x,'fecha_cobro','fecha_generacion');if(k)put(k,'gen',x)});
    let bal=baseBalance();
    const first=`${y}-${String(m+1).padStart(2,'0')}-01`;
    for(const x of DATA.mov.filter(z=>date(z,'fecha')<first))bal+=isIn(x)?n(x.monto):isOut(x)?-n(x.monto):0;
    const out=[];
    for(const k of Object.keys(map).sort()){
      const r=map[k];
      r.realIn=r.mov.filter(isIn).reduce((s,x)=>s+n(x.monto),0);
      r.realOut=r.mov.filter(isOut).reduce((s,x)=>s+n(x.monto),0);
      r.planIn=r.inc.reduce((s,x)=>s+n(x.monto),0);
      r.planOut=r.out.reduce((s,x)=>s+n(x.monto),0);
      r.commOut=r.comm.reduce((s,x)=>s+n(x.monto),0);
      r.debtOut=r.quota.filter(x=>!isPaid(x)).reduce((s,x)=>s+n(x.monto),0);
      r.generated=r.gen.reduce((s,x)=>s+n(x.monto_neto),0);
      r.collected=r.gen.filter(x=>String(x.estado_cobro||'').toLowerCase()==='cobrado').reduce((s,x)=>s+n(x.monto_neto),0);
      bal+=r.realIn-r.realOut;r.balance=bal;
      r.flow=r.realIn+r.planIn+r.collected-r.realOut-r.planOut-r.commOut-r.debtOut;
      r.projected=bal+r.planIn+r.generated-r.planOut-r.commOut-r.debtOut;
      out.push(r);
    }
    return out;
  }

  function renderError(msg){const h=$('calendario');if(h)h.innerHTML=`<div class="b23226-card"><h2>Calendario 360°</h2><div class="b23226-status warn">${esc(msg)}</div></div>`}

  function render(){
    const host=$('calendario');if(!host)return;css();host.classList.add('b23226-host');
    const rows=monthRows(),map=Object.fromEntries(rows.map(x=>[x.k,x])),y=month.getFullYear(),m=month.getMonth();
    const first=new Date(y,m,1),start=new Date(first);start.setDate(1-first.getDay());
    const days=Array.from({length:42},(_,i)=>{const d=new Date(start);d.setDate(start.getDate()+i);return d});
    const selectedRow=map[selected]||{k:selected,mov:[],inc:[],out:[],comm:[],quota:[],gen:[],realIn:0,realOut:0,planIn:0,planOut:0,commOut:0,debtOut:0,generated:0,collected:0,balance:baseBalance(),flow:0,projected:baseBalance()};
    const total=f=>rows.reduce((s,x)=>s+n(x[f]),0);
    const monthName=month.toLocaleDateString('es-CL',{month:'long',year:'numeric'}).replace(/^./,c=>c.toUpperCase());
    const selectedLabel=new Date(selected+'T12:00:00').toLocaleDateString('es-CL',{weekday:'long',day:'numeric',month:'long',year:'numeric'}).replace(/^./,c=>c.toUpperCase());
    host.innerHTML=`<div class="b23226-card">
      <div class="b23226-head"><div><div class="b23226-sub">B232.26 · CIERRE P2.1 · CALENDARIO 360°</div><h2>${monthName}</h2><div class="b23226-sub">Real + proyectado + generación + compromisos + deuda + control de caja.</div></div><div class="b23226-actions"><button id="b23226Prev">‹</button><button id="b23226Today" class="secondary">Hoy</button><button id="b23226Next">›</button><button id="b23226Refresh">Actualizar</button></div></div>
      <div class="b23226-status ${DATA.errors.length?'warn':'ok'}">${DATA.errors.length?`Fuentes con advertencia: ${DATA.errors.length}. El calendario continúa con las fuentes disponibles.`:'Todas las fuentes disponibles fueron procesadas.'}</div>
      <div class="b23226-kpis"><div class="b23226-kpi"><span>Ingresos reales</span><strong>${money(total('realIn'))}</strong><small>movimientos</small></div><div class="b23226-kpi"><span>Ingresos proyectados</span><strong>${money(total('planIn'))}</strong><small>ingresos futuros</small></div><div class="b23226-kpi"><span>Generación neta</span><strong>${money(total('generated'))}</strong><small>multifuente</small></div><div class="b23226-kpi"><span>Egresos reales</span><strong>${money(total('realOut'))}</strong><small>movimientos</small></div><div class="b23226-kpi"><span>Obligaciones</span><strong>${money(total('planOut')+total('commOut')+total('debtOut'))}</strong><small>plan + compromisos + cuotas</small></div><div class="b23226-kpi"><span>Saldo base</span><strong>${money(baseBalance())}</strong><small>cierre/cuentas</small></div></div>
      <div class="b23226-scroll"><div class="b23226-grid b23226-week"><div>DOM</div><div>LUN</div><div>MAR</div><div>MIÉ</div><div>JUE</div><div>VIE</div><div>SÁB</div>${days.map(d=>{const k=key(d),r=map[k],items=[];if(r){r.mov.forEach(x=>items.push(`<span class="b23226-event ${isIn(x)?'b23226-real-in':'b23226-real-out'}">${isIn(x)?'↑':'↓'} ${money(x.monto)} · ${esc(x.categoria||x.descripcion||'Movimiento')}</span>`));r.inc.forEach(x=>items.push(`<span class="b23226-event b23226-plan-in">⇢ ${money(x.monto)} · ${esc(x.concepto||'Ingreso futuro')}</span>`));r.out.forEach(x=>items.push(`<span class="b23226-event b23226-plan-out">● ${money(x.monto)} · ${esc(x.concepto||x.categoria||'Gasto planificado')}</span>`));r.comm.forEach(x=>items.push(`<span class="b23226-event b23226-plan-out">◆ ${money(x.monto)} · ${esc(x.concepto||'Compromiso')}</span>`));r.quota.forEach(x=>items.push(`<span class="b23226-event b23226-debt">▣ ${money(x.monto)} · Cuota ${esc(x.numero_cuota||'')}</span>`));r.gen.forEach(x=>items.push(`<span class="b23226-event b23226-gen">⚙ ${money(x.monto_neto)} · ${esc(x.actividad||x.descripcion||'Generación')}</span>`))}return `<button type="button" class="b23226-day ${d.getMonth()===m?'':'out'} ${k===selected?'selected':''}" data-b23226-date="${k}"><div class="b23226-day-top"><strong>${d.getDate()}</strong>${k===today()?'<small>HOY</small>':''}</div>${items.slice(0,6).join('')}${items.length>6?`<span class="b23226-more">+${items.length-6} más</span>`:''}${r?`<span class="b23226-mini">Saldo ${money(r.balance)}</span><span class="b23226-mini ${r.flow>=0?'b23226-pos':'b23226-neg'}">Flujo ${money(r.flow)}</span><span class="b23226-mini">Proyección ${money(r.projected)}</span>`:''}</button>`}).join('')}</div></div>
      <div class="b23226-detail"><div class="b23226-box"><h3>Detalle · ${esc(selectedLabel)}</h3><div class="b23226-row"><span>Ingresos reales</span><strong>${money(selectedRow.realIn)}</strong></div>${selectedRow.mov.filter(isIn).map(x=>`<div class="b23226-row"><span>${esc(x.categoria||x.descripcion||'Ingreso')}<small>Movimiento real</small></span><strong>${money(x.monto)}</strong></div>`).join('')||'<div class="b23226-row"><span>Sin ingresos reales</span><strong>$0</strong></div>'}<div class="b23226-row"><span>Ingresos futuros</span><strong>${money(selectedRow.planIn)}</strong></div>${selectedRow.inc.map(x=>`<div class="b23226-row"><span>${esc(x.concepto||'Ingreso futuro')}<small>Proyectado</small></span><strong>${money(x.monto)}</strong></div>`).join('')}<div class="b23226-row"><span>Generación multifuente</span><strong>${money(selectedRow.generated)}</strong></div>${selectedRow.gen.map(x=>`<div class="b23226-row"><span>${esc(x.actividad||x.descripcion||'Generación')}<small>${esc(x.estado_cobro||'')}</small></span><strong>${money(x.monto_neto)}</strong></div>`).join('')}</div><div class="b23226-box"><h3>Egresos y obligaciones</h3><div class="b23226-row"><span>Gastos reales</span><strong>${money(selectedRow.realOut)}</strong></div><div class="b23226-row"><span>Planificados</span><strong>${money(selectedRow.planOut)}</strong></div><div class="b23226-row"><span>Compromisos</span><strong>${money(selectedRow.commOut)}</strong></div><div class="b23226-row"><span>Cuotas pendientes</span><strong>${money(selectedRow.debtOut)}</strong></div>${selectedRow.quota.filter(x=>!isPaid(x)).map(x=>`<div class="b23226-row"><span>Cuota ${esc(x.numero_cuota||'')}<small>${esc(x.estado||'pendiente')}</small></span><strong>${money(x.monto)}</strong></div>`).join('')}</div></div>
      <div class="b23226-foot">Saldo real acumulado: <b>${money(selectedRow.balance)}</b> · Flujo del día: <b class="${selectedRow.flow>=0?'b23226-pos':'b23226-neg'}">${money(selectedRow.flow)}</b> · Saldo proyectado: <b>${money(selectedRow.projected)}</b>.</div>
    </div>`;
    $('b23226Prev').onclick=()=>{month.setMonth(month.getMonth()-1);selected=key(new Date(month.getFullYear(),month.getMonth(),1));render()};
    $('b23226Next').onclick=()=>{month.setMonth(month.getMonth()+1);selected=key(new Date(month.getFullYear(),month.getMonth(),1));render()};
    $('b23226Today').onclick=()=>{month=new Date(new Date().getFullYear(),new Date().getMonth(),1);selected=today();render()};
    $('b23226Refresh').onclick=()=>load();
    host.querySelectorAll('[data-b23226-date]').forEach(b=>b.onclick=()=>{selected=b.dataset.b23226Date;render()});
  }

  function activate(){
    css();
    const host=$('calendario');
    if(!host)return;
    const stored=localStorage.getItem('cf_active_tab_v2');
    if(stored==='calendario'){
      document.querySelectorAll('.tab').forEach(x=>x.classList.toggle('hidden',x.id!=='calendario'));
      document.querySelectorAll('.tabs button[data-tab]').forEach(x=>x.classList.toggle('active',x.dataset.tab==='calendario'));
    }
    load();
  }

  window.B232Calendario={version:VERSION,load,render};
  window.B23226Calendar={version:VERSION,load,render,activate};

  document.addEventListener('click',e=>{
    const b=e.target.closest?.('.tabs button[data-tab="calendario"]');
    if(!b)return;
    localStorage.setItem('cf_active_tab_v2','calendario');
    setTimeout(()=>{window.B232Calendario={version:VERSION,load,render};load()},0);
  },true);

  // El cargador legacy puede sobrescribir el objeto después de iniciar. Reinstalamos
  // el propietario visual durante el arranque, sin duplicar la implementación.
  let checks=0;
  const guard=setInterval(()=>{
    window.B232Calendario={version:VERSION,load,render};
    checks++; if(checks>24)clearInterval(guard);
    const host=$('calendario');
    if(host && !host.classList.contains('hidden') && !host.querySelector('.b23226-card')) load();
  },500);

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(activate,700),{once:true});
  else setTimeout(activate,700);
})();
