/* 設定 → 關於：為 Novaday 評分、意見回饋與問題回報
   網頁版沒有伺服器：回饋用郵件 App 寄出（config.js 的 FEEDBACK.email），沒設定時打開 GitHub 的回報頁面，也可以複製內容自己傳。
   評分存在 prof.rating（1–5），會附在回饋的裝置資訊裡；4–5 顆星引導到商店評分（上架後）或分享給朋友，1–3 顆星請使用者寫下意見 */
const STAR_D='M12 3.2l2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 17l-5.4 2.9 1.1-6.1-4.5-4.2 6.1-.8z';
const RATE_LBL=['很不喜歡','不太喜歡','還可以','喜歡','非常喜歡'];
function renderRateRow(){$('rateVal').textContent=prof.rating?'★ '+prof.rating:''}
function renderStars(v){$('rtStars').querySelectorAll('button').forEach((b,i)=>{b.setAttribute('aria-checked',i+1===v);b.classList.toggle('on',i<v);b.tabIndex=(v?i+1===v:i===0)?0:-1})}
$('rtStars').innerHTML=RATE_LBL.map((l,i)=>`<button type="button" role="radio" data-v="${i+1}" aria-label="${tl('{n} 顆星',{n:i+1})}・${tl(l)}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="${STAR_D}"/></svg></button>`).join('');
function rateStep(v){$('rtLbl').textContent=v?tl(RATE_LBL[v-1]):tl('點一下星星評分');$('rtNext').hidden=!v;if(!v)return;
  const hi=v>=4;$('rtMsg').textContent=hi?tl('謝謝你的支持！')+(EN_UI?' ':'')+(FEEDBACK.store?tl('到商店留下評價，能讓更多人找到 Novaday。'):tl('把 Novaday 分享給朋友，一起點亮星空吧。')):tl('謝謝你誠實的評分。願意告訴我們哪裡可以更好嗎？');
  $('rtGo').textContent=hi?(FEEDBACK.store?tl('到商店留下評價'):tl('分享給朋友')):tl('寫下意見');$('rtMore').hidden=!hi}
function openRate(){renderStars(prof.rating||0);rateStep(prof.rating||0);openSheet('rateSheet')}
function setRating(v){prof.rating=v;saveProf();renderStars(v);rateStep(v);renderRateRow();toast(tl('已記錄你的評分'))}
$('rtStars').onclick=e=>{const b=e.target.closest('[data-v]');if(b)setRating(+b.dataset.v)};
/* 方向鍵切換星數（radiogroup 的鍵盤操作） */
$('rtStars').onkeydown=e=>{const d={ArrowRight:1,ArrowUp:1,ArrowLeft:-1,ArrowDown:-1}[e.key];if(!d)return;e.preventDefault();
  const v=Math.min(5,Math.max(1,(prof.rating||0)+d));setRating(v);$('rtStars').querySelector(`[data-v="${v}"]`).focus()};
async function shareApp(){const url=location.origin+location.pathname,text=tl('我在用 Novaday 寫星空日記，每天點亮一顆新星。');
  if(navigator.share){try{await navigator.share({title:'Novaday',text,url})}catch(_){}return}
  try{await navigator.clipboard.writeText(text+' '+url);toast(tl('已複製連結'))}catch(_){toast(url,4000)}}
$('rtGo').onclick=()=>{if((prof.rating||0)<4){closeSheet('rateSheet');openFeedback('idea');return}
  if(FEEDBACK.store)window.open(FEEDBACK.store,'_blank','noopener');else shareApp()};
$('rtMore').onclick=()=>{closeSheet('rateSheet');openFeedback('idea')};
$('liRate').onclick=openRate;

/* 意見回饋 */
const FB_TYPE={bug:{t:'問題回報',ph:'發生了什麼事？在哪個畫面、做了什麼操作？'},idea:{t:'功能建議',ph:'你希望 Novaday 多做什麼，或哪裡可以更好？'},other:{t:'其他',ph:'想對我們說的話⋯'}};
let fbType='bug';
function fbDiag(){let errs=[];try{errs=JSON.parse(localStorage.getItem('novaday.dev.errors')||'[]').slice(0,5)}catch(_){}
  const yn=b=>tl(b?'是':'否'),L=[
    tl('版本：Novaday {v}（網頁版）',{v:APP_VER}),tl('語言：{l}',{l:LANG}),tl('瀏覽器：{b}',{b:navigator.userAgent}),
    tl('螢幕：{w}×{h}，縮放 {r}x',{w:innerWidth,h:innerHeight,r:+devicePixelRatio.toFixed(2)}),
    tl('加到主畫面：{v}',{v:yn(matchMedia('(display-mode: standalone)').matches||navigator.standalone)}),
    tl('紀錄：{n} 則',{n:entries.filter(e=>!e.sample).length}),...(prof.rating?[tl('評分：{n} / 5',{n:prof.rating})]:[]),
    errs.length?tl('最近的錯誤：'):tl('最近的錯誤：無'),...errs.map(e=>`- ${new Date(e.t).toISOString().slice(0,16).replace('T',' ')} ${e.m.slice(0,200)}${e.s?' ('+e.s.slice(0,80)+')':''}`)];
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
$('fbSend').onclick=()=>{const r=fbReport();if(!r.m)return fbEmpty();
  const url=FEEDBACK.email?`mailto:${FEEDBACK.email}?subject=${encodeURIComponent(r.title)}&body=${encodeURIComponent(r.body)}`
    :`${FEEDBACK.issues}?title=${encodeURIComponent(r.title)}&body=${encodeURIComponent(r.body)}`;
  if(FEEDBACK.email)location.href=url;else window.open(url,'_blank','noopener');
  $('fbMsg').value='';closeSheet('feedbackSheet');toast(tl('謝謝你的回饋！'),2600)};
$('fbCopy').onclick=async()=>{const r=fbReport();if(!r.m)return fbEmpty();
  try{await navigator.clipboard.writeText(r.title+'\n\n'+r.body);toast(tl('已複製內容'))}catch(_){$('fbMsg').select();toast(tl('已選取內容，請手動複製'))}};
$('liFeedback').onclick=()=>openFeedback('bug');
renderRateRow();
