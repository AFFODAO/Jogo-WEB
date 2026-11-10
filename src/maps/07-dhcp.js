// DHCP V3: digital city plazas, server districts and interlinked data bridges.
(() => {
  'use strict';
  const api=ByteRunner,g=api.mapGeneration,W=640,H=512,F=464;
  const regions=[['central','CENTRAL DHCP',0],['address','DISTRITO DE ENDERECAMENTO',0],['conflicts','DISTRITO DE CONFLITOS',1],['reserves','SETOR DE RESERVAS',1],['distribution','REDE DE DISTRIBUICAO',2],['gateway','GATEWAY FINAL',3]].map(([id,name,state])=>({id,name,state}));
  const cells=[
    ['gateway-upper',4,0,'gateway','parkour'],['gateway-exit',5,0,'gateway','exit'],
    ['address-cache',0,1,'address','secret'],['address-upper',1,1,'address','combat'],['reserve-upper',3,1,'reserves','parkour'],['gateway-plaza',4,1,'gateway','repair'],['gateway-guard',5,1,'gateway','combat'],
    ['address-west',0,2,'address','explore'],['address-office',1,2,'address','repair'],['central-north',2,2,'central','lift'],['reserve-main',3,2,'reserves','repair'],['reserve-cache',4,2,'reserves','secret'],
    ['address-east',1,3,'address','parkour'],['central-core',2,3,'central','repair'],['central-east',3,3,'central','combat'],['distribution-east',4,3,'distribution','parkour'],
    ['conflict-cache',0,4,'conflicts','secret'],['conflict-west',1,4,'conflicts','combat'],['conflict-core',2,4,'conflicts','repair'],['conflict-east',3,4,'conflicts','combat'],['distribution-cross',4,4,'distribution','lift'],['distribution-cache',5,4,'distribution','secret'],
    ['conflict-under',1,5,'conflicts','parkour'],['distribution-west',2,5,'distribution','parkour'],['distribution-south',3,5,'distribution','repair']
  ].map(([id,col,row,region,role])=>({id,col,row,region,role}));
  const grid=new Map(cells.map(c=>[c.col+','+c.row,c])),directions={west:[-1,0],east:[1,0],north:[0,-1],south:[0,1]};
  for(const c of cells)c.ports=Object.fromEntries(Object.entries(directions).map(([side,[dx,dy]])=>[side,grid.has((c.col+dx)+','+(c.row+dy))]));
  const repairs={'central-core':['server','RESTAURAR SERVIDOR DHCP'],'address-office':['scope','RECONSTRUIR ESCOPO DE ENDERECOS'],'conflict-core':['conflict','RESOLVER ENDERECOS DUPLICADOS'],'reserve-main':['reservation','RESTAURAR TABELA DE RESERVAS'],'distribution-south':['relay','REPARAR DISTRIBUICAO DE CONCESSOES'],'gateway-plaza':['gateway','RESTAURAR GATEWAY DA CIDADE']};
  const serviceFlags={all:[{flag:'central-core:dhcp-on'},{flag:'reserve-main:reservation'}]};
  const ready={all:[...Object.entries(repairs).slice(0,5).map(([room,[id]])=>({component:room+':'+id})),serviceFlags]};
  const complete={all:[...Object.entries(repairs).map(([room,[id]])=>({component:room+':'+id})),serviceFlags]};
  function build(c,random){
    const r={id:'dhcp-'+c.id,version:5,width:W,height:H,ground:[],entities:Object.fromEntries(g.config.groups.map(k=>[k,[]])),anchors:{entry:{x:64,y:F-48},reception:{x:16,y:F-48},exit:{x:544,y:F-64}},sockets:[],checkpoints:[],layers:[],mechanics:[]};
    const box=(id,x,y,width,height)=>({id,x,y,width,height});
    const fixed=(id,x,y,width=144)=>r.entities.platforms.push({...box(id,x,y,width,16),type:'fixed',collision:'one-way',style:'packet'});
    if(c.ports.south){r.ground.push(box('plaza-west',0,F,208,48),box('plaza-east',496,F,144,48));fixed('data-overpass',224,F-64,256);}
    else if(c.role==='parkour'){
      r.ground.push(box('bridge-west',0,F,224,48),box('bridge-east',464,F,176,48),box('lower-walkway',224,H-16,240,16));fixed('packet-island',280,F-64,c.region==='gateway'?96:128);
    }else r.ground.push(box('city-plaza',0,F,W,48));
    for(const side of ['west','east']){
      if(c.ports[side])r.sockets.push({id:side,direction:side,x:side==='west'?0:W,y:F-48});
      if(c.region==='gateway')r.entities.obstacles.push(box('gateway-wall-'+side,side==='west'?0:W-16,0,16,c.ports[side]?F-128:F));
    }
    if(c.ports.north){
      r.sockets.push({id:'north',direction:'north',x:320,y:0});
      for(let i=0;i<5;i++)if(i!==0||!c.ports.south)fixed('tower-step-'+i,i===4?256:i%2?352:224,400-i*96,i===4?192:c.region==='gateway'?96:128);
    }
    if(c.region==='gateway')r.entities.obstacles.push(...(c.ports.north?[box('roof-west',16,0,192,16),box('roof-east',496,0,128,16)]:[box('roof',16,0,W-32,16)]));
    if(c.ports.south)r.sockets.push({id:'south',direction:'south',x:320,y:H});
    if(!c.ports.north){fixed('terrace-step',80,F-96);fixed('technical-terrace',184,F-192,160);}
    else if(['repair','combat','secret','lift'].includes(c.role)){fixed('service-step',64,F-96,128);fixed('technical-terrace',48,F-192);fixed('terrace-link',80,F-288,128);}
    if(c.role==='combat'&&!c.ports.north)fixed('sentry-deck',64,F-192);
    const secret=c.role==='secret',cacheX=secret&&random?random.int(5,7)*16:112;
    r.entities.collectibles.push({id:'address-token',x:112,y:F-30,radius:10,secret:false});
    if(secret||!c.ports.north)r.entities.collectibles.push({id:'lease-cache',x:secret&&c.ports.north?cacheX:224,y:F-224,radius:10,secret});
    if(secret)r.entities.collectibles.push({id:'reserved-backup',x:560,y:F-30,radius:10,secret:true});
    if(repairs[c.id]){
      const [id,label]=repairs[c.id];r.entities.components.push({id,x:112,y:F-44,width:34,height:44,label,repair:api.repairChallenges.forPhase(6,Object.keys(repairs).indexOf(c.id))});
      fixed('restored-access',448,F-96);
      r.entities.platforms.push({...box('restored-data-bridge',424,F-192,176,16),type:'fixed',collision:'one-way',style:'packet',requires:{component:id}});
      if(!c.ports.south)fixed('service-pad',304,F-64,112);
      r.mechanics.push({id:'district-return',type:'portals',links:[{id:'return',x:336,y:F-140,width:40,height:76,label:'CENTRAL DHCP / RETORNO',requires:{component:id},to:{room:'central-core',anchor:'reception'}}]});
    }
    if(['central-core','reserve-main'].includes(c.id)){
      const server=c.id==='central-core';r.entities.interactives.push({id:'service-terminal',type:'switch',x:552,y:F-40,width:36,height:40,flag:server?'dhcp-on':'reservation',requires:{component:server?'server':'reservation'},once:true,label:server?'DHCP ON':'RESERVAS',message:server?'DHCP ATIVO / CONCESSOES DISPONIVEIS':'RESERVAS ATIVAS / ENDERECOS PROTEGIDOS'});
    }
    if(c.role==='lift'||['reserve-main','reserve-upper','distribution-east','distribution-west'].includes(c.id))r.entities.platforms.push({...box('lease-platform',80,272,128,16),type:'moving',collision:'one-way',style:'elevator',motion:{axis:c.region==='reserves'||c.id==='distribution-east'?'x':'y',range:64,speed:.5,phase:0},...(c.id==='reserve-main'?{requires:{component:'reservation'}}:{})});
    if(['distribution-east','distribution-west','gateway-upper','conflict-under'].includes(c.id)){
      fixed('packet-rest',432,F-192);
      r.entities.platforms.push({...box('temporary-route',448,F-288,112,16),type:'temporary',collision:'one-way',style:'signal',duration:2.6,respawnDelay:2.4});
    }
    const count=c.role==='combat'?2:['repair','parkour'].includes(c.role)?1:0;
    for(let i=0;i<count;i++){
      const left=i?80:504,right=i?176:592,groundY=i?F-192:F,type=i?'shooter':c.region==='gateway'||c.id==='conflict-east'?'armored':c.id==='conflict-west'?'fast':'basic';
      r.entities.enemies.push({id:'address-virus-'+i,type,x:(left+right)/2,y:groundY-24,groundY,patrolMin:left,patrolMax:right,navigationBounds:{left,right},activationRegion:{x:16,y:48,width:608,height:416}});
    }
    if(['repair','lift','combat'].includes(c.role)||['address-west','distribution-west'].includes(c.id))r.checkpoints.push({x:64,y:F});
    if(['conflict-east','conflict-under','distribution-east','distribution-west','gateway-upper','gateway-guard'].includes(c.id))r.mechanics.push({id:'corrupted-data-pulse',type:'parkour-hazards',hazards:[{id:'pulse',kind:c.region==='conflicts'?'laser':'electric',x:408,y:F-36,width:24,height:36,warning:1.3,active:.65,period:5.4,damage:8}]});
    if(c.region==='conflicts')r.mechanics.push({id:'duplicate-addresses',type:'environment',zones:[{id:'ip-conflict',x:496,y:F-80,width:128,height:80,speedMultiplier:.85,label:'CONFLITO / IP DUPLICADO',disabledWhen:{component:'conflict-core:conflict'}}]});
    if(c.id==='conflict-east')r.entities.gates.push({...box('conflict-shortcut-lock',208,0,288,16),opensWhen:{component:'conflict-core:conflict'}});
    if(c.id==='gateway-plaza')r.entities.gates.push({...box('gateway-west-lock',0,F-128,16,128),opensWhen:ready},{...box('gateway-south-lock',208,F,288,16),opensWhen:ready});
    if(c.id==='gateway-exit')r.entities.gates.push({...box('city-exit-lock',464,16,16,F-16),opensWhen:complete});
    const towers=[],windows=[],bridges=[],lights=[];
    for(let i=0;i<3;i++){
      towers.push(box('server-tower-'+i,64+i*176,48,112,288));
      for(let row=0;row<5;row++)windows.push(box('window-'+i+'-'+row,80+i*176,80+row*40,80,8));
      lights.push(box('district-led-'+i,96+i*176,64,16,8));
    }
    bridges.push(box('city-skybridge',32,344,576,16));
    const region=regions.find(r=>r.id===c.region),subnet=({central:'10.0.0.0/24',address:'10.0.10.0/24',conflicts:'IP DUPLICADO',reserves:'10.0.30.0/24',distribution:'10.0.20.0/24',gateway:'GATEWAY / ROTAS'})[c.region];
    r.layers.push({id:'digital-city-towers',type:'rects',pass:'background',color:c.region==='conflicts'?'#183339':'#103b3a',rects:towers},{id:'city-windows',type:'rects',pass:'background',color:'#1f5659',rects:windows},{id:'data-bridges',type:'rects',pass:'background',color:'#254d58',rects:bridges},{id:'city-lights',type:'rects',pass:'background',color:c.region==='conflicts'?'#795d83':'#3b826b',rects:lights},
      {id:'district-landmarks',type:'computer-world',theme:'dhcp',pass:'midground',items:[{kind:c.region==='central'?'rack':c.region==='gateway'?'gateway':c.region==='conflicts'?'conflict':'address-sector',x:240,y:112,width:192,height:192,label:region.name+' / '+c.id.toUpperCase()},{kind:'terminal',x:480,y:96,width:96,height:96,label:subnet}]});
    return r;
  }
  g.registerGenerator({id:'dhcp-city-cache',version:5,generate({config,random}){return build(config,random);}});
  const placements=cells.map(c=>{if(c.role==='secret')return {id:c.id,x:c.col*W,y:c.row*H,generator:'dhcp-city-cache',config:c};const room=build(c);g.registerRoom(room);return {id:c.id,x:c.col*W,y:c.row*H,template:room.id};});
  const links=[];
  for(const c of cells)for(const side of ['east','south'])if(c.ports[side]){const [dx,dy]=directions[side],other=grid.get((c.col+dx)+','+(c.row+dy));links.push({from:{room:c.id,socket:side},to:{room:other.id,socket:side==='east'?'west':'north'}});}
  const plan={id:'phase-07',name:'DHCP - A cidade dos enderecos',theme:'dhcp',seed:'byte-dhcp-city-v3-2026',revision:5,layout:'hub',objective:'Explore os distritos, restaure seis servicos, ative DHCP e reservas, elimine os conflitos e alcance o gateway da cidade.',size:{width:6*W,height:6*H},rooms:placements,links,start:{room:'central-core',anchor:'entry'},exit:{room:'gateway-exit',anchor:'exit',width:64,height:64},objectives:{repairAllComponents:true,defeatAllViruses:true,requireExitQuestion:true,goals:[{id:'ip-services',type:'condition',condition:serviceFlags}]}};
  const phase=api.maps.clone(g.compile(plan));phase.map.checkpointMode='free';phase.palette=['#082226','#16483e','#8df0b7','#3f866a','#bceac7'];
  phase.map.regions=regions.map(region=>({...region,areas:cells.filter(c=>c.region===region.id).map(c=>({x:c.col*W,y:c.row*H,width:W,height:H}))}));
  phase.map.routes=[{id:'address-loop',label:'CENTRAL / ESCOPO / ENDERECAMENTO'},{id:'conflict-loop',label:'DUPLICADOS / REPAROS / RETORNO'},{id:'reservation-loop',label:'RESERVAS / TERMINAIS / GATEWAY'},{id:'distribution-loop',label:'PONTES / CONCESSOES / ROTAS LATERAIS'}];
  phase.generation.architecture={version:3,mode:'digital-city-districts-and-data-bridges',regions:regions.map(r=>r.name),rooms:cells.map(c=>({id:c.id,region:c.region,role:c.role})),optionalRooms:cells.filter(c=>c.role==='secret').map(c=>c.id),targetMinutes:[15,25],durationMinutes:null,pacing:{central:[2,3],address:[3,5],conflicts:[3,5],reserves:[2,4],distribution:[3,5],gateway:[2,3]}};
  const errors=g.validation.definition(phase);if(errors.length)throw new Error(errors.join('; '));api.maps.register(phase);
})();
