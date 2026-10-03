/* 「我的」頁：整頁繪製與點擊 */
function renderMe(){renderInsights();renderFootprint();renderTagCnt();renderStoreRow();if($('rpOpenT'))$('rpOpenT').textContent=`${new Date().getMonth()+1} 月星空報告`;
  const xp=totalXP(entries),{lv,rest,need}=levelInfo(xp),u=unlocked(entries);
  const first=entries.map(e=>e.date).concat(prof.since?[prof.since]:[]).sort()[0]||ymd(new Date());
  const pct=pctDone(rest/need);
  $('regionVal').textContent=prof.region?prof.region.name.replace(/（.*）/,''):'未設定';
  $('topAvatar').innerHTML=avHTML(prof.avatar);$('pAvatar').innerHTML=avHTML(prof.avatar);$('pLv').innerHTML=`<small>LV</small>${lv}`;
  $('pProg').style.strokeDasharray=`${pct} 100`;{const a=pct/100*Math.PI*2-Math.PI/2;$('pDot').setAttribute('cx',(60+49*Math.cos(a)).toFixed(2));$('pDot').setAttribute('cy',(60+49*Math.sin(a)).toFixed(2))}
  $('pAvRing').querySelectorAll('.tk').forEach(t=>t.classList.toggle('on',(+t.dataset.t)/36<pct/100));
  $('pAvRing').setAttribute('aria-label',`${avLabel(prof.avatar)} 頭像，等級 ${lv}，本級經驗值 ${pct}%`);
  $('pName').textContent=prof.name||'星旅人';$('pMotto').textContent=prof.motto||'';$('pMotto').hidden=!prof.motto;

  const ri=rankIdx(lv),RC=RINFO[ri].c;
  $('pRankChip').innerHTML=`<span>${RANKS[ri]}</span>`;if($('pRb').dataset.r!=String(ri)){$('pRb').innerHTML=rankBadge(ri);$('pRb').dataset.r=ri}
  $('pRankChip').style.setProperty('--rb',hexA(RC,.45));$('pRankChip').setAttribute('aria-label',`目前階級：${RANKS[ri]}，查看下一階`);
  renderRanks(xp,lv);
  {const day=starDay();$('pDay').innerHTML=`<span class="hd-ic" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M15.6 4.2a7.6 7.6 0 1 0 4.2 11.4A6.1 6.1 0 0 1 15.6 4.2z"/><path class="s" d="M18.6 3.2l.55 1.45 1.45.55-1.45.55-.55 1.45-.55-1.45-1.45-.55 1.45-.55z"/></svg></span><span class="hd-t">觀星第</span><b>${day}</b><span class="hd-t">天</span>`;$('pDay').setAttribute('aria-label',`觀星第 ${day} 天`)}
  {const zi=signIdx(prof.birthday);$('pSign').innerHTML=zi<0?`${STAR4} 設定星座`:`${zg(zi)} ${ZODIAC[zi].n}`;$('pSign').setAttribute('aria-label',zi<0?'設定生日以顯示星座':`${ZODIAC[zi].n}，查看性格與本月運勢`)}
  $('pXpText').innerHTML=`<b>${rest}</b> / ${need} XP・還差 ${need-rest} 升到 Lv.${lv+1}`;
  $('stTotal').textContent=entries.length;$('stWords').textContent=entries.reduce((s,e)=>s+chars(e),0).toLocaleString();$('stBest').textContent=bestStreak(entries);
  $('stPhotos').textContent=entries.filter(hasMedia).length;$('stLocs').textContent=new Set(entries.filter(e=>e.loc).map(e=>e.loc)).size;$('stXP').textContent=xp.toLocaleString();
  renderEnergy();
  $('aCount').textContent=`已解鎖 ${u.length} / ${ACH.length}`;
  /* 預設只顯示已解鎖＋最接近完成的 3 個，其餘收起 */
  const AL=ACH.map(a=>{const on=u.includes(a.id),[c,t]=ACHP[a.id](entries);return{a,on,c,t,r:Math.min(c,t)/t}});
  /* 收合時：已解鎖＋最接近完成的 3～5 個，總數補成 3 的倍數，排列才會整齊 */
  const nOn=AL.filter(x=>x.on).length,nNear=Math.min(AL.length-nOn,3+(3-(nOn+3)%3)%3);
  const near=new Set(AL.filter(x=>!x.on).sort((x,y)=>y.r-x.r).slice(0,nNear).map(x=>x.a.id));
  const shown=achAll?AL:AL.filter(x=>x.on||near.has(x.a.id)),hiddenN=AL.length-shown.length;
  let lastCat=null;
  $('achList').innerHTML=shown.map(({a})=>{const on=u.includes(a.id),[c,t]=ACHP[a.id](entries),p=on?100:Math.min(99,Math.round(Math.min(c,t)/t*100)),cat=CR_CAT[a.id]||'write',hd=achAll&&cat!==lastCat?achCatHead(cat,AL):'';lastCat=cat;
    return `${hd}<div data-c="${cat}" class="medal${on?'':' locked'}${(prof.achNew||[]).includes(a.id)?' is-new':''}" role="button" tabindex="0" data-a="${a.id}" aria-label="${a.n}，${a.d}，${on?'已解鎖':`進度 ${Math.min(c,t)} / ${t}`}"><div class="em" aria-hidden="true">${crystal(a.id,on,p)}</div><span class="mn">${a.n}</span><small>${a.d}</small>
      <span class="mp">${on?'✦ 已解鎖':`${Math.min(c,t).toLocaleString()} / ${t.toLocaleString()}`}</span></div>`}).join('');
  /* 點一下徽章：打開徽章詳情 */
  $('achList').querySelectorAll('.medal').forEach(m=>{m.onclick=()=>{achPrevP=null;openAch(m.dataset.a)};m.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openAch(m.dataset.a)}}});
  /* 下一個目標：最接近完成、還沒解鎖的徽章 */
  {const nx=AL.filter(x=>!x.on).sort((x,y)=>y.r-x.r||(x.t-x.c)-(y.t-y.c))[0],b=$('achNext');
    if(!nx){b.hidden=true}else{const {a,c,t}=nx,p=Math.min(99,Math.round(Math.min(c,t)/t*100));b.hidden=false;b.style.setProperty('--c',CR_COL[CR_CAT[a.id]||'write'][0]);
      b.innerHTML=`<span class="an-ic">${crystal(a.id,false,p)}</span><span class="an-t"><small>下一個目標</small><b>${esc(a.n)}</b><span>${achLeft(a.id,t-Math.min(c,t))}</span><span class="an-bar"><i style="width:${Math.max(4,p)}%"></i></span></span>`;
      b.setAttribute('aria-label',`下一個目標：${a.n}，${achLeft(a.id,t-Math.min(c,t))}`);
      b.onclick=()=>{achPrevP=null;openAch(a.id)}}}
  $('achMore').hidden=!achAll&&!hiddenN;$('achMore').textContent=achAll?'收起':`查看全部 ${AL.length} 個徽章`;
  $('swRemind').setAttribute('aria-checked',!!prof.remind);$('remindTime').value=prof.remindTime||'21:00';$('remindTime').disabled=!prof.remind;$('liTime').hidden=!prof.remind;$('liTime').classList.toggle('off',!prof.remind);
  $('swCalm').setAttribute('aria-checked',!!prof.calm);if(typeof renderClock==='function')renderClock();$('swObDev').setAttribute('aria-checked',!!prof.devOnb);$('swFig').setAttribute('aria-checked',!prof.noFig);
}
$('liEdit').onclick=()=>openMeEdit();
$('achMore').onclick=()=>{achAll=!achAll;renderMe()};
$('pAvRing').style.cursor='pointer';
$('pAvRing').onclick=()=>openMeEdit();
$('pName').onclick=()=>openMeEdit();
$('pSign').onclick=()=>signIdx(prof.birthday)<0?openBdQuick():openFortune();
$('openMe').onclick=()=>go('me');
/* 觀星第幾天：從第一則紀錄（或開始使用的日子）算起，今天算第 N 天 */
function starDay(){const t=ymd(new Date()),first=entries.map(e=>e.date).concat(prof.since?[prof.since]:[]).sort()[0]||t;return Math.round((parse(t)-parse(first))/864e5)+1}
