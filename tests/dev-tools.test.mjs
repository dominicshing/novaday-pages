// 開發者工具：隱藏入口、動畫預覽、測試資料、快轉（含點亮所有星座）、空白狀態、字級、慢速、剪影總覽、初始化
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
  ok(await p.evaluate(() => document.getElementById('conName').textContent === '全部完成' && document.getElementById('skyK').hidden), '全部完成時不顯示「正在點亮」');
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
  await p.context().close() };
