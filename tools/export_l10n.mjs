// 匯出介面語言給 Flutter（以網頁版的 tl() 字串與 i18n-en.js 為唯一來源）
//   - assets/l10n/app_zh.arb、app_zh_Hant.arb、app_zh_Hans.arb、app_en.arb   介面文字（flutter gen-l10n 直接使用）
//   - assets/l10n/content.json        內容資料的翻譯（星座、徽章、運勢、頭像、城市、範例紀錄…），依資料的鍵查
//   - assets/l10n/message_ids.json    繁體原文 → 訊息 ID 對照表（ID 一旦產生就固定不變）
// 用法：npm run export-l10n        （需要 Playwright：npm install）
// 做法：用無頭 Chromium 依三種語言各執行一次 App，讀出資料的翻譯；簡體用 App 本身的 zhs() 轉換，英文直接取 i18n-en.js。
//   訊息 ID 由英文產生（camelCase，Dart 可用的名稱），已經在 message_ids.json 的沿用舊 ID，改了英文也不會變。
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { CONTENT, merge } from './l10n-content.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'assets', 'l10n');
const require = createRequire(import.meta.url);
let playwright;
try { playwright = require('playwright') } catch { playwright = require(path.join(execSync('npm root -g').toString().trim(), 'playwright')) }

const LOCALES = [['zh_Hant', 'zh-Hant'], ['zh_Hans', 'zh-Hans'], ['en', 'en']];
const HAN = /[㐀-鿿]/;
const read = rel => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const EN = new Function(read('src/js/core/i18n-en.js') + ';return EN')();

/* ---------- 1. 用三種語言執行 App ---------- */
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png' };
const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); res.end(); return }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(p)] || 'application/octet-stream' }); fs.createReadStream(p).pipe(res) });
await new Promise(r => server.listen(0, '127.0.0.1', r));
const BASE = `http://127.0.0.1:${server.address().port}`;
const browser = await playwright.chromium.launch();
async function openApp(lang) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await ctx.addInitScript(l => { localStorage.setItem('orbitlog.profile.v1', JSON.stringify({ onboarded: 1, lang: l })) }, lang);
  const page = await ctx.newPage(); const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto(BASE + '/index.html'); await page.waitForTimeout(1000);
  if (errors.length) throw new Error(`${lang}：${errors.join('; ')}`);
  return page }

const pages = {}, content = {};
for (const [loc, lang] of LOCALES) { pages[loc] = await openApp(lang); content[loc] = await pages[loc].evaluate(CONTENT) }
/* 簡體：用 App 本身的轉換（和網頁版顯示的完全相同） */
const keys = Object.keys(EN), src = k => k.includes('|') && /^\w+\|/.test(k) ? k.slice(k.indexOf('|') + 1) : k;
const zhs = Object.fromEntries((await pages.zh_Hans.evaluate(L => L.map(s => zhs(s)), keys.map(src))).map((v, i) => [keys[i], v]));

/* index.html 的固定文字（不執行程式時的原樣） */
const raw = await browser.newContext().then(c => c.newPage());
await raw.route('**/*.js', r => r.abort()); await raw.goto(BASE + '/index.html');
const htmlKeys = new Set(await raw.evaluate(() => { const H = /[㐀-鿿]/, S = []; const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let n;
  while ((n = w.nextNode())) { const k = n.nodeValue.trim(); if (k && H.test(k) && !n.parentNode.closest('script,style,[translate="no"]')) S.push(k) }
  document.querySelectorAll('[aria-label],[placeholder],[title],[aria-roledescription],[alt]').forEach(e => { if (e.closest('[translate="no"]')) return;
    for (const a of ['aria-label', 'placeholder', 'title', 'aria-roledescription', 'alt']) { const v = e.getAttribute(a); if (v && H.test(v)) S.push(v) } }); return S }));
await browser.close(); server.close();

/* ---------- 2. 哪些是介面文字、哪些是內容資料 ---------- */
/* 程式（資料檔以外）裡出現的中文字串；資料檔的文字只放進 content.json */
const order = JSON.parse(read('build-order.json')).js;
const DATA = /src\/js\/data\/|ui\/art\/avatars\.js$/;
const code = Object.fromEntries(order.filter(f => !/(-art|-figure)\.js$|sample-media|constellation-figures|vendor\/|i18n-(en|zhs)\.js/.test(f))
  .map(f => [f, read(f).replace(/\/\*[\s\S]*?\*\//g, '').replace(/const (REGIONS|METEORS)=\[[\s\S]*?\]\];/g, '')]));   // 城市、流星雨的名稱是資料
code['index.html'] = read('index.html').replace(/<!--[\s\S]*?-->/g, '');
const usedIn = k => { const s = src(k), q = [`'${s}'`, `"${s}"`, `>${s}<`, `\`${s}\``]; return Object.keys(code).filter(f => q.some(x => code[f].includes(x))) };
const flat = (o, out = new Set()) => { if (typeof o === 'string') out.add(o); else if (o && typeof o === 'object') Object.values(o).forEach(v => flat(v, out)); return out };
const contentZh = flat(content.zh_Hant);
const uiKeys = keys.filter(k => !contentZh.has(k) || htmlKeys.has(k) || usedIn(k).some(f => !DATA.test(f)));

/* ---------- 3. 訊息 ID（固定不變） ---------- */
const DART = new Set('abstract as assert async await break case catch class const continue covariant default deferred do dynamic else enum export extends extension external factory false final finally for function get hide if implements import in interface is late library mixin new null of on operator part required rethrow return set show static super switch sync this throw true try typedef var void while with yield localeName delegate'.split(' '));
const PUNCT = { '：': 'punctColon', '，': 'punctComma', '、': 'punctEnumerationComma', '。': 'punctFullStop' };
const idsPath = path.join(OUT, 'message_ids.json');
const oldIds = fs.existsSync(idsPath) ? JSON.parse(fs.readFileSync(idsPath, 'utf8')) : {};
/* ID 用的英文：plural 取 other 的字，{名稱} 保留名稱（例如 {n} entries → nEntries），去掉 HTML 標籤 */
const plainEn = s => s.replace(/\{\s*\w+\s*,\s*plural\s*,[\s\S]*?other\s*\{([^{}]*)\}\s*\}/g, '$1').replace(/\{(\w+)\}/g, ' $1 ').replace(/<[^>]+>/g, ' ');
function makeId(k, taken) {
  if (PUNCT[k]) return PUNCT[k];
  const ctx = /^(\w+)\|/.exec(k)?.[1] || '';
  const words = plainEn(EN[k]).normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[’']/g, '').split(/[^A-Za-z0-9]+/).filter(Boolean);
  const all = (ctx ? [ctx] : []).concat(words), base = n => {
    let w = all.slice(0, n).map((x, i) => i ? x[0].toUpperCase() + x.slice(1).toLowerCase() : x.toLowerCase()).join('');
    if (!w) w = 'message'; if (/^\d/.test(w)) w = 'n' + w; if (DART.has(w)) w += 'Label'; return w };
  for (let n = Math.min(5, all.length) || 1; n <= Math.max(all.length, 1); n++) { const id = base(n); if (!taken.has(id)) return id }
  let i = 2; while (taken.has(base(5) + i)) i++; return base(5) + i }
const ids = {}, taken = new Set();
for (const k of uiKeys) if (oldIds[k]) { ids[k] = oldIds[k]; taken.add(oldIds[k]) }
for (const k of uiKeys) if (!ids[k]) { ids[k] = makeId(k, taken); taken.add(ids[k]) }

/* ---------- 4. ARB ---------- */
const value = { zh_Hant: k => src(k), zh_Hans: k => zhs[k], en: k => EN[k] };
/* 佔位符：出現在 plural 的是數字（num），其餘是字串 */
function placeholders(msgs) { const P = {};
  const scan = m => { for (let i = 0; i < m.length; i++) { if (m[i] !== '{') continue; let d = 0, j = i;
    for (; j < m.length; j++) { if (m[j] === '{') d++; else if (m[j] === '}' && !--d) break }
    const body = m.slice(i + 1, j), pl = /^\s*(\w+)\s*,\s*plural\s*,([\s\S]*)$/.exec(body);
    if (pl) { P[pl[1]] = 'num'; for (const b of pl[2].matchAll(/\{((?:[^{}]|\{[^{}]*\})*)\}/g)) scan(b[1]) }
    else if (/^\w+$/.test(body)) P[body] ??= 'String';
    i = j } };
  msgs.forEach(scan);
  return Object.fromEntries(Object.entries(P).map(([n, type]) => [n, { type }])) }
const byId = uiKeys.slice().sort((a, b) => ids[a].localeCompare(ids[b]));
const arb = loc => { const o = { '@@locale': loc };
  for (const k of byId) { const id = ids[k]; o[id] = value[loc === 'zh' ? 'zh_Hant' : loc](k);
    if (loc === 'zh') { const files = usedIn(k).map(f => f.replace(/^src\/js\//, '')), ph = placeholders(Object.values(value).map(f => f(k)));
      o['@' + id] = { description: `繁體原文：${src(k)}${/^\w+\|/.test(k) ? `（情境：${k.split('|')[0]}）` : ''}`, ...(Object.keys(ph).length ? { placeholders: ph } : {}),
        ...(files.length ? { 'x-used-in': files } : {}), ...(/<[a-z][^>]*>/i.test(EN[k]) ? { 'x-markup': 'contains inline HTML tags (<b>, <br>, <em>, <span>); render with RichText/TextSpan' } : {}) } } }
  return o };
const merged = merge(content.zh_Hant, content.zh_Hans, content.en);
/* 徽章的「還差多少」提示是帶數量的 ICU 訊息，放在 ARB；這裡記下對應的訊息 ID */
{ const s = read('src/js/screens/me/badge-sheet.js'), fn = s.slice(s.indexOf('function achLeft'));
  for (const [, id, t] of fn.slice(0, fn.indexOf('}[id]')).matchAll(/(\w+):'([^']+)'/g)) if (merged.achievements[id] && ids[t]) merged.achievements[id].hint_message_id = ids[t];
  for (const id in merged.achievements) if (!merged.achievements[id].hint_message_id) merged.achievements[id].hint_message_id = ids['還差 {n}'] }

fs.mkdirSync(OUT, { recursive: true });
const write = (f, o) => fs.writeFileSync(path.join(OUT, f), JSON.stringify(o, null, 2) + '\n');
write('app_zh.arb', arb('zh'));                      // 範本與後備語言（繁體），含說明與佔位符
write('app_zh_Hant.arb', { '@@locale': 'zh_Hant', ...Object.fromEntries(byId.map(k => [ids[k], value.zh_Hant(k)])) });
write('app_zh_Hans.arb', { '@@locale': 'zh_Hans', ...Object.fromEntries(byId.map(k => [ids[k], value.zh_Hans(k)])) });
write('app_en.arb', { '@@locale': 'en', ...Object.fromEntries(byId.map(k => [ids[k], value.en(k)])) });
write('content.json', { _note: 'Translations of content data, looked up by data key (see assets/data/*.json for the rest of each record). Every string is { zh_Hant, zh_Hans, en }. achievements[*].hint_message_id points to the ICU message in app_*.arb that says how far away the badge is. English constellation names are the Latin names.', ...merged });
write('message_ids.json', Object.fromEntries(Object.entries(ids).sort(([a], [b]) => a < b ? -1 : 1)));
console.log(`l10n：${uiKeys.length} 則介面文字（${uiKeys.filter(k => !oldIds[k]).length} 則新的 ID）、內容資料 ${contentZh.size} 段 → assets/l10n/`);
