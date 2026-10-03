/* 清除所有紀錄 */
function openWipe(){$('wpMsg').innerHTML=`這會永久刪除全部 <b>${entries.length}</b> 則紀錄，已點亮的星座和徽章進度也會歸零，<b>無法復原</b>。建議先匯出一份備份。`;
  $('wpIn').value='';$('wpGo').disabled=true;openSheet('wipeSheet')}
$('wpIn').addEventListener('input',()=>{$('wpGo').disabled=$('wpIn').value.trim()!=='刪除'});
$('wpExport').onclick=()=>{closeSheet('wipeSheet');refreshEx();openSheet('exporter')};
/* 「永久刪除」要真的刪乾淨：紀錄、草稿（含暫存）、回顧紀錄、讀取修正時的留底資料，以及 IndexedDB 裡的照片與影片
   （原本照片影片要等下次開 App 才清掉） */
$('wpGo').onclick=async()=>{if($('wpIn').value.trim()!=='刪除')return;entries=[];save();
  clearDraft();edStash=null;try{['orbitlog.draft.stash.v1',BROKEN].forEach(k=>localStorage.removeItem(k))}catch(e){}
  reviews.ids={};reviews.last=null;saveReviews();
  try{await mdbDo('readwrite',st=>st.clear())}catch(e){}phURL.forEach(u=>URL.revokeObjectURL(u));phURL.clear();phKey.clear();
  ['wipeSheet','exporter','settingsSheet'].forEach(id=>$(id).classList.contains('open')&&closeSheet(id));render();toast('已清除所有紀錄')};
