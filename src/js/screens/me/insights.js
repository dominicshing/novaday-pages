/* 「我的」頁：心情洞察 */
function moodInsights(){const L=entries.filter(e=>!isSample(e)),N=L.length;if(N<8)return{need:8-N};
  const avg=a=>a.reduce((t,e)=>t+(e.mood??2),0)/a.length,base=avg(L),out=[];
  const tc={};L.forEach(e=>(e.tags||[]).forEach(t=>(tc[t]=tc[t]||[]).push(e)));
  Object.entries(tc).filter(([,a])=>a.length>=3).map(([t,a])=>({t,d:avg(a)-base,n:a.length})).sort((a,b)=>Math.abs(b.d)-Math.abs(a.d)).slice(0,2).forEach(x=>{
    if(Math.abs(x.d)>=.4)out.push({ic:'tag',good:x.d>0,t:tl('寫到 #{t} 的日子',{t:esc(x.t)}),s:tl(x.d>0?'心情平均比平常好 {d} 級（{n} 則）':'心情平均比平常低 {d} 級（{n} 則）',{d:Math.abs(x.d).toFixed(1),n:x.n})})});
  const wd=[0,1,2,3,4,5,6].map(d=>L.filter(e=>parse(e.date).getDay()===d)).map((a,d)=>({d,n:a.length,v:a.length?avg(a):0})).filter(x=>x.n>=2);
  if(wd.length>=3){const b=wd.slice().sort((a,c)=>c.v-a.v)[0];if(b.v-base>=.3)out.push({ic:'cal',good:1,t:tl('{w}的心情最好',{w:EN_UI?WDL_EN[b.d]+'s':wdLong(b.d)}),s:tl('平均 {m}，比其他日子高 {d} 級',{m:MOODS[Math.round(b.v)].n,d:(b.v-base).toFixed(1)})})}
  const lp=L.filter(e=>e.loc||hasMedia(e)),ln=L.filter(e=>!e.loc&&!hasMedia(e));if(lp.length>=3&&ln.length>=3){const d=avg(lp)-avg(ln);if(Math.abs(d)>=.4)out.push({ic:'pin',good:d>0,t:tl('有照片或地點的日子'),s:tl(d>0?'心情比較好，相差 {d} 級':'心情比較低，相差 {d} 級',{d:Math.abs(d).toFixed(1)})})}
  const late=L.filter(e=>e.time&&+e.time.slice(0,2)>=23||e.time&&+e.time.slice(0,2)<4),early=L.filter(e=>e.time&&+e.time.slice(0,2)>=5&&+e.time.slice(0,2)<23);
  if(late.length>=3&&early.length>=3){const d=avg(late)-avg(early);if(d<=-.4)out.push({ic:'moon',good:0,t:tl('深夜寫的日記'),s:tl('心情通常比較低，早點休息也許會好一些')})}
  return{list:out.slice(0,3)}}
function renderInsights(){const b=$('insights');if(!b)return;const r=moodInsights();
  const IC={tag:MIC.pen,cal:'<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/>',pin:'<path d="M12 21s-6.5-6.2-6.5-11a6.5 6.5 0 0 1 13 0c0 4.8-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/>',moon:'<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>'};
  if(r.need){b.innerHTML=`<div class="ins-empty">${tl('再寫 <b>{n}</b> 則，就能看到哪些事情讓你心情變好',{n:r.need})}</div>`;return}
  if(!r.list.length){b.innerHTML=`<div class="ins-empty">${tl('目前心情很平均，還沒找到明顯的規律')}</div>`;return}
  b.innerHTML=r.list.map(x=>`<div class="ins${x.good?' up':' dn'}"><span class="ins-ic"><svg viewBox="0 0 24 24" aria-hidden="true">${IC[x.ic]}</svg></span><span><b>${x.t}</b><small>${x.s}</small></span><i class="ins-ar" aria-hidden="true">${x.good?'↑':'↓'}</i></div>`).join('')}
