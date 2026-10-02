/* 首頁頂部列與捲動後的精簡列 */
function renderAppBar(){const n=new Date(),hr=n.getHours(),g=hr>=5&&hr<11?'早安':hr<18&&hr>=11?'午安':hr>=18&&hr<23?'晚安':'夜深了';
  const name=prof.name||'星旅人';$('greet').textContent=`${g}，${name}`;$('greet').title=`${g}，${name}`;
  const first=entries.map(e=>e.date).concat(prof.since?[prof.since]:[]).sort()[0]||ymd(n),day=Math.round((parse(ymd(n))-parse(first))/864e5)+1;
  $('stardate').innerHTML=`<span>${n.getMonth()+1} 月 ${n.getDate()} 日・星期${WD[n.getDay()]}</span>`;$('htDay').innerHTML=`<span class="hd-ic" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M15.6 4.2a7.6 7.6 0 1 0 4.2 11.4A6.1 6.1 0 0 1 15.6 4.2z"/><path class="s" d="M18.6 3.2l.55 1.45 1.45.55-1.45.55-.55 1.45-.55-1.45-1.45-.55 1.45-.55z"/></svg></span><span class="hd-t">第</span><b>${day}</b><span class="hd-t">天</span>`;$('htDay').setAttribute('aria-label',`觀星第 ${day} 天`);
  /* 頭像右下角：目前已解鎖的最高階級徽章 */
  const ri=rankIdx(levelInfo(totalXP(entries)).lv);if($('avRank').dataset.r!=String(ri)){$('avRank').innerHTML=rankBadge(ri);$('cbRank').innerHTML=rankBadge(ri);$('avRank').dataset.r=ri}
  $('openMe').setAttribute('aria-label',`我的檔案・目前階級：${RANKS[ri]}`);$('cbAv').setAttribute('aria-label',`我的檔案・${RANKS[ri]}`);
  $('topAvatar').innerHTML=avHTML(prof.avatar);$('cbAvE').innerHTML=avHTML(prof.avatar);
  $('cbDate').innerHTML=`${n.getMonth()+1} 月 ${n.getDate()} 日<small>週${WD[n.getDay()]}</small>`;$('cbDate').setAttribute('aria-label',`今天 ${n.getMonth()+1} 月 ${n.getDate()} 日星期${WD[n.getDay()]}，打開日記月曆`)}
function syncCompact(){$('compactBar').classList.toggle('show',cur==='home'&&$('s-home').scrollTop>64)}
$('s-home').addEventListener('scroll',syncCompact,{passive:true});
$('cbTitle').onclick=()=>$('s-home').scrollTo({top:0,behavior:reduce?'auto':'smooth'});
$('cbAv').onclick=()=>go('me');
$('cbDate').onclick=()=>go('log','cal');
