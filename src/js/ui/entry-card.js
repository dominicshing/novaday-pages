/* 日記卡片與空狀態 */
/* 每則紀錄點亮的星：一次算好全部（依點亮順序分配到星座），紀錄有變動才重算 */
let ES_MAP=null,ES_SIG='';
function entryStarMap(){const A=ascEntries(),sig=A.length+'|'+A.map(e=>e.id+e.date+(e.time||'')).join(',');if(sig===ES_SIG&&ES_MAP)return ES_MAP;
  consState(entries);const M=new Map();let i=0;for(const k of prof.conOrder||[]){const n=CON[k].s.length,es=A.slice(i,i+n);es.forEach((e,j)=>M.set(e.id,{k,j,n,es}));i+=n;if(i>=A.length)break}
  ES_SIG=sig;return ES_MAP=M}
/* 卡片背景的星座虛影（D 版）：這則紀錄所屬星座的星塵剪影＋連線，這顆星用當天心情色發光；放右下角往外延伸、邊緣淡出。
   剪影與連線每個星座只畫一次，存成圖片重複使用（列表很長時才不會卡）；只有「這顆星」另外疊上去 */
const SKY_IMG=new Map(),SKY_W=230,SKY_H=178;
function skyImg(k){if(!SKY_IMG.has(k)){const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SKY_W} ${SKY_H}">${conSVG(k,SKY_W,SKY_H,18,CON[k].s.length,null,{sc:.6,lc:'#B9AEFF',figP:1})}</svg>`;
  SKY_IMG.set(k,svgURL(svg))}return SKY_IMG.get(k)}
function cardSky(e,col){const S=entryStarMap().get(e.id);if(!S)return '';const[x,y]=conProj(S.k,SKY_W,SKY_H,18)[conOrd(S.k)[S.j]];
  return `<span class="cbg" aria-hidden="true"><img src="${skyImg(S.k)}" alt=""><svg viewBox="0 0 ${SKY_W} ${SKY_H}"><g class="cbg-st"><path d="${spk(x,y,5.5)}" fill="${col}" style="filter:drop-shadow(0 0 3px ${col})"/><path d="${spk(x,y,2)}" fill="#fff" opacity=".8"/></g></svg></span>`}
function entryCard(e){const m=MOODS[e.mood??2],T=qTerms();
  /* 搜尋「#標籤」也算命中標籤（標籤在 App 裡都以 # 顯示） */
  const tagHit=T.length?(e.tags||[]).filter(t=>T.some(w=>{w=w.replace(/^#/,'');return w&&t.toLowerCase().includes(w)})):[];
  return `<button class="entry${e.title?'':' nt'}${e.photo||hasVideo(e)?' th':''}${(e.body||'').trim()?'':' nb'}" data-id="${esc(e.id)}" style="--mood:var(${m.c})">${cardSky(e,`var(${m.c})`)}${e.photo?`<span class="thumb-w"><img class="thumb" src="${e.photo}" alt="">${photoCount(e)>1?`<b class="thumb-n" aria-label="${tl('共 {n} 張照片',{n:photoCount(e)})}">${photoCount(e)}</b>`:''}</span>`:hasVideo(e)?`<span class="thumb-w" aria-label="${tl('影片 {d}',{d:fmtDur(e.video.dur)})}">${e.video.poster?`<img class="thumb" src="${e.video.poster}" alt="">`:'<span class="thumb thumb-nv"></span>'}<i class="thumb-play" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M9 7l8 5-8 5z"/></svg></i><b class="thumb-n">${fmtDur(e.video.dur)}</b></span>`:''}
    ${e.title||e.fav||isSample(e)?`<h3>${e.fav?`<i class="fav-m" aria-label="${tl('已收藏')}">`+IC_BM+'</i>':''}${isSample(e)?SMP:''}${e.title?hl(e.title,T):''}</h3>`:''}${(e.body||'').trim()?`<p>${hl(snip(e.body,T),T)}</p>`:''}
    <div class="meta"><span class="chip" style="border-color:var(${m.c})">${moon(e.mood??2)} ${m.n}</span>${e.prompt?`<span class="mi" aria-label="${tl('回答了今日星語')}">${IC_SIG}</span>`:''}${e.loc?`<span class="mi">${IC_PIN}${hl(e.loc,T)}</span>`:''}${tagHit.map(t=>`<span class="mi hit-tag">${IC_TAG}${hl(t,T)}</span>`).join('')}${e.time?`<span class="tm">${IC_CLK}${esc(fmtTime(e.time))}</span>`:''}</div></button>`}
const ES_ART='<svg class="es-art" viewBox="0 0 92 56" aria-hidden="true"><line x1="10" y1="40" x2="32" y2="18"/><line x1="32" y1="18" x2="56" y2="30"/><line x1="56" y1="30" x2="82" y2="12"/><circle cx="10" cy="40" r="2"/><circle cx="32" cy="18" r="2.4"/><circle cx="56" cy="30" r="2"/><circle class="hi" cx="82" cy="12" r="3.2"/></svg>';
const emptyState=(t,sub,btn)=>`${ES_ART}<b>${t}</b>${sub?`<p>${sub}</p>`:''}${btn||''}`;
const IC_PIN='<svg class="mi-ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-6.5-6.2-6.5-11a6.5 6.5 0 0 1 13 0c0 4.8-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/></svg>';
const IC_CAM='<svg class="mi-ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8.5h3.2l1.8-2.5h6l1.8 2.5H20V19H4z"/><circle cx="12" cy="13.2" r="3.4"/></svg>';
const IC_VID='<svg class="mi-ic" viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="6.5" width="12" height="11" rx="2.2"/><path d="M15.5 10.6l5-3v8.8l-5-3z"/></svg>';
const IC_SIG='<svg class="mi-ic" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="1.8"/><path d="M8.5 15.5a5 5 0 0 1 0-7M15.5 8.5a5 5 0 0 1 0 7M5.6 18.4a9 9 0 0 1 0-12.8M18.4 5.6a9 9 0 0 1 0 12.8"/></svg>';
const IC_BM='<svg class="mi-ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4h10a1 1 0 0 1 1 1v15l-6-4-6 4V5a1 1 0 0 1 1-1z"/></svg>';
const IC_CLK='<svg class="mi-ic" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg>';
const IC_TAG='<svg class="mi-ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 12.4V4h8.4l8.6 8.6-8.4 8.4z"/><circle cx="8" cy="8.4" r="1.4"/></svg>';
function entryRow(e){const m=MOODS[e.mood??2];
  return `<button class="entry row" data-id="${esc(e.id)}" style="--mood:var(${m.c})">${moon(e.mood??2)}${e.fav?`<i class="fav-m" aria-label="${tl('已收藏')}">`+IC_BM+'</i>':''}<span class="er-t">${hl(e.title||(e.body||'').slice(0,20),qTerms())}</span>${e.photo?`<span class="er-i mi" aria-label="${tl('有照片')}">${IC_CAM}</span>`:''}${hasVideo(e)?`<span class="er-i mi" aria-label="${tl('有影片')}">${IC_VID}</span>`:''}<span class="er-time">${esc(fmtTime(e.time))}</span></button>`}
function bindCards(root){root.querySelectorAll('.entry').forEach(b=>b.onclick=()=>openDetail(b.dataset.id))}
