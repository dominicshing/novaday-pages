/* 獨立預覽：共用正式版素材與星座座標，不讀寫日記及個人設定。 */
let FIGN=0,reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
// 此獨立預覽只載入天貓座素材，提供共用投影所需的插畫查詢。
function constellationArt(k){return k==='Lyn'?LYNX_ART:null}
const W=380,H=300,N=W*H,points=conProj('Lyn',W,H,46),order=conOrd('Lyn');
const media=matchMedia('(prefers-reduced-motion: reduce)');
const distances=points.map(([sx,sy])=>Float32Array.from({length:N},(_,i)=>Math.hypot(i%W-sx,Math.floor(i/W)-sy)));
const smooth=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x)};
const modes=[{id:'soft',feather:24},{id:'defined',feather:4}];
let count=0,raf=0,timer=0,playing=false,lastFrame=0;
const stageText=['淡淡剪影已浮現，點亮第一顆星來喚醒腳邊的星塵。','第一顆星亮起，腳邊浮現。','第二顆星亮起，後腿逐漸成形。','第三顆星亮起，身體與尾巴浮現。','第四顆星亮起，前胸與前腳成形。','第五顆星亮起，臉部逐漸清晰。','六顆星全部點亮，完整的天貓座醒來。'];

function coverage(n,feather){const out=new Uint8ClampedArray(N);if(n===6){out.fill(255);return out}if(!n)return out;
  for(let p=0;p<N;p++){let lit=Infinity,dark=Infinity;order.forEach((si,j)=>{if(j<n)lit=Math.min(lit,distances[si][p]);else dark=Math.min(dark,distances[si][p])});out[p]=255*smooth((dark-lit+feather)/(2*feather))}return out}
function starMarkup(){const lines=CON.Lyn.l.flatMap(path=>path.slice(1).map((b,i)=>{const a=path[i];return `<line class="star-line dim" data-a="${a}" data-b="${b}" x1="${points[a][0]}" y1="${points[a][1]}" x2="${points[b][0]}" y2="${points[b][1]}"/>`})).join('');
  return lines+points.map(([x,y],i)=>`<path class="main-star dim" data-star="${i}" d="${sp4(x,y,4.5)}"/>`).join('')}
function setup(mode){mode.frames=Array.from({length:7},(_,n)=>coverage(n,mode.feather));mode.current=mode.frames[0].slice();mode.canvas=document.createElement('canvas');mode.canvas.width=W;mode.canvas.height=H;mode.ctx=mode.canvas.getContext('2d');mode.pixels=mode.ctx.createImageData(W,H);for(let i=0;i<N;i++){mode.pixels.data[i*4]=255;mode.pixels.data[i*4+1]=255;mode.pixels.data[i*4+2]=255}
  document.getElementById(mode.id).innerHTML=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="天貓座，已點亮 0 顆星"><defs><mask id="region-${mode.id}" maskUnits="userSpaceOnUse" x="0" y="0" width="380" height="300" style="mask-type:alpha"><image class="region-mask" width="380" height="300"/></mask></defs><image class="unlit-silhouette" href="${LYNX_ART}" width="380" height="300" preserveAspectRatio="xMidYMid meet"/><g mask="url(#region-${mode.id})">${lynxFig(W,H,1)}</g><g class="constellation">${starMarkup()}</g></svg>`;
  mode.svg=document.querySelector(`#${mode.id} svg`);mode.image=mode.svg.querySelector('.region-mask');paint(mode,mode.current)}
function paint(mode,values){mode.current=values;for(let i=0;i<N;i++)mode.pixels.data[i*4+3]=values[i];mode.ctx.putImageData(mode.pixels,0,0);mode.image.setAttribute('href',mode.canvas.toDataURL());}
function stopAnimation(){cancelAnimationFrame(raf);raf=0}
function updateControls(){document.getElementById('progress').value=count;document.getElementById('count').value=`${count} / 6`;document.getElementById('status').textContent=stageText[count];document.getElementById('next').disabled=count===6;
  document.querySelectorAll('.steps button').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.count===count)));
  const lit=new Set(order.slice(0,count));for(const mode of modes){mode.svg.setAttribute('aria-label',`天貓座，已點亮 ${count} 顆星`);mode.svg.dataset.count=count;mode.svg.querySelector('.cfx-lynx').classList.toggle('full',count===6);mode.svg.querySelectorAll('.main-star').forEach(s=>s.classList.toggle('dim',!lit.has(+s.dataset.star)));mode.svg.querySelectorAll('.star-line').forEach(l=>l.classList.toggle('dim',!lit.has(+l.dataset.a)||!lit.has(+l.dataset.b)));document.querySelector(`[data-mode="${mode.id}"] .number`).textContent=`${count} / 6 顆星`}}
function setCount(n,animate=false){stopAnimation();const previous=count;count=Math.max(0,Math.min(6,n));updateControls();
  if(!animate||reduce||count!==previous+1){modes.forEach(m=>paint(m,m.frames[count].slice()));return}
  const from=modes.map(m=>m.current.slice()),distance=distances[order[count-1]],start=performance.now();let farthest=1;
  modes.forEach((m,j)=>{for(let p=0;p<N;p++)if(m.frames[count][p]>from[j][p])farthest=Math.max(farthest,distance[p])});
  lastFrame=0;const frame=now=>{const t=Math.min(1,(now-start)/1250);if(now-lastFrame<32&&t<1){raf=requestAnimationFrame(frame);return}lastFrame=now;
    modes.forEach((m,j)=>{if(t===1){paint(m,m.frames[count].slice());return}const next=new Uint8ClampedArray(N),edge=m.id==='soft'?22:10,radius=-edge+(farthest+2*edge)*smooth(t);for(let p=0;p<N;p++){const mix=smooth((radius-distance[p]+edge)/(2*edge));next[p]=from[j][p]+(m.frames[count][p]-from[j][p])*mix}paint(m,next)});
    if(t<1)raf=requestAnimationFrame(frame);else raf=0};raf=requestAnimationFrame(frame)}
function stopPlayback(){clearTimeout(timer);timer=0;playing=false;document.getElementById('play').textContent='自動播放';document.getElementById('play').setAttribute('aria-pressed','false')}
function advance(){if(count===6){stopPlayback();return}setCount(count+1,true);timer=setTimeout(()=>{if(playing)advance()},2200)}
modes.forEach(setup);
document.querySelector('.steps').innerHTML=Array.from({length:7},(_,n)=>`<button data-count="${n}" aria-label="顯示 ${n} 顆星的進度" aria-pressed="${n===0}">${n}</button>`).join('');
document.querySelector('.steps').addEventListener('click',e=>{const b=e.target.closest('button');if(b){stopPlayback();setCount(+b.dataset.count)}});
document.getElementById('progress').addEventListener('input',e=>{stopPlayback();setCount(+e.target.value)});
document.getElementById('next').onclick=()=>{stopPlayback();setCount(count+1,true)};
document.getElementById('reset').onclick=()=>{stopPlayback();setCount(0)};
document.getElementById('play').onclick=()=>{if(playing){stopPlayback();return}if(count===6)setCount(0);playing=true;document.getElementById('play').textContent='暫停播放';document.getElementById('play').setAttribute('aria-pressed','true');advance()};
document.querySelectorAll('.choose').forEach(b=>b.onclick=()=>{document.querySelectorAll('.choose').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));document.getElementById('choice').textContent=`你選擇了方案 ${b.dataset.choice}，請回到對話告訴我，我會再套用到正式版。`});
media.addEventListener('change',e=>{reduce=e.matches;if(reduce){stopPlayback();setCount(count)}});
document.addEventListener('visibilitychange',()=>{document.body.classList.toggle('paused',document.hidden);if(document.hidden){stopPlayback();setCount(count)}});
updateControls();
