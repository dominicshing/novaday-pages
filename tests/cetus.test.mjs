// 鯨魚座：實際渲染後，星點／星線須留在剪影內，縮放與點亮進度不造成偏移。
export default async ({ ok, open }) => {
  const page = await open();
  const results = await page.evaluate(() => {
    const sizes = [[380,300,46],[110,86,12],[160,120,12],[300,220,30],[380,300,30],[84,52,9]];
    const canvas = document.createElement('canvas').getContext('2d');
    const shape = new Path2D(CFX.Cet.body);
    const host = document.createElement('div');
    document.body.appendChild(host);
    const checks = sizes.map(([w,h,pad]) => {
      const points = conProj('Cet',w,h,pad);
      let contained = true, fits = true, eyes = true, fixed = true;
      const transforms = [];
      for (const lit of [0,5,10]) {
        host.innerHTML = `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${conSVG('Cet',w,h,pad,lit,null)}</svg>`;
        const figure = host.querySelector('.cfx');
        const matrix = figure.transform.baseVal.consolidate().matrix;
        const inv = matrix.inverse();
        transforms.push(figure.getAttribute('transform'));
        const inside = ([x,y]) => { const p = new DOMPoint(x,y).matrixTransform(inv); return canvas.isPointInPath(shape,p.x,p.y); };
        contained &&= points.every(inside);
        for (const line of CON.Cet.l) for (let j=1;j<line.length;j++) {
          const a=points[line[j-1]],b=points[line[j]];
          for(let t=0;t<=20;t++) contained &&= inside([a[0]+(b[0]-a[0])*t/20,a[1]+(b[1]-a[1])*t/20]);
        }
        fits &&= flatPath(CFX.Cet.body).every(([x,y]) => { const p = new DOMPoint(x,y).matrixTransform(matrix); return p.x>=0 && p.x<=w && p.y>=0 && p.y<=h; });
        eyes &&= !!host.querySelector('.cfx-eye') === (lit === 10);
        fixed &&= getComputedStyle(host.querySelector('.cfx-swim')).animationName === 'none';
      }
      return {size:`${w}×${h}（邊距 ${pad}）`,contained,fits,eyes,fixed,stable:new Set(transforms).size===1};
    });
    host.remove();
    return checks;
  });
  for (const r of results) {
    ok(r.contained && r.fits, `${r.size}：星點與連線在鯨魚剪影內，輪廓不裁切`);
    ok(r.eyes && r.fixed && r.stable, `${r.size}：點亮進度不移位，完成才點睛，輪廓不游離星線`);
  }
  ok(!page.errors.length, '鯨魚座渲染沒有程式錯誤：'+page.errors.join('; '));
  await page.context().close();
};
