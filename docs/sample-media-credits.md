# 範例紀錄的照片與影片來源

第一次使用時放入的範例紀錄，照片和影片都取自 [Wikimedia Commons](https://commons.wikimedia.org/)，資料在 `src/js/data/sample-media.js`（`SAMPLE_MEDIA`）。

| 鍵 | 用在 | 原始檔案 | 作者 | 授權 | 修改 |
|---|---|---|---|---|---|
| `coffee` | 第一次啟動日誌（主照片） | [Coffee, flowers and books (Unsplash).jpg](https://commons.wikimedia.org/wiki/File:Coffee,_flowers_and_books_(Unsplash).jpg) | Juja Han | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) | 縮小、壓縮 |
| `plant` | 第一次啟動日誌（第二張） | [Wicker plant and big window (Unsplash).jpg](https://commons.wikimedia.org/wiki/File:Wicker_plant_and_big_window_(Unsplash).jpg) | Amanda Mocci | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) | 縮小、壓縮 |
| `rain` | 雨天的夜間散步 | [Umbrella California St rain (Unsplash).jpg](https://commons.wikimedia.org/wiki/File:Umbrella_California_St_rain_(Unsplash).jpg) | Todd Diemer | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) | 縮小、壓縮 |
| `picnic` | 森林裡的野餐（主照片） | [Picnic basket (Unsplash).jpg](https://commons.wikimedia.org/wiki/File:Picnic_basket_(Unsplash).jpg) | Bonnie Kittle | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) | 縮小、壓縮 |
| `chairs` | 森林裡的野餐（第二張） | [Lawn chairs (Unsplash).jpg](https://commons.wikimedia.org/wiki/File:Lawn_chairs_(Unsplash).jpg) | Kate Tandy | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) | 縮小、提亮、壓縮 |
| `sea`、`posterSea` | 臨時起意去海邊（影片與封面） | [Waves-1013354, Dingle Peninsula, Co. Kerry, Ireland.webm](https://commons.wikimedia.org/wiki/File:Waves-1013354,_Dingle_Peninsula,_Co._Kerry,_Ireland.webm) | Maoileann | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | 取 6–10 秒、去除聲音、轉成 640×360 H.264；修改後的影片同樣以 CC BY-SA 4.0 授權 |
| `cat`、`posterCat` | 窗邊的兩隻貓（影片與封面） | [Cat body language.webm](https://commons.wikimedia.org/wiki/File:Cat_body_language.webm) | Shannon McGee | [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0) | 放慢到 4 秒、去除聲音、轉成 640×360 H.264；修改後的影片同樣以 CC BY-SA 2.0 授權 |

## 處理方式

- 照片：從 Commons 取 960px 寬的縮圖，用 Pillow 縮到長邊 580–600px，JPEG 品質 64–68。
- 影片：取 Commons 的 480p 轉檔版，用 ffmpeg 轉成 H.264 Constrained Baseline、24fps、無聲、`+faststart`（CRF 30），手機和桌面瀏覽器都能播。
- 封面：從處理後的影片中段截一張 JPEG。

照片都是 CC0（不需標示作者）；兩支影片是 CC BY-SA，發佈 App 時要在 App 內或商店說明中標示作者與授權。

更換範例媒體時，請一併更新這張表。
