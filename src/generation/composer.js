// Optional schema-v2 compiler. Registration and campaign selection remain explicit.
(() => {
  'use strict';
  const api=window.ByteRunner,ns=api.mapGeneration,templates=new Map(),generators=new Map();
  const copy=api.maps.clone;
  const freeze=value=>{if(value&&typeof value==='object'&&!Object.isFrozen(value)){Object.values(value).forEach(freeze);Object.freeze(value);}return value;};
  const check=(errors,scope)=>{if(errors.length)throw new Error(scope+': '+errors.join('; '));};
  const canonical=value=>JSON.stringify(value,(_,v)=>v&&typeof v==='object'&&!Array.isArray(v)?Object.fromEntries(Object.keys(v).sort().map(k=>[k,v[k]])):v);
  const opposite={west:'east',east:'west',north:'south',south:'north'};
  function compile(input){
    check(ns.validation.plan(input),'Generation plan');
    const plan=copy(input),random=ns.random(plan.seed),resolved=new Map(),material=ns.config.materials[plan.theme];
    for(const placement of plan.rooms){
      let room,source;
      if(placement.template){
        if(!templates.has(placement.template))throw new Error('Unknown room template: '+placement.template);
        room=copy(templates.get(placement.template));source={kind:'manual',id:placement.template,version:room.version};
      }else{
        const generator=generators.get(placement.generator);
        if(!generator)throw new Error('Unknown room generator: '+placement.generator);
        const context=Object.freeze({roomId:placement.id,random:random.fork(placement.id),config:freeze(copy(placement.config || {})),material});
        const output=generator.generate(context);
        check(ns.validation.room(output),'Generated room '+placement.id);
        room=copy(output);source={kind:'procedural',id:generator.id,version:generator.version};
      }
      check(ns.validation.room(room),'Room '+placement.id);
      if(placement.x+room.width>plan.size.width||placement.y+room.height>plan.size.height)throw new Error('Room outside plan: '+placement.id);
      for(const placed of resolved.values())if(placement.x<placed.x+placed.room.width&&placement.x+room.width>placed.x&&placement.y<placed.y+placed.room.height&&placement.y+room.height>placed.y)throw new Error('Overlapping rooms: '+placement.id+'/'+placed.id);
      resolved.set(placement.id,{...placement,room,source});
    }
    const requireRoom=id=>{if(!resolved.has(id))throw new Error('Unknown placement: '+id);return resolved.get(id);};
    const anchor=endpoint=>{
      const placed=requireRoom(endpoint.room);
      if(!Object.hasOwn(placed.room.anchors,endpoint.anchor))throw new Error('Unknown anchor: '+endpoint.room+'/'+endpoint.anchor);
      const point=placed.room.anchors[endpoint.anchor];return {x:placed.x+point.x,y:placed.y+point.y};
    };
    const start=anchor(plan.start),exit=anchor(plan.exit),adjacency=new Map([...resolved.keys()].map(id=>[id,new Set()])),used=new Set();
    for(const link of plan.links || []){
      if(!link?.from||!link.to)throw new Error('Link needs two socket references');
      const a=requireRoom(link.from.room),b=requireRoom(link.to.room);
      const first=a.room.sockets?.find(s=>s.id===link.from.socket),second=b.room.sockets?.find(s=>s.id===link.to.socket);
      if(a===b||!first||!second)throw new Error('Invalid socket link');
      if(opposite[first.direction]!==second.direction||a.x+first.x!==b.x+second.x||a.y+first.y!==b.y+second.y)throw new Error('Misaligned room sockets');
      for(const endpoint of [link.from,link.to]){const key=endpoint.room+':'+endpoint.socket;if(used.has(key))throw new Error('Socket linked more than once');used.add(key);}
      adjacency.get(a.id).add(b.id);adjacency.get(b.id).add(a.id);
    }
    const visited=new Set([plan.start.room]),queue=[plan.start.room];
    for(const room of queue)for(const next of adjacency.get(room))if(!visited.has(next)){visited.add(next);queue.push(next);}
    if(visited.size!==resolved.size||!visited.has(plan.exit.room))throw new Error('Disconnected room graph');
    const phase={schemaVersion:2,revision:plan.revision || 1,id:plan.id,name:plan.name,theme:plan.theme,palette:[...material.palette],presentation:{procedural:false},
      map:{width:plan.size.width,height:plan.size.height,layout:plan.layout || 'multi-route',start,exit:{mode:'region',...exit,width:plan.exit.width ?? 64,height:plan.exit.height ?? 48},bounds:{left:true,right:true,ceiling:true,floor:true},camera:{axes:['x','y'],followOffsetX:.44,followOffsetY:.55},ground:{mode:'explicit',segments:[]},checkpoints:[],checkpointMode:'ordered',progress:{axis:'objectives'}},
      entities:Object.fromEntries(ns.config.groups.map(group=>[group,[]])),objectives:{repairAllComponents:false,defeatAllViruses:false,requireExitQuestion:true,...copy(plan.objectives || {}),goals:copy(plan.objectives?.goals || [])},assets:[],layers:[],mechanics:[],
      generation:{version:ns.config.version,seed:plan.seed,recipe:copy(plan),presentation:{tileSize:material.tileSize,tileset:material.tileset,scenery:material.scenery,background:material.background},rooms:[],links:copy(plan.links || [])}};
    phase.objective=plan.objective || plan.name;
    if(plan.completion)phase.completion=copy(plan.completion);
    const assets=new Map();
    for(const placed of resolved.values()){
      const {room,id,x,y}=placed;
      const reference=value=>{
        if(typeof value!=='string'||!value)throw new Error('Invalid room reference');
        if(value.startsWith('global:')){if(value.length===7)throw new Error('Empty global reference');return value;}
        if(value.includes(':')){const pieces=value.split(':');if(pieces.length!==2||!resolved.has(pieces[0])||!pieces[1])throw new Error('Invalid cross-room reference: '+value);return value;}
        return id+':'+value;
      };
      const point=value=>({...copy(value),x:value.x+x,y:value.y+y});
      const condition=value=>{
        if(!value)return value;const result=copy(value);
        if(result.all)result.all=result.all.map(condition);if(result.any)result.any=result.any.map(condition);if(result.not)result.not=condition(result.not);
        for(const key of ['component','enemyDefeated','flag'])if(result[key])result[key]=reference(result[key]);return result;
      };
      const entity=source=>{
        const target=point(source);target.id=reference(source.id);
        for(const key of ['requires','disabledWhen','opensWhen'])if(target[key])target[key]=condition(target[key]);
        for(const key of ['requiresComponentId','flag'])if(target[key])target[key]=reference(target[key]);
        for(const key of ['patrolMin','patrolMax'])if(Number.isFinite(target[key]))target[key]+=x;
        if(Number.isFinite(target.groundY))target.groundY+=y;
        for(const key of ['navigationBounds','bossBounds'])if(target[key])for(const side of ['left','right'])if(Number.isFinite(target[key][side]))target[key][side]+=x;
        if(target.activationRegion)target.activationRegion=point(target.activationRegion);
        return target;
      };
      for(const segment of room.ground || [])phase.map.ground.segments.push(entity(segment));
      for(const group of ns.config.groups)for(const spec of room.entities?.[group] || [])phase.entities[group].push(entity(spec));
      for(const checkpoint of room.checkpoints || [])phase.map.checkpoints.push(point(checkpoint));
      for(const goal of room.goals || []){
        const result=copy(goal);result.id=reference(result.id);
        if(result.type==='region')Object.assign(result,point(result));
        if(result.condition)result.condition=condition(result.condition);
        if(result.ids)result.ids=result.ids.map(reference);
        phase.objectives.goals.push(result);
      }
      for(const asset of room.assets || []){
        if(assets.has(asset.id)&&canonical(assets.get(asset.id))!==canonical(asset))throw new Error('Conflicting asset: '+asset.id);
        assets.set(asset.id,copy(asset));
      }
      for(const [index,layer] of (room.layers || []).entries()){
        const result=copy(layer);result.id=reference(layer.id || 'layer-'+index);
        if(Number.isFinite(result.x))result.x+=x;if(Number.isFinite(result.y))result.y+=y;
        for(const key of ['items','rects'])if(result[key])result[key]=result[key].map(item=>{const transformed=point(item);if(item.requires)transformed.requires=condition(item.requires);return transformed;});
        phase.layers.push(result);
      }
      for(const spec of room.mechanics || []){
        const result=copy(spec);result.id=reference(spec.id);
        if(result.type==='portals')result.links=(result.links || []).map(link=>({...entity(link),to:link.to.room?anchor(link.to):point(link.to)}));
        if(result.type==='environment')result.zones=(result.zones || []).map(entity);
        if(result.type==='parkour-hazards')result.hazards=result.hazards.map(entity);
        if(result.type==='security-grid')result.cameras=(result.cameras || []).map(camera=>({...entity(camera),region:point(camera.region)}));
        phase.mechanics.push(result);
      }
      phase.generation.rooms.push({id,source:placed.source,x,y,width:room.width,height:room.height});
    }
    phase.assets=[...assets.values()];
    phase.objectives.componentsToRepair??=phase.entities.components.length;phase.objectives.enemiesToDefeat??=phase.entities.enemies.length;
    check(ns.validation.definition(phase),'Composed map');
    if(start.x+34>phase.map.width||start.y+48>phase.map.height||exit.x+phase.map.exit.width>phase.map.width||exit.y+phase.map.exit.height>phase.map.height)throw new Error('Start or exit footprint outside map');
    return freeze(phase);
  }
  Object.assign(ns,{
    registerRoom(room){check(ns.validation.room(room),'Room template');if(templates.has(room.id))throw new Error('Duplicate room template: '+room.id);templates.set(room.id,freeze(copy(room)));},
    registerGenerator(spec){if(!spec||typeof spec.id!=='string'||!spec.id||!Number.isSafeInteger(spec.version)||spec.version<1||typeof spec.generate!=='function')throw new Error('Invalid room generator');if(generators.has(spec.id))throw new Error('Duplicate generator: '+spec.id);generators.set(spec.id,Object.freeze({...spec}));},
    authored(id){return api.maps.get(id);},
    compile,
    list(){return Object.freeze({templates:Object.freeze([...templates.keys()]),generators:Object.freeze([...generators.keys()])});}
  });
  Object.freeze(ns);
})();
