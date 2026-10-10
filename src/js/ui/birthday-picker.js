/* 生日設定：滾輪與星座預覽 */
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
function bqDays(){whBuild($('bqWD'),Array.from({length:bqDim(bq.m)},(_,k)=>EN_UI?String(k+1):`${k+1} 日`),bq.d)}
whBind($('bqWM'),v=>{v=Math.max(1,Math.min(12,v));if(v===bq.m)return;bq.m=v;whMark($('bqWM'),v);const n=bqDim(v);if(bq.d>n)bq.d=n;bqDays();bqRender();buzz(4)});
whBind($('bqWD'),v=>{v=Math.max(1,Math.min(bqDim(bq.m),v));if(v===bq.d)return;bq.d=v;whMark($('bqWD'),v);bqRender();buzz(4)});
function openBdQuick(){const b=prof.birthday?prof.birthday.split('-').map(Number):null,n=new Date();bq={m:b?b[1]:n.getMonth()+1,d:b?b[2]:n.getDate()};bqLast=-2;
  openSheet('bdQuick');whBuild($('bqWM'),Array.from({length:12},(_,k)=>fmtM(k+1)),bq.m);bqDays();bqRender();
  requestAnimationFrame(()=>{$('bqWM').scrollTop=(bq.m-1)*WH;$('bqWD').scrollTop=(bq.d-1)*WH;whPaint($('bqWM'));whPaint($('bqWD'))})}
let bqLast=-2;
function bqRender(){const zi=bq.m&&bq.d?signIdx(`2000-${pad(bq.m)}-${pad(bq.d)}`):-1,pv=$('bqPrev');$('bqGo').disabled=$('bqOk').disabled=zi<0;
  $('bqWheel').setAttribute('aria-label',EN_UI?fmtMD(new Date(2000,bq.m-1,bq.d)):`${bq.m} 月 ${bq.d} 日`);if(zi===bqLast)return;bqLast=zi;
  if(zi<0){pv.className='bq-prev';pv.innerHTML=`<span class="zo">${zRing()}<span class="zg" aria-hidden="true">${STAR4}</span></span><span>${tl('選好月份和日期後，這裡會顯示你的星座')}</span>`}
  else{const Z=ZODIAC[zi];pv.className='bq-prev on';pv.style.setProperty('--elc',ELC[Z.el]);
    pv.innerHTML=`<span class="zo">${zRing()}<span class="zg" aria-hidden="true">${zg(zi)}</span></span><span><b>${Z.n}</b><small>${zRange(zi)}${SEP}${elName(Z.el)}</small><span class="kw">${Z.kw.map(w=>`<span class="chip">${w}</span>`).join('')}</span></span>`}}
/* 確認：儲存後關閉；查看我的運勢：儲存後接著打開運勢 */
function bqSave(){if(!bq.m||!bq.d)return false;const had=signIdx(prof.birthday)>=0;prof.birthday=`2000-${pad(bq.m)}-${pad(bq.d)}`;saveProf();
  closeSheet('bdQuick');renderFortuneCard();renderMe();const zi=signIdx(prof.birthday);
  if(!had)toast(tl('已設定星座：{z}',{z:ZODIAC[zi].n}));return true}
$('bqOk').onclick=()=>bqSave();
$('bqGo').onclick=()=>{if(bqSave())setTimeout(()=>openFortune(),reduce?0:260)};
