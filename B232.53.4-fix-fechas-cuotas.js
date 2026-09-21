/* B232.53.4 — FIX PERSISTENCIA FECHA DE PAGO EN CUOTAS PENDIENTES
 * Aislado del motor principal de Deudas.
 *
 * Causa corregida:
 * finanzas-v233.js actualiza deudas.fecha_primera_cuota / fecha_proximo_pago,
 * pero cuando ya existe un plan activo conserva las cuotas_deuda existentes.
 * Resultado: la interfaz parece aceptar la nueva fecha, pero el calendario
 * y la deuda siguen leyendo la fecha_vencimiento antigua de las cuotas.
 *
 * Este parche NO reconstruye planes ni toca cuotas pagadas. Después de una
 * edición exitosa, sincroniza solamente cuotas pendientes/vencidas del plan
 * existente, empezando por la próxima cuota pendiente, y actualiza
 * deudas.fecha_proximo_pago con esa misma fecha.
 */
(() => {
  'use strict';

  const money = n => new Intl.NumberFormat('es-CL', {
    style: 'currency', currency: 'CLP', maximumFractionDigits: 0
  }).format(Number(n) || 0);

  const today = () => {
    const d = new Date();
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
      .toISOString().slice(0, 10);
  };

  const addFrequency = (date, frecuencia) => {
    const d = new Date(date + 'T12:00:00');
    if (Number.isNaN(d.getTime())) return null;
    if (frecuencia === 'semanal') d.setDate(d.getDate() + 7);
    else if (frecuencia === 'quincenal') d.setDate(d.getDate() + 15);
    else d.setMonth(d.getMonth() + 1);
    return d.toISOString().slice(0, 10);
  };

  async function db() {
    if (window.__b232534Client) return window.__b232534Client;
    const u = localStorage.getItem('sf_url');
    const k = localStorage.getItem('sf_key');
    if (!u || !k || !window.supabase?.createClient) return null;
    window.__b232534Client = window.supabase.createClient(u, k, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
    return window.__b232534Client;
  }

  async function reconcileDebtDate(snapshot) {
    if (!snapshot?.id || !snapshot.date) return;

    const c = await db();
    if (!c) return;

    // Sólo continuar si la edición de la deuda realmente persistió.
    const debt = await c.from('deudas')
      .select('id,fecha_primera_cuota,fecha_proximo_pago,frecuencia')
      .eq('id', snapshot.id)
      .maybeSingle();

    if (debt.error || !debt.data) return;
    if (String(debt.data.fecha_primera_cuota || '') !== snapshot.date) return;

    const frequency = debt.data.frecuencia || snapshot.frequency || 'mensual';

    const quotas = await c.from('cuotas_deuda')
      .select('id,numero_cuota,estado,fecha_vencimiento')
      .eq('deuda_id', snapshot.id)
      .in('estado', ['pendiente', 'vencida'])
      .order('numero_cuota', { ascending: true });

    if (quotas.error || !quotas.data?.length) return;

    // No se modifica ninguna cuota pagada/cancelada.
    let nextDate = snapshot.date;
    let changed = 0;

    for (const q of quotas.data) {
      if (!nextDate) break;

      const r = await c.from('cuotas_deuda')
        .update({
          fecha_vencimiento: nextDate,
          estado: 'pendiente'
        })
        .eq('id', q.id)
        .in('estado', ['pendiente', 'vencida']);

      if (!r.error) changed++;
      nextDate = addFrequency(nextDate, frequency);
    }

    if (changed > 0) {
      // La deuda debe apuntar siempre a la próxima cuota pendiente.
      await c.from('deudas')
        .update({ fecha_proximo_pago: snapshot.date })
        .eq('id', snapshot.id);

      // Recarga las vistas que ya existen en el sistema.
      if (typeof window.loadDebts === 'function') {
        try { await window.loadDebts(); } catch (_) {}
      }
      document.dispatchEvent(new CustomEvent('b232534:debt-date-synced', {
        detail: { debtId: snapshot.id, changed }
      }));
      console.info('[B232.53.4] Fecha de pago sincronizada:', snapshot.id, changed);
    }
  }

  function install() {
    const form = document.getElementById('deudaForm');
    if (!form || form.dataset.b232534Installed) return !!form;
    form.dataset.b232534Installed = '1';

    // Captura antes del onsubmit existente de finanzas-v233.js.
    form.addEventListener('submit', () => {
      const id = Number(document.getElementById('deudaId')?.value || 0);
      const date = document.getElementById('deudaPrimeraCuota')?.value || '';
      const frequency = document.getElementById('deudaFrecuencia')?.value || 'mensual';
      if (!id || !date) return;

      const snapshot = { id, date, frequency };

      // El motor principal debe terminar primero y confirmar la edición.
      setTimeout(() => reconcileDebtDate(snapshot), 900);
    }, true);

    return true;
  }

  function boot() {
    if (install()) return;
    const observer = new MutationObserver(() => {
      if (install()) observer.disconnect();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    setTimeout(() => observer.disconnect(), 10000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();
