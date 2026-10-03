/* 規則：星座投影、季節與可見度、地區、星座點亮順序 */
const D2R=Math.PI/180,PROJ={};
function conCenter(k){const c=CON[k];let x=0,y=0,z=0;c.s.forEach(([r,d])=>{const a=r*15*D2R,b=d*D2R;x+=Math.cos(b)*Math.cos(a);y+=Math.cos(b)*Math.sin(a);z+=Math.sin(b)});
  const n=Math.hypot(x,y,z);return{ra:((Math.atan2(y,x)/D2R/15)+24)%24,dec:Math.asin(z/n)/D2R}}
/* 以星座中心做切平面投影，北上東左，等比縮放塞進方框 */
function conProj(k,W,H,pad){const key=k+W+'x'+H+'p'+pad;if(PROJ[key])return PROJ[key];const c=CON[k],cc=conCenter(k),a0=cc.ra*15*D2R,d0=cc.dec*D2R;
  const P=c.s.map(([r,d])=>{const a=r*15*D2R,b=d*D2R,q=Math.sin(d0)*Math.sin(b)+Math.cos(d0)*Math.cos(b)*Math.cos(a-a0);
    return[-Math.cos(b)*Math.sin(a-a0)/q,-(Math.cos(d0)*Math.sin(b)-Math.sin(d0)*Math.cos(b)*Math.cos(a-a0))/q]});
  const xs=P.map(p=>p[0]),ys=P.map(p=>p[1]),mx=Math.min(...xs),Mx=Math.max(...xs),my=Math.min(...ys),My=Math.max(...ys);
  const s=Math.min((W-2*pad)/Math.max(Mx-mx,1e-3),(H-2*pad)/Math.max(My-my,1e-3),(W-2*pad)/.05);
  return PROJ[key]=P.map(([x,y])=>[+(W/2+(x-(mx+Mx)/2)*s).toFixed(1),+(H/2+(y-(my+My)/2)*s).toFixed(1)])}
/* 點亮順序：沿著連線走一遍 */
function conOrd(k){const c=CON[k];if(c.o)return c.o;const o=[];c.l.forEach(pl=>pl.forEach(i=>{if(!o.includes(i))o.push(i)}));c.s.forEach((_,i)=>{if(!o.includes(i))o.push(i)});return c.o=o}
const lst21=d=>(((21+2*(d.getMonth()+1-9)+(d.getDate()-21)/15)%24)+24)%24;
/* 當晚 21:00 正南方的赤經 */
const raDist=(a,b)=>{const x=Math.abs(a-b)%24;return Math.min(x,24-x)};
/* 地區：只存名稱與緯度；沒設定時用天區（北天／赤道帶／南天）當備用說明 */
/* 城市：[名稱, 緯度, 經度]（經度東正西負，只用來算「今晚幾點在哪個方位」） */
const REGIONS=[['東亞',[['台北',25.0,121.5],['台中',24.1,120.7],['高雄',22.6,120.3],['香港',22.3,114.2],['澳門',22.2,113.5],['廣州',23.1,113.3],['上海',31.2,121.5],['北京',39.9,116.4],['東京',35.7,139.7],['首爾',37.6,127.0]]],
  ['東南亞',[['新加坡',1.3,103.8],['吉隆坡',3.1,101.7],['曼谷',13.8,100.5]]],
  ['歐美',[['倫敦',51.5,-0.1],['巴黎',48.9,2.35],['雷克雅維克',64.1,-21.9],['紐約',40.7,-74.0],['洛杉磯',34.1,-118.2],['溫哥華',49.3,-123.1],['多倫多',43.7,-79.4]]],
  ['南半球',[['雪梨',-33.9,151.2],['墨爾本',-37.8,145.0],['奧克蘭',-36.8,174.8],['開普敦',-33.9,18.4],['聖保羅',-23.6,-46.6],['布宜諾斯艾利斯',-34.6,-58.4]]]];
const regLat=()=>prof.region&&typeof prof.region.lat==='number'?prof.region.lat:null;
/* 經度：定位時存下的值 → 依城市名稱查表（舊資料免重設）→ 裝置時區的中央經線（已含夏令時間） */
function regLon(){const r=prof.region;if(r&&typeof r.lon==='number')return r.lon;
  for(const[,l]of REGIONS)for(const[n,,lo]of l)if(r&&n===r.name)return lo;
  return -new Date().getTimezoneOffset()/4}
/* 當地恆星時（小時）：裝置當地日期 d 的 h 點（h 可 >24＝隔天凌晨），用 UTC 與標準 GMST 公式換算 */
function lstAt(d,h,lon){const t=new Date(d.getFullYear(),d.getMonth(),d.getDate()).getTime()+h*36e5,D=(t-Date.UTC(2000,0,1,12))/864e5;
  return((18.697374558+24.06570982441908*D+lon/15)%24+24)%24}
const maxAlt=(k,lat)=>{if(lat==null)lat=regLat();return lat==null?null:90-Math.abs(lat-conCenter(k).dec)};
const circum=(k,lat)=>{const d=conCenter(k).dec;return lat>=0?d>=90-lat:d<=-90-lat};
function conSeason(k){const ra=conCenter(k).ra;let m=Math.round(9+(ra-21)/2);m=((m-1)%12+12)%12+1;
  const lat=regLat(),mm=lat!=null&&lat<0?(m+5)%12+1:m;
  const s=mm>=3&&mm<=5?'春季':mm>=6&&mm<=8?'夏季':mm>=9&&mm<=11?'秋季':'冬季';return{m,s:lat==null?null:s}}
function conBest(k){const se=conSeason(k);return se.s?`${se.s}・約 ${se.m} 月晚上`:`約 ${se.m} 月晚上`}
function conZone(k){const d=conCenter(k).dec;return d>=25?['北天星座','北半球容易看到']:d<=-25?['南天星座','南半球容易看到']:['赤道帶星座','全球都看得到']}
/* 回傳 [文字, 等級 ok|low|no] */
function conVisR(k){const lat=regLat();if(lat==null)return null;const a=maxAlt(k,lat),d=conCenter(k).dec;
  if(Math.abs(lat)>=10&&circum(k,lat))return['整年都看得到','ok'];
  if(a<0)return['在這裡看不到','no'];if(a<10)return['幾乎看不到','no'];
  if(a<30)return[`在${d<lat?'南':'北'}方低空`,'low'];return['容易看到','ok']}
/* 下一個要收集的星座：當季、看得到、前三個挑星星少又有名的 */
function conScore(k,n){const c=CON[k],now=new Date();return raDist(conCenter(k).ra,lst21(now))+(n<3?c.s.length*.8:c.s.length*.15)-(c.fm?2:0)+(()=>{const a=maxAlt(k);return a==null?(Math.abs(conCenter(k).dec)>60?30:0):a<15?100:0})()}
function pickNext(order){if(prof.nextPick&&CON[prof.nextPick]&&!order.includes(prof.nextPick))return prof.nextPick;let best=null,bs=1e9;for(const k in CON){if(order.includes(k))continue;const s=conScore(k,order.length);if(s<bs){bs=s;best=k}}return best}
const ascEntries=l=>(l||entries).slice().sort((a,b)=>(a.date+(a.time||'')+a.id).localeCompare(b.date+(b.time||'')+b.id));
function consState(list){const order=prof.conOrder||(prof.conOrder=[]);let rem=list.length,i=0,changed=false;const done=[];
  for(;;){if(i>=order.length){const nx=pickNext(order);if(!nx){if(changed)saveProf();return{done,cur:null,lit:0,off:list.length}}order.push(nx);changed=true;if(nx===prof.nextPick)prof.nextPick=null}
    const n=CON[order[i]].s.length;if(rem>=n){done.push(order[i]);rem-=n;i++}else break}
  if(changed)saveProf();return{done,cur:order[i],lit:rem,off:list.length-rem}}
function conEntries(k){const st=consState(entries),A=ascEntries();let off=0;
  for(const d of st.done){const n=CON[d].s.length;if(d===k)return A.slice(off,off+n);off+=n}
  return k===st.cur?A.slice(st.off,st.off+st.lit):[]}
