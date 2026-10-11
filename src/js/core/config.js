/* 儲存用的 localStorage 鍵名 */
const KEY='orbitlog.entries.v1',SEEDED='orbitlog.seeded.v1';
/* 電腦預覽的手機外框：寬螢幕而且夠高才顯示（手機橫拿時高度不夠，直接用全螢幕版面）；CSS 的 @media 條件要一致 */
const FRAME_MQ='(min-width:600px) and (min-height:600px)',isFrame=()=>matchMedia(FRAME_MQ).matches;
/* 版本號碼（意見回饋附上的裝置資訊用） */
const APP_VER='2.0';
/* 意見回饋與評分
   email：意見回饋與問題回報用郵件 App 寄到這裡；清空時改成打開 GitHub 的回報頁面（issues）
   store：上架後填入 App Store／Google Play 的頁面網址；評分視窗的「撰寫評論」會打開它，沒填時改成打開意見回饋 */
const FEEDBACK={email:'tommyleegarden@gmail.com',issues:'https://github.com/dominicshing/novaday-pages/issues/new',store:''};
