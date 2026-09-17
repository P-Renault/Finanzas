/* FINANZAS B2.14 — Runtime estable / carga progresiva */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const setMsg = text => { const el=$('configMsg'); if(el) el.textContent=text; };
  const sleep = ms => new Promise(r=>setTimeout(r,ms));
  const loaded = new Set();
  let booting = false;

  function addScript(src){
    return new Promise((resolve,reject)=>{
      if(loaded.has(src) || document.querySelector(`script[data-fin-runtime="${src}"]`)){ loaded.add(src); resolve(); return; }
      const s=document.createElement('script');
      s.src=src; s.async=false; s.dataset.finRuntime=src;
      s.onload=()=>{loaded.add(src);resolve();};
      s.onerror=()=>reject(new Error(`No se pudo cargar ${src}`));
      document.body.appendChild(s);
    });
  }

  async function loadFeature(name){
    const map={
      core:'finanzas-v233.js?v=214',
      operations:'b212-centro-operaciones.js?v=214',
      payments:'b211-registro-pagos-mixtos.js?v=214'
    };
    if(!map[name]) return;
    try { await addScript(map[name]); }
    catch(e){ console.error('Finanzas feature',name,e); setMsg('Módulo '+name+' no pudo cargarse: '+e.message); }
  }

  function installLazyTabs(){
    const tabs=document.querySelector('.tabs');
    if(!tabs) return;
    // Operaciones se anuncia sin ejecutar su módulo durante el arranque.
    let op=tabs.querySelector('[data-tab="operaciones"]');
    if(!op){
      op=document.createElement('button');
      op.type='button'; op.dataset.tab='operaciones'; op.textContent='Operaciones';
      tabs.appendChild(op);
    }
    if(!op.dataset.lazyHook){
      op.dataset.lazyHook='1';
      op.addEventListener('click',async ()=>{
        await loadFeature('operations');
        document.querySelectorAll('.tabs button').forEach(x=>x.classList.remove('active'));
        op.classList.add('active');
        document.querySelectorAll('.tab').forEach(x=>x.classList.add('hidden'));
        document.getElementById('operaciones')?.classList.remove('hidden');
      });
    }

    const debtButton=tabs.querySelector('[data-tab="deudas"]');
    if(debtButton && !debtButton.dataset.paymentHook){
      debtButton.dataset.paymentHook='1';
      debtButton.addEventListener('click',()=>loadFeature('payments'),{once:true});
    }
  }

  async function startFeatures(){
    if(booting) return;
    booting=true;
    try{
      await loadFeature('core');
      await sleep(150);
      installLazyTabs();
      setTimeout(installLazyTabs,600);
    } finally { booting=false; }
  }

  async function connectFixed(){
    const url=$('supabaseUrl')?.value.trim();
    const key=$('supabaseKey')?.value.trim();
    if(!url||!key){setMsg('Completa URL y clave de Supabase.');return;}
    if(!window.supabase){setMsg('No se cargó Supabase. Recarga la página.');return;}

    const btn=$('saveConfig');
    if(btn){btn.disabled=true;btn.textContent='Conectando…';}
    setMsg('Probando conexión con Supabase…');

    try{
      const client=window.supabase.createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
      const probes=[
        ()=>client.from('movimientos').select('id').limit(1),
        ()=>client.from('cierres_financieros').select('id').limit(1),
        ()=>client.from('deudas').select('id').limit(1)
      ];
      let error=null,ok=false;
      for(const fn of probes){
        try{
          const r=await Promise.race([fn(),new Promise((_,rej)=>setTimeout(()=>rej(new Error('Tiempo de espera de Supabase agotado')),10000))]);
          if(!r.error){ok=true;break;}
          error=r.error;
        }catch(e){error=e;}
      }
      if(!ok) throw error||new Error('Supabase no respondió.');

      localStorage.setItem('sf_url',url);
      localStorage.setItem('sf_key',key);
      $('configPanel')?.classList.add('hidden');
      $('app')?.classList.remove('hidden');
      $('logoutBtn')?.classList.remove('hidden');

      if(typeof window.refresh==='function'){
        await Promise.race([
          window.refresh(),
          new Promise((_,rej)=>setTimeout(()=>rej(new Error('Carga inicial agotó el tiempo')),12000))
        ]).catch(e=>console.warn('refresh inicial:',e));
      }

      setMsg('Conectado.');
      await startFeatures();
    }catch(e){
      console.error('FINANZAS B2.14',e);
      setMsg('No se pudo conectar: '+(e?.message||e));
    }finally{
      if(btn){btn.disabled=false;btn.textContent='Conectar';}
    }
  }

  function watchAutoConnect(){
    const app=$('app'),panel=$('configPanel');
    if(!app||!panel)return;
    const observer=new MutationObserver(()=>{
      if(!app.classList.contains('hidden')){
        observer.disconnect();
        startFeatures();
      }
    });
    observer.observe(app,{attributes:true,attributeFilter:['class']});
    observer.observe(panel,{attributes:true,attributeFilter:['class']});
    if(!app.classList.contains('hidden')){observer.disconnect();startFeatures();}
  }

  function install(){
    const btn=$('saveConfig');
    if(btn) btn.onclick=connectFixed;
    watchAutoConnect();
    const logout=$('logoutBtn');
    if(logout) logout.onclick=()=>{localStorage.removeItem('sf_url');localStorage.removeItem('sf_key');location.reload();};
    const u=localStorage.getItem('sf_url'),k=localStorage.getItem('sf_key');
    if(u&&k){ if($('supabaseUrl'))$('supabaseUrl').value=u; if($('supabaseKey'))$('supabaseKey').value=k; }
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();
})();
