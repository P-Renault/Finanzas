/* FINANZAS V2.3.3 — Cero Financiero + Liquidez + Cuentas + Deudas V2 */
(() => {
  const $ = id => document.getElementById(id);

  const money = n =>
    new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0
    }).format(Number(n) || 0);

  const today = () => {
    const d = new Date();
    return new Date(
      d.getTime() - d.getTimezoneOffset() * 60000
    ).toISOString().slice(0, 10);
  };

  const esc = v =>
    String(v ?? '').replace(
      /[&<>"']/g,
      c => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
      }[c])
    );

  let client = null;
  let accounts = [];
  let debts = [];
  let selected = null;
  let plans = [];
  let quotas = [];

  /* =========================================================
     SUPABASE
     ========================================================= */

  async function db() {
    if (client) return client;

    const u = localStorage.getItem('sf_url');
    const k = localStorage.getItem('sf_key');

    if (!u || !k || !window.supabase) {
      console.warn('FIN23: Supabase no disponible');
      return null;
    }

    client = window.supabase.createClient(u, k);
    return client;
  }

  /* =========================================================
     NAVEGACIÓN
     ========================================================= */

  function tab(id) {
    document
      .querySelectorAll('.tabs button')
      .forEach(b =>
        b.classList.toggle(
          'active',
          b.dataset.tab === id
        )
      );

    document
      .querySelectorAll('.tab')
      .forEach(s =>
        s.classList.add('hidden')
      );

    $(id)?.classList.remove('hidden');
  }

  function injectTabs() {
    const t = document.querySelector('.tabs');
    if (!t) return;

    [
      ['deudas', 'Deudas'],
      ['cuentas', 'Cuentas']
    ].forEach(([id, label]) => {
      if (!t.querySelector(`[data-tab="${id}"]`)) {
        const b = document.createElement('button');

        b.type = 'button';
        b.dataset.tab = id;
        b.textContent = label;
        b.onclick = () => tab(id);

        t.appendChild(b);
      }
    });
  }

  /* =========================================================
     SECCIONES
     ========================================================= */

  function injectSections() {
    const app = $('app');
    if (!app) return;

    /* =========================
       CUENTAS
       ========================= */

    if (!$('cuentas')) {
      const s = document.createElement('section');

      s.id = 'cuentas';
      s.className = 'tab hidden';

      s.innerHTML = `
        <div class="card">

          <div class="section-title">
            <div>
              <span class="muted">
                Estructura de liquidez
              </span>
              <h2>Cuentas bancarias</h2>
            </div>

            <span class="muted">
              Registra todas tus cuentas
            </span>
          </div>

          <form id="cuentaForm" class="grid2">

            <input type="hidden" id="cuentaId">

            <label>
              Banco / institución
              <input
                id="cuentaBanco"
                required
                placeholder="Banco de Chile">
            </label>

            <label>
              Nombre de cuenta
              <input
                id="cuentaNombre"
                required
                placeholder="Cuenta corriente">
            </label>

            <label>
              Tipo
              <select id="cuentaTipo">
                <option>Cuenta corriente</option>
                <option>Cuenta vista</option>
                <option>Cuenta RUT</option>
                <option>Ahorro</option>
                <option>Otro</option>
              </select>
            </label>

            <label>
              Identificador parcial
              <input
                id="cuentaIdentificador"
                placeholder="****1234">
            </label>

            <label>
              Saldo de apertura
              <input
                id="cuentaApertura"
                type="number"
                min="0"
                step="1"
                value="0">
            </label>

            <label>
              Fecha
