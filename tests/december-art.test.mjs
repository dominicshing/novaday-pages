// 十二月全數透明插畫：各自的星點、分區遮罩、跨尺寸對位與完成流程。
export default async ({ok,open,run})=>{
  const keys=['Ari','Eri','For','Hor','Hyi','Per','Tri'];
  const seed={'orbitlog.profile.v1':{onboarded:1,devOn:1,conOrder:['For'],nextPick:'Lyn'},'orbitlog.seeded.v1':'1','orbitlog.entries.v1':Array.from({length:2},(_,i)=>({id:'dec-'+i,date:'2026-01-0'+(i+1),time:'10:00',title:'星河',body:'紀錄',mood:i,tags:[]}))};
  const p=await open({seed});
  ok(await p.evaluate(keys=>JSON.stringify(Object.keys(CON).filter(k=>conSeason(k).m===12).sort())===JSON.stringify(keys),keys),'涵蓋十二月全部七個星座');
  ok(await p.evaluate(keys=>new Set(keys.map(k=>constellationArt(k))).size===7,keys),'七個星座使用各自的新插畫');
  for(const k of keys){
    const r=await p.evaluate(async k=>{
      const n=CON[k].s.length,frames=Array.from({length:n+1},(_,i)=>imageRegion(k,i).values);let monotonic=true,covered=true;
      for(let j=1;j<=n;j++){const s=imageRegionStep(k,j-1,j),D=imageDistances(k)[j-1];for(let i=0;i<frames[j].length;i++){if(frames[j][i]<frames[j-1][i])monotonic=false;if(frames[j][i]>frames[j-1][i]&&D[i]>(s.radius*.5)**2)covered=false}}
      const alignment=[[380,300,46],[110,86,12],[84,52,9],[300,220,30],[1080,760,120]].every(([W,H,pad])=>{const s=Math.min(W/380,H/300),P=conProj(k,W,H,pad),R=conProj(k,380,300,46);return P.every(([x,y],i)=>Math.hypot(x-((W-380*s)/2+R[i][0]*s),y-((H-300*s)/2+R[i][1]*s))<.015)});
      const host=document.createElement('div');host.innerHTML=`<svg>${conSVG(k,380,300,46,n)}</svg>`;
      const image=new Image();image.src=constellationArt(k);await image.decode();const c=document.createElement('canvas');c.width=image.width;c.height=image.height;const ctx=c.getContext('2d');ctx.drawImage(image,0,0);const alpha=ctx.getImageData(0,0,c.width,c.height).data;let clear=0,solid=0;for(let i=3;i<alpha.length;i+=4){if(alpha[i]===0)clear++;if(alpha[i]>200)solid++}
      const share=new Image();share.src=svgURL(shareSVG(k));await share.decode();
      return{n,name:CON[k].n,monotonic,covered,empty:frames[0].every(v=>v===0),full:frames[n].every(v=>v===255),alignment,stars:host.querySelectorAll('.cstar').length,art:host.querySelector('.image-body image').getAttribute('href')===DECEMBER_ART[k],alpha:clear>alpha.length/40&&solid>alpha.length/400,share:share.naturalWidth===1080&&skyImg(k).startsWith('data:image/svg+xml')};
    },k);
    ok(r.art&&r.stars===r.n&&r.alpha,r.name+'：透明插畫及 '+r.n+' 顆主星正確');
    ok(r.monotonic&&r.empty&&r.full&&r.covered,r.name+'：每一階段只增加亮區，擴散完成後完整揭露');
    ok(r.alignment&&r.share,r.name+'：各尺寸星線對位，分享圖卡可解碼');
  }
  const exports=await p.evaluate(async keys=>{const data=await(await fetch('assets/data/constellations.json')).json();for(const k of keys){if(data.constellations[k].figure.image_data_url!==constellationArt(k))return false;const sums=[];for(const state of ['lit','unlit']){const i=new Image();i.src=`assets/svg/constellations/${state}/${k}.svg`;await i.decode();const c=document.createElement('canvas');c.width=380;c.height=300;const ctx=c.getContext('2d');ctx.drawImage(i,0,0);const a=ctx.getImageData(0,0,380,300).data;let sum=0;for(let j=3;j<a.length;j+=4)sum+=a[j];sums.push(sum)}if(!(sums[0]>sums[1]*3&&sums[1]>0))return false}return true},keys);
  ok(exports,'七個星座的匯出資料與插畫相同，全亮和淡剪影 SVG 皆能顯示');
  ok(await p.evaluate(()=>imageRegion('Hyi',2)!==imageRegion('Tri',2)&&imageRegion('Hyi',2)===imageRegion('Hyi',2)),'不同星座不共用錯誤遮罩，快取可重用');
  await run(p,"devOpen();devStarOpen('Hor')");
  ok(await p.locator('#dvStarRange').getAttribute('max')==='6'&&await p.locator('#dvStarFig .image-shadow').getAttribute('opacity')==='0.14','預覽依星座星數顯示，未點亮前有淡剪影');
  await p.locator('#dvStarNext').click();await p.waitForFunction(()=>!document.getElementById('dvStarNext').disabled);
  ok(await p.locator('#dvStarFig .image-regional').getAttribute('data-lit')==='1','點亮後可完成新增區域動畫');
  ok(await p.evaluate(()=>[...document.querySelectorAll('#dvStarFig .image-twinkle')].every(s=>s.querySelectorAll('path').length===2&&!s.querySelector('circle')&&s.getAnimations().some(a=>a.animationName==='imageTwinkle'))),'細小四芒星有閃爍動畫');
  await run(p,"closeSheet('devStarSheet');closeSheet('devSheet');openEditor();$('fBody').value='天爐完成';$('fBody').dispatchEvent(new Event('input',{bubbles:true}));$('saveBtn').click()");
  await p.waitForSelector('#conDone.show .cfx-image.full',{timeout:15000});
  ok(await p.locator('#conName').textContent()==='天爐座'&&await p.locator('#cdFig .cstar').count()===3&&await p.locator('#cdFig .cfx-image').getAttribute('data-constellation')==='For','最後一顆完成後顯示新插畫卡片，尚未切換');
  await p.emulateMedia({reducedMotion:'reduce'});ok(await p.evaluate(()=>!document.querySelector('#cdFig .cfx-image').getAnimations({subtree:true}).some(a=>a.playState==='running')),'減少動態效果時停止插畫動畫');
  await p.locator('#cdOk').click();await p.waitForFunction(()=>document.getElementById('conName').textContent==='天貓座');ok(true,'收進圖鑑後才切換下一個星座');
  await p.setViewportSize({width:1440,height:850});
  await p.evaluate(keys=>{const h=document.createElement('div');h.id='decemberGallery';h.style='position:fixed;inset:0;z-index:999999;background:#0c0b22;display:grid;grid-template-columns:repeat(4,1fr);padding:16px;gap:12px;color:#eee';h.innerHTML=keys.map(k=>`<div style="background:#11122e;border:1px solid #343455;border-radius:20px;text-align:center;padding:12px"><h3 style="font-size:22px;margin:0">${CON[k].n}</h3><svg width="100%" viewBox="0 0 380 300">${conSVG(k,380,300,46,CON[k].s.length)}</svg><span>${CON[k].la} · ${CON[k].s.length} 顆星</span></div>`).join('');document.body.append(h)},keys);
  await p.locator('#decemberGallery').screenshot({path:'/tmp/december-gallery.png'});
  ok(!p.errors.length,'十二月插畫實際流程沒有程式錯誤：'+p.errors.join('; '));await p.context().close();
  for(const k of keys){const d=await open({url:'/dist/novaday.html',seed:{...seed,'orbitlog.profile.v1':{onboarded:1,conOrder:[k]},'orbitlog.entries.v1':[]},reducedMotion:'reduce'});ok(await d.locator('#gal .cfx-image').getAttribute('data-constellation')===k&&await d.locator('#gal .image-shadow').getAttribute('opacity')==='0.14'&&!d.errors.length,k+'：單檔版可離線顯示新剪影');await d.context().close()}
};
