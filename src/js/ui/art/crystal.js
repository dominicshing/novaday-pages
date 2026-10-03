/* 程式繪製：水晶徽章 */
const CR_CAT={s14:'streak',s30:'streak',m20:'streak',c30:'write',c100:'write',w5k:'write',long:'write',photo20:'explore',loc10:'explore',tag5:'explore',signal10:'explore',night:'explore',early:'explore',con3:'cons',con10:'cons',first:'write',s3:'streak',s7:'streak',c10:'write',photo:'explore',loc:'explore',words:'write',signal:'explore',all:'mood',s60:'streak',mfull:'streak',back:'streak',c365:'write',w50k:'write',long1k:'write',multi:'write',photo4:'explore',fav5:'explore',season4:'explore',happy3:'mood',bright10:'mood',calm10:'mood',low5:'mood',rebound:'mood',rev1:'time',rev10:'time',rev30:'time',anniv:'time',j100:'time',j365:'time',con44:'cons',zod12:'cons',con88:'cons',s100:'streak',w20k:'write',zod1:'cons',con20:'cons',con1:'cons',con5:'cons'};
const CR_COL={streak:['#FF9A5C','#FFD9BD','#9C3A16'],write:['#9D8CFF','#E4DEFF','#4331A8'],explore:['#4FD9CB','#D4FFF9','#16736B'],cons:['#FFC23D','#FFF1C2','#A8640A'],mood:['#FF8FD0','#FFE3F4','#9C2E6E'],time:['#6FA8FF','#DDEBFF','#1F4E9C']};
const CR_R=44,CR_r=21;
const crPt=(a,r)=>[Math.cos(a)*r,Math.sin(a)*r];
const CR_STAR=(()=>{let d='';for(let k=0;k<16;k++){const a=-Math.PI/2+k*Math.PI/8,[x,y]=crPt(a,k%2?CR_r:CR_R);d+=(k?'L':'M')+x.toFixed(2)+' '+y.toFixed(2)}return d+'Z'})();
(()=>{let d=`<linearGradient id="crHolo" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FF9AD5"/><stop offset=".22" stop-color="#FFE29A"/><stop offset=".45" stop-color="#9AFFD6"/><stop offset=".68" stop-color="#9AD0FF"/><stop offset=".86" stop-color="#C89AFF"/><stop offset="1" stop-color="#FF9AD5"/>
    <animateTransform attributeName="gradientTransform" type="rotate" values="0 .5 .5;360 .5 .5" dur="8s" repeatCount="indefinite"/></linearGradient>
  <linearGradient id="crDark" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2B3278"/><stop offset="1" stop-color="#10133F"/></linearGradient>
  <radialGradient id="crTableG" cx=".4" cy=".3"><stop offset="0" stop-color="#fff" stop-opacity=".75"/><stop offset="1" stop-color="#fff" stop-opacity=".08"/></radialGradient>
  <clipPath id="crClip"><path d="${CR_STAR}"/></clipPath>
  <filter id="crBlur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3"/></filter>`;
  Object.entries(CR_COL).forEach(([k,[c,hi,lo]])=>{d+=`<radialGradient id="crT_${k}" cx=".45" cy=".4" r=".65"><stop offset="0" stop-color="${hi}" stop-opacity=".25"/><stop offset=".55" stop-color="${c}" stop-opacity=".62"/><stop offset="1" stop-color="${lo}" stop-opacity=".9"/></radialGradient>
    <radialGradient id="crA_${k}"><stop offset=".35" stop-color="${c}" stop-opacity=".55"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient>`});
  document.body.insertAdjacentHTML('afterbegin',`<svg id="crDefs" width="0" height="0" style="position:absolute;width:0;height:0" aria-hidden="true" focusable="false"><defs>${d}</defs></svg>`);if(reduce)try{document.getElementById('fabSvg')?.pauseAnimations();document.getElementById('crDefs').pauseAnimations()}catch(_){}})();
/* 平面全息水晶徽章（八角星形、內部彩虹全息光、分類顏色、光澤） */
function crystal(id,on,p){const cat=CR_CAT[id]||'write',[c,hi,lo]=CR_COL[cat],pp=on?100:Math.max(0,Math.min(99,p||0));
  return `<span class="cr fc${on?' on':''}" style="--c:${c};--hi:${hi};--lo:${lo};--p:${pp}">${on?'<i class="fc-aura"></i>':''}<i class="fc-gem">${!on&&pp>0?'<i class="fc-liq"></i>':''}</i><i class="fc-in"></i><i class="fc-sh"></i>
    <span class="cr-ic">${achIc(id)}</span>${on?'<i class="fc-spk a"></i><i class="fc-spk b"></i><i class="fc-spk c"></i>':'<i class="fc-spk d"></i>'}</span>`}
