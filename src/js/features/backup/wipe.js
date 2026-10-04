/* 重設：清除所有紀錄／重設個人資料與設定／全部初始化。三者共用一個面板，都要輸入確認字才能執行 */
const WP={
  entries:{t:'清除所有紀錄',w:'刪除',go:'永久刪除全部紀錄',ex:1,
    msg:()=>`這會永久刪除全部 <b>${entries.length}</b> 則紀錄，已點亮的星座和徽章進度也會歸零，<b>無法復原</b>。建議先匯出一份備份。`},
  prof:{t:'重設個人資料與設定',w:'重設',go:'重設並重新載入',ex:0,
    msg:()=>`頭像、暱稱、生日、地區、提醒、密碼鎖與所有設定都會回到預設值，星座順序也會重新抽選。<b class="keep">日記紀錄會保留</b>。`},
  all:{t:'全部初始化',w:'初始化',go:'全部刪除並初始化',ex:1,
    msg:()=>`這台裝置上的所有日記（<b>${entries.length}</b> 則）、照片、影片、個人資料與設定都會被永久刪除，回到第一次打開 App 的樣子，<b>無法復原</b>。建議先匯出一份備份。`}};
let wpMode='entries';
function openWipe(mode){wpMode=WP[mode]?mode:'entries';const m=WP[wpMode];
  $('wpTitle').textContent=m.t;$('wpMsg').innerHTML=m.msg();$('wpExport').hidden=!m.ex;
  $('wpLbl').textContent=`輸入「${m.w}」以確認`;$('wpIn').placeholder=m.w;$('wpGo').textContent=m.go;
  $('wpIn').value='';$('wpGo').disabled=true;openSheet('wipeSheet')}
const wpOK=()=>$('wpIn').value.trim()===WP[wpMode].w;
$('wpIn').addEventListener('input',()=>{$('wpGo').disabled=!wpOK()});
$('wpExport').onclick=()=>{closeSheet('wipeSheet');refreshEx();openSheet('exporter')};
/* 「永久刪除」要真的刪乾淨：紀錄、草稿（含暫存）、回顧紀錄、讀取修正時的留底資料，以及 IndexedDB 裡的照片與影片
   （原本照片影片要等下次開 App 才清掉） */
$('wpGo').onclick=async()=>{if(!wpOK())return;
  if(wpMode==='prof')return resetProfile();if(wpMode==='all')return initAll();
  entries=[];save();
  clearDraft();edStash=null;try{['orbitlog.draft.stash.v1',BROKEN].forEach(k=>localStorage.removeItem(k))}catch(e){}
  reviews.ids={};reviews.last=null;saveReviews();
  /* 最近搜尋可能含有日記裡的字，一併清掉 */
  prof.recentQ=[];saveProf();
  try{await mdbDo('readwrite',st=>st.clear())}catch(e){}phURL.forEach(u=>URL.revokeObjectURL(u));phURL.clear();phKey.clear();
  ['wipeSheet','exporter','settingsSheet'].forEach(id=>$(id).classList.contains('open')&&closeSheet(id));render();toast('已清除所有紀錄')};
/* 重設個人資料與設定：保留日記，個人資料與所有設定回到預設（開發者選項若已開啟則保持開啟） */
function resetProfile(){if(typeof devResetTools==='function')devResetTools();
  try{localStorage.setItem(PKEY,JSON.stringify(prof.devOn?{devOn:1}:{}))}catch(_){}location.reload()}
/* 全部初始化：刪除這台裝置上 Novaday 的所有資料（localStorage 與 IndexedDB），回到第一次打開 App */
function initAll(){try{Object.keys(localStorage).filter(x=>/^(orbitlog|novaday)\./.test(x)).forEach(x=>localStorage.removeItem(x))}catch(_){}
  const go=()=>location.reload();try{const r=indexedDB.deleteDatabase(MDB);r.onsuccess=r.onerror=r.onblocked=go;setTimeout(go,1500)}catch(_){go()}}
