const swClone=ByteRunner.maps.clone;
setup(1);await levelVisuals.ready;endPhaseIntro();xpRequired=999999;
const swOriginal=swClone(phaseData),swStart=mapStart();
const swSnapshot=()=>({solids:swClone(solids()),standingSpans:surfaces(),connections:swClone(levelRuntime.connections())});
const swShapes=()=>solids().filter(s=>!['moving','temporary','falling'].includes(s.type));
const swReach=()=>ByteRunner.mapAudit.analyze(phaseData,swShapes(),levelRuntime.connections(),mapStart(),{yieldEvery:12});
const swNear=(nodes,c)=>nodes.find(n=>Math.abs(c.y+(c.height||44)/2-n.y-24)<=78&&n.z+17>=c.x+(c.width||34)/2-76&&n.a+17<=c.x+(c.width||34)/2+76);
report.software={definition:swOriginal,physics:{...ByteRunner.platformPhysics.base,jumpHeight:ByteRunner.platformPhysics.jumpHeight},initial:swSnapshot(),progression:[]};
test('software v3: new window constellation and preserved campaign identity',()=>{assert(phaseData.id==='phase-02'&&phaseData.revision===5&&phaseData.map.regions.length===6,'identity');assert(phaseData.generation.rooms.length===19&&phaseData.generation.recipe.connectivity==='portal-network','new architecture');assert(phaseData.map.width!==PHASES[0].map.width&&phaseData.map.height!==PHASES[0].map.height,'Hardware silhouette reused');});
test('software v3: no optional abilities or forced completion flags',()=>assert(!unlockedSkills.length&&player.jumpPower===690&&player.damage===1&&!phaseExitUnlocked,'optional powers'));
let swProof;
for(let round=0;round<=components.length;round++){
  swProof=await swReach();report.software.progression.push({repairs:components.filter(c=>c.repaired).map(c=>c.id),accessible:swProof.repairs,exit:swProof.exitReached,reachedSurfaces:swProof.reached.length});
  const next=components.find(c=>!c.repaired&&swProof.repairs.find(r=>r.id===c.id)?.reached);
  if(!next)break;
  test('software v3: real minigame and repair '+next.id,()=>{const n=swNear(swProof.reached,next);assert(n,'no standable interaction');player.x=Math.max(n.a,Math.min(n.z,next.x));player.y=n.y;keys.add('e');updateRepair(0);keys.clear();assert(repairSession?.model,'challenge absent');solveRepairUI();updateRepair(.6);assert(next.repaired,'repair failed');});
}
report.software.proof=swProof;report.software.repairedComponentsOnly=swSnapshot();
report.software.reachableStaticBand=ByteRunner.mapRebuildV3.navigationArea(swProof.reached,swShapes(),worldWidth(),worldHeight());
test('software v3: fixed-point repair progression reaches all five objectives and exit',()=>assert(components.length===5&&components.every(c=>c.repaired)&&swProof.exitReached&&swProof.spawnSupported,'repair deadlock or unreachable exit'));
test('software v3: every window and permanent route surface reached',()=>{assert(!swProof.unreachableRooms.length,swProof.unreachableRooms.join(','));const missing=swProof.unproven.filter(n=>!n.id.includes(':title-frame'));assert(!missing.length,missing.map(n=>n.id).join(','));});
test('software v3: all portal pairs execute and arrive on permanent support',()=>{
  for(const link of levelRuntime.connections()){
    player.x=link.x+4;player.y=link.y+link.height-player.height;player.vx=0;player.vy=0;
    levelRuntime.update(.6,{keys:new Set(),repairNearby:false});levelRuntime.update(.016,{keys:new Set(['e']),repairNearby:Boolean(findNearbyComponent())});
    assert(player.x===link.to.x&&player.y===link.to.y,'portal did not execute '+link.id);
    const shapes=swShapes();assert(!shapes.some(s=>s.collision!=='one-way'&&overlaps(player,s)),'embedded '+link.id);
    assert(shapes.some(s=>Math.abs(s.y-player.y-player.height)<1&&player.x>=s.x&&player.x+player.width<=s.x+s.w),'unsupported '+link.id);
    const x=player.x,y=player.y;levelRuntime.update(.7,{keys:new Set(['e']),repairNearby:false});assert(player.x===x&&player.y===y,'held E portal loop');
  }
});
test('software v3: all checkpoints survive actual respawn',()=>{for(const [i,c] of phaseData.map.checkpoints.entries()){checkpointIndex=i;checkpointX=c.x;checkpointY=c.y;respawnAtCheckpoint();const x=player.x,y=player.y;keys.clear();for(let t=0;t<120;t++)movePlayer(1/120);assert(player.x===x&&Math.abs(player.y-y)<1&&player.grounded,'checkpoint '+i);}});
test('software v3: every optional file is collectible with base movement',()=>{for(const item of collectibles){const nodes=swProof.reached.filter(n=>n.a<=item.x+34&&n.z+34>=item.x-34&&item.y>=n.y-140&&item.y<=n.y+80);for(const n of nodes){player.x=Math.max(n.a,Math.min(n.z,item.x-17));player.y=n.y;player.vy=0;player.grounded=true;jumpQueued=true;keys.clear();for(let t=0;t<110&&!item.collected;t++){movePlayer(1/120);updateCollectibles(1/120);}if(item.collected)break;}assert(item.collected,'file unreachable '+item.id);}});
test('software v3: moving interfaces carry and volatile pages return',()=>{
  const p=phaseData.entities.platforms.find(p=>p.type==='moving'&&p.motion.axis==='x');advancePlatformMotion(.1);const s=platformShape(p);player.x=s.x+24;player.y=s.y-player.height;player.grounded=true;const x=player.x;advancePlatformMotion(.1);assert(player.x!==x,'moving interface does not carry');
  const temp=phaseData.entities.platforms.find(p=>p.type==='temporary');player.x=temp.x+24;player.y=temp.y-player.height;player.vy=0;keys.clear();movePlayer(1/120);assert(getPlatformState(temp).triggered,'page not triggered');for(let t=0;t<(temp.duration+.1)*120;t++)update(1/120);assert(!platformShape(temp),'page did not disappear');player.x=swStart.x;player.y=swStart.y;for(let t=0;t<(temp.respawnDelay+.1)*120;t++)update(1/120);assert(platformShape(temp),'page did not return');
});
report.software.combat=[];
for(const enemy of viruses)test('software v3: basic projectile combat '+enemy.id,()=>{
  const options=swProof.reached.flatMap(n=>[n.a,n.z,(n.a+n.z)/2].map(x=>({n,x,score:Math.abs(Math.abs(x-enemy.x)-140)+Math.abs(n.y+22-enemy.y)*3}))).filter(p=>Math.abs(p.n.y+22-enemy.y)<80&&Math.abs(p.x-enemy.x)<600).sort((a,b)=>a.score-b.score);
  for(const p of options.slice(0,10)){player.x=p.x;player.y=p.n.y;player.vy=0;player.grounded=true;keys.clear();keys.add('j');damageCooldown=99999;projectiles=[];for(let t=0;t<1000&&enemy.alive;t++){player.facing=enemy.x>=player.x+17?1:-1;movePlayer(1/120);updateCombat(1/120);}if(!enemy.alive)break;}keys.clear();assert(!enemy.alive,'undefeated');report.software.combat.push(enemy.id);
});
test('software v3: exit restores processes and requires educational question',()=>{checkObjectives();assert(phaseExitUnlocked,'objectives not complete');player.x=phaseData.map.exit.x;player.y=phaseData.map.exit.y;update(.016);assert(phaseQuestionOpen,'question missing');ui.questionOverlay.querySelector('[data-correct="true"]').click();ui.questionOverlay.querySelector('.question-action').click();assert(phaseTransition,'completion missing');});
test('software v3: old save restarts safely with XP and abilities intact',()=>{setup(1);xp=47;unlockedSkills=[{id:'cannon',level:2}];restoreSkillEffects();saveCampaign();const saved=getSavedCampaign();saved.mapRevision=3;saved.player.x=1500;saved.player.y=1202;localStorage.setItem(SAVE_KEY,JSON.stringify(saved));continueCampaign();assert(player.x===mapStart().x&&player.y===mapStart().y&&xp===47&&player.damage===3&&components.every(c=>!c.repaired),'migration');});
test('software v3: new save preserves repairs and checkpoint',()=>{setup(1);components[0].repaired=true;checkpointIndex=2;checkpointX=phaseData.map.checkpoints[2].x;checkpointY=phaseData.map.checkpoints[2].y;respawnAtCheckpoint();saveCampaign();continueCampaign();assert(components[0].repaired&&checkpointIndex===2,'resume');});
test('software v3: portal connectivity is explicit, socket validation is not bypassed',()=>{const p=swClone(swOriginal.generation.recipe);delete p.connectivity;let rejected=false;try{ByteRunner.mapGeneration.compile(p);}catch(e){rejected=e.message.includes('Disconnected');}assert(rejected,'implicit portal mode');p.connectivity='unknown';rejected=false;try{ByteRunner.mapGeneration.compile(p);}catch(e){rejected=e.message.includes('Unknown connectivity');}assert(rejected,'unknown mode accepted');});
const broken=swClone(swOriginal),schedulerBounds=broken.generation.rooms.find(r=>r.id==='scheduler');
for(const m of broken.mechanics.filter(m=>m.type==='portals'))for(const link of m.links)if(link.to.x>=schedulerBounds.x&&link.to.x<schedulerBounds.x+schedulerBounds.width&&link.to.y>=schedulerBounds.y&&link.to.y<schedulerBounds.y+schedulerBounds.height)link.requires={component:'scheduler:scheduler'};
setup(1);loadMap(broken,true);
let deadlock;
for(let i=0;i<6;i++){deadlock=await swReach();let changed=false;for(const c of components)if(!c.repaired&&deadlock.repairs.find(r=>r.id===c.id)?.reached){c.repaired=true;changed=true;}if(!changed)break;}
test('software v3: validator detects a service behind its own directory lock',()=>assert(!components.find(c=>c.id==='scheduler:scheduler').repaired&&!deadlock.exitReached,'circular lock was accepted'));
// Apply the same static-plus-portal proof to the preserved original map.
setup(1);loadMap(SOFTWARE_V3_BASELINE,true);components.forEach(c=>c.repaired=true);
const baselineProof=await swReach();report.software.baselineProof=baselineProof;
report.software.baselineReachableStaticBand=ByteRunner.mapRebuildV3.navigationArea(baselineProof.reached,swShapes(),worldWidth(),worldHeight());
report.software.reachableStaticBandRatio=report.software.reachableStaticBand/report.software.baselineReachableStaticBand;
report.software.seedAudits=[];
for(const seed of ['software-v3-alpha','software-v3-beta','software-v3-gamma']){
  const recipe=swClone(swOriginal.generation.recipe);recipe.seed=seed;const a=ByteRunner.mapGeneration.compile(recipe),b=ByteRunner.mapGeneration.compile(recipe);
  setup(1);loadMap(a,true);components.forEach(c=>c.repaired=true);const proof=await swReach();
  test('software v3: deterministic validated vault seed '+seed,()=>{assert(JSON.stringify(a)===JSON.stringify(b),'non deterministic');assert(proof.exitReached&&!proof.unreachableRooms.length&&!proof.unproven.some(n=>!n.id.includes(':title-frame')),'seed leaves inaccessible geometry');});
  report.software.seedAudits.push({seed,exitReached:proof.exitReached,unreachableRooms:proof.unreachableRooms,signature:ByteRunner.mapAudit.signature(a)});
}
setup(1);await levelVisuals.ready;endPhaseIntro();animationTime=2;damageCooldown=0;
test('software v3: kernel gate cannot bypass four outer services',()=>{assert(!levelRuntime.connections().some(l=>l.id==='desktop:to-kernel-gateway'),'kernel opened early');assert(report.software.progression[0].exit===false,'initial exit already reached');});
test('software v3: portable pixel art and six spatial parallax districts',()=>{assert(!levelVisuals.errors.length&&!ctx.imageSmoothingEnabled,'pixel art failure');for(const region of phaseData.map.regions){const a=region.areas[0],zone=levelVisuals.parallax.life.region({x:a.x,y:a.y,width:a.width,height:a.height});assert(zone.labels[0]===region.name,'wrong district '+region.id);}});
const viewBefore={width,height,pixelRatio,cw:canvas.width,ch:canvas.height};
width=worldWidth();height=worldHeight();pixelRatio=1;cameraX=0;cameraY=0;canvas.width=width;canvas.height=height;ctx.setTransform(1,0,0,1,0,0);draw();report.snapshots.push({phase:2,position:'sw-v3-overview',image:captureCanvas()});
width=viewBefore.width;height=viewBefore.height;pixelRatio=viewBefore.pixelRatio;canvas.width=viewBefore.cw;canvas.height=viewBefore.ch;
for(const region of phaseData.map.regions){const a=region.areas[0];cameraX=Math.max(0,Math.min(worldWidth()-width,a.x));cameraY=Math.max(0,Math.min(worldHeight()-height,a.y+a.height-height));player.x=a.x+96;player.y=a.y+a.height-96;draw();report.snapshots.push({phase:2,position:'sw-v3-'+region.id,image:captureCanvas()});}
report.software.renderSamples=[];
for(const [w,h] of [[640,360],[905,644],[1280,720],[1920,1080]]){
  width=w;height=h;pixelRatio=1;canvas.width=w;canvas.height=h;const times=[];
  for(const region of phaseData.map.regions){const a=region.areas[0];for(let frame=0;frame<60;frame++){cameraX=Math.floor(Math.max(0,Math.min(worldWidth()-w,a.x+frame*4.25)));cameraY=Math.floor(Math.max(0,Math.min(worldHeight()-h,a.y+a.height-h+Math.sin(frame/20)*32)));animationTime=2+frame/60;const begin=performance.now();draw();if(frame>=15)times.push(performance.now()-begin);}}
  times.sort((a,b)=>a-b);report.software.renderSamples.push({logicalCanvas:[w,h],samples:times.length,medianDrawMs:times[Math.floor(times.length*.5)],p95DrawMs:times[Math.floor(times.length*.95)],terrainChunks:levelVisuals.terrain.cacheSize,terrainBytes:levelVisuals.terrain.cacheBytes,parallaxBytes:levelVisuals.parallax.stats.totalBytes});
}
test('software v3: visible rendering stays within shared cache limits',()=>{for(const row of report.software.renderSamples)assert(row.terrainChunks<=96&&row.parallaxBytes<=4.25*1024*1024,'cache overflow');});
width=viewBefore.width;height=viewBefore.height;pixelRatio=viewBefore.pixelRatio;canvas.width=viewBefore.cw;canvas.height=viewBefore.ch;
report.software.duration={humanMinutes:null,targetMinutes:[15,25],limitations:'Probes relocate between proven surfaces, solve puzzles through DOM and protect against combat damage; not an uninterrupted playthrough.'};
running=false;
