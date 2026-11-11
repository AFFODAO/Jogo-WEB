test('last five: every repair restores an actual connection',()=>{
  const signature=()=>JSON.stringify({shapes:solids().filter(s=>s.id).map(s=>[s.id,s.x,s.y]),portals:levelRuntime.connections().map(p=>p.id),cameras:phaseData.mechanics.filter(m=>m.type==='security-grid').flatMap(m=>m.cameras.filter(c=>!(c.disabledWhen&&levelRuntime.matches(c.disabledWhen))).map(c=>c.id))});
  for(let i=5;i<10;i++) {
    setup(i);
    for(const c of components){const before=signature();c.repaired=true;assert(signature()!==before,'repair without consequence: '+phaseData.id+'/'+c.id);}
  }
});
test('last five: objects remain clear of geometry after restoration',()=>{
  for(let i=5;i<10;i++) {
    setup(i);components.forEach(c=>c.repaired=true);fulfilGoalsForQuestionTest();
    const boxes=solids();
    for(const c of components)assert(!boxes.some(s=>overlaps(c,s)),'restored platform clips component '+phaseData.id+'/'+c.id);
    for(const v of viruses)assert(!boxes.some(s=>v.x+v.radius>s.x&&v.x-v.radius<s.x+s.w&&v.y+v.radius>s.y&&v.y-v.radius<s.y+s.h),'restored platform clips enemy '+phaseData.id+'/'+v.id);
    for(const c of collectibles)assert(!boxes.some(s=>c.x+c.radius>s.x&&c.x-c.radius<s.x+s.w&&c.y+c.radius>s.y&&c.y-c.radius<s.y+s.h),'restored platform clips fragment '+phaseData.id+'/'+c.id);
  }
});
test('last five: all checkpoint landings stable before repairs',()=>{
  for(let i=5;i<10;i++) {
    setup(i);
    for(const [index,point] of phaseData.map.checkpoints.entries()) {
      checkpointX=point.x;checkpointY=point.y;checkpointIndex=index;respawnAtCheckpoint();const x=player.x,y=player.y;
      for(let t=0;t<60;t++)movePlayer(1/60);
      assert(player.grounded&&player.x===x&&Math.abs(player.y-y)<1,'unstable checkpoint '+phaseData.id+'/'+index);
    }
  }
});
test('last five: repaired elevators and IP leases transport the player',()=>{
  for(const [index,id] of [[5,'basement-power:service-lift'],[5,'central-main:service-lift'],[5,'shaft-west-mid:service-lift'],[6,'reserve-main:lease-platform'],[9,'airlock-elevator']]) {
    setup(index);const p=phaseData.entities.platforms.find(p=>p.id===id);assert(!platformShape(p),'service lift starts enabled '+id);
    components.forEach(c=>c.repaired=true);fulfilGoalsForQuestionTest();advancePlatformMotion(.01);const before=platformShape(p);
    player.x=before.x+30;player.y=before.y-player.height;player.grounded=true;advancePlatformMotion(.2);const after=platformShape(p);
    assert(Math.abs(player.x-(before.x+30)-(after.x-before.x))<.01&&Math.abs(player.y-(before.y-player.height)-(after.y-before.y))<.01,'lift carry incorrect '+id);
    assert(after.x!==before.x||after.y!==before.y,'lift is decorative '+id);
  }
});
test('last five: IP services are mandatory and gateways never trap arrivals',()=>{
  setup(6);components.forEach(c=>c.repaired=true);viruses.forEach(v=>v.alive=false);checkObjectives();assert(!phaseExitUnlocked,'DHCP services skipped');
  for(const s of phaseData.entities.interactives){player.x=s.x;player.y=s.y-8;levelRuntime.update(.6,{keys:new Set(),repairNearby:false});levelRuntime.update(.016,{keys:new Set(['e']),repairNearby:Boolean(findNearbyComponent())});assert(levelRuntime.getFlag(s.flag),'service cannot activate '+s.id);}
  checkObjectives();assert(phaseExitUnlocked,'gateway stays locked after services');saveCampaign();continueCampaign();assert(phaseData.entities.interactives.every(s=>levelRuntime.getFlag(s.flag)),'DHCP services not saved');
  for(const index of [6,7]) {
    setup(index);components.forEach(c=>c.repaired=true);fulfilGoalsForQuestionTest();
    for(const link of levelRuntime.connections()){
      player.x=link.x;player.y=link.y+link.height-player.height;levelRuntime.update(.6,{keys:new Set(),repairNearby:false});levelRuntime.update(.016,{keys:new Set(['e']),repairNearby:Boolean(findNearbyComponent())});
      assert(player.x===link.to.x&&player.y===link.to.y,'resolver/gateway not usable '+link.id);
      assert(!solids().some(s=>s.collision!=='one-way'&&overlaps(player,s)),'portal arrival in solid '+link.id);
      assert(solids().some(s=>Math.abs(player.y+player.height-s.y)<2&&player.x+player.width>s.x&&player.x<s.x+s.w),'portal arrival without support '+link.id);
    }
  }
});
test('last five: security cameras warn, fire and shut down after repair',()=>{
  setup(8);viruses=[];const camera=phaseData.mechanics.find(m=>m.type==='security-grid').cameras[0];
  player.x=camera.x-17;player.y=camera.region.y+camera.region.height-player.height;damageCooldown=0;
  levelRuntime.update(camera.windup-.1,{keys:new Set(),repairNearby:false});assert(!enemyProjectiles.length,'camera fired without warning');
  levelRuntime.update(.2,{keys:new Set(),repairNearby:false});assert(enemyProjectiles.length===1,'camera is not functional');
  for(let t=0;t<120;t++)updateHostileProjectiles(1/60);assert(player.health<100,'camera shot cannot hit');
  components.find(c=>c.id===camera.disabledWhen.component).repaired=true;enemyProjectiles=[];for(let t=0;t<600;t++)levelRuntime.update(1/60,{keys:new Set(),repairNearby:false});assert(!enemyProjectiles.length,'restored policy did not disable camera');
});
test('last five: laser cycles are predictable and can be jumped normally',()=>{
  setup(8);const laser=phaseData.mechanics.find(m=>m.type==='parkour-hazards').hazards.find(h=>h.kind==='laser');
  const warningStart=laser.period-laser.phase, activeStart=warningStart+laser.warning;
  const status=time=>ByteRunner.parkourHazards.status(laser,time);
  assert(status(warningStart+.1)==='warning'&&status(activeStart+.1)==='active'&&status(activeStart+laser.active+.1)==='safe','laser cycle drift');
  const tick=dt=>levelRuntime.update(dt,{keys:new Set(),repairNearby:false});
  player.x=laser.x;player.y=laser.y;damageCooldown=0;tick(warningStart+.1);
  assert(player.health===100,'laser damaged during warning');tick(laser.warning);
  assert(player.health<100,'active laser caused no damage');
  player.health=100;damageCooldown=0;player.x=laser.x-62;player.y=laser.y+laser.height-player.height;player.vy=0;player.grounded=true;jumpQueued=true;keys.add('d');
  for(let t=0;t<36;t++){movePlayer(1/60);tick(1/60);}
  keys.clear();assert(player.health===100&&player.x>laser.x+laser.width,'laser cannot be avoided with normal jump');
});
test('last five: arena protection, phase grace and cover weak points',()=>{
  setup(9);const boss=viruses.find(v=>v.multiStage);
  for(let i=0;i<components.length;i++){components.forEach(c=>c.repaired=true);components[i].repaired=false;const hp=boss.hp;damageVirus(boss,50);assert(boss.hp===hp&&solids().some(s=>s.id==='core-access-lock'),'core opens with relay missing '+i);}
  components.forEach(c=>c.repaired=true);assert(!solids().some(s=>s.id==='core-access-lock'),'restored core gate stuck');
  boss.hp=boss.maxHp;damageVirus(boss,1000);assert(Math.abs(boss.hp-boss.maxHp*.67)<.001,'high damage skipped boss stage');
  player.x=boss.x-180;player.y=bossGroundY(boss)-48;updateVirusZero(boss,.01,player.x+17,player.y+24);const hp=boss.hp;damageVirus(boss,1000);assert(boss.hp===hp&&boss.bossPhaseTransitionTime>0,'phase grace not protected');
  for(let t=0;t<40;t++)updateVirusZero(boss,1/60,player.x+17,player.y+24);assert(boss.attackWindup>0,'phase change lacks fresh telegraph');
  boss.hp=boss.maxHp;boss.bossStage=1;boss.bossPhaseTransitionTime=0;boss.vulnerableTime=0;boss.attackWindup=0;boss.chargeTime=0;boss.bossCycleCooldown=0;boss.x=5252;boss.baseX=5252;boss.speed=0;viruses=[boss];player.x=5080;player.y=852;player.health=100;damageCooldown=0;boss.bossAttackKind='charge';boss.bossAttackDirection=-1;
  triggerVirusZeroAttack(boss,player.x+17,player.y+24);for(let t=0;t<12;t++)updateCombat(1/60);
  assert(boss.x>=5250&&boss.vulnerableTime>1.4&&player.health===100,'cover does not stop charge/expose weak point');
  boss.bossStage=3;boss.bossAttackKind='surge';enemyObstacles=[];triggerVirusZeroAttack(boss,player.x+17,player.y+24);assert(enemyObstacles.every(o=>o.y+o.h===900),'boss hazards use world bottom instead of arena floor');
  boss.x=boss.bossBounds.left+150;player.x=5500;enemyObstacles=[];triggerVirusZeroAttack(boss,player.x+17,player.y+24);assert(!enemyObstacles.some(o=>boss.x+boss.radius>o.x&&boss.x-boss.radius<o.x+o.w&&boss.y+boss.radius>o.y&&boss.y-boss.radius<o.y+o.h),'pillar traps its own boss');
});
test('last five: old map saves restart safely with progression intact',()=>{
  for(let i=5;i<10;i++){
    setup(i);level=4;xp=63;unlockedSkills=[{id:'cannon',level:2}];restoreSkillEffects();components[0].repaired=true;saveCampaign();const saved=getSavedCampaign();delete saved.mapRevision;saved.player.x=1;saved.player.y=1;localStorage.setItem(SAVE_KEY,JSON.stringify(saved));continueCampaign();
    assert(level===4&&xp===63&&player.damage===3&&player.x===mapStart().x&&player.y===mapStart().y&&components.every(c=>!c.repaired),'old save unsafe in '+phaseData.id);
  }
});
running=false;
