/* 星空月報 */
function monthStats(Y,M){const key=`${Y}-${pad(M+1)}`,list=ascEntries().filter(e=>e.date.startsWith(key)&&!isSample(e));
  const days=new Set(list.map(e=>e.date)),dim=new Date(Y,M+1,0).getDate(),cnt=[0,0,0,0,0];list.forEach(e=>cnt[e.mood??2]++);
  let best=0,run=0;for(let d=1;d<=dim;d++){if(days.has(`${key}-${pad(d)}`)){run++;best=Math.max(best,run)}else run=0}
  const tc={};list.forEach(e=>(e.tags||[]).forEach(t=>tc[t]=(tc[t]||0)+1));const tags=Object.entries(tc).sort((a,b)=>b[1]-a[1]).slice(0,3);
  const longest=list.slice().sort((a,b)=>chars(b)-chars(a))[0],happiest=list.filter(e=>(e.mood??2)>=3).sort((a,b)=>(b.mood-a.mood)||chars(b)-chars(a))[0];
  const st=consState(entries),done=st.done.filter(k=>{const es=conEntries(k);return es.length&&es[es.length-1].date.startsWith(key)});
  const words=list.reduce((t,e)=>t+chars(e),0),photos=list.reduce((t,e)=>t+photoCount(e),0),locs=new Set(list.filter(e=>e.loc).map(e=>e.loc)).size;
  return{Y,M,key,list,days:days.size,dim,cnt,best,tags,longest,happiest,done,words,photos,locs}}
function openReport(Y,M){const R=monthStats(Y,M),n=R.list.length;$('mTitle').textContent=`${M+1} 月星空報告`;
  const now=new Date(),isNow=Y===now.getFullYear()&&M===now.getMonth(),pm=new Date(Y,M-1,1),nm=new Date(Y,M+1,1),canNext=nm<=new Date(now.getFullYear(),now.getMonth(),1);
  let g=rpModeSeg('m')+`<div class="rp-nav"><button type="button" id="rpPrev" aria-label="上個月">‹</button><span>${Y} 年 ${M+1} 月${isNow?'・進行中':''}</span><button type="button" id="rpNext" aria-label="下個月"${canNext?'':' disabled'}>›</button></div>`;
  if(!n){g+=`<div class="es">${emptyState('這個月沒有紀錄','寫下幾則之後，這裡會整理出你的月報。')}</div>`}
  else{const tot=n,bar=R.cnt.map((c,i)=>c?`<i style="flex:${c};--c:var(${MOODS[i].c})" title="${MOODS[i].n} ${c} 則"></i>`:'').join('');
    const topM=R.cnt.lastIndexOf(Math.max(...R.cnt));
    g+=`<div class="rp-hero"><div class="rp-big"><b>${R.days}</b><small>天有寫日記</small></div><div class="rp-ring">${(()=>{const C=2*Math.PI*26,f=R.days/R.dim;return `<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="26" class="rr-b"/><circle cx="32" cy="32" r="26" class="rr-f" stroke-dasharray="${(C*f).toFixed(1)} ${C.toFixed(1)}" transform="rotate(-90 32 32)"/></svg><span>${pctDone(f)}%</span>`})()}</div></div>
      <div class="rp-grid"><div><b>${n}</b><small>則紀錄</small></div><div><b>${R.words.toLocaleString()}</b><small>字</small></div><div><b>${R.best}</b><small>天最長連續</small></div><div><b>${n}</b><small>顆星被點亮</small></div></div>
      <div class="rp-sec"><h4>這個月的心情</h4><div class="rp-bar">${bar}</div><p>最常是 ${moon(topM)}<b>${MOODS[topM].n}</b>，共 ${R.cnt[topM]} 則（${Math.round(R.cnt[topM]/tot*100)}%）</p></div>
      ${R.done.length?`<div class="rp-sec"><h4>完成的星座</h4><div class="rp-cons">${R.done.map(k=>`<button type="button" data-k="${k}"><svg viewBox="0 0 110 86" aria-hidden="true">${conSVG(k,110,86,10,CON[k].s.length,conEntries(k),{sc:.6})}</svg><b>${CON[k].n}</b></button>`).join('')}</div></div>`:''}
      ${R.tags.length?`<div class="rp-sec"><h4>最常出現的標籤</h4><div class="rp-tags">${R.tags.map(([t,c],i)=>`<span class="chip tag${i?'':' top'}">#${esc(t)}<em>${c}</em></span>`).join('')}</div></div>`:''}
      <div class="rp-sec"><h4>值得回顧</h4>
        ${R.longest?`<button type="button" class="rp-e" data-id="${esc(R.longest.id)}"><small>寫得最多的一天・${chars(R.longest)} 字</small><b>${esc(R.longest.title||untitled(R.longest))}</b><span>${esc(fmtDay(R.longest.date))}</span></button>`:''}
        ${R.happiest&&R.happiest!==R.longest?`<button type="button" class="rp-e" data-id="${esc(R.happiest.id)}"><small>心情最好的一天・${MOODS[R.happiest.mood].n}</small><b>${esc(R.happiest.title||untitled(R.happiest))}</b><span>${esc(fmtDay(R.happiest.date))}</span></button>`:''}</div>
      ${R.photos||R.locs?`<p class="rp-foot">${R.photos?`拍了 ${R.photos} 張照片`:''}${R.photos&&R.locs?'・':''}${R.locs?`去了 ${R.locs} 個地方`:''}</p>`:''}`}
  $('mBody').innerHTML=g;$('mBody').scrollTop=0;
  $('rpPrev').onclick=()=>openReport(pm.getFullYear(),pm.getMonth());if(canNext)$('rpNext').onclick=()=>openReport(nm.getFullYear(),nm.getMonth());
  $('mBody').querySelectorAll('.rp-e').forEach(b=>b.onclick=()=>openDetail(b.dataset.id));
  $('mBody').querySelectorAll('.rp-cons [data-k]').forEach(b=>b.onclick=()=>openCon(b.dataset.k));
  bindRpMode(Y,M);
  if(!$('monthSheet').classList.contains('open'))openSheet('monthSheet');else sheetTop('monthSheet')}
$('rpOpen').onclick=()=>{const n=new Date();openReport(n.getFullYear(),n.getMonth())};
