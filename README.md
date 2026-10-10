# Novaday

每天點亮一顆新星的星空日記。這個 repo 有兩部分：

- **網頁版**：根目錄的 `index.html` 加上 `src/`，由 GitHub Pages 提供（dominicshing.github.io/novaday-pages）。
- **Flutter 素材**：`assets/` 裡的圖像、資料和設計規格，給之後用 Flutter 製作手機 App 時使用。資料和星座圖由網頁版的程式產生，兩邊保持一致。

## 資料夾結構

```
./
├── index.html          網頁版的畫面結構＋依序載入 CSS / JS
├── build-order.json    CSS 與 JS 的載入順序
├── src/
│   ├── css/            base、layout、components（一個元件一個檔）、screens（一個畫面一個檔）
│   └── js/             core、data、logic、ui、screens、features、app
├── assets/             Flutter 素材（見下方）
├── docs/               架構說明、備份格式規格、範例媒體來源
├── tests/              自動測試
├── tools/              打包單檔版、匯出 Flutter 素材
└── dist/novaday.html   單檔版（可直接當 Claude artifact 發布）
```

## 網頁版

- **執行**：在這個資料夾執行 `python3 -m http.server 8000`，再打開 http://localhost:8000（也可以直接用瀏覽器打開 `index.html`）。
- **單檔版**：改完原始碼後執行 `npm run build`，重新產生 `dist/novaday.html`。
- **介面語言**：繁體中文（預設）、简体中文、English，在「設定 → 顯示 → 語言」或引導頁第一頁切換。程式裡的介面文字一律寫繁體，簡體由 OpenCC 產生的轉換表自動轉換，英文翻譯在 `src/js/core/i18n-en.js`。做法見 [docs/architecture.md](docs/architecture.md) 第 11 節。
- **畫面截圖**：手機外框上方的「擷取畫面」按鈕可擷取目前可見畫面，保留捲動位置，預覽後儲存 PNG 或使用系統分享。圖片在瀏覽器內產生，截圖按鈕與提示訊息不會出現在圖片中。
- **截圖依賴**：內附 `modern-screenshot` 4.7.0（MIT），原始授權位於 `src/js/vendor/modern-screenshot.LICENSE`；網頁版與單檔版都不需從 CDN 載入截圖程式。
- **測試**：`npm install` 後執行 `npm test`。完整星座插畫驗收可執行 `ART_REQUIRE_COMPLETE=1 npm test constellation-library`，檢查全部 88 座的透明圖像、星數、分區揭露、跨尺寸對位、分享與匯出素材，以及完成收藏與單檔版流程。
- 程式結構、載入順序、資料存在哪裡、怎麼新增功能，都寫在 [docs/architecture.md](docs/architecture.md)。
- 範例紀錄的照片取自 Wikimedia Commons（CC0）、影片取自 Mixkit（免費授權），來源列在 [docs/sample-media-credits.md](docs/sample-media-credits.md)。

## Flutter 素材 `assets/`

| 路徑 | 內容 |
|---|---|
| `svg/avatars/` | 23 個星空頭像，48×48 viewBox，已經內嵌漸層 |
| `svg/rank_badges/` | 28 個階級徽章（每一級一個）：rank_01 見習觀星者 … rank_28 星際傳奇 |
| `svg/rank_ships/` | 28 款星線顏色小圖（每一階解鎖一種） |
| `svg/achievement_crystals/` | 108 個完整水晶徽章（54 個 × `_unlocked` / `_locked`），92×92，純向量 |
| `svg/achievement_icons/` | 54 個成就徽章圖示（已解鎖配色），只有圖示本身，不含水晶底 |
| `svg/achievement_icons_locked/` | 54 個成就徽章圖示（未解鎖、灰紫配色） |
| `svg/zodiac_glyphs/` | 12 個黃道星座符號，另有 `_zodiac_ring.svg` 轉動環 |
| `svg/mood_stars/` | 5 個心情星星（mood_0 很低落 … mood_4 很棒） |
| `svg/constellations/lit/` | 88 個星座圖：全部點亮，內嵌透明插畫與對應星點、連線 |
| `svg/constellations/unlit/` | 88 個星座圖：未點亮，剪影只剩淡淡的影子 |
| `svg/ui_icons/` | 99 個介面圖示：分頁列、按鈕、設定分類與各列、開發者工具等。`_index.json` 對照每個圖示的中文用途 |
| `svg/brand/novaday_logo.svg` | App Logo |
| `png/**` | 備用的點陣版本（1x、`2.0x/`、`3.0x/`）。每一張 PNG 都有對應的 SVG，一般用 SVG 就好；星座圖和介面圖示只有 SVG |
| `data/*.json` | 所有內容資料，詳見下節 |
| `l10n/` | 介面語言：`app_*.arb`（`flutter gen-l10n` 用）、`content.json`（內容資料的翻譯）、`l10n.yaml`，詳見下方「介面語言」 |
| `design/design_tokens.json` | 色彩、字型、圓角、漸層 |
| `design/animations_keyframes.css` | CSS 動畫 keyframes，可以照著轉成 Flutter 動畫 |
| `screenshots/` | 各主要畫面截圖，尺寸 390×844 @2x |

### 資料檔 `data/`

- `constellations.json`：88 個 IAU 星座，包含中文名、拉丁名、是否黃道、小知識。星星以 [赤經時, 赤緯度, 星等] 表示，另有連線索引和星座剪影。
  - `figure.style` 全部是 `image`，88 個星座各自使用獨立的透明插畫。`image_data_url` 為內嵌圖像，`reference_frame` 為 `[380,300]`，圖案與星點按同一畫框等比縮放。未點亮時保留 14% 的低亮度剪影，點亮後依最近的已亮／未亮主星距離，以 24px 柔邊逐區揭露；新增星星時從該主星向外擴散 1.8 秒。`progress_reveal` 記錄遮罩與底影設定，全亮後以 5 秒循環呼吸：幼貓同步改變光暈、輪廓與圖像亮度；其餘透明插畫改變圖像亮度。圖案大小固定。其他星塵輪廓仍可設定 `figure.align: "stars"`，依 `ref_points` 與投影星點共同縮放、平移。程式仍支援 `outline`（一般剪影，依星點位置對齊）。
  - 舊版剪影相容欄位 `figure.eye` 是眼睛位置 `[x, y]`；俯視的圖案（例如蝎虎座的壁虎）另有第二隻眼睛 `figure.eye2`；超過兩隻（例如雙子座的雙胞胎）其餘放在 `figure.eyes` 陣列；`figure.eye_r` 是放大的眼睛半徑（可愛造型用，預設星塵 2.4、一般 2.2）。沒有就是 `null`。
- `zodiac.json`：12 星座的日期、元素、關鍵字、性格描述和符號路徑。
- `fortune_texts.json`：每月運勢文字庫。原始的產生演算法（`seedRng`）也附在裡面，要在 Flutter 得到相同結果，必須照原樣移植。
- `moods.json`：5 種心情的名稱和顏色。
- `ranks.json`：28 個階級（Lv.1–28 各一階，Lv.28 以後維持最高階）、徽章圖案、星線顏色，附 XP、等級、階級的計算公式（原始 JS）。
- `achievements.json`：54 個徽章，分 6 類，每類都是 3 的倍數。內容有：
  - 分類標題和圖示
  - 水晶配色
  - 每個徽章的解鎖條件和進度計算（原始 JS）
  - 輔助函式
- `avatars.json`：頭像清單、預設頭像（`const`）、頭像底色，以及舊版 emoji 的對照。
- `meteors.json`：流星雨日期。網頁版目前**不顯示**流星雨（多數使用者在城市看不到，標出來容易被當成標錯），資料先保留；`star-calendar.js` 的 `SHOW_METEORS` 改成 `true` 即可恢復。
- `regions.json`：地區與城市的緯度、經度，用來計算今晚看得到哪些星座、在天空的哪個位置。
- `prompts.json`：今日星語的題目。
- `sample_entries.json`：日記資料結構範例。手機版與網頁版之間搬資料，請用 [備份格式](docs/backup-format.md)。

### 重新產生素材

網頁版的程式是唯一的資料來源。改了資料、星座剪影或介面圖示之後，執行：

```
npm run export-assets
```

介面語言另外用 `npm run export-l10n` 重新產生 `l10n/`（改了介面文字或英文翻譯之後）。

它會用無頭瀏覽器執行網頁版，然後：
- 重新產生 `data/*.json`（全部）
- 重新產生 `svg/constellations/` 的 88 × 2 個星座圖
- 重新產生 `svg/rank_badges/`、`svg/rank_ships/` 與對應的 PNG（1x、2.0x、3.0x）
- 把新的介面圖示補進 `svg/ui_icons/`（不改現有的檔名）

頭像、水晶徽章、心情星星、黃道符號、Logo 和它們的 PNG 來自最初的匯出（水晶徽章是照 CSS 的構造手工重建的 SVG），這次沒有變動；如果之後修改這些圖，需要另外更新。

### Flutter 使用方式

把 `assets/` 整個資料夾複製到 Flutter 專案根目錄，`pubspec.yaml`：

```yaml
dependencies:
  flutter_svg: ^2.0.0
  google_fonts: ^6.0.0   # Chakra Petch

flutter:
  assets:
    - assets/svg/avatars/
    - assets/svg/achievement_crystals/
    - assets/svg/rank_badges/
    - assets/svg/achievement_icons/
    - assets/svg/achievement_icons_locked/
    - assets/svg/zodiac_glyphs/
    - assets/svg/mood_stars/
    - assets/svg/constellations/lit/
    - assets/svg/constellations/unlit/
    - assets/svg/ui_icons/
    - assets/svg/brand/
    - assets/data/
```

- **SVG**：`SvgPicture.asset('assets/svg/avatars/const.svg')`。符號類圖示要換顏色時用 `colorFilter: ColorFilter.mode(color, BlendMode.srcIn)`。
- **水晶徽章**：`SvgPicture.asset('assets/svg/achievement_crystals/s7_unlocked.svg', width: 92, height: 92)`。
- **PNG（備用）**：`Image.asset('assets/png/avatars/const.png')`。Flutter 會依螢幕密度自動挑 `2.0x/`、`3.0x/` 的版本。
- **字型**：`GoogleFonts.chakraPetch()`。中文部分建議搭配 Noto Sans TC。
- **色彩**：依 `design/design_tokens.json` 建立 `ThemeData`。主要色彩：
  - 背景 `#070A1C`
  - 主色 nebula `#8A7CFF`
  - 輔色 ion `#6FE3D6`
  - 強調 flare `#FFB45C`
  - 金星 `#FFE7A3`

### 介面語言（`l10n/`）

由 `npm run export-l10n` 從網頁版的字典產生（說明見 [docs/architecture.md](docs/architecture.md) 第 11 節）。繁體中文是預設與後備語言。

1. 把 `assets/l10n/l10n.yaml` 複製到 Flutter 專案根目錄，`pubspec.yaml` 加上：

```yaml
dependencies:
  flutter_localizations:
    sdk: flutter
  intl: any

flutter:
  generate: true
  assets:
    - assets/l10n/content.json
```

2. `flutter gen-l10n`（或 `flutter run` 時自動產生），在 `MaterialApp` 設定：

```dart
MaterialApp(
  localizationsDelegates: AppLocalizations.localizationsDelegates,
  supportedLocales: AppLocalizations.supportedLocales,
  // 只有 zh_CN、zh_SG 這類沒有標明字體的系統語言時，依地區選簡體或繁體；其餘預設繁體
  localeResolutionCallback: (l, supported) {
    if (l?.languageCode == 'en') return const Locale('en');
    final hans = l?.scriptCode == 'Hans' || (l?.scriptCode == null && ['CN', 'SG'].contains(l?.countryCode));
    return Locale.fromSubtags(languageCode: 'zh', scriptCode: hans ? 'Hans' : 'Hant');
  },
);
```

3. 介面文字：`AppLocalizations.of(context).nEntries(3)`。訊息 ID 對應的繁體原文在 `app_zh.arb` 的說明和 `message_ids.json`。
4. 內容資料：讀 `content.json`，用資料的鍵和語言查：

```dart
final content = jsonDecode(await rootBundle.loadString('assets/l10n/content.json'));
String loc(Map m, Locale l) => m[l.languageCode == 'en' ? 'en' : 'zh_${l.scriptCode ?? 'Hant'}'] as String;
loc(content['constellations']['Ori']['name'], locale);   // 獵戶座／猎户座／Orion
```

- 有 28 則訊息含有 `<b>`、`<br>` 等 HTML 標籤（`app_zh.arb` 標了 `x-markup`），在 Flutter 要用 `RichText`／`TextSpan` 顯示，或改用 `flutter_html`。
- 日期與時間用 `intl` 的 `DateFormat`，對照表見 architecture.md 第 11 節。
- 不要直接改 Flutter 專案裡的 ARB：改網頁版的字典後重新匯出，兩邊才會一致。

### 注意事項

- **動畫**：SVG 是靜態畫面（採用網頁版「減少動態效果」時的樣子）。星星閃爍、火焰、水晶光澤、轉動環等動畫寫在 CSS 裡（見 `design/animations_keyframes.css`），在 Flutter 需要用 `AnimationController` 或 `flutter_animate` 重做。
- **光暈與模糊**：flutter_svg 不支援 SVG 濾鏡，所以：
  - 線條與圖形的光暈改用「多層加粗、半透明的描邊」。
  - 星塵剪影的星雲模糊改用放射漸層的橢圓；模糊的描邊依高斯模糊的亮度分布疊成五層。
  - 外觀接近網頁版，只是比真正的模糊稍微硬一點。
- **水晶徽章**：原本用 CSS 疊出來，SVG 版照同樣的構造重建：16 角星外框、放射漸層、內層切面、光澤、圖示光暈和閃星。CSS 的彩虹圓錐漸層在 SVG 沒有對應語法，所以改用 90 片扇形拼出來。
  未解鎖徽章的「進度液面」和各種動畫是動態的，SVG 裡沒有。需要時可以參考下面兩個來源，用 `CustomPainter` 重畫：
  - `achievements.json` 裡的 `crystal_star_path_100`（16 角星外框）和 `crystal_colors`
  - `src/css/components/badges.css` 的 `.fc` 樣式

- **星座插畫完成度**：全部 88／88 個星座已使用各自的透明插畫。`src/js/ui/art/remaining-art.js` 收錄二月至九月其餘 57 座，天貓座保留獨立版本。
- **造型修訂（2026-10-10）**：蒼蠅座（Mus）改為自然俯視飛行姿態，調整短觸角、六足與雙翼結構；羅盤座（Pyx）改為接近正面的單一羅盤面，統一外殼、刻度與磁針透視。這兩座的最新 PNG、提示詞與對位驗證在 `preview/constellation-realism/`，WebP 在 `assets/webp/constellations/`；上一批對照圖保留作為歷史紀錄。
- **星線對位重繪（2026-10-10）**：已重繪原本偏離比例 ≥15% 的 14 座：Sge、Cir、Tel、Lib、Com、Aps、Cam、Del、Mic、Col、Nor、Mus、Aql、CrB。以 380×300 畫框、可見圖案 alpha ≥96（5×5 中值濾波去除零星光點），計算距圖案超過 20px 的連線長度占比，這批降至 0–0.9%，所有主星距圖案不超過 20px。此為幾何篩選指標，仍需疊圖判斷造型。WebP 原檔在 `assets/webp/constellations/`；生成 PNG、提示詞、星線參考、前後量測與對照圖在 `preview/constellation-redraw/`。可在專案根目錄執行 `python3 preview/constellation-redraw/verify.py`（需 Pillow）重新驗證這 14 座。
- **透明插畫來源**：十月星座在 `src/js/ui/art/october-art.js`，十一月新增插畫在 `src/js/ui/art/november-art.js`，十二月插畫在 `src/js/ui/art/december-art.js`，一月插畫在 `src/js/ui/art/january-art.js`，二月至九月其餘插畫在 `src/js/ui/art/remaining-art.js`；這些插畫與雙魚共用 `src/js/ui/art/constellation-image.js` 的分區揭露、微星閃爍與呼吸效果。每個星座依自己的主星位置、點亮順序及星數計算遮罩，首頁、圖鑑、完成卡片及分享圖使用同一座標框。
- **插畫隨點亮進度成形**：未點亮時顯示淡剪影；每顆主星點亮後向外擴散，揭露對應區域。最後一顆星完成後先顯示完整收藏卡片，收進圖鑑後才切換下一座。啟用「減少動態效果」時顯示靜態插畫。`dustFig()` 與一般剪影渲染仍保留為舊版相容實作。
- **星座圖**：用 `conProj()` 把赤經和赤緯投影到畫面座標，演算法在 `src/js/logic/sky-projection.js`；畫圖在 `src/js/ui/art/constellation-map.js`，剪影在 `src/js/data/constellation-figures.js`。
- **遊戲邏輯**：
  - XP、等級、連續天數：`src/js/logic/xp-streak.js`
  - 徽章解鎖與進度：`src/js/logic/achievement-rules.js`
  - 階級：`src/js/data/moods-ranks.js`

## 備份格式

網頁版和 Flutter App 共用同一種備份格式：`.zip` 裡放 `novaday-backup.json`，照片和影片是獨立檔案。欄位、zip 規則、合併規則都寫在 [docs/backup-format.md](docs/backup-format.md)，實作 App 的備份與還原時請照著做，兩邊的備份才能互相還原。
