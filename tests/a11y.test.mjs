// 鍵盤操作：面板打開時焦點移進面板、Tab 不會跑出面板、Esc 關閉後焦點回到原本的按鈕
export default async ({ ok, open }) => {
  const p = await open();
  await p.evaluate(() => go('me')); await p.waitForTimeout(300);
  await p.focus('#editMe'); await p.keyboard.press('Enter'); await p.waitForTimeout(400);
  ok(await p.evaluate(() => document.getElementById('settingsSheet').contains(document.activeElement)), '打開設定時焦點移進面板');
  for (let i = 0; i < 40; i++) await p.keyboard.press('Tab');
  ok(await p.evaluate(() => document.getElementById('settingsSheet').contains(document.activeElement)), '連按 Tab 焦點留在面板內');
  for (let i = 0; i < 5; i++) await p.keyboard.press('Shift+Tab');
  ok(await p.evaluate(() => document.getElementById('settingsSheet').contains(document.activeElement)), 'Shift+Tab 也留在面板內');
  await p.keyboard.press('Escape'); await p.waitForTimeout(400);
  ok(await p.evaluate(() => !document.querySelector('.layer.open') && document.activeElement.id === 'editMe'), 'Esc 關閉後焦點回到設定按鈕');
  // 日記詳情：關閉時列表已重畫，焦點回到同一則紀錄
  await p.evaluate(() => go('log')); await p.waitForTimeout(300);
  const id = await p.evaluate(() => document.querySelector('#logList .entry').dataset.id);
  await p.focus('#logList .entry'); await p.keyboard.press('Enter'); await p.waitForTimeout(500);
  ok(await p.evaluate(() => document.getElementById('detail').contains(document.activeElement)), '打開日記詳情時焦點移進面板');
  await p.evaluate(() => renderLog()); await p.keyboard.press('Escape'); await p.waitForTimeout(400);
  ok(await p.evaluate(i => document.activeElement.dataset.id === i, id), '關閉後焦點回到重畫後的同一則紀錄');
  ok(!p.errors.length, '沒有程式錯誤 ' + p.errors.join('; '));
  await p.context().close() };
