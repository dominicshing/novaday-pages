/* 慶祝畫面：徽章解鎖、星座完成；新徽章紅點 */
/* 新徽章解鎖：浮出徽章卡；頭像標示有新徽章，直到在「我的」頁看過 */
function showAch(a){return new Promise(res=>{const o=$('achPop');$('apIc').innerHTML=crystal(a.id,true);$('apN').textContent=a.n;$('apD').textContent=a.d;
  prof.achNew=[...new Set([...(prof.achNew||[]),a.id])];saveProf();renderAchDot();o.classList.add('show');
  const done=()=>{o.classList.remove('show');clearTimeout(t);setTimeout(res,reduce?0:250)};const t=setTimeout(done,2800);o.onclick=done})}
function renderAchDot(){const n=(prof.achNew||[]).length;['openMe','cbAv'].forEach(id=>{const b=$(id);if(b)b.classList.toggle('has-new',!!n)});
  const tb=document.querySelector('.tb[data-s=me]');if(tb)tb.classList.toggle('has-new',!!n)}
function showConDone(k){return new Promise(res=>{buzz([18,40,18]);const c=CON[k];$('cdName').textContent=c.n;$('cdLa').textContent=c.la;$('cdFact').textContent=c.f;
  $('cdFig').innerHTML=conSVG(k,300,220,30,c.s.length,conEntries(k),{anim:!reduce,d0:.3,sc:1.2});
  const o=$('conDone');o.classList.add('show');if(!reduce){const r=$('app').getBoundingClientRect();setTimeout(()=>burst(r.left+r.width/2,r.top+r.height/2-60),600)}
  $('cdOk').focus();$('cdOk').onclick=()=>{o.classList.remove('show');res()};$('cdShare').onclick=()=>openShare(k)})}
