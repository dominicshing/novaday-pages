/* ---------- 第一次使用引導：歡迎 → 你是誰 → 讓星空更懂你 → 開始 ---------- */
const OB_LOGO=`<svg class="ob-logo" viewBox="0 0 100 100" aria-hidden="true"><defs><linearGradient id="nvBgO" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2E2A86"/><stop offset=".6" stop-color="#14173F"/><stop offset="1" stop-color="#080A22"/></linearGradient><radialGradient id="nvHaloO" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#8A7CFF" stop-opacity=".6"/><stop offset="1" stop-color="#8A7CFF" stop-opacity="0"/></radialGradient><radialGradient id="nvNovaO" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#FFB45C" stop-opacity=".8"/><stop offset="1" stop-color="#FFB45C" stop-opacity="0"/></radialGradient></defs><rect width="100" height="100" rx="24" fill="url(#nvBgO)"/><polyline class="ob-ln" pathLength="1" points="30,74 30,30 70,72 70,30" fill="none" stroke="#8A7CFF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><g class="ob-st" style="--d:.2s"><circle cx="30" cy="74" r="9" fill="url(#nvHaloO)"/><circle cx="30" cy="74" r="5" fill="#E8E9FF"/></g><g class="ob-st" style="--d:.52s"><circle cx="30" cy="30" r="9" fill="url(#nvHaloO)"/><circle cx="30" cy="30" r="5" fill="#E8E9FF"/></g><g class="ob-st" style="--d:.88s"><circle cx="70" cy="72" r="9" fill="url(#nvHaloO)"/><circle cx="70" cy="72" r="5" fill="#E8E9FF"/></g><g class="ob-nova"><circle class="ob-nh" cx="70" cy="30" r="16" fill="url(#nvNovaO)"/><path d="M70 17 Q71.9 27.9 82.5 30 Q71.9 32.1 70 43 Q68.1 32.1 57.5 30 Q68.1 27.9 70 17Z" fill="#FFE7A3"/><circle cx="70" cy="30" r="2.4" fill="#FFFFFF"/></g></svg>`;
let ob={i:0,av:null,name:'',m:0,d:0,reg:null};
function obNeeded(){return !!prof.devOnb||(!prof.onboarded&&entries.every(isSample))}
function obSkyStart(){const c=$('obSky'),x=c.getContext('2d');const R=()=>{c.width=c.clientWidth*devicePixelRatio;c.height=c.clientHeight*devicePixelRatio};R();
  const st=Array.from({length:90},()=>({x:Math.random(),y:Math.random(),r:Math.random()*1.3+.3,p:Math.random()*6}));let t=0,id;
  const f=()=>{if($('onb').hidden){cancelAnimationFrame(id);return}x.clearRect(0,0,c.width,c.height);t+=.016;
    st.forEach(s=>{x.globalAlpha=.25+.55*(.5+.5*Math.sin(t*1.3+s.p));x.fillStyle='#E8E9FF';x.beginPath();x.arc(s.x*c.width,s.y*c.height,s.r*devicePixelRatio,0,7);x.fill()});
    if(!reduce)id=requestAnimationFrame(f)};f()}
/* 第 3 步的城市格子：切換分區時只重繪這裡（swap 讓格子依序淡入），選城市只更新選取狀態 */
const obCustomReg=()=>ob.reg&&!REGIONS.some(([,l])=>l.some(([n])=>n===ob.reg.name));
function obRegGrid(swap){const g=$('obRg');if(!g)return;const lat=la=>`${Math.abs(la).toFixed(1)}°${la>=0?'N':'S'}`;
  g.innerHTML=(obCustomReg()?`<button type="button" class="rg-c ob-me-loc" aria-pressed="true" data-cur="1">${esc(ob.reg.name.replace(/（.*$/,''))}<small>${lat(ob.reg.lat)}</small></button>`:'')
    +REGIONS[ob.rg][1].map(([n,la])=>`<button type="button" class="rg-c" data-n="${n}" data-la="${la}" aria-pressed="${!!ob.reg&&ob.reg.name===n}">${n}<small>${lat(la)}</small></button>`).join('');
  g.classList.remove('swap');if(swap&&!reduce){void g.offsetWidth;g.classList.add('swap')}
  g.querySelectorAll('.rg-c').forEach(b=>b.onclick=()=>{
    if(b.dataset.cur){ob.reg=null;obRegGrid(false);return}
    const on=!(ob.reg&&ob.reg.name===b.dataset.n);ob.reg=on?{name:b.dataset.n,lat:+b.dataset.la}:null;
    if(obCustomReg()===false&&g.querySelector('[data-cur]'))g.querySelector('[data-cur]').remove();
    g.querySelectorAll('.rg-c[data-n]').forEach(x=>{x.setAttribute('aria-pressed',on&&x===b);x.classList.toggle('hit',on&&x===b)})})}
function obRender(){const i=ob.i,B=$('obBody');$('obDots').querySelectorAll('i').forEach((d,k)=>{d.classList.toggle('on',k<=i);d.classList.toggle('cur',k===i)});
  if(ob.shown!==i){ob.shown=i;B.classList.remove('in');if(!reduce){void B.offsetWidth;B.classList.add('in')}}
  $('obBack').style.visibility=i?'visible':'hidden';$('obSkip').style.visibility=i===3?'hidden':'visible';$('obAlt').hidden=true;
  if(i===0){B.innerHTML=`<div class="ob-hero"><span class="ob-orbit" aria-hidden="true"><i></i></span>${OB_LOGO}</div><h2 id="obT">歡迎來到 <span class="ob-brand">Novaday</span></h2><p class="ob-lead">每寫一則日記，就點亮一顆星。<br>集滿一個星座，就收進你的星空圖鑑。</p>
      <ul class="ob-pts"><li class="ob-mood"><b class="ob-mc">${[4,3,2,1,0].map(i=>moon(i)).join('')}</b>用 5 顆表情星星記錄心情</li>
        <li style="--c:#6FE3D6"><b><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 17l5-7 4 4 5-8"/><circle cx="5" cy="17" r="1.6"/><circle cx="10" cy="10" r="1.6"/><circle cx="14" cy="14" r="1.6"/><circle cx="19" cy="6" r="1.6"/></svg></b>全天 88 個星座等你收集</li>
        <li style="--c:#FFB45C"><b><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5.5" y="10.5" width="13" height="9.5" rx="2.5"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/></svg></b>紀錄只存在這台裝置上</li></ul>`;$('obNext').textContent='開始';}
  else if(i===1){if(!ob.av)ob.av=prof.avatar;
    B.innerHTML=`<h2 id="obT">你是誰？</h2><p class="ob-lead">選一個頭像，取一個在星空裡的名字。</p>
      <div class="ob-me"><span class="me-av ob-me-av" id="obAvPrev">${avHTML(ob.av,ob.ph)}</span>
        <label class="ob-nm"><span class="sr">暱稱</span><input id="obName" maxlength="12" placeholder="星旅人" value="${esc(ob.name)}" autocomplete="nickname" enterkeyhint="done"><svg class="ob-nm-ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/></svg></label></div>
      <p class="ob-cap">選擇頭像</p>
      <div class="ob-av" role="radiogroup" aria-label="頭像"><button type="button" class="av-up2${ob.ph?' has':''}" role="radio" aria-checked="${ob.av==='photo'}" id="obPhTile" aria-label="${ob.ph?(ob.av==='photo'?'我的照片（使用中），點一下換一張':'使用我的照片'):'上傳照片當頭像'}">${ob.ph?`<img class="av-img" src="${ob.ph}" alt="">`:''}<span class="avp-ic" aria-hidden="true">${CAM_SVG}</span></button>${AVATARS.map(a=>`<button type="button" role="radio" aria-checked="${a===ob.av}" data-a="${a}" aria-label="${AVK[a].n}">${avSVG(a)}</button>`).join('')}</div>`;
    const pickOb=(a,b)=>{ob.av=a;B.querySelectorAll('.ob-av button').forEach(x=>x.setAttribute('aria-checked',x===b));
      const v=$('obAvPrev');v.innerHTML=avHTML(ob.av,ob.ph);v.classList.remove('pop');void v.offsetWidth;v.classList.add('pop')};
    B.querySelectorAll('.ob-av button[data-a]').forEach(b=>b.onclick=()=>pickOb(b.dataset.a,b));
    /* 照片格：還沒有照片→選來源並裁切；有照片但沒選→選它；已選→換一張 */
    $('obPhTile').onclick=e=>{if(ob.ph&&ob.av!=='photo'){pickOb('photo',e.currentTarget);return}
      avTarget=ph=>{ob.ph=ph;ob.av='photo';obRender()};openSheet('avSrc')};
    $('obName').oninput=e=>ob.name=e.target.value;$('obName').onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();e.target.blur()}};$('obNext').textContent='下一步'}
  else if(i===2){const zi=ob.m&&ob.d?signIdx(`2000-${pad(ob.m)}-${pad(ob.d)}`):-1;const n=ob.m?new Date(2000,ob.m,0).getDate():31;
    const pop=zi>=0&&zi!==ob.zi;ob.zi=zi;
    B.innerHTML=`<div class="ob-hero sm"><span class="ob-zr">${zRing()}</span><svg class="ob-loc" viewBox="0 0 48 48" aria-hidden="true"><defs><linearGradient id="obPinG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8A7CFF"/><stop offset="1" stop-color="#6FE3D6"/></linearGradient></defs><path class="ob-pin" d="M24 45s-14-13-14-24a14 14 0 0 1 28 0c0 11-14 24-14 24z"/><path class="ob-pst" d="${sp4(24,21,8)}"/><circle cx="24" cy="21" r="1.8" fill="#fff"/></svg></div>
      <h2 id="obT">讓星空更懂你</h2><p class="ob-lead">兩項都可以之後再設定。</p>
      <div class="ob-sec"><div class="ob-h"><i class="ob-hi" style="--c:var(--flare)"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h16"/><path d="M5 20v-6.5a1.5 1.5 0 0 1 1.5-1.5h11a1.5 1.5 0 0 1 1.5 1.5V20"/><path d="M5 15.5c1.2 1 2.3 1 3.5 0s2.3-1 3.5 0 2.3 1 3.5 0 2.3-1 3.5 0"/><path d="M12 12V8.5"/><path d="M12 6.2c-.9-.8-.9-1.9 0-3.2.9 1.3.9 2.4 0 3.2z"/></svg></i><span>生日<small>用來顯示你的星座與每月運勢</small></span></div>
        <div class="bd-row"><select class="field" id="obM" aria-label="出生月份"><option value="">月份</option>${Array.from({length:12},(_,k)=>`<option value="${k+1}"${ob.m===k+1?' selected':''}>${k+1} 月</option>`).join('')}</select>
        <select class="field" id="obD" aria-label="出生日期"><option value="">日期</option>${Array.from({length:n},(_,k)=>`<option value="${k+1}"${ob.d===k+1?' selected':''}>${k+1} 日</option>`).join('')}</select></div>
        <div class="ob-sign${zi<0?'':' on'}${pop?' pop':''}">${zi<0?'':`<span class="zo sm">${zRing()}<span class="zg">${zg(zi)}</span></span><span>你是<b>${ZODIAC[zi].n}</b>・${ZODIAC[zi].el}星座</span>`}</div></div>
      <div class="ob-sec"><div class="ob-h"><i class="ob-hi" style="--c:var(--ion)"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.4"/></svg></i><span>所在地區<small>判斷星座的可見度與方位</small></span>
          <button type="button" class="ob-geo" id="obGeo" aria-label="使用目前位置"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3"/><circle cx="12" cy="12" r="7"/></svg>定位</button></div>
        <div class="ob-tabs" role="tablist" aria-label="地區分區" style="--i:${ob.rg}">${REGIONS.map(([g],k)=>`<button type="button" role="tab" aria-selected="${k===ob.rg}" data-g="${k}">${g}</button>`).join('')}</div>
        <div class="ob-rg" id="obRg" role="group" aria-label="城市"></div></div>`;
    obRegGrid(false);
    $('obM').onchange=e=>{ob.m=+e.target.value;const n=ob.m?new Date(2000,ob.m,0).getDate():31;if(ob.d>n)ob.d=0;obRender()};$('obD').onchange=e=>{ob.d=+e.target.value;obRender()};
    B.querySelectorAll('.ob-tabs button').forEach(b=>b.onclick=()=>{ob.rg=+b.dataset.g;const t=b.parentElement;t.style.setProperty('--i',ob.rg);
      t.querySelectorAll('button').forEach(x=>x.setAttribute('aria-selected',x===b));obRegGrid(true)});
    $('obGeo').onclick=()=>geoRegion(r=>{ob.reg=r;obRegGrid(false)});
    $('obNext').textContent='下一步'}
  else{const sm=entries.filter(isSample).length;
    B.innerHTML=`<div class="ob-hero"><svg class="ob-first" viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="44" fill="none" stroke="rgba(138,124,255,.3)" stroke-dasharray="2 5"/><path d="${sp4(60,60,26)}" fill="#FFE7A3"/><circle cx="60" cy="60" r="5" fill="#fff"/></svg></div>
      <h2 id="obT">${esc(ob.name.trim()||'星旅人')}，準備好了</h2><p class="ob-lead">寫下第一則日記，點亮你的第一顆星。<br>不用寫很多，一句話也可以。</p>
      ${sm?`<label class="ob-keep"><input type="checkbox" id="obKeep" checked><span>保留 ${sm} 則範例紀錄，先看看長什麼樣子<small>之後可在「設定」一鍵清除</small></span></label>`:''}`;
    $('obNext').textContent='寫下第一則';$('obAlt').hidden=false;$('obAlt').textContent='先逛逛'}}
function obFinish(write){avTarget=null;if(ob.ph)prof.photoAv=ob.ph;prof.avatar=ob.av==='photo'&&!ob.ph?prof.avatar:ob.av||prof.avatar;if(ob.name.trim())prof.name=ob.name.trim();
  if(ob.m&&ob.d)prof.birthday=`2000-${pad(ob.m)}-${pad(ob.d)}`;if(ob.reg)prof.region=ob.reg;prof.onboarded=1;
  if($('obKeep')&&!$('obKeep').checked){entries=entries.filter(e=>!isSample(e));save()}
  saveProf();$('onb').classList.add('out');setTimeout(()=>{$('onb').hidden=true;$('onb').classList.remove('out')},reduce?0:380);render();if(write)setTimeout(()=>openEditor(),reduce?0:420)}
function openOnb(){ob={i:0,av:prof.avatar,ph:prof.photoAv||null,name:prof.name&&prof.name!=='星旅人'?prof.name:'',m:0,d:0,reg:prof.region||null,zi:-1};ob.rg=Math.max(0,REGIONS.findIndex(([,l])=>ob.reg&&l.some(([n])=>n===ob.reg.name)));$('onb').hidden=false;obRender();obSkyStart()}
$('obNext').onclick=()=>{if(ob.i<3){ob.i++;obRender();$('obBody').scrollTop=0}else obFinish(true)};
$('obAlt').onclick=()=>obFinish(false);$('obBack').onclick=()=>{if(ob.i){ob.i--;obRender()}};
$('obSkip').onclick=()=>{ob.i=3;obRender()};
