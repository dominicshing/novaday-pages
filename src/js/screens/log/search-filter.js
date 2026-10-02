/* 日記頁：搜尋、篩選、分批載入列表 */
const fl={moods:new Set(),photo:false,loc:false,prompt:false,fav:false,tag:null};
let fOpen=null;
const flActive=()=>fl.moods.size||fl.photo||fl.loc||fl.prompt||fl.fav||fl.tag;
const qTerms=()=>q?q.toLowerCase().split(/\s+/).filter(Boolean):[];
/* 關鍵字高亮：先找出命中的字元範圍，再逐字跳脫輸出，避免把 HTML 拆壞 */
function hl(t,terms){t=String(t??'');if(!terms||!terms.length)return esc(t);const lo=t.toLowerCase();if(lo.length!==t.length)return esc(t);
  const mk=new Uint8Array(t.length);terms.forEach(w=>{let i=0;while((i=lo.indexOf(w,i))>=0){mk.fill(1,i,i+w.length);i+=w.length}});
  let o='',on=0;for(let i=0;i<t.length;i++){if(mk[i]!==on){o+=on?'</mark>':'<mark>';on=mk[i]}o+=esc(t[i])}return o+(on?'</mark>':'')}
/* 命中位置在內文後段時，從命中處前幾個字開始顯示摘要 */
function snip(body,terms){body=String(body||'');if(!terms.length)return body;const lo=body.toLowerCase();let at=-1;
  terms.forEach(w=>{const i=lo.indexOf(w);if(i>=0&&(at<0||i<at))at=i});return at>34?'…'+body.slice(at-14):body}
function passFilter(e){const T=qTerms();if(T.length){const hay=[e.title,e.body,e.loc,(e.tags||[]).join(' ')].join(' ').toLowerCase();if(!T.every(w=>hay.includes(w)))return false}
  if(fl.moods.size&&!fl.moods.has(e.mood??2))return false;if(fl.photo&&!hasMedia(e))return false;if(fl.loc&&!e.loc)return false;if(fl.prompt&&!e.prompt)return false;if(fl.fav&&!e.fav)return false;
  if(fl.tag&&!(e.tags||[]).includes(fl.tag))return false;return true}
function filterFade(){const f=$('filters');f.classList.toggle('at-end',f.scrollLeft+f.clientWidth>=f.scrollWidth-4)}
/* 篩選：分成「心情／內容／標籤」三組，點組別打開選項 */
function fClear(){fl.moods.clear();fl.photo=fl.loc=fl.prompt=fl.fav=false;fl.tag=null}
function renderFilters(){const tc={};entries.forEach(e=>(e.tags||[]).forEach(t=>tc[t]=(tc[t]||0)+1));
  const tags=Object.keys(tc).sort((a,b)=>tc[b]-tc[a]);
  const mSel=[...fl.moods].sort(),cSel=[fl.fav&&'已收藏',fl.photo&&'有照片／影片',fl.loc&&'有地點',fl.prompt&&'回答星語'].filter(Boolean);
  const grp=(k,ic,lab,val)=>`<button type="button" class="fgrp${val?' on':''}${fOpen===k?' open':''}" data-g="${k}" aria-expanded="${fOpen===k}">${ic}<span>${lab}</span>${val?`<b class="fg-n" aria-label="${val}">${val}</b>`:''}<svg class="fg-car" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 10l5 5 5-5"/></svg></button>`;
  const mVal=mSel.length||'',cVal=cSel.length||'';
  $('filters').innerHTML=grp('mood',moon(mSel.length===1?mSel[0]:3),'心情',mVal)+grp('content',IC_CAM,'內容',cVal)+(tags.length||fl.tag?grp('tag',IC_TAG,'標籤',fl.tag?1:''):'')
    +(flActive()?'<button type="button" class="fgrp clr" data-g="clear" aria-label="清除全部篩選">✕</button>':'');
  let pn='';
  if(fOpen==='mood')pn=`<div class="fp-h">心情<small>可複選</small></div><div class="fp-opts">${MOODS.map((m,i)=>`<button type="button" class="fchip" data-f="m${i}" aria-pressed="${fl.moods.has(i)}">${moon(i)}${m.n}</button>`).join('')}</div>`;
  else if(fOpen==='content')pn=`<div class="fp-h">內容<small>可複選</small></div><div class="fp-opts">${[['fav',IC_BM,'已收藏'],['photo',IC_CAM,'有照片／影片'],['loc',IC_PIN,'有地點'],['prompt',IC_SIG,'回答了今日星語']].map(([k,ic,n])=>`<button type="button" class="fchip" data-f="${k}" aria-pressed="${fl[k]}">${ic}${n}</button>`).join('')}</div>`;
  else if(fOpen==='tag')pn=`<div class="fp-h">標籤<small>選一個</small>${tags.length?'<button type="button" class="fp-mng" id="fpMng">管理 ›</button>':''}</div><div class="fp-opts">${tags.map(t=>`<button type="button" class="fchip" data-f="t" data-t="${esc(t)}" aria-pressed="${fl.tag===t}">#${esc(t)}<em>${tc[t]}</em></button>`).join('')||'<span class="fp-none">還沒有使用過標籤</span>'}</div>`;
  $('fPanel').innerHTML=pn?pn+`<div class="fp-foot"><button type="button" class="txt-btn" id="fpReset">清除這組</button><button type="button" class="btn primary" id="fpDone">完成</button></div>`:'';$('fPanel').hidden=!pn;
  $('filters').querySelectorAll('.fgrp').forEach(b=>b.onclick=()=>{const g=b.dataset.g;if(g==='clear'){fClear();fOpen=null}else fOpen=fOpen===g?null:g;renderLog()});
  $('fPanel').querySelectorAll('.fchip').forEach(b=>b.onclick=()=>{const f=b.dataset.f;
    if(f[0]==='m'&&f.length===2){const i=+f[1];fl.moods.has(i)?fl.moods.delete(i):fl.moods.add(i)}
    else if(f==='t'){const t=b.dataset.t;fl.tag=fl.tag===t?null:t}else fl[f]=!fl[f];renderLog()});
  if($('fpMng'))$('fpMng').onclick=()=>openTags();
  if($('fpDone')){$('fpDone').onclick=()=>{fOpen=null;renderLog()};$('fpReset').onclick=()=>{if(fOpen==='mood')fl.moods.clear();else if(fOpen==='content')fl.photo=fl.loc=fl.prompt=fl.fav=false;else fl.tag=null;renderLog()}}}
const LG_STEP=40,LG={key:null,lim:LG_STEP,list:[],n:0};
let lgIO=null;
function logChunk(a,b){let h='';for(let i=a;i<b;i++){const e=LG.list[i],mk=e.date.slice(0,7);
    if(mk!==LG.lm){LG.lm=mk;h+=`<div class="month-head"><b>${+mk.slice(0,4)} 年 ${+mk.slice(5)} 月</b><span>${LG.mc[mk]} 則</span></div>`}
    if(e.date!==LG.last){LG.last=e.date;h+=`<div class="day-head"><strong>${esc(fmtDay(e.date))}</strong></div>`}h+=LG.cmp?entryRow(e):entryCard(e)}return h}
function logMore(){const m=$('lgMore');if(!m)return;const a=LG.n,b=Math.min(LG.list.length,a+LG_STEP);if(b<=a)return;
  const tmp=document.createElement('template');tmp.innerHTML=logChunk(a,b);bindCards(tmp.content);m.before(tmp.content);LG.n=b;LG.lim=Math.max(LG.lim,b);
  if(b>=LG.list.length){m.remove();if(lgIO)lgIO.disconnect()}}
function watchLogMore(){if(lgIO)lgIO.disconnect();const m=$('lgMore');if(!m)return;
  if(!('IntersectionObserver' in window)){m.hidden=false;m.onclick=logMore;return}
  lgIO=new IntersectionObserver(es=>{if(es.some(x=>x.isIntersecting))logMore()},{root:$('s-log'),rootMargin:'0px 0px 900px 0px'});lgIO.observe(m)}
function renderLog(){renderFilters();const list=sorted().filter(passFilter);let h='';
  if(q||flActive())h+=`<div class="q-count" role="status">找到 <b>${list.length}</b> 則${q?`符合「${esc(q)}」的紀錄`:''}</div>`;
  if(!list.length)h+=entries.length?`<div class="es">${emptyState('找不到符合的紀錄',flActive()?'換個篩選條件試試看。':'試試其他關鍵字。',flActive()?'<button class="btn" id="clrF">清除篩選</button>':'')}</div>`:`<div class="es">${emptyState('還沒有任何紀錄','寫下第一則，點亮第一顆星。','<button class="btn primary" id="emptyNew">寫第一則紀錄</button>')}</div>`;
  /* 月份分段＋日期標題固定在頂部；精簡模式每則一行 */
  const cmp=!!prof.logCompact,mc={};list.forEach(e=>{const k=e.date.slice(0,7);mc[k]=(mc[k]||0)+1});
  /* R16：分批渲染。先畫前 40 則，捲到底再接著畫，紀錄很多時切換分頁和搜尋都不會卡住 */
  const key=[q,[...fl.moods].join(),fl.photo,fl.loc,fl.prompt,fl.fav,fl.tag,cmp].join('|');if(key!==LG.key){const was=LG.key;LG.key=key;LG.lim=LG_STEP;const sc=$('s-log');if(was!==null&&sc&&sc.scrollTop>0)sc.scrollTop=0}
  LG.list=list;LG.mc=mc;LG.cmp=cmp;LG.last='';LG.lm='';LG.n=Math.min(list.length,LG.lim);
  h+=logChunk(0,LG.n)+(LG.n<list.length?'<div class="lg-more" id="lgMore" aria-hidden="true"><i></i><i></i><i></i></div>':'');
  $('logList').innerHTML=h;$('logList').classList.toggle('compact',cmp);filterFade();
  $('logMode').querySelectorAll('[data-d]').forEach(x=>x.setAttribute('aria-checked',(x.dataset.d==='1')===cmp));
  requestAnimationFrame(()=>{const t=$('logTop');if(t)$('s-log').style.setProperty('--logTop',t.offsetHeight+'px')});bindCards($('logList'));watchLogMore();if($('emptyNew'))$('emptyNew').onclick=()=>openEditor();
  if($('clrF'))$('clrF').onclick=()=>{fClear();renderLog()}}
$('filters').addEventListener('scroll',filterFade,{passive:true});
