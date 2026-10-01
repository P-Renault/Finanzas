/* CCF CALENDAR MOBILE A/B FINAL — B4.3.14
   DEBE CARGARSE DESPUÉS DE CCF-MOBILE-B4.3.js.
   No modifica B232.26.4 ni el calendario original.
*/
(()=>{'use strict';
const HOST='ccf-calendar-mobile-ab-final';
let timer=0, lastSection=null, observer=null;

const q=(s,r=document)=>r.querySelector(s);
const qa=(s,r=document)=>[...r.querySelectorAll(s)];
const tx=e=>(e?.textContent||'').replace(/\s+/g,' ').trim();

function findCalendar(){
  return document.getElementById('calendario');
}

function ensureHost(section){
  if(!section?.parentNode)return null;
  let host=section.parentNode.querySelector(':scope > #'+HOST);
  if(!host){
    host=document.createElement('div');
    host.id=HOST;
    host.setAttribute('data-ccf-calendar-ab-final','1');
    section.parentNode.insertBefore(host,section);
  }else if(host.nextElementSibling!==section){
    section.parentNode.insertBefore(host,section);
  }
  return host;
}

function style(shadow){
  if(shadow.querySelector('#ccf-ab-style'))return;
  const st=document.createElement('style');
  st.id='ccf-ab-style';
  st.textContent=`
    :host{display:block!important;width:100%!important;max-width:100%!important;min-width:0!important;margin:0 0 14px!important}
    *{box-sizing:border-box}
    .shell{width:100%;max-width:100%;overflow:hidden;background:#fff;border:2px solid #111827;border-radius:14px}
    .flag{display:inline-block;background:#111827;color:#fff;border-radius:999px;padding:4px 7px;font:900 8px/1 Arial,sans-serif;letter-spacing:.2px}
    .head{padding:10px}
    .title{margin:6px 0 0;font:800 17px/1.2 Arial,sans-serif;color:#172033}
    .sub{margin-top:3px;font:400 9px/1.3 Arial,sans-serif;color:#64748b}
    .actions{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:5px;margin-top:9px}
    .actions button{border:0;border-radius:8px;min-height:34px;background:#111827;color:#fff;font:800 10px Arial,sans-serif}
    .actions button.light{background:#e5e7eb;color:#172033}
    .kpis{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px;padding:0 10px 9px}
    .kpi{min-width:0;border:1px solid #e5e7eb;border-radius:9px;padding:7px}
    .kpi span{display:block;font:400 7px Arial,sans-serif;color:#64748b}
    .kpi strong{display:block;margin-top:3px;font:800 12px Arial,sans-serif;color:#172033;overflow-wrap:anywhere}
    .grid{display:grid!important;grid-template-columns:repeat(7,minmax(0,1fr))!important;width:100%!important;min-width:0!important;max-width:100%!important}
    .cell{min-width:0!important;width:100%!important;overflow:hidden!important;padding:0!important}
    .weekday{height:29px;display:flex;align-items:center;justify-content:center;background:#111827;color:#fff;font:900 8px Arial,sans-serif;white-space:nowrap}
    .day{display:block;width:100%;height:82px;min-width:0;border:0;border-right:1px solid #e5e7eb;border-bottom:1px solid #e5e7eb;background:#fff;text-align:left;padding:4px 3px;overflow:hidden;color:#334155}
    .day.out{background:#f8fafc;color:#94a3b8}
    .day.selected{outline:2px solid #111827;outline-offset:-2px}
    .num{display:flex;justify-content:space-between;gap:2px;font:800 10px Arial,sans-serif}
    .num small{font-size:6px}
    .event{display:block;margin-top:2px;padding:2px;border-radius:3px;font:700 6px/1.05 Arial,sans-serif;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .realin{background:#ecfdf5;color:#166534}.realout{background:#fef2f2;color:#991b1b}
    .planin{background:#eff6ff;color:#1d4ed8}.planout{background:#fff7ed;color:#9a3412}
    .other{background:#f5f3ff;color:#6d28b9}
    .mini{display:block;margin-top:2px;font:400 6px Arial,sans-serif;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:#64748b}
    .detail{padding:9px;display:grid;gap:6px}
    .box{border:1px solid #e5e7eb;border-radius:9px;padding:7px;font:400 9px/1.35 Arial,sans-serif;color:#334155}
    .box b{display:block;margin-bottom:3px;font-size:10px}
  `;
  shadow.appendChild(st);
}

function render(){
  const section=findCalendar();
  if(!section)return false;
  const source=q('.b232261-card',section);
  const grid=q('.b232261-grid.b232261-week',source);
  if(!source||!grid||grid.children.length<8)return false;

  const host=ensureHost(section);
  if(!host)return false;
  const shadow=host.shadowRoot||host.attachShadow({mode:'open'});
  style(shadow);
  const old=shadow.querySelector('.shell');
  if(old)old.remove();

  const shell=document.createElement('section');shell.className='shell';
  const head=document.createElement('div');head.className='head';
  const flag=document.createElement('span');flag.className='flag';flag.textContent='NUEVO CALENDARIO · PRUEBA A/B · B4.3.14';
  const title=document.createElement('div');title.className='title';title.textContent=tx(q('.b232261-head h2',source))||'Calendario';
  const sub=document.createElement('div');sub.className='sub';sub.textContent=tx(q('.b232261-sub',source))||'Vista mensual móvil';
  head.append(flag,title,sub);

  const actions=document.createElement('div');actions.className='actions';
  const buttons=qa('.b232261-actions button',source);
  ['‹ Anterior','Hoy','Siguiente ›'].forEach((label,i)=>{
    const b=document.createElement('button');b.textContent=label;
    if(i!==1)b.className='light';
    const src=buttons[i===0?0:i===1?2:1];
    if(src)b.onclick=()=>{src.click();setTimeout(render,120)};
    actions.appendChild(b);
  });
  head.appendChild(actions);shell.appendChild(head);

  const kpis=document.createElement('div');kpis.className='kpis';
  qa('.b232261-kpi',source).forEach(k=>{
    const c=document.createElement('div');c.className='kpi';
    const a=document.createElement('span');a.textContent=tx(q('span',k));
    const b=document.createElement('strong');b.textContent=tx(q('strong',k));
    c.append(a,b);kpis.appendChild(c);
  });
  shell.appendChild(kpis);

  const cal=document.createElement('div');cal.className='grid';
  [...grid.children].forEach((src,i)=>{
    const cell=document.createElement('div');cell.className='cell';
    if(i<7){
      const w=document.createElement('div');w.className='weekday';w.textContent=tx(src);cell.appendChild(w);
    }else{
      const d=document.createElement('button');d.type='button';d.className='day';
      if(src.classList.contains('out'))d.classList.add('out');
      if(src.classList.contains('selected'))d.classList.add('selected');
      const top=q('.b232261-day-top',src), num=document.createElement('div');num.className='num';
      const n=document.createElement('strong');n.textContent=tx(q('strong',top));num.appendChild(n);
      const sm=q('small',top);if(sm){const s=document.createElement('small');s.textContent=tx(sm);num.appendChild(s)}
      d.appendChild(num);
      qa('.b232261-event',src).forEach(ev=>{
        const e=document.createElement('span');e.className='event';
        const c=ev.className;
        e.classList.add(c.includes('real-in')?'realin':c.includes('real-out')?'realout':c.includes('plan-in')?'planin':c.includes('plan-out')?'planout':'other');
        e.textContent=tx(ev);d.appendChild(e);
      });
      qa('.b232261-mini,.b232261-more',src).forEach(m=>{const x=document.createElement('span');x.className='mini';x.textContent=tx(m);d.appendChild(x)});
      d.onclick=()=>{src.click();setTimeout(render,80)};
      cell.appendChild(d);
    }
    cal.appendChild(cell);
  });
  shell.appendChild(cal);

  const det=document.createElement('div');det.className='detail';
  const sd=q('.b232261-detail',source);
  if(sd)qa('.b232261-box',sd).forEach(box=>{
    const b=document.createElement('div');b.className='box';
    const h=q('h3',box);if(h){const hh=document.createElement('b');hh.textContent=tx(h);b.appendChild(hh)}
    b.appendChild(document.createTextNode(tx(box).replace(tx(h),'').trim()));
    det.appendChild(b);
  });
  shell.appendChild(det);
  shadow.appendChild(shell);
  return true;
}

function watch(){
  clearTimeout(timer);
  timer=setTimeout(()=>{
    const s=findCalendar();
    if(!s)return;
    if(lastSection!==s){
      lastSection=s;
      observer?.disconnect();
      observer=new MutationObserver(()=>watch());
      observer.observe(s,{childList:true,subtree:true});
    }
    render();
  },100);
}

function boot(){
  // Crucial: this file is loaded AFTER CCF-MOBILE-B4.3.js.
  // The calendar is moved later when the user selects the module.
  const root=document.body;
  new MutationObserver(()=>watch()).observe(root,{childList:true,subtree:true});
  watch();
  [250,500,1000,2000,4000,7000].forEach(ms=>setTimeout(watch,ms));
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
