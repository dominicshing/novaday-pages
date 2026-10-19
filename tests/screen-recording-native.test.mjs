// 選擇性實際分頁擷取（不替換 API）：RECORDING_BROWSER=chrome npm test screen-recording-native
// Edge：RECORDING_BROWSER=msedge npm test screen-recording-native
// 使用獨立瀏覽器自動擷取測試分頁，ffmpeg 驗證完整下載檔。RECORDING_HEADED=1 可顯示視窗。
import {chromium} from 'playwright';
import path from 'node:path';
import os from 'node:os';
import {execFileSync} from 'node:child_process';

export default async ({ok,BASE})=>{
  const channel=process.env.RECORDING_BROWSER;
  if(!channel){console.log('  - Native recording skipped; set RECORDING_BROWSER=chrome or msedge');return}
  if(!['chrome','msedge','chromium'].includes(channel))throw Error('RECORDING_BROWSER must be chrome, msedge or chromium');
  const browser=await chromium.launch({channel,headless:process.env.RECORDING_HEADED!=='1',args:['--auto-accept-this-tab-capture','--autoplay-policy=no-user-gesture-required']});
  try{
    const p=await browser.newPage({viewport:{width:1100,height:1000},deviceScaleFactor:2,acceptDownloads:true});const errors=[];p.on('pageerror',e=>errors.push(e.message));
    await p.addInitScript(()=>localStorage.setItem('orbitlog.profile.v1',JSON.stringify({onboarded:1,lang:'en'})));
    await p.goto((process.env.RECORDING_BASE||BASE)+'/index.html',{waitUntil:'domcontentloaded',timeout:90000});await p.waitForTimeout(1000);
    await p.screenshot({path:path.join(os.tmpdir(),`novaday-recording-${channel}-toolbar.png`)});
    /* 顏色標記必須真的出現在編碼後的不同影格；只驗證影片時間前進會漏掉靜止錄影。 */
    await p.evaluate(()=>{const marker=document.createElement('div');marker.id='recording-motion-marker';marker.style.cssText='position:absolute;left:40%;top:40%;width:20%;height:20%;z-index:99;pointer-events:none;background:rgb(240,40,40)';$('device').appendChild(marker)});
    await p.click('#recordingCapture');
    await p.waitForFunction(()=>document.getElementById('recordingCapture').dataset.recording==='true',null,{timeout:20000});
    ok(await p.evaluate(()=>recordingSession.video.getSettings().displaySurface==='browser'),'Native capture uses browser tab');
    ok(await p.evaluate(()=>recordingSession.hasAudio),'Native capture includes tab audio');
    await p.evaluate(()=>{window.__audioTest=new AudioContext();const osc=__audioTest.createOscillator(),gain=__audioTest.createGain();gain.gain.value=.03;osc.connect(gain);gain.connect(__audioTest.destination);osc.start();window.__audioOsc=osc;$('s-home').scrollTop=200});
    await p.waitForTimeout(1500);
    await p.evaluate(()=>{go('log');$('recording-motion-marker').style.background='rgb(40,240,40)'});await p.waitForTimeout(1000);
    await p.evaluate(()=>{openEditor();$('recording-motion-marker').style.background='rgb(40,40,240)'});await p.waitForTimeout(1000);
    await p.setViewportSize({width:1000,height:800});await p.waitForTimeout(1000);
    await p.evaluate(()=>{closeSheet('editor');go('home');__audioOsc.stop();__audioTest.close()});
    await p.click('#recordingCapture');await p.waitForFunction(()=>!recordingInProgress());
    await p.evaluate(()=>$('recording-motion-marker').remove());
    const [download]=await Promise.all([p.waitForEvent('download'),p.click('#recordingSave')]);
    const file=path.join(os.tmpdir(),`novaday-recording-${channel}${path.extname(download.suggestedFilename())}`);await download.saveAs(file);console.log('  Saved native capture: '+file);
    const result=await p.evaluate(()=>({mime:recordingLast.blob.type,bytes:recordingLast.blob.size,width:$('recordingVideo').videoWidth,height:$('recordingVideo').videoHeight,error:$('recordingVideo').error?.message,device:$('device').getBoundingClientRect().toJSON()}));
    console.log('  Native recording: '+JSON.stringify(result));
    ok(!result.error,'Preview has no media decoding error');
    await p.locator('#recordingVideo').evaluate(v=>{v.muted=true;return v.play()});
    await p.waitForFunction(()=>document.getElementById('recordingVideo').ended||document.getElementById('recordingVideo').error,null,{timeout:15000});
    ok(await p.locator('#recordingVideo').evaluate(v=>v.ended&&!v.error&&v.currentTime>1),'Preview plays through to the end');
    execFileSync('ffmpeg',['-v','error','-xerror','-i',file,'-f','null','-'],{timeout:20000,stdio:'pipe'});
    ok(true,'Downloaded file fully decodes without corrupt frames after resizing');
    const pixels=execFileSync('ffmpeg',['-v','error','-i',file,'-an','-vf','fps=5,crop=2:2:iw/2:ih/2,scale=1:1','-pix_fmt','rgb24','-f','rawvideo','-'],{timeout:20000});
    const colors=[];for(let i=0;i<pixels.length;i+=3){const rgb=[...pixels.subarray(i,i+3)],primary=rgb.indexOf(Math.max(...rgb));if(rgb[primary]>150&&rgb.every((v,j)=>j===primary||v<100)&&colors.at(-1)!==primary)colors.push(primary)}
    ok(colors.join(',')==='0,1,2','Decoded video shows red → green → blue as the app changes, rather than repeating the first frame');
    const metadata=JSON.parse(execFileSync('ffprobe',['-v','error','-show_entries','stream=codec_type,width,height:format=duration','-of','json',file],{encoding:'utf8'}));
    ok(metadata.streams.some(s=>s.codec_type==='audio')&&metadata.streams.some(s=>s.codec_type==='video')&&+metadata.format.duration>1,'Downloaded file has video, audio, and a valid duration');
    ok(result.width>0&&result.height>result.width&&result.width<1000,'Native video is cropped to portrait simulator, not the browser viewport');
    ok(result.bytes>1000,'Native recording contains encoded frames');
    await p.screenshot({path:path.join(os.tmpdir(),`novaday-recording-${channel}-preview.png`)});
    ok(!errors.length,'Native capture has no script errors: '+errors.join('; '));
  }finally{await browser.close()}
};
