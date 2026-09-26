/* CCF MOBILE B3.2 — CCF Mobile Product UI
   Mobile-only presentation shell.
   Uses the EXISTING application modules and their existing DOM/data.
   Does not create a Supabase client, alter auth, SQL, RLS or business logic.
*/
(function () {
  'use strict';
  if (window.__CCF_MOBILE_B32__) return;
  window.__CCF_MOBILE_B32__ = true;

  var BP = 720, enabled = true;
  var tabs = [
    ['dashboard','Resumen','⌂'],
    ['movimientos','Movimientos','↕'],
    ['deudas','Deudas','▣'],
    ['cuentas','Cuentas','▤']
  ];
  var more = [
    ['presupuesto','Presupuesto','◒'],
    ['planificacion','Planificación','◈'],
    ['futuros','Pagos futuros','◷'],
    ['calendario','Calendario','▦'],
    ['operaciones','Operaciones','⇄'],
    ['ahorro','Ahorro','◎']
  ];
  var meta = {
    dashboard:['Resumen','Vista general e indicadores clave','⌂'],
    movimientos:['Movimientos','Registro y control de transacciones','↕'],
    deudas:['Deudas','Control y seguimiento de obligaciones','▣'],
    cuentas:['Cuentas','Gestión de cuentas y saldo total','▤'],
    presupuesto:['Presupuesto','Planificación vs. ejecutado','◒'],
    planificacion:['Planificación','Escenario financiero de 30 días','◈'],
    futuros:['Pagos futuros','Vencimientos y recordatorios','◷'],
    calendario:['Calendario','Vista mensual e integración','▦'],
    operaciones:['Operaciones','Registro rápido y utilidades','⇄'],
    ahorro:['Ahorro','Metas y control del ahorro','◎'],
    ia:['IA Financiera','Análisis y recomendaciones','✦'],
    motor:['Motor Multifuente','Consolidación de información','◉'],
    jornada:['Control de Jornada','Registro operativo','◫']
  };

  function mobile(){ return matchMedia('(max-width:'+BP+'px)').matches; }
  function app(){ return document.getElementById('app'); }
  function originalTab(tab){ return document.querySelector('.tabs button[data-tab="'+tab+'"]'); }
  function activeTab(){
    var b=document.querySelector('.tabs button[data-tab].active');
    return b ? b.getAttribute('data-tab') : 'dashboard';
  }
  function txt(id, fallback){
    var e=document.getElementById(id);
    return e && e.textContent.trim() ? e.textContent.trim() : (fallback||'—');
  }
  function esc(s){ return String(s).replace(/[&<>"']/g,function(c){return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c];}); }

  function build(){
    if(document.getElementById('ccf-mobile-b32')) return;

    var root=document.createElement('div');
    root.id='ccf-mobile-b32';
    root.innerHTML =
      '<div class="b32-appbar">'+
        '<div class="b32-brand"><b>CCF</b><span><strong>Centro de Control Financiero</strong><small>Tu vida financiera en un solo lugar</small></span></div>'+
        '<div class="b32-user"><button class="b32-bell" type="button" aria-label="Notificaciones">♧</button><i>P</i></div>'+
      '</div>'+
      '<div class="b32-context"><span class="b32-context-icon"></span><span><strong></strong><small></small></span><button type="button" class="b32-context-more">•••</button></div>'+
      '<div class="b32-content"></div>'+
      '<nav class="b32-bottom">'+
        tabs.map(function(x){return '<button type="button" data-b32-tab="'+x[0]+'"><span>'+x[2]+'</span><small>'+x[1]+'</small></button>';}).join('')+
        '<button type="button" data-b32-more="1"><span>•••</span><small>Más</small></button>'+
      '</nav>'+
      '<div class="b32-sheet"><div class="b32-sheet-bg"></div><section class="b32-sheet-panel"><div class="b32-handle"></div><header><div><strong>Todos los módulos</strong><small>Accede a cada sección del sistema</small></div><button type="button" class="b32-close">×</button></header><div class="b32-more-grid"></div></section></div>';

    app().appendChild(root);

    root.querySelectorAll('[data-b32-tab]').forEach(function(b){
      b.addEventListener('click',function(){activate(b.getAttribute('data-b32-tab'));});
    });
    root.querySelector('[data-b32-more]').onclick=openMore;
    root.querySelector('.b32-close').onclick=closeMore;
    root.querySelector('.b32-sheet-bg').onclick=closeMore;

    buildMore();
    renderActive();
  }

  function buildMore(){
    var grid=document.querySelector('.b32-more-grid');
    if(!grid) return;
    grid.innerHTML='';
    more.forEach(function(x){
      if(!originalTab(x[0])) return;
      var m=meta[x[0]];
      var b=document.createElement('button');
      b.type='button'; b.className='b32-more-item';
      b.innerHTML='<b>'+x[2]+'</b><span><strong>'+m[0]+'</strong><small>'+m[1]+'</small></span>';
      b.onclick=function(){activate(x[0]);};
      grid.appendChild(b);
    });

    // Extra modules are discovered from the existing app, never duplicated.
    var candidates=[['ia','IA Financiera','IA Financiera'],['motor','Motor Multifuente','Motor Multifuente'],['jornada','Control de Jornada','Control de Jornada']];
    candidates.forEach(function(c){
      var found=[].slice.call(document.querySelectorAll('button,a,[role="button"]')).find(function(e){
        return e.textContent.trim().toLowerCase()===c[2].toLowerCase();
      });
      if(!found) return;
      var b=document.createElement('button');
      b.type='button'; b.className='b32-more-item';
      b.innerHTML='<b>'+meta[c[0]][2]+'</b><span><strong>'+c[1]+'</strong><small>'+meta[c[0]][1]+'</small></span>';
      b.onclick=function(){ closeMore(); found.click(); };
      grid.appendChild(b);
    });
  }

  function openMore(){ buildMore(); document.querySelector('.b32-sheet').classList.add('open'); document.body.classList.add('b32-lock'); }
  function closeMore(){ var s=document.querySelector('.b32-sheet'); if(s)s.classList.remove('open'); document.body.classList.remove('b32-lock'); }

  function dashboardHero(){
    var box=document.createElement('div');
    box.className='b32-dashboard-hero';
    box.innerHTML =
      '<div class="b32-month"><span>'+esc(txt('future-month-label','Septiembre de 2026'))+'</span><b>⌄</b></div>'+
      '<div class="b32-kpis">'+
        '<article class="blue"><small>Liquidez actual</small><strong>'+esc(txt('kpi-real-balance',txt('month-income-total','$0')) )+'</strong><em>Efectivo + cuentas</em></article>'+
        '<article class="green"><small>Ingresos del mes</small><strong>'+esc(txt('month-income-total','$0'))+'</strong><em>Ejecutado</em></article>'+
        '<article class="red"><small>Gastos del mes</small><strong>'+esc(txt('month-expense-total','$0'))+'</strong><em>Ejecutado</em></article>'+
        '<article class="navy"><small>Saldo proyectado</small><strong>'+esc(txt('kpi-projected-balance',txt('kpi-projected','$0')) )+'</strong><em>Fin del mes</em></article>'+
      '</div>'+
      '<div class="b32-chart-card"><header><strong>Flujo del mes</strong><span>Ingresos · Gastos · Saldo</span></header><div class="b32-chart-host"></div></div>'+
      '<div class="b32-quick"><strong>Accesos rápidos</strong><div><button data-quick="gasto">＋<span>Registrar gasto</span></button><button data-quick="ingreso">＋<span>Registrar ingreso</span></button><button data-quick="deuda">▣<span>Ver deudas</span></button><button data-quick="plan">◈<span>Planificar</span></button></div></div>';

    var chart=document.getElementById('chart-flow') || document.getElementById('chart-liquidity');
    var host=box.querySelector('.b32-chart-host');
    if(chart) host.appendChild(chart.cloneNode(true));
    box.querySelectorAll('[data-quick]').forEach(function(b){
      b.onclick=function(){
        var type=b.getAttribute('data-quick');
        if(type==='deuda') activate('deudas');
        else if(type==='plan') activate('planificacion');
        else {
          var target=document.querySelector(type==='gasto'?'#movTipo':'#movTipo');
          activate('movimientos');
          setTimeout(function(){ if(target){target.value=type==='gasto'?'gasto':'ingreso'; target.dispatchEvent(new Event('change',{bubbles:true}));}},100);
        }
      };
    });
    return box;
  }

  function prepareSection(tab, section){
    section.classList.add('b32-section');
    section.setAttribute('data-b32-module',tab);
    section.querySelectorAll('h1,h2').forEach(function(h){h.classList.add('b32-native-heading');});
    if(tab==='movimientos') section.classList.add('b32-list-module');
    if(tab==='deudas') section.classList.add('b32-debt-module');
    if(tab==='cuentas') section.classList.add('b32-accounts-module');
    if(tab==='futuros') section.classList.add('b32-future-module');
    if(tab==='calendario') section.classList.add('b32-calendar-module');
    if(tab==='operaciones') section.classList.add('b32-operations-module');
  }

  function renderActive(){
    if(!mobile()) return;
    var content=document.querySelector('.b32-content');
    if(!content) return;
    var tab=activeTab();
    var m=meta[tab] || [tab,'Gestión financiera','•'];

    document.querySelector('.b32-context-icon').textContent=m[2];
    document.querySelector('.b32-context strong').textContent=m[0];
    document.querySelector('.b32-context small').textContent=m[1];

    document.querySelectorAll('.b32-bottom button[data-b32-tab]').forEach(function(b){
      b.classList.toggle('active',b.getAttribute('data-b32-tab')===tab);
    });
    var moreBtn=document.querySelector('.b32-bottom [data-b32-more]');
    if(moreBtn) moreBtn.classList.toggle('active',tabs.every(function(x){return x[0]!==tab;}));

    // Keep one real module visible. Move, don't clone: existing IDs/listeners/data remain alive.
    var section=document.getElementById(tab);
    if(section){
      prepareSection(tab,section);
      content.innerHTML='';
      if(tab==='dashboard'){
        content.appendChild(dashboardHero());
        section.classList.add('b32-native-dashboard');
        content.appendChild(section);
      }else{
        content.appendChild(section);
      }
    } else {
      content.innerHTML='<section class="b32-unavailable"><strong>'+esc(m[0])+'</strong><p>El módulo existe fuera del contenedor principal. Se mantiene su motor original.</p></section>';
    }
    setTimeout(function(){window.dispatchEvent(new Event('resize'));},20);
  }

  function activate(tab){
    var b=originalTab(tab);
    if(b) b.click();
    closeMore();
    setTimeout(renderActive,30);
  }

  function apply(){
    if(!mobile() || !enabled) return;
    document.documentElement.classList.add('b32-mobile');
    document.body.classList.add('b32-mobile');
    build();

    var top=document.querySelector('body > header.topbar');
    if(top) top.classList.add('b32-hide');
    var nav=document.querySelector('.tabs');
    if(nav) nav.classList.add('b32-hide');
    var manual=document.querySelector('.ccf-manual-access');
    if(manual) manual.classList.add('b32-hide');

    renderActive();
  }

  function restore(){
    // The mobile layer is presentation-only. Restore the original DOM arrangement.
    var content=document.querySelector('.b32-content');
    if(content){
      var sections=[].slice.call(content.querySelectorAll('.b32-section'));
      sections.forEach(function(s){
        var tab=s.getAttribute('data-b32-module');
        var original=document.querySelector('.tabs button[data-tab="'+tab+'"]');
        var appEl=app();
        if(original && appEl) appEl.appendChild(s);
      });
    }
    var root=document.getElementById('ccf-mobile-b32');
    if(root) root.remove();
    document.documentElement.classList.remove('b32-mobile');
    document.body.classList.remove('b32-mobile','b32-lock');
    document.querySelectorAll('.b32-hide').forEach(function(e){e.classList.remove('b32-hide');});
  }

  function boot(){
    try{
      if(mobile()) apply();
      document.addEventListener('click',function(e){
        var b=e.target.closest && e.target.closest('.tabs button[data-tab]');
        if(b && mobile()) setTimeout(renderActive,40);
      },true);
      var timer;
      addEventListener('resize',function(){
        clearTimeout(timer);
        timer=setTimeout(function(){ mobile()?apply():restore(); },150);
      });
      window.CCFMobileB32={
        version:'B3.2.0',
        apply:apply,
        restore:restore,
        activate:activate,
        disable:function(){enabled=false;restore();}
      };
    }catch(e){console.error('[CCF Mobile B3.2]',e);}
  }

  document.readyState==='loading'
    ? document.addEventListener('DOMContentLoaded',boot,{once:true})
    : boot();
})();
