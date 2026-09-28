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
/* 桌面快捷鍵：N 新增、/ 搜尋；詳情頁左右方向鍵切換 */
document.addEventListener('keydown',e=>{if(e.metaKey||e.ctrlKey||e.altKey)return;const t=e.target;if(t&&(t.isContentEditable||/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)))return;
  if(!$('lock').hidden||!$('onb').hidden)return;
  const open=[...document.querySelectorAll('.layer.open')];
  if($('detail').classList.contains('open')&&open.length===1&&(e.key==='ArrowLeft'||e.key==='ArrowRight')){e.preventDefault();detailGo(e.key==='ArrowRight'?1:-1);return}
  if(open.length)return;
  if(e.key==='n'||e.key==='N'){e.preventDefault();openEditor()}
  else if(e.key==='/'){e.preventDefault();go('log','list');setTimeout(()=>{$('s-log').scrollTop=0;$('q').focus()},60)}});

