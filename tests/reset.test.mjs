// 重設：「重設個人資料與設定」「全部初始化」在一般設定的「重設」裡（不在開發者工具），都要輸入確認字才能執行
export default async ({ ok, open }) => {
  const E = [{ id: 'r1', date: '2026-09-01', time: '10:00', title: '自己寫的', body: '保留我', mood: 3 }];
  const seed = { 'orbitlog.profile.v1': { onboarded: 1, name: '小明', clock24: true }, 'orbitlog.entries.v1': E };
  let p = await open({ seed });
  ok(await p.evaluate(() => { const s = document.getElementById('settingsSheet'), a = document.getElementById('liResetProf'), b = document.getElementById('liInitAll');
    return !!a && !!b && s.contains(a) && s.contains(b) && !document.getElementById('devSec').contains(a) && !document.getElementById('dvInitProf') && !document.getElementById('dvInitAll') }), '兩個重設項目在設定的「重設」裡，開發者工具已移除');

  // 重設個人資料與設定：確認字要打對
  await p.evaluate(() => document.getElementById('liResetProf').click()); await p.waitForTimeout(400);
  ok(await p.evaluate(() => document.getElementById('wpTitle').textContent === '重設個人資料與設定' && document.getElementById('wpGo').disabled && document.getElementById('wpExport').hidden), '打開重設個人資料：按鈕先停用');
  await p.fill('#wpIn', '刪除');
  ok(await p.evaluate(() => document.getElementById('wpGo').disabled), '輸入別的字不能執行');
  await p.fill('#wpIn', '重設');
  ok(await p.evaluate(() => !document.getElementById('wpGo').disabled), '輸入「重設」才能執行');
  await Promise.all([p.waitForEvent('load'), p.click('#wpGo')]); await p.waitForTimeout(900);
  ok(await p.evaluate(() => prof.name !== '小明' && !prof.clock24 && entries.length === 1 && entries[0].body === '保留我'), '重設後個人資料與設定回到預設，日記保留');

  // 全部初始化：確認字是「初始化」，執行後回到第一次使用
  await p.evaluate(() => openWipe('all')); await p.waitForTimeout(400);
  await p.fill('#wpIn', '重設');
  ok(await p.evaluate(() => document.getElementById('wpTitle').textContent === '全部初始化' && document.getElementById('wpGo').disabled), '全部初始化不接受別的確認字');
  await p.fill('#wpIn', '初始化');
  await Promise.all([p.waitForEvent('load'), p.click('#wpGo')]); await p.waitForTimeout(1200);
  ok(await p.evaluate(() => !entries.some(e => e.body === '保留我') && entries.every(isSample) && !document.getElementById('onb').hidden), '全部初始化後資料清空，回到引導頁');
  ok(!p.errors.length, '沒有程式錯誤 ' + p.errors.join('; '));
  await p.context().close();
};
