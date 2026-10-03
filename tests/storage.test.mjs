// 讀取時修正格式不對的紀錄：App 不會因為一筆壞資料打不開，原始資料留底，正常資料不受影響
export default async ({ ok, open }) => {
  const P = { 'orbitlog.profile.v1': { onboarded: 1 }, 'orbitlog.seeded.v1': '1' };
  // 正常的紀錄（包含沒有 time、tags 欄位的舊紀錄）不會被當成壞資料
  const good = [{ id: 'a', date: '2026-09-01', title: '舊紀錄', mood: 3 }, { id: 'b', date: '2026-09-02', time: '21:00', title: 't', body: 'b', mood: 0, tags: ['x'], loc: '家' }];
  let p = await open({ seed: { ...P, 'orbitlog.entries.v1': good } });
  ok(await p.evaluate(g => JSON.stringify(entries) === JSON.stringify(g) && localStorage.getItem('orbitlog.entries.broken.v1') === null, good), '正常紀錄原樣讀入，不另外留底');
  await p.context().close();

  const bad = [null, 'x', { id: 'm', date: '2026-10-01', mood: 7, tags: '工作', title: 12 }, { id: 'm', date: '2026-10-02', mood: '3', tags: [null, '旅行'], time: '99:99' },
    { id: 'd', date: '2026-13-45', title: '日期錯誤' }, { id: 'v', date: '2026-09-30', body: { x: 1 }, video: 'nope', photoMore: 'p' }];
  p = await open({ seed: { ...P, 'orbitlog.entries.v1': bad } });
  const r = await p.evaluate(() => { for (const s of ['home', 'log', 'atlas', 'me']) go(s); go('log', 'cal'); openDetail(entries[0].id); openTags(); openYearReport(2026); return { n: entries.length, ids: new Set(entries.map(e => e.id)).size, m: entries.map(e => e.mood), t: entries.map(e => e.tags), tm: entries[1].time, title: entries[0].title, body: entries[2].body, v: 'video' in entries[2], pm: 'photoMore' in entries[2], broken: JSON.parse(localStorage.getItem('orbitlog.entries.broken.v1')).length } });
  ok(r.n === 3 && r.ids === 3, '修不好的紀錄不載入，重複的 id 會換新 ' + JSON.stringify(r));
  ok(JSON.stringify(r.m) === '[2,3,null]' && JSON.stringify(r.t) === '[["工作"],["旅行"],null]' && r.tm === '' && r.title === '12' && r.body === '' && !r.v && !r.pm, '心情、標籤、時間、文字欄位修正為正確格式');
  ok(r.broken === 6, '原始資料完整留底');
  ok(!p.errors.length, '壞資料不會造成程式錯誤 ' + p.errors.join('; '));
  await p.context().close();

  // 整份資料不是陣列：不覆蓋原始資料，先留底
  p = await open({ seed: { ...P, 'orbitlog.entries.v1': '{"foo":1' } });
  ok(await p.evaluate(() => entries.length === 0 && localStorage.getItem('orbitlog.entries.broken.v1') === '{"foo":1'), '無法解析的資料先留底再開始');
  ok(!p.errors.length, '沒有程式錯誤 ' + p.errors.join('; '));
  await p.context().close();

  // 個人資料欄位型別不對：改回預設值，App 正常開啟
  p = await open({ seed: { 'orbitlog.profile.v1': { onboarded: 1, name: 5, conOrder: ['Xyz', null, 'Ori', 'Ori'], livery: 99, region: '台北', birthday: 'abc', remindTime: 5, achNew: 'x' } } });
  const q = await p.evaluate(() => { for (const s of ['home', 'log', 'atlas', 'me']) go(s); openEditor(); openCon('Ori'); return { name: prof.name, co: prof.conOrder.slice(0, 1), lv: prof.livery, rg: prof.region, bd: prof.birthday, rt: prof.remindTime, an: prof.achNew } });
  ok(q.name === '星旅人' && q.co[0] === 'Ori' && q.lv === null && q.rg === null && q.bd === undefined && q.rt === '21:00' && Array.isArray(q.an), '個人資料錯誤的欄位改回預設值 ' + JSON.stringify(q));
  ok(!p.errors.length, '沒有程式錯誤 ' + p.errors.join('; '));
  await p.context().close();

  // 清除所有紀錄：紀錄、草稿、回顧紀錄、照片與影片都立刻刪掉
  p = await open();
  await p.waitForTimeout(800);
  await p.evaluate(() => { localStorage.setItem('orbitlog.draft.v1', JSON.stringify({ editing: null, body: '草稿', mood: 2 })); reviews.ids = { s1: '2026-01-01' }; saveReviews(); openWipe() });
  const k0 = await p.evaluate(async () => (await mediaKeys()).length);
  await p.fill('#wpIn', '刪除'); await p.click('#wpGo'); await p.waitForTimeout(800);
  const w = await p.evaluate(async () => ({ n: entries.length, media: (await mediaKeys()).length, draft: localStorage.getItem('orbitlog.draft.v1'), rv: Object.keys(reviews.ids).length, bar: document.getElementById('draftBar').hidden }));
  ok(k0 > 0 && w.n === 0 && w.media === 0 && w.draft === null && w.rv === 0 && w.bar, '清除所有紀錄時一併刪除照片影片、草稿與回顧紀錄 ' + JSON.stringify({ before: k0, ...w }));
  ok(!p.errors.length, '沒有程式錯誤 ' + p.errors.join('; '));
  await p.context().close() };
