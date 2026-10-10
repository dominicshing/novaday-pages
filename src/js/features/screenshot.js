/* 擷取目前可見的 App 畫面；在本機產生 PNG，預覽後儲存或分享。 */
let screenshotBusy=false,screenshotBlob=null,screenshotUrl=null,screenshotName='';
const SCREENSHOT_ICON='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5l1.5-2h5L16 5h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z"/><circle cx="12" cy="13" r="4"/></svg>';
function screenshotButton(){const b=document.createElement('button');b.type='button';b.className='icon-btn screenshot-trigger';b.setAttribute('aria-label','擷取畫面');b.title='擷取畫面';b.dataset.screenshotIgnore='';b.innerHTML=SCREENSHOT_ICON;b.onclick=captureScreenshot;return b}
/* 與現有搜尋／設定／頭像共用頁首操作區，不遮擋內容。 */
for(const selector of ['.home-top','#logTop .hr-act','#atTop .log-hrow','#s-me > .top']){
  const host=document.querySelector(selector);let actions=host;
  if(!host.classList.contains('hr-act')){actions=document.createElement('div');actions.className='screenshot-actions';host.appendChild(actions);actions.appendChild(actions.previousElementSibling)}
  actions.prepend(screenshotButton());
}
const screenshotCompact=document.createElement('div');screenshotCompact.className='screenshot-actions';$('compactBar').appendChild(screenshotCompact);screenshotCompact.append(screenshotButton(),$('cbAv'));

async function captureScreenshot(){
  if(screenshotBusy||!$('lock').hidden||!$('onb').hidden)return;
  const returnFocus=document.activeElement;
  screenshotBusy=true;$('screenshotStatus').textContent='正在擷取畫面…';toast('正在擷取畫面…');
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
    /* 插畫保留原生 SVG 與樣式，避免逐一計算數千個星點節點的樣式。 */
    const artworkCss=[...document.styleSheets].map(sheet=>{try{return [...sheet.cssRules].map(rule=>rule.cssText).join('\n')}catch(e){return ''}}).join('\n');
    const blob=await modernScreenshot.domToBlob(device,{
      width:device.offsetWidth,height:device.offsetHeight,scale:2,type:'image/png',backgroundColor:'#070A1C',timeout:10000,
      style:{transform:'none',boxShadow:'none',margin:'0'},
      features:{restoreScrollPosition:true},
      filter:node=>{
        if(!(node instanceof Element))return true;
        if(node.parentElement?.matches('.at-card > svg'))return false;
        if(node.matches('[data-screenshot-ignore]:not(.screenshot-trigger),.hw,.toast,.dv-pill,.ptr,.ptr-fill')||outsideBlocks.has(node.parentElement))return false;
        if(node.matches('.screen:not(.active),.layer:not(.open),.overlay:not(.show),[hidden]'))return false;
        return true;
      },
      onCloneEachNode:node=>{if(node instanceof Element&&node.style){
        node.style.animation='none';node.style.transition='none';
        /* SVG foreignObject 中的背景模糊會把鄰近文字一起模糊，改保留原本底色。 */
        node.style.backdropFilter='none';node.style.webkitBackdropFilter='none';
        if(node.matches('.screenshot-trigger'))node.style.visibility='hidden';
        if(node.matches('.at-card')){node.style.contentVisibility='visible';const svg=node.querySelector(':scope > svg'),art=cardArt.get(node.dataset.k);if(svg&&art)svg.innerHTML=art}
      }},
      onCloneNode:clone=>{
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
    const img=new Image();img.alt='目前 App 畫面的截圖';img.src=screenshotUrl;$('screenshotPreview').replaceChildren(img);
    openSheet('screenshotSheet');$('screenshotSheet')._last=returnFocus;$('screenshotSheet')._lastKey=null;
    $('screenshotStatus').textContent='截圖已產生，可以儲存或分享';
  }catch(e){$('screenshotStatus').textContent='截圖失敗，請再試一次';toast('截圖失敗，請再試一次',3000)}
  finally{screenshotBusy=false;buttons.forEach(b=>{b.disabled=false;b.removeAttribute('aria-busy')})}
}
$('screenshotSave').onclick=async()=>{
  if(!screenshotBlob)return;
  try{if(await saveFile(screenshotName,screenshotBlob,'image/png'))toast('已儲存截圖')}
  catch(e){toast('無法下載，請長按圖片儲存',3000)}
};
$('screenshotShare').onclick=async()=>{
  if(!screenshotBlob)return;
  const file=new File([screenshotBlob],screenshotName,{type:'image/png'});
  try{if(navigator.canShare?.({files:[file]})){await navigator.share({files:[file],title:'Novaday 畫面截圖'});return}}
  catch(e){if(e?.name==='AbortError')return}
  $('screenshotSave').click();
};
