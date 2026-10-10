/* 首頁：那年今日、回顧舊紀錄、月報卡片 */
function memoryPick(){const t=new Date(),td=ymd(t),real=entries.filter(e=>!isSample(e));
  /* 往前推幾年／幾個月：日期超過那個月的天數時取月底（3/31 的一個月前是 2/28，不是 setMonth 溢位成的 3/3） */
  const back=(y,m,d)=>{if(d){const x=new Date(t);x.setDate(x.getDate()-d);return ymd(x)}const Y=t.getFullYear()-y,M=t.getMonth()-m,dim=new Date(Y,M+1,0).getDate();return ymd(new Date(Y,M,Math.min(t.getDate(),dim)))};
  for(const[lab,k]of[['一年前的今天',back(1,0,0)],['半年前的今天',back(0,6,0)],['一個月前的今天',back(0,1,0)],['一週前的今天',back(0,0,7)]]){
    const es=real.filter(e=>e.date===k);if(es.length)return{lab:tl(lab),e:es[es.length-1],n:es.length}}return null}
function renderMemory(){const b=$('memCard');if(!b)return;const m=memoryPick();b.hidden=!m;if(!m)return;const e=m.e,md=MOODS[e.mood??2];
  b.style.setProperty('--c',`var(${md.c})`);
  b.innerHTML=`<span class="mem-ic" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 7v5l3 2"/><path d="M3.5 12a8.5 8.5 0 1 0 2.5-6"/><path d="M3 4v4h4"/></svg></span>
    <span class="mem-t"><small>${m.lab}${m.n>1?SEP+tl('{n} 則',{n:m.n}):''}</small><b>${esc(e.title||untitled(e))}</b><span>${moon(e.mood??2)}${esc((e.body||'').replace(/\s+/g,' ').slice(0,34))}${(e.body||'').length>34?'…':''}</span></span><span class="tc-go" aria-hidden="true">›</span>`;
  b.setAttribute('aria-label',tl('{l}：{t}，查看',{l:m.lab,t:e.title||untitled(e)}));b.onclick=()=>openDetail(e.id)}
function renderReportCard(){const b=$('rpCard');if(!b)return;const n=new Date(),pm=new Date(n.getFullYear(),n.getMonth()-1,1);
  const show=n.getDate()<=5&&monthStats(pm.getFullYear(),pm.getMonth()).list.length>0&&prof.rpSeen!==ymd(pm);b.hidden=!show;if(!show)return;
  b.innerHTML=`<span class="rpc-ic" aria-hidden="true">✦</span><span class="mem-t"><small>${tl('月報出爐')}</small><b>${tl('{m}星空報告',{m:fmtM(pm.getMonth()+1)})}</b><span>${tl('看看上個月寫了什麼、心情怎麼走')}</span></span><span class="tc-go" aria-hidden="true">›</span>`;
  b.onclick=()=>{prof.rpSeen=ymd(pm);saveProf();renderReportCard();openReport(pm.getFullYear(),pm.getMonth())}}
/* 可回顧的紀錄：今天以前寫的都算；抽選時優先挑 7 天以前、還沒回顧過的 */
function oldEntries(){const td=ymd(new Date());return entries.filter(e=>e.date<td)}
function pickReview(){const o=oldEntries(),c=new Date();c.setDate(c.getDate()-7);const lim=ymd(c),un=o.filter(e=>!reviews.ids[e.id]),wk=un.filter(e=>e.date<=lim);
  const pool=wk.length?wk:un.length?un:o;return pool[Math.floor(Math.random()*pool.length)]}
