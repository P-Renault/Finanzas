/* FINANZAS V2.3.3 — Cero Financiero + Liquidez + Cuentas + edición/reconstrucción de deudas */
(() => {
  const $=id=>document.getElementById(id);

  const money=n=>
    new Intl.NumberFormat('es-CL',{
      style:'currency',
      currency:'CLP',
      maximumFractionDigits:0
    }).format(Number(n)||0);

  const today=()=>{
    const d=new Date();
    return new Date(
      d.getTime()-d.getTimezoneOffset()*60000
    ).toISOString().slice(0,10)
  };

  const esc=v=>
    String(v??'').replace(
      /[&<>"']/g,
      c=>({
        '&':'&amp;',
        '<':'&lt;',
        '>':'&gt;',
        '"':'&quot;',
        "'":'&#039;'
      }[c])
    );

  let client=null,
      accounts=[],
      debts=[],
      selected=null,
      plans=[],
      quotas=[];

  async function db(){
    if(client)return client;

    const u=localStorage.getItem('sf_url');
    const k=localStorage.getItem('sf_key');

    if(!u||!k||!window.supabase)return null;

    client=window.supabase.createClient(u,k);

    return client
  }

  function tab(id){
    document
      .querySelectorAll('.tabs button')
      .forEach(b=>
        b.classList.toggle(
          'active',
          b.dataset.tab===id
        )
      );

    document
      .querySelectorAll('.tab')
      .forEach(s=>
        s.classList.add('hidden')
      );

    $(id)?.classList.remove('hidden')
  }

  function injectTabs(){
    const t=document.querySelector('.tabs');
    if(!t)return;

    [
      ['deudas','Deudas'],
      ['cuentas','Cuentas']
    ].forEach(([id,label])=>{
      if(!t.querySelector(`[data-tab="${id}"]`)){
        const b=document.createElement('button');

        b.type='button';
        b.dataset.tab=id;
        b.textContent=label;
        b.onclick=()=>tab(id);

        t.appendChild(b)
      }
    })
  }

  function injectSections(){
    const app=$('app');
    if(!app)return;

    if(!$('cuentas')){
      const s=document.createElement('section');

      s.id='cuentas';
      s.className='tab hidden';

      s.innerHTML=`
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
              <input
                id="cuentaBanco"
                required
                placeholder="Banco de Chile">
            </label>

            <label>
              Nombre de cuenta
              <input
                id="cuentaNombre"
                required
                placeholder="Cuenta corriente">
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
              <input
                id="cuentaIdentificador"
                placeholder="****1234">
            </label>

            <label>
              Saldo de apertura
              <input
                id="cuentaApertura"
                type="number"
                min="0"
                step="1"
                value="0">
            </label>

            <label>
              Fecha de corte
              <input
                id="cuentaFecha"
                type="date"
                value="${today()}">
            </label>

            <label class="full">
              Notas
              <input
                id="cuentaNotas"
                placeholder="Propósito, uso, observaciones">
            </label>

            <div class="form-actions full">
              <button id="cuentaSubmit">
                Registrar cuenta
              </button>

              <button
                type="button"
                id="cuentaCancel"
                class="secondary hidden">
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

      app.appendChild(s)
    }

    if(!$('deudas')){
      const s=document.createElement('section');

      s.id='deudas';
      s.className='tab hidden';

      s.innerHTML=`
        <div class="card">

          <div class="section-title">
            <div>
              <span class="muted">
                Reconstrucción patrimonial
              </span>

              <h2>Deudas</h2>
            </div>

            <span class="muted">
              Deuda → plan → cuotas → pago real
            </span>
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
              <input
                id="deudaConcepto"
                placeholder="Crédito, deuda personal...">
            </label>

            <label>
              Monto original
              <input
                id="deudaMonto"
                type="number"
                min="0"
                step="1"
                required>
            </label>

            <label>
              Saldo actual
              <input
                id="deudaSaldo"
                type="number"
                min="0"
                step="1"
                required>
            </label>

            <label>
              Tasa anual %
              <input
                id="deudaTasa"
                type="number"
                min="0"
                step="0.01"
                value="0">
            </label>

            <!-- NUEVO MODELO: MODALIDAD DE PAGO -->

            <label>
              Modalidad de pago

              <select id="deudaModalidad">

                <option value="UNICO">
                  Pago único — sin plan de cuotas
                </option>

                <option value="CUOTAS">
                  Cuotas — existe acuerdo de pago en cuotas
                </option>

              </select>
            </label>

            <label id="deudaCuotasWrap">
              Número de cuotas

              <input
                id="deudaCuotas"
                type="number"
                min="1"
                step="1">
            </label>

            <label id="deudaCuotaWrap">
              Cuota acordada

              <input
                id="deudaCuota"
                type="number"
                min="0"
                step="1">
            </label>

            <div
              id="deudaModalidadHelp"
              class="full muted"
              style="margin-top:-6px">

              Pago único: no existe un acuerdo vigente
              de cuotas. La deuda puede mantenerse pendiente,
              vencida o sin fecha, sin generar cuotas.

            </div>

            <label>
              Fecha de inicio

              <input
                id="deudaInicio"
                type="date"
                value="${today()}">
            </label>

            <label>
              Primera cuota

              <input
                id="deudaPrimeraCuota"
                type="date"
                value="${today()}">
            </label>

            <label>
              Frecuencia

              <select id="deudaFrecuencia">

                <option value="mensual">
                  Mensual
                </option>

                <option value="semanal">
                  Semanal
                </option>

                <option value="quincenal">
                  Quincenal
                </option>

                <option value="unico">
                  Única
                </option>

              </select>
            </label>

            <label class="full">
              Notas

              <input
                id="deudaNotas"
                placeholder="Acuerdo, contexto, prioridad...">
            </label>

            <div class="form-actions full">

              <button id="deudaSubmit">
                Registrar deuda
              </button>

              <button
                type="button"
                id="deudaCancel"
                class="secondary hidden">
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
            Selecciona una deuda para reconstruir
            o revisar su plan.
          </p>

        </div>
      `;

      app.appendChild(s)
    }
  }

  async function loadAccounts(){

    const c=await db();

    if(!c||!$('cuentasLista'))return;

    const r=
      await c
        .from('cuentas_bancarias')
        .select('*')
        .order('activa',{ascending:false})
        .order('nombre_banco');

    if(r.error){
      $('cuentaMsg').textContent=r.error.message;
      return
    }

    accounts=r.data||[];

    renderAccounts()
  }

  function renderAccounts(){

    const active=
      accounts.filter(
        a=>a.activa!==false
      );

    const total=
      active.reduce(
        (s,a)=>
          s+
          Number(
            a.saldo_actual??
            a.saldo_apertura??
            0
          ),
        0
      );

    if($('liquidezCuentasTotal'))
      $('liquidezCuentasTotal').textContent=
        money(total);

    $('cuentasLista').innerHTML=
      accounts.length
        ?
          accounts.map(a=>`
            <article class="account-row">

              <div>
                <span class="muted">
                  ${esc(a.tipo_cuenta||'Cuenta')}
                </span>

                <h3>
                  ${esc(a.nombre_banco)}
                </h3>

                <p>
                  ${esc(a.nombre_cuenta)}
                  ${
                    a.identificador
                      ?
                        ` · ${esc(a.identificador)}`
                      :''
                  }
                </p>
              </div>

              <div>

                <strong>
                  ${money(a.saldo_actual)}
                </strong>

                <small>
                  Apertura
                  ${money(a.saldo_apertura)}
                </small>

              </div>

              <div class="form-actions">

                <button
                  onclick="window.editarCuenta23(${a.id})">
                  Editar
                </button>

                <button
                  class="danger"
                  onclick="window.eliminarCuenta23(${a.id})">
                  Eliminar
                </button>

              </div>

            </article>
          `).join('')
        :
          `
            <p class="muted">
              No hay cuentas registradas.
              Puedes registrar todas las que tengas,
              incluso con saldo $0.
            </p>
          `
  }

  function resetAccount(){

    const f=$('cuentaForm');

    if(f)f.reset();

    $('cuentaId').value='';

    $('cuentaFecha').value=today();

    $('cuentaSubmit').textContent=
      'Registrar cuenta';

    $('cuentaCancel').classList.add('hidden')
  }

  window.editarCuenta23=id=>{

    const a=
      accounts.find(
        x=>Number(x.id)===Number(id)
      );

    if(!a)return;

    $('cuentaId').value=a.id;

    $('cuentaBanco').value=
      a.nombre_banco||'';

    $('cuentaNombre').value=
      a.nombre_cuenta||'';

    $('cuentaTipo').value=
      a.tipo_cuenta||'Otro';

    $('cuentaIdentificador').value=
      a.identificador||'';

    $('cuentaApertura').value=
      a.saldo_apertura||0;

    $('cuentaFecha').value=
      a.fecha_corte||today();

    $('cuentaNotas').value=
      a.notas||'';

    $('cuentaSubmit').textContent=
      'Guardar cambios';

    $('cuentaCancel')
      .classList
      .remove('hidden');

    tab('cuentas');

    scrollTo({
      top:0,
      behavior:'smooth'
    })
  };

  window.eliminarCuenta23=async id=>{

    if(
      !confirm(
        '¿Eliminar esta cuenta del catálogo?'
      )
    )return;

    const c=await db();

    const r=
      await c
        .from('cuentas_bancarias')
        .delete()
        .eq('id',id);

    if(r.error)
      return alert(r.error.message);

    await loadAccounts();
    await renderLiquidity()
  };

  function setupAccountForm(){

    $('cuentaCancel').onclick=
      resetAccount;

    $('cuentaForm').onsubmit=
      async e=>{

        e.preventDefault();

        const c=await db();

        if(!c)return;

        const id=$('cuentaId').value;

        const p={

          nombre_banco:
            $('cuentaBanco').value.trim(),

          nombre_cuenta:
            $('cuentaNombre').value.trim(),

          tipo_cuenta:
            $('cuentaTipo').value,

          identificador:
            $('cuentaIdentificador')
              .value
              .trim()||null,

          saldo_apertura:
            Number(
              $('cuentaApertura')
                .value||0
            ),

          saldo_actual:
            Number(
              $('cuentaApertura')
                .value||0
            ),

          fecha_corte:
            $('cuentaFecha').value,

          notas:
            $('cuentaNotas')
              .value
              .trim()||null,

          activa:true
        };

        const r=
          id
            ?
              await c
                .from('cuentas_bancarias')
                .update(p)
                .eq('id',id)
            :
              await c
                .from('cuentas_bancarias')
                .insert(p);

        if(r.error)
          return $('cuentaMsg')
            .textContent=
              r.error.message;

        $('cuentaMsg').textContent=
          id
            ?
              'Cuenta actualizada.'
            :
              'Cuenta registrada.';

        resetAccount();

        await loadAccounts();
        await renderLiquidity()
      }
  }

  async function renderLiquidity(){

    const d=$('dashboard');

    if(!d)return;

    let box=$('fin23Liquidity');

    if(!box){

      box=document.createElement('div');

      box.id='fin23Liquidity';

      box.className=
        'card liquidity-card';

      const a=d.querySelector('.cards');

      if(a)
        a.insertAdjacentElement(
          'beforebegin',
          box
        );
      else
        d.prepend(box)
    }

    const c=await db();

    if(!c)return;

    const cr=
      await c
        .from('cierres_financieros')
        .select('*')
        .eq('activo',true)
        .order(
          'fecha_corte',
          {ascending:false}
        )
        .limit(1)
        .maybeSingle();

    if(cr.error)return;

    const ac=
      await c
        .from('cuentas_bancarias')
        .select('*')
        .eq('activa',true);

    const opening=
      Number(
        cr.data?.saldo_inicial||0
      );

    const accountTotal=
      (ac.data||[])
        .reduce(
          (s,a)=>
            s+
            Number(
              a.saldo_actual||0
            ),
          0
        );

    const cash=
      Math.max(
        0,
        opening-accountTotal
      );

    box.innerHTML=`

      <div class="section-title">

        <div>

          <span class="muted">
            CERO FINANCIERO ·
            ${esc(
              cr.data?.fecha_corte||
              '2026-09-17'
            )}
          </span>

          <h2>
            Liquidez inicial
          </h2>

        </div>

        <button
          class="secondary"
          onclick="window.fin23GoAccounts()">
          Gestionar cuentas
        </button>

      </div>

      <div class="liquidity-total">

        <span>
          Saldo de apertura
        </span>

        <strong>
          ${money(opening)}
        </strong>

      </div>

      <div class="liquidity-breakdown">

        <article>

          <span>
            Efectivo / caja
          </span>

          <strong>
            ${money(cash)}
          </strong>

        </article>

        <article>

          <span>
            Cuentas bancarias registradas
          </span>

          <strong>
            ${money(accountTotal)}
          </strong>

        </article>

      </div>

      <p class="muted">
        La apertura corresponde al Cero Financiero.
        Las cuentas se administran en su propio
        catálogo y se agregan a la liquidez controlada.
      </p>
    `
  }

  window.fin23GoAccounts=
    ()=>tab('cuentas');

  async function loadDebts(){

    const c=await db();

    if(!c||!$('deudasLista'))return;

    const r=
      await c
        .from('v_deudas_resumen')
        .select('*')
        .order('acreedor');

    if(r.error){

      $('deudasMsg').textContent=
        r.error.message;

      return
    }

    debts=r.data||[];

    renderDebtList();

    await renderDebtSummary()
  }

  async function renderDebtSummary(){

    const a=
      debts.filter(
        d=>
          ![
            'pagada',
            'cancelada'
          ].includes(d.estado)
      );

    $('deudaOriginalTotal').textContent=
      money(
        a.reduce(
          (s,d)=>
            s+
            Number(
              d.monto_original||0
            ),
          0
        )
      );

    $('deudaSaldoTotal').textContent=
      money(
        a.reduce(
          (s,d)=>
            s+
            Number(
              d.saldo_actual||0
            ),
          0
        )
      );

    $('deudaCuotasTotal').textContent=
      String(
        a.reduce(
          (s,d)=>
            s+
            Number(
              d.numero_cuotas_pendientes||0
            ),
          0
        )
      );

    const c=await db();

    if(!c)return;

    const t=today();

    const e=
      new Date(
        t+'T12:00:00'
      );

    e.setDate(
      e.getDate()+30
    );

    const r=
      await c
        .from('cuotas_deuda')
        .select('monto')
        .in(
          'estado',
          [
            'pendiente',
            'vencida'
          ]
        )
        .gte(
          'fecha_vencimiento',
          t
        )
        .lte(
          'fecha_vencimiento',
          e.toISOString().slice(0,10)
        );

    $('deuda30Total').textContent=
      money(
        (r.data||[])
          .reduce(
            (s,q)=>
              s+
              Number(
                q.monto||0
              ),
            0
          )
      )
  }

  function renderDebtList(){

    $('deudasLista').innerHTML=
      debts.length
        ?
          debts.map(d=>`

            <article class="debt-card">

              <div class="debt-card-main">

                <span class="debt-type">
                  ${esc(
                    d.tipo_acreedor||
                    'Sin clasificar'
                  )}
                </span>

                <h3>
                  ${esc(d.acreedor)}
                </h3>

                <p>
                  ${esc(d.concepto||'')}
                </p>

              </div>

              <div class="debt-card-values">

                <span>
                  Saldo actual
                </span>

                <strong>
                  ${money(d.saldo_actual)}
                </strong>

                <small>
                  Original:
                  ${money(d.monto_original)}
                </small>

              </div>

              <div class="debt-card-meta">

                <span>
                  ${Number(
                    d.numero_cuotas_pendientes||0
                  )}
                  cuotas pendientes
                </span>

                <span>
                  Próximo:
                  ${esc(
                    d.proximo_vencimiento||'—'
                  )}
                </span>

              </div>

              <div class="form-actions">

                <button
                  onclick="window.verDeuda23(${d.id})">
                  Ver detalle
                </button>

                <button
                  onclick="window.editarDeuda23(${d.id})">
                  Editar
                </button>

                <button
                  class="danger"
                  onclick="window.eliminarDeuda23(${d.id})">
                  Eliminar
                </button>

              </div>

            </article>

          `).join('')
        :
          `
            <p class="muted">
              No hay deudas registradas.
            </p>
          `
  }

  /*
   * ============================================================
   * B231 — MODELO CORRECTO DE MODALIDAD DE PAGO
   * ============================================================
   *
   * Regla:
   *
   * UNA DEUDA NO TIENE CUOTAS POR EL SOLO HECHO
   * DE TENER UN SALDO.
   *
   * CUOTAS solamente existe cuando hay un acuerdo
   * de pago formal en cuotas.
   *
   * UNICO:
   *   numero_cuotas = NULL
   *   cuota_acordada = NULL
   *   no genera plan
   *
   * CUOTAS:
   *   numero_cuotas > 0
   *   cuota_acordada > 0
   *   puede generar plan
   * ============================================================
   */

  function setDebtModality(mode){

    const m=$('deudaModalidad');

    const cw=$('deudaCuotasWrap');

    const qw=$('deudaCuotaWrap');

    const n=$('deudaCuotas');

    const q=$('deudaCuota');

    if(!m)return;

    const unico=
      mode==='UNICO';

    m.value=
      unico
        ?
          'UNICO'
        :
          'CUOTAS';

    if(cw)
      cw.style.display=
        unico
          ?
            'none'
          :
            '';

    if(qw)
      qw.style.display=
        unico
          ?
            'none'
          :
            '';

    if(n){

      n.disabled=unico;

      n.required=!unico;

      if(unico){

        /*
         * CRÍTICO:
         * No dejar 1 como valor residual.
         */
        n.value='';

      }else if(!n.value){

        n.value='1'
      }
    }

    if(q){

      q.disabled=unico;

      q.required=!unico;

      if(unico){

        /*
         * CRÍTICO:
         * Una deuda UNICO no posee
         * cuota acordada.
         */
        q.value=''
      }
    }

    const help=
      $('deudaModalidadHelp');

    if(help){

      help.textContent=
        unico
          ?
            'Pago único: no existe un acuerdo vigente de cuotas. Puede tener fecha de vencimiento o quedar sin fecha; no se generará plan de cuotas.'
          :
            'Cuotas: existe un acuerdo de pago en cuotas. Se generará el plan usando número, monto, frecuencia y primera cuota.'
    }
  }

  function currentDebtModality(){

    const m=
      $('deudaModalidad');

    return
      m&&m.value==='UNICO'
        ?
          'UNICO'
        :
          'CUOTAS'
  }

  function fillDebt(d){

    $('deudaId').value=d.id;

    $('deudaTipo').value=
      d.tipo_acreedor||
      'Otro';

    $('deudaAcreedor').value=
      d.acreedor||'';

    $('deudaConcepto').value=
      d.concepto||'';

    $('deudaMonto').value=
      d.monto_original||0;

    $('deudaSaldo').value=
      d.saldo_actual||0;

    $('deudaTasa').value=
      d.tasa_anual||0;

    /*
     * Una deuda existente se considera UNICO
     * cuando:
     *
     * - frecuencia = unico
     * - o no posee numero de cuotas
     *
     * De esta forma no volvemos a inventar
     * una cuota = 1 al editar.
     */

    const modalidad=
      String(
        d.frecuencia||''
      ).toLowerCase()==='unico' ||
      Number(
        d.numero_cuotas||0
      )<=0
        ?
          'UNICO'
        :
          'CUOTAS';

    $('deudaModalidad').value=
      modalidad;

    $('deudaCuotas').value=
      modalidad==='UNICO'
        ?
          ''
        :
          (
            d.numero_cuotas||
            1
          );

    $('deudaCuota').value=
      modalidad==='UNICO'
        ?
          ''
        :
          (
            d.cuota_acordada||
            d.cuota||
            0
          );

    $('deudaInicio').value=
      d.fecha_inicio||
      today();

    $('deudaPrimeraCuota').value=
      d.fecha_primera_cuota||
      d.fecha_proximo_pago||
      today();

    $('deudaFrecuencia').value=
      d.frecuencia||
      'mensual';

    $('deudaNotas').value=
      d.notas||'';

    setDebtModality(
      modalidad
    );

    $('deudaSubmit').textContent=
      'Guardar cambios';

    $('deudaCancel')
      .classList
      .remove('hidden');

    tab('deudas');

    scrollTo({
      top:0,
      behavior:'smooth'
    })
  }

  window.editarDeuda23=id=>{

    const d=
      debts.find(
        x=>Number(x.id)===Number(id)
      );

    if(d)
      fillDebt(d)
  };

  function resetDebt(){

    $('deudaForm').reset();

    $('deudaId').value='';

    /*
     * Una deuda nueva comienza
     * explícitamente como PAGO ÚNICO.
     *
     * Si el usuario quiere cuotas,
     * debe seleccionarlas.
     */
    $('deudaModalidad').value=
      'UNICO';

    set
