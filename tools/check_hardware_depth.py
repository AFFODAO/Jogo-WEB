"""Guard the scope: new Hardware art; all other campaign atlases remain original."""
import json,sys,zlib,struct
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'tools'))
from build_environment_art import vista
from pixelart.raster import Raster

def pixels(path):
    data=path.read_bytes();offset=8;compressed=b''
    while offset<len(data):
        length=struct.unpack('!I',data[offset:offset+4])[0];kind=data[offset+4:offset+8];payload=data[offset+8:offset+8+length]
        if kind==b'IDAT':compressed+=payload
        offset+=length+12
    return zlib.decompress(compressed)

for n in range(1,10):
    atlas=Raster(1024,384)
    for row,state in enumerate(['distant','middle','near']):
        for f in range(8):
            tile=Raster(128,128);vista(tile,state,f,n);atlas.blit(tile,f*128,row*128)
    expected=b''.join(b'\0'+atlas.data[y*atlas.w*4:(y+1)*atlas.w*4] for y in range(atlas.h))
    assert pixels(ROOT/f'assets/pixelart/environments/vista-{n+1:02}.png')==expected,'later phase painter/atlas mismatch '+str(n+1)
manifest=json.loads((ROOT/'assets/pixelart/manifest.json').read_text())
hardware=next(a for a in manifest if a['id']=='vista-01')
assert hardware['frameWidth']==hardware['frameHeight']==128 and hardware['columns']==8
assert list(hardware['animations'])==['distant','middle','near','close']
js=(ROOT/'src/engine/art-manifest.js').read_text()
assert json.loads(js[len('ByteRunner.artAssets = '):].strip().removesuffix(';'))==manifest
print('PASS: Hardware has four native PNG planes; phases 2..10 keep their existing raster composition; asset manifests agree')
