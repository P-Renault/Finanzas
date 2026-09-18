/* ============================================================
   B231.3 — ABONOS PARCIALES
   Control Financiero · Deudas V2

   OBJETIVO
   ------------------------------------------------------------
   Permitir registrar un ABONO PARCIAL sobre una deuda:

       Deuda original       $460.000
              ↓
       Abono                 $100.000
              ↓
       Saldo pendiente      $360.000

   REGLAS
   ------------------------------------------------------------
   - El abono nunca puede superar el saldo.
   - El monto debe ser > 0.
   - No modifica el monto original.
   - Reduce solamente el saldo pendiente.
   - No elimina la deuda.
   - Un pago total lleva el saldo a 0.
   - No genera doble contabilización.
   - No modifica los botones existentes.
   - No reemplaza "Pagar próxima cuota".
   - No crea un segundo cliente Supabase.
   - No crea tablas nuevas.
   - No ejecuta escrituras automáticamente al cargar.

   INTEGRACIÓN
   ------------------------------------------------------------
   B231.3 expone un contrato:

       window.B2313AbonosParciales

   La persistencia definitiva debe conectarse al mecanismo
   financiero existente antes de declarar B231.3 como QA OK.

   ============================================================ */

(function () {

  'use strict';

  const VERSION = '231.3.0';

  /*
   ------------------------------------------------------------
   PROTECCIÓN CONTRA DOBLE CARGA
   ------------------------------------------------------------
  */

  if (
    window.B2313AbonosParciales &&
    window.B2313AbonosParciales.version === VERSION
  ) {

    console.info(
      '[B231.3] Ya estaba cargado.'
    );

    return;
  }

  /*
   ------------------------------------------------------------
   ESTADO
   ------------------------------------------------------------
  */

  let modal = null;

  let currentDebt = null;

  /*
   ------------------------------------------------------------
   UTILIDADES
   ------------------------------------------------------------
  */

  function cleanText(value) {

    return String(value || '')
      .replace(/\s+/g, ' ')
      .trim();

  }

  function normalizeMoney(value) {

    if (
      typeof value === 'number' &&
      Number.isFinite(value)
    ) {

      return value;

    }

    let text =
      String(value || '')
        .trim();

    /*
     * Formato chileno:
     * $460.000
     */

    text =
      text
        .replace(/\$/g, '')
        .replace(/\s/g, '')
        .replace(/\./g, '')
        .replace(/,/g, '.');

    const number =
      Number(text);

    return Number.isFinite(number)
      ? number
      : 0;

  }

  function formatMoney(value) {

    const amount =
      Math.round(
        Number(value) || 0
      );

    return '$' +
      amount.toLocaleString(
        'es-CL'
      );

  }

  /*
   ------------------------------------------------------------
   VALIDACIÓN
   ------------------------------------------------------------
  */

  function validatePartialPayment(
    debt,
    amount
  ) {

    if (!debt) {

      return {
        ok: false,
        code: 'DEUDA_REQUERIDA',
        message:
          'Debe seleccionarse una deuda.'
      };

    }

    const balance =
      normalizeMoney(
        debt.saldo_actual ??
        debt.saldo_pendiente ??
        debt.saldo ??
        0
      );

    const payment =
      normalizeMoney(
        amount
      );

    if (
      !Number.isFinite(payment) ||
      payment <= 0
    ) {

      return {
        ok: false,
        code: 'MONTO_INVALIDO',
        message:
          'El abono debe ser mayor que $0.'
      };

    }

    if (
      balance <= 0
    ) {

      return {
        ok: false,
        code: 'DEUDA_SALDADA',
        message:
          'La deuda ya no tiene saldo pendiente.'
      };

    }

    if (
      payment > balance
    ) {

      return {
        ok: false,
        code: 'ABONO_SUPERA_SALDO',
        message:
          'El abono no puede superar el saldo pendiente de ' +
          formatMoney(balance) +
          '.'
      };

    }

    const newBalance =
      balance - payment;

    return {

      ok: true,

      monto_abono:
        payment,

      saldo_anterior:
        balance,

      saldo_nuevo:
        newBalance,

      pago_total:
        newBalance === 0

    };

  }

  /*
   ------------------------------------------------------------
   PREPARAR OPERACIÓN
   ------------------------------------------------------------
  */

  function preparePartialPayment(
    debt,
    amount,
    accountId,
    description
  ) {

    const validation =
      validatePartialPayment(
        debt,
        amount
      );

    if (!validation.ok) {

      throw new Error(
        validation.message
      );

    }

    return {

      type:
        'ABONO_DEUDA',

      debt_id:
        debt.id ??
        debt.deuda_id ??
        null,

      acreedor:
        debt.acreedor ??
        debt.nombre ??
        '',

      concepto:
        debt.concepto ??
        '',

      monto_abono:
        validation.monto_abono,

      saldo_anterior:
        validation.saldo_anterior,

      saldo_nuevo:
        validation.saldo_nuevo,

      pago_total:
        validation.pago_total,

      account_id:
        accountId ??
        null,

      description:
        description ||
        'Abono a deuda',

      fecha:
        new Date()
          .toISOString()
          .slice(0, 10),

      /*
       * Marca explícita para impedir que una capa
       * posterior trate el abono como ingreso.
       */

      financial_direction:
        'OUTFLOW',

      is_transfer:
        false,

      is_income:
        false,

      is_expense:
        true,

      source:
        'B231.3'

    };

  }

  /*
   ------------------------------------------------------------
   MODAL
   ------------------------------------------------------------
  */

  function removeModal() {

    if (
      modal &&
      modal.parentNode
    ) {

      modal.parentNode.removeChild(
        modal
      );

    }

    modal =
      null;

    currentDebt =
      null;

  }

  function createModal(
    debt
  ) {

    removeModal();

    currentDebt =
      debt;

    const overlay =
      document.createElement(
        'div'
      );

    overlay.id =
      'b2313-modal';

    overlay.style.cssText = [
      'position:fixed',
      'inset:0',
      'z-index:99999',
      'display:flex',
      'align-items:center',
      'justify-content:center',
      'padding:20px',
      'box-sizing:border-box',
      'background:rgba(0,0,0,.55)'
    ].join(';');

    const card =
      document.createElement(
        'div'
      );

    card.style.cssText = [
      'width:min(430px,100%)',
      'box-sizing:border-box',
      'background:#fff',
      'border-radius:14px',
      'padding:20px',
      'box-shadow:0 20px 60px rgba(0,0,0,.25)'
    ].join(';');

    const title =
      document.createElement(
        'h3'
      );

    title.textContent =
      'Registrar abono';

    title.style.cssText = [
      'margin:0 0 8px',
      'font-size:20px',
      'color:#111827'
    ].join(';');

    const creditor =
      document.createElement(
        'div'
      );

    creditor.textContent =
      debt.acreedor ||
      debt.nombre ||
      debt.concepto ||
      'Deuda';

    creditor.style.cssText = [
      'font-weight:600',
      'margin-bottom:4px',
      'color:#111827'
    ].join(';');

    const balance =
      normalizeMoney(
        debt.saldo_actual ??
        debt.saldo_pendiente ??
        debt.saldo ??
        0
      );

    const balanceText =
      document.createElement(
        'div'
      );

    balanceText.textContent =
      'Saldo pendiente: ' +
      formatMoney(balance);

    balanceText.style.cssText = [
      'font-size:13px',
      'color:#6b7280',
      'margin-bottom:16px'
    ].join(';');

    const label =
      document.createElement(
        'label'
      );

    label.textContent =
      'Monto del abono';

    label.style.cssText = [
      'display:block',
      'font-size:13px',
      'font-weight:600',
      'margin-bottom:6px',
      'color:#111827'
    ].join(';');

    const input =
      document.createElement(
        'input'
      );

    input.type =
      'number';

    input.min =
      '1';

    input.step =
      '1';

    input.inputMode =
      'numeric';

    input.id =
      'b2313-monto';

    input.placeholder =
      'Ej.: 100000';

    input.style.cssText = [
      'display:block',
      'width:100%',
      'box-sizing:border-box',
      'padding:12px',
      'border:1px solid #d1d5db',
      'border-radius:8px',
      'font-size:16px',
      'margin-bottom:8px'
    ].join(';');

    const maxText =
      document.createElement(
        'div'
      );

    maxText.textContent =
      'Máximo permitido: ' +
      formatMoney(balance);

    maxText.style.cssText = [
      'font-size:12px',
      'color:#6b7280',
      'margin-bottom:14px'
    ].join(';');

    const description =
      document.createElement(
        'input'
      );

    description.type =
      'text';

    description.placeholder =
      'Descripción opcional';

    description.id =
      'b2313-descripcion';

    description.value =
      'Abono a deuda';

    description.style.cssText = [
      'display:block',
      'width:100%',
      'box-sizing:border-box',
      'padding:11px',
      'border:1px solid #d1d5db',
      'border-radius:8px',
      'font-size:14px',
      'margin-bottom:16px'
    ].join(';');

    const message =
      document.createElement(
        'div'
      );

    message.id =
      'b2313-message';

    message.style.cssText = [
      'display:none',
      'padding:9px',
      'margin-bottom:12px',
      'border-radius:7px',
      'font-size:12px'
    ].join(';');

    /*
     * Botones.
     */

    const actions =
      document.createElement(
        'div'
      );

    actions.style.cssText = [
      'display:flex',
      'gap:8px',
      'justify-content:flex-end'
    ].join(';');

    const cancel =
      document.createElement(
        'button'
      );

    cancel.type =
      'button';

    cancel.textContent =
      'Cancelar';

    cancel.style.cssText = [
      'padding:10px 14px',
      'border:0',
      'border-radius:8px',
      'background:#e5e7eb',
      'color:#111827',
      'font-weight:600',
      'cursor:pointer'
    ].join(';');

    const confirm =
      document.createElement(
        'button'
      );

    confirm.type =
      'button';

    confirm.textContent =
      'Preparar abono';

    confirm.style.cssText = [
      'padding:10px 14px',
      'border:0',
      'border-radius:8px',
      'background:#111827',
      'color:#fff',
      'font-weight:600',
      'cursor:pointer'
    ].join(';');

    /*
     * Cancelar.
     */

    cancel.addEventListener(
      'click',
      removeModal
    );

    /*
     * Cerrar tocando fuera.
     */

    overlay.addEventListener(
      'click',
      function (event) {

        if (
          event.target ===
          overlay
        ) {

          removeModal();

        }

      }
    );

    /*
     * Confirmar.
     */

    confirm.addEventListener(
      'click',
      function () {

        const amount =
          Number(
            input.value
          );

        const result =
          validatePartialPayment(
            currentDebt,
            amount
          );

        if (!result.ok) {

          message.style.display =
            'block';

          message.textContent =
            result.message;

          message.style.background =
            '#fee2e2';

          message.style.color =
            '#991b1b';

          return;

        }

        const operation =
          preparePartialPayment(
            currentDebt,
            amount,
            null,
            description.value
          );

        /*
         * Evento para la integración financiera.
         *
         * B231.3 NO ejecuta todavía una escritura
         * desconocida en Supabase.
         */

        document.dispatchEvent(
          new CustomEvent(
            'b2313:partial-payment-prepared',
            {
              detail:
                operation
            }
          )
        );

        /*
         * Resultado visual.
         */

        message.style.display =
          'block';

        message.style.background =
          '#ecfdf5';

        message.style.color =
          '#065f46';

        message.textContent =
          operation.pago_total
            ? (
                'Pago total preparado. ' +
                'Saldo resultante: $0.'
              )
            : (
                'Abono preparado. Nuevo saldo: ' +
                formatMoney(
                  operation.saldo_nuevo
                ) +
                '.'
              );

        /*
         * No cerramos automáticamente.
         * Esto permite inspeccionar el resultado antes
         * de conectar la persistencia definitiva.
         */

      }
    );

    actions.appendChild(
      cancel
    );

    actions.appendChild(
      confirm
    );

    card.appendChild(
      title
    );

    card.appendChild(
      creditor
    );

    card.appendChild(
      balanceText
    );

    card.appendChild(
      label
    );

    card.appendChild(
      input
    );

    card.appendChild(
      maxText
    );

    card.appendChild(
      description
    );

    card.appendChild(
      message
    );

    card.appendChild(
      actions
    );

    overlay.appendChild(
      card
    );

    document.body.appendChild(
      overlay
    );

    modal =
      overlay;

    setTimeout(
      function () {
        input.focus();
      },
      50
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

    validatePartialPayment,

    preparePartialPayment,

    open:
      function (debt) {

        createModal(
          debt
        );

      },

    close:
      removeModal,

    getCurrentDebt:
      function () {

        return currentDebt;

      },

    rules:
      Object.freeze({

        amountMustBePositive:
          true,

        amountCannotExceedBalance:
          true,

        originalAmountImmutable:
          true,

        partialPaymentReducesBalance:
          true,

        zeroBalanceMeansPaid:
          true,

        doesNotCreateIncome:
          true,

        doesNotCreateTransfer:
          true,

        doesNotDuplicatePayment:
          true,

        noAutomaticPersistence:
          true

      })

  };

  window.B2313AbonosParciales =
    Object.freeze(
      api
    );

  console.info(
    '[B231.3] Abonos parciales preparado.'
  );

})();
