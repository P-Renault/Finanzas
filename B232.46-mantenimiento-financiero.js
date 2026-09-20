/*
 * B232.46.2 · MANTENIMIENTO FINANCIERO · DOBLE ENVÍO HARDENING
 *
 * Corrección derivada de la prueba móvil:
 * - Bloqueo inmediato a nivel CLICK del botón submit.
 * - Bloqueo adicional a nivel SUBMIT.
 * - La primera operación válida continúa hacia app.js.
 * - El segundo toque no alcanza el handler original.
 *
 * No escribe en Supabase.
 * No modifica app.js.
 * No modifica motores financieros.
 */
(function () {
  'use strict';

  if (window.B23246Maintenance?.version === '232.46.2') return;

  var VERSION = '232.46.2';
  var LOCK_MS = 1800;

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

  function signature(form) {
    var fields = Array.prototype.slice.call(
      form.querySelectorAll('input, select, textarea')
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
    var id = SUBMIT_BY_FORM[form.id];
    var button = id ? $(id) : null;

    if (!button) return;

    if (locked) {
      button.dataset.b23246Locked = '1';
      button.disabled = true;
      button.setAttribute('aria-busy', 'true');
      button.dataset.b23246OriginalText =
        button.textContent;
      button.textContent = 'Guardando...';
    } else {
      button.disabled = false;
      button.removeAttribute('aria-busy');
      button.dataset.b23246Locked = '0';

      /*
       * app.js puede haber cambiado el texto durante la operación.
       * Solo restauramos si sigue siendo nuestro texto.
       */
      if (button.textContent.trim() === 'Guardando...' &&
          button.dataset.b23246OriginalText) {
        button.textContent =
          button.dataset.b23246OriginalText;
      }
    }
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

  function getFormFromTarget(target) {
    if (!target) return null;

    var button = target.closest?.(
      '#movSubmit,#futureSubmit,#savingSubmit'
    );

    if (!button) return null;

    return button.form ||
      button.closest('form') ||
      null;
  }

  /*
   * CAPA 1: click.
   * El botón queda bloqueado inmediatamente, antes de que un segundo
   * toque pueda generar otro submit.
   */
  function handleClick(event) {
    var form = getFormFromTarget(event.target);

    if (!form || !FORM_IDS.includes(form.id)) return;

    var now = Date.now();
    var currentSignature = signature(form);
    var lock = formLocks.get(form);

    if (lock &&
        now < lock.until &&
        lock.signature === currentSignature) {

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
     * Solo bloqueamos inmediatamente si la entrada es válida.
     * Las entradas inválidas deben poder corregirse y reenviarse.
     */
    var errors = validate(form);

    if (errors.length) {
      return;
    }

    formLocks.set(form, {
      signature: currentSignature,
      until: now + LOCK_MS
    });

    setButtonLocked(form, true);

    setTimeout(function () {
      var current = formLocks.get(form);

      if (current &&
          current.signature === currentSignature) {

        formLocks.delete(form);
        setButtonLocked(form, false);
      }
    }, LOCK_MS);
  }

  /*
   * CAPA 2: submit.
   * Protege también contra dos submits programáticos o eventos que
   * lleguen sin pasar por click.
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
    var currentSignature = signature(form);
    var lock = formLocks.get(form);

    /*
     * Primer submit:
     * si no existe lock, lo creamos y dejamos pasar el handler
     * original de app.js.
     */
    if (!lock) {
      formLocks.set(form, {
        signature: currentSignature,
        until: now + LOCK_MS
      });

      setButtonLocked(form, true);

      setTimeout(function () {
        var current = formLocks.get(form);

        if (current &&
            current.signature === currentSignature) {

          formLocks.delete(form);
          setButtonLocked(form, false);
        }
      }, LOCK_MS);

      renderStatus();
      return;
    }

    /*
     * Segundo submit de la misma operación:
     * se bloquea antes de alcanzar el listener original.
     */
    if (
      lock.signature === currentSignature &&
      now < lock.until
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
     * Contenido cambiado: nueva operación legítima.
     */
    formLocks.set(form, {
      signature: currentSignature,
      until: now + LOCK_MS
    });

    setButtonLocked(form, true);
    renderStatus();
  }

  function boot() {
    document.addEventListener(
      'click',
      handleClick,
      true
    );

    document.addEventListener(
      'submit',
      handleSubmit,
      true
    );

    renderStatus();
  }

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

  if (document.readyState === 'loading') {
    document.addEventListener(
      'DOMContentLoaded',
      boot,
      { once: true }
    );
  } else {
    boot();
  }
})();
