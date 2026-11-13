setup(0);await levelVisuals.ready;endPhaseIntro();xpRequired=999999;
const original=ByteRunner.maps.clone(phaseData),start=mapStart();
report.hardware={definition:original,start,initial:{solids:ByteRunner.maps.clone(solids()),standingSpans:surfaces(),connections:levelRuntime.connections()},physics:{...ByteRunner.platformPhysics.base,jumpHeight:ByteRunner.platformPhysics.jumpHeight}};
test('hardware v3: actual campaign revision and six districts',()=>{assert(phaseData.revision===5&&phaseData.map.width===4480&&phaseData.map.height===2560,'not rebuilt');assert(phaseData.map.regions.length===6&&phaseData.generation.rooms.length===22,'districts/rooms');assert(!ByteRunner.mapAudit.topology(phaseData).isolated.length,'disconnected room graph');});
const begin=performance.now();
const proof=await ByteRunner.mapRebuildV3.audit(phaseData,{jumps:[],landings:[]});
report.hardware.proof=proof;report.hardware.auditMs=performance.now()-begin;
const baselineProof=await ByteRunner.mapRebuildV3.audit(HARDWARE_V3_BASELINE,{jumps:[],landings:[]});
report.hardware.baselineProof=baselineProof;
report.hardware.reachableStaticBandRatio=proof.area.reachableStaticBandPixels/baselineProof.area.reachableStaticBandPixels;
test('hardware v3: mandatory routes and objectives proven with base physics',()=>assert(proof.ok,proof.errors.join('; ')));
test('hardware v3: every room has a physically reached standing surface',()=>assert(!proof.traversal.unreachableRooms.length,proof.traversal.unreachableRooms.join(',')));
test('hardware v3: all permanent route surfaces are reached, including vault interiors',()=>{const missing=proof.traversal.unproven.filter(n=>!n.id.includes(':roof'));assert(!missing.length,missing.map(n=>n.id).join(','));});
test('hardware v3: no optional abilities in proof',()=>assert(!unlockedSkills.length&&player.jumpPower===690&&player.damage===1,'optional abilities'));
report.hardware.seedAudits=[];
for(const seed of ['hardware-v3-alpha','hardware-v3-beta','hardware-v3-gamma']){
  const recipe=ByteRunner.maps.clone(original.generation.recipe);recipe.seed=seed;
  const a=ByteRunner.mapGeneration.compile(recipe),b=ByteRunner.mapGeneration.compile(recipe),audit=await ByteRunner.mapRebuildV3.audit(a,{jumps:[],landings:[]});
  test('hardware v3: deterministic validated hybrid seed '+seed,()=>{assert(JSON.stringify(a)===JSON.stringify(b),'non deterministic');assert(audit.ok&&!audit.traversal.unproven.some(n=>!n.id.includes(':roof')),audit.errors.join('; '));});
  report.hardware.seedAudits.push({seed,ok:audit.ok,signature:ByteRunner.mapAudit.signature(a),errors:audit.errors});
}
test('hardware v3: every room seam works both ways in actual movePlayer',()=>{
  const rooms=new Map(phaseData.generation.rooms.map(r=>[r.id,r]));
  const travel=(x,y,target,jump)=>{player.x=x;player.y=y;player.vx=0;player.vy=0;player.grounded=true;jumpQueued=jump;for(let t=0;t<180;t++){keys.clear();if(Math.abs(target-player.x)>2)keys.add(target>player.x?'d':'a');movePlayer(1/120);}keys.clear();};
  for(const link of phaseData.generation.links){const a=rooms.get(link.from.room),b=rooms.get(link.to.room);
    if(link.from.socket==='east'){
      travel(a.x+568,a.y+416,b.x+64,false);assert(player.x>b.x+32&&Math.abs(player.y-b.y-416)<2,'east '+a.id);
      travel(b.x+64,b.y+416,a.x+560,false);assert(player.x<a.x+600&&Math.abs(player.y-a.y-416)<2,'west '+b.id);
    }else{
      travel(a.x+160,a.y+416,b.x+300,false);assert(player.y>=b.y-48&&player.y<b.y+64,'down '+a.id);
      travel(b.x+300,b.y-32,a.x+128,true);assert(player.y===a.y+416&&player.grounded,'up '+b.id);
    }
  }
});
test('hardware v3: all checkpoints survive actual respawn and one second physics',()=>{
  for(const [i,c] of phaseData.map.checkpoints.entries()){
    checkpointIndex=i;checkpointX=c.x;checkpointY=c.y;respawnAtCheckpoint();const x=player.x,y=player.y;
    keys.clear();for(let t=0;t<120;t++)movePlayer(1/120);
    assert(Math.abs(player.x-x)<1&&Math.abs(player.y-y)<1&&player.grounded,'checkpoint '+i);
  }
});
test('hardware v3: actual circuit minigames and repair effects',()=>{
  for(const c of components){
    player.x=c.x;player.y=c.y;keys.add('e');updateRepair(0);keys.clear();
    assert(repairSession?.model,'no challenge '+c.id);solveRepairUI();updateRepair(.6);assert(c.repaired,'not repaired '+c.id);
    assert(solids().some(s=>s.id===c.id.split(':')[0]+':powered-bridge'),'repair bridge absent '+c.id);
  }
});
report.hardware.repairedComponentsOnly={solids:ByteRunner.maps.clone(solids()),standingSpans:surfaces(),connections:levelRuntime.connections()};
test('hardware v3: safe repair shortcuts use real portal interaction',()=>{
  for(const link of levelRuntime.connections()){
    player.x=link.x;player.y=link.y+link.height-player.height;
    levelRuntime.update(.6,{keys:new Set(),repairNearby:false});levelRuntime.update(.016,{keys:new Set(['e']),repairNearby:false});
    assert(player.x===link.to.x&&player.y===link.to.y,'portal failed '+link.id);
    assert(!solids().some(s=>s.collision!=='one-way'&&overlaps(player,s)),'portal embedded');
  }
});
test('hardware v3: lifts carry R-07 and temporary platforms return',()=>{
  const lift=phaseData.entities.platforms.find(p=>p.type==='moving');advancePlatformMotion(.1);const s=platformShape(lift);player.x=s.x+24;player.y=s.y-player.height;player.grounded=true;const y=player.y;advancePlatformMotion(.1);assert(player.y!==y,'lift does not carry');
  const temp=phaseData.entities.platforms.find(p=>p.type==='temporary');assert(platformShape(temp),'temporary starts absent');player.x=temp.x+24;player.y=temp.y-player.height;player.vy=0;player.grounded=true;keys.clear();movePlayer(1/120);assert(getPlatformState(temp).triggered,'landing did not trigger temporary');for(let t=0;t<(temp.duration+.1)*120;t++)update(1/120);assert(!platformShape(temp),'temporary does not disappear');player.x=start.x;player.y=start.y;for(let t=0;t<(temp.respawnDelay+.1)*120;t++)update(1/120);assert(platformShape(temp),'temporary does not return');
});
test('hardware v3: thermal and electric hazards have warning, safe and active windows',()=>{for(const m of phaseData.mechanics.filter(m=>m.type==='parkour-hazards'))for(const h of m.hazards){assert(ByteRunner.parkourHazards.status(h,0)==='warning','no warning');assert(ByteRunner.parkourHazards.status(h,h.warning+.1)==='active','no active window');assert(ByteRunner.parkourHazards.status(h,h.period-.1)==='safe','no safe window');}});
test('hardware v3: every cache is reachable by actual jump and collection',()=>{
  for(const item of collectibles){
    const nodes=proof.traversal.reached.filter(n=>n.a<=item.x+34&&n.z+34>=item.x-34&&item.y>=n.y-140&&item.y<=n.y+80);
    for(const n of nodes){player.x=Math.max(n.a,Math.min(n.z,item.x-17));player.y=n.y;player.vy=0;player.grounded=true;jumpQueued=true;keys.clear();for(let t=0;t<100&&!item.collected;t++){movePlayer(1/120);updateCollectibles(1/120);}if(item.collected)break;}
    assert(item.collected,'cache unreachable '+item.id);
  }
});
report.hardware.combat=[];
for(const enemy of viruses){
  test('hardware v3: projectile combat '+enemy.id,()=>{
    const options=proof.traversal.reached.flatMap(n=>[n.a,n.z,(n.a+n.z)/2].map(x=>({n,x,score:Math.abs(Math.abs(x-enemy.x)-140)+Math.abs(n.y+22-enemy.y)*3}))).filter(p=>Math.abs(p.n.y+22-enemy.y)<80&&Math.abs(p.x-enemy.x)<600).sort((a,b)=>a.score-b.score);
    for(const p of options.slice(0,8)){
      player.x=p.x;player.y=p.n.y;player.vy=0;player.grounded=true;keys.clear();keys.add('j');damageCooldown=99999;projectiles=[];
      for(let t=0;t<800&&enemy.alive;t++){player.facing=enemy.x>=player.x+17?1:-1;movePlayer(1/120);updateCombat(1/120);}if(!enemy.alive)break;
    }
    keys.clear();assert(!enemy.alive,'enemy not defeated');report.hardware.combat.push(enemy.id);
  });
}
test('hardware v3: completion requires repairs and enemies, then educational question',()=>{
  checkObjectives();assert(phaseExitUnlocked,'objectives not unlocked');
  player.x=phaseData.map.exit.x;player.y=phaseData.map.exit.y;checkObjectives();update(.016);
  assert(phaseQuestionOpen,'exit question absent');ui.questionOverlay.querySelector('[data-correct="true"]').click();ui.questionOverlay.querySelector('.question-action').click();
  assert(phaseTransition,'question did not complete phase');
});
test('hardware v3: revision 3 save migrates to new entry and preserves XP/skills',()=>{
  setup(0);xp=47;unlockedSkills=[{id:'cannon',level:2}];restoreSkillEffects();saveCampaign();const saved=getSavedCampaign();saved.mapRevision=3;saved.player.x=2400;saved.player.y=500;saved.checkpointX=1850;localStorage.setItem(SAVE_KEY,JSON.stringify(saved));continueCampaign();
  assert(player.x===mapStart().x&&player.y===mapStart().y&&xp===47&&player.damage===1&&skillRank('cannon')===2&&components.every(c=>!c.repaired),'migration');
});
test('hardware v3: new save preserves repaired devices and checkpoint',()=>{
  setup(0);components[0].repaired=true;checkpointIndex=2;checkpointX=phaseData.map.checkpoints[2].x;checkpointY=phaseData.map.checkpoints[2].y;respawnAtCheckpoint();saveCampaign();continueCampaign();assert(components[0].repaired&&checkpointIndex===2,'new save lost progress');
});
setup(0);await levelVisuals.ready;endPhaseIntro();
animationTime=2;damageCooldown=0;
const oldView={width,height,pixelRatio,cameraX,cameraY,cw:canvas.width,ch:canvas.height};
width=worldWidth();height=worldHeight();pixelRatio=1;cameraX=0;cameraY=0;canvas.width=width;canvas.height=height;ctx.setTransform(1,0,0,1,0,0);draw();report.snapshots.push({phase:1,position:'v3-overview',image:captureCanvas()});
width=oldView.width;height=oldView.height;pixelRatio=oldView.pixelRatio;canvas.width=oldView.cw;canvas.height=oldView.ch;ctx.setTransform(pixelRatio,0,0,pixelRatio,0,0);
for(const region of phaseData.map.regions){const a=region.areas[0];cameraX=Math.max(0,Math.min(worldWidth()-width,a.x));cameraY=Math.max(0,Math.min(worldHeight()-height,a.y));player.x=a.x+80;player.y=a.y+416;draw();report.snapshots.push({phase:1,position:'v3-'+region.id,image:captureCanvas()});}
test('hardware v3: regional parallax follows vertical and horizontal districts',()=>{for(const r of phaseData.map.regions){const a=r.areas[0],zone=levelVisuals.parallax.life.region({x:a.x,y:a.y,width:640,height:512});assert(zone.labels[0]===r.name,'wrong district '+r.id);}});
test('hardware v3: pixel art assets load and nearest neighbor stays enabled',()=>assert(!levelVisuals.errors.length&&!ctx.imageSmoothingEnabled,'art failure'));
test('hardware v3: streamed terrain releases evicted and disposed canvas storage',()=>{
  const terrain=ByteRunner.environmentArt.terrain(),shape={id:'stream-test',x:0,y:0,w:100000,h:64,type:'fixed',collision:'solid'};
  terrain.sync([shape]);const first=terrain.chunk(shape,0,0,levelVisuals,'terrain-01');
  for(let i=1;i<=96;i++)terrain.chunk(shape,i*256,0,levelVisuals,'terrain-01');
  assert(first.width===0&&first.height===0&&terrain.cacheSize===96,'evicted bitmap retained');
  const last=terrain.chunk(shape,96*256,0,levelVisuals,'terrain-01');terrain.dispose();assert(last.width===0&&terrain.cacheBytes===0,'disposed bitmap retained');
});
report.hardware.renderSamples=[];
const renderView={width,height,pixelRatio,cw:canvas.width,ch:canvas.height};
for(const [w,h] of [[640,360],[905,644],[1280,720],[1920,1080]]){
  width=w;height=h;pixelRatio=1;canvas.width=w;canvas.height=h;const times=[];
  for(let frame=0;frame<150;frame++){
    const progress=(frame%60)/59;cameraX=Math.floor((worldWidth()-width)*progress);cameraY=Math.floor((worldHeight()-height)*(1-progress));animationTime=2+frame/60;
    const before=performance.now();draw();if(frame>=30)times.push(performance.now()-before);
  }
  times.sort((a,b)=>a-b);
  const steady=[];
  for(const district of phaseData.map.regions){const a=district.areas[0];for(let frame=0;frame<60;frame++){
    cameraX=Math.floor(Math.max(0,Math.min(worldWidth()-width,a.x+frame*4.25)));cameraY=Math.floor(Math.max(0,Math.min(worldHeight()-height,a.y+Math.sin(frame/20)*48)));animationTime=2+frame/60;
    const before=performance.now();draw();if(frame>=15)steady.push(performance.now()-before);
  }}
  steady.sort((a,b)=>a-b);report.hardware.renderSamples.push({logicalCanvas:[w,h],stress:{motion:'full-map diagonal scan in 60 frames, including abrupt reversals; exceeds player speed',samples:times.length,medianDrawMs:times[Math.floor(times.length*.5)],p95DrawMs:times[Math.floor(times.length*.95)]},normalMotion:{motion:'4.25 horizontal px/frame, subtle vertical drift, six districts, 15 warmup frames per district',samples:steady.length,medianDrawMs:steady[Math.floor(steady.length*.5)],p95DrawMs:steady[Math.floor(steady.length*.95)]},terrainChunks:levelVisuals.terrain.cacheSize,terrainBytes:levelVisuals.terrain.cacheBytes,parallaxBytes:levelVisuals.parallax.stats.totalBytes});
}
test('hardware v3: large-map caches stay within existing limits across resolutions',()=>{for(const row of report.hardware.renderSamples)assert(row.terrainChunks<=96&&row.parallaxBytes<=4.25*1024*1024,'cache limit '+row.logicalCanvas);});
width=renderView.width;height=renderView.height;pixelRatio=renderView.pixelRatio;canvas.width=renderView.cw;canvas.height=renderView.ch;
report.hardware.duration={humanMinutes:null,note:'Automated probes relocate between proven edges and protect from damage; not a duration/balance playtest.'};
running=false;
