"""Original pixel atlas authoring. Standard library only; deterministic SVG output."""
from pathlib import Path
import json, math
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'assets'/'sprites'
OUT.mkdir(parents=True,exist_ok=True)
manifest=[]
def sheet(name, states, painter, size=32):
    rects=[]
    def rect(x,y,w,h,c):
        if w>0 and h>0: rects.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{c}"/>')
    for row,state in enumerate(states):
        for f in range(6):
            def r(x,y,w,h,c):rect(f*size+int(x),row*size+int(y),int(w),int(h),c)
            painter(r,state,f)
    (OUT/(name+'.svg')).write_text(f'<svg xmlns="http://www.w3.org/2000/svg" width="{size*6}" height="{size*len(states)}" shape-rendering="crispEdges">'+''.join(rects)+'</svg>',encoding='utf-8')
    manifest.append(dict(id=name,src=f'assets/sprites/{name}.svg',frameWidth=size,frameHeight=size,columns=6,animations={s:dict(frames=list(range(i*6,i*6+6)),fps=10 if s=='run' else 8,loop=s not in ['death','explosion']) for i,s in enumerate(states)}))
def robot(r,s,f):
    b=1 if s=='idle' and f>2 else 0
    if s=='death':
        for i in range(9):r(14+(i%3-1)*(3+f),14+(i//3-1)*(3+f),3,3,['#5cf7da','#eefaff','#4f6987'][i%3])
        return
    light='#ffffff' if s=='hit' and f%2==0 else '#91ffed'
    step=round(math.sin(f*math.pi/3)*3) if s=='run' else 0
    r(7,12+b,7,12,'#172337');r(6,14+b,3,8,'#485b79')
    for x,d in [(11,step),(20,-step)]:
        y=23+(2 if s=='jump' else -2 if s=='fall' else 0)
        r(x+d,y,4,6,'#101b2c');r(x+d,y,2,5,'#65849d');r(x+d-1,29 if s not in ['jump','fall'] else 27,6,2,light)
    r(9,11+b,16,13,'#101a2b');r(10,12+b,14,10,'#47627a');r(11,12+b,12,3,'#c4e3e8');r(13,17+b,8,4,'#173b4c');r(14,17+b,6,2,'#45eacb')
    r(9,3+b,17,11,'#0a1020');r(10,2+b,14,3,'#e3f6ed');r(10,5+b,15,7,'#748ca3');r(12,6+b,14,5,'#122638');r(15,7+b,10,2,light);r(23,8+b,3,2,'#fff4ae');r(8,6+b,3,5,'#3adbc6')
    r(23,14+b,4,7,'#9bb8c8');r(25,17+b,4,4,'#284356')
    if s in ['attack','repair']:
        r(24,15,7,4,'#6886a1');r(28,16,4,2,light)
        if f%2:r(30,10 if s=='repair' else 14,2,3,'#ffcb73')
sheet('r07',['idle','run','jump','fall','attack','hit','repair','death'],robot)
colors={'basic':'#b58aff','fast':'#ff965d','armored':'#83baff','flyer':'#63edff','shooter':'#ffce68','parasite':'#8af779','boss':'#ff5388'}
for kind,col in colors.items():
    def virus(r,s,f,k=kind,c=col):
        if s=='hit' and f%2==0:c='#ffffff'
        if s.startswith('stage'):c=['#ff5388','#c879ff','#ffb64f'][int(s[-1])-1]
        bob=f%3-1
        r(7,7+bob,18,19,'#0c1224');r(9,5+bob,14,24,c);r(5,10+bob,22,13,c);r(9,9+bob,15,15,'#29314d');r(11,11+bob,11,10,'#11182c')
        r(11,13+bob,4,3,c);r(19,13+bob,4,3,c);r(14,21+bob,6,2,c)
        for i in range(4):
            x=4+i*7;r(x,3+(i%2)*2,3,5,c);r(x,25,3,4+(f+i)%3,c)
        if k=='fast':r(1,15,7,3,c);r(0,20,5,2,c)
        if k=='armored':r(24,6,6,22,'#c5deed');r(25,9,3,16,'#4d759e')
        if k=='flyer':r(0,8+f%3,8,3,c);r(25,8+f%3,7,3,c)
        if k=='shooter':r(21,17,11,6,'#d2ac68');r(28,18,4,3,'#fff2c1')
        if k=='parasite':r(2,22,8,2,c);r(24,24,8,2,c)
        if k=='boss':
            r(5,1,4,10,c);r(24,1,4,10,c);r(13,16,7,4,'#fff0c9');r(14,17,5,2,c)
        if s=='prepare':r(14,0,4,3,'#fff4a9')
    sheet('virus-'+kind,['idle','prepare','attack','hit','vulnerable','stage1','stage2','stage3'],virus)
def device(r,s,f):
    c='#65ffcf' if s in ['repaired','active'] else '#ff9866'
    r(3,4,26,26,'#0a1224');r(4,5,24,23,'#40526d');r(6,7,20,11,'#101e30');r(8,9,16,2,c)
    for i in range(3):r(8,13+i*5,4+((f+i)%3)*4,2,c)
    r(4,29,24,2,'#152b40');r(24,22,2,3,c)
sheet('component',['idle','repaired'],device)
def portal(r,s,f):
    c='#69ffe5' if s=='active' else '#c497ff'
    r(5,1,22,3,'#61718d');r(3,4,4,26,'#30405b');r(25,4,4,26,'#30405b');r(6,29,20,3,'#91a5b5')
    r(7,4,2,25,c);r(23,4,2,25,c)
    for i in range(6):r(10,5+i*4,11,1,'#244653');r(10+(f+i)%4,5+i*4,5,1,c)
sheet('portal',['idle','active'],portal)
sheet('terminal',['idle','active'],device)
def fx(r,s,f):
    c='#a7ffea' if s not in ['enemy','explosion'] else '#ffb579'
    if s in ['bolt','enemy']:r(2+f%2,14,24,4,c);r(9,13,15,6,'#f5ffff');r(0,15,8,2,'#3daea9')
    elif s=='shield':
        for i in range(12):
            a=i*math.pi/6;r(15+int(math.cos(a)*14),15+int(math.sin(a)*14),2,3,c)
    else:
        for i in range(12):
            a=i*math.pi/6;r(15+int(math.cos(a)*(f*2+2)),15+int(math.sin(a)*(f*2+2)),3 if f<4 else 1,3 if f<4 else 1,c)
sheet('fx',['bolt','enemy','explosion','shield','repair','pulse'],fx)
palettes=['#64f4b9','#bb9bff','#62d9ff','#79b6ff','#69e5ed','#f3b775','#a5e58a','#ca9aff','#ff8b74','#ff679f']
for n,c in enumerate(palettes):
    def tile(r,s,f,c=c,n=n):
        r(0,0,32,32,'#111c30');r(1,3,30,28,'#27374b');r(2,4,28,2,'#53647a');r(0,0,32,3,c)
        r(3,8,26,21,'#18273b');r(5,10,22,1,'#3b4a63');r(5,27,22,1,'#080f20')
        for i in range(3):
            x=6+i*8;r(x,14+(n%3)*2,2,8,'#485a70');r(x,14+(n%3)*2,2,2,c)
        if s=='moving':r(12,20,8,2,c);r(15,17,2,8,c)
        if s=='temporary':
            for i in range(0,32,8):r(i,0,4,3,'#ffcc78')
    sheet(f'tiles-{n+1:02}', ['idle','moving','temporary'],tile)
(OUT/'manifest.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')
(ROOT/'src/engine/art-manifest.js').write_text('ByteRunner.artAssets = '+json.dumps(manifest)+';\n',encoding='utf-8')
print(f'Generated {len(manifest)} original atlases.')
