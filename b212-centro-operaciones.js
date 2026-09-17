/* FINANZAS B2.12 — CENTRO DE OPERACIONES FINANCIERAS */
(() => {
  const $ = id => document.getElementById(id);
  const clp = n => new Intl.NumberFormat("es-CL",{style:"currency",currency:"CLP",maximumFractionDigits:0}).format(Number(n)||0);
  const today = () => { const d=new Date(); return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,10); };
  const esc = v => String(v ?? "").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
  let db=null;

  async function getDb(){
    if(db) return db;
    const u=localStorage.getItem("sf_url"), k=localStorage.getItem("sf_key");
    if(!u||!k||!window.supabase) return null;
    db=window.supabase.createClient(u,k); return db;
  }

  async function sumMov(c, type){
    const r=await c.from("movimientos").select("monto").eq("tipo",type).lte("fecha",today());
    if(r.error) return 0;
    return (r.data||[]).reduce((s,x)=>s+Number(x.monto||0),0);
  }

  async function load(){
    const c=await getDb(); if(!c) return;
    const [cf,bank,debt,futInc,futExp,mInc,mExp] = await Promise.all([
      c.from("cierres_financieros").select("saldo_inicial,saldo_efectivo_actual,fecha_corte").eq("activo",true).order("fecha_corte",{ascending:false}).limit(1).maybeSingle(),
      c.from("cuentas_bancarias").select("id,nombre_banco,nombre_cuenta,saldo_actual,activa").eq("activa",true).order("nombre_banco"),
      c.from("v_deudas_resumen").select("acreedor,saldo_actual,numero_cuotas_pendientes,proximo_vencimiento,estado").not("estado","in","(pagada,cancelada)").order("saldo_actual",{ascending:false}),
      c.from("ingresos_futuros").select("concepto,monto,fecha").gte("fecha",today()).order("fecha").limit(10),
      c.from("gastos_planificados").select("concepto,monto,fecha").gte("fecha",today()).order("fecha").limit(10),
      sumMov(c,"ingreso"), sumMov(c,"gasto")
    ]);

    const banks=bank.data||[];
    const cash=Number(cf.data?.saldo_efectivo_actual||0);
    const bankTotal=banks.reduce((s,x)=>s+Number(x.saldo_actual||0),0);
    const liquidity=cash+bankTotal;
    const debts=debt.data||[];
    const debtTotal=debts.reduce((s,x)=>s+Number(x.saldo_actual||0),0);
    const futureIncome=(futInc.data||[]).reduce((s,x)=>s+Number(x.monto||0),0);
    const futureExpense=(futExp.data||[]).reduce((s,x)=>s+Number(x.monto||0),0);
    const projected=liquidity+futureIncome-futureExpense-debtTotal;

    $("b212Liquidity").textContent=clp(liquidity);
    $("b212Cash").textContent=clp(cash);
    $("b212Banks").textContent=clp(bankTotal);
    $("b212FutureIncome").textContent=clp(futureIncome);
    $("b212FutureExpense").textContent=clp(futureExpense);
    $("b212Debt").textContent=clp(debtTotal);
    $("b212Projected").textContent=clp(projected);
    $("b212Today").textContent=today().split("-").reverse().join("-");

    const obligations=(debts.filter(x=>x.proximo_vencimiento===today()).reduce((s,x)=>s+Number(x.saldo_actual||0),0));
    $("b212Obligations").textContent=clp(obligations);
    $("b212IncomeMonth").textContent=clp(mInc);
    $("b212ExpenseMonth").textContent=clp(mExp);

    $("b212DebtList").innerHTML=debts.length?debts.slice(0,5).map(d=>`
      <div class="b212-row">
        <div><strong>${esc(d.acreedor)}</strong><small>${Number(d.numero_cuotas_pendientes||0)} cuotas · próximo ${esc(d.proximo_vencimiento||"—")}</small></div>
        <strong>${clp(d.saldo_actual)}</strong>
      </div>`).join(""):'<p class="muted">Sin deudas estructuradas.</p>';

    const events=[];
    (futInc.data||[]).forEach(x=>events.push({date:x.fecha,type:"Ingreso",concepto:x.concepto,monto:x.monto}));
    (futExp.data||[]).forEach(x=>events.push({date:x.fecha,type:"Gasto",concepto:x.concepto,monto:x.monto}));
    debts.forEach(x=>x.proximo_vencimiento&&events.push({date:x.proximo_vencimiento,type:"Deuda",concepto:x.acreedor,monto:x.saldo_actual}));
    events.sort((a,b)=>a.date.localeCompare(b.date));
    $("b212Events").innerHTML=events.slice(0,6).map(e=>`
      <div class="b212-event"><span><b>${e.date}</b> · ${esc(e.type)}<small>${esc(e.concepto)}</small></span><strong>${clp(e.monto)}</strong></div>
    `).join("") || '<p class="muted">No hay eventos futuros registrados.</p>';

    $("b212BanksList").innerHTML=banks.map(b=>`
      <div class="b212-row"><span><strong>${esc(b.nombre_banco)}</strong><small>${esc(b.nombre_cuenta||"Cuenta")}</small></span><strong>${clp(b.saldo_actual)}</strong></div>
    `).join("") || '<p class="muted">No hay cuentas bancarias activas.</p>';
  }

  function mount(){
    if($("b212Section")) return;
    const tabs=document.querySelector(".tabs");
    const app=document.querySelector("#app");
    if(!tabs||!app) return;

    const tab=document.createElement("button");
    tab.type="button"; tab.dataset.tab="operaciones"; tab.textContent="Operaciones";
    tabs.appendChild(tab);

    const sec=document.createElement("section");
    sec.id="operaciones"; sec.className="tab hidden";
    sec.innerHTML=`
      <div class="card b212-hero">
        <div class="b212-hero-top"><div><span class="muted">CENTRO DE OPERACIONES · <span id="b212Today">—</span></span><h2>Control financiero diario</h2><p class="muted">Liquidez real, obligaciones, ingresos futuros y capacidad proyectada.</p></div>
        <div class="b212-actions"><button type="button" id="b212Refresh">Actualizar</button></div></div>
        <div class="b212-kpis">
          <article><span>Liquidez disponible</span><strong id="b212Liquidity">$0</strong><small>efectivo + bancos</small></article>
          <article><span>Obligaciones de hoy</span><strong id="b212Obligations">$0</strong><small>vencimientos del día</small></article>
          <article><span>Ingresos futuros</span><strong id="b212FutureIncome">$0</strong><small>no son liquidez actual</small></article>
          <article><span>Disponible proyectado</span><strong id="b212Projected">$0</strong><small>después de obligaciones estructuradas</small></article>
        </div>
      </div>
      <div class="b212-grid">
        <div class="card"><h3>Liquidez</h3><div class="b212-row"><span>Efectivo / caja</span><strong id="b212Cash">$0</strong></div><div class="b212-row"><span>Cuentas bancarias</span><strong id="b212Banks">$0</strong></div><div id="b212BanksList"></div></div>
        <div class="card"><h3>Deudas estructuradas</h3><div class="b212-debt-total" id="b212Debt">$0</div><div id="b212DebtList"></div></div>
      </div>
      <div class="b212-grid">
        <div class="card"><h3>Flujo futuro</h3><div class="b212-row"><span>Ingresos programados</span><strong id="b212FutureIncome">$0</strong></div><div class="b212-row"><span>Gastos programados</span><strong id="b212FutureExpense">$0</strong></div><div class="b212-row"><span>Ingresos del mes registrados</span><strong id="b212IncomeMonth">$0</strong></div><div class="b212-row"><span>Gastos del mes registrados</span><strong id="b212ExpenseMonth">$0</strong></div></div>
        <div class="card"><h3>Próximos eventos</h3><div id="b212Events"></div></div>
      </div>
      <div class="card b212-logic"><strong>Regla de control:</strong> la liquidez disponible solo usa dinero real registrado. Los ingresos futuros se mantienen separados hasta que sean confirmados como recibidos.</div>
    `;
    app.appendChild(sec);

    tab.onclick=()=>{
      document.querySelectorAll(".tabs button").forEach(x=>x.classList.remove("active"));
      document.querySelectorAll(".tab").forEach(x=>x.classList.add("hidden"));
      tab.classList.add("active"); sec.classList.remove("hidden"); load();
    };
    $("b212Refresh").onclick=load;
    load();
  }

  function style(){
    if($("b212Style")) return;
    const s=document.createElement("style"); s.id="b212Style";
    s.textContent=`.b212-hero-top{display:flex;justify-content:space-between;gap:16px;align-items:flex-start}.b212-kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-top:18px}.b212-kpis article{border:1px solid #e5e7eb;border-radius:14px;padding:15px;background:#f8fafc}.b212-kpis span,.b212-kpis small,.b212-row small,.b212-event small{display:block;color:#64748b;font-size:12px}.b212-kpis strong{display:block;font-size:24px;margin:6px 0}.b212-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:14px}.b212-row,.b212-event{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:11px 0;border-bottom:1px solid #e5e7eb}.b212-debt-total{font-size:28px;font-weight:800;margin-bottom:8px}.b212-logic{margin-top:14px;background:#f8fafc}.b212-actions button{min-height:40px}.b212-event span{display:block}.b212-event strong{white-space:nowrap}@media(max-width:760px){.b212-kpis{grid-template-columns:1fr 1fr}.b212-grid{grid-template-columns:1fr}.b212-hero-top{flex-direction:column}.b212-kpis strong{font-size:20px}}`;
    document.head.appendChild(s);
  }

  function init(){ style(); const o=new MutationObserver(mount); o.observe(document.body,{childList:true,subtree:true}); setTimeout(mount,700); }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",init); else init();
})();
