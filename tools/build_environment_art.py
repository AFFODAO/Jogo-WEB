"""Original integer-raster environments. No downloads or third-party images.

Build Hardware first: python tools/build_environment_art.py --phase 1
Then extend: python tools/build_environment_art.py --all
"""
import argparse,json
from pathlib import Path
from pixelart.raster import Raster,color,panel,circuit
from pixelart.environment import PALETTES as ORIGINAL,decor
from pixelart.identities import paint as identity_vista

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

def blend(a,b,weight):
    return tuple(round(x+(y-x)*weight) for x,y in zip(color(a),color(b)))

def terrain(p,state,f,n):
    dark,base,mid,neon,light=PALETTES[n]
    if state.startswith('inner-'):
        k=int(state[-1]);x=0 if k in [0,3] else 29;y=0 if k<2 else 29
        p.rect(x,y,3,3,dark);p.rect(x+(1 if x==0 else 0),y+(1 if y==0 else 0),2,2,neon)
        return
    # Preserve the theme silhouette while leaving quiet panels between motifs.
    quiet=f in (2,6)
    fill=blend(base,dark,.18 if quiet else .08)
    p.rect(0,0,32,32,fill)
    if quiet:
        p.rect(5,8,22,16,blend(fill,dark,.23))
        p.rect(7,9,18,1,blend(fill,mid,.30))
    else:
        sample=Raster(32,32)
        texture(sample,n,f)
        muted={}
        for y in range(4,29):
            for x in range(3,29):
                sx=31-x if f&1 else x
                sy=32-y if f&4 else y
                pos=(sy*32+sx)*4
                ink=tuple(sample.data[pos:pos+4])
                if ink not in muted:muted[ink]=blend(fill,ink,.38)
                p.pixel(x,y,muted[ink])
    mask=int(state.split('-')[1])
    if not mask&1:
        p.rect(0,0,32,4,dark)
        p.rect(0,1,32,1,blend(mid,light,.58))
        p.rect(0,3,32,1,blend(base,neon,.30))
        if f in (0,5):p.rect(9,1,8,1,blend(mid,light,.85))
    if not mask&2:p.rect(29,0,3,32,dark);p.rect(29,1,1,30,mid)
    if not mask&4:p.rect(0,29,32,3,dark);p.rect(1,29,30,1,mid)
    if not mask&8:p.rect(0,0,3,32,dark);p.rect(1,1,1,30,mid)
    if mask!=15 and not quiet:
        for x,y in [(5,6),(26,6),(5,25),(26,25)]:p.pixel(x,y,blend(base,mid,.65))

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

def hardware_vista(p,state,f):
    """Authored hardware bays: restrained solid colors, two-pixel material marks.

    Empty variants are deliberate breathing room. No luminous circuits or grid.
    All shapes stay inside their cell so both camera axes remain seamless.
    """
    if state=='distant':
        if f not in [0,3,6]:return
        p.rect(12,24,92,88,'#0b1d20')
        p.rect(20,16,60,8,'#0b1d20')
        p.rect(16,28,84,4,'#102528')
        p.rect(24,42,60,60,'#0d2124')
        p.rect(92,40,8,64,'#08191c')
        if f==3:
            p.rect(34,40,48,46,'#102528');p.rect(40,46,36,34,'#0b1d20')
            for x in [38,50,62,74]:
                p.rect(x,34,4,6,'#203932');p.rect(x,86,4,6,'#203932')
            # Two bounded traces, with a small muted luminous contact.
            p.line(20,66,30,66,'#18352e',2);p.line(88,58,104,58,'#18352e',2)
            p.rect(100,56,4,4,'#294d3f')
        elif f==6:
            p.line(26,38,26,88,'#122c28',2);p.line(26,88,70,88,'#122c28',2)
            p.rect(68,86,4,4,'#254334')
        return
    if state=='close':
        if f!=5:return
        p.rect(94,12,12,100,'#0b1d21')
        p.rect(94,12,2,100,'#20383d')
        for y in [24,92]:
            p.rect(90,y,20,8,'#142b30');p.rect(92,y,16,2,'#294146')
        return
    if state=='middle':
        if f not in [0,4]:return
        # A recessed memory bank, with broad sockets and grouped gold contacts.
        p.rect(14,24,100,84,'#09191c')
        p.rect(14,24,100,2,'#284045');p.rect(14,26,2,80,'#1e3439')
        p.rect(18,104,92,4,'#071719')
        for y in [36,66]:
            p.rect(24,y,78,24,'#183136')
            p.rect(24,y,78,2,'#30494d')
            for x in [32,54,76]:
                p.rect(x,y+6,16,10,'#0c2025');p.rect(x,y+6,16,2,'#223c42')
                p.rect(x+2,y+20,10,2,'#4c4b3a')
            p.rect(20,y+4,4,16,'#2b4246');p.rect(102,y+4,4,16,'#2b4246')
        p.rect(26,96,14,2,'#3c5555')
        return
    if f not in [2,6]:return
    # One heatsink or a pair of stepped capacitors, never a field of tiny chips.
    if f==2:
        p.rect(16,26,96,80,'#08191d')
        p.rect(20,30,88,72,'#20373d')
        p.rect(20,30,88,2,'#3e5559')
        for x in [28,44,60,76,92]:
            p.rect(x,38,8,52,'#0d232a');p.rect(x,38,2,50,'#314b52')
        p.rect(24,96,80,4,'#11282e')
        for x in [24,100]:p.rect(x,34,4,4,'#4a5d5c')
    else:
        for x,y,h in [(24,40,58),(66,26,72)]:
            p.rect(x,y+6,28,h-6,'#11262c')
            p.rect(x+4,y,20,6,'#354b50')
            p.rect(x,y+6,28,4,'#2b434a')
            p.rect(x+4,y+12,4,h-20,'#243e46')
            p.rect(x+24,y+10,4,h-10,'#091b20')
            p.rect(x+8,y+2,12,2,'#52615b')
        p.rect(18,100,84,6,'#0b1e23')

def vista(p,state,f,n):
    if n==0:
        hardware_vista(p,state,f);return
    identity_vista(p,state,f,n)

def vista_states(n):
    return ['distant','middle','near']+(['close'] if n==0 else ['arena'] if n==9 else [])

def atlas(name,cell,states,painter,n):
    image=Raster(cell*8,cell*len(states));animations={};empty_frames=[];frame_bounds=[]
    for row,state in enumerate(states):
        for f in range(8):
            frame=Raster(cell,cell);painter(frame,state,f,n);image.blit(frame,f*cell,row*cell)
            if not any(frame.data[3::4]):empty_frames.append(row*8+f)
            if name=='vista':
                occupied=[i//4 for i in range(0,len(frame.data),4) if frame.data[i+3]]
                if occupied:
                    left=min(i%cell for i in occupied);right=max(i%cell for i in occupied)
                    top=min(i//cell for i in occupied);bottom=max(i//cell for i in occupied)
                    frame_bounds.append([left,top,right-left+1,bottom-top+1])
                else:frame_bounds.append(None)
        animations[state]={'frames':list(range(row*8,row*8+8)),'fps':4,'loop':True}
    path=ROOT/'assets/pixelart/environments'/f'{name}-{n+1:02}.png';image.png(path)
    return {'id':f'{name}-{n+1:02}','src':path.relative_to(ROOT).as_posix(),'frameWidth':cell,'frameHeight':cell,'columns':8,'pixelArt':True,'animations':animations,**({'spatialVariants':True,'emptyFrames':empty_frames,'frameBounds':frame_bounds} if name=='vista' else {})}

def main():
    parser=argparse.ArgumentParser();parser.add_argument('--phase',type=int,choices=range(1,11));parser.add_argument('--all',action='store_true');parser.add_argument('--terrain-all',action='store_true');parser.add_argument('--parallax-all',action='store_true');parser.add_argument('--parallax-hardware',action='store_true');parser.add_argument('--parallax-phase',type=int,choices=range(1,11));args=parser.parse_args()
    masks=[f'mask-{i}' for i in range(16)]+[f'inner-{i}' for i in range(4)]
    if args.terrain_all:
        for n in range(10):atlas('terrain',32,masks,terrain,n)
        print('Rebuilt ten terrain atlases with unchanged frame layout');return
    if not args.all and args.phase is None and not args.parallax_hardware and not args.parallax_all and args.parallax_phase is None:parser.error('choose --phase N, --all, --terrain-all or --parallax-phase N')
    manifest_path=ROOT/'assets/pixelart/manifest.json';manifest=json.loads(manifest_path.read_text(encoding='utf-8'));by_id={a['id']:a for a in manifest}
    if args.parallax_all:
        for n in range(10):
            asset=atlas('vista',128,vista_states(n),vista,n);by_id[asset['id']]=asset
        manifest=list(by_id.values());manifest_path.write_text(json.dumps(manifest,indent=2),encoding='utf-8');(ROOT/'src/engine/art-manifest.js').write_text('ByteRunner.artAssets = '+json.dumps(manifest)+';\n',encoding='utf-8')
        print('Rebuilt ten background atlases and their metadata only; terrain and structures unchanged');return
    if args.parallax_hardware or args.parallax_phase is not None:
        n=0 if args.parallax_hardware else args.parallax_phase-1
        states=vista_states(n)
        asset=atlas('vista',128,states,vista,n);by_id[asset['id']]=asset
        manifest=list(by_id.values());manifest_path.write_text(json.dumps(manifest,indent=2),encoding='utf-8');(ROOT/'src/engine/art-manifest.js').write_text('ByteRunner.artAssets = '+json.dumps(manifest)+';\n',encoding='utf-8')
        print(f'Phase {n+1}: authored parallax only; terrain, actors and other phase atlases unchanged');return
    phases=range(10) if args.all else [args.phase-1]
    for n in phases:
        for asset in [atlas('terrain',32,masks,terrain,n),atlas('structure',128,['structure'],structure,n),atlas('vista',128,vista_states(n),vista,n)]:by_id[asset['id']]=asset
        print(f'Phase {n+1}: terrain (16 masks + 4 inner corners), animated structures, {4 if n==0 else 3} parallax planes')
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
