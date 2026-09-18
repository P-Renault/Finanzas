/* ============================================================
   B231.0 — ADAPTADOR DEUDAS V2
   Control Financiero
   Versión estable de referencia
   ============================================================ */

(function () {
  'use strict';

  const VERSION = '231.0';

  /* ------------------------------------------------------------
     API GLOBAL
     ------------------------------------------------------------ */

  const B231DeudasV2 = {

    version: VERSION,

    /* ----------------------------------------------------------
       NORMALIZACIÓN DE UNA DEUDA
       ---------------------------------------------------------- */

    normalizarDeuda(deuda) {

      if (!deuda || typeof deuda !== 'object') {
        return null;
      }

      const resultado = { ...deuda };

      resultado.id = deuda.id ?? null;

      resultado.acreedor =
        deuda.acreedor ??
        deuda.nombre ??
        deuda.concepto ??
        '';

      resultado.monto_original = Number(
        deuda.monto_original ??
        deuda.monto ??
        0
      );

      resultado.saldo_pendiente = Number(
        deuda.saldo_pendiente ??
        deuda.saldo_actual ??
        deuda.saldo ??
        resultado.monto_original
      );

      /*
       * IMPORTANTE:
       * NULL / vacío significa deuda SIN FECHA.
       *
       * No se inventa una fecha.
       * No se asigna la fecha actual.
       * No se envía al calendario.
       */
      if (
        deuda.fecha_vencimiento === null ||
        deuda.fecha_vencimiento === undefined ||
        deuda.fecha_vencimiento === ''
      ) {
        resultado.fecha_vencimiento = null;
        resultado.sin_fecha = true;
      } else {
        resultado.fecha_vencimiento = deuda.fecha_vencimiento;
        resultado.sin_fecha = false;
      }

      resultado.estado =
        deuda.estado ??
        (resultado.saldo_pendiente <= 0
          ? 'PAGADA'
          : 'PENDIENTE');

      resultado.prioridad =
        deuda.prioridad ??
        'NORMAL';

      resultado.cuotas =
        Number(deuda.cuotas ?? deuda.numero_cuotas ?? 0);

      resultado.cuotas_pendientes =
        Number(deuda.cuotas_pendientes ?? 0);

      resultado.monto_cuota =
        Number(deuda.monto_cuota ?? deuda.cuota_acordada ?? 0);

      resultado.descripcion =
        deuda.descripcion ??
        deuda.notas ??
        '';

      return resultado;
    },


    /* ----------------------------------------------------------
       VALIDACIÓN
       ---------------------------------------------------------- */

    validarDeuda(deuda) {

      const d = this.normalizarDeuda(deuda);

      if (!d) {
        return {
          valido: false,
          errores: ['La deuda no es válida.']
        };
      }

      const errores = [];

      if (!d.acreedor) {
        errores.push('La deuda debe tener acreedor o concepto.');
      }

      if (d.monto_original < 0) {
        errores.push('El monto original no puede ser negativo.');
      }

      if (d.saldo_pendiente < 0) {
        errores.push('El saldo pendiente no puede ser negativo.');
      }

      /*
       * La fecha de vencimiento es OPCIONAL.
       */
      if (d.fecha_vencimiento !== null) {

        const fecha = new Date(d.fecha_vencimiento);

        if (Number.isNaN(fecha.getTime())) {
          errores.push('La fecha de vencimiento no es válida.');
        }
      }

      return {
        valido: errores.length === 0,
        errores
      };
    },


    /* ----------------------------------------------------------
       PREPARACIÓN DE FECHA
       ---------------------------------------------------------- */

    prepararFecha(deuda) {

      const d = this.normalizarDeuda(deuda);

      if (!d) {
        return null;
      }

      /*
       * SIN FECHA:
       * jamás generar una fecha artificial.
       */
      if (d.sin_fecha) {
        return null;
      }

      return d.fecha_vencimiento;
    },


    /* ----------------------------------------------------------
       DETERMINAR SI DEBE APARECER EN CALENDARIO
       ---------------------------------------------------------- */

    debeAparecerEnCalendario(deuda) {

      const d = this.normalizarDeuda(deuda);

      if (!d) {
        return false;
      }

      /*
       * Una deuda sin fecha existe financieramente,
       * pero no pertenece a ningún día del calendario.
       */
      if (d.fecha_vencimiento === null) {
        return false;
      }

      if (d.estado === 'PAGADA') {
        return false;
      }

      return true;
    },


    /* ----------------------------------------------------------
       ABONO PARCIAL — PREPARACIÓN
       ---------------------------------------------------------- */

    prepararAbono(deuda, monto) {

      const d = this.normalizarDeuda(deuda);

      if (!d) {
        return {
          valido: false,
          error: 'Deuda inválida.'
        };
      }

      const importe = Number(monto);

      if (!Number.isFinite(importe) || importe <= 0) {
        return {
          valido: false,
          error: 'El monto del abono debe ser mayor que cero.'
        };
      }

      if (importe > d.saldo_pendiente) {
        return {
          valido: false,
          error: 'El abono no puede superar el saldo pendiente.'
        };
      }

      const nuevoSaldo =
        d.saldo_pendiente - importe;

      return {
        valido: true,
        deuda_id: d.id,
        monto_abono: importe,
        saldo_anterior: d.saldo_pendiente,
        saldo_nuevo: nuevoSaldo,
        estado_nuevo:
          nuevoSaldo <= 0
            ? 'PAGADA'
            : 'PENDIENTE'
      };
    },


    /* ----------------------------------------------------------
       RESUMEN
       ---------------------------------------------------------- */

    resumenDeuda(deuda) {

      const d = this.normalizarDeuda(deuda);

      if (!d) {
        return null;
      }

      return {
        id: d.id,
        acreedor: d.acreedor,
        monto_original: d.monto_original,
        saldo_pendiente: d.saldo_pendiente,
        fecha_vencimiento: d.fecha_vencimiento,
        sin_fecha: d.sin_fecha,
        estado: d.estado,
        cuotas: d.cuotas,
        cuotas_pendientes: d.cuotas_pendientes,
        monto_cuota: d.monto_cuota,
        aparece_en_calendario:
          this.debeAparecerEnCalendario(d)
      };
    },


    /* ----------------------------------------------------------
       PERSISTENCIA
       ----------------------------------------------------------
       Este adaptador NO reemplaza el motor de persistencia
       existente. Solo prepara y normaliza los datos.
       ---------------------------------------------------------- */

    persistir(deuda) {

      console.warn(
        '[B231.0] Persistencia delegada al motor existente.'
      );

      return this.normalizarDeuda(deuda);
    }
  };


  /* ------------------------------------------------------------
     EXPOSICIÓN GLOBAL
     ------------------------------------------------------------ */

  window.B231DeudasV2 = B231DeudasV2;


  /* ------------------------------------------------------------
     INDICADOR VISUAL NO INTRUSIVO
     ------------------------------------------------------------ */

  function instalarIndicador() {

    if (document.getElementById('b231-indicador-deudas')) {
      return;
    }

    const indicador = document.createElement('div');

    indicador.id = 'b231-indicador-deudas';

    indicador.textContent =
      'Deudas V2 · adaptador B231.0 activo · compatibilidad estable';

    indicador.style.cssText = `
      position: fixed;
      right: 12px;
      bottom: 12px;
      z-index: 9999;
      padding: 7px 10px;
      border-radius: 8px;
      background: rgba(20,20,20,.88);
      color: #fff;
      font-size: 11px;
      line-height: 1.2;
      font-family: Arial, sans-serif;
      box-shadow: 0 2px 8px rgba(0,0,0,.2);
      pointer-events: none;
    `;

    document.body.appendChild(indicador);
  }


  /* ------------------------------------------------------------
     INICIALIZACIÓN SEGURA
     ------------------------------------------------------------ */

  if (document.readyState === 'loading') {

    document.addEventListener(
      'DOMContentLoaded',
      instalarIndicador,
      { once: true }
    );

  } else {

    instalarIndicador();

  }


  console.log(
    '[B231.0] Adaptador Deudas V2 activo.'
  );

})();
