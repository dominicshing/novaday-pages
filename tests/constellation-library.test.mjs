// 全套插畫及各批素材共用驗證。ART_KEYS 可指定本批，ART_REQUIRE_COMPLETE=1 驗證完整 88 座。
import fs from 'node:fs';
export default async ({ok,open,run,ROOT})=>{
  const data=JSON.parse(fs.readFileSync(ROOT+'/assets/data/constellations.json','utf8')).constellations;
  const keys=process.env.ART_KEYS?process.env.ART_KEYS.split(','):Object.keys(data).filter(k=>data[k].figure.style==='image');
  const complete=process.env.ART_REQUIRE_COMPLETE==='1',key=keys.includes('CMi')?'CMi':keys.find(k=>!['Lyn','Psc'].includes(k)),count=data[key].stars.length;
  const seed={'orbitlog.profile.v1':{onboarded:1,devOn:1,conOrder:[key],nextPick:'Lyn'},'orbitlog.seeded.v1':'1','orbitlog.entries.v1':Array.from({length:count-1},(_,i)=>({id:'library-'+i,date:'2026-01-'+String(i+1).padStart(2,'0'),time:'10:00',title:'星河',body:'紀錄',mood:i%5,tags:[]}))};
  const p=await open({seed});
  ok(await p.evaluate(({keys,complete})=>keys.length===(complete?88:keys.length)&&keys.every(k=>!!constellationArt(k)&&CFX[k].art)&&new Set(keys.map(k=>constellationArt(k))).size===keys.length,{keys,complete}),complete?'全部 88 個星座各自有透明插畫':'本批所有星座均使用各自的透明插畫');
  for(const k of keys){
    const r=await p.evaluate(async k=>{
      const n=CON[k].s.length,prefix=k==='Psc'?'pisces':'image',host=document.createElement('div');host.innerHTML=`<svg>${conSVG(k,380,300,46,n)}</svg>`;
      const pic=new Image();pic.src=constellationArt(k);await pic.decode();const c=document.createElement('canvas');c.width=380;c.height=300;const ctx=c.getContext('2d');ctx.drawImage(pic,0,0,380,300);const a=ctx.getImageData(0,0,380,300).data;let clear=0,solid=0;for(let i=3;i<a.length;i+=4){if(!a[i])clear++;if(a[i]>200)solid++}
      let monotonic=true,covered=true;const frames=Array.from({length:n+1},(_,j)=>imageRegion(k,j).values);
      for(let j=1;j<=n;j++){const s=imageRegionStep(k,j-1,j),D=imageDistances(k)[j-1];for(let i=0;i<frames[j].length;i++){if(frames[j][i]<frames[j-1][i])monotonic=false;if(frames[j][i]>frames[j-1][i]&&D[i]>(s.radius*.5)**2)covered=false}}
      const aligned=[[110,86,12],[84,52,9],[300,220,30],[1080,760,120]].every(([W,H,pad])=>{const s=Math.min(W/380,H/300),ref=conProj(k,380,300,46);return conProj(k,W,H,pad).every(([x,y],i)=>Math.hypot(x-((W-380*s)/2+ref[i][0]*s),y-((H-300*s)/2+ref[i][1]*s))<.015)});
      const share=new Image();share.src=svgURL(shareSVG(k));await share.decode();
      const sums=[];for(const state of ['lit','unlit']){const i=new Image();i.src=`assets/svg/constellations/${state}/${k}.svg`;await i.decode();ctx.clearRect(0,0,380,300);ctx.drawImage(i,0,0);const a=ctx.getImageData(0,0,380,300).data;let sum=0;for(let j=3;j<a.length;j+=4)sum+=a[j];sums.push(sum)}
      const result={name:CON[k].n,stars:host.querySelectorAll('.cstar').length===n,alpha:clear>380*300*.05&&solid>380*300*.01,reveal:monotonic&&covered&&frames[0].every(v=>v===0)&&frames[n].every(v=>v===255),aligned,share:share.naturalWidth===1080,exports:sums[0]>sums[1]*3&&sums[1]>0};IMAGE_REGION_CACHE.delete(k);return result;
    },k);
    ok(r.stars&&r.alpha,r.name+'：透明星圖與主星數正確');ok(r.reveal&&r.aligned,r.name+'：逐區揭露完整且跨尺寸對位');ok(r.share&&r.exports,r.name+'：分享、全亮及淡剪影素材可解碼');
  }
  ok(await p.evaluate(async keys=>{const d=await(await fetch('assets/data/constellations.json')).json();return keys.every(k=>d.constellations[k].figure.image_data_url===constellationArt(k))},keys),'匯出 metadata 與 App 的插畫一致');
  await run(p,`devOpen();devStarOpen('${key}')`);ok(await p.locator('#dvStarFig .image-shadow').getAttribute('opacity')==='0.14','未點亮的预覽保留淡剪影');
  await p.locator('#dvStarNext').click();await p.waitForFunction(()=>!document.getElementById('dvStarNext').disabled);
  ok(await p.evaluate(()=>{const stars=[...document.querySelectorAll('#dvStarFig .image-twinkle')];return stars.length>0&&stars.every(s=>s.querySelectorAll('path').length===2&&!s.querySelector('circle')&&s.getAnimations().some(a=>a.animationName==='imageTwinkle'))}),'新增星點揭露完成，四芒微星有閃爍動畫');
  await run(p,"closeSheet('devStarSheet');closeSheet('devSheet');openEditor();$('fBody').value='星座完成';$('fBody').dispatchEvent(new Event('input',{bubbles:true}));$('saveBtn').click()");await p.waitForSelector('#conDone.show .cfx-image.full',{timeout:15000});
  ok(await p.locator('#conName').textContent()===data[key].name_zh&&await p.locator('#cdFig .cstar').count()===count,'最後一顆完成後先顯示完整卡片，首頁保留原星座');
  await p.emulateMedia({reducedMotion:'reduce'});ok(await p.evaluate(()=>!document.querySelector('#cdFig .cfx-image').getAnimations({subtree:true}).some(a=>a.playState==='running')),'減少動態效果時保持靜態插畫');
  await p.locator('#cdOk').click();await p.waitForFunction(()=>document.getElementById('conName').textContent==='天貓座');ok(true,'收進圖鑑後才切換下一個星座');
  await p.setViewportSize({width:1440,height:1120});
  for(let offset=0;offset<keys.length;offset+=12){const group=keys.slice(offset,offset+12);await p.evaluate(keys=>{document.getElementById('libraryGallery')?.remove();const h=document.createElement('div');h.id='libraryGallery';h.style='position:fixed;inset:0;z-index:999999;background:#0c0b22;display:grid;grid-template-columns:repeat(4,1fr);grid-auto-rows:350px;padding:16px;gap:12px;color:#eee';h.innerHTML=keys.map(k=>`<div style="background:#11122e;border:1px solid #343455;border-radius:20px;text-align:center;padding:10px"><h3 style="font-size:22px;margin:0">${CON[k].n}</h3><svg width="100%" viewBox="0 0 380 300">${conSVG(k,380,300,46,CON[k].s.length)}</svg><span>${CON[k].la} · ${CON[k].s.length} 顆星</span></div>`).join('');document.body.append(h)},group);await p.locator('#libraryGallery').screenshot({path:`/tmp/library-${group[0]}.png`})}
  ok(!p.errors.length,'星座庫流程沒有程式錯誤：'+p.errors.join('; '));await p.context().close();
  const d=await open({url:'/dist/novaday.html',seed:{...seed,'orbitlog.profile.v1':{onboarded:1,devOn:1,conOrder:[key]},'orbitlog.entries.v1':[]},reducedMotion:'reduce'});
  ok(await d.locator('#gal .cfx-image').getAttribute('data-constellation')===key&&await d.locator('#gal .image-shadow').getAttribute('opacity')==='0.14'&&!d.errors.length,'單檔版離線插畫與淡剪影正常');await d.context().close();
};
