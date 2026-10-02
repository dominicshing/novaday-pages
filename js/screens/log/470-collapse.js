/* 日記頁往下捲時收合頂部：標題縮小並與切換鈕同列，搜尋列收起；回到頂部時展開 */
(()=>{const sc=$('s-log'),top=$('logTop');let c=false,raf=0;
  const set=v=>{if(v===c)return;c=v;top.classList.toggle('cmp',v);requestAnimationFrame(()=>sc.style.setProperty('--logTop',top.offsetHeight+'px'))};
  sc.addEventListener('scroll',()=>{if(raf)return;raf=requestAnimationFrame(()=>{raf=0;const y=sc.scrollTop;if(!c&&y>72)set(true);else if(c&&y<8)set(false)})},{passive:true});
  $('logFind').onclick=()=>{sc.scrollTo({top:0,behavior:reduce?'auto':'smooth'});setTimeout(()=>{set(false);$('q').focus({preventScroll:true})},reduce?0:320)};
  new ResizeObserver(()=>sc.style.setProperty('--logTop',top.offsetHeight+'px')).observe(top)})();
$('liSamples').onclick=async()=>{const n=entries.filter(isSample).length;const k=await ask('清除範例紀錄？',`會移除 ${n} 則範例紀錄，你自己寫的紀錄不受影響。`,[{k:'cancel',t:'取消'},{k:'ok',t:'清除範例',cls:'danger'}]);
  if(k!=='ok')return;entries=entries.filter(e=>!isSample(e));save();render();toast('已清除範例紀錄')};
$('rpOpen').onclick=()=>{const n=new Date();openReport(n.getFullYear(),n.getMonth())};
/* 下載：有 Claude 下載功能時用它，否則用一般瀏覽器下載；完整備份含影片時打包成 .zip */
async function saveFile(name,data,type){const blob=data instanceof Blob?data:new Blob([data],{type});
  const dl=window.claude&&window.claude.use&&await window.claude.use('downloads').catch(()=>null);
  if(dl){try{await dl.save({filename:name,data:typeof data==='string'?data:blob});return true}catch(e){if(e&&e.code==='declined')return false}}
  const u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=name;a.rel='noopener';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),120000);return true}
const VID_EXT={'video/mp4':'mp4','video/quicktime':'mov','video/webm':'webm','video/x-m4v':'m4v','video/3gpp':'3gp'};
async function backupZip(onStep){const o=backupObj(),files=[],media=[];let miss=0;
  for(const e of o.entries.filter(hasVideo)){if(media.some(m=>m.id===e.video.id))continue;const b=await mediaGet(e.video.id);if(!b){miss++;continue}
    const file=`videos/${e.video.id}.${VID_EXT[b.type]||'mp4'}`;media.push({id:e.video.id,file,type:b.type||'video/mp4',size:b.size});files.push({name:file,data:b})}
  o.media=media;files.unshift({name:'novaday-backup.json',data:new TextEncoder().encode(JSON.stringify(o))});
  return{blob:await zipBuild(files,onStep),n:media.length,miss}}
let dlBusy=false;
$('dlEx').onclick=async()=>{if(dlBusy)return;const d=ymd(new Date());dlBusy=true;$('dlEx').disabled=true;
  try{if(fmt==='full'&&entries.some(hasVideo)){toast('正在打包影片…',60000);
      const z=await backupZip((i,n)=>{if(n>2)toast(`正在打包影片…（${i} / ${n}）`,60000)});
      if(await saveFile(`Novaday-backup-${d}.zip`,z.blob))toast(`已下載完整備份（含 ${z.n} 部影片）${z.miss?`・${z.miss} 部影片的檔案已不在這台裝置上`:''}`,3600)}
    else{const js=fmt!=='text';if(await saveFile(`Novaday-${fmt==='full'?'backup':'entries'}-${d}.${js?'json':'txt'}`,exportText(true),js?'application/json':'text/plain;charset=utf-8'))toast(fmt==='full'?'已下載完整備份':'已下載檔案')}}
  catch(e){toast(e&&e.message==='too-big'?'影片太多，備份超過 4 GB，請先移除部分影片':'無法下載，請改用「複製內容」',3600)}
  finally{dlBusy=false;$('dlEx').disabled=false}};

