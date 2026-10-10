/* 首頁頂部列與捲動後的精簡列 */
function renderAppBar(){const n=new Date(),hr=n.getHours(),g=tl(hr>=5&&hr<11?'早安':hr<18&&hr>=11?'午安':hr>=18&&hr<23?'晚安':'夜深了');
  const name=prof.name||tl('星旅人'),gt=`${g}${tl('，')}${name}`;$('greet').textContent=gt;$('greet').title=gt;
  $('stardate').innerHTML=`<span>${esc(fmtDay(ymd(n)))}</span>`;
  /* 頭像右下角：目前已解鎖的最高階級徽章 */
  const ri=rankIdx(levelInfo(totalXP(entries)).lv);if($('avRank').dataset.r!=String(ri)){$('avRank').innerHTML=rankBadge(ri);$('cbRank').innerHTML=rankBadge(ri);$('avRank').dataset.r=ri}
  $('openMe').setAttribute('aria-label',tl('我的檔案・目前階級：{r}',{r:RANKS[ri]}));$('cbAv').setAttribute('aria-label',tl('我的檔案')+SEP+RANKS[ri]);
  $('topAvatar').innerHTML=avHTML(prof.avatar);$('cbAvE').innerHTML=avHTML(prof.avatar);
  $('cbDate').innerHTML=`${EN_UI?fmtMD(n):`${n.getMonth()+1} 月 ${n.getDate()} 日`}<small>${wdShort(n.getDay())}</small>`;$('cbDate').setAttribute('aria-label',tl('今天 {d}，打開日記月曆',{d:EN_UI?fmtDay(ymd(n)):`${n.getMonth()+1} 月 ${n.getDate()} 日${wdLong(n.getDay())}`}))}
function syncCompact(){$('compactBar').classList.toggle('show',cur==='home'&&$('s-home').scrollTop>64)}
$('s-home').addEventListener('scroll',syncCompact,{passive:true});
$('cbTitle').onclick=()=>$('s-home').scrollTo({top:0,behavior:reduce?'auto':'smooth'});
$('cbAv').onclick=()=>go('me');
$('cbDate').onclick=()=>go('log','cal');
