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
  // 慶祝畫面：Tab 留在畫面內，Esc 等同按主要按鈕
  await p.evaluate(() => { window.__done = false; showConDone('Sge').then(() => window.__done = true) }); await p.waitForTimeout(700);
  for (let i = 0; i < 6; i++) await p.keyboard.press('Tab');
  ok(await p.evaluate(() => document.getElementById('conDone').contains(document.activeElement)), '星座完成畫面：Tab 留在畫面內');
  await p.keyboard.press('Escape'); await p.waitForTimeout(300);
  ok(await p.evaluate(() => window.__done && !document.getElementById('conDone').classList.contains('show')), '星座完成畫面：Esc 關閉');
  ok(!p.errors.length, '沒有程式錯誤 ' + p.errors.join('; '));
  await p.context().close();

  // 引導頁：後面的 App 不能被 Tab 移到；收起的復原列按鈕也不在 Tab 順序裡
  const po = await open({ seed: { 'orbitlog.profile.v1': {} } }); await po.waitForTimeout(600);
  const outs = []; for (let i = 0; i < 8; i++) { await po.keyboard.press('Tab'); outs.push(await po.evaluate(() => { const a = document.activeElement; return a === document.body || document.getElementById('onb').contains(a) ? '' : a.id || a.className })) }
  ok(outs.every(x => !x), '引導頁顯示時 Tab 不會跑到後面的 App ' + outs.filter(Boolean).join(','));
  await po.context().close();

  // 減少動態效果：系統設定與 App 內設定都不應該有無限循環的動畫在跑
  const loops = async pg => { const out = new Set();
    for (const c of ["go('home')", "go('log')", "go('log','cal')", "go('atlas')", "go('me')", 'openEditor()', 'openDetail(entries[0].id)', 'openAch(ACH[0].id)', "openCon('Ori')", "prof.birthday='1990-05-20';openFortune()", 'openReport(2026,9)', "openSheet('settingsSheet')"]) {
      await pg.evaluate(c => { document.querySelectorAll('.layer.open').forEach(l => l.classList.remove('open')); (0, eval)(c) }, c); await pg.waitForTimeout(500);
      (await pg.evaluate(() => document.getAnimations().filter(a => a.playState === 'running' && a.effect && a.effect.getTiming().iterations === Infinity).map(a => a.animationName))).forEach(n => out.add(n)) }
    return [...out] };
  const ps = await open({ reducedMotion: 'reduce' });
  const l1 = await loops(ps); ok(!l1.length, '系統「減少動態效果」時沒有循環動畫 ' + l1.join(', ')); await ps.context().close();
  const pc = await open({ seed: { 'orbitlog.profile.v1': { onboarded: 1, calm: true } } });
  const l2 = await loops(pc); ok(!l2.length, 'App 內「減少動態效果」時沒有循環動畫 ' + l2.join(', ')); await pc.context().close() };
