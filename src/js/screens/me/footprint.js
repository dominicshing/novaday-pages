/* 「我的」頁：星光足跡 */
let fpSel=null,fpIntroDone=false;
function renderFootprint(){const box=$('footprint');if(!box)return;const today=new Date();today.setHours(0,0,0,0);
  /* 範圍依使用時間調整：剛開始用的人看最近 12 週（格子較大、直接顯示表情星星），最多半年 */
  const real=entries.filter(e=>!isSample(e)),f0=real.map(e=>e.date).concat(prof.since?[prof.since]:[]).sort()[0];
  const wk=f0?Math.ceil((today-parse(f0))/864e5/7)+1:1,W=Math.max(12,Math.min(26,wk)),big=W<=16;
  if($('fpSub'))$('fpSub').textContent=W>=26?'過去半年':`最近 ${W} 週`;
  const end=new Date(today);end.setDate(end.getDate()+(6-end.getDay()));const start=new Date(end);start.setDate(start.getDate()-W*7+1);
  const by={};entries.forEach(e=>{(by[e.date]=by[e.date]||[]).push(e)});
  let cells='',mo='',lastM=-1,days=0,best=0,run=0;const mc=[0,0,0,0,0];const tk=ymd(today);
  for(let i=0;i<W*7;i++){const d=new Date(start);d.setDate(start.getDate()+i);const k=ymd(d),L=by[k],fut=d>today;
    if(d.getDay()===0&&d.getMonth()!==lastM){const col=Math.floor(i/7);if(col<W-1||lastM<0)mo+=`<span style="left:${(col/W*100).toFixed(2)}%">${d.getMonth()+1}月</span>`;lastM=d.getMonth()}
    let cls='',st='';if(L&&!fut){const m=Math.round(L.reduce((t,e)=>t+(e.mood??2),0)/L.length);cls=` on m${m}`;st=` style="--c:${MOOD_HEX[m]}"`;days++;L.forEach(e=>mc[e.mood??2]++);run++;best=Math.max(best,run)}else if(!fut)run=0;
    if(fut)cls+=' fut';if(k===tk)cls+=' today';if(k===fpSel)cls+=' sel';
    const mm=cls.match(/ m(\d)/);if(mm)st=st.replace('"',`"--col:${Math.floor(i/7)};`);cells+=`<i data-d="${k}" class="${cls.trim()}"${st}>${big&&mm?moon(+mm[1]):''}</i>`}
  const top=mc.indexOf(Math.max(...mc));
  const tipE=fpSel&&by[fpSel];
  box.innerHTML=`<div class="fp-stat"><span>寫了<b>${days}</b>天</span><span>最長連續<b>${best}</b>天</span>${days?`<span>最常是 ${moon(top)} ${MOODS[top].n}</span>`:''}</div>
    <div class="fp-wrap"><div class="fp-wd" aria-hidden="true"><span></span><span>一</span><span></span><span>三</span><span></span><span>五</span><span></span></div>
    <div><div class="fp-mo" aria-hidden="true">${mo}</div><div class="fp-grid${big?' big':''}" id="fpGrid" role="img" aria-label="${W>=26?'過去半年':`最近 ${W} 週`}有 ${days} 天寫了紀錄，點一下星星看那天的紀錄">${cells}</div></div></div>
    ${fpSel?(()=>{const d=parse(fpSel),dl=`${d.getMonth()+1}/${d.getDate()}（${WD[d.getDay()]}）`;
      if(!tipE)return `<div class="fp-tip empty"><i class="fp-es" aria-hidden="true"></i><span><b>${dl}</b><small>這天還沒有點亮星星</small></span><button type="button" id="fpGo">補寫 ›</button></div>`;
      const m=Math.round(tipE.reduce((t,e)=>t+(e.mood??2),0)/tipE.length),t0=tipE[0];
      return `<div class="fp-tip" style="--c:${MOOD_HEX[m]}">${moon(m,'big')}<span><b>${dl}・${MOODS[m].n}</b><small>${tipE.length>1?`${tipE.length} 則紀錄・`:''}${esc(t0.title||(t0.body||'').slice(0,24)||untitled(t0))}</small></span><button type="button" id="fpGo">查看 ›</button></div>`})()
      :`<div class="fp-leg">${by[tk]?'':'<button type="button" class="fp-cta" id="fpCta">今天還沒點亮，寫一則 ›</button>'}<span>星星＝當天心情</span>${[0,1,2,3,4].map(i=>moon(i)).join('')}</div>`}`;
  if($('fpCta'))$('fpCta').onclick=()=>openEditor();
  if(!reduce&&!fpIntroDone){const g=$('fpGrid');if('IntersectionObserver' in window){const io=new IntersectionObserver(es=>{if(es.some(x=>x.isIntersecting)){io.disconnect();fpIntroDone=true;g.classList.add('intro');setTimeout(()=>g.classList.remove('intro'),1800)}},{threshold:.4});io.observe(g)}}
  $('fpGrid').onclick=ev=>{const c=ev.target.closest('i[data-d]');if(!c||c.classList.contains('fut'))return;fpSel=fpSel===c.dataset.d?null:c.dataset.d;renderFootprint()};
  if($('fpGo'))$('fpGo').onclick=()=>{const k=fpSel,d=parse(k);const L=by[k]||[];
    if(!L.length){openEditor(null,false,k);return}
    if(L.length===1){openDetail(L[0].id);return}
    selDate=k;calMonth=new Date(d.getFullYear(),d.getMonth(),1);go('log','cal');renderCal();if(typeof renderCalDay==='function')renderCalDay()}}
