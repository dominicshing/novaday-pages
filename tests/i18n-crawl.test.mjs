// 介面語言：實際操作一輪（引導、寫紀錄、刪除與復原、篩選、設定、密碼鎖、開發者工具的每個功能），
// 記錄 App 顯示過的所有文字與無障礙標籤：英文介面不該出現中文，簡體介面不該出現繁體字（使用者寫的內容除外）
export default async ({ ok, browser, BASE }) => {
  for (const lang of ['en', 'zh-Hans']) {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, acceptDownloads: true });
    await ctx.addInitScript(l=>{if(!sessionStorage.getItem('s')){sessionStorage.setItem('s',1);localStorage.setItem('orbitlog.profile.v1',JSON.stringify({lang:l}))}
  window.__seen=new Map();window.__step='boot';let on=false;addEventListener('DOMContentLoaded',()=>{on=true});const H=/[㐀-鿿]/;
  window.__total=0;const all=new Set();const rec=(t,src)=>{if(!on||!t)return;t=String(t).trim();if(!t)return;if(!all.has(t)){all.add(t);window.__total=all.size}if(!H.test(t))return;const el=src&&src.nodeType===1?src:src&&src.parentElement;if(el&&el.closest&&el.closest('[translate="no"],script,style,.entry,.dv-body,.ed-body'))return;if(!window.__seen.has(t))window.__seen.set(t,window.__step)};
  const scan=n=>{if(n.nodeType===3){rec(n.nodeValue,n);return}if(n.nodeType!==1)return;if(n.closest('script,style'))return;
    for(const a of['aria-label','title','placeholder','alt','aria-valuetext'])if(n.hasAttribute(a))rec(n.getAttribute(a),n);
    const w=document.createTreeWalker(n,NodeFilter.SHOW_TEXT|NodeFilter.SHOW_ELEMENT);let x;while(x=w.nextNode()){if(x.nodeType===3)rec(x.nodeValue,x);else for(const a of['aria-label','title','placeholder','alt','aria-valuetext'])if(x.hasAttribute(a))rec(x.getAttribute(a),x)}};
  new MutationObserver(ms=>{for(const m of ms){if(m.type==='childList')m.addedNodes.forEach(scan);else if(m.type==='characterData')rec(m.target.nodeValue,m.target);else rec(m.target.getAttribute(m.attributeName),m.target)}})
    .observe(document,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['aria-label','title','placeholder','alt','aria-valuetext']});
  window.alert=m=>rec(m);window.confirm=m=>{rec(m);return true}},lang);
    const p = await ctx.newPage(), errs = [], fails = []; p.on('pageerror', e => errs.push(e.message)); p.on('dialog', d => d.accept().catch(() => {}));
    await p.goto(BASE + '/index.html'); await p.waitForTimeout(1200);
    const ev=async(c,ms=500)=>{try{await p.evaluate(c)}catch(e){fails.push(c.slice(0,60))}await p.waitForTimeout(ms)};
const step=s=>p.evaluate(s=>window.__step=s,s);
const closeAll="document.querySelectorAll('.layer.open').forEach(x=>closeSheet(x.id))";
// 1. 引導頁（真的走完）
await step('onboarding');await p.evaluate(()=>{document.querySelectorAll('#onb *')}).catch(()=>{});
const onbVisible=await p.evaluate(()=>!document.getElementById('onb').hidden);
if(onbVisible){for(let i=0;i<3;i++)await ev("document.getElementById('obNext').click()",700);
  await ev("ob.m=3;ob.d=25;obRender()",500);await ev("document.getElementById('obNext').click()",900);await ev("document.getElementById('obAlt').click()",900)}
// 2. 首頁各卡片
await step('home');await ev("go('home');render()",800);await ev("document.getElementById('msMore').click()");await ev("document.getElementById('msMore').click()");
await ev("document.getElementById('fuelBtn').click()",400);await ev("document.getElementById('foX')&&!document.getElementById('foX').hidden&&document.getElementById('foX').click()",400);
// 3. 快記
await step('quicknote');await ev("document.querySelectorAll('#qnMoods button')[3]?.click();const q=document.getElementById('qnText');q.value='hello';q.dispatchEvent(new Event('input',{bubbles:true}))",400);
await ev("document.getElementById('qnGo').click()",4500);await ev(closeAll+";document.querySelectorAll('.show').forEach(x=>x.click&&x.click())",800);
// 4. 編輯器：完整流程
await step('editor');await ev("openEditor()",700);await ev("document.getElementById('sigChip').click()",400);await ev("document.querySelector('.spark-chip')?.click()",300);
await ev("document.getElementById('fTitle').value='T';document.getElementById('fTags').value='a, b';document.getElementById('fLoc').value='x';document.getElementById('fBody').dispatchEvent(new Event('input',{bubbles:true}))",900);
await ev("document.getElementById('fDate').value='2099-01-01';document.getElementById('fDate').dispatchEvent(new Event('change',{bubbles:true}))",400);
await ev("document.getElementById('xpPrev').click()",300);await ev("document.getElementById('saveBtn').click()",5000);
await ev("document.querySelectorAll('#achPop.show,#conDone.show,#lvUp.show').forEach(x=>x.click())",800);await ev("document.getElementById('cdOk')?.click();document.getElementById('lvOk')?.click()",800);
// 編輯器離開（草稿）
await ev("openEditor()",600);await ev("document.getElementById('fBody').value='draft';document.getElementById('fBody').dispatchEvent(new Event('input',{bubbles:true}))",900);
await ev("document.querySelector('#editor [data-close]').click()",700);await ev("document.querySelector('#askBtns button:nth-child(2)')?.click()",700);
await ev("renderDraftBar()",300);await ev("document.getElementById('draftBar').click()",800);await ev(closeAll,400);await ev("document.querySelector('#askBtns button:last-child')?.click()",500);
// 5. 詳情：收藏、刪除、復原、分享
await step('detail');await ev("openDetail(sorted()[0].id)",700);await ev("document.getElementById('dFav').click()",400);await ev("document.getElementById('dFav').click()",400);
await ev("document.getElementById('dShare').click()",1500);await ev("document.querySelector('#shOpt [data-o=lite]')?.click()",1200);await ev(closeAll,400);
await ev("openDetail(sorted()[0].id)",700);await ev("document.getElementById('dDel').click()",600);await ev("document.querySelector('#askBtns button:last-child')?.click()",800);await ev("document.querySelector('#snack button')?.click()",800);
// 6. 日記：篩選、搜尋、精簡、月曆
await step('log');await ev("go('log')",500);for(const g of['mood','content','tag'])await ev(`document.querySelector('#filters [data-g=${g}]')?.click();document.querySelector('#fPanel .fchip')?.click()`,400);
await ev("document.getElementById('fpDone')?.click();document.querySelector('#filters [data-g=clear]')?.click()",400);
await ev("const q=document.getElementById('q');q.focus();q.value='zzzz';q.dispatchEvent(new Event('input',{bubbles:true}))",700);await ev("const q=document.getElementById('q');q.value='';q.dispatchEvent(new Event('input',{bubbles:true}))",500);
await ev("document.querySelector('#logMode [data-d=\"1\"]').click()",400);await ev("document.querySelector('#logMode [data-d=\"0\"]').click()",400);
await ev("document.querySelector('#logTop [data-v=cal]').click()",500);await ev("document.getElementById('prevM').click()",500);await ev("document.getElementById('nextM').click();document.getElementById('nextM').click()",500);
await ev("document.querySelector('.cell[data-d]:not(.has)')?.click()",400);await ev("document.getElementById('calToday').click()",400);await ev("document.querySelector('#logTop [data-v=list]').click()",300);
// 7. 圖鑑
await step('atlas');await ev("go('atlas')",500);for(const t of['done','zod','all','month'])await ev(`document.querySelector('#atTabs [data-t=${t}]').click()`,400);
await ev("document.getElementById('atMn')?.click()",300);await ev("document.getElementById('atMp')?.click()",300);
await ev("document.getElementById('atSearchBtn').click();const q=document.getElementById('atQ');q.value='zz';q.dispatchEvent(new Event('input'))",500);await ev("const q=document.getElementById('atQ');q.value='or';q.dispatchEvent(new Event('input'))",500);await ev("document.getElementById('atSearchBtn').click()",300);
await ev("openCon('Ori')",800);await ev("document.getElementById('cnNextPick')?.click()",500);await ev("document.getElementById('cnNextPick')?.click()",500);await ev("document.getElementById('cnNext').click()",600);await ev("document.getElementById('cnZ')?.click()",700);await ev(closeAll,400);
await ev("openCon('Lyr')",600);await ev(closeAll,300);
// 8. 我的
await step('me');await ev("go('me')",700);await ev("document.getElementById('rkNext').click()",500);await ev("document.getElementById('rkNext').click()",500);await ev("document.getElementById('rkBack')?.click()",500);
await ev("document.getElementById('achMore').click()",500);await ev("openAch('first')",600);await ev("document.getElementById('asNext').click()",600);await ev("document.getElementById('asGo')?.click()",900);await ev(closeAll,400);
await ev("document.querySelector('#fpGrid i[data-d]')?.click()",400);await ev("document.querySelector('#fpGrid i.on')?.click()",400);
await ev("openReport(new Date().getFullYear(),new Date().getMonth())",700);await ev("document.getElementById('rpPrev').click()",600);await ev("document.querySelector('[data-rm=y]').click()",700);await ev(closeAll,400);
await ev("openFortune(4)",600);await ev(closeAll,400);
// 9. 設定
await step('settings');await ev("openSheet('settingsSheet')",500);
for(const id of['swRemind','swRemind','swCalm','swCalm','clk24','clk12'])await ev(`document.getElementById('${id}').click()`,300);
await ev("const t=document.getElementById('remindTime');t.value='07:30';t.dispatchEvent(new Event('change'))",300);
await ev("document.getElementById('liStore').click()",900);await ev(closeAll,300);
await ev("openTags()",600);await ev("document.querySelector('.tg-main')?.click()",400);await ev("const i=document.getElementById('tgIn');if(i){i.value='renamed';i.dispatchEvent(new Event('input'))}",300);await ev("document.getElementById('tgSave')?.click()",600);await ev("document.querySelector('#snack button')?.click()",500);
await ev("document.querySelector('.tg-main')?.click()",400);await ev("document.getElementById('tgDel')?.click()",500);await ev("document.querySelector('#askBtns button:first-child')?.click()",400);await ev(closeAll,300);
await ev("refreshEx();openSheet('exporter')",600);await ev("document.getElementById('copyEx')?.click()",400);await ev(closeAll,300);
await ev("openImport()",500);await ev(closeAll,300);
for(const m of['entries','prof','all'])await ev(`openWipe('${m}')`,400);await ev(closeAll,300);
await ev("openSheet('aboutSheet')",400);for(let i=0;i<8;i++)await ev("document.getElementById('abVer').click()",120);await ev(closeAll,300);
await ev("document.getElementById('liSamples').click()",500);await ev("document.querySelector('#askBtns button:first-child')?.click()",400);
// 密碼鎖：設定、解鎖、關閉
await step('lock');await ev("openSheet('settingsSheet');document.getElementById('swLock').click()",600);
const pad=async d=>{for(const k of d)await ev(`document.querySelector('#lkPad [data-k=\"${k}\"]').click()`,120)};await pad('1234');await p.waitForTimeout(400);await pad('1235');await p.waitForTimeout(600);await pad('1234');await pad('1234');await p.waitForTimeout(800);
await ev("openLock('unlock')",500);await pad('0000');await p.waitForTimeout(500);await pad('0000');await pad('0000');await p.waitForTimeout(500);await pad('1234');await p.waitForTimeout(700);
await ev("document.getElementById('swLock').click()",500);await pad('1234');await p.waitForTimeout(700);await ev(closeAll,300);
// 10. 開發者工具：每個功能
await step('dev');await ev("prof.devOn=1;saveProf();devSecSync&&devSecSync();devOpen()",800);
for(const id of['dvConGo','dvAchGo','dvLvGo'])await ev(`document.getElementById('${id}').click()`,2500),await ev("document.querySelectorAll('#achPop.show,#conDone.show,#lvUp.show').forEach(x=>x.click());document.getElementById('cdOk')?.click()",600);
await ev("document.getElementById('dvMonGo').click()",700);await ev("closeSheet('monthSheet')",300);await ev("document.getElementById('dvYearGo').click()",700);await ev("closeSheet('monthSheet')",300);await ev("document.getElementById('dvZodGo').click()",700);await ev("closeSheet('fortuneSheet')",300);
await ev("document.getElementById('dvOnbGo').click()",800);await ev("obFinish(false)",500);await ev("document.getElementById('dvLockGo').click()",500);await pad('1111');await p.waitForTimeout(500);
await ev("document.querySelector('#dvData [data-n=\"30\"]').click()",800);await ev("document.getElementById('dvStkGo').click()",800);await ev("document.getElementById('dvConsGo').click()",1200);
await ev("const x=document.getElementById('dvXp');x.selectedIndex=3;document.getElementById('dvXpGo').click()",800);
for(const m of['all','none',''])await ev(`document.querySelector('#dvAchM [data-m=\"${m}\"]')?.click()`,500);
await ev("document.getElementById('swDvEmpty').click()",800);await ev("document.getElementById('swDvEmpty').click()",900);
await ev("document.querySelector('#dvGeo [data-g=\"1\"]').click()",600);await ev("document.getElementById('dvGeoReset').click()",600);
await ev("document.querySelector('#dvFs [data-s=\"1.3\"]')?.click()",400);await ev("document.querySelector('#dvFs [data-s=\"1\"]')?.click()",400);await ev("document.querySelector('#dvW [data-w=\"375\"]')?.click()",400);
for(const id of['swDvSlow','swDvSlow','swDvTouch','swDvTouch','swDvFps','swDvFps','swObDev','swObDev','swFig','swFig'])await ev(`document.getElementById('${id}').click()`,400);
await ev("document.getElementById('liDvFigs').click()",1500);await ev(closeAll+";devOpen()",500);await ev("document.getElementById('liDvUi').click()",1200);await ev(closeAll+";devOpen()",500);
await ev("document.getElementById('liDvStore').click()",800);await ev("document.querySelectorAll('#dvStList details').forEach(d=>d.open=true)",600);await ev("document.querySelector('#dvStList [data-copy]')?.click()",400);await ev(closeAll+";devOpen()",500);
await ev("document.getElementById('liDvErr')?.click()",600);await ev("document.getElementById('dvErrTest').click()",800);await ev("document.getElementById('dvErrCopy').click()",400);await ev("document.getElementById('dvErrClr').click()",400);await ev(closeAll+";devOpen()",500);
await ev("document.getElementById('dvStarGo').click()",900);await ev("document.getElementById('dvStarNext').click()",3500);await ev("document.querySelectorAll('#devStarSheet .cstar[data-id]')[0]?.dispatchEvent(new MouseEvent('click',{bubbles:true}))",400);
await ev("const r=document.getElementById('dvStarRange');r.value=r.max;r.dispatchEvent(new Event('input'))",1500);await ev("document.getElementById('dvStarPlay').click()",800);await ev(closeAll+";devOpen()",500);
await ev("document.getElementById('dvClr').click()",800);await ev("document.getElementById('dvInitDev').click()",600);await ev("document.querySelector('#askBtns button:first-child')?.click()",400);
await ev("document.getElementById('dvHide').click()",600);
// 11. 其他：截圖面板
await step('misc');await ev(closeAll,300);await ev("document.getElementById('screenshotCapture').click()",4000);await ev(closeAll,400);

    const seen = await p.evaluate(() => [...window.__seen.entries()]), ZC = lang === 'zh-Hans' ? await p.evaluate(() => ZHS_C) : '';
    const bad = seen.filter(([t]) => lang === 'en' || [...t].some(c => ZC.includes(c))).map(([t, s]) => `${s}：${t.slice(0, 40)}`);
    const total = await p.evaluate(() => window.__total);
    ok(total > 1500 && !bad.length, `${lang} 介面操作一輪，看過 ${total} 段文字，${lang === 'en' ? '沒有中文' : '沒有繁體字'} ${bad.slice(0, 10).join('；')}`);
    ok(!fails.length, `${lang} 介面操作一輪的每個步驟都能執行 ${fails.join('；')}`);
    ok(errs.every(e => /開發者工具產生的測試錯誤|test error from the developer tools|开发者工具产生的测试错误/.test(e)), `${lang} 介面沒有程式錯誤 ` + errs.join('; '));
    await ctx.close();
  }
};
