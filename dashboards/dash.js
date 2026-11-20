/* Shared helpers for the dashboards: formatting, theme, sheets, KPI cards, filter bar. */
const fmt=(n,d=0)=>Number(n).toLocaleString('en-US',{maximumFractionDigits:d,minimumFractionDigits:d});
/* Theme: chart colours come from the CSS variables in dash.css, so charts follow the light/dark page theme. */
const _cs=getComputedStyle(document.documentElement),_v=(n,f)=>(_cs.getPropertyValue(n).trim()||f);
const T={text:_v('--ink','#1d1a16'),muted:_v('--ink-2','#423c35'),line:_v('--rule','#d5cbb9'),panel:_v('--sheet','#f9f6f0'),
 teal:_v('--teal','#2d6a5a'),coral:_v('--red','#9e2a2b'),blue:_v('--blue','#154734'),violet:_v('--violet','#5c3d4a'),sand:_v('--orange-dk','#6e4814'),dim:_v('--rule','#d5cbb9'),amber:_v('--orange','#8c5a18'),
 flag:_v('--flag','#9e2a2b'),warn:_v('--warn','#8c5a18'),pass:_v('--pass','#1b6548'),accent:_v('--accent','#154734'),
 scale1:_v('--scale-1','#9e2a2b'),scale2:_v('--scale-2','#8c5a18'),scale3:_v('--scale-3','#c4a36a'),scale4:_v('--scale-4','#3d7a62'),scale5:_v('--scale-5','#154734'),
 heat:[[0,_v('--heat-0','#f7f2e8')],[.5,_v('--heat-1','#dfece6')],[1,_v('--heat-2','#154734')]],tip:_v('--ink','#1d1a16'),
 // Categorical palette drawn from the homepage greens, cream, flag and warn tones
 cat:[_v('--accent','#154734'),_v('--warn','#8c5a18'),_v('--flag','#9e2a2b'),_v('--teal','#2d6a5a'),_v('--pass','#1b6548'),_v('--orange-lt','#c4a36a'),_v('--violet','#5c3d4a'),_v('--ink-2','#423c35'),_v('--muted','#665e53'),_v('--rule-strong','#b9ad99'),_v('--blue-lt','#3d7a62'),_v('--orange-dk','#6e4814')]};
const SANS="'Plus Jakarta Sans',-apple-system,'Segoe UI',sans-serif",MONO=SANS;
if(window.Chart){const c=Chart.defaults;c.color=T.muted;c.borderColor=T.line;c.font.family=SANS;c.font.size=12;c.animation.duration=350;c.maintainAspectRatio=false;
 Object.assign(c.plugins.tooltip,{backgroundColor:T.tip,borderColor:T.tip,borderWidth:1,padding:10,titleColor:_v('--warn-soft','#f4ead6'),bodyColor:_v('--accent-ink','#f7f3eb'),titleFont:{family:SANS,size:12,weight:'700'},bodyFont:{family:SANS,size:12.5},footerFont:{family:SANS,size:11,weight:'400'},footerColor:_v('--accent-ink','#f7f3eb'),cornerRadius:6,boxPadding:4});
 c.plugins.legend.labels.usePointStyle=true;c.plugins.legend.labels.boxWidth=8;c.plugins.legend.labels.boxHeight=8;}
const PL=(extra={})=>Object.assign({paper_bgcolor:'rgba(0,0,0,0)',plot_bgcolor:'rgba(0,0,0,0)',font:{color:T.muted,family:SANS,size:12},margin:{t:10,r:16,b:50,l:60},height:380,
 hoverlabel:{bgcolor:T.tip,bordercolor:T.tip,font:{family:SANS,color:_v('--accent-ink','#f7f3eb'),size:12.5}}},extra);
const ax=(t,e={})=>Object.assign({title:{text:t,font:{size:11.5}},gridcolor:T.line,zerolinecolor:T.line,linecolor:T.line,tickfont:{size:11}},e);
const PCFG={responsive:true,displaylogo:false,displayModeBar:false};
async function load(f){const r=await fetch('data/'+f);if(!r.ok)throw new Error('Could not load '+f);return r.json()}
window.addEventListener('error',e=>{document.body.dataset.err=(document.body.dataset.err||'')+e.message+'|'});
window.addEventListener('unhandledrejection',e=>{document.body.dataset.err=(document.body.dataset.err||'')+(e.reason&&e.reason.message||e.reason)+'|'});

/* Sheet = one Tableau-style worksheet panel with title bar, question caption, chart body */
let _n=0;
function sheet(id,{title,q,ref='',guide='',inferred=false,span=6,plot=false,height='',hint=''}){
 _n++;const a=document.createElement('article');a.className='sheet s'+span;a.style.animationDelay=(_n*40)+'ms';
 a.innerHTML=`<header><h3><span class="no">${String(_n).padStart(2,'0')}</span>${title}</h3>${guide?`<span class="badge">Guide chart ${guide}</span>`:''}</header>
 <p class="q">${q}</p>${ref?`<p class="ref">${ref}</p>`:''}
 <div class="body">${plot?`<div class="plot" id="${id}" role="img" aria-label="${title}"></div>`:`<div class="cv ${height}"><canvas id="${id}" role="img" aria-label="${title}: ${q.replace(/"/g,'')}"></canvas></div>`}</div>
 <p class="hint" id="${id}-hint">${hint}</p>`;
 document.getElementById('board').appendChild(a);return a}
const hint=(id,html)=>{const e=document.getElementById(id+'-hint');if(e)e.innerHTML=html};
const setLabel=(id,txt)=>{const e=document.getElementById(id);if(e)e.setAttribute('aria-label',txt)};

function kpiRender(list){document.getElementById('kpis').innerHTML=list.map(([l,v,s])=>`<div class="kpi" tabindex="0"><span class="l">${l}</span><b${String(v).length>13?' style="font-size:1.15rem"':''}>${v}</b><span class="s">${s||'&nbsp;'}</span></div>`).join('')}
/* KPIs animate once only (avoid flicker on each filter change) */
let _k=false;const kpis=l=>{kpiRender(l);if(_k)document.querySelectorAll('.kpi').forEach(k=>k.style.animation='none');_k=true};

/* Filter bar. defs: [{id,label,type:'select'|'seg',options:[[value,label]],value}]. onChange fires after any change. */
function Filters(defs,onChange){
 const bar=document.getElementById('filters');const F={v:{},defs};
 bar.innerHTML=defs.map(d=>{F.v[d.id]=d.value;
  if(d.type==='seg')return `<div class="f"><span class="lbl" id="l-${d.id}">${d.label}</span><div class="seg" role="radiogroup" aria-labelledby="l-${d.id}" data-id="${d.id}">${d.options.map(([v,l])=>`<button type="button" role="radio" aria-checked="${v===d.value}" data-v="${v}">${l}</button>`).join('')}</div></div>`;
  return `<div class="f"><label for="f-${d.id}">${d.label}</label><select id="f-${d.id}" data-id="${d.id}">${d.options.map(([v,l])=>`<option value="${v}"${v===d.value?' selected':''}>${l}</option>`).join('')}</select></div>`}).join('')
  +`<span class="spacer"></span><span class="status" id="status" aria-live="polite"></span><button type="button" class="reset" id="reset">Reset</button>`;
 let q=0;const fire=()=>{cancelAnimationFrame(q);q=requestAnimationFrame(()=>{updateReset();onChange(F)})};
 const sync=()=>{defs.forEach(d=>{if(d.type==='seg')bar.querySelectorAll(`.seg[data-id="${d.id}"] button`).forEach(b=>b.setAttribute('aria-checked',b.dataset.v===String(F.v[d.id])));else{const s=bar.querySelector(`select[data-id="${d.id}"]`);if(s)s.value=F.v[d.id]}})};
 const updateReset=()=>{document.getElementById('reset').disabled=defs.every(d=>String(F.v[d.id])===String(d.value))};
 F.set=(k,v)=>{F.v[k]=v;sync();fire()};
 F.toggle=(k,v)=>F.set(k,String(F.v[k])===String(v)?defs.find(d=>d.id===k).value:v);
 F.status=h=>{document.getElementById('status').innerHTML=h};
 bar.addEventListener('change',e=>{if(e.target.matches('select'))F.set(e.target.dataset.id,e.target.value)});
 bar.addEventListener('click',e=>{const b=e.target.closest('.seg button');if(b)F.set(b.parentElement.dataset.id,b.dataset.v)});
 bar.addEventListener('keydown',e=>{const b=e.target.closest('.seg button');if(!b||!/Arrow/.test(e.key))return;const all=[...b.parentElement.children],i=all.indexOf(b)+(/Right|Down/.test(e.key)?1:-1),n=all[(i+all.length)%all.length];n.focus();n.click();e.preventDefault()});
 document.getElementById('reset').onclick=()=>{defs.forEach(d=>F.v[d.id]=d.value);sync();fire()};
 updateReset();return F}
const pointer=(chart,on=true)=>{chart.options.onHover=(e,els)=>{e.native.target.style.cursor=on&&els.length?'pointer':'default'}};
const hex2rgba=(h,a)=>{const n=parseInt(h.slice(1),16);return `rgba(${n>>16},${(n>>8)&255},${n&255},${a})`};
const median=a=>{if(!a.length)return null;const s=[...a].sort((x,y)=>x-y),m=s.length>>1;return s.length%2?s[m]:(s[m-1]+s[m])/2};
/* Plugin: draw a short text annotation at a bar/point index */
const annotPlugin={id:'annot',afterDatasetsDraw(ch,_a,o){if(!o||!o.items)return;const {ctx,chartArea:A}=ch;ctx.save();ctx.font=`600 12px ${SANS}`;ctx.fillStyle=T.sand;ctx.strokeStyle=T.sand;
 o.items.forEach(it=>{const m=ch.getDatasetMeta(it.ds||0).data[it.i];if(!m)return;const x=m.x,y=m.y,ty=A.top+12;ctx.beginPath();ctx.setLineDash([3,3]);ctx.moveTo(x,y-4);ctx.lineTo(x,ty+6);ctx.stroke();ctx.setLineDash([]);
  ctx.textAlign='right';ctx.fillText(it.text,Math.min(A.right,x+8),ty)});ctx.restore()}};
if(window.Chart)Chart.register(annotPlugin);

/* Honour the homepage theme key so light/dark stays in sync across pages. */
(function(){
  const root=document.documentElement;
  const btn=document.getElementById('themeToggle');
  const icon=document.getElementById('themeIcon');
  if(!btn||!icon)return;
  const setIcon=()=>{icon.textContent=root.getAttribute('data-theme')==='dark'?'☀':'◐'};
  setIcon();
  btn.addEventListener('click',()=>{
    const next=root.getAttribute('data-theme')==='dark'?'light':'dark';
    root.setAttribute('data-theme',next);
    try{localStorage.setItem('bm_theme',next)}catch(e){}
    setIcon();
  });
})();
