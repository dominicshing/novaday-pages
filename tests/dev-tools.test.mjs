// 開發者工具：隱藏入口、動畫預覽、測試資料、快轉（含點亮所有星座）、空白狀態、字級、慢速、剪影總覽、重設、小螢幕版面、引導預覽
export default async ({ ok, open, run }) => {
  const p = await open();
  const $ = id => p.evaluate(id => document.getElementById(id), id);
  ok(await p.evaluate(() => document.getElementById('devSec').hidden), '預設隱藏開發者選項');
  await run(p, "openSheet('aboutSheet')");
  for (let i = 0; i < 7; i++) { await run(p, "document.getElementById('abVer').click()"); await p.waitForTimeout(50) }
  ok(await p.evaluate(() => !document.getElementById('devSec').hidden && prof.devOn === 1), '連點版本號碼 7 次開啟');
  await run(p, "closeSheet('aboutSheet');devOpen()"); await p.waitForTimeout(400);
  ok(await p.evaluate(() => document.querySelectorAll('#dvCon option').length === 88), '工具頁開啟，星座選單 88 個');

  // 動畫預覽
  await p.selectOption('#dvCon', 'Cyg'); await run(p, "document.getElementById('dvConGo').click()"); await p.waitForTimeout(900);
  ok(await p.evaluate(() => document.getElementById('cdName').textContent === '天鵝座'), '播放星座完成（天鵝座）');
  await run(p, "document.getElementById('cdOk').click()"); await p.waitForTimeout(700);

  // 測試資料與快轉
  await run(p, "document.querySelector('#dvData [data-n=\"100\"]').click()"); await p.waitForTimeout(400);
  ok(await p.evaluate(() => entries.filter(e => e.dev).length > 60), '產生 100 天測試紀錄');
  await p.selectOption('#dvStk', '30'); await run(p, "document.getElementById('dvStkGo').click()"); await p.waitForTimeout(300);
  ok(await p.evaluate(() => streakOf(entries).n >= 30), '補滿連續 30 天');
  await p.selectOption('#dvXp', '25'); await run(p, "document.getElementById('dvXpGo').click()"); await p.waitForTimeout(300);
  ok(await p.evaluate(() => levelInfo(totalXP(entries)).lv === 25), '等級快轉到 Lv.25');
  await run(p, "document.querySelector('#dvAchM [data-m=\"all\"]').click()"); await p.waitForTimeout(200);
  ok(await p.evaluate(() => unlocked(entries).length === ACH.length), '徽章全部解鎖');
  await run(p, "document.getElementById('dvConsAll').click()"); await p.waitForTimeout(800);
  ok(await p.evaluate(() => { const st = consState(entries); return st.done.length === 88 && !st.cur && document.getElementById('dvConsAll').disabled && document.getElementById('dvConsAllN').textContent === '88 / 88' }), '點亮所有星座（88 個），按鈕停用');
  for (const s of ['home', 'log', 'atlas', 'me']) { await run(p, `go('${s}')`); await p.waitForTimeout(250) }
  ok(!p.errors.length, '全部點亮後各分頁正常 ' + p.errors.join('; '));
  ok(await p.evaluate(() => { go('home'); const st = consState(entries), k = reviewCon(st), g = document.getElementById('gal');
    return document.getElementById('skyK').textContent === '全部完成' && !document.getElementById('skyK').hidden && document.getElementById('conName').textContent === CON[k].n
      && g.querySelectorAll('.cstar').length === CON[k].s.length && !g.querySelector('.nextring') && document.getElementById('gcap').textContent.includes('88 個星座都已點亮') }), '全部完成時星空頁每天回顧一個已完成的星座，星星全亮');
  await run(p, "devOpen()"); await p.waitForTimeout(300);

  // 空白狀態：收起後放回
  const n = await p.evaluate(() => entries.length);
  await run(p, "document.getElementById('swDvEmpty').click()"); await p.waitForTimeout(400);
  ok(await p.evaluate(() => entries.length === 0), '空白狀態收起所有紀錄');
  await run(p, "document.getElementById('swDvEmpty').click()"); await p.waitForTimeout(600);
  ok(await p.evaluate(n => entries.length === n, n), '關閉空白狀態，紀錄放回');

  // 樣式檢查
  const f0 = await p.evaluate(() => parseFloat(getComputedStyle(document.querySelector('#devSheet .dv-lbl')).fontSize));
  await run(p, "document.querySelector('#dvFs [data-s=\"1.3\"]').click()"); await p.waitForTimeout(200);
  const f1 = await p.evaluate(() => parseFloat(getComputedStyle(document.querySelector('#devSheet .dv-lbl')).fontSize));
  ok(Math.abs(f1 - f0 * 1.3) < .3, `字級放大 1.3 倍（${f0}px → ${f1}px）`);
  await run(p, "document.getElementById('swDvSlow').click()"); await p.waitForTimeout(400);
  ok(await p.evaluate(() => document.getAnimations().every(a => a.playbackRate === .25)), '動畫慢速 0.25 倍');
  await run(p, "document.getElementById('liDvFigs').click()"); await p.waitForTimeout(800);
  ok(await p.evaluate(() => document.querySelectorAll('#dvFigGrid .dvf').length === 88), '星座剪影總覽 88 個');
  await run(p, "closeSheet('devFigSheet')"); await p.waitForTimeout(300);

  // 重設開發者工具：關閉所有模擬、移除測試紀錄，保留日記
  await run(p, "document.getElementById('dvInitDev').click()"); await p.waitForTimeout(400);
  await run(p, "document.querySelector('#askBtns button:last-child').click()"); await p.waitForLoadState(); await p.waitForTimeout(1200);
  ok(await p.evaluate(() => !prof.devFs && !prof.devSlow && !prof.devXP && !prof.devAch && !entries.some(e => e.dev) && prof.devOn === 1), '重設開發者工具');
  ok(!p.errors.length, '沒有程式錯誤 ' + p.errors.join('; '));
  await p.context().close();

  // 320px：月份、日期、時間欄位完整顯示，按鈕文字不斷行；引導預覽可用 Esc 結束
  const q = await open({ viewport: { width: 320, height: 568 }, seed: { 'orbitlog.profile.v1': { onboarded: 1, devOn: 1 } } });
  await run(q, 'devOpen()'); await q.waitForTimeout(500);
  ok(await q.evaluate(() => ['dvMon', 'dvDate', 'dvTime'].every(id => document.getElementById(id).getBoundingClientRect().width >= 200)
    && [...document.querySelectorAll('#devSheet .dv-go')].filter(b => b.offsetParent).every(b => getComputedStyle(b).whiteSpace === 'nowrap' && b.scrollWidth <= b.clientWidth + 1)), '320px 時月份、日期、時間完整顯示，按鈕不斷行');
  ok(await q.evaluate(() => [...document.querySelectorAll('#devSheet .dv-ctl')].filter(c => c.offsetParent).every(c => { const f = c.querySelector('.field'), b = c.querySelector('.dv-go'); if (!f || !b || c.classList.contains('dv-mon') || c.classList.contains('dv-dt')) return true;
    const x = f.getBoundingClientRect(), y = b.getBoundingClientRect(); return Math.abs(x.top - y.top) <= 1 && Math.abs(x.height - y.height) <= 1 })), '選單和旁邊的按鈕等高、上緣對齊');
  ok(await q.evaluate(() => document.querySelector('#devSheet .dv-note').textContent.includes('不會動到你自己寫的日記') && [...document.querySelectorAll('#devSheet .set-h')].some(h => h.textContent.trim() === '重設與隱藏')), '說明文字正確，重設區改名');
  await run(q, "document.getElementById('dvOnbGo').click()"); await q.waitForTimeout(500);
  ok(await q.evaluate(() => !document.getElementById('onb').hidden), '打開引導預覽');
  await q.keyboard.press('Escape'); await q.waitForTimeout(600);
  ok(await q.evaluate(() => document.getElementById('onb').hidden && prof.onboarded === 1), '按 Esc 結束引導預覽，資料不變');
  ok(!q.errors.length, '小螢幕沒有程式錯誤 ' + q.errors.join('; '));
  await q.context().close() };
