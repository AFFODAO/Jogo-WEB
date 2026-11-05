// Conservative construction certificates. Browser tests additionally run real collisions.
(() => {
  const service=ByteRunner.proceduralMaps,physics=ByteRunner.platformPhysics;
  service.validateParkour=map=>{
    const errors=[],platforms=map.entities.platforms,obstacles=map.entities.obstacles;
    const overlap=(a,b)=>a.x<b.x+b.width&&a.x+a.width>b.x&&a.y<b.y+b.height&&a.y+a.height>b.y;
    for(const node of map.generation.graph.nodes){
      for(let i=1;i<node.route.length;i++){
        const a=node.route[i-1],b=node.route[i];
        if(!physics.canReach(a,b)||!physics.canReach(b,a))errors.push('jump certificate failed: '+node.id);
      }
      const climb=platforms.filter(p=>p.id.startsWith(node.id+':riser-')).sort((a,b)=>b.y-a.y);
      for(let i=1;i<climb.length;i++)if(!physics.canReach(climb[i-1],climb[i]))errors.push('vertical jump failed: '+node.id);
    }
    for(const p of platforms){
      if(p.type==='moving'){
        const motion=p.motion,r=motion.range,envelope={x:p.x-(motion.axis==='x'?r:0),y:p.y-(motion.axis==='y'?r:0),width:p.width+(motion.axis==='x'?2*r:0),height:p.height+(motion.axis==='y'?2*r:0)};
        if(obstacles.some(o=>overlap(envelope,o)))errors.push('moving platform intersects wall: '+p.id);
        if(r*motion.speed>physics.base.speed*.6)errors.push('moving platform too fast: '+p.id);
      }
      if(p.type==='temporary'&&(!(p.duration>physics.flightTime+.4)||!(p.respawnDelay>0)))errors.push('unsafe temporary timing: '+p.id);
      if(p.type==='falling'&&(!(p.duration>=.6)||!(p.respawnDelay>0)||!(p.dropDistance>0)))errors.push('unsafe falling timing: '+p.id);
    }
    const hazards=map.mechanics.filter(m=>m.type==='parkour-hazards').flatMap(m=>m.hazards);
    for(const checkpoint of map.map.checkpoints){
      // Include the existing engine's +38px respawn offset, as well as activation.
      const zone={x:checkpoint.x-8,y:checkpoint.y-physics.base.height-12,width:112,height:physics.base.height+24};
      if(hazards.some(h=>overlap(zone,h))||obstacles.some(o=>overlap({...zone,height:physics.base.height},o)))errors.push('unsafe checkpoint');
      const support=[...map.map.ground.segments,...platforms.filter(p=>p.type==='fixed')];
      let end=checkpoint.x+38;
      for(const s of support.filter(s=>s.y===checkpoint.y).sort((a,b)=>a.x-b.x))if(s.x<=end&&s.x+s.width>=end)end=Math.max(end,s.x+s.width);
      if(end<checkpoint.x+38+physics.base.width)errors.push('checkpoint lacks permanent support');
    }
    return errors;
  };
})();
