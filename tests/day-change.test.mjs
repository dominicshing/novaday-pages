// 跨日：App 在背景過夜，隔天回到前景時「今天」相關內容會更新
export default async ({ ok, open }) => {
  const p = await open();
  const homeDate = () => p.evaluate(() => document.getElementById('s-home').innerText.split('\n')[0]);
  const d0 = await homeDate();
  await p.evaluate(() => { const R = Date, off = 864e5; class D extends R { constructor(...a) { if (a.length) super(...a); else super(R.now() + off) } static now() { return R.now() + off } } window.Date = D;
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => false }); document.dispatchEvent(new Event('visibilitychange')) });
  await p.waitForTimeout(300);
  const r = await p.evaluate(() => { const n = new Date(); return { want: `${n.getMonth() + 1} 月 ${n.getDate()} 日`, today: ymd(n), sel: selDate } });
  const d1 = await homeDate();
  ok(d1 !== d0 && d1.startsWith(r.want), `回到前景時首頁日期換成隔天（${d0} → ${d1}）`);
  ok(r.sel === r.today, '月曆選取的「今天」也換成隔天');
  ok(!p.errors.length, '沒有程式錯誤 ' + p.errors.join('; '));
  await p.context().close() };
