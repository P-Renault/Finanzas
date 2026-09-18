/* FINANZAS B2.33 — NAV HOTFIX
   Espera a que B2.19 termine su carga secuencial y luego transforma
   su menú "Más" en el desplegable único del sistema.
   No reemplaza módulos ni crea datos financieros.
*/
(function () {
  'use strict';

  const ITEMS = [
    ['deudas','Deudas','Deudas y cuotas'],
    ['cuentas','Cuentas','Liquidez bancaria'],
    ['operaciones','Operaciones','Situación operativa'],
    ['planificacion','Planificación','Plan financiero'],
    ['ia-financiera','IA Financiera','Análisis financiero'],
    ['ingresos','Motor Multifuente','Generación y cobro'],
    ['jornadas','Control de Jornada','Integración financiera']
  ];

  function style() {
    if (document.getElementById('b233Style')) return;
    const s = document.createElement('style');
    s.id = 'b233Style';
    s.textContent = `
      #b219NavShell{display:flex!important;align-items:center!important;width:100%!important;gap:8px!important}
      #b219NavShell>.tabs{display:flex!important;flex:1 1 auto!important;min-width:0!important;flex-wrap:nowrap!important;overflow-x:auto!important;gap:8px!important}
      #b219NavShell>.tabs>button{flex:0 0 auto!important;white-space:nowrap!important}
      #b219MenuWrap{display:block!important;flex:0 0 auto!important;position:relative!important;z-index:5000!important}
      #b219MenuBtn{display:block!important;white-space:nowrap!important;cursor:pointer!important}
      #b219Menu{z-index:99999!important;min-width:245px!important;max-width:calc(100vw - 20px)!important}
      .b233-hide-secondary{display:none!important}
      .b233-menu-item{display:block;width:100%;text-align:left;border:0;background:#fff;border-radius:9px;padding:10px 11px;color:#111827;font-weight:800;cursor:pointer}
      .b233-menu-item:hover{background:#f1f5f9}
      .b233-menu-item small{display:block;color:#64748b;font-weight:500;margin-top:2px}
      .b233-menu-title{padding:6px 9px 7px;color:#64748b;font-size:10px;font-weight:800;letter-spacing:.05em}
      .b233-sep{height:1px;background:#e5e7eb;margin:6px 3px}
      @media(max-width:480px){
        #b219NavShell{gap:5px!important}
        #b219NavShell>.tabs{gap:5px!important}
        #b219MenuBtn{padding:10px 11px!important}
      }
    `;
    document.head.appendChild(s);
  }

  function install() {
    const nav = document.getElementById('b219NavShell');
    const tabs = nav && nav.querySelector('.tabs');
    const menu = document.getElementById('b219Menu');
    const more = document.getElementById('b219MenuBtn');
    if (!nav || !tabs || !menu || !more) return false;

    style();

    ITEMS.forEach(([id]) => {
      const original = tabs.querySelector(`button[data-tab="${id}"]`);
      if (original) original.classList.add('b233-hide-secondary');
    });

    if (menu.dataset.b233Ready === '1') return true;
    menu.dataset.b233Ready = '1';
    menu.replaceChildren();

    const title = document.createElement('div');
    title.className = 'b233-menu-title';
    title.textContent = 'MÓDULOS DEL SISTEMA';
    menu.appendChild(title);

    ITEMS.forEach(([id,label,desc], i) => {
      if (i === 5) {
        const sep = document.createElement('div');
        sep.className = 'b233-sep';
        menu.appendChild(sep);
      }
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'b233-menu-item';
      b.innerHTML = `${label}<small>${desc}</small>`;
      b.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        const original = tabs.querySelector(`button[data-tab="${id}"]`);
        if (original) {
          original.click();
        } else {
          // B2.19's original menu remains the fallback for these two modules.
          const legacy = menu.querySelector(`[data-b219-open="${id}"]`);
          if (legacy) legacy.click();
        }

        menu.classList.remove('open');
        more.classList.remove('open');
        more.setAttribute('aria-expanded','false');
      });
      menu.appendChild(b);
    });
    return true;
  }

  let attempts = 0;
  const timer = setInterval(() => {
    attempts++;
    if (install() || attempts >= 400) clearInterval(timer);
  }, 150);

  const observer = new MutationObserver(() => {
    if (document.getElementById('b219Menu')) install();
  });
  observer.observe(document.body, {childList:true, subtree:true});
})();
