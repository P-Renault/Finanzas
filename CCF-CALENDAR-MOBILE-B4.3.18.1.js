/* ============================================================
 CCF CALENDAR MOBILE · B4.3.18.1
 INTEGRACIÓN MÓVIL AISLADA · PREMIUM

 Arquitectura:
 - Fuente única de datos: .b232261-card generado por B232.26.4.
 - No modifica B232.26.4 ni Supabase.
 - No recalcula importes financieros.
 - No modifica CCF-MOBILE-B4.3.js.
 - No oculta ni elimina el calendario propietario inferior.
 - Construye una sola vista Premium inmediatamente antes de la
   vista propietaria para validación visual A/B.
 - Navegación y selección delegadas al calendario propietario.

 Dependencias:
 - #ccf-mobile-b43
 - #calendario
 - .b232261-card
 - estructura DOM B232.26.4 validada por B4.3.17/B4.3.18.1
============================================================ */
(function(){
  'use strict';

  const ID='ccf-calendar-mobile-premium-b4-3-18-1';
  const BP=720;
  let observer=null;
  let timer=null;
  let renderTimer=null;
  let rendering=false;
  let started=false;

  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const root=()=>document.getElementById('ccf-mobile-b43');
  const section=()=>document.getElementById('calendario');
  const source=()=>section()?.querySelector('.b232261-card')||null;
  const mobile=()=>window.matchMedia('(max-width:'+BP+'px)').matches;
  const txt=el=>String(el?.textContent||'').replace(/\s+/g,' ').trim();

  function isReady(){
    return mobile() && !!root() && !!section() && !!source();
  }

  function cssLoaded(){
    return !!document.querySelector('link[data-ccf-calendar-premium-css="B4.3.18.1"]');
  }

  function loadCss(){
    if(cssLoaded()) return;
    const link=document.createElement('link');
    link.rel='stylesheet';
    link.href='CCF-CALENDAR-MOBILE-B4.3.18.1.css?v=B4.3.18.1';
    link.dataset.ccfCalendarPremiumCss='B4.3.18.1';
    document.head.appendChild(link);
  }

  function hideCompetingBootstrapView(){
    const h=document.getElementById('ccf-bs-calendar-view');
    if(h && h.getAttribute('data-ccf-calendar-premium-suppressed')!=='1'){
      h.style.setProperty('display','none','important');
      h.setAttribute('data-ccf-calendar-premium-suppressed','1');
    }
  }

  function showCompetingBootstrapView(){
    const h=document.getElementById('ccf-bs-calendar-view');
    if(h && h.getAttribute('data-ccf-calendar-premium-suppressed')==='1'){
      h.style.removeProperty('display');
      h.removeAttribute('data-ccf-calendar-premium-suppressed');
    }
  }

  function findSourceButtons(card){
    const all=$$('.b232261-actions button',card);
    if(all.length>=4) return all.slice(0,4);

    const byId=id=>document.getElementById(id);
    const fallback=[byId('calPrev'),byId('calToday'),byId('calNext')].filter(Boolean);
    return fallback;
  }

  function wireActions(host,card){
    const sourceButtons=findSourceButtons(card);
    const actions=$$('.cm-actions button',host);
    const labels=['‹','Hoy','›','↻'];

    actions.forEach((dst,i)=>{
      const src=sourceButtons[i];
      dst.textContent=labels[i]||txt(src)||'•';
      dst.onclick=()=>{
        if(!src) return;
        src.click();
        scheduleRender(80);
      };
    });
  }

  function copyKpis(card,wrap){
    const wanted=['Ingresos reales','Ingresos proyectados','Egresos reales','Obligaciones','Saldo final'];
    const sourceKpis=$$('.b232261-kpi',card);

    wanted.forEach(label=>{
      const src=sourceKpis.find(k=>txt($('span',k)).toLowerCase()===label.toLowerCase());
      if(!src) return;
      const item=document.createElement('div');
      item.className='cm-kpi';
      item.dataset.kpiLabel=label;

      const span=document.createElement('span');
      span.textContent=txt($('span',src));
      const strong=document.createElement('strong');
      strong.textContent=txt($('strong',src));

      item.append(span,strong);
      wrap.appendChild(item);
    });
  }

  function copyScope(card,host){
    const scope=$('.b232261-scope',card);
    if(!scope) return;
    const box=document.createElement('div');
    box.className='cm-scope';
    const mode=$('b',scope);
    const date=$('span',scope);
    box.textContent=(txt(mode)||'Día seleccionado')+(txt(date)?': '+txt(date):'');
    host.appendChild(box);
  }

  function eventClass(src){
    const c=src.className||'';
    if(c.includes('real-in')) return 'cm-real-in';
    if(c.includes('real-out')) return 'cm-real-out';
    if(c.includes('plan-in')) return 'cm-plan-in';
    if(c.includes('plan-out')) return 'cm-plan-out';
    if(c.includes('gen')) return 'cm-gen';
    if(c.includes('debt')) return 'cm-debt';
    return 'cm-plan-out';
  }

  function buildDay(srcDay){
    const b=document.createElement('button');
    b.type='button';
    b.className='cm-day';
    if(srcDay.classList.contains('out')) b.classList.add('out');
    if(srcDay.classList.contains('selected')) b.classList.add('selected');

    const top=$('.b232261-day-top',srcDay);
    const dayTop=document.createElement('div');
    dayTop.className='cm-day-top';
    const strong=document.createElement('strong');
    strong.textContent=txt($('strong',top));
    dayTop.appendChild(strong);
    const small=$('small',top);
    if(small){
      const sm=document.createElement('small');
      sm.textContent=txt(small);
      dayTop.appendChild(sm);
    }
    b.appendChild(dayTop);

    $$('.b232261-event',srcDay).forEach(ev=>{
      const e=document.createElement('span');
      e.className='cm-event '+eventClass(ev);
      e.textContent=txt(ev);
      b.appendChild(e);
    });

    $$('.b232261-mini,.b232261-more',srcDay).forEach(mi=>{
      const m=document.createElement('span');
      m.className='cm-mini';
      if(mi.classList.contains('b232261-pos')) m.classList.add('cm-pos');
      if(mi.classList.contains('b232261-neg')) m.classList.add('cm-neg');
      m.textContent=txt(mi);
      b.appendChild(m);
    });

    b.onclick=()=>{
      srcDay.click();
      scheduleRender(70);
    };
    return b;
  }

  function buildCalendar(card,host){
    const grid=$('.b232261-grid.b232261-week',card);
    if(!grid || grid.children.length<49) return false;

    const wrap=document.createElement('div');
    wrap.className='cm-calendar-wrap';
    const out=document.createElement('div');
    out.className='cm-grid';

    [...grid.children].forEach((cell,i)=>{
      if(i<7){
        const w=document.createElement('div');
        w.className='cm-week';
        w.textContent=txt(cell);
        out.appendChild(w);
      }else{
        out.appendChild(buildDay(cell));
      }
    });

    wrap.appendChild(out);
    host.appendChild(wrap);
    return true;
  }

  function appendDetail(card,host){
    const detail=$('.b232261-detail',card);
    if(!detail) return;

    const wrap=document.createElement('section');
    wrap.className='p181-detail-wrap';
    const clone=detail.cloneNode(true);
    clone.querySelectorAll('[id]').forEach(el=>el.removeAttribute('id'));
    clone.classList.add('p181-source-detail');
    wrap.appendChild(clone);
    host.appendChild(wrap);
  }

  function buildHeader(card,host){
    const head=document.createElement('div');
    head.className='cm-head';

    const eyebrow=document.createElement('div');
    eyebrow.className='cm-eyebrow';
    eyebrow.textContent='PERIODO';

    const title=document.createElement('h2');
    title.className='cm-title';
    title.textContent=txt($('.b232261-head h2',card))||'Calendario';

    const sub=document.createElement('div');
    sub.className='cm-sub';
    sub.textContent=txt($('.b232261-sub',card))||'Vista mensual';

    const actions=document.createElement('div');
    actions.className='cm-actions';
    for(let i=0;i<4;i++){
      const b=document.createElement('button');
      b.type='button';
      b.className=i===1?'':'secondary';
      actions.appendChild(b);
    }

    head.append(eyebrow,title,sub,actions);
    host.appendChild(head);
    wireActions(host,card);
  }

  function render(){
    if(rendering || !isReady()) return false;
    rendering=true;
    try{
      loadCss();
      hideCompetingBootstrapView();

      const card=source();
      const sec=section();
      if(!card||!sec) return false;

      let host=document.getElementById(ID);
      if(!host){
        host=document.createElement('section');
        host.id=ID;
        host.setAttribute('data-ccf-calendar-premium','B4.3.18.1');
      }

      host.innerHTML='';

      const shell=document.createElement('div');
      shell.className='p181-shell';
      buildHeader(card,shell);

      const kpis=document.createElement('div');
      kpis.className='cm-kpis';
      copyKpis(card,kpis);
      shell.appendChild(kpis);

      copyScope(card,shell);
      if(!buildCalendar(card,shell)) return false;
      appendDetail(card,shell);
      host.appendChild(shell);

      /*
       * El host se mantiene inmediatamente antes de la vista
       * propietaria. Si CCF-MOBILE B4.3 crea #ccf-bs-calendar-view,
       * también queda debajo de esta prueba y se mantiene oculto
       * para evitar una tercera vista duplicada.
       */
      const competing=document.getElementById('ccf-bs-calendar-view');
      const anchor=competing || card;
      if(anchor.parentNode && anchor.parentNode===sec){
        if(host!==anchor.previousElementSibling){
          anchor.parentNode.insertBefore(host,anchor);
        }
      }else if(card.parentNode){
        card.parentNode.insertBefore(host,card);
      }else{
        sec.insertBefore(host,sec.firstChild);
      }

      /* El calendario propietario inferior queda intacto y visible. */
      return true;
    }catch(e){
      console.error('[CCF CALENDAR MOBILE B4.3.18.1]',e);
      return false;
    }finally{
      rendering=false;
    }
  }

  function scheduleRender(delay=100){
    clearTimeout(renderTimer);
    renderTimer=setTimeout(()=>render(),delay);
  }

  function observe(){
    observer?.disconnect();
    const sec=section();
    if(!sec) return;
    observer=new MutationObserver(mutations=>{
      if(rendering) return;
      let changed=false;
      for(const m of mutations){
        if(m.target?.closest?.('#'+ID)) continue;
        if(m.target?.closest?.('#ccf-bs-calendar-view')) continue;
        changed=true; break;
      }
      if(changed) scheduleRender(120);
    });
    observer.observe(sec,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['class']});
  }

  function start(){
    if(!isReady()) return false;
    if(!started){
      started=true;
      observe();
    }
    return render();
  }

  function boot(){
    clearInterval(timer);
    let tries=0;
    timer=setInterval(()=>{
      if(start() || ++tries>=60){
        clearInterval(timer);
        timer=null;
      }
    },250);
    start();
  }

  window.addEventListener('resize',()=>{
    if(mobile()) scheduleRender(120);
    else showCompetingBootstrapView();
  });

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',boot,{once:true});
  }else{
    boot();
  }

  window.CCFCalendarMobilePremium181Integrated={
    version:'B4.3.18.1-PREMIUM-INTEGRATED',
    render,
    start,
    status:()=>({
      version:'B4.3.18.1-PREMIUM-INTEGRATED',
      mobile:mobile(),
      mobileRoot:!!root(),
      calendarSection:!!section(),
      sourceCalendar:!!source(),
      premiumView:!!document.getElementById(ID),
      lowerSourceVisible:!!source() && getComputedStyle(source()).display!=='none',
      competingBootstrapHidden:!!document.getElementById('ccf-bs-calendar-view') && getComputedStyle(document.getElementById('ccf-bs-calendar-view')).display==='none'
    })
  };
})();
