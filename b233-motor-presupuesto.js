/* B233 RLS FIX - drop-in loader for Backup branch
 * Loads the canonical B233 module, injects auth.uid() into budget inserts,
 * then executes the corrected module. No RLS policy changes.
 */
(() => {
  'use strict';
  if (window.__B233_RLS_FIX__) return;
  window.__B233_RLS_FIX__ = true;

  const SOURCE = 'https://raw.githubusercontent.com/P-Renault/Finanzas/Backup/b233-motor-presupuesto.js';

  fetch(SOURCE, { cache: 'no-store' })
    .then(r => {
      if (!r.ok) throw new Error(`No se pudo cargar B233 original (${r.status})`);
      return r.text();
    })
    .then(source => {
      const oldBudget = `const r = await c.from('presupuestos').insert({\n        periodo,\n        nombre:\`Presupuesto \${monthLabel(state.month)}\`,\n        estado:'activo'\n      }).select('*').single();`;
      const newBudget = `let userId = null;\n      try {\n        const session = await c.auth.getUser();\n        userId = session?.data?.user?.id || null;\n      } catch (e) {\n        console.warn('[B233] No se pudo obtener el usuario autenticado:', e);\n      }\n\n      if (!userId) {\n        notify('No se pudo identificar al usuario autenticado. Cierra sesión y vuelve a ingresar.', false);\n        return null;\n      }\n\n      const r = await c.from('presupuestos').insert({\n        periodo,\n        nombre:\`Presupuesto \${monthLabel(state.month)}\`,\n        estado:'activo',\n        user_id:userId\n      }).select('*').single();`;

      const oldLine = `const payload = {presupuesto_id:state.budget.id,categoria,tipo,monto_plan:monto,prioridad,descripcion};`;
      const newLine = `let userId = null;\n    try {\n      const session = await db().auth.getUser();\n      userId = session?.data?.user?.id || null;\n    } catch (e) {\n      console.warn('[B233] No se pudo obtener el usuario autenticado:', e);\n    }\n\n    if (!userId) {\n      notify('No se pudo identificar al usuario autenticado. Cierra sesión y vuelve a ingresar.', false);\n      return;\n    }\n\n    const payload = {\n      presupuesto_id:state.budget.id,\n      categoria,\n      tipo,\n      monto_plan:monto,\n      prioridad,\n      descripcion,\n      user_id:userId\n    };`;

      if (!source.includes(oldBudget)) throw new Error('Bloque de creación de presupuesto no encontrado.');
      if (!source.includes(oldLine)) throw new Error('Bloque de línea presupuestaria no encontrado.');

      source = source.replace(oldBudget, newBudget).replace(oldLine, newLine);
      (0, eval)(source);
    })
    .catch(err => {
      console.error('[B233 RLS FIX]', err);
      const msg = document.getElementById('b233Msg');
      if (msg) {
        msg.textContent = `Error inicializando Presupuesto: ${err.message || err}`;
        msg.className = 'b233-msg error';
      }
    });
})();
