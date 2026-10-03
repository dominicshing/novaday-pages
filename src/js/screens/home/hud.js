/* 首頁 HUD：等級、經驗值、連續天數 */
function renderHUD(){const {lv,rest,need}=levelInfo(totalXP(entries)),pct=rest/need;
  $('lvNum').textContent=lv;$('rankName').innerHTML=`${rankOf(lv)}<span class="rk-lv">・Lv.${lv}</span>`;$('xpFill').style.width=(pct*100).toFixed(1)+'%';
  $('lvProg').style.strokeDasharray=`${(pct*100).toFixed(2)} 100`;
  const a=pct*Math.PI*2-Math.PI/2;$('lvDot').setAttribute('cx',(34+27*Math.cos(a)).toFixed(2));$('lvDot').setAttribute('cy',(34+27*Math.sin(a)).toFixed(2));
    $('lvRing').setAttribute('aria-label',`等級 ${lv}，本級經驗值 ${pctDone(pct)}%`);
  $('xpNow').textContent=rest;$('xpNeed').textContent=`/ ${need}`;
  const nr=rankOf(lv+1);$('xpNext').innerHTML=nr!==rankOf(lv)?`還差 ${need-rest} XP 晉升<em>「${nr}」</em>`:`還差 ${need-rest} XP 升到 Lv.${lv+1}`;
  const si=streakOf(entries);$('streak').textContent=si.n;$('flameIc').classList.toggle('off',!si.n);$('fuelBtn').classList.toggle('off',!si.n);
  /* 本週七天：已記錄／休息日／今天／未來 */
  const days=new Set(entries.map(e=>e.date)),today=ymd(new Date()),mon=parse(weekKey(new Date()));let w='';
  for(let d=0;d<7;d++){const x=new Date(mon);x.setDate(x.getDate()+d);const k=ymd(x);
    const cls=[days.has(k)?'done':'',si.restDays.includes(k)?'rest':'',k===today?'today':'',k>today?'future':''].filter(Boolean).join(' ');
    const st=days.has(k)?'已記錄':si.restDays.includes(k)?'休息日':k===today?'今天還沒寫':k>today?'':'沒有紀錄';
    w+=`<div class="wd ${cls}" title="${WD[x.getDay()]}${st?'：'+st:''}" aria-label="星期${WD[x.getDay()]}${st?'，'+st:''}"><i>${WD[x.getDay()]}</i></div>`}
  w+=`<div class="ri${si.restUsed?' used':''}">${si.n?(si.restUsed?'本週休息日已用':'本週可休息 1 天'):(entries.length?'寫一則重新點亮':'點亮你的第一顆星')}</div>`;
  $('weekRow').innerHTML=w}
$('atlasBtn').onclick=()=>openAtlas();
$('fuelBtn').onclick=()=>toast('每週可以休息 1 天，連續紀錄不會中斷；連續兩天沒寫才會歸零',3600);
