/*
 * B232.51.2 · RUNTIME HARDENING
 * Protección de handlers de edición frente a DOM incompleto.
 * No modifica Supabase ni cálculos financieros.
 */
(function(){
  'use strict';
  if(window.B232512Hardening) return;

  var VERSION='232.51.2';
  var wrapped={};

  function $(id){return document.getElementById(id);}
  function required(ids){
    for(var i=0;i<ids.length;i++) if(!$(ids[i])) return false;
    return true;
  }
  function status(message){
    var el=$('appStatus');
    if(el) el.textContent=message;
  }
  function wrap(name,ids){
    if(wrapped[name]) return;
    var original=window[name];
    if(typeof original!=='function') return;
    window[name]=function(){
      if(!required(ids)){
        status('Módulo todavía en inicialización. La edición se reintentará cuando el formulario esté disponible.');
        console.warn('[B232.51.2] DOM incompleto para '+name,ids);
        return;
      }
      return original.apply(this,arguments);
    };
    wrapped[name]=true;
  }
  function install(){
    wrap('editMovEncoded',['movId','movTipo','movFecha','movMonto','movCategoria','movDescripcion','movFormTitle','movSubmit','movCancel']);
    wrap('editFutureEncoded',['futureId','futureConcepto','futureFecha','futureMonto','futureCategoria','futureRecurrence','futureNotas','futureFormTitle','futureSubmit','futureCancel']);
    wrap('editSavingEncoded',['savingId','savingTipo','savingFecha','savingMonto','savingDescripcion','savingFormTitle','savingSubmit','savingCancel']);
    wrap('editarCuenta23',['cuentaId','cuentaBanco','cuentaNombre','cuentaTipo','cuentaIdentificador','cuentaApertura','cuentaFecha','cuentaNotas','cuentaSubmit','cuentaCancel']);
    wrap('editarDeuda23',['deudaId','deudaTipo','deudaAcreedor','deudaConcepto','deudaMonto','deudaSaldo','deudaTasa','deudaModalidad','deudaCuotas','deudaCuota','deudaInicio','deudaPrimeraCuota','deudaFrecuencia','deudaNotas','deudaSubmit','deudaCancel']);
  }
  function boot(){
    install();
    setTimeout(install,900);
    setTimeout(install,1800);
    setTimeout(install,3000);
  }
  window.B232512Hardening={version:VERSION,install:install,wrapped:wrapped};
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
