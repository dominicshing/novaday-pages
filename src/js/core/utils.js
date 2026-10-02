/* 共用小工具：$、日期格式、跳脫 HTML、字數、延遲、震動回饋、系統的減少動態設定 */
const WD=['日','一','二','三','四','五','六'];
const sysReduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const $=id=>document.getElementById(id);
const pad=n=>String(n).padStart(2,'0');
const ymd=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
const parse=s=>{const[a,b,c]=s.split('-').map(Number);return new Date(a,b-1,c)};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const chars=e=>((e.title||'')+(e.body||'')).replace(/\s/g,'').length;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
function fmtDay(s){const d=parse(s);return (d.getMonth()+1)+' 月 '+d.getDate()+' 日・星期'+WD[d.getDay()]}
const buzz=p=>{try{if(!reduce&&navigator.vibrate)navigator.vibrate(p)}catch(_){}};
