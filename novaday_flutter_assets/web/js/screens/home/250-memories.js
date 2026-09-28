/* ---------- 那年今日：首頁的回憶卡 ---------- */
function memoryPick(){const t=new Date(),td=ymd(t),real=entries.filter(e=>!isSample(e));
  const back=(y,m,d)=>{const x=new Date(t);x.setFullYear(x.getFullYear()-y);x.setMonth(x.getMonth()-m);x.setDate(x.getDate()-d);return ymd(x)};
  for(const[lab,k]of[['一年前的今天',back(1,0,0)],['半年前的今天',back(0,6,0)],['一個月前的今天',back(0,1,0)],['一週前的今天',back(0,0,7)]]){
    const es=real.filter(e=>e.date===k);if(es.length)return{lab,e:es[es.length-1],n:es.length}}return null}
function renderMemory(){const b=$('memCard');if(!b)return;const m=memoryPick();b.hidden=!m;if(!m)return;const e=m.e,md=MOODS[e.mood??2];
  b.style.setProperty('--c',`var(${md.c})`);
  b.innerHTML=`<span class="mem-ic" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 7v5l3 2"/><path d="M3.5 12a8.5 8.5 0 1 0 2.5-6"/><path d="M3 4v4h4"/></svg></span>
    <span class="mem-t"><small>${m.lab}${m.n>1?`・${m.n} 則`:''}</small><b>${esc(e.title||untitled(e))}</b><span>${moon(e.mood??2)}${esc((e.body||'').replace(/\s+/g,' ').slice(0,34))}${(e.body||'').length>34?'…':''}</span></span><span class="tc-go" aria-hidden="true">›</span>`;
  b.setAttribute('aria-label',`${m.lab}：${e.title||untitled(e)}，查看`);b.onclick=()=>openDetail(e.id)}
