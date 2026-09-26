/* CCF SUPABASE SAFE LOADER 231.3
   Only guarantees that the existing Supabase UMD library is available before
   CCF-AUTH-BOOT-FINAL.js executes. It does NOT create a client or alter auth.
*/
(function(){
  'use strict';
  if (window.supabase && typeof window.supabase.createClient === 'function') return;

  var urls = [
    'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',
    'https://unpkg.com/@supabase/supabase-js@2/dist/umd/supabase.min.js'
  ];

  function load(i){
    if(window.supabase && typeof window.supabase.createClient === 'function') return;
    if(i>=urls.length){
      console.error('[CCF] No fue posible cargar la biblioteca Supabase.');
      return;
    }
    var s=document.createElement('script');
    s.src=urls[i];
    s.async=false;
    s.onload=function(){
      if(window.supabase && typeof window.supabase.createClient==='function'){
        window.__CCF_SUPABASE_LIBRARY_READY__=true;
      }else load(i+1);
    };
    s.onerror=function(){ load(i+1); };
    document.head.appendChild(s);
  }
  load(0);
})();
