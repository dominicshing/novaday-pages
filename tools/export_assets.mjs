// 從網頁版的程式重新產生 Flutter 素材（以 src/js 為唯一資料來源）
//   - assets/data/*.json              所有內容資料
//   - assets/design/                   動畫 keyframes、色彩 token
//   - assets/svg/constellations/       88 個星座圖（點亮／未點亮）
//   - assets/svg/ui_icons/             介面圖示（只補上新的，不改現有檔名）
// 用法：npm run export-assets        （需要 Playwright：npm install）
// 做法：用無頭 Chromium 執行 App，讀取程式裡的資料，並把畫面上的 SVG「攤平」：
//   CSS 樣式寫成屬性、去掉動畫（採用「減少動態效果」的靜態樣子）、
//   flutter_svg 不支援的濾鏡改用多層半透明描邊或放射漸層近似。
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'assets');
const require = createRequire(import.meta.url);
let playwright;
try { playwright = require('playwright') } catch { playwright = require(path.join(execSync('npm root -g').toString().trim(), 'playwright')) }

const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png' };
const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); res.end(); return }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(p)] || 'application/octet-stream' }); fs.createReadStream(p).pipe(res) });
await new Promise(r => server.listen(0, '127.0.0.1', r));
const browser = await playwright.chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
const page = await ctx.newPage();
const errors = []; page.on('pageerror', e => errors.push(e.message));
await page.goto(`http://127.0.0.1:${server.address().port}/index.html`); await page.waitForTimeout(1200);
const writeJSON = (rel, obj) => { const p = path.join(OUT, rel); fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, JSON.stringify(obj, null, 2) + '\n') };
const writeSVG = (rel, svg) => { const p = path.join(OUT, rel); fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, '<?xml version="1.0" encoding="UTF-8"?>\n' + svg + '\n') };

// ---------- 1. 資料 ----------
const D = await page.evaluate(() => {
  const src = f => f.toString(), css = v => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
  return {
    moods: MOODS.map((m, i) => ({ index: i, name_zh: m.n, emoji: m.e, css_var: m.c, hex: css(m.c).toUpperCase(), scale: NV_SC[i], ray_len: NV_RL[i], highlight: NV_HI[i] })),
    ranks: RANKS.map((n, i) => ({ index: i, name_zh: n, color: RINFO[i].c, description: RINFO[i].d, livery: { name_zh: RINFO[i].lv.n, colors_light_mid_dark: RINFO[i].lv.c } })),
    rankIdx_js: src(rankIdx), levelInfo_js: src(levelInfo), totalXP_js: src(totalXP), xpMap_js: src(xpMap), XP_rules: XP,
    prompts: PROMPTS, meteors: METEORS, regions: REGIONS,
    avatars: AVI.map(a => ({ index: a.i, key: a.k, name_zh: a.n, description_zh: a.d, tile_background: a.t, group: a.g, svg: `svg/avatars/${a.k}.svg`, png: `png/avatars/${a.k}.png` })),
    picker_order: AVATARS, legacy: AV_LEGACY,
    zodiac: ZODIAC.map((z, i) => ({ index: i, range: zRange(i), glyph_svg_inner: ZGP[i], start: { month: z.d[0], day: z.d[1] }, element: z.el, keywords: z.kw, personality: z.p, name_zh: z.n, symbol: z.g, abbr: z.k })),
    fortune: { lists: FT, fortune_js: src(fortune), seedRng_js: src(seedRng) },
    constellations: Object.fromEntries(Object.keys(CON).map(k => { const c = CON[k], X = CFX[k], extra = {};
      for (const key in c) if (!['n', 'la', 'f', 's', 'l', 'z'].includes(key)) extra[key] = c[key];
      return [k, { abbr: k, name_zh: c.n, name_latin: c.la, zodiac: ZODIAC.some(z => z.k === k), fact: c.f,
        stars: c.s.map(([ra, dec, mag]) => ({ ra_hours: ra, dec_deg: dec, mag })), lines: c.l, ...extra,
        figure: X ? { style: X.dust ? 'dust' : 'outline', ref_points: X.ref, body_path: X.body, eye: X.eye || null, eye2: X.eye2 || null, eyes: X.eyes || null, eye_r: X.er || null } : null }] })),
    achievements: {
      categories: ACH_CAT.map(([key, name_zh, subtitle_zh, icon_svg_inner]) => ({ key, name_zh, subtitle_zh, icon_svg_inner })),
      crystal_colors: CR_COL, crystal_star_path_100: CR_STAR,
      achievements: ACH.map((a, i) => ({ order: i, id: a.id, emoji: a.em, name_zh: a.n, description_zh: a.d, crystal_category: CR_CAT[a.id] || 'write',
        unlock_test_js: src(a.t), progress_js: src(ACHP[a.id]), icon_svg_inner: ACH_IC[a.id], section: CR_CAT[a.id] || 'write' })),
      helpers_js: Object.fromEntries(['bestStreak', 'maxMonthDays', 'achDays', 'achFullMonth', 'achGap', 'achMaxPerDay', 'achMoodRun', 'achRebound', 'achAnniv', 'achSpan', 'consState', 'achLeft', 'chars'].map(n => [n, src(eval(n))])) },
    samples: { entries: JSON.parse(JSON.stringify(entries.filter(isSample).map(e => { const o = { ...e }; delete o.photoMore; return o }))), profile: (() => { const p = { ...prof }; for (const k in p) if (/^dev/.test(k)) delete p[k]; p.onboarded = 1; return p })() } } });
writeJSON('data/moods.json', { _note: 'Mood 0 (lowest) .. 4 (best). hex = star color; each mood is drawn as a face-star (see svg/mood_stars).', moods: D.moods });
writeJSON('data/ranks.json', { _note: 'Rank is derived from level (see levelInfo / rankIdx). Livery = constellation line colour unlocked by rank. totalXP adds prof.devXP, which is only set by the developer tools (always 0 in normal use).',
  ranks: D.ranks, rankIdx_js: D.rankIdx_js, levelInfo_js: D.levelInfo_js, totalXP_js: D.totalXP_js, xpMap_js: D.xpMap_js, XP_rules: D.XP_rules });
writeJSON('data/prompts.json', { _note: 'Daily writing prompts (今日星語).', prompts: D.prompts });
writeJSON('data/meteors.json', { _note: '[month, peak day, name]', meteor_showers: D.meteors });
writeJSON('data/regions.json', { _note: 'Region → [city, latitude, longitude]; used to compute which constellations are visible tonight and where they are in the sky.', regions: D.regions });
writeJSON('data/avatars.json', { _note: "Default avatar = 'const'. 'photo' = user-uploaded photo (first tile in picker). Legacy emoji mapping included.", default: 'const', picker_order: D.picker_order, avatars: D.avatars, legacy_emoji_map: D.legacy });
writeJSON('data/zodiac.json', { _note: "start = first day of the sign; the sign lasts until the next sign's start - 1. glyph_svg_inner is the 24x24 stroked path set (stroke-width ~1.6, round caps).", signs: D.zodiac });
writeJSON('data/fortune_texts.json', { _note: 'Monthly fortune generator: seedRng(ZODIAC.k + year + "-" + month) picks one line from each list; n = lucky number 1..9; so/sl/sw = 2..5 stars. See logic source fortune()/seedRng().', ...D.fortune });
writeJSON('data/constellations.json', { _note: "88 IAU constellations. stars: [RA hours, Dec degrees, magnitude]; lines: arrays of star indices forming polylines. figure.style: 'outline' = filled silhouette aligned by matching ref_points to projected star positions; 'dust' = stardust silhouette centred and scaled into the frame on its own (not aligned to the stars). body_path is an SVG path in the figure's own coordinate space; eye = optional [x, y]; eye2 = optional second eye [x, y] (top-down figures such as Lac); eyes = optional list of further eyes [[x, y], ...] (e.g. the twins of Gem); eye_r = eye radius when larger than the default (2.4 dust / 2.2 outline). See src/js/data/constellation-figures.js (customFig, figDust) and src/js/logic/sky-projection.js (conProj).", constellations: D.constellations });
writeJSON('data/achievements.json', { ...D.achievements, _note: '54 badges in 6 sections (each a multiple of 3). crystal_colors = [main, highlight, shadow] per crystal_category. unlock_test_js / progress_js are the original JS (l = entries array); progress returns [current, target]. Helper sources are in helpers_js.' });
writeJSON('data/sample_entries.json', { _note: 'Storage schema (localStorage keys orbitlog.profile.v1 / orbitlog.entries.v1 / orbitlog.reviews.v1). Entry shape shown by the first-run sample data. Photos are stored in IndexedDB and referenced as "idb:<key>"; see docs/backup-format.md for the portable backup format.', entry_example: D.samples.entries, profile_example: D.samples.profile });
console.log('data: 11 files');

// ---------- 1b. 設計：動畫 keyframes 與色彩 token（直接讀 CSS 原始碼） ----------
{ const order = JSON.parse(fs.readFileSync(path.join(ROOT, 'build-order.json'), 'utf8')).css; let out = '/* All @keyframes from Novaday (CSS), grouped by source file. Port to Flutter AnimationController / flutter_animate. */\n', n = 0;
  for (const f of order) { const css = fs.readFileSync(path.join(ROOT, f), 'utf8'), blocks = [];
    for (let i = css.indexOf('@keyframes'); i >= 0; i = css.indexOf('@keyframes', i + 1)) { let j = css.indexOf('{', i), d = 0;
      for (; j < css.length; j++) { if (css[j] === '{') d++; else if (css[j] === '}' && --d === 0) break }
      blocks.push(css.slice(i, j + 1).replace(/\s*\n\s*/g, '')) }
    if (blocks.length) { out += `\n/* ${f} */\n` + blocks.join('\n') + '\n'; n += blocks.length } }
  fs.writeFileSync(path.join(OUT, 'design/animations_keyframes.css'), out);
  const tokPath = path.join(OUT, 'design/design_tokens.json'), tok = JSON.parse(fs.readFileSync(tokPath, 'utf8')), root = /:root\s*\{([^}]*)\}/.exec(fs.readFileSync(path.join(ROOT, 'src/css/base/tokens.css'), 'utf8'))[1].replace(/\/\*[\s\S]*?\*\//g, '');
  const colors = {}; for (const m of root.matchAll(/(--[\w-]+)\s*:\s*([^;]+);?/g)) colors[m[1]] = m[2].trim();
  tok.colors = colors; fs.writeFileSync(tokPath, JSON.stringify(tok, null, 2) + '\n');
  console.log(`design: ${n} keyframes, ${Object.keys(colors).length} color tokens`) }

// ---------- 2. SVG 攤平 ----------
await page.addStyleTag({ content: '#__exp{position:fixed;left:0;top:0;z-index:2147483647;background:none}' });
await page.evaluate(() => {
  const NS = 'http://www.w3.org/2000/svg', r2 = v => +(+v).toFixed(2);
  const GEOM = ['d', 'cx', 'cy', 'r', 'rx', 'ry', 'x', 'y', 'width', 'height', 'x1', 'y1', 'x2', 'y2', 'points', 'offset', 'gradientUnits', 'gradientTransform', 'fx', 'fy', 'spreadMethod', 'clipPathUnits', 'href', 'xlink:href', 'viewBox', 'preserveAspectRatio'];
  const PAINT = { fill: 'rgb(0, 0, 0)', 'fill-opacity': '1', 'fill-rule': 'nonzero', stroke: 'none', 'stroke-width': '1px', 'stroke-opacity': '1', 'stroke-linecap': 'butt', 'stroke-linejoin': 'miter', 'stroke-dasharray': 'none', 'stroke-miterlimit': '4', opacity: '1', 'clip-rule': 'nonzero' };
  const hex = c => { const m = /^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)$/.exec(c); if (!m) return [c, 1]; return ['#' + [m[1], m[2], m[3]].map(x => (+x).toString(16).padStart(2, '0')).join(''), m[4] == null ? 1 : +m[4]] };
  const urlOf = v => { const m = /url\("?#([^")]+)"?\)/.exec(v || ''); return m && m[1] };
  /* 攤平一個已畫在頁面上的 <svg>：回傳只用屬性、沒有濾鏡與 CSS 的字串 */
  window.flattenSVG = (svg, { viewBox, width, height }) => {
    const ids = new Map(); let nid = 0; const rid = id => { if (!ids.has(id)) ids.set(id, 'a' + (++nid)); return ids.get(id) };
    const defs = []; const used = new Set();
    const blurOf = id => { const f = svg.querySelector('#' + CSS.escape(id)); const b = f && f.querySelector('feGaussianBlur'); return b ? +b.getAttribute('stdDeviation') : 0 };
    const attrs = (el, cs, skipPaint) => { const out = []; for (const a of GEOM) { const v = el.getAttribute(a); if (v != null) out.push(`${a}="${a === 'd' || a === 'points' ? v.replace(/\s+/g, ' ').trim() : v}"`) }
      if (!skipPaint) for (const [p, def] of Object.entries(PAINT)) { let v = cs.getPropertyValue(p).trim(); if (!v) continue;
        if (p === 'fill' || p === 'stroke') { const u = urlOf(v); if (u) { used.add(u); v = `url(#${rid(u)})` } else if (v !== 'none') { const [h, al] = hex(v); v = h; if (al < 1) out.push(`${p}-opacity="${r2(al * +cs.getPropertyValue(p + '-opacity'))}"`) } }
        if (p === 'stroke-width') v = r2(parseFloat(v));
        if (p === 'stroke-dasharray' && v !== 'none') v = v.replace(/px/g, '');
        if (p === 'opacity' || p.endsWith('-opacity')) { if ((p === 'fill-opacity' || p === 'stroke-opacity') && out.some(x => x.startsWith(p + '='))) continue; v = r2(v) }
        if (String(v) === def || (p === 'stroke-width' && cs.getPropertyValue('stroke') === 'none')) continue;
        if (p === 'fill' || String(v) !== def) out.push(`${p}="${v}"`) }
      const cp = urlOf(cs.getPropertyValue('clip-path')) || urlOf(el.getAttribute('clip-path')); if (cp) { used.add(cp); out.push(`clip-path="url(#${rid(cp)})"`) }
      return out };
    const tfOf = el => { const t = getComputedStyle(el).transform, a = el.getAttribute('transform');
      if (t === 'none' && !a) return '';
      if (t === 'none') return ` transform="${a}"`;
      const p = el.parentNode.getCTM(), m = p.inverse().multiply(el.getCTM());
      return ` transform="matrix(${[m.a, m.b, m.c, m.d, m.e, m.f].map(x => +x.toFixed(4)).join(' ')})"` };
    const shape = el => ['path', 'circle', 'ellipse', 'line', 'rect', 'polygon', 'polyline'].includes(el.tagName);
    const emit = (el, inDefs) => {
      const tag = el.tagName, cs = getComputedStyle(el);
      if (['title', 'desc', 'filter', 'style', 'script'].includes(tag)) return '';
      if (tag === 'defs') { [...el.children].forEach(c => { if (c.id) defs.push([c.id, c]) }); return '' }
      if (!inDefs && (cs.display === 'none' || cs.visibility === 'hidden')) return '';
      if (tag === 'linearGradient' || tag === 'radialGradient') { const st = [...el.children].filter(s => s.tagName === 'stop').map(s => { const c = getComputedStyle(s), [h, al] = hex(c.stopColor); const op = r2(al * +c.stopOpacity); return `<stop offset="${s.getAttribute('offset')}" stop-color="${h}"${op < 1 ? ` stop-opacity="${op}"` : ''}/>` }).join('');
        return `<${tag} id="${rid(el.id)}" ${attrs(el, cs, true).join(' ')}>${st}</${tag}>` }
      if (tag === 'clipPath') return `<clipPath id="${rid(el.id)}">${[...el.children].map(c => `<${c.tagName} ${attrs(c, getComputedStyle(c), true).join(' ')}/>`).join('')}</clipPath>`;
      const tf = tfOf(el);
      // 濾鏡：flutter_svg 不支援，改用近似
      const filt = cs.filter !== 'none' ? cs.filter : '', fid = urlOf(el.getAttribute('filter')) || urlOf(filt), ds = /drop-shadow\((rgba?\([^)]*\)) 0px 0px ([\d.]+)px\)/.exec(filt);
      let a = attrs(el, cs);
      if (el.getAttribute('vector-effect') === 'non-scaling-stroke') { const m = el.getCTM(), s = Math.hypot(m.a, m.b); a = a.map(x => x.startsWith('stroke-width=') ? `stroke-width="${r2(parseFloat(cs.strokeWidth) / s)}"` : x) }
      const self = inner => shape(el) ? `<${tag}${tf} ${a.join(' ')}/>` : `<g${tf} ${a.filter(x => /^(opacity|clip-path)=/.test(x)).join(' ')}>${inner}</g>`;
      const kids = () => [...el.children].map(c => emit(c, inDefs)).join('');
      if (ds && shape(el)) { const [h] = hex(ds[1]), rr = +ds[2], stroked = cs.stroke !== 'none', sw = parseFloat(cs.strokeWidth) || 0, base = a.filter(x => !/^(fill|stroke|stroke-width|stroke-linecap|stroke-linejoin|opacity|fill-opacity|stroke-opacity)=/.test(x)).join(' ');
        const K = stroked ? [1.6, 1.25, .9, .6, .3] : [2.667, 2.084, 1.5, 1, .5], O = ['0.050', '0.070', '0.090', '0.120', '0.160'];
        return K.map((k, i) => `<g${tf} opacity="${O[i]}"><${tag} ${base} fill="${stroked ? 'none' : h}" stroke="${h}" stroke-width="${r2(stroked ? sw + k * rr : k * rr)}" stroke-linecap="round" stroke-linejoin="round"/></g>`).join('') + self() }
      if (fid) { const sd = blurOf(fid); const op = +cs.opacity;
        const layers = node => { const ncs = getComputedStyle(node), t = node.tagName;
          if (t === 'g') return [...node.children].map(layers).join('');
          if ((t === 'ellipse' || t === 'circle') && ncs.stroke === 'none') { const [h] = hex(ncs.fill), rx = +(node.getAttribute('rx') || node.getAttribute('r')), ry = +(node.getAttribute('ry') || node.getAttribute('r')), R = 2.5 * sd, gid = 'g' + (++nid);
            const fr = (x, R0) => r2(Math.max(0, Math.min(1, x / (R0 + R))));
            defs.push([null, `<radialGradient id="${gid}"><stop offset="0" stop-color="${h}"/><stop offset="${fr(Math.min(rx, ry) - sd, Math.min(rx, ry))}" stop-color="${h}" stop-opacity="0.84"/><stop offset="${fr(Math.min(rx, ry), Math.min(rx, ry))}" stop-color="${h}" stop-opacity="0.5"/><stop offset="${fr(Math.min(rx, ry) + sd, Math.min(rx, ry))}" stop-color="${h}" stop-opacity="0.16"/><stop offset="1" stop-color="${h}" stop-opacity="0"/></radialGradient>`]);
            return `<ellipse cx="${node.getAttribute('cx')}" cy="${node.getAttribute('cy')}" rx="${r2(rx + R)}" ry="${r2(ry + R)}" fill="url(#${gid})"/>` }
          // 路徑：描邊模糊 → 五層加粗的半透明描邊；填色模糊（陰影）→ 三層描邊，與原本的素材一致
          const na = attrs(node, ncs), stroked = ncs.stroke !== 'none', sw = parseFloat(ncs.strokeWidth) || 0, col = stroked ? ncs.stroke : ncs.fill;
          const paint = urlOf(col) ? `url(#${rid(urlOf(col))})` : hex(col)[0]; if (urlOf(col)) used.add(urlOf(col));
          const base = na.filter(x => !/^(fill|stroke|stroke-width|stroke-linecap|stroke-linejoin|opacity|fill-opacity|stroke-opacity)=/.test(x)).join(' ');
          if (stroked) { /* 模糊後的線條：亮度依高斯模糊的剖面 I(x)=α[Φ((x+w/2)/σ)−Φ((x−w/2)/σ)]，
               由外往內五層，每層透明度讓疊起來的結果剛好落在剖面上 */
            const erf = x => { const s = Math.sign(x); x = Math.abs(x); const t = 1 / (1 + .3275911 * x); return s * (1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - .284496736) * t + .254829592) * t * Math.exp(-x * x)) };
            const Phi = x => .5 * (1 + erf(x / Math.SQRT2)), I = x => op * (Phi((x + sw / 2) / sd) - Phi((x - sw / 2) / sd));
            const H = [2.2, 1.5, 1, .55, .15].map(k => sw / 2 + k * sd); let prev = 0; const out = [];
            H.forEach((h, i) => { const inner = i + 1 < H.length ? H[i + 1] : 0, C = Math.min(.98, I((h + inner) / 2)), a = Math.max(0, 1 - (1 - C) / (1 - prev)); prev = Math.max(prev, C);
              if (a > .004) out.push(`<${t} ${base} fill="none" stroke="${paint}" stroke-width="${r2(2 * h)}" stroke-linecap="round" stroke-linejoin="round" opacity="${r2(a)}"/>`) });
            return out.join('') }
          return [[3, .1], [2, .14], [1, .18]].map(([k, o]) => `<${t} ${base} fill="${paint}" stroke="${paint}" stroke-width="${r2(k * sd)}" stroke-linejoin="round" opacity="${o}"/>`).join('') };
        const inner = layers(el);
        return el.tagName === 'g' || !(cs.stroke !== 'none') ? `<g${tf}${el.tagName === 'g' || cs.stroke === 'none' ? ` opacity="${r2(op)}"` : ''}>${inner}</g>` : `<g${tf}>${inner}</g>` }
      if (shape(el)) { const invisible = (cs.fill === 'none' || +cs.fillOpacity === 0 || /rgba\(.*, 0\)$/.test(cs.fill)) && (cs.stroke === 'none' || +cs.strokeOpacity === 0); return invisible ? '' : self() }
      if (tag === 'g' || tag === 'svg' || tag === 'a') { const k = kids(); return k ? self(k) : '' }
      return '' };
    let body = [...svg.children].map(c => emit(c, false)).join('');
    // 用到的 defs（含被 url(#…) 參照的漸層、clipPath）
    const D = []; const seen = new Set();
    const pull = id => { if (seen.has(id)) return; seen.add(id); const n = svg.querySelector('#' + CSS.escape(id)) || document.getElementById(id); if (n) { const s = emit(n, true); D.push(s); (s.match(/url\(#([^)]+)\)/g) || []).forEach(() => { }) } };
    for (const id of [...used]) pull(id);
    defs.filter(([id]) => id == null).forEach(([, s]) => D.push(s));
    // 參照到但還沒放進 defs 的（例如 clipPath 內又參照）
    for (const id of [...used]) pull(id);
    return `<svg viewBox="${viewBox}" xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">${D.length ? `<defs>${D.join('')}</defs>` : ''}${body}</svg>` };
  window.renderTemp = html => { let d = document.getElementById('__exp'); if (d) d.remove(); d = document.createElement('div'); d.id = '__exp'; d.innerHTML = html; document.body.appendChild(d); return d.firstElementChild };
});

// 星座圖：380×300、邊距 30、線條顏色 #8A7CFF（與原本的素材一致）
const keys = await page.evaluate(() => Object.keys(CON));
for (const k of keys) for (const lit of [true, false]) {
  const svg = await page.evaluate(([k, lit]) => { const el = renderTemp(`<svg viewBox="0 0 380 300" width="380" height="300">${conSVG(k, 380, 300, 30, lit ? 99 : 0, null, { lc: '#8A7CFF' })}</svg>`);
    document.getAnimations().forEach(a => { try { a.finish() } catch (_) { a.cancel() } });
    return flattenSVG(el, { viewBox: '0 0 380 300', width: 380, height: 300 }) }, [k, lit]);
  writeSVG(`svg/constellations/${lit ? 'lit' : 'unlit'}/${k}.svg`, svg) }
console.log(`constellations: ${keys.length} × 2`);

// ---------- 3. 介面圖示（只補上還沒有的；和現有圖示畫出來一模一樣的略過） ----------
{ const dir = path.join(OUT, 'svg/ui_icons'), idxPath = path.join(dir, '_index.json');
  const idx = JSON.parse(fs.readFileSync(idxPath, 'utf8')), existing = fs.readdirSync(dir).filter(f => f.endsWith('.svg'));
  const CAT = { 個人資料: 'profile', 通知: 'notification', 提醒: 'reminder', 顯示: 'display', 隱私與安全: 'privacy', 隱私: 'privacy', 資料管理: 'data', 關於: 'about', 開發者選項: 'developer', 重設: 'reset',
    動畫預覽: 'dev_animation', 畫面預覽: 'dev_screens', 測試資料: 'dev_data', 時間與地點: 'dev_time_place', 樣式檢查: 'dev_style', 除錯資訊: 'dev_debug', 引導與圖案: 'dev_onboarding', 初始化: 'dev_init' };
  // 要收集圖示的畫面：設定、開發者工具、編輯器、匯出、還原、儲存空間
  const states = ["go('me');openSheet('settingsSheet')", "devOpen()", "openEditor()", "refreshEx();openSheet('exporter')", "openImport()", "document.getElementById('liStore').click()"];
  const found = [];
  for (const st of states) {
    await page.evaluate(c => { document.querySelectorAll('.layer.open').forEach(l => l.classList.remove('open')); (0, eval)(c) }, st); await page.waitForTimeout(700);
    found.push(...await page.evaluate(CAT => { const out = [];
      document.querySelectorAll('.layer.open svg[viewBox="0 0 24 24"], .screen.active svg[viewBox="0 0 24 24"]').forEach(svg => {
        if (!svg.getClientRects().length || svg.closest('.cr,.fc,.av,.avs,.medal,.zo,.zgi,.nv,.moon')) return;
        const h = svg.closest('.set-h'), row = svg.closest('.li,.dv-item,button,label,.stat,[role=button]'), top = svg.closest('.layer,.screen');
        const owner = [row, row && row.querySelector('.sw[id],button[id],input[id]'), row && row.querySelector('[id]'), svg.closest('[id]')].find(e => e && e.id && e !== top && !e.classList.contains('layer') && !e.classList.contains('screen'));
        const main = n => { const t = n && (n.getAttribute('aria-label') || [...n.querySelectorAll('span,b')].map(x => x.firstChild && x.firstChild.nodeType === 3 ? x.firstChild.textContent : '').find(x => x.trim()) || n.textContent); return (t || '').trim().replace(/\s+/g, ' ').slice(0, 40) };
        const label = h ? h.textContent.trim() : main(row || svg.parentNode);
        const name = h ? 'set_' + (CAT[h.textContent.trim()] || 'section') : owner ? owner.id : (top && top.id ? top.id : 'icon');
        if (!label) return;
        const flat = flattenSVG(svg, { viewBox: '0 0 24 24', width: 48, height: 48 });
        out.push({ name, label, flat }) }); return out }, CAT)) }
  // 用點陣比對去重（包含現有圖示）
  const pix = await page.evaluate(async list => { const load = s => new Promise(r => { const i = new Image(); i.onload = () => r(i); i.onerror = () => r(null); i.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(s) });
    const out = []; for (const s of list) { const i = await load(s); if (!i) { out.push(null); continue } const c = document.createElement('canvas'); c.width = c.height = 48; const x = c.getContext('2d'); x.drawImage(i, 0, 0, 48, 48);
      const d = x.getImageData(0, 0, 48, 48).data; let h = 0; for (let k = 0; k < d.length; k += 4) h = (h * 31 + (d[k] >> 3) * 7 + (d[k + 1] >> 3) * 5 + (d[k + 2] >> 3) * 3 + (d[k + 3] >> 3)) >>> 0; out.push(h) } return out },
    [...existing.map(f => fs.readFileSync(path.join(dir, f), 'utf8')), ...found.map(f => f.flat)]);
  const seen = new Set(pix.slice(0, existing.length).filter(x => x != null)); let added = 0;
  found.forEach((f, i) => { const h = pix[existing.length + i]; if (h == null || seen.has(h)) return; seen.add(h);
    let n = f.name, k = 1; while (fs.existsSync(path.join(dir, (k > 1 ? `${n}_${k}` : n) + '.svg'))) k++; n = (k > 1 ? `${n}_${k}` : n) + '.svg';
    writeSVG('svg/ui_icons/' + n, f.flat); idx.icons[n] = f.label; added++ });
  fs.writeFileSync(idxPath, JSON.stringify(idx, null, 2) + '\n'); console.log(`ui icons: ${added} added`) }

if (errors.length) console.log('page errors:', errors);
await browser.close(); server.close();
