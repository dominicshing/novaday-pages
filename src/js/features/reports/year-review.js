/* 年度回顧 */
function rpModeSeg(m){return `<div class="exseg rp-mode" role="radiogroup" aria-label="報告範圍"><button type="button" role="radio" data-rm="m" aria-checked="${m==='m'}">月報</button><button type="button" role="radio" data-rm="y" aria-checked="${m==='y'}">年度回顧</button></div>`}
function bindRpMode(Y,M){$('mBody').querySelectorAll('[data-rm]').forEach(b=>b.onclick=()=>{if(b.getAttribute('aria-checked')==='true')return;
  if(b.dataset.rm==='y')openYearReport(Y);else{const n=new Date();openReport(Y,Y===n.getFullYear()?n.getMonth():(M??11))}})}
function yearStats(Y){const list=ascEntries().filter(e=>e.date.startsWith(Y+'-')&&!isSample(e)),days=new Set(list.map(e=>e.date));
  const now=new Date(),isNow=Y===now.getFullYear(),start=new Date(Y,0,1),endD=isNow?now:new Date(Y,11,31),span=Math.round((new Date(endD.getFullYear(),endD.getMonth(),endD.getDate())-start)/864e5)+1;
  const cnt=[0,0,0,0,0];list.forEach(e=>cnt[e.mood??2]++);
  let best=0,run=0;for(let i=0;i<span;i++){const d=new Date(Y,0,1+i);if(days.has(ymd(d))){run++;best=Math.max(best,run)}else run=0}
  const months=[...Array(12)].map((_,m)=>{const key=`${Y}-${pad(m+1)}`,L=list.filter(e=>e.date.startsWith(key)),ds=new Set(L.map(e=>e.date)).size;
    return{m,n:L.length,days:ds,avg:L.length?L.reduce((t,e)=>t+(e.mood??2),0)/L.length:null,dim:new Date(Y,m+1,0).getDate(),future:isNow&&m>now.getMonth()}});
  const tc={},lc={};list.forEach(e=>{(e.tags||[]).forEach(t=>tc[t]=(tc[t]||0)+1);if(e.loc)lc[e.loc]=(lc[e.loc]||0)+1});
  const top=o=>Object.entries(o).sort((a,b)=>b[1]-a[1]);
  const st=consState(entries),done=st.done.filter(k=>{const es=conEntries(k);return es.length&&es[es.length-1].date.startsWith(Y+'-')});
  const longest=list.slice().sort((a,b)=>chars(b)-chars(a))[0],happiest=list.filter(e=>(e.mood??2)>=3).sort((a,b)=>(b.mood-a.mood)||chars(b)-chars(a))[0];
  const bestM=months.filter(x=>x.days).sort((a,b)=>b.days-a.days||b.n-a.n)[0];
  return{Y,isNow,list,days:days.size,span,cnt,best,months,tags:top(tc).slice(0,5),locs:top(lc).slice(0,3),done,longest,happiest,first:list[0],bestM,
    words:list.reduce((t,e)=>t+chars(e),0),photos:list.reduce((t,e)=>t+photoCount(e),0)}}
function openYearReport(Y){const R=yearStats(Y),n=R.list.length,now=new Date(),first=ascEntries().find(e=>!isSample(e)),minY=first?+first.date.slice(0,4):now.getFullYear();
  $('mTitle').textContent=`${Y} 年度星空回顧`;
  let g=rpModeSeg('y')+`<div class="rp-nav"><button type="button" id="ryPrev" aria-label="前一年"${Y>minY?'':' disabled'}>‹</button><span>${Y} 年${R.isNow?'・進行中':''}</span><button type="button" id="ryNext" aria-label="下一年"${Y<now.getFullYear()?'':' disabled'}>›</button></div>`;
  if(!n)g+=`<div class="es">${emptyState('這一年沒有紀錄','寫下幾則之後，這裡會整理出你的年度回顧。')}</div>`;
  else{const topM=R.cnt.lastIndexOf(Math.max(...R.cnt)),bar=R.cnt.map((c,i)=>c?`<i style="flex:${c};--c:var(${MOODS[i].c})"></i>`:'').join('');
    const C=2*Math.PI*26,f=R.days/R.span;
    g+=`<div class="rp-hero"><div class="rp-big"><b>${R.days}</b><small>天有寫日記${R.isNow?`（今年已過 ${R.span} 天）`:''}</small></div><div class="rp-ring"><svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="26" class="rr-b"/><circle cx="32" cy="32" r="26" class="rr-f" stroke-dasharray="${(C*f).toFixed(1)} ${C.toFixed(1)}" transform="rotate(-90 32 32)"/></svg><span>${pctDone(f)}%</span></div></div>
      <div class="rp-grid"><div><b>${n}</b><small>則紀錄</small></div><div><b>${R.words>=10000?(R.words/10000).toFixed(1)+'萬':R.words.toLocaleString()}</b><small>字</small></div><div><b>${R.best}</b><small>天最長連續</small></div><div><b>${R.done.length}</b><small>個星座</small></div></div>
      <div class="rp-sec"><h4>每個月的星光</h4><div class="ry-months" role="list">${R.months.map(x=>`<button type="button" role="listitem" class="ry-m${x.future?' fut':''}" data-m="${x.m}"${x.future?' disabled':''} aria-label="${x.m+1} 月：${x.days} 天、${x.n} 則"><span class="ry-col"><i style="height:${x.days?Math.max(8,x.days/x.dim*100):0}%;--c:${x.avg==null?'transparent':MOOD_HEX[Math.round(x.avg)]}"></i></span><small>${x.m+1}</small></button>`).join('')}</div>
        ${R.bestM?`<p class="ry-note">寫得最勤的是 <b>${R.bestM.m+1} 月</b>，${R.bestM.days} 天都有紀錄。點一下長條可以看那個月的月報。</p>`:''}</div>
      <div class="rp-sec"><h4>這一年的心情</h4><div class="rp-bar">${bar}</div><p>最常是 ${moon(topM)}<b>${MOODS[topM].n}</b>，共 ${R.cnt[topM]} 則（${Math.round(R.cnt[topM]/n*100)}%）</p></div>
      ${R.done.length?`<div class="rp-sec"><h4>點亮的星座</h4><div class="rp-cons">${R.done.slice(0,6).map(k=>`<button type="button" data-k="${k}"><svg viewBox="0 0 110 86" aria-hidden="true">${conSVG(k,110,86,10,CON[k].s.length,conEntries(k),{sc:.6})}</svg><b>${CON[k].n}</b></button>`).join('')}</div>${R.done.length>6?`<p>還有 ${R.done.length-6} 個星座，可以到圖鑑查看。</p>`:''}</div>`:''}
      ${R.tags.length?`<div class="rp-sec"><h4>最常出現的標籤</h4><div class="rp-tags">${R.tags.map(([t,c],i)=>`<span class="chip tag${i?'':' top'}">#${esc(t)}<em>${c}</em></span>`).join('')}</div></div>`:''}
      ${R.locs.length?`<div class="rp-sec"><h4>最常去的地方</h4><div class="rp-tags">${R.locs.map(([t,c])=>`<span class="chip tag">${IC_PIN}${esc(t)}<em>${c}</em></span>`).join('')}</div></div>`:''}
      <div class="rp-sec"><h4>值得回顧</h4>
        ${R.first?`<button type="button" class="rp-e" data-id="${esc(R.first.id)}"><small>這一年的第一則</small><b>${esc(R.first.title||untitled(R.first))}</b><span>${esc(fmtDay(R.first.date))}</span></button>`:''}
        ${R.longest&&R.longest!==R.first?`<button type="button" class="rp-e" data-id="${esc(R.longest.id)}"><small>寫得最多的一天・${chars(R.longest)} 字</small><b>${esc(R.longest.title||untitled(R.longest))}</b><span>${esc(fmtDay(R.longest.date))}</span></button>`:''}
        ${R.happiest&&R.happiest!==R.longest&&R.happiest!==R.first?`<button type="button" class="rp-e" data-id="${esc(R.happiest.id)}"><small>心情最好的一天・${MOODS[R.happiest.mood].n}</small><b>${esc(R.happiest.title||untitled(R.happiest))}</b><span>${esc(fmtDay(R.happiest.date))}</span></button>`:''}</div>
      ${R.photos?`<p class="rp-foot">這一年拍了 ${R.photos} 張照片</p>`:''}`}
  $('mBody').innerHTML=g;$('mBody').scrollTop=0;
  if(Y>minY)$('ryPrev').onclick=()=>openYearReport(Y-1);if(Y<now.getFullYear())$('ryNext').onclick=()=>openYearReport(Y+1);
  $('mBody').querySelectorAll('.ry-m[data-m]:not(:disabled)').forEach(b=>b.onclick=()=>openReport(Y,+b.dataset.m));
  $('mBody').querySelectorAll('.rp-e').forEach(b=>b.onclick=()=>openDetail(b.dataset.id));
  $('mBody').querySelectorAll('.rp-cons [data-k]').forEach(b=>b.onclick=()=>openCon(b.dataset.k));
  bindRpMode(Y,null);
  if(!$('monthSheet').classList.contains('open'))openSheet('monthSheet');else sheetTop('monthSheet')}
const MIC={pen:'<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>',
  book:'<path d="M4 5.5c2.5-1 5.5-1 8 .5 2.5-1.5 5.5-1.5 8-.5V19c-2.5-1-5.5-1-8 .5-2.5-1.5-5.5-1.5-8-.5z"/><path d="M12 6v13.5"/>',
  signal:'<circle cx="12" cy="12" r="1.8"/><path d="M8.5 15.5a5 5 0 0 1 0-7M15.5 8.5a5 5 0 0 1 0 7M5.6 18.4a9 9 0 0 1 0-12.8M18.4 5.6a9 9 0 0 1 0 12.8"/>',
  check:'<path d="M5 12.5l4.5 4.5L19 7.5"/>',lock:'<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  camera:'<path d="M4 8.5h3.2L9 6h6l1.8 2.5H20V18H4z"/><circle cx="12" cy="13" r="3.2"/>',
  swap:'<path d="M20 12a8 8 0 1 1-2.3-5.7"/><path d="M20 4v4h-4"/>'};
const ico=k=>`<svg viewBox="0 0 24 24" aria-hidden="true">${MIC[k]}</svg>`;
