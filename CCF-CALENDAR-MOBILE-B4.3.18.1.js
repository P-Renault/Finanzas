
(function(){
  'use strict';

  var ID = 'ccf-calendar-mobile-premium-b4-3-18-1-after17';
  var SOURCE = 'ccf-calendar-mobile-direct-b4-3-17';
  var timer = null;
  var observer = null;
  var rendering = false;

  function sourceHost(){
    return document.getElementById(SOURCE);
  }


  function wireButtons(clone, original){
    var a = clone.querySelectorAll('.cm-actions button');
    var b = original.querySelectorAll('.cm-actions button');

    for(var i=0;i<a.length && i<b.length;i++){
      (function(dst,src){
        dst.onclick = function(){
          src.click();
          setTimeout(render,120);
        };
      })(a[i],b[i]);
    }

    var daysA = clone.querySelectorAll('.cm-day');
    var daysB = original.querySelectorAll('.cm-day');

    for(var d=0;d<daysA.length && d<daysB.length;d++){
      (function(dst,src){
        dst.onclick = function(){
          src.click();
          setTimeout(render,100);
        };
      })(daysA[d],daysB[d]);
    }
  }

  /*
   * ============================================================
   * DETALLE PREMIUM — FUENTE DIRECTA DEL CALENDARIO PROPIETARIO
   *
   * Esta sección no reconstruye importes.
   * Copia la estructura completa de .b232261-detail que ya
   * genera B232.26.4. De esta manera se conserva:
   * - encabezado del día + fecha
   * - resumen de rentabilidad
   * - ingresos y rentabilidad
   * - egresos, pagos y obligaciones
   * - control de caja
   * - textos auxiliares
   * - valores reales/proyectados
   *
   * La capa Premium solamente cambia presentación.
   * ============================================================
   */
  function appendPremiumDetail(host){
    var section = document.getElementById('calendario');
    if(!section) return;

    var originalDetail = section.querySelector('.b232261-card .b232261-detail');
    if(!originalDetail) return;

    var wrap = document.createElement('section');
    wrap.className = 'p181-detail-wrap';

    var detail = originalDetail.cloneNode(true);

    /* Evitar IDs duplicados. */
    detail.querySelectorAll('[id]').forEach(function(el){
      el.removeAttribute('id');
    });

    detail.classList.add('p181-source-detail');

    wrap.appendChild(detail);
    host.appendChild(wrap);
  }

  function render(){
    if(rendering) return false;

    var original = sourceHost();
    if(!original) return false;

    var shell = original.querySelector('.cm-shell');
    if(!shell) return false;

    rendering = true;

    try{
      var host = document.getElementById(ID);

      if(!host){
        host = document.createElement('section');
        host.id = ID;

        /* Integración: la vista Premium B4.3.18.1 es la vista principal.
         * B4.3.17 permanece como motor/base técnico y se mantiene en DOM.
         */
        original.parentNode.insertBefore(host, original);
      }

      host.innerHTML = '';

      var clone = shell.cloneNode(true);

      /* Evitar IDs duplicados si aparecieran en futuras revisiones. */
      clone.querySelectorAll('[id]').forEach(function(el){
        el.removeAttribute('id');
      });

      clone.className = 'p181-shell';

      /*
       * La vista 18.1 conserva el calendario completo de B4.3.17.
       * Su detalle resumido interno se elimina porque debajo
       * construiremos el detalle Premium completo desde
       * B232.26.4.
       */
      var oldDetail = clone.querySelector('.cm-detail');
      if(oldDetail){
        oldDetail.remove();
      }

      host.appendChild(clone);

      wireButtons(clone, original);

      /*
       * A continuación del calendario:
       * detalle completo con la estructura de la imagen de referencia.
       */
      appendPremiumDetail(host);

      return true;

    }catch(error){
      console.error('[CCF B4.3.18.1 PREMIUM TEST]', error);
      return false;
    }finally{
      rendering = false;
    }
  }


  /* ============================================================
     INTEGRACIÓN B4.3.18.1
     - B4.3.17 permanece intacto en index.html.
     - La vista Premium queda arriba.
     - El calendario propietario queda visible debajo como vista
       secundaria de validación.
     - La vista Bootstrap paralela B4.3.10 se oculta para evitar
       una tercera representación visual.
  ============================================================ */
  function sourceCalendar(){
    var section=document.getElementById('calendario');
    return section ? section.querySelector('.b232261-card') : null;
  }

  function setImportant(el,property,value){
    if(!el) return;
    if(el.style.getPropertyValue(property)!==value ||
       el.style.getPropertyPriority(property)!=='important'){
      el.style.setProperty(property,value,'important');
    }
  }

  function maintainPresentation(){
    var base=document.getElementById(SOURCE);
    var premium=document.getElementById(ID);
    var source=sourceCalendar();
    var bootstrap=document.getElementById('ccf-bs-calendar-view');

    if(premium && base && premium.parentNode===base.parentNode &&
       base.previousElementSibling!==premium){
      base.parentNode.insertBefore(premium,base);
    }

    setImportant(base,'display','none');
    setImportant(bootstrap,'display','none');
    setImportant(source,'display','block');
  }

  function startPresentationBridge(){
    maintainPresentation();

    var section=document.getElementById('calendario');
    if(!section || section.__ccfB4318Bridge) return;
    section.__ccfB4318Bridge=true;

    var bridgeObserver=new MutationObserver(function(){
      window.clearTimeout(bridgeObserver.__timer);
      bridgeObserver.__timer=window.setTimeout(maintainPresentation,20);
    });

    bridgeObserver.observe(section,{
      childList:true,
      subtree:true,
      attributes:true,
      attributeFilter:['style','class']
    });

    section.__ccfB4318BridgeObserver=bridgeObserver;
  }

  function observe(){
    if(observer) return;

    var original = sourceHost();
    if(!original) return;

    observer = new MutationObserver(function(mutations){
      if(rendering) return;

      var changed = false;

      for(var i=0;i<mutations.length;i++){
        var m = mutations[i];

        if(m.target && typeof m.target.closest === 'function' &&
           m.target.closest('#' + ID)){
          continue;
        }

        changed = true;
        break;
      }

      if(!changed) return;

      clearTimeout(observer.__timer);
      observer.__timer = setTimeout(function(){
        render();
      },120);
    });

    observer.observe(original,{
      childList:true,
      subtree:true,
      characterData:true,
      attributes:true,
      attributeFilter:['class']
    });
  }

  function boot(){
    if(timer) clearInterval(timer);

    var tries = 0;

    timer = setInterval(function(){
      if(render() || ++tries >= 40){
        clearInterval(timer);
        timer = null;

        if(sourceHost()) observe();
      }
    },250);

    render();

    if(sourceHost()) observe();
    startPresentationBridge();
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded',boot,{once:true});
  }else{
    boot();
  }

  window.CCFCalendarMobilePremium181 = {
    version:'B4.3.18.1-PREMIUM-TEST-OVER-17',
    render:render,
    status:function(){
      return {
        base17:!!sourceHost(),
        premium181:!!document.getElementById(ID),
        primary:!!(
          sourceHost() &&
          document.getElementById(ID) &&
          sourceHost().previousElementSibling === document.getElementById(ID)
        ),
        secondaryCalendar:!!sourceCalendar(),
        secondaryVisible:!!(
          sourceCalendar() &&
          getComputedStyle(sourceCalendar()).display !== 'none'
        )
      };
    }
  };

})();