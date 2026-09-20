/*
 * B232.46.4 · MANTENIMIENTO FINANCIERO · DOBLE ENVÍO SIN BLOQUEAR SUBMIT
 *
 * Corrección de B232.46.3:
 * B232.46.3 deshabilitaba el botón durante el click. En algunos
 * navegadores/handlers esto impide que el click produzca el submit
 * nativo, por lo que app.js nunca recibía la primera operación.
 *
 * B232.46.4:
 * - NO deshabilita el botón durante el primer click.
 * - NO cancela el primer submit válido.
 * - Bloquea únicamente el segundo click/submit idéntico.
 * - Mantiene la validación previa.
 * - Mantiene una ventana de 2 segundos para evitar doble envío.
 *
 * No modifica app.js.
 * No escribe directamente en Supabase.
 * No modifica motores financieros.
 */
(function () {
  'use strict';

  if (window.B23246Maintenance?.version === '232.46.4') return;

  var VERSION = '232.46.4';
  var LOCK_MS = 2000;

  var stats = {
    validations: 0,
    blocked: 0,
    invalid: 0,
    allowed: 0
  };

  var formLocks = new WeakMap();

  var FORM_IDS = ['movForm', 'futureForm', 'savingForm'];

  var SUBMIT_BY_FORM = {
    movForm: 'movSubmit',
    futureForm: 'futureSubmit',
    savingForm: 'savingSubmit'
  };

  function $(id) {
    return document.getElementById(id);
  }

  function normalize(value) {
    return String(value == null ? '' : value).trim();
  }

  function isValidISODate(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return false;

    var d = new Date(value + 'T00:00:00');

    return !Number.isNaN(d.getTime()) &&
      d.toISOString().slice(0, 10) === value;
  }

  function positiveAmount(value) {
    var n = Number(value);
    return Number.isFinite(n) && n > 0;
  }

  function getForm(target) {
    if (!target) return null;

    var button = target.closest?.(
      '#movSubmit,#futureSubmit,#savingSubmit'
    );

    if (!button) return null;

    return button.form ||
      button.closest('form') ||
      null;
  }

  function signature(form) {
    var fields = Array.prototype.slice.call(
      form.querySelectorAll('input,select,textarea')
    );

    return fields
      .filter(function (field) {
        return field.type !== 'hidden' &&
          field.type !== 'button' &&
          field.type !== 'submit';
      })
      .map(function (field) {
        return field.id + '=' + normalize(field.value);
      })
      .join('|');
  }

  function validate(form) {
    var errors = [];

    if (form.id === 'movForm') {
      if (!['ingreso', 'gasto'].includes(
        normalize($('movTipo')?.value)
      )) {
        errors.push('Tipo de movimiento inválido.');
      }

      if (!isValidISODate(
        normalize($('movFecha')?.value)
      )) {
        errors.push('La fecha del movimiento no es válida.');
      }

      if (!positiveAmount($('movMonto')?.value)) {
        errors.push('El monto debe ser mayor que $0.');
      }
    }

    if (form.id === 'futureForm') {
      if (!normalize($('futureConcepto')?.value)) {
        errors.push('El concepto es obligatorio.');
      }

      if (!isValidISODate(
        normalize($('futureFecha')?.value)
      )) {
        errors.push('La fecha de vencimiento no es válida.');
      }

      if (!positiveAmount($('futureMonto')?.value)) {
        errors.push('El monto debe ser mayor que $0.');
      }

      var recurrence = normalize(
        $('futureRecurrence')?.value
      );

      if (!['unico', 'mensual', 'semanal', 'anual']
        .includes(recurrence)) {
        errors.push('La periodicidad no es válida.');
      }
    }

    if (form.id === 'savingForm') {
      if (!['aporte', 'retiro'].includes(
        normalize($('savingTipo')?.value)
      )) {
        errors.push('Tipo de ahorro inválido.');
      }

      if (!isValidISODate(
        normalize($('savingFecha')?.value)
      )) {
        errors.push('La fecha del ahorro no es válida.');
      }

      if (!positiveAmount($('savingMonto')?.value)) {
        errors.push('El monto debe ser mayor que $0.');
      }
    }

    return errors;
  }

  function showMessage(form, text) {
    var map = {
      movForm: 'movMsg',
      futureForm: 'futureMsg',
      savingForm: 'savingMsg'
    };

    var target = $(map[form.id]);

    if (target) {
      target.textContent = text;
      target.style.color = '#b45309';
    }
  }

  /*
   * IMPORTANTE:
   * No usamos button.disabled=true.
   * El primer click debe poder generar el submit nativo y llegar
   * al handler original de app.js.
   */
  function setButtonBusy(form, busy) {
    var button = $(SUBMIT_BY_FORM[form.id]);

    if (!button) return;

    if (busy) {
      if (button.dataset.b23246Busy === '1') return;

      button.dataset.b23246Busy = '1';
      button.dataset.b23246OriginalText =
        button.textContent;

      button.setAttribute('aria-busy', 'true');
      button.dataset.b23246BusyVisual = '1';
      button.textContent = 'Guardando...';

    } else {
      button.removeAttribute('aria-busy');
      button.dataset.b23246Busy = '0';

      if (button.textContent.trim() === 'Guardando...' &&
          button.dataset.b23246OriginalText) {
        button.textContent =
          button.dataset.b23246OriginalText;
      }
    }
  }

  function unlockLater(form, sig) {
    setTimeout(function () {
      var lock = formLocks.get(form);

      if (lock && lock.signature === sig) {
        formLocks.delete(form);
        setButtonBusy(form, false);
      }
    }, LOCK_MS);
  }

  function renderStatus() {
    var status = $('b23246-status');
    var summary = $('b23246-summary');
    var detail = $('b23246-detail');

    if (status) {
      status.textContent = 'VALIDACIONES ACTIVAS';
      status.style.color = '#111827';
    }

    if (summary) {
      summary.textContent =
        stats.invalid + ' inválidas · ' +
        stats.blocked + ' duplicados bloqueados';
    }

    if (detail) {
      detail.textContent =
        'Montos, fechas y doble envío se validan antes de la escritura. ' +
        'Validaciones: ' + stats.validations +
        ' · Permitidos: ' + stats.allowed +
        ' · Bloqueados: ' + stats.blocked + '.';
    }
  }

  /*
   * CAPA 1 — click.
   *
   * Primer click:
   * - registra el lock
   * - cambia visualmente el botón
   * - NO cancela el evento
   *
   * Por lo tanto el navegador puede continuar con el submit.
   *
   * Segundo click:
   * - se cancela
   * - no llega al handler original.
   */
  function handleClick(event) {
    var form = getForm(event.target);

    if (!form || !FORM_IDS.includes(form.id)) return;

    var errors = validate(form);

    if (errors.length) {
      stats.invalid++;
      renderStatus();
      return;
    }

    var now = Date.now();
    var sig = signature(form);
    var lock = formLocks.get(form);

    if (lock &&
        lock.signature === sig &&
        now < lock.until) {

      event.preventDefault();
      event.stopImmediatePropagation();

      stats.blocked++;

      showMessage(
        form,
        'Envío duplicado bloqueado. La operación anterior está en curso.'
      );

      renderStatus();
      return;
    }

    formLocks.set(form, {
      signature: sig,
      until: now + LOCK_MS,
      submitted: false
    });

    setButtonBusy(form, true);
    unlockLater(form, sig);
    renderStatus();

    /*
     * Deliberadamente no hacemos preventDefault ni
     * stopImmediatePropagation aquí.
     */
  }

  /*
   * CAPA 2 — submit.
   *
   * El primer submit de la operación debe continuar a app.js.
   * Solo el segundo submit idéntico se cancela.
   */
  function handleSubmit(event) {
    var form = event.target;

    if (!form || !FORM_IDS.includes(form.id)) return;

    stats.validations++;

    var errors = validate(form);

    if (errors.length) {
      event.preventDefault();
      event.stopImmediatePropagation();

      stats.invalid++;

      showMessage(
        form,
        'No se guardó: ' + errors.join(' ')
      );

      renderStatus();
      return;
    }

    var now = Date.now();
    var sig = signature(form);
    var lock = formLocks.get(form);

    /*
     * Primer submit después del click:
     * se marca como enviado y SE DEJA PASAR.
     */
    if (
      lock &&
      lock.signature === sig &&
      now < lock.until &&
      !lock.submitted
    ) {
      lock.submitted = true;
      stats.allowed++;
      renderStatus();

      /*
       * CRÍTICO: no preventDefault.
       * app.js recibe el submit.
       */
      return;
    }

    /*
     * Segundo submit idéntico.
     */
    if (
      lock &&
      lock.signature === sig &&
      now < lock.until &&
      lock.submitted
    ) {
      event.preventDefault();
      event.stopImmediatePropagation();

      stats.blocked++;

      showMessage(
        form,
        'Envío duplicado bloqueado. La operación anterior está en curso.'
      );

      renderStatus();
      return;
    }

    /*
     * Submit sin click (teclado/programático):
     * crea lock y deja pasar el primero.
     */
    formLocks.set(form, {
      signature: sig,
      until: now + LOCK_MS,
      submitted: true
    });

    stats.allowed++;
    setButtonBusy(form, true);
    unlockLater(form, sig);
    renderStatus();

    /*
     * También se deja pasar.
     */
  }

  /*
   * Registro INMEDIATO para adelantarnos a los handlers de app.js.
   */
  document.addEventListener('click', handleClick, true);
  document.addEventListener('submit', handleSubmit, true);

  window.B23246Maintenance = {
    version: VERSION,
    getStats: function () {
      return {
        validations: stats.validations,
        blocked: stats.blocked,
        invalid: stats.invalid,
        allowed: stats.allowed
      };
    }
  };

  function initPanel() {
    renderStatus();
  }

  if (document.readyState === 'loading') {
    document.addEventListener(
      'DOMContentLoaded',
      initPanel,
      { once: true }
    );
  } else {
    initPanel();
  }
})();
