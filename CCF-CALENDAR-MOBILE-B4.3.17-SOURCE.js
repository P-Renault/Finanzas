(function(){

  'use strict';

  /* B4.3.17 SOURCE ONLY: no user-facing legacy view.
     Premium B4.3.18.1 is the sole mobile presentation. */
  (function hideLegacyHost(){
    var styleId='ccf-calendar-mobile-direct-b4-3-17-source-style';
    if(document.getElementById(styleId)) return;
    var st=document.createElement('style');
    st.id=styleId;
    st.textContent='#ccf-calendar-mobile-direct-b4-3-17{display:none!important;visibility:hidden!important;height:0!important;min-height:0!important;margin:0!important;padding:0!important;overflow:hidden!important;}';
    (document.head||document.documentElement).appendChild(st);
  })();

  /* ==========================================================
     CONFIGURACIÓN
  ========================================================== */

  var ID = 'ccf-calendar-mobile-direct-b4-3-17';

  var timer = null;

  var observer = null;

  var rendering = false;

  var renderTimer = null;

  var started = false;


  /* ==========================================================
     REFERENCIAS AL SISTEMA EXISTENTE
  ========================================================== */

  function root(){

    return document.getElementById('ccf-mobile-b43');

  }


  function section(){

    return document.getElementById('calendario');

  }


  function source(){

    var s = section();

    if(!s) return null;

    return s.querySelector('.b232261-card');

  }


  function text(el){

    return String(
      (el && el.textContent) || ''
    )
    .replace(/\s+/g,' ')
    .trim();

  }


  /* ==========================================================
     ESTILOS AISLADOS
  ========================================================== */

  function css(){

    if(document.getElementById(ID + '-style')){

      return;

    }


    var s = document.createElement('style');

    s.id = ID + '-style';


    s.textContent =

      '#' + ID + '{' +

        'display:block;' +

        'width:100%;' +

        'max-width:100%;' +

        'min-width:0;' +

        'box-sizing:border-box;' +

        'margin:0 0 12px;' +

        'padding:0;' +

      '}' +


      '#' + ID + ' *{' +

        'box-sizing:border-box;' +

      '}' +


      '#' + ID + ' .cm-shell{' +
        'display:block;' +
        'width:100%;' +
        'max-width:100%;' +
        'min-width:0;' +
        'box-sizing:border-box;' +
        'background:#fff;' +
        'border:1px solid #e2e8f0;' +
        'border-radius:18px;' +
        'overflow:hidden;' +
        'box-shadow:0 4px 18px rgba(15,23,42,.06);' +
      '}' +

      '#' + ID + ' .cm-head{' +
        'position:relative;' +
        'padding:18px 14px 12px;' +
        'background:#fff;' +
      '}' +

      '#' + ID + ' .cm-eyebrow{' +
        'margin:0 0 3px;' +
        'font-size:9px;' +
        'line-height:1;' +
        'font-weight:900;' +
        'letter-spacing:.05em;' +
        'color:#64748b;' +
        'text-transform:uppercase;' +
      '}' +

      '#' + ID + ' .cm-title{' +
        'margin:0;' +
        'padding-right:190px;' +
        'font-size:26px;' +
        'line-height:1.08;' +
        'color:#0f2747;' +
        'font-weight:900;' +
        'letter-spacing:-.02em;' +
      '}' +

      '#' + ID + ' .cm-sub{' +
        'margin-top:5px;' +
        'padding-right:190px;' +
        'font-size:11px;' +
        'line-height:1.3;' +
        'color:#7b8796;' +
      '}' +

      '#' + ID + ' .cm-status{' +
        'margin:12px 0 0;' +
        'padding:9px 11px;' +
        'border-radius:10px;' +
        'background:#ecfdf5;' +
        'border:1px solid #d1fae5;' +
        'color:#64748b;' +
        'font-size:12px;' +
        'line-height:1.25;' +
      '}' +

      '#' + ID + ' .cm-actions{' +
        'position:absolute;' +
        'top:19px;' +
        'right:14px;' +
        'display:flex;' +
        'align-items:center;' +
        'gap:7px;' +
        'width:auto;' +
        'margin:0;' +
      '}' +

      '#' + ID + ' .cm-actions button{' +
        'display:flex;' +
        'align-items:center;' +
        'justify-content:center;' +
        'width:48px;' +
        'min-width:48px;' +
        'height:43px;' +
        'min-height:43px;' +
        'padding:0 7px;' +
        'border:1px solid #e2e8f0;' +
        'border-radius:10px;' +
        'background:#f1f5f9;' +
        'color:#1e293b;' +
        'font-size:20px;' +
        'font-weight:900;' +
        'line-height:1;' +
        'cursor:pointer;' +
      '}' +

      '#' + ID + ' .cm-actions button:nth-child(2){' +
        'width:55px;' +
        'min-width:55px;' +
        'background:#0f2747;' +
        'border-color:#0f2747;' +
        'color:#fff;' +
        'font-size:11px;' +
      '}' +

      '#' + ID + ' .cm-actions button.secondary{' +
        'background:#f1f5f9;' +
        'color:#1e293b;' +
      '}' +

      '#' + ID + ' .cm-kpis{' +
        'display:grid;' +
        'grid-template-columns:repeat(6,minmax(0,1fr));' +
        'gap:9px;' +
        'padding:0 14px 12px;' +
      '}' +

      '#' + ID + ' .cm-kpi{' +
        'min-width:0;' +
        'min-height:78px;' +
        'padding:12px 14px;' +
        'border:1px solid transparent;' +
        'border-radius:14px;' +
        'overflow:hidden;' +
      '}' +

      /* Primera fila: 2 indicadores */
      '#' + ID + ' .cm-kpi:nth-child(1),' +
      '#' + ID + ' .cm-kpi:nth-child(2){' +
        'grid-column:span 3;' +
      '}' +

      /* Segunda fila: 3 indicadores */
      '#' + ID + ' .cm-kpi:nth-child(3),' +
      '#' + ID + ' .cm-kpi:nth-child(4),' +
      '#' + ID + ' .cm-kpi:nth-child(5){' +
        'grid-column:span 2;' +
      '}' +

      /* Colores de la referencia */
      '#' + ID + ' .cm-kpi:nth-child(1){' +
        'background:#1289ee;' +
        'border-color:#1289ee;' +
        'color:#fff;' +
      '}' +

      '#' + ID + ' .cm-kpi:nth-child(2){' +
        'background:#11bf87;' +
        'border-color:#11bf87;' +
        'color:#fff;' +
      '}' +

      '#' + ID + ' .cm-kpi:nth-child(3){' +
        'background:#ff314a;' +
        'border-color:#ff314a;' +
        'color:#fff;' +
      '}' +

      '#' + ID + ' .cm-kpi:nth-child(4){' +
        'background:#f7f9fc;' +
        'border-color:#e7ebf1;' +
        'color:#172033;' +
      '}' +

      '#' + ID + ' .cm-kpi:nth-child(5){' +
        'background:#1767b7;' +
        'border-color:#1767b7;' +
        'color:#fff;' +
      '}' +

      '#' + ID + ' .cm-kpi span{' +
        'display:block;' +
        'font-size:10px;' +
        'line-height:1.2;' +
        'color:inherit;' +
        'opacity:.95;' +
      '}' +

      '#' + ID + ' .cm-kpi strong{' +
        'display:block;' +
        'margin-top:5px;' +
        'font-size:20px;' +
        'line-height:1.08;' +
        'overflow-wrap:anywhere;' +
        'word-break:break-word;' +
        'color:inherit;' +
      '}' +

      '#' + ID + ' .cm-scope{' +
        'position:relative;' +
        'display:flex;' +
        'align-items:center;' +
        'min-height:45px;' +
        'margin:0 14px 10px;' +
        'padding:10px 12px 10px 43px;' +
        'border-radius:10px;' +
        'background:#f1f6fc;' +
        'color:#526173;' +
        'font-size:10px;' +
        'line-height:1.25;' +
        'overflow-wrap:anywhere;' +
      '}' +

      '#' + ID + ' .cm-scope:before{' +
        'content:"▣";' +
        'position:absolute;' +
        'left:14px;' +
        'top:50%;' +
        'transform:translateY(-50%);' +
        'font-size:18px;' +
        'font-weight:900;' +
        'color:#0877cf;' +
      '}' +

      '#' + ID + ' .cm-calendar-wrap{' +
        'margin:0 14px 14px;' +
        'border:1px solid #e2e8f0;' +
        'border-radius:12px;' +
        'overflow:hidden;' +
      '}' +

      '@media(max-width:720px){' +
        '#' + ID + ' .cm-kpis{gap:7px;padding-left:10px;padding-right:10px;}' +
        '#' + ID + ' .cm-kpi{min-height:72px;padding:10px 11px;}' +
        '#' + ID + ' .cm-kpi strong{font-size:18px;}' +
        '#' + ID + ' .cm-scope{margin-left:10px;margin-right:10px;}' +
      '}' +

      '@media(max-width:480px){' +
        '#' + ID + ' .cm-kpis{grid-template-columns:repeat(6,minmax(0,1fr));gap:6px;padding-left:8px;padding-right:8px;}' +
        '#' + ID + ' .cm-kpi{min-height:76px;padding:10px 10px;border-radius:13px;}' +
        '#' + ID + ' .cm-kpi strong{font-size:17px;margin-top:4px;}' +
        '#' + ID + ' .cm-kpi span{font-size:9px;}' +
        '#' + ID + ' .cm-scope{margin:0 8px 8px;min-height:40px;padding-left:38px;font-size:9px;}' +
      '}' +


      /* ======================================================
         GRILLA PRINCIPAL
         ====================================================== */

      '#' + ID + ' .cm-grid{' +

        'display:grid;' +

        'grid-template-columns:repeat(7,minmax(0,1fr));' +

        'grid-auto-flow:row;' +

        'width:100%;' +

        'max-width:100%;' +

        'min-width:0;' +

        'margin:0;' +

        'padding:0;' +

        'gap:0;' +

        'overflow:hidden;' +

      '}' +


      '#' + ID + ' .cm-week{' +

        'display:flex;' +

        'align-items:center;' +

        'justify-content:center;' +

        'width:100%;' +

        'min-width:0;' +

        'max-width:100%;' +

        'height:30px;' +

        'padding:4px 1px;' +

        'background:#111827;' +

        'color:#fff;' +

        'font-size:8px;' +

        'font-weight:900;' +

        'line-height:1;' +

        'text-align:center;' +

        'overflow:hidden;' +

        'white-space:nowrap;' +

      '}' +


      '#' + ID + ' .cm-day{' +

        'display:block;' +

        'width:100%;' +

        'min-width:0;' +

        'max-width:100%;' +

        'height:88px;' +

        'margin:0;' +

        'padding:4px 3px;' +

        'border:0;' +

        'border-right:1px solid #e5e7eb;' +

        'border-bottom:1px solid #e5e7eb;' +

        'border-radius:0;' +

        'background:#fff;' +

        'color:#334155;' +

        'text-align:left;' +

        'overflow:hidden;' +

        'cursor:pointer;' +

      '}' +


      '#' + ID + ' .cm-day.out{' +

        'background:#f8fafc;' +

        'color:#94a3b8;' +

      '}' +


      '#' + ID + ' .cm-day.selected{' +

        'outline:2px solid #111827;' +

        'outline-offset:-2px;' +

      '}' +


      '#' + ID + ' .cm-day-top{' +

        'display:flex;' +

        'justify-content:space-between;' +

        'align-items:center;' +

        'width:100%;' +

        'min-width:0;' +

        'font-size:10px;' +

        'font-weight:800;' +

        'line-height:1;' +

      '}' +


      '#' + ID + ' .cm-day-top strong{' +

        'min-width:0;' +

      '}' +


      '#' + ID + ' .cm-day-top small{' +

        'font-size:6px;' +

        'line-height:1;' +

      '}' +


      '#' + ID + ' .cm-event{' +

        'display:block;' +

        'width:100%;' +

        'max-width:100%;' +

        'min-width:0;' +

        'margin-top:2px;' +

        'padding:2px;' +

        'border-radius:3px;' +

        'font-size:6px;' +

        'line-height:1.05;' +

        'white-space:nowrap;' +

        'overflow:hidden;' +

        'text-overflow:ellipsis;' +

      '}' +


      '#' + ID + ' .cm-real-in{' +

        'background:#ecfdf5;' +

        'color:#166534;' +

      '}' +


      '#' + ID + ' .cm-real-out{' +

        'background:#fef2f2;' +

        'color:#991b1b;' +

      '}' +


      '#' + ID + ' .cm-plan-in{' +

        'background:#eff6ff;' +

        'color:#1d4ed8;' +

      '}' +


      '#' + ID + ' .cm-plan-out{' +

        'background:#fff7ed;' +

        'color:#9a3412;' +

      '}' +


      '#' + ID + ' .cm-gen{' +

        'background:#f5f3ff;' +

        'color:#6d28b9;' +

      '}' +


      '#' + ID + ' .cm-debt{' +

        'background:#eef2ff;' +

        'color:#3730a3;' +

      '}' +


      '#' + ID + ' .cm-mini{' +

        'display:block;' +

        'width:100%;' +

        'min-width:0;' +

        'margin-top:2px;' +

        'font-size:6px;' +

        'line-height:1.05;' +

        'white-space:nowrap;' +

        'overflow:hidden;' +

        'text-overflow:ellipsis;' +

        'color:#64748b;' +

      '}' +


      '#' + ID + ' .cm-pos{' +

        'color:#166534;' +

      '}' +


      '#' + ID + ' .cm-neg{' +

        'color:#991b1b;' +

      '}' +


      /* ======================================================
         DETALLE
         ====================================================== */

      '#' + ID + ' .cm-detail{' +

        'display:grid;' +

        'grid-template-columns:minmax(0,1fr);' +

        'gap:7px;' +

        'padding:9px;' +

      '}' +


      '#' + ID + ' .cm-box{' +
        'display:block;' +
        'width:100%;' +
        'min-width:0;' +
        'padding:11px 12px;' +
        'border:1px solid #e2e8f0;' +
        'border-radius:12px;' +
        'background:#fff;' +
        'font-size:10px;' +
        'line-height:1.4;' +
        'overflow:hidden;' +
      '}' +

      '#' + ID + ' .cm-box-income{' +
        'background:#f0fdf4;' +
        'border-color:#bbf7d0;' +
      '}' +

      '#' + ID + ' .cm-box-expense{' +
        'background:#fef2f2;' +
        'border-color:#fecaca;' +
      '}' +


      '#' + ID + ' .cm-box h3{' +

        'margin:0 0 5px;' +

        'font-size:10px;' +

        'line-height:1.25;' +

      '}' +


      '#' + ID + ' .cm-box-body{' +

        'width:100%;' +

        'min-width:0;' +

        'line-height:1.35;' +

        'overflow-wrap:anywhere;' +

        'word-break:break-word;' +

      '}' +


      /* ======================================================
         ESTADO DE ERROR
         ====================================================== */

      '#' + ID + ' .cm-error{' +

        'margin:10px;' +

        'padding:12px;' +

        'border:2px solid #dc2626;' +

        'border-radius:10px;' +

        'background:#fef2f2;' +

        'color:#991b1b;' +

        'font-size:11px;' +

        'line-height:1.4;' +

      '}' +

      /* ======================================================
         PREMIUM HEADER V3 · REFERENCIA DISEÑO 1
         ====================================================== */

      '#' + ID + ' .cm-head{' +
        'position:relative;' +
        'padding:16px 12px 8px;' +
        'background:#fff;' +
        'min-height:78px;' +
      '}' +

      '#' + ID + ' .cm-eyebrow{' +
        'margin:0 0 4px;' +
        'font-size:9px;' +
        'line-height:1;' +
        'font-weight:900;' +
        'letter-spacing:.04em;' +
        'color:#64748b;' +
        'text-transform:uppercase;' +
      '}' +

      '#' + ID + ' .cm-title{' +
        'margin:0;' +
        'padding-right:190px;' +
        'font-size:24px;' +
        'line-height:1.08;' +
        'color:#0f2747;' +
        'font-weight:900;' +
        'letter-spacing:-.025em;' +
      '}' +

      '#' + ID + ' .cm-sub,' +
      '#' + ID + ' .cm-status{' +
        'display:none!important;' +
      '}' +

      '#' + ID + ' .cm-actions{' +
        'position:absolute;' +
        'top:10px;' +
        'right:10px;' +
        'display:flex;' +
        'align-items:center;' +
        'gap:6px;' +
      '}' +

      '#' + ID + ' .cm-actions button{' +
        'width:44px;' +
        'min-width:44px;' +
        'height:44px;' +
        'min-height:44px;' +
        'border:0;' +
        'border-radius:11px;' +
        'background:#eef2f7;' +
        'color:#122a49;' +
        'font-size:24px;' +
        'font-weight:900;' +
        'box-shadow:none;' +
      '}' +

      '#' + ID + ' .cm-actions button:nth-child(2){' +
        'width:74px;' +
        'min-width:74px;' +
        'background:#102b4d;' +
        'border-color:#102b4d;' +
        'color:#fff;' +
        'font-size:16px;' +
      '}' +

      '#' + ID + ' .cm-kpis{' +
        'display:grid;' +
        'grid-template-columns:repeat(6,minmax(0,1fr));' +
        'gap:8px;' +
        'padding:0 12px 9px;' +
      '}' +

      '#' + ID + ' .cm-kpi{' +
        'position:relative;' +
        'grid-column:span 2;' +
        'min-width:0;' +
        'min-height:82px;' +
        'padding:14px 60px 12px 15px;' +
        'border:1px solid transparent;' +
        'border-radius:16px;' +
        'overflow:hidden;' +
      '}' +

      '#' + ID + ' .cm-kpi:nth-child(1),' +
      '#' + ID + ' .cm-kpi:nth-child(2){' +
        'grid-column:span 3;' +
      '}' +

      '#' + ID + ' .cm-kpi:nth-child(1){' +
        'background:linear-gradient(135deg,#148cf0,#087ff0);' +
        'border-color:#148cf0;' +
      '}' +

      '#' + ID + ' .cm-kpi:nth-child(2){' +
        'background:linear-gradient(135deg,#10c48a,#0bb77a);' +
        'border-color:#10c48a;' +
      '}' +

      '#' + ID + ' .cm-kpi:nth-child(3){' +
        'background:linear-gradient(135deg,#ff3e53,#f5263d);' +
        'border-color:#ff3e53;' +
      '}' +

      '#' + ID + ' .cm-kpi:nth-child(4){' +
        'background:#f5f7fb;' +
        'border-color:#edf1f6;' +
      '}' +

      '#' + ID + ' .cm-kpi:nth-child(5){' +
        'background:linear-gradient(135deg,#1767b9,#0b5cae);' +
        'border-color:#1767b9;' +
      '}' +

      '#' + ID + ' .cm-kpi span{' +
        'display:block;' +
        'font-size:10px;' +
        'line-height:1.2;' +
        'color:#fff;' +
        'opacity:.96;' +
      '}' +

      '#' + ID + ' .cm-kpi:nth-child(4) span{' +
        'color:#475569;' +
      '}' +

      '#' + ID + ' .cm-kpi strong{' +
        'display:block;' +
        'margin-top:4px;' +
        'font-size:22px;' +
        'line-height:1.05;' +
        'overflow-wrap:anywhere;' +
        'word-break:break-word;' +
        'color:#fff;' +
      '}' +

      '#' + ID + ' .cm-kpi:nth-child(4) strong{' +
        'color:#172033;' +
      '}' +

      '#' + ID + ' .cm-kpi:after{' +
        'content:"";' +
        'position:absolute;' +
        'right:12px;' +
        'top:50%;' +
        'transform:translateY(-50%);' +
        'width:42px;' +
        'height:42px;' +
        'border-radius:11px;' +
        'background:rgba(255,255,255,.16);' +
      '}' +

      '#' + ID + ' .cm-kpi:before{' +
        'position:absolute;' +
        'z-index:2;' +
        'right:23px;' +
        'top:50%;' +
        'transform:translateY(-50%);' +
        'font-size:22px;' +
        'font-weight:900;' +
        'line-height:1;' +
        'color:#fff;' +
      '}' +

      '#' + ID + ' .cm-kpi:nth-child(1):before{content:"▥";}' +
      '#' + ID + ' .cm-kpi:nth-child(2):before{content:"↑";}' +
      '#' + ID + ' .cm-kpi:nth-child(3):before{content:"↓";}' +
      '#' + ID + ' .cm-kpi:nth-child(4):before{content:"▣";color:#ef4960;}' +
      '#' + ID + ' .cm-kpi:nth-child(5):before{content:"▤";}' +

      '#' + ID + ' .cm-kpi:nth-child(4):after{' +
        'background:#ffe8ed;' +
      '}' +

      '#' + ID + ' .cm-scope{' +
        'position:relative;' +
        'display:flex;' +
        'align-items:center;' +
        'min-height:45px;' +
        'margin:0 12px 10px;' +
        'padding:10px 12px 10px 43px;' +
        'border-radius:11px;' +
        'background:#f1f6fc;' +
        'color:#526173;' +
        'font-size:10px;' +
        'line-height:1.25;' +
        'overflow-wrap:anywhere;' +
      '}' +

      '#' + ID + ' .cm-scope:before{' +
        'content:"▣";' +
        'position:absolute;' +
        'left:14px;' +
        'top:50%;' +
        'transform:translateY(-50%);' +
        'font-size:18px;' +
        'font-weight:900;' +
        'color:#0877cf;' +
      '}' +

      '@media(max-width:480px){' +
        '#' + ID + ' .cm-head{' +
          'padding:13px 9px 7px;' +
          'min-height:70px;' +
        '}' +
        '#' + ID + ' .cm-title{' +
          'font-size:20px;' +
          'padding-right:174px;' +
        '}' +
        '#' + ID + ' .cm-actions{' +
          'top:8px;' +
          'right:8px;' +
          'gap:5px;' +
        '}' +
        '#' + ID + ' .cm-actions button{' +
          'width:38px;' +
          'min-width:38px;' +
          'height:38px;' +
          'min-height:38px;' +
          'border-radius:9px;' +
          'font-size:20px;' +
        '}' +
        '#' + ID + ' .cm-actions button:nth-child(2){' +
          'width:55px;' +
          'min-width:55px;' +
          'font-size:13px;' +
        '}' +
        '#' + ID + ' .cm-kpis{' +
          'gap:6px;' +
          'padding:0 8px 8px;' +
        '}' +
        '#' + ID + ' .cm-kpi{' +
          'min-height:72px;' +
          'padding:12px 49px 10px 11px;' +
          'border-radius:13px;' +
        '}' +
        '#' + ID + ' .cm-kpi strong{' +
          'font-size:18px;' +
        '}' +
        '#' + ID + ' .cm-kpi:after{' +
          'right:7px;' +
          'width:35px;' +
          'height:35px;' +
          'border-radius:10px;' +
        '}' +
        '#' + ID + ' .cm-kpi:before{' +
          'right:17px;' +
          'font-size:18px;' +
        '}' +
        '#' + ID + ' .cm-scope{' +
          'margin:0 8px 8px;' +
          'min-height:40px;' +
          'padding-left:38px;' +
          'font-size:9px;' +
        '}' +
      '}' +


    document.head.appendChild(s);

  }


  /* ==========================================================
     CLASIFICACIÓN DE EVENTOS
  ========================================================== */

  function cloneEvents(srcDay, btn){

    if(!srcDay || !btn) return;


    var nodes =
      srcDay.querySelectorAll('.b232261-event');


    for(var i=0;i<nodes.length;i++){

      var n =
        document.createElement('span');


      var c =
        nodes[i].className || '';


      n.className =
        'cm-event ' +

        (
          c.indexOf('real-in') >= 0
          ? 'cm-real-in'

          : c.indexOf('real-out') >= 0
          ? 'cm-real-out'

          : c.indexOf('plan-in') >= 0
          ? 'cm-plan-in'

          : c.indexOf('plan-out') >= 0
          ? 'cm-plan-out'

          : c.indexOf('gen') >= 0
          ? 'cm-gen'

          : c.indexOf('debt') >= 0
          ? 'cm-debt'

          : 'cm-plan-out'
        );


      n.textContent =
        text(nodes[i]);


      btn.appendChild(n);

    }


    var mini =
      srcDay.querySelectorAll(
        '.b232261-mini,.b232261-more'
      );


    for(var j=0;j<mini.length;j++){

      var m =
        document.createElement('span');


      m.className =
        'cm-mini ' +

        (
          mini[j].classList.contains(
            'b232261-pos'
          )
          ? 'cm-pos'

          : mini[j].classList.contains(
            'b232261-neg'
          )
          ? 'cm-neg'

          : ''
        );


      m.textContent =
        text(mini[j]);


      btn.appendChild(m);

    }

  }


  /* ==========================================================
     CONSTRUCCIÓN DE LA VISTA
  ========================================================== */

  function render(){

    if(rendering) return false;


    var r = root();

    var s = section();

    var src = source();


    if(!r || !s || !src){

      return false;

    }


    var grid =
      src.querySelector(
        '.b232261-grid.b232261-week'
      );


    /*
     * El calendario propietario genera:
     *
     * 7 encabezados
     * +
     * 42 días
     *
     * = 49 hijos directos.
     */

    if(!grid || grid.children.length < 49){

      return false;

    }


    rendering = true;


    try{

      css();


      /* ======================================================
         HOST
      ====================================================== */

      var host =
        document.getElementById(ID);


      if(!host){

        host =
          document.createElement('section');


        host.id = ID;


        /*
         * La nueva vista queda inmediatamente
         * antes del calendario propietario.
         */

        s.parentNode.insertBefore(
          host,
          s
        );

      }


      /*
       * Solo limpiamos nuestro propio host.
       */

      host.innerHTML = '';


      /* ======================================================
         CONTENEDOR PRINCIPAL
      ====================================================== */

      var shell =
        document.createElement('div');


      shell.className =
        'cm-shell';


      /* ======================================================
         CABECERA
      ====================================================== */

      var head =
        document.createElement('div');


      head.className =
        'cm-head';


      var eyebrow =
        document.createElement('div');


      eyebrow.className =
        'cm-eyebrow';


      eyebrow.textContent =
        'PERIODO';


      head.appendChild(eyebrow);


      var h =
        document.createElement('h2');


      h.className =
        'cm-title';


      h.textContent =
        text(
          src.querySelector(
            '.b232261-head h2'
          )
        ) || 'Calendario';


      head.appendChild(h);


      var sub =
        document.createElement('div');


      sub.className =
        'cm-sub';


      sub.textContent =
        text(
          src.querySelector(
            '.b232261-sub'
          )
        ) || 'Vista mensual';


      head.appendChild(sub);


      /* ======================================================
         ESTADO
      ====================================================== */

      var status =
        text(
          src.querySelector(
            '.b232261-status'
          )
        );


      if(status){

        var st =
          document.createElement('div');


        st.className =
          'cm-status';


        st.textContent =
          status;


        head.appendChild(st);

      }


      /* ======================================================
         NAVEGACIÓN
      ====================================================== */

      var actions =
        document.createElement('div');


      actions.className =
        'cm-actions';


      var sourceButtons =
        src.querySelectorAll(
          '.b232261-actions button'
        );


      /*
       * Orden real del calendario propietario:
       *
       * 0 = anterior
       * 1 = Hoy
       * 2 = siguiente
       * 3 = actualizar
       */

      var labels =
        [
          '‹',
          'Hoy',
          '›',
          '↻'
        ];


      for(
        var a=0;
        a<Math.min(sourceButtons.length,4);
        a++
      ){

        (function(srcBtn,i){

          var b =
            document.createElement('button');


          b.type =
            'button';


          b.textContent =
            labels[i] ||
            text(srcBtn);


          b.className =
            i === 1
            ? ''
            : 'secondary';


          b.onclick =
            function(){

              /*
               * Se delega la acción al calendario
               * propietario B232.26.4.
               */

              srcBtn.click();


              /*
               * Esperamos a que el propietario
               * termine de reconstruir su DOM.
               */

              setTimeout(
                function(){
                  render();
                },
                100
              );

            };


          actions.appendChild(b);

        })(sourceButtons[a],a);

      }


      head.appendChild(actions);


      shell.appendChild(head);


      /* ======================================================
         KPIs — FUENTE REAL DEL CALENDARIO PROPIETARIO
         B232.26.4 ya calcula estos valores. Esta capa SOLO
         presenta cinco indicadores del DOM existente:
         1) Ingresos reales
         2) Ingresos proyectados
         3) Egresos reales
         4) Obligaciones
         5) Saldo final

         No se recalculan importes aquí.
      ====================================================== */

      var kpis =
        document.createElement('div');

      kpis.className =
        'cm-kpis';

      var sourceKpis =
        src.querySelectorAll(
          '.b232261-kpi'
        );

      /*
       * Mapeamos por etiqueta, no por posición.
       * Esto evita que un cambio de orden en B232.26.4
       * altere el significado de los indicadores.
       */
      var wantedLabels =
        [
          'Ingresos reales',
          'Ingresos proyectados',
          'Egresos reales',
          'Obligaciones',
          'Saldo final'
        ];

      for(
        var wk=0;
        wk<wantedLabels.length;
        wk++
      ){

        var wanted =
          wantedLabels[wk];

        var sourceKpi =
          null;

        for(
          var sk=0;
          sk<sourceKpis.length;
          sk++
        ){

          var label =
            text(
              sourceKpis[sk].querySelector('span')
            );

          if(
            label.toLowerCase() ===
            wanted.toLowerCase()
          ){

            sourceKpi =
              sourceKpis[sk];

            break;

          }

        }

        /*
         * Si B232.26.4 todavía no terminó de pintar
         * un KPI, no inventamos un valor.
         */
        if(!sourceKpi){

          continue;

        }

        var kc =
          document.createElement('div');

        kc.className =
          'cm-kpi';

        kc.setAttribute(
          'data-kpi-label',
          wanted
        );

        var sp =
          document.createElement('span');

        sp.textContent =
          text(
            sourceKpi.querySelector('span')
          );

        var strong =
          document.createElement('strong');

        strong.textContent =
          text(
            sourceKpi.querySelector('strong')
          );

        kc.appendChild(sp);
        kc.appendChild(strong);

        kpis.appendChild(kc);

      }

      shell.appendChild(kpis);


      /* ======================================================
         CONTEXTO DEL PERÍODO / DÍA
         Se toma directamente del DOM propietario.
      ====================================================== */

      var scope =
        src.querySelector(
          '.b232261-scope'
        );

      if(scope){

        var sc =
          document.createElement('div');

        sc.className =
          'cm-scope';

        var scopeDate =
          scope.querySelector('span');

        var scopeMode =
          scope.querySelector('b');

        sc.textContent =
          (
            scopeMode
              ? text(scopeMode)
              : 'Día seleccionado'
          ) +
          (
            scopeDate
              ? ': ' + text(scopeDate)
              : ''
          );

        shell.appendChild(sc);

      }


      /* ======================================================
         GRILLA DE 7 COLUMNAS
      ====================================================== */

      var cal =
        document.createElement('div');


      cal.className =
        'cm-grid';


      var cells =
        grid.children;


      for(
        var i=0;
        i<cells.length;
        i++
      ){

        /*
         * Primeros 7 elementos:
         * encabezados DOM-SÁB.
         */

        if(i < 7){

          var wh =
            document.createElement('div');


          wh.className =
            'cm-week';


          wh.textContent =
            text(cells[i]);


          cal.appendChild(wh);

          continue;

        }


        /*
         * Los restantes 42 elementos
         * son los días.
         */

        (function(srcDay){

          var b =
            document.createElement('button');


          b.type =
            'button';


          b.className =
            'cm-day' +

            (
              srcDay.classList.contains(
                'out'
              )
              ? ' out'
              : ''
            ) +

            (
              srcDay.classList.contains(
                'selected'
              )
              ? ' selected'
              : ''
            );


          /* ================================================
             NÚMERO DEL DÍA
          ================================================= */

          var top =
            srcDay.querySelector(
              '.b232261-day-top'
            );


          var dt =
            document.createElement('div');


          dt.className =
            'cm-day-top';


          var dn =
            document.createElement('strong');


          dn.textContent =
            text(
              top &&
              top.querySelector('strong')
            );


          dt.appendChild(dn);


          var small =
            top &&
            top.querySelector('small');


          if(small){

            var sm =
              document.createElement('small');


            sm.textContent =
              text(small);


            dt.appendChild(sm);

          }


          b.appendChild(dt);


          /* ================================================
             EVENTOS
          ================================================= */

          cloneEvents(
            srcDay,
            b
          );


          /* ================================================
             SELECCIÓN
          ================================================= */

          b.onclick =
            function(){

              /*
               * Delegamos al botón propietario.
               * El calendario original conserva
               * toda su lógica.
               */

              srcDay.click();


              setTimeout(
                function(){
                  render();
                },
                80
              );

            };


          cal.appendChild(b);


        })(cells[i]);

      }


      var calendarWrap =
        document.createElement('div');


      calendarWrap.className =
        'cm-calendar-wrap';


      calendarWrap.appendChild(cal);


      shell.appendChild(calendarWrap);


      /* ======================================================
         DETALLE DEL DÍA
      ====================================================== */

      var detail =
        src.querySelector(
          '.b232261-detail'
        );


      if(detail){

        var dwrap =
          document.createElement('div');


        dwrap.className =
          'cm-detail';


        var boxes =
          detail.querySelectorAll(
            '.b232261-box'
          );


        for(
          var d=0;
          d<boxes.length;
          d++
        ){

          var detailClass =
            'cm-box';


          var hh =
            boxes[d].querySelector('h3');


          var headingText =
            hh
            ? text(hh)
            : '';


          if(/ingres|ganancias|cobros/i.test(headingText)){
            detailClass += ' cm-box-income';
          }else if(/gastos|cuotas|compromisos|pagos/i.test(headingText)){
            detailClass += ' cm-box-expense';
          }


          var box =
            document.createElement('div');


          box.className =
            detailClass;


          if(hh){

            var h3 =
              document.createElement('h3');


            h3.textContent =
              headingText;


            box.appendChild(h3);

          }


          var body =
            document.createElement('div');


          body.className =
            'cm-box-body';


          var completeText =
            text(boxes[d]);


          body.textContent =
            completeText
              .replace(
                headingText,
                ''
              )
              .trim();


          box.appendChild(body);


          dwrap.appendChild(box);

        }


        shell.appendChild(dwrap);

      }


      /* ======================================================
         MONTAJE
      ====================================================== */

      host.appendChild(shell);


      /*
       * El calendario propietario sigue existiendo.
       *
       * Solo se oculta visualmente.
       *
       * NO se elimina.
       * NO se modifica su motor.
       */

      src.style.setProperty(
        'display',
        'none',
        'important'
      );


      /*
       * Garantizamos que la sección móvil
       * pueda contener la vista completa.
       */

      s.style.setProperty(
        'width',
        '100%',
        'important'
      );


      s.style.setProperty(
        'max-width',
        '100%',
        'important'
      );


      s.style.setProperty(
        'min-width',
        '0',
        'important'
      );


      s.style.setProperty(
        'overflow',
        'visible',
        'important'
      );


      return true;


    }catch(error){

      console.error(
        '[CCF CALENDAR MOBILE B4.3.17]',
        error
      );


      return false;


    }finally{

      rendering =
        false;

    }

  }


  /* ==========================================================
     OBSERVADOR SEGURO
     
     IMPORTANTE:
     NO volver a renderizar cuando la modificación
     proviene de nuestra propia vista.
  ========================================================== */

  function observe(){

    if(observer){

      observer.disconnect();

      observer = null;

    }


    var s =
      section();


    if(!s){

      return;

    }


    observer =
      new MutationObserver(
        function(mutations){

          if(rendering){

            return;

          }


          var mustRender =
            false;


          for(
            var i=0;
            i<mutations.length;
            i++
          ){

            var m =
              mutations[i];


            /*
             * Si la modificación ocurre dentro
             * de nuestra propia vista, ignorarla.
             */

            if(
              m.target &&
              (
                m.target.id === ID ||
                (
                  typeof m.target.closest ===
                  'function' &&
                  m.target.closest('#' + ID)
                )
              )
            ){

              continue;

            }


            /*
             * Si alguno de los nodos afectados
             * pertenece a nuestra vista, ignorar.
             */

            var affectedByOwnView =
              false;


            var added =
              m.addedNodes || [];


            for(
              var a=0;
              a<added.length;
              a++
            ){

              if(
                added[a].nodeType === 1 &&
                (
                  added[a].id === ID ||
                  (
                    typeof added[a].closest ===
                    'function' &&
                    added[a].closest('#' + ID)
                  )
                )
              ){

                affectedByOwnView =
                  true;

                break;

              }

            }


            if(affectedByOwnView){

              continue;

            }


            var removed =
              m.removedNodes || [];


            for(
              var r=0;
              r<removed.length;
              r++
            ){

              if(
                removed[r].nodeType === 1 &&
                (
                  removed[r].id === ID ||
                  (
                    typeof removed[r].closest ===
                    'function' &&
                    removed[r].closest('#' + ID)
                  )
                )
              ){

                affectedByOwnView =
                  true;

                break;

              }

            }


            if(affectedByOwnView){

              continue;

            }


            /*
             * Cualquier modificación restante
             * puede provenir del calendario propietario.
             */

            if(
              m.type === 'childList' ||
              m.type === 'characterData'
            ){

              mustRender =
                true;

              break;

            }

          }


          if(!mustRender){

            return;

          }


          clearTimeout(
            renderTimer
          );


          renderTimer =
            setTimeout(
              function(){

                if(
                  !root() ||
                  !section()
                ){

                  return;

                }


                /*
                 * Verificamos nuevamente que
                 * el calendario propietario exista.
                 */

                if(source()){

                  render();

                }

              },
              100
            );

        }
      );


    observer.observe(
      s,
      {
        childList:true,
        subtree:true,
        characterData:true
      }
    );

  }


  /* ==========================================================
     INICIO
  ========================================================== */

  function start(){

    var r =
      root();


    var s =
      section();


    /*
     * El script puede estar cargado cuando
     * la shell móvil todavía no existe.
     */

    if(!r || !s){

      return false;

    }


    /*
     * Intentamos renderizar.
     */

    var ok =
      render();


    if(!ok){

      return false;

    }


    /*
     * Una vez que la vista existe,
     * dejamos de utilizar el timer.
     */

    if(timer){

      clearInterval(timer);

      timer = null;

    }


    /*
     * Solo instalamos el observer una vez.
     */

    if(!started){

      observe();

      started = true;

    }


    return true;

  }


  /* ==========================================================
     BOOT CON REINTENTOS
  ========================================================== */

  function boot(){

    if(timer){

      clearInterval(timer);

    }


    var tries =
      0;


    timer =
      setInterval(
        function(){

          /*
           * Si la vista ya está funcionando,
           * se detiene el polling.
           */

          if(
            start() ||
            ++tries >= 40
          ){

            clearInterval(timer);

            timer = null;

          }

        },
        250
      );


    /*
     * Primer intento inmediato.
     */

    start();

  }


  /* ==========================================================
     ARRANQUE
  ========================================================== */

  if(
    document.readyState ===
    'loading'
  ){

    document.addEventListener(
      'DOMContentLoaded',
      boot,
      {once:true}
    );

  }else{

    boot();

  }


  /* ==========================================================
     API DE DIAGNÓSTICO
  ========================================================== */

  window.CCFCalendarMobileDirect = {

    version:'B4.3.17-PREMIUM-TEST',

    render:function(){

      return render();

    },

    start:function(){

      return start();

    },

    status:function(){

      return {

        version:'B4.3.17-PREMIUM-TEST',

        mobileRoot:!!root(),

        calendarSection:!!section(),

        sourceCalendar:!!source(),

        mobileView:!!document.getElementById(ID),

        rendering:rendering

      };

    }

  };


})();

