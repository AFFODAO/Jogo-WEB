// Hybrid campaign: independent authored macro-architecture + seeded service routes.
(() => {
  'use strict';
  const api=ByteRunner, generation=api.mapGeneration, copy=api.maps.clone;
  const configurations={
    hardware:{seed:'motherboard-v3',layout:'horizontal',style:'circuit',regions:['CPU','RAM','GPU','BUS'],
      routes:[{id:'bus-service',points:[[60,770],[180,690],[280,610]],repair:'c01'}]},
    software:{seed:'desktop-v3',layout:'hub',style:'window',regions:['DESKTOP','PROCESSOS','ARQUIVOS','ESCALONADOR'],
      routes:[{id:'directory-cache',points:[[120,1160],[120,1070],[240,990]],repair:'c01'}]},
    switch:{seed:'backplane-v3',layout:'multi-route',style:'packet',regions:['BACKPLANE','ETHERNET 01','ETHERNET 02','ETHERNET 03','ETHERNET 04'],
      transmission:{x:1300,y:810,width:128,range:90},
      routes:[{id:'packet-return',points:[[1650,840],[1770,750],[1890,660]],repair:'c02'}]},
    router:{seed:'routing-v3',layout:'maze',style:'route',regions:['LAN','TRANSITO','WAN','ROTA RESERVA'],
      routes:[{id:'lan-diagnostic',points:[[1120,1230],[1250,1140],[1390,1050]],repair:'c01'}]},
    wifi:{seed:'radio-v3',layout:'vertical',style:'signal',regions:['ANTENA A','REPETIDOR','ANTENA B','UPLINK'],
      routes:[{id:'antenna-observation',points:[[440,2150],[570,2060],[700,1970]],repair:'c01'}]},
    cabling:{seed:'building-shafts-v3',revision:4,layout:'vertical',style:'cable',regions:['SUBSOLO','SHAFT OESTE','SHAFT LESTE','MANUTENCAO','COBERTURA'],
      routes:[{id:'maintenance-east',points:[[1100,2700],[1260,2600],[1100,2500],[1260,2400],[1100,2300]]},
        {id:'maintenance-crossing',points:[[620,2110],[760,2020],[900,1930]],repair:'c01'}],
      scenery:[{kind:'rack',x:1110,y:2220,width:300,height:150,label:'MANUTENCAO / SHAFT LESTE'}]},
    dhcp:{seed:'subnet-distribution-v3',layout:'hub',style:'packet',regions:['DISTRIBUICAO','ESCOPO 10.0.10','DIAGNOSTICO','RELAY','GATEWAY'],
      routes:[{id:'ip-assignment-balcony',points:[[1250,910],[1370,820],[1490,730]],repair:'c01'}],
      mechanics:[{id:'address-conflicts',type:'environment',zones:[{id:'duplicate-scope',x:450,y:490,width:260,height:160,
        speedMultiplier:.85,label:'CONFLITO / IP DUPLICADO',disabledWhen:{component:'c02'}}]}]},
    dns:{seed:'domain-labyrinth-v3',layout:'maze',style:'window',regions:['RAIZ','.COM','MAIL.COM','.ORG','API.ORG','CACHE TTL','NXDOMAIN'],
      routes:[{id:'ttl-service-path',points:[[1850,1810],[2010,1720],[2170,1630]],repair:'c03'}],
      mechanics:[{id:'ttl-root-shortcut',type:'portals',links:[
        {id:'root-archive-secret',x:1850,y:324,width:44,height:76,label:'CACHE TTL / ATALHO',requires:{component:'c03'},to:{x:2130,y:1852}},
        {id:'archive-root-secret',x:2150,y:1824,width:44,height:76,label:'RAIZ / CACHE RESOLVIDO',requires:{component:'c03'},to:{x:1600,y:352}}]}]},
    firewall:{seed:'digital-fortress-v3',layout:'multi-route',style:'route',regions:['PERIMETRO','INFILTRACAO','BASTIAO','ANEL INTERNO','CIDADELA'],
      routes:[{id:'infiltration-duct',points:[[300,1380],[450,1290],[600,1200],[750,1110]],repair:'c01'}],
      scenery:[{kind:'security-hall',x:170,y:1050,width:600,height:200,label:'DUTO DE INFILTRACAO / ACESSO OCULTO'}]},
    servers:{seed:'datacenter-exploration-v3',layout:'multi-route',style:'cable',regions:['TORRE A','TORRE B','FIBRA OPTICA','BACKBONE','AIRLOCK','ARENA MANUAL'],
      routes:[{id:'redundant-fiber-path',points:[[1080,1480],[1200,1390],[1320,1300]],repair:'c01'},
        {id:'backbone-maintenance',points:[[2610,1550],[2470,1460],[2330,1370]]}],
      manualArena:{left:4800,right:6800,top:0,bottom:2000}}
  };
  for(const theme of Object.keys(configurations))generation.registerGenerator({
    id:'campaign-'+theme,version:1,
    generate({config,random}) {
      const source=config.blueprint, settings=config;
      // The right-hand arena is an authored combat space, never a procedural slot.
      // Enforce this during compile as well as build, including alternate seeds.
      const arenaLeft=theme==='servers'?4800:null;
      const outsideArena=rect=>{
        if(arenaLeft!==null && rect.x+(rect.width || 0)>arenaLeft)throw new Error('Generated content enters manual VIRUS ZERO arena');
      };
      const room={id:theme+'-world',version:1,width:source.map.width,height:source.map.height,
        ground:copy(source.map.ground.segments),entities:copy(source.entities),
        anchors:{entry:copy(source.map.start),exit:{x:source.map.exit.x,y:source.map.exit.y}},
        sockets:[],checkpoints:copy(source.map.checkpoints),goals:copy(source.objectives.goals),
        mechanics:copy(source.mechanics),assets:copy(source.assets),layers:copy(source.layers)};
      // These routes are optional. Fixed steps always remain within base jump limits;
      // only the final observation deck depends on repair, never an objective.
      for(const route of settings.routes)route.points.forEach(([x,y],i)=>{
        const platform={id:route.id+'-'+i,x,y,width:128+random.int(0,2)*8,height:16,
          type:'fixed',collision:'one-way',style:settings.style,
          ...(route.repair&&i===route.points.length-1?{requiresComponentId:route.repair}:{})};
        outsideArena(platform);room.entities.platforms.push(platform);
      });
      if(settings.scenery){settings.scenery.forEach(outsideArena);room.layers.push({id:'generated-service-rooms',type:'infrastructure-world',theme,pass:'midground',items:copy(settings.scenery)});}
      if(arenaLeft!==null&&settings.mechanics?.length)throw new Error('Generated mechanics are disabled in the manual arena world');
      if(settings.mechanics)room.mechanics.push(...copy(settings.mechanics));
      if(settings.transmission) {
        const lift=settings.transmission;
        outsideArena(lift);
        room.entities.platforms.push({id:'backplane-transmission-lift',x:lift.x,y:lift.y,width:lift.width,height:16,
          type:'moving',collision:'one-way',style:'elevator',motion:{axis:'y',range:lift.range,speed:.6,phase:0}});
      }
      if(config.theme!==theme)throw new Error('Campaign theme mismatch');
      return room;
    }
  });
  function build(authored) {
    const settings=configurations[authored.theme];
    if(!settings)throw new Error('Unsupported campaign generation theme');
    const plan={id:authored.id,name:authored.name,theme:authored.theme,seed:settings.seed,revision:settings.revision||3,
      layout:settings.layout,objective:authored.objective,size:{width:authored.map.width,height:authored.map.height},
      rooms:[{id:'world',generator:'campaign-'+authored.theme,x:0,y:0,config:{...copy(settings),theme:authored.theme,blueprint:copy(authored)}}],
      links:[],start:{room:'world',anchor:'entry'},exit:{room:'world',anchor:'exit',width:authored.map.exit.width,height:authored.map.exit.height},
      objectives:{...copy(authored.objectives),goals:[]}};
    if(authored.completion)plan.completion={...copy(authored.completion),enemyId:'world:'+authored.completion.enemyId};
    const compiled=copy(generation.compile(plan));
    // One macro-room per world keeps legacy IDs, flags, service caches and save
    // list order stable. Revision 3 invalidates old coordinates through the runtime.
    function legacy(value) {
      if(typeof value==='string')return value.startsWith('world:')?value.slice(6):value;
      if(Array.isArray(value))return value.map(legacy);
      if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,legacy(v)]));
      return value;
    }
    const result=legacy(compiled);
    result.generation=compiled.generation;
    result.generation.architecture={theme:authored.theme,regions:copy(settings.regions),routes:copy(settings.routes),mode:'authored-macro-and-seeded-routes'};
    if(settings.manualArena)result.generation.architecture.manualArena=copy(settings.manualArena);
    result.map.checkpointMode=authored.map.checkpointMode;
    result.map.routes=copy(authored.map.routes);
    if(authored.map.sections)result.map.sections=copy(authored.map.sections);
    result.palette=copy(authored.palette);
    const errors=generation.validation.definition(result);
    if(errors.length)throw new Error(errors.join('; '));
    return result;
  }
  api.campaignGeneration=Object.freeze({build});
})();
