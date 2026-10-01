/* CCF CALENDAR BOOTSTRAP A/B — B4.3.12
   Corrección de montaje: sigue al módulo #calendario cuando CCF-MOBILE
   lo mueve dinámicamente dentro de su shell móvil.
*/
(function(){
  'use strict';

  const HOST_ID='ccf-bs-calendar-ab';
  let sectionObserver=null, bodyObserver=null, timer=null;

  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const tx=e=>(e?.textContent||'').replace(/\s+/g,' ').trim();

  function sec(){return document.getElementById('calendario');}

  function hostFor(s){
    if(!s?.parentNode)return null;
    let h=[...s.parentNode.children].find(e=>e.id===HOST_ID);
    if(!h){
      h=document.createElement('div');
      h.id=HOST_ID;
      h.setAttribute('data-calendar-bootstrap-ab','1');
      s.parentNode.insertBefore(h,s);
    }else if(h.nextElementSibling!==s){
      s.parentNode.insertBefore(h,s);
    }
    return h;
  }

  function shadowFor(h){
    if(!h.shadowRoot){
      const sh=h.attachShadow({mode:'open'});
      const link=document.createElement('link');
      link.rel='stylesheet';
      link.href='https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap-grid.min.css';
      const st=document.createElement('style');
      st.textContent=`
        :host{display:block!important;width:100%!important;max-width:100%!important;min-width:0!important;box-sizing:border-box!important;margin:0 0 12px!important}
        *{box-sizing:border-box}
        .shell{width:100%;max-width:100%;min-width:0;background:#fff;border:2px solid #111827;border-radius:14px;overflow:hidden}
        .head{padding:11px 10px 8px}
        .badge{display:inline-block;margin-bottom:6px;padding:4px 7px;border-radius:999px;background:#111827;color:#fff;font-size:8px;font-weight:900;letter-spacing:.2px}
        h2{margin:0;color:#172033;font-size:17px;font-weight:800}.sub{margin-top:3px;color:#64748b;font-size:9px}
        .actions{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:5px;margin-top:9px}
        .actions button{border:0;border-radius:8px;min-height:32px;padding:4px 2px;font-size:10px;font-weight:800;background:#111827;color:#fff}
        .actions button.secondary{background:#e5e7eb;color:#172033}
        .kpis{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px;padding:0 10px 9px}
        .kpi{min-width:0;border:1px solid #e5e7eb;border-radius:9px;padding:7px}.kpi span{display:block;font-size:7px;color:#64748b}
        .kpi strong{display:block;margin-top:2px;font-size:12px;color:#172033;overflow-wrap:anywhere}
        .grid{width:100%!important;min-width:0!important;display:flex!important;flex-wrap:wrap!important}
        .grid>.col{flex:0 0 14.285714%!important;max-width:14.285714%!important;min-width:0!important;width:14.285714%!important;padding:0!important}
        .weekday{height:28px;display:flex;align-items:center;justify-content:center;background:#111827;color:#fff;font-size:8px;font-weight:900;overflow:hidden}
        .day{display:block;width:100%;height:82px;border:0;border-right:1px solid #e5e7eb;border-bottom:1px solid #e5e7eb;background:#fff;text-align:left;padding:4px 3px;overflow:hidden;color:#334155}
        .day.out{background:#f8fafc;color:#94a3b8}.day.selected{outline:2px solid #111827;outline-offset:-2px}
        .num{display:flex;justify-content:space-between;align-items:center;font-size:10px;font-weight:800}.num small{font-size:6px}
        .event{display:block;margin-top:2px;padding:2px;border-radius:3px;font-size:6px;line-height:1.05;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .in{background:#ecfdf5;color:#166534}.out{background:#fef2f2;color:#991b1b}.pin{background:#eff6ff;color:#1d4ed8}.pout{background:#fff7ed;color:#9a3412}.gen{background:#f5f3ff;color:#6d28b9}.debt{background:#eef2ff;color:#3730a3}
        .mini{display:block;margin-top:2px;font-size:6px;color:#64748b;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .detail{display:grid;gap:6px;padding:9px}.box{border:1px solid #e5e7eb;border-radius:9px;padding:7px;font-size:9px;line-height:1.35}.box h3{margin:0 0 4px;font-size:10px}
      `;
      sh.append(link,st);
    }
    return h.shadowRoot;
  }

  function render(){
    const s=sec();
    if(!s)return false;
    const source=$('.b232261-card',s), grid=$('.b232261-grid.b232261-week',source);
    if(!source||!grid||grid.children.length<8)return false;

    const h=hostFor(s), sh=shadowFor(h);
    if(!sh)return false;

    const keep=[...sh.children].filter(e=>e.tagName==='LINK'||e.tagName==='STYLE');
    sh.replaceChildren(...keep);

    const shell=document.createElement('div'); shell.className='shell';
    const head=document.createElement('div'); head.className='head';
    const badge=document.createElement('div'); badge.className='badge';
    badge.textContent='NUEVO CALENDARIO BOOTSTRAP · PRUEBA A/B · B4.3.12';
    const title=document.createElement('h2'); title.textContent=tx($('.b232261-head h2',source))||'Calendario';
    const sub=document.createElement('div'); sub.className='sub'; sub.textContent=tx($('.b232261-sub',source))||'Vista mensual';
    head.append(badge,title,sub);

    const actions=document.createElement('div'); actions.className='actions';
    const sb=$$('.b232261-actions button',source);
    ['‹','›','Hoy','↻'].forEach((lab,i)=>{
      const b=document.createElement('button'); b.type='button'; b.textContent=lab; if(i!==2)b.className='secondary';
      if(sb[i])b.onclick=()=>{sb[i].click();setTimeout(render,100)};
      actions.appendChild(b);
    });
    head.appendChild(actions); shell.appendChild(head);

    const kp=document.createElement('div'); kp.className='kpis';
    $$('.b232261-kpi',source).forEach(k=>{
      const c=document.createElement('div');c.className='kpi';
      const a=document.createElement('span');a.textContent=tx($('span',k));
      const b=document.createElement('strong');b.textContent=tx($('strong',k));
      c.append(a,b);kp.appendChild(c);
    });
    shell.appendChild(kp);

    const cal=document.createElement('div');cal.className='row g-0 grid';
    [...grid.children].forEach((cell,i)=>{
      const col=document.createElement('div');col.className='col';
      if(i<7){
        const w=document.createElement('div');w.className='weekday';w.textContent=tx(cell);col.appendChild(w);
      }else{
        const d=document.createElement('button');d.type='button';d.className='day';
        if(cell.classList.contains('out'))d.classList.add('out');
        if(cell.classList.contains('selected'))d.classList.add('selected');
        const top=$('.b232261-day-top',cell), n=document.createElement('div');n.className='num';
        const st=document.createElement('strong');st.textContent=tx($('strong',top));n.appendChild(st);
        const sm=$('small',top);if(sm){const x=document.createElement('small');x.textContent=tx(sm);n.appendChild(x)} d.appendChild(n);
        $$('.b232261-event',cell).forEach(ev=>{
          const e=document.createElement('span');e.className='event';const c=ev.className;
          e.classList.add(c.includes('real-in')?'in':c.includes('real-out')?'out':c.includes('plan-in')?'pin':c.includes('plan-out')?'pout':c.includes('gen')?'gen':c.includes('debt')?'debt':'pout');
          e.textContent=tx(ev);d.appendChild(e);
        });
        $$('.b232261-mini,.b232261-more',cell).forEach(mi=>{const m=document.createElement('span');m.className='mini';m.textContent=tx(mi);d.appendChild(m)});
        d.onclick=()=>{cell.click();setTimeout(render,70)};col.appendChild(d);
      }
      cal.appendChild(col);
    });
    shell.appendChild(cal);

    const detail=document.createElement('div');detail.className='detail';const sd=$('.b232261-detail',source);
    if(sd)$$('.b232261-box',sd).forEach(box=>{
      const d=document.createElement('div');d.className='box';const h3=$('h3',box);
      if(h3){const hh=document.createElement('h3');hh.textContent=tx(h3);d.appendChild(hh)}
      const body=document.createElement('div');body.textContent=tx(box).replace(tx(h3),'').trim();d.appendChild(body);detail.appendChild(d);
    });
    shell.appendChild(detail);sh.appendChild(shell);return true;
  }

  function schedule(){
    clearTimeout(timer);timer=setTimeout(render,80);
  }

  function start(){
    render();

    sectionObserver?.disconnect();
    const s=sec();
    if(s){
      sectionObserver=new MutationObserver(schedule);
      sectionObserver.observe(s,{childList:true,subtree:true});
    }

    // Critical correction: CCF-MOBILE-B4.3 moves #calendario to its mobile
    // module host after this script initially runs. Observe document-level
    // structural changes and remount the A/B view beside the moved module.
    bodyObserver?.disconnect();
    bodyObserver=new MutationObserver(schedule);
    bodyObserver.observe(document.body,{childList:true,subtree:true});

    [200,500,1000,1800,3000].forEach(ms=>setTimeout(render,ms));
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
