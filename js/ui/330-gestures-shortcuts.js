/* ---------- R20：手勢、快捷鍵與觸感 ---------- */
const buzz=p=>{try{if(!reduce&&navigator.vibrate)navigator.vibrate(p)}catch(_){}};
function detailNeighbors(){const A=ascEntries(),i=A.findIndex(x=>x.id===detailId);return{prev:A[i-1],next:A[i+1]}}
async function detailGo(dir){const {prev,next}=detailNeighbors(),t=dir>0?next:prev;const dv=$('dBody').querySelector('.dv');
  if(!t){if(dv){dv.classList.add('slide');dv.style.transform='';setTimeout(()=>dv.classList.remove('slide'),220)}return false}
  if(dv&&!reduce){dv.classList.add('slide');dv.style.transform=`translateX(${dir>0?-40:40}%)`;dv.style.opacity='0';await sleep(160)}
  openDetail(t.id);$('dBody').scrollTop=0;const nv=$('dBody').querySelector('.dv');
  if(nv&&!reduce){nv.style.transform=`translateX(${dir>0?30:-30}%)`;nv.style.opacity='0';void nv.offsetWidth;nv.classList.add('slide');nv.style.transform='';nv.style.opacity='';setTimeout(()=>nv.classList.remove('slide'),220)}
  buzz(6);return true}
{const body=$('dBody');let g=null;
  body.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse')return; /* 滑鼠用方向鍵切換，保留選取文字的功能 */if(e.target.closest('input,textarea,.dv-gal'))return;g={x:e.clientX,y:e.clientY,dx:0,on:false,id:e.pointerId}});
  body.addEventListener('pointermove',e=>{if(!g||e.pointerId!==g.id)return;const dx=e.clientX-g.x,dy=e.clientY-g.y;
    if(!g.on){if(Math.abs(dx)<12)return;if(Math.abs(dy)>Math.abs(dx)){g=null;return}g.on=true;body.classList.add('swiping');try{body.setPointerCapture(e.pointerId)}catch(_){}}
    const {prev,next}=detailNeighbors();const has=dx<0?next:prev;g.dx=has?dx:dx*.25;const dv=body.querySelector('.dv');if(dv)dv.style.transform=`translateX(${g.dx}px)`});
  const end=()=>{if(!g)return;const {dx,on}=g;g=null;body.classList.remove('swiping');if(!on)return;body._swEnd=Date.now();
    if(Math.abs(dx)>70)detailGo(dx<0?1:-1);else{const dv=body.querySelector('.dv');if(dv){dv.classList.add('slide');dv.style.transform='';setTimeout(()=>dv.classList.remove('slide'),220)}}};
  body.addEventListener('pointerup',end);body.addEventListener('pointercancel',end);
  body.addEventListener('click',e=>{if(Date.now()-(body._swEnd||0)<300){e.stopPropagation();e.preventDefault()}},true)}
/* 下拉重新整理：在畫面頂端往下拉，超過門檻後放開就重新載入 */
{const wrap=document.querySelector('.screens'),ind=document.createElement('div'),TH=70;let p=null;
  ind.className='ptr';ind.setAttribute('aria-hidden','true');ind.innerHTML=`<svg viewBox="0 0 24 24"><path d="${sp4(12,12,8)}"/></svg>`;wrap.appendChild(ind);
  const paint=d=>{ind.style.transform=`translateY(${d-44}px)`;ind.style.opacity=Math.min(1,d/TH);ind.firstChild.style.transform=`rotate(${d*3}deg)`;ind.classList.toggle('ready',d>=TH)};
  const reset=s=>{ind.classList.add('back');s.classList.add('ptr-back');s.style.transform='';paint(0);setTimeout(()=>{ind.classList.remove('back','ready');s.classList.remove('ptr-back')},260)};
  wrap.addEventListener('touchstart',e=>{const s=e.target.closest('.screen.active');p=null;
    if(e.touches.length!==1||!s||s.scrollTop>0||e.target.closest('input,textarea,select,[contenteditable]'))return;
    p={s,x:e.touches[0].clientX,y:e.touches[0].clientY,d:0,on:false}},{passive:true});
  wrap.addEventListener('touchmove',e=>{if(!p)return;if(e.touches.length!==1){if(p.on)reset(p.s);p=null;return}
    const dx=e.touches[0].clientX-p.x,dy=e.touches[0].clientY-p.y;
    if(!p.on){if(Math.abs(dx)<8&&Math.abs(dy)<8)return;if(dy<=0||Math.abs(dx)>dy||p.s.scrollTop>0){p=null;return}p.on=true}
    if(e.cancelable)e.preventDefault();p.d=Math.min(120,Math.max(0,dy)*.5);p.s.style.transform=`translateY(${p.d}px)`;paint(p.d)},{passive:false});
  const end=()=>{if(!p)return;const {s,d,on}=p;p=null;if(!on)return;
    if(d>=TH){buzz(8);ind.classList.add('go');s.classList.add('ptr-back');s.style.transform=`translateY(${TH*.6}px)`;paint(TH);setTimeout(()=>location.reload(),reduce?0:420)}
    else reset(s)};
  wrap.addEventListener('touchend',end);wrap.addEventListener('touchcancel',end)}
/* 桌面快捷鍵：N 新增、/ 搜尋；詳情頁左右方向鍵切換 */
document.addEventListener('keydown',e=>{if(e.metaKey||e.ctrlKey||e.altKey)return;const t=e.target;if(t&&(t.isContentEditable||/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)))return;
  if(!$('lock').hidden||!$('onb').hidden)return;
  const open=[...document.querySelectorAll('.layer.open')];
  if($('detail').classList.contains('open')&&open.length===1&&(e.key==='ArrowLeft'||e.key==='ArrowRight')){e.preventDefault();detailGo(e.key==='ArrowRight'?1:-1);return}
  if(open.length)return;
  if(e.key==='n'||e.key==='N'){e.preventDefault();openEditor()}
  else if(e.key==='/'){e.preventDefault();go('log','list');setTimeout(()=>{$('s-log').scrollTop=0;$('q').focus()},60)}});

