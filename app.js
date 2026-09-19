/* ============================================================
   B232.23 — CORE LOCAL DE ARRANQUE
   Solución de acceso/navegación:
   - no depende de raw.githubusercontent.com
   - una sola inicialización de Supabase
   - la interfaz no queda atrapada en Configuración si falla el probe
   - navegación delegada para módulos dinámicos
   - B232 Calendario como propietario visual
   ============================================================ */
(() => {
  'use strict';

  if (window.__CCF_CORE_23223__) return;
  window.__CCF_CORE_23223__ = true;

  let db = null;

  const $ = id => document.getElementById(id);
  const CLP = n => new Intl.NumberFormat('es-CL', {
    style:'currency', currency:'CLP', maximumFractionDigits:0
  }).format(Number(n)||0);

  const today = () => {
    const d = new Date();
    return new Date(d.getTime() - d.getTimezoneOffset()*60000)
      .toISOString().slice(0,10);
  };

  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({
    '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#039;'
  }[c]));

  const msg = (id, value) => {
    const el = $(id);
    if (el) el.textContent = value;
  };

  function setStatus(text) {
    let el = $('appStatus');
    if (!el) {
      el = document.createElement('p');
      el.id = 'appStatus';
      el.className = 'status';
      const app = $('app');
      if (app) app.insertBefore(el, app.firstChild);
    }
    el.textContent = text;
  }

  function revealApp() {
    $('configPanel')?.classList.add('hidden');
    $('app')?.classList.remove('hidden');
    $('logoutBtn')?.classList.remove('hidden');
  }

  function loadConfig() {
    const u = localStorage.getItem('sf_url') || '';
    const k = localStorage.getItem('sf_key') || '';
    if ($('supabaseUrl')) $('supabaseUrl').value = u;
    if ($('supabaseKey')) $('supabaseKey').value = k;
  }

  function resetDates() {
    if ($('movFecha')) $('movFecha').value = today();
    if ($('futureFecha')) $('futureFecha').value = today();
    if ($('savingFecha')) $('savingFecha').value = today();
  }

  async function connect() {
    const url = $('supabaseUrl')?.value.trim() || '';
    const key = $('supabaseKey')?.value.trim() || '';

    if (!url || !key) {
      msg('configMsg','Completa ambos campos.');
      return false;
    }

    const btn = $('saveConfig');
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Conectando...';
    }

    try {
      if (!window.supabase || typeof window.supabase.createClient !== 'function') {
        throw new Error('La biblioteca de Supabase no está disponible.');
      }

      db = window.supabase.createClient(url, key, {
        auth: { persistSession:false, autoRefreshToken:false }
      });

      localStorage.setItem('sf_url', url);
      localStorage.setItem('sf_key', key);

      // CRÍTICO: la interfaz se revela ANTES del probe.
      revealApp();
      setStatus('Supabase conectado. Verificando datos...');

      const probe = await db.from('movimientos').select('id').limit(1);

      if (probe.error) {
        console.error('[B232.23] probe', probe.error);
        setStatus('Interfaz disponible. Supabase respondió: ' + probe.error.message);
      } else {
        setStatus('Supabase conectado correctamente.');
      }

      await refresh();
      return true;

    } catch (e) {
      console.error('[B232.23] connect', e);

      // Nunca volver a ocultar la aplicación por un fallo de conexión.
      revealApp();
      setStatus('Interfaz disponible. Error de conexión: ' + (e?.message || e));
      return false;

    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = 'Conectar';
      }
    }
  }

  window.connect = connect;

  function navigateTab(id) {
    const section = $(id);
    if (!section) {
      console.warn('[B232.23] Sección no disponible:', id);
      return false;
    }

    document.querySelectorAll('.tab').forEach(s =>
      s.classList.toggle('hidden', s.id !== id)
    );

    document.querySelectorAll('.tabs button[data-tab]').forEach(b =>
      b.classList.toggle('active', b.dataset.tab === id)
    );

    localStorage.setItem('cf_active_tab_v2', id);

    try {
      // B232.30: Operaciones y Planificación tienen motor propietario.
      // No delegar a módulos legacy; el router B232.30 actualiza al pulsar.
      if ((id === 'ingresos' || id === 'jornadas') &&
          typeof window.b219Show === 'function') {
        window.b219Show(id);
      }

      if (id === 'calendario' &&
          window.B232Calendario &&
          typeof window.B232Calendario.load === 'function') {
        setTimeout(() => window.B232Calendario.load().catch(console.error), 0);
      }
    } catch (e) {
      console.error('[B232.23] navegación', e);
    }

    return true;
  }

  window.B23223Navigation = { version:'232.23', navigate:navigateTab };

  // Capture: evita que los handlers antiguos de app.js/módulos compitan.
  document.addEventListener('click', event => {
    const b = event.target.closest?.('.tabs button[data-tab]');
    if (!b) return;

    event.preventDefault();
    event.stopImmediatePropagation();
    navigateTab(b.dataset.tab);
  }, true);

  function encodeObj(r) {
    return btoa(unescape(encodeURIComponent(JSON.stringify(r))));
  }

  function decodeObj(s) {
    try {
      return JSON.parse(decodeURIComponent(escape(atob(s))));
    } catch {
      return null;
    }
  }

  function cacheData() {
    return window.__CCF_CACHE__ || {mov:[], fut:[], sav:[]};
  }

  async function refresh() {
    if (!db) return;

    try {
      const [rm, rf, rs] = await Promise.all([
        db.from('movimientos').select('*').order('fecha',{ascending:false}),
        db.from('compromisos').select('*').order('fecha_vencimiento',{ascending:true}),
        db.from('ahorro').select('*').order('fecha',{ascending:false})
      ]);

      if (rm.error || rf.error || rs.error) {
        console.error('[B232.23] refresh', rm.error || rf.error || rs.error);
        setStatus('Supabase respondió con un error al cargar los datos.');
        return;
      }

      const data = {
        mov: rm.data || [],
        fut: rf.data || [],
        sav: rs.data || []
      };

      window.__CCF_CACHE__ = data;

      renderMov(data.mov);
      renderFuture(data.fut);
      renderSaving(data.sav);
      renderDash(data.mov, data.fut, data.sav);

      const host = $('calendario');
      if (host && !host.classList.contains('hidden') &&
          window.B232Calendario?.load) {
        await window.B232Calendario.load();
      }

    } catch (e) {
      console.error('[B232.23] refresh', e);
      setStatus('Error cargando información: ' + (e?.message || e));
    }
  }

  window.refresh = refresh;

  function resetMov() {
    $('movForm')?.reset();
    if ($('movId')) $('movId').value = '';
    if ($('movFormTitle')) $('movFormTitle').textContent = 'Registrar movimiento';
    if ($('movSubmit')) $('movSubmit').textContent = 'Guardar movimiento';
    $('movCancel')?.classList.add('hidden');
    if ($('movFecha')) $('movFecha').value = today();
  }

  function resetFuture() {
    $('futureForm')?.reset();
    if ($('futureId')) $('futureId').value = '';
    if ($('futureFormTitle')) $('futureFormTitle').textContent = 'Crear pago o compromiso futuro';
    if ($('futureSubmit')) $('futureSubmit').textContent = 'Crear compromiso';
    $('futureCancel')?.classList.add('hidden');
    if ($('futureFecha')) $('futureFecha').value = today();
  }

  function resetSaving() {
    $('savingForm')?.reset();
    if ($('savingId')) $('savingId').value = '';
    if ($('savingFormTitle')) $('savingFormTitle').textContent = 'Fondo de ahorro';
    if ($('savingSubmit')) $('savingSubmit').textContent = 'Registrar';
    $('savingCancel')?.classList.add('hidden');
    if ($('savingFecha')) $('savingFecha').value = today();
  }

  function installForms() {
    $('movForm')?.addEventListener('submit', async e => {
      e.preventDefault();
      if (!db) return msg('movMsg','Conecta Supabase.');
      msg('movMsg','Guardando...');

      const id = $('movId')?.value;
      const p = {
        tipo:$('movTipo').value,
        fecha:$('movFecha').value,
        monto:Number($('movMonto').value)||0,
        categoria:$('movCategoria').value.trim(),
        descripcion:$('movDescripcion').value.trim()
      };

      const r = id
        ? await db.from('movimientos').update(p).eq('id',id)
        : await db.from('movimientos').insert(p);

      if (r.error) return msg('movMsg',r.error.message);
      msg('movMsg', id ? 'Movimiento actualizado.' : 'Movimiento guardado.');
      resetMov();
      await refresh();
    });

    $('movCancel')?.addEventListener('click', resetMov);

    $('futureForm')?.addEventListener('submit', async e => {
      e.preventDefault();
      if (!db) return msg('futureMsg','Conecta Supabase.');
      msg('futureMsg','Guardando...');

      const id = $('futureId')?.value;
      const p = {
        concepto:$('futureConcepto').value.trim(),
        fecha_vencimiento:$('futureFecha').value,
        monto:Number($('futureMonto').value)||0,
        categoria:$('futureCategoria').value.trim(),
        periodicidad:$('futureRecurrence').value,
        notas:$('futureNotas').value.trim()
      };

      const r = id
        ? await db.from('compromisos').update(p).eq('id',id)
        : await db.from('compromisos').insert({...p,estado:'pendiente'});

      if (r.error) return msg('futureMsg',r.error.message);
      msg('futureMsg', id ? 'Compromiso actualizado.' : 'Compromiso creado.');
      resetFuture();
      await refresh();
    });

    $('futureCancel')?.addEventListener('click', resetFuture);

    $('savingForm')?.addEventListener('submit', async e => {
      e.preventDefault();
      if (!db) return msg('savingMsg','Conecta Supabase.');
      msg('savingMsg','Guardando...');

      const id = $('savingId')?.value;
      const p = {
        tipo:$('savingTipo').value,
        fecha:$('savingFecha').value,
        monto:Number($('savingMonto').value)||0,
        descripcion:$('savingDescripcion').value.trim()
      };

      const r = id
        ? await db.from('ahorro').update(p).eq('id',id)
        : await db.from('ahorro').insert(p);

      if (r.error) return msg('savingMsg',r.error.message);
      msg('savingMsg', id ? 'Registro actualizado.' : 'Movimiento de ahorro guardado.');
      resetSaving();
      await refresh();
    });

    $('savingCancel')?.addEventListener('click', resetSaving);

    window.editMovEncoded = s => {
      const r = decodeObj(s); if (!r) return;
      $('movId').value=r.id;
      $('movTipo').value=r.tipo;
      $('movFecha').value=r.fecha;
      $('movMonto').value=r.monto;
      $('movCategoria').value=r.categoria||'';
      $('movDescripcion').value=r.descripcion||'';
      $('movFormTitle').textContent='Editar movimiento';
      $('movSubmit').textContent='Guardar cambios';
      $('movCancel').classList.remove('hidden');
      navigateTab('movimientos');
      window.scrollTo({top:0,behavior:'smooth'});
    };

    window.deleteMov = async id => {
      if (!confirm('¿Eliminar este movimiento?')) return;
      const r = await db.from('movimientos').delete().eq('id',id);
      if (r.error) return alert(r.error.message);
      await refresh();
    };

    window.editFutureEncoded = s => {
      const r = decodeObj(s); if (!r) return;
      $('futureId').value=r.id;
      $('futureConcepto').value=r.concepto||'';
      $('futureFecha').value=r.fecha_vencimiento||'';
      $('futureMonto').value=r.monto||0;
      $('futureCategoria').value=r.categoria||'';
      $('futureRecurrence').value=r.periodicidad||'unico';
      $('futureNotas').value=r.notas||'';
      $('futureFormTitle').textContent='Editar compromiso';
      $('futureSubmit').textContent='Guardar cambios';
      $('futureCancel').classList.remove('hidden');
      navigateTab('futuros');
      window.scrollTo({top:0,behavior:'smooth'});
    };

    window.deleteFuture = async id => {
      if (!confirm('¿Eliminar este compromiso?')) return;
      const r = await db.from('compromisos').delete().eq('id',id);
      if (r.error) return alert(r.error.message);
      await refresh();
    };

    window.markPaid = async id => {
      const r = await db.from('compromisos').update({estado:'pagado'}).eq('id',id);
      if (r.error) return alert(r.error.message);
      await refresh();
    };

    window.editSavingEncoded = s => {
      const r = decodeObj(s); if (!r) return;
      $('savingId').value=r.id;
      $('savingTipo').value=r.tipo;
      $('savingFecha').value=r.fecha;
      $('savingMonto').value=r.monto;
      $('savingDescripcion').value=r.descripcion||'';
      $('savingFormTitle').textContent='Editar ahorro';
      $('savingSubmit').textContent='Guardar cambios';
      $('savingCancel').classList.remove('hidden');
      navigateTab('ahorro');
      window.scrollTo({top:0,behavior:'smooth'});
    };

    window.deleteSaving = async id => {
      if (!confirm('¿Eliminar este registro de ahorro?')) return;
      const r = await db.from('ahorro').delete().eq('id',id);
      if (r.error) return alert(r.error.message);
      await refresh();
    };
  }

  function renderMov(rows) {
    const el = $('movimientosLista'); if (!el) return;
    el.innerHTML = rows.length ? rows.map(r => {
      const amount = r.tipo === 'gasto' ? -Number(r.monto) : Number(r.monto);
      const enc = encodeObj(r);
      return `<div class="row"><div class="row-main"><b>${r.tipo==='ingreso'?'Ingreso':'Gasto'} · ${esc(r.categoria||'Sin categoría')}</b><div>${esc(r.descripcion||'')}</div><small>${esc(r.fecha)}</small></div><div class="row-right"><strong class="${amount<0?'negative':'positive'}">${amount<0?'-':'+'}${CLP(Math.abs(amount))}</strong><div class="actions"><button class="small" onclick="editMovEncoded('${enc}')">Editar</button><button class="small danger" onclick="deleteMov(${Number(r.id)})">Borrar</button></div></div></div>`;
    }).join('') : '<p class="muted">Sin movimientos.</p>';
  }

  function renderFuture(rows) {
    const el = $('futurosLista'); if (!el) return;
    el.innerHTML = rows.length ? rows.map(r => {
      const enc=encodeObj(r);
      return `<div class="row"><div class="row-main"><b>${esc(r.concepto)}</b><div>${esc(r.categoria||'')} · ${esc(r.periodicidad||'')}</div><small>${esc(r.fecha_vencimiento)}</small></div><div class="row-right"><strong>${CLP(r.monto)}</strong><div class="actions"><button class="small" onclick="editFutureEncoded('${enc}')">Editar</button><button class="small danger" onclick="deleteFuture(${Number(r.id)})">Borrar</button>${r.estado==='pendiente'?`<button class="small paid" onclick="markPaid(${Number(r.id)})">Pagado</button>`:'<span class="pill paid">Pagado</span>'}</div></div></div>`;
    }).join('') : '<p class="muted">No hay compromisos.</p>';
  }

  function renderSaving(rows) {
    const total=rows.reduce((s,r)=>s+(r.tipo==='aporte'?Number(r.monto):-Number(r.monto)),0);
    if ($('savingBalance')) $('savingBalance').textContent=CLP(total);
    const el=$('ahorroLista'); if (!el) return;
    el.innerHTML=rows.length ? rows.map(r => {
      const enc=encodeObj(r);
      return `<div class="row"><div class="row-main"><b>${r.tipo==='aporte'?'Aporte':'Retiro'}</b><div>${esc(r.descripcion||'')}</div><small>${esc(r.fecha)}</small></div><div class="row-right"><strong>${r.tipo==='aporte'?'+':'-'}${CLP(r.monto)}</strong><div class="actions"><button class="small" onclick="editSavingEncoded('${enc}')">Editar</button><button class="small danger" onclick="deleteSaving(${Number(r.id)})">Borrar</button></div></div></div>`;
    }).join('') : '<p class="muted">Sin registros de ahorro.</p>';
  }

  function renderDash(mov,fut,sav) {
    const t=today();
    const actual=mov.filter(r=>r.fecha<=t);
    const prefix=t.slice(0,7);
    const inc=actual.filter(r=>r.tipo==='ingreso'&&String(r.fecha).startsWith(prefix)).reduce((s,r)=>s+Number(r.monto),0);
    const exp=actual.filter(r=>r.tipo==='gasto'&&String(r.fecha).startsWith(prefix)).reduce((s,r)=>s+Number(r.monto),0);
    const ci=actual.filter(r=>r.tipo==='ingreso').reduce((s,r)=>s+Number(r.monto),0);
    const ce=actual.filter(r=>r.tipo==='gasto').reduce((s,r)=>s+Number(r.monto),0);
    const comm=fut.filter(r=>r.estado==='pendiente').reduce((s,r)=>s+Number(r.monto),0);
    const fi=mov.filter(r=>r.tipo==='ingreso'&&r.fecha>t).reduce((s,r)=>s+Number(r.monto),0);
    const fe=mov.filter(r=>r.tipo==='gasto'&&r.fecha>t).reduce((s,r)=>s+Number(r.monto),0);
    const ah=sav.reduce((s,r)=>s+(r.tipo==='aporte'?Number(r.monto):-Number(r.monto)),0);

    const set=(id,v)=>{if($(id))$(id).textContent=CLP(v)};
    set('saldo',ci-ce); set('ingresosMes',inc); set('gastosMes',exp);
    set('comprometido',comm); set('proyectado',ci-ce+fi-fe-comm);
    set('ahorroTotal',ah); set('ingresosFuturos',fi); set('gastosFuturos',fe);
    set('totalPagadoMes',exp);

    const pending=fut.filter(r=>r.estado==='pendiente'&&String(r.fecha_vencimiento).startsWith(prefix));
    const pendingTotal=pending.reduce((s,r)=>s+Number(r.monto),0);
    set('totalPendienteMes',pendingTotal);
    set('totalGastosPagarMes',exp+pendingTotal);

    const list=$('proximosPagos');
    if (list) list.innerHTML=fut.filter(r=>r.estado==='pendiente').slice(0,8)
      .map(r=>`<div class="row"><span>${esc(r.concepto)}<br><small>${esc(r.fecha_vencimiento)}</small></span><strong>${CLP(r.monto)}</strong></div>`).join('')
      || '<p class="muted">No tienes pagos pendientes.</p>';
  }

  function boot() {
    resetDates();
    loadConfig();
    installForms();

    const saved = localStorage.getItem('sf_url') && localStorage.getItem('sf_key');
    if (saved) {
      connect();
    }

    // El botón se instala aquí y queda protegido contra handlers duplicados.
    const btn=$('saveConfig');
    if (btn && !btn.dataset.b23223) {
      btn.dataset.b23223='1';
      btn.onclick=connect;
    }

    const logout=$('logoutBtn');
    if (logout && !logout.dataset.b23223) {
      logout.dataset.b23223='1';
      logout.onclick=()=>{
        db=null;
        localStorage.removeItem('sf_url');
        localStorage.removeItem('sf_key');
        localStorage.removeItem('cf_active_tab_v2');
        location.reload();
      };
    }

    const savedTab=localStorage.getItem('cf_active_tab_v2');
    if (savedTab) setTimeout(()=>navigateTab(savedTab),900);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded',boot,{once:true});
  } else {
    boot();
  }
})();
