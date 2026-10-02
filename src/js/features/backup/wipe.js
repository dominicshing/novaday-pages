/* 清除所有紀錄 */
function openWipe(){$('wpMsg').innerHTML=`這會永久刪除全部 <b>${entries.length}</b> 則紀錄，已點亮的星座和徽章進度也會歸零，<b>無法復原</b>。建議先匯出一份備份。`;
  $('wpIn').value='';$('wpGo').disabled=true;openSheet('wipeSheet')}
$('wpIn').addEventListener('input',()=>{$('wpGo').disabled=$('wpIn').value.trim()!=='刪除'});
$('wpExport').onclick=()=>{closeSheet('wipeSheet');refreshEx();openSheet('exporter')};
$('wpGo').onclick=()=>{if($('wpIn').value.trim()!=='刪除')return;entries=[];save();['wipeSheet','exporter','settingsSheet'].forEach(id=>$(id).classList.contains('open')&&closeSheet(id));render();toast('已清除所有紀錄')};
