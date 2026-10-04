# 範例紀錄的照片與影片來源

第一次使用時放入的範例紀錄，照片和影片都取自 [Wikimedia Commons](https://commons.wikimedia.org/)，資料在 `src/js/data/sample-media.js`（`SAMPLE_MEDIA`）。

| 鍵 | 用在 | 原始檔案 | 作者 | 授權 | 修改 |
|---|---|---|---|---|---|
| `tele` | 第一次啟動日誌（主照片） | [A Telescope to the Sky (9514061606).jpg](https://commons.wikimedia.org/wiki/File:A_Telescope_to_the_Sky_(9514061606).jpg) | Lassen Volcanic National Park（LassenNPS） | 公有領域 | 縮小、壓縮 |
| `chart` | 第一次啟動日誌（第二張） | [Philips Planisphere.jpg](https://commons.wikimedia.org/wiki/File:Philips_Planisphere.jpg) | H. Raab (User:Vesta) | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) | 白底改成深藍、縮小、壓縮；修改後的圖同樣以 CC BY-SA 3.0 授權 |
| `rain` | 雨天的夜間散步 | [Late autumn rainy night in Moscow (54889230493).jpg](https://commons.wikimedia.org/wiki/File:Late_autumn_rainy_night_in_Moscow_(54889230493).jpg) | kishjar? from Moscow, Russia | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | 縮小、壓縮 |
| `city` | 加班後的城市（主照片） | [Moon Sliver over Mid-City New Orleans, November 2021.jpg](https://commons.wikimedia.org/wiki/File:Moon_Sliver_over_Mid-City_New_Orleans,_November_2021.jpg) | Bart Everson | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0) | 縮小、壓縮 |
| `tower` | 加班後的城市（第二張） | [Taipei 101 and moon (30846557581).jpg](https://commons.wikimedia.org/wiki/File:Taipei_101_and_moon_(30846557581).jpg) | Alan Sung | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0) | 縮小、壓縮 |
| `sea`、`posterSea` | 海邊看夕陽（影片與封面） | [Sunset at the sea of Azov.webm](https://commons.wikimedia.org/wiki/File:Sunset_at_the_sea_of_Azov.webm) | Igor da Bari | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | 取 14–26 秒加速 3 倍成 4 秒、去除聲音、轉成 640×360 H.264 |
| `milky`、`posterMilky` | 第一次看到銀河（影片與封面） | [Milky Way Timelapse.webm](https://commons.wikimedia.org/wiki/File:Milky_Way_Timelapse.webm) | Gamer noscope | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) | 裁掉上下黑邊、裁成 16:9、轉成 640×360 H.264（4 秒） |

## 處理方式

- 照片：從 Commons 取 960px 寬的縮圖，用 Pillow 縮到長邊 560–720px，JPEG 品質 60–72。
- 影片：取 Commons 的 480p 轉檔版，用 ffmpeg 轉成 H.264 Constrained Baseline、24fps、無聲、`+faststart`（CRF 30），手機和桌面瀏覽器都能播。
- 封面：從處理後的影片中段截一張 JPEG。

更換範例媒體時，請一併更新這張表。
