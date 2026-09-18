/* ============================================================
   B231.3 — ABONOS PARCIALES
   Control Financiero · Deudas V2

   INTEGRACIÓN UI 231.3.1

   OBJETIVO
   ------------------------------------------------------------
   Incorporar "Registrar abono" a cada deuda con saldo
   pendiente, sin reemplazar el renderizador existente.

   EJEMPLO:

   Erika
   Saldo actual $460.000

   [Ver detalle] [Editar] [Eliminar]
   [Registrar abono] [Pagar próxima cuota]

   REGLAS:
   - Abono > 0
   - Abono <= saldo pendiente
   - No modifica monto original
   - Reduce saldo
   - Pago total => saldo 0
   - No crea ingresos
   - No crea transferencias
   - No duplica movimientos
   - No crea tablas
   - No crea cliente Supabase
   - No modifica botones existentes
   ============================================================ */

(function () {

  'use strict';

  const VERSION = '231.3.1';

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

  let observer = null;

  let rendering = false;

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

  function normalizedText(value) {

    return cleanText(value)
      .toLowerCase();

  }

  function money(value) {

    if (
      typeof value === 'number' &&
      Number.isFinite(value)
    ) {

      return value;

    }

    let text =
      String(value ?? '')
        .trim();

    text =
      text
        .replace(/\$/g, '')
        .replace(/\s/g, '')
        .replace(/\./g, '')
        .replace(',', '.');

    const result =
      Number(text);

    return Number.isFinite(result)
      ? result
      : 0;

  }

  function formatMoney(value) {

    return (
      '$' +
      Math.round(
        money(value)
      ).toLocaleString(
        'es-CL'
      )
    );

  }

  /*
   ------------------------------------------------------------
   OBTENER SALDO DESDE UNA TARJETA
   ------------------------------------------------------------
  */

  function extractBalance(card) {

    if (!card) {
      return 0;
    }

    /*
     * Primero buscamos elementos que tengan
     * expresamente "Saldo actual".
     */

    const elements =
      Array.from(
        card.querySelectorAll('*')
      );

    for (
      const element of elements
    ) {

      if (
        element.children.length === 0 &&
        normalizedText(
          element.textContent
        ) === 'saldo actual'
      ) {

        /*
         * Buscar el valor inmediatamente próximo.
         */

        let parent =
          element.parentElement;

        for (
          let level = 0;
          level < 3 && parent;
          level++
        ) {

          const text =
            cleanText(
              parent.textContent
            );

          const match =
            text.match(
              /\$\s*[\d.]+(?:,\d+)?/
            );

          if (match) {

            return money(
              match[0]
            );

          }

          parent =
            parent.parentElement;

        }

      }

    }

    /*
     * Fallback:
     * buscar todos los importes del card.
     */

    const text =
      cleanText(
        card.textContent
      );

    const matches =
      text.match(
        /\$\s*[\d.]+(?:,\d+)?/g
      );

    if (
      matches &&
      matches.length
    ) {

      /*
       * El primer importe suele corresponder
       * al saldo actual en la tarjeta actual.
       */

      return money(
        matches[0]
      );

    }

    return 0;

  }

  /*
   ------------------------------------------------------------
   OBTENER NOMBRE / ACREEDOR
   ------------------------------------------------------------
  */

  function extractCreditor(card) {

    if (!card) {
      return 'Deuda';
    }

    const text =
      cleanText(
        card.textContent
      );

    /*
     * Intentar localizar elementos de texto
     * de tamaño relevante.
     */

    const candidates =
      Array.from(
        card.querySelectorAll(
          'strong, b, h3, h4, [class*="nombre"], [class*="acreedor"]'
        )
      );

    for (
      const element of candidates
    ) {

      const value =
        cleanText(
          element.textContent
        );

      if (
        value &&
        value.length < 100 &&
        !/ver detalle|editar|eliminar|pagar|registrar/i
          .test(value)
      ) {

        return value;

      }

    }

    /*
     * Fallback por líneas de texto.
     */

    const lines =
      text
        .split(' ')
        .filter(Boolean);

    return (
      lines.length
        ? lines[0]
        : 'Deuda'
    );

  }

  /*
   ------------------------------------------------------------
   LOCALIZAR TARJETAS DE DEUDA
   ------------------------------------------------------------
  */

  function findDebtCards() {

    const root =
      document.getElementById(
        'deudas'
      );

    if (!root) {
      return [];
    }

    /*
     * Las tarjetas actuales contienen botones
     * "Ver detalle", "Editar" y "Eliminar".
     */

    const allElements =
      Array.from(
        root.querySelectorAll(
          'div, article, li, section'
        )
      );

    const candidates =
      allElements.filter(
        element => {

          const text =
            normalizedText(
              element.textContent
            );

          const hasDetail =
            text.includes(
              'ver detalle'
            );

          const hasEdit =
            text.includes(
              'editar'
            );

          const hasDelete =
            text.includes(
              'eliminar'
            );

          return (
            hasDetail &&
            hasEdit &&
            hasDelete
          );

        }
      );

    /*
     * Nos quedamos con los contenedores más pequeños
     * que todavía contienen los tres botones.
     */

    return candidates.filter(
      element => {

        return !Array.from(
          element.children
        ).some(
          child => {

            const childText =
              normalizedText(
                child.textContent
              );

            return (
              childText.includes(
                'ver detalle'
              ) &&
              childText.includes(
                'editar'
              ) &&
              childText.includes(
                'eliminar'
              )
            );

          }
        );

      }
    );

  }

  /*
   ------------------------------------------------------------
   CREAR BOTÓN
   ------------------------------------------------------------
  */

  function createButton(
    card
  ) {

    if (
      card.querySelector(
        '[data-b2313-abono="true"]'
      )
    ) {

      return;

    }

    const balance =
      extractBalance(
        card
      );

    /*
     * No mostramos abono en deudas
     * sin saldo pendiente.
     */

    if (
      balance <= 0
    ) {

      return;

    }

    const buttons =
      Array.from(
        card.querySelectorAll(
          'button'
        )
      );

    /*
     * Buscar el botón operativo existente
     * para colocar nuestro botón junto a él.
     */

    const paymentButton =
      buttons.find(
        button => {

          const text =
            normalizedText(
              button.textContent
            );

          return (
            text.includes(
              'pagar próxima cuota'
            ) ||
            text.includes(
              'registrar pago único'
            )
          );

        }
      );

    const button =
      document.createElement(
        'button'
      );

    button.type =
      'button';

    button.textContent =
      'Registrar abono';

    button.dataset.b2313Abono =
      'true';

    button.style.cssText = [
      'background:#111827',
      'color:#fff',
      'border:0',
      'border-radius:8px',
      'padding:9px 12px',
      'font-size:12px',
      'font-weight:600',
      'cursor:pointer',
      'white-space:nowrap',
      'margin:2px'
    ].join(';');

    button.addEventListener(
      'click',
      function (event) {

        event.preventDefault();

        event.stopPropagation();

        const debt =
          buildDebtFromCard(
            card
          );

        openModal(
          debt
        );

      }
    );

    /*
     * Insertamos antes del botón de pago existente.
     */

    if (
      paymentButton &&
      paymentButton.parentNode
    ) {

      paymentButton.parentNode.insertBefore(
        button,
        paymentButton
      );

    } else {

      /*
       * Fallback: agregar al final del contenedor
       * de botones.
       */

      const buttonContainer =
        buttons.length
          ? buttons[
              buttons.length - 1
            ].parentElement
          : card;

      buttonContainer.appendChild(
        button
      );

    }

  }

  /*
   ------------------------------------------------------------
   CONSTRUIR OBJETO DE DEUDA DESDE LA TARJETA
   ------------------------------------------------------------
  */

  function buildDebtFromCard(
    card
  ) {

    const balance =
      extractBalance(
        card
      );

    const creditor =
      extractCreditor(
        card
      );

    /*
     * Intentar recuperar ID si el renderizador
     * lo dejó en atributos DOM.
     */

    const debtId =
      card.dataset?.id ||
      card.dataset?.deudaId ||
      card.getAttribute(
        'data-id'
      ) ||
      card.getAttribute(
        'data-deuda-id'
      ) ||
      null;

    return {

      id:
        debtId,

      deuda_id:
        debtId,

      acreedor:
        creditor,

      nombre:
        creditor,

      saldo_actual:
        balance,

      saldo_pendiente:
        balance,

      original_card:
        card

    };

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

        code:
          'DEUDA_REQUERIDA',

        message:
          'Debe seleccionarse una deuda.'

      };

    }

    const balance =
      money(
        debt.saldo_actual ??
        debt.saldo_pendiente ??
        debt.saldo ??
        0
      );

    const payment =
      money(
        amount
      );

    if (
      !Number.isFinite(
        payment
      ) ||
      payment <= 0
    ) {

      return {

        ok: false,

        code:
          'MONTO_INVALIDO',

        message:
          'El abono debe ser mayor que $0.'

      };

    }

    if (
      balance <= 0
    ) {

      return {

        ok: false,

        code:
          'DEUDA_SALDADA',

        message:
          'La deuda no tiene saldo pendiente.'

      };

    }

    if (
      payment > balance
    ) {

      return {

        ok: false,

        code:
          'ABONO_SUPERA_SALDO',

        message:
          'El abono no puede superar el saldo pendiente de ' +
          formatMoney(balance) +
          '.'

      };

    }

    const newBalance =
      balance -
      payment;

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
   CERRAR MODAL
   ------------------------------------------------------------
  */

  function closeModal() {

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

  /*
   ------------------------------------------------------------
   MODAL
   ------------------------------------------------------------
  */

  function openModal(
    debt
  ) {

    closeModal();

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
      'z-index:999999',
      'display:flex',
      'align-items:center',
      'justify-content:center',
      'padding:18px',
      'box-sizing:border-box',
      'background:rgba(0,0,0,.58)'
    ].join(';');

    const card =
      document.createElement(
        'div'
      );

    card.style.cssText = [
      'width:min(440px,100%)',
      'max-height:90vh',
      'overflow:auto',
      'box-sizing:border-box',
      'background:#fff',
      'border-radius:14px',
      'padding:20px',
      'box-shadow:0 20px 70px rgba(0,0,0,.3)'
    ].join(';');

    /*
     * Título.
     */

    const title =
      document.createElement(
        'h3'
      );

    title.textContent =
      'Registrar abono';

    title.style.cssText = [
      'margin:0 0 6px',
      'font-size:20px',
      'color:#111827'
    ].join(';');

    /*
     * Acreedor.
     */

    const creditor =
      document.createElement(
        'div'
      );

    creditor.textContent =
      debt.acreedor ||
      'Deuda';

    creditor.style.cssText = [
      'font-size:15px',
      'font-weight:700',
      'color:#111827',
      'margin-bottom:4px'
    ].join(';');

    /*
     * Saldo.
     */

    const balance =
      money(
        debt.saldo_actual
      );

    const balanceText =
      document.createElement(
        'div'
      );

    balanceText.textContent =
      'Saldo pendiente: ' +
      formatMoney(
        balance
      );

    balanceText.style.cssText = [
      'font-size:13px',
      'color:#6b7280',
      'margin-bottom:18px'
    ].join(';');

    /*
     * Campo monto.
     */

    const amountLabel =
      document.createElement(
        'label'
      );

    amountLabel.textContent =
      'Monto del abono';

    amountLabel.style.cssText = [
      'display:block',
      'font-size:13px',
      'font-weight:600',
      'color:#111827',
      'margin-bottom:6px'
    ].join(';');

    const amount =
      document.createElement(
        'input'
      );

    amount.type =
      'number';

    amount.min =
      '1';

    amount.max =
      String(
        balance
      );

    amount.step =
      '1';

    amount.inputMode =
      'numeric';

    amount.placeholder =
      'Ej.: 100000';

    amount.id =
      'b2313-monto';

    amount.style.cssText = [
      'display:block',
      'width:100%',
      'box-sizing:border-box',
      'padding:12px',
      'border:1px solid #d1d5db',
      'border-radius:8px',
      'font-size:16px',
      'margin-bottom:6px'
    ].join(';');

    const max =
      document.createElement(
        'div'
      );

    max.textContent =
      'Máximo: ' +
      formatMoney(
        balance
      );

    max.style.cssText = [
      'font-size:12px',
      'color:#6b7280',
      'margin-bottom:14px'
    ].join(';');

    /*
     * Descripción.
     */

    const description =
      document.createElement(
        'input'
      );

    description.type =
      'text';

    description.value =
      'Abono a deuda';

    description.placeholder =
      'Descripción';

    description.style.cssText = [
      'display:block',
      'width:100%',
      'box-sizing:border-box',
      'padding:11px',
      'border:1px solid #d1d5db',
      'border-radius:8px',
      'font-size:14px',
      'margin-bottom:14px'
    ].join(';');

    /*
     * Mensaje.
     */

    const message =
      document.createElement(
        'div'
      );

    message.style.cssText = [
      'display:none',
      'padding:10px',
      'border-radius:8px',
      'font-size:12px',
      'margin-bottom:12px'
    ].join(';');

    /*
     * Acciones.
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
      'border:0',
      'border-radius:8px',
      'padding:10px 14px',
      'background:#e5e7eb',
      'color:#111827',
      'font-weight:600'
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
      'border:0',
      'border-radius:8px',
      'padding:10px 14px',
      'background:#111827',
      'color:#fff',
      'font-weight:600'
    ].join(';');

    cancel.addEventListener(
      'click',
      closeModal
    );

    overlay.addEventListener(
      'click',
      function (event) {

        if (
          event.target ===
          overlay
        ) {

          closeModal();

        }

      }
    );

    confirm.addEventListener(
      'click',
      function () {

        const result =
          validatePartialPayment(
            currentDebt,
            amount.value
          );

        if (!result.ok) {

          message.style.display =
            'block';

          message.style.background =
            '#fee2e2';

          message.style.color =
            '#991b1b';

          message.textContent =
            result.message;

          return;

        }

        const operation =
          preparePartialPayment(
            currentDebt,
            amount.value,
            null,
            description.value
          );

        /*
         * No persistimos todavía.
         *
         * Emitimos el contrato para que la siguiente
         * integración conecte la operación con la
         * persistencia financiera existente.
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

        message.style.display =
          'block';

        message.style.background =
          '#ecfdf5';

        message.style.color =
          '#065f46';

        message.textContent =
          operation.pago_total
            ? 'Pago total preparado. Saldo resultante: $0.'
            : (
                'Abono preparado. Nuevo saldo: ' +
                formatMoney(
                  operation.saldo_nuevo
                ) +
                '.'
              );

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
      amountLabel
    );

    card.appendChild(
      amount
    );

    card.appendChild(
      max
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

        amount.focus();

      },
      50
    );

  }

  /*
   ------------------------------------------------------------
   INSTALAR BOTONES
   ------------------------------------------------------------
  */

  function installButtons() {

    if (rendering) {
      return;
    }

    rendering =
      true;

    try {

      const cards =
        findDebtCards();

      cards.forEach(
        createButton
      );

      if (
        cards.length
      ) {

        console.info(
          '[B231.3] Botones Registrar abono:',
          cards.length,
          'tarjetas evaluadas.'
        );

      }

    } finally {

      rendering =
        false;

    }

  }

  /*
   ------------------------------------------------------------
   OBSERVER
   ------------------------------------------------------------
  */

  function startObserver() {

    if (observer) {
      return;
    }

    observer =
      new MutationObserver(
        function () {

          /*
           * Solo actuamos si todavía no existe el botón.
           */

          const root =
            document.getElementById(
              'deudas'
            );

          if (!root) {
            return;
          }

          const missing =
            root.querySelector(
              'button[data-b2313-abono="true"]'
            ) === null;

          if (missing) {

            /*
             * Dar tiempo al renderizador existente
             * para terminar de construir las tarjetas.
             */

            setTimeout(
              installButtons,
              50
            );

          }

        }
      );

    observer.observe(
      document.body,
      {
        childList: true,
        subtree: true
      }
    );

  }

  /*
   ------------------------------------------------------------
   API
   ------------------------------------------------------------
  */

  const api = {

    version:
      VERSION,

    validatePartialPayment,

    preparePartialPayment,

    open:
      openModal,

    close:
      closeModal,

    installButtons,

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

  /*
   ------------------------------------------------------------
   ARRANQUE
   ------------------------------------------------------------
  */

  function boot() {

    /*
     * Intentos iniciales.
     */

    installButtons();

    setTimeout(
      installButtons,
      300
    );

    setTimeout(
      installButtons,
      1000
    );

    setTimeout(
      installButtons,
      2500
    );

    startObserver();

  }

  if (
    document.readyState ===
    'loading'
  ) {

    document.addEventListener(
      'DOMContentLoaded',
      boot,
      {
        once: true
      }
    );

  } else {

    boot();

  }

  console.info(
    '[B231.3] Abonos parciales · UI integrada ·',
    VERSION
  );

})();
