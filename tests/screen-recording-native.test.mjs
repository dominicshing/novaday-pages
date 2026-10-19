// 選擇性實際分頁擷取（不替換 API）：RECORDING_BROWSER=chrome npm test screen-recording-native
// Edge：RECORDING_BROWSER=msedge npm test screen-recording-native
// 會開啟獨立測試視窗並自動同意擷取該測試分頁，產生短暫低音量測試音訊。
import {chromium} from 'playwright';
import path from 'node:path';
import os from 'node:os';

export default async ({ok,BASE})=>{
  const channel=process.env.RECORDING_BROWSER;
  if(!channel){console.log('  - Native recording skipped; set RECORDING_BROWSER=chrome or msedge');return}
  if(!['chrome','msedge'].includes(channel))throw Error('RECORDING_BROWSER must be chrome or msedge');
  const browser=await chromium.launch({channel,headless:false,args:['--auto-accept-this-tab-capture','--autoplay-policy=no-user-gesture-required']});
  try{
    const p=await browser.newPage({viewport:{width:1100,height:1000},acceptDownloads:true});const errors=[];p.on('pageerror',e=>errors.push(e.message));
    await p.addInitScript(()=>localStorage.setItem('orbitlog.profile.v1',JSON.stringify({onboarded:1,lang:'en'})));
    await p.goto(BASE+'/index.html');await p.waitForTimeout(1000);
    await p.screenshot({path:path.join(os.tmpdir(),`novaday-recording-${channel}-toolbar.png`)});
    await p.click('#recordingCapture');
    await p.waitForFunction(()=>document.getElementById('recordingCapture').dataset.recording==='true',null,{timeout:20000});
    ok(await p.evaluate(()=>recordingSession.video.getSettings().displaySurface==='browser'),'Native capture uses browser tab');
    ok(await p.evaluate(()=>recordingSession.hasAudio),'Native capture includes tab audio');
    await p.evaluate(()=>{window.__audioTest=new AudioContext();const osc=__audioTest.createOscillator(),gain=__audioTest.createGain();gain.gain.value=.03;osc.connect(gain);gain.connect(__audioTest.destination);osc.start();window.__audioOsc=osc;$('s-home').scrollTop=200});
    await p.waitForTimeout(1500);
    await p.evaluate(()=>go('log'));await p.waitForTimeout(500);
    await p.evaluate(()=>openEditor());await p.waitForTimeout(500);
    await p.setViewportSize({width:1000,height:800});await p.waitForTimeout(1000);
    await p.evaluate(()=>{closeSheet('editor');go('home');__audioOsc.stop();__audioTest.close()});
    await p.click('#recordingCapture');await p.waitForFunction(()=>!recordingInProgress());
    await p.locator('#recordingVideo').evaluate(v=>v.play());await p.waitForTimeout(200);
    const result=await p.evaluate(()=>({mime:recordingLast.blob.type,bytes:recordingLast.blob.size,width:$('recordingVideo').videoWidth,height:$('recordingVideo').videoHeight,device:$('device').getBoundingClientRect().toJSON()}));
    console.log('  Native recording: '+JSON.stringify(result));
    ok(result.width>0&&result.height>result.width&&result.width<1000,'Native video is cropped to portrait simulator, not the browser viewport');
    ok(result.bytes>1000,'Native recording contains encoded frames');
    const [download]=await Promise.all([p.waitForEvent('download'),p.click('#recordingSave')]);
    const file=path.join(os.tmpdir(),`novaday-recording-${channel}${path.extname(download.suggestedFilename())}`);await download.saveAs(file);console.log('  Saved native capture: '+file);
    await p.screenshot({path:path.join(os.tmpdir(),`novaday-recording-${channel}-preview.png`)});
    ok(!errors.length,'Native capture has no script errors: '+errors.join('; '));
  }finally{await browser.close()}
};
