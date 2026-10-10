/* 每日任務 */
let msOpen=false;
function missionGo(k){const td=ymd(new Date());
  if(k==='write')openEditor();else if(k==='signal')openEditor(null,true);
  else if(k==='enrich'){const t=entries.filter(e=>e.date===td);t.length?openEditor(t[t.length-1].id):openEditor()}
  else{const e=pickReview();if(e)openDetail(e.id)}}
function renderMissions(){const td=ymd(new Date()),today=entries.filter(e=>e.date===td);
  const days=new Set(entries.map(e=>e.date));days.add(td);const b=Math.min(XP.cap,Math.max(0,streakInfo(days,new Date()).n-1)*XP.step);
  const olds=oldEntries(),unrev=olds.some(e=>!reviews.ids[e.id]);
  const ms=[{k:'write',ic:'pen',c:'#FFB45C',t:tl('寫下今天的紀錄'),s:b?tl('第一則 +{a}・連續加成 +{b} 🔥',{a:XP.first,b}):tl('每天第一則 +{a} XP',{a:XP.first}),xp:XP.first+b,done:today.length>0},
    /* 每個任務都必須今天就能完成：還沒有舊紀錄時，改成「豐富今天的紀錄」 */
    /* 每則舊紀錄只有第一次回顧有 XP；全部回顧過時不再顯示 +5 */
    olds.length?{k:'review',ic:'book',c:'#A99EFF',t:tl('回顧一則舊紀錄'),s:tl(unrev?'重讀之前寫下的自己':'舊紀錄都回顧過了，再讀一次也很好'),xp:unrev?XP.review:0,done:reviews.last===td}
      :{k:'enrich',ic:'camera',c:'#A99EFF',t:tl('為今天加上照片、影片或地點'),s:tl(today.length?'讓這則紀錄更完整':'寫紀錄時順手加上'),xp:XP.photo,done:today.some(e=>hasMedia(e)||e.loc)},
    {k:'signal',ic:'signal',c:'#6FE3D6',t:tl('回答今日星語'),s:tl('「{p}」',{p:promptToday()}),xp:XP.prompt,done:today.some(e=>e.prompt)}];
  const n=ms.filter(m=>m.done).length,left=ms.filter(m=>!m.done).reduce((s,m)=>s+m.xp,0);
  $('mCount').textContent=`${n}/3`;$('mSub').textContent=n===3?tl('今天的任務全部完成，辛苦了 ✨'):left?tl('還可以獲得 +{n} XP',{n:left}):tl('今天能做的任務都完成了 ✨');
  $('mBar').querySelectorAll('i').forEach((x,k)=>x.classList.toggle('on',k<n));$('missions').classList.toggle('all-done',n===3);
  $('mList').innerHTML=ms.map(m=>{const act=!m.done&&!m.locked;
    return `<div class="ms${m.done?' done':''}${m.locked?' locked':''}">
      <button type="button" class="ms-main" data-k="${m.k}"${act?'':' disabled'} aria-label="${m.t}${m.done?tl('，已完成'):m.locked?tl('，尚未開放'):m.xp?tl('，可獲得 {n} XP',{n:m.xp}):''}">
        <span class="ms-ic" style="color:${m.done?'#0A0D24':m.c}">${ico(m.done?'check':m.locked?'lock':m.ic)}</span>
        <span class="ms-txt"><em class="ms-lab">${tl('今日任務 {n}/3',{n})}</em><b>${m.t}</b><small>${esc(m.s)}</small></span>
        <span class="ms-xp">${m.done?tl('已完成'):m.xp?`+${m.xp}`:''}</span>${act?'<span class="ms-go" aria-hidden="true">›</span>':''}
      </button>${m.k==='signal'&&!m.done?`<button type="button" class="ms-swap" id="nextPrompt" aria-label="${tl('換一題')}">${ico('swap')}</button>`:''}</div>`}).join('');
  $('mList').querySelectorAll('.ms-main:not(:disabled)').forEach(bt=>bt.onclick=()=>missionGo(bt.dataset.k));
  /* 首頁只有一個任務卡：預設收合，只顯示下一個要做的任務 */
  const nx=ms.find(m=>!m.done),mp=$('missions');mp.classList.toggle('collapsed',!msOpen);mp.classList.toggle('has-next',!!nx);
  $('mList').querySelectorAll('.ms').forEach((el,i)=>el.classList.toggle('peek',!msOpen&&ms[i]!==nx));
  $('msMore').setAttribute('aria-expanded',msOpen);$('msMore').innerHTML=msOpen?`${tl('收起')} <span aria-hidden="true">⌃</span>`:`${tl('查看全部 3 項任務')} <span aria-hidden="true">⌄</span>`;
  $('newBtn').classList.toggle('lit',today.length>0);$('newBtn').setAttribute('aria-label',tl(today.length?'再寫一則紀錄':'點亮今天的星星（今天還沒寫）'));renderTodayCard(today);
  if($('nextPrompt'))$('nextPrompt').onclick=()=>{pIdx++;renderMissions()}}
$('msMore').onclick=()=>{msOpen=!msOpen;renderMissions()};
