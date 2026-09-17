/* B2.18 runtime: navegación determinista; sin lazy loading ni observers globales */
(()=>{'use strict';
const $=id=>document.getElementById(id);
function show(id){document.querySelectorAll('.tab').forEach(s=>s.classList.toggle('hidden',s.id!==id));document.querySelectorAll('.tabs button').forEach(b=>b.classList.toggle('active',b.dataset.tab===id));try{if(id==='operaciones')window.fin218Operations?.load();if(id==='ingresos')window.fin218Income?.load();if(id==='jornadas')window.fin218Jornadas?.load();}catch(e){console.error('B218 nav',e)}}
function installNav(){document.querySelectorAll('.tabs button[data-tab]').forEach(b=>{b.addEventListener('click',()=>show(b.dataset.tab));});}
function boot(){installNav(); window.fin218Jornadas?.mount();window.fin218Income?.mount();window.fin218Operations?.mount();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
