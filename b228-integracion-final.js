/* FINANZAS B2.28 — INTEGRACIÓN FINAL DE MOTORES
   Objetivo:
   - Motor Multifuente y Control de Jornada pasan del menú "Más" a la barra principal.
   - Conserva B2.19 como motor funcional y reutiliza su navegación interna.
   - No duplica Control de Jornada ni crea una segunda fuente de datos.
   - No modifica Supabase.
*/
(()=>{'use strict';
const wait=ms=>new Promise(r=>setTimeout(r,ms));

function activate(id){
  const direct=document.querySelector(`.tabs button[data-tab="${id}"]`);
  const hidden=document.querySelector(`.b219-menu [data-b219-open="${id}"]`);
  if(!direct)return;
  direct.onclick=()=>{
    if(hidden){ hidden.click(); return; }
    document.querySelectorAll('.tabs button[data-tab]').forEach(b=>b.classList.remove('active'));
    direct.classList.add('active');
    document.querySelectorAll('.tab').forEach(s=>s.classList.toggle('hidden',s.id!==id));
  };
}

function integrate(){
  const tabs=document.querySelector('.tabs');
  if(!tabs)return false;

  const add=(id,label)=>{
    let b=tabs.querySelector(`button[data-tab="${id}"]`);
    if(!b){
      b=document.createElement('button');
      b.type='button';
      b.dataset.tab=id;
      b.textContent=label;
      tabs.appendChild(b);
    }
    return b;
  };

  const income=add('ingresos','Motor Multifuente');
  const jornada=add('jornadas','Control de Jornada');

  // Coloca ambos inmediatamente después de Planificación.
  const plan=tabs.querySelector('[data-tab="planificacion"]');
  if(plan){
    plan.after(income,jornada);
  }

  activate('ingresos');
  activate('jornadas');

  // El menú original queda como respaldo técnico, pero sus dos entradas
  // dejan de mostrarse para evitar duplicación visual.
  document.querySelectorAll('.b219-menu [data-b219-open="ingresos"],.b219-menu [data-b219-open="jornadas"]')
    .forEach(b=>b.style.display='none');

  return !!tabs.querySelector('[data-tab="ingresos"]') &&
         !!tabs.querySelector('[data-tab="jornadas"]');
}

async function boot(){
  for(let i=0;i<30;i++){
    if(integrate())return;
    await wait(300);
  }
  console.warn('B2.28: no se encontró la barra de navegación.');
}
if(document.readyState==='loading')
  document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,1200),{once:true});
else
  setTimeout(boot,1200);
})();
