"""Authored pixel silhouettes, layered armor and eight-frame actor poses."""
import math
from .raster import panel

ROBOT_STATES=['idle','run','jump','fall','attack','hit','repair','death','ability']
ENEMY_STATES=['idle','move','prepare','attack','hit','death','vulnerable','stage1','stage2','stage3']
def robot(p,state,f):
    ink='#10162b';shadow='#26405a';steel='#57768c';mid='#91b0bd';light='#d7e7dc';mint='#62e9cb';white='#eaffee';violet='#9b7bd4';gold='#edaf68'
    if state=='death':
        # Visible disassembly of the same helmet, chest and limbs, not a blank frame.
        d=f
        for i,(x,y,w,h,c) in enumerate([(9,5,15,10,mid),(10,22,12,10,steel),(8,35,5,8,mid),(21,35,5,8,steel),(4,23,4,10,steel),(25,23,5,8,light)]):
            xx=x+int((i%3-1)*d*.8);yy=y+int((i//3-1)*d*.7)
            panel(p,xx,yy,w,h,c,light,ink)
        for i in range(8):p.rect(16+round(math.cos(i*.8)*(5+f*2)),23+round(math.sin(i*.8)*(5+f*2)),1+(f<4),1+(f<4),mint)
        if f<5:p.rect(13-f,10-f,8,2,mint)
        return
    bob=([0,0,0,1,1,1,0,0][f] if state=='idle' else [0,-1,-1,0,0,-1,-1,0][f] if state=='run' else 0)
    if state=='hit':bob=(f%3)-1
    # Back-mounted reactor, antenna and cable visible behind the shoulder.
    panel(p,5,19+bob,8,15,shadow,steel,ink);p.rect(6,22+bob,2,8,violet);p.rect(7,19+bob,4,2,gold)
    p.line(9,15+bob,6,25+bob,ink,2)
    stride=round(math.sin(f*math.pi/4)*4) if state=='run' else 0
    for x,offset,back in [(10,-stride,True),(20,stride,False)]:
        knee=35+bob;foot=44
        if state=='jump':knee=33+f//4;foot=40+f//3
        if state=='fall':knee=36;foot=43+f%2
        if state=='repair':knee=37;foot=45
        p.line(x,31+bob,x+offset,knee,ink,6);p.line(x+offset,knee,x+offset+(-1 if back else 1),foot-2,shadow,4)
        p.rect(x+offset-2,knee-1,5,4,steel if back else mid);p.pixel(x+offset-1,knee,light)
        panel(p,x+offset-3,foot-3,8,4,steel,light,ink);p.rect(x+offset-2,foot,8,1,mint if not back else shadow)
    # Torso silhouette narrows at the waist, with asymmetrical plated shoulders.
    p.poly([(8,19+bob),(22,18+bob),(26,23+bob),(24,33+bob),(13,35+bob),(8,30+bob)],ink)
    p.poly([(9,21+bob),(20,20+bob),(24,24+bob),(22,31+bob),(13,33+bob),(10,29+bob)],steel)
    p.rect(11,21+bob,10,3,mid);p.rect(12,22+bob,7,1,light);p.rect(12,25+bob,9,6,shadow)
    p.rect(14,25+bob,6,3,mint);p.rect(15,25+bob,4,1,white);p.rect(14,29+bob,5,1,ink)
    p.rect(10,30+bob,2,2,gold);p.rect(21,28+bob,2,3,mid);p.rect(14,33+bob,8,2,ink);p.rect(16,33+bob,4,1,violet)
    # Rear arm swings against the legs.
    arm=round(stride*.5);p.line(8,22+bob,6,29+bob+arm,ink,5);p.line(8,22+bob,6,29+bob+arm,steel,3);p.rect(4,29+bob+arm,5,4,mid)
    active=state in ['attack','repair','ability']
    if active:
        recoil=-2 if state=='attack' and f<2 else 0
        panel(p,22+recoil,21+bob,8,7,steel,light,ink);p.rect(28+recoil,23+bob,3,4,shadow);p.rect(29+recoil,24+bob,2,2,mint)
        if state=='repair':
            p.rect(29,29-f%3,2,4,gold);p.pixel(30,28-f%3,white)
        elif state=='attack' and f<3:
            p.rect(30,20+bob,2,8,gold if f%2 else white);p.pixel(29,18+bob,mint)
    else:
        p.line(24,22+bob,26,29+bob-arm,ink,5);p.line(24,22+bob,26,29+bob-arm,mid,3);p.rect(24,29+bob-arm,5,4,light);p.rect(26,30+bob-arm,2,2,shadow)
    # Helmet: stepped contour, one large expressive visor, ear rotor and crest.
    p.poly([(10,3+bob),(23,3+bob),(26,6+bob),(27,14+bob),(23,18+bob),(10,18+bob),(7,14+bob),(7,7+bob)],ink)
    p.poly([(11,4+bob),(22,4+bob),(25,7+bob),(25,13+bob),(22,16+bob),(11,16+bob),(9,13+bob),(9,8+bob)],mid)
    p.rect(12,4+bob,9,2,light);p.rect(10,7+bob,14,7,shadow);p.rect(12,8+bob,14,5,ink)
    blink=state=='idle' and f==6
    p.rect(14,9+bob,10,1 if blink else 2,mint);p.rect(21,9+bob,3,1,white);p.pixel(25,10+bob,gold)
    p.rect(10,14+bob,8,2,steel);p.rect(18,15+bob,5,1,shadow);p.rect(13,16+bob,5,1,light)
    panel(p,6,8+bob,4,7,steel,light,ink);p.rect(7,10+bob,2,3,mint)
    p.rect(12,1+bob,6,2,violet);p.rect(13,1+bob,4,1,mid);p.line(22,4+bob,24,1+bob,steel);p.pixel(24,1+bob,gold)
    if state=='ability':
        for i in range(5):
            a=(i*math.pi*2/5+f*.3);p.rect(16+round(math.cos(a)*14),22+round(math.sin(a)*19),2,2,violet if i%2 else mint)
        p.rect(14,25+bob,6,3,white if f%2 else violet)
    if state=='hit' and f%3==0:
        # Small accent sparks keep the actor legible without a full white flash.
        for x,y in [(2,12),(27,4),(28,36)]:p.rect(x,y,2,2,gold)

def enemy(p,state,f,kind='basic',variant=None):
    boss=kind=='boss';cx=32 if boss else 16;cy=32 if boss else 17
    palettes={'basic':('#9b63ce','#dba8f4'),'fast':('#c25461','#ffbd7a'),'armored':('#47729e','#a2cef4'),'flyer':('#328f9c','#a1f2ef'),'shooter':('#a27541','#ffdc86'),'parasite':('#448c59','#b1f6a4'),'boss':('#903e77','#ff92b8')}
    base,accent=palettes[kind];ink='#101428';shade='#27334d';white='#f9eccf'
    if state.startswith('stage') and boss:base,accent=[('#903e77','#ff92b8'),('#63458f','#c0a4ff'),('#a85650','#ffd884')][int(state[-1])-1]
    if variant:accent={'file':'#d4a4ff','packet':'#77f2cf','wifi':'#9deaff','dns':'#b7a8ff','firewall':'#ffae86'}[variant]
    if state=='death':
        for i in range(12 if boss else 7):
            a=i*2.4;d=4+f*(2 if boss else 1.2);x=cx+round(math.cos(a)*d);y=cy+round(math.sin(a)*d)
            panel(p,x-2,y-2,5 if f<5 else 3,4,base,accent,ink)
        p.ellipse(cx,cy,max(2,8-f),max(2,7-f),white if f<3 else accent)
        return
    bob=[0,-1,-1,0,1,1,0,0][f];cy+=bob
    if boss:
        # Six segmented limbs and a central armored core, at 64x64 native pixels.
        for side in [-1,1]:
            for i in range(3):
                x=cx+side*14;y=cy-10+i*11;xx=cx+side*(25+(f+i)%3)
                p.line(x,y,xx,y-8+i*4,ink,6);p.line(x,y,xx,y-8+i*4,base,4);p.line(xx,y-8+i*4,xx-side*2,y+7,shade,4);p.rect(xx-2,y+6,5,3,accent)
        p.poly([(18,10+bob),(45,10+bob),(52,25+bob),(48,48+bob),(37,56+bob),(23,51+bob),(13,33+bob)],ink)
        p.poly([(20,12+bob),(43,12+bob),(48,26+bob),(44,46+bob),(35,52+bob),(25,48+bob),(17,32+bob)],base)
        for side in [-1,1]:
            p.poly([(cx+side*10,cy-14),(cx+side*20,cy-27),(cx+side*19,cy-9)],shade);p.line(cx+side*14,cy-14,cx+side*19,cy-24,accent,2)
        p.ellipse(cx,cy+1,13,16,ink);p.ellipse(cx,cy+1,10,13,shade);p.ellipse(cx,cy+1,7+(f%2),9,accent);p.ellipse(cx-1,cy-1,3,5,white)
        for i in range(4):p.rect(cx-8+i*5,cy-19,3,3,accent)
        p.rect(cx-12,cy-13,8,3,accent);p.rect(cx+5,cy-13,8,3,accent)
        p.rect(cx-7,cy+20,15,2,shade);p.rect(cx-4,cy+22,8,1,accent)
    elif kind=='fast':
        p.poly([(4,cy-5),(14,cy-12),(24,cy-8),(29,cy),(22,cy+6),(10,cy+8),(5,cy+3)],ink)
        p.poly([(6,cy-5),(14,cy-10),(23,cy-6),(26,cy),(21,cy+4),(11,cy+6),(7,cy+2)],base)
        p.line(8,cy-3,20,cy-7,accent,2);p.rect(21,cy-3,5,2,white)
        for x in [9,19]:p.line(x,cy+6,x+round(math.sin(f*.8)*3),cy+11,shade,3);p.rect(x-2,cy+10,6,2,accent)
        p.line(3,cy+1,9,cy-2,accent);p.line(2,cy+4,7,cy+2,accent)
    elif kind=='flyer':
        wing=[-4,-2,1,3,4,2,0,-3][f]
        for side in [-1,1]:
            p.poly([(cx+side*5,cy-4),(cx+side*14,cy-9-wing),(cx+side*12,cy+4),(cx+side*7,cy+5)],ink)
            p.line(cx+side*7,cy-2,cx+side*13,cy-6-wing,accent,2);p.line(cx+side*7,cy+1,cx+side*11,cy+3,base,2)
        p.ellipse(cx,cy,7,9,ink);p.ellipse(cx,cy-1,5,7,base);p.rect(cx-4,cy-3,9,3,shade);p.rect(cx-2,cy-2,6,1,white);p.rect(cx-1,cy+5,3,3,accent)
    elif kind=='armored':
        p.poly([(7,cy-11),(21,cy-12),(26,cy-5),(26,cy+9),(8,cy+11),(4,cy+4)],ink)
        panel(p,6,cy-10,18,19,base,accent,ink)
        p.rect(9,cy-8,11,4,shade);p.rect(15,cy-7,6,2,white)
        p.poly([(24,cy-10),(29,cy-7),(30,cy+9),(23,cy+12),(21,cy+6),(22,cy-5)],accent);p.line(26,cy-6,27,cy+7,base,2)
        p.rect(10,cy+10,5,3,shade);p.rect(19,cy+10,5,3,shade);p.rect(8,cy+12,8,2,accent);p.rect(18,cy+12,8,2,accent)
        for i in range(3):p.rect(8+i*4,cy+2,2,4,shade)
    elif kind=='shooter':
        p.ellipse(cx-1,cy+5,10,7,ink);p.ellipse(cx-1,cy+4,8,5,shade)
        for x in range(8,24,4):p.rect(x,cy+8,2,2,accent)
        panel(p,6,cy-10,16,15,base,accent,ink);p.rect(9,cy-7,10,5,shade);p.rect(12,cy-6,7,2,white)
        panel(p,20-(2 if state=='attack' and f<3 else 0),cy-2,10,7,shade,accent,ink);p.rect(28,cy,3,3,accent)
        p.line(10,cy-10,9,cy-14,shade);p.pixel(9,cy-14,accent)
    elif kind=='parasite':
        for i in range(6):
            a=i*math.pi/3;xx=cx+round(math.cos(a)*(11+f%2));yy=cy+round(math.sin(a)*10)
            p.line(cx,cy,xx,yy,ink,3);p.line(xx,yy,xx+round(math.sin(a+f)*2),yy+3,accent,2)
        p.ellipse(cx,cy,8,10,ink);p.ellipse(cx,cy-1,6,8,base);p.ellipse(cx-1,cy-2,3,4,accent);p.pixel(cx,cy-4,white);p.rect(cx-3,cy+5,6,2,shade)
    else:
        for i in range(8):
            a=i*math.pi/4;p.line(cx,cy,cx+round(math.cos(a)*(12+f%2)),cy+round(math.sin(a)*12),ink,3);p.rect(cx+round(math.cos(a)*12)-1,cy+round(math.sin(a)*12)-1,3,3,base)
        p.ellipse(cx,cy,10,10,ink);p.ellipse(cx-1,cy-1,8,8,base);p.ellipse(cx-3,cy-4,3,2,accent)
        p.rect(cx-5,cy-2,12,4,shade);p.rect(cx-3,cy-1,3,2,white);p.rect(cx+3,cy-1,3,2,white);p.rect(cx-3,cy+5,7,1,accent)
    if variant=='file':panel(p,3,cy-11,6,8,'#7966aa',accent,ink);p.rect(4,cy-9,4,1,white);p.pixel(7,cy-5,white)
    if variant in ['packet','dns']:
        p.rect(4,cy-10,5,4,accent);p.rect(5,cy-9,3,2,shade)
        if variant=='dns':p.rect(8,cy-14,5,4,base);p.rect(9,cy-13,3,1,white)
    if variant=='wifi':
        for i in range(3):p.line(cx-4-i*2,cy-11-i*3,cx+4+i*2,cy-11-i*3,accent)
    if variant=='firewall':p.rect(22,cy-9,6,2,'#ffe3a5');p.rect(24,cy-6,4,2,'#ffae86')
    if state=='prepare':p.rect(cx-1,max(1,cy-(24 if boss else 16)),3,5,'#fff1a8')
    if state=='attack':
        for i in range(3):p.rect(min(p.w-2,cx+(15 if boss else 11)+i*2),cy-3+(f+i)%5,2,2,white if i==0 else accent)
    if state=='hit':p.rect(cx-5,cy-4,3+f%3,2,white);p.pixel(cx+6,cy+4,white)
    if state=='vulnerable':p.rect(cx-3,cy+1,6,3,'#ffeab2' if f%2 else accent)
