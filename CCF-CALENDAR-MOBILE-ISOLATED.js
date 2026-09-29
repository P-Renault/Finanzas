/*
 CCF-CALENDAR-MOBILE-ISOLATED v1.0
 Capa móvil aislada para B232.26.4 — SOLO PRESENTACIÓN.
 No calcula, no consulta Supabase, no reemplaza el motor del calendario.
 Activa únicamente <=720px y únicamente dentro de #calendario.
*/
(()=>{
  'use strict';
  if(window.__CCF_CALENDAR_MOBILE_ISOLATED__) return;
  window.__CCF_CALENDAR_MOBILE_ISOLATED__=true;

  const BP=720;
  const mobile=()=>window.matchMedia(`(max-width:${BP}px)`).matches;
  const qs=(s,r=document)=>r.querySelector(s);
  const qsa=(s,r=document)=>Array.from(r.querySelectorAll(s));
  let observer=null;
  let timer=0;

  function calendarSection(){
    return document.getElementById('calendario') ||
      qs('[data-module="calendario"]') ||
      qs('[data-tab-content="calendario"]');
  }

  function findGridHost(section){
    const direct=[
      '.calendar-scroll',
      '.b232261-scroll',
      '[data-calendar-scroll]',
      '.calendar-grid-wrap',
      '.b232261-calendar-scroll'
    ];
    for(const s of direct){const n=qs(s,section);if(n)return n;}

    const grid=qs('.calendar-grid,.b232261-grid,[data-calendar-grid],table.calendar-grid',section);
    if(grid) return grid.parentElement || grid;

    // Fallback: locate a 7-column grid/table without assuming a class name.
    const candidates=qsa('*',section).filter(n=>{
      const cs=getComputedStyle(n);
      if(cs.display!=='grid') return false;
      const cols=(cs.gridTemplateColumns||'').split(' ').filter(Boolean).length;
      return cols===7 || /repeat\(\s*7/i.test(cs.gridTemplateColumns||'');
    });
    return candidates[0]||null;
  }

  function monthText(section){
    const n=qs('#calendarMonth,.b232261-head h2,.b232261-head h3,[data-calendar-month]',section);
    return n?.textContent?.trim() || 'Período mensual';
  }

  function ensureCard(section,host){
    if(!host || !host.parentElement) return null;
    let card=qs('[data-ccf-calendar-mobile-card="1"]',section);
    if(!card){
      card=document.createElement('section');
      card.className='ccf-calendar-mobile-card';
      card.dataset.ccfCalendarMobileCard='1';

      const head=document.createElement('header');
      head.className='ccf-calendar-mobile-card-head';
      head.innerHTML='<div><span>CALENDARIO MENSUAL</span><strong data-ccf-calendar-period></strong></div>';
      card.appendChild(head);

      host.parentElement.insertBefore(card,host);
      card.appendChild(host);
    }
    const period=qs('[data-ccf-calendar-period]',card);
    if(period) period.textContent=monthText(section);
    return card;
  }

  function normalize(section,host){
    if(!mobile() || !section || !host) return false;
    const card=ensureCard(section,host);
    if(!card) return false;

    card.classList.add('ccf-calendar-mobile-ready');
    host.classList.add('ccf-calendar-mobile-scroll');

    // Remove horizontal scrolling only from the calendar box.
    host.style.setProperty('width','100%','important');
    host.style.setProperty('min-width','0','important');
    host.style.setProperty('max-width','100%','important');
    host.style.setProperty('overflow','hidden','important');

    const grid=qs('.calendar-grid,.b232261-grid,[data-calendar-grid],table.calendar-grid',host) ||
               (getComputedStyle(host).display==='grid'?host:null);
    if(grid){
      grid.classList.add('ccf-calendar-mobile-grid');
      grid.style.setProperty('width','100%','important');
      grid.style.setProperty('min-width','0','important');
      grid.style.setProperty('max-width','100%','important');
      grid.style.setProperty('grid-template-columns','repeat(7,minmax(0,1fr))','important');
    }

    qsa('.b232261-day,.calendar-day,[data-calendar-day],.day-cell',host).forEach(d=>d.classList.add('ccf-calendar-mobile-day'));
    return true;
  }

  function run(){
    if(!mobile()) return;
    const section=calendarSection();
    if(!section) return;
    const host=findGridHost(section);
    if(host) normalize(section,host);
  }

  function observe(){
    observer?.disconnect();
    const section=calendarSection();
    if(!section) return;
    run();
    observer=new MutationObserver(()=>{
      clearTimeout(timer);
      timer=setTimeout(run,30);
    });
    observer.observe(section,{childList:true,subtree:true});
    [100,350,800,1500,2500].forEach(ms=>setTimeout(run,ms));
  }

  function boot(){
    if(!mobile()) return;
    observe();
  }

  window.addEventListener('resize',()=>{
    if(mobile()) boot();
    else observer?.disconnect();
  },{passive:true});

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();

  // The mobile router can mount the calendar after this script executes.
  new MutationObserver(()=>{
    if(mobile() && calendarSection()) boot();
  }).observe(document.body,{childList:true,subtree:true});
})();
