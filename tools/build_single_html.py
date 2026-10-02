#!/usr/bin/env python3
"""把分檔的 Novaday 網頁專案打包回單一 HTML（可直接當 Claude artifact 發布）。

用法：
    python3 tools/build_single_html.py            # 輸出 dist/novaday.html
    python3 tools/build_single_html.py out.html   # 指定輸出路徑

做法：
- index.html 的 <link rel="stylesheet" href="src/css/..."> 依順序內嵌成一個 <style>
- src/js/core/error-overlay.js 內嵌成獨立 <script>
- 其餘 src/js/ 依 build-order.json 順序串接，外面包一層 (function(){ … })();
  （單檔版所有程式共用一個函式作用域，跟分檔版的全域作用域行為相同）
"""
import json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'dist', 'novaday.html')
man = json.load(open(os.path.join(ROOT, 'build-order.json'), encoding='utf8'))
read = lambda rel: open(os.path.join(ROOT, rel), encoding='utf8').read()

lines = read('index.html').split('\n')
res = []
i = 0
while i < len(lines):
    ln = lines[i]
    if ln.startswith('<!-- ===== 樣式'):
        i += 1
        css = []
        while i < len(lines) and lines[i].startswith('<link rel="stylesheet" href="src/css/'):
            css.append(re.search(r'href="([^"]+)"', lines[i]).group(1)); i += 1
        assert css == man['css'], 'index.html 的 CSS 順序和 build-order.json 不一致'
        res.append('<style>')
        res.append(''.join(read(c) for c in css).rstrip('\n'))
        res.append('</style>')
        continue
    if ln.startswith('<!-- ===== 程式'):
        i += 1
        js = []
        while i < len(lines) and lines[i].startswith('<script src="src/js/'):
            js.append(re.search(r'src="([^"]+)"', lines[i]).group(1)); i += 1
        assert js[0] == man['error_overlay'] and js[1:] == man['js'], 'index.html 的 JS 順序和 build-order.json 不一致'
        res += ['<script>', read(js[0]).rstrip('\n'), '</script>', '<script>', '(function(){']
        res.append(''.join(read(j) for j in js[1:]).rstrip('\n'))
        res += ['})();', '</script>']
        continue
    res.append(ln); i += 1

os.makedirs(os.path.dirname(os.path.abspath(out)), exist_ok=True)
open(out, 'w', encoding='utf8').write('\n'.join(res))
print('已輸出', out, f'{os.path.getsize(out) / 1024:.0f} KB')
