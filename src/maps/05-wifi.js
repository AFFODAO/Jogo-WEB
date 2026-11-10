// Wi-Fi V3: open-air twin masts, lateral signal routes and a high antenna crown.
(() => {
  'use strict';
  const api=ByteRunner,g=api.mapGeneration,W=640,H=512,F=464;
  const regions=[['base','BASE DA TORRE',0],['transmission','ESTRUTURAS DE TRANSMISSAO',0],['noise','ZONA DE INTERFERENCIA',1],['repeaters','TORRES REPETIDORAS',1],['signal','CAMPO DE SINAL',2],['antenna','ANTENA PRINCIPAL',3]].map(([id,name,state])=>({id,name,state}));
  const cells=[
    ['main-array',1,0,'antenna','repair'],['sky-exit',2,0,'antenna','exit'],
    ['upper-cache',0,1,'antenna','secret'],['array-west',1,1,'antenna','parkour'],['array-east',2,1,'antenna','combat'],
    ['signal-crown',1,2,'signal','parkour'],['signal-drift',2,2,'signal','lift'],
    ['signal-west',0,3,'signal','combat'],['signal-cross',1,3,'signal','parkour'],['signal-cache',2,3,'signal','secret'],
    ['repeater-west',0,4,'repeaters','repair'],['repeater-bridge',1,4,'repeaters','lift'],['repeater-east',2,4,'repeaters','repair'],
    ['repeater-base',0,5,'repeaters','combat'],['repeater-cross',1,5,'repeaters','explore'],
    ['noise-west',0,6,'noise','timing'],['noise-center',1,6,'noise','repair'],['noise-cache',2,6,'noise','secret'],
    ['noise-bypass',1,7,'noise','parkour'],['noise-east',2,7,'noise','timing'],
    ['transmit-west',0,8,'transmission','repair'],['transmit-spine',1,8,'transmission','lift'],['transmit-east',2,8,'transmission','combat'],
    ['base-west',0,9,'base','repair'],['base-center',1,9,'base','entry'],['base-east',2,9,'base','combat'],
    ['base-dock',1,10,'base','secret']
  ].map(([id,col,row,region,role])=>({id,col,row,region,role}));
  const grid=new Map(cells.map(c=>[c.col+','+c.row,c])),directions={west:[-1,0],east:[1,0],north:[0,-1],south:[0,1]};
  for(const c of cells)c.ports=Object.fromEntries(Object.entries(directions).map(([side,[dx,dy]])=>[side,grid.has((c.col+dx)+','+(c.row+dy))]));
  const repairs={'base-west':['association','CALIBRAR ASSOCIACAO WI-FI'],'transmit-west':['carrier','RESTAURAR PORTADORA'],'noise-center':['spectrum','LIMPAR ESPECTRO DE RADIO'],'repeater-west':['west','SINCRONIZAR REPETIDOR OESTE'],'repeater-east':['east','SINCRONIZAR REPETIDOR LESTE'],'main-array':['uplink','RESTAURAR ANTENA PRINCIPAL']};
  const complete={all:Object.entries(repairs).map(([room,[id]])=>({component:room+':'+id}))};
  function build(c,random){
    const r={id:'wifi-'+c.id,version:5,width:W,height:H,ground:[],entities:Object.fromEntries(g.config.groups.map(k=>[k,[]])),anchors:{entry:{x:64,y:F-48},exit:{x:544,y:F-64}},sockets:[],checkpoints:[],layers:[],mechanics:[]};
    const box=(id,x,y,width,height)=>({id,x,y,width,height});
    const fixed=(id,x,y,width=144,style='signal')=>r.entities.platforms.push({...box(id,x,y,width,16),type:'fixed',collision:'one-way',style});
    // Open sky, no room roofs or enclosing walls. Deck cut-outs keep each mast
    // traversable in both directions; wide side landings catch missed jumps.
    if(c.ports.south){r.ground.push(box('landing-west',0,F,208,48),box('landing-east',496,F,144,48));fixed('mast-crossbar',224,F-64,256,'cable');}
    else if(['parkour','timing'].includes(c.role)){
      r.ground.push(box('landing-west',0,F,224,48),box('landing-east',464,F,176,48),box('safety-net',224,H-16,240,16));fixed('suspended-island',280,F-64,c.region==='antenna'?96:128);
    }else r.ground.push(box('maintenance-deck',0,F,W,48));
    for(const side of ['west','east'])if(c.ports[side])r.sockets.push({id:side,direction:side,x:side==='west'?0:W,y:F-48});
    if(c.ports.north){
      r.sockets.push({id:'north',direction:'north',x:320,y:0});
      const tread=c.region==='base'?176:c.region==='antenna'?96:c.region==='signal'?112:128;
      for(let i=0;i<5;i++)if(i!==0||!c.ports.south)fixed('zigzag-'+i,i===4?256:i%2?352:224,400-i*96,i===4?192:tread);
    }
    if(c.ports.south)r.sockets.push({id:'south',direction:'south',x:320,y:H});
    if(!c.ports.north){fixed('access-step',80,F-96,144,'cable');fixed('service-balcony',184,F-192,160,'cable');}
    else if(['repair','combat','secret'].includes(c.role)){
      fixed('service-step',64,F-96,128,'cable');fixed('service-balcony',48,F-192,144,'cable');fixed('balcony-link',80,F-288,128,'cable');
    }
    if(c.role==='combat'&&!c.ports.north)fixed('sentry-deck',64,F-192,144);
    const temp=['noise','signal','antenna'].includes(c.region)&&c.role!=='exit'&&c.role!=='secret';
    if(temp){
      fixed('signal-access',448,F-96,144);fixed('signal-rest',448,F-192,144);
      r.entities.platforms.push({...box('volatile-signal',448,F-288,c.region==='antenna'?96:112,16),type:'temporary',collision:'one-way',style:'signal',duration:c.region==='antenna'?2.2:2.5,respawnDelay:2.4});
    }
    const secret=c.role==='secret',cacheX=secret&&random?random.int(5,7)*16:112;
    r.entities.collectibles.push({id:'signal-fragment',x:112,y:F-30,radius:10,secret:false});
    if(secret||!c.ports.north)r.entities.collectibles.push({id:'frequency-cache',x:secret&&c.ports.north?cacheX:224,y:F-224,radius:10,secret});
    if(secret)r.entities.collectibles.push({id:'radio-backup',x:560,y:F-30,radius:10,secret:true});
    if(repairs[c.id]){
      const [id,label]=repairs[c.id];
      r.entities.components.push({id,x:112,y:F-44,width:34,height:44,label,repair:api.repairChallenges.forPhase(4,Object.keys(repairs).indexOf(c.id))});
      fixed('powered-access',448,F-96,144,'cable');
      r.entities.platforms.push({...box('powered-bridge',424,F-192,176,16),type:'fixed',collision:'one-way',style:'signal',requires:{component:id}});
      // Safe permanent reception decks avoid returning into a moving/vanished signal.
      if(!c.ports.south)fixed('reception-pad',304,F-64,112,'cable');
      r.mechanics.push({id:'repeater-return',type:'portals',links:[{id:'return',x:336,y:F-140,width:40,height:76,label:'RETORNO / BASE DA TORRE',requires:{component:id},to:{room:'base-center',anchor:'entry'}}]});
    }
    if(['entry','repair','lift','combat'].includes(c.role)||c.id==='repeater-cross')r.checkpoints.push({x:64,y:F});
    const count=c.role==='combat'?2:['repair','parkour','timing'].includes(c.role)?1:0;
    for(let i=0;i<count;i++){
      const flying=c.id==='transmit-east'&&i===0||c.id==='signal-west'&&i===0;
      const left=i?80:504,right=i?176:592,groundY=i?F-192:F,type=flying?'flyer':c.region==='antenna'?'armored':i?'shooter':c.role==='timing'?'fast':'basic';
      r.entities.enemies.push({id:'radio-virus-'+i,type,x:(left+right)/2,y:flying?F-128:groundY-24,groundY,patrolMin:left,patrolMax:right,navigationBounds:{left,right},activationRegion:{x:16,y:48,width:608,height:416}});
    }
    if(c.role==='lift'||['transmit-west','repeater-west','repeater-east','signal-cross','array-west'].includes(c.id))r.entities.platforms.push({...box('antenna-lift',80,272,128,16),type:'moving',collision:'one-way',style:'elevator',motion:{axis:c.id==='signal-drift'||c.id==='repeater-bridge'||c.id==='signal-cross'?'x':'y',range:64,speed:.5,phase:0}});
    if(c.role==='timing'||['noise-center','signal-cross','array-west','array-east'].includes(c.id))r.mechanics.push({id:'signal-overload',type:'parkour-hazards',hazards:[{id:'pulse',kind:'electric',x:408,y:F-36,width:24,height:36,warning:1.3,active:.65,period:5.4,damage:8}]});
    if(c.region==='noise')r.mechanics.push({id:'radio-spectrum',type:'environment',zones:[{id:'interference',x:496,y:F-80,width:128,height:80,speedMultiplier:.84,fireIntervalMultiplier:1.45,projectileSpeedMultiplier:.8,label:'INTERFERENCIA / CANAL CONGESTIONADO',disabledWhen:{component:'noise-center:spectrum'}}]});
    if(c.id==='transmit-west')r.mechanics.push({id:'carrier-noise',type:'environment',zones:[{id:'weak-carrier',x:496,y:F-80,width:128,height:80,speedMultiplier:.88,fireIntervalMultiplier:1.35,projectileSpeedMultiplier:.85,label:'PORTADORA INSTAVEL',disabledWhen:{component:'carrier'}}]});
    if(c.id==='sky-exit'){
      fixed('crown-access',336,F-288,144);
      r.entities.obstacles.push(box('exit-roof',480,192,160,16),box('exit-wall',624,208,16,F-208));
      r.entities.gates.push({...box('uplink-lock',480,208,16,F-208),opensWhen:complete});
    }
    // Giant mast silhouettes and sparse signal LEDs live behind solid platforms.
    const steel=[box('mast-backbone',288,16,48,416)],braces=[],leds=[];
    for(let i=0;i<4;i++){
      steel.push(box('antenna-arm-'+i,c.region==='base'?80:144,80+i*80,c.region==='base'?480:352,16));
      braces.push(box('diagonal-a-'+i,240+i*16,64+i*64,16,48),box('diagonal-b-'+i,384-i*16,64+i*64,16,48));
      leds.push(box('signal-led-'+i,224+i*48,88+i*64,16,8));
    }
    const region=regions.find(r=>r.id===c.region);
    r.layers.push({id:'giant-mast',type:'rects',pass:'background',color:'#102e43',rects:steel},{id:'mast-braces',type:'rects',pass:'background',color:'#1e465a',rects:braces},{id:'quiet-signal',type:'rects',pass:'background',color:'#356478',rects:leds},
      {id:'antenna-silhouettes',type:'computer-world',theme:'wifi',pass:'midground',items:[{kind:'antenna',x:224,y:80,width:192,height:288,label:region.name+' / '+c.id.toUpperCase()},{kind:secret?'terminal':'signal',x:480,y:96,width:96,height:96,label:secret?'CANAL OCULTO':''}]});
    return r;
  }
  g.registerGenerator({id:'wifi-tower-cache',version:5,generate({config,random}){return build(config,random);}});
  const placements=cells.map(c=>{if(c.role==='secret')return {id:c.id,x:c.col*W,y:c.row*H,generator:'wifi-tower-cache',config:c};const room=build(c);g.registerRoom(room);return {id:c.id,x:c.col*W,y:c.row*H,template:room.id};});
  const links=[];
  for(const c of cells)for(const side of ['east','south'])if(c.ports[side]){const [dx,dy]=directions[side],other=grid.get((c.col+dx)+','+(c.row+dy));links.push({from:{room:c.id,socket:side},to:{room:other.id,socket:side==='east'?'west':'north'}});}
  const plan={id:'phase-05',name:'Wi-Fi - A torre de sinal',theme:'wifi',seed:'byte-wifi-tower-v3-2026',revision:5,layout:'vertical',objective:'Escale as torres, calibre seis pontos de radio, elimine a interferencia e restaure a antena principal.',size:{width:3*W,height:11*H},rooms:placements,links,start:{room:'base-center',anchor:'entry'},exit:{room:'sky-exit',anchor:'exit',width:64,height:64},objectives:{repairAllComponents:true,defeatAllViruses:true,requireExitQuestion:true}};
  const phase=api.maps.clone(g.compile(plan));phase.map.checkpointMode='free';phase.palette=['#061b2c','#143951','#81ecff','#386c91','#d2f9ff'];
  phase.map.regions=regions.map(region=>({...region,areas:cells.filter(c=>c.region===region.id).map(c=>({x:c.col*W,y:c.row*H,width:W,height:H}))}));
  phase.map.routes=[{id:'west-mast',label:'MASTRO OESTE / CALIBRACAO / REPETIDORES'},{id:'east-mast',label:'MASTRO LESTE / CANAIS / SINAL'},{id:'lateral-rings',label:'PASSARELAS / ROTAS LATERAIS / CACHES'},{id:'antenna',label:'COROA / ANTENA PRINCIPAL'}];
  phase.generation.architecture={version:3,mode:'open-air-twin-mast-ascent',regions:regions.map(r=>r.name),rooms:cells.map(c=>({id:c.id,region:c.region,role:c.role})),optionalRooms:cells.filter(c=>c.role==='secret').map(c=>c.id),targetMinutes:[15,25],durationMinutes:null,pacing:{base:[2,3],transmission:[3,5],interference:[3,5],repeaters:[3,5],signal:[2,4],antenna:[2,3]}};
  const errors=g.validation.definition(phase);if(errors.length)throw new Error(errors.join('; '));api.maps.register(phase);
})();
