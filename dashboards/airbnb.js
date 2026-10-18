(async()=>{
const [d,f]=await Promise.all([load('airbnb.json'),load('f_airbnb.json')]),m=d.meta,N=f.price.length;
const BED=[0,1,2,3,4,5],bedL=b=>b===0?'Studio':b+' BR';
const roomShort={'Entire home/apt':'Entire home','Private room':'Private room','Shared room':'Shared room'};
const roomCol=[T.teal,T.coral,T.blue];
const zipAll=[...new Set(f.zip.filter(Boolean))].sort();
const F=Filters([
 {id:'room',label:'Room type',type:'seg',value:'all',options:[['all','All'],...f.rooms.map((r,i)=>[String(i),roomShort[r]||r])]},
 {id:'bed',label:'Bedrooms',type:'select',value:'all',options:[['all','All bedroom counts'],...BED.map(b=>[String(b),bedL(b)])]},
 {id:'zip',label:'Zip code',type:'select',value:'all',options:[['all','All zip codes'],...zipAll.map(z=>[z,z])]},
 {id:'color',label:'Map colour',type:'seg',value:'room',options:[['room','Room type'],['price','Price']]}],render);
/* rows passing the filters, optionally ignoring one filter (so a chart that drives a filter can show the others dimmed) */
const pick=(except)=>{const out=[];for(let i=0;i<N;i++){
 if(except!=='room'&&F.v.room!=='all'&&f.room[i]!==+F.v.room)continue;
 if(except!=='bed'&&F.v.bed!=='all'&&f.bed[i]!==+F.v.bed)continue;
 if(except!=='zip'&&F.v.zip!=='all'&&f.zip[i]!==F.v.zip)continue;out.push(i)}return out};
const avg=a=>a.length?a.reduce((s,v)=>s+v,0)/a.length:0;
const nights=i=>f.nights[i].reduce((s,v)=>s+v,0);

sheet('c1',{title:'Listings by bedrooms',q:'How many distinct listings are there for each bedroom count?',span:4,ref:'Workbook chart: distinct bedroom listings. Click a bar to filter the page.',hint:''});
sheet('c2',{title:'Average price by bedrooms',q:'What is the average price per bedroom count?',span:4,ref:'Workbook chart: average price per bedroom (median shown beside it).'});
sheet('c6',{title:'Room types',q:'How do room types differ in count and price?',span:4,ref:'Supporting view. Click a bar to filter by room type.'});
sheet('c3',{title:'Price by zip code',q:'Which zip codes have the highest average listing price?',span:5,height:'tall',ref:'Workbook chart: price by zipcode (top 12 zips by average price; only zips with enough listings). Click a bar to filter by zip.'});
sheet('c4',{title:'Estimated revenue',q:'How does estimated revenue vary by year and month?',span:7,height:'tall',ref:'Workbook chart: revenue by year. Estimate = unavailable nights x listing price; calendar covers Jan 2016 to 2 Jan 2017 only.'});
sheet('c5',{title:'Listing map',q:'Where are listings and prices spread across the city?',span:12,plot:true,ref:'Overall question: how listings, prices and revenue are spread across areas and years. Every listing priced up to $500 that matches the filters; hover for details.'});

const bc=(id,type,labels,datasets,opt)=>new Chart(id,{type,data:{labels,datasets},options:Object.assign({plugins:{legend:{display:datasets.length>1}}},opt)});
const dimC=(sel,i,col)=>sel==null||sel===i?col:hex2rgba(col,.22);
let ch={};
ch.c1=bc('c1','bar',BED.map(bedL),[{label:'Listings',data:[],backgroundColor:T.teal,borderRadius:3}],{onClick:(e,els)=>els.length&&F.toggle('bed',String(BED[els[0].index])),plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>`${fmt(c.raw)} listings`,footer:i=>{const t=ch.c1.data.datasets[0].data.reduce((a,b)=>a+b,0);return t?(i[0].raw/t*100).toFixed(1)+'% of listings with a bedroom count':''}}}},scales:{y:{title:{display:true,text:'Distinct listings'},beginAtZero:true},x:{grid:{display:false}}}});
ch.c2=bc('c2','bar',BED.map(bedL),[{label:'Average price ($)',data:[],backgroundColor:T.coral,borderRadius:3},{label:'Median price ($)',data:[],backgroundColor:T.sand,borderRadius:3}],{onClick:(e,els)=>els.length&&F.toggle('bed',String(BED[els[0].index])),plugins:{legend:{position:'bottom'},tooltip:{callbacks:{label:c=>`${c.dataset.label}: $${fmt(c.raw,2)}`}}},scales:{y:{title:{display:true,text:'Nightly price ($)'},beginAtZero:true},x:{grid:{display:false}}}});
ch.c6=bc('c6','bar',f.rooms.map(r=>roomShort[r]||r),[{label:'Listings',data:[],backgroundColor:T.teal,yAxisID:'y',borderRadius:3},{label:'Average price ($)',data:[],backgroundColor:T.violet,yAxisID:'y1',borderRadius:3}],{onClick:(e,els)=>els.length&&F.toggle('room',String(els[0].index)),plugins:{legend:{position:'bottom'},tooltip:{callbacks:{label:c=>c.datasetIndex?`Average price: $${fmt(c.raw,2)}`:`${fmt(c.raw)} listings`}}},scales:{y:{position:'left',beginAtZero:true,title:{display:true,text:'Listings'}},y1:{position:'right',beginAtZero:true,grid:{drawOnChartArea:false},title:{display:true,text:'Avg price ($)'}},x:{grid:{display:false}}}});
ch.c3=bc('c3','bar',[],[{label:'Average price ($)',data:[],backgroundColor:T.blue,borderRadius:3}],{indexAxis:'y',onClick:(e,els)=>{if(els.length)F.toggle('zip',ch.c3._keys[els[0].index])},plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>`Average price: $${fmt(c.raw,2)}`,footer:i=>`${ch.c3._n[i[0].dataIndex]} listings in ${ch.c3._keys[i[0].dataIndex]}`}}},scales:{x:{beginAtZero:true,title:{display:true,text:'Average nightly price ($)'}},y:{grid:{display:false}}}});
ch.c4=bc('c4','bar',f.months,[{label:'Estimated revenue ($)',data:[],backgroundColor:T.violet,borderRadius:3}],{plugins:{legend:{display:false},annot:{items:[{i:f.months.length-1,text:'Calendar ends 2 Jan 2017',align:'right'}]},tooltip:{callbacks:{label:c=>'Estimated revenue: $'+fmt(c.raw),footer:i=>fmt(ch.c4._nights[i[0].dataIndex])+' unavailable nights'}}},scales:{y:{beginAtZero:true,title:{display:true,text:'Estimated revenue ($)'},ticks:{callback:v=>'$'+fmt(v/1e6,1)+'M'}},x:{grid:{display:false},ticks:{maxRotation:60}}},layout:{padding:{top:4}}});
[ch.c1,ch.c2,ch.c6,ch.c3].forEach(c=>pointer(c));
let mapInit=false;

function render(){
 const all=pick(),R=all.length;
 // KPIs
 const pr=all.map(i=>f.price[i]),rt=all.map(i=>f.rating[i]).filter(v=>v!=null);
 const nt=all.reduce((s,i)=>s+nights(i),0),rev=all.reduce((s,i)=>s+nights(i)*f.price[i],0);
 const filt=R!==N;
 kpis([['Listings',fmt(R),filt?`of ${fmt(N)} in Seattle`:'in Seattle'],['Average nightly price','$'+fmt(avg(pr),2),'median $'+fmt(median(pr)||0)],
  ['Average review score',rt.length?fmt(avg(rt),2)+'/100':'n/a',fmt(rt.length)+' listings rated'],['Estimated revenue','$'+fmt(rev/1e6,1)+'M','estimate, see notes'],['Unavailable nights',fmt(nt),'calendar Jan 2016 to 2 Jan 2017'],['Reviews (all listings)',fmt(m.reviews),'not affected by filters']]);
 F.status(`Showing <b>${fmt(R)}</b> of ${fmt(N)} listings`);
 // c1 bedrooms (own filter ignored: others dimmed)
 const b0=pick('bed'),selB=F.v.bed==='all'?null:+F.v.bed;
 const cnt=BED.map(b=>b0.filter(i=>f.bed[i]===b).length);
 ch.c1.data.datasets[0].data=cnt;ch.c1.data.datasets[0].backgroundColor=BED.map((b,i)=>dimC(selB,b,T.teal));ch.c1.update();
 ch.c2.data.datasets[0].data=BED.map(b=>avg(b0.filter(i=>f.bed[i]===b).map(i=>f.price[i])));
 ch.c2.data.datasets[1].data=BED.map(b=>median(b0.filter(i=>f.bed[i]===b).map(i=>f.price[i]))||0);
 ch.c2.data.datasets[0].backgroundColor=BED.map(b=>dimC(selB,b,T.coral));ch.c2.data.datasets[1].backgroundColor=BED.map(b=>dimC(selB,b,T.sand));ch.c2.update();
 setLabel('c1','Listings by bedroom count: '+BED.map((b,i)=>bedL(b)+' '+cnt[i]).join(', '));
 hint('c1',`Most common: <b>${bedL(BED[cnt.indexOf(Math.max(...cnt))])}</b> (${fmt(Math.max(...cnt))} listings).`);
 const av=ch.c2.data.datasets[0].data,top=av.indexOf(Math.max(...av));
 hint('c2',`Price rises with size: <b>${bedL(BED[top])}</b> averages $${fmt(av[top],0)} a night.`);
 // c6 room types
 const r0=pick('room'),selR=F.v.room==='all'?null:+F.v.room;
 ch.c6.data.datasets[0].data=f.rooms.map((_,k)=>r0.filter(i=>f.room[i]===k).length);
 ch.c6.data.datasets[1].data=f.rooms.map((_,k)=>avg(r0.filter(i=>f.room[i]===k).map(i=>f.price[i])));
 ch.c6.data.datasets[0].backgroundColor=f.rooms.map((_,k)=>dimC(selR,k,T.teal));ch.c6.data.datasets[1].backgroundColor=f.rooms.map((_,k)=>dimC(selR,k,T.violet));ch.c6.update();
 hint('c6','Entire homes cost roughly twice as much as private rooms across the full data.');
 // c3 zips
 const z0=pick('zip'),g={};z0.forEach(i=>{const z=f.zip[i];if(z){(g[z]=g[z]||[]).push(f.price[i])}});
 const minN=(F.v.room==='all'&&F.v.bed==='all')?20:5;
 let zs=Object.entries(g).filter(([z,a])=>a.length>=minN).map(([z,a])=>[z,avg(a),a.length]).sort((a,b)=>b[1]-a[1]).slice(0,12);
 if(F.v.zip!=='all'&&g[F.v.zip]&&!zs.find(x=>x[0]===F.v.zip))zs.push([F.v.zip,avg(g[F.v.zip]),g[F.v.zip].length]);
 ch.c3._keys=zs.map(x=>x[0]);ch.c3._n=zs.map(x=>x[2]);ch.c3.data.labels=zs.map(x=>x[0]+'  (n='+x[2]+')');
 const selZ=F.v.zip==='all'?null:F.v.zip;ch.c3.data.datasets[0].data=zs.map(x=>x[1]);ch.c3.data.datasets[0].backgroundColor=zs.map(x=>selZ==null||x[0]===selZ?T.blue:hex2rgba(T.blue,.22));ch.c3.update();
 hint('c3',zs.length?`Showing zips with at least <b>${minN}</b> listings under the current filters. Highest: <b>${zs[0][0]}</b> at $${fmt(zs[0][1],0)}.`:`No zip code has ${minN}+ listings under these filters.`);
 // c4 revenue by month
 const rm=f.months.map((_,k)=>all.reduce((s,i)=>s+f.nights[i][k]*f.price[i],0)),nm=f.months.map((_,k)=>all.reduce((s,i)=>s+f.nights[i][k],0));
 ch.c4._nights=nm;ch.c4.data.datasets[0].data=rm;ch.c4.update();
 const y16=rm.slice(0,12).reduce((a,b)=>a+b,0),y17=rm[12];
 hint('c4',`By year: <b>2016</b> $${fmt(y16)} &middot; <b>2017</b> $${fmt(y17)} (2 Jan only).`);
 // c5 map
 const ptsAll=all.filter(i=>f.lat[i]!=null&&f.price[i]>0&&f.price[i]<=500);
 const traces=F.v.color==='room'?f.rooms.map((r,k)=>{const p=ptsAll.filter(i=>f.room[i]===k);return {type:'scattermapbox',mode:'markers',name:roomShort[r]||r,lat:p.map(i=>f.lat[i]),lon:p.map(i=>f.lon[i]),marker:{size:7,color:roomCol[k],opacity:.7},customdata:p.map(i=>[f.price[i],bedL(f.bed[i]),f.zip[i]||'n/a']),hovertemplate:'$%{customdata[0]}/night<br>%{customdata[1]} &middot; zip %{customdata[2]}<extra>'+(roomShort[r]||r)+'</extra>'}})
  :[{type:'scattermapbox',mode:'markers',name:'Listings',lat:ptsAll.map(i=>f.lat[i]),lon:ptsAll.map(i=>f.lon[i]),marker:{size:7,opacity:.75,color:ptsAll.map(i=>f.price[i]),colorscale:'Viridis',cmin:20,cmax:350,colorbar:{title:{text:'$/night'},thickness:10,len:.6,tickfont:{size:10}}},customdata:ptsAll.map(i=>[f.price[i],bedL(f.bed[i]),f.zip[i]||'n/a',roomShort[f.rooms[f.room[i]]]]),hovertemplate:'$%{customdata[0]}/night<br>%{customdata[3]} &middot; %{customdata[1]} &middot; zip %{customdata[2]}<extra></extra>'}];
 const ctr=(()=>{if(!ptsAll.length)return {c:{lat:47.6205,lon:-122.33},z:10.3};const la=ptsAll.map(i=>f.lat[i]),lo=ptsAll.map(i=>f.lon[i]),a=Math.min(...la),b=Math.max(...la),c=Math.min(...lo),e=Math.max(...lo),w=Math.max(document.getElementById('c5').clientWidth,300);const z=Math.log2(w*360/(512*Math.max((e-c)*1.35,(b-a)*1.35*1.6,.012)));return {c:{lat:(a+b)/2,lon:(c+e)/2},z:Math.min(Math.max(z,9),14)}})();
 const lay=PL({height:500,margin:{t:0,r:0,b:0,l:0},showlegend:F.v.color==='room',legend:{orientation:'h',x:.01,y:.02,bgcolor:hex2rgba(T.panel,.85),font:{color:T.text}},mapbox:{style:'open-street-map',center:ctr.c,zoom:ctr.z},uirevision:[F.v.room,F.v.bed,F.v.zip].join('|')});
 if(!mapInit){Plotly.newPlot('c5',traces,lay,PCFG);mapInit=true}else Plotly.react('c5',traces,lay,PCFG);
 setLabel('c5',`Map of ${fmt(ptsAll.length)} Seattle listings`);
}
document.getElementById('notes').innerHTML=`<li>Source: Tableau Full Project.xlsx (Listings ${fmt(m.listings)} rows, Reviews ${fmt(m.reviews)} rows, Calendar ${fmt(m.calendar_rows)} rows). City is Seattle for all listings.</li>
<li>The Calendar sheet stops at ${fmt(m.calendar_rows)} rows (the Excel row limit), so it covers only ${fmt(m.listings_in_cal)} of ${fmt(m.listings)} listings and runs ${m.date_min} to ${m.date_max}. Revenue is therefore a partial-year estimate, not actual earnings.</li>
<li>Revenue estimate: ${fmt(m.booked_nights)} unavailable nights x each listing's listed price. Unavailable nights may include host-blocked dates, and calendar prices are blank on those nights.</li>
<li>${m.bedrooms_missing} listings have no bedroom count and ${m.zip_missing} have no usable zip code; they are left out of those charts. Bedroom charts show 0 to 5 bedrooms. The map shows listings priced $1 to $500 with coordinates.</li>
<li>Filters work on the real listing-level data; "average" is the mean of the listing price column. The zip chart needs 20 listings per zip unfiltered and 5 once a room or bedroom filter is on, so tiny groups don't dominate.</li>
`;
render();
})();
