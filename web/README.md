# Novaday 網頁版原始碼（分層分檔）

這是 Novaday artifact（v59）的單一 HTML 拆開後的版本：73 個 CSS 檔、55 個 JS 檔，加上一個只放畫面結構的 `index.html`。
拆分完全按照原檔的行切開，沒有改動任何程式碼。用 `tools/build_single_html.py` 組回去的單一檔案，和原本的 artifact **逐位元組完全相同**。

## 怎麼開

- **直接開**：用瀏覽器打開 `index.html` 就能執行。資料存在 localStorage。
- **本機伺服器（建議）**：在這個資料夾執行 `python3 -m http.server 8000`，再打開 http://localhost:8000。
- **單一檔版**：`dist/novaday.html`，可以直接當 Claude artifact 發布。
  改完分檔的原始碼後，執行 `python3 tools/build_single_html.py`，就會重新產生這個檔案。

## 資料夾分層

```
web/
├── index.html            畫面結構（HTML markup）＋依序載入 CSS / JS
├── manifest.json         CSS 與 JS 的載入順序（打包工具用）
├── css/
│   ├── base/             設計 token（色彩變數）、reset、共用特效、無障礙與小螢幕
│   ├── layout/           App 外殼、底部分頁列、頂部 app bar、iPhone 預覽外框
│   ├── components/       可重複使用的元件：HUD、底部面板、徽章水晶、心情星星、運勢卡、生日滾輪…
│   ├── screens/          各頁面：首頁、日記、星曆、圖鑑、我的、編輯器、詳情、引導、密碼鎖…
│   └── refinements/      後期的小幅修正（覆蓋前面的樣式）
├── js/
│   ├── core/             基礎：錯誤提示、儲存 key、個人資料、localStorage 讀寫、分頁導覽
│   ├── data/             純資料：心情、階級、88 星座、黃道十二宮與運勢文字、54 個徽章、星座剪影
│   ├── logic/            規則：XP／等級／連續天數、徽章解鎖與進度、星空投影與可見度
│   ├── ui/               共用介面：底部面板、手勢快捷鍵、特效、背景星空、捲動行為
│   │   └── art/          程式繪製的 SVG 圖像：階級徽章、心情星星、頭像、水晶徽章、星座圖
│   ├── screens/          各頁面邏輯
│   │   ├── home/         首頁：渲染、星座運勢、那年今日、今日紀錄、app bar
│   │   ├── log/          日記：搜尋篩選、星曆、頂部收合
│   │   ├── atlas/        圖鑑、今晚觀星指引
│   │   └── me/           我的：心情能量、階級卡片、星光足跡、徽章詳情、個人資料
│   ├── features/         獨立功能：分享圖卡、心情洞察、月報、年度回顧、照片、標籤、匯出、備份還原、設定與密碼鎖
│   └── app/              初始化與啟動（boot 一定最後載入）
├── tools/build_single_html.py
└── dist/novaday.html     打包好的單一檔案
```

## 檔名前的數字＝載入順序

每個檔案前面的 3 位數字（010、020 …）是**全域的載入順序**，跨資料夾共用同一個序列。`index.html` 就照這個順序載入。

- **CSS**：後載入的會覆蓋先載入的。`refinements/` 和不少元件檔（例如 `crystal-flat`、`hud-v3`）是在修改前面的樣式，所以不能任意調換順序。
- **JS**：所有檔案共用同一個全域作用域，可以直接互相呼叫。
  - 載入的當下就會執行的程式碼（例如 `const X = (() => {…})()`），只能用到**前面**檔案已經定義好的東西。
  - 大部分函式要等最後的 `app/540-boot.js` 呼叫 `render()` 時才會執行，那時全部檔案都已載入。
- **新增檔案**：放進適合的資料夾，取一個介於前後兩檔之間的數字，然後同步更新 `index.html` 和 `manifest.json`。

## 對照 Flutter 的建議

| 網頁版 | Flutter 建議位置 |
|---|---|
| `css/base/010-tokens.css` | `lib/theme/`（ThemeData、ColorScheme） |
| `js/data/*` | `assets/data/*.json`（素材包的 `data/` 已經轉好了）＋ `lib/models/` |
| `js/logic/*` | `lib/domain/`（純 Dart，可以寫單元測試） |
| `js/core/storage`、`profile` | `lib/data/`（shared_preferences、Hive 或 Isar） |
| `js/ui/art/*` | `lib/widgets/art/`（SVG 素材或 CustomPainter） |
| `js/ui/*`、`css/components/*` | `lib/widgets/` |
| `js/screens/*`、`css/screens/*` | `lib/screens/`（每個分頁一個資料夾） |
| `js/features/*` | `lib/features/` |

## 原始 localStorage key

| Key | 內容 |
|---|---|
| `orbitlog.entries.v1` | 日記 |
| `orbitlog.profile.v1` | 個人資料與設定 |
| `orbitlog.reviews.v1` | 回顧紀錄 |
