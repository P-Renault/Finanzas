/* B232.60 · RELEASE FINAL · INTEGRACION REAL CON B232.23
   Contrato de navegación: app.js captura data-tab y llama window.b219Show(id).
   Esta entrega implementa exactamente ese contrato y reemplaza placeholders.
*/
(function(){
'use strict';
if(window.__B23262_RELEASE__) return;
window.__B23262_RELEASE__=true;
var VERSION='B232.62-RELEASE-MODULOS-REALES-FINAL-SIN-BUCLE';
var $=function(id){return document.getElementById(id)};
var money=function(n){return new Intl.NumberFormat('es-CL',{style:'currency',currency:'CLP',maximumFractionDigits:0}).format(Number(n)||0)};
var today=function(){var d=new Date();return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,10)};
function db(){var u=localStorage.getItem('sf_url'),k=localStorage.getItem('sf_key');return u&&k&&window.supabase&&typeof window.supabase.createClient==='function'?window.supabase.createClient(u,k,{auth:{persistSession:false,autoRefreshToken:false}}):null}
function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]})}
function safe(p,fb){return Promise.resolve(p).then(function(r){return r&&r.error?fb:(r&&r.data!==undefined?r.data:fb)}).catch(function(){return fb})}
function removeMore(){
 ['b219MenuWrap','b232513MenuWrap'].forEach(function(id){var n=$(id);if(n)n.remove()});
 document.querySelectorAll('.b219-menu-wrap,.b219-menu,.b219-menu-btn').forEach(function(n){n.remove()});
 var t=document.querySelector('.tabs');
 if(t)t.querySelectorAll('button').forEach(function(b){if(!b.dataset.tab&&/^(más|mas)\b/i.test((b.textContent||'').trim()))b.remove()});
}
function nav(){
 var t=document.querySelector('.tabs');if(!t)return;
 removeMore();
 [['ingresos','Motor Multifuente'],['jornadas','Control de Jornada']].forEach(function(x){var b=t.querySelector('button[data-tab="'+x[0]+'"]');if(!b){b=document.createElement('button');b.type='button';b.dataset.tab=x[0];b.textContent=x[1];t.appendChild(b)}});
 ['dashboard','movimientos','futuros','calendario','ahorro','deudas','cuentas','operaciones','planificacion','ingresos','jornadas'].forEach(function(id){var b=t.querySelector('button[data-tab="'+id+'"]');if(b)t.appendChild(b)});
}
function isPlaceholder(s){if(!s)return false;var x=(s.textContent||'').replace(/\s+/g,' ').trim();return /Módulo disponible mediante su integración (financiera|operativa) existente\.?/i.test(x)}
var incomeHtml='<div class="card"><span class="muted">B2.19 · MOTOR MULTIFUENTE</span><h2>Generación de ingresos</h2><p class="muted">Una entrada financiera para múltiples actividades, sin mezclar generación con liquidez.</p><div class="b219-kpis"><article class="b219-kpi"><span>Generado neto</span><strong id="b219Generated">$0</strong></article><article class="b219-kpi"><span>Cobrado</span><strong id="b219Received">$0</strong></article><article class="b219-kpi"><span>Pendiente</span><strong id="b219Pending">$0</strong></article></div></div><div class="card"><h3>Registrar generación</h3><form id="b219IncomeForm" class="b219-form"><label>Fuente<select id="b219Source"></select></label><label>Actividad<input id="b219Activity" required placeholder="Conducción, desarrollo, venta…"></label><label>Cliente<input id="b219Client"></label><label>Fecha de generación<input id="b219Date" type="date" required></label><label>Monto bruto<input id="b219Gross" type="number" min="0" step="1" value="0"></label><label>Costos<input id="b219Cost" type="number" min="0" step="1" value="0"></label><label>Comisiones<input id="b219Comm" type="number" min="0" step="1" value="0"></label><label>Estado<select id="b219State"><option value="pendiente">Pendiente</option><option value="cobrado">Cobrado</option></select></label><label>Fecha de cobro<input id="b219Collection" type="date"></label><label class="full">Notas<input id="b219Notes"></label><button class="full" type="submit">Registrar generación</button></form><p id="b219IncomeMsg" class="status"></p></div><div class="card"><h3>Últimas generaciones</h3><div id="b219IncomeList"></div></div>';
var jobsHtml='<div class="card"><span class="muted">B2.19 · PUENTE OPERACIONAL</span><h2>Control de Jornada</h2><p class="muted">El detalle de horas, km, combustible, viajes, bruto y comisión permanece en Control de Jornada. Finanzas recibe solamente el resultado financiero.</p><div class="b219-kpis"><article class="b219-kpi"><span>Resultados integrados</span><strong id="b219JCount">0</strong></article><article class="b219-kpi"><span>Neto integrado</span><strong id="b219JNet">$0</strong></article></div><div class="card"><h3>Integrar resultado de una jornada</h3><form id="b219JForm" class="b219-form"><label>Fecha<input id="b219JDate" type="date" required></label><label>Neto generado<input id="b219JNetInput" type="number" min="0" step="1" required></label><label>Costos incluidos<input id="b219JCost" type="number" min="0" step="1" value="0"></label><label>Estado<select id="b219JState"><option value="cobrado">Cobrado</option><option value="pendiente">Pendiente</option></select></label><label class="full">Referencia<input id="b219JRef" placeholder="Jornada Uber/inDrive"></label><button class="full" type="submit">Integrar resultado financiero</button></form><p id="b219JMsg" class="status"></p></div></div><div class="card"><h3>Historial integrado</h3><div id="b219JList"></div></div>';
function ensureReal(id,html){
 var app=$('app');if(!app)return false;
 var s=$(id);
 if(s&&isPlaceholder(s)){s.innerHTML=html;s.className='tab hidden';}
 else if(!s){s=document.createElement('section');s.id=id;s.className='tab hidden';s.innerHTML=html;app.appendChild(s);}
 return true;
}
async function loadIncome(){var c=db();if(!c)return;var f=await safe(c.from('fuentes_ingreso').select('*').eq('activa',true).order('nombre'),[]);var g=await safe(c.from('generacion_ingresos').select('*').order('fecha_generacion',{ascending:false}).limit(50),[]);if($('b219Source'))$('b219Source').innerHTML=f.map(function(x){return '<option value="'+esc(x.id)+'">'+esc(x.nombre)+'</option>'}).join('');var gen=g.filter(function(x){return x.estado_cobro!=='cancelado'}).reduce(function(s,x){return s+Number(x.monto_neto||0)},0),rec=g.filter(function(x){return x.estado_cobro==='cobrado'}).reduce(function(s,x){return s+Number(x.monto_neto||0)},0);if($('b219Generated'))$('b219Generated').textContent=money(gen);if($('b219Received'))$('b219Received').textContent=money(rec);if($('b219Pending'))$('b219Pending').textContent=money(gen-rec);if($('b219IncomeList'))$('b219IncomeList').innerHTML=g.map(function(x){return '<div class="b219-row"><span>'+esc(x.actividad)+'<small>'+esc(x.fecha_generacion)+' · '+esc(x.estado_cobro)+'</small></span><strong>'+money(x.monto_neto)+'</strong></div>'}).join('')||'<p class="muted">Sin generaciones registradas.</p>'}
async function loadJobs(){var c=db();if(!c)return;var f=await safe(c.from('fuentes_ingreso').select('id').eq('nombre','Uber / inDrive').maybeSingle(),null);var rows=f&&f.id?await safe(c.from('generacion_ingresos').select('*').eq('fuente_id',f.id).order('fecha_generacion',{ascending:false}).limit(30),[]):[];if($('b219JCount'))$('b219JCount').textContent=String(rows.length);if($('b219JNet'))$('b219JNet').textContent=money(rows.reduce(function(s,x){return s+Number(x.monto_neto||0)},0));if($('b219JList'))$('b219JList').innerHTML=rows.map(function(x){return '<div class="b219-row"><span>'+esc(x.fecha_generacion)+' · '+esc(x.actividad)+'<small>Resultado financiero integrado · '+esc(x.estado_cobro)+'</small></span><strong>'+money(x.monto_neto)+'</strong></div>'}).join('')||'<p class="muted">Sin resultados integrados todavía.</p>'}
function wire(){
 var d=today();if($('b219Date'))$('b219Date').value=d;if($('b219JDate'))$('b219JDate').value=d;
 var fi=$('b219IncomeForm');if(fi&&!fi.dataset.b23260){fi.dataset.b23260='1';fi.onsubmit=async function(e){e.preventDefault();var c=db(),m=$('b219IncomeMsg');if(!c){m.textContent='Conecta Supabase.';return}var state=$('b219State').value,p={fuente_id:Number($('b219Source').value),actividad:$('b219Activity').value.trim(),cliente:$('b219Client').value.trim()||null,fecha_generacion:$('b219Date').value,fecha_cobro:state==='cobrado'?($('b219Collection').value||d):null,monto_bruto:+$('b219Gross').value||0,costos:+$('b219Cost').value||0,comisiones:+$('b219Comm').value||0,estado_cobro:state,notas:$('b219Notes').value.trim()||null};var r=await safe(c.from('generacion_ingresos').insert(p),null);m.textContent=r===null?'No se pudo registrar.':'Generación registrada.';if(r!==null){fi.reset();$('b219Date').value=today();loadIncome()}}}
 var fj=$('b219JForm');if(fj&&!fj.dataset.b23260){fj.dataset.b23260='1';fj.onsubmit=async function(e){e.preventDefault();var c=db(),m=$('b219JMsg');if(!c){m.textContent='Conecta Supabase.';return}var f=await safe(c.from('fuentes_ingreso').select('id').eq('nombre','Uber / inDrive').maybeSingle(),null);if(!f){m.textContent='No existe la fuente Uber / inDrive.';return}var net=+$('b219JNetInput').value||0,cost=+$('b219JCost').value||0,state=$('b219JState').value,p={fuente_id:f.id,actividad:'Resultado Control de Jornada',descripcion:$('b219JRef').value.trim()||'Integración financiera de jornada',fecha_generacion:$('b219JDate').value,monto_bruto:net+cost,costos:cost,comisiones:0,estado_cobro:state,fecha_cobro:state==='cobrado'?$('b219JDate').value:null,notas:'Origen: Control de Jornada'};var r=await safe(c.from('generacion_ingresos').insert(p),null);m.textContent=r===null?'No se pudo integrar.':'Resultado integrado: '+money(net)+'.';if(r!==null){fj.reset();$('b219JDate').value=today();loadJobs()}}}
}
window.b219Show=function(id){
 if(id!=='ingresos'&&id!=='jornadas')return false;
 nav();ensureReal('ingresos',incomeHtml);ensureReal('jornadas',jobsHtml);wire();
 document.querySelectorAll('.tab').forEach(function(s){s.classList.toggle('hidden',s.id!==id)});
 document.querySelectorAll('.tabs button[data-tab]').forEach(function(b){b.classList.toggle('active',b.dataset.tab===id)});
 localStorage.setItem('cf_active_tab_v2',id);
 if(id==='ingresos')loadIncome();else loadJobs();
 return true;
};
function footer(){var f=$('b23260-footer');if(!f){f=document.createElement('footer');f.id='b23260-footer';f.style.cssText='margin:24px 10px 12px;padding:10px 12px;text-align:center;font:600 11px/1.4 system-ui,sans-serif;color:#64748b;border-top:1px solid #e5e7eb';document.body.appendChild(f)}f.textContent='Paquete desplegado: '+VERSION}
function enforce(){nav();ensureReal('ingresos',incomeHtml);ensureReal('jornadas',jobsHtml);wire()}
function boot(){enforce();footer();if(window.MutationObserver){var root=$('app')||document.body;var busy=false;var mo=new MutationObserver(function(){if(busy)return;busy=true;mo.disconnect();try{var hasPlaceholder=isPlaceholder($('ingresos'))||isPlaceholder($('jornadas'));var missing=!$('ingresos')||!$('jornadas')||!document.querySelector('.tabs button[data-tab=\"ingresos\"]')||!document.querySelector('.tabs button[data-tab=\"jornadas\"]');if(hasPlaceholder||missing)enforce()}finally{busy=false;mo.observe(root,{childList:true,subtree:true})}});mo.observe(root,{childList:true,subtree:true})}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
