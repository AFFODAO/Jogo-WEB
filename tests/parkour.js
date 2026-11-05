const parkourMaps=ByteRunner.proceduralMaps;
function parkourSetup(seed='pcb-alpha',difficulty=3){
  setup(0);loadMap(parkourMaps.generate({seed,roomCount:12,difficulty,optionalRatio:.4}),true);
  campaignStarted=false;running=true;paused=false;xpRequired=999999;damageCooldown=0;keys.clear();endPhaseIntro();
}
test('parkour: shared jump envelope agrees with real 30/60/144Hz movement',()=>{
  const physics=ByteRunner.platformPhysics;
  assert(physics.base.width===ROBOT_WIDTH&&physics.base.height===ROBOT_HEIGHT&&physics.base.speed===RUN_SPEED&&physics.base.jump===JUMP_SPEED&&physics.base.gravity===GRAVITY,'physics diverged');
  assert(Math.abs(physics.maxHorizontal-190.216)<.01&&Math.abs(physics.jumpHeight-128.676)<.01,'invalid ballistic envelope');
  for(const hz of [30,60,144]){
    parkourSetup();const map=ByteRunner.maps.clone(phaseData);map.map.width=1500;map.map.height=1000;map.map.start={x:100,y:752};map.map.ground.segments=[{id:'test-floor',x:0,y:800,width:1500,height:200}];map.entities.platforms=[];map.entities.obstacles=[];map.mechanics=[];loadMap(map,true);
    const startX=player.x,startY=player.y;let highest=startY;keys.add('d');jumpQueued=true;
    for(let i=0;i<hz*2;i++){movePlayer(1/hz);highest=Math.min(highest,player.y);if(player.grounded&&i>0)break;}
    keys.clear();assert(Math.abs(player.x-startX-physics.maxHorizontal)<RUN_SPEED/hz+1,'horizontal flight mismatch '+hz);assert(Math.abs(startY-highest-physics.jumpHeight)<1,'jump height mismatch '+hz);
  }
});
test('parkour: varied interiors, difficulty rhythm and conservative safety certificates',()=>{
  for(const difficulty of [1,3,5]){
    const map=parkourMaps.generate({seed:'pcb-beta',difficulty,roomCount:12,optionalRatio:.4});
    assert(!parkourMaps.validateParkour(map).length,'invalid movement envelope/checkpoint');
    const nodes=map.generation.graph.nodes;assert(new Set(nodes.map(n=>n.layout)).size>=6,'interiors are only recolors');
    assert(nodes[0].rest&&nodes[0].tier===1&&nodes.some(n=>n.type==='final'&&n.rest),'missing safe beginning/end');
    assert(nodes.some(n=>n.rest&&n.type!=='initial'&&n.type!=='final'),'no intermediate rest');
    assert(difficulty===1||nodes.some(n=>n.tier>=2),'no difficulty ramp');
    assert(map.entities.platforms.some(p=>p.type==='moving'&&p.motion.axis==='x')&&map.entities.platforms.some(p=>p.type==='moving'&&p.motion.axis==='y'),'missing two-axis movers');
    assert(map.entities.platforms.some(p=>p.type==='temporary')&&map.entities.platforms.some(p=>p.type==='falling'),'missing returning surfaces');
  }
});
test('parkour: horizontal shuttles and vertical elevators carry and release the player safely',()=>{
  parkourSetup();const movers=phaseData.entities.platforms.filter(p=>p.type==='moving');
  for(const spec of movers){
    animationTime=0;platformRuntime=new Map();const shape=platformShape(spec);player.x=shape.x+20;player.y=shape.y-player.height;player.vy=0;player.grounded=true;advancePlatformMotion(0);
    const initial={x:player.x,y:player.y};
    for(let t=0;t<90;t++){advancePlatformMotion(1/120);movePlayer(1/120);}
    const carried=platformShape(spec);assert(Math.abs(player.y+player.height-carried.y)<3&&player.x+player.width>carried.x&&player.x<carried.x+carried.w,'lost moving support '+spec.id);
    assert(Math.hypot(player.x-initial.x,player.y-initial.y)>5,'platform did not carry '+spec.id);
    // Jump away at the actual moving position, then find a permanent landing.
    const base=spec.id.split(':')[0],target=phaseData.entities.platforms.filter(p=>p.id.startsWith(base+':upper-')).sort((a,b)=>Math.abs(a.y-carried.y)-Math.abs(b.y-carried.y))[0];
    const launch=player.x;jumpQueued=true;
    for(let t=0;t<180;t++){keys.clear();if(target&&Math.abs(target.x+20-player.x)>3)keys.add(target.x+20>player.x?'d':'a');advancePlatformMotion(1/120);movePlayer(1/120);if(player.grounded&&t>4)break;}
    keys.clear();assert(player.grounded&&Math.abs(player.x-launch)>2,'could not leave mover '+spec.id);
    assert(phaseData.entities.platforms.some(p=>p.type==='fixed'&&Math.abs(player.y+player.height-p.y)<3&&player.x+player.width>p.x&&player.x<p.x+p.width)||phaseData.map.ground.segments.some(s=>Math.abs(player.y+player.height-s.y)<3&&player.x+player.width>s.x&&player.x<s.x+s.width),'mover did not permit a permanent landing '+spec.id);
    assert(!solids().some(s=>s.collision!=='one-way'&&overlaps(player,s)),'mover crushed player '+spec.id);
  }
});
test('parkour: temporary platforms disappear, wait for occupied space, return and reset on death',()=>{
  parkourSetup();const spec=phaseData.entities.platforms.find(p=>p.type==='temporary'),state=getPlatformState(spec);
  player.x=spec.x+8;player.y=spec.y-player.height-2;player.vy=120;player.grounded=false;movePlayer(1/60);assert(state.triggered,'landing failed to trigger timer');
  player.x=mapStart().x;player.y=mapStart().y;player.vy=0;
  for(let i=0;i<Math.ceil((spec.duration+.1)*60);i++)update(1/60);
  assert(!platformShape(spec),'temporary did not disappear');
  player.x=spec.x+8;player.y=spec.y+1;state.elapsed=spec.respawnDelay+.1;update(0);assert(!state.active,'temporary respawned inside player');
  player.x=mapStart().x;player.y=mapStart().y;update(0);assert(state.active&&platformShape(spec),'temporary failed to return');
  state.triggered=true;state.active=false;respawnAtCheckpoint();assert(platformShape(spec),'death left temporary disabled');
});
test('parkour: falling platforms warn, fall, return offscreen and wait for occupied space',()=>{
  parkourSetup();const spec=phaseData.entities.platforms.find(p=>p.type==='falling'),state=getPlatformState(spec);
  player.x=spec.x+8;player.y=spec.y-player.height-2;player.vy=120;player.grounded=false;movePlayer(1/60);assert(state.triggered,'falling landing not detected');
  advancePlatformMotion(0);for(let i=0;i<30;i++)advancePlatformMotion(1/60);assert(!state.drop,'warning time skipped');
  for(let i=0;i<24;i++)advancePlatformMotion(1/60);assert(state.drop>0&&platformShape(spec).y>spec.y,'platform did not fall');
  player.x=mapStart().x;player.y=mapStart().y;cameraX=0;cameraY=0;
  for(let i=0;i<60;i++)advancePlatformMotion(1/60);assert(!state.active,'falling platform never hid');
  player.x=spec.x+8;player.y=spec.y+1;for(let i=0;i<180;i++)advancePlatformMotion(1/60);assert(!state.active,'falling surface respawned inside player');
  player.x=mapStart().x;player.y=mapStart().y;advancePlatformMotion(0);assert(state.active&&!state.triggered&&platformShape(spec).y===spec.y,'falling platform failed to reset');
  state.active=false;state.triggered=true;respawnAtCheckpoint();assert(platformShape(spec),'death left falling disabled');
});
test('parkour: lasers and electricity warn before real damage and leave safe crossing windows',()=>{
  for(const kind of ['laser','electric']){
    parkourSetup();const original=phaseData.mechanics.filter(m=>m.type==='parkour-hazards').flatMap(m=>m.hazards).find(h=>h.kind===kind);assert(original,'missing '+kind);
    const map=ByteRunner.maps.clone(phaseData),hazard={...original,phase:0};map.mechanics=[{id:'isolated-hazard',type:'parkour-hazards',hazards:[hazard]}];loadMap(map,true);damageCooldown=0;
    player.x=hazard.x;player.y=hazard.y;const initial=player.health;
    levelRuntime.update(.4,{keys:new Set()});assert(player.health===initial,'warning dealt damage '+kind);
    levelRuntime.update(.5,{keys:new Set()});assert(player.health<initial,'active hazard did not damage '+kind);
    damageCooldown=0;const damaged=player.health;levelRuntime.update(hazard.active+.2,{keys:new Set()});assert(player.health===damaged,'safe interval damaged player '+kind);
    assert(hazard.period-hazard.warning-hazard.active>ByteRunner.platformPhysics.flightTime+1,'crossing window too short');
  }
});
test('parkour: every checkpoint survives lethal damage and void falls, protection expires',()=>{
  for(const seed of ['pcb-alpha','pcb-beta','pcb-gamma']){
    parkourSetup(seed);levelRuntime.setFlag('test-progress');
    for(const point of phaseData.map.checkpoints){
      checkpointX=point.x;checkpointY=point.y;player.health=1;damageCooldown=0;damagePlayer(99,{x:player.x-20});
      assert(player.health===player.maxHealth&&player.y+player.height===point.y,'lethal hit failed respawn');
      assert(!solids().some(s=>s.collision!=='one-way'&&overlaps(player,s)),'respawn embedded in geometry');
      assert(levelRuntime.getFlag('test-progress'),'respawn lost progress');
      assert(cameraX>=0&&cameraY>=0&&player.x-cameraX>=0&&player.y-cameraY>=0,'respawn camera lost player');
      updateCombat(2.1);const hp=player.health;damagePlayer(8,{x:player.x-20});assert(player.health<hp,'permanent respawn protection');
      player.y=worldHeight()+181;movePlayer(0);assert(player.y+player.height===point.y,'void fall failed respawn');
    }
  }
});
setup(0);running=false;
test('parkour: 60 seeded configurations pass bounds, movement envelopes and spawn safety',()=>{
  for(let i=0;i<60;i++){
    const options={seed:'quality-'+i,roomCount:[8,12,24][i%3],difficulty:i%5+1,optionalRatio:[.2,.4,.7][i%3]};
    const map=parkourMaps.generate(options);assert(!parkourMaps.validateParkour(map).length,'quality failed '+JSON.stringify(options));
  }
});
test('parkour: advanced precision route is traversable both ways without transient platforms',()=>{
  setup(0);const map=ByteRunner.maps.clone(parkourMaps.generate({seed:'pcb-beta',roomCount:8,difficulty:5,optionalRatio:.2}));
  assert(map.entities.platforms.some(p=>p.width===72),'advanced precision challenge absent');
  map.entities.platforms=map.entities.platforms.filter(p=>p.type==='fixed');loadMap(map,true);campaignStarted=false;
  for(const start of [map.map.start,map.map.exit]){
    player.x=start.x;player.y=start.y;player.vy=0;player.grounded=true;
    const reached=reachability(),missed=map.map.checkpoints.filter(p=>!reached.some(n=>p.x>=n.a-1&&p.x<=n.z+1&&Math.abs(p.y-player.height-n.y)<2));
    assert(!missed.length,'advanced route from '+JSON.stringify(start)+' misses '+JSON.stringify(missed)+'; nodes '+JSON.stringify(map.generation.graph.nodes.map(n=>({id:n.id,type:n.type,x:n.x,y:n.y,layout:n.layout,tier:n.tier})))+'; reached '+JSON.stringify(reached.map(n=>n.id)));
  }
  setup(0);running=false;
});
