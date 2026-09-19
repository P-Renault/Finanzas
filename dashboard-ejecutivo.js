/* Dashboard Ejecutivo — Visual Analytics Engine v1.0.0 */
window.ExecutiveDashboard = (() => {
  const NS = 'http://www.w3.org/2000/svg';
  const money = value => Number(value || 0).toLocaleString('es-CL', {
    style: 'currency', currency: 'CLP', maximumFractionDigits: 0
  });
  const num = value => Number(value || 0);

  function svg(width, height) {
    const el = document.createElementNS(NS, 'svg');
    el.setAttribute('viewBox', `0 0 ${width} ${height}`);
    el.setAttribute('width', '100%');
    el.setAttribute('height', '100%');
    el.setAttribute('role', 'img');
    return el;
  }

  function line(svgEl, x1,y1,x2,y2, cls='chart-line') {
    const e=document.createElementNS(NS,'line');
    [['x1',x1],['y1',y1],['x2',x2],['y2',y2]].forEach(([k,v])=>e.setAttribute(k,v));
    e.setAttribute('class',cls); svgEl.appendChild(e); return e;
  }

  function path(svgEl, d, cls='chart-path') {
    const e=document.createElementNS(NS,'path'); e.setAttribute('d',d); e.setAttribute('class',cls); svgEl.appendChild(e); return e;
  }

  function text(svgEl,x,y,value,cls='chart-label') {
    const e=document.createElementNS(NS,'text'); e.setAttribute('x',x); e.setAttribute('y',y); e.setAttribute('class',cls); e.textContent=value; svgEl.appendChild(e); return e;
  }

  function rect(svgEl,x,y,w,h,cls='chart-bar') {
    const e=document.createElementNS(NS,'rect');
    [['x',x],['y',y],['width',Math.max(0,w)],['height',Math.max(0,h)]].forEach(([k,v])=>e.setAttribute(k,v));
    e.setAttribute('class',cls); svgEl.appendChild(e); return e;
  }

  function circle(svgEl,cx,cy,r,cls='chart-dot') {
    const e=document.createElementNS(NS,'circle');
    [['cx',cx],['cy',cy],['r',r]].forEach(([k,v])=>e.setAttribute(k,v));
    e.setAttribute('class',cls); svgEl.appendChild(e); return e;
  }

  function safeRange(values) {
    const min=Math.min(...values,0), max=Math.max(...values,0);
    const span=Math.max(1,max-min);
    return {min,max,span};
  }

  function drawLineChart(container, rows, valueFn, title) {
    container.innerHTML='';
    if(!rows.length) return;
    const W=760,H=300,L=54,R=18,T=24,B=42;
    const s=svg(W,H); container.appendChild(s);
    const vals=rows.map(valueFn);
    const {min,max,span}=safeRange(vals);
    for(let i=0;i<=4;i++){
      const y=T+(H-T-B)*i/4, v=max-span*i/4;
      line(s,L,y,W-R,y,'chart-grid'); text(s,8,y+4,compactMoney(v),'chart-axis');
    }
    const points=rows.map((r,i)=>{
      const x=L+(W-L-R)*(rows.length===1?0:i/(rows.length-1));
      const y=T+(H-T-B)*(max-vals[i])/span;
      return [x,y];
    });
    path(s,points.map((p,i)=>(i?'L':'M')+p[0]+' '+p[1]).join(' '));
    points.forEach((p,i)=>{ if(i===0||i===points.length-1||i%Math.max(1,Math.floor(points.length/6))===0) circle(s,p[0],p[1],3); });
    const labels=[0,Math.floor((rows.length-1)/2),rows.length-1];
    [...new Set(labels)].forEach(i=>text(s,L+(W-L-R)*(rows.length===1?0:i/(rows.length-1)),H-12,String(rows[i].date||'').slice(5),'chart-axis'));
    text(s,L,16,title,'chart-title');
  }

  function compactMoney(v){
    const n=Math.round(v);
    if(Math.abs(n)>=1000000) return '$'+(n/1000000).toFixed(1)+'M';
    if(Math.abs(n)>=1000) return '$'+Math.round(n/1000)+'k';
    return '$'+n.toLocaleString('es-CL');
  }

  function drawFlowBars(container, rows) {
    container.innerHTML='';
    if(!rows.length) return;
    const W=760,H=300,L=44,R=18,T=30,B=42, baseline=H-B;
    const s=svg(W,H); container.appendChild(s);
    const vals=rows.flatMap(r=>[num(r.income),num(r.expense)]);
    const max=Math.max(1,...vals);
    line(s,L,baseline,W-R,baseline,'chart-grid');
    const slot=(W-L-R)/rows.length, bar=Math.min(16,slot*.28);
    rows.forEach((r,i)=>{
      const x=L+i*slot+slot/2;
      const ih=(num(r.income)/max)*(H-T-B-10);
      const eh=(num(r.expense)/max)*(H-T-B-10);
      rect(s,x-bar-2,baseline-ih,bar,ih,'chart-income');
      rect(s,x+2,baseline-eh,bar,eh,'chart-expense');
      if(i===0||i===rows.length-1||i%Math.max(1,Math.floor(rows.length/6))===0)
        text(s,x, H-12, String(r.date).slice(5),'chart-axis');
    });
    text(s,L,16,'Ingresos vs egresos','chart-title');
    text(s,W-R-110,16,'Ingreso / Egreso','chart-legend');
  }

  function drawDonut(container, items) {
    container.innerHTML='';
    const W=420,H=300,cx=150,cy=150,r=92,inner=54;
    const s=svg(W,H); container.appendChild(s);
    const total=items.reduce((a,b)=>a+b.value,0);
    if(!total){ text(s,110,155,'Sin obligaciones','chart-empty'); return; }
    let angle=-Math.PI/2;
    items.forEach((item,i)=>{
      const a2=angle+(item.value/total)*Math.PI*2;
      const large=a2-angle>Math.PI?1:0;
      const x1=cx+r*Math.cos(angle), y1=cy+r*Math.sin(angle);
      const x2=cx+r*Math.cos(a2), y2=cy+r*Math.sin(a2);
      const d=`M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} L ${cx+inner*Math.cos(a2)} ${cy+inner*Math.sin(a2)} A ${inner} ${inner} 0 ${large} 0 ${cx+inner*Math.cos(angle)} ${cy+inner*Math.sin(angle)} Z`;
      path(s,d,`chart-donut donut-${i%6}`);
      angle=a2;
    });
    text(s,cx,cy-4,compactMoney(total),'chart-center');
    text(s,cx,cy+18,'comprometido','chart-center-small');
    items.slice(0,6).forEach((item,i)=>{
      const y=42+i*36;
      rect(s,265,y-10,12,12,`chart-swatch donut-${i%6}`);
      text(s,285,y,String(item.label).slice(0,24),'chart-legend');
      text(s,405,y,compactMoney(item.value),'chart-legend-value');
    });
  }

  function drawCandles(container, projection) {
    container.innerHTML='';
    if(!projection.length) return;
    const W=760,H=300,L=46,R=18,T=28,B=42;
    const s=svg(W,H); container.appendChild(s);
    const groups=[];
    for(let i=0;i<projection.length;i+=7){
      const slice=projection.slice(i,i+7);
      groups.push({
        date:slice[0].date,
        open:num(slice[0].openingBalance),
        close:num(slice[slice.length-1].closingBalance),
        high:Math.max(...slice.map(x=>num(x.closingBalance)),num(slice[0].openingBalance)),
        low:Math.min(...slice.map(x=>num(x.closingBalance)),num(slice[0].openingBalance))
      });
    }
    const vals=groups.flatMap(g=>[g.high,g.low,g.open,g.close]);
    const {min,max,span}=safeRange(vals);
    for(let i=0;i<=4;i++){
      const y=T+(H-T-B)*i/4, v=max-span*i/4;
      line(s,L,y,W-R,y,'chart-grid'); text(s,4,y+4,compactMoney(v),'chart-axis');
    }
    groups.forEach((g,i)=>{
      const x=L+(W-L-R)*(groups.length===1?0:i/(groups.length-1));
      const y=v=>T+(H-T-B)*(max-v)/span;
      line(s,x,y(g.high),x,y(g.low),'candle-wick');
      const top=Math.min(y(g.open),y(g.close)), h=Math.max(4,Math.abs(y(g.close)-y(g.open)));
      const cls=g.close>=g.open?'candle-up':'candle-down';
      rect(s,x-7,top,14,h,cls);
      if(i===0||i===groups.length-1||i%2===0) text(s,x,H-12,String(g.date).slice(5),'chart-axis');
    });
    text(s,L,16,'Velas de liquidez — apertura / máximo / mínimo / cierre semanal','chart-title');
  }

  function renderCharts({context, projection, state}) {
    const root=document.getElementById('executive-charts');
    if(!root) return;
    const hist=[];
    const byDate={};
    (context.incomes||[]).forEach(x=>{
      const d=byDate[x.date] ||= {date:x.date,income:0,expense:0};
      d.income+=num(x.amount);
    });
    (context.expenses||[]).forEach(x=>{
      const d=byDate[x.date] ||= {date:x.date,income:0,expense:0};
      d.expense+=num(x.amount);
    });
    const flow=Object.values(byDate).sort((a,b)=>a.date.localeCompare(b.date)).slice(-30);

    const futureFlow=(projection||[]).slice(0,30).map(x=>({
      date:x.date,
      income:num(x.assuredIncome)+num(x.projectedIncome)+num(x.plannedIncome),
      expense:num(x.mandatoryExpenses)+num(x.discretionaryExpenses)
    }));

    const obligations=(context.obligations||[]).reduce((m,x)=>{
      const key=x.source==='cuotas_deuda'?'Cuotas de deuda':x.source==='compromisos'?'Compromisos':'Deudas';
      m[key]=(m[key]||0)+num(x.amount); return m;
    },{});
    const donut=Object.entries(obligations).map(([label,value])=>({label,value})).sort((a,b)=>b.value-a.value);

    const charts=[
      ['chart-liquidity','Curva de liquidez',()=>drawLineChart(document.getElementById('chart-liquidity'),(projection||[]).filter((_,i)=>i%3===0),r=>num(r.closingBalance),'Liquidez proyectada')],
      ['chart-flow','Flujo próximo 30 días',()=>drawFlowBars(document.getElementById('chart-flow'),futureFlow)],
      ['chart-obligations','Composición de obligaciones',()=>drawDonut(document.getElementById('chart-obligations'),donut)],
      ['chart-candles','Velas financieras',()=>drawCandles(document.getElementById('chart-candles'),projection||[])]
    ];
    charts.forEach(([, ,fn])=>fn());

    const ratio = state.committedExpenses>0 ? (state.assuredIncome+state.availableBalance)/state.committedExpenses : Infinity;
    const riskNode=document.getElementById('executive-risk-summary');
    if(riskNode){
      riskNode.textContent = ratio===Infinity
        ? 'Sin obligaciones con monto comparable.'
        : `Cobertura actual + asegurada: ${Math.round(ratio*100)}%.`;
    }

    const historicalNode=document.getElementById('chart-history');
    if(historicalNode) drawFlowBars(historicalNode, flow);
  }

  return { renderCharts, VERSION:'EXEC-DASH-V1.0.0' };
})();
