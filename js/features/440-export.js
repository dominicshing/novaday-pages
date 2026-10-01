/* ---------- Export ---------- */
let fmt='full';
const BK_PROF=['avatar','name','ship','motto','since','birthday','region','livery','conOrder','nextPick'];
function backupObj(){const P={};BK_PROF.forEach(k=>{if(prof[k]!=null)P[k]=prof[k]});return{app:'Novaday',kind:'backup',v:1,at:new Date().toISOString(),profile:P,reviews,entries:sorted()}}
const EX_HINT={full:'包含所有紀錄、<b>照片</b>、個人資料和星座進度，可以用「從備份還原」完整還原。<b>建議選這個。</b>',
  json:'結構化的紀錄資料（不含照片），也可以用來還原紀錄。',text:'方便閱讀，或貼到其他筆記 App。這個格式<b>無法</b>用來還原。'};
function exportText(real){if(fmt==='full'){const o=backupObj();if(!real)o.entries=o.entries.map(e=>e.photo?{...e,photo:'（照片）',...(e.photoMore?{photoMore:e.photoMore.map(()=>'（照片）')}:{})}:e);return JSON.stringify(o,null,real?0:2)}
  if(fmt==='json')return JSON.stringify(sorted().map(({photo,photoMore,...e})=>({...e,hasPhoto:!!photo})),null,2);
  return sorted().map(e=>`【${fmtDay(e.date)} ${e.time||''}】\n${e.title||untitled(e)}\n心情：✦ ${MOODS[e.mood??2].n}${e.loc?'｜地點：'+e.loc:''}${(e.tags||[]).length?'｜標籤：'+e.tags.join('、'):''}${e.prompt?'\n提示：'+e.prompt:''}\n\n${e.body}`).join('\n\n———\n\n')||'目前沒有紀錄。'}
function refreshEx(){$('exOut').value=exportText();document.querySelectorAll('#exporter .exseg button').forEach(b=>b.setAttribute('aria-checked',String(b.dataset.f===fmt)));
  const ph=entries.reduce((t,e)=>t+photoCount(e),0);$('exHint').innerHTML=EX_HINT[fmt]+(fmt==='full'?`<br>共 ${entries.length} 則紀錄${ph?`、${ph} 張照片`:''}。`:'')}
$('openExport').onclick=()=>{refreshEx();openSheet('exporter')};
let rgAfter=null;
function renderRegion(){const cur=prof.region;
  $('rgList').innerHTML=REGIONS.map(([g,l])=>`<div class="rg-h">${g}</div><div class="rg-grid">${l.map(([n,la])=>`<button type="button" class="rg-c" data-n="${n}" data-la="${la}" aria-pressed="${!!cur&&cur.name===n}">${n}<small>${Math.abs(la).toFixed(1)}°${la>=0?'N':'S'}</small></button>`).join('')}</div>`).join('')
    +(cur&&!REGIONS.some(([,l])=>l.some(([n])=>n===cur.name))?`<div class="rg-h">目前</div><div class="rg-grid"><button type="button" class="rg-c" aria-pressed="true" disabled>${esc(cur.name)}<small>${Math.abs(cur.lat).toFixed(1)}°${cur.lat>=0?'N':'S'}</small></button></div>`:'');
  $('rgList').querySelectorAll('.rg-c[data-n]').forEach(b=>b.onclick=()=>setRegion({name:b.dataset.n,lat:+b.dataset.la}))}
function setRegion(r){prof.region=r;saveProf();renderMe();renderCal();closeSheet('regionSheet');
  toast(r?`地區已設為${r.name}，星座可見度已更新`:'已取消地區設定');const f=rgAfter;rgAfter=null;if(f)f()}
function openRegion(after){rgAfter=after||null;renderRegion();openSheet('regionSheet')}
$('liRegion').onclick=()=>openRegion();
$('rgNone').onclick=()=>setRegion(null);
/* 取得目前位置（地區面板與引導頁共用） */
function geoRegion(done){if(!navigator.geolocation){toast('這個裝置無法取得位置，請直接選城市');return}
  toast('正在取得位置…',4000);
  navigator.geolocation.getCurrentPosition(p=>{const la=Math.round(p.coords.latitude*10)/10,lo=Math.round(p.coords.longitude*10)/10;done({name:`目前位置（${Math.abs(la).toFixed(1)}°${la>=0?'N':'S'}）`,lat:la,lon:lo})},
    ()=>toast('無法取得位置，請直接選城市'),{timeout:8000,maximumAge:3600000})}
$('rgGeo').onclick=()=>geoRegion(setRegion);
document.querySelectorAll('#exporter .exseg button').forEach(b=>b.onclick=()=>{fmt=b.dataset.f;refreshEx()});
$('copyEx').onclick=async()=>{try{await navigator.clipboard.writeText(exportText(true));toast('已複製內容')}catch(e){$('exOut').select();toast('已選取內容，請手動複製')}};
function openWipe(){$('wpMsg').innerHTML=`這會永久刪除全部 <b>${entries.length}</b> 則紀錄，已點亮的星座和徽章進度也會歸零，<b>無法復原</b>。建議先匯出一份備份。`;
  $('wpIn').value='';$('wpGo').disabled=true;openSheet('wipeSheet')}
$('wpIn').addEventListener('input',()=>{$('wpGo').disabled=$('wpIn').value.trim()!=='刪除'});
$('wpExport').onclick=()=>{closeSheet('wipeSheet');refreshEx();openSheet('exporter')};
$('wpGo').onclick=()=>{if($('wpIn').value.trim()!=='刪除')return;entries=[];save();['wipeSheet','exporter','settingsSheet'].forEach(id=>$(id).classList.contains('open')&&closeSheet(id));render();toast('已清除所有紀錄')};

