/* 日記紀錄：讀取、儲存、第一次使用的範例紀錄 */
let entries=[];
/* 讀取時修正格式不對的紀錄（舊版程式或寫入中斷造成），避免一筆壞資料讓整個 App 打不開。
   不刪任何東西：只要有修改或修不好（不是物件、沒有正確日期），原始內容先完整存到 BROKEN 留底 */
const BROKEN='orbitlog.entries.broken.v1';
const okDate=d=>typeof d==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(d)&&(x=>!isNaN(x)&&ymd(x)===d)(parse(d));
function fixEntry(o,seen){if(!o||typeof o!=='object'||Array.isArray(o)||!okDate(o.date))return null;
  const e=Object.assign({},o),str=v=>typeof v==='string'?v:typeof v==='number'?String(v):'';
  let id=str(e.id);if(!id||seen.has(id))id=(id||'e')+'-'+Math.random().toString(36).slice(2,8);seen.add(id);e.id=id;
  /* 欄位不存在就保持不存在（程式各處都有預設值），只修正型別或內容錯誤的 */
  if(e.time!=null&&!(typeof e.time==='string'&&/^([01]\d|2[0-3]):[0-5]\d$/.test(e.time)))e.time='';
  if(e.mood!=null&&!(Number.isInteger(e.mood)&&e.mood>=0&&e.mood<=4)){const m=typeof e.mood==='string'&&e.mood.trim()?Number(e.mood):NaN;e.mood=Number.isInteger(m)&&m>=0&&m<=4?m:2}
  for(const k of ['title','body','loc'])if(e[k]!=null&&typeof e[k]!=='string')e[k]=str(e[k]);
  if(e.tags!=null&&!(Array.isArray(e.tags)&&e.tags.every(t=>typeof t==='string')))e.tags=Array.isArray(e.tags)?e.tags.filter(t=>typeof t==='string'&&t.trim()):typeof e.tags==='string'&&e.tags.trim()?[e.tags]:[];
  if(e.photo!=null&&typeof e.photo!=='string')e.photo=null;
  if('photoMore' in e){const a=Array.isArray(e.photoMore)?e.photoMore.filter(x=>typeof x==='string'):[];if(a.length)e.photoMore=a;else delete e.photoMore}
  if('video' in e&&!(e.video&&typeof e.video==='object'&&typeof e.video.id==='string'))delete e.video;
  return e}
function load(){let raw=null;try{raw=localStorage.getItem(KEY)}catch(e){}
  let list=[];if(raw){try{list=JSON.parse(raw)}catch(e){list=null}}
  const seen=new Set(),fixed=Array.isArray(list)?list.map(o=>fixEntry(o,seen)).filter(Boolean):[];
  if(raw&&(!Array.isArray(list)||fixed.length!==list.length||fixed.some((e,i)=>JSON.stringify(e)!==JSON.stringify(list[i])))){
    try{localStorage.setItem(BROKEN,raw)}catch(e){}console.warn('Novaday：有紀錄的格式不正確，已修正；原始資料留在 '+BROKEN)}
  entries=fixed;
  let s=false;try{s=!!localStorage.getItem(SEEDED)}catch(e){}
  if(!entries.length&&!s){seed();try{localStorage.setItem(SEEDED,'1')}catch(e){}}}
function save(){try{localStorage.setItem(KEY,JSON.stringify(entries.map(phPack)));return true}catch(e){toast('儲存空間已滿，請移除部分照片後再試');return false}}
function seed(){const t=new Date(),a=n=>{const d=new Date(t);d.setDate(d.getDate()-n);return ymd(d)},M=typeof SAMPLE_MEDIA!=='undefined'?SAMPLE_MEDIA:null;
  /* 範例影片：MP4 存進 IndexedDB（和使用者拍的影片一樣），紀錄只記 id、長度、封面 */
  const vid=(id,k,poster,dur)=>{if(!M||!M[k])return undefined;try{const b=atob(M[k]),u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);mediaPut(id,new Blob([u],{type:'video/mp4'})).catch(()=>{})}catch(e){return undefined}return{id,dur,poster:M[poster]}};
  const ph=k=>M&&M[k]||null;
  entries=[
   {id:'s1',sample:1,date:a(1),time:'22:40',title:'第一次啟動日誌',body:'決定開始每天記錄一點東西。不求寫很多，只要讓未來的自己知道今天發生了什麼。晚上把望遠鏡搬上頂樓看星星，還學會用旋轉星盤找星座。',mood:3,tags:['開始','觀星'],loc:'家・頂樓',photo:ph('tele'),photoMore:ph('chart')?[ph('chart')]:undefined},
   {id:'s2',sample:1,date:a(2),time:'21:15',title:'雨天的夜間散步',body:'下班後雨剛停，街道反光像一條發亮的星河。邊走邊想接下來三個月想完成的事。',mood:2,tags:['散步','思考'],loc:'',photo:ph('rain')},
   {id:'s4',sample:1,date:a(3),time:'17:48',title:'海邊看夕陽',body:'臨時起意跑去海邊，剛好趕上太陽落進海裡。整片天空被染成紅色，拍了一段影片留著。',mood:4,tags:['旅行','海邊'],loc:'淡水・沙崙海灘',photo:null,video:vid('vsamplesea','sea','posterSea',4)},
   {id:'s5',sample:1,date:a(4),time:'23:10',title:'加班後的城市',body:'走出辦公室已經快十一點，整座城市還亮著。抬頭看到一彎月亮掛在屋頂上，心情好一點了。',mood:1,tags:['工作','夜晚'],loc:'信義區',photo:ph('city'),photoMore:ph('tower')?[ph('tower')]:undefined},
   {id:'s3',sample:1,date:a(5),time:'13:05',title:'專案卡關',body:'花了一整個下午找一個小錯誤，最後發現是日期格式的問題。有點累，但解決的瞬間很痛快。',mood:1,tags:['工作'],loc:'辦公室',photo:null},
   {id:'s6',sample:1,date:a(7),time:'02:30',title:'第一次看到銀河',body:'半夜爬上山，關掉手電筒等眼睛適應黑暗，銀河就這樣慢慢出現。還看到一顆流星！',mood:4,tags:['觀星','旅行'],loc:'合歡山',photo:null,video:vid('vsamplemilky','milky','posterMilky',4)}];
  entries.forEach(e=>{Object.keys(e).forEach(k=>e[k]===undefined&&delete e[k]);if(e.video===undefined)delete e.video});save()}
