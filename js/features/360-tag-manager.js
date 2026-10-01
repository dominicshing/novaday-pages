/* ---------- R15：標籤管理 ---------- */
let tgOpen=null;
function tagStats(){const m={};entries.forEach(e=>(e.tags||[]).forEach(t=>{const o=m[t]||(m[t]={n:0,last:''});o.n++;if(e.date>o.last)o.last=e.date}));return m}
function renderTagCnt(){const n=Object.keys(tagStats()).length;if($('tagCnt'))$('tagCnt').textContent=n?`${n} 個`:''}
function renderTags(){const m=tagStats(),L=Object.keys(m).sort((a,b)=>m[b].n-m[a].n||a.localeCompare(b,'zh-Hant'));
  $('tgList').innerHTML=L.length?L.map(t=>{const o=m[t],d=parse(o.last),op=t===tgOpen;
    return `<div class="tg-row${op?' open':''}" data-t="${esc(t)}"><button type="button" class="tg-main" aria-expanded="${op}"><b>${esc(t)}</b><small>最近 ${d.getMonth()+1}/${d.getDate()}</small><span class="tg-n">${o.n}</span></button>
      ${op?`<div class="tg-ed"><label class="sr" for="tgIn">新的標籤名稱</label><input class="field" id="tgIn" value="${esc(t)}" maxlength="30" autocomplete="off" enterkeyhint="done"><span class="tg-hint" id="tgHint"></span>
        <div class="row"><button type="button" class="btn danger" id="tgDel">刪除標籤</button><button type="button" class="btn primary" id="tgSave">儲存</button></div></div>`:''}</div>`}).join('')
    :'<div class="tg-empty">還沒有使用過標籤。<br>寫紀錄時在「標籤」欄位輸入，就會出現在這裡。</div>';
  $('tgList').querySelectorAll('.tg-main').forEach(b=>b.onclick=()=>{const t=b.parentElement.dataset.t;tgOpen=tgOpen===t?null:t;renderTags();if(tgOpen){const i=$('tgIn');i.focus({preventScroll:true});i.select()}});
  if(!tgOpen)return;const old=tgOpen,inp=$('tgIn');
  const norm=v=>v.replace(/^#+/,'').replace(/[,，]/g,'').trim().slice(0,30);
  const hint=()=>{const v=norm(inp.value);$('tgHint').textContent=v&&v!==old&&m[v]?`「#${v}」已經存在，儲存後會把兩個標籤合併（共 ${m[v].n+m[old].n} 則）`:'';$('tgSave').textContent=v&&v!==old&&m[v]?'合併':'儲存';$('tgSave').disabled=!v};
  inp.addEventListener('input',hint);inp.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();$('tgSave').click()}});hint();
  const snapTags=()=>{const s={};entries.forEach(e=>{if((e.tags||[]).includes(old))s[e.id]=e.tags.slice()});return s};
  const undo=sn=>()=>{entries.forEach(e=>{if(sn[e.id])e.tags=sn[e.id]});save();render();if($('tagSheet').classList.contains('open'))renderTags();toast('已復原')};
  $('tgSave').onclick=()=>{const v=norm(inp.value);if(!v)return;if(v===old){tgOpen=null;renderTags();return}
    const merge=!!m[v],sn=snapTags();entries.forEach(e=>{if((e.tags||[]).includes(old))e.tags=[...new Set(e.tags.map(t=>t===old?v:t))]});
    if(fl.tag===old)fl.tag=v;if(!save())return;tgOpen=null;render();renderTags();snack(merge?`已合併到 #${v}`:`已改名為 #${v}`,'復原',undo(sn))};
  $('tgDel').onclick=async()=>{const n=m[old].n;const k=await ask(`刪除 #${old}？`,`會從 ${n} 則紀錄移除這個標籤，紀錄本身不會被刪除。`,[{k:'cancel',t:'取消'},{k:'ok',t:'刪除標籤',cls:'danger'}]);if(k!=='ok')return;
    const sn=snapTags();entries.forEach(e=>{if((e.tags||[]).includes(old))e.tags=e.tags.filter(t=>t!==old)});if(fl.tag===old)fl.tag=null;
    if(!save())return;tgOpen=null;render();renderTags();snack(`已刪除 #${old}`,'復原',undo(sn))}}
function openTags(){tgOpen=null;renderTags();openSheet('tagSheet')}
$('liTags').onclick=openTags;
