/* ============================================================
   FINANZAS — RUNTIME FINAL · B232.18
   OBJETIVO
   - Recuperar navegación core sin depender de listeners legacy.
   - Recuperar conexión Supabase sin B232.15/B232.16/B232.17.
   - Cargar B232 inmediatamente al entrar en Calendario.
   - Mantener Operaciones/IA/Presupuesto/Resumen.
   - Evitar doble carga de módulos y reducir esperas.

   INSTALACIÓN
   - Este archivo reemplaza cualquier:
       calendario-runtime-hotfix-B232.12.js
       RESTORE-MODULOS-B232.16.js
       RECUPERACION-ACCESO-B232.15.js
   - Debe ser el ÚNICO runtime final de compatibilidad.
   - NO requiere modificar Supabase.
   ============================================================ */
(() => {
  'use strict';

  const VERSION = 'B232.18';
  const CORE = new Set([
    'dashboard','movimientos','futuros','calendario','ahorro','deudas','cuentas'
  ]);
  const $ = id => document.getElementById(id);
  const wait = ms => new Promise(r => setTimeout(r, ms));

  let navReady = false;
  let connectReady = false;
  let calendarPromise = null;

  function appVisible() {
    const app = $('app');
    return !!app && !app.classList.contains('hidden');
  }

  function saveTab(id) {
    if (CORE.has(id)) localStorage.setItem('cf_active_tab_v2', id);
  }

  function showTab(id) {
    const target = $(id);
    if (!target) return false;

    document.querySelectorAll('#app .tab').forEach(s => {
      s.classList.toggle('hidden', s.id !== id);
    });

    document.querySelectorAll('.tabs button').forEach(b => {
      const bid = b.dataset.finalTab || b.dataset.tab;
      b.classList.toggle('active', bid === id);
    });

    saveTab(id);

    if (id === 'calendario') loadCalendar();
    if (id === 'deudas') {
      setTimeout(() => window.DashboardDeudas?.render?.(), 0);
    }

    return true;
  }

  async function loadCalendar() {
    if (!appVisible() || $('calendario')?.classList.contains('hidden')) return;

    if (window.B232Calendario?.load) {
      try { await window.B232Calendario.load(); } catch (e) {
        console.error('[B232.18] calendario:', e);
      }
      return;
    }

    if (!calendarPromise) {
      calendarPromise = new Promise((resolve, reject) => {
        const existing = document.querySelector('script[data-b23218-loader="1"]');
        if (existing) {
          const timer = setInterval(() => {
            if (window.B232Calendario?.load) {
              clearInterval(timer);
              resolve(window.B232Calendario);
            }
          }, 25);
          setTimeout(() => {
            clearInterval(timer);
            if (window.B232Calendario?.load) resolve(window.B232Calendario);
            else reject(new Error('B232 no quedó disponible.'));
          }, 5000);
          return;
        }

        const s = document.createElement('script');
        s.src = 'b232-calendario-v2.js?v=232.18';
        s.async = false;
        s.dataset.b23218Loader = '1';
        s.onload = () => window.B232Calendario
          ? resolve(window.B232Calendario)
          : reject(new Error('B232 cargó sin exponer el motor.'));
        s.onerror = () => reject(new Error('No se pudo cargar B232.'));
        document.body.appendChild(s);
      });
    }

    try {
      const engine = await calendarPromise;
      await engine.load();
    } catch (e) {
      console.error('[B232.18] loadCalendar:', e);
    }
  }

  /*
     Los parches anteriores instalaron listeners de captura en document.
     No intentamos quitarlos: hacemos que los botones visibles ya no tengan
     data-tab, por lo que esos listeners dejan de reconocerlos.
  */
  function normalizeNavButtons() {
    const tabs = document.querySelector('.tabs');
    if (!tabs) return false;

    const buttons = [...tabs.querySelectorAll('button[data-tab]')];
    for (const b of buttons) {
      const id = b.dataset.tab;
      if (CORE.has(id)) {
        b.dataset.finalTab = id;
        b.removeAttribute('data-tab');
      }
    }

    if (!tabs.dataset.b23218Navigation) {
      tabs.dataset.b23218Navigation = '1';
      tabs.addEventListener('click', e => {
        const b = e.target.closest('button[data-final-tab]');
        if (!b) return;
        e.preventDefault();
        e.stopPropagation();
        showTab(b.dataset.finalTab);
      });
    }

    navReady = true;
    return true;
  }

  function ensureCoreButtons() {
    const tabs = document.querySelector('.tabs');
    if (!tabs) return false;

    const existing = new Set(
      [...tabs.querySelectorAll('button')]
        .map(b => b.dataset.finalTab || b.dataset.tab)
        .filter(Boolean)
    );

    const labels = {
      dashboard:'Resumen', movimientos:'Movimientos', futuros:'Pagos futuros',
      calendario:'Calendario', ahorro:'Ahorro', deudas:'Deudas', cuentas:'Cuentas'
    };

    for (const id of CORE) {
      if (existing.has(id)) continue;
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = labels[id];
      b.dataset.finalTab = id;
      tabs.appendChild(b);
    }

    return normalizeNavButtons();
  }

  function installNavigation() {
    if (!appVisible()) return false;
    return ensureCoreButtons();
  }

  function repairConnectionButton() {
    const old = $('saveConfig');
    if (!old || connectReady) return;

    /* Clonar elimina listeners instalados por B232.15 y app.js.
       Reinstalamos un único flujo de conexión. */
    const fresh = old.cloneNode(true);
    fresh.dataset.b23218 = '1';
    old.replaceWith(fresh);
    connectReady = true;

    fresh.addEventListener('click', async e => {
      e.preventDefault();
      e.stopPropagation();

      const url = ($('supabaseUrl')?.value || '').trim();
      const key = ($('supabaseKey')?.value || '').trim();
      const status = $('configMsg');

      if (!url || !key) {
        if (status) status.textContent = 'Completa la URL y la Publishable Key de Supabase.';
        return;
      }

      if (!window.supabase?.createClient) {
        if (status) status.textContent = 'No se cargó la librería de Supabase.';
        return;
      }

      fresh.disabled = true;
      fresh.textContent = 'Conectando…';
      if (status) status.textContent = 'Conectando con Supabase…';

      try {
        const client = window.supabase.createClient(url, key, {
          auth: { persistSession:false, autoRefreshToken:false }
        });

        const probe = await Promise.race([
          client.from('movimientos').select('id').limit(1),
          new Promise((_, reject) => setTimeout(
            () => reject(new Error('Tiempo de espera agotado al consultar Supabase.')),
            10000
          ))
        ]);

        if (probe?.error) throw new Error(probe.error.message);

        localStorage.setItem('sf_url', url);
        localStorage.setItem('sf_key', key);
        window.supabaseClient = client;

        $('configPanel')?.classList.add('hidden');
        $('app')?.classList.remove('hidden');
        $('logoutBtn')?.classList.remove('hidden');

        if (status) status.textContent = 'Conectado. Cargando módulos…';

        if (typeof window.refresh === 'function') {
          await window.refresh();
        }

        /* El loader de index.html detecta #app visible y carga B219,
           resumen y módulos financieros. */
        for (const ms of [0, 100, 300, 700, 1200]) {
          setTimeout(() => {
            installNavigation();
            if (window.FinancialSummary?.init) {
              window.FinancialSummary.init().catch(console.error);
            }
          }, ms);
        }

        if (status) status.textContent = 'Conectado correctamente.';
        setTimeout(() => { if (status) status.textContent = ''; }, 1200);

      } catch (error) {
        console.error('[B232.18] conexión:', error);
        if (status) status.textContent = 'No se pudo conectar: ' + (error.message || error);
      } finally {
        fresh.disabled = false;
        fresh.textContent = 'Conectar';
      }
    });
  }

  function restoreCredentials() {
    const url = localStorage.getItem('sf_url');
    const key = localStorage.getItem('sf_key');
    if (url && $('supabaseUrl') && !$('supabaseUrl').value) $('supabaseUrl').value = url;
    if (key && $('supabaseKey') && !$('supabaseKey').value) $('supabaseKey').value = key;
  }

  function restoreActive() {
    if (!appVisible()) return;
    const saved = localStorage.getItem('cf_active_tab_v2');
    const active = document.querySelector('.tabs button.active')?.dataset.finalTab;
    const id = CORE.has(saved) ? saved : (CORE.has(active) ? active : 'dashboard');
    showTab(id);
  }

  function boot() {
    restoreCredentials();
    repairConnectionButton();
    installNavigation();
    restoreActive();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once:true });
  } else {
    boot();
  }

  /* El loader de B219 crea/reordena botones después de la conexión. */
  const observer = new MutationObserver(() => {
    if (appVisible()) installNavigation();
  });
  observer.observe(document.body, { childList:true, subtree:true });
  setTimeout(() => observer.disconnect(), 12000);

  window.B232CalendarRuntimeFix = {
    version: VERSION,
    load: loadCalendar
  };

  console.info('[B232.18] Runtime final instalado.');
})();
