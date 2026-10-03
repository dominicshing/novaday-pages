/* 照片儲存：存在 IndexedDB，紀錄只記參照；載入時讀回並搬移舊資料 */
/* ---------- 照片：檔案存在 IndexedDB（和影片同一個 store，鍵以 p 開頭），沒有 localStorage 的 5 MB 限制 ----------
   localStorage 裡的紀錄只記 "idb:<鍵>"；記憶體裡的紀錄用 object URL（剛選的新照片暫時是 data URL），其他程式照常當成圖片網址使用 */
const PH_REF='idb:',phURL=new Map(),phKey=new Map(),phPend=new Set();
/* 寫入 IndexedDB；phFlush() 等全部寫完，回傳是否都成功 */
function phPut(k,b){const p=mediaPut(k,b).then(()=>true,()=>{toast('照片無法儲存，可能是裝置空間不足',3000);return false});phPend.add(p);p.then(()=>phPend.delete(p));return p}
const phFlush=async()=>(await Promise.all([...phPend])).every(Boolean);
const phNewKey=()=>'p'+Date.now().toString(36)+Math.random().toString(36).slice(2,8);
function dataURLBlob(u){const m=/^data:([^;,]+);base64,(.*)$/.exec(u||'');if(!m)return null;const b=atob(m[2]),a=new Uint8Array(b.length);for(let i=0;i<b.length;i++)a[i]=b.charCodeAt(i);return new Blob([a],{type:m[1]})}
/* 放進一張照片（Blob），回傳可以直接當 <img src> 的網址 */
function phFromBlob(blob){const k=phNewKey(),u=URL.createObjectURL(blob);phURL.set(k,u);phKey.set(u,k);phPut(k,blob);return u}
/* 記憶體網址 → 儲存用的參照；新的 data URL 會在這時寫進 IndexedDB */
function phRef(src){if(typeof src!=='string'||!src||src.startsWith(PH_REF))return src||null;let k=phKey.get(src);
  if(!k&&src.startsWith('data:image/')){const b=dataURLBlob(src);if(!b)return null;k=phNewKey();phURL.set(k,src);phKey.set(src,k);phPut(k,b)}
  return k?PH_REF+k:null}
const phSrc=r=>typeof r==='string'&&r.startsWith(PH_REF)?phURL.get(r.slice(PH_REF.length))||null:r||null;
/* 取得照片檔：備份時用 */
async function phBlob(src){if(typeof src!=='string')return null;if(src.startsWith('data:'))return dataURLBlob(src);const k=phKey.get(src)||(src.startsWith(PH_REF)?src.slice(PH_REF.length):null);return k?await mediaGet(k):null}
/* 儲存前：紀錄裡的照片換成參照 */
function phPack(e){if(!e||!(e.photo||e.photoMore||(e.video&&e.video.poster)))return e;const o={...e};
  if(o.photo)o.photo=phRef(o.photo);if(Array.isArray(o.photoMore)){o.photoMore=o.photoMore.map(phRef).filter(Boolean);if(!o.photoMore.length)delete o.photoMore}
  if(o.video&&o.video.poster)o.video={...o.video,poster:phRef(o.video.poster)};return o}
/* 載入後：把參照換回可顯示的網址；暫時讀不到的保留參照（不會因此被存檔刪掉）。舊資料裡的 data URL 一併搬進 IndexedDB，回傳搬了幾張 */
async function phHydrate(list,extra){const refs=new Set(extra||[]),each=f=>list.forEach(e=>{if(!e)return;f(e,'photo');if(Array.isArray(e.photoMore))e.photoMore.forEach((_,i)=>f(e.photoMore,i));if(e.video)f(e.video,'poster')});
  each((o,k)=>{const v=o[k];if(typeof v==='string'&&v.startsWith(PH_REF))refs.add(v.slice(PH_REF.length))});
  for(const k of refs){if(phURL.has(k))continue;const b=await mediaGet(k);if(b){const u=URL.createObjectURL(b);phURL.set(k,u);phKey.set(u,k)}}
  let moved=0;each((o,k)=>{const v=o[k];if(typeof v!=='string')return;if(v.startsWith(PH_REF))o[k]=phSrc(v)||v;else if(v.startsWith('data:image/')){phRef(v);moved++}});
  return moved}
