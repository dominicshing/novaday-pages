/* 日記頁往下捲時收合頂部：標題縮小並與切換鈕同列，搜尋列收起；回到頂部時展開 */
(()=>{const sc=$('s-log'),top=$('logTop');let c=false,raf=0;
  const set=v=>{if(v===c)return;c=v;top.classList.toggle('cmp',v);requestAnimationFrame(()=>sc.style.setProperty('--logTop',top.offsetHeight+'px'))};
  sc.addEventListener('scroll',()=>{if(raf)return;raf=requestAnimationFrame(()=>{raf=0;const y=sc.scrollTop;if(!c&&y>72)set(true);else if(c&&y<8)set(false)})},{passive:true});
  $('logFind').onclick=()=>{sc.scrollTo({top:0,behavior:reduce?'auto':'smooth'});setTimeout(()=>{set(false);$('q').focus({preventScroll:true})},reduce?0:320)};
  new ResizeObserver(()=>sc.style.setProperty('--logTop',top.offsetHeight+'px')).observe(top)})();
$('liSamples').onclick=async()=>{const n=entries.filter(isSample).length;const k=await ask('清除範例紀錄？',`會移除 ${n} 則範例紀錄，你自己寫的紀錄不受影響。`,[{k:'cancel',t:'取消'},{k:'ok',t:'清除範例',cls:'danger'}]);
  if(k!=='ok')return;entries=entries.filter(e=>!isSample(e));save();render();toast('已清除範例紀錄')};
$('rpOpen').onclick=()=>{const n=new Date();openReport(n.getFullYear(),n.getMonth())};
/* 下載：有 Claude 下載功能時用它，否則用一般瀏覽器下載；完整備份一律打包成 .zip */
async function saveFile(name,data,type){const blob=data instanceof Blob?data:new Blob([data],{type});
  const dl=window.claude&&window.claude.use&&await window.claude.use('downloads').catch(()=>null);
  if(dl){try{await dl.save({filename:name,data:typeof data==='string'?data:blob});return true}catch(e){if(e&&e.code==='declined')return false}}
  const u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=name;a.rel='noopener';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),120000);return true}
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

