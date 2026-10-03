/* 底部面板：開關、堆疊、拖曳關閉、確認對話框 */
/* 面板堆疊：後開的面板一定疊在最上面（例如從運勢頁打開星座詳情），關閉後回到原本的面板 */
function sheetTop(id){const l=$(id);let top=19;document.querySelectorAll('.layer.open').forEach(o=>{if(o!==l)top=Math.max(top,+getComputedStyle(o).zIndex||20)});
  l.style.zIndex=top>33?Math.min(79,top+1):Math.min(33,Math.max(id==='ask'?26:20,top+1))}
function openSheet(id){const l=$(id);l._last=document.activeElement;l._lastKey=l._last&&(l._last.id?'#'+CSS.escape(l._last.id):l._last.dataset&&l._last.dataset.id?`${l._last.tagName}[data-id="${CSS.escape(l._last.dataset.id)}"]`:null);
  let top=19;document.querySelectorAll('.layer.open').forEach(o=>{if(o!==l)top=Math.max(top,+getComputedStyle(o).zIndex||20)});
  /* 引導頁（z 60）開著時，面板要疊在它上面、密碼鎖（z 70）下面；密碼鎖開著時（例如「忘記密碼？」的確認），疊在密碼鎖上面 */
  const onb=$('onb')&&!$('onb').hidden,lock=$('lock')&&!$('lock').hidden;
  /* 慶祝畫面（星座完成、升級，z 40）開著時從上面點「分享圖卡」：面板要疊在慶祝畫面上面，否則會開在它後面看不到 */
  const ov=[...document.querySelectorAll('.overlay.show')].reduce((m,o)=>Math.max(m,+getComputedStyle(o).zIndex||40),0);
  l.style.zIndex=lock?Math.min(79,Math.max(71,top+1)):onb?Math.min(69,Math.max(61,top+1)):ov?Math.min(59,Math.max(ov+1,top+1)):Math.min(33,Math.max(id==='ask'?26:20,top+1));
  l.classList.add('open');l.setAttribute('aria-hidden','false');
  /* 鍵盤與螢幕報讀：焦點移進面板（呼叫的地方自己指定焦點時就不動），面板內容畫好後再移 */
  requestAnimationFrame(()=>{if(!l.classList.contains('open')||l.contains(document.activeElement))return;
    const d=l.querySelector('[role=dialog],[role=alertdialog]')||l;if(!d.hasAttribute('tabindex'))d.setAttribute('tabindex','-1');d.focus({preventScroll:true})})}
function closeSheet(id){const l=$(id);l.classList.remove('open');l.querySelectorAll('video').forEach(v=>v.pause());l.setAttribute('aria-hidden','true');/* 焦點回到打開面板的按鈕；如果那個按鈕已經重畫（例如日記列表更新），找畫面上同一個按鈕 */
  let b=l._last;if(b&&!b.isConnected&&l._lastKey)b=document.querySelector(l._lastKey);if(b&&b.focus)b.focus({preventScroll:true})}
function requestClose(id){if(id==='meSheet')tryCloseMe();else if(id==='editor')tryCloseEditor();else if(id==='ask')answer('cancel');else closeSheet(id)}
document.querySelectorAll('.layer').forEach(l=>l.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>requestClose(l.id)));
/* 拖曳把手或標題列往下拉即可關閉面板 */
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
/* 最上層：開著的面板，或慶祝畫面（星座完成、升級）——鍵盤的 Esc 與 Tab 都以它為準 */
const topLayer=()=>[...document.querySelectorAll('.layer.open,.overlay.show')].reduce((t,l)=>!t||(+getComputedStyle(l).zIndex||0)>=(+getComputedStyle(t).zIndex||0)?l:t,null);
const FOCUSABLE='button:not(:disabled),a[href],input:not(:disabled):not([type=hidden]),select:not(:disabled),textarea:not(:disabled),[tabindex]:not([tabindex="-1"])';
document.addEventListener('keydown',e=>{if(e.isComposing||e.keyCode===229)return;
  if(e.key==='Escape'){const o=topLayer();if(!o)return;
    /* 慶祝畫面按 Esc：等同按主要按鈕（收進圖鑑／繼續觀星） */
    if(o.classList.contains('overlay')){const b=o.querySelector('.btn.primary');if(b)b.click()}else requestClose(o.id)}
  /* Tab 只在最上層的面板裡循環，不會跑到被蓋住的頁面 */
  else if(e.key==='Tab'){const o=topLayer();if(!o)return;
    const f=[...o.querySelectorAll(FOCUSABLE)].filter(x=>x.getClientRects().length&&getComputedStyle(x).visibility!=='hidden');if(!f.length)return;
    const a=document.activeElement,i=f.indexOf(a);
    if(!o.contains(a)||(e.shiftKey&&i===0)||(!e.shiftKey&&i===f.length-1)){e.preventDefault();f[e.shiftKey?f.length-1:0].focus()}}});
let askRes=null;
function ask(t,m,btns){return new Promise(res=>{askRes=res;$('askT').textContent=t;$('askM').textContent=m;
  $('askBtns').innerHTML=btns.map(b=>`<button type="button" class="btn ${b.cls||''}" data-k="${b.k}">${b.t}</button>`).join('');
  $('askBtns').querySelectorAll('button').forEach(x=>x.onclick=()=>answer(x.dataset.k));openSheet('ask');setTimeout(()=>$('askBtns').querySelector('button').focus(),60)})}
function answer(k){closeSheet('ask');const r=askRes;askRes=null;if(r)r(k)}
