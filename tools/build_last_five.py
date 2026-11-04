"""Explicit replacement layouts for stages 6–10; leaves stages 1–5 untouched."""
import json
from pathlib import Path
from build_first_five import base, platform, floor, component, enemy, art, portal

ROOT=Path(__file__).resolve().parents[1]

def grate(id,x,y,w):
    return dict(id=id,x=x,y=y,width=w,height=18,collision='one-way')

def hazard(id,x,y,w,h,repair=None,period=None,active=1.3,phase=0):
    result=dict(id=id,x=x,y=y,width=w,height=h,type='interference',collision='dangerous',damage=12)
    if repair:result['requiresComponentId']=repair
    if period:result['window']=dict(period=period,active=active,phase=phase)
    return result

def items(coords):
    return [dict(id=f'i{i:02}',x=x,y=y,radius=10,secret=True) for i,(x,y) in enumerate(coords,1)]

def finish(m,scenery):
    m['objectives']['componentsToRepair']=len(m['entities']['components'])
    m['objectives']['enemiesToDefeat']=len(m['entities']['enemies'])
    m['layers']=[dict(id='new-infrastructure',type='infrastructure-world',theme=m['theme'],items=scenery,**{'pass':'midground'})]
    return m

def cabling():
    ground=[floor('building-basement',100,2800,1400,80),grate('left-floor-1',100,2200,520),grate('right-floor-1',980,2200,520),
        grate('left-floor-2',100,1600,520),grate('right-floor-2',980,1600,520),grate('left-floor-3',100,1000,520),grate('right-floor-3',980,1000,520),grate('building-roof',100,400,1400)]
    m=base(6,'Cabeamento e infraestrutura','cabling',1600,3000,(200,2800),(1280,400),ground,
        ['#171b20','#283842','#f3c57f','#6b7167','#b9885c'],
        'Escale os dutos do prédio: restaure os três quadros de conexão para liberar travessias e elevadores.')
    m['map'].update(layout='vertical',routes=['shaft oeste','shaft leste','poço de elevadores','passagens de manutenção'],
        checkpoints=[dict(x=260,y=2200),dict(x=1190,y=1600),dict(x=260,y=1000),dict(x=1200,y=400)])
    p=m['entities']['platforms']
    for prefix,coords in [
        ('basement-duct',[(260,2700),(450,2600),(270,2500),(450,2400),(270,2300)]),
        ('east-duct',[(1050,2100),(1240,2000),(1060,1900),(1240,1800),(1060,1700)]),
        ('west-duct',[(440,1500),(250,1400),(430,1300),(250,1200),(430,1100)]),
        ('roof-duct',[(1080,900),(1260,800),(1080,700),(1260,600),(1080,500)])]:
        p.extend(platform(f'{prefix}-{i}',x,y,170,'cable') for i,(x,y) in enumerate(coords,1))
    p.extend([
        platform('reconnected-tray-a',620,2200,360,'cable',requiresComponentId='c01'),
        platform('reconnected-tray-b',620,1600,360,'cable',requiresComponentId='c02'),
        platform('reconnected-tray-c',620,1000,360,'cable',requiresComponentId='c03'),
        platform('lift-dock-a',560,2500,140,'cable',requiresComponentId='c01'),
        platform('lift-dock-b',920,1900,100,'cable',requiresComponentId='c02'),
        platform('lift-dock-c',920,700,100,'cable',requiresComponentId='c03'),
        platform('elevator-a',720,2500,160,'cable',requiresComponentId='c01'),
        platform('elevator-b',720,1900,160,'cable',requiresComponentId='c02'),
        platform('elevator-c',720,700,160,'cable',requiresComponentId='c03'),
        platform('basement-cache',1310,2710,150,'cable'),platform('floor1-cache',120,2110,160,'cable'),
        platform('floor2-cache',1340,1510,150,'cable'),platform('roof-cache',180,310,160,'cable')])
    for id,rng in [('elevator-a',210),('elevator-b',200),('elevator-c',200)]:
        next(s for s in p if s['id']==id).update(type='moving',motion=dict(axis='y',range=rng,speed=.45))
    m['entities']['components']=[component('c01',300,2200,'QUADRO DO SHAFT A'),component('c02',1160,1600,'PATCH PANEL B'),component('c03',330,1000,'DISTRIBUIDOR DO TOPO')]
    m['entities']['obstacles']=[dict(id='building-west-wall',x=50,y=80,width=24,height=2800,collision='solid',type='rack-wall'),dict(id='building-east-wall',x=1520,y=80,width=24,height=2800,collision='solid',type='rack-wall'),
        hazard('live-cable-a',500,2130,28,70,'c01'),hazard('live-cable-b',1400,1520,28,80,'c02'),hazard('live-cable-c',490,930,28,70,'c03')]
    m['entities']['enemies']=[enemy('e01','basic',800,2800,400,1100,(100,2550,1400,300)),enemy('e02','fast',540,2200,210,590,(100,1940,520,300)),
        enemy('e03','parasite',1320,1600,1040,1460,(980,1350,520,300)),enemy('e04','shooter',550,1000,180,580,(100,740,520,300))]
    m['entities']['collectibles']=items([(1380,2680),(180,2080),(1400,1480),(230,280)])
    scenery=[art('building',80,180,1440,2670,'PRÉDIO TECNOLÓGICO / SHAFTS A–B'),art('duct',100,450,520,2280,'ELETROCALHA OESTE'),art('duct',980,450,520,2280,'ELETROCALHA LESTE'),
        art('lift-shaft',690,410,220,2380,'ELEVADORES'),art('rack',130,2200,220,100,'RACK A'),art('rack',1160,1600,250,100,'RACK B'),art('rack',160,1000,220,100,'PATCH / CORE')]
    return finish(m,scenery)

def dhcp():
    g=[grate('dhcp-core',1120,1000,600),grate('scope-a',140,650,680),grate('diagnostic-scope',140,1380,680),grate('scope-b',2040,760,630),grate('relay-scope',1940,1450,710)]
    m=base(7,'Endereçamento IP e DHCP','dhcp',2800,1700,(1370,1000),(2490,760),g,
        ['#0a2021','#244d42','#8df0b7','#3f866a','#c3d687'],
        'Restaure o DHCP, resolva conflitos e habilite reservas antes de alcançar o gateway da rede.')
    m['map'].update(layout='hub',checkpointMode='free',routes=['núcleo DHCP','escopo 10.0.10/24','rede de diagnóstico','relay e reservas','gateway de saída'],
        checkpoints=[dict(x=1430,y=1000),dict(x=300,y=650),dict(x=2270,y=1450),dict(x=2330,y=760)])
    p=m['entities']['platforms']
    for id,x,y,w in [('lease-left-a',950,1090,180),('lease-left-b',760,1180,180),('lease-left-c',580,1270,180),
        ('lease-right-a',1730,1090,180),('lease-right-b',1900,1180,180),('lease-right-c',2080,1270,170),('lease-right-d',2260,1360,180)]:
        p.append(platform(id,x,y,w,'packet',requiresComponentId='c01'))
    p.extend([platform('scope-return-a',820,740,180,'packet',requiresComponentId='c02'),platform('scope-return-b',1000,830,160,'packet',requiresComponentId='c02'),platform('scope-return-c',1120,920,160,'packet',requiresComponentId='c02'),
        platform('gateway-lease-a',1740,920,180,'packet',requires=dict(flag='dhcp-on')),platform('gateway-lease-b',1910,840,180,'packet',requires=dict(flag='dhcp-on')),
        platform('conflict-bypass',490,560,180,'packet'),platform('reserved-route',2100,670,160,'packet',requiresComponentId='c03'),
        platform('diagnostic-cache',220,1290,160,'packet'),platform('scope-cache',170,560,160,'packet'),platform('gateway-cache',2260,670,160,'packet'),platform('relay-cache',2460,1360,160,'packet')])
    for i,id in enumerate(['lease-left-a','lease-left-c','lease-right-b','scope-return-b','gateway-lease-b']):
        next(s for s in p if s['id']==id).update(type='moving',motion=dict(axis='x' if i%2==0 else 'y',range=18 if i%2==0 else 8,speed=.55))
    m['entities']['components']=[component('c01',1380,1000,'SERVIÇO DHCP'),component('c02',370,650,'POOL EM CONFLITO'),component('c03',2290,1450,'RELAY DHCP')]
    m['entities']['obstacles']=[dict(id='duplicate-address',x=510,y=540,width=32,height=110,type='corrupt',collision='solid',requiresComponentId='c02')]
    m['entities']['gates']=[dict(id='gateway-service-lock',x=2380,y=630,width=24,height=130,opensWhen=dict(all=[dict(flag='dhcp-on'),dict(flag='reservation')]))]
    m['entities']['interactives']=[dict(id='dhcp-start',type='switch',x=1570,y=960,width=38,height=40,flag='dhcp-on',requires=dict(component='c01'),once=True,label='DHCP',message='DHCP ATIVO // CONCESSÕES LIBERADAS'),
        dict(id='address-reservation',type='switch',x=690,y=610,width=38,height=40,flag='reservation',requires=dict(component='c02'),once=True,label='FIXO',message='RESERVA ATIVA // CONFLITOS RESOLVIDOS')]
    m['objectives']['goals']=[dict(id='ip-services',type='condition',condition=dict(all=[dict(flag='dhcp-on'),dict(flag='reservation')]))]
    m['mechanics']=[dict(id='subnet-gateways',type='portals',links=[portal('dhcp-diagnostic',1150,1000,380,1380,'169.254 / DIAG'),portal('diagnostic-dhcp',690,1380,1220,1000,'DHCP / VOLTAR'),
        portal('dhcp-scope-a',1660,1000,240,650,'10.0.10/24',dict(all=[dict(component='c01'),dict(flag='dhcp-on')])),portal('scope-a-dhcp',220,650,1260,1000,'10.0.0/24'),
        portal('dhcp-relay',1300,1000,2060,1450,'10.0.20/24',dict(flag='dhcp-on')),portal('relay-dhcp',1990,1450,1480,1000,'DHCP / CORE'),
        portal('relay-gateway',2570,1450,2150,760,'10.0.30/24',dict(component='c03')),portal('gateway-relay',2580,760,2350,1450,'RELAY / VOLTAR')])]
    m['entities']['enemies']=[enemy('e01','fast',600,1380,220,740,(140,1100,680,340)),enemy('e02','armored',740,650,570,770,(140,390,680,320)),
        enemy('e03','flyer',2500,760,2110,2600,(1950,440,760,380)),enemy('e04','basic',2480,1450,2070,2600,(1940,1190,710,320))]
    m['entities']['collectibles']=items([(280,1260),(230,530),(2320,640),(2520,1330)])
    scenery=[art('address-sector',1120,690,600,310,'DHCP / 10.0.0.0/24'),art('address-sector',140,340,680,310,'10.0.10.0/24 / RESERVAS'),art('address-sector',140,1070,680,310,'169.254.0.0/16 / DIAGNÓSTICO'),
        art('address-sector',2040,450,630,310,'10.0.30.0/24 / GATEWAY'),art('address-sector',1940,1140,710,310,'10.0.20.0/24 / RELAY'),art('conflict',500,505,180,35,'IP DUPLICADO: .42')]
    return finish(m,scenery)

def dns():
    g=[floor('dns-root',1350,400,700),floor('com-domain',200,750,850),floor('org-domain',2350,750,850),floor('mail-com',200,1200,850),floor('api-org',2350,1200,850),
        floor('recursive-cache',1320,1550,760),floor('nxdomain-room',80,1700,420),floor('archive-cache',900,1900,1600)]
    m=base(8,'DNS','dns',3400,2100,(1600,400),(1940,400),g,
        ['#101529','#302952','#d2b0ff','#7d68a1','#83c8e7'],
        'Reconstrua os registros de .com, .org e do cache recursivo; encontre a resolução de retorno à raiz.')
    m['map'].update(layout='maze',checkpointMode='free',routes=['raiz DNS','domínio .com e mail.com','domínio .org e api.org','cache recursivo','NXDOMAIN e arquivo'],
        checkpoints=[dict(x=1580,y=400),dict(x=400,y=1200),dict(x=2900,y=1200),dict(x=1510,y=1550)])
    coords=[('root-com-a',1160,490,180),('root-com-b',970,580,180),('root-com-c',780,670,180),
        ('root-org-a',2080,490,180),('root-org-b',2250,580,180),('root-org-c',2440,670,180),
        ('com-shaft-a',1020,840,150),('com-shaft-b',850,930,150),('com-shaft-c',1020,1020,150),('com-shaft-d',850,1110,150),
        ('org-shaft-a',3050,840,150),('org-shaft-b',2860,930,150),('org-shaft-c',3050,1020,150),('org-shaft-d',2860,1110,150),
        ('cache-west-a',1100,1290,180),('cache-west-b',1290,1380,180),('cache-west-c',1480,1470,180),
        ('cache-east-a',2180,1290,180),('cache-east-b',1990,1380,180),('cache-east-c',1800,1470,180),
        ('archive-a',1100,1810,160),('archive-b',1270,1720,160),('archive-c',1440,1630,160),
        ('com-divider-step',520,660,160),('mail-divider-step',540,1110,160),('org-divider-step',2580,660,160),('api-divider-step',2580,1110,160),
        ('root-cache',1480,310,150),('org-secret',3020,660,150),('archive-secret',2300,1810,150)]
    m['entities']['platforms']=[platform(id,x,y,w,'window') for id,x,y,w in coords]
    m['entities']['platforms'].extend([platform('cname-com-bridge',1160,1200,520,'packet',requiresComponentId='c01'),platform('cname-org-bridge',1710,1200,600,'packet',requiresComponentId='c02'),
        platform('cache-restored-step',1690,1340,170,'packet',requiresComponentId='c03')])
    m['entities']['components']=[component('c01',500,1200,'REGISTRO MX / .COM'),component('c02',2840,1200,'REGISTRO A / .ORG'),component('c03',1670,1550,'CACHE RECURSIVO')]
    m['entities']['obstacles']=[dict(id='com-corrupt-wall',x=680,y=590,width=35,height=160,type='corrupt',collision='solid',requiresComponentId='c01'),dict(id='mail-corrupt-wall',x=700,y=1040,width=35,height=160,type='corrupt',collision='solid',requiresComponentId='c01'),
        dict(id='org-corrupt-wall',x=2730,y=600,width=35,height=150,type='corrupt',collision='solid',requiresComponentId='c02'),dict(id='api-corrupt-wall',x=2730,y=1040,width=35,height=160,type='corrupt',collision='solid',requiresComponentId='c02'),
        hazard('root-corruption',1850,300,30,100,'c03'),hazard('nxdomain-corruption',350,1630,30,70,'c03',4,1.4)]
    links=[portal('root-com',1410,400,350,750,'.COM'),portal('root-org',1970,400,2500,750,'.ORG'),portal('com-root',260,750,1550,400,'RAIZ / VOLTAR'),portal('org-root',2410,750,1750,400,'RAIZ / VOLTAR'),
        portal('com-mail',450,750,350,1200,'MAIL.COM'),portal('org-api',2640,750,2500,1200,'API.ORG'),portal('mail-return',230,1200,450,750,'.COM / VOLTAR'),portal('api-return',2400,1200,2500,750,'.ORG / VOLTAR'),
        portal('cname-com-org',940,1200,2930,1200,'CNAME → API.ORG',dict(component='c01')),portal('api-cache',3100,1200,1510,1550,'DNS RECURSIVO',dict(component='c02')),
        portal('cache-root',1950,1550,1660,400,'RAIZ / RESOLVIDO',dict(component='c03')),portal('com-nxdomain',920,750,150,1700,'WWW.INEXISTENTE'),portal('nxdomain-return',420,1700,830,750,'NXDOMAIN / VOLTAR'),
        portal('archive-return',1800,1900,1510,1550,'CACHE / VOLTAR')]
    m['mechanics']=[dict(id='name-resolution',type='portals',links=links)]
    m['entities']['enemies']=[enemy('e01','shooter',1780,400,1460,1810,(1350,150,700,310)),enemy('e02','fast',930,750,760,1010,(200,480,850,330)),
        enemy('e03','basic',3090,750,2870,3160,(2350,480,850,330)),enemy('e04','parasite',1940,1550,1400,2020,(1320,1260,760,350)),enemy('e05','armored',3060,1200,2860,3160,(2350,940,850,320))]
    m['entities']['collectibles']=items([(1540,280),(3080,630),(2370,1780),(460,1670),(980,1870)])
    scenery=[art('domain-root',1350,170,700,230,'. / RAIZ'),art('domain-room',200,470,850,280,'.COM'),art('domain-room',2350,470,850,280,'.ORG'),
        art('domain-room',200,930,850,270,'MAIL.COM / MX'),art('domain-room',2350,930,850,270,'API.ORG / A'),art('domain-room',1320,1260,760,290,'RESOLVEDOR RECURSIVO'),
        art('domain-false',80,1450,420,250,'NXDOMAIN / SEM REGISTRO'),art('domain-room',900,1680,1600,220,'ARQUIVO / CACHE TTL')]
    return finish(m,scenery)

def security():
    g=[floor('outer-west',80,1560,820,60),floor('outer-middle',1180,1560,670,60),floor('outer-east',2110,1560,1410,60),grate('inner-east',2000,1140,1500),grate('inner-west',850,1140,1000),grate('citadel',1500,540,1200)]
    m=base(9,'Firewall e segurança','firewall',3600,1800,(120,1560),(2460,540),g,
        ['#210e18','#472137','#ff937b','#96516b','#edc980'],
        'Infiltre as quatro camadas da fortaleza, restaure regras e ative o terminal de segurança da cidadela.')
    m['map'].update(layout='multi-route',checkpointMode='free',routes=['perímetro e inspeção','bastião leste','anel interno','escadaria da cidadela'],
        checkpoints=[dict(x=1450,y=1560),dict(x=3200,y=1560),dict(x=2300,y=1140),dict(x=1050,y=1140),dict(x=2200,y=540)])
    coords=[('inspection-step-a',940,1500,160),('inspection-step-b',1120,1420,160),('bastion-step-a',3150,1470,170),('bastion-step-b',3320,1380,170),('bastion-step-c',3140,1290,170),('bastion-step-d',3310,1200,170),
        ('citadel-step-b',1190,960,170),('citadel-step-c',1380,870,170),('citadel-step-d',1570,780,170),('citadel-step-e',1760,690,170),('citadel-step-f',1950,600,170),
        ('outer-cache',250,1470,150),('inner-cache',2870,1050,150),('citadel-cache',2550,450,150)]
    p=m['entities']['platforms']=[platform(id,x,y,w,'route') for id,x,y,w in coords]
    p.extend([platform('inspection-breakaway',1940,1470,170,'route'),platform('rules-bridge',1840,1140,180,'route',requiresComponentId='c03'),platform('citadel-step-a',1000,1050,170,'route',requiresComponentId='c04')])
    next(s for s in p if s['id']=='inspection-step-b').update(type='moving',motion=dict(axis='y',range=10,speed=.7))
    next(s for s in p if s['id']=='inspection-breakaway').update(type='temporary',duration=1.9,respawnDelay=2.5)
    m['entities']['components']=[component('c01',400,1560,'REGRAS DO PERÍMETRO'),component('c02',1450,1560,'POLÍTICA DE INSPEÇÃO'),component('c03',2350,1140,'REGRAS DO ANEL INTERNO'),component('c04',1050,1140,'ACESSO À CIDADELA')]
    m['entities']['gates']=[dict(id='security-layer-1',x=620,y=1160,width=28,height=400,requiresComponentId='c01'),dict(id='security-layer-2',x=1830,y=1180,width=28,height=380,requiresComponentId='c02'),
        dict(id='security-layer-3',x=1950,y=900,width=28,height=240,requiresComponentId='c03'),dict(id='security-core-lock',x=2380,y=390,width=26,height=150,opensWhen=dict(flag='rules-on'))]
    m['entities']['obstacles']=[hazard('perimeter-laser',520,1480,28,80,'c01',3.8,1.2),hazard('inspection-laser',1300,1480,28,80,'c02',3.8,1.3,1),hazard('inner-laser',2600,1060,30,80,'c03',3.2,1.25,.5),
        dict(id='citadel-cover',x=2310,y=474,width=44,height=66,type='heatsink',collision='solid')]
    m['entities']['interactives']=[dict(id='citadel-console',type='switch',x=2190,y=500,width=40,height=40,requires=dict(component='c04'),flag='rules-on',once=True,label='ACL',message='REGRAS RESTAURADAS // CIDADELA LIBERADA')]
    m['objectives']['goals']=[dict(id='security-policy',type='condition',condition=dict(flag='rules-on'))]
    cameras=[dict(id='inspection-cam',x=1110,y=1300,period=3.8,windup=1.0,region=dict(x=940,y=1330,width=560,height=240),disabledWhen=dict(component='c02')),
        dict(id='inner-cam',x=2780,y=900,period=3.2,windup=.9,region=dict(x=2510,y=910,width=700,height=240),disabledWhen=dict(component='c03'))]
    m['mechanics']=[dict(id='surveillance',type='security-grid',cameras=cameras)]
    m['entities']['enemies']=[enemy('e01','fast',1620,1560,1230,1760,(1180,1290,670,330)),enemy('e02','shooter',2850,1560,2400,3370,(2110,1290,1410,330)),
        enemy('e03','armored',3050,1140,2750,3380,(2000,870,1500,330)),enemy('e04','flyer',1360,1140,980,1790,(850,840,1000,360)),enemy('e05','armored',2540,540,2440,2640,(1500,270,1200,330))]
    m['entities']['collectibles']=items([(300,1440),(2940,1020),(2610,420),(3440,1530)])
    scenery=[art('fortress',580,270,2480,1320,'FORTALEZA / DEFESA EM PROFUNDIDADE'),art('bastion',620,1160,280,400,'CAMADA 1'),art('bastion',1830,1180,280,380,'CAMADA 2'),
        art('security-hall',2000,870,1500,270,'BASTIÃO LESTE / INSPEÇÃO'),art('security-hall',850,870,1000,270,'ANEL INTERNO / INFILTRAÇÃO'),art('citadel',1500,270,1200,270,'CIDADELA / ACL')]
    return finish(m,scenery)

def servers():
    g=[floor('dc-entry',80,1640,1000,60),floor('dc-backbone',1280,1640,1170,60),grate('tower-a-roof',420,1190,600),grate('tower-b-roof',1660,1050,600),
        floor('battle-west',2580,1640,570,60),floor('battle-east',3450,1540,700,60),grate('core-airlock',4350,1170,470),floor('virus-zero-arena',4800,900,1800,60)]
    m=base(10,'Servidores e Internet','servers',6800,2000,(200,1640),(6480,900),g,
        ['#071322','#14334c','#8ceaff','#44758d','#fa719a'],
        'Restaure quatro relays nas torres e no backbone; abra o núcleo elevado e derrote VIRUS ZERO.')
    m['map'].update(layout='multi-route',checkpointMode='free',routes=['data center inferior','torres e fibra superior','backbone sob ataque','airlock','arena exclusiva'],
        sections=[dict(x=0,label='01 // TORRES DO DATA CENTER'),dict(x=2500,label='02 // BACKBONE SOB ATAQUE'),dict(x=4800,label='03 // ARENA DE VIRUS ZERO')],
        checkpoints=[dict(x=640,y=1190),dict(x=1850,y=1050),dict(x=2910,y=1640),dict(x=4450,y=1170),dict(x=5000,y=900)])
    coords=[('tower-a-step1',400,1550,180),('tower-a-step2',600,1460,180),('tower-a-step3',420,1370,180),('tower-a-step4',620,1280,180),
        ('backbone-fallback',1110,1570,170),('tower-b-step1',1470,1540,180),('tower-b-step2',1660,1440,180),('tower-b-step3',1470,1340,180),('tower-b-step4',1660,1240,180),('tower-b-step5',1470,1140,180),
        ('dc-to-battle-a',2320,1140,180),('dc-to-battle-b',2500,1230,180),('dc-to-battle-c',2680,1320,180),
        ('combat-bridge-a',3200,1550,160),('combat-bridge-b',3380,1460,160),
        ('airlock-step1',4000,1440,180),('airlock-step2',4170,1350,180),('airlock-step3',4350,1260,180),
        ('arena-approach-a',4700,1080,160),('arena-approach-b',4580,990,170),
        ('core-left-low',5000,800,180),('core-left-high',5200,700,180),('core-middle-low',5410,800,190),('core-middle-step',5540,720,150),('core-aerial-lift',5620,640,160),
        ('core-right-high',5830,730,180),('core-right-low',6050,820,160),('core-right-step',6210,760,130),('core-right-top',6240,700,190),
        ('entry-secret',150,1550,180),('tower-a-secret',420,1100,180),('tower-b-secret',2130,960,150),('combat-secret-a',2840,1550,180),('combat-secret-b',3000,1460,150),('combat-secret-top',2840,1370,180),('airlock-secret',4460,1080,170)]
    p=m['entities']['platforms']=[platform(id,x,y,w,'signal' if id.startswith('core-') else 'cable') for id,x,y,w in coords]
    p.extend([platform('fiber-link-a',1080,1190,180,'cable',requiresComponentId='c01'),platform('fiber-link-b',1260,1120,180,'cable',requiresComponentId='c01'),platform('fiber-link-c',1450,1050,220,'cable',requiresComponentId='c01'),
        platform('upper-backbone-a',2280,1050,250,'packet',requiresComponentId='c02'),platform('upper-backbone-b',2540,1050,250,'packet',requiresComponentId='c02'),platform('upper-backbone-c',2800,1140,200,'packet',requiresComponentId='c02'),
        platform('restored-combat-bridge',3150,1640,300,'route',requiresComponentId='c03'),platform('airlock-elevator',4120,1360,160,'packet',requiresComponentId='c03')])
    next(s for s in p if s['id']=='combat-bridge-a').update(type='temporary',duration=2.0,respawnDelay=2.6)
    next(s for s in p if s['id']=='combat-bridge-b').update(type='moving',motion=dict(axis='x',range=18,speed=.65))
    next(s for s in p if s['id']=='airlock-elevator').update(type='moving',motion=dict(axis='y',range=140,speed=.5))
    next(s for s in p if s['id']=='core-aerial-lift').update(type='moving',motion=dict(axis='y',range=16,speed=.7))
    m['entities']['components']=[component('c01',650,1190,'RELAY DA TORRE A'),component('c02',1900,1050,'RELAY DA TORRE B'),component('c03',3730,1540,'ENERGIA DO BACKBONE'),component('c04',4570,1170,'ESCUDO DO NÚCLEO')]
    m['entities']['gates']=[dict(id='core-access-lock',x=4770,y=750,width=28,height=420,opensWhen=dict(all=[dict(component=f'c0{i}') for i in range(1,5)]))]
    m['entities']['obstacles']=[hazard('backbone-pulse',3100,1560,28,80,'c03',3.6,1.2),hazard('airlock-pulse',4010,1460,28,80,'c03',3.4,1.25,.8),
        dict(id='arena-cover-left',x=5160,y=826,width=52,height=74,type='heatsink',collision='solid'),dict(id='arena-cover-right',x=6110,y=814,width=60,height=86,type='heatsink',collision='solid')]
    m['entities']['enemies']=[enemy('e01','basic',800,1640,400,1000,(80,1360,1000,340)),enemy('e02','shooter',900,1190,470,980,(420,910,600,340)),
        enemy('e03','flyer',2100,1050,1740,2200,(1300,740,1000,370)),enemy('e04','shooter',2980,1640,2700,3090,(2580,1360,570,340)),
        enemy('e05','parasite',3570,1540,3500,4000,(3450,1260,700,340)),enemy('e06','fast',3970,1540,3500,4080,(3450,1260,700,340)),enemy('e07','armored',4660,1170,4430,4750,(4350,890,470,340)),
        dict(id='e08',type='boss',x=5680,y=854,groundY=900,hp=90,multiStage=True,coreShieldRequiresRepairs=True,bossBounds=dict(left=4880,right=6500),activationRegion=dict(x=4800,y=320,width=1800,height=650),armor=.35,damage=18,speed=58,xp=500)]
    m['completion']=dict(type='boss-question',enemyId='e08')
    m['entities']['collectibles']=items([(220,1520),(480,1070),(2190,930),(2900,1340),(4510,1050),(6400,670)])
    scenery=[art('datacenter',80,870,2300,830,'DATA CENTER / REDUNDÂNCIA A–B'),art('server-tower',420,1190,600,450,'TORRE A'),art('server-tower',1660,1050,600,590,'TORRE B'),
        art('battle-hall',2580,1150,1570,550,'BACKBONE / COMBATE AVANÇADO'),art('airlock',4350,850,470,320,'SISTEMAS DO NÚCLEO'),
        art('boss-arena',4800,380,1800,520,'VIRUS ZERO / NÚCLEO DA INTERNET')]
    return finish(m,scenery)

def main():
    for m in [cabling(),dhcp(),dns(),security(),servers()]:
        path=ROOT/'src/maps'/f'{int(m["id"][-2:]):02}-{m["theme"]}.js'
        path.write_text('// Rebuilt layout, revision 2. Authored by tools/build_last_five.py.\nByteRunner.maps.register('+json.dumps(m,ensure_ascii=False,indent=2)+');\n',encoding='utf-8')
        print(f'{m["id"]}: {m["map"]["width"]} x {m["map"]["height"]}, {m["map"]["layout"]}')

if __name__=='__main__':main()
