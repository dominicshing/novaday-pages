/* ---------- Data ---------- */
let entries=[];
function load(){try{entries=JSON.parse(localStorage.getItem(KEY)||'[]')||[]}catch(e){entries=[]}
  let s=false;try{s=!!localStorage.getItem(SEEDED)}catch(e){}
  if(!entries.length&&!s){seed();try{localStorage.setItem(SEEDED,'1')}catch(e){}}}
function save(){try{localStorage.setItem(KEY,JSON.stringify(entries));return true}catch(e){toast('儲存空間已滿，請移除部分照片後再試');return false}}
function seed(){const t=new Date(),a=n=>{const d=new Date(t);d.setDate(d.getDate()-n);return ymd(d)};
  entries=[
   {id:'s1',sample:1,date:a(1),time:'08:40',title:'第一次啟動日誌',body:'決定開始每天記錄一點東西。不求寫很多，只要讓未來的自己知道今天發生了什麼。早上的咖啡特別好喝。',mood:3,tags:['開始'],loc:'家',photo:null},
   {id:'s2',sample:1,date:a(2),time:'21:15',title:'雨天的夜間散步',body:'下班後雨剛停，街道反光像一條發亮的星河。邊走邊想接下來三個月想完成的事。',mood:2,tags:['散步','思考'],loc:'',photo:null},
   {id:'s3',sample:1,date:a(5),time:'13:05',title:'專案卡關',body:'花了一整個下午找一個小錯誤，最後發現是日期格式的問題。有點累，但解決的瞬間很痛快。',mood:1,tags:['工作'],loc:'辦公室',photo:null}];save()}

