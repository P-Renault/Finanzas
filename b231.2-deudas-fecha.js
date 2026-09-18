
/* ============================================================
   B231.2 — ASIGNACIÓN / EDICIÓN DE FECHA DE DEUDA
   Control Financiero · Deudas V2

   OBJETIVO
   Permitir:
     1. Crear una deuda SIN FECHA.
     2. Asignar posteriormente una fecha.
     3. Quitar una fecha y volver a SIN_FECHA.

   COMPATIBILIDAD
   - No crea tablas.
   - No crea cliente Supabase.
   - No reemplaza el módulo Deudas.
   - No elimina botones existentes.
   - No modifica saldos.
   - No genera movimientos financieros.
   - Utiliza el contrato B231.0/B231.1.

   NOTA
   El módulo detecta el formulario existente por sus etiquetas
   visibles, por lo que no depende de inventar IDs de elementos.
   ============================================================ */

(function () {
  'use strict';

  const VERSION = '231.2';

  if (window.B2312DeudasFecha) {
    console.info('[B231.2] Ya estaba cargado.');
    return;
  }

  const V2 = window.B231DeudasV2;
  const PERSIST = window.B2311DeudasPersistencia;

  if (!V2) {
    console.error(
      '[B231.2] Falta B231.0. ' +
      'Cargue b231.0-adaptador-deudas-v2.js antes de B231.2.'
    );
    return;
  }

  /*
   ------------------------------------------------------------
   UTILIDADES DOM
   ------------------------------------------------------------
  */

  function cleanText(value) {
    return String(value || '')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
  }

  function findLabelElement(text) {
    const wanted = cleanText(text);

    const labels = Array.from(
      document.querySelectorAll('label')
    );

    return labels.find(label =>
      cleanText(label.textContent).includes(wanted)
    ) || null;
  }

  function findAssociatedControl(label) {
    if (!label) return null;

    if (label.htmlFor) {
      const byFor =
        document.getElementById(label.htmlFor);

      if (byFor) return byFor;
    }

    const nested =
      label.querySelector(
        'input, select, textarea'
      );

    if (nested) return nested;

    const parent = label.parentElement;

    if (parent) {
      const control =
        parent.querySelector(
          'input, select, textarea'
        );

      if (control) return control;
    }

    return null;
  }

  function findControlByNearbyText(text) {
    const label =
      findLabelElement(text);

    return findAssociatedControl(label);
  }

  /*
   ------------------------------------------------------------
   FECHA ACTUAL DEL FORMULARIO
   ------------------------------------------------------------
   La pantalla estable utiliza "Primera cuota".
   B231.2 la convierte conceptualmente en:
     - fecha real
     - o SIN FECHA
   ------------------------------------------------------------
  */

  let firstPaymentControl = null;
  let undatedControl = null;
  let statusElement = null;

  function findFirstPaymentControl() {
    return (
      findControlByNearbyText('primera cuota') ||
      findControlByNearbyText('fecha vencimiento') ||
      findControlByNearbyText('vencimiento')
    );
  }

  /*
   ------------------------------------------------------------
   CREACIÓN DE CONTROLES
   ------------------------------------------------------------
  */

  function createUndatedControl() {
    if (document.getElementById('b2312-sin-fecha')) {
      return document.getElementById(
        'b2312-sin-fecha'
      );
    }

    const reference =
      firstPaymentControl;

    if (!reference || !reference.parentElement) {
      return null;
    }

    const wrapper =
      document.createElement('div');

    wrapper.id =
      'b2312-fecha-wrapper';

    wrapper.style.cssText = [
      'margin-top:6px',
      'padding:8px 10px',
      'border:1px solid rgba(128,128,128,.25)',
      'border-radius:8px',
      'background:rgba(128,128,128,.04)'
    ].join(';');

    const label =
      document.createElement('label');

    label.style.cssText =
      'display:flex;align-items:center;gap:8px;cursor:pointer;font-size:12px;';

    const checkbox =
      document.createElement('input');

    checkbox.type =
      'checkbox';

    checkbox.id =
      'b2312-sin-fecha';

    checkbox.name =
      'b2312_sin_fecha';

    checkbox.addEventListener(
      'change',
      applyDateMode
    );

    const text =
      document.createElement('span');

    text.textContent =
      'Deuda sin fecha de vencimiento';

    label.appendChild(
      checkbox
    );

    label.appendChild(
      text
    );

    wrapper.appendChild(
      label
    );

    reference.parentElement.appendChild(
      wrapper
    );

    return checkbox;
  }

  function createStatus() {
    if (
      document.getElementById(
        'b2312-fecha-status'
      )
    ) {
      return document.getElementById(
        'b2312-fecha-status'
      );
    }

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

    if (!root) return null;

    const el =
      document.createElement(
        'div'
      );

    el.id =
      'b2312-fecha-status';

    el.style.cssText = [
      'display:block',
      'margin:6px 0',
      'padding:6px 9px',
      'border-radius:7px',
      'font-size:11px',
      'opacity:.78'
    ].join(';');

    el.textContent =
      'B231.2 · Gestión de fecha preparada';

    root.prepend(el);

    return el;
  }

  /*
   ------------------------------------------------------------
   MODO SIN FECHA
   ------------------------------------------------------------
  */

  function applyDateMode() {
    if (
      !firstPaymentControl ||
      !undatedControl
    ) {
      return;
    }

    if (
      undatedControl.checked
    ) {

      /*
       * No destruimos el valor original.
       * Lo almacenamos para poder restaurarlo.
       */

      if (
        !firstPaymentControl.dataset.b2312PreviousValue
      ) {
        firstPaymentControl.dataset.b2312PreviousValue =
          firstPaymentControl.value || '';
      }

      firstPaymentControl.value =
        '';

      firstPaymentControl.disabled =
        true;

      firstPaymentControl.setAttribute(
        'data-b2312',
        'sin-fecha'
      );

      if (statusElement) {
        statusElement.textContent =
          'B231.2 · SIN FECHA · no se asignará ningún día al calendario';
      }

    } else {

      firstPaymentControl.disabled =
        false;

      firstPaymentControl.removeAttribute(
        'data-b2312'
      );

      const previous =
        firstPaymentControl.dataset
          .b2312PreviousValue;

      if (
        previous &&
        !firstPaymentControl.value
      ) {
        firstPaymentControl.value =
          previous;
      }

      if (statusElement) {
        statusElement.textContent =
          'B231.2 · Fecha de vencimiento activa';
      }
    }
  }

  /*
   ------------------------------------------------------------
   API PARA EDICIÓN
   ------------------------------------------------------------
  */

  function prepareAssignDate(
    debt,
    date
  ) {
    if (
      !V2.prepareAssignDate
    ) {
      throw new Error(
        '[B231.2] B231.0 no expone prepareAssignDate.'
      );
    }

    return V2.prepareAssignDate(
      debt,
      date === '' ? null : date
    );
  }

  /*
   ------------------------------------------------------------
   CLASIFICACIÓN
   ------------------------------------------------------------
  */

  function classifyDebt(
    debt
  ) {
    const normalized =
      V2.normalize(debt);

    if (!normalized) {
      return {
        ok: false,
        temporalidad: 'INVALIDA'
      };
    }

    return {
      ok: true,

      temporalidad:
        normalized.fecha_vencimiento === null
          ? 'SIN_FECHA'
          : 'FECHADA',

      fecha_vencimiento:
        normalized.fecha_vencimiento
    };
  }

  /*
   ------------------------------------------------------------
   PERSISTENCIA EXPLÍCITA
   ------------------------------------------------------------
   B231.2 solo llama al mecanismo de persistencia cuando
   este haya sido configurado por B231.1.

   Nunca se ejecuta automáticamente al cargar la página.
   */

  async function saveDate(
    debt,
    date
  ) {
    if (
      !PERSIST ||
      typeof PERSIST.persistDate !==
        'function'
    ) {
      throw new Error(
        '[B231.2] B231.1 no está disponible.'
      );
    }

    return PERSIST.persistDate(
      debt,
      date === '' ? null : date
    );
  }

  /*
   ------------------------------------------------------------
   INICIALIZACIÓN DOM
   ------------------------------------------------------------
  */

  function initialize() {
    firstPaymentControl =
      findFirstPaymentControl();

    if (!firstPaymentControl) {
      console.warn(
        '[B231.2] No se encontró el control "Primera cuota". ' +
        'La API queda disponible, pero no se modifica el formulario.'
      );
      return;
    }

    undatedControl =
      createUndatedControl();

    statusElement =
      createStatus();

    applyDateMode();

    console.info(
      '[B231.2] Formulario Deudas preparado.',
      'Control fecha:',
      firstPaymentControl
    );
  }

  /*
   ------------------------------------------------------------
   API PÚBLICA
   ------------------------------------------------------------
  */

  const api = {

    version:
      VERSION,

    prepareAssignDate,

    classifyDebt,

    saveDate,

    initialize,

    rules: Object.freeze({

      emptyDateMeansNull: true,

      nullMeansUndated: true,

      undatedDebtNotCalendarized: true,

      assigningDateDoesNotChangeBalance: true,

      assigningDateDoesNotCreateMovement: true,

      removingDateReturnsToUndated: true,

      noSyntheticDate: true,

      noAutomaticPersistenceOnLoad: true
    })
  };

  window.B2312DeudasFecha =
    Object.freeze(api);

  /*
   * Esperamos a que la interfaz estable termine de montar
   * el módulo Deudas.
   */

  if (
    document.readyState ===
    'loading'
  ) {

    document.addEventListener(
      'DOMContentLoaded',
      initialize,
      { once: true }
    );

  } else {

    setTimeout(
      initialize,
      0
    );

  }

  console.info(
    '[B231.2] Asignación/edición de fecha preparada.'
  );

})();
