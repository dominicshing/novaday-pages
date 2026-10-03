// 使用者操作流程（用真的點擊與輸入）：寫一則、加地點與標籤、編輯、搜尋、刪除與復原
export default async ({ ok, open }) => {
  const p = await open({ seed: { 'orbitlog.profile.v1': { onboarded: 1 }, 'orbitlog.seeded.v1': '1' } });
  const n = () => p.evaluate(() => entries.length);
  // 寫一則：點亮按鈕 → 輸入 → 選心情 → 加地點、標籤 → 點亮
  await p.click('#newBtn'); await p.waitForTimeout(500);
  await p.fill('#fTitle', '散步看月亮'); await p.fill('#fBody', '晚上在河堤散步，月亮很圓。');
  await p.click('#moods .mood[data-i="4"]');
  await p.click('.tool[data-x="xLoc"]'); await p.fill('#fLoc', '河堤');
  await p.click('.tool[data-x="xTags"]'); await p.fill('#fTags', '散步'); await p.keyboard.press('Enter');
  await p.focus('#fLoc'); await p.keyboard.press('Enter'); await p.focus('#fTitle'); await p.keyboard.press('Enter'); await p.waitForTimeout(300);
  ok(await p.evaluate(() => entries.length === 0 && document.getElementById('editor').classList.contains('open') && document.activeElement.id === 'fBody'), '在標題、地點、標籤按 Enter 不會直接點亮（標題跳到內文）');
  await p.click('#saveBtn'); await p.waitForTimeout(1500);
  const e = await p.evaluate(() => entries.find(x => x.title === '散步看月亮'));
  ok(e && e.mood === 4 && e.loc === '河堤' && (e.tags || []).includes('散步') && e.body.includes('月亮很圓'), '用點擊寫一則紀錄（心情、地點、標籤） ' + JSON.stringify(e && { mood: e.mood, loc: e.loc, tags: e.tags }));
  ok(await p.evaluate(() => !document.getElementById('editor').classList.contains('open')), '點亮後編輯器關閉');
  await p.evaluate(() => document.querySelectorAll('.overlay.show').forEach(o => o.classList.remove('show')));
  // 在日記列表找到它，打開詳情 → 編輯 → 改標題 → 儲存
  await p.click('.tb[data-s=log]'); await p.waitForTimeout(500);
  await p.click(`#logList .entry[data-id="${e.id}"]`); await p.waitForTimeout(600);
  ok(await p.evaluate(() => document.getElementById('detail').classList.contains('open') && document.getElementById('detail').textContent.includes('散步看月亮')), '點紀錄打開詳情');
  await p.click('#dEdit'); await p.waitForTimeout(700);
  await p.fill('#fTitle', '河堤的滿月'); await p.click('#saveBtn'); await p.waitForTimeout(1200);
  ok(await p.evaluate(id => { const x = entries.find(y => y.id === id); return x && x.title === '河堤的滿月' && x.loc === '河堤' }, e.id), '編輯標題後儲存，其他欄位不變');
  ok(await n() === 1, '編輯不會多出一則');
  // 搜尋
  await p.evaluate(() => document.querySelectorAll('.layer.open').forEach(l => closeSheet(l.id)));
  await p.fill('#q', '滿月'); await p.waitForTimeout(600);
  ok(await p.evaluate(id => [...document.querySelectorAll('#logList .entry')].map(x => x.dataset.id).join() === id, e.id), '搜尋標題找到這則');
  await p.fill('#q', '不存在的字'); await p.waitForTimeout(600);
  ok(await p.evaluate(() => !document.querySelector('#logList .entry')), '搜尋不到時列表是空的');
  await p.fill('#q', ''); await p.waitForTimeout(600);
  // 刪除與復原
  await p.click(`#logList .entry[data-id="${e.id}"]`); await p.waitForTimeout(600);
  await p.click('#dDel'); await p.waitForTimeout(500);
  ok(await n() === 0, '刪除紀錄');
  const undo = await p.$('.snack button, #snack button, [class*=snack] button');
  if (undo) { await undo.click(); await p.waitForTimeout(500) }
  ok(await p.evaluate(id => entries.some(x => x.id === id && x.title === '河堤的滿月'), e.id), '按「復原」把紀錄找回來');
  ok(await p.evaluate(() => JSON.parse(localStorage.getItem('orbitlog.entries.v1')).length === 1), '復原後也寫回存檔');
  ok(!p.errors.length, '操作過程沒有程式錯誤 ' + p.errors.join('; '));
  await p.context().close() };
