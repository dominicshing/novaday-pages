/* 分頁導覽與全域畫面狀態 */
let cur='home',q='',pIdx=0,freshId=null,calMonth=new Date(),selDate=ymd(new Date());
calMonth.setDate(1);
const promptToday=()=>PROMPTS[pIdx%PROMPTS.length];
function go(s,view){if(s==='me'&&cur!=='me'&&typeof renderFootprint==='function'){fpIntroDone=false;requestAnimationFrame(renderFootprint)}cur=s;if(s==='me'&&(prof.achNew||[]).length){setTimeout(()=>{prof.achNew=[];saveProf();renderAchDot()},2500)}if(s==='log'&&view)setLogView(view,true);if(s==='log'&&logView==='cal')requestAnimationFrame(()=>typeof drawCalLines==='function'&&drawCalLines());if(s==='atlas')renderAtlas();if(s==='me')requestAnimationFrame(()=>typeof rkSync==='function'&&rkSync());setTimeout(()=>typeof syncCompact==='function'&&syncCompact(),0);if(s==='me'&&typeof renderEnergy==='function')renderEnergy();s==='home'?galStart():galStop();document.querySelectorAll('.screen').forEach(el=>el.classList.toggle('active',el.id==='s-'+s));
  document.querySelectorAll('.tb[data-s]').forEach(b=>b.dataset.s===s?b.setAttribute('aria-current','page'):b.removeAttribute('aria-current'))}
document.querySelectorAll('.tb[data-s]').forEach(b=>b.onclick=()=>{if(cur===b.dataset.s)$('s-'+cur).scrollTo({top:0,behavior:'smooth'});go(b.dataset.s)});
