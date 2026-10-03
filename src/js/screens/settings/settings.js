/* 設定頁：開關、提醒、紅光模式（目前隱藏）、減少動態、範例紀錄 */
$('editMe').onclick=()=>openSheet('settingsSheet');
$('swRemind').onclick=()=>{prof.remind=!prof.remind;saveProf();renderMe();toast(prof.remind?`已開啟每日提醒（${prof.remindTime}）`:'已關閉每日提醒')};
$('remindTime').onchange=e=>{prof.remindTime=e.target.value;saveProf()};
function applyCalm(){reduce=sysReduce||!!prof.calm;try{['crDefs','fabSvg'].forEach(id=>{const d=$(id);if(d)reduce?d.pauseAnimations():d.unpauseAnimations()})}catch(_){}$('app').classList.toggle('calm',!!prof.calm);reduce?skyApi.still():skyApi.start();if(reduce){galStop();placeGal()}else galStart()}
/* 紅光夜視模式：目前隱藏（設定列與星座頁的按鈕都不顯示，一律關閉）；改成 true 即可恢復 */
const SHOW_RED=false;
function applyRed(){const on=SHOW_RED&&!!prof.red;$('liRed').hidden=!SHOW_RED;$('device').classList.toggle('red',on);$('swRed').setAttribute('aria-checked',on);document.querySelectorAll('.red-q').forEach(b=>b.setAttribute('aria-pressed',!!prof.red))}
function toggleRed(){prof.red=!prof.red;saveProf();applyRed();toast(prof.red?'已開啟紅光夜視模式':'已關閉紅光夜視模式')}
$('swRed').onclick=toggleRed;
$('swCalm').onclick=()=>{prof.calm=!prof.calm;saveProf();applyCalm();renderMe()};
$('liAbout').onclick=()=>openSheet('aboutSheet');
$('swFig').onclick=()=>{prof.noFig=!prof.noFig;saveProf();renderMe();render();toast(prof.noFig?'已隱藏星座剪影':'已顯示星座剪影')};
$('swObDev').onclick=()=>{prof.devOnb=!prof.devOnb;saveProf();renderMe();toast(prof.devOnb?'下次開啟 App 時會顯示引導':'已關閉引導預覽')};
$('liWipe').onclick=openWipe;
$('liSamples').onclick=async()=>{const n=entries.filter(isSample).length;const k=await ask('清除範例紀錄？',`會移除 ${n} 則範例紀錄，你自己寫的紀錄不受影響。`,[{k:'cancel',t:'取消'},{k:'ok',t:'清除範例',cls:'danger'}]);
  if(k!=='ok')return;entries=entries.filter(e=>!isSample(e));save();render();toast('已清除範例紀錄')};
/* 設定：清除範例紀錄 */
function renderSampleRow(){const n=entries.filter(isSample).length,r=$('liSamples');if(!r)return;r.hidden=!n;r.querySelector('small').textContent=`目前有 ${n} 則範例，清除後不影響你自己寫的紀錄`}
