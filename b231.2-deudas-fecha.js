/* ============================================================
   B231.2 — DEUDAS V2
   ASIGNACIÓN / EDICIÓN DE FECHA DE VENCIMIENTO

   CORRECCIÓN UI 231.2.1

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
   - Utiliza B231.0 y B231.1.
   ============================================================ */

(function () {
  'use strict';

  const VERSION = '231.2.1';

  /*
   ------------------------------------------------------------
   PROTECCIÓN CONTRA DOBLE CARGA
   ------------------------------------------------------------
  */

  if (
    window.B2312DeudasFecha &&
    window.B2312DeudasFecha.version === VERSION
  ) {
    console.info(
      '[B231.2] Corrección UI ya cargada.'
    );
    return;
  }

  /*
   ------------------------------------------------------------
   DEPENDENCIA B231.0
   ------------------------------------------------------------
  */

  const V2 =
    window.B231DeudasV2;

  if (!V2) {
    console.error(
      '[B231.2] No se encontró B231DeudasV2.'
    );
    return;
  }

  let firstPaymentControl = null;
  let undatedControl = null;
  let statusElement = null;
  let observer = null;

  /*
   ------------------------------------------------------------
   UTILIDADES
   ------------------------------------------------------------
  */

  function clean(value) {
    return String(value || '')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
  }

  /*
   ------------------------------------------------------------
   BUSCAR "PRIMERA CUOTA"
   ------------------------------------------------------------

   La interfaz actual no necesariamente utiliza <label>.
   Por eso buscamos también div, span y otros elementos.
   ------------------------------------------------------------
  */

  function findFirstPaymentControl() {

    /*
     * Primera estrategia:
     * labels HTML.
     */

    const labels =
      Array.from(
        document.querySelectorAll(
          '#deudas label'
        )
      );

    for (const label of labels) {

      if (
        clean(label.textContent)
          .includes('primera cuota')
      ) {

        if (label.htmlFor) {

          const control =
            document.getElementById(
              label.htmlFor
            );

          if (control) {
            return control;
          }
        }

        const nested =
          label.querySelector(
            'input, select, textarea'
          );

        if (nested) {
          return nested;
        }

        const parent =
          label.parentElement;

        if (parent) {

          const control =
            parent.querySelector(
              'input, select, textarea'
            );

          if (control) {
            return control;
          }
        }
      }
    }

    /*
     * Segunda estrategia:
     * cualquier elemento cuyo texto sea
     * exactamente "Primera cuota".
     */

    const candidates =
      Array.from(
        document.querySelectorAll(
          '#deudas *'
        )
      );

    for (const node of candidates) {

      if (
        node.children.length === 0 &&
        clean(node.textContent) ===
          'primera cuota'
      ) {

        let parent =
          node.parentElement;

        /*
         * Subimos algunos niveles buscando
         * el control asociado.
         */

        for (
          let level = 0;
          level < 5 && parent;
          level++,
          parent = parent.parentElement
        ) {

          const controls =
            parent.querySelectorAll(
              'input, select, textarea'
            );

          if (
            controls.length === 1
          ) {
            return controls[0];
          }

          /*
           * Si existen varios controles,
           * preferimos input/select de fecha.
           */

          for (
            const control of controls
          ) {

            const type =
              clean(
                control.type
              );

            if (
              type === 'date' ||
              control.tagName === 'SELECT'
            ) {
              return control;
            }
          }
        }
      }
    }

    /*
     * Tercera estrategia:
     * buscar controles de fecha dentro del módulo
     * y utilizar el segundo campo cuando la estructura
     * corresponde a Fecha de inicio / Primera cuota.
     */

    const dateInputs =
      Array.from(
        document.querySelectorAll(
          '#deudas input[type="date"]'
        )
      );

    if (
      dateInputs.length >= 2
    ) {
      return dateInputs[1];
    }

    return null;
  }

  /*
   ------------------------------------------------------------
   CONTENEDOR DEL CAMPO
   ------------------------------------------------------------
  */

  function findFieldContainer(
    control
  ) {

    if (!control) {
      return null;
    }

    let current =
      control.parentElement;

    for (
      let i = 0;
      i < 5 && current;
      i++
    ) {

      const text =
        clean(
          current.textContent
        );

      if (
        text.includes(
          'primera cuota'
        ) &&
        current.querySelector(
          'input, select, textarea'
        )
      ) {

        return current;
      }

      current =
        current.parentElement;
    }

    return (
      control.parentElement ||
      null
    );
  }

  /*
   ------------------------------------------------------------
   CREAR CONTROL "SIN FECHA"
   ------------------------------------------------------------
  */

  function createUndatedControl() {

    const existing =
      document.getElementById(
        'b2312-sin-fecha'
      );

    if (existing) {
      return existing;
    }

    if (!firstPaymentControl) {
      return null;
    }

    const container =
      findFieldContainer(
        firstPaymentControl
      );

    if (!container) {
      return null;
    }

    /*
     * Contenedor visual.
     */

    const wrapper =
      document.createElement(
        'div'
      );

    wrapper.id =
      'b2312-fecha-wrapper';

    wrapper.dataset.b2312 =
      VERSION;

    wrapper.style.cssText = [
      'display:flex',
      'align-items:center',
      'width:100%',
      'box-sizing:border-box',
      'margin-top:8px',
      'padding:9px 10px',
      'border:1px solid rgba(128,128,128,.28)',
      'border-radius:8px',
      'background:rgba(128,128,128,.05)'
    ].join(';');

    /*
     * Label.
     */

    const label =
      document.createElement(
        'label'
      );

    label.style.cssText = [
      'display:flex',
      'align-items:center',
      'gap:8px',
      'width:100%',
      'cursor:pointer',
      'font-size:12px',
      'line-height:1.3'
    ].join(';');

    /*
     * Checkbox.
     */

    const checkbox =
      document.createElement(
        'input'
      );

    checkbox.type =
      'checkbox';

    checkbox.id =
      'b2312-sin-fecha';

    checkbox.name =
      'b2312_sin_fecha';

    checkbox.style.cssText =
      'width:18px;height:18px;flex:0 0 auto;';

    /*
     * Texto.
     */

    const text =
      document.createElement(
        'span'
      );

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

    /*
     * Insertar inmediatamente después
     * del contenedor Primera cuota.
     */

    if (
      container.nextSibling
    ) {

      container.parentNode.insertBefore(
        wrapper,
        container.nextSibling
      );

    } else {

      container.parentNode.appendChild(
        wrapper
      );

    }

    checkbox.addEventListener(
      'change',
      applyDateMode
    );

    return checkbox;
  }

  /*
   ------------------------------------------------------------
   INDICADOR DE ESTADO
   ------------------------------------------------------------
  */

  function createStatus() {

    const existing =
      document.getElementById(
        'b2312-fecha-status'
      );

    if (existing) {
      return existing;
    }

    const root =
      document.querySelector(
        '#deudas'
      );

    if (!root) {
      return null;
    }

    const el =
      document.createElement(
        'div'
      );

    el.id =
      'b2312-fecha-status';

    el.dataset.b2312 =
      VERSION;

    el.style.cssText = [
      'display:block',
      'margin:4px 0 8px',
      'padding:6px 9px',
      'border-radius:7px',
      'font-size:11px',
      'opacity:.78'
    ].join(';');

    el.textContent =
      'B231.2 · Fecha de vencimiento activa';

    root.prepend(
      el
    );

    return el;
  }

  /*
   ------------------------------------------------------------
   CAMBIAR MODO DE FECHA
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
       * Guardamos el valor anterior.
       */

      if (
        firstPaymentControl.dataset
          .b2312PreviousValue ===
          undefined
      ) {

        firstPaymentControl.dataset
          .b2312PreviousValue =
            firstPaymentControl.value ||
            '';
      }

      /*
       * SIN FECHA
       */

      firstPaymentControl.value =
        '';

      firstPaymentControl.disabled =
        true;

      firstPaymentControl.dataset
        .b2312Temporalidad =
          'SIN_FECHA';

      firstPaymentControl.dataset
        .b2312Fecha =
          '';

      if (statusElement) {

        statusElement.textContent =
          'B231.2 · SIN FECHA · no se asignará ningún día al calendario';

      }

    } else {

      /*
       * FECHA ACTIVA
       */

      firstPaymentControl.disabled =
        false;

      firstPaymentControl.dataset
        .b2312Temporalidad =
          'FECHADA';

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

      firstPaymentControl.dataset
        .b2312Fecha =
          firstPaymentControl.value ||
          '';

      if (statusElement) {

        statusElement.textContent =
          'B231.2 · Fecha de vencimiento activa';

      }
    }

    /*
     * Evento interno.
     *
     * Permite que la lógica posterior utilice
     * el estado sin crear otra fuente de datos.
     */

    document.dispatchEvent(
      new CustomEvent(
        'b2312:fecha-mode-change',
        {
          detail: {

            sinFecha:
              undatedControl.checked,

            fecha:
              undatedControl.checked
                ? null
                : (
                    firstPaymentControl
                      .value ||
                    null
                  )

          }
        }
      )
    );
  }

  /*
   ------------------------------------------------------------
   PREPARAR ASIGNACIÓN DE FECHA
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
      date === ''
        ? null
        : date
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
      V2.normalize(
        debt
      );

    if (!normalized) {

      return {
        ok: false,
        temporalidad: 'INVALIDA'
      };

    }

    return {

      ok: true,

      temporalidad:
        normalized.fecha_vencimiento ===
        null
          ? 'SIN_FECHA'
          : 'FECHADA',

      fecha_vencimiento:
        normalized.fecha_vencimiento

    };
  }

  /*
   ------------------------------------------------------------
   GUARDADO EXPLÍCITO
   ------------------------------------------------------------

   Esta función no se ejecuta automáticamente.
   ------------------------------------------------------------
  */

  async function saveDate(
    debt,
    date
  ) {

    const PERSIST =
      window.B2311DeudasPersistencia;

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
      date === ''
        ? null
        : date
    );
  }

  /*
   ------------------------------------------------------------
   INICIALIZACIÓN
   ------------------------------------------------------------
  */

  function initialize() {

    const root =
      document.querySelector(
        '#deudas'
      );

    if (!root) {
      return false;
    }

    /*
     * Si ya existe el checkbox,
     * simplemente recuperamos sus referencias.
     */

    const existingCheckbox =
      document.getElementById(
        'b2312-sin-fecha'
      );

    if (
      existingCheckbox
    ) {

      firstPaymentControl =
        findFirstPaymentControl();

      undatedControl =
        existingCheckbox;

      statusElement =
        createStatus();

      applyDateMode();

      return true;
    }

    /*
     * Buscar campo Primera cuota.
     */

    const control =
      findFirstPaymentControl();

    if (!control) {

      console.warn(
        '[B231.2] No se encontró el control "Primera cuota".'
      );

      return false;
    }

    firstPaymentControl =
      control;

    /*
     * Crear checkbox.
     */

    undatedControl =
      createUndatedControl();

    /*
     * Crear indicador.
     */

    statusElement =
      createStatus();

    /*
     * Aplicar estado inicial.
     */

    if (
      undatedControl
    ) {
      applyDateMode();
    }

    console.info(
      '[B231.2] Formulario Deudas preparado.',
      'Control fecha:',
      firstPaymentControl
    );

    return true;
  }

  /*
   ------------------------------------------------------------
   OBSERVER
   ------------------------------------------------------------
   La interfaz existente puede reconstruir el DOM
   después de cargar las deudas o cambiar de pestaña.
   ------------------------------------------------------------
  */

  function startObserver() {

    if (observer) {
      return;
    }

    observer =
      new MutationObserver(
        function () {

          if (
            !document.getElementById(
              'b2312-sin-fecha'
            )
          ) {

            initialize();

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

    /*
     * El observer solo permanece activo durante
     * el periodo de montaje de la interfaz.
     */

    setTimeout(
      function () {

        if (observer) {

          observer.disconnect();

          observer =
            null;

        }

      },
      15000
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

    getCurrentDateControl:
      function () {
        return firstPaymentControl;
      },

    isUndated:
      function () {
        return !!(
          undatedControl &&
          undatedControl.checked
        );
      },

    rules: Object.freeze({

      emptyDateMeansNull:
        true,

      nullMeansUndated:
        true,

      undatedDebtNotCalendarized:
        true,

      assigningDateDoesNotChangeBalance:
        true,

      assigningDateDoesNotCreateMovement:
        true,

      removingDateReturnsToUndated:
        true,

      noSyntheticDate:
        true,

      noAutomaticPersistenceOnLoad:
        true

    })

  };

  /*
   ------------------------------------------------------------
   REGISTRO GLOBAL
   ------------------------------------------------------------
  */

  window.B2312DeudasFecha =
    Object.freeze(
      api
    );

  /*
   ------------------------------------------------------------
   INICIO
   ------------------------------------------------------------
  */

  if (
    document.readyState ===
    'loading'
  ) {

    document.add
