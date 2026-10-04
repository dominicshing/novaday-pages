// 時區：新紀錄存下裝置時區；只有時差不同時，詳情頁才提示寫的時候在哪個時區；分享卡片的時間跟著 12／24 小時制
export default async ({ ok, open, run }) => {
  const E = [
    { id: 'tk', date: '2026-07-01', time: '21:30', title: '東京', mood: 3, tz: 'Asia/Tokyo' },
    { id: 'sh', date: '2026-07-02', time: '21:30', title: '上海', mood: 3, tz: 'Asia/Shanghai' },
    { id: 'ny', date: '2026-07-03', time: '08:00', title: '紐約', mood: 3, tz: 'America/New_York' },
    { id: 'no', date: '2026-07-04', time: '09:00', title: '沒有時區', mood: 3 },
    { id: 'bad', date: '2026-07-05', time: '09:00', title: '壞掉的時區', mood: 3, tz: 'not a zone!' }];
  const p = await open({ seed: { 'orbitlog.profile.v1': { onboarded: 1 }, 'orbitlog.entries.v1': E }, timezoneId: 'Asia/Taipei' });
  ok(await p.evaluate(() => devTZ() === 'Asia/Taipei' && !('tz' in entries.find(e => e.id === 'bad')) && entries.find(e => e.id === 'tk').tz === 'Asia/Tokyo'), '讀取時保留有效的時區、移除無效的時區');
  const hint = id => p.evaluate(i => { openDetail(i); const h = document.querySelector('#dBody .dv-tz'); return h ? h.textContent : '' }, id);
  const tk = await hint('tk');
  ok(tk.includes('比這裡快 1 小時') && tk.includes('日本'), '時差不同時提示寫的時候在哪個時區 ' + tk);
  ok((await hint('ny')).includes('比這裡慢 12 小時'), '慢的時區也算得對（紐約夏令時間）');
  ok(!(await hint('sh')) && !(await hint('no')), '時差相同、或沒有時區的紀錄不提示');
  await run(p, "closeSheet('detail')"); await p.waitForTimeout(300);

  // 新紀錄存下時區；編輯舊紀錄保留原本的時區
  await run(p, 'openEditor()'); await p.waitForTimeout(500);
  await p.fill('#fBody', '新的一則'); await run(p, "document.getElementById('form').requestSubmit()"); await p.waitForTimeout(2500);
  await p.evaluate(() => { document.querySelectorAll('.layer.open,.celebrate.show').forEach(x => x.classList.remove('open', 'show')) });
  ok(await p.evaluate(() => (entries.find(e => e.body === '新的一則') || {}).tz === 'Asia/Taipei'), '新紀錄存下裝置的時區');
  await run(p, "openEditor('tk')"); await p.waitForTimeout(500);
  await p.fill('#fTitle', '東京（改）'); await run(p, "document.getElementById('form').requestSubmit()"); await p.waitForTimeout(2500);
  ok(await p.evaluate(() => { const e = entries.find(x => x.id === 'tk'); return e.title === '東京（改）' && e.tz === 'Asia/Tokyo' }), '編輯舊紀錄不改寫原本的時區');

  // 分享卡片的時間跟著設定
  const card = () => p.evaluate(() => entrySVG(entries.find(e => e.id === 'tk'), false));
  ok((await card()).includes('下午 9:30'), '分享卡片預設用 12 小時制');
  await p.evaluate(() => { prof.clock24 = true });
  ok((await card()).includes('21:30') && !(await card()).includes('下午 9:30'), '分享卡片改成 24 小時制');
  ok(!p.errors.length, '沒有程式錯誤 ' + p.errors.join('; '));
  await p.context().close();
};
