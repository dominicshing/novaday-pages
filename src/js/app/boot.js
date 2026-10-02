/* 啟動：讀取資料、讀回照片、繪製畫面、引導頁與密碼鎖 */
(async()=>{load();
/* 照片存在 IndexedDB：先讀回來再畫面；舊資料的照片順便搬過去（全部寫入成功才改存檔） */
{let dr=[];try{const d=JSON.parse(localStorage.getItem(DKEY)||'null');dr=(d&&Array.isArray(d.photos)?d.photos:[]).filter(r=>typeof r==='string'&&r.startsWith(PH_REF)).map(r=>r.slice(PH_REF.length))}catch(e){}
  try{if(await phHydrate(entries,dr)&&await phFlush())save()}catch(e){}}
if(!prof.since){prof.since=ymd(new Date());saveProf()}$('app').classList.toggle('calm',!!prof.calm);applyRed();render();syncLockUI();if(obNeeded())openOnb();if(prof.pin)openLock('unlock');
setTimeout(()=>mediaGC().catch(()=>{}),4000)})();
