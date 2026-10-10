#!/usr/bin/env python3
"""產生簡體中文轉換表 src/js/core/i18n-zhs.js。

用法：
    pip install opencc
    python3 tools/gen_zh_hans.py

做法：
- 掃描 index.html 與 src/js/ 裡所有中文字串（略過註解），從 OpenCC 的詞庫（tw2sp 用的臺灣用語、繁簡詞彙與單字表）挑出用得到的部分
- 輸出兩張表：
  ZHS_C：單字對照（只收繁簡不同的字）
  ZHS_P：詞彙對照（和逐字轉換結果不同的詞，例如 影片→视频、儲存→保存）
- 執行時 zhs() 先比對詞彙（長的優先），其餘逐字轉換；沒出現在原始碼裡的字串也能轉換，只是少了詞彙替換
- ZHS_EXTRA 補上 OpenCC 沒有的慣用說法；ZHS_DROP 排除在這個 App 的句子裡容易斷錯的詞
改了介面文字後重新執行即可。
"""
import json, os, re, subprocess, tempfile

try:
    import opencc
except ImportError:
    raise SystemExit('請先執行 pip install opencc')

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'src', 'js', 'core', 'i18n-zhs.js')
SKIP = ('i18n-zhs.js', 'i18n-en.js', 'modern-screenshot.js', 'sample-media.js', 'remaining-art.js', '-art.js', '-figure.js', 'constellation-figures.js')
# OpenCC 沒有處理、但 App 裡希望用大陸慣用說法的詞
ZHS_EXTRA = {'預設': '默认', '紀錄': '记录', '帳號': '账号', '登入': '登录', '介面': '界面', '訊息': '消息', '解鎖': '解锁'}
# OpenCC 詞庫裡、放在這個 App 的句子中會斷錯或意思不對的詞（「曲線上升」的「線上」不是「在線」；「個人資料」不是「數據」；星座「連線」不是「連接」）
ZHS_DROP = {'線上', '資料', '核心', '連線', '複製', '互動'}

PKG = os.path.dirname(opencc.__file__)
BIN, SHARE = os.path.join(PKG, 'clib', 'bin', 'opencc_dict'), os.path.join(PKG, 'clib', 'share', 'opencc')


def ocd(name):
    with tempfile.TemporaryDirectory() as d:
        out = os.path.join(d, name + '.txt')
        env = dict(os.environ, LD_LIBRARY_PATH=os.path.join(PKG, 'clib', 'lib64'))
        subprocess.run([BIN, '-i', os.path.join(SHARE, name + '.ocd2'), '-o', out, '-f', 'ocd2', '-t', 'text'], check=True, env=env)
        return {k: v.split(' ')[0] for k, v in (ln.rstrip('\n').split('\t', 1) for ln in open(out, encoding='utf8') if '\t' in ln)}


TW = {**ocd('TWVariantsRev'), **ocd('TWVariantsRevPhrases'), **ocd('TWPhrasesRev')}   # 臺灣用語 → 大陸用語（仍是繁體）
TSP, TSC = ocd('TSPhrases'), ocd('TSCharacters')                                   # 繁體 → 簡體
CJK = re.compile(r'[\u3400-\u9fff\uf900-\ufaff]+')


def sources():
    yield re.sub(r'<!--.*?-->', '', open(os.path.join(ROOT, 'index.html'), encoding='utf8').read(), flags=re.S)
    for d, _, fs in os.walk(os.path.join(ROOT, 'src', 'js')):
        for f in sorted(fs):
            if f.endswith('.js') and not any(f.endswith(s) for s in SKIP):
                yield re.sub(r'/\*.*?\*/', '', open(os.path.join(d, f), encoding='utf8').read(), flags=re.S)


text = '\n'.join(CJK.findall('\n'.join(sources()))) + '\n' + '\n'.join(ZHS_EXTRA)
chars = {}
for c in set(text):
    v = TSC.get(c)
    if v and v != c and len(v) == 1:
        chars[c] = v
for v in list(TW.values()) + list(TSP.values()):
    for c in v:
        if c in TSC and c not in chars and TSC[c] != c and len(TSC[c]) == 1:
            chars[c] = TSC[c]
conv = lambda s: ''.join(chars.get(c, c) for c in s)


def simp(s):
    """一段繁體（大陸用語）轉成簡體：先比對 TSPhrases，其餘逐字"""
    out, i = '', 0
    while i < len(s):
        for n in range(min(6, len(s) - i), 1, -1):
            if s[i:i + n] in TSP:
                out += TSP[s[i:i + n]]; i += n; break
        else:
            out += conv(s[i]); i += 1
    return out


phrases = {}
for k, v in list(TW.items()) + list(TSP.items()):
    if len(k) < 2 or k in ZHS_DROP or k not in text:
        continue
    val = simp(TW.get(k, k)) if k in TW else v
    if val != conv(k):
        phrases[k] = val
phrases.update(ZHS_EXTRA)

js = ('/* 簡體中文轉換表：由 tools/gen_zh_hans.py 以 OpenCC（tw2sp）產生，請勿手動修改 */\n'
      'const ZHS_C=' + json.dumps(''.join(sorted(chars)), ensure_ascii=False) + ',ZHS_S='
      + json.dumps(''.join(chars[c] for c in sorted(chars)), ensure_ascii=False) + ';\n'
      'const ZHS_P=' + json.dumps(dict(sorted(phrases.items())), ensure_ascii=False, separators=(',', ':')) + ';\n')
open(OUT, 'w', encoding='utf8').write(js)
print('已輸出', OUT, f'{len(chars)} 字、{len(phrases)} 詞、{os.path.getsize(OUT) / 1024:.0f} KB')
