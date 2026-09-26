/* CCF AUTH PREBOOT 231.4
   Prevents the auth boot from racing the Supabase UMD loader.
   The original CCF-AUTH-BOOT-FINAL.js remains untouched.
*/
(function(){
'use strict';
var p=window.__CCF_SUPABASE_LIBRARY_PROMISE__;
if(!p)return;
if(window.__CCF_AUTH_PREBOOT_2314__)return;
window.__CCF_AUTH_PREBOOT_2314__=true;

p.then(function(ok){
  if(!ok){
    var s=document.getElementById('ccf-auth-status');
    if(s){
      s.textContent='No se pudo cargar el servicio de acceso. Recarga la página.';
      s.style.color='#fecaca';
    }
    console.error('[CCF] Supabase library unavailable');
  }
});
})();
