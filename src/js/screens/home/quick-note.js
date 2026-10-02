/* 首頁一句話快記 */
/* 首頁一句話快記：選心情、打一句話，直接點亮 */
let qnMood=null;
function renderQuick(){const b=$('quickNote');if(!b)return;const td=ymd(new Date()),wrote=entries.some(e=>e.date===td&&!isSample(e));b.hidden=wrote;if(wrote)return;
  $('qnMoods').innerHTML=MOODS.map((m,i)=>`<button type="button" data-i="${i}" aria-pressed="${qnMood===i}" aria-label="${m.n}" title="${m.n}">${moon(i)}</button>`).join('');
  $('qnMoods').querySelectorAll('[data-i]').forEach(x=>x.onclick=()=>{qnMood=+x.dataset.i;renderQuick();$('qnMoodT').textContent=MOODS[qnMood].n;qnSync()});
  $('qnMoodT').textContent=qnMood==null?'今天過得怎麼樣？':MOODS[qnMood].n;qnSync()}
function qnSync(){$('qnGo').disabled=!$('qnText').value.trim()}
$('qnText').addEventListener('input',qnSync);
$('quickNote').addEventListener('submit',e=>{e.preventDefault();const t=$('qnText').value.trim();if(!t)return;
  openEditor();requestAnimationFrame(()=>{$('fBody').value=t;curMood=qnMood??2;renderMoods();$('qnText').value='';qnMood=null;setTimeout(()=>$('form').requestSubmit(),reduce?0:120)})});
$('qnMore').onclick=()=>{const t=$('qnText').value.trim(),m=qnMood;openEditor();requestAnimationFrame(()=>{if(t)$('fBody').value=t;if(m!=null){curMood=m;renderMoods()}$('qnText').value='';qnMood=null;onEdit&&onEdit()})};
