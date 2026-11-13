const swClone=ByteRunner.maps.clone;
setup(7);await levelVisuals.ready;endPhaseIntro();xpRequired=999999;
const swOriginal=swClone(phaseData),swStart=mapStart(),dnsOptionalIds=new Set(phaseData.generation.architecture.optionalEnemies);
const swSnapshot=()=>({solids:swClone(solids()),standingSpans:surfaces(),connections:swClone(levelRuntime.connections())});
const swShapes=()=>solids().filter(s=>!['moving','temporary','falling'].includes(s.type));
const swReach=()=>ByteRunner.mapAudit.analyze(phaseData,swShapes(),levelRuntime.connections(),mapStart(),{yieldEvery:12});
const swNear=(nodes,c)=>nodes.find(n=>Math.abs(c.y+(c.height||44)/2-n.y-24)<=78&&n.z+17>=c.x+(c.width||34)/2-76&&n.a+17<=c.x+(c.width||34)/2+76);
report.dns={definition:swOriginal,physics:{...ByteRunner.platformPhysics.base,jumpHeight:ByteRunner.platformPhysics.jumpHeight},initial:swSnapshot(),progression:[]};
test('dns v3: physical domain campuses and portals and preserved campaign identity',()=>{assert(phaseData.id==='phase-08'&&phaseData.revision===5&&phaseData.map.regions.length===6,'identity');assert(phaseData.generation.rooms.length===33&&phaseData.generation.links.length===36&&phaseData.generation.architecture.mode==='domain-campuses-and-recursive-portals','new architecture');assert(phaseData.map.width!==PHASES[0].map.width||phaseData.map.height!==PHASES[0].map.height,'Hardware silhouette reused');});
test('dns v3: no optional abilities or forced completion flags',()=>assert(!unlockedSkills.length&&player.jumpPower===690&&player.damage===1&&!phaseExitUnlocked,'optional powers'));
let swProof;
for(let round=0;round<=components.length;round++){
  swProof=await swReach();
  report.dns.progression.push({repairs:components.filter(c=>c.repaired).map(c=>c.id),accessible:swProof.repairs,exit:swProof.exitReached,reachedSurfaces:swProof.reached.length});
  const next=components.find(c=>!c.repaired&&swProof.repairs.find(r=>r.id===c.id)?.reached);
  if(!next)break;
  test('dns v3: real minigame and repair '+next.id,()=>{const n=swNear(swProof.reached,next);assert(n,'no standable interaction');player.x=Math.max(n.a,Math.min(n.z,next.x));player.y=n.y;keys.add('e');updateRepair(0);keys.clear();assert(repairSession?.model,'challenge absent');solveRepairUI();updateRepair(.6);assert(next.repaired,'repair failed');});
}
report.dns.proof=swProof;report.dns.repairedComponentsOnly=swSnapshot();
report.dns.reachableStaticBand=ByteRunner.mapRebuildV3.navigationArea(swProof.reached,swShapes(),worldWidth(),worldHeight());
test('dns v3: fixed-point repair progression reaches all seven objectives and exit',()=>assert(components.length===7&&components.every(c=>c.repaired)&&swProof.exitReached&&swProof.spawnSupported,'repair deadlock or unreachable exit'));
test('dns v3: every sector and permanent route surface reached',()=>{assert(!swProof.unreachableRooms.length,swProof.unreachableRooms.join(','));const missing=swProof.unproven.filter(n=>!n.id.includes(':roof')&&!n.id.includes(':wall-'));assert(!missing.length,missing.map(n=>n.id).join(','));});
test('dns v3: all restored maintenance returns execute and arrive on permanent support',()=>{
  for(const link of levelRuntime.connections()){
    player.x=link.x+4;player.y=link.y+link.height-player.height;player.vx=0;player.vy=0;
    levelRuntime.update(.6,{keys:new Set(),repairNearby:false});levelRuntime.update(.016,{keys:new Set(['e']),repairNearby:Boolean(findNearbyComponent())});
    assert(player.x===link.to.x&&player.y===link.to.y,'portal did not execute '+link.id);
    const shapes=swShapes();assert(!shapes.some(s=>s.collision!=='one-way'&&overlaps(player,s)),'embedded '+link.id);
    assert(shapes.some(s=>Math.abs(s.y-player.y-player.height)<1&&player.x>=s.x&&player.x+player.width<=s.x+s.w),'unsupported '+link.id);
    const x=player.x,y=player.y;levelRuntime.update(.7,{keys:new Set(['e']),repairNearby:false});assert(player.x===x&&player.y===y,'held E portal loop');
  }
});
test('dns v3: every room seam works both ways in actual movePlayer',()=>{
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
test('dns v3: all checkpoints survive actual respawn',()=>{for(const [i,c] of phaseData.map.checkpoints.entries()){checkpointIndex=i;checkpointX=c.x;checkpointY=c.y;respawnAtCheckpoint();const x=player.x,y=player.y;keys.clear();for(let t=0;t<120;t++)movePlayer(1/120);assert(player.x===x&&Math.abs(player.y-y)<1&&player.grounded,'checkpoint '+i);}});
test('dns v3: checkpoints clear every hazard and enemy patrol envelope',()=>{
  for(const point of swOriginal.map.checkpoints){
    const spawn={x:point.x+38,y:point.y-48,width:34,height:48};
    for(const h of swOriginal.mechanics.filter(m=>m.type==='parkour-hazards').flatMap(m=>m.hazards))assert(!(spawn.x<h.x+h.width&&spawn.x+34>h.x&&spawn.y<h.y+h.height&&spawn.y+48>h.y),'checkpoint inside trap');
    for(const enemy of swOriginal.entities.enemies){const x=Math.max(enemy.patrolMin,Math.min(enemy.patrolMax,spawn.x+17));assert(Math.hypot(x-spawn.x-17,enemy.y-spawn.y-24)>=160,'checkpoint too close to patrol '+enemy.id);}
  }
});
test('dns v3: every address token and optional cache is collectible with base movement',()=>{for(const item of collectibles){const nodes=swProof.reached.filter(n=>n.a<=item.x+34&&n.z+34>=item.x-34&&item.y>=n.y-140&&item.y<=n.y+80);for(const n of nodes){player.x=Math.max(n.a,Math.min(n.z,item.x-17));player.y=n.y;player.vy=0;player.grounded=true;jumpQueued=true;keys.clear();for(let t=0;t<110&&!item.collected;t++){movePlayer(1/120);updateCollectibles(1/120);}if(item.collected)break;}assert(item.collected,'cache unreachable '+item.id);}});
test('dns v3: elevators carry and temporary packet bridges return',()=>{
  const p=phaseData.entities.platforms.find(p=>p.type==='moving'&&p.motion.axis==='x');advancePlatformMotion(.1);const s=platformShape(p);player.x=s.x+24;player.y=s.y-player.height;player.grounded=true;const x=player.x;advancePlatformMotion(.1);assert(player.x!==x,'moving interface does not carry');
  const temp=phaseData.entities.platforms.find(p=>p.type==='temporary');player.x=temp.x+24;player.y=temp.y-player.height;player.vy=0;keys.clear();movePlayer(1/120);assert(getPlatformState(temp).triggered,'page not triggered');for(let t=0;t<(temp.duration+.1)*120;t++)update(1/120);assert(!platformShape(temp),'page did not disappear');player.x=swStart.x;player.y=swStart.y;for(let t=0;t<(temp.respawnDelay+.1)*120;t++)update(1/120);assert(platformShape(temp),'page did not return');
});
report.dns.combat=[];
function dnsFight(enemy){

  const options=swProof.reached.flatMap(n=>[n.a,n.z,(n.a+n.z)/2].map(x=>({n,x,score:Math.abs(Math.abs(x-enemy.x)-140)+Math.abs(n.y+22-enemy.y)*3}))).filter(p=>Math.abs(p.n.y+22-enemy.y)<80&&Math.abs(p.x-enemy.x)<600).sort((a,b)=>a.score-b.score);
  for(const p of options.slice(0,10)){player.x=p.x;player.y=p.n.y;player.vy=0;player.grounded=true;keys.clear();keys.add('j');damageCooldown=99999;projectiles=[];for(let t=0;t<1000&&enemy.alive;t++){player.facing=enemy.x>=player.x+17?1:-1;movePlayer(1/120);updateCombat(1/120);}if(!enemy.alive)break;}keys.clear();assert(!enemy.alive,'undefeated');report.dns.combat.push(enemy.id);
}
for(const enemy of viruses.filter(e=>!dnsOptionalIds.has(e.id)))test('dns v3: basic projectile combat '+enemy.id,()=>dnsFight(enemy));
test('dns v3: NXDOMAIN is optional for real completion',()=>{assert(viruses.filter(e=>dnsOptionalIds.has(e.id)).length===4&&viruses.filter(e=>dnsOptionalIds.has(e.id)).every(e=>e.alive),'optional enemies were not kept alive');checkObjectives();assert(phaseExitUnlocked,'optional district blocks completion');});
for(const enemy of viruses.filter(e=>dnsOptionalIds.has(e.id)))test('dns v3: optional risk combat '+enemy.id,()=>dnsFight(enemy));
test('dns v3: roof exit requires all resolver services and requires educational question',()=>{checkObjectives();assert(phaseExitUnlocked,'objectives not complete');player.x=phaseData.map.exit.x;player.y=phaseData.map.exit.y;update(.016);assert(phaseQuestionOpen,'question missing');ui.questionOverlay.querySelector('[data-correct="true"]').click();ui.questionOverlay.querySelector('.question-action').click();assert(phaseTransition,'completion missing');});
test('dns v3: old save restarts safely with XP and abilities intact',()=>{setup(7);xp=47;unlockedSkills=[{id:'cannon',level:2}];restoreSkillEffects();saveCampaign();const saved=getSavedCampaign();saved.mapRevision=3;saved.player.x=1500;saved.player.y=1202;localStorage.setItem(SAVE_KEY,JSON.stringify(saved));continueCampaign();assert(player.x===mapStart().x&&player.y===mapStart().y&&xp===47&&player.damage===1&&skillRank('cannon')===2&&components.every(c=>!c.repaired),'migration');});
test('dns v3: new save preserves repairs and checkpoint',()=>{setup(7);components[0].repaired=true;checkpointIndex=2;checkpointX=phaseData.map.checkpoints[2].x;checkpointY=phaseData.map.checkpoints[2].y;respawnAtCheckpoint();saveCampaign();continueCampaign();assert(components[0].repaired&&checkpointIndex===2,'resume');});
// Apply the same static-plus-portal proof to the preserved original map.
setup(7);loadMap(DNS_V3_BASELINE,true);components.forEach(c=>c.repaired=true);fulfilGoalsForQuestionTest();
const baselineProof=await ByteRunner.mapAudit.analyze(phaseData,swShapes(),levelRuntime.connections(),mapStart(),{yieldEvery:12});report.dns.baselineProof=baselineProof;
report.dns.baselineReachableStaticBand=ByteRunner.mapRebuildV3.navigationArea(baselineProof.reached,swShapes(),worldWidth(),worldHeight());
report.dns.reachableStaticBandRatio=report.dns.reachableStaticBand/report.dns.baselineReachableStaticBand;
// Compare the full restored factories with lifts at the same initial instant;
// the permanent-only proof remains a separate, conservative traversal check.
const baselineActiveShapes=swClone(solids()),baselineActiveProof=await ByteRunner.mapAudit.analyze(phaseData,baselineActiveShapes,levelRuntime.connections(),mapStart(),{yieldEvery:12});
report.dns.baselineActiveBand=ByteRunner.mapRebuildV3.navigationArea(baselineActiveProof.reached,baselineActiveShapes,worldWidth(),worldHeight());
report.dns.baselineActiveProof=baselineActiveProof;
setup(7);loadMap(swOriginal,true);components.forEach(c=>c.repaired=true);fulfilGoalsForQuestionTest();
const activeShapes=swClone(solids()),activeProof=await ByteRunner.mapAudit.analyze(phaseData,activeShapes,levelRuntime.connections(),mapStart(),{yieldEvery:12});
report.dns.activeBand=ByteRunner.mapRebuildV3.navigationArea(activeProof.reached,activeShapes,worldWidth(),worldHeight());
report.dns.frozenActiveBandRatio=report.dns.activeBand/report.dns.baselineActiveBand;
test('dns v3: useful reachable area grew at least threefold',()=>assert(report.dns.reachableStaticBandRatio>=3,'expansion is mostly void'));
report.dns.seedAudits=[];
for(const seed of ['dns-v3-alpha','dns-v3-beta','dns-v3-gamma']){
  const recipe=swClone(swOriginal.generation.recipe);recipe.seed=seed;const a=ByteRunner.mapGeneration.compile(recipe),b=ByteRunner.mapGeneration.compile(recipe);
  setup(7);loadMap(a,true);components.forEach(c=>c.repaired=true);phaseData.entities.interactives.forEach(p=>levelRuntime.setFlag(p.flag));const proof=await swReach();
  test('dns v3: deterministic validated service-cache seed '+seed,()=>{assert(JSON.stringify(a)===JSON.stringify(b),'non deterministic');assert(proof.exitReached&&!proof.unreachableRooms.length&&!proof.unproven.some(n=>!n.id.includes(':roof')&&!n.id.includes(':wall-')),'seed leaves inaccessible geometry');});
  report.dns.seedAudits.push({seed,exitReached:proof.exitReached,unreachableRooms:proof.unreachableRooms,signature:ByteRunner.mapAudit.signature(a)});
}
const circularFactory=swClone(swOriginal),panelRoom=circularFactory.generation.rooms.find(r=>r.id==='com-zone');
circularFactory.entities.gates.push({id:'negative-self-lock',x:panelRoom.x+16,y:panelRoom.y+16,width:608,height:448,opensWhen:{component:'com-zone:delegation'}});
setup(7);loadMap(circularFactory,true);fulfilGoalsForQuestionTest();let circularProof;
for(let pass=0;pass<=components.length;pass++){
  circularProof=await swReach();let changed=false;
  for(const c of components)if(!c.repaired&&circularProof.repairs.some(r=>r.id===c.id&&r.reached)){c.repaired=true;changed=true;}
  if(!changed)break;
}
test('dns v3: validator detects a panel behind its own repair',()=>assert(!components.find(c=>c.id==='com-zone:delegation').repaired&&!circularProof.exitReached,'circular service dependency accepted'));
report.dns.circularDependencyNegative={exitReached:circularProof.exitReached,unreachedRepairs:circularProof.repairs.filter(r=>!r.reached).map(r=>r.id)};
setup(7);await levelVisuals.ready;endPhaseIntro();animationTime=2;damageCooldown=0;
test('dns v3: final resolution requires all six outer services',()=>{assert(!report.dns.progression[0].exit&&!report.dns.progression[0].accessible.find(r=>r.id==='resolve-core:resolution').reached,'final resolution opened early');});

test('dns v3: portable pixel art and six spatial parallax districts',()=>{assert(!levelVisuals.errors.length&&!ctx.imageSmoothingEnabled,'pixel art failure');for(const region of phaseData.map.regions){const a=region.areas[0],zone=levelVisuals.parallax.life.region({x:a.x,y:a.y,width:a.width,height:a.height});assert(zone.labels[0]===region.name,'wrong district '+region.id);}});
const viewBefore={width,height,pixelRatio,cw:canvas.width,ch:canvas.height};
width=worldWidth();height=worldHeight();pixelRatio=1;cameraX=0;cameraY=0;canvas.width=width;canvas.height=height;ctx.setTransform(1,0,0,1,0,0);draw();report.snapshots.push({phase:8,position:'dns-v3-overview',image:captureCanvas()});
width=viewBefore.width;height=viewBefore.height;pixelRatio=viewBefore.pixelRatio;canvas.width=viewBefore.cw;canvas.height=viewBefore.ch;
for(const region of phaseData.map.regions){const a=region.areas[0];cameraX=Math.max(0,Math.min(worldWidth()-width,a.x));cameraY=Math.max(0,Math.min(worldHeight()-height,a.y+a.height-height));player.x=a.x+96;player.y=a.y+a.height-96;draw();report.snapshots.push({phase:8,position:'dns-v3-'+region.id,image:captureCanvas()});}
report.dns.renderSamples=[];
for(const [w,h] of [[640,360],[905,644],[1280,720],[1920,1080]]){
  width=w;height=h;pixelRatio=1;canvas.width=w;canvas.height=h;const times=[];
  for(const region of phaseData.map.regions){const a=region.areas[0];for(let frame=0;frame<60;frame++){cameraX=Math.floor(Math.max(0,Math.min(worldWidth()-w,a.x+frame*4.25)));cameraY=Math.floor(Math.max(0,Math.min(worldHeight()-h,a.y+a.height-h+Math.sin(frame/20)*32)));animationTime=2+frame/60;const begin=performance.now();draw();if(frame>=15)times.push(performance.now()-begin);}}
  times.sort((a,b)=>a-b);report.dns.renderSamples.push({logicalCanvas:[w,h],samples:times.length,medianDrawMs:times[Math.floor(times.length*.5)],p95DrawMs:times[Math.floor(times.length*.95)],terrainChunks:levelVisuals.terrain.cacheSize,terrainBytes:levelVisuals.terrain.cacheBytes,parallaxBytes:levelVisuals.parallax.stats.totalBytes});
}
test('dns v3: visible rendering stays within shared cache limits',()=>{for(const row of report.dns.renderSamples)assert(row.terrainChunks<=96&&row.parallaxBytes<=4.25*1024*1024,'cache overflow');});
width=viewBefore.width;height=viewBefore.height;pixelRatio=viewBefore.pixelRatio;canvas.width=viewBefore.cw;canvas.height=viewBefore.ch;
test('dns v3: isolated root and missing portal destination are rejected',()=>{
  const g=ByteRunner.mapGeneration,recipe=swClone(swOriginal.generation.recipe);recipe.links=recipe.links.filter(l=>l.from.room!=='root-core'&&l.to.room!=='root-core');
  const root={id:'dns-negative-root',version:1,width:640,height:512,ground:[{id:'floor',x:0,y:464,width:640,height:48}],entities:Object.fromEntries(g.config.groups.map(k=>[k,[]])),anchors:{entry:{x:64,y:416},reception:{x:16,y:416}},sockets:[]};
  g.registerRoom(root);recipe.rooms.find(r=>r.id==='root-core').template=root.id;let rejected=false;
  try{g.compile(recipe);}catch(e){rejected=e.message.includes('Disconnected');}assert(rejected,'isolated root accepted');
  root.id='dns-negative-anchor';root.mechanics=[{id:'bad-portal',type:'portals',links:[{id:'bad',x:544,y:388,width:40,height:76,to:{room:'com-base',anchor:'missing'}}]}];g.registerRoom(root);recipe.rooms.find(r=>r.id==='root-core').template=root.id;rejected=false;
  try{g.compile(recipe);}catch(e){rejected=e.message.includes('Unknown anchor');}assert(rejected,'missing destination accepted');
});
test('dns v3: electrical warning and safe windows cause actual timed damage',()=>{
  setup(7);const h=phaseData.mechanics.find(m=>m.type==='parkour-hazards').hazards[0];player.x=h.x;player.y=h.y;player.health=100;damageCooldown=0;
  levelRuntime.update(h.warning-.1,{keys:new Set(),repairNearby:false});assert(player.health===100,'warning damages player');
  levelRuntime.update(.2,{keys:new Set(),repairNearby:false});assert(player.health===100-h.damage,'active current causes no damage');
  damageCooldown=0;levelRuntime.update(h.active+.1,{keys:new Set(),repairNearby:false});assert(player.health===100-h.damage,'safe window damages player');
});
setup(7);endPhaseIntro();xpRequired=999999;viruses.forEach(v=>v.alive=false);
test('dns v3: every temporary scaffold disappears and respawns in the real runtime',()=>{
  for(const p of phaseData.entities.platforms.filter(p=>p.type==='temporary')){
    player.x=p.x+24;player.y=p.y-player.height;player.vy=0;player.grounded=true;keys.clear();movePlayer(1/120);assert(getPlatformState(p).triggered,'not triggered '+p.id);
    for(let t=0;t<(p.duration+.1)*120;t++)update(1/120);assert(!platformShape(p),'did not disappear '+p.id);
    player.x=swStart.x;player.y=swStart.y;player.vy=0;
    for(let t=0;t<(p.respawnDelay+.1)*120;t++)update(1/120);assert(platformShape(p),'did not respawn '+p.id);
  }
});
test('dns v3: all horizontal and vertical lifts carry the player',()=>{
  components.forEach(c=>c.repaired=true);
  for(const p of phaseData.entities.platforms.filter(p=>p.type==='moving')){
    advancePlatformMotion(.1);const before=platformShape(p);player.x=before.x+24;player.y=before.y-player.height;player.grounded=true;
    const x=player.x,y=player.y;advancePlatformMotion(.1);const after=platformShape(p);
    assert(Math.abs(player.x-x-after.x+before.x)<.01&&Math.abs(player.y-y-after.y+before.y)<.01,'carry mismatch '+p.id);
    assert(Math.abs(after.x-before.x)+Math.abs(after.y-before.y)>0,'lift stationary '+p.id);
  }
});
report.dns.cameraProbes=[];
for(const [vw,vh] of [[320,568],[844,390],[1280,720]]){
  const map={width:worldWidth(),height:worldHeight(),axes:phaseData.map.camera.axes,offsetX:.44,offsetY:.55};
  const body={...player,x:800,y:swStart.y,vx:0,vy:-400,grounded:false};let view={width:vw,height:vh,x:Math.max(0,800-vw*.44),y:Math.max(0,Math.min(worldHeight()-vh,swStart.y-vh*.55))},maxDelta=0,visible=true;
  for(const direction of [-1,1])for(let t=0;t<1440;t++){
    body.y=direction===-1?swStart.y-(swStart.y-400)*t/1439:400+(swStart.y-400)*t/1439;body.vy=direction*400;
    const next=experience.camera(body,view,map,1/120);maxDelta=Math.max(maxDelta,Math.abs(next.y-view.y));view={...view,...next};
    visible=visible&&body.y>=view.y&&body.y+48<=view.y+vh&&view.y>=0&&view.y<=map.height-vh;
  }
  body.vy=0;body.grounded=true;for(let t=0;t<240;t++)view={...view,...experience.camera(body,view,map,1/120)};
  const settled=view.y;for(let t=0;t<240;t++)view={...view,...experience.camera(body,view,map,1/120)};
  test('dns v3: stable full-height camera / '+vw+'x'+vh,()=>assert(visible&&maxDelta<20&&Math.abs(view.y-settled)<.01,'camera loses body, jumps or jitters'));
  report.dns.cameraProbes.push({viewport:[vw,vh],bodyAlwaysVisible:visible,maxVerticalDelta:maxDelta,stationaryDrift:Math.abs(view.y-settled)});
}
setup(0);xp=37;saveCampaign();document.getElementById('settingsButton').click();
const campaignBeforeRouterTest=localStorage.getItem(SAVE_KEY),historyBeforeRouterTest=localStorage.getItem(QUESTION_HISTORY_KEY);
const dnsDevToggle=document.getElementById('developerModeToggle');dnsDevToggle.checked=true;dnsDevToggle.dispatchEvent(new Event('change'));
document.getElementById('developerSelectPhase').click();document.querySelector('#developerPhaseList [data-phase="7"]').click();await levelVisuals.ready;
test('dns v3: direct developer access uses the real rebuilt city',()=>assert(phaseIndex===7&&phaseData.revision===5&&phaseData.generation.rooms.length===33&&running&&player.x===mapStart().x&&player.y===mapStart().y&&!levelVisuals.errors.length&&components.every(c=>!c.repaired),'developer phase 8 mismatch'));
components[0].repaired=true;pause();document.querySelectorAll('.developer-pause-actions button')[1].click();
test('dns v3: developer restart restores city objectives without campaign writes',()=>assert(phaseIndex===7&&components.every(c=>!c.repaired)&&viruses.every(v=>v.alive)&&checkpointIndex===-1&&localStorage.getItem(SAVE_KEY)===campaignBeforeRouterTest&&localStorage.getItem(QUESTION_HISTORY_KEY)===historyBeforeRouterTest,'test restart leaked'));
document.getElementById('settingsButton').click();dnsDevToggle.checked=false;dnsDevToggle.dispatchEvent(new Event('change'));document.getElementById('closeSettings').click();
test('dns v3: leaving dns developer test restores normal campaign',()=>assert(!developerSession&&phaseIndex===0&&xp===37&&localStorage.getItem(SAVE_KEY)===campaignBeforeRouterTest,'normal campaign changed'));
report.dns.duration={humanMinutes:null,targetMinutes:[15,25],limitations:'Probes relocate between proven surfaces, solve puzzles through DOM and protect against combat damage; not an uninterrupted playthrough.'};
running=false;
