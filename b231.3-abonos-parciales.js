/* ============================================================
   B231.7 — CIERRE TÉCNICO DEL MOTOR DE DEUDAS
   VERSIÓN 231.7.0
   Persistencia real: abono -> movimiento -> pago_deuda -> saldo
   No depende de un listener externo para guardar el abono.
   ============================================================ */
(() => {
  'use strict';

  const VERSION = '231.7.0';
  if (window.B2313AbonosParciales?.version === VERSION) return;

  const $ = id => document.getElementById(id);
  let modal = null;
  let currentDebt = null;
  let observer = null;
  let installing = false;

  const text = v => String(v ?? '').replace(/\s+/g, ' ').trim();
  const lower = v => text(v).toLowerCase();

  function moneyValue(v) {
    if (typeof v === 'number') return Number.isFinite(v) ? v : 0;
    let s = String(v ?? '').replace(/\$/g, '').replace(/\s/g, '').trim();
    if (!s) return 0;
    s = s.replace(/\./g, '').replace(',', '.');
    const n = Number(s);
    return Number.isFinite(n) ? n : 0;
  }

  const money = n =>
    '$' + Math.round(moneyValue(n)).toLocaleString('es-CL');

  const today = () => {
    const d = new Date();
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
      .toISOString().slice(0, 10);
  };

  async function db() {
    if (window.supabaseClient) return window.supabaseClient;
    if (window.db && typeof window.db === 'function') {
      try {
        const c = await window.db();
        if (c) return c;
      } catch (_) {}
    }
    const u = localStorage.getItem('sf_url');
    const k = localStorage.getItem('sf_key');
    if (!u || !k || !window.supabase) return null;
    return window.supabase.createClient(u, k);
  }

  function findDebtCard(button) {
    let el = button?.parentElement || null;
    for (let i = 0; i < 10 && el; i++, el = el.parentElement) {
      const s = lower(el.textContent);
      if (
        s.includes('saldo actual') &&
        s.includes('ver detalle') &&
        s.includes('editar') &&
        s.includes('eliminar')
      ) return el;
    }
    return null;
  }

  function creditor(card) {
    const h = card?.querySelector('h3,h4,strong');
    const v = text(h?.textContent);
    return v || 'Deuda';
  }

  function balanceFromCard(card) {
    const nodes = Array.from(card?.querySelectorAll('*') || []);
    for (const n of nodes) {
      if (n.children.length === 0 && lower(n.textContent) === 'saldo actual') {
        let p = n.parentElement;
        for (let i = 0; i < 5 && p; i++, p = p.parentElement) {
          const m = text(p.textContent).match(/\$\s*[\d.]+(?:,\d+)?/);
          if (m) return moneyValue(m[0]);
        }
      }
    }
    const all = text(card?.textContent).match(/\$\s*[\d.]+(?:,\d+)?/g);
    return all?.length ? moneyValue(all[0]) : 0;
  }

  function debtFromButton(button) {
    const card = findDebtCard(button);
    if (!card) return null;

    const edit = card.querySelector('button[onclick*="editarDeuda23"]');
    const m = (edit?.getAttribute('onclick') || '').match(/editarDeuda23\((\d+)\)/);
    const id = m ? Number(m[1]) : null;
    const saldo = balanceFromCard(card);

    if (!id || saldo <= 0) return null;

    return {
      id,
      acreedor: creditor(card),
      saldo_actual: saldo,
      card
    };
  }

  function closeModal() {
    modal?.remove();
    modal = null;
    currentDebt = null;
  }

  function showMessage(node, ok, msg) {
    node.style.display = 'block';
    node.style.padding = '10px';
    node.style.borderRadius = '8px';
    node.style.marginBottom = '12px';
    node.style.fontSize = '12px';
    node.style.background = ok ? '#ecfdf5' : '#fef2f2';
    node.style.color = ok ? '#065f46' : '#991b1b';
    node.textContent = msg;
  }

  async function persistPartialPayment(debt, amount, description) {
    const c = await db();
    if (!c) throw new Error('No hay conexión con Supabase.');

    const dr = await c
      .from('deudas')
      .select('id,acreedor,saldo_actual,monto_original,estado')
      .eq('id', debt.id)
      .single();

    if (dr.error) throw dr.error;
    if (!dr.data) throw new Error('No se encontró la deuda.');

    const currentBalance = Number(dr.data.saldo_actual || 0);
    if (amount <= 0) throw new Error('El monto del abono debe ser mayor que $0.');
    if (amount > currentBalance) {
      throw new Error('El abono no puede superar el saldo de ' + money(currentBalance) + '.');
    }

    /* Obtener la próxima cuota pendiente, si existe. */
    const qr = await c
      .from('cuotas_deuda')
      .select('id,monto,numero_cuota,estado,fecha_vencimiento')
      .eq('deuda_id', debt.id)
      .in('estado', ['pendiente','vencida'])
      .order('numero_cuota', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (qr.error) throw qr.error;

    const quota = qr.data || null;
    const newBalance = currentBalance - amount;
    let movementId = null;
    let paymentId = null;

    /* 1. Movimiento real: el abono es gasto, no ingreso ni transferencia. */
    const mr = await c
      .from('movimientos')
      .insert({
        tipo: 'gasto',
        fecha: today(),
        monto: amount,
        categoria: 'Deuda',
        descripcion: `${dr.data.acreedor || debt.acreedor} — ${description || 'Abono a deuda'}`
      })
      .select('id')
      .single();

    if (mr.error) throw mr.error;
    movementId = mr.data.id;

    try {
      /* 2. Registrar el pago asociado a la próxima cuota cuando existe. */
      if (quota) {
        const pr = await c
          .from('pagos_deuda')
          .insert({
            cuota_id: quota.id,
            fecha_pago: today(),
            monto: amount,
            movimiento_id: movementId
          })
          .select('id')
          .single();

        if (pr.error) throw pr.error;
        paymentId = pr.data.id;
      }

      /* 3. Actualizar saldo de la deuda. */
      const ur = await c
        .from('deudas')
        .update({
          saldo_actual: newBalance,
          estado: newBalance === 0 ? 'pagada' : dr.data.estado
        })
        .eq('id', debt.id)
        .eq('saldo_actual', currentBalance);

      if (ur.error) throw ur.error;

      /* 4. Si el abono cubre completamente la cuota, marcarla pagada. */
      if (quota && amount >= Number(quota.monto || 0)) {
        const qU = await c
          .from('cuotas_deuda')
          .update({
            estado: 'pagada',
            fecha_pago: today()
          })
          .eq('id', quota.id);

        if (qU.error) throw qU.error;
      }

      /* 5. Verificación de persistencia. */
      const verify = await c
        .from('deudas')
        .select('saldo_actual,estado')
        .eq('id', debt.id)
        .single();

      if (verify.error) throw verify.error;

      const persistedBalance = Number(verify.data.saldo_actual || 0);
      if (Math.round(persistedBalance) !== Math.round(newBalance)) {
        throw new Error(
          `ERROR DE PERSISTENCIA: se esperaba ${money(newBalance)} y Supabase confirmó ${money(persistedBalance)}.`
        );
      }

      return {
        movementId,
        paymentId,
        quota,
        saldo_anterior: currentBalance,
        saldo_nuevo: newBalance,
        pago_total: newBalance === 0
      };

    } catch (error) {
      /* Compensación: evitar dejar un movimiento/pago huérfano. */
      try {
        if (paymentId) {
          await c.from('pagos_deuda').delete().eq('id', paymentId);
        }
        await c
          .from('deudas')
          .update({ saldo_actual: currentBalance, estado: dr.data.estado })
          .eq('id', debt.id);
        if (quota && amount >= Number(quota.monto || 0)) {
          await c
            .from('cuotas_deuda')
            .update({ estado: quota.estado, fecha_pago: null })
            .eq('id', quota.id);
        }
        if (movementId) {
          await c.from('movimientos').delete().eq('id', movementId);
        }
      } catch (_) {}
      throw error;
    }
  }

  function open(debt) {
    closeModal();
    if (!debt) return;
    currentDebt = debt;

    const overlay = document.createElement('div');
    overlay.id = 'b2313-abono-modal';
    overlay.style.cssText = `
      position:fixed;inset:0;z-index:999999;display:flex;
      align-items:center;justify-content:center;padding:18px;
      box-sizing:border-box;background:rgba(0,0,0,.60);
    `;

    const box = document.createElement('div');
    box.style.cssText = `
      width:min(430px,100%);max-height:90vh;overflow:auto;
      background:#fff;border-radius:14px;padding:20px;
      box-sizing:border-box;box-shadow:0 20px 70px rgba(0,0,0,.30);
    `;

    box.innerHTML = `
      <h3 style="margin:0 0 8px;color:#111827;font-size:20px">Registrar abono</h3>
      <div style="font-weight:700;color:#111827;margin-bottom:4px" id="b2313Creditor"></div>
      <div style="color:#6b7280;font-size:13px;margin-bottom:18px" id="b2313Balance"></div>
      <label style="display:block;color:#111827;font-size:13px;font-weight:600;margin-bottom:6px">
        Monto del abono
      </label>
      <input id="b2313Amount" type="number" min="1" step="1" inputmode="numeric"
        style="width:100%;box-sizing:border-box;padding:12px;border:1px solid #d1d5db;border-radius:8px;font-size:16px;margin-bottom:6px">
      <div style="color:#6b7280;font-size:12px;margin-bottom:14px" id="b2313Max"></div>
      <input id="b2313Description" type="text" value="Abono a deuda"
        style="width:100%;box-sizing:border-box;padding:11px;border:1px solid #d1d5db;border-radius:8px;font-size:14px;margin-bottom:14px">
      <div id="b2313Message" style="display:none"></div>
      <div style="display:flex;justify-content:flex-end;gap:8px">
        <button type="button" id="b2313Cancel" style="border:0;border-radius:8px;padding:10px 14px;background:#e5e7eb;color:#111827;font-weight:600">Cancelar</button>
        <button type="button" id="b2313Confirm" style="border:0;border-radius:8px;padding:10px 14px;background:#111827;color:#fff;font-weight:600">Registrar abono</button>
      </div>
    `;

    overlay.appendChild(box);
    document.body.appendChild(overlay);
    modal = overlay;

    $('b2313Creditor').textContent = debt.acreedor;
    $('b2313Balance').textContent = 'Saldo pendiente: ' + money(debt.saldo_actual);
    $('b2313Max').textContent = 'Máximo permitido: ' + money(debt.saldo_actual);
    $('b2313Amount').max = String(debt.saldo_actual);

    $('b2313Cancel').onclick = closeModal;
    overlay.addEventListener('click', e => {
      if (e.target === overlay) closeModal();
    });

    $('b2313Confirm').onclick = async () => {
      const btn = $('b2313Confirm');
      const message = $('b2313Message');
      const amount = moneyValue($('b2313Amount').value);
      const description = $('b2313Description').value.trim();

      if (amount <= 0) {
        showMessage(message, false, 'El monto del abono debe ser mayor que $0.');
        return;
      }

      if (amount > Number(currentDebt.saldo_actual || 0)) {
        showMessage(message, false,
          'El abono no puede superar el saldo de ' + money(currentDebt.saldo_actual) + '.');
        return;
      }

      btn.disabled = true;
      btn.textContent = 'Registrando…';

      try {
        const result = await persistPartialPayment(
          currentDebt,
          amount,
          description
        );

        showMessage(
          message,
          true,
          result.pago_total
            ? `Abono registrado correctamente. La deuda quedó pagada: ${money(result.saldo_nuevo)}.`
            : `Abono registrado correctamente. Nuevo saldo: ${money(result.saldo_nuevo)}.`
        );

        /* Cerrar el modal después de persistir. */
        setTimeout(async () => {
          closeModal();

          /* Refrescar la aplicación sin crear otra sesión ni otro cliente. */
          try {
            if (typeof window.refresh === 'function') {
              await window.refresh();
            } else {
              document.querySelector('.tabs button[data-tab="deudas"]')?.click();
              setTimeout(() => location.reload(), 250);
            }
          } catch (_) {
            location.reload();
          }
        }, 350);

      } catch (error) {
        showMessage(message, false,
          error?.message || String(error));
        btn.disabled = false;
        btn.textContent = 'Registrar abono';
      }
    };

    setTimeout(() => $('b2313Amount')?.focus(), 50);
  }

  function installOne(paymentButton) {
    if (!paymentButton) return;
    const parent = paymentButton.parentElement;
    if (!parent || parent.querySelector('[data-b2313-abono="true"]')) return;

    const debt = debtFromButton(paymentButton);
    if (!debt) return;

    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = 'Registrar abono';
    button.dataset.b2313Abono = 'true';
    button.style.cssText = `
      background:#111827;color:#fff;border:0;border-radius:8px;
      padding:9px 12px;font-size:12px;font-weight:600;
      cursor:pointer;white-space:nowrap;margin:2px;
    `;

    button.onclick = event => {
      event.preventDefault();
      event.stopPropagation();
      const current = debtFromButton(paymentButton);
      open(current);
    };

    parent.insertBefore(button, paymentButton);
  }

  function install() {
    if (installing) return;
    installing = true;
    try {
      const buttons = Array.from(document.querySelectorAll('button')).filter(b => {
        const s = lower(b.textContent);
        return s.includes('pagar próxima cuota') ||
               s.includes('registrar pago único');
      });
      buttons.forEach(installOne);
    } finally {
      installing = false;
    }
  }

  function startObserver() {
    if (observer) return;
    observer = new MutationObserver(() => setTimeout(() => { install(); dedupePaymentButtons(); dedupeAllPaymentButtons(); }, 30));
    const root = $('deudas');
    if (root) observer.observe(root, {childList:true, subtree:true});
  }

  const api = Object.freeze({
    version: VERSION,
    open,
    close: closeModal,
    install,
    persistPartialPayment,
    rules: Object.freeze({
      amountMustBePositive: true,
      amountCannotExceedBalance: true,
      originalAmountImmutable: true,
      partialPaymentReducesBalance: true,
      zeroBalanceMeansPaid: true,
      doesNotCreateIncome: true,
      doesNotCreateTransfer: true,
      createsRealExpenseMovement: true,
      persistsDebtBalance: true
    })
  });

  window.B2313AbonosParciales = api;

  /* ============================================================
     B231.7 — UNIFICACIÓN DE ACCIONES DE DEUDA
     Elimina botones de pago duplicados producidos por la doble
     carga de B220/B220.1. No elimina la acción de abono.
     ============================================================ */
  function dedupeAllPaymentButtons() {
    const candidates = Array.from(document.querySelectorAll('button')).filter(b => {
      const t = lower(b.textContent);
      return t === 'pagar próxima cuota' || t === 'registrar pago único';
    });
    const seenByDebt = new WeakMap();
    candidates.forEach(b => {
      const card = b.closest('.debt-card') || b.closest('[data-debt-id]') || b.parentElement;
      if (!card) return;
      if (!seenByDebt.has(card)) seenByDebt.set(card, new Set());
      const seen = seenByDebt.get(card);
      const key = lower(b.textContent);
      if (seen.has(key)) b.remove();
      else seen.add(key);
    });
  }

  function dedupePaymentButtons() {
    document.querySelectorAll('.debt-card').forEach(card => {
      const actions = card.querySelector('.form-actions') || card;
      const buttons = Array.from(actions.querySelectorAll('button')).filter(b => {
        const t = lower(b.textContent);
        return t === 'pagar próxima cuota' ||
               t === 'registrar pago único';
      });

      const seen = new Set();
      buttons.forEach(b => {
        const key = lower(b.textContent);
        if (seen.has(key)) {
          b.remove();
          return;
        }
        seen.add(key);
      });
    });
  }

  /*
   * B231.7 — eliminación segura de deuda con historial.
   *
   * No se eliminan movimientos vinculados automáticamente. La razón
   * es preservar la trazabilidad financiera y evitar que el trigger
   * de conciliación B2.10 intente resolver un pago que ya fue borrado.
   * El historial de movimiento queda intacto. Si la base de datos rechaza
   * la eliminación por una dependencia histórica, la operación se detiene
   * sin borrar información adicional.
   */
  async function deleteDebtSafely(id) {
    if (!confirm(
      '¿Eliminar esta deuda, sus planes, cuotas y pagos asociados?\n\n' +
      'Los movimientos financieros ya registrados se conservarán para no romper la trazabilidad.'
    )) return;

    const u = localStorage.getItem('sf_url');
    const k = localStorage.getItem('sf_key');
    if (!u || !k || !window.supabase) {
      alert('No hay conexión con Supabase.');
      return;
    }

    const c = window.supabase.createClient(u, k, {
      auth: { persistSession:false, autoRefreshToken:false }
    });

    try {
      const qr = await c.from('cuotas_deuda').select('id').eq('deuda_id', id);
      if (qr.error) throw qr.error;
      const quotaIds = (qr.data || []).map(x => x.id).filter(Boolean);

      /* Desvincular el movimiento antes de eliminar el pago. */
      if (quotaIds.length) {
        const pr = await c.from('pagos_deuda')
          .select('id,cuota_id,movimiento_id')
          .in('cuota_id', quotaIds);
        if (pr.error) throw pr.error;

        const payments = pr.data || [];
        const paymentIds = payments.map(x => x.id).filter(Boolean);

        /*
         * Primero anulamos la referencia al movimiento. Esto evita que
         * la eliminación del pago deje una referencia inconsistente.
         */
        if (paymentIds.length) {
          const un = await c.from('pagos_deuda')
            .update({ movimiento_id:null })
            .in('id', paymentIds);
          if (un.error) throw un.error;

          const pd = await c.from('pagos_deuda')
            .delete()
            .in('id', paymentIds);
          if (pd.error) throw pd.error;
        }
      }

      const qd = await c.from('cuotas_deuda').delete().eq('deuda_id', id);
      if (qd.error) throw qd.error;

      const rd = await c.from('renegociaciones_deuda').delete().eq('deuda_id', id);
      if (rd.error) throw rd.error;

      const dd = await c.from('deudas').delete().eq('id', id);
      if (dd.error) throw dd.error;

      if (typeof window.loadDeudas === 'function') {
        await window.loadDeudas();
      } else {
        document.querySelector('.tabs button[data-tab="deudas"]')?.click();
      }

      const detail = $('deudaDetalle');
      if (detail) detail.innerHTML = '<p class="muted">Deuda eliminada correctamente. Los movimientos históricos se conservaron.</p>';

      alert('Deuda eliminada correctamente. Se conservaron los movimientos financieros históricos.');
    } catch (error) {
      console.error('[B231.7] Eliminación segura:', error);
      alert(
        'No se pudo eliminar la deuda. No se continuará con pasos adicionales.\n\n' +
        (error?.message || String(error))
      );
      try {
        if (typeof window.loadDeudas === 'function') await window.loadDeudas();
      } catch (_) {}
    }
  }

  window.eliminarDeuda23 = deleteDebtSafely;

  function boot() {
    install();
    dedupePaymentButtons();
    dedupeAllPaymentButtons();
    [300,800,1500,2500].forEach(ms => setTimeout(() => { install(); dedupePaymentButtons(); dedupeAllPaymentButtons(); }, ms));
    startObserver();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, {once:true});
  } else {
    boot();
  }

  console.info('[B231.7] Cierre técnico Deudas — acciones únicas, abonos persistentes y eliminación segura —', VERSION);
})();
