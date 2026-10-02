/* 首頁今日卡片 */
/* 寫過今天之後，首頁頂部改成顯示「今天點亮的星」 */
function renderTodayCard(today){const b=$('todayCard');if(!today.length){b.hidden=true;return}
  const A=ascEntries(today),e=A[A.length-1],m=MOODS[e.mood??2],S=entryStar(e);b.hidden=false;b.style.setProperty('--c',`var(${m.c})`);
  b.innerHTML=`<span class="tc-star" aria-hidden="true">${S?`<svg viewBox="0 0 120 76">${starMini(S,120,76)}</svg>`:moon(e.mood??2)}</span>
    <span class="tc-t"><small>今天點亮了${S?`${CON[S.k].n}第 ${S.j+1} 顆星`:'一顆星'}${today.length>1?`・共 ${today.length} 則`:''}</small><b>${esc(e.title||untitled(e))}</b><span>${moon(e.mood??2)} ${m.n}・${esc((e.body||'').replace(/\s+/g,' ').slice(0,28))}${(e.body||'').length>28?'…':''}</span></span><span class="tc-go" aria-hidden="true">›</span>`;
  b.setAttribute('aria-label',`今天的紀錄：${e.title||untitled(e)}，心情${m.n}，查看`);b.onclick=()=>openDetail(e.id)}
