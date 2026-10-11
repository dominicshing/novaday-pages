# Novaday Flutter App 規劃書（iOS／Android）

把 Novaday 網頁版移植成 Flutter 手機 App。技術規格以同一位作者的 [pet_diary](https://github.com/dominicshing/pet_diary)（已上架的 Flutter App）為基準：套件、資料夾結構、資料庫、狀態管理、路由、平台設定都沿用，只在 Novaday 需要時增減。

- 撰寫日期：2026-10-11
- 網頁版基準：`main` 的 b47086a（網頁版 2.0，88／88 星座插畫完成、三種介面語言）
- 相關文件：[architecture.md](architecture.md)（網頁版架構）、[backup-format.md](backup-format.md)（備份格式 v1）、[README](../README.md)（Flutter 素材說明）

---

## 1. 目標與範圍

### 1.1 目標

1. iOS 與 Android 各一個原生 App，功能和網頁版相同，畫面和動畫盡量一致。
2. **資料互通**：網頁版和 App 用同一份備份格式（v1），可以互相還原。
3. **規則結果完全相同**：XP、等級、連續天數、徽章、星座點亮順序、星空投影、每月運勢，在兩邊用同一份資料算出相同的結果。
4. 網頁版繼續當**唯一的資料來源**：資料檔、語言檔、圖像由網頁版匯出（`npm run export-assets`、`npm run export-l10n`），App 不直接修改。
5. 沿用 pet_diary 的做法：沒有帳號、沒有伺服器，資料只存在裝置上。

### 1.2 第一版（1.0）範圍

| 納入 | 不納入（之後再評估） |
|---|---|
| 網頁版目前顯示的所有功能（第 3 節） | 雲端同步、帳號 |
| 每日提醒改成真的系統通知（網頁版只能存設定） | iPad／平板專用版面（先以手機直式為主，平板放大顯示） |
| 密碼鎖，另外可選 Face ID／指紋 | Apple Watch、桌面小工具（Widget） |
| 商店評分改用系統評分視窗 | 網頁版暫時隱藏的功能：流星雨、紅光模式、儲存空間列、純文字匯出（程式移植，但開關維持關閉） |
| 備份 .zip 匯出、還原（和網頁版互通） | 網頁版的「手機外框」與「擷取畫面」按鈕（App 用系統截圖即可） |

---

## 2. 參考基準：pet_diary 的 Flutter 規格

以下是從 pet_diary 讀出來、Novaday 要沿用的規格。

### 2.1 SDK 與平台

| 項目 | pet_diary | Novaday |
|---|---|---|
| Flutter | stable channel（`.metadata` revision `05db9689…`） | 同一個 stable 版本開始；版本記在 README，升級時兩個 App 一起升 |
| Dart SDK | `>=3.5.0 <4.0.0` | 相同 |
| iOS 最低版本 | 15.0，只支援 iPhone（`TARGETED_DEVICE_FAMILY = 1`） | 相同 |
| Android | `minSdk 24`、`targetSdk` 用 Flutter 預設、Java 11、開啟 core library desugaring（`desugar_jdk_libs 2.1.4`） | 相同（desugaring 是 `flutter_local_notifications` 需要的） |
| Gradle | Kotlin DSL（`build.gradle.kts`） | 相同 |
| Bundle ID | `com.creativesky.petDiary`／`com.creativesky.pet_diary` | 建議 `com.creativesky.novaday`（兩平台相同，**待確認**，見第 15 節） |
| Lint | `flutter_lints ^6.0.0`，`analysis_options.yaml` 用預設規則 | 相同 |

### 2.2 架構分層（`lib/`）

pet_diary 的分層，Novaday 照著用：

```
lib/
├── main.dart                 啟動流程（見 6.4）
├── core/
│   ├── constants/            顏色、字級、尺寸、功能開關
│   ├── theme/                ThemeData、漸層
│   ├── router/               go_router 設定、路由名稱與路徑（AppRouteName／AppRoutePath）
│   ├── localization/         語言選項、locale 對應
│   ├── layout/               adaptive_layout（compact／medium／expanded 斷點）
│   ├── services/             平台服務：通知、備份、媒體儲存、定位、評分…
│   └── utils/                日期格式、驗證、ID 產生
├── data/
│   ├── local/                Drift 資料庫（app_database.dart + .g.dart）、DatabaseService
│   ├── models/               純 Dart 資料類別
│   └── repositories/         一個資料類型一個 repository，負責讀寫與轉換
├── providers/                Riverpod providers（StreamProvider 監看資料庫、Notifier 管畫面狀態）
└── ui/
    ├── screens/<頁面>/        一個頁面一個資料夾，子元件放 widgets/
    └── shared/widgets/        共用元件
```

Novaday 多一層 `lib/domain/`，放從網頁版 `src/js/logic/` 移植過來的純規則（不依賴 Flutter，方便和網頁版做對照測試，見第 8 節）。

### 2.3 沿用的寫法

| 主題 | pet_diary 的做法 | Novaday 照做 |
|---|---|---|
| 狀態管理 | Riverpod 2：`Provider` 提供 repository，`StreamProvider` 監看 Drift 查詢（例如 `settingsProvider`），衍生值再用 `Provider` 算（`darkModeProvider`） | 紀錄、個人資料、設定都用 `StreamProvider`；等級、徽章、星座進度是從紀錄算出來的 `Provider`，不另外存 |
| 資料庫 | Drift + `sqlite3_flutter_libs`，`schemaVersion` 遞增、寫 migration 測試 | 相同，第一版 `schemaVersion = 1` |
| 清單欄位 | `TypeConverter`（`ListStringConverter` 存成 JSON 字串） | 標籤、照片路徑、`conOrder` 照用 |
| 單例服務 | `DatabaseService.instance`，另有 `forTesting()` 工廠注入測試資料庫與資料夾 | 相同，所有服務都提供 `forTesting()` |
| 路由 | `StatefulShellRoute.indexedStack`，每個分頁一個 `navigatorKey`，分頁切換用 `NoTransitionPage`，全畫面頁面掛在 root navigator | 相同（見第 7 節） |
| 媒體路徑 | 曾經存絕對路徑，需要 `_relinkMediaPathsForCurrentDocumentsDirectory()` 修正（iOS 每次安裝的 Documents 路徑會變） | **一開始就只存相對路徑**（`photos/…`、`videos/…`），和備份格式一致，不需要重新連結 |
| 還原中斷 | 啟動時先 `recoverInterruptedRestore()` 再開資料庫 | 相同 |
| 開發者模式 | `DeveloperModeNotifier`：連點版本號碼計數 | 和網頁版「連點 7 次」相同，直接沿用 |
| 商店截圖 | `integration_test/app_store_screenshots_test.dart` + `--dart-define=APP_STORE_SCREENSHOT_MODE=true` | 相同，取代網頁版的截圖功能 |
| 字型 | 字型檔放在 `assets/fonts/`（Noto Sans HK／SC），不從網路下載 | 相同：Chakra Petch + Noto Sans TC／SC 放進 App，不用 `google_fonts` 執行時下載（離線可用、沒有對外連線） |
| 啟動畫面、圖示 | `flutter_native_splash`、`flutter_launcher_icons` | 相同，底色 `#070A1C`，圖示用 `assets/svg/brand/novaday_logo.svg` 轉出 |

### 2.4 和 pet_diary 不同的地方

| 主題 | pet_diary | Novaday | 原因 |
|---|---|---|---|
| 多語系 | 手寫的 `AppLocalizations` 類別（約 3,900 行，`text('key')` 查表） | `flutter gen-l10n` + ARB | Novaday 已經有網頁版自動匯出的 ARB 和 `content.json`，而且有測試確保沒有過期；手寫會和網頁版脫節 |
| 主題 | 淺色／深色可切換，Material 3 `ColorScheme.fromSeed` | **固定深色星空主題**，顏色全部來自 `design_tokens.json` | 網頁版只有深色 |
| 圖示 | `flutter_lucide`、`font_awesome_flutter` | `flutter_svg` 顯示 `assets/svg/ui_icons/` 的 99 個自有圖示 | 和網頁版一致 |
| 繁體 locale | `zh_Hant_HK` | `zh_Hant`（不帶地區） | ARB 檔名是 `app_zh_Hant.arb`；繁體同時給台灣與香港用 |

---

## 3. 網頁版現況盤點

網頁版約 4,500 行 JS（不含 vendor 與語言字典）、30 個面板、136 項以上的自動測試。

### 3.1 畫面與功能

| 區域 | 功能 | 網頁版檔案 |
|---|---|---|
| **星空（首頁）** | HUD（等級、XP、連續天數）、今日卡片、今日星語題目、一句話快記、每日任務、星座運勢卡、那年今日、回顧舊紀錄、月報卡片、背景星空動畫、目前星座的點亮進度 | `screens/home/*`、`ui/starfield.js` |
| **日記** | 列表／星曆（月曆）切換、顯示模式、搜尋與建議、`#標籤` 搜尋、篩選、分批載入、往下捲收合頂部、下拉重新整理 | `screens/log/*`、`ui/gestures.js` |
| **點亮（中央按鈕）** | 編輯器：標題、內文、心情 0–4、標籤、地點（城市附近）、題目、照片最多 10 張或 1 部影片、草稿與草稿暫存、指定日期補寫、不能寫未來 | `screens/editor.js` |
| **紀錄詳情** | 看圖器（縮放、滑動）、影片播放、收藏、編輯、刪除與復原、分享圖卡 | `screens/detail.js`、`ui/photo-viewer.js`、`features/share-card.js` |
| **圖鑑** | 88 星座卡片（已完成、進行中、未開始）、星座詳情、今晚觀星指引（依地區計算可見星座與方位）、指定下一座 | `screens/atlas/*`、`logic/sky-projection.js` |
| **我的** | 個人資料卡、階級輪播（28 階）、星線顏色（livery）、徽章牆 54 個與詳情、心情能量圖表、心情洞察、星光足跡 | `screens/me/*` |
| **慶祝畫面** | 徽章解鎖、星座完成（收藏卡片 → 收進圖鑑） | `ui/celebrations.js` |
| **報告** | 星空月報、年度回顧 | `features/reports/*` |
| **設定** | 語言、時間格式、每日提醒、減少動態效果、密碼鎖、地區、生日、標籤管理（合併、改名）、匯出與備份、還原、清除與重設（要輸入確認字）、評分、意見回饋、關於 | `screens/settings/*`、`features/backup/*`、`features/pin-lock.js` |
| **引導頁** | 語言、暱稱、頭像、生日、地區 | `screens/onboarding.js` |
| **開發者工具** | 動畫預覽、測試資料、快轉、模擬日期、極端緯度、剪影總覽、字級、FPS、資料檢視器、錯誤紀錄 | `features/dev-tools.js`、`core/dev-clock.js` |

### 3.2 已經為 Flutter 準備好的素材（`assets/`）

| 素材 | 狀態 | App 端的用法 |
|---|---|---|
| `data/*.json`（11 個資料檔） | 完整 | 直接放進 App；`constellations.json` 需要瘦身（見 9.3） |
| `l10n/`（ARB × 4、`content.json`、`l10n.yaml`） | 完整，有過期檢查測試 | `flutter gen-l10n` |
| `svg/`：頭像 23、階級徽章 28、星線 28、水晶徽章 108、徽章圖示 108、黃道 12、心情星 5、介面圖示 99、Logo | 完整 | `flutter_svg` |
| `svg/constellations/lit|unlit`（88 × 2） | 完整，但每個檔都內嵌插畫，共 80 MB | **不直接放進 App**，改成執行時繪製（見 9.3） |
| `webp/constellations/`（15 座重繪原檔） | 部分 | 和其餘 73 座一起整理成 88 張 WebP |
| `design/design_tokens.json`、`animations_keyframes.css` | 完整 | 轉成 `AppColors`、`AppTextStyles` 與動畫參數 |
| `screenshots/`（10 張 390×844 @2x） | 參考用 | 視覺比對 |

---

## 4. 技術選型（套件）

原則：**pet_diary 有用的套件沿用同一個版本範圍**，兩個 App 一起維護比較省事；Novaday 需要而 pet_diary 沒有的，建立專案時選當時的最新穩定版。

### 4.1 沿用 pet_diary

| 用途 | 套件 | Novaday 用在哪裡 |
|---|---|---|
| 狀態管理 | `flutter_riverpod ^2.6.1` | 全部 |
| 資料庫 | `drift ^2.30.1`、`drift_flutter ^0.2.8`、`sqlite3_flutter_libs ^0.5.41`；dev：`drift_dev`、`build_runner 2.7.1` | 紀錄、個人資料、設定、草稿 |
| 檔案位置 | `path_provider ^2.1.5`、`path ^1.9.1` | 照片影片、備份暫存 |
| 備份 | `archive ^4.0.7` | 讀寫 .zip（stored 與 deflate） |
| 雜湊 | `crypto ^3.0.7` | 密碼鎖 SHA-256，和網頁版的 `pinHash()` 相同（`'novaday:' + pin`） |
| 選照片影片 | `image_picker ^1.2.1` | 編輯器、照片頭像 |
| 選備份檔 | `file_selector ^1.1.0` | 還原（`backup-format.md` 建議 `file_picker`，改用 pet_diary 已驗證過的 `file_selector`） |
| 影片 | `video_player ^2.10.1`、`video_thumbnail ^0.5.6` | 播放、產生封面 |
| 權限 | `permission_handler ^12.0.1` | 通知、定位 |
| 看圖 | `photo_view ^0.15.0` | 看圖器縮放 |
| SVG | `flutter_svg ^2.0.10` | 所有圖像 |
| 路由 | `go_router ^17.0.1` | 全部 |
| 啟動畫面 | `flutter_native_splash ^2.4.7` | |
| 日期與數字 | `intl ^0.20.2`、`flutter_localizations` | 日期格式、ICU 複數 |
| 版本資訊 | `package_info_plus ^9.0.0` | 關於、意見回饋 |
| 分享 | `share_plus`（pet_diary 用 `^7.2.2`，建議兩邊一起升到目前的大版本） | 分享圖卡、匯出備份 |
| 通知 | `flutter_local_notifications ^20.0.0`、`timezone ^0.10.1`、`flutter_timezone ^4.1.1` | 每日提醒；`flutter_timezone` 也用來寫紀錄的 `tz` 欄位 |
| 定位 | `geolocator ^14.0.2` | 「城市附近」：取得大概位置後，用 `regions.json` 找最近的城市（不需要 `geocoding`） |
| 小設定 | `shared_preferences ^2.5.4` | 只放啟動前就要知道的旗標（例如是否顯示引導頁） |
| 圖示產生 | dev：`flutter_launcher_icons ^0.14.4` | |

### 4.2 Novaday 新增

| 用途 | 套件 | 說明 |
|---|---|---|
| 商店評分 | `in_app_review` | 取代網頁版模擬的評分視窗（architecture.md 第 12 節） |
| 寄信、開網頁 | `url_launcher` | 意見回饋 `mailto:`、商店頁面 |
| 裝置資訊 | `device_info_plus` | 意見回饋附上的裝置資訊 |
| 照片轉檔 | `flutter_image_compress` | HEIC 轉 JPEG、長邊 1600 px、品質 82（和網頁版相同，見 backup-format.md 第 10 節） |
| 生物辨識（選用） | `local_auth` | 密碼鎖可以用 Face ID／指紋解鎖，4 位數密碼仍是主要方式 |
| 頭像裁切 | 自行實作（`InteractiveViewer` + 圓形遮罩 + `RepaintBoundary` 輸出） | 網頁版的裁切面板很單純，不需要額外套件 |

### 4.3 pet_diary 有、Novaday 不用

`camera`、`record`、`audioplayers`、`photo_manager`、`ffmpeg_kit_flutter_new_min`、`carousel_slider`（改用 `PageView`）、`table_calendar`（星曆有月相與星座標記，自己畫）、`flutter_lucide`、`font_awesome_flutter`、`cached_network_image`、`shimmer`、`pdf`、`lottie`、`fluttertoast`（改用 `SnackBar`，要支援「復原」按鈕）、`geocoding`、`uuid`（紀錄 ID 照備份規格的字元規則產生）、`visibility_detector`。

> `ffmpeg_kit` 先不加。iPhone 錄的 HEVC `.mov` 在網頁版部分瀏覽器不能播，第一版在匯出時提示使用者；如果測試發現常見，再評估用 ffmpeg 轉成 H.264（App 會大約多 15–30 MB）。

完整的 `pubspec.yaml` 草案在附錄 A。

---

## 5. 專案結構

### 5.1 放在哪裡

建議**另開一個 repo**（`dominicshing/novaday_app`），和 pet_diary 一樣是獨立的 Flutter 專案；這個 repo 繼續放網頁版與素材。App repo 用 `tool/sync_web_assets.sh` 從這裡複製 `assets/`（指定 commit），每次同步都是一個獨立的 commit，方便追蹤素材版本。（待確認，見第 15 節。）

### 5.2 `lib/` 對照網頁版

```
lib/
├── main.dart
├── app.dart                                NovadayApp：MaterialApp.router、語言、主題、密碼鎖閘門
├── core/
│   ├── constants/
│   │   ├── app_colors.dart                 ← design_tokens.json
│   │   ├── app_text_styles.dart
│   │   ├── app_dimensions.dart
│   │   └── feature_flags.dart              ← SHOW_METEORS、SHOW_RED、SHOW_STORE、SHOW_TEXT_EXPORT（預設 false）
│   ├── theme/app_theme.dart、gradients.dart
│   ├── router/app_router.dart、route_names.dart
│   ├── localization/app_language.dart、content_localizations.dart（content.json 查詢）
│   ├── layout/adaptive_layout.dart         ← 直接沿用 pet_diary
│   ├── services/
│   │   ├── media_storage_service.dart      ← core/photo-store.js、media-store.js、mediaGC()
│   │   ├── backup_service.dart             ← features/backup/export.js、restore.js、core/zip.js
│   │   ├── reminder_service.dart           ← 每日提醒（新）
│   │   ├── pin_lock_service.dart           ← features/pin-lock.js
│   │   ├── location_service.dart           ← screens/settings/region.js、編輯器的定位
│   │   ├── share_card_service.dart         ← features/share-card.js
│   │   ├── feedback_service.dart           ← screens/settings/feedback.js
│   │   └── clock_service.dart              ← core/dev-clock.js（模擬日期，所有「今天」都從這裡取）
│   └── utils/date_format.dart、id_generator.dart、validators.dart
├── domain/                                 純 Dart，不 import Flutter
│   ├── xp_streak.dart                      ← logic/xp-streak.js
│   ├── achievement_rules.dart              ← logic/achievement-rules.js
│   ├── sky_projection.dart                 ← logic/sky-projection.js
│   ├── fortune.dart                        ← data/zodiac-fortune.js（seedRng 照原樣移植）
│   ├── missions.dart、memories.dart、insights.dart、reports.dart
│   └── static_data.dart                    載入 assets/data/*.json 的型別
├── data/
│   ├── local/app_database.dart、database_service.dart、sample_seed.dart
│   ├── models/entry.dart、profile.dart、device_settings.dart、draft.dart、novaday_backup.dart
│   └── repositories/entry_repository.dart、profile_repository.dart、settings_repository.dart、draft_repository.dart、review_repository.dart、meta_repository.dart
├── providers/                              entries、profile、settings、progress（XP／等級／徽章／星座）、today、search_filter、draft…
└── ui/
    ├── screens/
    │   ├── main_navigation_screen.dart     分頁列＋中央「點亮」按鈕
    │   ├── home/、log/、atlas/、me/、settings/
    │   ├── editor/、detail/、onboarding/、reports/、lock/、dev_tools/
    └── shared/
        ├── widgets/                        entry_card、mood_star、rank_badge、crystal_badge、bottom_sheet、snackbar…
        └── painters/                       starfield、constellation_map、constellation_reveal、energy_chart、footprint、progress_ring
```

測試資料夾和 `lib/` 同結構（pet_diary 的 `test/core|data|providers|ui` 做法）。

---

## 6. 資料層設計

### 6.1 Drift 資料表

網頁版的 localStorage／IndexedDB 對應到 SQLite 資料表和 App 私有資料夾的檔案。

| 資料表 | 欄位 | 對應網頁版 | 進備份 |
|---|---|---|---|
| `Entries` | `id` TEXT PK、`date` TEXT（`YYYY-MM-DD` 當地日期）、`time` TEXT、`tz`、`title`、`body`、`mood` INT、`tags` JSON、`loc`、`prompt`、`fav`、`edited`、`sample`、`photos` JSON（相對路徑，第一張是封面）、`videoId`、`videoDur`、`videoType`、`videoFile`、`videoPoster`、`createdAt`、`updatedAt` | `orbitlog.entries.v1` | ✅ |
| `Profile`（單列） | `avatar`、`photoAv`、`name`、`ship`、`motto`、`since`、`birthday`、`regionName`、`regionLat`、`regionLon`、`livery`、`conOrder` JSON、`nextPick`、`lang` | `orbitlog.profile.v1` 中屬於個人資料的欄位 | ✅ |
| `DeviceSettings`（單列） | `remind`、`remindTime`、`timeFormat`（12／24）、`calm`（減少動態效果）、`red`、`listMode`、`pinHash`、`biometric` | `orbitlog.profile.v1` 中屬於裝置的欄位 | ❌（backup-format.md 第 8 節） |
| `Reviews` | `entryId` PK、`firstDate` | `orbitlog.reviews.v1.ids` | ✅ |
| `Drafts` | `slot`（`main`／`stash`）PK、`json`、`updatedAt` | `orbitlog.draft.v1`、`draft.stash.v1` | ❌ |
| `AppMeta`（鍵值） | `key` PK、`value` | `reviews.last`、`seeded`、新徽章紅點、報告已讀、運勢延後、最近題目、最近搜尋、開發者工具設定 | 只有 `reviews.last` |

- 欄位名稱、限制（字數、標籤數、照片數）完全照 backup-format.md 第 3、4 節，驗證寫在 `validators.dart`，匯入與一般存檔共用（網頁版的 `cleanEntry()`、`cleanProf()`）。
- `date` 一律存字串，**不轉成時間戳記**，避免跨時區差一天。排序用 `date + time` 字串。
- 等級、XP、連續天數、徽章、星座進度都**不存**，由 provider 從 `Entries`、`Reviews`、`conOrder` 算出（和網頁版相同）。
- 讀到格式錯誤的列時修正並保留原始資料（網頁版的 `entries.broken.v1`），App 不可以因為一筆壞資料打不開。

### 6.2 照片與影片

```
<ApplicationSupport>/media/
├── photos/<entryId>-<n>.jpg、<videoId>-poster.jpg、avatar.jpg
└── videos/<videoId>.mp4|.mov
```

- 放在 Application Support（iOS 不會出現在「檔案」App，仍會進 iCloud 裝置備份），路徑只存相對路徑。
- 新增照片：`image_picker` 選取 → `flutter_image_compress` 轉 JPEG、長邊 1600 px、品質 82 → 寫檔 → 存路徑。
- 新增影片：`image_picker.pickVideo` → 複製到 `videos/` → `video_thumbnail` 產生封面 → 讀長度。影片長度上限沿用網頁版設定。
- 啟動時做一次 `mediaGC()`：刪掉沒有被任何紀錄、草稿或頭像用到的檔案。
- 寫檔與寫資料庫的順序：先寫檔、再寫資料庫；失敗時刪掉剛寫的檔。

### 6.3 備份互通

照 [backup-format.md](backup-format.md) v1 實作，`platform` 寫 `"ios"` 或 `"android"`。

- **匯出**：在暫存資料夾用 `ZipFileEncoder` 以 stored 方式寫入 → `share_plus` 讓使用者存到「檔案」、iCloud Drive、Google 雲端硬碟 → 分享完刪除暫存檔。
- **還原**：`file_selector` 選 .zip → `InputFileStream` + `ZipDecoder` 串流讀取（大影片不整個讀進記憶體）→ 依第 7 節的合併規則產生預覽 → 使用者確認 → 在單一 transaction 寫入；失敗就回復。
- **中斷保護**：還原時先把檔案寫到 `media/.restore/`，並在 `AppMeta` 記下進行中；啟動時 `recoverInterruptedRestore()` 決定完成或清掉（pet_diary 的做法）。
- **驗收**：用網頁版匯出一份含照片頭像、多張照片、影片、收藏、地區經度、`tz` 的備份，在 App 還原逐項比對；再從 App 匯出、網頁版還原比對一次。這兩份測試檔放進 App 的 `test/fixtures/`。

### 6.4 啟動流程

照 pet_diary `main.dart` 的順序：

1. `WidgetsFlutterBinding.ensureInitialized()`、保留原生啟動畫面。
2. 初始化 `intl` 日期格式（`en`、`zh_Hant`、`zh_Hans`）、固定直式、`edgeToEdge`。
3. `BackupService.recoverInterruptedRestore()`。
4. `DatabaseService.instance.init()`：開資料庫 → 修正格式錯誤的列 → 第一次使用時放入範例紀錄（`seeded`）。
5. 載入 `assets/data/*.json` 與 `content.json` 到記憶體（只讀一次）。
6. `ReminderService` 依設定重新排程通知。
7. `mediaGC()` 在背景執行。
8. 移除啟動畫面 → `runApp(ProviderScope(child: NovadayApp()))`。
9. 第一個畫面：沒有完成引導 → 引導頁；有密碼鎖 → 鎖定畫面；之後才是首頁。

---

## 7. 路由與導覽

### 7.1 分頁

`StatefulShellRoute.indexedStack`，四個分頁各一個 navigator，中間的「點亮」按鈕不是分頁，而是 push 編輯器：

```
[ 星空 /home ] [ 日記 /log ] ( 點亮 ) [ 圖鑑 /atlas ] [ 我的 /me ]
```

- 再點一次目前的分頁：捲回最上面（網頁版行為）。
- 切到「星空」才啟動背景星空動畫，離開就暫停（網頁版 `galStart()`／`galStop()`）。
- Android 返回鍵：用 `PopScope` 處理；編輯器有未存內容時先詢問；在首頁以外的分頁按返回先回首頁（網頁版第 43 輪修正的問題）。

### 7.2 全畫面頁面（root navigator）

| 路徑 | 畫面 | 網頁版 |
|---|---|---|
| `/onboarding` | 引導頁 | `onboarding.js` |
| `/lock` | 密碼鎖（用 overlay 蓋住整個 App，不是一般路由） | `pin-lock.js` |
| `/entry/new?date=YYYY-MM-DD&quick=1` | 編輯器（新增、補寫、快記轉完整） | `#editor` |
| `/entry/:id` | 紀錄詳情 | `#detail` |
| `/entry/:id/edit` | 編輯器（編輯） | `#editor` |
| `/atlas/:abbr` | 星座詳情＋今晚觀星指引 | `tonight-guide.js` |
| `/fortune` | 運勢頁 | `#fortuneSheet` |
| `/reports/month/:ym`、`/reports/year/:y` | 月報、年度回顧 | `features/reports/*` |
| `/profile/edit` | 編輯個人資料 | `profile-editor.js` |
| `/settings`、`/settings/tags`、`/settings/backup`、`/settings/about` | 設定與子頁 | `settings/*` |
| `/dev` | 開發者工具 | `dev-tools.js` |

### 7.3 底部面板

網頁版的 `.layer` 面板在 App 用 `showModalBottomSheet`（共用一個 `NovadaySheet` 外觀：深色玻璃、圓角、拖曳把手），確認視窗用自訂 `showDialog`：

徽章詳情（`achSheet`）、星座完成卡片（`conSheet`）、分享圖卡（`shareSheet`）、地區（`regionSheet`）、生日滾輪（`bdQuick`，改用 `CupertinoPicker` 風格的自訂滾輪）、頭像來源與裁切（`avSrc`、`avOpt`、`cropSheet`）、月份選擇（`monthSheet`）、確認（`ask`）、清除與重設（`wipeSheet`，要輸入確認字）、意見回饋（`feedbackSheet`）、匯出與還原（`exporter`、`importSheet`）。

不移植：`storeSheet`（改用系統評分）、`screenshotSheet`、開發者工具裡模擬商店評分與螢幕尺寸的面板。

---

## 8. 規則移植與對照測試

這是整個移植最需要小心的部分：**同一份資料在兩邊算出來的結果必須完全相同**，否則使用者從網頁版搬到 App 後，等級、徽章或星座會變。

### 8.1 要移植的規則

| 規則 | 網頁版 | Dart | 注意 |
|---|---|---|---|
| XP、等級、連續天數、回顧 XP | `logic/xp-streak.js`、`ranks.json` 的公式 | `domain/xp_streak.dart` | 連續天數的「今天」從 `ClockService` 取（支援模擬日期） |
| 徽章 54 個的條件與進度 | `logic/achievement-rules.js`、`achievements.json` 的原始 JS | `domain/achievement_rules.dart` | 每個徽章一個函式，名稱和 `achievements.json` 的 id 對應 |
| 星座投影、季節、可見度、點亮順序 | `logic/sky-projection.js`（`conProj()`、`consState()`） | `domain/sky_projection.dart` | `conOrder` 要完整保留 |
| 每月運勢 | `data/zodiac-fortune.js` 的 `seedRng` | `domain/fortune.dart` | 見 8.2 |
| 每日任務、那年今日、心情洞察、月報、年度回顧 | `screens/home/*`、`screens/me/insights.js`、`features/reports/*` 中的計算 | `domain/*.dart` | 先把計算從畫面程式抽出來再移植 |

### 8.2 JavaScript 與 Dart 的差異（容易出錯）

- **32 位元整數**：JS 的位元運算（`|0`、`>>>`、`<<`、`Math.imul`）都是 32 位元；Dart 原生平台的 `int` 是 64 位元。`seedRng` 這類演算法必須每一步都 `& 0xFFFFFFFF` 並自己處理有號轉換（寫成 `toInt32()`、`imul()` 小工具，單獨測試）。
- **四捨五入**：JS `Math.round(-2.5) = -2`，Dart `(-2.5).round() = -3`。移植時用 `(x + 0.5).floor()`。
- **月份**：JS `Date` 月份從 0 開始；`new Date(y, m, 32)` 會自動進位，Dart `DateTime` 也會進位但月份從 1 開始。
- **日期加減**：一律用當地日期字串和「日」為單位計算，不用 `Duration(hours: 24)`（遇到夏令時間會差一小時）。「那年今日」的月份推算規則照網頁版第 40 輪修正後的版本（3/31 的一個月前是 2/28 或 2/29）。
- **排序**：JS 的 `sort` 是穩定排序；Dart `List.sort` 不保證穩定，需要穩定時用 `mergeSort`（`package:collection`）或加上第二排序鍵。
- **字串長度**：JS `length` 算 UTF-16 單位，Dart `String.length` 也是；但「最多 20 字」這類限制若網頁版用 `[...s].length`（字元），Dart 要用 `s.characters.length`。逐一對照原始碼。

### 8.3 對照測試（golden fixtures）

在這個 repo 新增 `tools/export_fixtures.mjs`（和 `export-assets` 一樣用無頭瀏覽器執行網頁版），產生 `assets/fixtures/`：

| 檔案 | 內容 |
|---|---|
| `entries_*.json` | 幾組代表性的紀錄：空白、1 則、連續 30 天、斷掉又接上、跨年、400 則、各種心情與標籤 |
| `progress_*.json` | 每組紀錄在指定「今天」算出的 XP、等級、階級、連續天數、每個徽章的解鎖狀態與進度 |
| `constellations_*.json` | `conOrder`、每座點亮了幾顆星、指定地區與時間的投影座標與可見度 |
| `fortune.json` | 12 星座 × 24 個月的運勢文字 |
| `missions_memories.json` | 指定日期的每日任務與那年今日 |

App 端的 `test/domain/*_parity_test.dart` 讀這些檔案逐項比對（浮點數容許 1e-9）。網頁版改了規則就重新匯出，App 的 CI 會立刻失敗，提醒要一起改。

---

## 9. 視覺、動畫與圖像

### 9.1 主題

- 固定深色：`ThemeData(brightness: Brightness.dark, useMaterial3: true)`，`ColorScheme` 手動填入 `design_tokens.json` 的值，不用 `fromSeed`（會改變色相）。
- App 背景是三層放射漸層（`app_background_gradient_css`），用 `DecoratedBox` + 三個 `RadialGradient` 疊出來，放在 shell 最底層。
- 玻璃質感卡片：`surface` 半透明色 + `BackdropFilter`。`BackdropFilter` 很耗效能，清單中的卡片只用半透明色，只有面板和分頁列用模糊。
- 字型：英數字 Chakra Petch（400／500／600／700），中文 Noto Sans TC／SC 作為 `fontFamilyFallback`；字級與行高照 `typography`。
- 支援系統字級放大到 1.3 倍不破版（`MediaQuery.textScaler` 上限 1.3），對應網頁版開發者工具的「字級放大」。

### 9.2 圖像

| 圖像 | 做法 |
|---|---|
| 頭像、階級徽章、星線、黃道、心情星、介面圖示、Logo | `SvgPicture.asset`；單色圖示用 `ColorFilter` 換色 |
| 水晶徽章（已解鎖／未解鎖） | `SvgPicture.asset`；未解鎖的「進度液面」與光澤動畫用 `CustomPainter`，依 `crystal_star_path_100` 與 `crystal_colors` 重畫 |
| 星座圖、點亮進度 | `CustomPainter`（見 9.3） |
| 背景星空、流星 | `CustomPainter` + `Ticker`，星星位置用固定亂數種子產生 |
| 心情能量圖表、星光足跡、進度環 | `CustomPainter` |
| 分享圖卡 | 用 Flutter widget 排版 → `RepaintBoundary.toImage()` 輸出 PNG → `share_plus` |

`flutter_svg` 不支援 SVG 濾鏡（模糊、陰影），README「注意事項」已經說明替代畫法；需要光暈的地方在 Flutter 用 `MaskFilter.blur` 畫，比 SVG 的替代畫法更接近網頁版。

### 9.3 星座插畫（最大的一塊）

現況：`constellations.json` 有 40 MB、`svg/constellations/` 有 80 MB，都是因為每座都內嵌了 base64 插畫。直接放進 App 會讓下載大小超過 120 MB。

做法：

1. 在 `tools/export_assets.mjs` 加一步：把 88 張插畫輸出成 `assets/webp/constellations/<abbr>.webp`（760×600，2 倍的 `reference_frame`，品質約 80），並產生不含 `image_data_url` 的 `constellations.lite.json`。目標：插畫合計 15 MB 以內。
2. App 只放 WebP 和 lite JSON，不放 `svg/constellations/`。
3. `ConstellationRevealPainter` 在 380×300 的座標框中：
   - 畫 14% 亮度的剪影底影；
   - 依每顆已點亮主星的位置，用 24 px 柔邊的放射遮罩（`ShaderMask`／`BlendMode.dstIn`）揭露插畫；
   - 新點亮的星從主星向外擴散 1.8 秒；
   - 全部點亮後 5 秒循環呼吸（亮度變化；天貓座另外改變光暈與輪廓）；
   - 星點、連線用 `conProj()` 投影座標畫在上層。
4. 首頁、圖鑑、完成卡片、分享圖都用同一個 painter 和同一個座標框（和網頁版相同）。
5. 「減少動態效果」開啟時（App 設定或系統的 `MediaQuery.disableAnimations`）顯示靜態插畫。
6. 驗收：用網頁版的開發者工具和 App 的開發者工具，對 88 座在 0%、50%、100% 三種進度截圖並排比對（golden test）。

### 9.4 動畫

`animations_keyframes.css` 的動畫逐一轉成 `AnimationController` + `Curve`（時間與緩動照抄）。常見的：星星閃爍、FAB 軌道、水晶光澤、黃道轉動環、慶祝畫面的粒子、XP 條增加、數字滾動。

- 所有動畫元件都讀 `reduceMotionProvider`（App 設定 OR 系統設定），開啟時直接顯示結束狀態。
- 背景動畫在 App 進入背景（`AppLifecycleState.paused`）和離開首頁時停止，避免耗電。
- 效能目標：中階 Android（例如 Pixel 6a）首頁捲動維持 60 fps；用 `flutter run --profile` 和 DevTools 檢查，背景星空與星座圖包在 `RepaintBoundary` 裡。

---

## 10. 多語系

1. App repo 的 `l10n.yaml` 指向 `assets/l10n/`（從這個 repo 同步過來的 ARB，**不在 App 裡手動修改**）。
2. `MaterialApp.router` 設定 `localizationsDelegates`、`supportedLocales`，語言解析規則照 README「介面語言」一節：英文 → `en`；`zh_CN`、`zh_SG` 或標明 `Hans` → 簡體；其他中文與其他語言 → 繁體。
3. 使用者選擇的語言存在 `Profile.lang`（`zh-Hant`、`zh-Hans`、`en`，和網頁版 `prof.lang` 相同，備份互通）；「跟隨系統」用 `null`。切換語言不用重新啟動，Riverpod 讓 `MaterialApp` 重建即可。
4. 內容資料（星座名、心情、階級、徽章、運勢、題目、頭像、城市）用 `ContentLocalizations.of(context)` 從 `content.json` 依鍵查。
5. 28 則含 `<b>`、`<br>` 的訊息（ARB 標了 `x-markup`）：寫一個 `MarkupText` 元件，只支援 `<b>`、`<br>`，轉成 `TextSpan`，不引入 `flutter_html`。
6. 日期時間一律用 `intl` 的 `DateFormat`，對照表在 architecture.md 第 11 節；12／24 小時制依 `DeviceSettings.timeFormat`。
7. 使用者寫的內容不翻譯；範例紀錄（`sample`）與沒改過的預設暱稱、座右銘跟著介面語言顯示（和網頁版相同）。
8. 測試：照網頁版的 `i18n-crawl` 做法寫一個 integration test，以三種語言各走一輪主要流程，收集畫面上的文字，英文介面不能出現中文、簡體介面不能出現繁體字。
9. iOS 的 `Info.plist` 加 `CFBundleLocalizations`（`zh-Hant`、`zh-Hans`、`en`），權限說明文字用 `InfoPlist.strings` 翻譯三種語言；Android 的 `res/values-zh-rTW` 等放 App 名稱。

---

## 11. 平台功能對照

| 網頁版 | App | 說明 |
|---|---|---|
| localStorage、IndexedDB | Drift、App 私有資料夾 | 第 6 節 |
| 兩個分頁同時開的同步 | 不需要 | App 只有一個執行個體；改用 Drift 的 `watch()` 讓各畫面自動更新 |
| 過夜後的跨日更新 | `AppLifecycleState.resumed` 時檢查日期 + 午夜的 `Timer` | 更新 `todayProvider`，所有「今天」相關的畫面跟著重算 |
| 每日提醒（只有設定，不會真的通知） | `flutter_local_notifications` 每天定時通知 | 開啟時才請求通知權限；被拒絕時開關維持關閉並說明如何到系統設定開啟。點通知打開編輯器（pet_diary `DiaryReminderService` 的指令串流做法） |
| `navigator.geolocation`（只取城市附近） | `geolocator`，`LocationAccuracy.low` | 只要粗略位置：Android 只宣告 `ACCESS_COARSE_LOCATION`；取得後找 `regions.json` 最近的城市，不存精確座標 |
| 密碼鎖（4 位數、SHA-256、背景超過 1 分鐘重新上鎖、背景時遮住畫面） | 相同規則 + 可選生物辨識 | `AppLifecycleState.inactive` 時蓋上遮罩（App 切換器不會看到日記）；上鎖時後方畫面不可操作。忘記密碼的流程照網頁版 |
| `navigator.share`、`canShare` | `share_plus` | 分享圖卡、匯出備份 |
| `navigator.clipboard` | `Clipboard.setData` | 意見回饋「複製內容」 |
| `navigator.vibrate` | `HapticFeedback` | 點亮、慶祝 |
| 模擬的商店評分視窗 | `in_app_review.requestReview()`（完成一座星座等開心的時刻）、設定裡用 `openStoreListing()` | 系統會限制顯示次數，介面不顯示星數 |
| 意見回饋寄信 | `url_launcher` 開 `mailto:`；附 `package_info_plus`、`device_info_plus` 的資訊 | 不含日記內容 |
| 下拉重新整理 | `RefreshIndicator`（換成星空風格的指示器） | |
| 鍵盤快捷鍵、焦點框 | 不需要 | 保留 `Semantics` 標籤給 VoiceOver／TalkBack |
| 手機外框預覽、擷取畫面 | 不移植 | 商店截圖用 integration test 產生 |
| 開發者工具的螢幕尺寸、觸控範圍、FPS | 用 Flutter 內建（`showPerformanceOverlay`、`debugPaintSizeEnabled`） | 開發者工具保留：動畫預覽、88 星座逐顆點亮、測試資料、快轉、模擬日期、極端緯度、資料檢視器、錯誤紀錄 |

### 11.1 iOS 設定

- `Info.plist` 權限說明（只放真的會用到的）：
  - `NSPhotoLibraryUsageDescription`：選擇日記照片與影片（`image_picker` 在 iOS 14+ 用 PHPicker，通常不需要完整相簿權限）
  - `NSCameraUsageDescription`、`NSMicrophoneUsageDescription`：只有在提供「拍照／錄影」時才加
  - `NSLocationWhenInUseUsageDescription`：「填入你附近的城市」
  - `NSFaceIDUsageDescription`：有做生物辨識時才加
  - `NSPhotoLibraryAddUsageDescription`：儲存分享圖卡到相簿
- `PrivacyInfo.xcprivacy`：宣告 UserDefaults（`shared_preferences`）、檔案時間戳記、磁碟空間等 Required Reason API；不追蹤、不收集資料。
- 直式、只支援 iPhone，`UIRequiresFullScreen`。

### 11.2 Android 設定

- 權限：`POST_NOTIFICATIONS`、`RECEIVE_BOOT_COMPLETED`（重開機後恢復提醒）、`ACCESS_COARSE_LOCATION`、`USE_BIOMETRIC`（選用）。
- **不需要** `READ_MEDIA_IMAGES`／`READ_MEDIA_VIDEO`：`image_picker` 在 Android 13+ 使用系統照片挑選器（Google Play 也要求只選照片的 App 改用挑選器）。這點和 pet_diary 不同（pet_diary 有瀏覽整個相簿的功能）。
- 提醒用一般的每日排程（`AndroidScheduleMode.inexactAllowWhileIdle`），不需要 `SCHEDULE_EXACT_ALARM`。
- 返回鍵：Android 14 的預測返回手勢（`enableOnBackInvokedCallback`）配合 `PopScope`。
- Release 簽章設定 `key.properties`（pet_diary 目前 release 仍用 debug 簽章，Novaday 第一版就設定正式簽章）。

---

## 12. 測試策略

| 層級 | 內容 | 工具 |
|---|---|---|
| 規則對照測試 | 第 8.3 節，所有 golden fixtures | `flutter test test/domain/` |
| 資料層 | repository 讀寫、格式錯誤修正、migration（`schemaVersion` 每次加 1 都要寫測試） | `drift` 的記憶體資料庫、`DatabaseService.forTesting()` |
| 備份 | 網頁版匯出的 zip 還原、App 匯出再還原、合併規則（重複判斷、範例紀錄、影片補回、空間不足回復）、路徑安全（`../`、ZIP64） | `test/core/services/backup_service_test.dart` |
| Widget | 每個畫面的空白、1 則、400 則；字級 1.3 倍；小螢幕（320 寬）不溢出 | `flutter test`，`tester.view.physicalSize` |
| Golden | 星座插畫 88 座 × 3 種進度、水晶徽章、階級徽章、分享圖卡 | `matchesGoldenFile` |
| Integration | 網頁版 `journey*.test.mjs` 的流程：寫、編輯、搜尋、刪除與復原、照片、草稿、快記、補寫、標籤合併、月曆、密碼鎖、清除與重設、三種語言 | `integration_test`，iOS 模擬器與 Android 模擬器 |
| 商店截圖 | 各語言、6.7 吋與 6.1 吋 iPhone、Android 手機 | `integration_test/app_store_screenshots_test.dart` |
| 實機 | iPhone（iOS 15 最舊版本、最新版本）、Android（API 24、最新），每個里程碑結束時手動走一輪 | 檢查清單 |

CI：GitHub Actions 跑 `flutter analyze`、`flutter test`、`dart run build_runner build --delete-conflicting-outputs` 後檢查沒有未提交的產生檔；integration test 在合併到 main 前手動或排程執行。

---

## 13. 里程碑與時程

以一位全職開發者估算，約 **15 週**。每個里程碑結束時可以在 TestFlight／Google Play 內部測試安裝。

| 里程碑 | 週數 | 內容 | 完成條件 |
|---|---|---|---|
| **M0 專案骨架** | 1 | 建 repo、`flutter create`、照 pet_diary 設定 iOS 15／minSdk 24／Java 11、套件、lint、CI、素材同步腳本、字型、主題、空白的四個分頁與中央按鈕、啟動畫面與圖示 | 兩平台都能安裝並切換分頁 |
| **M1 資料層與備份** | 2 | Drift 資料表、repositories、providers、媒體儲存與 GC、範例紀錄、備份匯出與還原 | 網頁版備份可以在 App 完整還原，反之亦然 |
| **M2 規則移植** | 2 | `domain/` 全部規則、`export_fixtures.mjs`、對照測試 | 所有 fixtures 比對通過 |
| **M3 寫與讀** | 3 | 編輯器（照片、影片、標籤、心情、題目、地點、草稿）、紀錄詳情、看圖器、日記列表、搜尋篩選、星曆 | 網頁版 journey 測試的寫、讀、搜尋流程在 App 通過 |
| **M4 星空與成就** | 3 | 首頁全部卡片、背景星空、星座插畫 painter、圖鑑、今晚觀星、我的頁（階級、徽章、圖表、足跡）、慶祝畫面 | 88 座 golden 比對通過；首頁 60 fps |
| **M5 其餘功能** | 2 | 設定全部、密碼鎖、每日提醒、分享圖卡、月報、年度回顧、引導頁、評分、意見回饋、清除與重設、開發者工具 | 所有網頁版功能都有對應 |
| **M6 品質** | 1 | 三種語言巡檢、VoiceOver／TalkBack、字級、小螢幕、效能、記憶體（400 則＋大量照片）、錯誤紀錄 | 檢查清單全部通過 |
| **M7 上架** | 1 | 商店截圖、說明文字（三種語言）、隱私權政策與支援頁（pet_diary 的 `docs/privacy.md`、`docs/index.md` 格式）、App Privacy／Data safety 問卷、送審 | 兩個商店審核通過 |

M3 與 M4 可以兩人並行（一人做資料流程畫面，一人做星座圖與動畫），整體可縮短到約 11 週。

---

## 14. 風險與對策

| 風險 | 影響 | 對策 |
|---|---|---|
| 星座插畫檔案太大（目前 120 MB） | App 下載太大、審核或使用者流失 | 9.3 的瘦身流程，目標整個 App 下載 < 60 MB；不夠時再降低 WebP 品質或改成首次啟動下載（會需要網路，不建議） |
| 規則移植有細微差異 | 搬家後等級、徽章、星座不同，使用者會覺得資料壞了 | 8.3 的對照測試是 M2 的完成條件，之後每次同步素材都重跑 |
| 星座揭露效果在 Flutter 的效能 | 低階 Android 卡頓 | 揭露遮罩只在進度改變時重畫並快取成 `ui.Image`；呼吸效果只改透明度 |
| 網頁版持續更新 | App 落後 | 網頁版仍是唯一來源；素材同步腳本 + l10n 過期測試 + fixtures 對照測試在 App CI 擋下 |
| HEIC 照片、HEVC 影片 | 網頁版看不到從 App 匯出的照片或影片 | 照片一律轉 JPEG；影片在匯出時偵測 HEVC 並提示（之後視情況加轉檔） |
| 通知權限被拒絕、iOS 背景限制 | 提醒不出現 | 開啟時才請求，被拒絕時清楚說明；每次啟動重新排程 |
| 商店審核：沒有帳號的日記 App 被認為功能太少 | 被退件 | 送審說明強調星座收集、觀星指引、報告等功能；附上示範影片 |

---

## 15. 待確認事項

開始 M0 之前需要你決定：

1. **Repo**：另開 `novaday_app` repo（建議），還是放在這個 repo 的 `app/` 資料夾？
2. **Bundle ID 與開發者帳號**：沿用 pet_diary 的 `com.creativesky` 前綴（建議 `com.creativesky.novaday`），用同一個 Apple Developer 與 Google Play 帳號？
3. **App 名稱**：商店名稱用「Novaday」，還是加副標（例如「Novaday 星空日記」）？
4. **拍照／錄影**：編輯器要不要提供直接拍照、錄影（會多相機與麥克風權限），還是只從相簿選？網頁版目前只能選檔案。
5. **生物辨識解鎖**：第一版要不要做？
6. **影片轉檔**：要不要第一版就加 `ffmpeg_kit` 把 HEVC 轉成 H.264（App 會變大），還是先只提示？
7. **平板**：第一版是否只上架 iPhone（和 pet_diary 相同），Android 平板也先不最佳化？
8. **開發者工具**：正式版是否保留（和網頁版一樣連點版本號碼開啟），還是只在 debug／TestFlight 版本出現？

---

## 附錄 A：`pubspec.yaml` 草案

```yaml
name: novaday
description: Novaday — 每天點亮一顆新星的星空日記
publish_to: 'none'
version: 1.0.0+1

environment:
  sdk: '>=3.5.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter
  flutter_localizations:
    sdk: flutter

  # State Management
  flutter_riverpod: ^2.6.1

  # Database & Storage
  drift: ^2.30.1
  sqlite3_flutter_libs: ^0.5.41
  drift_flutter: ^0.2.8
  path_provider: ^2.1.5
  shared_preferences: ^2.5.4
  archive: ^4.0.7
  crypto: ^3.0.7

  # Media
  image_picker: ^1.2.1
  flutter_image_compress: any   # 建立專案時固定成當時的穩定版
  file_selector: ^1.1.0
  video_player: ^2.10.1
  video_thumbnail: ^0.5.6
  photo_view: ^0.15.0
  permission_handler: ^12.0.1

  # UI
  flutter_svg: ^2.0.10

  # Navigation
  go_router: ^17.0.1

  # Native Splash Screen
  flutter_native_splash: ^2.4.7

  # Utilities
  intl: ^0.20.2
  path: ^1.9.1
  collection: any
  package_info_plus: ^9.0.0
  device_info_plus: any
  share_plus: any               # 和 pet_diary 一起升級到同一個大版本
  url_launcher: any
  in_app_review: any
  local_auth: any               # 待確認（第 15 節第 5 項）

  # Notifications
  flutter_local_notifications: ^20.0.0
  timezone: ^0.10.1
  flutter_timezone: ^4.1.1

  # Location
  geolocator: ^14.0.2

dev_dependencies:
  flutter_test:
    sdk: flutter
  integration_test:
    sdk: flutter
  flutter_lints: ^6.0.0

  # Code generation
  build_runner: 2.7.1
  drift_dev: ^2.30.1
  flutter_launcher_icons: ^0.14.4

flutter:
  uses-material-design: true
  generate: true
  assets:
    - assets/data/
    - assets/l10n/content.json
    - assets/svg/avatars/
    - assets/svg/rank_badges/
    - assets/svg/rank_ships/
    - assets/svg/achievement_crystals/
    - assets/svg/achievement_icons/
    - assets/svg/achievement_icons_locked/
    - assets/svg/zodiac_glyphs/
    - assets/svg/mood_stars/
    - assets/svg/ui_icons/
    - assets/svg/brand/
    - assets/webp/constellations/
    - assets/sample/
  fonts:
    - family: ChakraPetch
      fonts:
        - asset: assets/fonts/chakra_petch/ChakraPetch-Regular.ttf
        - asset: assets/fonts/chakra_petch/ChakraPetch-Medium.ttf
          weight: 500
        - asset: assets/fonts/chakra_petch/ChakraPetch-SemiBold.ttf
          weight: 600
        - asset: assets/fonts/chakra_petch/ChakraPetch-Bold.ttf
          weight: 700
    - family: NotoSansTC
      fonts:
        - asset: assets/fonts/noto_sans_tc/NotoSansTC-Regular.ttf
        - asset: assets/fonts/noto_sans_tc/NotoSansTC-Bold.ttf
          weight: 700
    - family: NotoSansSC
      fonts:
        - asset: assets/fonts/noto_sans_sc/NotoSansSC-Regular.ttf
        - asset: assets/fonts/noto_sans_sc/NotoSansSC-Bold.ttf
          weight: 700

flutter_native_splash:
  color: '#070A1C'
  image: assets/images/splash_logo.png
  android: true
  ios: true
  fullscreen: true
  android_12:
    image: assets/images/splash_logo.png
    color: '#070A1C'
    icon_background_color: '#070A1C'

flutter_launcher_icons:
  android: true
  ios: true
  image_path: assets/icons/app_icon.png
  adaptive_icon_background: '#070A1C'
  adaptive_icon_foreground: assets/icons/app_icon_foreground.png
  min_sdk_android: 24
  remove_alpha_ios: true
```

- `assets/svg/constellations/` 與 `assets/png/` **不放進 App**（第 9.3 節；PNG 只是 SVG 的備用版本）。
- `any` 的套件在 M0 建立專案時改成固定的 `^x.y.z`，並記錄在 README。

## 附錄 B：這個 repo 需要配合的修改

App 開工後，網頁版這邊需要做的事（每一項各自一個 PR）：

1. `tools/export_assets.mjs`：輸出 88 張 `webp/constellations/*.webp` 與 `constellations.lite.json`（第 9.3 節）。
2. 新增 `tools/export_fixtures.mjs` 與 `npm run export-fixtures`，產生 `assets/fixtures/`；加一個測試檢查 fixtures 沒有過期（同 `l10n.test.mjs` 的做法）。
3. 把每日任務、那年今日、心情洞察、月報、年度回顧的計算從畫面程式抽到 `src/js/logic/`，讓 fixtures 能直接呼叫（只搬位置，不改行為）。
4. `src/js/core/config.js` 的 `FEEDBACK.store` 在上架後填入商店網址。
5. README 的「Flutter 使用方式」改成指向 App repo 與這份規劃書。
