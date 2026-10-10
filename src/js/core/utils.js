/* 共用小工具：$、日期格式、跳脫 HTML、字數、延遲、震動回饋、系統的減少動態設定 */
const WD=EN_UI?['S','M','T','W','T','F','S']:['日','一','二','三','四','五','六'];
/* 英文的月份與星期名稱；中文介面用「10月」「星期六」 */
const MON_EN=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],MONL_EN=['January','February','March','April','May','June','July','August','September','October','November','December'],WDS_EN=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],WDL_EN=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const wdLong=i=>EN_UI?WDL_EN[i]:tlz('星期')+WD[i],wdShort=i=>EN_UI?WDS_EN[i]:tlz('週')+WD[i];
/* 年月標題：2026 年 10 月／October 2026；只有月份：10 月／October */
const fmtYM=(y,m)=>EN_UI?`${MONL_EN[m-1]} ${y}`:`${y} 年 ${m} 月`,fmtM=m=>EN_UI?MONL_EN[m-1]:`${m} 月`;
/* 時間顯示：預設 12 小時制（上午 9:05／下午 9:30），設定可改成 24 小時制（prof.clock24）。資料一律存 24 小時制 HH:MM */
const fmtTime=t=>{if(!t)return '';if(typeof prof!=='undefined'&&prof.clock24)return t;const[h,m]=t.split(':').map(Number);return isNaN(h)?t:EN_UI?`${h%12||12}:${String(m).padStart(2,'0')} ${h<12?'AM':'PM'}`:`${tlz(h<12?'上午':'下午')} ${h%12||12}:${String(m).padStart(2,'0')}`};
/* 時區：新紀錄存下寫的當下裝置的時區（IANA 名稱，例如 Asia/Taipei）。date、time 仍是當地時間，不依時區換算；
   只在紀錄的時區和現在裝置的時差不同時，詳情頁才提示「寫的時候是哪個時區」 */
const devTZ=()=>{try{return Intl.DateTimeFormat().resolvedOptions().timeZone||''}catch(e){return ''}};
const tzOK=z=>typeof z==='string'&&/^[A-Za-z][\w+\-/]{0,63}$/.test(z);
/* 某個時區在某個瞬間比 UTC 快幾分鐘；時區名稱無效時回傳 null */
function tzOffset(z,d){try{const p={};new Intl.DateTimeFormat('en-US',{timeZone:z,hourCycle:'h23',year:'numeric',month:'numeric',day:'numeric',hour:'numeric',minute:'numeric'}).formatToParts(d).forEach(x=>p[x.type]=x.value);
  return Math.round((Date.UTC(+p.year,p.month-1,+p.day,+p.hour%24,+p.minute)-Math.floor(d.getTime()/6e4)*6e4)/6e4)}catch(e){return null}}
function tzHint(e){if(!e||!tzOK(e.tz))return null;const here=devTZ();if(!here||e.tz===here)return null;
  const d=parse(e.date);d.setHours(12);const a=tzOffset(e.tz,d),b=tzOffset(here,d);if(a==null||b==null||a===b)return null;
  let name='';try{name=new Intl.DateTimeFormat(LOCALE,{timeZone:e.tz,timeZoneName:'long'}).formatToParts(d).find(x=>x.type==='timeZoneName').value}catch(_){}
  const h=Math.abs(a-b)/60;return{name:name||e.tz,rel:tl(a>b?'比這裡快 {h} 小時':'比這裡慢 {h} 小時',{h:Number.isInteger(h)?h:h.toFixed(1).replace(/\.0$/,'')})}}
const sysReduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const $=id=>document.getElementById(id);
const pad=n=>String(n).padStart(2,'0');
const ymd=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
const parse=s=>{const[a,b,c]=s.split('-').map(Number);return new Date(a,b-1,c)};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const chars=e=>((e.title||'')+(e.body||'')).replace(/\s/g,'').length;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
/* 短日期一律寫「10月3日」，不用純數字的 10/3：香港、英國等地習慣「日/月」，純數字會被讀反 */
const fmtMD=d=>EN_UI?`${MON_EN[d.getMonth()]} ${d.getDate()}`:`${d.getMonth()+1}月${d.getDate()}日`;
/* 不是今年的日期前面加年份（2025年10月21日），避免看起來像未來的日子 */
const fmtMDY=d=>d.getFullYear()===new Date().getFullYear()?fmtMD(d):EN_UI?`${fmtMD(d)}, ${d.getFullYear()}`:d.getFullYear()+'年'+fmtMD(d);
/* 空間很小的地方（圖鑑卡片）：不是今年的日期用兩位數年份（25 年10月21日） */
const fmtMDYs=d=>d.getFullYear()===new Date().getFullYear()?fmtMD(d):EN_UI?`${fmtMD(d)} ’${String(d.getFullYear()).slice(-2)}`:String(d.getFullYear()).slice(-2)+' 年'+fmtMD(d);
function fmtDay(s){const d=parse(s);return EN_UI?`${WDS_EN[d.getDay()]}, ${fmtMD(d)}`:(d.getMonth()+1)+' 月 '+d.getDate()+' 日・'+wdLong(d.getDay())}
/* 不是今年的日期前面加上年份（沒有月份標題可參考的地方用，例如紀錄詳情） */
const fmtDayY=s=>+s.slice(0,4)===new Date().getFullYear()?fmtDay(s):EN_UI?`${fmtDay(s)}, ${s.slice(0,4)}`:s.slice(0,4)+' 年 '+fmtDay(s);
const buzz=p=>{try{if(!reduce&&navigator.vibrate)navigator.vibrate(p)}catch(_){}};
/* 文字欄位的 Enter：中文輸入法選字時按的 Enter 不算（否則選字時就送出、跳欄或收起鍵盤） */
const isEnter=e=>e.key==='Enter'&&!e.isComposing&&e.keyCode!==229;
/* SVG 轉成圖片網址：去掉 XML 不允許的控制字元（從別的 App 貼上的文字可能夾帶），落單的代理字元換成 U+FFFD（替代字元），
   否則整張圖會產生失敗，encodeURIComponent 也會丟出錯誤 */
const svgURL=svg=>'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFE\uFFFF]/g,'').replace(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g,'\uFFFD'));
/* 完成度百分比：還沒完成時最多顯示 99%（275/276 天不該四捨五入成 100%），有一點進度至少 1% */
const pctDone=f=>f>=1?100:f<=0?0:Math.min(99,Math.max(1,Math.round(f*100)));
