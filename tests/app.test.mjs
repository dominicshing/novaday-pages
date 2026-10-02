// App 基本功能：載入沒有錯誤、第一次使用顯示引導、分頁切換、寫一則紀錄
export default async ({ ok, open, run }) => {
  // 全新使用者：沒有任何資料 → 顯示引導頁，並放入範例紀錄
  let p = await open({ seed: {} });
  ok(await p.evaluate(() => !document.getElementById('onb').hidden), '第一次使用顯示引導頁');
  ok(await p.evaluate(() => entries.length > 0 && entries.every(isSample)), '放入範例紀錄');
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
  ok(!p.errors.length, '操作過程沒有程式錯誤 ' + p.errors.join('; '));
  await p.context().close() };
