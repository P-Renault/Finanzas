/* FINANZAS B2.16 — Planificación financiera */
(() => {
  'use strict';
  const $=id=>document.getElementById(id);
  const money=n=>new Intl.NumberFormat('es-CL',{style:'currency',currency:'CLP',maximumFractionDigits:0}).format(Number(n)||0);
  const dateToday=()=>{const d=new Date();return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,10)};
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  let client=null, mounted=false;

  async function db(){
    if(client)return client;
    const u=localStorage.getItem('sf_url'),k=localStorage.getItem('sf_key');
    if(!u||!k||!window.supabase)return null;
    client=window.supabase.createClient(u,k,{auth:{persistSession:false,autoRefreshToken:false}});
    return client;
  }
  function addDays(s,n){const d=new Date(s+'T12:00:00');d.setDate(d.getDate()+n);return d.toISOString().slice(0,10)}
  function style(){
    if($('b216Style'))return;
    const s=document.createElement('style');s.id='b216Style';s.textContent=`
      .b216-hero{border:1px solid #e5e7eb;border-radius:16px;padding:18px;background:#fff}
      .b216-head{display:flex;justify-content:space-between;gap:14px;align-items:flex-start}
      .b216-head h2{margin:4px 0}.b216-head p{margin:0;color:#64748b;font-size:12px}
      .b216-kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-top:16px}
      .b216-kpi{border:1px solid #e5e7eb;border-radius:12px;padding:12px;background:#f8fafc}
      .b216-kpi span,.b216-kpi small{display:block;color:#64748b;font-size:11px}.b216-kpi strong{display:block;font-size:19px;margin:5px 0}
      .b216-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:14px}
      .b216-row{display:flex;justify-content:space-between;gap:10px;padding:11px 0;border-bottom:1px solid #e5e7eb}
      .b216-row small{display:block;color:#64748b;margin-top:2px}
      .b216-alert{padding:12px;border-radius:12px;background:#fff7ed;color:#9a3412;margin-top:14px}
      .b216-ok{padding:12px;border-radius:12px;background:#ecfdf5;color:#166534;margin-top:14px}
      .b216-note{font-size:11px;color:#64748b;margin:14px 0 0}
      @media(max-width:760px){.b216-kpis{grid-template-columns:1fr 1fr}.b216-grid{grid-template-columns:1fr}.b216-head{flex-direction:column}}
    `;document.head.appendChild(s)
  }
  async function fetchData(){
    const c=await db(); if(!c) throw Error('Supabase no está conectado.');
    const t=dateToday(), end=addDays(t,29);
    const [cf,banks,inc,exp,quota]=await Promise.all([
      c.from('cierres_financieros').select('saldo_efectivo_actual,saldo_inicial,fecha_corte').eq('activo',true).order('fecha_corte',{ascending:false}).limit(1).maybeSingle(),
      c.from('cuentas_bancarias').select('saldo_actual').eq('activa',true),
      c.from('ingresos_futuros').select('concepto,monto,fecha').gte('fecha',t).lte('fecha',end).order('fecha'),
      c.from('gastos_planificados').select('concepto,monto,fecha').gte('fecha',t).lte('fecha',end).order('fecha'),
      c.from('cuotas_deuda').select('monto,fecha_vencimiento,estado').in('estado',['pendiente','vencida']).gte('fecha_vencimiento',t).lte('fecha_vencimiento',end).order('fecha_vencimiento')
    ]);
    for(const x of [cf,banks,inc,exp,quota]) if(x.error) throw x.error;
    const liquidity=Number(cf.data?.saldo_efectivo_actual||0)+(banks.data||[]).reduce((s,x)=>s+Number(x.saldo_actual||0),0);
    const incomes=inc.data||[], expenses=exp.data||[], quotas=quota.data||[];
    const by={};
    for(let i=0;i<30;i++)by[addDays(t,i)]={in:0,out:0};
    incomes.forEach(x=>{if(by[x.fecha])by[x.fecha].in+=Number(x.monto||0)});
    expenses.forEach(x=>{if(by[x.fecha])by[x.fecha].out+=Number(x.monto||0)});
    quotas.forEach(x=>{if(by[x.fecha_vencimiento])by[x.fecha_vencimiento].out+=Number(x.monto||0)});
    let balance=liquidity,minBalance=liquidity,minDate=t,totalIn=0,totalOut=0;
    for(const d of Object.keys(by).sort()){
      balance+=by[d].in-by[d].out; totalIn+=by[d].in; totalOut+=by[d].out;
      if(balance<minBalance){minBalance=balance;minDate=d}
    }
    const deficit=Math.max(0,-minBalance);
    const daily=Math.ceil(deficit/30);
    const saveTarget=Math.round(totalIn*0.10);
    return {t,liquidity,totalIn,totalOut,minBalance,minDate,deficit,daily,saveTarget,incomes,expenses,quotas};
  }
  function mount(){
    if(mounted)return true;
    const tabs=document.querySelector('.tabs'),app=$('app'); if(!tabs||!app)return false;
    if(!tabs.querySelector('[data-tab="planificacion"]')){
      const b=document.createElement('button');b.type='button';b.dataset.tab='planificacion';b.textContent='Planificación';tabs.appendChild(b);
      const s=document.createElement('section');s.id='planificacion';s.className='tab hidden';s.innerHTML='<div id="b216Content"></div>';app.appendChild(s);
      b.onclick=()=>{document.querySelectorAll('.tabs button').forEach(x=>x.classList.remove('active'));b.classList.add('active');document.querySelectorAll('.tab').forEach(x=>x.classList.add('hidden'));s.classList.remove('hidden');render()};
    }
    style(); mounted=true; return true;
  }
  async function render(){
    if(!mount())return;
    const box=$('b216Content');box.innerHTML='<div class="card"><p class="muted">Calculando escenario de 30 días…</p></div>';
    try{
      const d=await fetchData();
      const status=d.deficit
        ? `<div class="b216-alert"><strong>Déficit proyectado máximo: ${money(d.deficit)}</strong><br>El punto mínimo del escenario aparece el ${d.minDate}. Como referencia matemática, equivale a ${money(d.daily)} diarios durante 30 días. Esto es una necesidad de flujo, no una obligación de ingreso.</div>`
        : `<div class="b216-ok"><strong>Escenario de 30 días sin déficit.</strong><br>La simulación mantiene el saldo sobre $0 con los ingresos futuros y obligaciones actualmente registradas.</div>`;
      box.innerHTML=`
        <div class="card b216-hero"><div class="b216-head"><div><span class="muted">B2.16 · MODELO DE FLUJO</span><h2>Planificación financiera</h2><p>Simulación de liquidez para los próximos 30 días, separando dinero real de flujos futuros.</p></div><button type="button" class="secondary" id="b216Refresh">Actualizar</button></div>
        <div class="b216-kpis">
          <div class="b216-kpi"><span>Liquidez real</span><strong>${money(d.liquidity)}</strong><small>efectivo + cuentas activas</small></div>
          <div class="b216-kpi"><span>Ingresos futuros</span><strong>${money(d.totalIn)}</strong><small>30 días</small></div>
          <div class="b216-kpi"><span>Obligaciones futuras</span><strong>${money(d.totalOut)}</strong><small>gastos + cuotas</small></div>
          <div class="b216-kpi"><span>Ahorro referencial 10%</span><strong>${money(d.saveTarget)}</strong><small>sobre ingresos futuros</small></div>
        </div>${status}</div>
        <div class="b216-grid"><div class="card"><h3>Lectura del escenario</h3>
          <div class="b216-row"><span>Saldo mínimo simulado</span><strong>${money(d.minBalance)}</strong></div>
          <div class="b216-row"><span>Fecha del mínimo</span><strong>${esc(d.minDate)}</strong></div>
          <div class="b216-row"><span>Ingreso diario referencial ante déficit</span><strong>${money(d.daily)}</strong></div>
          <p class="b216-note">El cálculo no registra movimientos ni modifica saldos. Solo analiza los datos existentes.</p>
        </div>
        <div class="card"><h3>Flujos próximos</h3>
          <div class="b216-row"><span>Ingresos programados</span><strong>${d.incomes.length}</strong></div>
          <div class="b216-row"><span>Gastos planificados</span><strong>${d.expenses.length}</strong></div>
          <div class="b216-row"><span>Cuotas de deuda</span><strong>${d.quotas.length}</strong></div>
          <p class="b216-note">Cuando se registre un ingreso o pago real, el escenario puede recalcularse desde los saldos actuales.</p>
        </div></div>`;
      $('b216Refresh').onclick=render;
    }catch(e){box.innerHTML=`<div class="card"><p class="status">${esc(e.message||e)}</p></div>`}
  }
  window.fin216Plan=render;
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(mount,500));else setTimeout(mount,500);
})();
