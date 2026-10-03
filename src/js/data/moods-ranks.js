/* 資料：心情、階級、等級所需 XP */
/* 心情等級 0–4：月相越滿＝心情越好；顏色由暗到亮 */
const MOODS=[{n:'很低落',c:'--m0',e:'🌑'},{n:'有點累',c:'--m1',e:'🌘'},{n:'還可以',c:'--m2',e:'🌓'},{n:'不錯',c:'--m3',e:'🌔'},{n:'很棒',c:'--m4',e:'🌕'}];
const RANKS=['見習觀星者','觀星者','拾星者','星圖繪製者','月相記錄者','星座獵人','流星追尋者','天文學家','彗星追蹤者','星空領航員','極光旅人','星河守護者','雙星觀測家','星雲探險家','星團收藏家','銀河建築師','脈衝星聆聽者','星系旅人','黑洞凝視者','星際航行者','宇宙詩人','星塵煉金師','新星見證者','銀河漫遊者','時空旅人','星辰守夜人','創星者','星際傳奇'];
/* 每一階：代表色、介紹、解鎖的星線顏色、徽章圖案（em，見 ui/art/rank-badge.js）。每升 1 級晉升一階，Lv.28 起是最高階 */
const RINFO=[
 {c:'#B9BEE9',d:'剛拿起望遠鏡，開始認識夜空裡的第一批星星。',lv:{n:'月塵銀',c:['#F6F7FF','#B9BEE9','#6D73B3']},em:'star'},
 {c:'#6FA8FF',d:'能在夜空中找到熟悉的星座，記錄沿途的風景。',lv:{n:'晴空藍',c:['#EEF5FF','#9CC2FF','#3F6FD1']},em:'crescent'},
 {c:'#A5B8FF',d:'每天撿起一顆星，慢慢裝滿自己的夜空。',lv:{n:'晨曦藍',c:['#F2F5FF','#C3D0FF','#5A6FD1']},em:'cluster'},
 {c:'#6FE3D6',d:'把一天天的紀錄，連成屬於自己的星圖。',lv:{n:'極光青',c:['#EFFFFC','#9BEDE2','#2A9C92']},em:'triangle'},
 {c:'#E8E3C8',d:'看著月亮圓了又缺，也記下自己的起起伏伏。',lv:{n:'月光白',c:['#FFFEF5','#EDE6C6','#9C9370']},em:'phases'},
 {c:'#A99EFF',d:'循著季節追逐星座，知道每顆星在哪裡。',lv:{n:'星雲紫',c:['#F4F1FF','#BBAEFF','#6552D9']},em:'orion'},
 {c:'#FFA07A',d:'不錯過任何一道劃過心裡的光。',lv:{n:'流星橙',c:['#FFF3EC','#FFC2A3','#D0623A']},em:'meteor'},
 {c:'#FF8FD0',d:'累積了豐富的觀測紀錄，讀得懂星空的節奏。',lv:{n:'脈衝星粉',c:['#FFF1F8','#FFB3DC','#C04C8E']},em:'planet'},
 {c:'#7AF0E0',d:'耐心等待，總會遇見拖著長尾巴的訪客。',lv:{n:'彗尾碧',c:['#EEFFFC','#A6F5EA','#1F9C8C']},em:'comet'},
 {c:'#FFB45C',d:'能替別人指出方向，自己的航線也越來越清楚。',lv:{n:'日冕橘',c:['#FFF6EA','#FFC98A','#D1772E']},em:'polaris'},
 {c:'#5EE6B0',d:'走到很遠的地方，只為看一眼天空的舞。',lv:{n:'翡翠光',c:['#EEFFF6','#9FF0C7','#24A06A']},em:'aurora'},
 {c:'#FFD36F',d:'守護著一整片屬於自己的星河。',lv:{n:'超新星金',c:['#FFFBEA','#FFE08A','#C9961F']},em:'spiral'},
 {c:'#FFB8E6',d:'看見生活裡彼此繞行、互相照亮的人和事。',lv:{n:'雙子粉',c:['#FFF2FB','#FFD1EF','#C2569A']},em:'binary'},
 {c:'#7FD8FF',d:'穿越一片片星雲，在未知的地方留下紀錄。',lv:{n:'冰晶藍',c:['#F0FBFF','#A8E6FF','#2E8FC2']},em:'nebula'},
 {c:'#B6F0FF',d:'一顆顆星聚在一起，成了閃閃發亮的星團。',lv:{n:'星團銀藍',c:['#F3FDFF','#CFF5FF','#4FA6C2']},em:'globular'},
 {c:'#C68CFF',d:'一磚一瓦，把日常搭成屬於自己的銀河。',lv:{n:'星紋紫',c:['#F8F0FF','#D9B8FF','#7A3FD1']},em:'hexagon'},
 {c:'#9F8CFF',d:'聽得見宇宙最規律的心跳，也聽得見自己的。',lv:{n:'脈動紫',c:['#F3F0FF','#C5BAFF','#5B47D6']},em:'pulsar'},
 {c:'#FF8C7A',d:'在不同的星系之間旅行，每段旅程都有回音。',lv:{n:'赤霞紅',c:['#FFF1EE','#FFB7AA','#C94A38']},em:'orbits'},
 {c:'#FF9E5C',d:'敢直視最深的黑暗，也記得光在哪裡。',lv:{n:'吸積盤橙',c:['#FFF4EA','#FFC79A','#C8642A']},em:'blackhole'},
 {c:'#69C8FF',d:'揚帆出發，航線一路延伸到星海深處。',lv:{n:'航跡藍',c:['#EEF8FF','#A3DCFF','#2A7FC2']},em:'ship'},
 {c:'#8CF0B0',d:'把平凡的一天寫成詩，宇宙也為你停留。',lv:{n:'極光綠',c:['#F0FFF5','#B5F7CE','#2F9E62']},em:'poet'},
 {c:'#F5C46A',d:'把平凡的日子，煉成閃閃發亮的星塵。',lv:{n:'煉金琥珀',c:['#FFF8E8','#FBDDA0','#B8862A']},em:'alchemy'},
 {c:'#FF7FA8',d:'見證了最耀眼的時刻，也把它寫進星空。',lv:{n:'新星緋',c:['#FFF0F5','#FFB3CB','#C93F6C']},em:'nova'},
 {c:'#B9A6FF',d:'在銀河裡隨意漫步，每一步都是風景。',lv:{n:'銀河薰衣草',c:['#F6F2FF','#D8CCFF','#6E58D6']},em:'edgeon'},
 {c:'#7FFFD4',d:'翻開舊日記，就能在時間裡來回旅行。',lv:{n:'時空碧',c:['#EFFFF9','#B0FFE6','#2AA67F']},em:'wormhole'},
 {c:'#A3C4FF',d:'夜再長，也有你守著滿天星辰。',lv:{n:'夜空藍',c:['#F0F5FF','#C8DAFF','#4567B8']},em:'nightwatch'},
 {c:'#FFD9A0',d:'每一則紀錄，都在宇宙裡點亮一顆新的星。',lv:{n:'恆星金',c:['#FFF9EE','#FFE6C0','#C89A4E']},em:'creator'},
 {c:'#FFE7A3',d:'你的日記本身，就是一段星空傳奇。',lv:{n:'星河幻彩',c:['#FFF6FD','#D6C4FF','#5FB8D6']},em:'burst'}];
const rankIdx=lv=>Math.min(RANKS.length-1,Math.max(0,lv-1));
const xpAt=L=>100*(L-1)+25*(L-1)*(L-2);
/* 升到 Lv.L 需要的累積 XP */
const hexA=(x,a)=>{const n=parseInt(x.slice(1),16);return `rgba(${n>>16&255},${n>>8&255},${n&255},${a})`};
function starPath(cx,cy,r){let d='';for(let k=0;k<10;k++){const a=-Math.PI/2+k*Math.PI/5,rr=k%2?r*.45:r;d+=(k?'L':'M')+(cx+rr*Math.cos(a)).toFixed(2)+' '+(cy+rr*Math.sin(a)).toFixed(2)}return d+'Z'}
