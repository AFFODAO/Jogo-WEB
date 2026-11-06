// Playable Hardware rooms. Border contracts remain independent of the interior.
(() => {
  const service=ByteRunner.proceduralMaps;
  const width=768,height=768,floor=720;
  const labels={initial:'ENTRADA / TREINO',exploration:'ANDARES / EXPLORE',parkour:'SALTE / AGUARDE',combat:'POCO / ROTA ALTA',repair:'DESCANSO / TUNEL',reward:'TORRE / ELEVADOR',secret:'ROTA ALTERNATIVA',final:'SAIDA / VERIFICACAO'};
  function room({config}) {
    const {type,ports,tier=1,rest=false,variant=0}=config;
    const layouts={initial:'open',final:'open',exploration:'multi-floor',parkour:'precision',combat:'deep-pit',repair:'narrow-tunnel',reward:'tower',secret:'irregular'};
    const layout=variant>0&&type==='exploration'?'suspended':layouts[type];
    const result={id:'playable-hardware-room',version:3,width,height,ground:[],entities:{platforms:[],obstacles:[],collectibles:[]},anchors:{entry:{x:96,y:floor-48},exit:{x:624,y:floor-48}},sockets:[],checkpoints:[{x:96,y:floor}],layers:[{id:'label',type:'computer-world',theme:'hardware',pass:'midground',items:[{kind:'cpu',label:labels[type],x:32,y:floor-240,width:160,height:96}]}],mechanics:[]};
    const rect=(id,x,y,w,h)=>({id,x,y,width:w,height:h});
    const fixed=(id,x,y,w=128)=>result.entities.platforms.push({...rect(id,x,y,w,16),type:'fixed',collision:'one-way'});
    const left=ports.west==='bridge'?144:0,right=ports.east==='bridge'?624:768;
    const gap=Boolean(ports.south)||(!rest&&type!=='initial'&&type!=='final'&&type!=='repair');
    const gapLeft=ports.south?288:272,gapRight=ports.south?480:496;
    const stepX=ports.north?416:(tier>=3?348:336);
    if(gap){
      result.ground.push(rect('floor-left',left,floor,gapLeft-left,48),rect('floor-right',gapRight,floor,right-gapRight,48));
      fixed('required-step',stepX,floor-64,tier>=3?72:96);
      if(!ports.south)result.ground.push(rect('catch-floor',gapLeft,height-16,gapRight-gapLeft,16));
    }else result.ground.push(rect('floor',left,floor,right-left,48));
    for(const side of ['west','east']){
      const x=side==='west'?0:width-16;
      result.entities.obstacles.push(rect('wall-'+side,x,0,16,ports[side]?floor-128:floor));
      if(ports[side])result.sockets.push({id:side,x:side==='west'?0:width,y:floor-48,direction:side});
    }
    if(ports.north){
      result.sockets.push({id:'north',x:384,y:0,direction:'north'});
      for(let i=0;i<7;i++)fixed('riser-'+i,i%2?400:256,floor-96-i*96,144);
    }else result.entities.obstacles.push(rect('ceiling',16,0,width-32,16));
    if(ports.south)result.sockets.push({id:'south',x:384,y:height,direction:'south'});
    for(const side of ['west','east'])if(ports[side]){
      const x=side==='west'?16:width-144,kind=ports[side];
      if(kind==='tunnel')result.entities.obstacles.push(rect('tunnel-'+side,x,floor-128,128,32));
      if(kind==='bridge')fixed('link-'+side,side==='west'?0:624,floor,144);
      if(kind==='door')result.entities.obstacles.push(rect('lintel-'+side,x,floor-144,128,32));
    }
    if(!['initial','final'].includes(type)){
      if(layout==='suspended')for(let i=0;i<4;i++)fixed('upper-'+i,i%2?448:224,floor-96*(i+1),160);
      else if(layout==='narrow-tunnel')fixed('upper-0',144,floor-80,96);
      else for(let i=0;i<(['tower','deep-pit'].includes(layout)?5:3);i++)fixed('upper-'+i,i===0?192:160+i*88,floor-96*(i+1),tier>=3?104:128);
      if(layout==='irregular')result.entities.obstacles.push(rect('silhouette',624,96,80,240));
      if(layout==='narrow-tunnel'){
        if(ports.south||ports.north)result.entities.obstacles.push(rect('roof-left',192,floor-128,80,32),rect('roof-right',496,floor-128,96,32));
        else result.entities.obstacles.push(rect('low-roof',192,floor-128,400,32));
      }
      if(type==='exploration')result.entities.platforms.push({...rect('shuttle',448,floor-240,112,16),type:'moving',collision:'one-way',motion:{axis:'x',range:48,speed:.65,phase:0}});
      if(layout==='tower')result.entities.platforms.push({...rect('elevator',576,floor-288,112,16),type:'moving',collision:'one-way',motion:{axis:'y',range:128,speed:.55,phase:0},style:'elevator'});
      if(type==='parkour')result.entities.platforms.push({...rect('temporary',448,floor-384,96,16),type:'temporary',duration:tier>=3?1.3:2.2,respawnDelay:2.5});
      if(type==='parkour'||type==='secret')result.entities.platforms.push({...rect('falling',208,floor-320,104,16),type:'falling',duration:.7,dropDistance:224,respawnDelay:2.5});
    }
    if(!rest&&tier>=2){
      const hazards=[{id:'laser',kind:'laser',x:568,y:floor-72,width:8,height:72,period:4.5,warning:.8,active:.8,phase:0,damage:10}];
      if(gap&&!ports.south)hazards.push({id:'electric',kind:'electric',x:288,y:floor+8,width:192,height:16,period:4.8,warning:.8,active:1,phase:1.8,damage:8});
      result.mechanics.push({id:'parkour',type:'parkour-hazards',hazards});
    }
    if(type==='reward'||type==='secret')result.entities.collectibles.push({id:'reward',x:560,y:floor-320,radius:10});
    result.layers[0].items.push({kind:'cable',label:rest?'REPOUSO / PISO SEGURO':'ROTA FIXA / SALTO',x:224,y:floor-176,width:256,height:32});
    if(ports.south)result.layers[0].items.push({kind:'port',label:'DESCE / SOBE',x:320,y:floor-144,width:128,height:48});
    result.quality={layout,tier,rest,route:gap?[{x:160,y:floor,width:112},...(ports.north?[{x:256,y:floor-96,width:144}]:[]),{x:stepX,y:floor-64,width:tier>=3?72:96},{x:496,y:floor,width:112}]:[{x:160,y:floor,width:448}],fixedClimb:ports.north?7:0};
    return result;
  }
  let installed=false;
  service.installRooms=()=>{if(!installed){ByteRunner.mapGeneration.registerGenerator({id:'playable-hardware-v2',version:3,generate:room});installed=true;}};
  service.roomGeometry=config=>room({config});
  service.metrics=Object.freeze({width,height,floor});
})();
