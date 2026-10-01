/* CCF CALENDAR MOBILE — PRUEBA MÍNIMA B4.3.15
   Objetivo: prueba binaria de ejecución y montaje.
   No usa Bootstrap.
   No modifica B232.26.4.
   No calcula datos financieros.
*/
(() => {
  'use strict';

  const ID = 'ccf-calendar-minimal-probe';

  function mount() {
    const root = document.getElementById('ccf-mobile-b43');
    const section = document.getElementById('calendario');

    // La prueba solo se monta cuando la shell móvil y el módulo calendario existen.
    if (!root || !section) return false;

    let probe = document.getElementById(ID);

    if (!probe) {
      probe = document.createElement('section');
      probe.id = ID;

      probe.style.cssText = [
        'display:block',
        'width:100%',
        'max-width:100%',
        'min-width:0',
        'box-sizing:border-box',
        'margin:0 0 10px',
        'padding:12px',
        'background:#fff7ed',
        'border:3px solid #f97316',
        'border-radius:12px',
        'overflow:hidden',
        'font-family:Arial,sans-serif',
        'position:relative',
        'z-index:9999'
      ].join(';');

      probe.innerHTML = `
        <div style="font-size:14px;font-weight:900;color:#9a3412;margin-bottom:4px;">
          PRUEBA MÍNIMA CALENDARIO · B4.3.15
        </div>
        <div style="font-size:11px;color:#7c2d12;margin-bottom:8px;">
          OK: CCF-MOBILE-B4.3.js y el montaje del módulo móvil están ejecutándose.
        </div>
        <div style="
          display:grid;
          grid-template-columns:repeat(7,minmax(0,1fr));
          width:100%;
          min-width:0;
          gap:2px;
        ">
          ${['DOM','LUN','MAR','MIÉ','JUE','VIE','SÁB'].map(d => `
            <div style="
              min-width:0;
              box-sizing:border-box;
              padding:7px 2px;
              text-align:center;
              background:#f97316;
              color:#fff;
              font-size:9px;
              font-weight:900;
            ">${d}</div>
          `).join('')}
        </div>
      `;

      section.parentNode.insertBefore(probe, section);
    }

    return true;
  }

  let tries = 0;
  const timer = setInterval(() => {
    if (mount() || ++tries >= 30) clearInterval(timer);
  }, 250);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount, { once: true });
  } else {
    mount();
  }

  window.CCFCalendarMinimalTest = {
    version: 'B4.3.15',
    mount
  };
})();
