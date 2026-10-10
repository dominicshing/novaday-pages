/* 從備份還原（.zip） */
let imData=null;
const BK_PATH=/^(photos|videos)\/[\w.-]+$/,BK_MIME={jpg:'image/jpeg',jpeg:'image/jpeg',png:'image/png',webp:'image/webp',gif:'image/gif'};
const blobDataURL=b=>new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(String(r.result));r.onerror=rej;r.readAsDataURL(b)});
/* 預覽階段的照片：先用暫時網址，確定匯入時才寫進 IndexedDB */
const imBlobs=new Map();
function imFreeBlobs(){imBlobs.forEach((_,u)=>URL.revokeObjectURL(u));imBlobs.clear()}
const imPhotoOK=u=>typeof u==='string'&&imBlobs.has(u);
function cleanEntry(o){if(!o||typeof o!=='object')return null;
  const date=typeof o.date==='string'?o.date:'';if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||isNaN(parse(date).getTime()))return null;
  const st=(v,n)=>typeof v==='string'?v.slice(0,n):'';
  const e={id:st(o.id,40).replace(/[^\w-]/g,'')||(Date.now().toString(36)+Math.random().toString(36).slice(2,8)),date,time:/^\d{2}:\d{2}$/.test(o.time)?o.time:'',
    title:st(o.title,200).trim(),body:st(o.body,50000).trim(),mood:Number.isInteger(o.mood)&&o.mood>=0&&o.mood<=4?o.mood:2,
    tags:Array.isArray(o.tags)?[...new Set(o.tags.filter(t=>typeof t==='string').map(t=>t.trim().slice(0,30)).filter(Boolean))].slice(0,20):[],
    loc:st(o.loc,120).trim(),photo:null};
  if(typeof o.prompt==='string'&&o.prompt)e.prompt=o.prompt.slice(0,200);
  if(tzOK(o.tz))e.tz=o.tz;
  if(o.sample)e.sample=1;if(o.edited)e.edited=1;if(o.fav)e.fav=1;
  const ph=(Array.isArray(o.photos)?o.photos:[]).filter(imPhotoOK).slice(0,10);if(ph.length){e.photo=ph[0];if(ph.length>1)e.photoMore=ph.slice(1)}
  if(!e.photo&&o.video&&typeof o.video.id==='string'&&/^v\w{1,40}$/.test(o.video.id))e.video={id:o.video.id,dur:Number(o.video.dur)||0,poster:imPhotoOK(o.video.poster)?o.video.poster:null};
  return e.title||e.body||e.photo||e.video?e:null}
function cleanProf(p){if(!p||typeof p!=='object')return null;const r={};
  if(typeof p.avatar==='string'&&AVATARS.includes(p.avatar))r.avatar=p.avatar;
  if(typeof p.photoAv==='string'&&p.photoAv.length<600000&&PHOTO_RE.test(p.photoAv)){r.photoAv=p.photoAv;if(p.avatar==='photo')r.avatar='photo'}
  ['name','ship','motto'].forEach(k=>{if(typeof p[k]==='string'&&p[k].trim())r[k]=p[k].trim().slice(0,k==='motto'?60:20)});
  ['since','birthday'].forEach(k=>{if(typeof p[k]==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(p[k]))r[k]=p[k]});
  if(p.region&&typeof p.region.name==='string'&&typeof p.region.lat==='number'&&Math.abs(p.region.lat)<=90){r.region={name:p.region.name.slice(0,40),lat:p.region.lat};if(typeof p.region.lon==='number'&&Math.abs(p.region.lon)<=180)r.region.lon=p.region.lon}
  if(Number.isInteger(p.livery)&&p.livery>=0&&p.livery<RINFO.length)r.livery=p.livery;
  if(Array.isArray(p.conOrder)){const o=[...new Set(p.conOrder.filter(k=>typeof k==='string'&&CON[k]))];if(o.length)r.conOrder=o}
  if(typeof p.nextPick==='string'&&CON[p.nextPick])r.nextPick=p.nextPick;
  return Object.keys(r).length?r:null}
const sig=e=>[e.date,e.time,e.title,e.body].join('\u0001');
/* 讀取 zip：找到 novaday-backup.json，照片讀成暫時網址，影片留到匯入時再寫入 */
async function imLoadZip(f){let z;try{z=await zipOpen(f)}catch(_){return{err:tl('無法讀取這個檔案，請選擇 Novaday 的完整備份（.zip），或重新下載一次備份。')}}
  let o;try{const b=await z.get('novaday-backup.json');o=b&&JSON.parse(await b.text())}catch(_){o=null}
  if(!o||o.app!=='Novaday'||o.kind!=='backup'||!Array.isArray(o.entries))return{err:tl('這個 zip 不是 Novaday 的完整備份，請確認選對檔案。')};
  const types={};(Array.isArray(o.files)?o.files:[]).forEach(x=>{if(x&&typeof x.path==='string'&&typeof x.type==='string')types[x.path]=x.type});
  const img=async p=>{if(typeof p!=='string'||!BK_PATH.test(p)||!p.startsWith('photos/'))return null;
    try{const t=types[p]||BK_MIME[p.split('.').pop().toLowerCase()]||'image/jpeg',b=await z.get(p,t);if(!b||!b.size||b.size>20e6)return null;
      const bl=b.type?b:new Blob([b],{type:t}),u=URL.createObjectURL(bl);imBlobs.set(u,bl);return u}catch(_){return null}};
  const raw=[],media=[];let lost=0;
  for(const e of o.entries){if(!e||typeof e!=='object'){raw.push(e);continue}const r={...e},want=Array.isArray(e.photos)?e.photos.slice(0,10):[];
    r.photos=[];for(const p of want){const u=await img(p);if(u)r.photos.push(u)}if(r.photos.length<want.length)lost++;
    if(e.video&&typeof e.video==='object'){r.video={...e.video,poster:await img(e.video.poster)};const v=e.video;
      if(typeof v.file==='string'&&BK_PATH.test(v.file)&&v.file.startsWith('videos/')&&typeof v.id==='string'&&/^v\w{1,40}$/.test(v.id)&&!media.some(m=>m.id===v.id)&&z.find(v.file))
        media.push({id:v.id,file:v.file,type:typeof v.type==='string'?v.type:types[v.file]||'video/mp4'})}
    raw.push(r)}
  const P=o.profile&&typeof o.profile==='object'?{...o.profile}:null;
  if(P&&'photoAv' in P){try{const t=types[P.photoAv]||BK_MIME[String(P.photoAv).split('.').pop().toLowerCase()]||'image/jpeg',b=typeof P.photoAv==='string'&&BK_PATH.test(P.photoAv)?await z.get(P.photoAv,t):null;
    if(b&&b.size)P.photoAv=await blobDataURL(b.type?b:new Blob([b],{type:t}));else delete P.photoAv}catch(_){delete P.photoAv}}
  const list=raw.map(cleanEntry).filter(Boolean),bad=raw.length-list.length;
  const ids=new Set(entries.map(e=>e.id)),sigs=new Set(entries.map(sig)),seen=new Set(),fresh=[],dup=[];
  list.forEach(e=>{if(ids.has(e.id)||sigs.has(sig(e))||seen.has(e.id)){dup.push(e);return}seen.add(e.id);fresh.push(e)});
  const vidIds=[...new Set(list.filter(e=>e.video).map(e=>e.video.id))],have=new Set(await mediaKeys()),inZip=new Set(media.map(m=>m.id));
  return{z,fresh,dup,bad,lost,media,vmiss:vidIds.filter(id=>!have.has(id)&&!inZip.has(id)).length,newer:o.v>1,
    profile:cleanProf(P),reviews:o.reviews&&typeof o.reviews==='object'&&o.reviews.ids&&typeof o.reviews.ids==='object'?o.reviews:null}}
const imNote=(t,c='var(--flare)')=>`<small style="display:block;margin-top:6px;color:${c}">${t}</small>`;
function renderImport(){const d=imData,pv=$('imPrev');
  $('imProfRow').hidden=!(d&&!d.err&&d.profile);
  if(!d){pv.hidden=true;$('imGo').disabled=true;$('imGo').textContent=tl('匯入');return}
  pv.hidden=false;pv.classList.toggle('bad',!!d.err);
  if(d.err){pv.textContent=d.err;$('imGo').disabled=true;$('imGo').textContent=tl('匯入');return}
  const ds=d.fresh.map(e=>e.date).sort(),span=ds.length?(ds[0]===ds[ds.length-1]?fmtMDY(parse(ds[0])):`${ds[0].replace(/-/g,'/')} – ${ds[ds.length-1].replace(/-/g,'/')}`):'',
    np=d.fresh.reduce((t,e)=>t+photoCount(e),0);
  pv.innerHTML=`${d.fresh.length?tl('找到 <b>{n}</b> 則可以匯入的紀錄',{n:d.fresh.length}):tl('這份備份裡的紀錄都已經在這台裝置上了')}${span?`<br><small style="color:var(--muted)">${span}</small>`:''}
    <div class="ip-n"><span><b>${d.fresh.length}</b>${tl('新紀錄')}</span><span><b>${d.dup.length}</b>${tl('已存在')}</span>${d.bad?`<span><b>${d.bad}</b>${tl('無法讀取')}</span>`:''}</div>
    ${np||d.media.length?imNote(tl('含 {s}，會一起還原',{s:[np?tl('{n} 張照片',{n:np}):'',d.media.length?tl('{n} 部影片',{n:d.media.length}):''].filter(Boolean).join(tl('、'))}),'var(--teal,#6FE3D6)'):''}
    ${d.lost?imNote(tl('有 {n} 則紀錄的照片不在這份備份裡，匯入後會缺少照片。',{n:d.lost})):''}
    ${d.vmiss?imNote(tl('有 {n} 部影片的檔案不在這份備份裡，也不在這台裝置上，匯入後只會顯示封面。',{n:d.vmiss})):''}
    ${d.newer?imNote(tl('這份備份來自較新版本的 Novaday，部分內容可能無法還原。')):''}`;
  const canP=d.profile&&$('imProf').checked;
  $('imGo').disabled=!d.fresh.length&&!canP;
  $('imGo').textContent=d.fresh.length?tl('匯入 {n} 則紀錄',{n:d.fresh.length}):tl(canP?'還原個人資料':'沒有新的紀錄')}
function openImport(){imFreeBlobs();imData=null;$('imFile').value='';$('imFileN').textContent=tl('Novaday 完整備份（.zip）');
  $('imProf').checked=entries.every(isSample);renderImport();openSheet('importSheet')}
$('liImport').onclick=openImport;
$('exToIm').onclick=()=>{closeSheet('exporter');openImport()};
$('imProf').addEventListener('change',renderImport);
$('imFile').addEventListener('change',async()=>{const f=$('imFile').files[0];if(!f)return;imFreeBlobs();imData=null;renderImport();
  $('imFileN').textContent=tl('正在讀取：{f}',{f:f.name});imData=await imLoadZip(f);$('imFileN').textContent=tl('已選擇：{f}',{f:f.name});renderImport()});
let imBusy=false;
$('imGo').onclick=async()=>{const d=imData;if(!d||d.err||imBusy)return;imBusy=true;$('imGo').disabled=true;
  try{const before=entries.slice(),pBefore=JSON.stringify(prof),rBefore=JSON.stringify(reviews),doP=d.profile&&$('imProf').checked;
    /* 照片寫進 IndexedDB（確定匯入才寫），全部成功才更新紀錄 */
    const keep=u=>u&&imBlobs.has(u)?phFromBlob(imBlobs.get(u)):u;
    const add=d.fresh.map(e=>{const x={...e};if(x.photo)x.photo=keep(x.photo);if(x.photoMore)x.photoMore=x.photoMore.map(keep);if(x.video&&x.video.poster)x.video={...x.video,poster:keep(x.video.poster)};return x});
    if(!(await phFlush())){toast(tl('照片無法儲存，可能是裝置空間不足，匯入已取消'),3600);return}
    const real=add.filter(e=>!isSample(e)).length;let dropped=0;
    if(real&&entries.length&&entries.every(isSample)){dropped=entries.length;entries=[]}
    entries=entries.concat(add);
    if(doP){Object.assign(prof,d.profile);if(d.reviews&&!Object.keys(reviews.ids||{}).length){Object.assign(reviews,d.reviews);saveReviews()}}
    if(!save()){entries=before;Object.assign(prof,JSON.parse(pBefore));Object.assign(reviews,JSON.parse(rBefore));toast(tl('無法儲存，匯入已取消'),3000);return}
    const early=entries.map(e=>e.date).sort()[0];if(early&&(!prof.since||early<prof.since))prof.since=early;
    saveProf();closeSheet('importSheet');render();if(typeof renderMe==='function')renderMe();
    const msg=tl('已匯入 {n} 則紀錄',{n:add.length})+(doP?tl('，並還原個人資料'):'')+(dropped?tl('（範例紀錄已移除）'):'');
    if(d.media.length)await imRestoreVideos(d,msg);else toast(msg,3200);imFreeBlobs();imData=null}
  finally{imBusy=false;$('imGo').disabled=false}};
/* 把 zip 裡的影片放回 IndexedDB（這台裝置已經有的就跳過，重複的紀錄也會補回影片） */
async function imRestoreVideos(d,msg){const have=new Set(await mediaKeys()),todo=d.media.filter(m=>!have.has(m.id));let ok=0,bad=0;
  for(let i=0;i<todo.length;i++){toast(msg+SEP+tl('正在還原影片（{i} / {n}）',{i:i+1,n:todo.length}),60000);
    try{const b=await d.z.get(todo[i].file,todo[i].type);if(b&&b.size){await mediaPut(todo[i].id,b.type?b:new Blob([b],{type:todo[i].type}));ok++}else bad++}catch(_){bad++}}
  toast(msg+(ok?tl('，還原 {n} 部影片',{n:ok}):'')+(bad?SEP+tl('{n} 部影片無法還原',{n:bad}):''),3600);if(typeof renderLog==='function')renderLog()}
