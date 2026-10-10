/* 介面語言：繁體中文（預設）、简体中文（由繁體自動轉換，見 i18n-zhs.js）、English（i18n-en.js 的字典，沒有翻譯的字串沿用繁體）
   程式裡的介面文字一律寫繁體，顯示前經過 tl()；index.html 的固定文字由 i18nDOM() 在啟動時換掉。
   使用者寫的內容（紀錄、標籤、暱稱）不翻譯也不轉換。換語言後重新載入頁面，讓所有資料重新套用 */
const LANGS=[['zh-Hant','繁體中文'],['zh-Hans','简体中文'],['en','English']];
const LANG=(()=>{let l;try{l=JSON.parse(localStorage.getItem('orbitlog.profile.v1')||'{}').lang}catch(_){}return LANGS.some(x=>x[0]===l)?l:'zh-Hant'})();
const EN_UI=LANG==='en',HAN=/[\u3400-\u9fff]/,LOCALE={'zh-Hant':'zh-TW','zh-Hans':'zh-CN',en:'en-US'}[LANG];
/* 繁轉簡：先比對詞彙（長的優先），其餘逐字 */
const ZHS_M=(S=>new Map(Array.from(ZHS_C,(c,i)=>[c,S[i]])))(Array.from(ZHS_S));
const ZHS_RE=new RegExp([...Object.keys(ZHS_P).sort((a,b)=>b.length-a.length),'[\\u3400-\\u9fff\\uf900-\\ufaff]'].join('|'),'g');
const zhs=s=>String(s).replace(ZHS_RE,m=>ZHS_P[m]??ZHS_M.get(m)??m);
/* 英文版缺的字串（測試用：開過的畫面不該有漏翻） */
const I18N_MISS=new Set();
/* ICU 訊息格式（和 Flutter 的 ARB 相同）的一小部分：{名稱} 換成 v 的值；
   {n, plural, =0{…} one{…} other{…}} 依數量選字（英文：1 用 one，其餘用 other；分支裡的 # 是數字本身） */
function icu(r,v){let out='',i=0;
  while(i<r.length){const c=r[i];if(c!=='{'){out+=c;i++;continue}
    let d=0,j=i;for(;j<r.length;j++){if(r[j]==='{')d++;else if(r[j]==='}'&&!--d)break}
    const body=r.slice(i+1,j),pl=/^\s*(\w+)\s*,\s*plural\s*,([\s\S]*)$/.exec(body);i=j+1;
    if(!pl){out+=body in v?v[body]:'{'+body+'}';continue}
    const k=pl[1],n=+String(v[k]).replace(/,/g,''),opts={};let m,rest=pl[2];
    while((m=/^\s*(=\d+|zero|one|two|few|many|other)\s*\{/.exec(rest))){let e=m[0].length,dd=1;for(;e<rest.length&&dd;e++){if(rest[e]==='{')dd++;else if(rest[e]==='}')dd--}
      opts[m[1]]=rest.slice(m[0].length,e-1);rest=rest.slice(e)}
    const br=opts['='+n]??(n===1?opts.one:undefined)??opts.other??'';out+=icu(br.replace(/#/g,v[k]),v)}
  return out}
/* tl('共 {n} 個星座',{n:88})：英文查 EN（ICU 訊息），簡體自動轉換，繁體原樣 */
function tl(s,v){let r=s;
  if(LANG==='en'){const x=EN[s];if(x!=null)r=x;else if(HAN.test(s))I18N_MISS.add(s)}else if(LANG==='zh-Hans')r=zhs(s);
  return v||r.includes('{')?icu(r,v||{}):r}
/* 分隔符號：中文用「・」，英文用「 · 」 */
const SEP=EN_UI?' · ':'・';
/* 同一個中文詞在不同地方要翻成不同英文時加上情境：tlc('tag','開始') 查 EN['tag|開始'] */
const tlc=(c,s,v)=>tl(EN_UI&&EN[c+'|'+s]!=null?c+'|'+s:s,v);
/* 只在中文介面出現的字（例如「星期」「上午」）：只轉簡體，不查英文字典 */
const tlz=s=>LANG==='zh-Hans'?zhs(s):s;
/* 資料裡的顯示文字（星座小知識、徽章說明…）：英文有翻譯就用，否則照原文；簡體一律轉換 */
const tlD=s=>s==null?s:tl(s);
/* 換掉 index.html 的固定文字與無障礙標籤 */
const I18N_ATTR=['aria-label','placeholder','title','aria-roledescription','alt'];
function i18nDOM(root=document.body){if(LANG==='zh-Hant')return;
  const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let n;
  while((n=w.nextNode())){const s=n.nodeValue,k=s.trim();if(!k||!HAN.test(k))continue;
    const p=n.parentNode;if(p.closest('script,style,[translate="no"]'))continue;
    const c=p.closest('[data-tc]'),r=c?tlc(c.dataset.tc,k):tl(k);if(r!==k)n.nodeValue=s.replace(k,()=>r)}
  root.querySelectorAll(I18N_ATTR.map(a=>`[${a}]`).join(',')).forEach(el=>{if(el.closest('[translate="no"]'))return;
    for(const a of I18N_ATTR){const v=el.getAttribute(a);if(v&&HAN.test(v))el.setAttribute(a,tl(v))}})}
/* 換語言：存進個人資料後重新載入，讓所有文字與資料重新套用（只在使用者操作時呼叫，此時 prof 已經載入） */
function setLang(l){if(l===LANG||!LANGS.some(x=>x[0]===l))return;prof.lang=l;saveProf();location.reload()}
/* 語言選擇：引導頁用三格按鈕，設定頁用下拉選單；選項一律用各自的語言顯示 */
const LANG_LBL=EN_UI?'Language':tlz('語言')+' / Language';
const langSeg=id=>`<div class="exseg lang-seg" id="${id}" role="radiogroup" aria-label="${LANG_LBL}" translate="no">${LANGS.map(([k,n])=>`<button type="button" role="radio" lang="${k}" data-l="${k}" aria-checked="${k===LANG}">${n}</button>`).join('')}</div>`;
function bindLangSeg(id){document.getElementById(id).querySelectorAll('[data-l]').forEach(b=>b.onclick=()=>setLang(b.dataset.l))}
function initLangSelect(){const s=document.getElementById('setLang');if(!s)return;
  s.innerHTML=LANGS.map(([k,n])=>`<option value="${k}" lang="${k}"${k===LANG?' selected':''}>${n}</option>`).join('');s.onchange=()=>setLang(s.value);s.setAttribute('aria-label',LANG_LBL);
  const sub=document.getElementById('langSub');if(sub)sub.textContent=EN_UI?'語言 · 语言':'Language'}
document.documentElement.lang=LANG;
i18nDOM();initLangSelect();
