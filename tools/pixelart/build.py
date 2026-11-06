"""Build BYTE RUNNER PNG atlases, manifest and a native-pixel reference sheet."""
import json, math
from pathlib import Path
from .raster import Raster,panel,circuit
from .actors import robot,enemy,ROBOT_STATES,ENEMY_STATES
from .environment import tile,decor,skyline,TILE_STATES,DECOR_STATES
ROOT=Path(__file__).resolve().parents[2]
MANIFEST=[]
def sheet(name,folder,w,h,states,painter,aliases=None):
    atlas=Raster(w*8,h*len(states));animations={}
    for row,state in enumerate(states):
        for frame in range(8):
            image=Raster(w,h);painter(image,state,frame);atlas.blit(image,frame*w,row*h)
        fps=16 if state in ['run','move'] else 24 if state=='attack' else 12 if state in ['jump','fall','death','ability'] else 8
        animations[state]={'frames':list(range(row*8,row*8+8)),'fps':fps,'loop':state not in ['death','explosion','ability']}
    for alias,target in (aliases or {}).items():animations[alias]=animations[target]
    path=ROOT/'assets/pixelart'/folder/(name+'.png');atlas.png(path)
    MANIFEST.append(dict(id=name,src=path.relative_to(ROOT).as_posix(),frameWidth=w,frameHeight=h,columns=8,pixelArt=True,animations=animations))
def device(p,state,f):
    active=state in ['repaired','active'];neon='#7aebc1' if active else '#ec9a75';dark='#111a2f';base='#425a70';mid='#8196a4'
    panel(p,2,5,28,37,base,mid,dark);panel(p,5,8,22,16,dark,neon,dark);p.rect(8,11,16,2,neon);p.rect(8,16,10+(f%3)*2,1,mid)
    for x in [6,13,20]:panel(p,x,28,5,7,dark,mid,dark);p.pixel(x+2,30,neon)
    for y in [25,38]:p.rect(6,y,20,1,dark)
    if not active:p.line(12,7,16,15,dark,2);p.line(16,15,13,19,dark);p.rect(25,4,2,2,neon if f%2 else '#f3e0bc')
    else:p.rect(8,19,3,1,'#edf4cb');p.rect(14,19,7,1,'#edf4cb')
    p.rect(5,42,7,3,dark);p.rect(20,42,7,3,dark)
def portal(p,state,f):
    neon='#78e2c7' if state=='active' else '#ae93df';dark='#121b32';base='#3f5069';mid='#8199ae'
    panel(p,4,2,40,60,base,mid,dark);p.rect(10,8,28,49,dark)
    for x in [7,39]:
        for y in range(9,55,9):p.rect(x,y,2,5,neon)
    for y in range(10,56,4):p.rect(13,y,22,1,'#254754');p.rect(14+(f+y)%7,y,7,1,neon)
    panel(p,13,3,22,6,dark,mid,dark);p.rect(17,5,14,1,neon);p.rect(7,58,34,2,mid);p.rect(11,60,26,2,dark)
def fx(p,state,f):
    mint='#8af3d4';white='#eaffdd';orange='#f3b57b'
    if state in ['bolt','enemy']:
        c=orange if state=='enemy' else mint;p.poly([(2,15),(8,12),(23,12),(29,15),(23,19),(8,19)],'#28495e');p.rect(8,14,17,3,c);p.rect(15,15,12,1,white);p.rect(1+f%3,15,8,1,c)
    elif state=='shield':
        p.ellipse(16,16,14,14,'#528bb3',True)
        for i in range(12):
            a=i*math.pi/6+f*.08;p.rect(16+round(math.cos(a)*14)-1,16+round(math.sin(a)*14)-1,2,2,mint)
    else:
        for i in range(8):
            a=i*math.pi/4;d=3+f*1.5;x=16+round(math.cos(a)*d);y=16+round(math.sin(a)*d);p.line(x,y,x+round(math.cos(a)*3),y+round(math.sin(a)*3),orange if state=='explosion' else mint,2 if f<5 else 1)
        p.ellipse(16,16,max(1,7-f),max(1,7-f),white if f<4 else mint)
def main():
    MANIFEST.clear()
    sheet('r07','actors',32,48,ROBOT_STATES,robot)
    for phase in range(10):
        sheet(f'tiles-{phase+1:02}','tilesets',32,32,TILE_STATES,lambda p,s,f,n=phase:tile(p,s,f,n))
        sheet(f'decor-{phase+1:02}','scenery',64,64,DECOR_STATES,lambda p,s,f,n=phase:decor(p,s,f,n))
        sheet(f'sky-{phase+1:02}','backgrounds',96,96,['idle'],lambda p,s,f,n=phase:skyline(p,f,n))
    aliases={s:'move' for s in ['run','patrol','chase','retreat','recover','position','aim','fall','infect']}
    for kind in ['basic','fast','armored','flyer','shooter','parasite','boss']:
        size=64 if kind=='boss' else 32;sheet('virus-'+kind,'enemies',size,size,ENEMY_STATES,lambda p,s,f,k=kind:enemy(p,s,f,k),aliases)
    for variant,kind in [('file','basic'),('packet','shooter'),('wifi','flyer'),('dns','shooter'),('firewall','armored')]:sheet('virus-'+variant,'enemies',32,32,ENEMY_STATES,lambda p,s,f,k=kind,v=variant:enemy(p,s,f,k,v),aliases)
    sheet('component','objects',32,48,['idle','repaired'],device);sheet('terminal','objects',32,48,['idle','active'],device)
    sheet('portal','objects',48,64,['idle','active'],portal);sheet('fx','effects',32,32,['bolt','enemy','explosion','shield','repair','pulse'],fx)
    directory=ROOT/'assets/pixelart';directory.mkdir(exist_ok=True)
    if (directory/'manifest.json').exists():
        MANIFEST.extend(a for a in json.loads((directory/'manifest.json').read_text(encoding='utf-8')) if a['id'].startswith(('terrain-','structure-','vista-')) and (ROOT/a['src']).exists())
    (directory/'manifest.json').write_text(json.dumps(MANIFEST,indent=2),encoding='utf-8')
    (ROOT/'src/engine/art-manifest.js').write_text('ByteRunner.artAssets = '+json.dumps(MANIFEST)+';\n',encoding='utf-8')
    preview=Raster(640,720);preview.rect(0,0,640,720,'#0c1424')
    for row,state in enumerate(ROBOT_STATES):
        for f in range(8):p=Raster(32,48);robot(p,state,f);preview.blit(p,8+f*40,8+row*52)
    for i,kind in enumerate(['basic','fast','armored','flyer','shooter','parasite','boss']):
        size=64 if kind=='boss' else 32;p=Raster(size,size);enemy(p,'move',2,kind);preview.blit(p,365+(i%3)*84,15+(i//3)*82)
    for phase in range(10):
        for j,state in enumerate(['idle','fill','moving','temporary','wall']):p=Raster(32,32);tile(p,state,phase%8,phase);preview.blit(p,8+j*36+(phase%2)*208,490+(phase//2)*42)
    preview.png(directory/'contact-sheet.png');print(f'Generated {len(MANIFEST)} PNG atlases; R-07: 32x48, 9 states x 8 frames.')
if __name__=='__main__':main()
