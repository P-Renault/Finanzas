/* CCF SUPABASE BOOTSTRAP 231.4 — authentication-safe
   Does not create a Supabase client. It only guarantees the UMD library
   exists before CCF-AUTH-BOOT-FINAL.js runs.
*/
(function(){
  'use strict';

  var READY='__CCF_SUPABASE_LIBRARY_READY__';
  var sources=[
    'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',
    'https://unpkg.com/@supabase/supabase-js@2/dist/umd/supabase.min.js'
  ];

  function isReady(){
    return !!(window.supabase && typeof window.supabase.createClient==='function');
  }

  window.__CCF_SUPABASE_LIBRARY_PROMISE__=new Promise(function(resolve){
    if(isReady()){window[READY]=true;resolve(true);return;}

    var i=0, settled=false, timer=null;

    function finish(ok){
      if(settled)return;
      settled=true;
      if(timer)clearTimeout(timer);
      window[READY]=!!ok;
      resolve(!!ok);
    }

    function next(){
      if(isReady()){finish(true);return;}
      if(i>=sources.length){finish(false);return;}

      var src=sources[i++];
      var s=document.createElement('script');
      s.src=src;
      s.async=false;

      var timeout=setTimeout(function(){
        try{s.remove()}catch(_){}
        next();
      },4000);

      s.onload=function(){
        clearTimeout(timeout);
        if(isReady())finish(true);
        else next();
      };
      s.onerror=function(){
        clearTimeout(timeout);
        try{s.remove()}catch(_){}
        next();
      };

      document.head.appendChild(s);
    }

    next();
  });
})();
