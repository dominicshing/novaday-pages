/* ---------- Effects ---------- */
async function launch(){if(reduce)return;const nb=$('newBtn');nb.classList.add('firing');setTimeout(()=>nb.classList.remove('firing'),900);await sleep(260);
  const fb=$('newBtn').querySelector('span').getBoundingClientRect(),g=$('gal').getBoundingClientRect();
  const sx=fb.left+fb.width/2-7,sy=fb.top+fb.height/2-7,tx=g.left+g.width/2-7,ty=g.top+g.height/2-7;
  const c=document.createElement('div');c.className='comet';c.style.left=sx+'px';c.style.top=sy+'px';document.body.appendChild(c);
  c.getBoundingClientRect();c.style.transform=`translate(${tx-sx}px,${ty-sy}px)`;await sleep(760);c.remove();burst(tx+7,ty+7)}
function burst(x,y){const cols=['--m1','--m2','--m3','--m4','--flare','--nebula'];
  for(let i=0;i<22;i++){const s=document.createElement('div'),a=Math.random()*Math.PI*2,d=45+Math.random()*80;s.className='spark';
    s.style.left=x+'px';s.style.top=y+'px';s.style.setProperty('--c',`var(${cols[i%cols.length]})`);s.style.setProperty('--dx',Math.cos(a)*d+'px');s.style.setProperty('--dy',Math.sin(a)*d+'px');
    document.body.appendChild(s);setTimeout(()=>s.remove(),950)}}
function floatXP(t){const g=$('gal').getBoundingClientRect(),f=document.createElement('div');f.className='floatxp';f.textContent=t;
  f.style.left=(g.left+g.width/2)+'px';f.style.top=(g.top+g.height/2-70)+'px';document.body.appendChild(f);setTimeout(()=>f.remove(),1450)}
function showLevel(lv){return new Promise(res=>{$('lvUpNum').textContent='Lv.'+lv;const nr=rankIdx(lv),promo=rankIdx(lv-1)!==nr;$('lvUpBadge').innerHTML=rankBadge(nr);$('lvUpRank').textContent=(promo?'晉升為「':'目前階級：「')+rankOf(lv)+'」';$('lvUpTitle').textContent=promo?'階級晉升':'等級提升';
  const o=$('lvUp');o.classList.add('show');const r=$('app').getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2-50;
  if(!reduce){burst(cx,cy);setTimeout(()=>burst(cx,cy),300)}$('lvUpOk').focus();$('lvUpOk').onclick=()=>{o.classList.remove('show');res()}})}
let snT;function snack(msg,label,fn){const s=$('snack');$('snackMsg').textContent=msg;$('snackBtn').textContent=label;s.classList.add('show');
  const hide=()=>{s.classList.remove('show');clearTimeout(snT)};$('snackBtn').onclick=()=>{hide();fn()};clearTimeout(snT);snT=setTimeout(hide,5000)}
let tt;function toast(m,ms){const t=$('toast');t.textContent=m;t.classList.add('show');clearTimeout(tt);tt=setTimeout(()=>t.classList.remove('show'),ms||2200)}

