/* 啟動：讀取資料、讀回照片、繪製畫面、引導頁與密碼鎖 */
(async()=>{load();
/* 照片存在 IndexedDB：先讀回來再畫面；舊資料的照片順便搬過去（全部寫入成功才改存檔） */
{let dr=[];try{const d=JSON.parse(localStorage.getItem(DKEY)||'null');dr=(d&&Array.isArray(d.photos)?d.photos:[]).filter(r=>typeof r==='string'&&r.startsWith(PH_REF)).map(r=>r.slice(PH_REF.length))}catch(e){}
  try{if(await phHydrate(entries,dr)&&await phFlush())save()}catch(e){}}
if(!prof.since){prof.since=ymd(new Date());saveProf()}$('app').classList.toggle('calm',!!prof.calm);$('device').classList.toggle('calm',!!prof.calm);applyRed();render();syncLockUI();if(obNeeded())openOnb();if(prof.pin)openLock('unlock');
/* 瀏覽器封鎖網站資料（例如關閉了 Cookie 與網站資料）：寫下的紀錄關掉頁面就會消失，先清楚告訴使用者 */
{let ok=true;try{localStorage.setItem('novaday.probe','1');localStorage.removeItem('novaday.probe')}catch(e){ok=false}
  if(!ok)setTimeout(()=>toast('這個瀏覽器封鎖了網站資料，寫下的紀錄關閉頁面後會消失。請允許網站資料，或改用一般瀏覽模式',8000),1200)}
setTimeout(()=>mediaGC().catch(()=>{}),4000)})();
/* 同時開著兩個分頁：另一個分頁存檔時（storage 事件只會在「其他」分頁觸發），這裡立刻讀回最新的紀錄、個人資料與回顧紀錄，
   避免之後用這裡的舊資料存檔，蓋掉另一個分頁剛寫的紀錄 */
addEventListener('storage',async e=>{
  if(e.key===KEY||e.key===null){load();try{await phHydrate(entries)}catch(_){}render()}
  else if(e.key===PKEY&&e.newValue){try{Object.assign(prof,JSON.parse(e.newValue))}catch(_){}render()}
  else if(e.key===RKEY&&e.newValue){try{Object.assign(reviews,JSON.parse(e.newValue))}catch(_){}render()}});
