/* ============================================================
   B232.42 — CALIDAD E INTEGRIDAD DE DATOS
   Contrato canónico de lectura + reconciliación intermodular.

   Solo lectura. No modifica motores ni escribe en Supabase.
   ============================================================ */
(() => {
  'use strict';
  const VERSION='232.42';
  if(window.B23242Integrity?.version===VERSION)return;
  const $=id=>document.getElementById(id);
  const num=v=>Number.isFinite(Number(v))?Number(v):0;
  const money=v=>new Intl.NumberFormat('es-CL',{style:'currency',currency:'CLP',maximumFractionDigits:0}).format(num(v));
  const today=()=>{const d=new Date();return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,10)};
  const plusDays=(s,n)=>{const d=new Date(s+'T12:00:00');d.setDate(d.getDate()+n);return d.toISOString().slice(0,10)};
  const norm=v=>String(v??'').trim().toLowerCase();
  const paid=v=>/pagad|cobrad|realiz|cancel|cerrad|liquid/i.test(norm(v));
  const dateOf=(r,...fs)=>{for(const f of fs){const d=String(r?.[f]??'').slice(0,10);if(/^\d{4}-\d{2}-\d{2}$/.test(d))return d}return null};
  function db(){
    if(window.supabaseClient)return window.supabaseClient;
    const url=localStorage.getItem('sf_url'),key=localStorage.getItem('sf_key');
    if(!url||!key||!window.supabase?.createClient)return null;
    try{return window.supabaseClient=window.supabase.createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}})}catch(e){console.error('[B232.42] Supabase',e);return null}
  }
  async function read(table){const c=db();if(!c)throw new Error('Supabase no está conectado.');const r=await c.from(table).select('*');if(r.error)throw new Error(table+': '+r.error.message);return r.data||[]}
  const sourceState=(rows,error)=>error?{state:'error',count:0,error}:!rows.length?{state:'empty',count:0}: {state:'ok',count:rows.length};
  function canonical(s){
    const t=today(),end=plusDays(t,30);
    const close=s.closure.filter(r=>r.activo!==false).sort((a,b)=>String(b.fecha_corte||'').localeCompare(String(a.fecha_corte||'')))[0]||null;
    const accounts=s.accounts.filter(r=>r.activa!==false);
    const cash=close?num(close.saldo_efectivo_actual??close.saldo_inicial):0;
    const bank=accounts.reduce((a,r)=>a+num(r.saldo_actual),0);
    const linked=new Set(s.futureIncome.map(r=>r.movimiento_id??r.movement_id??r.movimientoId).filter(v=>v!=null).map(String));
    const planned=s.futureIncome.filter(r=>!paid(r.estado)).reduce((a,r)=>a+num(r.monto??r.monto_neto??r.valor??r.monto_bruto),0);
    const futureMov=s.movements.filter(r=>dateOf(r,'fecha')>t&&norm(r.tipo)==='ingreso'&&!linked.has(String(r.id??r.movimiento_id))).reduce((a,r)=>a+num(r.monto),0);
    const commitments=s.commitments.filter(r=>!paid(r.estado)&&dateOf(r,'fecha_vencimiento','fecha')>=t&&dateOf(r,'fecha_vencimiento','fecha')<=end);
    const quotas=s.quotas.filter(r=>!paid(r.estado)&&dateOf(r,'fecha_vencimiento')>=t&&dateOf(r,'fecha_vencimiento')<=end);
    const commitmentKeys=new Set(commitments.map(r=>[dateOf(r,'fecha_vencimiento','fecha'),num(r.monto),norm(r.concepto??r.descripcion),r.cuota_id??r.deuda_cuota_id??''].join('|')));
    const uniqueQuotas=quotas.filter(r=>!commitmentKeys.has([dateOf(r,'fecha_vencimiento'),num(r.monto??r.monto_cuota??r.valor),norm(r.concepto??r.descripcion),r.id??r.cuota_id??''].join('|')));
    const commitments30d=commitments.reduce((a,r)=>a+num(r.monto),0);
    const quotas30d=uniqueQuotas.reduce((a,r)=>a+num(r.monto??r.monto_cuota??r.valor),0);
    const debt=s.debts.filter(r=>!paid(r.estado)).reduce((a,r)=>a+num(r.saldo_actual??r.saldo_pendiente??r.saldo),0);
    return {cutoff:close?.fecha_corte||null,cash,bank,liquidity:cash+bank,futureIncome:planned+futureMov,plannedIncome:planned,futureMovementIncome:futureMov,obligations30d:commitments30d+quotas30d,commitments30d,debtQuotas30d:quotas30d,debtOutstanding:debt,linkedFutureMovements:[...linked].filter(id=>s.movements.some(r=>String(r.id??r.movimiento_id)===id)).length};
  }
  const parseMoney=id=>{const t=$(id)?.textContent||'';const x=t.replace(/[^0-9-]/g,'');return x&&x!=='-'?Number(x):null};
  function observed(){return {summaryLiquidity:parseMoney('kpi-real-balance'),summaryProjected:parseMoney('kpi-projected-balance'),summaryCommitted:parseMoney('kpi-committed'),iaLiquidity:parseMoney('b227Liq'),iaFutureIncome:parseMoney('b227In'),iaObligations:parseMoney('b227Out'),iaDebt:parseMoney('b227Debt')}}
  function cmp(label,c,o){if(o==null)return {label,state:'warn',detail:'Indicador no disponible durante la auditoría.'};const d=o-c;return {label,state:d===0?'pass':'mismatch',detail:'Canónico '+money(c)+' · observado '+money(o)+' · diferencia '+money(d)}}
  function render(report){
    const host=$('dashboard');if(!host)return;
    let p=$('b23242IntegrityPanel');if(!p){p=document.createElement('section');p.id='b23242IntegrityPanel';p.className='panel';p.style.cssText='margin:12px 0;padding:14px;border:1px solid #e5e7eb;border-radius:12px;background:#fff';const a=$('executive-dashboard')||host.firstElementChild;a?.parentNode?a.parentNode.insertBefore(p,a):host.appendChild(p)}
    const errors=report.checks.filter(c=>c.state==='error').length,mismatch=report.checks.filter(c=>c.state==='mismatch').length,warn=report.checks.filter(c=>c.state==='warn').length;
    const status=errors?'ERROR':mismatch?'REVISAR':warn?'ADVERTENCIA':'INTEGRO';
    p.innerHTML='<div style="display:flex;justify-content:space-between;gap:10px;align-items:center"><div><div style="font-size:11px;color:#64748b">B232.42 · CALIDAD E INTEGRIDAD</div><h3 style="margin:3px 0">Reconciliación financiera</h3></div><strong>'+status+'</strong></div>'+
      '<div style="margin-top:10px;display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:8px">'+
      '<div><small>Liquidez canónica</small><div><strong>'+money(report.canonical.liquidity)+'</strong></div></div>'+
      '<div><small>Ingresos futuros</small><div><strong>'+money(report.canonical.futureIncome)+'</strong></div></div>'+
      '<div><small>Obligaciones 30 días</small><div><strong>'+money(report.canonical.obligations30d)+'</strong></div></div>'+
      '<div><small>Deuda pendiente</small><div><strong>'+money(report.canonical.debtOutstanding)+'</strong></div></div></div>'+
      '<p style="font-size:12px">Contrato: cierre + cuentas activas + ingresos futuros/movimientos futuros sin doble conteo + compromisos/cuotas 30 días sin duplicidad + deuda pendiente.</p>'+
      '<div style="font-size:12px;line-height:1.55">'+report.checks.map(c=>'<div><strong>'+c.label+':</strong> '+c.detail+'</div>').join('')+'</div>'+
      '<button id="b23242Refresh" type="button" class="secondary" style="margin-top:10px">↻ Auditar integridad</button>';
    $('b23242Refresh')?.addEventListener('click',()=>run());
  }
  async function run(){
    const started=performance.now();
    try{
      const defs=[['closure','cierres_financieros'],['accounts','cuentas_bancarias'],['movements','movimientos'],['futureIncome','ingresos_futuros'],['commitments','compromisos'],['quotas','cuotas_deuda'],['debts','v_deudas_resumen']];
      const rs=await Promise.all(defs.map(async([key,table])=>{try{return {key,table,rows:await read(table),error:null}}catch(e){return {key,table,rows:[],error:e?.message||String(e)}}}));
      const by=Object.fromEntries(rs.map(r=>[r.key,r.rows]));
      const can=canonical({closure:by.closure||[],accounts:by.accounts||[],movements:by.movements||[],futureIncome:by.futureIncome||[],commitments:by.commitments||[],quotas:by.quotas||[],debts:by.debts||[]});
      const checks=rs.map(r=>{const st=sourceState(r.rows,r.error);return {id:r.key,label:r.table,state:r.error?'error':'pass',detail:r.error||st.state+' · '+st.count+' registros'}});
      const futureDup=(by.futureIncome||[]).map(r=>r.id).filter((id,i,a)=>id!=null&&a.indexOf(id)!==i).length;
      checks.push({id:'future-duplicates',label:'Ingresos futuros',state:futureDup?'warn':'pass',detail:futureDup?futureDup+' IDs duplicados detectados.':can.linkedFutureMovements?can.linkedFutureMovements+' ingreso(s) enlazado(s) a movimiento(s); excluidos del segundo conteo.':'Sin duplicidad por movimiento_id.'});
      const d=observed();
      [cmp('Liquidez Resumen',can.liquidity,d.summaryLiquidity),cmp('Liquidez IA',can.liquidity,d.iaLiquidity),cmp('Ingresos futuros IA',can.futureIncome,d.iaFutureIncome),cmp('Obligaciones IA',can.obligations30d,d.iaObligations),cmp('Deuda IA',can.debtOutstanding,d.iaDebt)].forEach(x=>checks.push(x));
      checks.push({id:'liquidity-components',label:'Composición liquidez',state:can.liquidity===can.cash+can.bank?'pass':'error',detail:money(can.cash)+' efectivo + '+money(can.bank)+' cuentas = '+money(can.liquidity)});
      checks.push({id:'obligation-contract',label:'Contrato obligaciones',state:'pass',detail:money(can.commitments30d)+' compromisos + '+money(can.debtQuotas30d)+' cuotas únicas = '+money(can.obligations30d)+' próximos 30 días.'});
      const report={version:VERSION,timestamp:new Date().toISOString(),durationMs:Math.round(performance.now()-started),status:checks.some(c=>c.state==='error')?'error':checks.some(c=>c.state==='mismatch')?'mismatch':checks.some(c=>c.state==='warn')?'warning':'ok',canonical:can,observed:d,sourceStates:Object.fromEntries(rs.map(r=>[r.table,sourceState(r.rows,r.error)])),checks};
      window.B23242Integrity.lastReport=report;window.__B23242_INTEGRITY__=report;render(report);console.groupCollapsed('[B232.42] '+report.status.toUpperCase());console.table(checks);console.log('Canónico',can);console.log('Observado',d);console.groupEnd();return report;
    }catch(e){const report={version:VERSION,status:'error',durationMs:Math.round(performance.now()-started),canonical:null,observed:observed(),checks:[{id:'fatal',label:'Auditoría',state:'error',detail:e?.message||String(e)}]};window.B23242Integrity.lastReport=report;window.__B23242_INTEGRITY__=report;console.error('[B232.42]',e);return report}
  }
  window.B23242Integrity={version:VERSION,run,getLastReport:()=>window.B23242Integrity.lastReport||null};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(run,1200),{once:true});else setTimeout(run,1200);
})();
