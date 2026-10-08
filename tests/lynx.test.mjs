// 天貓座：實際寫完第六則、固定圖案對位、呼吸的明暗差、分享與減少動態效果。
export default async ({ok,open,run})=>{
  const seed={'orbitlog.profile.v1':{onboarded:1,conOrder:['Lyn']},'orbitlog.seeded.v1':'1','orbitlog.entries.v1':Array.from({length:5},(_,i)=>({id:'kitten-'+i,date:'2026-01-0'+(i+1),time:'10:00',title:'小星星 '+i,body:'今天的紀錄',mood:i,tags:[]}))};
  const page=await open({seed});
  ok(await page.locator('#gal .cfx-lynx').getAttribute('data-progress')==='0.8333333333333334','五顆星：圓潤幼貓已顯現 5/6');
  ok(await page.evaluate(()=>{const stars=[...document.querySelectorAll('#gal .lynx-twinkle')];return stars.length>0&&stars.every(s=>s.querySelectorAll('path').length===2&&!s.querySelector('circle'))}),'閃爍星點及外圍微光都是四芒星，沒有圓點或圓形光暈');
  ok(await page.evaluate(()=>{const stars=[...document.querySelectorAll('#gal .lynx-twinkle')];return stars.length>10&&stars.length<=24&&stars.every(s=>s.getAnimations().some(a=>a.animationName==='lynxTwinkle'))&&new Set(stars.map(s=>s.style.getPropertyValue('--twinkle-delay'))).size>10}),'細小星塵以不同節奏閃爍，進行中也可顯示');
  ok(await page.evaluate(()=>{const s=document.querySelector('#gal .lynx-twinkle'),a=s.getAnimations()[0];const t=a.currentTime,d=a.effect.getTiming().delay+2*a.effect.getTiming().duration;a.pause();a.currentTime=d;const low=+getComputedStyle(s).opacity;a.currentTime=d+a.effect.getTiming().duration*.45;const high=+getComputedStyle(s).opacity;a.currentTime=t;a.play();return high-low>.5}),'星塵明暗確實變化');
  const regions=await page.evaluate(()=>{const frames=Array.from({length:7},(_,n)=>lynxRegion(n).values);let monotonic=true;
    for(let n=1;n<7;n++)for(let i=0;i<frames[n].length;i++)if(frames[n][i]<frames[n-1][i])monotonic=false;
    return {empty:frames[0].every(x=>x===0),full:frames[6].every(x=>x===255),foot:frames[2][254*380+75],head:frames[2][46*380+305],monotonic,cache:lynxRegion(2)===lynxRegion(2)};});
  ok(regions.empty&&regions.full&&regions.monotonic&&regions.foot>200&&regions.head===0,'方案 A：0 顆只剩淡剪影，沿主星增加揭露範圍，6 顆完整顯示');
  ok(regions.cache,'區域遮罩快取重用');
  ok(await page.evaluate(()=>{const s=document.querySelector('#gal .lynx-shadow');return +getComputedStyle(s).opacity===.14&&getComputedStyle(s).filter.includes('brightness')}),'未點亮區域保留 14% 低亮度剪影');
  const wave=await page.evaluate(()=>{const host=document.createElement('div');document.body.append(host);host.innerHTML=`<svg width="380" height="300">${conSVG('Lyn',380,300,46,3,null,{figFrom:2/6})}</svg>`;
    const c=host.querySelector('.lynx-region-wave'),a=c.getAnimations()[0];a.pause();a.currentTime=0;const scale=()=>parseFloat(getComputedStyle(c).r)/+c.getAttribute('r'),first=scale();a.currentTime=900;const middle=scale();a.currentTime=1900;const last=scale();
    const P=conProj('Lyn',380,300,46)[conOrd('Lyn')[2]],center=+c.getAttribute('cx')===P[0]&&+c.getAttribute('cy')===P[1];host.remove();return {first,middle,last,center};});
  ok(wave.center&&wave.first===0&&wave.middle>0&&wave.last>wave.middle&&wave.last===1,'新區域從剛點亮的主星向外柔和擴散');
  ok(await page.evaluate(()=>{for(let n=1;n<=6;n++){const a=lynxRegion(n-1).values,b=lynxRegion(n).values,step=lynxRegionStep(n-1,n),D=lynxDistances()[n-1];for(let i=0;i<a.length;i++)if(b[i]>a[i]&&D[i]>(step.radius*.5)**2)return false}return true}),'擴散結束時所有新增區域都進入不透明核心，不留下半透明尾緣');
  // 比對真正繪出的遮罩，避免數值有變但巢狀 SVG 遮罩沒有重繪的回歸。
  await page.evaluate(()=>{const host=document.createElement('div');host.id='lynxMaskCheck';host.style='position:fixed;left:0;top:0;width:380px;height:300px;background:black;z-index:99999';
    host.innerHTML=`<svg width="380" height="300"><defs>${lynxRegionMask('lynxVisualCheck',3,2,0)}</defs><rect width="380" height="300" fill="white" mask="url(#lynxVisualCheck)"/></svg>`;document.body.append(host);host.querySelector('.lynx-region-wave').getAnimations()[0].pause()});
  const frames=[];for(const ms of [0,450,1900]){await page.evaluate(ms=>document.querySelector('#lynxMaskCheck .lynx-region-wave').getAnimations()[0].currentTime=ms,ms);frames.push(await page.locator('#lynxMaskCheck').screenshot({animations:'allow'}))}
  ok(!frames[0].equals(frames[1])&&!frames[1].equals(frames[2]),'起點、中途與終點的實際遮罩畫面持續改變');
  await page.evaluate(()=>document.getElementById('lynxMaskCheck').remove());
  const sizes=[[380,300,46],[110,86,12],[160,120,12],[300,220,30],[380,300,30],[84,52,9]];
  const results=await page.evaluate(sizes=>{
    const host=document.createElement('div');document.body.append(host);
    const results=sizes.map(([w,h,pad])=>{const transforms=[],hrefs=[],stages=[];let fits=true,aligned=true;
      for(const lit of [0,1,3,5,6]){host.innerHTML=`<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${conSVG('Lyn',w,h,pad,lit,null)}</svg>`;
        const fig=host.querySelector('.cfx-lynx'),m=fig.transform.baseVal.consolidate().matrix;
        transforms.push(fig.getAttribute('transform'));hrefs.push(host.querySelector('.lynx-body image').getAttribute('href'));stages.push(+host.querySelector('.lynx-regional').dataset.lit);
        fits&&=m.e>=0&&m.f>=0&&m.e+380*m.a<=w+.01&&m.f+300*m.d<=h+.01;
        const anchors=conProj('Lyn',380,300,46),points=conProj('Lyn',w,h,pad);
        aligned&&=points.every(([x,y],i)=>Math.hypot(x-(m.e+anchors[i][0]*m.a),y-(m.f+anchors[i][1]*m.d))<.015);
      }
      return {size:`${w}×${h}`,fits,aligned,stable:new Set(transforms).size===1&&new Set(hrefs).size===1,progress:stages.join(',')==='0,1,3,5,6'};
    });host.remove();return results;
  },sizes);
  for(const r of results)ok(r.fits&&r.aligned&&r.stable&&r.progress,`${r.size}：同一圖案逐區揭露，不移位、不裁切，星線對位一致`);
  await run(page,"openEditor();document.getElementById('fBody').value='幼貓醒來了';document.getElementById('fBody').dispatchEvent(new Event('input',{bubbles:true}));document.getElementById('saveBtn').click()");
  await page.waitForSelector('#conDone.show .cfx-lynx.full',{timeout:15000});
  ok(await page.evaluate(()=>consState(entries).done.includes('Lyn')&&entries.length===6),'實際新增第六則：天貓座完成，日記已儲存');
  ok(await page.locator('#cdFig .cstar').count()===6&&await page.locator('#cdFig .lynx-body image').count()===1,'完成畫面保留六顆心情星，只用一張固定幼貓圖');
  ok(await page.locator('#cdFig .lynx-sweep').count()===1&&await page.locator('#cdFig .lynx-glint').count()===2,'完成後先掃光與眼睛閃光');
  const breathing=await page.evaluate(()=>['.lynx-aura','.lynx-body','.lynx-rim'].map(s=>document.querySelector('#cdFig '+s).getAnimations().find(a=>a.effect.getTiming().iterations===Infinity)?.effect.getTiming()));
  ok(breathing.every(t=>t&&t.duration===5000&&t.delay===3400),'完成效果後，三層呼吸光同步每五秒循環');
  await page.waitForTimeout(700);
  const phase=async ms=>page.evaluate(ms=>{for(const a of document.querySelector('#cdFig').getAnimations({subtree:true})){if(a.effect.getTiming().iterations===Infinity&&a.animationName.startsWith('lynxBreath')){a.pause();a.currentTime=ms}}},ms);
  const getState=()=>page.evaluate(()=>{const img=document.querySelector('#cdFig .lynx-body image'),s=document.querySelector('#cdFig');const b=img.getBoundingClientRect(),v=s.getBoundingClientRect();return {box:[b.x-v.x,b.y-v.y,b.width,b.height],filter:getComputedStyle(document.querySelector('#cdFig .lynx-body')).filter,opacity:+getComputedStyle(document.querySelector('#cdFig .lynx-aura')).opacity}});
  await phase(4650);await page.waitForTimeout(50);const high=await getState();
  await phase(7150);await page.waitForTimeout(50);const low=await getState();
  ok(high.opacity>.84&&low.opacity<.03&&high.filter.includes('1.24')&&low.filter.includes('0.78'),'呼吸明暗差清楚：光暈和身體亮度同步變化');
  ok(JSON.stringify(high.box)===JSON.stringify(low.box),'呼吸高低亮度時，幼貓尺寸與位置完全相同');
  await page.locator('#cdOk').click();
  await page.evaluate(()=>{document.querySelectorAll('.celebrate.show,.level-up.show').forEach(e=>e.classList.remove('show'));openCon('Lyn')});
  ok(await page.locator('.cn-fig .cfx-lynx.full').count()===1,'已完成的星座詳情使用新幼貓');
  ok(await page.evaluate(()=>document.querySelector('.cn-fig .lynx-body').getAnimations().some(a=>a.effect.getTiming().iterations===Infinity)),'已完成的星座詳情持續呼吸');
  await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(100);
  ok(await page.evaluate(()=>!document.querySelector('.cn-fig .cfx-lynx').getAnimations({subtree:true}).some(a=>a.playState==='running')),'系統減少動態效果：幼貓保持清晰，不播放呼吸');
  await page.emulateMedia({reducedMotion:'no-preference'});await page.waitForTimeout(100);await page.evaluate(()=>{prof.calm=true;applyCalm()});
  ok(await page.evaluate(()=>!document.querySelector('.cn-fig .cfx-lynx').getAnimations({subtree:true}).some(a=>a.playState==='running')),'App 減少動態效果也停用呼吸');
  ok(await page.evaluate(()=>skyImg('Lyn').startsWith('data:image/svg+xml')),'日記卡片星座背景可產生含幼貓的圖片');
  ok(!page.errors.length,'天貓座實際流程沒有程式錯誤：'+page.errors.join('; '));
  await page.context().close();
};
