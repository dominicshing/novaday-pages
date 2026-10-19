/* 原生分頁錄影：先裁切到模擬器，再編碼；影片只保留在本機記憶體。 */
let recordingSession=null,recordingLast=null,recordingPendingPreview=false,recordingNoticeTimer=null;
const RECORD_ICON='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4" fill="currentColor" stroke="none"/></svg>';
const RECORD_STOP_ICON='<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="5" width="14" height="14" rx="2"/></svg>';
function recordingInProgress(){return recordingSession!==null}
function recordingSupported(){return !!(isSecureContext&&navigator.mediaDevices?.getDisplayMedia&&globalThis.CropTarget?.fromElement&&
  globalThis.BrowserCaptureMediaStreamTrack?.prototype.cropTo&&globalThis.MediaRecorder?.isTypeSupported)}
function recordingStatus(message,notice=false){
  clearTimeout(recordingNoticeTimer);const el=$('recordingStatus');el.textContent=message;el.className=notice?'notice':'sr';
  if($('recordingSheet').open){$('recordingFeedback').textContent=message;$('recordingFeedback').hidden=false}
  if(notice)recordingNoticeTimer=setTimeout(()=>{el.className='sr'},6000);
}
function recordingElapsed(ms){const seconds=Math.floor(ms/1000);return `${pad(Math.floor(seconds/60))}:${pad(seconds%60)}`}
function syncRecordingControls(){
  const phase=recordingSession?.phase||'idle',active=phase==='recording',hasAudio=recordingSession?.hasAudio&&!recordingSession?.audioLost,supported=recordingSupported(),b=$('recordingCapture');
  const label=tl(active?'停止錄影':phase==='requesting'?'等待分享…':phase==='finalizing'?'正在完成錄影…':'錄製畫面');
  b.innerHTML=(active?RECORD_STOP_ICON:RECORD_ICON)+`<span class="recording-label">${label}</span>`+(active?`<span class="recording-time" id="recordingTime" aria-hidden="true">${recordingElapsed(Date.now()-recordingSession.startedAt)}</span>`:'')+
    (active&&!hasAudio?'<svg class="recording-audio" viewBox="0 0 24 24" aria-hidden="true"><path d="M10 5 5 9H2v6h3l5 4zM16 9l6 6m0-6-6 6"/></svg>':'');
  b.setAttribute('aria-label',label);b.setAttribute('aria-pressed',String(active));b.dataset.recording=String(active);b.classList.toggle('recording',active);
  b.title=tl(!supported?'錄影需要桌面版 Chrome 或 Edge，並以 HTTPS 或 localhost 開啟。':active?'停止錄影':'請選擇此分頁，並開啟分享分頁音訊。');
  if(active)b.title+=' · '+tl(hasAudio?'含分頁音訊':'無音訊');
  b.disabled=!supported||screenshotBusy||phase==='requesting'||phase==='finalizing';
  if(phase==='requesting'||phase==='finalizing')b.setAttribute('aria-busy','true');else b.removeAttribute('aria-busy');
  $('screenshotCapture').disabled=screenshotBusy||recordingInProgress();
  $('recordingReview').hidden=!recordingLast||recordingInProgress();$('recordingReview').disabled=screenshotBusy;
  if(!supported)recordingStatus(tl('錄影需要桌面版 Chrome 或 Edge，並以 HTTPS 或 localhost 開啟。'));
}
function recordingMime(hasAudio){
  const types=hasAudio?['video/mp4;codecs=avc1.420028,mp4a.40.2','video/mp4','video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus','video/webm']:
    ['video/mp4;codecs=avc1.420028','video/mp4','video/webm;codecs=vp9','video/webm;codecs=vp8','video/webm'];
  const player=document.createElement('video');
  return types.find(type=>MediaRecorder.isTypeSupported(type)&&player.canPlayType(type))||'';
}
/* Region Capture 會隨視窗縮放改變解析度；直接交給 MP4 編碼會產生失效的 H.264 影格。
   先等第一個已裁切影格，再以固定偶數尺寸的 canvas 編碼，大小變動時等比置中。 */
function waitRecordingFrame(video,s){
  return new Promise((resolve,reject)=>{
    const done=error=>{clearTimeout(timer);video.removeEventListener('loadeddata',ready);video.removeEventListener('error',failed);if(s)s.cancelFrame=null;error?reject(error):resolve()};
    const ready=()=>{if(video.readyState>=2&&video.videoWidth&&video.videoHeight)done()};
    const failed=()=>done(new Error('Video cannot be decoded'));
    const timer=setTimeout(failed,10000);
    video.addEventListener('loadeddata',ready);video.addEventListener('error',failed);
    if(s)s.cancelFrame=failed;
    if(video.error)failed();else ready();
  });
}
async function prepareRecordingStream(s){
  const source=s.source=document.createElement('video');source.muted=true;source.playsInline=true;source.srcObject=new MediaStream([s.video]);
  const ready=waitRecordingFrame(source,s);
  await Promise.all([ready,source.play()]);
  if(s.cancelled||s.abandoned)throw new Error('Recording canceled');
  const canvas=s.canvas=document.createElement('canvas');
  canvas.width=Math.max(2,Math.round(source.videoWidth/2)*2);canvas.height=Math.max(2,Math.round(source.videoHeight/2)*2);
  const ctx=canvas.getContext('2d',{alpha:false});
  s.draw=()=>{
    if(source.readyState<2||!source.videoWidth)return;
    const ratio=Math.min(canvas.width/source.videoWidth,canvas.height/source.videoHeight),w=source.videoWidth*ratio,h=source.videoHeight*ratio;
    ctx.fillStyle='#070A1C';ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.drawImage(source,(canvas.width-w)/2,(canvas.height-h)/2,w,h);
  };
  s.draw();s.output=canvas.captureStream(30);
  if(s.audio)s.output.addTrack(s.audio);
  s.paintTimer=setInterval(s.draw,1000/30);
  return s.output;
}
function releaseRecordingTracks(s){
  clearInterval(s.timer);clearInterval(s.paintTimer);s.cancelFrame?.();
  if(s.video&&s.ended)s.video.removeEventListener('ended',s.ended);
  if(s.audio&&s.audioEnded)s.audio.removeEventListener('ended',s.audioEnded);
  s.stream?.getTracks().forEach(track=>track.stop());
  s.output?.getTracks().forEach(track=>track.stop());
  if(s.source){s.source.pause();s.source.srcObject=null}
}
function resetRecording(s){
  releaseRecordingTracks(s);
  if(s.recorder){s.recorder.ondataavailable=null;s.recorder.onstop=null;s.recorder.onerror=null}
  s.chunks=[];
  if(recordingSession===s){recordingSession=null;syncRecordingControls()}
}
function showRecordingPreview(){
  if(!recordingLast||recordingInProgress()||!$('lock').hidden)return;
  recordingPendingPreview=false;$('recordingFeedback').hidden=true;if(!$('recordingSheet').open)$('recordingSheet').showModal();
}
function closeRecordingPreview(){$('recordingVideo').pause();if($('recordingSheet').open)$('recordingSheet').close()}
async function finishRecording(s){
  if(s.finished)return;s.finished=true;
  releaseRecordingTracks(s);
  const type=s.recorder.mimeType||s.chunks.find(c=>c.type)?.type||'',blob=new Blob(s.chunks,{type});
  let valid=!s.failed&&!s.abandoned&&blob.size>0&&/^video\/(mp4|webm)(;|$)/i.test(type),url;
  if(valid){
    /* 真正解碼第一個影格才開放預覽／儲存，避免把只有容器標頭的檔案當成成功。 */
    const probe=document.createElement('video');probe.muted=true;probe.preload='auto';url=URL.createObjectURL(blob);
    try{const ready=waitRecordingFrame(probe);probe.src=url;await ready}catch(e){valid=false}
    probe.removeAttribute('src');probe.load();
  }
  valid=valid&&!s.abandoned;
  if(valid){
    const now=s.startedDate,ext=/^video\/mp4/i.test(type)?'mp4':'webm',video=$('recordingVideo');
    video.pause();video.removeAttribute('src');video.load();
    if(recordingLast)URL.revokeObjectURL(recordingLast.url);
    recordingLast={blob,url,name:`Novaday-recording-${ymd(now)}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}.${ext}`};
    video.src=recordingLast.url;
    $('recordingDetails').textContent=`${ext.toUpperCase()} · ${recordingElapsed(s.duration)} · ${tl(s.hasAudio?'含分頁音訊':'無音訊')}`;
  }else if(url)URL.revokeObjectURL(url);
  resetRecording(s);
  if(s.abandoned)return;
  if(valid){recordingStatus(tl('錄影已完成，可以儲存或分享'));recordingPendingPreview=true;showRecordingPreview()}
  else recordingStatus(tl('錄影失敗，請再試一次'),true);
}
function stopScreenRecording(){
  const s=recordingSession;if(!s||s.phase==='finalizing')return;
  if(s.phase==='requesting'){s.cancelled=true;releaseRecordingTracks(s);return}
  s.phase='finalizing';s.duration=Date.now()-s.startedAt;syncRecordingControls();recordingStatus(tl('正在完成錄影…'));
  clearInterval(s.timer);clearInterval(s.paintTimer);
  /* 停止取新畫面，保留編碼串流到最後一批 dataavailable 與 stop 事件完成。 */
  s.video.enabled=false;if(s.audio)s.audio.enabled=false;
  try{if(s.recorder.state!=='inactive')s.recorder.stop()}catch(e){s.failed=true;finishRecording(s)}
}
async function startScreenRecording(){
  if(recordingInProgress()||screenshotBusy||!$('lock').hidden||!recordingSupported())return;
  closeRecordingPreview();
  recordingPendingPreview=false;
  const s={phase:'requesting',chunks:[],cancelled:false,failed:false};recordingSession=s;syncRecordingControls();
  recordingStatus(tl('請選擇此分頁，並開啟分享分頁音訊。'));
  let stage='permission';
  try{
    /* 必須在按鈕的使用者手勢內呼叫，不先 await 裁切目標。 */
    s.stream=await navigator.mediaDevices.getDisplayMedia({video:{displaySurface:'browser',frameRate:30},audio:{suppressLocalAudioPlayback:false},
      preferCurrentTab:true,selfBrowserSurface:'include',surfaceSwitching:'exclude',systemAudio:'exclude'});
    if(s.cancelled||!$('lock').hidden){resetRecording(s);recordingStatus(tl('已取消錄影'));return}
    stage='crop';s.video=s.stream.getVideoTracks()[0];
    if(!s.video||s.video.getSettings().displaySurface!=='browser'||typeof s.video.cropTo!=='function')throw new Error('Select this tab');
    /* 其他分頁無法使用本頁的裁切目標；失敗時不建立錄影器，避免存下未裁切畫面。 */
    await s.video.cropTo(await CropTarget.fromElement($('device')));
    if(s.cancelled||!$('lock').hidden||s.video.readyState==='ended'){resetRecording(s);recordingStatus(tl('已取消錄影'));return}
    stage='recorder';s.audio=s.stream.getAudioTracks().find(track=>track.readyState==='live');s.hasAudio=!!s.audio;
    const output=await prepareRecordingStream(s);
    if(s.cancelled||!$('lock').hidden){resetRecording(s);recordingStatus(tl('已取消錄影'));return}
    const mimeType=recordingMime(s.hasAudio);s.recorder=new MediaRecorder(output,mimeType?{mimeType}:undefined);
    s.recorder.ondataavailable=e=>{if(e.data?.size)s.chunks.push(e.data)};
    s.recorder.onstop=()=>finishRecording(s);
    s.recorder.onerror=()=>{s.failed=true;stopScreenRecording()};
    s.ended=()=>stopScreenRecording();s.video.addEventListener('ended',s.ended);
    if(s.audio){s.audioEnded=()=>{s.audioLost=true;syncRecordingControls();recordingStatus(tl('錄影中・無音訊'))};s.audio.addEventListener('ended',s.audioEnded)}
    s.startedDate=new Date();s.startedAt=Date.now();s.duration=0;
    s.recorder.start(1000);s.draw();s.phase='recording';syncRecordingControls();
    recordingStatus(tl(s.hasAudio?'錄影中・含分頁音訊':'錄影中・無音訊'));
    s.timer=setInterval(()=>{const timer=$('recordingTime');if(timer)timer.textContent=recordingElapsed(Date.now()-s.startedAt)},1000);
  }catch(e){
    resetRecording(s);if(s.abandoned)return;
    recordingStatus(tl(s.cancelled?'已取消錄影':stage==='permission'&&(e?.name==='NotAllowedError'||e?.name==='AbortError')?'已取消錄影':
      stage==='crop'?'請分享目前的模擬器分頁，無法錄製其他分頁或整個螢幕。':'無法開始錄影，請檢查瀏覽器的分享權限後再試一次。'),!s.cancelled&&e?.name!=='NotAllowedError'&&e?.name!=='AbortError');
  }
}
$('recordingCapture').onclick=()=>recordingSession?.phase==='recording'?stopScreenRecording():startScreenRecording();
$('recordingReview').onclick=showRecordingPreview;
$('recordingClose').onclick=closeRecordingPreview;
$('recordingSheet').addEventListener('cancel',e=>{e.preventDefault();closeRecordingPreview()});
$('recordingSheet').addEventListener('close',()=>{$('recordingVideo').pause()});
/* 原生 dialog 處理自己的焦點與 Esc，不讓按鍵觸發背後的 App 快捷鍵。 */
$('recordingSheet').addEventListener('keydown',e=>e.stopPropagation());
$('recordingSheet').addEventListener('click',e=>{const r=e.currentTarget.getBoundingClientRect();if(e.target===e.currentTarget&&(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom))closeRecordingPreview()});
$('recordingSave').onclick=async()=>{
  if(!recordingLast)return;
  try{if(await saveFile(recordingLast.name,recordingLast.blob,recordingLast.blob.type))recordingStatus(tl('已儲存錄影'))}
  catch(e){recordingStatus(tl('無法儲存錄影，請再試一次'),true)}
};
$('recordingShare').onclick=async()=>{
  if(!recordingLast)return;
  const file=new File([recordingLast.blob],recordingLast.name,{type:recordingLast.blob.type});
  try{if(navigator.canShare?.({files:[file]})){await navigator.share({files:[file],title:tl('Novaday 畫面錄影')});return}}
  catch(e){if(e?.name==='AbortError')return}
  $('recordingSave').click();
};
new MutationObserver(()=>{if(!$('lock').hidden){stopScreenRecording();if($('recordingSheet').open){closeRecordingPreview();recordingPendingPreview=true}}else if(recordingPendingPreview)showRecordingPreview()})
  .observe($('lock'),{attributes:true,attributeFilter:['hidden']});
addEventListener('pagehide',()=>{
  clearTimeout(recordingNoticeTimer);closeRecordingPreview();
  const s=recordingSession;if(s){s.abandoned=true;stopScreenRecording();releaseRecordingTracks(s)}
  $('recordingVideo').pause();$('recordingVideo').removeAttribute('src');$('recordingVideo').load();
  if(recordingLast){URL.revokeObjectURL(recordingLast.url);recordingLast=null}recordingPendingPreview=false;
});
recordingStatus(tl('選擇此分頁並分享音訊，即可錄製模擬器。'));syncRecordingControls();
