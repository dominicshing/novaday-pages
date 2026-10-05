// 設定頁：提醒時間不存空值、提示跟著 12／24 小時制、小螢幕時間格式不斷行、說明文字正確
export default async ({ ok, open, run }) => {
  const p = await open({ viewport: { width: 320, height: 568 } });
  await run(p, "document.getElementById('editMe').click()"); await p.waitForTimeout(600);
  ok(await p.evaluate(() => { const t = document.querySelector('#liClock .li-l > span'), lh = parseFloat(getComputedStyle(t).lineHeight) || 20, seg = document.querySelector('#liClock .li-seg button').getBoundingClientRect();
    return t.firstChild.textContent.trim() === '時間格式' && t.getBoundingClientRect().height < lh * 2 + 20 && seg.height >= 36 }), '320px 時「時間格式」不斷行，切換按鈕至少 36px 高');
  ok(await p.evaluate(() => document.querySelector('#openExport small').textContent.includes('完整備份') && !document.querySelector('#openExport small').textContent.includes('純文字')
    && !document.querySelector('#swRemind').closest('.li').textContent.includes('預覽版')), '說明文字符合目前功能（沒有純文字匯出、不寫預覽版）');

  // 每日提醒：提示時間跟著 12／24 小時制；清空提醒時間不會存成空值
  await p.click('#swRemind'); await p.waitForTimeout(300);
  ok(await p.evaluate(() => document.body.textContent.includes('已開啟每日提醒（下午 9:00）')), '開啟提醒的提示用 12 小時制');
  await p.fill('#remindTime', ''); await p.dispatchEvent('#remindTime', 'change'); await p.waitForTimeout(200);
  ok(await p.evaluate(() => prof.remindTime === '21:00' && document.getElementById('remindTime').value === '21:00'), '清空提醒時間時還原，不存空值');
  await p.fill('#remindTime', '07:30'); await p.dispatchEvent('#remindTime', 'change'); await p.waitForTimeout(200);
  ok(await p.evaluate(() => prof.remindTime === '07:30' && document.body.textContent.includes('提醒時間改為 上午 7:30')), '改提醒時間會儲存並提示');
  await p.click('#swRemind'); await p.waitForTimeout(200);

  // 減少動態效果有提示；重設區標題不用紅色
  await p.click('#swCalm'); await p.waitForTimeout(200);
  ok(await p.evaluate(() => prof.calm && document.body.textContent.includes('已開啟減少動態效果')), '減少動態效果切換有提示');
  await p.click('#swCalm'); await p.waitForTimeout(200);
  ok(await p.evaluate(() => { const h = [...document.querySelectorAll('#settingsSheet .set-h')].find(x => x.textContent.trim() === '重設'); return h && getComputedStyle(h).getPropertyValue('--c').trim().toUpperCase() !== '#FF7A8A' }), '重設區標題不用紅色');
  ok(!p.errors.length, '沒有程式錯誤 ' + p.errors.join('; '));
  await p.context().close();
};
