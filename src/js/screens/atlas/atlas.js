/* 星座圖鑑與星座詳情的切換 */
function atlasCard(k,st,sub2){const c=CON[k],done=st.done.includes(k),isCur=k===st.cur,lit=done?c.s.length:isCur?st.lit:0;
  const es0=done?conEntries(k):null,sub=done?`${es0&&es0.length?(d=>d.getFullYear()===new Date().getFullYear()?tlc('card','{d}完成',{d:fmtMD(d)}):fmtMDYs(d))(parse(es0[es0.length-1].date)):tl('{n} 顆星',{n:c.s.length})}`:isCur?tl('點亮中 {lit}/{n}',{lit:st.lit,n:c.s.length}):(sub2||`${conSeason(k).s||fmtM(conSeason(k).m)}${SEP}${tl('{n} 顆星',{n:c.s.length})}`);
  const badge=done?'':isCur?'<i class="at-bd now" aria-hidden="true"></i>':prof.nextPick===k?`<i class="at-tag nx">${tl('下一個')}</i>`:'';
  const status=done?`<small class="at-completion"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 12.5l4 4 8-9"/></svg><span>${sub}</span></small>`:`<small>${sub}</small>`;
  const mine=signIdx(prof.birthday),mineTag=mine>=0&&ZODIAC[mine].k===k?`<i class="at-tag me">${tl('你的星座')}</i>`:'';
  return `<button type="button" class="at-card ${done?'done':isCur?'cur':'lock'}" data-k="${k}" aria-label="${c.n}${tl('，')}${done?tl('已點亮'):isCur?tl('點亮中 {lit}/{n}',{lit:st.lit,n:c.s.length}):tl('尚未點亮')}">${badge}${mineTag}<svg viewBox="0 0 110 86" aria-hidden="true">${conSVG(k,110,86,12,lit,done||isCur?conEntries(k):null,{sc:.6})}</svg><b>${c.n}</b>${status}${atDots(k,st)}</button>`}
/* 本月夜空：晚上九點左右位在南方高空的星座 */
function skyList(m){const lat=regLat(),alt=k=>lat==null?90-Math.abs(conCenter(k).dec):maxAlt(k,lat);
  return Object.keys(CON).filter(k=>conSeason(k).m===m&&(lat==null?Math.abs(conCenter(k).dec)<60:alt(k)>=15)).sort((a,b)=>(CON[b].fm?1:0)-(CON[a].fm?1:0)||alt(b)-alt(a))}
let atTab='month',atQ='',atMon=0;
/* 目前星座完成後，接下來會點亮哪一個（不改動資料，只預覽） */
function nextPreview(st){if(!st.cur)return null;const order=prof.conOrder||[],i=order.indexOf(st.cur);return order[i+1]||pickNext(order.slice(0,i+1))}
/* 卡片下方的星點：已點亮的星用當時的心情色 */
function atDots(k,st){const n=CON[k].s.length,es=k===st.cur||st.done.includes(k)?conEntries(k):[];if(!es.length)return '';
  return `<span class="at-dots" aria-hidden="true">${Array.from({length:n},(_,j)=>j<es.length?`<i style="--c:var(${MOODS[es[j].mood??2].c})"></i>`:'<i></i>').join('')}</span>`}
function renderAtlas(){const st=consState(entries),M=new Date().getMonth()+1,N=st.done.length,pct=N/88;
  const rest=Object.keys(CON).filter(k=>!st.done.includes(k)&&k!==st.cur).sort((a,b)=>conScore(a,9)-conScore(b,9));
  const MM=((M-1+atMon)%12+12)%12+1,sky=skyList(MM),zod=ZODIAC.map(z=>z.k);
  const tabs=[['month',tl('{m}夜空',{m:EN_UI?MON_EN[MM-1]:fmtM(MM)}),sky.length],['done',tl('已點亮'),N],['zod',tl('黃道'),12],['all',tl('全部'),88]];
  /* 進度＋正在點亮 合成一張卡 */
  let g=`<div class="at-hero panel"><div class="ah-ring" role="progressbar" aria-label="${tl('星座點亮進度')}" aria-valuemin="0" aria-valuemax="88" aria-valuenow="${N}" aria-valuetext="${tl('已點亮 {n} / 88 個星座',{n:N})}"><svg viewBox="0 0 72 72" aria-hidden="true"><circle cx="36" cy="36" r="30" class="ah-bg"/>${N>0?`<circle cx="36" cy="36" r="30" class="ah-fg" pathLength="100" stroke-dasharray="${N===88?'none':`${(pct*100).toFixed(2)} 100`}" transform="rotate(-90 36 36)"/>`:''}</svg><span aria-hidden="true"><b>${N}</b><small>${tl('共 88 個')}</small></span></div>`;
  if(st.cur){const c=CON[st.cur];g+=`<button type="button" class="ah-cur" id="ahCur"><small>${tl('正在點亮')}</small><b>${c.n}</b><span>${tl('{lit} / {n} 顆星・再寫 {r} 則就完成 ›',{lit:st.lit,n:c.s.length,r:c.s.length-st.lit})}</span>${(nx=>nx?`<em class="ah-nx">${tl(prof.nextPick===nx?'接下來：{c}（你選的）':'接下來：{c}',{c:CON[nx].n})}</em>`:'')(nextPreview(st))}</button><svg class="ah-fig" viewBox="0 0 110 86" aria-hidden="true">${conSVG(st.cur,110,86,10,st.lit,conEntries(st.cur),{sc:.6})}</svg>`}
  else g+=`<div class="ah-cur"><small>${tl('全部完成')}</small><b>${tl('你點亮了全天 88 個星座')}</b></div>`;
  const litStars=st.done.reduce((t,k)=>t+CON[k].s.length,0)+(st.cur?st.lit:0);
  const goal=N<1?tl('再完成 <b>1</b> 個，解鎖「{b}」徽章',{b:tl('第一個星座')}):N<5?tl('再完成 <b>{n}</b> 個，解鎖「{b}」徽章',{n:5-N,b:tl('星圖繪製者')}):N<88?tl('距離集滿全天還差 <b>{n}</b> 個',{n:88-N}):'';
  g+=`</div><div class="ah-foot"><span>${tl('已點亮 <b>{n}</b> / 580 顆星',{n:litStars})}</span>${goal?`<span>${goal}</span>`:''}</div>`;
  $('atTabs').innerHTML=tabs.map(([k,n,c])=>`<button type="button" role="tab" data-t="${k}" aria-selected="${!atQ&&atTab===k}">${n}<em>${c}</em></button>`).join('');
  let list,note,sub2=()=>null;
  const qq=atQ.trim().toLowerCase();
  if(qq){list=Object.keys(CON).filter(k=>CON[k].n.includes(atQ.trim())||CON[k].la.toLowerCase().includes(qq)||k.toLowerCase()===qq);note=tl('搜尋「{q}」・找到 {n} 個星座',{q:esc(atQ.trim()),n:list.length})}
  else if(atTab==='month'){list=sky.slice();if(st.cur&&!list.includes(st.cur)&&false)list.unshift(st.cur);note=`<span class="at-mon"><button type="button" id="atMp" aria-label="${tl('上個月')}">‹</button><b>${fmtM(MM)}</b><button type="button" id="atMn" aria-label="${tl('下個月')}">›</button></span>${tl('晚上九點左右看得到')}${regLat()==null?`${SEP}<button type="button" class="at-link" id="atRegion">${tl('設定地區')}</button>`:`${SEP}${esc(regName(prof.region))}`}`;
    sub2=k=>atMon===0&&tonightShort(k)||(r=>r?`<span class="vz-${r[1]}">${r[0]}</span>`:conZone(k)[0])(conVisR(k))}
  else if(atTab==='done'){list=st.done.slice().reverse();note=tl('依點亮的時間，最新的在前面')}
  else if(atTab==='zod'){list=zod.slice();note=tl('依生日月份排序・點卡片查看星座');sub2=k=>{const i=ZODIAC.findIndex(z=>z.k===k);return st.done.includes(k)||k===st.cur?null:zRange(i)}}
  else{const np=prof.nextPick&&rest.includes(prof.nextPick)?[prof.nextPick]:[];list=(st.cur?[st.cur]:[]).concat(np,st.done.slice().reverse(),rest.filter(k=>!np.includes(k)));note=tl('正在點亮、下一個、已點亮的在前，其餘依當季排序')}
  g+=`<p class="at-note">${note}</p>`;
  g+=list.length?`<div class="at-grid">${list.map(k=>atlasCard(k,st,sub2(k))).join('')}</div>`:`<div class="es">${emptyState(tl(qq?'找不到這個星座':atTab==='done'?'還沒有點亮的星座':'這裡還沒有星座'),qq?tl('試試中文名稱或英文學名。'):atTab==='done'?tl('每寫一則紀錄點亮一顆星，集滿就完成一個星座。'):'')}</div>`;
  if(qq)g=g.slice(g.indexOf('<p class="at-note">'));
  $('atlasView').innerHTML=g;
  $('atlasView').querySelectorAll('.at-card').forEach(b=>b.onclick=()=>openCon(b.dataset.k));
  $('atTabs').querySelectorAll('[data-t]').forEach(b=>b.onclick=()=>{if(atTab===b.dataset.t&&atTab==='month')atMon=0;atTab=b.dataset.t;if(atQ){atQ='';$('atQ').value=''}renderAtlas();const hero=$('atlasView').querySelector('.at-note');if(hero){const top=hero.offsetTop-$('atTop').offsetHeight-8;if($('s-atlas').scrollTop>top)$('s-atlas').scrollTop=top}});
  if($('ahCur')&&st.cur)$('ahCur').onclick=()=>openCon(st.cur);if($('atRegion'))$('atRegion').onclick=()=>openRegion(()=>renderAtlas());
  if($('atMp')){$('atMp').onclick=()=>{atMon--;renderAtlas()};$('atMn').onclick=()=>{atMon++;renderAtlas()}}}
function openAtlas(){go('atlas')}
$('atSearchBtn').onclick=()=>{const f=$('atSearch'),open=f.hidden;f.hidden=!open;$('atSearchBtn').setAttribute('aria-expanded',open);if(open)$('atQ').focus();else if(atQ){atQ='';$('atQ').value='';renderAtlas()}};
/* 輸入法選字中（例如拼音打到一半是 lie）先不搜尋，避免畫面閃一下「找到 0 個星座」；選好字才更新 */
$('atQ').addEventListener('input',e=>{if(e.isComposing)return;atQ=e.target.value;renderAtlas()});
$('atQ').addEventListener('compositionend',e=>{atQ=e.target.value;renderAtlas()});
/* 星座詳細頁：左右滑動切換星座（順序與星座圖鑑相同） */
function conOrder(){const st=consState(entries),rest=Object.keys(CON).filter(k=>!st.done.includes(k)&&k!==st.cur).sort((a,b)=>conScore(a,9)-conScore(b,9));
  return [st.cur,...st.done.slice().reverse(),...rest].filter(Boolean)}
let conNav={list:[],i:0},heroRun=0;
function conStep(d){const L=conNav.list;if(!L.length)return;const i=(conNav.i+d+L.length)%L.length;openCon(L[i],d)}
/* 詳細頁上方的動態星空（和首頁一樣緩緩飄移、閃爍，偶爾有流星） */
function heroSky(cv){const run=++heroRun,ctx=cv.getContext('2d');let W=0,H=0,stars=[],last=0,shoot=null,next=2500;
  const size=()=>{const dpr=Math.min(2,window.devicePixelRatio||1);W=cv.clientWidth;H=cv.clientHeight;cv.width=W*dpr;cv.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);
    stars=Array.from({length:Math.round(W*H/1500)},()=>({x:Math.random()*W,y:Math.random()*H,z:Math.random()*.9+.1,tw:Math.random()*6.28}))};
  const draw=t=>{if(run!==heroRun||!cv.isConnected||!$('conSheet').classList.contains('open'))return;
    const dt=Math.min(50,t-last||16);last=t;ctx.clearRect(0,0,W,H);
    for(const s of stars){if(!reduce){s.y+=s.z*dt*.01;s.x-=s.z*dt*.004;if(s.y>H+2){s.y=-2;s.x=Math.random()*W}if(s.x<-2)s.x=W+2;s.tw+=dt*.002*s.z}
      const a=reduce?.5*s.z+.2:(.3+.5*Math.abs(Math.sin(s.tw)))*s.z+.1;ctx.fillStyle=`rgba(232,233,255,${a.toFixed(3)})`;ctx.beginPath();ctx.arc(s.x,s.y,s.z*1.3,0,6.283);ctx.fill()}
    if(!reduce){next-=dt;if(!shoot&&next<=0){shoot={x:W*(.35+Math.random()*.6),y:H*Math.random()*.35,l:0};next=4500+Math.random()*5000}
      if(shoot){shoot.l+=dt;const q=shoot.l/800,x=shoot.x-q*170,y=shoot.y+q*95,g=ctx.createLinearGradient(x,y,x+64,y-36);
        g.addColorStop(0,`rgba(232,233,255,${(.85*(1-q)).toFixed(2)})`);g.addColorStop(1,'rgba(232,233,255,0)');ctx.strokeStyle=g;ctx.lineWidth=1.4;
        ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+64,y-36);ctx.stroke();if(q>=1)shoot=null}
      requestAnimationFrame(draw)}};
  size();if(reduce)draw(0);else requestAnimationFrame(draw)}
