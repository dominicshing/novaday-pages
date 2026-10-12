# Novaday Flutter iOS 與 Android App 遷移規劃書

版本：草案 1.0　｜　日期：2026-10-11　｜　對象：產品負責人、Flutter 開發者與測試人員

建議以獨立 Flutter 專案建立 Novaday 手機 App，沿用 pet_diary 的 **Riverpod、Drift／SQLite、go_router、本機媒體與服務分層**，保留 Novaday 的星空日記體驗、離線資料模式及 Web 備份互通能力。介面與動畫以 Flutter 重建，內容素材和業務規則從現有 Web 專案移植。

首版目標是現有可見功能的完整移植，加上真正可用的系統通知、原生相片／影片操作及系統分享。建議按「技術驗證 → 可寫日記的 Alpha → 功能完整的 Beta → 雙平台上架」推進；以一位熟悉 Flutter 的全職開發者估算，約 **12–16 個開發週**，商店審核與外部帳號準備時間另計。

## 1. 規劃依據與邊界

本規劃中的 Flutter Spec，指 pet_diary 實際使用的套件、平台設定、資料架構及工程慣例。該專案未見獨立命名為 Flutter Spec 的規格文件，因此以原始碼為準。

| 基準 | 查核結果 |
|---|---|
| Novaday Web | 本機乾淨工作目錄，commit `a0ebb58e0d75f8ba09cc680c0af841efd5abd8e6` |
| pet_diary | GitHub 最新 commit 與本機一致：`4fc2e60c486d80453d0f7113b5a6aa4a7f6be6a2` |
| Novaday 現況 | 原生 HTML／CSS／JavaScript；localStorage 儲存紀錄，IndexedDB 儲存媒體；無應用後端 |
| 已有移植基礎 | Flutter 素材、設計 tokens、三語 ARB、備份格式 v1、Web 自動測試 |
| 本次交付 | 規劃與開發驗收依據；套件組合、效能及原生建置仍須在第 0 階段實測 |

首版採以下工作假設，可在啟動時調整：保留 Web 版；新建 `novaday_app` 獨立 repository；以手機為主要介面；不設帳號、不提供自動跨裝置同步、不加入訂閱或廣告。iPad／Android 平板維持可用且不溢位，專用平板雙欄體驗列為後續版本。

## 2. pet_diary 技術規格與採用方式

以下版本是 pet_diary 的宣告值，**不是 Novaday 已驗證的依賴清單，也不代表最新版本**。來源：[pet_diary pubspec.yaml](https://github.com/dominicshing/pet_diary/blob/4fc2e60c486d80453d0f7113b5a6aa4a7f6be6a2/pubspec.yaml)。

| 項目 | pet_diary 使用方式 | Novaday 決策 |
|---|---|---|
| Dart／Flutter | pubspec 宣告 Dart `>=3.5.0 <4.0.0`；lockfile 要求 Dart `>=3.9.0 <4.0.0`、Flutter `>=3.35.0` | 第 0 階段鎖定一個通過雙平台建置的 stable SDK；不能把 Dart 3.5 當成實際可用下限 |
| 狀態管理 | `flutter_riverpod ^2.6.1`；Provider、StreamProvider、動作服務 | 沿用 2.6.1 作初始驗證基準，將資料串流、衍生狀態和寫入操作分開；大版本升級另立工作項 |
| 資料庫 | `drift ^2.30.1`、`drift_flutter ^0.2.8`、`sqlite3_flutter_libs ^0.5.41`；實作使用 NativeDatabase | 採 Drift／SQLite，重新設計 Novaday schema；選定一條資料庫開啟路徑，避免重複配置 |
| 導覽 | `go_router ^17.0.1`、`StatefulShellRoute.indexedStack` | 四個主分頁保持各自狀態；編輯器、詳細頁與設定使用根導覽堆疊 |
| 媒體 | `image_picker ^1.2.1`、`camera ^0.11.3`、`video_player ^2.10.1`、`photo_view ^0.15.0` | 先採系統選取／拍攝、播放及看圖；自訂相簿與 camera UI 只在有明確需要時加入 |
| 檔案與備份 | `path_provider ^2.1.5`、`archive ^4.0.7`、`file_selector ^1.1.0`、`share_plus ^7.2.2` | 沿用服務劃分與中斷復原方法；匯入／匯出格式必須使用 Novaday v1 |
| 圖形與月曆 | `flutter_svg ^2.0.10`、`table_calendar ^3.2.0` | SVG 用於靜態圖示；星座用 CustomPainter；月曆先驗證能否完整呈現心情、星點與選取狀態 |
| 提醒 | `flutter_local_notifications ^20.0.0`、`timezone ^0.10.1`、`flutter_timezone ^4.1.1` | 每日提醒以本機通知實作，跟隨使用者當地時間 |
| 多語 | `flutter_localizations`、`intl ^0.20.2`；自訂 AppLocalizations | 使用 Novaday 已匯出的 ARB 與 `flutter gen-l10n`，不移植 pet_diary 的字典系統 |
| 工程工具 | `flutter_lints ^6.0.0`、`build_runner 2.7.1`、`drift_dev ^2.30.1`、flutter_test／integration_test | 沿用分析、產碼及分層測試；提交 App 的 lockfile |
| 啟動畫面與圖示 | flutter_native_splash、flutter_launcher_icons | 換成 Novaday 視覺與獨立 App ID |

目前 Riverpod 套件頁已列出 3.x，Drift 也有較新的 2.x；因此「參考 pet_diary」應保留架構一致性，而不是直接把所有依賴更新到最新版。建立成功的基準後再逐項更新，記錄 API 差異與原生設定變更。[Riverpod 套件資料](https://pub.dev/packages/flutter_riverpod)、[Drift 套件資料](https://pub.dev/packages/drift)。

### 平台與工具鏈

- 建議最低支援 **iOS 15、Android API 24**，與 pet_diary 實際設定一致。`flutter_launcher_icons.min_sdk_android: 21` 是圖示工具設定，不能當成 App 的最低 Android 版本。
- pet_diary 的 Android compileSdk／targetSdk 由 Flutter 提供；iOS Podfile 與 Xcode deployment target 都是 15.0。第 0 階段記錄實際 Flutter、Dart、Xcode、JDK、AGP、Gradle、Kotlin 及 SDK 版本。
- SDK 支援範圍與提交商店所需 SDK 是兩件事。最低支援版本可固定，targetSdk、Xcode 與原生套件條件須在建立及發布時重新確認。[Flutter 平台支援表](https://docs.flutter.dev/reference/supported-platforms)。
- pet_diary Android release 目前配置 debug signing；Novaday 上架必須建立自己的 release signing。也不能照搬其 `source_gen` override、iOS privacy manifest 覆寫或寵物專用原生程式碼。

平台設定來源：[Android build.gradle.kts](https://github.com/dominicshing/pet_diary/blob/4fc2e60c486d80453d0f7113b5a6aa4a7f6be6a2/android/app/build.gradle.kts)、[iOS Podfile](https://github.com/dominicshing/pet_diary/blob/4fc2e60c486d80453d0f7113b5a6aa4a7f6be6a2/ios/Podfile)、[pubspec.lock](https://github.com/dominicshing/pet_diary/blob/4fc2e60c486d80453d0f7113b5a6aa4a7f6be6a2/pubspec.lock)。

## 3. 首版功能範圍

Alpha 是內部可操作版本；下列 Beta 項目仍屬首版上架必要範圍，不能把完成 Alpha 當成遷移完成。

| 功能 | Alpha | 首版 Beta／上架驗收 |
|---|---|---|
| 引導與個人資料 | 初次引導、暱稱、頭像、生日、地區 | 範例資料可清除；照片頭像；資料與裝置設定分開重設 |
| 首頁 | 今日紀錄、快記、今日星語、基本星座進度 | HUD、任務、那年今日、運勢、升級與完成慶祝等可見流程 |
| 日記 | 新增／編輯／刪除／復原、心情、標籤、收藏、地點文字 | 搜尋與篩選、清單／星曆、標籤合併、指定日期補寫、跨年顯示 |
| 草稿 | 自動保存與重新開啟恢復 | 快記／補寫暫存原草稿，完成或取消後恢復；系統終止 App 後可恢復 |
| 照片與影片 | 多張照片、封面與看圖 | 最多 10 張照片或 1 段影片；拍攝／選取、播放、封面、轉檔與備份互通 |
| 星座圖鑑 | 88 座資料、靜態呈現、單一動態示範 | 全部逐星揭露、下一座選擇、完成收藏卡、今晚觀星指南與投影 |
| 成長系統 | XP、等級、連續天數 | 28 階級、54 成就、回顧 XP、徽章進度與塗裝 |
| 回顧與分享 | 基本紀錄分享圖 | 月報、年度回顧、完成卡與分享圖；系統分享與儲存圖片 |
| 備份與還原 | Web ZIP 匯入及預覽 | Web ↔ iOS ↔ Android 雙向互通；重複匯入、缺檔及中斷復原 |
| 設定 | 三語、12／24 小時制、減少動態效果 | PIN 鎖、系統每日通知、意見回饋、商店評分、三種清除／重設流程 |

首版不擴充雲端同步、社交分享平台、音訊日記、影片配樂、地圖打卡、AI 內容或付費系統。pet_diary 的寵物健康、藥物、音訊、地圖及影片合成模組均不屬本次範圍。

Web 已隱藏的流星雨標示、紅光模式、儲存空間頁及純文字匯出，保持隱藏；產品日後啟用時再另行驗收。開發者日期模擬、星座逐星預覽和資料檢查工具保留於開發版本。

## 4. 專案架構

沿用 pet_diary 易於理解的 core／data／providers／ui 分層，新增純 Dart domain，承接 Novaday 的計算規則。

```text
novaday_app/
  lib/
    main.dart
    app/                    # 啟動、生命週期、依賴組裝
    core/
      router/               # 主分頁、編輯器、通知導覽
      theme/                # tokens、字型、ThemeExtension
      services/             # 媒體、備份、通知、鎖、分享
      localization/         # 內容資料翻譯及 locale 決策
    domain/
      models/               # Entry、Profile、MediaRef、CalendarDate
      rules/                # XP、streak、成就、星座、運勢
    data/
      local/                # Drift schema、migration、DAO
      repositories/         # 日記、草稿、個人資料、設定、回顧
      codecs/               # NovadayBackupV1 與內容 JSON
    providers/              # 查詢串流、衍生狀態、操作控制器
    ui/
      screens/              # home、log、atlas、me、editor、settings
      shared/               # cards、sheets、media、dialogs
      painters/             # 星座、背景星空、水晶徽章
  assets/                   # 經驗證的手機版素材與 ARB
  test/                     # 規則、資料、widget、golden
  integration_test/         # 真機流程、備份與故障恢復
  tool/                     # 素材同步、fixture、版本驗證
```

讀取流程為 SQLite → Repository stream → Riverpod → Widget。寫入由操作控制器協調 Repository 與原生服務，資料成功提交後才更新衍生進度與顯示成功狀態。Widget 不直接操作 SQL、檔案或 ZIP。

XP、streak、成就、星座進度由資料計算，避免多存一份永久計數而失去一致性。`conOrder`／`nextPick` 是需要保存的產品狀態；Web 的 `consState()` 會順便修改順序，Flutter 要拆成「純查詢計算」和「明確提交排程」兩步，避免 Riverpod 重算或 Widget rebuild 改動資料。

四個主分頁為首頁、日記、圖鑑、我的。使用 StatefulShellRoute 保留捲動及篩選狀態；分頁不可見時停用動畫與影片。通知開啟編輯器前，先完成資料復原及解鎖；已有草稿時依草稿恢復規則處理。

## 5. 資料模型與媒體保存

| 儲存項目 | 建議內容與約束 |
|---|---|
| Entries | 沿用字串 id；date、time、tz、title、body、mood、loc、prompt、fav、edited、sample；新增內部 createdAt／updatedAt |
| EntryMedia | entryId、媒體 id、種類、相對路徑、排序、MIME、時長、封面；第一張照片是封面 |
| Tags／EntryTags | 保存使用者原文；搜尋、去重、重新命名與合併；順序語義與 Web 一致 |
| Profile | avatar、photoAv、name、ship、motto、since、birthday、region、livery、conOrder、nextPick |
| Reviews | entryId → 首次有效回顧日期，另存最後回顧日期 |
| Drafts | active／stash 草稿、建立入口、指定日期、媒體引用；持久化至資料庫 |
| DeviceSettings | 語言、時間制、減少動態、通知、畫面偏好等；一般偏好可用 shared_preferences |
| Secure storage | PIN 驗證材料及鎖相關敏感設定；不放入一般偏好或 v1 備份 |

日期必須區分「日記的當地日曆日期」與「技術事件時間戳記」。日記保存 `YYYY-MM-DD`、`HH:MM` 及可選 IANA `tz`；不經 UTC 轉換改變日記歸屬日期。編輯舊紀錄保留原 tz；生日沿用 `2000-MM-DD`。以可注入 Clock／時區服務處理跨日、旅行及測試。

照片、影片放 App 私有持久目錄，資料庫只存相對路徑。系統 picker 回傳的暫存路徑必須先複製；儲存或取消編輯時再確認媒體所有權。垃圾回收檢查日記、active／stash 草稿、刪除復原暫存及進行中的匯入，不能僅依目前清單刪檔。

圖片預設沿用 Web 的長邊 1600 px、JPEG 品質約 0.82；HEIC 先正確處理方向後轉 JPEG。影片以 H.264 MP4 作跨平台相容輸出目標；HEVC、MOV、WebM 等匯入必須實測解碼，必要時轉檔且保留來源直到成功。不可只改副檔名。第 0 階段決定轉檔方案，驗證 pet_diary 的 FFmpeg 套件能否滿足建置、套件大小及依賴授權條件，不能預設直接加入即可。

新 id 採符合備份限制的 UUID 表示法；影片用 `v` 加無連字號 UUID。匯入 id 保留原值。首版資料庫 schema 從 Novaday 的 v1 開始，不沿用 pet_diary 的 schema 版本或表格。

## 6. Web 資料遷移與備份相容

使用者路徑：Web 設定匯出完整 ZIP → 儲存到檔案或自行傳送 → App 選取備份 → 顯示匯入預覽 → 確認合併 → 比對紀錄與星座收藏。App 無法直接讀取瀏覽器的 localStorage／IndexedDB；單純安裝 App 不會自動搬入資料。

交換格式以現有 [備份格式規格](backup-format.md) 的 `novaday-backup.json`、`photos/`、`videos/` 為準。pet_diary 可參考的是 staging、journal、資料庫交易和中斷復原流程，不能套用其備份格式或整庫取代的語義。[pet_diary 備份服務](https://github.com/dominicshing/pet_diary/blob/4fc2e60c486d80453d0f7113b5a6aa4a7f6be6a2/lib/core/services/pet_diary_backup_service.dart)。

必須實作的相容條件：

1. 寫入 stored ZIP、UTF-8 檔名、v1 格式，整包不超過 4 GB；讀取支援 stored／deflate 與外包一層資料夾。
2. 依 id 或 date＋time＋title＋body 判斷既有紀錄，採合併不覆蓋；同包重複 id 只取第一筆。
3. 只有範例資料時匯入真實紀錄，按規格移除範例；個人資料是否套用由使用者勾選。
4. 完整保留 conOrder／nextPick；reviews 只在本機沒有回顧紀錄且勾選個人資料時套用。
5. 重複紀錄仍可按 video.id 補回缺失影片；缺少媒體時清楚列出，不把缺檔當成成功恢復。
6. PIN、草稿、提醒時間及其他裝置設定不放入 v1 備份；未知新增欄位及較新版本採可理解部分匯入並提示。
7. 路徑白名單、重複 ZIP 路徑、異常 manifest、解壓後大小與檔案數量須檢查；照片單檔上限沿用 20 MB。大檔使用串流及工作 isolate，並先估算暫存所需空間。

「資料庫 transaction」不能自動回復已寫入的媒體檔。匯入應先完成隔離暫存與驗證，建立持久 journal，再提交檔案與資料庫；任何階段被終止，下次啟動必須先恢復一致狀態才開啟一般資料查詢。匯出期間使用一致的資料快照，避免使用者編輯造成 JSON 與媒體不對應。

### 實作前需統一的既有差異

| 差異 | 已確認來源 | 建議處理 |
|---|---|---|
| 語言是否隨備份搬移 | architecture.md 描述語言值可共用，但 `BK_PROF` 與 cleanProf 未包含 lang | 首版以現行 v1 匯出行為為準，語言在新裝置重新選擇；若要搬移，另明確新增相容欄位與 Web 測試 |
| 塗裝範圍 | backup-format.md 寫 0–11，實際 RINFO 有 28 項，cleanProf 接受 0–27 | 第 0 階段將契約校正為目前 28 項並加 fixture；App 不得截斷高階塗裝 |
| 無效日期與時間 | 文件要求有效日曆日期／時間，Web 部分匯入檢查較寬鬆 | 為不存在日期、超出時間範圍建立 fixtures；統一驗證規則並提供可讀的略過原因 |

合併進已有 App 資料時，資料集合本來就會改變，不能承諾 XP／星座進度與單一來源完全相同。必須分別驗收「空白 App 完整還原一致」與「既有資料合併後依規則正確重算」，並在套用 conOrder 前說明可能影響既有收藏分配。

## 7. 業務規則移植

先輸出 Web 的固定輸入／預期結果 fixtures，再用同一組資料測試 Dart。不要憑 UI 文字重新推測公式，也不要把 JSON 裡的 JavaScript 字串當作可直接執行的 Dart 規則。

| 規則 | Web 來源 | 重要驗收案例 |
|---|---|---|
| XP 與等級 | `src/js/logic/xp-streak.js` | 每天首則 20、其餘 5；每多連續一天加成 2、上限 20；媒體 5、地點 5、星語 10、有效回顧 5；同日順序一致 |
| 連續天數 | 同上 | 週日為週首；每週最多休息一天，連續兩天中斷；補寫、刪除、跨週、閏日、今天尚未寫 |
| 升級與階級 | `src/js/data/moods-ranks.js` | 升至 L 級累積 XP 為 `100*(L-1)+25*(L-1)*(L-2)`；Lv.28 起階級封頂，等級仍可增加 |
| 成就 | `src/js/logic/achievement-rules.js` | 54 個條件與進度；新增、編輯、刪除、復原後重新計算 |
| 星座進度 | `src/js/logic/sky-projection.js` | 目前按紀錄數分配星點，不是每個日期只算一顆；一座所需紀錄數等於主星數 |
| 星座排序 | 同上 | 穩定保留 conOrder；指定下一座；刪除後回退；88 座全完成；純查詢不可改動順序 |
| 投影與觀星 | 同上及 `screens/atlas/tonight-guide.js` | 南北半球、極端緯度、經度缺省、赤經跨 0、跨午夜與夏令時間 |
| 運勢 | `src/js/data/zodiac-fortune.js`、fortune_texts.json | 相同月份、星座與種子得相同結果；Dart 明確模擬 JS 位元與無符號運算 |

排序、字串長度、四捨五入、負數餘數及 JS truthiness 都可能造成細微差異；fixtures 應包含同一時間多筆紀錄、空值、emoji、跨時區與新增欄位。先達成可解釋的一致性，再做效能優化。

## 8. 畫面、星座繪製與素材管線

### 可沿用的內容

現有素材包含 88 座星座資料與內嵌插畫、23 個頭像、28 個階級徽章、54 組成就的解鎖／未解鎖水晶、三語翻譯、10 張參考截圖，以及色彩和動畫規格。介面 ARB 範本目前有 1,308 則訊息；圖像與翻譯不必重新設計。

手機版保留背景 `#070A1C`、主色 `#8A7CFF`、輔色 `#6FE3D6` 及金星 `#FFE7A3`。英數使用 Chakra Petch，繁簡中文搭配合適的 CJK 字型；字型隨 App 打包並保留授權，確保離線顯示一致。Web 的裝置外框與假狀態列不進入 App。

### 素材去重是前置工作

本次量測儲存庫檔案，`assets/data/` 約 **39.56 MiB**，星座 lit／unlit SVG 合計約 **79.24 MiB**；數字是原始檔案大小，不是商店下載大小。88 座完整圖片都在 `constellations.json` 的 `figure.image_data_url`；獨立 `assets/webp/constellations/` 目前只有 15 個檔案，不能當成完整圖庫。

建立 mobile asset exporter：從完整來源抽出 88 張透明圖片，JSON 改成輕量相對路徑；保留 stars、lines、reference_frame 與 reveal 設定。App 只打包一份完整插畫，以渲染參數控制暗影／點亮，不再同時打包兩份含相同 base64 的 SVG。圖示仍可保留 SVG；逐項驗證相容性。[flutter_svg 相容性檢查方式](https://pub.dev/packages/flutter_svg)。

第一階段仍以 Web 為共用內容來源：固定 Web commit → 執行 export-assets／export-l10n → 產生手機素材 → 記錄來源 commit、內容版本與雜湊 → Flutter CI 驗證 88 座完整性。不要在兩個專案各自手改相同內容。App 專用通知／權限文案另設清楚的維護來源與命名範圍，生成步驟合併後仍由 gen-l10n 處理。

### 星座渲染規格

以共用 `ConstellationRenderer` 供首頁、圖鑑、完成卡及分享圖使用；插畫、遮罩、星點、星線全部採 **380×300** 座標框等比縮放，不因卡片尺寸改變各自的邊距或對位。

- 未點亮保留約 14% 低亮度剪影；按最近已亮／未亮主星距離分區揭露，基準柔邊 24 px 隨畫框縮放。
- 新星揭露約 1.8 秒；完成後約 5 秒呼吸循環。最後一顆完成先展示收藏卡，收進圖鑑後才轉下一座。
- 星座 WebP／PNG 由圖片層載入，星線、星點與遮罩由 CustomPainter 等 Flutter 圖形能力繪製。第一週比較遮罩預計算和 shader 方案，以真機效能決定；fallback 保留相同分區結果。
- 水晶徽章的動態液面、光澤、呼吸需重新實作；靜態 SVG 作基本呈現及減少動態模式。
- 星圖列表 lazy build，圖片按目標尺寸解碼；不一次解碼全部 88 張。使用 RepaintBoundary 隔離高頻動畫，避免整頁每幀 rebuild。
- 系統或 App 啟用減少動態時，直接顯示正確最終進度，不犧牲資訊；背景和不可見分頁停止 ticker。

golden 測試採固定時鐘、亂數、字型及動畫進度；至少覆蓋 0 顆、1 顆、半完成、全亮及完成卡，88 座均需檢查圖片與星線對位。

## 9. 手機原生功能

| 項目 | 首版行為 |
|---|---|
| 每日通知 | Web 目前只存 remind／remindTime；App 在使用者開啟時請求授權，再排程本機通知；授權被拒、時間變更、時區變更、重啟及取消均能正確處理 |
| 通知精度 | 日記提醒預設採容許系統延遲的排程；不以精準鬧鐘為首版必要條件。通知點擊只導向安全的首頁／編輯入口 |
| 相片與影片 | 按需請求權限；拒絕後仍可寫文字日記；相簿有限授權、取消選取、App 被系統回收都要可恢復 |
| 地區與定位 | 保留手動選城市；使用者要求目前位置時才讀定位；無權限時仍能查看預設天區資訊 |
| 分享 | 使用者預覽圖卡後開啟 share sheet；分享／取消／目標 App 延遲讀取皆測試，暫存檔採延後清理 |
| PIN 鎖 | 保留 4 位 PIN 與背景超過 1 分鐘重鎖；採安全儲存、加鹽的適當密碼推導與失敗節流；不沿用 Web 的簡易 hash fallback |
| 隱私畫面 | App inactive／背景時遮住日記；鎖定時阻止底層觸控、導覽與無障礙讀取；通知不含日記本文 |
| 回饋 | 使用者主動寄信或開啟回報頁；診斷資訊可取消附加，排除本文、照片、精確位置及 PIN |
| 評分 | 在適當完成事件後使用系統評分 API；設定裡的明確商店入口直接開商店頁 |

通知原生配置依選定套件版本核對，包括 Android 排程接收器、重啟後處理及 iOS 授權；不能只新增 Dart 呼叫。[flutter_local_notifications 官方套件說明](https://pub.dev/packages/flutter_local_notifications)。

需補充評估的套件包括 flutter_secure_storage、in_app_review、url_launcher；生物辨識可透過 local_auth 放入後續版本。PIN 首版定位為存取鎖；SQLite 與媒體是否另做加密是獨立產品決策，不能把 PIN 鎖描述成資料加密，亦不能把 v1 ZIP 說成加密備份。

**評分流程需調整現有 Web 行為。** Web 先問 1–5 星、再只把高分者導向商店的流程，不納入 App。Google 明確要求不要在評分提示前詢問使用者意見，Apple 要求使用系統提供的評分 API；意見回饋保持獨立入口。[Google Play 評分指南](https://developer.android.com/guide/playcore/in-app-review)、[Apple App Review Guidelines 5.6.1](https://developer.apple.com/app-store/review/guidelines/#app-store-reviews)。

## 10. 測試與發布門檻

| 層級 | 必要驗收 |
|---|---|
| 純 Dart 規則測試 | Web／Dart fixtures 的 XP、streak、成就、星座排序與 seeded fortune 結果一致；投影使用明確浮點誤差範圍 |
| 資料與 migration | 新裝／升級、CRUD、草稿恢復、標籤合併、資料庫失敗與媒體垃圾回收；每次 schema 升級有遷移測試 |
| Widget／golden | 四分頁、編輯器、完成卡、三語、空白／長文、字級 200%、減少動態；星座共用座標 |
| 備份契約 | Web→iOS、Web→Android、兩 App→Web、iOS↔Android；空白還原與合併分開驗收 |
| 故障注入 | 匯入每一提交階段強制終止、空間不足、ZIP 損壞、重複匯入、缺少照片／影片，重啟後無半套資料 |
| 原生整合 | 系統 picker、HEIC／影片、權限拒絕、通知、分享、背景重鎖、相機後程序恢復；兩平台真機 |
| 使用者旅程 | 引導→寫日記→點亮→收藏→搜尋→分享→備份→另一裝置還原，連續完成無資料損失 |

備份測試使用人工／合成資料，包含照片頭像、多張照片、影片、收藏、回顧、經緯度、高階塗裝、重複 id、不同 tz 與三語。媒體不轉碼時以 hash 比對；有轉碼時驗證數量、封面、方向、時長與實際可播放，不要求 bytes 相同。

建議效能目標以下列固定裝置與資料集實測，並於第 0 階段調整：中階 Android 及最低支援版本 iPhone，10,000 則合成日記、包含 1,000 張縮圖；冷啟動至可操作 ≤3 秒、常用搜尋 p95 ≤300 ms、60 Hz 裝置主要操作的 UI／raster 各自 p95 ≤16.7 ms。大型 ZIP 記憶體使用不得隨影片總大小線性增加。以上是開發目標，尚非量測結果。

每個 PR 執行格式檢查、flutter analyze、規則／資料／Widget 測試與產碼差異檢查；涉及原生能力的改動追加整合測試。每個里程碑產生 iOS 與 Android release build。Web 只在共用資料、規則或匯出器變動時跑對應既有測試，完整發布前跑全套。

上架門檻為：所有首版必需項目通過、無已知資料遺失問題、備份互通與故障復原通過、兩平台真機旅程通過、無阻斷性缺陷。商店資料另完成 App ID、正式簽章、圖示、截圖、三語描述、隱私政策、SDK 隱私資訊及支援連結；OS 自動備份是否包含日記／媒體也要明確配置，避免與「只存本機」的描述矛盾。

## 11. 開發階段與估算

以下按一位熟悉 Flutter 的全職開發者、既有素材可沿用、產品負責人每週參與驗收估算。工時包含對應測試與修正，階段之間有依賴，不能直接除以人數推算多人時程。

| 階段 | 時間 | 交付與退出條件 |
|---|---|---|
| M0 技術驗證與契約 | 1 週 | 凍結 SDK／依賴；雙平台 release build；一座星座動態 PoC；照片／影片及小型 ZIP 往返；統一備份差異 |
| M1 基礎架構 | 1–2 週 | theme、三語、四分頁、Drift、Repository、啟動／復原骨架；素材去重管線 |
| M2 日記核心 Alpha | 2 週 | 日記 CRUD、照片、草稿／stash、列表／搜尋／星曆、profile；可每日實際使用 |
| M3 成長與星空 | 2–3 週 | 規則 fixtures 通過；88 座渲染、成就、慶祝、今晚指南、完整首頁 |
| M4 原生媒體與備份 | 2–3 週 | 影片相容流程、完整 ZIP 合併與中斷復原、通知、PIN、分享；互通驗收通過 |
| M5 功能完整 Beta | 2 週 | 月報／年度回顧、完整設定、回饋／評分、無障礙、效能與真機回歸 |
| M6 發布候選版 | 2–3 週 | TestFlight／Play 測試版本、使用者試用修正、正式簽章、商店素材、發布檢查 |
| 合計 | **12–16 週** | 不包含商店審核等待、帳號審核或新增範圍 |

關鍵依賴是「備份契約與資料模型 → 日記資料 → 成長計算 → 星座呈現 → 完整互通與回歸」。M0 即需驗證星座遮罩與影片轉檔，避免到功能完成後才發現手機效能或原生依賴不成立。

產品負責人決定 UI 差異與範圍；Flutter 開發者負責實作及自動測試；至少安排一位非實作者執行 Beta 旅程與資料搬移驗收。每週以可安裝版本和驗收結果檢視進度。

## 12. 主要風險與處理

| 風險 | 對策及完成條件 |
|---|---|
| 圖片重複造成安裝包與記憶體膨脹 | M0／M1 抽出 88 張單一來源圖片；建立內容 manifest；量測 release 包體與首頁／圖鑑記憶體 |
| JS／Dart 計算不一致 | 同輸入 golden fixtures；固定時鐘／地區／種子；將差異列為阻斷問題 |
| 匯入後資料或星座錯置 | id、conOrder、reviews 完整保留；合併與空白還原分開測；journal 故障注入 |
| 相片／影片跨平台不可播 | HEIC 與 HEVC 提早 PoC；使用相容輸出；失敗可取消且保留原檔 |
| 動畫拖慢低階手機 | 使用統一 renderer、圖片解碼限制、遮罩快取、背景停畫；以真機 profile 數據驗收 |
| 依賴更新導致建置破壞 | SDK／lockfile 固定；最小依賴集合；不要整份複製 pet_diary pubspec 或 overrides |
| 共用內容長期分歧 | Web commit／內容版本／hash 追蹤；生成檔不手改；每次發布檢查一致性 |
| 首版範圍持續增加 | 雲端、音訊、地圖、付費及專用平板介面另開版本，避免與遷移驗收混在一起 |

## 13. 開工決策與第一批工作

以下預設足以啟動 M0，產品負責人可在 kickoff 調整；App ID、開發者帳號及商店聯絡資訊必須在簽章／發布前定案。

| 決策 | 建議預設 | 決定時點 |
|---|---|---|
| 專案位置 | 獨立 `novaday_app` repo，Web repo 持續提供素材與契約 | M0 |
| 支援平台 | iOS 15+、Android API 24+；手機優先 | M0 |
| UI 範圍 | 保留 Novaday 星空深色視覺，原生調整手勢／鍵盤／安全區 | M0 |
| 資料模式 | 離線優先、ZIP 搬移、無登入與自動同步 | M0 |
| 資料加密 | 首版 PIN 存取鎖；若要求 DB／媒體加密，M0 增加專項驗證與重估 | M0 |
| Web 共存 | 維持既有網站，手機版匯出仍能回到 Web | M0 |
| 首版變現 | 本規劃不加入；若有訂閱／廣告需求須另估開發與資料申報 | M0 |

第一批開發 ticket：

1. **ND-001 平台基準**：建立 Flutter 專案、SDK／CI／lockfile，產生雙平台 release build，記錄套件相容矩陣。
2. **ND-002 契約整理**：校正 livery、語言與日期規則；建立 v1 schema、valid／invalid／duplicate fixtures。
3. **ND-003 手機素材**：抽出 88 張透明插畫、輕量 JSON、字型與授權、ARB 管線；校驗 count 與 hash。
4. **ND-004 星座 PoC**：同一座標 renderer 在首頁、卡片、分享圖顯示 0／1／半／全亮；量測真機動畫。
5. **ND-005 媒體與 ZIP PoC**：iPhone HEIC／HEVC、Android 照片／影片及 Web ZIP 小樣本往返；決定轉碼實作。
6. **ND-006 核心資料**：Drift schema v1、Repository、草稿／stash、媒體 staging 與 migration 測試。
7. **ND-007 第一條完整流程**：引導→寫一則日記→存檔→點亮星星→關閉 App→重新開啟→日記與進度仍正確。

## 14. 原始碼對照與參考

Novaday 的內部連結以本規劃開頭所列 commit 為基準；後續變更需更新契約或 fixtures。

| 內容 | 對照來源 |
|---|---|
| 現有架構與功能 | [README](../README.md)、[Web 架構](architecture.md) |
| 備份格式與實作 | [備份格式](backup-format.md)、[匯出](../src/js/features/backup/export.js)、[還原](../src/js/features/backup/restore.js) |
| XP／連續天數 | [xp-streak.js](../src/js/logic/xp-streak.js) |
| 星座計算 | [sky-projection.js](../src/js/logic/sky-projection.js) |
| 星座呈現 | [constellation-image.js](../src/js/ui/art/constellation-image.js)、[constellation-map.js](../src/js/ui/art/constellation-map.js) |
| 設計與語言 | [design_tokens.json](../assets/design/design_tokens.json)、[app_zh.arb](../assets/l10n/app_zh.arb)、[content.json](../assets/l10n/content.json) |
| pet_diary 導覽架構 | [app_router.dart](https://github.com/dominicshing/pet_diary/blob/4fc2e60c486d80453d0f7113b5a6aa4a7f6be6a2/lib/core/router/app_router.dart) |
| pet_diary 資料層 | [app_database.dart](https://github.com/dominicshing/pet_diary/blob/4fc2e60c486d80453d0f7113b5a6aa4a7f6be6a2/lib/data/local/app_database.dart)、[diary_provider.dart](https://github.com/dominicshing/pet_diary/blob/4fc2e60c486d80453d0f7113b5a6aa4a7f6be6a2/lib/providers/diary_provider.dart) |
| pet_diary 啟動與復原 | [main.dart](https://github.com/dominicshing/pet_diary/blob/4fc2e60c486d80453d0f7113b5a6aa4a7f6be6a2/lib/main.dart) |

文件中的時程、效能門檻與 Novaday 技術選擇均為規劃值；pet_diary 套件宣告與現有 Web 行為則已依上述版本查核。M0 完成後以實測結果更新本規劃，再開始完整開發。
