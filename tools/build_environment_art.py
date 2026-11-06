"""Original integer-raster environments. No downloads or third-party images.

Build Hardware first: python tools/build_environment_art.py --phase 1
Then extend: python tools/build_environment_art.py --all
"""
import argparse,json
from pathlib import Path
from pixelart.raster import Raster,panel,circuit
from pixelart.environment import PALETTES as ORIGINAL,decor

ROOT=Path(__file__).resolve().parents[1]
PALETTES=[*ORIGINAL[:9],('#071525','#16354b','#32627e','#61d8ff','#c9f5ff')]
MOTIFS=['cpu','window','port','gateway','antenna','cable','terminal','domain','firewall','rack']

def texture(p,n,f):
    dark,base,mid,neon,light=PALETTES[n]
    p.rect(0,0,32,32,base)
    if n==0:
        for y in [9,23]:p.line(0,y,10,y,mid);p.line(10,y,16,y-6,mid);p.line(16,y-6,31,y-6,mid)
        panel(p,18,12,10,11,dark,mid,dark)
        for x in [19,23,27]:p.rect(x,10,1,2,'#c9ac72');p.rect(x,23,1,2,'#c9ac72')
        p.rect(3,13,4,7,mid);p.pixel(4,14,light)
    elif n==1:
        panel(p,4,6,24,20,dark,mid,dark);p.rect(6,8,20,3,mid)
        for y in [15,19,23]:p.rect(8,y,10+(y%3)*3,1,neon if y==15 else mid)
        p.rect(23,8,2,2,light)
    elif n==2:
        panel(p,3,8,26,16,mid,light,dark);p.rect(6,11,20,8,dark)
        for x in range(8,26,3):p.rect(x,12,1,4,'#e5c783')
        p.rect(5,21,3,1,neon);p.rect(25,21,2,1,'#edb970')
    elif n==3:
        for y in [8,24]:p.rect(0,y,32,5,dark);p.rect(0,y+2,32,1,mid);p.poly([(11,y),(16,y+2),(11,y+5)],neon)
        p.rect(25,13,3,9,mid)
    elif n==4:
        for y in [6,13,20]:
            for x in range(2,32,8):p.rect(x,y,4,1,mid if y!=6 else neon)
        p.rect(14,22,4,7,neon);p.rect(12,29,8,2,dark)
    elif n==5:
        for x in [5,13,21,29]:p.rect(x,0,3,32,dark);p.rect(x,0,1,32,mid)
        for y in [8,25]:p.rect(0,y,32,3,'#a99469');p.pixel(2,y+1,light);p.pixel(28,y+1,dark)
    elif n==6:
        p.line(0,16,32,16,mid);p.line(16,0,16,32,mid)
        for x,y in [(3,3),(21,21)]:panel(p,x,y,9,7,dark,mid,dark);p.rect(x+2,y+2,5,2,neon)
    elif n==7:
        p.line(16,4,16,17,mid);p.line(5,17,27,17,mid)
        for x,y in [(12,2),(2,20),(22,20)]:panel(p,x,y,8,8,dark,mid,dark);p.rect(x+2,y+2,4,1,neon)
    elif n==8:
        for y in [0,16]:
            for x in range(-8 if y else 0,32,16):panel(p,x,y,16,16,base,mid,dark)
        p.rect(14,3,4,26,dark);p.rect(15,4,2,24,neon)
    else:
        for y in [3,13,23]:panel(p,3,y,26,8,dark,mid,dark);p.rect(6,y+2,2,2,neon);p.rect(11,y+2,2,2,'#79e8c8');p.rect(17,y+3,9,1,mid)

def terrain(p,state,f,n):
    dark,base,mid,neon,light=PALETTES[n]
    if state.startswith('inner-'):
        k=int(state[-1]);x=0 if k in [0,3] else 29;y=0 if k<2 else 29
        p.rect(x,y,3,3,dark);p.rect(x+(1 if x==0 else 0),y+(1 if y==0 else 0),2,2,neon)
        return
    texture(p,n,f)
    mask=int(state.split('-')[1])
    if not mask&1:p.rect(0,0,32,4,dark);p.rect(0,1,32,1,light);p.rect(0,3,32,1,neon)
    if not mask&2:p.rect(29,0,3,32,dark);p.rect(29,1,1,30,mid)
    if not mask&4:p.rect(0,29,32,3,dark);p.rect(1,29,30,1,mid)
    if not mask&8:p.rect(0,0,3,32,dark);p.rect(1,1,1,30,mid)
    if mask!=15:
        for x,y in [(5,6),(26,6),(5,25),(26,25)]:p.pixel(x,y,light if (x+y+f)%3 else mid)

def structure(p,state,f,n):
    dark,base,mid,neon,light=PALETTES[n]
    panel(p,4,6,120,116,base,mid,dark)
    if n==0:
        for x in range(8,120,6):p.rect(x,0,3,9,'#cbb47c');p.rect(x,119,3,9,'#cbb47c')
        panel(p,13,16,102,96,dark,light,dark);panel(p,22,25,84,78,base,mid,dark)
        circuit(p,27,30,74,65,mid,f);panel(p,43,44,42,40,dark,neon,dark)
        for y in [53,60,67]:p.rect(49,y,30,2,neon)
    elif n in [1,6,7]:
        p.rect(10,12,108,12,mid)
        for x in [99,107,115]:p.rect(x,16,4,4,neon)
        for row in range(5):
            y=34+row*16;p.rect(15,y,8,7,neon);p.rect(30,y+1,48+row*7,2,mid);p.rect(30,y+6,24+f%3*8,1,light)
        if n==7:p.rect(64,26,2,80,neon);p.rect(64,80,45,2,neon)
    elif n==2:
        for row in [20,70]:
            for x in [12,48,84]:
                panel(p,x,row,31,36,mid,light,dark);p.rect(x+4,row+5,23,20,dark)
                for pin in range(7):p.rect(x+6+pin*3,row+7,1,12,'#e0bd76')
                p.rect(x+4,row+29,5,2,neon if (f+x)%3 else '#f6c56e')
    elif n==3:
        for y in [18,50,82]:
            p.rect(8,y,112,18,dark);p.rect(8,y+3,112,2,mid)
            for x in [24,60,96]:p.poly([(x,y+7),(x+9,y+11),(x,y+15)],neon)
    elif n==4:
        p.rect(58,24,12,88,mid);p.rect(61,25,3,85,light)
        panel(p,20,101,88,19,base,neon,dark)
        for y,w in [(24,92),(44,70),(64,46)]:panel(p,64-w//2,y,w,11,mid,light,dark)
        for radius in [24,36,48]:
            for x in range(20,109,4):
                y=12+abs(64-x)//3+radius//8;p.rect(x,y,2,2,neon if (f+radius)%3 else mid)
    elif n==5:
        for x in [18,42,66,90]:
            p.rect(x,10,12,108,dark);p.rect(x+3,10,5,108,['#cf9a65','#82bba4','#7caecb','#b99ed0'][x//24])
        for y in [26,74,106]:panel(p,9,y,110,8,mid,light,dark)
    elif n==8:
        for y in [12,38,64,90]:
            for x in range(8 if y%4==0 else -8,124,32):panel(p,x,y,30,24,base,mid,dark)
        panel(p,43,35,42,85,dark,neon,dark);p.rect(60,47,8,62,neon)
        for x in [10,105]:p.rect(x,9,12,18,light)
    else:
        for y in range(14,115,20):
            panel(p,12,y,104,17,dark,mid,dark)
            for x in [18,25,32]:p.rect(x,y+5,3,3,neon if (x+f)%3 else '#ffb581')
            for x in range(49,109,5):p.rect(x,y+4,2,8,mid)

def vista(p,state,f,n):
    dark,base,mid,neon,light=PALETTES[n]
    if state=='distant':
        for x in [0,40,88]:
            top=14+(x*7+f*11+n*13)%55;p.rect(x,top,32,128-top,dark);p.rect(x+2,top+2,28,2,base)
            for y in range(top+10,128,13):p.rect(x+5,y,21,1,mid)
    elif state=='middle':
        for x in [6,72]:
            p.rect(x,18,44,110,base);p.rect(x+2,20,40,2,mid)
            for y in range(29,128,17):
                p.rect(x+4,y,36,10,dark);p.rect(x+7,y+3,3,2,neon)
                if n in [0,5]:p.rect(x+17,y+2,2,7,mid)
                elif n in [1,7]:p.rect(x+15,y+3,17,1,mid)
                elif n in [2,9]:
                    for xx in range(x+15,x+33,4):p.rect(xx,y+2,1,5,mid)
        p.rect(0,116,128,5,mid)
    else:
        for x in [0,96]:p.rect(x,0,10,128,dark);p.rect(x+2,0,2,128,mid)
        p.rect(0,10,128,7,base);p.rect(0,12,128,1,neon)
        circuit(p,16,28,78,90,base,f)

def atlas(name,cell,states,painter,n):
    image=Raster(cell*8,cell*len(states));animations={}
    for row,state in enumerate(states):
        for f in range(8):
            frame=Raster(cell,cell);painter(frame,state,f,n);image.blit(frame,f*cell,row*cell)
        animations[state]={'frames':list(range(row*8,row*8+8)),'fps':4,'loop':True}
    path=ROOT/'assets/pixelart/environments'/f'{name}-{n+1:02}.png';image.png(path)
    return {'id':f'{name}-{n+1:02}','src':path.relative_to(ROOT).as_posix(),'frameWidth':cell,'frameHeight':cell,'columns':8,'pixelArt':True,'animations':animations}

def main():
    parser=argparse.ArgumentParser();parser.add_argument('--phase',type=int,choices=range(1,11));parser.add_argument('--all',action='store_true');args=parser.parse_args()
    if not args.all and args.phase is None:parser.error('choose --phase N or --all')
    manifest_path=ROOT/'assets/pixelart/manifest.json';manifest=json.loads(manifest_path.read_text(encoding='utf-8'));by_id={a['id']:a for a in manifest}
    phases=range(10) if args.all else [args.phase-1]
    for n in phases:
        for asset in [atlas('terrain',32,[f'mask-{i}' for i in range(16)]+[f'inner-{i}' for i in range(4)],terrain,n),atlas('structure',128,['structure'],structure,n),atlas('vista',128,['distant','middle','near'],vista,n)]:by_id[asset['id']]=asset
        print(f'Phase {n+1}: terrain (16 masks + 4 inner corners), animated structures, 3 parallax planes')
    manifest=list(by_id.values());manifest_path.write_text(json.dumps(manifest,indent=2),encoding='utf-8');(ROOT/'src/engine/art-manifest.js').write_text('ByteRunner.artAssets = '+json.dumps(manifest)+';\n',encoding='utf-8')
    # Native-pixel Hardware reference: all connection masks and the hero structure.
    preview=Raster(512,320);preview.rect(0,0,512,320,'#07151c')
    for i in range(16):
        p=Raster(32,32);terrain(p,f'mask-{i}',0,0);preview.blit(p,8+(i%8)*36,8+(i//8)*36)
    p=Raster(128,128);structure(p,'structure',0,0);preview.blit(p,12,100)
    for i,state in enumerate(['distant','middle','near']):
        p=Raster(128,128);vista(p,state,0,0);preview.blit(p,128+i*128,158)
    preview.png(ROOT/'assets/pixelart/environments/hardware-reference.png')

if __name__=='__main__':main()
