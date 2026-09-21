/* B232.56 · RELEASE FINAL · MENÚ + MÓDULOS INTEGRADOS + IDENTIFICADOR
   Corrección autocontenida.
   - Elimina completamente "Más" y sus contenedores.
   - Expone Motor Multifuente y Control de Jornada directamente.
   - Reemplaza placeholders por vistas funcionales completas.
   - Conserva Supabase y la lógica financiera existente.
   - Inserta identificador visible del paquete desplegado en el pie.
*/
(function(){
'use strict';
if(window.__B23255_MENU_FINAL__) return;
window.__B23255_MENU_FINAL__=true;
var VERSION='B232.56-RELEASE-MENU-MODULOS';
var $=function(id){return document.getElementById(id)};
var money=function(n){return new Intl.NumberFormat('es-CL',{style:'currency',currency:'CLP',maximumFractionDigits:0}).format(Number(n)||0)};
var today=function(){var d=new Date();return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,10)};
function db(){
  if(window.supabaseClient) return window.supabaseClient;
  var u=localStorage.getItem('sf_url'),k=localStorage.getItem('sf_key');
  if(u&&k&&window.supabase&&window.supabase.createClient){
    try{return window.supabase.createClient(u,k,{auth:{persistSession:false,autoRefreshToken:false}})}catch(e){console.error('[B232.56] Supabase',e)}
  }
  return null;
}
function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]})}
function safe(p,fb){return Promise.race([p,new Promise(function(_,rej){setTimeout(function(){rej(new Error('timeout'))},7000)})]).then(function(r){return r&&r.error?fb:(r&&r.data!==undefined?r.data:fb)}).catch(function(){return fb})}
function removeMore(){
  ['b219MenuWrap','b232513MenuWrap','b219NavShell','b232513NavShell'].forEach(function(x){var n=$(x);if(n)n.remove()});
  document.querySelectorAll('.b219-menu-wrap,.b219-menu,.b219-menu-btn').forEach(function(n){n.remove()});
  var t=document.querySelector('.tabs');
  if(t)t.querySelectorAll('button').forEach(function(b){if(!b.dataset.tab&&/^(más|mas)\b/i.test((b.textContent||'').trim()))b.remove()});
}
function addButton(t,id,label){var b=t.querySelector('button[data-tab="'+id+'"]');if(!b){b=document.createElement('button');b.type='button';b.dataset.tab=id;b.textContent=label;t.appendChild(b)}return b}
function nav(){
  var t=document.querySelector('.tabs');if(!t)return false;
  removeMore();
  addButton(t,'ingresos','Motor Multifuente');
  addButton(t,'jornadas','Control de Jornada');
  ['dashboard','movimientos','futuros','calendario','ahorro','deudas','cuentas','operaciones','planificacion','ingresos','jornadas'].forEach(function(id){var b=t.querySelector('button[data-tab="'+id+'"]');if(b)t.appendChild(b)});
  return true;
}
function isPlaceholder(s){if(!s)return false;var x=(s.textContent||'').replace(/\s+/g,' ').trim();return /^Motor Multifuente Módulo disponible mediante su integración financiera existente\.?$/.test(x)||/^Control de Jornada Módulo disponible mediante su integración operativa existente\.?$/.test(x)}
function moduleHtml(){
  var app=$('app');if(!app)return;
  ['ingresos','jornadas'].forEach(function(id){var s=$(id);if(isPlaceholder(s))s.remove()});
  var income=$('ingresos');
  if(!income){income=document.createElement('section');income.id='ingresos';income.className='tab hidden';income.innerHTML='<div class="card"><span class="muted">B2.19 · MOTOR MULTIFUENTE</span><h2>Generación de ingresos</h2><p class="muted">Una entrada financiera para múltiples actividades, sin mezclar generación con liquidez.</p><div class="b219-kpis"><article class="b219-kpi"><span>Generado neto</span><strong id="b23255Generated">$0</strong></article><article class="b219-kpi"><span>Cobrado</span><strong id="b23255Received">$0</strong></article><article class="b219-kpi"><span>Pendiente</span><strong id="b23255Pending">$0</strong></article></div></div><div class="card"><h3>Registrar generación</h3><form id="b23255IncomeForm" class="b219-form"><label>Fuente<select id="b23255Source"></select></label><label>Actividad<input id="b23255Activity" required placeholder="Conducción, desarrollo, venta…"></label><label>Cliente<input id="b23255Client"></label><label>Fecha de generación<input id="b23255Date" type="date" required></label><label>Monto bruto<input id="b23255Gross" type="number" min="0" step="1" value="0"></label><label>Costos<input id="b23255Cost" type="number" min="0" step="1" value="0"></label><label>Comisiones<input id="b23255Comm" type="number" min="0" step="1" value="0"></label><label>Estado<select id="b23255State"><option value="pendiente">Pendiente</option><option value="cobrado">Cobrado</option></select></label><label>Fecha de cobro<input id="b23255Collection" type="date"></label><label class="full">Notas<input id="b23255Notes"></label><button class="full" type="submit">Registrar generación</button></form><p id="b23255IncomeMsg" class="status"></p></div><div class="card"><h3>Últimas generaciones</h3><div id="b23255IncomeList"></div></div>';app.appendChild(income)}
  var jobs=$('jornadas');
  if(!jobs){jobs=document.createElement('section');jobs.id='jornadas';jobs.className='tab hidden';jobs.innerHTML='<div class="card"><span class="muted">B2.19 · PUENTE OPERACIONAL</span><h2>Control de Jornada</h2><p class="muted">El detalle de horas, km, combustible, viajes, bruto y comisión permanece en Control de Jornada. Finanzas recibe solamente el resultado financiero.</p><div class="b219-kpis"><article class="b219-kpi"><span>Resultados integrados</span><strong id="b23255JCount">0</strong></article><article class="b219-kpi"><span>Neto integrado</span><strong id="b23255JNet">$0</strong></article></div><div class="card"><h3>Integrar resultado de una jornada</h3><form id="b23255JForm" class="b219-form"><label>Fecha<input id="b23255JDate" type="date" required></label><label>Neto generado<input id="b23255JNetInput" type="number" min="0" step="1" required></label><label>Costos incluidos<input id="b23255JCost" type="number" min="0" step="1" value="0"></label><label>Estado<select id="b23255JState"><option value="cobrado">Cobrado</option><option value="pendiente">Pendiente</option></select></label><label class="full">Referencia<input id="b23255JRef" placeholder="Jornada Uber/inDrive"></label><button class="full" type="submit">Integrar resultado financiero</button></form><p id="b23255JMsg" class="status"></p></div></div><div class="card"><h3>Historial integrado</h3><div id="b23255JList"></div></div>';app.appendChild(jobs)}
}
async function loadIncome(){var c=db();if(!c)return;var f=await safe(c.from('fuentes_ingreso').select('*').eq('activa',true).order('nombre'),[]);var g=await safe(c.from('generacion_ingresos').select('*').order('fecha_generacion',{ascending:false}).limit(50),[]);var sel=$('b23255Source');if(sel)sel.innerHTML=f.map(function(x){return '<option value="'+esc(x.id)+'">'+esc(x.nombre)+'</option>'}).join('');var gen=g.filter(function(x){return x.estado_cobro!=='cancelado'}).reduce(function(s,x){return s+Number(x.monto_neto||0)},0),rec=g.filter(function(x){return x.estado_cobro==='cobrado'}).reduce(function(s,x){return s+Number(x.monto_neto||0)},0);if($('b23255Generated'))$('b23255Generated').textContent=money(gen);if($('b23255Received'))$('b23255Received').textContent=money(rec);if($('b23255Pending'))$('b23255Pending').textContent=money(gen-rec);if($('b23255IncomeList'))$('b23255IncomeList').innerHTML=g.map(function(x){return '<div class="b219-row"><span>'+esc(x.actividad)+'<small>'+esc(x.fecha_generacion)+' · '+esc(x.estado_cobro)+'</small></span><strong>'+money(x.monto_neto)+'</strong></div>'}).join('')||'<p class="muted">Sin generaciones registradas.</p>'}
async function loadJobs(){var c=db();if(!c)return;var f=await safe(c.from('fuentes_ingreso').select('id').eq('nombre','Uber / inDrive').maybeSingle(),null);var rows=f&&f.id?await safe(c.from('generacion_ingresos').select('*').eq('fuente_id',f.id).order('fecha_generacion',{ascending:false}).limit(30),[]):[];if($('b23255JCount'))$('b23255JCount').textContent=String(rows.length);if($('b23255JNet'))$('b23255JNet').textContent=money(rows.reduce(function(s,x){return s+Number(x.monto_neto||0)},0));if($('b23255JList'))$('b23255JList').innerHTML=rows.map(function(x){return '<div class="b219-row"><span>'+esc(x.fecha_generacion)+' · '+esc(x.actividad)+'<small>Resultado financiero integrado · '+esc(x.estado_cobro)+'</small></span><strong>'+money(x.monto_neto)+'</strong></div>'}).join('')||'<p class="muted">Sin resultados integrados todavía.</p>'}
function wireForms(){
  var d=today();if($('b23255Date'))$('b23255Date').value=d;if($('b23255JDate'))$('b23255JDate').value=d;
  var fi=$('b23255IncomeForm');if(fi&&!fi.dataset.wired){fi.dataset.wired='1';fi.onsubmit=async function(e){e.preventDefault();var c=db(),m=$('b23255IncomeMsg');if(!c){m.textContent='Conecta Supabase.';return}var state=$('b23255State').value,p={fuente_id:Number($('b23255Source').value),actividad:$('b23255Activity').value.trim(),cliente:$('b23255Client').value.trim()||null,fecha_generacion:$('b23255Date').value,fecha_cobro:state==='cobrado'?($('b23255Collection').value||d):null,monto_bruto:+$('b23255Gross').value||0,costos:+$('b23255Cost').value||0,comisiones:+$('b23255Comm').value||0,estado_cobro:state,notas:$('b23255Notes').value.trim()||null};var r=await safe(c.from('generacion_ingresos').insert(p),null);m.textContent=r===null?'No se pudo registrar.':'Generación registrada.';if(r!==null){fi.reset();$('b23255Date').value=today();loadIncome()}}}
  var fj=$('b23255JForm');if(fj&&!fj.dataset.wired){fj.dataset.wired='1';fj.onsubmit=async function(e){e.preventDefault();var c=db(),m=$('b23255JMsg');if(!c){m.textContent='Conecta Supabase.';return}var f=await safe(c.from('fuentes_ingreso').select('id').eq('nombre','Uber / inDrive').maybeSingle(),null);if(!f){m.textContent='No existe la fuente Uber / inDrive.';return}var net=+$('b23255JNetInput').value||0,cost=+$('b23255JCost').value||0,state=$('b23255JState').value,p={fuente_id:f.id,actividad:'Resultado Control de Jornada',descripcion:$('b23255JRef').value.trim()||'Integración financiera de jornada',fecha_generacion:$('b23255JDate').value,monto_bruto:net+cost,costos:cost,comisiones:0,estado_cobro:state,fecha_cobro:state==='cobrado'?$('b23255JDate').value:null,notas:'Origen: Control de Jornada'};var r=await safe(c.from('generacion_ingresos').insert(p),null);m.textContent=r===null?'No se pudo integrar.':'Resultado integrado: '+money(net)+'.';if(r!==null){fj.reset();$('b23255JDate').value=today();loadJobs()}}}
}
function show(id){
  if(id!=='ingresos'&&id!=='jornadas')return false;
  moduleHtml();document.querySelectorAll('.tab').forEach(function(s){s.classList.toggle('hidden',s.id!==id)});document.querySelectorAll('.tabs button[data-tab]').forEach(function(b){b.classList.toggle('active',b.dataset.tab===id)});localStorage.setItem('cf_active_tab_v2',id);wireForms();if(id==='ingresos')loadIncome();else loadJobs();return true;
}
function install(){
  var t=document.querySelector('.tabs');if(!t)return false;
  nav();moduleHtml();wireForms();
  ['ingresos','jornadas'].forEach(function(id){var b=t.querySelector('button[data-tab="'+id+'"]');if(b&&!b.dataset.b23255){b.dataset.b23255='1';b.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();show(id)})}});
  removeMore();
  return true;
}
function footer(){
  var f=$('b23255-footer');if(!f){f=document.createElement('footer');f.id='b23255-footer';f.setAttribute('data-deploy-id',VERSION);f.style.cssText='margin:24px 10px 12px;padding:10px 12px;text-align:center;font:600 11px/1.4 system-ui,sans-serif;color:#64748b;border-top:1px solid #e5e7eb';f.textContent='Paquete desplegado: '+VERSION;document.body.appendChild(f)}else f.textContent='Paquete desplegado: '+VERSION;
}
function boot(){if(install())footer();else setTimeout(boot,300)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
setInterval(function(){removeMore();nav();footer()},1500);
})();
