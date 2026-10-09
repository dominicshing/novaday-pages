function constellationArt(k){return k==='Lyn'?LYNX_ART:k==='Psc'?PISCES_ART:OCTOBER_ART[k]||NOVEMBER_ART[k]||null}
function imagePrefix(k){return k==='Psc'?'pisces':'image'}
function imageTwinklePoints(k){const rng=seedRng(k+'-dust-positions');return Array.from({length:54},()=>[35+rng()*310,24+rng()*252])}
/* 透明星座插畫共用渲染：以各自主星分區揭露，固定於 380×300 星圖座標。 */
function imageConstellationFig(k,W,H,p=1,aw,from){const prefix=imagePrefix(k),n=++FIGN,q=Math.max(0,Math.min(1,p)),total=CON[k].s.length,lit=Math.round(q*total),prior=from==null?(aw&&q===1?(total-1)/total:q):Math.max(0,Math.min(1,from)),before=Math.round(prior*total),reveal=before<lit&&!reduce,d0=aw?.d0||0,s=Math.min(W/380,H/300),id='image'+k+n,image=id+'Image',alpha=id+'Alpha',region=id+'Region';
  return `<g class="cfx cfx-${prefix}${q===1?' full':''}${reveal?' revealing':''}" data-constellation="${k}" data-progress="${q}" aria-hidden="true" transform="translate(${(W-380*s)/2} ${(H-300*s)/2}) scale(${s})" style="--image-delay:${reveal?d0+1.8:0}s">
    <defs>${imageRegionMask(k,region,lit,reveal?before:lit,d0)}<clipPath id="${id}Clip"><rect width="380" height="300"/></clipPath><mask id="${alpha}" maskUnits="userSpaceOnUse" x="0" y="0" width="380" height="300" style="mask-type:alpha"><use href="#${image}"/></mask></defs>
    <g clip-path="url(#${id}Clip)"><use class="${prefix}-shadow" href="#${image}" opacity="${q===1?0:.14}" style="filter:grayscale(.8) brightness(.65)"/>
    <g class="${prefix}-regional" data-lit="${lit}" mask="url(#${region})"><g class="${prefix}-body"><image id="${image}" href="${constellationArt(k)}" width="380" height="300" preserveAspectRatio="none"/></g>${q?imageTwinkles(k,alpha):''}</g></g></g>`}
const IMAGE_REGION_CACHE=new Map();
function imageCache(k){if(!IMAGE_REGION_CACHE.has(k))IMAGE_REGION_CACHE.set(k,{regions:new Map(),steps:new Map(),distances:null});return IMAGE_REGION_CACHE.get(k)}
function imageDistances(k){const cache=imageCache(k);if(cache.distances)return cache.distances;const P=conProj(k,380,300,46);
  return cache.distances=conOrd(k).map(si=>{const d=new Float32Array(380*300),[sx,sy]=P[si];for(let y=0;y<300;y++)for(let x=0;x<380;x++)d[y*380+x]=(x-sx)**2+(y-sy)**2;return d})}
function imageRegion(k,lit){const cache=imageCache(k),total=CON[k].s.length;lit=Math.max(0,Math.min(total,Math.round(lit)));if(cache.regions.has(lit))return cache.regions.get(lit);
  const values=new Uint8ClampedArray(380*300);
  if(lit===total)values.fill(255);else if(lit){const D=imageDistances(k);for(let i=0;i<values.length;i++){let a=Infinity,b=Infinity;for(let j=0;j<total;j++){const d=D[j][i];if(j<lit)a=Math.min(a,d);else b=Math.min(b,d)}const t=Math.max(0,Math.min(1,(Math.sqrt(b)-Math.sqrt(a)+24)/48));values[i]=255*t*t*(3-2*t)}}
  const out={values,url:lynxMaskURL(values)};cache.regions.set(lit,out);return out}
function imageRegionStep(k,before,lit){const cache=imageCache(k),key=before+'-'+lit;if(cache.steps.has(key))return cache.steps.get(key);
  const a=imageRegion(k,before).values,b=imageRegion(k,lit).values,values=new Uint8ClampedArray(a.length),center=conProj(k,380,300,46)[conOrd(k)[lit-1]],D=imageDistances(k)[lit-1];let radiusSquared=1;
  for(let i=0;i<a.length;i++)if(b[i]>a[i]){values[i]=255*(b[i]-a[i])/(255-a[i]);radiusSquared=Math.max(radiusSquared,D[i])}
  const out={url:lynxMaskURL(values),center,radius:Math.ceil(Math.sqrt(radiusSquared)/.5)+2};cache.steps.set(key,out);return out}
function imageRegionMask(k,id,lit,before,d0){const prefix=imagePrefix(k),frame='maskUnits="userSpaceOnUse" x="0" y="0" width="380" height="300" style="mask-type:alpha"',img=url=>`<image href="${url}" width="380" height="300"/>`;
  if(before>=lit)return `<mask id="${id}" ${frame}>${lit===CON[k].s.length?'<rect width="380" height="300" fill="white"/>':img(imageRegion(k,lit).url)}</mask>`;
  const step=imageRegionStep(k,before,lit),delta=id+'Delta',gradient=id+'Gradient';
  // 以濾鏡裁切新增區域，避免動畫在巢狀遮罩內不重繪。
  return `<radialGradient id="${gradient}"><stop offset=".5" stop-color="white"/><stop offset=".65" stop-color="white" stop-opacity=".84"/><stop offset=".8" stop-color="white" stop-opacity=".38"/><stop offset="1" stop-color="white" stop-opacity="0"/></radialGradient>
    <filter id="${delta}" filterUnits="userSpaceOnUse" x="0" y="0" width="380" height="300"><feImage href="${step.url}" x="0" y="0" width="380" height="300" result="delta"/><feComposite in="SourceGraphic" in2="delta" operator="in"/></filter>
    <mask id="${id}" ${frame}>${img(imageRegion(k,before).url)}<circle class="${prefix}-region-wave" cx="${step.center[0]}" cy="${step.center[1]}" r="${step.radius}" fill="url(#${gradient})" filter="url(#${delta})" style="--region-radius:${step.radius}px;--region-delay:${d0}s"/></mask>`}
function imageTwinkles(k,mask){const prefix=imagePrefix(k),points=k==='Psc'?[[117,56],[128,74],[155,60],[145,89],[120,101],[167,105],[147,122],[103,132],[115,156],[73,206],[49,231],[111,216],[166,211],[211,213],[255,204],[276,218],[295,203],[319,224],[337,240],[301,248],[282,251],[329,265]]:imageTwinklePoints(k),P=conProj(k,380,300,46),rng=seedRng(k+'-twinkles');
  return `<g class="${prefix}-twinkles" mask="url(#${mask})">${points.filter(([x,y])=>P.every(([px,py])=>Math.hypot(x-px,y-py)>8)).map(([x,y],i)=>{const r=.65+rng()*.35;return `<g class="${prefix}-twinkle" opacity=".22" fill="${i%3?'#D5FFF4':'#FFF0D9'}" style="--twinkle-duration:${(2.2+rng()*1.4).toFixed(2)}s;--twinkle-delay:${(-rng()*3.6).toFixed(2)}s"><path d="${sp4(x,y,r*2)}" opacity=".18"/><path d="${sp4(x,y,r*1.3)}"/></g>`}).join('')}</g>`}
