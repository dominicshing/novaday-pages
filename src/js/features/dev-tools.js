/* 開發者工具（設定 → 開發者選項） */
const DEV_CLOCK='novaday.dev.dateOffset',DV_ERR='novaday.dev.errors',DV_STASH='novaday.dev.stash';
const devOff=()=>{try{return +localStorage.getItem(DEV_CLOCK)||0}catch(_){return 0}};
const devFmtOff=ms=>{const d=Math.round(ms/864e5);return d?tl('{n} 天',{n:(d>0?'+':'')+d}):tl('{n} 小時',{n:(ms>0?'+':'')+Math.round(ms/36e5)})};
const devErrs=()=>{try{return JSON.parse(localStorage.getItem(DV_ERR)||'[]')||[]}catch(_){return[]}};
const devStashN=()=>{try{return (JSON.parse(localStorage.getItem(DV_STASH)||'[]')||[]).length}catch(_){return 0}};
const dvKB=n=>n<1024?`${n} B`:n<1048576?`${(n/1024).toFixed(n<10240?1:0)} KB`:`${(n/1048576).toFixed(1)} MB`;
function devRefresh(){render();renderMe();renderCal();devRender()}
function devOpen(){devRender();openSheet('devSheet')}
function devRender(){const st=consState(entries),lv=levelInfo(totalXP(entries)).lv,realLv=levelInfo(totalXP(entries)-(prof.devXP||0)).lv,now=new Date(),n=entries.filter(e=>e.dev).length,off=devOff(),zi=signIdx(prof.birthday),ne=devErrs().length;
  $('dvCon').innerHTML=Object.keys(CON).map(k=>`<option value="${k}"${k===st.cur?' selected':''}>${CON[k].n}</option>`).join('');
  devStarOptions();
  $('dvAch').innerHTML=ACH.map(a=>`<option value="${a.id}">${esc(a.n)}</option>`).join('');
  $('dvLv').innerHTML=Array.from({length:59},(_,i)=>i+2).map(v=>`<option value="${v}"${v===lv+1?' selected':''}>Lv.${v}${rankIdx(v)!==rankIdx(v-1)?SEP+tl('晉階'):''}</option>`).join('');
  /* 畫面預覽 */
  {const pm=new Date(now.getFullYear(),now.getMonth()-1,1),ym=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}`;$('dvMon').max=ym(now);if(!$('dvMon').value)$('dvMon').value=ym(pm)}
  $('dvZod').innerHTML=ZODIAC.map((z,i)=>`<option value="${i}"${i===(zi<0?0:zi)?' selected':''}>${z.n}${i===zi?tl('（你的星座）'):''}</option>`).join('');
  /* 測試資料 */
  $('dvDataSub').textContent=n?tl('目前有 {n} 則測試紀錄',{n}):tl('隨機心情、標籤、地點與長短文字');$('dvClr').disabled=!n;
  {const T=Object.keys(CON).length;$('dvConsAllN').textContent=`${st.done.length} / ${T}`;$('dvConsAll').disabled=st.done.length>=T}
  $('dvFfSub').textContent=tl('目前連續 {s} 天・完成 {c} 個星座・Lv.{lv}',{s:streakOf(entries).n,c:st.done.length,lv})+(prof.devXP?tl('（加成 +{n} XP）',{n:prof.devXP.toLocaleString()}):'');
  $('dvXp').innerHTML=`<option value="0">${tl('實際等級（Lv.{lv}）',{lv:realLv})}</option>`+Array.from({length:60},(_,i)=>i+1).filter(v=>v>realLv).map(v=>`<option value="${v}"${prof.devXP&&v===lv?' selected':''}>Lv.${v}${SEP}${RANKS[rankIdx(v)]}</option>`).join('');
  $('dvAchM').querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.m===(prof.devAch||'')));
  $('swDvEmpty').setAttribute('aria-checked',!!prof.devEmpty);$('dvEmptySub').textContent=prof.devEmpty?tl('已收起 {n} 則紀錄・關閉後原樣放回',{n:devStashN()}):tl('暫時收起所有紀錄，模擬全新使用者；關閉後原樣放回');
  /* 時間與地點 */
  $('dvDate').value=ymd(now);$('dvTime').value=pad(now.getHours())+':'+pad(now.getMinutes());
  $('dvDateSub').textContent=off?tl('模擬中・與實際時間相差 {d}',{d:devFmtOff(off)}):tl('目前使用裝置時間');$('dvDateReset').disabled=!off;
  $('dvGeoSub').textContent=tl('目前地區：{r}',{r:prof.region?regName(prof.region):tl('未設定')})+('devRegPrev' in prof?tl('・按「還原」回到原本的地區'):'');$('dvGeoReset').disabled=!('devRegPrev' in prof);
  /* 樣式檢查、除錯 */
  $('dvFs').querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',+b.dataset.s===(prof.devFs||1)));
  $('dvW').querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',+b.dataset.w===(+prof.devW||390)));
  $('swDvSlow').setAttribute('aria-checked',!!prof.devSlow);$('swDvTouch').setAttribute('aria-checked',!!prof.devTouch);$('swDvFps').setAttribute('aria-checked',!!prof.devFps);
  $('dvErrSub').textContent=ne?tl('最近有 {n} 筆錯誤',{n:ne}):tl('目前沒有錯誤');
  $('swObDev').setAttribute('aria-checked',!!prof.devOnb);$('swFig').setAttribute('aria-checked',!prof.noFig)}
/* 動畫預覽：直接呼叫 App 原本的慶祝畫面 */
$('dvConGo').onclick=()=>showConDone($('dvCon').value);
$('dvAchGo').onclick=()=>{const a=ACH.find(x=>x.id===$('dvAch').value);if(a)showAch(a)};
$('dvLvGo').onclick=()=>showLevel(+$('dvLv').value);
/* 畫面預覽：月報、年度回顧、運勢，以及不寫入資料的引導頁與密碼鎖 */
const dvYM=()=>{const v=$('dvMon').value;if(!v)return null;const[y,m]=v.split('-').map(Number);return{y,m:m-1}};
$('dvMonGo').onclick=()=>{const r=dvYM();if(r)openReport(r.y,r.m)};
$('dvYearGo').onclick=()=>{const r=dvYM();if(r)openYearReport(r.y)};
$('dvZodGo').onclick=()=>openFortune(+$('dvZod').value);
$('dvOnbGo').onclick=()=>openOnb(true);
$('dvLockGo').onclick=()=>openLock('preview');
/* 測試資料：產生 N 天的隨機紀錄（dev:1 標記，可一鍵清除） */
const DV_T=['早晨的咖啡','和朋友吃晚餐','加班到很晚','下雨天','傍晚散步','讀完一本書','看了一場電影','整理房間','去運動','想念家人','新的想法','平靜的一天','週末出遊','學到新東西'].map(tl);
const DV_B=['今天過得很平淡，但心情不錯。','天氣很好，出門走了一圈，路邊的花都開了。','工作有點累，回家洗了熱水澡就好多了。','和老朋友聊了很久，想起很多以前的事。','試了一家新餐廳，甜點特別好吃，下次還要再來。','晚上抬頭看星星，光害有點重，但還是看到幾顆亮星。','有點煩躁，不過寫下來之後好像輕鬆了一些。','早點睡吧，明天又是新的一天。'].map(tl);
const DV_TAG=['工作','朋友','家人','運動','閱讀','美食','旅行','散步','電影','學習'].map(x=>tlc('tag',x)),DV_LOC=['家','公司','咖啡店','公園','海邊','','',''].map(x=>x&&tl(x));
let dvSeq=0;
function devEntry(date){const r=Math.random,pick=a=>a[Math.floor(r()*a.length)],q=r(),k=q<.5?1:q<.85?2+Math.floor(r()*2):5+Math.floor(r()*4);
  return{id:'dev'+Date.now().toString(36)+(dvSeq++).toString(36)+r().toString(36).slice(2,5),dev:1,date,time:pad(7+Math.floor(r()*15))+':'+pad(Math.floor(r()*60)),
    title:pick(DV_T),body:Array.from({length:k},()=>pick(DV_B)).join(EN_UI?' ':''),mood:[0,1,2,2,3,3,3,4,4][Math.floor(r()*9)],
    tags:r()<.6?[...new Set([pick(DV_TAG),...(r()<.4?[pick(DV_TAG)]:[])])]:[],loc:pick(DV_LOC),photo:null}}
const dvDayAgo=i=>{const d=new Date();d.setHours(12,0,0,0);d.setDate(d.getDate()-i);return ymd(d)};
function devGen(days){let n=0;for(let i=0;i<days;i++){if(Math.random()<.18)continue;entries.push(devEntry(dvDayAgo(i)));n++}
  save();devRefresh();toast(tl('已產生 {n} 則測試紀錄',{n}))}
$('dvData').querySelectorAll('[data-n]').forEach(b=>b.onclick=()=>devGen(+b.dataset.n));
$('dvClr').onclick=()=>{const n=entries.filter(e=>e.dev).length;entries=entries.filter(e=>!e.dev);save();devRefresh();toast(tl('已清除 {n} 則測試紀錄',{n}))};
/* 快轉進度：連續天數、完成星座用測試紀錄補滿；等級用 XP 加成（prof.devXP），不必產生上千則紀錄 */
$('dvStkGo').onclick=()=>{const N=+$('dvStk').value,have=new Set(entries.map(e=>e.date));let k=0;
  for(let i=0;i<N;i++){const d=dvDayAgo(i);if(!have.has(d)){entries.push(devEntry(d));k++}}
  save();devRefresh();toast(k?tl('已補上 {k} 天的紀錄，目前連續 {n} 天',{k,n:streakOf(entries).n}):tl('已經連續 {n} 天以上',{n:N}))};
function devFillCons(N){let st=consState(entries),k=0;
  while(st.done.length<N&&st.cur){for(let j=CON[st.cur].s.length-st.lit;j>0;j--){entries.push(devEntry(dvDayAgo(Math.floor(Math.random()*365))));k++}st=consState(entries)}
  if(k&&!save()){entries=entries.slice(0,entries.length-k);toast(tl('儲存空間不足，無法補上紀錄'));return}
  devRefresh();const all=st.done.length>=Object.keys(CON).length;
  toast(k?tl('已補上 {k} 則紀錄，{s}',{k,s:all?tl('所有星座都已點亮'):tl('完成 {n} 個星座',{n:st.done.length})}):all?tl('所有星座都已點亮'):tl('已經完成 {n} 個星座',{n:st.done.length}))}
$('dvConsGo').onclick=()=>devFillCons(+$('dvCons').value);
/* 點亮所有星座：用測試紀錄補滿全部 88 個星座（約 580 顆星），可用「清除測試紀錄」移除 */
$('dvConsAll').onclick=()=>devFillCons(Object.keys(CON).length);
$('dvXpGo').onclick=()=>{const L=+$('dvXp').value,real=totalXP(entries)-(prof.devXP||0);
  if(L)prof.devXP=Math.max(0,xpAt(L)-real);else delete prof.devXP;if(!prof.devXP)delete prof.devXP;saveProf();devRefresh();
  toast(L?tl('已快轉到 Lv.{lv}',{lv:levelInfo(totalXP(entries)).lv}):tl('已恢復實際等級'))};
$('dvAchM').querySelectorAll('button').forEach(b=>b.onclick=()=>{if(b.dataset.m)prof.devAch=b.dataset.m;else delete prof.devAch;saveProf();devRefresh();
  toast(tl(b.dataset.m==='all'?'徽章暫時全部解鎖':b.dataset.m==='none'?'徽章暫時全部未解鎖':'徽章恢復實際進度'))});
/* 空白狀態：把紀錄收進另一個儲存位置，關閉時合併放回（期間新寫的紀錄也會保留） */
function devEmptyOff(){let st=[];try{st=JSON.parse(localStorage.getItem(DV_STASH)||'[]')||[]}catch(_){}
  const ids=new Set(entries.map(e=>e.id));entries=[...st.filter(e=>!ids.has(e.id)),...entries];if(!save())return false;
  try{localStorage.removeItem(DV_STASH)}catch(_){}delete prof.devEmpty;saveProf();return true}
$('swDvEmpty').onclick=async()=>{if(prof.devEmpty){if(devEmptyOff()){await phHydrate(entries);devRefresh();toast(tl('紀錄已放回'))}return}   /* 收起的紀錄裡照片是 idb: 參照，放回後再讀回來 */
  try{localStorage.setItem(DV_STASH,JSON.stringify(entries.map(phPack)))}catch(_){toast(tl('儲存空間不足，無法收起紀錄'));return}
  const n=entries.length;entries=[];save();prof.devEmpty=1;saveProf();devRefresh();toast(tl('已暫時收起 {n} 則紀錄',{n}))};
/* 模擬日期：儲存與實際時間的差，重新載入後由 005-dev-clock.js 套用 */
$('dvDateGo').onclick=()=>{const v=$('dvDate').value,tm=$('dvTime').value||'12:00';if(!v)return;const[y,m,d]=v.split('-').map(Number),[hh,mm]=tm.split(':').map(Number),R=window.__RealDate||Date;
  try{localStorage.setItem(DEV_CLOCK,String(new R(y,m-1,d,hh,mm).getTime()-R.now()))}catch(_){}location.reload()};
$('dvDateReset').onclick=()=>{try{localStorage.removeItem(DEV_CLOCK)}catch(_){}location.reload()};
function devPill(){if(!devOff())return;const n=new Date(),b=document.createElement('button');b.type='button';b.className='dv-pill';
  b.textContent=`${tl('模擬日期')}${SEP}${EN_UI?`${fmtMD(n)}, ${n.getFullYear()}`:`${n.getFullYear()}年${fmtMD(n)}`} ${pad(n.getHours())}:${pad(n.getMinutes())}`;b.onclick=devOpen;$('device').appendChild(b)}
/* 極端緯度：一鍵切換測試地區，原本的地區存在 devRegPrev，按「還原」放回 */
const DV_GEO=[{name:'赤道・基多（測試）',lat:-0.2,lon:-78.5},{name:'北極圈・特羅姆瑟（測試）',lat:69.6,lon:18.9},{name:'南極・麥克默多站（測試）',lat:-77.8,lon:166.7}];
$('dvGeo').querySelectorAll('[data-g]').forEach(b=>b.onclick=()=>{if(!('devRegPrev' in prof))prof.devRegPrev=prof.region||null;prof.region={...DV_GEO[+b.dataset.g]};saveProf();devRefresh();toast(tl('地區已切到{r}',{r:regName(prof.region)}))});
function devGeoReset(){if(!('devRegPrev' in prof))return;prof.region=prof.devRegPrev;delete prof.devRegPrev;saveProf()}
$('dvGeoReset').onclick=()=>{devGeoReset();devRefresh();toast(tl('地區已還原為{r}',{r:prof.region?regName(prof.region):tl('未設定')}))};
/* 字級放大：把所有 px 字級的規則複製一份放大版，疊在最後面（同權重、後者勝出，不改原本 CSS） */
function devFsApply(){const old=$('devFsStyle');if(old)old.remove();const s=prof.devFs||1;if(s===1)return;const out=[];
  const walk=(rules,pre)=>{for(const r of rules){
    if(!(r instanceof CSSStyleRule)){const p=r.media?`@media ${r.media.mediaText}`:r.conditionText!=null?`@supports ${r.conditionText}`:null;if(p&&r.cssRules)walk(r.cssRules,p);continue}   /* 一般樣式規則也有 cssRules（巢狀），要先判斷類型 */
    if(!r.selectorText)continue;const m=/^([\d.]+)px$/.exec(r.style.getPropertyValue('font-size').trim());if(!m)continue;
    const rule=`${r.selectorText}{font-size:${(+m[1]*s).toFixed(1)}px}`;out.push(pre?`${pre}{${rule}}`:rule)}};
  for(const sh of document.styleSheets){if(sh.ownerNode&&sh.ownerNode.id&&/^dev/.test(sh.ownerNode.id))continue;try{walk(sh.cssRules,'')}catch(_){}}   /* 外部字型樣式表無法讀取，略過 */
  const el=document.createElement('style');el.id='devFsStyle';el.textContent=out.join('\n');document.head.appendChild(el)}
$('dvFs').querySelectorAll('button').forEach(b=>b.onclick=()=>{prof.devFs=+b.dataset.s;saveProf();devFsApply();devRender();toast(prof.devFs===1?tl('字級已恢復'):tl('字級已放大為 {n} 倍',{n:prof.devFs}))});
/* 螢幕尺寸：電腦預覽的手機外框（320×568、375×667、390×844、430×932） */
const DV_FR={320:568,375:667,390:844,430:932};
function devFrameApply(){const w=+prof.devW||390,h=DV_FR[w]||844,old=$('devFrStyle');if(old)old.remove();window.devFrame={w,h};
  if(w!==390){const el=document.createElement('style');el.id='devFrStyle';el.textContent=`@media ${FRAME_MQ}{.device,.app{width:${w}px;height:${h}px}}`;document.head.appendChild(el)}fitDevice()}
$('dvW').querySelectorAll('button').forEach(b=>b.onclick=()=>{const w=+b.dataset.w;if(w===390)delete prof.devW;else prof.devW=w;saveProf();devFrameApply();devRender();
  toast(!isFrame()?tl('螢幕尺寸只在電腦預覽有效'):tl('外框已改為 {s}',{s:`${w}×${DV_FR[w]}`}))});
/* 動畫慢速：所有 CSS／Web 動畫的播放速度設為 0.25（引導頁星空 canvas 也會讀 devSlowK） */
let devSlowT=null;
window.devSlowK=1;
const devSweep=()=>document.getAnimations().forEach(a=>{a.playbackRate=window.devSlowK});
function devSlowApply(){window.devSlowK=prof.devSlow?.25:1;clearInterval(devSlowT);devSweep();if(prof.devSlow)devSlowT=setInterval(devSweep,250)}
['animationstart','transitionrun'].forEach(t=>document.addEventListener(t,()=>{if(prof.devSlow)devSweep()},true));
$('swDvSlow').onclick=()=>{prof.devSlow=!prof.devSlow;saveProf();devSlowApply();devRender();toast(tl(prof.devSlow?'動畫已放慢為 0.25 倍':'動畫已恢復正常速度'))};
/* 顯示觸控範圍：小於 44×44 的可點元素加上紅框（每 0.8 秒重新掃描，跟著畫面變化） */
const DV_TSEL='button,a[href],input:not([type=hidden]),select,textarea,summary,[role=button],[role=switch],[role=radio],[role=tab]';
let devTouchT=null,devTouchN=0;
function devTouchScan(){const dev=$('device');let n=0;
  dev.querySelectorAll(DV_TSEL).forEach(el=>{let s=false;
    if(prof.devTouch&&el.getClientRects().length&&!el.closest('[aria-hidden="true"]')){const w=el.offsetWidth,h=el.offsetHeight;s=!!w&&!!h&&(w<44||h<44)}
    el.classList.toggle('dv-small',s);if(s)n++});
  devTouchN=n;const sub=$('dvTouchSub');if(sub)sub.textContent=prof.devTouch?tl('目前畫面有 {n} 個小於 44px 的按鈕（紅框）',{n}):tl('用紅框標出小於 44px 的按鈕');return n}
function devTouchApply(){clearInterval(devTouchT);$('device').classList.toggle('dv-touch',!!prof.devTouch);devTouchScan();if(prof.devTouch)devTouchT=setInterval(devTouchScan,800)}
$('swDvTouch').onclick=()=>{prof.devTouch=!prof.devTouch;saveProf();devTouchApply();devRender();toast(prof.devTouch?tl('已標出 {n} 個小於 44px 的按鈕',{n:devTouchN}):tl('已關閉觸控範圍'))};
/* FPS 與效能：左上角顯示每秒影格數與 0.5 秒內最慢的一格 */
let devFpsRaf=0;
function devFpsApply(){cancelAnimationFrame(devFpsRaf);let el=$('dvFpsBox');if(!prof.devFps){if(el)el.remove();return}
  if(!el){el=document.createElement('div');el.id='dvFpsBox';el.className='dv-fps';el.setAttribute('aria-hidden','true');el.textContent='FPS …';$('device').appendChild(el)}
  let n=0,t0=performance.now(),last=t0,worst=0;
  const f=now=>{n++;worst=Math.max(worst,now-last);last=now;if(now-t0>=500){const fps=Math.round(n*1000/(now-t0));el.textContent=`${fps} FPS${SEP}${tl('最慢 {n} ms',{n:Math.round(worst)})}`;el.classList.toggle('bad',fps<45);n=0;t0=now;worst=0}devFpsRaf=requestAnimationFrame(f)};
  devFpsRaf=requestAnimationFrame(f)}
$('swDvFps').onclick=()=>{prof.devFps=!prof.devFps;saveProf();devFpsApply();devRender();toast(tl(prof.devFps?'已在左上角顯示 FPS':'已關閉 FPS 顯示'))};
/* 星座剪影總覽：88 個星座一次檢查，點一下開啟詳情；只有缺剪影的星座才標出來 */
function devFigs(){const ks=Object.keys(CON),W=160,H=120,miss=ks.filter(k=>!CFX[k]).length;
  $('dvFigSum').textContent=tl('共 {n} 個星座・點一下開啟詳情',{n:ks.length})+(miss?SEP+tl('{n} 個沒有剪影',{n:miss}):'')+(prof.noFig?SEP+tl('目前已關閉「顯示星座剪影」'):'');
  $('dvFigGrid').innerHTML=ks.map(k=>`<button type="button" class="dvf" data-k="${k}"><svg viewBox="0 0 ${W} ${H}" aria-hidden="true">${conSVG(k,W,H,12,0,null,{sc:.7,figP:1})}</svg><b>${CON[k].n}</b>${CFX[k]?'':`<small>${tl('無剪影')}</small>`}</button>`).join('');
  $('dvFigGrid').querySelectorAll('.dvf').forEach(b=>b.onclick=()=>openCon(b.dataset.k))}
$('liDvFigs').onclick=()=>{devFigs();$('devFigSheet').querySelector('.sb').scrollTop=0;openSheet('devFigSheet')};
/* 元件總覽：常用的圖示與元件集中在一頁比對 */
function devUi(){const sec=(t,h,cls='')=>`<h3 class="set-h">${t}</h3><div class="dvu panel ${cls}">${h}</div>`,cell=(a,b)=>`<div class="dvu-c">${a}<small>${b}</small></div>`;
  const cats=ACH_CAT.map(c=>[c,ACH.find(a=>(CR_CAT[a.id]||'write')===c[0])]).filter(x=>x[1]);
  $('dvUiBody').innerHTML=
    sec(tl('心情星星'),MOODS.map((m,i)=>cell(`<span class="dvu-moon">${moon(i)}</span>`,m.n)).join(''),'dvu5')
   +sec(tl('頭像'),AVATARS.map(k=>cell(`<span class="dvu-av">${avSVG(k)}</span>`,AVK[k]?AVK[k].n:k)).join(''))
   +sec(tl('階級徽章'),RANKS.map((r,i)=>cell(`<span class="dvu-rb">${rankBadge(i)}</span>`,`${tl(i===RANKS.length-1?'{n} 級以上':'{n} 級',{n:i+1})}${SEP}${r}`)).join(''))
   +sec(tl('徽章水晶（已解鎖・50%・未開始）'),cats.map(([c,a])=>cell(`<span class="dvu-cr">${crystal(a.id,true)}${crystal(a.id,false,50)}${crystal(a.id,false,0)}</span>`,c[1])).join(''),'dvu1')
   +sec(tl('按鈕'),`<div class="dvu-row"><button type="button" class="btn">${tl('一般')}</button><button type="button" class="btn primary">${tl('主要')}</button><button type="button" class="btn danger">${tl('危險')}</button></div>
      <div class="dvu-row"><button type="button" class="dv-go">${tl('小按鈕')}</button><button type="button" class="dv-go ghost">${tl('次要')}</button><button type="button" class="dv-go danger">${tl('刪除')}</button><button type="button" class="dv-go" disabled>${tl('停用')}</button></div>
      <div class="dvu-row"><button type="button" class="sw" role="switch" aria-checked="true" aria-label="${tl('開')}"></button><button type="button" class="sw" role="switch" aria-checked="false" aria-label="${tl('關')}"></button><div class="dv-seg" role="group" aria-label="${tl('分段')}"><button type="button" aria-pressed="true">${EN_UI?1:tlz('一')}</button><button type="button">${EN_UI?2:tlz('二')}</button><button type="button">${EN_UI?3:tlz('三')}</button></div></div>`,'dvu1')
   +sec(tl('文字'),`<div class="dvu-type"><p style="font-size:24px;font-weight:700">${tl('標題 24・星空日記')}</p><p style="font-size:17px;font-weight:600">${tl('次標題 17・今天點亮了一顆星')}</p><p style="font-size:15px">${tl('內文 15・寫下今天的小事，累積成一整片星空。')}</p><p style="font-size:13px;color:var(--muted)">${tl('說明 13・只存在這台裝置')}</p><p style="font-size:11px;color:var(--muted)">${tl('註記 11・LV.12 ✦ 1,234 XP')}</p></div>`,'dvu1')
   +`<h3 class="set-h">${tl('列表')}</h3><div class="list panel"><div class="li"><span class="li-l"><i class="li-ic" style="--ic:#6FA8FF"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8"/></svg></i><span>${tl('列表項目')}<small>${tl('附加說明文字，太長時會換行，檢查行距與對齊是否正確')}</small></span></span><span class="chev" aria-hidden="true">›</span></div><div class="li"><span>${tl('只有文字')}</span><span class="li-v">${tl('數值')}</span></div></div>`;
  $('dvUiBody').querySelectorAll('.dvu .sw,.dvu .dv-seg button').forEach(b=>b.onclick=()=>{if(b.classList.contains('sw'))b.setAttribute('aria-checked',b.getAttribute('aria-checked')!=='true');else b.parentNode.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',x===b))})}
$('liDvUi').onclick=()=>{devUi();$('dvUiBody').scrollTop=0;openSheet('devUiSheet')};
/* 資料檢視器：列出 localStorage 的每個項目，展開看格式化的內容（照片以大小代替），可複製原始資料 */
const DV_KN={'orbitlog.entries.v1':'日記紀錄','orbitlog.profile.v1':'個人資料與設定','orbitlog.reviews.v1':'回顧紀錄','orbitlog.draft.v1':'未完成的草稿','orbitlog.seeded.v1':'已放入範例紀錄','novaday.dev.dateOffset':'模擬日期','novaday.dev.errors':'錯誤紀錄','novaday.dev.stash':'空白狀態收起的紀錄'};
function devCopy(t){const fb=()=>{const a=document.createElement('textarea');a.value=t;a.style.cssText='position:fixed;opacity:0';document.body.appendChild(a);a.select();let ok=false;try{ok=document.execCommand('copy')}catch(_){}a.remove();toast(tl(ok?'已複製到剪貼簿':'無法複製，請手動選取'))};
  if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(t).then(()=>toast(tl('已複製到剪貼簿')),fb);else fb()}
function devPretty(v){try{return JSON.stringify(JSON.parse(v),(k,x)=>typeof x==='string'&&x.startsWith('data:')&&x.length>200?`[${x.slice(5,x.indexOf(';'))}・${dvKB(Math.round(x.length*.75))}]`:x,2)}catch(_){return v}}
function devStore(){const L=[];try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);L.push({k,v:localStorage.getItem(k)||''})}}catch(_){}
  L.sort((a,b)=>b.v.length-a.v.length);const tot=L.reduce((s,x)=>s+(x.k.length+x.v.length)*2,0);
  $('dvStSum').textContent=tl('共 {n} 個項目・約 {s}（影片另存在 IndexedDB）・點一下展開',{n:L.length,s:dvKB(tot)});
  $('dvStList').innerHTML=L.length?L.map((x,i)=>`<details class="dvs" data-i="${i}"><summary><span><b>${esc(DV_KN[x.k]?tl(DV_KN[x.k]):x.k)}</b><small>${esc(x.k)}</small></span><em>${dvKB(x.v.length*2)}</em></summary><div class="dv-ctl"><button type="button" class="dv-go" data-copy="${i}">${tl('複製原始資料')}</button></div><pre></pre></details>`).join(''):`<p class="dv-empty">${tl('沒有儲存任何資料')}</p>`;
  $('dvStList').querySelectorAll('details').forEach(d=>{const x=L[+d.dataset.i];
    d.ontoggle=()=>{if(!d.open||d._f)return;d._f=1;const t=devPretty(x.v),M=20000;d.querySelector('pre').textContent=t.length>M?t.slice(0,M)+'\n…'+tl('（還有 {n} 字，請用「複製原始資料」查看全部）',{n:(t.length-M).toLocaleString()}):t};
    d.querySelector('[data-copy]').onclick=()=>devCopy(x.v)})}
$('liDvStore').onclick=()=>{devStore();$('devStoreSheet').querySelector('.sb').scrollTop=0;openSheet('devStoreSheet')};
/* 錯誤紀錄：000-error-overlay.js 會把錯誤存進 novaday.dev.errors（最多 30 筆） */
function devErrRender(){const L=devErrs();
  $('dvErrList').innerHTML=L.length?L.map(e=>{const d=new Date(e.t);return `<div class="dve"><small>${fmtMDY(d)} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}${e.s?SEP+esc(e.s):''}</small><code>${esc(e.m)}</code></div>`}).join(''):`<p class="dv-empty">${tl('目前沒有錯誤紀錄 ✦')}</p>`;
  $('dvErrClr').disabled=$('dvErrCopy').disabled=!L.length}
$('liDvErr').onclick=()=>{devErrRender();openSheet('devErrSheet')};
$('dvErrTest').onclick=()=>{setTimeout(()=>{throw new Error(tl('這是開發者工具產生的測試錯誤'))});setTimeout(()=>{devErrRender();devRender()},80)};
$('dvErrCopy').onclick=()=>devCopy(devErrs().map(e=>`${new Date(e.t).toISOString()} ${e.s||''} ${e.m}`).join('\n'));
$('dvErrClr').onclick=()=>{try{localStorage.removeItem(DV_ERR)}catch(_){}const b=$('errBox');if(b)b.remove();devErrRender();devRender();toast(tl('已清除錯誤紀錄'))};
/* 重設開發者工具（「重設個人資料與設定」「完全初始化」在一般設定的「重設」裡，見 backup/wipe.js） */
function devResetTools(){if(prof.devEmpty)devEmptyOff();devGeoReset();entries=entries.filter(e=>!e.dev);save();
  ['devFs','devSlow','devXP','devAch','devTouch','devFps','devW','devOnb','noFig'].forEach(k=>delete prof[k]);saveProf();
  try{[DEV_CLOCK,DV_ERR].forEach(k=>localStorage.removeItem(k))}catch(_){}}
$('dvInitDev').onclick=async()=>{const k=await ask(tl('重設開發者工具？'),tl('關閉這頁所有的模擬與檢查（日期、地區、等級、徽章、字級、外框等），並移除測試紀錄。你的日記與個人資料不受影響。'),[{k:'cancel',t:tl('取消')},{k:'ok',t:tl('重設並重新載入')}]);
  if(k!=='ok')return;devResetTools();location.reload()};
/* 隱藏入口：預設不顯示開發者選項，在「版本資訊」連點版本號碼 7 次開啟 */
function devSecSync(){$('devSecH').hidden=$('devSec').hidden=!prof.devOn}
if(prof.devOn==null&&(prof.devOnb||prof.noFig||prof.devFs>1||prof.devSlow||devOff())){prof.devOn=1;saveProf()}
/* 已經用過開發者工具的人，保持顯示 */
let abTap=0,abAt=0;
$('abVer').onclick=()=>{const t=Date.now();abTap=t-abAt<1500?abTap+1:1;abAt=t;
  if(prof.devOn){if(abTap>=3)toast(tl('開發者選項已經開啟，在「設定」最下方'));return}
  const left=7-abTap;if(left<=0){prof.devOn=1;saveProf();devSecSync();abTap=0;buzz(20);toast(tl('已開啟開發者選項，在「設定」最下方'),3000)}else if(abTap>=3)toast(tl('再點 {n} 次即可開啟開發者選項',{n:left}),1200)};
$('dvHide').onclick=()=>{prof.devOn=0;saveProf();devSecSync();closeSheet('devSheet');toast(tl('已隱藏開發者選項・在「版本資訊」連點版本號碼 7 次可再次開啟'),3600)};
$('liDev').onclick=devOpen;
devSecSync();
devFsApply();
devSlowApply();
devFrameApply();
devTouchApply();
devFpsApply();
devPill();
