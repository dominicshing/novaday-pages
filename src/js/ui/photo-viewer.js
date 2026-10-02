/* 看圖器 */
function openPhotoViewer(P,i){const t=$('pvTrack');t.innerHTML=P.map((u,j)=>`<div class="pv-s"><img src="${u}" alt="照片 ${j+1} / ${P.length}"></div>`).join('');
  const upd=()=>{const k=Math.round(t.scrollLeft/Math.max(1,t.clientWidth));$('pvN').textContent=P.length>1?`${k+1} / ${P.length}`:''};
  t.onscroll=upd;openSheet('phViewer');requestAnimationFrame(()=>{t.scrollLeft=i*t.clientWidth;upd()})}
document.addEventListener('keydown',e=>{if(!$('phViewer').classList.contains('open'))return;const t=$('pvTrack');if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();e.stopPropagation();t.scrollBy({left:(e.key==='ArrowRight'?1:-1)*t.clientWidth,behavior:reduce?'auto':'smooth'})}});
$('pvTrack').addEventListener('click',e=>{if(e.target===$('pvTrack')||e.target.classList.contains('pv-s'))closeSheet('phViewer')});
