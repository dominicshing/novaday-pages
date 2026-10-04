// App 基本功能：載入沒有錯誤、第一次使用顯示引導、分頁切換、寫一則紀錄
export default async ({ ok, open, run }) => {
  // 全新使用者：沒有任何資料 → 顯示引導頁，並放入範例紀錄
  let p = await open({ seed: {} });
  ok(await p.evaluate(() => !document.getElementById('onb').hidden), '第一次使用顯示引導頁');
  ok(await p.evaluate(() => entries.length > 0 && entries.every(isSample)), '放入範例紀錄');
  ok(await p.evaluate(() => entries.filter(e => entryPhotos(e).length).length >= 3 && entries.filter(e => e.photoMore).length >= 2), '範例紀錄有照片，也有多張照片的紀錄');
  ok(await p.evaluate(async () => { const v = entries.filter(hasVideo); await new Promise(r => setTimeout(r, 500)); const keys = await mediaKeys(); return v.length >= 2 && v.every(e => keys.includes(e.video.id) && e.video.poster) }), '範例影片存進 IndexedDB 並有封面');
  ok(await p.evaluate(() => { const v = entries.find(e => hasVideo(e) && !e.photo), b = entries.find(e => hasVideo(e) && e.photo), d = document.createElement('div');
    d.innerHTML = entryRow(v) + entryRow(b) + entryCard(b); const [r1, r2, c] = d.children;
    return !!r1.querySelector('[aria-label="有影片"]') && !r1.querySelector('[aria-label="有照片"]') && !!r2.querySelector('[aria-label="有照片"]') && !!r2.querySelector('[aria-label="有影片"]') && !!c.querySelector('.thumb-play') }), '精簡列表標示影片；照片加影片的卡片縮圖有播放標記');
  ok(!p.errors.length, '載入沒有程式錯誤 ' + p.errors.join('; '));
  await p.context().close();

  // 已完成引導的使用者
  p = await open();
  ok(await p.evaluate(() => document.getElementById('onb').hidden), '完成引導後不再顯示');
  for (const s of ['log', 'atlas', 'me', 'home']) {
    await run(p, `go('${s}')`); await p.waitForTimeout(300);
    ok(await p.evaluate(s => document.getElementById('s-' + s).classList.contains('active'), s), `切換到「${s}」分頁`) }

  // 寫一則文字紀錄
  const n0 = await p.evaluate(() => entries.length);
  await run(p, 'openEditor()'); await p.waitForTimeout(500);
  await p.fill('#fTitle', '測試紀錄'); await p.fill('#fBody', '今天天氣很好。');
  await run(p, "document.getElementById('form').requestSubmit()"); await p.waitForTimeout(2500);
  for (const id of ['cdOk', 'lvUpOk']) await p.evaluate(id => { const b = document.getElementById(id); if (b && b.offsetParent) b.click() }, id);
  ok(await p.evaluate(n => entries.length === n + 1 && entries.some(e => e.title === '測試紀錄'), n0), '新增紀錄並存檔');
  ok(await p.evaluate(() => JSON.parse(localStorage.getItem('orbitlog.entries.v1')).some(e => e.title === '測試紀錄')), '紀錄寫進 localStorage');

  // 時間格式：預設 12 小時制，可改成 24 小時制
  ok(await p.evaluate(() => !prof.clock24 && fmtTime('21:30') === '下午 9:30' && fmtTime('00:05') === '上午 12:05'), '預設 12 小時制');
  await run(p, "document.getElementById('clk24').click()"); await p.waitForTimeout(200);
  ok(await p.evaluate(() => prof.clock24 === true && fmtTime('21:30') === '21:30' && [...document.querySelectorAll('#logList .tm')].every(t => !/上午|下午/.test(t.textContent))), '可切換成 24 小時制');
  await run(p, "document.getElementById('clk12').click()"); await p.waitForTimeout(200);

  // 不能寫未來的日記：選明天的日期按點亮 → 不會存，日期改回今天
  const n1 = await p.evaluate(() => entries.length);
  await run(p, "openEditor();const d=new Date();d.setDate(d.getDate()+1);document.getElementById('fDate').value=ymd(d)"); await p.waitForTimeout(300);
  await p.fill('#fBody', '未來的紀錄');
  await run(p, "document.getElementById('form').requestSubmit()"); await p.waitForTimeout(500);
  const fu = await p.evaluate(n => [entries.length - n, document.getElementById('fDate').value, document.getElementById('fDate').max, ymd(new Date())], n1);
  ok(fu[0] === 0 && fu[1] === fu[3] && fu[2] === fu[3], '不能寫未來日期的紀錄 ' + fu.join(' '));
  await run(p, "const n=new Date();document.getElementById('fTime').value=pad((n.getHours()+1)%24)+':00';document.getElementById('fTime').dispatchEvent(new Event('change'))"); await p.waitForTimeout(200);
  ok(await p.evaluate(() => { const n = new Date(), v = document.getElementById('fTime').value; return n.getHours() === 23 || v <= pad(n.getHours()) + ':' + pad(n.getMinutes()) }), '今天的時間不能晚於現在');
  ok(!p.errors.length, '操作過程沒有程式錯誤 ' + p.errors.join('; '));
  await p.context().close() };
