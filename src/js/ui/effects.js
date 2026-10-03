/* 特效：彗星、火花、浮動 XP、升級畫面、snackbar、toast */
/* 點亮動畫：依心情決定顏色與節奏。彗星（四芒星）從＋按鈕飛到剛點亮的星，沿途留下星屑，抵達時擴散光圈＋火花
   很低落：慢、火花少而柔；有點累：稍慢；還可以：一般；不錯：快、加星形火花；很棒：最快、兩圈光、大量星形火花 */
const LAUNCH=[{t:950,n:10,d:[28,58],sd:1.3,st:0,ring:1},{t:850,n:14,d:[34,72],sd:1.15,st:0,ring:1},{t:750,n:22,d:[45,120],sd:.9,st:0,ring:1},
  {t:650,n:28,d:[55,140],sd:.9,st:.35,ring:1},{t:600,n:36,d:[60,170],sd:1,st:.5,ring:2}];
const MOOD_SPARKS=[['--m0','--m0','--m1'],['--m1','--m1','--m2'],['--m2','--m2','--m1'],['--m3','--m4','--m3'],['--m4','--m3','--flare']];
async function launch(m=2){if(reduce)return;const P=LAUNCH[m]||LAUNCH[2],mc=`var(${MOODS[m].c})`,nb=$('newBtn');
  nb.style.setProperty('--mc',mc);nb.classList.add('firing');setTimeout(()=>nb.classList.remove('firing'),900);await sleep(260);
  const gal=$('gal'),nx=gal.querySelector('.cstar.fresh .core'),fb=nb.querySelector('span').getBoundingClientRect(),g=(nx||gal).getBoundingClientRect();gal.classList.add('arriving');   /* 新星先藏起來，彗星抵達時才亮 */
  const sx=fb.left+fb.width/2,sy=fb.top+fb.height/2,tx=g.left+g.width/2,ty=g.top+g.height/2;
  const c=document.createElement('div');c.className='comet';c.style.setProperty('--mc',mc);c.style.left=sx+'px';c.style.top=sy+'px';c.style.transitionDuration=P.t+'ms';
  c.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 1Q13.9 10.1 23 12Q13.9 13.9 12 23Q10.1 13.9 1 12Q10.1 10.1 12 1Z"/></svg>';document.body.appendChild(c);
  c.getBoundingClientRect();c.style.transform=`translate(${tx-sx}px,${ty-sy}px) rotate(${180+m*90}deg)`;
  const tr=setInterval(()=>{const r=c.getBoundingClientRect(),d=document.createElement('div');d.className='trail';d.style.setProperty('--c',mc);
    d.style.left=(r.left+r.width/2)+'px';d.style.top=(r.top+r.height/2)+'px';document.body.appendChild(d);setTimeout(()=>d.remove(),600)},38);
  await sleep(P.t+10);clearInterval(tr);c.remove();gal.classList.remove('arriving');burst(tx,ty,m)}
function burst(x,y,m){const P=m==null?{n:22,d:[45,125],sd:.9,st:0,ring:0}:LAUNCH[m],cols=m==null?['--m1','--m2','--m3','--m4','--flare','--nebula']:MOOD_SPARKS[m];
  for(let k=0;k<(P.ring||0);k++){const r=document.createElement('div');r.className='lring';r.style.setProperty('--c',`var(${cols[0]})`);r.style.left=x+'px';r.style.top=y+'px';r.style.animationDelay=k*.16+'s';
    document.body.appendChild(r);setTimeout(()=>r.remove(),1000+k*160)}
  for(let i=0;i<P.n;i++){const s=document.createElement('div'),a=Math.random()*Math.PI*2,d=P.d[0]+Math.random()*(P.d[1]-P.d[0]);s.className='spark'+(Math.random()<P.st?' st':'');
    s.style.left=x+'px';s.style.top=y+'px';s.style.setProperty('--c',`var(${i%5===4?'--text':cols[i%cols.length]})`);s.style.setProperty('--dx',Math.cos(a)*d+'px');s.style.setProperty('--dy',Math.sin(a)*d+'px');
    s.style.animationDuration=P.sd+'s';document.body.appendChild(s);setTimeout(()=>s.remove(),P.sd*1000+60)}}
function floatXP(t){const g=$('gal').getBoundingClientRect(),f=document.createElement('div');f.className='floatxp';f.textContent=t;
  f.style.left=(g.left+g.width/2)+'px';f.style.top=(g.top+g.height/2-70)+'px';document.body.appendChild(f);setTimeout(()=>f.remove(),1450)}
function showLevel(lv){return new Promise(res=>{$('lvUpNum').textContent='Lv.'+lv;const nr=rankIdx(lv),promo=rankIdx(lv-1)!==nr;$('lvUpBadge').innerHTML=rankBadge(nr);$('lvUpRank').textContent=(promo?'晉升為「':'目前階級：「')+rankOf(lv)+'」';$('lvUpTitle').textContent=promo?'階級晉升':'等級提升';
  const o=$('lvUp');o.classList.add('show');const r=$('app').getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2-50;
  if(!reduce){burst(cx,cy);setTimeout(()=>burst(cx,cy),300)}$('lvUpOk').focus();$('lvUpOk').onclick=()=>{o.classList.remove('show');res()}})}
let snT;
function snack(msg,label,fn){const s=$('snack');$('snackMsg').textContent=msg;$('snackBtn').textContent=label;s.classList.add('show');
  const hide=()=>{s.classList.remove('show');clearTimeout(snT)};$('snackBtn').onclick=()=>{hide();fn()};clearTimeout(snT);snT=setTimeout(hide,5000)}
let tt;
function toast(m,ms){const t=$('toast');t.textContent=m;t.classList.add('show');clearTimeout(tt);tt=setTimeout(()=>t.classList.remove('show'),ms||2200)}
