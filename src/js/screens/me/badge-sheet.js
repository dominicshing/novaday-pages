/* 「我的」頁：徽章牆與徽章詳情 */
let achAll=false;
const ACH_CAT=[['streak','連續','每天回來點亮一顆星','<path d="M12 3.2c1 3 4.6 5 4.6 9.5a4.6 4.6 0 0 1-9.2 0c0-2.2 1.2-3.7 2.2-4.8.3 1.5.9 2.3 1.8 2.7-.2-2.8 0-5.2.6-7.4z"/><path d="M10.4 17.6a1.9 1.9 0 0 0 3.2-1.5c0-1.2-1-1.8-1.4-2.8-.6.9-1.8 1.6-1.8 2.9"/>'],
  ['write','寫作','一字一句累積你的星河','<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>'],
  ['explore','探索','照片、地點與今日星語','<circle cx="12" cy="12" r="8.5"/><path d="M15.6 8.4l-2.1 5.1-5.1 2.1 2.1-5.1z"/>'],
  ['mood','心情','好壞都值得被記住','<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/><circle class="f" cx="17.5" cy="5.5" r="1.4"/>'],
  ['time','時光','回頭看看走過的路','<circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3.2 2"/>'],
  ['cons','星座','收集夜空裡的星座','<path d="M4 17.5l5-6.5 5 3 6-8.5"/><circle class="f" cx="4" cy="17.5" r="1.7"/><circle class="f" cx="9" cy="11" r="1.7"/><circle class="f" cx="14" cy="14" r="1.7"/><circle class="f" cx="20" cy="5.5" r="2.1"/>']];
function achCatHead(k,AL){const c=ACH_CAT.find(x=>x[0]===k),L=AL.filter(x=>(CR_CAT[x.a.id]||'write')===k),n=L.filter(x=>x.on).length,col=CR_COL[k][0];
  return `<div class="ach-cat" role="heading" aria-level="3" style="--c:${col}"><span class="ac-ic" aria-hidden="true"><svg viewBox="0 0 24 24">${c[3]}</svg></span><span class="ac-t"><b>${c[1]}</b><small>${c[2]}</small></span><span class="ac-n" aria-label="已解鎖 ${n} / ${L.length}"><span class="ac-dots" aria-hidden="true">${L.map(x=>`<i${x.on?' class="on"':''}></i>`).join('')}</span><span><b>${n}</b> / ${L.length}</span></span></div>`}
/* 徽章詳情 bottom sheet */
function achGo(id,cat){if(/^rev/.test(id))return['回顧一則舊紀錄',()=>{const e=pickReview();if(e)openDetail(e.id);else toast('先寫幾天紀錄，之後就能回顧')}];
  if(cat==='cons')return['打開星座圖鑑',()=>go('atlas')];if(id==='fav5')return['去日記挑一則收藏',()=>go('log','list')];return['寫一則紀錄',()=>openEditor()]}
let achCur=null;
let achBusy=false;
function achSwap(d){if(achBusy)return;const sl=$('asBody').querySelector('.as-slide');if(reduce||!sl){achStep(d);return}achBusy=true;
  sl.classList.remove('snap','as-in-r','as-in-l');sl.classList.add('out');sl.style.transform=`translateX(${d>0?-105:105}%)`;sl.style.opacity='0';
  setTimeout(()=>{achBusy=false;achStep(d)},190)}
function achStep(d){const i=ACH.findIndex(x=>x.id===achCur);if(i<0)return;openAch(ACH[(i+d+ACH.length)%ACH.length].id,d)}
let achPrevP=null;
function openAch(id,dir){const a=ACH.find(x=>x.id===id);if(!a)return;achCur=id;const sibX=$('achSheet').classList.contains('open')&&$('asBody').querySelector('.as-sibs')?$('asBody').querySelector('.as-sibs').scrollLeft:null;const on=a.t(entries),[c0,t]=ACHP[id](entries),c=Math.min(c0,t),p=on?100:Math.min(99,Math.round(c/t*100));
  const cat=CR_CAT[id]||'write',col=CR_COL[cat][0],ci=ACH_CAT.find(x=>x[0]===cat),sibs=ACH.filter(x=>(CR_CAT[x.id]||'write')===cat),k=sibs.indexOf(a),nOn=sibs.filter(x=>x.t(entries)).length;
  const sh=$('achSheet');sh.style.setProperty('--c',col);
  const g=on?null:achGo(id,cat);
  const gi=ACH.indexOf(a),anim=dir&&!reduce?(dir>0?' as-in-r':' as-in-l'):'';
  $('asBody').innerHTML=`<div class="as-hero"><i class="as-glow" aria-hidden="true"></i>
      <button type="button" class="as-nav l" id="asPrev" aria-label="上一個徽章"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg></button>
      <button type="button" class="as-nav r" id="asNext" aria-label="下一個徽章"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg></button>
      <div class="as-slide${anim}"><div class="as-cr">${crystal(id,on,p)}</div>
      <span class="as-cat"><svg viewBox="0 0 24 24" aria-hidden="true">${ci[3]}</svg>${ci[1]}・第 ${k+1} / ${sibs.length} 個</span>
      <h2 id="asN">${esc(a.n)}</h2><p class="as-d">${esc(a.d)}</p><span class="as-pos">${gi+1} / ${ACH.length}</span></div></div>
    <div class="as-card${on?' on':''}"><div class="as-ph"><span>${on?'已解鎖':'目前進度'}</span><b>${c.toLocaleString()} / ${t.toLocaleString()}</b></div><div class="as-bar" role="progressbar" aria-valuemin="0" aria-valuemax="${t}" aria-valuenow="${c}"><i style="width:${achPrevP==null?p:achPrevP}%"></i></div><p>${on?'恭喜！你已經達成這個徽章':achLeft(id,t-c)}</p>${on?'<div class="btn as-go as-got" aria-hidden="true">已收藏在你的星空 ✦</div>':`<button type="button" class="btn as-go" id="asGo">${g[0]}</button>`}</div>
    <div class="as-sib-h">${ci[1]}類徽章<small>已解鎖 ${nOn} / ${sibs.length}</small></div>
    <div class="as-sibs" role="list">${sibs.map(x=>{const o=x.t(entries),[xc,xt]=ACHP[x.id](entries);return `<button type="button" role="listitem" data-a="${x.id}" aria-current="${x.id===id}" aria-label="${esc(x.n)}，${o?'已解鎖':'未解鎖'}"><span class="sb-cr">${crystal(x.id,o,o?100:Math.min(99,Math.round(Math.min(xc,xt)/xt*100)))}</span><small>${esc(x.n)}</small></button>`}).join('')}</div>`;
  $('asPrev').onclick=()=>achSwap(-1);$('asNext').onclick=()=>achSwap(1);
  if($('asGo'))$('asGo').onclick=()=>{closeSheet('achSheet');setTimeout(g[1],reduce?0:220)};
  $('asBody').querySelectorAll('.as-sibs [data-a]').forEach(b=>b.onclick=()=>openAch(b.dataset.a));
  const wasOpen=sh.classList.contains('open');if(!wasOpen){$('asBody').scrollTop=0;openSheet('achSheet')}
  /* 進度條從上一個徽章的長度平滑變化；同類徽章列保持原本的捲動位置再滑到目前的徽章 */
  const bar=$('asBody').querySelector('.as-bar i');achPrevP=p;
  requestAnimationFrame(()=>{if(bar)bar.style.width=p+'%';const cur=$('asBody').querySelector('.as-sibs [aria-current="true"]'),r=cur&&cur.parentElement;if(!r)return;
    const to=cur.offsetLeft-(r.clientWidth-cur.offsetWidth)/2;if(wasOpen&&sibX!=null){r.scrollLeft=sibX;r.scrollTo({left:to,behavior:reduce?'auto':'smooth'})}else r.scrollLeft=to})}
/* 徽章詳情：左右滑動切換、右上角關閉、方向鍵切換 */
(()=>{const body=$('asBody');let g=null,raf=0;
  $('asX').onclick=()=>closeSheet('achSheet');
  const paint=()=>{raf=0;if(!g||!g.on)return;const sl=g.sl;if(!sl)return;const dx=g.dx,w=body.clientWidth||360;
    sl.style.transform=`translate3d(${dx}px,0,0) rotate(${(dx/w*6).toFixed(2)}deg)`;sl.style.opacity=String(Math.max(.4,1-Math.abs(dx)/(w*1.1)))};
  body.addEventListener('pointerdown',e=>{if(achBusy||e.target.closest('.as-sibs,button,.as-card'))return;if(e.pointerType==='mouse'&&e.button!==0)return;
    g={x:e.clientX,y:e.clientY,dx:0,on:false,id:e.pointerId,pts:[[e.clientX,performance.now()]],sl:null}});
  body.addEventListener('pointermove',e=>{if(!g||e.pointerId!==g.id)return;const dx=e.clientX-g.x,dy=e.clientY-g.y;
    if(!g.on){if(Math.abs(dx)<8)return;if(Math.abs(dy)>Math.abs(dx)){g=null;return}g.on=true;g.x=e.clientX-(dx>0?8:-8);g.sl=body.querySelector('.as-slide');
      if(g.sl){g.sl.classList.remove('snap','out','as-in-r','as-in-l')}try{body.setPointerCapture(e.pointerId)}catch(_){}}
    const now=performance.now();g.pts.push([e.clientX,now]);while(g.pts.length>2&&now-g.pts[0][1]>120)g.pts.shift();
    g.dx=e.clientX-g.x;if(!raf)raf=requestAnimationFrame(paint)});
  const end=()=>{if(!g)return;const {dx,on,sl,pts}=g,p0=pts[0],p1=pts[pts.length-1],vx=p1&&p0&&p1[1]>p0[1]?(p1[0]-p0[0])/(p1[1]-p0[1]):0;g=null;if(raf){cancelAnimationFrame(raf);raf=0}if(!on)return;body._swEnd=Date.now();
    const w=body.clientWidth||360,flick=Math.abs(vx)>.3&&Math.abs(dx)>20&&Math.sign(vx)===Math.sign(dx);
    if(Math.abs(dx)>w*.22||flick){buzz(6);achSwap(dx<0?1:-1)}
    else if(sl){sl.classList.add('snap');sl.style.transform='';sl.style.opacity=''}};
  body.addEventListener('pointerup',end);body.addEventListener('pointercancel',end);
  body.addEventListener('click',e=>{if(Date.now()-(body._swEnd||0)<300){e.stopPropagation();e.preventDefault()}},true);
  document.addEventListener('keydown',e=>{if(!$('achSheet').classList.contains('open'))return;if(e.key==='ArrowRight'){e.preventDefault();achSwap(1)}else if(e.key==='ArrowLeft'){e.preventDefault();achSwap(-1)}})})();
function achLeft(id,n){n=Math.max(0,n);const f={s3:`再連續寫 ${n} 天就能解鎖`,s7:`再連續寫 ${n} 天就能解鎖`,first:`寫下第一則就能解鎖`,c10:`再寫 ${n} 則就能解鎖`,photo:`再 ${n} 則附上照片或影片就能解鎖`,loc:`再 ${n} 則加上地點就能解鎖`,
  words:`再寫 ${n.toLocaleString()} 字就能解鎖`,signal:`再回答 ${n} 次今日星語就能解鎖`,all:`再用 ${n} 種沒用過的心情就能解鎖`,con1:`再完成 ${n} 個星座就能解鎖`,con5:`再完成 ${n} 個星座就能解鎖`,s100:`再連續寫 ${n} 天就能解鎖`,s60:`再連續寫 ${n} 天就能解鎖`,mfull:`這個月再寫 ${n} 天就能解鎖`,back:`休息一陣子後再回來寫，就能解鎖`,c365:`再寫 ${n} 則就能解鎖`,w50k:`再寫 ${n.toLocaleString()} 字就能解鎖`,long1k:`單則再多寫 ${n.toLocaleString()} 字就能解鎖`,multi:`同一天再寫 ${n} 則就能解鎖`,photo4:`單則再加 ${n} 張照片就能解鎖`,fav5:`再收藏 ${n} 則就能解鎖`,season4:`再到 ${n} 個季節寫紀錄就能解鎖`,happy3:`再連續 ${n} 天好心情就能解鎖`,bright10:`再記錄 ${n} 次「很棒」就能解鎖`,calm10:`再記錄 ${n} 次「還可以」就能解鎖`,low5:`難過的日子也寫下來，再 ${n} 次就能解鎖`,rebound:`低落之後心情回升時就能解鎖`,rev1:`回顧一則舊紀錄就能解鎖`,rev10:`再回顧 ${n} 則就能解鎖`,rev30:`再回顧 ${n} 則就能解鎖`,anniv:`一年後的同一天再寫一則就能解鎖`,j100:`再繼續寫 ${n} 天就能解鎖`,j365:`再繼續寫 ${n} 天就能解鎖`,con44:`再完成 ${n} 個星座就能解鎖`,zod12:`再完成 ${n} 個黃道星座就能解鎖`,con88:`再完成 ${n} 個星座就能解鎖`,s14:`再連續寫 ${n} 天就能解鎖`,s30:`再連續寫 ${n} 天就能解鎖`,m20:`這個月再寫 ${n} 天就能解鎖`,c30:`再寫 ${n} 則就能解鎖`,c100:`再寫 ${n} 則就能解鎖`,long:`單則再多寫 ${n} 字就能解鎖`,photo20:`再 ${n} 則附上照片就能解鎖`,loc10:`再去 ${n} 個新地點就能解鎖`,tag5:`再用 ${n} 種新標籤就能解鎖`,signal10:`再回答 ${n} 次今日星語就能解鎖`,night:`再 ${n} 則在晚上 10 點後寫就能解鎖`,early:`再 ${n} 則在早上 8 點前寫就能解鎖`,con3:`再完成 ${n} 個星座就能解鎖`,con10:`再完成 ${n} 個星座就能解鎖`,w20k:`再寫 ${n.toLocaleString()} 字就能解鎖`,w5k:`再寫 ${n.toLocaleString()} 字就能解鎖`,zod1:`完成一個黃道十二星座就能解鎖`,con20:`再完成 ${n} 個星座就能解鎖`}[id];return f||`還差 ${n}`}
