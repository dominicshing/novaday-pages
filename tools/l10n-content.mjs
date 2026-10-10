// 內容資料的翻譯：在 App 頁面裡執行 CONTENT() 讀出目前語言的版本，三種語言再用 merge() 合併成 { zh_Hant, zh_Hans, en }
// tools/export_l10n.mjs 用來產生 assets/l10n/content.json，tests/l10n.test.mjs 用來檢查 content.json 沒有過期
/* 內容資料：每種語言讀一次，之後合併成 { zh_Hant, zh_Hans, en } */
export const CONTENT = () => {
  const EL = { '火象': 'fire', '土象': 'earth', '風象': 'air', '水象': 'water' };
  return {
    moods: MOODS.map((m, i) => ({ index: i, name: m.n })),
    ranks: RANKS.map((n, i) => ({ level: i + 1, name: n, description: RINFO[i].d, livery: RINFO[i].lv.n })),
    achievement_categories: Object.fromEntries(ACH_CAT.map(c => [c[0], { name: c[1], subtitle: c[2] }])),
    achievements: Object.fromEntries(ACH.map(a => [a.id, { name: a.n, description: a.d }])),
    elements: Object.fromEntries(Object.keys(EL).map(k => [EL[k], { name: elName(k), monthly_tip: ELTIP[k] }])),
    zodiac: Object.fromEntries(ZODIAC.map(z => [z.k, { name: z.n, element: EL[z.el], keywords: z.kw, personality: z.p }])),
    fortune: { overall: FT.o, relationships: FT.l, work: FT.w, self_care: FT.s, lucky_colors: FT.c, monthly_prompts: FT.q },
    prompts: PROMPTS,
    avatars: Object.fromEntries(AVI.map(a => [a.k, { name: a.n, description: a.d }])),
    constellations: Object.fromEntries(Object.keys(CON).map(k => [k, { name: CON[k].n, fact: CON[k].f }])),
    regions: REGIONS.map(([g, l]) => ({ name: tl(g), cities: l.map(([n, lat, lon]) => ({ key: n, name: tl(n), lat, lon })) })),
    meteor_showers: METEORS.map(([month, day, n]) => ({ month, day, name: tl(n) })),
    sample_entries: Object.fromEntries(Object.keys(SAMPLE_TXT).map(id => [id, smp(id)])) } };
/* content.json：三種語言合併成 { zh_Hant, zh_Hans, en } */
export const merge = (a, b, c, key) => key === 'key' ? a : typeof a === 'string' ? { zh_Hant: a, zh_Hans: b, en: c }
  : Array.isArray(a) ? a.map((x, i) => merge(x, b[i], c[i]))
  : a && typeof a === 'object' ? Object.fromEntries(Object.keys(a).map(k => [k, merge(a[k], b[k], c[k], k)])) : a;
