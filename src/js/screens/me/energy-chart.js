/* 「我的」頁：心情能量圖表 */
/* 心情能量：近 30 天曲線（縱軸＝當天平均能量），間隔 ≤2 天的紀錄連成實線，較長空檔用虛線銜接 */
function renderEnergy(){
  const t0=new Date();t0.setHours(0,0,0,0);const days=[];
  for(let i=29;i>=0;i--){const d=new Date(t0);d.setDate(d.getDate()-i);days.push(ymd(d))}
  const by={};entries.forEach(e=>{if(days.includes(e.date))(by[e.date]=by[e.date]||[]).push(e)});
  const X0=38,X1=308,Y0=116,Y1=16,xs=i=>X0+i*(X1-X0)/29,ys=v=>Y0-v*(Y0-Y1)/4,cl=v=>Math.min(Y0,Math.max(Y1,v));
  const pts=[];days.forEach((k,i)=>{const es=by[k];if(!es)return;const v=es.reduce((s,e)=>s+(e.mood??2),0)/es.length;
    const last=es.slice().sort((a,b)=>(b.time||'').localeCompare(a.time||''))[0],ms=es.map(e=>e.mood??2);pts.push({i,k,v,x:xs(i),y:ys(v),id:last.id,n:es.length,lo:Math.min(...ms),hi:Math.max(...ms)})});
  const runs=[];pts.forEach((p,j)=>{if(j&&p.i-pts[j-1].i<=2)runs[runs.length-1].push(p);else runs.push([p])});
  /* 單調三次插值（同 d3.curveMonotoneX）：曲線不會超出相鄰兩點的高低範圍，避免假的起伏 */
  const smooth=r=>{const n=r.length,dx=[],s=[],t=[];for(let j=0;j<n-1;j++){dx[j]=r[j+1].x-r[j].x;s[j]=(r[j+1].y-r[j].y)/dx[j]}
    for(let j=1;j<n-1;j++){const p=(s[j-1]*dx[j]+s[j]*dx[j-1])/(dx[j-1]+dx[j]);t[j]=(Math.sign(s[j-1])+Math.sign(s[j]))*Math.min(Math.abs(s[j-1]),Math.abs(s[j]),.5*Math.abs(p))||0}
    t[0]=n>2?(3*s[0]-t[1])/2:s[0];t[n-1]=n>2?(3*s[n-2]-t[n-2])/2:s[n-2];
    if(n>2){if(Math.sign(t[0])!==Math.sign(s[0]))t[0]=0;if(Math.sign(t[n-1])!==Math.sign(s[n-2]))t[n-1]=0}
    let d=`M${r[0].x.toFixed(1)} ${r[0].y.toFixed(1)}`;
    for(let j=0;j<n-1;j++){const k=dx[j]/3;d+=`C${(r[j].x+k).toFixed(1)} ${cl(r[j].y+t[j]*k).toFixed(1)} ${(r[j+1].x-k).toFixed(1)} ${cl(r[j+1].y-t[j+1]*k).toFixed(1)} ${r[j+1].x.toFixed(1)} ${r[j+1].y.toFixed(1)}`}return d};
  let g=`<defs><linearGradient id="enStroke" gradientUnits="userSpaceOnUse" x1="0" y1="${Y0}" x2="0" y2="${Y1}">${MOODS.map((m,i)=>`<stop offset="${i/4}" style="stop-color:var(${m.c})"/>`).join('')}</linearGradient>
    <linearGradient id="enArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:#6FE3D6;stop-opacity:.22"/><stop offset="1" style="stop-color:#6FE3D6;stop-opacity:0"/></linearGradient></defs>`;
  MOODS.forEach((m,v)=>{g+=`<line class="en-grid" x1="${X0}" x2="${X1}" y1="${ys(v)}" y2="${ys(v)}"/><g><title>${m.n}</title>${moonG(v,17,ys(v),6)}</g>`});
  const f=parse(days[0]),mid=parse(days[15]);
  g+=`<text class="en-xlab" x="${X0}" y="140">${fmtMD(f)}</text><text class="en-xlab" x="${xs(15)}" y="140" text-anchor="middle">${fmtMD(mid)}</text><text class="en-xlab" x="${X1}" y="140" text-anchor="end">${tl('今天')}</text>`;
  g+=`<line x1="${X1}" x2="${X1}" y1="${Y1-4}" y2="${Y0}" stroke="rgba(255,180,92,.25)" stroke-dasharray="2 3"/>`;
  runs.forEach((r,j)=>{if(j){const a=runs[j-1][runs[j-1].length-1],b=r[0];g+=`<line class="egap" x1="${a.x.toFixed(1)}" y1="${a.y.toFixed(1)}" x2="${b.x.toFixed(1)}" y2="${b.y.toFixed(1)}"/>`}
    if(r.length>1){const d=smooth(r);g+=`<path class="earea" d="${d}L${r[r.length-1].x.toFixed(1)} ${Y0}L${r[0].x.toFixed(1)} ${Y0}Z" fill="url(#enArea)"/><path class="ecurve" pathLength="1" d="${d}" stroke="url(#enStroke)"/>`}});
  /* 同一天有多則紀錄：細線標出當天最低到最高，不讓低潮被平均值抵銷 */
  pts.forEach(p=>{if(p.hi>p.lo)g+=`<line x1="${p.x.toFixed(1)}" x2="${p.x.toFixed(1)}" y1="${ys(p.lo)}" y2="${ys(p.hi)}" stroke="rgba(232,233,255,.3)" stroke-width="2" stroke-linecap="round"/>
    <circle cx="${p.x.toFixed(1)}" cy="${ys(p.lo)}" r="2.2" fill="var(--bg2)" stroke="var(${MOODS[p.lo].c})" stroke-width="1.3"/><circle cx="${p.x.toFixed(1)}" cy="${ys(p.hi)}" r="2.2" fill="var(--bg2)" stroke="var(${MOODS[p.hi].c})" stroke-width="1.3"/>`});
  pts.forEach(p=>{const mi=Math.round(p.v),c=`var(${MOODS[mi].c})`,today=p.i===29;
    g+=`<g class="edot" data-id="${esc(p.id)}" tabindex="0" role="button" aria-label="${esc(fmtDay(p.k))}${tl('，平均{m}，{n} 則紀錄',{m:MOODS[mi].n,n:p.n})}${p.hi>p.lo?tl('，從{a}到{b}',{a:MOODS[p.lo].n,b:MOODS[p.hi].n}):''}">
      <circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="11" fill="transparent"/>
      ${today?`<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="8" fill="none" stroke="${c}" stroke-opacity=".5"/>`:''}
      <g class="v" style="filter:drop-shadow(0 0 4px ${c})"><g class="mst mst${Math.round(p.v)}" style="animation-delay:${(-(p.i%9)*.43).toFixed(2)}s"><path d="${sp4(+p.x.toFixed(1),+p.y.toFixed(1),today?7.5:6.2)}" fill="${c}"/><circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="1.5" fill="#fff"/></g></g></g>`});
  if(!pts.length)g+=`<text class="en-empty" x="${(X0+X1)/2}" y="${(Y0+Y1)/2+4}">${tl('寫下紀錄後，這裡會畫出你的心情曲線')}</text>`;
  const svg=$('enChart');svg.innerHTML=g;
  svg.setAttribute('aria-label',tl('最近 30 天心情曲線，共 {n} 天有紀錄',{n:pts.length}));
  svg.querySelectorAll('.edot').forEach(el=>{el.onclick=()=>openDetail(el.dataset.id);el.onkeydown=ev=>{if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();openDetail(el.dataset.id)}}});
  /* 白話總結：依序套用第一個符合的情況（剛開始 → 連續同狀態 → 回升 → 下降 → 本月最棒的一天 → 平穩） */
  const recent=Object.values(by).flat();let msg;
  const tag=i=>`<span class="mt" style="color:var(${MOODS[i].c})">${moon(i)} ${MOODS[i].n}</span>`,lvl=v=>Math.max(0,Math.min(4,Math.round(v)));
  if(!recent.length)msg=`<b class="hl">${tl('還沒有心情紀錄')}</b><span class="s2">${tl('寫下第一則，這裡就會畫出你的心情曲線。')}</span>`;
  else{const cnt=[0,0,0,0,0];recent.forEach(e=>cnt[e.mood??2]++);const tot=recent.length,top=cnt.lastIndexOf(Math.max(...cnt)),pct=Math.round(cnt[top]/tot*100);
    const share=pct>=50&&pct<100?tl('{n} 則紀錄中，一半以上是 {m}。',{n:tot,m:tag(top)}):tl('{n} 則紀錄中，{p}% 是 {m}。',{n:tot,p:pct,m:tag(top)});
    const last=pts[pts.length-1],L=lvl(last.v);
    let streak=1;for(let j=pts.length-1;j>0;j--){if(lvl(pts[j-1].v)===L&&pts[j].i-pts[j-1].i<=2)streak++;else break}
    const avgP=a=>a.reduce((s,p)=>s+p.v,0)/a.length;let wk=pts.filter(p=>p.i>=23),before=pts.filter(p=>p.i<23);
    if(!before.length&&pts.length>=4){const hf=Math.floor(pts.length/2);before=pts.slice(0,hf);wk=pts.slice(hf)} /* 紀錄都在這週：改比較前半與後半 */
    const d=wk.length&&before.length?avgP(wk)-avgP(before):0;
    const peak=pts.reduce((a,b)=>b.v>=a.v?b:a),peakUnique=pts.filter(p=>p.v===peak.v).length===1;
    let head,sub=share;
    if(pts.length<3){head=tl('你剛開始記錄，最近是 {m}',{m:tag(L)});sub=tl('再記錄幾天，就能看出自己的節奏。')}
    else if(streak>=3){head=tl(L>=2?'你已經連續 {n} 天是 {m}，節奏很穩':'你已經連續 {n} 天是 {m}，辛苦了',{n:streak,m:tag(L)});if(L<=1)sub=tl('累的時候，寫幾句就好。')}
    else if(d>=.5){const a=lvl(avgP(before)),b=lvl(avgP(wk));head=a!==b?tl('這週心情回升了，從 {a} 來到 {b}',{a:tag(a),b:tag(b)}):tl('這週心情比之前好一些')}
    else if(d<=-.5){head=tl('這週心情低了一些，最近多是 {m}',{m:tag(lvl(avgP(wk)))});sub=tl('累的時候，寫幾句就好。')}
    else if(peakUnique&&peak.v>=3.5&&peak.i>=23){const pd=parse(peak.k);head=tl('{d}是這個月最棒的一天 {m}',{d:fmtMD(pd),m:moon(4)});sub=tl('點曲線上最高的那個點，回顧那天發生了什麼。')}
    else{const vs=pts.map(p=>p.v),span=Math.max(...vs)-Math.min(...vs);head=span<=1.5?tl('你的心情大多是 {m}，起伏不大，很穩定',{m:tag(top)}):tl('你的心情有起有落，最常是 {m}',{m:tag(top)})}
    msg=`<b class="hl">${head}${/[。！.!]$/.test(head)||head.endsWith('</svg>')?'':tl('。')}</b><span class="s2">${sub}</span>`;
    $('enDist').innerHTML=cnt.map((c,i)=>`<div class="ed-cell${c?'':' zero'}" style="--c:var(${MOODS[i].c})">${moon(i,"big")}<b>${Math.round(c/tot*100)}%</b><small>${MOODS[i].n}</small></div>`).join('')}
  if(!recent.length)$('enDist').innerHTML='';
  $('enInsight').innerHTML=msg;
  /* 資料太少時先不畫曲線，改成「再寫幾天就能看到」 */
  const NEED=5,few=pts.length<NEED;$('enChart').style.display=few?'none':'';$('enEmpty').hidden=!few;
  if(few)$('enEmpty').innerHTML=`<div class="ee-dots">${Array.from({length:NEED},(_,i)=>`<i class="${i<pts.length?'on':''}"></i>`).join('')}</div><p>${tl('再寫 <b>{n}</b> 天，就能看到你最近 30 天的心情曲線',{n:NEED-pts.length})}</p>`;
}
