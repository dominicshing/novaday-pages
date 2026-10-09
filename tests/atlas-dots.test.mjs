// 星數超過 12 顆的星座也要保留每則紀錄的心情小點。
import fs from 'node:fs';
import vm from 'node:vm';

export default async ({ok,ROOT})=>{
  const data=JSON.parse(fs.readFileSync(ROOT+'/assets/data/constellations.json','utf8')).constellations;
  const source=fs.readFileSync(ROOT+'/src/js/screens/atlas/atlas.js','utf8');
  const moods=Array.from({length:5},(_,i)=>({c:`--mood-${i}`}));
  let records=[];
  const ctx=vm.createContext({CON:Object.fromEntries(Object.entries(data).map(([k,c])=>[k,{s:c.stars}])),MOODS:moods,conEntries:()=>records});
  vm.runInContext(source.slice(source.indexOf('function atDots('),source.indexOf('function renderAtlas(')),ctx);
  for(const [k,c] of Object.entries(data)){
    records=c.stars.map((_,i)=>({mood:i%5}));
    const html=ctx.atDots(k,{cur:null,done:[k]});
    const colors=[...html.matchAll(/--c:var\((--mood-\d)\)/g)].map(m=>m[1]);
    ok(colors.length===c.stars.length&&colors.every((color,i)=>color===moods[i%5].c),`${c.name_zh}：完成後顯示全部 ${c.stars.length} 顆心情小點`);
  }
  records=[{mood:0},{mood:4},{}];
  const partial=ctx.atDots('Hya',{cur:'Hya',done:[]});
  ok((partial.match(/<i\b/g)||[]).length===16&&(partial.match(/<i style=/g)||[]).length===3&&partial.includes('--mood-2'),'長蛇座點亮中保留 16 個位置，只有已點亮的 3 顆有心情色');
  ok(ctx.atDots('Hya',{cur:null,done:[]})==='','尚未開始的星座不顯示紀錄小點');
  records=[];
  ok(ctx.atDots('Hya',{cur:null,done:['Hya']})==='','沒有紀錄時不產生虛構的心情小點');
};
