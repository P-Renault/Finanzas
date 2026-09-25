/* B233 PRODUCCIÓN · CORRECCIÓN DEFINITIVA USER+PERIODO
 * Corrige la incompatibilidad entre RLS por usuario y la unicidad global por periodo.
 * Este archivo es un drop-in temporal: carga el B233 base y aplica únicamente
 * las correcciones de aislamiento por usuario.
 */
(() => {
  'use strict';
  if (window.__B233_PROD_USER_PERIOD_FIX_V4__) return;
  window.__B233_PROD_USER_PERIOD_FIX_V4__ = true;

  const SOURCE =
    'https://raw.githubusercontent.com/P-Renault/Finanzas/Backup/b233-motor-presupuesto.js?v=233.18';

  const showError = err => {
    console.error('[B233 USER+PERIOD FIX]', err);
    const msg = document.getElementById('b233Msg');
    if (msg) {
      msg.textContent = `Error inicializando Presupuesto: ${err?.message || err}`;
      msg.className = 'b233-msg error';
    }
  };

  fetch(SOURCE, {cache:'no-store'})
    .then(r => {
      if (!r.ok) throw new Error(`No se pudo cargar el B233 base (${r.status}).`);
      return r.text();
    })
    .then(source => {
      /*
       * 1) El presupuesto pertenece al usuario autenticado.
       *    La búsqueda debe usar user_id + periodo.
       */
      const findPattern =
        /const periodo = ym\(state\.month\);\s*let budget = await safeSingle\('presupuestos', q => q\.select\('\*'\)\.eq\('periodo',periodo\)\.maybeSingle\(\)\);/;

      const findReplacement = `const periodo = ym(state.month);
    const authResult = await db().auth.getUser();
    const userId = authResult?.data?.user?.id || null;

    if (!userId) {
      notify('No se pudo identificar al usuario autenticado. Cierra sesión y vuelve a ingresar.', false);
      return null;
    }

    let budget = await safeSingle(
      'presupuestos',
      q => q.select('*')
        .eq('periodo', periodo)
        .eq('user_id', userId)
        .maybeSingle()
    );`;

      if (!findPattern.test(source)) {
        throw new Error('No se encontró el bloque de búsqueda del presupuesto.');
      }
      source = source.replace(findPattern, findReplacement);

      /*
       * 2) La creación lleva explícitamente user_id.
       *    Si existe por una carrera/concurrencia, se recupera por usuario+periodo.
       */
      const insertPattern =
        /const r = await c\.from\('presupuestos'\)\.insert\(\{\s*periodo,\s*nombre:`Presupuesto \$\{monthLabel\(state\.month\)\}`,\s*estado:'activo'\s*\}\)\.select\('\*'\)\.single\(\);/;

      const insertReplacement = `let r = await c.from('presupuestos').insert({
        periodo,
        nombre:\`Presupuesto \${monthLabel(state.month)}\`,
        estado:'activo',
        user_id:userId
      }).select('*').single();

      if (r.error && r.error.code === '23505') {
        const existing = await c.from('presupuestos')
          .select('*')
          .eq('periodo', periodo)
          .eq('user_id', userId)
          .maybeSingle();

        if (!existing.error && existing.data) {
          r = {error:null, data:existing.data};
        }
      }`;

      if (!insertPattern.test(source)) {
        throw new Error('No se encontró el bloque de inserción del presupuesto.');
      }
      source = source.replace(insertPattern, insertReplacement);

      /*
       * 3) Las líneas presupuestarias también quedan asociadas al usuario.
       */
      const linePattern =
        /const payload = \{presupuesto_id:state\.budget\.id,categoria,tipo,monto_plan:monto,prioridad,descripcion\};/;

      const lineReplacement = `const lineAuth = await db().auth.getUser();
    const lineUserId = lineAuth?.data?.user?.id || null;

    if (!lineUserId) {
      notify('No se pudo identificar al usuario autenticado. Cierra sesión y vuelve a ingresar.', false);
      return;
    }

    const payload = {
      presupuesto_id:state.budget.id,
      categoria,
      tipo,
      monto_plan:monto,
      prioridad,
      descripcion,
      user_id:lineUserId
    };`;

      if (!linePattern.test(source)) {
        throw new Error('No se encontró el bloque de líneas presupuestarias.');
      }
      source = source.replace(linePattern, lineReplacement);

      if (!source.includes(".eq('user_id', userId)")) {
        throw new Error('La búsqueda por usuario no quedó aplicada.');
      }
      if (!source.includes('user_id:userId')) {
        throw new Error('El INSERT no quedó asociado al usuario.');
      }
      if (source.includes('presupuestos_periodo_uix')) {
        throw new Error('No se debe incorporar la restricción antigua al JavaScript.');
      }

      (0, eval)(source);
    })
    .catch(showError);
})();
