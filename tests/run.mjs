// Novaday 自動測試：啟動本機伺服器，用無頭 Chromium 逐一執行 tests/*.test.mjs
// 用法：npm test          （全部）
//       npm test backup   （檔名含 backup 的測試）
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
let playwright;
try { playwright = require('playwright') } catch {
  // 沒有在專案裡安裝時，改用全域安裝的 playwright
  playwright = require(path.join(execSync('npm root -g').toString().trim(), 'playwright')) }

// 靜態檔案伺服器（只供測試用）
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml' };
const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); res.end(); return }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(p)] || 'application/octet-stream' }); fs.createReadStream(p).pipe(res) });
await new Promise(r => server.listen(0, '127.0.0.1', r));
const BASE = `http://127.0.0.1:${server.address().port}`;

const browser = await playwright.chromium.launch();
let pass = 0, fail = 0;
const ok = (cond, msg) => { if (cond) { pass++; console.log('  ✓ ' + msg) } else { fail++; console.log('  ✗ ' + msg) } };
/* 開一個新的頁面：seed 會在頁面載入前寫進 localStorage（只寫一次，重新整理不會再寫） */
async function open({ url = '/index.html', seed = null, viewport = { width: 390, height: 844 }, ...ctxOpts } = {}) {
  const ctx = await browser.newContext({ viewport, acceptDownloads: true, ...ctxOpts });
  await ctx.addInitScript(s => { if (sessionStorage.getItem('__seeded')) return; sessionStorage.setItem('__seeded', '1');
    for (const [k, v] of Object.entries(s || { 'orbitlog.profile.v1': { onboarded: 1 } })) localStorage.setItem(k, typeof v === 'string' ? v : JSON.stringify(v)) }, seed);
  const page = await ctx.newPage(); page.errors = []; page.on('pageerror', e => page.errors.push(e.message));
  await page.goto(BASE + url); await page.waitForTimeout(900); return page }
const tools = { BASE, ROOT, ok, open, browser, wait: ms => new Promise(r => setTimeout(r, ms)),
  /* 執行一段程式（不等待它回傳的 Promise，例如會等使用者點擊的慶祝畫面） */
  run: (page, code) => page.evaluate(c => { (0, eval)(c) }, code) };

const only = process.argv[2];
const files = fs.readdirSync(path.join(ROOT, 'tests')).filter(f => f.endsWith('.test.mjs') && (!only || f.includes(only))).sort();
for (const f of files) {
  console.log(`\n${f}`);
  try { await (await import(pathToFileURL(path.join(ROOT, 'tests', f)))).default(tools) }
  catch (e) { fail++; console.log('  ✗ 測試中斷：' + (e && e.stack || e)) } }
await browser.close(); server.close();
console.log(`\n${pass} 項通過，${fail} 項失敗`);
process.exit(fail ? 1 : 0);
