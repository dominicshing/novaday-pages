/* 日記頁：搜尋輸入與建議 */
/* 輸入法選字中不搜尋（拼音、注音打到一半的字母不會讓列表閃成「沒有找到」），選好字才更新 */
{let qT=null;const run=e=>{const v=e.target.value.trim();$('qClr').hidden=!e.target.value;clearTimeout(qT);qT=setTimeout(()=>{q=v;renderLog();renderQSug()},entries.length>150?180:60)};
  $('q').addEventListener('input',e=>{if(!e.isComposing)run(e)});$('q').addEventListener('compositionend',run)}
/* 搜尋建議：最近搜尋＋常用標籤與地點 */
function pushRecent(v){v=(v||'').trim();if(!v||v.length>40)return;const r=(prof.recentQ||[]).filter(x=>x!==v);r.unshift(v);prof.recentQ=r.slice(0,6);saveProf()}
function renderQSug(){const box=$('qSug'),inp=$('q');$('qClr').hidden=!inp.value;
  if(document.activeElement!==inp||inp.value){box.hidden=true;return}
  const cnt=(arr)=>{const c={};arr.forEach(x=>{if(x)c[x]=(c[x]||0)+1});return Object.keys(c).sort((a,b)=>c[b]-c[a])};
  const real=entries.filter(e=>!isSample(e)),src=real.length?real:entries;
  const tags=cnt(src.flatMap(e=>e.tags||[])).slice(0,5),locs=cnt(src.map(e=>e.loc)).slice(0,3),rec=(prof.recentQ||[]).slice(0,6);
  if(!rec.length&&!tags.length&&!locs.length){box.hidden=true;return}
  const chip=(v,ic,lab)=>`<button type="button" data-q="${esc(v)}">${ic}<span>${esc(lab||v)}</span></button>`;
  const IC_REC='<svg class="mi-ic" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg>';
  box.innerHTML=(rec.length?`<div class="qs-h"><span>${tl('最近搜尋')}</span><button type="button" id="qsClr">${tl('清除')}</button></div><div class="qs-l">${rec.map(v=>chip(v,IC_REC)).join('')}</div>`:'')
    +(tags.length||locs.length?`<div class="qs-h"><span>${tl('常用標籤與地點')}</span></div><div class="qs-l">${tags.map(t=>chip(t,IC_TAG)).join('')}${locs.map(l=>chip(l,IC_PIN)).join('')}</div>`:'');
  box.hidden=false;
  box.querySelectorAll('[data-q]').forEach(b=>{b.onpointerdown=ev=>ev.preventDefault();b.onclick=()=>{inp.value=b.dataset.q;q=b.dataset.q;pushRecent(q);renderLog();renderQSug();inp.blur()}});
  if($('qsClr')){$('qsClr').onpointerdown=ev=>ev.preventDefault();$('qsClr').onclick=()=>{prof.recentQ=[];saveProf();renderQSug()}}}
$('q').addEventListener('focus',renderQSug);
$('q').addEventListener('blur',()=>{setTimeout(()=>{if(document.activeElement!==$('q'))$('qSug').hidden=true},120);if(q&&sorted().some(passFilter))pushRecent(q)});
$('q').addEventListener('keydown',e=>{if(isEnter(e)){e.preventDefault();$('q').blur()}});
$('qClr').onpointerdown=ev=>ev.preventDefault();
$('qClr').onclick=()=>{$('q').value='';q='';renderLog();$('q').focus();renderQSug()};
