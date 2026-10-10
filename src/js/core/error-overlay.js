/* 錯誤提示：程式出錯時在畫面上顯示原因，並記錄到開發者工具的「錯誤紀錄」（最先載入，獨立於其他程式） */
(function(){
  /* 介面語言（這個檔案比 i18n.js 先載入，自己讀設定） */
  var L='zh-Hant';try{L=JSON.parse(localStorage.getItem('orbitlog.profile.v1')||'{}').lang||L}catch(_){}
  var Z=['點一下關閉','⚠️ Novaday 載入時發生錯誤：\n','未知錯誤','（第 ',' 行）'],
    T={'zh-Hans':['点一下关闭','⚠️ Novaday 加载时发生错误：\n','未知错误','（第 ',' 行）'],en:['Tap to close','⚠️ Novaday ran into an error while loading:\n','Unknown error',' (line ',')']}[L]||Z;
  function log(msg,src){try{var k='novaday.dev.errors',a=JSON.parse(localStorage.getItem(k)||'[]');a.unshift({t:Date.now(),m:String(msg).slice(0,500),s:src||''});localStorage.setItem(k,JSON.stringify(a.slice(0,30)))}catch(_){}}
  function show(msg,src){log(msg,src);try{var d=document.getElementById('errBox');if(!d){d=document.createElement('div');d.id='errBox';
  d.style.cssText='position:fixed;left:12px;right:12px;top:12px;z-index:9999;padding:10px 12px;border-radius:12px;background:#3A1024;color:#FFD7E4;font:13px/1.5 system-ui,sans-serif;border:1px solid #FF7A8A;white-space:pre-wrap';
  d.title=T[0];d.onclick=function(){d.remove()};document.body.appendChild(d)}d.textContent=T[1]+msg}catch(_){}}
  window.addEventListener('error',function(e){show((e.message||T[2])+(e.lineno?T[3]+e.lineno+T[4]:''),(e.filename||'').split('/').pop())});
  window.addEventListener('unhandledrejection',function(e){show(String(e.reason&&e.reason.message||e.reason))})})();
