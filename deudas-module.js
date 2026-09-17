
/* FINANZAS V2.1 — Módulo Deudas
   Requiere: Supabase JS v2 y una variable global `db`.
   Se integra sobre la app existente sin reemplazar sus módulos.
*/
(() => {
  const $d = id => document.getElementById(id);
  const clp = n => new Intl.NumberFormat("es-CL", {
    style: "currency", currency: "CLP", maximumFractionDigits: 0
  }).format(Number(n) || 0);

  const esc = v => String(v ?? "").replace(/[&<>"']/g, c => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;"
  }[c]));

  const today = () => {
    const d = new Date();
    return new Date(d.getTime() - d.getTimezoneOffset()*60000)
      .toISOString().slice(0,10);
  };

  const state = { debts: [], plans: [], quotas: [], selectedDebt: null };

  async function loadDebts() {
    if (!window.db) return;
    const { data, error } = await db
      .from("v_deudas_resumen")
      .select("*")
      .order("estado", { ascending: true })
      .order("saldo_actual", { ascending: false });

    if (error) {
      console.error(error);
      renderError("No fue posible cargar las deudas: " + error.message);
      return;
    }
    state.debts = data || [];
    renderSummary();
    renderDebtList();
  }

  function renderError(text) {
    const box = $d("deudasMsg");
    if (box) box.textContent = text;
  }

  function renderSummary() {
    const original = state.debts.reduce((s,d)=>s+Number(d.monto_original||0),0);
    const balance = state.debts
      .filter(d=>d.estado !== "pagada" && d.estado !== "cancelada")
      .reduce((s,d)=>s+Number(d.saldo_actual||0),0);
    const pending = state.debts.reduce((s,d)=>s+Number(d.cuotas_pendientes||0),0);
    const overdue = state.debts.filter(d=>d.estado === "vigente")
      .reduce((s,d)=>s+Number(d.cuotas_pendientes||0),0);

    for (const [id,val] of [
      ["deudaOriginalTotal", original],
      ["deudaSaldoTotal", balance],
      ["deudaCuotasTotal", pending],
      ["deudaVigenteTotal", overdue]
    ]) {
      const el = $d(id);
      if (el) el.textContent = clp(val);
    }
  }

  function renderDebtList() {
    const box = $d("deudasLista");
    if (!box) return;

    if (!state.debts.length) {
      box.innerHTML = `<p class="muted">No hay deudas registradas todavía.</p>`;
      return;
    }

    box.innerHTML = state.debts.map(d => `
      <article class="debt-card">
        <div class="debt-card-main">
          <span class="debt-type">${esc(d.tipo_acreedor || "Sin clasificar")}</span>
          <h3>${esc(d.acreedor)}</h3>
          <p>${esc(d.concepto || "Sin concepto")}</p>
        </div>
        <div class="debt-card-values">
          <span>Saldo actual</span>
          <strong>${clp(d.saldo_actual)}</strong>
          <small>Original: ${clp(d.monto_original)}</small>
        </div>
        <div class="debt-card-meta">
          <span>${Number(d.numero_cuotas_pendientes||0)} cuotas pendientes</span>
          <span>Próximo: ${esc(d.proximo_vencimiento || "—")}</span>
        </div>
        <div class="form-actions">
          <button type="button" onclick="window.verDeuda(${Number(d.id)})">Ver detalle</button>
        </div>
      </article>
    `).join("");
  }

  window.verDeuda = async id => {
    const debt = state.debts.find(d => Number(d.id) === Number(id));
    if (!debt) return;

    state.selectedDebt = debt;

    const { data: plans, error: pe } = await db
      .from("renegociaciones_deuda")
      .select("*")
      .eq("deuda_id", id)
      .order("version", { ascending: false });

    if (pe) return renderError(pe.message);

    const { data: quotas, error: qe } = await db
      .from("cuotas_deuda")
      .select("*")
      .eq("deuda_id", id)
      .order("fecha_vencimiento", { ascending: true });

    if (qe) return renderError(qe.message);

    state.plans = plans || [];
    state.quotas = quotas || [];
    renderDebtDetail();
  };

  function renderDebtDetail() {
    const box = $d("deudaDetalle");
    if (!box || !state.selectedDebt) return;

    const d = state.selectedDebt;
    const activePlan = state.plans.find(p => p.estado === "activo") || state.plans[0];

    box.innerHTML = `
      <div class="section-title">
        <div>
          <span class="muted">Detalle de deuda</span>
          <h2>${esc(d.acreedor)}</h2>
          <p>${esc(d.concepto || "")}</p>
        </div>
        <button type="button" class="secondary"
          onclick="document.getElementById('deudaDetalle').innerHTML=''">
          Cerrar
        </button>
      </div>

      <div class="cards">
        <article class="metric"><span>Saldo actual</span><strong>${clp(d.saldo_actual)}</strong></article>
        <article class="metric"><span>Deuda original</span><strong>${clp(d.monto_original)}</strong></article>
        <article class="metric"><span>Cuotas pendientes</span><strong>${Number(d.numero_cuotas_pendientes||0)}</strong></article>
        <article class="metric"><span>Próximo vencimiento</span><strong>${esc(d.proximo_vencimiento || "—")}</strong></article>
      </div>

      <h3>Plan de pago</h3>
      ${activePlan ? `
        <div class="debt-plan">
          <span>Versión ${activePlan.version}</span>
          <span>${Number(activePlan.numero_cuotas)} cuotas</span>
          <span>Cuota ${clp(activePlan.cuota_acordada)}</span>
          <span>Primera cuota ${esc(activePlan.fecha_primera_cuota)}</span>
          <span>${esc(activePlan.frecuencia)}</span>
        </div>
      ` : `<p class="muted">No existe todavía un plan de cuotas.</p>`}

      <h3>Calendario</h3>
      <div class="debt-quota-list">
        ${state.quotas.length ? state.quotas.map(q => `
          <div class="quota-row">
            <div>
              <strong>Cuota ${q.numero_cuota}</strong>
              <span>${esc(q.fecha_vencimiento)}</span>
            </div>
            <div>
              <strong>${clp(q.monto)}</strong>
              <span>${esc(q.estado)}</span>
            </div>
            ${q.estado === "pendiente" || q.estado === "vencida"
              ? `<button type="button" onclick="window.pagarCuota(${q.id})">Registrar pago</button>`
              : ""}
          </div>
        `).join("") : `<p class="muted">No hay cuotas generadas.</p>`}
      </div>
    `;
  }

  window.pagarCuota = async cuotaId => {
    const cuota = state.quotas.find(q => Number(q.id) === Number(cuotaId));
    if (!cuota) return;

    const amount = Number(prompt(
      `Monto pagado para la cuota ${cuota.numero_cuota}:`,
      Number(cuota.monto)
    ));
    if (!Number.isFinite(amount) || amount <= 0) return;

    const fecha = prompt("Fecha real de pago (AAAA-MM-DD):", today());
    if (!fecha) return;

    const { data: movimiento, error: me } = await db
      .from("movimientos")
      .insert({
        tipo: "gasto",
        fecha,
        monto: amount,
        categoria: "Deuda",
        descripcion: `${state.selectedDebt.acreedor} — cuota ${cuota.numero_cuota}`
      })
      .select("id")
      .single();

    if (me) return alert(me.message);

    const { error: pe } = await db
      .from("pagos_deuda")
      .insert({
        cuota_id: cuotaId,
        fecha_pago: fecha,
        monto: amount,
        movimiento_id: movimiento.id
      });

    if (pe) {
      // Evita dejar un movimiento huérfano si el pago no pudo vincularse.
      await db.from("movimientos").delete().eq("id", movimiento.id);
      return alert(pe.message);
    }

    const { error: qe } = await db
      .from("cuotas_deuda")
      .update({ estado: "pagada", fecha_pago: fecha })
      .eq("id", cuotaId);

    if (qe) return alert(qe.message);

    await window.verDeuda(state.selectedDebt.id);
    if (typeof window.refresh === "function") await window.refresh();
  };

  function setupDebtForm() {
    const form = $d("deudaForm");
    if (!form) return;

    const rate = $d("deudaTasa");
    const amount = $d("deudaMonto");
    const terms = $d("deudaCuotas");
    const agreed = $d("deudaCuota");

    function estimate() {
      if (!rate || !amount || !terms || !agreed) return;
      const P = Number(amount.value);
      const n = Number(terms.value);
      const annual = Number(rate.value);

      if (!(P > 0 && n > 0)) return;

      if (annual > 0) {
        const r = annual / 100 / 12;
        const payment = P * r * Math.pow(1+r,n) / (Math.pow(1+r,n)-1);
        agreed.value = Math.round(payment);
      } else {
        agreed.value = Math.round(P / n);
      }
    }

    [amount, terms, rate].forEach(el => el?.addEventListener("input", estimate));

    form.addEventListener("submit", async e => {
      e.preventDefault();
      const get = id => $d(id)?.value?.trim();

      const debt = {
        acreedor: get("deudaAcreedor"),
        concepto: get("deudaConcepto") || null,
        tipo_acreedor: get("deudaTipo"),
        monto_original: Number(get("deudaMonto") || 0),
        saldo_actual: Number(get("deudaSaldo") || get("deudaMonto") || 0),
        cuota: Number(get("deudaCuota") || 0),
        fecha_proximo_pago: get("deudaPrimeraCuota") || null,
        estado: "vigente",
        tasa_anual: Number(get("deudaTasa") || 0) || null,
        numero_cuotas: Number(get("deudaCuotas") || 0) || null,
        cuota_acordada: Number(get("deudaCuota") || 0) || null,
        fecha_inicio: get("deudaInicio") || null,
        fecha_primera_cuota: get("deudaPrimeraCuota") || null,
        frecuencia: get("deudaFrecuencia") || "mensual"
      };

      if (!debt.acreedor || !(debt.saldo_actual >= 0)) {
        return renderError("Acreedor y saldo son obligatorios.");
      }

      const { data: created, error } = await db
        .from("deudas")
        .insert(debt)
        .select("id")
        .single();

      if (error) return renderError(error.message);

      // Si hay datos suficientes, crear la primera versión del plan.
      if (debt.numero_cuotas && debt.fecha_primera_cuota) {
        const { data: plan, error: planError } = await db
          .from("renegociaciones_deuda")
          .insert({
            deuda_id: created.id,
            version: 1,
            saldo_inicial: debt.saldo_actual,
            pie: 0,
            saldo_financiado: debt.saldo_actual,
            tasa_anual: debt.tasa_anual,
            numero_cuotas: debt.numero_cuotas,
            cuota_acordada: debt.cuota_acordada,
            fecha_primera_cuota: debt.fecha_primera_cuota,
            frecuencia: debt.frecuencia,
            estado: "activo"
          })
          .select("id")
          .single();

        if (planError) return renderError(
          "La deuda fue creada, pero el plan no pudo crearse: " + planError.message
        );

        await generateQuotas(plan, debt);
      }

      form.reset();
      await loadDebts();
      alert("Deuda registrada correctamente.");
    });
  }

  async function generateQuotas(plan, debt) {
    const rows = [];
    let balance = Number(plan.saldo_financiado);
    const n = Number(plan.numero_cuotas);
    const agreed = Number(plan.cuota_acordada || 0);
    const annual = Number(plan.tasa_anual || 0);
    const monthlyRate = annual / 100 / 12;

    let date = new Date(plan.fecha_primera_cuota + "T12:00:00");

    for (let i=1; i<=n; i++) {
      let interest = monthlyRate > 0 ? balance * monthlyRate : 0;
      let capital = agreed - interest;

      if (i === n || capital > balance) {
        capital = balance;
      }

      let payment = capital + interest;
      if (annual === 0) {
        payment = i === n ? balance : agreed;
        capital = payment;
        interest = 0;
      }

      balance = Math.max(0, balance - capital);

      rows.push({
        deuda_id: debt.id,
        plan_id: plan.id,
        numero_cuota: i,
        fecha_vencimiento: date.toISOString().slice(0,10),
        monto: Math.round(payment),
        capital: Math.round(capital),
        interes: Math.round(interest),
        otros_cargos: 0,
        saldo_proyectado: Math.round(balance),
        estado: "pendiente"
      });

      date = new Date(date);
      date.setMonth(date.getMonth() + 1);
    }

    const { error } = await db.from("cuotas_deuda").insert(rows);
    if (error) throw error;
  }

  window.cargarDeudas = loadDebts;
  setupDebtForm();
})();
