/* ============================================================
   B231.3 — ABONOS PARCIALES
   INTEGRACIÓN CON TARJETAS EXISTENTES DE DEUDAS
   Versión 231.3.2
   ============================================================ */

(function () {

  'use strict';

  const VERSION = '231.3.2';

  if (
    window.B2313AbonosParciales &&
    window.B2313AbonosParciales.version === VERSION
  ) {
    return;
  }

  let modal = null;
  let currentDebt = null;
  let observer = null;
  let installing = false;

  /* ==========================================================
     UTILIDADES
     ========================================================== */

  function text(value) {
    return String(value || '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function lower(value) {
    return text(value).toLowerCase();
  }

  function money(value) {

    if (
      typeof value === 'number' &&
      Number.isFinite(value)
    ) {
      return value;
    }

    let v = String(value ?? '')
      .replace(/\$/g, '')
      .replace(/\s/g, '')
      .trim();

    if (!v) return 0;

    /*
     * Formato habitual de la aplicación:
     * $460.000
     */

    v = v.replace(/\./g, '');
    v = v.replace(',', '.');

    const n = Number(v);

    return Number.isFinite(n) ? n : 0;
  }

  function formatMoney(value) {

    return '$' + Math.round(
      money(value)
    ).toLocaleString('es-CL');

  }

  /* ==========================================================
     BUSCAR SALDO DE UNA TARJETA
     ========================================================== */

  function getBalance(card) {

    if (!card) return 0;

    /*
     * Buscar explícitamente "Saldo actual".
     */

    const nodes = Array.from(
      card.querySelectorAll('*')
    );

    for (const node of nodes) {

      if (
        node.children.length === 0 &&
        lower(node.textContent) === 'saldo actual'
      ) {

        let parent = node.parentElement;

        for (
          let i = 0;
          i < 4 && parent;
          i++
        ) {

          const match =
            text(parent.textContent)
              .match(/\$\s*[\d.]+(?:,\d+)?/);

          if (match) {
            return money(match[0]);
          }

          parent = parent.parentElement;

        }

      }

    }

    /*
     * Fallback: obtener los importes visibles.
     */

    const matches =
      text(card.textContent)
        .match(/\$\s*[\d.]+(?:,\d+)?/g);

    if (!matches || !matches.length) {
      return 0;
    }

    /*
     * En las tarjetas actuales el primer importe
     * corresponde al saldo actual.
     */

    return money(matches[0]);

  }

  /* ==========================================================
     ENCONTRAR TARJETA DESDE UN BOTÓN EXISTENTE
     ========================================================== */

  function findDebtCard(button) {

    let element =
      button?.parentElement || null;

    for (
      let level = 0;
      level < 8 && element;
      level++
    ) {

      const content =
        lower(element.textContent);

      const hasDetail =
        content.includes('ver detalle');

      const hasEdit =
        content.includes('editar');

      const hasDelete =
        content.includes('eliminar');

      const hasBalance =
        content.includes('saldo actual');

      if (
        hasDetail &&
        hasEdit &&
        hasDelete &&
        hasBalance
      ) {

        return element;

      }

      element =
        element.parentElement;

    }

    return null;

  }

  /* ==========================================================
     EXTRAER NOMBRE
     ========================================================== */

  function getCreditor(card) {

    if (!card) {
      return 'Deuda';
    }

    /*
     * Buscar primero elementos destacados.
     */

    const candidates =
      Array.from(
        card.querySelectorAll(
          'strong,b,h3,h4'
        )
      );

    for (const candidate of candidates) {

      const value =
        text(candidate.textContent);

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
     * Buscar después elementos con clases
     * relacionadas con acreedor/nombre.
     */

    const named =
      Array.from(
        card.querySelectorAll(
          '[class*="acreedor"],' +
          '[class*="nombre"],' +
          '[class*="deuda"]'
        )
      );

    for (const candidate of named) {

      const value =
        text(candidate.textContent);

      if (
        value &&
        value.length < 100 &&
        !/saldo|original|cuota|próximo/i
          .test(value)
      ) {

        return value;

      }

    }

    return 'Deuda';

  }

  /* ==========================================================
     CONSTRUIR DEUDA
     ========================================================== */

  function buildDebt(button) {

    const card =
      findDebtCard(button);

    if (!card) {
      return null;
    }

    const balance =
      getBalance(card);

    if (balance <= 0) {
      return null;
    }

    return {

      id:
        card.dataset?.id ||
        card.dataset?.deudaId ||
        card.getAttribute('data-id') ||
        card.getAttribute('data-deuda-id') ||
        null,

      acreedor:
        getCreditor(card),

      saldo_actual:
        balance,

      saldo_pendiente:
        balance,

      card:
        card

    };

  }

  /* ==========================================================
     VALIDAR ABONO
     ========================================================== */

  function validate(debt, amount) {

    if (!debt) {

      return {
        ok: false,
        message:
          'No se pudo identificar la deuda.'
      };

    }

    const balance =
      money(
        debt.saldo_actual ??
        debt.saldo_pendiente
      );

    const payment =
      money(amount);

    if (
      payment <= 0
    ) {

      return {
        ok: false,
        message:
          'El monto del abono debe ser mayor que $0.'
      };

    }

    if (
      payment > balance
    ) {

      return {
        ok: false,
        message:
          'El abono no puede superar el saldo de ' +
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

  /* ==========================================================
     PREPARAR OPERACIÓN
     ========================================================== */

  function prepare(
    debt,
    amount,
    description
  ) {

    const result =
      validate(
        debt,
        amount
      );

    if (!result.ok) {
      throw new Error(
        result.message
      );
    }

    return {

      type:
        'ABONO_DEUDA',

      source:
        'B231.3',

      debt_id:
        debt.id || null,

      acreedor:
        debt.acreedor,

      monto_abono:
        result.monto_abono,

      saldo_anterior:
        result.saldo_anterior,

      saldo_nuevo:
        result.saldo_nuevo,

      pago_total:
        result.pago_total,

      descripcion:
        description ||
        'Abono a deuda',

      is_income:
        false,

      is_transfer:
        false,

      is_expense:
        true,

      fecha:
        new Date()
          .toISOString()
          .slice(0, 10)

    };

  }

  /* ==========================================================
     CERRAR MODAL
     ========================================================== */

  function closeModal() {

    if (
      modal &&
      modal.parentNode
    ) {

      modal.parentNode.removeChild(
        modal
      );

    }

    modal = null;
    currentDebt = null;

  }

  /* ==========================================================
     ABRIR MODAL
     ========================================================== */

  function open(debt) {

    closeModal();

    if (!debt) {
      return;
    }

    currentDebt =
      debt;

    const overlay =
      document.createElement('div');

    overlay.id =
      'b2313-abono-modal';

    overlay.style.cssText = `
      position:fixed;
      inset:0;
      z-index:999999;
      display:flex;
      align-items:center;
      justify-content:center;
      padding:18px;
      box-sizing:border-box;
      background:rgba(0,0,0,.60);
    `;

    const box =
      document.createElement('div');

    box.style.cssText = `
      width:min(430px,100%);
      max-height:90vh;
      overflow:auto;
      background:#fff;
      border-radius:14px;
      padding:20px;
      box-sizing:border-box;
      box-shadow:0 20px 70px rgba(0,0,0,.30);
    `;

    const title =
      document.createElement('h3');

    title.textContent =
      'Registrar abono';

    title.style.cssText = `
      margin:0 0 8px;
      color:#111827;
      font-size:20px;
    `;

    const creditor =
      document.createElement('div');

    creditor.textContent =
      debt.acreedor;

    creditor.style.cssText = `
      font-weight:700;
      font-size:15px;
      color:#111827;
      margin-bottom:4px;
    `;

    const balance =
      document.createElement('div');

    balance.textContent =
      'Saldo pendiente: ' +
      formatMoney(
        debt.saldo_actual
      );

    balance.style.cssText = `
      color:#6b7280;
      font-size:13px;
      margin-bottom:18px;
    `;

    const label =
      document.createElement('label');

    label.textContent =
      'Monto del abono';

    label.style.cssText = `
      display:block;
      color:#111827;
      font-size:13px;
      font-weight:600;
      margin-bottom:6px;
    `;

    const input =
      document.createElement('input');

    input.type =
      'number';

    input.min =
      '1';

    input.max =
      String(
        debt.saldo_actual
      );

    input.step =
      '1';

    input.inputMode =
      'numeric';

    input.placeholder =
      'Ej.: 100000';

    input.style.cssText = `
      width:100%;
      box-sizing:border-box;
      padding:12px;
      border:1px solid #d1d5db;
      border-radius:8px;
      font-size:16px;
      margin-bottom:6px;
    `;

    const max =
      document.createElement('div');

    max.textContent =
      'Máximo permitido: ' +
      formatMoney(
        debt.saldo_actual
      );

    max.style.cssText = `
      color:#6b7280;
      font-size:12px;
      margin-bottom:14px;
    `;

    const description =
      document.createElement('input');

    description.type =
      'text';

    description.value =
      'Abono a deuda';

    description.placeholder =
      'Descripción';

    description.style.cssText = `
      width:100%;
      box-sizing:border-box;
      padding:11px;
      border:1px solid #d1d5db;
      border-radius:8px;
      font-size:14px;
      margin-bottom:14px;
    `;

    const message =
      document.createElement('div');

    message.style.cssText = `
      display:none;
      padding:10px;
      border-radius:8px;
      font-size:12px;
      margin-bottom:12px;
    `;

    const actions =
      document.createElement('div');

    actions.style.cssText = `
      display:flex;
      justify-content:flex-end;
      gap:8px;
    `;

    const cancel =
      document.createElement('button');

    cancel.type =
      'button';

    cancel.textContent =
      'Cancelar';

    cancel.style.cssText = `
      border:0;
      border-radius:8px;
      padding:10px 14px;
      background:#e5e7eb;
      color:#111827;
      font-weight:600;
    `;

    const confirm =
      document.createElement('button');

    confirm.type =
      'button';

    confirm.textContent =
      'Preparar abono';

    confirm.style.cssText = `
      border:0;
      border-radius:8px;
      padding:10px 14px;
      background:#111827;
      color:#fff;
      font-weight:600;
    `;

    cancel.onclick =
      closeModal;

    confirm.onclick =
      function () {

        try {

          const operation =
            prepare(
              currentDebt,
              input.value,
              description.value
            );

          /*
           * Emitir evento.
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

        } catch (error) {

          message.style.display =
            'block';

          message.style.background =
            '#fee2e2';

          message.style.color =
            '#991b1b';

          message.textContent =
            error.message;

        }

      };

    actions.appendChild(cancel);
    actions.appendChild(confirm);

    box.appendChild(title);
    box.appendChild(creditor);
    box.appendChild(balance);
    box.appendChild(label);
    box.appendChild(input);
    box.appendChild(max);
    box.appendChild(description);
    box.appendChild(message);
    box.appendChild(actions);

    overlay.appendChild(box);

    document.body.appendChild(
      overlay
    );

    modal =
      overlay;

    setTimeout(
      () => input.focus(),
      50
    );

  }

  /* ==========================================================
     LOCALIZAR BOTONES EXISTENTES
     ========================================================== */

  function findExistingPaymentButtons() {

    /*
     * No dependemos de #deudas.
     * Buscamos los botones que YA EXISTEN.
     */

    const buttons =
      Array.from(
        document.querySelectorAll(
          'button'
        )
      );

    return buttons.filter(
      button => {

        const value =
          lower(
            button.textContent
          );

        return (
          value.includes(
            'pagar próxima cuota'
          ) ||
          value.includes(
            'registrar pago único'
          )
        );

      }
    );

  }

  /* ==========================================================
     INSERTAR BOTÓN
     ========================================================== */

  function installOne(
    paymentButton
  ) {

    if (!paymentButton) {
      return;
    }

    /*
     * Evitar duplicado.
     */

    const parent =
      paymentButton.parentElement;

    if (!parent) {
      return;
    }

    if (
      parent.querySelector(
        '[data-b2313-abono="true"]'
      )
    ) {

      return;

    }

    /*
     * Obtener tarjeta.
     */

    const debt =
      buildDebt(
        paymentButton
      );

    if (!debt) {

      console.warn(
        '[B231.3] No se pudo obtener la deuda del botón.',
        paymentButton
      );

      return;

    }

    /*
     * Crear botón.
     */

    const button =
      document.createElement('button');

    button.type =
      'button';

    button.textContent =
      'Registrar abono';

    button.dataset.b2313Abono =
      'true';

    button.style.cssText = `
      background:#111827;
      color:#fff;
      border:0;
      border-radius:8px;
      padding:9px 12px;
      font-size:12px;
      font-weight:600;
      cursor:pointer;
      white-space:nowrap;
      margin:2px;
    `;

    button.addEventListener(
      'click',
      function (event) {

        event.preventDefault();
        event.stopPropagation();

        /*
         * Volver a construir la deuda en el momento
         * del clic para obtener el saldo actual.
         */

        const current =
          buildDebt(
            paymentButton
          );

        open(
          current
        );

      }
    );

    /*
     * Colocar antes del botón existente.
     */

    parent.insertBefore(
      button,
      paymentButton
    );

  }

  /* ==========================================================
     INSTALAR
     ========================================================== */

  function install() {

    if (installing) {
      return;
    }

    installing =
      true;

    try {

      const buttons =
        findExistingPaymentButtons();

      buttons.forEach(
        installOne
      );

      console.info(
        '[B231.3] Botones de abono evaluados:',
        buttons.length
      );

    } finally {

      installing =
        false;

    }

  }

  /* ==========================================================
     OBSERVER
     ========================================================== */

  function startObserver() {

    if (observer) {
      return;
    }

    observer =
      new MutationObserver(
        function () {

          /*
           * Esperar al renderizador de Deudas.
           */

          setTimeout(
            install,
            30
          );

        }
      );

    observer.observe(
      document.body,
      {
        childList:true,
        subtree:true
      }
    );

  }

  /* ==========================================================
     API
     ========================================================== */

  const api = {

    version:
      VERSION,

    validate,

    prepare,

    open,

    close:
      closeModal,

    install,

    getCurrentDebt:
      () => currentDebt,

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

  /* ==========================================================
     ARRANQUE
     ========================================================== */

  function boot() {

    install();

    setTimeout(
      install,
      300
    );

    setTimeout(
      install,
      1000
    );

    setTimeout(
      install,
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
        once:true
      }
    );

  } else {

    boot();

  }

  console.info(
    '[B231.3] Abonos parciales UI integrada —',
    VERSION
  );

})();
