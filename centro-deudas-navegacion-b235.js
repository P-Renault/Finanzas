/* FINANZAS B2.3.5 — Corrección navegación y detalle Centro de Deudas
   V5 — DETALLE CONTEXTUAL REAL
   - El detalle queda inmediatamente después de la deuda seleccionada.
   - No se hace scroll al inicio ni al final de la lista.
   - No modifica datos ni Supabase.
*/
(() => {
  const $ = id => document.getElementById(id);
  const money = n => new Intl.NumberFormat('es-CL',{style:'currency',currency:'CLP',maximumFractionDigits:0}).format(Number(n)||0);
  const esc = v => String(v ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));

  let client=null;
  let bound=false;

  async function db(){
    if(client)return client;
    const u=localStorage.getItem('sf_url'), k=localStorage.getItem('sf_key');
    if(!u||!k||!window.supabase)return null;
    client=window.supabase.createClient(u,k);
    return client;
  }

  function openDebts(){
    const tabButton=document.querySelector('.tabs button[data-tab="deudas"]');
    const dashboard=$('dashboard'), debts=$('deudas');

    document.querySelectorAll('.tabs button').forEach(b=>b.classList.remove('active'));
    if(tabButton)tabButton.classList.add('active');

    document.querySelectorAll('.tab').forEach(s=>s.classList.add('hidden'));
    if(debts)debts.classList.remove('hidden');
    if(dashboard)dashboard.classList.add('hidden');

    // IMPORTANTE: no hacer scroll aquí. La deuda seleccionada conserva
    // exactamente la posición desde la que el usuario pulsó “Ver detalle”.
  }

  function debtCardById(id){
    const section=$('deudas');
    if(!section)return null;
    const cards=[...section.querySelectorAll('.debt-card')];
    return cards.find(card=>[...card.querySelectorAll('button')].some(button=>{
      const oc=button.getAttribute('onclick')||'';
      const m=oc.match(/(?:window\.)?verDeuda23\s*\(\s*(\d+)/i);
      return m && Number(m[1])===Number(id);
    }))||null;
  }

  function detailContextNode(){
    const detail=$('deudaDetalle');
    if(!detail)return null;

    // Normalmente #deudaDetalle está dentro de una tarjeta contenedora.
    // Movemos esa tarjeta completa para que no quede un contenedor vacío
    // al final de la lista.
    const outer=detail.closest('.card');
    if(outer && outer!==$('deudas') && !outer.classList.contains('debt-card')){
      outer.classList.add('fin235-detail-context-card');
      return outer;
    }
    return detail;
  }

  function placeDetailAfterDebt(id){
    const card=debtCardById(id);
    const node=detailContextNode();
    if(!card||!node||!card.parentNode)return false;

    if(card.nextElementSibling!==node){
      card.parentNode.insertBefore(node,card.nextElementSibling);
    }

    node.style.display='block';
    node.dataset.fin235ContextDebt=String(id);
    const detail=$('deudaDetalle');
    if(detail){
      detail.style.display='block';
      detail.dataset.fin235ContextDebt=String(id);
    }
    return true;
  }

  function placeDetailAfterDebtRepeatedly(id){
    [0,30,80,150,300,600,1000,1600].forEach(ms=>setTimeout(()=>{
      if(placeDetailAfterDebt(id)) return;
    },ms));
  }

  async function showDebt(id){
    // Conservamos la posición exacta de lectura. Ninguna parte de esta
    // función debe llevar al usuario al inicio de #deudas.
    const scrollY=window.scrollY || window.pageYOffset || 0;
    openDebts();

    const detail=$('deudaDetalle');
    if(!detail)return;

    detail.innerHTML='<p class="muted">Cargando detalle de la deuda…</p>';
    detail.style.display='block';

    // Coloca inmediatamente el contenedor de detalle junto a la deuda
    // seleccionada, incluso mientras la consulta asíncrona está pendiente.
    placeDetailAfterDebt(id);

    const c=await db();
    if(!c){
      detail.innerHTML='<p class="status">Conecta Supabase para consultar el detalle.</p>';
      placeDetailAfterDebtRepeatedly(id);
      restoreScroll(scrollY);
      return;
    }

    const debt=await c.from('v_deudas_resumen')
      .select('*')
      .eq('id',id)
      .maybeSingle();

    if(debt.error){
      detail.innerHTML=`<p class="status">${esc(debt.error.message)}</p>`;
      placeDetailAfterDebtRepeatedly(id);
      restoreScroll(scrollY);
      return;
    }

    if(!debt.data){
      detail.innerHTML='<p class="muted">No se encontró la deuda solicitada.</p>';
      placeDetailAfterDebtRepeatedly(id);
      restoreScroll(scrollY);
      return;
    }

    const d=debt.data;

    const q=await c.from('cuotas_deuda')
      .select('id,numero_cuota,fecha_vencimiento,monto,saldo_proyectado,estado')
      .eq('deuda_id',id)
      .order('numero_cuota');

    if(q.error){
      detail.innerHTML=`<p class="status">${esc(q.error.message)}</p>`;
      placeDetailAfterDebtRepeatedly(id);
      restoreScroll(scrollY);
      return;
    }

    const quotas=q.data||[];
    const paid=quotas.filter(x=>String(x.estado).toLowerCase()==='pagada');
    const pending=quotas.filter(x=>!['pagada','cancelada'].includes(String(x.estado).toLowerCase()));

    detail.innerHTML=`
      <div class="fin235-detail-head">
        <div>
          <span class="muted">Detalle de deuda</span>
          <h2>${esc(d.acreedor)}</h2>
          <p>${esc(d.concepto||'Deuda registrada')}</p>
        </div>
        <button type="button" class="secondary" id="fin235Back">Volver a deudas</button>
      </div>

      <div class="fin235-detail-grid">
        <article><span>Saldo actual</span><strong>${money(d.saldo_actual)}</strong></article>
        <article><span>Monto original</span><strong>${money(d.monto_original)}</strong></article>
        <article><span>Pagadas</span><strong>${paid.length}</strong></article>
        <article><span>Pendientes</span><strong>${pending.length}</strong></article>
      </div>

      <div class="fin235-plan">
        <div class="section-title">
          <div><h3>Plan de cuotas</h3><span class="muted">${quotas.length} cuotas registradas</span></div>
        </div>

        ${quotas.length ? `<div class="fin235-quota-list">${
          quotas.map(x=>`
            <div class="fin235-quota ${String(x.estado).toLowerCase()==='pagada'?'paid':''}">
              <div>
                <strong>Cuota ${esc(x.numero_cuota)}</strong>
                <span>Vencimiento: ${esc(x.fecha_vencimiento)}</span>
              </div>
              <div>
                <strong>${money(x.monto)}</strong>
                <span>${esc(x.estado)}</span>
              </div>
            </div>`).join('')
        }</div>` : '<p class="muted">No existen cuotas registradas.</p>'}
      </div>`;

    $('fin235Back').onclick=()=>{
      openDebts();
      // Volver tampoco hace scroll automático.
    };

    // Este es el punto definitivo: después de que Supabase terminó y el
    // HTML quedó renderizado, el bloque completo se inserta inmediatamente
    // después de la tarjeta de la deuda seleccionada.
    placeDetailAfterDebtRepeatedly(id);
    restoreScroll(scrollY);
  }

  function restoreScroll(y){
    // Restauración instantánea únicamente para neutralizar cualquier otro
    // listener externo que haya intentado llevar la página a otra posición.
    try{ window.scrollTo(0,y); }catch(_){ }
  }

  function injectStyles(){
    if($('fin235Styles'))return;
    const s=document.createElement('style');
    s.id='fin235Styles';
    s.textContent=`
      .fin235-detail-head{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:16px}
      .fin235-detail-head h2{margin:3px 0;font-size:21px}
      .fin235-detail-head p{margin:0;color:#6b7280}
      .fin235-detail-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:14px 0 20px}
      .fin235-detail-grid article{padding:14px;border:1px solid #e5e7eb;border-radius:12px;background:#f8fafc}
      .fin235-detail-grid span{display:block;color:#6b7280;font-size:11px}
      .fin235-detail-grid strong{display:block;margin-top:5px;font-size:18px}
      .fin235-quota-list{display:flex;flex-direction:column}
      .fin235-quota{display:flex;justify-content:space-between;gap:15px;padding:12px 0;border-top:1px solid #e5e7eb}
      .fin235-quota div{display:flex;flex-direction:column;gap:3px}
      .fin235-quota span{font-size:12px;color:#6b7280}
      .fin235-quota.paid{opacity:.72}
      .fin235-detail-context-card{width:100%;box-sizing:border-box}
      @media(max-width:680px){
        .fin235-detail-head{flex-direction:column}
        .fin235-detail-grid{grid-template-columns:repeat(2,1fr)}
        .fin235-quota{align-items:flex-start}
      }
    `;
    document.head.appendChild(s);
  }

  function bind(){
    if(bound)return;
    bound=true;
    injectStyles();

    window.fin235OpenDebts=openDebts;
    window.verDeuda23=showDebt;

    document.addEventListener('click',e=>{
      const manage=e.target.closest('#fin234Go');
      if(manage){e.preventDefault();e.stopPropagation();openDebts();return;}

      const detail=e.target.closest('#fin234Detail');
      if(detail){
        e.preventDefault();e.stopPropagation();
        const center=document.getElementById('fin234DebtCenter');
        const button=center?.querySelector('#fin234Detail');
        const centerText=center?.querySelector('.fin234-debt h3')?.textContent?.trim();
        if(button){
          const cPromise=db();
          cPromise.then(async c=>{
            if(!c)return;
            const r=await c.from('v_deudas_resumen').select('id,acreedor').eq('acreedor',centerText).limit(1).maybeSingle();
            if(r.data?.id)showDebt(r.data.id);
          });
        }
        return;
      }
    });

    // Captura los botones reales de la lista. Se detiene el flujo nativo
    // y se llama UNA sola vez a showDebt(), evitando el salto del handler
    // original y garantizando la colocación contextual.
    document.addEventListener('click',e=>{
      const b=e.target.closest('#deudasLista button');
      if(!b)return;
      const onclick=b.getAttribute('onclick')||'';
      const m=onclick.match(/(?:window\.)?verDeuda23\s*\(\s*(\d+)/i);
      if(m){
        e.preventDefault();
        e.stopImmediatePropagation();
        showDebt(Number(m[1]));
      }
    },true);
  }

  function init(){
    if(!document.getElementById('app'))return;
    bind();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(init,700));
  else setTimeout(init,700);
  setTimeout(init,1800);
})();
