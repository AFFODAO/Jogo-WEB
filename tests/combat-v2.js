test('combat v2: cadence independent of refresh rate and no direct spam',()=>{
  const counts=[30,60,120,144].map(fps=>{const c=ByteRunner.playerCombat.create();let n=0;for(let i=0;i<fps*10;i++)n+=c.step(1/fps,{basic:true},{interval:.32,cooldown:6}).filter(x=>x==='basic').length;return n;});
  assert(Math.max(...counts)-Math.min(...counts)<=1,'cadence '+counts);
  const c=ByteRunner.playerCombat.create();assert(c.basic(.32),'initial');for(let i=0;i<1000;i++)assert(!c.basic(.32),'spam');
});
test('combat v2: tap buffer, preparation, held special and cooldown persistence',()=>{
  const c=ByteRunner.playerCombat.create(),config={interval:.32,cooldown:6};c.request('j');
  assert(c.step(1/120,{},config).includes('basic'),'tap lost');c.request('k');
  assert(c.step(1/120,{},config).includes('charge')&&c.charging,'no telegraph');
  assert(!c.step(.2,{},config).includes('special'),'early discharge');assert(c.step(.08,{},config).includes('special'),'late discharge');
  let n=0;for(let i=0;i<1200;i++)n+=c.step(1/120,{special:true},config).filter(e=>e==='charge').length;
  assert(!n,'held special repeated');c.step(.01,{},config);c.request('k');c.step(.01,{},config);
  const saved=c.snapshot();c.clear();const d=ByteRunner.playerCombat.create();d.restore(saved);d.request('k');assert(!d.step(.01,{},config).includes('charge')&&d.remaining>5,'reload bypass');
});
test('combat v2: special energy is finite, persisted, and only refilled on a new phase',()=>{
  const c=ByteRunner.playerCombat.create(),config={interval:.32,cooldown:6,specialCost:25};
  for(let shot=0;shot<4;shot++){
    c.request('k');assert(c.step(.01,{},config).includes('charge'),'charge '+shot);
    assert(c.energy===75-shot*25,'early energy charge '+shot);
    assert(c.step(.28,{},config).includes('special'),'shot '+shot);
    c.step(6,{},config);
  }
  c.request('k');assert(!c.step(.01,{},config).includes('charge')&&c.energy===0,'unlimited special');
  const saved=c.snapshot(),loaded=ByteRunner.playerCombat.create();loaded.restore(saved);assert(loaded.energy===0,'energy save migration');
  loaded.restore({specialRemaining:0});assert(loaded.energy===100,'legacy save did not receive initial energy');
});
test('combat v2: shield spends shared energy and retry cannot refill it',()=>{
  setup(0);unlockedSkills=[{id:'shield',level:3,name:'Escudo de pulso',maxLevel:3}];equipTestSkills();damageCooldown=0;
  skillRequests.add('q');updateCombat(.01);assert(combatAttack.energy===50&&player.shieldTime>0,'first shield cost');
  player.shieldTime=0;skillRuntime.state.shieldCooldown=0;skillRequests.add('q');updateCombat(.01);
  assert(combatAttack.energy===0&&player.shieldTime>0,'second shield cost');
  player.shieldTime=0;skillRuntime.state.shieldCooldown=0;skillRequests.add('q');updateCombat(.01);
  assert(combatAttack.energy===0&&!player.shieldTime,'third shield exceeded budget');
  loadPhase(0,true);assert(combatAttack.energy===0,'retry refunded energy');
  loadPhase(1,true);assert(combatAttack.energy===100,'new phase did not refill energy');
});
test('combat v2: base robot defeats VIRUS ZERO with its finite special reserve',()=>{
  setup(9);components.forEach(c=>{c.repaired=true;c.corruption=0;c.integrity=100;});
  const boss=viruses.find(v=>v.multiStage);viruses=[boss];boss.hp=boss.maxHp;boss.bossStage=1;boss.bossPhaseTransitionTime=0;boss.bossCycleCooldown=1.2;
  enemyProjectiles=[];enemyObstacles=[];player.x=boss.x-150;player.y=boss.y-22;player.facing=1;keys.add('j');
  for(let t=0;t<2400&&boss.alive;t++){
    boss.speed=0;player.facing=boss.x>player.x+17?1:-1;
    if(!combatAttack.charging&&combatAttack.remaining<=0&&combatAttack.energy>=25)combatAttack.request('k');
    updateCombat(1/60);
  }
  assert(!boss.alive,'boss survived base attacks: hp='+boss.hp+', stage='+boss.bossStage+', energy='+combatAttack.energy+', shots='+projectiles.length+', x='+player.x+'/'+boss.x);
});
test('combat v2: swept geometry handles walls, circles, tangents and reverse direction',()=>{
  const {box,circle}=ByteRunner.playerCombat;
  assert(box(0,20,1000,0,{x:50,y:0,w:1,h:40},5)<.1,'thin wall tunneled');
  assert(circle(0,20,1000,0,{x:80,y:20},10)<.1,'enemy tunneled');
  assert(circle(100,20,-100,0,{x:50,y:20},10)===.4,'reverse');
  assert(circle(0,20,100,0,{x:50,y:50},10)===null,'false hit');
  assert(box(0,20,100,0,{x:40,y:40,w:1,h:40},5)===null,'false wall');
});
test('combat v2: real projectiles stop at first wall and pierce two distinct targets',()=>{
  setup(0);const oldSolids=solids;try{
    solids=()=>[{x:160,y:0,w:1,h:400,collision:'solid'}];
    viruses=[{...ENEMY_PROFILES.basic,type:'basic',x:200,y:100,alive:true,hp:20,maxHp:20,radius:15}];
    projectiles=[{x:100,y:100,vx:10000,life:1,radius:5,damage:1}];updatePlayerProjectiles(.1);
    assert(viruses[0].hp===20&&!projectiles.length,'wall did not block');
    solids=()=>[];viruses=[150,200,250].map(x=>({...ENEMY_PROFILES.basic,type:'basic',x,y:100,alive:true,hp:20,maxHp:20,radius:15}));
    projectiles=[{x:100,y:100,vx:10000,life:1,radius:8,damage:3,special:true,remainingHits:2,hits:new Set()}];updatePlayerProjectiles(.1);
    assert(viruses[0].hp<20&&viruses[1].hp<20&&viruses[2].hp===20&&!projectiles.length,'pierce count');
    projectiles=[{x:140,y:100,vx:10,life:1,radius:8,damage:3,special:true,remainingHits:2,hits:new Set()}];updatePlayerProjectiles(.01);const hp=viruses[0].hp;updatePlayerProjectiles(.01);assert(viruses[0].hp===hp,'repeat contact damage');
  }finally{solids=oldSolids;}
});
test('combat v2: native keyboard taps, multi-source ownership, movement, HUD and legacy saves',()=>{
  setup(0);endPhaseIntro();
  const press=(type,key,repeat=false)=>window.dispatchEvent(new KeyboardEvent(type,{key,repeat,cancelable:true}));
  press('keydown','j');press('keyup','j');const events=combatAttack.step(1/120,{}, {interval:.32,cooldown:6});assert(events.includes('basic'),'native tap');
  press('keydown','d');press('keydown','w');press('keydown','j');const x=player.x;movePlayer(1/120);assert(player.x>x&&player.vy<0,'attack locked platforming');
  attackInput('j',42,true);press('keyup','j');assert(keys.has('j'),'touch released by keyboard');attackInput('j',42,false);assert(!keys.has('j'),'touch stuck');
  clearCombatInput();press('keydown','k');updateCombat(1/120);updateHud();assert(document.getElementById('specialReady').textContent==='CARREGANDO','HUD');
  const remaining=combatAttack.remaining;loadPhase(1,true);assert(combatAttack.remaining===remaining&&!combatAttack.charging,'map reset');
  saveCampaign();const saved=createCampaignSnapshot();restoreCampaign(saved);assert(combatAttack.remaining>5,'save lost cooldown');
  delete saved.combatAttack;restoreCampaign(saved);assert(combatAttack.remaining===0,'legacy save');
});
test('combat v2: environment modifiers, muzzle obstruction and bounded upgrades',()=>{
  setup(0);const oldSolids=solids,oldModifiers=levelRuntime.modifiers;
  try{solids=()=>[];levelRuntime.modifiers=()=>({...oldModifiers(),projectileSpeedMultiplier:.5,fireIntervalMultiplier:2});
    assert(fireProjectile(),'basic rejected');assert(projectiles[0].vx===285,'speed modifier');assert(combatAttack.snapshot().basicRemaining>=.63,'cadence modifier');
    combatAttack=ByteRunner.playerCombat.create();projectiles=[];solids=()=>[{x:player.x+player.width,y:player.y,w:2,h:50,collision:'solid'}];assert(fireProjectile()&&!projectiles.length,'muzzle through wall');
    unlockedSkills=[{id:'cannon',level:5},{id:'rapid',level:5}];equipTestSkills();assert(player.damage===1&&player.fireRate>=.32*.85&&specialCooldown()===4.8,'unbounded upgrades');
  }finally{solids=oldSolids;levelRuntime.modifiers=oldModifiers;}
});
test('combat v2: physical attack buttons, pause cancellation and mobile bounds',()=>{
  setup(0);endPhaseIntro();document.querySelector('.game-shell').classList.add('playing');
  const j=document.querySelector('[data-touch="j"]'),k=document.querySelector('[data-touch="k"]');
  const pointer=(el,type,id)=>el.dispatchEvent(new PointerEvent(type,{pointerId:id,bubbles:true,cancelable:true}));
  pointer(j,'pointerdown',71);pointer(j,'pointerdown',72);pointer(j,'pointercancel',71);assert(keys.has('j'),'second finger lost');pointer(j,'lostpointercapture',72);assert(!keys.has('j'),'pointer stuck');
  pointer(k,'pointerdown',73);pointer(k,'pointerup',73);updateCombat(1/120);assert(combatAttack.charging,'touch special lost');
  pause();const spent=combatAttack.remaining;assert(!combatAttack.charging&&!keys.has('k')&&spent>5,'pause refund');
  window.dispatchEvent(new KeyboardEvent('keydown',{key:'k'}));running=true;paused=false;updateCombat(1/120);assert(!combatAttack.charging&&combatAttack.remaining<spent,'paused input replayed');
  if(innerWidth<=600){document.querySelector('.game-shell').classList.add('playing');const wrap=canvas.parentElement.getBoundingClientRect();
    const buttons=[...touchControls.querySelectorAll('button:not([hidden])')];for(const button of buttons){const r=button.getBoundingClientRect();assert(r.width>=42&&r.left>=wrap.left&&r.right<=wrap.right+1,'button bounds '+button.textContent);}
    const left=document.querySelector('.touch-movement').getBoundingClientRect(),right=document.querySelector('.touch-actions').getBoundingClientRect();assert(left.right<=right.left,'touch groups overlap');
    const hud=document.querySelector('.special-hud').getBoundingClientRect();assert(hud.right<=wrap.right&&hud.left>=wrap.left,'HUD clipped');
  }
});
test('combat v2: new ability keys remap, persist and reject occupied keys',()=>{
  const original={...combatBindings},press=(action,key)=>{document.querySelector('[data-bind="'+action+'"]').click();window.dispatchEvent(new KeyboardEvent('keydown',{key,bubbles:true,cancelable:true}));};
  try {
    press('shield','m');assert(combatBindings.shield==='m'&&physicalAbility('m')==='q','remapped key not active');
    assert(JSON.parse(localStorage.getItem(combatBindStorage)).shield==='m','remapped key not saved');
    press('boost','m');assert(combatBindings.boost===original.boost&&document.getElementById('keyBindFeedback').textContent.includes('indisponível'),'duplicate key accepted');
    press('shield',original.shield);assert(combatBindings.shield===original.shield,'default key could not be restored');
  } finally {bindingAction='';combatBindings={...original};try{localStorage.setItem(combatBindStorage,JSON.stringify(original));}catch{}showCombatBindings();}
});
test('combat v2: basic and special audio are distinct and drawing honors reduced effects',()=>{
  setup(0);const old=audioContext,enabled=soundEnabled,count=activeSounds,reduced=experience.settings.reducedEffects,notes=[];
  audioContext={state:'running',currentTime:0,destination:{},createOscillator:()=>({frequency:{setValueAtTime:f=>notes.push(f),exponentialRampToValueAtTime:()=>{}},connect(){},start(){},stop(){}}),createGain:()=>({gain:{setValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){}})};
  try{soundEnabled=true;activeSounds=0;['attack','charge','burst','burstHit'].forEach(playSound);assert(notes.length===4&&new Set(notes).size===4,'audio indistinct');
    experience.settings.reducedEffects=true;combatAttack.request('k');combatAttack.step(.01,{}, {interval:.32,cooldown:6});draw();
    projectiles=[{x:player.x+60,y:player.y+22,vx:-570,radius:8,special:true}];draw();assert(effects.length<=96,'effects unbounded');
  }finally{audioContext=old;soundEnabled=enabled;activeSounds=count;experience.settings.reducedEffects=reduced;}
});
