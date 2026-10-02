/* 日記頁：列表／月曆切換、顯示模式 */
let logView='list';
function setLogView(v,quiet){logView=v;const cal=v==='cal';$('logList').hidden=cal;$('calWrap').hidden=!cal;$('listCtl').hidden=cal;
  if(!cal)$('calToday').hidden=true;else renderCal();
  document.querySelectorAll('#s-log .seg [data-v]').forEach(b=>b.setAttribute('aria-selected',b.dataset.v===v));$('s-log').querySelector('.seg').classList.toggle('r',cal);
  requestAnimationFrame(()=>{$('s-log').style.setProperty('--logTop',$('logTop').offsetHeight+'px');if(cal)drawCalLines()});if(!quiet)$('s-log').scrollTop=0}
document.querySelectorAll('#s-log .seg [data-v]').forEach(b=>b.onclick=()=>setLogView(b.dataset.v));
$('logMode').querySelectorAll('[data-d]').forEach(x=>x.onclick=()=>{const v=x.dataset.d==='1';if(!!prof.logCompact===v)return;prof.logCompact=v;saveProf();renderLog()});
