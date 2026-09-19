/* Dashboard Ejecutivo — Visual Analytics Engine v1.2.6 */
window.ExecutiveDashboard = (() => {
  const NS='http://www.w3.org/2000/svg';
  const n=v=>Number(v||0);
  const money=v=>n(v).toLocaleString('es-CL',{style:'currency',currency:'CLP',maximumFractionDigits:0});
  const compact=v=>{const x=Math.round(n(v)); if(Math.abs(x)>=1e6)return '$'+(x/1e6).toFixed(1)+'M'; if(Math.abs(x)>=1e3)return '$'+Math.round(x/1e3)+'k'; return '$'+x.toLocaleString('es-CL');};
  const svg=(w,h)=>{const e=document.createElementNS(NS,'svg');e.setAttribute('viewBox',`0 0 ${w} ${h}`);e.setAttribute('width','100%');e.setAttribute('height','100%');e.setAttribute('role','img');return e;};
  const line=(s,x1,y1,x2,y2,c='chart-grid')=>{const e=document.createElementNS(NS,'line');[['x1',x1],['y1',y1],['x2',x2],['y2',y2]].forEach(([k,v])=>e.setAttribute(k,v));e.classList.add(c);s.appendChild(e);};
  const text=(s,x,y,v,c='chart-label')=>{const e=document.createElementNS(NS,'text');e.setAttribute('x',x);e.setAttribute('y',y);e.textContent=v;e.classList.add(c);s.appendChild(e);};
  const rect=(s,x,y,w,h,c='chart-bar')=>{const e=document.createElementNS(NS,'rect');e.setAttribute('x',x);e.setAttribute('y',y);e.setAttribute('width',Math.max(0,w));e.setAttribute('height',Math.max(0,h));e.classList.add(c);s.appendChild(e);};
  const path=(s,d,c='chart-path')=>{const e=document.createElementNS(NS,'path');e.setAttribute('d',d);e.classList.add(c);s.appendChild(e);};
  const circle=(s,x,y,r,c='chart-dot')=>{const e=document.createElementNS(NS,'circle');e.setAttribute('cx',x);e.setAttribute('cy',y);e.setAttribute('r',r);e.classList.add(c);s.appendChild(e);};
  const range=vals=>{const min=Math.min(...vals,0),max=Math.max(...vals,0),span=Math.max(1,max-min);return{min,max,span};};
  const clear=el=>{if(el)el.innerHTML='';};

  function lineChart(el,rows,fn,title,reserve){
    clear(el); if(!el)return;
    const W=760,H=300,L=54,R=18,T=28,B=42,s=svg(W,H);el.appendChild(s);
    if(!rows.length){text(s,220,150,'Sin datos de proyección','chart-empty');return;}
    const vals=rows.map(fn); const reserveValue=n(reserve); const r=range(vals.concat([reserveValue]));
    for(let i=0;i<=4;i++){const y=T+(H-T-B)*i/4;line(s,L,y,W-R,y);text(s,5,y+4,compact(r.max-r.span*i/4),'chart-axis');}
    const y=v=>T+(H-T-B)*(r.max-v)/r.span;
    if(reserveValue>0){line(s,L,y(reserveValue),W-R,y(reserveValue),'chart-reserve');text(s,W-R-120,y(reserveValue)-5,'Reserva mínima','chart-reserve-label');}
    const pts=rows.map((x,i)=>[L+(W-L-R)*(rows.length===1?0:i/(rows.length-1)),y(vals[i])]);
    path(s,pts.map((p,i)=>(i?'L':'M')+p[0]+' '+p[1]).join(' '));
    pts.forEach((p,i)=>{if(i===0||i===pts.length-1||i%Math.max(1,Math.floor(pts.length/6))===0)circle(s,p[0],p[1],3);});
    text(s,L,17,title,'chart-title');
    text(s,L,H-12,String(rows[0].date||'').slice(5),'chart-axis');
    text(s,W-R-42,H-12,String(rows[rows.length-1].date||'').slice(5),'chart-axis');
  }

  function flowChart(el,rows){
    clear(el);if(!el)return;const W=760,H=300,L=44,R=18,T=30,B=42,s=svg(W,H);el.appendChild(s);
    if(!rows.length){text(s,220,150,'Sin flujos proyectados','chart-empty');return;}
    const max=Math.max(1,...rows.flatMap(x=>[n(x.income),n(x.expense)])),base=H-B,slot=(W-L-R)/rows.length,bar=Math.min(16,slot*.28);
    line(s,L,base,W-R,base);
    rows.forEach((r,i)=>{const x=L+i*slot+slot/2,ih=n(r.income)/max*(H-T-B-10),eh=n(r.expense)/max*(H-T-B-10);rect(s,x-bar-2,base-ih,bar,ih,'chart-income');rect(s,x+2,base-eh,bar,eh,'chart-expense');if(i===0||i===rows.length-1||i%Math.max(1,Math.floor(rows.length/6))===0)text(s,x,H-12,String(r.date).slice(5),'chart-axis');});
    text(s,L,17,'Ingresos vs egresos','chart-title');
  }

  function donut(el,items){
    clear(el);if(!el)return;const W=420,H=300,s=svg(W,H);el.appendChild(s);const total=items.reduce((a,x)=>a+x.value,0);
    if(!total){text(s,120,150,'Sin obligaciones cuantificadas','chart-empty');return;}
    const cx=145,cy=150,r=92,inner=54;let a=-Math.PI/2;
    items.slice(0,6).forEach((it,i)=>{const a2=a+it.value/total*Math.PI*2,la=a2-a>Math.PI?1:0,x1=cx+r*Math.cos(a),y1=cy+r*Math.sin(a),x2=cx+r*Math.cos(a2),y2=cy+r*Math.sin(a2),d=`M ${x1} ${y1} A ${r} ${r} 0 ${la} 1 ${x2} ${y2} L ${cx+inner*Math.cos(a2)} ${cy+inner*Math.sin(a2)} A ${inner} ${inner} 0 ${la} 0 ${cx+inner*Math.cos(a)} ${cy+inner*Math.sin(a)} Z`;path(s,d,`donut-${i%6}`);text(s,270,45+i*34,`${it.label}: ${compact(it.value)}`,'chart-legend');a=a2;});
    text(s,cx-35,145,compact(total),'chart-center');text(s,cx-35,166,'comprometido','chart-center-small');
  }

  function candles(el,rows){
    clear(el);if(!el)return;const W=760,H=300,L=46,R=18,T=28,B=42,s=svg(W,H);el.appendChild(s);if(!rows.length)return;
    const groups=[];for(let i=0;i<rows.length;i+=7){const q=rows.slice(i,i+7);groups.push({date:q[0].date,open:n(q[0].openingBalance),close:n(q[q.length-1].closingBalance),high:Math.max(...q.map(x=>n(x.closingBalance)),n(q[0].openingBalance)),low:Math.min(...q.map(x=>n(x.closingBalance)),n(q[0].openingBalance))});}
    const r=range(groups.flatMap(x=>[x.open,x.close,x.high,x.low]));
    for(let i=0;i<=4;i++){const y=T+(H-T-B)*i/4;line(s,L,y,W-R,y);text(s,4,y+4,compact(r.max-r.span*i/4),'chart-axis');}
    groups.forEach((g,i)=>{const x=L+(W-L-R)*(groups.length===1?0:i/(groups.length-1)),y=v=>T+(H-T-B)*(r.max-v)/r.span;line(s,x,y(g.high),x,y(g.low),'candle-wick');rect(s,x-7,Math.min(y(g.open),y(g.close)),14,Math.max(4,Math.abs(y(g.close)-y(g.open))),g.close>=g.open?'candle-up':'candle-down');if(i===0||i===groups.length-1)text(s,x,H-12,String(g.date).slice(5),'chart-axis');});
    text(s,L,17,'Velas de liquidez','chart-title');
  }

  function horizontalBars(el,items,title){
    clear(el);if(!el)return;const W=760,H=Math.max(270,70+items.length*52),L=190,R=100,T=35,B=30,s=svg(W,H);el.appendChild(s);
    if(!items.length){text(s,230,130,'Sin datos suficientes','chart-empty');return;}
    const max=Math.max(1,...items.map(x=>Math.abs(n(x.value))));
    items.forEach((x,i)=>{const y=T+i*52,w=Math.abs(n(x.value))/max*(W-L-R);text(s,5,y+18,String(x.label).slice(0,28),'chart-axis');rect(s,L,y,w,28,x.negative?'chart-negative':'chart-bar');text(s,Math.min(W-5,L+w+8),y+19,compact(x.value),'chart-legend-value');});
    text(s,L,18,title,'chart-title');
  }

  function riskChart(el,projection,reserve){
    clear(el);if(!el)return;const rows=(projection||[]).filter((_,i)=>i%3===0);const W=760,H=300,L=54,R=18,T=28,B=42,s=svg(W,H);el.appendChild(s);
    if(!rows.length){text(s,220,150,'Sin proyección','chart-empty');return;}
    const vals=rows.map(x=>n(x.closingBalance)),rv=n(reserve),r=range(vals.concat([rv])),y=v=>T+(H-T-B)*(r.max-v)/r.span;
    line(s,L,y(rv),W-R,y(rv),'chart-reserve');text(s,W-R-120,y(rv)-5,'Reserva mínima','chart-reserve-label');
    const pts=rows.map((x,i)=>[L+(W-L-R)*(rows.length===1?0:i/(rows.length-1)),y(vals[i])]);
    path(s,pts.map((p,i)=>(i?'L':'M')+p[0]+' '+p[1]).join(' '));
    pts.forEach((p,i)=>{if(vals[i]<rv)circle(s,p[0],p[1],5,'risk-dot');});
    const first=rows.find(x=>n(x.closingBalance)<rv);
    text(s,L,17,first?`Primera caída: ${first.date}`:'Sin caída bajo reserva','chart-title');
    text(s,L,H-12,String(rows[0].date).slice(5),'chart-axis');text(s,W-R-42,H-12,String(rows[rows.length-1].date).slice(5),'chart-axis');
  }

  function debtMonth(el,items){
    const rows=(items||[]).filter(x=>n(x.value)>0);clear(el);if(!el)return;const W=760,H=290,L=58,R=24,T=34,B=54,s=svg(W,H);el.appendChild(s);
    if(!rows.length){text(s,210,145,'Sin deudas con fecha en el mes actual','chart-empty');return;}
    const max=Math.max(...rows.map(x=>n(x.value)),1),slot=(W-L-R)/rows.length;
    rows.forEach((x,i)=>{const xx=L+i*slot+slot/2,bw=Math.min(28,slot*.25),h=n(x.value)/max*(H-T-B-18);rect(s,xx-bw/2,H-B-h,bw,h,'month-debt');text(s,xx,H-30,String(x.label).slice(5),'chart-axis');text(s,xx,H-B-h-8,compact(x.value),'chart-legend-value');});
    text(s,L,18,'Deudas del mes en curso','chart-title');
  }

  function renderCharts({context,projection,state}){
    const root=document.getElementById('executive-charts');if(!root)return;
    const p=projection||[];
    const flow=p.slice(0,30).map(x=>({date:x.date,income:n(x.assuredIncome)+n(x.projectedIncome)+n(x.plannedIncome),expense:n(x.mandatoryExpenses)+n(x.discretionaryExpenses)}));
    const obs={};(context.obligations||[]).forEach(x=>{const k=x.source==='cuotas_deuda'?'Cuotas de deuda':x.source==='compromisos'?'Compromisos':'Deudas';obs[k]=(obs[k]||0)+n(x.amount);});
    const donutRows=Object.entries(obs).map(([label,value])=>({label,value})).filter(x=>x.value>0).sort((a,b)=>b.value-a.value);

    const debtPlan=context.debtPlanning||[];
    const currentMonth=String(context.today||'').slice(0,7);
    const currentMonthDebt=debtPlan.filter(d=>(d.dueDate&&d.dueDate.slice(0,7)===currentMonth)||(d.startDate&&d.startDate.slice(0,7)===currentMonth));
    const monthRows=currentMonthDebt.sort((a,b)=>b.amount-a.amount).map(d=>({label:d.dueDate||d.startDate||'Sin fecha',value:d.amount}));
    const planningRows=[
      {label:'Pendientes de negociación',count:debtPlan.filter(d=>d.negotiation).length,value:debtPlan.filter(d=>d.negotiation).reduce((s,d)=>s+d.amount,0)},
      {label:'Pendientes de pago',count:debtPlan.filter(d=>d.unpaid).length,value:debtPlan.filter(d=>d.unpaid).reduce((s,d)=>s+d.amount,0)},
      {label:'Sin fecha de inicio',count:debtPlan.filter(d=>d.noStartDate).length,value:debtPlan.filter(d=>d.noStartDate).reduce((s,d)=>s+d.amount,0)}
    ].filter(x=>x.value>0);

    const risk=p.find(x=>n(x.closingBalance)<n(context.minimumReserve));
    const coverage=n(state.committedExpenses)>0?(n(state.availableBalance)+n(state.assuredIncome))/n(state.committedExpenses)*100:100;
    const net30=flow.reduce((s,x)=>s+x.income-x.expense,0);
    const firstRiskIndex=risk?p.indexOf(risk):-1;
    const daysToRisk=firstRiskIndex>=0?firstRiskIndex: null;
    const gap=n(state.financialGap);
    const generationRequired=Math.max(0,gap);
    const resources=[{label:'Disponible real',value:n(state.availableBalance)},{label:'Asegurado',value:n(state.assuredIncome)},{label:'Brecha',value:-generationRequired,negative:true},{label:'Comprometido',value:n(state.committedExpenses)}];

    const lr=document.getElementById('exec-liquidity-reading');if(lr)lr.textContent=risk?`Riesgo desde ${risk.date}`:'Sin caída bajo la reserva';
    const or=document.getElementById('exec-obligation-reading');if(or)or.textContent=`${Math.round(coverage)}% de cobertura`;
    const fr=document.getElementById('exec-flow-reading');if(fr)fr.textContent=`Neto 30 días: ${money(net30)}`;
    const gr=document.getElementById('exec-generation-reading');if(gr)gr.textContent=generationRequired>0?`Faltan ${money(generationRequired)}`:'Sin brecha cuantificada';
    const rs=document.getElementById('executive-risk-summary');if(rs)rs.textContent=risk?`Primera fecha de riesgo: ${risk.date}${daysToRisk!==null?` · ${daysToRisk} días`:''}`:'Sin riesgo bajo reserva en el horizonte';

    lineChart(document.getElementById('chart-liquidity'),p.filter((_,i)=>i%3===0),x=>n(x.closingBalance),'Liquidez proyectada',context.minimumReserve);
    flowChart(document.getElementById('chart-flow'),flow);
    donut(document.getElementById('chart-obligations'),donutRows);
    candles(document.getElementById('chart-candles'),p);
    riskChart(document.getElementById('chart-risk'),p,context.minimumReserve);
    horizontalBars(document.getElementById('chart-gap'),resources,'Brecha y recursos');
    debtMonth(document.getElementById('chart-debt-month'),monthRows);
    horizontalBars(document.getElementById('chart-debt-planning'),planningRows.map(x=>({label:`${x.label} (${x.count})`,value:x.value})),'Backlog de deudas');

    installFullscreenHandlers();
  }

  function installFullscreenHandlers(){
    document.querySelectorAll('#executive-charts .executive-chart').forEach(card=>{
      if(card.dataset.fullscreenReady==='1')return;
      card.dataset.fullscreenReady='1';card.setAttribute('role','button');card.setAttribute('tabindex','0');
      const open=()=>openFullscreenChart(card);card.addEventListener('click',open);card.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open();}});
    });
  }

  function openFullscreenChart(card){
    const modal=document.getElementById('executive-chart-modal'),body=document.getElementById('executive-chart-modal-body'),title=document.getElementById('executive-chart-modal-title');
    if(!modal||!body)return;title.textContent=card.querySelector('h3')?.textContent||'Gráfico financiero';body.innerHTML='';
    const description=card.querySelector('p');if(description){const p=document.createElement('p');p.className='modal-chart-description';p.textContent=description.textContent;body.appendChild(p);}
    const svgNode=card.querySelector('svg');if(svgNode){const clone=svgNode.cloneNode(true);clone.removeAttribute('width');clone.removeAttribute('height');clone.setAttribute('class','fullscreen-chart-svg');body.appendChild(clone);}
    modal.classList.add('open');modal.setAttribute('aria-hidden','false');document.body.classList.add('executive-modal-open');
  }

  function closeFullscreenChart(){const modal=document.getElementById('executive-chart-modal');if(!modal)return;modal.classList.remove('open');modal.setAttribute('aria-hidden','true');document.body.classList.remove('executive-modal-open');}
  function bindModal(){const modal=document.getElementById('executive-chart-modal'),close=document.getElementById('executive-chart-modal-close');if(!modal||modal.dataset.bound==='1')return;modal.dataset.bound='1';if(close)close.addEventListener('click',closeFullscreenChart);modal.addEventListener('click',e=>{if(e.target===modal)closeFullscreenChart();});document.addEventListener('keydown',e=>{if(e.key==='Escape')closeFullscreenChart();});}
  document.addEventListener('DOMContentLoaded',bindModal);bindModal();
  return {renderCharts,VERSION:'EXEC-DASH-V1.2.6'};
})();
