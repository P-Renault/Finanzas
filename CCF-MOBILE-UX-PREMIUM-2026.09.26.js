/* =========================================================
   CCF MOBILE UX PREMIUM
   Version: 2026.09.26
   Objetivo: modernizar y optimizar CCF para móviles sin tocar
   la lógica financiera ni las tablas de Supabase.
   ========================================================= */
(function () {
  'use strict';

  if (window.__CCF_MOBILE_UX_PREMIUM_20260926__) return;
  window.__CCF_MOBILE_UX_PREMIUM_20260926__ = true;

  var VERSION = 'CCF Mobile UX Premium · 2026.09.26';

  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    } else {
      fn();
    }
  }

  function injectStyle() {
    if (document.getElementById('ccf-mobile-ux-premium-style')) return;

    var style = document.createElement('style');
    style.id = 'ccf-mobile-ux-premium-style';
    style.textContent = `
      :root{
        --ccf-navy:#111827;
        --ccf-navy-2:#172033;
        --ccf-bg:#f4f6f8;
        --ccf-card:#ffffff;
        --ccf-border:#e5e7eb;
        --ccf-muted:#64748b;
        --ccf-green:#0f766e;
        --ccf-green-bg:#ecfdf5;
        --ccf-red:#b91c1c;
        --ccf-red-bg:#fef2f2;
        --ccf-blue:#2563eb;
        --ccf-shadow:0 8px 26px rgba(15,23,42,.07);
      }

      /* Base */
      body.ccf-mobile-ux{
        background:var(--ccf-bg);
        -webkit-tap-highlight-color:transparent;
      }
      body.ccf-mobile-ux .topbar{
        background:linear-gradient(145deg,#0f172a,#172033);
        padding:18px 16px 17px;
        position:relative;
        z-index:20;
        box-shadow:0 3px 18px rgba(15,23,42,.16);
      }
      body.ccf-mobile-ux .topbar h1{
        font-size:23px;
        letter-spacing:-.02em;
      }
      body.ccf-mobile-ux .topbar p{
        max-width:300px;
        line-height:1.35;
      }
      body.ccf-mobile-ux .container{
        max-width:1180px;
        padding:14px;
      }

      /* Touch */
      body.ccf-mobile-ux button,
      body.ccf-mobile-ux a,
      body.ccf-mobile-ux select,
      body.ccf-mobile-ux input{
        touch-action:manipulation;
      }

      /* Desktop polish */
      body.ccf-mobile-ux .card,
      body.ccf-mobile-ux .panel,
      body.ccf-mobile-ux .metric,
      body.ccf-mobile-ux .kpi-card,
      body.ccf-mobile-ux .executive-chart,
      body.ccf-mobile-ux .executive-insights article{
        border:1px solid var(--ccf-border);
        box-shadow:var(--ccf-shadow);
      }
      body.ccf-mobile-ux .tabs{
        scrollbar-width:none;
      }
      body.ccf-mobile-ux .tabs::-webkit-scrollbar{display:none}
      body.ccf-mobile-ux .tabs button{
        transition:transform .15s ease,box-shadow .15s ease,background .15s ease;
      }
      body.ccf-mobile-ux .tabs button:active{
        transform:scale(.97);
      }

      /* Dashboard hierarchy */
      body.ccf-mobile-ux #financial-control .summary-header{
        border-radius:18px;
        padding:18px;
        background:linear-gradient(145deg,#fff,#f8fafc);
        border:1px solid var(--ccf-border);
        box-shadow:var(--ccf-shadow);
        margin-bottom:12px;
      }
      body.ccf-mobile-ux #financial-control .summary-header h2{
        margin-bottom:4px;
      }
      body.ccf-mobile-ux #financial-control .kpi-card{
        border-radius:16px;
        padding:15px;
        background:#fff;
      }
      body.ccf-mobile-ux #financial-control .kpi-card strong{
        letter-spacing:-.02em;
      }
      body.ccf-mobile-ux #financial-control .panel{
        border-radius:16px;
        background:#fff;
      }

      /* Mobile navigation drawer */
      #ccf-mobile-more{
        display:none;
      }
      #ccf-mobile-more.ccf-open{
        display:block;
      }
      #ccf-mobile-more .ccf-more-backdrop{
        position:fixed;
        inset:0;
        background:rgba(15,23,42,.52);
        z-index:1000000;
        backdrop-filter:blur(2px);
      }
      #ccf-mobile-more .ccf-more-sheet{
        position:fixed;
        left:0;
        right:0;
        bottom:0;
        z-index:1000001;
        background:#fff;
        border-radius:22px 22px 0 0;
        padding:14px 14px calc(18px + env(safe-area-inset-bottom));
        box-shadow:0 -16px 45px rgba(15,23,42,.22);
        max-height:82vh;
        overflow:auto;
      }
      #ccf-mobile-more .ccf-more-handle{
        width:42px;height:4px;border-radius:99px;background:#cbd5e1;
        margin:0 auto 13px;
      }
      #ccf-mobile-more .ccf-more-title{
        display:flex;align-items:center;justify-content:space-between;
        gap:12px;margin:0 2px 12px;
      }
      #ccf-mobile-more .ccf-more-title strong{font-size:17px;color:#111827}
      #ccf-mobile-more .ccf-more-close{
        width:38px;height:38px;padding:0;border-radius:50%;
        background:#f1f5f9;color:#111827;font-size:20px;
      }
      #ccf-mobile-more .ccf-more-grid{
        display:grid;grid-template-columns:1fr 1fr;gap:9px;
      }
      #ccf-mobile-more .ccf-more-grid button{
        min-height:50px;padding:10px;border-radius:13px;
        background:#f1f5f9;color:#111827;text-align:left;
        font-size:13px;font-weight:800;
      }
      #ccf-mobile-more .ccf-more-grid button.active{
        background:#111827;color:#fff;
      }

      /* Mobile bottom navigation */
      #ccf-mobile-bottom{
        display:none;
      }

      /* Collapsible dashboard sections */
      .ccf-mobile-collapse{
        position:relative;
      }
      .ccf-mobile-collapse > .ccf-mobile-section-toggle{
        display:none;
      }

      /* Forms */
      body.ccf-mobile-ux input,
      body.ccf-mobile-ux select{
        box-sizing:border-box;
        min-height:46px;
      }
      body.ccf-mobile-ux button{
        min-height:44px;
      }

      /* Mobile */
      @media (max-width:720px){
        body.ccf-mobile-ux{
          padding-bottom:78px;
        }
        body.ccf-mobile-ux .container{
          padding:10px 10px 24px;
        }
        body.ccf-mobile-ux .topbar{
          padding:15px 14px 14px;
        }
        body.ccf-mobile-ux .topbar h1{
          font-size:22px;
        }
        body.ccf-mobile-ux .topbar p{
          font-size:12px;
        }
        body.ccf-mobile-ux #logoutBtn{
          min-width:66px;
          min-height:42px;
          padding:8px 12px;
        }

        /* Replace horizontal module wall with compact bottom navigation */
        body.ccf-mobile-ux .tabs{
          position:sticky;
          top:0;
          z-index:100;
          margin:0 -10px 12px;
          padding:8px 10px;
          background:rgba(244,246,248,.96);
          backdrop-filter:blur(12px);
          border-bottom:1px solid rgba(226,232,240,.9);
          gap:7px;
          overflow:visible;
        }
        body.ccf-mobile-ux .tabs button{
          display:none;
        }
        body.ccf-mobile-ux .tabs button[data-tab="dashboard"],
        body.ccf-mobile-ux .tabs button[data-tab="movimientos"],
        body.ccf-mobile-ux .tabs button[data-tab="deudas"],
        body.ccf-mobile-ux .tabs button[data-tab="cuentas"]{
          display:flex;
          flex:1 1 0;
          justify-content:center;
          align-items:center;
          min-width:0;
          min-height:44px;
          padding:8px 7px;
          border-radius:13px;
          font-size:12px;
        }
        body.ccf-mobile-ux .tabs .ccf-mobile-more-button{
          display:flex;
          flex:0 0 48px;
          justify-content:center;
          align-items:center;
          min-height:44px;
          padding:8px;
          border-radius:13px;
          background:#e2e8f0;
          color:#111827;
          font-size:12px;
          font-weight:800;
        }
        body.ccf-mobile-ux .tabs button.active{
          box-shadow:0 4px 12px rgba(15,23,42,.14);
        }

        /* Bottom navigation */
        #ccf-mobile-bottom{
          position:fixed;
          display:grid;
          grid-template-columns:repeat(5,1fr);
          left:0;right:0;bottom:0;
          z-index:999999;
          padding:7px 8px calc(7px + env(safe-area-inset-bottom));
          background:rgba(255,255,255,.96);
          backdrop-filter:blur(14px);
          border-top:1px solid #e2e8f0;
          box-shadow:0 -8px 28px rgba(15,23,42,.10);
        }
        #ccf-mobile-bottom button{
          min-height:52px;
          padding:6px 3px;
          border-radius:12px;
          background:transparent;
          color:#64748b;
          font-size:10px;
          font-weight:800;
          line-height:1.15;
          display:flex;
          flex-direction:column;
          align-items:center;
          justify-content:center;
          gap:3px;
        }
        #ccf-mobile-bottom button .ccf-nav-icon{
          font-size:18px;
          line-height:1;
        }
        #ccf-mobile-bottom button.active{
          background:#111827;
          color:#fff;
        }

        /* Dashboard */
        body.ccf-mobile-ux #financial-control{
          width:100%;
        }
        body.ccf-mobile-ux #financial-control .summary-header{
          padding:15px;
          border-radius:16px;
        }
        body.ccf-mobile-ux #financial-control .summary-header h2{
          font-size:21px;
        }
        body.ccf-mobile-ux #financial-control .kpi-grid{
          display:grid;
          grid-template-columns:1fr 1fr;
          gap:8px;
        }
        body.ccf-mobile-ux #financial-control .kpi-card{
          min-height:92px;
          padding:13px;
          border-radius:15px;
        }
        body.ccf-mobile-ux #financial-control .kpi-card span{
          font-size:11px;
          line-height:1.25;
        }
        body.ccf-mobile-ux #financial-control .kpi-card strong{
          font-size:19px;
          margin-top:7px;
        }
        body.ccf-mobile-ux .daily-margin,
        body.ccf-mobile-ux .projection,
        body.ccf-mobile-ux .decision-grid,
        body.ccf-mobile-ux .executive-dashboard{
          margin-top:10px;
        }
        body.ccf-mobile-ux .panel-heading{
          gap:8px;
        }
        body.ccf-mobile-ux .panel-heading h3{
          font-size:17px;
        }

        /* Monthly summary */
        body.ccf-mobile-ux .ccf-monthly-summary{
          border-radius:17px;
          padding:14px;
          margin-bottom:10px;
        }
        body.ccf-mobile-ux .ccf-monthly-summary-head{
          margin-bottom:13px;
        }
        body.ccf-mobile-ux .ccf-monthly-summary-head h2{
          font-size:17px;
          line-height:1.2;
        }
        body.ccf-mobile-ux .ccf-monthly-kpis{
          grid-template-columns:1fr 1fr;
          gap:7px;
          margin-bottom:12px;
        }
        body.ccf-mobile-ux .ccf-monthly-kpi{
          padding:11px;
          border-radius:12px;
        }
        body.ccf-mobile-ux .ccf-monthly-kpi span{
          font-size:10px;
        }
        body.ccf-mobile-ux .ccf-monthly-kpi strong{
          font-size:16px;
        }
        body.ccf-mobile-ux .ccf-monthly-future-grid{
          grid-template-columns:1fr;
        }

        /* Forms/cards */
        body.ccf-mobile-ux .card{
          padding:14px;
          border-radius:16px;
          margin-bottom:10px;
        }
        body.ccf-mobile-ux .card h2{
          font-size:18px;
        }
        body.ccf-mobile-ux .grid2{
          grid-template-columns:1fr;
          gap:10px;
        }
        body.ccf-mobile-ux .form-actions{
          display:grid;
          grid-template-columns:1fr;
        }
        body.ccf-mobile-ux .form-actions button{
          width:100%;
        }

        /* Lists */
        body.ccf-mobile-ux .row{
          padding:13px 0;
          gap:10px;
        }
        body.ccf-mobile-ux .row-right{
          width:100%;
        }
        body.ccf-mobile-ux .actions{
          width:100%;
          display:grid;
          grid-template-columns:repeat(2,minmax(0,1fr));
        }
        body.ccf-mobile-ux .actions button{
          width:100%;
          min-height:42px;
        }

        /* Calendar */
        body.ccf-mobile-ux .calendar-card{
          border-radius:16px;
        }

        /* Executive dashboard becomes progressive disclosure */
        body.ccf-mobile-ux .executive-head{
          padding:14px;
          border-radius:16px;
        }
        body.ccf-mobile-ux .executive-insights{
          display:grid;
          grid-template-columns:1fr 1fr;
          gap:8px;
        }
        body.ccf-mobile-ux .executive-insights article{
          padding:12px;
          border-radius:14px;
        }
        body.ccf-mobile-ux .executive-insights article span{
          font-size:10px;
        }
        body.ccf-mobile-ux .executive-insights article strong{
          font-size:13px;
          line-height:1.3;
        }
        body.ccf-mobile-ux .executive-charts{
          display:block;
        }
        body.ccf-mobile-ux .executive-chart{
          border-radius:15px;
          margin-top:8px;
          overflow:hidden;
        }
        body.ccf-mobile-ux .executive-chart h3{
          font-size:15px;
        }
        body.ccf-mobile-ux .executive-chart p{
          font-size:11px;
        }

        /* Manual */
        body.ccf-mobile-ux .ccf-manual-access{
          margin:8px 0 12px;
        }
        body.ccf-mobile-ux .ccf-manual-button{
          min-height:44px;
          border-radius:13px;
        }

        /* Prevent accidental horizontal overflow */
        body.ccf-mobile-ux,
        body.ccf-mobile-ux #app,
        body.ccf-mobile-ux .tab{
          max-width:100%;
          overflow-x:hidden;
        }
      }

      @media(max-width:380px){
        body.ccf-mobile-ux #financial-control .kpi-card strong{
          font-size:17px;
        }
        #ccf-mobile-bottom button{
          font-size:9px;
        }
      }
    `;
    document.head.appendChild(style);
  }

  var icons = {
    dashboard:'⌂',
    movimientos:'↕',
    deudas:'▣',
    cuentas:'▤',
    more:'•••',
    futuros:'◷',
    calendario:'▦',
    ahorro:'◎',
    operaciones:'⚙',
    planificacion:'◈',
    presupuesto:'▤'
  };

  function tabLabel(tab) {
    var b = document.querySelector('.tabs button[data-tab="' + tab + '"]');
    return b ? (b.textContent || tab).trim() : tab;
  }

  function activateTab(tab) {
    var b = document.querySelector('.tabs button[data-tab="' + tab + '"]');
    if (b) {
      b.click();
      updateBottomState();
      closeMore();
    }
  }

  function buildMoreSheet() {
    if (document.getElementById('ccf-mobile-more')) return;

    var root = document.createElement('div');
    root.id = 'ccf-mobile-more';
    root.innerHTML = `
      <div class="ccf-more-backdrop" data-ccf-more-close="1"></div>
      <div class="ccf-more-sheet" role="dialog" aria-modal="true" aria-label="Más módulos">
        <div class="ccf-more-handle"></div>
        <div class="ccf-more-title">
          <strong>Todos los módulos</strong>
          <button type="button" class="ccf-more-close" data-ccf-more-close="1" aria-label="Cerrar">×</button>
        </div>
        <div class="ccf-more-grid"></div>
      </div>
    `;
    document.body.appendChild(root);

    root.addEventListener('click', function (e) {
      var close = e.target.closest('[data-ccf-more-close]');
      if (close) {
        closeMore();
        return;
      }
      var btn = e.target.closest('button[data-ccf-more-tab]');
      if (btn) activateTab(btn.getAttribute('data-ccf-more-tab'));
    });

    refreshMoreSheet();
  }

  function refreshMoreSheet() {
    var grid = document.querySelector('#ccf-mobile-more .ccf-more-grid');
    if (!grid) return;

    var tabs = Array.prototype.slice.call(
      document.querySelectorAll('.tabs button[data-tab]')
    );
    grid.innerHTML = '';

    tabs.forEach(function (b) {
      var tab = b.getAttribute('data-tab');
      var button = document.createElement('button');
      button.type = 'button';
      button.setAttribute('data-ccf-more-tab', tab);
      button.innerHTML = '<span style="font-size:17px;margin-right:7px">' +
        (icons[tab] || '•') + '</span>' + (b.textContent || tab).trim();
      if (b.classList.contains('active')) button.classList.add('active');
      grid.appendChild(button);
    });
  }

  function openMore() {
    buildMoreSheet();
    refreshMoreSheet();
    var root = document.getElementById('ccf-mobile-more');
    if (root) root.classList.add('ccf-open');
    document.body.style.overflow = 'hidden';
  }

  function closeMore() {
    var root = document.getElementById('ccf-mobile-more');
    if (root) root.classList.remove('ccf-open');
    document.body.style.overflow = '';
  }

  function addMoreButton() {
    var tabs = document.querySelector('.tabs');
    if (!tabs || tabs.querySelector('.ccf-mobile-more-button')) return;

    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'ccf-mobile-more-button';
    b.setAttribute('aria-label', 'Más módulos');
    b.textContent = 'Más';
    b.addEventListener('click', openMore);
    tabs.appendChild(b);
  }

  function buildBottomNav() {
    if (document.getElementById('ccf-mobile-bottom')) return;

    var root = document.createElement('nav');
    root.id = 'ccf-mobile-bottom';
    root.setAttribute('aria-label', 'Navegación principal móvil');

    [
      ['dashboard','Resumen'],
      ['movimientos','Movimientos'],
      ['deudas','Deudas'],
      ['cuentas','Cuentas'],
      ['more','Más']
    ].forEach(function (item) {
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('data-ccf-bottom-tab', item[0]);
      b.innerHTML =
        '<span class="ccf-nav-icon">' + (icons[item[0]] || '•') + '</span>' +
        '<span>' + item[1] + '</span>';
      b.addEventListener('click', function () {
        if (item[0] === 'more') {
          openMore();
        } else {
          activateTab(item[0]);
        }
      });
      root.appendChild(b);
    });

    document.body.appendChild(root);
  }

  function updateBottomState() {
    var active = document.querySelector('.tabs button.active');
    var current = active ? active.getAttribute('data-tab') : 'dashboard';

    document.querySelectorAll('#ccf-mobile-bottom button[data-ccf-bottom-tab]')
      .forEach(function (b) {
        b.classList.toggle(
          'active',
          b.getAttribute('data-ccf-bottom-tab') === current
        );
      });

    refreshMoreSheet();
  }

  function improveHeadings() {
    var map = [
      ['#dashboard','Resumen'],
      ['#movimientos','Movimientos'],
      ['#futuros','Pagos futuros'],
      ['#calendario','Calendario'],
      ['#ahorro','Ahorro'],
      ['#deudas','Deudas'],
      ['#cuentas','Cuentas'],
      ['#operaciones','Operaciones'],
      ['#planificacion','Planificación'],
      ['#presupuesto','Presupuesto']
    ];

    map.forEach(function (item) {
      var section = document.querySelector(item[0]);
      if (section) section.setAttribute('data-ccf-section', item[1]);
    });
  }

  function observeTabs() {
    var tabs = document.querySelector('.tabs');
    if (!tabs || tabs.__ccfObserved) return;
    tabs.__ccfObserved = true;

    tabs.addEventListener('click', function () {
      setTimeout(updateBottomState, 30);
    });

    if (window.MutationObserver) {
      var observer = new MutationObserver(function () {
        updateBottomState();
      });
      observer.observe(tabs, { childList:true, subtree:true, attributes:true, attributeFilter:['class'] });
    }
  }

  function install() {
    document.body.classList.add('ccf-mobile-ux');
    injectStyle();
    improveHeadings();

    var tabs = document.querySelector('.tabs');
    if (tabs) {
      addMoreButton();
      buildBottomNav();
      buildMoreSheet();
      observeTabs();
      updateBottomState();
    }
  }

  ready(function () {
    install();

    /* El portal/auth puede mostrar #app después del login. */
    if (window.MutationObserver && document.body) {
      var observer = new MutationObserver(function () {
        var tabs = document.querySelector('.tabs');
        if (tabs) {
          addMoreButton();
          buildBottomNav();
          buildMoreSheet();
          observeTabs();
          updateBottomState();
        }
      });
      observer.observe(document.body, { childList:true, subtree:true });
    }

    window.CCFMobileUX = {
      version: VERSION,
      openMore: openMore,
      closeMore: closeMore,
      activateTab: activateTab
    };
  });
})();
