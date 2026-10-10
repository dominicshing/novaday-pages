/* 日記紀錄的共用查詢：排序、範例判斷、照片數量 */
const sorted=()=>entries.slice().sort((a,b)=>(b.date+(b.time||'')).localeCompare(a.date+(a.time||'')));
const isSample=e=>!!e.sample||(/^s[123]$/.test(e.id)&&!e.edited);
const SMP=`<span class="smp">${tl('範例')}</span>`;
const entryPhotos=e=>e?[e.photo,...(Array.isArray(e.photoMore)?e.photoMore:[])].filter(Boolean):[];
const photoCount=e=>entryPhotos(e).length;
