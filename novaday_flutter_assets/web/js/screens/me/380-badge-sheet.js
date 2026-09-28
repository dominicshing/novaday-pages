/* 徽章詳情 bottom sheet */
function achGo(id,cat){if(/^rev/.test(id))return['回顧一則舊紀錄',()=>{const e=pickReview();if(e)openDetail(e.id);else toast('先寫幾天紀錄，之後就能回顧')}];
  if(cat==='cons')return['打開星座圖鑑',()=>go('atlas')];if(id==='fav5')return['去日記挑一則收藏',()=>go('log','list')];return['寫一則紀錄',()=>openEditor()]}
let achCur=null;
let achBusy=false;
function achSwap(d){if(achBusy)return;const sl=$('asBody').querySelector('.as-slide');if(reduce||!sl){achStep(d);return}achBusy=true;
  sl.classList.remove('snap','as-in-r','as-in-l');sl.classList.add('out');sl.style.transform=`translateX(${d>0?-105:105}%)`;sl.style.opacity='0';
  setTimeout(()=>{achBusy=false;achStep(d)},190)}
function achStep(d){const i=ACH.findIndex(x=>x.id===achCur);if(i<0)return;openAch(ACH[(i+d+ACH.length)%ACH.length].id,d)}
let achPrevP=null;
function openAch(id,dir){const a=ACH.find(x=>x.id===id);if(!a)return;achCur=id;const sibX=$('achSheet').classList.contains('open')&&$('asBody').querySelector('.as-sibs')?$('asBody').querySelector('.as-sibs').scrollLeft:null;const on=a.t(entries),[c0,t]=ACHP[id](entries),c=Math.min(c0,t),p=on?100:Math.min(99,Math.round(c/t*100));
  const cat=CR_CAT[id]||'write',col=CR_COL[cat][0],ci=ACH_CAT.find(x=>x[0]===cat),sibs=ACH.filter(x=>(CR_CAT[x.id]||'write')===cat),k=sibs.indexOf(a),nOn=sibs.filter(x=>x.t(entries)).length;
  const sh=$('achSheet');sh.style.setProperty('--c',col);
  const g=on?null:achGo(id,cat);
  const gi=ACH.indexOf(a),anim=dir&&!reduce?(dir>0?' as-in-r':' as-in-l'):'';
  $('asBody').innerHTML=`<div class="as-hero"><i class="as-glow" aria-hidden="true"></i>
      <button type="button" class="as-nav l" id="asPrev" aria-label="上一個徽章"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg></button>
      <button type="button" class="as-nav r" id="asNext" aria-label="下一個徽章"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg></button>
      <div class="as-slide${anim}"><div class="as-cr">${crystal(id,on,p)}</div>
      <span class="as-cat"><svg viewBox="0 0 24 24" aria-hidden="true">${ci[3]}</svg>${ci[1]}・第 ${k+1} / ${sibs.length} 個</span>
      <h2 id="asN">${esc(a.n)}</h2><p class="as-d">${esc(a.d)}</p><span class="as-pos">${gi+1} / ${ACH.length}</span></div></div>
    <div class="as-card${on?' on':''}"><div class="as-ph"><span>${on?'已解鎖':'目前進度'}</span><b>${c.toLocaleString()} / ${t.toLocaleString()}</b></div><div class="as-bar" role="progressbar" aria-valuemin="0" aria-valuemax="${t}" aria-valuenow="${c}"><i style="width:${achPrevP==null?p:achPrevP}%"></i></div><p>${on?'恭喜！你已經達成這個徽章':achLeft(id,t-c)}</p>${on?'<div class="btn as-go as-got" aria-hidden="true">已收藏在你的星空 ✦</div>':`<button type="button" class="btn as-go" id="asGo">${g[0]}</button>`}</div>
    <div class="as-sib-h">${ci[1]}類徽章<small>已解鎖 ${nOn} / ${sibs.length}</small></div>
    <div class="as-sibs" role="list">${sibs.map(x=>{const o=x.t(entries),[xc,xt]=ACHP[x.id](entries);return `<button type="button" role="listitem" data-a="${x.id}" aria-current="${x.id===id}" aria-label="${esc(x.n)}，${o?'已解鎖':'未解鎖'}"><span class="sb-cr">${crystal(x.id,o,o?100:Math.min(99,Math.round(Math.min(xc,xt)/xt*100)))}</span><small>${esc(x.n)}</small></button>`}).join('')}</div>`;
  $('asPrev').onclick=()=>achSwap(-1);$('asNext').onclick=()=>achSwap(1);
  if($('asGo'))$('asGo').onclick=()=>{closeSheet('achSheet');setTimeout(g[1],reduce?0:220)};
  $('asBody').querySelectorAll('.as-sibs [data-a]').forEach(b=>b.onclick=()=>openAch(b.dataset.a));
  const wasOpen=sh.classList.contains('open');if(!wasOpen){$('asBody').scrollTop=0;openSheet('achSheet')}
  /* 進度條從上一個徽章的長度平滑變化；同類徽章列保持原本的捲動位置再滑到目前的徽章 */
  const bar=$('asBody').querySelector('.as-bar i');achPrevP=p;
  requestAnimationFrame(()=>{if(bar)bar.style.width=p+'%';const cur=$('asBody').querySelector('.as-sibs [aria-current="true"]'),r=cur&&cur.parentElement;if(!r)return;
    const to=cur.offsetLeft-(r.clientWidth-cur.offsetWidth)/2;if(wasOpen&&sibX!=null){r.scrollLeft=sibX;r.scrollTo({left:to,behavior:reduce?'auto':'smooth'})}else r.scrollLeft=to})}
/* 徽章詳情：左右滑動切換、右上角關閉、方向鍵切換 */
(()=>{const body=$('asBody');let g=null,raf=0;
  $('asX').onclick=()=>closeSheet('achSheet');
  const paint=()=>{raf=0;if(!g||!g.on)return;const sl=g.sl;if(!sl)return;const dx=g.dx,w=body.clientWidth||360;
    sl.style.transform=`translate3d(${dx}px,0,0) rotate(${(dx/w*6).toFixed(2)}deg)`;sl.style.opacity=String(Math.max(.4,1-Math.abs(dx)/(w*1.1)))};
  body.addEventListener('pointerdown',e=>{if(achBusy||e.target.closest('.as-sibs,button,.as-card'))return;if(e.pointerType==='mouse'&&e.button!==0)return;
    g={x:e.clientX,y:e.clientY,dx:0,on:false,id:e.pointerId,pts:[[e.clientX,performance.now()]],sl:null}});
  body.addEventListener('pointermove',e=>{if(!g||e.pointerId!==g.id)return;const dx=e.clientX-g.x,dy=e.clientY-g.y;
    if(!g.on){if(Math.abs(dx)<8)return;if(Math.abs(dy)>Math.abs(dx)){g=null;return}g.on=true;g.x=e.clientX-(dx>0?8:-8);g.sl=body.querySelector('.as-slide');
      if(g.sl){g.sl.classList.remove('snap','out','as-in-r','as-in-l')}try{body.setPointerCapture(e.pointerId)}catch(_){}}
    const now=performance.now();g.pts.push([e.clientX,now]);while(g.pts.length>2&&now-g.pts[0][1]>120)g.pts.shift();
    g.dx=e.clientX-g.x;if(!raf)raf=requestAnimationFrame(paint)});
  const end=()=>{if(!g)return;const {dx,on,sl,pts}=g,p0=pts[0],p1=pts[pts.length-1],vx=p1&&p0&&p1[1]>p0[1]?(p1[0]-p0[0])/(p1[1]-p0[1]):0;g=null;if(raf){cancelAnimationFrame(raf);raf=0}if(!on)return;body._swEnd=Date.now();
    const w=body.clientWidth||360,flick=Math.abs(vx)>.3&&Math.abs(dx)>20&&Math.sign(vx)===Math.sign(dx);
    if(Math.abs(dx)>w*.22||flick){buzz(6);achSwap(dx<0?1:-1)}
    else if(sl){sl.classList.add('snap');sl.style.transform='';sl.style.opacity=''}};
  body.addEventListener('pointerup',end);body.addEventListener('pointercancel',end);
  body.addEventListener('click',e=>{if(Date.now()-(body._swEnd||0)<300){e.stopPropagation();e.preventDefault()}},true);
  document.addEventListener('keydown',e=>{if(!$('achSheet').classList.contains('open'))return;if(e.key==='ArrowRight'){e.preventDefault();achSwap(1)}else if(e.key==='ArrowLeft'){e.preventDefault();achSwap(-1)}})})();
function achLeft(id,n){n=Math.max(0,n);const f={s3:`再連續寫 ${n} 天就能解鎖`,s7:`再連續寫 ${n} 天就能解鎖`,first:`寫下第一則就能解鎖`,c10:`再寫 ${n} 則就能解鎖`,photo:`再 ${n} 則附上照片就能解鎖`,loc:`再 ${n} 則加上地點就能解鎖`,
  words:`再寫 ${n.toLocaleString()} 字就能解鎖`,signal:`再回答 ${n} 次今日星語就能解鎖`,all:`再用 ${n} 種沒用過的心情就能解鎖`,con1:`再完成 ${n} 個星座就能解鎖`,con5:`再完成 ${n} 個星座就能解鎖`,s100:`再連續寫 ${n} 天就能解鎖`,s60:`再連續寫 ${n} 天就能解鎖`,mfull:`這個月再寫 ${n} 天就能解鎖`,back:`休息一陣子後再回來寫，就能解鎖`,c365:`再寫 ${n} 則就能解鎖`,w50k:`再寫 ${n.toLocaleString()} 字就能解鎖`,long1k:`單則再多寫 ${n.toLocaleString()} 字就能解鎖`,multi:`同一天再寫 ${n} 則就能解鎖`,photo4:`單則再加 ${n} 張照片就能解鎖`,fav5:`再收藏 ${n} 則就能解鎖`,season4:`再到 ${n} 個季節寫紀錄就能解鎖`,happy3:`再連續 ${n} 天好心情就能解鎖`,bright10:`再記錄 ${n} 次「很棒」就能解鎖`,calm10:`再記錄 ${n} 次「還可以」就能解鎖`,low5:`難過的日子也寫下來，再 ${n} 次就能解鎖`,rebound:`低落之後心情回升時就能解鎖`,rev1:`回顧一則舊紀錄就能解鎖`,rev10:`再回顧 ${n} 則就能解鎖`,rev30:`再回顧 ${n} 則就能解鎖`,anniv:`一年後的同一天再寫一則就能解鎖`,j100:`再繼續寫 ${n} 天就能解鎖`,j365:`再繼續寫 ${n} 天就能解鎖`,con44:`再完成 ${n} 個星座就能解鎖`,zod12:`再完成 ${n} 個黃道星座就能解鎖`,con88:`再完成 ${n} 個星座就能解鎖`,s14:`再連續寫 ${n} 天就能解鎖`,s30:`再連續寫 ${n} 天就能解鎖`,m20:`這個月再寫 ${n} 天就能解鎖`,c30:`再寫 ${n} 則就能解鎖`,c100:`再寫 ${n} 則就能解鎖`,long:`單則再多寫 ${n} 字就能解鎖`,photo20:`再 ${n} 則附上照片就能解鎖`,loc10:`再去 ${n} 個新地點就能解鎖`,tag5:`再用 ${n} 種新標籤就能解鎖`,signal10:`再回答 ${n} 次今日星語就能解鎖`,night:`再 ${n} 則在晚上 10 點後寫就能解鎖`,early:`再 ${n} 則在早上 8 點前寫就能解鎖`,con3:`再完成 ${n} 個星座就能解鎖`,con10:`再完成 ${n} 個星座就能解鎖`,w20k:`再寫 ${n.toLocaleString()} 字就能解鎖`,w5k:`再寫 ${n.toLocaleString()} 字就能解鎖`,zod1:`完成一個黃道十二星座就能解鎖`,con20:`再完成 ${n} 個星座就能解鎖`}[id];return f||`還差 ${n}`}
function renderMe(){renderInsights();renderFootprint();renderTagCnt();renderStoreRow();if($('rpOpenT'))$('rpOpenT').textContent=`${new Date().getMonth()+1} 月星空報告`;
  const xp=totalXP(entries),{lv,rest,need}=levelInfo(xp),u=unlocked(entries);
  const first=entries.map(e=>e.date).concat(prof.since?[prof.since]:[]).sort()[0]||ymd(new Date());
  const pct=Math.round(rest/need*100);
  $('regionVal').textContent=prof.region?prof.region.name.replace(/（.*）/,''):'未設定';
  $('topAvatar').innerHTML=avHTML(prof.avatar);$('pAvatar').innerHTML=avHTML(prof.avatar);$('pLv').innerHTML=`<small>LV</small>${lv}`;
  $('pProg').style.strokeDasharray=`${pct} 100`;{const a=pct/100*Math.PI*2-Math.PI/2;$('pDot').setAttribute('cx',(60+49*Math.cos(a)).toFixed(2));$('pDot').setAttribute('cy',(60+49*Math.sin(a)).toFixed(2))}
  $('pAvRing').querySelectorAll('.tk').forEach(t=>t.classList.toggle('on',(+t.dataset.t)/36<pct/100));
  $('pAvRing').setAttribute('aria-label',`${avLabel(prof.avatar)} 頭像，等級 ${lv}，本級經驗值 ${pct}%`);
  $('pName').textContent=prof.name||'星旅人';$('pMotto').textContent=prof.motto||'';$('pMotto').hidden=!prof.motto;

  const ri=rankIdx(lv),RC=RINFO[ri].c;
  $('pRankChip').innerHTML=`<span>${RANKS[ri]}</span>`;if($('pRb').dataset.r!=String(ri)){$('pRb').innerHTML=rankBadge(ri);$('pRb').dataset.r=ri}
  $('pRankChip').style.setProperty('--rb',hexA(RC,.45));$('pRankChip').setAttribute('aria-label',`目前階級：${RANKS[ri]}，查看下一階`);
  renderRanks(xp,lv);
  {const zi=signIdx(prof.birthday);$('pSign').innerHTML=zi<0?`${STAR4} 設定星座`:`${zg(zi)} ${ZODIAC[zi].n}`;$('pSign').setAttribute('aria-label',zi<0?'設定生日以顯示星座':`${ZODIAC[zi].n}，查看性格與本月運勢`)}
  $('pXpText').innerHTML=`<b>${rest}</b> / ${need} XP・還差 ${need-rest} 升到 Lv.${lv+1}`;
  $('stTotal').textContent=entries.length;$('stWords').textContent=entries.reduce((s,e)=>s+chars(e),0).toLocaleString();$('stBest').textContent=bestStreak(entries);
  $('stPhotos').textContent=entries.filter(e=>e.photo).length;$('stLocs').textContent=new Set(entries.filter(e=>e.loc).map(e=>e.loc)).size;$('stXP').textContent=xp.toLocaleString();
  renderEnergy();
  $('aCount').textContent=`已解鎖 ${u.length} / ${ACH.length}`;
  /* 預設只顯示已解鎖＋最接近完成的 3 個，其餘收起 */
  const AL=ACH.map(a=>{const on=u.includes(a.id),[c,t]=ACHP[a.id](entries);return{a,on,c,t,r:Math.min(c,t)/t}});
  /* 收合時：已解鎖＋最接近完成的 3～5 個，總數補成 3 的倍數，排列才會整齊 */
  const nOn=AL.filter(x=>x.on).length,nNear=Math.min(AL.length-nOn,3+(3-(nOn+3)%3)%3);
  const near=new Set(AL.filter(x=>!x.on).sort((x,y)=>y.r-x.r).slice(0,nNear).map(x=>x.a.id));
  const shown=achAll?AL:AL.filter(x=>x.on||near.has(x.a.id)),hiddenN=AL.length-shown.length;
  let lastCat=null;
  $('achList').innerHTML=shown.map(({a})=>{const on=u.includes(a.id),[c,t]=ACHP[a.id](entries),p=on?100:Math.min(99,Math.round(Math.min(c,t)/t*100)),cat=CR_CAT[a.id]||'write',hd=achAll&&cat!==lastCat?achCatHead(cat,AL):'';lastCat=cat;
    return `${hd}<div data-c="${cat}" class="medal${on?'':' locked'}${(prof.achNew||[]).includes(a.id)?' is-new':''}" role="button" tabindex="0" data-a="${a.id}" aria-label="${a.n}，${a.d}，${on?'已解鎖':`進度 ${Math.min(c,t)} / ${t}`}"><div class="em" aria-hidden="true">${crystal(a.id,on,p)}</div><span class="mn">${a.n}</span><small>${a.d}</small>
      <span class="mp">${on?'✦ 已解鎖':`${Math.min(c,t).toLocaleString()} / ${t.toLocaleString()}`}</span></div>`}).join('');
  /* 點一下徽章：打開徽章詳情 */
  $('achList').querySelectorAll('.medal').forEach(m=>{m.onclick=()=>{achPrevP=null;openAch(m.dataset.a)};m.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openAch(m.dataset.a)}}});
  /* 下一個目標：最接近完成、還沒解鎖的徽章 */
  {const nx=AL.filter(x=>!x.on).sort((x,y)=>y.r-x.r||(x.t-x.c)-(y.t-y.c))[0],b=$('achNext');
    if(!nx){b.hidden=true}else{const {a,c,t}=nx,p=Math.min(99,Math.round(Math.min(c,t)/t*100));b.hidden=false;b.style.setProperty('--c',CR_COL[CR_CAT[a.id]||'write'][0]);
      b.innerHTML=`<span class="an-ic">${crystal(a.id,false,p)}</span><span class="an-t"><small>下一個目標</small><b>${esc(a.n)}</b><span>${achLeft(a.id,t-Math.min(c,t))}</span><span class="an-bar"><i style="width:${Math.max(4,p)}%"></i></span></span>`;
      b.setAttribute('aria-label',`下一個目標：${a.n}，${achLeft(a.id,t-Math.min(c,t))}`);
      b.onclick=()=>{achPrevP=null;openAch(a.id)}}}
  $('achMore').hidden=!achAll&&!hiddenN;$('achMore').textContent=achAll?'收起':`查看全部 ${AL.length} 個徽章`;
  $('swRemind').setAttribute('aria-checked',!!prof.remind);$('remindTime').value=prof.remindTime||'21:00';$('remindTime').disabled=!prof.remind;$('liTime').classList.toggle('off',!prof.remind);
  $('swCalm').setAttribute('aria-checked',!!prof.calm);
}
let logView='list';
function setLogView(v,quiet){logView=v;const cal=v==='cal';$('logList').hidden=cal;$('calWrap').hidden=!cal;$('listCtl').hidden=cal;
  if(!cal)$('calToday').hidden=true;else renderCal();
  document.querySelectorAll('#s-log .seg [data-v]').forEach(b=>b.setAttribute('aria-selected',b.dataset.v===v));$('s-log').querySelector('.seg').classList.toggle('r',cal);
  requestAnimationFrame(()=>{$('s-log').style.setProperty('--logTop',$('logTop').offsetHeight+'px');if(cal)drawCalLines()});if(!quiet)$('s-log').scrollTop=0}
function render(){XPM=xpMap(entries);renderAchDot();renderQuick();renderMemory();renderReportCard();if(typeof renderSampleRow==='function')renderSampleRow();if(cur==='atlas')renderAtlas();renderHUD();renderAppBar();renderGalaxy();renderFortuneCard();renderMissions();renderLog();renderCal();renderMe();renderDraftBar()}

