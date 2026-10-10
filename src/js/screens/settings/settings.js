/* 設定頁：開關、提醒、紅光模式（目前隱藏）、減少動態、範例紀錄 */
$('editMe').onclick=()=>openSheet('settingsSheet');
$('swRemind').onclick=()=>{prof.remind=!prof.remind;saveProf();renderMe();toast(prof.remind?tl('已開啟每日提醒（{t}）',{t:fmtTime(prof.remindTime)}):tl('已關閉每日提醒'))};
/* 清空或格式不對就還原成原本的時間，不存空值 */
$('remindTime').onchange=e=>{const v=e.target.value;if(!/^([01]\d|2[0-3]):[0-5]\d$/.test(v)){e.target.value=prof.remindTime;return}
  if(v===prof.remindTime)return;prof.remindTime=v;saveProf();toast(tl('提醒時間改為 {t}',{t:fmtTime(v)}))};
function applyCalm(){reduce=sysReduce||!!prof.calm;try{['crDefs','fabSvg'].forEach(id=>{const d=$(id);if(d)reduce?d.pauseAnimations():d.unpauseAnimations()})}catch(_){}$('app').classList.toggle('calm',!!prof.calm);$('device').classList.toggle('calm',!!prof.calm);reduce?skyApi.still():skyApi.start();if(reduce){galStop();placeGal()}else galStart()}
/* 紅光夜視模式：目前隱藏（設定列與星座頁的按鈕都不顯示，一律關閉）；改成 true 即可恢復 */
const SHOW_RED=false;
function applyRed(){const on=SHOW_RED&&!!prof.red;$('liRed').hidden=!SHOW_RED;$('device').classList.toggle('red',on);$('swRed').setAttribute('aria-checked',on);document.querySelectorAll('.red-q').forEach(b=>b.setAttribute('aria-pressed',!!prof.red))}
function toggleRed(){prof.red=!prof.red;saveProf();applyRed();toast(tl(prof.red?'已開啟紅光夜視模式':'已關閉紅光夜視模式'))}
$('swRed').onclick=toggleRed;
/* 時間格式：12 小時制（預設）或 24 小時制 */
function renderClock(){const c24=!!prof.clock24;$('clk12').setAttribute('aria-checked',!c24);$('clk24').setAttribute('aria-checked',c24);$('clockEx').textContent=c24?'21:30':fmtTime('21:30')}
['clk12','clk24'].forEach(id=>$(id).onclick=()=>{const v=id==='clk24';if(!!prof.clock24===v)return;if(v)prof.clock24=true;else delete prof.clock24;saveProf();renderClock();render();toast(tl(v?'已改成 24 小時制':'已改成 12 小時制'))});
$('swCalm').onclick=()=>{prof.calm=!prof.calm;saveProf();applyCalm();renderMe();toast(tl(prof.calm?'已開啟減少動態效果':'已關閉減少動態效果'))};
$('liAbout').onclick=()=>openSheet('aboutSheet');
$('swFig').onclick=()=>{prof.noFig=!prof.noFig;saveProf();renderMe();render();toast(tl(prof.noFig?'已隱藏星座剪影':'已顯示星座剪影'))};
$('swObDev').onclick=()=>{prof.devOnb=!prof.devOnb;saveProf();renderMe();toast(tl(prof.devOnb?'下次開啟 App 時會顯示引導':'已關閉引導預覽'))};
$('liWipe').onclick=()=>openWipe('entries');$('liResetProf').onclick=()=>openWipe('prof');$('liInitAll').onclick=()=>openWipe('all');
$('liSamples').onclick=async()=>{const n=entries.filter(isSample).length;const k=await ask(tl('清除範例紀錄？'),tl('會移除 {n} 則範例紀錄，你自己寫的紀錄不受影響。',{n}),[{k:'cancel',t:tl('取消')},{k:'ok',t:tl('清除範例'),cls:'danger'}]);
  if(k!=='ok')return;entries=entries.filter(e=>!isSample(e));save();render();toast(tl('已清除範例紀錄'))};
/* 設定：清除範例紀錄 */
function renderSampleRow(){const n=entries.filter(isSample).length,r=$('liSamples');if(!r)return;r.hidden=!n;r.querySelector('small').textContent=tl('目前有 {n} 則，不影響你自己寫的紀錄',{n})}
