/* 手勢與快捷鍵：下拉重新整理、鍵盤快捷鍵 */
/* 下拉重新整理：在畫面頂端往下拉，畫面跟著往下移，露出的空間顯示 N 字星座指示器；超過門檻放開後，
   重新讀取資料並重畫目前這一頁（不重新載入整個 App，停在原本的分頁）。
   露出的空間填上和這一頁標題列相同的顏色，不會出現顏色不同的一條（首頁標題列透明，就維持原本的星空背景） */
{const wrap=document.querySelector('.screens'),ind=document.createElement('div'),fill=document.createElement('div'),TH=70;let p=null,busy=false;
  /* N 字星座：左下 → 左上 → 右下 → 右上，右上角是金色四芒星 */
  const P=[[10,25],[10,9],[24,25],[24,9]];
  ind.className='ptr';ind.setAttribute('aria-hidden','true');fill.className='ptr-fill';fill.setAttribute('aria-hidden','true');
  ind.innerHTML=`<svg viewBox="0 0 34 34">${[0,1,2].map(i=>`<line class="pl" pathLength="1" x1="${P[i][0]}" y1="${P[i][1]}" x2="${P[i+1][0]}" y2="${P[i+1][1]}"/>`).join('')}${P.map(([x,y])=>`<circle class="ps" cx="${x}" cy="${y}" r="2.3"/>`).join('')}<path class="pk" d="${sp4(27,6,5.5)}"/></svg>`;
  wrap.append(fill,ind);const L=[...ind.querySelectorAll('.pl')],S=[...ind.querySelectorAll('.ps')];
  /* 這一頁標題列的底色（半透明的顏色照用，疊在同一個背景上才會一模一樣；透明的話不填） */
  const topBg=s=>{const t=s.querySelector('.top');if(!t)return'';const c=getComputedStyle(t);
    if(c.backgroundColor!=='rgba(0, 0, 0, 0)')return c.backgroundColor;const m=/rgba?\([^)]*\)/.exec(c.backgroundImage);return m?m[0]:''};
  /* 拉的距離 d：畫面往下移 d，指示器在露出的空間中間；連線一段段畫出，畫到的星星亮起 */
  const paint=(s,d)=>{const k=Math.min(1,d/TH);if(s)s.style.transform=d?`translateY(${d}px)`:'';fill.style.height=d+'px';
    ind.style.transform=`translateY(${Math.round(d/2-25)}px)`;ind.style.opacity=Math.min(1,d/(TH*.5));
    L.forEach((l,i)=>l.style.strokeDashoffset=String(1-Math.max(0,Math.min(1,k*3-i))));S.forEach((c,i)=>c.classList.toggle('on',k*3>=i-.05));ind.classList.toggle('ready',d>=TH)};
  const hide=s=>{ind.classList.add('back');fill.classList.add('back');if(s)s.classList.add('ptr-back');paint(s,0);
    setTimeout(()=>{ind.classList.remove('back','ready','go');fill.classList.remove('back');if(s)s.classList.remove('ptr-back')},300)};
  /* 重新讀取：從儲存空間讀回紀錄（含照片），重畫所有畫面；至少轉 0.7 秒，讓人看得出有更新 */
  async function refresh(s){busy=true;ind.classList.add('go');const t0=Date.now();
    try{load();await phHydrate(entries);if(typeof dayCheck==='function')dayCheck();render();if(cur==='me'&&typeof renderFootprint==='function')renderFootprint()}catch(e){}
    await new Promise(r=>setTimeout(r,Math.max(0,(reduce?250:700)-(Date.now()-t0))));hide(s);busy=false}
  wrap.addEventListener('touchstart',e=>{const s=e.target.closest('.screen.active');p=null;
    if(busy||e.touches.length!==1||!s||s.scrollTop>0||e.target.closest('input,textarea,select,[contenteditable]'))return;
    p={s,x:e.touches[0].clientX,y:e.touches[0].clientY,d:0,on:false}},{passive:true});
  wrap.addEventListener('touchmove',e=>{if(!p)return;if(e.touches.length!==1){if(p.on)hide(p.s);p=null;return}
    const dx=e.touches[0].clientX-p.x,dy=e.touches[0].clientY-p.y;
    /* 在頁面頂端往下拉：第一次移動就擋下瀏覽器的捲動（iOS 一開始回彈之後就擋不住），改由 App 自己移動畫面 */
    if(!p.on){if(dy>0&&dy>=Math.abs(dx)&&p.s.scrollTop<=0&&e.cancelable)e.preventDefault();
      if(Math.abs(dx)<8&&Math.abs(dy)<8)return;if(dy<=0||Math.abs(dx)>dy||p.s.scrollTop>0){p=null;return}p.on=true;fill.style.background=topBg(p.s)}
    if(e.cancelable)e.preventDefault();p.d=Math.min(120,Math.max(0,dy)*.5);paint(p.s,p.d)},{passive:false});
  const end=()=>{if(!p)return;const {s,d,on}=p;p=null;if(!on)return;
    if(d>=TH){buzz(8);ind.classList.add('back');fill.classList.add('back');s.classList.add('ptr-back');paint(s,TH*.8);refresh(s)}
    else hide(s)};
  wrap.addEventListener('touchend',end);wrap.addEventListener('touchcancel',end)}
/* 桌面快捷鍵：N 新增、/ 搜尋；詳情頁左右方向鍵切換 */
document.addEventListener('keydown',e=>{if(e.metaKey||e.ctrlKey||e.altKey)return;const t=e.target;if(t&&(t.isContentEditable||/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)))return;
  if(!$('lock').hidden||!$('onb').hidden)return;
  const open=[...document.querySelectorAll('.layer.open')];
  if($('detail').classList.contains('open')&&open.length===1&&(e.key==='ArrowLeft'||e.key==='ArrowRight')){e.preventDefault();detailGo(e.key==='ArrowRight'?1:-1);return}
  if(open.length)return;
  if(e.key==='n'||e.key==='N'){e.preventDefault();openEditor()}
  else if(e.key==='/'){e.preventDefault();go('log','list');setTimeout(()=>{$('s-log').scrollTop=0;$('q').focus()},60)}});
