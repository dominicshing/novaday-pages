/* ---------- 星曆：真實月相、新星座開始日、流星雨、本月夜空 ---------- */
const SYN=29.530588853;
function moonAge(d){const jd=d.getTime()/864e5+2440587.5;return(((jd-2451550.1)/SYN)%1+1)%1} /* 0＝新月，0.5＝滿月 */
function moonInfo(k){const d=parse(k);d.setHours(21);const a=moonAgeTrue(d),ill=(1-Math.cos(2*Math.PI*a))/2;
  const names=['新月','眉月','上弦月','盈凸月','滿月','虧凸月','下弦月','殘月'],idx=Math.floor((a*8+.5))%8;
  const ev=lunarEvents(+k.slice(0,4))[k];let name=names[idx];if(idx===0)name=a<.5?'眉月':'殘月';if(idx===4)name=a<.5?'盈凸月':'虧凸月';
  /* 名稱、亮度百分比、月曆標記用同一個依據（真實滿月／新月發生的日期），不會出現「盈凸月・100%」的矛盾 */
  const isNew=ev==='n',isFull=ev==='f',pct=isFull?100:isNew?0:Math.min(99,Math.max(1,Math.round(ill*100)));
  const sh=n=>{const x=parse(k);x.setDate(x.getDate()+n);const y=ymd(x);return lunarEvents(+y.slice(0,4))[y]},nx=sh(1),pv=sh(-1);
  const hint=isFull||isNew?'':nx==='f'?'明天滿月':nx==='n'?'明天新月':pv==='f'?'昨天滿月':pv==='n'?'昨天新月':'';
  return{a,ill,pct,hint,name:isFull?'滿月':isNew?'新月':name,isNew,isFull}}
/* 新月／滿月的精確時刻（Meeus《天文算法》第 49 章，誤差約數分鐘），換算成裝置所在時區的日期 */
const LUN={};
function lunarEvents(Y){if(LUN[Y])return LUN[Y];const out={},R=Math.PI/180,s=x=>Math.sin(x*R);
  for(let k0=Math.floor((Y-2000)*12.3685)-2;k0<=Math.floor((Y+1-2000)*12.3685)+2;k0++)for(const ph of[0,.5]){const k=k0+ph,T=k/1236.85,E=1-.002516*T;
    const M=2.5534+29.1053567*k,Mp=201.5643+385.81693528*k+.0107582*T*T,F=160.7108+390.67050284*k,Om=124.7746-1.56375588*k;
    const c=ph?[-.40614,.17302,.01614,.01043,.00734,-.00515,.00209]:[-.40720,.17241,.01608,.01039,.00739,-.00514,.00208];
    let jd=2451550.09766+29.530588861*k+.00015437*T*T+c[0]*s(Mp)+c[1]*E*s(M)+c[2]*s(2*Mp)+c[3]*s(2*F)+c[4]*E*s(Mp-M)+c[5]*E*s(Mp+M)+c[6]*E*E*s(2*M)
      -.00111*s(Mp-2*F)-.00057*s(Mp+2*F)+.00056*E*s(2*Mp+M)-.00042*s(3*Mp)+.00042*E*s(M+2*F)+.00038*E*s(M-2*F)-.00024*E*s(2*Mp-M)-.00017*s(Om);
    const d=new Date((jd-2440587.5)*864e5);if(d.getFullYear()===Y){out[ymd(d)]=ph?'f':'n';(out._ev=out._ev||[]).push([d.getTime(),ph])}}
  return LUN[Y]=out}
/* 以前後兩個真實月相（新月 0、滿月 0.5）分段計算月齡 */
function moonAgeTrue(d){const Y=d.getFullYear(),t=d.getTime(),ev=[Y-1,Y,Y+1].flatMap(y=>lunarEvents(y)._ev||[]).sort((a,b)=>a[0]-b[0]);
  for(let i=1;i<ev.length;i++)if(t>=ev[i-1][0]&&t<ev[i][0]){const a0=ev[i-1][1],a1=ev[i][1]||1;return a0+(a1-a0)*(t-ev[i-1][0])/(ev[i][0]-ev[i-1][0])}
  return moonAge(d)}
function moonSVG(a,cls=''){const ill=(1-Math.cos(2*Math.PI*a))/2,r=6.5,rx=(r*Math.abs(1-2*ill)).toFixed(2),wax=a<.5;
  const lit=ill<.02?'':`<path d="M0 ${-r}A${r} ${r} 0 0 1 0 ${r}A${rx} ${r} 0 0 ${ill>.5?1:0} 0 ${-r}Z" fill="#F4ECD0" transform="${wax?'':'scale(-1 1)'}"/>`;
  return `<svg class="moon ${cls}" viewBox="-8 -8 16 16" aria-hidden="true"><circle r="${r}" fill="#2A2F5C" stroke="#8E94C4" stroke-width=".6"/>${lit}</svg>`}
/* 流星雨極大期（每年日期大致固定，實際可能相差一兩天） */
const METEORS=[[1,4,'象限儀座流星雨'],[4,22,'天琴座流星雨'],[5,6,'水瓶座η流星雨'],[7,30,'水瓶座δ流星雨'],[8,12,'英仙座流星雨'],[10,8,'天龍座流星雨'],[10,21,'獵戶座流星雨'],[11,17,'獅子座流星雨'],[12,14,'雙子座流星雨'],[12,22,'小熊座流星雨']];
function dayEvents(k){const[,m,d]=k.split('-').map(Number),ev=[],mi=moonInfo(k);
  const z=ZODIAC.findIndex(z=>z.d[0]===m&&z.d[1]===d);if(z>=0)ev.push({t:'z',g:zg(z),s:`今天起是${ZODIAC[z].n}（${zRange(z)}）`,short:zg(z)});
  METEORS.forEach(([a,b,n])=>{if(a===m&&b===d)ev.push({t:'m',g:'☄',s:`${n}極大期（約）`,short:'☄'})});
  if(mi.isFull)ev.push({t:'f',g:'',s:'滿月',short:''});if(mi.isNew)ev.push({t:'n',g:'',s:'新月，適合觀星',short:''});
  return{ev,mi}}
const calStar=(c,big,i)=>`<svg class="cs${big?' big':''}" viewBox="-10 -10 20 20" aria-hidden="true"><g class="mst mst${i??2}" style="animation-delay:${(-(MSTN++%9)*.43).toFixed(2)}s"><path d="${sp4(0,0,9)}" fill="${c}"/><circle r="2.2" fill="#fff"/></g></svg>`;
let calAnimDir='';
function renderCal(){const Y=calMonth.getFullYear(),M=calMonth.getMonth(),first=new Date(Y,M,1).getDay(),dim=new Date(Y,M+1,0).getDate(),today=ymd(new Date());
  const by={};entries.forEach(e=>{(by[e.date]=by[e.date]||[]).push(e)});
  const mk=d=>Y+'-'+pad(M+1)+'-'+pad(d),days=[];for(let d=1;d<=dim;d++)if(by[mk(d)])days.push(d);
  /* 本月統計 */
  const monthEs=days.flatMap(d=>by[mk(d)]),cnt=[0,0,0,0,0];monthEs.forEach(e=>cnt[e.mood??2]++);const top=monthEs.length?cnt.lastIndexOf(Math.max(...cnt)):-1;
  let best=0,run=0;for(let d=1;d<=dim;d++){if(by[mk(d)]){run++;best=Math.max(best,run)}else run=0}
  const isNow=Y===new Date().getFullYear()&&M===new Date().getMonth();$('calToday').hidden=logView!=='cal'||(isNow&&selDate===today);
  let g=`<div class="cal-head"><button class="icon-btn" id="prevM" aria-label="上個月"><svg viewBox="0 0 24 24"><path d="M15 6l-6 6 6 6"/></svg></button>
    <div class="cal-title"><strong>${Y} 年 ${M+1} 月</strong><small>${isNow?'這個月':'左右滑動切換月份'}</small></div>
    <button class="icon-btn" id="nextM" aria-label="下個月"><svg viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg></button></div>
    <div class="cal-sum"><div><b>${days.length}<i> / ${dim}</i></b><small>本月寫了幾天</small></div><div><b>${best}<i> 天</i></b><small>本月最長連續</small></div>
      <div><b class="cs-mood">${top<0?'—':moon(top)+'<span>'+MOODS[top].n+'</span>'}</b><small>本月最常的心情</small></div></div>
    ${days.length?`<button type="button" class="cal-rp" id="calRp">查看 ${M+1} 月星空報告 ›</button>`:''}
    <div class="cal panel ${calAnimDir}" id="calGrid" role="grid" aria-label="${Y} 年 ${M+1} 月">`;
  WD.forEach((w,i)=>g+=`<div class="dow${i===0||i===6?' we':''}">${w}</div>`);for(let i=0;i<first;i++)g+='<button class="cell" disabled></button>';
  for(let d=1;d<=dim;d++){const k=mk(d),es=by[k],avg=es?Math.round(es.reduce((s,e)=>s+(e.mood??2),0)/es.length):0,{ev,mi}=dayEvents(k),fut=k>today;
    const mark=ev.map(x=>x.t==='f'?moonSVG(.5):x.t==='n'?moonSVG(0):x.short).join('');
    const lab=`${M+1} 月 ${d} 日${es?`，${es.length} 則紀錄，心情${MOODS[avg].n}`:''}${ev.length?'，'+ev.map(x=>x.s).join('、'):''}`;
    g+=`<button class="cell${es?' has':''}${k===today?' today':''}${fut?' future':''}" data-d="${k}" aria-pressed="${k===selDate}" aria-label="${lab}" style="--dot:var(${MOODS[avg].c})">
      ${mark?`<span class="ev">${mark}</span>`:''}${es&&es.length>1?`<span class="cnt">×${es.length}</span>`:''}<span class="n">${d}</span>${es?calStar(`var(${MOODS[avg].c})`,es.length>1,avg):''}</button>`}
  g+=`<svg class="cal-lines" id="calLines" aria-hidden="true"></svg></div>
    <div class="cal-legend"><span>${calStar('#8E94C4')}有紀錄・顏色是心情</span><span>${moonSVG(.5)}滿月</span><span>${moonSVG(0)}新月</span><span>☄ 流星雨</span><span>${zg(6)} 新星座開始</span></div>`;
  $('calView').innerHTML=g;calAnimDir='';if($('calRp'))$('calRp').onclick=()=>openReport(Y,M);
  /* 把本月連續的紀錄日連成星座線（相隔 3 天以內） */
  calDays=days;requestAnimationFrame(drawCalLines);
  function _unused(){const grid=$('calGrid'),svg=$('calLines');if(!grid)return;const gr=grid.getBoundingClientRect(),sc=gr.width/grid.offsetWidth||1;
    const pos=d=>{const c=grid.querySelector(`.cell[data-d="${mk(d)}"] .cs`);if(!c)return null;const r=c.getBoundingClientRect();return[(r.left+r.width/2-gr.left)/sc,(r.top+r.height/2-gr.top)/sc]};
    const LC=RINFO[shipLiv()].c;let l='';
    for(let i=1;i<days.length;i++){if(days[i]-days[i-1]>3)continue;const a=pos(days[i-1]),b=pos(days[i]);if(!a||!b)continue;
      l+=`<line pathLength="1" x1="${a[0].toFixed(1)}" y1="${a[1].toFixed(1)}" x2="${b[0].toFixed(1)}" y2="${b[1].toFixed(1)}" stroke="${LC}" stroke-opacity=".55" stroke-width="1.3" style="animation-delay:${(i*.06).toFixed(2)}s"/>`}
    svg.innerHTML=l}
  const go2=dir=>{calMonth.setMonth(calMonth.getMonth()+dir);calAnimDir=dir>0?'slide-l':'slide-r';renderCal()};
  $('prevM').onclick=()=>go2(-1);$('nextM').onclick=()=>go2(1);
  $('calView').querySelectorAll('.cell[data-d]').forEach(c=>c.onclick=()=>{selDate=c.dataset.d;renderCal()});
  /* 左右滑動切換月份 */
  {const grid=$('calGrid');let sx=null,sy=0;grid.addEventListener('pointerdown',e=>{sx=e.clientX;sy=e.clientY});
    grid.addEventListener('pointerup',e=>{if(sx==null)return;const dx=e.clientX-sx,dy=e.clientY-sy;sx=null;if(Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy)*1.5){go2(dx<0?1:-1)}});
    grid.addEventListener('pointercancel',()=>sx=null)}
  renderCalDay()}
let calDays=[];
/* 把同一週裡相近的紀錄日連成星座線；星曆頁顯示時才能量到格子位置 */
function drawCalLines(){const grid=$('calGrid'),svg=$('calLines');if(!grid||!grid.offsetWidth)return;const gr=grid.getBoundingClientRect(),sc=gr.width/grid.offsetWidth||1;
  const Y=calMonth.getFullYear(),M=calMonth.getMonth(),mk=d=>Y+'-'+pad(M+1)+'-'+pad(d),days=calDays;
  const pos=d=>{const c=grid.querySelector(`.cell[data-d="${mk(d)}"] .cs`);if(!c)return null;const r=c.getBoundingClientRect();return[(r.left+r.width/2-gr.left)/sc,(r.top+r.height/2-gr.top)/sc]};
  const LC=RINFO[shipLiv()].c;let l='';
  for(let i=1;i<days.length;i++){if(days[i]-days[i-1]>2)continue;const a=pos(days[i-1]),b=pos(days[i]);if(!a||!b||Math.abs(a[1]-b[1])>4)continue; /* 同一週、最多跳過一天才相連 */
    l+=`<line pathLength="1" x1="${a[0].toFixed(1)}" y1="${a[1].toFixed(1)}" x2="${b[0].toFixed(1)}" y2="${b[1].toFixed(1)}" stroke="${LC}" stroke-opacity=".6" stroke-width="1.4" style="animation-delay:${(i*.06).toFixed(2)}s;filter:drop-shadow(0 0 2px ${LC})"/>`}
  svg.innerHTML=l}
addEventListener('resize',()=>{if(cur==='log'&&logView==='cal')drawCalLines()});
function renderCalDay(){const k=selDate,today=ymd(new Date()),fut=k>today,{ev,mi}=dayEvents(k),list=sorted().filter(e=>e.date===k);
  const diff=Math.round((parse(k)-parse(today))/864e5),rel=diff===0?'今天':diff===-1?'昨天':diff===1?'明天':diff<0?`${-diff} 天前`:`${diff} 天後`;
  let g=`<div class="dp"><div class="dp-h"><div><strong>${esc(fmtDay(k))}</strong><small>${rel}${list.length?`・${list.length} 則紀錄`:''}</small></div>
    <div class="dp-moon"><span><b>${mi.name}${mi.hint?`・${mi.hint}`:''}</b>月面亮 ${mi.pct}%</span>${moonSVG(mi.a)}</div></div>`;
  if(ev.length)g+=`<div class="dp-ev">${ev.map(x=>`<span>${x.t==='f'?moonSVG(.5):x.t==='n'?moonSVG(0):x.g} ${x.s}</span>`).join('')}</div>`;
  if(list.length)g+=`<div class="dp-list">${list.map(entryCard).join('')}</div>`;
  else if(fut)g+=`<div class="dp-empty es">${emptyState('這天還沒到',ev.length?'記得那天抬頭看看夜空 ✦':'')}</div>`;
  else g+=`<div class="dp-empty es">${emptyState(diff===0?'今天還沒有紀錄':'這天沒有紀錄',diff===0?'點亮今天的星星吧。':'想補寫一則嗎？',`<button type="button" class="btn primary" id="calWrite">${diff===0?'寫下今天':'補寫這天的紀錄'}</button>`)}</div>`;
  $('calDay').innerHTML=g+'</div>';bindCards($('calDay'));
  if($('calWrite'))$('calWrite').onclick=()=>openEditor(null,false,k)}
$('calToday').onclick=()=>{calMonth=new Date();calMonth.setDate(1);selDate=ymd(new Date());renderCal()};
