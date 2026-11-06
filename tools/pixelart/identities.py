"""Ten authored raster environments. Shared materials, distinct silhouettes.

All motifs are bounded inside 128px cells, including cables and routes.
Empty variants are deliberate; no gradients, smoothing or external assets.
"""
BACKGROUNDS=['#071719','#100e22','#061923','#091626','#071b2a','#141c23','#081e1a','#141329','#200c15','#061522']
TINTS=['#516d65','#76648c','#447e8c','#4c7099','#568697','#827568','#568473','#776d9c','#92535b','#4e819b']

def colors(n,state):
    amounts={'distant':(.10,.16,.22,.28),'middle':(.20,.32,.48,.65),'near':(.26,.42,.60,.78)}[state]
    a=tuple(int(BACKGROUNDS[n][i:i+2],16) for i in (1,3,5))
    b=tuple(int(TINTS[n][i:i+2],16) for i in (1,3,5))
    return ['#'+''.join(f'{round(x+(y-x)*t):02x}' for x,y in zip(a,b)) for t in amounts]

def paint(p,state,f,n):
    if state=='arena':
        if n!=9 or f:return
        # Reserved regional frame: dormant corrupted core, never tiled.
        p.poly([(22,16),(106,16),(116,26),(116,104),(104,116),(24,116),(12,104),(12,26)],'#122a3c')
        p.poly([(28,24),(100,24),(108,32),(108,98),(98,108),(30,108),(20,98),(20,32)],'#244256')
        p.rect(28,32,72,64,'#0a1d2f')
        for x in [36,84]:
            p.rect(x,42,8,42,'#344456');p.rect(x,46,4,10,'#634158')
        p.rect(48,50,32,30,'#302d49');p.rect(54,54,20,22,'#603d59')
        p.rect(60,60,8,10,'#936077')
        for x,y,w in [(24,36,18),(82,70,24),(36,90,30)]:p.rect(x,y,w,2,'#6d405c')
        return
    if (state=='distant' and f not in [0,3,6]) or (state=='middle' and f not in [1,5]) or (state=='near' and f not in [3,7]):return
    dark,body,edge,light=colors(n,state)
    def box(x,y,w,h):
        p.rect(x+4,y+4,w,h,dark);p.rect(x,y,w,h,body)
        p.rect(x,y,w,2,edge);p.rect(x,y,2,h,edge)
        p.rect(x+w-4,y+4,4,h-4,dark);p.rect(x+4,y+h-4,w-4,4,dark)
    def route(points,c=edge):
        for (x,y),(xx,yy) in zip(points,points[1:]):p.line(x,y,xx,yy,c,2)
    if n==1: # Software: floating window stack, folder shelves, process cards.
        if state=='distant':
            for x,y,w,h in [(18,16,72,70),(30,34,78,72)]:
                box(x,y,w,h);p.rect(x+4,y+6,w-12,8,edge)
        elif state=='middle':
            box(16,20,92,80);p.rect(20,24,84,10,edge)
            p.rect(28,46,16,6,edge);p.rect(28,50,28,22,edge);p.rect(32,56,20,12,body)
            p.poly([(66,44),(80,44),(90,54),(90,76),(66,76)],edge)
            p.rect(70,54,16,18,body);p.rect(80,44,2,10,light);p.rect(80,52,10,2,light)
            for y in [60,66]:p.rect(72,y,10,2,edge)
            route([(42,78),(42,90),(80,90)],edge)
        else:
            box(24,18,72,88);p.rect(28,22,64,10,edge)
            for y,w in [(44,42),(62,30),(80,48)]:
                p.rect(32,y,6,8,light);p.rect(44,y,w,4,edge);p.rect(44,y+6,w-12,2,dark)
            p.rect(82,26,4,2,light)
    elif n==2: # Switch: wide port banks and neatly bundled patch cables.
        if state=='distant':
            box(12,30,104,60)
            for y in [42,66]:p.rect(20,y,88,12,dark)
            p.rect(18,96,92,6,body)
        elif state=='middle':
            box(12,22,104,52)
            for x in [22,48,74]:
                p.rect(x,36,22,22,dark);p.rect(x+4,36,14,4,edge)
                for dx in [6,10,14]:p.rect(x+dx,40,2,8,light)
                route([(x+10,58),(x+10,92),(108,92)],edge)
            p.rect(20,66,4,2,light)
        else:
            box(18,28,92,34)
            for x in [28,54,80]:p.rect(x,38,18,14,dark);p.rect(x+4,40,10,2,light)
            for y in [76,86]:route([(26,y),(82,y),(96,y+12)],edge)
            p.rect(52,74,6,2,light)
    elif n==3: # Router: octagonal tunnel mouths, forks, forwarding interfaces.
        if state=='distant':
            for inset,c in [(0,body),(10,dark),(18,edge),(22,dark)]:
                a=14+inset;b=114-inset
                p.poly([(a+16,a),(b-16,a),(b,a+16),(b,b-16),(b-16,b),(a+16,b),(a,b-16),(a,a+16)],c)
        elif state=='middle':
            route([(14,98),(46,66),(46,28),(100,28)],body)
            route([(46,66),(88,66),(108,86)],edge)
            route([(16,104),(52,68),(52,34),(100,34)],edge)
            for x,y in [(88,18),(78,56),(96,86)]:box(x,y,18,16)
            p.rect(62,32,10,2,light)
        else:
            box(24,34,80,50);p.rect(32,44,28,26,dark)
            for y in [46,58,70]:
                p.rect(70,y,20,2,edge);p.poly([(90,y-2),(96,y+1),(90,y+4)],light)
            route([(16,102),(38,102),(56,86)],edge)
    elif n==4: # Wi-Fi: tall open antenna silhouettes and suspended relay decks.
        if state=='distant':
            p.poly([(34,112),(58,28),(68,28),(94,112)],body)
            p.poly([(46,110),(62,52),(80,110)],dark)
            p.rect(60,12,6,46,edge);p.rect(32,36,64,6,body)
            p.rect(20,104,88,8,body)
        elif state=='middle':
            route([(24,16),(40,66),(88,66),(104,16)],edge)
            box(24,68,80,16);p.rect(60,34,6,34,edge);p.rect(46,34,34,6,light)
            for d in [0,12]:
                route([(38-d,38),(38-d,26-d),(50,18-d)],edge)
                route([(78+d,38),(78+d,26-d),(68,18-d)],edge)
        else:
            p.rect(58,34,8,74,body);p.rect(58,34,2,74,edge)
            for y,w in [(38,68),(60,48),(82,28)]:box(62-w//2,y,w,8)
            p.rect(60,22,4,8,light);box(42,104,40,8)
    elif n==5: # Cabling: building cross-braces, elbows, organized cable trays.
        if state=='distant':
            for x in [16,100]:p.rect(x,14,12,100,body)
            for y in [24,96]:p.rect(16,y,96,10,body)
            route([(28,34),(98,94)],edge);route([(28,94),(98,34)],edge)
        elif state=='middle':
            for x in [24,44,64]:
                p.rect(x,14,12,62,body);p.rect(x,14,2,62,edge)
                p.rect(x,72,104-x,12,body);p.rect(x+2,74,100-x,2,edge)
            for y in [30,58]:box(18,y,66,8)
        else:
            box(16,22,96,84)
            for x,c in [(28,edge),(46,light),(64,edge),(82,body)]:
                p.rect(x,32,8,60,dark);p.rect(x+2,32,4,60,c)
            for y in [40,78]:p.rect(22,y,80,6,body);p.rect(22,y,80,2,edge)
            p.rect(24,98,20,2,light)
    elif n==6: # DHCP: address dispensers with separated subnet branches.
        if state=='distant':
            box(44,12,40,52)
            route([(64,64),(64,84),(20,84),(20,104)],edge)
            route([(64,84),(108,84),(108,104)],edge)
            for x in [12,96]:box(x,100,22,14)
        elif state=='middle':
            box(30,14,68,98)
            for y in [24,48,72]:
                p.rect(38,y,48,16,dark);p.rect(42,y+4,6,6,light)
                for x in [54,64,74]:p.rect(x,y+6,6,2,edge)
            p.rect(46,98,30,4,edge)
        else:
            box(20,22,88,60);p.rect(28,30,72,36,dark)
            for x in [36,56,76]:p.rect(x,42,12,12,edge);p.rect(x+2,44,4,2,light)
            route([(64,82),(64,98),(30,98)],edge);box(24,94,14,14)
    elif n==7: # DNS: portal arches and a clear hierarchical domain tree.
        if state=='distant':
            p.poly([(18,112),(18,34),(38,14),(90,14),(110,34),(110,112)],body)
            p.poly([(30,112),(30,40),(44,26),(84,26),(98,40),(98,112)],dark)
            p.rect(42,38,44,64,edge);p.rect(46,42,36,60,dark)
        elif state=='middle':
            route([(64,36),(64,58),(26,58),(26,82)],edge)
            route([(64,58),(102,58),(102,82)],edge)
            box(44,14,40,24)
            for x in [12,84]:box(x,80,30,26);p.rect(x+6,88,18,2,light)
            p.rect(54,24,20,2,light)
        else:
            # Name archive: asymmetric shelves surrounding a blue resolver core.
            box(18,20,34,88);box(78,34,30,74)
            for y in [32,52,72,92]:p.rect(24,y,20,6,dark);p.rect(24,y,4,2,light)
            for y in [46,66,86]:p.rect(84,y,16,6,dark)
            p.rect(58,48,12,34,'#293c59');p.rect(60,52,2,26,'#405777')
    elif n==8: # Firewall: crenellated fortress, shield plates and alert beacons.
        if state=='distant':
            p.rect(14,42,100,68,body)
            for x in [14,38,78,102]:p.rect(x,26,12,20,body)
            p.rect(44,64,40,46,dark);p.rect(50,58,28,8,dark)
            p.rect(20,50,88,4,edge)
        elif state=='middle':
            for x in [18,90]:
                box(x,20,20,88);p.rect(x+6,26,8,4,light)
            for y in [44,64,84]:p.rect(40,y,48,4,edge)
            p.rect(42,42,4,46,body);p.rect(80,42,4,46,body)
        else:
            p.poly([(30,20),(98,20),(98,70),(88,90),(64,110),(40,90),(30,70)],edge)
            p.poly([(36,26),(92,26),(92,68),(82,86),(64,102),(46,86),(36,68)],body)
            box(50,50,28,30);p.rect(56,38,16,18,edge);p.rect(60,42,8,12,dark)
            p.rect(62,58,4,12,light)
    elif n==9: # Servers: receding corridor portals, full racks and cooling plant.
        if state=='distant':
            for x,y,w,h in [(12,12,104,104),(26,24,76,80),(40,36,48,56)]:
                p.rect(x,y,4,h,body);p.rect(x+w-4,y,4,h,body);p.rect(x,y,w,4,edge)
            p.rect(52,48,24,38,dark)
        elif state=='middle':
            box(22,12,84,104)
            for y in [22,44,66,88]:
                p.rect(30,y,68,18,dark)
                for x in [36,44]:p.rect(x,y+6,4,2,light)
                for x in [60,68,76,84]:p.rect(x,y+4,2,10,edge)
        else:
            box(18,18,42,92);box(72,32,38,78)
            for x,y in [(26,32),(80,46)]:
                for dy in [0,24,48]:
                    p.rect(x,y+dy,24,18,dark)
                    p.rect(x+4,y+dy+4,16,2,edge);p.rect(x+4,y+dy+10,4,2,light)
            route([(60,26),(90,26),(90,18)],edge)
