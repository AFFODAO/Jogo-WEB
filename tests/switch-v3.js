const swClone=ByteRunner.maps.clone;
setup(2);await levelVisuals.ready;endPhaseIntro();xpRequired=999999;
const swOriginal=swClone(phaseData),swStart=mapStart();
const swSnapshot=()=>({solids:swClone(solids()),standingSpans:surfaces(),connections:swClone(levelRuntime.connections())});
const swShapes=()=>solids().filter(s=>!['moving','temporary','falling'].includes(s.type));
const swReach=()=>ByteRunner.mapAudit.analyze(phaseData,swShapes(),[],mapStart(),{yieldEvery:12});
const swNear=(nodes,c)=>nodes.find(n=>Math.abs(c.y+(c.height||44)/2-n.y-24)<=78&&n.z+17>=c.x+(c.width||34)/2-76&&n.a+17<=c.x+(c.width||34)/2+76);
report.switch={definition:swOriginal,physics:{...ByteRunner.platformPhysics.base,jumpHeight:ByteRunner.platformPhysics.jumpHeight},initial:swSnapshot(),progression:[]};
test('switch v3: radial physical sectors and preserved campaign identity',()=>{assert(phaseData.id==='phase-03'&&phaseData.revision===5&&phaseData.map.regions.length===6,'identity');assert(phaseData.generation.rooms.length===25&&phaseData.generation.links.length===36&&phaseData.generation.architecture.mode==='radial-physical-backplane','new architecture');assert(phaseData.map.width!==PHASES[0].map.width||phaseData.map.height!==PHASES[0].map.height,'Hardware silhouette reused');});
test('switch v3: no optional abilities or forced completion flags',()=>assert(!unlockedSkills.length&&player.jumpPower===690&&player.damage===1&&!phaseExitUnlocked,'optional powers'));
let swProof;
for(let round=0;round<=components.length;round++){
  swProof=await swReach();report.switch.progression.push({repairs:components.filter(c=>c.repaired).map(c=>c.id),accessible:swProof.repairs,exit:swProof.exitReached,reachedSurfaces:swProof.reached.length});
  const next=components.find(c=>!c.repaired&&swProof.repairs.find(r=>r.id===c.id)?.reached);
  if(!next)break;
  test('switch v3: real minigame and repair '+next.id,()=>{const n=swNear(swProof.reached,next);assert(n,'no standable interaction');player.x=Math.max(n.a,Math.min(n.z,next.x));player.y=n.y;keys.add('e');updateRepair(0);keys.clear();assert(repairSession?.model,'challenge absent');solveRepairUI();updateRepair(.6);assert(next.repaired,'repair failed');});
}
test('switch v3: both Ethernet switches are physically reachable and really activated',()=>{
  for(const port of phaseData.entities.interactives){const n=swNear(swProof.reached,port);assert(n,'unreachable port '+port.id);player.x=port.x;player.y=port.y-8;levelRuntime.update(.6,{keys:new Set(),repairNearby:false});levelRuntime.update(.016,{keys:new Set(['e']),repairNearby:Boolean(findNearbyComponent())});assert(levelRuntime.getFlag(port.flag),'activation failed');}
});
swProof=await swReach();
report.switch.proof=swProof;report.switch.repairedComponentsOnly=swSnapshot();
report.switch.reachableStaticBand=ByteRunner.mapRebuildV3.navigationArea(swProof.reached,swShapes(),worldWidth(),worldHeight());
test('switch v3: fixed-point repair progression reaches all six objectives and exit',()=>assert(components.length===6&&components.every(c=>c.repaired)&&swProof.exitReached&&swProof.spawnSupported,'repair deadlock or unreachable exit'));
test('switch v3: every sector and permanent route surface reached',()=>{assert(!swProof.unreachableRooms.length,swProof.unreachableRooms.join(','));const missing=swProof.unproven.filter(n=>!n.id.includes(':rim')&&!n.id.includes(':chassis'));assert(!missing.length,missing.map(n=>n.id).join(','));});
test('switch v3: all earned return cables execute and arrive on permanent support',()=>{
  for(const link of levelRuntime.connections()){
    player.x=link.x+4;player.y=link.y+link.height-player.height;player.vx=0;player.vy=0;
    levelRuntime.update(.6,{keys:new Set(),repairNearby:false});levelRuntime.update(.016,{keys:new Set(['e']),repairNearby:Boolean(findNearbyComponent())});
    assert(player.x===link.to.x&&player.y===link.to.y,'portal did not execute '+link.id);
    const shapes=swShapes();assert(!shapes.some(s=>s.collision!=='one-way'&&overlaps(player,s)),'embedded '+link.id);
    assert(shapes.some(s=>Math.abs(s.y-player.y-player.height)<1&&player.x>=s.x&&player.x+player.width<=s.x+s.w),'unsupported '+link.id);
    const x=player.x,y=player.y;levelRuntime.update(.7,{keys:new Set(['e']),repairNearby:false});assert(player.x===x&&player.y===y,'held E portal loop');
  }
});
test('switch v3: every room seam works both ways in actual movePlayer',()=>{
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
test('switch v3: all checkpoints survive actual respawn',()=>{for(const [i,c] of phaseData.map.checkpoints.entries()){checkpointIndex=i;checkpointX=c.x;checkpointY=c.y;respawnAtCheckpoint();const x=player.x,y=player.y;keys.clear();for(let t=0;t<120;t++)movePlayer(1/120);assert(player.x===x&&Math.abs(player.y-y)<1&&player.grounded,'checkpoint '+i);}});
test('switch v3: every optional file is collectible with base movement',()=>{for(const item of collectibles){const nodes=swProof.reached.filter(n=>n.a<=item.x+34&&n.z+34>=item.x-34&&item.y>=n.y-140&&item.y<=n.y+80);for(const n of nodes){player.x=Math.max(n.a,Math.min(n.z,item.x-17));player.y=n.y;player.vy=0;player.grounded=true;jumpQueued=true;keys.clear();for(let t=0;t<110&&!item.collected;t++){movePlayer(1/120);updateCollectibles(1/120);}if(item.collected)break;}assert(item.collected,'file unreachable '+item.id);}});
test('switch v3: elevators carry and temporary packet bridges return',()=>{
  const p=phaseData.entities.platforms.find(p=>p.type==='moving'&&p.motion.axis==='x');advancePlatformMotion(.1);const s=platformShape(p);player.x=s.x+24;player.y=s.y-player.height;player.grounded=true;const x=player.x;advancePlatformMotion(.1);assert(player.x!==x,'moving interface does not carry');
  const temp=phaseData.entities.platforms.find(p=>p.type==='temporary');player.x=temp.x+24;player.y=temp.y-player.height;player.vy=0;keys.clear();movePlayer(1/120);assert(getPlatformState(temp).triggered,'page not triggered');for(let t=0;t<(temp.duration+.1)*120;t++)update(1/120);assert(!platformShape(temp),'page did not disappear');player.x=swStart.x;player.y=swStart.y;for(let t=0;t<(temp.respawnDelay+.1)*120;t++)update(1/120);assert(platformShape(temp),'page did not return');
});
report.switch.combat=[];
for(const enemy of viruses)test('switch v3: basic projectile combat '+enemy.id,()=>{
  const options=swProof.reached.flatMap(n=>[n.a,n.z,(n.a+n.z)/2].map(x=>({n,x,score:Math.abs(Math.abs(x-enemy.x)-140)+Math.abs(n.y+22-enemy.y)*3}))).filter(p=>Math.abs(p.n.y+22-enemy.y)<80&&Math.abs(p.x-enemy.x)<600).sort((a,b)=>a.score-b.score);
  for(const p of options.slice(0,10)){player.x=p.x;player.y=p.n.y;player.vy=0;player.grounded=true;keys.clear();keys.add('j');damageCooldown=99999;projectiles=[];for(let t=0;t<1000&&enemy.alive;t++){player.facing=enemy.x>=player.x+17?1:-1;movePlayer(1/120);updateCombat(1/120);}if(!enemy.alive)break;}keys.clear();assert(!enemy.alive,'undefeated');report.switch.combat.push(enemy.id);
});
test('switch v3: exit restores connectivity and requires educational question',()=>{checkObjectives();assert(phaseExitUnlocked,'objectives not complete');player.x=phaseData.map.exit.x;player.y=phaseData.map.exit.y;update(.016);assert(phaseQuestionOpen,'question missing');ui.questionOverlay.querySelector('[data-correct="true"]').click();ui.questionOverlay.querySelector('.question-action').click();assert(phaseTransition,'completion missing');});
test('switch v3: old save restarts safely with XP and abilities intact',()=>{setup(2);xp=47;unlockedSkills=[{id:'cannon',level:2}];restoreSkillEffects();saveCampaign();const saved=getSavedCampaign();saved.mapRevision=3;saved.player.x=1500;saved.player.y=1202;localStorage.setItem(SAVE_KEY,JSON.stringify(saved));continueCampaign();assert(player.x===mapStart().x&&player.y===mapStart().y&&xp===47&&player.damage===3&&components.every(c=>!c.repaired),'migration');});
test('switch v3: new save preserves repairs and checkpoint',()=>{setup(2);components[0].repaired=true;checkpointIndex=2;checkpointX=phaseData.map.checkpoints[2].x;checkpointY=phaseData.map.checkpoints[2].y;respawnAtCheckpoint();saveCampaign();continueCampaign();assert(components[0].repaired&&checkpointIndex===2,'resume');});
// Apply the same static-plus-portal proof to the preserved original map.
setup(2);loadMap(SWITCH_V3_BASELINE,true);components.forEach(c=>c.repaired=true);
const baselineProof=await swReach();report.switch.baselineProof=baselineProof;
report.switch.baselineReachableStaticBand=ByteRunner.mapRebuildV3.navigationArea(baselineProof.reached,swShapes(),worldWidth(),worldHeight());
report.switch.reachableStaticBandRatio=report.switch.reachableStaticBand/report.switch.baselineReachableStaticBand;
test('switch v3: useful reachable area grew at least threefold',()=>assert(report.switch.reachableStaticBandRatio>=3,'expansion is mostly void'));
report.switch.seedAudits=[];
for(const seed of ['switch-v3-alpha','switch-v3-beta','switch-v3-gamma']){
  const recipe=swClone(swOriginal.generation.recipe);recipe.seed=seed;const a=ByteRunner.mapGeneration.compile(recipe),b=ByteRunner.mapGeneration.compile(recipe);
  setup(2);loadMap(a,true);components.forEach(c=>c.repaired=true);phaseData.entities.interactives.forEach(p=>levelRuntime.setFlag(p.flag));const proof=await swReach();
  test('switch v3: deterministic validated service-cache seed '+seed,()=>{assert(JSON.stringify(a)===JSON.stringify(b),'non deterministic');assert(proof.exitReached&&!proof.unreachableRooms.length&&!proof.unproven.some(n=>!n.id.includes(':rim')&&!n.id.includes(':chassis')),'seed leaves inaccessible geometry');});
  report.switch.seedAudits.push({seed,exitReached:proof.exitReached,unreachableRooms:proof.unreachableRooms,signature:ByteRunner.mapAudit.signature(a)});
}
setup(2);await levelVisuals.ready;endPhaseIntro();animationTime=2;damageCooldown=0;
test('switch v3: core lock requires six repairs and both ports',()=>{assert(solids().some(s=>s.id==='core-exit:connectivity-lock'),'core lock missing');assert(report.switch.progression[0].exit===false,'initial exit already reached');assert(!report.switch.progression[0].accessible.find(r=>r.id==='core-guard:fabric').reached,'core repair opened before outer circuits');});
test('switch v3: portable pixel art and six spatial parallax districts',()=>{assert(!levelVisuals.errors.length&&!ctx.imageSmoothingEnabled,'pixel art failure');for(const region of phaseData.map.regions){const a=region.areas[0],zone=levelVisuals.parallax.life.region({x:a.x,y:a.y,width:a.width,height:a.height});assert(zone.labels[0]===region.name,'wrong district '+region.id);}});
const viewBefore={width,height,pixelRatio,cw:canvas.width,ch:canvas.height};
width=worldWidth();height=worldHeight();pixelRatio=1;cameraX=0;cameraY=0;canvas.width=width;canvas.height=height;ctx.setTransform(1,0,0,1,0,0);draw();report.snapshots.push({phase:3,position:'switch-v3-overview',image:captureCanvas()});
width=viewBefore.width;height=viewBefore.height;pixelRatio=viewBefore.pixelRatio;canvas.width=viewBefore.cw;canvas.height=viewBefore.ch;
for(const region of phaseData.map.regions){const a=region.areas[0];cameraX=Math.max(0,Math.min(worldWidth()-width,a.x));cameraY=Math.max(0,Math.min(worldHeight()-height,a.y+a.height-height));player.x=a.x+96;player.y=a.y+a.height-96;draw();report.snapshots.push({phase:3,position:'switch-v3-'+region.id,image:captureCanvas()});}
report.switch.renderSamples=[];
for(const [w,h] of [[640,360],[905,644],[1280,720],[1920,1080]]){
  width=w;height=h;pixelRatio=1;canvas.width=w;canvas.height=h;const times=[];
  for(const region of phaseData.map.regions){const a=region.areas[0];for(let frame=0;frame<60;frame++){cameraX=Math.floor(Math.max(0,Math.min(worldWidth()-w,a.x+frame*4.25)));cameraY=Math.floor(Math.max(0,Math.min(worldHeight()-h,a.y+a.height-h+Math.sin(frame/20)*32)));animationTime=2+frame/60;const begin=performance.now();draw();if(frame>=15)times.push(performance.now()-begin);}}
  times.sort((a,b)=>a-b);report.switch.renderSamples.push({logicalCanvas:[w,h],samples:times.length,medianDrawMs:times[Math.floor(times.length*.5)],p95DrawMs:times[Math.floor(times.length*.95)],terrainChunks:levelVisuals.terrain.cacheSize,terrainBytes:levelVisuals.terrain.cacheBytes,parallaxBytes:levelVisuals.parallax.stats.totalBytes});
}
test('switch v3: visible rendering stays within shared cache limits',()=>{for(const row of report.switch.renderSamples)assert(row.terrainChunks<=96&&row.parallaxBytes<=4.25*1024*1024,'cache overflow');});
width=viewBefore.width;height=viewBefore.height;pixelRatio=viewBefore.pixelRatio;canvas.width=viewBefore.cw;canvas.height=viewBefore.ch;
test('switch v3: initial locks, mandatory ports and negative disconnected recipe',()=>{
  setup(2);assert(solids().some(s=>s.id==='service-west:concealed-shaft'),'service cache starts open');
  components.forEach(c=>c.repaired=true);viruses.forEach(v=>v.alive=false);checkObjectives();assert(!phaseExitUnlocked,'ports bypassed');
  const recipe=swClone(swOriginal.generation.recipe);recipe.links=recipe.links.filter(l=>l.from.room!=='port01'&&l.to.room!=='port01');let rejected=false;
  try{ByteRunner.mapGeneration.compile(recipe);}catch(e){rejected=e.message.includes('Disconnected');}assert(rejected,'disconnected radial spoke accepted');
});
test('switch v3: electrical warning and safe windows cause actual timed damage',()=>{
  setup(2);const h=phaseData.mechanics.find(m=>m.type==='parkour-hazards').hazards[0];player.x=h.x;player.y=h.y;player.health=100;damageCooldown=0;
  levelRuntime.update(h.warning-.1,{keys:new Set(),repairNearby:false});assert(player.health===100,'warning damages player');
  levelRuntime.update(.2,{keys:new Set(),repairNearby:false});assert(player.health===100-h.damage,'active current causes no damage');
  damageCooldown=0;levelRuntime.update(h.active+.1,{keys:new Set(),repairNearby:false});assert(player.health===100-h.damage,'safe window damages player');
});
report.switch.duration={humanMinutes:null,targetMinutes:[15,25],limitations:'Probes relocate between proven surfaces, solve puzzles through DOM and protect against combat damage; not an uninterrupted playthrough.'};
running=false;
