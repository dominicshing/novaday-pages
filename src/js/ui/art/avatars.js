/* 程式繪製：星空頭像 */
const AVI=(()=>{const W='#F4F3FF',G='#FFE7A3',A='#FFB45C',I='#6FE3D6',N='#A99EFF',P='#FF8FD0';
const dot=(x,y,r=1.2,c=W,o=1)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${c}" opacity="${o}"/>`;
const glow=c=>`style="filter:drop-shadow(0 0 3px ${c})"`;
const tw=(x,y,r,c,cls='')=>`<g class="va vtw ${cls?"v"+cls:""}" style="--o:${x}px ${y}px"><path d="${sp4(x,y,r)}" fill="${c}"/></g>`;
const twd=(x,y,r=1,c=W,cls='')=>`<g class="va vtw ${cls?"v"+cls:""}" style="--o:${x}px ${y}px"><circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/></g>`;
const A_=(cls,o,inner)=>`<g class="va ${cls.split(" ").map(c=>"v"+c).join(" ")}" style="--o:${o}">${inner}</g>`;
const ICONS=[
 /* 天體 */
 {k:'moon',g:0,n:tl('新月'),d:tl('輕輕搖晃的新月，旁邊星星閃爍'),t:'#2B2A6E',
  s:A_('rock','24px 26px',`<path d="M29 9A15 15 0 1 0 39 33A12 12 0 1 1 29 9Z" fill="url(#avGold)" ${glow(G)}/>`)+tw(36,13,3.6,W)+twd(40,22,1,W,'b')+twd(11,12,.9,W,'c')},
 {k:'full',g:0,n:tl('滿月'),d:tl('月面緩緩自轉，月光一明一暗'),t:'#2E2C5E',
  s:A_('halo','24px 24px',`<circle cx="24" cy="24" r="14" fill="url(#avGold)"/>`)+A_('spin slow','24px 24px',`<circle cx="19" cy="20" r="3.4" fill="#E0B865" opacity=".55"/><circle cx="29" cy="27" r="4.4" fill="#E0B865" opacity=".45"/><circle cx="21" cy="31" r="2" fill="#E0B865" opacity=".5"/><circle cx="29" cy="17" r="1.6" fill="#E0B865" opacity=".5"/>`)+twd(9,10,.9,W)+twd(40,39,.9,W,'b')},
 {k:'sun',g:0,n:tl('恆星'),d:tl('光芒慢慢旋轉，核心呼吸發光'),t:'#3A2A55',
  s:A_('spin','24px 24px',(()=>{let r='';for(let i=0;i<12;i++){const a=i*Math.PI/6,l=i%2?14:18;r+=`<line x1="${(24+10*Math.cos(a)).toFixed(1)}" y1="${(24+10*Math.sin(a)).toFixed(1)}" x2="${(24+l*Math.cos(a)).toFixed(1)}" y2="${(24+l*Math.sin(a)).toFixed(1)}" stroke="${A}" stroke-width="${i%2?1.6:2.2}" stroke-linecap="round"/>`}return r})())+A_('pulse','24px 24px',`<circle cx="24" cy="24" r="8" fill="url(#avCore)" ${glow(A)}/>`)},
 {k:'planet',g:0,n:tl('環狀行星'),d:tl('行星漂浮，小衛星繞著轉'),t:'#2A2D78',
  s:A_('float','24px 24px',`<g transform="rotate(-20 24 24)"><ellipse cx="24" cy="24" rx="18" ry="5.6" fill="none" stroke="${G}" stroke-width="2" opacity=".45"/></g><circle cx="24" cy="24" r="9.5" fill="url(#avNeb)" ${glow(N)}/><path d="M17 20Q24 17 31 21" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="1.4" stroke-linecap="round"/><g transform="rotate(-20 24 24)"><path d="M6 24A18 5.6 0 0 0 42 24" fill="none" stroke="${G}" stroke-width="2.2" stroke-linecap="round"/></g>`+A_('orbit','24px 24px',`<circle cx="24" cy="7" r="1.7" fill="${W}"/>`))+twd(10,38,.9,W,'b')},
 {k:'comet',g:0,n:tl('彗星'),d:tl('彗尾閃動，往前飛行'),t:'#173E5A',
  s:A_('cruise','24px 24px',A_('flick','31px 18px',`<path d="M27 14L6 40L34 23Z" fill="url(#avTail)"/><path d="M28 17L12 36" stroke="#fff" stroke-opacity=".5" stroke-width="1" stroke-linecap="round"/>`)+`<circle cx="31" cy="18" r="6" fill="url(#avIon)" ${glow(I)}/><circle cx="29.5" cy="16.5" r="2" fill="#fff" opacity=".8"/>`)+twd(40,9,1)},
 {k:'meteor',g:0,n:tl('流星'),d:tl('一道光劃過夜空'),t:'#35306A',
  s:A_('streak','24px 24px',`<path d="M29 18L8 39" stroke="url(#avTrail)" stroke-width="3.2" stroke-linecap="round"/><path d="M24 14L12 26M34 24L24 34" stroke="url(#avTrail)" stroke-width="1.4" stroke-linecap="round" opacity=".6"/><path d="${sp4(31,16,8)}" fill="url(#avGold)" ${glow(G)}/><circle cx="31" cy="16" r="1.6" fill="#fff"/>`)+twd(10,10,.9,W,'b')+twd(40,38,.9,W,'c')},
 /* 觀星 */
 {k:'nova',g:1,n:tl('四芒星'),d:tl('星光一收一放，背後光芒旋轉'),t:'#3A2F6E',
  s:A_('spin','24px 24px',`<path d="${sp4(24,24,9)}" fill="${A}" opacity=".6" transform="rotate(45 24 24)"/>`)+A_('pulse','24px 24px',`<path d="${sp4(24,24,17)}" fill="url(#avGold)" ${glow(G)}/><path d="${sp4(24,24,5)}" fill="#fff"/>`)+twd(39,10,1)+twd(10,38,1,W,'b')},
 {k:'const',g:1,n:tl('星座 N'),d:tl('連線一筆畫出，最後點亮新星'),t:'#262B72',
  s:`<polyline class="vdraw" pathLength="1" points="13,35 13,14 33,33 33,14" fill="none" stroke="${N}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`+twd(13,35,2.6)+twd(13,14,2.6,W,'b')+twd(33,33,2.6,W,'c')+A_('pulse','33px 14px',`<circle cx="33" cy="14" r="7" fill="${A}" opacity=".3"/><path d="${sp4(33,14,6.5)}" fill="url(#avGold)" ${glow(G)}/>`)},
 {k:'polaris',g:1,n:tl('北極星'),d:tl('外圈刻度旋轉，星光呼吸'),t:'#1C3A62',
  s:A_('spin','24px 24px',`<circle cx="24" cy="24" r="16" fill="none" stroke="${I}" stroke-opacity=".5" stroke-width="1.2" stroke-dasharray="2 3"/>`)+A_('spin rev','24px 24px',`<path d="${sp4(24,24,10)}" fill="${I}" opacity=".75" transform="rotate(45 24 24)"/>`)+A_('pulse','24px 24px',`<path d="${sp4(24,24,17)}" fill="url(#avIon)" ${glow(I)}/><circle cx="24" cy="24" r="2.2" fill="#fff"/>`)},
 {k:'galaxy',g:1,n:tl('螺旋星系'),d:tl('旋臂緩緩轉動'),t:'#2A2468',
  s:A_('spin','24px 24px',`<path d="M24 24C31 17 40 22 38 31C36 39 23 42 14 35" fill="none" stroke="${N}" stroke-width="2.4" stroke-linecap="round"/><path d="M24 24C17 31 8 26 10 17C12 9 25 6 34 13" fill="none" stroke="${I}" stroke-width="2.4" stroke-linecap="round"/>${dot(38,12,1)}${dot(11,36,1)}${dot(32,38,.8,W,.7)}`)+`<circle cx="24" cy="24" r="6" fill="#fff" opacity=".25" filter="url(#avBlur)"/>`+A_('pulse','24px 24px',`<circle cx="24" cy="24" r="3.4" fill="#fff" ${glow(W)}/>`)},
 {k:'nebula',g:1,n:tl('星雲'),d:tl('三色雲氣慢慢流動'),t:'#2E2060',
  s:A_('d1','19px 21px',`<circle cx="19" cy="21" r="10" fill="${N}" opacity=".85" filter="url(#avBlur)"/>`)+A_('d2','29px 27px',`<circle cx="29" cy="27" r="9" fill="${P}" opacity=".7" filter="url(#avBlur)"/>`)+A_('d3','27px 17px',`<circle cx="27" cy="17" r="6" fill="${I}" opacity=".7" filter="url(#avBlur)"/>`)+A_('pulse','24px 23px',`<path d="${sp4(24,23,6)}" fill="#fff" ${glow(W)}/>`)+twd(14,32,1)+twd(35,13,1.1,W,'b')+twd(33,35,.8,W,'c')},
 {k:'scope',g:1,n:tl('望遠鏡'),d:tl('鏡筒微微掃過天空'),t:'#24306E',
  s:A_('nod','22px 26px',`<g transform="rotate(-28 24 22)"><rect x="9" y="18" width="23" height="7" rx="2" fill="url(#avNeb)"/><rect x="30" y="16.5" width="6" height="10" rx="1.8" fill="url(#avGold)"/><rect x="6" y="19.5" width="4" height="4" rx="1" fill="${W}"/></g>`)+`<path d="M22 26L15 40M22 26L29 40M22 26V40" stroke="${W}" stroke-width="1.8" stroke-linecap="round"/>`+tw(38,9,3.6,G)+twd(10,10,.9,W,'b')},
 /* 夥伴 */
 {k:'owl',g:2,n:tl('夜梟'),d:tl('歪頭、眨星星眼'),t:'#2A2A6A',
  s:A_('tilt','24px 38px',`<path d="M12 17L15 9L20 14Q24 13 28 14L33 9L36 17Q38 31 24 39Q10 31 12 17Z" fill="url(#avNeb)"/>`+A_('blink','24px 22px',`<circle cx="19" cy="22" r="5" fill="#0C1030" stroke="${G}" stroke-width="1.4"/><circle cx="29" cy="22" r="5" fill="#0C1030" stroke="${G}" stroke-width="1.4"/><path d="${sp4(19,22,3)}" fill="${G}"/><path d="${sp4(29,22,3)}" fill="${G}"/>`)+`<path d="M22.5 27L24 30L25.5 27Z" fill="${A}"/><path d="M18 33Q24 36 30 33" fill="none" stroke="#fff" stroke-opacity=".3" stroke-width="1.2" stroke-linecap="round"/>`)},
 {k:'fox',g:2,n:tl('星狐'),d:tl('星座線畫出狐狸，眼睛閃光'),t:'#3F2A4E',
  s:`<polygon class="vdraw" pathLength="1" points="13,10 18,20 30,20 35,10 35,25 24,37 13,25" fill="${A}" fill-opacity=".12" stroke="${A}" stroke-width="1.8" stroke-linejoin="round"/>${[[13,10],[18,20],[30,20],[35,10],[35,25],[24,37],[13,25]].map(([x,y])=>dot(x,y,2)).join('')}`+tw(19.5,25,2.2,G)+tw(28.5,25,2.2,G,'b')+dot(24,33,1.4,'#0C1030')},
 {k:'rabbit',g:2,n:tl('玉兔'),d:tl('坐在新月上，耳朵偶爾抖一下'),t:'#2F2C66',
  s:A_('float','24px 24px',`<path d="M29 9A15 15 0 1 0 39 33A12 12 0 1 1 29 9Z" transform="translate(-5 3)" fill="url(#avGold)" ${glow(G)}/>`
   +`<g transform="translate(1 -1) scale(1.08) translate(-2 -1)">`+A_('twitch','31px 18px',`<ellipse cx="29.5" cy="12" rx="2.1" ry="6.4" transform="rotate(-16 29.5 12)" fill="${W}"/><ellipse cx="29.6" cy="12.4" rx=".9" ry="4.4" transform="rotate(-16 29.6 12.4)" fill="${P}" opacity=".7"/><ellipse cx="33.6" cy="12.8" rx="2.1" ry="6.2" transform="rotate(12 33.6 12.8)" fill="${W}"/><ellipse cx="33.5" cy="13.2" rx=".9" ry="4.2" transform="rotate(12 33.5 13.2)" fill="${P}" opacity=".7"/>`)
   +`<ellipse cx="27.5" cy="29" rx="8" ry="7" fill="${W}"/><circle cx="32.5" cy="22" r="5.4" fill="${W}"/><circle cx="19.8" cy="29.6" r="2.3" fill="${W}"/>`
   +`<ellipse cx="33" cy="35" rx="3" ry="1.6" fill="#E3E1FA"/>${dot(34.6,21.2,1.2,'#2A2A6A')}<circle cx="37.6" cy="23.2" r=".9" fill="${P}"/><ellipse cx="34.2" cy="24.4" rx="1.3" ry=".8" fill="${P}" opacity=".45"/></g>`)
   +tw(41,9,3.2,G)+twd(8,12,.9,W,'b')},
 {k:'whale',g:2,n:tl('星鯨'),d:tl('上下游動，噴出小星星'),t:'#1B3163',
  s:A_('swim','24px 27px',`<path d="M6 27Q9 16 23 18Q33 19 36 25L43 19L41.5 28L43 36L36 30Q31 37 19 36Q8 35 6 27Z" fill="url(#avSea)"/><path d="M9 29Q20 34 34 29" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="1.3" stroke-linecap="round"/>${dot(14,25,1.5,'#0C1030')}`)+A_('rise','16px 10px',`<path d="${sp4(16,10,3.4)}" fill="${I}" ${glow(I)}/>`)+A_('rise b','21px 7px',`<path d="${sp4(21,6.5,2.2)}" fill="${G}"/>`)+A_('rise c','11px 7px',`<circle cx="11" cy="7" r="1" fill="${W}"/>`)},
 {k:'cat',g:2,n:tl('星貓'),d:tl('新月瞳孔，會眨眼'),t:'#1E3A58',
  s:A_('tilt','24px 38px',`<path d="M12 36Q8 26 12 18L12 9L19 15Q24 13 29 15L36 9L36 18Q40 26 36 36Q24 41 12 36Z" fill="url(#avIon)"/>`+A_('blink','24px 24px',`<ellipse cx="19" cy="24" rx="3.4" ry="3.6" fill="#0C1030"/><ellipse cx="29" cy="24" rx="3.4" ry="3.6" fill="#0C1030"/><path d="M20.5 21.5A3 3 0 1 0 20.5 26.5A2.3 2.3 0 1 1 20.5 21.5Z" fill="${G}"/><path d="M30.5 21.5A3 3 0 1 0 30.5 26.5A2.3 2.3 0 1 1 30.5 21.5Z" fill="${G}"/>`)+`<path d="M22.8 29.5L24 31L25.2 29.5Z" fill="${P}"/><path d="M6 28L15 29.5M6 32L15 31M42 28L33 29.5M42 32L33 31" stroke="${W}" stroke-opacity=".6" stroke-width="1" stroke-linecap="round"/>`)},
 {k:'journal',g:2,n:tl('星記本'),d:tl('書籤輕晃，封面星星發光'),t:'#2E2A6A',
  s:A_('float','24px 24px',`<rect x="12" y="8" width="24" height="32" rx="3.5" fill="url(#avNeb)"/><rect x="12" y="8" width="5" height="32" rx="2" fill="#5A4AE0"/>`+A_('sway','32.5px 8px',`<path d="M30 8V20L32.5 17.5L35 20V8Z" fill="${I}"/>`)+A_('pulse','25.5px 25px',`<path d="${sp4(25.5,25,6.5)}" fill="url(#avGold)" ${glow(G)}/>`))+twd(22,17,.9)+twd(30,32,.9,W,'b')+twd(20,33,.7,W,'c')},
 {k:'eclipse',g:0,n:tl('日蝕'),d:tl('金色日冕緩緩呼吸'),t:'#1D1A55',
  s:A_('halo','24px 24px',`<circle cx="24" cy="24" r="13" fill="none" stroke="url(#avGold)" stroke-width="3.2" ${glow(G)}/>`)+`<circle cx="24" cy="24" r="11" fill="#0B0E2C"/>`+A_('pulse','33.5px 15px',`<circle cx="33.5" cy="15" r="2.3" fill="#fff" ${glow(W)}/>`)+twd(10,38,1,W,'b')+twd(40,37,.9,W,'c')},
 {k:'aurora',g:0,n:tl('極光'),d:tl('三色光帶輕輕飄動'),t:'#12305A',
  s:A_('sway','24px 40px',`<path d="M6 30Q14 15 24 22T42 14" fill="none" stroke="${I}" stroke-width="3.4" stroke-linecap="round" ${glow(I)}/><path d="M6 36Q15 23 25 29T42 21" fill="none" stroke="${N}" stroke-width="2.8" stroke-linecap="round" opacity=".9"/><path d="M8 41Q17 32 26 36T41 30" fill="none" stroke="${P}" stroke-width="2.2" stroke-linecap="round" opacity=".8"/>`)+tw(36,9,3,W)+twd(12,10,1,W,'b')},
 {k:'ursa',g:1,n:tl('小熊座'),d:tl('北極星在勺柄盡頭閃耀'),t:'#232A6E',
  s:`<polyline class="vdraw" pathLength="1" points="9,31 15,26 21,27 27,22 36,17 40,25 31,29 27,22" fill="none" stroke="${N}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`+twd(15,26,1.8)+twd(21,27,1.8,W,'b')+twd(27,22,2,W,'c')+twd(36,17,1.8)+twd(40,25,1.8,W,'b')+twd(31,29,1.8,W,'c')+A_('pulse','9px 31px',`<circle cx="9" cy="31" r="5.5" fill="${A}" opacity=".28"/><path d="${sp4(9,31,5)}" fill="url(#avGold)" ${glow(G)}/>`)},
 {k:'jelly',g:2,n:tl('星水母'),d:tl('在夜空裡緩緩漂浮'),t:'#2A1F5E',
  s:A_('float','24px 24px',`<path d="M12 24Q12 11 24 11Q36 11 36 24Q30 22 24 24Q18 22 12 24Z" fill="url(#avNeb)" ${glow(P)}/><path d="M16 25Q14 31 17 37M21 25Q20 33 22 40M27 25Q28 33 26 40M32 25Q34 31 31 37" fill="none" stroke="${P}" stroke-width="1.7" stroke-linecap="round" opacity=".85"/><circle cx="19.5" cy="17" r="1.6" fill="#fff" opacity=".8"/>`)+tw(39,12,2.8,G)+twd(9,14,1,W,'b')},
 {k:'lamp',g:2,n:tl('天燈'),d:tl('帶著願望慢慢升空'),t:'#2B2150',
  s:A_('float','24px 24px',`<path d="M16 11H32L30 34H18Z" fill="url(#avGold)" ${glow(A)}/><path d="M20 11L21 34M28 11L27 34" stroke="#D98A2B" stroke-width=".9" opacity=".7"/><path d="M18 34H30" stroke="#E07A3A" stroke-width="2.2" stroke-linecap="round"/><circle cx="24" cy="29" r="2.6" fill="#FFF6DA"/>`)+A_('rise','12px 34px',`<path d="${sp4(12,34,2.3)}" fill="${G}"/>`)+A_('rise b','38px 30px',`<circle cx="38" cy="30" r="1.2" fill="${W}"/>`)+tw(38,10,2.6,W)}
];

return ICONS})();
const AVK={};
AVI.forEach((a,i)=>{a.i=i;AVK[a.k]=a});
