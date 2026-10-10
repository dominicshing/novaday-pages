// 設定 → 關於：為 Novaday 評分、意見回饋與問題回報
export default async ({ ok, open }) => {
  const p = await open(), ev = c => p.evaluate(c), sl = ms => p.waitForTimeout(ms);
  /* 攔下開新視窗與郵件連結，記下網址 */
  await ev(() => { window.__open = []; window.open = u => { window.__open.push(u); return null } });
  await ev(() => openSheet('settingsSheet')); await sl(400);
  ok(await ev(() => $('liRate').checkVisibility() && $('liFeedback').checkVisibility() && $('rateVal').textContent === ''), '設定的「關於」有評分與意見回饋，還沒評分時不顯示星數');

  // 評分
  await p.click('#liRate'); await sl(500);
  ok(await ev(() => $('rateSheet').classList.contains('open') && $('rtStars').querySelectorAll('[role=radio]').length === 5 && $('rtNext').hidden), '評分面板有 5 顆星，選之前不顯示下一步');
  await p.click('#rtStars [data-v="5"]'); await sl(200);
  ok(await ev(() => prof.rating === 5 && JSON.parse(localStorage.getItem('orbitlog.profile.v1')).rating === 5 && $('rtStars').querySelectorAll('.on').length === 5
    && $('rtGo').textContent === '分享給朋友' && !$('rtMore').hidden && $('rateVal').textContent === '★ 5'), '給 5 顆星：存進個人資料，沒有商店網址時引導分享給朋友，設定列顯示 ★ 5');
  await p.focus('#rtStars [data-v="5"]'); await p.keyboard.press('ArrowLeft'); await p.keyboard.press('ArrowLeft'); await sl(200);
  ok(await ev(() => prof.rating === 3 && document.activeElement.dataset.v === '3' && $('rtGo').textContent === '寫下意見' && $('rtMore').hidden), '方向鍵可以調整星數；3 顆星以下請使用者寫下意見');
  await p.click('#rtGo'); await sl(500);
  ok(await ev(() => !$('rateSheet').classList.contains('open') && $('feedbackSheet').classList.contains('open') && $('fbType').querySelector('[aria-checked=true]').dataset.t === 'idea'),
    '低分時「寫下意見」打開意見回饋，類型是功能建議');
  ok(await ev(() => $('fbDiag').textContent.includes('評分：3 / 5') && $('fbDiag').textContent.includes('版本：Novaday') && !$('fbDiag').textContent.includes(entries[0]?.body || '\u0000')), '裝置資訊附上版本與評分，不含日記內容');

  // 意見回饋
  await p.click('#fbType [data-t="bug"]');
  ok(await ev(() => $('fbMsg').placeholder.startsWith('發生了什麼事')), '切換類型時提示文字跟著換');
  await p.click('#fbSend'); await sl(200);
  ok(await ev(() => !window.__open.length && $('feedbackSheet').classList.contains('open') && $('toast').textContent === '請先寫下內容'), '沒寫內容時不會寄出');
  await p.fill('#fbMsg', '點了星座圖鑑之後畫面變白');
  await p.click('#fbSend'); await sl(400);
  const url = await ev(() => window.__open[0] || '');
  const q = new URL(url).searchParams;
  ok(url.startsWith('https://github.com/dominicshing/novaday-pages/issues/new?') && q.get('title') === '[Novaday] 問題回報：點了星座圖鑑之後畫面變白'
    && q.get('body').startsWith('點了星座圖鑑之後畫面變白\n\n---\n版本：Novaday') && q.get('body').includes('瀏覽器：'), '沒有設定 Email 時打開 GitHub 回報頁面，標題與內文都帶入');
  ok(await ev(() => !$('feedbackSheet').classList.contains('open') && $('fbMsg').value === ''), '寄出後關閉面板並清空內容');

  // 不附裝置資訊
  await ev(() => openFeedback('other')); await sl(400);
  await p.click('#swFbDiag'); await p.fill('#fbMsg', '謝謝你們');
  ok(await ev(() => $('fbPeek').hidden), '關掉「附上裝置資訊」時不顯示預覽');
  await p.click('#fbSend'); await sl(300);
  ok(await ev(() => new URL(window.__open[1]).searchParams.get('body') === '謝謝你們'), '不附裝置資訊時只寄出內容');

  // 設定了 Email：改用郵件 App
  ok(await ev(() => { FEEDBACK.email = 'hi@example.com'; openFeedback('idea'); return $('fbVia').textContent.includes('hi@example.com') }), '設定 Email 後說明會寄到哪裡');
  await sl(400); await p.fill('#fbMsg', '希望可以匯出 PDF');
  const mail = await ev(() => { const r = fbReport(); return `mailto:${FEEDBACK.email}?subject=${encodeURIComponent(r.title)}` });
  ok(mail === 'mailto:hi@example.com?subject=' + encodeURIComponent('[Novaday] 功能建議：希望可以匯出 PDF'), '郵件主旨帶入類型與內容');
  ok(!p.errors.length, '沒有程式錯誤 ' + p.errors.join('; '));
  await p.context().close();

  // 英文介面
  const e = await open({ seed: { 'orbitlog.profile.v1': { onboarded: 1, lang: 'en', rating: 4 } } });
  ok(await e.evaluate(() => { openRate(); return $('rateVal').textContent === '★ 4' && $('rtLbl').textContent === 'Like it' && $('rtGo').textContent === 'Share with a friend'
    && (openFeedback('bug'), $('fbDiag').textContent.startsWith('Version: Novaday') && $('fbDiag').textContent.includes('Rating: 4 / 5')) }), '英文介面：評分與裝置資訊都是英文');
  ok(!e.errors.length, '英文介面沒有程式錯誤 ' + e.errors.join('; '));
  await e.context().close();
};
