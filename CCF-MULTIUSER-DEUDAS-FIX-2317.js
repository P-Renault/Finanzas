/* CCF · MULTIUSUARIO DEUDAS FIX 231.7
 * Defensa de interfaz para aislamiento por usuario.
 *
 * No modifica Supabase, RLS ni datos.
 * Reutiliza window.supabaseClient (sesión autenticada).
 * Filtra la vista de Deudas por los IDs pertenecientes al usuario actual
 * y recalcula los indicadores visibles únicamente con sus datos.
 */
(() => {
  'use strict';

  if (window.__CCF_MULTIUSER_DEUDAS_FIX_2317__) return;
  window.__CCF_MULTIUSER_DEUDAS_FIX_2317__ = true;

  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const money = n => new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0
  }).format(Number(n) || 0);

  async function getClient() {
    for (let i = 0; i < 100; i++) {
      const c = window.supabaseClient;
      if (c?.auth) return c;
      await sleep(100);
    }
    return null;
  }

  async function getOwned(c) {
    const { data: authData, error: authError } = await c.auth.getUser();
    if (authError || !authData?.user?.id) {
      return { userId: null, ids: [], debts: [], quotas: [] };
    }

    const userId = authData.user.id;

    const debtsResult = await c
      .from('deudas')
      .select('id,monto_original,saldo_actual,estado')
      .eq('user_id', userId);

    if (debtsResult.error) throw debtsResult.error;

    const debts = debtsResult.data || [];
    const ids = debts.map(d => d.id).filter(Boolean);

    let quotas = [];
    if (ids.length) {
      const q = await c
        .from('cuotas_deuda')
        .select('id,deuda_id,monto,estado,fecha_vencimiento')
        .in('deuda_id', ids);

      if (q.error) throw q.error;
      quotas = q.data || [];
    }

    return { userId, ids, debts, quotas };
  }

  function setMetric(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  function sanitizeDom(ids) {
    const allowed = new Set(ids.map(String));
    const list = document.getElementById('deudasLista');

    if (!list) return;

    if (!allowed.size) {
      list.innerHTML = '<p class="muted">No hay deudas registradas.</p>';
      return;
    }

    list.querySelectorAll('.debt-card').forEach(card => {
      const buttons = Array.from(card.querySelectorAll('button'));
      const text = buttons.map(b => b.getAttribute('onclick') || '').join(' ');
      const match = text.match(/(?:verDeuda23|editarDeuda23|eliminarDeuda23)\((\d+)\)/);

      if (!match || !allowed.has(String(match[1]))) {
        card.remove();
      }
    });

    if (!list.querySelector('.debt-card')) {
      list.innerHTML = '<p class="muted">No hay deudas registradas.</p>';
    }
  }

  function updateMetrics(debts, quotas) {
    const active = debts.filter(d =>
      !['pagada', 'cancelada'].includes(String(d.estado || '').toLowerCase())
    );

    const original = active.reduce((s, d) => s + Number(d.monto_original || 0), 0);
    const balance = active.reduce((s, d) => s + Number(d.saldo_actual || 0), 0);

    const pending = quotas.filter(q =>
      ['pendiente', 'vencida'].includes(String(q.estado || '').toLowerCase())
    );

    const now = new Date();
    const today = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString().slice(0, 10);
    const end = new Date(today + 'T12:00:00');
    end.setDate(end.getDate() + 30);
    const endKey = end.toISOString().slice(0, 10);

    const next30 = pending
      .filter(q => q.fecha_vencimiento >= today && q.fecha_vencimiento <= endKey)
      .reduce((s, q) => s + Number(q.monto || 0), 0);

    setMetric('deudaOriginalTotal', money(original));
    setMetric('deudaSaldoTotal', money(balance));
    setMetric('deudaCuotasTotal', String(pending.length));
    setMetric('deuda30Total', money(next30));
  }

  async function enforce() {
    const c = await getClient();
    if (!c) return;

    try {
      const data = await getOwned(c);

      /*
       * Si el usuario nuevo no tiene deudas, la interfaz queda explícitamente
       * vacía aunque otro módulo haya renderizado información previamente.
       */
      sanitizeDom(data.ids);
      updateMetrics(data.debts, data.quotas);

      console.info(
        '[CCF MULTIUSER] Deudas aisladas:',
        data.userId,
        'deudas:',
        data.ids.length
      );
    } catch (e) {
      console.error('[CCF MULTIUSER] No se pudo validar aislamiento:', e);
    }
  }

  async function boot() {
    await sleep(300);
    await enforce();

    /*
     * El módulo financiero puede terminar de renderizar después de nuestro
     * primer control. Revalidamos tras el arranque y después de refresh.
     */
    await sleep(1000);
    await enforce();

    const oldRefresh = window.refresh;
    if (oldRefresh && !oldRefresh.__ccfMultiuserWrapped) {
      const wrapped = async function (...args) {
        const result = await oldRefresh.apply(this, args);
        await sleep(50);
        await enforce();
        return result;
      };
      wrapped.__ccfMultiuserWrapped = true;
      window.refresh = wrapped;
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();
