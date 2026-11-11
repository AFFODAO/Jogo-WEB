report.comparison=[];
function inventory(phase,nodes){
  const {map,entities,generation,objectives}=phase;
  const architecture=generation?.architecture;
  const mechanics=phase.mechanics||[];
  const countMechanics=(type,key)=>mechanics.filter(m=>m.type===type).reduce((sum,m)=>sum+(m[key]?.length||0),0);
  const regions=map.regions?.map(r=>r.name)||architecture?.regions||[];
  const rooms=generation?.rooms?.length||0;
  return {
    revision:phase.revision,dimensions:[map.width,map.height],layout:map.layout,regions,rooms,
    optionalRooms:architecture?.optionalRooms?.length??null,
    areaPx2:Math.round(reachableNavigationArea(nodes)),surfaces:nodes.length,
    platforms:entities.platforms.length,moving:entities.platforms.filter(p=>p.type==='moving').length,
    temporary:entities.platforms.filter(p=>p.type==='temporary'||p.type==='falling').length,
    obstacles:entities.obstacles.length,gates:entities.gates.length,
    timedHazards:countMechanics('parkour-hazards','hazards'),
    cameras:countMechanics('security-grid','cameras'),environmentZones:countMechanics('environment','zones'),
    routes:map.routes||architecture?.routes||[],physicalLinks:generation?.links?.length||0,
    portals:countMechanics('portals','links'),
    collectibles:entities.collectibles.length,secrets:entities.collectibles.filter(c=>c.secret).length,
    checkpoints:map.checkpoints.length,repairs:entities.components.length,enemies:entities.enemies.length,
    requiredEnemies:objectives.enemiesToDefeat,repairAll:objectives.repairAllComponents,
    defeatAll:objectives.defeatAllViruses,question:objectives.requireExitQuestion,
    goals:objectives.goals.map(g=>({id:g.id,type:g.type})),completion:phase.completion?.type||'exit'
  };
}
for(let index=0;index<10;index++){
  const row={phase:index+1,theme:PHASES[index].theme};report.comparison.push(row);
  test('final comparison: historical and rebuilt traversal / '+(index+1),()=>{
    for(const [key,definition] of [['previous',HISTORICAL_MAPS[index]],['rebuilt',PHASES[index]]]){
      setup(index);loadMap(definition,true);endPhaseIntro();animationTime=0;
      assert(player.jumpPower===JUMP_SPEED&&!unlockedSkills.length,'optional abilities');
      components.forEach(c=>c.repaired=true);fulfilGoalsForQuestionTest();phaseExitUnlocked=true;
      Object.assign(player,mapStart(),{vy:0,grounded:true});
      const nodes=reachability();
      row[key]=inventory(definition,nodes);
      row[key].missedCheckpointCandidates=mapCheckpointMisses(definition,nodes);
      row[key].checkpointHazards=mapCheckpointHazards(definition);
    }
    row.areaRatio=row.rebuilt.areaPx2/row.previous.areaPx2;
    assert(row.rebuilt.revision>row.previous.revision&&row.rebuilt.areaPx2>row.previous.areaPx2,'missing expansion');
    assert(!row.rebuilt.missedCheckpointCandidates.length&&!row.rebuilt.checkpointHazards.length,'checkpoint access or hazard overlap');
  });
  await new Promise(resolve=>setTimeout(resolve,0));
}
function mapCheckpointMisses(definition,nodes){
  return definition.map.checkpoints.filter(p=>!nodes.some(n=>Math.abs(n.y+player.height-p.y)<2&&
    [p.x,p.x+38].some(x=>x>=n.a-1&&x<=n.z+1)));
}
function mapCheckpointHazards(definition){
  const hazards=(definition.mechanics||[]).filter(m=>m.type==='parkour-hazards').flatMap(m=>m.hazards);
  for(const group of ['obstacles','platforms'])for(const item of definition.entities[group]){
    if(item.type==='dangerous'||item.collision==='dangerous')hazards.push(item);
  }
  return definition.map.checkpoints.flatMap((p,index)=>{
    const x=Math.max(0,Math.min(worldWidth()-player.width,p.x+38)),y=p.y-player.height;
    return hazards.filter(h=>x<h.x+h.width&&x+player.width>h.x&&y<h.y+h.height&&y+player.height>h.y)
      .map(h=>({index,hazard:h.id}));
  });
}
running=false;
