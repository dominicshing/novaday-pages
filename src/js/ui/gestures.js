/* 手勢與快捷鍵：下拉重新整理、鍵盤快捷鍵 */
/* 下拉重新整理：在畫面頂端往下拉，超過門檻後放開，重新讀取資料並重畫目前這一頁（不重新載入整個 App，停在原本的分頁）。
   畫面本身不跟著移動，只有指示器浮在內容上方往下滑 */
{const wrap=document.querySelector('.screens'),ind=document.createElement('div'),TH=70;let p=null,busy=false;
  /* N 字星座：左下 → 左上 → 右下 → 右上，右上角是金色四芒星 */
  const P=[[10,25],[10,9],[24,25],[24,9]];
  ind.className='ptr';ind.setAttribute('aria-hidden','true');
  ind.innerHTML=`<svg viewBox="0 0 34 34">${[0,1,2].map(i=>`<line class="pl" pathLength="1" x1="${P[i][0]}" y1="${P[i][1]}" x2="${P[i+1][0]}" y2="${P[i+1][1]}"/>`).join('')}${P.map(([x,y])=>`<circle class="ps" cx="${x}" cy="${y}" r="2.3"/>`).join('')}<path class="pk" d="${sp4(27,6,5.5)}"/></svg>`;
  wrap.appendChild(ind);const L=[...ind.querySelectorAll('.pl')],S=[...ind.querySelectorAll('.ps')];
  /* 拉的進度 0～1：連線一段段畫出，畫到的星星亮起 */
  const paint=d=>{const k=Math.min(1,d/TH);ind.style.transform=`translateY(${Math.min(d,TH+20)-52+Math.round(k*12)}px)`;ind.style.opacity=Math.min(1,d/(TH*.5));
    L.forEach((l,i)=>l.style.strokeDashoffset=String(1-Math.max(0,Math.min(1,k*3-i))));S.forEach((c,i)=>c.classList.toggle('on',k*3>=i-.05));ind.classList.toggle('ready',d>=TH)};
  const hide=()=>{ind.classList.add('back');paint(0);setTimeout(()=>ind.classList.remove('back','ready','go'),300)};
  /* 重新讀取：從儲存空間讀回紀錄（含照片），重畫所有畫面；至少轉 0.7 秒，讓人看得出有更新 */
  async function refresh(){busy=true;ind.classList.add('go');const t0=Date.now();
    try{load();await phHydrate(entries);if(typeof dayCheck==='function')dayCheck();render();if(cur==='me'&&typeof renderFootprint==='function')renderFootprint()}catch(e){}
    await new Promise(r=>setTimeout(r,Math.max(0,(reduce?250:700)-(Date.now()-t0))));hide();busy=false}
  wrap.addEventListener('touchstart',e=>{const s=e.target.closest('.screen.active');p=null;
    if(busy||e.touches.length!==1||!s||s.scrollTop>0||e.target.closest('input,textarea,select,[contenteditable]'))return;
    p={s,x:e.touches[0].clientX,y:e.touches[0].clientY,d:0,on:false}},{passive:true});
  wrap.addEventListener('touchmove',e=>{if(!p)return;if(e.touches.length!==1){if(p.on)hide();p=null;return}
    const dx=e.touches[0].clientX-p.x,dy=e.touches[0].clientY-p.y;
    if(!p.on){if(Math.abs(dx)<8&&Math.abs(dy)<8)return;if(dy<=0||Math.abs(dx)>dy||p.s.scrollTop>0){p=null;return}p.on=true}
    if(e.cancelable)e.preventDefault();p.d=Math.min(120,Math.max(0,dy)*.5);paint(p.d)},{passive:false});
  const end=()=>{if(!p)return;const {d,on}=p;p=null;if(!on)return;
    if(d>=TH){buzz(8);ind.classList.add('back');paint(TH);refresh()}
    else hide()};
  wrap.addEventListener('touchend',end);wrap.addEventListener('touchcancel',end);
  window.ptrRefresh=()=>{if(!busy){ind.classList.add('back');paint(TH);refresh()}}}
/* 桌面快捷鍵：N 新增、/ 搜尋；詳情頁左右方向鍵切換 */
document.addEventListener('keydown',e=>{if(e.metaKey||e.ctrlKey||e.altKey)return;const t=e.target;if(t&&(t.isContentEditable||/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)))return;
  if(!$('lock').hidden||!$('onb').hidden)return;
  const open=[...document.querySelectorAll('.layer.open')];
  if($('detail').classList.contains('open')&&open.length===1&&(e.key==='ArrowLeft'||e.key==='ArrowRight')){e.preventDefault();detailGo(e.key==='ArrowRight'?1:-1);return}
  if(open.length)return;
  if(e.key==='n'||e.key==='N'){e.preventDefault();openEditor()}
  else if(e.key==='/'){e.preventDefault();go('log','list');setTimeout(()=>{$('s-log').scrollTop=0;$('q').focus()},60)}});
