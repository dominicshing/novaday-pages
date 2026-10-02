/* ---------- ZIP：完整備份含影片時打包成 .zip（不壓縮，影片本來就是壓縮過的格式），還原時讀回 ---------- */
const CRC_T=(()=>{const t=new Uint32Array(256);for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;t[n]=c>>>0}return t})();
function crc32(u8,c){for(let i=0;i<u8.length;i++)c=CRC_T[(c^u8[i])&255]^(c>>>8);return c}
/* files：[{name, data: Blob | Uint8Array}]；影片分段計算 CRC，避免一次讀進整個檔案 */
async function zipBuild(files,onStep){const enc=new TextEncoder(),parts=[],cen=[],n=new Date(),
    tm=(n.getHours()<<11)|(n.getMinutes()<<5)|(n.getSeconds()>>1),dt=((n.getFullYear()-1980)<<9)|((n.getMonth()+1)<<5)|n.getDate();let off=0;
  for(let i=0;i<files.length;i++){const f=files[i],nm=enc.encode(f.name),blob=f.data instanceof Blob,size=blob?f.data.size:f.data.length;let crc=0xFFFFFFFF;
    if(blob){const CH=4<<20;for(let p=0;p<size;p+=CH)crc=crc32(new Uint8Array(await f.data.slice(p,p+CH).arrayBuffer()),crc)}else crc=crc32(f.data,crc);
    crc=(crc^0xFFFFFFFF)>>>0;if(off+30+nm.length+size>0xFFFFFFF0)throw new Error('too-big');
    const lh=new DataView(new ArrayBuffer(30));[[0,0x04034b50,4],[4,20,2],[6,0x0800,2],[8,0,2],[10,tm,2],[12,dt,2],[14,crc,4],[18,size,4],[22,size,4],[26,nm.length,2],[28,0,2]].forEach(([o,v,w])=>w===4?lh.setUint32(o,v,true):lh.setUint16(o,v,true));
    const ch=new DataView(new ArrayBuffer(46));[[0,0x02014b50,4],[4,20,2],[6,20,2],[8,0x0800,2],[10,0,2],[12,tm,2],[14,dt,2],[16,crc,4],[20,size,4],[24,size,4],[28,nm.length,2],[30,0,2],[32,0,2],[34,0,2],[36,0,2],[38,0,4],[42,off,4]].forEach(([o,v,w])=>w===4?ch.setUint32(o,v,true):ch.setUint16(o,v,true));
    parts.push(lh.buffer,nm,f.data);cen.push(ch.buffer,nm);off+=30+nm.length+size;if(onStep)onStep(i+1,files.length)}
  const cs=cen.reduce((s,x)=>s+x.byteLength,0),e=new DataView(new ArrayBuffer(22));
  e.setUint32(0,0x06054b50,true);e.setUint16(8,files.length,true);e.setUint16(10,files.length,true);e.setUint32(12,cs,true);e.setUint32(16,off,true);
  return new Blob([...parts,...cen,e.buffer],{type:'application/zip'})}
/* 讀取 zip：只讀目錄，檔案內容用 slice 取出（不必整個載入記憶體）；也支援重新壓縮過的 deflate 檔 */
async function zipOpen(file){const L=file.size,tail=new Uint8Array(await file.slice(Math.max(0,L-65557)).arrayBuffer());let i=tail.length-22;
  for(;i>=0;i--)if(tail[i]===0x50&&tail[i+1]===0x4b&&tail[i+2]===5&&tail[i+3]===6)break;if(i<0)throw new Error('not-zip');
  const ev=new DataView(tail.buffer,i),n=ev.getUint16(10,true),cs=ev.getUint32(12,true),co=ev.getUint32(16,true);
  const cd=new DataView(await file.slice(co,co+cs).arrayBuffer()),dec=new TextDecoder(),list={};let p=0;
  for(let k=0;k<n&&p+46<=cd.byteLength;k++){if(cd.getUint32(p,true)!==0x02014b50)break;
    const nl=cd.getUint16(p+28,true),name=dec.decode(new Uint8Array(cd.buffer,cd.byteOffset+p+46,nl));
    list[name]={m:cd.getUint16(p+10,true),cs:cd.getUint32(p+20,true),lo:cd.getUint32(p+42,true)};p+=46+nl+cd.getUint16(p+30,true)+cd.getUint16(p+32,true)}
  const names=Object.keys(list).filter(x=>!x.endsWith('/')&&!/(^|\/)(__MACOSX|\._)/.test(x));
  /* 解壓後再壓縮，路徑前面可能多一層資料夾：用結尾比對 */
  const find=nm=>names.find(x=>x===nm)||names.find(x=>x.endsWith('/'+nm));
  async function get(nm,type){const k=find(nm);if(!k)return null;const f=list[k],h=new DataView(await file.slice(f.lo,f.lo+30).arrayBuffer());
    const st=f.lo+30+h.getUint16(26,true)+h.getUint16(28,true),raw=file.slice(st,st+f.cs,type||'');
    if(f.m===0)return raw;
    if(f.m===8&&window.DecompressionStream)return new Blob([await new Response(raw.stream().pipeThrough(new DecompressionStream('deflate-raw'))).blob()],{type:type||''});
    throw new Error('method')}
  return{names,find,get}}
