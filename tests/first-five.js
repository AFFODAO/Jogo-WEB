test('rebuilt maps: every repair changes scenery or mechanics',()=>{
  const signature=()=>JSON.stringify({geometry:solids().filter(s=>s.id).map(s=>[s.id,s.x,s.y]),portals:levelRuntime.connections().map(p=>p.id),zones:phaseData.mechanics.filter(m=>m.type==='environment').flatMap(m=>m.zones.filter(z=>levelRuntime.matches(z.requires)&&!(z.disabledWhen&&levelRuntime.matches(z.disabledWhen))).map(z=>z.id))});
  for(let i=0;i<5;i++) {
    setup(i);
    for(const c of components){const before=signature();c.repaired=true;assert(signature()!==before,'repair has no world effect: '+phaseData.id+'/'+c.id);}
  }
});
test('rebuilt maps: fans and radio interference affect physics and weapons',()=>{
  setup(0);const fan=phaseData.mechanics.find(m=>m.type==='environment').zones[0];player.x=fan.x+20;player.y=fan.y+20;player.vy=0;player.grounded=false;
  const x=player.x;movePlayer(.1);assert(player.x>x+4,'fan does not push');components.find(c=>c.id===fan.disabledWhen.component).repaired=true;const after=player.x;movePlayer(.1);assert(player.x===after,'fan not disabled by CPU repair');
  const hazard=phaseData.mechanics.find(m=>m.type==='parkour-hazards').hazards[0];player.x=hazard.x;player.y=hazard.y;damageCooldown=0;player.health=100;levelRuntime.update(hazard.warning+.1,{keys:new Set(),repairNearby:false});assert(player.health===100-hazard.damage,'warned thermal circuit does not cause real damage');
  setup(4);const interference=phaseData.mechanics.filter(m=>m.type==='environment').flatMap(m=>m.zones).find(z=>z.speedMultiplier<1);player.x=interference.x+24;player.y=interference.y+16;player.vy=0;player.grounded=true;keys.add('d');const start=player.x;movePlayer(.1);keys.clear();
  assert(player.x-start<25.5&&player.x-start>18,'radio movement modifier');
  player.facing=1;fireProjectile();const weakSpeed=projectiles.at(-1).vx,weakCooldown=attackCooldown;
  assert(weakSpeed<570&&weakCooldown>player.fireRate,'radio does not affect combat');
  components.find(c=>c.id===interference.disabledWhen.component).repaired=true;fireProjectile();assert(projectiles.at(-1).vx===570&&attackCooldown===player.fireRate,'AP repair does not restore combat');
  unlockedSkills=[{id:'rapid',level:3},{id:'cannon',level:2}];restoreSkillEffects();fireProjectile();assert(projectiles.at(-1).damage===1&&attackCooldown<.32,'radio replaced campaign abilities');
});
test('rebuilt maps: directories and interfaces have safe actual destinations',()=>{
  for(const i of [1,3]) {
    setup(i);components.forEach(c=>c.repaired=true);
    for(const link of levelRuntime.connections()) {
      player.x=link.x;player.y=link.y+link.height-player.height;
      levelRuntime.update(.6,{keys:new Set(),repairNearby:false});levelRuntime.update(.016,{keys:new Set(['e']),repairNearby:Boolean(findNearbyComponent())});
      assert(player.x===link.to.x&&player.y===link.to.y,'portal did not run: '+link.id);
      assert(!solids().some(s=>s.collision!=='one-way'&&overlaps(player,s)),'portal inside wall: '+link.id);
      assert(solids().some(s=>Math.abs(s.y-player.y-player.height)<3&&player.x+player.width>s.x&&player.x<s.x+s.w),'portal lacks landing surface: '+link.id);
      const tx=player.x,ty=player.y;levelRuntime.update(.7,{keys:new Set(['e']),repairNearby:false});assert(player.x===tx&&player.y===ty,'held E created teleport loop');
    }
  }
  setup(1);player.x=120;player.y=1202;levelRuntime.update(.6,{keys:new Set(),repairNearby:false});levelRuntime.update(.016,{keys:new Set(['e']),repairNearby:false});assert(player.x===120&&player.y===1202,'locked directory bypassed restoration');
});
test('rebuilt maps: active ports remain mandatory and saved',()=>{
  setup(2);components.forEach(c=>c.repaired=true);viruses.forEach(v=>v.alive=false);checkObjectives();assert(!phaseExitUnlocked,'switch exit ignores Ethernet ports');
  for(const spec of phaseData.entities.interactives) {
    player.x=spec.x;player.y=spec.y-8;levelRuntime.update(.6,{keys:new Set(),repairNearby:false});levelRuntime.update(.016,{keys:new Set(['e']),repairNearby:Boolean(findNearbyComponent())});
    assert(levelRuntime.getFlag(spec.flag),'port activation failed');
  }
  checkObjectives();assert(phaseExitUnlocked,'active ports do not release uplink');saveCampaign();continueCampaign();assert(phaseData.entities.interactives.every(p=>levelRuntime.getFlag(p.flag))&&phaseExitUnlocked,'port state not restored');
});
test('rebuilt maps: free checkpoints and legacy map saves',()=>{
  setup(1);for(const index of [0,2,0]){const point=phaseData.map.checkpoints[index];player.x=point.x;player.y=point.y-player.height;updateCheckpoints();assert(checkpointIndex===index,'checkpoint cannot return to earlier room');}
  saveCampaign();continueCampaign();assert(checkpointIndex===0&&checkpointY===phaseData.map.checkpoints[0].y,'room checkpoint save');
  setup(0);xp=47;unlockedSkills=[{id:'cannon',level:2}];restoreSkillEffects();components[0].repaired=true;saveCampaign();const saved=getSavedCampaign();saved.mapRevision=1;saved.player.x=2400;saved.player.y=500;saved.checkpointX=1850;localStorage.setItem(SAVE_KEY,JSON.stringify(saved));continueCampaign();
  assert(player.x===mapStart().x&&player.y===mapStart().y&&components.every(c=>!c.repaired)&&xp===47&&player.damage===1&&skillRank('cannon')===2,'old layout save not migrated safely');
  xp=xpRequired;openLevelChoice();const pending=getSavedCampaign();pending.mapRevision=1;localStorage.setItem(SAVE_KEY,JSON.stringify(pending));continueCampaign();assert(levelChoiceOpen&&level===2,'layout migration lost pending skill');
});
test('rebuilt maps: checkpoints are stable before any repairs',()=>{
  for(let i=0;i<5;i++) {
    setup(i);
    for(const [index,point] of phaseData.map.checkpoints.entries()) {
      checkpointIndex=index;checkpointX=point.x;checkpointY=point.y;respawnAtCheckpoint();const x=player.x,y=player.y;
      for(let t=0;t<60;t++)movePlayer(1/60);
      assert(player.x===x&&Math.abs(player.y-y)<1&&player.grounded,'unstable checkpoint '+phaseData.id+'/'+index);
    }
  }
});
test('rebuilt maps: unstable signals cycle and windows carry the player',()=>{
  setup(4);xpRequired=999999;viruses.forEach(v=>v.alive=false);const signal=phaseData.entities.platforms.find(p=>p.type==='temporary');
  player.x=signal.x+30;player.y=signal.y-player.height;player.vy=0;player.grounded=true;movePlayer(1/60);assert(getPlatformState(signal).triggered,'signal did not react to landing');
  for(let t=0;t<150;t++)update(1/60);assert(!platformShape(signal),'unstable signal did not disappear');
  for(let t=0;t<145;t++)update(1/60);assert(platformShape(signal),'unstable signal did not return');
  setup(1);const windowSpec=phaseData.entities.platforms.find(p=>p.type==='moving'&&p.motion.axis==='x');advancePlatformMotion(.1);const shape=platformShape(windowSpec);player.x=shape.x+20;player.y=shape.y-player.height;player.grounded=true;
  const x=player.x;advancePlatformMotion(.1);assert(player.x!==x&&player.y===shape.y-player.height,'moving window did not carry player');
});
test('rebuilt maps: objectives reachable at opposite movement extremes',()=>{
  for(const index of [1,4])for(const time of [Math.PI/(2*.65),3*Math.PI/(2*.65)]) {
    setup(index);animationTime=time;const start=mapStart();player.x=start.x;player.y=start.y;
    const reached=reachability();
    if(index===1)assert(reached.some(n=>Math.abs(n.y+24-components[0].y-22)<=78&&n.a<=components[0].x&&n.z+34>=components[0].x),'process repair unreachable at moving-window extreme');
    else for(const component of components)assert(reached.some(n=>Math.abs(n.y+24-component.y-22)<=78&&n.a<=component.x&&n.z+34>=component.x),'AP unreachable at signal extreme: '+component.id);
  }
});
running=false;
