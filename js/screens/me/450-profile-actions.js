/* ---------- Profile actions ---------- */
let pickAv=prof.avatar,pickPh=prof.photoAv||null,lastEmoji='moon',meSnap='';
/* 裁切完成後要交給誰：null＝編輯個人資料；引導頁會暫時設成自己的回呼 */
let avTarget=null;
const CAM_SVG='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8.5A1.5 1.5 0 0 1 5.5 7h2l1.4-2h6.2L16.5 7h2A1.5 1.5 0 0 1 20 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5z"/><circle cx="12" cy="12.8" r="3.3"/></svg>';
function popPrev(){const v=$('mePrevAv');v.classList.remove('pop');void v.offsetWidth;v.classList.add('pop')}
function pickAvatar(a){if(a!=='photo')lastEmoji=a;pickAv=a;renderAvs();popPrev();meUpdate()}
function renderAvs(){const has=!!pickPh,on=pickAv==='photo';
  const up=`<button type="button" class="av av-up2${has?' has':''}" role="radio" aria-checked="${on}" aria-label="${has?(on?'我的照片（使用中），點一下查看選項':'使用我的照片'):'上傳照片當頭像'}" id="avPhTile">${has?`<img class="av-img" src="${pickPh}" alt="">`:''}<span class="avp-ic" aria-hidden="true">${CAM_SVG}</span></button>`;
  $('avs').innerHTML=up+AVATARS.map(a=>`<button type="button" class="av" role="radio" aria-checked="${a===pickAv}" aria-label="頭像：${AVK[a].n}" data-a="${a}">${avSVG(a)}</button>`).join('');
  $('avs').querySelectorAll('.av[data-a]').forEach(b=>b.onclick=()=>pickAvatar(b.dataset.a));
  $('avPhTile').onclick=()=>!has?openAvSrc():on?openAvOpt():pickAvatar('photo');
  $('avNow').textContent=on?'目前：我的照片':`目前：${AVK[pickAv].n}`;
  $('meAvBtn').setAttribute('aria-label',has?'照片頭像選項':'上傳照片當頭像')}
function openAvOpt(){$('aoAv').innerHTML=`<img class="av-img" src="${pickPh}" alt="">`;$('aoUse').hidden=pickAv==='photo';openSheet('avOpt')}
function openAvSrc(){avTarget=null;openSheet('avSrc')}
$('meAvBtn').onclick=()=>pickPh?openAvOpt():openAvSrc();
$('aoUse').onclick=()=>{closeSheet('avOpt');pickAvatar('photo')};
$('aoNew').onclick=()=>{closeSheet('avOpt');openAvSrc()};
$('aoRm').onclick=()=>{closeSheet('avOpt');pickPh=null;if(pickAv==='photo')pickAv=lastEmoji;renderAvs();popPrev();meUpdate();toast('已移除照片，按「儲存」後生效')};
$('asrCam').onclick=()=>{closeSheet('avSrc');$('avFileCam').click()};
$('asrGal').onclick=()=>{closeSheet('avSrc');$('avFile').click()};
/* ---- 頭像裁切 ---- */
const crop={img:null,w:0,h:0,z:1,tx:0,ty:0,pts:new Map(),pinch:null};
function handleAvFile(f){if(!f)return;
  if(!/^image\//.test(f.type)&&!/\.(heic|heif|jpe?g|png|webp|gif)$/i.test(f.name)){toast('請選擇圖片檔');return}
  if(f.size>25*1024*1024){toast('圖片太大了，請選 25 MB 以內的照片',2800);return}
  const url=URL.createObjectURL(f),img=new Image();
  img.onload=()=>{crop.img=img;crop.w=img.naturalWidth;crop.h=img.naturalHeight;crop.z=1;crop.tx=crop.ty=0;
    const ci=$('cropImg');ci.src=url;$('cropZoom').value=1;openSheet('cropSheet');requestAnimationFrame(()=>{cropApply();$('cropOk').focus({preventScroll:true})})};
  img.onerror=()=>{URL.revokeObjectURL(url);toast('無法讀取這張圖片，請改用 JPG 或 PNG',3000)};img.src=url}
$('avFile').addEventListener('change',e=>{const f=e.target.files&&e.target.files[0];e.target.value='';handleAvFile(f)});
$('avFileCam').addEventListener('change',e=>{const f=e.target.files&&e.target.files[0];e.target.value='';handleAvFile(f)});
function cropGeo(){const S=$('cropStage').clientWidth||300,D=S*.86,base=D/Math.min(crop.w,crop.h),sc=base*crop.z;return{S,D,sc}}
function cropClamp(){const{D,sc}=cropGeo(),mx=Math.max(0,(crop.w*sc-D)/2),my=Math.max(0,(crop.h*sc-D)/2);
  crop.tx=Math.min(mx,Math.max(-mx,crop.tx));crop.ty=Math.min(my,Math.max(-my,crop.ty))}
function cropApply(){if(!crop.img)return;cropClamp();const{sc}=cropGeo(),ci=$('cropImg');
  ci.style.width=crop.w+'px';ci.style.height=crop.h+'px';
  ci.style.transform=`translate(-50%,-50%) translate(${crop.tx}px,${crop.ty}px) scale(${sc})`;
  cancelAnimationFrame(crop.raf);crop.raf=requestAnimationFrame(()=>['cropPv1','cropPv2','cropPv3'].forEach(id=>cropDraw($(id))))}
function cropDraw(cv){const{D,sc}=cropGeo(),n=cv.width,x=cv.getContext('2d');
  const sw=D/sc,sx=(crop.w*sc/2-D/2-crop.tx)/sc,sy=(crop.h*sc/2-D/2-crop.ty)/sc;
  x.imageSmoothingQuality='high';x.fillStyle='#0C1030';x.fillRect(0,0,n,n);x.drawImage(crop.img,sx,sy,sw,sw,0,0,n,n);return cv}
function cropZoomTo(z,cx,cy){const oz=crop.z;z=Math.min(4,Math.max(1,z));if(z===oz)return;
  if(cx!=null){const r=$('cropStage').getBoundingClientRect(),px=cx-r.left-r.width/2,py=cy-r.top-r.height/2,k=z/oz;crop.tx=px-(px-crop.tx)*k;crop.ty=py-(py-crop.ty)*k}
  else{crop.tx*=z/oz;crop.ty*=z/oz}
  crop.z=z;$('cropZoom').value=z;cropApply()}
(()=>{const st=$('cropStage');
  st.addEventListener('pointerdown',e=>{st.setPointerCapture(e.pointerId);crop.pts.set(e.pointerId,{x:e.clientX,y:e.clientY});st.classList.add('drag');
    if(crop.pts.size===2){const[a,b]=[...crop.pts.values()];crop.pinch={d:Math.hypot(a.x-b.x,a.y-b.y),z:crop.z}}});
  st.addEventListener('pointermove',e=>{const p=crop.pts.get(e.pointerId);if(!p)return;
    if(crop.pts.size===1){crop.tx+=e.clientX-p.x;crop.ty+=e.clientY-p.y;p.x=e.clientX;p.y=e.clientY;cropApply();return}
    p.x=e.clientX;p.y=e.clientY;const[a,b]=[...crop.pts.values()];if(crop.pinch)cropZoomTo(crop.pinch.z*Math.hypot(a.x-b.x,a.y-b.y)/crop.pinch.d,(a.x+b.x)/2,(a.y+b.y)/2)});
  const up=e=>{crop.pts.delete(e.pointerId);if(crop.pts.size<2)crop.pinch=null;if(!crop.pts.size)st.classList.remove('drag')};
  st.addEventListener('pointerup',up);st.addEventListener('pointercancel',up);
  st.addEventListener('wheel',e=>{e.preventDefault();cropZoomTo(crop.z*Math.exp(-e.deltaY*.0015),e.clientX,e.clientY)},{passive:false});
  st.addEventListener('dblclick',e=>cropZoomTo(crop.z>1.5?1:2,e.clientX,e.clientY));
  $('cropZoom').addEventListener('input',e=>cropZoomTo(+e.target.value));
  $('cropMinus').onclick=()=>cropZoomTo(crop.z-.25);$('cropPlus').onclick=()=>cropZoomTo(crop.z+.25);
  window.addEventListener('resize',()=>$('cropSheet').classList.contains('open')&&cropApply())})();
$('cropOk').onclick=()=>{if(!crop.img)return;const cv=document.createElement('canvas');cv.width=cv.height=320;cropDraw(cv);
  let out=cv.toDataURL('image/webp',.84);if(!out.startsWith('data:image/webp'))out=cv.toDataURL('image/jpeg',.84);
  closeSheet('cropSheet');URL.revokeObjectURL($('cropImg').src);crop.img=null;
  if(avTarget){const f=avTarget;avTarget=null;f(out);return}
  pickPh=out;pickAvatar('photo')};
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
$('inBM').addEventListener('change',()=>{fillDays();meUpdate()});$('inBD').addEventListener('change',meUpdate);
$('bdClear').onclick=()=>{$('inBM').value='';fillDays();$('inBD').value='';meUpdate()};
$('inName').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();$('inMotto').focus()}});
async function tryCloseMe(){if(JSON.stringify(meDraft())===meSnap){closeSheet('meSheet');return}
  const k=await ask('要放棄這些修改嗎？','剛剛的修改還沒有儲存。',[{k:'keep',t:'繼續編輯',cls:'primary'},{k:'discard',t:'放棄修改',cls:'danger'}]);if(k==='discard')closeSheet('meSheet')}
$('editMe').onclick=()=>openSheet('settingsSheet');$('liEdit').onclick=()=>openMeEdit();$('achMore').onclick=()=>{achAll=!achAll;renderMe()};
$('pAvRing').style.cursor='pointer';$('pAvRing').onclick=()=>openMeEdit();$('pName').onclick=()=>openMeEdit();
$('pSign').onclick=()=>signIdx(prof.birthday)<0?openBdQuick():openFortune();
$('openMe').onclick=()=>go('me');
$('meForm').addEventListener('submit',e=>{e.preventDefault();if($('meSave').disabled)return;const d=meDraft(),hadSign=signIdx(prof.birthday)>=0;
  Object.assign(prof,d,{name:d.name||'星旅人'});saveProf();closeSheet('meSheet');renderMe();renderGalaxy();renderAppBar();renderFortuneCard();
  const zi=signIdx(prof.birthday);toast(zi>=0&&!hadSign?`已設定星座：${ZODIAC[zi].n}，看看你的本月運勢吧`:'已更新個人資料',zi>=0&&!hadSign?3000:2200)});
$('swRemind').onclick=()=>{prof.remind=!prof.remind;saveProf();renderMe();toast(prof.remind?`已開啟每日提醒（${prof.remindTime}）`:'已關閉每日提醒')};
$('remindTime').onchange=e=>{prof.remindTime=e.target.value;saveProf()};
function applyCalm(){reduce=sysReduce||!!prof.calm;try{['crDefs','fabSvg'].forEach(id=>{const d=$(id);if(d)reduce?d.pauseAnimations():d.unpauseAnimations()})}catch(_){}$('app').classList.toggle('calm',!!prof.calm);reduce?skyApi.still():skyApi.start();if(reduce){galStop();placeGal()}else galStart()}
function applyRed(){$('device').classList.toggle('red',!!prof.red);$('swRed').setAttribute('aria-checked',!!prof.red);document.querySelectorAll('.red-q').forEach(b=>b.setAttribute('aria-pressed',!!prof.red))}
function toggleRed(){prof.red=!prof.red;saveProf();applyRed();toast(prof.red?'已開啟紅光夜視模式':'已關閉紅光夜視模式')}
$('swRed').onclick=toggleRed;
$('swCalm').onclick=()=>{prof.calm=!prof.calm;saveProf();applyCalm();renderMe()};
$('liAbout').onclick=()=>openSheet('aboutSheet');
$('swFig').onclick=()=>{prof.noFig=!prof.noFig;saveProf();renderMe();render();toast(prof.noFig?'已隱藏星座剪影':'已顯示星座剪影')};
$('swObDev').onclick=()=>{prof.devOnb=!prof.devOnb;saveProf();renderMe();toast(prof.devOnb?'下次開啟 App 時會顯示引導':'已關閉引導預覽')};
$('liWipe').onclick=openWipe;

