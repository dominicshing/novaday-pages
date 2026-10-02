/* 程式繪製：心情星星（月相表情） */
/* 自繪月相圖示（不依賴系統 emoji，各平台外觀一致）：亮面比例＝等級/4，亮面顏色＝該心情色 */
/* 心情圖示：星光表情星星（R23）。星星越開心越大、越亮，表情和動作表達心情；顏色沿用心情色 */
let MSTN=0;
const NV_HI=['#B9B0F0','#AFC8FF','#C5FFF7','#FFFBEA','#FFF3C4'],NV_LO=['#5A4FA8','#3D69C4','#35AFA3','#F3C66A','#F29E1A'];
const NV_SC=[.82,.88,.95,1.02,1.1],NV_RL=[14,17,20,23,28];
function nvStar(r,k){const q=r*k;return `M0,${-r} Q${q},${-q} ${r},0 Q${q},${q} 0,${r} Q${-q},${q} ${-r},0 Q${-q},${-q} 0,${-r}Z`}
/* 全域共用的漸層與裁切，避免每顆星星都重複定義 */
(()=>{let d='';MOODS.forEach((m,i)=>{const c=`var(${m.c})`,R=17.5*NV_SC[i],go=[.35,.45,.6,.75,.95][i];
  d+=`<radialGradient id="nvH${i}"><stop offset="0" style="stop-color:${c};stop-opacity:${go}"/><stop offset=".55" style="stop-color:${c};stop-opacity:${(go*.35).toFixed(2)}"/><stop offset="1" style="stop-color:${c};stop-opacity:0"/></radialGradient>
    <radialGradient id="nvB${i}" cx=".4" cy=".32" r=".75"><stop offset="0" stop-color="${NV_HI[i]}"/><stop offset=".5" style="stop-color:${c}"/><stop offset="1" stop-color="${NV_LO[i]}"/></radialGradient>
    <radialGradient id="nvR${i}"><stop offset="0" stop-color="#fff" stop-opacity=".95"/><stop offset=".3" stop-color="${NV_HI[i]}" stop-opacity=".55"/><stop offset="1" stop-color="${NV_HI[i]}" stop-opacity="0"/></radialGradient>
    <clipPath id="nvC${i}"><path d="${nvStar(R,.32)}"/></clipPath>`});
  d+='<linearGradient id="nvS" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>';
  document.body.insertAdjacentHTML('afterbegin',`<svg width="0" height="0" style="position:absolute;width:0;height:0" aria-hidden="true" focusable="false"><defs>${d}</defs></svg>`)})();
function nvFace(i,s,dy){const f='#161339',w=1.9*s,ey=-2.2*s+dy,ex=3.4*s,my=3.4*s+dy,shine=i>=2;
  const dot=x=>`<circle cx="${x}" cy="${ey}" r="${1.4*s}" fill="${f}"/>`+(shine?`<circle class="mx" cx="${x+.5*s}" cy="${ey-.5*s}" r="${.45*s}" fill="#fff"/>`:'');
  let eyes='',mouth='',extra='';
  if(i===0){eyes=dot(-ex)+dot(ex)+`<path d="M${-ex-1.8*s},${ey-2.4*s} L${-ex+1.4*s},${ey-3.2*s} M${ex+1.8*s},${ey-2.4*s} L${ex-1.4*s},${ey-3.2*s}" stroke="${f}" stroke-width="${w*.7}" stroke-linecap="round"/>`;
    mouth=`<path d="M${-3*s},${my+1.4*s} Q0,${my-1.8*s} ${3*s},${my+1.4*s}" fill="none" stroke="${f}" stroke-width="${w}" stroke-linecap="round"/>`;
    extra=`<path class="nvt mx" d="M${ex+.6*s},${ey+2*s} q${1.1*s},${1.8*s} 0,${2.6*s} q${-1.1*s},${-.8*s} 0,${-2.6*s}Z" fill="#CFE0FF"/>`}
  else if(i===1){eyes=`<path d="M${-ex-1.7*s},${ey} h${3.4*s} M${ex-1.7*s},${ey} h${3.4*s}" stroke="${f}" stroke-width="${w}" stroke-linecap="round"/>`;
    mouth=`<path d="M${-2.6*s},${my} q${1.3*s},${-.8*s} ${2.6*s},0 t${2.6*s},0" fill="none" stroke="${f}" stroke-width="${w*.9}" stroke-linecap="round"/>`}
  else if(i===2){eyes=dot(-ex)+dot(ex);mouth=`<path d="M${-2.6*s},${my-.4*s} Q0,${my+1.6*s} ${2.6*s},${my-.4*s}" fill="none" stroke="${f}" stroke-width="${w}" stroke-linecap="round"/>`}
  else if(i===3){eyes=dot(-ex)+dot(ex);mouth=`<path d="M${-3.6*s},${my-1*s} Q0,${my+3.2*s} ${3.6*s},${my-1*s}" fill="none" stroke="${f}" stroke-width="${w*1.05}" stroke-linecap="round"/>`}
  else{eyes=`<path d="M${-ex-1.7*s},${ey+.7*s} Q${-ex},${ey-1.9*s} ${-ex+1.7*s},${ey+.7*s} M${ex-1.7*s},${ey+.7*s} Q${ex},${ey-1.9*s} ${ex+1.7*s},${ey+.7*s}" fill="none" stroke="${f}" stroke-width="${w}" stroke-linecap="round"/>`;
    mouth=`<path d="M${-4*s},${my-1.4*s} Q0,${my-1.4*s} ${4*s},${my-1.4*s} Q${3.4*s},${my+3.6*s} 0,${my+3.6*s} Q${-3.4*s},${my+3.6*s} ${-4*s},${my-1.4*s}Z" fill="${f}"/><path d="M${-1.8*s},${my+2.4*s} Q0,${my+1.2*s} ${1.8*s},${my+2.4*s} Q0,${my+3.3*s} ${-1.8*s},${my+2.4*s}Z" fill="#FF8FA3"/>`}
  const cheeks=i>=3?`<ellipse cx="${-ex-1.6*s}" cy="${my-.6*s}" rx="${1.6*s}" ry="${1*s}" fill="#FF8FA3" opacity=".55"/><ellipse cx="${ex+1.6*s}" cy="${my-.6*s}" rx="${1.6*s}" ry="${1*s}" fill="#FF8FA3" opacity=".55"/>`:'';
  return extra+cheeks+`<g class="nve">${eyes}</g>`+mouth}
function moonG(i,cx,cy,r){const sc=NV_SC[i],R=17.5*sc,rl=NV_RL[i],hi=NV_HI[i],k=(r/19.5).toFixed(4),dl=(-(MSTN++%9)*.43).toFixed(2);
  const spk=i>=3?`<path class="nvk mx" d="${nvStar(3.6,.18)}" transform="translate(17 -15)" fill="${hi}"/><path class="nvk b mx" d="${nvStar(2.6,.18)}" transform="translate(-17 -11)" fill="${hi}"/>${i===4?`<path class="nvk c mx" d="${nvStar(2.4,.18)}" transform="translate(15 15)" fill="${hi}"/>`:''}`:'';
  return `<g class="nv nv${i}" transform="translate(${cx} ${cy}) scale(${k})" style="--nd:${dl}s">
    <circle class="nvh" r="${(R*1.25).toFixed(2)}" fill="url(#nvH${i})"/>
    <g class="nvr mx"><path d="${nvStar(rl,.045)}" fill="url(#nvR${i})"/><path d="${nvStar(rl*.62,.05)}" fill="url(#nvR${i})" opacity=".7" transform="rotate(45)"/></g>${spk}
    ${i===1?`<text class="nvz mx" x="11" y="-10" font-size="6.5" font-weight="700" fill="${hi}">z</text>`:''}
    <g class="nvb"><path d="${nvStar(R,.32)}" fill="url(#nvB${i})"/>
      <g clip-path="url(#nvC${i})" class="mx"><rect class="nvs" x="-6" y="-26" width="7" height="52" fill="url(#nvS)"/></g>
      <ellipse cx="${(-R*.3).toFixed(2)}" cy="${(-R*.42).toFixed(2)}" rx="${(R*.14).toFixed(2)}" ry="${(R*.08).toFixed(2)}" fill="#fff" opacity=".7" transform="rotate(-40 ${(-R*.3).toFixed(2)} ${(-R*.42).toFixed(2)})"/>
      <path d="${nvStar(R,.32)}" fill="none" stroke="#fff" stroke-opacity=".45" stroke-width=".6"/>${nvFace(i,sc*.76,.6)}</g></g>`}
const moon=(i,cls='')=>`<svg class="moon ${cls}" viewBox="-6.6 -6.6 13.2 13.2" aria-hidden="true">${moonG(i,0,0,6.5)}</svg>`;
