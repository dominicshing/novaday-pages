/* 捲動行為與 iOS 風格捲動指示條 */
function scrollToEl(el,where){const sc=el.closest('.sb,.screen');if(!sc)return;const r=el.getBoundingClientRect(),s=sc.getBoundingClientRect();
  let top=sc.scrollTop+(r.top-s.top);top=where==='center'?top-(sc.clientHeight-r.height)/2:top-12;
  if(where==='nearest'&&r.top>=s.top&&r.bottom<=s.bottom)return;sc.scrollTo({top:Math.max(0,top),behavior:reduce?'auto':'smooth'})}
['app','device'].forEach(id=>$(id).addEventListener('scroll',e=>{e.target.scrollTop=0;e.target.scrollLeft=0}));
function iosScroll(sc){const host=sc.parentElement,bar=document.createElement('div');bar.className='ios-bar';host.appendChild(bar);let t;
  const upd=()=>{const H=sc.clientHeight,S=sc.scrollHeight;if(!H||S<=H+1){bar.style.opacity=0;return}
    const len=Math.max(36,H*H/S),p=Math.min(1,Math.max(0,sc.scrollTop/(S-H))),top=sc.offsetTop+4+(H-len-8)*p;
    bar.style.height=len+'px';bar.style.transform=`translateY(${top}px)`;bar.style.opacity=1;clearTimeout(t);t=setTimeout(()=>bar.style.opacity=0,900)};
  sc.addEventListener('scroll',upd,{passive:true})}
document.querySelectorAll('.screen,.sb').forEach(iosScroll);
/* 分頁往下捲動時，標題列切換成不透明底（.top.stuck） */
document.querySelectorAll('.screen').forEach(sc=>{const t=sc.querySelector(':scope>.top');if(!t)return;
  sc.addEventListener('scroll',()=>t.classList.toggle('stuck',sc.scrollTop>4),{passive:true})});
