/* FINANZAS RUNTIME FIX — conexión robusta + arranque consolidado */
(() => {
  const $ = id => document.getElementById(id);
  const setStatus = text => { const el = $('configMsg'); if (el) el.textContent = text; };
  const sleep = ms => new Promise(r => setTimeout(r, ms));

  async function withTimeout(promise, ms = 12000) {
    let timer;
    try {
      return await Promise.race([
        promise,
        new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('Tiempo de espera agotado al contactar Supabase.')), ms); })
      ]);
    } finally { clearTimeout(timer); }
  }

  async function connectFixed() {
    const url = $('supabaseUrl')?.value.trim();
    const key = $('supabaseKey')?.value.trim();
    if (!url || !key) { setStatus('Completa URL y clave de Supabase.'); return; }
    if (!window.supabase) { setStatus('No se cargó la biblioteca de Supabase. Recarga la página.'); return; }

    const btn = $('saveConfig');
    if (btn) { btn.disabled = true; btn.textContent = 'Conectando…'; }
    setStatus('Probando conexión con Supabase…');

    try {
      const client = window.supabase.createClient(url, key, {
        auth: { persistSession: false, autoRefreshToken: false }
      });

      // La prueba principal usa una tabla que forma parte del núcleo histórico.
      // Si falla, probamos tablas nuevas para entregar un diagnóstico más preciso.
      const probes = [
        ['movimientos', () => client.from('movimientos').select('id').limit(1)],
        ['cierres_financieros', () => client.from('cierres_financieros').select('id').limit(1)],
        ['deudas', () => client.from('deudas').select('id').limit(1)]
      ];
      let firstError = null;
      let connected = false;
      for (const [name, probe] of probes) {
        try {
          const r = await withTimeout(probe());
          if (!r.error) { connected = true; break; }
          firstError ||= r.error;
        } catch (e) { firstError ||= e; }
      }
      if (!connected) {
        throw new Error(firstError?.message || 'Supabase no respondió correctamente.');
      }

      localStorage.setItem('sf_url', url);
      localStorage.setItem('sf_key', key);
      window.__finClient = client;

      // app.js declara `db` como binding global. Lo enlazamos al cliente ya validado
      // para que refresh(), movimientos, compromisos y ahorro reutilicen la misma conexión.
      try { window.eval('db = window.__finClient'); } catch (_) {}

      $('configPanel')?.classList.add('hidden');
      $('app')?.classList.remove('hidden');
      $('logoutBtn')?.classList.remove('hidden');
      setStatus('Conectado.');

      if (typeof window.refresh === 'function') {
        await withTimeout(window.refresh(), 15000).catch(e => {
          console.error('Refresh financiero:', e);
          setStatus('Conectado, pero algunos datos no pudieron cargarse: ' + e.message);
        });
      }

      // Reintenta la carga de módulos que dependen de Supabase sin tocar datos.
      await sleep(250);
      if (typeof window.cargarDeudas === 'function') await window.cargarDeudas().catch(console.error);
      if (typeof window.loadAccounts === 'function') await window.loadAccounts().catch(console.error);
    } catch (e) {
      console.error('FINANZAS RUNTIME FIX:', e);
      setStatus('No se pudo conectar: ' + (e?.message || e));
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = 'Conectar'; }
    }
  }

  function install() {
    const btn = $('saveConfig');
    if (!btn) return false;
    btn.onclick = connectFixed;
    window.finanzasConnect = connectFixed;
    return true;
  }

  // Sobrescribe el botón después de que app.js y los módulos hayan cargado.
  if (!install()) {
    const observer = new MutationObserver(() => { if (install()) observer.disconnect(); });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }

  // Si existen credenciales guardadas, intenta el arranque automático una sola vez.
  // El usuario puede cancelar/reintentar desde el mismo botón.
  setTimeout(() => {
    const u = localStorage.getItem('sf_url'), k = localStorage.getItem('sf_key');
    if (u && k && $('configPanel') && !$('configPanel').classList.contains('hidden')) connectFixed();
  }, 700);
})();
