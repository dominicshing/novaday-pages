# 範例紀錄的照片與影片來源

第一次使用時放入的範例紀錄，資料在 `src/js/data/sample-media.js`（`SAMPLE_MEDIA`）。照片取自 [Wikimedia Commons](https://commons.wikimedia.org/) 上轉存的 Unsplash 照片（CC0），影片取自 [Mixkit](https://mixkit.co/)（Mixkit Stock Video Free License）。兩者都可以免費商用，不需要標示作者。

| 鍵 | 用在 | 原始檔案 | 作者 | 授權 | 修改 |
|---|---|---|---|---|---|
| `tea` | 第一次啟動日誌（主照片） | [Tea(byCarliJeen).jpg](https://commons.wikimedia.org/wiki/File:Tea(byCarliJeen).jpg) | Carli Jean Miller | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) | 縮小、壓縮 |
| `teatime` | 第一次啟動日誌（第二張） | [Sweet tea time (Unsplash).jpg](https://commons.wikimedia.org/wiki/File:Sweet_tea_time_(Unsplash).jpg) | Hoang Viet | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) | 縮小、壓縮 |
| `berries` | 第一次啟動日誌（第三張） | [Fruit Platter (Unsplash).jpg](https://commons.wikimedia.org/wiki/File:Fruit_Platter_(Unsplash).jpg) | Cecilia Par | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) | 縮小、壓縮 |
| `bed` | 睡到自然醒的星期天（主照片） | [Woman roads poetry book while drinking coffee (Unsplash).jpg](https://commons.wikimedia.org/wiki/File:Woman_roads_poetry_book_while_drinking_coffee_(Unsplash).jpg) | Thought Catalog | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) | 縮小、壓縮 |
| `kitten` | 睡到自然醒的星期天（第二張） | [Get comfy (Unsplash).jpg](https://commons.wikimedia.org/wiki/File:Get_comfy_(Unsplash).jpg) | Alexandru Zdrobău | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) | 縮小、壓縮 |
| `balloon` | 清晨的熱氣球 | [Hot air balloon (Unsplash).jpg](https://commons.wikimedia.org/wiki/File:Hot_air_balloon_(Unsplash).jpg) | Sebastien Gabriel | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) | 縮小、壓縮 |
| `latte`、`posterLatte` | 巷口新開的咖啡店（影片與封面） | [Serving a sparkling cappuccino in a cup](https://mixkit.co/free-stock-video/serving-a-sparkling-cappuccino-in-a-cup-41859/) | Mixkit | [Mixkit 免費授權](https://mixkit.co/license/#videoFree) | 取 0.5–4.5 秒、去除聲音、轉成 576×324 H.264 |
| `cat`、`posterCat` | 窗邊的小貓（影片與封面） | [Kitten by the window](https://mixkit.co/free-stock-video/kitten-by-the-window-7053/) | Mixkit | [Mixkit 免費授權](https://mixkit.co/license/#videoFree) | 取 1.5–5.5 秒、去除聲音、轉成 576×324 H.264 |
| `waves`、`posterWaves` | 臨時起意去海邊（影片與封面） | [Waves coming to the beach](https://mixkit.co/free-stock-video/waves-coming-to-the-beach-5016/) | Mixkit | [Mixkit 免費授權](https://mixkit.co/license/#videoFree) | 取 0–3.2 秒，放慢成 4 秒、去除聲音、轉成 576×324 H.264 |
| `picnic`、`posterPicnic` | 公園野餐（影片與封面） | [Elegant Picnic on Blue Blanket](https://mixkit.co/free-stock-video/elegant-picnic-on-blue-blanket-100974/) | Mixkit | [Mixkit 免費授權](https://mixkit.co/license/#videoFree) | 取 1–5 秒、去除聲音、轉成 576×324 H.264 |
| `pour`、`posterPour` | 週末的手沖咖啡（影片與封面） | [Water poured into a coffee filter](https://mixkit.co/free-stock-video/water-poured-into-a-coffee-filter-816/) | Mixkit | [Mixkit 免費授權](https://mixkit.co/license/#videoFree) | 取 3–7 秒、去除聲音、轉成 576×324 H.264 |
| `blossom`、`posterBlossom` | 去看櫻花（影片與封面） | [Japanese cherry blossom in spring](https://mixkit.co/free-stock-video/japanese-cherry-blossom-in-spring-48889/) | Mixkit | [Mixkit 免費授權](https://mixkit.co/license/#videoFree) | 取 3–7 秒、去除聲音、轉成 576×324 H.264 |
| `hat`、`posterHat` | 小貓鑽進草帽（影片與封面） | [Siamese cat inside a hat](https://mixkit.co/free-stock-video/siamese-cat-inside-a-hat-4103/) | Mixkit | [Mixkit 免費授權](https://mixkit.co/license/#videoFree) | 取 3–7 秒、去除聲音、轉成 576×324 H.264 |
| `hammock`、`posterHammock` | 海邊吊床上看書（影片與封面） | [Woman reading lying in a hammock on a sunny beach](https://mixkit.co/free-stock-video/woman-reading-lying-in-a-hammock-on-a-sunny-beach-44530/) | Mixkit | [Mixkit 免費授權](https://mixkit.co/license/#videoFree) | 取 2–6 秒、去除聲音、轉成 576×324 H.264 |
| `sunset`、`posterSunset` | 金色的夕陽（影片與封面） | [Sunset from a peaceful beach](https://mixkit.co/free-stock-video/sunset-from-a-peaceful-beach-44496/) | Mixkit | [Mixkit 免費授權](https://mixkit.co/license/#videoFree) | 取 0–4 秒、去除聲音、轉成 576×324 H.264 |

## 處理方式

- 照片：從 Commons 取 1280px 寬的縮圖，用 Pillow 縮到長邊 720px，JPEG 品質 70。
- 影片：取 Mixkit 的 720p MP4，用 ffmpeg 剪成 4 秒、去除聲音，轉成 576×324、H.264 Constrained Baseline、24fps、`+faststart`（CRF 26，最高 150kbps），手機和桌面瀏覽器都能播。
- 封面：從處理後的影片第 1.5 秒截一張 JPEG。

Mixkit 授權不允許把影片當成單獨的素材重新散布，只能用在作品裡；範例影片只放在 App 內，沒有另外提供下載。

更換範例媒體時，請一併更新這張表。
