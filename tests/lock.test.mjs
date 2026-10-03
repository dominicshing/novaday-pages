// 密碼鎖：設定、重新開啟要輸入、鎖後面的畫面無法操作、「忘記密碼？」的確認看得到
export default async ({ ok, open }) => {
  const p = await open({ seed: { 'orbitlog.profile.v1': { onboarded: 1 } } });
  const type = async s => { for (const c of s) { await p.click(`#lkPad [data-k="${c}"]`); await p.waitForTimeout(40) } await p.waitForTimeout(400) };
  await p.evaluate(() => openLock('set')); await p.waitForTimeout(300);
  await type('1234'); await type('1234');
  ok(await p.evaluate(() => !!prof.pin && document.getElementById('lock').hidden && !document.getElementById('app').inert), '設定密碼後解除上鎖狀態');
  await p.reload(); await p.waitForTimeout(1000);
  ok(await p.evaluate(() => !document.getElementById('lock').hidden && document.getElementById('app').inert), '重新開啟時上鎖，後面的畫面無法操作');
  for (let i = 0; i < 6; i++) await p.keyboard.press('Tab');
  ok(await p.evaluate(() => document.getElementById('lock').contains(document.activeElement)), 'Tab 不會移到鎖後面的畫面');
  await p.click('#lkForgot'); await p.waitForTimeout(500);
  ok(await p.evaluate(() => { const b = document.querySelector('#askBtns button'), r = b.getBoundingClientRect(); return document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2)?.closest('#ask') != null }), '「忘記密碼？」的確認顯示在密碼鎖上面');
  await p.click('#askBtns [data-k="cancel"]'); await p.waitForTimeout(400);
  await type('9999');
  ok(await p.evaluate(() => !document.getElementById('lock').hidden), '密碼錯誤不會解鎖');
  await p.waitForTimeout(400); await type('1234');
  ok(await p.evaluate(() => document.getElementById('lock').hidden && !document.getElementById('app').inert), '輸入正確密碼解鎖');
  // 提示（toast）要在密碼鎖與引導頁上面也看得到
  const toastTop = () => p.evaluate(() => { const t = document.getElementById('toast'); t.style.pointerEvents = 'auto'; const r = t.getBoundingClientRect(), e = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2); t.style.pointerEvents = ''; return !!(e && (e === t || t.contains(e))) });
  await p.evaluate(() => { openLock('unlock'); toast('鎖畫面上的提示', 3000) }); await p.waitForTimeout(400);
  ok(await toastTop(), '密碼鎖畫面上看得到提示');
  await p.evaluate(() => { closeLock(); document.getElementById('onb').hidden = false; toast('引導頁上的提示', 3000) }); await p.waitForTimeout(400);
  ok(await toastTop(), '引導頁上看得到提示');
  ok(!p.errors.length, '沒有程式錯誤 ' + p.errors.join('; '));
  await p.context().close() };
