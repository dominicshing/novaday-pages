/* 編輯個人資料 */
function fillDays(){const m=+$('inBM').value,sel=$('inBD'),keep=sel.value,n=m?new Date(2000,m,0).getDate():31;
  sel.innerHTML='<option value="">日期</option>'+Array.from({length:n},(_,k)=>`<option value="${k+1}">${k+1} 日</option>`).join('');if(keep&&+keep<=n)sel.value=keep}
function meDraft(){const m=$('inBM').value,d=$('inBD').value;
  return{avatar:pickAv,photoAv:pickPh,name:$('inName').value.trim(),motto:$('inMotto').value.trim(),birthday:m&&d?`2000-${pad(m)}-${pad(d)}`:null}}
function meUpdate(){const d=meDraft(),zi=signIdx(d.birthday);
  $('mePrevAv').innerHTML=avHTML(d.avatar,d.photoAv);$('mePrevName').textContent=d.name||'星旅人';$('mePrevMotto').textContent=d.motto;
  ['inBM','inBD'].forEach(id=>$(id).classList.toggle('ph',!$(id).value));
  $('mePrevSign').innerHTML=zi<0?'':`${zg(zi)} ${ZODIAC[zi].n}`;
  [['inName','cntName'],['inMotto','cntMotto']].forEach(([a,c])=>{const el=$(a),n=el.value.length,mx=+el.maxLength;$(c).textContent=`${n}/${mx}`;$(c).classList.toggle('full',n>=mx)});
  const half=!!$('inBM').value!==!!$('inBD').value;
  $('bdSign').classList.toggle('on',zi>=0);
  $('bdSign').innerHTML=zi>=0?`<span class="zo">${zRing()}<span class="zg" aria-hidden="true">${zg(zi)}</span></span><span><b>你是${ZODIAC[zi].n}</b><small>${zRange(zi)}・${ZODIAC[zi].el}星座・${ZODIAC[zi].kw.join('、')}</small></span>`
    :half?'<span>再選擇'+($('inBM').value?'日期':'月份')+'，就能看到你的星座。</span>':'<span>選擇生日的月份和日期，就能看到你的星座與本月運勢。</span>';
  $('bdClear').hidden=!$('inBM').value&&!$('inBD').value;
  $('meSave').disabled=JSON.stringify(d)===meSnap||half}
function openMeEdit(focusBday){pickAv=prof.avatar;pickPh=prof.photoAv||null;lastEmoji=AVATARS.includes(prof.avatar)?prof.avatar:'moon';renderAvs();
  $('inName').value=prof.name||'';$('inMotto').value=prof.motto||'';
  const b=prof.birthday?prof.birthday.split('-'):null;$('inBM').value=b?String(+b[1]):'';fillDays();$('inBD').value=b?String(+b[2]):'';
  meSnap='';meSnap=JSON.stringify(meDraft());meUpdate();$('meForm').querySelector('.sb').scrollTop=0;openSheet('meSheet');
  if(focusBday===true)setTimeout(()=>{scrollToEl($('bdSec'),'top');const s=$('bdSec');s.classList.remove('flash');void s.offsetWidth;s.classList.add('flash');$('inBM').focus({preventScroll:true})},reduce?0:360)}
['inName','inMotto'].forEach(id=>$(id).addEventListener('input',meUpdate));
$('inBM').addEventListener('change',()=>{fillDays();meUpdate()});
$('inBD').addEventListener('change',meUpdate);
$('bdClear').onclick=()=>{$('inBM').value='';fillDays();$('inBD').value='';meUpdate()};
$('inName').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();$('inMotto').focus()}});
async function tryCloseMe(){if(JSON.stringify(meDraft())===meSnap){closeSheet('meSheet');return}
  const k=await ask('要放棄這些修改嗎？','剛剛的修改還沒有儲存。',[{k:'keep',t:'繼續編輯',cls:'primary'},{k:'discard',t:'放棄修改',cls:'danger'}]);if(k==='discard')closeSheet('meSheet')}
$('meForm').addEventListener('submit',e=>{e.preventDefault();if($('meSave').disabled)return;const d=meDraft(),hadSign=signIdx(prof.birthday)>=0;
  Object.assign(prof,d,{name:d.name||'星旅人'});saveProf();closeSheet('meSheet');renderMe();renderGalaxy();renderAppBar();renderFortuneCard();
  const zi=signIdx(prof.birthday);toast(zi>=0&&!hadSign?`已設定星座：${ZODIAC[zi].n}，看看你的本月運勢吧`:'已更新個人資料',zi>=0&&!hadSign?3000:2200)});
