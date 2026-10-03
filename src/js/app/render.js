/* 重新繪製所有畫面 */
function render(){XPM=xpMap(entries);renderAchDot();renderQuick();renderMemory();renderReportCard();if(typeof renderSampleRow==='function')renderSampleRow();if(cur==='atlas')renderAtlas();renderHUD();renderAppBar();renderGalaxy();renderFortuneCard();renderMissions();renderLog();renderCal();renderMe();renderDraftBar()}
/* 跨日：App 放在背景過夜、隔天回到前景（或一直開著過了午夜）時，「今天」相關的內容
   （日期、今日卡片、任務、連續天數、月曆的今天）重新整理；正在看的月曆如果是上個月，跟著換到這個月 */
let renderedDay=ymd(new Date());
function dayCheck(){const d=ymd(new Date());if(d===renderedDay)return;const prev=parse(renderedDay);renderedDay=d;
  if(typeof calMonth!=='undefined'&&calMonth.getFullYear()===prev.getFullYear()&&calMonth.getMonth()===prev.getMonth()){const n=new Date();calMonth=new Date(n.getFullYear(),n.getMonth(),1)}
  if(typeof selDate!=='undefined'&&selDate===ymd(prev))selDate=d;
  render()}
document.addEventListener('visibilitychange',()=>{if(!document.hidden)dayCheck()});
setInterval(dayCheck,60000);
