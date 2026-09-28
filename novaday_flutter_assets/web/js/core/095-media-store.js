/* ---------- 影片：檔案存在 IndexedDB（localStorage 放不下），紀錄裡只存 {id,poster,dur} ---------- */
const MDB='novaday.media',MST='videos',VID_MAX=100*1024*1024;
let mdbP=null;
function mdb(){if(!mdbP)mdbP=new Promise((res,rej)=>{if(!window.indexedDB)return rej(new Error('no idb'));const r=indexedDB.open(MDB,1);
  r.onupgradeneeded=()=>r.result.createObjectStore(MST);r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)});
  mdbP.catch(()=>{mdbP=null});return mdbP}
function mdbDo(mode,fn){return mdb().then(db=>new Promise((res,rej)=>{const tx=db.transaction(MST,mode),st=tx.objectStore(MST),r=fn(st);
  tx.oncomplete=()=>res(r&&'result' in r?r.result:undefined);tx.onerror=tx.onabort=()=>rej(tx.error)}))}
const mediaPut=(id,blob)=>mdbDo('readwrite',st=>st.put(blob,id));
const mediaGet=id=>mdbDo('readonly',st=>st.get(id)).catch(()=>null);
const mediaDel=id=>mdbDo('readwrite',st=>st.delete(id)).catch(()=>{});
const mediaKeys=()=>mdbDo('readonly',st=>st.getAllKeys()).catch(()=>[]);
const hasVideo=e=>!!(e&&e.video&&e.video.id);
const hasMedia=e=>!!(e&&(e.photo||hasVideo(e)));
/* 沒有標題的紀錄：只有影像時用「影片紀錄／照片紀錄」代替「未命名紀錄」 */
const untitled=e=>e&&!(e.body||'').trim()?(hasVideo(e)?'影片紀錄':e.photo?'照片紀錄':'未命名紀錄'):'未命名紀錄';
const fmtDur=s=>{s=Math.max(0,Math.round(s||0));return Math.floor(s/60)+':'+String(s%60).padStart(2,'0')};
/* 清掉沒有任何紀錄或草稿用到的影片檔（刪除紀錄時先保留，讓「復原」還能用；下次開 App 才清） */
async function mediaGC(){const keep=new Set(entries.filter(hasVideo).map(e=>e.video.id));
  try{const d=JSON.parse(localStorage.getItem('orbitlog.draft.v1')||'null');if(d&&d.video&&d.video.id)keep.add(d.video.id)}catch(e){}
  for(const k of await mediaKeys())if(!keep.has(k))await mediaDel(k)}
