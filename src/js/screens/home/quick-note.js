/* 首頁一句話快記 */
/* 首頁一句話快記：選心情、打一句話，直接點亮 */
let qnMood=null;
function renderQuick(){const b=$('quickNote');if(!b)return;const td=ymd(new Date()),wrote=entries.some(e=>e.date===td&&!isSample(e));b.hidden=wrote;if(wrote)return;
  $('qnMoods').innerHTML=MOODS.map((m,i)=>`<button type="button" data-i="${i}" aria-pressed="${qnMood===i}" aria-label="${m.n}" title="${m.n}">${moon(i)}</button>`).join('');
  $('qnMoods').querySelectorAll('[data-i]').forEach(x=>x.onclick=()=>{qnMood=+x.dataset.i;renderQuick();$('qnMoodT').textContent=MOODS[qnMood].n;qnSync()});
  $('qnMoodT').textContent=qnMood==null?tl('今天過得怎麼樣？'):MOODS[qnMood].n;qnSync()}
function qnSync(){$('qnGo').disabled=!$('qnText').value.trim()}
$('qnText').addEventListener('input',qnSync);
/* 送出時立刻取出文字並清空欄位，連點兩下也只會送出一次 */
let qnBusy=false;
$('quickNote').addEventListener('submit',e=>{e.preventDefault();const t=$('qnText').value.trim(),m=qnMood;if(!t||qnBusy)return;
  qnBusy=true;$('qnText').value='';qnMood=null;qnSync();
  /* 有未完成的草稿時先收起來，避免快記帶上草稿的標題、照片，或草稿內容被覆蓋 */
  stashDraft();
  openEditor();requestAnimationFrame(()=>{$('fBody').value=t;curMood=m??2;renderMoods();setTimeout(()=>{$('form').requestSubmit();qnBusy=false},reduce?0:120)})});
/* 「想多寫一點」：打開完整編輯器；有草稿時接在草稿內文後面，不覆蓋 */
$('qnMore').onclick=()=>{const t=$('qnText').value.trim(),m=qnMood;openEditor();requestAnimationFrame(()=>{const b=$('fBody').value;if(t)$('fBody').value=b.trim()?b.replace(/\s*$/,'')+'\n'+t:t;if(m!=null){curMood=m;renderMoods()}$('qnText').value='';qnMood=null;onEdit&&onEdit()})};
