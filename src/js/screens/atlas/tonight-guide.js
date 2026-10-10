/* 今晚觀星指引與星座詳情頁 */
const DIR8=['北','東北','東','東南','南','西南','西','西北'].map(tl);
function skyPos(k,lat,h,d=new Date()){const{ra,dec}=conCenter(k),lst=lstAt(d,h,regLon()),H=(lst-ra)*15*D2R,de=dec*D2R,la=lat*D2R;
  const alt=Math.asin(Math.sin(de)*Math.sin(la)+Math.cos(de)*Math.cos(la)*Math.cos(H))/D2R;
  const az=(Math.atan2(Math.sin(H),Math.cos(H)*Math.sin(la)-Math.tan(de)*Math.cos(la))/D2R+180+360)%360;return{alt,az}}
const dirName=az=>DIR8[Math.round(az/45)%8];
/* 時刻：中文介面一律 24 小時制（夜空時刻跨過午夜，比較好讀），英文跟著 12／24 小時制設定 */
const hm=h=>EN_UI?fmtTime(hhmm(h)):hhmm(h);
const hhmm=h=>{let m=Math.round(h*6)*10;m=((m%1440)+1440)%1440;return `${pad(Math.floor(m/60))}:${pad(m%60)}`};
function tonight(k,lat){const at9=skyPos(k,lat,21);let best={alt:-99,h:21};for(let h=18;h<=29;h+=1/6){const p=skyPos(k,lat,h);if(p.alt>best.alt)best={...p,h}}
  let rise=null,set=null;for(let h=18;h<=29;h+=1/6){const a=skyPos(k,lat,h).alt;if(rise==null&&a>=15)rise=h;if(a>=15)set=h}return{at9,best,rise,set}}
function skyDome(pos,size=96){const r=size/2-10,c=size/2;let g=`<svg class="dome" viewBox="0 0 ${size} ${size}" aria-hidden="true"><circle cx="${c}" cy="${c}" r="${r}" class="d-h"/><circle cx="${c}" cy="${c}" r="${r*2/3}" class="d-g"/><circle cx="${c}" cy="${c}" r="${r/3}" class="d-g"/><line x1="${c}" y1="${c-r}" x2="${c}" y2="${c+r}" class="d-g"/><line x1="${c-r}" y1="${c}" x2="${c+r}" y2="${c}" class="d-g"/>`;
  [['北',c,c-r-4],['南',c,c+r+10],['東',c-r-6,c+4],['西',c+r+6,c+4]].forEach(([t,x,y])=>g+=`<text x="${x}" y="${y}" text-anchor="middle" class="d-t${t==='南'?' s':''}">${tl(t)}</text>`);
  if(pos&&pos.alt>0){const rr=r*(1-pos.alt/90),a=pos.az*D2R,x=c-rr*Math.sin(a),y=c-rr*Math.cos(a);
    g+=`<line x1="${c}" y1="${c}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" class="d-l"/><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="9" class="d-halo"/><path d="${sp4(+x.toFixed(1),+y.toFixed(1),6)}" class="d-star"/>`}
  return g+`<circle cx="${c}" cy="${c}" r="1.8" class="d-me"/></svg>`}
function tonightShort(k){const lat=regLat();if(lat==null)return null;const T=tonight(k,lat),p=T.at9;
  if(p.alt>=15)return `<span class="vz-ok">${tl('今晚 {d}方 {a}°',{d:dirName(p.az),a:Math.round(p.alt)})}</span>`;
  if(T.best.alt>=15)return T.best.h<21?`<span class="vz-low">${tl('天黑後{d}方',{d:dirName(skyPos(k,lat,18.5).az)})}</span>`:`<span class="vz-low">${tl('{t} 後可見',{t:hm(T.rise)})}</span>`;
  return `<span class="vz-no">${tl('今晚看不到')}</span>`}
function tonightCard(k){const lat=regLat();
  if(lat==null)return `<button type="button" class="cn-tonight off" id="cnTn">${skyDome(null)}<span class="tn-t"><small>${tl('今晚在哪裡？')}</small><b>${tl('設定地區，看今晚的方位')}</b><span>${tl('會告訴你面向哪個方向、抬頭多高')}</span></span></button>`;
  const T=tonight(k,lat),p=T.at9,fist=a=>Math.max(1,Math.round(a/10));
  let head,sub,pos=p;
  if(p.alt>=15){head=tl('{d}方・仰角 {a}°',{d:dirName(p.az),a:Math.round(p.alt)});sub=tl('伸直手臂，約 {n} 個拳頭高',{n:fist(p.alt)})}
  else if(T.best.alt>=15&&T.best.h<21){pos=skyPos(k,lat,18.5);head=tl('天黑後在{d}方',{d:dirName(pos.az)});sub=tl('傍晚最高，約 {t} 後就落到低空',{t:hm(T.set)})}
  else if(T.best.alt>=15){pos=T.best;head=tl('約 {t} 後可見',{t:hm(T.rise)});sub=tl('{t} 最高，在{d}方仰角 {a}°',{t:hm(T.best.h),d:dirName(T.best.az),a:Math.round(T.best.alt)})}
  else if(T.best.alt>0){pos=T.best;head=tl('今晚只在低空');sub=tl('{t} 最高，{d}方仰角 {a}°，需要開闊地平線',{t:hm(T.best.h),d:dirName(T.best.az),a:Math.round(T.best.alt)})}
  else{pos=null;head=tl('今晚看不到');sub=tl('最佳月份約 {m}',{m:fmtM(conSeason(k).m)})}
  const peak=p.alt>=15&&T.best.h>21.2&&T.best.alt>p.alt+3?SEP+tl('{t} 升到最高 {a}°',{t:hm(T.best.h),a:Math.round(T.best.alt)}):'';
  return `<div class="cn-tonight${pos?'':' none'}" role="group" aria-label="${tl('今晚 9 點')}${tl('：')}${head}${tl('，')}${sub}">${skyDome(pos)}<span class="tn-t"><small>${tl('今晚 9 點')}${SEP}${esc(regName(prof.region))}</small><b>${head}</b><span>${sub}${peak}</span></span>${SHOW_RED?`<button type="button" class="red-q" aria-pressed="${!!prof.red}" aria-label="${tl('紅光夜視模式')}" title="${tl('紅光夜視模式')}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/></svg></button>`:''}</div>`}
function openCon(k,dir){const c=CON[k],st=consState(entries),done=st.done.includes(k),isCur=k===st.cur,es=conEntries(k),lit=done?c.s.length:isCur?st.lit:0,se=conSeason(k),zi=ZODIAC.findIndex(z=>z.k===k);
  const status=done?(es.length?tl('{d}完成',{d:fmtMDY(parse(es[es.length-1].date))}):tl('已完成')):isCur?tl('正在點亮 {lit} / {n}',{lit:st.lit,n:c.s.length}):tl('尚未點亮');
  $('conTitle').textContent=c.n;
  conNav.list=conOrder();conNav.i=Math.max(0,conNav.list.indexOf(k));const N=conNav.list.length;
  $('conBody').innerHTML=`<div class="cn-hero" id="cnHero"><canvas class="cn-sky" aria-hidden="true"></canvas>
    <svg class="cn-fig" viewBox="0 0 380 300" aria-hidden="true">${conSVG(k,380,300,46,lit,es,{sc:1.25,next:isCur})}</svg>
    <button type="button" class="cn-nav l" id="cnPrev" aria-label="${tl('上一個星座')}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg></button>
    <button type="button" class="cn-nav r" id="cnNext" aria-label="${tl('下一個星座')}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg></button>
    <span class="cn-pos">${conNav.i+1} / ${N}</span></div>
    <div class="cn-txt${dir?(dir>0?' cn-in-r':' cn-in-l'):''}"><div class="cn-h"><h3>${c.n}</h3><p>${[conLa(c),c.z?tl('黃道十二星座'):''].filter(Boolean).join(SEP)}</p></div>
    <p class="cn-f">${c.f}</p>
    <div class="cn-info"><div><small>${tl('狀態')}</small>${status}</div><div><small>${tl('主要恆星')}</small>${tl('{n} 顆',{n:c.s.length})}</div>
      <div><small>${tl('最佳觀賞')}</small>${conBest(k)}</div>${(()=>{const r=conVisR(k);if(r)return `<button type="button" class="cn-vis" id="cnVis" aria-label="${tl('在你的地區（{r}）：{v}，點一下更改地區',{r:esc(regName(prof.region)),v:r[0]})}"><small class="cv-l">${tl('你的地區')}${SEP}${esc(regName(prof.region))}</small><span class="vz-${r[1]}">${r[0]}</span></button>`;
        const z=conZone(k);return `<button type="button" class="cn-vis" id="cnVis"><small>${tl('天空位置')}</small>${z[0]}${SEP}${z[1]}<span class="go">${tl('設定地區看更準確 ›')}</span></button>`})()}</div>
    ${tonightCard(k)}
    ${es.length?`<div class="at-h">${tl('點亮這個星座的紀錄')}</div><div class="cn-list">${es.map(e=>`<button type="button" data-id="${esc(e.id)}">${moon(e.mood??2)} ${esc(EN_UI?fmtMDY(parse(e.date)):fmtDay(e.date).split('・')[0])}</button>`).join('')}</div>`:''}
    ${done?`<button type="button" class="btn cn-share" id="cnShare"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12M7.5 7.5L12 3l4.5 4.5M5 13v6h14v-6"/></svg>${tl('分享這個星座')}</button>`:''}
    ${!done&&!isCur?`<button type="button" class="btn cn-next${prof.nextPick===k?' on':''}" id="cnNextPick">${tl(prof.nextPick===k?'✓ 已設為下一個要點亮的星座・點一下取消':'✦ 設為下一個要點亮的星座')}</button>`:''}
    ${zi>=0?`<button type="button" class="btn cn-z" id="cnZ">${zg(zi)} ${tl('查看{z}的性格與本月運勢',{z:ZODIAC[zi].n})}</button>`:''}</div>`;
  if(dir)$('cnHero').querySelector('.cn-fig').classList.add(dir>0?'cn-in-r':'cn-in-l');
  $('cnPrev').onclick=()=>conStep(-1);$('cnNext').onclick=()=>conStep(1);
  $('conBody').scrollTop=0;
  $('conBody').querySelectorAll('.cn-list button').forEach(b=>b.onclick=()=>{closeSheet('conSheet');setTimeout(()=>openDetail(b.dataset.id),reduce?0:220)});
  if($('cnZ'))$('cnZ').onclick=()=>{if($('fortuneSheet').classList.contains('open'))closeSheet('conSheet');openFortune(zi)};
  $('cnVis').onclick=()=>openRegion(()=>openCon(k));if($('cnTn'))$('cnTn').onclick=()=>openRegion(()=>openCon(k));$('conBody').querySelectorAll('.red-q').forEach(b=>b.onclick=toggleRed);
  if($('cnShare'))$('cnShare').onclick=()=>openShare(k);
  if($('cnNextPick'))$('cnNextPick').onclick=()=>{const was=prof.nextPick===k;prof.nextPick=was?null:k;saveProf();openCon(k);if(cur==='atlas')renderAtlas();
    toast(was?tl('已取消，下一個星座會依季節自動挑選'):tl('完成目前的星座後，就會開始點亮{c}',{c:c.n}),2600)};
  if(!$('conSheet').classList.contains('open'))openSheet('conSheet');else sheetTop('conSheet');
  requestAnimationFrame(()=>heroSky($('cnHero').querySelector('.cn-sky')))}
/* 在詳細頁任何地方左右滑動 → 上一個／下一個星座 */
(()=>{let sx=0,sy=0,t0=0,on=false;const b=$('conBody');
  b.addEventListener('pointerdown',e=>{if(e.target.closest('button'))return;on=true;sx=e.clientX;sy=e.clientY;t0=Date.now()},{passive:true});
  b.addEventListener('pointerup',e=>{if(!on)return;on=false;const dx=e.clientX-sx,dy=e.clientY-sy;
    if(Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy)*1.4&&Date.now()-t0<800)conStep(dx<0?1:-1)},{passive:true});
  b.addEventListener('pointercancel',()=>on=false);
  $('conSheet').addEventListener('keydown',e=>{if(e.key==='ArrowRight')conStep(1);else if(e.key==='ArrowLeft')conStep(-1)})})();
