// These maps and controllers exist only in the isolated browser test copy.
const canonical = value => JSON.stringify(value, (key,item) => item && !Array.isArray(item) && typeof item === 'object'
  ? Object.fromEntries(Object.keys(item).sort().map(key=>[key,item[key]])) : item);
test('architecture: all layouts distinct, hybrid campaign preserves authored content',()=>{
  assert(PHASES.length===MAP_BASELINE.length,'campaign size changed');
  function project(current,baseline) {
    if (Array.isArray(baseline)) return current.map((value,index)=>project(value,baseline[index]));
    if (baseline && typeof baseline==='object') return Object.fromEntries(Object.keys(baseline).map(key=>[key,project(current[key],baseline[key])]));
    return current;
  }
  PHASES.forEach((phase,index)=>{
    assert(phase.revision===(index<2?5:phase.theme==='cabling'?4:3)&&phase.map.ground.mode==='explicit'&&canonical(phase.entities.platforms)!==canonical(MAP_BASELINE[index].entities.platforms),'layout was not rebuilt: '+phase.id);
    if(index===0){
      assert(phase.generation.rooms.length===22&&phase.map.regions.length===6&&phase.entities.components.length===4&&phase.entities.enemies.length===13,'Hardware V3 content contract');
      assert(phase.generation.rooms.some(r=>r.source.kind==='manual')&&phase.generation.rooms.some(r=>r.source.kind==='procedural'),'Hardware V3 hybrid sources');
      assert(phase.map.width>FIRST_FIVE_V2[0].map.width&&phase.map.height>FIRST_FIVE_V2[0].map.height,'Hardware V3 did not expand both axes');
    }else if(index===1){
      assert(phase.generation.rooms.length===19&&phase.map.regions.length===6&&phase.entities.components.length===5,'Software V3 content contract');
      assert(phase.generation.recipe.connectivity==='portal-network'&&phase.generation.architecture.portalEdges.length===25,'Software V3 portal architecture');
      assert(phase.generation.rooms.some(r=>r.source.kind==='manual')&&phase.generation.rooms.some(r=>r.source.kind==='procedural'),'Software V3 hybrid sources');
    }else if(index<5) {
      const authored=phase.generation.recipe.rooms[0].config.blueprint;
      assert(canonical(project(authored,FIRST_FIVE_V2[index]))===canonical(FIRST_FIVE_V2[index]),'authored content changed: '+phase.id);
      for(const group of ['components','enemies','collectibles','interactives'])assert(canonical(phase.entities[group])===canonical(authored.entities[group]),'content/order changed: '+group);
      assert(canonical(phase.objectives)===canonical(authored.objectives),'objectives changed');
    }
    assert(Object.isFrozen(phase)&&Object.isFrozen(phase.entities.platforms),'map definitions are mutable');
  });
});
test('architecture: map validation rejects broken references and geometry',()=>{
  const invalid=ByteRunner.maps.clone(PHASES[0]);
  invalid.map.width=-10;invalid.entities.platforms[0].requires={component:'missing'};
  invalid.entities.platforms[1].id=invalid.entities.platforms[0].id;
  const errors=ByteRunner.maps.validate(invalid);
  assert(errors.some(e=>e.includes('size'))&&errors.some(e=>e.includes('duplicate'))&&errors.some(e=>e.includes('condition')),'validation accepted invalid map');
  let rejected=false;try{ByteRunner.maps.register(invalid);}catch{rejected=true;}assert(rejected,'invalid registration accepted');
});
let disposedMechanics=0;
ByteRunner.levels.registerMechanic('test-signals', (spec,state)=>{
  let repairs=0;
  return {
    onEvent(name){if(name==='repair'){repairs++;state.setFlag('repair-events',repairs);}},
    save(){return {repairs};},
    restore(saved){repairs=saved?.repairs || 0;},
    dispose(){disposedMechanics++;}
  };
});
const ROOM_MAP=ByteRunner.maps.register(ARCHITECTURE_FIXTURE);
function room() {setup(0);campaignStarted=false;loadMap(ROOM_MAP,true);running=true;keys.clear();xpRequired=999999;}
test('architecture: arbitrary ground segments and room checkpoints',()=>{
  room();assert(!solids().some(s=>s.kind==='floor'&&s.y===floorY()),'implicit floor in explicit map');
  player.x=70;player.y=100;player.vy=0;player.grounded=false;
  for(let t=0;t<60;t++)movePlayer(1/60);
  assert(player.y===252&&player.grounded,'room floor collision');
  player.x=500;player.y=800;player.vy=0;player.grounded=false;
  for(let t=0;t<80&&player.y<1050;t++)movePlayer(1/60);
  assert(player.y>1000&&!player.grounded,'implicit bottom floor still blocks gaps');
  for(let t=0;t<45;t++)movePlayer(1/60);
  assert(player.x===108&&player.y===252,'gap did not respawn at room start');
  player.x=80;player.y=252;updateCheckpoints();assert(checkpointIndex===0,'first room checkpoint');
  player.x=650;player.y=652;updateCheckpoints();assert(checkpointIndex===1&&checkpointY===700,'descending checkpoint rejected');
  respawnAtCheckpoint();assert(player.y===652&&!solids().some(s=>s.collision!=='one-way'&&overlaps(player,s)),'lower room respawn');
  player.x=60;player.y=252;updateCheckpoints();assert(checkpointIndex===2,'return checkpoint on left rejected');
});
test('architecture: switches, custom repair, objectives and persisted mechanics',()=>{
  room();assert(!platformShape(phaseData.entities.platforms[0]),'conditional bridge starts active');
  player.x=220;player.y=252;keys.add('e');levelRuntime.update(.016,{keys,repairNearby:false});
  assert(levelRuntime.getFlag('power')&&platformShape(phaseData.entities.platforms[0]),'switch did not activate bridge');
  levelRuntime.update(.016,{keys,repairNearby:false});assert(levelRuntime.getFlag('power'),'held key toggles repeatedly');
  keys.clear();levelRuntime.update(.016,{keys,repairNearby:false});
  player.x=120;keys.add('e');updateRepair(.016);assert(repairSession?.blocksWorld,'minigame not started');
  draw();assert(!document.getElementById('repairPanel').hidden,'repair panel missing');document.getElementById('cancelRepairButton').click();assert(!repairSession&&!components[0].repaired&&xp===0,'cancel awarded repair');
  keys.add('e');updateRepair(.016);pause();assert(document.getElementById('repairPanel').hidden,'repair panel covers pause menu');startButton.click();
  const time=animationTime,x=player.x;keys.clear();keys.add('d');update(.1);
  assert(player.x===x&&animationTime===time,'modal repair did not pause world');
  assert(!components[0].repaired&&xp===0,'invalid input awarded repair');
  keys.clear();keys.add('e');updateRepair(.016);keys.clear();updateRepair(.016);
  keys.add('1');updateRepair(.016);keys.clear();updateRepair(.016);keys.add('2');updateRepair(.016);
  assert(components[0].repaired&&xp===30&&!repairSession,'minigame success or XP failed');
  assert(levelRuntime.getFlag('repair-events')===1,'mechanic event missing');
  assert(!solids().some(s=>s.id==='lower-door'),'composite door condition failed');
  checkObjectives();assert(!phaseExitUnlocked,'exit opened without visiting required room');
  player.x=650;player.y=652;keys.clear();levelRuntime.update(.016,{keys,repairNearby:false});
  assert(levelRuntime.goalsComplete()&&levelRuntime.progress()===1,'mixed objectives incomplete');
  const saved=levelRuntime.save();levelRuntime.restore(saved);assert(levelRuntime.getFlag('power'),'state roundtrip');
  loadMap(ROOM_MAP,true);components[0].repaired=true;levelRuntime.restore(saved);assert(levelRuntime.goalsComplete(),'state not restored after map reload');
  levelRuntime.emit('repair',components[0]);assert(levelRuntime.getFlag('repair-events')===2,'controller state not restored');
  components[0].repaired=true;player.x=650;player.y=652;running=true;xpRequired=999999;update(.016);
  assert(phaseQuestionOpen,'region exit did not open mandatory question');
  const disposedBefore=disposedMechanics;loadPhase(0,true);
  assert(disposedMechanics>disposedBefore&&!levelRuntime.getFlag('power')&&!repairSession,'state leaked between maps');
});
test('architecture: sprite frames, animation state, layers and fallback',()=>{
  let effectRendered=false;
  ByteRunner.visuals.registerLayer('test-light',()=>{effectRendered=true;});
  const sheet=document.createElement('canvas');sheet.width=32;sheet.height=16;const s=sheet.getContext('2d');
  s.fillStyle='#ff0000';s.fillRect(0,0,16,16);s.fillStyle='#0000ff';s.fillRect(16,0,16,16);
  const dest=document.createElement('canvas');dest.width=160;dest.height=80;const c=dest.getContext('2d');
  const visuals=ByteRunner.visuals.create({assets:[],layers:[{type:'rects',pass:'foreground',parallaxX:.5,color:'#00ff00',rects:[{x:100,y:30,width:10,height:10}]},{type:'test-light',pass:'foreground'}]});
  visuals.add('robot',sheet,{frameWidth:16,frameHeight:16,columns:2,animations:{run:{frames:[0,1],fps:2},attack:{frames:[0,1],fps:2,loop:false}}});
  const box={id:'test-robot',x:0,y:0,width:16,height:16};
  visuals.sprite(c,{asset:'robot'},box,10,'run');assert(c.getImageData(1,1,1,1).data[0]===255,'first sprite frame');
  visuals.sprite(c,{asset:'robot'},box,10.6,'run');assert(c.getImageData(1,1,1,1).data[2]===255,'animation did not advance');
  visuals.sprite(c,{asset:'robot'},box,11,'attack');assert(c.getImageData(1,1,1,1).data[0]===255,'new state did not restart animation');
  visuals.sprite(c,{asset:'robot'},box,20,'attack');assert(c.getImageData(1,1,1,1).data[2]===255,'non-looping animation did not hold last frame');
  assert(!visuals.sprite(c,{asset:'missing'},box,0),'missing asset suppressed procedural fallback');
  visuals.layers(c,'foreground',{x:50,y:0,width:160,height:80},0);assert(c.getImageData(76,31,1,1).data[1]===255&&effectRendered,'parallax/effect layer transform');
  visuals.dispose();assert(!visuals.sprite(c,{asset:'robot'},box,0),'disposed sprite still available');
});
test('architecture: old saves remain compatible',()=>{
  setup(0);components[0].repaired=true;xp=47;saveCampaign();const saved=getSavedCampaign();
  saved.player.x=0;saved.player.y=0;saved.checkpointX=0;
  delete saved.phaseId;delete saved.levelState;delete saved.checkpointIndex;
  localStorage.setItem(SAVE_KEY,JSON.stringify(saved));continueCampaign();assert(components[0].repaired&&xp===47&&player.x===0&&player.y===0&&checkpointX===0,'v1 save/zero coordinate regression');
});
test('architecture: custom repair UI mounts, completes and disposes',()=>{
  let disposed=0;
  ByteRunner.repairs.register('test-button',()=>({
    blocksWorld:true,
    mount(container) {
      const button=document.createElement('button');button.id='test-repair-button';button.textContent='Conectar';
      button.addEventListener('click',()=>{this.progress=1;this.status='success';});container.append(button);
    },
    dispose(){disposed++;}
  }));
  setup(0);components[0].repair={type:'test-button'};player.x=components[0].x;player.y=components[0].y-4;keys.add('e');updateRepair(.016);
  assert(document.getElementById('test-repair-button')&&!components[0].repaired,'custom repair UI did not mount');
  document.getElementById('test-repair-button').click();updateRepair(.016);
  assert(components[0].repaired&&xp===30&&disposed===1&&!document.getElementById('test-repair-button'),'repair UI completion/cleanup');
});
test('architecture: per-map enemy controller and state',()=>{
  let updates=0;
  ByteRunner.levels.registerEnemyBehavior('test-daemon',(enemy,state)=>{enemy.state.ticks=(enemy.state.ticks || 0)+1;updates++;assert(state.context.player()===player,'enemy context missing');});
  setup(0);viruses[0].controller='test-daemon';player.x=viruses[0].x;player.y=viruses[0].y-24;updateEnemyBrain(viruses[0],.016,player.x,player.y);
  assert(updates===1&&viruses[0].state.ticks===1,'enemy controller not invoked');
  saveCampaign();assert(getSavedCampaign().viruses[0].state.ticks===1,'enemy state not saved');
  continueCampaign();assert(viruses[0].state.ticks===1,'enemy state not restored');
});
running=false;
