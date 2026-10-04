// 下拉重新整理：重新讀取資料並重畫目前這一頁，不重新載入整個 App；畫面本身不移動
export default async ({ ok, open }) => {
  const p = await open({ hasTouch: true, isMobile: true });
  await p.evaluate(() => { go('log'); window.__mark = 1 }); await p.waitForTimeout(400);
  // 在 App 外面改動儲存的資料（例如另一個分頁寫了一則）
  await p.evaluate(() => { const L = JSON.parse(localStorage.getItem('orbitlog.entries.v1')); L.push({ id: 'ext1', date: ymd(new Date()), time: '08:00', title: '外面新增的紀錄', mood: 3 }); localStorage.setItem('orbitlog.entries.v1', JSON.stringify(L)) });
  const c = await p.context().newCDPSession(p), T = (type, y) => c.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x: 195, y }] });
  await T('touchStart', 200); let moved = false;
  for (let y = 210; y <= 380; y += 10) { await T('touchMove', y); if (y === 300) moved = await p.evaluate(() => document.getElementById('s-log').style.transform === '' && +document.querySelector('.ptr').style.opacity > 0) }
  await T('touchEnd', 380); await p.waitForTimeout(1300);
  ok(moved, '往下拉時畫面不移動，只有星座指示器出現');
  ok(await p.evaluate(() => window.__mark === 1 && document.querySelector('.screen.active').id === 's-log'), '重新整理不會重新載入 App，停在原本的分頁');
  ok(await p.evaluate(() => entries.some(e => e.id === 'ext1') && document.getElementById('logList').textContent.includes('外面新增的紀錄')), '重新讀取資料並重畫目前這一頁');
  ok(!p.errors.length, '沒有程式錯誤 ' + p.errors.join('; '));
  await p.context().close() };
