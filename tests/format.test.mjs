// 日期與純文字匯出的格式
export default async ({ ok, open }) => {
  const y = new Date().getFullYear();
  const E = [{ id: 'old', date: `${y - 1}-10-02`, title: '去年', mood: 3 }, { id: 'now', date: `${y}-01-02`, time: '21:30', title: '', body: '今年', mood: 2, tags: ['x'] }];
  const p = await open({ seed: { 'orbitlog.profile.v1': { onboarded: 1 }, 'orbitlog.seeded.v1': '1', 'orbitlog.entries.v1': E } });
  const t = await p.evaluate(() => exportText());
  ok(t.includes(`【${y - 1} 年 10 月 2 日`) && t.includes(`【${y} 年 1 月 2 日`), '純文字匯出的日期包含年份');
  ok(!t.includes('undefined') && !/ 】/.test(t), '沒有內文、沒有時間的紀錄不會出現 undefined 或多餘空白');
  ok(await p.evaluate(y => fmtDayY(`${y - 1}-10-02`).startsWith(`${y - 1} 年 `) && !fmtDayY(`${y}-01-02`).includes('年'), y), '不是今年的日期才加年份');
  await p.evaluate(() => openDetail('old')); await p.waitForTimeout(300);
  ok(await p.evaluate(y => document.querySelector('#detail .dv-when').textContent.startsWith(`${y - 1} 年`), y), '去年的紀錄在詳情顯示年份');
  await p.evaluate(() => { closeSheet('detail'); go('log') }); await p.fill('#q', '#x'); await p.waitForTimeout(500);
  ok(await p.evaluate(() => [...document.querySelectorAll('#logList .entry')].map(e => e.dataset.id).join() === 'now'), '搜尋「#標籤」找得到有這個標籤的紀錄');
  ok(!p.errors.length, '沒有程式錯誤 ' + p.errors.join('; '));
  await p.context().close();

  // 那年今日：3/31 的「一個月前」是 2/28，不是 setMonth 溢位成的 3/3
  const off = new Date(2026, 2, 31, 12).getTime() - Date.now();
  const q = await open({ seed: { 'orbitlog.profile.v1': { onboarded: 1 }, 'orbitlog.seeded.v1': '1', 'novaday.dev.dateOffset': String(off),
    'orbitlog.entries.v1': [{ id: 'f', date: '2026-02-28', title: '二月底', mood: 2 }, { id: 'm', date: '2026-03-03', title: '三月三日', mood: 2 }] } });
  ok(await q.evaluate(() => { const m = memoryPick(); return m && m.lab === '一個月前的今天' && m.e.id === 'f' }), '3/31 的「一個月前的今天」是 2/28');
  await q.context().close();

  // 320px 寬：編輯器的日期時間膠囊不換行
  const r = await open({ viewport: { width: 320, height: 568 } });
  await r.evaluate(() => { openEditor(); document.getElementById('whenDT').textContent = '前天・10/1（四）'; document.getElementById('whenTT').textContent = '下午 11:56' }); await r.waitForTimeout(400);
  ok(await r.evaluate(() => { const p = document.querySelector('.when-pill').getBoundingClientRect(), c = document.querySelector('.ed-when').getBoundingClientRect(); return p.height < 40 && p.right <= c.right + 1 }), '320px 時日期時間膠囊維持一行');
  await r.context().close() };
