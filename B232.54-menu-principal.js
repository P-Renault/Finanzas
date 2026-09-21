/* B232.59 · RELEASE CORRECTIVO · MÓDULOS REALES B2.19
   No crea un segundo motor. Recupera las vistas originales B2.19 cuando
   una capa anterior las haya sustituido por placeholders.
*/
(function(){
'use strict';
if(window.__B23259_RELEASE__) return;
window.__B23259_RELEASE__=true;
var VERSION='B232.59-RELEASE-MODULOS-REALES';
var $=function(id){return document.getElementById(id)};
function removeMore(){
  ['b219MenuWrap','b232513MenuWrap'].forEach(function(id){var n=$(id);if(n)n.remove()});
  document.querySelectorAll('.b219-menu-wrap,.b219-menu,.b219-menu-btn').forEach(function(n){n.remove()});
  var t=document.querySelector('.tabs');
  if(t)t.querySelectorAll('button').forEach(function(b){if(!b.dataset.tab&&/^(más|mas)\b/i.test((b.textContent||'').trim()))b.remove()});
}
function nav(){
  var t=document.querySelector('.tabs');if(!t)return false;
  removeMore();
  [['ingresos','Motor Multifuente'],['jornadas','Control de Jornada']].forEach(function(x){
    var b=t.querySelector('button[data-tab="'+x[0]+'"]');
    if(!b){b=document.createElement('button');b.type='button';b.dataset.tab=x[0];b.textContent=x[1];t.appendChild(b)}
  });
  ['dashboard','movimientos','futuros','calendario','ahorro','deudas','cuentas','operaciones','planificacion','ingresos','jornadas'].forEach(function(id){var b=t.querySelector('button[data-tab="'+id+'"]');if(b)t.appendChild(b)});
  return true;
}
function placeholder(s){
  if(!s)return false;
  var x=(s.textContent||'').replace(/\s+/g,' ').trim();
  return /^(Motor Multifuente Módulo disponible mediante su integración financiera existente\.?|Control de Jornada Módulo disponible mediante su integración operativa existente\.?)$/i.test(x);
}
var incomeHtml='<div class="card"><span class="muted">B2.19 · MOTOR MULTIFUENTE</span><h2>Generación de ingresos</h2><p class="muted">Una entrada financiera para múltiples actividades, sin mezclar generación con liquidez.</p><div class="b219-kpis"><article class="b219-kpi"><span>Generado neto</span><strong id="b219Generated">$0</strong></article><article class="b219-kpi"><span>Cobrado</span><strong id="b219Received">$0</strong></article><article class="b219-kpi"><span>Pendiente</span><strong id="b219Pending">$0</strong></article></div></div><div class="card"><h3>Registrar generación</h3><form id="b219IncomeForm" class="b219-form"><label>Fuente<select id="b219Source"></select></label><label>Actividad<input id="b219Activity" required placeholder="Conducción, formateo, desarrollo, venta…"></label><label>Cliente<input id="b219Client"></label><label>Fecha de generación<input id="b219Date" type="date" required></label><label>Monto bruto<input id="b219Gross" type="number" min="0" step="1" value="0"></label><label>Costos<input id="b219Cost" type="number" min="0" step="1" value="0"></label><label>Comisiones<input id="b219Comm" type="number" min="0" step="1" value="0"></label><label>Estado<select id="b219State"><option value="pendiente">Pendiente</option><option value="cobrado">Cobrado</option></select></label><label>Fecha de cobro<input id="b219Collection" type="date"></label><label class="full">Notas<input id="b219Notes"></label><button class="full" type="submit">Registrar generación</button></form><p id="b219IncomeMsg" class="status"></p></div><div class="card"><h3>Últimas generaciones</h3><div id="b219IncomeList"></div></div>';
var jobsHtml='<div class="card"><span class="muted">B2.19 · PUENTE OPERACIONAL</span><h2>Control de Jornada</h2><p class="muted">El detalle de horas, km, combustible, viajes, bruto y comisión permanece en Control de Jornada. Finanzas recibe solamente el resultado financiero.</p><div class="b219-kpis"><article class="b219-kpi"><span>Resultados integrados</span><strong id="b219JCount">0</strong></article><article class="b219-kpi"><span>Neto integrado</span><strong id="b219JNet">$0</strong></article></div><div class="card"><h3>Integrar resultado de una jornada</h3><form id="b219JForm" class="b219-form"><label>Fecha<input id="b219JDate" type="date" required></label><label>Neto generado<input id="b219JNetInput" type="number" min="0" step="1" required></label><label>Costos incluidos<input id="b219JCost" type="number" min="0" step="1" value="0"></label><label>Estado<select id="b219JState"><option value="cobrado">Cobrado</option><option value="pendiente">Pendiente</option></select></label><label class="full">Referencia<input id="b219JRef" placeholder="Jornada Uber/inDrive"></label><button class="full" type="submit">Integrar resultado financiero</button></form><p id="b219JMsg" class="status"></p></div></div><div class="card"><h3>Historial integrado</h3><div id="b219JList"></div></div>';
function ensureReal(id,html){
  var app=$('app');if(!app)return false;
  var s=$(id);
  if(s && placeholder(s)){
    s.innerHTML=html;
    s.className='tab hidden';
    s.setAttribute('data-b23259-real','1');
    return true;
  }
  if(!s){
    s=document.createElement('section');s.id=id;s.className='tab hidden';s.setAttribute('data-b23259-real','1');s.innerHTML=html;app.appendChild(s);return true;
  }
  return false;
}
function footer(){
  var f=$('b23259-footer');
  if(!f){f=document.createElement('footer');f.id='b23259-footer';f.setAttribute('data-deploy-id',VERSION);f.style.cssText='margin:24px 10px 12px;padding:10px 12px;text-align:center;font:600 11px/1.4 system-ui,sans-serif;color:#64748b;border-top:1px solid #e5e7eb';document.body.appendChild(f)}
  f.textContent='Paquete desplegado: '+VERSION;
}
function repair(){
  nav();
  ensureReal('ingresos',incomeHtml);
  ensureReal('jornadas',jobsHtml);
  footer();
}
function boot(){repair();setTimeout(repair,300);setTimeout(repair,1000);setTimeout(repair,2500)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
setInterval(repair,300);
})();
