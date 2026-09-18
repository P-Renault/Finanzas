/* ============================================================
   B231.2 — DEUDAS V2
   ASIGNACIÓN / EDICIÓN DE FECHA DE VENCIMIENTO

   CORRECCIÓN UI
   ============================================================

   OBJETIVO:
   - Mantener un único archivo B231.2.
   - Mostrar físicamente "Deuda sin fecha de vencimiento".
   - Trabajar sobre el formulario Deudas existente.
   - No crear tablas.
   - No crear cliente Supabase.
   - No modificar saldos.
   - No crear movimientos.
   - No modificar los botones existentes.

   COMPORTAMIENTO:

       Fecha de vencimiento
              ↓
       ┌──────────────────────────┐
       │ 18/09/2026               │
       └──────────────────────────┘
       ☐ Deuda sin fecha de vencimiento

       AL MARCAR:

       ☑ Deuda sin fecha de vencimiento
       → campo fecha vacío
       → campo deshabilitado
       → estado interno SIN_FECHA

   ============================================================ */

(function () {

  'use strict';

  const VERSION = '231.2.2';

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
      '[B231.2] Ya estaba inicializado.'
    );

    return;
  }

  /*
   ------------------------------------------------------------
   DEPENDENCIA B231.0
   ------------------------------------------------------------
  */

  const V2 =
    window.B231DeudasV2 || null;

  /*
   No detenemos completamente el módulo si B231.0
   no está disponible.

   La interfaz puede seguir mostrando el control.
   */

  /*
   ------------------------------------------------------------
   VARIABLES
   ------------------------------------------------------------
  */

  let rootDeudas = null;

  let firstPaymentControl = null;

  let undatedControl = null;

  let wrapper = null;

  let statusElement = null;

  let observer = null;

  let initializing = false;

  /*
   ------------------------------------------------------------
   UTILIDAD DE TEXTO
   ------------------------------------------------------------
  */

  function normalizeText(value) {

    return String(value || '')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();

  }

  /*
   ------------------------------------------------------------
   LOCALIZAR CONTENEDOR DE DEUDAS
   ------------------------------------------------------------
  */

  function findDeudasRoot() {

    const candidates = [

      document.getElementById(
        'deudas'
      ),

      document.querySelector(
        '[data-tab="deudas"]'
      ),

      document.querySelector(
        '[data-section="deudas"]'
      ),

      document.querySelector(
        '.deudas'
      )

    ];

    for (
      const candidate of candidates
    ) {

      if (candidate) {

        return candidate;

      }

    }

    return null;

  }

  /*
   ------------------------------------------------------------
   BUSCAR TEXTO "PRIMERA CUOTA"
   ------------------------------------------------------------
  */

  function findFirstPaymentTextNode() {

    if (!rootDeudas) {
      return null;
    }

    const elements =
      Array.from(
        rootDeudas.querySelectorAll(
          '*'
        )
      );

    /*
     Primero buscamos coincidencia exacta.
     */

    for (
      const element of elements
    ) {

      if (
        element.children.length === 0 &&
        normalizeText(
          element.textContent
        ) === 'primera cuota'
      ) {

        return element;

      }

    }

    /*
     Segunda búsqueda: texto que contenga
     "Primera cuota".
     */

    for (
      const element of elements
    ) {

      if (
        element.children.length === 0 &&
        normalizeText(
          element.textContent
        ).includes(
          'primera cuota'
        )
      ) {

        return element;

      }

    }

    return null;

  }

  /*
   ------------------------------------------------------------
   BUSCAR CONTROL DE PRIMERA CUOTA
   ------------------------------------------------------------
  */

  function findFirstPaymentControl() {

    if (!rootDeudas) {
      return null;
    }

    /*
     * 1. Buscar por texto "Primera cuota".
     */

    const textNode =
      findFirstPaymentTextNode();

    if (textNode) {

      /*
       * Revisar hermanos.
       */

      let sibling =
        textNode.nextElementSibling;

      if (sibling) {

        const directControl =
          sibling.matches(
            'input, select, textarea'
          )
            ? sibling
            : sibling.querySelector(
                'input, select, textarea'
              );

        if (directControl) {

          return directControl;

        }

      }

      /*
       * Revisar el padre.
       */

      let parent =
        textNode.parentElement;

      for (
        let level = 0;
        level < 5 && parent;
        level++
      ) {

        const controls =
          Array.from(
            parent.querySelectorAll(
              'input, select, textarea'
            )
          );

        /*
         * Si hay un único control,
         * es muy probablemente el correspondiente.
         */

        if (
          controls.length === 1
        ) {

          return controls[0];

        }

        /*
         * Priorizar controles de fecha.
         */

        const dateControl =
          controls.find(
            control => {

              const type =
                normalizeText(
                  control.type
                );

              return (
                type === 'date' ||
                control.tagName ===
                  'SELECT'
              );

            }
          );

        if (dateControl) {

          return dateControl;

        }

        parent =
          parent.parentElement;

      }

    }

    /*
     * 2. Buscar todos los controles de fecha.
     *
     * En la estructura actual aparecen:
     *
     * Fecha de inicio
     * Primera cuota
     *
     * Por eso el segundo control de fecha
     * corresponde a Primera cuota.
     */

    const dateInputs =
      Array.from(
        rootDeudas.querySelectorAll(
          'input[type="date"]'
        )
      );

    if (
      dateInputs.length >= 2
    ) {

      return dateInputs[1];

    }

    /*
     * 3. Selects que podrían representar
     * las fechas en la implementación actual.
     */

    const selects =
      Array.from(
        rootDeudas.querySelectorAll(
          'select'
        )
      );

    /*
     * No utilizamos cualquier select
     * automáticamente porque existen otros
     * campos como tipo de acreedor y frecuencia.
     */

    const possibleDateSelect =
      selects.find(
        select => {

          const options =
            Array.from(
              select.options || []
            );

          return options.some(
            option =>
              /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(
                String(
                  option.textContent ||
                  option.value ||
                  ''
                ).trim()
              )
          );

        }
      );

    if (
      possibleDateSelect
    ) {

      return possibleDateSelect;

    }

    return null;

  }

  /*
   ------------------------------------------------------------
   ENCONTRAR LUGAR DE INSERCIÓN
   ------------------------------------------------------------
  */

  function findInsertionPoint(
    control
  ) {

    if (!control) {
      return null;
    }

    /*
     * Preferimos insertar inmediatamente después
     * del propio control.
     */

    return control;

  }

  /*
   ------------------------------------------------------------
   CREAR INTERFAZ
   ------------------------------------------------------------
  */

  function createUI() {

    /*
     * Evitar duplicados.
     */

    const existing =
      document.getElementById(
        'b2312-fecha-wrapper'
      );

    if (existing) {

      wrapper =
        existing;

      undatedControl =
        document.getElementById(
          'b2312-sin-fecha'
        );

      return true;

    }

    if (
      !firstPaymentControl
    ) {

      return false;

    }

    /*
     * Contenedor.
     */

    wrapper =
      document.createElement(
        'div'
      );

    wrapper.id =
      'b2312-fecha-wrapper';

    wrapper.setAttribute(
      'data-b2312',
      VERSION
    );

    /*
     * CSS deliberadamente explícito
     * para evitar que estilos existentes
     * oculten el componente.
     */

    wrapper.style.cssText = [
      'display:block',
      'visibility:visible',
      'opacity:1',
      'position:relative',
      'width:100%',
      'box-sizing:border-box',
      'clear:both',
      'float:none',
      'margin:8px 0 0 0',
      'padding:10px 12px',
      'border:1px solid #d5d9e0',
      'border-radius:8px',
      'background:#f7f8fa',
      'z-index:2'
    ].join(';');

    /*
     * Label.
     */

    const label =
      document.createElement(
        'label'
      );

    label.setAttribute(
      'for',
      'b2312-sin-fecha'
    );

    label.style.cssText = [
      'display:flex',
      'visibility:visible',
      'opacity:1',
      'align-items:center',
      'gap:9px',
      'width:100%',
      'min-height:24px',
      'box-sizing:border-box',
      'cursor:pointer',
      'font-size:13px',
      'font-weight:500',
      'color:#20252d',
      'margin:0',
      'padding:0'
    ].join(';');

    /*
     * Checkbox.
     */

    undatedControl =
      document.createElement(
        'input'
      );

    undatedControl.type =
      'checkbox';

    undatedControl.id =
      'b2312-sin-fecha';

    undatedControl.name =
      'b2312_sin_fecha';

    undatedControl.value =
      'true';

    undatedControl.style.cssText = [
      'display:block',
      'visibility:visible',
      'opacity:1',
      'width:18px',
      'height:18px',
      'min-width:18px',
      'min-height:18px',
      'margin:0',
      'padding:0',
      'cursor:pointer',
      'accent-color:#111827'
    ].join(';');

    /*
     * Texto.
     */

    const text =
      document.createElement(
        'span'
      );

    text.textContent =
      'Deuda sin fecha de vencimiento';

    text.style.cssText = [
      'display:block',
      'visibility:visible',
      'opacity:1',
      'color:#20252d',
      'font
