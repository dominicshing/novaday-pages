/* 錯誤回報：若在任何環境中程式出錯，於畫面上顯示原因，方便排查 */
(function(){function log(msg,src){try{var k='novaday.dev.errors',a=JSON.parse(localStorage.getItem(k)||'[]');a.unshift({t:Date.now(),m:String(msg).slice(0,500),s:src||''});localStorage.setItem(k,JSON.stringify(a.slice(0,30)))}catch(_){}}
  function show(msg,src){log(msg,src);try{var d=document.getElementById('errBox');if(!d){d=document.createElement('div');d.id='errBox';
  d.style.cssText='position:fixed;left:12px;right:12px;top:12px;z-index:9999;padding:10px 12px;border-radius:12px;background:#3A1024;color:#FFD7E4;font:13px/1.5 system-ui,sans-serif;border:1px solid #FF7A8A;white-space:pre-wrap';
  d.title='點一下關閉';d.onclick=function(){d.remove()};document.body.appendChild(d)}d.textContent='⚠️ Novaday 載入時發生錯誤：\n'+msg}catch(_){}}
  window.addEventListener('error',function(e){show((e.message||'未知錯誤')+(e.lineno?'（第 '+e.lineno+' 行）':''),(e.filename||'').split('/').pop())});
  window.addEventListener('unhandledrejection',function(e){show(String(e.reason&&e.reason.message||e.reason))})})();
