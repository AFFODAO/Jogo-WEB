// Checks local room contracts and composed schema-v2 definitions. Not a physics solver.
(() => {
  const api=window.ByteRunner,ns=api.mapGeneration;
  const object=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
  const id=v=>typeof v==='string'&&/^[a-zA-Z0-9][a-zA-Z0-9_-]*$/.test(v);
  const finite=Number.isFinite,positive=v=>Number.isSafeInteger(v)&&v>0;
  function room(value){
    const errors=[];
    if(!object(value))return ['room must be an object'];
    if(!id(value.id)||!positive(value.version))errors.push('room needs a local id and positive version');
    if(!positive(value.width)||!positive(value.height)||value.width>ns.config.limits.dimension||value.height>ns.config.limits.dimension)errors.push('invalid room dimensions');
    const ids=new Set();let count=0;
    const localId=(entry,label)=>{if(!id(entry.id)||ids.has(entry.id))errors.push('invalid/duplicate '+label+' id: '+entry.id);ids.add(entry.id);};
    const point=(entry,label)=>{if(!object(entry)||!finite(entry.x)||!finite(entry.y))errors.push('explicit x/y required: '+label);else if(entry.x<0||entry.y<0||entry.x>value.width||entry.y>value.height)errors.push('point outside room: '+label);};
    const array=(entries,label)=>{if(!Array.isArray(entries)){errors.push(label+' must be an array');return [];}return entries;};
    if(value.entities!==undefined&&!object(value.entities))errors.push('entities must be an object');
    for(const [group,entries] of Object.entries(object(value.entities)?value.entities:{})){
      if(!ns.config.groups.includes(group))errors.push('unsupported entity group: '+group);
      for(const entry of array(entries,group)){
        count++;if(!object(entry)){errors.push('invalid '+group+' entry');continue;}
        localId(entry,group);point(entry,entry.id);
        if(entry.anchor!==undefined)errors.push('room entities use local coordinates, not floor anchors: '+entry.id);
        for(const key of ['width','height'])if(entry[key]!==undefined&&(!positive(entry[key])||entry[key]+entry[key==='width'?'x':'y']>value[key]))errors.push('invalid/outside '+key+': '+entry.id);
        if(['platforms','obstacles','gates'].includes(group)&&(!positive(entry.width)||!positive(entry.height)))errors.push('geometry needs width/height: '+entry.id);
      }
    }
    if(count>ns.config.limits.entitiesPerRoom)errors.push('too many room entities');
    for(const entry of array(value.ground ?? [],'ground')){
      if(!object(entry)){errors.push('invalid ground');continue;}
      localId(entry,'ground');point(entry,entry.id);
      if(!positive(entry.width)||!positive(entry.height)||entry.x+entry.width>value.width||entry.y+entry.height>value.height)errors.push('ground outside room: '+entry.id);
    }
    if(!object(value.anchors))errors.push('anchors must be an object');
    else for(const [name,entry] of Object.entries(value.anchors)){if(!id(name))errors.push('invalid anchor id');point(entry,'anchor '+name);}
    const sockets=new Set();
    for(const entry of array(value.sockets ?? [],'sockets')){
      if(!object(entry)){errors.push('invalid socket');continue;}
      if(!id(entry.id)||sockets.has(entry.id))errors.push('invalid/duplicate socket');sockets.add(entry.id);point(entry,'socket '+entry.id);
      if(!['west','east','north','south'].includes(entry.direction))errors.push('invalid socket direction');
      else if((entry.direction==='west'&&entry.x!==0)||(entry.direction==='east'&&entry.x!==value.width)||(entry.direction==='north'&&entry.y!==0)||(entry.direction==='south'&&entry.y!==value.height))errors.push('socket must lie on its room boundary');
    }
    for(const entry of array(value.checkpoints ?? [],'checkpoints'))point(entry,'checkpoint');
    for(const key of ['layers','mechanics','assets','goals'])if(value[key]!==undefined&&!Array.isArray(value[key]))errors.push(key+' must be an array');
    for(const layer of Array.isArray(value.layers)?value.layers:[])if(!object(layer)||layer.space==='screen')errors.push('room layers must use world space');
    for(const mechanic of Array.isArray(value.mechanics)?value.mechanics:[]){
      if(!object(mechanic)||!['portals','environment','security-grid','parkour-hazards'].includes(mechanic.type))errors.push('unsupported room mechanic');
      if(mechanic?.type==='parkour-hazards')for(const hazard of array(mechanic.hazards,'hazards')){
        if(!object(hazard)){errors.push('invalid hazard');continue;}
        point(hazard,'hazard');
        if(!id(hazard.id)||!['laser','electric'].includes(hazard.kind)||!positive(hazard.width)||!positive(hazard.height)||hazard.x+hazard.width>value.width||hazard.y+hazard.height>value.height||!(hazard.warning>=.5)||!(hazard.active>0)||!(hazard.period>hazard.warning+hazard.active+.7))errors.push('invalid hazard timing/bounds');
      }
    }
    return errors;
  }
  function plan(value){
    if(!object(value))return ['plan must be an object'];
    const errors=[];
    if(!id(value.id)||typeof value.name!=='string'||!value.name.trim())errors.push('plan needs id and name');
    if(!Object.hasOwn(ns.config.materials,value.theme))errors.push('unknown generation theme');
    if(!(typeof value.seed==='string'||Number.isSafeInteger(value.seed)))errors.push('explicit seed required');
    if(value.revision!==undefined&&!positive(value.revision))errors.push('invalid plan revision');
    if(value.objectives!==undefined&&(!object(value.objectives)||(value.objectives.goals!==undefined&&!Array.isArray(value.objectives.goals))))errors.push('invalid plan objectives');
    if(value.completion!==undefined&&!object(value.completion))errors.push('invalid plan completion');
    if(!object(value.size)||!positive(value.size.width)||!positive(value.size.height)||value.size.width>ns.config.limits.dimension||value.size.height>ns.config.limits.dimension)errors.push('invalid plan size');
    if(!Array.isArray(value.rooms)||!value.rooms.length||value.rooms.length>ns.config.limits.rooms)errors.push('invalid room placements');
    else {
      const ids=new Set();for(const placement of value.rooms){
        if(!object(placement)){errors.push('invalid placement');continue;}
        if(!id(placement.id)||placement.id==='global'||ids.has(placement.id))errors.push('invalid/duplicate placement id');ids.add(placement.id);
        if(!Number.isSafeInteger(placement.x)||!Number.isSafeInteger(placement.y)||placement.x<0||placement.y<0)errors.push('invalid placement offset');
        if(Boolean(placement.template)===Boolean(placement.generator))errors.push('placement needs exactly one template or generator');
        if(placement.config!==undefined&&!object(placement.config))errors.push('placement config must be an object');
      }
    }
    for(const key of ['start','exit'])if(!object(value[key])||!id(value[key].room)||!id(value[key].anchor))errors.push('invalid '+key+' anchor reference');
    if(!Array.isArray(value.links ?? []))errors.push('links must be an array');
    return errors;
  }
  function definition(value){
    if(!object(value)||!object(value.entities)||!object(value.map))return ['invalid composed definition'];
    let errors;try{errors=api.maps.validate(value);}catch(error){return ['invalid composed schema: '+error.message];}
    const ids=new Set();for(const segment of value.map.ground?.segments || []){
      if(!segment.id||ids.has(segment.id))errors.push('duplicate ground id');ids.add(segment.id);
    }
    for(const entities of Object.values(value.entities))for(const entity of entities){if(ids.has(entity.id))errors.push('ground/entity id collision');ids.add(entity.id);}
    if(value.completion?.enemyId&&!value.entities.enemies.some(e=>e.id===value.completion.enemyId))errors.push('unknown completion enemy');
    return errors;
  }
  ns.validation=Object.freeze({room,plan,definition});
})();
