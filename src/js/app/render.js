/* 重新繪製所有畫面 */
function render(){XPM=xpMap(entries);renderAchDot();renderQuick();renderMemory();renderReportCard();if(typeof renderSampleRow==='function')renderSampleRow();if(cur==='atlas')renderAtlas();renderHUD();renderAppBar();renderGalaxy();renderFortuneCard();renderMissions();renderLog();renderCal();renderMe();renderDraftBar()}
