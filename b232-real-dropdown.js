/* B2.32 — DESPLEGABLE REAL
   Se ejecuta DESPUÉS de B2.19/B2.27 y utiliza los handlers originales.
   No reemplaza módulos ni implementa navegación paralela. */
(function(){
  'use strict';
  const SECONDARY=[
    ['deudas','Deudas','Deudas y cuotas'],
    ['cuentas','Cuentas','Liquidez bancaria'],
    ['operaciones','Operaciones','Situación operativa'],
    ['planificacion','Planificación','Plan financiero'],
    ['ia-financiera','IA Financiera','Análisis financiero'],
    ['ingresos','Motor Multifuente','Generación y cobro'],
    ['jornadas','Control de Jornada','Integración financiera']
  ];
  function style(){
    if(document.getElementById('b232Style'))return;
    const s=document.createElement('style');s.id='b232Style';
    s.textContent=`
      html,body{max-width:100%;overflow-x:hidden!important}
      #app{max-width:100%;min-width:0!important}
      #b219NavShell{display:flex!important;align-items:center!important;width:100%!important;gap:8px!important}
      #b219NavShell>.tabs{flex:1 1 auto!important;min-width:0!important;overflow-x:auto!important;overflow-y:visible!important;display:flex!important;flex-wrap:nowrap!important;gap:8px!important}
      #b219NavShell>.tabs>button{flex:0 0 auto!important;white-space:nowrap!important}
      #b219MenuWrap{display:block!important;flex:0 0 auto!important;position:relative!important;z-index:2000!important}
      #b219MenuBtn{display:block!important;white-space:nowrap!important;cursor:pointer!important}
      #b219Menu{z-index:9999!important;max-width:calc(100vw - 20px)!important}
      .b232-hidden{display:none!important}
      @media(max-width:480px){
        #b219NavShell{gap:5px!important}
        #b219NavShell>.tabs{gap:5px!important}
        #b219MenuBtn{padding:10px!important}
        #b219Menu{right:0!important;min-width:225px!important}
      }`;
    document.head.appendChild(s);
  }
  function install(){
    const nav=document.getElementById('b219NavShell');
    const tabs=nav?.querySelector('.tabs')||document.querySelector('#app>.tabs');
    const menu=document.getElementById('b219Menu');
    const more=document.getElementById('b219MenuBtn');
    if(!tabs||!menu||!more)return false;
    style();

    // Hide secondary buttons from the horizontal row, but KEEP them in the DOM.
    SECONDARY.forEach(([id])=>{
      const b=tabs.querySelector(`button[data-tab="${id}"]`);
      if(b)b.classList.add('b232-hidden');
    });

    if(menu.dataset.b232Installed==='1')return true;
    menu.dataset.b232Installed='1';

    const title=document.createElement('div');
    title.textContent='MÓDULOS DEL SISTEMA';
    title.style.cssText='padding:6px 9px 7px;color:#64748b;font-size:10px;font-weight:800;letter-spacing:.05em';
    menu.replaceChildren(title);

    SECONDARY.forEach(([id,label,desc],i)=>{
      if(i===5){
        const sep=document.createElement('div');sep.style.cssText='height:1px;background:#e5e7eb;margin:6px 3px';menu.appendChild(sep);
      }
      const b=document.createElement('button');
      b.type='button';
      b.className='b232-menu-item';
      b.style.cssText='display:block;width:100%;text-align:left;border:0;background:#fff;border-radius:9px;padding:10px 11px;color:#111827;font-weight:800;cursor:pointer';
      b.innerHTML=`${label}<small style="display:block;color:#64748b;font-weight:500;margin-top:2px">${desc}</small>`;
      b.addEventListener('click',(e)=>{
        e.preventDefault();e.stopPropagation();
        // Use the ORIGINAL module button when it exists.
        const original=tabs.querySelector(`button[data-tab="${id}"]`);
        if(original){
          original.click();
        }else if(id==='ingresos'||id==='jornadas'){
          // B2.19 already provides these through its original show() handler.
          const evt=new CustomEvent('b232-open',{detail:id});
          document.dispatchEvent(evt);
          if(typeof window.b219Open==='function')window.b219Open(id);
        }
        menu.classList.remove('open');
        more.classList.remove('open');
        more.setAttribute('aria-expanded','false');
      });
      menu.appendChild(b);
    });
    return true;
  }

  // For Motor Multifuente / Jornada, fall back to the original B2.19 show() through
  // its existing menu event if available.
  document.addEventListener('b232-open',e=>{
    const id=e.detail;
    if(id!=='ingresos'&&id!=='jornadas')return;
    const existing=document.querySelector(`#b219Menu [data-b219-open="${id}"]`);
    if(existing)existing.click();
  });

  let n=0;
  const timer=setInterval(()=>{
    n++;
    if(install()||n>80)clearInterval(timer);
  },100);

  // Keep the fix resilient if a legacy module re-adds a tab later.
  const observer=new MutationObserver(()=>{if(document.getElementById('b219Menu')&&!document.getElementById('b232Style'))style();install()});
  observer.observe(document.getElementById('app')||document.body,{childList:true,subtree:true});
})();