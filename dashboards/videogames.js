(async()=>{
const [d,f]=await Promise.all([load('videogames.json'),load('f_vg.json')]),m=d.meta,N=f.name.length;
const REG=[['gl_','Global'],['na','North America'],['eu','Europe'],['jp','Japan'],['ot','Other']];
const RSEG=[['gl_','Global'],['na','N. America'],['eu','Europe'],['jp','Japan'],['ot','Other']];
const rname=k=>REG.find(r=>r[0]===k)[1];
const years=[];for(let y=m.year_min;y<=m.year_max;y++)years.push(y);
const F=Filters([
 {id:'reg',label:'Sales region',type:'seg',value:'gl_',options:RSEG},
 {id:'genre',label:'Genre',type:'select',value:'all',options:[['all','All genres'],...f.genres.map((g,i)=>[String(i),g])]},
 {id:'plat',label:'Platform',type:'select',value:'all',options:[['all','All platforms'],...f.platforms.map((g,i)=>[String(i),g]).sort((a,b)=>a[1].localeCompare(b[1]))]},
 {id:'y0',label:'Released from',type:'select',value:String(m.year_min),options:years.map(y=>[String(y),String(y)])},
 {id:'y1',label:'to',type:'select',value:String(m.year_max),options:years.map(y=>[String(y),String(y)])}],render);
const full=()=>F.v.y0==='1980'&&+F.v.y1===m.year_max;
const yok=i=>{const y=f.year[i];if(y==null)return full();return y>=+F.v.y0&&y<=+F.v.y1};
const pick=ex=>{const o=[];for(let i=0;i<N;i++){if(!yok(i))continue;if(ex!=='genre'&&F.v.genre!=='all'&&f.genre[i]!==+F.v.genre)continue;if(ex!=='plat'&&F.v.plat!=='all'&&f.plat[i]!==+F.v.plat)continue;o.push(i)}return o};
const val=(i,r)=>f[r][i];
const topN=(rows,keyArr,names,r,n)=>{const g={};rows.forEach(i=>{const k=keyArr[i];if(k==null)return;g[k]=(g[k]||0)+f[r][i]});return Object.entries(g).sort((a,b)=>b[1]-a[1]).slice(0,n).map(([k,v])=>[names?names[k]:k,v,k])};
sheet('c1',{title:'Sales by genre',q:'Which genres generate the most global sales?',span:4,height:'tall',ref:'Click a bar to filter by genre. Bars follow the Sales region toggle.'});
sheet('c2',{title:'Sales by genre over time',q:'How have sales by genre changed across release years?',span:8,plot:true,ref:'Years 1980 to 2016 (later years have too few games). Stacked by genre; the selected genre keeps its colour.'});
sheet('c3',{title:'Top platforms',q:'Which platforms have sold the most?',span:4,height:'tall',ref:'Top 10 platforms. Click a bar to filter by platform.'});
sheet('c4',{title:'Top publishers',q:'Which publishers lead in global sales?',span:4,height:'tall',ref:'Top 10 publishers under the current filters.'});
sheet('c5',{title:'Regional split',q:'How is global sales split across regions?',span:4,height:'tall',ref:'Click a slice to switch the Sales region. Shares are of the four regional columns.'});
sheet('c6',{title:'Genre by region',q:'Do regions prefer different genres?',span:6,plot:true,ref:'Each row is a region split of that genre\'s sales (% of genre total). Click a row to filter by genre.'});
sheet('c7',{title:'Best-selling games',q:'Which individual games sold the most?',span:6,height:'tall',ref:'Top 10 titles under the current filters; label shows game and platform.'});

const gcol=i=>T.cat[i%12];
const hbar=(id,cb)=>new Chart(id,{type:'bar',data:{labels:[],datasets:[{data:[],backgroundColor:T.blue,borderRadius:3}]},options:{indexAxis:'y',onClick:cb,plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>`${fmt(c.raw,2)}M units`}}},scales:{x:{beginAtZero:true,title:{display:true,text:'Sales (millions of units)'}},y:{grid:{display:false}}}}});
let ch={};
ch.c1=hbar('c1',(e,els)=>els.length&&F.toggle('genre',String(ch.c1._k[els[0].index])));
ch.c3=hbar('c3',(e,els)=>els.length&&F.toggle('plat',String(ch.c3._k[els[0].index])));
ch.c4=hbar('c4',null);ch.c7=hbar('c7',null);
ch.c5=new Chart('c5',{type:'doughnut',data:{labels:REG.slice(1).map(r=>r[1]),datasets:[{data:[],backgroundColor:[T.blue,T.coral,T.teal,T.violet],borderColor:T.panel,borderWidth:2,offset:[0,0,0,0]}]},options:{cutout:'58%',onClick:(e,els)=>{if(els.length)F.toggle('reg',REG[els[0].index+1][0])},plugins:{legend:{position:'bottom'},tooltip:{callbacks:{label:c=>{const t=c.dataset.data.reduce((a,b)=>a+b,0);return `${c.label}: ${fmt(c.raw,1)}M (${(c.raw/t*100).toFixed(1)}%)`}}}}}});
[ch.c1,ch.c3,ch.c5].forEach(c=>pointer(c));
let tInit=false,hInit=false;

function render(){
 const r=F.v.reg,rn=rname(r),all=pick();
 const tot=all.reduce((s,i)=>s+val(i,r),0),pf=new Set(all.map(i=>f.plat[i])),pb=new Set(all.map(i=>f.pub[i]).filter(x=>x!=null));
 const ys=all.map(i=>f.year[i]).filter(y=>y!=null),best=all.reduce((b,i)=>b==null||val(i,r)>val(b,r)?i:b,null);
 kpis([['Games',fmt(all.length),all.length!==N?`of ${fmt(N)} in vgsales.csv`:'in vgsales.csv'],[rn+' sales',fmt(tot,1)+'M','millions of units'],['Platforms',fmt(pf.size),'with at least one game'],['Publishers',fmt(pb.size),'with a listed publisher'],['Release years',ys.length?Math.min(...ys)+' to '+Math.max(...ys):'n/a',full()?'incl. '+m.year_missing+' with no year':'dated games only'],['Best seller',best==null?'n/a':f.name[best],best==null?'':fmt(val(best,r),2)+'M ('+f.platforms[f.plat[best]]+')']]);
 F.status(`Showing <b>${fmt(all.length)}</b> of ${fmt(N)} games`);
 // genres (own filter ignored)
 const g0=pick('genre'),gs=f.genres.map((g,k)=>[g,g0.filter(i=>f.genre[i]===k).reduce((s,i)=>s+val(i,r),0),k]).sort((a,b)=>b[1]-a[1]),selG=F.v.genre==='all'?null:+F.v.genre;
 ch.c1._k=gs.map(x=>x[2]);ch.c1.data.labels=gs.map(x=>x[0]);ch.c1.data.datasets[0].data=gs.map(x=>x[1]);ch.c1.data.datasets[0].backgroundColor=gs.map(x=>selG==null||x[2]===selG?gcol(x[2]):hex2rgba(gcol(x[2]),.2));ch.c1.update();
 hint('c1',gs[0][1]?`<b>${gs[0][0]}</b> leads with ${fmt(gs[0][1],0)}M, then <b>${gs[1][0]}</b> (${fmt(gs[1][1],0)}M).`:'No games match these filters.');
 // platforms
 const p0=pick('plat'),ps=topN(p0,f.plat,f.platforms,r,10),selP=F.v.plat==='all'?null:+F.v.plat;
 ch.c3._k=ps.map(x=>+x[2]);ch.c3.data.labels=ps.map(x=>x[0]);ch.c3.data.datasets[0].data=ps.map(x=>x[1]);ch.c3.data.datasets[0].backgroundColor=ps.map(x=>selP==null||+x[2]===selP?T.coral:hex2rgba(T.coral,.2));ch.c3.update();
 hint('c3',ps.length?`<b>${ps[0][0]}</b> leads with ${fmt(ps[0][1],0)}M units.`:'');
 // publishers + titles
 const bs=topN(all,f.pub,f.publishers,r,10);ch.c4.data.labels=bs.map(x=>x[0]);ch.c4.data.datasets[0].data=bs.map(x=>x[1]);ch.c4.data.datasets[0].backgroundColor=T.teal;ch.c4.update();
 hint('c4',bs.length?`<b>${bs[0][0]}</b> leads; the top 10 publishers hold ${tot?(bs.reduce((s,x)=>s+x[1],0)/tot*100).toFixed(0):0}% of the selected sales.`:'');
 const ts=[...all].sort((a,b)=>val(b,r)-val(a,r)).slice(0,10);ch.c7.data.labels=ts.map(i=>`${f.name[i]} (${f.platforms[f.plat[i]]})`);ch.c7.data.datasets[0].data=ts.map(i=>val(i,r));ch.c7.data.datasets[0].backgroundColor=T.sand;ch.c7.update();
 hint('c7',ts.length?`Number one: <b>${f.name[ts[0]]}</b> (${f.platforms[f.plat[ts[0]]]}) at ${fmt(val(ts[0],r),2)}M.`:'');
 // regions doughnut (region ignored)
 const rg=REG.slice(1).map(([k])=>all.reduce((s,i)=>s+f[k][i],0));ch.c5.data.datasets[0].data=rg;
 ch.c5.data.datasets[0].backgroundColor=REG.slice(1).map(([k],j)=>r==='gl_'||r===k?[T.blue,T.coral,T.teal,T.violet][j]:hex2rgba([T.blue,T.coral,T.teal,T.violet][j],.25));ch.c5.update();
 const rt=rg.reduce((a,b)=>a+b,0);hint('c5',rt?`North America ${(rg[0]/rt*100).toFixed(0)}%, Europe ${(rg[1]/rt*100).toFixed(0)}%, Japan ${(rg[2]/rt*100).toFixed(0)}%, other ${(rg[3]/rt*100).toFixed(0)}%.`:'');
 // trend (stack by genre; years <=2016)
 const yy=years.filter(y=>y>=+F.v.y0&&y<=Math.min(+F.v.y1,2016)),gi={};f.genres.forEach((g,k)=>gi[k]=Object.fromEntries(yy.map(y=>[y,0])));
 g0.forEach(i=>{const y=f.year[i];if(y!=null&&gi[f.genre[i]][y]!=null)gi[f.genre[i]][y]+=val(i,r)});
 const order=gs.map(x=>x[2]);
 const tr=order.map(k=>({type:'scatter',mode:'lines',stackgroup:'one',name:f.genres[k],x:yy,y:yy.map(y=>gi[k][y]),line:{width:selG===k?2:.6,color:gcol(k)},fillcolor:selG==null||selG===k?hex2rgba(gcol(k),.85):hex2rgba(gcol(k),.12),hovertemplate:'%{x}: %{y:.1f}M<extra>'+f.genres[k]+'</extra>'}));
 const tl=PL({xaxis:ax('Release year'),yaxis:ax(rn+' sales (millions)'),height:400,legend:{orientation:'h',y:-.22,font:{size:11}},hovermode:'x unified',margin:{t:10,r:16,b:90,l:60}});
 if(!tInit){Plotly.newPlot('c2',tr,tl,PCFG);tInit=true}else Plotly.react('c2',tr,tl,PCFG);
 const yt=yy.map(y=>order.reduce((s,k)=>s+gi[k][y],0)),pk=yt.indexOf(Math.max(...yt));
 hint('c2',yy.length?`Peak release year in view: <b>${yy[pk]}</b> (${fmt(yt[pk],0)}M units).`:'No release years in range up to 2016.');
 // heatmap: genre x region % (genre ignored; platform + years apply)
 const hz=gs.map(([g,_,k])=>{const rows=g0.filter(i=>f.genre[i]===k),v=REG.slice(1).map(([c])=>rows.reduce((s,i)=>s+f[c][i],0)),t=v.reduce((a,b)=>a+b,0);return v.map(x=>t?+(x/t*100).toFixed(1):null)});
 const hl=PL({yaxis:ax('',{autorange:'reversed'}),height:400,margin:{t:10,r:10,b:40,l:90},shapes:selG==null?[]:[{type:'rect',xref:'paper',x0:0,x1:1,yref:'y',y0:gs.findIndex(x=>x[2]===selG)-.5,y1:gs.findIndex(x=>x[2]===selG)+.5,line:{color:T.sand,width:2}}]});
 const ht=[{type:'heatmap',z:hz,x:REG.slice(1).map(x=>x[1]),y:gs.map(x=>x[0]),colorscale:T.heat,xgap:2,ygap:2,text:hz.map(r=>r.map(v=>v==null?'':v+'%')),texttemplate:'%{text}',hovertemplate:'%{y}, %{x}: %{z}% of the genre\'s sales<extra></extra>',colorbar:{thickness:10,ticksuffix:'%'}}];
 if(!hInit){Plotly.newPlot('c6',ht,hl,PCFG);document.getElementById('c6').on('plotly_click',ev=>{const p=ev.points[0];if(p)F.toggle('genre',String(f.genres.indexOf(p.y)))});hInit=true}else Plotly.react('c6',ht,hl,PCFG);
 const jp=f.genres.map((g,k)=>[g,hz[gs.findIndex(x=>x[2]===k)][2]]).filter(x=>x[1]!=null).sort((a,b)=>b[1]-a[1])[0];
 hint('c6',jp?`Japan takes its largest share in <b>${jp[0]}</b> (${jp[1]}% of that genre's sales).`:'');
 setLabel('c2','Stacked area of sales by genre and release year');setLabel('c6','Heatmap of genre share by region');
}
document.getElementById('notes').innerHTML=`<li>Source: vgsales.csv (${fmt(m.rows)} games, sales in millions of units). Filters re-cut the real rows; no values are modelled.</li>
<li>${m.year_missing} games have no release year. They are included only while the release-year range is the full ${m.year_min} to ${m.year_max}; narrowing the range removes them. ${m.publisher_missing} games have no publisher and are left out of the publisher chart. The trend chart stops at 2016 because the data thins out after it.</li>
<li>Regional sales are the file's NA, EU, JP and Other columns. Global sales is its own column and may differ slightly from their sum.</li>
`;
render();
})();
