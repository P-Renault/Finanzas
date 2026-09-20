/*
 * B232.46.3 · MANTENIMIENTO FINANCIERO · DOBLE ENVÍO
 *
 * Corrección:
 * Los listeners de B232.46 se registran INMEDIATAMENTE al cargar
 * este script, antes de DOMContentLoaded. Esto es necesario porque
 * app.js instala sus listeners de formularios durante DOMContentLoaded.
 *
 * Capas:
 * 1) click en botón submit -> bloqueo inmediato.
 * 2) submit en captura -> segunda barrera.
 *
 * No modifica app.js.
 * No escribe directamente en Supabase.
 * No modifica motores financieros.
 */
(function () {
  'use strict';

  if (window.B23246Maintenance?.version === '232.46.3') return;

  var VERSION = '232.46.3';
  var LOCK_MS = 2000;

  var stats = {
    validations: 0,
    blocked: 0,
    invalid: 0
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

  function setButtonLocked(form, locked) {
    var button = $(SUBMIT_BY_FORM[form.id]);

    if (!button) return;

    if (locked) {
      if (button.dataset.b23246Locked === '1') return;

      button.dataset.b23246Locked = '1';
      button.dataset.b23246OriginalText =
        button.textContent;

      button.disabled = true;
      button.setAttribute('aria-busy', 'true');
      button.textContent = 'Guardando...';

    } else {
      button.disabled = false;
      button.removeAttribute('aria-busy');
      button.dataset.b23246Locked = '0';

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
        setButtonLocked(form, false);
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
        'Validaciones ejecutadas: ' +
        stats.validations + '.';
    }
  }

  /*
   * Capa 1: se instala AHORA, no dentro de DOMContentLoaded.
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
      until: now + LOCK_MS
    });

    setButtonLocked(form, true);
    unlockLater(form, sig);
    renderStatus();
  }

  /*
   * Capa 2: también se instala AHORA, antes de que app.js
   * registre sus listeners durante DOMContentLoaded.
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

    if (lock &&
        lock.signature === sig &&
        now < lock.until) {

      /*
       * El primer submit también puede llegar con lock creado
       * por click. Para distinguirlo, marcamos una transición.
       */
      if (!lock.submitted) {
        lock.submitted = true;
        renderStatus();
        return;
      }

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
     * Submit sin click (por teclado/programático).
     */
    formLocks.set(form, {
      signature: sig,
      until: now + LOCK_MS,
      submitted: true
    });

    setButtonLocked(form, true);
    unlockLater(form, sig);
    renderStatus();
  }

  /*
   * Registro inmediato, antes de DOMContentLoaded.
   */
  document.addEventListener('click', handleClick, true);
  document.addEventListener('submit', handleSubmit, true);

  window.B23246Maintenance = {
    version: VERSION,
    getStats: function () {
      return {
        validations: stats.validations,
        blocked: stats.blocked,
        invalid: stats.invalid
      };
    }
  };

  /*
   * Solo el panel visual espera al DOM completo.
   * Los listeners de seguridad YA están instalados.
   */
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
