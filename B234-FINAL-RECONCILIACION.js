/* CCF B234 FINAL — RECONCILIACIÓN QUIRÚRGICA
   Versión corregida: el resumen .b234-summary pertenece exclusivamente
   a B232.34. Este módulo solo alimenta IA, Planificación y Operaciones.
*/
(() => {
  'use strict';
  if (window.__CCF_B234_FINAL_RUNTIME__) return;
  window.__CCF_B234_FINAL_RUNTIME__ = true;

  const money = n => new Intl.NumberFormat('es-CL', {
    style:'currency', currency:'CLP', maximumFractionDigits:0
  }).format(Math.round(Number(n) || 0));
  const num = v => Number.isFinite(Number(v)) ? Number(v) : 0;
  const today = () => {
    const d = new Date();
    return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,10);
  };
  const addDays = (iso, days) => {
    const d = new Date(`${iso}T12:00:00`);
    d.setDate(d.getDate()+days);
    return d.toISOString().slice(0,10);
  };
  const db = () => window.supabaseClient || window.db || window.__db || null;

  async function read(p) {
    try {
      const r = await p;
      return {data:r?.data || [], error:r?.error || null};
    } catch (error) {
      return {data:[], error};
    }
  }

  async function snapshot30() {
    const c = db();
    if (!c) return null;

    const t = today();
    const end = addDays(t,29);
    const pending = v =>
      !/pagad|cobrad|realiz|cancel|cerrad|liquid/i.test(
        String(v ?? '').trim().toLowerCase()
      );

    const [futureRows,movements,planned,commitments,quotas] = await Promise.all([
      read(c.from('ingresos_futuros').select('*').gte('fecha',t).lte('fecha',end)),
      read(c.from('movimientos').select('id,tipo,fecha,monto').gte('fecha',t).lte('fecha',end)),
      read(c.from('gastos_planificados').select('*').gte('fecha',t).lte('fecha',end)),
      read(c.from('compromisos').select('*').eq('estado','pendiente').gte('fecha_vencimiento',t).lte('fecha_vencimiento',end)),
      read(c.from('cuotas_deuda').select('*').in('estado',['pendiente','vencida','atrasada']).gte('fecha_vencimiento',t).lte('fecha_vencimiento',end))
    ]);

    const future = futureRows.data.filter(x=>pending(x.estado));
    const linkedIds = new Set(
      future.map(x=>x.movimiento_id ?? x.movement_id ?? x.movimientoId)
        .filter(v=>v!=null).map(String)
    );

    const programmedIncome = future.reduce(
      (s,x)=>s+num(x.monto ?? x.monto_neto ?? x.valor ?? x.monto_bruto),0
    );
    const futureMovementIncome = movements.data
      .filter(x=>String(x.tipo||'').toLowerCase()==='ingreso')
      .filter(x=>!linkedIds.has(String(x.id)))
      .reduce((s,x)=>s+num(x.monto),0);

    const plannedExpense = planned.data.filter(x=>pending(x.estado))
      .reduce((s,x)=>s+num(x.monto ?? x.valor),0);
    const commitmentsTotal = commitments.data.filter(x=>pending(x.estado))
      .reduce((s,x)=>s+num(x.monto),0);
    const quotasTotal = quotas.data.filter(x=>pending(x.estado))
      .reduce((s,x)=>s+num(x.monto ?? x.monto_cuota ?? x.valor),0);

    return {
      start:t,
      end,
      programmedIncome,
      futureMovementIncome,
      futureIncome:programmedIncome+futureMovementIncome,
      plannedExpense,
      commitments:commitmentsTotal,
      quotas:quotasTotal,
      obligations30d:plannedExpense+commitmentsTotal+quotasTotal
    };
  }

  function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = money(value);
  }

  function patchOperations(s) {
    setText('f24Future', s.futureIncome);
    setText('f24Oblig', s.obligations30d);
    const status=document.getElementById('f24OpsStatus');
    if(status) status.textContent =
      `Actualizado: ingresos futuros consolidados ${money(s.futureIncome)}, obligaciones 30 días ${money(s.obligations30d)}.`;
  }

  function patchIA(s) {
    setText('b227In', s.futureIncome);
    setText('b227Out', s.obligations30d);
    const answer=document.getElementById('b227Answer');
    if(answer) answer.textContent =
      `Datos reconciliados al ${s.start}. Ingresos futuros consolidados: ${money(s.futureIncome)}. Obligaciones próximos 30 días: ${money(s.obligations30d)}.`;
  }

  function patchPlan(s) {
    const host=document.getElementById('b216Content');
    if(!host) return;

    host.querySelectorAll('.b23224-kpi').forEach(k=>{
      const label=(k.querySelector('span')?.textContent||'').trim().toLowerCase();
      const strong=k.querySelector('strong');
      const small=k.querySelector('small');
      if(!strong) return;

      if(label==='ingresos futuros'){
        strong.textContent=money(s.futureIncome);
        if(small) small.textContent='ingresos consolidados · próximos 30 días';
      }

      if(label==='obligaciones'){
        strong.textContent=money(s.obligations30d);
        if(small) small.textContent='Planificados + compromisos + deuda · 30 días';
      }
    });
  }

  async function run() {
    try {
      const snap = await snapshot30();
      if (!snap) return;

      window.__CCF_B234_FINAL_SNAPSHOT__ = snap;
      patchPlan(snap);
      patchIA(snap);
      patchOperations(snap);
    } catch (e) {
      console.warn('[CCF B234 FINAL]', e);
    }
  }

  const schedule = () => {
    run();
    setTimeout(run, 700);
    setTimeout(run, 1800);
    setTimeout(run, 3500);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', schedule, {once:true});
  } else {
    schedule();
  }

  document.addEventListener('click', e => {
    if (e.target.closest('[data-tab="dashboard"],[data-tab="planificacion"],[data-tab="operaciones"]')) {
      setTimeout(run,180);
    }
  }, true);

  window.CCFB234Final = { refresh: run };
})();
