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
  if('tz' in e&&!tzOK(e.tz))delete e.tz;
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
   {id:'s1',sample:1,date:a(1),time:'08:40',title:'第一次啟動日誌',body:'決定開始每天記錄一點東西。不求寫很多，只要讓未來的自己知道今天發生了什麼。早上泡了一壺花茶，配一塊小點心，慢慢喝完才出門。',mood:3,tags:['開始'],loc:'家',photo:ph('tea'),photoMore:ph('teatime')?[ph('teatime')]:undefined},
   {id:'s2',sample:1,date:a(3),time:'10:20',title:'巷口新開的咖啡店',body:'巷口新開了一家咖啡店，點了一杯卡布奇諾。店員拉花的時候忍不住拍了下來，奶泡很綿，味道也很好。',mood:3,tags:['咖啡'],loc:'巷口咖啡店',photo:null,video:vid('vsamplelatte','latte','posterLatte',4)},
   {id:'s3',sample:1,date:a(6),time:'16:10',title:'窗邊的小貓',body:'午後的陽光照進來，牠一直趴在窗邊看外面的鳥，耳朵動來動去，偶爾回頭看我一眼。',mood:4,tags:['貓','家'],loc:'家',photo:null,video:vid('vsamplecat','cat','posterCat',4)},
   {id:'s4',sample:1,date:a(9),time:'17:20',title:'臨時起意去海邊',body:'臨時起意跑去海邊，沙灘上幾乎沒有人。浪一層一層打上來，待到太陽快下山才離開。',mood:4,tags:['旅行','海邊'],loc:'淡水・沙崙海灘',photo:ph('sand'),video:vid('vsamplewaves','waves','posterWaves',4)},
   {id:'s5',sample:1,date:a(12),time:'12:30',title:'公園野餐',body:'和朋友約在公園野餐，每個人帶一道菜。鋪上藍白格子野餐墊，水果和麵包擺滿一整桌，聊到太陽都斜了。',mood:4,tags:['野餐','朋友'],loc:'大安森林公園',photo:ph('berries'),video:vid('vsamplepicnic','picnic','posterPicnic',4)},
   {id:'s6',sample:1,date:a(15),time:'11:50',title:'睡到自然醒的星期天',body:'什麼都沒安排，睡到快中午才起床。泡了一杯咖啡窩在床上看詩集，貓在旁邊睡得好熟。偶爾這樣慢下來也很好。',mood:2,tags:['休息','閱讀'],loc:'家',photo:ph('bed'),photoMore:ph('kitten')?[ph('kitten')]:undefined},
   {id:'s7',sample:1,date:a(18),time:'09:30',title:'週末的手沖咖啡',body:'終於學會用手沖壺慢慢繞圈注水，看著咖啡粉一點一點膨脹起來，整個早上都很安靜。',mood:3,tags:['咖啡'],loc:'家',photo:null,video:vid('vsamplepour','pour','posterPour',4)},
   {id:'s8',sample:1,date:a(21),time:'14:20',title:'去看櫻花',body:'櫻花開了，趁平日人少去走走。風一吹花瓣就飄下來，抬頭是整片粉紅色的天空。',mood:4,tags:['賞花','散步'],loc:'陽明山',photo:ph('sakura'),video:vid('vsampleblossom','blossom','posterBlossom',4)},
   {id:'s9',sample:1,date:a(24),time:'20:40',title:'小貓鑽進草帽',body:'剛買的草帽放在沙發上，一轉頭就被牠佔走了。窩在裡面東張西望，完全不打算出來。',mood:4,tags:['貓'],loc:'家',photo:null,video:vid('vsamplehat','hat','posterHat',4)},
   {id:'s10',sample:1,date:a(28),time:'15:00',title:'海邊吊床上看書',body:'躺在海邊的吊床上看了一下午的書。海風很舒服，看幾頁就抬頭看看海，書反而沒看多少。',mood:4,tags:['旅行','閱讀'],loc:'綠島',photo:null,video:vid('vsamplehammock','hammock','posterHammock',4)},
   {id:'s11',sample:1,date:a(29),time:'18:05',title:'金色的夕陽',body:'旅行的第一天，傍晚坐在沙灘上看夕陽，整片海都被染成金色。什麼都不想，就這樣看到天黑。',mood:4,tags:['旅行','夕陽'],loc:'綠島',photo:null,video:vid('vsamplesunset','sunset','posterSunset',4)},
   {id:'s12',sample:1,date:a(32),time:'06:10',title:'清晨的熱氣球',body:'一大早起床去看熱氣球。太陽剛出來，熱氣球慢慢升空，倒影映在湖面上，像在作夢一樣。',mood:4,tags:['旅行'],loc:'台東・鹿野',photo:ph('balloon')}];
  entries.forEach(e=>{Object.keys(e).forEach(k=>e[k]===undefined&&delete e[k]);if(e.video===undefined)delete e.video});save()}
