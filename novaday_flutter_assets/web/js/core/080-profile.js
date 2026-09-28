/* 舊版 emoji 頭像自動換成最接近的新圖示 */
const AV_LEGACY={'🌙':'moon','⭐':'nova','🌟':'polaris','☄️':'comet','🔭':'scope','🦉':'owl','🦊':'fox','🐱':'cat','🐰':'rabbit','🐻':'whale','🧙':'galaxy','🧚':'nebula'};
const avSVG=k=>{const a=AVK[k]||AVK.moon;return `<svg class="ic av-svg" viewBox="0 0 48 48" aria-hidden="true" style="--dl:-${(a.i*.37%3).toFixed(2)}s">${a.s}</svg>`};
const PKEY='orbitlog.profile.v1',AVATARS=['const',...AVI.map(a=>a.k).filter(k=>k!=='const')];
let prof={avatar:'const',name:'星旅人',ship:'晨星',motto:'每天記下一點，累積成一整片星空。',since:null,remind:false,remindTime:'21:00',calm:false};
try{Object.assign(prof,JSON.parse(localStorage.getItem(PKEY)||'{}'))}catch(e){}
/* 舊版（太空主題）預設值換成星座主題 */
if(prof.name==='駕駛員'||prof.name==='觀星者')prof.name='星旅人'; /* 預設暱稱不再和階級名稱「觀星者」重複 */if(prof.ship==='晨星號')prof.ship='晨星';if(['🧑‍🚀','👩‍🚀','👨‍🚀','🛸','🪐','👽','🤖'].includes(prof.avatar))prof.avatar='moon';
const PHOTO_RE=/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/;
if(AV_LEGACY[prof.avatar])prof.avatar=AV_LEGACY[prof.avatar];
if(prof.avatar==='photo'&&!(typeof prof.photoAv==='string'&&PHOTO_RE.test(prof.photoAv)))prof.avatar='moon';
if(prof.avatar!=='photo'&&!AVK[prof.avatar])prof.avatar='moon';
/* 頭像顯示：emoji 或自訂照片（avatar==='photo' 時讀 photoAv） */
function avHTML(a,ph){ph=ph===undefined?prof.photoAv:ph;return a==='photo'&&ph?`<img class="av-img" src="${ph}" alt="">`:avSVG(a)}
const avLabel=a=>a==='photo'?'自訂照片':(AVK[a]||AVK.moon).n;
function saveProf(){try{localStorage.setItem(PKEY,JSON.stringify(prof))}catch(e){toast('無法儲存個人資料，照片可能太大')}}
let reduce=sysReduce||!!prof.calm,skyApi={start(){},still(){}};
function fmtDay(s){const d=parse(s);return (d.getMonth()+1)+' 月 '+d.getDate()+' 日・星期'+WD[d.getDay()]}

