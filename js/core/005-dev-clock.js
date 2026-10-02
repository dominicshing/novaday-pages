/* ---------- 開發者工具：模擬日期（最早載入，讓所有 new Date() / Date.now() 都使用模擬時間） ---------- */
(()=>{const R=Date;window.__RealDate=R;let off=0;try{off=+localStorage.getItem('novaday.dev.dateOffset')||0}catch(_){}
  if(!off)return;
  class D extends R{constructor(...a){if(a.length)super(...a);else super(R.now()+off)}static now(){return R.now()+off}}
  window.Date=D;window.__devDateOff=off})();
