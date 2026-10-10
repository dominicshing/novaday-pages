/* 設定：地區（含定位） */
let rgAfter=null;
function renderRegion(){const cur=prof.region;
  $('rgList').innerHTML=REGIONS.map(([g,l])=>`<div class="rg-h">${tl(g)}</div><div class="rg-grid">${l.map(([n,la])=>`<button type="button" class="rg-c" data-n="${n}" data-la="${la}" aria-pressed="${!!cur&&cur.name===n}">${tl(n)}<small>${Math.abs(la).toFixed(1)}°${la>=0?'N':'S'}</small></button>`).join('')}</div>`).join('')
    +(cur&&!REGIONS.some(([,l])=>l.some(([n])=>n===cur.name))?`<div class="rg-h">${tl('目前')}</div><div class="rg-grid"><button type="button" class="rg-c" aria-pressed="true" disabled>${esc(regName(cur))}<small>${Math.abs(cur.lat).toFixed(1)}°${cur.lat>=0?'N':'S'}</small></button></div>`:'');
  $('rgList').querySelectorAll('.rg-c[data-n]').forEach(b=>b.onclick=()=>setRegion({name:b.dataset.n,lat:+b.dataset.la}))}
function setRegion(r){prof.region=r;saveProf();renderMe();renderCal();closeSheet('regionSheet');
  toast(r?tl('地區已設為{r}，星座可見度已更新',{r:regName(r)}):tl('已取消地區設定'));const f=rgAfter;rgAfter=null;if(f)f()}
function openRegion(after){rgAfter=after||null;renderRegion();openSheet('regionSheet')}
$('liRegion').onclick=()=>openRegion();
$('rgNone').onclick=()=>setRegion(null);
/* 取得目前位置（地區面板與引導頁共用） */
function geoRegion(done){if(!navigator.geolocation){toast(tl('這個裝置無法取得位置，請直接選城市'));return}
  toast(tl('正在取得位置…'),4000);
  navigator.geolocation.getCurrentPosition(p=>{const la=Math.round(p.coords.latitude*10)/10,lo=Math.round(p.coords.longitude*10)/10;done({name:`目前位置（${Math.abs(la).toFixed(1)}°${la>=0?'N':'S'}）`,lat:la,lon:lo})},
    ()=>toast(tl('無法取得位置，請直接選城市')),{timeout:8000,maximumAge:3600000})}
$('rgGeo').onclick=()=>geoRegion(setRegion);
