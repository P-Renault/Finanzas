/*
 * B232.46 · MANTENIMIENTO FINANCIERO · FINAL
 *
 * Sprint 2:
 * - Validación de fechas.
 * - Validación de montos.
 * - Validación de tipos.
 * - Protección contra doble envío rápido.
 *
 * Contrato:
 * - No escribe en Supabase.
 * - No modifica app.js.
 * - No modifica motores financieros.
 * - Interviene solamente en formularios existentes mediante captura.
 * - Una operación válida continúa hacia el handler original de app.js.
 */
(function () {
  'use strict';

  if (window.B23246Maintenance) return;

  var VERSION = '232.46.1';
  var duplicateWindowMs = 1500;
  var lastSubmission = null;
  var stats = {
    validations: 0,
    blocked: 0,
    invalid: 0
  };

  function $(id) {
    return document.getElementById(id);
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

  function normalize(value) {
    return String(value == null ? '' : value).trim();
  }

  function signature(form) {
    var fields = Array.prototype.slice.call(
      form.querySelectorAll('input, select, textarea')
    );

    return fields
      .filter(function (field) {
        return field.type !== 'hidden' && field.type !== 'button';
      })
      .map(function (field) {
        return field.id + '=' + normalize(field.value);
      })
      .join('|');
  }

  function validate(form) {
    var errors = [];

    if (form.id === 'movForm') {
      if (!['ingreso', 'gasto'].includes(normalize($('movTipo')?.value))) {
        errors.push('Tipo de movimiento inválido.');
      }

      if (!isValidISODate(normalize($('movFecha')?.value))) {
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

      if (!isValidISODate(normalize($('futureFecha')?.value))) {
        errors.push('La fecha de vencimiento no es válida.');
      }

      if (!positiveAmount($('futureMonto')?.value)) {
        errors.push('El monto debe ser mayor que $0.');
      }

      var recurrence = normalize($('futureRecurrence')?.value);
      if (!['unico', 'mensual', 'semanal', 'anual'].includes(recurrence)) {
        errors.push('La periodicidad no es válida.');
      }
    }

    if (form.id === 'savingForm') {
      if (!['aporte', 'retiro'].includes(normalize($('savingTipo')?.value))) {
        errors.push('Tipo de ahorro inválido.');
      }

      if (!isValidISODate(normalize($('savingFecha')?.value))) {
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

  function renderStatus() {
    var status = $('b23246-status');
    var summary = $('b23246-summary');
    var detail = $('b23246-detail');

    if (status) {
      status.textContent =
        stats.invalid || stats.blocked
          ? 'VALIDACIONES ACTIVAS'
          : 'VALIDACIONES ACTIVAS';
    }

    if (summary) {
      summary.textContent =
        stats.invalid + ' inválidas · ' +
        stats.blocked + ' duplicados bloqueados';
    }

    if (detail) {
      detail.textContent =
        'Montos, fechas y envíos duplicados se validan antes de la escritura. ' +
        'Validaciones ejecutadas: ' + stats.validations + '.';
    }
  }

  function handleSubmit(event) {
    var form = event.target;

    if (!form || !['movForm', 'futureForm', 'savingForm'].includes(form.id)) {
      return;
    }

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

    var currentSignature = signature(form);
    var now = Date.now();

    if (
      lastSubmission &&
      lastSubmission.formId === form.id &&
      lastSubmission.signature === currentSignature &&
      now - lastSubmission.time < duplicateWindowMs
    ) {
      event.preventDefault();
      event.stopImmediatePropagation();

      stats.blocked++;

      showMessage(
        form,
        'Envío duplicado bloqueado. Espera a que termine la operación anterior.'
      );

      renderStatus();
      return;
    }

    lastSubmission = {
      formId: form.id,
      signature: currentSignature,
      time: now
    };

    renderStatus();
    // No preventDefault: el handler original de app.js continúa.
  }

  function boot() {
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
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();
