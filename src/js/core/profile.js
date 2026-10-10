/* 個人資料：讀取、舊版資料轉換、儲存；頭像顯示 */
/* 舊版 emoji 頭像自動換成最接近的新圖示 */
const AV_LEGACY={'🌙':'moon','⭐':'nova','🌟':'polaris','☄️':'comet','🔭':'scope','🦉':'owl','🦊':'fox','🐱':'cat','🐰':'rabbit','🐻':'whale','🧙':'galaxy','🧚':'nebula'};
const avSVG=k=>{const a=AVK[k]||AVK.moon;return `<svg class="ic av-svg" viewBox="0 0 48 48" aria-hidden="true" style="--dl:-${(a.i*.37%3).toFixed(2)}s">${a.s}</svg>`};
const PKEY='orbitlog.profile.v1',AVATARS=['const',...AVI.map(a=>a.k).filter(k=>k!=='const')];
let prof={avatar:'const',name:tl('星旅人'),ship:tl('晨星'),motto:tl('每天記下一點，累積成一整片星空。'),since:null,remind:false,remindTime:'21:00',calm:false};
try{Object.assign(prof,JSON.parse(localStorage.getItem(PKEY)||'{}'))}catch(e){}
/* 舊版（太空主題）預設值換成星座主題 */
if(prof.name==='駕駛員'||prof.name==='觀星者')prof.name='星旅人';
/* 預設暱稱不再和階級名稱「觀星者」重複 */
if(prof.ship==='晨星號')prof.ship='晨星';
if(['🧑‍🚀','👩‍🚀','👨‍🚀','🛸','🪐','👽','🤖'].includes(prof.avatar))prof.avatar='moon';
const PHOTO_RE=/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/;
if(AV_LEGACY[prof.avatar])prof.avatar=AV_LEGACY[prof.avatar];
if(prof.avatar==='photo'&&!(typeof prof.photoAv==='string'&&PHOTO_RE.test(prof.photoAv)))prof.avatar='moon';
if(prof.avatar!=='photo'&&!AVK[prof.avatar])prof.avatar='moon';
/* 型別不對的欄位（舊版或寫入中斷造成）改回預設值，避免整個 App 打不開；規則和匯入備份時相同 */
{const D={name:tl('星旅人'),ship:tl('晨星'),motto:tl('每天記下一點，累積成一整片星空。')},dt=v=>typeof v==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(v);
  for(const k in D)if(typeof prof[k]!=='string')prof[k]=D[k];
  if(prof.since!=null&&!dt(prof.since))prof.since=null;if(prof.birthday!=null&&!dt(prof.birthday))delete prof.birthday;
  if(prof.region!=null&&!(typeof prof.region==='object'&&typeof prof.region.name==='string'&&typeof prof.region.lat==='number'))prof.region=null;
  if(prof.livery!=null&&!(Number.isInteger(prof.livery)&&prof.livery>=0&&prof.livery<RINFO.length))prof.livery=null;
  if(prof.conOrder!=null)prof.conOrder=Array.isArray(prof.conOrder)?[...new Set(prof.conOrder.filter(k=>typeof k==='string'&&CON[k]))]:[];
  if(prof.nextPick!=null&&!(typeof prof.nextPick==='string'&&CON[prof.nextPick]))delete prof.nextPick;
  if(prof.achNew!=null&&!Array.isArray(prof.achNew))prof.achNew=[];
  if(typeof prof.remindTime!=='string'||!/^([01]\d|2[0-3]):[0-5]\d$/.test(prof.remindTime))prof.remindTime='21:00';
  if(prof.devXP!=null&&!Number.isFinite(prof.devXP))prof.devXP=0;
  if(prof.rating!=null&&!(Number.isInteger(prof.rating)&&prof.rating>=1&&prof.rating<=5))delete prof.rating}
/* 沒改過的預設暱稱、座右銘跟著介面語言換（存的可能是任一種語言的預設值） */
{const P={name:'星旅人',ship:'晨星',motto:'每天記下一點，累積成一整片星空。'};for(const k in P)if([P[k],zhs(P[k]),EN[P[k]]].includes(prof[k]))prof[k]=tl(P[k])}
/* 頭像顯示：emoji 或自訂照片（avatar==='photo' 時讀 photoAv） */
function avHTML(a,ph){ph=ph===undefined?prof.photoAv:ph;return a==='photo'&&ph?`<img class="av-img" src="${ph}" alt="">`:avSVG(a)}
const avLabel=a=>a==='photo'?tl('自訂照片'):(AVK[a]||AVK.moon).n;
function saveProf(){try{localStorage.setItem(PKEY,JSON.stringify(prof))}catch(e){toast(tl('無法儲存個人資料，照片可能太大'))}}
let reduce=sysReduce||!!prof.calm,skyApi={start(){},still(){}};
