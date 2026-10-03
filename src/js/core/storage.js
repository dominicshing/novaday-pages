/* 日記紀錄：讀取、儲存、第一次使用的範例紀錄 */
let entries=[];
function load(){try{entries=JSON.parse(localStorage.getItem(KEY)||'[]')||[]}catch(e){entries=[]}
  let s=false;try{s=!!localStorage.getItem(SEEDED)}catch(e){}
  if(!entries.length&&!s){seed();try{localStorage.setItem(SEEDED,'1')}catch(e){}}}
function save(){try{localStorage.setItem(KEY,JSON.stringify(entries.map(phPack)));return true}catch(e){toast('儲存空間已滿，請移除部分照片後再試');return false}}
function seed(){const t=new Date(),a=n=>{const d=new Date(t);d.setDate(d.getDate()-n);return ymd(d)},M=typeof SAMPLE_MEDIA!=='undefined'?SAMPLE_MEDIA:null;
  /* 範例影片：MP4 存進 IndexedDB（和使用者拍的影片一樣），紀錄只記 id、長度、封面 */
  const vid=(id,k,poster,dur)=>{if(!M||!M[k])return undefined;try{const b=atob(M[k]),u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);mediaPut(id,new Blob([u],{type:'video/mp4'})).catch(()=>{})}catch(e){return undefined}return{id,dur,poster:M[poster]}};
  const ph=k=>M&&M[k]||null;
  entries=[
   {id:'s1',sample:1,date:a(1),time:'08:40',title:'第一次啟動日誌',body:'決定開始每天記錄一點東西。不求寫很多，只要讓未來的自己知道今天發生了什麼。早上的咖啡特別好喝。',mood:3,tags:['開始'],loc:'家',photo:ph('coffee'),photoMore:ph('plant')?[ph('plant')]:undefined},
   {id:'s2',sample:1,date:a(2),time:'21:15',title:'雨天的夜間散步',body:'下班後雨剛停，街道反光像一條發亮的星河。邊走邊想接下來三個月想完成的事。',mood:2,tags:['散步','思考'],loc:'',photo:ph('rain')},
   {id:'s4',sample:1,date:a(3),time:'17:48',title:'海邊看夕陽',body:'臨時起意跑去海邊，剛好趕上太陽落進海裡。浪一直打上來，拍了一段影片留著。',mood:4,tags:['旅行','海邊'],loc:'淡水・沙崙海灘',photo:null,video:vid('vsamplesea','sea','posterSea',4)},
   {id:'s5',sample:1,date:a(4),time:'23:10',title:'加班後的城市',body:'走出辦公室已經快十一點，整座城市還亮著。抬頭看到一彎月亮掛在屋頂上，心情好一點了。',mood:1,tags:['工作','夜晚'],loc:'信義區',photo:ph('city'),photoMore:ph('moon')?[ph('moon')]:undefined},
   {id:'s3',sample:1,date:a(5),time:'13:05',title:'專案卡關',body:'花了一整個下午找一個小錯誤，最後發現是日期格式的問題。有點累，但解決的瞬間很痛快。',mood:1,tags:['工作'],loc:'辦公室',photo:null},
   {id:'s6',sample:1,date:a(7),time:'02:30',title:'第一次看到銀河',body:'半夜爬上山，關掉手電筒等眼睛適應黑暗，銀河就這樣慢慢出現。還看到一顆流星！',mood:4,tags:['觀星','旅行'],loc:'合歡山',photo:null,video:vid('vsamplemilky','milky','posterMilky',4)}];
  entries.forEach(e=>{Object.keys(e).forEach(k=>e[k]===undefined&&delete e[k]);if(e.video===undefined)delete e.video});save()}
