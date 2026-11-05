"""Reusable 32px tiles and 64px authored scenery, with ten material languages."""
import math
from .raster import panel,circuit

PALETTES=[
    ('#0b1928','#18383b','#386057','#6de4bb','#ccedbd'),
    ('#11172b','#292c50','#535980','#a99be9','#e4d8fa'),
    ('#0b192a','#203c4e','#44647a','#71cde3','#dbefda'),
    ('#101b30','#273b5c','#4a6581','#7cb4ed','#d9e6fa'),
    ('#0c192c','#21445c','#40748c','#7cdae6','#d1f9e7'),
    ('#131b28','#343a43','#68685f','#dab47a','#ece0b0'),
    ('#101f2a','#254b43','#567e65','#a5d78f','#e0edb7'),
    ('#16182f','#373354','#6b648f','#b7a1e2','#f0d7ed'),
    ('#201827','#482f43','#7b4b60','#eb887e','#ffd9aa'),
    ('#121a2e','#2c354f','#5b5d80','#df83b3','#eddded')
]
TILE_STATES=['idle','moving','temporary','fill','bottom','wall','dangerous','trim','wire','screen','backdrop']
DECOR_STATES=['cpu','ram','gpu','fan','terminal','core','antenna','rack','folder','port','gateway','domain','firewall','cable','wall','window']

def material(p,phase,f):
    dark,base,mid,neon,light=PALETTES[phase]
    p.rect(0,0,32,32,base)
    # Sparse deterministic grain and seams; palette clusters, never smooth noise.
    for y in range(3,32,7):
        for x in range(3,32,7):
            if (x*3+y+f)%5==0:p.pixel(x,y,mid)
    if phase==0:
        circuit(p,0,0,32,32,mid,f);panel(p,11,11,10,10,dark,mid,dark);p.rect(13,13,6,6,base)
        for i in range(4):p.rect(8+i*4,8,2,2,'#ac9d66');p.rect(8+i*4,23,2,2,'#ac9d66')
    elif phase==1:
        for x,y in [(3,6),(18,18)]:panel(p,x,y,11,12,mid,neon,dark);p.rect(x+2,y+4,6,1,light);p.rect(x+2,y+7,5,1,base)
    elif phase==2:
        panel(p,3,7,26,18,mid,light,dark);p.rect(6,9,20,12,dark)
        for i in range(6):p.rect(7+i*3,11,1,5,'#cdb780');p.pixel(7+i*3,22,neon)
    elif phase==3:
        for y in [7,22]:p.line(2,y,26,y,mid,2);p.poly([(23,y-4),(29,y),(23,y+4)],neon)
        p.rect(10,10,3,10,dark);p.pixel(11,12,light)
    elif phase==4:
        p.line(16,11,16,27,mid,3);p.ellipse(16,11,2,2,neon)
        for radius in [5,10,14]:
            for a in range(205,336,10):p.pixel(16+round(math.cos(math.radians(a))*radius),14+round(math.sin(math.radians(a))*radius),neon if radius==5 else mid)
    elif phase==5:
        for x in [6,13,20,27]:p.line(x,0,x,31,dark,4);p.line(x,0,x,31,mid,2)
        for y in [5,26]:p.rect(2,y,28,3,'#95876c');p.pixel(3,y+1,light);p.pixel(28,y+1,dark)
    elif phase==6:
        for x,y in [(4,5),(20,21)]:panel(p,x,y,9,7,dark,mid,dark);p.rect(x+2,y+2,5,2,neon)
        p.line(8,12,8,23,mid);p.line(8,23,20,23,neon);p.rect(21,5,6,2,light)
    elif phase==7:
        for x,y in [(14,3),(5,21),(24,21)]:p.rect(x-3,y,7,6,dark);p.rect(x-2,y+1,5,1,neon)
        p.line(14,9,14,16,mid);p.line(5,16,25,16,mid);p.line(5,16,5,21,neon);p.line(25,16,25,21,neon)
    elif phase==8:
        for y in [0,11,22]:
            p.rect(0,y,32,1,dark)
            for x in range(-8+(y%2)*8,32,16):p.rect(x,y+1,1,10,dark);p.rect(x+2,y+2,12,1,mid)
        p.rect(14,3,4,26,base);p.rect(15,4,1,24,neon)
    else:
        for y in [3,13,23]:panel(p,3,y,26,8,dark,mid,dark);p.rect(6,y+2,2,2,neon);p.rect(11,y+2,2,2,'#7cdac5');p.rect(17,y+3,9,1,mid)

def tile(p,state,f,phase):
    dark,base,mid,neon,light=PALETTES[phase]
    if state=='backdrop':
        p.rect(0,0,32,32,dark)
        p.line(0,8,14,8,base);p.line(14,8,14,22,base);p.line(14,22,31,22,base);p.rect(13,7,3,3,base);p.pixel(14,8,mid)
        if phase in [1,7]:p.rect(23,2,6,4,base);p.rect(24,3,3,1,mid)
        elif phase in [5,9]:p.rect(28,0,1,32,base)
        return
    material(p,phase,f)
    if state=='fill':return
    if state=='wall':
        p.rect(0,0,4,32,dark);p.rect(4,0,2,32,mid);p.rect(6,0,1,32,neon)
        for y in range(3,32,8):p.rect(1,y,2,2,light)
        return
    if state=='wire':p.rect(0,12,32,9,dark);p.rect(0,14,32,2,neon);p.rect(0,18,32,1,mid);return
    if state=='screen':panel(p,2,2,28,28,mid,light,dark);p.rect(5,5,22,22,dark);circuit(p,6,6,20,20,neon,f);return
    if state=='bottom':p.rect(0,27,32,5,dark);p.rect(2,27,28,1,mid);return
    p.rect(0,0,32,7,dark);p.rect(0,1,32,2,mid);p.rect(1,1,30,1,light);p.rect(0,4,32,1,neon);p.rect(0,7,32,1,dark)
    for x in [3,28]:p.rect(x,9,2,2,light);p.pixel(x+1,10,dark)
    if state=='moving':
        p.rect(10,12,13,12,dark);p.poly([(11,18),(17,13),(17,16),(22,16),(22,20),(17,20),(17,23)],neon)
        p.rect((f*3)%28,5,4,1,light)
    elif state=='temporary':
        p.rect(0,0,32,7,dark)
        for x in range(-4,36,8):p.line(x,6,x+5,1,'#e6bc77',3)
        p.rect(11,14,11,10,dark);p.line(13,15,19,21,neon);p.line(19,15,13,21,neon)
    elif state=='dangerous':
        for x in range(0,32,8):p.poly([(x,7),(x+3,0),(x+6,7)],'#ff8e9c');p.pixel(x+3,2,'#ffe4c4')
    elif state=='trim':p.rect(0,12,32,4,dark);p.rect(0,13,32,1,neon)

def decor(p,state,f,phase):
    dark,base,mid,neon,light=PALETTES[phase]
    if state=='cpu':
        for i in range(8,58,6):p.rect(i,3,3,58,'#a39b75');p.rect(3,i,58,3,'#a39b75')
        panel(p,8,8,48,48,mid,light,dark);panel(p,13,13,38,38,base,mid,dark);panel(p,19,18,26,27,dark,neon,dark)
        circuit(p,20,20,24,22,mid,f);p.rect(24,24,15,3,neon);p.rect(25,25,11,1,light)
        for y in [34,38]:p.rect(24,y,15,1,mid)
        p.rect(11,12,3,3,neon);p.rect(48,49,3,3,'#dfb675')
    elif state=='ram':
        panel(p,5,3,54,57,'#24473b',neon,dark)
        for x in [10,34]:
            for y in [10,31]:
                for i in range(0,16,3):p.rect(x+i,y-2,1,20,'#a69b73')
                panel(p,x,y,16,16,dark,mid,dark);p.rect(x+3,y+4,10,1,mid);p.rect(x+3,y+7,7,1,mid)
        for x in range(8,57,5):p.rect(x,55,3,8,'#d4b577')
        p.rect(15,4,2,2,light);p.rect(48,50,3,2,neon)
    elif state in ['gpu','fan']:
        panel(p,2,4,60,56,base,mid,dark)
        for x in range(7,59,4):p.rect(x,8,1,48,mid)
        p.ellipse(32,32,24,24,dark);p.ellipse(32,32,22,22,mid,True)
        for i in range(7):
            a=i*math.pi*2/7+f*math.pi/16
            points=[(32+round(math.cos(a)*6),32+round(math.sin(a)*6)),(32+round(math.cos(a+.25)*21),32+round(math.sin(a+.25)*21)),(32+round(math.cos(a+.8)*18),32+round(math.sin(a+.8)*18)),(32+round(math.cos(a+.6)*8),32+round(math.sin(a+.6)*8))]
            p.poly(points,base if i%2 else mid)
        p.ellipse(32,32,7,7,base);p.ellipse(32,32,4,4,neon);p.pixel(30,30,light)
        for x,y in [(5,7),(57,7),(5,55),(57,55)]:p.rect(x,y,2,2,light)
    elif state in ['rack','domain','window']:
        panel(p,4,2,56,60,base,mid,dark);p.rect(8,6,48,5,mid);p.rect(10,7,23,1,light)
        for row in range(15,58,11):
            panel(p,8,row,48,9,dark,mid,dark);p.rect(11,row+3,3,2,neon if (row+f)%3 else '#dbb87e');p.rect(17,row+3,2,2,'#83c4ca');p.rect(25,row+3,25,1,mid);p.rect(25,row+5,14,1,base)
        if state=='domain':p.line(25,13,25,50,neon);p.line(25,38,47,38,neon);p.rect(44,36,5,5,light)
        if state=='window':p.rect(43,7,3,2,'#df8399');p.rect(49,7,3,2,'#e4bd82')
    elif state=='antenna':
        panel(p,10,50,44,12,base,mid,dark);p.line(32,16,32,52,mid,5);p.line(32,16,32,50,light,1)
        p.poly([(16,24),(48,24),(40,35),(24,35)],base);p.line(16,24,48,24,neon,2);p.ellipse(32,17,4,4,neon)
        for radius in [9,17,25]:
            for a in range(205,336,6):p.pixel(32+round(math.cos(math.radians(a))*radius),23+round(math.sin(math.radians(a))*radius),neon if f%3==radius%3 else mid)
        p.rect(15,54,4,3,neon)
    elif state=='folder':
        p.poly([(6,12),(25,12),(30,19),(57,19),(60,53),(5,56)],dark)
        p.poly([(8,14),(24,14),(29,21),(55,21),(57,51),(7,54)],mid)
        p.poly([(5,28),(61,25),(55,56),(9,58)],base);p.line(7,29,59,26,neon,2)
        panel(p,17,34,29,16,dark,mid,dark);p.rect(21,38,20,2,light);p.rect(21,43,14,1,neon)
    elif state=='port':
        panel(p,2,5,60,52,mid,light,dark);p.rect(7,11,50,36,dark);p.rect(12,15,40,26,base);p.rect(18,13,28,5,dark)
        for x in range(15,52,5):p.rect(x,20,2,17,'#d0b57b');p.rect(x,20,1,11,light)
        p.rect(9,50,6,3,neon);p.rect(49,50,6,3,neon if f%3 else '#dcad74')
    elif state=='cable':
        panel(p,4,2,56,60,base,mid,dark)
        for i,c in enumerate(['#d6a06d','#77ad93','#8bb4d3','#b69bc7']):
            x=12+i*12;p.line(x,5,x,24,dark,7);p.line(x,5,x,24,c,4);p.line(x,24,54-x,42,dark,7);p.line(x,24,54-x,42,c,4);p.line(54-x,42,54-x,58,c,4)
        for y in [8,53]:p.rect(8,y,48,3,mid);p.pixel(10,y+1,light);p.pixel(52,y+1,light)
    elif state=='core':
        for radius in [27,22,17]:p.ellipse(32,32,radius,radius,mid if radius==27 else neon,True)
        for i in range(8):
            a=i*math.pi/4+f*math.pi/32;x=32+round(math.cos(a)*24);y=32+round(math.sin(a)*24);p.rect(x-2,y-2,4,4,neon)
        p.poly([(32,12),(46,25),(46,41),(32,53),(18,41),(18,25)],dark);p.poly([(32,16),(41,27),(41,39),(32,48),(23,39),(23,27)],base);p.ellipse(32,32,5+f%2,9,neon);p.rect(30,26,3,7,light)
    elif state=='firewall':
        for y in range(10,60,14):
            for x in range(3+(y//14%2)*7,61,14):panel(p,x,y,13,12,base,mid,dark)
        for x in [6,23,40,55]:panel(p,x-3,3,10,15,base,neon,dark)
        panel(p,23,28,21,27,dark,neon,dark);p.rect(31,32,4,18,neon)
    elif state=='wall':
        panel(p,2,2,60,60,base,mid,dark)
        for y in [8,48]:p.rect(7,y,50,8,dark);p.rect(9,y+2,46,1,mid)
        circuit(p,10,22,44,19,mid,f);p.rect(28,27,10,9,dark);p.rect(30,29,6,2,neon)
    else:
        panel(p,9,4,46,43,base,mid,dark);panel(p,13,9,38,28,dark,neon,dark);circuit(p,15,11,34,24,mid,f)
        p.rect(18,14,25,2,neon);p.rect(18,20,18,1,light);p.rect(18,25,11+(f%4)*3,1,mid)
        p.rect(26,47,12,5,mid);panel(p,14,52,36,7,base,mid,dark)

def skyline(p,f,phase):
    dark,base,mid,neon,light=PALETTES[phase]
    # 96x96 seamless silhouettes with four-level stepped roofs and lit circuitry.
    for building in range(3):
        x=building*32+3;top=16+(f*13+building*17+phase*9)%48
        p.rect(x,top,27,96-top,dark);p.rect(x+1,top,25,2,base);p.rect(x+4,top-4,12,4,dark)
        if phase in [0,2,6]:
            for xx in range(x+3,x+25,5):p.line(xx,top+5,xx,93,base)
        for y in range(top+8,93,9):
            for xx in range(x+4,x+24,7):p.rect(xx,y,3,2,mid if (y+xx+f)%3 else neon)
        p.rect(x+2,92,23,2,base)
