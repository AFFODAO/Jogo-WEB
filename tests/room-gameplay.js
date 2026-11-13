const gameplayService=ByteRunner.proceduralMaps;
const gameplayThemes=ByteRunner.environmentArt.themes;
const gameplayMaps=[];
test('room gameplay: deterministic population across ten themes and three difficulties',()=>{
  const roles=new Set(),combinations=new Set();
  for(const theme of gameplayThemes)for(const difficulty of [1,3,5]) {
    const options={seed:'content-'+theme,theme,difficulty,roomCount:12,optionalRatio:.4};
    const map=gameplayService.generateGameplay(options),repeat=gameplayService.generateGameplay(options);
    assert(JSON.stringify(map)===JSON.stringify(repeat),'population not reproducible '+theme);
    assert(!gameplayService.validateGameplay(map).length,'invalid gameplay '+theme);
    assert(map.generation.gameplay.mandatoryRepairs.length>0,'no mandatory relay');
    assert(map.entities.enemies.length>0,'no combat content '+theme+'/'+difficulty);
    const variant={software:'file',switch:'packet',wifi:'wifi',dns:'dns',firewall:'firewall'}[theme];
    if(variant)assert(map.entities.enemies.some(e=>e.variant===variant),'thematic enemy missing '+theme);
    assert(map.generation.gameplay.rooms.every(r=>r.spent<=r.budget&&r.enemies.length<=r.maximum),'encounter exceeds budget');
    for(const room of map.generation.gameplay.rooms){roles.add(room.type);if(room.enemies.length)combinations.add(room.enemies.map(id=>map.entities.enemies.find(e=>e.id===id).type).join('+'));}
    assert(map.generation.gameplay.rooms.filter(r=>['initial','final','repair','parkour'].includes(r.type)).every(r=>!r.enemies.length),'combat stacked on rest or parkour');
    gameplayMaps.push(map);
  }
  assert(roles.size===8&&combinations.size>=5,'room types or combinations missing');
});
test('room gameplay: generated relays run each of the ten existing minigame types',()=>{
  for(const theme of gameplayThemes) {
    setup(0);loadMap(gameplayMaps.find(m=>m.theme===theme),true);campaignStarted=false;running=true;xpRequired=999999;
    if(theme==='software')assert(levelVisuals.hasAsset('virus-fast'),'thematic file reinforcements lack their sprite');
    assert(levelVisuals.themeIndex===gameplayThemes.indexOf(theme),'renderer resolved campaign slot instead of room theme');
    levelVisuals.prepareTerrain(solids());
    assert(ByteRunner.art.platform(ctx,levelVisuals,solids()[0],animationTime,0,{x:0,y:0,width:worldWidth(),height:worldHeight()}),'themed terrain fell back to generic rendering '+theme);
    const c=components[0];player.x=c.x;player.y=c.y;keys.add('e');updateRepair(0);keys.clear();
    assert(repairSession?.model&&repairSession.blocksWorld,'native minigame not opened '+theme);
    solveRepairUI();updateRepair(.6);assert(c.repaired&&!repairSession,'native minigame did not complete '+theme);
  }
});
test('room gameplay: mandatory self-dependencies and unsafe enemy placement are rejected',()=>{
  const source=gameplayService.generateGameplay({seed:'negative',difficulty:3});
  const self=ByteRunner.maps.clone(source),id=self.generation.gameplay.mandatoryRepairs[0];self.entities.components.find(c=>c.id===id).requires={component:id};
  assert(gameplayService.validateGameplay(self).some(e=>e.includes('cyclic')),'self-locked repair accepted');
  const blocked=ByteRunner.maps.clone(source),component=blocked.entities.components.find(c=>c.id===id);
  blocked.entities.gates.push({id:'bad-self-door',x:component.x-20,y:component.y-30,width:16,height:74,opensWhen:{component:id}});
  assert(gameplayService.validateGameplay(blocked).some(e=>e.includes('cyclic')),'self-locked corridor accepted');
  const enemy=ByteRunner.maps.clone(source),point=enemy.map.checkpoints[0];Object.assign(enemy.entities.enemies[0],{x:point.x+55,y:point.y-24});
  assert(gameplayService.validateGameplay(enemy).some(e=>e.includes('respawn')),'unsafe respawn accepted');
});
test('room gameplay: seeded size extremes retain safe content and mandatory repair access',()=>{
  for(let seed=0;seed<12;seed++) {
    const map=gameplayService.generateGameplay({seed,theme:gameplayThemes[seed%10],roomCount:[8,12,16,24][seed%4],difficulty:seed%5+1,optionalRatio:[.2,.4,.7][seed%3]});
    assert(!gameplayService.validateGameplay(map).length,'unsafe seed '+seed);
  }
});
test('room gameplay: required combat budgets rise with selected difficulty',()=>{
  const budgets=d=>gameplayService.generateGameplay({seed:'ramp',difficulty:d}).generation.gameplay.rooms.filter(r=>r.type==='combat').map(r=>r.budget);
  const low=budgets(1),high=budgets(5);assert(high.length===low.length&&high.every((b,i)=>b>=low[i])&&high.some((b,i)=>b>low[i]),'difficulty does not increase combat budget');
});
test('room gameplay: existing generator API supports content opt-in and theme progression',()=>{
  const options={seed:'api-content',theme:'wifi',gameplay:true};
  const a=gameplayService.generate(options),b=gameplayService.generateGameplay(options);
  assert(JSON.stringify(a)===JSON.stringify(b)&&a.generation.gameplay,'primary generator did not integrate content');
  assert(gameplayService.generateGameplay({seed:0,theme:'hardware'}).generation.gameplay.difficulty===1&&gameplayService.generateGameplay({seed:0,theme:'servers'}).generation.gameplay.difficulty===5,'theme difficulty progression missing');
  assert(!gameplayService.generate({seed:0}).generation.gameplay,'legacy geometry generator changed');
});
const gameplayRuntimeMap=gameplayService.generateGameplay({seed:'runtime-content',difficulty:3});
setup(0);loadMap(gameplayRuntimeMap,true);campaignStarted=false;running=true;xpRequired=999999;
let gameplayReachable=[];
test('room gameplay: all eight room roles and repairs are physically accessible with base abilities',()=>{
  assert(!unlockedSkills.length&&player.jumpPower===JUMP_SPEED,'optional skill applied');
  for(let round=0;round<=components.length;round++) {
    player.x=mapStart().x;player.y=mapStart().y;player.vy=0;player.grounded=true;gameplayReachable=reachability();let changed=false;
    for(const c of components.filter(c=>!c.repaired)) {
      const stand=gameplayReachable.find(n=>Math.abs(c.y+22-n.y-24)<78&&n.z+51>=c.x&&n.a-51<=c.x);
      if(!stand)continue;
      player.x=Math.max(stand.a,Math.min(stand.z,c.x));player.y=stand.y;keys.add('e');updateRepair(0);keys.clear();
      assert(repairSession?.model,'existing modal minigame missing');solveRepairUI();updateRepair(.6);assert(c.repaired,'minigame did not repair');changed=true;
    }
    if(!changed)break;
  }
  assert(components.every(c=>c.repaired),'repair unreachable');
  for(const p of phaseData.map.checkpoints)assert(gameplayReachable.some(n=>p.x>=n.a&&p.x<=n.z&&Math.abs(n.y+48-p.y)<2),'room checkpoint unreachable');
  assert(new Set(phaseData.generation.gameplay.rooms.map(r=>r.type)).size===8,'room type missing');
});
test('room gameplay: repairs restore decks/lifts, remove roofs and unlock optional cache doors',()=>{
  for(const c of components) {
    const prefix=c.id.split(':')[0],deck=phaseData.entities.platforms.find(p=>p.id===prefix+':service-deck'),lift=phaseData.entities.platforms.find(p=>p.id===prefix+':service-lift');
    c.repaired=false;assert(!platformShape(deck)&&!platformShape(lift),'repair effect enabled early');c.repaired=true;
    assert(platformShape(deck)&&platformShape(lift),'repair did not restore platforms');
    assert(!solids().some(s=>s.id?.startsWith(prefix+':')&&s.id.includes('roof')),'maintenance roof stayed locked');
    advancePlatformMotion(.1);const before=platformShape(lift);player.x=before.x+20;player.y=before.y-player.height;player.grounded=true;advancePlatformMotion(.1);assert(player.y!==before.y-player.height,'generated lift cannot carry player');
  }
  assert(!solids().some(s=>s.id?.endsWith(':cache-door')),'cache door did not open');
  const links=levelRuntime.connections().filter(l=>/service-out|cache-back/.test(l.id));assert(links.length===2,'repair shortcut is not bidirectional');
  for(const link of links) {
    player.x=link.x;player.y=link.y+link.height-player.height;
    levelRuntime.update(.6,{keys:new Set(),repairNearby:false});levelRuntime.update(.016,{keys:new Set(['e']),repairNearby:false});
    assert(player.x===link.to.x&&player.y===link.to.y,'repair shortcut misdirected');
    assert(solids().some(s=>Math.abs(s.y-player.y-player.height)<2&&player.x<s.x+s.w&&player.x+player.width>s.x),'shortcut lacks permanent landing');
  }
  for(const panel of phaseData.entities.interactives.filter(s=>s.id.endsWith(':secret-panel'))) {
    const stand=gameplayReachable.find(n=>n.a<=panel.x&&n.z>=panel.x&&Math.abs(n.y+48-panel.y-panel.height)<2);assert(stand,'secret entrance unreachable');
    player.x=panel.x;player.y=stand.y;levelRuntime.update(.6,{keys:new Set(),repairNearby:false});levelRuntime.update(.016,{keys:new Set(['e']),repairNearby:false});
    assert(levelRuntime.getFlag(panel.flag)&&solids().some(s=>s.id===panel.id.replace('secret-panel','secret-cache-step')),'secret panel did not reveal cache route');
  }
  player.x=mapStart().x;player.y=mapStart().y;player.vy=0;player.grounded=true;gameplayReachable=reachability();
});
test('room gameplay: generated enemies can be defeated by base projectiles',()=>{
  for(const enemy of viruses) {
    const positions=gameplayReachable.flatMap(n=>[n.a,n.z,(n.a+n.z)/2].map(x=>({n,x,score:Math.abs(Math.abs(x-enemy.x)-140)+Math.abs(n.y+22-enemy.y)*3})))
      .filter(p=>Math.abs(p.n.y+22-enemy.y)<120&&p.x+17>=enemy.activationRegion.x&&p.x+17<=enemy.activationRegion.x+enemy.activationRegion.width).sort((a,b)=>a.score-b.score);
    for(const p of positions.slice(0,10)) {
      player.x=p.x;player.y=p.n.y;player.vy=0;player.grounded=true;damageCooldown=99999;projectiles=[];keys.clear();keys.add('j');
      for(let t=0;t<600&&enemy.alive;t++){player.facing=enemy.x>=player.x+17?1:-1;if(player.y+22>enemy.y+enemy.radius+5&&player.grounded)jumpQueued=true;movePlayer(1/60);updateCombat(1/60);}
      if(!enemy.alive)break;
    }
    keys.clear();assert(!enemy.alive,'base attack cannot defeat '+enemy.id+'/'+enemy.type);
  }
});
test('room gameplay: secret and risk rewards are collectible without optional skills',()=>{
  for(const collectible of collectibles) {
    for(const n of gameplayReachable.filter(n=>n.z+34>=collectible.x-10&&n.a<=collectible.x+10&&n.y+24-collectible.y>=-35&&n.y+24-collectible.y<165)) {
      player.x=Math.max(n.a,Math.min(n.z,collectible.x-17));player.y=n.y;player.vy=0;player.grounded=true;jumpQueued=true;keys.clear();
      for(let t=0;t<80&&!collectible.collected;t++){movePlayer(1/60);updateCollectibles(1/60);}if(collectible.collected)break;
    }
    assert(collectible.collected,'reward unreachable '+collectible.id);
  }
});
test('room gameplay: every checkpoint is stable before repairs and death preserves completed repairs',()=>{
  setup(0);loadMap(gameplayRuntimeMap,true);campaignStarted=false;running=true;
  for(const [i,point] of phaseData.map.checkpoints.entries()) {
    checkpointIndex=i;checkpointX=point.x;checkpointY=point.y;respawnAtCheckpoint();const x=player.x,y=player.y;
    for(let t=0;t<60;t++)movePlayer(1/60);
    assert(player.grounded&&Math.abs(player.x-x)<.1&&Math.abs(player.y-y)<.1,'unstable generated checkpoint');
  }
  components[0].repaired=true;damageCooldown=0;player.health=1;damagePlayer(20,{x:0});assert(components[0].repaired&&combatDefeat&&player.health===0,'death reset completed repair');restartFromCheckpoint();
});
setup(0);loadMap(gameplayRuntimeMap,true);campaignStarted=false;await levelVisuals.ready;
const gameplayView={width,height,pixelRatio,cameraX,cameraY,cw:canvas.width,ch:canvas.height};
width=768;height=768;pixelRatio=1;canvas.width=768;canvas.height=768;ctx.setTransform(1,0,0,1,0,0);animationTime=1;damageCooldown=0;
for(const type of ['initial','exploration','parkour','combat','repair','reward','secret','final']) {
  const role=phaseData.generation.gameplay.rooms.find(r=>r.type===type),room=phaseData.generation.rooms.find(r=>r.id===role.id);
  cameraX=room.x;cameraY=room.y;player.x=room.x+96;player.y=room.y+672;draw();report.snapshots.push({phase:1,position:'room-gameplay-'+type,image:captureCanvas()});
}
width=gameplayView.width;height=gameplayView.height;pixelRatio=gameplayView.pixelRatio;cameraX=gameplayView.cameraX;cameraY=gameplayView.cameraY;canvas.width=gameplayView.cw;canvas.height=gameplayView.ch;ctx.setTransform(pixelRatio,0,0,pixelRatio,0,0);
running=false;
