/* 開發者星座預覽：模擬逐顆點亮，共用正式繪圖與彗星效果，不寫入日記或星座進度。 */
const DV_STAR={k:'Lyn',n:0,visual:0,samples:[],busy:false,playing:false,active:false,run:0,sequence:0};
const devStarReduced=()=>reduce||matchMedia('(prefers-reduced-motion:reduce)').matches;
function devStarOptions(){const options=Object.keys(CON).map(k=>`<option value="${k}"${k===DV_STAR.k?' selected':''}>${CON[k].n}・${CON[k].s.length} 顆星</option>`).join('');
  $('dvStarPick').innerHTML=options;$('dvStarCon').innerHTML=options;
  $('dvStarMood').innerHTML=MOODS.map((m,i)=>`<option value="${i}"${i===2?' selected':''}>${m.n}</option>`).join('')}
function devStarControls(){const s=DV_STAR,total=CON[s.k].s.length;
  $('dvStarNext').disabled=s.busy||s.playing||s.n>=total;$('dvStarPlay').disabled=s.busy&&!s.playing;
  $('dvStarPlay').textContent=s.playing?'❚❚ 暫停':'▶ '+(s.n===total?'重播':'播放');$('dvStarPlay').setAttribute('aria-pressed',String(s.playing));
  $('dvStarCount').textContent=`${s.n} / ${total} 顆星`;$('dvStarRange').max=total;$('dvStarRange').value=s.n;
  $('dvStarRange').setAttribute('aria-valuetext',`${CON[s.k].n}，已點亮 ${s.n} / ${total} 顆星`)}
function devStarRender({hold=false,celebrate=false}={}){const s=DV_STAR,total=CON[s.k].s.length,fig=$('dvStarFig'),p=(hold?s.visual:s.n)/total;
  fig.innerHTML=conSVG(s.k,380,300,46,s.n,s.samples,{bg:70,next:true,sc:1.25,figP:p,figFrom:devStarReduced()?p:s.visual/total,freshId:hold?s.samples[s.n-1]?.id:null,anim:celebrate&&!devStarReduced(),d0:0});
  fig.setAttribute('aria-label',`${CON[s.k].n}，已點亮 ${s.n} / ${total} 顆星`);
  if(!hold){s.visual=s.n;fig.setCurrentTime?.(0)}
  fig.querySelectorAll('.cstar[data-id]').forEach(el=>{const show=()=>{const e=s.samples.find(e=>e.id===el.dataset.id);if(e)$('dvStarMessage').textContent='這顆星的心情：'+MOODS[e.mood].n+'（預覽）'};el.onclick=show;el.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();show()}}});
  $('dvStarMessage').textContent=s.n===0?'點亮第一顆星，看看圖案如何逐漸顯現。':s.n===total?'全部點亮了，可以停留查看完成效果。':`已點亮 ${s.n} 顆星，繼續讓圖案成形。`;
  devStarControls()}
function devStarStop(){const s=DV_STAR;s.run++;s.sequence++;s.playing=false;s.busy=false;s.n=s.visual;
  document.querySelectorAll('.dv-star-effect').forEach(e=>e.remove());$('dvStarFig').classList.remove('arriving');$('dvStarNext').classList.remove('firing');devStarControls()}
function devStarReset(){devStarStop();const s=DV_STAR;s.n=s.visual=0;
  s.samples=Array.from({length:CON[s.k].s.length},(_,i)=>({id:`dv-star-${s.k}-${i}`,date:ymd(new Date()),title:'星星預覽',mood:2}));devStarRender()}
function devStarOpen(k=$('dvStarPick').value){const s=DV_STAR;s.k=CON[k]?k:'Lyn';devStarOptions();devStarReset();s.active=true;
  $('dvStarName').textContent=CON[s.k].n;$('dvStarLatin').textContent=CON[s.k].la;$('devStarSheet').querySelector('.sb').scrollTop=0;if(!$('devStarSheet').classList.contains('open'))openSheet('devStarSheet')}
async function devStarAdvance(){const s=DV_STAR;if(!s.active||s.busy||s.n>=CON[s.k].s.length)return;
  const run=s.run,mood=+$('dvStarMood').value;s.busy=true;s.samples[s.n].mood=mood;s.n++;if(!devStarReduced())$('dvStarFig').classList.add('arriving');devStarRender({hold:true});
  const cancelled=()=>!s.active||s.run!==run;
  try{await launch(mood,{gal:$('dvStarFig'),button:$('dvStarNext'),preview:true,reduced:devStarReduced(),cancelled});if(!cancelled()){devStarRender({celebrate:s.n===CON[s.k].s.length});if(constellationArt(s.k)&&!devStarReduced())await sleep(1800)}}
  finally{if(s.run===run){s.busy=false;devStarControls()}}}
async function devStarPlay(){const s=DV_STAR;if(s.playing){s.playing=false;s.sequence++;devStarControls();return}if(s.busy||!s.active)return;
  if(s.n>=CON[s.k].s.length)devStarReset();s.playing=true;const sequence=++s.sequence;devStarControls();
  while(s.active&&s.playing&&sequence===s.sequence&&s.n<CON[s.k].s.length){await sleep(devStarReduced()?350:700);if(!s.active||!s.playing||sequence!==s.sequence)break;await devStarAdvance()}
  if(sequence===s.sequence){s.playing=false;devStarControls()}}
$('dvStarGo').onclick=()=>devStarOpen();$('dvStarCon').onchange=()=>devStarOpen($('dvStarCon').value);
$('dvStarNext').onclick=devStarAdvance;$('dvStarPlay').onclick=devStarPlay;$('dvStarReset').onclick=devStarReset;
$('dvStarRange').oninput=()=>{const n=+$('dvStarRange').value;devStarStop();DV_STAR.n=n;devStarRender({celebrate:n===CON[DV_STAR.k].s.length})};
new MutationObserver(()=>{if(!$('devStarSheet').classList.contains('open')&&DV_STAR.active){DV_STAR.active=false;devStarStop();$('dvStarFig').replaceChildren()}}).observe($('devStarSheet'),{attributes:true,attributeFilter:['class']});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&DV_STAR.active){devStarStop();devStarRender()}});
matchMedia('(prefers-reduced-motion:reduce)').addEventListener('change',()=>{if(DV_STAR.active){devStarStop();devStarRender()}});
