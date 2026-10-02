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
let root=null,built=false,moved=[],observer=null,reportTimer=null,activeModule=null,moduleMarker=null;

function ready(){return mobile()&&app()&&!app().classList.contains('hidden')}
function mirror(id){const src=by(id);if(!src||!root)return;$$('.b434-mirror[data-source="'+id+'"]',root).forEach(n=>n.textContent=src.textContent?.trim()||'—')}
function mirrorAll(){[
'future-month-label','month-income-total','month-expense-total','kpi-real-balance','kpi-assured','kpi-projected','kpi-committed','kpi-projected-balance','kpi-gap',
'margin-status','margin-maximum','margin-spent','margin-remaining','margin-percent','margin-projection','summary-status-text','executive-risk-summary',
'exec-liquidity-reading','exec-obligation-reading','exec-flow-reading','exec-generation-reading'
].forEach(mirror);
const p=by('margin-progress'),q=$('[data-progress]',root);if(p&&q)q.style.width=p.style.width||'0%';}

function moveReal(id,host){
 const el=by(id);if(!el||!host||el.dataset.b434Moved==='1')return el;
 const marker=document.createComment('CCF B4.3.4 '+id);el.parentNode?.insertBefore(marker,el);host.appendChild(el);
 el.dataset.b434Moved='1';moved.push({el,marker});return el;
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
        color:#1976d2!important;
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
        border-top:3px solid #22a66f!important;
      }
      #ccf-mobile-b43 #calendario .b232261-kpi:nth-child(1)::before{
        content:'↑'!important;
        background:#20ad72!important;
      }

      #ccf-mobile-b43 #calendario .b232261-kpi:nth-child(2){
        border-top:3px solid #ef4444!important;
      }
      #ccf-mobile-b43 #calendario .b232261-kpi:nth-child(2)::before{
        content:'↓'!important;
        background:#ef3f49!important;
      }

      #ccf-mobile-b43 #calendario .b232261-kpi:nth-child(3){
        border-top:3px solid #5146d8!important;
      }
      #ccf-mobile-b43 #calendario .b232261-kpi:nth-child(3)::before{
        content:'▣'!important;
        background:#5146d8!important;
      }

      #ccf-mobile-b43 #calendario .b232261-kpi:nth-child(4){
        border-top:3px solid #1987e5!important;
      }
      #ccf-mobile-b43 #calendario .b232261-kpi:nth-child(4)::before{
        content:'▤'!important;
        background:#1987e5!important;
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
        outline:2px solid #1987e5!important;
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
        color:#1976d2!important;
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
        color:#17834f!important;
      }
      #ccf-mobile-b43 #calendario .b232261-real-out{
        background:#fff0f1!important;
        color:#c62828!important;
      }
      #ccf-mobile-b43 #calendario .b232261-plan-in{
        background:#eef7ff!important;
        color:#1976d2!important;
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
        border-top:4px solid #20a66a!important;
      }

      #ccf-mobile-b43 #calendario .b232261-negative-box{
        border-top:4px solid #e53935!important;
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
      #ccf-mobile-b43 #calendario .ccf-cpd-kpi.green>span{background:#20a66a!important}
      #ccf-mobile-b43 #calendario .ccf-cpd-kpi.red>span{background:#e53935!important}
      #ccf-mobile-b43 #calendario .ccf-cpd-kpi.violet>span{background:#5146d8!important}
      #ccf-mobile-b43 #calendario .ccf-cpd-kpi.flow>span{background:#ef4444!important}
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
      #ccf-mobile-b43 #calendario .ccf-cpd-icon.blue{background:#1987e5!important}
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
      #ccf-mobile-b43 #calendario .ccf-cpd-panel.positive{border-top:4px solid #20a66a!important}
      #ccf-mobile-b43 #calendario .ccf-cpd-panel.negative{border-top:4px solid #e53935!important}
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
      #ccf-mobile-b43 #calendario .ccf-cpd-panel.positive .ccf-cpd-panel-head>strong{color:#16834f!important}
      #ccf-mobile-b43 #calendario .ccf-cpd-panel.negative .ccf-cpd-panel-head>strong{color:#c62828!important}
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
      #ccf-mobile-b43 #calendario .ccf-cpd-round.green{background:#20a66a!important}
      #ccf-mobile-b43 #calendario .ccf-cpd-round.red{background:#e53935!important}
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
let debtMobileDetailObserver=null;
let debtMobileListObserver=null;
let debtMobileFixInstalled=false;

function styleDebtMobileActions(){
  if(!mobile()) return;
  let style=by('ccf-debt-mobile-actions-fix');
  if(style) return;

  style=document.createElement('style');
  style.id='ccf-debt-mobile-actions-fix';
  style.textContent=`
    @media(max-width:720px){
      /* La shell móvil usa z-index 2147480000. Los motores de deuda
         crean sus overlays directamente en body con z-index menor.
         Elevarlos evita que queden detrás de las tarjetas. */
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

      /* El detalle forma parte de la secuencia de la deuda seleccionada. */
      #ccf-mobile-b43 .b434-module-host #deudas #deudaDetalle{
        width:100%!important;
        max-width:100%!important;
        box-sizing:border-box!important;
        margin:10px 0 12px!important;
        clear:both!important;
        position:relative!important;
        z-index:1!important;
      }

      #ccf-mobile-b43 .b434-module-host #deudas .debt-card + #deudaDetalle{
        scroll-margin-top:76px!important;
      }

      #ccf-mobile-b43 .b434-module-host #deudas .debt-card{
        position:relative!important;
        z-index:1!important;
      }

      /* Acciones de cada deuda permanecen siempre utilizables. */
      #ccf-mobile-b43 .b434-module-host #deudas .form-actions{
        position:relative!important;
        z-index:3!important;
      }
    }
  `;
  document.head.appendChild(style);
}

function moveDebtDetailAfterSelected(){
  if(!mobile()) return false;
  const detail=by('deudaDetalle');
  const anchor=debtMobileDetailAnchor;

  if(!detail||!anchor||!anchor.isConnected||!anchor.parentNode) return false;

  if(anchor.nextElementSibling!==detail){
    anchor.parentNode.insertBefore(detail,anchor.nextSibling);
  }

  detail.dataset.ccfDebtDetailContext='selected';
  detail.style.display='block';
  return true;
}

function focusDebtDetailAfterSelected(){
  if(!moveDebtDetailAfterSelected()) return false;
  const detail=by('deudaDetalle');
  if(detail){
    requestAnimationFrame(()=>{
      if(detail.isConnected){
        detail.scrollIntoView({behavior:'smooth',block:'start'});
      }
    });
  }
  return true;
}

function armDebtDetailContext(card){
  if(!mobile()||!card) return;
  debtMobileDetailAnchor=card;

  const detail=by('deudaDetalle');
  if(detail&&!debtMobileDetailObserver){
    debtMobileDetailObserver=new MutationObserver(()=>{
      if(!mobile()||!debtMobileDetailAnchor)return;
      setTimeout(()=>moveDebtDetailAfterSelected(),0);
    });
    debtMobileDetailObserver.observe(detail,{childList:true,subtree:true});
  }

  [0,80,220,500,900,1400].forEach(ms=>{
    setTimeout(()=>{
      if(mobile()&&debtMobileDetailAnchor===card) focusDebtDetailAfterSelected();
    },ms);
  });
}

function installDebtMobileBehavior(){
  if(!mobile()) return;
  styleDebtMobileActions();

  const section=by('deudas');
  if(!section) return;

  if(debtMobileFixInstalled&&section.dataset.ccfDebtMobileActions==='1') return;
  debtMobileFixInstalled=true;
  section.dataset.ccfDebtMobileActions='1';

  /*
   * Capture para identificar la tarjeta antes de que el onclick nativo
   * ejecute verDeuda23(). No reemplazamos la función original.
   */
  section.addEventListener('click',event=>{
    const button=event.target?.closest?.('button');
    if(!button) return;

    const card=button.closest('.debt-card');
    if(!card) return;

    const onclick=button.getAttribute('onclick')||'';
    const text=String(button.textContent||'').trim().toLowerCase();

    if(
      text==='ver detalle' ||
      onclick.includes('verDeuda23(') ||
      onclick.includes('verDeuda(')
    ){
      armDebtDetailContext(card);
    }
  },true);

  /*
   * Los motores B220/B231 pueden insertar o reconstruir acciones
   * después de cargar la lista. No intervenimos en sus handlers.
   * Solo aseguramos que el detalle conserve la posición contextual.
   */
  debtMobileListObserver=new MutationObserver(()=>{
    if(debtMobileDetailAnchor?.isConnected){
      setTimeout(()=>moveDebtDetailAfterSelected(),20);
    }
    styleDebtMobileActions();
  });
  debtMobileListObserver.observe(section,{childList:true,subtree:true});
}

function cleanupDebtMobileBehavior(){
  debtMobileDetailObserver?.disconnect();
  debtMobileDetailObserver=null;
  debtMobileListObserver?.disconnect();
  debtMobileListObserver=null;
  debtMobileListObserver?.disconnect();
  debtMobileListObserver=null;
  debtMobileDetailAnchor=null;
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

function adaptMobileFlowCandles(){
 const host=by('chart-flow');if(!host)return false;
 /* B232.34 debe ser la única fuente del gráfico. Nunca reconstruir
    desde un SVG anterior/incompleto de #chart-flow. */
 const report=by('b234-report');
 const source=by('b234Chart')?.querySelector('svg');
 if(!report||!source)return false;
 const lines=[...source.querySelectorAll('line')].filter(l=>{
   const stroke=(l.getAttribute('stroke')||'').toLowerCase();
   return stroke==='#16a34a'||stroke==='#ef4444'||stroke==='rgb(22, 163, 74)'||stroke==='rgb(239, 68, 68)';
 });
 if(!lines.length)return false;
 const W=900,H=300,L=52,R=18,T=22,B=42,base=H-B,days=30,step=(W-L-R)/(days-1);
 const NS='http://www.w3.org/2000/svg';
 const svg=document.createElementNS(NS,'svg');
 svg.setAttribute('viewBox',`0 0 ${W} ${H}`);
 svg.setAttribute('width','100%');
 svg.setAttribute('height','100%');
 svg.setAttribute('role','img');
 svg.setAttribute('aria-label','Flujo mensual: velas verdes de ingresos y velas rojas de egresos');
 const grid=[...source.querySelectorAll('line')].filter(l=>{
   const stroke=(l.getAttribute('stroke')||'').toLowerCase();
   return stroke==='#e5e7eb';
 });
 grid.forEach(l=>svg.appendChild(l.cloneNode(true)));
 [...source.querySelectorAll('text')].forEach(t=>{
   const clone=t.cloneNode(true);
   const txt=String(t.textContent||'').trim();
   if(/^\d{2}$/.test(txt))return;
   svg.appendChild(clone);
 });
 const axis=document.createElementNS(NS,'g');
 axis.setAttribute('class','mobile-month-axis');
 for(let d=1;d<=days;d++){
   if(d===1||d%3===0||d===days){
     const x=L+(d-1)*step;
     const t=document.createElementNS(NS,'text');
     t.setAttribute('x',x);
     t.setAttribute('y',H-12);
     t.setAttribute('text-anchor',d===1?'start':d===days?'end':'middle');
     t.setAttribute('class','chart-axis');
     t.textContent=String(d).padStart(2,'0');
     axis.appendChild(t);
   }
 }
 svg.appendChild(axis);
 const candleData=[];
 lines.forEach(l=>{
   const stroke=(l.getAttribute('stroke')||'').toLowerCase();
   const green=stroke==='#16a34a'||stroke==='rgb(22, 163, 74)';
   const x=Number(l.getAttribute('x1'));
   const y=Number(l.getAttribute('y1'));
   if(!Number.isFinite(x)||!Number.isFinite(y))return;
   const baseX=x+(green?4:-4);
   const day=Math.round((baseX-L)/step)+1;
   if(day<1||day>days)return;
   const amountHeight=Math.max(2,base-y);
   candleData.push({day,green,y,height:amountHeight});
 });
 candleData.forEach(c=>{
   const x=L+(c.day-1)*step+(c.green?-5:5);
   const bodyH=Math.max(9,Math.min(18,c.height*0.12));
   const bodyY=Math.max(T,c.y);
   const wick=document.createElementNS(NS,'line');
   wick.setAttribute('x1',x);wick.setAttribute('x2',x);
   wick.setAttribute('y1',Math.max(T,bodyY-7));wick.setAttribute('y2',base);
   wick.setAttribute('class',c.green?'mobile-flow-income-wick':'mobile-flow-expense-wick');
   svg.appendChild(wick);
   const body=document.createElementNS(NS,'rect');
   body.setAttribute('x',x-5);body.setAttribute('y',bodyY);
   body.setAttribute('width','10');body.setAttribute('height',bodyH);
   body.setAttribute('rx','2');
   body.setAttribute('class',c.green?'mobile-flow-income':'mobile-flow-expense');
   svg.appendChild(body);
 });
 const title=document.createElementNS(NS,'text');
 title.setAttribute('x',L);title.setAttribute('y','17');
 title.setAttribute('class','chart-title');title.textContent='Ingresos vs egresos';
 svg.appendChild(title);
 host.replaceChildren(svg);
 return true;
}
function refreshNativeSummaryData(){
 if(!mobile()||typeof window.B23234Resumen?.refresh!=='function')return;
 try{window.B23234Resumen.refresh();}catch(e){console.warn('[CCF MOBILE] B232.34 refresh',e);}
}
function scheduleMobileFlowAdapt(){
 if(!mobile())return;
 [450,1000,1800,3000].forEach(ms=>setTimeout(()=>{
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
 const flow=by('chart-flow');if(flow){moveReal('chart-flow',$('[data-flow]',c));setTimeout(()=>window.dispatchEvent(new Event('resize')),180);setTimeout(()=>window.dispatchEvent(new Event('resize')),650);refreshNativeSummaryData();scheduleMobileFlowAdapt();}
 ['future-income-list','future-expense-list','projection-table','next-need','priority-actions'].forEach(id=>moveReal(id,$(`[data-${id==='projection-table'?'projection':id==='future-income-list'?'income-list':id==='future-expense-list'?'expense-list':id==='next-need'?'next':'priority'}]`,c)));
 const execHost=$('[data-exec]',c),ids=['chart-liquidity','chart-obligations','chart-candles','chart-risk','chart-gap','chart-debt-month','chart-debt-planning'];
 ids.forEach(id=>{const el=by(id);if(!el||!execHost)return;const card=document.createElement('article');card.className='b434-chart-card';card.innerHTML='<strong>'+esc(el.closest('.executive-chart')?.querySelector('h3')?.textContent||id)+'</strong>';execHost.appendChild(card);moveReal(id,card)});
 $$('[data-quick]',c).forEach(b=>b.onclick=()=>quick(b.dataset.quick));$('[data-period]',c).onclick=()=>notice('Selector de período');
 mirrorAll();scheduleReportSync();
}

function build(){
 if(built||!ready())return;built=true;root=document.createElement('div');root.id='ccf-mobile-b43';
 root.innerHTML=`<header class="b434-header"><button class="b434-logo" data-home>CCF</button><div><strong>Centro de Control Financiero</strong><small>Tu vida financiera en un solo lugar</small></div><button class="b434-bell" aria-label="Notificaciones">♧</button><button class="b434-avatar" data-profile aria-label="Perfil">P</button><button class="b434-mobile-logout" data-mobile-logout type="button" aria-label="Salir">Salir</button></header><main data-content></main><section class="b434-module-host" data-module-host aria-live="polite"></section><nav class="b434-bottom">${PRIMARY.map(x=>`<button data-nav="${x[0]}"><span>${x[2]}</span><small>${x[1]}</small></button>`).join('')}<button data-more><span>☰</span><small>Más</small></button></nav>
 <div class="b434-overlay" data-overlay="more"><div class="b434-backdrop" data-close></div><section><header><strong>Todos los módulos</strong><button data-close>×</button></header><div class="b434-module-grid" data-more-grid></div></section></div>
 <div class="b434-overlay" data-overlay="profile"><div class="b434-backdrop" data-close></div><section><header><strong>Perfil</strong><button data-close>×</button></header><div class="b434-profile">Cuenta autenticada en Centro de Control Financiero.</div><button class="b434-danger" data-logout>Cerrar sesión</button></section></div>
 <div class="b434-overlay" data-overlay="form"><div class="b434-backdrop" data-close></div><section><header><strong data-form-title>Registrar movimiento</strong><button data-close>×</button></header><div data-form-slot></div></section></div>
 <div class="b434-overlay" data-overlay="notice"><div class="b434-backdrop" data-close></div><section class="b434-notice"><strong>Integración por etapas</strong><p>El módulo <b data-notice>—</b> conserva su implementación original y se habilita progresivamente.</p><button data-close>Continuar</button></section></div>`;
 app().prepend(root);
 $$('[data-nav]',root).forEach(b=>b.onclick=()=>navigate(b.dataset.nav));$('[data-more]',root).onclick=openMore;$('[data-profile]',root).onclick=openProfile;$('[data-home]',root).onclick=()=>navigate('dashboard');$$('[data-close]',root).forEach(b=>b.onclick=closeAll);$('[data-logout]',root).onclick=()=>by('logoutBtn')?.click();$('[data-mobile-logout]',root).onclick=()=>by('logoutBtn')?.click();
 populateMore();nativeTab('dashboard');summary();refreshNativeSummaryData();scheduleMobileFlowAdapt();setActive('dashboard');
}
function observe(){
 observer?.disconnect();const ids=['future-month-label','month-income-total','month-expense-total','kpi-real-balance','kpi-assured','kpi-projected','kpi-committed','kpi-projected-balance','kpi-gap','margin-status','margin-maximum','margin-spent','margin-remaining','margin-percent','margin-projection','summary-status-text','executive-risk-summary','exec-liquidity-reading','exec-obligation-reading','exec-flow-reading','exec-generation-reading'];
 observer=new MutationObserver(()=>{mirrorAll();syncConsolidatedReport()});ids.map(by).filter(Boolean).forEach(n=>observer.observe(n,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['style','class']}));
}
function restore(){clearTimeout(reportTimer);observer?.disconnect();observer=null;calendarObserver?.disconnect();calendarObserver=null;calendarAdaptScheduled=false;cleanupDebtMobileBehavior();closeAll();restoreActiveModule();restoreReal();root?.remove();root=null;built=false;document.body.classList.remove('b434-lock')}
function boot(){if(!mobile()){restore();return}if(!ready()){if(built)restore();return}if(!built){build();observe()}}
window.addEventListener('resize',()=>setTimeout(boot,100));window.addEventListener('orientationchange',()=>setTimeout(boot,150));
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
window.CCFMobileB43={version:'4.3.4-stage1-correction',refresh:()=>{mirrorAll();syncConsolidatedReport()},disable:restore};


})();
