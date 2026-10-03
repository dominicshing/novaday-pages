/* 儲存用的 localStorage 鍵名 */
const KEY='orbitlog.entries.v1',SEEDED='orbitlog.seeded.v1';
/* 電腦預覽的手機外框：寬螢幕而且夠高才顯示（手機橫拿時高度不夠，直接用全螢幕版面）；CSS 的 @media 條件要一致 */
const FRAME_MQ='(min-width:600px) and (min-height:600px)',isFrame=()=>matchMedia(FRAME_MQ).matches;
