/* 擷取目前可見的 App 畫面；在本機產生 PNG，預覽後儲存或分享。 */
let screenshotBusy=false,screenshotBlob=null,screenshotUrl=null,screenshotName='';
const SCREENSHOT_ICON='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5l1.5-2h5L16 5h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z"/><circle cx="12" cy="13" r="4"/></svg>';
$('screenshotCapture').innerHTML=SCREENSHOT_ICON+`<span>${tl('擷取畫面')}</span>`;
$('screenshotCapture').onclick=captureScreenshot;
/* 密碼鎖顯示時（這時不能截圖），截圖按鈕設為 inert：Tab 不會跑到這裡，螢幕報讀也不會讀到。引導頁可以截圖 */
{const tools=document.querySelector('.preview-tools'),sync=()=>{tools.inert=!$('lock').hidden};
  new MutationObserver(sync).observe($('lock'),{attributes:true,attributeFilter:['hidden']});sync()}

async function captureScreenshot(){
  if(screenshotBusy||recordingInProgress()||!$('lock').hidden)return;
  const returnFocus=document.activeElement;
  screenshotBusy=true;$('screenshotStatus').textContent=tl('正在擷取畫面…');toast(tl('正在擷取畫面…'));
  syncRecordingControls();
  const buttons=[...document.querySelectorAll('.screenshot-trigger')];buttons.forEach(b=>{b.disabled=true;b.setAttribute('aria-busy','true')});
  try{
    await document.fonts.ready;
    const device=$('device'),bounds=device.getBoundingClientRect();
    const stickySelector='.screen.active .top,.screen.active .day-head';
    const stickyOffsets=[...device.querySelectorAll(stickySelector)].map(el=>{
      if(getComputedStyle(el).position!=='sticky')return 0;
      const top=el.getBoundingClientRect().top,style=el.style.cssText;
      /* 同步量測正常流位置後立即還原，不移動使用者的捲動位置。 */
      el.style.position='relative';el.style.top='0';
      const normalTop=el.getBoundingClientRect().top;el.style.cssText=style;
      return (top-normalTop)/(bounds.height/device.offsetHeight);
    });
    const outsideBlocks=new Set([...device.querySelectorAll('.at-card,.rk-card,.medal')].filter(el=>{const r=el.getBoundingClientRect();return r.bottom<=bounds.top||r.top>=bounds.bottom||r.right<=bounds.left||r.left>=bounds.right}));
    const cardArt=new Map([...device.querySelectorAll('.screen.active .at-card')].filter(el=>!outsideBlocks.has(el)).map(el=>[el.dataset.k,el.querySelector(':scope > svg')?.innerHTML]));
    /* 心情星星等共用的 SVG 漸層、裁切放在 #device 外面，要一起帶進截圖；漸層顏色用了 CSS 變數，先換成實際色值 */
    const sharedDefs=[...document.querySelectorAll('svg defs')].filter(d=>!device.contains(d)).map(d=>{const c=d.cloneNode(true),to=c.querySelectorAll('stop');
      d.querySelectorAll('stop').forEach((s,i)=>{const cs=getComputedStyle(s);to[i].style.stopColor=cs.stopColor;to[i].style.stopOpacity=cs.stopOpacity});return c.outerHTML}).join('');
    /* 插畫保留原生 SVG 與樣式，避免逐一計算數千個星點節點的樣式。 */
    const artworkCss=[...document.styleSheets].map(sheet=>{try{return [...sheet.cssRules].map(rule=>rule.cssText).join('\n')}catch(e){return ''}}).join('\n');
    const blob=await modernScreenshot.domToBlob(device,{
      width:device.offsetWidth,height:device.offsetHeight,scale:2,type:'image/png',backgroundColor:'#070A1C',timeout:10000,
      style:{transform:'none',boxShadow:'none',margin:'0'},
      features:{restoreScrollPosition:true},
      filter:node=>{
        if(!(node instanceof Element))return true;
        if(node.parentElement?.matches('.at-card > svg'))return false;
        if(node.matches('[data-screenshot-ignore],.hw,.toast,.dv-pill,.ptr,.ptr-fill')||outsideBlocks.has(node.parentElement))return false;
        if(node.matches('.screen:not(.active),.layer:not(.open),.overlay:not(.show),[hidden]'))return false;
        return true;
      },
      onCloneEachNode:node=>{if(node instanceof Element&&node.style){
        node.style.animation='none';node.style.transition='none';
        /* SVG foreignObject 中的背景模糊會把鄰近文字一起模糊，改保留原本底色。 */
        node.style.backdropFilter='none';node.style.webkitBackdropFilter='none';
        /* SVG 圖形：複製來的是動畫進行到一半的 transform，原點又是 px（少了 transform-box），心情星星的光芒、目標星的光圈會跑位；改回 transform 屬性與樣式表 */
        if(node instanceof SVGElement){node.style.transform='';node.style.transformOrigin=''}
        /* 複本每個元素都寫死了文字填色（會繼承），蓋過 placeholder 的淡色；空白的輸入框改成跟著各自的文字顏色 */
        if(node.matches('input,textarea')&&!node.value)node.style.webkitTextFillColor='currentcolor';
        if(node.matches('.at-card')){node.style.contentVisibility='visible';const svg=node.querySelector(':scope > svg'),art=cardArt.get(node.dataset.k);if(svg&&art)svg.innerHTML=art}
      }},
      onCloneNode:clone=>{
        if(sharedDefs)clone.insertAdjacentHTML('afterbegin',`<svg width="0" height="0" style="position:absolute;width:0;height:0" aria-hidden="true">${sharedDefs}</svg>`);
        const style=document.createElement('style');style.textContent=artworkCss+'\n*{animation:none!important;transition:none!important}';clone.prepend(style);
        /* 捲動內容位移後，固定頁首仍留在畫面頂端。 */
        clone.querySelectorAll(stickySelector).forEach((el,i)=>{
          const offset=stickyOffsets[i]||0,matrix=new DOMMatrix(el.style.transform);matrix.m42+=offset;el.style.transform=matrix.toString();
          if(offset>0){el.style.backgroundColor='#070A1C';el.style.backgroundImage='none'}
        });
        clone.querySelectorAll('[autofocus]').forEach(el=>el.removeAttribute('autofocus'));
      }
    });
    if(!blob||!blob.size)throw new Error('Empty screenshot');
    if(!$('lock').hidden)return;
    if(screenshotUrl)URL.revokeObjectURL(screenshotUrl);
    screenshotBlob=blob;screenshotUrl=URL.createObjectURL(blob);
    const now=new Date();screenshotName=`Novaday-${cur}-${ymd(now)}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}.png`;
    const img=new Image();img.alt=tl('目前 App 畫面的截圖');img.src=screenshotUrl;$('screenshotPreview').replaceChildren(img);
    openSheet('screenshotSheet');$('screenshotSheet')._last=returnFocus;$('screenshotSheet')._lastKey=null;
    $('screenshotStatus').textContent=tl('截圖已產生，可以儲存或分享');
  }catch(e){$('screenshotStatus').textContent=tl('截圖失敗，請再試一次');toast(tl('截圖失敗，請再試一次'),3000)}
  finally{screenshotBusy=false;buttons.forEach(b=>{b.disabled=false;b.removeAttribute('aria-busy')});syncRecordingControls()}
}
$('screenshotSave').onclick=async()=>{
  if(!screenshotBlob)return;
  try{if(await saveFile(screenshotName,screenshotBlob,'image/png'))toast(tl('已儲存截圖'))}
  catch(e){toast(tl('無法下載，請長按圖片儲存'),3000)}
};
$('screenshotShare').onclick=async()=>{
  if(!screenshotBlob)return;
  const file=new File([screenshotBlob],screenshotName,{type:'image/png'});
  try{if(navigator.canShare?.({files:[file]})){await navigator.share({files:[file],title:tl('Novaday 畫面截圖')});return}}
  catch(e){if(e?.name==='AbortError')return}
  $('screenshotSave').click();
};
