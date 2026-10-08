// 獨立預覽：遮罩沿主星逐區增加、完整揭露、操作及減少動態效果。
export default async ({ok,open})=>{
  const page=await open({url:'/preview/lynx/reveal/index.html',viewport:{width:390,height:844}});
  const initial=await page.evaluate(()=>JSON.stringify(localStorage));
  const sample=()=>page.evaluate(async()=>Promise.all([...document.querySelectorAll('.region-mask')].map(async el=>{const img=new Image();img.src=el.getAttribute('href');await img.decode();const c=document.createElement('canvas');c.width=380;c.height=300;const ctx=c.getContext('2d');ctx.drawImage(img,0,0);const d=ctx.getImageData(0,0,380,300).data;let total=0;for(let i=3;i<d.length;i+=4)total+=d[i];return {total,foot:d[(254*380+75)*4+3],head:d[(46*380+305)*4+3],src:img.src}})));
  let values=await sample();ok(values.every(x=>x.total===0),'0 顆星：身體完全隱藏');
  let prev=values.map(x=>x.total),monotonic=true;
  for(let n=1;n<=6;n++){await page.locator(`[data-count="${n}"]`).click();values=await sample();monotonic&&=values.every((x,i)=>x.total>prev[i]);prev=values.map(x=>x.total);
    ok(await page.locator('.main-star:not(.dim)').count()===n*2,`${n} 顆星：兩個方案的主星同步點亮`);
    if(n===2)ok(values.every(x=>x.foot>200&&x.head===0),'2 顆星：腳邊已揭露，頭部仍隱藏');
    if(n===3)ok(values[0].src!==values[1].src,'A 與 B 使用不同柔邊，能比較兩種效果');
  }
  ok(monotonic,'每次點亮只增加揭露範圍');
  ok(values.every(x=>x.total===380*300*255),'6 顆星：整張剪影完整揭露');
  ok(await page.locator('#next').isDisabled(),'完成後下一顆按鈕停用');
  await page.clock.install();await page.clock.pauseAt(new Date());
  await page.locator('#reset').click();await page.locator('#next').click();await page.clock.runFor(450);const during=await sample();await page.clock.runFor(1300);const after=await sample();
  ok(after.every((x,i)=>x.total>during[i].total),'下一顆：光從主星附近逐漸擴散，不是整張圖片淡入');
  await page.locator('#play').click();ok(await page.locator('#play').getAttribute('aria-pressed')==='true','可自動播放');await page.locator('#play').click();ok(await page.locator('#play').getAttribute('aria-pressed')==='false','可暫停自動播放');
  await page.emulateMedia({reducedMotion:'reduce'});await page.locator('#reset').click();await page.locator('#next').click();
  values=await sample();ok(values.every(x=>x.total>0)&&await page.evaluate(()=>document.getAnimations().every(a=>a.playState!=='running')),'減少動態效果：直接揭露，停止閃爍及呼吸');
  await page.locator('[data-choice="B"]').click();ok(await page.locator('[data-choice="B"]').getAttribute('aria-pressed')==='true'&&(await page.locator('#choice').textContent()).includes('方案 B'),'可標記偏好方案');
  ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'390px 手機不橫向溢出');
  ok(await page.evaluate(()=>JSON.stringify(localStorage))===initial,'預覽操作不更改日記或個人設定');
  ok(!page.errors.length,'預覽無程式錯誤：'+page.errors.join('; '));await page.context().close();
};
