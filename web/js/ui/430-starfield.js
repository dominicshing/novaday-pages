/* ---------- Starfield ---------- */
(function sky(){const cv=$('sky'),ctx=cv.getContext('2d'),app=$('app');let W=0,H=0,stars=[],shoot=null,rgb='232,233,255',px=0,py=0,last=0,nextShoot=3000,running=false;
  const readColor=()=>{rgb=getComputedStyle(document.documentElement).getPropertyValue('--star').trim()||rgb};
  function size(){const dpr=Math.min(2,window.devicePixelRatio||1);W=app.clientWidth;H=app.clientHeight;cv.width=W*dpr;cv.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);
    stars=Array.from({length:Math.round(W*H/4200)},()=>({x:Math.random()*W,y:Math.random()*H,z:Math.random()*.9+.1,tw:Math.random()*6.28}));if(reduce)draw(0)}
  function draw(t){const dt=Math.min(50,t-last||16);last=t;ctx.clearRect(0,0,W,H);
    for(const s of stars){if(!reduce){s.y+=s.z*dt*.012;if(s.y>H+2){s.y=-2;s.x=Math.random()*W}s.tw+=dt*.002*s.z}
      const a=reduce?.5*s.z+.2:(.35+.45*Math.abs(Math.sin(s.tw)))*s.z+.1;ctx.fillStyle=`rgba(${rgb},${a.toFixed(3)})`;
      ctx.beginPath();ctx.arc(s.x+px*s.z*14,s.y+py*s.z*14,s.z*1.4,0,6.283);ctx.fill()}
    if(!reduce){nextShoot-=dt;if(!shoot&&nextShoot<=0){shoot={x:Math.random()*W*.7+W*.25,y:Math.random()*H*.3,l:0};nextShoot=5000+Math.random()*6000}
      if(shoot){shoot.l+=dt;const p=shoot.l/900,x=shoot.x-p*220,y=shoot.y+p*120,gr=ctx.createLinearGradient(x,y,x+80,y-44);
        gr.addColorStop(0,`rgba(${rgb},${(.9*(1-p)).toFixed(2)})`);gr.addColorStop(1,`rgba(${rgb},0)`);ctx.strokeStyle=gr;ctx.lineWidth=1.6;
        ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+80,y-44);ctx.stroke();if(p>=1)shoot=null}
      if(!document.hidden)requestAnimationFrame(draw);else running=false}}
  const start=()=>{if(!reduce&&!running){running=true;requestAnimationFrame(draw)}};
  skyApi={start:()=>{running=false;start()},still:()=>{running=false;draw(0)}};
  new ResizeObserver(size).observe(app);
  addEventListener('pointermove',e=>{const r=app.getBoundingClientRect();px=(e.clientX-r.left)/r.width-.5;py=(e.clientY-r.top)/r.height-.5},{passive:true});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)start()});
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change',readColor);
  new MutationObserver(readColor).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
  readColor();size();if(reduce)draw(0);else start()})();

