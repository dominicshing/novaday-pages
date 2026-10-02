// 照片儲存與備份：舊資料的照片搬進 IndexedDB、新照片縮圖、完整備份 .zip 來回還原（照片、影片、個人資料）
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
const SEED = {
  'orbitlog.seeded.v1': '1',
  'orbitlog.profile.v1': { onboarded: 1, avatar: 'photo', photoAv: PNG, name: '測試者', region: { name: '我的位置', lat: 22.3, lon: 114.17 } },
  'orbitlog.entries.v1': [
    { id: 'a1', date: '2026-09-30', time: '10:00', title: '照片', body: '有照片', mood: 3, tags: [], loc: '', photo: PNG, photoMore: [PNG] },
    { id: 'a2', date: '2026-10-01', time: '11:00', title: '影片', body: '有影片', mood: 4, tags: [], loc: '', photo: null, video: { id: 'vtest123', dur: 3, poster: PNG } },
    { id: 'a3', date: '2026-10-02', time: '12:00', title: '文字', body: '只有字', mood: 2, tags: [], loc: '家', photo: null, fav: 1 }] };

export default async ({ ok, open, run }) => {
  const p = await open({ seed: SEED });
  // 舊資料（照片直接存在 localStorage）載入時搬進 IndexedDB
  ok(await p.evaluate(() => { const r = localStorage.getItem('orbitlog.entries.v1'); return !r.includes('data:image') && /idb:p/.test(r) }), '舊資料的照片搬進 IndexedDB，存檔只留參照');
  await p.reload(); await p.waitForTimeout(1000);
  ok(await p.evaluate(() => entries.find(e => e.id === 'a1').photo.startsWith('blob:')), '重新載入後照片從 IndexedDB 讀回');

  // 新照片：縮到長邊 1600 px 的 JPEG
  const jpg = await p.evaluate(() => { const c = document.createElement('canvas'); c.width = 2400; c.height = 1800; const x = c.getContext('2d');
    for (let i = 0; i < 40; i++) { x.fillStyle = `hsl(${i * 9},70%,50%)`; x.fillRect(i * 60, 0, 60, 1800) } return c.toDataURL('image/jpeg', .9).split(',')[1] });
  await run(p, 'openEditor()'); await p.waitForTimeout(500);
  await p.setInputFiles('#fPhoto', { name: 'big.jpg', mimeType: 'image/jpeg', buffer: Buffer.from(jpg, 'base64') }); await p.waitForTimeout(1500);
  await p.fill('#fTitle', '大照片'); await run(p, "document.getElementById('form').requestSubmit()"); await p.waitForTimeout(2500);
  for (const id of ['cdOk', 'lvUpOk']) await p.evaluate(id => { const b = document.getElementById(id); if (b && b.offsetParent) b.click() }, id);
  const big = await p.evaluate(async () => { const k = JSON.parse(localStorage.getItem('orbitlog.entries.v1')).find(e => e.title === '大照片').photo.slice(4);
    const b = await mediaGet(k), bm = await createImageBitmap(b); return [bm.width, bm.height, b.type] });
  ok(big[0] === 1600 && big[1] === 1200 && big[2] === 'image/jpeg', `新照片縮成 ${big.join(' × ')}`);

  // 完整備份（.zip）→ 清空裝置 → 還原
  await p.evaluate(() => mediaPut('vtest123', new Blob([new Uint8Array(1024 * 1024).fill(7)], { type: 'video/mp4' })));
  await run(p, "refreshEx();openSheet('exporter')"); await p.waitForTimeout(300);
  const [dl] = await Promise.all([p.waitForEvent('download', { timeout: 60000 }), run(p, "document.getElementById('dlEx').click()")]);
  const zip = path.join(os.tmpdir(), 'novaday-test-' + Date.now() + '.zip'); await dl.saveAs(zip);
  ok(/^Novaday-backup-\d{4}-\d{2}-\d{2}\.zip$/.test(dl.suggestedFilename()), '下載完整備份 ' + dl.suggestedFilename());
  const before = await p.evaluate(async () => { const o = {}; for (const e of entries) { o[e.id] = []; for (const u of [e.photo, ...(e.photoMore || []), e.video && e.video.poster].filter(Boolean)) { const b = await phBlob(u); o[e.id].push(b ? b.size : 0) } } return o });
  await p.evaluate(async () => { localStorage.clear(); localStorage.setItem('orbitlog.profile.v1', JSON.stringify({ onboarded: 1 })); localStorage.setItem('orbitlog.seeded.v1', '1');
    await new Promise(r => { const q = indexedDB.deleteDatabase('novaday.media'); q.onsuccess = q.onerror = q.onblocked = r }) });
  await p.reload(); await p.waitForTimeout(1000);
  ok(await p.evaluate(async () => entries.length === 0 && (await mediaKeys()).length === 0), '裝置已清空');
  await run(p, 'openImport()'); await p.waitForTimeout(300);
  await p.setInputFiles('#imFile', { name: 'x.json', mimeType: 'application/json', buffer: Buffer.from('{}') }); await p.waitForTimeout(600);
  ok(/Novaday 的完整備份/.test(await p.evaluate(() => document.getElementById('imPrev').textContent)), '選錯檔案時顯示錯誤');
  await p.setInputFiles('#imFile', zip); await p.waitForTimeout(2000);
  ok(/含 \d+ 張照片、1 部影片/.test(await p.evaluate(() => document.getElementById('imPrev').textContent)), '預覽顯示照片與影片數量');
  await run(p, "document.getElementById('imGo').click()"); await p.waitForTimeout(3000);
  const after = await p.evaluate(async () => { const o = {}; for (const e of entries) { o[e.id] = []; for (const u of [e.photo, ...(e.photoMore || []), e.video && e.video.poster].filter(Boolean)) { const b = await phBlob(u); o[e.id].push(b ? b.size : 0) } } return o });
  const norm = o => JSON.stringify(Object.keys(o).sort().map(k => [o[k].length, o[k]]));
  ok(norm(before) === norm(after), '還原後每張照片大小一致');
  ok(await p.evaluate(async () => { const v = await mediaGet('vtest123'); return v && v.size === 1048576 && prof.avatar === 'photo' && prof.photoAv && prof.region.lon === 114.17 && entries.find(e => e.title === '文字').fav === 1 }), '影片、照片頭像、地區經度、收藏都還原');
  ok(!p.errors.length, '沒有程式錯誤 ' + p.errors.join('; '));
  fs.rmSync(zip, { force: true }); await p.context().close() };
