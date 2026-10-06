// Extra preview effects animate light and particles; the kitten image never moves.
const KittenMagic=(()=>{
  const NS='http://www.w3.org/2000/svg';let svg,ambient,sheen,overlay,cleanup=null,revision=0;
  const node=(tag,attrs={})=>{const el=document.createElementNS(NS,tag);Object.entries(attrs).forEach(([k,v])=>el.setAttribute(k,String(v)));return el};
  function init(root){
    svg=root;const defs=node('defs');defs.innerHTML=`<clipPath id="magicSceneClip"><rect width="380" height="300"/></clipPath><mask id="magicBodyMask" maskUnits="userSpaceOnUse" x="0" y="0" width="380" height="300" style="mask-type:alpha"><use href="#kittenImage"/></mask><linearGradient id="magicSweep"><stop stop-color="#BFFFEF" stop-opacity="0"/><stop offset=".34" stop-color="#BFFFEF" stop-opacity=".15"/><stop offset=".52" stop-color="#F3FFF6" stop-opacity=".88"/><stop offset=".7" stop-color="#FFE7A3" stop-opacity=".28"/><stop offset="1" stop-color="#BFFFEF" stop-opacity="0"/></linearGradient><radialGradient id="magicBloom"><stop stop-color="#BFFFEF" stop-opacity=".48"/><stop offset=".36" stop-color="#9C83FF" stop-opacity=".32"/><stop offset="1" stop-color="#9C83FF" stop-opacity="0"/></radialGradient><filter id="magicSoftGlow" x="-70%" y="-70%" width="240%" height="240%"><feGaussianBlur stdDeviation="1.1"/><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter>`;svg.prepend(defs);
    ambient=node('g',{id:'magicAmbient','aria-hidden':'true'});svg.insertBefore(ambient,document.getElementById('fadeArt'));
    sheen=node('g',{id:'magicSheen','mask':'url(#magicBodyMask)','aria-hidden':'true'});svg.insertBefore(sheen,document.getElementById('fadeStars'));
    overlay=node('g',{id:'magicOverlay','clip-path':'url(#magicSceneClip)','aria-hidden':'true'});svg.append(overlay);
  }
  function clear(){revision++;clearTimeout(cleanup);cleanup=null;for(const layer of [ambient,sheen,overlay])layer?.replaceChildren()}
  function ring(x,y,color,delay=0,large=false){const el=node('circle',{cx:x,cy:y,r:large?44:29,fill:'none',stroke:color,'stroke-width':large?1.2:1.7,class:'magic-ring'});el.style.animationDelay=delay+'s';overlay.append(el)}
  function particles(n,P,rng,color){
    const count=n===6?38:22;
    for(let j=0;j<count;j++){
      const base=P[(j%3===0)?Math.floor(rng()*n):n-1];const x=base[0]+(rng()-.5)*64,y=base[1]+(rng()-.5)*48,a=rng()*Math.PI*2,d=42+rng()*64;
      const el=node('g',{class:'magic-gather',style:`--sx:${Math.cos(a)*d}px;--sy:${Math.sin(a)*d}px;--delay:${(j*.013).toFixed(3)}s`});
      const c=j%5===0?'#FFE7A3':j%2===0?'#BFFFEF':color;
      el.append(j%4===0?node('path',{d:sp4(x,y,.7+rng()*.75),fill:c}):node('circle',{cx:x,cy:y,r:.4+rng()*.55,fill:c}));overlay.append(el);
    }
  }
  function energy(n,P,color){if(n<2)return;const A=P[n-2],B=P[n-1],d=`M${A[0]} ${A[1]} L${B[0]} ${B[1]}`;
    overlay.append(node('path',{d,pathLength:1,fill:'none',stroke:color,'stroke-width':4,'stroke-linecap':'round',class:'magic-energy glow','filter':'url(#magicSoftGlow)'}));
    overlay.append(node('path',{d,pathLength:1,fill:'none',stroke:'#F2FFF7','stroke-width':1.3,'stroke-linecap':'round',class:'magic-energy'}));
    const orb=node('g',{class:'magic-orb'});orb.append(node('circle',{r:6,fill:color,opacity:.22}),node('circle',{r:2.1,fill:'#FFFBEA'}));const move=node('animateMotion',{path:d,dur:'.85s',begin:'indefinite',fill:'freeze'});orb.append(move);overlay.append(orb);move.beginElement?.();
  }
  function completion(P,rng){
    ambient.append(node('ellipse',{cx:206,cy:154,rx:168,ry:116,fill:'url(#magicBloom)',class:'magic-bloom'}));
    const band=node('g',{class:'magic-sweep'});band.append(node('rect',{x:-130,y:-100,width:105,height:520,fill:'url(#magicSweep)',transform:'rotate(-18 190 150)'}));sheen.append(band);
    P.forEach(([x,y],j)=>ring(x,y,j%2?'#FFE7A3':'#BFFFEF',.6+j*.075,true));
    const anchors=[[48,188],[89,106],[158,99],[216,228],[260,35],[339,71],[345,158],[150,258],[70,267],[308,225]];
    anchors.forEach(([x,y],j)=>{const el=node('g',{class:'magic-finale-star',style:`--delay:${(.9+j*.07).toFixed(2)}s`});el.append(node('path',{d:sp4(x+(rng()-.5)*8,y+(rng()-.5)*8,1.3+rng()*1.65),fill:j%3===0?'#FFE7A3':'#BFFFEF',filter:'url(#magicSoftGlow)'}));overlay.append(el)});
  }
  function play(n,{complete=false,mood=2}={}){clear();if(!svg||reduce||document.hidden||n<1)return;const run=revision,P=conProj('Lyn',380,300,46),color=`var(${MOODS[mood].c})`,rng=seedRng('kitten-magic-'+n);
    energy(n,P,color);particles(n,P,rng,color);ring(...P[n-1],color);ring(...P[n-1],'#FFE7A3',.13);
    if(complete)completion(P,rng);
    cleanup=setTimeout(()=>{if(run===revision)clear()},complete?3700:1800);
  }
  return{init,play,clear};
})();
