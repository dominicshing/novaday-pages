/* ---------- 十二星座：性格與本月運勢 ---------- */
const ELC={'火象':'#FF9A6B','土象':'#D9BE7E','風象':'#6FE3D6','水象':'#7FB2FF'};
const zRing=()=>`<svg class="fo-ring" viewBox="-29 -29 58 58" aria-hidden="true"><circle r="26"/>${ZODIAC.map((z,j)=>{const a=j/12*Math.PI*2-Math.PI/2;return `<g transform="translate(${(26*Math.cos(a)-3.6).toFixed(2)} ${(26*Math.sin(a)-3.6).toFixed(2)}) scale(.3)">${ZGP[j]}</g>`}).join('')}</svg>`;
function renderFortuneCard(){const b=$('fortuneCard'),i=signIdx(prof.birthday),n=new Date(),M=n.getMonth()+1;
  const snoozed=i<0&&prof.foSnooze&&prof.foSnooze>ymd(n);$('foWrap').hidden=!!snoozed;$('foX').hidden=i>=0;
  if(i<0){b.className='fortune panel setup';b.style.removeProperty('--elc');
    b.innerHTML=`<span class="fo-orb">${zRing()}<span class="zg" aria-hidden="true">${STAR4}</span></span><span class="ft"><b>你是哪個星座？</b><small>輸入生日，解鎖性格與<span style="white-space:nowrap"> ${M} 月運勢</span></small></span><span class="fo-cta" aria-hidden="true">設定生日</span>`;
    b.setAttribute('aria-label',`設定生日，查看你的星座性格與 ${M} 月運勢`);return}
  const Z=ZODIAC[i],f=fortune(i,n.getFullYear(),M);b.className='fortune panel set';b.style.setProperty('--elc',ELC[Z.el]);
  b.innerHTML=`<span class="fo-orb">${zRing()}<span class="zg" aria-hidden="true">${zg(i)}</span><span class="fo-el" aria-hidden="true">${Z.el.slice(0,1)}</span></span>
    <span class="ft"><b>${Z.n}<span class="fo-tag">${M} 月運勢</span></b><span class="fo-meta">${stars5(f.so)}<span class="fo-lc">幸運色・${f.c}</span></span><small class="fo-sum">${f.o}</small></span><span class="chev" aria-hidden="true">›</span>`;
  b.setAttribute('aria-label',`${Z.n} ${M} 月運勢，${f.so} 顆星，幸運色${f.c}。${f.o}`)}
$('foX').onclick=()=>{const d=new Date();d.setDate(d.getDate()+7);prof.foSnooze=ymd(d);saveProf();renderFortuneCard();toast('好的，7 天後再提醒你。也可以隨時在「我的」設定星座',3000)};
$('fortuneCard').onclick=()=>{signIdx(prof.birthday)<0?openBdQuick():openFortune()};
/* 快速設定生日：點月份、點日期，即時顯示星座 */
let bq={m:0,d:0};
/* iOS 風格滾輪：捲動對齊、立體傾斜、點一下也能選 */
const WH=40;
function whPaint(col){const c=col.scrollTop+col.clientHeight/2;col.querySelectorAll('.wh-it').forEach(it=>{const d=(it.offsetTop+WH/2-c)/WH,a=Math.max(-3,Math.min(3,d));
  it.style.transform=`rotateX(${(-a*22).toFixed(1)}deg) translateZ(0)`;it.style.opacity=String(Math.max(.16,1-Math.abs(a)*.3))})}
function whBuild(col,labels,sel){col.innerHTML='<div class="wh-pad"></div>'+labels.map((t,k)=>`<div class="wh-it" role="option" data-v="${k+1}" aria-selected="${k+1===sel}">${t}</div>`).join('')+'<div class="wh-pad"></div>';
  col.scrollTop=(sel-1)*WH;whPaint(col)}
function whMark(col,v){col.querySelectorAll('.wh-it').forEach(it=>it.setAttribute('aria-selected',String(+it.dataset.v===v)))}
function whBind(col,pick){let t=0,raf=0;
  col.addEventListener('scroll',()=>{if(!raf)raf=requestAnimationFrame(()=>{raf=0;whPaint(col)});clearTimeout(t);t=setTimeout(()=>pick(Math.round(col.scrollTop/WH)+1),90)},{passive:true});
  col.addEventListener('click',e=>{const it=e.target.closest('.wh-it');if(it)col.scrollTo({top:(+it.dataset.v-1)*WH,behavior:reduce?'auto':'smooth'})});
  col.addEventListener('keydown',e=>{if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();col.scrollBy({top:e.key==='ArrowDown'?WH:-WH,behavior:reduce?'auto':'smooth'})}})}
const bqDim=m=>new Date(2000,m,0).getDate();
function bqDays(){whBuild($('bqWD'),Array.from({length:bqDim(bq.m)},(_,k)=>`${k+1} 日`),bq.d)}
whBind($('bqWM'),v=>{v=Math.max(1,Math.min(12,v));if(v===bq.m)return;bq.m=v;whMark($('bqWM'),v);const n=bqDim(v);if(bq.d>n)bq.d=n;bqDays();bqRender();buzz(4)});
whBind($('bqWD'),v=>{v=Math.max(1,Math.min(bqDim(bq.m),v));if(v===bq.d)return;bq.d=v;whMark($('bqWD'),v);bqRender();buzz(4)});
function openBdQuick(){const b=prof.birthday?prof.birthday.split('-').map(Number):null,n=new Date();bq={m:b?b[1]:n.getMonth()+1,d:b?b[2]:n.getDate()};bqLast=-2;
  openSheet('bdQuick');whBuild($('bqWM'),Array.from({length:12},(_,k)=>`${k+1} 月`),bq.m);bqDays();bqRender();
  requestAnimationFrame(()=>{$('bqWM').scrollTop=(bq.m-1)*WH;$('bqWD').scrollTop=(bq.d-1)*WH;whPaint($('bqWM'));whPaint($('bqWD'))})}
let bqLast=-2;
function bqRender(){const zi=bq.m&&bq.d?signIdx(`2000-${pad(bq.m)}-${pad(bq.d)}`):-1,pv=$('bqPrev');$('bqGo').disabled=$('bqOk').disabled=zi<0;
  $('bqWheel').setAttribute('aria-label',`${bq.m} 月 ${bq.d} 日`);if(zi===bqLast)return;bqLast=zi;
  if(zi<0){pv.className='bq-prev';pv.innerHTML=`<span class="zo">${zRing()}<span class="zg" aria-hidden="true">${STAR4}</span></span><span>選好月份和日期後，這裡會顯示你的星座</span>`}
  else{const Z=ZODIAC[zi];pv.className='bq-prev on';pv.style.setProperty('--elc',ELC[Z.el]);
    pv.innerHTML=`<span class="zo">${zRing()}<span class="zg" aria-hidden="true">${zg(zi)}</span></span><span><b>${Z.n}</b><small>${zRange(zi)}・${Z.el}星座</small><span class="kw">${Z.kw.map(w=>`<span class="chip">${w}</span>`).join('')}</span></span>`}}
/* 確認：儲存後關閉；查看我的運勢：儲存後接著打開運勢 */
function bqSave(){if(!bq.m||!bq.d)return false;const had=signIdx(prof.birthday)>=0;prof.birthday=`2000-${pad(bq.m)}-${pad(bq.d)}`;saveProf();
  closeSheet('bdQuick');renderFortuneCard();renderMe();const zi=signIdx(prof.birthday);
  if(!had)toast(`已設定星座：${ZODIAC[zi].n}`);return true}
$('bqOk').onclick=()=>bqSave();
$('bqGo').onclick=()=>{if(bqSave())setTimeout(()=>openFortune(),reduce?0:260)};
function openFortune(i){const mine=signIdx(prof.birthday);if(i==null)i=mine;if(i<0)return openBdQuick();
  const Z=ZODIAC[i],n=new Date(),M=n.getMonth()+1,f=fortune(i,n.getFullYear(),M);
  $('fsTitle').textContent=`${Z.n}`;
  $('fsBody').innerHTML=`<div class="fs-top"><span class="zo lg">${zRing()}<span class="zg">${zg(i)}</span></span><h3>${Z.n}</h3><p>${zRange(i)}・${Z.el}星座${i===mine?'・你的星座':''}</p>
      <div class="kw">${Z.kw.map(w=>`<span class="chip">${w}</span>`).join('')}</div></div>
    <div class="fs-sec"><h4>性格</h4><p>${Z.p}</p></div>
    <div class="fs-sec"><h4>${M} 月運勢 ${stars5(f.so)}</h4><p>${f.o}</p>
      <div class="fs-row"><span class="lb">人際 ${stars5(f.sl)}</span><span></span></div><p>${f.l}</p>
      <div class="fs-row"><span class="lb">工作學業 ${stars5(f.sw)}</span><span></span></div><p>${f.w}</p>
      <div class="fs-row"><span class="lb">照顧自己</span><span>${f.s}</span></div>
      <div class="lucky"><div><small>幸運色</small>${f.c}</div><div><small>幸運數字</small>${f.n}</div></div>
      <p style="margin-top:10px;font-size:13px;color:var(--muted)">${ELTIP[Z.el]}</p></div>
    <div class="fs-sec"><h4>本月書寫提示</h4><p>${f.q}</p><button type="button" class="btn primary" id="fsWrite" style="width:100%;margin-top:10px">用這題寫一則紀錄</button></div>
    <button type="button" class="btn" id="fsCon" style="width:100%;margin-top:12px">在星座圖鑑中查看${CON[Z.k].n}</button>
    <div class="at-h">其他星座</div><div class="fs-other">${ZODIAC.map((z,j)=>`<button type="button" data-i="${j}" aria-pressed="${j===i}">${zg(j)} ${z.n}</button>`).join('')}</div>
    <p class="fs-note">星座運勢僅供娛樂參考，每月初更新，只顯示當月內容。</p>`;
  $('fsBody').scrollTop=0;
  $('fsWrite').onclick=()=>{closeSheet('fortuneSheet');setTimeout(()=>openEditor(null,f.q),reduce?0:220)};
  $('fsCon').onclick=()=>{if($('conSheet').classList.contains('open'))closeSheet('fortuneSheet');openCon(Z.k)};
  $('fsBody').querySelectorAll('.fs-other button').forEach(b=>b.onclick=()=>openFortune(+b.dataset.i));
  if(!$('fortuneSheet').classList.contains('open'))openSheet('fortuneSheet');else sheetTop('fortuneSheet')}

function openMonth(){const n=new Date(),Y=n.getFullYear(),M=n.getMonth();
  const list=sorted().filter(e=>{const d=parse(e.date);return d.getFullYear()===Y&&d.getMonth()===M});
  if(!list.length){toast('本月還沒有紀錄，按下點亮寫第一則吧');return}
  $('mTitle').textContent=`${M+1} 月・${list.length} 則紀錄`;let g='',last='';
  list.forEach(e=>{if(e.date!==last){last=e.date;g+=`<div class="day-head"><strong>${esc(fmtDay(e.date))}</strong></div>`}g+=entryCard(e)});
  $('mBody').innerHTML=g;$('mBody').scrollTop=0;
  $('mBody').querySelectorAll('.entry').forEach(b=>b.onclick=()=>{closeSheet('monthSheet');setTimeout(()=>openDetail(b.dataset.id),reduce?0:220)});
  openSheet('monthSheet')}

