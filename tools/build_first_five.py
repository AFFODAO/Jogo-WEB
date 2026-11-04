"""Author the five replacement maps. Coordinates below are explicit, independent layouts."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

def platform(id, x, y, w, style='circuit', **extra):
    return dict(id=id, x=x, y=y, width=w, height=18, type='fixed', collision='one-way', style=style, **extra)

def floor(id, x, y, w, h=28):
    return dict(id=id, x=x, y=y, width=w, height=h)

def component(id, x, surface, label):
    return dict(id=id, x=x, y=surface-44, width=34, height=44, label=label)

def enemy(id, type, x, surface, left, right, region=None):
    result=dict(id=id, type=type, x=x, y=surface-(92 if type=='flyer' else 24), groundY=surface,
                navigationBounds=dict(left=left,right=right), patrolMin=left, patrolMax=right)
    if region:
        result['activationRegion']=dict(zip(['x','y','width','height'],region))
    return result

def art(kind,x,y,w,h,label='',**extra):
    return dict(kind=kind,x=x,y=y,width=w,height=h,label=label,**extra)

def portal(id,x,surface,tx,ty,label,requires=None):
    result=dict(id=id,x=x,y=surface-76,width=44,height=76,to=dict(x=tx,y=ty-48),label=label)
    if requires: result['requires']=requires
    return result

def base(number,name,theme,width,height,start,exit,grounds,palette,objective):
    return dict(schemaVersion=2,revision=2,id=f'phase-{number:02}',name=name,theme=theme,objective=objective,palette=palette,
        presentation=dict(procedural=False),
        map=dict(width=width,height=height,layout='horizontal',start=dict(x=start[0],y=start[1]-48),
            exit=dict(mode='region',x=exit[0],y=exit[1]-64,width=90,height=64),
            bounds=dict(left=True,right=True,ceiling=True,floor=True),
            camera=dict(axes=['x','y'],followOffsetX=.44,followOffsetY=.55),
            ground=dict(mode='explicit',segments=grounds),checkpoints=[],checkpointMode='proximity',progress=dict(axis='objectives')),
        entities=dict(platforms=[],obstacles=[],gates=[],components=[],enemies=[],collectibles=[],features=[],interactives=[]),
        objectives=dict(repairAllComponents=True,defeatAllViruses=True,requireExitQuestion=True,goals=[]),
        mechanics=[],assets=[],layers=[])

def finish(m, scenery):
    m['objectives']['componentsToRepair']=len(m['entities']['components'])
    m['objectives']['enemiesToDefeat']=len(m['entities']['enemies'])
    m['layers']=[dict(id='authored-scenery',type='computer-world',theme=m['theme'],pass_='midground',items=scenery)]
    m['layers'][0]['pass']=m['layers'][0].pop('pass_')
    faces=[item for item in scenery if item['kind'] in ['ethernet','antenna']]
    if faces:m['layers'].append(dict(id='hardware-faces',type='computer-world',theme=m['theme'],**{'pass':'foreground'},items=faces))
    return m

def hardware():
    m=base(1,'Hardware do computador','hardware',2800,1000,(70,850),(2670,850),
        [floor('pcb-left',0,850,720,120),floor('pcb-memory',980,850,720,120),floor('pcb-gpu',1900,850,900,120)],
        ['#06191b','#143b35','#63f3bb','#286453','#d6ac64'],
        'Explore a placa-mãe: repare CPU, RAM e GPU para restaurar os barramentos e desligar os curtos.')
    m['map']['routes']=['trilha inferior da placa-mãe','barramento da CPU','torre de memória','passarela da GPU']
    m['map']['checkpoints']=[dict(x=1050,y=850),dict(x=1400,y=510),dict(x=2000,y=850)]
    p=m['entities']['platforms']
    p.extend([
        platform('socket-step',250,770,150),platform('cpu-pins',390,710,130),
        platform('cpu-package',460,650,280),
        platform('cpu-secret-cache',300,570,120),
        platform('trace-low-a',720,830,150),platform('trace-low-b',850,750,150),
        platform('ram-pin-a',1030,670,150),platform('ram-pin-b',1190,590,150),
        platform('ram-module',1320,510,210),platform('ram-secret-rail',1510,430,150),
        platform('cpu-restored-bus',740,650,240,requiresComponentId='c01'),
        platform('memory-restored-bus',1530,610,220,requiresComponentId='c02'),
        platform('gpu-riser-a',1770,760,150),platform('gpu-riser-b',1930,690,150),
        platform('gpu-board',2070,620,300),platform('gpu-cache',2290,530,150),
        platform('gpu-restored-link',2380,700,170,requiresComponentId='c03')])
    m['entities']['obstacles']=[dict(id='live-trace',x=1580,y=790,width=60,height=60,type='interference',collision='dangerous',damage=10,requiresComponentId='c02'),
        dict(id='gpu-heatsink',x=2490,y=760,width=64,height=90,type='heatsink',collision='solid')]
    m['entities']['components']=[component('c01',560,650,'SOQUETE DA CPU'),component('c02',1390,510,'BANCO DE RAM'),component('c03',2200,620,'ALIMENTAÇÃO DA GPU')]
    m['entities']['enemies']=[enemy('e01','basic',480,850,340,650),enemy('e02','fast',1260,590,1210,1320),enemy('e03','armored',2310,620,2120,2340)]
    m['entities']['collectibles']=[dict(id=f'i{i:02}',x=x,y=y,radius=10,secret=secret) for i,(x,y,secret) in enumerate([(350,540,True),(1560,400,True),(2350,500,True),(1050,810,False),(2000,660,False)],1)]
    m['mechanics']=[dict(id='cpu-cooling',type='environment',zones=[dict(id='cooling-fan',x=760,y=670,width=180,height=190,forceX=85,label='VENTOINHA →',disabledWhen=dict(component='c01'))])]
    scenery=[art('board',0,200,2800,770,'PLACA-MÃE'),art('cpu',460,650,280,115,'CPU'),art('ram',1320,510,210,300,'MEMÓRIA RAM'),
        art('gpu',2070,620,300,180,'PLACA DE VÍDEO'),art('fan',780,730,120,120,'FLUXO →'),art('cache',300,540,120,30,'CACHE L1'),art('cache',1510,400,150,30,'CACHE RAM')]
    return finish(m,scenery)

def software():
    grounds=[floor('desktop-floor',80,1250,660),floor('process-floor',80,650,660),floor('filesystem-floor',1150,650,660),floor('scheduler-floor',1150,1250,660)]
    m=base(2,'Software do computador','software',1900,1400,(280,1250),(1660,1250),grounds,
        ['#111025','#302756','#b6a0ff','#575187','#f297c7'],
        'Navegue pelos diretórios, restaure processos e arquivos e recupere o escalonador nas quatro salas do sistema.')
    m['map']['layout']='hub';m['map']['checkpointMode']='free'
    m['map']['routes']=['Desktop → Processos → Arquivos','Desktop → Escalonador → Arquivos']
    m['map']['checkpoints']=[dict(x=180,y=650),dict(x=1250,y=650),dict(x=1300,y=1250)]
    m['entities']['platforms']=[
        platform('desktop-window',300,1150,180,'window'),
        platform('desktop-cache',510,1060,150,'window'),platform('process-window',250,550,150,'window'),
        platform('process-monitor',440,470,160,'window'),platform('filesystem-step',1220,560,160,'window'),
        platform('restored-file-window',1430,480,200,'window',requiresComponentId='c02'),
        platform('scheduler-step',1270,1170,170,'window'),platform('scheduler-platform',1450,1090,230,'window'),
        platform('restored-process-link',520,550,180,'window',requiresComponentId='c01'),
        platform('scheduler-secret',1650,1000,140,'window'),platform('restored-scheduler-window',1230,1010,170,'window',requiresComponentId='c03')]
    m['entities']['platforms'][0].update(type='moving',motion=dict(axis='x',range=28,speed=.6))
    m['entities']['platforms'][3].update(type='moving',motion=dict(axis='y',range=12,speed=.7))
    walls=[]
    for label,x,y in [('desktop',60,920),('process',60,320),('files',1130,320),('scheduler',1130,920)]:
        walls.extend([dict(id=label+'-wall-left',x=x,y=y,width=20,height=354,collision='solid',type='corrupt'),dict(id=label+'-wall-right',x=x+680,y=y,width=20,height=354,collision='solid',type='corrupt')])
    walls.extend([dict(id='corrupt-file',x=1390,y=554,width=46,height=96,type='corrupt',collision='solid',requiresComponentId='c02'),
                  dict(id='hung-process',x=540,y=570,width=38,height=80,type='corrupt',collision='solid',requiresComponentId='c01')])
    m['entities']['obstacles']=walls
    m['entities']['components']=[component('c01',420,650,'PROCESSO DO SISTEMA'),component('c02',1510,650,'ÍNDICE DE ARQUIVOS'),component('c03',1510,1090,'ESCALONADOR')]
    m['entities']['enemies']=[enemy('e01','fast',550,1250,220,650,(80,900,660,400)),enemy('e02','basic',570,650,300,680,(80,300,660,400)),enemy('e03','shooter',1690,1090,1490,1650,(1150,900,660,400))]
    m['entities']['collectibles']=[dict(id=f'i{i:02}',x=x,y=y,radius=10,secret=True) for i,(x,y) in enumerate([(565,1030),(510,435),(1530,450),(1720,970)],1)]
    links=[portal('desktop-to-process',610,1250,150,650,'/PROCESSOS'),portal('process-to-desktop',110,650,500,1250,'/DESKTOP'),
        portal('process-to-files',650,650,1240,650,'/ARQUIVOS',dict(component='c01')),portal('files-to-process',1170,650,530,650,'/PROCESSOS'),
        portal('desktop-to-scheduler',120,1250,1240,1250,'/TAREFAS',dict(component='c01')),portal('scheduler-to-desktop',1180,1250,240,1250,'/DESKTOP'),
        portal('scheduler-to-files',1740,1250,1680,650,'/ARQUIVOS'),portal('files-to-scheduler',1740,650,1270,1250,'/TAREFAS')]
    m['mechanics']=[dict(id='directories',type='portals',links=links)]
    scenery=[art('window-room',80,920,660,330,'DESKTOP / ENTRADA'),art('window-room',80,320,660,330,'PROCESSOS'),
        art('window-room',1150,320,660,330,'SISTEMA DE ARQUIVOS'),art('window-room',1150,920,660,330,'ESCALONADOR'),
        art('folder',510,1020,150,40,'CACHE'),art('process',250,520,150,30,'PID 014'),art('process',1450,1060,230,30,'TASK MANAGER')]
    return finish(m,scenery)

def switch():
    grounds=[floor('backplane-base',860,1040,480,80),floor('port-01-floor',150,900,300,100),floor('port-02-floor',1600,920,350,100),floor('port-03-floor',180,400,300,100),floor('port-04-floor',1830,400,300,100)]
    m=base(3,'Switch de rede','switch',2200,1200,(1000,1040),(1050,450),grounds,
        ['#071b24','#12384a','#63e6ed','#327e88','#f5b969'],
        'Restaure o backplane e as conexões; ative as portas 01 e 04 para liberar a transmissão ao uplink.')
    m['map']['layout']='multi-route';m['map']['checkpointMode']='free';m['map']['checkpoints']=[dict(x=1010,y=1040),dict(x=260,y=900),dict(x=1880,y=400)]
    m['map']['routes']=['ramal da porta 01','ramal da porta 02','ramal superior 03','ramal superior 04','backplane vertical']
    m['entities']['platforms']=[
        platform('port01-cable-a',680,1030,180,'cable'),platform('port01-cable-b',490,960,170,'cable'),
        platform('port02-packet-a',1370,990,160,'packet'),platform('port02-packet-b',1530,940,160,'packet'),
        platform('spine-a',910,950,170,'packet'),platform('spine-b',1030,860,170,'packet'),platform('spine-c',1040,770,180,'packet'),
        platform('spine-d',950,680,180,'packet'),platform('spine-e',1040,590,180,'packet'),platform('spine-f',950,500,180,'packet'),
        platform('uplink-floor',840,450,520,'packet'),
        platform('port03-step-a',740,560,170,'cable'),platform('port03-step-b',660,480,150,'packet'),platform('port03-step-c',480,450,150,'cable'),
        platform('port04-step-a',1230,570,160,'packet'),platform('port04-step-b',1410,490,160,'packet'),platform('port04-step-c',1600,410,190,'cable'),
        platform('restored-left-link',600,810,190,'cable',requiresComponentId='c01'),
        platform('left-link-step',760,740,180,'cable',requiresComponentId='c01'),
        platform('restored-right-link',1550,620,180,'packet',requiresComponentId='c02'),
        platform('port04-secret',1730,540,150,'packet',requires=dict(flag='port-b')),
        platform('port01-secret',340,800,150,'packet',requires=dict(flag='port-a')),
        platform('restored-backplane-link',1190,700,180,'packet',requiresComponentId='c03')]
    m['entities']['components']=[component('c01',230,900,'CONECTOR ETHERNET'),component('c02',1880,400,'ENLACE DA PORTA 04'),component('c03',1100,770,'BACKPLANE')]
    m['entities']['enemies']=[enemy('e01','basic',1210,1040,920,1290),enemy('e02','parasite',380,900,190,420),enemy('e03','shooter',2050,400,1900,2090)]
    m['entities']['interactives']=[dict(id='ethernet-port-a',type='switch',x=360,y=860,width=36,height=40,flag='port-a',once=True,label='01',message='PORTA 01 ATIVA // PACOTES LIBERADOS'),
        dict(id='ethernet-port-b',type='switch',x=2010,y=360,width=36,height=40,flag='port-b',once=True,label='04',message='PORTA 04 ATIVA // UPLINK RESTAURADO')]
    m['objectives']['goals']=[dict(id='active-ports',type='condition',condition=dict(all=[dict(flag='port-a'),dict(flag='port-b')]))]
    m['entities']['collectibles']=[dict(id=f'i{i:02}',x=x,y=y,radius=10,secret=True) for i,(x,y) in enumerate([(390,770),(1750,510),(290,365),(1750,885)],1)]
    scenery=[art('backplane',840,450,520,650,'BACKPLANE / UPLINK'),art('ethernet',150,900,300,110,'PORTA 01'),art('ethernet',1600,920,350,110,'PORTA 02'),
        art('ethernet',180,400,300,110,'PORTA 03'),art('ethernet',1830,400,300,110,'PORTA 04')]
    return finish(m,scenery)

def router():
    grounds=[floor('lan-tunnel',80,1320,2020,50),floor('routing-west',300,950,800),floor('routing-east',1560,950,500),floor('wan-tunnel',740,500,1320)]
    m=base(4,'Roteador','router',2200,1500,(150,1320),(1950,500),grounds,
        ['#0b1426','#233954','#80c6ff','#426e97','#ffbe80'],
        'Explore túneis e interfaces: corrija as tabelas LAN, de trânsito e WAN para abrir novas rotas.')
    m['map']['layout']='maze';m['map']['checkpointMode']='free';m['map']['checkpoints']=[dict(x=1740,y=1320),dict(x=600,y=950),dict(x=1830,y=500)]
    m['map']['routes']=['túnel LAN inferior','trânsito com bifurcação','WAN superior','interfaces de retorno']
    m['entities']['platforms']=[
        platform('lan-detour-a',740,1230,140,'route'),platform('lan-detour-b',850,1150,150,'route'),
        platform('left-shaft-a',220,1230,170,'route'),platform('left-shaft-b',380,1140,170,'route'),platform('left-shaft-c',220,1050,170,'route'),
        platform('transit-detour-a',1100,860,150,'packet'),platform('transit-detour-b',1280,780,160,'packet'),platform('transit-detour-c',1440,860,170,'packet'),
        platform('restored-transit',1100,950,460,'route',requiresComponentId='c02'),
        platform('right-shaft-a',1900,860,160,'route'),platform('right-shaft-b',1780,770,160,'route'),platform('right-shaft-c',1930,680,160,'route'),platform('right-shaft-d',1780,590,170,'route'),
        platform('wan-detour-a',1340,410,160,'route'),platform('wan-detour-b',1210,330,160,'route'),
        platform('wan-cache-a',760,410,160,'route'),platform('wan-cache-b',640,330,160,'route')]
    m['entities']['obstacles']=[dict(id='lan-route-failure',x=920,y=1140,width=44,height=180,type='route-wall',collision='solid',requiresComponentId='c01'),
        dict(id='wan-route-failure',x=1200,y=320,width=40,height=180,type='route-wall',collision='solid',requiresComponentId='c03')]
    m['entities']['components']=[component('c01',1800,1320,'TABELA LAN'),component('c02',620,950,'TABELA DE TRÂNSITO'),component('c03',900,500,'TABELA WAN')]
    m['entities']['enemies']=[enemy('e01','fast',1510,1320,1250,1960,(1000,1100,1100,270)),enemy('e02','flyer',1680,940,1500,2040,(1050,670,1080,350)),enemy('e03','armored',1600,500,1460,1900,(740,280,1340,300))]
    m['entities']['collectibles']=[dict(id=f'i{i:02}',x=x,y=y,radius=10,secret=True) for i,(x,y) in enumerate([(700,300),(1350,750),(430,1110),(1980,1290)],1)]
    links=[portal('lan-interface',200,1320,400,950,'LAN 0',dict(component='c01')),portal('lan-return',360,950,300,1320,'LAN 1'),
        portal('wan-interface',1960,950,1830,500,'WAN 0',dict(component='c02')),portal('wan-return',2000,500,1750,950,'WAN 1'),
        portal('route-backup',2010,1320,780,500,'ROTA RESERVA',dict(all=[dict(component='c01'),dict(component='c02')]))]
    m['mechanics']=[dict(id='network-interfaces',type='portals',links=links)]
    scenery=[art('tunnel',80,1030,2020,290,'LAN / ROTA INFERIOR →'),art('tunnel',300,670,800,280,'← TABELA DE TRÂNSITO'),
        art('tunnel',1560,670,500,280,'WAN ↑'),art('tunnel',740,220,1320,280,'WAN / ROTA SUPERIOR'),art('cache',640,290,160,40,'ROTA DE DIAGNÓSTICO')]
    return finish(m,scenery)

def wifi():
    grounds=[floor('wifi-start',70,2240,500,80),floor('antenna-a',950,1880,300,90),floor('repeater',140,1520,290,90),floor('antenna-b',1060,1160,310,90),floor('uplink-antenna',620,350,300,90)]
    m=base(5,'Rede Wi-Fi','wifi',1550,2400,(160,2240),(740,350),grounds,
        ['#08162c','#143951','#81ecff','#386c91','#e4bc6f'],
        'Suba pelos sinais, repare os três pontos de acesso e elimine a interferência até alcançar a antena de uplink.')
    m['map']['layout']='vertical';m['map']['checkpoints']=[dict(x=1040,y=1880),dict(x=240,y=1520),dict(x=1160,y=1160),dict(x=720,y=620)]
    m['map']['routes']=['canal principal em zigue-zague','canal limpo após reparo','cache abaixo da entrada','antena lateral secreta']
    coords=[('signal-01',350,2150,180),('signal-02',560,2060,180),('signal-03',760,1970,180),
        ('signal-05',780,1790,170),('signal-06',580,1700,180),('signal-07',380,1610,180),
        ('signal-09',400,1430,180),('signal-10',620,1340,190),('signal-11',840,1250,180),
        ('signal-13',880,1070,180),('signal-14',680,980,180),('signal-15',480,890,180),
        ('signal-16',260,800,210),('signal-17',430,710,180),('signal-18',640,620,180),('signal-19',840,530,180),('signal-20',980,440,180),
        ('entry-cache',650,2280,180),('antenna-cache-step',1300,1070,170),('antenna-cache-top',1320,980,160)]
    m['entities']['platforms']=[platform(id,x,y,w,'signal') for id,x,y,w in coords]
    for p in m['entities']['platforms']:
        if p['id'] in ['signal-01','signal-05','signal-09','signal-13','signal-17']:
            p.update(type='temporary',duration=2.4,respawnDelay=2.2)
        if p['id'] in ['signal-03','signal-15']:
            p.update(type='moving',motion=dict(axis='x',range=20,speed=.65))
        if p['id']=='signal-07':p.update(type='moving',motion=dict(axis='y',range=12,speed=.65))
    clean=[('clean-01',80,1430,160),('clean-02',180,1340,160),('clean-03',60,1250,160),('clean-04',220,1160,180),('clean-05',400,1070,170),('clean-06',530,1020,170)]
    m['entities']['platforms'].extend(platform(id,x,y,w,'signal',requiresComponentId='c02') for id,x,y,w in clean)
    m['entities']['components']=[component('c01',1070,1880,'PONTO DE ACESSO A'),component('c02',240,1520,'REPETIDOR'),component('c03',1190,1160,'PONTO DE ACESSO B')]
    m['entities']['enemies']=[enemy('e01','shooter',1180,1880,1020,1210,(850,1650,650,350)),enemy('e02','flyer',500,1530,180,800,(100,1300,800,400)),enemy('e03','basic',1280,1160,1100,1330,(800,940,700,330))]
    m['entities']['collectibles']=[dict(id=f'i{i:02}',x=x,y=y,radius=10,secret=True) for i,(x,y) in enumerate([(720,2250),(1390,950),(120,1220),(320,770),(740,320)],1)]
    zones=[dict(id='weak-lower',x=650,y=1740,width=630,height=390,speedMultiplier=.84,fireIntervalMultiplier=1.45,projectileSpeedMultiplier=.8,label='INTERFERÊNCIA / SINAL 35%',disabledWhen=dict(component='c01')),
        dict(id='weak-middle',x=400,y=1190,width=570,height=380,speedMultiplier=.88,fireIntervalMultiplier=1.4,projectileSpeedMultiplier=.82,label='CANAL CONGESTIONADO',disabledWhen=dict(component='c02')),
        dict(id='weak-upper',x=420,y=880,width=680,height=340,speedMultiplier=.9,fireIntervalMultiplier=1.35,projectileSpeedMultiplier=.85,label='SINAL FRACO',disabledWhen=dict(component='c03')),
        dict(id='clean-channel',x=40,y=1000,width=350,height=530,speedMultiplier=1.05,label='CANAL LIMPO / SINAL 100%',requires=dict(component='c02'))]
    m['mechanics']=[dict(id='radio-spectrum',type='environment',zones=zones)]
    scenery=[art('antenna',70,2240,500,100,'ASSOCIAÇÃO / ENTRADA'),art('antenna',950,1880,300,100,'AP A'),art('antenna',140,1520,290,100,'REPETIDOR'),
        art('antenna',1060,1160,310,100,'AP B'),art('antenna',620,350,300,130,'UPLINK / INTERNET'),art('cache',1320,940,160,40,'ANTENA AUXILIAR')]
    return finish(m,scenery)

def main():
    for phase in [hardware(),software(),switch(),router(),wifi()]:
        path=ROOT/'src/maps'/f'{int(phase["id"][-2:]):02}-{phase["theme"]}.js'
        path.write_text('// Rebuilt layout, revision 2. Authored by tools/build_first_five.py.\nByteRunner.maps.register('+json.dumps(phase,ensure_ascii=False,indent=2)+');\n',encoding='utf-8')
        print(f'{phase["id"]}: {phase["map"]["width"]} x {phase["map"]["height"]}, {phase["map"]["layout"]}')

if __name__=='__main__':main()
