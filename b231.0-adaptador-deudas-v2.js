/* ============================================================
   B231 - MODELO DE MODALIDAD DE PAGO
   Corrección estructural:
   UNICO != 1 CUOTA
   CUOTAS = existe acuerdo de pago en cuotas
   ============================================================ */

(function () {
  'use strict';

  const VERSION = '231.0-modalidad-v2';

  function normalizarTexto(txt) {
    return String(txt || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  function encontrarFormularioDeudas() {
    const forms = Array.from(document.querySelectorAll('form'));

    return forms.find(form => {
      const texto = normalizarTexto(form.innerText);

      return (
        texto.includes('acreedor') &&
        texto.includes('monto original') &&
        texto.includes('saldo actual')
      );
    }) || null;
  }

  function encontrarCampoPorEtiqueta(form, textoBuscado) {
    const buscado = normalizarTexto(textoBuscado);

    const labels = Array.from(form.querySelectorAll('label'));

    for (const label of labels) {
      const texto = normalizarTexto(label.innerText);

      if (texto.includes(buscado)) {
        const campo = label.querySelector(
          'input, select, textarea'
        );

        if (campo) return campo;
      }
    }

    return null;
  }

  function encontrarCampoCuotas(form) {
    return (
      form.querySelector('#deudaCuotas') ||
      form.querySelector('[name="cuotas"]') ||
      form.querySelector('[name="numero_cuotas"]') ||
      encontrarCampoPorEtiqueta(form, 'numero de cuotas')
    );
  }

  function encontrarCampoCuota(form) {
    return (
      form.querySelector('#deudaCuota') ||
      form.querySelector('[name="cuota"]') ||
      form.querySelector('[name="monto_cuota"]') ||
      encontrarCampoPorEtiqueta(form, 'cuota acordada')
    );
  }

  function obtenerModalidad(form) {
    const selector = form.querySelector(
      '#deudaModalidadPago, [name="modalidad_pago"]'
    );

    return selector ? selector.value : 'UNICO';
  }

  function crearSelectorModalidad(form) {

    if (
      form.querySelector('#deudaModalidadPago') ||
      form.querySelector('[name="modalidad_pago"]')
    ) {
      return;
    }

    const cuotas = encontrarCampoCuotas(form);

    if (!cuotas) {
      console.warn(
        `[${VERSION}] No se encontró el campo Número de cuotas.`
      );
      return;
    }

    const label = document.createElement('label');

    label.id = 'deudaModalidadPagoLabel';

    label.innerHTML = `
      Modalidad de pago
      <select id="deudaModalidadPago" name="modalidad_pago">
        <option value="UNICO">Pago único</option>
        <option value="CUOTAS">En cuotas</option>
      </select>
    `;

    cuotas.closest('label')?.before(label);

    actualizarCamposModalidad(form);
  }

  function actualizarCamposModalidad(form) {

    const selector = form.querySelector('#deudaModalidadPago');

    if (!selector) return;

    const modalidad = selector.value;

    const cuotas = encontrarCampoCuotas(form);
    const montoCuota = encontrarCampoCuota(form);

    const labelCuotas = cuotas?.closest('label');
    const labelMontoCuota = montoCuota?.closest('label');

    if (modalidad === 'UNICO') {

      if (labelCuotas) {
        labelCuotas.style.display = 'none';
      }

      if (labelMontoCuota) {
        labelMontoCuota.style.display = 'none';
      }

      if (cuotas) {
        cuotas.required = false;
        cuotas.removeAttribute('min');

        /*
         * No utilizamos 1 como representación
         * de una deuda de pago único.
         */
        cuotas.value = '';
        cuotas.dataset.modalidad = 'UNICO';
      }

      if (montoCuota) {
        montoCuota.required = false;
        montoCuota.value = '';
        montoCuota.dataset.modalidad = 'UNICO';
      }

    } else {

      if (labelCuotas) {
        labelCuotas.style.display = '';
      }

      if (labelMontoCuota) {
        labelMontoCuota.style.display = '';
      }

      if (cuotas) {
        cuotas.required = true;

        if (!cuotas.getAttribute('min')) {
          cuotas.setAttribute('min', '1');
        }

        if (
          !cuotas.value ||
          Number(cuotas.value) < 1
        ) {
          cuotas.value = '1';
        }

        cuotas.dataset.modalidad = 'CUOTAS';
      }

      if (montoCuota) {
        montoCuota.required = true;
        montoCuota.dataset.modalidad = 'CUOTAS';
      }
    }

    form.dataset.modalidadPago = modalidad;
  }

  function agregarEstadoVisual(form) {

    if (form.querySelector('#b231ModalidadInfo')) {
      return;
    }

    const box = document.createElement('div');

    box.id = 'b231ModalidadInfo';

    box.style.cssText = `
      margin:10px 0;
      padding:10px 12px;
      border-radius:10px;
      background:#f3f4f6;
      font-size:13px;
      line-height:1.4;
    `;

    box.innerHTML = `
      <strong>B231 · Modelo de deuda</strong>
      <div id="b231ModalidadTexto">
        Selecciona la modalidad de pago.
      </div>
    `;

    const selector = form.querySelector('#deudaModalidadPago');

    selector?.closest('label')?.after(box);
  }

  function actualizarMensajeModalidad(form) {

    const selector = form.querySelector('#deudaModalidadPago');

    const texto = form.querySelector('#b231ModalidadTexto');

    if (!selector || !texto) return;

    if (selector.value === 'UNICO') {

      texto.innerHTML = `
        <strong>Pago único:</strong>
        esta deuda no tendrá un plan de cuotas.
        Si posteriormente necesitas pagar parcialmente,
        podrá registrarse un abono o renegociarse.
      `;

    } else {

      texto.innerHTML = `
        <strong>En cuotas:</strong>
        existe un acuerdo de pago.
        La deuda tendrá número de cuotas, monto de cuota
        y calendario asociado cuando corresponda.
      `;
    }
  }

  function instalar() {

    const form = encontrarFormularioDeudas();

    if (!form) {
      return false;
    }

    crearSelectorModalidad(form);
    agregarEstadoVisual(form);

    const selector = form.querySelector('#deudaModalidadPago');

    if (!selector) {
      return false;
    }

    if (!selector.dataset.b231Bound) {

      selector.dataset.b231Bound = '1';

      selector.addEventListener('change', () => {

        actualizarCamposModalidad(form);
        actualizarMensajeModalidad(form);

      });
    }

    actualizarCamposModalidad(form);
    actualizarMensajeModalidad(form);

    /*
     * CAPTURE:
     * se ejecuta antes de los handlers normales
     * del formulario existente.
     *
     * Esto permite normalizar los datos antes
     * de que el motor original los procese.
     */
    if (!form.dataset.b231SubmitBound) {

      form.dataset.b231SubmitBound = '1';

      form.addEventListener(
        'submit',
        () => {

          const modalidad = selector.value;

          form.dataset.modalidadPago = modalidad;

          const cuotas = encontrarCampoCuotas(form);
          const montoCuota = encontrarCampoCuota(form);

          if (modalidad === 'UNICO') {

            /*
             * CRÍTICO:
             * una deuda UNICO jamás se representa
             * como una cuota.
             */
            if (cuotas) {
              cuotas.value = '';
              cuotas.required = false;
              cuotas.dataset.modalidad = 'UNICO';
            }

            if (montoCuota) {
              montoCuota.value = '';
              montoCuota.required = false;
              montoCuota.dataset.modalidad = 'UNICO';
            }

          } else {

            if (
              cuotas &&
              (!cuotas.value || Number(cuotas.value) < 1)
            ) {
              cuotas.value = '1';
            }

            if (cuotas) {
              cuotas.dataset.modalidad = 'CUOTAS';
            }

            if (montoCuota) {
              montoCuota.dataset.modalidad = 'CUOTAS';
            }
          }

        },
        true
      );
    }

    return true;
  }

  /*
   * El módulo Deudas puede renderizarse después
   * de la carga inicial.
   */
  const observer = new MutationObserver(() => {

    const ok = instalar();

    if (ok) {
      window.clearTimeout(window.__b231Retry);
    }

  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  /*
   * Primer intento.
   */
  instalar();

  /*
   * Reintentos controlados.
   */
  let intentos = 0;

  function reintentar() {

    if (intentos >= 20) {
      return;
    }

    intentos++;

    if (!instalar()) {
      window.__b231Retry = setTimeout(
        reintentar,
        500
      );
    }
  }

  reintentar();

  window.B231ModalidadDeuda = {
    version: VERSION,

    obtenerModalidad(form) {
      return obtenerModalidad(
        form || encontrarFormularioDeudas()
      );
    },

    refrescar() {
      instalar();
    }
  };

  console.log(
    `[${VERSION}] Modelo de modalidad de pago activo.`
  );

})();
