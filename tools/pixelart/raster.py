"""Integer raster primitives and RGBA PNG writer; no external dependencies."""
import math, struct, zlib
from pathlib import Path

def color(value):
    if isinstance(value,tuple):return value
    value=value.lstrip('#')
    return tuple(int(value[i:i+2],16) for i in (0,2,4))+(int(value[6:8],16) if len(value)==8 else 255,)

class Raster:
    def __init__(self,w,h):self.w=w;self.h=h;self.data=bytearray(w*h*4)
    def pixel(self,x,y,c):
        x,y=int(x),int(y)
        if 0<=x<self.w and 0<=y<self.h:self.data[(y*self.w+x)*4:(y*self.w+x)*4+4]=bytes(color(c))
    def rect(self,x,y,w,h,c):
        x,y,w,h=map(int,(x,y,w,h));rgba=bytes(color(c))
        a,b=max(0,x),min(self.w,x+w)
        if b<=a:return
        row=rgba*(b-a)
        for yy in range(max(0,y),min(self.h,y+h)):self.data[(yy*self.w+a)*4:(yy*self.w+b)*4]=row
    def line(self,x,y,xx,yy,c,width=1):
        x,y,xx,yy=map(round,(x,y,xx,yy));dx,dy=abs(xx-x),-abs(yy-y);sx=1 if x<xx else -1;sy=1 if y<yy else -1;err=dx+dy
        while True:
            self.rect(x-width//2,y-width//2,width,width,c)
            if x==xx and y==yy:break
            e=err*2
            if e>=dy:err+=dy;x+=sx
            if e<=dx:err+=dx;y+=sy
    def poly(self,points,c):
        for y in range(max(0,min(p[1] for p in points)),min(self.h,max(p[1] for p in points)+1)):
            intersections=[]
            for i,(x1,y1) in enumerate(points):
                x2,y2=points[(i+1)%len(points)]
                if (y1<=y<y2) or (y2<=y<y1):intersections.append(x1+(y-y1)*(x2-x1)/(y2-y1))
            intersections.sort()
            for i in range(0,len(intersections)-1,2):self.rect(math.ceil(intersections[i]),y,math.floor(intersections[i+1])-math.ceil(intersections[i])+1,1,c)
    def ellipse(self,cx,cy,rx,ry,c,outline=False):
        for y in range(int(cy-ry)-1,int(cy+ry)+2):
            for x in range(int(cx-rx)-1,int(cx+rx)+2):
                d=((x-cx)/max(1,rx))**2+((y-cy)/max(1,ry))**2
                if d<=1 and (not outline or ((x-cx)/max(1,rx-1))**2+((y-cy)/max(1,ry-1))**2>1):self.pixel(x,y,c)
    def blit(self,source,x,y):
        for yy in range(source.h):
            for xx in range(source.w):
                i=(yy*source.w+xx)*4
                if source.data[i+3]:self.pixel(x+xx,y+yy,tuple(source.data[i:i+4]))
    def outline(self,c='#090c20'):
        old=bytes(self.data)
        for y in range(self.h):
            for x in range(self.w):
                if old[(y*self.w+x)*4+3]:continue
                if any(0<=xx<self.w and 0<=yy<self.h and old[(yy*self.w+xx)*4+3] for xx,yy in [(x-1,y),(x+1,y),(x,y-1),(x,y+1)]):self.pixel(x,y,c)
    def png(self,path):
        def chunk(kind,data):return struct.pack('!I',len(data))+kind+data+struct.pack('!I',zlib.crc32(kind+data)&0xffffffff)
        raw=b''.join(b'\0'+self.data[y*self.w*4:(y+1)*self.w*4] for y in range(self.h))
        Path(path).parent.mkdir(parents=True,exist_ok=True)
        Path(path).write_bytes(b'\x89PNG\r\n\x1a\n'+chunk(b'IHDR',struct.pack('!IIBBBBB',self.w,self.h,8,6,0,0,0))+chunk(b'IDAT',zlib.compress(raw,9))+chunk(b'IEND',b''))

def panel(p,x,y,w,h,base='#24374c',light='#627e94',dark='#101a2c'):
    p.rect(x,y,w,h,dark);p.rect(x+1,y+1,w-2,h-2,base);p.rect(x+2,y+1,w-4,1,light);p.rect(x+1,y+2,1,h-4,light);p.rect(x+2,y+h-2,w-3,1,dark);p.rect(x+w-2,y+2,1,h-3,dark)
    for xx,yy in [(x+3,y+3),(x+w-4,y+3),(x+3,y+h-4),(x+w-4,y+h-4)]:p.pixel(xx,yy,'#91a4ac')

def circuit(p,x,y,w,h,c,seed=0):
    for i in range(3):
        yy=y+3+(i*9+seed*3)%max(4,h-7);xx=x+3+(i*11+seed)%max(4,w-9)
        p.line(x+2,yy,xx,yy,c);p.line(xx,yy,xx,min(y+h-3,yy+5+i),c);p.line(xx,min(y+h-3,yy+5+i),x+w-3,min(y+h-3,yy+5+i),c);p.rect(xx-1,yy-1,3,3,c);p.pixel(xx,yy,'#c4f7d5')
