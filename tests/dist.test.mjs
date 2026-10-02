// 單檔版 dist/novaday.html：重新打包後可以正常載入、操作
import { execSync } from 'node:child_process';
import path from 'node:path';

export default async ({ ok, open, run, ROOT }) => {
  execSync('python3 ' + path.join(ROOT, 'tools/build_single_html.py'), { stdio: 'ignore' });
  const p = await open({ url: '/dist/novaday.html' });
  ok(await p.evaluate(() => document.querySelectorAll('script[src],link[rel="stylesheet"][href^="src/"]').length === 0), '單檔版沒有外部的程式與樣式檔');
  ok(await p.evaluate(() => document.getElementById('onb').hidden && !!document.querySelector('#s-home.active')), '載入首頁');
  // 單檔版的程式包在一個函式裡，只能透過畫面操作
  for (let i = 0; i < 7; i++) { await run(p, "document.getElementById('abVer').click()"); await p.waitForTimeout(50) }
  ok(await p.evaluate(() => !document.getElementById('devSec').hidden), '連點版本號碼開啟開發者選項');
  await run(p, "document.getElementById('liDev').click()"); await p.waitForTimeout(500);
  await run(p, "document.getElementById('liDvUi').click()"); await p.waitForTimeout(500);
  ok(await p.evaluate(() => document.querySelectorAll('#dvUiBody .dvu-c').length > 20), '開發者工具：元件總覽');
  ok(!p.errors.length, '沒有程式錯誤 ' + p.errors.join('; '));
  await p.context().close() };
