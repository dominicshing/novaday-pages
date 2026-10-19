// 真實 MediaRecorder 編碼合成影音，僅替換必須由人操作的分享選擇器與裁切 API。
export default async ({ok,open})=>{
  const p=await open({viewport:{width:1000,height:900},reducedMotion:'reduce',seed:{'orbitlog.profile.v1':{onboarded:1,lang:'en'},'orbitlog.seeded.v1':'1'}});
  const install=async page=>page.evaluate(()=>{
    window.__capture={calls:0,crops:0,recorders:0,mode:'ok',audio:false,streams:[],contexts:[],revoked:[]};
    const revoke=URL.revokeObjectURL.bind(URL);URL.revokeObjectURL=url=>{__capture.revoked.push(url);revoke(url)};
    const NativeRecorder=MediaRecorder;
    window.MediaRecorder=class extends NativeRecorder{
      static isTypeSupported(type){return (!__capture.webmOnly||type.startsWith('video/webm'))&&NativeRecorder.isTypeSupported(type)}
      constructor(stream,options){super(stream,options);__capture.recorders++;__capture.recorder=this;__capture.mime=options?.mimeType}
    };
    window.BrowserCaptureMediaStreamTrack=class{cropTo(){}};
    window.CropTarget={fromElement:async el=>{__capture.target=el.id;return el}};
    Object.defineProperty(navigator.mediaDevices,'getDisplayMedia',{configurable:true,value:async options=>{
      __capture.calls++;__capture.options=options;
      if(__capture.mode==='cancel')throw new DOMException('Canceled','NotAllowedError');
      if(__capture.mode==='permissionError')throw new DOMException('Unavailable','NotReadableError');
      const cv=document.createElement('canvas');cv.width=160;cv.height=240;__capture.canvas=cv;
      const ctx=cv.getContext('2d');let frame=0;
      const draw=()=>{ctx.fillStyle=frame++%2?'#6fe3d6':'#8a7cff';ctx.fillRect(0,0,cv.width,cv.height);ctx.fillStyle='white';ctx.fillRect(20,20,frame%120,20)};
      draw();const timer=setInterval(draw,80),stream=cv.captureStream(15),video=stream.getVideoTracks()[0];
      const stop=video.stop.bind(video);video.stop=()=>{clearInterval(timer);stop()};
      video.getSettings=()=>({displaySurface:__capture.mode==='wrongSurface'?'monitor':'browser'});
      video.cropTo=async()=>{__capture.crops++;if(__capture.mode==='cropFailure')throw Error('Wrong tab');if(__capture.mode==='cropPending')await new Promise(resolve=>__capture.resolveCrop=resolve)};
      if(__capture.audio){const ac=new AudioContext(),osc=ac.createOscillator(),dest=ac.createMediaStreamDestination();osc.connect(dest);osc.start();stream.addTrack(dest.stream.getAudioTracks()[0]);__capture.contexts.push(ac)}
      __capture.streams.push(stream);
      if(__capture.mode==='pending')await new Promise(resolve=>__capture.resolvePermission=resolve);
      return stream;
    }});
  });
  await install(p);
  await p.evaluate(()=>{window.__cropTarget=CropTarget;window.CropTarget=undefined;syncRecordingControls()});
  ok(await p.locator('#recordingCapture').isDisabled()&&await p.locator('#recordingStatus').textContent().then(t=>t.includes('desktop Chrome or Edge')),'Unsupported browser explains requirements');
  ok(!await p.locator('#screenshotCapture').isDisabled(),'Screenshot remains available without recording support');
  await p.evaluate(()=>{window.CropTarget=__cropTarget;syncRecordingControls()});
  const start=async()=>{await p.click('#recordingCapture');await p.waitForFunction(()=>document.getElementById('recordingCapture').dataset.recording==='true')};
  const stop=async()=>{await p.click('#recordingCapture');await p.waitForFunction(()=>!recordingInProgress())};
  const close=async()=>{await p.evaluate(()=>closeRecordingPreview());await p.waitForTimeout(200)};
  await start();await p.waitForTimeout(1150);
  ok(await p.evaluate(()=>__capture.calls===1&&__capture.crops===1&&__capture.target==='device'&&__capture.options.audio&&__capture.options.video.frameRate===30),'Requests tab audio and crops simulator before encoding');
  ok(await p.locator('#recordingStatus').textContent()==='Recording without audio','Missing audio explicitly shown');
  ok(await p.locator('#recordingCapture .recording-audio').isVisible(),'Muted icon indicates recording without audio');
  ok(await p.locator('#recordingTime').textContent()!=='00:00','Elapsed time advances');
  await p.evaluate(()=>{startScreenRecording();startScreenRecording();captureScreenshot()});
  ok(await p.evaluate(()=>__capture.calls===1&&!screenshotBusy)&&await p.locator('#screenshotCapture').isDisabled(),'Duplicate starts and screenshots blocked during recording');
  await p.evaluate(()=>openEditor());await p.waitForTimeout(200);
  await p.evaluate(()=>{const f=[...$('editor').querySelectorAll(FOCUSABLE)].filter(x=>x.getClientRects().length&&getComputedStyle(x).visibility!=='hidden');f.at(-1).focus()});
  await p.keyboard.press('Tab');ok(await p.locator('#recordingCapture').evaluate(el=>el===document.activeElement),'Stop is reachable from an open panel with Tab');
  await p.keyboard.press('Shift+Tab');ok(await p.evaluate(()=>$('editor').contains(document.activeElement)),'Shift+Tab returns from Stop to the panel');
  await p.evaluate(()=>{closeSheet('editor');__capture.canvas.width=319;__capture.canvas.height=481});await p.waitForTimeout(250);
  ok(await p.evaluate(()=>recordingSession.canvas.width===160&&recordingSession.canvas.height===240),'Encoder dimensions remain fixed when source size changes');await stop();
  await p.locator('#recordingVideo').evaluate(v=>v.play());await p.waitForTimeout(150);
  ok(await p.locator('#recordingVideo').evaluate(v=>v.videoWidth===160&&v.videoHeight===240&&v.readyState>=2),'Finalized recording is a playable video');
  ok(await p.evaluate(()=>__capture.streams.every(s=>s.getTracks().every(t=>t.readyState==='ended'))),'All capture tracks stopped');
  ok(await p.evaluate(()=>recordingLast.name.endsWith(recordingLast.blob.type.startsWith('video/mp4')?'.mp4':'.webm')),'Filename uses actual recorder format');
  const previous=await p.evaluate(()=>recordingLast.url);
  const [download]=await Promise.all([p.waitForEvent('download'),p.click('#recordingSave')]);
  ok(/^Novaday-recording-\d{4}-\d{2}-\d{2}-\d{6}\.(mp4|webm)$/.test(download.suggestedFilename()),'Video downloads with start timestamp');
  await p.evaluate(()=>{Object.defineProperty(navigator,'canShare',{configurable:true,value:()=>true});Object.defineProperty(navigator,'share',{configurable:true,value:async data=>{window.__sharedRecording=data.files[0]}})});
  await p.click('#recordingShare');ok(await p.evaluate(()=>__sharedRecording.type===recordingLast.blob.type&&__sharedRecording.size===recordingLast.blob.size),'Share receives the recorded video');
  await p.evaluate(()=>{window.__downloads=0;document.addEventListener('click',e=>{if(e.target.matches('a[download]'))__downloads++});Object.defineProperty(navigator,'share',{configurable:true,value:async()=>{throw new DOMException('Canceled','AbortError')}})});
  await p.click('#recordingShare');await p.waitForTimeout(100);ok(await p.evaluate(()=>__downloads===0),'Canceling share does not download');
  await p.evaluate(()=>Object.defineProperty(navigator,'canShare',{configurable:true,value:()=>false}));
  const [fallback]=await Promise.all([p.waitForEvent('download'),p.click('#recordingShare')]);ok(fallback.suggestedFilename()===download.suggestedFilename(),'Unsupported sharing falls back to download');
  await p.evaluate(()=>{window.__saveFile=saveFile;saveFile=async()=>{throw Error('Download failed')}});await p.click('#recordingSave');
  ok(await p.locator('#recordingFeedback').isVisible()&&await p.locator('#recordingFeedback').textContent().then(t=>t.includes('Couldn’t save')),'Save failure is visible inside the preview dialog');
  await p.evaluate(()=>{saveFile=__saveFile});
  await p.keyboard.press('Escape');ok(await p.evaluate(()=>!$('recordingSheet').open&&$('recordingVideo').paused),'Escape closes native preview and pauses playback');
  await close();await p.click('#recordingReview');ok(await p.locator('#recordingSheet').evaluate(el=>el.open),'Completed recording can be reopened');await close();

  for(const mode of ['cancel','permissionError','wrongSurface','cropFailure']){
    const count=await p.evaluate(mode=>{__capture.mode=mode;return __capture.recorders},mode);
    await p.click('#recordingCapture');await p.waitForFunction(()=>!recordingInProgress());
    ok(await p.evaluate(n=>__capture.recorders===n&&__capture.streams.every(s=>s.getTracks().every(t=>t.readyState==='ended')),count),`${mode}: no uncropped recorder or live tracks`);
    ok(await p.evaluate(url=>recordingLast.url===url,previous),`${mode}: previous recording retained`);
  }
  await p.evaluate(()=>{__capture.mode='pending';startScreenRecording()});await p.waitForFunction(()=>!!__capture.resolvePermission);
  await p.evaluate(()=>{openLock('preview');__capture.resolvePermission()});await p.waitForFunction(()=>!recordingInProgress());
  ok(await p.evaluate(()=>__capture.streams.at(-1).getTracks().every(t=>t.readyState==='ended')),'Lock while picker is pending cancels returned tracks');
  await p.evaluate(()=>closeLock());await p.waitForFunction(()=>$('lock').hidden);
  await p.evaluate(()=>{__capture.mode='cropPending';startScreenRecording()});await p.waitForFunction(()=>!!__capture.resolveCrop);
  await p.evaluate(()=>openLock('preview'));await p.waitForTimeout(50);await p.evaluate(()=>__capture.resolveCrop());await p.waitForFunction(()=>!recordingInProgress());
  ok(await p.evaluate(()=>__capture.streams.at(-1).getTracks().every(t=>t.readyState==='ended')),'Lock while cropping cancels before encoding');
  await p.evaluate(()=>closeLock());await p.waitForFunction(()=>$('lock').hidden);

  await p.evaluate(()=>{__capture.mode='ok';__capture.audio=true;__capture.webmOnly=true});await start();await p.waitForTimeout(400);
  ok(await p.evaluate(()=>recordingSession.recorder.stream.getAudioTracks().length===1&&__capture.mime.startsWith('video/webm')),'WebM fallback records audio track');
  await p.evaluate(()=>recordingSession.video.dispatchEvent(new Event('ended')));await p.waitForFunction(()=>!recordingInProgress());
  ok(await p.evaluate(()=>recordingLast.name.endsWith('.webm')&&$('recordingSheet').open),'Browser stop finalizes once and previews WebM');
  ok(await p.evaluate(url=>__capture.revoked.includes(url),previous),'Replacing completed recording revokes old URL');await close();
  await start();await p.waitForTimeout(300);await p.evaluate(()=>openLock('preview'));await p.waitForFunction(()=>!recordingInProgress());
  ok(await p.evaluate(()=>!$('recordingSheet').open&&recordingPendingPreview),'Lock defers completed preview');
  await p.evaluate(()=>closeLock());await p.waitForFunction(()=>$('recordingSheet').open);await close();
  const validUrl=await p.evaluate(()=>recordingLast.url);
  await start();await p.waitForTimeout(200);
  await p.evaluate(()=>{const s=recordingSession;s.recorder.ondataavailable=()=>{s.chunks.push(new Blob(['invalid video'],{type:'video/mp4'}))}});await stop();
  ok(await p.evaluate(url=>recordingLast.url===url&&!$('recordingSheet').open,validUrl),'Undecodable output is rejected and previous valid recording retained');
  await start();await p.waitForTimeout(200);await p.evaluate(()=>recordingSession.recorder.dispatchEvent(new Event('error')));await p.waitForFunction(()=>!recordingInProgress());
  ok(await p.locator('#recordingStatus').textContent()==='Recording failed. Please try again.','Encoder error restores idle with retry message');
  await p.evaluate(()=>openOnb(true));await start();await p.waitForTimeout(300);await stop();
  ok(await p.evaluate(()=>$('recordingSheet').open&&$('recordingSheet').matches(':modal')),'Onboarding recording opens a modal above the simulator');await close();
  await p.evaluate(()=>obFinish(false));await p.waitForTimeout(200);
  await p.setViewportSize({width:320,height:740});await start();
  ok(await p.locator('.preview-actions').evaluate(el=>{const r=el.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth}),'Toolbar fits narrow viewport while recording');
  await stop();await close();
  ok(await p.evaluate(()=>I18N_MISS.size===0),'Recording strings have English translations');
  await p.evaluate(()=>{window.dispatchEvent(new PageTransitionEvent('pagehide'));return Promise.all(__capture.contexts.map(c=>c.close()))});
  ok(await p.evaluate(()=>!recordingLast&&!$('recordingVideo').getAttribute('src')),'Page exit releases saved video URL');
  ok(!p.errors.length,'Recording has no script errors: '+p.errors.join('; '));await p.context().close();

  const dist=await open({url:'/dist/novaday.html',viewport:{width:1000,height:900},seed:{'orbitlog.profile.v1':{onboarded:1,lang:'en'}}});
  await install(dist);
  await dist.click('#recordingCapture');await dist.waitForFunction(()=>document.getElementById('recordingCapture').dataset.recording==='true');await dist.waitForTimeout(300);
  await dist.click('#recordingCapture');await dist.waitForFunction(()=>document.getElementById('recordingSheet').open);
  ok(await dist.locator('#recordingVideo').evaluate(v=>!!v.src),'Standalone build can record and preview');
  ok(!dist.errors.length,'Standalone recording has no script errors');await dist.context().close();
};
