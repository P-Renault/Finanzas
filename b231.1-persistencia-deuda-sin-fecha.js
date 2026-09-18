
/* ============================================================
   B231.1 — PERSISTENCIA DEUDA SIN FECHA
   Control Financiero · Incremento incremental
   ============================================================ */

(function () {
  'use strict';

  const VERSION = '231.1';

  if (window.B2311DeudasPersistencia) {
    console.info('[B231.1] Ya estaba cargado.');
    return;
  }

  const V2 = window.B231DeudasV2;

  if (!V2) {
    console.error(
      '[B231.1] No se encontró window.B231DeudasV2. ' +
      'Cargue B231.0 antes de B231.1.'
    );
    return;
  }

  /*
   * Convierte una fecha vacía en NULL.
   * No se utiliza ninguna fecha ficticia.
   */
  function toNullableDate(value) {
    if (value === undefined || value === null || value === '') {
      return null;
    }

    const date = String(value).trim();

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new Error(
        '[B231.1] fecha_vencimiento inválida. ' +
        'Use YYYY-MM-DD o null.'
      );
    }

    return date;
  }

  /*
   * Construye el cambio mínimo que deberá persistirse.
   *
   * B231.1 NO ejecuta todavía el UPDATE.
   * Solo prepara el contrato.
   */
  function buildPersistencePatch(raw) {
    const result = V2.validate(raw);

    if (!result.ok) {
      throw new Error(
        '[B231.1] Deuda inválida: ' +
        result.errors.join(' ')
      );
    }

    const d = result.debt;

    return {
      id: d.id,
      fecha_vencimiento:
        toNullableDate(d.fecha_vencimiento)
    };
  }

  /*
   * Clasificación temporal.
   */
  function classify(raw) {
    const d = V2.normalize(raw);

    if (!d) {
      return {
        valid: false,
        temporalidad: 'INVALIDA'
      };
    }

    return {
      valid: true,

      temporalidad:
        d.fecha_vencimiento === null
          ? 'SIN_FECHA'
          : 'FECHADA',

      fecha_vencimiento:
        d.fecha_vencimiento
    };
  }

  /*
   * Una deuda sin fecha NO pertenece a ningún día.
   */
  function belongsToCalendarDay(raw, isoDate) {
    const d = V2.normalize(raw);

    if (!d || !d.fecha_vencimiento || !isoDate) {
      return false;
    }

    return d.fecha_vencimiento === String(isoDate);
  }

  /*
   * Una deuda sin fecha SÍ pertenece al universo
   * general de obligaciones pendientes.
   */
  function belongsToObligations(raw) {
    const d = V2.normalize(raw);

    return !!d &&
      d.estado !== V2.states.PAGADA &&
      d.saldo_pendiente > 0;
  }

  /*
   * Separa las deudas fechadas de las que no tienen fecha.
   * Esto permitirá que Calendario no las mezcle.
   */
  function splitTemporalities(debts) {
    const list = Array.isArray(debts)
      ? debts
          .map(V2.normalize)
          .filter(Boolean)
      : [];

    return {
      dated: list.filter(
        d => d.fecha_vencimiento !== null
      ),

      undated: list.filter(
        d => d.fecha_vencimiento === null
      )
    };
  }

  /*
   * Punto único de conexión con la persistencia existente.
   *
   * B231.1 no inventa:
   * - cliente Supabase
   * - tabla
   * - RPC
   * - mecanismo de actualización
   *
   * La aplicación existente podrá registrar su propio
   * método mediante configure().
   */
  let persistence = null;

  function configure(options) {
    if (
      !options ||
      typeof options.updateDebt !== 'function'
    ) {
      throw new Error(
        '[B231.1] configure requiere ' +
        'updateDebt como función.'
      );
    }

    persistence = options.updateDebt;

    console.info(
      '[B231.1] Persistencia configurada.'
    );
  }

  /*
   * Persiste solamente cuando el mecanismo existente
   * haya sido conectado explícitamente.
   */
  async function persistDate(raw, date) {
    if (!persistence) {
      throw new Error(
        '[B231.1] Persistencia no configurada. ' +
        'No se realizará ninguna escritura.'
      );
    }

    const debt = V2.prepareAssignDate
      ? V2.prepareAssignDate(
          raw,
          toNullableDate(date)
        )
      : V2.normalize({
          ...raw,
          fecha_vencimiento:
            toNullableDate(date)
        });

    const patch =
      buildPersistencePatch(debt);

    return persistence(patch);
  }

  /*
   * Prepara una nueva deuda.
   *
   * Si no se entrega fecha:
   *
   * fecha_vencimiento = NULL
   */
  function prepareInsert(raw) {
    const data = {
      ...(raw || {}),
      fecha_vencimiento:
        toNullableDate(
          raw?.fecha_vencimiento
        )
    };

    const d = V2.normalize(data);

    const result = V2.validate(d);

    if (!result.ok) {
      throw new Error(
        '[B231.1] No se puede preparar la deuda: ' +
        result.errors.join(' ')
      );
    }

    return result.debt;
  }

  /*
   * Contrato público.
   */
  const api = {
    version: VERSION,

    toNullableDate,

    normalize:
      V2.normalize,

    validate:
      V2.validate,

    buildPersistencePatch,

    prepareInsert,

    classify,

    belongsToCalendarDay,

    belongsToObligations,

    splitTemporalities,

    configure,

    persistDate,

    rules: Object.freeze({

      nullMeansUndated: true,

      undatedDebtIsObligation: true,

      undatedDebtHasNoCalendarDay: true,

      datedDebtCanEnterCalendar: true,

      noSyntheticDate: true,

      noAutomaticWriteOnLoad: true
    })
  };

  window.B2311DeudasPersistencia =
    Object.freeze(api);

  console.info(
    '[B231.1] Persistencia contractual preparada.',
    'NULL = SIN_FECHA.'
  );

})();
