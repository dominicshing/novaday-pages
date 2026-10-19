/* 原生分頁錄影：先裁切到模擬器，再編碼；影片只保留在本機記憶體。 */
let recordingSession=null,recordingLast=null,recordingPendingPreview=false;
const RECORD_ICON='<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="12" height="14" rx="3"/><path d="m15 9 6-3v12l-6-3z"/></svg>';
const RECORD_STOP_ICON='<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="5" width="14" height="14" rx="2"/></svg>';
function recordingInProgress(){return recordingSession!==null}
function recordingSupported(){return !!(isSecureContext&&navigator.mediaDevices?.getDisplayMedia&&globalThis.CropTarget?.fromElement&&
  globalThis.BrowserCaptureMediaStreamTrack?.prototype.cropTo&&globalThis.MediaRecorder?.isTypeSupported)}
function recordingStatus(message){$('recordingStatus').textContent=message}
function recordingElapsed(ms){const seconds=Math.floor(ms/1000);return `${pad(Math.floor(seconds/60))}:${pad(seconds%60)}`}
function syncRecordingControls(){
  const phase=recordingSession?.phase||'idle',active=phase==='recording',supported=recordingSupported(),b=$('recordingCapture');
  const label=tl(active?'停止錄影':phase==='requesting'?'等待分享…':phase==='finalizing'?'正在完成錄影…':'錄製畫面');
  b.innerHTML=(active?RECORD_STOP_ICON:RECORD_ICON)+`<span>${label}</span>`+(active?'<span class="recording-time" id="recordingTime" aria-hidden="true">00:00</span>':'');
  b.setAttribute('aria-label',label);b.setAttribute('aria-pressed',String(active));b.dataset.recording=String(active);b.classList.toggle('recording',active);
  b.disabled=!supported||screenshotBusy||phase==='requesting'||phase==='finalizing';
  if(phase==='requesting'||phase==='finalizing')b.setAttribute('aria-busy','true');else b.removeAttribute('aria-busy');
  $('screenshotCapture').disabled=screenshotBusy||recordingInProgress();
  $('recordingReview').hidden=!recordingLast||recordingInProgress();$('recordingReview').disabled=screenshotBusy;
  if(!supported)recordingStatus(tl('錄影需要桌面版 Chrome 或 Edge，並以 HTTPS 或 localhost 開啟。'));
}
function recordingMime(hasAudio){
  const types=hasAudio?['video/mp4;codecs=avc1.42E01E,mp4a.40.2','video/mp4','video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus','video/webm']:
    ['video/mp4;codecs=avc1.42E01E','video/mp4','video/webm;codecs=vp9','video/webm;codecs=vp8','video/webm'];
  return types.find(type=>MediaRecorder.isTypeSupported(type))||'';
}
function releaseRecordingTracks(s){
  clearInterval(s.timer);
  if(s.video&&s.ended)s.video.removeEventListener('ended',s.ended);
  if(s.audio&&s.audioEnded)s.audio.removeEventListener('ended',s.audioEnded);
  s.stream?.getTracks().forEach(track=>track.stop());
}
function resetRecording(s){
  releaseRecordingTracks(s);
  if(s.recorder){s.recorder.ondataavailable=null;s.recorder.onstop=null;s.recorder.onerror=null}
  s.chunks=[];
  if(recordingSession===s){recordingSession=null;syncRecordingControls()}
}
function showRecordingPreview(){
  if(!recordingLast||recordingInProgress()||!$('lock').hidden)return;
  recordingPendingPreview=false;openSheet('recordingSheet');
  $('recordingSheet')._last=$('recordingCapture');$('recordingSheet')._lastKey='#recordingCapture';
}
function finishRecording(s){
  if(s.finished)return;s.finished=true;
  const type=s.recorder.mimeType||s.chunks.find(c=>c.type)?.type||'',blob=new Blob(s.chunks,{type});
  const valid=!s.failed&&!s.abandoned&&blob.size>0&&/^video\/(mp4|webm)(;|$)/i.test(type);
  if(valid){
    const now=s.startedDate,ext=/^video\/mp4/i.test(type)?'mp4':'webm',video=$('recordingVideo');
    video.pause();video.removeAttribute('src');video.load();
    if(recordingLast)URL.revokeObjectURL(recordingLast.url);
    recordingLast={blob,url:URL.createObjectURL(blob),name:`Novaday-recording-${ymd(now)}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}.${ext}`};
    video.src=recordingLast.url;
    $('recordingDetails').textContent=`${ext.toUpperCase()} · ${recordingElapsed(s.duration)} · ${tl(s.hasAudio?'含分頁音訊':'無音訊')}`;
  }
  resetRecording(s);
  if(s.abandoned)return;
  if(valid){recordingStatus(tl('錄影已完成，可以儲存或分享'));recordingPendingPreview=true;showRecordingPreview()}
  else recordingStatus(tl('錄影失敗，請再試一次'));
}
function stopScreenRecording(){
  const s=recordingSession;if(!s||s.phase==='finalizing')return;
  if(s.phase==='requesting'){s.cancelled=true;releaseRecordingTracks(s);return}
  s.phase='finalizing';s.duration=Date.now()-s.startedAt;syncRecordingControls();recordingStatus(tl('正在完成錄影…'));
  try{if(s.recorder.state!=='inactive')s.recorder.stop()}catch(e){s.failed=true;finishRecording(s)}
  releaseRecordingTracks(s);
}
async function startScreenRecording(){
  if(recordingInProgress()||screenshotBusy||!$('lock').hidden||!recordingSupported())return;
  if($('recordingSheet').classList.contains('open'))closeSheet('recordingSheet');
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
    const mimeType=recordingMime(s.hasAudio);s.recorder=new MediaRecorder(s.stream,mimeType?{mimeType}:undefined);
    s.recorder.ondataavailable=e=>{if(e.data?.size)s.chunks.push(e.data)};
    s.recorder.onstop=()=>finishRecording(s);
    s.recorder.onerror=()=>{s.failed=true;stopScreenRecording()};
    s.ended=()=>stopScreenRecording();s.video.addEventListener('ended',s.ended);
    if(s.audio){s.audioEnded=()=>recordingStatus(tl('錄影中・無音訊'));s.audio.addEventListener('ended',s.audioEnded)}
    s.startedDate=new Date();s.startedAt=Date.now();s.duration=0;
    s.recorder.start(1000);s.phase='recording';syncRecordingControls();
    recordingStatus(tl(s.hasAudio?'錄影中・含分頁音訊':'錄影中・無音訊'));
    s.timer=setInterval(()=>{const timer=$('recordingTime');if(timer)timer.textContent=recordingElapsed(Date.now()-s.startedAt)},1000);
  }catch(e){
    resetRecording(s);if(s.abandoned)return;
    recordingStatus(tl(s.cancelled?'已取消錄影':stage==='permission'&&(e?.name==='NotAllowedError'||e?.name==='AbortError')?'已取消錄影':
      stage==='crop'?'請分享目前的模擬器分頁，無法錄製其他分頁或整個螢幕。':'無法開始錄影，請檢查瀏覽器的分享權限後再試一次。'));
  }
}
$('recordingCapture').onclick=()=>recordingSession?.phase==='recording'?stopScreenRecording():startScreenRecording();
$('recordingReview').onclick=showRecordingPreview;
$('recordingSave').onclick=async()=>{
  if(!recordingLast)return;
  try{if(await saveFile(recordingLast.name,recordingLast.blob,recordingLast.blob.type))recordingStatus(tl('已儲存錄影'))}
  catch(e){recordingStatus(tl('無法儲存錄影，請再試一次'))}
};
$('recordingShare').onclick=async()=>{
  if(!recordingLast)return;
  const file=new File([recordingLast.blob],recordingLast.name,{type:recordingLast.blob.type});
  try{if(navigator.canShare?.({files:[file]})){await navigator.share({files:[file],title:tl('Novaday 畫面錄影')});return}}
  catch(e){if(e?.name==='AbortError')return}
  $('recordingSave').click();
};
new MutationObserver(()=>{if(!$('lock').hidden)stopScreenRecording();else if(recordingPendingPreview)showRecordingPreview()})
  .observe($('lock'),{attributes:true,attributeFilter:['hidden']});
addEventListener('pagehide',()=>{
  const s=recordingSession;if(s){s.abandoned=true;stopScreenRecording();releaseRecordingTracks(s)}
  $('recordingVideo').pause();$('recordingVideo').removeAttribute('src');$('recordingVideo').load();
  if(recordingLast){URL.revokeObjectURL(recordingLast.url);recordingLast=null}recordingPendingPreview=false;
});
recordingStatus(tl('選擇此分頁並分享音訊，即可錄製模擬器。'));syncRecordingControls();
