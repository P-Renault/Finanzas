/* FINANZAS B2.25 — MOTOR MULTIFUENTE / CONTROL DE INGRESOS
   Lectura segura sobre fuentes_ingreso + generacion_ingresos.
   No crea jornadas duplicadas. No modifica movimientos ni liquidez.
   El cobro real continúa entrando por el motor de movimientos/liquidez.
*/
(()=>{'use strict';
const $=id=>document.getElementById(id);
const money=n=>new Intl.NumberFormat('es-CL',{style:'currency',currency:'CLP',maximumFractionDigits:0}).format(Number(n)||0);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
function db(){const u=localStorage.getItem('sf_url'),k=localStorage.getItem('sf_key');return u&&k&&window.supabase?window.supabase.createClient(u,k,{auth:{persistSession:false,autoRefreshToken:false}}):null}
function styles(){if($('b225Styles'))return;const s=document.createElement('style');s.id='b225Styles';s.textContent=`
.b225-wrap{display:grid;gap:12px}.b225-kpis{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}.b225-kpi,.b225-source{border:1px solid #e2e8f0;border-radius:14px;padding:14px;background:#fff}.b225-kpi span,.b225-kpi small,.b225-source small{display:block;color:#64748b;font-size:11px}.b225-kpi strong{display:block;font-size:20px;margin-top:5px}.b225-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.b225-row{display:flex;justify-content:space-between;gap:12px;padding:11px 0;border-bottom:1px solid #e5e7eb}.b225-source-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.b225-status{padding:12px;border-radius:12px;background:#f8fafc;color:#475569}.b225-ok{background:#ecfdf5;color:#166534}.b225-warn{background:#fff7ed;color:#9a3412}@media(max-width:760px){.b225-kpis{grid-template-columns:1fr 1fr}.b225-grid,.b225-source-list{grid-template-columns:1fr}}
`;document.head.appendChild(s)}
function ensure(){const sec=$('operaciones');if(!sec||$('b225Motor'))return;if(!$('b222Ops'))return;
const host=document.createElement('div');host.id='b225Motor';host.className='b225-wrap';
host.innerHTML=`<div class="card"><div class="section-title"><div><span class="muted">B2.25 · MOTOR MULTIFUENTE</span><h2>Generación y cobro de ingresos</h2><p class="muted">Separa ingreso generado, ingreso cobrado e ingreso efectivamente recibido en liquidez.</p></div><button type="button" class="secondary" id="b225Refresh">Actualizar</button></div>
<div class="b225-kpis"><article class="b225-kpi"><span>Generado</span><strong id="b225Generated">$0</strong><small>Registro de generación</small></article><article class="b225-kpi"><span>Cobrado</span><strong id="b225Collected">$0</strong><small>Estado de cobro</small></article><article class="b225-kpi"><span>Pendiente de cobro</span><strong id="b225Pending">$0</strong><small>Generado − cobrado</small></article><article class="b225-kpi"><span>Fuentes activas</span><strong id="b225Sources">0</strong><small>Catálogo de ingresos</small></article></div></div>
<div class="b225-grid"><div class="card"><h3>Fuentes de ingreso</h3><div id="b225SourceList" class="b225-source-list"><p class="muted">Cargando…</p></div></div><div class="card"><h3>Control de conciliación</h3><div class="b225-row"><span>Generado</span><strong id="b225CGen">$0</strong></div><div class="b225-row"><span>Cobrado</span><strong id="b225CCol">$0</strong></div><div class="b225-row"><span>Pendiente</span><strong id="b225CPen">$0</strong></div><div id="b225Status" class="b225-status">Cargando…</div></div></div>`;
sec.appendChild(host);$('b225Refresh').onclick=load}
function first(o,names,def=null){for(const n of names)if(o&&o[n]!=null)return o[n];return def}
function load(){
const c=db(),status=$('b225Status');if(!c||!status)return;
status.textContent='Actualizando…';
Promise.all([
 c.from('fuentes_ingreso').select('*'),
 c.from('generacion_ingresos').select('*')
]).then(([a,b])=>{
 if(a.error)throw a.error;if(b.error)throw b.error;
 const sources=a.data||[], gens=b.data||[];
 const generated=gens.reduce((s,r)=>s+Number(first(r,['monto_neto','monto','importe','monto_generado'],0)||0),0);
 const collected=gens.filter(r=>String(first(r,['estado_cobro','estado','cobro_estado'],'')).toLowerCase()==='cobrado').reduce((s,r)=>s+Number(first(r,['monto_neto','monto','importe','monto_generado'],0)||0),0);
 const pending=Math.max(0,generated-collected);
 $('b225Generated').textContent=money(generated);$('b225Collected').textContent=money(collected);$('b225Pending').textContent=money(pending);$('b225Sources').textContent=String(sources.length);
 $('b225CGen').textContent=money(generated);$('b225CCol').textContent=money(collected);$('b225CPen').textContent=money(pending);
 const by={};for(const r of gens){const id=first(r,['fuente_id','fuente_ingreso_id','id_fuente'],null);const key=id==null?'sin_fuente':String(id);by[key]=(by[key]||0)+Number(first(r,['monto_neto','monto','importe','monto_generado'],0)||0)}
 $('b225SourceList').innerHTML=sources.length?sources.map(s=>{const id=first(s,['id','fuente_id'],null),name=first(s,['nombre','nombre_fuente','fuente','descripcion'],'Fuente');return `<div class="b225-source"><b>${esc(name)}</b><small>Generado asociado</small><strong>${money(by[String(id)]||0)}</strong></div>`}).join(''):'<p class="muted">No hay fuentes registradas.</p>';
 status.className='b225-status '+(pending?'b225-warn':'b225-ok');status.textContent=pending?`Hay ${money(pending)} generados aún no marcados como cobrados. El cobro real debe terminar en un movimiento de ingreso y actualizar liquidez.`:'No existe diferencia entre generación y cobro en los registros consultados.';
}).catch(e=>{status.className='b225-status b225-warn';status.textContent='No se pudo leer el motor multifuente: '+(e.message||e)})
}
function boot(){styles();ensure();load();const obs=new MutationObserver(()=>{ensure()});if($('operaciones'))obs.observe($('operaciones'),{childList:true,subtree:true});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,1200),{once:true});else setTimeout(boot,1200);
})();