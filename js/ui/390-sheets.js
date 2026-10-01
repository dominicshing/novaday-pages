/* ---------- Sheets ---------- */
/* 面板堆疊：後開的面板一定疊在最上面（例如從運勢頁打開星座詳情），關閉後回到原本的面板 */
function sheetTop(id){const l=$(id);let top=19;document.querySelectorAll('.layer.open').forEach(o=>{if(o!==l)top=Math.max(top,+getComputedStyle(o).zIndex||20)});
  l.style.zIndex=Math.min(33,Math.max(id==='ask'?26:20,top+1))}
function openSheet(id){const l=$(id);l._last=document.activeElement;
  let top=19;document.querySelectorAll('.layer.open').forEach(o=>{if(o!==l)top=Math.max(top,+getComputedStyle(o).zIndex||20)});
  /* 引導頁（z 60）開著時，面板要疊在它上面、密碼鎖（z 70）下面 */
  const onb=$('onb')&&!$('onb').hidden;l.style.zIndex=onb?Math.min(69,Math.max(61,top+1)):Math.min(33,Math.max(id==='ask'?26:20,top+1));
  l.classList.add('open');l.setAttribute('aria-hidden','false')}
function closeSheet(id){const l=$(id);l.classList.remove('open');l.querySelectorAll('video').forEach(v=>v.pause());l.setAttribute('aria-hidden','true');if(l._last&&l._last.focus)l._last.focus({preventScroll:true})}
function requestClose(id){if(id==='meSheet')tryCloseMe();else if(id==='editor')tryCloseEditor();else if(id==='ask')answer('cancel');else closeSheet(id)}
document.querySelectorAll('.layer').forEach(l=>l.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>requestClose(l.id)));

/* R10：拖曳把手或標題列往下拉即可關閉面板 */
document.querySelectorAll('.layer .sheet').forEach(sh=>{
  const l=sh.closest('.layer'),bd=l.querySelector('.bd');let d=null;
  sh.addEventListener('pointerdown',e=>{
    if(!e.target.closest('.grab,.sh')||e.target.closest('button,input,a,select,textarea,label'))return;
    if(e.pointerType==='mouse'&&e.button!==0)return;
    d={y:e.clientY,t:Date.now(),dy:0,id:e.pointerId,on:false};
    try{sh.setPointerCapture(e.pointerId)}catch(_){}
  });
  sh.addEventListener('pointermove',e=>{if(!d||e.pointerId!==d.id)return;
    const dy=Math.max(0,e.clientY-d.y);if(!d.on&&dy<4)return;
    if(!d.on){d.on=true;sh.classList.add('dragging')}
    d.dy=dy;const r=dy>0?dy:0;sh.style.transform=`translateY(${r}px)`;
    if(bd){bd.style.transition='none';bd.style.opacity=String(Math.max(.2,1-r/Math.max(1,sh.offsetHeight)))}});
  const end=e=>{if(!d||(e&&e.pointerId!==d.id))return;const {dy,t,on}=d;d=null;
    sh.classList.remove('dragging');if(bd){bd.style.transition='';bd.style.opacity=''}
    if(!on){sh.style.transform='';return}
    const v=dy/Math.max(1,Date.now()-t);
    if(dy>Math.min(140,sh.offsetHeight*.25)||(dy>50&&v>.5))requestClose(l.id);
    sh.style.transform='';
    sh._dragEnd=Date.now()};
  sh.addEventListener('click',ev=>{if(Date.now()-(sh._dragEnd||0)<350){ev.stopPropagation();ev.preventDefault()}},true);
  sh.addEventListener('pointerup',end);sh.addEventListener('pointercancel',end);
});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){const L=[...document.querySelectorAll('.layer.open')];const o=L.reduce((t,l)=>!t||(+getComputedStyle(l).zIndex||0)>=(+getComputedStyle(t).zIndex||0)?l:t,null);if(o)requestClose(o.id)}});
let askRes=null;
function ask(t,m,btns){return new Promise(res=>{askRes=res;$('askT').textContent=t;$('askM').textContent=m;
  $('askBtns').innerHTML=btns.map(b=>`<button type="button" class="btn ${b.cls||''}" data-k="${b.k}">${b.t}</button>`).join('');
  $('askBtns').querySelectorAll('button').forEach(x=>x.onclick=()=>answer(x.dataset.k));openSheet('ask');setTimeout(()=>$('askBtns').querySelector('button').focus(),60)})}
function answer(k){closeSheet('ask');const r=askRes;askRes=null;if(r)r(k)}

