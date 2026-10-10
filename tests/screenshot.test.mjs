// 畫面截圖：PNG、捲動位置、分頁、分享降級，以及失敗後可重試。
export default async ({ok,open})=>{
  const p=await open({reducedMotion:'reduce',seed:{'orbitlog.profile.v1':{onboarded:1},'orbitlog.seeded.v1':'1'}});
  const capture=async selector=>{await p.click(selector,{noWaitAfter:true,timeout:60000});await p.waitForFunction(()=>!screenshotBusy,null,{timeout:90000});await p.locator('#screenshotPreview img').evaluate(img=>img.decode())};
  await p.evaluate(()=>{devFillCons(88);go('atlas');atTab='all';renderAtlas();$('s-atlas').scrollTop=700});
  await p.waitForTimeout(400);
  const scroll=await p.evaluate(()=>$('s-atlas').scrollTop);
  const marker=await p.evaluate(()=>{const el=document.createElement('div');el.id='capture-test-marker';el.style.cssText='position:absolute;left:20px;top:1000px;width:8px;height:8px;background:rgb(11,211,99);z-index:10';$('s-atlas').appendChild(el);const r=el.getBoundingClientRect();return {x:r.x+4,y:r.y+4}});
  await capture('#atTop .screenshot-trigger');
  ok(await p.evaluate(()=>{const img=$('screenshotPreview').firstElementChild;return img.naturalWidth===780&&img.naturalHeight===1688&&screenshotBlob.type==='image/png'}),'截圖是目前手機畫面的 2 倍解析度 PNG');
  ok(await p.evaluate(()=>$('s-atlas').scrollTop)===scroll,'擷取後保留捲動位置');
  ok(await p.evaluate(({x,y})=>{const img=$('screenshotPreview').firstElementChild,cv=document.createElement('canvas');cv.width=img.naturalWidth;cv.height=img.naturalHeight;const ctx=cv.getContext('2d');ctx.drawImage(img,0,0);const rgba=ctx.getImageData(x*2,y*2,1,1).data;return rgba[0]===11&&rgba[1]===211&&rgba[2]===99},marker),'PNG 裡的內容位置符合捲動後的可見畫面');
  await p.evaluate(()=>$('capture-test-marker').remove());
  const [download]=await Promise.all([p.waitForEvent('download'),p.click('#screenshotSave')]);
  ok(/^Novaday-atlas-.*\.png$/.test(download.suggestedFilename()),'可下載以分頁與時間命名的截圖');
  await p.evaluate(()=>{Object.defineProperty(navigator,'canShare',{configurable:true,value:()=>true});Object.defineProperty(navigator,'share',{configurable:true,value:async data=>{window.__sharedCapture={type:data.files[0].type,name:data.files[0].name}}})});
  await p.click('#screenshotShare');
  ok(await p.evaluate(()=>window.__sharedCapture?.type==='image/png'),'系統分享收到 PNG 檔案');
  await p.evaluate(()=>{Object.defineProperty(navigator,'share',{configurable:true,value:async()=>{throw new DOMException('取消','AbortError')}});window.__captureDownloads=0;document.addEventListener('click',e=>{if(e.target.matches('a[download]'))window.__captureDownloads++})});
  await p.click('#screenshotShare');await p.waitForTimeout(200);
  ok(await p.evaluate(()=>window.__captureDownloads===0),'取消系統分享時不另外下載');
  await p.evaluate(()=>Object.defineProperty(navigator,'canShare',{configurable:true,value:()=>false}));
  const [fallback]=await Promise.all([p.waitForEvent('download'),p.click('#screenshotShare')]);
  ok(fallback.suggestedFilename()===download.suggestedFilename(),'不支援系統分享時改為下載同一張截圖');

  await p.evaluate(()=>{closeSheet('screenshotSheet');window.__captureOriginal=modernScreenshot.domToBlob;modernScreenshot.domToBlob=async()=>{throw new Error('test failure')}});
  await p.waitForTimeout(400);await p.click('#atTop .screenshot-trigger');await p.waitForFunction(()=>!screenshotBusy);
  ok(await p.evaluate(()=>$('screenshotStatus').textContent.includes('失敗')&&![...document.querySelectorAll('.screenshot-trigger')].some(b=>b.disabled)),'失敗會顯示提示並恢復截圖按鈕');
  await p.evaluate(()=>{modernScreenshot.domToBlob=window.__captureOriginal});
  for(const tab of ['home','log','me']){
    await p.evaluate(tab=>go(tab),tab);await p.waitForTimeout(400);
    await capture(`#s-${tab} .screenshot-trigger`);
    ok(await p.evaluate(()=>screenshotBlob.size>1000),`${tab} 分頁可產生截圖`);
    await p.keyboard.press('Escape');await p.waitForTimeout(400);
    ok(await p.evaluate(tab=>!$('screenshotSheet').classList.contains('open')&&document.activeElement===document.querySelector(`#s-${tab} .screenshot-trigger`),tab),'Esc 關閉預覽並回到截圖按鈕');
  }
  await p.evaluate(()=>{window.__captureCalls=0;modernScreenshot.domToBlob=async()=>{window.__captureCalls++;await new Promise(r=>setTimeout(r,100));return screenshotBlob}});
  await p.evaluate(()=>Promise.all([captureScreenshot(),captureScreenshot()]));
  ok(await p.evaluate(()=>window.__captureCalls===1),'連續點擊只擷取一次');
  ok(!p.errors.length,'截圖操作沒有程式錯誤 '+p.errors.join('; '));
  await p.context().close();
};
