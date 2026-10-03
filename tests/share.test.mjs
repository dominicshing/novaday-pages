// 分享圖卡：標題、內文有特殊符號、控制字元、落單的代理字元時，圖卡仍能產生
export default async ({ ok, open }) => {
  const d = new Date(Date.now() - 864e5), day = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  const E = [{ id: 'amp', date: day, time: '21:00', title: 'A & B <x> "q"', body: '內文 & <b>', mood: 3, tags: ['A&B'], loc: '台北 & <loc>' },
    { id: 'ctl', date: day, time: '22:00', title: '控制\u0001\u000b字元\ud800', body: '貼上的\u001f文字\udc00', mood: 2, tags: [] }];
  const p = await open({ seed: { 'orbitlog.profile.v1': { onboarded: 1, name: '名 & <字>' }, 'orbitlog.seeded.v1': '1', 'orbitlog.entries.v1': E } });
  for (const id of ['amp', 'ctl']) {
    await p.evaluate(i => openEntryShare(i), id);
    await p.waitForFunction(() => /<img|失敗/.test(document.getElementById('shPrev').innerHTML), null, { timeout: 5000 }).catch(() => {});
    ok(await p.evaluate(() => !!document.querySelector('#shPrev img')), `分享圖卡能產生（${id}）`) }
  const [dl] = await Promise.all([p.waitForEvent('download', { timeout: 5000 }).catch(() => null), p.click('#shSave')]);
  ok(dl && /\.png$/.test(dl.suggestedFilename()), '一般瀏覽器按「儲存圖片」會直接下載 PNG ' + (dl && dl.suggestedFilename()));
  ok(!p.errors.length, '沒有程式錯誤 ' + p.errors.join('; '));
  await p.context().close() };
