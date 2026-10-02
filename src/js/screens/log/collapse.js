/* 日記頁：往下捲時收合頂部 */
/* 日記頁往下捲時收合頂部：標題縮小並與切換鈕同列，搜尋列收起；回到頂部時展開 */
(()=>{const sc=$('s-log'),top=$('logTop');let c=false,raf=0;
  const set=v=>{if(v===c)return;c=v;top.classList.toggle('cmp',v);requestAnimationFrame(()=>sc.style.setProperty('--logTop',top.offsetHeight+'px'))};
  sc.addEventListener('scroll',()=>{if(raf)return;raf=requestAnimationFrame(()=>{raf=0;const y=sc.scrollTop;if(!c&&y>72)set(true);else if(c&&y<8)set(false)})},{passive:true});
  $('logFind').onclick=()=>{sc.scrollTo({top:0,behavior:reduce?'auto':'smooth'});setTimeout(()=>{set(false);$('q').focus({preventScroll:true})},reduce?0:320)};
  new ResizeObserver(()=>sc.style.setProperty('--logTop',top.offsetHeight+'px')).observe(top)})();
