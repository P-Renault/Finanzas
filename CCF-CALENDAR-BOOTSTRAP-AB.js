/* CCF CALENDAR BOOTSTRAP A/B — B4.3.11
   Vista independiente: se monta ARRIBA del calendario B232.26.4.
   No modifica B232.26.4-calendario-safe.js ni oculta el calendario original.
*/
(function(){
  'use strict';

  const HOST_ID = 'ccf-bs-calendar-ab';
  let observer = null;
  let timer = null;

  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => [...root.querySelectorAll(sel)];
  const text = el => (el?.textContent || '').replace(/\s+/g,' ').trim();

  function section(){
    return document.getElementById('calendario');
  }

  function getHost(sec){
    if(!sec?.parentNode) return null;
    let host = [...sec.parentNode.children].find(el => el.id === HOST_ID);
    if(!host){
      host = document.createElement('div');
      host.id = HOST_ID;
      host.setAttribute('data-calendar-bootstrap-ab','1');
      sec.parentNode.insertBefore(host, sec);
    } else if(host.nextElementSibling !== sec){
      sec.parentNode.insertBefore(host, sec);
    }
    return host;
  }

  function ensureShadow(host){
    if(!host.shadowRoot){
      const shadow = host.attachShadow({mode:'open'});

      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap-grid.min.css';

      const style = document.createElement('style');
      style.textContent = `
        :host{display:block!important;width:100%!important;max-width:100%!important;min-width:0!important;box-sizing:border-box!important;margin:0 0 12px!important}
        *{box-sizing:border-box}
        .shell{width:100%;max-width:100%;min-width:0;background:#fff;border:2px solid #111827;border-radius:14px;overflow:hidden}
        .badge{display:inline-block;margin-bottom:6px;padding:4px 7px;border-radius:999px;background:#111827;color:#fff;font-size:8px;font-weight:900;letter-spacing:.2px}
        .head{padding:11px 10px 8px}
        h2{margin:0;color:#172033;font-size:17px;font-weight:800}
        .sub{margin-top:3px;color:#64748b;font-size:9px}
        .actions{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:5px;margin-top:9px}
        .actions button{border:0;border-radius:8px;min-height:32px;padding:4px 2px;font-size:10px;font-weight:800;background:#111827;color:#fff}
        .actions button.secondary{background:#e5e7eb;color:#172033}
        .kpis{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px;padding:0 10px 9px}
        .kpi{min-width:0;border:1px solid #e5e7eb;border-radius:9px;padding:7px}
        .kpi span{display:block;font-size:7px;color:#64748b}
        .kpi strong{display:block;margin-top:2px;font-size:12px;color:#172033;overflow-wrap:anywhere}
        .grid{width:100%!important;min-width:0!important;display:flex!important;flex-wrap:wrap!important}
        .grid>.col{flex:0 0 14.285714%!important;max-width:14.285714%!important;min-width:0!important;width:14.285714%!important;padding:0!important}
        .weekday{height:28px;display:flex;align-items:center;justify-content:center;background:#111827;color:#fff;font-size:8px;font-weight:900;overflow:hidden}
        .day{display:block;width:100%;height:82px;border:0;border-right:1px solid #e5e7eb;border-bottom:1px solid #e5e7eb;background:#fff;text-align:left;padding:4px 3px;overflow:hidden;color:#334155}
        .day.out{background:#f8fafc;color:#94a3b8}
        .day.selected{outline:2px solid #111827;outline-offset:-2px}
        .num{display:flex;justify-content:space-between;align-items:center;font-size:10px;font-weight:800}
        .num small{font-size:6px}
        .event{display:block;margin-top:2px;padding:2px;border-radius:3px;font-size:6px;line-height:1.05;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .in{background:#ecfdf5;color:#166534}.out{background:#fef2f2;color:#991b1b}
        .pin{background:#eff6ff;color:#1d4ed8}.pout{background:#fff7ed;color:#9a3412}
        .gen{background:#f5f3ff;color:#6d28b9}.debt{background:#eef2ff;color:#3730a3}
        .mini{display:block;margin-top:2px;font-size:6px;color:#64748b;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .detail{display:grid;gap:6px;padding:9px}
        .box{border:1px solid #e5e7eb;border-radius:9px;padding:7px;font-size:9px;line-height:1.35}
        .box h3{margin:0 0 4px;font-size:10px}
      `;
      shadow.append(link, style);
    }
    return host.shadowRoot;
  }

  function render(){
    const sec = section();
    if(!sec) return false;

    const source = $('.b232261-card', sec);
    const grid = $('.b232261-grid.b232261-week', source);
    if(!source || !grid || grid.children.length < 8) return false;

    const host = getHost(sec);
    const shadow = ensureShadow(host);
    if(!shadow) return false;

    shadow.replaceChildren(...shadow.querySelectorAll('link,style'));
    const shell = document.createElement('div');
    shell.className = 'shell';

    const head = document.createElement('div');
    head.className = 'head';

    const badge = document.createElement('div');
    badge.className = 'badge';
    badge.textContent = 'NUEVO CALENDARIO BOOTSTRAP · PRUEBA A/B';

    const h2 = document.createElement('h2');
    h2.textContent = text($('.b232261-head h2', source)) || 'Calendario';

    const sub = document.createElement('div');
    sub.className = 'sub';
    sub.textContent = text($('.b232261-sub', source)) || 'Vista mensual';

    head.append(badge, h2, sub);

    const actions = document.createElement('div');
    actions.className = 'actions';
    const srcBtns = $$('.b232261-actions button', source);
    ['‹','›','Hoy','↻'].forEach((label,i)=>{
      const b = document.createElement('button');
      b.type='button';
      b.textContent=label;
      if(i!==2) b.className='secondary';
      if(srcBtns[i]) b.addEventListener('click',()=>{
        srcBtns[i].click();
        setTimeout(render,80);
      });
      actions.appendChild(b);
    });
    head.appendChild(actions);
    shell.appendChild(head);

    const kpis = document.createElement('div');
    kpis.className='kpis';
    $$('.b232261-kpi',source).forEach(k=>{
      const card=document.createElement('div'); card.className='kpi';
      const s=document.createElement('span'); s.textContent=text($('span',k));
      const st=document.createElement('strong'); st.textContent=text($('strong',k));
      card.append(s,st); kpis.appendChild(card);
    });
    shell.appendChild(kpis);

    const cal=document.createElement('div');
    cal.className='row g-0 grid';

    [...grid.children].forEach((cell,index)=>{
      const col=document.createElement('div'); col.className='col';

      if(index<7){
        const w=document.createElement('div');
        w.className='weekday';
        w.textContent=text(cell);
        col.appendChild(w);
      }else{
        const day=document.createElement('button');
        day.type='button';
        day.className='day';
        if(cell.classList.contains('out')) day.classList.add('out');
        if(cell.classList.contains('selected')) day.classList.add('selected');

        const top=$('.b232261-day-top',cell);
        const num=document.createElement('div'); num.className='num';
        const strong=document.createElement('strong');
        strong.textContent=text($('strong',top));
        num.appendChild(strong);
        const small=$('small',top);
        if(small){ const sm=document.createElement('small'); sm.textContent=text(small); num.appendChild(sm); }
        day.appendChild(num);

        $$('.b232261-event',cell).forEach(ev=>{
          const e=document.createElement('span');
          e.className='event';
          const c=ev.className;
          e.classList.add(c.includes('real-in')?'in':c.includes('real-out')?'out':c.includes('plan-in')?'pin':c.includes('plan-out')?'pout':c.includes('gen')?'gen':c.includes('debt')?'debt':'pout');
          e.textContent=text(ev);
          day.appendChild(e);
        });

        $$('.b232261-mini,.b232261-more',cell).forEach(mi=>{
          const m=document.createElement('span');
          m.className='mini';
          m.textContent=text(mi);
          day.appendChild(m);
        });

        day.addEventListener('click',()=>{
          cell.click();
          setTimeout(render,60);
        });
        col.appendChild(day);
      }
      cal.appendChild(col);
    });

    shell.appendChild(cal);

    const detail=document.createElement('div'); detail.className='detail';
    const sd=$('.b232261-detail',source);
    if(sd){
      $$('.b232261-box',sd).forEach(box=>{
        const d=document.createElement('div'); d.className='box';
        const h=$('h3',box);
        if(h){const hh=document.createElement('h3');hh.textContent=text(h);d.appendChild(hh);}
        const body=document.createElement('div');
        body.textContent=text(box).replace(text(h),'').trim();
        d.appendChild(body); detail.appendChild(d);
      });
    }
    shell.appendChild(detail);

    shadow.appendChild(shell);
    return true;
  }

  function start(){
    const sec=section();
    if(!sec){setTimeout(start,500);return;}

    render();

    observer?.disconnect();
    observer=new MutationObserver(()=>{
      clearTimeout(timer);
      timer=setTimeout(render,100);
    });
    observer.observe(sec,{childList:true,subtree:true});

    [300,800,1500,2500].forEach(ms=>setTimeout(render,ms));
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
