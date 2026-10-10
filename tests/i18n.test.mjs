// 介面語言：繁體（預設）、简体（自動轉換）、English（字典）
// 靜態檢查：程式裡 tl('…')／tlc('…') 的中文字串都有英文翻譯、字典沒有重複的鍵
// 實際操作：英文介面逐一打開畫面與面板，看得到的地方不該有中文；簡體介面不該出現繁體字；設定頁與引導頁可以切換語言
import fs from 'node:fs';
import path from 'node:path';

const HAN = /[㐀-鿿]/;
/* 字典與轉換表本身、圖像資料不檢查 */
const SKIP = /(-art|-figure)\.js$|sample-media|constellation-figures|vendor\/|i18n-(en|zhs)\.js/;

/* tl( 的第一個參數（括號平衡）：三元運算的兩個字串都要收進來 */
function firstArg(src, i) {
  let d = 0, j = i, q = null, comma = null;
  for (; j < src.length; j++) { const c = src[j];
    if (q) { if (c === '\\') { j++; continue } if (c === q) q = null; continue }
    if (c === "'" || c === '"' || c === '`') { q = c; continue }
    if ('([{'.includes(c)) d++; else if (')]}'.includes(c)) { if (!d) break; d-- } else if (c === ',' && !d && comma == null) comma = j }
  return src.slice(i, comma ?? j) }

export default async ({ ok, open, ROOT }) => {
  const enSrc = fs.readFileSync(path.join(ROOT, 'src/js/core/i18n-en.js'), 'utf8');
  const EN = new Function(enSrc + ';return EN')();
  const keys = [...enSrc.matchAll(/(?:^|,)\s*'((?:[^'\\]|\\.)*)'\s*:/gm)].map(m => m[1]);
  const dup = keys.filter((k, i) => keys.indexOf(k) !== i);
  ok(!dup.length, `英文字典沒有重複的鍵 ${dup.join('、')}`);

  const order = JSON.parse(fs.readFileSync(path.join(ROOT, 'build-order.json'), 'utf8')).js;
  const miss = []; let n = 0;
  for (const f of order) { if (SKIP.test(f)) continue;
    const src = fs.readFileSync(path.join(ROOT, f), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
    for (const m of src.matchAll(/\b(tl|tlc)\(/g)) { let at = m.index + m[0].length, ctx = null, a = firstArg(src, at);
      if (m[1] === 'tlc') { const c = /^'(\w+)'\s*,/.exec(a); if (!c) continue; ctx = c[1]; a = firstArg(src, at + c[0].length) }
      for (const s of a.matchAll(/'((?:[^'\\]|\\.)*)'/g)) { const k = s[1].replace(/\\'/g, "'"); if (!HAN.test(k)) continue; n++;
        if (EN[k] == null && !(ctx && EN[ctx + '|' + k] != null)) miss.push(`${path.basename(f)}：${k}`) } } }
  ok(n > 900 && !miss.length, `程式裡 ${n} 個 tl() 中文字串都有英文翻譯 ${miss.slice(0, 8).join('；')}`);

  const seed = lang => ({ 'orbitlog.profile.v1': { onboarded: 1, lang, birthday: '2000-03-25', region: { name: '台北', lat: 25, lon: 121.5 } } });
  /* 看得到的中文：文字節點與無障礙標籤；開發者工具、刻意用原文的語言選項不算 */
  const visibleHan = p => p.evaluate(() => { const H = /[㐀-鿿]/, S = new Set(), skip = 'script,style,[translate="no"]';
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let x;
    while ((x = w.nextNode())) { const t = x.nodeValue.trim(), e = x.parentElement; if (t && H.test(t) && !e.closest(skip) && e.checkVisibility()) S.add(t) }
    document.querySelectorAll('[aria-label],[title],[placeholder],[alt]').forEach(e => { if (e.closest(skip) || !e.checkVisibility()) return;
      for (const a of ['aria-label', 'title', 'placeholder', 'alt']) { const v = e.getAttribute(a); if (v && H.test(v)) S.add(v) } });
    return [...S] });
  const visit = async (p, check) => {
    const bad = new Set(), ev = c => p.evaluate(c), sl = ms => p.waitForTimeout(ms), add = async l => (await check()).forEach(t => bad.add(`${l}：${t.slice(0, 40)}`));
    for (const s of ['home', 'log', 'atlas', 'me']) { await ev(`go('${s}')`); await sl(400); await add(s) }
    await ev("document.querySelector('#logTop [data-v=cal]').click()"); await sl(400); await add('月曆');
    await ev("document.querySelector('#logTop [data-v=list]').click()");
    for (const [c, l] of [["openSheet('settingsSheet')", '設定'], ['openEditor()', '編輯器'], ['openDetail(entries[0].id)', '紀錄詳情'], ["openCon('Ori')", '星座詳情'],
      ['openFortune()', '運勢'], ['openReport(2026,9)', '月報'], ['openYearReport(new Date().getFullYear())', '年度回顧'], ["openAch('s7')", '徽章'], ['openRegion()', '地區'],
      ["refreshEx();openSheet('exporter')", '匯出'], ['openImport()', '還原'], ['openTags()', '標籤'], ["openSheet('aboutSheet')", '版本資訊'], ["openWipe('all')", '初始化'], ['openBdQuick()', '生日'], ['openRate()', '評分'], ["openFeedback('bug')", '意見回饋']]) {
      await ev(c); await sl(600); await add(l); await ev("document.querySelectorAll('.layer.open').forEach(x=>closeSheet(x.id))"); await sl(300) }
    await ev('openOnb(true)'); for (let i = 0; i < 4; i++) { await sl(500); await add('引導 ' + (i + 1)); await ev("document.getElementById('obNext').click()") }
    await ev('obFinish(false)'); await sl(400);
    return [...bad] };

  // 英文介面
  let p = await open({ seed: seed('en') });
  ok(await p.evaluate(() => document.documentElement.lang === 'en' && document.querySelector('.tb[data-s=log]').textContent.includes('Journal')), '英文介面：<html lang="en">，分頁列是英文');
  let bad = await visit(p, () => visibleHan(p));
  ok(!bad.length, `英文介面看不到中文 ${bad.slice(0, 8).join('；')}`);
  ok(await p.evaluate(() => [MOODS.map(m => m.n), RANKS, RINFO.map(r => r.d + r.lv.n), PROMPTS, Object.values(FT).flat(), ZODIAC.map(z => z.n + z.p + z.kw), ACH.map(a => a.n + a.d),
    AVI.map(a => a.n + a.d), Object.values(CON).map(c => c.n + c.f), entries.filter(e => e.sample).map(e => e.title + e.body + e.loc + e.tags), ACH.map(a => achLeft(a.id, 3)), ACH.map(a => achLeft(a.id, 1))]
    .flat().every(s => !/[㐀-鿿]/.test(s))), '英文介面：心情、階級、題目、運勢、徽章、頭像、星座、範例紀錄都已翻譯');
  ok(await p.evaluate(() => fmtMD(new Date(2026, 9, 3)) === 'Oct 3' && fmtTime('21:05') === '9:05 PM' && tl('{n} 則', { n: 1 }) === '1 entry' && tl('{n} 則', { n: 2 }) === '2 entries'),
    '英文介面：日期、時間與單複數');
  const svg = await p.evaluate(() => shareSVG('Ori') + entrySVG(entries[0], true));
  ok(!/>[^<>]*[㐀-鿿][^<>]*</.test(svg), '英文介面：分享圖卡沒有中文');
  ok(await p.evaluate(() => !I18N_MISS.size) && !p.errors.length, '英文介面：沒有缺漏的翻譯、沒有程式錯誤 ' + p.errors.join('; '));
  await p.context().close();

  // 簡體介面：看得到的文字都已轉成簡體（沒有轉換表裡的繁體字）
  p = await open({ seed: seed('zh-Hans') });
  ok(await p.evaluate(() => document.documentElement.lang === 'zh-Hans' && document.querySelector('.tb[data-s=log]').textContent.includes('日记') && $('setLang').value === 'zh-Hans'), '簡體介面：<html lang="zh-Hans">，分頁列是簡體');
  bad = await visit(p, () => p.evaluate(() => { const T = new Set([...ZHS_C]), S = new Set();
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let x;
    while ((x = w.nextNode())) { const t = x.nodeValue, e = x.parentElement; if (e.closest('script,style,[translate="no"]') || !e.checkVisibility()) continue; if ([...t].some(c => T.has(c))) S.add(t.trim()) }
    return [...S] }));
  ok(!bad.length, `簡體介面沒有繁體字 ${bad.slice(0, 8).join('；')}`);
  ok(await p.evaluate(() => zhs('打開影片設定') === '打开视频设置' && zhs('星座連線') === '星座连线' && zhs('個人資料') === '个人资料' && zhs('已清除錯誤紀錄') === '已清除错误记录' && zhs('守護著') === '守护着' && zhs('著名') === '著名' && zhs('暱稱') === '昵称' && zhs('我的檔案') === '我的主页' && zhs('已開啟每日提醒') === '已开启每日提醒'), '簡體介面：慣用詞轉換（影片→视频、看著→看着、暱稱→昵称），星座連線、個人資料、清除錯誤不誤轉');
  ok(!p.errors.length, '簡體介面沒有程式錯誤 ' + p.errors.join('; '));
  await p.context().close();

  // 單檔版也能切換語言
  p = await open({ url: '/dist/novaday.html', seed: seed('en') });
  ok(await p.evaluate(() => document.documentElement.lang === 'en' && document.querySelector('.tb[data-s=log]').textContent.includes('Journal') && document.getElementById('greet').textContent.includes('Star Traveler')) && !p.errors.length, '單檔版的英文介面正常 ' + p.errors.join('; '));
  await p.context().close();

  // 預設繁體；設定頁切換語言後重新載入
  p = await open();
  ok(await p.evaluate(() => LANG === 'zh-Hant' && document.documentElement.lang === 'zh-Hant' && $('setLang').value === 'zh-Hant' && document.querySelector('.tb[data-s=log]').textContent.includes('日記')), '預設是繁體中文');
  await p.evaluate(() => openSheet('settingsSheet')); await p.waitForTimeout(400);
  await Promise.all([p.waitForNavigation(), p.selectOption('#setLang', 'en')]); await p.waitForTimeout(900);
  ok(await p.evaluate(() => LANG === 'en' && JSON.parse(localStorage.getItem('orbitlog.profile.v1')).lang === 'en' && document.getElementById('greet').textContent.includes('Star Traveler')), '設定頁選 English 後重新載入成英文，預設暱稱跟著換');
  await p.evaluate(() => { prof.name = '小星'; saveProf() });
  await p.evaluate(() => openSheet('settingsSheet')); await p.waitForTimeout(400);
  await Promise.all([p.waitForNavigation(), p.selectOption('#setLang', 'zh-Hant')]); await p.waitForTimeout(900);
  ok(await p.evaluate(() => LANG === 'zh-Hant' && prof.name === '小星' && entries.filter(e => e.sample).every(e => /[㐀-鿿]/.test(e.title))), '換回繁體：自己改的暱稱不變，範例紀錄換回中文');
  await p.context().close();

  // 引導頁第一頁可以選語言
  p = await open({ seed: { 'orbitlog.profile.v1': {} } });
  ok(await p.evaluate(() => !$('onb').hidden && document.querySelectorAll('#obLang [data-l]').length === 3 && $('obLang').querySelector('[aria-checked=true]').dataset.l === 'zh-Hant'), '引導頁第一頁有三種語言可選');
  await Promise.all([p.waitForNavigation(), p.click('#obLang [data-l=en]')]); await p.waitForTimeout(1200);
  ok(await p.evaluate(() => LANG === 'en' && !$('onb').hidden && $('obNext').textContent === 'Start'), '引導頁選 English 後重新載入，仍停在引導頁');
  ok(!p.errors.length, '切換語言沒有程式錯誤 ' + p.errors.join('; '));
  await p.context().close();
};
