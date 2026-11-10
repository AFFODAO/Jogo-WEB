// Switch V3: physical radial backplane, open interior decks and four outer lobes.
(() => {
  'use strict';
  const api=ByteRunner,g=api.mapGeneration,W=640,H=512,F=464;
  const regions=[['backplane','BACKPLANE CENTRAL',0],['ethernet','PORTAS ETHERNET',0],['channels','CANAIS DE TRANSMISSAO',1],['matrix','CENTRAL DE COMUTACAO',1],['uplink','REGIAO DE UPLINK',2],['core','NUCLEO FINAL',3]].map(([id,name,state])=>({id,name,state}));
  // Diamond silhouette: the five-deck cross distributes traffic into branching loops.
  const cells=[
    ['core-exit',3,0,'core','exit'],
    ['matrix-north',2,1,'matrix','repair'],['core-guard',3,1,'core','repair'],['uplink-crown',4,1,'uplink','repair'],
    ['port03',1,2,'ethernet','combat'],['matrix-cross',2,2,'matrix','explore'],['hub-north',3,2,'backplane','lift'],['uplink-base',4,2,'uplink','parkour'],['port04',5,2,'ethernet','repair'],
    ['port01',0,3,'ethernet','repair'],['ethernet-west',1,3,'ethernet','combat'],['hub-west',2,3,'backplane','explore'],['backplane',3,3,'backplane','entry'],['hub-east',4,3,'backplane','lift'],['ethernet-east',5,3,'ethernet','combat'],['port02',6,3,'ethernet','combat'],
    ['service-west',1,4,'ethernet','secret'],['channel-west',2,4,'channels','timing'],['hub-south',3,4,'backplane','lift'],['channel-east',4,4,'channels','timing'],['service-east',5,4,'ethernet','secret'],
    ['channel-cache',2,5,'channels','secret'],['channel-center',3,5,'channels','timing'],['channel-relay',4,5,'channels','repair'],
    ['packet-vault',3,6,'channels','secret']
  ].map(([id,col,row,region,role])=>({id,col,row,region,role}));
  const grid=new Map(cells.map(c=>[c.col+','+c.row,c])),directions={west:[-1,0],east:[1,0],north:[0,-1],south:[0,1]};
  for(const c of cells)c.ports=Object.fromEntries(Object.entries(directions).map(([s,[dx,dy]])=>[s,grid.has((c.col+dx)+','+(c.row+dy))]));
  const repairs={port01:['connector','REPARAR RJ45 / PORTA 01'],port04:['connector','REPARAR RJ45 / PORTA 04'],'matrix-north':['table','RECONSTRUIR TABELA MAC'],'channel-relay':['bus','SINCRONIZAR CANAIS'],'uplink-crown':['uplink','RESTAURAR UPLINK'],'core-guard':['fabric','RESTAURAR CONECTIVIDADE']};
  const outer={all:Object.entries(repairs).slice(0,5).map(([room,[id]])=>({component:room+':'+id}))};
  const connectivity={all:[outer,{component:'core-guard:fabric'},{flag:'port01:port-a'},{flag:'port04:port-b'}]};
  function build(c,random){
    const region=regions.find(r=>r.id===c.region),r={id:'switch-'+c.id,version:5,width:W,height:H,ground:[],entities:Object.fromEntries(g.config.groups.map(k=>[k,[]])),anchors:{entry:{x:64,y:F-48},exit:{x:552,y:F-64}},sockets:[],checkpoints:[],layers:[],mechanics:[]};
    const rect=(id,x,y,width,height)=>({id,x,y,width,height});
    const fixed=(id,x,y,width=144,style='packet')=>r.entities.platforms.push({...rect(id,x,y,width,16),type:'fixed',collision:'one-way',style});
    if(c.ports.south){r.ground.push(rect('deck-left',0,F,208,48),rect('deck-right',496,F,144,48));fixed('distribution-cap',224,F-64,256,'cable');}
    else if(c.role==='timing'||c.role==='parkour'){
      r.ground.push(rect('deck-left',0,F,224,48),rect('deck-right',464,F,176,48),rect('recovery-tray',224,H-16,240,16));fixed('packet-island',288,F-64,96);
    }else r.ground.push(rect('deck',0,F,W,48));
    // No interior side walls. Outward chassis edges contain the radial footprint.
    for(const side of ['west','east']){
      if(c.ports[side])r.sockets.push({id:side,direction:side,x:side==='west'?0:W,y:F-48});
      else r.entities.obstacles.push(rect('chassis-'+side,side==='west'?0:W-16,0,16,F));
    }
    if(c.ports.north){
      r.sockets.push({id:'north',direction:'north',x:320,y:0});
      for(let i=0;i<5;i++)if(i!==0||!c.ports.south)fixed('radial-riser-'+i,i===4?256:i%2?352:224,400-i*96,i===4?192:c.region==='uplink'?96:128,c.region==='ethernet'?'cable':'packet');
    }
    r.entities.obstacles.push(...(c.ports.north?[rect('rim-left',16,0,192,16),rect('rim-right',496,0,128,16)]:[rect('rim',16,0,W-32,16)]));
    if(c.ports.south)r.sockets.push({id:'south',direction:'south',x:320,y:H});
    if(!c.ports.north){fixed('service-step',80,F-96,144,'cable');fixed('service-balcony',184,F-192,160,'cable');}
    if(c.role!=='exit'){
      fixed('west-balcony',48,F-192,144,'cable');fixed('west-access',64,F-96,128,'cable');
      if(c.ports.north)fixed('balcony-link',80,F-288,128);
    }
    const secret=c.role==='secret',offset=secret&&random?random.int(5,7)*16:96;
    r.entities.collectibles.push({id:'packet',x:112,y:F-30,radius:10,secret:false});
    if(c.role!=='exit')r.entities.collectibles.push({id:'routing-cache',x:offset+32,y:F-224,radius:10,secret});
    if(secret)r.entities.collectibles.push({id:'spare-transceiver',x:560,y:F-30,radius:10,secret:true});
    if(repairs[c.id]){
      const [id,label]=repairs[c.id],upper=['matrix-north','uplink-crown'].includes(c.id),y=upper?F-192:F;
      r.entities.components.push({id,x:upper?208:112,y:y-44,width:34,height:44,label,repair:api.repairChallenges.forPhase(2,Object.keys(repairs).indexOf(c.id))});
      fixed('bridge-access',448,F-96,144,'cable');
      r.entities.platforms.push({...rect('restored-link',424,F-192,176,16),type:'fixed',collision:'one-way',style:'cable',requires:{component:id}});
      r.mechanics.push({id:'service-return',type:'portals',links:[{id:'return',x:336,y:F-140,width:40,height:76,label:'RETORNO / BACKPLANE',requires:{component:id},to:{room:'backplane',anchor:'entry'}}]});
      if(!c.ports.south)fixed('return-pad',304,F-64,112,'cable');
    }
    if(['port01','port04'].includes(c.id))r.entities.interactives.push({id:'ethernet-enable',type:'switch',x:552,y:F-40,width:36,height:40,flag:c.id==='port01'?'port-a':'port-b',once:true,label:c.id==='port01'?'01':'04',message:'PORTA ATIVA / PACOTES LIBERADOS'});
    if(['entry','repair','lift','combat'].includes(c.role))r.checkpoints.push({x:48,y:F});
    const enemies=secret||['entry','lift','explore','exit'].includes(c.role)?0:c.role==='combat'?2:1;
    for(let i=0;i<enemies;i++){
      const left=i?80:504,right=i?176:592,type=c.region==='uplink'||c.region==='core'?'armored':i?'shooter':c.role==='timing'?'fast':c.id==='port03'?'parasite':'basic';
      r.entities.enemies.push({id:'rogue-packet-'+i,type,x:(left+right)/2,y:F-24,groundY:F,patrolMin:left,patrolMax:right,navigationBounds:{left,right},activationRegion:{x:16,y:48,width:608,height:416}});
    }
    if(c.role==='lift'||['matrix-cross','uplink-base','channel-center'].includes(c.id))r.entities.platforms.push({...rect('transmission-lift',80,272,128,16),type:'moving',collision:'one-way',style:'elevator',motion:{axis:c.region==='channels'?'x':'y',range:64,speed:.5,phase:0}});
    if(c.role==='timing'||c.region==='uplink')r.entities.platforms.push({...rect('volatile-packet',448,F-288,112,16),type:'temporary',collision:'one-way',style:'signal',duration:c.region==='uplink'?2.2:2.8,respawnDelay:2.4});
    if(c.role==='timing'||['port03','port02','uplink-base','core-guard'].includes(c.id))r.mechanics.push({id:'electrical-noise',type:'parkour-hazards',hazards:[{id:'current',kind:'electric',x:408,y:F-36,width:24,height:36,warning:1.25,active:.7,period:5.2,damage:8}]});
    if(['service-west','service-east'].includes(c.id)){
      const unlock={component:c.id==='service-west'?'port01:connector':'port04:connector'};
      r.entities.gates.push({...rect('concealed-shaft',208,0,288,16),opensWhen:unlock});
      const east=c.id==='service-west';
      r.entities.gates.push({...rect('service-shutter',east?624:0,F-128,16,128),opensWhen:unlock});
    }
    if(c.id==='core-guard')r.entities.gates.push(
      {...rect('fabric-west-lock',0,0,16,F),opensWhen:outer},
      {...rect('fabric-east-lock',624,0,16,F),opensWhen:outer},
      {...rect('fabric-south-lock',208,F,288,16),opensWhen:outer});
    if(c.id==='core-exit')r.entities.gates.push({...rect('connectivity-lock',480,16,16,F-16),opensWhen:connectivity});
    const panels=[],pins=[],traces=[];
    if(c.region==='ethernet'){
      panels.push(rect('rj45-mouth',80,80,480,176),rect('rj45-latch',256,256,128,32));
      for(let i=0;i<8;i++)pins.push(rect('rj45-pin-'+i,120+i*48,96,16,112));
      for(let i=0;i<4;i++)traces.push(rect('twisted-pair-'+i,96,320+i*16,448,8));
    }else if(c.region==='uplink'){
      panels.push(rect('sfp-cage',208,64,224,256));for(let i=0;i<4;i++)pins.push(rect('fiber-'+i,240+i*40,96,16,192));
    }else{
      panels.push(rect('fabric-chip',224,128,256,160));
      for(let i=0;i<5;i++)traces.push(rect('bus-h-'+i,32,96+i*48,576,8),rect('bus-v-'+i,160+i*64,64,8,304));
      for(let i=0;i<8;i++)pins.push(rect('fabric-pin-'+i,240+i*28,288,12,24));
    }
    r.layers.push({id:'circuit-traces',type:'rects',pass:'background',color:'#123344',rects:traces},{id:'switch-chassis',type:'rects',pass:'background',color:'#102534',rects:panels},{id:'copper-contacts',type:'rects',pass:'background',color:'#387787',rects:pins},
      {id:'sector-equipment',type:'computer-world',theme:'switch',pass:'midground',items:[{kind:c.region==='ethernet'?'ethernet':'backplane',x:224,y:128,width:256,height:160,label:region.name+' / '+c.id.toUpperCase()}]});
    return r;
  }
  g.registerGenerator({id:'switch-radial-vault',version:5,generate({config,random}){return build(config,random);}});
  const placements=cells.map(c=>{if(c.role==='secret')return {id:c.id,x:c.col*W,y:c.row*H,generator:'switch-radial-vault',config:c};const room=build(c);g.registerRoom(room);return {id:c.id,x:c.col*W,y:c.row*H,template:room.id};});
  const links=[];
  for(const c of cells)for(const side of ['east','south'])if(c.ports[side]){
    const [dx,dy]=directions[side],other=grid.get((c.col+dx)+','+(c.row+dy));links.push({from:{room:c.id,socket:side},to:{room:other.id,socket:side==='east'?'west':'north'}});
  }
  const plan={id:'phase-03',name:'Switch — A malha radial',theme:'switch',seed:'byte-switch-radial-v3-2026',revision:5,layout:'hub',objective:'Explore os ramais, restaure seis circuitos, ative as portas 01 e 04 e recupere a conectividade do nucleo.',size:{width:7*W,height:7*H},rooms:placements,links,start:{room:'backplane',anchor:'entry'},exit:{room:'core-exit',anchor:'exit',width:64,height:64},objectives:{repairAllComponents:true,defeatAllViruses:true,requireExitQuestion:true,goals:[{id:'active-ports',type:'condition',condition:{all:[{flag:'port01:port-a'},{flag:'port04:port-b'}]}}]}};
  const phase=api.maps.clone(g.compile(plan));phase.map.checkpointMode='free';phase.palette=['#061824','#12384a','#63e6ed','#327e88','#d6f5ff'];
  phase.map.regions=regions.map(region=>({...region,areas:cells.filter(c=>c.region===region.id).map(c=>({x:c.col*W,y:c.row*H,width:W,height:H}))}));
  phase.map.routes=[{id:'west-loop',label:'PORTAS 01 / 03 / COMUTACAO'},{id:'east-loop',label:'PORTAS 02 / 04 / UPLINK'},{id:'lower-loop',label:'CANAIS / RETORNO AO HUB'},{id:'core',label:'BACKPLANE / NUCLEO'}];
  phase.generation.architecture={version:3,mode:'radial-physical-backplane',center:{room:'backplane',x:2240,y:1792},regions:regions.map(r=>r.name),rooms:cells.map(c=>({id:c.id,region:c.region,role:c.role})),optionalRooms:cells.filter(c=>c.role==='secret').map(c=>c.id),targetMinutes:[15,25],durationMinutes:null,pacing:{orientation:[2,3],ethernet:[4,6],channels:[3,4],switchingAndUplink:[4,7],core:[2,5]}};
  const errors=g.validation.definition(phase);if(errors.length)throw new Error(errors.join('; '));api.maps.register(phase);
})();
