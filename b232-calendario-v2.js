/* ============================================================
   B232 — CALENDARIO V2 · B232.9
   Calendario financiero integrado:
   movimientos reales + ingresos proyectados + gastos planificados
   + compromisos + cuotas de deuda + flujo/rentabilidad diaria.
   ============================================================ */
(() => {
  'use strict';

  const VERSION='232.9';
  if(window.B232Calendario?.version===VERSION)return;

  const $=id=>document.getElementById(id);
  const money=n=>new Intl.NumberFormat('es-CL',{style:'currency',currency:'CLP',maximumFractionDigits:0}).format(Number(n)||0);
  const today=()=>{const d=new Date();return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,10)};
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const num=v=>Number(v)||0;
  const isIn=r=>['ingreso','income'].includes(String(r?.tipo||'').toLowerCase());
  const isOut=r=>['gasto','egreso','expense'].includes(String(r?.tipo||'').toLowerCase());
  const isPaid=r=>['pagada','pagado','cancelada','cancelado','pago','paid'].includes(String(r?.estado||'').toLowerCase());
  const parse=s=>new Date(String(s)+'T12:00:00');
  const key=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;

  let c=null,month=new Date(),selected=today();
  let D={mov:[],inc:[],exp:[],comm:[],quota:[],debt:[]};

  async function db(){
    if(c)return c;
    const u=localStorage.getItem('sf_url'),k=localStorage.getItem('sf_key');
    if(!u||!k||!window.supabase)throw Error('Supabase no está conectado.');
    c=window.supabase.createClient(u,k,{auth:{persistSession:false,autoRefreshToken:false}});
    return c;
  }

  async function q(p){
    try{const r=await p;if(r.error){console.warn('[B232.9]',r.error.message);return []}return r.data||[]}
    catch(e){console.warn('[B232.9]',e);return []}
  }

  async function load(){
    const x=await db();
    const [mov,inc,exp,comm,quota,debt]=await Promise.all([
      q(x.from('movimientos').select('*').order('fecha',{ascending:true})),
      q(x.from('ingresos_futuros').select('*').order('fecha',{ascending:true})),
      q(x.from('gastos_planificados').select('*').order('fecha',{ascending:true})),
      q(x.from('compromisos').select('*').order('fecha_vencimiento',{ascending:true})),
      q(x.from('cuotas_deuda').select('id,deuda_id,numero_cuota,monto,fecha_vencimiento,estado').order('fecha_vencimiento',{ascending:true})),
      q(x.from('v_deudas_resumen').select('id,acreedor,concepto'))
    ]);
    const dm=new Map(debt.map(d=>[String(d.id),d]));
    D={mov,inc,exp,comm,quota:quota.map(z=>({...z,deuda:dm.get(String(z.deuda_id))||null})),debt};
    render();
  }

  function build(){
    const y=month.getFullYear(),m=month.getMonth(),first=new Date(y,m,1),last=new Date(y,m+1,0);
    const maps={mov:{},inc:{},exp:{},comm:{},quota:{}};

    for(const r of D.mov)(maps.mov[r.fecha]??=[]).push(r);
    for(const r of D.inc){const d=r.fecha||r.fecha_vencimiento;if(d&&!isPaid(r))(maps.inc[d]??=[]).push(r)}
    for(const r of D.exp){const d=r.fecha||r.fecha_vencimiento;if(d&&!isPaid(r))(maps.exp[d]??=[]).push(r)}
    for(const r of D.comm){const d=r.fecha_vencimiento||r.fecha;if(d&&!isPaid(r))(maps.comm[d]??=[]).push(r)}
    for(const r of D.quota)if(r.fecha_vencimiento)(maps.quota[r.fecha_vencimiento]??=[]).push(r);

    let balance=0;
    for(const r of D.mov.filter(r=>r.fecha<`${y}-${String(m+1).padStart(2,'0')}-01`))
      balance+=isIn(r)?num(r.monto):isOut(r)?-num(r.monto):0;

    const rows=[];
    for(let d=1;d<=last.getDate();d++){
      const k=`${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      const mov=maps.mov[k]||[],inc=maps.inc[k]||[],exp=maps.exp[k]||[],comm=maps.comm[k]||[],quota=maps.quota[k]||[];

      const realIn=mov.filter(isIn).reduce((s,r)=>s+num(r.monto),0);
      const realOut=mov.filter(isOut).reduce((s,r)=>s+num(r.monto),0);
      const planIn=inc.reduce((s,r)=>s+num(r.monto),0);
      const planOut=exp.reduce((s,r)=>s+num(r.monto),0);
      const commOut=comm.reduce((s,r)=>s+num(r.monto),0);
      const debtOut=quota.filter(r=>!isPaid(r)).reduce((s,r)=>s+num(r.monto),0);

      balance+=realIn-realOut;

      rows.push({
        k,mov,inc,exp,comm,quota,realIn,realOut,planIn,planOut,commOut,debtOut,
        profit:realIn-realOut,
        flow:realIn+planIn-realOut-planOut-commOut-debtOut,
        balance
      });
    }
    return {rows,first,last};
  }

  function css(){
    if($('b2329Style'))return;
    const s=document.createElement('style');s.id='b2329Style';
    s.textContent=`
      .b2329-calendar{display:grid;grid-template-columns:repeat(7,minmax(92px,1fr));overflow:auto;border:1px solid #e5e7eb;border-radius:12px}
      .b2329-calendar>div{padding:8px;text-align:center;font-size:.7rem;font-weight:800;border-bottom:1px solid #e5e7eb}
      .b2329-day{min-height:155px;padding:7px;border:0;border-right:1px solid #e5e7eb;border-bottom:1px solid #e5e7eb;background:#fff;text-align:left;cursor:pointer}
      .b2329-day.out{background:#f8fafc;color:#94a3b8}.b2329-day.sel{outline:2px solid #0f172a;outline-offset:-2px}
      .b2329-ev{display:block;font-size:.62rem;padding:3px 5px;border-radius:6px;margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .b2329-real-in{background:#ecfdf5;color:#166534}.b2329-real-out{background:#fef2f2;color:#991b1b}
      .b2329-plan-in{background:#f0fdf4;color:#047857;border:1px dashed #86efac}.b2329-plan-out{background:#fff7ed;color:#9a3412}
      .b2329-debt{background:#eff6ff;color:#1d4ed8}.b2329-paid{opacity:.45;text-decoration:line-through}
      .b2329-kpis{display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin:10px 0}
      .b2329-kpi{border:1px solid #e5e7eb;border-radius:12px;padding:10px;background:#fff}
      .b2329-kpi span,.b2329-kpi small{display:block;color:#64748b;font-size:.72rem}.b2329-kpi strong{display:block;margin-top:4px}
      .b2329-selected{padding:12px;border:1px solid #e5e7eb;border-radius:12px;background:#f8fafc;margin:10px 0}
      .b2329-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:12px}
      .b2329-box{border:1px solid #e5e7eb;border-radius:12px;padding:12px;background:#fff}
      .b2329-row{display:flex;justify-content:space-between;gap:8px;padding:8px 0;border-bottom:1px solid #f1f5f9}
      .b2329-row:last-child{border-bottom:0}
      .b2329-section{font-size:.78rem;font-weight:800;color:#334155;margin:10px 0 4px}
      .b2329-src{font-size:.67rem;color:#64748b;display:block}
      .b2329-pos{color:#166534}.b2329-neg{color:#991b1b}
      .b2329-flow{padding:12px;margin-top:12px;background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px}
      @media(max-width:760px){.b2329-kpis{grid-template-columns:1fr 1fr}.b2329-grid{grid-template-columns:1fr}.b2329-calendar{grid-template-columns:repeat(7,96px)}}
    `;
    document.head.appendChild(s)
  }

  function render(){
    const host=$('calendario');if(!host)return;css();

    const {rows,first}=build();
    const map=Object.fromEntries(rows.map(r=>[r.k,r]));
    const y=month.getFullYear(),m=month.getMonth();
    const gs=new Date(first);gs.setDate(1-first.getDay());
    const days=Array.from({length:42},(_,i)=>{const d=new Date(gs);d.setDate(gs.getDate()+i);return d});
    const r=map[selected]||{k:selected,mov:[],inc:[],exp:[],comm:[],quota:[],realIn:0,realOut:0,planIn:0,planOut:0,commOut:0,debtOut:0,profit:0,flow:0,balance:0};

    const label=parse(selected).toLocaleDateString('es-CL',{weekday:'long',day:'numeric',month:'long',year:'numeric'}).replace(/^./,c=>c.toUpperCase());
    const sum=f=>rows.reduce((s,x)=>s+num(x[f]),0);

    host.innerHTML=`
      <div class="card">
        <div class="b232-toolbar">
          <div><span class="muted">B232 · CALENDARIO FINANCIERO · 232.9</span><h2>${month.toLocaleDateString('es-CL',{month:'long',year:'numeric'})}</h2></div>
          <div class="b232-nav"><button type="button" class="secondary" id="b2329Prev">‹</button><button type="button" class="secondary" id="b2329Today">Hoy</button><button type="button" class="secondary" id="b2329Next">›</button></div>
        </div>

        <div class="b2329-selected"><b>RESUMEN DEL DÍA SELECCIONADO</b><div>${esc(label)}</div><small>Las variables superiores corresponden exclusivamente al día seleccionado.</small></div>

        <div class="b2329-kpis">
          <div class="b2329-kpi"><span>Ingresos recibidos</span><strong>${money(r.realIn)}</strong><small>reales</small></div>
          <div class="b2329-kpi"><span>Gastos pagados</span><strong>${money(r.realOut)}</strong><small>reales</small></div>
          <div class="b2329-kpi"><span>Ingresos proyectados</span><strong>${money(r.planIn)}</strong><small>plan diario</small></div>
          <div class="b2329-kpi"><span>Obligaciones</span><strong>${money(r.planOut+r.commOut+r.debtOut)}</strong><small>gasto + compromiso + cuota</small></div>
          <div class="b2329-kpi"><span>Flujo proyectado</span><strong>${money(r.flow)}</strong><small>impacto de caja</small></div>
        </div>

        <div class="muted">
          Mes completo · Ingresos reales ${money(sum('realIn'))} · Gastos reales ${money(sum('realOut'))} ·
          Ingresos proyectados ${money(sum('planIn'))} · Egresos planificados ${money(sum('planOut'))} ·
          Compromisos ${money(sum('commOut'))} · Cuotas pendientes ${money(sum('debtOut'))}
        </div>

        <div class="b2329-calendar">
          ${['DOM','LUN','MAR','MIÉ','JUE','VIE','SÁB'].map(x=>'<div>'+x+'</div>').join('')}
          ${days.map(d=>{
            const k=key(d),x=map[k],inside=d.getMonth()===m,items=[];
            for(const z of (x?.mov||[]))items.push('<span class="b2329-ev '+(isIn(z)?'b2329-real-in':'b2329-real-out')+'">'+(isIn(z)?'↑':'↓')+' '+money(z.monto)+' · '+esc(z.categoria||z.descripcion||'')+'</span>');
            for(const z of (x?.inc||[]))items.push('<span class="b2329-ev b2329-plan-in">⇢ '+money(z.monto)+' · '+esc(z.concepto||z.categoria||'Ingreso planificado')+'</span>');
            for(const z of (x?.exp||[]))items.push('<span class="b2329-ev b2329-plan-out">● '+money(z.monto)+' · '+esc(z.concepto||z.categoria||'Gasto planificado')+'</span>');
            for(const z of (x?.comm||[]))items.push('<span class="b2329-ev b2329-plan-out">● '+money(z.monto)+' · '+esc(z.concepto||'Compromiso')+'</span>');
            for(const z of (x?.quota||[]))items.push('<span class="b2329-ev b2329-debt '+(isPaid(z)?'b2329-paid':'')+'">◆ '+money(z.monto)+' · Cuota '+esc(z.numero_cuota)+(z.deuda?.acreedor?' · '+esc(z.deuda.acreedor):'')+'</span>');
            return '<button type="button" class="b2329-day '+(inside?'':'out')+' '+(k===selected?'sel':'')+'" data-date="'+k+'"><div class="b2329-day-head"><strong>'+d.getDate()+'</strong>'+(k===today()?'<small>HOY</small>':'')+'</div>'+items.slice(0,5).join('')+(items.length>5?'<span class="b2329-kind">+'+(items.length-5)+' más</span>':'')+(inside&&x?'<div class="b2329-src">Saldo real '+money(x.balance)+'</div><div class="'+(x.profit>=0?'b2329-pos':'b2329-neg')+'">Rent. '+money(x.profit)+'</div><div class="b2329-src">Flujo '+money(x.flow)+'</div>':'')+'</button>';
          }).join('')}
        </div>

        <div id="b2329Detail"></div>
        <p class="muted">Las cuotas se grafican en cada fecha de vencimiento durante toda la vigencia del crédito. Los ingresos proyectados se muestran como plan y solo pasan a ingreso real cuando se registra el movimiento. Las transferencias entre cuentas no se consideran ingreso ni gasto.</p>
      </div>`;

    $('b2329Prev').onclick=()=>{month.setMonth(month.getMonth()-1);selected=key(new Date(month.getFullYear(),month.getMonth(),1));render()};
    $('b2329Next').onclick=()=>{month.setMonth(month.getMonth()+1);selected=key(new Date(month.getFullYear(),month.getMonth(),1));render()};
    $('b2329Today').onclick=()=>{month=new Date();selected=today();render()};
    host.querySelectorAll('.b2329-day').forEach(b=>b.onclick=()=>{selected=b.dataset.date;render()});
    detail(r,label);
  }

  function rows(items,kind){
    return items.map(x=>'<div class="b2329-row"><span><b>'+esc(x.concepto||x.descripcion||x.categoria||kind)+'</b><small class="b2329-src">'+esc(kind)+' · '+esc(x.fecha||x.fecha_vencimiento||'')+'</small></span><strong>'+money(x.monto)+'</strong></div>').join('');
  }

  function detail(r,label){
    const box=$('b2329Detail');if(!box)return;
    const rin=r.mov.filter(isIn),rout=r.mov.filter(isOut),pin=r.inc,pout=r.exp,co=r.comm,qu=r.quota;
    const cats=arr=>{const m=new Map();arr.forEach(x=>{const k=x.categoria||x.concepto||'Sin categoría';m.set(k,(m.get(k)||0)+num(x.monto))});return [...m.entries()].map(([k,v])=>'<div class="b2329-row"><span>'+esc(k)+'</span><strong>'+money(v)+'</strong></div>').join('')};
    const rinT=rin.reduce((s,x)=>s+num(x.monto),0),routT=rout.reduce((s,x)=>s+num(x.monto),0),pinT=pin.reduce((s,x)=>s+num(x.monto),0),poutT=pout.reduce((s,x)=>s+num(x.monto),0),coT=co.reduce((s,x)=>s+num(x.monto),0),quT=qu.reduce((s,x)=>s+num(x.monto),0),quP=qu.filter(x=>!isPaid(x)).reduce((s,x)=>s+num(x.monto),0);

    box.innerHTML=`
      <div class="b2329-box">
        <div class="b2329-row"><b>Detalle del ${esc(label)}</b><strong>${esc(r.k)}</strong></div>

        <div class="b2329-flow">
          <div class="b2329-row"><span>Rentabilidad real = ingresos recibidos − gastos pagados</span><strong class="${r.profit>=0?'b2329-pos':'b2329-neg'}">${money(r.profit)}</strong></div>
          <div class="b2329-row"><span>Flujo proyectado = ingresos reales + plan − egresos y obligaciones</span><strong class="${r.flow>=0?'b2329-pos':'b2329-neg'}">${money(r.flow)}</strong></div>
          <div class="b2329-row"><span>Saldo real acumulado</span><strong>${money(r.balance)}</strong></div>
        </div>

        <div class="b2329-grid">
          <div class="b2329-box">
            <div class="b2329-section">INGRESOS Y RENTABILIDAD</div>
            <div class="b2329-row"><span>Ingresos recibidos</span><strong>${money(rinT)}</strong></div>
            ${rows(rin,'Ingreso real')||'<p class="muted">Sin ingresos recibidos.</p>'}
            <div class="b2329-row"><span>Ingresos proyectados</span><strong>${money(pinT)}</strong></div>
            ${rows(pin,'Ingreso proyectado')||'<p class="muted">Sin ingresos proyectados. Para que una planificación diaria de Uber aparezca aquí debe existir como ingreso futuro con fecha y monto.</p>'}
            <div class="b2329-section">RESUMEN POR CATEGORÍA</div>
            ${cats(rin)||'<p class="muted">Sin categorías de ingreso.</p>'}
          </div>

          <div class="b2329-box">
            <div class="b2329-section">EGRESOS, PAGOS Y OBLIGACIONES</div>
            <div class="b2329-row"><span>Gastos pagados</span><strong>${money(routT)}</strong></div>
            ${rows(rout,'Gasto real')||'<p class="muted">Sin gastos pagados.</p>'}
            <div class="b2329-row"><span>Gastos planificados</span><strong>${money(poutT)}</strong></div>
            ${rows(pout,'Gasto planificado')||'<p class="muted">Sin gastos planificados.</p>'}
            <div class="b2329-row"><span>Compromisos pendientes</span><strong>${money(coT)}</strong></div>
            ${rows(co,'Compromiso')||'<p class="muted">Sin compromisos pendientes.</p>'}
            <div class="b2329-row"><span>Cuotas del crédito</span><strong>${money(quT)}</strong></div>
            ${qu.length?qu.map(x=>'<div class="b2329-row"><span><b>Cuota '+esc(x.numero_cuota)+'</b><small class="b2329-src">'+esc(x.deuda?.acreedor||'Deuda')+' · '+esc(x.estado||'sin estado')+'</small></span><strong class="'+(isPaid(x)?'b2329-paid':'')+'">'+money(x.monto)+'</strong></div>').join(''):'<p class="muted">Sin cuotas.</p>'}
          </div>
        </div>

        <div class="b2329-flow">
          <div class="b2329-section">CONTROL DE CAJA</div>
          <div class="b2329-row"><span>Entradas reales + proyectadas</span><strong>${money(rinT+pinT)}</strong></div>
          <div class="b2329-row"><span>Salidas reales + planificadas + compromisos + cuotas pendientes</span><strong>${money(routT+poutT+coT+quP)}</strong></div>
          <div class="b2329-row"><span>Flujo neto del día</span><strong class="${r.flow>=0?'b2329-pos':'b2329-neg'}">${money(r.flow)}</strong></div>
        </div>
      </div>`;
  }

  function boot(){
    const tab=document.querySelector('[data-tab="calendario"]');if(!tab)return;
    if(!tab.dataset.b2329Capture){
      tab.addEventListener('click',e=>{
        e.stopImmediatePropagation();
        load().catch(err=>{
          const h=$('calendario');
          if(h)h.innerHTML='<div class="card"><p class="status">'+esc(err.message||err)+'</p></div>';
        });
      },true);
      tab.dataset.b2329Capture='1';
    }
    if(tab.classList.contains('active'))load().catch(()=>{});
  }

  window.B232Calendario={version:VERSION,load,render};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,350));
  else setTimeout(boot,350);
})();
