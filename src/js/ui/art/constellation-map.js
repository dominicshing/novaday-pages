/* 程式繪製：星座圖（連線、星點、剪影）與首頁星系 */
/* 依星星的範圍決定圖形大小與位置 */
/* 星座剪影（例如海豚）：開發者選項可關閉，prof.noFig 未設定時預設顯示 */
/* 星點造型：四芒星（和 Logo、按鈕同一套），預設傾斜 45 度成「×」形；k 越小光芒越細 */
const spk=(x,y,r,k=.18,rot=45)=>{const f=v=>+v.toFixed(2),q=k*r*Math.SQRT2,P=(a,d)=>{a=(a+rot)*Math.PI/180;return f(x+d*Math.cos(a))+' '+f(y+d*Math.sin(a))};
  let d='M'+P(-90,r);for(let i=0;i<4;i++){const a=-90+i*90;d+=`Q${P(a+45,q)} ${P(a+90,r)}`}return d+'Z'};
/* p＝點亮進度 0–1（剪影隨進度成形）；aw＝完成動畫設定 */
function conFig(k,W,H,P,p=1,aw){return !prof.noFig&&CFX[k]?customFig(k,P,W,H,p,aw):''}
/* 星座圖：lit = 已點亮顆數；es = 對應的紀錄（決定顏色、點擊） */
function conSVG(k,W,H,pad,lit,es,opt={}){const c=CON[k],P=conProj(k,W,H,pad),ord=conOrd(k),on=new Set(ord.slice(0,lit)),LC=opt.lc||RINFO[shipLiv()].c;
  const byStar={};ord.slice(0,lit).forEach((si,j)=>byStar[si]=es&&es[j]);let g='';
  if(opt.bg){const r=seedRng(k);for(let i=0;i<opt.bg;i++)g+=`<circle cx="${(r()*W).toFixed(1)}" cy="${(r()*H).toFixed(1)}" r="${(.4+r()*.9).toFixed(2)}" fill="#E8E9FF" opacity="${(.15+r()*.35).toFixed(2)}"/>`}
  if(opt.fig!==false){const p=opt.figP??lit/c.s.length;g+=conFig(k,W,H,P,p,opt.anim&&!reduce&&p>=1?{d0:opt.d0||0}:null)}
  c.l.forEach(pl=>{for(let j=0;j<pl.length-1;j++){const a=pl[j],b=pl[j+1],A=P[a],B=P[b],both=on.has(a)&&on.has(b);
    g+=both?`<line class="cl-on${opt.anim?' cd-line':''}" pathLength="1" x1="${A[0]}" y1="${A[1]}" x2="${B[0]}" y2="${B[1]}" stroke="${LC}" style="filter:drop-shadow(0 0 3px ${LC})${opt.anim?`;animation-delay:${(opt.d0||0)+j*.12}s`:''}"/>`
      :`<line class="cl-dash" x1="${A[0]}" y1="${A[1]}" x2="${B[0]}" y2="${B[1]}"/>`}});
  c.s.forEach(([,,mag],si)=>{const[x,y]=P[si],base=Math.max(1.6,Math.min(4.6,3.9-mag*.55))*(opt.sc||1);
    if(on.has(si)){const e=byStar[si],col=e?`var(${MOODS[e.mood??2].c})`:LC;
      g+=`<g class="cstar${e&&e.id===freshId?' fresh':''}${opt.anim?' cd-star':''}"${e&&!opt.anim?` data-id="${esc(e.id)}" role="button" tabindex="0" aria-label="${esc(fmtDay(e.date))}：${esc(e.title||untitled(e))}"`:''}${opt.anim?` style="animation-delay:${(ord.indexOf(si)*.08).toFixed(2)}s"`:''}>
        <circle r="14" cx="${x}" cy="${y}" fill="transparent"/><circle class="halo" cx="${x}" cy="${y}" r="${(base*3).toFixed(1)}" fill="${col}" opacity=".2" style="--d:-${(si*.73%3.2).toFixed(2)}s"/>
        ${e&&e.id===freshId?`<circle class="ring" cx="${x}" cy="${y}" r="${base*1.6}" fill="none" stroke="${col}" stroke-width="1.5"/>`:''}
        <g class="st" style="--d:-${(si*.73%3.2).toFixed(2)}s"><path class="core" d="${spk(x,y,base*2.6)}" fill="${col}"/><path d="${spk(x,y,base*1.15)}" fill="#fff"/></g></g>`}
    else g+=`<path class="cu" d="${spk(x,y,base*1.6)}" fill="rgba(232,233,255,.55)" style="--d:-${(si*1.13%4.2).toFixed(2)}s"/>${opt.next&&si===ord[lit]?`<circle class="nextring" cx="${x}" cy="${y}" r="7" fill="none" stroke="#FFB45C" stroke-width="1.4"/>`:''}`});
  return g}
function renderGalaxy(){const st=consState(entries),svg=$('gal');$('conCount').textContent=st.done.length;
  $('skyK').hidden=!st.cur;if(!st.cur){$('conName').textContent='全部完成';$('conLatin').textContent='你點亮了全天 88 個星座';svg.innerHTML='';$('gcap').textContent='';$('skyDots').innerHTML='';return}
  const c=CON[st.cur],n=c.s.length,es=ascEntries().slice(st.off,st.off+st.lit);
  $('conName').textContent=c.n;$('conLatin').textContent=c.la+(c.z?'・黃道十二星座':'');
  svg.innerHTML=conSVG(st.cur,380,300,46,st.lit,es,{bg:70,next:true,sc:1.25});
  svg.setAttribute('aria-label',`${c.n}，已點亮 ${st.lit} / ${n} 顆星`);
  const ord=conOrd(st.cur);$('skyDots').innerHTML=ord.map((_,j)=>j<st.lit?`<i class="on" style="--c:var(${MOODS[es[j].mood??2].c})"></i>`:j===st.lit?'<i class="nx"><svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="8.2"/></svg></i>':'<i></i>').join('');
  $('gcap').innerHTML=`<span>${st.lit?`已點亮 ${st.lit} / ${n} 顆星・再寫 ${n-st.lit} 則就能完成${c.n}`:`寫下一則紀錄，點亮${c.n}的第一顆星`}</span>`;
  svg.querySelectorAll('.cstar[data-id]').forEach(el=>{el.onclick=ev=>{ev.stopPropagation();openDetail(el.dataset.id)};
    el.onkeydown=ev=>{if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();openDetail(el.dataset.id)}}})}
function placeGal(){}
function galStart(){}
function galStop(){}
$('gal').addEventListener('click',ev=>{if(ev.target.closest('.cstar[data-id]'))return;const st=consState(entries);st.cur?openCon(st.cur):openAtlas()});
