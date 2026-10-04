# Novaday 網頁版架構

這份文件說明網頁版程式怎麼組織、資料存在哪裡，以及新增或修改功能時要改哪些檔案。

## 1. 概觀

- **純前端、沒有框架、沒有建置步驟**：`index.html` 直接依序載入 `src/css/` 和 `src/js/` 的檔案，GitHub Pages 原樣提供。
- **單檔版**：`tools/build_single_html.py` 把所有檔案內嵌成 `dist/novaday.html`，可以直接當 Claude artifact 發布。
- **資料只存在這台裝置**：文字紀錄和設定在 localStorage，照片和影片在 IndexedDB。沒有伺服器。

## 2. 資料夾

```
index.html              畫面結構（所有頁面與面板的 HTML）＋依序載入 CSS / JS
build-order.json        CSS 與 JS 的載入順序（index.html 必須一致，打包工具會檢查）
src/
├── css/
│   ├── base/           tokens（色彩變數）、reset、accessibility（焦點框、小螢幕）、effects（特效、紅光模式）
│   ├── layout/         app-shell、tab-bar、app-bar、scrollbar、device-frame（電腦預覽外框）
│   ├── components/     可重複使用的元件，一個元件一個檔：hud、rank-card、badges、entry-card、media…
│   └── screens/        各頁面與面板：home、log、star-calendar、atlas、me、settings、editor、detail、onboarding…
└── js/
    ├── core/           基礎：錯誤提示、模擬日期、utils、個人資料、紀錄讀寫、IndexedDB、照片儲存、zip、分頁導覽、下載
    ├── data/           純資料：心情與階級、題目、88 星座、黃道與運勢、徽章、星座剪影、範例紀錄的照片與影片（來源見 sample-media-credits.md）
    ├── logic/          規則：XP／等級／連續天數、徽章條件、星空投影與可見度
    ├── ui/             共用介面：底部面板、特效、手勢、捲動、看圖器、日記卡片、慶祝畫面、生日滾輪
    │   └── art/        程式繪製的圖：階級徽章、心情星星、頭像、水晶徽章、星座圖
    ├── screens/        各頁面：home/、log/、atlas/、me/、settings/、detail、editor、onboarding
    ├── features/       獨立功能：backup/（匯出、還原、清除）、reports/（月報、年度回顧）、分享圖卡、密碼鎖、開發者工具
    └── app/            render（重繪所有畫面）、init、boot（啟動）
tests/                  自動測試（npm test）
tools/                  打包單檔版（build_single_html.py）、匯出 Flutter 素材（export_assets.mjs）
docs/                   本文件、備份格式規格
dist/                   單檔版（打包產生，不要手動修改）
```

Flutter 用的素材在 `assets/`，說明見 [README](../README.md)。`assets/data/`、`assets/design/` 和星座圖由 `npm run export-assets` 從網頁版的程式產生：改了 `src/js/data/`、星座剪影、介面圖示或 CSS 動畫之後，記得重新執行。

## 3. 載入順序很重要

### JS
- 所有 JS 是**一般的 `<script>`**，共用同一個全域作用域。檔案依 `build-order.json` 的順序執行。
- **頂層會立刻執行的程式**（例如 `$('x').onclick=…`、`addEventListener('input', qnSync)`、立即執行的函式）用到的函式或變數，必須在**更早的檔案**宣告。
- 只在事件或之後才執行的程式（按鈕點擊、計時器）不受順序限制。
- `const` / `let` 在宣告之前使用會出錯；`function` 宣告只在同一個檔案內提前可用。
- 新檔案放在它依賴的檔案之後；不確定時放在 `app/boot.js` 之前即可。

### CSS
- 樣式的優先順序：`!important` → 選擇器權重 → **檔案順序**（後面的覆蓋前面的）。
- 檔案順序依 `build-order.json`：`base` → `layout` → `components` → `base/accessibility` → `screens` → `base/effects` → `layout/device-frame`。
  - `accessibility` 放在元件之後、畫面之前：鍵盤焦點框要蓋過元件自己的 `outline`，但生日滾輪要再蓋過焦點框。
  - `device-frame` 放最後：電腦預覽外框與「減少動態效果」要覆寫所有元件。
- 要覆寫某個元件在特定頁面的樣式，寫在該頁面的 `screens/*.css`（載入順序在元件之後），或用更明確的選擇器。

## 4. 資料存在哪裡

| 位置 | 鍵 | 內容 |
|---|---|---|
| localStorage | `orbitlog.entries.v1` | 日記紀錄（照片只記 `idb:<鍵>` 參照） |
| localStorage | `orbitlog.profile.v1` | 個人資料與設定（全域變數 `prof`） |
| localStorage | `orbitlog.reviews.v1` | 回顧紀錄（重看舊紀錄的 XP） |
| localStorage | `orbitlog.draft.v1` | 未完成的草稿 |
| localStorage | `orbitlog.draft.stash.v1` | 一句話快記或指定日期補寫時，暫時收起來的草稿（存完就放回 `draft.v1`） |
| localStorage | `orbitlog.seeded.v1` | 是否已放入範例紀錄 |
| localStorage | `orbitlog.entries.broken.v1` | 讀取時發現格式不對的紀錄：修正前的原始資料留底（平常不存在） |
| localStorage | `novaday.dev.*` | 開發者工具：模擬日期、錯誤紀錄、空白狀態收起的紀錄 |
| IndexedDB `novaday.media` | `v…` | 影片檔 |
| IndexedDB `novaday.media` | `p…` | 照片檔（`core/photo-store.js`） |

- 記憶體中的紀錄在全域變數 `entries`。照片欄位是可直接顯示的網址（object URL）；存檔時 `phPack()` 換成參照，啟動時 `phHydrate()` 讀回。
- 沒有被任何紀錄或草稿用到的照片、影片，會在下次開啟 App 時清掉（`mediaGC()`）。
- 備份格式見 [backup-format.md](backup-format.md)。

## 5. 資料怎麼流動

1. **啟動**（`app/boot.js`）：`load()` 讀紀錄 → `phHydrate()` 讀回照片 → `render()` 繪製所有畫面 → 需要時顯示引導頁或密碼鎖。
2. **使用者操作**：修改 `entries` 或 `prof` → 呼叫 `save()` / `saveProf()` → 呼叫 `render()`（或只重繪該畫面，例如 `renderMe()`、`renderLog()`）。
3. **衍生資料**都從紀錄算出來，不另外儲存：等級與 XP（`logic/xp-streak.js`）、徽章（`logic/achievement-rules.js`）、點亮的星座（`logic/sky-projection.js` 的 `consState()`）。

## 6. 新增或修改功能

1. **HTML**：在 `index.html` 加上畫面或面板（面板用 `<div class="layer" id="…">`，用 `openSheet(id)` / `closeSheet(id)` 開關）。
2. **CSS**：放進對應的 `src/css/components/` 或 `src/css/screens/` 檔案；新檔案要同時加到 `index.html` 和 `build-order.json`。
3. **JS**：放進對應的 `src/js/` 檔案；新檔案同樣要加到兩個地方，位置注意第 3 節的載入順序。
4. **測試**：`npm test`，必要時在 `tests/` 加測試。
5. **單檔版**：`npm run build` 重新產生 `dist/novaday.html`。
6. **Flutter 素材**：改到資料、星座圖、介面圖示或動畫時，執行 `npm run export-assets`。

### 命名與風格
- 檔名用英文小寫加 `-`，照功能命名，不加版本號或數字前綴。
- 每個檔案開頭一行註解說明內容；註解用繁體中文。
- 程式採精簡寫法（單行函式、短變數名），新程式請照現有風格。

## 7. 開發者工具

在「設定 → 版本資訊」連點版本號碼 7 次開啟。功能包括動畫預覽、產生測試資料、快轉進度、模擬日期、極端緯度、剪影與元件總覽、字級放大、螢幕尺寸、觸控範圍、FPS、資料檢視器、錯誤紀錄與重設開發者工具（`src/js/features/dev-tools.js`）。

「重設個人資料與設定」「全部初始化」不在開發者工具裡，而是放在一般設定的「重設」區，和「清除所有紀錄」共用同一個面板（`src/js/features/backup/wipe.js`），都要輸入確認字（刪除／重設／初始化）才能執行。

## 8. 暫時隱藏的功能

程式還在，只是不顯示；把開關改成 `true` 就會恢復：

| 功能 | 開關 | 位置 |
|---|---|---|
| 月曆上的流星雨標示與圖例 | `SHOW_METEORS` | `src/js/screens/log/star-calendar.js` |
| 紅光夜視模式（設定列、星座頁按鈕；隱藏時一律關閉） | `SHOW_RED` | `src/js/screens/settings/settings.js` |
| 設定裡的「儲存空間」列（隱藏時也不計算用量） | `SHOW_STORE` | `src/js/screens/settings/storage.js` |
| 匯出與備份的「純文字」格式（隱藏時只有完整備份） | `SHOW_TEXT_EXPORT` | `src/js/features/backup/export.js` |

## 9. 測試

```
npm install      # 第一次：安裝 Playwright
npm test         # 全部測試
npm test backup  # 只跑檔名含 backup 的測試
```

測試會啟動本機伺服器，用無頭 Chromium 操作分檔版與單檔版（全部跑完約 2～3 分鐘）：

| 檔案 | 內容 |
|---|---|
| `app.test.mjs` | 載入、引導頁、範例紀錄、寫紀錄、12／24 小時制、不能寫未來 |
| `journey.test.mjs`、`journey2.test.mjs` | 用真的點擊走流程：寫、編輯、搜尋、刪除與復原、照片、草稿（含快記與補寫時的草稿暫存）、標籤合併、月曆、暱稱、連點兩下 |
| `storage.test.mjs` | 讀取時修正格式錯誤的紀錄與個人資料、清除所有紀錄 |
| `reset.test.mjs` | 重設個人資料與設定（保留日記）、全部初始化，以及兩者的輸入確認 |
| `timezone.test.mjs` | 新紀錄存下時區、跨時區提示、分享卡片的 12／24 小時制 |
| `tabs.test.mjs` | 同時開兩個分頁的資料同步 |
| `day-change.test.mjs` | App 在背景過夜後的跨日更新 |
| `lock.test.mjs` | 密碼鎖、上鎖時後方畫面 inert、提示顯示在最上層 |
| `a11y.test.mjs` | 面板焦點、Tab 範圍、Esc、慶祝畫面、引導頁、減少動態效果 |
| `share.test.mjs` | 分享圖卡（特殊字元、控制字元）、儲存圖片、從慶祝畫面打開 |
| `format.test.mjs` | 純文字匯出、跨年日期、「#標籤」搜尋、那年今日的月份推算 |
| `backup.test.mjs` | 照片搬進 IndexedDB、完整備份 .zip 來回還原 |
| `dev-tools.test.mjs`、`dist.test.mjs` | 開發者工具、單檔版 |

## 10. 共用小工具（`src/js/core/utils.js`）

- `isEnter(e)`：文字欄位的 Enter，排除中文輸入法選字中的 Enter。
- `svgURL(svg)`：SVG 轉成圖片網址，去掉 XML 不允許的字元。
- `pctDone(f)`：完成度百分比，未完成時最多 99%。
- `fmtDayY(s)`：不是今年的日期前面加上年份。
- 電腦預覽外框的條件 `FRAME_MQ`（`src/js/core/config.js`），CSS 的 `@media` 要用同一個條件。
