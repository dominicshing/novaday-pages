// 開發者逐顆預覽：正式效果、不同星數、暫停／取消、無障礙與日記資料完全不變。
export default async ({ok,open,run})=>{
  const page=await open({seed:{'orbitlog.profile.v1':{onboarded:1,devOn:1}}});
  await run(page,'devOpen()');await page.waitForTimeout(400);
  const before=await page.evaluate(()=>JSON.stringify({entries,profile:prof,storedEntries:localStorage.getItem(KEY),storedProfile:localStorage.getItem('orbitlog.profile.v1'),freshId,gal:$('gal').innerHTML}));
  ok(await page.locator('#dvStarPick option').count()===88,'逐顆點亮提供全部 88 個星座');
  await page.selectOption('#dvStarPick','Lyn');await page.locator('#dvStarGo').click();await page.waitForTimeout(400);
  ok(await page.locator('#dvStarFig .cstar').count()===0&&await page.locator('#dvStarRange').inputValue()==='0','天貓座從 0 顆星開始預覽');
  await page.selectOption('#dvStarMood','4');
  // 在彗星加入畫面當刻擷取狀態，避免工具往返時飛行已經結束。
  await page.evaluate(()=>{window.devFlightCheck=new Promise(resolve=>{const observer=new MutationObserver(()=>{if(!document.querySelector('.comet.dv-star-effect'))return;observer.disconnect();resolve($('dvStarFig').classList.contains('arriving')&&getComputedStyle($('dvStarFig').querySelector('.fresh')).opacity==='0'&&$('dvStarFig').querySelector('.cfx-lynx').dataset.progress==='0')});observer.observe(document.body,{childList:true})})});
  await page.locator('#dvStarNext').click();
  ok(await page.evaluate(()=>window.devFlightCheck),'彗星飛行時新星保持隱藏，圖案停在上一階段');
  await page.waitForFunction(()=>!$('dvStarNext').disabled);
  ok(await page.locator('#dvStarFig .cstar').count()===1&&await page.locator('#dvStarFig .cfx-lynx').getAttribute('data-progress')==='0.16666666666666666','抵達後點亮第一顆，幼貓顯現 1/6');
  ok(await page.locator('#dvStarFig .st .core').getAttribute('fill')==='var(--m4)','下一顆心情選擇套用正式星星色彩');
  for(let i=2;i<=6;i++){await page.locator('#dvStarNext').click();await page.waitForFunction(()=>!$('dvStarFig').classList.contains('arriving')&&!$('dvStarPlay').disabled)}
  ok(await page.locator('#dvStarCount').textContent()==='6 / 6 顆星'&&await page.locator('#dvStarNext').isDisabled(),'逐顆點到全部六顆後停止，不能超出星數');
  ok(await page.locator('#dvStarFig .lynx-sweep').count()===1&&await page.evaluate(()=>$('dvStarFig').querySelector('.lynx-body').getAnimations().some(a=>a.effect.getTiming().iterations===Infinity&&a.effect.getTiming().duration===5000)),'全部點亮播放完成掃光，之後接上五秒呼吸光');
  await page.locator('#dvStarPlay').click();await page.waitForFunction(()=>$('dvStarRange').value==='1');await page.locator('#dvStarPlay').click();
  await page.waitForFunction(()=>!$('dvStarPlay').disabled);const paused=await page.locator('#dvStarRange').inputValue();await page.waitForTimeout(1800);
  ok(await page.locator('#dvStarRange').inputValue()===paused&&await page.locator('#dvStarPlay').getAttribute('aria-pressed')==='false','全亮後可重播；暫停會完成當前一顆並停止後續點亮');
  await page.locator('#dvStarReset').click();await page.locator('#dvStarPlay').click();await page.waitForFunction(()=>$('dvStarRange').value==='1');
  await page.locator('#dvStarReset').click();await page.waitForTimeout(1500);
  ok(await page.locator('#dvStarRange').inputValue()==='0'&&await page.locator('.dv-star-effect').count()===0,'飛行中重設：回到零顆，沒有延遲出現的彗星或星星');
  await page.selectOption('#dvStarCon','Sge');
  ok(await page.locator('#dvStarRange').getAttribute('max')==='4'&&await page.locator('#dvStarCount').textContent()==='0 / 4 顆星','切換天箭座後使用其四顆星，不固定為六顆');
  await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(100);await page.locator('#dvStarPlay').click();
  await page.waitForFunction(()=>$('dvStarRange').value==='4'&&$('dvStarPlay').getAttribute('aria-pressed')==='false');
  const still=await page.evaluate(()=>({stars:$('dvStarFig').querySelectorAll('.cstar').length,effects:document.querySelectorAll('.dv-star-effect').length,reduce,sysReduce}));
  ok(still.stars===4&&still.effects===0,'減少動態效果仍可逐顆播放，不產生彗星 '+JSON.stringify(still));
  await page.selectOption('#dvStarCon','Lyn');await page.locator('#dvStarRange').focus();await page.keyboard.press('End');
  ok(await page.evaluate(()=>!$('dvStarFig').getAnimations({subtree:true}).some(a=>a.playState==='running')),'拖曳進度可看全亮；減少動態效果時保持靜態');
  await page.emulateMedia({reducedMotion:'no-preference'});await page.waitForTimeout(100);await page.locator('#dvStarReset').click();await page.locator('#dvStarNext').click();
  await page.waitForSelector('.comet.dv-star-effect');await page.keyboard.press('Escape');await page.waitForTimeout(1500);
  ok(await page.locator('#devStarSheet').getAttribute('aria-hidden')==='true'&&await page.locator('.dv-star-effect').count()===0,'Esc 關閉預覽會取消飛行並清除特效');
  ok(await page.evaluate(()=>document.activeElement.id==='dvStarGo'),'切換星座後關閉預覽，焦點仍回到開發者工具的預覽按鈕');
  const after=await page.evaluate(()=>JSON.stringify({entries,profile:prof,storedEntries:localStorage.getItem(KEY),storedProfile:localStorage.getItem('orbitlog.profile.v1'),freshId,gal:$('gal').innerHTML}));
  ok(before===after,'預覽、重播、重設與關閉都不改動日記、個人設定、實際進度或首頁星圖');
  ok(!page.errors.length,'逐顆預覽沒有程式錯誤：'+page.errors.join('; '));await page.context().close();
  for(const url of ['/index.html','/dist/novaday.html']){const p=await open({url,viewport:{width:320,height:568},seed:{'orbitlog.profile.v1':{onboarded:1,devOn:1}}});
    for(let i=0;i<7;i++)await p.locator('#abVer').evaluate(e=>e.click());
    await p.locator('#liDev').evaluate(e=>e.click());await p.waitForTimeout(300);await p.selectOption('#dvStarPick','Lyn');await p.locator('#dvStarGo').click();await p.waitForTimeout(350);
    ok(await p.evaluate(()=>{const e=document.getElementById('devStarSheet').querySelector('.sb');return e.scrollWidth<=e.clientWidth+1}),`${url}：320px 預覽不橫向溢出`);
    await p.emulateMedia({reducedMotion:'reduce'});await p.waitForTimeout(100);await p.locator('#dvStarNext').click();await p.waitForFunction(()=>document.getElementById('dvStarRange').value==='1');
    ok(await p.locator('#dvStarFig .cstar').count()===1&&!p.errors.length,`${url}：分檔／單檔版按鈕可實際點亮星星`);await p.context().close();
  }
};
