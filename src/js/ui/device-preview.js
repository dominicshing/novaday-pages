/* 電腦預覽：等比縮放手機外框、狀態列時鐘 */
function fitDevice(){const d=$('device');if(!isFrame()){d.style.transform='';return}
  const f=window.devFrame||{w:390,h:844},s=Math.min(1,(innerHeight-parseFloat(getComputedStyle(document.body).paddingTop)-56)/(f.h+30),(innerWidth-48)/(f.w+46));d.style.transform=`scale(${s.toFixed(3)})`}
addEventListener('resize',fitDevice);
fitDevice();
function tick(){const n=new Date();$('sysTime').textContent=(n.getHours()%12||12)+':'+pad(n.getMinutes());if(n.getMinutes()===0)renderAppBar()}
tick();
setInterval(tick,15000);
