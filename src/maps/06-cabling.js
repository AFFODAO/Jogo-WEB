// Cabling V3: industrial floor plates, three service shafts and copper galleries.
(() => {
  'use strict';
  const api=ByteRunner,g=api.mapGeneration,W=640,H=512,F=464;
  const regions=[['basement','SUBSOLO',0],['central','CENTRAL DE CABEAMENTO',0],['maintenance','ANDARES DE MANUTENCAO',1],['shafts','POCOS DE ELEVADORES',1],['upper','INFRAESTRUTURA SUPERIOR',2],['roof','COBERTURA',3]].map(([id,name,state])=>({id,name,state}));
  const cells=[
    ['roof-antenna',2,0,'roof','parkour'],['roof-exit',3,0,'roof','exit'],
    ['roof-west',1,1,'roof','parkour'],['roof-bridge',2,1,'roof','parkour'],['roof-controls',3,1,'roof','repair'],['roof-east',4,1,'roof','combat'],
    ['upper-cache',0,2,'upper','secret'],['upper-west',1,2,'upper','parkour'],['skybridge',2,2,'upper','parkour'],['upper-hub',3,2,'upper','repair'],['upper-east',4,2,'upper','parkour'],['upper-storage',5,2,'upper','secret'],
    ['steel-west',0,3,'upper','parkour'],['shaft-west-high',1,3,'shafts','lift'],['shaft-east-high',3,3,'shafts','lift'],['upper-workshop',4,3,'upper','combat'],['shaft-annex',5,3,'shafts','lift'],
    ['maintenance-low',0,4,'maintenance','combat'],['shaft-west-mid',1,4,'shafts','repair'],['shaft-center',2,4,'shafts','lift'],['shaft-east-mid',3,4,'shafts','lift'],['maintenance-annex',4,4,'maintenance','explore'],['maintenance-vault',5,4,'maintenance','secret'],
    ['maintenance-west',0,5,'maintenance','repair'],['maintenance-corridor',1,5,'maintenance','combat'],['maintenance-cross',2,5,'maintenance','explore'],['maintenance-bridge',3,5,'maintenance','parkour'],['maintenance-east',4,5,'maintenance','combat'],['maintenance-return',5,5,'maintenance','explore'],
    ['central-west',0,6,'central','explore'],['central-main',1,6,'central','repair'],['central-hub',2,6,'central','explore'],['central-patch',3,6,'central','combat'],['central-east',4,6,'central','repair'],['central-store',5,6,'central','explore'],
    ['basement-cache',0,7,'basement','secret'],['basement-power',1,7,'basement','repair'],['arrival',2,7,'basement','entry'],['cable-tunnel',3,7,'basement','parkour'],['basement-underpass',4,7,'basement','combat'],['basement-east',5,7,'basement','explore']
  ].map(([id,col,row,region,role])=>({id,col,row,region,role}));
  const grid=new Map(cells.map(c=>[c.col+','+c.row,c])),directions={west:[-1,0],east:[1,0],north:[0,-1],south:[0,1]};
  for(const c of cells)c.ports=Object.fromEntries(Object.entries(directions).map(([side,[dx,dy]])=>[side,grid.has((c.col+dx)+','+(c.row+dy))]));
  const repairs={'basement-power':['power','RESTAURAR ALIMENTACAO DO SUBSOLO'],'central-main':['patch','RECONECTAR PAINEL PRINCIPAL'],'central-east':['trunk','REPARAR TRONCO DE COBRE'],'maintenance-west':['service','RESTAURAR QUADRO DE MANUTENCAO'],'shaft-west-mid':['motor','REPARAR CONTROLE DOS ELEVADORES'],'upper-hub':['distribution','RESTAURAR DISTRIBUICAO SUPERIOR'],'roof-controls':['antenna','RECONECTAR COBERTURA']};
  const outer={all:Object.entries(repairs).slice(0,6).map(([room,[id]])=>({component:room+':'+id}))},complete={all:Object.entries(repairs).map(([room,[id]])=>({component:room+':'+id}))};
  function build(c,random){
    const r={id:'cabling-'+c.id,version:5,width:W,height:H,ground:[],entities:Object.fromEntries(g.config.groups.map(k=>[k,[]])),anchors:{entry:{x:64,y:F-48},exit:{x:544,y:F-64}},sockets:[],checkpoints:[],layers:[],mechanics:[]};
    const box=(id,x,y,width,height)=>({id,x,y,width,height});
    const fixed=(id,x,y,width=144)=>r.entities.platforms.push({...box(id,x,y,width,16),type:'fixed',collision:'one-way',style:'cable'});
    if(c.ports.south){r.ground.push(box('floor-west',0,F,208,48),box('floor-east',496,F,144,48));fixed('shaft-cap',224,F-64,256);}
    else if(c.role==='parkour'){
      r.ground.push(box('floor-west',0,F,224,48),box('floor-east',464,F,176,48),box('lower-catch',224,H-16,240,16));fixed('suspended-tray',280,F-64,c.region==='roof'?96:128);
    }else r.ground.push(box('industrial-floor',0,F,W,48));
    for(const side of ['west','east']){
      const [dx,dy]=directions[side],neighbor=grid.get((c.col+dx)+','+(c.row+dy)),open=c.ports[side];
      const openHall=open&&neighbor.region===c.region&&['central','maintenance','shafts'].includes(c.region);
      if(!openHall)r.entities.obstacles.push(box('wall-'+side,side==='west'?0:W-16,0,16,open?F-128:F));
      if(open)r.sockets.push({id:side,direction:side,x:side==='west'?0:W,y:F-48});
    }
    if(c.ports.north){
      r.entities.obstacles.push(box('roof-west',16,0,192,16),box('roof-east',496,0,128,16));r.sockets.push({id:'north',direction:'north',x:320,y:0});
      for(let i=0;i<5;i++)if(i!==0||!c.ports.south)fixed('technical-stair-'+i,i===4?256:i%2?352:224,400-i*96,i===4?192:c.region==='roof'?96:128);
    }else r.entities.obstacles.push(box('roof',16,0,W-32,16));
    if(c.ports.south)r.sockets.push({id:'south',direction:'south',x:320,y:H});
    if(!c.ports.north){fixed('alcove-step',80,F-96);fixed('work-balcony',184,F-192,160);}
    else if(['repair','combat','secret','lift'].includes(c.role)){fixed('service-step',64,F-96,128);fixed('work-balcony',48,F-192);fixed('balcony-link',80,F-288,128);}
    if(c.role==='combat'&&!c.ports.north)fixed('sentry-deck',64,F-192);
    const secret=c.role==='secret',cacheX=secret&&random?random.int(5,7)*16:112;
    r.entities.collectibles.push({id:'copper-data',x:112,y:F-30,radius:10,secret:false});
    if(secret||!c.ports.north)r.entities.collectibles.push({id:'maintenance-cache',x:secret&&c.ports.north?cacheX:224,y:F-224,radius:10,secret});
    if(secret)r.entities.collectibles.push({id:'spare-cable',x:560,y:F-30,radius:10,secret:true});
    if(repairs[c.id]){
      const [id,label]=repairs[c.id];
      r.entities.components.push({id,x:112,y:F-44,width:34,height:44,label,repair:api.repairChallenges.forPhase(5,Object.keys(repairs).indexOf(c.id))});
      fixed('bridge-step',448,F-96);
      r.entities.platforms.push({...box('restored-tray',424,F-192,176,16),type:'fixed',collision:'one-way',style:'cable',requires:{component:id}},
        {...box('service-lift',80,272,128,16),type:'moving',collision:'one-way',style:'elevator',motion:{axis:'y',range:112,speed:.45,phase:0},requires:{component:id}});
      if(!c.ports.south)fixed('return-pad',304,F-64,112);
      r.mechanics.push({id:'maintenance-return',type:'portals',links:[{id:'return',x:336,y:F-140,width:40,height:76,label:'RETORNO / '+(c.region==='roof'?'CENTRAL':'SUBSOLO'),requires:{component:id},to:{room:c.region==='roof'?'central-hub':'arrival',anchor:'entry'}}]});
    }
    if(c.role==='lift')r.entities.platforms.push({...box('industrial-lift',80,272,128,16),type:'moving',collision:'one-way',style:'elevator',motion:{axis:'y',range:112,speed:.5,phase:0}});
    if(['central-patch','maintenance-bridge','skybridge'].includes(c.id))r.entities.platforms.push({...box('gantry',80,272,128,16),type:'moving',collision:'one-way',style:'elevator',motion:{axis:'x',range:64,speed:.5,phase:0}});
    if(['maintenance-bridge','steel-west','skybridge','upper-east','roof-west','roof-antenna'].includes(c.id)){
      fixed('scaffold-rest',432,F-192,144);
      r.entities.platforms.push({...box('temporary-scaffold',448,F-288,112,16),type:'temporary',collision:'one-way',style:'signal',duration:2.8,respawnDelay:2.4});
    }
    const count=c.role==='combat'?2:['repair','parkour'].includes(c.role)?1:0;
    for(let i=0;i<count;i++){
      const left=i?80:504,right=i?176:592,groundY=i?F-192:F,type=i?'shooter':c.region==='upper'||c.region==='roof'?'armored':c.id==='basement-underpass'||c.id==='maintenance-corridor'?'fast':'basic';
      r.entities.enemies.push({id:'industrial-virus-'+i,type,x:(left+right)/2,y:groundY-24,groundY,patrolMin:left,patrolMax:right,navigationBounds:{left,right},activationRegion:{x:16,y:48,width:608,height:416}});
    }
    if(['entry','repair','lift','combat'].includes(c.role)||['central-hub','maintenance-cross'].includes(c.id))r.checkpoints.push({x:64,y:F});
    if(c.region==='shafts'||['cable-tunnel','central-patch','maintenance-bridge','steel-west','upper-east','roof-antenna','roof-east'].includes(c.id))r.mechanics.push({id:'electrical-risk',type:'parkour-hazards',hazards:[{id:'current',kind:'electric',x:408,y:F-36,width:24,height:36,warning:1.3,active:.65,period:5.4,damage:8}]});
    if(c.region==='roof'&&c.row===1&&c.ports.south)r.entities.gates.push({...box('roof-access-lock',208,F,288,16),opensWhen:outer});
    if(c.id==='roof-exit')r.entities.gates.push({...box('completion-lock',464,16,16,F-16),opensWhen:complete});
    const steel=[],copper=[],lamps=[];
    if(c.region==='shafts'){
      steel.push(box('lift-rail-left',56,48,16,352),box('lift-rail-right',216,48,16,352));
      for(let i=0;i<5;i++)copper.push(box('lift-cable-'+i,112+i*16,32,4,368));
    }else{
      steel.push(box('technical-panel',224,112,288,192));
      for(let i=0;i<4;i++)copper.push(box('cable-tray-'+i,48,96+i*48,544,8));
    }
    for(let i=0;i<4;i++){steel.push(box('steel-rib-'+i,64+i*160,48,16,320));lamps.push(box('yellow-lamp-'+i,80+i*144,56,16,8));}
    const region=regions.find(r=>r.id===c.region);
    r.layers.push({id:'industrial-metal',type:'rects',pass:'background',color:'#263038',rects:steel},{id:'organized-copper',type:'rects',pass:'background',color:'#58412d',rects:copper},{id:'discrete-lighting',type:'rects',pass:'background',color:'#8d7448',rects:lamps},
      {id:'factory-structures',type:'computer-world',theme:'cabling',pass:'midground',items:[{kind:c.region==='shafts'?'lift-shaft':c.region==='roof'?'building':'duct',x:32,y:64,width:576,height:256,label:region.name+' / '+c.id.toUpperCase()},{kind:c.region==='roof'?'antenna':c.region==='central'?'terminal':'cable',x:272,y:128,width:144,height:144,label:secret?'ACESSO DE MANUTENCAO':''}]});
    return r;
  }
  g.registerGenerator({id:'cabling-factory-cache',version:5,generate({config,random}){return build(config,random);}});
  const placements=cells.map(c=>{if(c.role==='secret')return {id:c.id,x:c.col*W,y:c.row*H,generator:'cabling-factory-cache',config:c};const room=build(c);g.registerRoom(room);return {id:c.id,x:c.col*W,y:c.row*H,template:room.id};});
  const links=[];
  for(const c of cells)for(const side of ['east','south'])if(c.ports[side]){const [dx,dy]=directions[side],other=grid.get((c.col+dx)+','+(c.row+dy));links.push({from:{room:c.id,socket:side},to:{room:other.id,socket:side==='east'?'west':'north'}});}
  const plan={id:'phase-06',name:'Cabeamento - O complexo industrial',theme:'cabling',seed:'byte-cabling-industrial-v3-2026',revision:5,layout:'multi-route',objective:'Explore os andares, restaure sete quadros e elevadores, elimine as ameacas e alcance a cobertura industrial.',size:{width:6*W,height:8*H},rooms:placements,links,start:{room:'arrival',anchor:'entry'},exit:{room:'roof-exit',anchor:'exit',width:64,height:64},objectives:{repairAllComponents:true,defeatAllViruses:true,requireExitQuestion:true}};
  const phase=api.maps.clone(g.compile(plan));phase.map.checkpointMode='free';phase.palette=['#131b22','#303a43','#efc582','#716c5d','#bb885b'];
  phase.map.regions=regions.map(region=>({...region,areas:cells.filter(c=>c.region===region.id).map(c=>({x:c.col*W,y:c.row*H,width:W,height:H}))}));
  phase.map.routes=[{id:'basement-loop',label:'SUBSOLO / PAINEIS / CENTRAL'},{id:'maintenance-loop',label:'ANDARES / ROTAS LATERAIS'},{id:'shaft-loop',label:'POCOS OESTE / CENTRAL / LESTE'},{id:'upper-loop',label:'DUTOS / PASSARELAS / COBERTURA'}];
  phase.generation.architecture={version:3,mode:'industrial-floorplates-and-service-shafts',regions:regions.map(r=>r.name),rooms:cells.map(c=>({id:c.id,region:c.region,role:c.role})),optionalRooms:cells.filter(c=>c.role==='secret').map(c=>c.id),targetMinutes:[15,25],durationMinutes:null,pacing:{basement:[2,3],central:[3,5],maintenance:[3,5],shafts:[3,5],upper:[2,4],roof:[2,3]}};
  const errors=g.validation.definition(phase);if(errors.length)throw new Error(errors.join('; '));api.maps.register(phase);
})();
