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
  ok(!p.errors.length, '沒有程式錯誤 ' + p.errors.join('; '));
  await p.context().close() };
