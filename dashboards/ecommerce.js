(async()=>{
const [d,f]=await Promise.all([load('ecommerce.json'),load('f_ecom.json')]),m=d.meta,ST=f.states,MO=f.months,kept=d.monthly.m.map(x=>MO.indexOf(x));
const yearOf=mi=>+MO[mi].slice(0,4),years=[...new Set(kept.map(yearOf))];
const F=Filters([
 {id:'year',label:'Purchase year',type:'seg',value:'all',options:[['all','All'],...[2016,2017,2018].map(y=>[String(y),String(y)])]},
 {id:'state',label:'Customer state',type:'select',value:'all',options:[['all','All 27 states'],...ST.map(s=>[s,s])]}],render);
const okY=mi=>F.v.year==='all'||yearOf(mi)===+F.v.year;
const okS=si=>F.v.state==='all'||ST[si]===F.v.state;
const G='Olist chart guide, chart ';
sheet('c4',{title:'State volume vs basket size',q:'Which states have many orders, larger orders, or both?',guide:'04',span:7,plot:true,ref:'Volume versus AOV (delivered orders; the 150 and 5,000 lines are the guide\'s illustrative thresholds, drawn for all years). Bubble size = merchandise value. Click a state to cross-highlight.'});
sheet('c5',{title:'State Pareto',q:'How concentrated is delivered merchandise value?',guide:'05',span:5,height:'tall',ref:'State Pareto: bars are merchandise value, line is cumulative share. Click a bar to select a state.'});
sheet('c6',{title:'Monthly orders and AOV',q:'Does monthly order volume move with average basket size?',guide:'06',span:6,ref:'Monthly orders and AOV (delivered orders)'});
sheet('c8',{title:'Purchase timing',q:'When were recorded purchases made?',guide:'08',span:6,plot:true,ref:'Weekday x hour heatmap (all order statuses)'});
sheet('c11',{title:'Delivery reliability',q:'Does delivery reliability change across purchase cohorts?',guide:'11',span:6,ref:'Monthly on-time rate and delivery volume (delivery-eligible orders)'});
sheet('c16',{title:'Late vs on-time reviews',q:'Are late orders associated with lower recorded ratings?',guide:'16',span:6,ref:'On-time versus late review comparison (eligible, reviewed orders). Association only, not cause.'});
sheet('c24',{title:'Cohort retention',q:'What share of each first-observed-purchase cohort buys again in later calendar months?',guide:'24',span:12,plot:true,ref:'Cohort retention heatmap (cohorts of 500+ customers, months 0 to 6). <span class="note">not affected by the filters: customer-level data</span>'});

const sumBy=(tbl,key,pred)=>{const o={};for(let i=0;i<tbl.mi.length;i++){if(!pred(tbl.mi[i],tbl.si[i]))continue;const k=key(i);const r=o[k]||(o[k]={n:0,mv:0,mvn:0,ot:0,late:0});for(const c of ['n','mv','mvn','ot','late'])if(tbl[c])r[c]+=tbl[c][i]}return o};
let ch={};
const comboOpt=(y1,extra={})=>({interaction:{mode:'index',intersect:false},plugins:{legend:{position:'bottom'}},scales:Object.assign({y:{position:'left',beginAtZero:true,grid:{color:T.line}},y1:Object.assign({position:'right',grid:{drawOnChartArea:false}},y1),x:{grid:{display:false},ticks:{maxRotation:60}}},extra.scales||{})});
ch.c5=new Chart('c5',{data:{labels:[],datasets:[{type:'line',label:'Cumulative share (%)',data:[],borderColor:T.amber,backgroundColor:T.amber,yAxisID:'y1',pointRadius:2,tension:.2,order:0},{type:'bar',label:'Merchandise value (R$)',data:[],backgroundColor:T.blue,yAxisID:'y',borderRadius:2,order:1}]},options:Object.assign(comboOpt({min:0,max:100,title:{display:true,text:'Cumulative %'}}),{onClick:(e,els)=>{const x=els.find(a=>a.datasetIndex===1)||els[0];if(x)F.toggle('state',ch.c5.data.labels[x.index])}})});
ch.c5.options.scales.y.title={display:true,text:'Merchandise value (R$)'};ch.c5.options.scales.y.ticks={callback:v=>'R$'+fmt(v/1e6,1)+'M'};
ch.c5.options.plugins.tooltip={callbacks:{label:c=>c.datasetIndex===0?`Cumulative share: ${c.raw.toFixed(1)}%`:`Merchandise value: R$${fmt(c.raw)}`}};pointer(ch.c5);
ch.c6=new Chart('c6',{data:{labels:[],datasets:[{type:'bar',label:'Delivered orders',data:[],backgroundColor:T.blue,yAxisID:'y',borderRadius:2},{type:'line',label:'AOV (R$)',data:[],borderColor:T.coral,backgroundColor:T.coral,yAxisID:'y1',pointRadius:3,tension:.2,spanGaps:true}]},options:comboOpt({title:{display:true,text:'AOV (R$)'}})});
ch.c6.options.scales.y.title={display:true,text:'Delivered orders'};
ch.c6.options.plugins.tooltip={callbacks:{label:c=>c.datasetIndex?`AOV: R$${fmt(c.raw,2)}`:`Delivered orders: ${fmt(c.raw)}`}};
ch.c11=new Chart('c11',{data:{labels:[],datasets:[{type:'bar',label:'Eligible orders',data:[],backgroundColor:hex2rgba(T.blue,.75),yAxisID:'y',borderRadius:2},{type:'line',label:'On-time rate (%)',data:[],borderColor:T.teal,backgroundColor:T.teal,yAxisID:'y1',pointRadius:3,tension:.2,spanGaps:true}]},options:comboOpt({min:50,max:100,title:{display:true,text:'On-time rate (%)'}})});
ch.c11.options.scales.y.title={display:true,text:'Delivery-eligible orders'};
ch.c11.options.plugins.tooltip={callbacks:{label:c=>c.datasetIndex?`On-time rate: ${c.raw==null?'n/a':c.raw.toFixed(1)+'%'}`:`Eligible orders: ${fmt(c.raw)}`}};
const SC=['#ef4444','#f97316','#eab308','#84cc16','#22c55e'];
ch.c16=new Chart('c16',{type:'bar',data:{labels:[],datasets:[1,2,3,4,5].map((s,i)=>({label:s+' star',data:[],backgroundColor:SC[i],borderWidth:0}))},options:{indexAxis:'y',interaction:{mode:'nearest',intersect:true},plugins:{legend:{position:'bottom'},tooltip:{callbacks:{label:c=>`${c.dataset.label}: ${c.raw.toFixed(1)}% of reviewed orders`}}},scales:{x:{stacked:true,max:100,title:{display:true,text:'% of reviewed orders'}},y:{stacked:true,grid:{display:false}}}}});
const co=d.cohort;
Plotly.newPlot('c24',[{type:'heatmap',z:co.z,x:co.age.map(a=>'Month '+a),y:co.cohorts,colorscale:'Viridis',text:co.z.map(r=>r.map(v=>v==null?'':v.toFixed(2)+'%')),texttemplate:'%{text}',textfont:{size:11},hovertemplate:'Cohort %{y}, %{x}<br>%{z:.2f}% bought again<extra></extra>',zmax:3,zmin:0,colorbar:{thickness:10,ticksuffix:'%'},xgap:2,ygap:2}],PL({yaxis:ax('',{autorange:'reversed',type:'category'}),height:520,margin:{t:10,r:20,b:40,l:80}}),PCFG);
let scInit=false;

function render(){
 // ---- KPIs
 let orders=0,mv=0,mvn=0,deliv=0,elig=0,ot=0,late=0,rs=0,rn=0;
 for(let i=0;i<f.heat.mi.length;i++)if(okY(f.heat.mi[i])&&okS(f.heat.si[i]))orders+=f.heat.n[i];
 for(let i=0;i<f.deliv.mi.length;i++)if(okY(f.deliv.mi[i])&&okS(f.deliv.si[i])){deliv+=f.deliv.n[i];mv+=f.deliv.mv[i];mvn+=f.deliv.mvn[i]}
 for(let i=0;i<f.elig.mi.length;i++)if(okY(f.elig.mi[i])&&okS(f.elig.si[i])){elig+=f.elig.n[i];ot+=f.elig.ot[i];late+=f.elig.late[i]}
 for(let i=0;i<f.rvall.mi.length;i++)if(okY(f.rvall.mi[i])&&okS(f.rvall.si[i])){rs+=f.rvall.sum[i];rn+=f.rvall.n[i]}
 const sc=F.v.year!=='all'||F.v.state!=='all';
 kpis([['Orders (all statuses)',fmt(orders),sc?`of ${fmt(m.orders)} total`:'all purchase months'],['Delivered merchandise value','R$'+(mv>=1e5?fmt(mv/1e6,2)+'M':fmt(mv)),'excludes freight'],['Delivered AOV',mvn?'R$'+fmt(mv/mvn,2):'n/a','per delivered order'],
  ['On-time delivery rate',elig?fmt(ot/elig*100,2)+'%':'n/a',fmt(late)+' late of '+fmt(elig)+' eligible'],['Average review score',rn?fmt(rs/rn,2)+'/5':'n/a',fmt(rn)+' reviewed orders'],['Repeat customers',m.repeat_pct+'%','all customers, not filtered']]);
 F.status(`Showing <b>${F.v.year==='all'?'all years':F.v.year}</b>, <b>${F.v.state==='all'?'all states':F.v.state}</b>, ${fmt(orders)} orders`);
 // ---- states (year filter only, state highlighted)
 const sb=sumBy(f.deliv,i=>f.deliv.si[i],(mi)=>okY(mi));
 let rows=ST.map((s,si)=>{const r=sb[si]||{n:0,mv:0};return {s,si,n:r.n,mv:r.mv,aov:r.n?r.mv/r.n:null}}).filter(r=>r.n>0);
 const sel=F.v.state==='all'?null:F.v.state;
 const sct=[{type:'scatter',mode:'markers+text',x:rows.map(r=>r.n),y:rows.map(r=>r.aov),text:rows.map(r=>r.s),textposition:'top center',textfont:{size:10,color:T.muted},
  marker:{size:rows.map(r=>8+Math.sqrt(r.mv)/55),sizemode:'diameter',color:rows.map(r=>sel==null?T.teal:r.s===sel?T.coral:hex2rgba(T.teal,.3)),line:{color:T.panel,width:1}},
  customdata:rows.map(r=>[r.mv]),hovertemplate:'<b>%{text}</b><br>%{x:,} delivered orders<br>R$%{y:,.2f} per order<br>R$%{customdata[0]:,.0f} merchandise value<extra></extra>'}];
 const shapes=F.v.year==='all'?[{type:'line',x0:5000,x1:5000,y0:0,y1:1,yref:'paper',line:{color:T.sand,dash:'dot',width:1}},{type:'line',y0:150,y1:150,x0:0,x1:1,xref:'paper',line:{color:T.sand,dash:'dot',width:1}}]:[];
 const ann=F.v.year==='all'?[{x:1,y:1,xref:'paper',yref:'paper',xanchor:'right',yanchor:'top',text:'busy and big baskets',showarrow:false,font:{size:10.5,color:T.sand}},{x:0,y:0,xref:'paper',yref:'paper',xanchor:'left',yanchor:'bottom',text:'small and light',showarrow:false,font:{size:10.5,color:T.sand}}]:[];
 const lay=PL({xaxis:ax('Delivered orders (log scale)',{type:'log'}),yaxis:ax('Merchandise value per delivered order (R$)',{rangemode:'tozero'}),shapes,annotations:ann,height:430,hovermode:'closest',showlegend:false});
 if(!scInit){Plotly.newPlot('c4',sct,lay,PCFG);document.getElementById('c4').on('plotly_click',ev=>{const p=ev.points[0];if(p)F.toggle('state',p.text)});scInit=true}else Plotly.react('c4',sct,lay,PCFG);
 const tot=rows.reduce((s,r)=>s+r.n,0);
 const hi=rows.filter(r=>r.n>=5000&&r.aov>=150).map(r=>r.s);
 hint('c4',F.v.year==='all'?`<b>${rows.sort((a,b)=>b.n-a.n)[0].s}</b> dominates volume (${(rows[0].n/tot*100).toFixed(0)}% of delivered orders); the states with the largest baskets sit well to the left, with far fewer orders.`:`Thresholds hidden: they were set on all years.`);
 // ---- pareto
 const ps=[...rows].sort((a,b)=>b.mv-a.mv),tmv=ps.reduce((s,r)=>s+r.mv,0);let c=0;
 ch.c5.data.labels=ps.map(r=>r.s);ch.c5.data.datasets[1].data=ps.map(r=>r.mv);ch.c5.data.datasets[0].data=ps.map(r=>(c+=r.mv)/tmv*100);
 ch.c5.data.datasets[1].backgroundColor=ps.map(r=>sel==null||r.s===sel?T.blue:hex2rgba(T.blue,.25));ch.c5.update();
 const k80=ch.c5.data.datasets[0].data.findIndex(v=>v>=80)+1;
 hint('c5',`The top <b>${k80}</b> of ${ps.length} states make up 80% of delivered merchandise value; <b>${ps[0].s}</b> alone is ${(ps[0].mv/tmv*100).toFixed(0)}%.`);
 // ---- monthly (year + state)
 const km=kept.filter(okY),lab=km.map(mi=>MO[mi]);
 const dm=sumBy(f.deliv,i=>f.deliv.mi[i],(mi,si)=>okS(si)),em=sumBy(f.elig,i=>f.elig.mi[i],(mi,si)=>okS(si));
 ch.c6.data.labels=lab;ch.c6.data.datasets[0].data=km.map(mi=>(dm[mi]||{n:0}).n);ch.c6.data.datasets[1].data=km.map(mi=>dm[mi]&&dm[mi].n?dm[mi].mv/dm[mi].n:null);ch.c6.update();
 const o=ch.c6.data.datasets[0].data,a=ch.c6.data.datasets[1].data,pk=o.indexOf(Math.max(...o));
 hint('c6',`Busiest month: <b>${lab[pk]}</b> with ${fmt(o[pk])} delivered orders.`);
 ch.c11.data.labels=lab;ch.c11.data.datasets[0].data=km.map(mi=>(em[mi]||{n:0}).n);ch.c11.data.datasets[1].data=km.map(mi=>em[mi]&&em[mi].n?em[mi].ot/em[mi].n*100:null);
 ch.c11.options.scales.y1.min=F.v.state==='all'?50:0;ch.c11.update();
 const rr=ch.c11.data.datasets[1].data.filter(v=>v!=null);
 hint('c11',rr.length?`On-time rate ranges from <b>${Math.min(...rr).toFixed(1)}%</b> to <b>${Math.max(...rr).toFixed(1)}%</b> across the months shown.`:'');
 // ---- heatmap (year + state)
 const z=Array.from({length:7},()=>Array(24).fill(0));
 for(let i=0;i<f.heat.mi.length;i++)if(okY(f.heat.mi[i])&&okS(f.heat.si[i]))z[f.heat.purchase_weekday_number[i]-1][f.heat.purchase_hour[i]]+=f.heat.n[i];
 Plotly.react('c8',[{type:'heatmap',z,x:[...Array(24).keys()],y:['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],colorscale:T.heat,xgap:1,ygap:1,colorbar:{thickness:10},hovertemplate:'%{y} %{x}:00<br>%{z:,} orders<extra></extra>'}],PL({xaxis:ax('Hour of day',{dtick:3}),yaxis:ax('',{autorange:'reversed'}),height:300,margin:{t:10,r:10,b:46,l:44}}),PCFG);
 let bi=[0,0];z.forEach((r,y)=>r.forEach((v,x)=>{if(v>z[bi[0]][bi[1]])bi=[y,x]}));
 hint('c8',`Peak slot: <b>${['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][bi[0]]} ${bi[1]}:00</b>. Orders thin out overnight.`);
 // ---- reviews late/on-time
 const grp={0:{n:Array(5).fill(0),sum:0},1:{n:Array(5).fill(0),sum:0}};
 for(let i=0;i<f.rev.mi.length;i++)if(okY(f.rev.mi[i])&&okS(f.rev.si[i]))grp[f.rev.g[i]].n[f.rev.s[i]-1]+=f.rev.n[i];
 for(let i=0;i<f.revsum.mi.length;i++)if(okY(f.revsum.mi[i])&&okS(f.revsum.si[i]))grp[f.revsum.g[i]].sum+=f.revsum.latest_review_score[i];
 const gl=[['On time',0],['Late',1]].map(([n,g])=>{const t=grp[g].n.reduce((a,b)=>a+b,0);return {n,t,mean:t?grp[g].sum/t:null,pct:grp[g].n.map(v=>t?v/t*100:0)}});
 ch.c16.data.labels=gl.map(g=>`${g.n} (n=${fmt(g.t)}, mean ${g.mean==null?'n/a':g.mean.toFixed(2)})`);
 ch.c16.data.datasets.forEach((ds,i)=>ds.data=gl.map(g=>g.pct[i]));ch.c16.update();
 hint('c16',gl[1].mean!=null&&gl[0].mean!=null?`Late orders average <b>${gl[1].mean.toFixed(2)}</b> stars against <b>${gl[0].mean.toFixed(2)}</b> for on-time orders.`:'Not enough reviewed orders under these filters.');
 setLabel('c4','Scatter of delivered orders against order value by state');setLabel('c8','Heatmap of orders by weekday and hour');setLabel('c24','Cohort retention heatmap');
}
document.getElementById('notes').innerHTML=`<li>Source: Olist orders_analysis.csv (${fmt(m.orders)} orders), customers_analysis.csv (${fmt(m.customers)} customers) and cohort_retention.csv. Chart questions are quoted from my Olist Advanced Chart Guide, with the guide's chart number.</li>
<li>Delivered orders: ${fmt(m.delivered)}. ${fmt(m.eligible)} orders are eligible for on-time comparison and ${fmt(m.late)} of them were late. ${fmt(m.no_items)} orders have no item data and ${fmt(m.no_review)} have no review; they are left out of the affected measures, not counted as zero.</li>
<li>Monthly charts show ${m.months_kept[0]} to ${m.months_kept[1]}, only months with 100 or more orders (sparse months in late 2016 are dropped). 2016 therefore shows a single month. Filtering to one state can leave very small monthly counts, so read those rates with care.</li>
<li>Month 0 of the cohort chart is 100% by construction and shows as the top of the colour scale. Retention is very low (repeat customers are ${m.repeat_pct}%), so the colour scale tops out at 3%. The cohort chart and repeat-customer KPI come from customer-level data and ignore the filters.</li>
<li>Merchandise value excludes freight and is not revenue or profit. Currency is Brazilian real (R$). Filters are aggregated from the same CSVs; nothing is estimated.</li>`;
render();
})();
