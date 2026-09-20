/* ============================================================
   B232.42.2 — RECONCILIACIÓN DE FUENTES · CORRECCIÓN SINTÁCTICA
   Corrección B232.42.1:
   - evita redeclaración de `futureIncome`;
   - conserva exactamente el contrato financiero existente.
   ============================================================ */
(() => {
  'use strict';

  const VERSION = '232.42.2';
  if (window.B232421Reconciliation?.version === VERSION) return;

  const $ = id => document.getElementById(id);
  const num = v => Number.isFinite(Number(v)) ? Number(v) : 0;
  const norm = v => String(v ?? '').trim().toLowerCase();
  const money = v => new Intl.NumberFormat('es-CL', {
    style:'currency', currency:'CLP', maximumFractionDigits:0
  }).format(num(v));

  const today = () => {
    const d = new Date();
    return new Date(d.getTime() - d.getTimezoneOffset()*60000)
      .toISOString().slice(0,10);
  };

  const addDays = (date, days) => {
    const d = new Date(date + 'T12:00:00');
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0,10);
  };

  const dateOf = (row, ...fields) => {
    for (const field of fields) {
      const value = row?.[field];
      if (!value) continue;
      const d = String(value).slice(0,10);
      if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
    }
    return null;
  };

  const pending = value => !/pagad|cobrad|realiz|cancel|cerrad|liquid/i.test(norm(value));

  function db(){
    if (window.supabaseClient) return window.supabaseClient;
    const url = localStorage.getItem('sf_url');
    const key = localStorage.getItem('sf_key');
    if (!url || !key || !window.supabase?.createClient) return null;
    try {
      window.supabaseClient = window.supabase.createClient(url,key,{
        auth:{persistSession:false,autoRefreshToken:false}
      });
      return window.supabaseClient;
    } catch(e){
      console.error('[B232.42.2] Supabase',e);
      return null;
    }
  }

  async function read(table, columns='*', configure){
    const c = db();
    if (!c) throw new Error('Supabase no está conectado.');
    let q = c.from(table).select(columns);
    if (configure) q = configure(q);
    const r = await q;
    if (r.error) throw new Error(table + ': ' + r.error.message);
    return r.data || [];
  }

  async function snapshot(){
    const t = today();
    const end = addDays(t,29);

    const [close,accounts,movements,futureIncomeRows,plannedOut,commitments,quotas,debtRows] = await Promise.all([
      read('cierres_financieros','*',q=>q.eq('activo',true).order('fecha_corte',{ascending:false}).limit(1)),
      read('cuentas_bancarias','*',q=>q.eq('activa',true)),
      read('movimientos','id,tipo,fecha,monto,movimiento_id',q=>q.gte('fecha',t).lte('fecha',end)),
      read('ingresos_futuros','*',q=>q.gte('fecha',t).lte('fecha',end)),
      read('gastos_planificados','*',q=>q.gte('fecha',t).lte('fecha',end)),
      read('compromisos','*',q=>q.eq('estado','pendiente').gte('fecha_vencimiento',t).lte('fecha_vencimiento',end)),
      read('cuotas_deuda','*',q=>q.in('estado',['pendiente','vencida']).gte('fecha_vencimiento',t).lte('fecha_vencimiento',end)),
      read('v_deudas_resumen','*')
    ]);

    const closure = close.find(x=>x.activo!==false) || close[0] || null;
    const cash = closure ? num(closure.saldo_efectivo_actual ?? closure.saldo_inicial) : 0;
    const bank = accounts.reduce((s,x)=>s+num(x.saldo_actual),0);

    const futureRows = futureIncomeRows.filter(x=>pending(x.estado));
    const linkedIds = new Set(
      futureRows
        .map(x=>x.movimiento_id ?? x.movement_id ?? x.movimientoId)
        .filter(v=>v!=null)
        .map(String)
    );

    const programmedIncome = futureRows.reduce((s,x)=>s+num(
      x.monto ?? x.monto_neto ?? x.valor ?? x.monto_bruto
    ),0);

    const futureMovementIncome = movements
      .filter(x=>dateOf(x,'fecha') >= t && dateOf(x,'fecha') <= end)
      .filter(x=>norm(x.tipo)==='ingreso')
      .filter(x=>!linkedIds.has(String(x.id ?? x.movimiento_id)))
      .reduce((s,x)=>s+num(x.monto),0);

    const futureIncome = programmedIncome + futureMovementIncome;

    const plannedExpenses = plannedOut
      .filter(x=>pending(x.estado))
      .reduce((s,x)=>s+num(x.monto),0);

    const commitments30d = commitments
      .filter(x=>pending(x.estado))
      .reduce((s,x)=>s+num(x.monto),0);

    const quotas30d = quotas
      .filter(x=>pending(x.estado))
      .reduce((s,x)=>s+num(x.monto ?? x.monto_cuota ?? x.valor),0);

    const obligations30d = plannedExpenses + commitments30d + quotas30d;

    const debtOutstanding = debtRows
      .filter(x=>pending(x.estado))
      .reduce((s,x)=>s+num(x.saldo_actual ?? x.saldo_pendiente ?? x.saldo),0);

    const days = {};
    for(let i=0;i<30;i++) days[addDays(t,i)]={in:0,out:0};
    futureRows.forEach(x=>{
      const d=dateOf(x,'fecha');
      if(days[d]) days[d].in += num(x.monto ?? x.monto_neto ?? x.valor ?? x.monto_bruto);
    });
    movements.filter(x=>norm(x.tipo)==='ingreso' && !linkedIds.has(String(x.id ?? x.movimiento_id)))
      .forEach(x=>{const d=dateOf(x,'fecha');if(days[d])days[d].in+=num(x.monto)});
    plannedOut.filter(x=>pending(x.estado)).forEach(x=>{const d=dateOf(x,'fecha','fecha_vencimiento');if(days[d])days[d].out+=num(x.monto)});
    commitments.forEach(x=>{const d=dateOf(x,'fecha_vencimiento','fecha');if(days[d])days[d].out+=num(x.monto)});
    quotas.forEach(x=>{const d=dateOf(x,'fecha_vencimiento');if(days[d])days[d].out+=num(x.monto ?? x.monto_cuota ?? x.valor)});

    let balance = cash + bank;
    let minBalance = balance;
    let minDate = t;
    let maxDeficit = 0;
    let maxDeficitDate = null;

    Object.keys(days).sort().forEach(d=>{
      balance += days[d].in - days[d].out;
      if(balance < minBalance){ minBalance=balance; minDate=d; }
      if(balance < 0 && Math.abs(balance)>maxDeficit){
        maxDeficit=Math.abs(balance); maxDeficitDate=d;
      }
    });

    return {
      asOf:t,end,liquidity:cash+bank,cash,bank,programmedIncome,
      futureMovementIncome,futureIncome,plannedExpenses,commitments30d,
      quotas30d,obligations30d,debtOutstanding,
      projectedBalance:cash+bank+futureIncome-obligations30d,
      minBalance,minDate,maxDeficit,maxDeficitDate,
      linkedFutureMovements:[...linkedIds].filter(id=>movements.some(x=>String(x.id ?? x.movimiento_id)===id)).length,
      counts:{futureIncome:futureRows.length,movements:movements.length,plannedExpenses:plannedOut.length,commitments:commitments.length,quotas:quotas.length,debts:debtRows.length}
    };
  }

  const parseMoney = node => {
    if(!node) return null;
    const raw=(node.textContent||'').replace(/[^0-9-]/g,'');
    return raw && raw!=='-' ? Number(raw) : null;
  };

  function setText(id,value){ const node=$(id); if(node) node.textContent=money(value); }

  function patchOperations(s){
    setText('f24Liq',s.liquidity);
    setText('f24Future',s.futureIncome);
    setText('f24Oblig',s.obligations30d);
    setText('f24Proj',s.projectedBalance);
    const status=$('f24OpsStatus');
    if(status) status.textContent=`Actualizado: liquidez ${money(s.liquidity)}, ingresos futuros consolidados ${money(s.futureIncome)}, obligaciones 30 días ${money(s.obligations30d)}.`;
  }

  function patchIA(s){
    setText('b227Liq',s.liquidity);
    setText('b227In',s.futureIncome);
    setText('b227Out',s.obligations30d);
    setText('b227Debt',s.debtOutstanding);
    const answer=$('b227Answer');
    if(answer) answer.textContent=`Datos reconciliados al ${s.asOf}. Ingresos futuros consolidados: ${money(s.futureIncome)}. Obligaciones próximos 30 días: ${money(s.obligations30d)}.`;
  }

  function patchPlan(s){
    const host=$('b216Content');
    if(!host) return false;
    const kpis=[...host.querySelectorAll('.b23224-kpi')];
    kpis.forEach(k=>{
      const label=norm(k.querySelector('span')?.textContent);
      const strong=k.querySelector('strong');
      const small=k.querySelector('small');
      if(!strong) return;
      if(label==='ingresos futuros'){
        strong.textContent=money(s.futureIncome);
        if(small) small.textContent='ingresos consolidados · próximos 30 días';
      }
      if(label==='obligaciones'){
        strong.textContent=money(s.obligations30d);
        if(small) small.textContent='Planificados + compromisos + deuda · 30 días';
      }
      if(label==='saldo proyectado'){
        strong.textContent=money(s.projectedBalance);
        strong.className=s.projectedBalance>=0?'b23224-positive':'b23224-negative';
      }
    });
    const rows=[...host.querySelectorAll('.b23224-row')];
    rows.forEach(row=>{
      const label=norm(row.querySelector('span')?.childNodes?.[0]?.textContent);
      const strong=row.querySelector('strong');
      if(!strong) return;
      if(label==='fecha del mínimo') strong.textContent=s.minDate ? new Intl.DateTimeFormat('es-CL').format(new Date(s.minDate+'T12:00:00')) : '—';
      if(label==='déficit máximo') strong.textContent=money(s.maxDeficit);
      if(label==='saldo mínimo proyectado') strong.textContent=money(s.minBalance);
    });
    return true;
  }

  function renderPanel(s){
    const dashboard=$('dashboard');
    if(!dashboard) return;
    let panel=$('b23242IntegrityPanel');
    if(!panel){
      panel=document.createElement('section');
      panel.id='b23242IntegrityPanel';
      panel.className='panel';
      panel.style.cssText='margin:12px 0;padding:14px;border:1px solid #e5e7eb;border-radius:12px;background:#fff';
      const anchor=$('executive-dashboard') || dashboard.firstElementChild;
      anchor?.parentNode ? anchor.parentNode.insertBefore(panel,anchor) : dashboard.appendChild(panel);
    }
    panel.innerHTML=`<div style="display:flex;justify-content:space-between;gap:10px;align-items:center;flex-wrap:wrap"><div><div style="font-size:11px;color:#64748b">B232.42.2 · RECONCILIACIÓN</div><h3 style="margin:3px 0">Fuentes financieras reconciliadas</h3></div><strong style="color:#166534">INTEGRO</strong></div><div style="margin-top:10px;display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:8px"><div><small>Liquidez</small><div><strong>${money(s.liquidity)}</strong></div></div><div><small>Ingresos futuros consolidados</small><div><strong>${money(s.futureIncome)}</strong></div></div><div><small>Obligaciones 30 días</small><div><strong>${money(s.obligations30d)}</strong></div></div><div><small>Deuda pendiente</small><div><strong>${money(s.debtOutstanding)}</strong></div></div></div><p style="margin:10px 0 6px;font-size:12px">Ingresos = programados ${money(s.programmedIncome)} + movimientos futuros no enlazados ${money(s.futureMovementIncome)}. Obligaciones = planificados ${money(s.plannedExpenses)} + compromisos ${money(s.commitments30d)} + cuotas ${money(s.quotas30d)}.</p><p style="margin:0;font-size:12px">Movimientos enlazados excluidos del segundo conteo: ${s.linkedFutureMovements}. Escenario: mínimo ${money(s.minBalance)} el ${s.minDate || '—'}.</p><button id="b232421Refresh" type="button" class="secondary" style="margin-top:10px">↻ Reconciliar ahora</button>`;
    $('b232421Refresh')?.addEventListener('click',()=>run());
  }

  let running=false;
  let lastSnapshot=null;

  async function run(){
    if(running) return lastSnapshot;
    running=true;
    try{
      const s=await snapshot();
      lastSnapshot=s;
      window.B232421Reconciliation.lastReport={version:VERSION,status:'ok',timestamp:new Date().toISOString(),snapshot:s};
      window.__B232421_RECONCILIATION__=s;
      patchOperations(s); patchIA(s); patchPlan(s); renderPanel(s);
      return s;
    }catch(e){
      console.error('[B232.42.2]',e);
      window.B232421Reconciliation.lastReport={version:VERSION,status:'error',error:e?.message||String(e)};
      const panel=$('b23242IntegrityPanel');
      if(panel) panel.querySelector('strong')?.replaceChildren(document.createTextNode('ERROR'));
      return null;
    }finally{running=false;}
  }

  function visible(id){const n=$(id);return !!n && !n.classList.contains('hidden');}

  function observe(){
    const app=$('app');
    if(!app || !window.MutationObserver) return;
    const observer=new MutationObserver(()=>{
      if(visible('operaciones') || visible('planificacion') || visible('ia-financiera')){
        setTimeout(()=>{if(lastSnapshot){patchOperations(lastSnapshot);patchIA(lastSnapshot);patchPlan(lastSnapshot)}else run()},80);
      }
    });
    observer.observe(app,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
  }

  window.B232421Reconciliation={
    version:VERSION,run,getLastReport:()=>window.B232421Reconciliation.lastReport||null
  };

  const boot=()=>{
    setTimeout(run,1800);
    setTimeout(observe,2000);
  };
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
