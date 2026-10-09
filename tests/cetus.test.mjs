// 鯨魚改用透明插畫後，仍以同一座標框對齊主星，進度與呼吸不造成位移。
export default async ({ok,open})=>{
  const page=await open();
  const results=await page.evaluate(()=>{
    const sizes=[[380,300,46],[110,86,12],[160,120,12],[300,220,30],[380,300,30],[84,52,9]];
    const host=document.createElement('div');document.body.appendChild(host);
    const reference=conProj('Cet',380,300,46);
    const checks=sizes.map(([w,h,pad])=>{
      const points=conProj('Cet',w,h,pad),scale=Math.min(w/380,h/300),dx=(w-380*scale)/2,dy=(h-300*scale)/2;
      let fits=true,fixed=true,progress=true;const transforms=[];
      for(const lit of [0,5,10]){
        host.innerHTML=`<svg width="${w}" height="${h}">${conSVG('Cet',w,h,pad,lit,null)}</svg>`;
        const figure=host.querySelector('.cfx-image'),body=figure.querySelector('.image-body');
        const matrix=figure.transform.baseVal.consolidate().matrix;transforms.push(figure.getAttribute('transform'));
        fits&&=[[0,0],[380,300]].every(([x,y])=>{const p=new DOMPoint(x,y).matrixTransform(matrix);return p.x>=-.01&&p.x<=w+.01&&p.y>=-.01&&p.y<=h+.01});
        fixed&&=getComputedStyle(body).transform==='none'&&!figure.querySelector('.cfx-swim');
        progress&&=figure.querySelector('.image-regional').dataset.lit===String(lit)&&host.querySelectorAll('.cstar').length===lit&&figure.querySelector('.image-shadow').getAttribute('opacity')===(lit===10?'0':'0.14');
      }
      return{size:`${w}×${h}（邊距 ${pad}）`,fits,fixed,progress,stable:new Set(transforms).size===1,aligned:points.every(([x,y],i)=>Math.hypot(x-(dx+reference[i][0]*scale),y-(dy+reference[i][1]*scale))<.015)};
    });host.remove();return checks;
  });
  for(const r of results){ok(r.fits&&r.aligned,r.size+'：插畫完整留在畫框內，主星依同一比例縮放');ok(r.fixed&&r.progress&&r.stable,r.size+'：淡剪影、部分點亮與全亮均不移位')}
  ok(!page.errors.length,'鯨魚座渲染沒有程式錯誤：'+page.errors.join('; '));await page.context().close();
};
