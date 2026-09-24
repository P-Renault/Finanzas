/* ============================================================
   CONTROL FINANCIERO · B233 MOTOR DE PRESUPUESTO · B233.22
   Versión: B233.0–B233.22
   Arquitectura: GitHub Pages + Supabase
   Regla: no modifica movimientos, deudas ni compromisos.
   ============================================================ */
(() => {
  'use strict';

  if (window.__B233_PRESUPUESTO__) return;
  window.__B233_PRESUPUESTO__ = true;

  const $ = id => document.getElementById(id);
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'
  }[c]));
  const money = n => new Intl.NumberFormat('es-CL', {
    style:'currency', currency:'CLP', maximumFractionDigits:0
  }).format(Number(n) || 0);

  const today = () => {
    const d = new Date();
    return new Date(d.getTime() - d.getTimezoneOffset()*60000).toISOString().slice(0,10);
  };

  const monthStart = value => `${String(value || today()).slice(0,7)}-01`;

  const monthEnd = value => {
    const [y,m] = String(value || today()).slice(0,7).split('-').map(Number);
    return new Date(y, m, 0).toISOString().slice(0,10);
  };

  const monthLabel = value => {
    const [y,m] = String(value || today()).slice(0,7).split('-').map(Number);
    return new Date(y,m-1,1).toLocaleDateString('es-CL',{
      month:'long', year:'numeric'
    }).replace(/^./, x => x.toUpperCase());
  };

  const ym = value => String(value || today()).slice(0,7);

  let client = null;
  let state = {
    month: ym(today()),
    budget: null,
    lines: [],
    movements: [],
    commitments: [],
    quotas: [],
    futureIncomes: [],
    futureExpenses: [],
    loading: false
  };

  /*
   * B233.18 — CLIENTE SUPABASE AUTENTICADO
   *
   * El módulo B233 no crea un cliente aislado con persistSession:false.
   * Primero reutiliza el cliente creado por B232.69/Auth, conservando
   * el JWT de la sesión. Solo si ese cliente no está disponible utiliza
   * el cliente persistente de respaldo.
   *
   * No modifica RLS, tablas, políticas ni estructura de datos.
   */
  function db() {
    if (window.supabaseClient?.from) {
      return window.supabaseClient;
    }

    if (window.__B23269_CLIENT__?.from) {
      return window.__B23269_CLIENT__;
    }

    if (client?.from) {
      return client;
    }

    const u = localStorage.getItem('sf_url');
    const k = localStorage.getItem('sf_key');

    if (u && k && window.supabase?.createClient) {
      try {
        client = window.supabase.createClient(u, k, {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true
          }
        });
      } catch (e) {
        console.error('[B233.18] Error creando cliente Supabase:', e);
        client = null;
      }
    }

    return client;
  }

  async function safeSelect(table, build) {
    const c = db();
    if (!c) return [];
    try {
      const q = build(c.from(table));
      const r = await q;
      if (r.error) {
        console.warn(`[B233] ${table}:`, r.error.message);
        return [];
      }
      return r.data || [];
    } catch (e) {
      console.warn(`[B233] ${table}:`, e);
      return [];
    }
  }

  async function safeSingle(table, build) {
    const c = db();
    if (!c) return null;
    try {
      const q = build(c.from(table));
      const r = await q;
      if (r.error && r.error.code !== 'PGRST116') {
        console.warn(`[B233] ${table}:`, r.error.message);
        return null;
      }
      return r.data || null;
    } catch (e) {
      console.warn(`[B233] ${table}:`, e);
      return null;
    }
  }

  function notify(message, ok=true) {
    const el = $('b233Msg');
    if (!el) return;
    el.textContent = message;
    el.className = `b233-msg ${ok ? 'ok' : 'error'}`;
  }

  function ensureStyles() {
    if ($('b233StyleFallback')) return;
    const s = document.createElement('style');
    s.id = 'b233StyleFallback';
    s.textContent = `
      .b233-hidden{display:none!important}
      .b233-actions{display:flex;gap:8px;flex-wrap:wrap}
      .b233-table-wrap{overflow:auto}
      .b233-trace{margin-top:12px;border:1px solid #e5e7eb;border-radius:12px;background:#f8fafc;padding:12px}
      .b233-trace-head{display:flex;justify-content:space-between;align-items:center;gap:10px}
      .b233-trace-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px}
      .b233-trace-box{border:1px solid #e5e7eb;border-radius:10px;background:#fff;padding:10px}
      .b233-trace-box h4{margin:0 0 7px;font-size:13px}
      .b233-trace-row{display:flex;justify-content:space-between;gap:8px;padding:7px 0;border-bottom:1px solid #eef2f7;font-size:12px}
      .b233-trace-row:last-child{border-bottom:0}
      .b233-trace-row small{display:block;color:#64748b}
      .b233-trace-total{font-weight:800}
      .b233-trace-warning{margin-top:10px;padding:9px;border-radius:9px;background:#fff7ed;color:#9a3412;font-size:11px}
      .b233-trace-ok{margin-top:10px;padding:9px;border-radius:9px;background:#ecfdf5;color:#166534;font-size:11px}
      @media(max-width:700px){.b233-trace-grid{grid-template-columns:1fr}.b233-trace-head{align-items:flex-start;flex-direction:column}}
    `;
    document.head.appendChild(s);
  }

  function ensureSection() {
    const app = $('app');
    if (!app) return null;
    let section = $('presupuesto');
    if (!section) {
      section = document.createElement('section');
      section.id = 'presupuesto';
      section.className = 'tab hidden';
      section.innerHTML = `
        <div class="b233-shell">
          <div class="card b233-hero">
            <div>
              <span class="b233-kicker">B233 · MOTOR FINANCIERO</span>
              <h2>Presupuesto</h2>
              <p class="muted">Plan · Ejecutado · Comprometido · Proyección · Desviación</p>
            </div>
            <div class="b233-period">
              <button type="button" id="b233Prev" class="secondary">‹</button>
              <label><span>Período</span><input id="b233Month" type="month"></label>
              <button type="button" id="b233Next" class="secondary">›</button>
            </div>
          </div>

          <div class="card b233-status-card">
            <div>
              <span class="b233-kicker">ESTADO DEL PRESUPUESTO</span>
              <strong id="b233BudgetStatus">Sin presupuesto</strong>
              <small id="b233BudgetName">Crea el presupuesto del mes para comenzar.</small>
            </div>
            <div class="b233-actions">
              <button type="button" id="b233Create">Crear / recuperar</button>
              <button type="button" id="b233Activate" class="secondary">Activar</button>
              <button type="button" id="b233Close" class="secondary">Cerrar</button>
            </div>
          </div>

          <div id="b233Msg" class="b233-msg hidden"></div>

          <div class="b233-kpis">
            <article class="metric"><span>Plan ingresos</span><strong id="b233PlanIncome">$0</strong></article>
            <article class="metric"><span>Plan egresos</span><strong id="b233PlanExpense">$0</strong></article>
            <article class="metric"><span>Ejecutado ingresos</span><strong id="b233ExecIncome">$0</strong></article>
            <article class="metric"><span>Ejecutado egresos</span><strong id="b233ExecExpense">$0</strong></article>
            <article class="metric"><span>Comprometido</span><strong id="b233Committed">$0</strong></article>
            <article class="metric"><span>Resultado plan</span><strong id="b233PlanResult">$0</strong></article>
            <article class="metric"><span>Resultado ejecutado</span><strong id="b233ExecResult">$0</strong></article>
            <article class="metric"><span>Resultado proyectado</span><strong id="b233Projected">$0</strong></article>
          </div>

          <div class="b233-grid">
            <div class="card">
              <div class="section-title"><div><h2>Plan presupuestario</h2><span class="muted">Una línea por categoría y tipo.</span></div></div>
              <form id="b233LineForm" class="b233-form">
                <input type="hidden" id="b233LineId">
                <label>Tipo<select id="b233Tipo"><option value="INGRESO">Ingreso</option><option value="EGRESO">Egreso</option></select></label>
                <label>Categoría<input id="b233Categoria" required maxlength="100" placeholder="Ej.: Combustible"></label>
                <label>Monto planificado<input id="b233Monto" type="number" min="0" step="1" required></label>
                <label>Prioridad<select id="b233Prioridad"><option value="1">1 · Crítica</option><option value="2">2 · Alta</option><option value="3" selected>3 · Normal</option><option value="4">4 · Baja</option><option value="5">5 · Flexible</option></select></label>
                <label class="full">Descripción<input id="b233Descripcion" maxlength="250" placeholder="Detalle opcional"></label>
                <div class="form-actions full b233-actions">
                  <button type="submit" id="b233LineSubmit">Agregar línea</button>
                  <button type="button" id="b233LineCancel" class="secondary b233-hidden">Cancelar</button>
                </div>
              </form>
            </div>

            <div class="card">
              <div class="section-title"><div><h2>Lectura financiera</h2><span class="muted">Resultado calculado con datos reales.</span></div></div>
              <div id="b233Reading" class="b233-reading"></div>
            </div>
          </div>

          <div class="card">
            <div class="section-title"><div><h2>Detalle por categoría</h2><span class="muted">Plan vs ejecutado y desviación.</span></div></div>
            <div class="b233-table-wrap">
              <table class="b233-table">
                <thead><tr><th>Tipo</th><th>Categoría</th><th>Plan</th><th>Ejecutado</th><th>Desviación</th><th>% ejecución</th><th>Prioridad</th><th></th></tr></thead>
                <tbody id="b233LinesBody"></tbody>
              </table>
            </div>
          </div>

          <div class="b233-grid">
            <div class="card"><div class="section-title"><h2>Comprometido</h2></div><div id="b233CommittedDetail"></div></div>
            <div class="card"><div class="section-title"><h2>Proyección</h2></div><div id="b233ProjectionDetail"></div></div>
          </div>

          <div class="card b233-integrity">
            <span class="b233-kicker">INTEGRIDAD</span>
            <p>El presupuesto es una capa de planificación y análisis. No crea, modifica ni elimina movimientos, deudas, cuotas o compromisos. Las transferencias entre cuentas no se consideran ingresos ni egresos.</p>
          </div>
        </div>`;
      app.appendChild(section);
    }
    return section;
  }

  function ensureNav() {
    const tabs = document.querySelector('.tabs');
    if (!tabs) return;
    let b = tabs.querySelector('[data-tab="presupuesto"]');
    if (!b) {
      b = document.createElement('button');
      b.type = 'button';
      b.dataset.tab = 'presupuesto';
      b.textContent = 'Presupuesto';
      tabs.appendChild(b);
    }
    b.onclick = () => showBudget();
  }

  function showBudget() {
    document.querySelectorAll('.tab').forEach(s => s.classList.toggle('hidden', s.id !== 'presupuesto'));
    document.querySelectorAll('.tabs button[data-tab]').forEach(b => b.classList.toggle('active', b.dataset.tab === 'presupuesto'));
    loadBudget();
  }

  function resetLineForm() {
    $('b233LineForm')?.reset();
    if ($('b233LineId')) $('b233LineId').value = '';
    if ($('b233Tipo')) $('b233Tipo').value = 'INGRESO';
    if ($('b233Prioridad')) $('b233Prioridad').value = '3';
    if ($('b233LineSubmit')) $('b233LineSubmit').textContent = 'Agregar línea';
    $('b233LineCancel')?.classList.add('b233-hidden');
  }

  function editLine(line) {
    $('b233LineId').value = line.id;
    $('b233Tipo').value = line.tipo;
    $('b233Categoria').value = line.categoria || '';
    $('b233Monto').value = Number(line.monto_plan) || 0;
    $('b233Prioridad').value = String(line.prioridad || 3);
    $('b233Descripcion').value = line.descripcion || '';
    $('b233LineSubmit').textContent = 'Guardar cambios';
    $('b233LineCancel').classList.remove('b233-hidden');
    $('b233Categoria').focus();
  }

  async function saveLine(e) {
    e.preventDefault();
    if (!state.budget) {
      notify('Primero crea o recupera el presupuesto del mes.', false);
      return;
    }
    const tipo = $('b233Tipo').value;
    const categoria = $('b233Categoria').value.trim();
    const monto = Number($('b233Monto').value);
    const prioridad = Number($('b233Prioridad').value);
    const descripcion = $('b233Descripcion').value.trim();
    const id = $('b233LineId').value;

    if (!categoria || !Number.isFinite(monto) || monto < 0) {
      notify('Revisa categoría y monto.', false);
      return;
    }

    const payload = {presupuesto_id:state.budget.id,categoria,tipo,monto_plan:monto,prioridad,descripcion};
    let r;
    if (id) r = await db().from('presupuesto_lineas').update(payload).eq('id',id);
    else r = await db().from('presupuesto_lineas').upsert(payload,{onConflict:'presupuesto_id,categoria,tipo'});

    if (r.error) { notify(r.error.message,false); return; }
    notify(id ? 'Línea actualizada.' : 'Línea presupuestaria guardada.');
    resetLineForm();
    await loadBudget();
  }

  async function deleteLine(id) {
    if (!confirm('¿Eliminar esta línea presupuestaria?')) return;
    const r = await db().from('presupuesto_lineas').delete().eq('id',id);
    if (r.error) { notify(r.error.message,false); return; }
    notify('Línea eliminada.');
    await loadBudget();
  }

  async function ensureBudget() {
    const periodo = ym(state.month);
    let budget = await safeSingle('presupuestos', q => q.select('*').eq('periodo',periodo).maybeSingle());

    if (!budget) {
      const c = db();
      if (!c) { notify('No hay conexión autenticada con Supabase.',false); return null; }
      const r = await c.from('presupuestos').insert({
        periodo,
        nombre:`Presupuesto ${monthLabel(state.month)}`,
        estado:'activo'
      }).select('*').single();

      if (r.error) { notify(r.error.message,false); return null; }
      budget = r.data;
    }

    state.budget = budget;
    return budget;
  }

  async function loadData() {
    const c = db();
    if (!c || !state.budget) return;

    const start = monthStart(state.month);
    const end = monthEnd(state.month);

    const [lines,mov,comm,quotas,fIn,fEx] = await Promise.all([
      safeSelect('presupuesto_lineas',q => q.select('*').eq('presupuesto_id',state.budget.id).order('tipo').order('categoria')),
      safeSelect('movimientos',q => q.select('*').gte('fecha',start).lte('fecha',end).order('fecha',{ascending:true})),
      safeSelect('compromisos',q => q.select('*').gte('fecha_vencimiento',start).lte('fecha_vencimiento',end).eq('estado','pendiente').order('fecha_vencimiento',{ascending:true})),
      safeSelect('cuotas_deuda',q => q.select('*').gte('fecha_vencimiento',start).lte('fecha_vencimiento',end).order('fecha_vencimiento',{ascending:true})),
      safeSelect('ingresos_futuros',q => q.select('*').gte('fecha',start).lte('fecha',end)),
      safeSelect('gastos_planificados',q => q.select('*').gte('fecha',start).lte('fecha',end))
    ]);

    state.lines=lines;
    state.movements=mov;
    state.commitments=comm;
    state.quotas=quotas;
    state.futureIncomes=fIn;
    state.futureExpenses=fEx;
  }

  function movementCategory(r) { return String(r.categoria || r.category || 'Sin categoría').trim() || 'Sin categoría'; }
  function movementAmount(r) { return Number(r.monto ?? r.amount ?? 0) || 0; }

  function executedByCategory(type) {
    const map = new Map();
    for (const r of state.movements) {
      const t = String(r.tipo || '').toLowerCase();
      const isIncome = t === 'ingreso' || t === 'income';
      const wanted = type === 'INGRESO' ? isIncome : !isIncome;
      if (!wanted) continue;
      const c = movementCategory(r);
      map.set(c,(map.get(c)||0)+movementAmount(r));
    }
    return map;
  }

  function quotaAmount(r) {
    return Number(r.monto ?? r.monto_cuota ?? r.saldo ?? r.saldo_pendiente ?? r.amount ?? 0) || 0;
  }
  function quotaDate(r) { return r.fecha_vencimiento || r.fecha || r.vencimiento || ''; }
  function commitmentAmount(r) { return Number(r.monto ?? r.amount ?? 0) || 0; }
  function commitmentLabel(r) { return r.concepto || r.descripcion || r.nombre || 'Compromiso'; }
  function futureAmount(r) { return Number(r.monto ?? r.monto_planificado ?? r.amount ?? 0) || 0; }

  function normalizeKey(label,date,amount) {
    return `${String(label||'').trim().toLowerCase()}|${String(date||'').slice(0,10)}|${Math.round(Number(amount)||0)}`;
  }

  function buildCommitted() {
    const items=[],seen=new Set();
    for (const r of state.quotas) {
      const amount=quotaAmount(r); if(amount<=0) continue;
      const key=normalizeKey(r.concepto||r.descripcion||r.deuda_id,quotaDate(r),amount);
      seen.add(key);
      items.push({source:'CUOTA_DEUDA',label:r.concepto||r.descripcion||'Cuota de deuda',date:quotaDate(r),amount});
    }
    for (const r of state.commitments) {
      const amount=commitmentAmount(r); if(amount<=0) continue;
      const key=normalizeKey(commitmentLabel(r),r.fecha_vencimiento,amount);
      if(seen.has(key)) continue;
      items.push({source:'COMPROMISO',label:commitmentLabel(r),date:r.fecha_vencimiento||'',amount});
    }
    return items;
  }

  function futureIncomeTotal() {
    let total=0;
    for(const r of state.movements){
      const t=String(r.tipo||'').toLowerCase();
      if((t==='ingreso'||t==='income')&&String(r.fecha)>today()) total+=movementAmount(r);
    }
    for(const r of state.futureIncomes) total+=futureAmount(r);
    return total;
  }

  function futureExpenseTotal(committed) {
    let total=0;
    const committedKeys=new Set(committed.map(x=>normalizeKey(x.label,x.date,x.amount)));
    for(const r of state.movements){
      const t=String(r.tipo||'').toLowerCase();
      if(t!=='ingreso'&&String(r.fecha)>today()) total+=movementAmount(r);
    }
    for(const r of state.futureExpenses){
      const amount=futureAmount(r);
      const label=r.concepto||r.descripcion||r.nombre||'Gasto planificado';
      const date=r.fecha||r.fecha_vencimiento||'';
      const key=normalizeKey(label,date,amount);
      if(!committedKeys.has(key)) total+=amount;
    }
    for(const x of committed) if(x.date&&x.date>today()) total+=x.amount;
    return total;
  }

  function calculate() {
    const planIncome=state.lines.filter(x=>x.tipo==='INGRESO').reduce((s,x)=>s+Number(x.monto_plan||0),0);
    const planExpense=state.lines.filter(x=>x.tipo==='EGRESO').reduce((s,x)=>s+Number(x.monto_plan||0),0);
    const execIncomeMap=executedByCategory('INGRESO');
    const execExpenseMap=executedByCategory('EGRESO');
    const execIncome=[...execIncomeMap.values()].reduce((s,n)=>s+n,0);
    const execExpense=[...execExpenseMap.values()].reduce((s,n)=>s+n,0);
    const committedItems=buildCommitted();
    const committed=committedItems.reduce((s,x)=>s+x.amount,0);
    const futureIncome=futureIncomeTotal();
    const futureExpense=futureExpenseTotal(committedItems);
    const projectedIncome=execIncome+futureIncome;
    const projectedExpense=execExpense+futureExpense;
    return {
      planIncome,planExpense,execIncome,execExpense,committedItems,committed,
      futureIncome,futureExpense,projectedIncome,projectedExpense,
      planResult:planIncome-planExpense,
      execResult:execIncome-execExpense,
      projectedResult:projectedIncome-projectedExpense,
      execIncomeMap,execExpenseMap
    };
  }

  function renderHeader(calc) {
    $('b233PlanIncome').textContent=money(calc.planIncome);
    $('b233PlanExpense').textContent=money(calc.planExpense);
    $('b233ExecIncome').textContent=money(calc.execIncome);
    $('b233ExecExpense').textContent=money(calc.execExpense);
    $('b233Committed').textContent=money(calc.committed);
    $('b233PlanResult').textContent=money(calc.planResult);
    $('b233ExecResult').textContent=money(calc.execResult);
    $('b233Projected').textContent=money(calc.projectedResult);
    const b=state.budget;
    $('b233BudgetStatus').textContent=b?({borrador:'Borrador',activo:'Activo',cerrado:'Cerrado'}[String(b.estado).toLowerCase()]||b.estado):'Sin presupuesto';
    $('b233BudgetName').textContent=b?`${b.nombre||'Presupuesto'} · ${monthLabel(state.month)}`:'Crea el presupuesto del mes para comenzar.';
    const msg=$('b233Msg');
    if(msg&&!msg.textContent)msg.classList.add('hidden');
  }

  function renderReading(calc) {
    const plan=calc.planResult,proj=calc.projectedResult;
    let text='';
    if(plan>0)text+=`<div class="b233-reading-row"><b>Plan</b><span>Superávit planificado de ${money(plan)}.</span></div>`;
    else if(plan<0)text+=`<div class="b233-reading-row"><b>Plan</b><span>Déficit planificado de ${money(Math.abs(plan))}.</span></div>`;
    else text+=`<div class="b233-reading-row"><b>Plan</b><span>Ingresos y egresos planificados quedan equilibrados.</span></div>`;
    text+=`<div class="b233-reading-row"><b>Ejecutado</b><span>${money(calc.execIncome)} de ingresos y ${money(calc.execExpense)} de egresos registrados.</span></div>`;
    text+=`<div class="b233-reading-row"><b>Comprometido</b><span>${money(calc.committed)} en obligaciones pendientes dentro del período.</span></div>`;
    text+=`<div class="b233-reading-row"><b>Proyección</b><span>Resultado estimado del período: ${money(proj)}.</span></div>`;
    $('b233Reading').innerHTML=text;
  }

  function renderLines(calc) {
    const body=$('b233LinesBody');
    if(!state.lines.length){
      body.innerHTML='<tr><td colspan="8"><span class="muted">No hay líneas presupuestarias.</span></td></tr>';
      return;
    }
    body.innerHTML=state.lines.map(line=>{
      const map=line.tipo==='INGRESO'?calc.execIncomeMap:calc.execExpenseMap;
      const executed=Number(map.get(line.categoria)||0);
      const planned=Number(line.monto_plan||0);
      const deviation=line.tipo==='INGRESO'?executed-planned:planned-executed;
      const pct=planned>0?(executed/planned)*100:(executed>0?100:0);
      return `<tr>
        <td><span class="b233-badge ${line.tipo.toLowerCase()}">${line.tipo}</span></td>
        <td><b>${esc(line.categoria)}</b>${line.descripcion?`<small>${esc(line.descripcion)}</small>`:''}</td>
        <td>${money(planned)}</td><td>${money(executed)}</td>
        <td class="${deviation<0?'negative':'positive'}">${money(deviation)}</td>
        <td>${pct.toFixed(1)}%</td><td>${Number(line.prioridad||3)}</td>
        <td><div class="b233-actions">
          <button type="button" class="small" data-b233-edit="${esc(line.id)}">Editar</button>
          <button type="button" class="small danger" data-b233-delete="${esc(line.id)}">Borrar</button>
        </div></td>
      </tr>`;
    }).join('');

    body.querySelectorAll('[data-b233-edit]').forEach(btn=>{
      btn.onclick=()=>{
        const line=state.lines.find(x=>String(x.id)===String(btn.dataset.b233Edit));
        if(line)editLine(line);
      };
    });
    body.querySelectorAll('[data-b233-delete]').forEach(btn=>btn.onclick=()=>deleteLine(btn.dataset.b233Delete));
  }

  function renderCommitted(calc) {
    const box=$('b233CommittedDetail');
    if(!calc.committedItems.length){
      box.innerHTML='<p class="muted">No hay compromisos o cuotas pendientes detectadas en el período.</p>';
      return;
    }
    box.innerHTML=`<div class="b233-detail-total"><span>Total comprometido</span><strong>${money(calc.committed)}</strong></div>
      ${calc.committedItems.map(x=>`<div class="b233-detail-row"><div><b>${esc(x.label)}</b><small>${esc(x.source)} · ${esc(x.date||'Sin fecha')}</small></div><strong>${money(x.amount)}</strong></div>`).join('')}`;
  }

  function renderProjection(calc) {
    $('b233ProjectionDetail').innerHTML=`<div class="b233-detail-total"><span>Ingresos proyectados</span><strong>${money(calc.projectedIncome)}</strong></div>
      <div class="b233-detail-row"><div><b>Ingresos futuros</b><small>Movimientos futuros + fuentes futuras disponibles</small></div><strong>${money(calc.futureIncome)}</strong></div>
      <div class="b233-detail-row"><div><b>Egresos futuros</b><small>Movimientos futuros + gastos planificados + obligaciones pendientes</small></div><strong>${money(calc.futureExpense)}</strong></div>
      <div class="b233-detail-total"><span>Resultado proyectado</span><strong>${money(calc.projectedResult)}</strong></div>
      <div class="b233-actions" style="margin-top:10px"><button type="button" class="secondary small" id="b233TraceToggle">Ver cálculo detallado</button></div>
      <div id="b233TracePanel" class="b233-hidden"></div>`;
    const toggle=$('b233TraceToggle');
    if(toggle)toggle.onclick=()=>{
      const panel=$('b233TracePanel'); if(!panel)return;
      const hidden=panel.classList.contains('b233-hidden');
      if(hidden){renderTraceability(calc);panel.classList.remove('b233-hidden');toggle.textContent='Ocultar cálculo detallado';}
      else{panel.classList.add('b233-hidden');toggle.textContent='Ver cálculo detallado';}
    };
  }

  function futureMovementRows(type) {
    const wanted=type==='INGRESO';
    return state.movements.filter(r=>{
      const t=String(r.tipo||'').toLowerCase();
      const isIncome=t==='ingreso'||t==='income';
      return isIncome===wanted&&String(r.fecha||'')>today();
    }).map(r=>({source:'MOVIMIENTO_FUTURO',id:r.id??'',date:r.fecha||'',label:movementCategory(r),amount:movementAmount(r)}));
  }

  function futureTableRows(type) {
    const rows=[];
    for(const r of type==='INGRESO'?state.futureIncomes:state.futureExpenses){
      rows.push({
        source:type==='INGRESO'?'INGRESO_FUTURO':'GASTO_PLANIFICADO',
        id:r.id??'',date:r.fecha||r.fecha_vencimiento||'',
        label:r.concepto||r.descripcion||r.nombre||(type==='INGRESO'?'Ingreso futuro':'Gasto planificado'),
        amount:futureAmount(r)
      });
    }
    if(type==='EGRESO'){
      const committed=buildCommitted();
      rows.push(...committed.filter(x=>x.date&&x.date>today()).map(x=>({source:x.source,id:x.id??'',date:x.date,label:x.label,amount:x.amount})));
    }
    return rows.filter(x=>Number(x.amount)>0);
  }

  function traceRows(type) {
    return [...futureMovementRows(type),...futureTableRows(type)]
      .filter(x=>Number(x.amount)>0)
      .sort((a,b)=>String(a.date).localeCompare(String(b.date)));
  }

  function traceDuplicateGroups(rows) {
    const groups=new Map();
    for(const r of rows){
      const key=normalizeKey(r.label,r.date,r.amount);
      if(!groups.has(key))groups.set(key,[]);
      groups.get(key).push(r);
    }
    return [...groups.values()].filter(g=>g.length>1);
  }

  function renderTraceRows(rows) {
    if(!rows.length)return '<p class="muted">Sin registros futuros que alimenten este componente.</p>';
    return rows.map(r=>`<div class="b233-trace-row"><span><b>${esc(r.label)}</b><small>${esc(r.source)} · ${esc(r.date||'Sin fecha')}${r.id!==''?` · ID ${esc(r.id)}`:''}</small></span><strong>${money(r.amount)}</strong></div>`).join('');
  }

  function renderTraceability(calc) {
    const panel=$('b233TracePanel'); if(!panel)return;
    const incomeRows=traceRows('INGRESO'),expenseRows=traceRows('EGRESO');
    const incomeDuplicates=traceDuplicateGroups(incomeRows),expenseDuplicates=traceDuplicateGroups(expenseRows);
    const incomeFutureSum=incomeRows.reduce((s,x)=>s+Number(x.amount||0),0);
    const expenseFutureSum=expenseRows.reduce((s,x)=>s+Number(x.amount||0),0);
    const formulaIncome=`${money(calc.execIncome)} + ${money(calc.futureIncome)} = ${money(calc.projectedIncome)}`;
    const formulaExpense=`${money(calc.execExpense)} + ${money(calc.futureExpense)} = ${money(calc.projectedExpense)}`;
    const formulaResult=`${money(calc.projectedIncome)} - ${money(calc.projectedExpense)} = ${money(calc.projectedResult)}`;
    const warning=incomeDuplicates.length||expenseDuplicates.length
      ? '<div class="b233-trace-warning"><b>Revisión de posibles duplicados:</b> se detectaron registros con misma descripción, fecha y monto. No se eliminan ni descuentan automáticamente.</div>'
      : '<div class="b233-trace-ok">No se detectaron coincidencias exactas por descripción + fecha + monto dentro de las fuentes futuras consultadas.</div>';

    panel.innerHTML=`<div class="b233-trace">
      <div class="b233-trace-head"><div><b>Trazabilidad B233.18</b><small class="muted">Cada total puede relacionarse con sus componentes de origen.</small></div><span class="b233-badge">LECTURA</span></div>
      <div class="b233-trace-grid">
        <div class="b233-trace-box"><h4>Ingresos</h4>
          <div class="b233-trace-row"><span>Ejecutados</span><strong>${money(calc.execIncome)}</strong></div>
          <div class="b233-trace-row"><span>Futuros detectados</span><strong>${money(incomeFutureSum)}</strong></div>
          <div class="b233-trace-row b233-trace-total"><span>Proyectados</span><strong>${money(calc.projectedIncome)}</strong></div>
          <p class="muted" style="font-size:11px;margin:8px 0 0">${esc(formulaIncome)}</p>
        </div>
        <div class="b233-trace-box"><h4>Egresos</h4>
          <div class="b233-trace-row"><span>Ejecutados</span><strong>${money(calc.execExpense)}</strong></div>
          <div class="b233-trace-row"><span>Futuros + obligaciones</span><strong>${money(expenseFutureSum)}</strong></div>
          <div class="b233-trace-row b233-trace-total"><span>Proyectados</span><strong>${money(calc.projectedExpense)}</strong></div>
          <p class="muted" style="font-size:11px;margin:8px 0 0">${esc(formulaExpense)}</p>
        </div>
      </div>
      <div class="b233-trace-box" style="margin-top:10px"><h4>Resultado proyectado</h4>
        <div class="b233-trace-row b233-trace-total"><span>Ingresos proyectados − egresos proyectados</span><strong>${money(calc.projectedResult)}</strong></div>
        <p class="muted" style="font-size:11px;margin:8px 0 0">${esc(formulaResult)}</p>
      </div>
      <div class="b233-trace-grid">
        <div class="b233-trace-box"><h4>Origen de ingresos futuros</h4>${renderTraceRows(incomeRows)}</div>
        <div class="b233-trace-box"><h4>Origen de egresos futuros</h4>${renderTraceRows(expenseRows)}</div>
      </div>
      ${warning}
      <p class="muted" style="font-size:10px;margin:9px 0 0">Esta trazabilidad es de lectura. No modifica movimientos, ingresos futuros, gastos planificados, compromisos ni cuotas.</p>
    </div>`;
  }

  function renderAll() {
    const calc=calculate();
    renderHeader(calc);
    renderReading(calc);
    renderLines(calc);
    renderCommitted(calc);
    renderProjection(calc);
  }

  async function loadBudget(force=false) {
    // El botón Crear/recuperar siempre debe poder reintentar aunque la
    // carga automática inicial haya quedado pendiente.
    if(state.loading && !force) return;
    if(!db()){
      notify('Supabase no está disponible. Recarga la página e inténtalo nuevamente.',false);
      return;
    }
    state.loading=true;
    const btn=$('b233Create');
    const original=btn?.textContent;
    if(btn){
      btn.disabled=true;
      btn.textContent='Recuperando…';
    }
    try{
      const budget=await Promise.race([
        ensureBudget(),
        new Promise((_,reject)=>setTimeout(()=>reject(new Error('La recuperación tardó demasiado. Vuelve a pulsar el botón.')),12000))
      ]);
      if(!budget)return;
      await loadData();
      renderAll();
      notify('Presupuesto recuperado correctamente.');
    }catch(e){
      console.error('[B233.22] Recuperación:',e);
      notify(e?.message || 'No se pudo recuperar el presupuesto.',false);
    }finally{
      state.loading=false;
      if(btn){
        btn.disabled=false;
        btn.textContent=original || 'Crear / recuperar';
      }
    }
  }

  async function setMonth(value) {
    if(!value)return;
    state.month=value;
    $('b233Month').value=value;
    await loadBudget();
  }

  async function updateStatus(status) {
    if(!state.budget)return;
    const c=db();
    if(!c){notify('No hay conexión autenticada con Supabase.',false);return;}
    const r=await c.from('presupuestos').update({estado:status}).eq('id',state.budget.id);
    if(r.error){notify(r.error.message,false);return;}
    notify(`Presupuesto ${status.toLowerCase()}.`);
    await loadBudget();
  }

  function wire() {
    $('b233Month').value=state.month;
    $('b233Prev').onclick=()=>{
      const [y,m]=state.month.split('-').map(Number);
      const d=new Date(y,m-2,1);
      setMonth(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`);
    };
    $('b233Next').onclick=()=>{
      const [y,m]=state.month.split('-').map(Number);
      const d=new Date(y,m,1);
      setMonth(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`);
    };
    $('b233Month').onchange=e=>setMonth(e.target.value);
    $('b233Create').onclick=()=>loadBudget(true);
    $('b233Activate').onclick=()=>updateStatus('activo');
    $('b233Close').onclick=()=>updateStatus('cerrado');
    $('b233LineForm').onsubmit=saveLine;
    $('b233LineCancel').onclick=resetLineForm;
    document.addEventListener('click',e=>{
      const b=e.target.closest('[data-tab="presupuesto"]');
      if(b)setTimeout(loadBudget,0);
    });
  }

  function boot() {
    ensureStyles();
    ensureSection();
    ensureNav();
    wire();
    const app=$('app');
    if(!app)return;
    if(!app.classList.contains('hidden')){
      loadBudget();
      return;
    }
    const observer=new MutationObserver(()=>{
      if(!app.classList.contains('hidden')){
        ensureNav();
        loadBudget();
        observer.disconnect();
      }
    });
    observer.observe(app,{attributes:true,attributeFilter:['class']});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();

  window.B233Presupuesto={reload:loadBudget,show:showBudget};
})();
