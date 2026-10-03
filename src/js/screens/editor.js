/* 新增／編輯紀錄：心情、照片、影片、草稿、點亮 */
/* Editor */
const DKEY='orbitlog.draft.v1';
let editing=null,curMood=2,curPhoto=null,curPhotos=[],curVideo=null,vidUrl=null,curPrompt=null,baseSnap='',dTimer=null;
/* 這則紀錄會點亮哪一顆星：新紀錄 → 目前星座的下一顆；編輯 → 這則原本對應的那顆 */
function edTarget(){const st=consState(entries);
  if(!editing){if(!st.cur)return null;return{k:st.cur,t:st.lit,lit:st.lit,es:ascEntries().slice(st.off,st.off+st.lit)}}
  const A=ascEntries(),ix=A.findIndex(x=>x.id===editing);if(ix<0)return null;let off=0;
  for(const d of st.done){const n=CON[d].s.length;if(ix<off+n)return{k:d,t:ix-off,lit:n,es:A.slice(off,off+n)};off+=n}
  return st.cur?{k:st.cur,t:ix-st.off,lit:st.lit,es:A.slice(st.off,st.off+st.lit)}:null}
function renderEdStar(){const T=edTarget(),box=$('edStar');box.hidden=!T;if(!T)return;
  const c=CON[T.k],n=c.s.length,P=conProj(T.k,84,52,7),ord=conOrd(T.k),tg=ord[T.t],on=new Set(ord.slice(0,T.lit));on.delete(tg);
  const col={};ord.slice(0,T.lit).forEach((si,j)=>{const e=T.es[j];if(e)col[si]=`var(${MOODS[e.mood??2].c})`});let g='';
  {const r=seedRng(T.k+'ed');for(let i=0;i<14;i++)g+=`<circle cx="${(r()*84).toFixed(1)}" cy="${(r()*52).toFixed(1)}" r="${(.3+r()*.5).toFixed(2)}" fill="#E8E9FF" opacity="${(.15+r()*.3).toFixed(2)}"/>`}
  g+=conFig(T.k,84,52,P,T.lit/n);
  c.l.forEach(pl=>{for(let j=0;j<pl.length-1;j++){const a=pl[j],b=pl[j+1],A=P[a],B=P[b];
    const cls=on.has(a)&&on.has(b)?'es-on':((a===tg&&on.has(b))||(b===tg&&on.has(a)))?'es-to':'es-l';
    g+=`<line class="${cls}" x1="${A[0]}" y1="${A[1]}" x2="${B[0]}" y2="${B[1]}"/>`}});
  c.s.forEach((_,si)=>{const[x,y]=P[si];
    if(si===tg)g+=`<circle class="es-rg" cx="${x}" cy="${y}" r="6"/><path class="es-tg" d="${spk(x,y,5.4)}"/><path d="${spk(x,y,2.2)}" fill="#fff"/>`;
    else if(on.has(si))g+=`<path d="${spk(x,y,3.6)}" fill="${col[si]||'var(--nebula)'}"/>`;
    else g+=`<path d="${spk(x,y,2.4)}" fill="rgba(232,233,255,.5)"/>`});
  $('edStarSvg').innerHTML=g;
  $('edStarK').textContent=editing?'這則紀錄是':'這則紀錄將點亮';
  $('edStarN').textContent=!editing&&T.t+1===n?`${c.n}的最後一顆星 ✦`:`${c.n}・第 ${T.t+1} / ${n} 顆星`;
  $('edStarS').textContent=!editing&&T.t+1===n?'點亮後就完成整個星座！':'此刻的心情會決定這顆星的顏色';
  box.setAttribute('aria-label',$('edStarK').textContent+$('edStarN').textContent);box.setAttribute('role','note');paintEdStar()}
function paintEdStar(){const c=`var(${MOODS[curMood].c})`,sb=$('saveBtn');$('edStar').style.setProperty('--c',c);sb.style.setProperty('--mc',c);sb.dataset.m=curMood}
/* 換心情時，「點亮」按鈕上的星星彈一下（顏色與閃爍方式見 editor.css 的 [data-m]） */
function lbHit(){const g=$('saveBtn').querySelector('.lbg');if(!g||reduce)return;g.classList.remove('hit');void g.getBoundingClientRect();g.classList.add('hit')}
function fitBody(){const f=$('fBody');f.style.height='auto';f.style.height=Math.max(132,f.scrollHeight+2)+'px'}
function updWC(){const n=($('fTitle').value+$('fBody').value).replace(/\s/g,'').length,p=curPhotos.length;
  $('wc').textContent=n+' 字'+(p?`・${p} 張照片`:curVideo?'・1 部影片':'')}
function renderPrompt(){$('promptNote').hidden=!curPrompt;const today=curPrompt===promptToday();
  $('pnK').textContent=curPrompt?(today?'💫 今日星語':'✦ 書寫提示'):'';$('pnT').textContent=curPrompt||'';
  $('sigChip').hidden=!!curPrompt;$('sigChip').title=promptToday()}
function renderMoods(){$('moods').innerHTML=MOODS.map((m,i)=>`<button type="button" class="mood" style="--c:var(${m.c})" data-i="${i}" aria-pressed="${i===curMood}" aria-label="${m.n}">${moon(i)}${m.n}</button>`).join('');
  $('moods').querySelectorAll('.mood').forEach(b=>b.onclick=()=>{const i=+b.dataset.i,same=i===curMood;curMood=i;renderMoods();onEdit();
    if(same||reduce)return;lbHit();const nb=$('moods').querySelector(`.mood[data-i="${i}"]`);if(!nb)return;const bs=document.createElement('span');bs.className='nv-burst';bs.setAttribute('aria-hidden','true');bs.style.setProperty('--c',`var(${MOODS[i].c})`);
    for(let k=0;k<8;k++){const a=k/8*Math.PI*2,r=24+(k%2)*8,d=document.createElement('i');d.style.setProperty('--x',(Math.cos(a)*r).toFixed(1)+'px');d.style.setProperty('--y',(Math.sin(a)*r).toFixed(1)+'px');bs.appendChild(d)}
    nb.appendChild(bs);setTimeout(()=>bs.remove(),760);if(typeof buzz==='function')buzz(6)});
  $('moodNow').textContent=MOODS[curMood].n;paintEdStar()}
const PH_MAX=10;
function setPhotos(arr,quiet){curPhotos=(arr||[]).filter(Boolean).slice(0,PH_MAX);curPhoto=curPhotos[0]||null;renderMedia();if(!quiet)onEdit()}
function setVideo(v,quiet){curVideo=v&&v.id?v:null;renderMedia();if(!quiet)onEdit()}
/* 影像區：沒有影像時顯示「加入照片／加入影片」；照片最多 10 張，或 1 部影片，兩者擇一 */
function renderMedia(){const b=$('fPhotos'),n=curPhotos.length;if(!b)return;
  $('mdEmpty').hidden=!!(n||curVideo);b.hidden=!n;$('fVideo').hidden=!curVideo;
  b.innerHTML=curPhotos.map((u,i)=>`<div class="ph-t${i?'':' cover'}"><button type="button" class="ph-img" data-i="${i}" aria-label="${i?`把第 ${i+1} 張設為封面`:'封面照片'}"><img src="${u}" alt=""></button>${i?'':'<span class="ph-cv">封面</span>'}<button type="button" class="ph-x" data-x="${i}" aria-label="移除第 ${i+1} 張照片"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7l10 10M17 7L7 17"/></svg></button></div>`).join('')
    +(n&&n<PH_MAX?`<button type="button" class="ph-add" id="phAdd"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg><span>再加一張</span><small>${n} / ${PH_MAX}</small></button>`:'');
  $('phHint').textContent=curVideo?'每則紀錄可放 1 部影片，或最多 10 張照片'
    :n>1?`點一下照片可以設為封面・${n} / ${PH_MAX} 張`:n?`最多 ${PH_MAX} 張照片・想放影片請先移除照片`:'可以只放照片或影片，不寫文字也能點亮';
  b.querySelectorAll('.ph-x').forEach(x=>x.onclick=()=>{const a=curPhotos.slice();a.splice(+x.dataset.x,1);setPhotos(a)});
  b.querySelectorAll('.ph-img').forEach(x=>x.onclick=()=>{const i=+x.dataset.i;if(!i)return;const a=curPhotos.slice();const [m]=a.splice(i,1);a.unshift(m);setPhotos(a);toast('已設為封面',1400)});
  if($('phAdd'))$('phAdd').onclick=()=>$('fPhoto').click();
  renderVidPrev()}
function renderVidPrev(){const box=$('fVideo'),v=curVideo;if(vidUrl){URL.revokeObjectURL(vidUrl);vidUrl=null}
  if(!v){box.innerHTML='';return}
  box.innerHTML=`<video class="md-v" playsinline controls preload="metadata"${v.poster?` poster="${v.poster}"`:''}></video><span class="md-dur">${fmtDur(v.dur)}</span><button type="button" class="ph-x" id="vidX" aria-label="移除影片"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7l10 10M17 7L7 17"/></svg></button>`;
  $('vidX').onclick=()=>setVideo(null);
  const id=v.id;mediaGet(id).then(bl=>{if(!bl||!curVideo||curVideo.id!==id)return;vidUrl=URL.createObjectURL(bl);const el=box.querySelector('video');if(el)el.src=vidUrl})}
const updXP=()=>{const id=editing||'__draft',tmp=entries.filter(x=>x.id!==id).concat([{id,date:$('fDate').value||ymd(new Date()),time:$('fTime').value,photo:curPhoto,video:curVideo,loc:$('fLoc').value.trim(),prompt:curPrompt}]);
  const v=xpMap(tmp).get(id)||{total:0,bonus:0},gain=editing?v.total:totalXP(tmp)-totalXP(entries);
  /* 新紀錄顯示「實際淨增加」的 XP（同一天第二則起只有 +5） */
  const firstToday=!entries.some(x=>x.date===tmp[tmp.length-1].date&&x.id!==id);
  $('xpPrev').textContent=`+${gain} XP${firstToday&&v.bonus?' 🔥':''}`;
  $('xpPrev').title=firstToday?`當天第一則 +${XP.first}${v.bonus?`，連續加成 +${v.bonus}`:''}`:`當天已經寫過，這則 +${XP.extra} 起`};
/* 日期時間膠囊：左半「昨天・10/2（五）」、右半「21:30」，點哪半就打開手機的日期或時間選擇器 */
function updWhen(){const td=ymd(new Date()),d=$('fDate').value||td,t=$('fTime').value,x=parse(d),n=Math.round((parse(td)-x)/864e5),r=n===0?'今天':n===1?'昨天':n===2?'前天':'';
  $('whenDT').textContent=`${r?r+'・':''}${x.getMonth()+1}/${x.getDate()}（${WD[x.getDay()]}）`;$('whenTT').textContent=t?fmtTime(t):'--:--'}
function syncTools(){const has={xLoc:!!$('fLoc').value.trim(),xTags:!!$('fTags').value.trim(),xDate:$('fDate').value!==ymd(new Date())};
  document.querySelectorAll('.tool').forEach(b=>{b.setAttribute('aria-pressed',!$(b.dataset.x).hidden);b.classList.toggle('has',!!has[b.dataset.x])})}
const snap=()=>JSON.stringify([$('fTitle').value,$('fBody').value,curMood,$('fDate').value,$('fTime').value,$('fTags').value,$('fLoc').value,curPhotos.map(u=>u.length+u.slice(-16)).join(),curVideo&&curVideo.id,curPrompt]);
const draftHas=d=>!!(d&&((d.title||'').trim()||(d.body||'').trim()||d.photo||(d.photos||[]).length||(d.video&&d.video.id)));
function readDraft(){try{return JSON.parse(localStorage.getItem(DKEY)||'null')}catch(e){return null}}
function clearDraft(){try{localStorage.removeItem(DKEY)}catch(e){}}
/* 草稿暫存：一句話快記、或指定日期補寫時，開一個全新的編輯器，原本的草稿先收起來，
   存完（或關掉編輯器）再放回去，兩者不會混在一起，原本的草稿也不會被覆蓋；
   收起來的草稿存在 SKEY（不是只放在記憶體），途中關掉 App 也不會遺失，下次開啟時放回草稿 */
const SKEY='orbitlog.draft.stash.v1';
let edStash=null;
function stashDraft(){try{edStash=localStorage.getItem(DKEY);if(edStash!=null)localStorage.setItem(SKEY,edStash)}catch(e){edStash=null}clearDraft()}
function stashRestore(){if(edStash==null)return;try{localStorage.setItem(DKEY,edStash);localStorage.removeItem(SKEY)}catch(e){}edStash=null;renderDraftBar()}
try{const s=localStorage.getItem(SKEY);if(s!=null){localStorage.setItem(DKEY,s);localStorage.removeItem(SKEY)}}catch(e){}
function writeDraft(){clearTimeout(dTimer);if(!$('editor').classList.contains('open'))return;
  if(snap()===baseSnap||!edHas()){clearDraft();$('draftState').textContent='';return}
  const d={editing,title:$('fTitle').value,body:$('fBody').value,mood:curMood,date:$('fDate').value,time:$('fTime').value,tags:$('fTags').value,loc:$('fLoc').value,photos:curPhotos.map(phRef).filter(Boolean),video:curVideo,prompt:curPrompt};
  try{localStorage.setItem(DKEY,JSON.stringify(d));$('draftState').textContent='草稿已自動儲存'}
  catch(e){try{d.photos=[];localStorage.setItem(DKEY,JSON.stringify(d));$('draftState').textContent='草稿已儲存（不含照片）'}catch(e2){$('draftState').textContent='草稿無法儲存'}}}
function edHas(){return !!($('fTitle').value.trim()||$('fBody').value.trim()||curPhoto||curVideo)}
function updEdUI(){const sb=$('saveBtn'),was=sb.classList.contains('off'),now=!edHas();sb.classList.toggle('off',now);sb.setAttribute('aria-disabled',now);
  if(was&&!now&&!reduce){sb.classList.remove('pop');void sb.offsetWidth;sb.classList.add('pop')}
  updWC();fitBody();$('sparks').hidden=!!$('fBody').value.trim()||!!editing}
function onEdit(){updXP();syncTools();updWhen();updEdUI();$('draftState').textContent='編輯中…';clearTimeout(dTimer);dTimer=setTimeout(writeDraft,500)}
function renderDraftBar(){const d=readDraft();if(d&&!draftHas(d))clearDraft();const ok=draftHas(d)&&(!d.editing||entries.some(e=>e.id===d.editing));
  $('draftBar').hidden=!ok;if(ok)$('draftTxt').textContent=d.editing?'📝 有一則尚未儲存的修改':'📝 有一則未完成的草稿'}
$('draftBar').addEventListener('click',()=>{const d=readDraft();
  if(!draftHas(d)){clearDraft();renderDraftBar();toast('找不到草稿內容，已為你開啟新紀錄');openEditor();return}
  const ok=!d.editing||entries.some(e=>e.id===d.editing);
  if(!ok){d.editing=null;try{localStorage.setItem(DKEY,JSON.stringify(d))}catch(e){}}
  openEditor(ok?d.editing:null)});
/* 不能寫未來的日記：日期最晚是今天；今天的話，時間最晚是現在。quiet＝開啟編輯器時默默修正，不跳提示 */
function noFuture(quiet){const n=new Date(),td=ymd(n),now=pad(n.getHours())+':'+pad(n.getMinutes()),fd=$('fDate'),ft=$('fTime');let msg='';
  fd.max=td;if(fd.value&&fd.value>td){fd.value=td;msg='不能寫未來的日記，已改成今天'}
  ft.max=fd.value===td?now:'';if(fd.value===td&&ft.value&&ft.value>now){ft.value=now;msg=msg||'時間不能晚於現在，已改成現在'}
  if(msg){if(!quiet)toast(msg,2600);updWhen();return false}return true}
function openEditor(id,usePrompt,presetDate){setTimeout(renderSug,0);const e=id?entries.find(x=>x.id===id):null;editing=e?e.id:null;const n=new Date();
  curPrompt=e?(e.prompt||null):(typeof usePrompt==='string'?usePrompt:usePrompt?promptToday():null);
  $('fDate').value=e?e.date:(presetDate||ymd(n));$('fTime').value=e?(e.time||''):pad(n.getHours())+':'+pad(n.getMinutes());
  $('fTitle').value=e?e.title:'';$('fBody').value=e?e.body:'';$('fTags').value=e?(e.tags||[]).join(', '):'';$('fLoc').value=e?(e.loc||''):'';
  curMood=e?(e.mood??2):2;curVideo=e&&hasVideo(e)?{...e.video}:null;setPhotos(entryPhotos(e),true);$('fPhoto').value='';$('fVideoIn').value='';
  baseSnap=snap();
  let d=readDraft(),restored=false;
  /* 草稿不屬於這次要開的編輯器（編輯另一則紀錄，或指定了不同日期）：先收起來，這次寫的內容不會覆蓋它 */
  if(draftHas(d)&&((d.editing||null)!==editing||(!e&&presetDate&&d.date&&d.date!==presetDate))){stashDraft();d=null}
  if(draftHas(d)){
    $('fTitle').value=d.title||'';$('fBody').value=d.body||'';$('fTags').value=d.tags||'';$('fLoc').value=d.loc||'';
    if(d.date)$('fDate').value=d.date;$('fTime').value=d.time||'';curMood=d.mood??curMood;curVideo=d.video&&d.video.id?d.video:null;setPhotos((Array.isArray(d.photos)?d.photos:[]).map(r=>phSrc(r)||r),true);
    if(!usePrompt)curPrompt=d.prompt||curPrompt;restored=true}
  noFuture(true);
  $('xLoc').hidden=!$('fLoc').value;$('xTags').hidden=!$('fTags').value;
  $('edTitle').textContent=e?'編輯紀錄':'新增紀錄';$('saveBtn').innerHTML=(e?'':'<svg class="lbi" viewBox="0 0 24 24" aria-hidden="true"><circle class="lbs" cx="12" cy="12" r="11.5"/><g class="lbg"><g class="lbm"><path d="M12 4Q13.45 10.55 20 12Q13.45 13.45 12 20Q10.55 13.45 4 12Q10.55 10.55 12 4Z"/></g></g></svg>')+(e?'儲存':'點亮');$('saveBtn').classList.remove('pop');
  renderPrompt();
  $('draftState').textContent=restored?'已還原草稿':'';
  renderMoods();updXP();syncTools();updWhen();updEdUI();renderEdStar();
  $('form').querySelector('.sb').scrollTop=0;openSheet('editor');requestAnimationFrame(fitBody);
  if(restored)toast('已還原上次未完成的草稿');
  if(!e)setTimeout(()=>$('fBody').focus({preventScroll:true}),reduce?0:340)}
async function tryCloseEditor(){if(edStash!=null){
    /* 另有收起來的草稿：這則不能再存成草稿（只有一個位置），只能繼續寫或捨棄 */
    if(snap()!==baseSnap&&edHas()){const k=await ask(editing?'要離開編輯嗎？':'要離開這則紀錄嗎？',`你還有另一則未完成的草稿，所以這次的${editing?'修改':'內容'}不會存成草稿。`,[{k:'keep',t:'繼續寫',cls:'primary'},{k:'discard',t:editing?'放棄修改':'捨棄這則',cls:'danger'}]);if(k!=='discard')return}
    clearDraft();closeSheet('editor');stashRestore();return}
  writeDraft();if(snap()===baseSnap||!edHas()){closeSheet('editor');renderDraftBar();return}
  const k=await ask(editing?'要離開編輯嗎？':'要離開這則紀錄嗎？','目前的內容已存成草稿，下次打開會自動還原。',
    [{k:'keep',t:'繼續寫',cls:'primary'},{k:'later',t:'保留草稿，稍後再寫'},{k:'discard',t:editing?'放棄修改':'捨棄內容',cls:'danger'}]);
  if(k==='later'){closeSheet('editor');renderDraftBar();toast('草稿已保留，首頁可以繼續寫')}
  else if(k==='discard'){clearDraft();closeSheet('editor');renderDraftBar()}
  else $('fBody').focus({preventScroll:true})}
['fTitle','fBody','fLoc','fTags','fDate','fTime'].forEach(id=>$(id).addEventListener('input',onEdit));
/* 單行欄位按 Enter（手機鍵盤的「下一步／完成」）不會直接送出點亮：標題跳到內文，地點與標籤收起鍵盤。
   要直接點亮可按 Ctrl／⌘+Enter；輸入法選字中的 Enter 不處理 */
['fTitle','fLoc','fTags'].forEach(id=>$(id).addEventListener('keydown',e=>{if(!isEnter(e)||e.ctrlKey||e.metaKey)return;
  e.preventDefault();if(id==='fTitle')$('fBody').focus();else e.target.blur()}));
['fDate','fTime'].forEach(id=>$(id).addEventListener('change',()=>{noFuture();onEdit()}));
/* 按點亮時日期超過今天：瀏覽器會先擋下（max），這時改回今天並說明，不顯示瀏覽器自己的提示 */
['fDate','fTime'].forEach(id=>$(id).addEventListener('invalid',ev=>{ev.preventDefault();noFuture();updWhen()}));
/* 桌面瀏覽器點欄位不一定會開選擇器，主動打開 */
['fDate','fTime'].forEach(id=>$(id).addEventListener('click',e=>{try{e.currentTarget.showPicker()}catch(_){}}));
document.querySelectorAll('.spark-chip').forEach(b=>b.onclick=()=>{const t=b.textContent;const f=$('fBody');f.value=t+(/[：:]$/.test(t)?'':'');f.focus();f.setSelectionRange(f.value.length,f.value.length);onEdit()});
$('sigChip').onclick=()=>{curPrompt=promptToday();renderPrompt();onEdit();const f=$('fBody');f.focus({preventScroll:true});toast('💫 回答今日星語，多得 +10 XP')};
$('pnX').onclick=()=>{curPrompt=null;renderPrompt();onEdit();$('fBody').focus({preventScroll:true})};
$('xpPrev').onclick=()=>toast($('xpPrev').title||'寫完按「點亮」就會獲得經驗值',3000);
document.querySelectorAll('.tool').forEach(b=>b.onclick=()=>{const s=$(b.dataset.x);
  s.hidden=!s.hidden;syncTools();
  if(!s.hidden){scrollToEl(s,'nearest');const inp=s.querySelector('input:not([type=file])');if(inp)inp.focus({preventScroll:true})}});
/* 編輯器：最近地點、常用標籤一鍵帶入 */
function renderSug(){const L=entries.filter(e=>!isSample(e));
  const lc={};L.slice().sort((a,b)=>(b.date+b.time).localeCompare(a.date+a.time)).forEach(e=>{if(e.loc&&!(e.loc in lc))lc[e.loc]=Object.keys(lc).length});
  const locs=Object.keys(lc).slice(0,6),cur=$('fLoc').value.trim();
  $('locSug').innerHTML=locs.map(l=>`<button type="button" data-l="${esc(l)}" aria-pressed="${l===cur}">${IC_PIN}${esc(l)}</button>`).join('');$('locSug').hidden=!locs.length;
  const tc={};L.forEach(e=>(e.tags||[]).forEach(t=>tc[t]=(tc[t]||0)+1));const tags=Object.keys(tc).sort((a,b)=>tc[b]-tc[a]).slice(0,10);
  const on=new Set($('fTags').value.split(/[,，]/).map(x=>x.trim()).filter(Boolean));
  $('tagSug').innerHTML=tags.map(t=>`<button type="button" data-t="${esc(t)}" aria-pressed="${on.has(t)}">#${esc(t)}</button>`).join('');$('tagSug').hidden=!tags.length;
  $('locSug').querySelectorAll('[data-l]').forEach(b=>b.onclick=()=>{const v=b.dataset.l;$('fLoc').value=$('fLoc').value.trim()===v?'':v;$('fLoc').dispatchEvent(new Event('input',{bubbles:true}));renderSug()});
  $('tagSug').querySelectorAll('[data-t]').forEach(b=>b.onclick=()=>{const t=b.dataset.t,a=$('fTags').value.split(/[,，]/).map(x=>x.trim()).filter(Boolean),i=a.indexOf(t);
    i<0?a.push(t):a.splice(i,1);$('fTags').value=a.join(', ');$('fTags').dispatchEvent(new Event('input',{bubbles:true}));renderSug()})}
$('fLoc').addEventListener('input',()=>{clearTimeout(renderSug.t);renderSug.t=setTimeout(renderSug,200)});
$('fTags').addEventListener('input',()=>{clearTimeout(renderSug.t);renderSug.t=setTimeout(renderSug,200)});
$('form').addEventListener('submit',async ev=>{ev.preventDefault();clearTimeout(dTimer);
  if(!noFuture()){updWhen();return}
  const data={date:$('fDate').value||ymd(new Date()),time:$('fTime').value,title:$('fTitle').value.trim(),body:$('fBody').value.trim(),mood:curMood,
    tags:$('fTags').value.split(/[,，]/).map(s=>s.trim()).filter(Boolean),loc:$('fLoc').value.trim(),photo:curPhotos[0]||null,photoMore:curPhotos.length>1?curPhotos.slice(1):undefined,video:curVideo||undefined,prompt:curPrompt};
  if(!data.title&&!data.body&&!data.photo&&!data.video){toast('寫一點內容，或加入照片、影片再點亮');$('fBody').focus();return}
  const before=entries.slice(),cB=consState(before).done.length,stB=streakOf(before).n,lvB=levelInfo(totalXP(before)).lv,achB=unlocked(before),xpB=totalXP(before);let id=editing;const wasEdit=!!editing;
  if(editing){const i=entries.findIndex(x=>x.id===editing);entries[i]={...entries[i],...data,sample:0,edited:1}}
  else{id=Date.now().toString(36)+Math.random().toString(36).slice(2,6);entries.push({id,...data})}
  if(!save()){entries=before;return}
  clearDraft();stashRestore();baseSnap=snap();closeSheet('editor');const gained=totalXP(entries)-xpB;
  if(!wasEdit){freshId=id;go('home');$('s-home').scrollTop=0;buzz(14);render();await launch(data.mood)}   /* 先畫好新的版面，彗星才飛得到新星的位置 */
  render();if(gained>0&&cur==='home')floatXP('+'+gained+' XP');
  {const sA=consState(entries);if(sA.done.length>cB){await sleep(reduce?0:500);await showConDone(sA.done[sA.done.length-1])}}
  const lvA=levelInfo(totalXP(entries)).lv,newAch=ACH.filter(a=>a.t(entries)&&!achB.includes(a.id));
  if(lvA>lvB){await sleep(reduce?0:900);await showLevel(lvA)}
  if(!wasEdit&&before.length&&stB===0&&streakOf(entries).n>0){toast('✨ 重新點亮！新的星光從今天開始',2600);await sleep(2700)}
  for(const a of newAch.slice(0,2)){await showAch(a)}
  if(newAch.length>2){prof.achNew=[...new Set([...(prof.achNew||[]),...newAch.map(a=>a.id)])];saveProf();renderAchDot();toast(`還解鎖了 ${newAch.length-2} 個徽章，到「我的」看看`,3200)}
  if(wasEdit&&!newAch.length)toast(gained>0?`已儲存，額外獲得 ${gained} XP`:'已儲存變更')});
/* 照片縮到長邊 1600px 存成 JPEG。直接從檔案解碼（createImageBitmap 會套用 EXIF 方向），不先轉成 base64 字串，大照片快很多；
   不支援的瀏覽器改用 Image 讀暫時網址 */
async function loadPhoto(f){const draw=(src,w,h)=>{const s=Math.min(1,1600/Math.max(w,h)),c=document.createElement('canvas');
    c.width=Math.max(1,Math.round(w*s));c.height=Math.max(1,Math.round(h*s));c.getContext('2d').drawImage(src,0,0,c.width,c.height);return c.toDataURL('image/jpeg',.82)};
  if(window.createImageBitmap){try{const bm=await createImageBitmap(f,{imageOrientation:'from-image'});const u=draw(bm,bm.width,bm.height);bm.close&&bm.close();return u}catch(e){}}
  return new Promise(res=>{const u=URL.createObjectURL(f),img=new Image();
    img.onload=()=>{try{res(draw(img,img.naturalWidth,img.naturalHeight))}catch(e){res(null)}URL.revokeObjectURL(u)};
    img.onerror=()=>{URL.revokeObjectURL(u);res(null)};img.src=u})}
$('fPhoto').onchange=async ev=>{const fs=[...ev.target.files];ev.target.value='';if(!fs.length)return;
  if(curVideo){toast('每則紀錄只能放 1 部影片或照片，請先移除影片');return}
  const room=PH_MAX-curPhotos.length,use=fs.slice(0,Math.max(0,room));if(!use.length){toast(`每則紀錄最多 ${PH_MAX} 張照片`);return}
  /* 讀取中顯示進度（手機上 10 張大照片可能要好幾秒） */
  const btn=$('mdPhotoBtn'),sm=btn.querySelector('small');btn.classList.add('busy');btn.setAttribute('aria-busy','true');
  const out=[];let bad=0;
  try{for(const [i,f] of use.entries()){sm.textContent=use.length>1?`讀取中 ${i+1}/${use.length}…`:'讀取中…';const u=await loadPhoto(f);if(u)out.push(u);else bad++}}
  finally{btn.classList.remove('busy');btn.removeAttribute('aria-busy');sm.textContent=`最多 ${PH_MAX} 張`}
  setPhotos(curPhotos.concat(out));
  if(fs.length>room)toast(`每則最多 ${PH_MAX} 張，已加入前 ${use.length} 張`,2600);else if(bad)toast('有照片無法讀取，請換一張試試',2600)};
/* 讀影片長度並擷取一張封面（解不開的格式就沒有封面，但仍可儲存） */
function probeVideo(f){return new Promise(res=>{const u=URL.createObjectURL(f),v=document.createElement('video');let done=false;
  const end=r=>{if(done)return;done=true;clearTimeout(t);URL.revokeObjectURL(u);res(r)},t=setTimeout(()=>end({dur:v.duration||0,poster:null}),8000);
  v.muted=true;v.playsInline=true;v.preload='auto';
  v.onloadedmetadata=()=>{v.currentTime=Math.min(.5,(v.duration||0)/2)};
  v.onseeked=()=>{try{const s=Math.min(1,640/Math.max(v.videoWidth,v.videoHeight,1)),c=document.createElement('canvas');c.width=Math.round(v.videoWidth*s)||1;c.height=Math.round(v.videoHeight*s)||1;
    c.getContext('2d').drawImage(v,0,0,c.width,c.height);end({dur:v.duration,poster:c.width>1?c.toDataURL('image/jpeg',.72):null})}catch(e){end({dur:v.duration||0,poster:null})}};
  v.onerror=()=>end({dur:0,poster:null});v.src=u})}
$('fVideoIn').onchange=async ev=>{const f=ev.target.files[0];ev.target.value='';if(!f)return;
  if(curPhotos.length){toast('每則紀錄只能放照片或 1 部影片，請先移除照片');return}
  if(!/^video\//.test(f.type)){toast('這個檔案不是影片，請換一個試試');return}
  if(f.size>VID_MAX){toast(`影片太大了（${Math.round(f.size/1048576)} MB），請選 100 MB 以內的影片`,3000);return}
  $('mdVideoBtn').classList.add('busy');$('mdVideoBtn').querySelector('small').textContent='讀取中…';
  try{const p=await probeVideo(f),id='v'+Date.now().toString(36)+Math.random().toString(36).slice(2,6);await mediaPut(id,f);
    setVideo({id,poster:p.poster,dur:Math.round(p.dur||0),type:f.type,size:f.size});if(!p.poster)toast('已加入影片（這個格式無法顯示預覽畫面）',2800)}
  catch(e){toast('影片無法儲存，可能是裝置空間不足',3000)}
  finally{$('mdVideoBtn').classList.remove('busy');$('mdVideoBtn').querySelector('small').textContent='1 部・100 MB 內'}};
$('mdPhotoBtn').onclick=()=>{if(!$('mdPhotoBtn').classList.contains('busy'))$('fPhoto').click()};
$('mdVideoBtn').onclick=()=>{if(!$('mdVideoBtn').classList.contains('busy'))$('fVideoIn').click()};
/* 定位結果轉成看得懂的地點：30 公里內有已知城市就寫「台北附近」，否則座標只留到小數兩位（約 1 公里），
   避免精確座標出現在日記和分享圖卡上；使用者仍可自己改 */
function geoName(la,lo){let best=null,bd=1e9;const R=6371,rad=Math.PI/180;
  REGIONS.forEach(([,l])=>l.forEach(([n,a,b])=>{if(b==null)return;const dLa=(a-la)*rad,dLo=(b-lo)*rad,h=Math.sin(dLa/2)**2+Math.cos(la*rad)*Math.cos(a*rad)*Math.sin(dLo/2)**2,d=2*R*Math.asin(Math.sqrt(h));if(d<bd){bd=d;best=n}}));
  return best&&bd<=30?`${best}附近`:`${la.toFixed(2)}, ${lo.toFixed(2)}`}
$('geo').onclick=()=>{if(!navigator.geolocation){toast('這個裝置不支援定位，請手動輸入地點');return}$('geo').lastChild.textContent='定位中…';
  navigator.geolocation.getCurrentPosition(p=>{$('fLoc').value=geoName(p.coords.latitude,p.coords.longitude);$('geo').lastChild.textContent='定位';onEdit()},
  ()=>{$('geo').lastChild.textContent='定位';toast('無法取得位置，請手動輸入地點')},{timeout:8000})};
$('newBtn').onclick=()=>openEditor();
