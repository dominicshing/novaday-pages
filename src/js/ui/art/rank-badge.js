/* 程式繪製：階級徽章、星線塗裝小圖 */
/* 階級徽章：星圖圓盤（外圈星環）＋每一階專屬的星空圖案
   0 一顆星 → 1 新月 → 2 三角星座 → 3 獵戶座 → 4 環狀行星 → 5 北極星 → 6 螺旋星系 → 7 超新星 */
const sp4=(x,y,r)=>`M${x} ${y-r}Q${x} ${y} ${x+r} ${y}Q${x} ${y} ${x} ${y+r}Q${x} ${y} ${x-r} ${y}Q${x} ${y} ${x} ${y-r}Z`;
function rankBadge(i){const c=RINFO[i].c,g='rbG'+i+Math.random().toString(36).slice(2,6);let d=0;
  const st=(x,y,r)=>`<path class="rb-st" d="${sp4(x,y,r)}" fill="#fff" style="animation-delay:${(d++*.35).toFixed(2)}s;filter:drop-shadow(0 0 2px ${c})"/>`;
  const dot=(x,y,r=2.2)=>`<circle class="rb-st" cx="${x}" cy="${y}" r="${r}" fill="#fff" style="animation-delay:${(d++*.35).toFixed(2)}s;filter:drop-shadow(0 0 2px ${c})"/>`;
  const ln=pts=>`<polyline class="rb-ln" pathLength="1" points="${pts}" fill="none" stroke="${c}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>`;
  let e='';
  switch(i){
   case 0:e=st(50,50,15)+dot(35,38,1.4)+dot(64,61,1.6);break;
   case 1:e=`<path class="rb-fill" d="M55 34A17 17 0 1 0 55 66A19 19 0 0 1 55 34Z" fill="${c}"/>`+st(63,40,6)+dot(66,58,1.6);break;
   case 2:e=ln('34,61 50,34 67,57 34,61')+dot(34,61)+dot(50,34,2.8)+dot(67,57);break;
   case 3:e=ln('38,33 45,50 40,67')+ln('63,35 55,48 62,66')+ln('45,50 50,49 55,48')+dot(38,33,2.6)+dot(63,35,2.2)+dot(45,50,1.8)+dot(50,49,1.8)+dot(55,48,1.8)+dot(40,67,2)+dot(62,66,2.6);break;
   case 4:e=`<ellipse class="rb-ln" pathLength="1" cx="50" cy="50" rx="23" ry="7" fill="none" stroke="${c}" stroke-width="1.6" transform="rotate(-20 50 50)"/>
     <circle class="rb-fill" cx="50" cy="50" r="11" fill="${c}"/><path class="rb-ln" pathLength="1" d="M27 50A23 7 0 0 0 73 50" fill="none" stroke="${c}" stroke-width="1.6" transform="rotate(-20 50 50)"/>`+st(33,34,4)+dot(68,64,1.5);break;
   case 5:e=`<path class="rb-fill" d="${sp4(50,50,11)}" fill="${c}" transform="rotate(45 50 50)" opacity=".7"/>`+st(50,50,20);break;
   case 6:e=`<path class="rb-ln" pathLength="1" d="M50 50C57 43 67 48 65 57C63 66 49 69 40 61" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round"/>
     <path class="rb-ln" pathLength="1" d="M50 50C43 57 33 52 35 43C37 34 51 31 60 39" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round"/>
     <circle class="rb-fill" cx="50" cy="50" r="5" fill="#fff" style="filter:drop-shadow(0 0 4px ${c})"/>`+dot(66,40,1.4)+dot(34,62,1.4)+dot(58,66,1.2);break;
   case 7:e=`<ellipse class="rb-fill" cx="44" cy="54" rx="17" ry="11" fill="${c}" opacity=".35" transform="rotate(-18 44 54)"/><ellipse class="rb-fill" cx="58" cy="45" rx="14" ry="9" fill="${c}" opacity=".45" transform="rotate(24 58 45)"/>`+st(52,49,9)+dot(34,40,1.6)+dot(66,62,1.8)+dot(40,66,1.2);break;
   case 8:{const h=[0,1,2,3,4,5].map(k=>{const a=-Math.PI/2+k*Math.PI/3;return [(50+20*Math.cos(a)).toFixed(1),(50+20*Math.sin(a)).toFixed(1)]});
     e=ln(h.map(q=>q.join(',')).join(' ')+' '+h[0].join(','))+ln(`${h[0].join(',')} 50,50 ${h[2].join(',')}`)+ln(`50,50 ${h[4].join(',')}`)+h.map(q=>dot(+q[0],+q[1],2)).join('')+st(50,50,7);break}
   case 9:e=`<ellipse class="rb-ln" pathLength="1" cx="50" cy="50" rx="24" ry="9" fill="none" stroke="${c}" stroke-width="1.5" transform="rotate(30 50 50)"/><ellipse class="rb-ln" pathLength="1" cx="50" cy="50" rx="24" ry="9" fill="none" stroke="${c}" stroke-width="1.5" transform="rotate(-30 50 50)"/><circle class="rb-fill" cx="50" cy="50" r="7" fill="${c}"/>`+dot(70,62,2.4)+dot(31,62,2)+st(50,26,4.5);break;
   case 10:e=`<path class="rb-fill" d="M47 30A20 20 0 1 0 67 58A16 16 0 1 1 47 30Z" fill="${c}"/>`+st(64,34,5.5)+st(72,46,3.2)+dot(58,24,1.5)+dot(36,70,1.3);break;
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
