"""Recheck the 14 redrawn assets at the app reference size. Requires Pillow.

The body mask is median-filtered alpha >=96; distance is exact Euclidean
(pixel grid), lines are sampled about every pixel and weighted by length.
These figures are geometric screening metrics, not semantic pose ratings.
Run from the repository root.
"""
import json,math
from PIL import Image,ImageDraw,ImageFont,ImageFilter
from pathlib import Path
out=Path('preview/constellation-redraw'); data=json.loads((out/'geometry.json').read_text())
font_paths=['/System/Library/Fonts/Supplemental/Arial Unicode.ttf','/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc','/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf']
font=next((ImageFont.truetype(p,18) for p in font_paths if Path(p).exists()),ImageFont.load_default())
W,H=380,300
# Exact squared Euclidean distance transform, separable lower envelopes.
def edt1(f):
 n=len(f); v=[0]*n; z=[-float('inf')]+[float('inf')]*n; k=0
 for q in range(1,n):
  s=((f[q]+q*q)-(f[v[k]]+v[k]*v[k]))/(2*q-2*v[k])
  while s<=z[k]:
   k-=1; s=((f[q]+q*q)-(f[v[k]]+v[k]*v[k]))/(2*q-2*v[k])
  k+=1;v[k]=q;z[k]=s;z[k+1]=float('inf')
 k=0;d=[]
 for q in range(n):
  while z[k+1]<q:k+=1
  d.append((q-v[k])**2+f[v[k]])
 return d
results=[]; tiles={}
for key,c in data.items():
 im=Image.open(Path('assets/webp/constellations')/f'{key}.webp').convert('RGBA').resize((W,H),Image.Resampling.LANCZOS)
 # Median removes isolated dust/glow; alpha 96 keeps the visible figure rather than faint haze.
 a=list(im.getchannel('A').filter(ImageFilter.MedianFilter(5)).point(lambda a:255 if a>=96 else 0).getdata())
 rows=[edt1([0 if v else 1e9 for v in a[y*W:(y+1)*W]]) for y in range(H)]
 cols=[edt1([rows[y][x] for y in range(H)]) for x in range(W)]
 def dist(p):return math.sqrt(cols[max(0,min(W-1,round(p[0])))][max(0,min(H-1,round(p[1])))])
 stars=[dist(p) for p in c['points']]; ds=[]; weights=[]
 for pl in c['lines']:
  for i,j in zip(pl,pl[1:]):
   p,q=c['points'][i],c['points'][j];length=math.dist(p,q);n=max(1,math.ceil(length))
   for t in range(n):
    u=(t+.5)/n;ds.append(dist([p[0]+u*(q[0]-p[0]),p[1]+u*(q[1]-p[1])]));weights.append(length/n)
 ratio=lambda threshold:sum(w for d,w in zip(ds,weights) if d>threshold)/sum(weights)
 r=dict(key=key,name=c['name'],max_star=round(max(stars),1),stars_far=sum(d>20 for d in stars),n=len(stars),line_far=round(100*ratio(20),1),line_40=round(100*ratio(40),1),star_dist=[round(d,1) for d in stars])
 results.append(r)
 tile=Image.new('RGB',(W,350),'#101127');tile.paste(im,(0,34),im);draw=ImageDraw.Draw(tile)
 draw.text((10,6),f"{key} {c['name']}",font=font,fill='white')
 for pl in c['lines']:
  draw.line([(c['points'][i][0],c['points'][i][1]+34) for i in pl],fill='#ffe565',width=2)
 for i,((x,y),d) in enumerate(zip(c['points'],stars)):
  y+=34;col='#ff5969' if d>20 else '#ffffff';draw.ellipse((x-4,y-4,x+4,y+4),fill=col)
 draw.text((8,327),f"far line {r['line_far']}% | star max {r['max_star']}px",font=font,fill='#ffb9b9' if r['line_far']>25 else '#b7bdce')
 tiles[key]=tile
 im.save(out/f'{key}-preview.png')
results.sort(key=lambda r:(r['line_far'],r['max_star']),reverse=True)
(out/'metrics.json').write_text(json.dumps(results,ensure_ascii=False,indent=2))
for offset in range(0,len(results),12):
 group=results[offset:offset+12];sheet=Image.new('RGB',(W*3,350*math.ceil(len(group)/3)),'#101127')
 for i,r in enumerate(group):sheet.paste(tiles[r['key']],((i%3)*W,(i//3)*350))
 sheet.save(out/f'sheet-{offset//12+1}.jpg',quality=94)
for r in results: print(f"{r['key']:3} {r['name']:6} line20={r['line_far']:5.1f}% line40={r['line_40']:5.1f}% stars={r['stars_far']}/{r['n']} max={r['max_star']:5.1f}")

assert len(results)==14 and all(r["line_far"]<15 and r["max_star"]<=20 for r in results), "Redraw alignment regression"
