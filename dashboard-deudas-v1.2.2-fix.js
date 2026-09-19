/* ============================================================
   EXEC-DASH-V1.2.2 — DEBT DATA DIRECT CONNECTOR
   Corrige la capa visual de:
   - Deudas del mes en curso
   - Backlog de deudas
   No depende de context.debtPlanning.
   Lee directamente v_deudas_resumen y cuotas_deuda.
   ============================================================ */
(() => {
  'use strict';

  const VERSION = 'EXEC-DASH-V1.2.2';

  const money = value => Number(value || 0).toLocaleString('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0
  });

  const n = value => {
    const x = Number(value);
    return Number.isFinite(x) ? x : 0;
  };

  const today = () => {
    const d = new Date();
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
      .toISOString().slice(0, 10);
  };

  const monthKey = date => String(date || '').slice(0, 7);

  function db() {
    if (window.supabaseClient) return window.supabaseClient;

    const url = localStorage.getItem('sf_url');
    const key = localStorage.getItem('sf_key');

    if (!url || !key || !window.supabase?.createClient) return null;

    window.supabaseClient = window.supabase.createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false }
    });

    return window.supabaseClient;
  }

  function svg(width, height) {
    const NS = 'http://www.w3.org/2000/svg';
    const el = document.createElementNS(NS, 'svg');
    el.setAttribute('viewBox', `0 0 ${width} ${height}`);
    el.setAttribute('width', '100%');
    el.setAttribute('height', '100%');
    el.setAttribute('role', 'img');
    return el;
  }

  function text(s, x, y, value, cls = 'chart-label') {
    const e = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    e.setAttribute('x', x);
    e.setAttribute('y', y);
    e.setAttribute('class', cls);
    e.textContent = value;
    s.appendChild(e);
  }

  function rect(s, x, y, w, h, cls = 'chart-bar') {
    const e = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    e.setAttribute('x', x);
    e.setAttribute('y', y);
    e.setAttribute('width', Math.max(0, w));
    e.setAttribute('height', Math.max(0, h));
    e.setAttribute('class', cls);
    s.appendChild(e);
  }

  function compactMoney(v) {
    const x = Math.round(n(v));
    if (Math.abs(x) >= 1000000) return '$' + (x / 1000000).toFixed(1) + 'M';
    if (Math.abs(x) >= 1000) return '$' + Math.round(x / 1000) + 'k';
    return '$' + x.toLocaleString('es-CL');
  }

  function normalizeState(row) {
    return String(
      row?.estado ??
      row?.estado_deuda ??
      row?.status ??
      ''
    ).trim().toLowerCase();
  }

  function isClosed(row) {
    const s = normalizeState(row);
    return ['pagada', 'cancelada', 'cerrada', 'liquidada'].includes(s);
  }

  function getStartDate(row) {
    return (
      row?.fecha_inicio ??
      row?.fecha_inicio_pago ??
      row?.fecha_primer_pago ??
      row?.inicio_pago ??
      row?.fecha_inicio_negociacion ??
      null
    );
  }

  function getDueDate(row) {
    return (
      row?.fecha_vencimiento ??
      row?.proximo_vencimiento ??
      row?.fecha_proximo_pago ??
      null
    );
  }

  function isNegotiation(row) {
    const s = normalizeState(row);
    return (
      s.includes('negoci') ||
      s.includes('renegoci') ||
      s.includes('acuerdo pendiente') ||
      s.includes('por negociar')
    );
  }

  function isUnpaid(row) {
    if (isClosed(row) || isNegotiation(row)) return false;
    const s = normalizeState(row);
    return (
      !s ||
      s.includes('pendiente') ||
      s.includes('vencid') ||
      s.includes('atras') ||
      s.includes('activo') ||
      s.includes('vigente') ||
      s.includes('moros')
    );
  }

  function renderError(id, message) {
    const el = document.getElementById(id);
    if (!el) return;
    el.innerHTML = '';
    const s = svg(760, 260);
    text(s, 380, 120, 'Error de datos', 'chart-empty');
    text(s, 380, 148, message, 'chart-axis');
    el.appendChild(s);
  }

  function renderBacklog(rows) {
    const container = document.getElementById('chart-debt-planning');
    if (!container) return;

    const active = rows.filter(r => !isClosed(r) && n(
      r.saldo_actual ?? r.saldo_pendiente ?? r.saldo ?? r.monto_original ?? r.monto
    ) > 0);

    const categories = [
      {
        label: 'Pendientes de negociación',
        items: active.filter(isNegotiation)
      },
      {
        label: 'Pendientes de pago',
        items: active.filter(isUnpaid)
      },
      {
        label: 'Sin fecha de inicio',
        items: active.filter(r => !getStartDate(r))
      }
    ].map(x => ({
      label: x.label,
      count: x.items.length,
      value: x.items.reduce((sum, r) => sum + n(
        r.saldo_actual ?? r.saldo_pendiente ?? r.saldo ?? r.monto_original ?? r.monto
      ), 0)
    }));

    container.innerHTML = '';
    const W = 760;
    const H = 300;
    const L = 190;
    const R = 100;
    const T = 38;
    const B = 25;
    const s = svg(W, H);
    container.appendChild(s);

    const nonZero = categories.filter(x => x.value > 0);

    if (!nonZero.length) {
      text(s, W / 2, 132, 'No hay deudas pendientes en estas categorías', 'chart-empty');
      text(s, W / 2, 158, 'La fuente de deudas respondió correctamente.', 'chart-axis');
      return;
    }

    const max = Math.max(...categories.map(x => x.value), 1);

    categories.forEach((row, i) => {
      const y = T + i * 76;
      const width = (row.value / max) * (W - L - R);

      text(s, 8, y + 22, row.label, 'chart-axis');

      rect(s, L, y, width, 32, `debt-bar debt-${i % 4}`);

      text(
        s,
        Math.min(W - 8, L + width + 10),
        y + 21,
        `${compactMoney(row.value)} · ${row.count} deuda${row.count === 1 ? '' : 's'}`,
        'chart-legend-value'
      );
    });

    text(s, L, 18, 'Backlog real de deudas para planificación', 'chart-title');
  }

  function renderCurrentMonth(rows, quotas, currentMonth) {
    const container = document.getElementById('chart-debt-month');
    if (!container) return;

    /*
     * Las cuotas representan obligaciones exigibles del mes.
     * Las deudas directas solo se agregan si no tienen cuotas.
     */
    const quotaDebtIds = new Set(
      quotas.map(q => String(q.deuda_id ?? '')).filter(Boolean)
    );

    const direct = rows.filter(r => {
      const id = String(r.id ?? '');
      const due = getDueDate(r);
      const start = getStartDate(r);
      const amount = n(
        r.saldo_actual ?? r.saldo_pendiente ?? r.saldo ?? r.monto_original ?? r.monto
      );
      return (
        !quotaDebtIds.has(id) &&
        !isClosed(r) &&
        amount > 0 &&
        (monthKey(due) === currentMonth || monthKey(start) === currentMonth)
      );
    });

    const grouped = {};

    quotas.forEach(q => {
      const id = String(q.deuda_id ?? q.id ?? 'sin-id');
      const label = String(q.fecha_vencimiento || currentMonth);
      const key = `${id}|${label}`;

      if (!grouped[key]) {
        grouped[key] = {
          id,
          label,
          value: 0
        };
      }

      grouped[key].value += n(q.monto);
    });

    direct.forEach(d => {
      grouped[`direct|${d.id}`] = {
        id: String(d.id),
        label: getDueDate(d) || getStartDate(d) || currentMonth,
        value: n(
          d.saldo_actual ?? d.saldo_pendiente ?? d.saldo ?? d.monto_original ?? d.monto
        )
      };
    });

    const items = Object.values(grouped)
      .filter(x => x.value > 0)
      .sort((a, b) => a.label.localeCompare(b.label));

    container.innerHTML = '';
    const W = 760;
    const H = 300;
    const L = 58;
    const R = 24;
    const T = 42;
    const B = 58;
    const s = svg(W, H);
    container.appendChild(s);

    if (!items.length) {
      text(s, W / 2, 125, `Sin deudas exigibles en ${currentMonth}`, 'chart-empty');
      text(s, W / 2, 151, 'No se encontraron cuotas/deudas con fecha en el mes.', 'chart-axis');
      return;
    }

    const max = Math.max(...items.map(x => x.value), 1);
    const slot = (W - L - R) / items.length;

    items.forEach((row, i) => {
      const x = L + i * slot + slot / 2;
      const bw = Math.min(34, slot * 0.35);
      const h = (row.value / max) * (H - T - B - 18);

      rect(s, x - bw / 2, H - B - h, bw, h, `month-debt month-${i % 4}`);

      text(s, x, H - 30, String(row.label).slice(5), 'chart-axis');
      text(s, x, H - B - h - 8, compactMoney(row.value), 'chart-legend-value');
    });

    const total = items.reduce((sum, x) => sum + x.value, 0);

    text(s, L, 18, `Deudas del mes en curso · ${items.length} obligación${items.length === 1 ? '' : 'es'}`, 'chart-title');
    text(s, W - R, 18, `Total ${compactMoney(total)}`, 'chart-legend-value');
  }

  async function load() {
    const database = db();
    if (!database) {
      renderError('chart-debt-month', 'Supabase no está conectado.');
      renderError('chart-debt-planning', 'Supabase no está conectado.');
      return;
    }

    const currentMonth = monthKey(today());
    const start = `${currentMonth}-01`;
    const d = new Date(`${currentMonth}-01T12:00:00`);
    d.setMonth(d.getMonth() + 1);
    const end = d.toISOString().slice(0, 10);

    const [viewResult, quotaResult] = await Promise.all([
      database.from('v_deudas_resumen').select('*'),
      database.from('cuotas_deuda')
        .select('*')
        .gte('fecha_vencimiento', start)
        .lt('fecha_vencimiento', end)
        .in('estado', ['pendiente', 'vencida', 'atrasada'])
    ]);

    if (viewResult.error) {
      renderError('chart-debt-planning', `v_deudas_resumen: ${viewResult.error.message}`);
      renderError('chart-debt-month', quotaResult.error
        ? `cuotas_deuda: ${quotaResult.error.message}`
        : 'No fue posible cargar las deudas.');
      return;
    }

    if (quotaResult.error) {
      /*
       * El backlog sigue siendo válido aunque RLS no permita leer cuotas.
       */
      renderBacklog(viewResult.data || []);
      renderError('chart-debt-month', `No se pudieron cargar las cuotas del mes: ${quotaResult.error.message}`);
      return;
    }

    renderBacklog(viewResult.data || []);
    renderCurrentMonth(viewResult.data || [], quotaResult.data || [], currentMonth);
  }

  function boot() {
    if (!document.getElementById('executive-charts')) return;
    load().catch(error => {
      console.error(`[${VERSION}]`, error);
      renderError('chart-debt-month', error.message || 'Error de carga');
      renderError('chart-debt-planning', error.message || 'Error de carga');
    });
  }

  window.ExecutiveDebtDataFix = {
    version: VERSION,
    refresh: load
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(boot, 900), { once: true });
  } else {
    setTimeout(boot, 900);
  }

  document.addEventListener('click', event => {
    if (event.target.closest('[data-tab="dashboard"]')) {
      setTimeout(boot, 400);
    }
  });

  console.log(`[${VERSION}] conector directo de deudas activo.`);
})();
