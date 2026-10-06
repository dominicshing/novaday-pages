// This preview reuses Novaday's native constellation functions and animation styles.
// Source revision is recorded in source-notes.json; only the Lynx figure geometry is changed.
const prof={noFig:false}, RINFO=[{c:'#8A7CFF'}], shipLiv=()=>0;
let reduce=matchMedia('(prefers-reduced-motion: reduce)').matches,freshId=null;
const MOODS=[{n:'很低落',c:'--m0'},{n:'有點累',c:'--m1'},{n:'還可以',c:'--m2'},{n:'不錯',c:'--m3'},{n:'很棒',c:'--m4'}];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmtDay=s=>s,untitled=()=> '預覽紀錄';
function seedRng(str){let h=1779033703^str.length;for(let i=0;i<str.length;i++){h=Math.imul(h^str.charCodeAt(i),3432918353);h=h<<13|h>>>19}
  return()=>{h=Math.imul(h^h>>>16,2246822507);h=Math.imul(h^h>>>13,3266489909);h^=h>>>16;return(h>>>0)/4294967296}}

const sp4=(x,y,r)=>`M${x} ${y-r}Q${x} ${y} ${x+r} ${y}Q${x} ${y} ${x} ${y+r}Q${x} ${y} ${x-r} ${y}Q${x} ${y} ${x} ${y-r}Z`;
const CON={"Lyn":{"n":"天貓座","la":"Lynx","s":[[9.35,34.39,3.1],[9.31,36.8,3.8],[8.38,43.19,4.3],[7.45,49.21,4.6],[6.95,58.42,4.4],[6.33,59.01,4.4]],"l":[[0,1,2,3,4,5]]}};
/* 規則：星座投影、季節與可見度、地區、星座點亮順序 */
const D2R=Math.PI/180,PROJ={};
function conCenter(k){const c=CON[k];let x=0,y=0,z=0;c.s.forEach(([r,d])=>{const a=r*15*D2R,b=d*D2R;x+=Math.cos(b)*Math.cos(a);y+=Math.cos(b)*Math.sin(a);z+=Math.sin(b)});
  const n=Math.hypot(x,y,z);return{ra:((Math.atan2(y,x)/D2R/15)+24)%24,dec:Math.asin(z/n)/D2R}}
/* 以星座中心做切平面投影，北上東左，等比縮放塞進方框 */
function conProj(k,W,H,pad){const key=k+W+'x'+H+'p'+pad;if(PROJ[key])return PROJ[key];const c=CON[k],cc=conCenter(k),a0=cc.ra*15*D2R,d0=cc.dec*D2R;
  const P=c.s.map(([r,d])=>{const a=r*15*D2R,b=d*D2R,q=Math.sin(d0)*Math.sin(b)+Math.cos(d0)*Math.cos(b)*Math.cos(a-a0);
    return[-Math.cos(b)*Math.sin(a-a0)/q,-(Math.cos(d0)*Math.sin(b)-Math.sin(d0)*Math.cos(b)*Math.cos(a-a0))/q]});
  const xs=P.map(p=>p[0]),ys=P.map(p=>p[1]),mx=Math.min(...xs),Mx=Math.max(...xs),my=Math.min(...ys),My=Math.max(...ys);
  const s=Math.min((W-2*pad)/Math.max(Mx-mx,1e-3),(H-2*pad)/Math.max(My-my,1e-3),(W-2*pad)/.05);
  return PROJ[key]=P.map(([x,y])=>[+(W/2+(x-(mx+Mx)/2)*s).toFixed(1),+(H/2+(y-(my+My)/2)*s).toFixed(1)])}
/* 點亮順序：沿著連線走一遍 */
function conOrd(k){const c=CON[k];if(c.o)return c.o;const o=[];c.l.forEach(pl=>pl.forEach(i=>{if(!o.includes(i))o.push(i)}));c.s.forEach((_,i)=>{if(!o.includes(i))o.push(i)});return c.o=o}

let FIGN=0;const CFX={Lyn:{"dust":1,"align":"stars","ref":[[74.6,254],[83.2,235],[174.8,194],[247.7,143.5],[268.5,64.4],[305.4,46]],"body":"M271 5 L273 5 L274 9 L276 8 L276 11 L281 16 L284 16 L284 18 L288 20 L296 28 L296 30 L298 30 L298 33 L301 35 L302 40 L304 42 L306 41 L315 45 L318 44 L318 46 L322 48 L334 43 L340 43 L354 39 L358 34 L358 29 L361 33 L361 37 L365 34 L365 38 L363 41 L366 43 L361 45 L365 59 L365 76 L363 82 L361 83 L362 87 L358 90 L359 92 L354 95 L353 101 L353 113 L355 115 L355 119 L357 119 L357 122 L359 124 L355 125 L355 136 L351 134 L350 139 L348 140 L347 144 L345 144 L344 147 L341 148 L340 145 L332 152 L328 152 L328 150 L326 150 L321 154 L315 155 L315 150 L310 151 L293 148 L295 158 L307 161 L322 162 L328 164 L329 166 L332 166 L334 170 L337 171 L339 176 L337 185 L328 191 L317 192 L313 190 L307 190 L306 192 L304 192 L304 195 L306 195 L307 199 L307 208 L305 212 L299 214 L294 218 L277 217 L275 214 L271 214 L266 209 L266 206 L264 206 L261 202 L257 201 L256 199 L256 202 L254 202 L250 200 L245 193 L244 196 L242 196 L238 191 L236 191 L228 205 L224 206 L225 204 L223 204 L218 211 L216 209 L211 215 L204 219 L199 220 L202 217 L202 215 L198 216 L197 218 L195 217 L193 219 L183 221 L163 219 L163 222 L165 223 L168 231 L175 233 L176 235 L179 235 L179 237 L182 238 L187 247 L186 258 L175 266 L157 267 L151 264 L150 262 L148 263 L147 261 L145 261 L141 254 L136 252 L135 250 L134 252 L132 250 L130 251 L128 246 L126 244 L123 244 L122 239 L120 239 L118 234 L109 233 L103 233 L93 238 L95 248 L98 248 L101 251 L103 251 L104 256 L106 258 L106 267 L103 271 L99 272 L95 276 L85 276 L80 278 L76 276 L55 274 L54 272 L48 269 L46 270 L43 264 L41 266 L38 260 L38 256 L35 257 L35 242 L33 241 L37 224 L43 215 L39 217 L38 216 L42 212 L43 208 L48 206 L48 204 L52 203 L49 202 L52 198 L60 194 L63 194 L67 191 L70 179 L72 178 L68 178 L68 176 L71 170 L74 168 L74 166 L77 165 L77 163 L62 164 L60 163 L60 161 L50 157 L50 155 L48 154 L48 152 L50 151 L45 145 L45 139 L47 140 L46 133 L49 124 L52 125 L54 118 L56 116 L59 117 L65 113 L81 113 L87 119 L89 118 L93 125 L95 124 L99 135 L101 135 L113 128 L116 128 L117 124 L134 116 L137 116 L138 114 L148 113 L152 111 L178 112 L180 110 L187 109 L188 107 L186 106 L189 105 L200 103 L202 104 L204 102 L218 103 L217 100 L224 100 L226 91 L224 91 L220 95 L220 88 L224 81 L229 77 L226 75 L230 70 L235 68 L236 66 L243 64 L242 49 L245 50 L246 40 L249 37 L250 33 L254 30 L254 28 L257 27 L258 24 L262 23 L262 21 L264 21 L268 17 L265 15 L266 13 L263 10 L271 11 L271 5 Z","eye":[282,97],"eye2":[329,121],"er":4.8}};
const FIG_DUST={};
/* 把只含 M/L/C/Z 的路徑攤平成折線（比 getPointAtLength 快上百倍）；其他指令回傳 null */
function flatPath(d){if(/[^MLCZmlcz0-9.,\s-]/.test(d)||/[mlcz]/.test(d))return null;const t=d.match(/[MLCZ]|-?\d*\.?\d+/g),pts=[];let i=0,cx=0,cy=0,sx=0,sy=0,cmd='';const n=()=>+t[i++];
  while(i<t.length){if(/[MLCZ]/.test(t[i]))cmd=t[i++];
    if(cmd==='M'){cx=sx=n();cy=sy=n();pts.push([cx,cy]);cmd='L'}
    else if(cmd==='L'){cx=n();cy=n();pts.push([cx,cy])}
    else if(cmd==='C'){const a=[n(),n(),n(),n(),n(),n()];for(let k=1;k<=8;k++){const u=k/8,v=1-u;pts.push([v*v*v*cx+3*v*v*u*a[0]+3*v*u*u*a[2]+u*u*u*a[4],v*v*v*cy+3*v*v*u*a[1]+3*v*u*u*a[3]+u*u*u*a[5]])}cx=a[4];cy=a[5]}
    else if(cmd==='Z'){pts.push([sx,sy]);cx=sx;cy=sy;cmd=''}else i++}
  return pts}
function outlineSamples(d,N,r){/* N 為 0 時依周長決定取樣數 */let P=flatPath(d);if(!P){const NS='http://www.w3.org/2000/svg',pe=document.createElementNS(NS,'path');pe.setAttribute('d',d);const L=pe.getTotalLength();P=[];for(let i=0;i<=200;i++){const q=pe.getPointAtLength(i/200*L);P.push([q.x,q.y])}}
  const acc=[0];for(let i=1;i<P.length;i++)acc.push(acc[i-1]+Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]));const L=acc[acc.length-1],out=[];let j=1;if(!N)N=Math.round(Math.min(520,Math.max(240,L/3)));
  for(let i=0;i<N;i++){const l=(i+r())/N*L;while(j<P.length-1&&acc[j]<l)j++;const a=P[j-1],b=P[j],f=(l-acc[j-1])/((acc[j]-acc[j-1])||1);out.push([a[0]+(b[0]-a[0])*f,a[1]+(b[1]-a[1])*f,b[0]-a[0],b[1]-a[1]])}
  return out}
/* 只算範圍（未點亮的淡影不需要星塵粒子，圖鑑一次畫 88 個時省下大部分時間）；星塵版也用同一個範圍，位置才一致 */
const FIG_BOX={};
function figBox(k,X){if(FIG_BOX[k])return FIG_BOX[k];const P=flatPath(X.body);if(!P)return FIG_BOX[k]={bb:null};let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;
  P.forEach(([x,y])=>{x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y)});return FIG_BOX[k]={bb:[x0,y0,x1-x0,y1-y0]}}
function figDust(k,X){if(FIG_DUST[k])return FIG_DUST[k];const r=seedRng(k+'-dust'),pick=a=>a[Math.floor(r()*a.length)];
  const cx=document.createElement('canvas').getContext('2d'),P2=new Path2D(X.body),ins=(x,y)=>cx.isPointInPath(P2,x,y);
  let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;const rim=[],inn=[],tw=[];
  outlineSamples(X.body,0,r).forEach(([x,y,dx,dy])=>{const m=Math.hypot(dx,dy)||1;let nx=-dy/m,ny=dx/m;if(!ins(x+nx*3,y+ny*3)){nx=-nx;ny=-ny}   /* 法線朝內 */
    x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y);
    if(ins(x-nx*2.5,y-ny*2.5))return;                                                                          /* 子路徑重疊的內部接縫，不算輪廓 */
    const o=-1.5+r()*r()*7,back=ny>0;                                                                          /* 多數貼著輪廓，少數往內 */
    rim.push([x+nx*o,y+ny*o,.45+r()*.9,back?pick(['#BFF4EE','#9FF3E8','#FFFFFF','#BFF4EE']):pick(['#CFC9FF','#B9AEFF','#BFF4EE','#FFFFFF']),.55+r()*.45])});
  for(let n=0,t=0;n<520&&t<8000;t++){const x=x0+r()*(x1-x0),y=y0+r()*(y1-y0);if(!ins(x,y))continue;n++;
    inn.push([x,y,.3+r()*r()*1.3,pick(['#8A7CFF','#A99EFF','#CFC9FF','#6FE3D6','#BFF4EE','#FFFFFF','#FFE7A3','#8A7CFF','#A99EFF']),.25+r()*.6])}
  for(let n=0,t=0;n<26&&t<3000;t++){const x=x0+r()*(x1-x0),y=y0+r()*(y1-y0);if(!ins(x,y))continue;n++;tw.push([x,y,1.6+r()*2.2,(r()*3).toFixed(2),pick(['#FFFFFF','#BFF4EE','#FFE7A3','#CFC9FF'])])}
  const c=a=>`<circle cx="${a[0].toFixed(1)}" cy="${a[1].toFixed(1)}" r="${a[2].toFixed(2)}" fill="${a[3]}" opacity="${a[4].toFixed(2)}"/>`;
  const w=x1-x0,h=y1-y0,ell=L=>L.map(([u,v,a,b,col])=>`<ellipse cx="${(x0+u*w).toFixed(1)}" cy="${(y0+v*h).toFixed(1)}" rx="${(a*w).toFixed(1)}" ry="${(b*h).toFixed(1)}" fill="${col}"/>`).join('');
  return FIG_DUST[k]={bb:figBox(k,X).bb||[x0,y0,x1-x0,y1-y0],
    neb:ell([[.62,.55,.36,.3,'#7B6CF0'],[.85,.85,.24,.2,'#6A5AE6'],[.4,.35,.2,.16,'#4FB8D8'],[.25,.15,.16,.12,'#8A7CFF']]),          /* 外圍：紫色為主 */
    core:ell([[.35,.3,.28,.18,'#6FE3D6'],[.6,.55,.3,.26,'#8A7CFF'],[.8,.82,.2,.18,'#B9AEFF']]),                                          /* 身體內部星雲 */
    dots:inn.map(c).join('')+rim.map(c).join(''),
    rank:(rr=>[...inn,...rim].map(a=>[rr(),c(a)]))(seedRng(k+'-rank')),                                                                    /* 進行中依 rank 決定哪些粒子先出現 */
    tw:tw.map(([x,y,s,d,col])=>`<path d="${sp4(+x.toFixed(1),+y.toFixed(1),+s.toFixed(1))}" fill="${col}" style="--d:-${d}s"/>`).join('')}}
/* p：點亮進度 0–1。0＝只剩淡淡的輪廓；進行中星塵依比例聚集、星雲漸亮；1＝全部顯示，眼睛亮起、開始游動 */
function dustFig(X,D,n,tx,ty,s,p=1){const full=p>=1,q=Math.max(0,Math.min(1,p)),o=(a,b)=>(a+(b-a)*q).toFixed(2),
    f=Math.max(.3,Math.min(1,D.bb[2]*D.bb[3]*s*s/43000)),                                        /* 小圖（圖鑑卡片等）粒子減量，畫面上的密度不變 */
    dots=full&&f>=1?D.dots:q?D.rank.filter(([r])=>r<q*f).map(([,c])=>c).join(''):'';
  return `<g class="cfx cfx-dust${X.align==='stars'?' cfx-aligned':''}${full?'':' cfx-wip'}" aria-hidden="true" transform="translate(${tx} ${ty}) scale(${s.toFixed(4)})">
    <defs><linearGradient id="fxs${n}" x1="0" y1="0" x2=".6" y2="1"><stop offset="0" stop-color="#A6FFF4"/><stop offset=".5" stop-color="#8FD8FF"/><stop offset="1" stop-color="#B9A6FF"/></linearGradient>
    <clipPath id="fxc${n}"><path d="${X.body}"/></clipPath>
    <filter id="fxn${n}" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="16"/></filter>
    <filter id="fxi${n}" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="7"/></filter>
    <filter id="fxr${n}" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3"/></filter></defs>
    <g class="cfx-fade"><g class="cfx-swim">
    ${q?`<g opacity="${q.toFixed(2)}"><g class="cfx-neb" filter="url(#fxn${n})" opacity=".3">${D.neb}</g></g>`:''}
    <g clip-path="url(#fxc${n})"><path d="${X.body}" fill="#1E1A5A" opacity="${o(.14,.3)}"/>${q?`<g opacity="${q.toFixed(2)}"><g filter="url(#fxi${n})" opacity=".22">${D.core}</g>
      <path d="${X.body}" fill="none" stroke="url(#fxs${n})" stroke-width="18" opacity=".32" filter="url(#fxi${n})"/></g>`:''}</g>
    <path d="${X.body}" fill="none" stroke="url(#fxs${n})" stroke-width="6" opacity="${o(.14,.4)}" filter="url(#fxr${n})"/>
    <path d="${X.body}" fill="none" stroke="url(#fxs${n})" stroke-width="1.3" opacity="${o(.42,.9)}" vector-effect="non-scaling-stroke"/>
    ${dots?`<g>${dots}</g>`:''}${full?`<g class="cfx-tw">${D.tw}</g>
    ${[X.eye,X.eye2,...(X.eyes||[])].filter(Boolean).map(e=>`<circle class="cfx-eye" cx="${e[0]}" cy="${e[1]}" r="${X.er||2.4}" fill="#E6FFFB" opacity=".85"/>`).join('')}`:''}</g></g></g>`}
/* 完成動畫（點睛）：光從每顆星依點亮順序先亮起一小圈、再向外擴散，把剪影「點亮」出來；SMIL 時間軸由呼叫端 setCurrentTime(0) 歸零 */
function awakeMask(n,P,ord,W,H,d0){const R=Math.round(Math.hypot(W,H));
  return `<defs><radialGradient id="fxmg${n}"><stop offset=".72" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
    <mask id="fxm${n}" maskUnits="userSpaceOnUse" x="${-W}" y="${-H}" width="${3*W}" height="${3*H}">${ord.map((si,j)=>`<circle cx="${P[si][0]}" cy="${P[si][1]}" r="0" fill="url(#fxmg${n})"><animate attributeName="r" values="0;${Math.round(R*.22)};${R}" keyTimes="0;.55;1" dur="2.6s" begin="${(d0+.15+j*.18).toFixed(2)}s" fill="freeze"/></circle>`).join('')}</mask></defs>`}
function customFig(k,P,W,H,p=1,aw){const n0=FIGN+1,g=customFig0(k,P,W,H,p);if(!aw||p<1||!W)return g;
  /* aw＝{d0}：完成動畫，外層套遮罩（不受剪影本身的位移縮放影響），眼睛在光擴散後才眨眼亮起 */
  const ed=(aw.d0||0)+1.7+conOrd(k).length*.18;
  return `${awakeMask(n0,P,conOrd(k),W,H,aw.d0||0)}<g class="cfx-awake" mask="url(#fxm${n0})" style="--ed:${ed.toFixed(2)}s">${g}</g>`}
function customFig0(k,P,W,H,p){const X=CFX[k],R=X.ref,n=++FIGN,dist=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
  /* 星塵剪影：不跟隨星座連線，依圖案自身範圍置中縮放進畫框 */
  if(X.dust&&X.align!=='stars'&&W&&H){const D=p>0||!figBox(k,X).bb?figDust(k,X):figBox(k,X),[bx,by,bw,bh]=D.bb,pd=Math.min(W,H)*.07,s=Math.min((W-2*pd)/bw,(H-2*pd)/bh);
    return dustFig(X,D,n,(W/2-(bx+bw/2)*s).toFixed(2),(H/2-(by+bh/2)*s).toFixed(2),s,p)}
  let i0=0,i1=0,best=0;R.forEach((a,i)=>R.forEach((b,j)=>{const q=dist(a,b);if(q>best){best=q;i0=i;i1=j}}));
  const s=dist(P[i0],P[i1])/best,cr=[0,1].map(t=>R.reduce((v,r)=>v+r[t],0)/R.length),cp=[0,1].map(t=>P.reduce((v,r)=>v+r[t],0)/P.length);
  const tx=(cp[0]-cr[0]*s).toFixed(2),ty=(cp[1]-cr[1]*s).toFixed(2);
  if(X.dust)return dustFig(X,p>0||!figBox(k,X).bb?figDust(k,X):figBox(k,X),n,tx,ty,s,p);
  /* 一般剪影：未完成時依進度變淡，沒有影子、柔光和眼睛（剪影由多個子路徑疊成，不加描邊以免露出接縫） */
  const full=p>=1,q=Math.max(0,Math.min(1,p));
  return `<g class="cfx${full?'':' cfx-wip'}" aria-hidden="true" transform="translate(${tx} ${ty}) scale(${s.toFixed(4)})">
    <defs><linearGradient id="fxg${n}" x1="0" y1="0" x2=".35" y2="1"><stop offset="0" stop-color="#C4BCFF" stop-opacity=".32"/><stop offset=".55" stop-color="#8A7CFF" stop-opacity=".2"/><stop offset="1" stop-color="#6A5AE6" stop-opacity=".13"/></linearGradient>
    <linearGradient id="fxl${n}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FFFFFF" stop-opacity="0"/><stop offset=".5" stop-color="#FFFFFF" stop-opacity=".16"/><stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/></linearGradient>
    <clipPath id="fxc${n}"><path d="${X.body}"/></clipPath>
    <filter id="fxb${n}" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="8"/></filter></defs>
    <g class="cfx-fade">${full?`<path class="cfx-sh" d="${X.body}" fill="#02030C" opacity=".55" filter="url(#fxb${n})" transform="translate(4 12)"/>`:''}
    <g class="cfx-swim"><path d="${X.body}" fill="url(#fxg${n})"${full?'':` opacity="${(.4+.45*q).toFixed(2)}"`}/>
    ${full?`<g clip-path="url(#fxc${n})"><g transform="rotate(20 190 150)"><rect class="cfx-sheen" x="-60" y="-120" width="90" height="560" fill="url(#fxl${n})" opacity="0"/></g></g>
    ${[X.eye,X.eye2,...(X.eyes||[])].filter(Boolean).map(e=>`<circle class="cfx-eye" cx="${e[0]}" cy="${e[1]}" r="${X.er||2.2}" fill="#E6E2FF" fill-opacity=".4"/>`).join('')}`
:''}</g></g></g>`}

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
