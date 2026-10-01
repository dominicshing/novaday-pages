/* ---------- 電腦預覽：等比縮放 iPhone 外框、時鐘 ---------- */
function fitDevice(){const d=$('device');if(innerWidth<600){d.style.transform='';return}
  const s=Math.min(1,(innerHeight-56)/(844+30),(innerWidth-48)/(390+46));d.style.transform=`scale(${s.toFixed(3)})`}
addEventListener('resize',fitDevice);fitDevice();
function tick(){const n=new Date();$('sysTime').textContent=(n.getHours()%12||12)+':'+pad(n.getMinutes());if(n.getMinutes()===0)renderAppBar()}
tick();setInterval(tick,15000);

