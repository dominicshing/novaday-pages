/* 匯出：完整備份（.zip）與純文字 */
let fmt='full';
const BK_PROF=['avatar','photoAv','name','ship','motto','since','birthday','region','livery','conOrder','nextPick'];
function backupObj(){const P={};BK_PROF.forEach(k=>{if(prof[k]!=null)P[k]=prof[k]});return{at:new Date().toISOString(),profile:P,reviews,entries:sorted()}}
const EX_HINT={full:'下載一個 <b>.zip</b>，包含所有紀錄、照片、影片、個人資料和星座進度，可以用「從備份還原」完整還原，也能在 Novaday App 還原。',
  text:'方便閱讀，或貼到其他筆記 App。這個格式<b>無法</b>用來還原。'};
function exportText(){return sorted().map(e=>`【${fmtDay(e.date)} ${fmtTime(e.time)}】\n${e.title||untitled(e)}\n心情：✦ ${MOODS[e.mood??2].n}${e.loc?'｜地點：'+e.loc:''}${(e.tags||[]).length?'｜標籤：'+e.tags.join('、'):''}${e.prompt?'\n提示：'+e.prompt:''}${photoCount(e)?`\n（${photoCount(e)} 張照片）`:''}${hasVideo(e)?'\n（1 部影片）':''}\n\n${e.body}`).join('\n\n———\n\n')||'目前沒有紀錄。'}
function refreshEx(){const full=fmt==='full';document.querySelectorAll('#exporter .exseg button').forEach(b=>b.setAttribute('aria-checked',String(b.dataset.f===fmt)));
  $('exOut').hidden=$('copyEx').hidden=full;if(!full)$('exOut').value=exportText();$('dlEx').classList.toggle('primary',full);
  const ph=entries.reduce((t,e)=>t+photoCount(e),0),vd=entries.filter(hasVideo).length;
  $('exHint').innerHTML=EX_HINT[fmt]+(full?`<span class="ex-sum"><span><b>${entries.length}</b>則紀錄</span><span><b>${ph}</b>張照片</span><span><b>${vd}</b>部影片</span></span>`:'')}
$('openExport').onclick=()=>{refreshEx();openSheet('exporter')};
document.querySelectorAll('#exporter .exseg button').forEach(b=>b.onclick=()=>{fmt=b.dataset.f;refreshEx()});
$('copyEx').onclick=async()=>{try{await navigator.clipboard.writeText(exportText());toast('已複製內容')}catch(e){$('exOut').select();toast('已選取內容，請手動複製')}};
const VID_EXT={'video/mp4':'mp4','video/quicktime':'mov','video/webm':'webm','video/x-m4v':'m4v','video/3gpp':'3gp'},IMG_EXT={'image/jpeg':'jpg','image/png':'png','image/webp':'webp','image/gif':'gif'};
/* 完整備份（格式見 docs/backup-format.md）：zip 裡放 novaday-backup.json，照片、影片都是獨立檔案，JSON 只記路徑 */
async function backupZip(onStep){const o=backupObj(),files=[],man=[],vids=new Map(),safe=s=>String(s).replace(/[^\w-]/g,'').slice(0,40)||'x';let nPh=0,miss=0;
  const addImg=async(src,name)=>{const b=await phBlob(src);if(!b||!b.size)return null;const t=IMG_EXT[b.type]?b.type:'image/jpeg';
    const path=`photos/${name}.${IMG_EXT[t]}`;files.push({name:path,data:b});man.push({path,type:t,size:b.size});return path};
  const ents=[];
  for(const e of o.entries){const{photo,photoMore,video,hasPhoto,dev,...r}=e,id=safe(e.id);['sample','fav','edited'].forEach(k=>{if(r[k])r[k]=true;else delete r[k]});
    const ph=[];for(const[i,s]of[photo,...(photoMore||[])].filter(Boolean).entries()){const p=await addImg(s,`${id}-${i+1}`);if(p)ph.push(p)}if(ph.length){r.photos=ph;nPh+=ph.length}
    if(video&&video.id){const vid=safe(video.id);r.video={id:video.id,dur:Number(video.dur)||0,poster:video.poster?await addImg(video.poster,`${vid}-poster`):null};
      if(!vids.has(video.id)){const b=await mediaGet(video.id);let v=null;
        if(b){const path=`videos/${vid}.${VID_EXT[b.type]||'mp4'}`;v={path,type:b.type||'video/mp4',size:b.size};files.push({name:path,data:b});man.push(v)}else miss++;vids.set(video.id,v)}
      const v=vids.get(video.id);if(v){r.video.file=v.path;r.video.type=v.type}}
    ents.push(r)}
  const P={...o.profile};if(P.photoAv){P.photoAv=await addImg(P.photoAv,'avatar');if(!P.photoAv)delete P.photoAv}
  const out={app:'Novaday',kind:'backup',v:1,at:o.at,platform:'web',profile:P,reviews:o.reviews,entries:ents,files:man};
  files.unshift({name:'novaday-backup.json',data:new TextEncoder().encode(JSON.stringify(out))});
  return{blob:await zipBuild(files,onStep),n:[...vids.values()].filter(Boolean).length,ph:nPh,miss}}
let dlBusy=false;
$('dlEx').onclick=async()=>{if(dlBusy)return;const d=ymd(new Date());dlBusy=true;$('dlEx').disabled=true;
  try{if(fmt==='full'){const big=entries.some(hasVideo);toast(big?'正在打包照片和影片…':'正在打包備份…',60000);
      const z=await backupZip((i,n)=>{if(big&&n>3)toast(`正在打包照片和影片…（${i} / ${n}）`,60000)});
      if(await saveFile(`Novaday-backup-${d}.zip`,z.blob))toast(`已下載完整備份（${entries.length} 則紀錄${z.ph?`、${z.ph} 張照片`:''}${z.n?`、${z.n} 部影片`:''}）${z.miss?`・${z.miss} 部影片的檔案已不在這台裝置上`:''}`,3600)}
    else if(await saveFile(`Novaday-entries-${d}.txt`,exportText(),'text/plain;charset=utf-8'))toast('已下載檔案')}
  catch(e){toast(e&&e.message==='too-big'?'影片太多，備份超過 4 GB，請先移除部分影片':'無法下載，請再試一次',3600)}
  finally{dlBusy=false;$('dlEx').disabled=false}};
