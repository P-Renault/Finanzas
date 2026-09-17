/* FINANZAS B2.17 — Centro de Operaciones integrado, carga controlada */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const money = n => new Intl.NumberFormat('es-CL',{style:'currency',currency:'CLP',maximumFractionDigits:0}).format(Number(n)||0);
  const today = () => { const d=new Date(); return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,10); };
  const esc = v => String(v ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  let client=null, mounted=false, loading=false;
  async function db(){
    if(client)return client;
    const u=localStorage.getItem('sf_url'), k=localStorage.getItem('sf_key');
    if(!u||!k||!window.supabase)return null;
    client=window.supabase.createClient(u,k,{auth:{persistSession:false,autoRefreshToken:false}});
    return client;
  }
  async function sumMov(c,type){
    const r=await c.from('movimientos').select('monto').eq('tipo',type).lte('fecha',today());
    return r.error?0:(r.data||[]).reduce((s,x)=>s+Number(x.monto||0),0);
  }
  async function load(){
    if(loading)return; loading=true;
    const status=$('b217oMsg');
    try{
      const c=await db();
      if(!c){if(status)status.textContent='Conecta Supabase para cargar Operaciones.';return;}
      const [cf,bank,debt,futInc,futExp,mInc,mExp,gen] = await Promise.all([
        c.from('cierres_financieros').select('saldo_inicial,saldo_efectivo_actual,fecha_corte').eq('activo',true).order('fecha_corte',{ascending:false}).limit(1).maybeSingle(),
        c.from('cuentas_bancarias').select('id,nombre_banco,nombre_cuenta,saldo_actual,activa').eq('activa',true).order('nombre_banco'),
        c.from('v_deudas_resumen').select('id,acreedor,saldo_actual,numero_cuotas_pendientes,proximo_vencimiento,estado').not('estado','in','(pagada,cancelada)').order('saldo_actual',{ascending:false}),
        c.from('ingresos_futuros').select('concepto,monto,fecha').gte('fecha',today()).order('fecha').limit(20),
        c.from('gastos_planificados').select('concepto,monto,fecha').gte('fecha',today()).order('fecha').limit(20),
        sumMov(c,'ingreso'),sumMov(c,'gasto'),
        c.from('generacion_ingresos').select('monto_neto,estado_cobro,fecha_generacion,fecha_cobro').order('fecha_generacion',{ascending:false}).limit(100)
      ]);
      const firstError=[cf,bank,debt,futInc,futExp,gen].find(x=>x?.error);
      if(firstError){if(status)status.textContent='Operaciones: '+firstError.error.message;return;}
      const banks=bank.data||[], debts=debt.data||[], incomes=futInc.data||[], expenses=futExp.data||[], gens=gen.data||[];
      const cash=Number(cf.data?.saldo_efectivo_actual||0), bankTotal=banks.reduce((s,x)=>s+Number(x.saldo_actual||0),0), liquidity=cash+bankTotal;
      const debtTotal=debts.reduce((s,x)=>s+Number(x.saldo_actual||0),0);
      const futureIncome=incomes.reduce((s,x)=>s+Number(x.monto||0),0), futureExpense=expenses.reduce((s,x)=>s+Number(x.monto||0),0);
      const received=gens.filter(x=>x.estado_cobro==='cobrado').reduce((s,x)=>s+Number(x.monto_neto||0),0);
      const projected=liquidity+futureIncome-futureExpense;
      const todayDebt=debts.filter(x=>x.proximo_vencimiento===today()).reduce((s,x)=>s+Number(x.saldo_actual||0),0);
      $('b217oLiquidity').textContent=money(liquidity); $('b217oCash').textContent=money(cash); $('b217oBanks').textContent=money(bankTotal);
      $('b217oFutureIncome').textContent=money(futureIncome); $('b217oFutureExpense').textContent=money(futureExpense); $('b217oDebt').textContent=money(debtTotal);
      $('b217oProjected').textContent=money(projected); $('b217oTodayDebt').textContent=money(todayDebt); $('b217oIncomeMonth').textContent=money(mInc); $('b217oExpenseMonth').textContent=money(mExp); $('b217oReceived').textContent=money(received);
      $('b217oBanksList').innerHTML=banks.length?banks.map(b=>`<div class="b217o-row"><span><strong>${esc(b.nombre_banco)}</strong><small>${esc(b.nombre_cuenta||'Cuenta')}</small></span><strong>${money(b.saldo_actual)}</strong></div>`).join(''):'<p class="muted">No hay cuentas bancarias activas.</p>';
      $('b217oDebtList').innerHTML=debts.length?debts.slice(0,8).map(d=>`<div class="b217o-row"><span><strong>${esc(d.acreedor)}</strong><small>${Number(d.numero_cuotas_pendientes||0)} cuotas · próximo ${esc(d.proximo_vencimiento||'—')}</small></span><strong>${money(d.saldo_actual)}</strong></div>`).join(''):'<p class="muted">Sin deudas estructuradas.</p>';
      const events=[];
      incomes.forEach(x=>events.push({date:x.fecha,type:'Ingreso futuro',concepto:x.concepto,monto:x.monto}));
      expenses.forEach(x=>events.push({date:x.fecha,type:'Gasto futuro',concepto:x.concepto,monto:x.monto}));
      debts.forEach(x=>x.proximo_vencimiento&&events.push({date:x.proximo_vencimiento,type:'Deuda',concepto:x.acreedor,monto:x.saldo_actual}));
      events.sort((a,b)=>a.date.localeCompare(b.date));
      $('b217oEvents').innerHTML=events.slice(0,8).map(e=>`<div class="b217o-event"><span><b>${esc(e.date)}</b> · ${esc(e.type)}<small>${esc(e.concepto)}</small></span><strong>${money(e.monto)}</strong></div>`).join('')||'<p class="muted">No hay eventos futuros registrados.</p>';
      $('b217oGenerated').textContent=money(gens.filter(x=>x.estado_cobro!=='cancelado').reduce((s,x)=>s+Number(x.monto_neto||0),0));
      $('b217oMsg').textContent='Actualizado '+today().split('-').reverse().join('-')+'.';
    }catch(e){console.error('B2.17 Operaciones',e);if(status)status.textContent='Error al cargar Operaciones: '+(e.message||e)}
    finally{loading=false;}
  }
  function style(){if($('b217oStyle'))return;const s=document.createElement('style');s.id='b217oStyle';s.textContent=`
    .b217o-hero-top{display:flex;justify-content:space-between;gap:16px;align-items:flex-start}.b217o-kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-top:18px}.b217o-kpi{border:1px solid #e5e7eb;border-radius:14px;padding:15px;background:#f8fafc}.b217o-kpi span,.b217o-kpi small,.b217o-row small,.b217o-event small{display:block;color:#64748b;font-size:12px}.b217o-kpi strong{display:block;font-size:23px;margin:6px 0}.b217o-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:14px}.b217o-row,.b217o-event{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:11px 0;border-bottom:1px solid #e5e7eb}.b217o-row:last-child,.b217o-event:last-child{border-bottom:0}.b217o-event strong,.b217o-row>strong{white-space:nowrap}.b217o-rule{margin-top:14px;background:#f8fafc}.b217o-chip{display:inline-block;padding:5px 9px;border:1px solid #dbe2ea;border-radius:999px;font-size:11px;color:#475569;margin:3px}.b217o-kpi-wide{margin-top:12px;display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.b217o-kpi-wide article{border:1px solid #e5e7eb;border-radius:12px;padding:12px}.b217o-kpi-wide span{display:block;color:#64748b;font-size:11px}.b217o-kpi-wide strong{display:block;font-size:18px;margin-top:4px}@media(max-width:760px){.b217o-kpis{grid-template-columns:1fr 1fr}.b217o-grid{grid-template-columns:1fr}.b217o-kpi-wide{grid-template-columns:1fr}}@media(max-width:480px){.b217o-kpis{grid-template-columns:1fr}.b217o-hero-top{flex-direction:column}}
  `;document.head.appendChild(s)}
  function mount(){
    if(mounted)return true; const tabs=document.querySelector('.tabs'),app=$('app'); if(!tabs||!app)return false;
    let b=tabs.querySelector('[data-tab="operaciones"]');
    if(!b){b=document.createElement('button');b.type='button';b.dataset.tab='operaciones';b.textContent='Operaciones';tabs.appendChild(b)}
    let sec=$('operaciones');
    if(!sec){sec=document.createElement('section');sec.id='operaciones';sec.className='tab hidden';sec.innerHTML=`
      <div class="card b217o-hero"><div class="b217o-hero-top"><div><span class="muted">B2.17 · CENTRO DE OPERACIONES</span><h2>Control financiero diario</h2><p class="muted">Liquidez real, obligaciones, flujos futuros y capacidad proyectada.</p></div><button type="button" class="secondary" id="b217oRefresh">Actualizar</button></div>
      <div class="b217o-kpis"><article class="b217o-kpi"><span>Liquidez disponible</span><strong id="b217oLiquidity">$0</strong><small>efectivo + bancos</small></article><article class="b217o-kpi"><span>Obligaciones de hoy</span><strong id="b217oTodayDebt">$0</strong><small>vencimientos registrados</small></article><article class="b217o-kpi"><span>Ingresos futuros</span><strong id="b217oFutureIncome">$0</strong><small>no son liquidez actual</small></article><article class="b217o-kpi"><span>Disponible proyectado</span><strong id="b217oProjected">$0</strong><small>liquidez + flujos futuros</small></article></div></div>
      <div class="b217o-kpi-wide"><article><span>Ingresos generados netos</span><strong id="b217oGenerated">$0</strong></article><article><span>Ingresos ya cobrados</span><strong id="b217oReceived">$0</strong></article><article><span>Deuda estructurada pendiente</span><strong id="b217oDebt">$0</strong></article></div>
      <div class="b217o-grid"><div class="card"><h3>Liquidez</h3><div class="b217o-row"><span>Efectivo / caja</span><strong id="b217oCash">$0</strong></div><div class="b217o-row"><span>Cuentas bancarias</span><strong id="b217oBanks">$0</strong></div><div id="b217oBanksList"></div></div><div class="card"><h3>Deudas estructuradas</h3><div id="b217oDebtList"></div></div></div>
      <div class="b217o-grid"><div class="card"><h3>Flujo futuro</h3><div class="b217o-row"><span>Ingresos programados</span><strong id="b217oFutureIncome">$0</strong></div><div class="b217o-row"><span>Gastos programados</span><strong id="b217oFutureExpense">$0</strong></div><div class="b217o-row"><span>Ingresos registrados del mes</span><strong id="b217oIncomeMonth">$0</strong></div><div class="b217o-row"><span>Gastos registrados del mes</span><strong id="b217oExpenseMonth">$0</strong></div></div><div class="card"><h3>Próximos eventos</h3><div id="b217oEvents"></div></div></div>
      <div class="card b217o-rule"><strong>Regla de control:</strong> la liquidez disponible utiliza solo dinero real registrado. Los ingresos futuros y la generación pendiente permanecen separados hasta su cobro/registro como movimiento.</div><p id="b217oMsg" class="status"></p>`;app.appendChild(sec)}
    style(); mounted=true;
    b.onclick=()=>{document.querySelectorAll('.tabs button').forEach(x=>x.classList.remove('active'));b.classList.add('active');document.querySelectorAll('.tab').forEach(x=>x.classList.add('hidden'));sec.classList.remove('hidden');load()};
    $('b217oRefresh').onclick=load; return true;
  }
  window.fin217Operations={mount,load};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(mount,200));else setTimeout(mount,200);
})();
