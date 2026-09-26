/* ============================================================
   CCF MOBILE UX PREMIUM V3 — REDISEÑO REAL
   UI/UX ONLY — no modifica Supabase, auth, SQL ni lógica financiera.
   Reemplaza la capa anterior de UX móvil.
   ============================================================ */
(function(){
  'use strict';
  if(window.__CCF_MOBILE_UX_V3__) return;
  window.__CCF_MOBILE_UX_V3__ = true;

  var mobile = window.matchMedia('(max-width: 760px)');

  function style(){
    if(document.getElementById('ccf-mobile-v3-style')) return;
    var s=document.createElement('style'); s.id='ccf-mobile-v3-style';
    s.textContent=`
      :root{
        --v3-bg:#f5f7fb;--v3-card:#fff;--v3-ink:#111827;--v3-muted:#64748b;
        --v3-line:#e5e7eb;--v3-blue:#2563eb;--v3-blue2:#1d4ed8;
        --v3-green:#059669;--v3-red:#dc2626;--v3-navy:#0f172a;
        --v3-shadow:0 5px 20px rgba(15,23,42,.06);
      }
      body.ccf-v3{background:var(--v3-bg)!important;color:var(--v3-ink);overflow-x:hidden}
      body.ccf-v3 .container{max-width:1180px!important;margin:auto;padding:0 14px 90px!important}
      body.ccf-v3 .topbar{background:linear-gradient(135deg,#0b1220,#172554)!important;border:0!important;box-shadow:0 4px 20px rgba(15,23,42,.16);padding:16px 18px!important}
      body.ccf-v3 .topbar h1{font-size:22px!important;margin:0!important;letter-spacing:-.03em}
      body.ccf-v3 .topbar p{font-size:12px!important;margin:4px 0 0!important;line-height:1.35}
      body.ccf-v3 #logoutBtn{min-height:42px!important;border-radius:12px!important}
      body.ccf-v3 .card,body.ccf-v3 .panel,body.ccf-v3 .kpi-card,body.ccf-v3 .executive-chart{border:1px solid var(--v3-line)!important;border-radius:18px!important;box-shadow:var(--v3-shadow)!important;background:#fff}
      body.ccf-v3 input,body.ccf-v3 select,body.ccf-v3 textarea{min-height:46px;border-radius:12px}
      body.ccf-v3 button{min-height:44px;border-radius:12px}

      /* Desktop keeps the original navigation */
      #ccf-v3-mobile-nav,#ccf-v3-sheet{display:none}

      @media(max-width:760px){
        body.ccf-v3{padding-bottom:82px!important}
        body.ccf-v3 .container{padding:0 10px 100px!important}

        /* Replace the huge module wall completely */
        body.ccf-v3 .tabs{
          display:none!important;
          height:0!important;margin:0!important;padding:0!important;overflow:hidden!important;
        }
        body.ccf-v3 .ccf-manual-access{margin:8px 0 12px!important}
        body.ccf-v3 .ccf-manual-button{width:100%!important;min-height:46px!important;border-radius:13px!important;font-size:12px!important}

        /* Mobile command header */
        #ccf-v3-command{
          display:flex;align-items:center;justify-content:space-between;gap:10px;
          margin:10px 0 10px;padding:13px 14px;background:#fff;border:1px solid var(--v3-line);
          border-radius:17px;box-shadow:var(--v3-shadow)
        }
        #ccf-v3-command .v3-context{min-width:0}
        #ccf-v3-command .v3-kicker{font:800 10px/1.2 system-ui;color:var(--v3-blue);letter-spacing:.09em;text-transform:uppercase}
        #ccf-v3-command .v3-title{font:900 18px/1.2 system-ui;margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        #ccf-v3-command .v3-action{border:0;background:var(--v3-navy);color:#fff;padding:9px 12px;font:800 11px system-ui;white-space:nowrap}

        /* Dashboard hierarchy */
        body.ccf-v3 #dashboard{padding-top:0!important}
        body.ccf-v3 #dashboard .ccf-monthly-summary{padding:15px!important;border-radius:18px!important;margin:0 0 10px!important}
        body.ccf-v3 #dashboard .ccf-monthly-summary-head{margin-bottom:12px!important}
        body.ccf-v3 #dashboard .ccf-monthly-summary-head h2{font-size:17px!important}
        body.ccf-v3 #dashboard .ccf-monthly-kpis{grid-template-columns:1fr 1fr!important;gap:7px!important;margin-bottom:10px!important}
        body.ccf-v3 #dashboard .ccf-monthly-kpi{padding:11px!important;border-radius:13px!important}
        body.ccf-v3 #dashboard .ccf-monthly-kpi span{font-size:10px!important}
        body.ccf-v3 #dashboard .ccf-monthly-kpi strong{font-size:16px!important}
        body.ccf-v3 #dashboard .ccf-monthly-future-grid{grid-template-columns:1fr!important}

        body.ccf-v3 #financial-control .summary-header{padding:16px!important;border-radius:18px!important;margin-bottom:9px!important}
        body.ccf-v3 #financial-control .summary-header h2{font-size:21px!important}
        body.ccf-v3 #financial-control .kpi-grid{grid-template-columns:1fr 1fr!important;gap:8px!important}
        body.ccf-v3 #financial-control .kpi-card{min-height:96px!important;padding:13px!important}
        body.ccf-v3 #financial-control .kpi-card span{font-size:10px!important;line-height:1.25}
        body.ccf-v3 #financial-control .kpi-card strong{font-size:18px!important;margin-top:7px!important}
        body.ccf-v3 .daily-margin,body.ccf-v3 .projection,body.ccf-v3 .decision-grid,body.ccf-v3 .executive-dashboard{margin-top:9px!important}
        body.ccf-v3 .executive-insights{grid-template-columns:1fr 1fr!important;gap:8px!important}
        body.ccf-v3 .executive-charts{display:block!important}
        body.ccf-v3 .executive-chart{margin-top:8px!important;padding:13px!important}

        /* Generic modules */
        body.ccf-v3 .tab>.card,body.ccf-v3 .tab .card{padding:15px!important;margin-bottom:10px!important;border-radius:17px!important}
        body.ccf-v3 .tab .grid2{grid-template-columns:1fr!important;gap:10px!important}
        body.ccf-v3 .form-actions{display:grid!important;grid-template-columns:1fr!important;gap:8px!important}
        body.ccf-v3 .form-actions button{width:100%!important}
        body.ccf-v3 .actions{grid-template-columns:1fr 1fr!important}

        /* Sticky mobile navigation */
        #ccf-v3-mobile-nav{
          display:grid;grid-template-columns:repeat(5,1fr);gap:3px;
          position:fixed;left:0;right:0;bottom:0;z-index:999999;
          padding:7px 7px calc(7px + env(safe-area-inset-bottom));
          background:rgba(255,255,255,.97);backdrop-filter:blur(16px);
          border-top:1px solid #e2e8f0;box-shadow:0 -8px 30px rgba(15,23,42,.12)
        }
        #ccf-v3-mobile-nav button{border:0;background:transparent;color:#64748b;min-height:55px;padding:5px 2px;border-radius:13px;font:800 9px/1.1 system-ui;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px}
        #ccf-v3-mobile-nav button .v3-icon{font-size:19px;line-height:1}
        #ccf-v3-mobile-nav button.active{background:#111827;color:#fff}

        /* More sheet */
        #ccf-v3-sheet.open{display:block}
        #ccf-v3-sheet .v3-back{position:fixed;inset:0;z-index:1000000;background:rgba(2,6,23,.55);backdrop-filter:blur(3px)}
        #ccf-v3-sheet .v3-sheet{position:fixed;left:0;right:0;bottom:0;z-index:1000001;background:#fff;border-radius:23px 23px 0 0;padding:10px 14px calc(18px + env(safe-area-inset-bottom));max-height:84vh;overflow:auto;box-shadow:0 -18px 50px rgba(15,23,42,.25)}
        #ccf-v3-sheet .v3-handle{width:42px;height:4px;background:#cbd5e1;border-radius:99px;margin:0 auto 14px}
        #ccf-v3-sheet .v3-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}
        #ccf-v3-sheet .v3-head strong{font:900 18px system-ui}
        #ccf-v3-sheet .v3-close{width:40px;height:40px;border:0;border-radius:50%;background:#f1f5f9;font-size:20px}
        #ccf-v3-sheet .v3-grid{display:grid;grid-template-columns:1fr 1fr;gap:9px}
        #ccf-v3-sheet .v3-grid button{border:1px solid #e2e8f0;background:#f8fafc;color:#172033;min-height:54px;text-align:left;padding:10px 12px;font:800 12px system-ui}
        #ccf-v3-sheet .v3-grid button.active{background:#111827;color:#fff}

        /* Make active content obvious */
        body.ccf-v3 .tab:not(.hidden){animation:v3fade .18s ease-out}
        @keyframes v3fade{from{opacity:.35;transform:translateY(3px)}to{opacity:1;transform:none}}
      }
    `;
    document.head.appendChild(s);
  }

  var icon={dashboard:'⌂',movimientos:'↕',futuros:'◷',calendario:'▦',ahorro:'◎',deudas:'▣',cuentas:'▤',operaciones:'⚙',planificacion:'◈',presupuesto:'▥',more:'•••'};
  var labels={dashboard:'Resumen',movimientos:'Movimientos',futuros:'Pagos futuros',calendario:'Calendario',ahorro:'Ahorro',deudas:'Deudas',cuentas:'Cuentas',operaciones:'Operaciones',planificacion:'Planificación',presupuesto:'Presupuesto'};
  function tabs(){return Array.from(document.querySelectorAll('.tabs button[data-tab]'))}
  function current(){var a=document.querySelector('.tabs button.active');return a?a.getAttribute('data-tab'):'dashboard'}
  function go(tab){var b=document.querySelector('.tabs button[data-tab="'+tab+'"]');if(!b)return;b.click();setTimeout(sync,40);setTimeout(function(){window.scrollTo(0,0)},20);closeSheet()}
  function sync(){var c=current();document.querySelectorAll('#ccf-v3-mobile-nav button[data-v3-tab]').forEach(function(b){b.classList.toggle('active',b.dataset.v3Tab===c)});refreshSheet();updateCommand()}
  function updateCommand(){var el=document.getElementById('ccf-v3-current');if(el)el.textContent=labels[current()]||'Centro financiero'}
  function buildNav(){if(document.getElementById('ccf-v3-mobile-nav'))return;var n=document.createElement('nav');n.id='ccf-v3-mobile-nav';[['dashboard','Resumen'],['movimientos','Movimientos'],['deudas','Deudas'],['cuentas','Cuentas'],['more','Más']].forEach(function(x){var b=document.createElement('button');b.type='button';b.dataset.v3Tab=x[0];b.innerHTML='<span class="v3-icon">'+(icon[x[0]]||'•')+'</span><span>'+x[1]+'</span>';b.onclick=function(){x[0]==='more'?openSheet():go(x[0])};n.appendChild(b)});document.body.appendChild(n)}
  function buildSheet(){if(document.getElementById('ccf-v3-sheet'))return;var r=document.createElement('div');r.id='ccf-v3-sheet';r.innerHTML='<div class="v3-back" data-v3-close></div><div class="v3-sheet"><div class="v3-handle"></div><div class="v3-head"><strong>Todos los módulos</strong><button class="v3-close" type="button" data-v3-close>×</button></div><div class="v3-grid"></div></div>';document.body.appendChild(r);r.addEventListener('click',function(e){if(e.target.closest('[data-v3-close]'))return closeSheet();var b=e.target.closest('[data-v3-more]');if(b)go(b.dataset.v3More)})}
  function refreshSheet(){var g=document.querySelector('#ccf-v3-sheet .v3-grid');if(!g)return;g.innerHTML='';tabs().forEach(function(t){var b=document.createElement('button');b.type='button';b.dataset.v3More=t.dataset.tab;b.textContent=(icon[t.dataset.tab]||'•')+'  '+(labels[t.dataset.tab]||t.textContent.trim());if(t.classList.contains('active'))b.classList.add('active');g.appendChild(b)})}
  function openSheet(){buildSheet();refreshSheet();document.getElementById('ccf-v3-sheet').classList.add('open');document.body.style.overflow='hidden'}
  function closeSheet(){var r=document.getElementById('ccf-v3-sheet');if(r)r.classList.remove('open');document.body.style.overflow=''}
  function command(){if(document.getElementById('ccf-v3-command'))return;var c=document.createElement('div');c.id='ccf-v3-command';c.innerHTML='<div class="v3-context"><div class="v3-kicker">Centro de control financiero</div><div class="v3-title" id="ccf-v3-current">Resumen</div></div><button class="v3-action" type="button">Módulos</button>';c.querySelector('button').onclick=openSheet;var ref=document.querySelector('.ccf-manual-access');if(ref&&ref.parentNode)ref.parentNode.insertBefore(c,ref)}
  function install(){if(!document.body)return;document.body.classList.add('ccf-v3');style();if(!mobile.matches)return;command();buildNav();buildSheet();sync()}
  function boot(){install();document.addEventListener('click',function(e){if(e.target.closest('.tabs button[data-tab]'))setTimeout(sync,50)},true);window.addEventListener('resize',install);if(window.MutationObserver)new MutationObserver(function(){install()}).observe(document.body,{childList:true,subtree:true})}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
  window.CCFMobileUX={version:'3.0.0',openMore:openSheet,closeMore:closeSheet,activateTab:go};
})();
