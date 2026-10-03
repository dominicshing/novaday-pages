/* 紀錄詳情：內容、回顧 XP、左右切換 */
function detailNeighbors(){const A=ascEntries(),i=A.findIndex(x=>x.id===detailId);return{prev:A[i-1],next:A[i+1]}}
async function detailGo(dir){const {prev,next}=detailNeighbors(),t=dir>0?next:prev;const dv=$('dBody').querySelector('.dv');
  if(!t){if(dv){dv.classList.add('slide');dv.style.transform='';setTimeout(()=>dv.classList.remove('slide'),220)}return false}
  if(dv&&!reduce){dv.classList.add('slide');dv.style.transform=`translateX(${dir>0?-40:40}%)`;dv.style.opacity='0';await sleep(160)}
  openDetail(t.id);$('dBody').scrollTop=0;const nv=$('dBody').querySelector('.dv');
  if(nv&&!reduce){nv.style.transform=`translateX(${dir>0?30:-30}%)`;nv.style.opacity='0';void nv.offsetWidth;nv.classList.add('slide');nv.style.transform='';nv.style.opacity='';setTimeout(()=>nv.classList.remove('slide'),220)}
  buzz(6);return true}
{const body=$('dBody');let g=null;
  body.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse')return; /* 滑鼠用方向鍵切換，保留選取文字的功能 */if(e.target.closest('input,textarea,.dv-gal'))return;g={x:e.clientX,y:e.clientY,dx:0,on:false,id:e.pointerId}});
  body.addEventListener('pointermove',e=>{if(!g||e.pointerId!==g.id)return;const dx=e.clientX-g.x,dy=e.clientY-g.y;
    if(!g.on){if(Math.abs(dx)<12)return;if(Math.abs(dy)>Math.abs(dx)){g=null;return}g.on=true;body.classList.add('swiping');try{body.setPointerCapture(e.pointerId)}catch(_){}}
    const {prev,next}=detailNeighbors();const has=dx<0?next:prev;g.dx=has?dx:dx*.25;const dv=body.querySelector('.dv');if(dv)dv.style.transform=`translateX(${g.dx}px)`});
  const end=()=>{if(!g)return;const {dx,on}=g;g=null;body.classList.remove('swiping');if(!on)return;body._swEnd=Date.now();
    if(Math.abs(dx)>70)detailGo(dx<0?1:-1);else{const dv=body.querySelector('.dv');if(dv){dv.classList.add('slide');dv.style.transform='';setTimeout(()=>dv.classList.remove('slide'),220)}}};
  body.addEventListener('pointerup',end);body.addEventListener('pointercancel',end);
  body.addEventListener('click',e=>{if(Date.now()-(body._swEnd||0)<300){e.stopPropagation();e.preventDefault()}},true)}
/* Detail */
async function grantReview(e){if(!oldEntries().some(x=>x.id===e.id))return;const td=ymd(new Date()),first=!reviews.ids[e.id];
  if(!first&&reviews.last===td)return;
  const xpB=totalXP(entries),lvB=levelInfo(xpB).lv,achB=unlocked(entries);reviews.last=td;if(first)reviews.ids[e.id]=td;saveReviews();render();
  toast(first?`📖 回顧舊紀錄 +${XP.review} XP`:'📖 今日回顧任務完成');
  const lvA=levelInfo(totalXP(entries)).lv;if(lvA>lvB){await sleep(900);await showLevel(lvA)}
  for(const a of ACH.filter(a=>a.t(entries)&&!achB.includes(a.id)).slice(0,2)){await sleep(reduce?0:700);await showAch(a)}}
let detailId=null,dvUrl=null;
/* 這則紀錄點亮的是哪個星座的第幾顆星 */
function entryStar(e){return entryStarMap().get(e.id)||null}
function starMini(S,W,H){const c=CON[S.k],P=conProj(S.k,W,H,10),ord=conOrd(S.k),lit=new Set(ord.slice(0,S.es.length)),me=ord[S.j],col={};
  ord.slice(0,S.es.length).forEach((si,j)=>col[si]=`var(${MOODS[S.es[j].mood??2].c})`);let g=conFig(S.k,W,H,P,S.es.length/S.n);
  c.l.forEach(pl=>{for(let j=0;j<pl.length-1;j++){const a=pl[j],b=pl[j+1],A=P[a],B=P[b];g+=`<line class="${lit.has(a)&&lit.has(b)?'es-on':'es-l'}" x1="${A[0]}" y1="${A[1]}" x2="${B[0]}" y2="${B[1]}"/>`}});
  c.s.forEach((_,si)=>{const[x,y]=P[si];if(si===me)g+=`<circle class="es-rg" cx="${x}" cy="${y}" r="7"/><path class="es-tg" d="${spk(x,y,6.2)}"/><path d="${spk(x,y,2.5)}" fill="#fff"/>`;
    else if(lit.has(si))g+=`<path d="${spk(x,y,3.8)}" fill="${col[si]}"/>`;else g+=`<path d="${spk(x,y,2.5)}" fill="rgba(232,233,255,.5)"/>`});
  return g}
function openDetail(id){const e=entries.find(x=>x.id===id);if(!e)return;detailId=id;const m=MOODS[e.mood??2];setTimeout(()=>grantReview(e),450);
  const S=entryStar(e),A=ascEntries(),i=A.findIndex(x=>x.id===id),prev=A[i-1],next=A[i+1];
  const diff=Math.round((parse(ymd(new Date()))-parse(e.date))/864e5),rel=diff===0?'今天':diff===1?'昨天':diff>1?`${diff} 天前`:'';
  const wc=[...(e.body||'').replace(/\s/g,'')].length;
  $('dBody').innerHTML=`<div class="dv${prev||next?'':' solo'}" style="--c:var(${m.c})">
    ${S?`<button type="button" class="dv-star" id="dStar" aria-label="這則紀錄點亮了${CON[S.k].n}的第 ${S.j+1} 顆星，查看星座"><svg viewBox="0 0 120 76" aria-hidden="true">${starMini(S,120,76)}</svg>
      <span class="dv-st"><small>這則紀錄點亮了</small><b>${CON[S.k].n}・第 ${S.j+1} / ${S.n} 顆星</b><span>${S.es.length>=S.n?'✓ 星座已完成':`已點亮 ${S.es.length} / ${S.n}`}・查看星座 ›</span></span></button>`:''}
    ${hasVideo(e)?`<div class="dv-vid"><video id="dVid" playsinline controls preload="metadata"${e.video.poster?` poster="${e.video.poster}"`:''}></video><p class="dv-vmiss" id="dVmiss" hidden>這部影片的檔案不在這台裝置上</p></div>`:''}
    ${(()=>{const P=entryPhotos(e);if(!P.length)return '';if(P.length===1)return `<button type="button" class="dv-ph1" data-pi="0" aria-label="放大檢視照片"><img class="detail-img" src="${P[0]}" alt="紀錄照片"></button>`;
      return `<div class="dv-gal-w"><div class="dv-gal" id="dGal">${P.map((u,i)=>`<button type="button" data-pi="${i}" aria-label="放大檢視第 ${i+1} 張照片"><img src="${u}" alt="紀錄照片 ${i+1}"></button>`).join('')}</div><span class="dv-gn" id="dGn">1 / ${P.length}</span><div class="dv-dots" aria-hidden="true">${P.map((_,i)=>`<i${i?'':' class="on"'}></i>`).join('')}</div></div>`})()}
    ${e.title?`<h3>${esc(e.title)}</h3>`:''}
    <div class="dv-when"><span>${esc(fmtDayY(e.date))}${e.time?` ${esc(fmtTime(e.time))}`:''}</span>${rel?`<span class="dv-rel">${rel}</span>`:''}</div>
    <div class="dv-mood"><span class="dv-mc">${moon(e.mood??2)} ${m.n}</span>${e.loc?`<span class="dv-i">${IC_PIN}${esc(e.loc)}</span>`:''}<button type="button" class="dv-fav" id="dFav" aria-pressed="${!!e.fav}">${IC_BM}<span>${e.fav?'已收藏':'收藏'}</span></button></div>
    ${e.prompt?`<div class="dv-q"><small>💫 今日星語</small>${esc(e.prompt)}</div>`:''}
    <div class="body">${esc(e.body)}</div>
    ${(e.tags||[]).length?`<div class="dv-tags">${e.tags.map(t=>`<button type="button" class="chip tag" data-tag="${esc(t)}">#${esc(t)}</button>`).join('')}</div>`:''}
    <div class="dv-foot"><span>${wc} 字</span>${e.photo?`<span>${photoCount(e)>1?photoCount(e)+' 張照片':'含照片'}</span>`:''}${hasVideo(e)?`<span>影片 ${fmtDur(e.video.dur)}</span>`:''}</div>
    ${prev||next?`<div class="dv-nav">${prev?`<button type="button" data-id="${esc(prev.id)}" class="p"><small>‹ 較早</small><b>${esc(prev.title||fmtDay(prev.date))}</b></button>`:'<span></span>'}${next?`<button type="button" data-id="${esc(next.id)}" class="n"><small>較新 ›</small><b>${esc(next.title||fmtDay(next.date))}</b></button>`:'<span></span>'}</div>`:''}
    <button type="button" class="dv-share" id="dShare"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 14.5v-11M7.5 8L12 3.5 16.5 8M5 12.5v6A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5v-6"/></svg>分享成圖卡</button>
    <button type="button" class="dv-del" id="dDel">刪除這則紀錄</button></div>`;
  $('dShare').onclick=()=>openEntryShare(e.id);
  if(dvUrl){URL.revokeObjectURL(dvUrl);dvUrl=null}
  if(hasVideo(e)){const vid=e.video.id;mediaGet(vid).then(bl=>{const el=$('dVid');if(!el||detailId!==e.id)return;if(!bl){$('dVmiss').hidden=false;el.removeAttribute('controls');return}dvUrl=URL.createObjectURL(bl);el.src=dvUrl})}
  $('dBody').querySelectorAll('[data-pi]').forEach(b=>b.onclick=()=>openPhotoViewer(entryPhotos(e),+b.dataset.pi));
  if($('dGal')){const gl=$('dGal'),n=photoCount(e);gl.addEventListener('scroll',()=>{const i=Math.round(gl.scrollLeft/gl.clientWidth);$('dGn').textContent=`${i+1} / ${n}`;
    gl.parentElement.querySelectorAll('.dv-dots i').forEach((d,j)=>d.classList.toggle('on',j===i))},{passive:true})}
  $('dFav').onclick=()=>{const x=entries.find(y=>y.id===e.id);if(!x)return;if(x.fav)delete x.fav;else x.fav=1;save();
    const b=$('dFav');b.setAttribute('aria-pressed',String(!!x.fav));b.querySelector('span').textContent=x.fav?'已收藏':'收藏';if(x.fav)buzz(8);if(x.fav&&!reduce){b.classList.remove('pop');void b.offsetWidth;b.classList.add('pop')}
    renderLog();renderCalDay&&logView==='cal'&&renderCalDay();toast(x.fav?'已加入收藏，可在日記篩選「已收藏」找到':'已取消收藏',2200)};
  if($('dStar'))$('dStar').onclick=()=>openCon(S.k);
  $('dBody').querySelectorAll('.dv-nav button').forEach(b=>b.onclick=()=>{openDetail(b.dataset.id);$('dBody').scrollTop=0});
  $('dBody').querySelectorAll('.dv-tags [data-tag]').forEach(b=>b.onclick=()=>{fClear();fl.tag=b.dataset.tag;closeSheet('detail');go('log');renderLog()});
  $('dDel').onclick=()=>{const idx=entries.findIndex(x=>x.id===detailId);if(idx<0)return;const del=entries[idx],d=readDraft(),dr=d&&d.editing===del.id?d:null;
    if(dr)clearDraft();entries.splice(idx,1);save();closeSheet('detail');render();
    snack('已刪除紀錄','復原',()=>{entries.splice(Math.min(idx,entries.length),0,del);save();if(dr){try{localStorage.setItem(DKEY,JSON.stringify(dr))}catch(_){}}render();toast('已復原紀錄')})};
  if(!$('detail').classList.contains('open'))openSheet('detail');else sheetTop('detail')}
$('dEdit').onclick=()=>{closeSheet('detail');setTimeout(()=>openEditor(detailId),reduce?0:180)};
