/* CCF CALENDAR BOOTSTRAP DIRECT — B4.3.13
   Montaje directo sobre la shell móvil.
   Se ejecuta DESPUÉS de CCF-MOBILE-B4.3.js.
*/
(()=>{'use strict';
const HOST='ccf-bs-calendar-direct-b413';
let timer=0, mo=null;

const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const tx=e=>(e?.textContent||'').replace(/\s+/g,' ').trim();

function mobileRoot(){
  return document.getElementById('ccf-mobile-b43');
}
function sec(){
  return document.getElementById('calendario');
}
function getHost(s){
  const p=s?.parentElement;
  if(!p)return null;
  let h=p.querySelector(':scope > #'+HOST);
  if(!h){
    h=document.createElement('div');
    h.id=HOST;
    h.style.cssText='display:block!important;width:100%!important;max-width:100%!important;min-width:0!important;margin:0 0 14px!important;box-sizing:border-box!important';
    p.insertBefore(h,s);
  } else if(h.nextElementSibling!==s) p.insertBefore(h,s);
  return h;
}
function setup(h){
  if(h.shadowRoot)return h.shadowRoot;
  const sh=h.attachShadow({mode:'open'});
  const link=document.createElement('link');
  link.rel='stylesheet';
  link.href='https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap-grid.min.css';
  const st=document.createElement('style');
  st.textContent=`
  :host{display:block!important;width:100%!important;max-width:100%!important;min-width:0!important}
  *{box-sizing:border-box}
  .shell{width:100%;max-width:100%;border:2px solid #111827;border-radius:14px;background:#fff;overflow:hidden}
  .head{padding:11px 10px 8px}.badge{display:inline-block;background:#111827;color:#fff;border-radius:999px;padding:4px 7px;font-size:8px;font-weight:900;margin-bottom:6px}
  h2{margin:0;font-size:17px;color:#172033}.sub{margin-top:3px;color:#64748b;font-size:9px}
  .actions{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:5px;margin-top:9px}.actions button{border:0;border-radius:8px;min-height:32px;background:#111827;color:#fff;font-size:10px;font-weight:800}.actions .sec{background:#e5e7eb;color:#172033}
  .kpis{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px;padding:0 10px 9px}.kpi{border:1px solid #e5e7eb;border-radius:9px;padding:7px;min-width:0}.kpi span{display:block;font-size:7px;color:#64748b}.kpi strong{display:block;font-size:12px;margin-top:2px;overflow-wrap:anywhere}
  .grid{display:flex!important;flex-wrap:wrap!important;width:100%!important;min-width:0!important;margin:0!important}.col{flex:0 0 14.285714%!important;width:14.285714%!important;max-width:14.285714%!important;min-width:0!important;padding:0!important}
  .weekday{height:28px;display:flex;align-items:center;justify-content:center;background:#111827;color:#fff;font-size:8px;font-weight:900}
  .day{display:block;width:100%;height:82px;border:0;border-right:1px solid #e5e7eb;border-bottom:1px solid #e5e7eb;background:#fff;text-align:left;padding:4px 3px;overflow:hidden;color:#334155}.day.out{background:#f8fafc;color:#94a3b8}.day.selected{outline:2px solid #111827;outline-offset:-2px}
  .num{display:flex;justify-content:space-between;font-size:10px;font-weight:800}.num small{font-size:6px}.event{display:block;margin-top:2px;padding:2px;border-radius:3px;font-size:6px;line-height:1.05;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .in{background:#ecfdf5;color:#166534}.out{background:#fef2f2;color:#991b1b}.pin{background:#eff6ff;color:#1d4ed8}.pout{background:#fff7ed;color:#9a3412}.gen{background:#f5f3ff;color:#6d28b9}.debt{background:#eef2ff;color:#3730a3}.mini{display:block;margin-top:2px;font-size:6px;color:#64748b;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .detail{display:grid;gap:6px;padding:9px}.box{border:1px solid #e5e7eb;border-radius:9px;padding:7px;font-size:9px}.box h3{margin:0 0 4px;font-size:10px}
  `;
  sh.append(link,st);return sh;
}
function render(){
  const root=mobileRoot(),s=sec();
  if(!root||!s||!root.contains(s))return false;
  const source=$('.b232261-card',s),grid=$('.b232261-grid.b232261-week',source);
  if(!source||!grid||grid.children.length<8)return false;
  const h=getHost(s),sh=setup(h);
  const old=sh.querySelector('.shell');if(old)old.remove();
  const shell=document.createElement('div');shell.className='shell';
  const head=document.createElement('div');head.className='head';
  const badge=document.createElement('div');badge.className='badge';badge.textContent='NUEVO CALENDARIO BOOTSTRAP · PRUEBA A/B · B4.3.13';
  const title=document.createElement('h2');title.textContent=tx($('.b232261-head h2',source))||'Calendario';
  const sub=document.createElement('div');sub.className='sub';sub.textContent=tx($('.b232261-sub',source))||'Vista mensual';
  head.append(badge,title,sub);
  const actions=document.createElement('div');actions.className='actions';const sb=$$('.b232261-actions button',source);
  ['‹','›','Hoy','↻'].forEach((lab,i)=>{const b=document.createElement('button');b.textContent=lab;if(i!==2)b.className='sec';if(sb[i])b.onclick=()=>{sb[i].click();setTimeout(render,100)};actions.appendChild(b)});
  head.appendChild(actions);shell.appendChild(head);
  const kp=document.createElement('div');kp.className='kpis';$$('.b232261-kpi',source).forEach(k=>{const c=document.createElement('div');c.className='kpi';const a=document.createElement('span');a.textContent=tx($('span',k));const b=document.createElement('strong');b.textContent=tx($('strong',k));c.append(a,b);kp.append(c)});shell.appendChild(kp);
  const cal=document.createElement('div');cal.className='row g-0 grid';
  [...grid.children].forEach((cell,i)=>{const col=document.createElement('div');col.className='col';
    if(i<7){const w=document.createElement('div');w.className='weekday';w.textContent=tx(cell);col.append(w)}
    else{const d=document.createElement('button');d.className='day';d.type='button';if(cell.classList.contains('out'))d.classList.add('out');if(cell.classList.contains('selected'))d.classList.add('selected');
      const top=$('.b232261-day-top',cell),n=document.createElement('div');n.className='num';const st=document.createElement('strong');st.textContent=tx($('strong',top));n.append(st);const sm=$('small',top);if(sm){const x=document.createElement('small');x.textContent=tx(sm);n.append(x)}d.append(n);
      $$('.b232261-event',cell).forEach(ev=>{const e=document.createElement('span');e.className='event';const c=ev.className;e.classList.add(c.includes('real-in')?'in':c.includes('real-out')?'out':c.includes('plan-in')?'pin':c.includes('plan-out')?'pout':c.includes('gen')?'gen':c.includes('debt')?'debt':'pout');e.textContent=tx(ev);d.append(e)});
      $$('.b232261-mini,.b232261-more',cell).forEach(mi=>{const m=document.createElement('span');m.className='mini';m.textContent=tx(mi);d.append(m)});
      d.onclick=()=>{cell.click();setTimeout(render,80)};col.append(d)}
    cal.append(col)});
  shell.append(cal);
  const detail=document.createElement('div');detail.className='detail';const sd=$('.b232261-detail',source);
  if(sd)$$('.b232261-box',sd).forEach(box=>{const d=document.createElement('div');d.className='box';const h3=$('h3',box);if(h3){const hh=document.createElement('h3');hh.textContent=tx(h3);d.append(hh)}const body=document.createElement('div');body.textContent=tx(box).replace(tx(h3),'').trim();d.append(body);detail.append(d)});
  shell.append(detail);sh.append(shell);return true;
}
function watch(){
  if(mo)mo.disconnect();
  mo=new MutationObserver(()=>{clearTimeout(timer);timer=setTimeout(render,80)});
  mo.observe(document.body,{childList:true,subtree:true});
  [0,150,400,800,1500,2500].forEach(ms=>setTimeout(render,ms));
}
function start(){watch();render()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
