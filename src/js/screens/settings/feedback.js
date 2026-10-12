/* 設定 → 關於：為 Novaday 評分、意見回饋與問題回報
   評分：模擬手機系統的商店評分視窗（Flutter 版改用 in_app_review 的 requestReview()，由系統顯示），依裝置選樣式：
   - App Store（iOS／其他）：置中的系統提示框，點星號後出現「送出」，送出後可以「撰寫評論」
   - Google Play（Android）：底部面板，點星號後展開選填的評論欄與「提交」
   系統評分不會把星數告訴 App，所以介面不顯示星數；網頁版只把結果存在 prof.rating／prof.review，方便測試
   意見回饋：用郵件 App 寄到 config.js 的 FEEDBACK.email（沒設定時打開 GitHub 的回報頁面），也可以複製內容自己傳 */
const STAR_D='M12 3.2l2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 17l-5.4 2.9 1.1-6.1-4.5-4.2 6.1-.8z';
const rvPlatform=()=>/Android/i.test(navigator.userAgent)?'play':'ios';
/* App 圖示：沿用版本資訊的 Logo（漸層定義在頁面上，不重複宣告） */
const rvIcon=()=>{const l=document.querySelector('.ab-logo');return l?l.outerHTML.replace(/<defs>[\s\S]*?<\/defs>/,'').replace('class="ab-logo"','class="rv-logo"'):''};
let rv=null;
function rvStars(){return `<div class="rv-stars" role="radiogroup" aria-label="${tl('評分')}">${[1,2,3,4,5].map(n=>`<button type="button" role="radio" data-v="${n}" aria-checked="false" aria-label="${tl('{n} 顆星',{n})}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="${STAR_D}"/></svg></button>`).join('')}</div>`}
function rvRender(){const el=$('review'),{ui,v,step}=rv;
  if(ui==='ios'){const done=step==='done';
    el.innerHTML=`<div class="rv-bd"></div><div class="rv-ios" role="alertdialog" aria-modal="true" aria-labelledby="rvT" aria-describedby="rvM">
      <div class="rv-body"><div class="rv-icon">${rvIcon()}</div><h2 id="rvT">${done?tl('感謝你的意見回饋。'):tl('喜歡「Novaday」嗎？')}</h2>
      <p id="rvM">${done?tl('你也可以撰寫評論。'):tl('點一下星號，在 App Store 為它評分。')}</p>${rvStars()}</div>
      <div class="rv-btns${done||v?' two':''}">${done?`<button type="button" data-a="write">${tl('撰寫評論')}</button><button type="button" data-a="close" class="b">${tl('好')}</button>`
        :v?`<button type="button" data-a="close">${tl('取消')}</button><button type="button" data-a="submit" class="b">${tl('送出')}</button>`:`<button type="button" data-a="close">${tl('以後再說')}</button>`}</div></div>`;
    if(done)el.querySelectorAll('.rv-stars button').forEach(b=>b.disabled=true)}
  else{el.innerHTML=`<div class="rv-bd" data-a="close"></div><div class="rv-play" role="dialog" aria-modal="true" aria-labelledby="rvT">
      <div class="rv-grab"></div><div class="rv-app"><span class="rv-icon">${rvIcon()}</span><b translate="no">Novaday</b></div>
      <h2 id="rvT">${tl('為這個應用程式評分')}</h2><p>${tl('告訴其他人你的想法')}</p>${rvStars()}
      <div class="rv-more"${v?'':' hidden'}><textarea class="rv-txt" id="rvTxt" maxlength="500" rows="3" placeholder="${tl('描述你的使用體驗（選填）')}" aria-label="${tl('描述你的使用體驗（選填）')}">${esc(rv.txt||'')}</textarea>
        <p class="rv-note">${tl('評論會公開發布，並顯示你的 Google 帳戶名稱和個人資料相片。')}</p></div>
      <div class="rv-btns"><button type="button" data-a="close">${tl('不用了')}</button>${v?`<button type="button" data-a="submit" class="b">${tl('提交')}</button>`:''}</div></div>`}
  el.querySelectorAll('.rv-stars button').forEach((b,i)=>{b.classList.toggle('on',i<v);b.setAttribute('aria-checked',i+1===v);b.tabIndex=(v?i+1===v:i===0)?0:-1})}
function openReview(ui){rv={ui:ui||rvPlatform(),v:0,step:'ask',last:document.activeElement};const el=$('review');el.dataset.ui=rv.ui;rvRender();el.hidden=false;
  requestAnimationFrame(()=>{el.classList.add('show');const f=el.querySelector('.rv-stars button');if(f)f.focus({preventScroll:true})})}
function closeReview(){if(!rv)return;const el=$('review'),last=rv.last;rv=null;el.classList.remove('show');
  setTimeout(()=>{if(!rv){el.hidden=true;el.innerHTML=''}},reduce?0:220);if(last&&last.isConnected&&last.focus)last.focus({preventScroll:true})}
/* 選星數：重畫後焦點留在選到的星星上（點擊或方向鍵都一樣） */
function rvPick(v){if(!rv||rv.step==='done')return;if(rv.ui==='play'){const t=$('rvTxt');if(t)rv.txt=t.value}
  rv.v=v;rvRender();$('review').querySelector(`.rv-stars [data-v="${v}"]`).focus({preventScroll:true})}
function rvSubmit(){if(!rv||!rv.v)return;prof.rating=rv.v;
  if(rv.ui==='play'){const t=($('rvTxt').value||'').trim().slice(0,500);if(t)prof.review=t;else delete prof.review}
  saveProf();if(rv.ui==='ios'){rv.step='done';rvRender();$('review').querySelector('[data-a=close]').focus()}else{closeReview();toast(tl('感謝你的評論！'))}}
$('review').addEventListener('click',e=>{const b=e.target.closest('[data-v],[data-a]');if(!b||!rv)return;
  if(b.dataset.v)return rvPick(+b.dataset.v);const a=b.dataset.a;
  if(a==='close')closeReview();else if(a==='submit')rvSubmit();
  else if(a==='write'){closeReview();if(FEEDBACK.store)window.open(FEEDBACK.store,'_blank','noopener');else openFeedback('other')}});
/* 鍵盤：方向鍵選星數、Esc 關閉、Tab 只在視窗裡循環 */
$('review').addEventListener('keydown',e=>{if(!rv)return;
  if(e.key==='Escape'){e.preventDefault();e.stopPropagation();closeReview();return}
  const d={ArrowRight:1,ArrowUp:1,ArrowLeft:-1,ArrowDown:-1}[e.key];
  if(d&&e.target.closest('.rv-stars')){e.preventDefault();rvPick(Math.min(5,Math.max(1,rv.v+d)));return}
  if(e.key==='Tab'){const f=[...$('review').querySelectorAll('button:not([disabled]),textarea')].filter(x=>x.tabIndex>=0&&x.checkVisibility());if(!f.length)return;
    const i=f.indexOf(document.activeElement),n=e.shiftKey?(i<=0?f.length-1:i-1):(i===f.length-1?0:i+1);e.preventDefault();f[n].focus()}});
$('liRate').onclick=()=>openReview();

/* 意見回饋 */
const FB_TYPE={bug:{t:'問題回報',ph:'發生了什麼事？在哪個畫面、做了什麼操作？'},idea:{t:'功能建議',ph:'你希望 Novaday 多做什麼，或哪裡可以更好？'},other:{t:'其他',ph:'想對我們說的話⋯'}};
let fbType='bug';
function fbDiag(){let errs=[];try{errs=JSON.parse(localStorage.getItem('novaday.dev.errors')||'[]').slice(0,5)}catch(_){}
  const yn=b=>tl(b?'是':'否'),L=[
    tl('版本：Novaday {v}（網頁版）',{v:APP_VER}),tl('語言：{l}',{l:LANG}),tl('瀏覽器：{b}',{b:navigator.userAgent}),
    tl('螢幕：{w}×{h}，縮放 {r}x',{w:innerWidth,h:innerHeight,r:+devicePixelRatio.toFixed(2)}),
    tl('加到主畫面：{v}',{v:yn(matchMedia('(display-mode: standalone)').matches||navigator.standalone)}),
    tl('紀錄：{n} 則',{n:entries.filter(e=>!e.sample).length}),errs.length?tl('最近的錯誤：'):tl('最近的錯誤：無'),...errs.map(e=>`- ${new Date(e.t).toISOString().slice(0,16).replace('T',' ')} ${e.m.slice(0,200)}${e.s?' ('+e.s.slice(0,80)+')':''}`)];
  return L.join('\n')}
function fbRender(){$('fbType').querySelectorAll('[data-t]').forEach(b=>b.setAttribute('aria-checked',b.dataset.t===fbType));
  $('fbMsg').placeholder=tl(FB_TYPE[fbType].ph);const on=$('swFbDiag').getAttribute('aria-checked')==='true';$('fbPeek').hidden=!on;if(on)$('fbDiag').textContent=fbDiag();
  $('fbVia').textContent=FEEDBACK.email?tl('會打開你的郵件 App，寄到 {e}。',{e:FEEDBACK.email}):tl('會打開 GitHub 的回報頁面（需要 GitHub 帳號）；也可以複製內容，用其他方式傳給我們。')}
function openFeedback(t){fbType=FB_TYPE[t]?t:'bug';fbRender();openSheet('feedbackSheet');setTimeout(()=>$('fbMsg').focus({preventScroll:true}),350)}
$('fbType').onclick=e=>{const b=e.target.closest('[data-t]');if(b){fbType=b.dataset.t;fbRender()}};
$('swFbDiag').onclick=()=>{const b=$('swFbDiag');b.setAttribute('aria-checked',b.getAttribute('aria-checked')!=='true');fbRender()};
/* 寄出的標題與內文 */
function fbReport(){const m=$('fbMsg').value.trim(),diag=$('swFbDiag').getAttribute('aria-checked')==='true';
  const title=`[Novaday] ${tl(FB_TYPE[fbType].t)}${EN_UI?': ':'：'}${m.replace(/\s+/g,' ').slice(0,40)}${m.length>40?'…':''}`;
  return {m,title,body:m+(diag?'\n\n---\n'+fbDiag():'')}}
function fbEmpty(){toast(tl('請先寫下內容'));$('fbMsg').focus();return true}
/* 打開郵件 App 或 GitHub 的回報頁面 */
function fbGo(url){if(url.startsWith('mailto:'))location.href=url;else window.open(url,'_blank','noopener')}
$('fbSend').onclick=()=>{const r=fbReport();if(!r.m)return fbEmpty();
  const url=FEEDBACK.email?`mailto:${FEEDBACK.email}?subject=${encodeURIComponent(r.title)}&body=${encodeURIComponent(r.body)}`
    :`${FEEDBACK.issues}?title=${encodeURIComponent(r.title)}&body=${encodeURIComponent(r.body)}`;
  fbGo(url);
  $('fbMsg').value='';closeSheet('feedbackSheet');toast(tl('謝謝你的回饋！'),2600)};
$('fbCopy').onclick=async()=>{const r=fbReport();if(!r.m)return fbEmpty();
  try{await navigator.clipboard.writeText(r.title+'\n\n'+r.body);toast(tl('已複製內容'))}catch(_){$('fbMsg').select();toast(tl('已選取內容，請手動複製'))}};
$('liFeedback').onclick=()=>openFeedback('bug');
