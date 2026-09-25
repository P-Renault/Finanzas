(function(){
  'use strict';
  if (window.__CCF_SOMOS_FOOTER__) return;
  window.__CCF_SOMOS_FOOTER__ = true;

  var VERSION = 'B2.30.5';
  var LOGO = 'somos-software-logo.jpg?v=1';

  var TECH_IDS = [
    'b23273-bridge-badge',
    'b23274Footer',
    'b23269-footer',
    'b2310-deudas-badge',
    'b231-adaptador-badge',
    'ccf-release-footer'
  ];

  function removeTechnicalArtifacts(){
    TECH_IDS.forEach(function(id){
      var el=document.getElementById(id);
      if(el) el.remove();
    });

    Array.prototype.slice.call(document.querySelectorAll('body *')).forEach(function(el){
      if(el.id==='ccf-somos-software-footer') return;
      var text=(el.textContent||'').trim();
      if(!text) return;
      if(text.indexOf('Paquete desplegado:')!==-1 && text.length<180){
        el.remove();
      }
    });
  }

  function footerHTML(){
    return ''+
      '<footer class="ccf-somos-footer" id="ccf-somos-software-footer" aria-label="Producto desarrollado por Somos Software">'+
        '<div class="ccf-somos-footer-line"></div>'+
        '<img class="ccf-somos-logo" src="'+LOGO+'" alt="Somos Software · Innovación Digital" loading="lazy">'+
        '<div class="ccf-somos-footer-text">Producto desarrollado por <strong>Somos Software</strong></div>'+
        '<div class="ccf-somos-footer-version">CCF · '+VERSION+'</div>'+
      '</footer>';
  }

  function ensureStyles(){
    if(document.getElementById('ccf-somos-footer-style')) return;
    var style=document.createElement('style');
    style.id='ccf-somos-footer-style';
    style.textContent=''+
      '.ccf-somos-footer{margin:28px 0 4px;padding:18px 12px 20px;text-align:center;border-top:1px solid #e5e7eb;background:transparent;box-sizing:border-box;}'+
      '.ccf-somos-footer-line{height:1px;background:#eef2f7;margin:0 auto 16px;max-width:720px;}'+
      '.ccf-somos-logo{display:block;width:min(250px,72vw);height:auto;max-height:86px;object-fit:contain;margin:0 auto 9px;border:0;}'+
      '.ccf-somos-footer-text{font:600 12px/1.45 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#64748b;}'+
      '.ccf-somos-footer-text strong{color:#1f2937;}'+
      '.ccf-somos-footer-version{margin-top:5px;font:500 10px/1.3 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#94a3b8;}'+
      '@media(max-width:480px){.ccf-somos-footer{margin-top:22px;padding:15px 10px 18px}.ccf-somos-logo{width:min(210px,78vw);max-height:72px}.ccf-somos-footer-text{font-size:11px}.ccf-somos-footer-version{font-size:9px}}';
    document.head.appendChild(style);
  }

  function addToModules(){
    var modules=Array.prototype.slice.call(document.querySelectorAll('.tab'));
    modules.forEach(function(module){
      if(!module.id) return;
      if(module.querySelector(':scope > .ccf-somos-footer')) return;
      var footer=document.createElement('footer');
      footer.className='ccf-somos-footer';
      footer.setAttribute('aria-label','Producto desarrollado por Somos Software');
      footer.innerHTML=footerHTML().replace(/^<footer[^>]*>|<\/footer>$/g,'');
      module.appendChild(footer);
    });
  }

  function init(){
    ensureStyles();
    removeTechnicalArtifacts();
    addToModules();
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',init,{once:true});
  }else{
    init();
  }

  if(window.MutationObserver){
    var observer=new MutationObserver(function(){
      removeTechnicalArtifacts();
      addToModules();
    });
    observer.observe(document.body,{childList:true,subtree:true});
    setTimeout(function(){observer.disconnect();},15000);
  }
})();
