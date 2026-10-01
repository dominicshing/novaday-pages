/* 日記頁往下捲時收合頂部：標題縮小並與切換鈕同列，搜尋列收起；回到頂部時展開 */
(()=>{const sc=$('s-log'),top=$('logTop');let c=false,raf=0;
  const set=v=>{if(v===c)return;c=v;top.classList.toggle('cmp',v);requestAnimationFrame(()=>sc.style.setProperty('--logTop',top.offsetHeight+'px'))};
  sc.addEventListener('scroll',()=>{if(raf)return;raf=requestAnimationFrame(()=>{raf=0;const y=sc.scrollTop;if(!c&&y>72)set(true);else if(c&&y<8)set(false)})},{passive:true});
  $('logFind').onclick=()=>{sc.scrollTo({top:0,behavior:reduce?'auto':'smooth'});setTimeout(()=>{set(false);$('q').focus({preventScroll:true})},reduce?0:320)};
  new ResizeObserver(()=>sc.style.setProperty('--logTop',top.offsetHeight+'px')).observe(top)})();
$('liSamples').onclick=async()=>{const n=entries.filter(isSample).length;const k=await ask('清除範例紀錄？',`會移除 ${n} 則範例紀錄，你自己寫的紀錄不受影響。`,[{k:'cancel',t:'取消'},{k:'ok',t:'清除範例',cls:'danger'}]);
  if(k!=='ok')return;entries=entries.filter(e=>!isSample(e));save();render();toast('已清除範例紀錄')};
$('rpOpen').onclick=()=>{const n=new Date();openReport(n.getFullYear(),n.getMonth())};
$('dlEx').onclick=async()=>{const dl=window.claude&&await window.claude.use('downloads').catch(()=>null);if(!dl){toast('這個環境無法下載，請改用「複製內容」',3000);return}
  const js=fmt!=='text',d=ymd(new Date());try{await dl.save({filename:`Novaday-${fmt==='full'?'備份':'紀錄'}-${d}.${js?'json':'txt'}`,data:exportText(true)});toast(fmt==='full'?'已下載完整備份':'已下載檔案')}catch(e){if(e&&e.code!=='declined')toast('無法下載，請改用「複製內容」',3000)}};

