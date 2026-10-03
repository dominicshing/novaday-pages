// 同時開兩個分頁：一邊存檔後，另一邊會讀回最新資料，不會互相蓋掉
export default async ({ ok, open, BASE }) => {
  const A = await open({ seed: { 'orbitlog.profile.v1': { onboarded: 1 }, 'orbitlog.seeded.v1': '1' } });
  const B = await A.context().newPage(); B.errors = []; B.on('pageerror', e => B.errors.push(e.message));
  await B.goto(BASE + '/index.html'); await B.waitForTimeout(900);
  const add = async (p, body) => { await p.evaluate(b => { openEditor(); document.getElementById('fBody').value = b; document.getElementById('form').requestSubmit() }, body); await p.waitForTimeout(1500);
    await p.evaluate(() => document.querySelectorAll('.overlay.show').forEach(o => o.classList.remove('show'))) };
  await add(B, '分頁 B'); await add(A, '分頁 A');
  const saved = await A.evaluate(() => JSON.parse(localStorage.getItem('orbitlog.entries.v1')).map(e => e.body).sort().join());
  ok(saved === '分頁 A,分頁 B', '兩個分頁各寫一則，兩則都保存 ' + saved);
  ok(await B.evaluate(() => entries.length) === 2, '另一個分頁也看得到最新的紀錄');
  await A.evaluate(() => { prof.name = '分頁改名'; saveProf() }); await B.waitForTimeout(300);
  ok(await B.evaluate(() => prof.name) === '分頁改名', '個人資料也會同步');
  ok(!A.errors.length && !B.errors.length, '沒有程式錯誤 ' + A.errors.concat(B.errors).join('; '));
  await A.context().close() };
