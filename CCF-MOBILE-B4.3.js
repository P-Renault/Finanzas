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

/* ================================================================
   B4.3.10 — NUEVA VISTA CALENDARIO MÓVIL BOOTSTRAP
   ---------------------------------------------------------------
   Vista paralela al calendario B232.26.4:
   - No modifica el motor ni su DOM.
   - Lee los datos ya renderizados por el calendario existente.
   - Se muestra solo dentro de la shell móvil.
   - Usa Shadow DOM para aislar Bootstrap del resto de la aplicación.
   ================================================================ */
let ccfBsCalendarView=null;
let ccfBsCalendarObserver=null;
let ccfBsCalendarBound=null;
let ccfBsCalendarRenderTimer=null;

function ensureBootstrapCalendarView(){
  const section=by('calendario');
  if(!section||!root)return null;

  let host=section.querySelector('#ccf-bs-calendar-view');
  if(!host){
    host=document.createElement('div');
    host.id='ccf-bs-calendar-view';
    host.setAttribute('data-ccf-bs-calendar','1');
    const currentCard=section.querySelector('.b232261-card');
    if(currentCard) currentCard.parentNode.insertBefore(host,currentCard);
    else section.appendChild(host);
  }
  if(!host.shadowRoot){
    const shadow=host.attachShadow({mode:'open'});
    const link=document.createElement('link');
    link.rel='stylesheet';
    link.href='https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap-grid.min.css';
    const style=document.createElement('style');
    style.textContent=`
      :host{display:block;width:100%;max-width:100%;min-width:0;box-sizing:border-box}
      *{box-sizing:border-box}
      .calendar-shell{width:100%;max-width:370px;margin:0 auto;background:#fff;border:1px solid #e5e7eb;border-radius:14px;overflow:hidden}
      .calendar-header{padding:12px 10px 8px}
      .calendar-title{font-size:18px;font-weight:800;margin:0;color:#172033}
      .calendar-sub{font-size:10px;color:#64748b;margin-top:3px}
      .calendar-actions{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:5px;margin-top:9px}
      .calendar-actions button{border:0;border-radius:8px;min-height:34px;padding:5px 3px;font-size:10px;font-weight:800;background:#111827;color:#fff}
      .calendar-actions button.secondary{background:#e5e7eb;color:#172033}
      .calendar-kpis{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px;padding:0 10px 9px}
      .calendar-kpi{border:1px solid #e5e7eb;border-radius:10px;padding:8px;min-width:0}
      .calendar-kpi span{display:block;font-size:8px;color:#64748b}
      .calendar-kpi strong{display:block;font-size:13px;color:#172033;margin-top:3px;overflow-wrap:anywhere}
      .calendar-grid{width:100%;min-width:0;display:flex;flex-wrap:wrap}
      .calendar-grid>.col{flex:0 0 14.285714%;max-width:14.285714%;min-width:0;padding:0!important}
      .calendar-grid .col{min-width:0;padding:0!important}
      .weekday{height:30px;display:flex;align-items:center;justify-content:center;background:#111827;color:#fff;font-size:8px;font-weight:900;overflow:hidden}
      .day{width:100%;height:86px;border:0;border-right:1px solid #e5e7eb;border-bottom:1px solid #e5e7eb;background:#fff;text-align:left;padding:4px 3px;overflow:hidden;color:#334155}
      .day.out{background:#f8fafc;color:#94a3b8}
      .day.selected{outline:2px solid #111827;outline-offset:-2px}
      .day-number{display:flex;justify-content:space-between;align-items:center;font-size:10px;font-weight:800}
      .day-number small{font-size:6px}
      .event{display:block;margin-top:2px;padding:2px 2px;border-radius:3px;font-size:6px;line-height:1.05;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .in{background:#ecfdf5;color:#166534}.outflow{background:#fef2f2;color:#991b1b}
      .planin{background:#eff6ff;color:#1d4ed8}.planout{background:#fff7ed;color:#9a3412}
      .gen{background:#f5f3ff;color:#6d28b9}.debt{background:#eef2ff;color:#3730a3}
      .mini{display:block;font-size:6px;margin-top:2px;color:#64748b;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .positive{color:#166534!important}.negative{color:#991b1b!important}
      .calendar-detail{padding:9px;display:grid;grid-template-columns:1fr;gap:7px}
      .detail-box{border:1px solid #e5e7eb;border-radius:10px;padding:8px;font-size:9px}
      .detail-box h3{font-size:10px;margin:0 0 5px}
      .detail-content{line-height:1.35;overflow-wrap:anywhere}
      .empty{padding:12px;text-align:center;color:#64748b;font-size:9px}
      @media(max-width:370px){
        .calendar-shell{max-width:100%}
        .calendar-actions button{font-size:9px}
        .day{height:80px}
      }
    `;
    shadow.append(link,style);
  }
  ccfBsCalendarView=host.shadowRoot;
  return ccfBsCalendarView;
}

function bsText(el){return (el?.textContent||'').replace(/\s+/g,' ').trim()}

function renderBootstrapCalendarView(){
  const section=by('calendario');
  if(!section||!root)return false;
  const source=section.querySelector('.b232261-card');
  const shadow=ensureBootstrapCalendarView();
  if(!source||!shadow)return false;

  const grid=source.querySelector('.b232261-grid.b232261-week');
  if(!grid||grid.children.length<8)return false;

  const old=shadow.querySelector('.calendar-shell');
  if(old)old.remove();

  const shell=document.createElement('div');
  shell.className='calendar-shell';

  const head=document.createElement('div');
  head.className='calendar-header';
  const title=document.createElement('h2');
  title.className='calendar-title';
  title.textContent=bsText(source.querySelector('.b232261-head h2'))||'Calendario';
  const sub=document.createElement('div');
  sub.className='calendar-sub';
  sub.textContent=bsText(source.querySelector('.b232261-sub'))||'Vista mensual';
  head.append(title,sub);

  const actions=document.createElement('div');
  actions.className='calendar-actions';
  const sourceButtons=[...source.querySelectorAll('.b232261-actions button')];
  const labels=['‹','›','Hoy','↻'];
  sourceButtons.slice(0,4).forEach((src,i)=>{
    const b=document.createElement('button');
    b.type='button';
    b.className=i===2?'':'secondary';
    b.textContent=labels[i]||bsText(src);
    b.addEventListener('click',()=>{src.click();setTimeout(renderBootstrapCalendarView,80)});
    actions.appendChild(b);
  });
  head.appendChild(actions);
  shell.appendChild(head);

  const kpiWrap=document.createElement('div');
  kpiWrap.className='calendar-kpis';
  source.querySelectorAll('.b232261-kpi').forEach(k=>{
    const card=document.createElement('div'); card.className='calendar-kpi';
    const sp=document.createElement('span'); sp.textContent=bsText(k.querySelector('span'));
    const st=document.createElement('strong'); st.textContent=bsText(k.querySelector('strong'));
    card.append(sp,st); kpiWrap.appendChild(card);
  });
  shell.appendChild(kpiWrap);

  const cal=document.createElement('div');
  cal.className='row g-0 calendar-grid';
  [...grid.children].forEach((srcCell,index)=>{
    const col=document.createElement('div'); col.className='col';
    if(index<7){
      const h=document.createElement('div'); h.className='weekday'; h.textContent=bsText(srcCell);
      col.appendChild(h);
    }else{
      const srcDay=srcCell;
      const b=document.createElement('button'); b.type='button';
      b.className='day '+(srcDay.classList.contains('out')?'out ':'')+(srcDay.classList.contains('selected')?'selected':'');
      const top=srcDay.querySelector('.b232261-day-top');
      const dn=document.createElement('div'); dn.className='day-number';
      const strong=document.createElement('strong'); strong.textContent=bsText(top?.querySelector('strong'));
      const small=top?.querySelector('small'); if(small){const sm=document.createElement('small');sm.textContent=bsText(small);dn.append(sm)}
      dn.prepend(strong); b.appendChild(dn);
      srcDay.querySelectorAll('.b232261-event').forEach(ev=>{
        const e=document.createElement('span'); e.className='event ';
        const cl=ev.className;
        e.classList.add(cl.includes('real-in')?'in':cl.includes('real-out')?'outflow':cl.includes('plan-in')?'planin':cl.includes('plan-out')?'planout':cl.includes('gen')?'gen':cl.includes('debt')?'debt':'planout');
        e.textContent=bsText(ev); b.appendChild(e);
      });
      srcDay.querySelectorAll('.b232261-mini,.b232261-more').forEach(mi=>{
        const m=document.createElement('span');m.className='mini '+(mi.classList.contains('b232261-pos')?'positive':mi.classList.contains('b232261-neg')?'negative':'');m.textContent=bsText(mi);b.appendChild(m);
      });
      b.addEventListener('click',()=>{srcDay.click();setTimeout(renderBootstrapCalendarView,40)});
      col.appendChild(b);
    }
    cal.appendChild(col);
  });
  shell.appendChild(cal);

  const detail=document.createElement('div');
  detail.className='calendar-detail';
  const sourceDetail=source.querySelector('.b232261-detail');
  if(sourceDetail){
    [...sourceDetail.querySelectorAll('.b232261-box')].forEach(box=>{
      const d=document.createElement('div');d.className='detail-box';
      const h=box.querySelector('h3'); if(h){const hh=document.createElement('h3');hh.textContent=bsText(h);d.appendChild(hh)}
      const body=document.createElement('div');body.className='detail-content';body.textContent=bsText(box).replace(bsText(h),'').trim();d.appendChild(body);
      detail.appendChild(d);
    });
  }
  shell.appendChild(detail);
  shadow.appendChild(shell);

  /* La vista nueva queda ARRIBA del calendario original.
     El calendario original permanece visible para comparar ambas implementaciones. */
  const currentCard=section.querySelector('.b232261-card');
  const host=section.querySelector('#ccf-bs-calendar-view');
  if(currentCard && host && host.nextElementSibling!==currentCard){
    currentCard.parentNode.insertBefore(host,currentCard);
  }
  return true;
}

function hostStyleMobileCalendar(section){
  section.querySelectorAll('.b232261-card').forEach(card=>{
    if(card.id!=='ccf-bs-calendar-view')card.style.setProperty('display','none','important');
  });
}

function observeBootstrapCalendarView(){
  ccfBsCalendarObserver?.disconnect();
  const section=by('calendario');
  if(!section)return;
  ccfBsCalendarObserver=new MutationObserver(()=>{
    clearTimeout(ccfBsCalendarRenderTimer);
    ccfBsCalendarRenderTimer=setTimeout(()=>{
      if(root?.id==='ccf-mobile-b43'&&by('calendario'))renderBootstrapCalendarView();
    },40);
  });
  ccfBsCalendarObserver.observe(section,{childList:true,subtree:true});
  setTimeout(renderBootstrapCalendarView,120);
}

function activateBootstrapCalendarView(){
  const section=by('calendario');
  if(!section||!root||root.id!=='ccf-mobile-b43')return false;
  if(ccfBsCalendarBound!==section){
    ccfBsCalendarBound=section;
    observeBootstrapCalendarView();
  }
  const ok=renderBootstrapCalendarView();
  if(!ok){
    [120,300,600,1000,1600].forEach(ms=>setTimeout(()=>{
      if(by('calendario')&&root?.id==='ccf-mobile-b43')renderBootstrapCalendarView();
    },ms));
  }
  return ok;
}

})();
