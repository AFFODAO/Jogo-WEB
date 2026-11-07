// Hardware V3: hand-planned motherboard districts and deterministic optional bays.
// Compiled directly: the obsolete one-room campaign adapter is intentionally bypassed.
(() => {
  'use strict';
  const api=ByteRunner,g=api.mapGeneration,copy=api.maps.clone,W=640,H=512,F=464;
  const districts=[
    {id:'pcb',name:'PLACA-MAE CENTRAL',kind:'cpu',state:0},
    {id:'cpu',name:'COMPLEXO DA CPU',kind:'cpu',state:0},
    {id:'ram',name:'TORRES DE MEMORIA RAM',kind:'ram',state:1},
    {id:'bus',name:'BARRAMENTOS',kind:'cache',state:2},
    {id:'gpu',name:'COMPLEXO DA GPU',kind:'gpu',state:2},
    {id:'core',name:'NUCLEO FINAL',kind:'cpu',state:3}
  ];
  // id, grid column/row, district, role. Occupied cells define the new silhouette.
  const cells=[
    ['arrival',0,3,'pcb','entry'],['junction',1,3,'pcb','exploration'],['l1-vault',0,4,'pcb','secret'],
    ['thermal',0,2,'cpu','parkour'],['socket',1,2,'cpu','repair'],['heatsink',1,1,'cpu','combat'],
    ['ram-base',2,1,'ram','repair'],['ram-west',2,0,'ram','parkour'],['ram-east',3,0,'ram','secret'],['ram-return',3,1,'ram','exploration'],
    ['bus-north',2,2,'bus','exploration'],['bus-cross',3,2,'bus','parkour'],['bus-west',2,3,'bus','repair'],['bus-east',3,3,'bus','combat'],['bus-cache',2,4,'bus','secret'],['bus-return',3,4,'bus','parkour'],
    ['gpu-west',4,2,'gpu','combat'],['gpu-east',5,2,'gpu','repair'],['gpu-under',4,3,'gpu','parkour'],['gpu-cache',5,3,'gpu','secret'],
    ['core-test',5,1,'core','parkour'],['core-exit',6,1,'core','exit']
  ].map(([id,col,row,district,role])=>({id,col,row,district,role}));
  const byGrid=new Map(cells.map(c=>[c.col+','+c.row,c]));
  const directions={west:[-1,0],east:[1,0],north:[0,-1],south:[0,1]};
  for(const c of cells)c.ports=Object.fromEntries(Object.entries(directions).map(([side,[dx,dy]])=>[side,byGrid.has((c.col+dx)+','+(c.row+dy))]));
  const repairRooms={'socket':['cpu-relay','REFRIGERACAO DA CPU'],'ram-base':['ram-relay','BANCO DE MEMORIA'],'bus-west':['bus-relay','MALHA DOS BARRAMENTOS'],'gpu-east':['gpu-relay','ALIMENTACAO PRINCIPAL DA GPU']};
  const repairRef=id=>id+':'+repairRooms[id][0];
  function room(c,random){
    const d=districts.find(d=>d.id===c.district),r={id:'hw-'+c.id,version:5,width:W,height:H,ground:[],entities:Object.fromEntries(g.config.groups.map(k=>[k,[]])),anchors:{entry:{x:64,y:F-48},exit:{x:520,y:F-64}},sockets:[],checkpoints:[],layers:[],mechanics:[]};
    const rect=(id,x,y,width,height)=>({id,x,y,width,height});
    const fixed=(id,x,y,width=128)=>r.entities.platforms.push({...rect(id,x,y,width,16),type:'fixed',collision:'one-way',style:'circuit'});
    if(c.ports.south){r.ground.push(rect('deck-west',0,F,208,48),rect('deck-east',496,F,144,48));fixed('shaft-cap',224,F-64,256);}
    else if(c.role==='parkour'){
      r.ground.push(rect('deck-west',0,F,224,48),rect('deck-east',464,F,176,48),rect('catch-deck',224,H-16,240,16));
      fixed('gap-step',280,F-64,c.district==='core'?96:128);
    }else r.ground.push(rect('deck',0,F,W,48));
    // Full-height structural walls, with 128px-high side apertures at the deck.
    for(const side of ['west','east']){
      r.entities.obstacles.push(rect('wall-'+side,side==='west'?0:W-16,0,16,c.ports[side]?F-128:F));
      if(c.ports[side])r.sockets.push({id:side,direction:side,x:side==='west'?0:W,y:F-48});
    }
    if(c.ports.north){
      r.entities.obstacles.push(rect('roof-west',16,0,192,16),rect('roof-east',496,0,128,16));
      r.sockets.push({id:'north',direction:'north',x:320,y:0});
      // Leave >= one body width beside the top landing so shafts work both ways.
      const tread=c.district==='gpu'?96:c.district==='ram'?112:128;
      for(let i=0;i<5;i++)if(i!==0||!c.ports.south)fixed('riser-'+i,i===4?256:i%2?352:224,400-i*96,i===4?192:tread);
    }else r.entities.obstacles.push(rect('roof',16,0,W-32,16));
    if(c.ports.south)r.sockets.push({id:'south',direction:'south',x:320,y:H});
    // Optional observation shelves do not gate any mandatory room.
    if(!c.ports.north){fixed('service-step',80,F-96,128);fixed('observation',176,F-192,144);}
    if(c.role==='exit'){fixed('core-dais',400,240,224);r.anchors.exit.y=176;}
    if(c.role==='secret'){
      const x=random?random.int(5,7)*16:96;
      if(c.ports.north)fixed('cache-ledge',x-32,F-96,128);
      r.entities.collectibles.push({id:'secret-cache',x:x+32,y:F-128,radius:10,secret:true},{id:'cache-bonus',x:560,y:F-30,radius:10,secret:true});
    }else r.entities.collectibles.push({id:'data',x:112,y:F-30,radius:10,secret:false});
    if(repairRooms[c.id]){
      const [id,label]=repairRooms[c.id];r.entities.components.push({id,x:112,y:F-44,width:34,height:44,label,repair:api.repairChallenges.forPhase(0,Object.keys(repairRooms).indexOf(c.id))});
      // Safe permanent deck remains; repair also powers a visible observation bridge.
      r.entities.platforms.push({...rect('powered-bridge',424,F-160,176,16),type:'fixed',collision:'one-way',style:'circuit',requires:{component:id}});
      r.mechanics.push({id:'maintenance-return',type:'portals',links:[{id:'return',x:176,y:F-76,width:40,height:76,label:'RETORNO / PLACA-MAE',requires:{component:id},to:{room:'arrival',anchor:'entry'}}]});
    }
    if(['socket','ram-base','bus-west','gpu-east','core-test','junction','heatsink','arrival'].includes(c.id))r.checkpoints.push({x:48,y:F});
    if(['combat','repair'].includes(c.role)||['thermal','bus-cross','core-test'].includes(c.id)){
      const type=c.district==='gpu'?'armored':c.role==='combat'?'fast':'basic';
      const left=c.ports.south?504:448,right=600;
      r.entities.enemies.push({id:'guard',type,x:(left+right)/2,y:F-24,groundY:F,patrolMin:left,patrolMax:right,navigationBounds:{left,right},activationRegion:{x:16,y:64,width:608,height:400}});
      if(c.role==='combat')r.entities.enemies.push({id:'sentry',type:'shooter',x:136,y:F-24,groundY:F,patrolMin:96,patrolMax:176,navigationBounds:{left:96,right:176},activationRegion:{x:16,y:64,width:608,height:400}});
    }
    if(['thermal','ram-return','gpu-under','core-test'].includes(c.id))r.entities.platforms.push({...rect('lift',80,272,128,16),type:'moving',collision:'one-way',style:'elevator',motion:{axis:'y',range:64,speed:.45,phase:0}});
    if(['bus-return','gpu-under'].includes(c.id))r.entities.platforms.push({...rect('temporary-cache',448,272,112,16),type:'temporary',collision:'one-way',style:'signal',duration:2.6,respawnDelay:2.4});
    if(['thermal','bus-cross','gpu-under','core-test'].includes(c.id))r.mechanics.push({id:'telegraphed-current',type:'parkour-hazards',hazards:[{id:'current',kind:c.district==='cpu'?'laser':'electric',x:408,y:F-32,width:24,height:32,warning:1.2,active:.65,period:4.8,phase:0,damage:8}]});
    if(c.id==='thermal')r.mechanics.push({id:'cooling',type:'environment',zones:[{id:'fan',x:224,y:240,width:160,height:100,forceX:45,label:'CALOR / REFRIGERAR CPU',disabledWhen:{component:repairRef('socket')}}]});
    // Large pixel rectangles form equipment silhouettes; atlas details sit inside them.
    // These are scenery layers, never invisible collision boxes.
    const chassis=[],contacts=[];
    if(c.district==='ram')for(let i=0;i<3;i++){chassis.push(rect('module-'+i,224+i*88,80,64,288));contacts.push(rect('contact-'+i,232+i*88,344,48,16));}
    else if(c.district==='gpu'){chassis.push(rect('gpu-board',208,128,352,192));for(let i=0;i<5;i++)contacts.push(rect('gpu-contact-'+i,240+i*48,320,32,8));}
    else if(c.district==='cpu'){chassis.push(rect('socket-body',248,112,256,224));for(let i=0;i<6;i++){contacts.push(rect('pin-w-'+i,232,128+i*32,16,8),rect('pin-e-'+i,504,128+i*32,16,8));}}
    else if(c.district==='bus'){for(let i=0;i<3;i++)chassis.push(rect('lane-'+i,208,144+i*48,336,24));}
    else chassis.push(rect('control-board',240,128,256,192));
    r.layers.push({id:'equipment-chassis',type:'rects',pass:'background',color:'#12372f',rects:chassis},{id:'equipment-contacts',type:'rects',pass:'background',color:'#76633c',rects:contacts});
    const items=[{kind:d.kind,x:240,y:128,width:256,height:160,label:d.name},{kind:c.district==='cpu'||c.district==='gpu'?'fan':'cache',x:480,y:64,width:96,height:96,label:''}];
    if(c.role==='secret')items.push({kind:'cache',x:64,y:224,width:128,height:64,label:'CACHE / ROTA OPCIONAL'});
    r.layers.push({id:'equipment',type:'computer-world',theme:'hardware',pass:'midground',items});
    return r;
  }
  // Critical silhouettes and connections are authored; only optional vault details vary.
  g.registerGenerator({id:'hardware-v3-vault',version:5,generate({config,random}){return room(config,random);}});
  const placements=[];
  for(const c of cells){
    if(c.role==='secret')placements.push({id:c.id,x:c.col*W,y:c.row*H,generator:'hardware-v3-vault',config:c});
    else {const template=room(c);g.registerRoom(template);placements.push({id:c.id,x:c.col*W,y:c.row*H,template:template.id});}
  }
  const links=[];
  for(const c of cells)for(const side of ['east','south'])if(c.ports[side]){
    const [dx,dy]=directions[side],other=byGrid.get((c.col+dx)+','+(c.row+dy));
    links.push({from:{room:c.id,socket:side},to:{room:other.id,socket:side==='east'?'west':'north'}});
  }
  const plan={id:'phase-01',name:'Hardware — A placa-mae gigante',theme:'hardware',seed:'byte-hardware-v3-2026',revision:5,layout:'multi-route',
    objective:'Explore os seis setores, restaure CPU, RAM, barramentos e GPU, elimine os virus e alcance o nucleo.',
    size:{width:7*W,height:5*H},rooms:placements,links,start:{room:'arrival',anchor:'entry'},exit:{room:'core-exit',anchor:'exit',width:80,height:64},
    objectives:{repairAllComponents:true,defeatAllViruses:true,requireExitQuestion:true}};
  const phase=copy(g.compile(plan));phase.map.checkpointMode='free';
  phase.palette=['#06191b','#143b35','#63f3bb','#286453','#d6ac64'];
  phase.map.regions=districts.map(d=>({...d,areas:cells.filter(c=>c.district===d.id).map(c=>({x:c.col*W,y:c.row*H,width:W,height:H}))}));
  phase.map.routes=[{id:'north-loop',label:'CPU / RAM / BARRAMENTOS'},{id:'lower-loop',label:'BARRAMENTOS / GPU'},{id:'vaults',label:'CACHES OPCIONAIS'}];
  phase.generation.architecture={version:3,mode:'manual-room-network-and-seeded-vaults',regions:districts.map(d=>d.name),rooms:cells.map(c=>({id:c.id,region:c.district,role:c.role})),optionalRooms:cells.filter(c=>c.role==='secret').map(c=>c.id),durationMinutes:null};
  const errors=g.validation.definition(phase);if(errors.length)throw new Error(errors.join('; '));
  api.maps.register(phase);
})();
