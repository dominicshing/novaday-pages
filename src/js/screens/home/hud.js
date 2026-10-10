/* 首頁 HUD：等級、經驗值、連續天數 */
function renderHUD(){const {lv,rest,need}=levelInfo(totalXP(entries)),pct=rest/need;
  $('lvNum').textContent=lv;$('rankName').innerHTML=`${rankOf(lv)}<span class="rk-lv">・Lv.${lv}</span>`;$('xpFill').style.width=(pct*100).toFixed(1)+'%';
  $('lvProg').style.strokeDasharray=`${(pct*100).toFixed(2)} 100`;
  const a=pct*Math.PI*2-Math.PI/2;$('lvDot').setAttribute('cx',(34+27*Math.cos(a)).toFixed(2));$('lvDot').setAttribute('cy',(34+27*Math.sin(a)).toFixed(2));
    $('lvRing').setAttribute('aria-label',tl('等級 {lv}，本級經驗值 {p}%',{lv,p:pctDone(pct)}));
  $('xpNow').textContent=rest;$('xpNeed').textContent=`/ ${need}`;
  const nr=rankOf(lv+1);$('xpNext').innerHTML=nr!==rankOf(lv)?tl('還差 {n} XP 晉升<em>「{r}」</em>',{n:need-rest,r:nr}):tl('還差 {n} XP 升到 Lv.{lv}',{n:need-rest,lv:lv+1});
  const si=streakOf(entries);$('streak').textContent=si.n;$('streak').nextElementSibling.textContent=EN_UI?(si.n===1?'day':'days'):tlz('天');$('flameIc').classList.toggle('off',!si.n);$('fuelBtn').classList.toggle('off',!si.n);
  /* 本週七天：已記錄／休息日／今天／未來 */
  const days=new Set(entries.map(e=>e.date)),today=ymd(new Date()),mon=parse(weekKey(new Date()));let w='';
  for(let d=0;d<7;d++){const x=new Date(mon);x.setDate(x.getDate()+d);const k=ymd(x);
    const cls=[days.has(k)?'done':'',si.restDays.includes(k)?'rest':'',k===today?'today':'',k>today?'future':''].filter(Boolean).join(' ');
    const st=tl(days.has(k)?'已記錄':si.restDays.includes(k)?'休息日':k===today?'今天還沒寫':k>today?'':'沒有紀錄');
    w+=`<div class="wd ${cls}" title="${EN_UI?WDS_EN[x.getDay()]:WD[x.getDay()]}${st?tl('：')+st:''}" aria-label="${wdLong(x.getDay())}${st?tl('，')+st:''}"><i>${WD[x.getDay()]}</i></div>`}
  w+=`<div class="ri${si.restUsed?' used':''}">${tl(si.n?(si.restUsed?'本週休息日已用':'本週可休息 1 天'):(entries.length?'寫一則重新點亮':'點亮你的第一顆星'))}</div>`;
  $('weekRow').innerHTML=w}
$('atlasBtn').onclick=()=>openAtlas();
$('fuelBtn').onclick=()=>toast(tl('每週可以休息 1 天，連續紀錄不會中斷；連續兩天沒寫才會歸零'),3600);
