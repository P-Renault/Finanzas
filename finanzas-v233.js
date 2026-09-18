/* FINANZAS V2.3.3 — B231.1
   Cero Financiero + Liquidez + Cuentas + Deudas
   Corrección crítica: persistencia de modalidad CUOTAS.
*/
(() => {
  'use strict';

  const $ = id => document.getElementById(id);

  const money = n =>
    new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0
    }).format(Number(n) || 0);

  const today = () => {
    const d = new Date();
    return new Date(
      d.getTime() - d.getTimezoneOffset() * 60000
    ).toISOString().slice(0, 10);
  };

  const esc = v =>
    String(v ?? '').replace(
      /[&<>"']/g,
      c => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
      }[c])
    );

  let client = null;
  let accounts = [];
  let debts = [];
  let selected = null;
  let plans = [];
  let quotas = [];

  /* ============================================================
     CONEXIÓN SUPABASE
     ============================================================ */

  async function db() {
    if (client) return client;

    const u = localStorage.getItem('sf_url');
    const k = localStorage.getItem('sf_key');

    if (!u || !k || !window.supabase) {
      console.error('FIN23: Supabase no disponible.');
      return null;
    }

    client = window.supabase.createClient(u, k);
    return client;
  }

  /* ============================================================
     NAVEGACIÓN
     ============================================================ */

  function tab(id) {
    document.querySelectorAll('.tabs button').forEach(b => {
      b.classList.toggle('active', b.dataset.tab === id);
    });

    document.querySelectorAll('.tab').forEach(s => {
      s.classList.add('hidden');
    });

    $(id)?.classList.remove('hidden');
  }

  function injectTabs() {
    const t = document.querySelector('.tabs');
    if (!t) return;

    [
      ['deudas', 'Deudas'],
      ['cuentas', 'Cuentas']
    ].forEach(([id, label]) => {
      if (!t.querySelector(`[data-tab="${id}"]`)) {
        const b = document.createElement('button');
        b.type = 'button';
        b.dataset.tab = id;
        b.textContent = label;
        b.onclick = () => tab(id);
        t.appendChild(b);
      }
    });
  }

  /* ============================================================
     SECCIONES
     ============================================================ */

  function injectSections() {
    const app = $('app');
    if (!app) return;

    if (!$('cuentas')) {
      const s = document.createElement('section');
      s.id = 'cuentas';
      s.className = 'tab hidden';

      s.innerHTML = `
        <div class="card">
          <div class="section-title">
            <div>
              <span class="muted">Estructura de liquidez</span>
              <h2>Cuentas bancarias</h2>
            </div>
            <span class="muted">Registra todas tus cuentas</span>
          </div>

          <form id="cuentaForm" class="grid2">
            <input type="hidden" id="cuentaId">

            <label>
              Banco / institución
              <input id="cuentaBanco" required placeholder="Banco de Chile">
            </label>

            <label>
              Nombre de cuenta
              <input id="cuentaNombre" required placeholder="Cuenta corriente">
            </label>

            <label>
              Tipo
              <select id="cuentaTipo">
                <option>Cuenta corriente</option>
                <option>Cuenta vista</option>
                <option>Cuenta RUT</option>
                <option>Ahorro</option>
                <option>Otro</option>
              </select>
            </label>

            <label>
              Identificador parcial
              <input id="cuentaIdentificador" placeholder="****1234">
            </label>

            <label>
              Saldo de apertura
              <input id="cuentaApertura" type="number" min="0" step="1" value="0">
            </label>

            <label>
              Fecha de corte
              <input id="cuentaFecha" type="date" value="${today()}">
            </label>

            <label class="full">
              Notas
              <input id="cuentaNotas" placeholder="Propósito, uso, observaciones">
            </label>

            <div class="form-actions full">
              <button id="cuentaSubmit">Registrar cuenta</button>
              <button type="button" id="cuentaCancel" class="secondary hidden">
                Cancelar
              </button>
            </div>
          </form>

          <p id="cuentaMsg" class="status"></p>
        </div>

        <div class="card">
          <div class="section-title">
            <h2>Cuentas registradas</h2>
            <strong id="liquidezCuentasTotal">$0</strong>
          </div>
          <div id="cuentasLista"></div>
        </div>
      `;

      app.appendChild(s);
    }

    if (!$('deudas')) {
      const s = document.createElement('section');
      s.id = 'deudas';
      s.className = 'tab hidden';

      s.innerHTML = `
        <div class="card">
          <div class="section-title">
            <div>
              <span class="muted">Reconstrucción patrimonial</span>
              <h2>Deudas</h2>
            </div>
            <span class="muted">Deuda → plan → cuotas → pago real</span>
          </div>

          <div class="cards two">
            <article class="metric">
              <span>Deuda original total</span>
              <strong id="deudaOriginalTotal">$0</strong>
            </article>
            <article class="metric">
              <span>Saldo pendiente total</span>
              <strong id="deudaSaldoTotal">$0</strong>
            </article>
            <article class="metric">
              <span>Cuotas pendientes</span>
              <strong id="deudaCuotasTotal">0</strong>
            </article>
            <article class="metric">
              <span>Próximos 30 días</span>
              <strong id="deuda30Total">$0</strong>
            </article>
          </div>

          <form id="deudaForm" class="grid2">
            <input type="hidden" id="deudaId">

            <label>
              Tipo de acreedor
              <select id="deudaTipo">
                <option>Banco</option>
                <option>Persona</option>
                <option>Empresa</option>
                <option>Servicio</option>
                <option>Otro</option>
              </select>
            </label>

            <label>
              Acreedor
              <input id="deudaAcreedor" required>
            </label>

            <label>
              Concepto
              <input id="deudaConcepto" placeholder="Crédito, deuda personal...">
            </label>

            <label>
              Monto original
              <input id="deudaMonto" type="number" min="0" step="1" required>
            </label>

            <label>
              Saldo actual
              <input id="deudaSaldo" type="number" min="0" step="1" required>
            </label>

            <label>
              Tasa anual %
              <input id="deudaTasa" type="number" min="0" step="0.01" value="0">
            </label>

            <label>
              Modalidad de pago
              <select id="deudaModalidad">
                <option value="UNICO">Pago único — sin plan de cuotas</option>
                <option value="CUOTAS">Cuotas — existe acuerdo de pago en cuotas</option>
              </select>
            </label>

            <label id="deudaCuotasWrap">
              Número de cuotas
              <input id="deudaCuotas" type="number" min="1" step="1">
            </label>

            <label id="deudaCuotaWrap">
              Cuota acordada
              <input id="deudaCuota" type="number" min="0" step="1">
            </label>

            <div id="deudaModalidadHelp" class="full muted" style="margin-top:-6px">
              Pago único: no existe un acuerdo vigente de cuotas.
              Puede tener fecha de vencimiento o quedar sin fecha;
              no se generará plan de cuotas.
            </div>

            <label>
              Fecha de inicio
              <input id="deudaInicio" type="date" value="${today()}">
            </label>

            <label>
              Primera cuota
              <input id="deudaPrimeraCuota" type="date" value="${today()}">
            </label>

            <label class="full" style="display:flex;align-items:center;gap:8px">
              <input
                id="b2312-sin-fecha"
                type="checkbox"
                style="width:auto"
              >
              <span>Sin fecha de pago definida todavía</span>
            </label>

            <label>
              Frecuencia
              <select id="deudaFrecuencia">
                <option value="mensual">Mensual</option>
                <option value="semanal">Semanal</option>
                <option value="quincenal">Quincenal</option>
                <option value="unico">Única</option>
              </select>
            </label>

            <label class="full">
              Notas
              <input id="deudaNotas" placeholder="Acuerdo, contexto, prioridad...">
            </label>

            <div class="form-actions full">
              <button id="deudaSubmit">Registrar deuda</button>
              <button type="button" id="deudaCancel" class="secondary hidden">
                Cancelar edición
              </button>
            </div>
          </form>

          <p id="deudasMsg" class="status"></p>
        </div>

        <div class="card">
          <h2>Deudas registradas</h2>
          <div id="deudasLista"></div>
        </div>

        <div class="card" id="deudaDetalle">
          <p class="muted">
            Selecciona una deuda para reconstruir o revisar su plan.
          </p>
        </div>
      `;

      app.appendChild(s);
    }
  }

  /* ============================================================
     CUENTAS
     ============================================================ */

  async function loadAccounts() {
    const c = await db();

    if (!c || !$('cuentasLista')) return;

    const r = await c
      .from('cuentas_bancarias')
      .select('*')
      .order('activa', { ascending: false })
      .order('nombre_banco');

    if (r.error) {
      $('cuentaMsg').textContent = r.error.message;
      return;
    }

    accounts = r.data || [];
    renderAccounts();
  }

  function renderAccounts() {
    const active = accounts.filter(a => a.activa !== false);

    const total = active.reduce(
      (s, a) => s + Number(a.saldo_actual ?? a.saldo_apertura ?? 0),
      0
    );

    if ($('liquidezCuentasTotal')) {
      $('liquidezCuentasTotal').textContent = money(total);
    }

    $('cuentasLista').innerHTML = accounts.length
      ? accounts.map(a => `
          <article class="account-row">
            <div>
              <span class="muted">${esc(a.tipo_cuenta || 'Cuenta')}</span>
              <h3>${esc(a.nombre_banco)}</h3>
              <p>
                ${esc(a.nombre_cuenta)}
                ${a.identificador ? ` · ${esc(a.identificador)}` : ''}
              </p>
            </div>

            <div>
              <strong>${money(a.saldo_actual)}</strong>
              <small>Apertura ${money(a.saldo_apertura)}</small>
            </div>

            <div class="form-actions">
              <button onclick="window.editarCuenta23(${a.id})">Editar</button>
              <button class="danger" onclick="window.eliminarCuenta23(${a.id})">
                Eliminar
              </button>
            </div>
          </article>
        `).join('')
      : `
        <p class="muted">
          No hay cuentas registradas. Puedes registrar todas las que tengas,
          incluso con saldo $0.
        </p>
      `;
  }

  function resetAccount() {
    const f = $('cuentaForm');
    if (f) f.reset();

    $('cuentaId').value = '';
    $('cuentaFecha').value = today();
    $('cuentaSubmit').textContent = 'Registrar cuenta';
    $('cuentaCancel').classList.add('hidden');
  }

  window.editarCuenta23 = id => {
    const a = accounts.find(x => Number(x.id) === Number(id));
    if (!a) return;

    $('cuentaId').value = a.id;
    $('cuentaBanco').value = a.nombre_banco || '';
    $('cuentaNombre').value = a.nombre_cuenta || '';
    $('cuentaTipo').value = a.tipo_cuenta || 'Otro';
    $('cuentaIdentificador').value = a.identificador || '';
    $('cuentaApertura').value = a.saldo_apertura || 0;
    $('cuentaFecha').value = a.fecha_corte || today();
    $('cuentaNotas').value = a.notas || '';
    $('cuentaSubmit').textContent = 'Guardar cambios';
    $('cuentaCancel').classList.remove('hidden');

    tab('cuentas');
    scrollTo({ top: 0, behavior: 'smooth' });
  };

  window.eliminarCuenta23 = async id => {
    if (!confirm('¿Eliminar esta cuenta del catálogo?')) return;

    const c = await db();
    if (!c) return;

    const r = await c
      .from('cuentas_bancarias')
      .delete()
      .eq('id', id);

    if (r.error) return alert(r.error.message);

    await loadAccounts();
    await renderLiquidity();
  };

  function setupAccountForm() {
    $('cuentaCancel').onclick = resetAccount;

    $('cuentaForm').onsubmit = async e => {
      e.preventDefault();

      const c = await db();
      if (!c) return;

      const id = $('cuentaId').value;

      const p = {
        nombre_banco: $('cuentaBanco').value.trim(),
        nombre_cuenta: $('cuentaNombre').value.trim(),
        tipo_cuenta: $('cuentaTipo').value,
        identificador: $('cuentaIdentificador').value.trim() || null,
        saldo_apertura: Number($('cuentaApertura').value || 0),
        saldo_actual: Number($('cuentaApertura').value || 0),
        fecha_corte: $('cuentaFecha').value,
        notas: $('cuentaNotas').value.trim() || null,
        activa: true
      };

      const r = id
        ? await c.from('cuentas_bancarias').update(p).eq('id', id)
        : await c.from('cuentas_bancarias').insert(p);

      if (r.error) {
        $('cuentaMsg').textContent = r.error.message;
        return;
      }

      $('cuentaMsg').textContent =
        id ? 'Cuenta actualizada.' : 'Cuenta registrada.';

      resetAccount();
      await loadAccounts();
      await renderLiquidity();
    };
  }

  /* ============================================================
     LIQUIDEZ
     ============================================================ */

  async function renderLiquidity() {
    const d = $('dashboard');
    if (!d) return;

    let box = $('fin23Liquidity');

    if (!box) {
      box = document.createElement('div');
      box.id = 'fin23Liquidity';
      box.className = 'card liquidity-card';

      const a = d.querySelector('.cards');

      if (a) a.insertAdjacentElement('beforebegin', box);
      else d.prepend(box);
    }

    const c = await db();
    if (!c) return;

    const cr = await c
      .from('cierres_financieros')
      .select('*')
      .eq('activo', true)
      .order('fecha_corte', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (cr.error) return;

    const ac = await c
      .from('cuentas_bancarias')
      .select('*')
      .eq('activa', true);

    const opening = Number(cr.data?.saldo_inicial || 0);

    const accountTotal = (ac.data || []).reduce(
      (s, a) => s + Number(a.saldo_actual || 0),
      0
    );

    const cash = Math.max(0, opening - accountTotal);

    box.innerHTML = `
      <div class="section-title">
        <div>
          <span class="muted">
            CERO FINANCIERO · ${esc(cr.data?.fecha_corte || today())}
          </span>
          <h2>Liquidez inicial</h2>
        </div>

        <button class="secondary" onclick="window.fin23GoAccounts()">
          Gestionar cuentas
        </button>
      </div>

      <div class="liquidity-total">
        <span>Saldo de apertura</span>
        <strong>${money(opening)}</strong>
      </div>

      <div class="liquidity-breakdown">
        <article>
          <span>Efectivo / caja</span>
          <strong>${money(cash)}</strong>
        </article>

        <article>
          <span>Cuentas bancarias registradas</span>
          <strong>${money(accountTotal)}</strong>
        </article>
      </div>

      <p class="muted">
        La apertura corresponde al Cero Financiero.
        Las cuentas se administran en su propio catálogo
        y se agregan a la liquidez controlada.
      </p>
    `;
  }

  window.fin23GoAccounts = () => tab('cuentas');

  /* ============================================================
     DEUDAS — CARGA Y RESUMEN
     ============================================================ */

  async function loadDebts() {
    const c = await db();

    if (!c || !$('deudasLista')) return;

    const r = await c
      .from('v_deudas_resumen')
      .select('*')
      .order('acreedor');

    if (r.error) {
      $('deudasMsg').textContent = r.error.message;
      return;
    }

    debts = r.data || [];
    renderDebtList();
    await renderDebtSummary();
  }

  async function renderDebtSummary() {
    const active = debts.filter(
      d => !['pagada', 'cancelada'].includes(
        String(d.estado || '').toLowerCase()
      )
    );

    $('deudaOriginalTotal').textContent = money(
      active.reduce(
        (s, d) => s + Number(d.monto_original || 0),
        0
      )
    );

    $('deudaSaldoTotal').textContent = money(
      active.reduce(
        (s, d) => s + Number(d.saldo_actual || 0),
        0
      )
    );

    $('deudaCuotasTotal').textContent = String(
      active.reduce(
        (s, d) => s + Number(d.numero_cuotas_pendientes || 0),
        0
      )
    );

    const c = await db();
    if (!c) return;

    const t = today();
    const e = new Date(t + 'T12:00:00');
    e.setDate(e.getDate() + 30);

    const r = await c
      .from('cuotas_deuda')
      .select('monto')
      .in('estado', ['pendiente', 'vencida'])
      .gte('fecha_vencimiento', t)
      .lte('fecha_vencimiento', e.toISOString().slice(0, 10));

    $('deuda30Total').textContent = money(
      (r.data || []).reduce(
        (s, q) => s + Number(q.monto || 0),
        0
      )
    );
  }

  function renderDebtList() {
    $('deudasLista').innerHTML = debts.length
      ? debts.map(d => `
          <article class="debt-card">
            <div class="debt-card-main">
              <span class="debt-type">
                ${esc(d.tipo_acreedor || 'Sin clasificar')}
              </span>
              <h3>${esc(d.acreedor)}</h3>
              <p>${esc(d.concepto || '')}</p>
            </div>

            <div class="debt-card-values">
              <span>Saldo actual</span>
              <strong>${money(d.saldo_actual)}</strong>
              <small>Original: ${money(d.monto_original)}</small>
            </div>

            <div class="debt-card-meta">
              <span>
                ${Number(d.numero_cuotas_pendientes || 0)}
                cuotas pendientes
              </span>
              <span>
                Próximo: ${esc(d.proximo_vencimiento || '—')}
              </span>
            </div>

            <div class="form-actions">
              <button onclick="window.verDeuda23(${d.id})">Ver detalle</button>
              <button onclick="window.editarDeuda23(${d.id})">Editar</button>
              <button class="danger" onclick="window.eliminarDeuda23(${d.id})">
                Eliminar
              </button>
            </div>
          </article>
        `).join('')
      : `<p class="muted">No hay deudas registradas.</p>`;
  }

  /* ============================================================
     B231 — MODALIDAD
     ============================================================ */

  function setDebtModality(mode) {
    const m = $('deudaModalidad');
    const cw = $('deudaCuotasWrap');
    const qw = $('deudaCuotaWrap');
    const n = $('deudaCuotas');
    const q = $('deudaCuota');

    if (!m) return;

    const unico = mode === 'UNICO';

    m.value = unico ? 'UNICO' : 'CUOTAS';

    if (cw) cw.style.display = unico ? 'none' : '';
    if (qw) qw.style.display = unico ? 'none' : '';

    if (n) {
      n.disabled = unico;
      n.required = !unico;

      if (unico) n.value = '';
      /* IMPORTANTE: no se crea automáticamente una cuota "1". */
    }

    if (q) {
      q.disabled = unico;
      q.required = !unico;

      if (unico) q.value = '';
    }

    const help = $('deudaModalidadHelp');

    if (help) {
      help.textContent = unico
        ? 'Pago único: no existe un acuerdo vigente de cuotas. Puede tener fecha de vencimiento o quedar sin fecha; no se generará plan de cuotas.'
        : 'Cuotas: existe un acuerdo de pago en cuotas. Se generará el plan usando número, monto, frecuencia y primera cuota.';
    }
  }

  /* ============================================================
     CORRECCIÓN CRÍTICA B231.5
     ============================================================
     El código anterior tenía:

       return
         m && ...

     JavaScript aplicaba ASI y devolvía undefined.

     Resultado:
       modalidad = undefined
       numero_cuotas = null
       createPlan() recibía null
       "El plan requiere un número de cuotas..."

     Se devuelve ahora en la MISMA expresión.
     ============================================================ */

  function currentDebtModality() {
    const m = $('deudaModalidad');
    return (
      m && m.value === 'CUOTAS'
        ? 'CUOTAS'
        : 'UNICO'
    );
  }

  /* ============================================================
     B231.1 — FECHA OPCIONAL
     ============================================================ */

  function syncDebtDateState() {
    const check = $('b2312-sin-fecha');
    const date = $('deudaPrimeraCuota');

    if (!check || !date) return;

    const cuotas =
      currentDebtModality() === 'CUOTAS';

    check.disabled = !cuotas;

    if (!cuotas) {
      check.checked = false;
      date.disabled = false;
      date.required = false;
      return;
    }

    date.disabled = check.checked;
    date.required = !check.checked;

    if (check.checked) {
      date.value = '';
    }
  }

  /* ============================================================
     CARGA / EDICIÓN
     ============================================================ */

  function fillDebt(d) {
    $('deudaId').value = d.id;
    $('deudaTipo').value = d.tipo_acreedor || 'Otro';
    $('deudaAcreedor').value = d.acreedor || '';
    $('deudaConcepto').value = d.concepto || '';
    $('deudaMonto').value = d.monto_original || 0;
    $('deudaSaldo').value = d.saldo_actual || 0;
    $('deudaTasa').value = d.tasa_anual || 0;

    /* La existencia de un número de cuotas válido determina CUOTAS. */
    const numeroCuotas = Number(d.numero_cuotas || 0);
    const modalidad = numeroCuotas > 0 ? 'CUOTAS' : 'UNICO';

    $('deudaModalidad').value = modalidad;
    $('deudaCuotas').value =
      modalidad === 'CUOTAS' ? numeroCuotas : '';

    $('deudaCuota').value =
      modalidad === 'CUOTAS'
        ? (d.cuota_acordada || d.cuota || 0)
        : '';

    $('deudaInicio').value = d.fecha_inicio || today();

    const fechaGuardada =
      d.fecha_primera_cuota ||
      d.fecha_proximo_pago ||
      '';

    $('deudaPrimeraCuota').value =
      fechaGuardada;

    $('deudaFrecuencia').value =
      d.frecuencia || 'mensual';

    $('deudaNotas').value = d.notas || '';

    setDebtModality(modalidad);

    const sinFecha = $('b2312-sin-fecha');

    if (sinFecha) {
      sinFecha.checked = !fechaGuardada;
      syncDebtDateState();
    }

    $('deudaSubmit').textContent = 'Guardar cambios';
    $('deudaCancel').classList.remove('hidden');

    tab('deudas');

    scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  window.editarDeuda23 = id => {
    const d = debts.find(
      x => Number(x.id) === Number(id)
    );

    if (d) fillDebt(d);
  };

  function resetDebt() {
    $('deudaForm').reset();
    $('deudaId').value = '';

    $('deudaModalidad').value = 'UNICO';
    setDebtModality('UNICO');

    $('deudaSubmit').textContent = 'Registrar deuda';
    $('deudaCancel').classList.add('hidden');

    $('deudaInicio').value = today();
    $('deudaPrimeraCuota').value = today();

    const sinFecha = $('b2312-sin-fecha');

    if (sinFecha) {
      sinFecha.checked = false;
    }

    syncDebtDateState();
  }

  /* ============================================================
     PLAN — VERSIÓN
     ============================================================ */

  async function nextPlanVersion(c, debtId) {
    const r = await c
      .from('renegociaciones_deuda')
      .select('version')
      .eq('deuda_id', debtId);

    if (r.error) throw r.error;

    return (
      (
        r.data || []
      ).reduce(
        (m, p) =>
          Math.max(
            m,
            Number(p.version || 0)
          ),
        0
      ) || 0
    ) + 1;
  }

  /* ============================================================
     PLAN — CREACIÓN + VERIFICACIÓN
     ============================================================ */

  async function createPlan(c, debtId, p, version) {
    const n = Number(p.numero_cuotas);
    const payment = Number(p.cuota_acordada);

    if (!Number.isInteger(n) || n < 1) {
      throw new Error(
        'El plan requiere un número de cuotas entero mayor o igual a 1.'
      );
    }

    if (!Number.isFinite(payment) || payment <= 0) {
      throw new Error(
        'El plan requiere una cuota acordada mayor que $0.'
      );
    }

    if (!p.fecha_primera_cuota) {
      throw new Error(
        'El plan requiere una fecha de primera cuota.'
      );
    }

    const balanceInicial = Number(p.saldo_actual);

    if (
      !Number.isFinite(balanceInicial) ||
      balanceInicial < 0
    ) {
      throw new Error(
        'El saldo actual no es válido para construir el plan.'
      );
    }

    if (!version || Number(version) < 1) {
      version = await nextPlanVersion(c, debtId);
    }

    /* Insertar primero el plan. */
    const pr = await c
      .from('renegociaciones_deuda')
      .insert({
        deuda_id: debtId,
        version,
        saldo_inicial: balanceInicial,
        pie: 0,
        saldo_financiado: balanceInicial,
        tasa_anual: p.tasa_anual,
        numero_cuotas: n,
        cuota_acordada: payment,
        fecha_primera_cuota: p.fecha_primera_cuota,
        frecuencia: p.frecuencia,
        estado: 'activo'
      })
      .select('id')
      .single();

    if (pr.error) throw pr.error;

    const planId = pr.data.id;
    const rows = [];

    let balance = balanceInicial;

    const annualRate = Number(p.tasa_anual || 0);
    const rate =
      annualRate > 0
        ? annualRate / 100 / 12
        : 0;

    let date = new Date(
      p.fecha_primera_cuota + 'T12:00:00'
    );

    if (Number.isNaN(date.getTime())) {
      throw new Error(
        'La fecha de primera cuota no es válida.'
      );
    }

    for (let i = 1; i <= n; i++) {
      let interest =
        rate > 0
          ? balance * rate
          : 0;

      let capital =
        payment - interest;

      if (capital <= 0 && balance > 0) {
        throw new Error(
          `La cuota ${money(payment)} no alcanza para cubrir los intereses calculados de la deuda.`
        );
      }

      if (i === n || capital > balance) {
        capital = balance;
      }

      let amount = capital + interest;

      if (rate === 0) {
        amount =
          i === n
            ? balance
            : payment;

        capital = amount;
        interest = 0;
      }

      capital = Math.max(0, capital);
      interest = Math.max(0, interest);
      amount = capital + interest;

      balance = Math.max(
        0,
        balance - capital
      );

      rows.push({
        deuda_id: debtId,
        plan_id: planId,
        numero_cuota: i,
        fecha_vencimiento: date.toISOString().slice(0, 10),
        monto: Math.round(amount),
        capital: Math.round(capital),
        interes: Math.round(interest),
        otros_cargos: 0,
        saldo_proyectado: Math.round(balance),
        estado: 'pendiente'
      });

      if (p.frecuencia === 'semanal') {
        date.setDate(date.getDate() + 7);
      } else if (p.frecuencia === 'quincenal') {
        date.setDate(date.getDate() + 15);
      } else {
        date.setMonth(date.getMonth() + 1);
      }
    }

    if (rows.length !== n) {
      throw new Error(
        `Error interno: se construyeron ${rows.length} cuotas para un plan de ${n}.`
      );
    }

    /* Insertar exactamente las cuotas construidas. */
    const qr = await c
      .from('cuotas_deuda')
      .insert(rows);

    if (qr.error) throw qr.error;

    /* Verificación posterior contra Supabase. */
    const verify = await c
      .from('cuotas_deuda')
      .select('id', { count: 'exact', head: true })
      .eq('plan_id', planId);

    if (verify.error) throw verify.error;

    const quotaCount = Number(verify.count || 0);

    if (quotaCount !== n) {
      throw new Error(
        `Integridad del plan: se esperaban ${n} cuotas y Supabase confirmó ${quotaCount}.`
      );
    }

    /* Solo después de verificar el nuevo plan,
       se desactivan planes anteriores. */
    const old = await c
      .from('renegociaciones_deuda')
      .update({ estado: 'inactivo' })
      .eq('deuda_id', debtId)
      .eq('estado', 'activo')
      .neq('id', planId);

    if (old.error) {
      console.error(
        'FIN23: no se pudieron desactivar planes anteriores:',
        old.error
      );
    }

    return {
      planId,
      quotaCount
    };
  }

  /* ============================================================
     GUARDADO DE DEUDA — B231.5
     ============================================================ */

  async function saveDebt(e) {
    e.preventDefault();

    const c = await db();

    if (!c) {
      $('deudasMsg').textContent =
        'No fue posible conectar con Supabase.';
      return;
    }

    const id = $('deudaId').value;

    /* AQUÍ se corrige el flujo: ahora devuelve CUOTAS correctamente. */
    const modalidad = currentDebtModality();

    const sinFecha = !!$('b2312-sin-fecha')?.checked;

    const fechaPrimera =
      sinFecha
        ? null
        : ($('deudaPrimeraCuota').value || null);

    const cuotas =
      modalidad === 'CUOTAS'
        ? Number($('deudaCuotas').value || 0)
        : null;

    const cuota =
      modalidad === 'CUOTAS'
        ? Number($('deudaCuota').value || 0)
        : null;

    const frecuencia =
      modalidad === 'UNICO'
        ? 'unico'
        : ($('deudaFrecuencia').value || 'mensual');

    const montoOriginal =
      Number($('deudaMonto').value || 0);

    const saldoActual =
      Number($('deudaSaldo').value || 0);

    if (
      !Number.isFinite(montoOriginal) ||
      montoOriginal < 0
    ) {
      $('deudasMsg').textContent =
        'El monto original no es válido.';
      return;
    }

    if (
      !Number.isFinite(saldoActual) ||
      saldoActual < 0
    ) {
      $('deudasMsg').textContent =
        'El saldo actual no es válido.';
      return;
    }

    if (!$('deudaAcreedor').value.trim()) {
      $('deudasMsg').textContent =
        'Debes indicar el acreedor.';
      return;
    }

    if (modalidad === 'CUOTAS') {
      if (
        !Number.isInteger(cuotas) ||
        cuotas < 1
      ) {
        $('deudasMsg').textContent =
          'Para una deuda en cuotas, el número de cuotas debe ser un entero mayor o igual a 1.';
        return;
      }

      if (
        !Number.isFinite(cuota) ||
        cuota <= 0
      ) {
        $('deudasMsg').textContent =
          'Para una deuda en cuotas, la cuota acordada debe ser mayor que $0.';
        return;
      }

      /* B231.1: una deuda en cuotas puede existir sin fecha.
         En ese caso se persiste la deuda, pero NO se genera
         todavía un calendario de cuotas. */
    }

    const p = {
      tipo_acreedor: $('deudaTipo').value,
      acreedor: $('deudaAcreedor').value.trim(),
      concepto: $('deudaConcepto').value.trim() || null,
      monto_original: montoOriginal,
      saldo_actual: saldoActual,
      tasa_anual:
        Number($('deudaTasa').value || 0) || null,

      /*
       * CRÍTICO:
       * CUOTAS => N real del formulario
       * UNICO  => null
       */
      numero_cuotas: cuotas,
      cuota_acordada: cuota,

      fecha_inicio:
        $('deudaInicio').value || null,

      fecha_primera_cuota: fechaPrimera,
      frecuencia,
      fecha_proximo_pago: fechaPrimera,

      notas:
        $('deudaNotas').value.trim() || null,

      estado: 'vigente'
    };

    /* ==========================================================
       EDICIÓN
       ========================================================== */

    if (id) {
      const r = await c
        .from('deudas')
        .update(p)
        .eq('id', id);

      if (r.error) {
        $('deudasMsg').textContent =
          'No se pudo actualizar la deuda: ' +
          r.error.message;
        return;
      }

      /* Verificación real del registro persistido. */
      const persisted = await c
        .from('deudas')
        .select(
          'id,numero_cuotas,cuota_acordada,frecuencia,fecha_primera_cuota,fecha_proximo_pago'
        )
        .eq('id', id)
        .single();

      if (persisted.error) {
        $('deudasMsg').textContent =
          'La deuda se actualizó, pero no se pudo verificar la persistencia: ' +
          persisted.error.message;

        await loadDebts();
        return;
      }

      const saved = persisted.data;

      if (modalidad === 'CUOTAS') {
        if (
          Number(saved.numero_cuotas || 0) !== cuotas ||
          Number(saved.cuota_acordada || 0) !== cuota
        ) {
          $('deudasMsg').textContent =
            `ERROR DE PERSISTENCIA: se enviaron ${cuotas} cuotas y ${money(cuota)}, pero Supabase confirmó ${Number(saved.numero_cuotas || 0)} cuotas y ${money(saved.cuota_acordada || 0)}.`;

          await loadDebts();
          return;
        }
      }

      if (modalidad === 'UNICO') {
        $('deudasMsg').textContent =
          'Deuda actualizada correctamente como pago único.';

        resetDebt();
        await loadDebts();
        return;
      }

      /* CUOTAS: si ya existe plan activo, se conserva. */
      const activePlan = await c
        .from('renegociaciones_deuda')
        .select('id,version,numero_cuotas,estado')
        .eq('deuda_id', id)
        .eq('estado', 'activo');

      if (activePlan.error) {
        $('deudasMsg').textContent =
          'La deuda fue actualizada, pero no se pudo verificar el plan: ' +
          activePlan.error.message;

        await loadDebts();
        return;
      }

      if ((activePlan.data || []).length > 0) {
        $('deudasMsg').textContent =
          'Deuda actualizada correctamente. El plan vigente se conserva.';

        resetDebt();
        await loadDebts();
        return;
      }

      /* Si no existe plan ni cuotas históricas, crear el primero. */
      const historical = await c
        .from('cuotas_deuda')
        .select('id', { count: 'exact', head: true })
        .eq('deuda_id', id);

      if (historical.error) {
        $('deudasMsg').textContent =
          'La deuda fue actualizada, pero no se pudo verificar el historial de cuotas: ' +
          historical.error.message;

        await loadDebts();
        return;
      }

      if (
        Number(historical.count || 0) === 0 &&
        saldoActual > 0
      ) {
        try {
          const result = await createPlan(
            c,
            id,
            p,
            await nextPlanVersion(c, id)
          );

          if (result.quotaCount !== cuotas) {
            throw new Error(
              `Integridad inválida: se esperaban ${cuotas} cuotas y Supabase confirmó ${result.quotaCount}.`
            );
          }
        } catch (x) {
          $('deudasMsg').textContent =
            'La deuda fue actualizada, pero el plan no pudo generarse: ' +
            x.message;

          await loadDebts();
          return;
        }
      }

      $('deudasMsg').textContent =
        'Deuda actualizada correctamente.';

      resetDebt();
      await loadDebts();
      return;
    }

    /* ==========================================================
       NUEVA DEUDA
       ========================================================== */

    const ins = await c
      .from('deudas')
      .insert(p)
      .select(
        'id,numero_cuotas,cuota_acordada,frecuencia,fecha_primera_cuota'
      )
      .single();

    if (ins.error) {
      $('deudasMsg').textContent =
        'No se pudo registrar la deuda: ' +
        ins.error.message;
      return;
    }

    const debtId = ins.data.id;

    /* Verificación crítica del INSERT. */
    if (modalidad === 'CUOTAS') {
      const persisted = ins.data;

      if (
        Number(persisted.numero_cuotas || 0) !== cuotas ||
        Number(persisted.cuota_acordada || 0) !== cuota
      ) {
        await c
          .from('deudas')
          .delete()
          .eq('id', debtId);

        $('deudasMsg').textContent =
          `ERROR DE PERSISTENCIA: se enviaron ${cuotas} cuotas y ${money(cuota)}, pero Supabase confirmó ${Number(persisted.numero_cuotas || 0)} cuotas y ${money(persisted.cuota_acordada || 0)}. La deuda no fue conservada.`;

        await loadDebts();
        return;
      }
    }

    /* PAGO ÚNICO: nunca crea plan. */
    if (modalidad === 'UNICO') {
      $('deudasMsg').textContent =
        'Deuda de pago único registrada correctamente.';

      resetDebt();
      await loadDebts();
      return;
    }

    /* B231.1: CUOTAS sin fecha se conservan como deuda
       pendiente, sin generar todavía cuotas calendarizadas. */
    if (modalidad === 'CUOTAS' && !fechaPrimera) {
      /* Verificación específica B231.1: la deuda debe quedar sin fecha
         tanto en fecha_primera_cuota como en fecha_proximo_pago. */
      const undatedCheck = await c
        .from('deudas')
        .select('id,numero_cuotas,cuota_acordada,fecha_primera_cuota,fecha_proximo_pago')
        .eq('id', debtId)
        .single();

      if (undatedCheck.error) {
        await c.from('deudas').delete().eq('id', debtId);
        $('deudasMsg').textContent =
          'La deuda se registró, pero no se pudo verificar la persistencia B231.1: ' +
          undatedCheck.error.message;
        await loadDebts();
        return;
      }

      const savedUndated = undatedCheck.data;

      if (
        Number(savedUndated.numero_cuotas || 0) !== cuotas ||
        Number(savedUndated.cuota_acordada || 0) !== cuota ||
        savedUndated.fecha_primera_cuota !== null ||
        savedUndated.fecha_proximo_pago !== null
      ) {
        await c.from('deudas').delete().eq('id', debtId);
        $('deudasMsg').textContent =
          'ERROR DE PERSISTENCIA B231.1: la deuda sin fecha no quedó almacenada con los valores esperados.';
        await loadDebts();
        return;
      }

      $('deudasMsg').textContent =
        `Deuda registrada correctamente con ${cuotas} cuotas acordadas, sin fecha de pago.`;

      resetDebt();
      await loadDebts();
      return;
    }

    /* CUOTAS con fecha: crear y verificar exactamente N cuotas. */
    try {
      const result = await createPlan(
        c,
        debtId,
        p,
        1
      );

      if (result.quotaCount !== cuotas) {
        throw new Error(
          `Integridad inválida: se esperaban ${cuotas} cuotas y Supabase confirmó ${result.quotaCount}.`
        );
      }
    } catch (x) {
      /* Compensación del registro incompleto. */
      await c
        .from('cuotas_deuda')
        .delete()
        .eq('deuda_id', debtId);

      await c
        .from('renegociaciones_deuda')
        .delete()
        .eq('deuda_id', debtId);

      await c
        .from('deudas')
        .delete()
        .eq('id', debtId);

      $('deudasMsg').textContent =
        'No se registró la deuda porque el plan de cuotas falló: ' +
        x.message;

      await loadDebts();
      return;
    }

    $('deudasMsg').textContent =
      `Deuda registrada correctamente con ${cuotas} cuotas.`;

    resetDebt();
    await loadDebts();
  }

  /* ============================================================
     RECONSTRUIR PLAN
     ============================================================ */

  window.reconstruirPlan23 = async () => {
    if (!selected) return;

    const c = await db();
    if (!c) return;

    const d = selected;

    const numeroCuotas =
      Number(d.numero_cuotas || 0);

    const cuotaAcordada =
      Number(
        d.cuota_acordada ||
        d.cuota ||
        0
      );

    const fechaPrimera =
      d.fecha_primera_cuota ||
      d.fecha_proximo_pago;

    if (
      numeroCuotas < 1 ||
      !fechaPrimera ||
      cuotaAcordada <= 0
    ) {
      return alert(
        'Completa número de cuotas, cuota acordada y primera cuota en Editar deuda antes de reconstruir el plan.'
      );
    }

    const next =
      await nextPlanVersion(c, d.id);

    const p = {
      saldo_actual: d.saldo_actual,
      tasa_anual: d.tasa_anual,
      numero_cuotas: numeroCuotas,
      cuota_acordada: cuotaAcordada,
      fecha_primera_cuota: fechaPrimera,
      frecuencia:
        d.frecuencia === 'unico'
          ? 'mensual'
          : (d.frecuencia || 'mensual')
    };

    try {
      const result =
        await createPlan(
          c,
          d.id,
          p,
          next
        );

      if (
        result.quotaCount !==
        numeroCuotas
      ) {
        throw new Error(
          `Integridad inválida: se esperaban ${numeroCuotas} cuotas y se generaron ${result.quotaCount}.`
        );
      }

      await window.verDeuda23(d.id);
      await loadDebts();

    } catch (e) {
      alert(
        'No se pudo reconstruir el plan: ' +
        e.message
      );
    }
  };

  /* ============================================================
     ELIMINAR DEUDA
     ============================================================ */

  window.eliminarDeuda23 = async id => {
    if (
      !confirm(
        '¿Eliminar esta deuda y sus planes/cuotas?'
      )
    ) return;

    const c = await db();
    if (!c) return;

    const r = await c
      .from('deudas')
      .delete()
      .eq('id', id);

    if (r.error)
      return alert(r.error.message);

    selected = null;

    await loadDebts();

    $('deudaDetalle').innerHTML = `
      <p class="muted">Deuda eliminada.</p>
    `;
  };

  /* ============================================================
     VER DETALLE
     ============================================================ */

  window.verDeuda23 = async id => {
    const d = debts.find(
      x => Number(x.id) === Number(id)
    );

    if (!d) return;

    selected = d;

    const c = await db();
    if (!c) return;

    const [pr, qr] = await Promise.all([
      c
        .from('renegociaciones_deuda')
        .select('*')
        .eq('deuda_id', id)
        .order('version', { ascending: false }),

      c
        .from('cuotas_deuda')
        .select('*')
        .eq('deuda_id', id)
        .order('fecha_vencimiento', { ascending: true })
    ]);

    if (pr.error || qr.error) {
      return alert(
        (pr.error || qr.error).message
      );
    }

    plans = pr.data || [];
    quotas = qr.data || [];

    const modalidad =
      Number(d.numero_cuotas || 0) > 0
        ? 'CUOTAS'
        : 'UNICO';

    const plan =
      modalidad === 'CUOTAS'
        ? (
            plans.find(
              p => p.estado === 'activo'
            ) ||
            plans[0]
          )
        : null;

    const displayedQuotas =
      plan
        ? quotas.filter(
            q =>
              Number(q.plan_id) ===
              Number(plan.id)
          )
        : [];

    $('deudaDetalle').innerHTML = `
      <div class="section-title">
        <div>
          <span class="muted">Detalle de deuda</span>
          <h2>${esc(d.acreedor)}</h2>
          <p>${esc(d.concepto || '')}</p>
        </div>

        <button
          class="secondary"
          onclick="
            document.getElementById('deudaDetalle').innerHTML =
            '<p class=&quot;muted&quot;>Selecciona una deuda para reconstruir o revisar su plan.</p>'
          "
        >
          Cerrar
        </button>
      </div>

      <div class="cards two">
        <article class="metric">
          <span>Saldo actual</span>
          <strong>${money(d.saldo_actual)}</strong>
        </article>

        <article class="metric">
          <span>Deuda original</span>
          <strong>${money(d.monto_original)}</strong>
        </article>

        <article class="metric">
          <span>Modalidad</span>
          <strong>
            ${modalidad === 'UNICO' ? 'Pago único' : 'Cuotas'}
          </strong>
        </article>

        <article class="metric">
          <span>Cuotas pendientes</span>
          <strong>
            ${Number(d.numero_cuotas_pendientes || 0)}
          </strong>
        </article>

        <article class="metric">
          <span>Próximo vencimiento</span>
          <strong>
            ${esc(d.proximo_vencimiento || '—')}
          </strong>
        </article>
      </div>

      <div class="detail-actions">
        <button onclick="window.editarDeuda23(${d.id})">
          Editar deuda
        </button>

        ${
          modalidad === 'CUOTAS'
            ? `
              <button onclick="window.reconstruirPlan23()">
                ${plan ? 'Reconstruir plan' : 'Crear plan de pago'}
              </button>
            `
            : ''
        }

        <button
          class="danger"
          onclick="window.eliminarDeuda23(${d.id})"
        >
          Eliminar deuda
        </button>
      </div>

      ${
        modalidad === 'UNICO'
          ? `
            <h3>Pago único</h3>
            <p class="muted">
              Esta deuda no posee un acuerdo vigente de cuotas.
              Puede mantenerse pendiente hasta que se registre un pago
              o se establezca posteriormente un nuevo acuerdo.
            </p>
          `
          : `
            <h3>Plan de pago</h3>

            ${
              plan
                ? `
                  <div class="debt-plan">
                    <span>Versión ${plan.version}</span>
                    <span>${Number(plan.numero_cuotas)} cuotas</span>
                    <span>Cuota ${money(plan.cuota_acordada)}</span>
                    <span>Primera ${esc(plan.fecha_primera_cuota)}</span>
                    <span>${esc(plan.frecuencia)}</span>
                  </div>
                `
                : `
                  <p class="muted">
                    No existe todavía un plan de cuotas.
                  </p>
                `
            }

            <h3>Calendario de cuotas</h3>

            <div class="debt-quota-list">
              ${
                displayedQuotas.length
                  ? displayedQuotas.map(q => `
                    <div class="quota-row">
                      <div>
                        <strong>
                          Cuota ${q.numero_cuota}
                        </strong>
                        <span>
                          ${esc(q.fecha_vencimiento)}
                        </span>
                      </div>

                      <div>
                        <strong>
                          ${money(q.monto)}
                        </strong>
                        <span>
                          ${esc(q.estado)}
                        </span>
                      </div>

                      ${
                        ['pendiente', 'vencida'].includes(q.estado)
                          ? `
                            <button
                              onclick="window.pagarCuota23(${q.id})"
                            >
                              Registrar pago
                            </button>
                          `
                          : ''
                      }
                    </div>
                  `).join('')
                  : `
                    <p class="muted">
                      No hay cuotas generadas.
                    </p>
                  `
              }
            </div>
          `
      }
    `;
  };

  /* ============================================================
     PAGO DE CUOTA
     ============================================================ */

  window.pagarCuota23 = async qid => {
    const q = quotas.find(
      x => Number(x.id) === Number(qid)
    );

    if (!q || !selected) return;

    const c = await db();
    if (!c) return;

    const amount =
      Number(
        prompt(
          `Monto pagado para la cuota ${q.numero_cuota}:`,
          q.monto
        )
      );

    if (!Number.isFinite(amount) || amount <= 0)
      return;

    const date =
      prompt(
        'Fecha real de pago (AAAA-MM-DD):',
        today()
      );

    if (!date) return;

    const m = await c
      .from('movimientos')
      .insert({
        tipo: 'gasto',
        fecha: date,
        monto: amount,
        categoria: 'Deuda',
        descripcion:
          `${selected.acreedor} — cuota ${q.numero_cuota}`
      })
      .select('id')
      .single();

    if (m.error)
      return alert(m.error.message);

    const p = await c
      .from('pagos_deuda')
      .insert({
        cuota_id: qid,
        fecha_pago: date,
        monto: amount,
        movimiento_id: m.data.id
      });

    if (p.error) {
      await c
        .from('movimientos')
        .delete()
        .eq('id', m.data.id);

      return alert(p.error.message);
    }

    const u = await c
      .from('cuotas_deuda')
      .update({
        estado: 'pagada',
        fecha_pago: date
      })
      .eq('id', qid);

    if (u.error) {
      return alert(
        'El pago fue registrado, pero no se pudo actualizar el estado de la cuota: ' +
        u.error.message
      );
    }

    await window.verDeuda23(selected.id);
    await loadDebts();
  };

  /* ============================================================
     FORMULARIO DE DEUDAS
     ============================================================ */

  function setupDebtForm() {
    if (!$('deudaForm')) return;

    $('deudaCancel').onclick = resetDebt;

    /* B231.1-R1: sincronizar el estado antes de registrar el
       controlador. Evita que el HTML5 required conserve un estado
       antiguo al cambiar entre CUOTAS/UNICO/SIN_FECHA. */
    syncDebtDateState();

    $('deudaForm').onsubmit = saveDebt;

    const modalidad = $('deudaModalidad');

    modalidad?.addEventListener(
      'change',
      () => {
        setDebtModality(modalidad.value);
        syncDebtDateState();
      }
    );

    const sinFecha = $('b2312-sin-fecha');

    sinFecha?.addEventListener(
      'change',
      syncDebtDateState
    );

    const r = $('deudaTasa');
    const a = $('deudaMonto');
    const n = $('deudaCuotas');
    const q = $('deudaCuota');

    const est = () => {
      if (currentDebtModality() !== 'CUOTAS')
        return;

      const P = Number(a.value);
      const N = Number(n.value);
      const annual = Number(r.value);

      if (!(P > 0 && N > 0))
        return;

      const rr = annual / 100 / 12;

      q.value =
        annual > 0
          ? Math.round(
              P *
              rr *
              Math.pow(1 + rr, N) /
              (
                Math.pow(1 + rr, N) - 1
              )
            )
          : Math.round(P / N);
    };

    [r, a, n].forEach(
      x =>
        x?.addEventListener('input', est)
    );

    setDebtModality('UNICO');
    syncDebtDateState();
  }

  /* ============================================================
     INICIALIZACIÓN
     ============================================================ */

  async function start() {
    try {
      injectTabs();
      injectSections();

      setupAccountForm();
      setupDebtForm();

      await loadAccounts();
      await loadDebts();
      await renderLiquidity();

      const old = window.refresh;

      if (
        old &&
        !old.__fin23wrapped
      ) {
        const wrapped =
          async function (...args) {
            const r =
              await old.apply(
                this,
                args
              );

            try {
              await loadAccounts();
              await loadDebts();
              await renderLiquidity();
            } catch (e) {
              console.error(
                'FIN23 refresh:',
                e
              );
            }

            return r;
          };

        wrapped.__fin23wrapped = true;
        window.refresh = wrapped;
      }

      console.info(
        'FINANZAS V2.3.3 B231.1 cargado.'
      );

    } catch (e) {
      console.error(
        'FINANZAS V2.3.3: error de inicialización:',
        e
      );

      const msg =
        $('deudasMsg');

      if (msg) {
        msg.textContent =
          'Error de inicialización: ' +
          e.message;
      }
    }
  }

  if (
    document.readyState === 'loading'
  ) {
    document.addEventListener(
      'DOMContentLoaded',
      start,
      { once: true }
    );
  } else {
    start();
  }

})();
