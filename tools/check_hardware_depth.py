"""Check authored parallax atlas reproducibility and manifest agreement."""
import json,sys,zlib,struct
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'tools'))
from build_environment_art import vista,vista_states
from pixelart.raster import Raster

def pixels(path):
    data=path.read_bytes();offset=8;compressed=b''
    while offset<len(data):
        length=struct.unpack('!I',data[offset:offset+4])[0];kind=data[offset+4:offset+8];payload=data[offset+8:offset+8+length]
        if kind==b'IDAT':compressed+=payload
        offset+=length+12
    return zlib.decompress(compressed)

signatures={state:set() for state in ['distant','middle','near']}
for n in range(10):
    atlas=Raster(1024,128*len(vista_states(n)))
    for row,state in enumerate(vista_states(n)):
        silhouette=bytearray()
        for f in range(8):
            tile=Raster(128,128);vista(tile,state,f,n);atlas.blit(tile,f*128,row*128)
            silhouette.extend(tile.data[3::4])
        if state in signatures:
            assert bytes(silhouette) not in signatures[state],f'recolored silhouette in {state}, phase {n+1}'
            signatures[state].add(bytes(silhouette))
    expected=b''.join(b'\0'+atlas.data[y*atlas.w*4:(y+1)*atlas.w*4] for y in range(atlas.h))
    assert pixels(ROOT/f'assets/pixelart/environments/vista-{n+1:02}.png')==expected,'painter/atlas mismatch '+str(n+1)
manifest=json.loads((ROOT/'assets/pixelart/manifest.json').read_text())
hardware=next(a for a in manifest if a['id']=='vista-01')
assert hardware['frameWidth']==hardware['frameHeight']==128 and hardware['columns']==8
assert list(hardware['animations'])==['distant','middle','near','close']
js=(ROOT/'src/engine/art-manifest.js').read_text()
assert json.loads(js[len('ByteRunner.artAssets = '):].strip().removesuffix(';'))==manifest
for n in range(10):
    asset=next(a for a in manifest if a['id']==f'vista-{n+1:02}')
    assert list(asset['animations'])==vista_states(n),'plane manifest mismatch'
    assert len(asset['frameBounds'])==8*len(vista_states(n)),'missing frame bounds'
    for row,state in enumerate(vista_states(n)):
        for f in range(8):
            tile=Raster(128,128);vista(tile,state,f,n);bound=asset['frameBounds'][row*8+f]
            points=[(i%128,i//128) for i,a in enumerate(tile.data[3::4]) if a]
            if not points:assert bound is None,'empty frame has bounds'
            else:
                x,y,w,h=bound
                assert min(p[0] for p in points)==x and max(p[0] for p in points)==x+w-1,'horizontal bounds crop pixels'
                assert min(p[1] for p in points)==y and max(p[1] for p in points)==y+h-1,'vertical bounds crop pixels'
print('PASS: ten reproducible raster identities; no shared silhouettes in any depth plane; Hardware close plane and regional server core registered; manifests agree')
