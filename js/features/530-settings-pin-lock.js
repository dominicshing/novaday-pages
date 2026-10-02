/* 設定：清除範例紀錄 */
function renderSampleRow(){const n=entries.filter(isSample).length,r=$('liSamples');if(!r)return;r.hidden=!n;r.querySelector('small').textContent=`目前有 ${n} 則範例，清除後不影響你自己寫的紀錄`}


/* ---------- 密碼鎖：4 位數 PIN，雜湊後只存在這台裝置；切到背景時模糊內容 ---------- */
async function pinHash(p){const t='novaday:'+p;try{const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(t));return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')}
  catch(e){let h=5381;for(const c of t)h=(h*33^c.charCodeAt(0))>>>0;return 'd'+h}}
let lk={mode:'unlock',buf:'',first:null,done:null,fails:0};
function lkRender(){$('lkDots').querySelectorAll('i').forEach((d,k)=>d.classList.toggle('on',k<lk.buf.length))}
function lkMsg(t,m){$('lkT').textContent=t;$('lkM').textContent=m}
function openLock(mode,done){lk={mode,buf:'',first:null,done,fails:0};$('lock').hidden=false;$('lock').classList.remove('out');
  $('lkCancel').hidden=mode==='unlock';$('lkForgot').hidden=mode!=='unlock';
  mode==='preview'?lkMsg('輸入密碼','預覽模式・輸入任意 4 位數即可離開'):mode==='unlock'?lkMsg('輸入密碼','解鎖你的星空日記'):mode==='set'?lkMsg('設定 4 位數密碼','之後打開 App 時需要輸入'):lkMsg('輸入目前的密碼','確認後才能關閉密碼鎖');lkRender()}
function closeLock(){$('lock').classList.add('out');setTimeout(()=>{$('lock').hidden=true;$('lock').classList.remove('out')},reduce?0:300)}
function lkShake(m){const d=$('lkDots');d.classList.remove('shake');void d.offsetWidth;d.classList.add('shake');$('lkM').textContent=m;lk.buf='';setTimeout(lkRender,300)}
async function lkKey(k){if(k==='del'){lk.buf=lk.buf.slice(0,-1);lkRender();return}if(lk.buf.length>=4)return;lk.buf+=k;lkRender();if(lk.buf.length<4)return;
  const p=lk.buf;await new Promise(r=>setTimeout(r,120));
  if(lk.mode==='preview'){closeLock();toast('密碼鎖預覽結束');return}
  if(lk.mode==='set'){if(!lk.first){lk.first=p;lk.buf='';lkMsg('再輸入一次','確認你的密碼');lkRender();return}
    if(p!==lk.first){lk.first=null;lkMsg('設定 4 位數密碼','');lkShake('兩次輸入不一樣，請重新設定');return}
    prof.pin=await pinHash(p);saveProf();closeLock();syncLockUI();toast('已開啟密碼鎖');return}
  if(await pinHash(p)===prof.pin){if(lk.mode==='off'){prof.pin=null;saveProf();syncLockUI();toast('已關閉密碼鎖')}closeLock();lk.done&&lk.done();return}
  lk.fails++;lkShake(lk.fails>=3?'密碼不正確・忘記的話可以點下方的「忘記密碼？」':'密碼不正確，請再試一次')}
function syncLockUI(){$('swLock').setAttribute('aria-checked',!!prof.pin);$('lkSub').textContent=prof.pin?'已開啟・切到背景超過 1 分鐘會重新上鎖':'打開 App 時需要輸入 4 位數密碼'}
$('lkPad').innerHTML=['1','2','3','4','5','6','7','8','9','','0','del'].map(k=>k===''?'<span></span>':k==='del'?'<button type="button" data-k="del" aria-label="刪除"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6h11v12H9l-5-6z"/><path d="M12.5 9.5l5 5M17.5 9.5l-5 5"/></svg></button>':`<button type="button" data-k="${k}">${k}</button>`).join('');
$('lkPad').querySelectorAll('[data-k]').forEach(b=>b.onclick=()=>lkKey(b.dataset.k));
document.addEventListener('keydown',e=>{if($('lock').hidden)return;if(/^[0-9]$/.test(e.key)){e.preventDefault();lkKey(e.key)}else if(e.key==='Backspace'){e.preventDefault();lkKey('del')}});
$('lkCancel').onclick=()=>{closeLock();syncLockUI()};
$('lkForgot').onclick=async()=>{const k=await ask('忘記密碼？','密碼只存在這台裝置上，無法找回。重設會清除所有紀錄和個人資料，建議先確認是否有匯出的備份。',[{k:'cancel',t:'再想想'},{k:'reset',t:'清除並重設',cls:'danger'}]);
  if(k!=='reset')return;try{localStorage.clear()}catch(e){}location.reload()};
$('swLock').onclick=()=>prof.pin?openLock('off'):openLock('set');
let hiddenAt=0;document.addEventListener('visibilitychange',()=>{$('device').classList.toggle('privacy',document.hidden&&!!prof.pin);
  if(document.hidden)hiddenAt=Date.now();else if(prof.pin&&hiddenAt&&Date.now()-hiddenAt>60000&&$('lock').hidden)openLock('unlock')});

