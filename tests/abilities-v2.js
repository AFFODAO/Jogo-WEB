const equip=(id,rank=3)=>{unlockedSkills.push({id,level:rank,name:ABILITIES.find(a=>a.id===id).name,maxLevel:3});equipTestSkills();};
test('abilities v2: capped passives and base movement at every rank',()=>{
  setup(0);for(let r=1;r<=3;r++){
    unlockedSkills=ABILITIES.map(a=>({id:a.id,level:r}));equippedCombat=['armor','rapid','precision'];restoreSkillEffects();
    assert(player.armor<=.2&&player.fireRate>=.32*.85&&player.damage===1&&player.jumpPower===JUMP_SPEED,'power cap '+r);
    assert(ABILITIES.every(a=>a.maxLevel===3),'rank cap');
  }
  const armor=player.armor;damageCooldown=0;damagePlayer(20,{x:0});assert(player.health===84&&armor===.2,'actual armor');
});
test('abilities v2: shield is manual, brief, edge triggered and cannot auto-reactivate',()=>{
  setup(0);viruses=[];equip('shield');updateCombat(.01);assert(player.shieldTime===0,'automatic acquisition');
  window.dispatchEvent(new KeyboardEvent('keydown',{key:'q'}));updateCombat(.01);assert(player.shieldTime<=.65&&player.shieldTime>.6,'pulse duration');
  damageCooldown=0;damagePlayer(30,{x:0});assert(player.health===100,'pulse did not protect');
  for(let i=0;i<1700;i++){window.dispatchEvent(new KeyboardEvent('keydown',{key:'q',repeat:true}));updateCombat(.01);}
  assert(player.shieldTime===0&&skillRuntime.state.shieldCooldown===0,'automatic repetition');damageCooldown=0;damagePlayer(20,{x:0});assert(player.health<100,'permanent immunity');
  window.dispatchEvent(new KeyboardEvent('keyup',{key:'q'}));window.dispatchEvent(new KeyboardEvent('keydown',{key:'q'}));updateCombat(.01);assert(player.shieldTime>0,'fresh manual activation');
});
test('abilities v2: recovery has finite campaign charges and no upgrade refill exploit',()=>{
  setup(0);equip('recovery',1);const r=skillRuntime,p=player;
  assert(!r.activate('recovery',1,p),'spent at full health');
  p.health=30;assert(r.activate('recovery',1,p)&&p.health===50,'first heal');assert(!r.activate('recovery',1,p),'cooldown bypass');
  r.tick(20);assert(r.activate('recovery',1,p),'second charge');r.tick(20);assert(!r.activate('recovery',1,p),'unlimited charges');
  ABILITIES.find(a=>a.id==='recovery').apply(1);assert(!r.activate('recovery',1,p),'apply refilled charges');
  assert(r.activate('recovery',2,p),'rank two did not add one capacity');r.tick(20);assert(!r.activate('recovery',2,p),'rank two refill');
  const state=r.snapshot();r.restore(state);assert(!r.activate('recovery',2,p),'restore refill');
});
test('abilities v2: dash preserves platforming, has no invulnerability and stops at edges',()=>{
  setup(0);equip('boost');const oldSolids=solids;try{
    player.x=100;player.y=200;player.grounded=true;player.facing=1;
    solids=()=>[{x:50,y:248,w:500,h:20,collision:'solid'}];
    assert(skillRuntime.activate('boost',3,player),'dash rejected');movePlayer(1/120);assert(player.vx>RUN_SPEED,'no burst');
    assert(!skillRuntime.activate('boost',3,player),'dash spam');damageCooldown=0;damagePlayer(10,{x:0});assert(player.health===90,'dash immunity');
    player.x=520;player.y=200;player.grounded=true;movePlayer(1/120);assert(!skillRuntime.state.dashTime,'dash crossed edge');
    skillRuntime.tick(5);player.grounded=false;assert(!skillRuntime.activate('boost',3,player),'air dash');
    player.grounded=true;skillRuntime.activate('boost',3,player);jumpQueued=true;movePlayer(1/120);assert(!skillRuntime.state.dashTime&&player.jumpPower===JUMP_SPEED&&player.vx===0,'jump extended by dash');
  }finally{solids=oldSolids;}
});
test('abilities v2: precision rewards vulnerable hits with bounded extra damage',()=>{
  setup(0);equip('precision');const c=skillRuntime,v={vulnerableTime:1};let bonus=0;
  for(let i=0;i<100;i++)bonus+=c.precision(3,{vulnerableTime:0});assert(bonus===0,'unconditional damage');
  for(let i=0;i<4;i++)bonus+=c.precision(3,v);assert(bonus===1,'precision threshold');
  for(let i=0;i<40;i++)assert(!c.precision(3,v),'precision cooldown');c.tick(1.5);assert(c.precision(3,v)===1,'precision cooldown never ends');
  const geometry=solids;try{solids=()=>[];viruses=[{...ENEMY_PROFILES.basic,type:'basic',x:200,y:100,alive:true,hp:20,maxHp:20,radius:15,vulnerableTime:1}];
    skillRuntime=ByteRunner.abilities.create();for(let i=0;i<4;i++){projectiles=[{x:100,y:100,vx:1000,life:1,radius:5,damage:1}];updatePlayerProjectiles(.1);}
    assert(viruses[0].hp===15,'bonus not applied to real projectile');
  }finally{solids=geometry;}
});
test('abilities v2: explicit legacy migration preserves ranks, deduplicates and is idempotent',()=>{
  const api=ByteRunner.abilities;
  for(const [old,now] of [[1,1],[2,2],[3,2],[4,3],[5,3]])for(const a of ABILITIES){
    const first=api.migrate({unlockedSkills:[{id:a.id,level:old}]});assert(first[0].level===now,'migration '+a.id+' '+old);
    assert(api.migrate({skillSchema:2,unlockedSkills:first})[0].level===now,'migration twice');
  }
  const malformed=api.migrate({skillSchema:2,unlockedSkills:[{id:'shield',level:99},{id:'shield',level:1},{id:'bad',level:5},{id:'rapid',level:NaN},{id:'armor',level:2.9}]});
  assert(malformed.length===2&&malformed[0].level===3&&malformed[1].level===2,'malformed migration');
  setup(0);const saved=createCampaignSnapshot();delete saved.skillSchema;delete saved.progressionSchema;saved.unlockedSkills=[{id:'cannon',level:5},{id:'boost',level:4},{id:'recovery',level:3}];restoreCampaign(saved);
  assert(skillRank('cannon')===3&&skillRank('boost')===3&&skillRank('recovery')===2&&player.jumpPower===JUMP_SPEED,'actual migration');
  assert(getSavedCampaign().skillSchema===2,'migration not persisted');
});
test('abilities v2: cooldowns and spent supplies survive pause, map, save and checkpoint',()=>{
  setup(0);viruses=[];for(const id of ['shield','recovery','boost'])equip(id);player.health=30;
  skillRuntime.activate('recovery',3,player);skillRuntime.activate('shield',3,player);skillRuntime.activate('boost',3,player);
  pause();assert(!player.shieldTime&&!skillRuntime.state.dashTime,'active state frozen in pause');
  const spent=skillRuntime.snapshot();loadPhase(1,true);assert(skillRuntime.state.recoverySpent===1&&skillRuntime.state.shieldCooldown===16,'map refill');
  saveCampaign();restoreCampaign(createCampaignSnapshot());assert(skillRuntime.state.recoverySpent===1&&skillRuntime.state.recoveryCooldown===20&&!player.shieldTime,'save refill');
  respawnAtCheckpoint();assert(skillRuntime.state.recoverySpent===1&&skillRuntime.state.recoveryCooldown===20,'checkpoint refill');
});
test('abilities v2: three choices at every cap boundary and safe fallback completes selection',()=>{
  setup(0);assert(getAbilityChoices().length===3,'initial choices');
  unlockedSkills=ABILITIES.map(a=>({id:a.id,level:3,name:a.name,maxLevel:3,description:a.description(3)}));equipTestSkills();
  for(let missing=0;missing<=3;missing++){
    unlockedSkills.forEach((s,i)=>s.level=i<missing?2:3);const choices=getAbilityChoices();assert(choices.length===3,'choice count '+missing);assert(new Set(choices.map(c=>c.ability.id)).size===3,'duplicate choice');
  }
  unlockedSkills.forEach(s=>s.level=3);player.health=50;xp=xpRequired;openLevelChoice();
  assert(levelChoiceOpen&&ui.levelOverlay.querySelectorAll('button').length===3,'capped modal');
  const b=ui.levelOverlay.querySelector('button');b.click();assert(running&&!levelChoiceOpen&&player.health===50,'trapped or unsafe fallback');
  assert(Object.values(serviceRewards).reduce((a,b)=>a+b,0)===1,'reward missing');b.click();assert(Object.values(serviceRewards).reduce((a,b)=>a+b,0)===1,'double reward');
  saveCampaign();restoreCampaign(createCampaignSnapshot());assert(Object.values(serviceRewards).reduce((a,b)=>a+b,0)===1,'reward save');
});
test('abilities v2: selection accepts only an offered skill and rank',()=>{
  setup(0);xp=xpRequired;openLevelChoice();
  const buttons=[...ui.levelOverlay.querySelectorAll('[data-skill]')];
  const absent=ABILITIES.find(a=>!buttons.some(b=>b.dataset.skill===a.id));
  selectAbility(absent.id,1);assert(levelChoiceOpen&&!skillRank(absent.id),'unoffered skill accepted');
  selectAbility(buttons[0].dataset.skill,2);assert(levelChoiceOpen&&!unlockedSkills.length,'unoffered rank accepted');
  buttons[0].click();assert(!levelChoiceOpen&&unlockedSkills.length===1,'offered skill rejected');
});
test('abilities v2: repair remains puzzle utility and touch abilities have visible readiness',()=>{
  setup(0);equip('repair');const c=components[0];player.x=c.x;player.y=c.y;keys.add('e');updateRepair(0);keys.clear();
  assert(repairSession.hints===4&&repairSession.maxMistakes===4,'repair benefits');cancelRepair();
  for(const id of ['shield','boost','recovery'])equip(id);updateHud();document.querySelector('.game-shell').classList.add('playing');
  const button=touchControls.querySelector('[data-touch="q"]');assert(!button.hidden,'missing manual control');
  button.dispatchEvent(new PointerEvent('pointerdown',{pointerId:77,bubbles:true}));button.dispatchEvent(new PointerEvent('pointerup',{pointerId:77,bubbles:true}));updateCombat(.01);updateHud();assert(player.shieldTime>0&&document.getElementById('abilityReady').textContent.includes('16,0 s'),'readiness');
  if(innerWidth<=600){const wrap=canvas.parentElement.getBoundingClientRect();for(const b of touchControls.querySelectorAll('button:not([hidden])')){const r=b.getBoundingClientRect();assert(r.width>=42&&r.left>=wrap.left&&r.right<=wrap.right+1,'mobile control bounds');}}
});
