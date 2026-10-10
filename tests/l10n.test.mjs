// 給 Flutter 的語言檔（assets/l10n，由 npm run export-l10n 產生）和網頁版的字典同步
// 每個英文字典的鍵不是在 ARB（介面文字）就是在 content.json（內容資料）；ARB 的值和網頁版顯示的相同；訊息 ID 是合法且不重複的 Dart 名稱
import fs from 'node:fs';
import path from 'node:path';
import { CONTENT, merge } from '../tools/l10n-content.mjs';

export default async ({ ok, open, ROOT }) => {
  const dir = path.join(ROOT, 'assets/l10n'), read = f => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  const EN = new Function(fs.readFileSync(path.join(ROOT, 'src/js/core/i18n-en.js'), 'utf8') + ';return EN')();
  const ids = read('message_ids.json'), tpl = read('app_zh.arb'), arb = { zh_Hant: read('app_zh_Hant.arb'), zh_Hans: read('app_zh_Hans.arb'), en: read('app_en.arb') };
  const content = read('content.json'), src = k => /^\w+\|/.test(k) ? k.slice(k.indexOf('|') + 1) : k;
  const msgIds = Object.keys(tpl).filter(k => k[0] !== '@'), idList = Object.values(ids);
  const regen = '（請執行 npm run export-l10n）';

  ok(idList.length === new Set(idList).size && idList.every(x => /^[a-z][A-Za-z0-9]*$/.test(x)), '訊息 ID 是不重複的 camelCase 名稱');
  ok(msgIds.length === idList.length && idList.every(x => x in tpl) && Object.values(arb).every(a => Object.keys(a).filter(k => k[0] !== '@').join() === msgIds.join()),
    `四個 ARB 的訊息一致（${msgIds.length} 則）`);

  const strings = new Set(), walk = o => { if (o && typeof o === 'object') { if ('zh_Hant' in o && 'en' in o) strings.add(o.zh_Hant + '\u0000' + o.en); else Object.values(o).forEach(walk) } };
  walk(content);
  const lost = Object.keys(EN).filter(k => !ids[k] && !strings.has(src(k) + '\u0000' + EN[k]));
  ok(!lost.length, `英文字典的每個鍵都匯出到 ARB 或 content.json ${lost.slice(0, 6).join('；')}${lost.length ? regen : ''}`);
  const stale = Object.keys(ids).filter(k => EN[k] == null || arb.en[ids[k]] !== EN[k] || arb.zh_Hant[ids[k]] !== src(k) || tpl[ids[k]] !== src(k));
  ok(!stale.length, `ARB 的繁體與英文和網頁版字典相同 ${stale.slice(0, 6).join('；')}${stale.length ? regen : ''}`);

  /* 佔位符：每則訊息用到的 {名稱} 都在範本裡宣告；用在 plural 的是數字 */
  const undeclared = [];
  for (const id of msgIds) { const ph = tpl['@' + id]?.placeholders || {};
    for (const a of Object.values(arb)) for (const m of a[id].matchAll(/(?<!(?:zero|one|two|few|many|other|=\d+)\s*)\{\s*(\w+)\s*(,\s*plural\s*,|\})/g)) {
      if (!ph[m[1]] || (m[2] !== '}' && ph[m[1]].type !== 'num')) undeclared.push(`${id}：${m[1]}`) } }
  ok(!undeclared.length, `ARB 的佔位符都有宣告 ${undeclared.slice(0, 6).join('；')}`);

  /* 執行 App：簡體與內容資料和網頁版目前顯示的相同 */
  const seed = lang => ({ 'orbitlog.profile.v1': { onboarded: 1, lang } }), got = {};
  for (const [loc, lang] of [['zh_Hant', 'zh-Hant'], ['zh_Hans', 'zh-Hans'], ['en', 'en']]) {
    const p = await open({ seed: seed(lang) }); got[loc] = await p.evaluate(CONTENT);
    if (loc === 'zh_Hans') { const keys = Object.keys(ids), v = await p.evaluate(L => L.map(s => zhs(s)), keys.map(src));
      const diff = keys.filter((k, i) => arb.zh_Hans[ids[k]] !== v[i]);
      ok(!diff.length, `ARB 的簡體和網頁版的轉換結果相同 ${diff.slice(0, 6).join('；')}${diff.length ? regen : ''}`) }
    await p.context().close() }
  const { _note, ...stored } = content, strip = o => JSON.parse(JSON.stringify(o, (k, v) => k === 'hint_message_id' ? undefined : v));
  const same = JSON.stringify(strip(stored)) === JSON.stringify(merge(got.zh_Hant, got.zh_Hans, got.en));
  ok(same, `content.json 和 App 目前的內容資料相同${same ? '' : regen}`);
  ok(Object.values(content.achievements).every(a => a.hint_message_id in tpl), '每個徽章的進度提示都指到 ARB 裡的訊息');
};
