/* 分享圖卡：星座與日記圖卡 */
const MOOD_HEX=['#7E72C8','#5F8FEA','#5FD8CC','#FFE7A3','#FFC744'];
function shareSVG(k){const c=CON[k],W=1080,H=1350,es=conEntries(k),ord=conOrd(k),P=conProj(k,1080,760,120),r=seedRng(k+'share');
  const st=consState(entries),idx=st.done.indexOf(k)+1,d0=es.length?parse(es[0].date):null,d1=es.length?parse(es[es.length-1].date):null;
  const days=d0?Math.round((d1-d0)/864e5)+1:0,fmt=d=>`${d.getFullYear()}.${pad(d.getMonth()+1)}.${pad(d.getDate())}`,name=esc(prof.name||'星旅人');
  let g=`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs>
    <linearGradient id="bg" x1="0" y1="0" x2=".4" y2="1"><stop offset="0" stop-color="#231E62"/><stop offset=".55" stop-color="#0D1033"/><stop offset="1" stop-color="#060818"/></linearGradient>
    <radialGradient id="gl" cx=".5" cy=".42" r=".5"><stop offset="0" stop-color="#8A7CFF" stop-opacity=".35"/><stop offset="1" stop-color="#8A7CFF" stop-opacity="0"/></radialGradient>
    <filter id="bl" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="9"/></filter></defs>
    <rect width="${W}" height="${H}" fill="url(#bg)"/><rect width="${W}" height="${H}" fill="url(#gl)"/>`;
  for(let i=0;i<160;i++)g+=`<circle cx="${(r()*W).toFixed(0)}" cy="${(r()*H).toFixed(0)}" r="${(r()*2.2+.5).toFixed(1)}" fill="#E8E9FF" opacity="${(.15+r()*.5).toFixed(2)}"/>`;
  g+=`<text x="${W/2}" y="120" text-anchor="middle" font-family="Chakra Petch,system-ui,sans-serif" font-size="30" font-weight="600" letter-spacing="12" fill="#AEB3E6">NOVADAY</text>`;
  g+=`<g transform="translate(0 200)">${conFig(k,1080,760,P)}`;
  c.l.forEach(pl=>g+=`<polyline points="${pl.map(i=>P[i].join(',')).join(' ')}" fill="none" stroke="#CFC9FF" stroke-opacity=".75" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`);
  ord.forEach((si,j)=>{const[x,y]=P[si],col=MOOD_HEX[(es[j]||{}).mood??2];g+=`<circle cx="${x}" cy="${y}" r="26" fill="${col}" opacity=".55" filter="url(#bl)"/><path d="${sp4(x,y,20)}" fill="${col}"/><circle cx="${x}" cy="${y}" r="5" fill="#fff"/>`});
  g+=`</g><text x="${W/2}" y="1050" text-anchor="middle" font-family="system-ui,'PingFang TC','Noto Sans TC',sans-serif" font-size="96" font-weight="800" fill="#FFFFFF">${c.n}</text>
    <text x="${W/2}" y="1102" text-anchor="middle" font-family="system-ui,sans-serif" font-size="34" letter-spacing="4" fill="#6FE3D6">${c.la}</text>
    <text x="${W/2}" y="1180" text-anchor="middle" font-family="system-ui,'PingFang TC','Noto Sans TC',sans-serif" font-size="38" fill="#E8E9FF">${name} 用 ${days} 天點亮了全部 ${c.s.length} 顆星</text>
    ${d0?`<text x="${W/2}" y="1234" text-anchor="middle" font-family="system-ui,sans-serif" font-size="28" fill="#9AA0D0">${fmt(d0)} – ${fmt(d1)}</text>`:''}
    <rect x="${W/2-150}" y="1266" width="300" height="52" rx="26" fill="rgba(255,180,92,.14)" stroke="#FFB45C" stroke-opacity=".6"/>
    <text x="${W/2}" y="1301" text-anchor="middle" font-family="system-ui,'PingFang TC','Noto Sans TC',sans-serif" font-size="26" font-weight="700" fill="#FFD58A">第 ${idx||'?'} 個完成的星座 ✦</text></svg>`;
  return g}
let shBlob=null,shUrl=null;
let shSeq=0;
/* 通用：把 SVG 圖卡轉成 PNG，放進分享面板 */
function showShareCard({title,svg,file,alt,shareTitle,opt}){$('shTitle').textContent=title;$('shOpt').hidden=!opt;
  $('shPrev').innerHTML='<div class="sh-load">正在產生圖卡…</div>';shBlob=null;const seq=++shSeq;
  if(!$('shareSheet').classList.contains('open'))openSheet('shareSheet');else sheetTop('shareSheet');
  const img=new Image();img.onload=()=>{if(seq!==shSeq)return;const cv=document.createElement('canvas');cv.width=1080;cv.height=1350;const x=cv.getContext('2d');x.drawImage(img,0,0);
    cv.toBlob(b=>{if(seq!==shSeq)return;shBlob=b;if(shUrl)URL.revokeObjectURL(shUrl);shUrl=URL.createObjectURL(b);$('shPrev').innerHTML=`<img src="${shUrl}" alt="${esc(alt)}">`},'image/png')};
  img.onerror=()=>{if(seq===shSeq)$('shPrev').innerHTML='<div class="sh-load">圖卡產生失敗，請再試一次</div>'};
  img.src=svgURL(svg);
  $('shSave').onclick=async()=>{if(!shBlob)return;const dl=window.claude&&await window.claude.use('downloads').catch(()=>null);
    if(!dl){toast('這個環境無法直接儲存，請長按圖片儲存',3000);return}
    try{await dl.save({filename:file,data:shBlob});toast('已儲存圖片')}catch(e){if(e&&e.code==='declined')return;toast('無法儲存，請長按圖片儲存',3000)}};
  $('shGo').onclick=async()=>{if(!shBlob)return;const f=new File([shBlob],file,{type:'image/png'});
    try{if(navigator.canShare&&navigator.canShare({files:[f]})){await navigator.share({files:[f],title:shareTitle});return}}catch(e){if(e&&e.name==='AbortError')return}
    $('shSave').click()}}
function openShare(k){showShareCard({title:`${CON[k].n}・分享圖卡`,svg:shareSVG(k),file:`Novaday-${CON[k].la}.png`,alt:`${CON[k].n}的分享圖卡`,shareTitle:`我點亮了${CON[k].n}`})}
const CARD_FONT="system-ui,-apple-system,'PingFang TC','Noto Sans TC','Microsoft JhengHei',sans-serif";
let _mctx=null;
function wrapText(t,size,weight,maxW,maxLines){_mctx=_mctx||document.createElement('canvas').getContext('2d');_mctx.font=`${weight} ${size}px ${CARD_FONT}`;
  const out=[];let cut=false;const paras=String(t||'').replace(/\r/g,'').split('\n');
  for(const para of paras){let line='';for(const ch of [...para]){if(_mctx.measureText(line+ch).width>maxW&&line&&!/[，。、；：！？」』》〉）,.;:!?)]/.test(ch)){out.push(line);line=ch.trim()?ch:'';if(out.length>=maxLines){cut=true;break}}else line+=ch}
    if(cut)break;out.push(line);if(out.length>=maxLines){cut=paras.indexOf(para)<paras.length-1;break}}
  while(out.length&&!out[out.length-1].trim()&&out.length>1)out.pop();
  if(cut&&out.length){let l=out[out.length-1];while(l&&_mctx.measureText(l+'…').width>maxW)l=l.slice(0,-1);out[out.length-1]=l+'…'}
  return out}
let shEntry=null,shMode='full';
function entrySVG(e,full){const W=1080,H=1350,m=e.mood??2,col=MOOD_HEX[m],r=seedRng(e.id+'card'),d=parse(e.date),S=entryStar(e);
  const X=v=>esc(v);let g=`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs>
    <linearGradient id="bg" x1="0" y1="0" x2=".35" y2="1"><stop offset="0" stop-color="#1E1A58"/><stop offset=".6" stop-color="#0C0F31"/><stop offset="1" stop-color="#060818"/></linearGradient>
    <radialGradient id="gl" cx=".5" cy=".2" r=".55"><stop offset="0" stop-color="${col}" stop-opacity=".32"/><stop offset="1" stop-color="${col}" stop-opacity="0"/></radialGradient>
    <filter id="bl" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="22"/></filter></defs>
    <rect width="${W}" height="${H}" fill="url(#bg)"/><rect width="${W}" height="${H}" fill="url(#gl)"/>`;
  for(let i=0;i<120;i++)g+=`<circle cx="${(r()*W).toFixed(0)}" cy="${(r()*H).toFixed(0)}" r="${(r()*2+.5).toFixed(1)}" fill="#E8E9FF" opacity="${(.12+r()*.45).toFixed(2)}"/>`;
  g+=`<rect x="40" y="40" width="${W-80}" height="${H-80}" rx="44" fill="none" stroke="#E8E9FF" stroke-opacity=".09" stroke-width="2"/>`;
  g+=`<text x="${W/2}" y="118" text-anchor="middle" font-family="Chakra Petch,system-ui,sans-serif" font-size="28" font-weight="600" letter-spacing="12" fill="#AEB3E6">NOVADAY</text>`;
  const sy=full?270:440,sr=full?78:120;
  g+=`<circle cx="${W/2}" cy="${sy}" r="${sr*.9}" fill="${col}" opacity=".5" filter="url(#bl)"/><path d="${sp4(W/2,sy,sr)}" fill="${col}"/><circle cx="${W/2}" cy="${sy}" r="${sr*.12}" fill="#fff"/>`;
  let y=sy+sr+80;
  g+=`<text x="${W/2}" y="${y}" text-anchor="middle" font-family="${CARD_FONT}" font-size="34" font-weight="700" letter-spacing="4" fill="${col}">${MOODS[m].n}</text>`;
  y+=58;const when=`${d.getFullYear()}.${pad(d.getMonth()+1)}.${pad(d.getDate())}・星期${WD[d.getDay()]}${e.time?'・'+e.time:''}`;
  g+=`<text x="${W/2}" y="${y}" text-anchor="middle" font-family="${CARD_FONT}" font-size="30" fill="#9AA0D0">${X(when)}${e.loc?`<tspan fill="#6FE3D6">　${X(e.loc.length>12?e.loc.slice(0,12)+'…':e.loc)}</tspan>`:''}</text>`;
  const title=e.title||(full?'':(e.body||'').slice(0,40))||'今天的星光';
  const tl=wrapText(title,full?60:72,800,880,2);y+=full?110:140;
  tl.forEach((l,i)=>{g+=`<text x="${W/2}" y="${y+i*(full?80:96)}" text-anchor="middle" font-family="${CARD_FONT}" font-size="${full?60:72}" font-weight="800" fill="#FFFFFF">${X(l)}</text>`});
  y+=(tl.length-1)*(full?80:96);
  if(full&&e.body&&e.title){const lim=Math.max(2,Math.floor((1150-(y+80))/62)+1);const bl=wrapText(e.body,38,400,860,Math.min(9,lim));y+=86;
    bl.forEach((l,i)=>{g+=`<text x="110" y="${y+i*62}" font-family="${CARD_FONT}" font-size="38" fill="#D3D6F4">${X(l)}</text>`});
    g+=`<rect x="80" y="${y-40}" width="5" height="${(bl.length-1)*62+52}" rx="2.5" fill="${col}" opacity=".7"/>`}
  const foot=S?`點亮了${CON[S.k].n}的第 ${S.j+1} 顆星`:`${prof.name||'星旅人'}的星光紀錄`;
  g+=`<text x="${W/2}" y="1236" text-anchor="middle" font-family="${CARD_FONT}" font-size="28" fill="#AEB3E6">${S?`${X(prof.name||'星旅人')}・`:''}${X(foot)}</text>`;
  g+=`<path d="${sp4(W/2-220,1226,9)}" fill="${col}" opacity=".8"/><path d="${sp4(W/2+220,1226,9)}" fill="${col}" opacity=".8"/>`;
  return g+'</svg>'}
function renderEntryShare(){const e=shEntry;if(!e)return;document.querySelectorAll('#shOpt button').forEach(b=>b.setAttribute('aria-checked',String(b.dataset.o===shMode)));
  showShareCard({title:'分享這則紀錄',svg:entrySVG(e,shMode==='full'),file:`Novaday-${e.date}.png`,alt:`${e.title||'紀錄'}的分享圖卡`,shareTitle:e.title||'今天的星光',opt:true});
  document.querySelectorAll('#shOpt button').forEach(b=>b.setAttribute('aria-checked',String(b.dataset.o===shMode)))}
function openEntryShare(id){const e=entries.find(x=>x.id===id);if(!e)return;shEntry=e;shMode=(e.title&&e.body)?'full':'lite';
  $('shOpt').querySelector('[data-o=full]').disabled=!(e.title&&e.body);renderEntryShare()}
document.querySelectorAll('#shOpt button').forEach(b=>b.onclick=()=>{if(b.disabled)return;shMode=b.dataset.o;renderEntryShare()});
