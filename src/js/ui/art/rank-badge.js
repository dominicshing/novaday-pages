/* 程式繪製：階級徽章、星線塗裝小圖 */
/* 階級徽章：星圖圓盤（外圈星環）＋每一階專屬的星空圖案（RINFO[i].em）
   一顆星 → 新月 → 星群 → 三角星座 → 月相 → 獵戶座 → 流星 → 環狀行星 → 彗星 → 北極星 → 極光 → 螺旋星系 → 雙星 → 星雲
   → 球狀星團 → 六角星座 → 脈衝星 → 星系軌道 → 黑洞 → 星際航船 → 詩人新月 → 煉金陣 → 新星爆發 → 側面銀河 → 蟲洞 → 守夜 → 創星 → 星芒（default） */
const sp4=(x,y,r)=>`M${x} ${y-r}Q${x} ${y} ${x+r} ${y}Q${x} ${y} ${x} ${y+r}Q${x} ${y} ${x-r} ${y}Q${x} ${y} ${x} ${y-r}Z`;
function rankBadge(i){const c=RINFO[i].c,g='rbG'+i+Math.random().toString(36).slice(2,6);let d=0;
  const st=(x,y,r)=>`<path class="rb-st" d="${sp4(x,y,r)}" fill="#fff" style="animation-delay:${(d++*.35).toFixed(2)}s;filter:drop-shadow(0 0 2px ${c})"/>`;
  const dot=(x,y,r=2.2)=>`<circle class="rb-st" cx="${x}" cy="${y}" r="${r}" fill="#fff" style="animation-delay:${(d++*.35).toFixed(2)}s;filter:drop-shadow(0 0 2px ${c})"/>`;
  const ln=pts=>`<polyline class="rb-ln" pathLength="1" points="${pts}" fill="none" stroke="${c}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>`;
  let e='';
  switch(RINFO[i].em){
   case 'star':e=st(50,50,15)+dot(35,38,1.4)+dot(64,61,1.6);break;
   case 'crescent':e=`<path class="rb-fill" d="M55 34A17 17 0 1 0 55 66A19 19 0 0 1 55 34Z" fill="${c}"/>`+st(63,40,6)+dot(66,58,1.6);break;
   case 'triangle':e=ln('34,61 50,34 67,57 34,61')+dot(34,61)+dot(50,34,2.8)+dot(67,57);break;
   case 'orion':e=ln('38,33 45,50 40,67')+ln('63,35 55,48 62,66')+ln('45,50 50,49 55,48')+dot(38,33,2.6)+dot(63,35,2.2)+dot(45,50,1.8)+dot(50,49,1.8)+dot(55,48,1.8)+dot(40,67,2)+dot(62,66,2.6);break;
   case 'planet':e=`<ellipse class="rb-ln" pathLength="1" cx="50" cy="50" rx="23" ry="7" fill="none" stroke="${c}" stroke-width="1.6" transform="rotate(-20 50 50)"/>
     <circle class="rb-fill" cx="50" cy="50" r="11" fill="${c}"/><path class="rb-ln" pathLength="1" d="M27 50A23 7 0 0 0 73 50" fill="none" stroke="${c}" stroke-width="1.6" transform="rotate(-20 50 50)"/>`+st(33,34,4)+dot(68,64,1.5);break;
   case 'polaris':e=`<path class="rb-fill" d="${sp4(50,50,11)}" fill="${c}" transform="rotate(45 50 50)" opacity=".7"/>`+st(50,50,20);break;
   case 'spiral':e=`<path class="rb-ln" pathLength="1" d="M50 50C57 43 67 48 65 57C63 66 49 69 40 61" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round"/>
     <path class="rb-ln" pathLength="1" d="M50 50C43 57 33 52 35 43C37 34 51 31 60 39" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round"/>
     <circle class="rb-fill" cx="50" cy="50" r="5" fill="#fff" style="filter:drop-shadow(0 0 4px ${c})"/>`+dot(66,40,1.4)+dot(34,62,1.4)+dot(58,66,1.2);break;
   case 'nebula':e=`<ellipse class="rb-fill" cx="44" cy="54" rx="17" ry="11" fill="${c}" opacity=".35" transform="rotate(-18 44 54)"/><ellipse class="rb-fill" cx="58" cy="45" rx="14" ry="9" fill="${c}" opacity=".45" transform="rotate(24 58 45)"/>`+st(52,49,9)+dot(34,40,1.6)+dot(66,62,1.8)+dot(40,66,1.2);break;
   case 'hexagon':{const h=[0,1,2,3,4,5].map(k=>{const a=-Math.PI/2+k*Math.PI/3;return [(50+20*Math.cos(a)).toFixed(1),(50+20*Math.sin(a)).toFixed(1)]});
     e=ln(h.map(q=>q.join(',')).join(' ')+' '+h[0].join(','))+ln(`${h[0].join(',')} 50,50 ${h[2].join(',')}`)+ln(`50,50 ${h[4].join(',')}`)+h.map(q=>dot(+q[0],+q[1],2)).join('')+st(50,50,7);break}
   case 'orbits':e=`<ellipse class="rb-ln" pathLength="1" cx="50" cy="50" rx="24" ry="9" fill="none" stroke="${c}" stroke-width="1.5" transform="rotate(30 50 50)"/><ellipse class="rb-ln" pathLength="1" cx="50" cy="50" rx="24" ry="9" fill="none" stroke="${c}" stroke-width="1.5" transform="rotate(-30 50 50)"/><circle class="rb-fill" cx="50" cy="50" r="7" fill="${c}"/>`+dot(70,62,2.4)+dot(31,62,2)+st(50,26,4.5);break;
   case 'poet':e=`<path class="rb-fill" d="M47 30A20 20 0 1 0 67 58A16 16 0 1 1 47 30Z" fill="${c}"/>`+st(64,34,5.5)+st(72,46,3.2)+dot(58,24,1.5)+dot(36,70,1.3);break;
   case 'cluster':e=st(46,46,9)+dot(62,38,2.4)+dot(64,56,2)+dot(36,60,1.8)+dot(52,66,2.2)+dot(34,38,1.5)+dot(58,26,1.3);break;
   case 'phases':e=`<circle class="rb-ln" pathLength="1" cx="50" cy="50" r="14" fill="none" stroke="${c}" stroke-width="1.6"/><path class="rb-fill" d="M50 36A14 14 0 0 1 50 64Z" fill="${c}"/>`
     +[[50,26,'M50 22.5A3.5 3.5 0 0 1 50 29.5Z'],[74,50,''],[50,74,'M50 70.5A3.5 3.5 0 0 0 50 77.5Z'],[26,50,'f']].map(([x,y,h])=>`<circle cx="${x}" cy="${y}" r="3.5" fill="${h==='f'?c:'none'}" stroke="${c}" stroke-width="1"/>${h&&h!=='f'?`<path d="${h}" fill="${c}"/>`:''}`).join('');break;
   case 'meteor':e=`<line class="rb-ln" pathLength="1" x1="30" y1="70" x2="58" y2="42" stroke="${c}" stroke-width="2.6" stroke-linecap="round" opacity=".85"/><line class="rb-ln" pathLength="1" x1="36" y1="72" x2="54" y2="54" stroke="${c}" stroke-width="1.4" stroke-linecap="round" opacity=".5"/><line class="rb-ln" pathLength="1" x1="28" y1="60" x2="44" y2="44" stroke="${c}" stroke-width="1.2" stroke-linecap="round" opacity=".4"/>`+st(61,39,8)+dot(70,62,1.4)+dot(38,32,1.3);break;
   case 'comet':e=`<path class="rb-fill" d="M57 37Q42 47 28 70Q47 58 65 45Z" fill="${c}" opacity=".55"/><path class="rb-fill" d="M58 40Q46 52 38 66Q50 56 63 46Z" fill="${c}" opacity=".8"/><circle class="rb-fill" cx="61" cy="41" r="6" fill="#fff" style="filter:drop-shadow(0 0 4px ${c})"/>`+dot(36,34,1.4)+dot(70,64,1.6);break;
   case 'aurora':e=[38,46,54].map((y,k)=>`<path class="rb-ln" pathLength="1" d="M27 ${y}Q34 ${y-8} 41 ${y}T55 ${y}T69 ${y}T76 ${y-4}" fill="none" stroke="${c}" stroke-width="${2.2-k*.4}" stroke-linecap="round" opacity="${1-k*.25}"/>`).join('')
     +`<path d="M24 68Q50 60 76 68" fill="none" stroke="${c}" stroke-width="1.6" stroke-linecap="round" opacity=".7"/>`+st(64,28,4.5)+dot(36,30,1.4);break;
   case 'binary':e=`<ellipse class="rb-ln" pathLength="1" cx="50" cy="50" rx="21" ry="8" fill="none" stroke="${c}" stroke-width="1.5" transform="rotate(-24 50 50)"/>`+st(33,58,6.5)+st(67,42,9)+dot(48,30,1.4)+dot(56,70,1.3);break;
   case 'globular':{let q='';for(let k=0;k<16;k++){const a=k*2.39996,r=4+Math.sqrt(k/16)*18;q+=dot(+(50+r*Math.cos(a)).toFixed(1),+(50+r*Math.sin(a)).toFixed(1),+(2.4-k*.07).toFixed(2))}e=q+st(50,50,7);break}
   case 'pulsar':e=`<path class="rb-fill" d="M50 50L64 22L70 26Z" fill="${c}" opacity=".75"/><path class="rb-fill" d="M50 50L36 78L30 74Z" fill="${c}" opacity=".75"/>`
     +[10,16].map((r,k)=>`<path class="rb-ln" pathLength="1" d="M${50-r} ${50+r*.2}A${r} ${r} 0 0 1 ${50+r*.2} ${50-r}" fill="none" stroke="${c}" stroke-width="1.3" opacity="${.8-k*.3}"/>`).join('')
     +`<circle class="rb-fill" cx="50" cy="50" r="5.5" fill="#fff" style="filter:drop-shadow(0 0 4px ${c})"/>`;break;
   case 'blackhole':e=`<ellipse class="rb-ln" pathLength="1" cx="50" cy="50" rx="25" ry="7.5" fill="none" stroke="${c}" stroke-width="3.2" transform="rotate(-14 50 50)"/><circle cx="50" cy="50" r="11" fill="#05061A" stroke="${c}" stroke-width="1.2" style="filter:drop-shadow(0 0 5px ${c})"/>`
     +`<path class="rb-ln" pathLength="1" d="M25 50A25 7.5 0 0 0 75 50" fill="none" stroke="${c}" stroke-width="3.2" transform="rotate(-14 50 50)"/>`+dot(32,32,1.5)+dot(70,68,1.4)+dot(68,30,1.2);break;
   case 'ship':e=`<g transform="rotate(38 50 50)"><path class="rb-fill" d="M50 26C57 33 58 48 55 60H45C42 48 43 33 50 26Z" fill="${c}"/><path class="rb-fill" d="M45 52L38 62L45 60ZM55 52L62 62L55 60Z" fill="${c}" opacity=".75"/><circle cx="50" cy="42" r="3.6" fill="#0A0D26" stroke="#fff" stroke-width="1.2"/><path class="rb-st" d="${sp4(50,66,5)}" fill="#fff" style="filter:drop-shadow(0 0 3px ${c})"/></g>`+dot(30,36,1.4)+dot(68,70,1.3);break;
   case 'alchemy':{const t=[0,1,2].map(k=>{const a=-Math.PI/2+k*2*Math.PI/3;return [(50+21*Math.cos(a)).toFixed(1),(50+21*Math.sin(a)).toFixed(1)]});
     e=`<circle class="rb-ln" pathLength="1" cx="50" cy="50" r="21" fill="none" stroke="${c}" stroke-width="1.4"/>`+ln(t.map(q=>q.join(',')).join(' ')+' '+t[0].join(','))+t.map(q=>dot(+q[0],+q[1],2.2)).join('')+st(50,52,7.5);break}
   case 'nova':e=[23,16,10].map((r,k)=>`<circle class="rb-ln" pathLength="1" cx="50" cy="50" r="${r}" fill="none" stroke="${c}" stroke-width="${1+k*.4}" stroke-dasharray="${k?'none':'2 3'}" opacity="${.45+k*.25}"/>`).join('')+st(50,50,9);break;
   case 'edgeon':e=`<ellipse class="rb-fill" cx="50" cy="50" rx="27" ry="6" fill="${c}" opacity=".45" transform="rotate(-24 50 50)"/><ellipse class="rb-fill" cx="50" cy="50" rx="18" ry="3" fill="${c}" opacity=".8" transform="rotate(-24 50 50)"/><ellipse cx="50" cy="50" rx="7" ry="5" fill="#fff" transform="rotate(-24 50 50)" style="filter:drop-shadow(0 0 4px ${c})"/>`+dot(34,34,1.4)+dot(68,64,1.5)+dot(66,32,1.2);break;
   case 'wormhole':e=[[24,10.5,0],[17,7.5,3],[11,4.8,5.5],[5.5,2.4,7.5]].map(([rx,ry,dy],k)=>`<ellipse class="rb-ln" pathLength="1" cx="50" cy="${44+dy}" rx="${rx}" ry="${ry}" fill="none" stroke="${c}" stroke-width="1.5" opacity="${.45+k*.18}"/>`).join('')+st(50,52,4.5)+dot(32,66,1.4)+dot(70,64,1.3);break;
   case 'nightwatch':e=`<path class="rb-ln" pathLength="1" d="M24 66Q50 54 76 66" fill="none" stroke="${c}" stroke-width="1.8" stroke-linecap="round"/><path class="rb-fill" d="M44 30A9 9 0 1 0 53 42A7 7 0 0 1 44 30Z" fill="${c}"/>`+st(62,40,6)+st(34,46,4)+dot(56,26,1.4)+dot(70,54,1.3);break;
   case 'creator':e=`<circle class="rb-ln" pathLength="1" cx="50" cy="50" r="21" fill="none" stroke="${c}" stroke-width="1.2" stroke-dasharray="2 3"/>`+st(50,50,12)+[-60,60,180].map(a=>{a*=Math.PI/180;return st(+(50+21*Math.cos(a)).toFixed(1),+(50+21*Math.sin(a)).toFixed(1),4)}).join('');break;
   default:{let r='';for(let k=0;k<12;k++){const a=k*Math.PI/6,l=k%2?19:26;r+=`<line class="rb-ln" pathLength="1" x1="${(50+10*Math.cos(a)).toFixed(1)}" y1="${(50+10*Math.sin(a)).toFixed(1)}" x2="${(50+l*Math.cos(a)).toFixed(1)}" y2="${(50+l*Math.sin(a)).toFixed(1)}" stroke="${c}" stroke-width="${k%2?1.2:1.8}" stroke-linecap="round"/>`}
     e=r+st(50,50,12)}}
  let ticks='';for(let k=0;k<24;k++){const a=k*Math.PI/12,r1=k%6?44:42.5;ticks+=`<line x1="${(50+r1*Math.cos(a)).toFixed(1)}" y1="${(50+r1*Math.sin(a)).toFixed(1)}" x2="${(50+46*Math.cos(a)).toFixed(1)}" y2="${(50+46*Math.sin(a)).toFixed(1)}" stroke="${c}" stroke-width="${k%6?.8:1.4}" stroke-opacity="${k%6?.45:.9}"/>`}
  return `<svg class="rbadge" viewBox="0 0 100 100" aria-hidden="true"><defs><radialGradient id="${g}" cx="45%" cy="38%" r="65%"><stop offset="0" stop-color="${hexA(c,.32)}"/><stop offset=".6" stop-color="#121640"/><stop offset="1" stop-color="#0A0D26"/></radialGradient></defs>
    <circle class="rb-halo" cx="50" cy="50" r="47" fill="${hexA(c,.18)}"/>
    <g class="rb-ring"><circle cx="50" cy="50" r="46" fill="none" stroke="${c}" stroke-opacity=".35" stroke-width=".8"/>${ticks}<circle cx="50" cy="4" r="2" fill="${c}" style="filter:drop-shadow(0 0 3px ${c})"/></g>
    <circle cx="50" cy="50" r="38" fill="url(#${g})" stroke="${c}" stroke-width="1.8"/>
    <circle cx="50" cy="50" r="33" fill="none" stroke="${c}" stroke-opacity=".25" stroke-width=".7" stroke-dasharray="1 2.5"/>
    <g class="rb-em">${e}</g>
    <path class="rb-shine" d="M22 36A30 30 0 0 1 44 16" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="2" stroke-linecap="round"/></svg>`}
function miniShip(i){const c=RINFO[i].c;return `<svg viewBox="0 0 40 26" aria-hidden="true"><polyline points="4,20 13,8 22,14 30,5 37,11" fill="none" stroke="${c}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" style="filter:drop-shadow(0 0 2px ${c})"/>${[[4,20],[13,8],[22,14],[30,5],[37,11]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="2" fill="#fff"/>`).join('')}</svg>`}
/* 目前使用的塗裝：使用者選過就用選的（需已解鎖），否則用目前階級的 */
function shipLiv(){const ri=rankIdx(levelInfo(totalXP(entries)).lv);return prof.livery!=null&&prof.livery<=ri?prof.livery:ri}
