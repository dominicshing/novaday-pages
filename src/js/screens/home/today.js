/* 首頁今日卡片 */
/* 寫過今天之後，首頁頂部改成顯示「今天點亮的星」 */
function renderTodayCard(today){const b=$('todayCard');if(!today.length){b.hidden=true;return}
  const A=ascEntries(today),e=A[A.length-1],m=MOODS[e.mood??2],S=entryStar(e);b.hidden=false;b.style.setProperty('--c',`var(${m.c})`);
  b.innerHTML=`<span class="tc-star" aria-hidden="true">${S?`<svg viewBox="0 0 120 76">${starMini(S,120,76)}</svg>`:moon(e.mood??2)}</span>
    <span class="tc-t"><small>${S?tl('今天點亮了{c}第 {n} 顆星',{c:CON[S.k].n,n:S.j+1}):tl('今天點亮了一顆星')}${today.length>1?SEP+tl('共 {n} 則',{n:today.length}):''}</small><b>${esc(e.title||untitled(e))}</b><span>${moon(e.mood??2)} ${m.n}${SEP}${esc((e.body||'').replace(/\s+/g,' ').slice(0,28))}${(e.body||'').length>28?'…':''}</span></span><span class="tc-go" aria-hidden="true">›</span>`;
  b.setAttribute('aria-label',tl('今天的紀錄：{t}，心情{m}，查看',{t:e.title||untitled(e),m:m.n}));b.onclick=()=>openDetail(e.id)}
