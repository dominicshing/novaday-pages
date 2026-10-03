/* 「我的」頁：階級輪播 */
const RK={cur:0,idx:-1,placed:false,rank:-1,drag:null,raf:0};
function rkRew(i,st,using){const R=RINFO[i],s=i+1;
  const act=st==='lock'?`<span class="st" aria-label="未解鎖，Lv.${s} 解鎖">未解鎖</span>`:using===i?`<span class="st using">✓ 使用中</span>`:`<button type="button" class="rk-apply" data-liv="${i}" aria-label="套用星線顏色「${R.lv.n}」">套用</button>`;
  return `${miniShip(i)}<span class="t"><b>${R.lv.n}</b><small>星線顏色</small></span>${act}`}
/* 觀星者卡片本身就是輪播：目前階級那一頁是個人檔案，左右滑動看其他階 */
/* 階級卡片背景：閃爍星點、星雲飄移、偶爾劃過的流星 */
function rkSky(seed){const r=seedRng('rksky'+seed);let h=`<span class="rk-neb" style="--x:${(r()*50-10).toFixed(0)}%;--y:${(r()*20-12).toFixed(0)}%"></span>`;
  for(let k=0;k<18;k++){const big=k%6===0,y=big?r()*34:Math.pow(r(),1.35)*78;h+=`<i class="rk-st${big?' x':''}" style="left:${(r()*96+2).toFixed(1)}%;top:${(y+2).toFixed(1)}%;--s:${big?(7+r()*4).toFixed(1):(1.4+r()*1.8).toFixed(1)}px;--d:-${(r()*4).toFixed(2)}s;--t:${(2.4+r()*3).toFixed(2)}s"></i>`}
  h+=`<b class="rk-met" style="--x:${(62+r()*28).toFixed(0)}%;--y:${(4+r()*14).toFixed(0)}%;--t:${(7+r()*5).toFixed(1)}s;--d:${(r()*6).toFixed(1)}s"></b>`;
  return `<div class="rk-sky" aria-hidden="true">${h}</div>`}
function renderRanks(xp,lv){const t=$('rkTrack'),ri=rankIdx(lv),sl=t.scrollLeft,ps=$('pSlide');
  if(RK.rank!==-1&&RK.rank!==ri)RK.placed=false;RK.rank=ri;RK.cur=ri;const using=shipLiv();let g='';
  RANKS.forEach((name,i)=>{if(i===ri){g+='<i id="pSlot"></i>';return}
    const R=RINFO[i],s=i+1,top=i===RANKS.length-1,st=i<ri?'done':'lock',a0=xpAt(s);
    const prog=st==='done'?`<div class="rk-bar"><i style="width:100%"></i></div><div class="rk-pt"><span>✓ 已通過這一階</span><span>${a0.toLocaleString()} XP 達成</span></div>`
      :`<div class="rk-bar"><i style="width:${Math.min(100,xp/a0*100).toFixed(1)}%"></i></div><div class="rk-pt"><span>需要累積 <b>${a0.toLocaleString()}</b> XP</span><span>還差 ${(a0-xp).toLocaleString()}</span></div>`;
    g+=`<article class="rk-card is-${st}" data-i="${i}" style="--rc:${R.c};--ra:${hexA(R.c,.22)};--rb:${hexA(R.c,.38)}" role="group" aria-roledescription="階級" aria-label="第 ${i+1} / ${RANKS.length} 階：${name}，${st==='done'?'已達成':'未解鎖'}">${rkSky(i)}
      <div class="rk-top"><span class="rk-state">${st==='done'?'<svg class="rs-ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M5.5 12.5l4.2 4.2L18.5 8"/></svg>已達成':'<svg class="rs-ic" viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="9.5" rx="2.5"/><path d="M8.5 11V8a3.5 3.5 0 0 1 7 0v3"/></svg>未解鎖'}</span><span class="rk-lv">${top?`Lv.${s}+`:`Lv.${s}`}</span></div>
      <div class="rk-badge">${rankBadge(i)}</div><h3>${name}</h3><p class="rk-desc">${R.d}</p>
      <div class="rk-prog">${prog}</div>
      <div class="rk-rew">${rkRew(i,st,using)}</div></article>`});
  if(ps.parentNode)ps.remove();t.innerHTML=g;$('pSlot').replaceWith(ps);
  if(!ps.querySelector('.rk-sky'))ps.insertAdjacentHTML('afterbegin',rkSky('me'));ps.dataset.i=ri;ps.setAttribute('aria-label',`第 ${ri+1} / ${RANKS.length} 階：${RANKS[ri]}，目前階級，我的檔案`);
  $('pRew').innerHTML=rkRew(ri,'cur',using);ps.style.setProperty('--rc',RINFO[ri].c);
  $('pLvRange').textContent=ri===RANKS.length-1?`Lv.${ri+1}+`:`Lv.${ri+1}`;
  t.scrollLeft=sl;
  $('rkDots').innerHTML='<div class="rk-dots-in">'+RANKS.map((n,i)=>`<button type="button" class="rk-dot${i<=ri?' reached':''}${i===ri?' cur':''}" role="tab" data-i="${i}" aria-label="${n}${i===ri?'（目前）':''}" aria-selected="false"><i></i></button>`).join('')+'</div>';
  $('rkDots').querySelectorAll('.rk-dot').forEach(d=>d.onclick=()=>rkGo(+d.dataset.i,true));
  RK.idx=-1;rkUpdate()}
const rkCards=()=>[...$('rkTrack').querySelectorAll('.rk-card')];
function rkNearest(){const t=$('rkTrack'),c=t.scrollLeft+t.clientWidth/2;let b=0,bd=1e9;rkCards().forEach((el,i)=>{const d=Math.abs(el.offsetLeft+el.offsetWidth/2-c);if(d<bd){bd=d;b=i}});return b}
function rkGo(i,smooth){const t=$('rkTrack'),cs=rkCards();i=Math.max(0,Math.min(cs.length-1,i));const el=cs[i];if(!el)return;
  t.scrollTo({left:el.offsetLeft-(t.clientWidth-el.offsetWidth)/2,behavior:smooth&&!reduce?'smooth':'auto'});if(!smooth){RK.idx=-1;rkUpdate()}}
function rkUpdate(){const i=rkNearest();if(i===RK.idx)return;RK.idx=i;
  rkCards().forEach((el,k)=>el.classList.toggle('on',k===i));
  /* 小圓點：整排放在只露出 7 格的窗口裡，滑動時整排平移，目前那一點保持在中間（到兩端時靠邊）；
     每格寬度固定，選中只改變點的長度，不影響位置，所以不會左右跳。兩端的點縮小，表示還有更多 */
  const W=7,n=RANKS.length,st=Math.max(0,Math.min(n-W,i-3)),step=30;
  $('rkDots').firstElementChild.style.transform=`translateX(${-st*step}px)`;
  $('rkDots').querySelectorAll('.rk-dot').forEach((d,k)=>{d.setAttribute('aria-selected',k===i);
    const edge=(k<=st&&st>0)||(k>=st+W-1&&st+W<n)?2:(k===st+1&&st>0)||(k===st+W-2&&st+W<n)?1:0;d.dataset.edge=edge;d.tabIndex=k>=st&&k<st+W?0:-1});
  $('rkPrev').disabled=i===0;$('rkNext').disabled=i===RANKS.length-1;$('rkBack').hidden=i===RK.cur;$('rkHint').hidden=i!==RK.cur}
function rkSync(){if(cur!=='me'||RK.placed)return;RK.placed=true;rkGo(RK.cur,false)}
(()=>{const t=$('rkTrack');let seen=false;
  t.addEventListener('scroll',()=>{if(!RK.raf)RK.raf=requestAnimationFrame(()=>{RK.raf=0;rkUpdate();if(RK.placed&&!seen&&RK.idx!==RK.cur){seen=true;$('rkHint').textContent='左右滑動查看每一階'}})},{passive:true});
  $('rkPrev').onclick=()=>rkGo(RK.idx-1,true);$('rkNext').onclick=()=>rkGo(RK.idx+1,true);$('rkBack').onclick=()=>rkGo(RK.cur,true);
  $('pRankChip').onclick=e=>{e.stopPropagation();rkGo(Math.min(RANKS.length-1,RK.cur+1),true)};
  t.addEventListener('keydown',e=>{if(e.key==='ArrowRight'){e.preventDefault();rkGo(RK.idx+1,true)}else if(e.key==='ArrowLeft'){e.preventDefault();rkGo(RK.idx-1,true)}});
  /* 滑鼠拖曳（觸控板與手指用原生捲動） */
  t.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse'||e.button!==0)return;RK.drag={x:e.clientX,s:t.scrollLeft,from:RK.idx,moved:false,id:e.pointerId}});
  t.addEventListener('pointermove',e=>{const d=RK.drag;if(!d)return;const dx=e.clientX-d.x;
    if(!d.moved&&Math.abs(dx)>5){d.moved=true;t.classList.add('drag');try{t.setPointerCapture(d.id)}catch(_){}}
    if(d.moved){const k=t.getBoundingClientRect().width/t.offsetWidth||1;t.scrollLeft=d.s-dx/k}});
  const end=e=>{const d=RK.drag;if(!d)return;RK.drag=null;if(!d.moved)return;const dx=e.clientX-d.x;let i=rkNearest();
    if(i===d.from&&Math.abs(dx)>40)i=d.from+(dx<0?1:-1);rkGo(i,true);setTimeout(()=>t.classList.remove('drag'),450);
    t.addEventListener('click',ev=>{ev.stopPropagation();ev.preventDefault()},{capture:true,once:true})};
  t.addEventListener('pointerup',end);t.addEventListener('pointercancel',end);
  t.addEventListener('click',e=>{const b=e.target.closest('.rk-apply');if(!b)return;const i=+b.dataset.liv;
    prof.livery=i===RK.cur?null:i;saveProf();renderMe();renderGalaxy();toast(`已套用星線顏色「${RINFO[i].lv.n}」`)});
  addEventListener('resize',()=>{if(cur==='me')rkGo(RK.idx<0?RK.cur:RK.idx,false)})})();
