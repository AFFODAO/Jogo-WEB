const swClone=ByteRunner.maps.clone;
setup(3);await levelVisuals.ready;endPhaseIntro();xpRequired=999999;
const swOriginal=swClone(phaseData),swStart=mapStart();
const swSnapshot=()=>({solids:swClone(solids()),standingSpans:surfaces(),connections:swClone(levelRuntime.connections())});
const swShapes=()=>solids().filter(s=>!['moving','temporary','falling'].includes(s.type));
const swReach=()=>ByteRunner.mapAudit.analyze(phaseData,swShapes(),[],mapStart(),{yieldEvery:12});
const swNear=(nodes,c)=>nodes.find(n=>Math.abs(c.y+(c.height||44)/2-n.y-24)<=78&&n.z+17>=c.x+(c.width||34)/2-76&&n.a+17<=c.x+(c.width||34)/2+76);
report.router={definition:swOriginal,physics:{...ByteRunner.platformPhysics.base,jumpHeight:ByteRunner.platformPhysics.jumpHeight},initial:swSnapshot(),progression:[]};
test('router v3: interlocked tunnel maze and preserved campaign identity',()=>{assert(phaseData.id==='phase-04'&&phaseData.revision===5&&phaseData.map.regions.length===6,'identity');assert(phaseData.generation.rooms.length===27&&phaseData.generation.links.length===38&&phaseData.generation.architecture.mode==='interlocked-multilevel-tunnel-maze','new architecture');assert(phaseData.map.width!==PHASES[0].map.width||phaseData.map.height!==PHASES[0].map.height,'Hardware silhouette reused');});
test('router v3: no optional abilities or forced completion flags',()=>assert(!unlockedSkills.length&&player.jumpPower===690&&player.damage===1&&!phaseExitUnlocked,'optional powers'));
let swProof;
for(let round=0;round<=components.length;round++){
  swProof=await swReach();report.router.progression.push({repairs:components.filter(c=>c.repaired).map(c=>c.id),accessible:swProof.repairs,exit:swProof.exitReached,reachedSurfaces:swProof.reached.length});
  const next=components.find(c=>!c.repaired&&swProof.repairs.find(r=>r.id===c.id)?.reached);
  if(!next)break;
  test('router v3: real minigame and repair '+next.id,()=>{const n=swNear(swProof.reached,next);assert(n,'no standable interaction');player.x=Math.max(n.a,Math.min(n.z,next.x));player.y=n.y;keys.add('e');updateRepair(0);keys.clear();assert(repairSession?.model,'challenge absent');solveRepairUI();updateRepair(.6);assert(next.repaired,'repair failed');});
}
report.router.proof=swProof;report.router.repairedComponentsOnly=swSnapshot();
report.router.reachableStaticBand=ByteRunner.mapRebuildV3.navigationArea(swProof.reached,swShapes(),worldWidth(),worldHeight());
test('router v3: fixed-point repair progression reaches all six objectives and exit',()=>assert(components.length===6&&components.every(c=>c.repaired)&&swProof.exitReached&&swProof.spawnSupported,'repair deadlock or unreachable exit'));
test('router v3: every sector and permanent route surface reached',()=>{assert(!swProof.unreachableRooms.length,swProof.unreachableRooms.join(','));const missing=swProof.unproven.filter(n=>!n.id.includes(':roof'));assert(!missing.length,missing.map(n=>n.id).join(','));});
test('router v3: all repaired maintenance shortcuts execute and arrive on permanent support',()=>{
  for(const link of levelRuntime.connections()){
    player.x=link.x+4;player.y=link.y+link.height-player.height;player.vx=0;player.vy=0;
    levelRuntime.update(.6,{keys:new Set(),repairNearby:false});levelRuntime.update(.016,{keys:new Set(['e']),repairNearby:Boolean(findNearbyComponent())});
    assert(player.x===link.to.x&&player.y===link.to.y,'portal did not execute '+link.id);
    const shapes=swShapes();assert(!shapes.some(s=>s.collision!=='one-way'&&overlaps(player,s)),'embedded '+link.id);
    assert(shapes.some(s=>Math.abs(s.y-player.y-player.height)<1&&player.x>=s.x&&player.x+player.width<=s.x+s.w),'unsupported '+link.id);
    const x=player.x,y=player.y;levelRuntime.update(.7,{keys:new Set(['e']),repairNearby:false});assert(player.x===x&&player.y===y,'held E portal loop');
  }
});
test('router v3: every room seam works both ways in actual movePlayer',()=>{
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
test('router v3: all checkpoints survive actual respawn',()=>{for(const [i,c] of phaseData.map.checkpoints.entries()){checkpointIndex=i;checkpointX=c.x;checkpointY=c.y;respawnAtCheckpoint();const x=player.x,y=player.y;keys.clear();for(let t=0;t<120;t++)movePlayer(1/120);assert(player.x===x&&Math.abs(player.y-y)<1&&player.grounded,'checkpoint '+i);}});
test('router v3: checkpoints clear every hazard and enemy patrol envelope',()=>{
  for(const point of swOriginal.map.checkpoints){
    const spawn={x:point.x+38,y:point.y-48,width:34,height:48};
    for(const h of swOriginal.mechanics.filter(m=>m.type==='parkour-hazards').flatMap(m=>m.hazards))assert(!(spawn.x<h.x+h.width&&spawn.x+34>h.x&&spawn.y<h.y+h.height&&spawn.y+48>h.y),'checkpoint inside trap');
    for(const enemy of swOriginal.entities.enemies){const x=Math.max(enemy.patrolMin,Math.min(enemy.patrolMax,spawn.x+17));assert(Math.hypot(x-spawn.x-17,enemy.y-spawn.y-24)>=160,'checkpoint too close to patrol '+enemy.id);}
  }
});
test('router v3: every datagram and optional cache is collectible with base movement',()=>{for(const item of collectibles){const nodes=swProof.reached.filter(n=>n.a<=item.x+34&&n.z+34>=item.x-34&&item.y>=n.y-140&&item.y<=n.y+80);for(const n of nodes){player.x=Math.max(n.a,Math.min(n.z,item.x-17));player.y=n.y;player.vy=0;player.grounded=true;jumpQueued=true;keys.clear();for(let t=0;t<110&&!item.collected;t++){movePlayer(1/120);updateCollectibles(1/120);}if(item.collected)break;}assert(item.collected,'cache unreachable '+item.id);}});
test('router v3: elevators carry and temporary packet bridges return',()=>{
  const p=phaseData.entities.platforms.find(p=>p.type==='moving'&&p.motion.axis==='x');advancePlatformMotion(.1);const s=platformShape(p);player.x=s.x+24;player.y=s.y-player.height;player.grounded=true;const x=player.x;advancePlatformMotion(.1);assert(player.x!==x,'moving interface does not carry');
  const temp=phaseData.entities.platforms.find(p=>p.type==='temporary');player.x=temp.x+24;player.y=temp.y-player.height;player.vy=0;keys.clear();movePlayer(1/120);assert(getPlatformState(temp).triggered,'page not triggered');for(let t=0;t<(temp.duration+.1)*120;t++)update(1/120);assert(!platformShape(temp),'page did not disappear');player.x=swStart.x;player.y=swStart.y;for(let t=0;t<(temp.respawnDelay+.1)*120;t++)update(1/120);assert(platformShape(temp),'page did not return');
});
report.router.combat=[];
for(const enemy of viruses)test('router v3: basic projectile combat '+enemy.id,()=>{
  const options=swProof.reached.flatMap(n=>[n.a,n.z,(n.a+n.z)/2].map(x=>({n,x,score:Math.abs(Math.abs(x-enemy.x)-140)+Math.abs(n.y+22-enemy.y)*3}))).filter(p=>Math.abs(p.n.y+22-enemy.y)<80&&Math.abs(p.x-enemy.x)<600).sort((a,b)=>a.score-b.score);
  for(const p of options.slice(0,10)){player.x=p.x;player.y=p.n.y;player.vy=0;player.grounded=true;keys.clear();keys.add('j');damageCooldown=99999;projectiles=[];for(let t=0;t<1000&&enemy.alive;t++){player.facing=enemy.x>=player.x+17?1:-1;movePlayer(1/120);updateCombat(1/120);}if(!enemy.alive)break;}keys.clear();assert(!enemy.alive,'undefeated');report.router.combat.push(enemy.id);
});
test('router v3: gateway restores routes and requires educational question',()=>{checkObjectives();assert(phaseExitUnlocked,'objectives not complete');player.x=phaseData.map.exit.x;player.y=phaseData.map.exit.y;update(.016);assert(phaseQuestionOpen,'question missing');ui.questionOverlay.querySelector('[data-correct="true"]').click();ui.questionOverlay.querySelector('.question-action').click();assert(phaseTransition,'completion missing');});
test('router v3: old save restarts safely with XP and abilities intact',()=>{setup(3);xp=47;unlockedSkills=[{id:'cannon',level:2}];restoreSkillEffects();saveCampaign();const saved=getSavedCampaign();saved.mapRevision=3;saved.player.x=1500;saved.player.y=1202;localStorage.setItem(SAVE_KEY,JSON.stringify(saved));continueCampaign();assert(player.x===mapStart().x&&player.y===mapStart().y&&xp===47&&player.damage===1&&skillRank('cannon')===2&&components.every(c=>!c.repaired),'migration');});
test('router v3: new save preserves repairs and checkpoint',()=>{setup(3);components[0].repaired=true;checkpointIndex=2;checkpointX=phaseData.map.checkpoints[2].x;checkpointY=phaseData.map.checkpoints[2].y;respawnAtCheckpoint();saveCampaign();continueCampaign();assert(components[0].repaired&&checkpointIndex===2,'resume');});
// Apply the same static-plus-portal proof to the preserved original map.
setup(3);loadMap(ROUTER_V3_BASELINE,true);components.forEach(c=>c.repaired=true);
const baselineProof=await ByteRunner.mapAudit.analyze(phaseData,swShapes(),levelRuntime.connections(),mapStart(),{yieldEvery:12});report.router.baselineProof=baselineProof;
report.router.baselineReachableStaticBand=ByteRunner.mapRebuildV3.navigationArea(baselineProof.reached,swShapes(),worldWidth(),worldHeight());
report.router.reachableStaticBandRatio=report.router.reachableStaticBand/report.router.baselineReachableStaticBand;
test('router v3: useful reachable area grew at least threefold',()=>assert(report.router.reachableStaticBandRatio>=3,'expansion is mostly void'));
report.router.seedAudits=[];
for(const seed of ['router-v3-alpha','router-v3-beta','router-v3-gamma']){
  const recipe=swClone(swOriginal.generation.recipe);recipe.seed=seed;const a=ByteRunner.mapGeneration.compile(recipe),b=ByteRunner.mapGeneration.compile(recipe);
  setup(3);loadMap(a,true);components.forEach(c=>c.repaired=true);phaseData.entities.interactives.forEach(p=>levelRuntime.setFlag(p.flag));const proof=await swReach();
  test('router v3: deterministic validated service-cache seed '+seed,()=>{assert(JSON.stringify(a)===JSON.stringify(b),'non deterministic');assert(proof.exitReached&&!proof.unreachableRooms.length&&!proof.unproven.some(n=>!n.id.includes(':roof')),'seed leaves inaccessible geometry');});
  report.router.seedAudits.push({seed,exitReached:proof.exitReached,unreachableRooms:proof.unreachableRooms,signature:ByteRunner.mapAudit.signature(a)});
}
// Negative progression case: a required interface imprisoned behind its own repair.
const circular=swClone(swOriginal),lanBounds=circular.generation.rooms.find(r=>r.id==='iface-lan');
circular.entities.gates.push({id:'negative-self-lock',x:lanBounds.x+16,y:lanBounds.y+16,width:608,height:448,opensWhen:{component:'iface-lan:lan'}});
setup(3);loadMap(circular,true);let circularProof;
for(let pass=0;pass<=components.length;pass++){
  circularProof=await swReach();let changed=false;
  for(const c of components)if(!c.repaired&&circularProof.repairs.some(r=>r.id===c.id&&r.reached)){c.repaired=true;changed=true;}
  if(!changed)break;
}
test('router v3: physical progression auditor rejects a circular repair dependency',()=>assert(!components.find(c=>c.id==='iface-lan:lan').repaired&&!circularProof.exitReached,'self-locked service accepted'));
report.router.circularDependencyNegative={exitReached:circularProof.exitReached,unreachedRepairs:circularProof.repairs.filter(r=>!r.reached).map(r=>r.id)};
setup(3);await levelVisuals.ready;endPhaseIntro();animationTime=2;damageCooldown=0;
test('router v3: core and gateway require external services first',()=>{assert(solids().some(s=>s.id==='core-main:core-west-lock'),'core lock missing');assert(report.router.progression[0].exit===false,'initial exit reached');for(const id of ['core-main:table','gateway-tower:gateway'])assert(!report.router.progression[0].accessible.find(r=>r.id===id).reached,'late service opened early '+id);});
test('router v3: portable pixel art and six spatial parallax districts',()=>{assert(!levelVisuals.errors.length&&!ctx.imageSmoothingEnabled,'pixel art failure');for(const region of phaseData.map.regions){const a=region.areas[0],zone=levelVisuals.parallax.life.region({x:a.x,y:a.y,width:a.width,height:a.height});assert(zone.labels[0]===region.name,'wrong district '+region.id);}});
const viewBefore={width,height,pixelRatio,cw:canvas.width,ch:canvas.height};
width=worldWidth();height=worldHeight();pixelRatio=1;cameraX=0;cameraY=0;canvas.width=width;canvas.height=height;ctx.setTransform(1,0,0,1,0,0);draw();report.snapshots.push({phase:4,position:'router-v3-overview',image:captureCanvas()});
width=viewBefore.width;height=viewBefore.height;pixelRatio=viewBefore.pixelRatio;canvas.width=viewBefore.cw;canvas.height=viewBefore.ch;
for(const region of phaseData.map.regions){const a=region.areas[0];cameraX=Math.max(0,Math.min(worldWidth()-width,a.x));cameraY=Math.max(0,Math.min(worldHeight()-height,a.y+a.height-height));player.x=a.x+96;player.y=a.y+a.height-96;draw();report.snapshots.push({phase:4,position:'router-v3-'+region.id,image:captureCanvas()});}
report.router.renderSamples=[];
for(const [w,h] of [[640,360],[905,644],[1280,720],[1920,1080]]){
  width=w;height=h;pixelRatio=1;canvas.width=w;canvas.height=h;const times=[];
  for(const region of phaseData.map.regions){const a=region.areas[0];for(let frame=0;frame<60;frame++){cameraX=Math.floor(Math.max(0,Math.min(worldWidth()-w,a.x+frame*4.25)));cameraY=Math.floor(Math.max(0,Math.min(worldHeight()-h,a.y+a.height-h+Math.sin(frame/20)*32)));animationTime=2+frame/60;const begin=performance.now();draw();if(frame>=15)times.push(performance.now()-begin);}}
  times.sort((a,b)=>a-b);report.router.renderSamples.push({logicalCanvas:[w,h],samples:times.length,medianDrawMs:times[Math.floor(times.length*.5)],p95DrawMs:times[Math.floor(times.length*.95)],terrainChunks:levelVisuals.terrain.cacheSize,terrainBytes:levelVisuals.terrain.cacheBytes,parallaxBytes:levelVisuals.parallax.stats.totalBytes});
}
test('router v3: visible rendering stays within shared cache limits',()=>{for(const row of report.router.renderSamples)assert(row.terrainChunks<=96&&row.parallaxBytes<=4.25*1024*1024,'cache overflow');});
width=viewBefore.width;height=viewBefore.height;pixelRatio=viewBefore.pixelRatio;canvas.width=viewBefore.cw;canvas.height=viewBefore.ch;
test('router v3: a disconnected LAN branch is rejected',()=>{
  const recipe=swClone(swOriginal.generation.recipe);recipe.links=recipe.links.filter(l=>l.from.room!=='lan-entry'&&l.to.room!=='lan-entry');let rejected=false;
  try{ByteRunner.mapGeneration.compile(recipe);}catch(e){rejected=e.message.includes('Disconnected');}assert(rejected,'disconnected maze accepted');
});
test('router v3: electrical warning and safe windows cause actual timed damage',()=>{
  setup(3);const h=phaseData.mechanics.find(m=>m.type==='parkour-hazards').hazards[0];player.x=h.x;player.y=h.y;player.health=100;damageCooldown=0;
  levelRuntime.update(h.warning-.1,{keys:new Set(),repairNearby:false});assert(player.health===100,'warning damages player');
  levelRuntime.update(.2,{keys:new Set(),repairNearby:false});assert(player.health===100-h.damage,'active current causes no damage');
  damageCooldown=0;levelRuntime.update(h.active+.1,{keys:new Set(),repairNearby:false});assert(player.health===100-h.damage,'safe window damages player');
});
setup(0);xp=37;saveCampaign();document.getElementById('settingsButton').click();
const campaignBeforeRouterTest=localStorage.getItem(SAVE_KEY),historyBeforeRouterTest=localStorage.getItem(QUESTION_HISTORY_KEY);
const routerDevToggle=document.getElementById('developerModeToggle');routerDevToggle.checked=true;routerDevToggle.dispatchEvent(new Event('change'));
document.getElementById('developerSelectPhase').click();document.querySelector('#developerPhaseList [data-phase="3"]').click();await levelVisuals.ready;
test('router v3: direct developer access uses the real rebuilt map',()=>assert(phaseIndex===3&&phaseData.revision===5&&phaseData.generation.rooms.length===27&&running&&player.x===mapStart().x&&player.y===mapStart().y&&!levelVisuals.errors.length&&components.every(c=>!c.repaired),'developer phase 4 mismatch'));
components[0].repaired=true;pause();document.querySelectorAll('.developer-pause-actions button')[1].click();
test('router v3: developer restart restores router objectives without campaign writes',()=>assert(phaseIndex===3&&components.every(c=>!c.repaired)&&viruses.every(v=>v.alive)&&checkpointIndex===-1&&localStorage.getItem(SAVE_KEY)===campaignBeforeRouterTest&&localStorage.getItem(QUESTION_HISTORY_KEY)===historyBeforeRouterTest,'test restart leaked'));
document.getElementById('settingsButton').click();routerDevToggle.checked=false;routerDevToggle.dispatchEvent(new Event('change'));document.getElementById('closeSettings').click();
test('router v3: leaving router developer test restores normal campaign',()=>assert(!developerSession&&phaseIndex===0&&xp===37&&localStorage.getItem(SAVE_KEY)===campaignBeforeRouterTest,'normal campaign changed'));
report.router.duration={humanMinutes:null,targetMinutes:[15,25],limitations:'Probes relocate between proven surfaces, solve puzzles through DOM and protect against combat damage; not an uninterrupted playthrough.'};
running=false;
