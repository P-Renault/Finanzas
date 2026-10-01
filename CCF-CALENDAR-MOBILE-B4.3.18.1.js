
(function(){
  'use strict';

  var ID = 'ccf-calendar-mobile-premium-b4-3-18-1-after17';
  var SOURCE = 'ccf-calendar-mobile-direct-b4-3-17'; // technical source host only; never displayed
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
      /*
       * POSICIÓN DEFINITIVA B4.3.18.1:
       * el Premium pertenece visualmente al MÓDULO CALENDARIO, pero su
       * contenedor se monta inmediatamente después de la barra azul
       * .b434-header de la shell móvil.
       *
       * Esto evita que quede debajo del contenido del Resumen y evita
       * que el calendario herede el orden vertical del módulo host.
       */
      var mobileRoot = document.getElementById('ccf-mobile-b43');
      var blueHeader = mobileRoot && mobileRoot.querySelector('.b434-header');
      var host = document.getElementById(ID);

      if(!host){
        host = document.createElement('section');
        host.id = ID;
      }

      if(blueHeader && blueHeader.parentNode){
        if(blueHeader.nextElementSibling !== host){
          blueHeader.parentNode.insertBefore(host, blueHeader.nextElementSibling);
        }
      }else if(original.parentNode && host.parentNode !== original.parentNode){
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
    var mobileRoot=document.getElementById('ccf-mobile-b43');
    var moduleHost=mobileRoot && mobileRoot.querySelector('[data-module-host]');
    var activeModule=moduleHost && moduleHost.getAttribute('data-active-module');
    var calendarActive=activeModule==='calendario';
    var blueHeader=mobileRoot && mobileRoot.querySelector('.b434-header');

    /* La Premium solo se muestra cuando el usuario está dentro del módulo
       Calendario. Nunca aparece en Resumen ni en otro módulo. */
    if(premium){
      if(calendarActive && blueHeader && blueHeader.parentNode){
        if(blueHeader.nextElementSibling!==premium){
          blueHeader.parentNode.insertBefore(premium,blueHeader.nextElementSibling);
        }
        setImportant(premium,'display','block');
      }else{
        setImportant(premium,'display','none');
      }
    }

    /*
     * MODO FINAL: la vista anterior NO se muestra.
     * B4.3.17 y B232.26.4 permanecen únicamente como fuentes DOM
     * para que Premium 18.1 pueda leer/copiar los datos existentes.
     * La única representación visual del módulo Calendario es Premium.
     */
    setImportant(base,'display','none');
    setImportant(bootstrap,'display','none');
    setImportant(source,'display','none');
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

    /* El router móvil cambia data-active-module al navegar. Se observa
       esa señal para ocultar Premium al salir de Calendario y volver a
       colocarlo inmediatamente bajo la barra azul al regresar. */
    if(mobileRoot && !mobileRoot.__ccfB4318RootObserver){
      var rootObserver=new MutationObserver(function(){
        window.clearTimeout(rootObserver.__timer);
        rootObserver.__timer=window.setTimeout(maintainPresentation,20);
      });
      rootObserver.observe(mobileRoot,{subtree:true,attributes:true,attributeFilter:['data-active-module','class']});
      mobileRoot.__ccfB4318RootObserver=rootObserver;
    }
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
    version:'B4.3.18.1-PREMIUM-SINGLE-VIEW',
    render:render,
    status:function(){
      return {
        base17:!!sourceHost(),
        premium181:!!document.getElementById(ID),
        primary:!!(
          document.getElementById(ID) &&
          document.getElementById('ccf-mobile-b43') &&
          document.getElementById('ccf-mobile-b43').querySelector('.b434-header') &&
          document.getElementById('ccf-mobile-b43').querySelector('.b434-header').nextElementSibling === document.getElementById(ID)
        ),
        secondaryCalendar:!!sourceCalendar(),
        secondaryVisible:!!(
          sourceCalendar() &&
          getComputedStyle(sourceCalendar()).display !== 'none'
        ),
        previousViewsHidden:!!(
          (!sourceHost() || getComputedStyle(sourceHost()).display === 'none') &&
          (!sourceCalendar() || getComputedStyle(sourceCalendar()).display === 'none') &&
          (!document.getElementById('ccf-bs-calendar-view') || getComputedStyle(document.getElementById('ccf-bs-calendar-view')).display === 'none')
        )
      };
    }
  };

})();