/* CCF ACCESS FLOW FIX B1.9.4
   Scope: startup/authentication flow only.
   Does not alter Calendar, financial modules, Supabase schema or data.
   Intended to run immediately before B230-PORTAL-ACCESO-FINAL-PREMIUM-1.1.js.
*/
(function(){
  'use strict';
  if(window.__CCF_ACCESS_FLOW_FIX_B194__) return;
  window.__CCF_ACCESS_FLOW_FIX_B194__=true;

  var HIDDEN_IDS=['ccf-topbar','configPanel','app','ccf-product-footer'];

  function hideLegacyShell(){
    HIDDEN_IDS.forEach(function(id){
      var el=document.getElementById(id);
      if(el) el.classList.add('hidden');
    });
    var cfg=document.getElementById('configPanel');
    if(cfg){
      cfg.setAttribute('aria-hidden','true');
      cfg.style.display='none';
    }
  }

  function showAppDashboard(){
    var app=document.getElementById('app');
    if(app){
      app.classList.remove('hidden','b230-hidden-app');
      app.style.removeProperty('display');
      app.removeAttribute('aria-hidden');
    }
    var top=document.getElementById('ccf-topbar');
    if(top) top.classList.remove('hidden');
    var foot=document.getElementById('ccf-product-footer');
    if(foot) foot.classList.remove('hidden');
    var cfg=document.getElementById('configPanel');
    if(cfg){
      cfg.classList.add('hidden');
      cfg.style.display='none';
      cfg.setAttribute('aria-hidden','true');
    }

    try{localStorage.setItem('cf_active_tab_v2','dashboard')}catch(_){}

    var navigate=function(){
      if(window.B23223Navigation &&
         typeof window.B23223Navigation.navigate==='function'){
        window.B23223Navigation.navigate('dashboard');
        return true;
      }
      var tabs=document.querySelectorAll('.tab');
      if(!tabs.length) return false;
      tabs.forEach(function(s){s.classList.toggle('hidden',s.id!=='dashboard')});
      document.querySelectorAll('.tabs button[data-tab]').forEach(function(b){
        b.classList.toggle('active',b.dataset.tab==='dashboard');
      });
      return true;
    };

    navigate();
    window.setTimeout(navigate,80);
    window.setTimeout(navigate,350);
    window.setTimeout(navigate,900);

    // Let the financial engine refresh after the authenticated client exists.
    window.setTimeout(function(){
      try{
        if(typeof window.refresh==='function') window.refresh();
      }catch(_){}
    },120);
  }

  function scrubSupabaseUi(root){
    var scope=root && root.querySelectorAll ? root : document;
    scope.querySelectorAll('input,textarea,select,label,p,span,div,small,strong').forEach(function(el){
      var t=(el.textContent||'').trim();
      var v=(el.value||'').trim();
      var hit=/supabase\.co|sb_publishable_|SUPABASE_URL|SUPABASE_KEY/i.test(t+' '+v);
      if(!hit) return;

      // Never touch application source/script elements.
      if(el.closest('script,style')) return;

      // Legacy connection fields are never part of the access flow.
      if(el.id==='supabaseUrl'||el.id==='supabaseKey'||
         el.closest('#configPanel')){
        if(el.id) el.value='';
        el.classList.add('hidden');
        return;
      }

      // If a login gate accidentally renders technical connection data,
      // remove only that technical node.
      if(el.closest('#ccf-auth-gate')){
        el.remove();
      }
    });
  }

  // Prevent the legacy app.js connection form from becoming an access path.
  function patchConnect(){
    window.connect=function(){
      var client=window.supabaseClient||window.db||window.__db||
        window.__B23273_CLIENT__||window.__B23270_CLIENT__||window.__B23269_CLIENT__;
      if(!client){
        return Promise.resolve(false);
      }
      showAppDashboard();
      return Promise.resolve(true);
    };
  }

  function bindAuth(){
    var client=window.supabaseClient||window.__B23273_CLIENT__||
      window.__B23270_CLIENT__||window.__B23269_CLIENT__;

    if(!client || !client.auth) return false;

    try{
      client.auth.onAuthStateChange(function(_event,session){
        if(session){
          showAppDashboard();
          var gate=document.getElementById('ccf-auth-gate');
          if(gate) gate.remove();
        }else{
          hideLegacyShell();
        }
      });
      client.auth.getSession().then(function(result){
        if(result && result.data && result.data.session) showAppDashboard();
        else hideLegacyShell();
      }).catch(function(){hideLegacyShell()});
      return true;
    }catch(_){
      return false;
    }
  }

  function start(){
    hideLegacyShell();
    patchConnect();
    scrubSupabaseUi(document);
    bindAuth();

    if(window.MutationObserver && document.body){
      var observer=new MutationObserver(function(mutations){
        mutations.forEach(function(m){
          m.addedNodes.forEach(function(node){
            if(node.nodeType===1){
              scrubSupabaseUi(node);
              if(node.id==='ccf-auth-gate') bindAuth();
            }
          });
        });
      });
      observer.observe(document.body,{childList:true,subtree:true});
    }

    // Auth boot is loaded before this fix in index.html. Poll briefly so
    // the authenticated client is captured as soon as it is installed.
    var tries=0;
    var timer=setInterval(function(){
      tries++;
      if(bindAuth() || tries>=80) clearInterval(timer);
    },100);
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',start,{once:true});
  }else{
    start();
  }
})();
