(() => {
  const api=ByteRunner,service=api.proceduralMaps,ns=api.mapGeneration;
  const freeze=value=>{if(value&&typeof value==='object'){Object.values(value).forEach(freeze);Object.freeze(value);}return value;};
  function generate(options={}){
    const graph=service.graph(options);service.installRooms();
    const {width,height,floor}=service.metrics,byId=new Map(graph.nodes.map(n=>[n.id,n])),ports=new Map(graph.nodes.map(n=>[n.id,{}])),links=[];
    for(const edge of graph.edges){
      const a=byId.get(edge.from),b=byId.get(edge.to),side=a.x<b.x?'east':a.x>b.x?'west':a.y<b.y?'south':'north',opposite={east:'west',west:'east',south:'north',north:'south'}[side];
      ports.get(a.id)[side]=edge.kind;ports.get(b.id)[opposite]=edge.kind;
      links.push({from:{room:a.id,socket:side},to:{room:b.id,socket:opposite}});
    }
    const configs=new Map();
    for(const n of graph.nodes){
      const index=graph.mainPath.indexOf(n.id),rest=['initial','final','repair'].includes(n.type)||(index>0&&index%3===0);
      const tier=rest?1:Math.min(3,Math.max(1,Math.ceil(graph.options.difficulty*(n.main?index/(graph.mainPath.length-2):.75))));
      const config={type:n.type,ports:ports.get(n.id),tier,rest,variant:ns.random(graph.options.seed).fork(n.id).int(0,1)};
      configs.set(n.id,config);Object.assign(n,service.roomGeometry(config).quality);
    }
    const final=byId.get(graph.mainPath.at(-1));
    const recipe={id:'procedural-hardware',name:'Hardware // parkour procedural',theme:'hardware',seed:graph.options.seed,revision:3,layout:'multi-route',
      objective:'Explore os andares, observe os avisos eletricos e alcance a saida pela rota fixa ou pelos elevadores.',
      size:{width:(Math.max(...graph.nodes.map(n=>n.x))+1)*width,height:(Math.max(...graph.nodes.map(n=>n.y))+1)*height},
      rooms:graph.nodes.map(n=>({id:n.id,generator:'playable-hardware-v2',x:n.x*width,y:n.y*height,config:configs.get(n.id)})),links,
      start:{room:graph.mainPath[0],anchor:'entry'},exit:{room:graph.mainPath.at(-1),anchor:'exit'},objectives:{requireExitQuestion:true,repairAllComponents:false,defeatAllViruses:false,goals:[{id:'reach-final',type:'region',x:final.x*width+600,y:final.y*height+floor-80,width:120,height:80}]}};
    const compiled=api.maps.clone(ns.compile(recipe));compiled.generation.graph=graph;compiled.map.checkpointMode='free';
    if(graph.options.portals){
      const secret=graph.nodes.find(n=>n.type==='secret'),initial=graph.nodes[0];
      const point=n=>({x:n.x*width+192,y:n.y*height+floor-48});
      compiled.mechanics.push({id:'diagnostic-bus',type:'portals',links:[{id:'bus-out',...point(initial),width:40,height:48,label:'BUS // SETOR OCULTO',to:point(secret)},{id:'bus-back',...point(secret),width:40,height:48,label:'BUS // ENTRADA',to:point(initial)}]});
      graph.edges.push({id:'bus-shortcut',from:initial.id,to:secret.id,kind:'portal',role:'shortcut'});
    }
    compiled.generation.physics={...api.platformPhysics.base,jumpHeight:api.platformPhysics.jumpHeight,maxHorizontal:api.platformPhysics.maxHorizontal,safetyFactor:.82};
    const errors=[...validate(compiled),...service.validateParkour(compiled)];if(errors.length)throw new Error('Structural quality: '+errors.join('; '));return freeze(compiled);
  }
  function validate(map){
    const errors=[],graph=map.generation?.graph;if(!graph)return ['missing graph'];
    const ids=new Set(graph.nodes.map(n=>n.id)),cells=new Set(graph.nodes.map(n=>n.x+','+n.y));
    if(cells.size!==ids.size)errors.push('overlapping rooms');
    if(graph.nodes.filter(n=>n.type==='initial').length!==1||graph.nodes.filter(n=>n.type==='final').length!==1)errors.push('entry/exit count');
    const visited=new Set([graph.mainPath[0]]),queue=[graph.mainPath[0]];
    for(const id of queue)for(const e of graph.edges){const next=e.from===id?e.to:e.to===id?e.from:null;if(next&&!visited.has(next)){visited.add(next);queue.push(next);}}
    if(visited.size!==ids.size)errors.push('disconnected graph');
    if(graph.edges.length<graph.nodes.length)errors.push('no cycle');
    // Probe the full player-width corridor at every seam, including head clearance.
    const boxes=[...map.map.ground.segments,...map.entities.obstacles];
    const overlap=(a,b)=>a.x<b.x+b.width&&a.x+a.width>b.x&&a.y<b.y+b.height&&a.y+a.height>b.y;
    for(const link of map.generation.links){
      const room=map.generation.rooms.find(r=>r.id===link.from.room),side=link.from.socket;
      const aperture=side==='east'||side==='west'?{x:room.x+(side==='east'?room.width:0)-20,y:room.y+service.metrics.floor-48,width:40,height:48}:{x:room.x+352,y:room.y+(side==='south'?room.height:0)-48,width:64,height:96};
      if(boxes.some(b=>overlap(aperture,b)))errors.push('blocked connection '+link.from.room+'/'+side);
    }
    return errors;
  }
  Object.assign(service,{generate,validate});
})();
