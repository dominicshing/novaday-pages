/* 下載檔案（Claude 下載功能或一般瀏覽器下載） */
/* 下載：有 Claude 下載功能時用它，否則用一般瀏覽器下載；完整備份一律打包成 .zip */
async function saveFile(name,data,type){const blob=data instanceof Blob?data:new Blob([data],{type});
  const dl=window.claude&&window.claude.use&&await window.claude.use('downloads').catch(()=>null);
  if(dl){try{await dl.save({filename:name,data:typeof data==='string'?data:blob});return true}catch(e){if(e&&e.code==='declined')return false}}
  const u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=name;a.rel='noopener';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),120000);return true}
