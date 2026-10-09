// 最後一顆星 → 完成卡片 → 關閉後才換星座（使用真正動畫和畫面操作）。
export default async ({ok,open})=>{
  for(const [url,k,n,name,nextName] of [['/index.html','Lyn',6,'天貓座','天箭座'],['/dist/novaday.html','Lyn',6,'天貓座','天箭座'],['/index.html','Sge',4,'天箭座','天貓座']]){
    const label=url+' '+name,seed={'orbitlog.profile.v1':{onboarded:1,conOrder:[k],nextPick:k==='Lyn'?'Sge':'Lyn'},'orbitlog.seeded.v1':'1','orbitlog.entries.v1':Array.from({length:n-1},(_,i)=>({id:'finish-'+i,date:'2026-01-0'+(i+1),time:'10:00',title:'星',body:'紀錄',mood:2,tags:[]}))};
    const p=await open({url,seed,reducedMotion:'no-preference'});
    await p.locator('#newBtn').click();await p.locator('#fBody').fill('最後一顆星');
    await p.evaluate(()=>{
      window.completionFrames={names:[],flight:null,arrived:null,card:null};
      const capture=()=>{const gal=document.getElementById('gal'),card=document.getElementById('conDone'),f=window.completionFrames,name=document.getElementById('conName').textContent;
        if(f.names.at(-1)!==name)f.names.push(name);
        if(document.querySelector('.comet')&&!f.flight)f.flight={name,stars:gal.querySelectorAll('.cstar').length,hidden:getComputedStyle(gal.querySelector('.fresh')).opacity==='0',progress:gal.querySelector('.cfx-lynx')?.dataset.progress,card:card.classList.contains('show')};
        if(f.flight&&!gal.classList.contains('arriving')&&!f.arrived&&(!gal.querySelector('.cfx-lynx')||gal.querySelector('.cfx-lynx').dataset.progress==='1'))f.arrived={name,time:performance.now(),card:card.classList.contains('show'),progress:gal.querySelector('.cfx-lynx')?.dataset.progress,blocked:document.getElementById('newBtn').disabled};
        if(card.classList.contains('show')&&!f.card)f.card={name,time:performance.now(),title:document.getElementById('cdName').textContent,settled:gal.getAnimations({subtree:true}).filter(a=>Number.isFinite(a.effect.getComputedTiming().endTime)).every(a=>a.playState==='finished')};
      };
      window.completionObserver=new MutationObserver(capture);window.completionObserver.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});capture();
    });
    await p.locator('#saveBtn').click();await p.waitForSelector('#conDone.show',{timeout:15000});
    const frames=await p.evaluate(()=>window.completionFrames);
    ok(frames.flight?.name===name&&frames.flight.stars===n&&frames.flight.hidden&&!frames.flight.card,label+'：彗星飛向原星座最後一顆星，抵達前保持隱藏');
    ok(frames.arrived?.name===name&&!frames.arrived.card&&frames.arrived.blocked,label+'：抵達後先點亮最後一顆，不提前顯示完成卡片');
    if(k==='Lyn')ok(frames.flight.progress===String(5/6)&&frames.arrived.progress==='1',label+'：彗星抵達後才揭露最後一區身體');
    ok(frames.card?.name===name&&frames.card.title===name&&frames.card.settled&&frames.card.time-frames.arrived.time>=1500,label+'：點亮動畫結束後顯示剛完成的星座卡片');
    ok(frames.names.length===1&&frames.names[0]===name,label+'：卡片關閉前首頁沒有閃到下一個星座');
    await p.waitForTimeout(300);
    ok(await p.locator('#conName').textContent()===name&&await p.locator('#newBtn').isDisabled(),label+'：卡片停留期間保留完成星座並避免重複新增');
    await p.locator('#cdOk').click();await p.waitForFunction(nextName=>document.getElementById('conName').textContent===nextName,nextName);
    ok(await p.locator('#gal .cstar').count()===0&&await p.locator('#newBtn').isEnabled(),label+'：關閉卡片後才切換至指定星座的第一顆');
    ok(await p.evaluate(n=>JSON.parse(localStorage.getItem('orbitlog.entries.v1')).length===n,n)&&!p.errors.length,label+'：日記已儲存且無程式錯誤');
    await p.context().close();
  }
};
