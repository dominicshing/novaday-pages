/* 頭像：選擇、上傳、裁切 */
let pickAv=prof.avatar,pickPh=prof.photoAv||null,lastEmoji='moon',meSnap='';
/* 裁切完成後要交給誰：null＝編輯個人資料；引導頁會暫時設成自己的回呼 */
let avTarget=null;
const CAM_SVG='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8.5A1.5 1.5 0 0 1 5.5 7h2l1.4-2h6.2L16.5 7h2A1.5 1.5 0 0 1 20 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5z"/><circle cx="12" cy="12.8" r="3.3"/></svg>';
function popPrev(){const v=$('mePrevAv');v.classList.remove('pop');void v.offsetWidth;v.classList.add('pop')}
function pickAvatar(a){if(a!=='photo')lastEmoji=a;pickAv=a;renderAvs();popPrev();meUpdate()}
function renderAvs(){const has=!!pickPh,on=pickAv==='photo';
  const up=`<button type="button" class="av av-up2${has?' has':''}" role="radio" aria-checked="${on}" aria-label="${tl(has?(on?'我的照片（使用中），點一下查看選項':'使用我的照片'):'上傳照片當頭像')}" id="avPhTile">${has?`<img class="av-img" src="${pickPh}" alt="">`:''}<span class="avp-ic" aria-hidden="true">${CAM_SVG}</span></button>`;
  $('avs').innerHTML=up+AVATARS.map(a=>`<button type="button" class="av" role="radio" aria-checked="${a===pickAv}" aria-label="${tl('頭像：{a}',{a:AVK[a].n})}" data-a="${a}">${avSVG(a)}</button>`).join('');
  $('avs').querySelectorAll('.av[data-a]').forEach(b=>b.onclick=()=>pickAvatar(b.dataset.a));
  $('avPhTile').onclick=()=>!has?openAvSrc():on?openAvOpt():pickAvatar('photo');
  $('avNow').textContent=on?tl('目前：我的照片'):tl('目前：{a}',{a:AVK[pickAv].n});
  $('meAvBtn').setAttribute('aria-label',tl(has?'照片頭像選項':'上傳照片當頭像'))}
function openAvOpt(){$('aoAv').innerHTML=`<img class="av-img" src="${pickPh}" alt="">`;$('aoUse').hidden=pickAv==='photo';openSheet('avOpt')}
function openAvSrc(){avTarget=null;openSheet('avSrc')}
$('meAvBtn').onclick=()=>pickPh?openAvOpt():openAvSrc();
$('aoUse').onclick=()=>{closeSheet('avOpt');pickAvatar('photo')};
$('aoNew').onclick=()=>{closeSheet('avOpt');openAvSrc()};
$('aoRm').onclick=()=>{closeSheet('avOpt');pickPh=null;if(pickAv==='photo')pickAv=lastEmoji;renderAvs();popPrev();meUpdate();toast(tl('已移除照片，按「儲存」後生效'))};
$('asrCam').onclick=()=>{closeSheet('avSrc');$('avFileCam').click()};
$('asrGal').onclick=()=>{closeSheet('avSrc');$('avFile').click()};
const crop={img:null,w:0,h:0,z:1,tx:0,ty:0,pts:new Map(),pinch:null};
function handleAvFile(f){if(!f)return;
  if(!/^image\//.test(f.type)&&!/\.(heic|heif|jpe?g|png|webp|gif)$/i.test(f.name)){toast(tl('請選擇圖片檔'));return}
  if(f.size>25*1024*1024){toast(tl('圖片太大了，請選 25 MB 以內的照片'),2800);return}
  /* 上一次選的照片（例如裁切時按了取消）先釋放，避免大圖一直佔著記憶體 */
  if(crop.url){URL.revokeObjectURL(crop.url);crop.url=null}
  const url=URL.createObjectURL(f),img=new Image();crop.url=url;
  img.onload=()=>{crop.img=img;crop.w=img.naturalWidth;crop.h=img.naturalHeight;crop.z=1;crop.tx=crop.ty=0;
    const ci=$('cropImg');ci.src=url;$('cropZoom').value=1;openSheet('cropSheet');requestAnimationFrame(()=>{cropApply();$('cropOk').focus({preventScroll:true})})};
  img.onerror=()=>{URL.revokeObjectURL(url);toast(tl('無法讀取這張圖片，請改用 JPG 或 PNG'),3000)};img.src=url}
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
