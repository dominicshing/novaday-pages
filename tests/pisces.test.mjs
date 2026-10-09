// 雙魚透明圖、14 顆主星對位、分區揭露、星點閃爍與完成流程。
export default async ({ok,open,run})=>{
  const p=await open({seed:{'orbitlog.profile.v1':{onboarded:1,devOn:1,conOrder:['Psc'],nextPick:'Lyn'},'orbitlog.seeded.v1':'1','orbitlog.entries.v1':Array.from({length:13},(_,i)=>({id:'fish-'+i,date:'2026-01-'+String(i+1).padStart(2,'0'),time:'10:00',title:'星河',body:'紀錄',mood:i%5,tags:[]}))}});
  ok(await p.locator('#gal .cfx-pisces').count()===1&&await p.locator('#gal .cstar').count()===13,'雙魚座使用新插畫並保留實際 13/14 進度');
  ok(await p.evaluate(()=>document.querySelector('#gal .pisces-body image').getAttribute('href')===PISCES_ART&&PISCES_ART.startsWith('data:image/webp;base64,')),'透明圖片內嵌，離線及單檔版也可使用');
  const masks=await p.evaluate(()=>{const frames=Array.from({length:15},(_,n)=>piscesRegion(n).values);let monotonic=true;for(let n=1;n<15;n++)for(let i=0;i<frames[n].length;i++)if(frames[n][i]<frames[n-1][i])monotonic=false;return{empty:frames[0].every(v=>v===0),full:frames[14].every(v=>v===255),monotonic,lower:frames[5][235*380+316],upper:frames[5][70*380+142],cache:piscesRegion(5)===piscesRegion(5)}});
  ok(masks.empty&&masks.full&&masks.monotonic&&masks.lower>200&&masks.upper===0,'14 顆主星依序揭露下方小魚、緞帶及上方小魚');ok(masks.cache,'各階段遮罩快取重用');
  ok(await p.evaluate(()=>{for(let n=1;n<=14;n++){const a=piscesRegion(n-1).values,b=piscesRegion(n).values,s=piscesRegionStep(n-1,n),D=piscesDistances()[n-1];for(let i=0;i<a.length;i++)if(b[i]>a[i]&&D[i]>(s.radius*.5)**2)return false}return true}),'每一階段擴散結束都完整顯示，不留下半透明尾緣');
  const alignment=await p.evaluate(()=>[[380,300,46],[110,86,12],[84,52,9],[300,220,30],[1080,760,120]].every(([W,H,pad])=>{const s=Math.min(W/380,H/300),P=conProj('Psc',W,H,pad),R=conProj('Psc',380,300,46);return P.every(([x,y],i)=>Math.hypot(x-((W-380*s)/2+R[i][0]*s),y-((H-300*s)/2+R[i][1]*s))<.015)}));ok(alignment,'首頁、圖鑑、小卡、完成及分享尺寸均與星線對位');
  ok(await p.evaluate(()=>{const stars=[...document.querySelectorAll('#gal .pisces-twinkle')];return stars.length>10&&stars.every(s=>s.querySelectorAll('path').length===2&&!s.querySelector('circle')&&s.getAnimations().some(a=>a.animationName==='piscesTwinkle'))}),'閃爍的是細小四芒星，不是圓點');
  await p.evaluate(()=>{const h=document.createElement('div');h.id='fishMaskCheck';h.style='position:fixed;left:0;top:0;width:380px;height:300px;background:black;z-index:99999';h.innerHTML=`<svg width="380" height="300"><defs>${piscesRegionMask('fishVisual',14,13,0)}</defs><rect width="380" height="300" fill="white" mask="url(#fishVisual)"/></svg>`;document.body.append(h);h.querySelector('.pisces-region-wave').getAnimations()[0].pause()});
  const frames=[];for(const t of [0,450,1900]){await p.evaluate(t=>document.querySelector('#fishMaskCheck .pisces-region-wave').getAnimations()[0].currentTime=t,t);frames.push(await p.locator('#fishMaskCheck').screenshot({animations:'allow'}))}ok(!frames[0].equals(frames[1])&&!frames[1].equals(frames[2]),'揭露起點、中途、終點的實際畫面持續變化');await p.evaluate(()=>document.getElementById('fishMaskCheck').remove());
  await run(p,"devOpen();devStarOpen('Psc')");
  ok(await p.locator('#dvStarRange').getAttribute('max')==='14'&&await p.locator('#dvStarFig .pisces-shadow').getAttribute('opacity')==='0.14','逐顆預覽從淡剪影開始，共 14 顆');
  await p.locator('#dvStarNext').click();await p.waitForFunction(()=>!document.getElementById('dvStarNext').disabled);
  ok(await p.locator('#dvStarFig .pisces-regional').getAttribute('data-lit')==='1','預覽可點亮第一顆並完成區域揭露');
  await run(p,"closeSheet('devStarSheet');closeSheet('devSheet');openEditor();$('fBody').value='雙魚完成';$('fBody').dispatchEvent(new Event('input',{bubbles:true}));$('saveBtn').click()");
  await p.waitForSelector('#conDone.show .cfx-pisces.full',{timeout:15000});
  ok(await p.locator('#conName').textContent()==='雙魚座'&&await p.locator('#cdFig .cstar').count()===14,'最後一顆點亮後先顯示完整雙魚卡片，首頁保持雙魚座');
  ok(await p.evaluate(()=>document.querySelector('#cdFig .pisces-body').getAnimations().some(a=>a.effect.getTiming().duration===5000&&a.effect.getTiming().iterations===Infinity)),'全亮後以五秒循環呼吸光，身體不縮放');
  await p.locator('#conDone').screenshot({path:'/tmp/pisces-complete.png'});
  ok(await p.evaluate(async()=>{const i=new Image();i.src=svgURL(shareSVG('Psc'));await i.decode();return i.naturalWidth===1080&&skyImg('Psc').startsWith('data:image/svg+xml')}),'雙魚分享圖卡可解碼，日記背景可生成');
  await p.emulateMedia({reducedMotion:'reduce'});ok(await p.evaluate(()=>!document.querySelector('#cdFig .cfx-pisces').getAnimations({subtree:true}).some(a=>a.playState==='running')),'減少動態效果時維持靜態雙魚');
  await p.locator('#cdOk').click();await p.waitForFunction(()=>document.getElementById('conName').textContent==='天貓座');ok(true,'收進圖鑑後才切換下一個星座');
  ok(!p.errors.length,'雙魚實際流程沒有程式錯誤：'+p.errors.join('; '));await p.context().close();
  const dist=await open({url:'/dist/novaday.html',seed:{'orbitlog.profile.v1':{onboarded:1,conOrder:['Psc']},'orbitlog.seeded.v1':'1','orbitlog.entries.v1':[]},reducedMotion:'reduce'});
  ok(await dist.locator('#gal .cfx-pisces').count()===1&&await dist.locator('#gal .pisces-shadow').getAttribute('opacity')==='0.14'&&!dist.errors.length,'單檔版的未點亮雙魚保留淡剪影');await dist.context().close();
};
