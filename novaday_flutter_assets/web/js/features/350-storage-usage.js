/* ---------- R19：儲存空間 ---------- */
const ST_QUOTA=5*1024*1024; /* 大多數瀏覽器的 localStorage 上限約 5 MB（以字元計） */
function storeUse(){let total=0;try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);total+=k.length+(localStorage.getItem(k)||'').length}}catch(e){}
  let photo=0,pn=0;entries.forEach(e=>entryPhotos(e).forEach(u=>{photo+=u.length;pn++}));
  const text=Math.max(0,JSON.stringify(entries.map(({photo,photoMore,...e})=>e)).length),other=Math.max(0,total-photo-text);
  return{total,photo,pn,text,other,pct:Math.min(100,total/ST_QUOTA*100)}}
const fmtB=n=>n>=1048576?(n/1048576).toFixed(n>=10485760?0:1)+' MB':n>=1024?Math.round(n/1024)+' KB':n+' B';
function renderStoreRow(){const u=storeUse(),v=$('stVal');if(!v)return;v.textContent=`${Math.round(u.pct)}%`;v.classList.toggle('warn',u.pct>=80);
  $('stSub').textContent=u.pct>=80?'快滿了，建議壓縮照片或下載備份':`已使用 ${fmtB(u.total)}`}
function renderStore(){const u=storeUse(),w=x=>(x/ST_QUOTA*100).toFixed(2)+'%';
  const est=u.pn?Math.max(0,Math.floor((ST_QUOTA-u.total)/(u.photo/u.pn))):null;
  $('stBody').innerHTML=`<p class="ex-note">所有紀錄都存在這台裝置的瀏覽器裡，容量大約 5 MB。</p>
    <div class="st-hero"><b>${u.pct<1&&u.total?'<1':Math.round(u.pct)}%</b><span>已使用 ${fmtB(u.total)} / 約 5 MB</span></div>
    <div class="st-bar" role="img" aria-label="照片 ${fmtB(u.photo)}、文字 ${fmtB(u.text)}、其他 ${fmtB(u.other)}"><i class="p" style="width:${w(u.photo)}"></i><i class="t" style="width:${w(u.text)}"></i><i class="o" style="width:${w(u.other)}"></i></div>
    <div class="st-leg"><div><i style="background:#A99EFF"></i><span>照片（${u.pn} 張）</span><b>${fmtB(u.photo)}</b></div><div><i style="background:#6FE3D6"></i><span>文字紀錄（${entries.length} 則）</span><b>${fmtB(u.text)}</b></div><div><i style="background:#6FA8FF"></i><span>設定與進度</span><b>${fmtB(u.other)}</b></div></div>
    ${u.pct>=80?`<div class="st-tip">空間快用完了。空間滿了以後，新的紀錄會無法儲存。建議先下載完整備份，再壓縮照片或移除不需要的照片。</div>`
      :`<div class="st-tip ok">${est!=null?`以目前照片的平均大小，大約還能再放 <b>${est}</b> 張照片。`:'文字紀錄很省空間，寫好幾年也用不完。照片會佔比較多空間。'}</div>`}
    <div class="st-act">${u.pn?`<button type="button" class="btn two" id="stShrink">壓縮所有照片<small>縮小成 720px，畫質稍降，通常可省下 30–50%</small></button>`:''}<button type="button" class="btn" id="stBackup">下載完整備份</button></div>`;
  if($('stShrink'))$('stShrink').onclick=shrinkPhotos;
  $('stBackup').onclick=()=>{closeSheet('storeSheet');fmt='full';refreshEx();openSheet('exporter')}}
function shrinkOne(src){return new Promise(res=>{const img=new Image();img.onload=()=>{const sc=Math.min(1,720/Math.max(img.width,img.height)),c=document.createElement('canvas');
  c.width=Math.round(img.width*sc);c.height=Math.round(img.height*sc);c.getContext('2d').drawImage(img,0,0,c.width,c.height);const out=c.toDataURL('image/jpeg',.62);res(out.length<src.length?out:src)};img.onerror=()=>res(src);img.src=src})}
async function shrinkPhotos(){const u0=storeUse();const k=await ask('壓縮所有照片？',`會把 ${u0.pn} 張照片縮小並重新壓縮，畫質會稍微降低，而且無法復原。建議先下載一份完整備份。`,[{k:'cancel',t:'取消'},{k:'ok',t:'壓縮照片'}]);if(k!=='ok')return;
  const b=$('stShrink');if(b){b.disabled=true;b.firstChild.textContent='壓縮中…'}
  const before=entries.map(e=>[e.photo,e.photoMore]);for(const e of entries){if(e.photo)e.photo=await shrinkOne(e.photo);if(Array.isArray(e.photoMore)){const m=[];for(const u of e.photoMore)m.push(await shrinkOne(u));e.photoMore=m}}
  if(!save()){entries.forEach((e,i)=>{e.photo=before[i][0];e.photoMore=before[i][1]});toast('壓縮失敗，照片沒有變動',3000);renderStore();return}
  const u1=storeUse();render();renderStore();toast(`完成！省下 ${fmtB(Math.max(0,u0.total-u1.total))}`,3000)}
$('liStore').onclick=()=>{renderStore();openSheet('storeSheet')};
