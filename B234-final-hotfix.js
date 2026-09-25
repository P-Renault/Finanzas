/* CCF B234 FINAL — reconciliación de Pendientes / Por realizar + limpieza de releases visibles
   Capa quirúrgica: no reemplaza módulos ni escribe datos. Debe cargarse DESPUÉS
   de B233.71-pendientes-por-realizar-fix.js.
*/
(() => {
  'use strict';
  if (window.__CCF_B234_FINAL_HOTFIX__) return;
  window.__CCF_B234_FINAL_HOTFIX__ = true;

  const money = n => new Intl.NumberFormat('es-CL', {
    style: 'currency', currency: 'CLP', maximumFractionDigits: 0
  }).format(Math.round(Number(n) || 0));

  const num = v => Number.isFinite(Number(v)) ? Number(v) : 0;

  const today = () => {
    const d = new Date();
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
      .toISOString().slice(0, 10);
  };

  const ym = s => String(s || '').slice(0, 7);

  const monthEnd = month => {
    const [y, m] = ym(month).split('-').map(Number);
    return new Date(y, m, 0).toISOString().slice(0, 10);
  };

  const dateOf = r => String(
    r?.fecha_vencimiento ??
    r?.fecha ??
    r?.fecha_planificada ??
    r?.fecha_generacion ??
    ''
  ).slice(0, 10);

  const amountOf = r => num(r?.monto ?? r?.valor);

  const db = () => window.supabaseClient || window.db || window.__db || null;

  async function read(p) {
    try {
      const r = await p;
      if (r?.error) return { data: [], error: r.error };
      return { data: r?.data || [], error: null };
    } catch (error) {
      return { data: [], error };
    }
  }

  function obligationKey(r) {
    const linked = String(
      r?.cuota_id ??
      r?.cuota_deuda_id ??
      r?.deuda_id ??
      ''
    );
    const date = dateOf(r);
    const amount = amountOf(r);
    const desc = String(r?.concepto ?? r?.descripcion ?? r?.nombre ?? '');
    if (linked) return `${linked}|${date}|${amount}`;
    return [
      date,
      String(r?.categoria ?? r?.tipo_deuda ?? ''),
      desc,
      amount
    ].join('|');
  }

  function classifyDate(date, selectedMonth) {
    const current = today();
    const month = ym(selectedMonth || current);
    if (month < ym(current)) return 'pending';
    if (month > ym(current)) return 'future';
    return (!date || date <= current) ? 'pending' : 'future';
  }

  async function collect() {
    const c = db();
    if (!c) return null;

    const selected = ym(
      document.getElementById('b234Month')?.value || today()
    );
    const start = `${selected}-01`;
    const end = monthEnd(selected);

    const [mov, planned, comm, quotas] = await Promise.all([
      read(c.from('movimientos').select('*').gte('fecha', start).lte('fecha', end)),
      read(c.from('gastos_planificados').select('*').gte('fecha', start).lte('fecha', end)),
      read(c.from('compromisos').select('*').eq('estado', 'pendiente')
        .gte('fecha_vencimiento', start).lte('fecha_vencimiento', end)),
      read(c.from('cuotas_deuda').select('*')
        .in('estado', ['pendiente', 'vencida', 'atrasada'])
        .gte('fecha_vencimiento', start).lte('fecha_vencimiento', end))
    ]);

    const generatedRows = mov.data.filter(r =>
      String(r?.tipo || '').toLowerCase() === 'gasto'
    );

    const generated = generatedRows.reduce(
      (sum, r) => sum + num(r.monto), 0
    );

    const obligations = [];
    const seen = new Set();

    [...comm.data, ...quotas.data].forEach(r => {
      const key = obligationKey(r);
      if (seen.has(key)) return;
      seen.add(key);
      obligations.push(r);
    });

    let pending = 0;
    let future = 0;

    const cats = {};
    const add = (category, g, p, f) => {
      const key = String(category || 'Otros').trim() || 'Otros';
      cats[key] ||= { g: 0, p: 0, f: 0 };
      cats[key].g += g;
      cats[key].p += p;
      cats[key].f += f;
    };

    generatedRows.forEach(r => add(r.categoria, num(r.monto), 0, 0));

    planned.data.forEach(r => {
      const value = amountOf(r);
      if (classifyDate(dateOf(r), selected) === 'pending') {
        pending += value;
        add(r.categoria, 0, value, 0);
      } else {
        future += value;
        add(r.categoria, 0, 0, value);
      }
    });

    obligations.forEach(r => {
      const value = amountOf(r);
      const category = r.categoria || r.tipo_deuda || 'Deudas';
      if (classifyDate(dateOf(r), selected) === 'pending') {
        pending += value;
        add(category, 0, value, 0);
      } else {
        future += value;
        add(category, 0, 0, value);
      }
    });

    const total = generated + pending + future;

    return {
      selected,
      total,
      generated,
      pending,
      future,
      cats,
      errors: [mov, planned, comm, quotas].filter(x => x.error)
    };
  }

  function updateText(root, selector, value) {
    const el = root.querySelector(selector);
    if (el) el.textContent = value;
  }

  function render(data) {
    const host = document.getElementById('b234-report');
    if (!host || !data) return false;

    updateText(host, '.b234-kpi:nth-child(3) strong', money(data.total));

    const cards = host.querySelectorAll('.b234-cat');
    cards.forEach(card => {
      const name = card.querySelector('h4')?.textContent?.trim();
      const value = data.cats[name];
      if (!value) return;

      const lines = card.querySelectorAll('.b234-line span:last-child');
      if (lines[0]) lines[0].textContent = money(value.g);
      if (lines[1]) lines[1].textContent = money(value.p);
      if (lines[2]) lines[2].textContent = money(value.f);

      const total = value.g + value.p + value.f;
      const strong = card.querySelector('strong');
      if (strong) strong.textContent = money(total);
    });

    const summary = host.querySelectorAll('.b234-summary > div');
    if (summary.length >= 4) {
      const values = [data.total, data.generated, data.pending, data.future];
      values.forEach((value, i) => {
        const strong = summary[i]?.querySelector('strong');
        if (strong) strong.textContent = money(value);

        if (i > 0) {
          const smalls = summary[i]?.querySelectorAll('small');
          const pct = data.total ? Math.round(value / data.total * 100) : 0;
          if (smalls?.length) smalls[smalls.length - 1].textContent = `${pct}%`;
        }
      });
    }

    return true;
  }

  function removeTechnicalReleaseNodes() {
    const exact = [
      'B232.73-RELEASE-AUTH-CORE-BRIDGE',
      'B232.74-RELEASE-AUTH-SESSION-PERSISTENCE',
      'B232.68-CCF-DEUDA-DUAL',
      'B232.65-RELEASE-INTEGRACION-LIQUIDEZ',
      'B232.66-RELEASE-ABONO-LIQUIDEZ',
      'B232.67-RELEASE-MOVIMIENTOS-LIQUIDEZ'
    ];

    document.querySelectorAll('body *').forEach(el => {
      if (el.children.length > 0) return;
      const t = (el.textContent || '').trim();
      if (!t) return;

      if (
        exact.includes(t) ||
        /^Paquete desplegado:\s*/i.test(t) ||
        /^B232\.(6[5-8]|7[3-4])-RELEASE-/i.test(t)
      ) {
        el.remove();
      }
    });
  }

  async function run() {
    removeTechnicalReleaseNodes();
    const data = await collect();
    if (data) render(data);
  }

  function boot() {
    run().catch(error => console.warn('[B234 FINAL]', error));

    document.addEventListener('click', event => {
      if (
        event.target.closest('[data-tab="dashboard"]') ||
        event.target.closest('#b234Refresh')
      ) {
        setTimeout(() => {
          run().catch(error => console.warn('[B234 FINAL]', error));
        }, 450);
      }
    }, true);

    const observer = new MutationObserver(() => {
      removeTechnicalReleaseNodes();
    });

    observer.observe(document.body, { childList: true, subtree: true });

    setTimeout(() => run().catch(() => {}), 1200);
    setTimeout(() => run().catch(() => {}), 3000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }

  window.CCFB234Final = { version: 'B234-FINAL', refresh: run };
})();
