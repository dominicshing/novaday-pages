/* 寫過今天之後，首頁頂部改成顯示「今天點亮的星」 */
function renderTodayCard(today){const b=$('todayCard');if(!today.length){b.hidden=true;return}
  const A=ascEntries(today),e=A[A.length-1],m=MOODS[e.mood??2],S=entryStar(e);b.hidden=false;b.style.setProperty('--c',`var(${m.c})`);
  b.innerHTML=`<span class="tc-star" aria-hidden="true">${S?`<svg viewBox="0 0 120 76">${starMini(S,120,76)}</svg>`:moon(e.mood??2)}</span>
    <span class="tc-t"><small>今天點亮了${S?`${CON[S.k].n}第 ${S.j+1} 顆星`:'一顆星'}${today.length>1?`・共 ${today.length} 則`:''}</small><b>${esc(e.title||untitled(e))}</b><span>${moon(e.mood??2)} ${m.n}・${esc((e.body||'').replace(/\s+/g,' ').slice(0,28))}${(e.body||'').length>28?'…':''}</span></span><span class="tc-go" aria-hidden="true">›</span>`;
  b.setAttribute('aria-label',`今天的紀錄：${e.title||untitled(e)}，心情${m.n}，查看`);b.onclick=()=>openDetail(e.id)}
let msOpen=false;
function missionGo(k){const td=ymd(new Date());
  if(k==='write')openEditor();else if(k==='signal')openEditor(null,true);
  else if(k==='enrich'){const t=entries.filter(e=>e.date===td);t.length?openEditor(t[t.length-1].id):openEditor()}
  else{const e=pickReview();if(e)openDetail(e.id)}}
function renderMissions(){const td=ymd(new Date()),today=entries.filter(e=>e.date===td);
  const days=new Set(entries.map(e=>e.date));days.add(td);const b=Math.min(XP.cap,Math.max(0,streakInfo(days,new Date()).n-1)*XP.step);
  const olds=oldEntries();
  const ms=[{k:'write',ic:'pen',c:'#FFB45C',t:'寫下今天的紀錄',s:b?`第一則 +${XP.first}・連續加成 +${b} 🔥`:`每天第一則 +${XP.first} XP`,xp:XP.first+b,done:today.length>0},
    /* 每個任務都必須今天就能完成：還沒有舊紀錄時，改成「豐富今天的紀錄」 */
    olds.length?{k:'review',ic:'book',c:'#A99EFF',t:'回顧一則舊紀錄',s:'重讀之前寫下的自己',xp:XP.review,done:reviews.last===td}
      :{k:'enrich',ic:'camera',c:'#A99EFF',t:'為今天加上照片、影片或地點',s:today.length?'讓這則紀錄更完整':'寫紀錄時順手加上',xp:XP.photo,done:today.some(e=>hasMedia(e)||e.loc)},
    {k:'signal',ic:'signal',c:'#6FE3D6',t:'回答今日星語',s:`「${promptToday()}」`,xp:XP.prompt,done:today.some(e=>e.prompt)}];
  const n=ms.filter(m=>m.done).length,left=ms.filter(m=>!m.done).reduce((s,m)=>s+m.xp,0);
  $('mCount').textContent=`${n}/3`;$('mSub').textContent=n===3?'今天的任務全部完成，辛苦了 ✨':left?`還可以獲得 +${left} XP`:'今天能做的任務都完成了 ✨';
  $('mBar').querySelectorAll('i').forEach((x,k)=>x.classList.toggle('on',k<n));$('missions').classList.toggle('all-done',n===3);
  $('mList').innerHTML=ms.map(m=>{const act=!m.done&&!m.locked;
    return `<div class="ms${m.done?' done':''}${m.locked?' locked':''}">
      <button type="button" class="ms-main" data-k="${m.k}"${act?'':' disabled'} aria-label="${m.t}${m.done?'，已完成':m.locked?'，尚未開放':`，可獲得 ${m.xp} XP`}">
        <span class="ms-ic" style="color:${m.done?'#0A0D24':m.c}">${ico(m.done?'check':m.locked?'lock':m.ic)}</span>
        <span class="ms-txt"><em class="ms-lab">今日任務 ${n}/3</em><b>${m.t}</b><small>${esc(m.s)}</small></span>
        <span class="ms-xp">${m.done?'已完成':`+${m.xp}`}</span>${act?'<span class="ms-go" aria-hidden="true">›</span>':''}
      </button>${m.k==='signal'&&!m.done?`<button type="button" class="ms-swap" id="nextPrompt" aria-label="換一題">${ico('swap')}</button>`:''}</div>`}).join('');
  $('mList').querySelectorAll('.ms-main:not(:disabled)').forEach(bt=>bt.onclick=()=>missionGo(bt.dataset.k));
  /* 首頁只有一個任務卡：預設收合，只顯示下一個要做的任務 */
  const nx=ms.find(m=>!m.done),mp=$('missions');mp.classList.toggle('collapsed',!msOpen);mp.classList.toggle('has-next',!!nx);
  $('mList').querySelectorAll('.ms').forEach((el,i)=>el.classList.toggle('peek',!msOpen&&ms[i]!==nx));
  $('msMore').setAttribute('aria-expanded',msOpen);$('msMore').innerHTML=msOpen?'收起 <span aria-hidden="true">⌃</span>':`查看全部 3 項任務 <span aria-hidden="true">⌄</span>`;
  $('newBtn').classList.toggle('lit',today.length>0);$('newBtn').setAttribute('aria-label',today.length?'再寫一則紀錄':'點亮今天的星星（今天還沒寫）');renderTodayCard(today);
  if($('nextPrompt'))$('nextPrompt').onclick=()=>{pIdx++;renderMissions()}}
const isSample=e=>!!e.sample||(/^s[123]$/.test(e.id)&&!e.edited);
const SMP='<span class="smp">範例</span>';
const entryPhotos=e=>e?[e.photo,...(Array.isArray(e.photoMore)?e.photoMore:[])].filter(Boolean):[];
const photoCount=e=>entryPhotos(e).length;
function entryCard(e){const m=MOODS[e.mood??2],T=qTerms();
  const tagHit=T.length?(e.tags||[]).filter(t=>T.some(w=>t.toLowerCase().includes(w))):[];
  return `<button class="entry" data-id="${esc(e.id)}" style="--mood:var(${m.c})">${e.photo?`<span class="thumb-w"><img class="thumb" src="${e.photo}" alt="">${photoCount(e)>1?`<b class="thumb-n" aria-label="共 ${photoCount(e)} 張照片">${photoCount(e)}</b>`:''}</span>`:hasVideo(e)?`<span class="thumb-w" aria-label="影片 ${fmtDur(e.video.dur)}">${e.video.poster?`<img class="thumb" src="${e.video.poster}" alt="">`:'<span class="thumb thumb-nv"></span>'}<i class="thumb-play" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M9 7l8 5-8 5z"/></svg></i><b class="thumb-n">${fmtDur(e.video.dur)}</b></span>`:''}
    <h3>${e.fav?'<i class="fav-m" aria-label="已收藏">'+IC_BM+'</i>':''}${isSample(e)?SMP:''}${e.title?hl(e.title,T):untitled(e)}</h3><p>${hl(snip(e.body,T),T)}</p>
    <div class="meta"><span>${esc(e.time||'')}</span><span class="chip" style="border-color:var(${m.c})">${moon(e.mood??2)} ${m.n}</span>${e.prompt?`<span class="mi" aria-label="回答了今日星語">${IC_SIG}</span>`:''}${e.loc?`<span class="mi">${IC_PIN}${hl(e.loc,T)}</span>`:''}${tagHit.map(t=>`<span class="mi hit-tag">${IC_TAG}${hl(t,T)}</span>`).join('')}</div></button>`}
const ES_ART='<svg class="es-art" viewBox="0 0 92 56" aria-hidden="true"><line x1="10" y1="40" x2="32" y2="18"/><line x1="32" y1="18" x2="56" y2="30"/><line x1="56" y1="30" x2="82" y2="12"/><circle cx="10" cy="40" r="2"/><circle cx="32" cy="18" r="2.4"/><circle cx="56" cy="30" r="2"/><circle class="hi" cx="82" cy="12" r="3.2"/></svg>';
const emptyState=(t,sub,btn)=>`${ES_ART}<b>${t}</b>${sub?`<p>${sub}</p>`:''}${btn||''}`;
const IC_PIN='<svg class="mi-ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-6.5-6.2-6.5-11a6.5 6.5 0 0 1 13 0c0 4.8-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/></svg>';
const IC_CAM='<svg class="mi-ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8.5h3.2l1.8-2.5h6l1.8 2.5H20V19H4z"/><circle cx="12" cy="13.2" r="3.4"/></svg>';
const IC_SIG='<svg class="mi-ic" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="1.8"/><path d="M8.5 15.5a5 5 0 0 1 0-7M15.5 8.5a5 5 0 0 1 0 7M5.6 18.4a9 9 0 0 1 0-12.8M18.4 5.6a9 9 0 0 1 0 12.8"/></svg>';
const IC_BM='<svg class="mi-ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4h10a1 1 0 0 1 1 1v15l-6-4-6 4V5a1 1 0 0 1 1-1z"/></svg>';
const IC_TAG='<svg class="mi-ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 12.4V4h8.4l8.6 8.6-8.4 8.4z"/><circle cx="8" cy="8.4" r="1.4"/></svg>';
function entryRow(e){const m=MOODS[e.mood??2];
  return `<button class="entry row" data-id="${esc(e.id)}" style="--mood:var(${m.c})">${moon(e.mood??2)}${e.fav?'<i class="fav-m" aria-label="已收藏">'+IC_BM+'</i>':''}<span class="er-t">${hl(e.title||(e.body||'').slice(0,20)||untitled(e),qTerms())}</span>${e.photo?`<span class="er-i mi" aria-label="有照片">${IC_CAM}</span>`:''}<span class="er-time">${esc(e.time||'')}</span></button>`}
function bindCards(root){root.querySelectorAll('.entry').forEach(b=>b.onclick=()=>openDetail(b.dataset.id))}
const fl={moods:new Set(),photo:false,loc:false,prompt:false,fav:false,tag:null};let fOpen=null;
const flActive=()=>fl.moods.size||fl.photo||fl.loc||fl.prompt||fl.fav||fl.tag;
const qTerms=()=>q?q.toLowerCase().split(/\s+/).filter(Boolean):[];
