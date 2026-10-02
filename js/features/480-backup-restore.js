/* ---------- R11：從備份還原 ---------- */
let imData=null;
function cleanEntry(o){if(!o||typeof o!=='object')return null;
  const date=typeof o.date==='string'?o.date:'';if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||isNaN(parse(date).getTime()))return null;
  const st=(v,n)=>typeof v==='string'?v.slice(0,n):'';
  const e={id:st(o.id,40).replace(/[^\w-]/g,'')||(Date.now().toString(36)+Math.random().toString(36).slice(2,8)),date,time:/^\d{2}:\d{2}$/.test(o.time)?o.time:'',
    title:st(o.title,200).trim(),body:st(o.body,50000).trim(),mood:Number.isInteger(o.mood)&&o.mood>=0&&o.mood<=4?o.mood:2,
    tags:Array.isArray(o.tags)?[...new Set(o.tags.filter(t=>typeof t==='string').map(t=>t.trim().slice(0,30)).filter(Boolean))].slice(0,20):[],
    loc:st(o.loc,120).trim(),photo:typeof o.photo==='string'&&/^data:image\/(png|jpe?g|webp|gif);base64,[A-Za-z0-9+/=]+$/.test(o.photo)?o.photo:null};
  if(typeof o.prompt==='string'&&o.prompt)e.prompt=o.prompt.slice(0,200);
  if(o.sample)e.sample=1;if(o.edited)e.edited=1;if(o.fav)e.fav=1;
  if(e.photo&&Array.isArray(o.photoMore)){const m=o.photoMore.filter(u=>typeof u==='string'&&/^data:image\/(png|jpe?g|webp|gif);base64,[A-Za-z0-9+/=]+$/.test(u)).slice(0,9);if(m.length)e.photoMore=m}
  /* 影片檔不在備份裡；同一台裝置還原時仍可從 IndexedDB 找回 */
  if(!e.photo&&o.video&&typeof o.video.id==='string'&&/^v\w{1,40}$/.test(o.video.id))e.video={id:o.video.id,dur:Number(o.video.dur)||0,poster:typeof o.video.poster==='string'&&/^data:image\/(png|jpe?g|webp|gif);base64,[A-Za-z0-9+/=]+$/.test(o.video.poster)?o.video.poster:null};
  return e.title||e.body||e.photo||e.video?e:null}
function cleanProf(p){if(!p||typeof p!=='object')return null;const r={};
  {const av=AV_LEGACY[p.avatar]||p.avatar;if(AVATARS.includes(av))r.avatar=av}
  if(typeof p.photoAv==='string'&&p.photoAv.length<600000&&PHOTO_RE.test(p.photoAv)){r.photoAv=p.photoAv;if(p.avatar==='photo')r.avatar='photo'}
  ['name','ship','motto'].forEach(k=>{if(typeof p[k]==='string'&&p[k].trim())r[k]=p[k].trim().slice(0,k==='motto'?60:20)});
  ['since','birthday'].forEach(k=>{if(typeof p[k]==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(p[k]))r[k]=p[k]});
  if(p.region&&typeof p.region.name==='string'&&typeof p.region.lat==='number'&&Math.abs(p.region.lat)<=90){r.region={name:p.region.name.slice(0,40),lat:p.region.lat};if(typeof p.region.lon==='number'&&Math.abs(p.region.lon)<=180)r.region.lon=p.region.lon}
  if(Number.isInteger(p.livery)&&p.livery>=0&&p.livery<RINFO.length)r.livery=p.livery;
  if(Array.isArray(p.conOrder)){const o=[...new Set(p.conOrder.filter(k=>typeof k==='string'&&CON[k]))];if(o.length)r.conOrder=o}
  if(typeof p.nextPick==='string'&&CON[p.nextPick])r.nextPick=p.nextPick;
  return Object.keys(r).length?r:null}
const sig=e=>[e.date,e.time,e.title,e.body].join('\u0001');
function parseBackup(txt){txt=(txt||'').trim();if(!txt)return null;
  let o;try{o=JSON.parse(txt)}catch(_){return{err:txt.startsWith('【')?'這是「純文字」格式，無法用來還原。請改用「完整備份」或「JSON」格式匯出的內容。':'看不懂這份內容，請確認是 Novaday 匯出的備份檔。'}}
  const raw=Array.isArray(o)?o:o&&Array.isArray(o.entries)?o.entries:null;
  if(!raw)return{err:'這份檔案裡找不到紀錄，請確認是 Novaday 匯出的備份檔。'};
  const list=raw.map(cleanEntry).filter(Boolean),bad=raw.length-list.length;
  const ids=new Set(entries.map(e=>e.id)),sigs=new Set(entries.map(sig)),seen=new Set();
  const fresh=[],dup=[];
  list.forEach(e=>{if(ids.has(e.id)||sigs.has(sig(e))||seen.has(e.id)){dup.push(e);return}seen.add(e.id);fresh.push(e)});
  const lost=raw.filter(r=>r&&r.hasPhoto&&!r.photo).length;
  const media=!Array.isArray(o)&&Array.isArray(o.media)?o.media.filter(m=>m&&typeof m.id==='string'&&/^v\w{1,40}$/.test(m.id)&&typeof m.file==='string'&&/^videos\/[\w.-]+$/.test(m.file)):[];
  const vidIds=[...new Set(list.filter(e=>e.video).map(e=>e.video.id))];
  return{fresh,dup,bad,lost,media,vidIds,vmiss:0,total:raw.length,profile:Array.isArray(o)?null:cleanProf(o.profile),reviews:!Array.isArray(o)&&o.reviews&&typeof o.reviews==='object'?o.reviews:null}}
function renderImport(){const d=imData,pv=$('imPrev');
  $('imProfRow').hidden=!(d&&!d.err&&d.profile);
  if(!d){pv.hidden=true;$('imGo').disabled=true;$('imGo').textContent='匯入';return}
  pv.hidden=false;pv.classList.toggle('bad',!!d.err);
  if(d.err){pv.textContent=d.err;$('imGo').disabled=true;$('imGo').textContent='匯入';return}
  const ds=d.fresh.map(e=>e.date).sort(),span=ds.length?(ds[0]===ds[ds.length-1]?fmtDay(ds[0]).split('・')[0]:`${ds[0].replace(/-/g,'/')} – ${ds[ds.length-1].replace(/-/g,'/')}`):'';
  pv.innerHTML=`${d.fresh.length?`找到 <b>${d.fresh.length}</b> 則可以匯入的紀錄`:'這份備份裡的紀錄都已經在這台裝置上了'}${span?`<br><small style="color:var(--muted)">${span}</small>`:''}
    <div class="ip-n"><span><b>${d.fresh.length}</b>新紀錄</span><span><b>${d.dup.length}</b>已存在</span>${d.bad?`<span><b>${d.bad}</b>無法讀取</span>`:''}</div>
    ${d.zip&&d.media.length?`<small style="display:block;margin-top:6px;color:var(--teal,#6FE3D6)">含 ${d.media.length} 部影片，匯入時會一起還原</small>`:''}
    ${d.lost?`<small style="display:block;margin-top:6px;color:var(--flare)">有 ${d.lost} 則紀錄的照片沒有包含在這份 JSON 裡，匯入後不會有照片。</small>`:''}
    ${d.vmiss?`<small style="display:block;margin-top:6px;color:var(--flare)">有 ${d.vmiss} 部影片的檔案不在這份備份裡，也不在這台裝置上，匯入後只會顯示封面。請改用含影片的 .zip 完整備份。</small>`:''}`;
  const canP=d.profile&&$('imProf').checked;
  $('imGo').disabled=!d.fresh.length&&!canP;
  $('imGo').textContent=d.fresh.length?`匯入 ${d.fresh.length} 則紀錄`:canP?'還原個人資料':'沒有新的紀錄';}
/* 影片檔：備份裡（zip）或這台裝置上都沒有的，提醒匯入後只剩封面 */
async function imCheckVideos(d){if(!d||d.err||!d.vidIds.length)return;const have=new Set(await mediaKeys()),inZip=new Set(d.zip?d.media.filter(m=>d.zip.find(m.file)).map(m=>m.id):[]);
  d.vmiss=d.vidIds.filter(id=>!have.has(id)&&!inZip.has(id)).length;if(imData===d)renderImport()}
function openImport(){imData=null;imFileTxt='';imZip=null;$('imIn').value='';$('imFile').value='';$('imFileN').textContent='支援「完整備份」（.zip／.json）和「JSON」格式';
  $('imProf').checked=entries.every(isSample);renderImport();openSheet('importSheet')}
$('liImport').onclick=openImport;
$('exToIm').onclick=()=>{closeSheet('exporter');openImport()};
let imT=null,imFileTxt='',imZip=null;$('imIn').addEventListener('input',()=>{clearTimeout(imT);imT=setTimeout(()=>{const v=$('imIn').value;imData=parseBackup(v||imFileTxt);if(imData&&!v&&imZip)imData.zip=imZip;renderImport();imCheckVideos(imData)},250)});
$('imProf').addEventListener('change',renderImport);
$('imFile').addEventListener('change',async()=>{const f=$('imFile').files[0];if(!f)return;clearTimeout(imT);imZip=null;
  if(isZipFile(f)){$('imFileN').textContent='已選擇：'+f.name;$('imIn').value='';
    try{const z=await zipOpen(f),jn=z.find('novaday-backup.json')||z.names.find(x=>/\.json$/i.test(x)),jb=jn&&await z.get(jn.split('/').pop());
      if(!jb){imData={err:'這個 zip 裡找不到 Novaday 備份，請確認是 Novaday 匯出的完整備份。'};renderImport();return}
      imFileTxt=await jb.text();imZip=z;imData=parseBackup(imFileTxt);if(imData&&!imData.err)imData.zip=z}
    catch(_){imData={err:'無法讀取這個 zip 檔，請確認檔案完整，或重新下載一次備份。'}}
    renderImport();imCheckVideos(imData);return}
  if(f.size>60*1024*1024){imData={err:'檔案太大了，無法讀取。'};renderImport();return}
  $('imFileN').textContent='已選擇：'+f.name;const r=new FileReader();
  r.onload=()=>{const t=String(r.result||'');imFileTxt=t;$('imIn').value='';imData=parseBackup(t);renderImport();imCheckVideos(imData)};
  r.onerror=()=>{imData={err:'讀取檔案失敗，請再試一次。'};renderImport()};r.readAsText(f)});
$('imGo').onclick=()=>{const d=imData;if(!d||d.err)return;
  const before=entries.slice(),pBefore=JSON.stringify(prof),doP=d.profile&&$('imProf').checked;
  const real=d.fresh.filter(e=>!isSample(e)).length;let dropped=0;
  if(real&&entries.length&&entries.every(isSample)){dropped=entries.length;entries=[]}
  entries=entries.concat(d.fresh);
  if(doP){Object.assign(prof,d.profile);if(d.reviews&&!Object.keys(reviews.ids||{}).length){Object.assign(reviews,d.reviews);saveReviews()}}
  if(!save()){entries=before;prof=Object.assign(prof,JSON.parse(pBefore));toast('儲存空間不足，匯入失敗',3000);return}
  const early=entries.map(e=>e.date).sort()[0];if(early&&(!prof.since||early<prof.since))prof.since=early;
  saveProf();closeSheet('importSheet');render();if(typeof renderMe==='function')renderMe();
  const msg=`已匯入 ${d.fresh.length} 則紀錄${doP?'，並還原個人資料':''}${dropped?'（範例紀錄已移除）':''}`;
  if(d.zip&&d.media.length)imRestoreVideos(d,msg);else toast(msg,3200)};
/* 把 zip 裡的影片放回 IndexedDB（這台裝置已經有的就跳過） */
async function imRestoreVideos(d,msg){const have=new Set(await mediaKeys()),todo=d.media.filter(m=>!have.has(m.id));let ok=0,bad=0;
  for(let i=0;i<todo.length;i++){toast(`${msg}・正在還原影片（${i+1} / ${todo.length}）`,60000);
    try{const b=await d.zip.get(todo[i].file,todo[i].type);if(b&&b.size){await mediaPut(todo[i].id,b.type?b:new Blob([b],{type:todo[i].type}));ok++}else bad++}catch(_){bad++}}
  toast(`${msg}${ok?`，還原 ${ok} 部影片`:''}${bad?`・${bad} 部影片無法還原`:''}`,3600);if(typeof renderLog==='function')renderLog()}
$('qnText').addEventListener('input',qnSync);
$('quickNote').addEventListener('submit',e=>{e.preventDefault();const t=$('qnText').value.trim();if(!t)return;
  openEditor();requestAnimationFrame(()=>{$('fBody').value=t;curMood=qnMood??2;renderMoods();$('qnText').value='';qnMood=null;setTimeout(()=>$('form').requestSubmit(),reduce?0:120)})});
$('qnMore').onclick=()=>{const t=$('qnText').value.trim(),m=qnMood;openEditor();requestAnimationFrame(()=>{if(t)$('fBody').value=t;if(m!=null){curMood=m;renderMoods()}$('qnText').value='';qnMood=null;onEdit&&onEdit()})};
$('msMore').onclick=()=>{msOpen=!msOpen;renderMissions()};
$('logMode').querySelectorAll('[data-d]').forEach(x=>x.onclick=()=>{const v=x.dataset.d==='1';if(!!prof.logCompact===v)return;prof.logCompact=v;saveProf();renderLog()});
$('filters').addEventListener('scroll',filterFade,{passive:true});
$('cbTitle').onclick=()=>$('s-home').scrollTo({top:0,behavior:reduce?'auto':'smooth'});$('cbAv').onclick=()=>go('me');$('cbDate').onclick=()=>go('log','cal');

