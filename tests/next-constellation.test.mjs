// 指定下一個星座必須優先於刪除紀錄後留下的未開始排程。
export default async ({ok,open,run})=>{
  const journal=Array.from({length:3},(_,i)=>({id:'next-'+i,date:'2026-01-0'+(i+1),time:'10:00',title:'星星',body:'紀錄',mood:2,tags:[]}));
  const seed=nextPick=>({'orbitlog.profile.v1':{onboarded:1,calm:true,conOrder:['Sge','Ari','Lyn'],...(nextPick?{nextPick}:{})},'orbitlog.seeded.v1':'1','orbitlog.entries.v1':journal});
  for(const url of ['/index.html','/dist/novaday.html']){
    const p=await open({url,seed:seed(),reducedMotion:'reduce'});
    await p.locator('#atlasBtn').click();
    ok((await p.locator('.ah-nx').textContent()).includes('羊座'),url+'：沒有指定時，預告與已保存的順序一致');
    await p.locator('#atSearchBtn').click();await p.locator('#atQ').fill('天貓');
    await p.locator('.at-card[data-k="Lyn"]').click();await p.locator('#cnNextPick').click();
    ok(await p.evaluate(()=>{const prof=JSON.parse(localStorage.getItem('orbitlog.profile.v1'));return prof.nextPick==='Lyn'&&JSON.parse(localStorage.getItem('orbitlog.entries.v1')).length===3&&JSON.stringify(prof.conOrder)==='["Sge"]'}),url+'：選天貓座後保留目前 3/4 進度，取代未開始的舊排程');
    await p.reload();await p.waitForFunction(()=>document.getElementById('conName').textContent);
    ok(await p.evaluate(()=>JSON.parse(localStorage.getItem('orbitlog.profile.v1')).nextPick==='Lyn'&&document.getElementById('conName').textContent==='天箭座'),url+'：重新載入仍保留指定的下一個星座');
    await p.locator('#newBtn').click();await p.locator('#fBody').fill('完成目前星座');await p.locator('#saveBtn').click();
    await p.waitForFunction(()=>document.getElementById('conName').textContent==='天貓座');
    ok(await p.evaluate(()=>{const prof=JSON.parse(localStorage.getItem('orbitlog.profile.v1')),es=JSON.parse(localStorage.getItem('orbitlog.entries.v1'));return prof.conOrder.join(',')==='Sge,Lyn'&&!prof.nextPick&&es.length===4&&es.filter(e=>e.id.startsWith('next-')).length===3&&document.querySelectorAll('#gal .cstar').length===0}),url+'：實際存下最後一則後切換到天貓座，原有紀錄歸屬不變');
    await p.reload();await p.waitForFunction(()=>document.getElementById('conName').textContent==='天貓座');
    ok(await p.evaluate(()=>document.getElementById('conName').textContent==='天貓座'&&!JSON.parse(localStorage.getItem('orbitlog.profile.v1')).nextPick),url+'：切換結果已儲存，重新載入不退回舊順序');
    ok(!p.errors.length,url+'：操作過程沒有程式錯誤');await p.context().close();
  }
  const p=await open({seed:seed('Lyn'),reducedMotion:'reduce'});
  ok(await p.evaluate(()=>prof.nextPick==='Lyn'&&prof.conOrder.join(',')==='Sge'&&nextPreview(consState(entries))==='Lyn'),'舊版本已選好的天貓座會自動修正排程，不用重新選擇');
  await run(p,"openCon('Lyn')");await p.locator('#cnNextPick').click();
  ok(await p.evaluate(()=>!prof.nextPick&&consState(entries).cur==='Sge'&&consState(entries).lit===3),'取消指定不影響目前已點亮的星星');
  const history=await p.evaluate(()=>{prof.conOrder=['Sge','Ari','Lyn'];prof.nextPick='Lyn';entries=Array.from({length:5},(_,i)=>({id:String(i)}));const old=consState(entries.slice(0,3));const unchanged=prof.conOrder.join(',')==='Sge,Ari,Lyn';const current=consState(entries);return unchanged&&old.cur==='Sge'&&current.cur==='Ari'&&current.lit===1&&prof.conOrder.join(',')==='Sge,Ari'&&prof.nextPick==='Lyn'});
  ok(history,'查詢較短的歷史紀錄不重排目前星座，也不消耗指定選擇');
  await p.context().close();
};
