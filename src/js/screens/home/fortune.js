/* 首頁星座運勢卡與運勢頁 */
const ELC={'火象':'#FF9A6B','土象':'#D9BE7E','風象':'#6FE3D6','水象':'#7FB2FF'};
const zRing=()=>`<svg class="fo-ring" viewBox="-29 -29 58 58" aria-hidden="true"><circle r="26"/>${ZODIAC.map((z,j)=>{const a=j/12*Math.PI*2-Math.PI/2;return `<g transform="translate(${(26*Math.cos(a)-3.6).toFixed(2)} ${(26*Math.sin(a)-3.6).toFixed(2)}) scale(.3)">${ZGP[j]}</g>`}).join('')}</svg>`;
function renderFortuneCard(){const b=$('fortuneCard'),i=signIdx(prof.birthday),n=new Date(),M=n.getMonth()+1;
  const snoozed=i<0&&prof.foSnooze&&prof.foSnooze>ymd(n);$('foWrap').hidden=!!snoozed;$('foX').hidden=i>=0;
  if(i<0){b.className='fortune panel setup';b.style.removeProperty('--elc');
    b.innerHTML=`<span class="fo-orb">${zRing()}<span class="zg" aria-hidden="true">${STAR4}</span></span><span class="ft"><b>你是哪個星座？</b><small>輸入生日，解鎖性格與<span style="white-space:nowrap"> ${M} 月運勢</span></small></span><span class="fo-cta" aria-hidden="true">設定生日</span>`;
    b.setAttribute('aria-label',`設定生日，查看你的星座性格與 ${M} 月運勢`);return}
  const Z=ZODIAC[i],f=fortune(i,n.getFullYear(),M);b.className='fortune panel set';b.style.setProperty('--elc',ELC[Z.el]);
  b.innerHTML=`<span class="fo-orb">${zRing()}<span class="zg" aria-hidden="true">${zg(i)}</span><span class="fo-el" aria-hidden="true">${Z.el.slice(0,1)}</span></span>
    <span class="ft"><b>${Z.n}<span class="fo-tag">${M} 月運勢</span></b><span class="fo-meta">${stars5(f.so)}<span class="fo-lc">幸運色・${f.c}</span></span><small class="fo-sum">${f.o}</small></span><span class="chev" aria-hidden="true">›</span>`;
  b.setAttribute('aria-label',`${Z.n} ${M} 月運勢，${f.so} 顆星，幸運色${f.c}。${f.o}`)}
$('foX').onclick=()=>{const d=new Date();d.setDate(d.getDate()+7);prof.foSnooze=ymd(d);saveProf();renderFortuneCard();toast('好的，7 天後再提醒你。也可以隨時在「我的」設定星座',3000)};
$('fortuneCard').onclick=()=>{signIdx(prof.birthday)<0?openBdQuick():openFortune()};
function openFortune(i){const mine=signIdx(prof.birthday);if(i==null)i=mine;if(i<0)return openBdQuick();
  const Z=ZODIAC[i],n=new Date(),M=n.getMonth()+1,f=fortune(i,n.getFullYear(),M);
  $('fsTitle').textContent=`${Z.n}`;
  $('fsBody').innerHTML=`<div class="fs-top"><span class="zo lg">${zRing()}<span class="zg">${zg(i)}</span></span><h3>${Z.n}</h3><p>${zRange(i)}・${Z.el}星座${i===mine?'・你的星座':''}</p>
      <div class="kw">${Z.kw.map(w=>`<span class="chip">${w}</span>`).join('')}</div></div>
    <div class="fs-sec"><h4>性格</h4><p>${Z.p}</p></div>
    <div class="fs-sec"><h4>${M} 月運勢 ${stars5(f.so)}</h4><p>${f.o}</p>
      <div class="fs-row"><span class="lb">人際 ${stars5(f.sl)}</span><span></span></div><p>${f.l}</p>
      <div class="fs-row"><span class="lb">工作學業 ${stars5(f.sw)}</span><span></span></div><p>${f.w}</p>
      <div class="fs-row"><span class="lb">照顧自己</span><span>${f.s}</span></div>
      <div class="lucky"><div><small>幸運色</small>${f.c}</div><div><small>幸運數字</small>${f.n}</div></div>
      <p style="margin-top:10px;font-size:13px;color:var(--muted)">${ELTIP[Z.el]}</p></div>
    <div class="fs-sec"><h4>本月書寫提示</h4><p>${f.q}</p><button type="button" class="btn primary" id="fsWrite" style="width:100%;margin-top:10px">用這題寫一則紀錄</button></div>
    <button type="button" class="btn" id="fsCon" style="width:100%;margin-top:12px">在星座圖鑑中查看${CON[Z.k].n}</button>
    <div class="at-h">其他星座</div><div class="fs-other">${ZODIAC.map((z,j)=>`<button type="button" data-i="${j}" aria-pressed="${j===i}">${zg(j)} ${z.n}</button>`).join('')}</div>
    <p class="fs-note">星座運勢僅供娛樂參考，每月初更新，只顯示當月內容。</p>`;
  $('fsBody').scrollTop=0;
  $('fsWrite').onclick=()=>{closeSheet('fortuneSheet');setTimeout(()=>openEditor(null,f.q),reduce?0:220)};
  $('fsCon').onclick=()=>{if($('conSheet').classList.contains('open'))closeSheet('fortuneSheet');openCon(Z.k)};
  $('fsBody').querySelectorAll('.fs-other button').forEach(b=>b.onclick=()=>openFortune(+b.dataset.i));
  if(!$('fortuneSheet').classList.contains('open'))openSheet('fortuneSheet');else sheetTop('fortuneSheet')}
