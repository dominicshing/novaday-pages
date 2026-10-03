/* 設定：儲存空間 */
const fmtB=n=>n>=1073741824?(n/1073741824).toFixed(1)+' GB':n>=1048576?(n/1048576).toFixed(n>=10485760?0:1)+' MB':n>=1024?Math.round(n/1024)+' KB':n+' B';
async function storeUse(){let text=0;try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);text+=(k.length+(localStorage.getItem(k)||'').length)*2}}catch(e){}
  const {photo,video}=await mediaSizes();
  let quota=0,usage=0,kept=false;try{const e=await navigator.storage.estimate();quota=e.quota||0;usage=e.usage||0;kept=await navigator.storage.persisted()}catch(e){}
  const total=text+photo+video,pn=entries.reduce((t,e)=>t+photoCount(e),0),vn=entries.filter(hasVideo).length;
  return{text,photo,video,pn,vn,total,quota,kept,free:quota?Math.max(0,quota-Math.max(usage,total)):0,pct:quota?Math.min(100,Math.max(usage,total)/quota*100):0}}
/* 每次重繪都會呼叫：同一時間只算一次，期間又被呼叫就等這次算完再補算一次（避免舊結果晚到蓋掉新結果） */
let stBusy=false,stAgain=false;
async function renderStoreRow(){if(stBusy){stAgain=true;return}stBusy=true;try{await renderStoreRow0()}finally{stBusy=false;if(stAgain){stAgain=false;renderStoreRow()}}}
async function renderStoreRow0(){const v=$('stVal');if(!v)return;const u=await storeUse();v.textContent=fmtB(u.total);v.classList.toggle('warn',u.pct>=90);
  $('stSub').textContent=u.pct>=90?'裝置空間快滿了，建議下載備份並移除部分影片':`照片 ${u.pn} 張・影片 ${u.vn} 部`}
async function renderStore(){const u=await storeUse(),T=Math.max(1,u.total),w=x=>(x/T*100).toFixed(2)+'%';
  $('stBody').innerHTML=`<p class="ex-note">紀錄、照片和影片都存在這台裝置的瀏覽器裡。照片和影片沒有固定上限，可用空間由瀏覽器依裝置剩餘空間決定。</p>
    <div class="st-hero"><b>${fmtB(u.total)}</b><span>${u.quota?`這個網站還可以使用約 ${fmtB(u.free)}`:'已使用'}</span></div>
    <div class="st-bar" role="img" aria-label="照片 ${fmtB(u.photo)}、影片 ${fmtB(u.video)}、文字與設定 ${fmtB(u.text)}"><i class="p" style="width:${w(u.photo)}"></i><i style="width:${w(u.video)};background:#FFB45C"></i><i class="t" style="width:${w(u.text)}"></i></div>
    <div class="st-leg"><div><i style="background:#A99EFF"></i><span>照片（${u.pn} 張）</span><b>${fmtB(u.photo)}</b></div><div><i style="background:#FFB45C"></i><span>影片（${u.vn} 部）</span><b>${fmtB(u.video)}</b></div><div><i style="background:#6FE3D6"></i><span>文字紀錄與設定（${entries.length} 則）</span><b>${fmtB(u.text)}</b></div></div>
    ${u.pct>=90?`<div class="st-tip">裝置空間快用完了，新的照片和影片可能無法儲存。建議先下載完整備份，再移除不需要的影片。</div>`
      :`<div class="st-tip ok">${u.kept?'已設為長期保存：瀏覽器不會因為空間不足而自動清掉這些資料。':'瀏覽器在裝置空間不足時，可能會清掉網站資料。記得定期下載完整備份。'}</div>`}
    <div class="st-act"><button type="button" class="btn" id="stBackup">下載完整備份</button></div>`;
  $('stBackup').onclick=()=>{closeSheet('storeSheet');fmt='full';refreshEx();openSheet('exporter')}}
$('liStore').onclick=async()=>{await renderStore();openSheet('storeSheet')};
/* 請瀏覽器長期保存資料（不保證同意；Safari 加到主畫面後通常會同意） */
try{if(navigator.storage&&navigator.storage.persist)navigator.storage.persisted().then(p=>p||navigator.storage.persist()).catch(()=>{})}catch(e){}
