/* B233 PRODUCCIÓN · CORRECCIÓN RLS · DROP-IN
 * Sustituye el loader anterior. Mantiene la arquitectura B233 original,
 * pero garantiza que los INSERT/UPSERT lleven auth.uid() como user_id.
 * No modifica ni desactiva políticas RLS.
 */
(() => {
  'use strict';
  if (window.__B233_PROD_RLS_FIX_V2__) return;
  window.__B233_PROD_RLS_FIX_V2__ = true;

  const SOURCE = 'https://raw.githubusercontent.com/P-Renault/Finanzas/Backup/b233-motor-presupuesto.js?v=233.19-r1';

  const showError = err => {
    console.error('[B233 RLS PRODUCCIÓN]', err);
    const msg = document.getElementById('b233Msg');
    if (msg) {
      msg.textContent = `Error inicializando Presupuesto: ${err?.message || err}`;
      msg.className = 'b233-msg error';
    }
  };

  fetch(SOURCE, { cache: 'no-store' })
    .then(response => {
      if (!response.ok) throw new Error(`No se pudo cargar el motor B233 base (${response.status}).`);
      return response.text();
    })
    .then(source => {
      const budgetPattern = /const r = await c\.from\('presupuestos'\)\.insert\(\{\s*periodo,\s*nombre:`Presupuesto \$\{monthLabel\(state\.month\)\}`,\s*estado:'activo'\s*\}\)\.select\('\*'\)\.single\(\);/;
      const budgetReplacement = `const userResult = await c.auth.getUser();
      const userId = userResult?.data?.user?.id || null;

      if (!userId) {
        notify('No se pudo identificar al usuario autenticado. Cierra sesión y vuelve a ingresar.', false);
        return null;
      }

      const r = await c.from('presupuestos').insert({
        periodo,
        nombre:\`Presupuesto \${monthLabel(state.month)}\`,
        estado:'activo',
        user_id:userId
      }).select('*').single();`;

      if (!budgetPattern.test(source)) throw new Error('No se encontró el bloque de INSERT de presupuestos en B233.');
      source = source.replace(budgetPattern, budgetReplacement);

      const linePattern = /const payload = \{presupuesto_id:state\.budget\.id,categoria,tipo,monto_plan:monto,prioridad,descripcion\};/;
      const lineReplacement = `const userIdResult = await db().auth.getUser();
    const userId = userIdResult?.data?.user?.id || null;

    if (!userId) {
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
      user_id:userId
    };`;

      if (!linePattern.test(source)) throw new Error('No se encontró el bloque de líneas presupuestarias en B233.');
      source = source.replace(linePattern, lineReplacement);

      if (!source.includes('user_id:userId')) throw new Error('La corrección RLS no pudo ser inyectada en B233.');
      (0, eval)(source);
    })
    .catch(showError);
})();
