# Novaday: Flutter 素材參考包

這個包從 Novaday HTML artifact（v59）匯出，裡面有所有圖像素材、資料和設計規格，給之後用 Flutter 重寫 App 時參考。
網頁版原始碼放在 `web/`，已經拆成分層的檔案：
- 打開 `web/index.html` 就能執行
- 單一檔版在 `web/dist/novaday.html`
- 結構說明見 `web/README.md`

## 資料夾結構

| 路徑 | 內容 |
|---|---|
| `svg/avatars/` | 23 個星空頭像，48×48 viewBox，已經內嵌漸層 |
| `svg/rank_badges/` | 12 個階級徽章：rank_01 見習觀星者 … rank_12 星際傳奇 |
| `svg/rank_ships/` | 12 款星座連線塗裝小圖 |
| `svg/achievement_crystals/` | 108 個完整水晶徽章（54 個 × `_unlocked` / `_locked`），92×92，純向量 |
| `svg/achievement_icons/` | 54 個成就徽章圖示（已解鎖配色），只有圖示本身，不含水晶底 |
| `svg/achievement_icons_locked/` | 54 個成就徽章圖示（未解鎖、灰紫配色） |
| `svg/zodiac_glyphs/` | 12 個黃道星座符號，另有 `_zodiac_ring.svg` 轉動環 |
| `svg/mood_stars/` | 5 個心情星星（mood_0 很低落 … mood_4 很棒） |
| `svg/constellations/lit/` | 88 個星座圖：全部點亮，含星座形象剪影 |
| `svg/constellations/unlit/` | 88 個星座圖：未點亮狀態 |
| `svg/ui_icons/` | 介面圖示，包括分頁列、按鈕、設定等。`_index.json` 對照每個圖示的中文用途 |
| `svg/brand/novaday_logo.svg` | App Logo |
| `png/**` | 備用的點陣版本（1x、`2.0x/`、`3.0x/`）。每一張 PNG 都有對應的 SVG，一般用 SVG 就好 |
| `data/*.json` | 所有內容資料，詳見下節 |
| `design/design_tokens.json` | 色彩、字型、圓角、漸層 |
| `design/animations_keyframes.css` | 110 個 CSS 動畫 keyframes，可以照著轉成 Flutter 動畫 |
| `screenshots/` | 各主要畫面截圖，尺寸 390×844 @2x |
| `web/` | 網頁版原始碼（分層分檔）：`index.html`，73 個 CSS 檔、55 個 JS 檔，打包工具，單一檔版 |

## 資料檔 `data/`

- `constellations.json`：88 個 IAU 星座，包含中文名、拉丁名、是否黃道、小知識。星星以 [赤經時, 赤緯度, 星等] 表示，另有連線索引和形象剪影路徑。
- `zodiac.json`：12 星座的日期、元素、關鍵字、性格描述和符號路徑。
- `fortune_texts.json`：每月運勢文字庫。原始的產生演算法（`seedRng`）也附在裡面，要在 Flutter 得到相同結果，必須照原樣移植。
- `moods.json`：5 種心情的名稱和顏色。
- `ranks.json`：12 個階級和它們的塗裝顏色，附 XP、等級、階級的計算公式（原始 JS）。
- `achievements.json`：54 個徽章，分 6 類，每類都是 3 的倍數。內容有：
  - 分類標題和圖示
  - 水晶配色
  - 每個徽章的解鎖條件和進度計算（原始 JS）
  - 輔助函式
- `avatars.json`：頭像清單、預設頭像（`const`）、頭像底色，以及舊版 emoji 的對照。
- `meteors.json`：流星雨日期。
- `regions.json`：地區與城市緯度，用來計算今晚看得到哪些星座。
- `prompts.json`：今日星語的題目。
- `sample_entries.json`：日記資料結構範例，對應 localStorage 的 schema。

## Flutter 使用方式

`pubspec.yaml`：

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

- **SVG**：`SvgPicture.asset('assets/svg/avatars/const.svg')`。符號類圖示是白色的，要換顏色時用 `colorFilter: ColorFilter.mode(color, BlendMode.srcIn)`。
- **水晶徽章**：`SvgPicture.asset('assets/svg/achievement_crystals/s7_unlocked.svg', width: 92, height: 92)`。
- **PNG（備用）**：`Image.asset('assets/png/avatars/const.png')`。Flutter 會依螢幕密度自動挑 `2.0x/`、`3.0x/` 的版本。
- **字型**：`GoogleFonts.chakraPetch()`。中文部分建議搭配 Noto Sans TC。
  也可以到 fonts.google.com 下載 Chakra Petch 的 TTF（400、500、600、700）放進 `assets/fonts/`。這次打包的環境連不上字型來源，所以字型檔沒有放進包裡。
- **色彩**：依 `design/design_tokens.json` 建立 `ThemeData`。主要色彩：
  - 背景 `#070A1C`
  - 主色 nebula `#8A7CFF`
  - 輔色 ion `#6FE3D6`
  - 強調 flare `#FFB45C`
  - 金星 `#FFE7A3`

## 注意事項

- **動畫**：SVG 匯出的是靜態畫面。原本的動畫有星星閃爍、火焰、水晶光澤、轉動環等，都寫在 CSS 裡（見 `design/animations_keyframes.css`），在 Flutter 需要用 `AnimationController` 或 `flutter_animate` 重做。
- **光暈**：原本的光暈是 CSS 的 `drop-shadow`。flutter_svg 不支援 SVG 濾鏡，所以 SVG 裡的光暈改用「多層加粗、半透明的描邊」做成，Flutter 能直接顯示，外觀接近原版，只是比 PNG 的模糊光暈稍微硬一點。
- **水晶徽章**：原本用 CSS 疊出來，SVG 版照同樣的構造重建：16 角星外框、放射漸層、內層切面、光澤、圖示光暈和閃星。CSS 的彩虹圓錐漸層在 SVG 沒有對應語法，所以改用 90 片扇形拼出來。
  未解鎖徽章的「進度液面」和各種動畫是動態的，SVG 裡沒有。需要時可以參考下面兩個來源，用 `CustomPainter` 重畫：
  - `achievements.json` 裡的 `crystal_star_path_100`（16 角星外框）和 `crystal_colors`
  - `web/css/components/650-crystal-flat.css` 的 `.fc` 樣式
- **星座圖**：用 `conProj()` 把赤經和赤緯投影到畫面座標，演算法在 `web/js/logic/160-sky-projection.js`，畫圖的部分在 `web/js/ui/art/180-constellation-map.js`。
- **遊戲邏輯**：
  - XP、等級、連續天數：`web/js/logic/100-xp-streak.js`
  - 徽章解鎖與進度：`web/js/logic/130-achievement-rules.js`
  - 階級：`web/js/data/020-moods-ranks.js`
