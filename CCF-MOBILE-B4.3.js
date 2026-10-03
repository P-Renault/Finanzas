/* CCF MOBILE B4.3.10 — ETAPA 1 · CORRECCIÓN RESUMEN
   Solo presentación móvil. No crea Supabase ni modifica autenticación.
   No modifica index.html, app.js ni módulos financieros.
*/
(()=>{'use strict';
if(window.__CCF_MOBILE_B434__)return; window.__CCF_MOBILE_B434__=true;
const BP=720,$=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const app=()=>document.getElementById('app'), mobile=()=>matchMedia('(max-width:'+BP+'px)').matches;
const by=id=>document.getElementById(id), tab=id=>$('.tabs button[data-tab="'+CSS.escape(id)+'"]');
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const META={presupuesto:['Presupuesto','Plan, ejecución y proyección','◒'],planificacion:['Planificación','Escenario de 30 días','◈'],futuros:['Pagos futuros','Vencimientos y compromisos','◷'],calendario:['Calendario','Vista mensual','▦'],ahorro:['Ahorro','Aportes e historial','◎'],operaciones:['Operaciones','Liquidez y operaciones','⇄'],ingresos:['Motor Multifuente','Generación de ingresos','↗'],jornadas:['Control de Jornada','Resultado financiero','◷'],'ia-financiera':['IA Financiera','Análisis y recomendaciones','✦']};
const PRIMARY=[['dashboard','Resumen','⌂'],['movimientos','Movimientos','↕'],['deudas','Deudas','▣'],['cuentas','Cuentas','▤']];
let root=null,built=false,moved=[],observer=null,reportTimer=null,activeModule=null,moduleMarker=null,flowSourceObserver=null,flowHostObserver=null,flowRenderLock=false;

function ready(){return mobile()&&app()&&!app().classList.contains('hidden')}
function mirror(id){const src=by(id);if(!src||!root)return;$$('.b434-mirror[data-source="'+id+'"]',root).forEach(n=>n.textContent=src.textContent?.trim()||'—')}
function mirrorAll(){[
'future-month-label','month-income-total','month-expense-total','kpi-real-balance','kpi-assured','kpi-projected','kpi-committed','kpi-projected-balance','kpi-gap',
'margin-status','margin-maximum','margin-spent','margin-remaining','margin-percent','margin-projection','summary-status-text','executive-risk-summary',
'exec-liquidity-reading','exec-obligation-reading','exec-flow-reading','exec-generation-reading'
].forEach(mirror);
const p=by('margin-progress'),q=$('[data-progress]',root);if(p&&q)q.style.width=p.style.width||'0%';}

function moveReal(id,host){
 if(!host)return null;
 /*
  * Un resumen móvil puede reconstruirse varias veces al navegar:
  * Más → Resumen, Resumen → otro módulo → Resumen.
  * En ese ciclo el host anterior se elimina del DOM, pero los elementos
  * reales movidos siguen registrados en `moved`. Buscar también allí evita
  * perder #chart-flow y demás gráficos al reconstruir la vista.
  */
 const existing=moved.find(x=>x?.el?.id===id)?.el||null;
 const el=by(id)||existing;
 if(!el)return null;

 if(el.dataset.b434Moved!=='1'){
   const originalParent=el.parentNode;
   const marker=document.createComment('CCF B4.3.4 '+id);
   if(originalParent&&originalParent!==host)originalParent.insertBefore(marker,el);
   el.dataset.b434Moved='1';
   moved.push({el,marker});
 }

 if(el.parentNode!==host)host.appendChild(el);
 return el;
}
function restoreReal(){for(const x of moved.slice().reverse()){delete x.el.dataset.b434Moved;if(x.marker.parentNode)x.marker.parentNode.insertBefore(x.el,x.marker.nextSibling);x.marker.remove()}moved=[]}
function nativeTab(id){const b=tab(id);if(b){b.click();return true}return false}
function closeAll(){$$('.b434-overlay.open',root).forEach(x=>x.classList.remove('open'));document.body.classList.remove('b434-lock')}
function notice(name){const o=$('.b434-overlay[data-overlay="notice"]',root);if(!o)return;o.querySelector('[data-notice]').textContent=name;o.classList.add('open');document.body.classList.add('b434-lock')}
function setActive(id){$$('[data-nav]',root).forEach(b=>b.classList.toggle('active',b.dataset.nav===id))}
function restoreActiveModule(){
 if(!activeModule)return;
 const el=activeModule;
 delete el.dataset.b434ModuleMoved;
 if(moduleMarker?.parentNode)moduleMarker.parentNode.insertBefore(el,moduleMarker.nextSibling);
 moduleMarker?.remove();
 moduleMarker=null;
 activeModule=null;
}
function moduleHost(){
 return $('[data-module-host]',root);
}

function movementMoney(text){
 const n=String(text||'').replace(/[^\d-]/g,'');
 return Number(n)||0;
}
function buildMovementsMobileShell(host,section){
 let shell=host.querySelector('[data-b434-movements-shell]');
 if(shell)return shell;
 shell=document.createElement('section');
 shell.className='b434-movements-shell';
 shell.dataset.b434MovementsShell='1';
 shell.innerHTML=`
   <div class="b434-mov-head">
     <span class="b434-eyebrow">CONTROL FINANCIERO</span>
     <h2>Movimientos</h2>
     <p>Registra, consulta y administra tus ingresos y gastos.</p>
   </div>
   <div class="b434-mov-kpis">
     <article><span>Ingresos</span><strong data-mov-income>$0</strong></article>
     <article><span>Gastos</span><strong data-mov-expense>$0</strong></article>
     <article><span>Balance</span><strong data-mov-balance>$0</strong></article>
     <article><span>Movimientos</span><strong data-mov-count>0</strong></article>
   </div>
   <div class="b434-mov-actions">
     <button type="button" data-mov-action="income">＋ Ingreso</button>
     <button type="button" data-mov-action="expense">＋ Gasto</button>
   </div>
   <div class="b434-mov-filter">
     <input type="search" data-mov-search placeholder="Buscar categoría o descripción…">
     <select data-mov-type>
       <option value="all">Todos</option>
       <option value="ingreso">Ingresos</option>
       <option value="gasto">Gastos</option>
     </select>
     <select data-mov-period>
       <option value="all">Todo el período</option>
       <option value="month">Mes actual</option>
       <option value="future">Futuros</option>
     </select>
   </div>`;
 host.insertBefore(shell,section);

 shell.querySelector('[data-mov-action="income"]').onclick=()=>{
   openMoveForm('Registrar ingreso');
   const s=by('movTipo');if(s)s.value='ingreso';
 };
 shell.querySelector('[data-mov-action="expense"]').onclick=()=>{
   openMoveForm('Registrar gasto');
   const s=by('movTipo');if(s)s.value='gasto';
 };
 shell.querySelector('[data-mov-search]').addEventListener('input',refreshMovementView);
 shell.querySelector('[data-mov-type]').addEventListener('change',refreshMovementView);
 shell.querySelector('[data-mov-period]').addEventListener('change',refreshMovementView);
 return shell;
}
function decorateMovementRows(){
 const list=by('movimientosLista');
 if(!list)return [];
 const rows=[...list.querySelectorAll('.row')];
 const today=new Date().toISOString().slice(0,10);
 const now=new Date();
 const ym=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
 let income=0,expense=0;

 rows.forEach(row=>{
   const text=row.textContent||'';
   const amountNode=row.querySelector('.row-right strong, .row-right b, strong');
   const raw=amountNode?.textContent||'';
   const amount=movementMoney(raw);
   const negative=amountNode?.classList.contains('negative') ||
                  /\bGasto\b/i.test(text) ||
                  /^\s*-\s*\$/.test(raw);
   const dateNode=row.querySelector('.row-main small, time, [data-date]');
   const date=(dateNode?.textContent||dateNode?.getAttribute?.('datetime')||'').trim();
   if(negative)expense+=Math.abs(amount); else income+=Math.abs(amount);

   row.dataset.movType=negative?'gasto':'ingreso';
   row.dataset.movDate=date;
   row.dataset.movSearch=text.toLowerCase();
   row.dataset.movCurrent=(date.startsWith(ym)||date.includes(`${String(now.getMonth()+1).padStart(2,'0')}-${now.getFullYear()}`))?'1':'0';
   row.dataset.movFuture=(date>today)?'1':'0';
   row.classList.add('b434-movement-card');
 });
 return {rows,income,expense};
}
function adaptMovementsMobile(){
 const section=by('movimientos');
 const host=moduleHost();
 if(!section||!host)return false;
 section.classList.add('b434-movements-mobile');

 const shell=buildMovementsMobileShell(host,section);
 const data=decorateMovementRows();
 const clp=n=>'$'+Math.round(n).toLocaleString('es-CL');
 const set=(sel,val)=>{const n=shell.querySelector(sel);if(n)n.textContent=val};

 if(data && Array.isArray(data.rows)){
   const income=Math.abs(data.income);
   const expense=Math.abs(data.expense);
   set('[data-mov-income]',clp(income));
   set('[data-mov-expense]',clp(expense));
   set('[data-mov-balance]',clp(income-expense));
   set('[data-mov-count]',String(data.rows.length));
 }
 refreshMovementView();
 return true;
}
function refreshMovementView(){
 const section=by('movimientos');if(!section)return;
 const list=by('movimientosLista');if(!list)return;
 const host=moduleHost();
 const shell=host?.querySelector('[data-b434-movements-shell]');
 if(!shell)return;

 decorateMovementRows();

 const q=(shell.querySelector('[data-mov-search]')?.value||'').trim().toLowerCase();
 const type=shell.querySelector('[data-mov-type]')?.value||'all';
 const period=shell.querySelector('[data-mov-period]')?.value||'all';

 [...list.querySelectorAll('.row')].forEach(row=>{
   const matchesSearch=!q||(row.dataset.movSearch||'').includes(q);
   const matchesType=type==='all'||row.dataset.movType===type;
   const matchesPeriod=period==='all' ||
     (period==='month'&&row.dataset.movCurrent==='1') ||
     (period==='future'&&row.dataset.movFuture==='1');
   row.style.display=matchesSearch&&matchesType&&matchesPeriod?'':'none';
 });
}

function adaptDesktopModule(id){
 const host=moduleHost();
 if(!host)return false;
 restoreActiveModule();
 let section=by(id);

 // Planificación/Operaciones son módulos dinámicos con router propietario.
 // Se solicita su montaje antes de intentar mover la sección real.
 if(!section && (id==='planificacion'||id==='operaciones') &&
    window.CCFRouter && typeof window.CCFRouter.show==='function'){
   try{ window.CCFRouter.show(id); }catch(e){ console.warn('[CCF MOBILE] router',e); }
   section=by(id);
 }
 if(!section){
   return false;
 }
 moduleMarker=document.createComment('CCF B4.3.4 module '+id);
 section.parentNode?.insertBefore(moduleMarker,section);
 section.classList.remove('hidden');
 section.dataset.b434ModuleMoved='1';
 host.replaceChildren(section);
 activeModule=section;
 host.classList.add('open');
 return true;
}
/* CCF MOBILE B4.3.10 — CALENDARIO · BOOTSTRAP GRID AISLADO
   Bootstrap 5.3 grid aplicado únicamente a #calendario.
   No modifica B232.26.4-calendario-safe.js ni otros módulos.
*/
let calendarObserver=null;
let calendarAdaptScheduled=false;
function calendarIsMobile(){
  /* El calendario es móvil cuando está montado dentro de la shell móvil.
     370px es la referencia de ancho del widget, NO un breakpoint de viewport. */
  return !!root && !!by('calendario') && root.id==='ccf-mobile-b43';
}

function styleCalendarMobile(){
  if(!root) return;
  let style=by('ccf-calendar-mobile-polish');
  if(!style){
    style=document.createElement('style');
    style.id='ccf-calendar-mobile-polish';
    style.textContent=`
      /* CCF MOBILE B4.3 · CALENDARIO 360° · UI REFERENCIA 03
         Integrado en B4.3. Solo presentación móvil. */

      #ccf-mobile-b43 #calendario,
      #ccf-mobile-b43 #calendario .b232261-card{
        width:100%!important;
        max-width:100%!important;
        box-sizing:border-box!important;
      }

      #ccf-mobile-b43 #calendario{
        margin:0!important;
        padding:0!important;
      }

      #ccf-mobile-b43 #calendario .b232261-card{
        margin:0!important;
        padding:15px!important;
        border:1px solid #e2e8f0!important;
        border-radius:22px!important;
        background:#fff!important;
        box-shadow:0 8px 28px rgba(15,23,42,.07)!important;
        overflow:hidden!important;
      }

      /* 01 · ENCABEZADO */
      #ccf-mobile-b43 #calendario .b232261-head{
        display:flex!important;
        flex-direction:column!important;
        align-items:stretch!important;
        gap:5px!important;
        margin:0 0 10px!important;
      }

      #ccf-mobile-b43 #calendario .b232261-head .b232261-sub:first-child{
        order:1!important;
        margin:0!important;
        font-size:0!important;
        line-height:1!important;
        font-weight:900!important;
      }

      #ccf-mobile-b43 #calendario .b232261-head .b232261-sub:first-child::after{
        content:'CALENDARIO 360°'!important;
        font-size:9px!important;
        letter-spacing:.08em!important;
        text-transform:uppercase!important;
        color:#0c4175!important;
      }

      #ccf-mobile-b43 #calendario .b232261-head h2{
        order:2!important;
        margin:0!important;
        font-size:25px!important;
        line-height:1.05!important;
        letter-spacing:-.035em!important;
        color:#172033!important;
      }

      #ccf-mobile-b43 #calendario .b232261-head .b232261-sub:last-child{
        order:3!important;
        margin:0!important;
        font-size:10px!important;
        line-height:1.35!important;
        color:#64748b!important;
      }

      /* 02 · NAVEGACIÓN */
      #ccf-mobile-b43 #calendario .b232261-actions{
        display:grid!important;
        grid-template-columns:42px 1fr 42px 1.55fr!important;
        gap:7px!important;
        width:100%!important;
        margin:1px 0 11px!important;
      }

      #ccf-mobile-b43 #calendario .b232261-actions button{
        min-width:0!important;
        min-height:43px!important;
        padding:8px 5px!important;
        border:1px solid transparent!important;
        border-radius:12px!important;
        font-size:13px!important;
        font-weight:850!important;
        box-shadow:none!important;
      }

      #ccf-mobile-b43 #calendario .b232261-actions button.secondary{
        background:#eef2f7!important;
        color:#172033!important;
        border-color:#e2e8f0!important;
      }

      /* La referencia no muestra estas dos bandas en la cabecera */
      #ccf-mobile-b43 #calendario .b232261-status,
      #ccf-mobile-b43 #calendario .b232261-scope{
        display:none!important;
      }

      /* 03 · RESUMEN — 4 TARJETAS */
      #ccf-mobile-b43 #calendario .b232261-kpis{
        display:grid!important;
        grid-template-columns:repeat(4,minmax(0,1fr))!important;
        gap:8px!important;
        margin:0 0 13px!important;
      }

      #ccf-mobile-b43 #calendario .b232261-kpi{
        position:relative!important;
        min-width:0!important;
        min-height:110px!important;
        padding:42px 9px 10px!important;
        border:1px solid #e2e8f0!important;
        border-radius:15px!important;
        background:#fff!important;
        box-shadow:0 3px 9px rgba(15,23,42,.035)!important;
        overflow:hidden!important;
      }

      #ccf-mobile-b43 #calendario .b232261-kpi::before{
        position:absolute!important;
        left:10px!important;
        top:10px!important;
        width:30px!important;
        height:30px!important;
        display:flex!important;
        align-items:center!important;
        justify-content:center!important;
        border-radius:50%!important;
        color:#fff!important;
        font-size:15px!important;
        font-weight:900!important;
        line-height:1!important;
      }

      #ccf-mobile-b43 #calendario .b232261-kpi:nth-child(1){
        border-top:3px solid #0fa069!important;
      }
      #ccf-mobile-b43 #calendario .b232261-kpi:nth-child(1)::before{
        content:'↑'!important;
        background:#0fa069!important;
      }

      #ccf-mobile-b43 #calendario .b232261-kpi:nth-child(2){
        border-top:3px solid #991b1c!important;
      }
      #ccf-mobile-b43 #calendario .b232261-kpi:nth-child(2)::before{
        content:'↓'!important;
        background:#991b1c!important;
      }

      #ccf-mobile-b43 #calendario .b232261-kpi:nth-child(3){
        border-top:3px solid #5146d8!important;
      }
      #ccf-mobile-b43 #calendario .b232261-kpi:nth-child(3)::before{
        content:'▣'!important;
        background:#5146d8!important;
      }

      #ccf-mobile-b43 #calendario .b232261-kpi:nth-child(4){
        border-top:3px solid #0c4175!important;
      }
      #ccf-mobile-b43 #calendario .b232261-kpi:nth-child(4)::before{
        content:'▤'!important;
        background:#0c4175!important;
      }

      #ccf-mobile-b43 #calendario .b232261-kpi:nth-child(n+5){
        display:none!important;
      }

      #ccf-mobile-b43 #calendario .b232261-kpi span,
      #ccf-mobile-b43 #calendario .b232261-kpi small{
        display:block!important;
        font-size:8px!important;
        line-height:1.25!important;
        color:#64748b!important;
      }

      #ccf-mobile-b43 #calendario .b232261-kpi strong{
        display:block!important;
        margin-top:5px!important;
        font-size:15px!important;
        line-height:1.05!important;
        letter-spacing:-.02em!important;
        color:#172033!important;
        overflow-wrap:anywhere!important;
      }

      /* 04 · CALENDARIO MENSUAL */
      #ccf-mobile-b43 #calendario .b232261-scroll{
        width:100%!important;
        margin:0!important;
        padding:5px!important;
        border:1px solid #dbe3ec!important;
        border-radius:17px!important;
        background:#f1f5f9!important;
        box-shadow:inset 0 1px 2px rgba(15,23,42,.035)!important;
        overflow-x:hidden!important;
      }

      #ccf-mobile-b43 #calendario .b232261-grid{
        display:grid!important;
        grid-template-columns:repeat(7,minmax(0,1fr))!important;
        gap:3px!important;
        width:100%!important;
        min-width:0!important;
        max-width:100%!important;
        background:transparent!important;
      }

      #ccf-mobile-b43 #calendario .b232261-week>div{
        min-width:0!important;
        min-height:31px!important;
        padding:7px 1px!important;
        display:flex!important;
        align-items:center!important;
        justify-content:center!important;
        background:#101b2f!important;
        color:#fff!important;
        font-size:8px!important;
        font-weight:900!important;
        letter-spacing:.035em!important;
      }

      #ccf-mobile-b43 #calendario .b232261-week>div:first-child{
        border-radius:10px 0 0 10px!important;
      }

      #ccf-mobile-b43 #calendario .b232261-week>div:last-child{
        border-radius:0 10px 10px 0!important;
      }

      #ccf-mobile-b43 #calendario .b232261-day{
        min-width:0!important;
        min-height:86px!important;
        height:86px!important;
        padding:6px!important;
        border:0!important;
        border-radius:10px!important;
        background:#fff!important;
        box-shadow:0 1px 4px rgba(15,23,42,.055)!important;
        overflow:hidden!important;
      }

      #ccf-mobile-b43 #calendario .b232261-day.out{
        background:#edf1f6!important;
        color:#94a3b8!important;
        box-shadow:none!important;
      }

      #ccf-mobile-b43 #calendario .b232261-day.selected{
        outline:2px solid #0c4175!important;
        outline-offset:-2px!important;
        background:#fff!important;
        box-shadow:0 3px 11px rgba(25,135,229,.15)!important;
      }

      #ccf-mobile-b43 #calendario .b232261-day-top{
        min-height:16px!important;
        display:flex!important;
        justify-content:space-between!important;
        align-items:center!important;
        gap:3px!important;
        font-size:10px!important;
        line-height:1!important;
      }

      #ccf-mobile-b43 #calendario .b232261-day-top strong{
        font-size:12px!important;
        font-weight:850!important;
        color:#334155!important;
      }

      #ccf-mobile-b43 #calendario .b232261-day-top small{
        font-size:6px!important;
        line-height:1!important;
        font-weight:900!important;
        letter-spacing:.03em!important;
        color:#0c4175!important;
      }

      #ccf-mobile-b43 #calendario .b232261-event{
        display:block!important;
        max-width:100%!important;
        margin-top:3px!important;
        padding:3px 4px!important;
        border-radius:6px!important;
        font-size:7px!important;
        line-height:1.05!important;
        font-weight:800!important;
        white-space:nowrap!important;
        overflow:hidden!important;
        text-overflow:ellipsis!important;
      }

      #ccf-mobile-b43 #calendario .b232261-real-in{
        background:#e9f9f0!important;
        color:#0fa069!important;
      }
      #ccf-mobile-b43 #calendario .b232261-real-out{
        background:#fff0f1!important;
        color:#991b1c!important;
      }
      #ccf-mobile-b43 #calendario .b232261-plan-in{
        background:#eef7ff!important;
        color:#0c4175!important;
      }
      #ccf-mobile-b43 #calendario .b232261-plan-out{
        background:#fff5ea!important;
        color:#b45309!important;
      }
      #ccf-mobile-b43 #calendario .b232261-gen,
      #ccf-mobile-b43 #calendario .b232261-debt{
        background:#f0efff!important;
        color:#5146d8!important;
      }

      #ccf-mobile-b43 #calendario .b232261-more,
      #ccf-mobile-b43 #calendario .b232261-mini{
        display:block!important;
        max-width:100%!important;
        margin-top:3px!important;
        font-size:6.5px!important;
        line-height:1.05!important;
        white-space:nowrap!important;
        overflow:hidden!important;
        text-overflow:ellipsis!important;
      }

      /* 05 · LEYENDA */
      #ccf-mobile-b43 #calendario .b232261-foot{
        margin-top:8px!important;
        padding:14px 5px 2px!important;
        border-top:1px solid #e2e8f0!important;
        font-size:9px!important;
        line-height:1.4!important;
        color:#64748b!important;
      }

      /* 06 · DETALLE DIARIO — TARJETAS */
      #ccf-mobile-b43 #calendario .b232261-detail{
        grid-template-columns:repeat(2,minmax(0,1fr))!important;
        gap:10px!important;
        margin-top:13px!important;
      }

      #ccf-mobile-b43 #calendario .b232261-box{
        min-width:0!important;
        padding:13px!important;
        border:1px solid #e2e8f0!important;
        border-radius:16px!important;
        background:#fff!important;
        box-shadow:0 3px 10px rgba(15,23,42,.04)!important;
      }

      #ccf-mobile-b43 #calendario .b232261-positive-box{
        border-top:4px solid #0fa069!important;
      }

      #ccf-mobile-b43 #calendario .b232261-negative-box{
        border-top:4px solid #991b1c!important;
      }

      #ccf-mobile-b43 #calendario .b232261-box h3{
        font-size:12px!important;
        line-height:1.3!important;
        margin:0 0 8px!important;
        color:#1e293b!important;
      }

      #ccf-mobile-b43 #calendario .b232261-detail-total{
        padding:7px 0!important;
        margin-bottom:3px!important;
        font-size:12px!important;
      }

      #ccf-mobile-b43 #calendario .b232261-row{
        padding:7px 0!important;
        font-size:9px!important;
      }

      #ccf-mobile-b43 #calendario .b232261-row small{
        font-size:8px!important;
      }


      /* Detalle inferior reconstruido según referencia 3 */
      #ccf-mobile-b43 #calendario .ccf-calendar-professional-detail{
        margin-top:14px!important;
        padding:0!important;
      }
      #ccf-mobile-b43 #calendario .ccf-cpd-head{
        display:flex!important;
        align-items:center!important;
        justify-content:space-between!important;
        gap:10px!important;
        margin:0 0 10px!important;
      }
      #ccf-mobile-b43 #calendario .ccf-cpd-head h3{
        margin:0!important;
        font-size:18px!important;
        line-height:1.2!important;
        color:#172033!important;
        letter-spacing:-.02em!important;
      }
      #ccf-mobile-b43 #calendario .ccf-cpd-day-btn{
        flex:0 0 auto!important;
        min-height:38px!important;
        padding:8px 11px!important;
        border:1px solid #e2e8f0!important;
        border-radius:11px!important;
        background:#fff!important;
        color:#334155!important;
        font-size:10px!important;
        font-weight:800!important;
      }
      #ccf-mobile-b43 #calendario .ccf-cpd-kpis{
        display:grid!important;
        grid-template-columns:repeat(4,minmax(0,1fr))!important;
        gap:8px!important;
        margin:0 0 10px!important;
      }
      #ccf-mobile-b43 #calendario .ccf-cpd-kpi{
        min-width:0!important;
        min-height:70px!important;
        padding:9px!important;
        border:1px solid #e2e8f0!important;
        border-radius:14px!important;
        background:#fff!important;
        box-shadow:0 2px 8px rgba(15,23,42,.035)!important;
      }
      #ccf-mobile-b43 #calendario .ccf-cpd-kpi>span{
        display:inline-flex!important;
        width:27px!important;
        height:27px!important;
        align-items:center!important;
        justify-content:center!important;
        margin-bottom:5px!important;
        border-radius:50%!important;
        color:#fff!important;
        font-size:12px!important;
        font-weight:900!important;
      }
      #ccf-mobile-b43 #calendario .ccf-cpd-kpi.green>span{background:#0fa069!important}
      #ccf-mobile-b43 #calendario .ccf-cpd-kpi.red>span{background:#991b1c!important}
      #ccf-mobile-b43 #calendario .ccf-cpd-kpi.violet>span{background:#5146d8!important}
      #ccf-mobile-b43 #calendario .ccf-cpd-kpi.flow>span{background:#991b1c!important}
      #ccf-mobile-b43 #calendario .ccf-cpd-kpi small{
        display:block!important;
        color:#64748b!important;
        font-size:8px!important;
        line-height:1.1!important;
      }
      #ccf-mobile-b43 #calendario .ccf-cpd-kpi strong{
        display:block!important;
        margin-top:3px!important;
        color:#172033!important;
        font-size:15px!important;
        line-height:1.05!important;
      }
      #ccf-mobile-b43 #calendario .ccf-cpd-balances{
        display:grid!important;
        grid-template-columns:repeat(2,minmax(0,1fr))!important;
        gap:8px!important;
        margin-bottom:10px!important;
      }
      #ccf-mobile-b43 #calendario .ccf-cpd-balance{
        display:flex!important;
        align-items:center!important;
        gap:9px!important;
        min-width:0!important;
        padding:10px!important;
        border:1px solid #e2e8f0!important;
        border-radius:14px!important;
        background:#fff!important;
        box-shadow:0 2px 8px rgba(15,23,42,.035)!important;
      }
      #ccf-mobile-b43 #calendario .ccf-cpd-icon{
        flex:0 0 36px!important;
        width:36px!important;
        height:36px!important;
        display:flex!important;
        align-items:center!important;
        justify-content:center!important;
        border-radius:50%!important;
        color:#fff!important;
        font-size:14px!important;
        font-weight:900!important;
      }
      #ccf-mobile-b43 #calendario .ccf-cpd-icon.gray{background:#94a3b8!important}
      #ccf-mobile-b43 #calendario .ccf-cpd-icon.blue{background:#0c4175!important}
      #ccf-mobile-b43 #calendario .ccf-cpd-balance small{
        display:block!important;
        color:#64748b!important;
        font-size:8px!important;
        line-height:1.15!important;
      }
      #ccf-mobile-b43 #calendario .ccf-cpd-balance strong{
        display:block!important;
        margin-top:2px!important;
        color:#334155!important;
        font-size:15px!important;
        line-height:1.05!important;
      }
      #ccf-mobile-b43 #calendario .ccf-cpd-lower{
        display:grid!important;
        grid-template-columns:repeat(2,minmax(0,1fr))!important;
        gap:10px!important;
      }
      #ccf-mobile-b43 #calendario .ccf-cpd-panel{
        min-width:0!important;
        border:1px solid #e2e8f0!important;
        border-radius:15px!important;
        background:#fff!important;
        overflow:hidden!important;
        box-shadow:0 2px 8px rgba(15,23,42,.035)!important;
      }
      #ccf-mobile-b43 #calendario .ccf-cpd-panel.positive{border-top:4px solid #0fa069!important}
      #ccf-mobile-b43 #calendario .ccf-cpd-panel.negative{border-top:4px solid #991b1c!important}
      #ccf-mobile-b43 #calendario .ccf-cpd-panel-head{
        display:grid!important;
        grid-template-columns:30px 1fr auto!important;
        align-items:center!important;
        gap:7px!important;
        padding:10px!important;
      }
      #ccf-mobile-b43 #calendario .ccf-cpd-panel-head b{
        font-size:11px!important;
        line-height:1.15!important;
        color:#1e293b!important;
      }
      #ccf-mobile-b43 #calendario .ccf-cpd-panel-head>strong{
        font-size:11px!important;
      }
      #ccf-mobile-b43 #calendario .ccf-cpd-panel.positive .ccf-cpd-panel-head>strong{color:#0fa069!important}
      #ccf-mobile-b43 #calendario .ccf-cpd-panel.negative .ccf-cpd-panel-head>strong{color:#991b1c!important}
      #ccf-mobile-b43 #calendario .ccf-cpd-round{
        display:flex!important;
        width:29px!important;
        height:29px!important;
        align-items:center!important;
        justify-content:center!important;
        border-radius:50%!important;
        color:#fff!important;
        font-size:12px!important;
        font-weight:900!important;
      }
      #ccf-mobile-b43 #calendario .ccf-cpd-round.green{background:#0fa069!important}
      #ccf-mobile-b43 #calendario .ccf-cpd-round.red{background:#991b1c!important}
      #ccf-mobile-b43 #calendario .ccf-cpd-panel-body{
        padding:0 10px 10px!important;
      }
      #ccf-mobile-b43 #calendario .ccf-cpd-panel-body .b232261-box{
        margin:0!important;
        padding:0!important;
        border:0!important;
        border-radius:0!important;
        box-shadow:none!important;
        background:transparent!important;
      }
      #ccf-mobile-b43 #calendario .ccf-cpd-panel-body .b232261-box h3,
      #ccf-mobile-b43 #calendario .ccf-cpd-panel-body .b232261-detail-total{
        display:none!important;
      }
      #ccf-mobile-b43 #calendario .ccf-cpd-panel-body .b232261-row{
        padding:7px 0!important;
        font-size:9px!important;
      }
      #ccf-mobile-b43 #calendario .ccf-cpd-panel-body .b232261-empty{
        padding:11px 4px!important;
        border-radius:10px!important;
        background:#f8fafc!important;
        font-size:9px!important;
        line-height:1.35!important;
      }
      #ccf-mobile-b43 #calendario .ccf-cpd-panel-body .b232261-row strong{
        font-size:10px!important;
      }

      @media(max-width:390px){
        #ccf-mobile-b43 #calendario .b232261-card{
          padding:12px!important;
          border-radius:19px!important;
        }

        #ccf-mobile-b43 #calendario .b232261-kpis{
          grid-template-columns:repeat(2,minmax(0,1fr))!important;
          gap:7px!important;
        }

        #ccf-mobile-b43 #calendario .b232261-kpi{
          min-height:78px!important;
          padding:41px 9px 9px!important;
        }

        #ccf-mobile-b43 #calendario .b232261-day{
          height:82px!important;
          min-height:82px!important;
          padding:5px!important;
        }

        #ccf-mobile-b43 #calendario .b232261-event{
          font-size:6px!important;
          padding:2px 3px!important;
        }

        #ccf-mobile-b43 #calendario .b232261-detail{
          grid-template-columns:1fr!important;
        }
      }
    `;
    document.head.appendChild(style);
  }
}

function adaptB232261CalendarMobile(){
  if(!calendarIsMobile()) return false;
  const section=by('calendario');
  if(!section) return false;

  const card=section.querySelector('.b232261-card');
  const scroll=section.querySelector('.b232261-scroll');
  const grid=section.querySelector('.b232261-grid.b232261-week') ||
             section.querySelector('.b232261-grid');
  if(!card||!scroll||!grid) return false;
  styleCalendarMobile();
  syncCalendarRealIndicators();

  /*
   * Bootstrap 5 grid aislado al calendario.
   * No depende de un breakpoint de 370px: 370px es el ancho de referencia
   * del widget. La grilla siempre ocupa el ancho real disponible.
   */
  grid.classList.add('row','g-0','b434-bs-calendar-row');

  const imp=(el,p,v)=>{
    if(el) el.style.setProperty(p,String(v),'important');
  };

  [section,card,scroll,grid].forEach(el=>{
    imp(el,'width','100%');
    imp(el,'max-width','100%');
    imp(el,'min-width','0');
    imp(el,'box-sizing','border-box');
  });

  imp(section,'overflow','hidden');
  imp(card,'overflow','hidden');
  imp(scroll,'display','block');
  imp(scroll,'overflow-x','hidden');
  imp(scroll,'overflow-y','visible');

  /*
   * La regla desktop del motor es:
   * repeat(7,minmax(110px,1fr)) + min-width:770px.
   * Se anula directamente en línea con !important.
   */
  imp(grid,'display','grid');
  imp(grid,'grid-template-columns','repeat(7,minmax(0,1fr))');
  imp(grid,'grid-template-rows','auto');
  imp(grid,'grid-auto-flow','row');
  imp(grid,'width','100%');
  imp(grid,'min-width','0');
  imp(grid,'max-width','100%');
  imp(grid,'overflow','hidden');
  imp(grid,'margin','0');
  imp(grid,'padding','0');
  imp(grid,'gap','0');

  const cells=[...grid.children];
  cells.forEach((cell)=>{
    cell.classList.add('col','b434-bs-calendar-col');
    imp(cell,'width','auto');
    imp(cell,'min-width','0');
    imp(cell,'max-width','100%');
    imp(cell,'box-sizing','border-box');
    imp(cell,'margin','0');
    imp(cell,'padding-left','0');
    imp(cell,'padding-right','0');
    imp(cell,'overflow','hidden');
  });

  section.querySelectorAll('.b232261-day').forEach(day=>{
    imp(day,'width','100%');
    imp(day,'min-width','0');
    imp(day,'max-width','100%');
    imp(day,'min-height','78px');
    imp(day,'height','78px');
    imp(day,'box-sizing','border-box');
    imp(day,'overflow','hidden');
  });

  rebuildCalendarProfessionalDetail();

  return true;
}



function syncCalendarRealIndicators(data){
  if(!calendarIsMobile()) return false;
  const section=by('calendario');
  if(!section) return false;

  const selectedDay=section.querySelector('.b232261-day.selected');
  const kpis=[...section.querySelectorAll('.b232261-kpi')];
  if(!selectedDay||!kpis.length) return false;

  const parseMoney=(text)=>{
    const m=String(text||'').match(/-?\$\s*[\d.]+/);
    if(!m) return 0;
    const raw=m[0].replace(/\s/g,'').replace(/\$/g,'').replace(/\./g,'');
    const n=Number(raw);
    return Number.isFinite(n)?n:0;
  };
  const sum=(selector)=>{
    let total=0;
    selectedDay.querySelectorAll(selector).forEach(el=>{ total+=parseMoney(el.textContent); });
    return total;
  };
  const money=(n)=>{
    const sign=n<0?'-':'';
    return sign+'$'+Math.abs(Math.round(n)).toLocaleString('es-CL');
  };
  const setKpi=(index,value)=>{
    const strong=kpis[index]?.querySelector('strong');
    if(strong) strong.textContent=money(value);
  };

  const realIn=sum('.b232261-real-in');
  const projectedIn=sum('.b232261-plan-in');
  const generated=sum('.b232261-gen');
  const realOut=sum('.b232261-real-out');

  /*
   * Los cuatro KPI visibles en móvil representan exactamente las cuatro
   * métricas superiores de la vista profesional:
   * 1) ingresos reales
   * 2) ingresos proyectados
   * 3) ingresos netos (reales + proyectados + generación)
   * 4) egresos reales
   *
   * No se reemplazan los datos de Supabase: se sincroniza la presentación
   * con el día que B232 ya tiene seleccionado.
   */
  setKpi(0,realIn);
  setKpi(1,projectedIn);
  setKpi(2,realIn+projectedIn+generated);
  setKpi(3,realOut);

  return {
    realIn,
    projectedIn,
    generated,
    realOut,
    netIn:realIn+projectedIn+generated
  };
}

function rebuildCalendarProfessionalDetail(){
  if(!calendarIsMobile()) return false;
  const section=by('calendario');
  if(!section) return false;

  const old=section.querySelector('.b232261-detail');
  const foot=section.querySelector('.b232261-foot');
  const scope=section.querySelector('.b232261-scope');
  if(!old||!foot||!scope) return false;

  const selectedKey=scope.querySelector('span')?.textContent?.trim()||'';
  if(old.dataset.ccfProfessionalDetail===selectedKey) return true;

  const positiveBox=old.querySelector('.b232261-positive-box');
  const negativeBox=old.querySelector('.b232261-negative-box');
  if(!positiveBox||!negativeBox) return false;

  const moneyValue=(text)=>{
    const m=String(text||'').match(/-?\$\s*[\d.]+/);
    return m?m[0].replace(/\s/g,''):'$0';
  };
  const numberValue=(text)=>{
    const v=moneyValue(text).replace(/[$.]/g,'');
    const n=Number(v);
    return Number.isFinite(n)?n:0;
  };
  const money=(n)=>{
    const sign=n<0?'-':'';
    return sign+'$'+Math.abs(Math.round(n)).toLocaleString('es-CL');
  };
  const sumEvents=(selector)=>{
    let total=0;
    section.querySelectorAll('.b232261-day.selected '+selector).forEach(el=>{
      total+=numberValue(el.textContent);
    });
    return total;
  };

  const realIn=sumEvents('.b232261-real-in');
  const realOut=sumEvents('.b232261-real-out');
  const positiveTotal=numberValue(positiveBox.querySelector('.b232261-detail-total')?.textContent);
  const negativeTotal=numberValue(negativeBox.querySelector('.b232261-detail-total')?.textContent);

  /*
   * La conciliación del detalle parte de los totales que B232 ya calculó
   * para el día seleccionado. Así evitamos depender de clases internas
   * que pueden cambiar en el renderer.
   */
  const indicatorData=syncCalendarRealIndicators();
  const reconciledRealIn=indicatorData?.realIn ?? realIn;
  const reconciledRealOut=indicatorData?.realOut ?? realOut;
  const reconciledPositive=positiveTotal;
  const reconciledNegative=negativeTotal;
  const obligations=Math.max(0,reconciledNegative-reconciledRealOut);
  const reconciledFlow=reconciledPositive-reconciledNegative;

  const footerText=foot.textContent||'';
  const footerMoney=[...footerText.matchAll(/-?\$\s*[\d.]+/g)].map(x=>numberValue(x[0]));
  const realClosingBalance=footerMoney[0]??0;

  /*
   * B232 muestra en el pie el saldo acumulado REAL al cierre del día.
   * Para el indicador "Saldo inicial" debemos retroceder los movimientos
   * reales del mismo día, sin volver a sumar/restar el historial completo.
   */
  const initialBalance=realClosingBalance-realIn+realOut;
  const finalBalance=initialBalance+reconciledPositive-reconciledNegative;
  const flow=reconciledPositive-reconciledNegative;

  const positiveClone=positiveBox.cloneNode(true);
  const negativeClone=negativeBox.cloneNode(true);

  const detail=document.createElement('div');
  detail.className='ccf-calendar-professional-detail';
  detail.dataset.ccfProfessionalDetail=selectedKey;

  const title=scope.querySelector('span')?.textContent?.trim()||'Día seleccionado';
  detail.innerHTML=`
    <div class="ccf-cpd-head">
      <h3>${esc(title)}</h3>
      <button type="button" class="ccf-cpd-day-btn">▣&nbsp; Ver día completo</button>
    </div>

    <div class="ccf-cpd-kpis">
      <div class="ccf-cpd-kpi green"><span>↑</span><small>Ingresos</small><strong>${money(reconciledPositive)}</strong></div>
      <div class="ccf-cpd-kpi red"><span>↓</span><small>Egresos</small><strong>${money(reconciledRealOut)}</strong></div>
      <div class="ccf-cpd-kpi violet"><span>▣</span><small>Obligaciones</small><strong>${money(obligations)}</strong></div>
      <div class="ccf-cpd-kpi flow"><span>Σ</span><small>Flujo neto</small><strong>${money(reconciledFlow)}</strong></div>
    </div>

    <div class="ccf-cpd-balances">
      <div class="ccf-cpd-balance"><span class="ccf-cpd-icon gray">▣</span><div><small>Saldo inicial</small><strong>${money(initialBalance)}</strong></div></div>
      <div class="ccf-cpd-balance"><span class="ccf-cpd-icon blue">▣</span><div><small>Saldo final (proyectado)</small><strong>${money(finalBalance)}</strong></div></div>
    </div>

    <div class="ccf-cpd-lower">
      <div class="ccf-cpd-panel positive">
        <div class="ccf-cpd-panel-head"><span class="ccf-cpd-round green">↑</span><b>Movimientos positivos</b><strong>${money(positiveTotal)}</strong></div>
        <div class="ccf-cpd-panel-body"></div>
      </div>
      <div class="ccf-cpd-panel negative">
        <div class="ccf-cpd-panel-head"><span class="ccf-cpd-round red">↓</span><b>Gastos y obligaciones</b><strong>${money(negativeTotal)}</strong></div>
        <div class="ccf-cpd-panel-body"></div>
      </div>
    </div>
  `;

  detail.querySelector('.ccf-cpd-panel.positive .ccf-cpd-panel-body').appendChild(positiveClone);
  detail.querySelector('.ccf-cpd-panel.negative .ccf-cpd-panel-body').appendChild(negativeClone);

  const btn=detail.querySelector('.ccf-cpd-day-btn');
  btn?.addEventListener('click',()=>detail.scrollIntoView({behavior:'smooth',block:'start'}));

  old.replaceWith(detail);
  return true;
}

function scheduleCalendarMobileAdapt(){
  if(!calendarIsMobile()||calendarAdaptScheduled)return;
  calendarAdaptScheduled=true;
  requestAnimationFrame(()=>{
    calendarAdaptScheduled=false;
    adaptB232261CalendarMobile();
  });
}

function observeCalendarMobile(){
  calendarObserver?.disconnect();
  calendarObserver=null;
  const section=by('calendario');
  if(!calendarIsMobile()||!section)return;
  calendarObserver=new MutationObserver(()=>scheduleCalendarMobileAdapt());
  calendarObserver.observe(section,{childList:true,subtree:true});
  scheduleCalendarMobileAdapt();
}


/* ================================================================
   CCF MOBILE B4.3 — DEUDAS · ACCIONES Y DETALLE EN CONTEXTO
   Solo móvil. No modifica los motores B220/B231/B232 ni escritorio.
   - Eleva modales de pago/abono por encima de la shell móvil.
   - Mantiene los modales como overlays, sin quedar detrás de .b434 root.
   - Inserta el detalle inmediatamente después de la deuda seleccionada.
   ================================================================ */
let debtMobileDetailAnchor=null;
let debtMobileDetailKey=null;
let debtMobileDetailIndex=-1;
let debtMobileDetailSignature='';
let debtMobileListObserver=null;
let debtMobileFixInstalled=false;
let debtMobileMoveTimer=null;

function styleDebtMobileActions(){
  if(!mobile()) return;
  let style=by('ccf-debt-mobile-actions-fix');
  if(style) return;

  style=document.createElement('style');
  style.id='ccf-debt-mobile-actions-fix';
  style.textContent=`
    @media(max-width:720px){
      body #b220Modal,
      body #b2313-abono-modal,
      body #b23266fix-abono-modal{
        position:fixed!important;
        z-index:2147483647!important;
      }

      body #b220Modal .b220-modal,
      body #b2313-abono-modal>div,
      body #b23266fix-abono-modal>div{
        position:relative!important;
        z-index:2147483647!important;
        max-width:calc(100vw - 24px)!important;
        box-sizing:border-box!important;
      }

      body:has(#b220Modal),
      body:has(#b2313-abono-modal),
      body:has(#b23266fix-abono-modal){
        overflow:hidden!important;
      }

      /* El detalle debe ser un elemento hermano inmediato de la deuda
         seleccionada. No se fija al final del módulo. */
      #ccf-mobile-b43 .b434-module-host #deudas #deudaDetalle{
        width:100%!important;
        max-width:100%!important;
        box-sizing:border-box!important;
        margin:10px 0 12px!important;
        clear:both!important;
        position:relative!important;
        z-index:2!important;
        scroll-margin-top:84px!important;
      }

      #ccf-mobile-b43 .b434-module-host #deudas .debt-card{
        position:relative!important;
        z-index:1!important;
      }

      #ccf-mobile-b43 .b434-module-host #deudas .form-actions{
        position:relative!important;
        z-index:3!important;
      }
    }
  `;
  document.head.appendChild(style);
}

function debtCardSignature(card){
  if(!card) return '';
  const title=card.querySelector('h1,h2,h3,h4,h5,strong')?.textContent?.trim()||'';
  const subtitle=card.querySelector('p,.debt-description,small')?.textContent?.trim()||'';
  return (title+'|'+subtitle).replace(/\\s+/g,' ').trim().slice(0,220);
}

function getDebtCards(){
  const section=by('deudas');
  return section?[...section.querySelectorAll('.debt-card')]:[];
}

function findDebtDetailAnchor(){
  if(debtMobileDetailAnchor?.isConnected&&debtMobileDetailAnchor.parentNode){
    return debtMobileDetailAnchor;
  }

  const cards=getDebtCards();
  if(!cards.length) return null;

  /* 1. Identidad exacta del handler original. */
  if(debtMobileDetailKey){
    const exact=cards.find(card=>[...card.querySelectorAll('button')].some(button=>
      (button.getAttribute('onclick')||'').trim()===debtMobileDetailKey
    ));
    if(exact){
      debtMobileDetailAnchor=exact;
      return exact;
    }
  }

  /* 2. Firma de la deuda seleccionada. */
  if(debtMobileDetailSignature){
    const bySignature=cards.find(card=>debtCardSignature(card)===debtMobileDetailSignature);
    if(bySignature){
      debtMobileDetailAnchor=bySignature;
      return bySignature;
    }
  }

  /* 3. Como último recurso, conserva la misma posición de la lista. */
  if(debtMobileDetailIndex>=0 && cards[debtMobileDetailIndex]){
    debtMobileDetailAnchor=cards[debtMobileDetailIndex];
    return debtMobileDetailAnchor;
  }

  return null;
}

function getDebtDetailContextNode(){
  const detail=by('deudaDetalle');
  if(!detail) return null;

  /* #deudaDetalle normalmente vive dentro de una tarjeta/contenedor.
     Movemos el contenedor visual completo para que el bloque DETALLE
     quede realmente entre la deuda seleccionada y la siguiente deuda. */
  const outer=detail.closest('.card');
  if(outer && outer!==by('deudas') && !outer.classList.contains('debt-card')){
    outer.classList.add('ccf-debt-detail-context-card');
    return outer;
  }

  return detail;
}

function moveDebtDetailAfterSelected(){
  if(!mobile()) return false;
  const detail=by('deudaDetalle');
  const contextNode=getDebtDetailContextNode();
  const anchor=findDebtDetailAnchor();
  if(!detail||!contextNode||!anchor||!anchor.parentNode) return false;

  /* No usamos scrollIntoView: el detalle debe aparecer EN CONTEXTO,
     inmediatamente después de la deuda pulsada. */
  if(anchor.nextElementSibling!==contextNode){
    anchor.parentNode.insertBefore(contextNode,anchor.nextSibling);
  }

  detail.dataset.ccfDebtDetailContext='selected';
  detail.dataset.ccfDebtDetailKey=debtMobileDetailKey||'';
  detail.style.display='block';
  contextNode.style.display='block';
  return true;
}

function scheduleDebtDetailMove(){
  clearTimeout(debtMobileMoveTimer);
  debtMobileMoveTimer=setTimeout(()=>moveDebtDetailAfterSelected(),0);
}

function armDebtDetailContext(card){
  if(!mobile()||!card) return;
  const cards=getDebtCards();
  debtMobileDetailAnchor=card;
  debtMobileDetailIndex=Math.max(0,cards.indexOf(card));
  debtMobileDetailSignature=debtCardSignature(card);
  const trigger=card.querySelector('button[onclick*="verDeuda23("],button[onclick*="verDeuda("]');
  debtMobileDetailKey=(trigger?.getAttribute('onclick')||'').trim()||null;
  scheduleDebtDetailMove();
}

let debtMobileVerDeudaBridge=null;
let debtMobileVerDeuda23Bridge=null;

function installDebtDetailContextBridge(){
  if(!mobile()) return;

  const install=(name)=>{
    const current=window[name];
    if(typeof current!=='function' || current.__ccfMobileContextBridge) return;

    const wrapped=async function(id,...args){
      const cards=getDebtCards();
      const card=cards.find(c=>[...c.querySelectorAll('button')].some(b=>{
        const oc=b.getAttribute('onclick')||'';
        const m=oc.match(/(?:window\.)?verDeuda(?:23)?\s*\(\s*(\d+)/i);
        return m && Number(m[1])===Number(id);
      }));
      if(card) armDebtDetailContext(card);

      /* B235 showDebt() ejecuta scrollIntoView() y window.scrollTo()
         durante la apertura. En móvil esas instrucciones provocan el
         salto al inicio/final del módulo. Se neutralizan únicamente
         mientras se ejecuta esta acción. */
      const originalScrollTo=window.scrollTo;
      const originalScrollBy=window.scrollBy;
      const originalIntoView=Element.prototype.scrollIntoView;
      const noop=()=>{};
      try{
        window.scrollTo=noop;
        window.scrollBy=noop;
        Element.prototype.scrollIntoView=noop;
        const result=await current.apply(this,[id,...args]);

        /* showDebt() termina de renderizar #deudaDetalle después de
           consultar Supabase. Reubicar después garantiza que quede
           inmediatamente debajo de la deuda pulsada. */
        [0,20,60,120,250,500,900,1400].forEach(ms=>setTimeout(()=>{
          if(mobile()) moveDebtDetailAfterSelected();
        },ms));
        return result;
      } finally {
        window.scrollTo=originalScrollTo;
        window.scrollBy=originalScrollBy;
        Element.prototype.scrollIntoView=originalIntoView;
      }
    };

    wrapped.__ccfMobileContextBridge=true;
    wrapped.__ccfMobileOriginal=current;
    window[name]=wrapped;
    if(name==='verDeuda23') debtMobileVerDeuda23Bridge=wrapped;
    if(name==='verDeuda') debtMobileVerDeudaBridge=wrapped;
  };

  install('verDeuda23');
  install('verDeuda');
}

function installDebtMobileBehavior(){
  if(!mobile()) return;
  styleDebtMobileActions();
  installDebtDetailContextBridge();

  const section=by('deudas');
  if(!section) return;

  if(debtMobileFixInstalled&&section.dataset.ccfDebtMobileActions==='1'){
    installDebtDetailContextBridge();
    scheduleDebtDetailMove();
    return;
  }

  debtMobileFixInstalled=true;
  section.dataset.ccfDebtMobileActions='1';

  section.addEventListener('click',event=>{
    const button=event.target?.closest?.('button');
    if(!button) return;
    const card=button.closest('.debt-card');
    if(!card) return;
    const onclick=button.getAttribute('onclick')||'';
    const text=String(button.textContent||'').trim().toLowerCase();
    if(text==='ver detalle'||onclick.includes('verDeuda23(')||onclick.includes('verDeuda(')){
      armDebtDetailContext(card);
    }
  },true);

  debtMobileListObserver=new MutationObserver(()=>{
    /* B219/B235 puede reinstalar window.verDeuda23 después de nuestra
       primera instalación. Por eso se intenta envolver nuevamente. */
    installDebtDetailContextBridge();
    if(debtMobileDetailKey||debtMobileDetailSignature||debtMobileDetailIndex>=0){
      scheduleDebtDetailMove();
    }
    styleDebtMobileActions();
  });
  debtMobileListObserver.observe(section,{childList:true,subtree:true});
  scheduleDebtDetailMove();
}

function cleanupDebtMobileBehavior(){
  clearTimeout(debtMobileMoveTimer);
  debtMobileMoveTimer=null;
  debtMobileListObserver?.disconnect();
  debtMobileListObserver=null;
  if(debtMobileVerDeuda23Bridge?.__ccfMobileOriginal && window.verDeuda23===debtMobileVerDeuda23Bridge){
    window.verDeuda23=debtMobileVerDeuda23Bridge.__ccfMobileOriginal;
  }
  if(debtMobileVerDeudaBridge?.__ccfMobileOriginal && window.verDeuda===debtMobileVerDeudaBridge){
    window.verDeuda=debtMobileVerDeudaBridge.__ccfMobileOriginal;
  }
  debtMobileVerDeuda23Bridge=null;
  debtMobileVerDeudaBridge=null;
  debtMobileDetailAnchor=null;
  debtMobileDetailKey=null;
  debtMobileDetailIndex=-1;
  debtMobileDetailSignature='';
  debtMobileFixInstalled=false;
}

function showModuleAfterNavigation(id){
 const content=$('[data-content]',root);
 const host=moduleHost();
 if(id==='dashboard'){
   restoreActiveModule();
   host?.classList.remove('open');
   content?.classList.remove('b434-view-hidden');
   summary();
   setActive('dashboard');
   return true;
 }
 const ok=adaptDesktopModule(id);
 if(ok){
   content?.classList.add('b434-view-hidden');
   host?.classList.add('open');
   host?.setAttribute('data-active-module',id);
   if(id==='deudas'){
     setTimeout(installDebtMobileBehavior,50);
     setTimeout(installDebtMobileBehavior,300);
     setTimeout(installDebtMobileBehavior,900);
     setTimeout(installDebtMobileBehavior,1800);
   }
   if(id==='movimientos'){
     adaptMovementsMobile();
     setTimeout(adaptMovementsMobile,250);
     setTimeout(adaptMovementsMobile,700);
     setTimeout(adaptMovementsMobile,1500);
     setTimeout(adaptMovementsMobile,2500);
   }
   if(id==='calendario'){
     observeCalendarMobile();
     setTimeout(adaptB232261CalendarMobile,50);
     setTimeout(adaptB232261CalendarMobile,150);
     setTimeout(adaptB232261CalendarMobile,350);
     setTimeout(adaptB232261CalendarMobile,800);
     setTimeout(()=>{adaptB232261CalendarMobile();syncCalendarRealIndicators();rebuildCalendarProfessionalDetail()},900);
     setTimeout(()=>{adaptB232261CalendarMobile();syncCalendarRealIndicators();rebuildCalendarProfessionalDetail()},1400);
     setTimeout(()=>{syncCalendarRealIndicators();rebuildCalendarProfessionalDetail()},2000);
   }
   setActive(id);
   return true;
 }
 return false;
}
function navigate(id){
 closeAll();
 if(id==='dashboard'){
   nativeTab('dashboard');
   showModuleAfterNavigation('dashboard');
   return;
 }
 const native=nativeTab(id);
 let attempts=0;
 const mount=()=>{
   attempts++;
   if(showModuleAfterNavigation(id))return;
   if(attempts<10){setTimeout(mount,180);return}
   notice(META[id]?.[0]||id);
 };
 setTimeout(mount,120);
 if(!native && !META[id])notice(id);
}
function syncMobileProfileAvatar(){
 const avatars=root?$$('.b434-avatar',root):[];
 if(!avatars.length)return false;

 const applyPhoto=(url)=>{
   if(!url)return false;
   avatars.forEach(el=>{
     el.innerHTML='';
     const img=document.createElement('img');
     const displayUrl=String(url).includes('?')?String(url)+'&v='+Date.now():String(url)+'?v='+Date.now();
     img.src=displayUrl;
     img.alt='Foto de perfil';
     img.style.width='100%';
     img.style.height='100%';
     img.style.objectFit='cover';
     img.style.objectPosition='center center';
     img.style.borderRadius='50%';
     img.style.display='block';
     img.style.transform='scale(2.0)';
     img.style.transformOrigin='center center';
     el.style.overflow='hidden';
     el.style.padding='0';
     el.appendChild(img);
     el.classList.add('has-photo');
   });
   return true;
 };

 /* 1) Si el módulo Perfil ya está montado, reutilizamos su imagen. */
 const source=document.querySelector('#ccf-profile-avatar img')||document.querySelector('#ccf-profile-mini-avatar img');
 if(source?.src)return applyPhoto(source.src);

 const mini=document.getElementById('ccf-profile-mini-avatar');
 if(mini){
   const miniImg=mini.querySelector('img');
   if(miniImg?.src)return applyPhoto(miniImg.src);
 }

 /*
  * 2) La foto NO vive en Auth metadata: CCF-PERFIL-USUARIO-B1.1
  * guarda la URL definitiva en profiles.avatar_url.
  * Consultamos directamente ese registro con la sesión autenticada.
  * Esto evita depender de que el módulo Perfil se abra primero.
  */
 const client=window.supabaseClient||window.db||window.__db||window.__B23273_CLIENT__||window.__B23270_CLIENT__||window.__B23269_CLIENT__;
 const auth=client?.auth;
 if(auth?.getUser&&client?.from){
   Promise.resolve(auth.getUser()).then(async r=>{
     const user=r?.data?.user;
     if(!user?.id)return;
     try{
       const q=await client.from('profiles').select('avatar_url').eq('id',user.id).maybeSingle();
       const url=q?.data?.avatar_url||'';
       if(url){
         try{localStorage.setItem('ccf_avatar_url_'+user.id,String(url))}catch(_){ }
         applyPhoto(url);
         return;
       }
     }catch(_){ }

     /* Fallback: caché local de una foto ya resuelta previamente. */
     try{
       const cached=localStorage.getItem('ccf_avatar_url_'+user.id)||'';
       if(cached)applyPhoto(cached);
     }catch(_){ }
   }).catch(()=>{});
 }else{
   /* El cliente puede estar terminando de inicializarse. */
   let tries=0;
   const retry=()=>{
     tries++;
     if(!root||!mobile())return;
     const c=window.supabaseClient||window.db||window.__db||window.__B23273_CLIENT__||window.__B23270_CLIENT__||window.__B23269_CLIENT__;
     if(c?.auth?.getUser&&c?.from){
       Promise.resolve(c.auth.getUser()).then(async r=>{
         const user=r?.data?.user;
         if(!user?.id)return;
         try{
           const q=await c.from('profiles').select('avatar_url').eq('id',user.id).maybeSingle();
           const url=q?.data?.avatar_url||'';
           if(url)applyPhoto(url);
         }catch(_){ }
       }).catch(()=>{});
       return;
     }
     if(tries<20)setTimeout(retry,250);
   };
   setTimeout(retry,250);
 }

 /* 3) Iniciales solo como fallback visual mientras llega la URL. */
 if(mini){
   const initialsText=mini.textContent?.trim();
   if(initialsText){
     avatars.forEach(el=>{
       el.textContent=initialsText;
       el.classList.remove('has-photo');
     });
   }
 }
 return false;
}
function hydrateMobileProfileAvatar(){
 if(!root||!mobile())return;
 syncMobileProfileAvatar();
 const api=window.CCFPerfilUsuario;
 if(api?.refresh){
   Promise.resolve(api.refresh())
     .then(()=>syncMobileProfileAvatar())
     .catch(e=>console.warn('[CCF MOBILE] perfil avatar',e));
   return;
 }
 let tries=0;
 const retry=()=>{
   tries++;
   if(!root||!mobile())return;
   if(window.CCFPerfilUsuario?.refresh){
     Promise.resolve(window.CCFPerfilUsuario.refresh())
       .then(()=>syncMobileProfileAvatar())
       .catch(e=>console.warn('[CCF MOBILE] perfil avatar',e));
     return;
   }
   if(tries<12)setTimeout(retry,250);
 };
 setTimeout(retry,250);
}

document.addEventListener('ccf:profile-updated',()=>setTimeout(syncMobileProfileAvatar,0));

function openMore(){populateMore();$('.b434-overlay[data-overlay="more"]',root)?.classList.add('open');document.body.classList.add('b434-lock')}
function openProfile(){$('.b434-overlay[data-overlay="profile"]',root)?.classList.add('open');document.body.classList.add('b434-lock')}

function populateMore(){
 const g=$('[data-more-grid]',root);if(!g)return;g.innerHTML='';
 const tabIds=$$('.tabs button[data-tab]').map(b=>b.dataset.tab).filter(Boolean);
 const ids=[...new Set([...tabIds,...Object.keys(META)])].filter(Boolean);
 ids.forEach(id=>{
   const m=(id==='dashboard'?['Resumen','Panel financiero','⌂']:
            id==='movimientos'?['Movimientos','Ingresos, gastos e historial','↕']:
            id==='deudas'?['Deudas','Obligaciones y vencimientos','▣']:
            id==='cuentas'?['Cuentas','Saldos y liquidez','▤']:
            META[id]||[id,'Módulo financiero','◉']);
   const b=document.createElement('button');
   b.type='button';
   b.className='b434-module';
   b.dataset.module=id;
   b.innerHTML='<b>'+esc(m[2])+'</b><span><strong>'+esc(m[0])+'</strong><small>'+esc(m[1])+'</small></span>';
   b.onclick=()=>navigate(id);
   g.appendChild(b)
 })
}
function openMoveForm(title){
 const form=by('movForm');if(!form){notice('Registro de movimientos');return}
 const overlay=$('.b434-overlay[data-overlay="form"]',root),slot=$('[data-form-slot]',root);if(!overlay||!slot)return;
 if(form.dataset.b434Moved!=='1'){const marker=document.createComment('CCF B4.3.4 movForm');form.parentNode.insertBefore(marker,form);slot.appendChild(form);form.dataset.b434Moved='1';moved.push({el:form,marker})}
 overlay.querySelector('[data-form-title]').textContent=title;overlay.classList.add('open');document.body.classList.add('b434-lock')
}
function quick(type){
 if(type==='debt'){navigate('deudas');return}
 if(type==='plan'){navigate('planificacion');return}
 openMoveForm(type==='income'?'Registrar ingreso':'Registrar gasto');
 const sel=by('movTipo');
 if(sel)sel.value=type==='income'?'ingreso':'gasto';
 const form=by('movForm');
 if(form)form.classList.add('b434-quick-form');
}

function syncConsolidatedReport(){
 if(!root)return;
 const host=$('[data-consolidated]',root),target=host?.querySelector('[data-b234-copy]'),source=by('b234-report');
 if(!host||!target||!source)return;
 const grid=source.querySelector('.b234-grid'),totals=source.querySelector('.b234-summary');
 const cards=[...source.querySelectorAll('.b234-card')];
 const finalCard=cards.find(x=>String(x.querySelector('h3')?.textContent||'').toLowerCase().includes('ingresos vs gastos del mes'));
 if(!grid||!totals||!finalCard)return;

 const fragment=document.createElement('div');
 const copy=el=>{
   const c=el.cloneNode(true);
   c.querySelectorAll('[id]').forEach(n=>n.removeAttribute('id'));
   c.querySelectorAll('[data-b234-observer]').forEach(n=>n.removeAttribute('data-b234-observer'));
   return c;
 };
 const finalCopy=copy(finalCard);
 finalCopy.classList.add('b434-final-info');
 fragment.append(copy(grid),copy(totals),finalCopy);
 target.replaceChildren(fragment);
}

function findMobileFlowSource(){
 const hosts=[...document.querySelectorAll('#b234Chart')];
 let best=null,bestScore=-1;
 hosts.forEach(h=>{
   const svgs=[...h.querySelectorAll('svg')];
   svgs.forEach(svg=>{
     const verticals=[...svg.querySelectorAll('line')].filter(l=>{
       const x1=Number(l.getAttribute('x1')),x2=Number(l.getAttribute('x2'));
       const y1=Number(l.getAttribute('y1')),y2=Number(l.getAttribute('y2'));
       return Number.isFinite(x1)&&Number.isFinite(x2)&&Number.isFinite(y1)&&Number.isFinite(y2)
         &&Math.abs(x1-x2)<0.01&&y2>y1+2;
     });
     const colored=[...svg.querySelectorAll('line,rect,path')].filter(el=>{
       const st=(el.getAttribute('stroke')||'').toLowerCase();
       const fill=(el.getAttribute('fill')||'').toLowerCase();
       return /16a34a|ef4444|22, 163, 74|239, 68, 68/.test(st+' '+fill);
     }).length;
     const score=verticals.length*10+colored;
     if(score>bestScore){bestScore=score;best=svg;}
   });
 });
 return best;
}

function adaptMobileFlowCandles(){
 const host=$('[data-flow]',root);if(!host||!mobile())return false;
 const source=findMobileFlowSource();
 if(!source)return false;

 const NS='http://www.w3.org/2000/svg';
 const vb=(source.getAttribute('viewBox')||'0 0 900 300').trim().split(/\s+/).map(Number);
 const W=Number.isFinite(vb[2])?vb[2]:900;
 const H=Number.isFinite(vb[3])?vb[3]:300;
 const L=52,R=18,T=22,B=42,base=H-B;
 const svg=document.createElementNS(NS,'svg');
 svg.setAttribute('viewBox',`0 0 ${W} ${H}`);
 svg.setAttribute('width','100%');svg.setAttribute('height','100%');
 svg.setAttribute('role','img');svg.setAttribute('data-ccf-flow-chart','1');
 svg.setAttribute('aria-label','Flujo mensual: ingresos verdes y egresos rojos');
 svg.style.cssText='display:block;width:100%;height:100%;';

 /* Conservamos exactamente la escala y la cuadrícula del gráfico fuente. */
 [...source.children].forEach(el=>{
   if(el.tagName.toLowerCase()==='line'){
     const x1=Number(el.getAttribute('x1')),x2=Number(el.getAttribute('x2'));
     const y1=Number(el.getAttribute('y1')),y2=Number(el.getAttribute('y2'));
     const horizontal=Number.isFinite(x1)&&Number.isFinite(x2)&&Number.isFinite(y1)&&Number.isFinite(y2)&&Math.abs(y1-y2)<0.01;
     if(horizontal){
       const c=el.cloneNode(true);c.removeAttribute('id');
       c.setAttribute('stroke','#e5e7eb');c.setAttribute('stroke-width','1');
       svg.appendChild(c);
     }
   } else if(el.tagName.toLowerCase()==='text'){
     const txt=String(el.textContent||'').trim();
     if(!/^\d{2}$/.test(txt)){const c=el.cloneNode(true);c.removeAttribute('id');svg.appendChild(c);}
   }
 });

 /*
    B232.34 representa cada día mediante dos líneas verticales:
    x-4 = ingreso, x+4 = egreso. No dependemos del color original.
    Si un motor externo altera los strokes, la geometría sigue siendo válida.
 */
 const verticals=[...source.querySelectorAll('line')].filter(l=>{
   const x1=Number(l.getAttribute('x1')),x2=Number(l.getAttribute('x2'));
   const y1=Number(l.getAttribute('y1')),y2=Number(l.getAttribute('y2'));
   return Number.isFinite(x1)&&Number.isFinite(x2)&&Number.isFinite(y1)&&Number.isFinite(y2)
     &&Math.abs(x1-x2)<0.01&&y2>y1+2;
 });
 const xs=verticals.map(l=>Number(l.getAttribute('x1'))).sort((a,b)=>a-b);
 const minX=xs.length?xs[0]:L;
 const maxX=xs.length?xs[xs.length-1]:W-R;
 const spacing=Math.max(1,(maxX-minX)/Math.max(1,new Set(xs.map(x=>Math.round(x))).size-1));
 const tolerance=Math.max(1.5,spacing*.35);
 const groups=[];
 verticals.forEach(l=>{
   const x=Number(l.getAttribute('x1'));
   let g=groups.find(q=>Math.abs(q.x-x)<tolerance);
   if(!g){g={x,items:[]};groups.push(g)}
   g.items.push(l);
 });
 groups.sort((a,b)=>a.x-b.x);

 /* El gráfico objetivo usa únicamente los días con movimiento. */
 const candles=[];
 groups.forEach(g=>{
   const center=g.x;
   g.items.forEach(l=>{
     const y=Number(l.getAttribute('y1'));
     const green=Number(l.getAttribute('x1'))<=center;
     candles.push({x:Number(l.getAttribute('x1')),y,green});
   });
 });

 /* B232.34 ya entrega x-4/x+4; usamos esa separación para no perder días. */
 const seen=new Set();
 candles.forEach(c=>{
   const key=`${Math.round(c.x*10)/10}-${c.green?'in':'out'}`;
   if(seen.has(key))return;seen.add(key);
   const x=c.x;
   const y=Math.max(T,c.y);
   const h=Math.max(2,base-y);

   const wick=document.createElementNS(NS,'line');
   wick.setAttribute('x1',x);wick.setAttribute('x2',x);
   wick.setAttribute('y1',Math.max(T,y-8));wick.setAttribute('y2',base);
   wick.setAttribute('stroke',c.green?'#16a34a':'#ef4444');
   wick.setAttribute('stroke-width','2.5');wick.setAttribute('stroke-linecap','round');
   svg.appendChild(wick);

   const body=document.createElementNS(NS,'rect');
   body.setAttribute('x',x-5);body.setAttribute('y',Math.max(T,y));
   body.setAttribute('width','10');body.setAttribute('height',Math.max(10,Math.min(18,h*.12)));
   body.setAttribute('rx','2');body.setAttribute('fill',c.green?'#16a34a':'#ef4444');
   body.setAttribute('stroke',c.green?'#15803d':'#dc2626');body.setAttribute('stroke-width','1.5');
   svg.appendChild(body);
 });

 /* Etiquetas de día tomadas del gráfico fuente, preservando su distribución. */
 const labels=[...source.querySelectorAll('text')].filter(t=>/^\d{2}$/.test(String(t.textContent||'').trim()));
 if(labels.length){
   labels.forEach(t=>{const c=t.cloneNode(true);c.removeAttribute('id');c.setAttribute('fill','#64748b');c.setAttribute('font-size','10');svg.appendChild(c)});
 }else{
   const axis=document.createElementNS(NS,'g');
   const unique=[...new Set(candles.map(c=>Math.round((c.x-L)/(W-L-R)*29)+1))].sort((a,b)=>a-b);
   unique.forEach(d=>{
     const x=L+(d-1)*(W-L-R)/29;
     const t=document.createElementNS(NS,'text');t.setAttribute('x',x);t.setAttribute('y',H-15);t.setAttribute('fill','#64748b');t.setAttribute('font-size','10');t.setAttribute('text-anchor','middle');t.textContent=String(d).padStart(2,'0');axis.appendChild(t);
   });
   svg.appendChild(axis);
 }
 const title=document.createElementNS(NS,'text');title.setAttribute('x',L);title.setAttribute('y','17');title.setAttribute('fill','#1f2937');title.setAttribute('font-size','10');title.setAttribute('font-weight','700');title.textContent='Ingresos vs egresos';svg.appendChild(title);

 flowRenderLock=true;
 try{host.replaceChildren(svg)}finally{flowRenderLock=false}
 return true;
}

function installMobileFlowObservers(){
 if(!root||!mobile())return;
 flowSourceObserver?.disconnect();
 flowHostObserver?.disconnect();
 flowSourceObserver=null;
 flowHostObserver=null;

 const attachSourceObserver=()=>{
   if(!root||!mobile())return;
   const dashboard=by('dashboard');
   if(!dashboard)return;
   flowSourceObserver?.disconnect();
   flowSourceObserver=new MutationObserver(mutations=>{
     if(mutations.some(m=>m.type==='childList')){
       [0,80,220,500].forEach(ms=>setTimeout(()=>{
         if(!flowRenderLock)adaptMobileFlowCandles();
       },ms));
     }
   });
   flowSourceObserver.observe(dashboard,{childList:true,subtree:true});
 };
 attachSourceObserver();

 const host=$('[data-flow]',root);
 if(host){
   flowHostObserver=new MutationObserver(()=>{
     if(flowRenderLock)return;
     const chart=host.querySelector('svg[data-ccf-flow-chart="1"]');
     if(!chart)setTimeout(()=>adaptMobileFlowCandles(),0);
   });
   flowHostObserver.observe(host,{childList:true,subtree:false});
 }
 setTimeout(()=>adaptMobileFlowCandles(),0);
}

function refreshNativeSummaryData(){
 if(!mobile()||typeof window.B23234Resumen?.refresh!=='function')return;
 try{window.B23234Resumen.refresh();}catch(e){console.warn('[CCF MOBILE] B232.34 refresh',e);}
}
function scheduleMobileFlowAdapt(){
 if(!mobile())return;
 [350,700,1200,1800,2600,3800,5200].forEach(ms=>setTimeout(()=>{
   refreshNativeSummaryData();
   adaptMobileFlowCandles();
 },ms));
}
function scheduleReportSync(){
 clearTimeout(reportTimer);let tries=0;
 const attempt=()=>{
   refreshNativeSummaryData();
   syncConsolidatedReport();
   adaptMobileFlowCandles();
   tries++;
   if(tries<20)reportTimer=setTimeout(attempt,300);
 };
 reportTimer=setTimeout(attempt,180);
}

/* CCF MOBILE B4.3.11 — REHIDRATACIÓN DEL RESUMEN
   El Resumen móvil no reemplaza los gráficos originales.
   Espera a que B232.35 termine de cargar FinancialSummary +
   ExecutiveDashboard y vuelve a renderizar los componentes reales
   dentro de la shell móvil.
*/
let summaryHydrationTimer=null;
function hydrateRealSummary(){
 if(!mobile()||!ready()||!root)return;
 try{
   if(window.FinancialSummary?.init){
     Promise.resolve(window.FinancialSummary.init())
       .then(()=>{
         mirrorAll();
         mountExecutiveRealCharts();
       })
       .catch(e=>console.warn('[CCF MOBILE] FinancialSummary hydration',e));
   }
 }catch(e){console.warn('[CCF MOBILE] FinancialSummary hydration',e);}
 try{
   if(window.B23235ResumenEjecutivo?.refresh){
     Promise.resolve(window.B23235ResumenEjecutivo.refresh())
       .then(()=>{mirrorAll();mountExecutiveRealCharts();})
       .catch(e=>console.warn('[CCF MOBILE] B23235 hydration',e));
   }
 }catch(e){}
}

function mountExecutiveRealCharts(){
 if(!root||!mobile())return;
 const execHost=$('[data-exec]',root);
 if(!execHost)return;
 const ids=['chart-liquidity','chart-obligations','chart-candles','chart-risk','chart-gap','chart-debt-month','chart-debt-planning'];

 ids.forEach(id=>{
   const el=by(id);
   if(!el)return;
   /* Si el elemento ya está dentro de la shell móvil, no se mueve ni se duplica. */
   if(root.contains(el))return;
   const card=document.createElement('article');
   card.className='b434-chart-card';
   const sourceTitle=el.closest('.executive-chart')?.querySelector('h3')?.textContent;
   card.innerHTML='<strong>'+esc(sourceTitle||id)+'</strong>';
   execHost.appendChild(card);
   moveReal(id,card);
 });

 /* La proyección y decisiones también son contenido real, no placeholders. */
 const targets=[
   ['projection-table','projection'],
   ['next-need','next'],
   ['priority-actions','priority']
 ];
 targets.forEach(([id,slot])=>{
   const el=by(id);
   const hostSlot=$('[data-'+slot+']',root);
   if(!el||!hostSlot||root.contains(el))return;
   moveReal(id,hostSlot);
 });
}

function scheduleSummaryHydration(){
 clearTimeout(summaryHydrationTimer);
 const delays=[0,250,600,1000,1600,2400,3500,5000];
 delays.forEach(ms=>{
   summaryHydrationTimer=setTimeout(()=>{
     hydrateRealSummary();
     refreshNativeSummaryData();
     adaptMobileFlowCandles();
     syncConsolidatedReport();
   },ms);
 });
}
function summary(){
 const c=$('[data-content]',root);c.innerHTML=`
 <section class="b434-period"><div><span>PERÍODO</span><strong class="b434-mirror" data-source="future-month-label">—</strong></div><button type="button" data-period>⌄</button></section>
 <section class="b434-kpis">
  <article class="b434-kpi blue"><span>Liquidez actual</span><strong class="b434-mirror" data-source="kpi-real-balance">—</strong></article>
  <article class="b434-kpi green"><span>Ingresos del mes</span><strong class="b434-mirror" data-source="month-income-total">—</strong></article>
  <article class="b434-kpi red"><span>Gastos del mes</span><strong class="b434-mirror" data-source="month-expense-total">—</strong></article>
  <article class="b434-kpi navy"><span>Saldo proyectado</span><strong class="b434-mirror" data-source="kpi-projected-balance">—</strong></article>
 </section>
 <section class="b434-card"><header><div><strong>Flujo del mes</strong><small>Ingresos · Gastos · Saldo</small></div><div class="b434-flow-legend"><span><i class="income"></i>Ingresos</span><span><i class="expense"></i>Egresos</span></div></header><div class="b434-real-chart" data-flow></div></section>
 <section class="b434-card b434-expense-summary" data-consolidated>
  <header><div><strong>Resumen de gastos</strong><small>Distribución por categoría y estado</small></div></header>
  <div class="b434-consolidated-body" data-b234-copy></div>
 </section>
 <div class="b434-section-title">Accesos rápidos</div>
 <section class="b434-quick"><button data-quick="expense">＋<small>Registrar gasto</small></button><button data-quick="income">＋<small>Registrar ingreso</small></button><button data-quick="debt">◉<small>Ver deudas</small></button><button data-quick="plan">◇<small>Planificar</small></button></section>
 <section class="b434-card"><header><strong>Estado financiero</strong><small class="b434-mirror" data-source="summary-status-text">—</small></header><div class="b434-grid2">
  <article><span>Ingresos asegurados</span><strong class="b434-mirror" data-source="kpi-assured">—</strong></article><article><span>Ingresos proyectados</span><strong class="b434-mirror" data-source="kpi-projected">—</strong></article>
  <article><span>Egresos comprometidos</span><strong class="b434-mirror" data-source="kpi-committed">—</strong></article><article><span>Brecha financiera</span><strong class="b434-mirror" data-source="kpi-gap">—</strong></article>
 </div></section>
 <section class="b434-card"><header><strong>Compromisos próximos</strong><small>Movimientos futuros</small></header><div class="b434-future">
  <article><header><b>Ingresos</b></header><div data-income-list></div></article><article><header><b>Egresos</b></header><div data-expense-list></div></article>
 </div></section>
 <section class="b434-card"><header><strong>Control diario</strong><small class="b434-mirror" data-source="margin-status">—</small></header><div class="b434-margin">
  <article><span>Margen máximo</span><strong class="b434-mirror" data-source="margin-maximum">—</strong></article><article><span>Gastado</span><strong class="b434-mirror" data-source="margin-spent">—</strong></article><article><span>Margen restante</span><strong class="b434-mirror" data-source="margin-remaining">—</strong></article>
 </div><div class="b434-progress"><i data-progress></i></div></section>
 <section class="b434-card"><header><strong>Proyección financiera</strong><small>90 días</small></header><div class="b434-real-table" data-projection></div></section>
 <section class="b434-decision"><article><span>PRÓXIMA NECESIDAD</span><div data-next></div></article><article><span>ACCIONES PRIORITARIAS</span><div data-priority></div></article></section>
 <section class="b434-card"><header><strong>Análisis ejecutivo</strong><small class="b434-mirror" data-source="executive-risk-summary">—</small></header><div class="b434-insights">
 ${[['Liquidez','exec-liquidity-reading'],['Obligaciones','exec-obligation-reading'],['Flujo próximo','exec-flow-reading'],['Generación requerida','exec-generation-reading']].map(x=>`<article><span>${x[0]}</span><strong class="b434-mirror" data-source="${x[1]}">—</strong></article>`).join('')}</div><div class="b434-charts" data-exec></div></section>`;
 const flowHost=$('[data-flow]',c);if(flowHost){flowHost.replaceChildren();installMobileFlowObservers();refreshNativeSummaryData();scheduleMobileFlowAdapt();setTimeout(()=>adaptMobileFlowCandles(),100);setTimeout(()=>adaptMobileFlowCandles(),350);setTimeout(()=>adaptMobileFlowCandles(),800);}
 ['future-income-list','future-expense-list','projection-table','next-need','priority-actions'].forEach(id=>moveReal(id,$(`[data-${id==='projection-table'?'projection':id==='future-income-list'?'income-list':id==='future-expense-list'?'expense-list':id==='next-need'?'next':'priority'}]`,c)));
 const execHost=$('[data-exec]',c),ids=['chart-liquidity','chart-obligations','chart-candles','chart-risk','chart-gap','chart-debt-month','chart-debt-planning'];
 ids.forEach(id=>{const el=by(id);if(!el||!execHost)return;const card=document.createElement('article');card.className='b434-chart-card';card.innerHTML='<strong>'+esc(el.closest('.executive-chart')?.querySelector('h3')?.textContent||id)+'</strong>';execHost.appendChild(card);moveReal(id,card)});
 $$('[data-quick]',c).forEach(b=>b.onclick=()=>quick(b.dataset.quick));$('[data-period]',c).onclick=()=>notice('Selector de período');
 mirrorAll();scheduleReportSync();scheduleSummaryHydration();
}

function installUserManualMobileStyle(){
 const id='ccf-mobile-user-manual-style';
 if(document.getElementById(id))return;
 const style=document.createElement('style');
 style.id=id;
 style.textContent=`
   #ccf-mobile-b43 .b434-manual{
     display:inline-flex;
     align-items:center;
     justify-content:center;
     gap:7px;
     min-width:108px;
     height:40px;
     padding:0 12px;
     border:1px solid rgba(255,255,255,.28);
     border-radius:12px;
     background:rgba(255,255,255,.12);
     color:#fff;
     text-decoration:none;
     font-size:11px;
     line-height:1;
     font-weight:850;
     letter-spacing:.1px;
     white-space:nowrap;
     box-sizing:border-box;
     cursor:pointer;
     box-shadow:0 2px 8px rgba(0,0,0,.10);
     transition:background .18s ease,transform .18s ease,border-color .18s ease;
   }
   #ccf-mobile-b43 .b434-manual span{
     display:grid;
     place-items:center;
     width:20px;
     height:20px;
     flex:0 0 20px;
   }
   #ccf-mobile-b43 .b434-manual svg{
     width:19px;
     height:19px;
     display:block;
     fill:none;
     stroke:currentColor;
     stroke-width:2.25;
     stroke-linecap:round;
     stroke-linejoin:round;
   }
   #ccf-mobile-b43 .b434-manual small{
     font-size:11px;
     line-height:1;
     font-weight:850;
   }
   #ccf-mobile-b43 .b434-manual:hover{
     background:rgba(255,255,255,.18);
     border-color:rgba(255,255,255,.42);
   }
   #ccf-mobile-b43 .b434-manual:active{
     transform:scale(.97);
   }
   @media(max-width:430px){
     #ccf-mobile-b43 .b434-manual{
       min-width:94px;
       height:38px;
       padding:0 9px;
       gap:6px;
     }
     #ccf-mobile-b43 .b434-manual small{
       font-size:10px;
     }
   }
   @media(max-width:380px){
     #ccf-mobile-b43 .b434-manual{
       min-width:78px;
       width:78px;
       padding:0 7px;
       gap:5px;
     }
     #ccf-mobile-b43 .b434-manual small{
       font-size:9px;
     }
     #ccf-mobile-b43 .b434-manual svg{
       width:17px;
       height:17px;
     }
   }
 `;
 document.head.appendChild(style);
}
function build(){
 if(built||!ready())return;built=true;root=document.createElement('div');root.id='ccf-mobile-b43';
 installUserManualMobileStyle();
 root.innerHTML=`<header class="b434-header"><button class="b434-logo" data-home>CCF</button><div><strong>Centro de Control Financiero</strong><small>Tu vida financiera en un solo lugar</small></div><a class="b434-manual" href="Manual_Usabilidad_CCF_Somos_Software.pdf" download="Manual_Usabilidad_CCF_Somos_Software.pdf" aria-label="Descargar manual de usuario" title="Descargar manual de usuario"><span aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 3v11"></path><path d="m7 10 5 5 5-5"></path><path d="M5 21h14"></path></svg></span><small>Descargar manual</small></a><button class="b434-bell" aria-label="Notificaciones">♧</button><button class="b434-avatar" data-profile aria-label="Perfil">P</button><button class="b434-mobile-logout" data-mobile-logout type="button" aria-label="Salir">Salir</button></header><main data-content></main><section class="b434-module-host" data-module-host aria-live="polite"></section><nav class="b434-bottom">${PRIMARY.map(x=>`<button data-nav="${x[0]}"><span>${x[2]}</span><small>${x[1]}</small></button>`).join('')}<button data-more><span>☰</span><small>Más</small></button></nav>
 <div class="b434-overlay" data-overlay="more"><div class="b434-backdrop" data-close></div><section><header><strong>Todos los módulos</strong><button data-close>×</button></header><div class="b434-module-grid" data-more-grid></div></section></div>
 <div class="b434-overlay" data-overlay="profile"><div class="b434-backdrop" data-close></div><section><header><strong>Perfil</strong><button data-close>×</button></header><div class="b434-profile">Cuenta autenticada en Centro de Control Financiero.</div><button class="b434-danger" data-logout>Cerrar sesión</button></section></div>
 <div class="b434-overlay" data-overlay="form"><div class="b434-backdrop" data-close></div><section><header><strong data-form-title>Registrar movimiento</strong><button data-close>×</button></header><div data-form-slot></div></section></div>
 <div class="b434-overlay" data-overlay="notice"><div class="b434-backdrop" data-close></div><section class="b434-notice"><strong>Integración por etapas</strong><p>El módulo <b data-notice>—</b> conserva su implementación original y se habilita progresivamente.</p><button data-close>Continuar</button></section></div>`;
 app().prepend(root);
 $$('[data-nav]',root).forEach(b=>b.onclick=()=>navigate(b.dataset.nav));$('[data-more]',root).onclick=openMore;$('[data-profile]',root).onclick=openProfile;$('[data-home]',root).onclick=()=>navigate('dashboard');$$('[data-close]',root).forEach(b=>b.onclick=closeAll);$('[data-logout]',root).onclick=()=>by('logoutBtn')?.click();$('[data-mobile-logout]',root).onclick=()=>by('logoutBtn')?.click();
 populateMore();nativeTab('dashboard');summary();refreshNativeSummaryData();scheduleMobileFlowAdapt();setActive('dashboard');hydrateMobileProfileAvatar();
}
function observe(){
 observer?.disconnect();const ids=['future-month-label','month-income-total','month-expense-total','kpi-real-balance','kpi-assured','kpi-projected','kpi-committed','kpi-projected-balance','kpi-gap','margin-status','margin-maximum','margin-spent','margin-remaining','margin-percent','margin-projection','summary-status-text','executive-risk-summary','exec-liquidity-reading','exec-obligation-reading','exec-flow-reading','exec-generation-reading'];
 observer=new MutationObserver(()=>{mirrorAll();syncConsolidatedReport()});ids.map(by).filter(Boolean).forEach(n=>observer.observe(n,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['style','class']}));
}
function restore(){clearTimeout(reportTimer);flowSourceObserver?.disconnect();flowHostObserver?.disconnect();flowSourceObserver=null;flowHostObserver=null;observer?.disconnect();observer=null;calendarObserver?.disconnect();calendarObserver=null;calendarAdaptScheduled=false;cleanupDebtMobileBehavior();closeAll();restoreActiveModule();restoreReal();root?.remove();root=null;built=false;document.body.classList.remove('b434-lock')}
function boot(){if(!mobile()){restore();return}if(!ready()){if(built)restore();return}if(!built){build();observe()}}
/* CCF MOBILE B4.3.10 · POST-AUTH BOOT FIX
   El flujo de autenticación revela #app y emite ccf:app-ready.
   El shell móvil se monta inmediatamente en ese momento, sin depender
   de un resize/orientationchange posterior. */
window.addEventListener('ccf:app-ready',()=>setTimeout(boot,0));
window.addEventListener('resize',()=>setTimeout(boot,100));window.addEventListener('orientationchange',()=>setTimeout(boot,150));
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
window.CCFMobileB43={version:'4.3.4-stage1-correction',refresh:()=>{mirrorAll();syncConsolidatedReport()},disable:restore};


})();
