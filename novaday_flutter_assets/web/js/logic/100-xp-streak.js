/* ---------- Game logic ---------- */
/* XP 規則：獎勵「持續」與「回顧」，不看字數
   每天第一則 +20，連續加成每天 +2（上限 +20）；同一天其他紀錄 +5；照片 +5、地點 +5、回答今日星語 +10；回顧 7 天前的紀錄每則 +5（一次） */
const XP={first:20,extra:5,photo:5,loc:5,prompt:10,review:5,step:2,cap:20};
const RKEY='orbitlog.reviews.v1';let reviews={ids:{},last:null};
try{Object.assign(reviews,JSON.parse(localStorage.getItem(RKEY)||'{}'))}catch(e){}
function saveReviews(){try{localStorage.setItem(RKEY,JSON.stringify(reviews))}catch(e){}}
function xpMap(list){const m=new Map(),by={};list.forEach(e=>{(by[e.date]=by[e.date]||[]).push(e)});const days=new Set(Object.keys(by));
  for(const k in by){const es=by[k].slice().sort((a,b)=>((a.time||'')+a.id).localeCompare((b.time||'')+b.id));
    const bonus=Math.min(XP.cap,Math.max(0,streakInfo(days,parse(k)).n-1)*XP.step);
    es.forEach((e,i)=>{const extra=(e.photo?XP.photo:0)+(e.loc?XP.loc:0)+(e.prompt?XP.prompt:0);
      m.set(e.id,{total:(i?XP.extra:XP.first+bonus)+extra,bonus:i?0:bonus,first:!i})})}
  return m}
const reviewXP=l=>Object.keys(reviews.ids||{}).filter(id=>l.some(e=>e.id===id)).length*XP.review;
const totalXP=l=>{let s=0;xpMap(l).forEach(v=>s+=v.total);return s+reviewXP(l)};
let XPM=new Map();const xpOf=e=>(XPM.get(e.id)||{total:0}).total;
function levelInfo(xp){let lv=1,need=100,rest=xp;while(rest>=need){rest-=need;lv++;need=100+50*(lv-1)}return{lv,rest,need}}
const rankOf=lv=>RANKS[Math.min(RANKS.length-1,Math.floor((lv-1)/2))];
const weekKey=d=>{const t=new Date(d.getFullYear(),d.getMonth(),d.getDate());t.setDate(t.getDate()-t.getDay());return ymd(t)}; /* R34：一週從星期日開始，和月曆一致 */
/* 連續規則：每週（週一到週日）可休息 1 天不中斷；連續兩天沒寫才歸零 */
/* R17：改用整數日序計算（原本每步都組日期字串，紀錄多時非常慢）；規則完全相同 */
const dnOf=d=>Math.round(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())/864e5);
const dnYmd=n=>{const d=new Date(n*864e5);return d.getUTCFullYear()+'-'+pad(d.getUTCMonth()+1)+'-'+pad(d.getUTCDate())};
const dnWeek=n=>n-((n+4)%7+7)%7; /* 週日為一週的開始 */
const DN_CACHE=new WeakMap();
function dnSet(days){let s=DN_CACHE.get(days);if(s&&s._n===days.size)return s;s=new Set();days.forEach(k=>s.add(dnOf(parse(k))));s._n=days.size;DN_CACHE.set(days,s);return s}
function streakInfo(days,end){const S=dnSet(days),today=dnOf(new Date());let d=dnOf(end),n=0,pending=null,pendDay=null;const used=new Set(),restDays=[];
  if(d===today&&!S.has(d))d--;
  for(let i=0;i<5000;i++){
    if(S.has(d)){if(pending!==null){used.add(pending);restDays.push(dnYmd(pendDay));pending=null}n++}
    else{const w=dnWeek(d);if(pending!==null||used.has(w))break;pending=w;pendDay=d}
    d--}
  return{n,restUsed:used.has(dnWeek(today)),restDays}}
const streakOf=l=>streakInfo(new Set(l.map(e=>e.date)),new Date());
let BS_MEMO={k:null,v:0};
function bestStreak(l){const days=new Set(l.map(e=>e.date));const key=[...days].sort().join();if(BS_MEMO.k===key)return BS_MEMO.v;let b=0;days.forEach(s=>{b=Math.max(b,streakInfo(days,parse(s)).n)});BS_MEMO={k:key,v:b};return b}
function maxMonthDays(l){const m={};new Set(l.map(e=>e.date)).forEach(d=>{const k=d.slice(0,7);m[k]=(m[k]||0)+1});return Math.max(0,...Object.values(m))}
