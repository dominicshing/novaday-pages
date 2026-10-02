/* ---------- 開發者工具：動畫預覽、測試資料、模擬日期、樣式檢查（只供測試介面，不影響正式功能） ---------- */
const DEV_CLOCK='novaday.dev.dateOffset';
const devOff=()=>{try{return +localStorage.getItem(DEV_CLOCK)||0}catch(_){return 0}};
const devFmtOff=ms=>{const d=Math.round(ms/864e5);return d?`${d>0?'+':''}${d} 天`:`${ms>0?'+':''}${Math.round(ms/36e5)} 小時`};
function devOpen(){devRender();openSheet('devSheet')}
function devRender(){const st=consState(entries),lv=levelInfo(totalXP(entries)).lv,now=new Date(),n=entries.filter(e=>e.dev).length,off=devOff();
  $('dvCon').innerHTML=Object.keys(CON).map(k=>`<option value="${k}"${k===st.cur?' selected':''}>${CON[k].n}</option>`).join('');
  $('dvAch').innerHTML=ACH.map(a=>`<option value="${a.id}">${esc(a.n)}</option>`).join('');
  $('dvLv').innerHTML=Array.from({length:59},(_,i)=>i+2).map(v=>`<option value="${v}"${v===lv+1?' selected':''}>Lv.${v}${rankIdx(v)!==rankIdx(v-1)?'・晉階':''}</option>`).join('');
  $('dvDataSub').textContent=n?`目前有 ${n} 則測試紀錄`:'隨機心情、標籤、地點與長短文字';$('dvClr').disabled=!n;
  $('dvDate').value=ymd(now);$('dvTime').value=pad(now.getHours())+':'+pad(now.getMinutes());
  $('dvDateSub').textContent=off?`模擬中・與實際時間相差 ${devFmtOff(off)}`:'目前使用裝置時間';$('dvDateReset').disabled=!off;
  $('dvFs').querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',+b.dataset.s===(prof.devFs||1)));
  $('swDvSlow').setAttribute('aria-checked',!!prof.devSlow);$('swObDev').setAttribute('aria-checked',!!prof.devOnb);$('swFig').setAttribute('aria-checked',!prof.noFig)}

/* 動畫預覽：直接呼叫 App 原本的慶祝畫面 */
$('dvConGo').onclick=()=>showConDone($('dvCon').value);
$('dvAchGo').onclick=()=>{const a=ACH.find(x=>x.id===$('dvAch').value);if(a)showAch(a)};
$('dvLvGo').onclick=()=>showLevel(+$('dvLv').value);

/* 測試資料：產生 N 天的隨機紀錄（dev:1 標記，可一鍵清除） */
const DV_T=['早晨的咖啡','和朋友吃晚餐','加班到很晚','下雨天','傍晚散步','讀完一本書','看了一場電影','整理房間','去運動','想念家人','新的想法','平靜的一天','週末出遊','學到新東西'];
const DV_B=['今天過得很平淡，但心情不錯。','天氣很好，出門走了一圈，路邊的花都開了。','工作有點累，回家洗了熱水澡就好多了。','和老朋友聊了很久，想起很多以前的事。','試了一家新餐廳，甜點特別好吃，下次還要再來。','晚上抬頭看星星，光害有點重，但還是看到幾顆亮星。','有點煩躁，不過寫下來之後好像輕鬆了一些。','早點睡吧，明天又是新的一天。'];
const DV_TAG=['工作','朋友','家人','運動','閱讀','美食','旅行','散步','電影','學習'],DV_LOC=['家','公司','咖啡店','公園','海邊','','',''];
function devGen(days){const r=Math.random,pick=a=>a[Math.floor(r()*a.length)],t=new Date();t.setHours(12,0,0,0);let n=0;
  for(let i=0;i<days;i++){if(r()<.18)continue;const d=new Date(t);d.setDate(t.getDate()-i);const q=r(),k=q<.5?1:q<.85?2+Math.floor(r()*2):5+Math.floor(r()*4);
    entries.push({id:'dev'+Date.now().toString(36)+i.toString(36)+r().toString(36).slice(2,5),dev:1,date:ymd(d),time:pad(7+Math.floor(r()*15))+':'+pad(Math.floor(r()*60)),
      title:pick(DV_T),body:Array.from({length:k},()=>pick(DV_B)).join(''),mood:[0,1,2,2,3,3,3,4,4][Math.floor(r()*9)],
      tags:r()<.6?[...new Set([pick(DV_TAG),...(r()<.4?[pick(DV_TAG)]:[])])]:[],loc:pick(DV_LOC),photo:null});n++}
  save();render();devRender();toast(`已產生 ${n} 則測試紀錄`)}
$('dvData').querySelectorAll('[data-n]').forEach(b=>b.onclick=()=>devGen(+b.dataset.n));
$('dvClr').onclick=()=>{const n=entries.filter(e=>e.dev).length;entries=entries.filter(e=>!e.dev);save();render();devRender();toast(`已清除 ${n} 則測試紀錄`)};

/* 模擬日期：儲存與實際時間的差，重新載入後由 005-dev-clock.js 套用 */
$('dvDateGo').onclick=()=>{const v=$('dvDate').value,tm=$('dvTime').value||'12:00';if(!v)return;const[y,m,d]=v.split('-').map(Number),[hh,mm]=tm.split(':').map(Number),R=window.__RealDate||Date;
  try{localStorage.setItem(DEV_CLOCK,String(new R(y,m-1,d,hh,mm).getTime()-R.now()))}catch(_){}location.reload()};
$('dvDateReset').onclick=()=>{try{localStorage.removeItem(DEV_CLOCK)}catch(_){}location.reload()};
function devPill(){if(!devOff())return;const n=new Date(),b=document.createElement('button');b.type='button';b.className='dv-pill';
  b.textContent=`模擬日期・${n.getMonth()+1}/${n.getDate()} ${pad(n.getHours())}:${pad(n.getMinutes())}`;b.onclick=devOpen;$('device').appendChild(b)}

/* 字級放大：把所有 px 字級的規則複製一份放大版，疊在最後面（同權重、後者勝出，不改原本 CSS） */
function devFsApply(){const old=$('devFsStyle');if(old)old.remove();const s=prof.devFs||1;if(s===1)return;const out=[];
  const walk=(rules,pre)=>{for(const r of rules){
    if(!(r instanceof CSSStyleRule)){const p=r.media?`@media ${r.media.mediaText}`:r.conditionText!=null?`@supports ${r.conditionText}`:null;if(p&&r.cssRules)walk(r.cssRules,p);continue}   /* 一般樣式規則也有 cssRules（巢狀），要先判斷類型 */
    if(!r.selectorText)continue;const m=/^([\d.]+)px$/.exec(r.style.getPropertyValue('font-size').trim());if(!m)continue;
    const rule=`${r.selectorText}{font-size:${(+m[1]*s).toFixed(1)}px}`;out.push(pre?`${pre}{${rule}}`:rule)}};
  for(const sh of document.styleSheets){try{walk(sh.cssRules,'')}catch(_){}}   /* 外部字型樣式表無法讀取，略過 */
  const el=document.createElement('style');el.id='devFsStyle';el.textContent=out.join('\n');document.head.appendChild(el)}
$('dvFs').querySelectorAll('button').forEach(b=>b.onclick=()=>{prof.devFs=+b.dataset.s;saveProf();devFsApply();devRender();toast(prof.devFs===1?'字級已恢復':`字級已放大為 ${prof.devFs} 倍`)});

/* 動畫慢速：所有 CSS／Web 動畫的播放速度設為 0.25（引導頁星空 canvas 也會讀 devSlowK） */
let devSlowT=null;window.devSlowK=1;
const devSweep=()=>document.getAnimations().forEach(a=>{a.playbackRate=window.devSlowK});
function devSlowApply(){window.devSlowK=prof.devSlow?.25:1;clearInterval(devSlowT);devSweep();if(prof.devSlow)devSlowT=setInterval(devSweep,250)}
['animationstart','transitionrun'].forEach(t=>document.addEventListener(t,()=>{if(prof.devSlow)devSweep()},true));
$('swDvSlow').onclick=()=>{prof.devSlow=!prof.devSlow;saveProf();devSlowApply();devRender();toast(prof.devSlow?'動畫已放慢為 0.25 倍':'動畫已恢復正常速度')};

/* 星座剪影總覽：88 個星座一次檢查，可篩選星塵／一般剪影／無剪影，點一下開啟詳情 */
let devFigF='all';
function devFigs(){const ks=Object.keys(CON),W=160,H=120,kind=k=>CFX[k]?(CFX[k].dust?'dust':'fig'):'none',LB={dust:'星塵',fig:'一般剪影',none:'無剪影'};
  const list=ks.filter(k=>devFigF==='all'||kind(k)===devFigF);
  $('dvFigSum').textContent=`共 ${ks.length} 個星座・剪影 ${ks.filter(k=>CFX[k]).length}・星塵 ${ks.filter(k=>kind(k)==='dust').length}${prof.noFig?'・目前已關閉「顯示星座剪影」':''}`;
  $('dvFigF').querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.f===devFigF));
  $('dvFigGrid').innerHTML=list.map(k=>`<button type="button" class="dvf" data-k="${k}"><svg viewBox="0 0 ${W} ${H}" aria-hidden="true">${conSVG(k,W,H,12,0,null,{sc:.7})}</svg><b>${CON[k].n}</b><small>${LB[kind(k)]}</small></button>`).join('');
  $('dvFigGrid').querySelectorAll('.dvf').forEach(b=>b.onclick=()=>openCon(b.dataset.k))}
$('liDvFigs').onclick=()=>{devFigs();$('devFigSheet').querySelector('.sb').scrollTop=0;openSheet('devFigSheet')};
$('dvFigF').querySelectorAll('button').forEach(b=>b.onclick=()=>{devFigF=b.dataset.f;devFigs()});

$('liDev').onclick=devOpen;
devFsApply();devSlowApply();devPill();
