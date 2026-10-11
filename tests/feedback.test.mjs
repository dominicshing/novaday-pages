// 設定 → 關於：為 Novaday 評分（模擬 App Store／Google Play 的系統評分視窗）、意見回饋與問題回報（寄到 Email）
export default async ({ ok, open }) => {
  const p = await open(), ev = c => p.evaluate(c), sl = ms => p.waitForTimeout(ms);
  /* 攔下郵件連結與開新視窗，記下網址 */
  await ev(() => { window.__go = []; window.fbGo = u => window.__go.push(u); window.open = u => { window.__go.push(u); return null } });
  await ev(() => openSheet('settingsSheet')); await sl(400);
  ok(await ev(() => $('liRate').checkVisibility() && $('liFeedback').checkVisibility() && !$('liRate').querySelector('.li-v')), '設定的「關於」有評分與意見回饋，不顯示星數（系統評分不會告訴 App）');

  // App Store 樣式（桌面與 iPhone 的預設）
  await p.click('#liRate'); await sl(400);
  ok(await ev(() => !$('review').hidden && $('review').dataset.ui === 'ios' && document.querySelector('.rv-ios[role=alertdialog]') && $('rvT').textContent === '喜歡「Novaday」嗎？'
    && document.querySelectorAll('.rv-stars [role=radio]').length === 5 && [...document.querySelectorAll('.rv-btns button')].map(b => b.textContent).join() === '以後再說'
    && document.activeElement.dataset.v === '1' && document.querySelector('.rv-icon svg')), 'App Store 樣式：App 圖示、標題、5 顆星，只有「以後再說」，焦點在第一顆星');
  await p.click('.rv-stars [data-v="4"]'); await sl(100);
  ok(await ev(() => document.querySelectorAll('.rv-stars .on').length === 4 && [...document.querySelectorAll('.rv-btns button')].map(b => b.textContent).join() === '取消,送出' && prof.rating == null),
    '點星號後出現「取消／送出」，還沒送出前不儲存');
  await p.keyboard.press('ArrowRight'); await sl(100);
  ok(await ev(() => document.querySelectorAll('.rv-stars .on').length === 5 && document.activeElement.dataset.v === '5'), '方向鍵可以調整星數');
  await p.click('.rv-btns [data-a=submit]'); await sl(200);
  ok(await ev(() => prof.rating === 5 && JSON.parse(localStorage.getItem('orbitlog.profile.v1')).rating === 5 && $('rvT').textContent === '感謝你的意見回饋。'
    && [...document.querySelectorAll('.rv-btns button')].map(b => b.textContent).join() === '撰寫評論,好' && document.querySelector('.rv-stars button').disabled), '送出後儲存，顯示感謝與「撰寫評論／好」');
  await p.click('.rv-btns [data-a=write]'); await sl(500);
  ok(await ev(() => $('review').hidden && $('feedbackSheet').classList.contains('open')), '還沒上架時「撰寫評論」打開意見回饋');
  await ev(() => closeSheet('feedbackSheet')); await sl(300);
  await ev(() => openReview('ios')); await sl(300); await p.keyboard.press('Escape'); await sl(300);
  ok(await ev(() => $('review').hidden && $('settingsSheet').classList.contains('open')), 'Esc 關閉評分視窗，設定還開著');

  // Google Play 樣式
  await ev(() => openReview('play')); await sl(400);
  ok(await ev(() => document.querySelector('.rv-play[role=dialog]') && $('rvT').textContent === '為這個應用程式評分' && document.querySelector('.rv-more').hidden
    && [...document.querySelectorAll('.rv-btns button')].map(b => b.textContent).join() === '不用了'), 'Google Play 樣式：底部面板，只有「不用了」');
  await p.click('.rv-stars [data-v="3"]'); await sl(100);
  ok(await ev(() => !document.querySelector('.rv-more').hidden && $('rvTxt').placeholder === '描述你的使用體驗（選填）' && [...document.querySelectorAll('.rv-btns button')].map(b => b.textContent).join() === '不用了,提交'),
    '點星號後展開選填的評論與「提交」');
  await p.fill('#rvTxt', '很喜歡星座圖鑑'); await p.click('.rv-stars [data-v="4"]'); await sl(100);
  ok(await ev(() => $('rvTxt').value === '很喜歡星座圖鑑'), '改星數不會清掉已經寫的評論');
  await p.click('.rv-btns [data-a=submit]'); await sl(400);
  ok(await ev(() => $('review').hidden && prof.rating === 4 && prof.review === '很喜歡星座圖鑑' && $('toast').textContent === '感謝你的評論！'), '提交後關閉並儲存星數與評論');
  ok(await ev(() => { const u = navigator.userAgent; return rvPlatform() === (/Android/i.test(u) ? 'play' : 'ios') }), '依裝置選擇樣式（Android 用 Google Play，其他用 App Store）');

  // 意見回饋：寄到 Email
  await ev(() => openFeedback('bug')); await sl(400);
  ok(await ev(() => $('fbVia').textContent.includes('tommyleegarden@gmail.com') && $('fbMsg').placeholder.startsWith('發生了什麼事')), '意見回饋寄到 tommyleegarden@gmail.com');
  ok(await ev(() => $('fbDiag').textContent.includes('版本：Novaday') && !$('fbDiag').textContent.includes('評分') && !$('fbDiag').textContent.includes(entries[0]?.body || '\u0000')), '裝置資訊附上版本，不含評分與日記內容');
  await p.click('#fbSend'); await sl(200);
  ok(await ev(() => !window.__go.length && $('feedbackSheet').classList.contains('open') && $('toast').textContent === '請先寫下內容'), '沒寫內容時不會寄出');
  await p.fill('#fbMsg', '點了星座圖鑑之後畫面變白');
  await p.click('#fbSend'); await sl(400);
  const url = await ev(() => window.__go[0] || ''), q = new URLSearchParams(url.split('?')[1] || '');
  ok(url.startsWith('mailto:tommyleegarden@gmail.com?') && q.get('subject') === '[Novaday] 問題回報：點了星座圖鑑之後畫面變白'
    && q.get('body').startsWith('點了星座圖鑑之後畫面變白\n\n---\n版本：Novaday') && q.get('body').includes('瀏覽器：'), '用郵件 App 寄出，主旨與內文都帶入');
  ok(await ev(() => !$('feedbackSheet').classList.contains('open') && $('fbMsg').value === ''), '寄出後關閉面板並清空內容');
  await ev(() => openFeedback('other')); await sl(400);
  await p.click('#swFbDiag'); await p.fill('#fbMsg', '謝謝你們');
  ok(await ev(() => $('fbPeek').hidden), '關掉「附上裝置資訊」時不顯示預覽');
  await p.click('#fbSend'); await sl(300);
  ok(await ev(() => new URLSearchParams(window.__go[1].split('?')[1]).get('body') === '謝謝你們'), '不附裝置資訊時只寄出內容');
  /* 清空 Email 時改用 GitHub 回報頁面 */
  await ev(() => { FEEDBACK.email = ''; openFeedback('idea') }); await sl(400); await p.fill('#fbMsg', '希望可以匯出 PDF'); await p.click('#fbSend'); await sl(300);
  ok(await ev(() => window.__go[2].startsWith('https://github.com/dominicshing/novaday-pages/issues/new?title=')), '沒有 Email 時改成打開 GitHub 回報頁面');
  ok(!p.errors.length, '沒有程式錯誤 ' + p.errors.join('; '));
  await p.context().close();

  // 英文介面與 Android
  const e = await open({ seed: { 'orbitlog.profile.v1': { onboarded: 1, lang: 'en' } }, userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0 Mobile Safari/537.36' });
  await e.evaluate(() => openReview()); await e.waitForTimeout(300);
  ok(await e.evaluate(() => $('review').dataset.ui === 'play' && $('rvT').textContent === 'Rate this app'), 'Android 裝置自動用 Google Play 樣式，英文介面');
  await e.evaluate(() => { closeReview(); openReview('ios') }); await e.waitForTimeout(300);
  ok(await e.evaluate(() => $('rvT').textContent === 'Enjoying Novaday?' && (openFeedback('bug'), $('fbDiag').textContent.startsWith('Version: Novaday'))), '英文介面：App Store 樣式與裝置資訊都是英文');
  ok(!e.errors.length, '英文介面沒有程式錯誤 ' + e.errors.join('; '));
  await e.context().close();
};
