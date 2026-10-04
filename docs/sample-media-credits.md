# 範例紀錄的照片與影片來源

第一次使用時放入的範例紀錄，照片和影片都取自 [Wikimedia Commons](https://commons.wikimedia.org/)，資料在 `src/js/data/sample-media.js`（`SAMPLE_MEDIA`）。

| 鍵 | 用在 | 原始檔案 | 作者 | 授權 | 修改 |
|---|---|---|---|---|---|
| `coffee` | 第一次啟動日誌（主照片） | [Latte art heart Garden Caffé Portugal 20190118.jpg](https://commons.wikimedia.org/wiki/File:Latte_art_heart_Garden_Caff%C3%A9_Portugal_20190118.jpg) | Londonjackbooks | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) | 縮小、壓縮 |
| `plant` | 第一次啟動日誌（第二張） | [Wicker plant and big window (Unsplash).jpg](https://commons.wikimedia.org/wiki/File:Wicker_plant_and_big_window_(Unsplash).jpg) | Amanda Mocci | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) | 縮小、壓縮 |
| `rain` | 雨天的夜間散步 | [Umbrella California St rain (Unsplash).jpg](https://commons.wikimedia.org/wiki/File:Umbrella_California_St_rain_(Unsplash).jpg) | Todd Diemer | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) | 縮小、壓縮 |
| `city` | 加班後的城市（主照片） | [Xinyi District Night view 201608.JPG](https://commons.wikimedia.org/wiki/File:Xinyi_District_Night_view_201608.JPG) | Wpcpey | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | 縮小、壓縮；修改後的圖同樣以 CC BY-SA 4.0 授權 |
| `store` | 加班後的城市（第二張） | [Circle K convenience store Wan Chai Hong Kong (26067268233).jpg](https://commons.wikimedia.org/wiki/File:Circle_K_convenience_store_Wan_Chai_Hong_Kong_(26067268233).jpg) | Chris from Shenzhen, China | [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0) | 裁出店面、縮小、壓縮；修改後的圖同樣以 CC BY-SA 2.0 授權 |
| `sea`、`posterSea` | 臨時起意去海邊（影片與封面） | [Waves-1013354, Dingle Peninsula, Co. Kerry, Ireland.webm](https://commons.wikimedia.org/wiki/File:Waves-1013354,_Dingle_Peninsula,_Co._Kerry,_Ireland.webm) | Maoileann | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | 取 6–10 秒、去除聲音、轉成 640×360 H.264；修改後的影片同樣以 CC BY-SA 4.0 授權 |
| `cat`、`posterCat` | 在家陪貓的週末（影片與封面） | [Cat playing in Taiwan.webm](https://commons.wikimedia.org/wiki/File:Cat_playing_in_Taiwan.webm) | MiNe | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0) | 取 34.5–38.5 秒、去除聲音、轉成 640×360 H.264 |

## 處理方式

- 照片：從 Commons 取 960px 寬的縮圖，用 Pillow 縮到長邊 560–600px，JPEG 品質 58–70。
- 影片：取 Commons 的 480p 轉檔版，用 ffmpeg 轉成 H.264 Constrained Baseline、24fps、無聲、`+faststart`（CRF 30–33），手機和桌面瀏覽器都能播。
- 封面：從處理後的影片中段截一張 JPEG。

更換範例媒體時，請一併更新這張表。
