/* ============================================================
   B231.0 — ADAPTADOR DEUDAS V2
   Control Financiero

   Objetivo:
   Introducir el contrato Deudas V2 sin reemplazar
   la implementación estable existente.

   PRINCIPIOS:
   - No crea tablas.
   - No cambia Supabase.
   - No reemplaza el módulo Deudas actual.
   - No modifica registros existentes.
   - Mantiene compatibilidad con la arquitectura publicada.
   - Deja preparado el contrato para B231.1–B231.5.
   ============================================================ */

(function () {
  'use strict';

  if (window.B231DeudasV2) {
    console.info('[B231.0] Adaptador ya inicializado.');
    return;
  }

  const VERSION = '231.0';

  const STATES = Object.freeze({
    PENDIENTE: 'PENDIENTE',
    ABONO_PARCIAL: 'ABONO PARCIAL',
    PAGADA: 'PAGADA'
  });

  /*
   ------------------------------------------------------------
   NORMALIZACIÓN
   ------------------------------------------------------------
   Convierte diferentes representaciones utilizadas por el
   sistema actual en el modelo lógico Deudas V2.
   
   fecha_vencimiento puede ser NULL:
   NULL = SIN FECHA
   ------------------------------------------------------------
  */

  function normalizeDebt(raw) {
    if (!raw || typeof raw !== 'object') {
      return null;
    }

    const original = Number(
      raw.monto_original ??
      raw.monto ??
      raw.total ??
      0
    );

    const pending = Number(
      raw.saldo_pendiente ??
      raw.saldo ??
      raw.monto_pendiente ??
      original
    );

    let state = String(
      raw.estado ?? ''
    ).trim().toUpperCase();

    /*
     Si el registro no posee estado explícito,
     se determina a partir del saldo.
    */

    if (!state) {
      if (pending <= 0) {
        state = STATES.PAGADA;
      } else if (pending < original) {
        state = STATES.ABONO_PARCIAL;
      } else {
        state = STATES.PENDIENTE;
      }
    }

    return {
      id:
        raw.id ??
        null,

      acreedor:
        raw.acreedor ??
        raw.nombre ??
        raw.concepto ??
        '',

      concepto:
        raw.concepto ??
        raw.nombre ??
        '',

      monto_original:
        original,

      saldo_pendiente:
        Math.max(
          0,
          pending
        ),

      /*
       * IMPORTANTE:
       * null representa explícitamente
       * una deuda sin fecha.
       */
      fecha_vencimiento:
        raw.fecha_vencimiento ??
        raw.fecha_vencimiento_pago ??
        raw.fecha_pago ??
        null,

      estado:
        state,

      prioridad:
        raw.prioridad ??
        null,

      tipo:
        raw.tipo ??
        null,

      cuotas:
        raw.cuotas ??
        null,

      monto_cuota:
        raw.monto_cuota ??
        null,

      descripcion:
        raw.descripcion ??
        '',

      created_at:
        raw.created_at ??
        null,

      updated_at:
        raw.updated_at ??
        null,

      /*
       * Marca interna para identificar
       * objetos normalizados por B231.
       */
      _b231:
        true
    };
  }

  /*
   ------------------------------------------------------------
   SIN FECHA
   ------------------------------------------------------------
  */

  function isUndated(debt) {
    return !debt ||
      !debt.fecha_vencimiento;
  }

  /*
   ------------------------------------------------------------
   SALDO PENDIENTE
   ------------------------------------------------------------
  */

  function remaining(debt) {
    return Math.max(
      0,
      Number(
        debt?.saldo_pendiente ??
        debt?.monto_original ??
        0
      )
    );
  }

  /*
   ------------------------------------------------------------
   VALIDACIÓN
   ------------------------------------------------------------
  */

  function validateDebtV2(raw) {
    const d =
      normalizeDebt(raw);

    const errors = [];

    if (!d) {
      errors.push(
        'Registro de deuda inválido.'
      );
    } else {

      if (
        !d.acreedor &&
        !d.concepto
      ) {
        errors.push(
          'Falta acreedor o concepto.'
        );
      }

      if (
        !Number.isFinite(
          d.monto_original
        ) ||
        d.monto_original < 0
      ) {
        errors.push(
          'monto_original inválido.'
        );
      }

      if (
        !Number.isFinite(
          d.saldo_pendiente
        ) ||
        d.saldo_pendiente < 0
      ) {
        errors.push(
          'saldo_pendiente inválido.'
        );
      }

      if (
        d.saldo_pendiente >
        d.monto_original
      ) {
        errors.push(
          'El saldo pendiente no puede superar el monto original.'
        );
      }

      /*
       * NULL es válido.
       * Si existe fecha debe utilizar YYYY-MM-DD.
       */

      if (
        d.fecha_vencimiento !== null
      ) {

        const validDate =
          /^\d{4}-\d{2}-\d{2}$/.test(
            String(
              d.fecha_vencimiento
            )
          );

        if (!validDate) {
          errors.push(
            'fecha_vencimiento debe ser YYYY-MM-DD o null.'
          );
        }
      }

      /*
       * Una deuda PAGADA debe tener saldo 0.
       */

      if (
        d.estado === STATES.PAGADA &&
        d.saldo_pendiente !== 0
      ) {
        errors.push(
          'Una deuda PAGADA debe tener saldo pendiente 0.'
        );
      }
    }

    return {
      ok:
        errors.length === 0,

      errors,

      debt:
        d
    };
  }

  /*
   ------------------------------------------------------------
   PREPARAR ASIGNACIÓN DE FECHA
   ------------------------------------------------------------
   No persiste.
   Solo prepara el nuevo objeto.
   ------------------------------------------------------------
  */

  function assignDate(
    raw,
    date
  ) {
    const d =
      normalizeDebt(raw);

    if (!d) {
      throw new Error(
        'Deuda inválida.'
      );
    }

    /*
     * Vacío / null:
     * vuelve a representar SIN FECHA.
     */

    if (
      date === null ||
      date === '' ||
      date === undefined
    ) {

      d.fecha_vencimiento =
        null;

    } else {

      if (
        !/^\d{4}-\d{2}-\d{2}$/.test(
          String(date)
        )
      ) {
        throw new Error(
          'Fecha inválida. Use YYYY-MM-DD.'
        );
      }

      d.fecha_vencimiento =
        String(date);
    }

    return d;
  }

  /*
   ------------------------------------------------------------
   PREPARAR ABONO PARCIAL
   ------------------------------------------------------------
   No persiste.
   No crea movimientos.
   
   La creación del movimiento financiero y la actualización
   definitiva de la deuda se realizarán en B231.3.
   ------------------------------------------------------------
  */

  function registerPartialPayment(
    raw,
    amount
  ) {

    const d =
      normalizeDebt(raw);

    const value =
      Number(amount);

    if (!d) {
      throw new Error(
        'Deuda inválida.'
      );
    }

    if (
      !Number.isFinite(value) ||
      value <= 0
    ) {
      throw new Error(
        'El abono debe ser mayor que cero.'
      );
    }

    if (
      value >
      d.saldo_pendiente
    ) {
      throw new Error(
        'El abono no puede superar el saldo pendiente.'
      );
    }

    d.saldo_pendiente =
      Math.max(
        0,
        d.saldo_pendiente - value
      );

    d.estado =
      d.saldo_pendiente === 0
        ? STATES.PAGADA
        : STATES.ABONO_PARCIAL;

    return d;
  }

  /*
   ------------------------------------------------------------
   RESUMEN
   ------------------------------------------------------------
  */

  function summarize(
    debts
  ) {

    const list =
      Array.isArray(debts)
        ? debts
            .map(normalizeDebt)
            .filter(Boolean)
        : [];

    const undated =
      list.filter(
        isUndated
      );

    const dated =
      list.filter(
        d => !isUndated(d)
      );

    return {

      total:
        list.length,

      total_original:
        list.reduce(
          (sum, d) =>
            sum +
            d.monto_original,
          0
        ),

      total_pendiente:
        list.reduce(
          (sum, d) =>
            sum +
            remaining(d),
          0
        ),

      total_sin_fecha:
        undated.reduce(
          (sum, d) =>
            sum +
            remaining(d),
          0
        ),

      cantidad_sin_fecha:
        undated.length,

      cantidad_con_fecha:
        dated.length,

      pendientes:
        list.filter(
          d =>
            d.estado !==
            STATES.PAGADA
        ),

      pagadas:
        list.filter(
          d =>
            d.estado ===
            STATES.PAGADA
        )
    };
  }

  /*
   ------------------------------------------------------------
   API PÚBLICA B231.0
   ------------------------------------------------------------
  */

  const adapter = {

    version:
      VERSION,

    states:
      STATES,

    normalize:
      normalizeDebt,

    validate:
      validateDebtV2,

    isUndated,

    remaining,

    summarize,

    prepareAssignDate:
      assignDate,

    preparePartialPayment:
      registerPartialPayment,

    /*
     ----------------------------------------------------------
     PERSISTENCIA
     ----------------------------------------------------------
     Bloqueada en B231.0.

     No se debe escribir contra Supabase hasta conectar
     explícitamente el mecanismo de persistencia existente.

     B231.1–B231.3 serán responsables de esa integración.
     ----------------------------------------------------------
    */

    async save() {

      throw new Error(
        '[B231.0] Persistencia todavía no habilitada. ' +
        'Se implementa en B231.1/B231.2/B231.3.'
      );

    },

    async delete() {

      throw new Error(
        '[B231.0] El adaptador no implementa borrado.'
      );

    }

  };

  /*
   ------------------------------------------------------------
   REGISTRO GLOBAL ÚNICO
   ------------------------------------------------------------
  */

  window.B231DeudasV2 =
    Object.freeze(
      adapter
    );

  /*
   ------------------------------------------------------------
   INDICADOR NO INTRUSIVO
   ------------------------------------------------------------
   Solo confirma que B231.0 fue cargado.
   No reconstruye la pantalla Deudas.
   ------------------------------------------------------------
  */

  function installStatus() {

    const root =
      document.querySelector(
        '#deudas'
      ) ||
      document.querySelector(
        '[data-tab="deudas"]'
      ) ||
      document.querySelector(
        '[id*="deudas"]'
      );

    if (
      !root ||
      document.getElementById(
        'b231-status'
      )
    ) {
      return;
    }

    const el =
      document.createElement(
        'div'
      );

    el.id =
      'b231-status';

    el.setAttribute(
      'data-b231',
      VERSION
    );

    el.style.cssText = [
      'display:block',
      'margin:8px 0',
      'padding:7px 10px',
      'border:1px solid rgba(128,128,128,.35)',
      'border-radius:8px',
      'font-size:12px',
      'opacity:.82'
    ].join(';');

    el.textContent =
      'Deudas V2 · adaptador B231.0 activo · compatibilidad estable';

    root.prepend(
      el
    );
  }

  /*
   ------------------------------------------------------------
   INICIALIZACIÓN SEGURA
   ------------------------------------------------------------
  */

  if (
    document.readyState ===
    'loading'
  ) {

    document.addEventListener(
      'DOMContentLoaded',
      installStatus,
      {
        once: true
      }
    );

  } else {

    installStatus();

  }

  console.info(
    '[B231.0] Adaptador Deudas V2 activo.',
    'Persistencia: pendiente de B231.1–B231.3.'
  );

})();
