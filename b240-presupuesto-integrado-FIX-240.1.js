/* B2.40 — Motor de Presupuesto Integrado
   Fuente de verdad:
   - movimientos: ingresos/gastos reales
   - compromisos: pagos futuros
   - ahorro: aportes/retiros
   - deudas/operaciones/planificación: consumo mediante puentes existentes cuando están disponibles
   Persistencia propia: presupuesto mensual + partidas. No duplica transacciones reales. */
(function(){
'use strict';

if(window.B240Presupuesto) return;

const S={
  y:new Date().getFullYear(), m:new Date().getMonth(),
  budget:null, items:[], movements:[], commitments:[], savings:[],
  debts:[], operations:[], planning:[], initialized:false
};

const $=id=>document.getElementById(id);
const money=n=>new Intl.NumberFormat('es-CL',{style:'currency',currency:'CLP',maximumFractionDigits:0}).format(Math.round(Number(n)||0));
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const period=()=>`${S.y}-${String(S.m+1).padStart(2,'0')}`;
const monthLabel=()=>new Intl.DateTimeFormat('es-CL',{month:'long',year:'numeric'}).format(new Date(S.y,S.m,1));
const today=new Date();
const sb=()=>window.supabaseClient || window.__supabase || (window.supabase && typeof window.supabase.from==='function'?window.supabase:null);

function uid(){
  return sb()?.auth?.getUser ? sb().auth.getUser().then(x=>x.data?.user?.id||null):Promise.resolve(null);
}

function unwrap(value){
  if(Array.isArray(value)) return value;
  if(value && Array.isArray(value.data)) return value.data;
  return [];
}

function firstGlobal(names){
  for(const n of names){
    if(window[n]!==undefined){
      const a=unwrap(window[n]);
      if(a.length) return a;
    }
  }
  return [];
}

function norm(r){
  return {
    date:r.fecha||r.date||r.fecha_pago||r.vencimiento||r.created_at?.slice?.(0,10)||'',
    type:String(r.tipo||r.type||r.kind||'').toLowerCase(),
    amount:Number(r.monto??r.amount??r.importe??r.valor??0)||0,
    category:r.categoria||r.category||r.tipo_deuda||'Otros',
    description:r.descripcion||r.description||r.concepto||r.nombre||''
  };
}

function collectBridges(){
  S.movements=firstGlobal(['B221_MOVIMIENTOS','B221Movimientos','movimientos','movements']).map(norm);
  S.commitments=firstGlobal(['B221_COMPROMISOS','B222_COMPROMISOS','compromisos','pagosFuturos','futuros']).map(norm);
  S.savings=firstGlobal(['B229_AHORRO','B229Ahorro','ahorro','ahorros','savings']).map(norm);
  S.debts=firstGlobal(['B236_DEUDAS','B236Deudas','deudas','debts']).map(norm);
  S.operations=firstGlobal(['B238_OPERACIONES','B238Operaciones','operaciones','operations']).map(norm);
  S.planning=firstGlobal(['B237_PLANIFICACION','B237Planificacion','planificacion','planning']).map(norm);
}

/* FIX B2.40:
   presupuestos_periodo_uix exige un único presupuesto por período.
   La versión anterior filtraba por user_id y luego intentaba INSERTAR
   cuando no encontraba la fila, provocando duplicate key. */
async function loadOwnBudget(){
  const c=sb(), user=await uid();
  if(!c) throw new Error('No existe una conexión Supabase activa.');

  const p=period();

  // La unidad del presupuesto es el período mensual.
  let b=await c.from('presupuestos')
    .select('*')
    .eq('periodo',p)
    .maybeSingle();

  if(b.error) throw b.error;

  if(!b.data){
    const payload={
      periodo:p,
      nombre:`Presupuesto ${monthLabel()}`,
      estado:'activo'
    };

    if(user) payload.user_id=user;

    let ins=await c.from('presupuestos')
      .insert(payload)
      .select()
      .single();

    // Si otra ejecución creó el mismo período, recuperarlo.
    if(ins.error){
      const msg=String(ins.error.message||ins.error.details||'').toLowerCase();
      const duplicate=
        ins.error.code==='23505' ||
        msg.includes('presupuestos_periodo_uix') ||
        msg.includes('duplicate key');

      if(duplicate){
        b=await c.from('presupuestos')
          .select('*')
          .eq('periodo',p)
          .maybeSingle();

        if(b.error) throw b.error;

        if(!b.data){
          throw new Error(
            'Existe un presupuesto para '+p+
            ', pero Supabase no permite recuperarlo con las políticas actuales (RLS).'
          );
        }

        S.budget=b.data;
      }else{
        throw ins.error;
      }
    }else{
      S.budget=ins.data;
    }
  }else{
    S.budget=b.data;
  }

  if(!S.budget?.id){
    throw new Error('No se pudo determinar el presupuesto mensual de '+p+'.');
  }

  const q=await c.from('presupuesto_partidas')
    .select('*')
    .eq('presupuesto_id',S.budget.id)
    .order('tipo')
    .order('categoria');

  if(q.error) throw q.error;
  S.items=q.data||[];
}

function monthlyRows(rows){
  return rows.filter(r=>String(r.date).startsWith(period()));
}

function totals(){
  const mov=monthlyRows(S.movements);
  const income=mov.filter(r=>['ingreso','income'].includes(r.type)).reduce((a,r)=>a+r.amount,0);
  const expense=mov.filter(r=>['gasto','expense'].includes(r.type)).reduce((a,r)=>a+r.amount,0);
  const sav=monthlyRows(S.savings).filter(r=>['aporte','deposito','deposit','saving'].includes(r.type))
    .reduce((a,r)=>a+r.amount,0);
  const future=monthlyRows(S.commitments).filter(r=>!['pagado','paid','cancelado'].includes(r.type))
    .reduce((a,r)=>a+r.amount,0);
  return {income,expense,sav,future,free:income-expense-sav};
}

function planned(){
  return {
    income:S.items.filter(i=>i.tipo==='ingreso').reduce((a,i)=>a+Number(i.monto_planificado||0),0),
    expense:S.items.filter(i=>['fijo','variable','deuda'].includes(i.tipo)).reduce((a,i)=>a+Number(i.monto_planificado||0),0),
    saving:S.items.filter(i=>i.tipo==='ahorro').reduce((a,i)=>a+Number(i.monto_planificado||0),0)
  };
}

function realByCategory(){
  const map={};
  monthlyRows(S.movements).forEach(r=>{
    const k=r.category||'Otros';
    if(!map[k]) map[k]={income:0,expense:0};
    if(['ingreso','income'].includes(r.type)) map[k].income+=r.amount;
    if(['gasto','expense'].includes(r.type)) map[k].expense+=r.amount;
  });
  return map;
}

function render(){
  $('b240Month').textContent=monthLabel();
  const p=planned(),r=totals(),cats=realByCategory();
  $('b240PlanIncome').textContent=money(p.income);
  $('b240PlanExpense').textContent=money(p.expense);
  $('b240PlanSaving').textContent=money(p.saving);
  $('b240PlanFree').textContent=money(p.income-p.expense-p.saving);
  $('b240RealIncome').textContent=money(r.income);
  $('b240RealExpense').textContent=money(r.expense);
  $('b240RealSaving').textContent=money(r.sav);
  $('b240RealFree').textContent=money(r.free);

  if(!S.items.length){
    $('b240Categories').innerHTML='<div class="b240-empty">No existen partidas para este mes. Agrega el presupuesto sin alterar los registros reales.</div>';
  }else{
    $('b240Categories').innerHTML='<div class="calendar-scroll"><table class="b240-table"><thead><tr><th>Categoría</th><th>Tipo</th><th>Plan</th><th>Real</th><th>Desviación</th><th>Uso</th><th></th></tr></thead><tbody>'+
      S.items.map(i=>{
        const plan=Number(i.monto_planificado||0);
        const real= i.tipo==='ingreso' ? Number(cats[i.categoria]?.income||0) : Number(cats[i.categoria]?.expense||0);
        const dev=real-plan;
        const pct=plan?Math.min(150,Math.abs(real/plan*100)):0;
        const cls=(i.tipo==='ingreso'?real>=plan:real<=plan)?'b240-ok':pct>=85?'b240-warn':'b240-ok';
        return `<tr><td>${esc(i.categoria)}</td><td>${esc(i.tipo)}</td><td class="b240-right">${money(plan)}</td><td class="b240-right">${money(real)}</td><td class="b240-right">${money(dev)}</td><td><div class="b240-progress ${cls}"><div class="b240-bar"><i style="width:${Math.min(100,pct)}%"></i></div><small>${pct.toFixed(0)}%</small></div></td><td><button class="secondary" data-b240-edit="${i.id}">Editar</button> <button class="secondary" data-b240-del="${i.id}">Excluir</button></td></tr>`;
      }).join('')+'</tbody></table></div>';
  }

  const days=new Date(S.y,S.m+1,0).getDate();
  const elapsed=(S.y===today.getFullYear()&&S.m===today.getMonth())?today.getDate():days;
  const daily=r.expense/Math.max(1,elapsed);
  const projectedExpense=r.expense+daily*Math.max(0,days-elapsed);
  const projected=r.income-projectedExpense-r.sav-r.future;
  $('b240Projection').innerHTML=`<div class="b240-grid">
    <div class="b240-card"><span>Pagos futuros del mes</span><strong>${money(r.future)}</strong></div>
    <div class="b240-card"><span>Gasto proyectado</span><strong>${money(projectedExpense)}</strong></div>
    <div class="b240-card"><span>Saldo proyectado</span><strong>${money(projected)}</strong></div>
    <div class="b240-card"><span>Días restantes</span><strong>${Math.max(0,days-elapsed)}</strong></div>
  </div><p class="b240-note">La proyección combina ejecución real y compromisos futuros disponibles. No transforma pagos futuros en saldo actual.</p>`;

  const alerts=[];
  if(p.expense && r.expense>=p.expense) alerts.push(['b240-danger','El gasto ejecutado alcanzó o superó el presupuesto planificado.']);
  else if(p.expense && r.expense>=p.expense*.85) alerts.push(['b240-warn','El gasto ejecutado alcanzó el 85% del presupuesto.']);
  if(p.income && S.y===today.getFullYear()&&S.m===today.getMonth() && r.income < p.income*(elapsed/days)*.75)
    alerts.push(['b240-warn','El ingreso ejecutado está por debajo del ritmo planificado para el día actual.']);
  if(projected<0) alerts.push(['b240-danger','La proyección del mes resulta negativa considerando compromisos futuros registrados.']);
  if(!alerts.length) alerts.push(['b240-ok','No hay alertas presupuestarias críticas con los datos actualmente disponibles.']);
  $('b240Alerts').innerHTML=alerts.map(a=>`<div class="b240-alert ${a[0]}">${esc(a[1])}</div>`).join('');

  $('b240Sources').innerHTML=`<div class="b240-grid">
    <div class="b240-card"><span>Movimientos</span><strong>${S.movements.length}</strong></div>
    <div class="b240-card"><span>Compromisos</span><strong>${S.commitments.length}</strong></div>
    <div class="b240-card"><span>Ahorro</span><strong>${S.savings.length}</strong></div>
    <div class="b240-card"><span>Deudas / Operaciones / Planificación</span><strong>${S.debts.length+S.operations.length+S.planning.length}</strong></div>
  </div>`;
}

async function editItem(item){
  const tipo=prompt('Tipo: ingreso, fijo, variable, deuda o ahorro',item?.tipo||'variable');
  if(!tipo || !['ingreso','fijo','variable','deuda','ahorro'].includes(tipo)) return;
  const categoria=prompt('Categoría',item?.categoria||'Otros'); if(!categoria)return;
  const monto=Number(prompt('Monto planificado CLP',item?.monto_planificado||0));
  if(!Number.isFinite(monto)||monto<0)return;
  const descripcion=prompt('Descripción',item?.descripcion||'')??'';
  const user=await uid(),c=sb();
  const payload={presupuesto_id:S.budget.id,user_id:user,tipo,categoria,descripcion,monto_planificado:Math.round(monto)};
  const q=item?await c.from('presupuesto_partidas').update(payload).eq('id',item.id):await c.from('presupuesto_partidas').insert(payload);
  if(q.error)throw q.error;
  await refresh();
}

async function delItem(id){
  if(!confirm('¿Excluir esta partida del presupuesto?'))return;
  const q=await sb().from('presupuesto_partidas').delete().eq('id',id);
  if(q.error)throw q.error;
  await refresh();
}

async function refresh(){
  collectBridges();
  await loadOwnBudget();
  render();
}

function bind(){
  $('b240Prev')?.addEventListener('click',()=>{S.m--;if(S.m<0){S.m=11;S.y--;}refresh().catch(console.error);});
  $('b240Next')?.addEventListener('click',()=>{S.m++;if(S.m>11){S.m=0;S.y++;}refresh().catch(console.error);});
  $('b240Add')?.addEventListener('click',()=>editItem(null).catch(e=>alert(e.message)));
  $('b240Categories')?.addEventListener('click',e=>{
    const ed=e.target.closest('[data-b240-edit]'),del=e.target.closest('[data-b240-del]');
    if(ed) editItem(S.items.find(x=>x.id===ed.dataset.b240Edit)).catch(x=>alert(x.message));
    if(del) delItem(del.dataset.b240Del).catch(x=>alert(x.message));
  });
}

async function init(){
  if(S.initialized)return;
  S.initialized=true;
  bind();
  try{await refresh();}catch(e){
    console.error('[B2.40]',e);
    $('b240Categories').innerHTML=`<div class="b240-empty">Presupuesto no pudo inicializarse: ${esc(e.message||e)}</div>`;
  }
}

window.B240Presupuesto={init,refresh,state:S};
})();
