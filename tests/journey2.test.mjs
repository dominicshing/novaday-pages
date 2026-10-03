// 使用者操作流程（二）：草稿、標籤改名與合併、月曆點日期、修改暱稱
export default async ({ ok, open }) => {
  const d0 = new Date(), ymd = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  const day = n => { const d = new Date(d0); d.setDate(d.getDate() - n); return ymd(d) };
  const E = [{ id: 'a', date: day(1), time: '20:00', title: '工作日', body: 'x', mood: 2, tags: ['工作'] },
    { id: 'b', date: day(2), time: '20:00', title: '上班', body: 'y', mood: 3, tags: ['上班', '工作'] },
    { id: 'c', date: day(3), time: '20:00', title: '加班', body: 'z', mood: 1, tags: ['上班'] }];
  const p = await open({ seed: { 'orbitlog.profile.v1': { onboarded: 1 }, 'orbitlog.seeded.v1': '1', 'orbitlog.entries.v1': E } });

  // 草稿：寫到一半按取消 → 選「保留草稿」→ 首頁出現草稿列 → 重新整理後點草稿列，內容還在
  await p.click('#newBtn'); await p.waitForTimeout(500);
  await p.fill('#fBody', '寫到一半的草稿');
  await p.click('#form .sh [data-close]'); await p.waitForTimeout(400);
  await p.click('#askBtns [data-k="later"]'); await p.waitForTimeout(500);
  ok(await p.evaluate(() => !document.getElementById('editor').classList.contains('open') && !document.getElementById('draftBar').hidden), '取消時保留草稿，首頁出現草稿列');
  await p.reload(); await p.waitForTimeout(1000);
  await p.click('#draftBar'); await p.waitForTimeout(600);
  ok(await p.evaluate(() => document.getElementById('fBody').value === '寫到一半的草稿'), '重新整理後從草稿列還原內容');
  await p.click('#form .sh [data-close]'); await p.waitForTimeout(400);
  await p.click('#askBtns [data-k="discard"]'); await p.waitForTimeout(500);
  ok(await p.evaluate(() => document.getElementById('draftBar').hidden && entries.length === 3), '捨棄草稿後草稿列消失，不會多出紀錄');

  // 標籤：把「上班」改名成「工作」→ 合併，同一則不會有兩個「工作」→ 復原
  await p.evaluate(() => openTags()); await p.waitForTimeout(400);
  await p.click('#tgList .tg-row[data-t="上班"] .tg-main'); await p.waitForTimeout(200);
  await p.fill('#tgIn', '工作'); await p.waitForTimeout(100);
  ok(await p.evaluate(() => document.getElementById('tgSave').textContent === '合併'), '改成已存在的名稱時按鈕顯示「合併」');
  await p.click('#tgSave'); await p.waitForTimeout(400);
  ok(await p.evaluate(() => JSON.stringify(entries.map(e => e.tags)) === '[["工作"],["工作"],["工作"]]'), '合併後每則只有一個「工作」');
  await p.click('.snack button, #snack button, [class*=snack] button'); await p.waitForTimeout(400);
  ok(await p.evaluate(() => JSON.stringify(entries.map(e => e.tags)) === '[["工作"],["上班","工作"],["上班"]]'), '復原合併');
  await p.evaluate(() => closeSheet('tagSheet'));

  // 月曆：點有紀錄的日期，下方顯示那天的紀錄
  await p.evaluate(() => go('log', 'cal')); await p.waitForTimeout(500);
  const target = day(2);
  const inMonth = await p.evaluate(t => !!document.querySelector(`#calView .cell[data-d="${t}"]`), target);
  if (inMonth) {
    await p.click(`#calView .cell[data-d="${target}"]`); await p.waitForTimeout(400);
    ok(await p.evaluate(() => document.getElementById('calDay').textContent.includes('上班')), '月曆點日期顯示當天紀錄');
  } else ok(true, '月曆點日期（目標日期不在本月，略過）');

  // 修改暱稱
  await p.evaluate(() => go('me')); await p.waitForTimeout(300);
  await p.evaluate(() => openMeEdit()); await p.waitForTimeout(400);
  await p.fill('#inName', '小熊'); await p.click('#meSave'); await p.waitForTimeout(500);
  await p.reload(); await p.waitForTimeout(1000);
  ok(await p.evaluate(() => prof.name === '小熊' && document.getElementById('pName').textContent === '小熊'), '修改暱稱並保存');
  // 一句話快記 + 未完成的草稿：快記單獨存成一則，草稿原封不動
  await p.evaluate(() => go('home')); await p.waitForTimeout(300);
  await p.click('#newBtn'); await p.waitForTimeout(500);
  await p.fill('#fTitle', '草稿標題'); await p.fill('#fBody', '草稿的長內文');
  await p.click('#form .sh [data-close]'); await p.waitForTimeout(400); await p.click('#askBtns [data-k="later"]'); await p.waitForTimeout(500);
  const n0 = await p.evaluate(() => entries.length);
  await p.fill('#qnText', '今天好累'); await p.click('#qnGo'); await p.waitForTimeout(2500);
  await p.evaluate(() => document.querySelectorAll('.overlay.show').forEach(o => o.classList.remove('show')));
  const q = await p.evaluate(() => { const e = entries.find(x => x.body === '今天好累'); const d = JSON.parse(localStorage.getItem('orbitlog.draft.v1') || 'null'); return { n: entries.length, title: e && e.title, dT: d && d.title, dB: d && d.body, bar: !document.getElementById('draftBar').hidden } });
  ok(q.n === n0 + 1 && q.title === '' && q.dT === '草稿標題' && q.dB === '草稿的長內文' && q.bar, '快記不會帶上草稿內容，草稿保留 ' + JSON.stringify(q));
  // 指定日期補寫 + 草稿：編輯器是全新的、日期是指定的那天；存完草稿仍在
  const back = day(5), draftOK = () => p.evaluate(() => { const d = JSON.parse(localStorage.getItem('orbitlog.draft.v1') || 'null'); return !!d && d.title === '草稿標題' && d.body === '草稿的長內文' });
  await p.evaluate(b => openEditor(null, false, b), back); await p.waitForTimeout(500);
  ok(await p.evaluate(b => document.getElementById('fDate').value === b && document.getElementById('fTitle').value === '' && document.getElementById('fBody').value === '', back), '補寫指定日期時不會套用草稿，日期正確');
  await p.fill('#fBody', '補寫的內容'); await p.click('#saveBtn'); await p.waitForTimeout(2500);
  await p.evaluate(() => document.querySelectorAll('.overlay.show').forEach(o => o.classList.remove('show')));
  ok(await p.evaluate(b => entries.some(e => e.body === '補寫的內容' && e.date === b), back) && await draftOK(), '補寫存檔後，原本的草稿還在');
  // 補寫到一半取消：只能繼續寫或捨棄這則，原本的草稿不受影響
  await p.evaluate(b => openEditor(null, false, b), day(6)); await p.waitForTimeout(500);
  await p.fill('#fBody', '寫一半'); await p.click('#form .sh [data-close]'); await p.waitForTimeout(400);
  ok(await p.evaluate(() => [...document.querySelectorAll('#askBtns [data-k]')].map(b => b.dataset.k).join() === 'keep,discard'), '取消時只提供繼續寫或捨棄');
  await p.click('#askBtns [data-k="discard"]'); await p.waitForTimeout(400);
  ok(await draftOK() && !(await p.evaluate(() => entries.some(e => e.body === '寫一半'))), '捨棄後原本的草稿還在');
  // 收起草稿時重新整理：下次開啟會放回草稿
  await p.evaluate(b => openEditor(null, false, b), day(7)); await p.waitForTimeout(400);
  await p.reload(); await p.waitForTimeout(1000);
  ok(await draftOK() && await p.evaluate(() => localStorage.getItem('orbitlog.draft.stash.v1') === null && !document.getElementById('draftBar').hidden), '途中重新整理，草稿會放回來');
  ok(!p.errors.length, '操作過程沒有程式錯誤 ' + p.errors.join('; '));
  await p.context().close() };
